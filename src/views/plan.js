import { store, dayKey, addDays } from '../store.js';
import { icons } from '../ui/icons.js';
import { sessionHeader, sessionBody, esc, KIND } from '../ui/components.js';
import { WEEKS, PHASES, phaseFor, weekDays, weekStart, currentWeek, weekStats, DELOAD, TOTAL_WEEKS } from '../data/plan.js';
import { resolveDay } from '../logic/day.js';

const fmtRange = w => {
  const s = weekStart(w);
  const e = addDays(s, 6);
  const o = { day: 'numeric', month: 'short' };
  return `${s.toLocaleDateString('en-GB', o)} – ${e.toLocaleDateString('en-GB', o)}`;
};

const pillLabel = w => (w === 0 ? 'RST' : w === 14 ? 'SCL' : w === 16 ? 'RACE' : DELOAD.has(w) ? 'DL' : w === 11 ? 'SIM' : 'WK');

export function renderPlan(ui) {
  const now = currentWeek();
  if (ui.planWeek === null) ui.planWeek = now;
  const w = ui.planWeek;
  const phase = phaseFor(w);
  const stats = weekStats(w);
  const today = dayKey();
  const swapped = !!store.swaps[`w${w}`];

  return `
    <section class="rise" style="--i:0;padding:6px 4px 0">
      <div class="eyebrow">16 weeks to Buenos Aires</div>
      <h1 class="h1" style="margin-top:4px">The plan</h1>
    </section>

    <section class="card rise" style="--i:1" aria-label="Phases">
      <div class="phase-track">
        ${WEEKS.map(x => `<span style="flex:1" class="${x.n < now ? 'past' : x.n === now ? 'now' : ''}" title="Week ${x.n}"></span>`).join('')}
      </div>
      <div class="phase-legend">
        ${PHASES.map(p => `<div><b>${p.name}</b>${p.weeks.length > 1 ? `W${p.weeks[0]}–${p.weeks[p.weeks.length - 1]}` : `W${p.weeks[0]}`}</div>`).join('')}
      </div>
    </section>

    <div class="week-pills rise" style="--i:2" role="tablist" aria-label="Weeks">
      ${WEEKS.map(x => `
        <button class="wp ${x.n === w ? 'on' : ''} ${x.n === now ? 'now' : ''} ${x.n < now ? 'past' : ''}" data-act="plan-week" data-week="${x.n}" role="tab" aria-selected="${x.n === w}">
          <span class="num">${x.n}</span><small>${x.n === now && x.n !== w ? 'NOW' : pillLabel(x.n)}</small>
        </button>`).join('')}
    </div>

    <section class="rise" style="--i:3;padding:0 4px">
      <div class="row between">
        <div>
          <div class="eyebrow">${fmtRange(w)}${DELOAD.has(w) ? ' · deload' : ''}</div>
          <div class="h2" style="margin-top:2px">Week ${w} · ${phase.name}</div>
        </div>
        ${swapped ? `<button class="link-btn" data-act="reset-week" data-week="${w}">${icons.reset} Reset order</button>` : ''}
      </div>
      <p class="body-2" style="margin-top:6px">${phase.blurb}</p>
    </section>

    <div class="stat-tiles rise" style="--i:4">
      <div class="tile"><span class="num">${stats.runMin}</span><small>run min</small></div>
      <div class="tile"><span class="num">${stats.engineMin}</span><small>bike + row min</small></div>
      <div class="tile"><span class="num">${stats.hard}</span><small>hard days</small></div>
      <div class="tile"><span class="num">${stats.jumps}</span><small>jump contacts</small></div>
    </div>

    <div class="stack">
      ${weekDays(w).map((d, i) => {
        const open = ui.openDay === d.key;
        const day = resolveDay(d.key, { express: !!ui.express[d.key] });
        const s = day.session;
        const done = store.done[d.key]?.complete;
        const st = store.checkins[d.key]?.status;
        return `
        <article class="card day-card ${open ? 'open' : ''} ${d.key === today ? 'today' : ''} ${s.kind === 'rest' ? 'is-rest' : ''} rise" style="--i:${5 + i}">
          <button class="day-row" data-act="open-day" data-date="${d.key}" aria-expanded="${open}">
            <div class="day-date"><small>${d.dow.toUpperCase()}</small><span class="num">${d.dnum}</span></div>
            <div style="min-width:0">
              <div class="day-title">${esc(s.title)}</div>
              <div class="day-sub">
                <span>${KIND[s.kind]?.label || ''}</span>${s.duration && s.duration !== '—' ? `<span>· ${esc(s.duration)}</span>` : ''}
                ${done ? `<span class="chip green" style="padding:1px 6px">${icons.check}done</span>` : ''}
                ${st ? `<span class="chip ${st === 'green' ? 'green' : st === 'yellow' ? 'amber' : 'red'}" style="padding:1px 6px"><span class="dot"></span>${st === 'yellow' ? 'amber' : st}</span>` : ''}
                ${day.notes.length ? '<span class="chip amber" style="padding:1px 6px">adapted</span>' : ''}
              </div>
            </div>
            <span class="chev">${icons.chevron}</span>
          </button>
          ${open ? `
          <div class="day-body">
            <div style="padding-top:14px">${sessionHeader(s, { compact: true })}</div>
            ${day.notes.length ? `<div class="notes">${day.notes.map(n => `<div class="note">${icons.info}<span>${esc(n)}</span></div>`).join('')}</div>` : ''}
            ${sessionBody(s, d.key)}
            <div class="day-actions">
              <button class="btn btn-ghost btn-sm" data-act="open-today" data-date="${d.key}">${icons.today} Open in Today</button>
              ${w <= TOTAL_WEEKS ? `<button class="btn btn-ghost btn-sm" data-act="sheet" data-type="swap" data-week="${w}" data-from="${i}">${icons.swap} Move day</button>` : ''}
            </div>
          </div>` : ''}
        </article>`;
      }).join('')}
    </div>`;
}
