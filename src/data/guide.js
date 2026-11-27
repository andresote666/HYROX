/* Library content in plain language: what to DO first, the WHY on tap.
   Full research with every source lives in /research. */

export const STATIONS = [
  {
    id: 'bbj', name: 'Burpee broad jumps', spec: '80 m', rio: '10:03', goal: '6:45',
    cues: [
      'Step back and step up. Don\'t jump your feet in and out: at your weight that saves about 80 hard landings.',
      'Jump forward, not up. Swing your arms forward and land softly.',
      'Medium jumps of about 2 m: roughly 10 jumps every 20 m, about 40 in total.',
      'Keep a rhythm of one burpee every ~10 seconds. Take 2–3 breaths right after you land.',
      'Think of it as 4 blocks of 20 m. Don\'t sprint the first block.',
    ],
    train: 'Thursdays. Short EMOMs first, then 20–40 m repeats, then a full 80 m test in weeks 10 and 13. Most burpee fitness comes from no-jump burpees to protect your shins.',
    rule: 'Chest touches the floor. Both feet take off and land together. No extra steps between jumps.',
    why: 'Your biggest single time gain: 3 min 18 s. Smaller jumps take about as long as big ones but leave your legs much fresher for the next run.',
  },
  {
    id: 'wb', name: 'Wall balls', spec: '100 reps · 6 kg · 3 m', rio: '9:04', goal: '6:30',
    cues: [
      'Plan your sets: 20 reps, 10 breaths of rest, five times. Hold the ball at your chest while you rest; don\'t put it down.',
      'You\'re tall, so throw only as high as the target. Extra height wastes energy.',
      'Catch the ball and go straight down into the next squat in one movement.',
      'Hips below knees on every rep, or it doesn\'t count.',
      'Stand about an arm\'s length from the wall, feet a bit wider than your shoulders.',
    ],
    train: 'Tuesdays after squats: timed sets every minute (EMOM), "Gillingham" (90 s on, 25 s off) and the "Karen" test (150 reps).',
    rule: 'If the ball drops, stand up fully before the next squat.',
    why: 'Wall balls produce the highest heart rate of the whole race. Short planned rests are faster than going until you fail, because a forced stop costs 30–60 s.',
  },
  {
    id: 'pull', name: 'Sled pull', spec: '50 m · 103 kg', rio: '6:42', goal: '5:10',
    cues: [
      'First few metres of each length: lean back and walk backwards, pulling with your hips.',
      'Then stay low and pull hand over hand with straight arms.',
      'Keep the rope tight and throw it to your side, never behind you.',
      'Need a break? Keep holding the rope, pause 2 seconds, go again.',
    ],
    train: 'Tuesdays: heavy sled pulls, heavier than race weight, because race carpet is slower than gym floors. Deadlifts on Thursday build the hips that drive it.',
    rule: 'Don\'t step on the front line of your box.',
    why: 'Your pull takes a third longer than your push; top athletes are only about a fifth slower. Long arms and legs make the backwards walk especially effective for you.',
  },
  {
    id: 'push', name: 'Sled push', spec: '50 m · 152 kg', rio: '5:03', goal: '3:55',
    cues: [
      'Arms long, body low and almost flat.',
      'Short, fast steps on the balls of your feet.',
      'Never stop in the middle of a length: starting a stopped sled costs much more than keeping it moving.',
      'Test your race shoes on a sled before race day.',
    ],
    train: 'Tuesdays: heavy pushes after squats.',
    rule: 'Face the direction you\'re pushing.',
    why: 'Heavier gym pushes make race weight on carpet feel normal.',
  },
  {
    id: 'lunge', name: 'Sandbag lunges', spec: '100 m · 20 kg', rio: '6:23', goal: '5:35',
    cues: [
      'Bag high on your shoulders, chest up.',
      'Steady rhythm; back knee touches the floor each step.',
      'Don\'t stop at the halfway point.',
      'Don\'t drop the bag: 15 seconds penalty each time.',
    ],
    train: 'Bulgarian split squats on Tuesdays, lunges in Saturday sessions.',
    rule: '100 m total. The last step counts when your front foot crosses the line.',
    why: 'Don\'t hold back here out of fear of Run 8. Run 8 is fixed with fuel and practice, not by going slow on the lunges.',
  },
  {
    id: 'run8', name: 'Run 8 (after lunges)', spec: '1 km', rio: '8:19', goal: '6:05',
    cues: [
      'Take a gel after the burpees (Run 5) and a second gel or sports drink on Run 7.',
      'First 200 m after the lunges: easy shuffle. Then run.',
      'Start Run 1 slower than you want to. Fast starts cost you at the end.',
    ],
    train: 'Week 10 "bricks": lunges → 1 km → wall balls, three times.',
    rule: '',
    why: 'In Rio, Run 8 was 2½ minutes slower than your other runs. That usually comes from running out of fuel and tired legs, not from a lack of fitness.',
  },
  {
    id: 'rox', name: 'Roxzone (transitions)', spec: '16 transitions', rio: '7:46', goal: '6:30',
    cues: [
      'Jog every transition. Never walk. Think "the floor is lava".',
      'Learn the venue map a few days before the race.',
      'Sip water; don\'t stop to drink.',
      'Put gloves on or take them off before you reach the station.',
    ],
    train: 'Every Saturday session includes jogging in and out of the stations.',
    rule: '',
    why: '16 transitions, each 20 seconds faster, saves about 5 minutes.',
  },
  {
    id: 'ok', name: 'SkiErg, row, farmers carry', spec: 'Your strong stations', rio: '4:25 · 4:45 · 1:45', goal: 'Hold',
    cues: [
      'These are already as good as or better than the average Open man. Keep them; don\'t spend extra training time here.',
      'Your gym has no SkiErg, so the plan uses a hard 1,000 m row instead.',
    ],
    train: '', rule: '', why: '',
  },
];

export const TRAINING = [
  {
    kicker: 'The plan', title: 'Your week',
    rows: [
      ['Mon', 'Bike intervals (VO₂max) + short run, then Upper A: heavy bench + weighted pull-ups, rows, shoulders, arms'],
      ['Tue', 'Hops + Lower A: heavy squat, sled push + pull, Nordics, calves + wall balls'],
      ['Wed', 'Rowing, then Upper B: overhead press, pulldowns, incline press, dips, curls'],
      ['Thu', 'Long run (outdoors OK) + hops + Lower B: heavy deadlift, burpee broad jumps, leg press / leg curl / calves'],
      ['Fri', 'Long easy bike + core, carries and feet'],
      ['Sat', 'HYROX session: stations + runs'],
      ['Sun', 'Rest'],
    ],
    why: 'Runs fall on alternate days so the shins get a day off between them. The bike intervals come first in the week, fresh after Sunday, because heavy leg lifting blunts endurance sessions for up to 48 hours. Upper body goes straight after the bike or the row: cardio done just before does not weaken the bench press. Leg days are 48 hours apart and never the day before the intervals.',
    sources: 'Doma 2017; Sporer & Wenger 2003',
  },
  {
    kicker: 'Running', title: 'Your long run is Thursday',
    do: [
      'Thursday\'s run is your long run: the longest run of the week. From week 4 you can do it outside on an even, flat-ish route, at an easy pace (full sentences, HR ≤150).',
      'It grows about 10% at a time: 15 min in week 4, about 33 min by week 13. From a walk-run restart, that is the fastest safe growth.',
      'Want to go longer one day? The app allows up to 10% over your longest run in the last 30 days (it reads your Garmin runs) and tells you on Today.',
      'No Sunday long run in this block: Saturday\'s HYROX session, Sunday and Monday\'s run would be three running days in a row on tired legs, and Sunday is your only full rest day. Walk outside instead if you like.',
      'After Buenos Aires, with the shins settled, Sunday long runs can come back in the next block.',
    ],
    why: 'In 5,200 runners, one run more than 10% longer than the longest of the previous 30 days raised overuse injuries 1.5–2.3×; weekly totals mattered much less. Return-to-run programmes after shin bone stress keep runs on alternate days first and add back-to-back days only later. Tired legs may load the shinbone more. The race-pace 1 km repeats live in the Saturday sessions; the long run builds the durability under them.',
    sources: 'Frandsen 2025; Warden 2016, 2021; Milgrom 2007',
  },
  {
    kicker: 'Effort', title: 'Easy days easy, hard days hard',
    do: [
      'About 80% of your training should be easy: you can talk in full sentences, heart rate roughly 135–151.',
      'About 20% is hard: intervals and HYROX sessions.',
      'The most common mistake is making easy days "medium". That leaves you too tired for the hard days.',
    ],
    why: 'Large reviews of endurance training show recreational athletes improve most with mostly easy training plus a little hard work. The Progress tab shows your easy/hard mix from Garmin.',
    sources: 'Rosenblat 2025',
  },
  {
    kicker: 'Bike', title: 'Bike intervals without a screen',
    do: [
      'Hard intervals (4×4): you can only say 2–3 words. Your watch should reach 174+ bpm in the last 1–2 minutes of reps 2–4.',
      'To find ~90 pedal turns per minute: count your right foot for 10 seconds. 15 turns is about right.',
      'Use the same knob position each week. When the reps feel easier, turn it up a little.',
      'The built-in timer (on Today) beeps for every work and rest period.',
    ],
    why: 'Four 4-minute hard efforts raised VO₂max about 7% in 8 weeks in the best-known study. Heart rate takes 1–2 minutes to catch up, so judge the start of each rep by effort, not by the watch.',
    sources: 'Helgerud 2007; Buchheit & Laursen 2013',
  },
  {
    kicker: 'Rowing', title: 'Rowing paces',
    do: [
      'Do the 2,000 m test in week 1. The app then shows your exact pace for every rowing session.',
      'Every Wednesday: 5 minutes at 2:35 per 500 m and note your heart rate. A lower number over the weeks means you\'re fitter.',
      'Easy rows: 20–22 strokes per minute. Legs first, then hips, then arms.',
    ],
    why: 'The rower\'s monitor is accurate, so it is your most reliable fitness test.',
  },
  {
    kicker: 'Strength', title: 'Lifting: 2 upper + 2 lower days',
    do: [
      'Heavy lifts (squat, deadlift, bench, weighted pull-ups): stop each set with 2–3 reps left. When every set feels that easy or easier, add 2.5–5 kg next week.',
      'Muscle sets (leg press, rows, raises, curls, dips…): 1–2 reps short of failure. That closeness is what makes muscle grow.',
      'Each muscle gets about 10 hard sets a week; calves about 12, three times a week, with a pause in the deep stretch at the bottom.',
      'Deload weeks (4, 8, 12): one set less, same weights. Weeks 14–15: 2 sets, same weights.',
      'Log your heaviest squat, deadlift and bench set as weight × reps (Progress → Strength). Goals by March: each up about 5% while you lose 3 kg, strict pull-ups up 20%, 30 single-leg calf raises per leg.',
      'Short on time? The "short on time" switch drops only the optional extras (arms on Monday, dips and curls on Wednesday).',
    ],
    why: 'Around 10+ hard sets per muscle per week builds muscle, and training each muscle twice a week does no harm when the weekly sets are the same. In a calorie deficit muscle gain slows, but strength still rises if the weights stay heavy. Heavy strength work also makes running 2–8% more economical and cuts injuries.',
    sources: 'Schoenfeld 2017, 2019; Pelland 2024; Murphy & Koehler 2022; Kassiano 2023; Blagrove 2018; Lauersen 2014',
  },
  {
    kicker: 'Plyometrics', title: 'Small hops, green days only',
    do: [
      'About 5 minutes of hops before lifting on Tuesday and Thursday: two-foot pogos first, single-leg pogos from week 6.',
      'Never more than about 240 contacts a week, burpee broad jumps included.',
      'Amber day: the hops become calf raises and balance. Red day or return-to-run lock: calf holds.',
      'Nordic hamstring curls on Tuesday start at 2 × 4: the first week makes hamstrings very sore.',
    ],
    why: 'Bone and tendon get stronger from short, quick, varied impacts rather than many slow ones. Hops plus heavy lifting improve running economy more than either alone, and low volumes (under 250 a week) work best. Nordic curls halve hamstring injuries.',
    sources: 'Moran 2023; Llanos-Lagos 2024; Milgrom 2000; Warden 2021; van Dyk 2019',
  },
  {
    kicker: 'Race build-up', title: 'Simulations, Santiago and the taper',
    do: [
      'Half simulations from week 5, a full simulation in week 11.',
      'Santiago (6 March) is a dress rehearsal at about 95% effort: same pacing, gels and gear as Buenos Aires.',
      'The last 2 weeks: about half the training, same intensity. You should feel fresh and a bit restless.',
    ],
    why: 'Cutting training by 40–60% over two weeks while keeping intensity produces the best race performance.',
    sources: 'Bosquet 2007',
  },
  {
    kicker: 'Garmin', title: 'What your watch data does',
    do: [
      'Sleep is pre-filled in your morning check-in.',
      'If your HRV is below your normal range, or your resting heart rate is up by more than 6 bpm, hard days turn easy automatically.',
      'Workouts from your watch tick off the day\'s session.',
      'Progress shows your VO₂max estimate, fitness and fatigue, cadence and easy/hard mix.',
      'Send to Garmin (Today) puts the bike, run and row sessions on your watch with steps and heart-rate targets. In simulations each station is a "press lap" step. Strength stays in the app.',
    ],
    why: 'Using HRV to decide when to go hard reduces the chance of training while under-recovered.',
    sources: 'Plews 2012; Kiviniemi 2007',
  },
];

export const SHINS = [
  {
    kicker: 'What it is', title: 'Shin splints and your soleus',
    do: [
      'Shin splints (doctors call it MTSS) is the shinbone getting overloaded faster than it can adapt.',
      'It usually comes from adding running too fast. Being heavier and having had it before make it more likely.',
      'It gets better with the right amount of load, not with total rest. Expect weeks to a few months.',
    ],
    why: 'In the main treatment study, recovery took about 100–118 days regardless of extras like compression socks.',
    sources: 'Moen 2009, 2012; Hamstra-Wright 2015',
  },
  {
    kicker: 'Every morning', title: 'The traffic light',
    lights: [
      ['green', 'Green', 'Pain 0–1 on your first steps, mild or no tenderness, 10 hops feel fine. Train as planned.'],
      ['amber', 'Amber', 'Pain 2–3 or tender to press. Runs halved and easy, hard runs on the bike, no broad jumps. Two ambers in a row = 2 days without running.'],
      ['red', 'Red', 'Pain 4+, can\'t do 10 hops, or pain at night. No running or jumping; bike and rower only. Running returns after 5 green days.'],
    ],
    why: 'Pain up to about 3/10 that settles by the next morning is acceptable load. More than that, or pain that hangs around, means the bone isn\'t keeping up.',
    sources: 'Silbernagel 2007; Warden 2021',
  },
  {
    kicker: 'Important', title: 'See a doctor if',
    do: [
      'The pain is in one spot about the size of a coin, rather than spread along the shin.',
      'It aches at night or when resting.',
      'You can\'t hop 10 times on that leg, or there\'s swelling.',
      'You\'ve had 3+ red days in a row, or no improvement after 2–3 weeks of less running.',
    ],
    why: 'These can be signs of a stress fracture, which needs an MRI and a different plan.',
    sources: 'Warden 2021; AAFP 2024',
  },
  {
    kicker: 'What helps', title: 'Protect your shins',
    do: [
      'Quicker, shorter steps: about 5–10% more steps per minute than usual. The app shows your cadence from Garmin.',
      'Never make a run more than 10% longer than your longest run in the last 30 days.',
      'Calf and soleus strength: aim for 30 single-leg calf raises per leg (people with shin splints average about 23).',
      'Early runs on a treadmill at 1% incline or on soft, even ground.',
      'Losing 3 kg means about 3% less force on every step.',
    ],
    why: 'Each of these lowers the load on the shinbone per step or per week.',
    sources: 'Heiderscheit 2011; Frandsen 2025; Madeley 2007',
  },
];

export const FOOD = [
  {
    kicker: 'Every day', title: 'The basics',
    do: [
      'Follow the Food tab: it shows today\'s menu (rest day, training day or big day).',
      'Protein: about 200–235 g a day, spread over every meal.',
      'Carbs follow the training: about 260 g on rest days, 370 g on training days, 500 g on big days.',
      'Never do hard intervals on an empty tank: have the snack before training.',
    ],
    why: 'Eating carbs to match the day\'s work keeps hard sessions strong while still letting you lose fat.',
    sources: 'Jäger 2017; Impey 2018',
  },
  {
    kicker: 'Weight', title: '97 → 94 kg',
    do: [
      'Slow and steady: about 0.2 kg a week.',
      'Weigh yourself in the morning and look at the 7-day average, not single days.',
      'Small deficit until week 11, then eat normally to race well.',
      'No dieting in race week.',
    ],
    why: 'Athletes who lost weight slowly kept more muscle and strength than those who lost it fast.',
    sources: 'Garthe 2011',
  },
  {
    kicker: 'Race day', title: 'Fuel for the race',
    do: [
      'Day before: lots of carbs (rice, pasta, bread), salty dinner.',
      '3 hours before: a carb breakfast, about 190 g (rice or oats, banana, honey).',
      '60 minutes before: coffee or caffeine (~290 mg), only if you tried it in training.',
      'During: a gel after the burpees (Run 5) and another on Run 7.',
    ],
    why: 'Caffeine reliably improves performance, and carbs during a 90-minute race help prevent the late fade you had on Run 8.',
    sources: 'Guest 2021; Precision Hydration',
  },
  {
    kicker: 'Warning signs', title: 'When you\'re eating too little',
    do: [
      'Constant tiredness, getting sick often, low mood or low sex drive.',
      'Training getting worse instead of better.',
      'Another bone or shin injury.',
      'If you notice these: eat more and talk to a doctor.',
    ],
    why: 'Eating too little for your training (doctors call it REDs) weakens bones and hormones.',
    sources: 'IOC consensus 2023',
  },
];

export const GLOSSARY = [
  ['VO₂max', 'How much oxygen your body can use at full effort. The bigger your "engine", the faster you can go. The main thing this plan trains.'],
  ['RPE', 'How hard something feels from 1 (very easy) to 10 (all-out). 8–9 = you can only say a few words.'],
  ['Zone 2', 'Easy effort where you can still talk in full sentences. For you about 135–151 bpm.'],
  ['Threshold', 'Comfortably hard: the effort you could hold for about an hour. HYROX is raced close to this.'],
  ['Intervals', 'Hard efforts with easy recovery in between, e.g. 4 × 4 minutes.'],
  ['4×4', '4 minutes hard, 3 minutes easy, repeated 4 times. The classic VO₂max session.'],
  ['30/15', '30 seconds hard, 15 seconds easy, repeated 13 times per set.'],
  ['EMOM', '"Every minute on the minute": do the reps at the start of each minute and rest for what\'s left.'],
  ['Brick', 'Two activities back to back, e.g. lunges straight into a run, to practise racing on tired legs.'],
  ['Simulation', 'A practice race: runs and stations in race order.'],
  ['Deload', 'A lighter week (4, 8 and 12) so your body can absorb the training.'],
  ['Taper', 'The last 2 weeks before the race: less training so you arrive fresh.'],
  ['Roxzone', 'The transition area between the running track and each station.'],
  ['BBJ', 'Burpee broad jump.'],
  ['HRV', 'Heart rate variability: tiny changes in time between heartbeats, measured by your watch at night. Higher than your normal usually means well recovered.'],
  ['Resting HR', 'Your heart rate at rest. A jump of 6+ bpm above your normal can mean fatigue or illness.'],
  ['Cadence', 'Steps per minute when running. A few more, shorter steps are kinder to the shins.'],
  ['Fitness / fatigue / form', 'From your training load: fitness = last ~6 weeks, fatigue = last week, form = fitness − fatigue. Negative in hard weeks, positive when rested.'],
  ['Benchmark', 'A repeatable test (e.g. 2 km row) to check whether you\'re improving.'],
  ['Shin splints (MTSS)', 'Pain along the inside of the shinbone from too much running load.'],
  ['Stress fracture', 'A small crack in the bone from overload. Pain in one spot, often at night. Needs a doctor.'],
  ['Soleus', 'The deep calf muscle under the main calf. It absorbs a lot of running load; strong soleus = less stress on the shin.'],
];
