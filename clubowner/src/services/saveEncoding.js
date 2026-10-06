// Byte-identical compact JSON, but browser export avoids one giant UTF-16 string.
// Keep the largest arrays (players and fixture/history containers) in bounded batches.
function* pieces(value, depth = 0) {
  if (Array.isArray(value)) {
    yield "[";
    for (let i = 0; i < value.length; i += 128) {
      if (i) yield ",";
      const batch = JSON.stringify(value.slice(i, i + 128));
      yield batch.slice(1, -1);
    }
    yield "]";
  } else if (value && typeof value === "object" && depth < 2) {
    yield "{";
    let first = true;
    for (const key of Object.keys(value)) {
      const v = value[key];
      if (v === undefined || typeof v === "function" || typeof v === "symbol")
        continue;
      if (!first) yield ",";
      first = false;
      yield JSON.stringify(key) + ":";
      yield* pieces(v, depth + 1);
    }
    yield "}";
  } else yield JSON.stringify(value);
}
export function saveBlob(s) {
  const parts = [];
  for (const piece of pieces(s)) parts.push(new Blob([piece]));
  return new Blob(parts, { type: "application/json" });
}
