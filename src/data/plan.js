/* ═══════════════════════════════════════════════════════════
   16-week plan · 30 Nov 2026 → HYROX Buenos Aires 20 Mar 2027
   Week 0 (23–29 Nov) is the post-Rio reset.
   Santiago (6 Mar, week 14) = dress rehearsal at ~95%.

   Weekly skeleton (runs on alternate days for the shins):
   Mon  Strength A (squat · sled push · soleus) + wall-ball block
   Tue  VO₂max on the bike + short run off the bike           ← run 1
   Wed  RowErg: Zone 2 (base) → threshold (build) + shin prehab
   Thu  Easy run + Strength B (hinge · sled pull · grip) + BBJ ← run 2
   Fri  Long Zone 2 bike + mobility
   Sat  HYROX compromised session / simulation                 ← run 3
   Sun  Rest
   Mon + Thu also start with a few minutes of small hops (green days only), and
   end with a "Muscle" block (leg press, Nordics, leg curl, loaded calf raises):
   about 10–12 hard sets per leg muscle a week, the dose that builds muscle.
   Evidence: research/02 (§A, B, C, G), research/03 (§1, 2, 6, 7), research/04.
   ═══════════════════════════════════════════════════════════ */
import { store, parseDay, dayKey, addDays } from '../store.js';

export const PLAN_START = new Date(2026, 10, 23); // Mon 23 Nov 2026 = week 0
export const RACE_DAY = '2027-03-20';
export const TOTAL_WEEKS = 16;

export const PHASES = [
  { id: 'reset', name: 'Reset', weeks: [0], blurb: 'Post-Rio recovery. Bike and rower only, shins quiet, no running.' },
  { id: 'rebuild', name: 'Rebuild', weeks: [1, 2, 3, 4], blurb: 'Walk-run return, first VO₂max intervals on the bike, baseline tests, station technique. Week 4 is the Christmas deload.' },
  { id: 'build1', name: 'Build 1', weeks: [5, 6, 7, 8], blurb: 'Rønnestad 30/15s and long intervals, rowing threshold, half simulations, continuous easy running. Week 8 deload and retest.' },
  { id: 'build2', name: 'Build 2', weeks: [9, 10, 11, 12], blurb: 'Race-specific: Run 8 bricks, Karen, full simulation in week 11, 1 km run legs. Week 12 is lighter. Calories move to maintenance.' },
  { id: 'peak', name: 'Peak', weeks: [13, 14], blurb: 'Race-pace sharpening, strength to 2 sets, Santiago as the final dress rehearsal on 6 March.' },
  { id: 'taper', name: 'Taper', weeks: [15, 16], blurb: 'Volume down 40–60%, intensity kept (Bosquet 2007). Race Buenos Aires.' },
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

const TUE_RUN = { 1: ['Walk-run', '4×(1′/1′)', 8], 2: ['Walk-run', '5×(1′/1′)', 10], 3: ['Walk-run', '5×(2′/1′)', 15], 4: ['Easy run-walk', '10 min', 10], 5: ['Easy run off the bike', '12 min', 12], 6: ['Easy run off the bike', '15 min', 15], 7: ['Easy run off the bike', '15 min', 15], 8: ['Easy run off the bike', '10 min', 10], 9: ['Easy run off the bike', '15 min', 15], 10: ['Easy run off the bike', '20 min', 20], 11: ['Easy run off the bike', '10 min', 10], 12: ['Easy run off the bike', '15 min', 15], 13: ['Easy run off the bike', '20 min', 20] };
const THU_RUN = { 1: ['Walk-run', '6×(1′/1′)', 12], 2: ['Walk-run', '5×(2′/1′)', 15], 3: ['Walk-run', '4×(4′/1′)', 20], 4: ['Easy run', '15 min', 15], 5: ['Easy run', '20 min', 20], 6: ['Easy run', '25 min', 25], 7: ['Easy run + 4 strides', '25 min', 25], 8: ['Easy run', '20 min', 20], 9: ['Easy run + 4 strides', '30 min', 30], 10: ['Easy run', '35 min', 35], 11: ['Easy run', '20 min', 20], 12: ['Easy run + 4 strides', '30 min', 30], 13: ['Easy run + 4 strides', '35 min', 35] };

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

/* Hops, twice a week (Mon + Thu), before lifting. Contacts per session.
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

/* Muscle work: 2 sets in weeks 1–2 (sore legs wreck the first runs), then 3;
   week 13 back to 2. Each set ends 1–2 reps short of failure. */
const musc = w => (w <= 2 || w >= 13 ? 2 : sets(w, 3));
const CALF_STAND = 'Straight knee, on a step. 2 s pause in the deep stretch at the bottom; when the full reps run out, add half reps from the bottom (Kassiano 2023: more calf growth). Machine, Smith or a DB in one hand.';

/* ── session builders ── */
const isDeload = w => DELOAD.has(w);
const sets = (w, base) => (isDeload(w) ? Math.max(2, base - 1) : base);

function monStrengthA(w) {
  const sq = w <= 3 ? '3×5' : w <= 8 ? '4×4' : w <= 12 ? '4×3' : '2×3';
  const wb = WB[w];
  return {
    kind: 'strength', title: `Strength A · squat, sled push, calves${isDeload(w) ? ' · deload' : ''}`, duration: '75–85 min', intensity: 'Moderate',
    tags: ['Legs', 'Calves', 'Wall balls'],
    purpose: 'Leg strength for sleds and lunges, <b>soleus capacity to protect the shins</b>, the wall-ball block, then leg muscle. Strength 2×/week improves running economy 2–8% (Blagrove 2018); hops plus heavy lifting beat either alone.',
    blocks: [
      { title: 'Warm-up · 10 min', optional: false, items: [
        it('Bike easy + ankle/hip mobility', '8 min', 'Knee-to-wall ankle rocks, 90/90 hips, glute bridges'),
        ...([it('Heel-raise test (weekly)', 'each leg', 'Single leg to fatigue on a step, 1 rep every 2 s. Log left and right in Progress.', { bench: 'calfL', mode: 'calf' })]),
      ] },
      hopsBlock(w),
      { title: 'Strength', items: [
        it('Back or front squat', sets(w, Number(sq[0])) + sq.slice(1), 'RPE 7–8 (2–3 reps in reserve). Full depth: wall balls need hips below knees.', { load: 'log kg' }),
        it('Bulgarian split squat', `${sets(w, 3)}×8/leg`, 'Lunge durability for long femurs. DBs at sides.', { load: '2×16–24 kg' }),
        it('Heavy sled push', `${sets(w, 4)}×12.5 m`, w === 3 || w === 7 ? 'Then test: 50 m at race weight for time (Progress → Sled push).' : 'About 110–115% of race load on your gym floor. Short powerful steps, low line.', { load: '152 kg +10–15%', ...(w === 3 || w === 7 ? { bench: 'push50' } : {}) }),
        calf('Seated soleus raise (bent knee)', `${sets(w, 3)}×15–20`, 'Slow 2-1-2 tempo. Add load 5–10% a week if shins stay green.'),
        it('Tibialis raises', '2×20', 'Back against a wall, heels on the floor, toes up.', { mode: 'calf' }),
      ] },
      { title: 'Wall-ball block', items: wb.items },
      { title: 'Muscle · legs', items: [
        it('Leg press (or hack squat)', `${musc(w)}×10–15`, 'Deep, controlled, 1–2 reps short of failure. Quads without loading the spine again.', { load: 'log kg' }),
        calf('Standing calf raise, loaded', `${musc(w)}×10–15`, CALF_STAND),
      ] },
    ],
    timers: wb.timer ? [wb.timer] : [],
  };
}

function tueVO2(w) {
  const v = VO2[w];
  const r = TUE_RUN[w];
  const alt = v.noWatts ? tueVO2Build(w, { ...v, ...v.noWatts, noWatts: null }, r) : null;
  return { ...tueVO2Build(w, v, r), ...(alt ? { noWatts: alt } : {}) };
}

function tueVO2Build(w, v, r) {
  return {
    kind: 'vo2', title: v.title, duration: v.main[0].bench ? '45 min' : '55–60 min', intensity: 'Hard',
    tags: ['Bike', 'VO₂max'],
    purpose: v.purpose,
    blocks: [
      { title: 'Warm-up · 10 min', items: [it('Easy spin, build to moderate', '10 min', 'Last 2 min include 2 × 15 s spin-ups', { mode: 'bike' })] },
      { title: 'Main set', items: v.main },
      { title: 'Run off the bike', items: [run(r[0], r[1], w <= 3 ? 'Treadmill 1%, quick short steps (+5–10% cadence). Pain must stay ≤3/10.' : 'Easy, HR ≤150. Quick cadence. Feels awkward first: that is the HYROX transition.', r[2])] },
      { title: 'Cool-down', optional: true, items: [it('Easy spin + calf stretch', '5 min', '', { mode: 'bike' })] },
    ],
    timers: [v.timer],
  };
}

function wedRow(w) {
  const r = ROW[w];
  return {
    kind: r.intensity === 'Easy' ? 'z2' : 'threshold', title: r.title, duration: '55–60 min', intensity: r.intensity,
    tags: ['RowErg', 'Shin prehab'],
    purpose: r.intensity === 'Easy'
      ? 'Easy volume builds the aerobic base without any tibial load. 75–80% of your training should feel like this (pyramidal distribution, Rosenblat 2025).'
      : 'Threshold work raises the pace you can hold for 90 minutes: the intensity HYROX actually lives at (≈80% of race time above 90% HRmax, Brandt 2025).',
    blocks: [
      { title: 'Row', items: [it('HR check: 5 min at 2:35/500 m', '5 min', 'Damper 5, about 20 strokes/min, hold 2:35 on the monitor. Note your HR at the end (Progress → HR at 2:35 row). Lower over the weeks = fitter.', { bench: 'hrRow', mode: 'row', only: 'noWatts' }), ...r.items] },
      { title: 'Shin & hip prehab · 15 min', items: [
        calf('Single-leg calf raise, loaded', '3×12–15/leg', 'Straight knee, on a step, DB in the same-side hand. Full stretch at the bottom, 2 s up, 2 s down.'),
        it('Single-leg balance + reach', '3×30 s/leg', 'Foot control, arch active.', { mode: 'mobility' }),
        it('Side-lying hip abduction', '2×15/leg', 'Glute medius. Hip external rotation range is an MTSS risk factor.', { mode: 'mobility' }),
        it('Copenhagen plank', '2×20 s/side', 'Adductors for lunges and sled.', { mode: 'mobility' }),
      ] },
      { title: 'Upper · keep the muscle', items: [
        it('DB bench press (or weighted push-ups)', '3×8–12', '1–2 reps short of failure. Chest and shoulders get no other pressing in the plan; in a calorie deficit, unused muscle is the first to go.', { load: 'log kg' }),
        it('Face pulls', '3×15', 'Shoulder health for wall balls', { load: 'light' }),
      ] },
    ],
    timers: r.timer ? [r.timer] : [],
  };
}

function thuStrengthB(w) {
  const r = THU_RUN[w];
  const b = BBJ[w];
  const dl = w <= 3 ? '3×5' : w <= 8 ? '4×4' : w <= 12 ? '4×3' : '2×3';
  return {
    kind: 'strength', title: `Run + Strength B · pull, hinge, hamstrings${isDeload(w) ? ' · deload' : ''}`, duration: '85–95 min', intensity: 'Moderate',
    tags: ['Run', 'Sled pull', 'Hamstrings', 'BBJ'],
    purpose: 'Easy run while fresh, then the posterior chain and grip for the <b>sled pull (Rio: 6:42 → target 5:10)</b>, burpee broad jumps (Rio: 10:03 → target 6:45), then hamstrings and calves. Nordic curls halve hamstring injuries (van Dyk 2019).',
    blocks: [
      { title: 'Easy run', items: [run(r[0], r[1], w <= 3 ? 'Treadmill 1% or flat soft surface. Quick steps. Stop if pain >3/10.' : 'HR ≤150 (Z2). Cadence +5% on your natural rhythm.', r[2])] },
      hopsBlock(w),
      { title: 'Strength', items: [
        it('Trap-bar deadlift (or RDL)', sets(w, Number(dl[0])) + dl.slice(1), 'RPE 7–8. Hips back, lats tight.', { load: 'log kg' }),
        it('Heavy sled pull', `${sets(w, 4)}×12.5 m`, w === 3 || w === 7 ? 'Then test: 50 m at race weight for time (Progress → Sled pull).' : 'Walk-back for the first metres, then hand-over-hand from a low, flat-footed squat. Rope to the side.', { load: '103 kg + sandbag', ...(w === 3 || w === 7 ? { bench: 'pull50' } : {}) }),
        it('Strict pull-ups', `${sets(w, 4)}×max−2`, 'Goal: 10 strict.'),
        it('Farmers carry, heavy', `${sets(w, 3)}×50 m`, 'Grip and trunk. Short quick steps.', { load: '2×32 kg' }),
      ] },
      { title: 'Burpee broad jumps', items: b.items },
      { title: 'Muscle · hamstrings & calves', items: [
        it('Nordic hamstring curl', w <= 2 ? '2×4' : isDeload(w) ? '2×5' : w >= 13 ? '2×5' : w >= 9 ? '3×6' : '3×5', w <= 3 ? 'Kneel, feet held. Lower as slowly as you can, catch yourself with your hands, push back up. Expect sore hamstrings the first week; that is why it starts small.' : 'Lower slower than last week. Hands catch you at the bottom.'),
        it('Lying or seated leg curl', `${musc(w)}×10–15`, '1–2 reps short of failure. Hamstrings get only the deadlift otherwise.', { load: 'log kg' }),
        calf('Standing calf raise, loaded', `${musc(w)}×10–15`, CALF_STAND),
      ] },
      { title: 'Accessories', optional: true, items: [it('Single-arm DB row', '3×10/arm', '', { load: '30–36 kg' }), it('Dead hang', '2×max', 'Grip endurance for the pull')] },
    ],
    timers: b.timer ? [b.timer] : [],
  };
}

function friZ2(w) {
  const mins = { 1: 45, 2: 60, 3: 60, 4: 45, 5: 60, 6: 70, 7: 75, 8: 50, 9: 70, 10: 75, 11: 45, 12: 60, 13: 45 }[w];
  return {
    kind: 'z2', title: `Zone 2 bike · ${mins} min`, duration: `${mins + 15} min`, intensity: 'Easy',
    tags: ['Bike', 'Aerobic base'],
    purpose: 'Long, easy and boring on purpose. Builds mitochondria and capillaries, and lets you recover for Saturday. Easy means you could talk in full sentences the whole ride.',
    blocks: [
      { title: 'Bike', items: [
        it('HR check: 180 W for 5 min', '5 min', 'Note HR at the end (Progress → HR at 180 W). Lower over the weeks = fitter.', { bench: 'hr180', mode: 'bike', only: 'watts' }),
        it('Zone 2 ride', `${mins - 5} min`, 'HR {z2}. Nasal breathing possible. Light knob, smooth ~90 rpm (15 right-foot turns per 10 s).', { mode: 'bike' }),
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

const REST = (title = 'Rest', note = 'Sleep 8+ h. Walk 20–30 min if you like. Protein still 1.8–2.2 g/kg.') => ({
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

/* ── Weeks 14–16: Santiago, recovery, Buenos Aires ── */
const lightA = { kind: 'strength', title: 'Strength A · 2 sets, keep the load', duration: '50 min', intensity: 'Moderate', tags: ['Legs', 'Wall balls'], purpose: 'Strength maintenance: keep the weights, drop the volume (taper evidence).', blocks: [{ title: 'Strength', items: [it('Squat', '2×3', 'Same load as week 12'), it('Sled push', '2×12.5 m', '', { load: '152 kg' }), calf('Seated soleus raise', '2×15', ''), calf('Standing calf raise, loaded', '2×12', 'Same load as week 13')] }, { title: 'Wall balls', items: [it('Wall balls at race rhythm', '3×20', '10 breaths between', { load: '6 kg' })] }], timers: [] };
const WEEK14 = [
  lightA,
  { kind: 'vo2', title: 'Bike 4×3 + easy run', duration: '45 min', intensity: 'Hard', tags: ['Bike'], purpose: 'Short, sharp, done. Keeps the engine switched on before Santiago.', blocks: [{ title: 'Main', items: [it('4 × 3 min', '4×3', '{vo2w}', { mode: 'bike' })] }, { title: 'Run', items: [run('Easy run off the bike', '10 min', 'Easy', 10)] }], timers: [T.bike44(4, 180)] },
  { kind: 'z2', title: 'Row Zone 2 + prehab', duration: '45 min', intensity: 'Easy', tags: ['RowErg'], purpose: 'Easy volume.', blocks: [{ title: 'Row', items: [it('Zone 2 row', '30 min', '', { mode: 'row' })] }, { title: 'Prehab', items: [calf('Straight-knee calf raise', '2×12', '')] }], timers: [] },
  { kind: 'strength', title: 'Easy run + Strength B light', duration: '55 min', intensity: 'Moderate', tags: ['Run', 'BBJ'], purpose: 'Last loading before the rehearsal.', blocks: [{ title: 'Run', items: [run('Easy run + 4 strides', '20 min', 'Relaxed', 20)] }, { title: 'Strength', items: [it('Trap-bar deadlift', '2×3', 'Same load'), it('Sled pull', '2×12.5 m', '', { load: '103 kg' })] }, { title: 'BBJ', items: [jump('2 × 20 m BBJ', '40 m', 'Race rhythm only')] }], timers: [] },
  { kind: 'recovery', title: 'Travel · shake-out', duration: '20 min', intensity: 'Easy', tags: [], purpose: 'Legs fresh. Carbs up (6–8 g/kg). Learn the venue map.', blocks: [{ title: 'Shake-out', items: [it('Easy spin or walk', '20 min', '+ 3 × 10 s pick-ups', { mode: 'bike' })] }], timers: [] },
  { kind: 'race', title: 'HYROX Santiago · dress rehearsal', duration: '~1:30', intensity: 'Race', tags: ['🇨🇱 Santiago'], purpose: 'Race at <b>about 95%</b>: execute the Buenos Aires pacing plan, fuelling and Roxzone habits exactly. Do not empty the tank on wall balls; you need to be fresh again in 14 days.', blocks: [{ title: 'Race', items: [it('Warm-up', '20–25 min', 'Race-day protocol (Race tab)'), it('Run your BA plan at ~95%', '1:30–1:32', 'Splits from the Race tab. Gels at Run 5 and Run 7.'), it('Log your splits', 'after', 'Update targets for Buenos Aires based on what you learn.')] }], timers: [],
    variantB: { kind: 'sim', title: 'Full simulation #2 (not racing Santiago)', duration: '100 min', intensity: 'Hard', tags: ['Race-specific'], purpose: 'If you skip Santiago, this is your final full rehearsal, 14 days out.', blocks: [{ title: '8 × (1 km + station) at 95%', items: [legRun(1), SKI_SUB, legRun(2), it('Sled push 50 m', '50 m', '', { load: '152 kg' }), legRun(3), it('Sled pull 50 m', '50 m', '', { load: '103 kg' }), legRun(4), jump('BBJ 80 m', '80 m', ''), legRun(5, 'Gel 1'), it('Row 1,000 m', '1,000 m', '', { mode: 'row' }), legRun(6), it('Farmers 200 m', '200 m', '', { load: '2×24 kg' }), legRun(7, 'Gel 2'), it('Lunges 100 m', '100 m', '', { load: '20 kg' }), legRun(8), it('Wall balls 100', '100', '', { load: '6 kg' })] }], timers: [] } },
  REST('Rest · travel home'),
];
const WEEK15 = [
  { kind: 'recovery', title: 'Recovery spin + mobility', duration: '40 min', intensity: 'Easy', tags: ['Bike'], purpose: 'Two days after Santiago: flush the legs.', blocks: [{ title: 'Recovery', items: [it('Easy spin', '30 min', 'HR <135', { mode: 'bike' }), it('Mobility', '10 min', '', { mode: 'mobility' })] }], timers: [] },
  { ...lightA, title: 'Strength A · taper', blocks: [{ title: 'Strength', items: [it('Squat', '2×3', 'Same load, crisp'), it('Sled push', '2×12.5 m', '', { load: '152 kg' }), calf('Seated soleus raise', '2×12', '')] }, { title: 'Wall balls', items: [it('Wall balls', '2×20', 'Race rhythm', { load: '6 kg' })] }] },
  { kind: 'vo2', title: 'Bike 4×3 + easy run', duration: '45 min', intensity: 'Hard', tags: ['Bike'], purpose: 'Intensity stays, volume drops (Bosquet 2007 meta-analysis).', blocks: [{ title: 'Main', items: [it('4 × 3 min', '4×3', '{vo2w}', { mode: 'bike' })] }, { title: 'Run', items: [run('Easy run off the bike', '10 min', '', 10)] }], timers: [T.bike44(4, 180)] },
  { kind: 'z2', title: 'Row Zone 2 + prehab', duration: '40 min', intensity: 'Easy', tags: ['RowErg'], purpose: 'Easy.', blocks: [{ title: 'Row', items: [it('Zone 2 row', '25 min', '', { mode: 'row' })] }, { title: 'Prehab', items: [calf('Calf raises', '2×12', '')] }], timers: [] },
  { kind: 'run', title: 'Easy run + race rhythm', duration: '45 min', intensity: 'Moderate', tags: ['Run', 'BBJ'], purpose: 'Keep the movements sharp.', blocks: [{ title: 'Run', items: [run('Easy run', '25 min', 'HR ≤150', 25)] }, { title: 'Rhythm', items: [jump('2 × 20 m BBJ', '40 m', 'Race rhythm'), it('Wall balls', '2×20', '', { load: '6 kg' })] }], timers: [] },
  { kind: 'sim', title: 'Race-pace touches', duration: '50 min', intensity: 'Moderate', tags: ['Race-specific'], purpose: 'Last session with any intensity, 7 days out.', blocks: [{ title: '4 rounds, 2 min rest', items: [legRun('a', 'Race pace 5:30'), it('Short station', '1 min', 'Sled push 12.5 m / pull 12.5 m / 20 WB / 10 BBJ (rotate)', { mode: 'station' })] }], timers: [] },
  REST(),
];
const WEEK16 = [
  { kind: 'recovery', title: 'Easy spin + wall-ball rhythm', duration: '35 min', intensity: 'Easy', tags: ['Bike'], purpose: 'Race week. Nothing to gain, everything to lose: stay fresh.', blocks: [{ title: 'Session', items: [it('Easy spin', '20 min', '', { mode: 'bike' }), it('Wall balls', '3×10', 'Crisp', { load: '6 kg' })] }], timers: [] },
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
  return [monStrengthA(w), tueVO2(w), wedRow(w), thuStrengthB(w), friZ2(w), satSession(w), REST()];
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
  let runMin = 0, engineMin = 0, hard = 0, strength = 0, jumps = 0;
  WEEKS[w].days.forEach(s => {
    if (HARD.has(s.kind) || s.kind === 'threshold') hard++;
    if (s.kind === 'strength') strength++;
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
  return { runMin, engineMin: Math.round(engineMin), hard, strength, jumps };
}

export const DOW_NAMES = DOW;
