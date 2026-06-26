import os
import logging
from typing import Optional

logger = logging.getLogger("EmbeddingService")

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = "cpu"
        self._initialized = False

    def initialize(self) -> bool:
        if self._initialized:
            return True

        try:
            import torch
            from transformers import CLIPProcessor, CLIPModel

            model_name = "openai/clip-vit-base-patch32"
            
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Initializing CLIP model {model_name} on device: {self.device}")
            
            self.model = CLIPModel.from_pretrained(model_name).to(self.device)
            self.processor = CLIPProcessor.from_pretrained(model_name)
            self._initialized = True
            logger.info("CLIP model initialized successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize CLIP model: {e}")
            self._initialized = False
            return False

    def generate_embedding(self, image_path: str) -> Optional[list[float]]:

        if not self._initialized:
            success = self.initialize()
            if not success:
                logger.warning("CLIP model is not initialized. Cannot generate embedding.")
                return None

        if not os.path.exists(image_path):
            logger.error(f"Image file does not exist: {image_path}")
            return None

        try:
            import torch
            from PIL import Image

            image = Image.open(image_path).convert("RGB")
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)

            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
                if hasattr(image_features, "pooler_output"):
                    image_features = image_features.pooler_output
                image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
                embedding = image_features[0].cpu().numpy().tolist()
                
            return embedding
        except Exception as e:
            logger.error(f"Error generating image embedding for {image_path}: {e}")
            return None

embedding_service = EmbeddingService()
