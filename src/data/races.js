/* Target races + split targets. Sources: research/01-races-benchmarks-targets.md */

export const RACES = {
  ba27: {
    id: 'ba27', city: 'Buenos Aires', flag: '🇦🇷', name: 'HYROX Buenos Aires 2027',
    date: '2027-03-20', dateLabel: '20–21 Mar 2027',
    venue: 'La Rural, Av. Sarmiento 2704, Palermo',
    role: 'A race · goal sub-1:30',
    status: 'Tickets not on sale yet (waitlist open). Open Men day (Sat 20 or Sun 21) not published; start times come about 3 days before.',
    url: 'https://hyrox.com/event/hyrox-buenos-aires/',
  },
  scl27: {
    id: 'scl27', city: 'Santiago', flag: '🇨🇱', name: 'HYROX Santiago 2027',
    date: '2027-03-06', dateLabel: '6 Mar 2027',
    venue: 'Venue TBA',
    role: 'Dress rehearsal · race at ~95% effort',
    status: 'First Chile edition. Tickets not on sale yet. Two weeks before Buenos Aires, so the plan treats it as the final race-pace simulation.',
    url: 'https://hyrox.com/event/hyrox-santiago/',
  },
};

/* Target splits for ≈1:29 — blended from the two research tables with a
   bias toward station gains (shins limit how much run speed we can buy).
   median = Open Men median from roxpace.app (≈1:27 finisher) for context. */
export const TARGETS = {
  r1: { t: '5:05', median: '4:35', cue: '"Too easy." Conversational-hard. Do not chase the crowd.' },
  ski: { t: '4:20', median: '4:31', cue: 'Long strokes, hold the split. Already a strength: no heroics.' },
  r2: { t: '5:30', cue: 'Smooth. Settle breathing before the sleds.' },
  push: { t: '3:55', median: '3:04', cue: 'Low body line, short powerful steps, never stop mid-length.' },
  r3: { t: '5:30', cue: 'First 200 m easy to let the legs come back, then settle.' },
  pull: { t: '5:10', median: '5:00', cue: 'Hips first. Walk-back early, hand-over-hand to finish. Rope to the side.' },
  r4: { t: '5:45', cue: 'Arms relaxed after the pull. Shuffle 200 m, then race pace.' },
  bbj: { t: '6:45', median: '5:30', cue: 'Step down, step up, jump ~2 m. Breathe after landing. ~10 reps per 20 m.' },
  r5: { t: '5:35', cue: 'Gel 1 here once HR settles. Halfway: run your race, not theirs.' },
  row: { t: '4:35', median: '4:51', cue: 'Reset. Legs-hips-arms, 26–28 spm, hold the split.' },
  r6: { t: '5:15', cue: 'Best legs of the second half: hold form.' },
  farm: { t: '1:42', median: '2:10', cue: 'Short quick steps, no set-downs. Already a strength.' },
  r7: { t: '5:20', cue: 'Gel 2 or a carb sip so fuel arrives before lunges, Run 8 and wall balls.' },
  lunge: { t: '5:35', median: '5:16', cue: 'Upright, steady rhythm, no rest at 50 m. Don\'t race it.' },
  r8: { t: '6:05', median: '5:54', cue: '200 m shuffle, then 80% effort. This is where Rio broke (8:19).' },
  wb: { t: '6:30', median: '6:57', cue: 'Sets of 20, 10 breaths of rest, ball never down. Throw only as high as needed.' },
  rox: { t: '6:30', median: '7:24', cue: '"Floor is lava." Jog every transition, sip don\'t stop, gloves sorted before the station.' },
};

export const RACE_WEEK = [
  { t: '-7 d', what: '<b>Last real training.</b> Short race-pace pieces only. Hardest session was at least 7 days ago.' },
  { t: '-3 d', what: '<b>Start times published</b> (about 3 days out). Download the venue map and learn the Roxzone flow.' },
  { t: '-2 d', what: '<b>Carb load begins:</b> 6–8 g/kg/day (≈580–780 g). Low fibre. Salty dinner. Sleep 8+ h.' },
  { t: '-1 d', what: '<b>Rest or a 15 min shake-out.</b> Lay out kit: shoes tested on a sled, gloves you trained with, 2 gels, caffeine.' },
  { t: '-3 h', what: '<b>Breakfast</b> ≈2 g/kg carbs (≈190 g): rice or oats, banana, honey, white bread. 500–650 mL fluid with sodium.' },
  { t: '-60 min', what: '<b>Caffeine</b> ≈290 mg (3 mg/kg), only if rehearsed in a simulation.' },
  { t: '-45 min', what: '<b>Warm-up</b> 20–25 min: 8–10 min easy bike or jog, dynamic mobility, glute and calf activation, 3 strides, 5 crisp wall balls.' },
  { t: '-15 min', what: '<b>Gel or banana.</b> Into the start tunnel on time (lingering is a 1-minute penalty).' },
  { t: 'Run 5', what: '<b>Gel 1</b> (25–30 g) once HR settles after the burpees.' },
  { t: 'Run 7', what: '<b>Gel 2 or carb sip</b>, so carbs land before lunges, Run 8 and wall balls.' },
];

export const RULES_2627 = [
  'Not completing any station in full is a disqualification (new for 2026/27).',
  'Sandbag drop: 15 s penalty per drop, no warnings.',
  'BBJ: chest to floor, two-foot take-off and landing (up to 5 cm stagger allowed), hands ≤30 cm in front of the toes, no shuffle steps. Stepping down and up is legal. Warning, then +15 s each.',
  'Wall balls: 6 kg, 3.00 m target, hips below the knee every rep. If the ball drops, stand tall before the next squat.',
  'Sled push: face the direction of travel. Sled pull: don\'t step on the front line of the box.',
  'Event chalk only, and you cannot carry it between stations (2-minute penalty). Gloves are fine if you wear or carry them start to finish.',
  'Shoes on for the whole race, except they may come off at wall balls (carry them across the finish).',
  'Spitting or clearing your nose on the carpet: 2-minute penalty.',
];
