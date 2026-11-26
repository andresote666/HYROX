/* Library content. Condensed from research/01–03 (full reports with every source live in /research).
   [n] markers refer to SOURCES below. Labels: evidence = peer-reviewed; coach = practitioner opinion. */

const c = n => `<span class="cite">${n}</span>`;

export const STATIONS = [
  {
    id: 'bbj', name: 'Burpee broad jump', spec: '80 m · bodyweight', rio: '10:03', target: '6:45',
    body: `
      <p><strong>Biggest single gain in your race: −3:18.</strong> Rep count only depends on jump length. At 193 cm a repeatable fatigued jump of 1.9–2.1 m means <strong>38–42 reps</strong>; don't chase 2.4 m+${c(33)}.</p>
      <h4>Technique (coach consensus)</h4>
      <ul>
        <li><strong>Step down, step up.</strong> At 97 kg a jump-back and jump-in adds about 80 loaded impacts over 80 m and spikes HR${c(33)}${c(35)}. Coming up via one knee is legal (2025/26)${c(9)}.</li>
        <li>Jump <strong>out, not up</strong>: chest slightly forward, hips drive, arms swing forward. Land soft, feet under you${c(34)}.</li>
        <li>Sub-maximal jumps: 15 small reps take about as long as 10 max reps and leave you much fresher${c(35)}.</li>
        <li>Rhythm: ~5–6 s per rep, then 2–3 breaths right after landing. 6:45 ≈ <strong>one rep every 10 s</strong>. Chunk it: 4 × 20 m of ~10 reps, ~1:40 each.</li>
        <li>Breathing: exhale on the drop, inhale on the push-up, exhale hard on the jump${c(34)}.</li>
      </ul>
      <h4>Rules 2026/27</h4>
      <ul><li>Chest to floor, hands ≤30 cm ahead of toes, two-foot take-off and landing (5 cm stagger allowed), no shuffle steps. Warning, then +15 s each${c(20)}.</li></ul>
      <h4>Shin-safe training</h4>
      <ul><li>Cap jump contacts (start ~40/week, +10–20 only after green mornings). Jump on mats or turf. Build most capacity with no-jump burpees, KB swings and bike sprints.</li></ul>`,
  },
  {
    id: 'wb', name: 'Wall balls', spec: '100 reps · 6 kg · 3.00 m', rio: '9:04', target: '6:30',
    body: `
      <p>Wall balls drew the <strong>highest HR, lactate and effort</strong> of the whole race in the only lab study of HYROX (Brandt 2025)${c(1)}. A rep takes ~2.3–2.5 s, so 100 reps is ~4:00 of work; at 9:04 you rested about 5 minutes.</p>
      <h4>Tall-athlete advantage</h4>
      <ul>
        <li>Your standing reach is ~2.5 m, so the ball only needs ~0.5 m of flight. <strong>Throw only as high as the target</strong>: extra height costs energy and makes the catch unpredictable${c(10)}.</li>
        <li>The cost: long femurs = longer squat to get hips below knees. Slightly wider stance, toes out, stand ~an arm's length from the wall${c(10)}${c(11)}.</li>
        <li>Catch <strong>into</strong> the next squat (stretch-shortening cycle). Elbows under the ball, ball close to the chest. Legs throw, arms finish.</li>
      </ul>
      <h4>Set plan</h4>
      <ul>
        <li>Planned sets beat "go unbroken until failure": a forced break costs 30–60 s${c(12)}.</li>
        <li>Weeks 1–8: 15-15-15-12-12-10-10-11, max 10 breaths each. Weeks 9+: <strong>5 × 20, ≤10 s rest, ball never down</strong>.</li>
        <li>If the ball drops you must stand tall before the next squat.</li>
      </ul>`,
  },
  {
    id: 'pull', name: 'Sled pull', spec: '50 m · 103 kg incl. sled', rio: '6:42', target: '5:10',
    body: `
      <p>Your pull is 33% slower than your push; elites are ~18% slower${c(16)}. Long arms + long legs favour a <strong>hip-driven walk-back</strong> for the first 8–10 m of each length, then hand-over-hand from a wide, low, flat-footed squat${c(13)}.</p>
      <ul>
        <li>Keep the rope tight from the first pull; slack wastes a pull. Throw rope to the side, never behind you.</li>
        <li>Short breaks: keep hold of the rope. Re-tensioning costs more than a 2 s pause.</li>
        <li>Don't step on the front line of the box. Event chalk only at this station.</li>
        <li>Train 10–15% heavier than race weight: race carpet over concrete is draggier than gym turf${c(14)}.</li>
      </ul>`,
  },
  {
    id: 'push', name: 'Sled push', spec: '50 m · 152 kg incl. sled', rio: '5:03', target: '3:55',
    body: `
      <ul>
        <li>Tall athletes often do best <strong>arms long, body near parallel</strong>; test it against bent-arm and pick one before race day${c(15)}.</li>
        <li>Short, powerful steps through the toes. Hands low so force goes forward, not down.</li>
        <li><strong>Never stop mid-length:</strong> restarting a static sled costs far more than keeping it moving. If you must stop, reset posture fully and restart explosively.</li>
        <li>Face the direction of travel (2026/27 rule). Test your race shoes on a sled for grip.</li>
      </ul>`,
  },
  {
    id: 'lunge', name: 'Sandbag lunges', spec: '100 m · 20 kg', rio: '6:23', target: '5:35',
    body: `
      <ul>
        <li>Upright, bag high on the shoulders, steady rhythm, knee kisses the floor. No rest at 50 m.</li>
        <li>Drops now cost 15 s each, no warnings (2026/27).</li>
        <li>Lunge time showed almost no link to Run 8 in a large data set; wall-ball time did (r≈0.74)${c(18)}. So don't sandbag the lunges out of fear of Run 8: fix Run 8 with fuel and bricks.</li>
      </ul>`,
  },
  {
    id: 'rox', name: 'Roxzone', spec: '16 transitions', rio: '7:46', target: '6:30',
    body: `
      <ul>
        <li>Your Roxzone is ~130% of an average 1 km split; elites spend ~75%. Aim for 90%${c(16)}.</li>
        <li><strong>Floor is lava:</strong> jog every metre in and out. 20 s faster per transition × 16 = 5 minutes.</li>
        <li>Learn the venue map (out 2–3 days before). Know your lane for each station.</li>
        <li>Sip, don't stop. Gloves on or off before you reach the station.</li>
      </ul>`,
  },
  {
    id: 'run8', name: 'Run 8 & compromised running', spec: '1 km after lunges', rio: '8:19', target: '6:05',
    body: `
      <p>Your Run 8 was 2:36 slower than your mid-race average; the median Open man loses only ~36 s. That points to fuel and fatigue, not a fitness ceiling.</p>
      <ul>
        <li><strong>Fuel:</strong> gel at Run 5 and a gel or carb sip at Run 7, so carbs land before the final 20 minutes${c(25)}.</li>
        <li><strong>Pacing:</strong> even effort, not negative splits. Run 1 "too easy". Run 8: 200 m shuffle, then 80%.</li>
        <li><strong>Training:</strong> lunges → 1 km → wall balls bricks (week 10), half sims finishing with wall balls. When shins are amber, the 1 km becomes 4 min bike at threshold (Brandt et al. suggest substituting rowing or skiing for running volume)${c(1)}.</li>
      </ul>`,
  },
  {
    id: 'ski', name: 'SkiErg, row, farmers', spec: 'Your strengths', rio: '4:25 · 4:45 · 1:45', target: '4:20 · 4:35 · 1:42',
    body: `
      <p>All three are at or better than the Open Men median (ski 4:31, row 4:51, farmers 2:10). <strong>Hold them, don't invest here.</strong> No SkiErg at your gym: the plan uses 1,000 m rows at damper 7 or band ski pulls as the substitute. Do a few real SkiErg sessions if you can borrow one before March.</p>`,
  },
];

export const SCIENCE = [
  {
    id: 'what', title: 'What predicts a fast HYROX',
    body: `
      <p>In the only physiological study of a simulated HYROX race (n=11), faster times correlated with <strong>higher VO₂max (ρ −0.71)</strong>, more endurance training and <strong>lower body fat (ρ 0.67)</strong>. Grip strength and muscle mass did not${c(1)}. About 80% of the race was spent above 90% HRmax.</p>
      <p>At 1:30 you would be about the <strong>median Open man in 35–39</strong> (median 1:27:25, n≈81,000)${c(17)}. Your running is already near 1:30 pace; most of the gap is stations, Run 8 and Roxzone.</p>`,
  },
  {
    id: 'vo2', title: 'VO₂max on the bike and rower',
    body: `
      <ul>
        <li><strong>4×4 min at 90–95% HRmax</strong>, 3 min easy: +7.2% VO₂max in 8 weeks (Helgerud 2007)${c(2)}.</li>
        <li><strong>30/15 × 13 × 3</strong> (Rønnestad): beat effort-matched long intervals for aerobic power${c(3)}.</li>
        <li>Long (≥2 min), high-volume (≥15 min) intervals gave the largest VO₂max gains (Wen 2019 meta-analysis)${c(4)}.</li>
        <li>Expect about <strong>+4–8% VO₂max</strong> in 12–16 weeks; losing 3 kg adds ~3% more per kg.</li>
        <li><strong>Pyramidal</strong> distribution suits recreational athletes: ~75–80% easy, 10–15% threshold, 5–10% VO₂max (Rosenblat 2025)${c(5)}.</li>
        <li>HR lags 1–2 min: steer intervals by watts, split and RPE; use HR only to confirm (≥90% HRmax late in reps).</li>
      </ul>`,
  },
  {
    id: 'transfer', title: 'Does bike fitness carry over to running?',
    body: `
      <p>Mostly yes for the heart and blood (central) adaptations. Replacing half the running with cycling for 5 weeks kept VO₂max and 5 km times (Mutton 1993)${c(6)}; bike intervals improved a run-off-the-bike 5 km in triathletes (Etxebarria 2014)${c(7)}.</p>
      <p>What the bike can't do: running economy, and bone and tendon tolerance to 8 km of running. That's why the plan keeps three short runs a week, on alternate days, rebuilt gradually.</p>`,
  },
  {
    id: 'strength', title: 'Strength without wrecking endurance',
    body: `
      <ul>
        <li>Concurrent training does not blunt strength or muscle; explosive strength suffers only when both are in the same session (Schumann 2022, 43 studies)${c(8)}. Keep hard intervals and heavy lifting ≥6 h apart.</li>
        <li>Strength training improves running economy 2–8% (Blagrove 2018)${c(19)}.</li>
        <li>Targets at 97 kg: squat 100 kg × 5, trap-bar deadlift 140–150 kg × 5, 10 strict pull-ups, 30 single-leg heel raises.</li>
      </ul>`,
  },
  {
    id: 'taper', title: 'Taper',
    body: `<p>The best strategy in the Bosquet 2007 meta-analysis: a ~2-week taper, volume cut 41–60%, <strong>intensity and frequency kept</strong>${c(21)}. Hardest session at least 7 days out; Santiago (14 days out) fits that.</p>`,
  },
];

export const SHINS = `
  <p><strong>Medial tibial stress syndrome</strong> is a bone stress reaction along the inner shin, at the early end of a continuum toward stress fracture${c(22)}. Your risk factors: higher body mass, prior MTSS, and a recent jump in running volume${c(23)}.</p>
  <h4>Daily traffic light (used by the app)</h4>
  <ul>
    <li><strong style="color:var(--green)">Green</strong>: first-steps pain 0–1, shin tenderness ≤2 and diffuse, 10 hops with pain ≤2, yesterday's run ≤3 and settled. Run as planned.</li>
    <li><strong style="color:var(--amber)">Amber</strong>: pain 2–3, tenderness 3–4, hop pain 3–4, or soreness not settled. No progression; easy runs halved on a treadmill, hard runs moved to the bike, no broad jumps. <strong>Two ambers in a row = two days without running.</strong></li>
    <li><strong style="color:var(--red)">Red</strong>: pain ≥4, tenderness ≥5 or a focal spot, can't hop 10, pain at rest or night. No impact. Bike and rower only. Running unlocks after <strong>5 green days</strong>, one stage lower.</li>
  </ul>
  <h4>See a doctor (MRI) if</h4>
  <ul><li>Pain in one coin-sized spot on the bone, night or rest pain, you can't hop, swelling, red for more than 3 days, or no improvement after 2–3 weeks of reduced load${c(24)}.</li></ul>
  <h4>What helps</h4>
  <ul>
    <li><strong>Graded load is the core treatment.</strong> No single therapy is proven; full recovery took ~100–118 days in the main trial${c(22)}.</li>
    <li>Raise cadence 5–10% at the same speed: less braking and joint loading. You don't need 180 spm at 193 cm.</li>
    <li>No single run more than 10% longer than your longest run in the last 30 days (Frandsen 2025, n≈5,200)${c(26)}.</li>
    <li>Calf capacity: MTSS athletes manage ~23 single-leg heel raises vs ~33 in healthy controls. Goal: 30 per side${c(27)}.</li>
    <li>Each kg lost cuts load per step ~1%: 3 kg ≈ 3% less force on every one of ~6,000 race steps.</li>
  </ul>`;

export const FUEL = `
  <ul>
    <li><strong>Rate:</strong> 97 → 94 kg by mid-March is ~0.2 kg/week, well under the 0.7%/week that preserved performance in athletes (Garthe 2011)${c(28)}. Small deficit (~300 kcal) through week 11, maintenance after.</li>
    <li><strong>Protein:</strong> 1.8–2.2 g/kg (≈175–210 g), 4–5 meals of 30–40 g${c(29)}.</li>
    <li><strong>Carbs by the day:</strong> hard days 5–7 g/kg, easy days 3–5 g/kg. Never do intervals low on carbs${c(30)}.</li>
    <li><strong>Energy availability:</strong> your large lean mass means even maintenance is only ~33–37 kcal/kg FFM. Don't stack big deficits on hard days. Fatigue, low libido, frequent illness or another bone injury → eat more and see a doctor (REDs, IOC 2023)${c(31)}.</li>
    <li><strong>Calibrate:</strong> use the 7-day average. Losing <0.15 kg/week: −150 kcal/day. >0.4 kg/week: +150–200 kcal/day.</li>
  </ul>
  <h4>Race day</h4>
  <ul>
    <li>Day before: 6–8 g/kg carbs. 3 h before: ~2 g/kg (≈190 g), low fibre. Caffeine ~290 mg (3 mg/kg) 60 min before, only if rehearsed${c(32)}.</li>
    <li>During: 30–60 g/h → gel at Run 5, gel or carb sip at Run 7. Sip in the Roxzone, don't stop.</li>
  </ul>`;

export const GARMIN = `
  <p>Garmin doesn't let personal apps read its data directly, so the app reads it through <strong>intervals.icu</strong>, a free training site with an official Garmin sync. Your key stays in Vercel, never in the public repo.</p>
  <h4>One-time setup (about 5 minutes)</h4>
  <ul>
    <li><strong>intervals.icu:</strong> create a free account, then Settings → connect <strong>Garmin Connect</strong>. Tick the options to download activities <em>and</em> wellness (HRV, sleep, resting HR, weight).</li>
    <li>Still in intervals.icu Settings, scroll to <strong>Developer Settings</strong> and copy your <strong>API key</strong>.</li>
    <li><strong>Vercel</strong> → your hyrox project → Settings → Environment Variables. Add <span class="mono">INTERVALS_API_KEY</span> (the key) and <span class="mono">SYNC_TOKEN</span> (any long password you invent). Then Deployments → ⋯ → Redeploy.</li>
    <li><strong>In this app:</strong> Settings (gear) → Garmin → paste the same SYNC_TOKEN → Connect.</li>
  </ul>
  <h4>What it changes</h4>
  <ul>
    <li>Sleep pre-filled in the morning check-in; HRV, resting HR and sleep shown on Today.</li>
    <li><strong>HRV readiness:</strong> 7-day average of ln(rMSSD) against your 60-day baseline ± 0.5 SD. Below the band, the day's hard session becomes easy (Plews 2012; Kiviniemi 2007)${c(36)}. Needs 14 days of readings.</li>
    <li>Resting HR more than 6 bpm above your week also turns hard sessions easy.</li>
    <li>Synced workouts tick off the day's session, and VO₂max days show whether you reached 90% of max HR.</li>
    <li>Real running data enforces the rule of no run more than 10% longer than your longest in 30 days${c(26)}.</li>
    <li>Weight from a Garmin scale fills the weight trend on days you don't log by hand.</li>
    <li><strong>VO₂max:</strong> Garmin's estimate (from outdoor runs with GPS + HR) charted in Progress, with the change since week 0. It's the number the whole plan is built to raise.</li>
    <li><strong>Fitness, fatigue and form:</strong> intervals.icu's 6-week load (fitness), last-week load (fatigue) and form = fitness − fatigue. Expect −10 to −25 in build weeks and +5 to +15 on race day after the taper.</li>
    <li><strong>Running cadence:</strong> your usual steps per minute and a +5–10% target for easy runs, with a nudge on Today when a run comes in below it.</li>
    <li><strong>Intensity mix:</strong> last 7 days of easy / moderate / hard minutes from each workout's heart-rate zones, against the 75–80 / 10–15 / 5–10 target.</li>
    <li>Body fat % from a Garmin Index scale, plus sleep score.</li>
  </ul>
  <p>The app syncs when you open it (at most every 30 minutes) and from Progress → Sync. If intervals.icu changes what Garmin data it shares, the rest of the app keeps working without it.</p>`;

export const SOURCES = [
  ['Brandt et al. 2025, Front Physiol: physiological responses and performance determinants in HYROX', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11994925/'],
  ['Helgerud et al. 2007, MSSE: aerobic high-intensity intervals improve VO₂max', 'https://pubmed.ncbi.nlm.nih.gov/17414804/'],
  ['Rønnestad et al. 2015 & 2020, SJMSS: short vs long intervals', 'https://doi.org/10.1111/sms.12165'],
  ['Wen et al. 2019, J Sci Med Sport: HIIT protocols for VO₂max (meta-analysis)', 'https://pubmed.ncbi.nlm.nih.gov/30733142/'],
  ['Rosenblat et al. 2025, Sports Med: intensity distribution network meta-analysis', 'https://doi.org/10.1007/s40279-024-02149-3'],
  ['Mutton et al. 1993, MSSE: run vs cycle/run training', 'https://scilit.com/publications/1a40494a52791432275d92b16ecbf323'],
  ['Etxebarria et al. 2014, Eur J Sport Sci: cycle intervals improve running', 'https://researchprofiles.canberra.edu.au/en/publications/high-intensity-cycle-interval-training-improves-cycling-and-runni/'],
  ['Schumann et al. 2022, Sports Med: concurrent training meta-analysis', 'https://researchonline.jcu.edu.au/71546/'],
  ['Roxlyfe: 2025/26 rulebook changes', 'https://roxlyfe.com/2025-26-rulebooks/'],
  ['Roxlyfe: HYROX wall balls guide', 'https://roxlyfe.com/hyrox-wall-balls-guide/'],
  ['PureGym: HYROX wall ball', 'https://www.puregym.com/blog/hyrox-wall-ball/'],
  ['HyroxDataLab: wall-ball strategy (search summary)', 'https://hyroxdatalab.com/articles/wall-balls-strategy'],
  ['Velites: sled pull guide', 'https://eu.velitessport.com/blogs/hyrox-velites-training-program/sled-pull-guide-technique-strategy'],
  ['Prommer: sled push tips', 'https://prommer.net/en/training/hyrox/tips/sled-push-tips/'],
  ['Velites: sled push guide', 'https://eu.velitessport.com/blogs/hyrox-velites-training-program/sled-push-guide-technique-strategy'],
  ['Roxlyfe: HYROX average vs elite splits', 'https://roxlyfe.com/hyrox-from-average-to-elite/'],
  ['roxpace.app: HYROX benchmarks by age group', 'https://www.roxpace.app/benchmarks'],
  ['HyroxDataLab: sandbag lunge strategy (search summary)', 'https://hyroxdatalab.com/articles/sandbag-lunges-strategy'],
  ['Blagrove et al. 2018, Sports Med: strength training and distance running', 'https://link.springer.com/article/10.1007/s40279-017-0835-7'],
  ['Hybrid Fitness Media: HYROX competition standards 2026/27', 'https://hybridfitnessmedia.com/2026/06/24/hyrox-competition-standards-2026-27-season/'],
  ['Bosquet et al. 2007, MSSE: effects of tapering (meta-analysis)', 'https://pubmed.ncbi.nlm.nih.gov/17762369/'],
  ['Moen et al. 2009 review & 2012 RCT: medial tibial stress syndrome', 'https://pubmed.ncbi.nlm.nih.gov/22464032/'],
  ['Hamstra-Wright et al. 2015, BJSM: MTSS risk factors (meta-analysis)', 'https://bjsm.bmj.com/content/early/2014/09/03/bjsports-2014-093462.short'],
  ['Warden et al. 2021, JOSPT: bone stress injury management and return to run', 'https://scholarworks.indianapolis.iu.edu/items/0315cf2c-647a-4e9b-9933-651656a73272'],
  ['Precision Hydration: fuelling a HYROX race', 'https://www.precisionhydration.com/performance-advice/nutrition/how-to-fuel-and-hydrate-a-hyrox-competition/'],
  ['Frandsen et al. 2025, BJSM: high-risk running sessions (n≈5,200)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12421110'],
  ['Madeley et al. 2007, J Sci Med Sport: plantar-flexor endurance in MTSS', 'https://pubmed.ncbi.nlm.nih.gov/17336155/'],
  ['Garthe et al. 2011, IJSNEM: weight-loss rate in athletes', 'https://doi.org/10.1123/ijsnem.21.2.97'],
  ['Jäger et al. 2017, ISSN position stand: protein', 'https://pubmed.ncbi.nlm.nih.gov/28642676/'],
  ['Impey et al. 2018, Sports Med: fuel for the work required', 'https://pubmed.ncbi.nlm.nih.gov/29453741/'],
  ['Mountjoy et al. 2023, BJSM: IOC consensus on REDs', 'https://pubmed.ncbi.nlm.nih.gov/37752011/'],
  ['Guest et al. 2021, ISSN position stand: caffeine', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7777221/'],
  ['Roxlyfe: HYROX burpee broad jumps guide', 'https://roxlyfe.com/hyrox-burpee-broad-jumps-guide'],
  ['BoxRox: 3 hacks for more efficient burpee broad jumps', 'https://www.boxrox.com/3-hacks-for-more-efficient-burpee-broad-jumps-in-hyrox/'],
  ['Boxlife Magazine: HYROX pacing secrets (sled push, burpee jumps)', 'https://boxlifemagazine.com/hyrox-pacing-secrets-sled-push-burpee-jumps/'],
  ['Plews et al. 2012, Eur J Appl Physiol: HRV in elite triathletes (7-day rolling lnRMSSD)', 'https://pubmed.ncbi.nlm.nih.gov/22367011/'],
];

export const TIPS = [
  'Run 1 should feel too easy. Elite men pace almost evenly; average men start too fast and pay on Run 8.',
  'Wall balls: throw only as high as the target. At 193 cm you need about 0.5 m of ball flight above your hands.',
  'BBJ: step down, step up, breathe after landing. About one rep every 10 seconds gets you 6:45.',
  'The Roxzone floor is lava. Jogging every transition instead of walking saves about 5 minutes over 16 transitions.',
  'Shins: no single run more than 10% longer than your longest run in the last 30 days.',
  'Steer VO₂max intervals by watts and effort. Heart rate takes 1–2 minutes to catch up.',
  'Sled pull: keep the rope tight from the first pull and throw it to the side, never behind you.',
  'Protein at every meal: 30–40 g, 4–5 times a day, protects muscle while you lose those 3 kg.',
  'Raising cadence 5–10% at the same pace cuts braking and joint load. Short, quick steps on tired legs.',
  'Never do intervals low on carbs. Fuel the hard days, trim on the easy ones.',
  'Wall balls: decide the set plan before the race and count rests out loud. Unplanned breaks cost 30–60 s.',
  'Sled push: restarting a stopped sled costs far more than keeping it moving. Short steps, low line.',
  'Sleep under 6 h two nights in a row? Turn the next hard session into Zone 2.',
  'Gel at Run 5, gel or carb sip at Run 7: carbs should land before lunges, Run 8 and wall balls.',
];
