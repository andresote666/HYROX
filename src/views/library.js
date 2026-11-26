import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { STATIONS, SCIENCE, SHINS, FUEL, GARMIN, SOURCES } from '../data/library.js';
import { zones } from '../logic/personalize.js';

const SECTIONS = [
  { id: 'stations', label: 'Stations' },
  { id: 'science', label: 'Engine' },
  { id: 'shins', label: 'Shins' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'zones', label: 'Zones' },
  { id: 'garmin', label: 'Garmin' },
  { id: 'sources', label: 'Sources' },
];

const ZONE_TINT = ['#3a3a33', '#2f5a41', '#5a5330', '#6b4a24', '#6e3328'];

function body(id) {
  switch (id) {
    case 'stations': return STATIONS.map((s, i) => `
      <section class="card lib-card rise" style="--i:${i + 1}">
        <details class="acc" ${i === 0 ? 'open' : ''}>
          <summary>
            <span><span class="eyebrow" style="display:block;font-weight:500">${esc(s.spec)}</span>${esc(s.name)}</span>
            <span class="row" style="gap:10px"><span class="num small" style="text-align:right">${esc(s.rio)}<br><span class="accent">${esc(s.target)}</span></span>${icons.chevron}</span>
          </summary>
          <div class="acc-body prose">${s.body}</div>
        </details>
      </section>`).join('');
    case 'science': return SCIENCE.map((s, i) => `
      <section class="card lib-card rise" style="--i:${i + 1}">
        <h3>${esc(s.title)}</h3>
        <div class="prose" style="margin-top:8px">${s.body}</div>
      </section>`).join('');
    case 'shins': return `<section class="card lib-card rise" style="--i:1"><h3>Shin splints & soleus</h3><div class="prose" style="margin-top:8px">${SHINS}</div></section>`;
    case 'fuel': return `<section class="card lib-card rise" style="--i:1"><h3>Fuel & weight</h3><div class="prose" style="margin-top:8px">${FUEL}</div></section>`;
    case 'garmin': return `<section class="card lib-card rise" style="--i:1"><h3>Garmin data</h3><div class="prose" style="margin-top:8px">${GARMIN}</div></section>`;
    case 'zones': return `
      <section class="card rise" style="--i:1">
        <h3 class="h3">Heart-rate zones</h3>
        <p class="small" style="margin:2px 0 8px">From your max HR in Settings. Bike and rower max HR often run a few beats lower than running.</p>
        ${zones().map((z, i) => `
          <div class="zone-row">
            <span class="zone-tag" style="background:${ZONE_TINT[i]}">${z.id}</span>
            <span><div class="h3" style="font-size:14px">${z.name}</div><div class="small">${z.use}</div></span>
            <span class="num small" style="color:var(--text)">${z.lo ? `${z.lo}–${z.hi}` : `<${z.hi}`}</span>
          </div>`).join('')}
      </section>
      <section class="card rise" style="--i:2">
        <h3 class="h3">Intensity by machine</h3>
        <div class="prose" style="margin-top:6px"><ul>
          <li><strong>Bike VO₂max (4×4):</strong> 85–92% of your 5-min test watts, 85–100 rpm, RPE 8–9.</li>
          <li><strong>Bike 30/15:</strong> 100–110% of 5-min power for the 30 s, ~50% for the 15 s.</li>
          <li><strong>Row threshold:</strong> 2k split + 6–10 s per 500 m, 24–28 spm. Watts = 2.80 ÷ (sec per m)³.</li>
          <li><strong>Row VO₂max:</strong> 2k split + 3–6 s per 500 m.</li>
          <li><strong>Zone 2:</strong> nasal breathing possible, full sentences.</li>
        </ul></div>
      </section>`;
    case 'sources': return `
      <section class="card rise" style="--i:1">
        <h3 class="h3">Sources</h3>
        <p class="small" style="margin:2px 0 14px">Peer-reviewed studies plus coach and race-data sources. HYROX-specific research is thin (one lab study, n=11), so most station advice is expert opinion. Full reports with evidence grades are in the repo's <span class="mono">/research</span> folder.</p>
        <ol class="src-list">${SOURCES.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ol>
      </section>`;
    default: return '';
  }
}

export function renderLibrary(ui) {
  return `
    <section class="rise" style="--i:0;padding:6px 4px 0">
      <div class="eyebrow">Research, condensed</div>
      <h1 class="h1" style="margin-top:4px">Library</h1>
    </section>
    <div class="seg" role="tablist" aria-label="Library sections">
      ${SECTIONS.map(s => `<button class="${ui.libSection === s.id ? 'on' : ''}" data-act="lib" data-sec="${s.id}" role="tab" aria-selected="${ui.libSection === s.id}">${s.label}</button>`).join('')}
    </div>
    ${body(ui.libSection)}`;
}
