import { browser } from 'wxt/browser';
import { getSiteConfig, saveSiteConfig } from '../../src/lib/storage';
import { PATTERNS, type Pattern, type SiteConfig, type StatusRule } from '../../src/lib/types';

const siteName = document.querySelector<HTMLElement>('#site-name')!;
const controls = document.querySelector<HTMLElement>('#controls')!;
const unsupported = document.querySelector<HTMLElement>('#unsupported')!;
const enabledInput = document.querySelector<HTMLInputElement>('#site-enabled')!;
const pickButton = document.querySelector<HTMLButtonElement>('#pick')!;
const ruleList = document.querySelector<HTMLUListElement>('#rule-list')!;
const empty = document.querySelector<HTMLElement>('#empty')!;
const ruleCount = document.querySelector<HTMLElement>('#rule-count')!;
const status = document.querySelector<HTMLElement>('#status')!;
const exportButton = document.querySelector<HTMLButtonElement>('#export')!;
const importInput = document.querySelector<HTMLInputElement>('#import-file')!;
const clearButton = document.querySelector<HTMLButtonElement>('#clear-site')!;

let activeTabId: number | undefined;
let activeOrigin = '';
let config: SiteConfig | null = null;
let undoRule: StatusRule | null = null;

function announce(message: string, error = false) {
  status.textContent = message;
  status.style.color = error ? '#8A2922' : '#28613D';
}

async function waitForContentReceiver(tabId: number) {
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    try {
      const response = await browser.tabs.sendMessage(tabId, { type: 'CONTENT_RECEIVER_READY' }) as { ready?: boolean } | undefined;
      if (response?.ready) return;
    } catch {
      // The tab can still be loading its document_idle content script.
    }
    await new Promise<void>((resolve) => window.setTimeout(resolve, 100));
  }
  throw new Error('The page did not finish loading the status label picker.');
}

function patternCss(pattern: Pattern): string {
  if (pattern === 'dots') return 'radial-gradient(#171512 1.5px, transparent 1.5px)';
  if (pattern === 'crosshatch') return 'repeating-linear-gradient(45deg, transparent 0 5px, #171512 5px 7px), repeating-linear-gradient(-45deg, transparent 0 5px, #171512 5px 7px)';
  if (pattern === 'bars') return 'repeating-linear-gradient(90deg, transparent 0 5px, #171512 5px 8px)';
  return 'repeating-linear-gradient(45deg, transparent 0 5px, #171512 5px 8px)';
}

async function persist() {
  if (!config) return;
  await saveSiteConfig(config);
  try { if (activeTabId) await browser.tabs.sendMessage(activeTabId, { type: 'REFRESH_LABELS' }); } catch { /* tab may be navigating */ }
}

function render() {
  if (!config) return;
  enabledInput.checked = config.enabled;
  ruleList.replaceChildren();
  ruleCount.textContent = String(config.rules.length);
  empty.hidden = config.rules.length > 0;
  clearButton.hidden = config.rules.length === 0;
  for (const rule of config.rules) {
    const item = document.createElement('li');
    item.className = 'rule';
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.setAttribute('aria-hidden', 'true');
    swatch.style.setProperty('--rule-color', rule.color);
    swatch.style.setProperty('--rule-pattern', patternCss(rule.pattern));
    const copy = document.createElement('span');
    copy.className = 'rule-copy';
    const label = document.createElement('strong');
    label.textContent = rule.label;
    const detail = document.createElement('small');
    detail.textContent = `${rule.color} · ${rule.pattern}`;
    copy.append(label, detail);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.setAttribute('aria-label', `Delete ${rule.label}`);
    remove.textContent = '×';
    remove.addEventListener('click', async () => {
      if (!config || !confirm(`Delete the “${rule.label}” label from ${new URL(activeOrigin).hostname}?`)) return;
      undoRule = rule;
      config.rules = config.rules.filter(({ id }) => id !== rule.id);
      await persist();
      render();
      announce(`Deleted ${rule.label}. Press U to undo.`);
    });
    item.append(swatch, copy, remove);
    ruleList.append(item);
  }
}

async function init() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id;
  try {
    const url = new URL(tab?.url ?? '');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported');
    activeOrigin = url.origin;
    siteName.textContent = url.hostname;
    config = await getSiteConfig(activeOrigin);
    controls.hidden = false;
    render();
  } catch {
    siteName.textContent = 'No editable website';
    unsupported.hidden = false;
  }
}

enabledInput.addEventListener('change', async () => {
  if (!config) return;
  config.enabled = enabledInput.checked;
  await persist();
  announce(config.enabled ? 'Labels are on for this site.' : 'Labels are paused for this site.');
});

pickButton.addEventListener('click', async () => {
  if (!activeTabId) return;
  pickButton.disabled = true;
  try {
    await waitForContentReceiver(activeTabId);
    await browser.tabs.sendMessage(activeTabId, { type: 'START_PICKER' });
    window.close();
  } catch {
    pickButton.disabled = false;
    announce('This page blocked the picker. Reload the page and try again.', true);
  }
});

exportButton.addEventListener('click', () => {
  if (!config) return;
  const blob = new Blob([JSON.stringify({ version: 1, site: config }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `color-status-labeler-${new URL(activeOrigin).hostname}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  announce('Backup exported.');
});

importInput.addEventListener('change', async () => {
  const file = importInput.files?.[0];
  if (!file || !config) return;
  try {
    const parsed = JSON.parse(await file.text()) as { version?: number; site?: SiteConfig };
    if (parsed.version !== 1 || !parsed.site || !Array.isArray(parsed.site.rules)) throw new Error('bad format');
    const properties = ['backgroundColor', 'borderTopColor', 'color', 'fill', 'stroke'];
    const rules = parsed.site.rules.filter((rule) =>
      typeof rule.label === 'string' && rule.label.trim().length > 0 && rule.label.length <= 32 &&
      /^#[0-9A-Fa-f]{6}$/.test(rule.color) && PATTERNS.includes(rule.pattern) &&
      properties.includes(rule.property) && Number.isFinite(rule.tolerance)
    );
    config.rules = rules.map((rule) => ({ ...rule, label: rule.label.trim(), tolerance: Math.max(0, Math.min(50, rule.tolerance)), enabled: rule.enabled !== false, id: crypto.randomUUID() }));
    await persist();
    render();
    announce(`Imported ${rules.length} label${rules.length === 1 ? '' : 's'} for this site.`);
  } catch {
    announce('That backup could not be read. Choose a Color Status Labeler JSON file.', true);
  } finally { importInput.value = ''; }
});

clearButton.addEventListener('click', async () => {
  if (!config || !config.rules.length || !confirm(`Clear all ${config.rules.length} labels learned for ${new URL(activeOrigin).hostname}?`)) return;
  const prior = [...config.rules];
  config.rules = [];
  await persist();
  render();
  announce(`Cleared ${prior.length} labels.`);
});

document.addEventListener('keydown', async (event) => {
  if (event.key.toLowerCase() !== 'u' || !undoRule || !config || /input|textarea/i.test((event.target as HTMLElement).tagName)) return;
  config.rules.push(undoRule);
  const restored = undoRule.label;
  undoRule = null;
  await persist();
  render();
  announce(`Restored ${restored}.`);
});

void init();
