/* Session effort (sRPE) and training load.
   Load = effort 0–10 × minutes (Foster 2001). It captures sleds, lunges and
   wall balls, which heart-rate load underestimates (Haddad 2017 review).
   A spike = last 7 days well above the average of the 3 weeks before.
   Big week-to-week jumps go with more injuries (Gabbett 2016); the exact
   ratio is debated (Impellizzeri 2020), so the app only flags clear jumps. */
import { store, dayKey, parseDay, addDays } from '../store.js';
import { sessionFor, weekDays, DELOAD, weekOf } from '../data/plan.js';
import { activitiesOn } from './sync.js';

export const RPE_LABELS = [
  'Rest', 'Very, very easy', 'Easy', 'Moderate', 'Somewhat hard', 'Hard',
  'Hard', 'Very hard', 'Very hard', 'Very, very hard', 'Maximal',
];

/* Planned minutes from a session's "60–75 min" / "45 min" / "~1:30" label. */
export function plannedMinutes(session) {
  const d = String(session?.duration || '');
  let m = d.match(/(\d+)\s*[–-]\s*(\d+)\s*min/);
  if (m) return Math.round((Number(m[1]) + Number(m[2])) / 2);
  m = d.match(/(\d):(\d{2})/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  m = d.match(/(\d+)\s*min/);
  if (m) return Number(m[1]);
  return 60;
}

/* Best guess for how long the session took: Garmin first, then the plan. */
export function suggestedMinutes(key) {
  const garmin = activitiesOn(key).reduce((a, x) => a + (x.mins || 0), 0);
  if (garmin >= 15) return { mins: Math.round(garmin), from: 'Garmin' };
  return { mins: plannedMinutes(sessionFor(key)), from: 'plan' };
}

export const rated = key => store.done[key]?.rpe !== undefined && store.done[key]?.rpe !== null && store.done[key]?.mins > 0;
export const loadOn = key => (rated(key) ? Math.round(store.done[key].rpe * store.done[key].mins) : 0);

function windowLoad(endKey, days = 7) {
  let sum = 0, n = 0;
  for (let i = 0; i < days; i++) {
    const k = dayKey(addDays(parseDay(endKey), -i));
    if (rated(k)) { sum += loadOn(k); n++; }
  }
  return { sum, n };
}

/* Last 7 days vs the 3 weeks before. Needs a few rated sessions first. */
export function loadSpike(key = dayKey()) {
  const cur = windowLoad(key);
  const prev = [1, 2, 3].map(i => windowLoad(dayKey(addDays(parseDay(key), -7 * i))));
  const base = prev.filter(p => p.n >= 2);
  if (cur.n < 2 || base.length < 2) return { ready: false, last7: cur.sum, n: cur.n };
  const avg = base.reduce((a, p) => a + p.sum, 0) / base.length;
  if (!avg) return { ready: false, last7: cur.sum, n: cur.n };
  const pct = Math.round((cur.sum / avg - 1) * 100);
  const level = pct >= 50 ? 'high' : pct >= 30 ? 'up' : 'ok';
  const { week } = weekOf(key);
  const afterDeload = DELOAD.has(week - 1) || DELOAD.has(week);
  return { ready: true, last7: cur.sum, avg: Math.round(avg), pct, level, afterDeload };
}

/* Total load for one plan week. */
export function weekLoad(w) {
  if (w < 0) return { sum: 0, n: 0 };
  return weekDays(w).reduce((a, d) => (rated(d.key) ? { sum: a.sum + loadOn(d.key), n: a.n + 1 } : a), { sum: 0, n: 0 });
}

export function spikeText(sp) {
  if (!sp?.ready || sp.level === 'ok') return '';
  const base = `Training load is up ${sp.pct}% on your usual week.`;
  if (sp.afterDeload) return `${base} Normal after a lighter week, but keep easy days easy.`;
  return sp.level === 'high'
    ? `${base} Big jumps are when shins get hurt: keep today's easy parts truly easy and skip optional extras.`
    : `${base} Fine for one week; don't add extra sessions.`;
}
