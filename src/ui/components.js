import { icons, modeIcon } from './icons.js';
import { store } from '../store.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const KIND = {
  vo2: { label: 'VO₂max', icon: icons.bolt },
  threshold: { label: 'Threshold', icon: icons.flame },
  z2: { label: 'Aerobic base', icon: icons.heart },
  strength: { label: 'Strength', icon: icons.dumbbell },
  station: { label: 'Stations', icon: icons.flame },
  sim: { label: 'Simulation', icon: icons.race },
  run: { label: 'Run', icon: icons.run },
  recovery: { label: 'Recovery', icon: icons.heart },
  rest: { label: 'Rest', icon: icons.moon },
  race: { label: 'Race', icon: icons.race },
  test: { label: 'Test', icon: icons.target },
};

const intensityTone = i => ({ Hard: 'accent', Race: 'accent', Moderate: '', Easy: 'green', Rest: '' }[i] || '');

export function sessionHeader(s, { compact = false } = {}) {
  const k = KIND[s.kind] || KIND.z2;
  return `
    <div class="session-head">
      <div class="kind-badge ${s.kind}">${k.icon}</div>
      <div class="grow">
        <div class="eyebrow">${k.label}${s.express ? ' · Express' : ''}</div>
        <div class="${compact ? 'h3' : 'h2'}" style="margin-top:2px">${esc(s.title)}</div>
        <div class="session-meta">
          ${s.duration ? `<span class="chip">${icons.timer}${esc(s.duration)}</span>` : ''}
          ${s.intensity ? `<span class="chip ${intensityTone(s.intensity)}">${esc(s.intensity)}</span>` : ''}
          ${(s.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}
        </div>
      </div>
    </div>`;
}

export function itemKey(bi, ii) { return `b${bi}-i${ii}`; }

export function sessionBody(s, dateKey, { interactive = true } = {}) {
  const done = store.done[dateKey]?.items || {};
  return `
    ${s.purpose ? `<div class="purpose">${s.purpose}</div>` : ''}
    ${s.blocks.map((b, bi) => (s.express && b.optional) ? '' : `
      <div class="block">
        <div class="block-title"><span>${esc(b.title)}</span>${b.optional ? '<span class="small">optional when short on time</span>' : ''}</div>
        <div class="items">
          ${b.items.map((it, ii) => {
            const key = itemKey(bi, ii);
            const isDone = !!done[key];
            const tag = interactive ? 'button' : 'div';
            return `
            <${tag} class="item ${isDone ? 'done' : ''} ${it.adapted ? 'adapted' : ''}" ${interactive ? `data-act="check" data-date="${dateKey}" data-key="${key}" aria-pressed="${isDone}"` : ''}>
              <span class="check">${icons.check}</span>
              <span>
                <div class="item-name">${esc(it.name)}</div>
                ${it.detail ? `<div class="item-detail">${esc(it.detail)}</div>` : ''}
                ${it.adapted && it.original ? `<div class="item-was">Instead of: ${esc(it.original)}</div>` : ''}
              </span>
              <span class="item-dose">${esc(it.dose || '')}${it.load ? `<small>${esc(it.load)}</small>` : ''}</span>
            </${tag}>`;
          }).join('')}
        </div>
      </div>`).join('')}`;
}

export function countItems(s) {
  let total = 0;
  s.blocks.forEach(b => { if (!(s.express && b.optional)) total += b.items.length; });
  return total;
}

export function doneCount(s, dateKey) {
  const done = store.done[dateKey]?.items || {};
  let n = 0;
  s.blocks.forEach((b, bi) => {
    if (s.express && b.optional) return;
    b.items.forEach((_, ii) => { if (done[itemKey(bi, ii)]) n++; });
  });
  return n;
}

export { modeIcon };
