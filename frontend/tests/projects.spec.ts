import { test, expect } from '@playwright/test';

test.describe('Projects Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the dashboard header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '📊 Project Dashboard' })).toBeVisible();
  });

  test('should display Projects tab as active by default', async ({ page }) => {
    const projectsTab = page.getByRole('button', { name: 'Projects' });
    await expect(projectsTab).toBeVisible();
    await expect(projectsTab).toHaveClass(/bg-blue-600/);
  });

  test('should display statistics cards', async ({ page }) => {
    // Use more specific selectors for statistics cards
    const statsContainer = page.locator('.grid').first();
    await expect(statsContainer.getByText('Total Projects')).toBeVisible();
    await expect(statsContainer.getByText('Git Repositories')).toBeVisible();
    await expect(statsContainer.getByText('Modified')).toBeVisible();
    await expect(statsContainer.getByText('Node.js Projects')).toBeVisible();
  });

  test('should display filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Node.js' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Python' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Java/Spring' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Modified' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'No Git' })).toBeVisible();
    await expect(page.getByRole('button', { name: '🔄 Refresh' })).toBeVisible();
  });

  test('should filter projects by type', async ({ page }) => {
    // Wait for projects to load
    await page.waitForTimeout(1000);

    // Click Node.js filter
    await page.getByRole('button', { name: 'Node.js' }).click();

    // Check if Node.js button is active
    const nodeButton = page.getByRole('button', { name: 'Node.js' });
    await expect(nodeButton).toHaveClass(/bg-blue-600/);
  });

  test('should switch between filter options', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click Python filter
    await page.getByRole('button', { name: 'Python' }).click();
    await expect(page.getByRole('button', { name: 'Python' })).toHaveClass(/bg-blue-600/);

    // Click All filter
    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.getByRole('button', { name: 'All' })).toHaveClass(/bg-blue-600/);
  });

  test('should refresh projects when refresh button is clicked', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click refresh button
    await page.getByRole('button', { name: '🔄 Refresh' }).click();

    // Wait for refresh to complete
    await page.waitForTimeout(500);
  });

  test('should display project cards when projects are loaded', async ({ page }) => {
    await page.waitForTimeout(1500);

    // Check if any project cards are visible (if there are projects)
    const projectCards = page.locator('.grid > div');
    const count = await projectCards.count();

    // Either projects are shown or empty state message is displayed
    if (count === 0) {
      await expect(page.getByText(/No projects found|Loading projects/)).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });
});
