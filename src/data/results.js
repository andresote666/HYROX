/* Race history. Times as m:ss strings; helpers convert. */

export const toSec = t => {
  if (!t) return 0;
  const p = String(t).split(':').map(Number);
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
};
export const fmtSec = (s, withHours = false) => {
  s = Math.round(s);
  const sign = s < 0 ? '-' : '';
  s = Math.abs(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  if (h || withHours) return `${sign}${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${sign}${m}:${ss}`;
};

export const SEGMENTS = [
  { id: 'r1', name: 'Run 1', type: 'run' },
  { id: 'ski', name: 'SkiErg', type: 'station', short: 'SKI' },
  { id: 'r2', name: 'Run 2', type: 'run' },
  { id: 'push', name: 'Sled Push', type: 'station', short: 'PSH' },
  { id: 'r3', name: 'Run 3', type: 'run' },
  { id: 'pull', name: 'Sled Pull', type: 'station', short: 'PLL' },
  { id: 'r4', name: 'Run 4', type: 'run' },
  { id: 'bbj', name: 'Burpee Broad Jump', type: 'station', short: 'BBJ' },
  { id: 'r5', name: 'Run 5', type: 'run' },
  { id: 'row', name: 'RowErg', type: 'station', short: 'ROW' },
  { id: 'r6', name: 'Run 6', type: 'run' },
  { id: 'farm', name: 'Farmers Carry', type: 'station', short: 'FAR' },
  { id: 'r7', name: 'Run 7', type: 'run' },
  { id: 'lunge', name: 'Sandbag Lunges', type: 'station', short: 'LNG' },
  { id: 'r8', name: 'Run 8', type: 'run' },
  { id: 'wb', name: 'Wall Balls', type: 'station', short: 'WB' },
  { id: 'rox', name: 'Roxzone (total)', type: 'rox', short: 'RZ' },
];

/* Rio de Janeiro — 21 Nov 2026, Open Men 35-39.
   Runs (48:01) + stations (48:10) + Roxzone (7:46) = total (±timing rounding). */
export const RIO_2026 = {
  id: 'rio26', name: 'HYROX Rio de Janeiro', date: '2026-11-21', total: '1:43:50',
  rankOverall: 1079, rankAG: 281, percentile: 'Top 79.4%',
  running: '48:01', stations: '48:10', roxzone: '7:46',
  splits: {
    r1: '5:19', ski: '4:25', r2: '5:50', push: '5:03', r3: '5:48', pull: '6:42', r4: '6:15',
    bbj: '10:03', r5: '5:51', row: '4:45', r6: '5:16', farm: '1:45', r7: '5:23', lunge: '6:23',
    r8: '8:19', wb: '9:04', rox: '7:46',
  },
  ranks: {
    r1: 1227, ski: 357, r2: 1174, push: 1283, r3: 965, pull: 1135, r4: 1112, bbj: 1290,
    r5: 933, row: 384, r6: 683, farm: 130, r7: 744, lunge: 1039, r8: 1209, wb: 1181, rox: 637,
  },
};

export const BA_2026 = {
  id: 'ba26', name: 'HYROX Buenos Aires', date: '2026-06-13', total: '1:42:00',
  splits: {
    r1: '5:27', ski: '4:13', r2: '6:50', push: '3:49', r3: '6:23', pull: '8:02', r4: '6:19',
    bbj: '10:46', r5: '8:24', row: '4:49', r6: '5:47', farm: '1:48', r7: '5:15', lunge: '6:20',
    r8: '4:21', wb: '7:29',
  },
};
