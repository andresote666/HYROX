/* Race simulation: builds the list of parts to lap (runs, Roxzone transitions,
   stations) from a sim session or a standard race layout, and saves results.
   Parts done as a substitute (bike for a run, row for the SkiErg, half BBJ,
   anything adapted for the shins) are timed but don't feed the prediction. */
import { store, save } from '../store.js';
import { SEGMENTS, toSec } from '../data/results.js';
import { TARGETS } from '../data/races.js';

export const ROX_EACH = Math.round(toSec(TARGETS.rox.t) / 16); // ≈24 s per transition

const isRun = seg => /^r\d$/.test(seg);
const STATION = {
  ski: ['SkiErg 1,000 m', 'SkiErg'], push: ['Sled push 50 m', 'Sled push'], pull: ['Sled pull 50 m', 'Sled pull'],
  bbj: ['Burpee broad jumps 80 m', 'Burpee broad jumps'], row: ['Row 1,000 m', 'Row'], farm: ['Farmers carry 200 m', 'Farmers carry'],
  lunge: ['Sandbag lunges 100 m', 'Lunges'], wb: ['Wall balls 100', 'Wall balls'],
};

function part(seg, o = {}) {
  const run = isRun(seg);
  return {
    seg,
    kind: run ? 'run' : 'station',
    label: o.label || (run ? `Run ${seg.slice(1)} · 1 km` : STATION[seg][0]),
    speak: o.speak || (run ? `Run ${seg.slice(1)}` : STATION[seg][1]),
    target: o.target ?? toSec(TARGETS[seg].t),
    counts: o.counts ?? true,
  };
}

/* A Roxzone transition between every two parts, as in the race. */
function withTransitions(parts) {
  const out = [];
  parts.forEach((p, i) => {
    out.push(p);
    const next = parts[i + 1];
    if (next) out.push({ seg: 'rox', kind: 'rox', label: `Roxzone → ${next.kind === 'run' ? 'run' : next.speak.toLowerCase()}`, speak: 'Transition', target: ROX_EACH, counts: true });
  });
  return out;
}

export const SIM_TYPES = {
  full: { label: 'Full race', sub: '8 runs + 8 stations', segs: SEGMENTS.filter(s => s.type !== 'rox').map(s => s.id) },
  halfA: { label: 'Half A', sub: 'Runs 1–4, SkiErg to burpees', segs: ['r1', 'ski', 'r2', 'push', 'r3', 'pull', 'r4', 'bbj'] },
  halfB: { label: 'Half B', sub: 'Runs 5–8, row to wall balls', segs: ['r5', 'row', 'r6', 'farm', 'r7', 'lunge', 'r8', 'wb'] },
};

export function partsForType(type) {
  return withTransitions(SIM_TYPES[type].segs.map(seg => part(seg, seg === 'ski' ? { label: 'SkiErg 1,000 m (or your substitute)', counts: false } : {})));
}

const typeOf = parts => {
  const has = id => parts.some(p => p.seg === id);
  if (has('r1') && has('r8')) return 'full';
  if (has('r1')) return 'halfA';
  if (has('r8')) return 'halfB';
  return 'custom';
};

/* Map a simulation session's items to race parts. Null if it isn't a race-style sim. */
export function partsForSession(session) {
  if (!session || session.kind !== 'sim') return null;
  const parts = [];
  session.blocks.flatMap(b => b.items).forEach(i => {
    const name = i.original || i.name;
    const adapted = !!i.adapted;
    let m;
    if ((m = name.match(/^1 km run \(leg (\d)\)/))) {
      parts.push(adapted
        ? part(`r${m[1]}`, { label: `${i.name} (for Run ${m[1]})`, speak: 'Bike', target: 240, counts: false })
        : part(`r${m[1]}`));
    } else if ((m = name.match(/bike at threshold \(leg (\d)\)/))) {
      parts.push(part(`r${m[1]}`, { label: `Bike 4 min (for Run ${m[1]})`, speak: 'Bike, 4 minutes', target: 240, counts: false }));
    } else if (/SkiErg substitute/.test(name)) {
      parts.push(part('ski', { label: 'Row 1,000 m (for the SkiErg)', speak: 'Row, for the ski', counts: false }));
    } else if (/^Sled push/i.test(name) && /50 m/.test(i.dose)) parts.push(part('push'));
    else if (/^Sled pull/i.test(name) && /50 m/.test(i.dose)) parts.push(part('pull'));
    else if ((i.mode === 'jump' || adapted) && /(BBJ|Burpee broad)/i.test(name)) {
      const half = /40 m/.test(i.dose);
      if (adapted) parts.push(part('bbj', { label: i.name, speak: 'Burpees', target: half ? 200 : toSec(TARGETS.bbj.t), counts: false }));
      else parts.push(half ? part('bbj', { label: 'Burpee broad jumps 40 m', target: Math.round(toSec(TARGETS.bbj.t) / 2), counts: false }) : part('bbj'));
    } else if (/^Row 1,000 m/.test(name)) parts.push(part('row'));
    else if (/^Farmers/i.test(name)) parts.push(part('farm'));
    else if (/lunges/i.test(name) && /100 m/.test(i.dose)) parts.push(part('lunge'));
    else if (/^Wall balls/i.test(name) && String(i.dose) === '100') parts.push(part('wb'));
  });
  if (parts.filter(p => p.counts).length < 4) return null;
  return withTransitions(parts);
}

export const simType = typeOf;

export function saveSim(live) {
  const parts = live.parts.map((p, i) => ({ ...p, secs: Math.round((live.laps[i] - (live.laps[i - 1] || 0)) / 1000) }));
  const total = Math.round(live.laps[live.laps.length - 1] / 1000);
  const rec = {
    id: `sim${Date.now()}`, date: live.date, type: typeOf(live.parts), title: live.title, parts, total,
    target: live.parts.reduce((a, p) => a + p.target, 0),
  };
  store.sims = [rec, ...(store.sims || [])].slice(0, 20);
  store.simLive = null;
  save();
  return rec;
}

export function deleteSim(id) {
  store.sims = (store.sims || []).filter(s => s.id !== id);
  save();
}
