# 🏗️ Project Dashboard 아키텍처

## 📋 프로젝트 개요

**Project Dashboard**는 로컬 개발 환경의 여러 프로젝트를 한눈에 관리하고 모니터링할 수 있는 웹 기반 대시보드 시스템입니다.

### 핵심 가치
- 📊 **통합 관리**: 여러 프로젝트를 하나의 대시보드에서 관리
- 🔄 **실시간 모니터링**: Git 상태, 프로젝트 타입, 수정 시간 등을 실시간으로 확인
- 📝 **문서 자동화**: README 자동 생성 및 미리보기
- 🎨 **직관적 UI**: 카드 기반 레이아웃으로 프로젝트 정보를 시각화
- 🤖 **AI 코딩 지원**: Claude Code 웹 인터페이스 통합

---

## 🏛️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자                                │
│                    (웹 브라우저)                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST + NDJSON Streaming
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Layer                             │
│              (React 19 + TypeScript)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │ Components  │  │   Hooks     │  │    State     │       │
│  │ - Projects  │  │ - useProj.. │  │ - Context    │       │
│  │ - GitStatus │  │ - useGit... │  │ - Zustand    │       │
│  │ - ClaudeUI  │  │ - useChat.. │  │              │       │
│  └─────────────┘  └─────────────┘  └──────────────┘       │
│                                                              │
│  Build: Vite + SWC                                          │
│  Styling: TailwindCSS v4                                    │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API + Streaming
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Layer                              │
│              (Hono + TypeScript)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │  Hono App   │  │  Handlers   │  │   Services   │       │
│  │             │  │             │  │              │       │
│  │ - Routes    │  │ - Projects  │  │ - Type Det.. │       │
│  │ - Middlew.. │  │ - Git       │  │ - Git Analy..│       │
│  │ - CORS      │  │ - Claude    │  │ - README     │       │
│  └─────────────┘  └─────────────┘  └──────────────┘       │
│                                                              │
│  Runtime: Node.js 20+ / Deno (optional)                    │
└────────────────────┬────────────────────────────────────────┘
                     │ File System + Git CLI
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Source Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             File System                               │  │
│  │  - Project Directories                                │  │
│  │  - package.json, requirements.txt, etc.              │  │
│  │  - README.md                                          │  │
│  │  - .git/                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Git CLI                                  │  │
│  │  - git status, branch, rev-list                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Claude Code CLI                             │  │
│  │  - @anthropic-ai/claude-code SDK                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 기술 스택 (2025 Modern Stack)

### Frontend
- **Framework**: React 19.0 (최신)
- **Language**: TypeScript 5.7+
- **Build Tool**: Vite 6.0 + SWC
- **Styling**: TailwindCSS v4 (CSS-first configuration)
- **Router**: React Router v7 (optional)
- **State Management**:
  - React Context API (작은 상태)
  - Zustand (전역 상태, optional)
- **HTTP Client**: Fetch API (native)
- **Code Editor**: CodeMirror 6 (Claude 통합용)

### Backend
- **Framework**: Hono 4.0+
- **Language**: TypeScript 5.7+
- **Runtime**: Node.js 20+ (primary), Deno 2.0+ (optional)
- **Validation**: Zod (타입 안전한 검증)
- **Logging**: Hono Logger middleware
- **File System**: Node.js fs/promises
- **Process Execution**: Node.js child_process

### DevOps & Build
- **Package Manager**: npm / pnpm
- **Linting**: ESLint 9 (Flat Config)
- **Formatting**: Prettier
- **Type Checking**: tsc --noEmit
- **Testing**: Vitest (unit), Playwright (e2e)

---

## 🔌 API 엔드포인트

### Project Management APIs
```
GET  /                              // 메인 페이지 (React SPA)
GET  /api/projects                  // 전체 프로젝트 목록
GET  /api/projects/:name            // 특정 프로젝트 상세 정보
GET  /api/git-status                // Git 변경사항이 있는 프로젝트
```

### Claude Code Integration (claude-code-webui 통합)
```
GET  /api/claude/projects                              // Claude 프로젝트 목록
POST /api/claude/chat                                  // Claude 채팅 (NDJSON streaming)
POST /api/claude/abort/:requestId                      // 요청 취소
GET  /api/claude/histories/:project                    // 대화 히스토리
GET  /api/claude/histories/:project/:sessionId         // 특정 대화
```

---

## 📁 프로젝트 구조 (리팩토링 후)

```
project-manager/
├── backend/                      # Hono Backend
│   ├── src/
│   │   ├── index.ts             # Hono 앱 엔트리포인트
│   │   ├── routes/              # API 라우트
│   │   │   ├── projects.ts      # 프로젝트 관리 API
│   │   │   ├── git.ts           # Git 상태 API
│   │   │   └── claude.ts        # Claude 통합 API (프록시)
│   │   ├── services/            # 비즈니스 로직
│   │   │   ├── projectService.ts
│   │   │   ├── gitService.ts
│   │   │   └── claudeService.ts
│   │   ├── utils/               # 유틸리티
│   │   │   ├── logger.ts
│   │   │   ├── fs.ts
│   │   │   └── validation.ts
│   │   └── types/               # 타입 정의
│   │       └── index.ts
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── App.tsx              # 메인 앱 컴포넌트
│   │   ├── main.tsx             # React 엔트리포인트
│   │   ├── components/          # UI 컴포넌트
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── GitStatus.tsx
│   │   │   └── ClaudeChat.tsx
│   │   ├── hooks/               # Custom Hooks
│   │   │   ├── useProjects.ts
│   │   │   ├── useGitStatus.ts
│   │   │   └── useClaudeChat.ts
│   │   ├── contexts/            # React Contexts
│   │   │   └── AppContext.tsx
│   │   ├── types/               # 타입 정의
│   │   │   └── index.ts
│   │   ├── config/              # 설정
│   │   │   └── api.ts
│   │   └── styles/              # 스타일
│   │       └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                       # 공유 타입 (Backend/Frontend)
│   └── types.ts
│
├── docs/                         # 문서
│   ├── ARCHITECTURE.md
│   └── API.md
│
├── package.json                  # Monorepo 루트 (optional)
├── tsconfig.base.json            # 공통 TypeScript 설정
└── README.md
```

---

## 🚀 개발 환경 설정

### 초기 설정

```bash
# 1. Backend 설정
cd backend
npm init -y
npm install hono @hono/node-server
npm install -D typescript @types/node tsx

# 2. Frontend 설정
npm create vite@latest frontend -- --template react-swc-ts
cd frontend
npm install
npm install -D tailwindcss@next @tailwindcss/vite@next

# 3. 개발 실행
# Terminal 1: Backend
cd backend
npm run dev  # tsx watch src/index.ts

# Terminal 2: Frontend
cd frontend
npm run dev  # vite

# Terminal 3: Claude Code WebUI (optional)
cd ../claude-code-webui/backend
npm run dev
```

### 개발 서버 포트
- Frontend: `http://localhost:5173` (Vite 기본)
- Backend: `http://localhost:3000` (Hono)
- Claude WebUI: `http://localhost:8081` (별도 프로세스)

---

## 🔄 마이그레이션 계획

### Phase 1: Backend (Hono + TypeScript)
1. ✅ 프로젝트 구조 생성
2. ✅ Hono 앱 초기화
3. ✅ 기존 Express API를 Hono로 포팅
   - `/api/projects` → `routes/projects.ts`
   - `/api/git-status` → `routes/git.ts`
4. ✅ TypeScript 타입 정의
5. ✅ 에러 핸들링 및 로깅

### Phase 2: Frontend (React 19 + Vite)
1. ✅ Vite + React 프로젝트 생성
2. ✅ TailwindCSS 설정
3. ✅ 기존 UI를 React 컴포넌트로 변환
   - 프로젝트 카드 → `<ProjectCard />`
   - 필터/검색 → `<FilterBar />`
   - 모달 → `<ProjectModal />`
4. ✅ Custom Hooks 작성
5. ✅ API 통신 레이어

### Phase 3: Claude Code 통합
1. ✅ Backend에 Claude API 프록시 추가
2. ✅ Frontend에 Claude 채팅 UI 컴포넌트
3. ✅ NDJSON 스트리밍 처리
4. ✅ 세션 관리

### Phase 4: 최적화 및 배포
1. ✅ 빌드 최적화
2. ✅ 코드 스플리팅
3. ✅ Docker 컨테이너화
4. ✅ 프로덕션 배포

---

## 🎨 UI/UX 개선 사항

### TailwindCSS v4 활용
```css
/* tailwind.config.ts */
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      }
    }
  }
}
```

### React 19 새 기능 활용
- **Actions**: 폼 제출 최적화
- **use() Hook**: 비동기 데이터 로딩
- **React Compiler**: 자동 메모이제이션

---

## 📊 성능 최적화

### Frontend
- Vite의 빠른 HMR (Hot Module Replacement)
- SWC 컴파일러로 빠른 빌드
- React 19의 자동 메모이제이션
- Code Splitting (React.lazy + Suspense)

### Backend
- Hono의 초고속 라우팅 (Express보다 3배 빠름)
- 비동기 파일 시스템 처리 (fs/promises)
- 캐싱 레이어 (향후)

---

## 🔒 보안 고려사항

### Backend
```typescript
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

app.use('*', cors())
app.use('*', secureHeaders())
```

### Frontend
- XSS 방지 (React 자동 이스케이프)
- CSRF 토큰 (필요시)
- 환경 변수 관리 (Vite의 import.meta.env)

---

## 🧪 테스트 전략

### Unit Tests (Vitest)
```typescript
// backend/src/services/__tests__/projectService.test.ts
import { describe, it, expect } from 'vitest'
import { getProjects } from '../projectService'

describe('projectService', () => {
  it('should return project list', async () => {
    const projects = await getProjects()
    expect(projects).toBeInstanceOf(Array)
  })
})
```

### E2E Tests (Playwright)
```typescript
// e2e/project-list.spec.ts
import { test, expect } from '@playwright/test'

test('프로젝트 목록 표시', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page.locator('.project-card')).toBeVisible()
})
```

---

## 📚 참고 자료

### Backend
- [Hono Documentation](https://hono.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Frontend
- [React 19 Blog](https://react.dev/blog)
- [Vite Guide](https://vitejs.dev/)
- [TailwindCSS v4](https://tailwindcss.com/)

### Tools
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

---

## 🔮 향후 개선 방향

### 단기 (1-2개월)
- ✅ TypeScript 마이그레이션 완료
- ✅ React 19 + Vite 전환
- ✅ Claude Code 통합

### 중기 (3-6개월)
- WebSocket 실시간 업데이트
- GraphQL API (optional)
- 데이터베이스 연동 (SQLite/PostgreSQL)
- 사용자 인증

### 장기 (6개월+)
- GitHub/GitLab API 통합
- CI/CD 파이프라인 모니터링
- 플러그인 시스템
- AI 기반 프로젝트 분석

---

*Last Updated: 2025-01-11*
*Version: 2.0.0 - Modern Stack Migration*
*Tech Stack: Hono + TypeScript + React 19 + Vite + TailwindCSS*
