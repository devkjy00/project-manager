# Docker 컨테이너화

## 개요
프로젝트를 Docker로 컨테이너화하여 배포 및 실행을 간편하게 만들었습니다.

## Docker 아키텍처

### 서비스 구성
1. **app**: Backend + Frontend (통합 서비스)
2. **claude-code-webui**: Claude Code WebUI 서비스

## Dockerfile 구조

### Multi-stage Build 전략

**파일 위치**: `Dockerfile` (프로젝트 루트)

```dockerfile
# Stage 1: Frontend 빌드
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend 빌드
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: 프로덕션 런타임
FROM node:20-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=frontend-builder /app/frontend/dist ./backend/frontend/dist
WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "start"]
```

### 빌드 스테이지 설명

#### Stage 1: Frontend Builder
- **베이스 이미지**: node:20-alpine
- **작업**: Frontend 빌드
- **출력**: `/app/frontend/dist` (정적 파일)
- **최적화**:
  - `npm ci` 사용 (package-lock.json 기반 설치)
  - 의존성 캐싱

#### Stage 2: Backend Builder
- **베이스 이미지**: node:20-alpine
- **작업**: Backend 빌드 (TypeScript → JavaScript)
- **출력**: `/app/backend/dist`
- **최적화**:
  - TypeScript 컴파일
  - 프로덕션 의존성만 포함

#### Stage 3: Production Runtime
- **베이스 이미지**: node:20-alpine
- **작업**: 최종 프로덕션 이미지
- **크기**: 최소화 (alpine 기반)
- **포함 항목**:
  - Backend 빌드 결과
  - Frontend 정적 파일
  - Node.js 런타임 의존성만

## docker-compose.yml 구성

**파일 위치**: `docker-compose.yml` (프로젝트 루트)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - PROJECTS_ROOT=/projects
    volumes:
      - ${PROJECTS_PATH:-/Users/inswave/MyDir/projec}:/projects:ro
    networks:
      - project-manager

  claude-code-webui:
    image: node:20-alpine
    command: sh -c "npm install -g claude-code-webui && claude-code-webui --port 8081"
    ports:
      - "8081:8081"
    volumes:
      - ${HOME}/.claude.json:/root/.claude.json:ro
      - ${HOME}/.claude:/root/.claude:ro
      - ${HOME}/.nvm/versions/node/v20.16.0/bin/claude:/usr/local/bin/claude:ro
      - ${PROJECTS_PATH:-/Users/inswave/MyDir/projec}:/projects:rw
    networks:
      - project-manager

networks:
  project-manager:
    driver: bridge
```

### 서비스 상세 설명

#### app 서비스
- **빌드**: Dockerfile 사용
- **포트**: 3000 (호스트:컨테이너)
- **환경 변수**:
  - `PROJECTS_ROOT=/projects`: 컨테이너 내 프로젝트 경로
- **볼륨 마운트**:
  - 프로젝트 디렉토리 → `/projects` (읽기 전용)
  - 호스트의 프로젝트를 컨테이너에서 읽기 가능

#### claude-code-webui 서비스
- **이미지**: node:20-alpine (직접 빌드 없음)
- **명령어**: npm으로 설치 후 실행
- **포트**: 8081 (호스트:컨테이너)
- **볼륨 마운트**:
  - `~/.claude.json`: Claude 설정 (읽기 전용)
  - `~/.claude`: Claude 캐시 (읽기 전용)
  - Claude CLI 바이너리 (읽기 전용)
  - 프로젝트 디렉토리 → `/projects` (읽기/쓰기)

### 네트워크
- **이름**: project-manager
- **드라이버**: bridge
- **목적**: 서비스 간 통신

## 환경 변수 설정

### .env 파일

**파일 위치**: `.env` (프로젝트 루트)

```bash
# 프로젝트 루트 경로
PROJECTS_PATH=/Users/inswave/MyDir/projec

# 사용자 홈 디렉토리
HOME=/Users/inswave
```

### .env.example 파일

**파일 위치**: `.env.example` (프로젝트 루트)

```bash
# 프로젝트 루트 경로 (실제 경로로 변경 필요)
PROJECTS_PATH=/path/to/your/projects

# 사용자 홈 디렉토리 (실제 경로로 변경 필요)
HOME=/Users/yourusername
```

## 실행 방법

### 1. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 실제 경로로 수정
```

### 2. Docker Compose로 빌드 및 실행
```bash
# 빌드
docker-compose build

# 실행
docker-compose up

# 백그라운드 실행
docker-compose up -d
```

### 3. 헬퍼 스크립트 사용

**파일**: `run-docker.sh`

```bash
#!/bin/bash

# Docker Compose 빌드 및 실행
echo "Building Docker images..."
docker-compose build

echo "Starting services..."
docker-compose up -d

echo "Services started!"
echo "Frontend: http://localhost:3000"
echo "Claude Code WebUI: http://localhost:8081"

echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
```

**실행**:
```bash
chmod +x run-docker.sh
./run-docker.sh
```

## Docker 명령어 참고

### 서비스 관리
```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart app
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f app
docker-compose logs -f claude-code-webui
```

### 컨테이너 내부 접근
```bash
# app 컨테이너 쉘 접근
docker-compose exec app sh

# claude-code-webui 컨테이너 쉘 접근
docker-compose exec claude-code-webui sh
```

### 이미지 관리
```bash
# 이미지 재빌드 (캐시 무시)
docker-compose build --no-cache

# 사용하지 않는 이미지 삭제
docker image prune
```

## 볼륨 마운트 전략

### 읽기 전용 (ro) vs 읽기/쓰기 (rw)

| 서비스 | 경로 | 모드 | 이유 |
|--------|------|------|------|
| app | /projects | ro | 프로젝트 정보만 읽음 |
| claude-code-webui | /projects | rw | 코드 수정 필요 |
| claude-code-webui | ~/.claude.json | ro | 설정 보호 |
| claude-code-webui | ~/.claude | ro | 캐시만 읽음 |

## 보안 고려사항

### 1. 최소 권한 원칙
- app 서비스: 프로젝트 읽기만 허용
- claude-code-webui: 필요한 경우에만 쓰기 허용

### 2. 민감 정보 보호
- `.env` 파일은 `.gitignore`에 추가
- Claude API 키는 볼륨 마운트로만 전달

### 3. 네트워크 격리
- 별도 Docker 네트워크 사용
- 외부 접근 제한

## 프로덕션 배포 시 고려사항

### 1. 환경 분리
```yaml
# docker-compose.prod.yml
services:
  app:
    environment:
      - NODE_ENV=production
      - PROJECTS_ROOT=/projects
    restart: always
```

### 2. 헬스체크 추가
```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. 로그 관리
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 관련 파일

- `Dockerfile`: Multi-stage 빌드 설정
- `docker-compose.yml`: 서비스 오케스트레이션
- `.env`: 환경 변수 (git 무시)
- `.env.example`: 환경 변수 템플릿
- `run-docker.sh`: 실행 헬퍼 스크립트
- `.dockerignore`: Docker 빌드 제외 파일
- `README.docker.md`: Docker 사용 가이드
