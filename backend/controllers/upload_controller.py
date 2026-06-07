from fastapi import APIRouter, Depends, File, UploadFile, status

from app.database import SessionDep
from core.dependencies import get_current_user
from models.user_model import User
from schemas.upload_schema import UploadImageRead
from services import upload_service


router = APIRouter()

@router.post(
    "/item-image",
    response_model=UploadImageRead,
    status_code=status.HTTP_201_CREATED,
)
def upload_item_image(
    image: UploadFile = File(...),
    session: SessionDep = None,
    current_user: User = Depends(get_current_user),
):
    image_url = upload_service.save_item_image(image)

    return UploadImageRead(image_url=image_url)

@router.post(
    "/profile-image",
    response_model=UploadImageRead,
    status_code=status.HTTP_201_CREATED,
)
def upload_profile_image(
    image: UploadFile = File(...),
    session: SessionDep = None,
    current_user: User = Depends(get_current_user),
):
    image_url = upload_service.save_profile_image(image)

    return UploadImageRead(image_url=image_url)