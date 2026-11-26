import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { SOURCES } from '../data/library.js';
import { STATIONS, TRAINING, SHINS, FOOD, GLOSSARY } from '../data/guide.js';
import { zones } from '../logic/personalize.js';

const SECTIONS = [
  { id: 'stations', label: 'Stations', intro: 'How to race each station, and how the plan trains it. Tap a station to open it.' },
  { id: 'training', label: 'Training', intro: 'How your week works and how hard each session should feel.' },
  { id: 'shins', label: 'Shins', intro: 'What the morning check-in means and how to keep your shins healthy.' },
  { id: 'food', label: 'Food', intro: 'What to eat to train well and lose 3 kg without slowing down.' },
  { id: 'words', label: 'Words', intro: 'Plain meanings for the terms used in the app.' },
];

const why = (text, sources) => (text ? `
  <details class="why">
    <summary>${icons.info}<span>Why</span>${icons.chevron}</summary>
    <p>${esc(text)}</p>
    ${sources ? `<p class="why-src">Research: ${esc(sources)}</p>` : ''}
  </details>` : '');

const doList = items => `<ul class="do-list">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;

function topic(t, i) {
  return `
    <section class="card guide-card rise" style="--i:${i + 1}">
      <div class="eyebrow">${esc(t.kicker)}</div>
      <h3 class="h2" style="margin-top:2px">${esc(t.title)}</h3>
      ${t.do ? doList(t.do) : ''}
      ${t.rows ? `<div class="week-rows">${t.rows.map(([d, x]) => `<div><b>${d}</b><span>${esc(x)}</span></div>`).join('')}</div>` : ''}
      ${t.lights ? `<div class="lights">${t.lights.map(([tone, label, text]) => `<div class="light"><span class="chip ${tone}"><span class="dot"></span>${label}</span><p>${esc(text)}</p></div>`).join('')}</div>` : ''}
      ${why(t.why, t.sources)}
    </section>`;
}

function station(s, i) {
  return `
    <section class="card guide-card rise" style="--i:${i + 1}">
      <details class="station" ${i === 0 ? 'open' : ''}>
        <summary>
          <span class="grow"><span class="eyebrow" style="display:block">${esc(s.spec)}</span><span class="h3" style="font-size:16px">${esc(s.name)}</span></span>
          <span class="station-times"><span>Rio <b class="mono">${esc(s.rio)}</b></span><span>Goal <b class="mono accent">${esc(s.goal)}</b></span></span>
          <span class="chev">${icons.chevron}</span>
        </summary>
        <div class="station-body">
          <div class="label">In the race</div>
          <ol class="cue-list">${s.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ol>
          ${s.train ? `<div class="label">How the plan trains it</div><p class="body-2">${esc(s.train)}</p>` : ''}
          ${s.rule ? `<div class="label">Rule to know</div><p class="body-2">${esc(s.rule)}</p>` : ''}
          ${why(s.why)}
        </div>
      </details>
    </section>`;
}

function zonesCard(i) {
  const tint = ['#3a3a33', '#2f5a41', '#5a5330', '#6b4a24', '#6e3328'];
  return `
    <section class="card guide-card rise" style="--i:${i}">
      <div class="eyebrow">Heart rate</div>
      <h3 class="h2" style="margin-top:2px">Your heart-rate zones</h3>
      <p class="small" style="margin:4px 0 6px">Based on your max heart rate (change it in Settings).</p>
      ${zones().map((z, k) => `
        <div class="zone-row">
          <span class="zone-tag" style="background:${tint[k]}">${z.id}</span>
          <span><div class="h3" style="font-size:14px">${z.name}</div><div class="small">${z.use}</div></span>
          <span class="num small" style="color:var(--text)">${z.lo ? `${z.lo}–${z.hi}` : `<${z.hi}`}</span>
        </div>`).join('')}
    </section>`;
}

function words() {
  return `
    <section class="card guide-card rise" style="--i:1">
      <dl class="glossary">${GLOSSARY.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
    </section>`;
}

function sources() {
  return `
    <section class="card rise" style="--i:1">
      <button class="link-btn" data-act="lib" data-sec="stations">${icons.chevronL} Back to the Library</button>
      <h3 class="h2" style="margin-top:10px">Research sources</h3>
      <p class="small" style="margin:4px 0 14px">The studies and coaching sources behind the plan. HYROX-specific research is still thin (one lab study of 11 athletes), so station advice mostly comes from experienced coaches and race data.</p>
      <ol class="src-list">${SOURCES.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ol>
    </section>`;
}

function body(id) {
  switch (id) {
    case 'training': return TRAINING.map(topic).join('') + zonesCard(TRAINING.length + 1);
    case 'shins': return SHINS.map(topic).join('');
    case 'food': return `<button class="card card-glass checkin-cta rise" style="--i:1;text-align:left;width:100%" data-act="open-food"><div class="pulse">${icons.food}</div><div class="grow"><div class="h3">Your meal plan</div><div class="small">Today's menu, shopping list and swaps, in the Food tab.</div></div>${icons.chevronR}</button>` + FOOD.map((t, i) => topic(t, i + 1)).join('');
    case 'words': return words();
    case 'sources': return sources();
    default: return STATIONS.map(station).join('');
  }
}

export function renderLibrary(ui) {
  const valid = [...SECTIONS.map(s => s.id), 'sources'];
  if (!valid.includes(ui.libSection)) ui.libSection = 'stations';
  const sec = SECTIONS.find(s => s.id === ui.libSection);
  return `
    <section class="rise" style="--i:0;padding:6px 4px 0">
      <div class="eyebrow">Your guide</div>
      <h1 class="h1" style="margin-top:4px">Library</h1>
    </section>
    ${ui.libSection !== 'sources' ? `
    <div class="seg" role="tablist" aria-label="Library sections">
      ${SECTIONS.map(s => `<button class="${ui.libSection === s.id ? 'on' : ''}" data-act="lib" data-sec="${s.id}" role="tab" aria-selected="${ui.libSection === s.id}">${s.label}</button>`).join('')}
    </div>
    <p class="body-2" style="padding:0 4px">${esc(sec.intro)}</p>` : ''}
    ${body(ui.libSection)}
    ${ui.libSection !== 'sources' ? `<button class="link-btn" style="align-self:center;padding:8px" data-act="lib" data-sec="sources">${icons.book} See the research sources</button>` : ''}`;
}
