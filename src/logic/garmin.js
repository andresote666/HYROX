/* Planned workouts on the watch.
   Turns a day's session (already adapted to the shin check-in and filled with
   your numbers) into intervals.icu workout text. The Vercel function puts it on
   your intervals.icu calendar, intervals.icu uploads planned workouts to Garmin
   Connect, and the watch picks them up on its next sync.

   Sent as steps: bike, run and row (warm-up, intervals, cool-down, with heart
   rate targets as % of max HR). In simulations and station circuits, every
   station is a "Press lap" step: do the station, press lap, next step starts.
   Strength, mobility and EMOM blocks stay in the app (and its timers). */
import { store, save, dayKey, addDays } from '../store.js';
import { resolveDay } from './day.js';
import { TARGETS } from '../data/races.js';
import { toSec } from '../data/results.js';

const SPORT = { run: 'Run', bike: 'Ride', row: 'Rowing' };
const HR = { easy: '60-70% HR', z2: '70-78% HR', thr: '82-88% HR', vo2: '88-95% HR', long: '85-92% HR' };
export const DAYS_AHEAD = 7;

/* ── text helpers ── */
// Step names must not contain numbers or units: intervals.icu would read them as durations or targets.
const UNIT_WORDS = /\b(HR|LTHR|FTP|Pace|rpm|spm|bpm|ramp|freeride|press|lap|Z\d|km|kg|min|mtr|m|s|w)\b/gi;
export function stepName(t) {
  const out = String(t || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\d+([.,:]\d+)*/g, ' ')
    .replace(UNIT_WORDS, ' ')
    .replace(/[×x](?=\s|$)/g, ' ')
    .replace(/[·:+~–—/%≤≥<>′″'"→,;.!?-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return out ? out[0].toUpperCase() + out.slice(1) : '';
}

export function dur(secs) {
  const s = Math.max(5, Math.round(secs));
  return s % 60 ? `${s}s` : `${s / 60}m`;
}

const minsFrom = item => {
  const m = String(item.dose || '').match(/(\d+(?:\.\d+)?)\s*min/);
  if (m) return Number(m[1]);
  return item.minutes || null;
};

/* Race-pace range from a cue such as "6:00/km" or "5:05", else 5:30/km. */
function paceRange(text) {
  const m = String(text || '').match(/(\d):(\d\d)/);
  const mid = m ? Number(m[1]) * 60 + Number(m[2]) : 330;
  const f = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return `${f(mid + 10)}-${f(mid - 10)}/km Pace`;
}

/* Rough station times, only used for the workout length on the watch. */
const STATIONS = [
  [/sled push/i, 'Sled push', 'push', 50],
  [/sled pull/i, 'Sled pull', 'pull', 50],
  [/bbj|burpee broad/i, 'Burpee broad jumps', 'bbj', 80],
  [/farmer/i, 'Farmers carry', 'farm', 200],
  [/lunge/i, 'Sandbag lunges', 'lunge', 100],
  [/wall ball/i, 'Wall balls', 'wb', 100],
  [/skierg/i, 'Row for the SkiErg', 'ski', 0],
  [/^row|row 1,000|1,000 m row/i, 'Row', 'row', 0],
];
function station(item) {
  const text = `${item.name} ${item.original || ''}`;
  const hit = STATIONS.find(([re]) => re.test(text));
  const dose = String(item.dose || '');
  const sets = Number(dose.match(/^(\d+)\s*×/)?.[1] || 1);
  if (!hit) return { name: stepName(item.name) || 'Station', secs: 120 * sets };
  const [, name, seg, full] = hit;
  let secs = toSec(TARGETS[seg].t);
  if (seg === 'wb') {
    const reps = Number(dose.match(/(\d+)(?!.*\d)/)?.[1] || 100);
    secs = Math.round(secs * (reps / 100));
  } else if (full) {
    const dist = Number(dose.match(/(\d+(?:\.\d+)?)\s*m\b/)?.[1] || full);
    secs = Math.round(secs * (dist / full));
  }
  return { name, secs: Math.max(30, secs * sets) };
}

/* ── one workout being built ── */
class Workout {
  constructor(sport, name) {
    this.sport = sport;
    this.name = name;
    this.sections = []; // { title, reps, lines: [text], secs }
    this.secs = 0;
  }
  section(title, reps = 1) {
    const s = { title, reps, lines: [], secs: 0 };
    this.sections.push(s);
    return s;
  }
  add(sec, text, secs, target = '') {
    sec.lines.push(`- ${text ? `${text} ` : ''}${dur(secs)}${target ? ` ${target}` : ''}`);
    sec.secs += secs;
  }
  lap(sec, text, secs) {
    const est = Math.max(60, Math.round(secs / 60) * 60); // only an estimate: the step ends when you press lap
    sec.lines.push(`- Press lap ${text} ${dur(est)}`);
    sec.secs += est;
  }
  get text() {
    return this.sections.filter(s => s.lines.length)
      .map(s => `${s.title}${s.reps > 1 ? ` ${s.reps}x` : ''}\n${s.lines.join('\n')}`).join('\n\n');
  }
  get total() { return this.sections.reduce((a, s) => a + s.secs * s.reps, 0); }
  get empty() { return !this.sections.some(s => s.lines.length); }
}

/* An interval timer from the plan (bike or row) as warm-up, main set, cool-down. */
function addTimer(w, t, { warmup = true, cooldown = true } = {}) {
  const easy = t.mode === 'row' ? 'Easy row' : 'Easy spin';
  if (t.steps) {
    const sec = w.section('Session');
    t.steps.forEach(st => {
      const name = st.kind === 'prep' ? (st.label === 'Cool-down' ? 'Cool down' : 'Warm up')
        : st.kind === 'rest' ? 'Easy' : stepName(st.label) || 'Hard';
      w.add(sec, name, st.secs, st.kind === 'work' ? '' : HR.easy);
    });
    return;
  }
  if (warmup && t.warmup) w.add(w.section('Warm-up'), easy, t.warmup, HR.easy);
  const workTarget = t.mode === 'row' ? HR.thr : t.work >= 300 ? HR.long : t.work >= 180 ? HR.vo2 : '';
  const restTarget = t.rest >= 60 ? HR.easy : '';
  const work = t.work <= 45 ? 'Hard' : t.mode === 'row' ? 'Threshold' : 'Hard';
  const sets = t.sets || 1;
  for (let k = 0; k < sets; k++) {
    const main = w.section(sets > 1 ? `Set ${'ABCDEF'[k]}` : 'Main set', t.reps);
    w.add(main, work, t.work, workTarget);
    if (t.rest) w.add(main, t.rest < 60 ? 'Soft pedal' : easy, t.rest, restTarget);
    if (t.setRest && k < sets - 1) w.add(w.section('Recover'), easy, t.setRest, HR.easy);
  }
  if (cooldown && t.cooldown) w.add(w.section('Cool-down'), easy, t.cooldown, HR.easy);
}

const isWarm = (item, block) => /warm|spin-ups|build to/i.test(`${item.name} ${block.title}`);

/* One cardio item as steps (bike, run or row). Returns false if it has nothing to send. */
function addCardio(w, sec, item, block) {
  const mins = minsFrom(item);
  const text = `${item.name} ${item.detail || ''}`;
  if (item.mode === 'run') {
    const wr = String(item.dose).match(/(\d+)×\((\d+)′\/(\d+)′\)/);
    if (wr) {
      const s = w.section('Walk-run', Number(wr[1]));
      w.add(s, 'Run easy', Number(wr[2]) * 60, HR.z2);
      w.add(s, 'Walk', Number(wr[3]) * 60);
      return true;
    }
    if (/\b1 km\b/.test(item.dose) && !item.adapted) {
      sec.lines.push(`- Run 1km ${paceRange(item.detail)}`);
      sec.secs += 330;
      return true;
    }
    const strides = Number(text.match(/(\d+) strides/)?.[1] || 0);
    if (!mins) return false;
    w.add(sec, /half/.test(item.name) ? 'Easy run, then bike' : 'Easy run', Math.max(5, mins - strides) * 60, HR.z2);
    if (strides) {
      const s = w.section('Strides', strides);
      w.add(s, 'Stride, fast and relaxed', 20);
      w.add(s, 'Walk back', 60);
    }
    return true;
  }
  if (item.mode === 'bike') {
    const m = mins || (/\b1 km\b/.test(item.dose) ? 5 : null);
    if (!m) return false;
    const target = isWarm(item, block) || /<\s*135|easy spin|very easy|shake/i.test(text) ? HR.easy
      : /threshold|RPE 7|hard reps|same intervals/i.test(text) ? HR.thr
      : HR.z2;
    const name = target === HR.easy ? 'Easy spin' : target === HR.thr ? 'Bike hard' : 'Zone two ride';
    w.add(sec, name, m * 60, target);
    return true;
  }
  if (item.mode === 'row') {
    if (/2k|2,000/.test(`${item.dose} ${item.name}`)) { w.lap(sec, 'Row test, all out', 480); return true; }
    if (/1,000|leg/.test(item.dose)) { w.lap(sec, /skierg/i.test(item.name) ? 'Row for the SkiErg' : /bike/.test(item.name) ? 'Row or bike' : 'Row', 270); return true; }
    if (/HR check/i.test(item.name)) { w.add(sec, 'Steady row, note heart rate', (mins || 5) * 60); return true; }
    if (!mins) return false;
    const easy = /very easy/i.test(text) || !/zone 2/i.test(item.name);
    w.add(sec, easy ? 'Easy row' : 'Zone two row', mins * 60, easy ? HR.easy : HR.z2);
    return true;
  }
  return false;
}

/* Simulations and station circuits: one workout, stations as "Press lap" steps. */
function simWorkout(s) {
  const items = s.blocks.flatMap(b => b.items);
  const sport = items.some(i => i.mode === 'run') ? 'Run' : items.some(i => i.mode === 'bike') ? 'Ride' : items.some(i => i.mode === 'row') ? 'Rowing' : null;
  if (!sport) return [];
  const w = new Workout(sport, s.title);
  s.blocks.forEach(b => {
    if (/transition/i.test(b.title) || b.optional) return;
    const rounds = b.title.match(/^(\d+)\s+rounds?/i);
    const rest = b.title.match(/(\d+)\s*(s|min)\s+rest/i);
    const sec = w.section(rounds ? 'Rounds' : stepName(b.title) || 'Session', rounds ? Number(rounds[1]) : 1);
    b.items.forEach(i => {
      if (i.mode === 'mobility') return;
      if (SPORT[i.mode] && addCardio(w, sec, i, b)) return;
      const st = station(i);
      w.lap(sec, st.name, st.secs);
    });
    if (rest) w.add(sec, 'Rest', Number(rest[1]) * (rest[2] === 'min' ? 60 : 1));
  });
  return w.empty ? [] : [w];
}

/* Other days: each stretch of bike, run or row becomes its own workout (Tuesday = bike, then the run off the bike).
   Lifting stays in the app. The watch name drops the " + Upper A" part of the title. */
function cardioWorkouts(s) {
  const out = [];
  let cur = null;
  let timers = (s.timers || []).filter(t => t.mode === 'bike' || t.mode === 'row');
  s.blocks.forEach(b => {
    b.items.forEach(i => {
      const sport = SPORT[i.mode];
      if (!sport) return; // strength, stations, mobility: stay in the app
      if (!cur || cur.sport !== sport) {
        cur = new Workout(sport, out.length || s.kind === 'strength' ? i.name : s.title.split(' + ')[0]);
        cur.sec = cur.section(sport === 'Run' ? 'Run' : 'Session');
        out.push(cur);
      }
      const t = (i.mode === 'bike' || i.mode === 'row') && /×|x\d|\d+ sets|max test/i.test(`${i.dose} ${i.name}`) ? timers.find(x => x.mode === i.mode) : null;
      if (t) {
        timers = timers.filter(x => x !== t);
        // the timer has its own warm-up: drop the separate warm-up item
        if (t.warmup || t.steps) cur.sections = cur.sections.filter(sec => !sec.lines.every(l => /Easy spin|Easy row/.test(l)));
        const laterSame = s.blocks.flatMap(x => x.items).slice(s.blocks.flatMap(x => x.items).indexOf(i) + 1).find(x => SPORT[x.mode]);
        addTimer(cur, t, { cooldown: !laterSame || SPORT[laterSame.mode] !== sport });
        cur.sec = cur.section('Then');
        return;
      }
      addCardio(cur, cur.sec, i, b);
    });
  });
  // tiny leftovers (8-min warm-up before lifting, 5-min cool-down spin) aren't worth a watch workout
  return out.filter(w => !w.empty && (w.sport === 'Run' || w.total >= 10 * 60));
}

/* Workouts for one date, ready for /api/intervals. */
export function workoutsFor(key) {
  const day = resolveDay(key);
  const s = day?.session;
  if (!s || s.kind === 'rest' || s.kind === 'race') return [];
  const list = ['sim', 'station'].includes(s.kind) ? simWorkout(s) : cardioWorkouts(s);
  return list.map(w => ({ type: w.sport, name: w.name.slice(0, 80), description: w.text, moving_time: Math.round(w.total) }));
}

/* ── sending ── */
const hash = str => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};
export const garminState = () => store.garmin;
export const upcomingKeys = (from = dayKey()) => Array.from({ length: DAYS_AHEAD }, (_, i) => dayKey(addDays(new Date(`${from}T12:00:00`), i)));

/* 'sent' = on the watch as planned now; 'changed' = sent, but the plan changed since; null = never sent. */
export function sentState(key) {
  const prev = store.garmin.sent[key];
  if (!prev) return null;
  return prev.h === hash(JSON.stringify(workoutsFor(key))) ? 'sent' : 'changed';
}

let inFlight = null;
export function sendToGarmin(keys, { onlyChanged = false } = {}) {
  if (!store.sync.token) return Promise.resolve({ ok: false, message: 'Add your sync code in Settings first.' });
  if (inFlight) return inFlight;
  const today = dayKey();
  const days = keys.filter(k => k >= today).map(date => {
    const events = workoutsFor(date);
    return { date, events, h: hash(JSON.stringify(events)) };
  }).filter(d => !onlyChanged || store.garmin.sent[d.date]?.h !== d.h)
    .filter(d => d.events.length || store.garmin.sent[d.date]); // empty day only matters if something was sent before
  if (!days.length) return Promise.resolve({ ok: true, created: 0, unchanged: true, message: 'Already up to date' });
  inFlight = (async () => {
    try {
      const r = await fetch('/api/intervals', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-sync-token': store.sync.token },
        body: JSON.stringify({ action: 'plan', days: days.map(({ date, events }) => ({ date, events })) }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.message || `Sending failed (${r.status})`);
      const at = new Date().toISOString();
      days.forEach(d => { store.garmin.sent[d.date] = { h: d.h, at, n: d.events.length }; });
      // forget days that are long gone
      Object.keys(store.garmin.sent).forEach(k => { if (k < dayKey(addDays(new Date(), -14))) delete store.garmin.sent[k]; });
      store.garmin.last = at;
      store.garmin.error = null;
      save();
      const n = days.reduce((a, d) => a + d.events.length, 0);
      return { ok: true, created: n, days: days.length, message: `${n} workout${n === 1 ? '' : 's'} sent to intervals.icu` };
    } catch (e) {
      store.garmin.error = e.message || 'Sending failed';
      save();
      return { ok: false, message: store.garmin.error };
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/* Keep the next 7 days current after a check-in, a swap or when the app opens. */
export function garminAutoSend() {
  if (!store.garmin.auto || !store.sync.token) return Promise.resolve(null);
  return sendToGarmin(upcomingKeys(), { onlyChanged: true });
}
