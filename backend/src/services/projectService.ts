import { readdir, stat, readFile, access } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import type { ProjectInfo, GitStatus, ModifiedInfo, ReadmeInfo, PackageInfo } from '../types/index.js';

const PROJECT_ROOT = join(process.cwd(), '..');

/**
 * 프로젝트 타입 감지
 */
export async function detectProjectType(dir: string): Promise<string[]> {
  const types: string[] = [];

  try {
    await access(join(dir, 'package.json'));
    types.push('Node.js');
  } catch {}

  try {
    const pythonFiles = ['requirements.txt', 'setup.py', 'pyproject.toml'];
    for (const file of pythonFiles) {
      try {
        await access(join(dir, file));
        types.push('Python');
        break;
      } catch {}
    }
  } catch {}

  try {
    const javaFiles = ['pom.xml', 'build.gradle', 'gradlew'];
    for (const file of javaFiles) {
      try {
        await access(join(dir, file));
        types.push('Java/Spring');
        break;
      } catch {}
    }
  } catch {}

  try {
    await access(join(dir, 'Cargo.toml'));
    types.push('Rust');
  } catch {}

  try {
    await access(join(dir, 'go.mod'));
    types.push('Go');
  } catch {}

  try {
    await access(join(dir, 'Gemfile'));
    types.push('Ruby');
  } catch {}

  try {
    await access(join(dir, 'composer.json'));
    types.push('PHP');
  } catch {}

  return types.length > 0 ? types : ['Unknown'];
}

/**
 * Git 상태 확인
 */
export function getGitStatus(dir: string): GitStatus {
  const gitDir = join(dir, '.git');

  try {
    require('fs').accessSync(gitDir);
  } catch {
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
export async function getLastModified(dir: string): Promise<ModifiedInfo> {
  try {
    const stats = await stat(dir);
    const daysAgo = Math.floor((Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24));

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
export async function readReadme(dir: string): Promise<ReadmeInfo> {
  const readmePath = join(dir, 'README.md');

  try {
    const content = await readFile(readmePath, 'utf8');
    const preview = content.substring(0, 500);
    return {
      exists: true,
      content: content,
      preview: preview.length < content.length ? preview + '...' : preview,
    };
  } catch {
    return { exists: false, content: null, preview: null };
  }
}

/**
 * package.json 읽기
 */
export async function readPackageJson(dir: string): Promise<PackageInfo | null> {
  const packageJsonPath = join(dir, 'package.json');

  try {
    const content = await readFile(packageJsonPath, 'utf8');
    return JSON.parse(content) as PackageInfo;
  } catch {
    return null;
  }
}

/**
 * 프로젝트 정보 가져오기
 */
export async function getProjectInfo(projectPath: string, projectName: string): Promise<ProjectInfo> {
  const [types, git, modified, readme] = await Promise.all([
    detectProjectType(projectPath),
    Promise.resolve(getGitStatus(projectPath)),
    getLastModified(projectPath),
    readReadme(projectPath),
  ]);

  return {
    name: projectName,
    path: projectPath,
    types,
    git,
    modified,
    readme,
  };
}

/**
 * 모든 프로젝트 목록 가져오기
 */
export async function getAllProjects(): Promise<ProjectInfo[]> {
  const items = await readdir(PROJECT_ROOT);
  const projects: ProjectInfo[] = [];

  for (const item of items) {
    const fullPath = join(PROJECT_ROOT, item);

    // 숨김 폴더 및 project-manager 제외
    if (item.startsWith('.') || item === 'project-manager') {
      continue;
    }

    // 디렉토리만
    try {
      const stats = await stat(fullPath);
      if (!stats.isDirectory()) {
        continue;
      }
    } catch {
      continue;
    }

    const projectInfo = await getProjectInfo(fullPath, item);
    projects.push(projectInfo);
  }

  return projects;
}

/**
 * Git 변경사항이 있는 프로젝트만
 */
export async function getModifiedProjects(): Promise<Array<{ name: string; path: string; git: GitStatus }>> {
  const items = await readdir(PROJECT_ROOT);
  const modifiedProjects: Array<{ name: string; path: string; git: GitStatus }> = [];

  for (const item of items) {
    const fullPath = join(PROJECT_ROOT, item);

    if (item.startsWith('.') || item === 'project-manager') continue;

    try {
      const stats = await stat(fullPath);
      if (!stats.isDirectory()) continue;
    } catch {
      continue;
    }

    const git = getGitStatus(fullPath);
    if (git.hasGit && git.changes > 0) {
      modifiedProjects.push({
        name: item,
        path: fullPath,
        git,
      });
    }
  }

  return modifiedProjects;
}
