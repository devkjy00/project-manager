# Playwright E2E 테스트

## 개요
Playwright를 사용하여 프로젝트의 모든 주요 기능에 대한 End-to-End 테스트를 작성했습니다.

## Playwright 설치 및 설정

### 1. 패키지 설치
```bash
npm install -D @playwright/test playwright
```

**설치된 버전**:
- `@playwright/test`: 최신 버전
- `playwright`: 최신 버전

### 2. 브라우저 설치
```bash
# Chromium만 설치 (프로젝트에서 사용)
npx playwright install chromium

# 모든 브라우저 설치 (선택사항)
npx playwright install
```

## Playwright 설정

### playwright.config.ts

**파일 위치**: `frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox와 Webkit은 필요시 추가 가능
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 주요 설정 설명

| 설정 | 값 | 설명 |
|------|-----|------|
| `testDir` | `./tests` | 테스트 파일 위치 |
| `fullyParallel` | `true` | 모든 테스트 병렬 실행 |
| `retries` | CI: 2, Local: 0 | 실패 시 재시도 횟수 |
| `workers` | CI: 1, Local: auto | 동시 실행 워커 수 |
| `reporter` | `html` | HTML 리포트 생성 |
| `baseURL` | `http://localhost:5173` | 기본 URL |
| `trace` | `on-first-retry` | 첫 재시도 시 trace 기록 |
| `screenshot` | `only-on-failure` | 실패 시만 스크린샷 |

## 테스트 구조

### 테스트 파일 구성

```
frontend/tests/
├── projects.spec.ts      # Projects 탭 기능 테스트 (8개)
├── claude-code.spec.ts   # Claude Code 탭 기능 테스트 (6개)
├── e2e.spec.ts           # E2E 사용자 시나리오 테스트 (4개)
└── api.spec.ts           # API 엔드포인트 테스트 (5개)
```

**총 테스트 수**: 23개

## 테스트 상세

### 1. projects.spec.ts (8개 테스트)

**테스트 항목**:
1. ✅ 대시보드 헤더 표시
2. ✅ Projects 탭 기본 활성화
3. ✅ 통계 카드 표시 (Total Projects, Git Repositories, Modified, Node.js Projects)
4. ✅ 필터 버튼 표시
5. ✅ 프로젝트 타입별 필터링
6. ✅ 필터 옵션 전환
7. ✅ 프로젝트 새로고침
8. ✅ 프로젝트 카드 표시

**주요 코드**:
```typescript
test('should display statistics cards', async ({ page }) => {
  const statsContainer = page.locator('.grid').first();
  await expect(statsContainer.getByText('Total Projects')).toBeVisible();
  await expect(statsContainer.getByText('Git Repositories')).toBeVisible();
  await expect(statsContainer.getByText('Modified')).toBeVisible();
  await expect(statsContainer.getByText('Node.js Projects')).toBeVisible();
});
```

### 2. claude-code.spec.ts (6개 테스트)

**테스트 항목**:
1. ✅ Claude Code 탭으로 전환
2. ✅ Claude Code 탭 활성화 시 iframe 표시
3. ✅ Claude Code 탭 활성화 시 Projects 컨텐츠 숨김
4. ✅ Projects 탭으로 다시 전환
5. ✅ iframe의 올바른 URL 확인
6. ✅ iframe 권한 확인

**주요 코드**:
```typescript
test('should display iframe when Claude Code tab is active', async ({ page }) => {
  await page.getByRole('button', { name: 'Claude Code' }).click();

  const iframe = page.locator('#claude-code-iframe');
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute('src', 'http://localhost:8081');
});
```

### 3. e2e.spec.ts (4개 테스트)

**테스트 항목**:
1. ✅ 완전한 사용자 여정 (대시보드 → 필터 → 새로고침 → 탭 전환)
2. ✅ 탭 간 상태 유지 (필터 선택 후 탭 전환해도 유지)
3. ✅ 반응형 UI 요소
4. ✅ 백엔드 unavailable 시 에러 처리

**주요 코드**:
```typescript
test('navigation between tabs preserves state', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);

  // Python 필터 선택
  await page.getByRole('button', { name: 'Python' }).click();
  await expect(page.getByRole('button', { name: 'Python' })).toHaveClass(/bg-blue-600/);

  // Claude Code 탭으로 전환
  await page.getByRole('button', { name: 'Claude Code' }).click();
  await page.waitForTimeout(500);

  // Projects 탭으로 복귀
  await page.getByRole('button', { name: 'Projects' }).click();

  // Python 필터가 여전히 활성화되어 있는지 확인
  await expect(page.getByRole('button', { name: 'Python' })).toHaveClass(/bg-blue-600/);
});
```

### 4. api.spec.ts (5개 테스트)

**테스트 항목**:
1. ✅ API에서 프로젝트 가져오기
2. ✅ 유효한 프로젝트 구조 반환
3. ✅ API 에러 처리
4. ✅ CORS 헤더 확인
5. ✅ git-status 엔드포인트

**주요 코드**:
```typescript
test('should fetch git-status endpoint', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/projects/git-status');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data).toHaveProperty('success');
  expect(data).toHaveProperty('projects');
  expect(Array.isArray(data.projects)).toBeTruthy();
});
```

## 테스트 실행

### 기본 명령어

```bash
# 모든 테스트 실행 (헤드리스)
npm test

# UI 모드 (추천)
npm run test:ui

# 브라우저 보이기 모드
npm run test:headed

# 디버그 모드
npm run test:debug

# 리포트 보기
npm run test:report
```

### package.json 스크립트

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report"
  }
}
```

## 테스트 결과

### 최종 결과
```
✅ 23/23 passed (100%)
⏱️ 실행 시간: 4.4초
🌐 브라우저: Chromium
```

### 테스트 커버리지

| 카테고리 | 테스트 수 | 통과율 |
|----------|-----------|--------|
| Projects Tab | 8 | 100% |
| Claude Code Tab | 6 | 100% |
| E2E Flow | 4 | 100% |
| API Endpoints | 5 | 100% |
| **전체** | **23** | **100%** |

## HTML 리포트

### 리포트 확인
```bash
npx playwright show-report --port 9324
```

**URL**: http://localhost:9324

### 리포트 내용
- 각 테스트의 실행 시간
- 통과/실패 상태
- 스크린샷 (실패 시)
- Trace 파일 (재시도 시)
- 상세 로그

## 베스트 프랙티스

### 1. 선택자 우선순위
```typescript
// ✅ 좋음: Role 기반 선택자
page.getByRole('button', { name: 'Click me' })

// ✅ 좋음: Text 선택자 (고유한 경우)
page.getByText('Unique Text')

// ⚠️ 주의: CSS 선택자 (변경에 취약)
page.locator('.button-class')

// ❌ 나쁨: XPath (유지보수 어려움)
page.locator('//button[@class="..."]')
```

### 2. 대기 처리
```typescript
// ✅ 좋음: 자동 대기
await expect(page.getByText('Loading')).toBeVisible();

// ⚠️ 주의: 타임아웃 (불안정)
await page.waitForTimeout(1000);

// ✅ 좋음: 특정 조건 대기
await page.waitForSelector('.loaded');
```

### 3. 테스트 독립성
```typescript
// ✅ 각 테스트는 독립적
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('test 1', async ({ page }) => {
  // 테스트 1
});

test('test 2', async ({ page }) => {
  // 테스트 2 (test 1에 의존하지 않음)
});
```

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - uses: actions/setup-node@v3
      with:
        node-version: 20

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium

    - name: Run Playwright tests
      run: npm test

    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## 디버깅

### 1. VS Code 확장
- **Playwright Test for VS Code** 설치
- 에디터에서 직접 테스트 실행
- 브레이크포인트 설정
- 스텝 바이 스텝 디버깅

### 2. Trace Viewer
```bash
# Trace 파일 보기
npx playwright show-trace test-results/*/trace.zip
```

### 3. 디버그 모드
```bash
# 브라우저 DevTools와 함께 실행
PWDEBUG=1 npm test
```

## 관련 파일

- `frontend/playwright.config.ts`: Playwright 설정
- `frontend/tests/*.spec.ts`: 테스트 파일
- `frontend/package.json`: 테스트 스크립트
- `frontend/README.test.md`: 테스트 가이드 문서
- `playwright-report/`: HTML 리포트 (생성됨)
- `test-results/`: 테스트 결과 및 artifacts (생성됨)

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Debugging Guide](https://playwright.dev/docs/debug)
