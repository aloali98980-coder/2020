import { addDays, daysBetween, random, clamp, uid, assert } from "../core/utils.js";
import { ageAt, activePlayer } from "../models/player.js";
import { message, closeThread } from "./inbox.js";
import { post } from "./finance.js";
import { legendWearFactor, inductRetiree } from "./legends.js";
import { archiveRetiree } from "./retired.js";
// 0.20: aging history is display-only (the profile shows the last four months), so it is capped
// at a handful of compact entries per player instead of 12–36 full objects × 47,000 players.
export const AGING_HISTORY_KEEP = 4;
export const AGING_HISTORY_KEEP_OWN = 12;
const ATTRIBUTE_KEYS = ["pace", "passing", "shooting", "defending", "stamina", "decisions"];
const meanAttribute = (a) => {
  let sum = 0;
  for (const k of ATTRIBUTE_KEYS) sum += a[k];
  return sum / 6;
};
export function agingDay(s) {
  const month = s.date.slice(0, 7);
  for (const p of s.players) {
    p.age = ageAt(p, s.date);
    if (!activePlayer(p) || p.lastAgingMonth === month) continue;
    p.lastAgingMonth = month;
    const threshold = p.position === "GK" ? 34 : 29;
    const wear =
      Math.max(0, p.age - threshold) * 0.042 * (1.3 - p.naturalFitness / 200) * (p.abilityVersion ? (1.2-(p.professionalism??70)/300)*(p.injuryUntil&&p.injuryUntil>=s.date?1.15:1) : 1) * legendWearFactor(s, p);
    const oldMean = meanAttribute(p.attributes);
    p.attributes.pace = clamp(
      p.attributes.pace - wear * (p.position === "GK" ? 0.55 : 1.15),
      15,
      99,
    );
    p.attributes.stamina = clamp(p.attributes.stamina - wear, 20, 99);
    const technicalWear =
      Math.max(0, p.age - (p.position === "GK" ? 38 : 34)) * 0.025;
    for (const key of ["passing", "shooting", "defending"])
      p.attributes[key] = clamp(p.attributes[key] - technicalWear, 10, 99);
    p.attributes.decisions = clamp(
      p.attributes.decisions +
        (p.age >= 25 && p.age <= 34 ? 0.055 : -Math.max(0, p.age - 37) * 0.018),
      15,
      99,
    );
    // Keep stored numbers short (3 decimals): 47,000 players × 7 long floats was measurable in the save.
    for (const k of ATTRIBUTE_KEYS)
      p.attributes[k] = Math.round(p.attributes[k] * 1000) / 1000;
    const mean = meanAttribute(p.attributes);
    p.rating =
      Math.round(clamp(p.rating + (mean - oldMean) * 1.8, 30, 99) * 1000) / 1000;
    const history = (p.agingHistory ??= []);
    history.push({ date: s.date, rating: Math.round(p.rating * 10) / 10 });
    const keep = p.clubId === s.clubId ? AGING_HISTORY_KEEP_OWN : AGING_HISTORY_KEEP;
    if (history.length > keep) history.splice(0, history.length - keep);
    const minAge = p.position === "GK" ? 39 : 36;
    if (
      p.age >= minAge &&
      !p.retirementPlan &&
      (!p.deferRetirementUntil || s.date >= p.deferRetirementUntil)
    ) {
      const chance = clamp(
        (p.age - minAge + 1) * 0.045 + (100 - p.fitness) / 500,
        0.03,
        0.55,
      );
      if (p.age >= 43 || random(s) < chance) announceRetirement(s, p);
    }
  }
}
export function announceRetirement(s, p) {
  if (p.retirementPlan || !activePlayer(p)) return;
  p.retirementPlan = {
    announced: s.date,
    date: addDays(s.date, 45),
    prepared: false,
    extensionAsked: false,
  };
  if (p.clubId === s.clubId)
    message(s, {
      title: `مستقبل ${p.name} بعد الملعب`,
      body: "اللاعب يفكر في الاعتزال خلال ٤٥ يومًا داخل هذه الحفظة. يمكنك تجهيز مسار مهني بتكلفة ٦٠ ألف جنيه، طلب الاستمرار (غير مضمون)، أو احترام القرار. هذا حدث محاكاة، وليس خبرًا عن اللاعب الحقيقي.",
      category: "careers",
      required: true,
      kind: "retirement",
      ref: p.id,
      priority: "high",
    });
}
export function retirementDecision(s, id, choice) {
  const p = s.players.find((p) => p.id === id);
  assert(p?.retirementPlan && activePlayer(p), "قرار الاعتزال غير متاح.");
  if (choice === "prepare") {
    assert(s.finance.cash >= 60000, "السيولة لا تكفي لدورة التأهيل.");
    post(
      s,
      -60000,
      "staff-course",
      `تأهيل مهني: ${p.name}`,
      p.id + "-pre-retirement",
    );
    p.retirementPlan.prepared = true;
  } else if (choice === "extend") {
    assert(!p.retirementPlan.extensionAsked, "تم طلب الاستمرار بالفعل.");
    p.retirementPlan.extensionAsked = true;
    const agreed = random(s) < (p.morale >= 75 ? 0.6 : 0.3);
    if (agreed) {
      p.deferRetirementUntil = addDays(s.date, 180);
      p.retirementPlan = null;
    }
    message(s, {
      title: agreed ? "وافق على تأجيل الاعتزال" : "اللاعب متمسك بموعد الاعتزال",
      body: agreed
        ? "تم تأجيل مراجعة الاعتزال ١٨٠ يومًا. عقد اللاعب لا يتمدد تلقائيًا؛ راجع تاريخ نهايته."
        : "احترم رغبته وخطط للبديل. ما زال بإمكانه بدء مسار مهني بعد الاعتزال إذا توفرت الرغبة.",
      category: "careers",
    });
  } else assert(choice === "respect", "اختيار غير صالح.");
  for (const m of s.inbox.filter(
    (m) => m.kind === "retirement" && m.ref === id,
  )) {
    m.status = "resolved";
    m.read = true;
  }
}
// World-wide pool of "available after retirement" staff candidates. Own-club retirees are always
// offered; other clubs' retirees only top the pool up to this size (0.20 — it used to grow by
// hundreds every season and the careers screen rendered all of them).
export const STAFF_POOL_LIMIT = 40;
export const STAFF_POOL_MAX_AGE_DAYS = 730;
export function retirementDay(s) {
  const due = [];
  for (const p of s.players)
    if (activePlayer(p) && p.retirementPlan && p.retirementPlan.date <= s.date)
      due.push(p);
  if (s.date.endsWith("-01"))
    s.staff = s.staff.filter(
      (c) =>
        c.status !== "available" ||
        c.formerClubId === s.clubId ||
        !c.since ||
        daysBetween(c.since, s.date) < STAFF_POOL_MAX_AGE_DAYS,
    );
  if (!due.length) return;
  let pool = s.staff.filter(
    (c) => c.status === "available" && c.formerClubId !== s.clubId,
  ).length;
  for (const p of due) {
    const former = p.clubId;
    const prepared = p.retirementPlan.prepared;
    p.status = "retired";
    p.previousClubId = former;
    p.clubId = "retired";
    p.retiredOn = s.date;
    p.careerHistory.push({
      type: "retired",
      date: s.date,
      clubId: former,
      appearances: p.appearances,
      goals: p.goals,
    });
    p.salary = 0;
    p.value = 0;
    p.injuryUntil = null;
    inductRetiree(s, p, former);
    for (const n of s.negotiations.filter(
      (n) =>
        n.playerId === p.id &&
        ["waiting", "club-reply", "personal"].includes(n.stage),
    )) {
      n.stage = "rejected";
      closeThread(s, n.id);
    }
    closeThread(s, p.id);
    const interested =
      p.careerInterest < 65 + (prepared ? 20 : 0) &&
      (former === s.clubId || pool < STAFF_POOL_LIMIT);
    let candidate = null;
    if (interested) {
      if (former !== s.clubId) pool++;
      candidate = {
        id: uid(s, "staff"),
        personId: p.id,
        formerClubId: former,
        since: s.date,
        name: p.name,
        nameLatin: p.nameLatin || null,
        skills: {
          coaching: 35 + Math.floor(random(s) * 36) + (prepared ? 8 : 0),
          scouting: 35 + Math.floor(random(s) * 41) + (prepared ? 5 : 0),
          youth: 35 + Math.floor(random(s) * 41) + (prepared ? 8 : 0),
        },
        qualification: prepared ? "basic" : "trainee",
        status: "available",
        role: null,
        salary: 0,
        contractEnd: null,
        joined: null,
        course: null,
      };
      s.staff.push(candidate);
    }
    if (former === s.clubId)
      message(s, {
        title: `${p.name}: نهاية مسيرة وبداية محتملة`,
        body: interested
          ? "اعتزل داخل الحفظة وتوقف مرتب اللاعب. أبدى رغبة في العمل؛ راجع تقييمه المهني المستقل قبل تعيينه. الشهرة لا تعني كفاءة تدريبية."
          : "اعتزل داخل الحفظة وتوقف مرتبه. اختار الابتعاد عن العمل الكروي في الوقت الحالي؛ لن يظهر كموظف متاح.",
        category: "careers",
        required: interested,
        kind: interested ? "career-offer" : "info",
        ref: candidate?.id || p.id,
      });
  }
  for (const p of due) archiveRetiree(s, p);
}
