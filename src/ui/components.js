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

/* Block type → a quiet tone on the card edge and header icon:
   heavy lifts (accent), muscle work (soft accent), engine (celeste),
   HYROX stations (white), prep: warm-up, hops, core, prehab (grey). */
const CARDIO = new Set(['run', 'bike', 'row']);
const RACE_RE = /wall[- ]ball|sled|lunge|farmers carry 200|burpee|bbj|roxzone|station|race|sim/i;
function blockTone(b) {
  const items = b.items;
  if (b.lift === 'upper' || b.lift === 'lower') {
    const heavy = /heavy|keep|strength|^legs$/i.test(b.title) || items.some(i => /squat|deadlift|bench press/i.test(i.name) && /^\d×[1-6]$/.test(String(i.dose)));
    return { tone: heavy ? 'heavy' : 'muscle', icon: icons.dumbbell };
  }
  if (b.lift === 'core') return { tone: 'prep', icon: icons.target };
  if (items.some(i => i.plyo)) return { tone: 'prep', icon: icons.bolt };
  if (/warm-up|cool-down|mobility|recovery|prehab/i.test(b.title)) return { tone: 'prep', icon: /warm/i.test(b.title) ? icons.timer : icons.heart };
  if (items.some(i => i.mode === 'jump' || i.mode === 'station' || RACE_RE.test(`${i.name}`)) || RACE_RE.test(b.title)) return { tone: 'race', icon: icons.flame };
  const cardio = items.find(i => CARDIO.has(i.mode));
  if (cardio) return { tone: 'engine', icon: modeIcon(cardio.mode) };
  return { tone: 'prep', icon: modeIcon(items[0]?.mode) };
}

/* "Warm-up · 10 min" → name "Warm-up", tag "10 min"; superset/tri-set words become tags. */
function blockLabel(b) {
  const parts = b.title.split(' · ');
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  const tagWord = /^(superset|tri-set|\d+(–\d+)? min|deload)$/i.test(last) ? last : '';
  const name = tagWord ? parts.slice(0, -1).join(' · ') : b.title;
  const groups = b.groups || [];
  const derived = !tagWord && groups.some(n => n > 1)
    ? (groups.some(n => n === 3) ? 'tri-set' : groups.filter(n => n === 2).length > 1 ? 'supersets' : 'superset') : '';
  return { name, tag: tagWord || derived };
}

/* Coach notation across the session's lifting blocks: A, B, C for straight sets,
   D1/D2 for exercises you alternate. */
function sequenceLabels(s) {
  let letter = 0;
  return s.blocks.map(b => {
    if (!b.lift || (s.express && b.optional)) return null;
    const sizes = b.groups ? [...b.groups] : [];
    const covered = sizes.reduce((a, n) => a + n, 0);
    for (let k = covered; k < b.items.length; k++) sizes.push(1);
    const out = [];
    sizes.forEach(n => {
      const L = String.fromCharCode(65 + (letter++ % 26));
      for (let k = 0; k < n && out.length < b.items.length; k++) out.push(n > 1 ? `${L}${k + 1}` : L);
    });
    return out;
  });
}

export function sessionBody(s, dateKey, { interactive = true } = {}) {
  const done = store.done[dateKey]?.items || {};
  const seq = sequenceLabels(s);
  let hinted = false; // explain the 1 → 2 notation once per session
  return `
    ${s.purpose ? `<div class="purpose">${s.purpose}</div>` : ''}
    ${s.blocks.map((b, bi) => {
      if (s.express && b.optional) return '';
      const { tone, icon } = blockTone(b);
      const { name, tag } = blockLabel(b);
      const grouped = !hinted && (b.groups || []).some(n => n > 1);
      if (grouped) hinted = true;
      return `
      <section class="sblock t-${tone}">
        <header class="sblock-head">
          <span class="sblock-ic" aria-hidden="true">${icon}</span>
          <span class="sblock-name">${esc(name)}</span>
          <span class="sblock-tags">${tag ? `<span class="sblock-tag">${esc(tag)}</span>` : ''}${b.optional ? '<span class="sblock-tag opt">Optional</span>' : ''}</span>
        </header>
        ${grouped ? '<div class="sblock-hint">Same number = alternate them (1 → 2 → 1…), rest after each round.</div>' : ''}
        <div class="sitems">
          ${b.items.map((it, ii) => {
            const key = itemKey(bi, ii);
            const isDone = !!done[key];
            const el = interactive ? 'button' : 'div';
            const label = seq[bi]?.[ii];
            return `
            <${el} class="item ${isDone ? 'done' : ''} ${it.adapted ? 'adapted' : ''}" ${interactive ? `data-act="check" data-date="${dateKey}" data-key="${key}" aria-pressed="${isDone}"` : ''}>
              <span class="check">${icons.check}</span>
              <span>
                <div class="item-name">${label ? `<span class="seq">${label}</span>` : ''}${esc(it.name)}</div>
                ${it.detail ? `<div class="item-detail">${esc(it.detail)}</div>` : ''}
                ${it.adapted && it.original ? `<div class="item-was">Instead of: ${esc(it.original)}</div>` : ''}
              </span>
              <span class="item-dose">${it.dose ? `<span class="dose">${esc(it.dose)}</span>` : ''}${it.load ? `<small>${esc(it.load)}</small>` : ''}</span>
            </${el}>`;
          }).join('')}
        </div>
      </section>`;
    }).join('')}`;
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
