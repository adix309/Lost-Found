from sqlmodel import SQLModel, Field
from pydantic import EmailStr


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)

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