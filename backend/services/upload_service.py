from fastapi import UploadFile, HTTPException, status
from pathlib import Path
import shutil
import uuid



def save_item_image(image: UploadFile) -> str:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image.",
        )
    UPLOAD_DIR = Path("media/items")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    extension = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = UPLOAD_DIR / filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return f"/media/items/{filename}"

def save_profile_image(image: UploadFile) -> str:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image.",
        )
    UPLOAD_DIR = Path("media/profiles")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    extension = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = UPLOAD_DIR / filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return f"/media/profiles/{filename}"