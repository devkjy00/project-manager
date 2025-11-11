# Claude Code WebUI 통합

## 개요
Plan.md의 요구사항에 따라 Claude Code WebUI를 iframe 방식으로 프로젝트에 통합했습니다.

## 선택한 방식: Option 1 (iframe 통합)

### 장점
- 구현이 가장 간단
- Claude Code WebUI의 독립적인 업데이트 가능
- 별도의 빌드 통합 불필요

### 단점
- 통신이 제한적 (postMessage 사용 필요)
- UI 커스터마이징 제한적

## 구현 단계

### 1. Claude Code WebUI 설치
```bash
npm install -g claude-code-webui
```

**설치된 버전**: v0.1.56

### 2. React 컴포넌트 생성

**파일**: `frontend/src/components/ClaudeCode.tsx`

```typescript
export function ClaudeCode() {
  return (
    <div className="h-full w-full">
      <iframe
        id="claude-code-iframe"
        src="http://localhost:8081"
        className="w-full h-[calc(100vh-12rem)] border-none rounded-lg"
        allow="clipboard-read; clipboard-write"
        title="Claude Code WebUI"
      />
    </div>
  );
}
```

**주요 설정**:
- `src`: Claude Code WebUI 서버 주소 (localhost:8081)
- `allow`: 클립보드 읽기/쓰기 권한 부여
- `className`: TailwindCSS로 전체 화면 스타일링

### 3. App.tsx에 탭 네비게이션 추가

**파일**: `frontend/src/App.tsx`

**변경 사항**:
1. `Tab` 타입 정의
   ```typescript
   type Tab = 'projects' | 'claude-code';
   ```

2. 상태 관리
   ```typescript
   const [activeTab, setActiveTab] = useState<Tab>('projects');
   ```

3. 탭 버튼 UI
   ```tsx
   <div className="flex gap-2">
     <button
       onClick={() => setActiveTab('projects')}
       className={`px-6 py-2 rounded-lg font-medium transition-all ${
         activeTab === 'projects'
           ? 'bg-blue-600 text-white'
           : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
       }`}
     >
       Projects
     </button>
     <button
       onClick={() => setActiveTab('claude-code')}
       className={`px-6 py-2 rounded-lg font-medium transition-all ${
         activeTab === 'claude-code'
           ? 'bg-blue-600 text-white'
           : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
       }`}
     >
       Claude Code
     </button>
   </div>
   ```

4. 조건부 렌더링
   ```tsx
   {activeTab === 'projects' ? (
     <div>
       {/* Projects 컨텐츠 */}
     </div>
   ) : (
     <ClaudeCode />
   )}
   ```

## 실행 방법

### 1. Claude Code WebUI 서버 시작
```bash
claude-code-webui --port 8081
```

### 2. Backend 서버 시작
```bash
cd backend && npm run dev
```

### 3. Frontend 개발 서버 시작
```bash
cd frontend && npm run dev
```

### 4. 브라우저에서 확인
- Frontend: http://localhost:5173
- Claude Code WebUI: http://localhost:8081

## 탭 전환 동작

1. **Projects 탭 (기본값)**
   - 프로젝트 대시보드 표시
   - 통계, 필터, 프로젝트 카드 표시

2. **Claude Code 탭**
   - Claude Code WebUI iframe 표시
   - Projects 컨텐츠 완전히 숨김
   - 클립보드 권한으로 코드 복사/붙여넣기 가능

## iframe 보안 설정

### 허용된 권한
- `clipboard-read`: 클립보드에서 읽기
- `clipboard-write`: 클립보드에 쓰기

### 제한 사항
- 동일 출처 정책(Same-Origin Policy) 적용
- iframe 내부 DOM 직접 접근 불가
- postMessage를 통한 통신만 가능

## 향후 개선 사항

### 1. 통신 기능 추가
postMessage를 사용하여 다음 기능 구현 가능:
- 프로젝트 선택 시 Claude Code에 경로 전달
- Claude Code 작업 상태를 Projects 탭에 표시

### 2. 동적 URL 설정
환경 변수로 Claude Code WebUI URL 설정:
```typescript
const CLAUDE_CODE_URL = import.meta.env.VITE_CLAUDE_CODE_URL || 'http://localhost:8081';
```

### 3. 로딩 상태 표시
iframe 로딩 중 스피너 표시:
```typescript
const [isLoading, setIsLoading] = useState(true);

<iframe
  onLoad={() => setIsLoading(false)}
  // ...
/>
```

## 관련 파일

- `frontend/src/components/ClaudeCode.tsx`: Claude Code iframe 컴포넌트
- `frontend/src/App.tsx`: 탭 네비게이션 및 메인 레이아웃
- `frontend/package.json`: 프론트엔드 의존성
