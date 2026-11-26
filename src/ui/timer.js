/* Full-screen interval timer with audio beeps, vibration and screen wake lock.
   A timer spec: { title, mode, warmup?, reps, work, rest, cooldown?, cue, restCue,
                   sets?: number, setRest?: seconds }  (all times in seconds)
   or { title, steps: [{ label, kind: 'work'|'rest'|'prep', secs, cue }] } */
import { icons } from './icons.js';

let ctx = null;
let muted = false;
let wakeLock = null;

function beep(freq = 880, dur = 0.12, vol = 0.25) {
  if (muted) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  } catch { /* audio unavailable */ }
}

function buzz(pattern) {
  try { navigator.vibrate?.(pattern); } catch { /* not supported */ }
}

async function lockScreen() {
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* not supported */ }
}
function releaseScreen() {
  try { wakeLock?.release(); } catch { /* ignore */ }
  wakeLock = null;
}

export function buildSteps(spec) {
  if (spec.steps) return spec.steps;
  const steps = [];
  if (spec.warmup) steps.push({ label: 'Warm-up', kind: 'prep', secs: spec.warmup, cue: spec.warmupCue || 'Easy, build gradually' });
  const sets = spec.sets || 1;
  for (let s = 0; s < sets; s++) {
    for (let r = 0; r < spec.reps; r++) {
      steps.push({ label: sets > 1 ? `Set ${s + 1} · Rep ${r + 1}` : `Rep ${r + 1} of ${spec.reps}`, kind: 'work', secs: spec.work, cue: spec.cue, rep: r, set: s });
      const last = r === spec.reps - 1;
      if (!last && spec.rest) steps.push({ label: 'Recover', kind: 'rest', secs: spec.rest, cue: spec.restCue || 'Easy spin, breathe' });
    }
    if (s < sets - 1 && spec.setRest) steps.push({ label: 'Set break', kind: 'rest', secs: spec.setRest, cue: 'Full recovery between sets' });
  }
  if (spec.cooldown) steps.push({ label: 'Cool-down', kind: 'prep', secs: spec.cooldown, cue: 'Easy Zone 1–2' });
  return steps;
}

const fmt = s => {
  s = Math.max(0, Math.ceil(s));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

export function openTimer(spec, onClose) {
  const steps = buildSteps(spec);
  const total = steps.reduce((a, s) => a + s.secs, 0);
  let idx = 0;
  let remaining = steps[0].secs;
  let running = false;
  let last = 0;
  let raf = 0;
  const workSteps = steps.filter(s => s.kind === 'work');

  const root = document.createElement('div');
  root.className = 'timer';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', `${spec.title} timer`);
  document.body.appendChild(root);
  lockScreen();

  function elapsed() {
    return steps.slice(0, idx).reduce((a, s) => a + s.secs, 0) + (steps[idx].secs - remaining);
  }

  function paint() {
    const st = steps[idx];
    const next = steps[idx + 1];
    const workIdx = workSteps.indexOf(st);
    root.className = `timer ${st.kind === 'work' ? 'work' : st.kind === 'rest' ? 'rest' : ''}`;
    root.innerHTML = `
      <div class="timer-top">
        <button class="icon-btn" data-t="close" aria-label="Close timer">${icons.close}</button>
        <div class="small" style="text-align:center">${spec.title}<br><span class="mono">${fmt(elapsed())} / ${fmt(total)}</span></div>
        <button class="icon-btn" data-t="mute" aria-label="${muted ? 'Unmute' : 'Mute'}">${muted ? icons.mute : icons.sound}</button>
      </div>
      <div class="timer-main">
        <div class="timer-phase">${st.kind === 'work' ? 'Work' : st.kind === 'rest' ? 'Recover' : st.label}</div>
        <div class="timer-clock" aria-live="off">${fmt(remaining)}</div>
        <div class="h3">${st.kind === 'prep' ? '' : st.label}</div>
        <div class="timer-cue">${st.cue || ''}</div>
        ${workSteps.length > 1 ? `<div class="timer-reps">${workSteps.map((w, i) => `<i class="${i < workIdx || (workIdx === -1 && steps.indexOf(w) < idx) ? 'done' : i === workIdx ? 'cur' : ''}"></i>`).join('')}</div>` : ''}
      </div>
      <div class="timer-progress"><i style="width:${(elapsed() / total) * 100}%"></i></div>
      <div class="timer-next">${next ? `Next: ${next.label} · ${fmt(next.secs)}` : 'Last block'}</div>
      <div class="timer-ctrls">
        <button class="btn btn-ghost" data-t="back" aria-label="Previous block">${icons.chevronL}</button>
        <button class="btn btn-primary" data-t="toggle">${running ? icons.pause + ' Pause' : icons.play + (elapsed() > 0 ? ' Resume' : ' Start')}</button>
        <button class="btn btn-ghost" data-t="skip" aria-label="Skip block">${icons.skip}</button>
      </div>`;
  }

  function advance() {
    if (idx >= steps.length - 1) {
      running = false;
      beep(660, 0.25); setTimeout(() => beep(880, 0.25), 260); setTimeout(() => beep(1100, 0.4), 520);
      buzz([200, 100, 200, 100, 400]);
      remaining = 0;
      paint();
      root.querySelector('.timer-phase').textContent = 'Done';
      root.querySelector('.timer-cue').textContent = 'Session logged. Cool down, then check your shins.';
      return;
    }
    idx++;
    remaining = steps[idx].secs;
    const k = steps[idx].kind;
    if (k === 'work') { beep(1046, 0.35, 0.3); buzz([300]); }
    else { beep(523, 0.35, 0.3); buzz([120, 80, 120]); }
    paint();
  }

  let lastWhole = Math.ceil(remaining);
  function tick(t) {
    if (!running) return;
    const dt = (t - last) / 1000;
    last = t;
    remaining -= dt;
    const whole = Math.ceil(remaining);
    if (whole !== lastWhole) {
      lastWhole = whole;
      if (whole <= 3 && whole > 0) beep(740, 0.08, 0.2);
      if (remaining <= 0) { advance(); lastWhole = Math.ceil(remaining); }
      else {
        const clock = root.querySelector('.timer-clock');
        if (clock) clock.textContent = fmt(remaining);
        const bar = root.querySelector('.timer-progress i');
        if (bar) bar.style.width = `${(elapsed() / total) * 100}%`;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function close() {
    running = false;
    cancelAnimationFrame(raf);
    releaseScreen();
    root.remove();
    document.removeEventListener('visibilitychange', onVis);
    onClose?.(elapsed() >= total * 0.8);
  }

  function onVis() { if (document.visibilityState === 'visible' && running) lockScreen(); }
  document.addEventListener('visibilitychange', onVis);

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    const a = b.dataset.t;
    if (a === 'close') return close();
    if (a === 'mute') { muted = !muted; paint(); return; }
    if (a === 'toggle') {
      running = !running;
      if (running) { beep(880, 0.1); last = performance.now(); raf = requestAnimationFrame(tick); }
      else cancelAnimationFrame(raf);
      paint();
      return;
    }
    if (a === 'skip') { advance(); return; }
    if (a === 'back') {
      if (steps[idx].secs - remaining > 3 || idx === 0) remaining = steps[idx].secs;
      else { idx--; remaining = steps[idx].secs; }
      lastWhole = Math.ceil(remaining);
      paint();
    }
  });

  paint();
}
