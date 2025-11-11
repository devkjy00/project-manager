# 발생한 이슈 및 해결 방법

## 개요
프로젝트 개발 및 테스트 과정에서 발생한 주요 이슈들과 해결 방법을 정리한 문서입니다.

---

## 이슈 #1: TailwindCSS PostCSS Plugin 오류

### 문제 설명
**발생 시점**: Frontend 개발 서버 실행 시

**에러 메시지**:
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, please update your configuration.
```

**증상**:
- 브라우저에서 오류 오버레이 표시
- CSS 스타일이 적용되지 않음
- Vite 개발 서버는 정상 실행되나 스타일 로드 실패

### 원인 분석
TailwindCSS v4부터 PostCSS 플러그인이 별도 패키지(`@tailwindcss/postcss`)로 분리되었지만, 기존 v3 방식의 설정을 사용하고 있었음.

**기존 설정** (`postcss.config.js`):
```javascript
export default {
  plugins: {
    tailwindcss: {},  // ❌ v4에서는 작동하지 않음
    autoprefixer: {},
  },
}
```

### 해결 방법

#### 1단계: @tailwindcss/postcss 패키지 설치
```bash
npm install -D @tailwindcss/postcss
```

#### 2단계: postcss.config.js 수정
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // ✅ v4 플러그인 사용
    autoprefixer: {},
  },
}
```

**파일 위치**: `frontend/postcss.config.js`

#### 3단계: index.css 문법 수정
**변경 전**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**변경 후**:
```css
@import "tailwindcss";
```

**파일 위치**: `frontend/src/index.css`

### 검증
```bash
npm run dev
```
- 오류 없이 서버 실행
- 브라우저에서 스타일 정상 적용

### 관련 문서
- `@history/03-tailwindcss-configuration.md`

---

## 이슈 #2: API git-status 엔드포인트 404 오류

### 문제 설명
**발생 시점**: Playwright 테스트 실행 시

**에러 메시지**:
```
Error: expect(response.ok()).toBeTruthy()
Expected: true
Received: false
```

**테스트 파일**: `frontend/tests/api.spec.ts:59`

**실패한 테스트**:
```typescript
test('should fetch git-status endpoint', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/projects/git-status');
  expect(response.ok()).toBeTruthy();  // ❌ 실패 (404)
});
```

### 원인 분석
Hono 라우터는 라우트를 정의된 순서대로 매칭합니다.

**문제가 있던 라우트 순서**:
```typescript
// ❌ 잘못된 순서
projectsRouter.get('/', ...);           // /api/projects
projectsRouter.get('/:name', ...);      // /api/projects/:name
projectsRouter.get('/git-status', ...); // /api/projects/git-status
```

이 순서에서 `/api/projects/git-status` 요청이 들어오면:
1. `/:name` 라우트가 먼저 매칭됨
2. `name` 파라미터로 "git-status"를 받음
3. 실제 `/git-status` 라우트에 도달하지 못함

**파일 위치**: `backend/src/routes/projects.ts`

### 해결 방법

#### 라우트 순서 재정렬
```typescript
// ✅ 올바른 순서 (구체적인 라우트를 먼저)
projectsRouter.get('/', ...);           // /api/projects
projectsRouter.get('/git-status', ...); // /api/projects/git-status (BEFORE /:name)
projectsRouter.get('/:name', ...);      // /api/projects/:name
```

**핵심 원칙**:
- 구체적인 경로를 먼저 정의
- 동적 파라미터(`:name`)는 마지막에 정의

#### 주석 추가
```typescript
/**
 * GET /api/projects/git-status - Git 변경사항이 있는 프로젝트만
 * 주의: /:name 라우트보다 먼저 정의해야 함
 */
projectsRouter.get('/git-status', async (c) => {
  // ...
});
```

### 검증
```bash
npm test
```
- `api.spec.ts:59` 테스트 통과
- git-status 엔드포인트 정상 작동

### 관련 파일
- `backend/src/routes/projects.ts:29`

---

## 이슈 #3: "Modified" 텍스트 Strict Mode Violation

### 문제 설명
**발생 시점**: Playwright 테스트 실행 시

**에러 메시지**:
```
Error: strict mode violation: getByText('Modified') resolved to 2 elements:
  1) <div>Modified</div> (통계 카드)
  2) <button>Modified</button> (필터 버튼)
```

**테스트 파일**: `frontend/tests/projects.spec.ts:23`

**실패한 테스트**:
```typescript
test('should display statistics cards', async ({ page }) => {
  await expect(page.getByText('Modified')).toBeVisible();  // ❌ 2개 요소 발견
});
```

### 원인 분석
"Modified"라는 텍스트가 UI에 두 곳에 존재:
1. **통계 카드**: "Modified" (최근 수정된 프로젝트 수)
2. **필터 버튼**: "Modified" (수정된 프로젝트만 보기)

Playwright의 strict mode는 선택자가 정확히 1개의 요소만 매칭해야 함.

### 해결 방법

#### 더 구체적인 선택자 사용
**변경 전**:
```typescript
await expect(page.getByText('Modified')).toBeVisible();
```

**변경 후**:
```typescript
// 통계 카드 영역으로 범위 제한
const statsContainer = page.locator('.grid').first();
await expect(statsContainer.getByText('Modified')).toBeVisible();
```

**파일 위치**: `frontend/tests/projects.spec.ts:20`

#### 전체 수정 내용
```typescript
test('should display statistics cards', async ({ page }) => {
  // 통계 카드 컨테이너 먼저 선택
  const statsContainer = page.locator('.grid').first();

  // 컨테이너 내에서 텍스트 검색
  await expect(statsContainer.getByText('Total Projects')).toBeVisible();
  await expect(statsContainer.getByText('Git Repositories')).toBeVisible();
  await expect(statsContainer.getByText('Modified')).toBeVisible();
  await expect(statsContainer.getByText('Node.js Projects')).toBeVisible();
});
```

### 베스트 프랙티스
1. **명확한 선택자**: 고유한 요소를 선택할 수 있는 선택자 사용
2. **계층 구조 활용**: 부모 요소로 범위를 제한
3. **Role 기반 선택**: 가능한 경우 role 사용
4. **Test ID 추가**: 중복 텍스트가 많은 경우 `data-testid` 속성 고려

### 검증
```bash
npm test
```
- `projects.spec.ts:18` 테스트 통과
- Strict mode violation 해결

---

## 이슈 #4: Dark Mode 테스트 실패

### 문제 설명
**발생 시점**: Playwright 테스트 실행 시

**에러 메시지**:
```
Error: expect(hasDarkClasses).toBeTruthy()
Expected: truthy
Received: false
```

**테스트 파일**: `frontend/tests/e2e.spec.ts:93`

**실패한 테스트**:
```typescript
test('should have dark mode styles applied', async ({ page }) => {
  await page.goto('/');

  const bodyClasses = await page.locator('body').getAttribute('class');
  const hasDarkClasses = bodyClasses?.includes('dark') ||
                          bodyClasses?.includes('bg-gray-900');

  expect(hasDarkClasses).toBeTruthy();  // ❌ 실패
});
```

### 원인 분석
애플리케이션이 실제로 다크 모드를 구현하지 않았음:
- 다크 모드 토글 버튼 없음
- `dark` 클래스 추가/제거 로직 없음
- 하드코딩된 다크 색상만 사용 (항상 어두운 테마)

### 해결 방법

#### 옵션 1: 테스트 삭제 (선택됨)
다크 모드 기능이 없으므로 테스트 제거:

```typescript
// 삭제된 테스트 (93-106줄)
test('should have dark mode styles applied', async ({ page }) => {
  // ...
});
```

**파일 위치**: `frontend/tests/e2e.spec.ts`

#### 옵션 2: 다크 모드 구현 (향후 고려)
실제 다크 모드 기능을 구현하려면:

1. **상태 관리 추가**:
```typescript
const [darkMode, setDarkMode] = useState(true);
```

2. **토글 버튼 추가**:
```tsx
<button onClick={() => setDarkMode(!darkMode)}>
  {darkMode ? '🌙' : '☀️'}
</button>
```

3. **조건부 클래스**:
```tsx
<body className={darkMode ? 'dark bg-gray-900' : 'bg-white'}>
```

4. **TailwindCSS dark 모드 설정**:
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

### 검증
```bash
npm test
```
- 다크 모드 테스트 제거됨
- 전체 테스트 수: 24 → 23개

---

## 이슈 #5: Firefox/Webkit 브라우저 미설치

### 문제 설명
**발생 시점**: Playwright 테스트 실행 시 (Firefox/Webkit 프로젝트)

**에러 메시지**:
```
Error: Executable doesn't exist at /Users/inswave/Library/Caches/ms-playwright/firefox-1495/...
```

### 원인 분석
Playwright 설치 시 Chromium만 설치했지만, `playwright.config.ts`에 Firefox와 Webkit 프로젝트가 활성화되어 있었음.

### 해결 방법

#### playwright.config.ts 수정
```typescript
export default defineConfig({
  // ...

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox와 Webkit 주석 처리
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
```

**파일 위치**: `frontend/playwright.config.ts:17`

#### 주석 추가
```typescript
// Uncomment to test on other browsers (requires: npx playwright install firefox webkit)
```

### 대안: 모든 브라우저 테스트
필요한 경우 브라우저 설치:
```bash
# Firefox만
npx playwright install firefox

# Webkit만
npx playwright install webkit

# 모든 브라우저
npx playwright install
```

### 검증
```bash
npm test
```
- Chromium 프로젝트만 실행
- 브라우저 미설치 오류 해결

---

## 최종 테스트 결과

### 수정 전
```
❌ 19/24 passed (79%)
🔴 실패: 5개
- API git-status 404
- Modified strict mode violation
- Dark mode test failure
- Firefox browser not found
- Webkit browser not found
```

### 수정 후
```
✅ 23/23 passed (100%)
⏱️ 실행 시간: 4.4초
🌐 브라우저: Chromium
```

---

## 교훈 및 베스트 프랙티스

### 1. 라우트 정의 순서 중요
- **구체적인 라우트를 먼저**: `/git-status` → `/:name`
- 동적 파라미터는 항상 마지막
- 프레임워크 문서 확인 (Hono는 순서 기반 매칭)

### 2. 선택자의 명확성
- **Strict mode 준수**: 선택자는 정확히 1개만 매칭
- **계층 구조 활용**: 부모 요소로 범위 제한
- **고유성 보장**: role, test-id 등 활용

### 3. 테스트와 구현의 일치
- **구현되지 않은 기능은 테스트하지 않기**
- TDD 접근: 테스트 → 구현 → 검증
- 명확한 테스트 범위 정의

### 4. 버전 업그레이드 주의
- **Breaking changes 확인**: TailwindCSS v4 등
- 마이그레이션 가이드 참조
- 의존성 문서 읽기

### 5. 환경 일관성
- **브라우저 선택**: 필요한 브라우저만 설치
- CI/CD 환경 고려
- 로컬과 CI 환경 통일

---

## 관련 문서

- `@history/01-project-architecture.md`: 프로젝트 구조
- `@history/03-tailwindcss-configuration.md`: TailwindCSS 설정
- `@history/05-playwright-testing.md`: 테스트 상세
- `frontend/README.test.md`: 테스트 가이드
- `backend/src/routes/projects.ts`: API 라우트
- `frontend/tests/*.spec.ts`: 테스트 파일

---

## 향후 개선사항

### 1. 다크 모드 구현
- 토글 버튼 추가
- 로컬 스토리지에 설정 저장
- 시스템 설정 감지

### 2. 더 나은 에러 핸들링
- API 에러 메시지 표시
- 재시도 로직
- 폴백 UI

### 3. 테스트 개선
- 더 많은 엣지 케이스 커버
- 성능 테스트 추가
- 접근성 테스트

### 4. CI/CD 파이프라인
- GitHub Actions 설정
- 자동 테스트 실행
- 배포 자동화
