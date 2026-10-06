// 0.19 — translation completeness. Three layers are checked:
//  1. every Arabic literal in src/ (outside data packs) has an EN/FR dictionary entry (scanner gate);
//  2. the dictionary itself is sound (pairs, non-empty, no Arabic left in a translation);
//  3. translateText() behaves as documented: exact phrases, fragments around interpolations,
//     roster/world/legend names, and the editorial legend copy come out fully Latin.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  setLanguage,
  translateText,
  nameCount,
  excerpt,
} from "../src/i18n/index.js";
import { DICTIONARY } from "../src/i18n/dictionary.js";
import { LEGENDS, LEGEND_ROLES, LEGEND_GROUPS } from "../src/data/legends.js";
import { MARKETS } from "../src/data/worldMarkets.js";
import { LOCAL_SPONSORS } from "../src/data/localSponsors.js";
import { createGame } from "../src/core/game.js";

const ARABIC = /[ء-ي]/;

test("i18n coverage: no untranslated Arabic literal in src/ (scanner gate)", () => {
  const out = join(mkdtempSync(join(tmpdir(), "i18n-")), "coverage.json");
  execFileSync(process.execPath, ["scripts/i18n-coverage.mjs", "--json", out], {
    stdio: "pipe",
  });
  const report = JSON.parse(readFileSync(out, "utf8"));
  assert.ok(
    report.total >= 1800,
    "scanner should still see the whole UI: " + report.total,
  );
  const missing = report.missing.en.map((m) => m.phrase);
  assert.deepEqual(
    missing,
    [],
    "untranslated EN phrases: " + missing.slice(0, 10).join(" | "),
  );
  assert.deepEqual(
    report.missing.fr.map((m) => m.phrase),
    [],
    "untranslated FR phrases",
  );
});

test("dictionary entries are [en, fr] pairs without Arabic letters", () => {
  const entries = Object.entries(DICTIONARY);
  assert.ok(entries.length >= 2200, "dictionary size " + entries.length);
  for (const [ar, pair] of entries) {
    assert.ok(ARABIC.test(ar), "key should be Arabic: " + ar);
    assert.ok(Array.isArray(pair) && pair.length === 2, "pair shape for " + ar);
    for (const v of pair) {
      assert.equal(typeof v, "string", ar);
      assert.ok(v.trim().length > 0, "empty translation for " + ar);
      assert.ok(!ARABIC.test(v), `Arabic left in translation of "${ar}": ${v}`);
    }
  }
});

test("translateText: exact phrases, punctuation tolerance and digits", () => {
  setLanguage("en");
  assert.equal(translateText("السيولة لا تكفي"), "Insufficient cash");
  assert.equal(translateText("السيولة لا تكفي."), "Insufficient cash.");
  assert.equal(
    translateText(
      "٥ ملايين جنيه دخلت الخزينة. إجمالي السداد ٥٫٤ مليون على ١٢ دفعة كل ٣٠ يومًا. النموذج تمويلي مبسط، وليس عرضًا بنكيًا حقيقيًا",
    ),
    "EGP 5 million entered the treasury. Total repayment is 5.4 million over 12 instalments every 30 days. A simplified financing model, not a real bank offer",
  );
  assert.equal(translateText("١٢ لاعب"), "12 player");
  assert.equal(translateText("Manchester City"), "Manchester City");
  setLanguage("fr");
  assert.equal(translateText("السيولة لا تكفي"), "Trésorerie insuffisante");
  setLanguage("ar");
  assert.equal(translateText("السيولة لا تكفي"), "السيولة لا تكفي");
});

test("translateText: fragments around interpolated names and numbers", () => {
  setLanguage("en");
  assert.equal(
    translateText("انضمام محمد النجار إلى الجهاز"),
    "Staff arrival: Mohamed El-Naggar joins the staff",
  );
  assert.equal(
    translateText("وافق نيل كابيتال على طلبك"),
    "Accepted: Nile Capital agreed to your request",
  );
  assert.equal(
    translateText(
      "اعتزل بعد ١٢ مباراة و٣ هدفًا مع النادي. اسمه الآن على جدار القاعة",
    ),
    "Retired after 12 matches and 3 goals for the club. His name is now on the hall’s wall",
  );
  assert.equal(translateText("عمر شاهين · ST"), "Omar Shahin · ST");
  assert.ok(
    !ARABIC.test(translateText("محمد صلاح ينضم إلى الأهلي")),
    "star + club",
  );
  setLanguage("ar");
});

test("translateText: boundary rules — harakat, tatweel connector, punctuation-led keys, glued conjunction, bracketed names, excerpts", () => {
  setLanguage("en");
  // "مقدم" must not match inside "مقدمًا" (tanween is part of the word).
  assert.equal(
    translateText("استلمت ٢٥٪ مقدمًا، والباقي على ١١ دفعة كل ٣٠ يومًا."),
    "You received 25% upfront; the rest comes in 11 instalments every 30 days.",
  );
  // A key ending with the tatweel connector is glued to the next word.
  assert.equal(
    translateText(
      "انتهت مدة عمله كـمدرب حراس المرمى. يمكنك التعاقد معه مجددًا من قاعة الأساطير.",
    ),
    "His spell ended as Goalkeeping coach. You can sign him again from the Hall of Legends.",
  );
  // A key that starts with punctuation follows an Arabic word directly.
  assert.equal(
    translateText(
      "16 ناديًا · 4 مجموعات · ذهاب وإياب · نهائي ذهاب وإياب؛ التأهل والمقاعد والتواريخ والجوائز محاكاة",
    ),
    "16 clubs · 4 groups · home and away · Two-legged final; qualification, places, dates and prize money are simulated",
  );
  // Attribute lists joined with "و" become "and"/"et".
  assert.equal(translateText("التسديد وقرارات"), "Shooting and Decisions");
  setLanguage("fr");
  assert.equal(translateText("التسديد وقرارات"), "Frappe et Décisions");
  setLanguage("en");
  // Names keep their surrounding brackets/quotes; a bracketed alias key still resolves.
  assert.equal(translateText("(عصام الحضري)"), "(Essam El-Hadary)");
  assert.equal(translateText("ميدو (أحمد حسام)"), "Mido");
  assert.equal(
    translateText("x (محمد صلاح); أنهِ عقده أولًا."),
    "x (Mohamed Salah); end his contract first.",
  );
  // Lower-tier Egyptian clubs and pack rows that only had Arabic names.
  assert.equal(
    translateText("فاز طنطا على حرس الحدود"),
    "Won Tanta SC on Haras El Hodoud SC",
  );
  assert.equal(translateText("الهاني سليمان"), "El Hany Soliman");
  // Excerpt markup carries the full text so translateDOM can cut after translating.
  const html = excerpt(
    "وصلت عروض من شركات مصرية تجريبية. راجع القيمة والحصرية وجدول الدفع، أو ارفض الفرصة.",
    40,
  );
  assert.match(
    html,
    /^<span data-i18n-full="وصلت عروض من شركات مصرية تجريبية\. راجع القيمة[^"]*" data-i18n-max="40">/,
  );
  assert.ok(html.endsWith("…</span>"));
  setLanguage("ar");
});

test("identity map: reference roster, world pack, legends and markets resolve to Latin names", () => {
  setLanguage("en");
  assert.ok(nameCount() > 8000, "name map size " + nameCount());
  assert.equal(translateText("محمد صلاح"), "Mohamed Salah");
  assert.equal(translateText("بيليه"), "Pelé");
  assert.equal(translateText("ميدو (أحمد حسام)"), "Mido");
  for (const m of MARKETS)
    assert.ok(!ARABIC.test(translateText(m.nameAr)), "market " + m.nameAr);
  for (const [, name, sector] of LOCAL_SPONSORS) {
    assert.ok(!ARABIC.test(translateText(name)), "sponsor " + name);
    assert.ok(!ARABIC.test(translateText(sector)), "sector " + sector);
  }
  setLanguage("ar");
});

test("legends editorial copy (roles, groups, biographies, countries) is fully translated", () => {
  for (const lang of ["en", "fr"]) {
    setLanguage(lang);
    for (const g of Object.values(LEGEND_GROUPS))
      assert.ok(!ARABIC.test(translateText(g.name)), g.name);
    for (const r of Object.values(LEGEND_ROLES)) {
      assert.ok(!ARABIC.test(translateText(r.name)), r.name);
      assert.ok(!ARABIC.test(translateText(r.description)), r.description);
    }
    for (const l of LEGENDS) {
      for (const t of [
        l.name,
        l.bio,
        l.era,
        l.tier.name,
        l.countryName,
        ...l.clubs,
      ])
        assert.ok(
          !ARABIC.test(translateText(t)),
          `${lang}: ${t} -> ${translateText(t)}`,
        );
    }
  }
  setLanguage("ar");
});

test("a fresh career's generated state (inbox, roles, feet, nationalities) translates without Arabic leftovers", () => {
  const s = createGame({
    database: "current",
    leagues: ["eg"],
    difficulty: "easy",
    clubId: "ahly",
  });
  setLanguage("en");
  const leftovers = new Set();
  const check = (t) => {
    if (
      typeof t === "string" &&
      ARABIC.test(t) &&
      ARABIC.test(translateText(t))
    )
      leftovers.add(t);
  };
  for (const m of s.inbox) {
    check(m.subject);
    check(m.body);
  }
  for (const p of s.players) {
    check(p.name);
    check(p.role);
    check(p.foot);
    check(p.nationality);
  }
  for (const c of s.clubs || []) check(c.name);
  setLanguage("ar");
  assert.deepEqual(
    [...leftovers],
    [],
    "untranslated runtime strings: " + [...leftovers].slice(0, 8).join(" | "),
  );
});
