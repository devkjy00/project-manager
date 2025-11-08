#!/usr/bin/env node

/**
 * README.md 자동 생성 스크립트
 * 각 프로젝트를 스캔하고 README.md가 없으면 자동으로 생성
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');

/**
 * 프로젝트 타입 감지
 */
function detectProjectType(dir) {
  const types = [];

  if (fs.existsSync(path.join(dir, 'package.json'))) {
    types.push('Node.js');
  }

  if (
    fs.existsSync(path.join(dir, 'requirements.txt')) ||
    fs.existsSync(path.join(dir, 'setup.py')) ||
    fs.existsSync(path.join(dir, 'pyproject.toml'))
  ) {
    types.push('Python');
  }

  if (
    fs.existsSync(path.join(dir, 'pom.xml')) ||
    fs.existsSync(path.join(dir, 'build.gradle')) ||
    fs.existsSync(path.join(dir, 'gradlew'))
  ) {
    types.push('Java/Spring');
  }

  return types.length > 0 ? types : ['Unknown'];
}

/**
 * package.json에서 정보 가져오기
 */
function getPackageInfo(dir) {
  const packagePath = path.join(dir, 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch {}
  }
  return null;
}

/**
 * Git 정보 가져오기
 */
function getGitInfo(dir) {
  try {
    const hasGit = fs.existsSync(path.join(dir, '.git'));
    if (!hasGit) return null;

    const branch = execSync('git branch --show-current', {
      cwd: dir,
      encoding: 'utf8',
    }).trim();

    return { branch };
  } catch {
    return null;
  }
}

/**
 * README 템플릿 생성
 */
function generateReadmeTemplate(projectName, projectPath) {
  const types = detectProjectType(projectPath);
  const packageInfo = getPackageInfo(projectPath);
  const gitInfo = getGitInfo(projectPath);

  let readme = `# ${projectName}\n\n`;

  // 프로젝트 설명
  if (packageInfo && packageInfo.description) {
    readme += `${packageInfo.description}\n\n`;
  } else {
    readme += `${projectName} 프로젝트입니다.\n\n`;
  }

  // 프로젝트 타입
  readme += `## 📋 프로젝트 정보\n\n`;
  readme += `- **타입**: ${types.join(', ')}\n`;

  if (gitInfo) {
    readme += `- **Git 브랜치**: ${gitInfo.branch}\n`;
  }

  readme += `\n`;

  // 기술 스택
  readme += `## 🛠 기술 스택\n\n`;

  if (types.includes('Node.js') && packageInfo) {
    readme += `### Dependencies\n\n`;
    if (packageInfo.dependencies) {
      Object.keys(packageInfo.dependencies).forEach((dep) => {
        readme += `- ${dep}\n`;
      });
    }
    readme += `\n`;
  }

  if (types.includes('Python')) {
    readme += `- Python\n`;
    const reqPath = path.join(projectPath, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      readme += `- requirements.txt 참조\n`;
    }
    readme += `\n`;
  }

  if (types.includes('Java/Spring')) {
    readme += `- Java\n`;
    readme += `- Spring Boot\n`;
    if (fs.existsSync(path.join(projectPath, 'build.gradle'))) {
      readme += `- Gradle\n`;
    } else if (fs.existsSync(path.join(projectPath, 'pom.xml'))) {
      readme += `- Maven\n`;
    }
    readme += `\n`;
  }

  // 설치 및 실행
  readme += `## 🚀 설치 및 실행\n\n`;

  if (types.includes('Node.js')) {
    readme += `### Node.js 프로젝트\n\n`;
    readme += `\`\`\`bash\n`;
    readme += `# 의존성 설치\n`;
    readme += `npm install\n\n`;
    readme += `# 개발 서버 실행\n`;
    readme += `npm run dev\n\n`;
    readme += `# 프로덕션 빌드\n`;
    readme += `npm run build\n`;
    readme += `\`\`\`\n\n`;
  }

  if (types.includes('Python')) {
    readme += `### Python 프로젝트\n\n`;
    readme += `\`\`\`bash\n`;
    readme += `# 가상환경 생성\n`;
    readme += `python -m venv venv\n\n`;
    readme += `# 가상환경 활성화\n`;
    readme += `source venv/bin/activate  # Mac/Linux\n`;
    readme += `# venv\\Scripts\\activate  # Windows\n\n`;
    readme += `# 의존성 설치\n`;
    readme += `pip install -r requirements.txt\n\n`;
    readme += `# 실행\n`;
    readme += `python main.py\n`;
    readme += `\`\`\`\n\n`;
  }

  if (types.includes('Java/Spring')) {
    readme += `### Java/Spring 프로젝트\n\n`;
    readme += `\`\`\`bash\n`;
    if (fs.existsSync(path.join(projectPath, 'gradlew'))) {
      readme += `# Gradle로 실행\n`;
      readme += `./gradlew bootRun\n\n`;
      readme += `# 빌드\n`;
      readme += `./gradlew build\n`;
    } else {
      readme += `# Maven으로 실행\n`;
      readme += `mvn spring-boot:run\n\n`;
      readme += `# 빌드\n`;
      readme += `mvn clean package\n`;
    }
    readme += `\`\`\`\n\n`;
  }

  // 프로젝트 구조 (선택사항)
  readme += `## 📁 프로젝트 구조\n\n`;
  readme += `\`\`\`\n`;
  readme += `${projectName}/\n`;
  readme += `├── README.md\n`;

  if (types.includes('Node.js')) {
    readme += `├── package.json\n`;
    readme += `├── src/\n`;
    readme += `└── node_modules/\n`;
  }

  if (types.includes('Python')) {
    readme += `├── requirements.txt\n`;
    readme += `├── main.py\n`;
    readme += `└── venv/\n`;
  }

  if (types.includes('Java/Spring')) {
    readme += `├── src/\n`;
    readme += `│   ├── main/\n`;
    readme += `│   └── test/\n`;
    readme += `└── build.gradle (or pom.xml)\n`;
  }

  readme += `\`\`\`\n\n`;

  // 기여 및 라이선스
  readme += `## 📝 참고사항\n\n`;
  readme += `이 README는 자동으로 생성되었습니다. 프로젝트에 맞게 수정해주세요.\n\n`;

  readme += `---\n\n`;
  readme += `*Generated by Project Dashboard*\n`;

  return readme;
}

/**
 * 메인 실행
 */
function main() {
  console.log('🔍 프로젝트 스캔 중...\n');

  const items = fs.readdirSync(PROJECT_ROOT);
  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const fullPath = path.join(PROJECT_ROOT, item);

    // project-manager와 숨김 폴더 제외
    if (item.startsWith('.') || item === 'project-manager') {
      continue;
    }

    // 디렉토리만 처리
    if (!fs.statSync(fullPath).isDirectory()) {
      continue;
    }

    const readmePath = path.join(fullPath, 'README.md');

    if (fs.existsSync(readmePath)) {
      console.log(`⏭️  ${item}: README.md 이미 존재 (스킵)`);
      skipped++;
    } else {
      console.log(`✨ ${item}: README.md 생성 중...`);
      const readme = generateReadmeTemplate(item, fullPath);
      fs.writeFileSync(readmePath, readme, 'utf8');
      console.log(`✅ ${item}: README.md 생성 완료`);
      created++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 결과 요약`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ 생성됨: ${created}개`);
  console.log(`⏭️  스킵됨: ${skipped}개`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main();
