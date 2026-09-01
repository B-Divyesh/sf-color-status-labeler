import { chromium, expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

type StoredRule = {
  id: string;
  label: string;
  color: string;
  property: 'backgroundColor' | 'borderTopColor' | 'color' | 'fill' | 'stroke';
  pattern: 'stripes' | 'dots' | 'crosshatch' | 'bars';
  tolerance: number;
  enabled: boolean;
  createdAt: number;
};

function extensionArchive() {
  const archive = readdirSync(resolve('.output')).find((name) => name.endsWith('-chrome.zip'));
  if (!archive) throw new Error('Expected the build to produce a Chrome extension ZIP.');
  return resolve('.output', archive);
}

function seededRule(id: string, label: string, color = '#4A985C'): StoredRule {
  return { id, label, color, property: 'backgroundColor', pattern: 'stripes', tolerance: 10, enabled: true, createdAt: 1 };
}

async function openPopupForOrigin(context: import('@playwright/test').BrowserContext, extensionId: string, origin: string) {
  const popup = await context.newPage();
  await popup.addInitScript((testedOrigin) => {
    const tabs = chrome.tabs as unknown as { query: () => Promise<Array<{ id: number; url: string }>> };
    tabs.query = async () => [{ id: 1, url: testedOrigin }];
  }, origin);
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.locator('#controls')).toBeVisible();
  return popup;
}

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

test('@claim:core-labeling @claim:local-rules @claim:click-through @claim:rules-return picker trains a local rule and applies a click-through overlay', async () => {
  const extensionPath = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-'));
  execFileSync('unzip', ['-q', resolve('.output/color-status-labeler-1.0.0-chrome.zip'), '-d', extensionPath]);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto('/demo/');
    const origin = new URL(page.url()).origin;
    const host = page.locator('#color-status-labeler-root');
    await expect(host).toBeAttached();
    await worker.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab');
      await chrome.tabs.sendMessage(tab.id, { type: 'START_PICKER' });
    });
    await expect(host.locator('.picker-bar')).toContainText('Click a colored status');
    const pickerCancel = host.locator('.picker-bar').getByRole('button', { name: 'Cancel' });
    await pickerCancel.focus();
    const pickerFocus = await pickerCancel.evaluate((element) => {
      const style = getComputedStyle(element);
      const surface = getComputedStyle(element.closest('.picker-bar')!);
      return { outline: style.outlineColor, width: Number.parseFloat(style.outlineWidth), background: surface.backgroundColor };
    });
    expect(pickerFocus.width).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(pickerFocus.outline, pickerFocus.background)).toBeGreaterThanOrEqual(3);
    await page.locator('.dot.green').click();
    const dialogName = host.getByLabel('Status label');
    await dialogName.focus();
    const dialogFocus = await dialogName.evaluate((element) => {
      const style = getComputedStyle(element);
      const surface = getComputedStyle(element.closest('.dialog')!);
      return { outline: style.outlineColor, width: Number.parseFloat(style.outlineWidth), background: surface.backgroundColor };
    });
    expect(dialogFocus.width).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(dialogFocus.outline, dialogFocus.background)).toBeGreaterThanOrEqual(3);
    await host.getByLabel('Status label').fill('   ');
    await host.getByRole('button', { name: 'Save label' }).click();
    await expect(host.getByRole('alert')).toHaveText('Enter a status label; spaces alone cannot name a status.');
    await expect(host.getByLabel('Status label')).toHaveAttribute('aria-invalid', 'true');
    await host.getByLabel('Status label').fill('Ready');
    await expect(host.getByRole('alert')).toBeEmpty();
    await host.getByLabel('dots').check();
    await host.getByRole('button', { name: 'Save label' }).click();
    await expect(host.locator('.legend')).toContainText('Ready');
    await expect(host.locator('.badge')).toContainText('Ready');
    await expect(host.locator('.badge')).toHaveCSS('pointer-events', 'none');
    const saved = await worker.evaluate(async ({ origin }) => {
      const key = `color-status-labeler:${origin}`;
      return (await chrome.storage.local.get(key))[key];
    }, { origin });
    expect(saved.rules).toMatchObject([{ label: 'Ready', pattern: 'dots', color: '#4A985C' }]);
    await page.reload();
    await expect(host.locator('.legend')).toContainText('Ready');
    await expect(host.locator('.badge')).toContainText('Ready');

    const openKeyboardPicker = async () => {
      await worker.evaluate(async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) throw new Error('No active tab');
        await chrome.tabs.sendMessage(tab.id, { type: 'START_PICKER' });
      });
      await expect(host.locator('.picker-bar')).toBeVisible();
      await page.getByRole('button', { name: 'Apply sample label' }).focus();
      await page.keyboard.press('Enter');
      await expect(host.getByRole('dialog')).toBeVisible();
    };

    await openKeyboardPicker();
    await page.keyboard.press('Escape');
    await expect(host.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Apply sample label' })).toBeFocused();

    await openKeyboardPicker();
    await host.getByRole('button', { name: 'Cancel' }).click();
    await expect(host.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Apply sample label' })).toBeFocused();

    await openKeyboardPicker();
    await host.locator('.backdrop').click({ position: { x: 1, y: 1 } });
    await expect(host.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Apply sample label' })).toBeFocused();

    await openKeyboardPicker();
    await host.getByLabel('Status label').fill('Reviewed');
    await host.getByRole('button', { name: 'Save label' }).click();
    await expect(host.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Apply sample label' })).toBeFocused();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    const extensionId = new URL(worker.url()).host;
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.locator('#controls').evaluate((element: HTMLElement) => { element.hidden = false; });
    const primary = popup.getByRole('button', { name: /Pick a status color/ });
    await primary.focus();
    const popupFocus = await primary.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outline: style.outlineColor, width: Number.parseFloat(style.outlineWidth), background: getComputedStyle(document.body).backgroundColor };
    });
    expect(popupFocus.width).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(popupFocus.outline, popupFocus.background)).toBeGreaterThanOrEqual(3);
    const privacyBox = await popup.getByRole('link', { name: 'Privacy' }).boundingBox();
    expect(privacyBox, 'popup Privacy target must have a rendered box').not.toBeNull();
    expect(privacyBox!.width).toBeGreaterThanOrEqual(44);
    expect(privacyBox!.height).toBeGreaterThanOrEqual(44);
    const results = await new AxeBuilder({ page: popup }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  } finally {
    await context.close();
    rmSync(extensionPath, { recursive: true, force: true });
  }
});

test('@claim:picker-style-properties picker labels visible background, top-border, and text colors', async () => {
  const extensionPath = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-properties-'));
  execFileSync('unzip', ['-q', extensionArchive(), '-d', extensionPath]);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto('/demo/');
    const origin = new URL(page.url()).origin;
    await page.evaluate(() => {
      const fixture = document.createElement('section');
      fixture.id = 'property-fixture';
      fixture.innerHTML = `
        <button id="sample-background" style="background:#1252a0;border:0;color:#fff">Background sample</button>
        <button id="sample-border" style="background:transparent;border:0;border-top:8px solid #a83b32;color:#111">Border sample</button>
        <button id="sample-text" style="background:transparent;border:0;color:#28613d">Text sample</button>`;
      document.body.append(fixture);
    });
    const host = page.locator('#color-status-labeler-root');
    const cases = [
      { selector: '#sample-background', option: 'backgroundColor', label: 'Background status' },
      { selector: '#sample-border', option: 'borderTopColor', label: 'Border status' },
      { selector: '#sample-text', option: 'color', label: 'Text status' }
    ] as const;

    for (const sample of cases) {
      await worker.evaluate(async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) throw new Error('No active tab');
        await chrome.tabs.sendMessage(tab.id, { type: 'START_PICKER' });
      });
      await page.locator(sample.selector).click();
      await expect(host.getByRole('dialog')).toBeVisible();
      await host.locator('#csl-color').selectOption(sample.option);
      await host.getByLabel('Status label').fill(sample.label);
      await host.getByRole('button', { name: 'Save label' }).click();
      await expect(host.locator('.badge').filter({ hasText: sample.label })).toHaveCount(1);
    }

    const saved = await worker.evaluate(async (testedOrigin) => {
      const key = `color-status-labeler:${testedOrigin}`;
      return (await chrome.storage.local.get(key))[key];
    }, origin) as { rules: StoredRule[] };
    expect(saved.rules.map(({ label, property }) => ({ label, property }))).toEqual([
      { label: 'Background status', property: 'backgroundColor' },
      { label: 'Border status', property: 'borderTopColor' },
      { label: 'Text status', property: 'color' }
    ]);
  } finally {
    await context.close();
    rmSync(extensionPath, { recursive: true, force: true });
  }
});

test('@claim:color-matching-limits labels follow nearby solid colors but not gradients or larger color changes', async () => {
  const extensionPath = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-limits-'));
  execFileSync('unzip', ['-q', extensionArchive(), '-d', extensionPath]);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto('/demo/');
    await page.evaluate(() => {
      const fixture = document.createElement('section');
      fixture.innerHTML = `
        <button id="changing-color" style="background:#1252a0;border:0;color:#fff">Changing color</button>
        <button id="gradient-color" style="background-color:transparent;background-image:linear-gradient(90deg,#1252a0,#a83b32);border:0;color:#111">Gradient color</button>`;
      document.body.append(fixture);
    });
    const host = page.locator('#color-status-labeler-root');
    const startPicker = async () => worker.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab');
      await chrome.tabs.sendMessage(tab.id, { type: 'START_PICKER' });
    });

    await startPicker();
    await page.locator('#changing-color').click();
    await host.locator('#csl-color').selectOption('backgroundColor');
    await host.getByLabel('Status label').fill('Changing status');
    await host.getByRole('button', { name: 'Save label' }).click();
    const matchingBadge = host.locator('.badge').filter({ hasText: 'Changing status' });
    await expect(matchingBadge).toHaveCount(1);

    await page.locator('#changing-color').evaluate((element: HTMLElement) => { element.style.backgroundColor = '#1554a2'; });
    await expect(matchingBadge).toHaveCount(1);
    await page.locator('#changing-color').evaluate((element: HTMLElement) => { element.style.backgroundColor = '#87211a'; });
    await expect(matchingBadge).toHaveCount(0);

    await startPicker();
    await page.locator('#gradient-color').click();
    const options = await host.locator('#csl-color option').allTextContents();
    expect(options.some((option) => option.startsWith('Background'))).toBe(false);
    await host.getByRole('button', { name: 'Cancel' }).click();
  } finally {
    await context.close();
    rmSync(extensionPath, { recursive: true, force: true });
  }
});

test('@claim:download-extension the packaged ZIP validates and loads as the expected Manifest V3 extension', async () => {
  const archive = extensionArchive();
  const directory = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-package-'));
  const unpacked = resolve(directory, 'unpacked');
  try {
    execFileSync('unzip', ['-tqq', archive], { stdio: 'inherit' });
    const manifest = JSON.parse(execFileSync('unzip', ['-p', archive, 'manifest.json'], { encoding: 'utf8' })) as { manifest_version?: number; name?: string };
    expect(manifest).toMatchObject({ manifest_version: 3, name: 'Color Status Labeler' });
    execFileSync('unzip', ['-q', archive, '-d', unpacked]);
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: true,
      args: [`--disable-extensions-except=${unpacked}`, `--load-extension=${unpacked}`]
    });
    try {
      let [worker] = context.serviceWorkers();
      worker ??= await context.waitForEvent('serviceworker');
      await expect.poll(async () => worker?.evaluate(() => chrome.runtime.getManifest())).toMatchObject({
        manifest_version: 3,
        name: 'Color Status Labeler'
      });
    } finally {
      await context.close();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('@claim:backup-transfer popup exports JSON, rejects malformed data, and restores a valid backup for this site', async () => {
  const extensionPath = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-backup-'));
  const downloadDirectory = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-download-'));
  execFileSync('unzip', ['-q', extensionArchive(), '-d', extensionPath]);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    acceptDownloads: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto('/demo/');
    const origin = new URL(page.url()).origin;
    const initialRules = [seededRule('ready', 'Ready'), seededRule('waiting', 'Waiting', '#B4A43C')];
    await worker.evaluate(async ({ origin, rules }) => {
      await chrome.storage.local.set({ [`color-status-labeler:${origin}`]: { origin, enabled: true, rules, createdAt: 1, updatedAt: 1 } });
    }, { origin, rules: initialRules });
    const popup = await openPopupForOrigin(context, new URL(worker.url()).host, origin);

    await popup.locator('.data-tools summary').click();
    const downloadPromise = popup.waitForEvent('download');
    await popup.getByRole('button', { name: 'Export backup' }).click();
    const download = await downloadPromise;
    const exportedPath = resolve(downloadDirectory, download.suggestedFilename());
    await download.saveAs(exportedPath);
    const exported = JSON.parse(readFileSync(exportedPath, 'utf8')) as { version?: number; site?: { rules?: StoredRule[] } };
    expect(exported.version).toBe(1);
    expect(exported.site?.rules).toHaveLength(2);
    await expect(popup.locator('#status')).toHaveText('Backup exported.');

    await popup.locator('#import-file').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{not-json') });
    await expect(popup.locator('#status')).toHaveText('That backup could not be read. Choose a Color Status Labeler JSON file.');

    const importedRule = { ...seededRule('imported', 'Needs review', '#3E73A8'), pattern: 'bars' as const, tolerance: 999 };
    await popup.locator('#import-file').setInputFiles({
      name: 'color-status-labeler.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ version: 1, site: { origin: 'https://another.example', enabled: false, rules: [importedRule] } }))
    });
    await expect(popup.locator('#status')).toHaveText('Imported 1 label for this site.');
    await expect(popup.getByRole('list', { name: 'Learned status labels' })).toContainText('Needs review');
    const saved = await worker.evaluate(async (testedOrigin) => (await chrome.storage.local.get(`color-status-labeler:${testedOrigin}`))[`color-status-labeler:${testedOrigin}`], origin) as { origin: string; rules: StoredRule[] };
    expect(saved.origin).toBe(origin);
    expect(saved.rules).toMatchObject([{ label: 'Needs review', tolerance: 50, pattern: 'bars' }]);
  } finally {
    await context.close();
    rmSync(extensionPath, { recursive: true, force: true });
    rmSync(downloadDirectory, { recursive: true, force: true });
  }
});

test('@claim:rule-deletion popup deletes one learned label and clears a site only after confirmation', async () => {
  const extensionPath = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-rules-'));
  execFileSync('unzip', ['-q', extensionArchive(), '-d', extensionPath]);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto('/demo/');
    const origin = new URL(page.url()).origin;
    await worker.evaluate(async ({ origin, rules }) => {
      await chrome.storage.local.set({ [`color-status-labeler:${origin}`]: { origin, enabled: true, rules, createdAt: 1, updatedAt: 1 } });
    }, { origin, rules: [seededRule('ready', 'Ready'), seededRule('waiting', 'Waiting', '#B4A43C')] });
    const popup = await openPopupForOrigin(context, new URL(worker.url()).host, origin);

    const deleteConfirmation = popup.waitForEvent('dialog').then((dialog) => dialog.accept());
    await popup.getByRole('button', { name: 'Delete Ready' }).click();
    await deleteConfirmation;
    await expect(popup.locator('#status')).toHaveText('Deleted Ready. Press U to undo.');
    await expect(popup.getByRole('list', { name: 'Learned status labels' })).not.toContainText('Ready');
    await popup.keyboard.press('u');
    await expect(popup.locator('#status')).toHaveText('Restored Ready.');
    await expect(popup.getByRole('list', { name: 'Learned status labels' })).toContainText('Ready');

    await popup.locator('.data-tools summary').click();
    const clearConfirmation = popup.waitForEvent('dialog').then((dialog) => dialog.accept());
    await popup.getByRole('button', { name: 'Clear this site’s labels' }).click();
    await clearConfirmation;
    await expect(popup.locator('#status')).toHaveText('Cleared 2 labels.');
    await expect(popup.getByRole('list', { name: 'Learned status labels' })).toBeEmpty();
    const saved = await worker.evaluate(async (testedOrigin) => (await chrome.storage.local.get(`color-status-labeler:${testedOrigin}`))[`color-status-labeler:${testedOrigin}`], origin) as { rules: StoredRule[] };
    expect(saved.rules).toEqual([]);
  } finally {
    await context.close();
    rmSync(extensionPath, { recursive: true, force: true });
  }
});

test('@claim:page-unchanged labels leave form values, password values, links, and page submission state alone', async () => {
  const extensionPath = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-page-'));
  execFileSync('unzip', ['-q', extensionArchive(), '-d', extensionPath]);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto('/demo/');
    await page.evaluate(() => {
      const form = document.createElement('form');
      form.id = 'unchanged-form';
      const password = document.createElement('input');
      password.id = 'unchanged-password';
      password.type = 'password';
      password.value = 'never-read';
      const nativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if (!nativeValue?.get || !nativeValue.set) throw new Error('Password value descriptor is unavailable.');
      Object.defineProperty(password, 'value', {
        configurable: true,
        get() {
          password.dataset.reads = String(Number(password.dataset.reads ?? '0') + 1);
          return nativeValue.get!.call(password);
        },
        set(value: string) { nativeValue.set!.call(password, value); }
      });
      const text = document.createElement('input');
      text.id = 'unchanged-note';
      text.name = 'note';
      text.value = 'Keep this note';
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.dataset.submits = String(Number(form.dataset.submits ?? '0') + 1);
      });
      const link = document.createElement('a');
      link.id = 'unchanged-link';
      link.href = '/terms/';
      link.textContent = 'Unchanged link';
      document.body.append(form, password, text, link);
    });

    await worker.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab');
      await chrome.tabs.sendMessage(tab.id, { type: 'START_PICKER' });
    });
    await page.getByRole('button', { name: 'Apply sample label' }).focus();
    await page.keyboard.press('Enter');
    const host = page.locator('#color-status-labeler-root');
    await host.getByLabel('Status label').fill('Ready');
    await host.getByRole('button', { name: 'Save label' }).click();
    await expect(host.locator('.badge').first()).toContainText('Ready');

    expect(await page.evaluate(() => ({
      note: document.querySelector<HTMLInputElement>('#unchanged-note')?.value,
      passwordReads: Number(document.querySelector<HTMLInputElement>('#unchanged-password')?.dataset.reads ?? '0'),
      submits: Number(document.querySelector<HTMLFormElement>('#unchanged-form')?.dataset.submits ?? '0'),
      href: document.querySelector<HTMLAnchorElement>('#unchanged-link')?.getAttribute('href')
    }))).toEqual({ note: 'Keep this note', passwordReads: 0, submits: 0, href: '/terms/' });
  } finally {
    await context.close();
    rmSync(extensionPath, { recursive: true, force: true });
  }
});

test('@claim:extension-runtime-privacy the real extension path sends no data to remote services and has no account or cookie flow', async () => {
  const extensionPath = mkdtempSync(resolve(tmpdir(), 'color-status-labeler-privacy-'));
  execFileSync('unzip', ['-q', extensionArchive(), '-d', extensionPath]);
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  const requestOrigins = new Set<string>();
  context.on('request', (request) => {
    if (request.url().startsWith('http')) requestOrigins.add(new URL(request.url()).origin);
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto('/demo/', { waitUntil: 'networkidle' });
    const origin = new URL(page.url()).origin;
    const popup = await openPopupForOrigin(context, new URL(worker.url()).host, origin);
    await expect(popup.getByRole('textbox', { name: /email|password|sign in/i })).toHaveCount(0);
    expect(await context.cookies()).toEqual([]);
    expect([...requestOrigins]).toEqual([origin]);
    const popupResources = await popup.evaluate(() => [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[href]')]
      .map((element) => element instanceof HTMLScriptElement ? element.src : element.href));
    expect(popupResources.every((url) => url.startsWith('chrome-extension://'))).toBe(true);
    const manifest = await worker.evaluate(() => chrome.runtime.getManifest());
    expect(manifest.permissions).toEqual(expect.arrayContaining(['storage', 'activeTab']));
    expect(manifest.permissions).not.toEqual(expect.arrayContaining(['cookies', 'identity', 'webRequest']));
  } finally {
    await context.close();
    rmSync(extensionPath, { recursive: true, force: true });
  }
});
