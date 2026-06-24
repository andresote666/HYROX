/* ═══════════════════════════════════════════════════════════
   HYROX PREP — Training Data
   23-Week Hybrid Hypertrophy + HYROX Training Plan
   ═══════════════════════════════════════════════════════════ */

export const RACE_DATE = new Date('2026-11-21T09:00:00-03:00');

export const ATHLETE = {
  name: 'Andrés',
  age: 34, height: 193, weight: 94,
  bodyFat: 10.7, muscleMass: 47.5, inbodyScore: 92,
  bmr: 2152,
  maxHR: 193,
  tenK: '6:00/km',
  bench: '80kg', squat: '34kg goblet', deadlift: '2x34kg DB', ohp: '34kg/hand',
  goal: 'Sub 1:28 – 1:33',
  division: 'Open Singles',
  race: 'HYROX Rio de Janeiro',
  previousRace: {
    name: 'HYROX Buenos Aires 2026',
    date: 'June 13, 2026',
    time: '1:42:00',
    splits: [
      { name: 'Run 1', time: '5:27', target: '5:10' },
      { name: 'SkiErg', time: '4:13', target: '4:05' },
      { name: 'Run 2', time: '6:50', target: '5:15' },
      { name: 'Sled Push', time: '3:49', target: '4:10' },
      { name: 'Run 3', time: '6:23', target: '5:25' },
      { name: 'Sled Pull', time: '8:02', target: '3:45' },
      { name: 'Run 4', time: '6:19', target: '5:25' },
      { name: 'BBJ', time: '10:46', target: '6:15' },
      { name: 'Run 5', time: '8:24', target: '5:30' },
      { name: 'Row', time: '4:49', target: '4:05' },
      { name: 'Run 6', time: '5:47', target: '5:25' },
      { name: 'Farmers Carry', time: '1:48', target: '1:45' },
      { name: 'Run 7', time: '5:15', target: '5:15' },
      { name: 'Sandbag Lunges', time: '6:20', target: '5:10' },
      { name: 'Run 8', time: '4:21', target: '4:35' },
      { name: 'Wall Balls', time: '7:29', target: '5:45' },
    ]
  }
};

export const HR_ZONES = [
  { id: 1, name: 'Z1 — Warm Up', range: '117–143 bpm', color: '#6B7280', use: 'Active recovery, warmups, mobility' },
  { id: 2, name: 'Z2 — Easy', range: '144–159 bpm', color: '#22C55E', use: 'Recovery runs, base building splits' },
  { id: 3, name: 'Z3 — Aerobic', range: '160–170 bpm', color: '#3B82F6', use: 'Long runs, race-pace running' },
  { id: 4, name: 'Z4 — Threshold', range: '171–180 bpm', color: '#F59E0B', use: 'Hard intervals, station transitions' },
  { id: 5, name: 'Z5 — Maximum', range: '> 180 bpm', color: '#EF4444', use: 'Explosive sprints ONLY (Avoid on Sled)' },
];

export const PHASES = [
  { id: 1, name: 'Recovery', weeks: [1], color: '#A855F7', description: 'Recover post-Buenos Aires. Maintain light movement, blood flow, and mobility.' },
  { id: 2, name: 'Hypertrophy Base', weeks: [2,3,4,5,6,7,8], color: '#22C55E', description: 'Build muscle (10 sets/muscle/week) and establish Zone 2/3 aerobic running engine.' },
  { id: 3, name: 'Hypertrophy Build', weeks: [9,10,11,12,13,14,15,16], color: '#FF6B35', description: 'Peak muscle volume (12-15 sets/week), threshold intervals, and heavy sled pushing.' },
  { id: 4, name: 'HYROX Focus', weeks: [17,18,19,20,21], color: '#FF3A2F', description: 'Muscle maintenance (drop volume 40%). High-volume compromised runs and race simulations.' },
  { id: 5, name: 'Taper & Peak', weeks: [22,23], color: '#6B7280', description: 'Sharpen race-pace speed, decrease training volume, supercompensate for race day.' },
];

export const STATIONS = [
  { num: 1, name: 'SkiErg', distance: '1,000m', weight: '—', targetTime: '4:05', tips: ['Pace at 2:00/500m — don\'t exceed 1:55', 'Arms + hips, use your lats for power', 'Med ball slams + cable pulldowns as alternatives'], icon: '⛷️' },
  { num: 2, name: 'Sled Push', distance: '50m', weight: '152kg', targetTime: '4:10', tips: ['Low body angle, 45° lean into the sled', 'MICRO-REST: 10m push → 5s stand-breathe → repeat', 'Target EXIT HR < 180 bpm (Stay in Z4, do not redline)'], icon: '🛷' },
  { num: 3, name: 'Sled Pull', distance: '50m', weight: '103kg', targetTime: '3:45', tips: ['Hand-over-hand on rope, stay low, use hips', 'Grip management: chalk your hands', 'Cable rope pulls mimic this in the gym'], icon: '🪢' },
  { num: 4, name: 'Burpee Broad Jump', distance: '80m', weight: '—', targetTime: '6:15', tips: ['STEP UP from burpee (more efficient)', 'Consistent ~1.5m jumps, don\'t go all-out', 'Break into 4x20m mental chunks'], icon: '🐸' },
  { num: 5, name: 'RowErg', distance: '1,000m', weight: '—', targetTime: '4:05', tips: ['Pace at 1:55-2:00/500m', 'Power from legs, smooth catch', 'You have this in your gym — practice weekly'], icon: '🚣' },
  { num: 6, name: 'Farmers Carry', distance: '200m', weight: '2x24kg', targetTime: '1:45', tips: ['Even pace, don\'t rush', 'If grip fails, set down, shake 5s, go', 'Practice with dumbbells at the gym'], icon: '🏋️' },
  { num: 7, name: 'Sandbag Lunges', distance: '100m', weight: '20kg', targetTime: '5:10', tips: ['Controlled stride, hug bag to chest', 'Steady rhythm wins — don\'t rush', 'Practice with a DB held at chest'], icon: '🎒' },
  { num: 8, name: 'Wall Balls', distance: '100 reps', weight: '6kg', targetTime: '5:45', tips: ['Break them: 25-25-25-25', 'Catch ball low, use downward momentum', 'Leg drive for throw — save your shoulders', 'NEVER miss a rep (no-reps cost energy)'], icon: '🏀' },
];

export const RACE_PACING = [
  { type: 'run', label: 'Run 1 — Start', pace: '5:10-5:15/km', note: 'Controlled start, Garmin Z3' },
  { type: 'station', label: 'SkiErg — 1,000m', pace: '~4:05', note: 'Steady 2:00/500m' },
  { type: 'run', label: 'Run 2', pace: '5:15/km', note: 'Settle in, Garmin Z3' },
  { type: 'station', label: 'Sled Push — 50m', pace: '~4:10', note: '45° lean, micro-rests, Exit HR < 180' },
  { type: 'run', label: 'Run 3', pace: '5:20-5:30/km', note: 'Heavy legs, control HR' },
  { type: 'station', label: 'Sled Pull — 50m', pace: '~3:45', note: 'Hand-over-hand, hip drive' },
  { type: 'run', label: 'Run 4', pace: '5:25/km', note: 'Maintain form, turnover' },
  { type: 'station', label: 'Burpee Broad Jump — 80m', pace: '~6:15', note: 'Step-up technique, consistent jumps' },
  { type: 'run', label: 'Run 5 — HALFWAY', pace: '5:30/km', note: 'Mental boost, check Garmin HR' },
  { type: 'station', label: 'RowErg — 1,000m', pace: '~4:05', note: 'Controlled 2:00/500m' },
  { type: 'run', label: 'Run 6', pace: '5:25/km', note: 'Keep steady' },
  { type: 'station', label: 'Farmers Carry — 200m', pace: '~1:45', note: 'Minimal breaks' },
  { type: 'run', label: 'Run 7', pace: '5:15/km', note: 'Focus on breathing' },
  { type: 'station', label: 'Sandbag Lunges — 100m', pace: '~5:10', note: 'Steady stride, chest up' },
  { type: 'run', label: 'Run 8', pace: '4:35-4:45/km', note: 'Dig deep, push' },
  { type: 'station', label: 'Wall Balls — 100 reps', pace: '~5:45', note: 'Sets of 25, leg drive' },
  { type: 'run', label: 'FINAL RUN → FINISH 🏁', pace: '4:00-4:15/km', note: 'EMPTY THE TANK' },
];

export const CONFLICT_PAIRS = {
  lower: ['lower', 'hybrid', 'long-run'],
  hybrid: ['lower', 'hybrid'],
  'long-run': ['lower', 'long-run', 'hybrid'],
  upper: ['upper'],
  running: ['running', 'long-run'],
};

export const IT_BAND_RULES = {
  green: {},
  yellow: {
    lower:      { action: 'suggest-B', message: 'IT Band caution → Lighter variant recommended', icon: '⚠️' },
    running:    { action: 'warn', message: 'Reduce distance 20%, skip intervals if sharp pain', icon: '⚠️' },
    'long-run': { action: 'warn', message: 'Cap distance, add walk breaks every 2km', icon: '⚠️' },
    hybrid:     { action: 'warn', message: 'Reduce running segments, focus on stations', icon: '⚠️' },
  },
  red: {
    lower:      { action: 'force-B', message: 'IT Band protect → Switched to mobility variant', icon: '🛑' },
    running:    { action: 'replace', message: 'Running replaced with bike/row (IT Band protect)', icon: '🛑' },
    'long-run': { action: 'replace', message: 'Long run replaced with steady-state bike (IT Band protect)', icon: '🛑' },
    hybrid:     { action: 'modify', message: 'Compromised running removed, stations only', icon: '🛑' },
  },
};

export const RED_PROTOCOL_RUNNING = {
  day: 'FLEX', type: '🛑 Cardio: Bike/Row (IT Band Protocol)', duration: '60 min',
  dotClass: 'recovery', intensity: 'Moderate', variant: 'R',
  category: 'recovery',
  blocks: [
    { title: 'Low-Impact Cardio · 40 min', exercises: [
      { name: 'Stationary Bike (moderate)', detail: 'Cadence 80-90rpm, HR Z2', sets: '25 min' },
      { name: 'Rowing Machine', detail: 'Smooth strokes, HR Z2. Focus on pull', sets: '15 min' },
    ]},
    { title: 'IT Band Rehab · 20 min', exercises: [
      { name: 'Lateral Band Walks', detail: 'Glute med activation', sets: '3×15/side' },
      { name: 'Clamshells (banded)', detail: 'Slow, controlled', sets: '3×12/side' },
      { name: 'Single-Leg Glute Bridge', detail: 'Address imbalance', sets: '3×10/side' },
      { name: 'Pigeon Pose', detail: 'Deep hip opener', sets: '2×45s/side' },
    ]},
  ]
};

export const RED_PROTOCOL_LONG_RUN = {
  day: 'FLEX', type: '🛑 Steady-State Bike (IT Band Protocol)', duration: '60-70 min',
  dotClass: 'recovery', intensity: 'Low-Moderate', variant: 'R',
  category: 'recovery',
  blocks: [
    { title: 'Steady-State Bike · 45 min', exercises: [
      { name: 'Zone 2 Bike', detail: 'Conversational pace, 70-80rpm', sets: '45 min' },
    ]},
    { title: 'Station Practice (non-impact) · 15 min', exercises: [
      { name: 'Wall Balls (light)', detail: 'Technique only, no jumping', sets: '50 reps' },
      { name: 'Farmer\'s Carry', detail: 'Grip endurance', sets: '3×40m', weight: '2×24kg' },
    ]},
    { title: 'IT Band Rehab · 10 min', exercises: [
      { name: 'Monster Walks', detail: 'Banded', sets: '3×12/dir' },
      { name: 'Hip 90/90 Rotations', detail: 'Mobility', sets: '2×8/side' },
    ]},
  ]
};

// ── WORKOUT DAILY TEMPLATES ──

// --- PHASE 1: RECOVERY ---
const P1_MON = {
  day: 'Monday', type: 'Upper Body Light Pump', duration: '60 min',
  dotClass: 'recovery', intensity: 'Low', variant: 'A', category: 'upper',
  blocks: [
    { title: 'Warmup · 10 min', exercises: [{ name: 'Arm Circles & Band Pull-Aparts', detail: 'Dynamic warmup', sets: '2 rounds' }] },
    { title: 'Light Upper Pump · 35 min', exercises: [
      { name: 'Incline DB Press (light)', detail: '3 RIR focus', sets: '3×12', weight: '20kg/hand' },
      { name: 'Lat Pulldown', detail: 'Feel the lats', sets: '3×12', weight: '45kg' },
      { name: 'DB Shoulder Press (light)', detail: 'Control eccentric', sets: '3×12', weight: '16kg/hand' },
      { name: 'Seated Cable Row', detail: 'Squeeze back', sets: '3×12', weight: '45kg' },
    ] },
    { title: 'Core & Mobility · 15 min', exercises: [
      { name: 'Dead Bug', detail: 'Core baseline', sets: '3×10' },
      { name: 'Thoracic Mobility Flow', detail: 'Spine decompression', sets: '5 min' }
    ] }
  ]
};

const P1_TUE = {
  day: 'Tuesday', type: 'Running: Recovery Z2 Jog', duration: '35 min',
  dotClass: 'running', intensity: 'Low', variant: 'A', category: 'running',
  blocks: [
    { title: 'Recovery Run', exercises: [
      { name: 'Zone 2 Jog', detail: 'Keep HR strictly 144-150 bpm', sets: '5K @ 6:30/km' }
    ] }
  ]
};

const P1_WED = {
  day: 'Wednesday', type: 'Lower Body Light Pump & Mobility', duration: '60 min',
  dotClass: 'recovery', intensity: 'Low', variant: 'A', category: 'lower',
  blocks: [
    { title: 'Mobility Warmup · 15 min', exercises: [
      { name: 'Hip 90/90 Rotations', detail: 'Mobility', sets: '2×8/side' },
      { name: 'Glute Bridges', detail: 'Activation', sets: '2×12' }
    ] },
    { title: 'Lower Body Pump · 30 min', exercises: [
      { name: 'Goblet Squat (light)', detail: 'Controlled tempo 3-1-1', sets: '3×12', weight: '20kg DB' },
      { name: 'DB Romanian Deadlift', detail: 'Hamstring activation', sets: '3×12', weight: '2x20kg DB' },
      { name: 'Bodyweight Lunges', detail: 'Focus on balance', sets: '2×10/leg' }
    ] },
    { title: 'IT Band Protection · 15 min', exercises: [
      { name: 'Lateral Band Walks', detail: 'Glute medius activation', sets: '3×15/side' },
      { name: 'Pigeon Pose Hold', detail: 'Hip flexibility', sets: '2×45s/side' }
    ] }
  ]
};

const P1_THU = {
  day: 'Thursday', type: 'Active Recovery: Bike + Foam Roll', duration: '45 min',
  dotClass: 'recovery', intensity: 'Low', variant: 'A', category: 'recovery',
  blocks: [
    { title: 'Active Recovery', exercises: [
      { name: 'Stationary Bike', detail: 'Extremely light spinning (Z1)', sets: '25 min' },
      { name: 'Full-Body Foam Rolling', detail: 'TFL, Quads, Calves (Avoid direct IT band)', sets: '15 min' },
      { name: 'Band Hip Flexor Stretch', detail: 'Relieve tension', sets: '5 min' }
    ] }
  ]
};

const P1_FRI = {
  day: 'Friday', type: 'Upper Pull Pump + Core', duration: '60 min',
  dotClass: 'recovery', intensity: 'Low', variant: 'A', category: 'upper',
  blocks: [
    { title: 'Pull Pump · 40 min', exercises: [
      { name: 'Lat Pulldown (wide)', detail: 'Strict reps', sets: '3×12', weight: '50kg' },
      { name: 'DB Single-Arm Row', detail: 'Support spine', sets: '3×12', weight: '20kg' },
      { name: 'DB Bicep Curls', detail: 'Control weight', sets: '3×12', weight: '12kg/hand' },
      { name: 'Face Pulls', detail: 'Rear delts', sets: '3×15', weight: 'Light' }
    ] },
    { title: 'Core Finish · 20 min', exercises: [
      { name: 'Plank Hold', detail: 'Shoulder stability', sets: '3×45s' },
      { name: 'Bird Dog', detail: 'Posterior chain stability', sets: '3×10/side' }
    ] }
  ]
};

const P1_SAT = {
  day: 'Saturday', type: 'REST DAY', duration: '—',
  dotClass: 'rest', intensity: 'Rest', variant: 'A', category: 'rest',
  blocks: [{ title: 'Full Recovery', exercises: [{ name: 'Sleep & Hydration', detail: '9h sleep, 3-4L water', sets: 'Non-negotiable' }] }]
};

const P1_SUN = {
  day: 'Sunday', type: 'Easy Z2 Jog & Walk', duration: '40 min',
  dotClass: 'running', intensity: 'Low', variant: 'A', category: 'running',
  blocks: [{ title: 'Jog & Walk', exercises: [{ name: 'Light Outdoor Jog/Walk', detail: 'Garmin Z2, conversational', sets: '40 min' }] }]
};


// --- PHASE 2-3: HYPERTROPHY BASE & BUILD (Mon/Wed/Fri weight split) ---

// MONDAY: UPPER HYPERTROPHY
const P2_MON = {
  day: 'Monday', type: 'Upper Hypertrophy (Chest/Back/Shoulders/Arms)', duration: '80 min',
  dotClass: 'strength', intensity: 'High', variant: 'A', category: 'upper',
  blocks: [
    { title: 'Chest & Back (2m rest)', exercises: [
      { name: 'Incline DB Bench Press', detail: 'Hypertrophy focus, 1-2 RIR', sets: '4×8-10', weight: '28kg/hand' },
      { name: 'Weighted Pull-Ups', detail: 'Slow eccentric, 2 RIR', sets: '4×8-10', weight: 'BW + 5kg' },
      { name: 'Barbell Flat Bench Press', detail: '1-2 RIR', sets: '3×10-12', weight: '70kg' },
      { name: 'Barbell Row', detail: 'Chest-supported if possible', sets: '3×10-12', weight: '60kg' },
    ] },
    { title: 'Shoulders & Arms (90s rest)', exercises: [
      { name: 'Seated DB Overhead Press', detail: 'Clean push overhead', sets: '4×10-12', weight: '24kg/hand' },
      { name: 'Cable Lateral Raises', detail: 'Isolation tempo', sets: '3×12-15', weight: 'Light' },
      { name: 'Barbell Curls / Pushdowns superset', detail: 'Arm pump', sets: '3×12', weight: 'Moderate' }
    ] }
  ]
};

const P2_MON_B = {
  day: 'Monday', type: 'Upper Body Pump (B-Variant)', duration: '75 min',
  dotClass: 'strength', intensity: 'Moderate', variant: 'B', category: 'upper',
  blocks: [
    { title: 'Push Focus (90s rest)', exercises: [
      { name: 'Incline DB Press (light)', detail: 'Concentrate on chest contraction', sets: '4×12', weight: '24kg/hand' },
      { name: 'Machine Chest Press', detail: 'Constant tension', sets: '3×12', weight: 'Moderate' },
      { name: 'Dips (bodyweight)', detail: 'Chest tilt, controlled', sets: '3×10' }
    ] },
    { title: 'Shoulders & Arms (60s rest)', exercises: [
      { name: 'DB lateral raises', detail: 'Strict form', sets: '4×15', weight: '10kg/hand' },
      { name: 'Hammer Curls / Overhead Ext superset', detail: 'Pump focus', sets: '3×12', weight: '12kg/hand' }
    ] }
  ]
};

// WEDNESDAY: LOWER HYPERTROPHY
const P2_WED = {
  day: 'Wednesday', type: 'Lower Hypertrophy (Quads/Hams/Calves/Core)', duration: '85 min',
  dotClass: 'strength', intensity: 'High', variant: 'A', category: 'lower',
  blocks: [
    { title: 'Quads & Hamstrings (2m+ rest)', exercises: [
      { name: 'Barbell Back Squat', detail: 'Deep squat, 2 RIR target', sets: '4×8-10', weight: '80kg' },
      { name: 'DB Romanian Deadlift', detail: 'Hip hinge, hamstrings loaded', sets: '4×10-12', weight: '2x34kg' },
      { name: 'Leg Press (high/wide feet)', detail: 'Pushes quad envelope', sets: '3×12-15', weight: 'Moderate-Heavy' }
    ] },
    { title: 'Calves & Core (90s rest)', exercises: [
      { name: 'Standing Calf Raise', detail: '3s eccentric pause at bottom', sets: '3×15', weight: 'Heavy' },
      { name: 'Cable Crunches', detail: 'Tension on abs', sets: '3×15', weight: 'Moderate' },
      { name: 'Banded Dead Bug', detail: 'Anti-extension stability', sets: '3×10/side' }
    ] }
  ]
};

const P2_WED_B = {
  day: 'Wednesday', type: 'Lower Body Care (IT Band Yellow Alt)', duration: '75 min',
  dotClass: 'strength', intensity: 'Moderate', variant: 'B', category: 'lower',
  blocks: [
    { title: 'Posterior & Glute Focus (no heavy squats)', exercises: [
      { name: 'Barbell Hip Thrust', detail: 'Strong glute lockout, safe for knee', sets: '4×12', weight: '70kg' },
      { name: 'DB Romanian Deadlift (light)', detail: 'Focus on stretch, no knee pain', sets: '3×12', weight: '2x24kg' },
      { name: 'Leg Extension (light)', detail: 'Avoid painful ranges', sets: '3×15', weight: 'Light' }
    ] },
    { title: 'Glute Medius & Core', exercises: [
      { name: 'Lateral Band Walks', detail: 'IT band rehab', sets: '3×15/side' },
      { name: 'Clamshells (banded)', detail: 'Slow', sets: '3×15/side' },
      { name: 'Copenhagen Side Plank', detail: 'Adductors', sets: '3×20s/side' }
    ] }
  ]
};

// FRIDAY: FULL-BODY HYPERTROPHY
const P2_FRI = {
  day: 'Friday', type: 'Full-Body Hypertrophy (Compounds & Grip)', duration: '85 min',
  dotClass: 'strength', intensity: 'High', variant: 'A', category: 'upper',
  blocks: [
    { title: 'Major Compounds (2.5m rest)', exercises: [
      { name: 'Barbell Bench Press', detail: '1-2 RIR target', sets: '3×8-10', weight: '75kg' },
      { name: 'Weighted Pull-Ups', detail: 'Lat thickness focus', sets: '3×8-10', weight: 'BW+5kg' },
      { name: 'Trap Bar Deadlift', detail: 'Squatty deadlift, less lower back fatigue', sets: '3×8', weight: '80kg' },
      { name: 'Goblet Squat (heavy)', detail: '34kg DB at chest', sets: '3×10-12', weight: '34kg DB' }
    ] },
    { title: 'Accessory & Grip (90s rest)', exercises: [
      { name: 'Walking Lunges (DB)', detail: 'HYROX station prep', sets: '3×12 steps/leg', weight: '2x20kg DBs' },
      { name: 'Farmer\'s Walk', detail: 'HYROX carry prep', sets: '3×60m', weight: '2x28kg' },
      { name: 'Towel Hang from Bar', detail: 'Static grip endurance', sets: '3×Max time', weight: 'BW' }
    ] }
  ]
};

const P2_FRI_B = {
  day: 'Friday', type: 'Full-Body Hypertrophy (B-Variant)', duration: '75 min',
  dotClass: 'strength', intensity: 'Moderate', variant: 'B', category: 'upper',
  blocks: [
    { title: 'Upper Compounds (90s rest)', exercises: [
      { name: 'Barbell Flat Bench Press', detail: 'Controlled reps', sets: '3×10', weight: '70kg' },
      { name: 'Seated Cable Row (wide)', detail: 'Squeeze upper back', sets: '3×12', weight: 'Moderate' },
      { name: 'DB Shoulder Press', detail: 'Deltoid push', sets: '3×12', weight: '20kg/hand' }
    ] },
    { title: 'Grip & Carry (no squats/lunges)', exercises: [
      { name: 'Farmer\'s Hold (static)', detail: 'Grip only, no knee load', sets: '3×45s', weight: '2x28kg' },
      { name: 'Ab Wheel Rollouts', detail: 'Core stability', sets: '3×10' },
      { name: 'Face Pulls', detail: 'Shoulder health', sets: '3×15', weight: 'Light' }
    ] }
  ]
};

// conditioning days
const P2_TUE = {
  day: 'Tuesday', type: 'Running: Z2 Easy Base', duration: '60 min',
  dotClass: 'running', intensity: 'Moderate', variant: 'A', category: 'running',
  blocks: [
    { title: 'Easy Running (Garmin Z2)', exercises: [
      { name: 'Steady Zone 2 Run', detail: 'Maintain 144-159 bpm. Aerobic foundation.', sets: '6K to 8K (add 500m/wk)' }
    ] },
    { title: 'Speed Strides', exercises: [
      { name: '100m Strides', detail: '90% speed, walk-back recovery. Muscle recruitment.', sets: '4 reps' }
    ] }
  ]
};

// TUESDAY: TEMPO RUN (Week 3 bridge — introduce sustained Z3 effort)
const P2_TUE_TEMPO = {
  day: 'Tuesday', type: 'Running: Z3 Tempo Run', duration: '50 min',
  dotClass: 'running', intensity: 'Moderate-High', variant: 'A', category: 'running',
  blocks: [
    { title: 'Warmup · 10 min', exercises: [{ name: 'Easy Z2 Jog', detail: 'Settle in, 144-150 bpm', sets: '10 min' }] },
    { title: 'Tempo Block (Garmin Z3)', exercises: [
      { name: 'Sustained Z3 Tempo', detail: 'Hold 160-170 bpm. Comfortably hard, conversational limit.', sets: '20 min', weight: '5:30-5:45/km' }
    ] },
    { title: 'Cooldown', exercises: [
      { name: 'Easy Z2 Jog', detail: 'Bring HR down gradually', sets: '10 min' },
      { name: '100m Strides', detail: '90% speed, walk-back recovery', sets: '3 reps' }
    ] }
  ]
};

// TUESDAY: FARTLEK (Week 4 — introduce Z4 efforts with Z2 recovery)
const P2_TUE_FARTLEK = {
  day: 'Tuesday', type: 'Running: Fartlek (Z2/Z4 Mix)', duration: '55 min',
  dotClass: 'running', intensity: 'High', variant: 'A', category: 'running',
  blocks: [
    { title: 'Warmup · 10 min', exercises: [{ name: 'Easy Z2 Jog', detail: 'Settle in, 144-150 bpm', sets: '10 min' }] },
    { title: 'Fartlek Intervals', exercises: [
      { name: '1 min Z4 / 2 min Z2 Recovery', detail: 'Push to 171-180 bpm on efforts, recover to ~150 bpm between. Unstructured feel.', sets: '6 rounds (18 min)' }
    ] },
    { title: 'Cooldown', exercises: [
      { name: 'Easy Z2 Jog', detail: 'Z1-Z2, recover fully', sets: '10 min' }
    ] }
  ]
};

// TUESDAY: THRESHOLD INTRO (Week 6 — 4×800m, building toward 5)
const P2_TUE_THRESHOLD = {
  day: 'Tuesday', type: 'Running: Threshold Intervals (Intro)', duration: '60 min',
  dotClass: 'running', intensity: 'High', variant: 'A', category: 'running',
  blocks: [
    { title: 'Warmup · 10 min', exercises: [{ name: 'Easy Jog', detail: 'Z2 pace', sets: '10 min' }] },
    { title: 'Threshold Intervals (Garmin Z4)', exercises: [
      { name: '800m Repeats', detail: 'Target HR 171-180 bpm (Z4). 90s jog recovery.', sets: '4 reps', weight: '4:45/km pace' }
    ] },
    { title: 'Cooldown', exercises: [{ name: 'Easy Jog', detail: 'Z1-Z2', sets: '10 min' }] }
  ]
};

const P2_THU = {
  day: 'Thursday', type: 'Active Recovery / Mobility', duration: '50 min',
  dotClass: 'recovery', intensity: 'Low', variant: 'A', category: 'recovery',
  blocks: [
    { title: 'Cardio & Blood Flow', exercises: [
      { name: 'Stationary Bike (light)', detail: 'Garmin Z1/Z2 (130-145 bpm)', sets: '20 min' },
    ] },
    { title: 'Mobility & Stretching', exercises: [
      { name: 'IT Band / Glute Foam Rolling', detail: 'Target tight spots, NOT direct IT band', sets: '10 min' },
      { name: 'Hip flexor stretch', detail: 'Hold 45s/side', sets: '2×45s' },
      { name: 'Copenhagen Side Plank', detail: 'Adductor stability', sets: '3×15s/side' },
      { name: 'World\'s Greatest Stretch', detail: 'Full mobility', sets: '3×5/side' }
    ] }
  ]
};

const P2_SAT = {
  day: 'Saturday', type: 'REST DAY', duration: '—',
  dotClass: 'rest', intensity: 'Rest', variant: 'A', category: 'rest',
  blocks: [{ title: 'Full Recovery', exercises: [{ name: 'Rest Day Protocols', detail: 'Hydration (3-4L), high protein, passive rest.', sets: '' }] }]
};

const P2_SUN = {
  day: 'Sunday', type: 'Long Run + Sunday Sled', duration: '95 min',
  dotClass: 'long-run', intensity: 'High', variant: 'A', category: 'long-run',
  blocks: [
    { title: 'Long Run (Garmin Z3 Aerobic)', exercises: [
      { name: 'Zone 3 Aerobic Run', detail: 'HR 160-170 bpm. Build distance slowly.', sets: '8K to 12K' }
    ] },
    { title: 'Sunday Sled Work (Compromised)', exercises: [
      { name: 'Sled Push (2m rest)', detail: '10m push → 5s stand-breathe → 10m. EXIT HR < 180.', sets: '4 reps × 25m', weight: '100kg-120kg' },
      { name: 'Sled Pull (2m rest)', detail: 'Hand-over-hand, stay low, pull with hips', sets: '4 reps × 25m', weight: '70kg-80kg' }
    ] }
  ]
};

// --- PHASE 3: HYPERTROPHY BUILD (Weeks 9-16) ---
// Tuesday becomes interval running, Thursday is light station work, Sunday sled goes to race weights.
const P3_TUE = {
  day: 'Tuesday', type: 'Running: Threshold Intervals', duration: '65 min',
  dotClass: 'running', intensity: 'High', variant: 'A', category: 'running',
  blocks: [
    { title: 'Warmup · 10 min', exercises: [{ name: 'Easy Jog', detail: 'Z2 pace', sets: '10 min' }] },
    { title: 'Threshold Intervals (Garmin Z4)', exercises: [
      { name: '800m Repeats', detail: 'Target HR 171-180 bpm (Z4). 90s jog recovery.', sets: '5 reps', weight: '4:45/km pace' }
    ] },
    { title: 'Cooldown', exercises: [{ name: 'Easy Jog', detail: 'Z1-Z2', sets: '5 min' }] }
  ]
};

const P3_THU = {
  day: 'Thursday', type: 'HYROX Station Conditioning (Light)', duration: '70 min',
  dotClass: 'hybrid', intensity: 'High', variant: 'A', category: 'hybrid',
  blocks: [
    { title: 'Station Circuit (3 rounds · 90s rest)', exercises: [
      { name: 'RowErg', detail: 'Pace 2:00/500m', sets: '500m' },
      { name: 'Farmers Carry', detail: 'Grip focus', sets: '100m', weight: '2x24kg DBs' },
      { name: 'Wall Balls', detail: 'Leg drive', sets: '25 reps', weight: '6kg' },
      { name: 'Burpee Broad Jumps', detail: 'Step-up technique', sets: '20m' },
      { name: '⚡ COMPROMISED RUN', detail: 'Z3 Aerobic Pace', sets: '400m', weight: '5:30/km' }
    ] }
  ]
};

const P3_SUN = {
  day: 'Sunday', type: 'Long Run + Race Weight Sled', duration: '110 min',
  dotClass: 'long-run', intensity: 'Very High', variant: 'A', category: 'long-run',
  blocks: [
    { title: 'Long Run (Garmin Z3 Aerobic)', exercises: [
      { name: 'Zone 3 Aerobic Run', detail: 'HR 160-170 bpm. Build volume.', sets: '12K to 15K' }
    ] },
    { title: 'Race-Weight Sled (compromised)', exercises: [
      { name: 'Sled Push (2.5m rest)', detail: '10m push → 5s stand-breathe → repeat. EXIT HR < 180.', sets: '4 reps × 25m', weight: '140kg-152kg' },
      { name: 'Sled Pull (2m rest)', detail: 'Hand-over-hand, stay low, pull with hips', sets: '4 reps × 25m', weight: '90kg-103kg' },
      { name: 'Burpee Broad Jump', detail: 'Breathing rhythm tired', sets: '40m' }
    ] }
  ]
};


// --- PHASE 4: HYROX FOCUS & MAINTENANCE (Mon/Wed/Fri maintenance split) ---

// MONDAY: UPPER MAINTENANCE
const P4_MON = {
  day: 'Monday', type: 'Upper Maintenance (Fewer Sets)', duration: '50 min',
  dotClass: 'strength', intensity: 'Moderate-High', variant: 'A', category: 'upper',
  blocks: [
    { title: 'Upper Maintenance (2m rest)', exercises: [
      { name: 'Incline DB Bench Press', detail: 'Heavy load, preserve strength', sets: '3×8', weight: '28kg/hand' },
      { name: 'Weighted Pull-Ups', detail: 'Strict pull', sets: '3×8', weight: 'BW + 5kg' },
      { name: 'Seated DB Overhead Press', detail: 'Keep overhead strength', sets: '2×10', weight: '24kg/hand' },
      { name: 'Tricep Pushdown / Bicep Curl superset', detail: 'Accessory maintenance', sets: '2×12', weight: 'Moderate' }
    ] }
  ]
};

// WEDNESDAY: LOWER MAINTENANCE
const P4_WED = {
  day: 'Wednesday', type: 'Lower Maintenance + Core', duration: '55 min',
  dotClass: 'strength', intensity: 'Moderate-High', variant: 'A', category: 'lower',
  blocks: [
    { title: 'Lower Maintenance (2m rest)', exercises: [
      { name: 'Barbell Back Squat', detail: 'Heavy weight, maintain leg power', sets: '3×8', weight: '80kg' },
      { name: 'DB Romanian Deadlift', detail: 'Preserve hamstring strength', sets: '3×10', weight: '2x34kg' },
      { name: 'Standing Calf Raise / Cable Crunch superset', detail: 'Accessories', sets: '3×12', weight: 'Heavy' }
    ] }
  ]
};

// FRIDAY: UPPER MAINTENANCE (PULL/GRIP)
const P4_FRI = {
  day: 'Friday', type: 'Upper Pull Maintenance + Grip', duration: '50 min',
  dotClass: 'strength', intensity: 'Moderate-High', variant: 'A', category: 'upper',
  blocks: [
    { title: 'Pull Maintenance (2m rest)', exercises: [
      { name: 'Barbell Row', detail: 'Maintain pulling base', sets: '3×8', weight: '65kg' },
      { name: 'Lat Pulldown (wide)', detail: 'Maintain SkiErg power', sets: '2×10', weight: '60kg' },
      { name: 'Farmer\'s Hold (static)', detail: 'Maintain carry grip', sets: '3×45s', weight: '2x32kg' },
      { name: 'Towel Hang from Bar', detail: 'Static grip', sets: '2×Max time', weight: 'BW' }
    ] }
  ]
};

// conditioning days
const P4_TUE = {
  day: 'Tuesday', type: 'Running: Speed & Threshold', duration: '70 min',
  dotClass: 'running', intensity: 'High', variant: 'A', category: 'running',
  blocks: [
    { title: 'Warmup · 10 min', exercises: [{ name: 'Easy Z2 Run', detail: 'Warmup', sets: '10 min' }] },
    { title: 'Threshold Intervals (Garmin Z4)', exercises: [
      { name: '1km Repeats', detail: 'Target HR 171-180 bpm (Z4). 2 min recovery.', sets: '4-5 reps', weight: '4:45/km pace' }
    ] },
    { title: 'Speed Finisher', exercises: [
      { name: '200m Sprints', detail: 'Z5 maximum effort. Walk-back recovery.', sets: '4 reps' }
    ] }
  ]
};

const P4_THU = {
  day: 'Thursday', type: '🏁 HYROX Race Simulation', duration: '90 min',
  dotClass: 'hybrid', intensity: 'Very High', variant: 'A', category: 'hybrid',
  blocks: [
    { title: 'Near-Full Simulation (compromised running throughout)', exercises: [
      { name: '1km Run', detail: 'Z3 Aerobic Start (controlled)', sets: 'Run 1', weight: '5:15/km' },
      { name: 'Row 1,000m (SkiErg sub)', detail: 'Steady pace', sets: 'Station 1', weight: '2:00/500m' },
      { name: '1km Run (compromised)', detail: 'Z3 Aerobic', sets: 'Run 2', weight: '5:20/km' },
      { name: 'Sled Push (treadmill push off)', detail: 'Micro-rest technique. EXIT HR < 180.', sets: 'Station 2', weight: '152kg' },
      { name: '1km Run (compromised)', detail: 'Z3 Aerobic', sets: 'Run 3', weight: '5:30/km' },
      { name: 'Farmers Carry 200m', detail: 'Even steps', sets: 'Station 6', weight: '2x24kg' },
      { name: '1km Run (compromised)', detail: 'Z3 Aerobic', sets: 'Run 4', weight: '5:30/km' },
      { name: 'Burpee Broad Jump 80m', detail: 'Step-up breathing rhythm', sets: 'Station 4', weight: 'BW' },
      { name: '1km Run (compromised)', detail: 'Z3 Aerobic', sets: 'Run 5', weight: '5:30/km' },
      { name: 'Walking Lunges 100m', detail: 'DB held at chest', sets: 'Station 7', weight: '20kg DB' },
      { name: '1km Run (compromised)', detail: 'Z3 Aerobic', sets: 'Run 6', weight: '5:30/km' },
      { name: 'Wall Balls 100 reps', detail: 'Sets of 25. Leg drive.', sets: 'Station 8', weight: '6kg' },
      { name: 'FINAL RUN 1km → FINISH', detail: 'Z4 push!', sets: 'Run 8', weight: '4:45/km' }
    ] }
  ]
};

const P4_SUN = {
  day: 'Sunday', type: 'Long Run + Race Weight Sled', duration: '90 min',
  dotClass: 'long-run', intensity: 'High', variant: 'A', category: 'long-run',
  blocks: [
    { title: 'Aerobic Run (Garmin Z3)', exercises: [
      { name: 'Zone 3 Aerobic Run', detail: 'HR 160-170 bpm', sets: '12K' }
    ] },
    { title: 'Race Weight Sled (compromised)', exercises: [
      { name: 'Sled Push (2m rest)', detail: '10m push → 5s stand-breathe → repeat. EXIT HR < 180.', sets: '3 reps × 25m', weight: '152kg' },
      { name: 'Sled Pull (2m rest)', detail: 'Hand-over-hand, pull with hips', sets: '3 reps × 25m', weight: '103kg' }
    ] }
  ]
};


// --- PHASE 5: TAPER & PEAK (Weeks 22-23) ---
const P5_MON = {
  day: 'Monday', type: 'Full-Body Maintenance (Light)', duration: '40 min',
  dotClass: 'strength', intensity: 'Moderate', variant: 'A', category: 'upper',
  blocks: [
    { title: 'Taper Strength (1 set each, heavy)', exercises: [
      { name: 'Incline DB Bench Press', detail: 'Keep strength, low volume', sets: '1×8', weight: '28kg/hand' },
      { name: 'Weighted Pull-Ups', detail: 'Keep back stiffness', sets: '1×8', weight: 'BW + 5kg' },
      { name: 'Barbell Back Squat', detail: 'Leg power maintenance', sets: '1×8', weight: '80kg' },
      { name: 'Core Work', detail: 'Dead bug', sets: '2×10' }
    ] }
  ]
};

const P5_TUE = {
  day: 'Tuesday', type: 'Running: Race Pace Sharpening', duration: '45 min',
  dotClass: 'running', intensity: 'Moderate-High', variant: 'A', category: 'running',
  blocks: [
    { title: 'Sharpening Intervals', exercises: [
      { name: 'Easy Warmup', detail: 'Z2 Jog', sets: '10 min' },
      { name: '400m Repeats @ Race Pace', detail: 'Target HR 171-180 (Z4). 2 min rest.', sets: '5-6 reps', weight: '5:00/km pace' },
      { name: 'Cooldown', detail: 'Easy jog', sets: '5 min' }
    ] }
  ]
};

const P5_THU = {
  day: 'Thursday', type: 'Half-Race Simulation (Light)', duration: '40-50 min',
  dotClass: 'hybrid', intensity: 'Moderate', variant: 'A', category: 'hybrid',
  blocks: [
    { title: 'Reduced Sim (4 stations + 4 runs)', exercises: [
      { name: '1km Run', detail: 'Z3 Aerobic Pace', sets: 'Run 1', weight: '5:15/km' },
      { name: 'Sled Push (light weight)', detail: 'Micro-rest technique check. EXIT HR < 180.', sets: 'Station 2', weight: '100kg' },
      { name: '1km Run', detail: 'Z3 Aerobic', sets: 'Run 2', weight: '5:20/km' },
      { name: 'Farmers Carry 100m', detail: 'Clean walk', sets: 'Station 6', weight: '2x24kg' },
      { name: '1km Run', detail: 'Z3 Aerobic', sets: 'Run 3', weight: '5:20/km' },
      { name: 'Wall Balls 40 reps', detail: 'Focus on speed', sets: 'Station 8', weight: '6kg' },
      { name: '1km Run — FINISH', detail: 'Control effort', sets: 'Run 4', weight: '5:10/km' }
    ] }
  ]
};

const P5_SUN = {
  day: 'Sunday', type: 'Easy Z3 Run + Sled Check', duration: '50 min',
  dotClass: 'long-run', intensity: 'Moderate', variant: 'A', category: 'long-run',
  blocks: [
    { title: 'Easy Run', exercises: [
      { name: 'Zone 3 Aerobic Run', detail: 'HR 160-170 bpm', sets: '8K' }
    ] },
    { title: 'Sled Technique Check', exercises: [
      { name: 'Sled Push (light)', detail: 'Micro-rest check', sets: '2 reps × 25m', weight: '100kg' }
    ] }
  ]
};

// Race Week Taper (Week 23)
const TAPER_MON = { day: 'Monday', type: 'Easy Jog + Mobility', duration: '40 min', dotClass: 'recovery', intensity: 'Low', variant: 'A', category: 'recovery', blocks: [{ title: 'Taper Session', exercises: [{ name: 'Easy Z2 Jog', detail: 'Very comfortable', sets: '30 min' }, { name: 'Full Mobility Flow', detail: 'Every joint', sets: '10 min' }]}] };
const TAPER_TUE = { day: 'Tuesday', type: 'Strides + Shake Out', duration: '30 min', dotClass: 'running', intensity: 'Low', variant: 'A', category: 'running', blocks: [{ title: 'Shake Out', exercises: [{ name: '200m Strides', detail: 'Smooth, 85% effort', sets: '4 reps' }, { name: 'Wall Balls', detail: 'Technique only', sets: '20 reps' }]}] };
const TAPER_WED = { day: 'Wednesday', type: 'FULL REST', duration: '—', dotClass: 'rest', intensity: 'Rest', variant: 'A', category: 'rest', blocks: [{ title: 'Rest & Prepare', exercises: [{ name: 'Full Rest', detail: 'Walk only if needed', sets: '' }, { name: 'Prep Gear', detail: 'Shoes, orthotics, gloves, nutrition', sets: '' }]}] };
const TAPER_THU = { day: 'Thursday', type: 'Light Jog + Feel Machines', duration: '25 min', dotClass: 'recovery', intensity: 'Very Low', variant: 'A', category: 'recovery', blocks: [{ title: 'Activation', exercises: [{ name: 'Easy Jog', detail: 'Barely above walking', sets: '20 min' }, { name: 'Row', detail: 'Feel the rhythm', sets: '5 min' }]}] };
const TAPER_FRI = { day: 'Friday', type: '🏁 FULL REST — Race Eve', duration: '—', dotClass: 'rest', intensity: 'Rest', variant: 'A', category: 'rest', blocks: [{ title: 'Pre-Race', exercises: [{ name: 'Full REST', detail: 'Sleep 9 hours', sets: '' }, { name: 'Carb Load', detail: 'Pasta, rice, bread with honey', sets: '' }, { name: 'Mental Rehearsal', detail: 'Visualize pacing plan', sets: '' }]}] };
const TAPER_SAT = { day: 'Saturday', type: '🏁 RACE DAY', duration: '~1:30', dotClass: 'strength', intensity: 'RACE', variant: 'A', category: 'rest', blocks: [{ title: 'HYROX Rio de Janeiro', exercises: [{ name: 'Warm-Up', detail: '20 min light jog + dynamic stretches', sets: '' }, { name: '🏁 RACE', detail: 'Trust the process. Enjoy every second.', sets: '~1:30' }, { name: 'Cool-Down & Celebrate', detail: 'You earned this! 🏅', sets: '' }]}] };
const TAPER_SUN = { day: 'Sunday', type: 'REST & CELEBRATE 🥳', duration: '—', dotClass: 'rest', intensity: 'Rest', variant: 'A', category: 'rest', blocks: [{ title: 'Recovery', exercises: [{ name: 'Hydration & Food', detail: 'Celebrate! Enjoy Rio.', sets: '' }]}] };


// ── 23-WEEK ARRANGEMENT ──
// Week 1: Recovery
// Weeks 2-8: Phase 2 Hypertrophy Base
// Weeks 9-16: Phase 3 Hypertrophy Build
// Weeks 17-21: Phase 4 HYROX Focus
// Weeks 22-23: Phase 5 Taper & Peak

export const WEEKS = [
  // Phase 1: Recovery (1 week)
  { week: 1, phase: 1, days: [P1_MON, P1_TUE, P1_WED, P1_THU, P1_FRI, P1_SAT, P1_SUN] },
  
  // Phase 2: Hypertrophy Base (7 weeks, Weeks 2-8)
  { week: 2, phase: 2, days: [P2_MON, P2_TUE, P2_WED, P2_THU, P2_FRI, P2_SAT, P2_SUN] },
  { week: 3, phase: 2, days: [P2_MON, P2_TUE_TEMPO, P2_WED, P2_THU, P2_FRI, P2_SAT, P2_SUN] },
  { week: 4, phase: 2, days: [P2_MON, P2_TUE_FARTLEK, P2_WED, P2_THU, P2_FRI, P2_SAT, P2_SUN] },
  { week: 5, phase: 2, deload: true, days: [P1_MON, P1_TUE, P1_WED, P1_THU, P1_FRI, P1_SAT, P1_SUN] }, // Deload 1
  { week: 6, phase: 2, days: [P2_MON, P2_TUE_THRESHOLD, P2_WED, P2_THU, P2_FRI, P2_SAT, P2_SUN] },
  { week: 7, phase: 2, days: [P2_MON, P3_TUE, P2_WED, P2_THU, P2_FRI, P2_SAT, P2_SUN] },
  { week: 8, phase: 2, days: [P2_MON, P3_TUE, P2_WED, P2_THU, P2_FRI, P2_SAT, P2_SUN] },
  
  // Phase 3: Hypertrophy Build (8 weeks, Weeks 9-16)
  // Tuesday becomes intervals (P3_TUE), Thursday becomes light station circuits (P3_THU), Sunday becomes heavy sleds (P3_SUN)
  { week: 9, phase: 3, days: [P2_MON, P3_TUE, P2_WED, P3_THU, P2_FRI, P2_SAT, P3_SUN] },
  { week: 10, phase: 3, days: [P2_MON, P3_TUE, P2_WED, P3_THU, P2_FRI, P2_SAT, P3_SUN] },
  { week: 11, phase: 3, days: [P2_MON, P3_TUE, P2_WED, P3_THU, P2_FRI, P2_SAT, P3_SUN] },
  { week: 12, phase: 3, deload: true, days: [P1_MON, P1_TUE, P1_WED, P1_THU, P1_FRI, P1_SAT, P1_SUN] }, // Deload 2
  { week: 13, phase: 3, days: [P2_MON, P3_TUE, P2_WED, P3_THU, P2_FRI, P2_SAT, P3_SUN] },
  { week: 14, phase: 3, days: [P2_MON, P3_TUE, P2_WED, P3_THU, P2_FRI, P2_SAT, P3_SUN] },
  { week: 15, phase: 3, days: [P2_MON, P3_TUE, P2_WED, P3_THU, P2_FRI, P2_SAT, P3_SUN] },
  { week: 16, phase: 3, days: [P2_MON, P3_TUE, P2_WED, P3_THU, P2_FRI, P2_SAT, P3_SUN] },
  
  // Phase 4: HYROX Focus (5 weeks, Weeks 17-21)
  // Mon/Wed/Fri become maintenance (P4_MON, P4_WED, P4_FRI). Tue/Thu/Sun become race specific (P4_TUE, P4_THU, P4_SUN)
  { week: 17, phase: 4, days: [P4_MON, P4_TUE, P4_WED, P4_THU, P4_FRI, P2_SAT, P4_SUN] },
  { week: 18, phase: 4, days: [P4_MON, P4_TUE, P4_WED, P4_THU, P4_FRI, P2_SAT, P4_SUN] },
  { week: 19, phase: 4, days: [P4_MON, P4_TUE, P4_WED, P4_THU, P4_FRI, P2_SAT, P4_SUN] },
  { week: 20, phase: 4, deload: true, days: [P1_MON, P1_TUE, P1_WED, P1_THU, P1_FRI, P1_SAT, P1_SUN] }, // Deload 3 (pre-peak)
  { week: 21, phase: 4, days: [P4_MON, P4_TUE, P4_WED, P4_THU, P4_FRI, P2_SAT, P4_SUN] },
  
  // Phase 5: Taper & Peak (2 weeks, Weeks 22-23)
  { week: 22, phase: 5, days: [P5_MON, P5_TUE, P1_WED, P5_THU, P1_FRI, P1_SAT, P5_SUN] },
  { week: 23, phase: 5, taper: true, days: [TAPER_MON, TAPER_TUE, TAPER_WED, TAPER_THU, TAPER_FRI, TAPER_SAT, TAPER_SUN] },
];

// Alt variant lookup — maps original day objects to their B-variant
export const ALT_VARIANTS = new Map([
  [P2_MON, P2_MON_B],
  [P2_WED, P2_WED_B],
  [P2_FRI, P2_FRI_B],
  // Deload and maintenance phases don't need variants as their volume is already customized
]);
