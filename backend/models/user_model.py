from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.item_model import Item


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)

    items: list["Item"] = Relationship(back_populates="user")

    username: str = Field(index=True, unique=True)
    first_name: str
    last_name: str
    email: EmailStr = Field(index=True, unique=True)
    phone: str | None = None

    is_active: bool = True

    # -V7: hash lozinke — NIKAD ne čuvamo lozinku u plain tekstu
    hashed_password: str
    # -V7: flag za role-based zaštitu (admin rute)
    is_admin: bool = Field(default=False)