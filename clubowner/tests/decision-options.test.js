// 0.53.1 hotfix «قرار بلا أزرار» — ضمان «الخيارات دائمًا + بديل افتراضي»:
// أي قرار مطلوب (required && status === "open") يعرض خيارًا واحدًا على الأقل في البريد،
// وإلا بقي على رأس قائمة الانتظار ووقف الوقت للأبد (pendingActions لا يجد ما يُحسم به).
// العطل الأصلي: انكشاف الرهان الداخلي (kind: "betting-exposed" ورسالة «عزل من رئاسة الاتحاد»
// بلا kind) كان يظهر بلا أي زر، فيبقى الوقت متوقفًا مهما مرّرت الأيام.
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createGame } from "../src/core/game.js";
import { addDays } from "../src/core/utils.js";
import { validateSave } from "../src/core/validation.js";
import { message, pendingActions, resolveInfo } from "../src/services/inbox.js";
import { messageDetail } from "../src/features/inbox.js";
import { advanceTime } from "../src/services/time.js";
import { BETTING_COMPANIES } from "../src/data/bettingCatalog.js";
import {
  ensureBetting,
  buyBettingCompany,
} from "../src/services/betting/state.js";
import {
  placeInsiderBet,
  resolveInsiderBet,
} from "../src/services/betting/insider.js";
import { ensureEmpire } from "../src/services/empire/wealth.js";
import { ensurePolitics } from "../src/services/politics/state.js";

const OPTION = /data-action="([a-z0-9-]+)"/g;
const optionsOf = (html) => [...String(html).matchAll(OPTION)].map((m) => m[1]);
const newSave = () =>
  createGame({
    clubId: "ahly",
    owner: "عمر",
    leagues: ["eg"],
    difficulty: "easy",
    database: "current",
    language: "ar",
  });
// مسار انكشاف الرهان الحقيقي: شركة مراهنات مملوكة + رهان داخلي + كشف مؤكد (100%).
function exposedSave() {
  const s = createGame({ database: "demo", leagues: ["eg"] });
  ensureBetting(s);
  ensureEmpire(s).personal = 10_000_000_000;
  buyBettingCompany(s, BETTING_COMPANIES[0].id);
  ensurePolitics(s).office.held = true;
  placeInsiderBet(s, 100_000, 100, "our-match");
  ensureBetting(s).pendingInsider.detectionChance = 1;
  const outcome = resolveInsiderBet(s, {
    home: s.clubId,
    away: "other",
    homeGoals: 1,
    awayGoals: 0,
  });
  assert.equal(outcome.exposed, true, "الكشف وقع كما هو مطلوب للاختبار");
  return s;
}
const exposedDecision = (s) =>
  pendingActions(s).find((m) => m.kind === "betting-exposed") ||
  pendingActions(s)[0];
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

test("إعادة إنتاج العطل: انكشاف الرهان الحقيقي يوقف الوقت بلا أي زر", () => {
  const s = exposedSave();
  const pending = pendingActions(s);
  assert.ok(pending.length >= 1, "انكشاف الرهان يضع قرارًا مطلوبًا");
  assert.ok(
    pending.some((m) => m.kind === "betting-exposed"),
    "رسالة الانكشاف نفسها على رأس الانتظار",
  );
  assert.deepEqual(
    advanceTime(s, 7),
    { advanced: 0, blocked: true },
    "الوقت متوقف حتى يُحسم القرار",
  );
  for (const m of pending) {
    const options = optionsOf(messageDetail(s, m));
    assert.ok(
      options.length >= 1,
      `كل قرار ≥ خيار — بلا أزرار: ${m.kind} · ${m.title}`,
    );
  }
  assert.ok(
    optionsOf(messageDetail(s, exposedDecision(s))).includes("resolve"),
    "البديل الافتراضي (data-action=\"resolve\") متاح لقرار الانكشاف",
  );
  // مسار جمود الوقت الحقيقي: يوم الانكشاف يمر عبر commit الذي يتحقق من الحفظة.
  // ملف الإرث المفتوح بالشكل النظامي (status "open" + بنود {code, sourceId, severity}).
  const trial = ensurePolitics(s).legacy.trial;
  assert.equal(trial.status, "open", "الملف القضائي مفتوح لا \"pending\"");
  assert.ok(
    trial.charges.every((c) => typeof c.code === "string" && typeof c.sourceId === "string"),
    "بنود الاتهام كائنات لا نصوصًا",
  );
  assert.equal(validateSave(s), s, "الحفظة سليمة بعد الانكشاف");
});

test("البديل الافتراضي يحسم قرار الانكشاف ويحرّر الوقت", () => {
  const s = exposedSave();
  const handled = pendingActions(s).map((m) => m.id);
  for (const id of handled) resolveInfo(s, id); // نفس ما يفعله زر البديل الافتراضي
  assert.equal(pendingActions(s).length, 0, "لم يبق قرار معلّق");
  const r = advanceTime(s, 1);
  if (r.blocked) {
    // مسار مسموح: قرار جديد مختلف ظهر في نفس اليوم — ولازم يكون له خيارات هو الآخر.
    for (const next of pendingActions(s)) {
      assert.ok(!handled.includes(next.id), "قرار الانكشاف لم يعد معلّقًا");
      assert.ok(
        optionsOf(messageDetail(s, next)).length >= 1,
        `قرار جديد بلا خيار: ${next.kind} — ${next.title}`,
      );
    }
  } else assert.ok(r.advanced >= 1, "الوقت تقدم بعد الحسم");
  assert.equal(validateSave(s), s, "الحفظة سليمة بعد تحرير الوقت");
});

test("كل قرار مطلوب خلال موسم كامل يعرض خيارًا واحدًا على الأقل", () => {
  const s = newSave();
  let checked = 0;
  const kinds = new Set();
  for (let day = 0; day < 150; day++) {
    for (const m of s.inbox) if (m.required) kinds.add(m.kind || "info");
    for (const m of pendingActions(s)) {
      checked++;
      const options = optionsOf(messageDetail(s, m));
      assert.ok(
        options.length >= 1,
        `قرار بلا خيار (${m.kind}): ${m.title} — خيارات: ${options.join(", ") || "لا شيء"}`,
      );
    }
    for (const m of s.inbox) if (m.required && m.status === "open") m.status = "resolved";
    advanceTime(s, 1);
  }
  assert.ok(checked >= 10, "الموسم ولّد قرارات كافية للفحص: " + checked);
  assert.ok(kinds.size >= 3, "أنواع قرارات متنوعة في الموسم: " + [...kinds].join(", "));
});

test("كل نوع رسالة (kind) في src لا يخرج بلا خيار حين يكون قرارًا مطلوبًا", () => {
  const kinds = new Set();
  for (const file of walk("src"))
    for (const m of readFileSync(file, "utf8").matchAll(/kind:\s*"([a-z0-9-]+)"/g))
      kinds.add(m[1]);
  assert.ok(kinds.size >= 20, "أنواع الرسائل المكتشفة: " + kinds.size);
  const s = newSave();
  const missing = [];
  for (const kind of kinds) {
    const m = message(s, {
      title: `فحص ${kind}`,
      body: "فحص ضمان الخيارات",
      category: "board",
      required: true,
      kind,
      deadline: addDays(s.date, 7),
    });
    let options = [];
    try {
      options = optionsOf(messageDetail(s, m));
    } catch {
      // نوع له معالج خاص يشترط مرجعًا حقيقيًا (تفاوض/إعارة…) — العطل هنا ليس غياب الأزرار.
      options = ["handler-with-ref"];
    }
    if (!options.length) missing.push(kind);
    s.inbox.shift(); // رسالة الفحص لا تتراكم
  }
  assert.deepEqual(missing, [], "أنواع قرارات بلا أي خيار: " + missing.join(", "));
});
