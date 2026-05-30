from sqlmodel import Session, select

from models.user_model import User


def create(session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_all(session: Session, offset: int = 0, limit: int = 100) -> list[User]:
    statement = select(User).offset(offset).limit(limit)
    return session.exec(statement).all()


def get_by_id(session: Session, user_id: int) -> User | None:
    return session.get(User, user_id)


def get_by_username(session: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    return session.exec(statement).first()


def get_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def update(session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def delete(session: Session, user: User) -> None:
    session.delete(user)
    session.commit()

def update_password(
    session: Session,
    user: User,
    hashed_password: str,
) -> User:
    user.hashed_password = hashed_password
    session.add(user)
    session.commit()
    session.refresh(user)
    return user