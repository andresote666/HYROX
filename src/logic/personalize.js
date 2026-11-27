/* Turns plan tokens into personal numbers from the latest benchmarks + profile,
   and computes daily fuel targets. */
import { store, latestWeight } from '../store.js';
import { fmtSec } from '../data/results.js';
import { DAY_TYPES, totals, dayTypeFor } from '../data/meals.js';
import { calorieAdjust } from './learn.js';

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
  const watts = !!store.profile.bikeWatts;
  const hr90 = Math.round(max * 0.9);
  const feel = `RPE 8–9: hard, you can only say 2–3 words. Turn the knob until ~90 rpm feels hard (90 rpm = 15 turns of your right foot in 10 s). HR should reach ${hr90}+ in the last 1–2 min of reps 2–4.`;
  const vo2w = watts
    ? (bike ? `${Math.round(bike.value * 0.85)}–${Math.round(bike.value * 0.92)} W (85–92% of your ${bike.value} W test), RPE 8–9, 85–100 rpm.` : 'RPE 8–9, 85–100 rpm, 85–90% of your 5-min test watts.')
    : feel;
  const vo2w6 = watts
    ? (bike ? `${Math.round(bike.value * 0.8)}–${Math.round(bike.value * 0.86)} W, RPE 8.` : 'RPE 8, a notch below your 4×4 effort.')
    : `RPE 8: a notch below your 4×4 effort, still only short sentences. HR ${Math.round(max * 0.88)}+ late in each rep.`;
  const b3015 = watts
    ? (bike ? `30 s at ${Math.round(bike.value * 1.0)}–${Math.round(bike.value * 1.1)} W, 15 s soft pedal.` : '30 s at the hardest power you can repeat 13 times, 15 s soft pedal.')
    : '30 s hard (RPE 9, fast legs ~100 rpm, knob firm), 15 s very easy. Pick a knob setting you can repeat all 13 times: if rep 10 dies, go lighter next set.';
  let rowthr = '2k split + 6–10 s per 500 m.';
  if (row) {
    const split = row.value / 4;
    rowthr = `Split ${fmtSec(split + 6)}–${fmtSec(split + 10)} /500 m (2k split ${fmtSec(split)}).`;
  }
  return {
    '{vo2w}': vo2w,
    '{vo2w6}': vo2w6,
    '{b3015}': b3015,
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

/* Fuel targets come from the meal plan (data/meals.js) so the numbers always
   match the menu. Deficit through week 11, +300 kcal from week 12. */
export function fuelFor(session, week) {
  const type = dayTypeFor(session);
  const hyroxDay = ['sim', 'station'].includes(session?.kind);
  const t = totals(type, { hyroxDay });
  const maint = week >= 12 || session?.kind === 'race';
  const learned = maint ? { delta: 0 } : calorieAdjust(week);
  const kcal = t.kcal + (maint ? 300 : 0) + learned.delta;
  return {
    type, label: DAY_TYPES[type].label, hard: type === 'big', deficit: !maint && learned.delta < 300,
    kcal, protein: t.p, carbs: t.c + (maint ? 40 : 0) + Math.round(learned.delta / 4), fat: t.f, learned,
    note: session?.kind === 'race' ? 'Race day: breakfast ≈190 g carbs 3 h before, gels at Run 5 and Run 7.'
      : week >= 15 ? 'Taper and race weeks: no deficit. Carb load 6–8 g/kg in the last 2 days.'
      : type === 'big' ? 'Big day: extra carbs before and after training. Never do intervals on an empty tank.'
      : type === 'rest' ? 'Rest day: smaller portions of carbs, same protein.'
      : 'Training day: snack before training, shake after.',
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
