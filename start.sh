#!/bin/bash

# AI Companion Chat 프로젝트 실행 스크립트
# macOS/Linux용

echo "🚀 AI Companion Chat 프로젝트 시작 중..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리 확인
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Python 가상환경 확인
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  가상환경이 없습니다. 생성 중...${NC}"
    python3 -m venv .venv
    echo -e "${GREEN}✅ 가상환경 생성 완료${NC}"
fi

# 가상환경 활성화
echo -e "${GREEN}📦 가상환경 활성화 중...${NC}"
source .venv/bin/activate

# Python 의존성 확인
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Python 의존성이 없습니다. 설치 중...${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}✅ 의존성 설치 완료${NC}"
fi

# Frontend 의존성 확인
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend 의존성이 없습니다. 설치 중...${NC}"
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✅ Frontend 의존성 설치 완료${NC}"
fi

# Ollama 서버 확인
echo -e "${YELLOW}🔍 Ollama 서버 확인 중...${NC}"
if ! curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo -e "${RED}⚠️  Ollama 서버가 실행 중이 아닙니다.${NC}"
    echo -e "${YELLOW}다음 명령어로 Ollama를 시작하세요:${NC}"
    echo -e "${GREEN}ollama serve${NC}"
    echo ""
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Ollama 서버 실행 중${NC}"
fi

# Backend 실행 (백그라운드)
echo -e "${GREEN}🔧 Backend 서버 시작 중...${NC}"
uvicorn backend.main:app --reload --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# 잠시 대기
sleep 2

# Frontend 실행
echo -e "${GREEN}🎨 Frontend 서버 시작 중...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 프로젝트가 실행되었습니다!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "Backend:  ${GREEN}http://127.0.0.1:8000${NC}"
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "로그 파일:"
echo -e "  - Backend: ${YELLOW}backend.log${NC}"
echo ""
echo -e "프로세스 종료:"
echo -e "  ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo -e "  또는 ${YELLOW}./stop.sh${NC}"
echo ""

# 종료 신호 처리
trap "echo ''; echo '🛑 서버 종료 중...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 대기
wait

