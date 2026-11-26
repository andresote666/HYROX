/* Turns plan tokens into personal numbers from the latest benchmarks + profile,
   and computes daily fuel targets. */
import { store, latestWeight } from '../store.js';
import { fmtSec } from '../data/results.js';

export function latestBench(id) {
  const rows = store.benchmarks.filter(b => b.id === id).sort((a, b) => a.date.localeCompare(b.date));
  return rows.length ? rows[rows.length - 1] : null;
}
export function firstBench(id) {
  const rows = store.benchmarks.filter(b => b.id === id).sort((a, b) => a.date.localeCompare(b.date));
  return rows.length ? rows[0] : null;
}

export function zones() {
  const max = store.profile.maxHR;
  return [
    { id: 'Z1', name: 'Recovery', lo: 0, hi: Math.round(max * 0.7), use: 'Warm-ups, recovery spins' },
    { id: 'Z2', name: 'Aerobic base', lo: Math.round(max * 0.7), hi: Math.round(max * 0.78), use: 'Easy runs, long bike and row. 75–80% of your training.' },
    { id: 'Z3', name: 'Tempo', lo: Math.round(max * 0.78), hi: Math.round(max * 0.85), use: 'Grey zone: keep it small' },
    { id: 'Z4', name: 'Threshold', lo: Math.round(max * 0.85), hi: Math.round(max * 0.9), use: 'Row threshold, HYROX race effort' },
    { id: 'Z5', name: 'VO₂max', lo: Math.round(max * 0.9), hi: max, use: 'Last minutes of 4×4 reps, 30/15 sets' },
  ];
}

export function tokens() {
  const max = store.profile.maxHR;
  const bike = latestBench('bike5');
  const row = latestBench('row2k');
  const vo2w = bike
    ? `${Math.round(bike.value * 0.85)}–${Math.round(bike.value * 0.92)} W (85–92% of your ${bike.value} W test)`
    : '85–90% of your 5-min test power, or RPE 8–9';
  let rowthr = '2k split + 6–10 s per 500 m.';
  if (row) {
    const split = row.value / 4;
    rowthr = `Split ${fmtSec(split + 6)}–${fmtSec(split + 10)} /500 m (2k split ${fmtSec(split)}).`;
  }
  return {
    '{vo2w}': vo2w,
    '{hr90}': `${Math.round(max * 0.9)} bpm`,
    '{z2}': `${Math.round(max * 0.7)}–${Math.round(max * 0.78)} bpm`,
    '{rowthr}': rowthr,
  };
}

export function personalize(session) {
  if (!session) return session;
  const t = tokens();
  const fix = s => (typeof s === 'string' ? s.replace(/\{\w+\}/g, m => t[m] ?? m) : s);
  const walk = o => {
    if (Array.isArray(o)) return o.map(walk);
    if (o && typeof o === 'object') {
      const out = {};
      for (const k of Object.keys(o)) out[k] = walk(o[k]);
      return out;
    }
    return fix(o);
  };
  return walk(session);
}

/* Fuel targets (research/02 §E). Deficit ≈300 kcal through week 11, maintenance after. */
export function fuelFor(session, week) {
  const kg = latestWeight();
  const hard = session && ['vo2', 'sim', 'race', 'threshold', 'strength', 'station'].includes(session.kind);
  const deficit = week <= 11 && session?.kind !== 'race';
  const protein = [Math.round(kg * 1.8), Math.round(kg * 2.2)];
  const carbs = hard ? [Math.round(kg * 5), Math.round(kg * 7)] : [Math.round(kg * 3), Math.round(kg * 5)];
  let kcal = hard ? [3400, 3800] : [2800, 3100];
  if (!deficit) kcal = kcal.map(k => k + 300);
  if (session?.kind === 'race') kcal = [3600, 4200];
  return {
    hard, deficit, protein, carbs, kcal,
    note: session?.kind === 'race' ? 'Race day: breakfast ≈2 g/kg carbs 3 h before, gels at Run 5 and Run 7.'
      : week >= 15 ? 'Taper and race weeks: no deficit. Carb load 6–8 g/kg in the last 2 days.'
      : hard ? 'Hard day: put most carbs before and after the session. Never do intervals low on carbs.'
      : 'Easy day: carbs lower, protein the same, 4–5 meals of 30–40 g protein.',
  };
}

/* 7-day rolling average weight trend */
export function weightTrend() {
  const rows = [...store.weights].sort((a, b) => a.date.localeCompare(b.date));
  return rows.map((r, i) => {
    const win = rows.slice(Math.max(0, i - 6), i + 1);
    return { date: r.date, kg: r.kg, avg: win.reduce((a, b) => a + b.kg, 0) / win.length };
  });
}
