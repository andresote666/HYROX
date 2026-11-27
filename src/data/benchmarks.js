import { store } from '../store.js';
/* Benchmarks. lowerBetter: times / HR. target: absolute goal (seconds or number)
   or goalPct relative to the first logged value. Test weeks are built into the plan. */

export const BENCHMARKS = [
  {
    id: 'bike5', requires: 'watts', why: 'Your engine. Sets the watts for every bike interval.', name: 'Bike 5-min max', unit: 'watts', unitLabel: 'Average watts', lowerBetter: false, goalPct: 8,
    group: 'Engine', weeks: 'Weeks 1, 8, 12',
    how: 'After a 15 min warm-up with 3 short surges, ride 5 minutes as hard as you can hold evenly. Record the average watts. Your VO₂max interval power is 85–95% of this number.',
  },
  {
    id: 'row2k', why: 'Rowing fitness. Sets your rowing interval splits.', name: 'Row 2,000 m', unit: 'time', lowerBetter: true, goalPct: 4,
    group: 'Engine', weeks: 'Weeks 1, 8, 12',
    how: 'Damper 5–6, full warm-up. Hold an even split and empty the tank in the last 300 m. Your 4×4 rowing pace is this split + 3–6 s per 500 m.',
  },
  {
    id: 'hr180', requires: 'watts', why: 'Aerobic fitness: same effort, lower heart rate = fitter.', name: 'HR at 180 W (5 min)', unit: 'bpm', unitLabel: 'Heart rate at the end (bpm)', lowerBetter: true, goalPct: 5,
    group: 'Engine', weeks: 'Every Friday',
    how: 'At the start of the Friday Zone 2 ride, hold exactly 180 W for 5 minutes and note your heart rate at the end. A falling number means your aerobic engine is improving (Buchheit 2014).',
  },
  {
    id: 'hrRow', requires: 'noWatts', why: 'Aerobic fitness: same pace, lower heart rate = fitter.', name: 'HR at 2:35 row (5 min)', unit: 'bpm', unitLabel: 'Heart rate at the end (bpm)', lowerBetter: true, goalPct: 5,
    group: 'Engine', weeks: 'Every Wednesday',
    how: 'At the start of Wednesday\'s row: damper 5, about 20 strokes per minute, hold 2:35/500 m on the monitor for 5 minutes. Note your heart rate at the end (watch or chest strap). Same pace with a lower heart rate over the weeks = a stronger engine (Buchheit 2014).',
  },
  {
    id: 'wb100', why: 'Wall-ball speed when fresh (Rio: 9:04 in the race).', name: '100 wall balls (fresh)', unit: 'time', lowerBetter: true, target: 270,
    group: 'Stations', weeks: 'Weeks 1 and 13',
    how: '6 kg ball, 3 m target, hips below knees. Use your race set plan (20s with 10 breaths of rest, ball held). Target under 4:30, which projects to 5:30–6:00 at the end of the race.',
  },
  {
    id: 'karen', why: 'Wall-ball endurance.', name: 'Karen: 150 wall balls', unit: 'time', lowerBetter: true, target: 465,
    group: 'Stations', weeks: 'Weeks 9 and 12',
    how: '150 wall balls for time. Target under 8:30 in week 9 and under 7:45 in week 12.',
  },
  {
    id: 'bbj20', why: 'How far you travel per burpee jump.', name: 'BBJ reps for 20 m', unit: 'reps', unitLabel: 'Reps to cover 20 m', lowerBetter: true, target: 10,
    group: 'Stations', weeks: 'Weeks 1, 5, 9',
    how: 'At race rhythm (not max jumps), count the reps to cover 20 m. Multiply by 4 for your race rep count. At 193 cm, about 10 reps (≈2 m per jump) is the sweet spot.',
  },
  {
    id: 'bbj80', why: 'Full burpee broad jump station (Rio: 10:03 in the race).', name: '80 m BBJ (fresh)', unit: 'time', lowerBetter: true, target: 345,
    group: 'Stations', weeks: 'Weeks 10 and 13 (only when green)',
    how: 'Step down, step up, jump about 2 m, 2–3 breaths after landing. Under 5:45 fresh projects to about 6:30–6:45 in the race.',
  },
  {
    id: 'pull50', why: 'Full sled pull station (Rio: 6:42).', name: 'Sled pull 50 m (race weight)', unit: 'time', lowerBetter: true, target: 300,
    group: 'Stations', weeks: 'Weeks 3 and 7, then the week 11 simulation',
    how: '103 kg total including the sled (add 10–15% on a slick gym floor). Hip-driven walk-back for the first metres, rope thrown to the side, never let the rope go slack.',
  },
  {
    id: 'push50', why: 'Full sled push station (Rio: 5:03).', name: 'Sled push 50 m (race weight)', unit: 'time', lowerBetter: true, target: 240,
    group: 'Stations', weeks: 'Weeks 3 and 7, then the week 11 simulation',
    how: '152 kg total including the sled. Low body line, short powerful steps, never stop mid-length.',
  },
  {
    id: 'calfL', why: 'Calf and soleus endurance: protects the shins.', name: 'Single-leg heel raise, left', unit: 'reps', unitLabel: 'Reps to fatigue', lowerBetter: false, target: 30,
    group: 'Shin capacity', weeks: 'Every Tuesday',
    how: 'Barefoot on the edge of a step, fingertips on the wall for balance. Full range, 1 rep every 2 s, until you can\'t reach full height. Shin-splint athletes average about 23, healthy runners about 33 (Madeley 2007). Goal: 30 per side, less than 10% difference between legs.',
  },
  {
    id: 'calfR', why: 'Calf and soleus endurance: protects the shins.', name: 'Single-leg heel raise, right', unit: 'reps', unitLabel: 'Reps to fatigue', lowerBetter: false, target: 30,
    group: 'Shin capacity', weeks: 'Every Tuesday',
    how: 'Same protocol as the left leg. Test the weaker side first next time.',
  },
  {
    id: 'sq1rm', why: 'Leg strength for sleds, lunges and wall balls.', name: 'Back squat · estimated max', unit: 'e1rm', unitLabel: 'Heaviest set: weight x reps', lowerBetter: false, goalPct: 5,
    group: 'Strength', weeks: 'Any Tuesday: your heaviest work set',
    how: 'Type your heaviest work set as weight x reps, for example 100 x 5. Only sets with 2+ reps left (RPE 8 or less). The app turns it into an estimated 1-rep max (Epley formula), so 3×5, 4×4 and 4×3 weeks compare fairly. Goal: +5% by March while losing weight.',
  },
  {
    id: 'dl1rm', why: 'Posterior chain for the sled pull and the hinge in every station.', name: 'Trap-bar deadlift · estimated max', unit: 'e1rm', unitLabel: 'Heaviest set: weight x reps', lowerBetter: false, goalPct: 5,
    group: 'Strength', weeks: 'Any Thursday: your heaviest work set',
    how: 'Same as the squat: heaviest work set as weight x reps (RPE 8 or less). Estimated 1-rep max, so different rep schemes compare fairly.',
  },
  {
    id: 'bp1rm', why: 'Upper-body strength: the muscle you keep while you diet.', name: 'Bench press · estimated max', unit: 'e1rm', unitLabel: 'Heaviest set: weight x reps', lowerBetter: false, goalPct: 5,
    group: 'Strength', weeks: 'Any Monday: your heaviest work set',
    how: 'Heaviest work set as weight x reps (RPE 8 or less), for example 90 x 6. Holding or raising this while the scale drops means you are keeping muscle.',
  },
  {
    id: 'pullups', why: 'Relative pulling strength: rises as you get stronger and lighter.', name: 'Strict pull-ups, max reps', unit: 'reps', unitLabel: 'Strict reps', lowerBetter: false, goalPct: 20,
    group: 'Strength', weeks: 'Weeks 1, 8, 12 (Monday)',
    how: 'Dead hang, chin over the bar, full lockout at the bottom, no kipping. First set of Upper A in the test weeks, before the weighted sets.',
  },
  {
    id: 'run1k', why: 'Running speed, only once the shins allow it.', name: '1 km run time trial', unit: 'time', lowerBetter: true, goalPct: 5,
    group: 'Running', weeks: 'Optional, any green day in weeks 9–13',
    how: 'Treadmill at 1% or a flat track, after a 15 min warm-up. Only on a green day. Your HYROX run pace sits about 50–70 s/km slower than this.',
  },
];

export const activeBenchmarks = () => BENCHMARKS.filter(b => !b.requires || (b.requires === 'watts') === !!store.profile.bikeWatts);

export function benchTarget(b, first) {
  if (b.target !== undefined) return b.target;
  if (first === undefined) return null;
  const f = b.goalPct / 100;
  return b.lowerBetter ? first * (1 - f) : first * (1 + f);
}
