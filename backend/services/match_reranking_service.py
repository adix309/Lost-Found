import logging
from sqlmodel import Session, select
from models.item_model import Item, ItemImage
from services.image_similarity_service import image_similarity_service

logger = logging.getLogger("MatchRerankingService")

IMAGE_MATCHING_CONFIG = {
    "enabled": True,
    "top_k_candidates": 10,
    "min_candidates_for_rerank": 1,
    "description_weight": 0.7,
    "image_weight": 0.3,
    "top_n_results": 3
}

class MatchRerankingService:
    def is_eligible_for_rerank(self, session: Session, source_item: Item, candidates: list[Item]) -> bool:

        if not IMAGE_MATCHING_CONFIG.get("enabled", True):
            logger.info("Image matching is disabled in config.")
            return False

        if len(candidates) < IMAGE_MATCHING_CONFIG.get("min_candidates_for_rerank", 2):
            logger.info(f"Not enough candidates for rerank (found {len(candidates)}, minimum is {IMAGE_MATCHING_CONFIG.get('min_candidates_for_rerank', 2)}).")
            return False

        source_has_embeddings = session.exec(
            select(ItemImage).where(
                ItemImage.item_id == source_item.id,
                ItemImage.embedding_status == "ready"
            )
        ).first() is not None

        if not source_has_embeddings:
            logger.info(f"Source item {source_item.id} has no ready image embeddings.")
            return False

        any_candidate_has_embeddings = False
        candidate_ids = [c.id for c in candidates]
        if candidate_ids:
            any_candidate_has_embeddings = session.exec(
                select(ItemImage).where(
                    ItemImage.item_id.in_(candidate_ids),
                    ItemImage.embedding_status == "ready"
                )
            ).first() is not None

        if not any_candidate_has_embeddings:
            logger.info("None of the candidates have ready image embeddings.")
            return False

        return True

    def combine_scores(self, description_score: float, image_score: float | None) -> float:

        if image_score is None:
            return description_score

        desc_weight = IMAGE_MATCHING_CONFIG.get("description_weight", 0.7)
        img_weight = IMAGE_MATCHING_CONFIG.get("image_weight", 0.3)
        return (desc_weight * description_score) + (img_weight * image_score)

    def rerank_matches(self, session: Session, source_item: Item, candidate_scores: list[dict]) -> list[dict]:

        top_k = IMAGE_MATCHING_CONFIG.get("top_k_candidates", 10)
        candidates_pool = candidate_scores[:top_k]
        remaining_pool = candidate_scores[top_k:]

        candidate_items = [item_dict["candidate"] for item_dict in candidates_pool]

        if not self.is_eligible_for_rerank(session, source_item, candidate_items):
            for item_dict in candidate_scores:
                score_data = item_dict["score_data"].copy()
                score_data["image_similarity_score"] = None
                score_data["final_score"] = item_dict["description_score"]
                score_data["used_image_reranking"] = False

                item_dict["image_similarity_score"] = None
                item_dict["final_score"] = item_dict["description_score"]
                item_dict["used_image_reranking"] = False
                item_dict["score_data"] = score_data
            return candidate_scores

        reranked = []
        for item_dict in candidates_pool:
            candidate = item_dict["candidate"]
            description_score = item_dict["description_score"]
            score_data = item_dict["score_data"]

            candidate_has_embeddings = session.exec(
                select(ItemImage).where(
                    ItemImage.item_id == candidate.id,
                    ItemImage.embedding_status == "ready"
                )
            ).first() is not None

            image_score = None
            if candidate_has_embeddings:
                try:
                    image_score = image_similarity_service.compare_items(session, source_item.id, candidate.id)
                except Exception as e:
                    logger.error(f"Error calculating image similarity between {source_item.id} and {candidate.id}: {e}")
                    image_score = None

            final_score = self.combine_scores(description_score, image_score)
            
            score_data_updated = score_data.copy()
            score_data_updated["score"] = final_score
            score_data_updated["description_score"] = description_score
            score_data_updated["image_similarity_score"] = image_score
            score_data_updated["final_score"] = final_score
            score_data_updated["used_image_reranking"] = image_score is not None

            reranked.append({
                "candidate": candidate,
                "description_score": description_score,
                "image_similarity_score": image_score,
                "final_score": final_score,
                "used_image_reranking": image_score is not None,
                "score_data": score_data_updated
            })

        for item_dict in remaining_pool:
            candidate = item_dict["candidate"]
            description_score = item_dict["description_score"]
            score_data = item_dict["score_data"]

            score_data_updated = score_data.copy()
            score_data_updated["image_similarity_score"] = None
            score_data_updated["final_score"] = description_score
            score_data_updated["used_image_reranking"] = False

            reranked.append({
                "candidate": candidate,
                "description_score": description_score,
                "image_similarity_score": None,
                "final_score": description_score,
                "used_image_reranking": False,
                "score_data": score_data_updated
            })

        reranked.sort(key=lambda x: (x["final_score"], x["description_score"], -x["candidate"].id), reverse=True)
        return reranked

match_reranking_service = MatchRerankingService()
