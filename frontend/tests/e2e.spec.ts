import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flow', () => {
  test('complete user journey through the dashboard', async ({ page }) => {
    // 1. Navigate to the dashboard
    await page.goto('/');

    // 2. Verify dashboard loads
    await expect(page.getByRole('heading', { name: '📊 Project Dashboard' })).toBeVisible();

    // 3. Check initial statistics
    await expect(page.getByText('Total Projects')).toBeVisible();
    await page.waitForTimeout(1000);

    // 4. Try different filters
    await page.getByRole('button', { name: 'Node.js' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: 'Node.js' })).toHaveClass(/bg-blue-600/);

    await page.getByRole('button', { name: 'Modified' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: 'Modified' })).toHaveClass(/bg-blue-600/);

    // 5. Refresh projects
    await page.getByRole('button', { name: '🔄 Refresh' }).click();
    await page.waitForTimeout(1000);

    // 6. Switch to Claude Code tab
    await page.getByRole('button', { name: 'Claude Code' }).click();
    await expect(page.getByRole('button', { name: 'Claude Code' })).toHaveClass(/bg-blue-600/);

    // 7. Verify iframe is loaded
    const iframe = page.locator('#claude-code-iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', 'http://localhost:8081');

    // 8. Switch back to Projects
    await page.getByRole('button', { name: 'Projects' }).click();
    await expect(page.getByRole('button', { name: 'Projects' })).toHaveClass(/bg-blue-600/);

    // 9. Verify Projects content is back
    await expect(page.getByText('Total Projects')).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
  });

  test('navigation between tabs preserves state', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Select a specific filter in Projects tab
    await page.getByRole('button', { name: 'Python' }).click();
    await expect(page.getByRole('button', { name: 'Python' })).toHaveClass(/bg-blue-600/);

    // Switch to Claude Code
    await page.getByRole('button', { name: 'Claude Code' }).click();
    await page.waitForTimeout(500);

    // Switch back to Projects
    await page.getByRole('button', { name: 'Projects' }).click();

    // Verify the filter is still active (state preserved)
    await expect(page.getByRole('button', { name: 'Python' })).toHaveClass(/bg-blue-600/);
  });

  test('responsive UI elements', async ({ page }) => {
    await page.goto('/');

    // Check that all major UI elements are present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Claude Code' })).toBeVisible();

    // Check statistics cards layout
    const statsCards = page.locator('.grid > div').filter({ hasText: /Total Projects|Git Repositories|Modified|Node.js Projects/ });
    expect(await statsCards.count()).toBeGreaterThanOrEqual(4);
  });

  test('error handling when backend is unavailable', async ({ page, context }) => {
    // Block API requests to simulate backend being down
    await context.route('**/api/**', route => route.abort());

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should show error or empty state
    // The exact behavior depends on your error handling implementation
    const hasError = await page.getByText(/Error|failed|unavailable/i).isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/No projects found/i).isVisible().catch(() => false);

    expect(hasError || hasEmpty).toBeTruthy();
  });
});
