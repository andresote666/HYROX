/* Race simulation mode: a stopwatch with one big LAP button per run,
   Roxzone transition and station. Shows each part's target and how far
   ahead or behind the sub-1:30 plan you are. Uses wall-clock timestamps and
   saves after every tap, so a locked screen or app reload never loses it. */
import { store, save, dayKey } from '../store.js';
import { icons } from './icons.js';
import { esc } from './components.js';
import { fmtSec } from '../data/results.js';
import { lockScreen, releaseScreen, beep, buzz } from './timer.js';
import { say, stopVoice, toggleVoice, voiceOn, voiceSupported, spokenTime } from './voice.js';
import { saveSim } from '../logic/sim.js';

const signed = s => `${s < 0 ? '−' : '+'}${fmtSec(Math.abs(s))}`;
const aheadText = d => (Math.abs(d) < 2 ? 'on plan' : `${fmtSec(Math.abs(d))} ${d < 0 ? 'ahead' : 'behind'}`);

export function openSimTimer({ parts, title, date = dayKey() }, onClose) {
  /* live state is persisted in store.simLive */
  let live = store.simLive && store.simLive.title === title ? store.simLive : null;
  if (!live) live = { title, date, parts, laps: [], startedAt: null, pausedAt: null, pausedMs: 0 };
  let lastTap = 0;
  let closeArmed = false;
  let discardArmed = false;
  let iv = 0;

  const persist = () => { store.simLive = live.startedAt ? live : null; save(); };
  const now = () => Date.now();
  const elapsed = () => (!live.startedAt ? 0 : (live.pausedAt || now()) - live.startedAt - live.pausedMs);
  const idx = () => live.laps.length; // current part
  const finished = () => live.laps.length >= live.parts.length;
  const cumTarget = n => live.parts.slice(0, n).reduce((a, p) => a + p.target, 0);
  const deltaAfter = n => (n ? Math.round(live.laps[n - 1] / 1000) - cumTarget(n) : 0);
  const segElapsed = () => (elapsed() - (live.laps[idx() - 1] || 0)) / 1000;

  const root = document.createElement('div');
  root.className = 'timer sim';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Race simulation');
  document.body.appendChild(root);
  lockScreen();

  function topBar() {
    return `
      <div class="timer-top">
        <button class="icon-btn" data-s="close" aria-label="${live.startedAt && !finished() ? 'Hide (keeps timing)' : 'Close'}">${icons.close}</button>
        <div class="small" style="text-align:center">${esc(title)}<br><span class="mono sim-total">${fmtSec(elapsed() / 1000)}</span></div>
        ${voiceSupported() ? `<button class="icon-btn" data-s="voice" aria-pressed="${voiceOn()}" aria-label="${voiceOn() ? 'Turn voice cues off' : 'Turn voice cues on'}">${voiceOn() ? icons.voice : icons.voiceOff}</button>` : '<span style="width:44px"></span>'}
      </div>
      ${closeArmed ? '<div class="sim-warn">The clock keeps running. Tap × again to hide; reopen from Today or Race.</div>' : ''}`;
  }

  function readyView() {
    const tgt = cumTarget(live.parts.length);
    return `
      ${topBar()}
      <div class="sim-ready">
        <div class="eyebrow">Race simulation · target ${fmtSec(tgt)}</div>
        <div class="h1" style="margin-top:6px">Tap LAP the moment each part ends</div>
        <p class="small" style="margin-top:6px">Every run, every transition (Roxzone) and every station. Keep the phone in your hand or on the floor by the stations. Parts in grey are substitutes: timed, but they don't change your race prediction.</p>
        <ol class="sim-list">
          ${live.parts.map(p => `<li class="${p.kind} ${p.counts ? '' : 'sub'}"><span>${esc(p.label)}</span><span class="mono">${fmtSec(p.target)}</span></li>`).join('')}
        </ol>
      </div>
      <div class="timer-ctrls single"><button class="btn btn-primary sim-lap" data-s="start">${icons.play} Start</button></div>`;
  }

  function runView() {
    const i = idx();
    const p = live.parts[i];
    const next = live.parts[i + 1];
    const d = deltaAfter(i);
    const paused = !!live.pausedAt;
    return `
      ${topBar()}
      <div class="timer-main">
        <div class="timer-phase sim-phase ${p.kind}">${p.kind === 'rox' ? 'Roxzone' : p.kind === 'run' ? 'Run' : 'Station'}</div>
        <div class="h2 sim-name">${esc(p.label)}</div>
        <div class="timer-clock sim-clock">${fmtSec(segElapsed())}</div>
        <div class="sim-target">Target <b class="mono">${fmtSec(p.target)}</b> <span class="sim-over mono"></span></div>
        ${i ? `<div class="sim-delta ${d <= 0 ? 'ahead' : 'behind'}">${d <= 0 ? 'Ahead of' : 'Behind'} the plan · <b class="mono">${signed(d)}</b></div>` : ''}
        <div class="timer-reps sim-dots">${live.parts.filter(x => x.kind !== 'rox').map(x => { const k = live.parts.indexOf(x); return `<i class="${k < i ? 'done' : k === i || (p.kind === 'rox' && k === i + 1) ? 'cur' : ''}"></i>`; }).join('')}</div>
        ${paused ? `<button class="link-btn" data-s="discard" style="margin-top:10px">${discardArmed ? 'Tap again to discard this simulation' : 'Discard simulation'}</button>` : ''}
      </div>
      <div class="timer-next">${next ? `Next: ${esc(next.label)} · ${fmtSec(next.target)}` : 'Last part: LAP finishes the simulation'}</div>
      <div class="timer-ctrls">
        <button class="btn btn-ghost" data-s="undo" aria-label="Undo last lap" ${i ? '' : 'disabled'}>${icons.undo}</button>
        <button class="btn btn-primary sim-lap" data-s="lap" ${paused ? 'disabled' : ''}>${icons.flag} LAP</button>
        <button class="btn btn-ghost" data-s="pause" aria-label="${paused ? 'Resume' : 'Pause'}">${paused ? icons.play : icons.pause}</button>
      </div>`;
  }

  function doneView() {
    const total = Math.round(live.laps[live.laps.length - 1] / 1000);
    const tgt = cumTarget(live.parts.length);
    const rows = live.parts.map((p, k) => ({ ...p, secs: Math.round((live.laps[k] - (live.laps[k - 1] || 0)) / 1000) }));
    const rox = rows.filter(r => r.kind === 'rox');
    const roxSecs = rox.reduce((a, r) => a + r.secs, 0);
    const roxTgt = rox.reduce((a, r) => a + r.target, 0);
    const line = (name, secs, target, sub) => `<div class="sim-row ${sub ? 'sub' : ''}"><span>${esc(name)}</span><span class="mono">${fmtSec(secs)}</span><span class="mono faint">${fmtSec(target)}</span><span class="mono ${secs - target <= 0 ? 'good' : 'bad'}">${signed(secs - target)}</span></div>`;
    return `
      ${topBar()}
      <div class="sim-ready">
        <div class="eyebrow">Simulation finished</div>
        <div class="row" style="align-items:flex-end;gap:14px;margin-top:6px">
          <div class="big-time">${fmtSec(total)}</div>
          <div class="sim-delta ${total <= tgt ? 'ahead' : 'behind'}" style="margin:0 0 6px">${total <= tgt ? 'Ahead of' : 'Behind'} plan · <b class="mono">${signed(total - tgt)}</b></div>
        </div>
        <div class="sim-row head" style="margin-top:14px"><span>PART</span><span>TIME</span><span>TARGET</span><span>±</span></div>
        ${rows.filter(r => r.kind !== 'rox').map(r => line(r.label, r.secs, r.target, !r.counts)).join('')}
        ${rox.length ? line(`Roxzone (${rox.length} transitions)`, roxSecs, roxTgt) : ''}
      </div>
      <div class="timer-ctrls two">
        <button class="btn btn-ghost" data-s="discard">${discardArmed ? 'Tap again' : 'Discard'}</button>
        <button class="btn btn-primary" data-s="save">${icons.check} Save simulation</button>
      </div>`;
  }

  function paint() {
    root.className = `timer sim ${live.startedAt && !finished() ? (live.parts[idx()].kind === 'rox' ? 'rest' : 'work') : ''}`;
    root.innerHTML = !live.startedAt ? readyView() : finished() ? doneView() : runView();
  }

  function tickUi() {
    if (!live.startedAt || finished()) return;
    const t = root.querySelector('.sim-total');
    if (t) t.textContent = fmtSec(elapsed() / 1000);
    const c = root.querySelector('.sim-clock');
    const se = segElapsed();
    if (c) c.textContent = fmtSec(se);
    const over = root.querySelector('.sim-over');
    const p = live.parts[idx()];
    if (over) over.textContent = se > p.target ? `+${fmtSec(se - p.target)}` : '';
  }

  function lap() {
    const t = now();
    if (t - lastTap < 2000) return; // ignore double taps
    lastTap = t;
    live.laps.push(elapsed());
    persist();
    const i = idx();
    if (finished()) {
      beep(660, 0.25); setTimeout(() => beep(880, 0.25), 260); setTimeout(() => beep(1100, 0.4), 520);
      buzz([200, 100, 200, 100, 400]);
      const total = Math.round(live.laps[live.laps.length - 1] / 1000);
      const d = total - cumTarget(live.parts.length);
      say(`Finished. ${spokenTime(total)}. ${Math.abs(d) < 2 ? 'Right on plan.' : `${spokenTime(d)} ${d < 0 ? 'ahead of' : 'behind'} plan.`}`);
    } else {
      const p = live.parts[i];
      const done = live.parts[i - 1];
      beep(p.kind === 'rox' ? 523 : 1046, 0.25, 0.3);
      buzz([150]);
      const d = deltaAfter(i);
      const status = done.kind !== 'rox' && i > 1 ? ` ${aheadText(d)}.` : '';
      say(p.kind === 'rox' ? `Transition.${status}` : `${p.speak}. Target ${spokenTime(p.target)}.${status}`);
    }
    paint();
  }

  function close(result) {
    clearInterval(iv);
    stopVoice();
    releaseScreen();
    root.remove();
    document.removeEventListener('visibilitychange', onVis);
    onClose?.(result);
  }

  function onVis() { if (document.visibilityState === 'visible') { lockScreen(); paint(); } }
  document.addEventListener('visibilitychange', onVis);

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-s]');
    if (!b || b.disabled) return;
    const a = b.dataset.s;
    if (a !== 'close') closeArmed = false;
    if (a !== 'discard') discardArmed = false;
    switch (a) {
      case 'close':
        if (live.startedAt && !finished() && !closeArmed) { closeArmed = true; paint(); return; }
        return close({ saved: false, running: live.startedAt && !finished() });
      case 'voice':
        if (toggleVoice()) say('Voice cues on');
        paint(); return;
      case 'start':
        live.startedAt = now();
        lastTap = now();
        persist();
        beep(880, 0.15); buzz([200]);
        say(`Go. ${live.parts[0].speak}. Target ${spokenTime(live.parts[0].target)}.`);
        paint(); return;
      case 'lap': lap(); return;
      case 'undo':
        if (!live.laps.length) return;
        live.laps.pop();
        persist(); say('Lap undone'); paint(); return;
      case 'pause':
        if (live.pausedAt) { live.pausedMs += now() - live.pausedAt; live.pausedAt = null; say('Resumed'); }
        else { live.pausedAt = now(); say('Paused'); }
        persist(); paint(); return;
      case 'discard':
        if (!discardArmed) { discardArmed = true; paint(); return; }
        store.simLive = null; save();
        return close({ saved: false, discarded: true });
      case 'save': {
        const rec = saveSim(live);
        return close({ saved: true, record: rec });
      }
      default:
    }
  });

  iv = setInterval(tickUi, 250);
  paint();
}
