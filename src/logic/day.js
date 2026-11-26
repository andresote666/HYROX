import { store } from '../store.js';
import { sessionFor } from '../data/plan.js';
import { adaptSession, runGate } from './readiness.js';
import { personalize } from './personalize.js';
import { hrvStatus, rhrStatus, runLoad } from './sync.js';

/* Everything the UI needs for one date: the planned session, adapted to the
   shin check-in + run gate + readiness (check-in, Garmin HRV and resting HR),
   with personal numbers filled in. */
export function resolveDay(key, { express = false } = {}) {
  const base = sessionFor(key);
  if (!base) return null;
  const checkin = store.checkins[key] || null;
  const gate = runGate(store.checkins, key);
  const status = checkin?.status || 'green';

  const hrv = hrvStatus(key);
  const rhr = rhrStatus(key);
  const recovery = [];
  if (hrv.status === 'low') recovery.push(`HRV 7-day average ${hrv.avg7} ms is below your normal ${hrv.band[0]}–${hrv.band[1]} ms`);
  if (rhr.status === 'elevated') recovery.push(`Resting HR ${rhr.today} bpm is ${rhr.today - rhr.base} above your week`);
  let readiness = checkin?.readiness || 'normal';
  if (recovery.length) readiness = 'low';

  const { session, notes } = adaptSession(base, status, readiness, { runLocked: !gate.allow });
  if (recovery.length && ['vo2', 'threshold', 'sim'].includes(session.kind)) {
    notes.splice(notes.length - 1, 0, `Garmin: ${recovery.join('; ')}.`);
  }

  // 10% rule on the longest run in the last 30 days (Frandsen 2025)
  const load = runLoad(key);
  if (load.capMins && gate.allow && status !== 'red') {
    const over = session.blocks.flatMap(b => b.items).find(i => i.mode === 'run' && !i.adapted && !i.hard && (i.minutes || 0) > load.capMins);
    if (over) notes.push(`Longest run in the last 30 days was ${load.longestMins} min, so cap continuous running at ${load.capMins} min today (no run more than 10% longer).`);
  }

  const s = personalize(session);
  s.express = express && s.blocks.some(b => b.optional);
  return { session: s, base, checkin, gate, notes, status: checkin?.status || null, hrv, rhr, load };
}
