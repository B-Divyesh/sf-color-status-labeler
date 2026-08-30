import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function contrastRatio(first: string, second: string) {
  const luminance = (color: string) => {
    const channels = (color.match(/[\d.]+/gu) ?? []).slice(0, 3).map(Number).map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

async function waitForControlledSiteWorker(page: Page) {
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    const activeWorker = registration.active;
    const controller = navigator.serviceWorker.controller;

    if (
      activeWorker?.state !== 'activated' ||
      !activeWorker.scriptURL.endsWith('/sw.js') ||
      controller?.scriptURL !== activeWorker.scriptURL
    ) return false;

    return (await caches.keys()).some((cacheName) => cacheName.startsWith('csl-site-'));
  });

  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return {
      active: registration.active?.scriptURL,
      controller: navigator.serviceWorker.controller?.scriptURL,
      cacheNames: await caches.keys()
    };
  });
}

test('@claim:color-vision-audience landing page names the intended user and demo action', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Color Status Labeler/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Label color-only dashboard statuses.');
  await expect(page.locator('.hero')).toContainText('people with color-vision deficiency');
  await expect(page.getByRole('link', { name: /Try it with sample data/ })).toHaveAttribute('href', '/demo/');
  const dashboard = page.locator('.dashboard');
  await expect(dashboard.locator('.added-label')).toHaveCount(3);
  await page.getByRole('switch', { name: 'Show labels' }).uncheck();
  await expect(dashboard).toHaveClass(/labels-off/);
  await expect(page.locator('a[download]').first()).toHaveAttribute('href', /^\/downloads\/color-status-labeler-chrome-[a-f0-9]{16}\.zip$/u);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('@claim:free-download demo links to the extension ZIP without a payment step and declares its response policy', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Read sample statuses');
  const archivePath = await page.locator('a[download]').first().getAttribute('href');
  expect(archivePath).toMatch(/^\/downloads\/color-status-labeler-chrome-[a-f0-9]{16}\.zip$/u);
  const response = await page.request.get(archivePath!);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/zip|octet-stream/);
  const archive = await response.body();
  expect(archive.subarray(0, 4).toString('ascii')).toBe('PK\x03\x04');

  const policy = await page.request.get('/staticwebapp.config.json');
  const config = await policy.json() as { navigationFallback: { exclude: string[] }; globalHeaders: Record<string, string>; responseOverrides: Record<string, { rewrite: string; statusCode: number }>; routes: Array<{ route: string; rewrite?: string; headers: Record<string, string> }> };
  expect(config.navigationFallback.exclude).toEqual(expect.arrayContaining(['/downloads/*', '/sw.js', '/404']));
  expect(config.globalHeaders['Content-Security-Policy']).toContain("worker-src 'self'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('geolocation=()');
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  expect(config.routes).toEqual(expect.arrayContaining([
    expect.objectContaining({ route: '/404', statusCode: 404 }),
    expect.objectContaining({ route: '/downloads/*', headers: expect.objectContaining({ 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="color-status-labeler-chrome.zip"', 'Cache-Control': 'public, max-age=31536000, immutable' }) }),
    expect.objectContaining({ route: '/assets/immutable/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }),
    expect.objectContaining({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=300, must-revalidate' } }),
    expect.objectContaining({ route: '/sw.js', headers: { 'Cache-Control': 'no-cache', 'Service-Worker-Allowed': '/' } })
  ]));
  expect(config.routes.some((route) => route.route === '/downloads/color-status-labeler-chrome.zip')).toBe(false);
  expect(config.routes.some((route) => route.rewrite?.includes('color-status-labeler-chrome.bin'))).toBe(false);
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is not here.');
});

test('@claim:cache-freshness a package-only release gets a new download URL instead of a stale Cache Storage ZIP after the worker controls the page', async ({ page }) => {
  await page.goto('/');
  const currentArchive = await page.locator('a[download]').first().getAttribute('href');
  expect(currentArchive).toMatch(/^\/downloads\/color-status-labeler-chrome-[a-f0-9]{16}\.zip$/u);

  const workerState = await waitForControlledSiteWorker(page);
  expect(workerState.active).toBe(workerState.controller);
  expect(workerState.cacheNames).toEqual(expect.arrayContaining([expect.stringMatching(/^csl-site-/u)]));

  const freshArchive = await page.evaluate(async (archivePath) => {
    const previousArchive = '/downloads/color-status-labeler-chrome.zip';
    const cacheName = (await caches.keys()).find((name) => name.startsWith('csl-site-'));
    if (!cacheName) throw new Error('The active site cache is unavailable.');
    const previousCache = await caches.open(cacheName);
    await previousCache.put(previousArchive, new Response('old extension package', {
      headers: { 'Content-Type': 'application/zip' }
    }));

    const previous = await (await previousCache.match(previousArchive))?.text();
    const response = await fetch(archivePath);
    const bytes = new Uint8Array(await response.arrayBuffer());
    return {
      previousArchive,
      previous,
      cacheName,
      status: response.status,
      signature: String.fromCharCode(...bytes.slice(0, 4)),
      size: bytes.length
    };
  }, currentArchive!);

  expect(freshArchive.previousArchive).not.toBe(currentArchive);
  expect(freshArchive.previous).toBe('old extension package');
  expect(freshArchive.cacheName).toMatch(/^csl-site-/u);
  expect(freshArchive.status).toBe(200);
  expect(freshArchive.signature).toBe('PK\x03\x04');
  expect(freshArchive.size).toBeGreaterThan(1_000);
});

test('every route has canonical, social, Twitter, theme, and Apple touch metadata with a 1200 by 630 product image', async ({ page }) => {
  const routeMetadata = [
    ['/', 'https://color-status-labeler.sociobot.in/'],
    ['/demo/', 'https://color-status-labeler.sociobot.in/demo/'],
    ['/privacy/', 'https://color-status-labeler.sociobot.in/privacy/'],
    ['/terms/', 'https://color-status-labeler.sociobot.in/terms/'],
    ['/404.html', 'https://color-status-labeler.sociobot.in/404.html']
  ] as const;
  const socialImage = 'https://color-status-labeler.sociobot.in/assets/color-status-labeler-social.jpg';
  for (const [path, canonical] of routeMetadata) {
    await page.goto(path);
    const title = await page.title();
    expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#F6F0DE');
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(canonical);
    expect(await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')).toBe('/icon/apple-touch-icon.png');
    expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('website');
    expect(await page.locator('meta[property="og:site_name"]').getAttribute('content')).toBe('Color Status Labeler');
    expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBe(title);
    expect(await page.locator('meta[property="og:description"]').getAttribute('content')).not.toBeNull();
    expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(canonical);
    expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toBe(socialImage);
    expect(await page.locator('meta[property="og:image:width"]').getAttribute('content')).toBe('1200');
    expect(await page.locator('meta[property="og:image:height"]').getAttribute('content')).toBe('630');
    expect(await page.locator('meta[property="og:image:alt"]').getAttribute('content')).not.toBeNull();
    expect(await page.locator('meta[name="twitter:card"]').getAttribute('content')).toBe('summary_large_image');
    expect(await page.locator('meta[name="twitter:title"]').getAttribute('content')).toBe(title);
    expect(await page.locator('meta[name="twitter:description"]').getAttribute('content')).not.toBeNull();
    expect(await page.locator('meta[name="twitter:image"]').getAttribute('content')).toBe(socialImage);
    expect(await page.locator('meta[name="twitter:image:alt"]').getAttribute('content')).not.toBeNull();
  }
  const imageResponse = await page.request.get('/assets/color-status-labeler-social.jpg');
  expect(imageResponse.ok()).toBe(true);
  expect(imageResponse.headers()['content-type']).toContain('image/jpeg');
  expect(await page.evaluate(async () => {
    const image = new Image();
    image.src = '/assets/color-status-labeler-social.jpg';
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  })).toEqual({ width: 1200, height: 630 });
  const appleTouchResponse = await page.request.get('/icon/apple-touch-icon.png');
  expect(appleTouchResponse.ok()).toBe(true);
  expect(appleTouchResponse.headers()['content-type']).toContain('image/png');
});

test('mobile layout does not overflow, including 200% text enlargement, and legal pages are present', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const overflow = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const clipped = [...document.querySelectorAll<HTMLElement>('header *, main *, footer *')]
      .filter((element) => {
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0
          && (bounds.left < -1 || bounds.right > viewportWidth + 1);
      })
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          element: element.tagName.toLowerCase(),
          text: (element.textContent ?? '').trim().replace(/\s+/gu, ' ').slice(0, 80),
          left: bounds.left,
          right: bounds.right
        };
      });
    return { clientWidth: viewportWidth, scrollWidth: document.documentElement.scrollWidth, clipped };
  });
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  expect(overflow.clipped).toEqual([]);

  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms');
});

test('demo, legal, and not-found routes have no serious or critical axe findings', async ({ page }) => {
  for (const path of ['/demo/', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('@claim:demo-sandbox the sample is one click, isolated, resettable, and leaves demo mode', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Try it with sample data/ }).click();
  await expect(page).toHaveURL(/\/demo\/$/u);
  await expect(page.getByText('Demo — sample data, nothing is saved', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible();

  await page.getByLabel('Sample status', { exact: true }).selectOption('waiting');
  await page.getByLabel('Status label', { exact: true }).fill('Queued');
  await page.getByRole('radio', { name: 'Bars' }).check();
  await page.getByRole('button', { name: 'Apply sample label' }).click();
  await expect(page.locator('[data-demo-status="waiting"] [data-demo-label]')).toHaveText('Queued');
  expect(await page.evaluate(() => ({ keys: Object.keys(localStorage), value: localStorage.getItem('demo:color-status-labeler:sample-v1') }))).toEqual({
    keys: ['demo:color-status-labeler:sample-v1'],
    value: expect.stringContaining('Queued')
  });
  await page.reload();
  await expect(page.locator('[data-demo-status="waiting"] [data-demo-label]')).toHaveText('Queued');
  await page.getByRole('button', { name: 'Reset demo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-demo-status="waiting"] [data-demo-label]')).toHaveText('Waiting');
  expect(await page.evaluate(() => localStorage.getItem('demo:color-status-labeler:sample-v1'))).toBeNull();

  await page.getByLabel('Status label', { exact: true }).fill('Temporary');
  await page.getByRole('button', { name: 'Apply sample label' }).click();
  await page.getByRole('link', { name: 'Start for real' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/$/u);
  expect(await page.evaluate(() => localStorage.getItem('demo:color-status-labeler:sample-v1'))).toBeNull();

  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo\/$/u);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  for (const target of [
    page.getByRole('button', { name: 'Reset demo' }),
    page.getByRole('link', { name: 'Start for real' })
  ]) {
    const box = await target.boundingBox();
    expect(box, 'demo control must have a rendered box').not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('@claim:no-account the demo has no account flow, cookies, or third-party requests', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requestOrigins = new Set<string>();
  page.on('request', (request) => {
    if (request.url().startsWith('http')) requestOrigins.add(new URL(request.url()).origin);
  });
  try {
    await page.goto('/demo/', { waitUntil: 'networkidle' });
    expect([...requestOrigins]).toEqual(['http://127.0.0.1:4173']);
    expect(await context.cookies()).toEqual([]);
    await expect(page.getByRole('textbox', { name: /email|password|sign in/i })).toHaveCount(0);
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  } finally {
    await context.close();
  }
});

test('reported focus indicators and mobile navigation targets meet their visual thresholds', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  for (const target of [
    page.getByRole('link', { name: 'Color Status Labeler home' }),
    page.locator('.site-footer').getByRole('link', { name: 'Privacy' }),
    page.locator('.site-footer').getByRole('link', { name: 'Terms' })
  ]) {
    const box = await target.boundingBox();
    expect(box, 'navigation target must have a rendered box').not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  for (const [target, surface] of [
    [page.getByRole('switch', { name: 'Show labels' }), page.locator('.demo-section')],
    [page.locator('.final-cta').getByRole('link', { name: /Download the extension/ }), page.locator('.final-cta')]
  ] as const) {
    await target.focus();
    const outline = await target.evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.outlineColor, width: Number.parseFloat(style.outlineWidth) };
    });
    const background = await surface.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(outline.width).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(outline.color, background)).toBeGreaterThanOrEqual(3);
  }
});

test('@claim:offline-demo the sample guide remains available offline after its first visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('/demo/');
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
      expect.objectContaining({ url: '/demo/', ok: true })
    ]));
    expect(shellRequestsSucceed.some(({ url, ok }) => ok && /^\/assets\/immutable\/main-[\w-]+\.js$/u.test(url))).toBe(true);
    expect(shellRequestsSucceed.every(({ ok }) => ok)).toBe(true);
    await page.reload();
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Read sample statuses');
    await expect(page.locator('#offline-note')).toBeVisible();
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});
