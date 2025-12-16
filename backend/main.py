import re
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select

from .db import init_db, get_session
from .models import Character, Conversation, Message, Settings
from .schemas import CharacterCreate, CharacterRead, ChatRequest, ChatResponse
from .llm import call_ollama
from .config import settings
from sqlmodel import Session


app = FastAPI(title="AI Companion Backend", version="0.1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/health/ollama")
async def health_ollama():
    """Ollama 서버 연결 및 모델 테스트"""
    try:
        test_response = await call_ollama("안녕", model=settings.model)
        if test_response and len(test_response) > 0:
            return {
                "status": "ok",
                "ollama_host": settings.ollama_host,
                "model": settings.model,
                "test_response": test_response[:100],  # 처음 100자만
            }
        else:
            return {
                "status": "error",
                "message": "Ollama 응답이 비어있습니다",
                "ollama_host": settings.ollama_host,
                "model": settings.model,
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "ollama_host": settings.ollama_host,
            "model": settings.model,
        }


@app.get("/characters", response_model=list[CharacterRead])
async def list_characters(session: Session = Depends(get_session)):
    result = session.exec(select(Character)).all()
    return result


@app.post("/characters", response_model=CharacterRead)
async def create_character(payload: CharacterCreate, session: Session = Depends(get_session)):
    character = Character(**payload.model_dump())
    session.add(character)
    session.commit()
    session.refresh(character)
    return character


@app.get("/characters/{character_id}", response_model=CharacterRead)
async def get_character(character_id: int, session: Session = Depends(get_session)):
    character = session.get(Character, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


def parse_tags(text: str):
    emotion_match = re.search(r"<emotion=([^>]+)>", text)
    action_match = re.search(r"<action=([^>]+)>", text)
    clean = re.sub(r"<emotion=[^>]+>|<action=[^>]+>", "", text).strip()
    return clean, emotion_match.group(1) if emotion_match else None, action_match.group(1) if action_match else None


def build_prompt(character: Character, user_message: str, safe_mode: bool, history: list[Message] = None) -> str:
    safety = (
        "세이프 모드 ON: 노골적 표현은 피하고, 금지 주제를 피하며 부드럽게 답변해."
        if safe_mode
        else "세이프 모드 OFF: 더 직접적이고 친밀하게 답해. 다만 사용자 금지 주제는 존중해."
    )
    persona = f"너는 {character.name}이야. 성별:{character.gender or '미정'}, 나이:{character.age or '미정'}세. 말투:{character.tone or '친근'}."
    if character.bio:
        persona += f" {character.bio}"
    if character.description:
        persona += f" {character.description}"
    
    boundaries = f"경계선: {', '.join(character.boundaries)}." if character.boundaries else "경계선: 기본 안전 수칙을 지켜."
    
    history_text = ""
    if history and len(history) > 0:
        recent = history[-6:]  # 최근 6개 메시지만
        history_text = "\n최근 대화:\n"
        for msg in recent:
            role = "사용자" if msg.role == "user" else character.name
            history_text += f"{role}: {msg.content}\n"
    
    tags = "\n중요: 응답 끝에 반드시 감정 태그를 붙여야 해. 형식: <emotion=happy|sad|angry|shy|sleepy|flirty|neutral>. 행동이 있으면 <action=행동명> 태그도 붙여."
    
    return f"""{persona}

{boundaries}

{safety}

{history_text}

사용자: {user_message}

{character.name}로서 친근하고 자연스럽게 2-4문장으로 답해. {tags}"""


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, session: Session = Depends(get_session)):
    character = session.get(Character, payload.character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    if payload.conversation_id:
        conversation = session.get(Conversation, payload.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        # 기존 메시지 로드
        history = session.exec(
            select(Message).where(Message.conversation_id == conversation.id).order_by(Message.id)
        ).all()
    else:
        conversation = Conversation(character_id=character.id, last_safe_mode=payload.safe_mode)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        history = []

    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
        is_action=payload.message.strip().startswith("*") and payload.message.strip().endswith("*"),
    )
    session.add(user_msg)
    session.commit()

    prompt = build_prompt(character, payload.message, payload.safe_mode, history)
    raw_reply = await call_ollama(prompt)
    clean_reply, emotion, action = parse_tags(raw_reply)

    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=clean_reply,
        is_action=bool(action),
        emotion=emotion,
    )
    session.add(assistant_msg)

    conversation.last_safe_mode = payload.safe_mode
    session.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        reply=clean_reply,
        emotion=emotion,
        action=action,
    )


@app.get("/conversations")
async def list_conversations(session: Session = Depends(get_session)):
    result = session.exec(select(Conversation)).all()
    return result


@app.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: int, session: Session = Depends(get_session)):
    result = session.exec(select(Message).where(Message.conversation_id == conversation_id)).all()
    return result


@app.get("/settings")
async def get_settings(session: Session = Depends(get_session)):
    settings_row = session.get(Settings, 1)
    if not settings_row:
        settings_row = Settings()
        session.add(settings_row)
        session.commit()
        session.refresh(settings_row)
    return settings_row


@app.put("/settings")
async def update_settings(new_settings: Settings, session: Session = Depends(get_session)):
    settings_row = session.get(Settings, 1)
    if not settings_row:
        settings_row = Settings()
        session.add(settings_row)
    for key, value in new_settings.model_dump().items():
        setattr(settings_row, key, value)
    session.add(settings_row)
    session.commit()
    session.refresh(settings_row)
    return settings_row

