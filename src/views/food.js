import { store, dayKey } from '../store.js';
import { icons } from '../ui/icons.js';
import { esc } from '../ui/components.js';
import { DAY_TYPES, totals, mealTotals, dayTypeFor, MAINTENANCE_ADD, LAST_YEAR, SWAPS, SHOPPING, PREP, RACE_FOOD } from '../data/meals.js';
import { sessionFor, weekOf } from '../data/plan.js';
import { calorieAdjust } from '../logic/learn.js';

const VIEWS = [
  { id: 'menu', label: 'Menu' },
  { id: 'shop', label: 'Shopping' },
  { id: 'swaps', label: 'Swaps' },
  { id: 'why', label: '2025 vs now' },
];

function menu(ui) {
  const today = dayKey();
  const session = sessionFor(today);
  const todayType = dayTypeFor(session);
  const type = ui.foodType || todayType;
  const d = DAY_TYPES[type];
  const hyroxDay = ['sim', 'station'].includes(session?.kind);
  const t = totals(type, { hyroxDay: type === 'big' ? hyroxDay : false });
  const { week } = weekOf(today);
  const maint = week >= 12;
  const adj = maint ? { delta: 0 } : calorieAdjust(week);
  const eaten = store.meals[today] || {};
  const meals = d.meals;
  const done = meals.filter(m => eaten[m.id]).length;

  return `
    <div class="seg" role="tablist" aria-label="Day type">
      ${Object.values(DAY_TYPES).map(x => `<button class="${type === x.id ? 'on' : ''}" data-act="food-type" data-type="${x.id}" role="tab" aria-selected="${type === x.id}">${x.short}${x.id === todayType ? ' · today' : ''}</button>`).join('')}
    </div>

    <section class="card rise" style="--i:1">
      <div class="eyebrow">${esc(d.when)}</div>
      <div class="h2" style="margin-top:2px">${esc(d.label)}${type === todayType && session ? ` <span class="small">· today: ${esc(session.title)}</span>` : ''}</div>
      <div class="stat-tiles" style="margin-top:12px">
        <div class="tile"><span class="num">${(t.kcal + (maint ? 300 : 0) + adj.delta).toLocaleString()}</span><small>kcal</small></div>
        <div class="tile"><span class="num">${t.p}</span><small>g protein</small></div>
        <div class="tile"><span class="num">${t.c + (maint ? 40 : 0) + Math.round(adj.delta / 4)}</span><small>g carbs</small></div>
        <div class="tile"><span class="num">${t.f + (maint ? 10 : 0)}</span><small>g fat</small></div>
      </div>
      ${adj.delta ? `<div class="note learned" style="margin-top:10px">${icons.bolt}<span><b style="color:var(--text)">${adj.delta > 0 ? '+' : '−'}${Math.abs(adj.delta)} kcal, learned from your weight.</b> ${esc(adj.why)}</span></div>` : ''}
      ${maint ? `<p class="small" style="margin-top:10px">${esc(MAINTENANCE_ADD)}</p>` : `<p class="small" style="margin-top:10px">Small deficit until week 11, so you lose ~0.3 kg a week without hurting training. Check the weight trend in Progress every 2 weeks.</p>`}
    </section>

    ${type === todayType ? `<div class="small" style="padding:0 4px">${done}/${meals.length} meals ticked today</div>` : ''}

    ${meals.map((m, i) => {
      const mt = mealTotals(m);
      const ticked = type === todayType && eaten[m.id];
      return `
      <section class="card meal-card ${ticked ? 'ticked' : ''} rise" style="--i:${i + 2}">
        <div class="row between">
          <div><div class="eyebrow">${esc(m.time)}</div><div class="h3" style="font-size:16px;margin-top:1px">${esc(m.name)}</div></div>
          ${type === todayType ? `<button class="meal-check" data-act="meal-tick" data-meal="${m.id}" aria-pressed="${!!ticked}" aria-label="Mark ${esc(m.name)} eaten"><span class="check">${icons.check}</span></button>` : ''}
        </div>
        <ul class="food-list">
          ${m.items.map(it => `<li><div><b>${esc(it.name)}</b>${it.note ? `<small>${esc(it.note)}</small>` : ''}</div><span>${esc(it.amount)}</span></li>`).join('')}
        </ul>
        <div class="small" style="margin-top:8px">≈ ${mt.kcal} kcal · ${mt.p} g protein</div>
      </section>`;
    }).join('')}`;
}

function shop() {
  const got = store.shopping || {};
  const all = SHOPPING.flatMap(g => g.items).length;
  const n = Object.values(got).filter(Boolean).length;
  return `
    <section class="card rise" style="--i:1">
      <div class="row between">
        <div><div class="eyebrow">One week · 2 big days, 4 training days, 1 rest day</div><div class="h2" style="margin-top:2px">Shopping list</div></div>
        <button class="link-btn" data-act="shop-reset">${icons.reset} Clear</button>
      </div>
      <p class="small" style="margin-top:4px">${n}/${all} in the basket. Tap an item when it's in your cart.</p>
      ${SHOPPING.map(g => `
        <div class="block-title" style="margin-top:16px">${esc(g.group)}</div>
        <div class="items">
          ${g.items.map(([id, name, qty]) => `
            <button class="item ${got[id] ? 'done' : ''}" data-act="shop-tick" data-id="${id}" aria-pressed="${!!got[id]}">
              <span class="check">${icons.check}</span>
              <span><div class="item-name">${esc(name)}</div><div class="item-detail">${esc(qty)}</div></span>
              <span></span>
            </button>`).join('')}
        </div>`).join('')}
    </section>`;
}

function swaps() {
  return `
    <section class="card guide-card rise" style="--i:1">
      <div class="eyebrow">Same calories, different food</div>
      <h3 class="h2" style="margin-top:2px">Swaps</h3>
      <div class="swap-list">${SWAPS.map(([a, b]) => `<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>
    </section>
    <section class="card guide-card rise" style="--i:2">
      <div class="eyebrow">Twice a week</div>
      <h3 class="h2" style="margin-top:2px">Meal prep</h3>
      <ul class="do-list">${PREP.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
    </section>
    <section class="card guide-card rise" style="--i:3">
      <div class="eyebrow">Santiago and Buenos Aires</div>
      <h3 class="h2" style="margin-top:2px">Race week</h3>
      <ul class="do-list">${RACE_FOOD.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
    </section>`;
}

function why() {
  const s = LAST_YEAR.said, a = LAST_YEAR.actual;
  const row = (label, x, y, z) => `<div class="cmp-row"><span>${label}</span><span class="num faint">${x}</span><span class="num faint">${y}</span><span class="num">${z}</span></div>`;
  const r = totals('rest'), tr = totals('training'), b = totals('big', { hyroxDay: false });
  return `
    <section class="card guide-card rise" style="--i:1">
      <div class="eyebrow">Your 2025 "45 Days Challenge" diet</div>
      <h3 class="h2" style="margin-top:2px">Good foods, wrong amounts for now</h3>
      <div class="cmp" style="margin-top:12px">
        <div class="cmp-row head"><span></span><span>Doc said</span><span>Foods gave</span><span>Now</span></div>
        ${row('Calories', s.kcal.toLocaleString(), a.kcal.toLocaleString(), `${r.kcal.toLocaleString()}–${b.kcal.toLocaleString()}`)}
        ${row('Protein', `${s.p} g`, `${a.p} g`, `${r.p}–${b.p} g`)}
        ${row('Carbs', `${s.c} g`, `${a.c} g`, `${r.c}–${b.c} g`)}
        ${row('Fat', `${s.f} g`, `${a.f} g`, `${r.f}–${tr.f} g`)}
      </div>
      <p class="small" style="margin-top:8px">"Now" depends on the day: rest day → big day.</p>
    </section>
    <section class="card guide-card rise" style="--i:2">
      <div class="eyebrow">Kept</div>
      <h3 class="h2" style="margin-top:2px">What was good</h3>
      <ul class="do-list">${LAST_YEAR.keep.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </section>
    <section class="card guide-card rise" style="--i:3">
      <div class="eyebrow">Changed</div>
      <h3 class="h2" style="margin-top:2px">What I adjusted</h3>
      <ul class="do-list">${LAST_YEAR.change.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <details class="why"><summary>${icons.info}<span>Why</span>${icons.chevron}</summary>
        <p>Athletes who lose weight slowly (under ~0.7% of body weight a week) keep more strength and power. Eating too little for your training lowers bone health and hormones, which matters with your shins. Protein around 2 g per kg protects muscle in a deficit, and carbs matched to the day keep hard sessions strong.</p>
        <p class="why-src">Research: Garthe 2011; IOC REDs consensus 2023; Jäger 2017; Impey 2018</p>
      </details>
    </section>`;
}

export function renderFood(ui) {
  const view = ui.foodView || 'menu';
  return `
    <section class="rise" style="--i:0;padding:6px 4px 0">
      <div class="eyebrow">Built from your 2025 diet</div>
      <h1 class="h1" style="margin-top:4px">What to eat</h1>
    </section>
    <div class="seg" role="tablist" aria-label="Food sections">
      ${VIEWS.map(v => `<button class="${view === v.id ? 'on' : ''}" data-act="food-view" data-view="${v.id}" role="tab" aria-selected="${view === v.id}">${v.label}</button>`).join('')}
    </div>
    ${view === 'shop' ? shop() : view === 'swaps' ? swaps() : view === 'why' ? why() : menu(ui)}`;
}
