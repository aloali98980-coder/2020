// Strict "YYYY-MM-DD" check shared by the save validators. 0.20: memoised — a world save checks
// ~150,000 date strings per validation and most of them repeat (contract ends, reference dates).
const cache = new Map();
export const isoDate = (value) => {
  if (typeof value !== "string") return false;
  let ok = cache.get(value);
  if (ok === undefined) {
    ok = false;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const d = new Date(value + "T12:00:00Z");
      ok = Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
    }
    if (cache.size > 50000) cache.clear();
    cache.set(value, ok);
  }
  return ok;
};
