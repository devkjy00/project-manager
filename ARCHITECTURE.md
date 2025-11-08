# 🏗️ Project Dashboard 아키텍처

## 📋 프로젝트 개요

**Project Dashboard**는 로컬 개발 환경의 여러 프로젝트를 한눈에 관리하고 모니터링할 수 있는 웹 기반 대시보드 시스템입니다.

### 핵심 가치
- 📊 **통합 관리**: 여러 프로젝트를 하나의 대시보드에서 관리
- 🔄 **실시간 모니터링**: Git 상태, 프로젝트 타입, 수정 시간 등을 실시간으로 확인
- 📝 **문서 자동화**: README 자동 생성 및 미리보기
- 🎨 **직관적 UI**: 카드 기반 레이아웃으로 프로젝트 정보를 시각화

---

## 🏛️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자                                │
│                    (웹 브라우저)                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Layer                             │
│                  (Vanilla JavaScript)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │   UI/UX     │  │   State     │  │  API Client  │       │
│  │ - Cards     │  │ - Projects  │  │ - fetch()    │       │
│  │ - Modal     │  │ - Filter    │  │ - Polling    │       │
│  │ - Filters   │  │ - Cache     │  │              │       │
│  └─────────────┘  └─────────────┘  └──────────────┘       │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Layer                              │
│                   (Node.js + Express)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │  REST API   │  │  Business   │  │   Analyzer   │       │
│  │  Routes     │  │   Logic     │  │  - Type      │       │
│  │             │  │             │  │  - Git       │       │
│  │ /api/       │  │ - Scan      │  │  - README    │       │
│  │  projects   │  │ - Analyze   │  │              │       │
│  └─────────────┘  └─────────────┘  └──────────────┘       │
└────────────────────┬────────────────────────────────────────┘
                     │ File System Access
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Source Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             File System                               │  │
│  │  - Project Directories                                │  │
│  │  - package.json, requirements.txt, build.gradle      │  │
│  │  - README.md                                          │  │
│  │  - .git/                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Git CLI                                  │  │
│  │  - git status                                         │  │
│  │  - git branch                                         │  │
│  │  - git rev-list                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 컴포넌트 상세 설계

### 1. Frontend Layer (클라이언트)

#### 1.1 기술 스택
- **언어**: Vanilla JavaScript (ES6+)
- **스타일**: CSS3 (Flexbox, Grid)
- **통신**: Fetch API
- **렌더링**: 동적 DOM 조작

#### 1.2 주요 모듈

```javascript
// 상태 관리
let allProjects = [];        // 전체 프로젝트 데이터
let currentFilter = 'all';   // 현재 필터 상태

// 핵심 함수
- loadProjects()            // API에서 프로젝트 데이터 로드
- updateStats()             // 통계 카드 업데이트
- displayProjects()         // 프로젝트 카드 렌더링
- createProjectCard()       // 개별 카드 생성
- showProjectDetails()      // README 모달 표시
- filterProjects()          // 필터링 로직
```

#### 1.3 UI 구성

```
┌─────────────────────────────────────────────────────────┐
│                     Header                               │
│              📊 Project Dashboard                        │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                   Stats Cards                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Total   │ │   Git    │ │ Modified │ │  Node.js │  │
│  │  Projects│ │   Repos  │ │          │ │ Projects │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                     Filters                              │
│  [All] [Node.js] [Python] [Java] [Modified] [No Git]   │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                  Project Grid                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │  Project  │  │  Project  │  │  Project  │          │
│  │   Card    │  │   Card    │  │   Card    │          │
│  │           │  │           │  │           │          │
│  │ - Name    │  │ - Name    │  │ - Name    │          │
│  │ - Type    │  │ - Type    │  │ - Type    │          │
│  │ - Git     │  │ - Git     │  │ - Git     │          │
│  │ - README  │  │ - README  │  │ - README  │          │
│  └───────────┘  └───────────┘  └───────────┘          │
└─────────────────────────────────────────────────────────┘
                         ┌──┐
                         │🔄│  Refresh Button
                         └──┘
```

---

### 2. Backend Layer (서버)

#### 2.1 기술 스택
- **런타임**: Node.js
- **프레임워크**: Express.js
- **파일 시스템**: fs (Node.js 내장)
- **프로세스 실행**: child_process (execSync)

#### 2.2 API 엔드포인트

```javascript
// API 라우트
GET  /                       // 메인 페이지 (index.html)
GET  /api/projects           // 모든 프로젝트 목록 조회
GET  /api/projects/:name     // 특정 프로젝트 상세 조회
GET  /api/git-status         // Git 변경사항이 있는 프로젝트만 조회
```

**API 응답 구조**

```json
{
  "success": true,
  "projects": [
    {
      "name": "project-name",
      "path": "/absolute/path/to/project",
      "types": ["Node.js", "Python"],
      "git": {
        "hasGit": true,
        "branch": "main",
        "changes": 5,
        "ahead": 0,
        "behind": 0,
        "status": "modified"
      },
      "modified": {
        "text": "2 days ago",
        "days": 2
      },
      "readme": {
        "exists": true,
        "content": "# Project\n...",
        "preview": "# Project (first 500 chars)..."
      }
    }
  ]
}
```

#### 2.3 핵심 함수

```javascript
// 프로젝트 분석 함수
detectProjectType(dir)      // package.json, requirements.txt 등 탐지
getGitStatus(dir)           // Git 상태 확인 (execSync)
getLastModified(dir)        // 최종 수정 시간 계산
readReadme(dir)             // README.md 읽기

// 프로젝트 정보 수집
getProjectInfo(path, name)  // 종합 정보 수집
```

---

### 3. Data Flow (데이터 흐름)

#### 3.1 프로젝트 로딩 시퀀스

```
[Browser]                [Express Server]           [File System]
    │                           │                          │
    │ GET /api/projects         │                          │
    ├──────────────────────────>│                          │
    │                           │                          │
    │                           │ fs.readdirSync()         │
    │                           ├─────────────────────────>│
    │                           │<─────────────────────────┤
    │                           │   [dir1, dir2, ...]      │
    │                           │                          │
    │                           │ For each directory:      │
    │                           │                          │
    │                           │ detectProjectType()      │
    │                           ├─────────────────────────>│
    │                           │   fs.existsSync()        │
    │                           │<─────────────────────────┤
    │                           │                          │
    │                           │ getGitStatus()           │
    │                           ├─────────────────────────>│
    │                           │   execSync('git status') │
    │                           │<─────────────────────────┤
    │                           │                          │
    │                           │ readReadme()             │
    │                           ├─────────────────────────>│
    │                           │   fs.readFileSync()      │
    │                           │<─────────────────────────┤
    │                           │                          │
    │ JSON Response             │                          │
    │<──────────────────────────┤                          │
    │                           │                          │
    │ Render UI                 │                          │
    │                           │                          │
```

#### 3.2 자동 새로고침 플로우

```
Browser Timeline:

0s    ─────> loadProjects() (초기 로드)
30s   ─────> loadProjects() (자동 새로고침)
60s   ─────> loadProjects() (자동 새로고침)
...   (30초마다 반복)

또는 사용자가 🔄 버튼 클릭 시 즉시 새로고침
```

---

## 🔧 주요 기능 설계

### 1. 프로젝트 타입 감지

**알고리즘**:
```javascript
detectProjectType(dir) {
  types = []

  if exists(package.json)
    types.add("Node.js")

  if exists(requirements.txt OR setup.py OR pyproject.toml)
    types.add("Python")

  if exists(pom.xml OR build.gradle OR gradlew)
    types.add("Java/Spring")

  if exists(Cargo.toml)
    types.add("Rust")

  // ... 다른 타입들

  return types.length > 0 ? types : ["Unknown"]
}
```

### 2. Git 상태 분석

**실행 흐름**:
```
1. .git 폴더 존재 확인
   ↓
2. git branch --show-current
   → 현재 브랜치 이름
   ↓
3. git status --porcelain
   → 변경된 파일 개수
   ↓
4. git remote update (선택)
   ↓
5. git rev-list --count @{u}..HEAD
   → ahead 커밋 수
   ↓
6. git rev-list --count HEAD..@{u}
   → behind 커밋 수
   ↓
7. 결과 반환
```

### 3. README 미리보기 및 모달

**두 단계 표시**:
```
1. 카드 미리보기
   - README 첫 500자만 표시
   - "📄 README" 뱃지 표시
   - 존재하지 않으면 "No README.md"

2. 모달 전체보기
   - 클릭 시 전체 README 내용 표시
   - 기본 마크다운 렌더링
   - ESC, 배경 클릭, X 버튼으로 닫기
```

### 4. 필터링 시스템

**필터 타입**:
```javascript
filters = {
  'all':      모든 프로젝트,
  'node':     types.includes('Node.js'),
  'python':   types.includes('Python'),
  'java':     types.includes('Java/Spring'),
  'modified': git.changes > 0,
  'no-git':   !git.hasGit
}
```

---

## 🛠️ 유틸리티 도구

### 1. README 자동 생성 스크립트

**파일**: `generate-readmes.js`

**실행 흐름**:
```
1. 프로젝트 루트 디렉토리 스캔
   ↓
2. 각 프로젝트별로:
   - README.md 존재 여부 확인
   - 존재하지 않으면:
     a. 프로젝트 타입 감지
     b. package.json 정보 추출
     c. Git 정보 추출
     d. 템플릿 기반 README 생성
     e. 파일 저장
   ↓
3. 결과 통계 출력
```

**템플릿 구조**:
```markdown
# 프로젝트명

설명

## 📋 프로젝트 정보
- 타입, Git 브랜치 등

## 🛠 기술 스택
- 의존성 목록

## 🚀 설치 및 실행
- 실행 명령어

## 📁 프로젝트 구조
- 디렉토리 트리
```

---

## 📊 성능 최적화

### 1. 프론트엔드 최적화

```javascript
// 자동 새로고침 간격
const REFRESH_INTERVAL = 30000; // 30초

// README 미리보기 글자 수 제한
const PREVIEW_LIMIT = 500; // 500자

// Git remote update 타임아웃
const GIT_TIMEOUT = 5000; // 5초
```

### 2. 백엔드 최적화

- **동기 파일 읽기**: 간단한 구조에서는 동기 방식 사용
- **에러 핸들링**: try-catch로 실패 시 graceful degradation
- **캐싱 없음**: 실시간 데이터 우선 (향후 추가 가능)

---

## 🔐 보안 고려사항

### 1. 경로 보안
```javascript
// project-manager 폴더 자체는 제외
if (item === 'project-manager') continue;

// 숨김 폴더 제외
if (item.startsWith('.')) continue;
```

### 2. Git 명령 안전성
```javascript
// 안전한 execSync 사용
execSync('git status --porcelain', {
  cwd: dir,
  encoding: 'utf8',
  timeout: 5000  // 타임아웃 설정
});
```

---

## 📁 프로젝트 구조

```
web-dashboard/
├── server.js                 # Express 서버 메인
├── package.json              # 의존성 관리
├── generate-readmes.js       # README 자동 생성 스크립트
├── ARCHITECTURE.md           # 아키텍처 문서 (현재 파일)
├── README.md                 # 프로젝트 README
└── public/
    └── index.html            # 프론트엔드 SPA
        ├── <style>           # CSS (내장)
        └── <script>          # JavaScript (내장)
```

---

## 🚀 배포 및 실행

### 개발 환경
```bash
npm install
npm start
# http://localhost:3000
```

### 프로덕션 환경 (향후)
```bash
# PM2로 프로세스 관리
pm2 start server.js --name "project-dashboard"

# 또는 Docker
docker build -t project-dashboard .
docker run -p 3000:3000 -v /path/to/projects:/projects project-dashboard
```

---

## 🔮 향후 개선 방향

### 1. 기능 개선
- [ ] 프로젝트 실행 버튼 (npm start, python run 등)
- [ ] Git commit/push UI
- [ ] 프로젝트 검색 기능
- [ ] 즐겨찾기/태그 기능
- [ ] 프로젝트별 메모 기능

### 2. 성능 개선
- [ ] Redis 캐싱 추가
- [ ] WebSocket으로 실시간 업데이트
- [ ] 프로젝트 스캔 비동기 처리
- [ ] 가상 스크롤 (많은 프로젝트 처리)

### 3. UX 개선
- [ ] 다크 모드
- [ ] 프로젝트 정렬 (이름, 날짜, 타입)
- [ ] 그리드/리스트 뷰 전환
- [ ] 프로젝트 통계 차트

### 4. 통합 개선
- [ ] GitHub API 통합 (이슈, PR)
- [ ] CI/CD 상태 표시
- [ ] Docker 컨테이너 상태
- [ ] 로그 뷰어

---

## 📝 기술 결정 이유

### 1. Vanilla JavaScript 선택
- **이유**:
  - 빠른 프로토타이핑
  - 의존성 최소화
  - 학습 곡선 낮음
  - 번들링 불필요

### 2. 단일 HTML 파일
- **이유**:
  - 간단한 배포
  - 빠른 로딩
  - 빌드 프로세스 불필요

### 3. 자동 새로고침 (30초)
- **이유**:
  - Git 상태는 자주 변경됨
  - 사용자 수동 새로고침 부담 감소
  - 네트워크 부하는 낮음 (로컬 서버)

### 4. Git CLI 사용 (라이브러리 대신)
- **이유**:
  - 신뢰성 높음
  - 설치된 Git 활용
  - 복잡한 Git 라이브러리 불필요

---

## 📚 참고 자료

- [Express.js Documentation](https://expressjs.com/)
- [Node.js File System API](https://nodejs.org/api/fs.html)
- [Git Documentation](https://git-scm.com/doc)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

*Last Updated: 2025-01-01*
*Version: 1.0.0*
