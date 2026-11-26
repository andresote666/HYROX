import { store, save, dayKey } from './store.js';
import { render, toast } from './main.js';
import { doSwap } from './data/plan.js';
import { resolveDay } from './logic/day.js';
import { openTimer } from './ui/timer.js';
import { syncNow } from './logic/sync.js';

function setDone(key, patch) {
  store.done[key] = { items: {}, ...store.done[key], ...patch };
  save();
}

export function handleAction(act, el, ui) {
  const key = el.dataset.date;
  switch (act) {
    case 'check': {
      const d = store.done[key] || { items: {} };
      const items = { ...d.items, [el.dataset.key]: !d.items?.[el.dataset.key] };
      setDone(key, { items });
      try { navigator.vibrate?.(8); } catch { /* ignore */ }
      render();
      break;
    }
    case 'complete': {
      const now = !store.done[key]?.complete;
      setDone(key, { complete: now });
      render();
      if (now) toast('Session logged');
      break;
    }
    case 'express':
      ui.express[key] = !ui.express[key];
      render();
      break;
    case 'variant':
      if (store.variants[key] === 'B') delete store.variants[key]; else store.variants[key] = 'B';
      save(); render();
      break;
    case 'timer': {
      const day = resolveDay(key, { express: !!ui.express[key] });
      const spec = day.session.timers[Number(el.dataset.idx)];
      if (spec) openTimer(spec, finished => { if (finished) { setDone(key, { complete: true }); render(); toast('Session logged'); } });
      break;
    }
    case 'pick-day':
      ui.date = key;
      render();
      break;
    case 'go-today':
      ui.date = dayKey();
      render({ keepScroll: false });
      break;
    case 'plan-week':
      ui.planWeek = Number(el.dataset.week);
      ui.openDay = null;
      render();
      break;
    case 'open-day':
      ui.openDay = ui.openDay === key ? null : key;
      render();
      break;
    case 'open-today':
      ui.date = key;
      ui.tab = 'today';
      store.ui.tab = 'today'; save();
      render();
      break;
    case 'do-swap':
      doSwap(Number(el.dataset.week), Number(el.dataset.from), Number(el.dataset.to));
      save();
      ui.sheet = null; ui.openDay = null;
      render(); toast('Days swapped');
      break;
    case 'reset-week':
      delete store.swaps[`w${el.dataset.week}`];
      save(); render(); toast('Week order reset');
      break;
    case 'race':
      ui.raceId = el.dataset.race;
      render();
      break;
    case 'lib':
      ui.libSection = el.dataset.sec;
      store.ui.libSection = ui.libSection; save();
      render();
      break;
    case 'toggle-status':
      ui.statusOpen = !ui.statusOpen;
      render();
      break;
    case 'toggle-notes':
      ui.notesOpen = !ui.notesOpen;
      render();
      break;
    case 'sync-now':
      el.setAttribute('disabled', '');
      syncNow().then(r => { render(); toast(r.ok ? 'Garmin data synced' : r.message); });
      break;
    default:
      break;
  }
}
