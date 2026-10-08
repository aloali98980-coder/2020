import {
  EVENT_CATALOG,
  FLAVOR_CATALOG,
  FLAVOR_LIMITS,
} from "../data/eventCatalog.js";
import { inScope } from "../data/events/conditions.js";
import { difficulty } from "../models/difficulty.js";
import { squad, initializeCareer } from "../models/player.js";
import {
  uid,
  addDays,
  assert,
  clamp,
  random,
  daysBetween,
} from "../core/utils.js";
import { message, closeThread } from "./inbox.js";
import { post, obligation } from "./finance.js";
import { makePlayer } from "../data/catalog.js";
import { addSuspicion, reduceSuspicion, ensureBlackFiles } from "./blackFiles.js";
import {
  applyEmpireGeneral,
  applyEmpireSpecial,
} from "./empire/eventEffects.js";

// 0.25 «نظام الأحداث الموسّع» — طبقتان بإيقاعين مختلفين:
//
//   ١) قرارات: حدث مهم كل `difficulty.eventInterval` يومًا (١٢–٢٨ حسب الصعوبة)،
//      ورسالة `required: true` توقف الزمن حتى تحسمها — هذا هو «ضابط الإزعاج» الأصلي.
//   ٢) نكهة: خبر قصير كل ٣ أيام على الأكثر، `required: false`، فلا يوقف الزمن أبدًا،
//      وأثره صغير ومعلن أو بلا أثر.
//
// لا يُعرض حدث إلا إذا تحققت بوابته `when(s)` على الحفظ الحالي، ولا يتكرر حدث
// ظهر مؤخرًا. إن لم يوجد حدث ممكن اليوم لا نُجبر شيئًا: نُعيد المحاولة لاحقًا.
const gate = (event, s) =>
  typeof event.when === "function" ? Boolean(event.when(s)) : true;

export const availableDecisions = (s) => EVENT_CATALOG.filter((e) => gate(e, s));
export const availableFlavor = (s) => FLAVOR_CATALOG.filter((e) => gate(e, s));

// أخبار النكهة لا تتكرر داخل الموسم: نتذكر ما صُرف خلال آخر ١٥٠ يوماً من البريد،
// ثم ننسى — فمسيرة من عشرين موسمًا لا تُحرم من الأخبار بعد موسم واحد.
const FLAVOR_REPEAT_WINDOW = 150;
const FLAVOR_GAP_DAYS = 3;
const FLAVOR_MIN_CAREER_DAYS = 3;
const FLAVOR_NEWS_CAP = 60;
const flavorRef = (id) => `flavor:${id}`;

const flavorLog = (s) =>
  s.inbox.filter(
    (m) =>
      m.kind === "flavor" &&
      typeof m.ref === "string" &&
      daysBetween(m.date, s.date) <= FLAVOR_REPEAT_WINDOW,
  );

function pick(s, pool) {
  return pool[Math.floor(random(s) * pool.length)];
}

// ── قرارات الإدارة ─────────────────────────────────────────────────────────
export function clubEventDay(s) {
  if (
    s.date < s.nextClubEventDate ||
    s.clubDecisions.some((e) => e.status === "open")
  )
    return null;
  const open = availableDecisions(s);
  if (!open.length) return null; // لا حدث ممكن اليوم: البوابات كلها مغلقة
  // التنويع: آخر ٨ أحداث في السجل + الحدث الأخير لا تعود، إلا إذا كان ذلك هو المتاح كله.
  const recent = new Set(s.clubDecisions.slice(-8).map((e) => e.type));
  recent.add(s.lastClubEvent);
  const fresh = open.filter((e) => !recent.has(e.id));
  const pool = fresh.length ? fresh : open.filter((e) => e.id !== s.lastClubEvent);
  if (!pool.length) return null;
  const data = pick(s, pool);
  const ev = {
    id: uid(s, "decision"),
    type: data.id,
    date: s.date,
    status: "open",
    choice: null,
  };
  s.clubDecisions.push(ev);
  s.lastClubEvent = data.id;
  s.nextClubEventDate = addDays(s.date, difficulty(s).eventInterval);
  message(s, {
    title: data.title,
    body: data.body,
    category: "events",
    required: true,
    kind: "club-decision",
    ref: ev.id,
    priority: "high",
  });
  return ev;
}

// توليد لاعب داخل عالم اللعبة: ناشئ أكاديمية (السلوك الأصلي) أو صفقة معلومة الشروط.
// كل الأسماء مولّدة ومعلَمة `fictional: true` — لا يُستدعى لاعب حقيقي من الحزم.
function addGeneratedPlayer(s, opts = {}) {
  const youth = Boolean(opts.youth);
  const serial = youth ? s.academyCount++ : ++s.academyCount;
  const labelAr = opts.labelAr || "موهبة جديدة ";
  const labelEn = opts.labelEn || "Academy prospect ";
  const p = makePlayer(
    uid(s, youth ? "youth" : "signing"),
    labelAr + serial,
    s.clubId,
    "eg",
    Math.floor(random(s) * 18),
    true,
  );
  p.nameLatin = labelEn + serial;
  p.fictional = true;
  p.age = opts.age ?? 17;
  p.rating = opts.rating ?? 55 + Math.floor(random(s) * 10);
  p.potential = Math.min(99, p.rating + (opts.potentialBonus ?? 15));
  for (const k of Object.keys(p.attributes)) p.attributes[k] = p.rating;
  p.salary = opts.wage ?? 25000;
  p.value = opts.value ?? 1000000;
  p.contractEnd = addDays(s.date, opts.contractDays ?? 730);
  p.morale = 70;
  p.fitness = 95;
  p.injuryUntil = null;
  initializeCareer(p, s.date);
  s.players.push(p);
  return p;
}

const youthCountOf = (c) =>
  typeof c.youth === "number" ? Math.max(0, Math.trunc(c.youth)) : c.youth ? 1 : 0;
const signingCountOf = (c) => (c.signing ? Math.max(1, c.signing.count || 1) : 0);

// الآثار الموجَّهة لفئة من القائمة (targets). قاعدة الإصابة حتمية لا عشوائية:
// الأيام الموجبة تُصيب «الأقل جاهزية» في الفئة، والسالبة تقصّر إصابة قائمة.
function applyTargets(s, targets) {
  const hit = [];
  for (const t of targets || []) {
    const players = inScope(s, t.scope);
    if (!players.length) continue;
    if (t.morale || t.fitness)
      for (const p of players) {
        p.morale = clamp(p.morale + (t.morale || 0), 0, 100);
        p.fitness = clamp(p.fitness + (t.fitness || 0), 0, 100);
      }
    const days = Math.trunc(t.injuryDays || 0);
    if (days < 0) {
      for (const p of players) {
        if (!p.injuryUntil || p.injuryUntil < s.date) continue;
        const left = daysBetween(s.date, p.injuryUntil) + days;
        p.injuryUntil = left > 0 ? addDays(s.date, left) : null;
        hit.push(p);
      }
    } else if (days > 0) {
      const candidates = players.filter(
        (p) => !p.injuryUntil || p.injuryUntil < s.date,
      );
      if (candidates.length) {
        const weakest = candidates.reduce((a, b) =>
          a.fitness <= b.fitness ? a : b,
        );
        weakest.injuryUntil = addDays(s.date, days);
        hit.push(weakest);
      }
    }
  }
  return hit;
}

// مرآة الخبر في ملف الصحافة إن كان موجودًا (الحفظات الموسعة فقط).
function pressRelease(s, title, type) {
  if (!s.press || !Array.isArray(s.press.news)) return false;
  s.press.news.unshift({ date: s.date, title, type });
  s.press.news = s.press.news.slice(0, FLAVOR_NEWS_CAP);
  return true;
}

// فرصة رعاية مجدولة عبر machinery القائمة نفسها (eventsDay في services/time.js).
function scheduleSponsorOffer(s, assetId, key) {
  if (!assetId) return null;
  const taken = s.events.some(
    (e) => e.type === "sponsor" && e.ref === assetId && !e.done,
  );
  if (taken) return null;
  const ev = {
    id: uid(s, "event"),
    type: "sponsor",
    date: addDays(s.date, 2),
    ref: assetId,
    done: false,
  };
  s.events.push(ev);
  void key;
  return ev;
}

export function resolveClubEvent(s, id, choiceId) {
  const ev = s.clubDecisions.find((e) => e.id === id);
  assert(ev?.status === "open", "الحدث تم حسمه بالفعل.");
  const data = EVENT_CATALOG.find((e) => e.id === ev.type),
    c = data.choices.find((c) => c.id === choiceId);
  assert(c, "قرار غير صالح.");
  assert(
    !(c.cash < 0) || s.finance.cash >= -c.cash,
    "السيولة لا تكفي لهذا القرار. اختر بديلًا مناسبًا.",
  );
  const incoming = youthCountOf(c) + signingCountOf(c);
  if (incoming)
    assert(
      squad(s).length + incoming <= (s.squadLimit || 30),
      "القائمة ممتلئة.",
    );
  if (c.cash)
    post(
      s,
      c.cash,
      "club-event",
      data.title + " — " + c.label,
      ev.id + "-decision",
    );
  for (const p of squad(s)) {
    p.morale = clamp(p.morale + (c.morale || 0), 0, 100);
    p.fitness = clamp(p.fitness + (c.fitness || 0), 0, 100);
  }
  s.fanSupport = clamp(s.fanSupport + (c.fans || 0), 0, 100);
  s.reputation = clamp(s.reputation + (c.reputation || 0), 0, 100);
  if (c.wageBudget)
    s.finance.wageBudget = Math.max(
      0,
      Math.round(s.finance.wageBudget + c.wageBudget),
    );
  if (c.ticketPrice)
    s.ticketPrice = Math.max(0, Math.round(s.ticketPrice + c.ticketPrice));
  if (c.capacity)
    s.capacity = Math.max(0, Math.round(s.capacity + c.capacity));
  applyTargets(s, c.targets);
  if (c.incomeLater)
    obligation(s, {
      amount: c.incomeLater,
      due: addDays(s.date, c.incomeDays || 30),
      category: "sponsor-income",
      description: c.incomeNote || "عائد الحملة التجارية",
      key: ev.id + "-income",
    });
  if (c.costLater)
    obligation(s, {
      amount: c.costLater,
      due: addDays(s.date, c.costDays || 30),
      category: "club-event",
      description: c.costNote || "التزام مترتب على قرار إداري",
      key: ev.id + "-cost",
    });
  for (let i = 0; i < youthCountOf(c); i++) addGeneratedPlayer(s, { youth: true });
  for (let i = 0; i < signingCountOf(c); i++) addGeneratedPlayer(s, c.signing);
  if (c.report) {
    const market = s.players.filter(
      (p) => p.clubId !== s.clubId && p.status !== "retired",
    );
    if (market.length) {
      const p = market[Math.floor(random(s) * market.length)];
      p.scoutReport = {
        date: s.date,
        min: Math.max(1, Math.round(p.potential - 7)),
        max: Math.min(99, Math.round(p.potential + 7)),
        confidence: 45,
      };
      message(s, {
        title: `تقرير مرشح: ${p.name}`,
        body: "تقرير مبدئي متاح في ملف اللاعب. تعيين كشاف محترف يمكن أن يحسن دقته.",
        category: "careers",
      });
    }
  }
  if (c.sponsorOffer) scheduleSponsorOffer(s, c.sponsorOffer, ev.id);
  if (c.press) pressRelease(s, data.title, "قرار إداري");
  // 0.28: آثار الملفات السوداء — parsing من note أو عبر معرفات محددة
  if (data.id.startsWith("black-")) {
    const bf = ensureBlackFiles(s);
    const note = c.note || "";
    // تحليل الشبهات من النص
    if (note.includes("+") || note.includes("الشبهات")) {
      const plusMatch = note.match(/\+(\d+)%/);
      if (plusMatch) addSuspicion(s, Number(plusMatch[1]));
      const minusMatch = note.match(/-(\d+)%/);
      if (minusMatch) reduceSuspicion(s, Number(minusMatch[1]));
    }
    // أحداث محددة
    if (data.id === "black-investigative-journalist") {
      if (choiceId === "refuse") addSuspicion(s, 5);
      if (choiceId === "pay-silence") { reduceSuspicion(s, 8); addSuspicion(s, 7); }
    }
    if (data.id === "black-former-employee-threat") {
      if (choiceId === "pay-off") reduceSuspicion(s, 10);
      if (choiceId === "legal-threat") addSuspicion(s, 8);
      if (choiceId === "expose-yourself") reduceSuspicion(s, 12);
    }
    if (data.id === "black-public-accusation") {
      if (choiceId === "counter-attack") addSuspicion(s, 6);
      if (choiceId === "silence") addSuspicion(s, 3);
    }
    if (data.id === "black-fixer-demands-more") {
      if (choiceId === "cut-network") { reduceSuspicion(s, 15); bf.active.agentOnPayroll = false; bf.active.agentSince = null; }
      if (choiceId === "negotiate") reduceSuspicion(s, 5);
    }
    if (data.id === "black-player-witness") {
      if (choiceId === "bonus-silence") reduceSuspicion(s, 4);
    }
    if (data.id === "black-unknown-fixer") {
      if (choiceId === "accept") addSuspicion(s, 10);
      if (choiceId === "report") reduceSuspicion(s, 12);
    }
    if (data.id === "black-routine-investigation") {
      if (choiceId === "full-coop") reduceSuspicion(s, 6);
      if (choiceId === "delay") addSuspicion(s, 5);
      if (choiceId === "gift") { reduceSuspicion(s, 8); /* +6% later handled as +3 now */ addSuspicion(s, 3); }
    }
    if (data.id === "black-worried-sponsor") {
      if (choiceId === "charity-pr") reduceSuspicion(s, 10);
    }
    if (data.id === "black-friendly-ref-stops") {
      if (choiceId === "threaten") addSuspicion(s, 12);
      if (choiceId === "accept-stop") { reduceSuspicion(s, 5); bf.active.refereeBias = null; }
      if (choiceId === "pay-extra" && bf.active.refereeBias) bf.active.refereeBias.until = addDays(bf.active.refereeBias.until, 7);
    }
    if (data.id === "black-recording-leak") {
      if (choiceId === "buy-recording") reduceSuspicion(s, 15);
      if (choiceId === "deny-fake") addSuspicion(s, 5);
      if (choiceId === "partial-confess") reduceSuspicion(s, 20);
    }
    if (data.id === "black-agent-salary-leak") {
      if (choiceId === "keep") addSuspicion(s, 3);
      if (choiceId === "cut") { reduceSuspicion(s, 15); bf.active.agentOnPayroll = false; bf.active.agentSince = null; }
      if (choiceId === "convert") reduceSuspicion(s, 8);
    }
  }
  // 0.29 «حياة الملياردير»: مفاتيح الثروة الشخصية والبرستيج والشهرة وسعادة
  // الزوجة، والميكانيكات الخاصة لكل حدث.
  if (data.id.startsWith("empire-")) {
    applyEmpireGeneral(s, c);
    applyEmpireSpecial(s, data.id, choiceId);
  }
  if (c.note)
    message(s, { title: "أثر القرار على النادي", body: c.note, category: "events" });
  ev.status = "resolved";
  ev.choice = choiceId;
  ev.resolvedOn = s.date;
  closeThread(s, id);
  message(s, {
    title: "تم تنفيذ قرار الإدارة",
    body:
      data.title + " — " + c.label + ". الآثار سُجلت في الحسابات وحالة النادي.",
    category: "events",
  });
  return ev;
}

// ── أخبار النكهة ───────────────────────────────────────────────────────────
// خبر قصير يدخل البريد كرسالة «للعلم»: لا `required`، فلا توقيف للزمن، ولا قرار.
// الأثر — إن وُجد — صغير ومعلن، ويُنفَّذ مرة واحدة بمفتاح دفتر مرتبط بالرسالة.
export function flavorEventDay(s) {
  if (daysBetween(s.startDate, s.date) < FLAVOR_MIN_CAREER_DAYS) return null;
  const log = flavorLog(s);
  const last = s.inbox.find((m) => m.kind === "flavor");
  if (last && daysBetween(last.date, s.date) < FLAVOR_GAP_DAYS) return null;
  const shown = new Set(log.map((m) => m.ref));
  const open = FLAVOR_CATALOG.filter((e) => gate(e, s) && !shown.has(flavorRef(e.id)));
  if (!open.length) return null;
  // توزيع الفئات: لا نضع فئتين متتاليتين من النوع نفسه ما دام هناك بديل.
  const lastCategory = last?.flavorCategory;
  const varied = lastCategory
    ? open.filter((e) => e.category !== lastCategory)
    : open;
  const data = pick(s, varied.length ? varied : open);
  const m = message(s, {
    title: data.title,
    body: data.body,
    category: "events",
    required: false,
    kind: "flavor",
    ref: flavorRef(data.id),
    priority: "low",
  });
  m.flavorCategory = data.category;
  const effect = data.effect;
  if (effect) {
    if (effect.cash)
      post(
        s,
        effect.cash,
        "club-event",
        data.title,
        m.id + "-flavor",
      );
    if (effect.fans) s.fanSupport = clamp(s.fanSupport + effect.fans, 0, 100);
    if (effect.reputation)
      s.reputation = clamp(s.reputation + effect.reputation, 0, 100);
    if (effect.personal && s.empire) {
      const delta = clamp(effect.personal, -FLAVOR_LIMITS.personal, FLAVOR_LIMITS.personal);
      s.empire.personal = Math.max(0, s.empire.personal + delta);
    }
    if (effect.morale || effect.fitness)
      for (const p of squad(s)) {
        p.morale = clamp(p.morale + (effect.morale || 0), 0, 100);
        p.fitness = clamp(p.fitness + (effect.fitness || 0), 0, 100);
      }
    applyTargets(s, effect.targets);
  }
  return m;
}

// واجهة اختبار/تشخيص: حدود الأثر الصغير كما يعلنها الكتالوج.
export const flavorLimits = () => FLAVOR_LIMITS;
