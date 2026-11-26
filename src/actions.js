import { store, save, dayKey } from './store.js';
import { render, toast } from './main.js';
import { doSwap } from './data/plan.js';
import { resolveDay } from './logic/day.js';
import { openTimer } from './ui/timer.js';
import { syncNow } from './logic/sync.js';
import { openRpeDraft } from './views/sheets.js';
import { openSimTimer } from './ui/simtimer.js';
import { partsForSession, partsForType, SIM_TYPES, deleteSim } from './logic/sim.js';
import { sessionFor } from './data/plan.js';

/* After a simulation closes: log the session and ask for effort. */
function afterSim(ui, key) {
  return res => {
    if (res?.saved) {
      if (key) { setDone(key, { complete: true }); openRpeDraft(ui, key); }
      render(); toast('Simulation saved · prediction updated');
    } else if (res?.running) { render(); toast('Simulation still timing · resume from Today or Race'); }
    else render();
  };
}

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
      if (now) openRpeDraft(ui, key);
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
      if (spec) openTimer(spec, finished => { if (finished) { setDone(key, { complete: true }); openRpeDraft(ui, key); render(); toast('Session logged'); } });
      break;
    }
    case 'sim-open': {
      if (key) {
        const day = resolveDay(key, { express: !!ui.express[key] });
        const parts = partsForSession(day.session);
        if (parts) openSimTimer({ parts, title: day.session.title, date: key }, afterSim(ui, key));
      } else {
        const type = el.dataset.type;
        openSimTimer({ parts: partsForType(type), title: `${SIM_TYPES[type].label} simulation`, date: dayKey() }, afterSim(ui, null));
      }
      break;
    }
    case 'sim-resume': {
      const live = store.simLive;
      if (!live) break;
      const fromSession = !!partsForSession(sessionFor(live.date)) && sessionFor(live.date)?.title === live.title;
      openSimTimer({ parts: live.parts, title: live.title, date: live.date }, afterSim(ui, fromSession ? live.date : null));
      break;
    }
    case 'sim-delete':
      if (el.dataset.confirm !== '1') { el.dataset.confirm = '1'; el.textContent = 'Tap again to delete'; break; }
      deleteSim(el.dataset.id); render(); toast('Simulation deleted');
      break;
    case 'toggle-review':
      ui.reviewOpen = !ui.reviewOpen;
      render();
      break;
    case 'dismiss-review':
      store.ui.reviewDismissed = Number(el.dataset.week);
      save(); render();
      break;
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
    case 'food-type':
      ui.foodType = el.dataset.type;
      render();
      break;
    case 'food-view':
      ui.foodView = el.dataset.view;
      render({ keepScroll: false });
      break;
    case 'meal-tick': {
      const today = dayKey();
      const m = { ...(store.meals[today] || {}) };
      m[el.dataset.meal] = !m[el.dataset.meal];
      store.meals[today] = m;
      save();
      try { navigator.vibrate?.(8); } catch { /* ignore */ }
      render();
      break;
    }
    case 'shop-tick':
      store.shopping = { ...store.shopping, [el.dataset.id]: !store.shopping?.[el.dataset.id] };
      save(); render();
      break;
    case 'shop-reset':
      store.shopping = {};
      save(); render(); toast('Shopping list cleared');
      break;
    case 'open-food':
      ui.tab = 'food'; ui.foodView = 'menu'; ui.foodType = null;
      store.ui.tab = 'food'; save();
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
