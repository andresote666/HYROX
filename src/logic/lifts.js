/* Strength logging helpers. */

/* "100 x 5" → estimated 1-rep max (Epley: kg × (1 + reps/30)); valid for 1–10 reps. */
export function parseSet(raw) {
  const m = String(raw || '').trim().replace(',', '.').match(/^(\d+(?:\.\d+)?)\s*(?:kg)?\s*[x×*]\s*(\d{1,2})$/i);
  if (!m) return null;
  const kg = Number(m[1]), reps = Number(m[2]);
  if (!(kg > 0) || reps < 1 || reps > 10) return null;
  return { kg, reps, e1rm: Math.round((reps === 1 ? kg : kg * (1 + reps / 30)) * 2) / 2 };
}
