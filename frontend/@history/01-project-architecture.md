# 프로젝트 아키텍처

## 개요
Project Manager는 프로젝트 관리 및 Claude Code 통합을 위한 풀스택 웹 애플리케이션입니다.

## 기술 스택

### Backend
- **프레임워크**: Hono v4.6.14 (경량 웹 프레임워크)
- **언어**: TypeScript
- **런타임**: Node.js 20
- **빌드**: TypeScript 컴파일러
- **포트**: 3000

### Frontend
- **프레임워크**: React 19
- **빌드 도구**: Vite 7
- **스타일링**: TailwindCSS v4
- **언어**: TypeScript
- **포트**: 5173

### 추가 서비스
- **Claude Code WebUI**: npm 패키지 (v0.1.56)
- **포트**: 8081

## 프로젝트 구조

```
project-manager/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── projects.ts      # API 라우트
│   │   ├── services/
│   │   │   └── projectService.ts # 프로젝트 관리 로직
│   │   └── index.ts              # 서버 엔트리포인트
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── ClaudeCode.tsx   # Claude Code iframe
│   │   ├── App.tsx               # 메인 앱
│   │   ├── index.css
│   │   └── main.tsx
│   ├── tests/                    # Playwright 테스트
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── playwright.config.ts
└── docker-compose.yml
```

## API 엔드포인트

### GET /api/projects
모든 프로젝트 목록 반환

**응답 예시**:
```json
{
  "success": true,
  "projects": [
    {
      "name": "project-name",
      "path": "/path/to/project",
      "type": "nodejs",
      "hasGit": true,
      "modified": false
    }
  ]
}
```

### GET /api/projects/git-status
Git 변경사항이 있는 프로젝트만 반환

### GET /api/projects/:name
특정 프로젝트의 상세 정보 반환

## 환경 변수

### Backend
- `PROJECTS_ROOT`: 프로젝트 루트 경로 (기본값: `../`)
- `PORT`: 서버 포트 (기본값: 3000)

### Frontend
- Vite를 통해 빌드 시 환경 변수 주입 가능

## 빌드 및 실행

### 개발 모드
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Claude Code WebUI
claude-code-webui --port 8081
```

### 프로덕션 빌드
```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build
```

## 주요 기능

1. **프로젝트 대시보드**
   - 프로젝트 목록 표시
   - 프로젝트 타입별 필터링 (Node.js, Python, Java/Spring)
   - Git 상태별 필터링
   - 통계 카드 (총 프로젝트 수, Git 저장소, 수정된 프로젝트 등)

2. **Claude Code 통합**
   - 탭 기반 UI로 Projects와 Claude Code 전환
   - iframe을 통한 Claude Code WebUI 임베딩
   - 클립보드 권한 허용

3. **실시간 업데이트**
   - 프로젝트 새로고침 버튼
   - 자동 데이터 로딩

4. **반응형 디자인**
   - TailwindCSS 기반 다크 테마
   - 그리드 레이아웃
   - 모바일 친화적 UI
