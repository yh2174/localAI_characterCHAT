from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CharacterCreate(BaseModel):
    name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    description: Optional[str] = None
    hashtags: List[str] = Field(default_factory=list)
    tone: Optional[str] = None
    boundaries: List[str] = Field(default_factory=list)
    image_default: Optional[str] = None
    image_by_emotion: Dict[str, str] = Field(default_factory=dict)


class CharacterRead(CharacterCreate):
    id: int


class MessageCreate(BaseModel):
    role: str
    content: str
    is_action: bool = False
    emotion: Optional[str] = None


class ChatRequest(BaseModel):
    character_id: int
    conversation_id: Optional[int] = None
    user_profile: Dict[str, str] = Field(default_factory=dict)
    safe_mode: bool = True
    message: str


class ChatResponse(BaseModel):
    conversation_id: int
    reply: str
    emotion: Optional[str] = None
    action: Optional[str] = None

