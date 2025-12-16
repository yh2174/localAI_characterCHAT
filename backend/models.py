from datetime import datetime
from typing import Dict, List, Optional

from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, JSON


class Character(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    description: Optional[str] = None
    hashtags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    tone: Optional[str] = None
    boundaries: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    image_default: Optional[str] = None
    image_by_emotion: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))

    conversations: List["Conversation"] = Relationship(back_populates="character")


class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    character_id: int = Field(foreign_key="character.id")
    last_safe_mode: bool = Field(default=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    character: Optional[Character] = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str
    content: str
    is_action: bool = Field(default=False)
    emotion: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: Optional[Conversation] = Relationship(back_populates="messages")


class Settings(SQLModel, table=True):
    id: int = Field(default=1, primary_key=True)
    safe_mode_default: bool = Field(default=True)
    api_endpoint: Optional[str] = None
    model_preset: Optional[str] = None
    user_profile: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))

