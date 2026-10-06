// 0.20: pure-integer calendar arithmetic (proleptic Gregorian, days since 1970-01-01).
// The daily tick and the fixture calendar call these millions of times per season; the old
// Date.parse/toISOString round trip dominated the profile. Results are byte-identical to the old
// implementation for well-formed "YYYY-MM-DD" strings; anything else falls back to the legacy path
// so invalid input still throws exactly as before.
const digit = (s, i) => s.charCodeAt(i) - 48;
const wellFormed = (s) =>
  typeof s === "string" &&
  s.length === 10 &&
  s.charCodeAt(4) === 45 &&
  s.charCodeAt(7) === 45;
export function dayNumber(date) {
  if (!wellFormed(date)) return legacyDayNumber(date);
  const y0 =
    digit(date, 0) * 1000 +
    digit(date, 1) * 100 +
    digit(date, 2) * 10 +
    digit(date, 3);
  const m = digit(date, 5) * 10 + digit(date, 6);
  const d = digit(date, 8) * 10 + digit(date, 9);
  if (!(m >= 1 && m <= 12 && d >= 1 && d <= monthLength(y0, m)))
    return legacyDayNumber(date);
  const y = m <= 2 ? y0 - 1 : y0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (m > 2 ? m - 3 : m + 9) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
export function dateFromDayNumber(n) {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  const y = yoe + era * 400 + (m <= 2 ? 1 : 0);
  return (
    (y < 1000 ? String(y).padStart(4, "0") : String(y)) +
    (m < 10 ? "-0" : "-") +
    m +
    (d < 10 ? "-0" : "-") +
    d
  );
}
const monthLength = (y, m) =>
  m === 2
    ? (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
      ? 29
      : 28
    : m === 4 || m === 6 || m === 9 || m === 11
      ? 30
      : 31;
const legacyDayNumber = (date) => {
  const ms = Date.parse(date + "T12:00:00Z");
  if (Number.isNaN(ms)) new Date(NaN).toISOString(); // throws RangeError like before
  return Math.floor(ms / 86400000);
};
export const addDays = (date, n) => {
  if (!wellFormed(date) || !Number.isInteger(n))
    return new Date(Date.parse(date + "T12:00:00Z") + n * 86400000)
      .toISOString()
      .slice(0, 10);
  return dateFromDayNumber(dayNumber(date) + n);
};
export const daysBetween = (a, b) =>
  wellFormed(a) && wellFormed(b)
    ? dayNumber(b) - dayNumber(a)
    : Math.round(
        (Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) /
          86400000,
      );
export function uid(s, prefix) {
  s.nextId++;
  return `${prefix}-${s.nextId}`;
}
export function random(s) {
  let x = s.seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  s.seed = x >>> 0;
  return s.seed / 4294967296;
}
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
export function safeAmount(value) {
  assert(
    Number.isSafeInteger(value) && value >= 0,
    "القيمة المالية غير صالحة.",
  );
  return value;
}
