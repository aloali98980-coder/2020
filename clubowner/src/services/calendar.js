import { addDays, daysBetween, dayNumber, dateFromDayNumber } from "../core/utils.js";
// The game's international windows are a scenario, not an official FIFA calendar.
// Each window is ten days long starting 03-20, 06-01, 09-05 and 11-10; the closing day never
// crosses a month boundary, so the test is a plain comparison of the MM-DD suffix (0.20: the old
// addDays round trip here was one of the hottest lines of the daily tick).
const WINDOWS = [
  ["03-20", "03-30"],
  ["06-01", "06-11"],
  ["09-05", "09-15"],
  ["11-10", "11-20"],
];
export const inInternationalWindow = (date) => {
  const md = date.slice(5);
  for (const [start, end] of WINDOWS) if (md >= start && md <= end) return true;
  return false;
};
const windowByDay = new Map();
const windowDay = (n) => {
  let v = windowByDay.get(n);
  if (v === undefined) {
    v = inInternationalWindow(dateFromDayNumber(n));
    if (windowByDay.size > 20000) windowByDay.clear();
    windowByDay.set(n, v);
  }
  return v;
};
export function cupFixtures(c) {
  return [
    "europe-v1",
    "continental-v1",
    "fifa-v1",
    "asia-v1",
    "concacaf-v1",
  ].includes(c.engine)
    ? c.fixtures
    : [...c.results, ...(c.pendingMatches || [])];
}
export function allFixtures(s) {
  return s.expansion
    ? [
        ...s.expansion.divisions.flatMap((d) => d.fixtures),
        ...s.expansion.cups.flatMap((c) => cupFixtures(c)),
        ...(s.expansion.playoffs || []).flatMap((p) => p.fixtures),
      ]
    : s.fixtures;
}
const byDateThenId = (a, b) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
// Fixtures involving one club, deduplicated and sorted, without materialising the whole world's
// fixture list first (called on every render and by the daily tick).
export function ownFixtures(s, clubId = s.clubId) {
  const seen = new Set();
  const out = [];
  const take = (f) => {
    if ((f.home === clubId || f.away === clubId) && !seen.has(f.id)) {
      seen.add(f.id);
      out.push(f);
    }
  };
  if (!s.expansion) {
    for (const f of s.fixtures) take(f);
  } else {
    for (const d of s.expansion.divisions) for (const f of d.fixtures) take(f);
    for (const c of s.expansion.cups) for (const f of cupFixtures(c)) take(f);
    for (const p of s.expansion.playoffs || []) for (const f of p.fixtures) take(f);
  }
  return out.sort(byDateThenId);
}
// Busy-day index keyed by club → set of day numbers (integers), so date scanning in availableDate
// is integer arithmetic instead of string parsing.
export function calendarIndex(fixtures) {
  const byClub = new Map();
  const reserve = (f) => {
    const n = dayNumber(f.date);
    for (const id of [f.home, f.away]) {
      let set = byClub.get(id);
      if (!set) byClub.set(id, (set = new Set()));
      set.add(n);
    }
  };
  for (const f of fixtures) reserve(f);
  return { byClub, reserve };
}
export function availableDate(calendar, home, away, earliest) {
  const h = calendar.byClub.get(home),
    a = calendar.byClub.get(away);
  let n = dayNumber(earliest);
  for (let attempt = 0; attempt < 1100; attempt++, n++) {
    if (windowDay(n)) continue;
    let busy = false;
    for (let d = -2; d <= 2; d++) {
      const day = n + d;
      if ((h && h.has(day)) || (a && a.has(day))) {
        busy = true;
        break;
      }
    }
    if (!busy) return dateFromDayNumber(n);
  }
  throw Error("تعذر إيجاد موعد آمن للمباراة.");
}
// Priority calendar: cup and play-off fixtures plus already-played league fixtures. Fixtures
// before the horizon are skipped: every caller searches from today or later, and availableDate's
// ±2-day window can never reach a day before today − 2, so the result is identical while the index
// stays small (0.20 — this was rebuilt from ~50,000 fixtures several times per simulated day).
export function cupPriorityCalendar(s, horizon = addDays(s.date, -2)) {
  const fixtures = [];
  for (const d of s.expansion.divisions)
    for (const f of d.fixtures) if (f.played && f.date >= horizon) fixtures.push(f);
  for (const c of s.expansion.cups)
    for (const f of cupFixtures(c)) if (f.date >= horizon) fixtures.push(f);
  for (const p of s.expansion.playoffs || [])
    for (const f of p.fixtures) if (f.date >= horizon) fixtures.push(f);
  return calendarIndex(fixtures);
}
// Stable (date, id) order via day buckets: O(n) instead of a comparator sort of ~40,000 fixtures.
function sortedByDateThenId(fixtures) {
  const buckets = new Map();
  for (const f of fixtures) {
    let b = buckets.get(f.date);
    if (!b) buckets.set(f.date, (b = []));
    b.push(f);
  }
  const dates = [...buckets.keys()].sort();
  const out = [];
  for (const date of dates) {
    const b = buckets.get(date);
    if (b.length > 1) b.sort((a, c) => (a.id < c.id ? -1 : a.id > c.id ? 1 : 0));
    for (const f of b) out.push(f);
  }
  return out;
}
export function rebalanceLeagueCalendar(s) {
  const calendar = cupPriorityCalendar(s);
  const pending = [];
  for (const d of s.expansion.divisions)
    for (const f of d.fixtures) if (!f.played) pending.push(f);
  const league = sortedByDateThenId(pending);
  const tomorrow = addDays(s.date, 1);
  for (const f of league) {
    const date = availableDate(
      calendar,
      f.home,
      f.away,
      f.date > s.date ? f.date : tomorrow,
    );
    if (date !== f.date) {
      f.originalDate = f.originalDate || f.date;
      f.date = date;
    }
    calendar.reserve(f);
  }
  delete s.expansion.calendarDirty;
}

export function restGap(a, b) {
  return Math.abs(daysBetween(a, b));
}
