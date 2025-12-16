#!/bin/bash

# AI Companion Chat 프로젝트 종료 스크립트
# macOS/Linux용

echo "🛑 AI Companion Chat 프로젝트 종료 중..."

# Backend 프로세스 종료
BACKEND_PID=$(lsof -ti:8000)
if [ ! -z "$BACKEND_PID" ]; then
    echo "Backend 프로세스 종료 중... (PID: $BACKEND_PID)"
    kill $BACKEND_PID
    sleep 1
    # 강제 종료
    kill -9 $BACKEND_PID 2>/dev/null
fi

# Frontend 프로세스 종료
FRONTEND_PID=$(lsof -ti:3000)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "Frontend 프로세스 종료 중... (PID: $FRONTEND_PID)"
    kill $FRONTEND_PID
    sleep 1
    # 강제 종료
    kill -9 $FRONTEND_PID 2>/dev/null
fi

echo "✅ 모든 프로세스가 종료되었습니다."

