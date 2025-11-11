#!/bin/bash

# Project Manager - 통합 중지 스크립트
echo "========================================"
echo "  Project Manager - 전체 시스템 중지"
echo "========================================"
echo ""

# Docker Compose 중지
echo "📦 Docker 컨테이너를 중지합니다..."
docker compose down

# Claude Code WebUI 중지
if [ -f logs/webui.pid ]; then
    WEBUI_PID=$(cat logs/webui.pid)
    if ps -p $WEBUI_PID > /dev/null 2>&1; then
        echo "🤖 Claude Code WebUI를 중지합니다... (PID: $WEBUI_PID)"
        kill $WEBUI_PID 2>/dev/null
        rm logs/webui.pid
        echo "✅ Claude Code WebUI 중지 완료"
    else
        echo "⚠️  Claude Code WebUI 프로세스를 찾을 수 없습니다."
        rm logs/webui.pid
    fi
fi

# 포트 8081 강제 종료 (혹시 모를 경우를 대비)
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  포트 8081에서 실행 중인 프로세스를 종료합니다..."
    kill $(lsof -t -i:8081) 2>/dev/null
fi

echo ""
echo "✅ 모든 서비스가 중지되었습니다."
echo ""
