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

  for (const path of ['/', '/privacy/', '/terms/']) {
    await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
    check(await page.locator('html').getAttribute('lang') === 'en', `${path} is missing lang=en.`);
    check(await page.locator('h1').count() === 1, `${path} does not have exactly one h1.`);
    check(await page.locator('main').count() === 1, `${path} does not have exactly one main landmark.`);
    const violations = await new AxeBuilder({ page }).analyze();
    check(!violations.violations.some((item) => ['serious', 'critical'].includes(item.impact ?? '')), `${path} has serious or critical axe findings.`);
  }

  await page.goto(base.href, { waitUntil: 'networkidle' });
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
  await mobile.setOffline(true);
  await mobilePage.reload({ waitUntil: 'domcontentloaded' });
  check(await mobilePage.getByRole('heading', { level: 1 }).textContent() === 'Stop guessing what the colors mean.', 'offline shell did not render the guide.');
  check(await mobilePage.locator('#offline-note').isVisible(), 'offline reload did not show the offline notice.');
  await mobile.close();
} finally {
  await browser.close();
}

if (failures.length) throw new Error(`Live browser verification failed:\n- ${failures.join('\n- ')}`);
console.log(`Verified live desktop, 390px mobile, keyboard, accessibility, privacy, and offline shell: ${base.origin}`);
