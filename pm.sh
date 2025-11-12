#!/bin/bash

# Project Manager - 통합 관리 스크립트
# 사용법: ./pm.sh [start|stop|restart|status|logs|docker]

set -e

PORT=8081
LOGS_DIR="logs"
WEBUI_PID_FILE="$LOGS_DIR/webui.pid"
WEBUI_LOG_FILE="$LOGS_DIR/webui.log"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 헬퍼 함수들
print_header() {
    echo ""
    echo "========================================"
    echo "  $1"
    echo "========================================"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Docker 확인
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker가 설치되어 있지 않습니다."
        echo "   https://www.docker.com/products/docker-desktop"
        exit 1
    fi
}

# Claude CLI 확인
check_claude() {
    if command -v claude &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# .env 파일 확인
check_env() {
    if [ ! -f .env ]; then
        print_error ".env 파일이 없습니다."
        echo "   .env.example을 복사하여 .env를 생성하고 PROJECTS_PATH를 설정해주세요."
        exit 1
    fi
}

# WebUI 프로세스 종료
stop_webui() {
    # PID 파일로 종료 시도
    if [ -f "$WEBUI_PID_FILE" ]; then
        WEBUI_PID=$(cat "$WEBUI_PID_FILE")
        if ps -p "$WEBUI_PID" > /dev/null 2>&1; then
            echo "🤖 Claude Code WebUI를 중지합니다... (PID: $WEBUI_PID)"
            kill "$WEBUI_PID" 2>/dev/null || true
            sleep 1

            # 강제 종료 확인
            if ps -p "$WEBUI_PID" > /dev/null 2>&1; then
                kill -9 "$WEBUI_PID" 2>/dev/null || true
            fi
        fi
        rm "$WEBUI_PID_FILE" 2>/dev/null || true
    fi

    # 포트로 종료 시도
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "포트 $PORT에서 실행 중인 프로세스를 종료합니다..."
        kill $(lsof -t -i:$PORT) 2>/dev/null || true
        sleep 1
    fi
}

# WebUI 시작
start_webui() {
    if ! check_claude; then
        print_warning "Claude CLI가 설치되어 있지 않습니다."
        echo "   Claude Code WebUI를 실행할 수 없습니다."
        echo "   설치: https://claude.ai/code"
        return 1
    fi

    echo "🤖 Claude Code WebUI를 시작합니다..."

    # 기존 프로세스 종료
    stop_webui

    # 로그 디렉토리 생성
    mkdir -p "$LOGS_DIR"

    # WebUI 백그라운드 실행 (외부 접속 허용)
    nohup npx claude-code-webui --port $PORT --host 0.0.0.0 > "$WEBUI_LOG_FILE" 2>&1 &
    WEBUI_PID=$!

    # PID 저장
    echo $WEBUI_PID > "$WEBUI_PID_FILE"

    # 시작 대기
    echo "   WebUI가 시작될 때까지 기다리는 중..."
    sleep 5

    # 실행 확인
    if ps -p $WEBUI_PID > /dev/null 2>&1; then
        print_success "Claude Code WebUI 시작 완료 (PID: $WEBUI_PID)"

        # 네트워크 바인딩 확인
        sleep 2
        if lsof -i :$PORT | grep -q LISTEN; then
            print_success "외부 접속 가능 (0.0.0.0:$PORT)"
        fi
        return 0
    else
        print_error "Claude Code WebUI 시작 실패"
        echo "   로그: tail -f $WEBUI_LOG_FILE"
        return 1
    fi
}

# 명령어 함수들
cmd_start() {
    print_header "Project Manager - 전체 시스템 시작"

    check_env
    check_docker

    print_success ".env 파일 확인됨"
    print_success "Docker 확인됨"

    echo ""
    echo "🚀 서비스를 시작합니다..."
    echo ""

    # Docker Compose로 Project Manager 실행
    echo "📦 Project Manager 컨테이너를 시작합니다..."
    unset PROJECTS_PATH
    docker compose up -d app

    if [ $? -eq 0 ]; then
        print_success "Project Manager 시작 완료"
    else
        print_error "Docker Compose 실행 실패"
        exit 1
    fi

    echo ""

    # Claude Code WebUI 실행
    start_webui

    print_header "✅ 시스템 시작 완료!"

    echo "📊 접속 주소:"
    echo "   • Project Manager: http://localhost:3000"
    if check_claude; then
        echo "   • Claude Code WebUI: http://localhost:$PORT"
        echo "   • 외부 접속: http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo 'YOUR_IP'):$PORT"
    fi
    echo ""
    echo "📝 관리 명령어:"
    echo "   • 상태 확인: ./pm.sh status"
    echo "   • 로그 보기: ./pm.sh logs"
    echo "   • 전체 중지: ./pm.sh stop"
    echo "   • 재시작:   ./pm.sh restart"
    echo ""
}

cmd_stop() {
    print_header "Project Manager - 전체 시스템 중지"

    # Docker Compose 중지
    echo "📦 Docker 컨테이너를 중지합니다..."
    docker compose down 2>/dev/null || print_warning "Docker 컨테이너가 실행 중이지 않습니다."

    # Claude Code WebUI 중지
    stop_webui
    print_success "Claude Code WebUI 중지 완료"

    echo ""
    print_success "모든 서비스가 중지되었습니다."
    echo ""
}

cmd_restart() {
    print_header "Project Manager - 전체 시스템 재시작"

    cmd_stop
    sleep 2
    cmd_start
}

cmd_status() {
    print_header "Project Manager - 시스템 상태"

    # Docker 상태
    echo "📦 Docker 컨테이너:"
    docker compose ps 2>/dev/null || print_warning "Docker 컨테이너가 실행 중이지 않습니다."
    echo ""

    # WebUI 상태
    echo "🤖 Claude Code WebUI:"
    if [ -f "$WEBUI_PID_FILE" ]; then
        WEBUI_PID=$(cat "$WEBUI_PID_FILE")
        if ps -p "$WEBUI_PID" > /dev/null 2>&1; then
            print_success "실행 중 (PID: $WEBUI_PID)"

            # 네트워크 바인딩 확인
            if lsof -i :$PORT | grep -q LISTEN; then
                BINDING=$(lsof -i :$PORT | grep LISTEN | awk '{print $9}')
                echo "   바인딩: $BINDING"
            fi
        else
            print_warning "중지됨 (PID 파일은 존재하지만 프로세스 없음)"
        fi
    else
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            PID=$(lsof -t -i:$PORT)
            print_warning "실행 중이지만 관리되지 않음 (PID: $PID)"
        else
            print_warning "중지됨"
        fi
    fi
    echo ""

    # 포트 확인
    echo "🌐 포트 상태:"
    echo "   Port 3000 (Project Manager):"
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_success "사용 중"
    else
        print_warning "사용 안 함"
    fi

    echo "   Port $PORT (Claude Code WebUI):"
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_success "사용 중"
    else
        print_warning "사용 안 함"
    fi
    echo ""
}

cmd_logs() {
    local SERVICE=$2

    print_header "Project Manager - 로그"

    case "$SERVICE" in
        webui)
            if [ -f "$WEBUI_LOG_FILE" ]; then
                echo "📋 Claude Code WebUI 로그 (Ctrl+C로 종료):"
                echo ""
                tail -f "$WEBUI_LOG_FILE"
            else
                print_error "로그 파일을 찾을 수 없습니다: $WEBUI_LOG_FILE"
            fi
            ;;
        docker|app)
            echo "📋 Docker 로그 (Ctrl+C로 종료):"
            echo ""
            docker compose logs -f app
            ;;
        *)
            echo "모든 로그를 표시합니다."
            echo ""
            echo "1. Docker 로그 (최근 20줄):"
            docker compose logs --tail=20 app 2>/dev/null || print_warning "Docker 로그 없음"
            echo ""
            echo "2. Claude Code WebUI 로그 (최근 20줄):"
            if [ -f "$WEBUI_LOG_FILE" ]; then
                tail -20 "$WEBUI_LOG_FILE"
            else
                print_warning "WebUI 로그 없음"
            fi
            echo ""
            echo "실시간 로그 보기:"
            echo "   • WebUI: ./pm.sh logs webui"
            echo "   • Docker: ./pm.sh logs docker"
            ;;
    esac
}

cmd_docker() {
    print_header "Project Manager - Docker 모드"

    check_docker

    echo "Docker Compose 실행 모드:"
    echo "  1) 빌드 & 실행 (첫 실행)"
    echo "  2) 실행만 (이미 빌드됨)"
    echo "  3) 재빌드 & 실행 (변경사항 있음)"
    echo "  4) 중지"
    echo ""
    read -p "선택 (1-4): " -n 1 -r
    echo ""
    echo ""

    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        print_error "Docker Compose를 찾을 수 없습니다."
        exit 1
    fi

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
            print_success "중지 완료"
            exit 0
            ;;
        *)
            print_error "잘못된 선택입니다."
            exit 1
            ;;
    esac

    echo ""
    print_success "Docker 실행 완료!"
    echo ""
    echo "접속: http://localhost:3000"
    echo ""
}

cmd_help() {
    cat << EOF

Project Manager - 통합 관리 스크립트

사용법:
  ./pm.sh [명령어]

명령어:
  start      전체 시스템 시작 (Docker + Claude Code WebUI)
  stop       전체 시스템 중지
  restart    전체 시스템 재시작
  status     시스템 상태 확인
  logs       로그 보기 (logs [webui|docker] 로 특정 서비스 지정 가능)
  docker     Docker 전용 모드 (대화형)
  help       도움말 표시

예제:
  ./pm.sh start          # 전체 시스템 시작
  ./pm.sh status         # 상태 확인
  ./pm.sh logs webui     # WebUI 로그만 보기
  ./pm.sh stop           # 전체 중지

EOF
}

# 메인 로직
COMMAND=${1:-help}

case "$COMMAND" in
    start)
        cmd_start
        ;;
    stop)
        cmd_stop
        ;;
    restart)
        cmd_restart
        ;;
    status)
        cmd_status
        ;;
    logs)
        cmd_logs "$@"
        ;;
    docker)
        cmd_docker
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        print_error "알 수 없는 명령어: $COMMAND"
        echo ""
        cmd_help
        exit 1
        ;;
esac
