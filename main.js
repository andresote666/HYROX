/* ═══════════════════════════════════════════════════════════
   HYROX PREP — Main Application
   Buenos Aires 2026 — 10-Week Training Plan
   ═══════════════════════════════════════════════════════════ */

import './style.css';
import { RACE_DATE, ATHLETE, PHASES, STATIONS, RACE_PACING, WEEKS } from './data.js';

// ── STATE ──
const state = {
  currentTab: 'training',
  selectedWeek: 1,
  expandedDay: null,
  checkedExercises: JSON.parse(localStorage.getItem('hyrox-checks') || '{}'),
  itBandStatus: localStorage.getItem('hyrox-itband') || 'green',
};

function saveChecks() {
  localStorage.setItem('hyrox-checks', JSON.stringify(state.checkedExercises));
}

// ── HELPERS ──
function getDaysUntilRace() {
  const now = new Date();
  const diff = RACE_DATE - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getCurrentWeek() {
  const start = new Date('2026-04-07');
  const now = new Date();
  const diff = now - start;
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(10, week));
}

function getPhaseForWeek(w) {
  return PHASES.find(p => p.weeks.includes(w));
}

function getWeekProgress(weekNum) {
  const weekData = WEEKS.find(w => w.week === weekNum);
  if (!weekData) return 0;
  let total = 0, checked = 0;
  weekData.days.forEach((day, di) => {
    day.blocks.forEach((block, bi) => {
      block.exercises.forEach((_, ei) => {
        total++;
        const key = `w${weekNum}-d${di}-b${bi}-e${ei}`;
        if (state.checkedExercises[key]) checked++;
      });
    });
  });
  return total ? Math.round((checked / total) * 100) : 0;
}

function getOverallProgress() {
  let total = 0, checked = 0;
  WEEKS.forEach(w => {
    w.days.forEach((day, di) => {
      day.blocks.forEach((block, bi) => {
        block.exercises.forEach((_, ei) => {
          total++;
          const key = `w${w.week}-d${di}-b${bi}-e${ei}`;
          if (state.checkedExercises[key]) checked++;
        });
      });
    });
  });
  return total ? Math.round((checked / total) * 100) : 0;
}

// ── SVG ICONS ──
const icons = {
  training: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="6" y1="7" x2="6" y2="3"/><line x1="18" y1="7" x2="18" y2="3"/><line x1="6" y1="17" x2="6" y2="21"/><line x1="18" y1="17" x2="18" y2="21"/></svg>`,
  race: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  stations: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  profile: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  chevron: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

// ── RENDER ──
function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderHeader()}
    ${renderPage()}
    ${renderNav()}
  `;
  bindEvents();
}

function renderHeader() {
  const days = getDaysUntilRace();
  return `
    <header class="app-header">
      <div class="header-row">
        <div class="app-logo">
          <div class="logo-mark">H</div>
          <div class="logo-text">
            <span class="logo-title">HYROX PREP</span>
            <span class="logo-subtitle">Buenos Aires 2026</span>
          </div>
        </div>
        <div class="header-countdown">
          <div class="countdown-number">${days}</div>
          <div class="countdown-label">days to race</div>
        </div>
      </div>
    </header>
  `;
}

function renderNav() {
  const tabs = [
    { id: 'training', label: 'Training', icon: icons.training },
    { id: 'race', label: 'Race Day', icon: icons.race },
    { id: 'stations', label: 'Stations', icon: icons.stations },
    { id: 'profile', label: 'Profile', icon: icons.profile },
  ];
  return `
    <nav class="bottom-nav">
      <div class="nav-inner">
        ${tabs.map(t => `
          <button class="nav-item ${state.currentTab === t.id ? 'active' : ''}" data-tab="${t.id}">
            ${t.icon}
            <span class="nav-label">${t.label}</span>
          </button>
        `).join('')}
      </div>
    </nav>
  `;
}

function renderPage() {
  switch (state.currentTab) {
    case 'training': return renderTrainingPage();
    case 'race': return renderRacePage();
    case 'stations': return renderStationsPage();
    case 'profile': return renderProfilePage();
    default: return '';
  }
}

// ── TRAINING PAGE ──
function renderTrainingPage() {
  const weekData = WEEKS.find(w => w.week === state.selectedWeek);
  const phase = getPhaseForWeek(state.selectedWeek);
  const progress = getWeekProgress(state.selectedWeek);
  const overall = getOverallProgress();

  return `
    <div class="page">
      <!-- Hero -->
      <div class="hero-banner">
        <div class="hero-phase" style="color:${phase.color}">Phase ${phase.id} — ${phase.name}${weekData.deload ? ' · DELOAD' : ''}${weekData.taper ? ' · TAPER' : ''}</div>
        <div class="hero-title">Week ${state.selectedWeek} of 10</div>
        <div class="hero-desc">${phase.description}</div>
        <div class="progress-bar mt-md">
          <div class="progress-fill" style="width:${overall}%"></div>
        </div>
        <div class="flex justify-between mt-sm">
          <span class="caption">Overall Progress</span>
          <span class="caption fw-600">${overall}%</span>
        </div>
      </div>

      <!-- Week Selector -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">Select Week</span>
          <span class="caption">${progress}% complete</span>
        </div>
        <div class="week-scroll">
          ${WEEKS.map(w => {
            const p = getWeekProgress(w.week);
            const isActive = w.week === state.selectedWeek;
            const isCompleted = p === 100;
            return `
              <button class="week-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-week="${w.week}">
                <span class="week-pill-number">${w.week}</span>
                <span class="week-pill-label">${w.deload ? 'DL' : w.taper ? 'TP' : 'WK'}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Day Cards -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">Daily Schedule</span>
        </div>
        ${weekData.days.map((day, di) => renderDayCard(day, di, state.selectedWeek)).join('')}
      </div>
    </div>
  `;
}

function renderDayCard(day, dayIndex, weekNum) {
  const isExpanded = state.expandedDay === `${weekNum}-${dayIndex}`;
  return `
    <div class="day-card ${isExpanded ? 'expanded' : ''}" data-day="${weekNum}-${dayIndex}">
      <div class="day-card-header">
        <div class="day-dot ${day.dotClass}"></div>
        <div class="day-info">
          <div class="day-name">${day.day}</div>
          <div class="day-type">${day.type}</div>
        </div>
        <div class="day-duration">${day.duration}</div>
        <div class="day-chevron">${icons.chevron}</div>
      </div>
      <div class="day-card-body">
        <div class="day-exercises">
          ${day.blocks.map((block, bi) => `
            <div class="exercise-group">
              <div class="exercise-group-title">${block.title}</div>
              ${block.exercises.map((ex, ei) => {
                const key = `w${weekNum}-d${dayIndex}-b${bi}-e${ei}`;
                const checked = state.checkedExercises[key];
                return `
                  <div class="exercise-row">
                    <div class="exercise-check ${checked ? 'checked' : ''}" data-key="${key}">
                      ${icons.check}
                    </div>
                    <div class="exercise-info">
                      <div class="exercise-name" style="${checked ? 'opacity:0.5;text-decoration:line-through' : ''}">${ex.name}</div>
                      ${ex.detail ? `<div class="exercise-detail">${ex.detail}</div>` : ''}
                    </div>
                    <div class="exercise-meta">
                      ${ex.sets ? `<div class="exercise-sets">${ex.sets}</div>` : ''}
                      ${ex.weight ? `<div class="exercise-weight">${ex.weight}</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── RACE PAGE ──
function renderRacePage() {
  return `
    <div class="page">
      <div class="hero-banner">
        <div class="hero-phase">Race Day Strategy</div>
        <div class="hero-title">HYROX Buenos Aires</div>
        <div class="hero-desc">June 13, 2026 · Open Singles · Target: Sub 1:30–1:40</div>
      </div>

      <!-- Pacing Plan -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">Pacing Plan</span>
          <span class="caption">~1:28 target</span>
        </div>
        <div class="race-flow">
          ${RACE_PACING.map(item => `
            <div class="race-item" data-type="${item.type}">
              <div class="race-item-label">${item.label}</div>
              <div class="race-item-detail">${item.pace} — ${item.note}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Race Checklist -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">Race Day Checklist</span>
        </div>
        <div class="card">
          ${[
            { text: 'Orthotics in race shoes', key: 'rc-1' },
            { text: 'Gloves or chalk for grip stations', key: 'rc-2' },
            { text: 'Water bottle with electrolytes', key: 'rc-3' },
            { text: 'Simple carbs (2-3h before)', key: 'rc-4' },
            { text: 'Warm up 20 min before start', key: 'rc-5' },
            { text: 'Mental rehearsal of pacing plan', key: 'rc-6' },
            { text: 'Energy gel for ~45 min mark', key: 'rc-7' },
          ].map(item => `
            <div class="checklist-item">
              <div class="exercise-check ${state.checkedExercises[item.key] ? 'checked' : ''}" data-key="${item.key}">
                ${icons.check}
              </div>
              <span style="font-size:14px;${state.checkedExercises[item.key] ? 'opacity:0.5;text-decoration:line-through' : ''}">${item.text}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- IT Band Monitor -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">IT Band Status</span>
        </div>
        <div class="card">
          <div class="body">How does your IT band feel today?</div>
          <div class="traffic-light">
            <div class="traffic-item traffic-green ${state.itBandStatus === 'green' ? 'selected' : ''}" data-itband="green">
              <div class="traffic-icon">🟢</div>
              <div class="traffic-label">Go</div>
            </div>
            <div class="traffic-item traffic-yellow ${state.itBandStatus === 'yellow' ? 'selected' : ''}" data-itband="yellow">
              <div class="traffic-icon">🟡</div>
              <div class="traffic-label">Caution</div>
            </div>
            <div class="traffic-item traffic-red ${state.itBandStatus === 'red' ? 'selected' : ''}" data-itband="red">
              <div class="traffic-icon">🔴</div>
              <div class="traffic-label">Stop</div>
            </div>
          </div>
          <div class="mt-lg body" style="font-size:13px;">
            ${state.itBandStatus === 'green' ? '✅ <strong>Full program</strong> — increase as planned. No pain during or after runs.' : ''}
            ${state.itBandStatus === 'yellow' ? '⚠️ <strong>Maintain volume</strong> — extra glute work, ice after. Dull ache after 5km+ that goes away.' : ''}
            ${state.itBandStatus === 'red' ? '🛑 <strong>Switch to bike/row for cardio</strong> — contact physio. Sharp pain before 2km or walking stairs.' : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── STATIONS PAGE ──
function renderStationsPage() {
  return `
    <div class="page">
      <div class="hero-banner">
        <div class="hero-phase">Know Your Stations</div>
        <div class="hero-title">8 Stations Breakdown</div>
        <div class="hero-desc">Open Men's specifications with your gym alternatives and race strategy.</div>
      </div>

      <div class="section">
        ${STATIONS.map(s => `
          <div class="station-card" data-type="station">
            <div class="station-number">Station ${s.num}</div>
            <div class="flex items-center gap-md">
              <span style="font-size:28px">${s.icon}</span>
              <div>
                <div class="station-name">${s.name}</div>
                <div class="station-specs">
                  <div class="station-spec">
                    <span class="station-spec-value">${s.distance}</span>
                    <span class="station-spec-label">Distance</span>
                  </div>
                  <div class="station-spec">
                    <span class="station-spec-value">${s.weight}</span>
                    <span class="station-spec-label">Weight</span>
                  </div>
                  <div class="station-spec">
                    <span class="station-spec-value">${s.targetTime}</span>
                    <span class="station-spec-label">Target</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="station-tips">
              ${s.tips.map(t => `<div class="station-tip">${t}</div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── PROFILE PAGE ──
function renderProfilePage() {
  const overall = getOverallProgress();
  return `
    <div class="page">
      <div class="hero-banner">
        <div class="hero-phase">Athlete Profile</div>
        <div class="hero-title">${ATHLETE.name}</div>
        <div class="hero-desc">${ATHLETE.division} · ${ATHLETE.race} · ${ATHLETE.goal}</div>
      </div>

      <!-- Progress -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">Training Progress</span>
        </div>
        <div class="card" style="text-align:center; padding:var(--space-xl)">
          <div class="progress-ring-container" style="margin:0 auto;width:120px;height:120px;">
            <svg class="progress-ring" width="120" height="120">
              <circle class="progress-ring-bg" cx="60" cy="60" r="52" stroke-width="8"/>
              <circle class="progress-ring-fill" cx="60" cy="60" r="52" stroke-width="8"
                stroke-dasharray="${2 * Math.PI * 52}"
                stroke-dashoffset="${2 * Math.PI * 52 * (1 - overall / 100)}"/>
            </svg>
            <span class="progress-ring-text">${overall}%</span>
          </div>
          <div class="caption mt-lg">Overall Plan Completion</div>
        </div>
      </div>

      <!-- Stats -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">Body Composition</span>
          <span class="caption">InBody Nov 2025</span>
        </div>
        <div class="profile-stat-grid">
          <div class="profile-stat">
            <div class="profile-stat-value">${ATHLETE.weight}<span style="font-size:14px;color:var(--text-tertiary)">kg</span></div>
            <div class="profile-stat-label">Weight</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${ATHLETE.height}<span style="font-size:14px;color:var(--text-tertiary)">cm</span></div>
            <div class="profile-stat-label">Height</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value ember">${ATHLETE.bodyFat}<span style="font-size:14px">%</span></div>
            <div class="profile-stat-label">Body Fat</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${ATHLETE.muscleMass}<span style="font-size:14px;color:var(--text-tertiary)">kg</span></div>
            <div class="profile-stat-label">Muscle Mass</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value ember">${ATHLETE.inbodyScore}</div>
            <div class="profile-stat-label">InBody Score</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${ATHLETE.bmr}</div>
            <div class="profile-stat-label">BMR (kcal)</div>
          </div>
        </div>
      </div>

      <!-- Lifts -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">Current Lifts</span>
        </div>
        <div class="card">
          ${[
            { label: 'Bench Press', value: ATHLETE.bench },
            { label: 'Squat', value: ATHLETE.squat },
            { label: 'Deadlift', value: ATHLETE.deadlift },
            { label: 'OHP', value: ATHLETE.ohp },
            { label: '10K Pace', value: ATHLETE.tenK },
          ].map(l => `
            <div class="flex justify-between items-center" style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.03)">
              <span class="text-secondary" style="font-size:14px">${l.label}</span>
              <span class="fw-700" style="font-size:14px;font-family:var(--font-display)">${l.value}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Equipment -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">Equipment Alternatives</span>
        </div>
        <div class="card">
          <div class="exercise-group-title" style="margin-bottom:8px">Missing Equipment → Gym Alternative</div>
          ${[
            { missing: 'SkiErg', alt: 'Med ball slams + Cable pulldowns + Band skiing' },
            { missing: 'Sled Push', alt: 'Treadmill push (off) + Heavy lunges + Band sprints' },
            { missing: 'Sled Pull', alt: 'Cable rope pulls + Towel rows + Heavy DB rows' },
          ].map(e => `
            <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.03)">
              <div class="fw-600 text-ember" style="font-size:13px">❌ ${e.missing}</div>
              <div class="text-secondary" style="font-size:13px;margin-top:2px">→ ${e.alt}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Reset -->
      <div class="section" style="text-align:center;padding-bottom:var(--space-3xl)">
        <button id="resetBtn" style="background:var(--surface-2);color:var(--text-tertiary);padding:12px 24px;border-radius:var(--radius-full);font-family:var(--font-display);font-size:12px;font-weight:600;letter-spacing:0.5px;border:1px solid var(--border)">
          Reset All Progress
        </button>
      </div>
    </div>
  `;
}

// ── EVENTS ──
function bindEvents() {
  // Nav tabs
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentTab = btn.dataset.tab;
      state.expandedDay = null;
      render();
    });
  });

  // Week pills
  document.querySelectorAll('.week-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedWeek = parseInt(btn.dataset.week);
      state.expandedDay = null;
      render();
    });
  });

  // Day cards expand/collapse
  document.querySelectorAll('.day-card-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.day-card');
      const dayKey = card.dataset.day;
      state.expandedDay = state.expandedDay === dayKey ? null : dayKey;
      render();
    });
  });

  // Exercise checks
  document.querySelectorAll('.exercise-check').forEach(check => {
    check.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = check.dataset.key;
      state.checkedExercises[key] = !state.checkedExercises[key];
      saveChecks();
      render();
    });
  });

  // IT band selector
  document.querySelectorAll('.traffic-item').forEach(item => {
    item.addEventListener('click', () => {
      state.itBandStatus = item.dataset.itband;
      localStorage.setItem('hyrox-itband', state.itBandStatus);
      render();
    });
  });

  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all training progress? This cannot be undone.')) {
        state.checkedExercises = {};
        saveChecks();
        render();
      }
    });
  }
}

// ── INIT ──
state.selectedWeek = getCurrentWeek();
render();

// Register SW for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
