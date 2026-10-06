const paths = {
  home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  inbox:
    '<path d="M4 4h16l2 12v4H2v-4z"/><path d="M2 16h6l2 3h4l2-3h6M8 8h8m-8 4h8"/>',
  squad:
    '<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2"/>',
  transfer: '<path d="M3 7h17m-5-5 5 5-5 5M21 17H4m5-5-5 5 5 5"/>',
  finance:
    '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V5l13-3v3m1 7h4v5h-4z"/><circle cx="17" cy="14.5" r=".5"/>',
  sponsor: '<path d="m8 3-5 3-2 6 5 2v8h12v-8l5-2-2-6-5-3a4 4 0 0 1-8 0Z"/>',
  stadium:
    '<ellipse cx="12" cy="7" rx="10" ry="4"/><path d="M2 7v10c0 5 20 5 20 0V7M6 10v9m12-9v9M2 14c3 4 17 4 20 0"/>',
  training:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 8h4v8H3m18-8h-4v8h4"/><circle cx="12" cy="12" r="3"/>',
  medical: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z"/>',
  academy: '<path d="m2 8 10-5 10 5-10 5-10-5Zm4 3v7c4 3 8 3 12 0v-7m4-3v8"/>',
  world:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
  settings:
    '<path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3z"/><circle cx="12" cy="12" r="3"/>',
  arrow: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  up: '<path d="m5 15 6-6 4 4 6-8m-6 0h6v6"/>',
  down: '<path d="m5 9 6 6 4-4 6 8m-6 0h6v-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  bell: '<path d="M5 10a7 7 0 0 1 14 0c0 8 3 7 3 8H2c0-1 3 0 3-8m6 11h2"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-12 5h2m3 0h2"/>',
  shield:
    '<path d="m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6Z"/><path d="m8 11 3 3 5-5"/>',
  crown: '<path d="m3 6 5 4 4-7 4 7 5-4-2 12H5ZM5 21h14"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v2"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
  building:
    '<path d="M4 21V7l8-4 8 4v14M1 21h22M8 9h1m6 0h1M8 13h1m6 0h1m-6 8v-4h4v4"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>',
  flag: '<path d="M5 22V3h14l-3 5 3 5H5"/>',
  chart: '<path d="M3 3v18h18M7 16v-4m5 4V6m5 10v-7"/>',
};
export function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`;
}
