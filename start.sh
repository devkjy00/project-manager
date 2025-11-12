#!/bin/bash

# Project Manager - 통합 실행 스크립트
echo "========================================"
echo "  Project Manager - 전체 시스템 시작"
echo "========================================"
echo ""

# .env 파일 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다."
    echo "   .env.example을 복사하여 .env를 생성하고 PROJECTS_PATH를 설정해주세요."
    exit 1
fi

echo "✅ .env 파일 확인됨"

# Docker 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker 확인됨"

# Claude CLI 확인
CLAUDE_INSTALLED=false
if command -v claude &> /dev/null; then
    echo "✅ Claude CLI 확인됨: $(which claude)"
    CLAUDE_INSTALLED=true
else
    echo "⚠️  Claude CLI가 설치되어 있지 않습니다."
    echo "   Claude Code WebUI는 실행되지 않습니다."
    echo "   설치: https://claude.ai/code"
fi

echo ""
echo "🚀 서비스를 시작합니다..."
echo ""

# Docker Compose로 Project Manager 실행
echo "📦 Project Manager 컨테이너를 시작합니다..."
# Unset PROJECTS_PATH to ensure .env file is used
unset PROJECTS_PATH
docker compose up -d app

if [ $? -ne 0 ]; then
    echo "❌ Docker Compose 실행 실패"
    exit 1
fi

echo "✅ Project Manager 시작 완료"
echo ""

# Claude Code WebUI 실행 (Claude CLI가 설치된 경우)
if [ "$CLAUDE_INSTALLED" = true ]; then
    echo "🤖 Claude Code WebUI를 백그라운드에서 시작합니다..."

    # 기존 프로세스 확인 및 종료
    if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  포트 8081이 이미 사용 중입니다. 기존 프로세스를 종료합니다..."
        kill $(lsof -t -i:8081) 2>/dev/null
        sleep 2
    fi

    # 로그 디렉토리 생성
    mkdir -p logs

    # WebUI를 백그라운드에서 실행
    nohup npx claude-code-webui --port 8081 --host 0.0.0.0 > logs/webui.log 2>&1 &
    WEBUI_PID=$!

    # PID 저장
    echo $WEBUI_PID > logs/webui.pid

    # 시작 대기
    echo "   WebUI가 시작될 때까지 기다리는 중..."
    sleep 8

    # 실행 확인
    if ps -p $WEBUI_PID > /dev/null 2>&1; then
        echo "✅ Claude Code WebUI 시작 완료 (PID: $WEBUI_PID)"
    else
        echo "❌ Claude Code WebUI 시작 실패"
        echo "   로그를 확인하세요: logs/webui.log"
    fi
fi

echo ""
echo "========================================"
echo "  ✅ 시스템 시작 완료!"
echo "========================================"
echo ""
echo "📊 접속 주소:"
echo "   • Project Manager: http://localhost:3000"
if [ "$CLAUDE_INSTALLED" = true ]; then
    echo "   • Claude Code WebUI: http://localhost:8081"
fi
echo ""
echo "📝 관리 명령어:"
echo "   • 전체 중지: ./stop.sh"
echo "   • 상태 확인: docker compose ps"
if [ "$CLAUDE_INSTALLED" = true ]; then
    echo "   • WebUI 로그: tail -f logs/webui.log"
fi
echo ""
