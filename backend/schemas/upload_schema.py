from pydantic import BaseModel

class UploadImageRead(BaseModel):
    image_url: str