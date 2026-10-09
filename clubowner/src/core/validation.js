import { CITY_FACILITIES } from "../data/sportsCityFacilities.js";
import { CAPACITY_TIERS } from "../services/sportsCity.js";
import { validateTalent } from "./talentValidation.js";
import { validateLegends } from "./legendsValidation.js";
import { validateDynasty } from "./dynastyValidation.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { validateExpansion } from "./expansionValidation.js";
import { ALL_MARKETS } from "../data/worldMarkets.js";
import { EVENT_CATALOG } from "../data/eventCatalog.js";
import { CLUBS, FACILITIES, ASSETS } from "../data/catalog.js";
import { resolveSponsor } from "../services/sponsors.js";
import { SAVE_VERSION } from "./game.js";
import { AMBITIONS, AXES, CLUB_SIZES, ITEM_KINDS, MANDATE_SCHEMA as BOARD_SCHEMA } from "../data/boardMandates.js";
import { MAX_LADDER_TIER } from "../services/boardMandate.js";
import { boardTextAr } from "../data/boardTexts.js";
import { isoDate } from "./isoDate.js";
import { OWNER_STORIES, LIFESTYLES, TRANSFER_CAP } from "../services/empire/wealth.js";
import { CASE_KINDS, CASE_STAGES } from "../data/staffCatalog.js";

// A save is untrusted input. Validate structure and relationships before replacing it.
const id = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const amount = (value) => Number.isSafeInteger(value) && value >= 0;
const text = (value) => typeof value === "string" && value.length <= 5000;
const check = (condition, explanation) => {
  if (!condition) throw new Error(explanation);
};
const unique = (items) =>
  new Set(items.map((item) => item.id)).size === items.length;

export function validateSave(s) {
  check(s && s.version === SAVE_VERSION, "صيغة الحفظ غير مدعومة.");
  check(
    (s.expansion
      ? !!extendedClub(s.clubId)
      : CLUBS.some((c) => c.id === s.clubId && c.cash)) &&
      isoDate(s.date) &&
      isoDate(s.startDate),
    "بيانات النادي أو التاريخ غير سليمة.",
  );
  check(
    text(s.owner) && s.owner.length > 0 && s.owner.length <= 35,
    "اسم المالك غير صالح.",
  );
  check(
    amount(s.nextId) &&
      amount(s.seed) &&
      amount(s.remainingDays) &&
      s.remainingDays <= 30,
    "حالة المحاكاة غير سليمة.",
  );
  check(
    amount(s.capacity) &&
      amount(s.ticketPrice) &&
      Number.isFinite(s.fanSupport) &&
      Number.isFinite(s.reputation) &&
      amount(s.academyCount),
    "مؤشرات النادي غير سليمة.",
  );
  for (const k of [
    "players",
    "facilities",
    "inbox",
    "events",
    "fixtures",
    "table",
    "sponsors",
    "negotiations",
    "leagues",
  ])
    check(Array.isArray(s[k]), "ملف الحفظ ناقص: " + k);
  check(
    s.players.length <= 50000 && s.inbox.length <= 100000,
    "ملف الحفظ أكبر من حدود النسخة.",
  );
  // 0.20: retirees live in a compact archive (see services/retired.js).
  check(
    Array.isArray(s.retired) &&
      s.retired.length <= 20000 &&
      s.retired.every(
        (r) =>
          id(r.id) &&
          text(r.name) &&
          r.status === "retired" &&
          r.clubId === "retired" &&
          isoDate(r.retiredOn) &&
          Array.isArray(r.careerHistory) &&
          r.attributes &&
          Number.isFinite(r.rating),
      ),
    "أرشيف المعتزلين غير سليم.",
  );
  const personIds = new Set(s.players.map((p) => p.id));
  let duplicateRetiree = false;
  for (const r of s.retired) {
    if (personIds.has(r.id)) duplicateRetiree = true;
    personIds.add(r.id);
  }
  check(!duplicateRetiree, "أرشيف المعتزلين يكرر سجل لاعب.");
  check(
    s.leagues.includes("eg") && s.leagues.every((l) => ALL_MARKETS.includes(l)),
    "أسواق غير مدعومة.",
  );
  check(
    s.preferences && typeof s.preferences.pauseMatches === "boolean",
    "إعدادات المحاكاة ناقصة.",
  );
  const f = s.finance;
  check(
    f &&
      Number.isSafeInteger(f.cash) &&
      amount(f.initialCash) &&
      amount(f.wageBudget) &&
      Array.isArray(f.ledger) &&
      Array.isArray(f.obligations) &&
      Array.isArray(f.loans),
    "بيانات مالية غير سليمة.",
  );
  check(
    f.ledger.every(
      (e) =>
        id(e.id) &&
        text(e.key) &&
        text(e.description) &&
        isoDate(e.date) &&
        Number.isSafeInteger(e.amount),
    ),
    "قيود مالية غير صالحة.",
  );
  check(
    f.initialCash + f.ledger.reduce((n, e) => n + e.amount, 0) === f.cash,
    "كشف الحساب لا يطابق الرصيد.",
  );
  check(
    new Set(f.ledger.map((e) => e.key)).size === f.ledger.length,
    "حركات مالية مكررة.",
  );
  check(
    f.obligations.every(
      (o) =>
        id(o.id) &&
        amount(o.amount) &&
        text(o.description) &&
        isoDate(o.due) &&
        ["paid", "pending"].includes(o.status),
    ),
    "جدول الالتزامات غير سليم.",
  );
  check(
    new Set(f.obligations.map((o) => o.key)).size === f.obligations.length,
    "التزامات مالية مكررة.",
  );
  const positions = [
    "GK",
    "CB",
    "RB",
    "LB",
    "DM",
    "CM",
    "AM",
    "RW",
    "LW",
    "ST",
  ];
  const roles = ["أساسي", "مداورة", "بديل", "مشروع للمستقبل"];
  check(
    unique(s.players) &&
      s.players.every(
        (p) =>
          id(p.id) &&
          text(p.name) &&
          text(p.nationality) &&
          text(p.clubId) &&
          amount(p.salary) &&
          amount(p.value) &&
          amount(p.age) &&
          isoDate(p.contractEnd) &&
          positions.includes(p.position) &&
          roles.includes(p.role) &&
          ["يسرى", "يمنى"].includes(p.foot) &&
          Number.isFinite(p.rating) &&
          p.rating >= 0 &&
          p.rating <= 100 &&
          Number.isFinite(p.potential) &&
          Number.isFinite(p.fitness) &&
          p.fitness >= 0 &&
          p.fitness <= 100 &&
          Number.isFinite(p.morale) &&
          amount(p.appearances) &&
          amount(p.goals) &&
          p.attributes &&
          [
            "pace",
            "passing",
            "shooting",
            "defending",
            "stamina",
            "decisions",
          ].every(
            (k) =>
              Number.isFinite(p.attributes[k]) &&
              p.attributes[k] >= 0 &&
              p.attributes[k] <= 100,
          ),
      ),
    "بيانات اللاعبين غير سليمة أو متكررة.",
  );
  // 0.23: season stats fields (initialized by v19 migration for all active players).
  check(
    s.players.every(
      (p) =>
        amount(p.seasonGoals ?? 0) &&
        amount(p.seasonAssists ?? 0) &&
        amount(p.seasonYellow ?? 0) &&
        amount(p.seasonRed ?? 0) &&
        amount(p.seasonCleanSheets ?? 0) &&
        Number.isFinite(p.seasonRatingSum ?? 0) &&
        (p.seasonRatingSum ?? 0) >= 0 &&
        amount(p.seasonRatingCount ?? 0) &&
        amount(p.seasonMinutes ?? 0) &&
        (p.seasonRatingCount === 0 || p.seasonRatingSum >= p.seasonRatingCount * 4),
    ),
    "بيانات إحصائيات الموسم غير سليمة.",
  );
  // 0.24: match consequence fields (form, suspension, card accumulation).
  check(
    s.players.every(
      (p) =>
        Number.isFinite(p.form ?? 0) &&
        (p.form ?? 0) >= -2 &&
        (p.form ?? 0) <= 2 &&
        (!p.suspendedUntil || isoDate(p.suspendedUntil)) &&
        amount(p.yellowCardSuspensions ?? 0) &&
        amount(p.seasonYellowByComp ?? 0) &&
        Array.isArray(p.formRatings ?? []) &&
        (p.formRatings ?? []).every((r) => Number.isFinite(r)),
    ),
    "بيانات عواقب الملعب غير سليمة.",
  );
  check(
    s.facilities.length === FACILITIES.length &&
      unique(s.facilities) &&
      s.facilities.every(
        (f) =>
          FACILITIES.some((d) => d.id === f.id && d.name === f.name) &&
          amount(f.level) &&
          f.level >= 1 &&
          f.level <= 4 &&
          amount(f.monthlyCost) &&
          amount(f.staffCost) &&
          typeof f.staff === "boolean" &&
          (!f.project ||
            (id(f.project.id) &&
              isoDate(f.project.start) &&
              isoDate(f.project.end) &&
              f.project.end >= f.project.start &&
              amount(f.project.cost) &&
              amount(f.project.days) &&
              f.project.days > 0 &&
              amount(f.project.upkeep))),
      ),
    "بيانات المنشآت غير سليمة.",
  );
  check(
    unique(s.negotiations) &&
      s.negotiations.every(
        (n) =>
          id(n.id) &&
          s.players.some((p) => p.id === n.playerId) &&
          amount(n.fee) &&
          [40, 60, 100].includes(n.upfrontPercent) &&
          ["waiting", "club-reply", "personal", "signed", "rejected"].includes(
            n.stage,
          ),
      ),
    "علاقات التعاقدات غير سليمة.",
  );
  check(
    unique(s.sponsors) &&
      s.sponsors.every(
        (c) =>
          id(c.id) &&
          ASSETS.some((a) => a.id === c.assetId) &&
          resolveSponsor(c.sponsorId) &&
          amount(c.amount) &&
          isoDate(c.start) &&
          isoDate(c.end) &&
          ["active", "expired"].includes(c.status),
      ),
    "عقود الرعاية غير سليمة.",
  );
  const active = s.sponsors.filter((c) => c.status === "active");
  check(
    new Set(active.map((c) => c.assetId)).size === active.length,
    "مساحة رعاية محجوزة مرتين.",
  );
  check(
    unique(s.inbox) &&
      s.inbox.every(
        (m) =>
          id(m.id) &&
          text(m.title) &&
          text(m.body) &&
          isoDate(m.date) &&
          (!m.deadline || isoDate(m.deadline)) &&
          ["open", "resolved"].includes(m.status) &&
          typeof m.required === "boolean",
      ),
    "رسائل البريد غير سليمة.",
  );
  for (const m of s.inbox.filter((m) => m.required && m.status === "open")) {
    if (["transfer", "personal"].includes(m.kind))
      check(
        s.negotiations.some((n) => n.id === m.ref),
        "مرجع تفاوض مفقود في البريد.",
      );
    if (m.kind === "renewal")
      check(
        s.players.some((p) => p.id === m.ref),
        "مرجع لاعب مفقود في البريد.",
      );
  }
  check(
    unique(s.events) &&
      s.events.every(
        (e) =>
          id(e.id) &&
          isoDate(e.date) &&
          ["transfer-reply", "sponsor", "renewal"].includes(e.type) &&
          typeof e.done === "boolean",
      ),
    "قائمة الأحداث غير سليمة.",
  );
  check(
    unique(s.fixtures) &&
      s.fixtures.every(
        (f) =>
          id(f.id) &&
          isoDate(f.date) &&
          (s.expansion
            ? !!extendedClub(f.home)
            : CLUBS.some((c) => c.id === f.home)) &&
          (s.expansion
            ? !!extendedClub(f.away)
            : CLUBS.some((c) => c.id === f.away)) &&
          f.home !== f.away &&
          typeof f.played === "boolean" &&
          (!f.played || (amount(f.homeGoals) && amount(f.awayGoals))),
      ),
    "جدول المباريات غير سليم.",
  );
  check(
    (s.expansion
      ? s.table.length >= 4 && s.table.length <= 40
      : s.table.length === 8) &&
      new Set(s.table.map((t) => t.clubId)).size === s.table.length &&
      s.table.every(
        (t) =>
          (s.expansion
            ? !!extendedClub(t.clubId)
            : CLUBS.some((c) => c.id === t.clubId)) &&
          ["played", "wins", "draws", "losses", "gf", "ga", "points"].every(
            (k) => amount(t[k]),
          ),
      ),
    "جدول الترتيب غير سليم.",
  );
  check(
    ["beginner", "easy", "normal", "hard"].includes(s.difficulty),
    "مستوى صعوبة غير صالح.",
  );
  check(["ar", "en", "fr"].includes(s.preferences.language), "لغة غير مدعومة.");
  check(
    Array.isArray(s.staff) &&
      Array.isArray(s.scoutAssignments) &&
      Array.isArray(s.clubDecisions) &&
      Array.isArray(s.seasonHistory) &&
      amount(s.seasonNumber) &&
      isoDate(s.nextSeasonDate) &&
      isoDate(s.nextClubEventDate),
    "بيانات الحياة المهنية والأحداث ناقصة.",
  );
  check(
    s.players.every(
      (p) =>
        ["active", "retired"].includes(p.status) &&
        amount(p.ageReference) &&
        isoDate(p.ageReferenceDate) &&
        Number.isFinite(p.naturalFitness) &&
        Array.isArray(p.careerHistory),
    ),
    "حالة المسيرة غير صالحة.",
  );
  check(
    unique(s.staff) &&
      s.staff.every(
        (p) =>
          id(p.id) &&
          personIds.has(p.personId) &&
          ["available", "employed"].includes(p.status) &&
          amount(p.salary) &&
          p.skills &&
          ["coaching", "scouting", "youth"].every((k) =>
            Number.isFinite(p.skills[k]),
          ),
      ),
    "بيانات الموظفين غير سليمة.",
  );
  check(
    s.players.every(
      (p) =>
        (!p.sourceUrl ||
          (typeof p.sourceUrl === "string" &&
            /^https:\/\//.test(p.sourceUrl))) &&
        (!p.nameLatin || text(p.nameLatin)) &&
        (!p.retirementPlan ||
          (isoDate(p.retirementPlan.date) &&
            isoDate(p.retirementPlan.announced))) &&
        p.contractTerms &&
        [
          "appearanceBonus",
          "goalBonus",
          "annualRaisePct",
          "releaseClause",
        ].every((k) => amount(p.contractTerms[k])) &&
        p.contractTerms.annualRaisePct <= 15 &&
        isoDate(p.contractTerms.signedOn),
    ),
    "بنود عقد أو مرجع مصدر غير صالح.",
  );
  check(
    s.staff.every(
      (p) =>
        text(p.name) &&
        ["available", "employed"].includes(p.status) &&
        (!p.role || ["coach", "scout", "academy"].includes(p.role)) &&
        (p.status !== "employed" || isoDate(p.contractEnd)) &&
        (!p.course || isoDate(p.course.end)) &&
        Object.values(p.skills).every((n) => n >= 0 && n <= 100),
    ),
    "عقد مهني غير سليم.",
  );
  check(
    unique(s.clubDecisions) &&
      s.clubDecisions.every(
        (e) =>
          id(e.id) &&
          EVENT_CATALOG.some((d) => d.id === e.type) &&
          isoDate(e.date) &&
          ["open", "resolved"].includes(e.status),
      ),
    "أحداث القرارات غير سليمة.",
  );
  check(
    unique(s.scoutAssignments) &&
      s.scoutAssignments.every(
        (a) =>
          id(a.id) &&
          s.staff.some((p) => p.id === a.staffId) &&
          s.players.some((p) => p.id === a.playerId) &&
          isoDate(a.end) &&
          typeof a.done === "boolean",
      ),
    "مهمة كشف غير سليمة.",
  );
  for (const m of s.inbox.filter((m) => m.required && m.status === "open")) {
    if (m.kind === "club-decision")
      check(
        s.clubDecisions.some((e) => e.id === m.ref && e.status === "open"),
        "مرجع قرار مفقود.",
      );
    if (m.kind === "retirement")
      check(
        s.players.some((p) => p.id === m.ref && p.retirementPlan),
        "مرجع اعتزال مفقود.",
      );
    if (m.kind === "career-offer")
      check(
        s.staff.some((p) => p.id === m.ref),
        "مرجع موظف مفقود.",
      );
  }
  check(!s.squadLimit || [30, 45].includes(s.squadLimit), "حد قائمة غير صالح.");
  check(
    s.players.every(
      (p) =>
        (!p.biographyUrl ||
          (typeof p.biographyUrl === "string" &&
            p.biographyUrl.startsWith("https://"))) &&
        (!p.birthDate || isoDate(p.birthDate)) &&
        (!p.abilityVersion ||
          [p.professionalism, p.developmentRate, p.injurySusceptibility].every(
            Number.isFinite,
          )),
    ),
    "بيانات القدرات أو مصادر الميلاد غير سليمة.",
  );
  validateBoard(s);
  validateBlackFiles(s);
  validateEmpire(s);
  const city = s.sportsCity, stadium = city?.stadium;
  check(city && Array.isArray(city.facilities) && city.facilities.length <= CITY_FACILITIES.length &&
    new Set(city.facilities).size === city.facilities.length && city.facilities.every(x => CITY_FACILITIES.some(f => f.id === x)) &&
    stadium && Number.isInteger(stadium.tier) && stadium.tier >= 0 && stadium.tier < CAPACITY_TIERS.length &&
    (!stadium.project || (Number.isInteger(stadium.project.tier) && stadium.project.tier > stadium.tier && stadium.project.tier < CAPACITY_TIERS.length && isoDate(stadium.project.end))) &&
    Array.isArray(city.eventsSeen) && city.eventsSeen.length <= 100 && Array.isArray(city.news) && city.news.length <= 40 &&
    (!city.broadcasts || (Array.isArray(city.broadcasts) && city.broadcasts.length <= 30)), "حالة المدينة الرياضية غير سليمة.");
  validateExpansion(s);
  validateTalent(s);
  validateLegends(s);
  validateDynasty(s);
  return s;
}

// 0.28: الملفات السوداء — مؤشر شبهات، عمليات، ومنع قيد، وتاريخ فضائح
function validateBlackFiles(s) {
  const bf = s.blackFiles;
  check(
    bf && typeof bf === "object" &&
      Number.isFinite(bf.suspicion) && bf.suspicion >= 0 && bf.suspicion <= 100 &&
      Number.isFinite(bf.permanentRepPenalty) && bf.permanentRepPenalty >= 0 && bf.permanentRepPenalty <= 50 &&
      amount(bf.scandalCount) && bf.scandalCount <= 100 &&
      Array.isArray(bf.history) && bf.history.length <= 200 &&
      typeof bf.active === "object" &&
      typeof bf.cooldowns === "object" &&
      (!bf.transferBanUntil || isoDate(bf.transferBanUntil)) &&
      (!bf.lastOperationDate || isoDate(bf.lastOperationDate)) &&
      Array.isArray(bf.pendingAiBreaks),
    "حالة الملفات السوداء غير سليمة.",
  );
  check(
    typeof bf.active.agentOnPayroll === "boolean" &&
      (!bf.active.agentSince || isoDate(bf.active.agentSince)),
    "حالة وكيل المرتب غير سليمة.",
  );
  check(
    bf.history.every((h) => isoDate(h.date)),
    "سجل الملفات السوداء غير سليم.",
  );
}

// 0.26: لائحة الجمعية العمومية. الحقول كلها مشتقة أو مسجَّلة، والقيم محدودة
// بسقف سلم العواقب — فلا يمكن لحفظة معدَّلة يدويًا أن تحمل «درجة رابعة» أو ثقة سالبة.
function validateBoard(s) {
  const b = s.board;
  check(
    b &&
      typeof b === "object" &&
      b.schema === BOARD_SCHEMA &&
      Number.isFinite(b.confidence) &&
      b.confidence >= 0 &&
      b.confidence <= 100,
    boardTextAr("boardInvalidState"),
  );
  check(
    amount(b.failureStreak) &&
      amount(b.successStreak) &&
      (!b.freezeUntil || isoDate(b.freezeUntil)) &&
      Number.isFinite(b.wageFactor) &&
      b.wageFactor > 0 &&
      b.wageFactor <= 4 &&
      typeof b.nextRebuild === "boolean" &&
      Number.isFinite(b.pendingBoost) &&
      b.pendingBoost >= 0 &&
      b.pendingBoost <= 1,
    boardTextAr("boardInvalidMetrics"),
  );
  const validItem = (it) =>
    id(it.id) &&
    ITEM_KINDS[it.kind] !== undefined &&
    AXES.includes(ITEM_KINDS[it.kind].axis) &&
    it.axis === ITEM_KINDS[it.kind].axis &&
    typeof it.critical === "boolean" &&
    amount(it.target) &&
    it.target > 0;
  const validReview = (r) =>
    !r ||
    (isoDate(r.date) &&
      typeof r.good === "boolean" &&
      amount(r.done) &&
      amount(r.total));
  const m = b.mandate;
  check(
    !m ||
      (id(m.id) &&
        amount(m.season) &&
        isoDate(m.issuedAt) &&
        isoDate(m.startDate) &&
        isoDate(m.midDate) &&
        isoDate(m.endDate) &&
        m.startDate <= m.midDate &&
        m.midDate <= m.endDate &&
        CLUB_SIZES[m.size] !== undefined &&
        AMBITIONS[m.ambition] !== undefined &&
        typeof m.rebuild === "boolean" &&
        Array.isArray(m.items) &&
        m.items.length >= 3 &&
        m.items.length <= 12 &&
        m.items.every(validItem) &&
        new Set(m.items.map((it) => it.id)).size === m.items.length &&
        m.baseline &&
        typeof m.baseline.facilityLevels === "object" &&
        Array.isArray(m.baseline.youthIds) &&
        amount(m.baseline.squadSize) &&
        m.review &&
        validReview(m.review.mid) &&
        validReview(m.review.end)),
    boardTextAr("boardInvalidMandate"),
  );
  check(
    Array.isArray(b.history) &&
      b.history.length <= 40 &&
      b.history.every(
        (h) =>
          amount(h.season) &&
          isoDate(h.date) &&
          ["passed", "partial", "failed"].includes(h.status) &&
          amount(h.done) &&
          amount(h.total) &&
          amount(h.tier) &&
          h.tier <= MAX_LADDER_TIER &&
          Array.isArray(h.effects),
      ),
    boardTextAr("boardInvalidHistory"),
  );
  check(
    Array.isArray(b.meetings) &&
      b.meetings.length <= 200 &&
      b.meetings.every(
        (x) =>
          id(x.id) &&
          ["mid", "end"].includes(x.kind) &&
          amount(x.season) &&
          isoDate(x.date) &&
          ["trust", "warning", "passed", "partial", "failed"].includes(x.status) &&
          amount(x.done) &&
          amount(x.total),
      ),
    boardTextAr("boardInvalidMeetings"),
  );
}

// 0.29: حياة الملياردير. ثروة شخصية منفصلة عن خزينة النادي، معيشة، أصول،
// عائلة، استثمارات، منافسون، وخير. كل القيم أعداد صحيحة آمنة ومقيدة بسقوف
// معلنة؛ خزينة النادي نفسها لا تُمسّ هنا (تُفحص في قيود الدفاتر أعلاه).
function validateEmpire(s) {
  const e = s.empire;
  check(e && typeof e === "object" && e.schema === 1, "حالة حياة الملياردير غير سليمة.");
  check(
    OWNER_STORIES[e.story] !== undefined &&
      amount(e.personal) &&
      amount(e.debt) &&
      Number.isFinite(e.prestige) && e.prestige >= 0 && e.prestige <= 400 &&
      Number.isFinite(e.fame) && e.fame >= 0 && e.fame <= 100 &&
      LIFESTYLES[e.lifestyle] !== undefined,
    "ثروة المالك الشخصية غير سليمة.",
  );
  check(
    e.transfers && typeof e.transfers === "object" &&
      typeof e.transfers.month === "string" &&
      amount(e.transfers.toPersonal) && e.transfers.toPersonal <= TRANSFER_CAP &&
      amount(e.transfers.toClub) && e.transfers.toClub <= TRANSFER_CAP &&
      Array.isArray(e.transfers.log) && e.transfers.log.length <= 40,
    "حدود التحويل بين الخزينتين غير سليمة.",
  );
  check(
    Array.isArray(e.assets) && e.assets.length <= 60 &&
      e.assets.every((a) => id(a.id) && id(a.assetId) && isoDate(a.boughtOn) && amount(a.price) && amount(a.sellValue)),
    "أصول المالك غير سليمة.",
  );
  const f = e.family;
  check(
    f && typeof f === "object" &&
      ["single", "engaged", "married", "divorced"].includes(f.status) &&
      (!f.brideId || ["lawyer", "doctor", "artist", "connected"].includes(f.brideId)) &&
      (!f.engagedOn || isoDate(f.engagedOn)) &&
      amount(f.divorceCount) && f.divorceCount <= 10 &&
      Array.isArray(f.children) && f.children.length <= 3 &&
      f.children.every((c) => id(c.id) && text(c.name) && isoDate(c.born)) &&
      (!f.wife ||
        (id(f.wife.id) &&
          text(f.wife.name) &&
          Number.isFinite(f.wife.happiness) &&
          f.wife.happiness >= 0 &&
          f.wife.happiness <= 100 &&
          isoDate(f.wife.marriedOn))),
    "حالة عائلة المالك غير سليمة.",
  );
  const p = e.portfolio;
  check(
    p && typeof p === "object" &&
      ["rental", "stocks", "startup", "coin", "deposit"].every((k) => amount(p[k])) &&
      Array.isArray(p.history) && p.history.length <= 60,
    "محفظة المالك غير سليمة.",
  );
  check(
    e.rivals && typeof e.rivals === "object" &&
      Array.isArray(e.rivals.list) && e.rivals.list.length <= 8 &&
      Array.isArray(e.rivals.history) && e.rivals.history.length <= 24,
    "قائمة المنافسين المليارديرات غير سليمة.",
  );
  check(
    e.charity && typeof e.charity === "object" &&
      amount(e.charity.total) && amount(e.charity.personalTotal) &&
      Array.isArray(e.charity.projects) && e.charity.projects.length <= 20,
    "سجل الخير غير سليم.",
  );
  check(
    Array.isArray(e.reports) && e.reports.length <= 36 &&
      Array.isArray(e.log) && e.log.length <= 60,
    "سجلات حياة الملياردير غير سليمة.",
  );
  // 0.30: الإدارة الشاملة — هيكل إلزامي بعد الترحيل، بحدود حجم صارمة.
  const c = s.staffCorp;
  check(
    c && c.schema === 1 &&
      c.hq && Number.isInteger(c.hq.level) && c.hq.level >= 0 && c.hq.level <= 5 &&
      Array.isArray(c.employees) && c.employees.length <= 25 &&
      Array.isArray(c.market) && c.market.length <= 9 &&
      Array.isArray(c.poach) && c.poach.length <= 25 &&
      c.meeting && Array.isArray(c.meeting.requests) &&
      c.sporting && c.marketing && c.scouts && c.academy && c.social && c.legal && c.financeOffice,
    "الإدارة الشاملة غير سليمة.",
  );
  check(
    c.employees.every(
      (x) =>
        id(x.id) && text(x.name?.ar) && Number.isFinite(x.skill) && x.skill >= 0 && x.skill <= 100 &&
        Number.isSafeInteger(x.wage) && x.wage >= 0 && isoDate(x.contractEnd) &&
        Number.isFinite(x.loyalty) && x.loyalty >= 0 && x.loyalty <= 100 &&
        Number.isInteger(x.level) && x.level >= 1 && x.level <= 5,
    ) &&
      c.market.every(
        (m) =>
          typeof m.key === "string" && text(m.name?.ar) && Number.isFinite(m.skill) &&
          Number.isSafeInteger(m.wageAsk) && m.wageAsk >= 0 && isoDate(m.expires),
      ),
    "سجلات موظفي الإدارة الشاملة غير سليمة.",
  );
  const legal = c.legal;
  check(
    Array.isArray(legal.cases) && legal.cases.length <= 40 &&
      amount(legal.wins) && amount(legal.losses) && amount(legal.settlements) &&
      (!legal.retainerUntil || isoDate(legal.retainerUntil)) &&
      legal.cases.every((item) =>
        id(item.id) && Object.hasOwn(CASE_KINDS, item.kind) &&
        ["open", "won", "lost", "settled"].includes(item.status) &&
        CASE_STAGES.includes(item.stage) && Number.isInteger(item.severity) && item.severity >= 1 && item.severity <= 3 &&
        isoDate(item.openedOn) && isoDate(item.nextOn) &&
        (item.closedOn === null || isoDate(item.closedOn)) &&
        (item.claimantId === null || id(item.claimantId)) &&
        Array.isArray(item.stageResults) && item.stageResults.length <= CASE_STAGES.length &&
        item.stageResults.every((result) => CASE_STAGES.includes(result.stage) && isoDate(result.date) &&
          amount(result.fee) && Number.isFinite(result.skill) && result.skill >= 0 && result.skill <= 100 &&
          Number.isFinite(result.chance) && result.chance >= 0 && result.chance <= 100 &&
          typeof result.retainer === "boolean" && typeof result.won === "boolean"),
      ),
    "سجل القضايا القانونية غير سليم.",
  );
  const validFinanceReport = (report) =>
    report && isoDate(report.date) && /^\d{4}-(0[1-9]|1[0-2])$/.test(report.month) &&
    ["cash", "income30", "out30", "projectedCash", "playerPayroll", "staffPayroll", "operatingCosts", "legendPayroll", "liabilities", "futureIncome", "monthNet", "loans"].every((key) => Number.isSafeInteger(report[key])) &&
    Array.isArray(report.warnings) && report.warnings.length <= 4 && report.warnings.every((warning) => typeof warning === "string") &&
    typeof report.audited === "boolean" && isoDate(report.forecastThrough);
  check(
    Array.isArray(c.financeOffice.reports) && c.financeOffice.reports.length <= 24 &&
      (c.financeOffice.lastReport === null || validFinanceReport(c.financeOffice.lastReport)) &&
      c.financeOffice.reports.every(validFinanceReport) &&
      (c.financeOffice.auditUntil === null || isoDate(c.financeOffice.auditUntil)),
    "تقارير المكتب المالي غير سليمة.",
  );
}
