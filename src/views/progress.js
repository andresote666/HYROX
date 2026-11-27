import { store, dayKey, addDays, parseDay, latestWeight } from '../store.js';
import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { lineChart, painBars } from '../ui/charts.js';
import { activeBenchmarks, benchTarget } from '../data/benchmarks.js';
import { fmtSec } from '../data/results.js';
import { weightTrend, latestBench, firstBench } from '../logic/personalize.js';
import { runGate } from '../logic/readiness.js';
import { weekDays, currentWeek, DELOAD } from '../data/plan.js';
import { weekLoad, loadSpike, spikeText } from '../logic/load.js';
import { maxHRInsight, shinLimit, calorieAdjust } from '../logic/learn.js';
import { resolveDay } from '../logic/day.js';
import { sessionFor } from '../data/plan.js';
import { hrvStatus, runLoad, syncAgo, syncConfigured, vo2Trend, loadForm, cadenceInfo, intensityMix, latestBodyFat } from '../logic/sync.js';

const fmtVal = (b, v) => (v === null || v === undefined ? '—' : b.unit === 'time' ? fmtSec(v) : b.unit === 'watts' ? `${Math.round(v)} W` : b.unit === 'bpm' ? `${Math.round(v)} bpm` : b.unit === 'e1rm' ? `${Math.round(v)} kg` : `${Math.round(v * 10) / 10}`);
const shortDate = k => parseDay(k).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

function weightCard() {
  const trend = weightTrend();
  const target = store.profile.targetWeightKg;
  const now = latestWeight();
  const avg = trend.length ? trend[trend.length - 1].avg : now;
  const goalDate = new Date(2027, 2, 13);
  const weeksLeft = Math.max(1, (goalDate - new Date()) / (7 * 86400000));
  const rate = (avg - target) / weeksLeft;
  return `
    <section class="card rise" style="--i:1" aria-label="Weight">
      <div class="row between">
        <div><div class="eyebrow">Body weight · 7-day average</div>
          <div class="row" style="gap:8px;align-items:baseline;margin-top:2px"><span class="num" style="font-size:28px;font-weight:600">${avg.toFixed(1)}</span><span class="small">kg → ${target}</span>${(() => { const bf = latestBodyFat(); return bf ? `<span class="chip" style="margin-left:4px">${bf.value}% body fat</span>` : ''; })()}</div></div>
        <button class="btn btn-primary btn-sm" data-act="sheet" data-type="weight">${icons.plus} Log</button>
      </div>
      <div style="margin-top:14px">
        ${trend.length >= 2 ? lineChart(trend.slice(-60).map(t => ({ x: shortDate(t.date), y: t.avg })), { target }) : `<div class="empty" style="padding:14px 0">${icons.scale}<p class="small">Log your morning weight 3–7× a week. The trend line appears after two entries.</p></div>`}
      </div>
      <p class="small" style="margin-top:10px">${avg > target ? `Needed: <b style="color:var(--text)">${rate.toFixed(2)} kg/week</b> to reach ${target} kg by 13 March. The research-safe range is up to ~0.7% of body weight a week (≈0.65 kg); slower protects performance.` : 'At target. Eat at maintenance from here and fuel the work.'}</p>
    </section>`;
}

function shinCard() {
  const today = dayKey();
  const days = Array.from({ length: 14 }, (_, i) => {
    const k = dayKey(addDays(new Date(), i - 13));
    const c = store.checkins[k];
    return { label: parseDay(k).getDate(), v: c ? Math.max(c.morning || 0, c.palpation || 0, c.hop || 0, c.runPain || 0) : null, status: c?.status };
  });
  const logged = days.filter(d => d.v !== null);
  const count = s => days.filter(d => d.status === s).length;
  const gate = runGate(store.checkins, today);
  const todayC = store.checkins[today];
  const headline = !logged.length ? 'No check-ins yet'
    : gate.allow ? (todayC?.status === 'yellow' ? 'You can run today, but shorter and easy' : 'You can run today')
    : 'No running today';
  const tone = !logged.length ? '' : gate.allow ? (todayC?.status === 'yellow' ? 'amber' : 'green') : 'red';
  return `
    <section class="card rise" style="--i:2" aria-label="Shin check-ins">
      <div class="eyebrow">Your shins · from the morning check-in</div>
      <div class="row" style="gap:10px;margin-top:6px">
        ${tone ? `<span class="chip ${tone}" style="padding:4px 8px"><span class="dot"></span></span>` : ''}
        <div class="h2" style="font-size:17px">${headline}</div>
      </div>
      ${!gate.allow ? `<p class="body-2" style="margin-top:6px">${esc(gate.why)}</p>` : ''}
      ${logged.length ? `
      <div style="margin-top:14px">${painBars(days)}</div>
      <div class="row wrap" style="gap:6px;margin-top:10px">
        <span class="chip green"><span class="dot"></span>${count('green')} green</span>
        <span class="chip amber"><span class="dot"></span>${count('yellow')} amber</span>
        <span class="chip red"><span class="dot"></span>${count('red')} red</span>
        <span class="chip">${14 - logged.length} not logged</span>
      </div>
      <p class="small" style="margin-top:10px"><b style="color:var(--text)">How to read it:</b> one bar per day for the last two weeks. The height is your worst shin pain that morning (0–10). Below the dashed line (3/10) is fine; above it, the app shortens or swaps your runs. A flat row of short green bars means your shins are ready for more running.</p>`
      : `<p class="small" style="margin-top:8px">Each morning's 45-second check-in appears here as a bar, so you can see whether your shins are calming down week to week. Start it from the Today tab.</p>`}
    </section>`;
}

/* Everything the app has worked out from your own data, with what it was based on. */
function learnedCard() {
  const row = (icon, title, body, tone = '', action = '') => `
    <div class="learn-row ${tone}">
      <span class="kind-badge sm">${icon}</span>
      <div class="grow"><div class="h3" style="font-size:14px">${title}</div><p class="small" style="margin-top:2px">${body}</p>${action}</div>
    </div>`;

  // 1. heart rate
  const m = maxHRInsight();
  const hr = !m.ready
    ? row(icons.heart, 'Max heart rate', `Needs 5 Garmin workouts with heart rate (${m.n} so far). The app uses ${store.profile.maxHR} bpm.`)
    : m.capped
      ? row(icons.heart, `Max heart rate · using ${store.profile.maxHR} bpm`, `${m.atTop} of your workouts peak at exactly ${m.top} bpm. That's intervals.icu cutting off readings above its old max-HR setting, not your real max. It's now set to ${store.profile.maxHR}, so new workouts will show your true peaks and the app will learn from them.`)
      : m.advice?.kind === 'lower'
        ? row(icons.heart, `Max heart rate · probably ${m.learned} bpm`, `Your hardest days in the last year peaked at ${m.learned}–${m.top} bpm, well under the ${m.profile} the app uses, so heart-rate targets are set too high.`, 'warn', `<button class="btn btn-ghost btn-sm" style="margin-top:8px" data-act="learn-maxhr" data-value="${m.learned}">Use ${m.learned} bpm</button>`)
        : row(icons.heart, `Max heart rate · ${store.profile.maxHR} bpm`, `Highest recorded ${m.top} bpm (${shortDate(m.topDate)}).${store.learn?.maxHR ? ` Raised automatically on ${shortDate(store.learn.maxHR.date)} when a workout went higher.` : ' The app raises it by itself if a workout ever goes higher.'}`, 'good');

  // 2. intervals: what next bike-interval day will do
  const nextVo2 = Array.from({ length: 8 }, (_, i) => dayKey(addDays(new Date(), i))).find(k => sessionFor(k)?.kind === 'vo2');
  const adj = nextVo2 ? resolveDay(nextVo2).adj : null;
  const iv = adj
    ? row(icons.bike, `Bike intervals · ${adj.kind === 'more' ? 'one rep added' : adj.kind === 'push' ? 'go harder' : adj.kind === 'ease' ? 'start easier' : 'on track'}`, `${esc(adj.note)} Applies on ${shortDate(nextVo2)}${adj.kind === 'more' ? ', and the watch gets the extra rep too' : ''}.`, adj.kind === 'ease' ? 'warn' : 'good')
    : row(icons.bike, 'Bike intervals', 'After each interval session, rate the effort. With your Garmin heart rate the app then decides the next one: one more rep, harder, easier or the same. Nothing to learn from yet.');

  // 3. shins
  const sl = shinLimit();
  const surf = sl.ready && sl.tread && sl.road ? ` Treadmill: ${sl.tread.bad} of ${sl.tread.n} next mornings amber or red; road: ${sl.road.bad} of ${sl.road.n}.` : '';
  const sh = !sl.ready
    ? row(icons.shin, 'Your shin limit', `Learns how long you can run before your shins complain, from each run and the next morning's check-in. Needs 6 runs with a check-in the morning after (${sl.n} so far).`)
    : sl.limit
      ? row(icons.shin, `Your shin limit · ${sl.limit} min`, `Runs up to ${sl.limit} min: ${sl.under.green} of ${sl.under.n} next mornings green. Longer runs: ${sl.over.bad} of ${sl.over.n} amber or red. Easy runs are capped at ${sl.limit} min (the rest on the bike) until longer runs stop causing amber mornings.${surf}`, 'warn')
      : row(icons.shin, 'Your shin limit · no limit found', `${sl.n} runs so far and no run length keeps leading to amber mornings. Keep checking in every morning.${surf}`, 'good');

  // 4. calories
  const ca = calorieAdjust();
  const kc = !ca.rate
    ? row(icons.scale, 'Calories', 'Follows your weight trend: if you lose faster than about 0.5 kg a week it adds food, if the weight stalls it trims a little. Needs 6 weigh-ins over 2 weeks.')
    : row(icons.scale, ca.delta ? `Calories · ${ca.delta > 0 ? '+' : '−'}${Math.abs(ca.delta)} kcal a day` : 'Calories · no change', esc(ca.why), ca.delta ? 'warn' : 'good');

  return `
    <section class="card rise" style="--i:1" aria-label="What the app learned">
      <div class="eyebrow">Auto-learning · from your own data</div>
      <div class="h3" style="margin-top:2px">What the app has learned</div>
      <div class="learn-list">${hr}${iv}${sh}${kc}</div>
    </section>`;
}

function syncHeader(title) {
  return `<div class="row between"><div><div class="eyebrow">Garmin · synced ${syncAgo()}</div><div class="h3" style="margin-top:2px">${title}</div></div>
    <button class="btn btn-ghost btn-sm" data-act="sync-now">${icons.reset} Sync</button></div>`;
}

function garminCard() {
  if (!syncConfigured()) {
    return `<button class="card card-glass checkin-cta rise" style="--i:3;text-align:left;width:100%" data-act="sheet" data-type="settings">
      <div class="pulse">${icons.heart}</div>
      <div class="grow"><div class="h3">Connect Garmin</div><div class="small">HRV, resting HR, sleep and workouts via intervals.icu. Setup steps: Library → Garmin.</div></div>${icons.chevronR}</button>`;
  }
  const today = dayKey();
  const out = [];

  // 1. VO2max — the goal metric
  const vo2 = vo2Trend();
  const form = loadForm();
  out.push(`
    <section class="card rise" style="--i:3" aria-label="Engine">
      ${syncHeader(vo2 ? `VO₂max ${vo2.latest} <span class="small">ml/kg/min (Garmin estimate)</span>` : 'Engine')}
      ${vo2 && vo2.points.length >= 2 ? `<div style="margin-top:12px">${lineChart(vo2.points.slice(-60).map(p => ({ x: shortDate(p.date), y: p.vo2max })), { fmtY: v => v.toFixed(0), yPad: 1 })}</div>` : ''}
      <p class="small" style="margin-top:8px">${vo2 ? `${vo2.change > 0 ? `<b style="color:var(--green)">+${vo2.change}</b> since the plan started.` : vo2.change < 0 ? `${vo2.change} since the plan started (Garmin's estimate moves slowly and dips with fatigue or heat).` : 'Same as when the plan started.'} The plan aims for roughly +4–8% by March, about +2–4 points, plus a little more per kg from losing weight.` : 'Garmin updates its VO₂max estimate after outdoor runs with GPS and heart rate. It appears here once one syncs.'}</p>
      ${form ? `
      <div class="grid-3" style="margin-top:12px">
        <div class="tile"><span class="num">${form.fitness}</span><small>fitness (6-week load)</small></div>
        <div class="tile"><span class="num">${form.fatigue}</span><small>fatigue (last week)</small></div>
        <div class="tile"><span class="num" style="color:${form.form < -25 ? 'var(--red)' : form.form > 5 ? 'var(--green)' : 'var(--text)'}">${form.form > 0 ? '+' : ''}${form.form}</span><small>form</small></div>
      </div>
      <p class="small" style="margin-top:8px"><b style="color:var(--text)">${form.label}.</b> Form = fitness − fatigue. Between −10 and −25 is normal in a build week. The taper should lift it to about +5 to +15 for race day; below −30 for days means back off.</p>` : ''}
    </section>`);

  // 2. Recovery — HRV / RHR / sleep
  const days = Object.values(store.sync.wellness).filter(w => w.hrv > 0).sort((a, b) => a.date.localeCompare(b.date)).slice(-42);
  const hrv = hrvStatus(today);
  const lastW = Object.values(store.sync.wellness).sort((a, b) => a.date.localeCompare(b.date)).filter(w => w.rhr || w.sleepH).pop();
  out.push(`
    <section class="card rise" style="--i:4" aria-label="Recovery">
      <div class="eyebrow">Recovery</div>
      <div class="h3" style="margin-top:2px">HRV ${hrv.status ? `${hrv.avg7} ms (7-day average)` : days.length ? `${Math.round(days[days.length - 1].hrv)} ms` : '—'}</div>
      ${days.length >= 2 ? `<div style="margin-top:12px">${lineChart(days.map(d => ({ x: shortDate(d.date), y: d.hrv })), { fmtY: v => Math.round(v), yPad: 3, target: hrv.status ? hrv.base : null, targetLabel: 'your normal' })}</div>` : ''}
      <p class="small" style="margin-top:8px">${hrv.status ? `Your normal range is ${hrv.band[0]}–${hrv.band[1]} ms. When your 7-day average drops below it, hard sessions turn easy automatically.` : `HRV readiness switches on after 14 days of readings (${hrv.n} so far).`} Higher HRV generally means better recovered.</p>
      <div class="grid-3" style="margin-top:12px">
        <div class="tile"><span class="num">${lastW?.rhr ?? '—'}</span><small>resting HR</small></div>
        <div class="tile"><span class="num">${lastW?.sleepH ? lastW.sleepH.toFixed(1) : '—'}</span><small>hours slept</small></div>
        <div class="tile"><span class="num">${lastW?.sleepScore ?? '—'}</span><small>sleep score</small></div>
      </div>
    </section>`);

  // 3. Running & intensity
  const load = runLoad(dayKey(addDays(new Date(), 1)));
  const cad = cadenceInfo();
  const mix = intensityMix(7);
  out.push(`
    <section class="card rise" style="--i:5" aria-label="Running and intensity">
      <div class="eyebrow">Running & intensity · last 7 days</div>
      <div class="grid-3" style="margin-top:10px">
        <div class="tile"><span class="num">${load.km7}</span><small>run km</small></div>
        <div class="tile"><span class="num">${load.longestMins || '—'}</span><small>longest run, 30 d (min)</small></div>
        <div class="tile"><span class="num">${cad?.last?.spm ?? '—'}</span><small>last run cadence (spm)</small></div>
      </div>
      ${cad ? `<p class="small" style="margin-top:8px">Your usual cadence is ~${cad.baseline} steps/min. Aim for <b style="color:var(--text)">${cad.target[0]}–${cad.target[1]}</b> on easy runs: shorter, quicker steps cut braking and shin load (Heiderscheit 2011).${cad.last?.gctMs ? ` Ground contact ${Math.round(cad.last.gctMs)} ms.` : ''}</p>` : ''}
      ${mix ? `
      <div class="h3" style="margin-top:14px;font-size:14px">Intensity mix</div>
      <div class="mix-bar" role="img" aria-label="Easy ${mix.pct[0]}%, moderate ${mix.pct[1]}%, hard ${mix.pct[2]}%">
        <i style="width:${mix.pct[0]}%;background:var(--green)"></i><i style="width:${mix.pct[1]}%;background:var(--amber)"></i><i style="width:${mix.pct[2]}%;background:var(--red)"></i>
      </div>
      <div class="row between small" style="margin-top:6px"><span>Easy ${mix.easy} min · ${mix.pct[0]}%</span><span>Moderate ${mix.mod} min · ${mix.pct[1]}%</span><span>Hard ${mix.hard} min · ${mix.pct[2]}%</span></div>
      <p class="small" style="margin-top:8px">Target: about 75–80% easy, 10–15% moderate, 5–10% hard. ${mix.pct[0] < 70 ? '<b style="color:var(--amber)">Too much moderate or hard work this week: keep the easy days truly easy.</b>' : 'On track.'}</p>` : ''}
      ${store.sync.error ? `<p class="small" style="margin-top:10px;color:var(--red)">${esc(store.sync.error)}</p>` : ''}
    </section>`);
  return out.join('');
}

function adherenceCard() {
  const w = currentWeek();
  const days = weekDays(w);
  // the optional Monday only counts when you did it
  const planned = days.filter(d => d.session.kind !== 'rest' && (!d.session.optionalDay || store.done[d.key]?.complete)).length;
  const done = days.filter(d => store.done[d.key]?.complete).length;
  const total = Object.values(store.done).filter(d => d.complete).length;
  return `
    <div class="grid-3 rise" style="--i:3">
      <div class="tile"><span class="num">${done}/${planned}</span><small>sessions this week</small></div>
      <div class="tile"><span class="num">${total}</span><small>sessions logged</small></div>
      <div class="tile"><span class="num">${Object.keys(store.checkins).length}</span><small>check-ins</small></div>
    </div>`;
}

/* Weekly training load from session effort ratings (effort × minutes). */
function loadCard() {
  const cw = currentWeek();
  const weeks = Array.from({ length: Math.min(cw + 1, 8) }, (_, i) => cw - Math.min(cw, 7) + i).map(w => ({ w, ...weekLoad(w) }));
  const max = Math.max(1, ...weeks.map(x => x.sum));
  const sp = loadSpike();
  const any = weeks.some(x => x.n);
  return `
    <section class="card rise" style="--i:3" aria-label="Training load">
      <div class="eyebrow">From your effort ratings</div>
      <div class="h3" style="margin-top:2px">Training load</div>
      ${any ? `
        <div class="load-bars">
          ${weeks.map(x => `
            <div class="lb ${x.w === cw ? 'cur' : ''}">
              <span class="num">${x.n ? x.sum.toLocaleString() : ''}</span>
              <i style="height:${x.n ? Math.max(6, (x.sum / max) * 100) : 4}%"></i>
              <small>W${x.w}${DELOAD.has(x.w) ? '·d' : ''}</small>
            </div>`).join('')}
        </div>
        <p class="small" style="margin-top:10px">${sp.ready ? (spikeText(sp) || `Last 7 days: ${sp.last7.toLocaleString()} (${sp.pct >= 0 ? '+' : ''}${sp.pct}% vs your usual week). A steady build is what the shins like.`) : 'After about 2 weeks of ratings, the app compares each week with the three before and warns you about sudden jumps.'}</p>` : `
        <p class="small" style="margin-top:6px">After each session, tap how hard it felt (0–10). Effort × minutes = load. It counts sleds, lunges and wall balls properly, which your watch misses, and flags week-to-week jumps that often come before shin pain.</p>`}
      <details class="why"><summary>${icons.info}<span>Why</span>${icons.chevron}</summary>
        <p>Session effort (sRPE) is one of the most validated ways to track load in mixed training. Weeks that jump well above your recent average are linked to more injuries. Deload weeks (·d) are meant to be lower.</p>
        <p class="why-src">Research: Foster 2001; Haddad 2017; Gabbett 2016; Impellizzeri 2020</p>
      </details>
    </section>`;
}

function benchCard() {
  const groups = [...new Set(activeBenchmarks().map(b => b.group))];
  const tested = activeBenchmarks().filter(b => latestBench(b.id)).length;
  const intro = `
    <section class="rise" style="--i:4;padding:14px 4px 0">
      <div class="eyebrow">Benchmark tests · ${tested} of ${activeBenchmarks().length} done</div>
      <h2 class="h2" style="margin-top:4px">Are you getting fitter?</h2>
      <p class="body-2" style="margin-top:6px">Short tests you repeat a few times before March. Each one is already scheduled in your plan in the weeks shown. Do it that day, then tap the test here (or the button on Today) and type your result. The app shows your first result, your latest, and how close you are to the goal.</p>
    </section>`;
  return intro + groups.map((g, gi) => `
    <section class="card rise" style="--i:${5 + gi}" aria-label="${g}">
      <div class="eyebrow" style="margin-bottom:4px">${g}</div>
      ${activeBenchmarks().filter(b => b.group === g).map(b => {
        const last = latestBench(b.id);
        const first = firstBench(b.id);
        const target = benchTarget(b, first?.value);
        let pct = 0;
        if (last && target && last === first && b.target === undefined) pct = 0.03;
        else if (last && target) {
          if (first && first.value !== target && first !== last) pct = (b.lowerBetter ? (first.value - last.value) / (first.value - target) : (last.value - first.value) / (target - first.value));
          else pct = b.lowerBetter ? Math.min(1, target / last.value) : Math.min(1, last.value / target);
          pct = Math.max(0.03, Math.min(1, pct));
        }
        const goal = target ? `goal ${fmtVal(b, target)}` : b.goalPct ? `goal: ${b.goalPct}% better than test 1` : '';
        return `
        <button class="bench" style="width:100%;text-align:left" data-act="sheet" data-type="bench" data-id="${b.id}">
          <span>
            <div class="h3">${esc(b.name)}</div>
            <div class="small" style="color:var(--text-2)">${esc(b.why || '')}</div>
            <div class="small">When: ${esc(b.weeks)}</div>
          </span>
          <span class="vals">${last ? fmtVal(b, last.value) : '<span class="faint" style="font-family:var(--font);font-size:12.5px">not tested yet</span>'}<small>${last && first && first !== last ? `first ${fmtVal(b, first.value)} · ` : ''}${goal}</small><small class="accent" style="font-family:var(--font)">${last ? 'tap to add' : 'tap to log'} ›</small></span>
          ${last ? `<div class="meter"><i style="width:${pct * 100}%"></i></div>` : ''}
        </button>`;
      }).join('')}
    </section>`).join('');
}

export function renderProgress() {
  return `
    <section class="rise" style="--i:0;padding:6px 4px 0">
      <div class="eyebrow">Trends & tests</div>
      <h1 class="h1" style="margin-top:4px">Progress</h1>
    </section>
    ${learnedCard()}
    ${weightCard()}
    ${shinCard()}
    ${garminCard()}
    ${adherenceCard()}
    ${loadCard()}
    ${benchCard()}`;
}
