#!/usr/bin/env node // Node.js 실행 환경 지정

/**
 * 프로젝트 관리 웹 대시보드 서버
 * Project Manager Web Dashboard Server
 */

const express = require('express'); // Express 웹 프레임워크 로드
const path = require('path'); // 경로 처리 모듈 로드
const fs = require('fs'); // 파일 시스템 모듈 로드
const { execSync } = require('child_process'); // 동기식 명령 실행 모듈 로드

const app = express(); // Express 애플리케이션 인스턴스 생성
const PORT = 3000; // 서버 포트 번호 설정

// 프로젝트 루트 디렉토리 (상위 디렉토리)
const PROJECT_ROOT = path.join(__dirname, '..'); // 현재 디렉토리의 상위 폴더 경로 설정

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더의 정적 파일 제공 설정

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

  if (fs.existsSync(path.join(dir, 'Cargo.toml'))) { // Cargo.toml 파일 존재 여부 확인
    types.push('Rust'); // Rust 프로젝트로 분류
  }

  if (fs.existsSync(path.join(dir, 'go.mod'))) { // go.mod 파일 존재 여부 확인
    types.push('Go'); // Go 프로젝트로 분류
  }

  if (fs.existsSync(path.join(dir, 'Gemfile'))) { // Gemfile 파일 존재 여부 확인
    types.push('Ruby'); // Ruby 프로젝트로 분류
  }

  if (fs.existsSync(path.join(dir, 'composer.json'))) { // composer.json 파일 존재 여부 확인
    types.push('PHP'); // PHP 프로젝트로 분류
  }

  return types.length > 0 ? types : ['Unknown']; // 타입이 있으면 반환, 없으면 Unknown 반환
}

/**
 * Git 상태 확인
 */
function getGitStatus(dir) { // 프로젝트의 Git 상태를 확인하는 함수
  const gitDir = path.join(dir, '.git'); // .git 디렉토리 경로 생성

  if (!fs.existsSync(gitDir)) { // .git 폴더가 없으면
    return { // Git이 없는 상태 반환
      hasGit: false, // Git 저장소 아님
      branch: null, // 브랜치 정보 없음
      changes: 0, // 변경사항 0개
      ahead: 0, // 원격보다 앞선 커밋 0개
      behind: 0, // 원격보다 뒤진 커밋 0개
      status: 'No Git', // 상태: Git 없음
    };
  }

  try { // Git 명령 실행 시도
    const branch = execSync('git branch --show-current', { // 현재 브랜치 이름 가져오기
      cwd: dir, // 작업 디렉토리 설정
      encoding: 'utf8', // 인코딩 UTF-8 설정
    }).trim(); // 앞뒤 공백 제거

    const statusOutput = execSync('git status --porcelain', { // Git 상태를 간단한 형식으로 가져오기
      cwd: dir, // 작업 디렉토리 설정
      encoding: 'utf8', // 인코딩 UTF-8 설정
    });
    const changes = statusOutput.split('\n').filter((line) => line.trim()).length; // 변경된 파일 개수 계산

    let ahead = 0; // 원격보다 앞선 커밋 초기화
    let behind = 0; // 원격보다 뒤진 커밋 초기화

    try { // 원격 저장소 정보 가져오기 시도
      execSync('git remote update', { cwd: dir, stdio: 'ignore' }); // 원격 저장소 정보 업데이트

      ahead = parseInt( // 원격보다 앞선 커밋 수 계산
        execSync('git rev-list --count @{u}..HEAD', { // upstream부터 HEAD까지 커밋 개수
          cwd: dir, // 작업 디렉토리 설정
          encoding: 'utf8', // 인코딩 UTF-8 설정
        }).trim() // 앞뒤 공백 제거
      );

      behind = parseInt( // 원격보다 뒤진 커밋 수 계산
        execSync('git rev-list --count HEAD..@{u}', { // HEAD부터 upstream까지 커밋 개수
          cwd: dir, // 작업 디렉토리 설정
          encoding: 'utf8', // 인코딩 UTF-8 설정
        }).trim() // 앞뒤 공백 제거
      );
    } catch {} // 원격 저장소 정보 가져오기 실패 시 무시

    return { // Git 상태 정보 반환
      hasGit: true, // Git 저장소임
      branch: branch || 'unknown', // 브랜치 이름 (없으면 unknown)
      changes, // 변경사항 개수
      ahead, // 원격보다 앞선 커밋 수
      behind, // 원격보다 뒤진 커밋 수
      status: changes > 0 ? 'modified' : 'clean', // 변경사항이 있으면 modified, 없으면 clean
    };
  } catch (error) { // Git 명령 실행 실패 시
    return { // 에러 상태 반환
      hasGit: true, // Git 저장소임 (폴더는 있음)
      branch: 'error', // 브랜치: 에러
      changes: 0, // 변경사항 0개
      ahead: 0, // 원격보다 앞선 커밋 0개
      behind: 0, // 원격보다 뒤진 커밋 0개
      status: 'error', // 상태: 에러
    };
  }
}

/**
 * 마지막 수정 시간
 */
function getLastModified(dir) { // 디렉토리의 마지막 수정 시간을 계산하는 함수
  try { // 파일 정보 읽기 시도
    const stat = fs.statSync(dir); // 디렉토리 상태 정보 가져오기
    const daysAgo = Math.floor((Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24)); // 수정된 지 며칠 지났는지 계산

    if (daysAgo === 0) return { text: 'Today', days: 0 }; // 오늘 수정됨
    if (daysAgo === 1) return { text: 'Yesterday', days: 1 }; // 어제 수정됨
    return { text: `${daysAgo} days ago`, days: daysAgo }; // N일 전 수정됨
  } catch { // 파일 정보 읽기 실패 시
    return { text: 'Unknown', days: -1 }; // 알 수 없음 반환
  }
}

/**
 * README.md 읽기
 */
function readReadme(dir) { // README.md 파일을 읽는 함수
  const readmePath = path.join(dir, 'README.md'); // README.md 파일 경로 생성

  if (fs.existsSync(readmePath)) { // README.md 파일이 존재하면
    try { // 파일 읽기 시도
      const content = fs.readFileSync(readmePath, 'utf8'); // README.md 내용 읽기
      // 첫 500자만 가져오기 (요약)
      const preview = content.substring(0, 500); // 처음 500자만 추출
      return { // README 정보 반환
        exists: true, // 파일 존재함
        content: content, // 전체 내용
        preview: preview.length < content.length ? preview + '...' : preview, // 미리보기 (500자 이상이면 ... 추가)
      };
    } catch (error) { // 파일 읽기 실패 시
      return { exists: false, content: null, preview: null }; // 실패 정보 반환
    }
  }

  return { exists: false, content: null, preview: null }; // 파일 없음 정보 반환
}

/**
 * 프로젝트 정보 가져오기
 */
function getProjectInfo(projectPath, projectName) { // 프로젝트의 모든 정보를 수집하는 함수
  return { // 프로젝트 정보 객체 반환
    name: projectName, // 프로젝트 이름
    path: projectPath, // 프로젝트 경로
    types: detectProjectType(projectPath), // 프로젝트 타입 감지
    git: getGitStatus(projectPath), // Git 상태 정보
    modified: getLastModified(projectPath), // 마지막 수정 시간
    readme: readReadme(projectPath), // README 정보
  };
}

/**
 * API: 모든 프로젝트 목록
 */
app.get('/api/projects', (req, res) => { // GET /api/projects 엔드포인트 정의
  try { // 예외 처리 시작
    const items = fs.readdirSync(PROJECT_ROOT); // 프로젝트 루트의 모든 항목 읽기
    const projects = []; // 프로젝트 목록을 저장할 배열 초기화

    for (const item of items) { // 각 항목에 대해 반복
      const fullPath = path.join(PROJECT_ROOT, item); // 항목의 전체 경로 생성

      // 숨김 폴더 및 project-manager 제외
      if (item.startsWith('.') || item === 'project-manager') { // 숨김 파일이나 자기 자신 폴더면
        continue; // 건너뛰기
      }

      // 디렉토리만
      if (!fs.statSync(fullPath).isDirectory()) { // 디렉토리가 아니면
        continue; // 건너뛰기
      }

      projects.push(getProjectInfo(fullPath, item)); // 프로젝트 정보 수집 후 배열에 추가
    }

    res.json({ success: true, projects }); // 성공 응답과 프로젝트 목록 반환
  } catch (error) { // 예외 발생 시
    res.status(500).json({ success: false, error: error.message }); // 500 에러와 메시지 반환
  }
});

/**
 * API: 특정 프로젝트 상세 정보
 */
app.get('/api/projects/:name', (req, res) => { // GET /api/projects/:name 엔드포인트 정의
  try { // 예외 처리 시작
    const projectPath = path.join(PROJECT_ROOT, req.params.name); // URL 파라미터로부터 프로젝트 경로 생성

    if (!fs.existsSync(projectPath)) { // 프로젝트 경로가 존재하지 않으면
      return res.status(404).json({ success: false, error: 'Project not found' }); // 404 에러 반환
    }

    const project = getProjectInfo(projectPath, req.params.name); // 프로젝트 정보 수집

    // package.json 읽기
    let packageInfo = null; // package.json 정보 초기화
    const packageJsonPath = path.join(projectPath, 'package.json'); // package.json 경로 생성
    if (fs.existsSync(packageJsonPath)) { // package.json 파일이 존재하면
      try { // 파일 읽기 시도
        packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')); // JSON 파싱
      } catch {} // 파싱 실패 시 무시
    }

    res.json({ success: true, project, packageInfo }); // 성공 응답과 프로젝트 정보, package.json 정보 반환
  } catch (error) { // 예외 발생 시
    res.status(500).json({ success: false, error: error.message }); // 500 에러와 메시지 반환
  }
});

/**
 * API: Git 변경사항이 있는 프로젝트만
 */
app.get('/api/git-status', (req, res) => { // GET /api/git-status 엔드포인트 정의
  try { // 예외 처리 시작
    const items = fs.readdirSync(PROJECT_ROOT); // 프로젝트 루트의 모든 항목 읽기
    const modifiedProjects = []; // 변경된 프로젝트 목록을 저장할 배열 초기화

    for (const item of items) { // 각 항목에 대해 반복
      const fullPath = path.join(PROJECT_ROOT, item); // 항목의 전체 경로 생성

      if (item.startsWith('.') || item === 'project-manager') continue; // 숨김 파일이나 자기 자신 폴더면 건너뛰기
      if (!fs.statSync(fullPath).isDirectory()) continue; // 디렉토리가 아니면 건너뛰기

      const git = getGitStatus(fullPath); // Git 상태 정보 가져오기
      if (git.hasGit && git.changes > 0) { // Git이 있고 변경사항이 있으면
        modifiedProjects.push({ // 변경된 프로젝트 배열에 추가
          name: item, // 프로젝트 이름
          path: fullPath, // 프로젝트 경로
          git, // Git 상태 정보
        });
      }
    }

    res.json({ success: true, projects: modifiedProjects }); // 성공 응답과 변경된 프로젝트 목록 반환
  } catch (error) { // 예외 발생 시
    res.status(500).json({ success: false, error: error.message }); // 500 에러와 메시지 반환
  }
});

/**
 * 메인 페이지
 */
app.get('/', (req, res) => { // GET / 엔드포인트 정의 (루트 경로)
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // index.html 파일 전송
});

/**
 * 서버 시작
 */
app.listen(PORT, () => { // 지정된 포트에서 서버 시작
  console.log(` // 서버 시작 메시지 출력
╔════════════════════════════════════════════════════════════════╗
║                  PROJECT DASHBOARD SERVER                      ║
╚════════════════════════════════════════════════════════════════╝

🚀 Server is running on: http://localhost:${PORT}

📊 Dashboard: http://localhost:${PORT}
📁 Projects Root: ${PROJECT_ROOT}

Press Ctrl+C to stop the server
  `);
});
