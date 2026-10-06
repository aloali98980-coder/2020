// Runtime i18n sweep (manual, ~30 s): simulates 400 days in two careers (current DB / expanded
// world DB, with a legend coach signed), then translates every generated string — inbox, ledger,
// players, clubs, events, cups, staff, legend contracts — and reports Arabic leftovers.
// The static scanner (scripts/i18n-coverage.mjs) cannot see runtime compositions; this can.
// Usage: node tests/i18n-runtime.mjs   (exit code 1 when leftovers remain)
import { createGame } from "../src/core/game.js";
import { advanceTime } from "../src/services/time.js";
import { setLanguage, translateText } from "../src/i18n/index.js";
import { signLegend } from "../src/services/legends.js";

const AR = /[ء-ي]/;
const leftovers = new Map();
const check = (t, where) => {
  if (typeof t !== "string" || !AR.test(t)) return;
  const out = translateText(t);
  if (!AR.test(out)) return;
  const k = out.replace(/\d+/g, "#");
  if (!leftovers.has(k)) leftovers.set(k, { src: t, where, n: 0 });
  leftovers.get(k).n++;
};
const careers = [
  {
    database: "current",
    leagues: ["eg", "en", "sa"],
    difficulty: "easy",
    clubId: "ahly",
  },
  {
    database: "world",
    expanded: true,
    leagues: ["eg", "en", "sa", "ma"],
    difficulty: "easy",
    clubId: "zamalek",
  },
];
for (const lang of ["en", "fr"]) {
  for (const cfg of careers) {
    setLanguage("ar");
    const s = createGame(cfg);
    if (cfg.clubId === "ahly") {
      try {
        signLegend(s, "elhadary", "gk", 1);
      } catch (e) {
        console.log("legend sign skipped:", e.message);
      }
    }
    for (let d = 0; d < 400; d++) {
      for (const m of s.inbox) if (m.required) m.status = "resolved";
      advanceTime(s, 1);
    }
    setLanguage(lang);
    for (const m of s.inbox) {
      check(m.subject, "inbox.subject");
      check(m.body, "inbox.body");
      check(m.category, "inbox.category");
    }
    for (const e of s.finance.ledger || []) {
      check(e.description, "ledger");
      check(e.category, "ledger.cat");
    }
    for (const o of s.finance.obligations || s.finance.commitments || [])
      check(o.description || o.label, "obligation");
    for (const p of s.players) {
      check(p.name, "player.name");
      check(p.role, "role");
      check(p.foot, "foot");
      check(p.nationality, "nat");
      check(p.status, "status");
    }
    for (const c of s.clubs || []) check(c.name, "club");
    for (const e of s.events || []) {
      check(e.title, "event.title");
      check(e.body || e.text, "event.body");
      for (const o of e.options || []) check(o.label || o.text, "event.option");
    }
    for (const c of s.expansion?.cups || []) {
      check(c.name, "cup.name");
      check(c.note, "cup.note");
    }
    for (const st of s.staff?.members || s.staff || []) {
      if (st && typeof st === "object") {
        check(st.name, "staff.name");
        check(st.role, "staff.role");
      }
    }
    for (const c of s.legends?.contracts || []) {
      check(c.name, "legend.name");
      check(c.role, "legend.role");
      check(c.note, "legend.note");
    }
    console.log(
      lang,
      cfg.database,
      "inbox",
      s.inbox.length,
      "players",
      s.players.length,
      "date",
      s.date,
      "legend contracts",
      s.legends?.contracts?.length || 0,
    );
  }
}
console.log("LEFTOVER kinds:", leftovers.size);
for (const [k, v] of [...leftovers]
  .sort((a, b) => b[1].n - a[1].n)
  .slice(0, 60))
  console.log(v.n, v.where, "|", v.src.slice(0, 160), "=>", k.slice(0, 160));
process.exit(leftovers.size ? 1 : 0);
