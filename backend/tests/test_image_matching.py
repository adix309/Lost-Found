import os
import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta

from sqlmodel import SQLModel, Session, create_engine, select

from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

from models.user_model import User
from models.claim_model import Claim
from models.notification_model import Notification
from models.item_model import Item, ItemImage, ItemType, ItemStatus
from models.item_match_model import ItemMatch
from models.verification_question_model import VerificationQuestion
from services.match_reranking_service import match_reranking_service, IMAGE_MATCHING_CONFIG
from services.image_similarity_service import image_similarity_service
from services.generate_image_embedding_job import generate_item_embeddings_job


class TestScoreFusionAndReranking(unittest.TestCase):
    """
    Unit tests for score combination logic and gating rules.
    """

    def setUp(self):
        # Cache original config
        self.original_config = IMAGE_MATCHING_CONFIG.copy()
        IMAGE_MATCHING_CONFIG["enabled"] = True
        IMAGE_MATCHING_CONFIG["top_k_candidates"] = 10
        IMAGE_MATCHING_CONFIG["min_candidates_for_rerank"] = 2
        IMAGE_MATCHING_CONFIG["description_weight"] = 0.7
        IMAGE_MATCHING_CONFIG["image_weight"] = 0.3

    def tearDown(self):
        # Restore original config
        IMAGE_MATCHING_CONFIG.update(self.original_config)

    def test_combine_scores_with_image_score(self):
        # description weight = 0.7, image weight = 0.3
        # 0.7 * 0.8 + 0.3 * 0.9 = 0.56 + 0.27 = 0.83
        score = match_reranking_service.combine_scores(0.8, 0.9)
        self.assertAlmostEqual(score, 0.83)

    def test_combine_scores_with_no_image_score(self):
        # Fallback to description score when no image matching exists
        score = match_reranking_service.combine_scores(0.8, None)
        self.assertEqual(score, 0.8)

    def test_rerank_matches_fallback_when_disabled(self):
        IMAGE_MATCHING_CONFIG["enabled"] = False
        
        session_mock = MagicMock()
        source_item = Item(id=1, title="Lost Phone", description="Black iPhone", item_type=ItemType.lost, category="Phone", location_name="Sarajevo", event_date=datetime.utcnow(), user_id=1)
        candidate1 = Item(id=2, title="Found Phone", description="Black iPhone", item_type=ItemType.found, category="Phone", location_name="Sarajevo", event_date=datetime.utcnow(), user_id=2)
        
        candidates = [
            {
                "candidate": candidate1,
                "description_score": 0.8,
                "score_data": {"score": 0.8}
            }
        ]
        
        reranked = match_reranking_service.rerank_matches(session_mock, source_item, candidates)
        
        self.assertEqual(len(reranked), 1)
        self.assertFalse(reranked[0]["used_image_reranking"])
        self.assertEqual(reranked[0]["final_score"], 0.8)


class TestImageSimilarityCalculations(unittest.TestCase):
    """
    Unit tests for cosine similarity arithmetic.
    """

    def test_cosine_similarity_identical_vectors(self):
        vec_a = [1.0, 0.0, 0.0]
        vec_b = [1.0, 0.0, 0.0]
        sim = image_similarity_service.calculate_cosine_similarity(vec_a, vec_b)
        self.assertAlmostEqual(sim, 1.0)

    def test_cosine_similarity_orthogonal_vectors(self):
        vec_a = [1.0, 0.0, 0.0]
        vec_b = [0.0, 1.0, 0.0]
        sim = image_similarity_service.calculate_cosine_similarity(vec_a, vec_b)
        self.assertAlmostEqual(sim, 0.0)

    def test_cosine_similarity_opposite_vectors(self):
        # Since cosine similarity can be negative, but we clip it to [0.0, 1.0] for similarity score consistency:
        vec_a = [1.0, 0.0, 0.0]
        vec_b = [-1.0, 0.0, 0.0]
        sim = image_similarity_service.calculate_cosine_similarity(vec_a, vec_b)
        self.assertEqual(sim, 0.0)

    def test_cosine_similarity_mismatched_dimensions(self):
        vec_a = [1.0, 2.0]
        vec_b = [1.0, 2.0, 3.0]
        sim = image_similarity_service.calculate_cosine_similarity(vec_a, vec_b)
        self.assertEqual(sim, 0.0)


class TestImageMatchingIntegration(unittest.TestCase):
    """
    Integration tests using an in-memory SQLite database to test SQLModel database interactions,
    generating embeddings (mocked), similarity compares, and full reranking flows.
    """

    def setUp(self):
        # Create an in-memory SQLite engine
        self.engine = create_engine("sqlite:///:memory:")
        SQLModel.metadata.create_all(self.engine)
        self.session = Session(self.engine)

        self.original_config = IMAGE_MATCHING_CONFIG.copy()
        IMAGE_MATCHING_CONFIG["enabled"] = True
        IMAGE_MATCHING_CONFIG["min_candidates_for_rerank"] = 2
        IMAGE_MATCHING_CONFIG["description_weight"] = 0.7
        IMAGE_MATCHING_CONFIG["image_weight"] = 0.3

    def tearDown(self):
        self.session.close()
        SQLModel.metadata.drop_all(self.engine)
        IMAGE_MATCHING_CONFIG.update(self.original_config)

    def test_db_models_creation(self):
        # Verify columns exist in SQLite schema
        img = ItemImage(item_id=1, image_url="/media/items/test.jpg")
        self.session.add(img)
        self.session.commit()
        self.session.refresh(img)
        
        self.assertEqual(img.embedding_status, "pending")
        self.assertIsNone(img.embedding_vector)

    @patch("services.generate_image_embedding_job.embedding_service.generate_embedding")
    def test_generate_embeddings_job_logic(self, mock_generate):
        # Set up mock embedding
        dummy_vector = [0.1, 0.2, 0.3, 0.4]
        mock_generate.return_value = dummy_vector

        # Setup database test items
        item = Item(
            id=10, title="Lost keys", description="Car keys with a blue keychain",
            item_type=ItemType.lost, category="Keys", location_name="Mostar",
            event_date=datetime.utcnow(), user_id=1, image_url="/media/items/key1.jpg"
        )
        self.session.add(item)
        self.session.commit()

        # Run background job
        success = generate_item_embeddings_job(self.session, item.id)
        self.assertTrue(success)

        # Retrieve image record from DB to assert status and embedding vector
        stmt = select(ItemImage).where(ItemImage.item_id == item.id)
        images = self.session.exec(stmt).all()
        
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0].embedding_status, "ready")
        self.assertEqual(images[0].embedding_vector, dummy_vector)

    def test_compare_items_with_missing_embeddings(self):
        # Item 1 and Item 2 do not have ready embeddings
        sim = image_similarity_service.compare_items(self.session, 1, 2)
        self.assertEqual(sim, 0.0)

    def test_compare_items_calculation(self):
        # Insert items and image embeddings
        img1 = ItemImage(item_id=1, image_url="url1", embedding_status="ready", embedding_vector=[1.0, 0.0, 0.0])
        img2 = ItemImage(item_id=2, image_url="url2", embedding_status="ready", embedding_vector=[0.8, 0.6, 0.0])
        self.session.add_all([img1, img2])
        self.session.commit()

        # Cosine similarity between [1.0, 0.0, 0.0] and [0.8, 0.6, 0.0] is:
        # dot_product = 0.8
        # norms = 1.0 * 1.0 = 1.0
        # cosine similarity = 0.8
        sim = image_similarity_service.compare_items(self.session, 1, 2)
        self.assertAlmostEqual(sim, 0.8)

    def test_rerank_matches_flow(self):
        # 1. Setup Source Item (with image embedding)
        source = Item(id=1, title="S1", description="desc1", item_type=ItemType.lost, category="cat", location_name="loc", event_date=datetime.utcnow(), user_id=1)
        source_img = ItemImage(item_id=1, image_url="url1", embedding_status="ready", embedding_vector=[1.0, 0.0])
        
        # 2. Setup Candidates
        # Candidate 2: high text score (0.9), poor visual similarity ([0.0, 1.0] -> sim = 0.0)
        # combined score = 0.7 * 0.9 + 0.3 * 0.0 = 0.63
        cand_high_text = Item(id=2, title="S2", description="desc2", item_type=ItemType.found, category="cat", location_name="loc", event_date=datetime.utcnow(), user_id=2)
        cand_high_text_img = ItemImage(item_id=2, image_url="url2", embedding_status="ready", embedding_vector=[0.0, 1.0])
        
        # Candidate 3: moderate text score (0.8), high visual similarity ([1.0, 0.0] -> sim = 1.0)
        # combined score = 0.7 * 0.8 + 0.3 * 1.0 = 0.56 + 0.30 = 0.86
        cand_high_visual = Item(id=3, title="S3", description="desc3", item_type=ItemType.found, category="cat", location_name="loc", event_date=datetime.utcnow(), user_id=3)
        cand_high_visual_img = ItemImage(item_id=3, image_url="url3", embedding_status="ready", embedding_vector=[1.0, 0.0])

        self.session.add_all([source, source_img, cand_high_text, cand_high_text_img, cand_high_visual, cand_high_visual_img])
        self.session.commit()

        # Input candidates structure
        candidates = [
            {
                "candidate": cand_high_text,
                "description_score": 0.9,
                "score_data": {"score": 0.9}
            },
            {
                "candidate": cand_high_visual,
                "description_score": 0.8,
                "score_data": {"score": 0.8}
            }
        ]

        # Rerank
        reranked = match_reranking_service.rerank_matches(self.session, source, candidates)

        # Candidate 3 should be ranked 1st because of the high image score, despite lower text score!
        self.assertEqual(len(reranked), 2)
        self.assertEqual(reranked[0]["candidate"].id, 3)  # Candidate 3 is now first!
        self.assertAlmostEqual(reranked[0]["final_score"], 0.86)
        
        self.assertEqual(reranked[1]["candidate"].id, 2)  # Candidate 2 is now second!
        self.assertAlmostEqual(reranked[1]["final_score"], 0.63)


if __name__ == "__main__":
    unittest.main()
