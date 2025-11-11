# 웹에서 Claude Code 실행 기능 구현 계획

## 프로젝트: claude-code-webui 통합

**claude-code-webui**는 Claude Code CLI를 웹 인터페이스로 사용할 수 있게 해주는 전용 프로젝트입니다.
이미 `/Users/jy_mac/MyDir/project/claude-code-webui`에 설치되어 있습니다!

---

## claude-code-webui 분석 결과

### 아키텍처
- **Backend**: Hono + TypeScript (Node.js/Deno 지원)
- **Frontend**: React 19 + Vite + TailwindCSS
- **통신**: NDJSON 스트리밍 (Server-Sent Events 방식)
- **Claude 통합**: `@anthropic-ai/claude-code` SDK 사용

### 주요 기능
1. ✅ Claude Code CLI 자동 감지
2. ✅ 프로젝트 선택 (from `~/.claude.json`)
3. ✅ 실시간 스트리밍 채팅
4. ✅ 대화 히스토리 조회
5. ✅ Permission 모드 (normal/plan/acceptEdits)
6. ✅ Tool 권한 관리
7. ✅ 요청 취소 기능

### API 엔드포인트
```
GET  /api/projects                                          - 프로젝트 목록
POST /api/chat                                              - Claude 채팅
POST /api/abort/:requestId                                  - 요청 취소
GET  /api/projects/:encodedProjectName/histories           - 대화 히스토리
GET  /api/projects/:encodedProjectName/histories/:sessionId - 특정 대화
```

---

## 통합 방식 옵션

### 🎯 Option 1: 별도 서비스로 실행 + iframe (가장 간단, 권장)

**장점**
- ✅ 개발 시간: **10분**
- ✅ 유지보수 불필요
- ✅ claude-code-webui의 모든 기능 그대로 사용
- ✅ 의존성 충돌 없음

**단점**
- ❌ 별도 포트 관리 필요

---

### 🔗 Option 2: 리버스 프록시 (중간)

**장점**
- ✅ 단일 포트로 통합
- ✅ URL 일관성 (`/claude/*`)

**단점**
- ⚠️ http-proxy-middleware 설치 필요

---

### 🛠 Option 3: API만 사용 + 커스텀 UI (고급)

**장점**
- ✅ 완전한 UI 커스터마이징

**단점**
- ❌ 개발 시간: 2-3일
- ❌ 스트리밍 처리 직접 구현

---

## 선택: Option 1 (별도 서비스 + iframe) ✨

**가장 빠르고 안정적!**

---

## 작업 항목

### Phase 1: claude-code-webui 실행 (5분)

#### 1.1 claude-code-webui 확인
- [ ] 프로젝트 존재 확인
  ```bash
  ls /Users/jy_mac/MyDir/project/claude-code-webui
  ```

- [ ] Claude CLI 설치 확인
  ```bash
  which claude
  # 또는
  npx @anthropic-ai/claude --version
  ```

- [ ] Claude CLI 로그인 확인
  ```bash
  # Claude가 이미 로그인되어 있어야 함
  # 없으면: https://claude.ai/code 에서 설치
  ```

#### 1.2 claude-code-webui 실행

**방법 1: 이미 설치된 프로젝트에서 실행 (개발 모드)**
```bash
cd /Users/jy_mac/MyDir/project/claude-code-webui

# Backend 실행
cd backend
npm install
npm run dev  # 포트 8080

# Frontend 실행 (새 터미널)
cd frontend
npm install
npm run dev  # 포트 3000
```

**방법 2: NPM 글로벌 설치 (프로덕션)**
```bash
npm install -g claude-code-webui
claude-code-webui --port 8081  # 3000과 충돌 방지
```

**방법 3: 바이너리 실행 (가장 간단)**
```bash
cd /Users/jy_mac/MyDir/project/claude-code-webui
# 바이너리가 있다면
./claude-code-webui-macos-arm64 --port 8081
```

- [ ] 브라우저에서 확인: http://localhost:8081

---

### Phase 2: Project Manager 통합 (5분)

#### 2.1 iframe 탭 추가

- [ ] [public/index.html](public/index.html) 수정 - 탭 추가
  ```html
  <!-- 기존 탭 옆에 추가 -->
  <div class="tabs">
    <button class="tab active" data-tab="projects">Projects</button>
    <button class="tab" data-tab="git-status">Git Status</button>
    <button class="tab" data-tab="claude-code">Claude Code</button> <!-- 새 탭 -->
  </div>

  <!-- 기존 탭 콘텐츠 다음에 추가 -->
  <div class="tab-content" id="claude-code" style="display: none;">
    <iframe
      id="claude-code-iframe"
      src="http://localhost:8081"
      style="width: 100%; height: calc(100vh - 150px); border: none;"
      allow="clipboard-read; clipboard-write"
    ></iframe>
  </div>
  ```

#### 2.2 탭 전환 로직 확인

- [ ] 기존 탭 전환 코드가 자동으로 작동하는지 확인
  ```javascript
  // 이미 index.html에 있는 코드가 자동으로 작동함
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');
      document.getElementById(tabName).style.display = 'block';
    });
  });
  ```

#### 2.3 스타일 추가 (선택적)

- [ ] CSS 추가 (필요시만)
  ```css
  #claude-code {
    padding: 0;
    width: 100%;
    height: 100%;
  }

  #claude-code-iframe {
    width: 100%;
    height: calc(100vh - 150px);
    border: none;
  }
  ```

---

**✅ 완료! 10분만에 통합 끝!**

---

## 실행 순서

### 1. claude-code-webui 시작
```bash
# 방법 A: 개발 모드 (이미 설치된 프로젝트)
cd /Users/jy_mac/MyDir/project/claude-code-webui/backend
npm install && npm run dev &

cd /Users/jy_mac/MyDir/project/claude-code-webui/frontend
npm install && npm run dev

# 방법 B: 글로벌 설치 (권장)
npm install -g claude-code-webui
claude-code-webui --port 8081

# 방법 C: 바이너리
./claude-code-webui-macos-arm64 --port 8081
```

### 2. Project Manager 시작
```bash
cd /Users/jy_mac/MyDir/project/project-manager
npm start  # 포트 3000
```

### 3. 접속
- **Project Manager**: http://localhost:3000
- **Claude Code 탭 클릭**: iframe으로 claude-code-webui 표시

---

## 대체 방안: 리버스 프록시 (Option 2)

더 깔끔한 통합을 원하면 프록시 사용:

### 추가 작업 (15분)

#### 1. 의존성 설치
```bash
cd /Users/jy_mac/MyDir/project/project-manager
npm install http-proxy-middleware
```

#### 2. server.js 수정
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

// Claude Code 프록시 추가 (기존 코드 아래에)
app.use('/claude', createProxyMiddleware({
  target: 'http://localhost:8081',
  changeOrigin: true,
  pathRewrite: {
    '^/claude': '' // /claude/* -> /*
  },
  ws: true // WebSocket 지원 (스트리밍용)
}));
```

#### 3. iframe URL 변경
```html
<!-- public/index.html -->
<iframe
  id="claude-code-iframe"
  src="/claude"  <!-- 상대 경로로 변경 -->
  style="width: 100%; height: calc(100vh - 150px); border: none;"
></iframe>
```

**장점**: 단일 포트 (3000)만 사용, URL이 `/claude`로 통일

---

## 파일 구조

```
project-manager/
├── server.js                # 수정 불필요 (Option 1)
│                            # 프록시 추가 (Option 2)
├── package.json             # 의존성 불필요 (Option 1)
│                            # http-proxy-middleware 추가 (Option 2)
└── public/
    └── index.html          # iframe 탭만 추가

claude-code-webui/
├── backend/                # 별도 실행
├── frontend/               # 별도 실행
└── package.json
```

---

## 개발 일정

| Phase | 작업 | 예상 시간 |
|-------|------|----------|
| Phase 1 | claude-code-webui 실행 | 5분 |
| Phase 2 | iframe 탭 추가 | 5분 |
| (선택) | 리버스 프록시 설정 | +15분 |
| **총계** | | **✨ 10분 (Option 1)** <br> **25분 (Option 2)** |

---

## 장점 요약

### Option 1 (iframe) ✨
✅ **초고속**: 10분이면 완성!
✅ **의존성 제로**: 추가 npm 패키지 불필요
✅ **유지보수 없음**: claude-code-webui 업데이트 자동 반영
✅ **완전한 기능**: Claude Code의 모든 기능 사용
✅ **검증된 코드**: 공식 프로젝트 사용

### Option 2 (프록시)
✅ **단일 포트**: 3000만 사용
✅ **깔끔한 URL**: `/claude`로 통일
✅ **WebSocket 지원**: 스트리밍 프록시

---

## 작동 방식

1. **claude-code-webui 시작**
   - 포트 8081에서 실행
   - Claude CLI 자동 감지
   - `~/.claude.json`에서 프로젝트 읽기

2. **Project Manager에서 Claude Code 탭 클릭**
   - iframe으로 claude-code-webui 로드 (`http://localhost:8081`)
   - 또는 프록시 사용 시 (`/claude`)

3. **Claude Code 사용**
   - 프로젝트 선택
   - 채팅으로 코드 작성/수정
   - 실시간 스트리밍 응답
   - 대화 히스토리 저장

---

## 추가 기능 (선택적)

### 프로젝트 컨텍스트 자동 전달

현재 Project Manager에서 선택된 프로젝트를 Claude에 자동 전달:

```javascript
// public/index.html에 추가
function openClaudeWithProject(projectPath) {
  const iframe = document.getElementById('claude-code-iframe');
  // URL에 프로젝트 경로 전달 (claude-code-webui가 지원하면)
  iframe.src = `http://localhost:8081?project=${encodeURIComponent(projectPath)}`;
}
```

### API 직접 호출 (고급)

Project Manager에서 Claude API 직접 사용:

```javascript
// 프로젝트 목록 가져오기
async function getClaudeProjects() {
  const response = await fetch('http://localhost:8081/api/projects');
  const data = await response.json();
  return data.projects;
}

// 채팅 메시지 전송
async function sendToClaude(message, workingDirectory) {
  const response = await fetch('http://localhost:8081/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      workingDirectory,
      requestId: crypto.randomUUID(),
      permissionMode: 'default'
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const data = JSON.parse(line);
      console.log('Claude response:', data);
    }
  }
}
```

---

## 문제 해결

### Claude CLI가 감지되지 않을 때
```bash
# Claude 설치 확인
which claude
npx @anthropic-ai/claude --version

# 없으면 설치
# https://claude.ai/code 방문하여 설치

# 수동으로 경로 지정
claude-code-webui --claude-path "$(which claude)"
```

### 포트 충돌
```bash
# 다른 포트 사용
claude-code-webui --port 9000

# iframe src도 변경
<iframe src="http://localhost:9000" ...></iframe>
```

### 프로젝트가 표시되지 않을 때
```bash
# ~/.claude.json 확인
cat ~/.claude.json

# 프로젝트 추가
# Claude CLI로 프로젝트 초기화 필요
cd /Users/jy_mac/MyDir/project/my-project
claude .
```

---

## 참고 자료

- **claude-code-webui GitHub**: https://github.com/sugyan/claude-code-webui
- **Claude Code 공식**: https://claude.ai/code
- **로컬 경로**: `/Users/jy_mac/MyDir/project/claude-code-webui`

---

## 다음 단계

### 🚀 바로 시작!

1. ⏭️ Claude CLI 설치 확인 (2분)
2. ⏭️ claude-code-webui 실행 (3분)
3. ⏭️ index.html에 iframe 탭 추가 (5분)
4. ✅ **완료!**

Phase 1부터 시작할까요?
