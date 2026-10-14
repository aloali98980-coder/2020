// In-memory localStorage + a minimal IndexedDB (only what src/services/save.js uses), so the save
// pipeline can be measured and tested in Node. put() structured-clones the value like a real
// IndexedDB does, so the copy cost of large snapshots is part of every measurement.
// Counters (`stats`) let tests assert how many physical writes a burst of decisions produced.
export const stats = { puts: 0, putBytes: 0, failNextPut: false, putDelayMs: 0 };

export function installMemoryStorage() {
  const ls = new Map();
  globalThis.localStorage = {
    getItem: (k) => (ls.has(k) ? ls.get(k) : null),
    setItem: (k, v) => void ls.set(k, String(v)),
    removeItem: (k) => void ls.delete(k),
    clear: () => ls.clear(),
    key: (i) => [...ls.keys()][i] ?? null,
    get length() {
      return ls.size;
    },
  };
  const dbs = new Map();
  const later = (fn, ms = 0) => setTimeout(fn, ms);
  const bytesOf = (v) =>
    v?.head ? v.head.byteLength + v.parts.reduce((n, p) => n + p.byteLength, 0) : 0;
  function transaction(store) {
    const tx = { oncomplete: null, onerror: null, onabort: null, error: null };
    let pending = 0,
      failed = false;
    const settle = () => {
      if (pending) return;
      later(() => (failed ? tx.onabort?.() : tx.oncomplete?.()));
    };
    const request = (fn, ms = 0) => {
      const r = { onsuccess: null, onerror: null, result: undefined, error: null };
      pending++;
      later(() => {
        try {
          r.result = fn();
          r.onsuccess?.();
        } catch (e) {
          failed = true;
          r.error = tx.error = e;
          r.onerror?.();
        }
        pending--;
        settle();
      }, ms);
      return r;
    };
    tx.objectStore = () => ({
      put(value, key) {
        stats.puts++;
        stats.putBytes += bytesOf(value);
        if (stats.failNextPut) {
          stats.failNextPut = false;
          return request(() => {
            throw new Error("QuotaExceededError (simulated)");
          });
        }
        const copy = structuredClone(value);
        return request(() => void store.set(key, copy), stats.putDelayMs);
      },
      get: (key) => request(() => store.get(key)),
      delete: (key) => request(() => void store.delete(key)),
      openKeyCursor() {
        const keys = [...store.keys()];
        let i = 0;
        const r = { onsuccess: null, result: null };
        pending++;
        const step = () =>
          later(() => {
            r.result =
              i < keys.length
                ? { key: keys[i], continue: () => (i++, step()) }
                : null;
            r.onsuccess?.();
            if (!r.result) {
              pending--;
              settle();
            }
          });
        step();
        return r;
      },
    });
    return tx;
  }
  globalThis.indexedDB = {
    open(name) {
      const r = { result: null, onsuccess: null, onerror: null, onupgradeneeded: null };
      later(() => {
        if (!dbs.has(name)) dbs.set(name, new Map());
        const store = dbs.get(name);
        r.result = {
          createObjectStore: () => {},
          transaction: () => transaction(store),
          close: () => {},
        };
        r.onsuccess?.();
      });
      return r;
    },
    deleteDatabase(name) {
      const r = {};
      later(() => (dbs.delete(name), r.onsuccess?.()));
      return r;
    },
  };
  return { ls, dbs };
}
