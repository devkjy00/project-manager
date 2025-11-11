import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('should fetch projects from API', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/projects');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('projects');
    expect(Array.isArray(data.projects)).toBeTruthy();
  });

  test('should return valid project structure', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/projects');
    const data = await response.json();

    if (data.projects.length > 0) {
      const project = data.projects[0];

      // Check required fields
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('path');
      expect(project).toHaveProperty('types');
      expect(project).toHaveProperty('git');
      expect(project).toHaveProperty('modified');

      // Check git object structure
      expect(project.git).toHaveProperty('hasGit');
      expect(project.git).toHaveProperty('branch');
      expect(project.git).toHaveProperty('changes');
      expect(project.git).toHaveProperty('status');

      // Check types is an array
      expect(Array.isArray(project.types)).toBeTruthy();
    }
  });

  test('should handle API errors gracefully', async ({ request }) => {
    // Request non-existent project
    const response = await request.get('http://localhost:3000/api/projects/non-existent-project-xyz');

    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data).toHaveProperty('error');
  });

  test('API should have CORS headers', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/projects');

    const headers = response.headers();
    // Hono's CORS middleware should add these headers
    expect(headers).toHaveProperty('access-control-allow-origin');
  });

  test('should fetch git-status endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/projects/git-status');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('projects');
    expect(Array.isArray(data.projects)).toBeTruthy();
  });
});
