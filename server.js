#!/usr/bin/env node

/**
 * 프로젝트 관리 웹 대시보드 서버
 * Project Manager Web Dashboard Server
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = 3000;

// 프로젝트 루트 디렉토리 (상위 디렉토리)
const PROJECT_ROOT = path.join(__dirname, '..');

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

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

  if (fs.existsSync(path.join(dir, 'Cargo.toml'))) {
    types.push('Rust');
  }

  if (fs.existsSync(path.join(dir, 'go.mod'))) {
    types.push('Go');
  }

  if (fs.existsSync(path.join(dir, 'Gemfile'))) {
    types.push('Ruby');
  }

  if (fs.existsSync(path.join(dir, 'composer.json'))) {
    types.push('PHP');
  }

  return types.length > 0 ? types : ['Unknown'];
}

/**
 * Git 상태 확인
 */
function getGitStatus(dir) {
  const gitDir = path.join(dir, '.git');

  if (!fs.existsSync(gitDir)) {
    return {
      hasGit: false,
      branch: null,
      changes: 0,
      ahead: 0,
      behind: 0,
      status: 'No Git',
    };
  }

  try {
    const branch = execSync('git branch --show-current', {
      cwd: dir,
      encoding: 'utf8',
    }).trim();

    const statusOutput = execSync('git status --porcelain', {
      cwd: dir,
      encoding: 'utf8',
    });
    const changes = statusOutput.split('\n').filter((line) => line.trim()).length;

    let ahead = 0;
    let behind = 0;

    try {
      execSync('git remote update', { cwd: dir, stdio: 'ignore' });

      ahead = parseInt(
        execSync('git rev-list --count @{u}..HEAD', {
          cwd: dir,
          encoding: 'utf8',
        }).trim()
      );

      behind = parseInt(
        execSync('git rev-list --count HEAD..@{u}', {
          cwd: dir,
          encoding: 'utf8',
        }).trim()
      );
    } catch {}

    return {
      hasGit: true,
      branch: branch || 'unknown',
      changes,
      ahead,
      behind,
      status: changes > 0 ? 'modified' : 'clean',
    };
  } catch (error) {
    return {
      hasGit: true,
      branch: 'error',
      changes: 0,
      ahead: 0,
      behind: 0,
      status: 'error',
    };
  }
}

/**
 * 마지막 수정 시간
 */
function getLastModified(dir) {
  try {
    const stat = fs.statSync(dir);
    const daysAgo = Math.floor((Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24));

    if (daysAgo === 0) return { text: 'Today', days: 0 };
    if (daysAgo === 1) return { text: 'Yesterday', days: 1 };
    return { text: `${daysAgo} days ago`, days: daysAgo };
  } catch {
    return { text: 'Unknown', days: -1 };
  }
}

/**
 * README.md 읽기
 */
function readReadme(dir) {
  const readmePath = path.join(dir, 'README.md');

  if (fs.existsSync(readmePath)) {
    try {
      const content = fs.readFileSync(readmePath, 'utf8');
      // 첫 500자만 가져오기 (요약)
      const preview = content.substring(0, 500);
      return {
        exists: true,
        content: content,
        preview: preview.length < content.length ? preview + '...' : preview,
      };
    } catch (error) {
      return { exists: false, content: null, preview: null };
    }
  }

  return { exists: false, content: null, preview: null };
}

/**
 * 프로젝트 정보 가져오기
 */
function getProjectInfo(projectPath, projectName) {
  return {
    name: projectName,
    path: projectPath,
    types: detectProjectType(projectPath),
    git: getGitStatus(projectPath),
    modified: getLastModified(projectPath),
    readme: readReadme(projectPath),
  };
}

/**
 * API: 모든 프로젝트 목록
 */
app.get('/api/projects', (req, res) => {
  try {
    const items = fs.readdirSync(PROJECT_ROOT);
    const projects = [];

    for (const item of items) {
      const fullPath = path.join(PROJECT_ROOT, item);

      // 숨김 폴더 및 project-manager 제외
      if (item.startsWith('.') || item === 'project-manager') {
        continue;
      }

      // 디렉토리만
      if (!fs.statSync(fullPath).isDirectory()) {
        continue;
      }

      projects.push(getProjectInfo(fullPath, item));
    }

    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * API: 특정 프로젝트 상세 정보
 */
app.get('/api/projects/:name', (req, res) => {
  try {
    const projectPath = path.join(PROJECT_ROOT, req.params.name);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = getProjectInfo(projectPath, req.params.name);

    // package.json 읽기
    let packageInfo = null;
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      } catch {}
    }

    res.json({ success: true, project, packageInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * API: Git 변경사항이 있는 프로젝트만
 */
app.get('/api/git-status', (req, res) => {
  try {
    const items = fs.readdirSync(PROJECT_ROOT);
    const modifiedProjects = [];

    for (const item of items) {
      const fullPath = path.join(PROJECT_ROOT, item);

      if (item.startsWith('.') || item === 'project-manager') continue;
      if (!fs.statSync(fullPath).isDirectory()) continue;

      const git = getGitStatus(fullPath);
      if (git.hasGit && git.changes > 0) {
        modifiedProjects.push({
          name: item,
          path: fullPath,
          git,
        });
      }
    }

    res.json({ success: true, projects: modifiedProjects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 메인 페이지
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * 서버 시작
 */
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  PROJECT DASHBOARD SERVER                      ║
╚════════════════════════════════════════════════════════════════╝

🚀 Server is running on: http://localhost:${PORT}

📊 Dashboard: http://localhost:${PORT}
📁 Projects Root: ${PROJECT_ROOT}

Press Ctrl+C to stop the server
  `);
});
