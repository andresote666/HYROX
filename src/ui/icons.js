/* Custom icon set — 24px grid, 1.75 stroke, round caps. */
const svg = (body, cls = 'ic') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  today: svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
  plan: svg('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/>'),
  race: svg('<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>'),
  food: svg('<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M5 3v5a2 2 0 0 0 2 2M9 3v5a2 2 0 0 1-2 2"/><path d="M17 21V3c-2.2 0-4 2.7-4 6v4h4"/>'),
  progress: svg('<path d="M4 19h16"/><path d="m5 15 4-5 4 3 6-7"/><circle cx="19" cy="6" r="1.2" fill="currentColor"/>'),
  library: svg('<path d="M5 4h4v16H5zM10 4h4v16h-4z"/><path d="m15.5 5.2 3.6-.9 3 15.5-3.6.9z"/>'),
  settings: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  chevron: svg('<path d="m6 9 6 6 6-6"/>', 'ic ic-sm'),
  chevronR: svg('<path d="m9 6 6 6-6 6"/>', 'ic ic-sm'),
  chevronL: svg('<path d="m15 6-6 6 6 6"/>', 'ic ic-sm'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'ic ic-sm'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  play: svg('<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>', 'ic'),
  pause: svg('<path d="M8 5v14M16 5v14"/>', 'ic'),
  skip: svg('<path d="m6 5 9 7-9 7z"/><path d="M18 5v14"/>', 'ic'),
  swap: svg('<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>', 'ic ic-sm'),
  shuffle: svg('<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>', 'ic ic-sm'),
  timer: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>', 'ic ic-sm'),
  bike: svg('<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h6l3.5 7.5M9 9 12 16.5h-2M14 6h2.5"/>', 'ic ic-sm'),
  row: svg('<path d="M3 18h18"/><path d="M6 18 15 8"/><circle cx="16.5" cy="6.5" r="1.8"/><path d="m11 13 4 2"/>', 'ic ic-sm'),
  run: svg('<circle cx="14.5" cy="4.5" r="1.8"/><path d="m8 21 3-6 3 2v4M6 12l3-4 4 1 3 3 3 .5M11 15l-1.5-4"/>', 'ic ic-sm'),
  dumbbell: svg('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>', 'ic ic-sm'),
  flame: svg('<path d="M12 21c4 0 6.5-2.6 6.5-6.3C18.5 10 13 7.5 13 3c-2.5 1.5-4 4.3-3.6 7-1-.6-1.8-1.6-2-2.8C5.9 8.8 5.5 11.2 5.5 14.7 5.5 18.4 8 21 12 21z"/>', 'ic ic-sm'),
  heart: svg('<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>', 'ic ic-sm'),
  scale: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8.5 9a5 5 0 0 1 7 0l-2.2 2.6"/>', 'ic ic-sm'),
  shin: svg('<path d="M9.5 3v9c0 1.4-.5 2.6-1.3 3.6l-1.6 2.1c-.6.8 0 1.8 1 1.8h9.2c.9 0 1.3-1 .8-1.7l-1.6-2V3"/><path d="M12.5 7.5v5"/>', 'ic ic-sm'),
  bolt: svg('<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>', 'ic ic-sm'),
  moon: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', 'ic ic-sm'),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 'ic ic-sm'),
  reset: svg('<path d="M3.5 4v5h5"/><path d="M4 13.5A8 8 0 1 0 6 7.2L3.5 9"/>', 'ic ic-sm'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', 'ic ic-sm'),
  alert: svg('<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.5h.01"/>', 'ic ic-sm'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', 'ic ic-sm'),
  upload: svg('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>', 'ic ic-sm'),
  target: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>', 'ic ic-sm'),
  book: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>', 'ic ic-sm'),
  sound: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>', 'ic ic-sm'),
  mute: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>', 'ic ic-sm'),
};

export const modeIcon = mode => ({
  run: icons.run, bike: icons.bike, row: icons.row, strength: icons.dumbbell,
  station: icons.flame, jump: icons.flame, calf: icons.shin, mobility: icons.heart,
}[mode] || icons.bolt);
