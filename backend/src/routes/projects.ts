import { Hono } from 'hono';
import { getAllProjects, getProjectInfo, getModifiedProjects, readPackageJson } from '../services/projectService.js';
import { join } from 'path';

const PROJECT_ROOT = process.env.PROJECTS_ROOT || join(process.cwd(), '..');

export const projectsRouter = new Hono();

/**
 * GET /api/projects - 모든 프로젝트 목록
 */
projectsRouter.get('/', async (c) => {
  try {
    const projects = await getAllProjects();
    return c.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

/**
 * GET /api/projects/git-status - Git 변경사항이 있는 프로젝트만
 * 주의: /:name 라우트보다 먼저 정의해야 함
 */
projectsRouter.get('/git-status', async (c) => {
  try {
    const projects = await getModifiedProjects();
    return c.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching git status:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

/**
 * GET /api/projects/:name - 특정 프로젝트 상세 정보
 */
projectsRouter.get('/:name', async (c) => {
  try {
    const projectName = c.req.param('name');
    const projectPath = join(PROJECT_ROOT, projectName);

    // 디렉토리 존재 확인
    try {
      await require('fs/promises').access(projectPath);
    } catch {
      return c.json({ success: false, error: 'Project not found' }, 404);
    }

    const project = await getProjectInfo(projectPath, projectName);
    const packageInfo = await readPackageJson(projectPath);

    return c.json({ success: true, project, packageInfo });
  } catch (error) {
    console.error('Error fetching project details:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});
