import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { RACES, TARGETS, RACE_WEEK, RULES_2627 } from '../data/races.js';
import { SEGMENTS, RIO_2026, toSec, fmtSec } from '../data/results.js';
import { daysTo } from '../main.js';
import { store, parseDay } from '../store.js';
import { predict } from '../logic/predict.js';
import { SIM_TYPES } from '../logic/sim.js';

function predictionCard(race, goal, i) {
  const p = predict();
  const rio = p.rioTotal;
  const pos = Math.max(0, Math.min(1, (rio - p.total) / (rio - goal)));
  const toGo = p.total - goal;
  const ev = p.evidence;
  const basis = ev.updated
    ? [ev.sims ? `${ev.sims} simulation${ev.sims > 1 ? 's' : ''}` : '', ev.tests ? `${ev.tests} station test${ev.tests > 1 ? 's' : ''}` : '', ev.engine ? `engine: ${ev.engine}` : ''].filter(Boolean).join(' · ')
    : '';
  return `
    <section class="card predict-card rise" style="--i:${i}" aria-label="Predicted finish">
      <div class="row between" style="align-items:flex-end">
        <div><div class="eyebrow">Predicted finish today</div><div class="big-time" style="margin-top:4px">${fmtSec(p.total, true)}</div></div>
        <div style="text-align:right">
          <span class="chip ${toGo <= 0 ? 'green' : 'accent'}">${toGo <= 0 ? 'On track for the goal' : `${fmtSec(toGo)} to find`}</span>
          <div class="small" style="margin-top:6px">${rio - p.total > 0 ? `${fmtSec(rio - p.total)} faster than Rio` : 'Same as Rio so far'}</div>
        </div>
      </div>
      <div class="pbar" role="img" aria-label="Progress from Rio to goal: ${Math.round(pos * 100)}%">
        <div class="pbar-track"><i style="width:${pos * 100}%"></i><b style="left:${pos * 100}%"></b></div>
        <div class="pbar-ends"><span>Rio ${fmtSec(rio, true)}</span><span>Goal ${fmtSec(goal, true)}</span></div>
      </div>
      ${p.gaps.length ? `
        <div class="label" style="margin-top:14px">Biggest gaps to close</div>
        <div class="gap-list">${p.gaps.slice(0, 3).map(g => `
          <div class="gap-row"><span>${esc(g.name)}</span><span class="mono faint">${fmtSec(g.secs)} → ${fmtSec(g.target)}</span><span class="mono accent">−${fmtSec(g.gap)}</span></div>`).join('')}
        </div>` : ''}
      <p class="small" style="margin-top:12px">${basis ? `Based on ${esc(basis)}. Everything else is still your Rio split.` : 'Right now this is your Rio time. Each test you log (wall balls, sleds, burpees) and each race simulation you time replaces a Rio split with fresh evidence.'}</p>
      <details class="why"><summary>${icons.info}<span>How it works</span>${icons.chevron}</summary>
        <p>Each split uses your newest evidence. A timed simulation from the last 6 weeks comes first (the back half counts 5% slower, because a half simulation starts fresh). Next comes a station test, scaled so that hitting the test goal means hitting the race target. Runs and the row start from Rio and improve with your engine (1 km test, Garmin VO₂max or 2 km row), capped at 12%. SkiErg and farmers carry stay at Rio.</p>
        <p class="why-src">Expect ±2–3 minutes. Race-day pacing, fuelling and the venue's floor matter as much as fitness.</p>
      </details>
    </section>`;
}

function simCard(i) {
  const sims = (store.sims || []).slice(0, 4);
  const live = store.simLive;
  const fmtD = k => parseDay(k).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `
    <section class="card rise" style="--i:${i}" aria-label="Race simulations">
      <div class="eyebrow">Practise</div>
      <div class="h3" style="margin-top:2px">Race simulation timer</div>
      <p class="small" style="margin-top:4px">Lap every run, transition and station. It shows each part's target and whether you're ahead of the plan, and saved simulations update the prediction above.</p>
      ${live ? `<button class="btn btn-primary btn-block btn-sm" style="margin-top:12px" data-act="sim-resume">${icons.flag} Resume: ${esc(live.title)}</button>` : `
      <div class="sim-pick">${Object.entries(SIM_TYPES).map(([id, t]) => `<button class="sim-type" data-act="sim-open" data-type="${id}"><b>${t.label}</b><span>${t.sub}</span></button>`).join('')}</div>`}
      ${sims.length ? `
        <div class="label" style="margin-top:14px">Saved</div>
        ${sims.map(s => `
          <details class="split-wrap">
            <summary class="sim-saved"><span><b>${esc(s.title)}</b><small>${fmtD(s.date)}</small></span><span class="mono">${fmtSec(s.total)}</span><span class="mono ${s.total <= s.target ? 'good' : 'bad'}">${s.total <= s.target ? '−' : '+'}${fmtSec(Math.abs(s.total - s.target))}</span></summary>
            <div class="sim-detail">
              ${s.parts.filter(p => p.kind !== 'rox').map(p => `<div class="sim-row ${p.counts ? '' : 'sub'}"><span>${esc(p.label)}</span><span class="mono">${fmtSec(p.secs)}</span><span class="mono faint">${fmtSec(p.target)}</span><span class="mono ${p.secs <= p.target ? 'good' : 'bad'}">${p.secs <= p.target ? '−' : '+'}${fmtSec(Math.abs(p.secs - p.target))}</span></div>`).join('')}
              ${(() => { const r = s.parts.filter(p => p.kind === 'rox'); const t = r.reduce((a, p) => a + p.secs, 0), g = r.reduce((a, p) => a + p.target, 0); return r.length ? `<div class="sim-row"><span>Roxzone (${r.length})</span><span class="mono">${fmtSec(t)}</span><span class="mono faint">${fmtSec(g)}</span><span class="mono ${t <= g ? 'good' : 'bad'}">${t <= g ? '−' : '+'}${fmtSec(Math.abs(t - g))}</span></div>` : ''; })()}
              <button class="link-btn" style="margin-top:8px" data-act="sim-delete" data-id="${s.id}">Delete this simulation</button>
            </div>
          </details>`).join('')}` : ''}
    </section>`;
}

export function targetTotals() {
  let runs = 0, stations = 0, rox = 0;
  SEGMENTS.forEach(s => {
    const v = toSec(TARGETS[s.id].t);
    if (s.type === 'run') runs += v; else if (s.type === 'station') stations += v; else rox += v;
  });
  return { runs, stations, rox, total: runs + stations + rox };
}

export function renderRace(ui) {
  const race = RACES[ui.raceId] || RACES.ba27;
  const tt = targetTotals();
  const rioTotal = toSec(RIO_2026.total);
  const gains = SEGMENTS.map(s => ({ ...s, rio: toSec(RIO_2026.splits[s.id]), target: toSec(TARGETS[s.id].t) }))
    .map(s => ({ ...s, gain: s.rio - s.target }));
  const top = [...gains].sort((a, b) => b.gain - a.gain).slice(0, 7);
  const maxGain = top[0].gain;
  const goal = race.id === 'scl27' ? tt.total + 90 : tt.total;
  const now = Object.fromEntries(predict().segs.map(s => [s.id, s]));

  return `
    <div class="seg rise" style="--i:0" role="tablist" aria-label="Race">
      ${Object.values(RACES).map(r => `<button class="${r.id === race.id ? 'on' : ''}" data-act="race" data-race="${r.id}" role="tab" aria-selected="${r.id === race.id}">${r.flag} ${r.city}</button>`).join('')}
    </div>

    <section class="card race-hero rise" style="--i:1">
      <div class="eyebrow">${esc(race.role)}</div>
      <h1 class="h1" style="margin-top:6px;max-width:16ch">${esc(race.name)}</h1>
      <p class="body-2" style="margin-top:4px">${esc(race.dateLabel)} · ${esc(race.venue)}</p>
      <div class="row" style="margin-top:18px;align-items:flex-end;gap:16px">
        <div><div class="big-time">${daysTo(race.date)}</div><div class="small">days to go</div></div>
        <div class="grow"></div>
        <div style="text-align:right"><div class="eyebrow">Target</div><div class="num accent" style="font-size:26px;font-weight:600">${fmtSec(race.id === 'scl27' ? tt.total + 90 : tt.total, true)}</div></div>
      </div>
      <p class="small" style="margin-top:14px">${esc(race.status)} <a href="${race.url}" target="_blank" rel="noopener" style="color:var(--accent)">Official page</a></p>
    </section>

    ${predictionCard(race, goal, 2)}

    <section class="card rise" style="--i:3" aria-label="Rio versus target">
      <div class="row between">
        <div><div class="eyebrow">Rio 2026</div><div class="num" style="font-size:22px;font-weight:600">${RIO_2026.total}</div></div>
        <div style="color:var(--text-3)">${icons.chevronR}</div>
        <div style="text-align:right"><div class="eyebrow">Target</div><div class="num accent" style="font-size:22px;font-weight:600">${fmtSec(tt.total, true)}</div></div>
      </div>
      <div class="race-kpis">
        <div><span class="num">${fmtSec(tt.runs)}</span><small>runs (Rio ${RIO_2026.running})</small></div>
        <div><span class="num">${fmtSec(tt.stations)}</span><small>stations (Rio ${RIO_2026.stations})</small></div>
        <div><span class="num">${fmtSec(tt.rox)}</span><small>Roxzone (Rio ${RIO_2026.roxzone})</small></div>
      </div>
      <div class="divider"></div>
      <div class="h3">Where the ${Math.round((rioTotal - tt.total) / 60)} minutes come from</div>
      <p class="small" style="margin:2px 0 14px">The top five gains are about 70% of the gap. Ski, row and farmers carry are already at or above the Open Men median: hold them.</p>
      <div class="gain-bars">
        ${top.map((g, i) => `
          <div class="gain" style="--i:${i}">
            <span>${esc(g.name)}</span>
            <div class="gain-track"><i style="width:${(g.gain / maxGain) * 100}%"></i></div>
            <span class="num">−${fmtSec(g.gain)}</span>
          </div>`).join('')}
      </div>
    </section>

    ${simCard(4)}

    <section class="card rise" style="--i:5" aria-label="Split plan">
      <div class="h3" style="margin-bottom:12px">Split plan</div>
      <div class="split-row head"><span>SEGMENT</span><span style="text-align:right">RIO</span><span style="text-align:right">TARGET</span><span style="text-align:right">GAIN</span></div>
      ${gains.map(g => `
        <details class="split-wrap">
          <summary class="split-row" style="cursor:pointer;list-style:none">
            <span class="split-name"><span class="seg-ico ${g.type !== 'run' ? 'st' : ''}">${g.type === 'run' ? g.name.split(' ')[1] : g.short}</span><span>${esc(g.name)}</span></span>
            <span class="num faint">${RIO_2026.splits[g.id]}</span>
            <span class="num">${TARGETS[g.id].t}</span>
            <span class="split-gain ${g.gain >= 60 ? 'big' : ''}">${g.gain > 0 ? '−' + fmtSec(g.gain) : '±0'}</span>
          </summary>
          <p class="small" style="padding:0 0 12px 30px">${esc(TARGETS[g.id].cue)}${TARGETS[g.id].median ? ` <span class="faint">· Open Men median ${TARGETS[g.id].median}</span>` : ''}${now[g.id].source !== 'rio' ? `<br><span style="color:var(--text)">Now ≈ <b class="mono">${fmtSec(now[g.id].secs)}</b></span> <span class="faint">· from your ${esc(now[g.id].from)}</span>` : ''}</p>
        </details>`).join('')}
      <p class="small" style="margin-top:12px">Tap a row for the pacing cue. Medians from roxpace.app (≈1:27 finisher). Runs total ${fmtSec(tt.runs)}: the plan asks little extra run speed, which suits the shins.</p>
    </section>

    <section class="card rise" style="--i:6" aria-label="Race week">
      <div class="h3" style="margin-bottom:6px">Race week & race day</div>
      <ul class="checklist">${RACE_WEEK.map(r => `<li><span class="t">${r.t}</span><span>${r.what}</span></li>`).join('')}</ul>
    </section>

    <section class="card rise" style="--i:7" aria-label="Rules">
      <div class="h3" style="margin-bottom:6px">2026/27 rules that matter</div>
      <ul class="checklist">${RULES_2627.map(r => `<li><span style="color:var(--accent)">${icons.alert}</span><span>${esc(r)}</span></li>`).join('')}</ul>
      <p class="small" style="margin-top:10px">Summarised from rulebook coverage (Hybrid Fitness Media, BarBend, Roxlyfe). Check the official rulebook before race week.</p>
    </section>`;
}
