import test from "node:test";
import assert from "node:assert/strict";
import {
  DIVISIONS,
  EXPANDED_CLUBS,
  extendedClub,
  PYRAMID_COVERAGE,
} from "../src/data/expandedCatalog.js";
import {
  EXPANDED_CLUBS as oldClubs,
  DIVISIONS as oldDivisions,
} from "../src/data/legacyExpandedCatalog.js";
import { rankedPromotionMoves } from "../src/services/promotionRules.js";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { migrateSave } from "../src/core/migrations.js";
import {
  backupBlob,
  readBackup,
  MAX_SAVE_BYTES,
} from "../src/services/saveCompression.js";
import { saveBlob } from "../src/services/saveEncoding.js";
const division = (id, tier, clubs, country = "it") => ({
  id,
  country,
  tier,
  clubs,
  table: clubs.map((clubId, i) => ({
    clubId,
    points: 100 - i,
    played: 10,
    gf: 30 - i,
    ga: 5,
  })),
});
const ranked = (x) => new Map(x.divisions.map((d) => [d.id, d.clubs]));
function checkMoves(x, moves) {
  const after = new Map(x.divisions.map((d) => [d.id, [...d.clubs]]));
  assert.equal(new Set(moves.map((m) => m[0])).size, moves.length);
  for (const [id, from] of moves)
    after.set(
      from.id,
      after.get(from.id).filter((x) => x !== id),
    );
  for (const [id, , to] of moves) after.get(to.id).push(id);
  for (const d of x.divisions)
    assert.equal(after.get(d.id).length, d.clubs.length);
  assert.equal(
    new Set([...after.values()].flat()).size,
    x.divisions.flatMap((d) => d.clubs).length,
  );
  return after;
}
test("v08 requested depths, exact major group sizes and legacy lookup are distinct", () => {
  for (const c of ["en", "de", "fr", "it", "es", "eg"])
    assert.equal(
      Math.max(...DIVISIONS.filter((d) => d.country === c).map((d) => d.tier)),
      3,
    );
  assert.equal(
    DIVISIONS.some((d) => d.tier === 4),
    false,
  );
  assert.equal(
    DIVISIONS.some((d) => d.country === "sc" && d.tier > 2),
    false,
  );
  for (const [c, sizes] of [
    ["es", [20, 20]],
    ["it", [20, 20, 20]],
    ["fr", [18]],
    ["eg", [11, 10, 17, 16, 16]],
  ])
    assert.deepEqual(
      DIVISIONS.filter((d) => d.country === c && d.tier === 3).map(
        (d) => d.clubs.length,
      ),
      sizes,
    );
  assert.equal(DIVISIONS.find((d) => d.id === "pt-2").clubs.length, 18);
  assert.equal(DIVISIONS.find((d) => d.id === "nl-2").clubs.length, 20);
  for (const c of oldClubs) assert(extendedClub(c.id));
  for (const id of oldDivisions.find((d) => d.id === "en-4").clubs)
    assert(!DIVISIONS.flatMap((d) => d.clubs).includes(id));
});
test("v08 exact one-club one-division assignment, reserve parents and agreed top-only markets", () => {
  const ids = DIVISIONS.flatMap((d) => d.clubs);
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(ids.length, EXPANDED_CLUBS.length);
  assert.deepEqual(
    PYRAMID_COVERAGE.filter((c) => c.status === "top-only-agreed")
      .map((c) => c.country)
      .sort(),
    ["bo", "ma", "qa"],
  );
  for (const c of EXPANDED_CLUBS.filter((c) => c.reserve)) {
    assert(c.parentId);
    assert(extendedClub(c.parentId).tier < c.tier);
  }
});
test("all three Italian groups feed the upper division without double moves or changing group sizes", () => {
  const x = {
    divisions: [
      division("it-2", 2, [
        "u1",
        "u2",
        "u3",
        "u4",
        "u5",
        "u6",
        "u7",
        "u8",
        "u9",
        "u10",
        "u11",
        "u12",
      ]),
      ...["a", "b", "c"].map((g) =>
        division("it-3-" + g, 3, [g + "1", g + "2", g + "3", g + "4"]),
      ),
    ],
    clubRules: {},
  };
  const m = rankedPromotionMoves(x, ranked(x));
  checkMoves(x, m);
  const up = m.filter((m) => m[2].tier === 2);
  assert.equal(up.length, 4);
  for (const id of ["a1", "b1", "c1"]) assert(up.some((m) => m[0] === id));
});
test("Spanish regional champions plus ranked additional seats; German reserves cannot rise to level two", () => {
  const x = {
    divisions: [
      division(
        "es-2",
        2,
        Array.from({ length: 12 }, (_, i) => "u" + i),
        "es",
      ),
      division("es-3-a", 3, ["a", "b", "c", "d"], "es"),
      division("es-3-b", 3, ["e", "f", "g", "h"], "es"),
    ],
    clubRules: { a: { ceilingTier: 3 } },
  };
  const m = rankedPromotionMoves(x, ranked(x));
  checkMoves(x, m);
  assert(!m.some((m) => m[0] === "a"));
  assert.equal(m.filter((m) => m[2].tier === 2).length, 4);
});
test("parent and reserve cannot occupy the same level; bottom-boundary exchange is cancelled", () => {
  const x = {
    divisions: [
      division("nl-1", 1, ["p1", "p2", "p3", "p4", "p5", "parent"], "nl"),
      division("nl-2", 2, ["a", "b", "c", "reserve", "d", "e"], "nl"),
    ],
    clubRules: { reserve: { ceilingTier: 2, parentId: "parent" } },
  };
  const m = rankedPromotionMoves(x, ranked(x));
  checkMoves(x, m);
  assert(!m.some((m) => m[0] === "parent"));
  assert(!m.some((m) => m[0] === "reserve"));
});
test("reserve forced down when a modeled lower tier permits parent relegation", () => {
  const x = {
    divisions: [
      division("es-1", 1, ["p1", "p2", "p3", "p4", "p5", "parent"], "es"),
      division("es-2", 2, ["reserve", "a", "b", "c", "d", "e"], "es"),
      division("es-3-a", 3, ["f", "g", "h", "i", "j", "k"], "es"),
    ],
    clubRules: { reserve: { ceilingTier: 2, parentId: "parent" } },
  };
  const m = rankedPromotionMoves(x, ranked(x));
  checkMoves(x, m);
  assert(m.some((m) => m[0] === "parent" && m[2].tier === 2));
  assert(m.some((m) => m[0] === "reserve" && m[2].tier === 3));
});
test("closed US, Australian and Mexican connections never exchange", () => {
  for (const country of ["us", "au", "mx"]) {
    const low = division(country + "-2", 2, ["a", "b", "c", "d"], country);
    low.connection = "closed";
    const x = {
      divisions: [
        division(country + "-1", 1, ["u", "v", "w", "x"], country),
        low,
      ],
      clubRules: {},
    };
    assert.deepEqual(rankedPromotionMoves(x, ranked(x)), []);
  }
});
test("schema seven migration retains all values and old membership; current migration is idempotent", () => {
  const s = createGame({ database: "demo" });
  s.version = 7;
  const p = structuredClone(s.players),
    f = structuredClone(s.finance);
  const next = migrateSave(s);
  assert.equal(next.version, 23);
  assert.equal(s.version, 7);
  assert.deepEqual(next.players, p);
  assert.deepEqual(next.finance, f);
  assert.equal(migrateSave(next), next);
  validateSave(next);
});
test("streamed gzip backup is lossless and plain JSON remains accepted", async () => {
  const s = createGame({ database: "demo" });
  assert.equal(await saveBlob(s).text(), JSON.stringify(s));
  const b = await backupBlob({ ...s, database: "world" });
  assert.equal(b.extension, ".json.gz");
  assert.deepEqual(JSON.parse(await readBackup(b.blob)), {
    ...s,
    database: "world",
  });
  assert.equal(
    await readBackup(new Blob([JSON.stringify(s)])),
    JSON.stringify(s),
  );
  await assert.rejects(() => readBackup({ size: MAX_SAVE_BYTES + 1 }), /١٦٠/);
  await assert.rejects(() =>
    readBackup(new Blob([new Uint8Array([31, 139, 0, 7])])),
  );
});
test("local batched binary codec preserves JSON order and accepts actual old object snapshots", async () => {
  const { encodeLocalSave, decodeLocalSave } =
    await import("../src/services/localSaveCodec.js");
  const s = createGame({ database: "demo" }),
    packed = await encodeLocalSave(s);
  assert.equal(packed.format, "clubowner-json-parts-v1");
  assert.equal(
    JSON.stringify(await decodeLocalSave(packed)),
    JSON.stringify(s),
  );
  assert.equal(await decodeLocalSave(s), s);
  await assert.rejects(() => decodeLocalSave({ ...packed, playerCount: 1 }));
  await assert.rejects(() =>
    decodeLocalSave({ ...packed, parts: new Array(201) }),
  );
});
