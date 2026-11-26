import { store, dayKey, parseDay, latestWeight } from '../store.js';
import { icons } from '../ui/icons.js';
import { ring } from '../ui/charts.js';
import { sessionHeader, sessionBody, countItems, doneCount, esc } from '../ui/components.js';
import { STATUS, redStreak, scoreCheckin } from '../logic/readiness.js';
import { resolveDay } from '../logic/day.js';
import { fuelFor } from '../logic/personalize.js';
import { weekOf, weekDays, phaseFor, TOTAL_WEEKS, DELOAD } from '../data/plan.js';
import { TIPS } from '../data/library.js';
import { BENCHMARKS } from '../data/benchmarks.js';
import { activitiesOn, wellnessOn, syncConfigured, runSteps, cadenceInfo } from '../logic/sync.js';
import { loadSpike, spikeText, rated } from '../logic/load.js';
import { reviewFor } from '../logic/review.js';
import { partsForSession } from '../logic/sim.js';

function statusBlock(day, key, isToday, ui) {
  if (!day.checkin) {
    return `
      <button class="card card-glass checkin-cta rise" style="--i:1;text-align:left;width:100%" data-act="sheet" data-type="checkin">
        <div class="pulse">${icons.shin}</div>
        <div class="grow">
          <div class="h3">${isToday ? 'Daily shin check' : 'Check-in for this day'}</div>
          <div class="small">45 seconds. Adapts ${isToday ? 'today\'s' : 'this'} session to your shins and sleep.</div>
          ${!day.gate.allow ? `<div class="small" style="color:var(--amber);margin-top:4px">${esc(day.gate.why)}</div>` : ''}
        </div>
        ${icons.chevronR}
      </button>`;
  }
  const st = STATUS[day.checkin.status];
  const streak = redStreak(store.checkins, key);
  const c = day.checkin;
  const urgent = c.focal || streak >= 3;
  const open = !!ui.statusOpen;
  const reasons = [...scoreReasons(c), ...(!day.gate.allow ? [day.gate.why] : [])];
  return `
    <section class="card status-card compact ${st.id} ${open ? 'open' : ''} rise" style="--i:1" aria-label="Shin status">
      <button class="status-toggle" data-act="toggle-status" aria-expanded="${open}">
        <div class="status-light"><span class="dot"></span></div>
        <div class="grow">
          <div class="status-title"><b>${st.label}</b> · ${st.title}</div>
          <div class="small">Shins ${c.morning}/${c.palpation}/${c.hopFail ? '✕' : c.hop ?? '–'} · sleep ${c.sleep} h${reasons.length ? ` · ${reasons.length} note${reasons.length > 1 ? 's' : ''}` : ''}</div>
        </div>
        <span class="chev">${icons.chevron}</span>
      </button>
      ${open ? `
      <div class="status-more">
        <p class="body-2">${st.summary}</p>
        ${reasons.length ? `<ul class="reason-list">${reasons.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
        <button class="link-btn" style="margin-top:10px" data-act="sheet" data-type="checkin">Edit check-in</button>
      </div>` : ''}
      ${urgent ? `<div class="note" style="margin-top:12px;background:var(--red-soft)">${icons.alert}<span><b style="color:var(--text)">See a sports doctor or physio${c.focal ? ' now' : ''}.</b> ${c.focal ? 'Pain in one spot on the bone, or at night or rest, can be a bone stress injury and needs imaging (MRI).' : `${streak} red days in a row.`}</span></div>` : ''}
    </section>`;
}

const scoreReasons = c => scoreCheckin(c).reasons;

function recoveryStrip(day, key) {
  const w = wellnessOn(key);
  if (!w && !day.hrv.status) return '';
  const chip = (label, tone = '') => `<span class="chip ${tone}">${label}</span>`;
  const parts = [];
  if (day.hrv.status) parts.push(chip(`HRV ${day.hrv.avg7} ms · ${day.hrv.status === 'low' ? 'below normal' : day.hrv.status === 'high' ? 'above normal' : 'normal'}`, day.hrv.status === 'low' ? 'amber' : 'green'));
  else if (w?.hrv) parts.push(chip(`HRV ${Math.round(w.hrv)} ms`));
  if (w?.rhr) parts.push(chip(`RHR ${w.rhr}${day.rhr.status === 'elevated' ? ' ↑' : ''}`, day.rhr.status === 'elevated' ? 'amber' : ''));
  if (w?.sleepH) parts.push(chip(`Sleep ${w.sleepH.toFixed(1)} h${w.sleepScore ? ` · ${w.sleepScore}` : ''}`, w.sleepH < 6 ? 'amber' : ''));
  if (!parts.length) return '';
  return `<div class="row wrap rise" style="--i:1;gap:6px;padding:0 2px"><span class="eyebrow" style="margin-right:2px">Garmin</span>${parts.join('')}</div>`;
}

function garminDone(day, key, kind) {
  const acts = activitiesOn(key);
  if (!acts.length) return '';
  const max = store.profile.maxHR;
  return `<div class="garmin-list">${acts.map(a => {
    const hit = kind === 'vo2' && a.maxHr ? (a.maxHr >= Math.round(max * 0.9) ? `<span class="chip green">reached ${Math.round(max * 0.9)}+</span>` : `<span class="chip amber">peak ${a.maxHr}, target ${Math.round(max * 0.9)}+</span>`) : '';
    const bits = [a.mins ? `${a.mins} min` : '', a.km ? `${a.km} km` : '', a.avgHr ? `avg ${a.avgHr} bpm` : '', a.maxHr ? `max ${a.maxHr}` : '', a.watts ? `${Math.round(a.watts)} W` : '', runSteps(a) ? `${runSteps(a)} spm` : ''].filter(Boolean).join(' · ');
    const cad = runSteps(a) ? cadenceInfo() : null;
    const cadNote = cad && runSteps(a) < cad.target[0] ? `<span class="chip amber">cadence ${runSteps(a)}: aim ${cad.target[0]}+ to ease the shins</span>` : '';
    return `<div class="garmin-act"><div class="h3" style="font-size:13.5px">${esc(a.name || a.type)} <span class="faint" style="font-weight:500">· ${esc(a.type)}</span></div><div class="small">${bits}</div>${hit}${cadNote}</div>`;
  }).join('')}</div>`;
}

function weekStrip(week, selKey) {
  if (week < 0 || week > TOTAL_WEEKS) return '';
  const today = dayKey();
  return `
    <div class="week-strip rise" style="--i:3" role="tablist" aria-label="Days this week">
      ${weekDays(week).map(d => {
        const done = store.done[d.key]?.complete;
        return `
        <button class="wd ${d.key === today ? 'today' : ''} ${d.key === selKey ? 'sel' : ''} ${done ? 'done' : ''}" data-act="pick-day" data-date="${d.key}" role="tab" aria-selected="${d.key === selKey}">
          <span class="small">${d.dow}</span>
          <span class="num">${d.dnum}</span>
          <span class="k ${d.session.kind}"></span>
        </button>`;
      }).join('')}
    </div>`;
}

function sessionCard(day, key, ui) {
  const s = day.session;
  const total = countItems(s);
  const done = doneCount(s, key);
  const complete = !!store.done[key]?.complete;
  const hasOptional = day.session.blocks.some(b => b.optional);
  const benchIds = [...new Set(s.blocks.flatMap(b => b.items).filter(i => i.bench && !i.adapted).flatMap(i => (i.bench === 'calfL' ? ['calfL', 'calfR'] : [i.bench])))];
  const benches = benchIds.map(id => BENCHMARKS.find(b => b.id === id)).filter(Boolean);
  const simParts = partsForSession(s);
  const live = store.simLive;
  const simBtn = live
    ? `<button class="btn btn-primary btn-sm" data-act="sim-resume">${icons.flag} Resume race sim</button>`
    : simParts ? `<button class="btn btn-primary btn-sm" data-act="sim-open" data-date="${key}">${icons.flag} Race sim timer</button>` : '';
  const r = store.done[key];
  return `
    <section class="card rise" style="--i:2" aria-label="Session">
      ${sessionHeader(s)}
      ${day.notes.length ? `
        <button class="notes-toggle" data-act="toggle-notes" aria-expanded="${!!ui.notesOpen}">${icons.info}<span>${ui.notesOpen ? 'Hide changes' : `Adjusted today: ${day.notes.length} change${day.notes.length > 1 ? 's' : ''}`}</span><span class="chev">${icons.chevron}</span></button>
        ${ui.notesOpen ? `<div class="notes">${day.notes.map(n => `<div class="note">${icons.info}<span>${esc(n)}</span></div>`).join('')}</div>` : ''}` : ''}
      ${garminDone(day, key, s.kind)}
      ${(s.timers.length || hasOptional || s.variantB || day.base.variantB || benches.length || simBtn) ? `
        <div class="day-actions">
          ${simBtn}
          ${s.timers.map((t, i) => `<button class="btn btn-primary btn-sm" data-act="timer" data-date="${key}" data-idx="${i}">${icons.timer} ${esc(t.title)}</button>`).join('')}
          ${benches.map(b => `<button class="btn btn-ghost btn-sm" data-act="sheet" data-type="bench" data-id="${b.id}">${icons.target} Log: ${esc(b.name)}</button>`).join('')}
          ${hasOptional ? `<button class="btn btn-ghost btn-sm" data-act="express" data-date="${key}" aria-pressed="${!!ui.express[key]}">${ui.express[key] ? 'Full session' : 'Short on time'}</button>` : ''}
          ${day.base.variantB || store.variants[key] === 'B' ? `<button class="btn btn-ghost btn-sm" data-act="variant" data-date="${key}">${icons.shuffle} ${store.variants[key] === 'B' ? 'Back to plan' : 'Alternative'}</button>` : ''}
        </div>` : ''}
      ${sessionBody(s, key)}
      ${s.kind !== 'rest' ? `
      <div class="complete-bar">
        <div class="grow small" style="align-self:center">${done}/${total} done</div>
        ${complete ? (rated(key)
          ? `<button class="chip accent rpe-chip" data-act="sheet" data-type="rpe" data-date="${key}" aria-label="Edit effort rating">Effort ${r.rpe} · ${r.mins} min</button>`
          : `<button class="btn btn-ghost btn-sm" data-act="sheet" data-type="rpe" data-date="${key}">Rate effort</button>`) : ''}
        <button class="btn ${complete ? 'btn-ghost' : 'btn-primary'}" data-act="complete" data-date="${key}">${complete ? `${icons.check} Completed` : 'Mark session done'}</button>
      </div>` : ''}
    </section>`;
}

function loadNote(key) {
  const sp = loadSpike(key);
  const text = spikeText(sp);
  if (!text) return '';
  return `<div class="card tight load-note ${sp.level} rise" style="--i:1">${icons.alert}<span>${esc(text)}</span></div>`;
}

function reviewCard(rv, ui) {
  const open = !!ui.reviewOpen;
  const sh = rv.shins;
  const shinTxt = sh.n ? (sh.red ? `${sh.red} red` : sh.amber ? `${sh.amber} amber` : 'all green') : 'no check-ins';
  const kg = rv.kgChange;
  const summary = [`${rv.done}/${rv.planned} sessions`, `shins ${shinTxt}`, kg !== null ? `${kg > 0 ? '+' : ''}${kg.toFixed(1)} kg` : ''].filter(Boolean).join(' · ');
  const tile = (v, l, tone = '') => `<div class="tile ${tone}"><span class="num">${v}</span><small>${l}</small></div>`;
  return `
    <section class="card review-card ${open ? 'open' : ''} rise" style="--i:1" aria-label="Week review">
      <div class="row" style="align-items:flex-start;gap:8px">
        <button class="status-toggle grow" data-act="toggle-review" aria-expanded="${open}">
          <div class="kind-badge" style="width:36px;height:36px;border-radius:11px;color:var(--accent)">${icons.progress}</div>
          <div class="grow">
            <div class="status-title"><b>Week ${rv.lastWeek} review</b></div>
            <div class="small">${esc(summary)}</div>
          </div>
          <span class="chev">${icons.chevron}</span>
        </button>
        <button class="icon-btn" data-act="dismiss-review" data-week="${rv.week}" aria-label="Dismiss the week review" style="width:36px;height:36px">${icons.close}</button>
      </div>
      ${open ? `
      <div class="status-more">
        <p class="body-2">${esc(rv.headline)}</p>
        <div class="grid-3" style="margin-top:12px">
          ${tile(`${rv.done}/${rv.planned}`, 'sessions done', rv.planned && rv.done / rv.planned >= 0.8 ? 'good' : '')}
          ${tile(rv.load.n ? rv.load.sum.toLocaleString() : '–', rv.loadPct !== null ? `load · ${rv.loadPct >= 0 ? '+' : ''}${rv.loadPct}% vs week before` : rv.load.n ? 'training load' : 'load · rate your sessions')}
          ${tile(sh.n ? `${sh.green || 0}/${sh.n}` : '–', 'green mornings', sh.red ? 'bad' : sh.amber >= 3 ? 'warn' : '')}
        </div>
        <ul class="reason-list" style="margin-top:12px">
          ${kg !== null ? `<li>Weight ${kg > 0 ? 'up' : 'down'} ${Math.abs(kg).toFixed(1)} kg (weekly average ${rv.kgLast.toFixed(1)} kg). ${kg <= -0.2 && kg >= -0.8 ? 'Right on pace.' : kg < -0.8 ? 'Faster than planned: eat a bit more on big days.' : 'Flat or up: tighten the rest-day portions.'}</li>` : ''}
          ${rv.hrv.status ? `<li>HRV ${rv.hrv.avg7} ms, ${rv.hrv.status === 'low' ? 'below your normal: the app will ease hard days' : rv.hrv.status === 'high' ? 'above your normal' : 'within your normal range'}.</li>` : ''}
          ${rv.tests.length ? `<li>Tests logged: ${esc(rv.tests.join(', '))}. Check the Race tab for your new predicted time.</li>` : ''}
          ${rv.key ? `<li>This week's key session: <b>${esc(rv.key.day)}, ${esc(rv.key.title)}</b>.${rv.deload ? ' It\'s a lighter week: recover and let the work sink in.' : ''}</li>` : ''}
        </ul>
      </div>` : ''}
    </section>`;
}

function fuelCard(day, week) {
  const f = fuelFor(day.session, week);
  const w = latestWeight();
  const target = store.profile.targetWeightKg;
  return `
    <section class="card rise" style="--i:4" aria-label="Fuel">
      <div class="row between">
        <div><div class="eyebrow">Food · ${esc(f.label.toLowerCase())}${f.deficit ? ' · small deficit' : ' · maintenance'}</div>
        <div class="h3" style="margin-top:2px">${f.kcal.toLocaleString()} kcal</div></div>
        <button class="btn btn-ghost btn-sm" data-act="sheet" data-type="weight">${icons.scale} ${w.toFixed(1)} kg</button>
      </div>
      <div class="grid-3" style="margin-top:12px">
        <div class="tile"><span class="num">${f.protein}</span><small>g protein</small></div>
        <div class="tile"><span class="num">${f.carbs}</span><small>g carbs</small></div>
        <div class="tile"><span class="num">${(w - target).toFixed(1)}</span><small>kg to ${target}</small></div>
      </div>
      <p class="small" style="margin-top:10px">${f.note}</p>
      <button class="btn btn-primary btn-block btn-sm" style="margin-top:12px" data-act="open-food">${icons.food} See today's meals</button>
    </section>`;
}

export function renderToday(ui) {
  const key = ui.date;
  const isToday = key === dayKey();
  const { week } = weekOf(key);
  const date = parseDay(key);
  const dateLabel = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  if (week < 0 || week > TOTAL_WEEKS) {
    return `<div class="card empty rise">${icons.plan}<div class="h3">Outside the plan</div><p class="small">The plan runs from 23 Nov 2026 to 21 Mar 2027.</p><button class="btn btn-ghost btn-sm" style="margin-top:12px" data-act="go-today">Back to today</button></div>`;
  }
  const phase = phaseFor(week);
  const day = resolveDay(key, { express: !!ui.express[key] });
  const tip = TIPS[(date.getDate() + week) % TIPS.length];

  return `
    <section class="today-hero rise" style="--i:0">
      <div class="grow">
        <div class="eyebrow">${isToday ? 'Today' : dateLabel.split(' ')[0]} · ${dateLabel.split(' ').slice(1).join(' ')} · Week ${week}${DELOAD.has(week) ? ' · deload' : ''}</div>
        <h1 class="h-display" style="margin-top:6px">${esc(phase.name)} <span>phase</span></h1>
        ${!isToday ? `<button class="link-btn" style="margin-top:6px" data-act="go-today">${icons.chevronL} Back to today</button>` : ''}
      </div>
      ${ring(week + 1, TOTAL_WEEKS + 1, `W${week}`, `OF ${TOTAL_WEEKS}`)}
    </section>
    ${isToday && reviewFor(key) ? reviewCard(reviewFor(key), ui) : ''}
    ${statusBlock(day, key, isToday, ui)}
    ${isToday ? loadNote(key) : ''}
    ${syncConfigured() ? recoveryStrip(day, key) : ''}
    ${sessionCard(day, key, ui)}
    ${weekStrip(week, key)}
    ${fuelCard(day, week)}
    <section class="card tight rise" style="--i:5">
      <div class="row" style="align-items:flex-start">
        <div class="kind-badge" style="width:36px;height:36px;border-radius:11px">${icons.book}</div>
        <div class="grow"><div class="eyebrow">Coach note</div><p class="body-2" style="margin-top:2px">${tip}</p></div>
      </div>
    </section>`;
}
