/* Daily shin / soleus check-in → traffic light → session adaptation.
   Based on the pain-monitoring model (Silbernagel et al. 2007; Thomeé 1997):
   pain during loading ≤ 2–3/10 that settles by next morning is acceptable;
   higher or non-settling pain means the tissue is not tolerating the load.
   Focal bony tenderness, night/rest pain or painful hopping are red flags
   for a bone stress injury (not just MTSS) → stop impact, see a clinician. */

export const STATUS = {
  green: {
    id: 'green', label: 'Green', title: 'Full plan',
    summary: 'Shins are coping. Run and jump as written, with quick steps and soft surfaces.',
  },
  yellow: {
    id: 'yellow', label: 'Amber', title: 'Modified',
    summary: 'No progression today. Easy running cut in half on a treadmill, hard run reps moved to the bike, broad jumps become step-outs.',
  },
  red: {
    id: 'red', label: 'Red', title: 'Protect',
    summary: 'No running, no jumping today. Same engine work on the bike and rower. Calf work as isometric holds.',
  },
};

export function scoreCheckin(c) {
  if (!c) return null;
  const n = v => (v === null || v === undefined || v === '' ? null : Number(v));
  const morning = n(c.morning) ?? 0;
  const palpation = n(c.palpation) ?? 0;
  const hop = n(c.hop);                 // null = skipped
  const runPain = n(c.runPain);         // highest pain during yesterday's run, null = no run
  const reasons = [];
  let status = 'green';
  const flag = (s, why) => {
    reasons.push(why);
    if (s === 'red' || (s === 'yellow' && status === 'green')) status = s;
  };

  // RED: any one triggers (Warden 2021; AAFP 2024; NHS MTSS guideline)
  if (c.focal) flag('red', 'Pain in one spot on the bone, or at rest or night: possible bone stress injury');
  if (c.hopFail) flag('red', 'Could not finish 10 single-leg hops');
  if (morning >= 4) flag('red', `First-steps pain ${morning}/10`);
  if (palpation >= 5) flag('red', `Shin tenderness ${palpation}/10`);
  if (hop !== null && hop >= 5) flag('red', `Hop test pain ${hop}/10`);
  if (runPain !== null && runPain > 5) flag('red', `Yesterday's run reached ${runPain}/10`);

  // AMBER
  if (morning >= 2 && morning <= 3) flag('yellow', `First-steps pain ${morning}/10`);
  if (palpation >= 3 && palpation <= 4) flag('yellow', `Shin tenderness ${palpation}/10`);
  if (hop !== null && hop >= 3 && hop <= 4) flag('yellow', `Hop test pain ${hop}/10`);
  if (runPain !== null && runPain >= 4 && runPain <= 5) flag('yellow', `Yesterday's run reached ${runPain}/10`);
  if (c.settled === false) flag('yellow', "Yesterday's soreness had not settled by this morning");
  if (hop === null && !c.hopFail) flag('yellow', 'Hop test skipped, so the app assumes amber');

  // Systemic readiness (sleep + energy): changes intensity, not tissue status
  const sleep = Number(c.sleep ?? 7.5);
  const energy = Number(c.energy ?? 3);
  let readiness = 'normal';
  if (sleep < 6 || energy <= 2) readiness = 'low';
  else if (sleep >= 7.5 && energy >= 4) readiness = 'high';

  const max = Math.max(morning, palpation, hop ?? 0, runPain ?? 0);
  return { status, readiness, max, reasons };
}

/* Running gate across days (Warden 2021 return-to-run; research §C5):
   - 2 amber days in a row → no running for the next 2 days
   - after any red day → no running until 5 consecutive green days */
export function runGate(checkins, todayKey) {
  const keys = Object.keys(checkins).filter(k => k <= todayKey).sort().reverse();
  const st = keys.map(k => checkins[k]?.status);
  const lastRed = st.indexOf('red');
  if (lastRed !== -1) {
    const greensSince = st.slice(0, lastRed).filter(s => s === 'green').length;
    const allGreen = st.slice(0, lastRed).every(s => s === 'green');
    if (lastRed === 0 && keys[0] === todayKey) return { allow: false, why: 'Red today: no running or jumping.' };
    if (!(allGreen && greensSince >= 5)) {
      return { allow: false, why: `Return-to-run lock after a red day: ${greensSince}/5 green days logged. Restart one stage lower when it unlocks.` };
    }
  }
  for (let i = 0; i <= 2; i++) {
    if (st[i] === 'yellow' && st[i + 1] === 'yellow') {
      return { allow: false, why: 'Two amber days in a row: two days without running. Bike and rower instead.' };
    }
  }
  return { allow: true, why: '' };
}

/* consecutive-day red counter — 3+ reds in a row → see a physio */
export function redStreak(checkins, todayKey) {
  const keys = Object.keys(checkins).filter(k => k <= todayKey).sort().reverse();
  let n = 0;
  for (const k of keys) {
    if (checkins[k]?.status === 'red') n++; else break;
  }
  return n;
}

/* ── adaptation engine ── */
const clone = o => JSON.parse(JSON.stringify(o));

function halveDose(dose) {
  // "40 min" → "20 min", "8 km" → "4 km"; anything else gets a note
  const m = String(dose).match(/^(\d+(?:\.\d+)?)\s*(min|km|m)\b(.*)$/);
  if (!m) return `${dose} (half)`;
  const v = Math.max(1, Math.round(Number(m[1]) / 2 * 10) / 10);
  return `${v} ${m[2]}${m[3]}`;
}

function adaptItem(item, status) {
  const out = clone(item);
  const explicit = item.alt?.[status];
  if (explicit) {
    return { ...out, ...explicit, adapted: true, original: item.name };
  }
  if (status === 'green') return out;

  if (item.mode === 'run') {
    if (status === 'red') {
      return {
        ...out, mode: 'bike', adapted: true, original: item.name,
        name: item.hard ? 'Bike: same intervals' : 'Bike: same time',
        detail: item.hard
          ? `Same work:rest and HR target as the run. ${item.detail || ''}`.trim()
          : 'Same minutes, same HR zone, 85–95 rpm.',
        dose: item.minutes ? `${item.minutes} min` : item.dose,
      };
    }
    // yellow
    if (item.hard) {
      return {
        ...out, mode: 'bike', adapted: true, original: item.name,
        name: 'Bike: hard reps moved off feet',
        detail: `Do the hard reps on the bike. Add an easy 10–15 min treadmill jog afterwards only if it is ≤ 2/10. ${item.detail || ''}`.trim(),
      };
    }
    return {
      ...out, adapted: true, original: item.name,
      name: `${item.name} (half)`,
      dose: halveDose(item.dose),
      detail: 'Flat surface or treadmill at 1%, cadence +5–10%, stop if pain > 3/10. Finish the rest of the time on the bike.',
    };
  }

  if (item.mode === 'jump') {
    if (status === 'red') {
      return {
        ...out, mode: 'station', adapted: true, original: item.name,
        name: 'Burpee to step-out (no jump), or row',
        detail: 'Burpee, then STEP the feet forward instead of jumping. If even this hurts, row the same minutes at the same effort.',
      };
    }
    return {
      ...out, adapted: true, original: item.name,
      name: `${item.name}, step-outs`,
      detail: 'Keep the burpee, replace the broad jump with two long walking lunges. Cuts landing load by roughly two thirds.',
    };
  }

  if (item.mode === 'calf' && status === 'red') {
    return {
      ...out, adapted: true, original: item.name,
      name: 'Isometric calf holds',
      detail: 'Seated + standing calf-raise holds at mid-range, 5 × 45 s each, about 70% effort. Calms pain while keeping the soleus loaded.',
      dose: '5 × 45 s',
    };
  }

  return out;
}

export function adaptSession(session, status = 'green', readiness = 'normal', { runLocked = false } = {}) {
  if (!session) return { session, notes: [] };
  const s = clone(session);
  const notes = [];
  let changed = 0;

  s.blocks = s.blocks.map(b => ({
    ...b,
    items: b.items.map(it => {
      const locked = runLocked && it.mode === 'run';
      const a = adaptItem(it, locked ? 'red' : status);
      if (a.adapted && !locked) changed++;
      return a;
    }),
  }));
  if (changed) notes.push(`${changed} item${changed > 1 ? 's' : ''} adapted for ${STATUS[status].label.toLowerCase()} shins`);

  if (readiness === 'low' && ['vo2', 'threshold', 'sim'].includes(s.kind)) {
    s.lowReadiness = true;
    notes.push('Low readiness: do the first half of the main set, then switch to Zone 2. Quality beats grinding.');
  }
  if (runLocked && status !== 'red') notes.push('Running is locked today by the return-to-run rules, so runs move to the bike.');
  if ((status === 'red' || runLocked) && s.timer?.mode === 'run') s.timer.mode = 'bike';
  return { session: s, notes };
}
