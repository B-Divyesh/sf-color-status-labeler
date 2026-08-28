import { chromium, expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

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

test('picker trains a rule and applies a click-through overlay', async () => {
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
    await page.goto('/');
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
    await expect(host.getByRole('alert')).toHaveText('Enter a status label; spaces alone cannot name a signal.');
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
