from fastapi import UploadFile, HTTPException, status
from pathlib import Path
import shutil
import uuid


def validate_image(image: UploadFile) -> None:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image.",
        )


def save_image(image: UploadFile, upload_dir: Path) -> str:
    validate_image(image)
    upload_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(image.filename or "").suffix.lower() or ".jpg"
    filename = f"{uuid.uuid4()}{extension}"
    file_path = upload_dir / filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return f"/media/{upload_dir.name}/{filename}"


def save_item_image(image: UploadFile) -> str:
    return save_image(image, Path("media/items"))


def save_item_images(images: list[UploadFile]) -> list[str]:
    if not images:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one image is required.",
        )

    for image in images:
        validate_image(image)

    return [save_item_image(image) for image in images]

def save_profile_image(image: UploadFile) -> str:
    return save_image(image, Path("media/profiles"))
