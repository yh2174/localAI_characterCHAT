import os
from sqlmodel import create_engine, SQLModel, Session

from .config import settings


def get_engine():
    os.makedirs("data", exist_ok=True)
    return create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    )


engine = get_engine()


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

