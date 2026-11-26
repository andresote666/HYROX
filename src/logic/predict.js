/* Race-time predictor. Starts from your Rio splits and replaces each one with
   the newest evidence:
   1. A race simulation in the last 6 weeks (front half ×1.00, back half ×1.05
      because a half sim starts fresh, full sim ×0.98 because it's run at ~95%).
   2. A station test, scaled so that hitting the test goal = hitting the race
      target (e.g. 100 wall balls in 4:30 fresh → 6:30 in the race).
   3. Runs and row: your Rio split scaled by how much your engine has improved
      (1 km test, else Garmin VO₂max, else row 2k), capped at ±12%.
   Ski and farmers stay at Rio (no SkiErg; farmers is already a strength). */
import { store, dayKey, parseDay, addDays } from '../store.js';
import { SEGMENTS, RIO_2026, toSec } from '../data/results.js';
import { TARGETS } from '../data/races.js';
import { BENCHMARKS } from '../data/benchmarks.js';
import { latestBench, firstBench } from './personalize.js';
import { vo2Trend } from './sync.js';

const bench = id => BENCHMARKS.find(b => b.id === id);
const ratio = (seg, benchId) => toSec(TARGETS[seg].t) / bench(benchId).target;
const fmtDate = k => parseDay(k).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/* Station tests: [benchmark, label] in order of preference. */
const STATION_TESTS = {
  push: [['push50', 'sled push test']],
  pull: [['pull50', 'sled pull test']],
  bbj: [['bbj80', '80 m burpee test']],
  wb: [['wb100', '100 wall-ball test'], ['karen', '150 wall-ball test']],
};
const SIM_FACTOR = { full: 0.98, halfA: 1.0, halfB: 1.05, custom: 1.03 };

/* How much faster the engine is since the start: time multiplier (<1 = faster). */
export function engineFactor() {
  const clamp = f => Math.min(1.05, Math.max(0.88, f));
  const r1 = firstBench('run1k'), rL = latestBench('run1k');
  if (r1 && rL && rL.date > r1.date) return { f: clamp(rL.value / r1.value), from: '1 km tests' };
  const v = vo2Trend();
  if (v && v.latestDate >= '2026-11-23' && v.change && v.base) return { f: clamp(v.base / v.latest), from: `Garmin VO₂max ${v.base} → ${v.latest}` };
  const w1 = firstBench('row2k'), wL = latestBench('row2k');
  if (w1 && wL && wL.date > w1.date) return { f: clamp(1 - (1 - wL.value / w1.value) * 0.6), from: '2 km row tests' };
  return { f: 1, from: null };
}

function simEvidence(seg, since) {
  for (const s of store.sims || []) {
    if (s.date < since) continue;
    if (seg === 'rox') {
      const rox = s.parts.filter(p => p.kind === 'rox' && p.secs > 0);
      if (rox.length >= 3) {
        const each = rox.reduce((a, p) => a + p.secs, 0) / rox.length;
        return { secs: Math.round(each * 16), date: s.date, label: `simulation ${fmtDate(s.date)}` };
      }
      continue;
    }
    const p = s.parts.find(x => x.seg === seg && x.counts && x.secs > 0);
    if (p) return { secs: Math.round(p.secs * (SIM_FACTOR[s.type] || 1)), date: s.date, label: `simulation ${fmtDate(s.date)}` };
  }
  return null;
}

function testEvidence(seg) {
  for (const [id, label] of STATION_TESTS[seg] || []) {
    const b = latestBench(id);
    if (b) return { secs: Math.round(b.value * ratio(seg, id)), date: b.date, label: `${label} ${fmtDate(b.date)}` };
  }
  return null;
}

export function predict(todayKey = dayKey()) {
  const since = dayKey(addDays(parseDay(todayKey), -42));
  const eng = engineFactor();
  const segs = SEGMENTS.map(s => {
    const rio = toSec(RIO_2026.splits[s.id]);
    const target = toSec(TARGETS[s.id].t);
    const options = [simEvidence(s.id, since), testEvidence(s.id)].filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
    let pick = options[0];
    let source = pick ? (pick.label.startsWith('simulation') ? 'sim' : 'test') : 'rio';
    if (!pick) {
      if ((s.type === 'run' || s.id === 'row') && eng.f !== 1) {
        pick = { secs: Math.round(rio * eng.f), label: eng.from };
        source = 'engine';
      } else pick = { secs: rio, label: 'Rio split' };
    }
    return { ...s, rio, target, secs: pick.secs, source, from: pick.label };
  });
  // Rio's official time is 7 s under the sum of its rounded splits; keep the two consistent.
  const rioTotal = toSec(RIO_2026.total);
  const offset = rioTotal - segs.reduce((a, s) => a + s.rio, 0);
  const total = segs.reduce((a, s) => a + s.secs, 0) + offset;
  const goal = segs.reduce((a, s) => a + s.target, 0);
  const gaps = segs.map(s => ({ ...s, gap: s.secs - s.target })).filter(s => s.gap > 15).sort((a, b) => b.gap - a.gap);
  const evidence = {
    sims: new Set(segs.filter(s => s.source === 'sim').map(s => s.from)).size,
    tests: segs.filter(s => s.source === 'test').length,
    engine: segs.some(s => s.source === 'engine') ? eng.from : null,
    updated: segs.filter(s => s.source !== 'rio').length,
  };
  return { segs, total, goal, rioTotal, gaps, evidence };
}

