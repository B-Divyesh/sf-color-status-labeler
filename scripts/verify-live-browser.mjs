import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = new URL(process.argv[2] ?? 'https://color-status-labeler.sociobot.in/');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const contrastRatio = (first, second) => {
  const luminance = (color) => {
    const channels = (color.match(/[\d.]+/gu) ?? []).slice(0, 3).map(Number).map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const requestOrigins = new Set();
  const errors = [];
  page.on('request', (request) => {
    if (request.url().startsWith('http')) requestOrigins.add(new URL(request.url()).origin);
  });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  for (const path of ['/', '/demo/', '/privacy/', '/terms/']) {
    await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
    check(await page.locator('html').getAttribute('lang') === 'en', `${path} is missing lang=en.`);
    check(await page.locator('h1').count() === 1, `${path} does not have exactly one h1.`);
    check(await page.locator('main').count() === 1, `${path} does not have exactly one main landmark.`);
    const violations = await new AxeBuilder({ page }).analyze();
    check(!violations.violations.some((item) => ['serious', 'critical'].includes(item.impact ?? '')), `${path} has serious or critical axe findings.`);
  }

  await page.goto(base.href, { waitUntil: 'networkidle' });
  check((await page.locator('.hero').textContent())?.includes('people with color-vision deficiency'), 'first screen does not name people with color-vision deficiency.');
  check(await page.getByRole('link', { name: /Try it with sample data/ }).count() === 1, 'first screen has no Try it with sample data action.');
  for (const viewport of [{ width: 1365, height: 768 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    await page.goto(base.href, { waitUntil: 'networkidle' });
    for (const [target, name] of [
      [page.getByRole('link', { name: /Try it with sample data/ }), 'sample-data action'],
      [page.locator('.action-note'), 'sample outcome note']
    ]) {
      const box = await target.boundingBox();
      check(Boolean(box && box.y >= 0 && box.y + box.height <= viewport.height), `${name} is outside the cold ${viewport.width}x${viewport.height} viewport.`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base.href, { waitUntil: 'networkidle' });
  check(await page.getByRole('link', { name: 'Color-matching limits' }).count() === 1, 'the limits navigation label is vague or missing.');
  check(await page.getByRole('heading', { name: 'How labels stay readable and local' }).count() === 1, 'the feature section heading is vague or missing.');
  check(await page.getByRole('heading', { name: 'Does not change page controls' }).count() === 1, 'the page-control heading is vague or missing.');
  await page.keyboard.press('Tab');
  check(await page.locator('.skip-link').evaluate((element) => element === document.activeElement), 'keyboard Tab did not reach the skip link first.');
  const toggle = page.getByRole('switch', { name: 'Show labels' });
  await toggle.focus();
  await page.keyboard.press('Space');
  check(!(await toggle.isChecked()), 'Space did not toggle Show labels.');
  for (const [target, surface, name] of [
    [toggle, page.locator('.demo-section'), 'demo switch'],
    [page.locator('.final-cta').getByRole('link', { name: /Download the extension/ }), page.locator('.final-cta'), 'final download CTA']
  ]) {
    await target.focus();
    const outline = await target.evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.outlineColor, width: Number.parseFloat(style.outlineWidth) };
    });
    const background = await surface.evaluate((element) => getComputedStyle(element).backgroundColor);
    check(outline.width >= 3 && contrastRatio(outline.color, background) >= 3, `${name} focus indicator is below 3:1 contrast or 3px width.`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  check(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced-motion scrolling is not disabled.');
  check(errors.length === 0, `desktop page errors: ${errors.join(' | ')}`);
  check([...requestOrigins].every((origin) => origin === base.origin), `unexpected third-party request: ${[...requestOrigins].join(', ')}`);
  check((await context.cookies()).length === 0, 'the site set an unexpected cookie.');
  const webStorage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }));
  check(webStorage.local === 0 && webStorage.session === 0, 'the site wrote unexpected web storage data.');
  await page.getByRole('link', { name: /Try it with sample data/ }).click();
  check(new URL(page.url()).pathname === '/demo/', 'the sample-data action did not open the isolated demo.');
  check(await page.getByRole('heading', { level: 1 }).evaluate((element) => element === document.activeElement), 'route navigation did not focus the demo heading.');
  check((await page.locator('#route-announcement').textContent())?.includes('Demo'), 'route navigation did not announce the demo page.');
  check(await page.getByText('Demo — sample data, nothing is saved', { exact: false }).count() === 1, 'demo banner is missing.');
  check(await page.getByRole('button', { name: 'Reset demo' }).count() === 1, 'demo Reset control is missing.');
  check(await page.getByRole('link', { name: 'Start for real' }).count() === 1, 'demo Start for real control is missing.');
  await page.goBack({ waitUntil: 'networkidle' });
  check(new URL(page.url()).pathname === '/', 'Back did not return to the landing page.');
  check(await page.getByRole('heading', { level: 1 }).evaluate((element) => element === document.activeElement), 'Back navigation did not focus the landing heading.');
  check((await page.locator('#route-announcement').textContent())?.includes('Color Status Labeler'), 'Back navigation did not announce the landing page.');
  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(base.href, { waitUntil: 'networkidle' });
  check(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), '390px mobile layout has horizontal overflow.');
  for (const target of [
    mobilePage.getByRole('link', { name: 'Color Status Labeler home' }),
    mobilePage.locator('.site-footer').getByRole('link', { name: 'Privacy' }),
    mobilePage.locator('.site-footer').getByRole('link', { name: 'Terms' })
  ]) {
    const box = await target.boundingBox();
    check(Boolean(box && box.width >= 44 && box.height >= 44), 'a non-inline mobile navigation target is below 44x44 CSS px.');
  }
  await mobilePage.waitForFunction(async () => (await navigator.serviceWorker.getRegistration())?.active?.scriptURL.endsWith('/sw.js') ?? false);
  const updatedWorker = await mobilePage.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    await registration.update();
    return registration.active?.state === 'activated' && registration.active.scriptURL.endsWith('/sw.js');
  });
  check(updatedWorker, 'service-worker update did not retain an active production worker.');
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await mobile.setOffline(true);
  await mobilePage.reload({ waitUntil: 'domcontentloaded' });
  check(await mobilePage.getByRole('heading', { level: 1 }).textContent() === 'Label color-only dashboard statuses.', 'offline shell did not render the guide.');
  if (!(await mobilePage.locator('#offline-note').isVisible())) {
    await mobilePage.evaluate(() => dispatchEvent(new Event('offline')));
  }
  check(await mobilePage.locator('#offline-note').isVisible(), 'offline reload did not show the offline notice.');
  await mobile.close();
} finally {
  await browser.close();
}

if (failures.length) throw new Error(`Live browser verification failed:\n- ${failures.join('\n- ')}`);
console.log(`Verified live desktop, 390px mobile, keyboard, accessibility, privacy, and offline shell: ${base.origin}`);
