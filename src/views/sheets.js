/* Bottom sheets: daily check-in, weight, benchmark, settings, swap. */
import { store, save, dayKey, exportJSON, importJSON, resetAll } from '../store.js';
import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { scoreCheckin, STATUS } from '../logic/readiness.js';
import { BENCHMARKS } from '../data/benchmarks.js';
import { RACES } from '../data/races.js';
import { weekDays, swapSafety } from '../data/plan.js';
import { render, toast } from '../main.js';
import { wellnessOn, syncNow, syncAgo } from '../logic/sync.js';
import { RPE_LABELS, suggestedMinutes } from '../logic/load.js';
import { sessionFor } from '../data/plan.js';

const tone = (v, [g, y]) => (v <= g ? 'g' : v <= y ? 'y' : 'r');

function scaleQ(field, label, help, value, bands = [2, 4], { low = 'none', high = 'worst' } = {}) {
  return `
    <div class="q">
      <div class="q-label">${label}</div>
      <div class="q-help">${help}</div>
      <div class="scale" role="radiogroup" aria-label="${label}">
        ${Array.from({ length: 11 }, (_, i) => `<button role="radio" aria-checked="${value === i}" class="${value === i ? `on ${tone(i, bands)}` : ''}" data-act="draft" data-field="${field}" data-value="${i}">${i}</button>`).join('')}
      </div>
      <div class="scale-ends"><span>${low}</span><span>${high}</span></div>
    </div>`;
}

function optQ(field, label, help, value, opts) {
  return `
    <div class="q">
      <div class="q-label">${label}</div>
      ${help ? `<div class="q-help">${help}</div>` : ''}
      <div class="opts">
        ${opts.map(o => `<button class="opt ${value === o.v ? 'on' : ''} ${value === o.v && o.warn ? 'warn' : ''}" data-act="draft" data-field="${field}" data-value="${o.v}">${o.l}</button>`).join('')}
      </div>
    </div>`;
}

function checkinSheet(ui) {
  const d = ui.draft;
  const preview = scoreCheckin(d);
  const st = STATUS[preview.status];
  return `
    <div class="sheet-head">
      <div>
        <div class="eyebrow">Daily shin & soleus check · about 45 s</div>
        <div class="h1" style="margin-top:4px">How are the legs?</div>
      </div>
      <button class="icon-btn" data-act="close-sheet" aria-label="Close">${icons.close}</button>
    </div>
    ${scaleQ('morning', 'Shin / calf pain on your first steps today', 'Walking around after getting up. 0 = nothing, 10 = worst imaginable.', d.morning, [1, 3])}
    ${scaleQ('palpation', 'Press along the inner edge of the shin', 'Walk your thumb along the lower two thirds of the inside of the shinbone. Score the sorest point.', d.palpation)}
    ${optQ('focal', 'Is that pain in one spot about the size of a coin, or does it ache at night or at rest?', 'One sharp spot, night ache or pain at rest can mean a bone stress injury, not just shin splints.', d.focal, [{ v: false, l: 'No, diffuse or none' }, { v: true, l: 'Yes', warn: true }])}
    ${scaleQ('hop', '10 single-leg hops on the worse leg', 'Small, quick hops in place. Skip only if walking already hurts.', d.hop)}
    <div class="opts" style="margin-top:-4px">
      <button class="opt ${d.hopFail ? 'on warn' : ''}" data-act="draft" data-field="hopFail" data-value="${!d.hopFail}">Couldn't finish 10</button>
      <button class="opt ${d.hop === null && !d.hopFail ? 'on' : ''}" data-act="draft" data-field="hop" data-value="skip">Skipped</button>
    </div>
    ${scaleQ('runPain', 'Highest pain during yesterday\'s run', 'Leave on "No run" if you didn\'t run.', d.runPain, [3, 5])}
    <div class="opts" style="margin-top:-4px"><button class="opt ${d.runPain === null ? 'on' : ''}" data-act="draft" data-field="runPain" data-value="skip">No run yesterday</button></div>
    ${optQ('settled', 'Did yesterday\'s training soreness settle overnight?', 'Pain monitoring model: acceptable load settles by the next morning.', d.settled, [{ v: true, l: 'Yes / no soreness' }, { v: false, l: 'No, still there' }])}
    <div class="q">
      <div class="q-label">Sleep & energy</div>
      <div class="q-help">Changes the intensity of today's hard session, not the shin rules.${(() => { const w = wellnessOn(ui.date); return w?.sleepH ? ` Garmin: ${w.sleepH.toFixed(1)} h${w.hrv ? `, HRV ${Math.round(w.hrv)} ms` : ''}${w.rhr ? `, RHR ${w.rhr}` : ''}.` : ''; })()}</div>
      <div class="opts">${[5, 6, 7, 8, 9].map(h => `<button class="opt ${d.sleep === h ? 'on' : ''}" data-act="draft" data-field="sleep" data-value="${h}">${h === 5 ? '≤5' : h === 9 ? '9+' : h} h</button>`).join('')}</div>
      <div class="opts">${[1, 2, 3, 4, 5].map(v => `<button class="opt ${d.energy === v ? 'on' : ''}" data-act="draft" data-field="energy" data-value="${v}">${['Wrecked', 'Low', 'OK', 'Good', 'Great'][v - 1]}</button>`).join('')}</div>
    </div>
    <div class="card status-card ${preview.status}" style="margin:14px 0 16px">
      <div class="row">
        <div class="status-light"><span class="dot"></span></div>
        <div class="grow"><div class="status-title"><b>${st.label}</b> · ${st.title}</div><div class="small">${st.summary}</div></div>
      </div>
    </div>
    <button class="btn btn-primary btn-block" data-act="save-checkin">Save and adapt today</button>`;
}

function weightSheet() {
  const last = [...store.weights].sort((a, b) => a.date.localeCompare(b.date)).pop();
  return `
    <div class="sheet-head">
      <div><div class="eyebrow">Morning, after the bathroom, before food</div><div class="h1" style="margin-top:4px">Log weight</div></div>
      <button class="icon-btn" data-act="close-sheet" aria-label="Close">${icons.close}</button>
    </div>
    <div class="input-row">
      <div class="field grow"><label for="w-in">Kilograms</label>
        <input id="w-in" class="input" type="number" inputmode="decimal" step="0.1" min="60" max="140" value="${last ? last.kg : store.profile.weightKg}"></div>
      <div class="field" style="width:150px"><label for="w-date">Date</label><input id="w-date" class="input" type="date" value="${dayKey()}" style="font-size:14px"></div>
    </div>
    <div class="err" id="w-err"></div>
    <p class="small" style="margin:6px 0 16px">Daily weight swings 0.5–1.5 kg with water and glycogen. The app uses the 7-day average for the trend.</p>
    <button class="btn btn-primary btn-block" data-act="save-weight">Save</button>`;
}

function benchSheet(ui) {
  const b = BENCHMARKS.find(x => x.id === ui.sheet.id) || BENCHMARKS[0];
  return `
    <div class="sheet-head">
      <div><div class="eyebrow">Benchmark</div><div class="h1" style="margin-top:4px">${esc(b.name)}</div></div>
      <button class="icon-btn" data-act="close-sheet" aria-label="Close">${icons.close}</button>
    </div>
    <p class="body-2" style="margin-bottom:14px">${esc(b.how)}</p>
    <div class="input-row">
      <div class="field grow"><label for="b-in">${b.unit === 'time' ? 'Time (m:ss)' : esc(b.unitLabel || b.unit)}</label>
        <input id="b-in" class="input" ${b.unit === 'time' ? 'inputmode="numeric" placeholder="4:05"' : 'type="number" inputmode="decimal" step="any"'}></div>
      <div class="field" style="width:150px"><label for="b-date">Date</label><input id="b-date" class="input" type="date" value="${dayKey()}" style="font-size:14px"></div>
    </div>
    <div class="err" id="b-err"></div>
    <button class="btn btn-primary btn-block" style="margin-top:8px" data-act="save-bench" data-id="${b.id}">Save result</button>`;
}

function rpeSheet(ui) {
  const d = ui.draft;
  const key = ui.sheet.date;
  const s = sessionFor(key);
  const sug = suggestedMinutes(key);
  const load = d.rpe !== null && d.mins > 0 ? Math.round(d.rpe * d.mins) : null;
  return `
    <div class="sheet-head">
      <div>
        <div class="eyebrow">${esc(s?.title || 'Session')} · rate it now or within 30 min</div>
        <div class="h1" style="margin-top:4px">How hard was it?</div>
      </div>
      <button class="icon-btn" data-act="close-sheet" aria-label="Close">${icons.close}</button>
    </div>
    <p class="small">The whole session, not the hardest moment. This turns into your weekly training load and warns you about sudden jumps.</p>
    <div class="scale rpe" role="radiogroup" aria-label="Effort from 0 to 10">
      ${Array.from({ length: 11 }, (_, i) => `<button role="radio" aria-checked="${d.rpe === i}" class="${d.rpe === i ? 'on a' : ''}" data-act="draft" data-field="rpe" data-value="${i}">${i}</button>`).join('')}
    </div>
    <div class="rpe-label">${d.rpe === null ? 'Tap a number' : `<b>${d.rpe}</b> · ${RPE_LABELS[d.rpe]}`}</div>
    <div class="input-row" style="margin-top:14px">
      <div class="field grow"><label for="rpe-mins">Minutes of training (${sug.from === 'Garmin' ? `Garmin: ${sug.mins}` : 'from the plan'})</label>
        <input id="rpe-mins" class="input" type="number" inputmode="numeric" min="5" max="300" value="${d.mins}"></div>
    </div>
    <div class="err" id="rpe-err"></div>
    <button class="btn btn-primary btn-block" data-act="save-rpe" data-date="${key}">${load !== null ? `Save · load ${load}` : 'Save'}</button>`;
}

function settingsSheet() {
  const p = store.profile;
  const field = (id, label, val, step = 1) => `<div class="field"><label for="${id}">${label}</label><input id="${id}" class="input" type="number" inputmode="decimal" step="${step}" value="${val}"></div>`;
  return `
    <div class="sheet-head">
      <div><div class="eyebrow">Athlete & data</div><div class="h1" style="margin-top:4px">Settings</div></div>
      <button class="icon-btn" data-act="close-sheet" aria-label="Close">${icons.close}</button>
    </div>
    <div class="grid-2">
      ${field('p-age', 'Age', p.age)}
      ${field('p-height', 'Height (cm)', p.heightCm)}
      ${field('p-maxhr', 'Max HR (bpm)', p.maxHR)}
      ${field('p-resthr', 'Resting HR (bpm)', p.restHR)}
      ${field('p-target', 'Target weight (kg)', p.targetWeightKg, 0.1)}
      <div class="field"><label for="p-bike">Gym bike screen</label>
        <select id="p-bike" class="input" style="font-family:var(--font);font-size:15px">
          <option value="no" ${!p.bikeWatts ? 'selected' : ''}>No watts (effort + HR)</option>
          <option value="yes" ${p.bikeWatts ? 'selected' : ''}>Shows watts</option>
        </select></div>
      <div class="field"><label for="p-race">Target race</label>
        <select id="p-race" class="input" style="font-family:var(--font);font-size:15px">
          ${Object.values(RACES).map(r => `<option value="${r.id}" ${p.raceId === r.id ? 'selected' : ''}>${r.city}</option>`).join('')}
        </select></div>
    </div>
    <button class="btn btn-primary btn-block" style="margin-top:14px" data-act="save-settings">Save profile</button>
    <div class="divider"></div>
    <div class="h3">Garmin (via intervals.icu)</div>
    <p class="small" style="margin:4px 0 10px">${store.sync.token ? `Last sync ${syncAgo()}.${store.sync.error ? ` <span style="color:var(--red)">${esc(store.sync.error)}</span>` : ` ${store.sync.activities.length} workouts, ${Object.keys(store.sync.wellness).length} days of HRV/sleep stored.`}` : 'Paste the sync code you set as SYNC_TOKEN in Vercel. Setup steps are in Library → Garmin.'}</p>
    <div class="input-row">
      <div class="field grow"><label for="sync-token">Sync code</label><input id="sync-token" class="input" type="password" autocomplete="off" value="${esc(store.sync.token)}" placeholder="SYNC_TOKEN" style="font-size:14px"></div>
      <button class="btn btn-ghost" data-act="save-sync">${store.sync.token ? 'Sync now' : 'Connect'}</button>
    </div>
    <div class="divider"></div>
    <div class="h3">Backup</div>
    <p class="small" style="margin:4px 0 10px">Everything is stored on this phone only. Export a backup before clearing Safari or Chrome data, or to move to another phone.</p>
    <div class="grid-2">
      <button class="btn btn-ghost" data-act="export">${icons.download} Export</button>
      <label class="btn btn-ghost" style="cursor:pointer">${icons.upload} Import<input type="file" accept="application/json" id="import-file" hidden></label>
    </div>
    <div class="divider"></div>
    <button class="btn btn-ghost btn-block btn-sm" data-act="reset-all" style="color:var(--red)">Erase all data on this phone</button>`;
}

function swapSheet(ui) {
  const { week, from } = ui.sheet;
  const days = weekDays(week);
  return `
    <div class="sheet-head">
      <div><div class="eyebrow">Week ${week}</div><div class="h1" style="margin-top:4px">Move ${esc(days[from].label)}'s session</div></div>
      <button class="icon-btn" data-act="close-sheet" aria-label="Close">${icons.close}</button>
    </div>
    <p class="body-2" style="margin-bottom:12px">Swap with another day. The app warns you when two hard leg or engine days land back to back.</p>
    <div class="stack">
      ${days.map((d, i) => {
        if (i === from) return '';
        const safe = swapSafety(week, from, i);
        return `
        <button class="card tight row" style="text-align:left" data-act="do-swap" data-week="${week}" data-from="${from}" data-to="${i}">
          <div class="day-date" style="width:40px"><small>${d.dow}</small><span class="num">${d.dnum}</span></div>
          <div class="grow"><div class="h3">${esc(d.session.title)}</div>
            <div class="small" style="color:${safe.ok ? 'var(--green)' : 'var(--amber)'}">${esc(safe.msg)}</div></div>
          ${icons.swap}
        </button>`;
      }).join('')}
    </div>`;
}

export function renderSheet(ui) {
  const t = ui.sheet.type;
  const body = t === 'checkin' ? checkinSheet(ui)
    : t === 'weight' ? weightSheet(ui)
    : t === 'bench' ? benchSheet(ui)
    : t === 'swap' ? swapSheet(ui)
    : t === 'rpe' ? rpeSheet(ui)
    : settingsSheet(ui);
  return `<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${body}</div>`;
}

const ui_load = d => d.rpe * d.mins;

/* Draft for the effort sheet: existing rating, or Garmin / plan minutes. */
export function openRpeDraft(ui, key) {
  const d = store.done[key] || {};
  ui.sheet = { type: 'rpe', date: key };
  ui.draft = { rpe: d.rpe ?? null, mins: d.mins || suggestedMinutes(key).mins };
}

const parseTime = s => {
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

export function handleSheetAction(act, el, ui) {
  switch (act) {
    case 'sheet': {
      const type = el.dataset.type;
      ui.sheet = { type, id: el.dataset.id, week: Number(el.dataset.week), from: Number(el.dataset.from), date: el.dataset.date };
      if (type === 'rpe') openRpeDraft(ui, el.dataset.date);
      if (type === 'checkin') {
        const existing = store.checkins[ui.date];
        const w = wellnessOn(ui.date);
        const sleep = w?.sleepH ? Math.min(9, Math.max(5, Math.round(w.sleepH))) : 7;
        ui.draft = existing ? { ...existing } : { morning: 0, palpation: 0, focal: false, hop: 0, hopFail: false, runPain: null, settled: true, sleep, energy: 3 };
      }
      render();
      if (type === 'settings') {
        document.getElementById('import-file')?.addEventListener('change', async e => {
          const f = e.target.files?.[0];
          if (!f) return;
          try { importJSON(await f.text()); ui.sheet = null; render(); toast('Backup restored'); }
          catch (err) { toast(err.message || 'Could not read that file'); }
        });
      }
      return true;
    }
    case 'save-rpe': {
      const key = el.dataset.date;
      const mins = Number(document.getElementById('rpe-mins').value);
      if (ui.draft.rpe === null) { document.getElementById('rpe-err').textContent = 'Tap how hard it felt, 0 to 10.'; return true; }
      if (!(mins >= 5 && mins <= 300)) { document.getElementById('rpe-err').textContent = 'Enter the minutes you trained (5–300).'; return true; }
      store.done[key] = { items: {}, ...store.done[key], complete: true, rpe: ui.draft.rpe, mins: Math.round(mins) };
      save();
      ui.sheet = null; ui.draft = null;
      render(); toast(`Effort saved · load ${Math.round(ui_load(store.done[key]))}`);
      return true;
    }
    case 'close-sheet':
      ui.sheet = null; ui.draft = null; render(); return true;
    case 'draft': {
      const f = el.dataset.field;
      const minsIn = document.getElementById('rpe-mins');
      if (minsIn) ui.draft.mins = Number(minsIn.value) || ui.draft.mins;
      let v = el.dataset.value;
      if (v === 'true' || v === 'false') v = v === 'true';
      else if (v === 'skip') v = null;
      else v = Number(v);
      ui.draft[f] = v;
      render();
      return true;
    }
    case 'save-checkin': {
      const res = scoreCheckin(ui.draft);
      store.checkins[ui.date] = { ...ui.draft, status: res.status, readiness: res.readiness, ts: Date.now() };
      save();
      ui.sheet = null; ui.draft = null;
      render();
      toast(`${STATUS[res.status].label}: ${STATUS[res.status].title.toLowerCase()}`);
      return true;
    }
    case 'save-weight': {
      const kg = Number(document.getElementById('w-in').value);
      const date = document.getElementById('w-date').value || dayKey();
      if (!(kg > 50 && kg < 160)) { document.getElementById('w-err').textContent = 'Enter a weight between 50 and 160 kg.'; return true; }
      store.weights = store.weights.filter(w => w.date !== date).concat({ date, kg: Math.round(kg * 10) / 10 });
      save();
      ui.sheet = null; render(); toast(`${kg.toFixed(1)} kg logged`);
      return true;
    }
    case 'save-bench': {
      const b = BENCHMARKS.find(x => x.id === el.dataset.id);
      const raw = document.getElementById('b-in').value;
      const value = b.unit === 'time' ? parseTime(raw) : Number(raw);
      if (!Number.isFinite(value) || value <= 0) {
        document.getElementById('b-err').textContent = b.unit === 'time' ? 'Use minutes:seconds, for example 4:05.' : 'Enter a number.';
        return true;
      }
      const date = document.getElementById('b-date').value || dayKey();
      store.benchmarks.push({ id: b.id, date, value });
      save();
      ui.sheet = null; render(); toast('Result saved');
      return true;
    }
    case 'save-settings': {
      const num = id => Number(document.getElementById(id).value);
      const p = store.profile;
      p.age = num('p-age') || p.age;
      p.heightCm = num('p-height') || p.heightCm;
      p.maxHR = num('p-maxhr') || p.maxHR;
      p.restHR = num('p-resthr') || p.restHR;
      p.targetWeightKg = num('p-target') || p.targetWeightKg;
      p.raceId = document.getElementById('p-race').value;
      p.bikeWatts = document.getElementById('p-bike').value === 'yes';
      ui.raceId = p.raceId;
      save();
      ui.sheet = null; render(); toast('Profile saved');
      return true;
    }
    case 'save-sync': {
      store.sync.token = document.getElementById('sync-token').value.trim();
      save();
      el.textContent = 'Syncing…';
      el.setAttribute('disabled', '');
      syncNow().then(r => { render(); toast(r.ok ? 'Garmin data synced' : r.message); });
      return true;
    }
    case 'export': {
      const blob = new Blob([exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `hyrox-prep-backup-${dayKey()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return true;
    }
    case 'reset-all': {
      if (el.dataset.confirm !== '1') {
        el.dataset.confirm = '1';
        el.textContent = 'Tap again to erase everything';
        return true;
      }
      resetAll(); ui.sheet = null; render(); toast('All data erased');
      return true;
    }
    default:
      return false;
  }
}
