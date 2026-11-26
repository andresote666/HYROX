import { store, dayKey, addDays, parseDay, latestWeight } from '../store.js';
import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { lineChart, painBars } from '../ui/charts.js';
import { BENCHMARKS, benchTarget } from '../data/benchmarks.js';
import { fmtSec } from '../data/results.js';
import { weightTrend, latestBench, firstBench } from '../logic/personalize.js';
import { runGate } from '../logic/readiness.js';
import { weekDays, currentWeek } from '../data/plan.js';

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
          <div class="row" style="gap:8px;align-items:baseline;margin-top:2px"><span class="num" style="font-size:28px;font-weight:600">${avg.toFixed(1)}</span><span class="small">kg → ${target}</span></div></div>
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
  const days = Array.from({ length: 21 }, (_, i) => {
    const k = dayKey(addDays(new Date(), i - 20));
    const c = store.checkins[k];
    return { label: parseDay(k).getDate(), v: c ? Math.max(c.morning || 0, c.palpation || 0, c.hop || 0) : null, status: c?.status };
  });
  const logged = Object.values(store.checkins);
  const last14 = Object.entries(store.checkins).filter(([k]) => k >= dayKey(addDays(new Date(), -13)));
  const count = s => last14.filter(([, c]) => c.status === s).length;
  const gate = runGate(store.checkins, today);
  return `
    <section class="card rise" style="--i:2" aria-label="Shins">
      <div class="row between">
        <div><div class="eyebrow">Shins & soleus · last 21 days</div><div class="h3" style="margin-top:2px">${gate.allow ? 'Running allowed' : 'Running locked'}</div></div>
        <div class="row" style="gap:6px">
          <span class="chip green">${count('green')}</span><span class="chip amber">${count('yellow')}</span><span class="chip red">${count('red')}</span>
        </div>
      </div>
      <div style="margin-top:14px">${painBars(days)}</div>
      <p class="small" style="margin-top:8px">${gate.allow ? 'Bars show the highest pain score each day; the line marks 3/10. Progress running only after green days, by no more than 10% on your longest run in 30 days.' : esc(gate.why)}${logged.length ? '' : ' Do the daily check-in to start the trend.'}</p>
    </section>`;
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
    ${adherenceCard()}
    ${benchCard()}`;
}
