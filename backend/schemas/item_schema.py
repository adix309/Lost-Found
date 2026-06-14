from datetime import datetime
from typing import Optional
from pydantic import EmailStr, field_validator, BaseModel

from models.item_model import ItemType, ItemStatus


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

    hidden_unique_features: Optional[str] = None


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

    item_type: Optional[ItemType] = None
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

    hidden_unique_features: Optional[str] = None

    status: Optional[ItemStatus] = None

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

    brand: Optional[str] = None
    color: Optional[str] = None

    reward_amount: Optional[float] = None

    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

    status: ItemStatus

    created_at: datetime
    updated_at: datetime


class ItemOwnerRead(ItemRead):
    hidden_unique_features: Optional[str] = None