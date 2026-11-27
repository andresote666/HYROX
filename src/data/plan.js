/* ═══════════════════════════════════════════════════════════
   16-week plan · 30 Nov 2026 → HYROX Buenos Aires 20 Mar 2027
   Week 0 (23–29 Nov) is the post-Rio reset.
   Santiago (6 Mar, week 14) = dress rehearsal at ~95%.

   Weekly skeleton (runs on alternate days for the shins; heavy legs never the
   day before the key engine session):
   Mon  VO₂max bike + short run off the bike + Upper A (heavy)  ← run 1
   Tue  Hops + Lower A: squat, both sleds, Nordics, calves + wall balls
   Wed  RowErg: Zone 2 (base) → threshold (build) + Upper B
   Thu  Long run (outdoors OK) + hops + Lower B: deadlift, BBJ   ← run 2
   Fri  Long Zone 2 bike + core, carries and feet
   Sat  HYROX compromised session / simulation                  ← run 3
   Sun  Rest
   4 lifting sessions (2 upper, 2 lower) + 1 core block a week: ~10 hard sets per
   muscle per week. Why this order: research/04.
   Evidence: research/02 (§A, B, C, G), research/03 (§1, 2, 6, 7), research/04.
   ═══════════════════════════════════════════════════════════ */
import { store, parseDay, dayKey, addDays } from '../store.js';

export const PLAN_START = new Date(2026, 10, 23); // Mon 23 Nov 2026 = week 0
export const RACE_DAY = '2027-03-20';
export const TOTAL_WEEKS = 16;

export const PHASES = [
  { id: 'reset', name: 'Reset', weeks: [0], blurb: 'Post-Rio recovery. Bike and rower only, shins quiet, no running.' },
  { id: 'rebuild', name: 'Rebuild', weeks: [1, 2, 3, 4], blurb: 'Walk-run return, first VO₂max intervals on the bike, lifting back to working weights (2 upper + 2 lower a week), baseline tests, station technique. Week 4 is the Christmas deload.' },
  { id: 'build1', name: 'Build 1', weeks: [5, 6, 7, 8], blurb: 'Rønnestad 30/15s and long intervals, rowing threshold, half simulations, continuous easy running. Squat and deadlift move to 4×4. Week 8 deload and retest.' },
  { id: 'build2', name: 'Build 2', weeks: [9, 10, 11, 12], blurb: 'Race-specific: Run 8 bricks, Karen, full simulation in week 11, 1 km run legs. Heaviest lifting of the plan (4×3). Week 12 is lighter. Calories move to maintenance.' },
  { id: 'peak', name: 'Peak', weeks: [13, 14], blurb: 'Race-pace sharpening, lifting to 2 heavy sets at the same weights, Santiago as the final dress rehearsal on 6 March.' },
  { id: 'taper', name: 'Taper', weeks: [15, 16], blurb: 'Volume down 40–60%, intensity kept (Bosquet 2007). One lifting day keeps strength and muscle (Rønnestad 2010). Race Buenos Aires.' },
];
export const phaseFor = w => PHASES.find(p => p.weeks.includes(w)) || PHASES[0];
export const DELOAD = new Set([4, 8, 12]);

/* ── item helpers ── */
const it = (name, dose, detail = '', extra = {}) => ({ name, dose, detail, ...extra });
const run = (name, dose, detail, minutes, hard = false) => ({ name, dose, detail, mode: 'run', minutes, hard });
const jump = (name, dose, detail) => ({ name, dose, detail, mode: 'jump' });
const calf = (name, dose, detail) => ({ name, dose, detail, mode: 'calf' });
/* Small hops for ankle stiffness and bone. Green days only: amber swaps them for
   calf raises, red (or the return-to-run lock) for isometric holds. */
const hop = (name, dose, detail) => ({
  name, dose, detail, mode: 'jump', plyo: true,
  alt: {
    yellow: { name: 'Slow calf raises instead of hops', dose: '2×15', detail: 'Amber day: no hops. Two-leg calf raises, 2 s up, 2 s down.', mode: 'calf' },
    red: { name: 'Isometric calf holds instead of hops', dose: '3×45 s', detail: 'No hops today. Standing calf-raise hold at mid-range, about 70% effort.', mode: 'calf' },
  },
});

/* ── timers ── */
const T = {
  bike44: (reps = 4, work = 240) => ({ title: `Bike ${reps}×${work / 60}`, mode: 'bike', warmup: 600, reps, work, rest: 180, cooldown: 300, cue: '{vo2w}', restCue: 'Easy spin. Keep pedalling.' }),
  bike3015: sets => ({ title: `Bike 30/15 × 13 × ${sets}`, mode: 'bike', warmup: 600, sets, reps: 13, work: 30, rest: 15, setRest: 180, cooldown: 300, cue: '{b3015}', restCue: 'Soft pedal, very easy' }),
  bikeTest: { title: 'Bike 5-min test', mode: 'bike', steps: [
    { label: 'Warm-up', kind: 'prep', secs: 600, cue: 'Easy, building' },
    { label: 'Surge 1', kind: 'work', secs: 20, cue: 'Quick 20 s surge' }, { label: 'Easy', kind: 'rest', secs: 100, cue: 'Spin' },
    { label: 'Surge 2', kind: 'work', secs: 20, cue: 'Quick 20 s surge' }, { label: 'Easy', kind: 'rest', secs: 100, cue: 'Spin' },
    { label: 'Surge 3', kind: 'work', secs: 20, cue: 'Quick 20 s surge' }, { label: 'Ready', kind: 'rest', secs: 160, cue: 'Settle. Test next.' },
    { label: '5-min test', kind: 'work', secs: 300, cue: 'Even pacing. Empty the tank in the last 60 s. Log average watts.' },
    { label: 'Cool-down', kind: 'prep', secs: 480, cue: 'Very easy' } ] },
  rowThr: (reps, mins, rest = 120) => ({ title: `Row ${reps}×${mins} threshold`, mode: 'row', warmup: 480, reps, work: mins * 60, rest, cooldown: 300, cue: 'RPE 7, comfortably hard. 24–28 spm. {rowthr}', restCue: 'Easy paddle' }),
  emom: (mins, cue, title = `EMOM ${mins}`) => ({ title, mode: 'station', reps: mins, work: 60, rest: 0, cue }),
  gill: rounds => ({ title: `Gillingham ×${rounds}`, mode: 'station', reps: rounds, work: 90, rest: 25, cue: 'Max wall balls, steady rhythm, ball held between sets', restCue: '25 s: breathe, ball at the chest' }),
};

/* ── weekly progression tables (index = week) ── */
const VO2 = {
  1: { title: 'Bike 5-min test', main: [it('5-min max test', '5 min', 'Even pacing, empty the tank in the last minute. Log average watts in Progress → Bike 5-min max.', { bench: 'bike5', mode: 'bike' })], timer: T.bikeTest, purpose: 'Baseline for every bike prescription that follows. Your 4×4 power will be 85–95% of this number.' , noWatts: { title: 'Bike 4×4 · learn the effort', main: [it('4 × 4 min', '4×4', '{vo2w} 3 min easy between. This first session teaches you what the right effort feels like; check your Garmin HR afterwards.', { mode: 'bike' })], timer: T.bike44(4), purpose: 'Your bike has no screen, so effort and heart rate replace watts. <b>Helgerud 2007:</b> 4×4 at 90–95% HRmax raised VO₂max 7.2% in 8 weeks.' } },
  2: { title: 'Bike 4×4 · Norwegian intervals', main: [it('4 × 4 min', '4×4', '{vo2w} · 3 min easy spin between. HR should reach {hr90}+ by min 3 of reps 2–4.', { mode: 'bike' })], timer: T.bike44(4), purpose: '<b>Helgerud 2007:</b> 4×4 at 90–95% HRmax raised VO₂max 7.2% in 8 weeks. The single best-evidenced protocol for your goal.' },
  3: { title: 'Bike 5×4', main: [it('5 × 4 min', '5×4', '{vo2w} · 3 min easy between.', { mode: 'bike' })], timer: T.bike44(5), purpose: 'Adding a fifth rep = more time above 90% VO₂max, the variable that drives adaptation (Buchheit & Laursen 2013).' },
  4: { title: 'Bike 3×4 · deload', main: [it('3 × 4 min', '3×4', '{vo2w} · keep the intensity, cut the volume.', { mode: 'bike' })], timer: T.bike44(3), purpose: 'Deload keeps intensity and drops volume, so fitness holds while fatigue clears.' },
  5: { title: 'Bike 30/15 · Rønnestad', main: [it('2 sets × 13 × 30 s on / 15 s easy', '2×13', '{b3015} 3 min between sets.', { mode: 'bike' })], timer: T.bike3015(2), purpose: '<b>Rønnestad 2015/2020:</b> 30/15 short intervals beat effort-matched long intervals for aerobic power in cyclists.' },
  6: { title: 'Bike 30/15 × 3 sets', main: [it('3 sets × 13 × 30/15', '3×13', 'Same effort as last week, one more set. HR should climb to {hr90}+ by the end of each set.', { mode: 'bike' })], timer: T.bike3015(3), purpose: 'Full Rønnestad dose: about 20 min of work near VO₂max.' },
  7: { title: 'Bike 4×6 · long intervals', main: [it('4 × 6 min', '4×6', '{vo2w6} 3 min easy between.', { mode: 'bike' })], timer: T.bike44(4, 360), purpose: '<b>Wen 2019 meta-analysis:</b> long (≥2 min), high-volume (≥15 min work) intervals gave the biggest VO₂max gains.' },
  8: { title: 'Bike 5-min retest', main: [it('5-min max test', '5 min', 'Same protocol as week 1. Log it: the app re-scales your interval power.', { bench: 'bike5', mode: 'bike' })], timer: T.bikeTest, purpose: 'Halfway check. Expect +4–8% on week 1 if the engine is responding.' , noWatts: { title: 'Bike 5×4', main: [it('5 × 4 min', '5×4', '{vo2w} 3 min easy between.', { mode: 'bike' })], timer: T.bike44(5), purpose: 'Halfway point. Your engine check this week is the 2 km row on Wednesday.' } },
  9: { title: 'Bike 30/15 × 3', main: [it('3 sets × 13 × 30/15', '3×13', '{b3015} 3 min between sets.', { mode: 'bike' })], timer: T.bike3015(3), purpose: 'Short intervals keep you at VO₂max longer per session while you add race-specific load on other days.' },
  10: { title: 'Bike 5×4', main: [it('5 × 4 min', '5×4', '{vo2w} · 3 min easy between.', { mode: 'bike' })], timer: T.bike44(5), purpose: 'Back to the long format so both stimuli stay in the mix.' },
  11: { title: 'Bike 4×4 · sim week', main: [it('4 × 4 min', '4×4', '{vo2w}. Leave a little in the tank: full simulation on Saturday.', { mode: 'bike' })], timer: T.bike44(4), purpose: 'Maintains the VO₂max stimulus without eating into Saturday.' },
  12: { title: 'Bike 5-min retest', main: [it('5-min max test', '5 min', 'Third test. The week is lighter so this is a fair read.', { bench: 'bike5', mode: 'bike' })], timer: T.bikeTest, purpose: 'Final engine check before the peak block.' , noWatts: { title: 'Bike 4×4 · lighter week', main: [it('4 × 4 min', '4×4', '{vo2w} 3 min easy between.', { mode: 'bike' })], timer: T.bike44(4), purpose: 'Lighter week: quality over volume. Engine check is the 2 km row on Wednesday.' } },
  13: { title: 'Bike 5×4 · last big one', main: [it('5 × 4 min', '5×4', '{vo2w} · 3 min easy between.', { mode: 'bike' })], timer: T.bike44(5), purpose: 'Last high-volume VO₂max session. From here it is about freshness.' },
};

const MON_RUN = { 1: ['Walk-run', '4×(1′/1′)', 8], 2: ['Walk-run', '5×(1′/1′)', 10], 3: ['Walk-run', '5×(2′/1′)', 15], 4: ['Easy run-walk', '10 min', 10], 5: ['Easy run off the bike', '12 min', 12], 6: ['Easy run off the bike', '15 min', 15], 7: ['Easy run off the bike', '15 min', 15], 8: ['Easy run off the bike', '10 min', 10], 9: ['Easy run off the bike', '15 min', 15], 10: ['Easy run off the bike', '20 min', 20], 11: ['Easy run off the bike', '10 min', 10], 12: ['Easy run off the bike', '15 min', 15], 13: ['Easy run off the bike', '20 min', 20] };
/* Thursday = the long run: the longest run of the week, outdoors OK from week 4.
   Each step stays within 10% of the longest run in the previous 30 days: bigger
   single-run jumps raised overuse injuries 1.5–2.3× in 5,200 runners (Frandsen
   2025). From a walk-run restart, that lands at about 33 min by week 13. */
const THU_RUN = { 1: ['Walk-run', '6×(1′/1′)', 12], 2: ['Walk-run', '5×(2′/1′)', 15], 3: ['Walk-run', '4×(4′/1′)', 20], 4: ['Long run · first continuous', '15 min', 15], 5: ['Long run', '20 min', 20], 6: ['Long run', '22 min', 22], 7: ['Long run + 4 strides', '24 min', 24], 8: ['Long run · deload', '20 min', 20], 9: ['Long run + 4 strides', '26 min', 26], 10: ['Long run', '28 min', 28], 11: ['Easy run · sim week', '20 min', 20], 12: ['Long run + 4 strides', '30 min', 30], 13: ['Long run + 4 strides', '33 min', 33] };

const ROW = {
  1: { title: 'Row 2,000 m test', items: [it('Row 2,000 m time trial', '2k', 'Damper 5–6. Even split, empty it over the last 300 m. Log the time.', { bench: 'row2k', mode: 'row' }), it('Zone 2 row', '15 min', 'Very easy, 18–20 spm', { mode: 'row' })], intensity: 'Hard' },
  2: { title: 'Row Zone 2 · technique', items: [it('Zone 2 row', '40 min', 'HR ≤150, 20–22 spm. Legs-hips-arms, smooth recovery.', { mode: 'row' })], intensity: 'Easy' },
  3: { title: 'Row Zone 2 + pickups', items: [it('Zone 2 row', '40 min', 'HR ≤150. Every 5 min: 1 min at 2k pace.', { mode: 'row' })], intensity: 'Easy' },
  4: { title: 'Row Zone 2 · deload', items: [it('Zone 2 row', '30 min', 'HR ≤150', { mode: 'row' })], intensity: 'Easy' },
  5: { title: 'Row threshold 4×8', items: [it('4 × 8 min', '4×8', 'RPE 7. {rowthr} 2 min easy between.', { mode: 'row' })], timer: T.rowThr(4, 8), intensity: 'Moderate' },
  6: { title: 'Row threshold 4×8', items: [it('4 × 8 min', '4×8', 'Same split as last week, lower HR is the win.', { mode: 'row' })], timer: T.rowThr(4, 8), intensity: 'Moderate' },
  7: { title: 'Row threshold 3×10', items: [it('3 × 10 min', '3×10', 'RPE 7. {rowthr} 2 min easy between.', { mode: 'row' })], timer: T.rowThr(3, 10), intensity: 'Moderate' },
  8: { title: 'Row 2,000 m retest', items: [it('Row 2,000 m time trial', '2k', 'Same protocol as week 1. Log it.', { bench: 'row2k', mode: 'row' }), it('Zone 2 row', '15 min', 'Very easy', { mode: 'row' })], intensity: 'Hard' },
  9: { title: 'Row threshold 3×10', items: [it('3 × 10 min', '3×10', 'RPE 7. {rowthr}', { mode: 'row' })], timer: T.rowThr(3, 10), intensity: 'Moderate' },
  10: { title: 'Row threshold 2×15', items: [it('2 × 15 min', '2×15', 'RPE 7, 3 min easy between. Longest continuous threshold block of the plan.', { mode: 'row' })], timer: T.rowThr(2, 15, 180), intensity: 'Moderate' },
  11: { title: 'Row threshold 3×8 · sim week', items: [it('3 × 8 min', '3×8', 'RPE 6–7. Controlled.', { mode: 'row' })], timer: T.rowThr(3, 8), intensity: 'Moderate' },
  12: { title: 'Row 2,000 m retest', items: [it('Row 2,000 m time trial', '2k', 'Third test. Log it.', { bench: 'row2k', mode: 'row' }), it('Zone 2 row', '15 min', 'Very easy', { mode: 'row' })], intensity: 'Hard' },
  13: { title: 'Row threshold 3×10', items: [it('3 × 10 min', '3×10', 'RPE 7. {rowthr}', { mode: 'row' })], timer: T.rowThr(3, 10), intensity: 'Moderate' },
};

const WB = {
  1: { items: [it('100 wall balls for time', '100', 'Baseline. 6 kg, 3 m, hips below knees. Sets of 15–20, 10 breaths of rest, ball held. Log the time.', { bench: 'wb100', load: '6 kg' })] },
  2: { items: [it('EMOM 10 × 10 wall balls', '100', 'Unbroken every minute. Catch into the next squat.', { load: '6 kg' })], timer: T.emom(10, '10 wall balls, rest the remainder') },
  3: { items: [it('EMOM 12 × 12 wall balls', '144', 'Same rhythm, more reps. Throw only as high as the target needs.', { load: '6 kg' })], timer: T.emom(12, '12 wall balls, rest the remainder') },
  4: { items: [it('30-20-10 wall balls', '60', '60 s rest between sets. Deload: crisp reps only.', { load: '6 kg' })] },
  5: { items: [it('Gillingham × 4', '4 rds', '90 s max reps, 25 s rest. Log total reps.', { load: '6 kg' })], timer: T.gill(4) },
  6: { items: [it('Gillingham × 5', '5 rds', '90 s max reps, 25 s rest. Beat last week\'s total.', { load: '6 kg' })], timer: T.gill(5) },
  7: { items: [it('Gillingham × 5', '5 rds', 'Aim for 25+ reps every round.', { load: '6 kg' })], timer: T.gill(5) },
  8: { items: [it('EMOM 10 × 10 wall balls', '100', 'Deload: smooth and fast.', { load: '6 kg' })], timer: T.emom(10, '10 wall balls') },
  9: { items: [it('Karen: 150 wall balls for time', '150', 'Target under 8:30. Sets of 20–25. Log it.', { bench: 'karen', load: '6 kg' })] },
  10: { items: [it('EMOM 12 × 15 wall balls', '180', 'Race rhythm: one rep every 2.3–2.5 s.', { load: '6 kg' })], timer: T.emom(12, '15 wall balls') },
  11: { items: [it('5 × 20 wall balls', '100', 'Race plan exactly: 20s, 10 breaths of rest, ball held at the chest.', { load: '6 kg' })] },
  12: { items: [it('Karen retest', '150', 'Target under 7:45. Log it.', { bench: 'karen', load: '6 kg' })] },
  13: { items: [it('100 wall balls for time', '100', 'Target under 4:30 fresh. 20s plan. Log it.', { bench: 'wb100', load: '6 kg' })] },
};

const BBJ = {
  1: { items: [jump('BBJ 20 m test', '20 m', 'At race rhythm, not max jumps. Count reps and log them (Progress → BBJ reps for 20 m). Turf or mats.'), it('Step-back burpees, no jump', '5×20', 'Step down, step up. 60 s rest. Builds burpee capacity without landings.', { mode: 'station' })] },
  2: { items: [jump('EMOM 10: 4 BBJ', '40 jumps', 'Step down, step up, jump ~2 m, land soft. On mats or turf.')], timer: T.emom(10, '4 burpee broad jumps') },
  3: { items: [jump('EMOM 12: 4 BBJ', '48 jumps', 'Same rhythm. Breathe right after landing.'), it('Step-back burpees, no jump', '3×20', 'Push the pace: 100 in under 7:00 is the week-4 goal.', { mode: 'station' })], timer: T.emom(12, '4 burpee broad jumps') },
  4: { items: [it('Step-back burpees, no jump', '3×10', 'Deload. Technique only.', { mode: 'station' })] },
  5: { items: [jump('EMOM 10: 4 BBJ', '40 jumps', 'Back after the deload: same dose as week 2. Re-test 20 m reps at the end.', { bench: 'bbj20' })], timer: T.emom(10, '4 burpee broad jumps') },
  6: { items: [jump('5 × 20 m BBJ', '100 m', '90 s rest. ~10 reps per 20 m, consistent jump length.')] },
  7: { items: [jump('4 × 20 m BBJ', '80 m', '90 s rest.'), it('Burpee capacity', '3 rds', '60 s burpees (no jump) + 60 s rest + 3 min hard row.', { mode: 'station' })] },
  8: { items: [jump('EMOM 8: 4 BBJ', '32 jumps', 'Deload. Smooth.')], timer: T.emom(8, '4 burpee broad jumps') },
  9: { items: [jump('3 × 40 m BBJ', '120 m', 'Each after 3 min hard bike. 2 min rest. Re-test 20 m reps first.', { bench: 'bbj20' })] },
  10: { items: [jump('80 m BBJ for time (fresh)', '80 m', 'Target under 5:45. Only on a green day. Log it.', { bench: 'bbj80' })] },
  11: { items: [jump('2 × 40 m BBJ', '80 m', 'Race rhythm. Full simulation on Saturday.')] },
  12: { items: [jump('2 × 40 m BBJ', '80 m', 'Lighter week: race rhythm, 2 min rest.')] },
  13: { items: [jump('80 m BBJ for time', '80 m', 'Fresh retest. Only on a green day. Log it.', { bench: 'bbj80' })] },
};

/* Hops, twice a week (Tue + Thu), before lifting. Contacts per session.
   Low volume over many weeks works best for stiffness (<250 contacts a week incl.
   BBJ, Moran 2023); plyos + heavy strength beat either alone for running
   economy (Llanos-Lagos 2024). Drop-jump tibial strain is no higher than running (Milgrom 2000), so small
   hops are a safe step while runs are short. Two feet first, one leg from week 6. */
const POGO = 'Two feet, on the spot, knees almost straight. Bounce off the balls of the feet, quiet landings. 60 s rest between sets.';
const SL = 'One leg, small and quick on the spot, knee soft. 60 s rest. Stop if the shin hurts.';
const LINE = 'Over a line, quick and light, two feet.';
const PLYO = {
  1: [hop('Pogo hops', '2×10 contacts', `${POGO} First week: tiny hops. Only if the 10 single-leg hops in the check-in were pain-free.`)],
  2: [hop('Pogo hops', '3×10 contacts', POGO)],
  3: [hop('Pogo hops', '3×12 contacts', POGO), hop('Line hops, forward-back', '2×10 contacts', LINE)],
  4: [hop('Pogo hops', '2×10 contacts', `${POGO} Deload.`)],
  5: [hop('Pogo hops', '3×15 contacts', POGO), hop('Line hops, side to side', '2×10 contacts', LINE)],
  6: [hop('Pogo hops', '2×15 contacts', POGO), hop('Single-leg pogos', '2×16 contacts', `${SL} 8 per leg.`)],
  7: [hop('Pogo hops', '2×15 contacts', POGO), hop('Single-leg pogos', '3×16 contacts', `${SL} 8 per leg.`)],
  8: [hop('Pogo hops', '2×15 contacts', `${POGO} Deload.`)],
  9: [hop('Pogo hops', '2×15 contacts', POGO), hop('Single-leg pogos', '3×20 contacts', `${SL} 10 per leg.`)],
  10: [hop('Pogo hops', '2×15 contacts', POGO), hop('Single-leg pogos', '3×20 contacts', `${SL} 10 per leg.`)],
  11: [hop('Pogo hops', '2×15 contacts', `${POGO} Sim week: crisp, not tired.`), hop('Single-leg pogos', '2×16 contacts', `${SL} 8 per leg.`)],
  12: [hop('Pogo hops', '2×15 contacts', POGO), hop('Single-leg pogos', '2×20 contacts', `${SL} 10 per leg.`)],
  13: [hop('Pogo hops', '2×15 contacts', POGO), hop('Single-leg pogos', '2×16 contacts', `${SL} 8 per leg.`)],
};
const BALANCE = { name: 'Single-leg balance instead of hops', dose: '2×30 s/leg', detail: 'Eyes open, then eyes closed. Foot and ankle control without impact.', mode: 'mobility' };
const hopsBlock = w => ({ title: 'Hops · 5 min', items: PLYO[w].map((h, i) => (i ? { ...h, alt: { yellow: BALANCE, red: BALANCE } } : h)) });

/* ── lifting rules ──────────────────────────────────────────────
   Heavy sets: RPE 7–8 (2–3 reps left); when every set feels RPE 7 or easier,
   add 2.5–5 kg next week. Week 1 is lighter (RPE 6–7) to find the weights
   without the soreness that would spoil the first runs and Wednesday's 2k test.
   Muscle sets: 1–2 reps short of failure. About 10 hard sets per muscle per week,
   counting compound lifts as half a set for the smaller muscles (Pelland 2024).
   Muscle work starts at 2 sets in weeks 1–2, is 3 sets from week 3, and drops to
   2 in week 13. Deload weeks drop one set and keep the load. */
const isDeload = w => DELOAD.has(w);
const sets = (w, base) => (isDeload(w) ? Math.max(2, base - 1) : base);
const musc = w => (w <= 2 || w >= 13 ? 2 : sets(w, 3));
const LEG_HEAVY = w => (w <= 3 ? [3, 5] : w <= 8 ? [4, 4] : w <= 12 ? [4, 3] : [2, 3]);
const UP_HEAVY = w => (w <= 3 ? [3, 6] : w <= 8 ? [3, 5] : w <= 12 ? [3, 4] : [2, 4]);
const heavySets = (w, scheme) => sets(w, scheme[0]);
const heavyDose = (w, scheme) => `${heavySets(w, scheme)}×${scheme[1]}`;
const RPE = w => `${w === 1 ? 'Week 1: RPE 6–7 to find your working weights. ' : ''}RPE 7–8 (2–3 reps left). Every set at RPE 7 or easier? Add 2.5–5 kg next week.`;
const CALF_STAND = 'Straight knee, on a step. 2 s pause in the deep stretch at the bottom; when the full reps run out, add half reps from the bottom (Kassiano 2023: more calf growth). Machine, Smith or a DB in one hand.';
/* Durations are estimated from the actual sets (heavy set ≈3 min with rest, muscle
   set ≈2 min, supersets ≈2.5–4.5 min a round), rounded to 5 min. The range is
   without → with the optional blocks. */
const r5 = m => Math.round(m / 5) * 5;
const dur = (base, opt = 0) => (r5(base + opt) > r5(base) ? `${r5(base)}–${r5(base + opt)} min` : `≈${r5(base)} min`);

/* Minutes of each week's wall-ball and BBJ blocks, for the duration estimates. */
const WB_MIN = { 1: 8, 2: 12, 3: 14, 4: 6, 5: 10, 6: 12, 7: 12, 8: 12, 9: 10, 10: 14, 11: 8, 12: 10, 13: 8 };
const BBJ_MIN = { 1: 12, 2: 12, 3: 16, 4: 5, 5: 12, 6: 12, 7: 23, 8: 10, 9: 26, 10: 10, 11: 8, 12: 8, 13: 10 };
const ROW_MIN = { 1: 32, 2: 40, 3: 40, 4: 30, 5: 51, 6: 51, 7: 47, 8: 32, 9: 47, 10: 46, 11: 41, 12: 32, 13: 47 };
const timerMin = t => (t.steps ? t.steps.reduce((a, s) => a + s.secs, 0) / 60 - 10
  : t.sets ? (t.sets * t.reps * (t.work + t.rest) + (t.sets - 1) * t.setRest) / 60
  : (t.reps * t.work + (t.reps - 1) * t.rest) / 60);

/* ── Monday: VO₂max bike + run off the bike + Upper A ──
   After a rest day, so the most important engine session is done fresh. Bench
   press is not affected by cycling intervals done just before (fatigue stays in the
   legs, Sporer & Wenger 2003), so upper-body lifting shares the visit. */
const upperAMin = w => 3 + heavySets(w, UP_HEAVY(w)) * 4.5 + musc(w) * 2;
const upperAOpt = w => musc(w) * 2.5;
function upperA(w) {
  const m = musc(w);
  const test = w === 1 || w === 8 || w === 12;
  return [
    { title: 'Upper A · heavy', lift: 'upper', items: [
      it('Bench press', heavyDose(w, UP_HEAVY(w)), `${RPE(w)} 2 warm-up sets first. Rotate bench → pull-up → lateral raise, about 90 s between.`, { load: 'log kg', bench: 'bp1rm' }),
      it(test ? 'Pull-ups: max-rep test, then weighted' : 'Weighted pull-up', heavyDose(w, UP_HEAVY(w)), test
        ? 'Test week: first set is strict bodyweight pull-ups to failure (log it), then the weighted sets.'
        : 'RPE 7–8. Belt or a DB between the feet. Under 8 strict reps at bodyweight? Do bodyweight sets (or band-assisted) for now.', { load: 'log kg', ...(test ? { bench: 'pullups' } : {}) }),
      it('DB lateral raise', `${heavySets(w, UP_HEAVY(w))}×12–20`, 'In the rest after the pull-ups. The last reps should be a fight: side delts carry 100 wall balls overhead.'),
    ] },
    { title: 'Upper A · back', lift: 'upper', items: [
      it('Seated cable row (or chest-supported row)', `${m}×8–12`, '1–2 reps short of failure, 60–90 s rest.', { load: 'log kg' }),
    ] },
    { title: 'Arms · superset', lift: 'upper', optional: true, items: [
      it('EZ-bar curl', `${m}×8–12`, '1 rep short of failure. Alternate with the pushdowns, 60 s rest.'),
      it('Triceps rope pushdown', `${m}×10–15`, '1 rep short of failure.'),
    ] },
  ];
}

function monVO2(w) {
  const v = VO2[w];
  const r = MON_RUN[w];
  const alt = v.noWatts ? monVO2Build(w, { ...v, ...v.noWatts, noWatts: null }, r) : null;
  return { ...monVO2Build(w, v, r), ...(alt ? { noWatts: alt } : {}) };
}

function monVO2Build(w, v, r) {
  const mins = 10 + timerMin(v.timer) + r[2] + 3 + upperAMin(w);
  return {
    kind: 'vo2', title: `${v.title} + Upper A`, duration: dur(mins, upperAOpt(w)), intensity: 'Hard',
    tags: ['Bike', 'VO₂max', 'Upper body'],
    purpose: `${v.purpose} Then Upper A: heavy bench and pull-ups, rows, shoulders, arms.`,
    blocks: [
      { title: 'Warm-up · 10 min', items: [it('Easy spin, build to moderate', '10 min', 'Last 2 min include 2 × 15 s spin-ups', { mode: 'bike' })] },
      { title: 'Main set', items: v.main },
      { title: 'Run off the bike', items: [run(r[0], r[1], w <= 3 ? 'Treadmill 1%, quick short steps (+5–10% cadence). Pain must stay ≤3/10.' : 'Easy, HR ≤150. Quick cadence. Feels awkward first: that is the HYROX transition.', r[2])] },
      ...upperA(w),
    ],
    timers: [v.timer],
  };
}

/* ── Tuesday: Lower A · squat + sleds ──
   24 h after the bike intervals: leg strength is back by then (Sporer & Wenger
   2003). Heavy legs here, not the day before the intervals, because heavy leg
   lifting blunts endurance sessions for up to 48 h (Doma 2017). */
function lowerA(w) {
  const wb = WB[w];
  const sq = LEG_HEAVY(w);
  const n = musc(w);
  const test = w === 3 || w === 7;
  const nord = w <= 2 ? '2×4' : isDeload(w) || w >= 13 ? '2×5' : w >= 9 ? '3×6' : '3×5';
  const mins = 10 + 5 + 3 + heavySets(w, sq) * 3 + sets(w, 3) * 3 + sets(w, 4) * 4 + sets(w, 3) * 2.5 + WB_MIN[w] + n * 2;
  return {
    kind: 'strength', title: `Lower A · squat, sleds, calves${isDeload(w) ? ' · deload' : ''}`, duration: dur(mins), intensity: 'Moderate',
    tags: ['Legs', 'Sleds', 'Calves', 'Wall balls'],
    purpose: 'Heavy squats and both sleds for the stations, Nordics for the hamstrings, <b>soleus and calf capacity to protect the shins</b>, then the wall-ball block. Heavy strength 2×/week improves running economy 2–8% (Blagrove 2018) and cuts sports injuries (Lauersen 2014).',
    blocks: [
      { title: 'Warm-up · 10 min', items: [
        it('Bike easy + ankle/hip mobility', '8 min', 'Knee-to-wall ankle rocks, 90/90 hips, glute bridges'),
        it('Heel-raise test (weekly)', 'each leg', 'Single leg to fatigue on a step, 1 rep every 2 s. Log left and right in Progress.', { bench: 'calfL', mode: 'calf' }),
      ] },
      hopsBlock(w),
      { title: 'Heavy · legs and sleds', lift: 'lower', items: [
        it('Back squat', heavyDose(w, sq), `${RPE(w)} 2–3 warm-up sets first. Full depth: wall balls need hips below knees. Rest 2–3 min.`, { load: 'log kg', bench: 'sq1rm' }),
        it('Bulgarian split squat', `${sets(w, 3)}×8/leg`, '1–2 reps short of failure. Lunge durability for long femurs.', { load: '2×16–24 kg' }),
        it('Heavy sled push', `${sets(w, 4)}×12.5 m`, test ? 'Test week: after the work sets, 50 m at race weight for time (Progress → Sled push).' : 'About 110–115% of race load on your gym floor. Short powerful steps, low line.', { load: '152 kg +10–15%', ...(test ? { bench: 'push50' } : {}) }),
        it('Heavy sled pull', `${sets(w, 4)}×12.5 m`, test ? 'Test week: rest 5 min after the push test, then 50 m at race weight for time (Progress → Sled pull).' : 'Walk-back for the first metres, then hand-over-hand from a low, flat-footed squat. Rope to the side.', { load: '103 kg + sandbag', ...(test ? { bench: 'pull50' } : {}) }),
      ] },
      { title: 'Hamstrings & soleus · superset', lift: 'lower', items: [
        it('Nordic hamstring curl', nord, w <= 3 ? 'Kneel, feet held. Lower as slowly as you can, catch yourself with your hands, push back up. Expect sore hamstrings the first week: that is why it starts small.' : 'Lower slower than last week. Hands catch you at the bottom.'),
        calf('Seated soleus raise (bent knee)', `${sets(w, 3)}×15–20`, 'Alternate with the Nordics. Slow 2-1-2 tempo. Add load 5–10% a week if shins stay green.'),
      ] },
      { title: 'Wall-ball block', items: wb.items },
      { title: 'Calves & shins · superset', lift: 'lower', items: [
        calf('Standing calf raise, loaded', `${n}×10–15`, CALF_STAND),
        it('Tibialis raises', '2×20', 'Alternate with the calf raises. Back against a wall, heels down, toes up.', { mode: 'calf' }),
      ] },
    ],
    timers: wb.timer ? [wb.timer] : [],
  };
}

/* ── Wednesday: RowErg + Upper B ── */
const upperBMin = w => 2 + musc(w) * 6.5;
const upperBOpt = w => musc(w) * 3;
function upperB(w) {
  const m = musc(w);
  return [
    { title: 'Upper B · press & pull', lift: 'upper', items: [
      it('Overhead press (barbell, or seated DB)', `${m}×6–10`, '1–2 reps short of failure. Alternate with the pulldowns, 90 s rest.', { load: 'log kg' }),
      it('Lat pulldown (or pull-ups)', `${m}×8–12`, '1–2 reps short of failure. Lats for the sled pull and the row.', { load: 'log kg' }),
      it('Incline DB press', `${m}×8–12`, '1–2 reps short of failure. Alternate with the face pulls.', { load: 'log kg' }),
      it('Face pulls', `${m}×15`, 'Rear delts and shoulder health for wall balls.', { load: 'light' }),
    ] },
    { title: 'Dips & curls · superset', lift: 'upper', optional: true, items: [
      it('Dips (or close-grip push-ups)', `${m}×8–12`, 'Chest and triceps. Add weight once 12 is easy.'),
      it('Hammer curl', `${m}×10–15`, '1 rep short of failure. Also builds grip for the sled pull and farmers carry.'),
    ] },
  ];
}

function wedRow(w) {
  const r = ROW[w];
  const mins = ROW_MIN[w] + 5 + 3 + upperBMin(w);
  return {
    kind: r.intensity === 'Easy' ? 'z2' : 'threshold', title: `${r.title} + Upper B`, duration: dur(mins, upperBOpt(w)), intensity: r.intensity,
    tags: ['RowErg', 'Upper body'],
    purpose: `${r.intensity === 'Easy'
      ? 'Easy volume builds the aerobic base without any tibial load. 75–80% of your training should feel like this (pyramidal distribution, Rosenblat 2025).'
      : 'Threshold work raises the pace you can hold for 90 minutes: the intensity HYROX actually lives at (≈80% of race time above 90% HRmax, Brandt 2025).'} Then Upper B: shoulders, lats, upper chest, triceps and biceps.`,
    blocks: [
      { title: 'Row', items: [it('HR check: 5 min at 2:35/500 m', '5 min', 'Damper 5, about 20 strokes/min, hold 2:35 on the monitor. Note your HR at the end (Progress → HR at 2:35 row). Lower over the weeks = fitter.', { bench: 'hrRow', mode: 'row', only: 'noWatts' }), ...r.items] },
      ...upperB(w),
    ],
    timers: r.timer ? [r.timer] : [],
  };
}

/* ── Thursday: easy run + Lower B · deadlift + burpees ── */
function thuLowerB(w) {
  const r = THU_RUN[w];
  const b = BBJ[w];
  const dl = LEG_HEAVY(w);
  const simWeek = w === 11; // full simulation on Saturday: lighter legs
  const dlSets = simWeek ? 3 : heavySets(w, dl);
  const tri = simWeek ? 2 : musc(w);
  const mins = r[2] + 5 + 3 + dlSets * 3 + BBJ_MIN[w] + tri * 4;
  const opt = 3; // dead hangs
  return {
    kind: 'strength', title: `${w <= 3 || w === 11 ? 'Run' : 'Long run'} + Lower B · deadlift, burpees${isDeload(w) ? ' · deload' : ''}`, duration: dur(mins, opt), intensity: 'Moderate',
    tags: ['Run', 'Legs', 'BBJ', 'Hamstrings'],
    purpose: `${w <= 3 ? 'Walk-run' : 'Long run'} while fresh, hops, then the heavy hinge for the posterior chain, burpee broad jumps (Rio: 10:03 → target 6:45), and a quad-hamstring-calf circuit for leg muscle.` + (simWeek ? ' <b>Full simulation on Saturday: one set less and RPE 7.</b>' : ''),
    blocks: [
      { title: w <= 3 || w === 11 ? 'Easy run' : 'Long run · outdoors OK', items: [run(r[0], r[1], w <= 3
        ? 'Treadmill 1% or flat soft surface. Quick steps. Stop if pain >3/10.'
        : `Your longest run of the week. Outside is fine: even, flat-ish route, easy pace (HR ≤150, full sentences). Easy pace matters most: shinbone strain rises with speed. Cadence +5%. Never more than 10% longer than your longest run in the last 30 days (the app checks your Garmin runs).${w >= 9 ? ' Buenos Aires summer: go early and drink after.' : ''}`, r[2])] },
      hopsBlock(w),
      { title: 'Heavy · hinge', lift: 'lower', items: [
        it('Trap-bar deadlift (or RDL)', `${dlSets}×${dl[1]}`, `${simWeek ? 'RPE 7 this week. ' : ''}${RPE(w)} Hips back, lats tight, 2 warm-up sets first.`, { load: 'log kg', bench: 'dl1rm' }),
      ] },
      { title: 'Burpee broad jumps', items: b.items },
      { title: 'Leg muscle · tri-set', lift: 'lower', items: [
        it('Leg press (or hack squat)', `${tri}×10–15`, 'Deep, controlled, 1–2 reps short of failure. Then straight to the leg curl.', { load: 'log kg' }),
        it('Lying or seated leg curl', `${tri}×10–15`, '1–2 reps short of failure. Then the calf raise, then 60 s rest.', { load: 'log kg' }),
        calf('Standing calf raise, loaded', `${tri}×10–15`, CALF_STAND),
      ] },
      { title: 'Grip', optional: true, items: [it('Dead hang', '2×max', 'Grip endurance for the sled pull')] },
    ],
    timers: b.timer ? [b.timer] : [],
  };
}

/* ── Friday: long Zone 2 bike + core, carries and feet ── */
function friZ2(w) {
  const mins = { 1: 45, 2: 60, 3: 60, 4: 45, 5: 60, 6: 70, 7: 70, 8: 50, 9: 70, 10: 70, 11: 45, 12: 60, 13: 45 }[w];
  const n = sets(w, 3);
  return {
    kind: 'z2', title: `Zone 2 bike · ${mins} min + core`, duration: dur(mins + 20, 10), intensity: 'Easy',
    tags: ['Bike', 'Aerobic base', 'Core', 'Shin prehab'],
    purpose: 'Long, easy and boring on purpose: builds mitochondria and capillaries and lets you recover for Saturday. Easy means you could talk in full sentences the whole ride. Then 20 minutes of trunk, grip and foot work, the stuff that keeps you upright in carries, sleds and lunges.',
    blocks: [
      { title: 'Bike', items: [
        it('HR check: 180 W for 5 min', '5 min', 'Note HR at the end (Progress → HR at 180 W). Lower over the weeks = fitter.', { bench: 'hr180', mode: 'bike', only: 'watts' }),
        it('Zone 2 ride', `${mins - 5} min`, 'HR {z2}. Nasal breathing possible. Light knob, smooth ~90 rpm (15 right-foot turns per 10 s).', { mode: 'bike', only: 'watts' }),
        it('Zone 2 ride', `${mins} min`, 'HR {z2}. Nasal breathing possible. Light knob, smooth ~90 rpm (15 right-foot turns per 10 s).', { mode: 'bike', only: 'noWatts' }),
      ] },
      { title: 'Core, carries & feet · 20 min', lift: 'core', items: [
        it('Ab wheel rollout (or dead bug)', `${n}×8–12`, 'Ribs down, no low-back sag. Alternate with the Pallof press.'),
        it('Pallof press', `${n}×10/side`, 'Anti-rotation: the trunk job in sled pulls and farmers carries.', { load: 'cable or band' }),
        it('Farmers carry, heavy', `${n}×50 m`, 'Grip and trunk. Short quick steps, heavier than race weight.', { load: '2×32 kg' }),
        it('Copenhagen plank', '2×20–30 s/side', 'Adductors for lunges and sleds.', { mode: 'mobility' }),
        calf('Single-leg calf raise, loaded', `${n}×12–15/leg`, 'Straight knee, on a step, DB in the same-side hand. Full stretch at the bottom, 2 s up, 2 s down.'),
        it('Single-leg balance + reach', '2×30 s/leg', 'Foot control, arch active.', { mode: 'mobility' }),
      ] },
      { title: 'Mobility · 10 min', optional: true, items: [it('Hips, T-spine, calves', '10 min', 'Couch stretch, open books, calf wall stretch (bent and straight knee)', { mode: 'mobility' })] },
    ],
    timers: [],
  };
}

/* Saturday HYROX sessions */
const legRun = (n, detail = 'HYROX race pace ~5:30/km. HR 165–175.') => run(`1 km run (leg ${n})`, '1 km', detail, 6, true);
const legBike = n => it(`4 min bike at threshold (leg ${n})`, '4 min', 'RPE 7. Stands in for 1 km of running.', { mode: 'bike' });
const SKI_SUB = it('SkiErg substitute: 1,000 m row', '1,000 m', 'No SkiErg: row at damper 7, long strong pulls. Or 4×30 band ski pulls + 40 cal bike.', { mode: 'row' });

function satSession(w) {
  const base = { intensity: 'Hard', duration: '75–95 min', tags: ['Race-specific'] };
  const warm = { title: 'Warm-up · 12 min', items: [it('Bike easy, then dynamic mobility', '12 min', 'Leg swings, lunges with reach, 3 × 10 s spin-ups', { mode: 'bike' })] };
  const rox = it('Roxzone drill', 'every transition', 'Put the stations 30–50 m from the run start and JOG in and out. Never walk. Floor is lava.', { mode: 'station' });
  switch (w) {
    case 1: return { ...base, kind: 'station', title: 'Station circuit · no impact', purpose: 'Learn race rhythm without running: bike stands in for the 1 km legs while the shins rebuild.', blocks: [warm, { title: '3 rounds, 2 min rest', items: [legBike('a'), it('Sled push', '25 m', 'Race weight', { load: '152 kg' }), legBike('b'), it('Sled pull', '25 m', 'Race weight', { load: '103 kg' }), it('Wall balls', '20', '6 kg, 3 m', { load: '6 kg' })] }] };
    case 2: case 3: return { ...base, kind: 'station', title: `Compromised stations · ${w === 2 ? 4 : 5} rounds`, purpose: 'Station work under aerobic fatigue, alternating row and bike legs. Builds the HYROX-specific engine with zero tibial load.', blocks: [warm, { title: `${w === 2 ? 4 : 5} rounds, 90 s rest`, items: [it('1,000 m row or 4 min bike (alternate)', 'leg', 'RPE 7', { mode: 'row' }), it('Sled push 25 m', '25 m', '', { load: '152 kg' }), it('Sled pull 25 m', '25 m', '', { load: '103 kg' }), it('Sandbag lunges 25 m', '25 m', 'Upright, steady', { load: '20 kg' }), it('Wall balls', '25', '', { load: '6 kg' })] }, { title: 'Transitions', items: [rox] }] };
    case 4: return { ...base, kind: 'station', intensity: 'Easy', title: 'Technique + Zone 2 · deload', purpose: 'Christmas deload. Technique only: grooved movement for later.', blocks: [warm, { title: 'Technique · 30 min', items: [it('Sled push technique', '4×12.5 m', 'Test arms-long vs bent-arm: pick one', { load: 'race' }), it('Sled pull technique', '4×12.5 m', 'Walk-back vs hand-over-hand', { load: 'race' }), it('Lunges', '2×25 m', '', { load: '20 kg' }), it('Wall balls', '3×15', 'Catch into the squat', { load: '6 kg' })] }, { title: 'Aerobic', items: [it('Zone 2 bike', '30 min', 'HR {z2}', { mode: 'bike' })] }] };
    case 5: case 7: return { ...base, kind: 'sim', title: `Half simulation A · stations 1–4`, purpose: 'First half of the race at race effort: ski, sleds, burpees. Practise pacing the sleds so Run 3 and 4 don\'t collapse.', blocks: [warm, { title: 'Half sim A', items: [legRun(1), SKI_SUB, w === 5 ? legBike(2) : legRun(2), it('Sled push 50 m', '50 m', 'Never stop mid-length', { load: '152 kg' }), legRun(3), it('Sled pull 50 m', '50 m', 'Hips first', { load: '103 kg' }), w === 5 ? legBike(4) : legRun(4), jump('Burpee broad jumps 40 m', '40 m', 'Step down, step up, ~10 reps per 20 m')] }, { title: 'Transitions', items: [rox] }] };
    case 6: case 9: return { ...base, kind: 'sim', title: 'Half simulation B · stations 5–8', purpose: 'The back half where Rio fell apart. Practise <b>gel at Run 5/7 and the Run 8 shuffle start</b>.' + (w === 9 ? ' Full rehearsal of fuelling.' : ''), blocks: [warm, { title: 'Half sim B', items: [legRun(5), it('Row 1,000 m', '1,000 m', 'Target 4:35. Hold the split.', { mode: 'row' }), w === 6 ? legBike(6) : legRun(6), it('Farmers carry 200 m', '200 m', 'No set-downs', { load: '2×24 kg' }), legRun(7, 'Take gel 2 or a carb sip here.'), it('Sandbag lunges 100 m', '100 m', 'Steady, no rest at 50 m', { load: '20 kg' }), legRun(8, '200 m shuffle, then 80% effort. Target 6:00–6:05.'), it('Wall balls 100', '100', '20s, 10 breaths, ball held', { load: '6 kg' })] }, { title: 'Transitions', items: [rox] }] };
    case 8: return { ...base, kind: 'station', intensity: 'Moderate', title: 'Transitions + technique · deload', purpose: 'Roxzone is 7:46 of your Rio time. Practise jogging in and out of stations until it is automatic.', blocks: [warm, { title: '6 rounds, easy-moderate', items: [it('2 min bike', '2 min', 'RPE 6', { mode: 'bike' }), it('Jog 30 m → 1 min station → jog back', '1 round', 'Rotate push, pull, lunges, wall balls, farmers, burpees (no jump)', { mode: 'station' })] }, { title: 'Aerobic', items: [it('Zone 2 row', '20 min', '', { mode: 'row' })] }] };
    case 10: return { ...base, kind: 'sim', title: 'Run 8 bricks', purpose: '<b>Run 8 cost you 2:30 in Rio.</b> Run 8 correlates strongly with wall-ball performance (r≈0.74). Train exactly that sequence: lunges → 1 km → wall balls.', blocks: [warm, { title: 'Sled primer', items: [it('Heavy sled push', '4×12.5 m', '', { load: '152 kg +10%' })] }, { title: '3 rounds, 3 min rest', items: [it('Sandbag lunges 50 m', '50 m', '', { load: '20 kg' }), run('1 km at Run 8 target', '1 km', 'First 200 m shuffle, then 6:00/km. Amber: 4 min bike at threshold.', 6, true), it('Wall balls', '30', 'Unbroken or 20+10', { load: '6 kg' })] }] };
    case 11: case 13: return { ...base, kind: 'sim', duration: '100–110 min', title: w === 11 ? 'FULL SIMULATION #1' : 'Half simulation B · race pace', ...(w === 13 ? { purpose: 'Back half at race pace with full fuelling. Santiago next week is the big rehearsal, so leave 5%.', blocks: [warm, { title: 'Half sim B', items: [legRun(5), it('Row 1,000 m', '1,000 m', '4:35', { mode: 'row' }), legRun(6), it('Farmers 200 m', '200 m', '', { load: '2×24 kg' }), legRun(7), it('Lunges 100 m', '100 m', '', { load: '20 kg' }), legRun(8, '200 m shuffle, then race pace'), it('Wall balls 100', '100', 'Race plan', { load: '6 kg' })] }, { title: 'Transitions', items: [rox] }] } : {
      purpose: 'The whole race at about 95%: shoes, gloves, gels, caffeine and pacing exactly as on race day. <b>If amber, legs 2, 4 and 6 become 4 min bike.</b>',
      blocks: [warm, { title: '8 × (1 km + station)', items: [legRun(1, '5:05. Too easy.'), SKI_SUB, legRun(2), it('Sled push 50 m', '50 m', '', { load: '152 kg' }), legRun(3), it('Sled pull 50 m', '50 m', '', { load: '103 kg' }), legRun(4), jump('BBJ 80 m', '80 m', '6:45 target, ~40 reps'), legRun(5, 'Gel 1'), it('Row 1,000 m', '1,000 m', '4:35', { mode: 'row' }), legRun(6), it('Farmers 200 m', '200 m', '', { load: '2×24 kg' }), legRun(7, 'Gel 2'), it('Lunges 100 m', '100 m', '', { load: '20 kg' }), legRun(8, '200 m shuffle, then 80%'), it('Wall balls 100', '100', '20s plan', { load: '6 kg' })] }, { title: 'Transitions', items: [rox] }],
    }) };
    case 12: return { ...base, kind: 'sim', intensity: 'Moderate', title: 'Half simulation A · lighter week', purpose: 'Keeps the race feel in a lighter week.', blocks: [warm, { title: 'Half sim A', items: [legRun(1), SKI_SUB, legRun(2), it('Sled push 50 m', '50 m', '', { load: '152 kg' }), legRun(3), it('Sled pull 50 m', '50 m', '', { load: '103 kg' }), legBike(4), jump('BBJ 40 m', '40 m', '')] }] };
    default: return null;
  }
}

const REST = (title = 'Rest', note = 'Sleep 8+ h. An easy walk outside (20–45 min) is fine; no running: this is the shins\' day off between Saturday and Monday. Protein still 1.8–2.2 g/kg.') => ({
  kind: 'rest', title, duration: '—', intensity: 'Rest', tags: [], purpose: 'Adaptation happens here. Do the check-in anyway: it keeps the shin trend honest.',
  blocks: [{ title: 'Recovery', items: [it('Easy walk', '20–30 min', note, { mode: 'mobility' }), it('Mobility', '10 min', 'Calves, hips, T-spine', { mode: 'mobility' })] }], timers: [],
});

/* ── Week 0: post-Rio reset ── */
const WEEK0 = [
  REST('Rest · two days after Rio'),
  { kind: 'recovery', title: 'Easy spin', duration: '30 min', intensity: 'Easy', tags: ['Bike'], purpose: 'Blood flow only.', blocks: [{ title: 'Bike', items: [it('Easy spin', '30 min', 'HR <135', { mode: 'bike' })] }], timers: [] },
  { kind: 'recovery', title: 'Mobility + calf isometrics', duration: '30 min', intensity: 'Easy', tags: ['Shins'], purpose: 'Isometric holds calm tendon and bone-related pain while keeping the calf loaded.', blocks: [{ title: 'Prehab', items: [calf('Isometric calf holds (seated + standing)', '5×45 s', '~70% effort, mid-range'), it('Hip & T-spine mobility', '15 min', '', { mode: 'mobility' })] }], timers: [] },
  { kind: 'z2', title: 'Zone 2 bike + upper pump', duration: '60 min', intensity: 'Easy', tags: ['Bike'], purpose: 'Start rebuilding the engine with zero impact.', blocks: [{ title: 'Bike', items: [it('Zone 2', '40 min', 'HR {z2}', { mode: 'bike' })] }, { title: 'Upper', items: [it('Lat pulldown', '3×12', ''), it('Incline DB press', '3×12', ''), it('Face pulls', '3×15', '')] }], timers: [] },
  { kind: 'z2', title: 'Easy row + wall-ball technique', duration: '45 min', intensity: 'Easy', tags: ['RowErg'], purpose: 'Groove the catch-to-squat wall-ball pattern while fresh.', blocks: [{ title: 'Row', items: [it('Easy row', '30 min', '20 spm', { mode: 'row' })] }, { title: 'Wall balls', items: [it('Technique sets', '4×10', 'Catch into the next squat, throw only as high as needed', { load: '6 kg' })] }], timers: [] },
  { kind: 'z2', title: 'Zone 2 bike + sled technique', duration: '60 min', intensity: 'Easy', tags: ['Bike', 'Sleds'], purpose: 'Light technique on the station that cost you most time after BBJ.', blocks: [{ title: 'Bike', items: [it('Zone 2', '40 min', 'HR {z2}', { mode: 'bike' })] }, { title: 'Sled technique', items: [it('Sled pull walk-back drill', '4×12.5 m', 'Light load, learn the hip drive', { load: 'light' }), it('Sled push', '4×12.5 m', 'Light. Try long-arm and bent-arm.', { load: 'light' })] }], timers: [] },
  REST(),
];

/* ── Weeks 14–16: Santiago, recovery, Buenos Aires ──
   Strength is kept with heavy loads and few sets: one session a week held cyclists'
   strength and muscle for 13 weeks (Rønnestad 2010); intensity is what keeps it
   (Spiering 2021). Endurance volume drops 40–60% with intensity kept (Bosquet 2007). */
const upperKeep = (title = 'Upper · keep it (2 sets, same weights)') => ({ title, lift: 'upper', items: [
  it('Bench press', '2×4', 'Same weight as week 13, RPE 7. Paired with the pull-ups.', { load: 'log kg' }),
  it('Weighted pull-up', '2×4', 'Same weight as week 13, RPE 7.', { load: 'log kg' }),
  it('Seated cable row', '2×10', '2 reps short of failure.'),
  it('DB lateral raise', '2×15', ''),
  it('EZ-bar curl + rope pushdown', '2×12 each', 'Superset, 2 reps short of failure.'),
] });
const lowerKeep = [
  it('Back squat', '2×3', 'Same weight as week 13, RPE 7. Crisp, not grinding.', { load: 'log kg' }),
  it('Sled push', '2×12.5 m', '', { load: '152 kg' }),
  calf('Seated soleus raise', '2×15', ''),
  calf('Standing calf raise, loaded', '2×12', 'Same load as week 13'),
];
const lightA = { kind: 'strength', title: 'Lower A · 2 sets, keep the load', duration: '45–55 min', intensity: 'Moderate', tags: ['Legs', 'Wall balls'], purpose: 'Strength maintenance: keep the weights, drop the volume.', blocks: [{ title: 'Strength', lift: 'lower', items: lowerKeep }, { title: 'Wall balls', items: [it('Wall balls at race rhythm', '3×20', '10 breaths between', { load: '6 kg' })] }], timers: [] };
const WEEK14 = [
  { kind: 'vo2', title: 'Bike 4×3 + easy run + Upper', duration: '60–70 min', intensity: 'Hard', tags: ['Bike', 'Upper body'], purpose: 'Short, sharp, done. Keeps the engine switched on before Santiago, then upper body at the same weights with half the sets.', blocks: [{ title: 'Warm-up · 10 min', items: [it('Easy spin, build to moderate', '10 min', '', { mode: 'bike' })] }, { title: 'Main', items: [it('4 × 3 min', '4×3', '{vo2w}', { mode: 'bike' })] }, { title: 'Run', items: [run('Easy run off the bike', '10 min', 'Easy', 10)] }, upperKeep()], timers: [T.bike44(4, 180)] },
  lightA,
  { kind: 'z2', title: 'Row Zone 2 + prehab', duration: '45 min', intensity: 'Easy', tags: ['RowErg'], purpose: 'Easy volume.', blocks: [{ title: 'Row', items: [it('Zone 2 row', '30 min', '', { mode: 'row' })] }, { title: 'Prehab', items: [calf('Straight-knee calf raise', '2×12', ''), it('Copenhagen plank', '2×20 s/side', '', { mode: 'mobility' })] }], timers: [] },
  { kind: 'strength', title: 'Easy run + Lower B light', duration: '50–60 min', intensity: 'Moderate', tags: ['Run', 'BBJ'], purpose: 'Last loading before the rehearsal: same weights, very few reps.', blocks: [{ title: 'Run', items: [run('Easy run + 4 strides', '20 min', 'Relaxed', 20)] }, { title: 'Strength', lift: 'lower', items: [it('Trap-bar deadlift', '2×3', 'Same weight, RPE 7', { load: 'log kg' }), it('Sled pull', '2×12.5 m', '', { load: '103 kg' })] }, { title: 'BBJ', items: [jump('2 × 20 m BBJ', '40 m', 'Race rhythm only')] }], timers: [] },
  { kind: 'recovery', title: 'Travel · shake-out', duration: '20 min', intensity: 'Easy', tags: [], purpose: 'Legs fresh. Carbs up (6–8 g/kg). Learn the venue map.', blocks: [{ title: 'Shake-out', items: [it('Easy spin or walk', '20 min', '+ 3 × 10 s pick-ups', { mode: 'bike' })] }], timers: [] },
  { kind: 'race', title: 'HYROX Santiago · dress rehearsal', duration: '~1:30', intensity: 'Race', tags: ['🇨🇱 Santiago'], purpose: 'Race at <b>about 95%</b>: execute the Buenos Aires pacing plan, fuelling and Roxzone habits exactly. Do not empty the tank on wall balls; you need to be fresh again in 14 days.', blocks: [{ title: 'Race', items: [it('Warm-up', '20–25 min', 'Race-day protocol (Race tab)'), it('Run your BA plan at ~95%', '1:30–1:32', 'Splits from the Race tab. Gels at Run 5 and Run 7.'), it('Log your splits', 'after', 'Update targets for Buenos Aires based on what you learn.')] }], timers: [],
    variantB: { kind: 'sim', title: 'Full simulation #2 (not racing Santiago)', duration: '100 min', intensity: 'Hard', tags: ['Race-specific'], purpose: 'If you skip Santiago, this is your final full rehearsal, 14 days out.', blocks: [{ title: '8 × (1 km + station) at 95%', items: [legRun(1), SKI_SUB, legRun(2), it('Sled push 50 m', '50 m', '', { load: '152 kg' }), legRun(3), it('Sled pull 50 m', '50 m', '', { load: '103 kg' }), legRun(4), jump('BBJ 80 m', '80 m', ''), legRun(5, 'Gel 1'), it('Row 1,000 m', '1,000 m', '', { mode: 'row' }), legRun(6), it('Farmers 200 m', '200 m', '', { load: '2×24 kg' }), legRun(7, 'Gel 2'), it('Lunges 100 m', '100 m', '', { load: '20 kg' }), legRun(8), it('Wall balls 100', '100', '', { load: '6 kg' })] }], timers: [] } },
  REST('Rest · travel home'),
];
/* Week 15: runs Tue/Thu/Sat (alternate days); one lifting day for legs + upper,
   10 days before Buenos Aires. */
const WEEK15 = [
  { kind: 'recovery', title: 'Recovery spin + mobility', duration: '40 min', intensity: 'Easy', tags: ['Bike'], purpose: 'Two days after Santiago: flush the legs.', blocks: [{ title: 'Recovery', items: [it('Easy spin', '30 min', 'HR <135', { mode: 'bike' }), it('Mobility', '10 min', '', { mode: 'mobility' })] }], timers: [] },
  { kind: 'vo2', title: 'Bike 4×3 + easy run', duration: '45 min', intensity: 'Hard', tags: ['Bike'], purpose: 'Intensity stays, volume drops (Bosquet 2007 meta-analysis).', blocks: [{ title: 'Warm-up · 10 min', items: [it('Easy spin, build to moderate', '10 min', '', { mode: 'bike' })] }, { title: 'Main', items: [it('4 × 3 min', '4×3', '{vo2w}', { mode: 'bike' })] }, { title: 'Run', items: [run('Easy run off the bike', '10 min', '', 10)] }], timers: [T.bike44(4, 180)] },
  { ...lightA, title: 'Strength taper · legs + upper', duration: '55–65 min', purpose: 'Last lifting day before Buenos Aires (10 days out): same weights, 2 sets. Strength holds for weeks on this.', blocks: [{ title: 'Legs', lift: 'lower', items: lowerKeep }, { title: 'Wall balls', items: [it('Wall balls', '2×20', 'Race rhythm', { load: '6 kg' })] }, upperKeep('Upper · 2 sets, same weights')] },
  { kind: 'run', title: 'Easy run + race rhythm', duration: '45 min', intensity: 'Moderate', tags: ['Run', 'BBJ'], purpose: 'Keep the movements sharp.', blocks: [{ title: 'Run', items: [run('Easy run', '25 min', 'HR ≤150', 25)] }, { title: 'Rhythm', items: [jump('2 × 20 m BBJ', '40 m', 'Race rhythm'), it('Wall balls', '2×20', '', { load: '6 kg' })] }], timers: [] },
  { kind: 'z2', title: 'Row Zone 2 + prehab', duration: '40 min', intensity: 'Easy', tags: ['RowErg'], purpose: 'Easy.', blocks: [{ title: 'Row', items: [it('Zone 2 row', '25 min', '', { mode: 'row' })] }, { title: 'Prehab', items: [calf('Calf raises', '2×12', '')] }], timers: [] },
  { kind: 'sim', title: 'Race-pace touches', duration: '50 min', intensity: 'Moderate', tags: ['Race-specific'], purpose: 'Last session with any intensity, 7 days out.', blocks: [{ title: '4 rounds, 2 min rest', items: [legRun('a', 'Race pace 5:30'), it('Short station', '1 min', 'Sled push 12.5 m / pull 12.5 m / 20 WB / 10 BBJ (rotate)', { mode: 'station' })] }], timers: [] },
  REST(),
];
const WEEK16 = [
  { kind: 'recovery', title: 'Easy spin + wall-ball rhythm', duration: '35 min', intensity: 'Easy', tags: ['Bike'], purpose: 'Race week. Nothing to gain, everything to lose: stay fresh.', blocks: [{ title: 'Session', items: [it('Easy spin', '20 min', '', { mode: 'bike' }), it('Wall balls', '3×10', 'Crisp', { load: '6 kg' })] }, { title: 'Upper · light pump', lift: 'upper', optional: true, items: [it('Bench press + pull-ups', '2×5 each', 'About 70% of your working weight, RPE 6. Nothing heavy in race week.'), it('Curls + pushdowns', '2×12 each', 'Easy pump, far from failure.')] }], timers: [] },
  { kind: 'vo2', title: 'Openers', duration: '35 min', intensity: 'Moderate', tags: ['Bike', 'Run'], purpose: 'Wake the engine up.', blocks: [{ title: 'Openers', items: [it('Bike 3 × 2 min', '3×2', 'At VO₂max power, 2 min easy between', { mode: 'bike' }), run('Easy run + 3 strides', '10 min', '', 10)] }], timers: [T.bike44(3, 120)] },
  REST('Rest · gear check', 'Shoes tested on a sled, gloves, gels, caffeine. Read the venue map.'),
  { kind: 'recovery', title: 'Shake-out', duration: '25 min', intensity: 'Easy', tags: [], purpose: 'Carb load starts (6–8 g/kg/day).', blocks: [{ title: 'Shake-out', items: [run('Easy jog + 3 strides', '15 min', '', 15), it('Wall balls', '10', '', { load: '6 kg' }), it('Sled push', '1×12.5 m', 'Light', { load: 'light' })] }], timers: [] },
  REST('Rest · race eve', 'Carbs 6–8 g/kg, salty dinner, 8+ h in bed. Kit laid out.'),
  { kind: 'race', title: 'HYROX Buenos Aires · race day', duration: '~1:29', intensity: 'Race', tags: ['🇦🇷 Buenos Aires'], purpose: '<b>Goal: sub-1:30.</b> Follow the Race tab plan: pacing, fuelling at Run 5 and 7, Roxzone floor is lava. If Open Men race on Sunday, swap this day with Sunday.', blocks: [{ title: 'Race', items: [it('Breakfast', '-3 h', '≈190 g carbs, low fibre, 500–650 mL with sodium'), it('Caffeine', '-60 min', '≈290 mg (3 mg/kg), if rehearsed'), it('Warm-up', '20–25 min', 'Race tab protocol'), it('RACE', 'sub-1:30', 'Trust the plan. Even effort. Run 8: shuffle 200 m, then go.')] }], timers: [] },
  REST('Rest & celebrate'),
];

/* ── assemble weeks ── */
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildWeek(w) {
  if (w === 0) return WEEK0;
  if (w === 14) return WEEK14;
  if (w === 15) return WEEK15;
  if (w === 16) return WEEK16;
  return [monVO2(w), lowerA(w), wedRow(w), thuLowerB(w), friZ2(w), satSession(w), REST()];
}

export const WEEKS = Array.from({ length: TOTAL_WEEKS + 1 }, (_, w) => ({
  n: w,
  phase: phaseFor(w).id,
  deload: DELOAD.has(w),
  days: buildWeek(w).map((s, d) => ({ ...s, id: `w${w}d${d}`, timers: s.timers || [] })),
}));

export function weekStart(w) { return addDays(PLAN_START, w * 7); }

export function weekOf(date) {
  const d = typeof date === 'string' ? parseDay(date) : date;
  const diff = Math.round((d - PLAN_START) / 86400000);
  return { week: Math.floor(diff / 7), dow: ((diff % 7) + 7) % 7 };
}

export function currentWeek() {
  const { week } = weekOf(new Date());
  return Math.max(0, Math.min(TOTAL_WEEKS, week));
}

export function orderFor(w) {
  return store.swaps[`w${w}`] || [0, 1, 2, 3, 4, 5, 6];
}

/* Session scheduled on a given date (swaps + variant applied, not yet adapted). */
export function sessionFor(key) {
  const { week, dow } = weekOf(key);
  if (week < 0 || week > TOTAL_WEEKS) return null;
  const src = orderFor(week)[dow];
  let s = WEEKS[week].days[src];
  if (store.variants[key] === 'B' && s.variantB) s = { ...s.variantB, id: s.id, timers: s.variantB.timers || [] };
  return { ...forEquipment(s), week, dow, src };
}

/* Bike with or without a watts display (profile.bikeWatts). */
export function forEquipment(s) {
  const watts = !!store.profile.bikeWatts;
  let out = !watts && s.noWatts ? { ...s.noWatts, id: s.id } : s;
  out = { ...out, blocks: out.blocks.map(b => ({ ...b, items: b.items.filter(i => !i.only || (i.only === 'watts') === watts) })) };
  return out;
}

export function weekDays(w) {
  const start = weekStart(w);
  return DOW.map((dow, i) => {
    const date = addDays(start, i);
    const key = dayKey(date);
    return { i, dow, dnum: date.getDate(), date, key, label: date.toLocaleDateString('en-GB', { weekday: 'long' }), session: sessionFor(key) };
  });
}

const HARD = new Set(['vo2', 'sim', 'race']);
const hasRun = s => s.blocks.some(b => b.items.some(i => i.mode === 'run'));
const legHeavy = s => s.kind === 'strength' || s.kind === 'sim' || s.kind === 'station';

export function swapSafety(w, a, b) {
  const order = [...orderFor(w)];
  [order[a], order[b]] = [order[b], order[a]];
  const days = order.map(i => WEEKS[w].days[i]);
  for (let i = 0; i < 6; i++) {
    const x = days[i], y = days[i + 1];
    if (HARD.has(x.kind) && HARD.has(y.kind)) return { ok: false, msg: `Two hard engine days back to back (${DOW[i]}–${DOW[i + 1]})` };
    if (hasRun(x) && hasRun(y)) return { ok: false, msg: `Running two days in a row (${DOW[i]}–${DOW[i + 1]}): harder on the shins` };
    if (legHeavy(x) && legHeavy(y) && x.kind !== 'station') return { ok: false, msg: `Heavy legs two days in a row (${DOW[i]}–${DOW[i + 1]})` };
  }
  return { ok: true, msg: 'Good spacing: runs on alternate days, hard days separated' };
}

export function doSwap(w, a, b) {
  const order = [...orderFor(w)];
  [order[a], order[b]] = [order[b], order[a]];
  store.swaps[`w${w}`] = order;
}

/* weekly load summary */
export function weekStats(w) {
  let runMin = 0, engineMin = 0, hard = 0, strength = 0, jumps = 0, lifts = 0;
  WEEKS[w].days.forEach(s => {
    if (HARD.has(s.kind) || s.kind === 'threshold') hard++;
    if (s.kind === 'strength') strength++;
    if (s.blocks.some(b => b.lift === 'upper' || b.lift === 'lower')) lifts++;
    s.blocks.forEach(b => b.items.forEach(i => {
      if (i.mode === 'run') runMin += i.minutes || 0;
      if (i.mode === 'bike' || i.mode === 'row') {
        const m = String(i.dose).match(/(\d+)\s*min/);
        if (m) engineMin += Number(m[1]);
        else if (/(\d+)×(\d+)/.test(i.dose)) { const [, r, mm] = i.dose.match(/(\d+)×(\d+)/); engineMin += Number(r) * Number(mm) * (i.dose.includes('13') ? 0.5 : 1); }
        else if (/1,000 m|2k/.test(i.dose)) engineMin += 5;
      }
      if (i.mode === 'jump') {
        const c = String(i.dose).match(/^(\d+)×(\d+) contacts/);
        const m = String(i.dose).match(/(\d+)\s*(jumps|m)\b/);
        if (c) jumps += Number(c[1]) * Number(c[2]);
        else if (m) jumps += m[2] === 'm' ? Math.round(Number(m[1]) / 2) : Number(m[1]);
      }
    }));
  });
  return { runMin, engineMin: Math.round(engineMin), hard, strength, jumps, lifts };
}

export const DOW_NAMES = DOW;
