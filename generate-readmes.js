#!/usr/bin/env node // Node.js 실행 환경 지정

/**
 * README.md 자동 생성 스크립트
 * 각 프로젝트를 스캔하고 README.md가 없으면 자동으로 생성
 */

const fs = require('fs'); // 파일 시스템 모듈 로드
const path = require('path'); // 경로 처리 모듈 로드
const { execSync } = require('child_process'); // 동기식 명령 실행 모듈 로드

const PROJECT_ROOT = path.join(__dirname, '..'); // 프로젝트 루트 디렉토리 경로 설정

/**
 * 프로젝트 타입 감지
 */
function detectProjectType(dir) { // 프로젝트 디렉토리의 타입을 감지하는 함수
  const types = []; // 프로젝트 타입을 저장할 배열 초기화

  if (fs.existsSync(path.join(dir, 'package.json'))) { // package.json 파일 존재 여부 확인
    types.push('Node.js'); // Node.js 프로젝트로 분류
  }

  if ( // Python 관련 파일 존재 여부 확인
    fs.existsSync(path.join(dir, 'requirements.txt')) || // requirements.txt 확인
    fs.existsSync(path.join(dir, 'setup.py')) || // setup.py 확인
    fs.existsSync(path.join(dir, 'pyproject.toml')) // pyproject.toml 확인
  ) {
    types.push('Python'); // Python 프로젝트로 분류
  }

  if ( // Java/Spring 관련 파일 존재 여부 확인
    fs.existsSync(path.join(dir, 'pom.xml')) || // Maven 설정 파일 확인
    fs.existsSync(path.join(dir, 'build.gradle')) || // Gradle 설정 파일 확인
    fs.existsSync(path.join(dir, 'gradlew')) // Gradle Wrapper 확인
  ) {
    types.push('Java/Spring'); // Java/Spring 프로젝트로 분류
  }

  return types.length > 0 ? types : ['Unknown']; // 타입이 있으면 반환, 없으면 Unknown 반환
}

/**
 * package.json에서 정보 가져오기
 */
function getPackageInfo(dir) { // package.json 파일의 정보를 읽는 함수
  const packagePath = path.join(dir, 'package.json'); // package.json 파일 경로 생성
  if (fs.existsSync(packagePath)) { // package.json 파일이 존재하면
    try { // 파일 읽기 시도
      return JSON.parse(fs.readFileSync(packagePath, 'utf8')); // JSON 파싱 후 반환
    } catch {} // 파싱 실패 시 무시
  }
  return null; // 파일이 없거나 파싱 실패 시 null 반환
}

/**
 * Git 정보 가져오기
 */
function getGitInfo(dir) { // Git 저장소의 정보를 가져오는 함수
  try { // Git 명령 실행 시도
    const hasGit = fs.existsSync(path.join(dir, '.git')); // .git 폴더 존재 여부 확인
    if (!hasGit) return null; // Git 저장소가 아니면 null 반환

    const branch = execSync('git branch --show-current', { // 현재 브랜치 이름 가져오기
      cwd: dir, // 작업 디렉토리 설정
      encoding: 'utf8', // 인코딩 UTF-8 설정
    }).trim(); // 앞뒤 공백 제거

    return { branch }; // 브랜치 정보 객체 반환
  } catch { // Git 명령 실행 실패 시
    return null; // null 반환
  }
}

/**
 * README 템플릿 생성
 */
function generateReadmeTemplate(projectName, projectPath) { // README.md 내용을 생성하는 함수
  const types = detectProjectType(projectPath); // 프로젝트 타입 감지
  const packageInfo = getPackageInfo(projectPath); // package.json 정보 가져오기
  const gitInfo = getGitInfo(projectPath); // Git 정보 가져오기

  let readme = `# ${projectName}\n\n`; // README 헤더 추가

  // 프로젝트 설명
  if (packageInfo && packageInfo.description) { // package.json에 설명이 있으면
    readme += `${packageInfo.description}\n\n`; // package.json의 설명 사용
  } else { // 설명이 없으면
    readme += `${projectName} 프로젝트입니다.\n\n`; // 기본 설명 사용
  }

  // 프로젝트 타입
  readme += `## 📋 프로젝트 정보\n\n`; // 프로젝트 정보 섹션 헤더
  readme += `- **타입**: ${types.join(', ')}\n`; // 프로젝트 타입 목록

  if (gitInfo) { // Git 정보가 있으면
    readme += `- **Git 브랜치**: ${gitInfo.branch}\n`; // Git 브랜치 이름 추가
  }

  readme += `\n`; // 빈 줄 추가

  // 기술 스택
  readme += `## 🛠 기술 스택\n\n`; // 기술 스택 섹션 헤더

  if (types.includes('Node.js') && packageInfo) { // Node.js 프로젝트이고 package.json이 있으면
    readme += `### Dependencies\n\n`; // 의존성 서브섹션 헤더
    if (packageInfo.dependencies) { // 의존성 목록이 있으면
      Object.keys(packageInfo.dependencies).forEach((dep) => { // 각 의존성에 대해
        readme += `- ${dep}\n`; // 의존성 이름 추가
      });
    }
    readme += `\n`; // 빈 줄 추가
  }

  if (types.includes('Python')) { // Python 프로젝트이면
    readme += `- Python\n`; // Python 추가
    const reqPath = path.join(projectPath, 'requirements.txt'); // requirements.txt 경로
    if (fs.existsSync(reqPath)) { // requirements.txt 파일이 있으면
      readme += `- requirements.txt 참조\n`; // requirements.txt 참조 안내
    }
    readme += `\n`; // 빈 줄 추가
  }

  if (types.includes('Java/Spring')) { // Java/Spring 프로젝트이면
    readme += `- Java\n`; // Java 추가
    readme += `- Spring Boot\n`; // Spring Boot 추가
    if (fs.existsSync(path.join(projectPath, 'build.gradle'))) { // Gradle 파일이 있으면
      readme += `- Gradle\n`; // Gradle 추가
    } else if (fs.existsSync(path.join(projectPath, 'pom.xml'))) { // Maven 파일이 있으면
      readme += `- Maven\n`; // Maven 추가
    }
    readme += `\n`; // 빈 줄 추가
  }

  // 설치 및 실행
  readme += `## 🚀 설치 및 실행\n\n`; // 설치 및 실행 섹션 헤더

  if (types.includes('Node.js')) { // Node.js 프로젝트이면
    readme += `### Node.js 프로젝트\n\n`; // Node.js 서브섹션
    readme += `\`\`\`bash\n`; // 코드 블록 시작
    readme += `# 의존성 설치\n`; // 설치 명령어 설명
    readme += `npm install\n\n`; // npm install 명령어
    readme += `# 개발 서버 실행\n`; // 개발 서버 실행 설명
    readme += `npm run dev\n\n`; // npm run dev 명령어
    readme += `# 프로덕션 빌드\n`; // 빌드 설명
    readme += `npm run build\n`; // npm run build 명령어
    readme += `\`\`\`\n\n`; // 코드 블록 종료
  }

  if (types.includes('Python')) { // Python 프로젝트이면
    readme += `### Python 프로젝트\n\n`; // Python 서브섹션
    readme += `\`\`\`bash\n`; // 코드 블록 시작
    readme += `# 가상환경 생성\n`; // 가상환경 생성 설명
    readme += `python -m venv venv\n\n`; // venv 생성 명령어
    readme += `# 가상환경 활성화\n`; // 활성화 설명
    readme += `source venv/bin/activate  # Mac/Linux\n`; // Mac/Linux 활성화 명령어
    readme += `# venv\\Scripts\\activate  # Windows\n\n`; // Windows 활성화 명령어
    readme += `# 의존성 설치\n`; // 의존성 설치 설명
    readme += `pip install -r requirements.txt\n\n`; // pip install 명령어
    readme += `# 실행\n`; // 실행 설명
    readme += `python main.py\n`; // Python 실행 명령어
    readme += `\`\`\`\n\n`; // 코드 블록 종료
  }

  if (types.includes('Java/Spring')) { // Java/Spring 프로젝트이면
    readme += `### Java/Spring 프로젝트\n\n`; // Java/Spring 서브섹션
    readme += `\`\`\`bash\n`; // 코드 블록 시작
    if (fs.existsSync(path.join(projectPath, 'gradlew'))) { // Gradle Wrapper가 있으면
      readme += `# Gradle로 실행\n`; // Gradle 실행 설명
      readme += `./gradlew bootRun\n\n`; // Gradle bootRun 명령어
      readme += `# 빌드\n`; // 빌드 설명
      readme += `./gradlew build\n`; // Gradle build 명령어
    } else { // Maven 프로젝트이면
      readme += `# Maven으로 실행\n`; // Maven 실행 설명
      readme += `mvn spring-boot:run\n\n`; // Maven run 명령어
      readme += `# 빌드\n`; // 빌드 설명
      readme += `mvn clean package\n`; // Maven package 명령어
    }
    readme += `\`\`\`\n\n`; // 코드 블록 종료
  }

  // 프로젝트 구조 (선택사항)
  readme += `## 📁 프로젝트 구조\n\n`; // 프로젝트 구조 섹션 헤더
  readme += `\`\`\`\n`; // 코드 블록 시작
  readme += `${projectName}/\n`; // 프로젝트 루트
  readme += `├── README.md\n`; // README 파일

  if (types.includes('Node.js')) { // Node.js 프로젝트이면
    readme += `├── package.json\n`; // package.json 파일
    readme += `├── src/\n`; // src 디렉토리
    readme += `└── node_modules/\n`; // node_modules 디렉토리
  }

  if (types.includes('Python')) { // Python 프로젝트이면
    readme += `├── requirements.txt\n`; // requirements.txt 파일
    readme += `├── main.py\n`; // main.py 파일
    readme += `└── venv/\n`; // venv 디렉토리
  }

  if (types.includes('Java/Spring')) { // Java/Spring 프로젝트이면
    readme += `├── src/\n`; // src 디렉토리
    readme += `│   ├── main/\n`; // main 디렉토리
    readme += `│   └── test/\n`; // test 디렉토리
    readme += `└── build.gradle (or pom.xml)\n`; // 빌드 설정 파일
  }

  readme += `\`\`\`\n\n`; // 코드 블록 종료

  // 기여 및 라이선스
  readme += `## 📝 참고사항\n\n`; // 참고사항 섹션 헤더
  readme += `이 README는 자동으로 생성되었습니다. 프로젝트에 맞게 수정해주세요.\n\n`; // 자동 생성 안내

  readme += `---\n\n`; // 구분선
  readme += `*Generated by Project Dashboard*\n`; // 생성 도구 표시

  return readme; // 완성된 README 내용 반환
}

/**
 * 메인 실행
 */
function main() { // 스크립트의 메인 실행 함수
  console.log('🔍 프로젝트 스캔 중...\n'); // 스캔 시작 메시지

  const items = fs.readdirSync(PROJECT_ROOT); // 프로젝트 루트의 모든 항목 읽기
  let created = 0; // 생성된 README 개수 카운터
  let skipped = 0; // 스킵된 프로젝트 개수 카운터

  for (const item of items) { // 각 항목에 대해 반복
    const fullPath = path.join(PROJECT_ROOT, item); // 항목의 전체 경로 생성

    // project-manager와 숨김 폴더 제외
    if (item.startsWith('.') || item === 'project-manager') { // 숨김 파일이나 자기 자신 폴더면
      continue; // 건너뛰기
    }

    // 디렉토리만 처리
    if (!fs.statSync(fullPath).isDirectory()) { // 디렉토리가 아니면
      continue; // 건너뛰기
    }

    const readmePath = path.join(fullPath, 'README.md'); // README.md 파일 경로 생성

    if (fs.existsSync(readmePath)) { // README.md 파일이 이미 존재하면
      console.log(`⏭️  ${item}: README.md 이미 존재 (스킵)`); // 스킵 메시지 출력
      skipped++; // 스킵 카운터 증가
    } else { // README.md 파일이 없으면
      console.log(`✨ ${item}: README.md 생성 중...`); // 생성 시작 메시지
      const readme = generateReadmeTemplate(item, fullPath); // README 템플릿 생성
      fs.writeFileSync(readmePath, readme, 'utf8'); // README.md 파일로 저장
      console.log(`✅ ${item}: README.md 생성 완료`); // 생성 완료 메시지
      created++; // 생성 카운터 증가
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`); // 구분선
  console.log(`📊 결과 요약`); // 결과 요약 헤더
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`); // 구분선
  console.log(`✅ 생성됨: ${created}개`); // 생성된 개수 출력
  console.log(`⏭️  스킵됨: ${skipped}개`); // 스킵된 개수 출력
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`); // 구분선
}

main(); // 메인 함수 실행
