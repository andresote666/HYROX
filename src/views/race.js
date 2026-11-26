import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { RACES, TARGETS, RACE_WEEK, RULES_2627 } from '../data/races.js';
import { SEGMENTS, RIO_2026, toSec, fmtSec } from '../data/results.js';
import { daysTo } from '../main.js';

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

    <section class="card rise" style="--i:2" aria-label="Rio versus target">
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

    <section class="card rise" style="--i:3" aria-label="Split plan">
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
          <p class="small" style="padding:0 0 12px 30px">${esc(TARGETS[g.id].cue)}${TARGETS[g.id].median ? ` <span class="faint">· Open Men median ${TARGETS[g.id].median}</span>` : ''}</p>
        </details>`).join('')}
      <p class="small" style="margin-top:12px">Tap a row for the pacing cue. Medians from roxpace.app (≈1:27 finisher). Runs total ${fmtSec(tt.runs)}: the plan asks little extra run speed, which suits the shins.</p>
    </section>

    <section class="card rise" style="--i:4" aria-label="Race week">
      <div class="h3" style="margin-bottom:6px">Race week & race day</div>
      <ul class="checklist">${RACE_WEEK.map(r => `<li><span class="t">${r.t}</span><span>${r.what}</span></li>`).join('')}</ul>
    </section>

    <section class="card rise" style="--i:5" aria-label="Rules">
      <div class="h3" style="margin-bottom:6px">2026/27 rules that matter</div>
      <ul class="checklist">${RULES_2627.map(r => `<li><span style="color:var(--accent)">${icons.alert}</span><span>${esc(r)}</span></li>`).join('')}</ul>
      <p class="small" style="margin-top:10px">Summarised from rulebook coverage (Hybrid Fitness Media, BarBend, Roxlyfe). Check the official rulebook before race week.</p>
    </section>`;
}
