/* What the app learns from your own data. Plain rules, no AI: every result
   says what it was based on, so you can check it.
   1. Max heart rate from your Garmin workouts.
   2. Bike intervals that adjust to how the last ones went (HR reached + effort).
   3. Your personal shin limit: run length vs the next morning's check-in.
   4. Calories that follow your weight trend. */
import { store, dayKey, addDays, parseDay } from '../store.js';
import { weekOf, DELOAD, sessionFor } from '../data/plan.js';

const isRun = a => /run/i.test(a.type);
const isBike = a => /ride/i.test(a.type);
const fmtDay = k => parseDay(k).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const daysAgo = n => dayKey(addDays(new Date(), -n));

/* ── 1. Max heart rate ───────────────────────────────────────── */
/* intervals.icu clips every reading above its own max-HR setting, so many
   workouts peaking at exactly the same number means "capped", not "your max". */
export function maxHRInsight() {
  const acts = store.sync.activities.filter(a => a.maxHr > 100 && a.date >= daysAgo(365));
  if (acts.length < 5) return { ready: false, n: acts.length };
  const peaks = new Map();
  acts.forEach(a => peaks.set(a.date, Math.max(peaks.get(a.date) || 0, a.maxHr)));
  const sorted = [...peaks.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted[0][1];
  const atTop = sorted.filter(([, v]) => v === top).length;
  const capped = atTop >= 3;
  const best = sorted[0];
  // second-highest day filters out a single strap glitch
  const learned = capped ? null : (sorted[1] || sorted[0])[1];
  const profile = store.profile.maxHR;
  let advice = null;
  if (learned && learned > profile) advice = { kind: 'raise', value: learned };
  else if (learned && learned <= profile - 6 && hardDays(60) >= 8) advice = { kind: 'lower', value: learned };
  return { ready: true, n: acts.length, top, topDate: best[0], capped, atTop, learned, profile, advice };
}

function hardDays(n) {
  const from = daysAgo(n);
  return Object.keys(store.done).filter(k => k >= from && store.done[k]?.complete && (store.done[k].rpe || 0) >= 8).length;
}

/* Raising is safe automatically (you can't hit a HR above your max); lowering needs a tap. */
export function applyLearnedMaxHR() {
  const m = maxHRInsight();
  if (m.advice?.kind === 'raise') {
    store.profile.maxHR = m.advice.value;
    store.learn = { ...(store.learn || {}), maxHR: { value: m.advice.value, date: dayKey(), from: m.topDate } };
    return true;
  }
  return false;
}

/* ── 2. Self-adjusting intervals ─────────────────────────────── */
/* Looks at your last 1–2 bike-interval days: did HR reach 90% of max, and how hard did it feel? */
function lastVo2Days(beforeKey, n = 2) {
  const out = [];
  for (let i = 1; i <= 21 && out.length < n; i++) {
    const k = dayKey(addDays(parseDay(beforeKey), -i));
    const d = store.done[k];
    if (!d?.complete || sessionFor(k)?.kind !== 'vo2') continue;
    const bike = store.sync.activities.filter(a => a.date === k && isBike(a));
    const any = store.sync.activities.filter(a => a.date === k);
    const peak = Math.max(0, ...(bike.length ? bike : any).map(a => a.maxHr || 0));
    out.push({ date: k, rpe: d.rpe ?? null, peak: peak || null });
  }
  return out;
}

/* Returns { reps: +1 | 0, cue, note } or null. Only for 4-min-style bike intervals, never in a deload week. */
export function intervalAdjust(key, session) {
  if (!session || session.kind !== 'vo2' || session.lowReadiness) return null;
  const { week } = weekOf(key);
  if (DELOAD.has(week) || week >= 14) return null;
  const t = (session.timers || []).find(x => x.mode === 'bike' && !x.steps);
  if (!t) return null;
  const hist = lastVo2Days(key);
  if (!hist.length) return null;
  const target = Math.round(store.profile.maxHR * 0.9);
  const judge = h => {
    const hit = h.peak ? h.peak >= target : null;
    if (h.rpe === null && hit === null) return null;
    if (h.rpe >= 10) return 'ease';
    if (hit === false && (h.rpe ?? 8) <= 7) return 'push';
    if (hit === false && (h.rpe ?? 8) >= 9) return 'ease';
    if (hit !== false && (h.rpe ?? 8) <= 8) return 'good';
    return 'hold';
  };
  const v = hist.map(judge).filter(Boolean);
  if (!v.length) return null;
  const last = hist[0];
  const why = `last intervals ${fmtDay(last.date)}: ${last.peak ? `HR peaked at ${last.peak}` : 'no HR data'}${last.rpe !== null ? `, effort ${last.rpe}/10` : ''}`;
  if (v[0] === 'good' && v[1] === 'good' && t.work >= 180 && t.reps < 6) {
    return { reps: 1, kind: 'more', note: `One extra rep today: your last two interval sessions hit the target HR (${target}+) at effort 8 or less (${why}).` };
  }
  if (v[0] === 'push') return { reps: 0, kind: 'push', note: `Go a notch harder on each rep (one knob turn): ${why}, below the ${target}+ target with effort to spare.` };
  if (v[0] === 'ease') return { reps: 0, kind: 'ease', note: `Start reps 1–2 a notch easier and build: ${why}. Finishing all reps beats blowing up early.` };
  if (v[0] === 'good') return { reps: 0, kind: 'good', note: `Same effort as last time, it worked (${why}). Two sessions like that in a row adds a rep.` };
  return null;
}

/* Applies the adjustment to the session in place: timer reps + the main-set item text. */
export function applyIntervalAdjust(session, adj) {
  if (!adj?.reps) return session;
  const t = session.timers.find(x => x.mode === 'bike' && !x.steps);
  const reps = t.reps + adj.reps;
  const mins = t.work / 60;
  session.timers = session.timers.map(x => (x === t ? { ...x, reps, title: `Bike ${reps}×${mins}` } : x));
  session.blocks = session.blocks.map(b => ({
    ...b,
    items: b.items.map(i => (i.mode === 'bike' && /^\d+ × \d+ min$/.test(i.name)
      ? { ...i, name: `${reps} × ${mins} min`, dose: `${reps}×${mins}`, learned: true }
      : i)),
  }));
  session.title = session.title.replace(/\b\d+×\d+\b/, `${reps}×${mins}`);
  return session;
}

/* ── 3. Personal shin limit ──────────────────────────────────── */
/* Each day you ran: total run minutes vs the next morning's check-in.
   Limit = the longest green run below the shortest run length that keeps leading to
   amber/red mornings (≥2 of them, and at least half of the runs that long). */
export function shinLimit() {
  const from = daysAgo(120);
  const byDay = new Map();
  store.sync.activities.filter(a => isRun(a) && a.mins && a.date >= from).forEach(a => {
    const d = byDay.get(a.date) || { date: a.date, mins: 0, tread: 0 };
    d.mins += a.mins;
    if (/virtual|treadmill/i.test(`${a.type} ${a.name}`)) d.tread += a.mins;
    byDay.set(a.date, d);
  });
  const rows = [...byDay.values()].map(d => {
    const next = store.checkins[dayKey(addDays(parseDay(d.date), 1))];
    return next ? { ...d, bad: next.status === 'yellow' || next.status === 'red', status: next.status } : null;
  }).filter(Boolean);
  if (rows.length < 6) return { ready: false, n: rows.length };
  const asc = [...rows].sort((a, b) => a.mins - b.mins);
  let limit = null;
  // candidates: each run length that was followed by a bad morning, shortest first
  for (const r of asc.filter(x => x.bad)) {
    const over = rows.filter(x => x.mins >= r.mins);
    const bad = over.filter(x => x.bad).length;
    if (bad >= 2 && bad / over.length >= 0.5) {
      const safe = rows.filter(x => x.mins < r.mins && !x.bad).map(x => x.mins);
      limit = safe.length ? Math.max(...safe) : Math.max(10, r.mins - 5);
      break;
    }
  }
  const surface = k => { const g = rows.filter(r => (k === 'tread' ? r.tread >= r.mins / 2 : r.tread < r.mins / 2)); return g.length >= 3 ? { n: g.length, bad: g.filter(x => x.bad).length } : null; };
  const under = limit ? rows.filter(x => x.mins <= limit) : rows;
  const over = limit ? rows.filter(x => x.mins > limit) : [];
  return {
    ready: true, n: rows.length, limit,
    under: { n: under.length, green: under.filter(x => !x.bad).length },
    over: { n: over.length, bad: over.filter(x => x.bad).length },
    tread: surface('tread'), road: surface('road'),
  };
}

/* Caps easy runs at your learned limit (rest of the time on the bike). */
export function applyShinLimit(session, sl) {
  if (!sl?.limit) return null;
  let capped = null;
  session.blocks = session.blocks.map(b => ({
    ...b,
    items: b.items.map(i => {
      const m = Number(String(i.dose).match(/(\d+)\s*min/)?.[1] || i.minutes || 0);
      if (i.mode !== 'run' || i.hard || i.adapted || m <= sl.limit) return i;
      capped = { from: m, to: sl.limit };
      return { ...i, dose: `${sl.limit} min`, minutes: sl.limit, learned: true, detail: `${i.detail ? `${i.detail.replace(/[.\s]*$/, '')}. ` : ''}Then ${m - sl.limit} min easy on the bike.` };
    }),
  }));
  return capped && `Your shin limit: runs over ${sl.limit} min were followed by an amber or red morning ${sl.over.bad} of ${sl.over.n} times, so today's run is ${capped.to} min and the other ${capped.from - capped.to} go on the bike.`;
}

/* ── 4. Calories from the weight trend ───────────────────────── */
/* Slope of the last 21 days of weigh-ins (kg/week). Only adjusts in deficit weeks. */
export function weightRate() {
  const from = daysAgo(21);
  const pts = store.weights.filter(w => w.date >= from).sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 6) return null;
  const span = (parseDay(pts[pts.length - 1].date) - parseDay(pts[0].date)) / 86400000;
  if (span < 12) return null;
  const xs = pts.map(p => (parseDay(p.date) - parseDay(pts[0].date)) / 86400000);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = pts.reduce((a, p) => a + p.kg, 0) / pts.length;
  const slope = xs.reduce((a, x, i) => a + (x - mx) * (pts[i].kg - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  return { perWeek: Math.round(slope * 7 * 100) / 100, n: pts.length, days: Math.round(span) };
}

export function calorieAdjust(week = weekOf(dayKey()).week) {
  if (week >= 12) return { delta: 0, why: null };
  const r = weightRate();
  if (!r) return { delta: 0, why: null, rate: null };
  const atGoal = r && store.weights.length && [...store.weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-3).every(w => w.kg <= store.profile.targetWeightKg);
  const loss = -r.perWeek;
  let delta = 0, add = null;
  if (atGoal) { delta = 300; add = 'You are at your target weight: eat at maintenance. 100 g more rice at lunch and toast with avocado at breakfast.'; }
  else if (loss > 0.75) { delta = 200; add = 'Add a banana and a yogurt on training days.'; }
  else if (loss > 0.5) { delta = 100; add = 'Add a banana on training days.'; }
  else if (loss < 0.1) { delta = -150; add = 'Take 100 g less potato at dinner and skip the honey on the toast.'; }
  const why = delta
    ? `Your weight is ${r.perWeek <= 0 ? 'down' : 'up'} ${Math.abs(r.perWeek).toFixed(2)} kg a week (last ${r.days} days, ${r.n} weigh-ins); the plan aims for about 0.25–0.5. ${add}`
    : `Your weight is ${r.perWeek <= 0 ? 'down' : 'up'} ${Math.abs(r.perWeek).toFixed(2)} kg a week: right on plan, no change.`;
  return { delta, why, rate: r, add };
}
