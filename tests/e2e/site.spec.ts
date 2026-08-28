import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page explains and demonstrates the product', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Color Status Labeler/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
  const dashboard = page.locator('.dashboard');
  await expect(dashboard.locator('.added-label')).toHaveCount(3);
  await page.getByRole('switch', { name: 'Show labels' }).uncheck();
  await expect(dashboard).toHaveClass(/labels-off/);
  await expect(page.locator('a[download]').first()).toHaveAttribute('href', /color-status-labeler-chrome\.zip/);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('mobile layout does not overflow and legal pages are present', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms');
});

test('the landing guide remains available offline after the first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Stop guessing');
  await expect(page.locator('#offline-note')).toBeVisible();
  await context.setOffline(false);
});
