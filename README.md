# 프로젝트 관리 웹 대시보드

모든 프로젝트를 한눈에 관리할 수 있는 웹 기반 대시보드입니다.

## 기능

- 📊 **프로젝트 개요**: 전체 프로젝트 수, Git 저장소 수, 수정된 프로젝트 등 한눈에 확인
- 🔍 **필터링**: 프로젝트 타입별(Node.js, Python, Java 등) 필터링
- 📝 **Git 상태**: 각 프로젝트의 Git 브랜치, 변경사항, 동기화 상태 확인
- 🎨 **아름다운 UI**: 그라데이션 배경과 카드 기반 레이아웃
- 🔄 **자동 새로고침**: 30초마다 자동으로 프로젝트 상태 업데이트

## 설치

```bash
# 의존성 설치
npm install
```

## 실행

```bash
# 서버 시작
npm start

# 또는 개발 모드 (자동 재시작)
npm run dev
```

서버가 시작되면 브라우저에서 **http://localhost:3000** 으로 접속하세요.

## 화면 구성

### 상단 통계
- Total Projects: 전체 프로젝트 수
- Git Repositories: Git이 초기화된 프로젝트 수
- Modified: 변경사항이 있는 프로젝트 수
- Node.js Projects: Node.js 프로젝트 수

### 필터
- **All**: 모든 프로젝트
- **Node.js**: Node.js 프로젝트만
- **Python**: Python 프로젝트만
- **Java**: Java/Spring 프로젝트만
- **Modified**: Git 변경사항이 있는 프로젝트만
- **No Git**: Git이 없는 프로젝트만

### 프로젝트 카드
각 프로젝트 카드에는 다음 정보가 표시됩니다:
- 프로젝트 이름
- 프로젝트 타입 (Node.js, Python, Java 등)
- Git 상태 (Clean, Modified, No Git)
- 현재 브랜치
- 원격 저장소와의 동기화 상태 (ahead/behind)
- 마지막 수정 시간

## API 엔드포인트

- `GET /api/projects` - 모든 프로젝트 목록
- `GET /api/projects/:name` - 특정 프로젝트 상세 정보
- `GET /api/git-status` - Git 변경사항이 있는 프로젝트만

## 기술 스택

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Git Integration**: child_process (execSync)
