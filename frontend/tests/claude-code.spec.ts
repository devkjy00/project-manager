import { test, expect } from '@playwright/test';

test.describe('Claude Code Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should switch to Claude Code tab', async ({ page }) => {
    // Click Claude Code tab
    await page.getByRole('button', { name: 'Claude Code' }).click();

    // Check if Claude Code tab is active
    const claudeTab = page.getByRole('button', { name: 'Claude Code' });
    await expect(claudeTab).toHaveClass(/bg-blue-600/);
  });

  test('should display iframe when Claude Code tab is active', async ({ page }) => {
    // Click Claude Code tab
    await page.getByRole('button', { name: 'Claude Code' }).click();

    // Wait for iframe to load
    await page.waitForTimeout(1000);

    // Check if iframe exists
    const iframe = page.frameLocator('#claude-code-iframe');
    await expect(iframe.locator('body')).toBeAttached({ timeout: 10000 });
  });

  test('should hide Projects content when Claude Code tab is active', async ({ page }) => {
    // Click Claude Code tab
    await page.getByRole('button', { name: 'Claude Code' }).click();

    // Projects filters should not be visible
    await expect(page.getByRole('button', { name: 'All' })).not.toBeVisible();
    await expect(page.getByText('Total Projects')).not.toBeVisible();
  });

  test('should switch back to Projects tab from Claude Code', async ({ page }) => {
    // Switch to Claude Code
    await page.getByRole('button', { name: 'Claude Code' }).click();
    await page.waitForTimeout(500);

    // Switch back to Projects
    await page.getByRole('button', { name: 'Projects' }).click();

    // Check if Projects tab is active
    const projectsTab = page.getByRole('button', { name: 'Projects' });
    await expect(projectsTab).toHaveClass(/bg-blue-600/);

    // Projects content should be visible again
    await expect(page.getByText('Total Projects')).toBeVisible();
  });

  test('should have correct iframe source URL', async ({ page }) => {
    // Click Claude Code tab
    await page.getByRole('button', { name: 'Claude Code' }).click();

    // Check iframe src attribute
    const iframe = page.locator('#claude-code-iframe');
    await expect(iframe).toHaveAttribute('src', 'http://localhost:8081');
  });

  test('should have proper iframe permissions', async ({ page }) => {
    // Click Claude Code tab
    await page.getByRole('button', { name: 'Claude Code' }).click();

    // Check iframe allow attribute
    const iframe = page.locator('#claude-code-iframe');
    await expect(iframe).toHaveAttribute('allow', /clipboard-read/);
    await expect(iframe).toHaveAttribute('allow', /clipboard-write/);
  });
});
