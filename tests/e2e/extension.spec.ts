import { chromium, expect, test } from '@playwright/test';
import { resolve } from 'node:path';

test('picker trains a rule and applies a click-through overlay', async () => {
  const extensionPath = resolve('.output/chrome-mv3');
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
    await page.locator('.dot.green').click();
    await host.getByLabel('Status label').fill('Ready');
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
  } finally {
    await context.close();
  }
});
