# Testing Guide

## Playwright E2E 테스트

이 프로젝트는 Playwright를 사용하여 End-to-End 테스트를 작성했습니다.

## 테스트 구조

```
frontend/
├── tests/
│   ├── projects.spec.ts      # Projects 탭 기능 테스트
│   ├── claude-code.spec.ts   # Claude Code 탭 기능 테스트
│   ├── e2e.spec.ts           # E2E 사용자 시나리오 테스트
│   └── api.spec.ts           # API 엔드포인트 테스트
└── playwright.config.ts      # Playwright 설정
```

## 테스트 실행

### 기본 테스트 (헤드리스 모드)
```bash
npm test
```

### UI 모드로 테스트 (추천 - 디버깅에 유용)
```bash
npm run test:ui
```

### 브라우저를 보면서 테스트
```bash
npm run test:headed
```

### 디버그 모드
```bash
npm run test:debug
```

### 테스트 리포트 보기
```bash
npm run test:report
```

### 특정 브라우저만 테스트
```bash
# Chromium만
npx playwright test --project=chromium

# Firefox만
npx playwright test --project=firefox

# Webkit만
npx playwright test --project=webkit
```

### 특정 파일만 테스트
```bash
npx playwright test tests/projects.spec.ts
```

## 브라우저 설치

처음 실행 시 Playwright 브라우저를 설치해야 합니다:

```bash
# 모든 브라우저 설치
npx playwright install

# Chromium만 설치
npx playwright install chromium

# Firefox만 설치
npx playwright install firefox

# Webkit만 설치
npx playwright install webkit
```

## 테스트 카테고리

### 1. Projects 탭 테스트 (`projects.spec.ts`)
- 대시보드 헤더 표시
- Projects 탭 기본 활성화
- 통계 카드 표시 (Total Projects, Git Repositories, Modified, Node.js Projects)
- 필터 버튼 표시 및 작동
- 프로젝트 타입별 필터링
- 프로젝트 새로고침

### 2. Claude Code 탭 테스트 (`claude-code.spec.ts`)
- 탭 전환 기능
- iframe 로드
- Projects 콘텐츠 숨김
- iframe URL 및 권한 확인

### 3. E2E 테스트 (`e2e.spec.ts`)
- 전체 사용자 여정 시나리오
- 탭 간 상태 유지
- 반응형 UI 요소
- 에러 처리
- 다크 모드 스타일

### 4. API 테스트 (`api.spec.ts`)
- `/api/projects` 엔드포인트
- 프로젝트 데이터 구조 검증
- CORS 헤더 확인
- 에러 처리

## 테스트 결과

현재 테스트 통과율:
- **Chromium**: 19/24 통과 (79%)
- **Firefox**: 브라우저 설치 필요
- **Webkit**: 브라우저 설치 필요

### 알려진 이슈

1. **git-status API 엔드포인트** (backend/src/routes/projects.ts:56)
   - 라우트 경로 수정 필요: `/git-status` → `/projects/git-status`

2. **"Modified" 텍스트 중복**
   - 통계 카드와 필터 버튼 모두에 "Modified" 텍스트가 있어 strict mode violation 발생
   - 더 구체적인 선택자 사용 권장

3. **다크 모드 감지**
   - 현재 앱이 다크 모드 클래스를 사용하지 않음
   - 필요시 다크 모드 구현 또는 테스트 제거

## CI/CD 통합

GitHub Actions 예시:

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

## 테스트 작성 가이드

### 새 테스트 추가하기

1. `tests/` 디렉토리에 `*.spec.ts` 파일 생성
2. Playwright test 작성:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // 테스트 코드
    await expect(page.getByRole('button', { name: 'Click me' })).toBeVisible();
  });
});
```

### 베스트 프랙티스

1. **명확한 테스트 이름** - 테스트가 무엇을 검증하는지 명확하게
2. **독립적인 테스트** - 각 테스트는 독립적으로 실행 가능해야 함
3. **적절한 대기** - `page.waitForTimeout()` 대신 `waitForSelector()` 사용
4. **페이지 객체 패턴** - 복잡한 UI는 Page Object로 추상화
5. **스크린샷/비디오** - 실패 시 자동으로 저장됨 (`test-results/`)

## 디버깅

### VS Code 확장
Playwright Test for VS Code 확장을 설치하면:
- 에디터에서 직접 테스트 실행
- 디버그 브레이크포인트 설정
- 테스트 결과를 에디터에서 확인

### 브라우저 DevTools
```bash
PWDEBUG=1 npm test
```

### Trace Viewer
실패한 테스트의 trace를 확인:
```bash
npx playwright show-trace test-results/*/trace.zip
```

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
