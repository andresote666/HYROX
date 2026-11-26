/* Garmin data via intervals.icu → /api/intervals (Vercel function).
   Feeds: check-in prefill, HRV/resting-HR readiness, auto-completed sessions,
   the 10%-longest-run rule, weight trend, and the Progress charts. */
import { store, save, dayKey, addDays, parseDay } from '../store.js';
import { sessionFor } from '../data/plan.js';

const STALE_MS = 30 * 60 * 1000;
let inFlight = null;

export const syncConfigured = () => !!store.sync.token;

export async function syncNow({ silent = false } = {}) {
  if (!store.sync.token) return { ok: false, message: 'Add your sync code in Settings first.' };
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const oldest = dayKey(addDays(new Date(), -70));
      const newest = dayKey(addDays(new Date(), 1));
      const r = await fetch(`/api/intervals?oldest=${oldest}&newest=${newest}`, { headers: { 'x-sync-token': store.sync.token } });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.message || `Sync failed (${r.status})`);
      merge(body);
      store.sync.error = null;
      store.sync.last = new Date().toISOString();
      save();
      return { ok: true, message: `Synced ${body.activities.length} workouts, ${body.wellness.length} days of wellness` };
    } catch (e) {
      store.sync.error = e.message || 'Sync failed';
      save();
      return { ok: false, message: store.sync.error, silent };
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

export function shouldAutoSync() {
  if (!store.sync.token) return false;
  const last = store.sync.last ? Date.parse(store.sync.last) : 0;
  return Date.now() - last > STALE_MS;
}

function merge({ wellness = [], activities = [] }) {
  wellness.forEach(w => { store.sync.wellness[w.date] = w; });
  const byId = new Map(store.sync.activities.map(a => [a.id, a]));
  activities.forEach(a => byId.set(a.id, a));
  store.sync.activities = [...byId.values()].sort((a, b) => a.start.localeCompare(b.start)).slice(-400);

  // Weight from a Garmin scale fills days you didn't log by hand
  wellness.forEach(w => {
    if (!w.weight || w.weight < 40) return;
    const manual = store.weights.find(x => x.date === w.date && x.src !== 'garmin');
    if (manual) return;
    store.weights = store.weights.filter(x => x.date !== w.date).concat({ date: w.date, kg: Math.round(w.weight * 10) / 10, src: 'garmin' });
  });

  // A synced workout on a planned training day marks it done (never overrides a manual choice)
  const today = dayKey();
  new Set(activities.map(a => a.date)).forEach(date => {
    if (date > today) return;
    const s = sessionFor(date);
    if (!s || s.kind === 'rest') return;
    if (store.done[date] && store.done[date].complete !== undefined) return;
    store.done[date] = { items: {}, ...store.done[date], complete: true, auto: true };
  });
}

export const activitiesOn = key => store.sync.activities.filter(a => a.date === key);
export const wellnessOn = key => store.sync.wellness[key] || null;

const isRun = a => /run/i.test(a.type) && !/virtualrow/i.test(a.type);

/* Frandsen 2025: no single run >10% longer than the longest in the past 30 days. */
export function runLoad(key) {
  const end = parseDay(key);
  const from30 = dayKey(addDays(end, -30));
  const from7 = dayKey(addDays(end, -7));
  const runs = store.sync.activities.filter(a => isRun(a) && a.date < key);
  const last30 = runs.filter(a => a.date >= from30);
  const last7 = runs.filter(a => a.date >= from7);
  const longest = last30.reduce((m, a) => (a.mins > (m?.mins || 0) ? a : m), null);
  return {
    hasData: store.sync.activities.length > 0,
    longestMins: longest?.mins || 0,
    longestKm: longest?.km || 0,
    capMins: longest ? Math.floor(longest.mins * 1.1) : null,
    km7: Math.round(last7.reduce((s, a) => s + (a.km || 0), 0) * 10) / 10,
    runs7: last7.length,
  };
}

/* HRV: 7-day rolling mean of ln(rMSSD) vs the 60-day baseline ± 0.5 SD
   (Plews 2012; AIS HRV guide). Needs ≥ 14 days of readings. */
export function hrvStatus(key) {
  const days = Object.values(store.sync.wellness).filter(w => w.hrv > 0 && w.date <= key).sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < 14) return { status: null, n: days.length };
  const ln = days.map(d => ({ date: d.date, v: Math.log(d.hrv) }));
  const from7 = dayKey(addDays(parseDay(key), -6));
  const from60 = dayKey(addDays(parseDay(key), -60));
  const recent = ln.filter(d => d.date >= from7);
  const base = ln.filter(d => d.date >= from60);
  if (recent.length < 3) return { status: null, n: days.length };
  const mean = a => a.reduce((s, d) => s + d.v, 0) / a.length;
  const m7 = mean(recent);
  const m60 = mean(base);
  const sd = Math.sqrt(base.reduce((s, d) => s + (d.v - m60) ** 2, 0) / Math.max(1, base.length - 1));
  const lo = m60 - 0.5 * sd;
  const hi = m60 + 0.5 * sd;
  return {
    status: m7 < lo ? 'low' : m7 > hi ? 'high' : 'normal',
    avg7: Math.round(Math.exp(m7)),
    base: Math.round(Math.exp(m60)),
    band: [Math.round(Math.exp(lo)), Math.round(Math.exp(hi))],
    n: days.length,
  };
}

/* Resting HR > 6 bpm above the previous 7-day average = flag (Buchheit 2014 heuristic). */
export function rhrStatus(key) {
  const today = store.sync.wellness[key]?.rhr;
  if (!today) return { status: null };
  const prev = Object.values(store.sync.wellness)
    .filter(w => w.rhr && w.date < key && w.date >= dayKey(addDays(parseDay(key), -7)))
    .map(w => w.rhr);
  if (prev.length < 3) return { status: null, today };
  const base = prev.reduce((a, b) => a + b, 0) / prev.length;
  return { status: today - base > 6 ? 'elevated' : 'normal', today, base: Math.round(base) };
}

export function syncAgo() {
  if (!store.sync.last) return 'never';
  const m = Math.round((Date.now() - Date.parse(store.sync.last)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

/* ── extra Garmin metrics ─────────────────────────────────────── */
const PLAN_START_KEY = '2026-11-23'; // week 0 (post-Rio reset)

const wellnessSorted = () => Object.values(store.sync.wellness).sort((a, b) => a.date.localeCompare(b.date));

/* Garmin's VO2max estimate: latest, first reading since the plan began, change */
export function vo2Trend() {
  const pts = wellnessSorted().filter(w => w.vo2max > 0);
  if (!pts.length) return null;
  const latest = pts[pts.length - 1];
  const start = pts.find(p => p.date >= PLAN_START_KEY) || pts[0];
  const before = [...pts].reverse().find(p => p.date < PLAN_START_KEY);
  const base = before || start;
  return { latest: latest.vo2max, latestDate: latest.date, base: base.vo2max, change: Math.round((latest.vo2max - base.vo2max) * 10) / 10, points: pts };
}

/* intervals.icu fitness (CTL), fatigue (ATL) and form (CTL − ATL) */
export function loadForm() {
  const w = [...wellnessSorted()].reverse().find(x => x.ctl !== null && x.ctl !== undefined);
  if (!w) return null;
  const form = Math.round((w.ctl - w.atl) * 10) / 10;
  let label = 'Balanced';
  if (form < -25) label = 'Very tired: risk zone';
  else if (form < -10) label = 'Building: normal mid-block fatigue';
  else if (form <= 5) label = 'Balanced';
  else label = 'Fresh: good for racing';
  return { fitness: Math.round(w.ctl), fatigue: Math.round(w.atl), form, label, date: w.date };
}

const steps = a => (a.cadence && a.cadence < 120 ? a.cadence * 2 : a.cadence); // strides → steps/min

/* Running cadence vs baseline: +5–10% lowers braking and tibial load (Heiderscheit 2011) */
export function cadenceInfo() {
  const runs = store.sync.activities.filter(a => isRun(a) && a.cadence);
  if (!runs.length) return null;
  const median = arr => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const pre = runs.filter(a => a.date < PLAN_START_KEY).slice(-10);
  const baseline = Math.round(median((pre.length >= 3 ? pre : runs.slice(0, 3)).map(steps)));
  const recent = runs.slice(-5).map(a => ({ date: a.date, spm: Math.round(steps(a)), mins: a.mins, gctMs: a.gctMs, stride: a.stride }));
  return { baseline, target: [Math.round(baseline * 1.05), Math.round(baseline * 1.1)], recent, last: recent[recent.length - 1] };
}

export const runSteps = a => (isRun(a) && a.cadence ? Math.round(steps(a)) : null);

/* Last 7 days: minutes easy / moderate / hard from each workout's HR-zone times.
   Easy < 80% HRmax, moderate 80–88%, hard > 88% (pyramidal target ≈ 75–80 / 10–15 / 5–10). */
export function intensityMix(days = 7) {
  const max = store.profile.maxHR;
  const from = dayKey(addDays(new Date(), -days + 1));
  let easy = 0, mod = 0, hard = 0, any = false;
  store.sync.activities.filter(a => a.date >= from).forEach(a => {
    if (a.zoneSecs && a.zoneTops && a.zoneSecs.length) {
      any = true;
      a.zoneSecs.forEach((secs, i) => {
        const lo = i === 0 ? 0 : a.zoneTops[i - 1] || 0;
        const hi = a.zoneTops[i] || max;
        const mid = (lo + Math.min(hi, max)) / 2 / max;
        const m = secs / 60;
        if (mid < 0.8) easy += m; else if (mid <= 0.88) mod += m; else hard += m;
      });
    } else if (a.avgHr && a.mins) {
      any = true;
      const r = a.avgHr / max;
      if (r < 0.8) easy += a.mins; else if (r <= 0.88) mod += a.mins; else hard += a.mins;
    }
  });
  if (!any) return null;
  const total = easy + mod + hard || 1;
  return { easy: Math.round(easy), mod: Math.round(mod), hard: Math.round(hard), pct: [easy, mod, hard].map(v => Math.round((v / total) * 100)) };
}

export function latestBodyFat() {
  const w = [...wellnessSorted()].reverse().find(x => x.bodyFat > 0);
  return w ? { value: w.bodyFat, date: w.date } : null;
}
