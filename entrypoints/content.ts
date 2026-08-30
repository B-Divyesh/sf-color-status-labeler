import { defineContentScript } from 'wxt/utils/define-content-script';
import { browser } from 'wxt/browser';
import { colorDistance, toHex } from '../src/lib/color';
import { getSiteConfig, saveSiteConfig, storageKey } from '../src/lib/storage';
import { PATTERNS, type ColorProperty, type Pattern, type StatusRule } from '../src/lib/types';

const HOST_ID = 'color-status-labeler-root';

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_idle',
  async main() {
    const origin = location.origin;
    let config = await getSiteConfig(origin);
    let host: HTMLElement | null = null;
    let shadow: ShadowRoot | null = null;
    let layer: HTMLElement | null = null;
    let observed = false;
    let refreshTimer = 0;
    let positionFrame = 0;
    const matches = new Map<Element, HTMLElement>();

    const css = `
      :host { all: initial; color-scheme: light; --ink:#171512; --paper:#F6F0DE; --tape:#E9DEBF; --blue:#145B73; --yellow:#F2C94C; --red:#8A2922; font-family:ui-monospace,SFMono-Regular,"Cascadia Mono","Liberation Mono",monospace; }
      *,*::before,*::after { box-sizing:border-box; }
      button,input,select { font:inherit; }
      button,input,select { min-height:44px; }
      button:focus-visible,input:focus-visible,select:focus-visible { outline:3px solid var(--blue); outline-offset:3px; }
      #layer { position:fixed; inset:0; z-index:2147483646; pointer-events:none; }
      .badge { position:fixed; display:flex; max-width:180px; min-height:24px; align-items:center; gap:5px; padding:3px 7px 3px 4px; overflow:hidden; border:2px solid var(--ink); color:var(--ink); background:var(--paper); box-shadow:2px 2px 0 rgba(23,21,18,.82); font:700 12px/1.2 ui-monospace,SFMono-Regular,"Cascadia Mono",monospace; white-space:nowrap; text-overflow:ellipsis; transform:translateY(-4px); animation:arrive 180ms ease-out both; }
      .pattern { display:inline-block; width:18px; height:18px; flex:0 0 auto; border:1px solid var(--ink); background-color:var(--sample); }
      .stripes { background-image:repeating-linear-gradient(45deg,transparent 0 3px,var(--ink) 3px 5px); }
      .dots { background-image:radial-gradient(var(--ink) 1px,transparent 1.5px); background-size:5px 5px; }
      .crosshatch { background-image:repeating-linear-gradient(45deg,transparent 0 4px,var(--ink) 4px 5px),repeating-linear-gradient(-45deg,transparent 0 4px,var(--ink) 4px 5px); }
      .bars { background-image:repeating-linear-gradient(90deg,transparent 0 3px,var(--ink) 3px 5px); }
      .legend { position:fixed; right:max(16px,env(safe-area-inset-right)); bottom:max(16px,env(safe-area-inset-bottom)); width:min(260px,calc(100vw - 32px)); border:2px solid var(--ink); color:var(--ink); background:var(--paper); box-shadow:5px 5px 0 var(--ink); pointer-events:none; }
      .legend-head { display:flex; align-items:center; justify-content:space-between; padding:7px 9px; color:var(--paper); background:var(--ink); font:800 11px/1.2 ui-monospace,monospace; letter-spacing:.08em; text-transform:uppercase; }
      .legend ul { margin:0; padding:6px 9px; list-style:none; }
      .legend li { display:grid; grid-template-columns:20px 1fr auto; gap:7px; align-items:center; min-height:30px; font:700 12px/1.2 ui-monospace,monospace; }
      .legend code { color:#5F594C; font:10px ui-monospace,monospace; }
      .picker-bar { position:fixed; z-index:2147483647; top:max(10px,env(safe-area-inset-top)); left:50%; display:flex; width:min(620px,calc(100vw - 20px)); min-height:52px; align-items:center; justify-content:space-between; gap:12px; padding:8px 10px 8px 14px; border:2px solid var(--ink); color:var(--ink); background:var(--yellow); box-shadow:4px 4px 0 var(--ink); pointer-events:auto; transform:translateX(-50%); font:700 13px/1.3 ui-monospace,monospace; }
      .picker-bar button { padding:7px 12px; border:2px solid var(--ink); color:var(--paper); background:var(--ink); cursor:pointer; }
      .reticle { position:fixed; z-index:2147483645; border:3px dashed var(--ink); background:rgba(242,201,76,.18); box-shadow:0 0 0 2px var(--paper); pointer-events:none; }
      .backdrop { position:fixed; z-index:2147483647; inset:0; display:grid; place-items:center; padding:16px; background:rgba(23,21,18,.72); pointer-events:auto; }
      .dialog { width:min(440px,100%); max-height:calc(100vh - 32px); padding:22px; overflow:auto; border:2px solid var(--ink); color:var(--ink); background:var(--paper); box-shadow:7px 7px 0 var(--yellow); }
      .dialog h2 { margin:0 0 6px; font:900 25px/.95 "Arial Black","Helvetica Neue",sans-serif; letter-spacing:-.03em; text-transform:uppercase; }
      .dialog p { margin:0 0 18px; color:#5F594C; font:13px/1.45 ui-monospace,monospace; }
      .dialog label,.dialog legend { display:block; margin:0 0 7px; font:800 13px/1.3 ui-monospace,monospace; }
      .dialog input[type=text],.dialog select { width:100%; margin-bottom:15px; padding:9px 10px; border:2px solid var(--ink); color:var(--ink); background:white; }
      .dialog input[aria-invalid=true] { border-color:var(--red); box-shadow:0 0 0 1px var(--red); }
      .field-error { min-height:20px; margin:-9px 0 12px!important; color:var(--red)!important; font-weight:800!important; }
      fieldset { margin:0 0 17px; padding:0; border:0; }
      .pattern-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
      .pattern-choice { position:relative; display:grid!important; min-height:58px; margin:0!important; place-items:center; border:2px solid var(--ink); cursor:pointer; }
      .pattern-choice input { position:absolute; opacity:0; }
      .pattern-choice:has(input:checked) { color:white; background:var(--blue); box-shadow:3px 3px 0 var(--ink); }
      .pattern-choice:has(input:focus-visible) { outline:3px solid var(--blue); outline-offset:3px; }
      .pattern-choice .pattern { --sample:var(--paper); }
      .actions { display:flex; flex-direction:row-reverse; gap:10px; }
      .actions button { flex:1; padding:9px 12px; border:2px solid var(--ink); cursor:pointer; font-weight:800; }
      .save { color:white; background:var(--blue); box-shadow:3px 3px 0 var(--ink); }
      .cancel { color:var(--ink); background:var(--tape); }
      .warning { margin:15px 0 0!important; padding-top:12px; border-top:1px dashed #8C8370; }
      @keyframes arrive { from { opacity:0; transform:translateY(0); } }
      @media(max-width:460px){ .dialog{padding:18px}.pattern-grid{grid-template-columns:repeat(2,1fr)}.legend{right:10px;bottom:10px}.actions{flex-direction:column}.picker-bar{align-items:flex-start}.picker-bar button{flex:0 0 auto} }
      @media(prefers-reduced-motion:reduce){ *,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important} }
      @media(forced-colors:active){ .pattern{background:Canvas}.reticle{border-color:Highlight}.legend,.dialog,.picker-bar{forced-color-adjust:auto} }
    `;

    function ensureRoot() {
      host = document.getElementById(HOST_ID);
      if (!host) {
        host = document.createElement('aside');
        host.id = HOST_ID;
        host.setAttribute('aria-label', 'Color Status Labeler overlays');
        document.documentElement.append(host);
        shadow = host.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = css;
        layer = document.createElement('div');
        layer.id = 'layer';
        shadow.append(style, layer);
      } else {
        shadow = host.shadowRoot;
        layer = shadow?.querySelector('#layer') ?? null;
      }
    }

    function clearLabels() {
      matches.clear();
      layer?.replaceChildren();
    }

    function isEligible(element: Element): boolean {
      if (element === document.body || element === document.documentElement || element.id === HOST_ID) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width >= 6 && rect.height >= 6 && rect.width <= 800 && rect.height <= 320 && style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0;
    }

    function hasActiveProperty(element: Element, style: CSSStyleDeclaration, property: ColorProperty): boolean {
      if (property === 'borderTopColor') return style.borderTopStyle !== 'none' && Number.parseFloat(style.borderTopWidth) > 0;
      if (property === 'fill' || property === 'stroke') return element instanceof SVGElement && style[property] !== 'none';
      return true;
    }

    function positionBadges() {
      positionFrame = 0;
      for (const [element, badge] of matches) {
        if (!element.isConnected) { badge.remove(); matches.delete(element); continue; }
        const rect = element.getBoundingClientRect();
        const left = Math.max(3, Math.min(innerWidth - badge.offsetWidth - 3, rect.right - badge.offsetWidth));
        const top = Math.max(3, Math.min(innerHeight - badge.offsetHeight - 3, rect.top));
        badge.style.left = `${left}px`;
        badge.style.top = `${top}px`;
        badge.hidden = rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth;
      }
    }

    function requestPosition() {
      if (!positionFrame) positionFrame = requestAnimationFrame(positionBadges);
    }

    async function renderLabels() {
      config = await getSiteConfig(origin);
      ensureRoot();
      clearLabels();
      const activeRules = config.enabled ? config.rules.filter((rule) => rule.enabled !== false) : [];
      if (!activeRules.length || !layer) return;
      const elements = Array.from(document.body.querySelectorAll<Element>('*')).slice(0, 8000);
      let count = 0;
      for (const element of elements) {
        if (count >= 160 || !isEligible(element)) continue;
        const style = getComputedStyle(element);
        const rule = activeRules.find((candidate) => hasActiveProperty(element, style, candidate.property) && colorDistance(style[candidate.property], candidate.color) <= candidate.tolerance);
        if (!rule) continue;
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.setAttribute('aria-hidden', 'true');
        const swatch = document.createElement('span');
        swatch.className = `pattern ${rule.pattern}`;
        swatch.style.setProperty('--sample', rule.color);
        const text = document.createElement('span');
        text.textContent = rule.label;
        badge.append(swatch, text);
        layer.append(badge);
        matches.set(element, badge);
        count += 1;
      }
      const legend = document.createElement('section');
      legend.className = 'legend';
      legend.setAttribute('aria-label', 'Status label legend');
      const head = document.createElement('div');
      head.className = 'legend-head';
      head.innerHTML = '<span>Status tape</span><span aria-hidden="true">A / LIVE</span>';
      const list = document.createElement('ul');
      for (const rule of activeRules) {
        const item = document.createElement('li');
        const swatch = document.createElement('span');
        swatch.className = `pattern ${rule.pattern}`;
        swatch.style.setProperty('--sample', rule.color);
        const name = document.createElement('span');
        name.textContent = rule.label;
        const total = document.createElement('code');
        total.textContent = `${[...matches.keys()].filter((element) => {
          const style = getComputedStyle(element);
          return hasActiveProperty(element, style, rule.property) && colorDistance(style[rule.property], rule.color) <= rule.tolerance;
        }).length}×`;
        item.append(swatch, name, total);
        list.append(item);
      }
      legend.append(head, list);
      layer.append(legend);
      positionBadges();
    }

    function scheduleRefresh() {
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => void renderLabels(), 350);
    }

    function removePickerUi() {
      shadow?.querySelectorAll('.picker-bar,.reticle,.backdrop').forEach((node) => node.remove());
      document.documentElement.style.removeProperty('cursor');
    }

    function beginPicker() {
      ensureRoot();
      removePickerUi();
      clearLabels();
      if (!shadow) return;
      document.documentElement.style.setProperty('cursor', 'crosshair', 'important');
      const bar = document.createElement('div');
      bar.className = 'picker-bar';
      bar.setAttribute('role', 'status');
      const copy = document.createElement('span');
      copy.textContent = 'Click a colored status, or Tab to it and press Enter. Escape cancels.';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.textContent = 'Cancel';
      bar.append(copy, cancel);
      const reticle = document.createElement('div');
      reticle.className = 'reticle';
      reticle.hidden = true;
      shadow.append(bar, reticle);

      const stop = (resume = true) => {
        document.removeEventListener('mousemove', move, true);
        document.removeEventListener('click', choose, true);
        document.removeEventListener('keydown', keydown, true);
        removePickerUi();
        if (resume) void renderLabels();
      };
      const move = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element) || target === host) return;
        const rect = target.getBoundingClientRect();
        Object.assign(reticle.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
        reticle.hidden = false;
      };
      const keydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') { event.preventDefault(); stop(); return; }
        const target = document.activeElement;
        if ((event.key === 'Enter' || event.key === ' ') && target instanceof Element && target !== host && target !== document.body) {
          event.preventDefault();
          event.stopImmediatePropagation();
          stop(false);
          showRuleDialog(target);
        }
      };
      const choose = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element) || target === host) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        stop(false);
        showRuleDialog(target);
      };
      cancel.addEventListener('click', () => stop());
      document.addEventListener('mousemove', move, true);
      document.addEventListener('click', choose, true);
      document.addEventListener('keydown', keydown, true);
    }

    function showRuleDialog(target: Element) {
      ensureRoot();
      if (!shadow) return;
      const computed = getComputedStyle(target);
      const available = (['backgroundColor', 'fill', 'borderTopColor', 'stroke', 'color'] as ColorProperty[])
        .map((property) => ({ property, color: toHex(computed[property]) }))
        .filter((item): item is { property: ColorProperty; color: string } => Boolean(item.color) && hasActiveProperty(target, computed, item.property));
      if (!available.length) { void renderLabels(); return; }
      const backdrop = document.createElement('div');
      backdrop.className = 'backdrop';
      const dialog = document.createElement('div');
      dialog.className = 'dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'csl-dialog-title');
      dialog.innerHTML = `<h2 id="csl-dialog-title">Name this signal</h2><p>Add meaning that survives the hue. You can change it later by deleting and picking again.</p>`;
      const form = document.createElement('form');
      const nameLabel = document.createElement('label');
      nameLabel.htmlFor = 'csl-label';
      nameLabel.textContent = 'Status label';
      const name = document.createElement('input');
      name.id = 'csl-label';
      name.type = 'text';
      name.required = true;
      name.maxLength = 32;
      name.autocomplete = 'off';
      name.placeholder = 'Example: Needs review';
      name.setAttribute('aria-describedby', 'csl-label-error');
      const labelError = document.createElement('p');
      labelError.id = 'csl-label-error';
      labelError.className = 'field-error';
      labelError.setAttribute('role', 'alert');
      const propertyLabel = document.createElement('label');
      propertyLabel.htmlFor = 'csl-color';
      propertyLabel.textContent = 'Sampled color';
      const property = document.createElement('select');
      property.id = 'csl-color';
      const labels: Record<ColorProperty, string> = { backgroundColor: 'Background', borderTopColor: 'Border', color: 'Text', fill: 'Shape fill', stroke: 'Shape outline' };
      for (const item of available) {
        const option = document.createElement('option');
        option.value = item.property;
        option.textContent = `${labels[item.property]} — ${item.color}`;
        property.append(option);
      }
      const fields = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = 'Pattern';
      const grid = document.createElement('div');
      grid.className = 'pattern-grid';
      for (const [index, pattern] of PATTERNS.entries()) {
        const choice = document.createElement('label');
        choice.className = 'pattern-choice';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'pattern';
        radio.value = pattern;
        radio.checked = index === config.rules.length % PATTERNS.length;
        const visual = document.createElement('span');
        visual.className = `pattern ${pattern}`;
        visual.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        text.textContent = pattern;
        choice.append(radio, visual, text);
        grid.append(choice);
      }
      fields.append(legend, grid);
      const actions = document.createElement('div');
      actions.className = 'actions';
      const save = document.createElement('button');
      save.className = 'save';
      save.type = 'submit';
      save.textContent = 'Save label';
      const cancel = document.createElement('button');
      cancel.className = 'cancel';
      cancel.type = 'button';
      cancel.textContent = 'Cancel';
      actions.append(save, cancel);
      const warning = document.createElement('p');
      warning.className = 'warning';
      warning.textContent = 'Pixel matching can miss or mislabel items after a site redesign. Check the legend when the page changes.';
      form.append(nameLabel, name, labelError, propertyLabel, property, fields, actions, warning);
      dialog.append(form);
      backdrop.append(dialog);
      shadow.append(backdrop);
      const close = () => { backdrop.remove(); void renderLabels(); };
      cancel.addEventListener('click', close);
      backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
      backdrop.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { event.preventDefault(); close(); return; }
        if (event.key === 'Tab') {
          const focusable = [...dialog.querySelectorAll<HTMLElement>('button,input,select')].filter((element) => !element.hasAttribute('disabled'));
          const first = focusable[0];
          const last = focusable.at(-1);
          if (event.shiftKey && shadow?.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && shadow?.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const selected = available.find((item) => item.property === property.value)!;
        const pattern = new FormData(form).get('pattern') as Pattern;
        const rule: StatusRule = { id: crypto.randomUUID(), label: name.value.trim(), color: selected.color, property: selected.property, pattern, tolerance: 10, enabled: true, createdAt: Date.now() };
        if (!rule.label) {
          name.setAttribute('aria-invalid', 'true');
          labelError.textContent = 'Enter a status label; spaces alone cannot name a signal.';
          name.focus();
          return;
        }
        config.enabled = true;
        config.rules.push(rule);
        await saveSiteConfig(config);
        close();
      });
      name.addEventListener('input', () => {
        if (name.value.trim()) {
          name.removeAttribute('aria-invalid');
          labelError.textContent = '';
        }
      });
      name.focus();
    }

    browser.runtime.onMessage.addListener((message: { type?: string }) => {
      if (message.type === 'START_PICKER') beginPicker();
      if (message.type === 'REFRESH_LABELS') scheduleRefresh();
    });
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[storageKey(origin)]) scheduleRefresh();
    });
    addEventListener('scroll', requestPosition, { passive: true });
    addEventListener('resize', requestPosition, { passive: true });
    if (!observed) {
      new MutationObserver(scheduleRefresh).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
      observed = true;
    }
    await renderLabels();
  }
});
