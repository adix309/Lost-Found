from sqlmodel import SQLModel, Field
from pydantic import EmailStr


class UserCreate(SQLModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    password: str


class UserRead(SQLModel):
    id: int
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    phone: str | None = None
    is_active: bool


class UserLogin(SQLModel):
    username: str
    password: str


class Token(SQLModel):
    access_token: str
    token_type: str


class UserUpdate(SQLModel):
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    is_active: bool | None = None