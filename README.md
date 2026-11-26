# HYROX PREP · Buenos Aires 2027

Personal training PWA for HYROX Buenos Aires (20–21 Mar 2027) with HYROX Santiago (6 Mar 2027) as a dress rehearsal. Goal: sub-1:30 Open Men.

- **Today**: daily shin & soleus check-in (traffic light) that rewrites the session: runs move to the bike, broad jumps become step-outs, return-to-run locks after red days. Interval timer with beeps, vibration and screen wake lock. Daily fuel targets.
- **Plan**: 16 weeks (+ post-Rio reset week), swap days with spacing warnings, weekly load (run minutes, bike/row minutes, jump contacts).
- **Race**: Rio vs target splits, where the time comes from, pacing cues, race-week timeline, 2026/27 rules.
- **Progress**: weight trend vs 94 kg, shin pain history, benchmarks (bike 5-min, row 2k, wall balls, BBJ, sleds, heel raises).
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

```bash
npm install
npm run dev
npm run build
```

The previous Rio de Janeiro 2026 version is on the `rio-2026-archive` branch.
