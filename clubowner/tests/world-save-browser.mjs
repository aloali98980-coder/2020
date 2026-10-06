import { chromium, webkit } from "@playwright/test";
import assert from "node:assert/strict";
const results = [];
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const b = await type.launch();
  const p = await b.newPage();
  await p.goto("http://127.0.0.1:5173");
  const result = await p.evaluate(async () => {
    const { createGame } = await import("/src/core/game.js");
    const { saveGame, loadGame, importGame } =
      await import("/src/services/save.js");
    const { setState, getState, commit, isSaving } =
      await import("/src/core/store.js");
    const { ALL_MARKETS } = await import("/src/data/worldMarkets.js");
    const key = "clubowner.game.v1";
    const s = createGame({
      database: "world",
      leagues: ALL_MARKETS,
      expanded: true,
    });
    await saveGame(s);
    s.ticketPrice += 1;
    await saveGame(s);
    let old = await loadGame();
    const ticket = old.state.ticketPrice;
    setState(old.state);
    const original = Storage.prototype.setItem;
    let rejected = false;
    Storage.prototype.setItem = function (k, v) {
      if (k === key)
        throw new DOMException(
          "Test marker quota failure",
          "QuotaExceededError",
        );
      return original.call(this, k, v);
    };
    try {
      await commit((d) => {
        d.ticketPrice += 10;
      });
    } catch {
      rejected = true;
    } finally {
      Storage.prototype.setItem = original;
    }
    const markerFailure =
      rejected &&
      (await loadGame()).state.ticketPrice === ticket &&
      getState().ticketPrice === ticket &&
      !isSaving();
    const open = IDBFactory.prototype.open;
    rejected = false;
    IDBFactory.prototype.open = function () {
      throw new DOMException("Test storage failure", "QuotaExceededError");
    };
    try {
      await commit((d) => {
        d.ticketPrice += 20;
      });
    } catch {
      rejected = true;
    } finally {
      IDBFactory.prototype.open = open;
    }
    const dbFailure =
      rejected &&
      getState().ticketPrice === ticket &&
      (await loadGame()).state.ticketPrice === ticket;
    const op = commit((d) => {
      d.ticketPrice += 1;
    });
    let concurrentRejected = false;
    try {
      await commit((d) => {
        d.ticketPrice += 50;
      });
    } catch {
      concurrentRejected = true;
    }
    await op;
    const concurrency =
      concurrentRejected && (await loadGame()).state.ticketPrice === ticket + 1;
    // Compact JSON avoids allocating 26 MB of whitespace on top of the 51 MB data payload.
    const exportText = JSON.stringify(getState());
    const file = new File([exportText], "career.json", {
      type: "application/json",
    });
    const imported = await importGame(file);
    const roundTrip =
      imported.players.length === s.players.length &&
      imported.ticketPrice === ticket + 1;
    await saveGame(imported);
    const currentMarker = JSON.parse(localStorage.getItem(key));
    await new Promise((resolve, reject) => {
      const request = indexedDB.open("clubowner.world.saves", 1);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("saves", "readwrite");
        tx.objectStore("saves").delete(currentMarker.key);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
    const restored = await loadGame();
    const backup = restored.backup && restored.state.ticketPrice === ticket + 1;
    await saveGame(s);
    const legacy = createGame({ database: "current" });
    await saveGame(legacy);
    const legacyRoundTrip = (await loadGame()).state.database === "current";
    await saveGame(s);
    // A new world game can fall back to its preceding legacy career too.
    localStorage.setItem(key, "broken JSON");
    const legacyBackup = await loadGame();
    return {
      players: s.players.length,
      exportBytes: file.size,
      markerFailure,
      dbFailure,
      concurrency,
      roundTrip,
      backup,
      legacyRoundTrip,
      legacyBackup:
        legacyBackup.backup && legacyBackup.state.database === "current",
    };
  });
  for (const k of [
    "markerFailure",
    "dbFailure",
    "concurrency",
    "roundTrip",
    "backup",
    "legacyRoundTrip",
    "legacyBackup",
  ])
    assert(result[k], `${engine}: ${k}`);
  results.push({ engine, ...result });
  await b.close();
}
console.log(JSON.stringify(results, null, 2));
