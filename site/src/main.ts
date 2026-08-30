const DEMO_STORAGE_KEY = 'demo:color-status-labeler:sample-v1';

type DemoPattern = 'stripes' | 'dots' | 'crosshatch' | 'bars';
type DemoStatus = 'ready' | 'waiting' | 'blocked';
type DemoRule = { label: string; pattern: DemoPattern };
type DemoState = Record<DemoStatus, DemoRule>;

const sampleRules: DemoState = {
  ready: { label: 'Ready', pattern: 'stripes' },
  waiting: { label: 'Waiting', pattern: 'dots' },
  blocked: { label: 'Blocked', pattern: 'crosshatch' }
};

function newSampleState(): DemoState {
  return structuredClone(sampleRules);
}

function readDemoState(): DemoState {
  try {
    const parsed = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) ?? '') as Partial<DemoState>;
    if (Object.keys(sampleRules).every((status) => {
      const rule = parsed[status as DemoStatus];
      return rule && typeof rule.label === 'string' && ['stripes', 'dots', 'crosshatch', 'bars'].includes(rule.pattern);
    })) return parsed as DemoState;
  } catch {
    // The demo remains usable when browser storage is unavailable.
  }
  return newSampleState();
}

function saveDemoState(state: DemoState) {
  try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state)); } catch {
    // A private-browser storage restriction should not prevent the sample from working in memory.
  }
}

function clearDemoState() {
  try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch {
    // Nothing else is stored by the demo.
  }
}

function initDemo(root: HTMLElement) {
  let state = readDemoState();
  const form = root.querySelector<HTMLFormElement>('[data-demo-form]');
  const statusSelect = root.querySelector<HTMLSelectElement>('#demo-status');
  const labelInput = root.querySelector<HTMLInputElement>('#demo-label');
  const error = root.querySelector<HTMLElement>('#demo-form-error');
  const reset = root.querySelector<HTMLButtonElement>('[data-demo-reset]');
  const startForReal = root.querySelector<HTMLAnchorElement>('[data-demo-start-real]');

  if (!form || !statusSelect || !labelInput || !error) return;

  const selectedPattern = () => form.querySelector<HTMLInputElement>('input[name="pattern"]:checked');
  const currentStatus = () => statusSelect.value as DemoStatus;

  const updateForm = () => {
    const rule = state[currentStatus()];
    labelInput.value = rule.label;
    const pattern = form.querySelector<HTMLInputElement>(`input[name="pattern"][value="${rule.pattern}"]`);
    if (pattern) pattern.checked = true;
    error.textContent = '';
    labelInput.removeAttribute('aria-invalid');
  };

  const render = () => {
    (Object.entries(state) as Array<[DemoStatus, DemoRule]>).forEach(([status, rule]) => {
      const card = root.querySelector<HTMLElement>(`[data-demo-status="${status}"]`);
      const label = card?.querySelector<HTMLElement>('[data-demo-label]');
      const legend = root.querySelector<HTMLElement>(`[data-demo-legend="${status}"]`);
      for (const element of [label, legend]) {
        if (!element) continue;
        element.textContent = rule.label;
        element.classList.remove('stripes', 'dots', 'crosshatch', 'bars');
        element.classList.add(rule.pattern);
      }
    });
    updateForm();
  };

  statusSelect.addEventListener('change', updateForm);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const label = labelInput.value.trim();
    const pattern = selectedPattern()?.value as DemoPattern | undefined;
    if (!label || !pattern) {
      error.textContent = 'Enter a status label and choose a pattern.';
      labelInput.setAttribute('aria-invalid', 'true');
      labelInput.focus();
      return;
    }
    state[currentStatus()] = { label, pattern };
    saveDemoState(state);
    render();
  });
  reset?.addEventListener('click', () => {
    clearDemoState();
    state = newSampleState();
    render();
    reset.focus();
  });
  startForReal?.addEventListener('click', clearDemoState);
  render();
}

if (location.pathname === '/' && new URLSearchParams(location.search).get('demo') === '1') {
  location.replace('/demo/');
} else {
  const toggle = document.querySelector<HTMLInputElement>('#demo-toggle');
  const dashboard = document.querySelector<HTMLElement>('.dashboard');

  toggle?.addEventListener('change', () => {
    dashboard?.classList.toggle('labels-off', !toggle.checked);
  });

  const offlineNote = document.querySelector<HTMLElement>('#offline-note');
  const updateNetworkState = () => { if (offlineNote) offlineNote.hidden = navigator.onLine; };
  addEventListener('online', updateNetworkState);
  addEventListener('offline', () => { if (offlineNote) offlineNote.hidden = false; });
  updateNetworkState();

  const demoRoot = document.querySelector<HTMLElement>('[data-demo-app]');
  if (demoRoot) initDemo(demoRoot);

  if ('serviceWorker' in navigator) {
    addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
  }
}
