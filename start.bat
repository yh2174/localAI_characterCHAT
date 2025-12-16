@echo off
REM AI Companion Chat 프로젝트 실행 스크립트
REM Windows용

echo 🚀 AI Companion Chat 프로젝트 시작 중...
echo.

cd /d "%~dp0"

REM Python 가상환경 확인
if not exist ".venv" (
    echo ⚠️  가상환경이 없습니다. 생성 중...
    python -m venv .venv
    echo ✅ 가상환경 생성 완료
)

REM 가상환경 활성화
echo 📦 가상환경 활성화 중...
call .venv\Scripts\activate.bat

REM Python 의존성 확인
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo ⚠️  Python 의존성이 없습니다. 설치 중...
    pip install -r requirements.txt
    echo ✅ 의존성 설치 완료
)

REM Frontend 의존성 확인
if not exist "frontend\node_modules" (
    echo ⚠️  Frontend 의존성이 없습니다. 설치 중...
    cd frontend
    call npm install
    cd ..
    echo ✅ Frontend 의존성 설치 완료
)

REM Ollama 서버 확인
echo 🔍 Ollama 서버 확인 중...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Ollama 서버가 실행 중이 아닙니다.
    echo 다음 명령어로 Ollama를 시작하세요:
    echo ollama serve
    echo.
    pause
)

REM Backend 실행 (새 창)
echo 🔧 Backend 서버 시작 중...
start "AI Companion Backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn backend.main:app --reload --port 8000"

REM 잠시 대기
timeout /t 2 /nobreak >nul

REM Frontend 실행 (새 창)
echo 🎨 Frontend 서버 시작 중...
cd frontend
start "AI Companion Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ════════════════════════════════════════
echo ✅ 프로젝트가 실행되었습니다!
echo ════════════════════════════════════════
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo 각 창을 닫으면 서버가 종료됩니다.
echo.
pause

