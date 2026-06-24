from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field, field_validator

from models.item_model import ItemType, ItemStatus

def clean_str(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    value = value.strip()
    return value or None

def resolve_hidden_features(value: Any) -> Optional[dict[str, Any]]:
    if value is None:
        return None
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return None
        try:
            import json
            parsed = json.loads(value)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass
        return {"notes": value}
    if isinstance(value, dict):
        return value
    return value

class ItemBase(BaseModel):
    title: str
    description: str

    item_type: ItemType
    category: str

    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    event_date: datetime

    image_url: Optional[str] = None

    brand: Optional[str] = None
    color: Optional[str] = None

    reward_amount: Optional[float] = None

    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

    hidden_unique_features: Optional[dict[str, Any]] = None

    @field_validator("hidden_unique_features", mode="before")
    @classmethod
    def validate_hidden_features(cls, value):
        return resolve_hidden_features(value)

    @field_validator("title", "description", "category", "location_name", mode="before")
    @classmethod
    def validate_required_text(cls, value):
        if value is None:
            raise ValueError("Field is required")
        value = str(value).strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("brand", "color", "image_url", "contact_phone", mode="before")
    @classmethod
    def validate_optional_text(cls, value):
        return clean_str(value)

    @field_validator("reward_amount")
    @classmethod
    def validate_reward_amount(cls, value):
        if value is not None and value < 0:
            raise ValueError("Reward amount cannot be negative")
        return value


class ItemCreate(ItemBase):
    @field_validator("reward_amount")
    @classmethod
    def validate_reward_amount(cls, value):
        if value is not None and value < 0:
            raise ValueError("Reward amount cannot be negative")
        return value

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, value):
        if value is not None and not (-90 <= value <= 90):
            raise ValueError("Latitude must be between -90 and 90")
        return value

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, value):
        if value is not None and not (-180 <= value <= 180):
            raise ValueError("Longitude must be between -180 and 180")
        return value


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

    category: Optional[str] = None

    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    event_date: Optional[datetime] = None

    image_url: Optional[str] = None

    brand: Optional[str] = None
    color: Optional[str] = None

    reward_amount: Optional[float] = None

    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

    hidden_unique_features: Optional[dict[str, Any]] = None
    status: Optional[ItemStatus] = None

    @field_validator("hidden_unique_features", mode="before")
    @classmethod
    def validate_hidden_features(cls, value):
        return resolve_hidden_features(value)

    @field_validator("title", "description", "category", "location_name", mode="before")
    @classmethod
    def validate_optional_required_text(cls, value):
        if value is None:
            return value
        value = str(value).strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("brand", "color", "image_url", "contact_phone", mode="before")
    @classmethod
    def validate_optional_text(cls, value):
        return clean_str(value)

    @field_validator("reward_amount")
    @classmethod
    def validate_reward_amount(cls, value):
        if value is not None and value < 0:
            raise ValueError("Reward amount cannot be negative")
        return value

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, value):
        if value is not None and not (-90 <= value <= 90):
            raise ValueError("Latitude must be between -90 and 90")
        return value

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, value):
        if value is not None and not (-180 <= value <= 180):
            raise ValueError("Longitude must be between -180 and 180")
        return value


class ItemUserRead(BaseModel):
    id: int
    username: str
    email: Optional[EmailStr] = None
    profile_image_url: Optional[str] = None


class ItemRead(BaseModel):
    id: int
    user_id: int

    user: Optional[ItemUserRead] = None

    title: str
    description: str

    item_type: ItemType
    category: str

    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    event_date: datetime

    image_url: Optional[str] = None
    image_urls: list[str] = Field(default_factory=list)

    brand: Optional[str] = None
    color: Optional[str] = None

    reward_amount: Optional[float] = None

    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

    status: ItemStatus

    created_at: datetime
    updated_at: datetime


class ItemOwnerRead(ItemRead):
    hidden_unique_features: Optional[dict[str, Any]] = None

    @field_validator("hidden_unique_features", mode="before")
    @classmethod
    def validate_hidden_features(cls, value):
        return resolve_hidden_features(value)


class ItemImagesUploadRead(BaseModel):
    item_id: int
    image_urls: list[str]
