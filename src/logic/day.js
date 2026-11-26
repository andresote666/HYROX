import { store } from '../store.js';
import { sessionFor } from '../data/plan.js';
import { adaptSession, runGate } from './readiness.js';
import { personalize } from './personalize.js';

/* Everything the UI needs for one date: the planned session, adapted to the
   shin check-in + run gate + readiness, with personal numbers filled in. */
export function resolveDay(key, { express = false } = {}) {
  const base = sessionFor(key);
  if (!base) return null;
  const checkin = store.checkins[key] || null;
  const gate = runGate(store.checkins, key);
  const status = checkin?.status || 'green';
  const { session, notes } = adaptSession(base, status, checkin?.readiness || 'normal', { runLocked: !gate.allow });
  const s = personalize(session);
  s.express = express && s.blocks.some(b => b.optional);
  return { session: s, base, checkin, gate, notes, status: checkin?.status || null };
}
