import logging
from datetime import datetime
from sqlmodel import Session, select
from models.item_model import Item, ItemImage
from services.embedding_service import embedding_service
from repositories import item_repository

logger = logging.getLogger("GenerateImageEmbeddingJob")

def generate_item_embeddings_job(session: Session, item_id: int) -> bool:
    """
    Background job to generate embeddings for all pending images of an item.
    After completing, it returns True if any image was successfully processed.
    """
    logger.info(f"[EMBEDDING JOB] Starting for item_id={item_id}")
    
    item = item_repository.get_item_by_id(session, item_id)
    if not item:
        logger.error(f"[EMBEDDING JOB] Item {item_id} not found.")
        return False

    # Sync primary image_url to item_images if not already there
    if item.image_url:
        existing_image = session.exec(
            select(ItemImage).where(
                ItemImage.item_id == item_id,
                ItemImage.image_url == item.image_url
            )
        ).first()
        if not existing_image:
            logger.info(f"[EMBEDDING JOB] Syncing primary image_url '{item.image_url}' into item_images table.")
            new_img = ItemImage(
                item_id=item_id,
                image_url=item.image_url,
                embedding_status="pending"
            )
            session.add(new_img)
            session.commit()
            session.refresh(item)

    # Fetch all pending images for this item
    statement = select(ItemImage).where(
        ItemImage.item_id == item_id,
        ItemImage.embedding_status == "pending"
    )
    pending_images = session.exec(statement).all()

    if not pending_images:
        logger.info(f"[EMBEDDING JOB] No pending images for item {item_id}")
        return False

    any_success = False
    for img in pending_images:
        logger.info(f"[EMBEDDING JOB] Processing image {img.id}: {img.image_url}")
        
        # Convert web/media URL to local file path
        # In this project, media files are stored locally under 'media/items/'
        # Example URL: /media/items/filename.jpg -> Local path: media/items/filename.jpg
        local_path = img.image_url.lstrip("/")
        
        # Ensure path points to a file relative to root directory
        try:
            # Generate the embedding
            embedding = embedding_service.generate_embedding(local_path)
            
            if embedding is not None:
                img.embedding_vector = embedding
                img.embedding_status = "ready"
                img.embedding_model = "clip-vit-base-patch32"
                any_success = True
                logger.info(f"[EMBEDDING JOB] Image {img.id} successfully embedded.")
            else:
                img.embedding_status = "failed"
                logger.warning(f"[EMBEDDING JOB] Failed to generate embedding for image {img.id}.")
        except Exception as e:
            img.embedding_status = "failed"
            logger.error(f"[EMBEDDING JOB] Exception during embedding generation for image {img.id}: {e}")

        img.updated_at = datetime.utcnow()
        session.add(img)

    session.commit()
    logger.info(f"[EMBEDDING JOB] Completed for item_id={item_id}. Success: {any_success}")
    return any_success


def generate_item_embeddings_job_wrapper(item_id: int):
    """
    Wrapper for FastAPI background tasks to run in a standalone DB session,
    then re-run the matching process if embeddings were updated.
    """
    from app.database import engine
    from services.item_match_service import run_item_matching
    
    with Session(engine) as session:
        embeddings_updated = generate_item_embeddings_job(session, item_id)
        if embeddings_updated:
            logger.info(f"[EMBEDDING JOB] Embeddings updated. Re-running matching flow for item {item_id}")
            item = item_repository.get_item_by_id(session, item_id)
            if item:
                run_item_matching(session, item)
