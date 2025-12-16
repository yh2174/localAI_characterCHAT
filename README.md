# AI Companion Chat

이미지 기반 AI 캐릭터 채팅 서비스입니다. Ollama를 사용하여 로컬에서 실행되는 AI 애인 프로젝트입니다.

## 🎯 주요 기능

- **캐릭터 관리**: 다양한 AI 캐릭터 생성 및 관리
- **실시간 채팅**: Ollama 기반 AI와의 자연스러운 대화
- **감정 표현**: AI 응답에 따른 이미지 전환 (happy, sad, angry, shy, sleepy, flirty, neutral)
- **행동 표현**: `*행동*` 형식으로 행동 표현 지원
- **세이프 모드**: ON/OFF 설정으로 대화 톤 조절
- **다크모드**: 라이트/다크 테마 지원
- **대화 내역**: 모든 대화 내역 저장 및 관리

## 🛠 기술 스택

### Backend
- **FastAPI**: Python 웹 프레임워크
- **SQLModel**: SQLAlchemy 기반 ORM
- **SQLite**: 로컬 데이터베이스
- **Ollama**: 로컬 LLM 실행 (gemma3:12b)

### Frontend
- **Next.js 16**: React 프레임워크
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 스타일링
- **next-themes**: 다크모드 지원

## 📋 사전 요구사항

1. **Python 3.10+**
2. **Node.js 18+** 및 npm
3. **Ollama** 설치 및 실행
   - [Ollama 공식 사이트](https://ollama.ai/)에서 설치
   - `gemma3:12b` 모델 다운로드:
     ```bash
     ollama pull gemma3:12b
     ```

## 🚀 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd ai_chat
```

### 2. Backend 설정

```bash
# Python 가상환경 생성
python3 -m venv .venv

# 가상환경 활성화
# macOS/Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

# 의존성 설치
pip install fastapi uvicorn[standard] sqlmodel python-multipart pydantic-settings httpx
```

### 3. Frontend 설정

```bash
cd frontend
npm install
```

### 4. 환경 변수 설정 (선택사항)

프로젝트 루트에 `.env` 파일을 생성하여 설정을 변경할 수 있습니다:

```env
DATABASE_URL=sqlite:///./data/app.db
MODEL=gemma3:12b
OLLAMA_HOST=http://127.0.0.1:11434
```

### 5. Ollama 서버 실행

```bash
# Ollama 서버 시작 (별도 터미널)
ollama serve

# 또는 백그라운드에서 실행
ollama serve &
```

### 6. 애플리케이션 실행

#### Backend 실행

```bash
# 프로젝트 루트에서
source .venv/bin/activate  # 가상환경 활성화
uvicorn backend.main:app --reload --port 8000
```

Backend는 `http://127.0.0.1:8000`에서 실행됩니다.

#### Frontend 실행

```bash
# frontend 디렉토리에서
cd frontend
npm run dev
```

Frontend는 `http://localhost:3000`에서 실행됩니다.

## 📁 프로젝트 구조

```
ai_chat/
├── backend/              # FastAPI 백엔드
│   ├── __init__.py
│   ├── config.py        # 설정 관리
│   ├── db.py            # 데이터베이스 연결
│   ├── llm.py           # Ollama 호출 로직
│   ├── main.py          # FastAPI 앱 및 엔드포인트
│   ├── models.py        # SQLModel 모델
│   └── schemas.py       # Pydantic 스키마
├── frontend/            # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/        # Next.js App Router 페이지
│   │   │   ├── page.tsx              # 메인 (캐릭터 목록)
│   │   │   ├── chat/[id]/page.tsx   # 채팅 화면
│   │   │   ├── characters/new/      # 캐릭터 생성
│   │   │   ├── history/             # 대화 내역
│   │   │   └── settings/            # 설정
│   │   ├── components/  # React 컴포넌트
│   │   ├── lib/         # API 클라이언트
│   │   └── types.ts     # TypeScript 타입
│   └── package.json
├── data/                # SQLite 데이터베이스
│   └── app.db
└── README.md
```

## 🎮 사용 방법

### 1. 캐릭터 생성

1. 메인 페이지에서 "캐릭터 추가" 버튼 클릭
2. 캐릭터 정보 입력:
   - **이름** (필수)
   - 성별, 나이
   - 한줄 소개, 상세 설명
   - 말투 선택
   - 해시태그 (쉼표 구분)
   - 경계선/금지 주제 (쉼표 구분)
   - 이미지 경로 (기본 이미지 및 감정별 이미지)
3. "저장" 클릭

### 2. 대화 시작

1. 메인 페이지에서 원하는 캐릭터 선택
2. "대화 시작" 버튼 클릭
3. 메시지 입력 및 전송
4. AI 응답 확인

### 3. 행동 표현

메시지에서 `*행동*` 형식으로 행동을 표현할 수 있습니다:
- 예: `*손을 잡으며* 같이 산책할래?`
- 행동 표현은 이탤릭체로 표시됩니다.

### 4. 세이프 모드

- **ON**: 부드럽고 안전한 대화
- **OFF**: 더 직접적이고 친밀한 대화 (경고 표시)

### 5. 감정 태그

AI 응답에 감정 태그가 포함되면 자동으로 해당 감정의 이미지로 전환됩니다:
- `happy`, `sad`, `angry`, `shy`, `sleepy`, `flirty`, `neutral`

## 🔧 API 엔드포인트

### Backend API

- `GET /health` - 헬스체크
- `GET /health/ollama` - Ollama 연결 테스트
- `GET /characters` - 캐릭터 목록
- `POST /characters` - 캐릭터 생성
- `GET /characters/{id}` - 캐릭터 상세
- `POST /chat` - 메시지 전송
- `GET /conversations` - 대화 목록
- `GET /conversations/{id}/messages` - 대화 메시지
- `GET /settings` - 설정 조회
- `PUT /settings` - 설정 업데이트

API 문서는 `http://127.0.0.1:8000/docs`에서 확인할 수 있습니다.

## ⚙️ 설정

### Ollama 모델 변경

`.env` 파일에서 모델을 변경할 수 있습니다:

```env
MODEL=gemma3:12b
```

다른 모델을 사용하려면:
```bash
ollama pull <모델명>
```

그리고 `.env` 파일의 `MODEL` 값을 변경하세요.

### 데이터베이스 위치 변경

`.env` 파일에서 데이터베이스 경로를 변경할 수 있습니다:

```env
DATABASE_URL=sqlite:///./data/app.db
```

## 🐛 문제 해결

### Ollama 연결 오류

1. Ollama 서버가 실행 중인지 확인:
   ```bash
   ollama ps
   ```

2. Ollama 서버 시작:
   ```bash
   ollama serve
   ```

3. 모델이 다운로드되었는지 확인:
   ```bash
   ollama list
   ```

4. Backend 헬스체크:
   ```bash
   curl http://127.0.0.1:8000/health/ollama
   ```

### 캐릭터를 불러올 수 없음

- 데이터베이스가 초기화되지 않았을 수 있습니다
- Backend 서버를 재시작하면 자동으로 초기화됩니다

### 프론트엔드에서 Backend 연결 실패

- Backend가 `http://127.0.0.1:8000`에서 실행 중인지 확인
- CORS 설정 확인 (기본적으로 `localhost:3000` 허용)

## 📝 개발 참고사항

### 데이터베이스 초기화

Backend 서버 시작 시 자동으로 데이터베이스가 초기화됩니다.

### 로그 확인

Backend 로그에서 Ollama 호출 상태를 확인할 수 있습니다:
- 성공: 정상 응답
- 실패: 에러 메시지 출력

## 🔒 보안

- 이 프로젝트는 로컬 설치형 애플리케이션입니다
- 민감한 정보는 포함되어 있지 않습니다
- 데이터베이스는 SQLite로 로컬에 저장됩니다

## 📄 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

## 🤝 기여

이슈 및 개선 제안은 환영합니다!

## 📞 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.

discord : .jintongje
