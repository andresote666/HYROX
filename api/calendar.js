/* Calendar feed with a daily reminder: "Shin check · <today's session>".
   Subscribe once on the phone (webcal://<app>/api/calendar?time=07:00) and the
   phone's own calendar alerts you every morning, even with the app closed.
   It only contains the training plan (no personal data), so it needs no token.
   Swaps and shin adaptations live on the phone, so the title is the planned
   session; the app shows today's version when you open it. */
import { sessionFor, PLAN_START, RACE_DAY } from '../src/data/plan.js';
import { dayKey, addDays } from '../src/store.js';

const esc = s => String(s).replace(/<[^>]+>/g, '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// RFC 5545 folds lines at 75 octets; 60 characters keeps multi-byte text (×, ·, ₂) safely under it.
const fold = line => line.match(/.{1,60}/gu).join('\r\n ');
const compact = k => k.replace(/-/g, '');

export default function handler(req, res) {
  const q = req.query || {};
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(q.time) ? q.time : '07:00';
  const hhmm = time.replace(':', '');
  // Buenos Aires is UTC−3 all year; start yesterday so today's alert is always there
  const local = new Date(Date.now() - 3 * 3600 * 1000);
  const start = addDays(new Date(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()), -1);
  const first = dayKey(start) < dayKey(PLAN_START) ? PLAN_START : start;
  const stamp = `${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  const url = `https://${req.headers.host || 'hyrox-ten.vercel.app'}/`;

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HYROX PREP//Plan reminders//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:HYROX PREP', 'REFRESH-INTERVAL;VALUE=DURATION:PT12H', 'X-PUBLISHED-TTL:PT12H',
  ];
  for (let i = 0; i < 42; i++) {
    const key = dayKey(addDays(first, i));
    if (key > RACE_DAY) break;
    const s = sessionFor(key);
    if (!s) continue;
    const what = s.kind === 'race' ? s.title : s.kind === 'rest' ? 'rest day' : s.title;
    const summary = s.kind === 'race' ? `🏁 ${s.title}` : `Shin check · ${what}`;
    const desc = s.kind === 'race'
      ? `${s.purpose}\n\nOpen the app: ${url}`
      : `45-second shin check, then the app adapts today's session.\n\nPlanned: ${s.title} (${s.duration}, ${s.intensity}).\n\nOpen the app: ${url}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:hyrox-${compact(key)}@hyrox-prep`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${compact(key)}T${hhmm}00`,
      'DURATION:PT10M',
      `SUMMARY:${esc(summary)}`,
      `DESCRIPTION:${esc(desc)}`,
      `URL:${url}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(summary)}`, 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="hyrox-prep.ics"');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(`${lines.map(fold).join('\r\n')}\r\n`);
}
