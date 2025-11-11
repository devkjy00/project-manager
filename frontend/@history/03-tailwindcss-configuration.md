# TailwindCSS v4 설정 및 이슈 해결

## 개요
프로젝트에서 TailwindCSS v4를 사용하면서 PostCSS 플러그인 관련 이슈가 발생했고, 이를 해결한 과정입니다.

## TailwindCSS v4 변경사항

### 주요 변경점
TailwindCSS v4부터 PostCSS 플러그인이 별도 패키지로 분리되었습니다.

- **v3 이하**: `tailwindcss` 패키지에 PostCSS 플러그인 포함
- **v4 이상**: `@tailwindcss/postcss` 패키지 별도 설치 필요

## 발생한 이슈

### 에러 메시지
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package, please update your configuration.
```

### 에러 원인
`postcss.config.js`에서 `tailwindcss` 플러그인을 직접 사용하려고 했지만, v4부터는 `@tailwindcss/postcss` 패키지를 사용해야 함.

## 해결 방법

### 1. @tailwindcss/postcss 패키지 설치

```bash
npm install -D @tailwindcss/postcss
```

**설치된 버전**: 최신 버전

### 2. postcss.config.js 수정

**변경 전**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**변경 후**:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**파일 위치**: `frontend/postcss.config.js`

### 3. index.css 수정

**변경 전** (v3 문법):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**변경 후** (v4 문법):
```css
@import "tailwindcss";
```

**파일 위치**: `frontend/src/index.css`

### 4. 추가 스타일
```css
@import "tailwindcss";

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

## TailwindCSS v4 주요 기능

### 1. 성능 개선
- 빌드 속도 향상
- 더 작은 CSS 번들 크기

### 2. 새로운 문법
- `@import` 기반 설정
- 더 간결한 설정 파일

### 3. 호환성
- PostCSS 8+ 필수
- Vite와 완벽 호환

## 프로젝트에서 사용한 TailwindCSS 클래스

### 레이아웃
- `container`, `mx-auto`: 중앙 정렬 컨테이너
- `flex`, `grid`: 레이아웃 시스템
- `gap-*`: 간격 설정

### 색상 (다크 테마)
- `bg-gray-900`: 배경색
- `text-white`, `text-gray-300`: 텍스트 색상
- `bg-blue-600`: 액센트 색상

### 반응형
- `md:*`, `lg:*`: 브레이크포인트
- Grid 시스템: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### 인터랙션
- `hover:*`: 호버 효과
- `transition-all`: 부드러운 전환
- `cursor-pointer`: 커서 스타일

## 관련 파일

- `frontend/postcss.config.js`: PostCSS 설정
- `frontend/src/index.css`: TailwindCSS 임포트 및 전역 스타일
- `frontend/package.json`: TailwindCSS 및 관련 패키지 의존성
- `frontend/vite.config.ts`: Vite 빌드 설정

## 참고 문서

- [TailwindCSS v4 공식 문서](https://tailwindcss.com/docs)
- [PostCSS 플러그인 마이그레이션 가이드](https://tailwindcss.com/docs/upgrade-guide)
