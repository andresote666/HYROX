/* Monday review of last week: sessions, effort load, shins, weight, HRV,
   tests, and the key session of the week ahead. */
import { store } from '../store.js';
import { weekDays, weekOf, DELOAD, TOTAL_WEEKS } from '../data/plan.js';
import { BENCHMARKS } from '../data/benchmarks.js';
import { weekLoad } from './load.js';
import { hrvStatus } from './sync.js';

const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

/* Shown on Monday and Tuesday until dismissed, from week 1. */
export function reviewFor(todayKey) {
  const { week, dow } = weekOf(todayKey);
  if (week < 1 || week > TOTAL_WEEKS || dow > 1) return null;
  if (store.ui.reviewDismissed === week) return null;
  return buildReview(week, todayKey);
}

export function buildReview(week, todayKey) {
  const last = weekDays(week - 1);
  const keys = new Set(last.map(d => d.key));
  const planned = last.filter(d => d.session && d.session.kind !== 'rest' && (!d.session.optionalDay || store.done[d.key]?.complete));
  const done = planned.filter(d => store.done[d.key]?.complete).length;

  const checks = last.map(d => store.checkins[d.key]).filter(Boolean);
  const shins = { green: 0, amber: 0, red: 0, n: checks.length };
  checks.forEach(c => { shins[c.status] = (shins[c.status] || 0) + 1; });

  const load = weekLoad(week - 1);
  const prevLoad = weekLoad(week - 2);
  const loadPct = load.n >= 2 && prevLoad.n >= 2 && prevLoad.sum ? Math.round((load.sum / prevLoad.sum - 1) * 100) : null;

  const wPrev = weekDays(week - 2).map(d => d.key);
  const kgLast = avg(store.weights.filter(w => keys.has(w.date)).map(w => w.kg));
  const kgPrev = avg(store.weights.filter(w => wPrev.includes(w.date)).map(w => w.kg));
  const kgChange = kgLast !== null && kgPrev !== null ? Math.round((kgLast - kgPrev) * 10) / 10 : null;

  const hrv = hrvStatus(todayKey);
  const tests = [...new Set(store.benchmarks.filter(b => keys.has(b.date)).map(b => BENCHMARKS.find(x => x.id === b.id)?.name).filter(Boolean))];

  const ahead = weekDays(week);
  const pick = ['race', 'sim', 'vo2'].map(k => ahead.find(d => d.session?.kind === k)).find(Boolean);
  const key = pick ? { day: pick.label, title: pick.session.title } : null;

  let headline;
  if (shins.red) headline = 'Your shins flagged red last week. Running stays on the bike until you have 5 green mornings in a row.';
  else if (shins.amber >= 3) headline = 'Shins were amber 3 or more days. Keep cadence high and don\'t add extra running this week.';
  else if (planned.length && done / planned.length >= 0.8) headline = 'Solid week. Same again: consistency is what gets you to sub-1:30.';
  else if (planned.length && done === 0) headline = 'No sessions logged last week. If you trained, tap "Mark session done" so the app can track your load.';
  else headline = 'Some sessions were missed. Don\'t make them up: start this week fresh.';

  return {
    week, lastWeek: week - 1, done, planned: planned.length,
    shins, load, loadPct, kgChange, kgLast, hrv, tests, key,
    deload: DELOAD.has(week), headline,
  };
}
