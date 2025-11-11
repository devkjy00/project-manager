# Docker 실행 가이드

## 사전 준비

1. **Docker & Docker Compose 설치**
   - Docker Desktop 설치: https://www.docker.com/products/docker-desktop

2. **Claude CLI 설치 확인**
   ```bash
   claude --version
   ```
   - 없으면 https://claude.ai/code 에서 설치

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일에서 PROJECTS_PATH를 실제 프로젝트 경로로 수정
   ```

## 빠른 시작

### 1. Docker Compose로 실행 (권장)

```bash
# 빌드 & 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 2. 개별 서비스 관리

```bash
# 특정 서비스만 재시작
docker-compose restart app
docker-compose restart claude-code-webui

# 특정 서비스만 빌드
docker-compose build app
```

## 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **app** | 3000 | Project Manager (Backend + Frontend) |
| **claude-code-webui** | 8081 | Claude Code WebUI |

## 접속

- **Project Manager**: http://localhost:3000
- **Claude Code WebUI**: http://localhost:8081

## 환경 변수 커스터마이징

`.env` 파일 생성:

```bash
# 프로젝트 디렉토리 경로 (필수)
PROJECTS_PATH=/Users/your-username/projects

# 서버 포트 (선택)
PORT=3000

# Node 환경 (선택)
NODE_ENV=production
```

## 볼륨 마운트

### Project Manager (app)
- `PROJECTS_PATH:/projects:ro` - 프로젝트 디렉토리 (읽기 전용)

### Claude Code WebUI
- `~/.claude.json:/root/.claude.json:ro` - Claude 설정
- `~/.claude:/root/.claude:ro` - Claude 캐시
- `~/.nvm/.../claude:/usr/local/bin/claude:ro` - Claude CLI 바이너리
- `PROJECTS_PATH:/projects:rw` - 프로젝트 디렉토리 (읽기/쓰기)

## 트러블슈팅

### 1. Claude CLI를 찾을 수 없음
```bash
# Claude CLI 경로 확인
which claude

# docker-compose.yml에서 해당 경로로 수정
volumes:
  - /실제/경로/to/claude:/usr/local/bin/claude:ro
```

### 2. 프로젝트가 표시되지 않음
```bash
# .env 파일의 PROJECTS_PATH 확인
cat .env

# 프로젝트 디렉토리 권한 확인
ls -la $PROJECTS_PATH
```

### 3. 포트 충돌
```bash
# 다른 포트 사용
docker-compose down
# docker-compose.yml에서 포트 변경 (예: 3001:3000)
docker-compose up -d
```

### 4. 빌드 에러
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 기존 이미지 삭제 후 재시작
docker-compose down --rmi all
docker-compose up -d --build
```

## 프로덕션 배포

### 1. Docker Hub에 이미지 푸시
```bash
# 이미지 빌드
docker build -t your-username/project-manager:latest .

# Docker Hub 로그인
docker login

# 이미지 푸시
docker push your-username/project-manager:latest
```

### 2. 원격 서버에서 실행
```bash
# docker-compose.yml 수정
services:
  app:
    image: your-username/project-manager:latest
    # build 섹션 제거

# 실행
docker-compose up -d
```

## 개발 모드

Docker 없이 로컬 개발:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (새 터미널)
cd frontend
npm install
npm run dev

# Claude Code WebUI (새 터미널)
claude-code-webui --port 8081
```

## 유용한 명령어

```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 내부 접속
docker-compose exec app sh

# 로그 실시간 확인
docker-compose logs -f app

# 리소스 정리
docker-compose down -v  # 볼륨까지 삭제
docker system prune -a  # 사용하지 않는 이미지 전부 삭제
```

## 아키텍처

```
┌─────────────────────────────────────────────┐
│              Docker Network                 │
│  (project-manager-network)                  │
│                                             │
│  ┌───────────────┐      ┌─────────────┐   │
│  │ Project       │      │ Claude      │   │
│  │ Manager       │◄─────┤ Code        │   │
│  │ (app)         │      │ WebUI       │   │
│  │               │      │             │   │
│  │ Port: 3000    │      │ Port: 8081  │   │
│  └───────┬───────┘      └──────┬──────┘   │
│          │                     │           │
└──────────┼─────────────────────┼───────────┘
           │                     │
           ▼                     ▼
    ┌─────────────┐      ┌─────────────┐
    │  /projects  │      │  /projects  │
    │  (ro)       │      │  (rw)       │
    └─────────────┘      └─────────────┘
           │                     │
           └──────────┬──────────┘
                      ▼
              Host: PROJECTS_PATH
```
