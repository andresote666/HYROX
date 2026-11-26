import { store, dayKey, addDays, parseDay, latestWeight } from '../store.js';
import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { lineChart, painBars } from '../ui/charts.js';
import { BENCHMARKS, benchTarget } from '../data/benchmarks.js';
import { fmtSec } from '../data/results.js';
import { weightTrend, latestBench, firstBench } from '../logic/personalize.js';
import { runGate } from '../logic/readiness.js';
import { weekDays, currentWeek } from '../data/plan.js';
import { hrvStatus, runLoad, syncAgo, syncConfigured, vo2Trend, loadForm, cadenceInfo, intensityMix, latestBodyFat } from '../logic/sync.js';

const fmtVal = (b, v) => (v === null || v === undefined ? '—' : b.unit === 'time' ? fmtSec(v) : b.unit === 'watts' ? `${Math.round(v)} W` : b.unit === 'bpm' ? `${Math.round(v)} bpm` : `${Math.round(v * 10) / 10}`);
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
  const planned = days.filter(d => d.session.kind !== 'rest').length;
  const done = days.filter(d => store.done[d.key]?.complete).length;
  const total = Object.values(store.done).filter(d => d.complete).length;
  return `
    <div class="grid-3 rise" style="--i:3">
      <div class="tile"><span class="num">${done}/${planned}</span><small>sessions this week</small></div>
      <div class="tile"><span class="num">${total}</span><small>sessions logged</small></div>
      <div class="tile"><span class="num">${Object.keys(store.checkins).length}</span><small>check-ins</small></div>
    </div>`;
}

function benchCard() {
  const groups = [...new Set(BENCHMARKS.map(b => b.group))];
  return groups.map((g, gi) => `
    <section class="card rise" style="--i:${4 + gi}" aria-label="${g}">
      <div class="eyebrow" style="margin-bottom:4px">${g}</div>
      ${BENCHMARKS.filter(b => b.group === g).map(b => {
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
        return `
        <button class="bench" style="width:100%;text-align:left" data-act="sheet" data-type="bench" data-id="${b.id}">
          <span><div class="h3">${esc(b.name)}</div><div class="small">${esc(b.weeks)}</div></span>
          <span class="vals">${fmtVal(b, last?.value)}<small>${target ? `goal ${fmtVal(b, target)}` : 'set by first test'}</small></span>
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
    ${weightCard()}
    ${shinCard()}
    ${garminCard()}
    ${adherenceCard()}
    ${benchCard()}`;
}
