# HYROX PREP · Buenos Aires 2027

Personal training PWA for HYROX Buenos Aires (20–21 Mar 2027) with HYROX Santiago (6 Mar 2027) as a dress rehearsal. Goal: sub-1:30 Open Men.

- **Today**: daily shin & soleus check-in (traffic light) that rewrites the session: runs move to the bike, broad jumps become step-outs, return-to-run locks after red days. Interval timer with beeps, voice cues, vibration and screen wake lock. Effort rating (0–10) after each session → weekly load and a warning on sudden jumps. Monday review of last week. Race simulation timer on sim days. Daily fuel targets.
- **Plan**: 16 weeks (+ post-Rio reset week), swap days with spacing warnings, weekly load (run minutes, bike/row minutes, jump contacts).
  Strength twice a week with a leg-muscle block (≈10–14 hard sets per leg muscle a week), loaded calves 3×/week, Nordic curls, and graded small hops on green shin days only ([research/04](research/04-strength-muscle-plyometrics.md)).
- **Race**: predicted finish time from your tests, simulations and engine trend, with the biggest gaps left; race simulation timer (full / half A / half B) with saved results; Rio vs target splits, where the time comes from, pacing cues, race-week timeline, 2026/27 rules.
- **Progress**: weight trend vs 94 kg, shin pain history, weekly training load, benchmarks (bike 5-min, row 2k, wall balls, BBJ, sleds, heel raises).
- **Library**: condensed, cited research. Full reports in [`/research`](research/README.md).

Data lives in the phone's localStorage; export a backup from Settings.

## Garmin data (via intervals.icu)

`api/intervals.js` is a Vercel function that reads your own wellness (HRV, resting HR, sleep, weight) and workouts from intervals.icu, which syncs them from Garmin Connect. Set these in Vercel → Settings → Environment Variables, then redeploy:

| Variable | Value |
|---|---|
| `INTERVALS_API_KEY` | intervals.icu → Settings → Developer Settings → API key |
| `SYNC_TOKEN` | any long random string; paste the same value in the app's Settings → Garmin |
| `INTERVALS_ATHLETE_ID` | optional, defaults to `0` (the key's own athlete) |

`/api/intervals?debug=1` (with the `x-sync-token` header) lists the field names intervals.icu returns, for troubleshooting.

### Auto-learning (`src/logic/learn.js`)

Plain rules on your own data, shown in Progress → What the app has learned:
- **Max HR** from Garmin workouts (raised automatically if a workout goes higher; detects intervals.icu clipping at its max-HR setting).
- **Bike intervals**: two sessions in a row at the target HR (90% max) with effort ≤ 8 add a rep; below target with effort to spare → go harder; effort 10 or missed target at 9+ → start easier.
- **Shin limit**: run minutes vs the next morning's check-in; easy runs are capped above the length that keeps leading to amber/red mornings.
- **Calories**: 21-day weight slope; adds 100–200 kcal when losing > 0.5 kg/week, trims 150 when flat.

### Morning reminder

`/api/calendar?time=07:00` is an iCalendar feed (no personal data, no token): a daily 10-minute event "Shin check · <planned session>" with an alert. Settings → Morning reminder subscribes to it with `webcal://`.

### Workouts to the watch

`Send to Garmin` on Today (and the auto switch in Settings) posts the next 7 days to `POST /api/intervals`. The app writes them as intervals.icu workout text (`src/logic/garmin.js`): bike, run and row with heart-rate targets as % of max HR, run legs as 1 km with a pace range, stations as `Press lap` steps. The function replaces the app's own workouts (tag `hyrox-app`) on those dates and leaves everything else alone. intervals.icu uploads them to Garmin Connect once **Settings → Garmin → Upload planned workouts** is on; set your max HR (193) in intervals.icu so the % targets match.

```bash
npm install
npm run dev
npm run build
```

The previous Rio de Janeiro 2026 version is on the `rio-2026-archive` branch.
