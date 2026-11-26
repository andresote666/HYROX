/* Persistent state — everything lives in localStorage on the phone.
   One versioned key so the whole thing can be exported / imported as JSON. */

const KEY = 'hyrox27-state';
const VERSION = 1;

const defaults = () => ({
  version: VERSION,
  profile: {
    name: 'Andy',
    age: 35,
    heightCm: 193,
    weightKg: 97,
    targetWeightKg: 94,
    maxHR: 193,
    restHR: 52,
    raceId: 'ba27',
  },
  checkins: {},     // { 'YYYY-MM-DD': { morning, hop, palpation, focal, settled, sleep, energy, status, ts } }
  done: {},         // { 'YYYY-MM-DD': { 'b0-i2': true, ... , _complete: true, rpe } }
  swaps: {},        // { 'w3': [0,1,2,3,4,5,6] }
  variants: {},     // { 'YYYY-MM-DD': 'B' }
  weights: [],      // [{ date, kg }]
  benchmarks: [],   // [{ date, id, value }]
  notes: {},        // { 'YYYY-MM-DD': 'text' }
  sync: { token: '', last: null, error: null, wellness: {}, activities: [] }, // Garmin via intervals.icu
  ui: { tab: 'today', libSection: 'stations' },
});

function deepMerge(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return extra ?? base;
  const out = { ...base };
  for (const k of Object.keys(extra)) {
    out[k] = base && typeof base[k] === 'object' && !Array.isArray(base[k]) && base[k] !== null
      ? deepMerge(base[k], extra[k])
      : extra[k];
  }
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return deepMerge(defaults(), JSON.parse(raw));
  } catch {
    return defaults();
  }
}

export const store = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* storage full or blocked */ }
}

export function exportJSON() {
  return JSON.stringify(store, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !parsed.profile) throw new Error('This file is not a HYROX PREP backup.');
  const merged = deepMerge(defaults(), parsed);
  Object.keys(store).forEach(k => delete store[k]);
  Object.assign(store, merged);
  save();
}

export function resetAll() {
  const fresh = defaults();
  Object.keys(store).forEach(k => delete store[k]);
  Object.assign(store, fresh);
  save();
}

/* ── date helpers (local time, ISO day keys) ── */
export function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDay(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function latestWeight() {
  const w = [...store.weights].sort((a, b) => a.date.localeCompare(b.date));
  return w.length ? w[w.length - 1].kg : store.profile.weightKg;
}
