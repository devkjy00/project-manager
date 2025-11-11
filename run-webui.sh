#!/bin/bash

# Claude Code WebUI 로컬 실행 스크립트
echo "========================================"
echo "  Claude Code WebUI - 로컬 실행"
echo "========================================"
echo ""

# Claude CLI 설치 확인
if ! command -v claude &> /dev/null; then
    echo "❌ Claude CLI가 설치되어 있지 않습니다."
    echo "   설치 방법: https://claude.ai/code"
    exit 1
fi

echo "✅ Claude CLI 확인됨: $(which claude)"
echo ""

# Claude Code WebUI 실행
echo "🚀 Claude Code WebUI를 시작합니다..."
echo "   주소: http://localhost:8081"
echo ""
echo "   종료하려면 Ctrl+C를 누르세요"
echo ""

# WebUI 실행
npx claude-code-webui --port 8081 --host 0.0.0.0
