/* ═══════════════════════════════════════════════════════════
   HYROX PREP — Training Data
   All 10 weeks of programming
   ═══════════════════════════════════════════════════════════ */

export const RACE_DATE = new Date('2026-06-13T09:00:00-03:00');

export const ATHLETE = {
  name: 'Andrés',
  age: 34, height: 193, weight: 94,
  bodyFat: 10.7, muscleMass: 47.5, inbodyScore: 92,
  bmr: 2152,
  tenK: '6:00/km',
  bench: '80kg', squat: '34kg goblet', deadlift: '2x34kg DB', ohp: '34kg/hand',
  goal: 'Sub 1:30 – 1:40',
  division: 'Open Singles',
  race: 'HYROX Buenos Aires',
};

export const PHASES = [
  { id: 1, name: 'Foundation', weeks: [1,2,3], color: '#22C55E', description: 'Build aerobic base, learn stations, protect IT band.' },
  { id: 2, name: 'Build & Integration', weeks: [4,5,6,7], color: '#FF6B35', description: 'Compromised running, station stacking, full simulations.' },
  { id: 3, name: 'Peak & Taper', weeks: [8,9,10], color: '#FF3A2F', description: 'Race simulation, sharpening, taper for race day.' },
];

export const STATIONS = [
  { num: 1, name: 'SkiErg', distance: '1,000m', weight: '—', targetTime: '4:15', tips: ['Pace at 2:00/500m — don\'t exceed 1:50', 'Arms + hips, use your lats for power', 'Med ball slams + cable pulldowns as alternatives'], icon: '⛷️' },
  { num: 2, name: 'Sled Push', distance: '50m', weight: '152kg', targetTime: '4:30', tips: ['Low body angle, 45° lean into the sled', 'Short explosive pushes, 5-10s planned rests', 'Treadmill push (off) is the best gym alternative'], icon: '🛷' },
  { num: 3, name: 'Sled Pull', distance: '50m', weight: '103kg', targetTime: '3:30', tips: ['Hand-over-hand on rope, stay low, use hips', 'Grip management: chalk your hands', 'Cable rope pulls mimic this in the gym'], icon: '🪢' },
  { num: 4, name: 'Burpee Broad Jump', distance: '80m', weight: '—', targetTime: '6:00', tips: ['STEP UP from burpee (more efficient)', 'Consistent ~1.5m jumps, don\'t go all-out', 'Break into 4x20m mental chunks'], icon: '🐸' },
  { num: 5, name: 'RowErg', distance: '1,000m', weight: '—', targetTime: '4:00', tips: ['Pace at 1:55/500m', 'Power from legs, smooth catch', 'You have this in your gym — practice weekly'], icon: '🚣' },
  { num: 6, name: 'Farmers Carry', distance: '200m', weight: '2x24kg', targetTime: '3:00', tips: ['Even pace, don\'t rush', 'If grip fails, set down, shake 5s, go', 'Practice with dumbbells at the gym'], icon: '🏋️' },
  { num: 7, name: 'Sandbag Lunges', distance: '100m', weight: '20kg', targetTime: '5:00', tips: ['Controlled stride, hug bag to chest', 'Steady rhythm wins — don\'t rush', 'Practice with a DB held at chest'], icon: '🎒' },
  { num: 8, name: 'Wall Balls', distance: '100 reps', weight: '6kg', targetTime: '6:00', tips: ['Break them: 20-20-20-20-20', 'Catch ball low, use downward momentum', 'Leg drive for throw — save your shoulders', 'NEVER miss a rep (no-reps cost energy)'], icon: '🏀' },
];

export const RACE_PACING = [
  { type: 'run', label: 'Run 1 — Start', pace: '5:00-5:15/km', note: 'Controlled start, DO NOT sprint' },
  { type: 'station', label: 'SkiErg — 1,000m', pace: '~4:15', note: 'Steady 2:00/500m' },
  { type: 'run', label: 'Run 2', pace: '5:15/km', note: 'Settle in, find rhythm' },
  { type: 'station', label: 'Sled Push — 50m', pace: '~4:30', note: 'Low angle, planned rests' },
  { type: 'run', label: 'Run 3', pace: '5:30/km', note: 'Legs HEAVY — this is normal' },
  { type: 'station', label: 'Sled Pull — 50m', pace: '~3:30', note: 'Hand-over-hand, manage grip' },
  { type: 'run', label: 'Run 4', pace: '5:30/km', note: 'Arms tired, focus on turnover' },
  { type: 'station', label: 'Burpee Broad Jump — 80m', pace: '~6:00', note: 'Step-up technique, 4x20m chunks' },
  { type: 'run', label: 'Run 5 — HALFWAY', pace: '5:30/km', note: '🔥 Mental boost!' },
  { type: 'station', label: 'RowErg — 1,000m', pace: '~4:00', note: 'Push the pace slightly' },
  { type: 'run', label: 'Run 6', pace: '5:30-5:45/km', note: 'Steady' },
  { type: 'station', label: 'Farmers Carry — 200m', pace: '~3:00', note: 'Minimal breaks' },
  { type: 'run', label: 'Run 7', pace: '5:45/km', note: 'Grip and core fatigued' },
  { type: 'station', label: 'Sandbag Lunges — 100m', pace: '~5:00', note: 'Steady stride' },
  { type: 'run', label: 'Run 8', pace: '5:45/km', note: 'Dig deep, almost there' },
  { type: 'station', label: 'Wall Balls — 100 reps', pace: '~6:00', note: 'Sets of 20, leg drive' },
  { type: 'run', label: 'FINAL RUN → FINISH 🏁', pace: '5:00/km', note: 'EMPTY THE TANK' },
];

// ── WEEK SCHEDULES ──
const P1_MON = {
  day: 'Monday', type: 'Lower Strength-Endurance + Core', duration: '90 min',
  dotClass: 'strength', intensity: 'High',
  blocks: [
    { title: 'Warm-Up · 10 min', exercises: [
      { name: 'Easy Bike or Row', detail: '5 minutes', sets: '' },
      { name: 'Lateral Band Walks', detail: 'IT band rehab', sets: '2×15/side' },
      { name: 'Glute Bridges', detail: 'Activation', sets: '2×15' },
      { name: 'Bodyweight Squats', detail: 'Warm up', sets: '2×10' },
    ]},
    { title: 'Block A: Lower Body · 35 min', exercises: [
      { name: 'Goblet Squat', detail: '34kg DB — 3-1-1 tempo', sets: '4×12', weight: '34kg' },
      { name: 'Romanian Deadlift (DB)', detail: 'Hip hinge, hamstrings', sets: '4×12', weight: '2×34kg' },
      { name: 'Walking Lunges (DB)', detail: 'Mimic sandbag lunge', sets: '3×20 steps', weight: '2×20kg' },
      { name: 'Leg Press', detail: 'Endurance reps', sets: '3×15', weight: 'Moderate' },
      { name: 'Calf Raises', detail: 'Running prep', sets: '3×15', weight: 'BW+' },
    ]},
    { title: 'Block B: Core & Glute Medius · 20 min', exercises: [
      { name: 'Side-lying Clamshells', detail: 'IT band rehab: glute medius', sets: '3×15/side' },
      { name: 'Copenhagen Side Plank', detail: 'Adductor + hip stability', sets: '3×20s/side' },
      { name: 'Dead Bug', detail: 'Core stability', sets: '3×10/side' },
      { name: 'Pallof Press (Cable)', detail: 'Anti-rotation', sets: '3×12/side' },
      { name: 'Single-Leg Glute Bridge', detail: 'Address leg imbalance', sets: '3×12/side' },
    ]},
  ]
};

const P1_TUE = {
  day: 'Tuesday', type: 'Running: Easy + Intervals', duration: '60-75 min',
  dotClass: 'running', intensity: 'High',
  blocks: [
    { title: 'Warm-Up · 10 min', exercises: [
      { name: 'Easy Jog', detail: 'Z1 pace 6:30-7:00/km', sets: '10 min' },
      { name: 'Dynamic Stretches', detail: 'Leg swings, A-skips, high knees', sets: '' },
    ]},
    { title: 'Main Session · 40 min', exercises: [
      { name: 'Steady Z2 Run', detail: '@ 6:00-6:15/km', sets: '30 min' },
      { name: '100m Strides', detail: '90% effort, walk-back recovery', sets: '4 reps' },
    ]},
  ]
};

const P1_WED = {
  day: 'Wednesday', type: 'Active Recovery / Mobility', duration: '45-60 min',
  dotClass: 'recovery', intensity: 'Low',
  blocks: [
    { title: 'Recovery Session', exercises: [
      { name: 'Easy Bike or Walk', detail: 'Light movement', sets: '20 min' },
      { name: 'Full-Body Mobility Flow', detail: 'Hips, thoracic, ankles', sets: '15 min' },
      { name: 'Foam Rolling', detail: 'Quads, hams, calves, glutes (NOT IT band)', sets: '10 min' },
      { name: 'IT Band Specific Work', detail: 'Hip flexor stretch, TFL release, band walks', sets: '10 min' },
    ]},
  ]
};

const P1_THU = {
  day: 'Thursday', type: 'Hybrid Conditioning: Stations + Run', duration: '90 min',
  dotClass: 'hybrid', intensity: 'High',
  blocks: [
    { title: 'Warm-Up · 10 min', exercises: [
      { name: 'Row 500m Easy', detail: 'Get the engine running', sets: '' },
      { name: 'Dynamic Stretches', detail: 'Full body', sets: '' },
    ]},
    { title: 'Station Circuit · 4 Rounds (60 min)', exercises: [
      { name: 'Rowing Machine', detail: 'Moderate effort, find rhythm', sets: '500m' },
      { name: 'Farmer\'s Carry (DBs)', detail: '2×24kg dumbbells', sets: '100m', weight: '2×24kg' },
      { name: 'Walking Lunges', detail: 'BW or 10kg DB like sandbag', sets: '50m' },
      { name: 'Wall Balls / MB Thrusters', detail: '6kg med ball, hit target', sets: '20 reps', weight: '6kg' },
      { name: '⚡ COMPROMISED RUN', detail: 'Immediately after last station!', sets: '400m' },
    ]},
  ]
};

const P1_FRI = {
  day: 'Friday', type: 'Upper Body + Plyometrics', duration: '90 min',
  dotClass: 'upper', intensity: 'Moderate-High',
  blocks: [
    { title: 'Plyometrics (FIRST — Fresh) · 15 min', exercises: [
      { name: 'Pogo Hops', detail: 'Ankle stiffness, minimal ground time', sets: '3×10' },
      { name: 'Box Step-Up + Jump Down', detail: '30cm box, controlled', sets: '3×6/leg' },
      { name: 'Squat Jumps (reset)', detail: 'Full reset, explosive drive', sets: '3×5' },
      { name: 'Medicine Ball Slams', detail: '6-8kg, explosive — SkiErg alt', sets: '3×8', weight: '6-8kg' },
    ]},
    { title: 'Upper Body · 40 min', exercises: [
      { name: 'Bench Press', detail: '~75% effort', sets: '4×10', weight: '60kg' },
      { name: 'DB Overhead Press', detail: 'Seated or standing', sets: '3×12', weight: '24kg/hand' },
      { name: 'Barbell Row', detail: 'Back endurance', sets: '4×12', weight: '50-60kg' },
      { name: 'Cable Straight-Arm Pulldown', detail: 'SkiErg mechanics', sets: '3×15', weight: 'Moderate' },
      { name: 'Pull-Ups', detail: 'Bodyweight', sets: '3×8-10' },
      { name: 'Face Pulls', detail: 'Shoulder health', sets: '3×15', weight: 'Light' },
    ]},
    { title: 'Accessory + Core · 15 min', exercises: [
      { name: 'Hanging Leg Raises', detail: 'Core strength', sets: '3×10' },
      { name: 'Cable Crunches', detail: 'Loaded abs', sets: '3×15' },
      { name: 'Farmer\'s Hold (static)', detail: 'Grip endurance', sets: '3×30s', weight: '2×32kg' },
    ]},
  ]
};

const P1_SAT = {
  day: 'Saturday', type: 'REST DAY', duration: '—',
  dotClass: 'rest', intensity: 'Rest',
  blocks: [
    { title: 'Full Recovery', exercises: [
      { name: 'Sleep 8+ Hours', detail: 'Non-negotiable', sets: '' },
      { name: 'Light Walk (optional)', detail: '20-30 min gentle movement', sets: '' },
      { name: 'Hydration', detail: '3-4L water minimum', sets: '' },
    ]},
  ]
};

const P1_SUN = {
  day: 'Sunday', type: 'Long Run + Station Practice', duration: '90 min',
  dotClass: 'long-run', intensity: 'Moderate',
  blocks: [
    { title: 'Long Run', exercises: [
      { name: 'Zone 2 Run', detail: '@ 6:00-6:15/km', sets: '8K→10K' },
    ]},
    { title: 'Post-Run Station Work (Compromised!)', exercises: [
      { name: 'Wall Balls', detail: '60s rest between sets', sets: '3×30 reps', weight: '6kg' },
      { name: 'Burpee Broad Jumps', detail: 'Practice technique tired', sets: '30m' },
    ]},
  ]
};

// Phase 2 adjustments
const P2_MON = {
  day: 'Monday', type: 'Lower Body Power + Endurance', duration: '90 min',
  dotClass: 'strength', intensity: 'High',
  blocks: [
    { title: 'Plyometrics · 15 min', exercises: [
      { name: 'Box Jumps (45cm)', detail: 'Step down after landing', sets: '4×5' },
      { name: 'Squat Jump to Box', detail: 'Explosive upward drive', sets: '3×6' },
      { name: 'Lateral Bounds', detail: 'Build lateral stability', sets: '3×6/side' },
      { name: 'Depth Drop (30cm)', detail: 'Land and HOLD — teach absorption', sets: '3×4' },
    ]},
    { title: 'Lower Body · 40 min', exercises: [
      { name: 'Barbell Back Squat', detail: 'Progressed from goblet', sets: '4×10', weight: '60-70kg' },
      { name: 'Single-Leg RDL (DB)', detail: 'Balance + posterior chain', sets: '3×12/leg', weight: '24kg' },
      { name: 'Walking Lunges (weighted)', detail: 'Build sandbag lunge capacity', sets: '4×20 steps', weight: '20kg' },
      { name: 'Leg Extension', detail: 'Quad endurance', sets: '3×15', weight: 'Moderate' },
      { name: 'Nordic Hamstring Curl', detail: 'Eccentric — tendon health', sets: '3×5', weight: 'BW' },
    ]},
    { title: 'Core + IT Rehab · 20 min', exercises: [
      { name: 'Single-Leg Squat to Box', detail: 'Balance and control', sets: '3×8/leg' },
      { name: 'Monster Walks (band)', detail: 'Glute medius', sets: '3×15/dir' },
      { name: 'Turkish Get-Up (light)', detail: 'Full body stability', sets: '2×3/side' },
    ]},
  ]
};

const P2_TUE = {
  day: 'Tuesday', type: 'Running: Threshold + Speed', duration: '75 min',
  dotClass: 'running', intensity: 'High',
  blocks: [
    { title: 'Main Session', exercises: [
      { name: 'Z2 Warm-Up', detail: 'Easy conversational pace', sets: '10 min' },
      { name: '800m Repeats', detail: '@ 4:45/km pace, 90s jog recovery', sets: '5 reps' },
      { name: 'Z2 Recovery', detail: 'Easy jog', sets: '5 min' },
      { name: '200m Sprints', detail: '@ 90% effort, walk-back recovery', sets: '4 reps' },
      { name: 'Z2 Cool-Down', detail: 'Easy pace', sets: '10 min' },
    ]},
  ]
};

const P2_THU = {
  day: 'Thursday', type: '⚡ Compromised Running Megablock', duration: '90 min',
  dotClass: 'hybrid', intensity: 'Very High',
  blocks: [
    { title: 'Half-Race Simulation', exercises: [
      { name: '1km Run', detail: '@ 5:30/km', sets: 'Run 1' },
      { name: 'Row 500m', detail: 'Hard effort', sets: 'Station' },
      { name: '1km Run (COMPROMISED)', detail: '@ 5:30-5:45/km — legs heavy!', sets: 'Run 2' },
      { name: 'Farmer\'s Carry 200m', detail: '2×24kg', sets: 'Station', weight: '2×24kg' },
      { name: '1km Run (COMPROMISED)', detail: '@ 5:45-6:00/km', sets: 'Run 3' },
      { name: 'Walking Lunges 50m', detail: '20kg sandbag/DB', sets: 'Station', weight: '20kg' },
      { name: '1km Run', detail: '@ ~6:00/km', sets: 'Run 4' },
      { name: 'Wall Balls 50 reps', detail: '6kg → target', sets: 'Station', weight: '6kg' },
      { name: '1km Run — FINISH STRONG', detail: 'Control the pace', sets: 'Run 5' },
    ]},
  ]
};

const P2_FRI = {
  day: 'Friday', type: 'Upper Body Endurance + Plyo', duration: '90 min',
  dotClass: 'upper', intensity: 'Moderate-High',
  blocks: [
    { title: 'Plyometrics · 15 min', exercises: [
      { name: 'Medicine Ball Slams', detail: 'SkiErg simulation', sets: '4×10' },
      { name: 'Standing Broad Jumps', detail: 'BBJ practice', sets: '3×6' },
      { name: 'Burpee to Broad Jump', detail: 'Full technique work', sets: '3×5' },
    ]},
    { title: 'Upper Body Endurance · 40 min', exercises: [
      { name: 'Bench Press', detail: 'Higher reps', sets: '3×12-15', weight: '55kg' },
      { name: 'Cable Row', detail: 'Back endurance', sets: '4×15', weight: 'Moderate' },
      { name: 'DB Overhead Press', detail: 'Seated', sets: '3×15', weight: '20kg/hand' },
      { name: 'Lat Pulldown', detail: 'Pull strength', sets: '3×15', weight: 'Moderate' },
      { name: 'Cable Straight-Arm Pulldown', detail: 'SkiErg mechanics', sets: '4×20', weight: 'Light-Mod' },
      { name: 'Resistance Band Ski Pull', detail: 'Band from high anchor', sets: '3×20' },
    ]},
    { title: 'Grip + Core · 15 min', exercises: [
      { name: 'Plate Pinch Hold', detail: 'Grip endurance', sets: '3×30s' },
      { name: 'Hanging from Bar', detail: 'Dead hang', sets: '3×30s' },
      { name: 'Ab Wheel Rollouts', detail: 'Core strength', sets: '3×10' },
      { name: 'Pallof Press', detail: 'Anti-rotation', sets: '3×12/side' },
    ]},
  ]
};

const P2_SUN = {
  day: 'Sunday', type: 'Long Run + Station Stacking', duration: '90-100 min',
  dotClass: 'long-run', intensity: 'Moderate',
  blocks: [
    { title: 'Long Run', exercises: [
      { name: 'Zone 2 Run', detail: '@ 5:45-6:00/km', sets: '10K→12K' },
    ]},
    { title: 'Immediately After (Compromised!)', exercises: [
      { name: 'Wall Balls', detail: 'Sets of 25', sets: '100 reps', weight: '6kg' },
      { name: 'Burpee Broad Jumps', detail: 'Full race distance week 7!', sets: '40→80m' },
      { name: 'Farmer\'s Carry', detail: 'Even pace', sets: '200m', weight: '2×24kg' },
    ]},
  ]
};

// Phase 3
const P3_MON = {
  day: 'Monday', type: 'Light Lower Body + Core', duration: '60 min',
  dotClass: 'strength', intensity: 'Moderate',
  blocks: [
    { title: 'Maintenance Strength', exercises: [
      { name: 'Barbell Back Squat', detail: 'Reduced — maintain don\'t build', sets: '3×8', weight: '60%' },
      { name: 'Single-Leg RDL', detail: 'Light, controlled', sets: '3×10/leg', weight: '20kg' },
      { name: 'Walking Lunges', detail: 'Bodyweight or light', sets: '2×20 steps' },
      { name: 'Core Circuit', detail: 'Dead bug + Pallof + plank', sets: '3 rounds' },
      { name: 'Glute Medius Work', detail: 'Band walks + clamshells', sets: '2×15/side' },
    ]},
  ]
};

const P3_TUE = {
  day: 'Tuesday', type: 'Running: Race Pace Sharpening', duration: '60 min',
  dotClass: 'running', intensity: 'Moderate-High',
  blocks: [
    { title: 'Sharpening Session', exercises: [
      { name: 'Z2 Warm-Up', detail: 'Easy', sets: '10 min' },
      { name: '400m Repeats @ Race Pace', detail: '@ 5:00-5:15/km', sets: '6 reps' },
      { name: 'Z2 Cool-Down', detail: 'Easy', sets: '10 min' },
    ]},
  ]
};

const P3_THU = {
  day: 'Thursday', type: '🏁 Half-Race Simulation', duration: '60-75 min',
  dotClass: 'hybrid', intensity: 'High',
  blocks: [
    { title: 'Reduced Race Sim (4 stations + 4 runs)', exercises: [
      { name: '1km Run', detail: 'Race pace', sets: '' },
      { name: 'Row 1,000m', detail: 'Race effort', sets: '' },
      { name: '1km Run (compromised)', detail: 'Target pace', sets: '' },
      { name: 'Farmer\'s Carry 200m', detail: '2×24kg', sets: '', weight: '2×24kg' },
      { name: '1km Run (compromised)', detail: 'Steady', sets: '' },
      { name: 'Wall Balls 100 reps', detail: 'Full set, race strategy', sets: '', weight: '6kg' },
      { name: '1km Run — FINISH', detail: 'Leave it all', sets: '' },
    ]},
  ]
};

const P3_SUN = {
  day: 'Sunday', type: 'Easy Z2 Run + Light Station', duration: '60 min',
  dotClass: 'long-run', intensity: 'Low-Moderate',
  blocks: [
    { title: 'Recovery Volume', exercises: [
      { name: 'Zone 2 Run', detail: 'Comfortable', sets: '8K' },
      { name: 'Wall Balls (light)', detail: 'Technique focus only', sets: '50 reps' },
    ]},
  ]
};

// Taper week
const TAPER_MON = { day: 'Monday', type: 'Easy Jog + Mobility', duration: '40 min', dotClass: 'recovery', intensity: 'Low', blocks: [{ title: 'Taper Session', exercises: [{ name: 'Easy Z2 Jog', detail: 'Very comfortable', sets: '30 min' }, { name: 'Full Mobility Flow', detail: 'Every joint', sets: '10 min' }]}] };
const TAPER_TUE = { day: 'Tuesday', type: 'Strides + Shake Out', duration: '30 min', dotClass: 'running', intensity: 'Low', blocks: [{ title: 'Shake Out', exercises: [{ name: '200m Strides', detail: 'Smooth, 85% effort', sets: '4 reps' }, { name: 'Wall Balls', detail: 'Technique only', sets: '20 reps' }]}] };
const TAPER_WED = { day: 'Wednesday', type: 'FULL REST', duration: '—', dotClass: 'rest', intensity: 'Rest', blocks: [{ title: 'Rest & Prepare', exercises: [{ name: 'Full Rest', detail: 'Walk only if needed', sets: '' }, { name: 'Prep Gear', detail: 'Shoes, orthotics, gloves, nutrition', sets: '' }]}] };
const TAPER_THU = { day: 'Thursday', type: 'Light Jog + Feel Machines', duration: '25 min', dotClass: 'recovery', intensity: 'Very Low', blocks: [{ title: 'Activation', exercises: [{ name: 'Easy Jog', detail: 'Barely above walking', sets: '20 min' }, { name: 'Row', detail: 'Feel the rhythm', sets: '5 min' }]}] };
const TAPER_FRI = { day: 'Friday', type: '🏁 FULL REST — Race Eve', duration: '—', dotClass: 'rest', intensity: 'Rest', blocks: [{ title: 'Pre-Race', exercises: [{ name: 'Full REST', detail: 'Sleep 9 hours', sets: '' }, { name: 'Carb Load', detail: 'Pasta, rice, bread with honey', sets: '' }, { name: 'Mental Rehearsal', detail: 'Visualize pacing plan', sets: '' }]}] };
const TAPER_SAT = { day: 'Saturday', type: '🔥 RACE DAY', duration: '~1:30', dotClass: 'strength', intensity: 'RACE', blocks: [{ title: 'HYROX Buenos Aires', exercises: [{ name: 'Warm-Up', detail: '20 min light jog + dynamic stretches', sets: '' }, { name: '🏁 RACE', detail: 'Trust the process. Enjoy every second.', sets: '~1:30' }, { name: 'Cool-Down & Celebrate', detail: 'You earned this! 🏅', sets: '' }]}] };

export const WEEKS = [
  { week: 1, phase: 1, days: [P1_MON, P1_TUE, P1_WED, P1_THU, P1_FRI, P1_SAT, P1_SUN] },
  { week: 2, phase: 1, days: [P1_MON, P1_TUE, P1_WED, P1_THU, P1_FRI, P1_SAT, P1_SUN] },
  { week: 3, phase: 1, days: [P1_MON, P1_TUE, P1_WED, P1_THU, P1_FRI, P1_SAT, P1_SUN] },
  { week: 4, phase: 2, days: [P2_MON, P2_TUE, P1_WED, P2_THU, P2_FRI, P1_SAT, P2_SUN] },
  { week: 5, phase: 2, days: [P2_MON, P2_TUE, P1_WED, P2_THU, P2_FRI, P1_SAT, P2_SUN] },
  { week: 6, phase: 2, deload: true, days: [P1_MON, P1_TUE, P1_WED, P1_THU, P1_FRI, P1_SAT, P1_SUN] }, // Deload
  { week: 7, phase: 2, days: [P2_MON, P2_TUE, P1_WED, P2_THU, P2_FRI, P1_SAT, P2_SUN] },
  { week: 8, phase: 3, days: [P3_MON, P3_TUE, P1_WED, P3_THU, P2_FRI, P1_SAT, P3_SUN] },
  { week: 9, phase: 3, days: [P3_MON, P3_TUE, P1_WED, P3_THU, P1_FRI, P1_SAT, P3_SUN] },
  { week: 10, phase: 3, taper: true, days: [TAPER_MON, TAPER_TUE, TAPER_WED, TAPER_THU, TAPER_FRI, TAPER_SAT, P1_SUN] },
];
