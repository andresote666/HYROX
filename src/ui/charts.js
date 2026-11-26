/* Tiny dependency-free SVG charts. */

export function lineChart(points, { w = 320, h = 150, target = null, targetLabel = 'goal', yPad = 0.6, fmtY = v => v.toFixed(1), fmtX = d => d } = {}) {
  if (!points.length) return '';
  const pad = { l: 34, r: 10, t: 12, b: 22 };
  const ys = points.map(p => p.y).concat(target !== null ? [target] : []);
  let min = Math.min(...ys) - yPad;
  let max = Math.max(...ys) + yPad;
  if (max - min < 1) { min -= 0.5; max += 0.5; }
  const n = points.length;
  const x = i => pad.l + (n === 1 ? (w - pad.l - pad.r) / 2 : (i / (n - 1)) * (w - pad.l - pad.r));
  const y = v => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const area = `${path} L${x(n - 1).toFixed(1)},${h - pad.b} L${x(0).toFixed(1)},${h - pad.b} Z`;
  const ticks = [min, (min + max) / 2, max];
  const xLabels = n > 1 ? [0, n - 1] : [0];
  return `
  <svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Trend chart">
    <defs><linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#ebcb52" stop-opacity="0.22"/><stop offset="1" stop-color="#ebcb52" stop-opacity="0"/>
    </linearGradient></defs>
    ${ticks.map(t => `<line class="grid-l" x1="${pad.l}" x2="${w - pad.r}" y1="${y(t)}" y2="${y(t)}"/><text class="axis-t" x="${pad.l - 6}" y="${y(t) + 3}" text-anchor="end">${fmtY(t)}</text>`).join('')}
    ${target !== null ? `<line class="target" x1="${pad.l}" x2="${w - pad.r}" y1="${y(target)}" y2="${y(target)}"/><text class="axis-t" x="${w - pad.r}" y="${y(target) - 5}" text-anchor="end" style="fill:var(--green)">${targetLabel} ${fmtY(target)}</text>` : ''}
    ${n > 1 ? `<path class="area" d="${area}"/><path class="line" d="${path}"/>` : ''}
    ${points.map((p, i) => `<circle class="pt" cx="${x(i)}" cy="${y(p.y)}" r="${n > 20 ? 2 : 3.5}"/>`).join('')}
    ${xLabels.map(i => `<text class="axis-t" x="${x(i)}" y="${h - 6}" text-anchor="${i === 0 && n > 1 ? 'start' : 'end'}">${fmtX(points[i].x)}</text>`).join('')}
  </svg>`;
}

/* bars for shin pain by day: values 0–10 or null */
export function painBars(days, { w = 320, h = 110 } = {}) {
  const pad = { l: 4, r: 4, t: 8, b: 18 };
  const n = days.length;
  const bw = (w - pad.l - pad.r) / n;
  const yy = v => pad.t + (1 - v / 10) * (h - pad.t - pad.b);
  return `
  <svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Shin pain by day">
    <line class="target" x1="0" x2="${w}" y1="${yy(3)}" y2="${yy(3)}" style="stroke:var(--amber)"/>
    <text class="axis-t" x="${w - 2}" y="${yy(3) - 4}" text-anchor="end" style="fill:var(--amber)">3/10 limit</text>
    ${days.map((d, i) => {
      const x = pad.l + i * bw + bw * 0.18;
      const bwi = bw * 0.64;
      if (d.v === null) return `<rect class="bar-n" x="${x}" y="${h - pad.b - 3}" width="${bwi}" height="3" rx="1.5"/>`;
      const top = yy(Math.max(d.v, 0.4));
      const cls = d.status === 'red' ? 'bar-r' : d.status === 'yellow' ? 'bar-y' : 'bar-g';
      return `<rect class="${cls}" x="${x}" y="${top}" width="${bwi}" height="${h - pad.b - top}" rx="${Math.min(4, bwi / 2)}"/>`;
    }).join('')}
    ${days.map((d, i) => (i % Math.ceil(n / 7) === 0 || i === n - 1) ? `<text class="axis-t" x="${pad.l + i * bw + bw / 2}" y="${h - 4}" text-anchor="middle">${d.label}</text>` : '').join('')}
  </svg>`;
}

export function ring(value, max, label, sub) {
  const r = 32, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return `
  <div class="ring" role="img" aria-label="${label} ${sub}">
    <svg viewBox="0 0 76 76"><circle class="ring-track" cx="38" cy="38" r="${r}" fill="none" stroke-width="6"/>
    <circle class="ring-fill" cx="38" cy="38" r="${r}" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg>
    <div class="ring-label"><div><span class="num">${label}</span><small>${sub}</small></div></div>
  </div>`;
}
