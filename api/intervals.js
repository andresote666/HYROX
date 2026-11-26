/* Vercel serverless function: reads Andy's own data from intervals.icu
   (which syncs it from Garmin Connect) and returns a trimmed JSON for the app.

   Environment variables (Vercel → Project → Settings → Environment Variables):
     INTERVALS_API_KEY     personal API key from intervals.icu → Settings → Developer Settings
     INTERVALS_ATHLETE_ID  optional; "0" (default) = the key's own athlete
     SYNC_TOKEN            any long random string; the app sends it so strangers can't read your data

   GET /api/intervals?oldest=YYYY-MM-DD&newest=YYYY-MM-DD   (header: x-sync-token)
   GET /api/intervals?debug=1  → field names intervals.icu actually returns (no values)

   POST /api/intervals  { action: 'plan', days: [{ date, events: [{ type, name, description, moving_time }] }] }
     Puts the app's planned workouts on the intervals.icu calendar (which uploads them
     to Garmin Connect when "Upload planned workouts" is on). For every date sent, the
     app's earlier workouts (tag hyrox-app) are removed first, so a resend replaces
     instead of duplicating. Nothing else on the calendar is touched.
   POST /api/intervals  { action: 'planned', oldest, newest }  → the app's workouts as intervals.icu parsed them */
import { timingSafeEqual } from 'node:crypto';

const BASE = 'https://intervals.icu/api/v1';
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const pick = (o, ...keys) => {
  for (const k of keys) if (o?.[k] !== undefined && o[k] !== null) return o[k];
  return null;
};
const num = v => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const round = (v, d = 1) => (v === null ? null : Math.round(v * 10 ** d) / 10 ** d);

function sameToken(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && timingSafeEqual(x, y);
}

function isoDay(d) {
  return d.toISOString().slice(0, 10);
}

export function normWellness(w) {
  const sleepSecs = num(pick(w, 'sleepSecs', 'sleep_secs'));
  return {
    date: String(pick(w, 'id', 'date') || '').slice(0, 10),
    rhr: num(pick(w, 'restingHR', 'resting_hr', 'restingHr')),
    hrv: num(pick(w, 'hrv', 'hrvRMSSD', 'rmssd')),
    hrvSdnn: num(pick(w, 'hrvSDNN', 'hrv_sdnn')),
    sleepH: sleepSecs !== null ? round(sleepSecs / 3600, 2) : num(pick(w, 'sleepHours')),
    sleepScore: num(pick(w, 'sleepScore', 'sleep_score')),
    weight: num(pick(w, 'weight')),
    readiness: num(pick(w, 'readiness')),
    ctl: round(num(pick(w, 'ctl'))),
    atl: round(num(pick(w, 'atl'))),
    rampRate: round(num(pick(w, 'rampRate'))),
    vo2max: round(num(pick(w, 'vo2max', 'VO2max'))),
    bodyFat: round(num(pick(w, 'bodyFat'))),
    spO2: round(num(pick(w, 'spO2'))),
    sleepQuality: num(pick(w, 'sleepQuality')),
    avgSleepingHR: num(pick(w, 'avgSleepingHR')),
    stress: num(pick(w, 'stress')),
    steps: num(pick(w, 'steps')),
  };
}

export function normActivity(a) {
  const moving = num(pick(a, 'moving_time', 'elapsed_time', 'icu_recording_time'));
  let dist = num(pick(a, 'distance', 'icu_distance'));
  // intervals.icu reports metres; guard against km just in case
  const km = dist === null ? null : dist > 200 ? round(dist / 1000, 2) : round(dist, 2);
  return {
    id: String(pick(a, 'id') ?? ''),
    date: String(pick(a, 'start_date_local', 'start_date') || '').slice(0, 10),
    start: String(pick(a, 'start_date_local', 'start_date') || ''),
    type: String(pick(a, 'type') || 'Workout'),
    name: String(pick(a, 'name') || ''),
    mins: moving === null ? null : round(moving / 60, 0),
    km,
    avgHr: num(pick(a, 'average_heartrate', 'icu_average_hr')),
    maxHr: num(pick(a, 'max_heartrate', 'icu_max_hr')),
    watts: num(pick(a, 'icu_average_watts', 'average_watts')),
    load: num(pick(a, 'icu_training_load', 'training_load')),
    cadence: num(pick(a, 'average_cadence')),
    stride: round(num(pick(a, 'average_stride')), 2),
    gctMs: num(pick(a, 'average_stance_time')),
    elevation: num(pick(a, 'total_elevation_gain')),
    zoneSecs: Array.isArray(a.icu_hr_zone_times) ? a.icu_hr_zone_times : null,
    zoneTops: Array.isArray(a.icu_hr_zones) ? a.icu_hr_zones : null,
  };
}

async function getJSON(path, key, { method = 'GET', body } = {}) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`API_KEY:${key}`).toString('base64')}`,
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (HYROX-PREP personal app)',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!r.ok) {
    const err = new Error(`intervals.icu ${r.status}`);
    err.status = r.status;
    err.detail = (await r.text().catch(() => '')).slice(0, 300);
    throw err;
  }
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

/* ── planned workouts ── */
const TAG = 'hyrox-app';
const TYPES = new Set(['Run', 'Ride', 'VirtualRide', 'Rowing', 'WeightTraining', 'Workout']);
const ours = e => (Array.isArray(e.tags) && e.tags.includes(TAG)) || String(e.external_id || '').startsWith(`${TAG}-`);

function cleanDays(days) {
  if (!Array.isArray(days) || !days.length || days.length > 14) throw Object.assign(new Error('Send 1–14 days.'), { status: 400, local: true });
  return days.map(d => {
    if (!DAY.test(d?.date)) throw Object.assign(new Error('Bad date.'), { status: 400, local: true });
    const events = Array.isArray(d.events) ? d.events.slice(0, 4) : [];
    return {
      date: d.date,
      events: events.map((e, i) => {
        if (!TYPES.has(e?.type)) throw Object.assign(new Error(`Unsupported workout type ${e?.type}.`), { status: 400, local: true });
        return {
          category: 'WORKOUT',
          start_date_local: `${d.date}T00:00:00`,
          type: e.type,
          name: String(e.name || 'HYROX workout').slice(0, 80),
          description: String(e.description || '').slice(0, 4000),
          moving_time: Math.max(0, Math.min(6 * 3600, Math.round(Number(e.moving_time) || 0))) || undefined,
          indoor: e.type !== 'Run',
          external_id: `${TAG}-${d.date}-${i}`,
          tags: [TAG],
        };
      }),
    };
  });
}

async function listOurs(athlete, key, oldest, newest) {
  const evs = await getJSON(`/athlete/${athlete}/events?oldest=${oldest}&newest=${newest}&category=WORKOUT`, key);
  return (Array.isArray(evs) ? evs : []).filter(ours);
}

async function plan(req, res, athlete, key) {
  const b = req.body || {};
  if (b.action === 'planned') {
    const oldest = DAY.test(b.oldest) ? b.oldest : isoDay(new Date());
    const newest = DAY.test(b.newest) ? b.newest : isoDay(new Date(Date.now() + 7 * 86400000));
    const evs = await listOurs(athlete, key, oldest, newest);
    return res.status(200).json({
      events: evs.map(e => ({
        id: e.id, date: String(e.start_date_local || '').slice(0, 10), type: e.type, name: e.name,
        moving_time: e.moving_time, steps: Array.isArray(e.workout_doc?.steps) ? e.workout_doc.steps.length : null,
        workout_doc: b.full ? e.workout_doc : undefined, push_errors: e.push_errors || null,
      })),
    });
  }
  if (b.action !== 'plan') return res.status(400).json({ error: 'bad-action', message: 'Unknown action.' });

  const days = cleanDays(b.days);
  const dates = days.map(d => d.date).sort();
  const sent = new Set(dates);
  const old = (await listOurs(athlete, key, dates[0], dates[dates.length - 1]))
    .filter(e => sent.has(String(e.start_date_local || '').slice(0, 10)));
  if (old.length) {
    await getJSON(`/athlete/${athlete}/events/bulk-delete`, key, { method: 'PUT', body: old.map(e => ({ id: e.id })) });
  }
  const events = days.flatMap(d => d.events);
  const created = events.length
    ? await getJSON(`/athlete/${athlete}/events/bulk?upsertOnUid=false&updatePlanApplied=false`, key, { method: 'POST', body: events })
    : [];
  return res.status(200).json({
    replaced: old.length,
    created: (created || []).map(e => ({ id: e.id, date: String(e.start_date_local || '').slice(0, 10), name: e.name, steps: Array.isArray(e.workout_doc?.steps) ? e.workout_doc.steps.length : null })),
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const { INTERVALS_API_KEY, INTERVALS_ATHLETE_ID = '0', SYNC_TOKEN } = process.env;
  if (!INTERVALS_API_KEY || !SYNC_TOKEN) {
    return res.status(503).json({ error: 'not-configured', message: 'Add INTERVALS_API_KEY and SYNC_TOKEN in Vercel, then redeploy.' });
  }
  if (!sameToken(req.headers['x-sync-token'], SYNC_TOKEN)) {
    return res.status(401).json({ error: 'bad-token', message: 'Sync code does not match SYNC_TOKEN in Vercel.' });
  }

  if (req.method === 'POST') {
    try {
      return await plan(req, res, encodeURIComponent(INTERVALS_ATHLETE_ID), INTERVALS_API_KEY);
    } catch (e) {
      if (e.local) return res.status(400).json({ error: 'bad-request', message: e.message });
      return res.status(502).json({
        error: 'upstream',
        message: e.status === 401 || e.status === 403
          ? 'intervals.icu rejected the API key (check INTERVALS_API_KEY).'
          : e.status === 429 ? 'intervals.icu rate limit hit. Try again in a few minutes.'
          : `intervals.icu refused the workouts (${e.message}${e.detail ? `: ${e.detail}` : ''}).`,
      });
    }
  }
  if (req.method && req.method !== 'GET') return res.status(405).json({ error: 'method' });

  const q = req.query || {};
  const today = new Date();
  const newest = DAY.test(q.newest) ? q.newest : isoDay(new Date(today.getTime() + 86400000));
  const oldest = DAY.test(q.oldest) ? q.oldest : isoDay(new Date(today.getTime() - 70 * 86400000));
  const athlete = encodeURIComponent(INTERVALS_ATHLETE_ID);
  const range = `oldest=${oldest}&newest=${newest}`;

  try {
    const [wellness, activities] = await Promise.all([
      getJSON(`/athlete/${athlete}/wellness?${range}`, INTERVALS_API_KEY),
      getJSON(`/athlete/${athlete}/activities?${range}`, INTERVALS_API_KEY),
    ]);
    const w = Array.isArray(wellness) ? wellness : [];
    const a = Array.isArray(activities) ? activities : [];

    if (q.debug) {
      const keys = arr => [...new Set(arr.flatMap(o => Object.keys(o || {})))].sort();
      return res.status(200).json({ oldest, newest, wellnessCount: w.length, activityCount: a.length, wellnessFields: keys(w), activityFields: keys(a) });
    }

    return res.status(200).json({
      oldest, newest, syncedAt: new Date().toISOString(),
      wellness: w.map(normWellness).filter(x => x.date),
      activities: a.map(normActivity).filter(x => x.date),
    });
  } catch (e) {
    return res.status(502).json({
      error: 'upstream',
      message: e.status === 401 || e.status === 403
        ? 'intervals.icu rejected the API key (check INTERVALS_API_KEY).'
        : e.status === 429 ? 'intervals.icu rate limit hit. Try again in a few minutes.'
        : `Could not reach intervals.icu (${e.message}).`,
    });
  }
}
