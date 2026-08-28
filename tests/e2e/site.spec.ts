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

test('the deploy artifact contains a real extension ZIP and static-host routing policy', async ({ page }) => {
  const response = await page.request.get('/downloads/color-status-labeler-chrome.zip');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/zip|octet-stream/);
  expect((await response.body()).subarray(0, 4).toString('ascii')).toBe('PK\x03\x04');

  const policy = await page.request.get('/staticwebapp.config.json');
  const config = await policy.json() as { navigationFallback: { exclude: string[] }; globalHeaders: Record<string, string>; routes: Array<{ route: string; headers: Record<string, string> }> };
  expect(config.navigationFallback.exclude).toEqual(expect.arrayContaining(['/downloads/*', '/sw.js']));
  expect(config.globalHeaders['Content-Security-Policy']).toContain("worker-src 'self'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('geolocation=()');
  expect(config.routes).toEqual(expect.arrayContaining([
    expect.objectContaining({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }),
    expect.objectContaining({ route: '/sw.js', headers: { 'Cache-Control': 'no-cache', 'Service-Worker-Allowed': '/' } })
  ]));
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
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.active?.scriptURL.endsWith('/sw.js') ?? false;
  });
  await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.state)).toBe('activated');
  await expect.poll(() => page.evaluate(async () => [...await caches.keys()].some((key) => key.startsWith('csl-site-')))).toBe(true);
  const shellRequestsSucceed = await page.evaluate(async () => {
    const source = await (await fetch('/sw.js', { cache: 'no-store' })).text();
    const shell = JSON.parse(source.match(/const SHELL=(\[[^;]+\])/u)?.[1] ?? '[]') as string[];
    const results = await Promise.all(shell.map(async (url) => ({ url, ok: (await fetch(url)).ok })));
    return results;
  });
  expect(shellRequestsSucceed).toEqual(expect.arrayContaining([
    expect.objectContaining({ url: '/', ok: true }),
    expect.objectContaining({ url: '/assets/main-0anUPODu.js', ok: true })
  ]));
  expect(shellRequestsSucceed.every(({ ok }) => ok)).toBe(true);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Stop guessing');
  await expect(page.locator('#offline-note')).toBeVisible();
  await context.setOffline(false);
});
