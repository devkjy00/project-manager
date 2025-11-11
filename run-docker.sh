#!/bin/bash

# Docker 실행 스크립트

set -e

echo "========================================"
echo "  Project Manager - Docker 실행"
echo "========================================"
echo ""

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo ""
    echo "Docker Desktop 설치:"
    echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "  Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

echo "✅ Docker 설치 확인됨"

# .env 파일 확인
if [ ! -f .env ]; then
    echo ""
    echo "📝 .env 파일을 생성합니다..."
    cp .env.example .env
    echo "⚠️  .env 파일에서 PROJECTS_PATH를 수정해주세요!"
    echo "   현재 값: $(grep PROJECTS_PATH .env)"
    echo ""
    read -p "계속하시겠습니까? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo "✅ .env 파일 확인됨"
echo ""

# Docker Compose 버전 확인
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose를 찾을 수 없습니다."
    exit 1
fi

echo "✅ Docker Compose: $DOCKER_COMPOSE"
echo ""

# 실행 모드 선택
echo "실행 모드를 선택하세요:"
echo "  1) 빌드 & 실행 (첫 실행)"
echo "  2) 실행만 (이미 빌드됨)"
echo "  3) 재빌드 & 실행 (변경사항 있음)"
echo "  4) 중지"
echo "  5) 로그 보기"
echo ""
read -p "선택 (1-5): " -n 1 -r
echo ""
echo ""

case $REPLY in
    1)
        echo "🔨 빌드 & 실행 중..."
        $DOCKER_COMPOSE up -d --build
        ;;
    2)
        echo "🚀 실행 중..."
        $DOCKER_COMPOSE up -d
        ;;
    3)
        echo "🔄 재빌드 & 실행 중..."
        $DOCKER_COMPOSE down
        $DOCKER_COMPOSE build --no-cache
        $DOCKER_COMPOSE up -d
        ;;
    4)
        echo "🛑 중지 중..."
        $DOCKER_COMPOSE down
        echo "✅ 중지 완료"
        exit 0
        ;;
    5)
        echo "📋 로그 표시 중... (Ctrl+C로 종료)"
        $DOCKER_COMPOSE logs -f
        exit 0
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac

echo ""
echo "✅ 실행 완료!"
echo ""
echo "========================================"
echo "  접속 정보"
echo "========================================"
echo "  Project Manager: http://localhost:3000"
echo "  Claude Code:     http://localhost:8081"
echo ""
echo "🔍 상태 확인: $DOCKER_COMPOSE ps"
echo "📋 로그 보기: $DOCKER_COMPOSE logs -f"
echo "🛑 중지하기:  $DOCKER_COMPOSE down"
echo ""
