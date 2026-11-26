/* Vercel serverless function: reads Andy's own data from intervals.icu
   (which syncs it from Garmin Connect) and returns a trimmed JSON for the app.

   Environment variables (Vercel → Project → Settings → Environment Variables):
     INTERVALS_API_KEY     personal API key from intervals.icu → Settings → Developer Settings
     INTERVALS_ATHLETE_ID  optional; "0" (default) = the key's own athlete
     SYNC_TOKEN            any long random string; the app sends it so strangers can't read your data

   GET /api/intervals?oldest=YYYY-MM-DD&newest=YYYY-MM-DD   (header: x-sync-token)
   GET /api/intervals?debug=1  → field names intervals.icu actually returns (no values) */
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
  };
}

async function getJSON(path, key) {
  const r = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`API_KEY:${key}`).toString('base64')}`,
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (HYROX-PREP personal app)',
    },
  });
  if (!r.ok) {
    const err = new Error(`intervals.icu ${r.status}`);
    err.status = r.status;
    throw err;
  }
  return r.json();
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
