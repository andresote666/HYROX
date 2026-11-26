/* ═══════════════════════════════════════════════════════════
   HYROX PREP 2027 — Buenos Aires · Santiago
   ═══════════════════════════════════════════════════════════ */
import './styles.css';
import { store, save, dayKey } from './store.js';
import { icons } from './ui/icons.js';
import { RACES } from './data/races.js';
import { renderToday } from './views/today.js';
import { renderPlan } from './views/plan.js';
import { renderRace } from './views/race.js';
import { renderProgress } from './views/progress.js';
import { renderLibrary } from './views/library.js';
import { renderSheet, handleSheetAction } from './views/sheets.js';
import { handleAction } from './actions.js';
import { syncNow, shouldAutoSync } from './logic/sync.js';

export const ui = {
  tab: store.ui.tab || 'today',
  date: dayKey(),          // date shown on Today
  planWeek: null,          // selected week on Plan
  openDay: null,           // expanded day on Plan
  sheet: null,             // { type, ...data }
  draft: null,             // check-in draft
  raceId: store.profile.raceId || 'ba27',
  libSection: store.ui.libSection || 'stations',
  express: {},             // { dateKey: true }
};

const TABS = [
  { id: 'today', label: 'Today', icon: icons.today },
  { id: 'plan', label: 'Plan', icon: icons.plan },
  { id: 'race', label: 'Race', icon: icons.race },
  { id: 'progress', label: 'Progress', icon: icons.progress },
  { id: 'library', label: 'Library', icon: icons.library },
];

export function daysTo(iso) {
  const race = new Date(`${iso}T00:00:00`);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((race - now) / 86400000));
}

function topbar() {
  const race = RACES[ui.raceId] || RACES.ba27;
  const d = daysTo(race.date);
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">HX</div>
        <div class="brand-text">
          <span class="brand-title">HYROX PREP</span>
          <span class="brand-sub">${race.flag} ${race.city} · ${race.date.slice(8)} ${new Date(race.date + 'T12:00').toLocaleDateString('en-GB', { month: 'short' })}</span>
        </div>
      </div>
      <div class="topbar-actions">
        <div class="countdown-chip" title="Days to ${race.city}"><span class="num">${d}</span><span>days</span></div>
        <button class="icon-btn" data-act="sheet" data-type="settings" aria-label="Settings">${icons.settings}</button>
      </div>
    </header>`;
}

function tabbar() {
  return `
    <nav class="tabbar" aria-label="Main">
      ${TABS.map(t => `
        <button class="tab ${ui.tab === t.id ? 'on' : ''}" data-act="tab" data-tab="${t.id}" ${ui.tab === t.id ? 'aria-current="page"' : ''}>
          ${t.icon}<span>${t.label}</span>
        </button>`).join('')}
    </nav>`;
}

function page() {
  switch (ui.tab) {
    case 'plan': return renderPlan(ui);
    case 'race': return renderRace(ui);
    case 'progress': return renderProgress(ui);
    case 'library': return renderLibrary(ui);
    default: return renderToday(ui);
  }
}

let lastTab = null;
export function render({ keepScroll = true } = {}) {
  const app = document.getElementById('app');
  const changedTab = lastTab !== ui.tab;
  const y = window.scrollY;
  const pills = document.querySelector('.week-pills');
  const pillsX = pills ? pills.scrollLeft : null;
  const oldSheet = document.querySelector('.sheet');
  const sheetY = oldSheet ? oldSheet.scrollTop : null;
  app.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    ${topbar()}
    <main class="page ${changedTab ? 'animate' : 'static'}" id="main">${page()}</main>
    ${tabbar()}
    ${ui.sheet ? renderSheet(ui) : ''}`;
  if (!changedTab) {
    app.querySelectorAll('.rise').forEach(el => el.classList.remove('rise'));
  }
  if (changedTab || !keepScroll) window.scrollTo(0, 0); else window.scrollTo(0, y);
  const np = document.querySelector('.week-pills');
  if (np) {
    if (pillsX !== null && !changedTab) np.scrollLeft = pillsX;
    else np.querySelector('.wp.on')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  const newSheet = document.querySelector('.sheet');
  if (newSheet && sheetY !== null) {
    newSheet.classList.add('still');
    document.querySelector('.scrim')?.classList.add('still');
    newSheet.scrollTop = sheetY;
  }
  lastTab = ui.tab;
}

export function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) {
    if (e.target.classList?.contains('scrim')) { ui.sheet = null; ui.draft = null; render(); }
    return;
  }
  const act = el.dataset.act;
  if (act === 'tab') {
    ui.tab = el.dataset.tab;
    store.ui.tab = ui.tab; save();
    render();
    return;
  }
  if (handleSheetAction(act, el, ui)) return;
  handleAction(act, el, ui);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && ui.sheet) { ui.sheet = null; ui.draft = null; render(); }
});

/* refresh at midnight / when returning to the app on a new day */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && ui.date !== dayKey() && ui.tab === 'today') {
    ui.date = dayKey();
    render();
  }
});

render();

function autoSync() {
  if (!shouldAutoSync()) return;
  syncNow({ silent: true }).then(r => { if (r.ok && !ui.sheet) render(); });
}
autoSync();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') autoSync(); });

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    reg.update();
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw?.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) toast('App updated');
      });
    });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}
