import logging
from sqlmodel import Session, select
from models.item_model import ItemImage

logger = logging.getLogger("ImageSimilarityService")

class ImageSimilarityService:
    def calculate_cosine_similarity(self, vector_a: list[float], vector_b: list[float]) -> float:

        if not vector_a or not vector_b:
            return 0.0
        
        if len(vector_a) != len(vector_b):
            logger.warning(f"Vector dimensions mismatch: {len(vector_a)} vs {len(vector_b)}")
            return 0.0

        dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
        norm_a = sum(a * a for a in vector_a) ** 0.5
        norm_b = sum(b * b for b in vector_b) ** 0.5

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        similarity = dot_product / (norm_a * norm_b)
        return max(0.0, min(1.0, similarity))

    def compare_items(self, session: Session, source_item_id: int, candidate_item_id: int) -> float:

        source_statement = select(ItemImage).where(
            ItemImage.item_id == source_item_id,
            ItemImage.embedding_status == "ready",
            ItemImage.embedding_vector != None
        )
        source_images = session.exec(source_statement).all()

        candidate_statement = select(ItemImage).where(
            ItemImage.item_id == candidate_item_id,
            ItemImage.embedding_status == "ready",
            ItemImage.embedding_vector != None
        )
        candidate_images = session.exec(candidate_statement).all()

        if not source_images or not candidate_images:
            logger.info(f"Skipping image comparison between {source_item_id} and {candidate_item_id}: missing ready embeddings.")
            return 0.0

        max_similarity = 0.0
        for src_img in source_images:
            for cand_img in candidate_images:
                sim = self.calculate_cosine_similarity(src_img.embedding_vector, cand_img.embedding_vector)
                if sim > max_similarity:
                    max_similarity = sim

        logger.info(f"Visual similarity between item {source_item_id} and candidate {candidate_item_id} is: {max_similarity:.4f}")
        return max_similarity

image_similarity_service = ImageSimilarityService()
