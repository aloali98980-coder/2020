import { marketOpen, assertMarket, buyerNeed, teamPower } from "./market.js";
import { TACTICAL_DEFAULTS } from "./tactics.js";
import { ownFixtures } from "./calendar.js";
import { post } from "./finance.js";
import { assert, clamp, addDays, random } from "../core/utils.js";
import { message } from "./inbox.js";
// 0.16: expanded fictional coach market (8 profiles). Skill shapes match
// impact and development; salary is monthly; contracts run 1-3 years.
export const COACHES = [
  {
    id: "balanced",
    name: "سامر مراد",
    style: "متوازن",
    skill: 62,
    salary: 70000,
  },
  {
    id: "youth",
    name: "آدم منصور",
    style: "تطوير الشباب",
    skill: 68,
    salary: 110000,
  },
  {
    id: "elite",
    name: "Luca Morelli",
    style: "خبير بطولات",
    skill: 82,
    salary: 280000,
  },
  {
    id: "pressing",
    name: "يوسف الحداد",
    style: "ضغط عالٍ",
    skill: 71,
    salary: 140000,
  },
  {
    id: "defensive",
    name: "Marco Bellini",
    style: "صلابة دفاعية",
    skill: 74,
    salary: 165000,
  },
  {
    id: "attack",
    name: "كريم عز الدين",
    style: "هجوم شامل",
    skill: 77,
    salary: 200000,
  },
  {
    id: "developer",
    name: "عمر فاروق",
    style: "بناء وتدوير",
    skill: 66,
    salary: 95000,
  },
  {
    id: "winner",
    name: "Stefan Keller",
    style: "عقلية الفوز",
    skill: 86,
    salary: 340000,
  },
];
export function initManagement(s) {
  s.management = {
    coach: { ...COACHES[0], confidence: 70 },
    tactic: "balanced",
    tactics: { ...TACTICAL_DEFAULTS },
    loanOffers: [],
    marketMode: "windows",
    lineup: [],
    outgoing: [],
    loan: null,
    lastScout: null,
  };
  s.press = {
    trust: 60,
    news: [],
    questions: [],
    promises: [],
    lastQuestion: null,
    delegate: false,
  };
}
export function appointCoach(s, id, years = 1) {
  const c = COACHES.find((x) => x.id === id);
  assert(c, "مدرب غير متاح.");
  assert([1, 2, 3].includes(years), "مدة عقد المدرب 1–3 سنوات.");
  const old = s.management.coach;
  assert(!old || old.id !== id, "هذا مدربك الحالي.");
  const cost = (old?.salary || 0) * 2 + c.salary;
  assert(s.finance.cash >= cost, "السيولة لا تغطي الفسخ والتوقيع.");
  post(s, -cost, "coach", "فسخ وتوقيع عقد المدرب", "coach-" + s.nextId);
  s.management.coach = {
    ...c,
    confidence: 65,
    contractYears: years,
    contractEnd: addDays(s.date, 365 * years),
  };
  s.management.lineup = [];
}
// Remaining contract years, minimum 1 while a coach holds the job.
export function coachYearsLeft(s) {
  const c = s.management.coach;
  if (!c?.contractEnd) return 1;
  return Math.max(
    1,
    Math.ceil(
      (Date.parse(c.contractEnd + "T12:00:00Z") -
        Date.parse(s.date + "T12:00:00Z")) /
        86400000 /
        365,
    ),
  );
}
export function dismissCoach(s) {
  const c = s.management.coach;
  assert(c, "لا يوجد مدرب لإقالته.");
  const compensation = c.salary * 2 * coachYearsLeft(s);
  assert(
    s.finance.cash >= compensation,
    "السيولة لا تغطي التعويض (شهران عن كل سنة متبقية).",
  );
  post(
    s,
    -compensation,
    "coach-dismissal",
    `إقالة المدرب — تعويض ${coachYearsLeft(s) * 2} شهرًا`,
    "dismiss-coach-" + s.nextId,
  );
  s.management.coach = null;
}
export function renewCoach(s, years = 2) {
  const c = s.management.coach;
  assert(c, "لا يوجد مدرب للتجديد.");
  assert([1, 2, 3].includes(years), "مدة التجديد 1–3 سنوات.");
  assert(s.finance.cash >= c.salary, "السيولة لا تغطي مكافأة التجديد.");
  post(
    s,
    -c.salary,
    "coach",
    "مكافأة تجديد عقد المدرب",
    "coach-renew-" + s.nextId,
  );
  const from = c.contractEnd && c.contractEnd > s.date ? c.contractEnd : s.date;
  c.contractYears = years;
  c.contractEnd = addDays(from, 365 * years);
  c.confidence = clamp(c.confidence + 5, 0, 100);
  message(s, {
    title: `تجديد عقد ${c.name}`,
    body: `عقد جديد ${years} ${years === 1 ? "سنة" : "سنوات"} حتى ${c.contractEnd}. التعويض عند الإقالة شهران عن كل سنة متبقية.`,
    category: "club",
  });
}
export function setTactic(s, tactic) {
  assert(["balanced", "attack", "defend"].includes(tactic), "خطة غير صالحة.");
  s.management.tactic = tactic;
}
export function toggleLineup(s, id) {
  const p = s.players.find(
    (x) => x.id === id && x.clubId === s.clubId && x.status !== "retired",
  );
  assert(p, "لاعب غير متاح.");
  const list = s.management.lineup;
  if (list.includes(id)) s.management.lineup = list.filter((x) => x !== id);
  else {
    assert(list.length < 11, "اختَر 11 لاعبًا كحد أقصى.");
    if (p.position === "GK")
      assert(
        !list.some(
          (id) => s.players.find((p) => p.id === id)?.position === "GK",
        ),
        "حارس واحد بالتشكيل.",
      );
    list.push(id);
    if (list.length === 11)
      assert(
        list.some(
          (id) => s.players.find((p) => p.id === id)?.position === "GK",
        ),
        "التشكيل الكامل يحتاج حارسًا.",
      );
  }
}
export function pressAnswer(s, id, choice) {
  const q = s.press.questions.find((q) => q.id === id && !q.answered);
  assert(q, "السؤال أُجيب أو غير موجود.");
  assert(["support", "demand", "quiet"].includes(choice), "رد غير صالح.");
  q.answered = choice;
  if (choice === "support") {
    s.fanSupport = clamp(s.fanSupport + 1, 0, 100);
    if (s.management.coach)
      s.management.coach.confidence = clamp(
        s.management.coach.confidence + 5,
        0,
        100,
      );
  }
  if (choice === "demand") {
    s.fanSupport = clamp(s.fanSupport + 2, 0, 100);
    s.press.promises.push({
      season: s.seasonNumber,
      target: "top-half",
      resolved: false,
    });
  }
  s.press.news.unshift({
    date: s.date,
    title:
      choice === "support"
        ? "الإدارة تدعم الجهاز الفني"
        : choice === "demand"
          ? "المالك يعد بإنهاء الموسم في النصف الأعلى"
          : "الإدارة ترفض التعليق",
    type: "رسمي",
  });
}
export function managementDay(s) {
  if (!s.management) return;
  const m = s.management,
    p = s.press;
  if (s.date.endsWith("-01") && m.coach)
    post(
      s,
      -m.coach.salary,
      "coach-wages",
      "راتب المدرب الشهري",
      "coach-salary-" + s.date,
    );
  // 0.16: dated coach contracts. Legacy/new coaches without an end date
  // self-heal to one year; an expired contract ends the tenure.
  if (m.coach && !m.coach.contractEnd)
    m.coach.contractEnd = addDays(s.date, 365);
  if (m.coach?.contractEnd && m.coach.contractEnd < s.date) {
    const name = m.coach.name;
    m.coach = null;
    m.lineup = [];
    message(s, {
      title: `انتهى عقد المدرب ${name}`,
      body: "المنصب شاغر الآن. عيّن مدربًا جديدًا من مركز الإدارة الرياضية؛ الفريق يعمل دون توجيه حتى التعيين.",
      category: "club",
    });
  }
  if (new Date(s.date + "T12:00:00Z").getUTCDay() === 1) {
    const latest = ownFixtures(s)
      .filter((f) => f.played && (f.home === s.clubId || f.away === s.clubId))
      .at(-1);
    if (latest)
      p.news.unshift({
        date: s.date,
        title: `المرصد الرياضي: ${latest.competition || "الدوري المحلي"} — حصيلة آخر مباراة ${latest.homeGoals}–${latest.awayGoals}، وترقب لاختيارات المدرب`,
        type: "تقرير مبني على المباراة",
      });
    p.news = p.news.slice(0, 50);
  }
  if (!p.lastQuestion || s.date >= addDays(p.lastQuestion, 28)) {
    p.lastQuestion = s.date;
    const q = {
      id: "press-" + s.date,
      date: s.date,
      text: "صوت المدرج يسأل: ما رسالتك للجماهير عن طموح هذا الموسم؟",
      answered: null,
    };
    p.questions.unshift(q);
    p.questions = p.questions.slice(0, 12);
    if (p.delegate) pressAnswer(s, q.id, "quiet");
    else
      message(s, {
        title: "سؤال صحفي للمالك",
        body: "راجع غرفة الصحافة للرد أو تجاهله. الصحيفة والشخصيات الإعلامية خيالية.",
        category: "club",
      });
  }
  // Honest offers: buyer is another simulated club; sale requires owner acceptance.
  if (
    marketOpen(s) &&
    s.date.endsWith("-15") &&
    !m.outgoing.some((o) => o.id === "bid-" + s.date) &&
    m.outgoing.filter((o) => o.status === "open").length < 2
  ) {
    const candidates = s.players.filter(
      (x) =>
        x.clubId === s.clubId &&
        x.status !== "retired" &&
        x.age < 34 &&
        !x.loan,
    );
    const player = candidates[Math.floor(random(s) * candidates.length)];
    const buyer = s.expansion?.divisions
      .flatMap((d) => d.clubs)
      .find(
        (id) =>
          id !== s.clubId &&
          (s.expansion.budgets[id] || 0) >= (player?.value || 0) * 1.4 &&
          player &&
          player.rating >= teamPower(s, id) - 10 &&
          s.players.filter((p) => p.clubId === id && p.status !== "retired")
            .length < 45,
      );
    if (player && buyer) {
      m.outgoing.push({
        id: "bid-" + s.date,
        playerId: player.id,
        buyer,
        fee: Math.round(
          player.value * (0.85 + random(s) * 0.3) * buyerNeed(s, buyer, player),
        ),
        expires: addDays(s.date, 7),
        status: "open",
      });
      message(s, {
        title: "وصل عرض شراء للاعبك",
        body: "القرار لك من مركز الإدارة. لن يُباع اللاعب دون موافقتك.",
        category: "transfers",
      });
    }
  }
  m.outgoing = m.outgoing.slice(-100);
  for (const o of m.outgoing)
    if (o.status === "open" && o.expires < s.date) o.status = "expired";
  for (const player of s.players)
    if (
      player.loan &&
      player.loan.version !== 2 &&
      player.loan.until <= s.date
    ) {
      player.clubId = player.loan.parent;
      player.careerHistory.push({
        date: s.date,
        type: "loan-return",
        clubId: player.clubId,
      });
      player.loan = null;
    }
}
export function answerBid(s, id, accept) {
  const o = s.management.outgoing.find(
    (x) => x.id === id && x.status === "open",
  );
  assert(o && o.expires >= s.date, "العرض غير متاح.");
  const p = s.players.find((p) => p.id === o.playerId);
  if (accept) assertMarket(s, p);
  assert(p && p.clubId === s.clubId, "اللاعب لم يعد في ناديك.");
  if (!accept) {
    o.status = "rejected";
    return;
  }
  assert(!p.loan, "لا تملك حق بيع لاعب مُعار.");
  assert(
    s.players.filter((p) => p.clubId === o.buyer && p.status !== "retired")
      .length < 45,
    "قائمة المشتري أصبحت مكتملة.",
  );
  assert(
    s.players.filter((p) => p.clubId === s.clubId && p.status !== "retired")
      .length > 16,
    "احتفظ بـ16 لاعبًا على الأقل.",
  );
  assert(
    s.expansion.budgets[o.buyer] >= o.fee,
    "النادي المشتري لم يعد يملك السيولة.",
  );
  s.expansion.budgets[o.buyer] -= o.fee;
  o.status = "accepted";
  post(s, o.fee, "player-sale", "بيع " + p.name, o.id);
  p.clubId = o.buyer;
  p.careerHistory.push({ date: s.date, type: "transfer-out", clubId: o.buyer });
}
export function loanPlayer(s, id) {
  const p = s.players.find(
    (p) =>
      p.id === id && p.clubId !== s.clubId && p.status !== "retired" && !p.loan,
  );
  assert(
    p &&
      s.expansion.divisions.some((d) => d.clubs.includes(p.clubId)) &&
      p.age <= 24 &&
      p.rating <= 72 &&
      p.contractEnd > addDays(s.date, 180),
    "اللاعب غير مؤهل للإعارة التطويرية.",
  );
  assert(
    s.players.filter((p) => p.clubId === s.clubId && p.status !== "retired")
      .length < s.squadLimit,
    "القائمة مكتملة.",
  );
  assert(
    !s.players.some((p) => p.clubId === s.clubId && p.loan),
    "إعارة واردة واحدة في النموذج الحالي.",
  );
  const fee = Math.max(50000, Math.round(p.value * 0.08));
  assert(s.finance.cash >= fee, "السيولة لا تكفي رسوم الإعارة.");
  post(
    s,
    -fee,
    "loan-player",
    "إعارة ستة أشهر: " + p.name,
    "player-loan-" + s.nextId,
  );
  p.loan = { parent: p.clubId, until: addDays(s.date, 180) };
  p.clubId = s.clubId;
  p.careerHistory.push({ date: s.date, type: "loan-in", clubId: s.clubId });
}
export function scoutPlayer(s, id) {
  const p = s.players.find((p) => p.id === id);
  assert(p, "لاعب غير موجود.");
  assert(s.finance.cash >= 10000, "تكلفة التقرير 10 آلاف.");
  post(
    s,
    -10000,
    "scouting",
    "تقرير كشف تقديري: " + p.name,
    "scout-report-" + s.nextId,
  );
  s.management.lastScout = {
    name: p.name,
    rating: Math.round(p.rating),
    potentialRange: [
      Math.max(Math.round(p.rating), p.potential - 6),
      Math.min(99, p.potential + 3),
    ],
    date: s.date,
  };
}
