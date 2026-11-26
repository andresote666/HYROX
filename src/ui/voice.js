/* Spoken cues for the timers (Web Speech API, works offline on iOS and Android).
   iOS only allows speech after a tap, so the first cue is always spoken from
   the Start / Lap tap; later cues then work while the timer runs. */
import { store, save } from '../store.js';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
let voice = null;

function pickVoice() {
  if (!supported) return;
  const vs = window.speechSynthesis.getVoices();
  const en = vs.filter(v => /^en[-_]/i.test(v.lang));
  voice = en.find(v => /Samantha|Daniel|Karen|Moira|Google UK English|Google US English/i.test(v.name))
    || en.find(v => v.localService) || en[0] || null;
}
if (supported) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const voiceSupported = () => supported;
export const voiceOn = () => supported && store.profile.voice !== false;

export function toggleVoice() {
  store.profile.voice = !voiceOn();
  save();
  if (!store.profile.voice) stopVoice();
  return store.profile.voice;
}

export function stopVoice() {
  try { if (supported) window.speechSynthesis.cancel(); } catch { /* ignore */ }
}

/* Make plan text sound natural when read aloud. */
export function speakable(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/(\d)\s*[–-]\s*(\d)/g, '$1 to $2')
    .replace(/…/g, ', ')
    .replace(/~\s?/g, 'about ')
    .replace(/\brpm\b/g, 'R P M')
    .replace(/×/g, ' by ')
    .replace(/\bRPE\b/g, 'effort')
    .replace(/\bHR\b/g, 'heart rate')
    .replace(/\bspm\b/g, 'strokes per minute')
    .replace(/\bbpm\b/g, '')
    .replace(/\/500\s*m?/g, ' per 500')
    .replace(/(\d)\s?W\b/g, '$1 watts')
    .replace(/(\d)\s?s\b/g, '$1 seconds')
    .replace(/·/g, ',')
    .replace(/\+/g, ' plus')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* First sentence of a cue, if it is short enough to say mid-effort. */
export function shortCue(cue, max = 90) {
  const first = speakable(cue).split(/(?<=[.!?])\s/)[0] || '';
  return first.length <= max ? first : '';
}

export function spokenTime(secs) {
  const s = Math.round(Math.abs(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (!m) return `${r} second${r === 1 ? '' : 's'}`;
  if (!r) return `${m} minute${m > 1 ? 's' : ''}`;
  return `${m} minute${m > 1 ? 's' : ''} ${r}`;
}

export function say(text, { interrupt = true } = {}) {
  if (!voiceOn() || !text) return;
  try {
    const synth = window.speechSynthesis;
    if (!voice) pickVoice();
    if (interrupt) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || 'en-US';
    u.rate = 1.04;
    u.volume = 1;
    synth.speak(u);
  } catch { /* speech unavailable */ }
}
