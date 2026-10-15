// نظام «الملفات السوداء» 0.28 — اللعب غير النظيف كمحتوى عادي بأسماء حقيقية.
// مؤشر الشبهات 0-100% مع مستويات، عمليات عبر الوسيط، عواقب الفضيحة الكبرى، وطرق خفض الشبهات.

import { addDays, daysBetween, clamp, random, uid, assert } from "../core/utils.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { post, obligation } from "./finance.js";
import { message, closeThread } from "./inbox.js";
import { blackTextAr } from "../data/blackTexts.js";
import { boardTextAr } from "../data/boardTexts.js";
import { ensureBoard } from "./boardMandate.js";
import {
  aiBreakReleaseClauses,
  RELEASE_BREAK_DEADLINE_DAYS,
} from "./releaseClause.js";
import { addNoise, SCANDAL_NOISE } from "./noiseMeter.js";
import { fileLegalCase } from "./staff/legal.js";

export { RELEASE_BREAK_DEADLINE_DAYS };

export const SUSPICION_THRESHOLDS = {
  whispers: 30,
  leaks: 60,
  formal: 85,
  scandal: 100,
};

export const OPERATIONS = {
  "referee-bias": {
    id: "referee-bias",
    cost: 8000000,
    heat: 18,
    failChance: 0.25,
    cooldown: 21,
    minInterval: 14,
    salary: 0,
    textKey: "opRefereeBias",
    descKey: "opRefereeBiasDesc",
  },
  "poach-player": {
    id: "poach-player",
    cost: 3000000,
    heat: 20,
    failChance: 0.30,
    cooldown: 28,
    minInterval: 21,
    salary: 0,
    textKey: "opPoachPlayer",
    descKey: "opPoachPlayerDesc",
  },
  "bribe-opponent": {
    id: "bribe-opponent",
    cost: 12000000,
    heat: 30,
    failChance: 0.40,
    cooldown: 30,
    minInterval: 21,
    salary: 0,
    textKey: "opBribeOpponent",
    descKey: "opBribeOpponentDesc",
  },
  "media-war": {
    id: "media-war",
    cost: 5000000,
    heat: 12,
    failChance: 0.20,
    cooldown: 14,
    minInterval: 14,
    salary: 0,
    textKey: "opMediaWar",
    descKey: "opMediaWarDesc",
  },
  "agent-payroll": {
    id: "agent-payroll",
    cost: 2000000,
    heat: 10,
    failChance: 0.10,
    cooldown: 7,
    minInterval: 7,
    salary: 500000,
    monthlyHeat: 0.15,
    dailyHeat: 0.15,
    textKey: "opAgentPayroll",
    descKey: "opAgentPayrollDesc",
  },
};

export function initBlackFiles(s) {
  s.blackFiles = {
    suspicion: 0,
    permanentRepPenalty: 0,
    lastOperationDate: null,
    lastOperationType: null,
    cooldowns: {},
    active: {
      refereeBias: null,
      bribedOpponent: null,
      mediaWar: null,
      agentOnPayroll: false,
      agentSince: null,
    },
    transferBanUntil: null,
    scandalCount: 0,
    history: [],
    titleStripped: false,
    pendingAiBreaks: [],
    charityTotal: 0,
  };
  return s.blackFiles;
}

export const ensureBlackFiles = (s) => s.blackFiles || initBlackFiles(s);

export function suspicionLevel(s) {
  const v = ensureBlackFiles(s).suspicion;
  if (v >= 100) return 4;
  if (v >= 85) return 3;
  if (v >= 60) return 2;
  if (v >= 30) return 1;
  return 0;
}

export function addSuspicion(s, amount) {
  const bf = ensureBlackFiles(s);
  const before = bf.suspicion;
  bf.suspicion = clamp(bf.suspicion + amount, 0, 100);
  const after = bf.suspicion;
  // إشعارات عبور العتبات
  if (before < 30 && after >= 30) {
    message(s, {
      title: blackTextAr("scandalWhispersTitle", { n: Math.round(after) }),
      body: blackTextAr("scandalWhispersBody"),
      category: "board",
      kind: "black-whispers",
      priority: "normal",
    });
  }
  if (before < 60 && after >= 60) {
    message(s, {
      title: blackTextAr("scandalLeaksTitle", { n: Math.round(after) }),
      body: blackTextAr("scandalLeaksBody"),
      category: "board",
      required: true,
      kind: "black-leaks",
      priority: "high",
      deadline: addDays(s.date, 7),
    });
  }
  if (before < 85 && after >= 85) {
    message(s, {
      title: blackTextAr("scandalFormalTitle", { n: Math.round(after) }),
      body: blackTextAr("scandalFormalBody"),
      category: "board",
      required: true,
      kind: "black-formal",
      priority: "high",
      deadline: addDays(s.date, 5),
    });
  }
  if (after >= 100) {
    triggerScandal(s);
  }
  return bf.suspicion;
}

export function reduceSuspicion(s, amount) {
  const bf = ensureBlackFiles(s);
  bf.suspicion = clamp(bf.suspicion - amount, 0, 100);
  return bf.suspicion;
}

export function canDoOperation(s, opId) {
  const bf = ensureBlackFiles(s);
  const op = OPERATIONS[opId];
  if (!op) throw new Error("عملية غير موجودة.");
  if (s.finance.cash < op.cost) throw new Error(blackTextAr("opNotEnoughCash"));
  if (bf.transferBanUntil && bf.transferBanUntil >= s.date) {
    if (["poach-player", "bribe-opponent"].includes(opId)) {
      throw new Error(blackTextAr("opTransferBanned", { d: bf.transferBanUntil }));
    }
  }
  const cooldownUntil = bf.cooldowns[opId];
  if (cooldownUntil && cooldownUntil >= s.date) {
    throw new Error(blackTextAr("opCooldownActive", { d: cooldownUntil }));
  }
  // فاصل عام بين أي عمليتين
  if (bf.lastOperationDate) {
    const minDate = addDays(bf.lastOperationDate, op.minInterval);
    if (s.date < minDate) {
      throw new Error(blackTextAr("opCooldownActive", { d: minDate }));
    }
  }
  return true;
}

// تنفيذ عملية قذرة
export function doOperation(s, opId, params = {}) {
  const bf = ensureBlackFiles(s);
  const op = OPERATIONS[opId];
  assert(op, "عملية غير صالحة.");
  canDoOperation(s, opId);
  // خصم التكلفة
  const key = uid(s, "black-" + opId);
  post(s, -op.cost, "black-op", blackTextAr(op.textKey) + " — تكلفة عملية", key);
  bf.lastOperationDate = s.date;
  bf.lastOperationType = opId;
  bf.cooldowns[opId] = addDays(s.date, op.cooldown);
  bf.history.push({ id: key, type: opId, date: s.date, cost: op.cost, params, failed: false });

  const roll = random(s);
  const failed = roll < op.failChance;
  if (failed) {
    addSuspicion(s, op.heat * 0.6);
    message(s, {
      title: blackTextAr("opFailed"),
      body: blackTextAr("opFailedBody") + ` (${blackTextAr(op.textKey)})`,
      category: "board",
      kind: "black-fail",
      priority: "high",
    });
    // فشل خاص لخطف لاعب: غرامة + منع قيد
    if (opId === "poach-player") {
      const fine = 5000000;
      post(s, -fine, "black-fine", "غرامة كشف خطف لاعب", uid(s, "fine"));
      bf.transferBanUntil = addDays(s.date, 60);
      message(s, {
        title: "انكشاف خطف لاعب",
        body: `العملية فشلت وانكشفت. غرامة ${fine} ومنع قيد 60 يومًا حتى ${bf.transferBanUntil}.`,
        category: "board",
        priority: "high",
      });
    }
    return { success: false, heat: op.heat * 0.6 };
  }

  // نجاح
  addSuspicion(s, op.heat);

  if (opId === "referee-bias") {
    const biasType = params.biasType || ["penalty-dubious", "goal-cancel", "cards-lenient"][Math.floor(random(s) * 3)];
    bf.active.refereeBias = {
      type: biasType,
      until: addDays(s.date, 7),
      date: s.date,
    };
    message(s, {
      title: blackTextAr("opSuccess") + " — " + blackTextAr(op.textKey),
      body: blackTextAr("opRefereeActive", { d: bf.active.refereeBias.until }) + ` (${biasType})`,
      category: "board",
      kind: "black-success",
    });
  } else if (opId === "poach-player") {
    const playerId = params.playerId;
    if (!playerId) throw new Error("يجب تحديد اللاعب.");
    const p = s.players.find((x) => x.id === playerId && x.clubId !== s.clubId && x.status !== "retired");
    if (!p) throw new Error("لاعب غير متاح للخطف.");
    // أرخص وأسرع: 60% من القيمة
    const fee = Math.round(p.value * 0.6);
    if (s.finance.cash < fee) throw new Error("السيولة لا تكفي لدفع قيمة الخطف المخفضة.");
    post(s, -fee, "transfer", `خطف ${p.name} — قيمة مخفضة`, uid(s, "poach-fee"));
    p.clubId = s.clubId;
    p.careerHistory.push({ date: s.date, type: "poach-in", clubId: s.clubId, from: params.from || p.clubId, fee });
    p.morale = 60;
    message(s, {
      title: blackTextAr("opSuccess") + " — خطف لاعب",
      body: `${p.name} انتقل بدون إذن ناديه مقابل ${fee}. العملية سريعة لكن الشبهات ارتفعت.`,
      category: "transfers",
      kind: "black-poach",
    });
  } else if (opId === "bribe-opponent") {
    // نحدد مباراة قادمة ضد خصم
    const fixtures = s.fixtures?.filter((f) => !f.played && (f.home === s.clubId || f.away === s.clubId)) || [];
    const next = fixtures.sort((a, b) => a.date.localeCompare(b.date))[0];
    if (next) {
      const oppId = next.home === s.clubId ? next.away : next.home;
      bf.active.bribedOpponent = {
        fixtureId: next.id,
        opponent: oppId,
        until: addDays(next.date, 1),
        date: s.date,
      };
      message(s, {
        title: blackTextAr("opSuccess") + " — رشوة لاعب خصم",
        body: blackTextAr("opBribeActive", { v: oppId, d: next.date }),
        category: "board",
        kind: "black-bribe",
      });
    }
  } else if (opId === "media-war") {
    const rival = params.rival || s.table?.filter((t) => t.clubId !== s.clubId).sort((a, b) => b.points - a.points)[0]?.clubId || "rival";
    bf.active.mediaWar = {
      rival,
      until: addDays(s.date, 14),
      date: s.date,
    };
    addNoise(s, "scandal", SCANDAL_NOISE, "حملة إعلامية ملفقة تثير الجدل");
    s.fanSupport = clamp(s.fanSupport + 3, 0, 100);
    message(s, {
      title: blackTextAr("opSuccess") + " — حرب إعلامية",
      body: `حملة ملفقة ضد ${rival}. جماهيرك ارتفعت مؤقتًا، لكن الشبهات تراكمت.`,
      category: "board",
      kind: "black-media",
    });
  } else if (opId === "agent-payroll") {
    bf.active.agentOnPayroll = true;
    bf.active.agentSince = s.date;
    message(s, {
      title: blackTextAr("opSuccess") + " — وكيل على المرتب",
      body: blackTextAr("opAgentActive"),
      category: "board",
      kind: "black-agent",
    });
  }

  return { success: true, heat: op.heat };
}

export function donateCharity(s, amount) {
  const bf = ensureBlackFiles(s);
  assert(Number.isSafeInteger(amount) && amount >= 100000 && amount <= 20000000, "مبلغ التبرع غير صالح.");
  assert(s.finance.cash >= amount, "السيولة لا تكفي للتبرع.");
  const key = uid(s, "charity");
  post(s, -amount, "charity", blackTextAr("charityDonation"), key);
  const reduction = (amount / 1000000) * 2;
  reduceSuspicion(s, reduction);
  bf.charityTotal += amount;
  message(s, {
    title: blackTextAr("charityDonation"),
    body: `تبرعت ${amount} — انخفضت الشبهات ${reduction.toFixed(1)}%.`,
    category: "board",
  });
  return bf.suspicion;
}

export function cutMiddlemen(s) {
  const bf = ensureBlackFiles(s);
  assert(bf.active.agentOnPayroll || bf.suspicion > 0, "لا يوجد وسطاء لقطعهم.");
  bf.active.agentOnPayroll = false;
  bf.active.agentSince = null;
  reduceSuspicion(s, 15);
  message(s, {
    title: blackTextAr("cutMiddlemen"),
    body: blackTextAr("cutMiddlemenDesc"),
    category: "board",
  });
  return bf.suspicion;
}

export function triggerScandal(s) {
  const bf = ensureBlackFiles(s);
  if (bf.suspicion < 100) return null;
  // خصم 3-9 نقاط
  const pointsDeduction = 3 + Math.floor(random(s) * 7);
  const ownRow = s.table?.find((t) => t.clubId === s.clubId);
  if (ownRow) ownRow.points = Math.max(0, ownRow.points - pointsDeduction);

  // غرامات ضخمة 15-35M
  const fine = 15000000 + Math.floor(random(s) * 20000000);
  post(s, -fine, "black-fine", "غرامة الفضيحة الكبرى", uid(s, "scandal-fine"));

  // سحب لقب الموسم الحالي إن وجد — إذا كنت متصدرًا
  const isLeader = ownRow && s.table?.every((t) => t.clubId === s.clubId || t.points <= ownRow.points);
  if (isLeader) bf.titleStripped = true;

  // هروب راعٍ
  const activeSponsors = s.sponsors.filter((c) => c.status === "active");
  let sponsorOut = null;
  if (activeSponsors.length) {
    sponsorOut = [...activeSponsors].sort((a, b) => a.end.localeCompare(b.end))[0];
    sponsorOut.status = "expired";
    sponsorOut.end = s.date;
    s.finance.obligations = s.finance.obligations.filter((o) => !(o.ref === sponsorOut.id && o.status === "pending"));
  }

  // غضب جماهيري -15 إلى -25
  const fanDrop = 15 + Math.floor(random(s) * 11);
  s.fanSupport = clamp(s.fanSupport - fanDrop, 0, 100);

  // منع قيد لفترة 90-180 يوم
  const banDays = 90 + Math.floor(random(s) * 91);
  bf.transferBanUntil = addDays(s.date, banDays);

  // تصفير المؤشر مع عقوبة سمعة دائمة خفيفة -2
  bf.suspicion = 0;
  bf.scandalCount += 1;
  s.reputation = clamp(s.reputation - 2, 0, 100);
  bf.permanentRepPenalty += 2;

  bf.history.push({
    date: s.date,
    points: pointsDeduction,
    fine,
    sponsor: sponsorOut?.id || null,
    fanDrop,
    banDays,
    titleStripped: Boolean(isLeader),
  });

  fileLegalCase(s, "scandal", {
    source: "black-scandal",
    sourceId: `black-scandal-${bf.scandalCount}`,
    severity: 3,
  });

  message(s, {
    title: blackTextAr("scandalTitle", { n: pointsDeduction }),
    body: blackTextAr("scandalBody", { n: pointsDeduction, money: fine, d: banDays }),
    category: "board",
    required: true,
    kind: "black-scandal",
    priority: "high",
    deadline: addDays(s.date, 10),
  });

  // ربط باللائحة: بند لا فضائح يُسقط بند الثقة تلقائيًا
  const b = ensureBoard(s);
  if (b) {
    b.confidence = clamp(b.confidence - 20 - bf.scandalCount * 3, 0, 100);
    b.failureStreak += 1;
    // إذا كانت لائحة نشطة، نضع علامة فشل فوري على بند لا فضائح
    if (b.mandate?.items?.some((it) => it.kind === "no-scandal")) {
      // نُسجل اجتماع فشل ثقة
      b.meetings.push({
        id: uid(s, "meet-scandal"),
        kind: "end",
        season: b.mandate.season,
        date: s.date,
        status: "failed",
        done: 0,
        total: b.mandate.items.length,
        reason: "scandal",
      });
    }
  }

  return {
    pointsDeduction,
    fine,
    fanDrop,
    banDays,
    titleStripped: Boolean(isLeader),
  };
}

export function blackFilesDay(s) {
  const bf = ensureBlackFiles(s);
  if (!bf) return;

  // AI يكسر شروط لاعبي المستخدم (مرة في الشهر)
  if (s.expansion && s.date.endsWith("-12")) {
    try {
      aiBreakReleaseClauses(s);
    } catch {}
  }

  // مرور الوقت ينزل الشبهات 0.12 يوميًا
  if (bf.suspicion > 0) {
    bf.suspicion = clamp(bf.suspicion - 0.12, 0, 100);
  }

  // وكيل على المرتب: heat مستمر صغير 0.15 يوميًا + راتب شهري
  if (bf.active.agentOnPayroll) {
    bf.suspicion = clamp(bf.suspicion + 0.15, 0, 100);
    if (s.date.endsWith("-01")) {
      const salary = OPERATIONS["agent-payroll"].salary;
      if (s.finance.cash >= salary) {
        post(s, -salary, "agent", "راتب وكيل على المرتب", "agent-payroll-" + s.date);
      }
    }
    if (bf.suspicion >= 100) triggerScandal(s);
  }

  // انتهاء آثار مؤقتة
  if (bf.active.refereeBias && bf.active.refereeBias.until < s.date) {
    bf.active.refereeBias = null;
  }
  if (bf.active.bribedOpponent && bf.active.bribedOpponent.until < s.date) {
    bf.active.bribedOpponent = null;
  }
  if (bf.active.mediaWar && bf.active.mediaWar.until < s.date) {
    bf.active.mediaWar = null;
  }

  // معالجة كسر AI للشرط الجزائي المعلق: إنذار مسبق + مهلة رد (راتب/تجديد/شرط) قبل التنفيذ
  if (bf.pendingAiBreaks?.length) {
    const remaining = [];
    for (const item of bf.pendingAiBreaks) {
      const p = s.players.find((x) => x.id === item.playerId);
      if (!p || p.clubId !== s.clubId || p.status === "retired") continue;
      if (item.warned && isReleaseBreakProtected(p, item)) {
        finalizeReleaseBreakProtection(s, p, item);
        continue;
      }
      if (!item.warned) {
        item.warned = true;
        item.warnedOn = s.date;
        item.deadline =
          item.deadline || addDays(s.date, RELEASE_BREAK_DEADLINE_DAYS);
        item.salaryAtWarning = p.salary;
        item.contractEndAtWarning = p.contractEnd;
        item.clauseAtWarning = p.contractTerms?.releaseClause ?? item.clause;
        const buyerName = extendedClub(item.buyer)?.name || item.buyer;
        const alertTitle = blackTextAr("releaseClauseAlertTitle", {
          c: buyerName,
          v: p.name,
        });
        if (s.press && Array.isArray(s.press.news)) {
          s.press.news.unshift({
            date: s.date,
            title: alertTitle,
            text: alertTitle,
            type: "انتقالات",
          });
          s.press.news = s.press.news.slice(0, 60);
        }
        message(s, {
          title: alertTitle,
          body: blackTextAr("releaseClauseAlertBody", {
            c: buyerName,
            v: p.name,
            money: item.clause.toLocaleString("en-US"),
            d: item.deadline,
          }),
          category: "transfers",
          kind: "release-clause-alert",
          ref: p.id,
          deadline: item.deadline,
          priority: "high",
        });
        remaining.push(item);
        continue;
      }
      if (s.date < item.deadline) {
        remaining.push(item);
        continue;
      }
      // انتهت مهلة الرد دون تحصين — تنفيذ كسر الشرط الجزائي
      const buyerName = extendedClub(item.buyer)?.name || item.buyer;
      p.clubId = item.buyer;
      p.careerHistory.push({
        date: s.date,
        type: "release-broken-ai",
        clubId: item.buyer,
        fee: item.clause,
      });
      post(
        s,
        item.clause,
        "player-sale",
        `كسر شرط جزائي: ${p.name}`,
        uid(s, "release-ai"),
      );
      s.fanSupport = clamp(s.fanSupport - 8, 0, 100);
      addNoise(s, "transfer", 10, "كسر شرط جزائي يثير الجدل");
      for (const m of (s.inbox || []).filter(
        (m) => m.kind === "release-clause-alert" && m.ref === p.id,
      )) {
        m.status = "resolved";
        m.read = true;
      }
      if (s.press && Array.isArray(s.press.news)) {
        const brokenTitle = blackTextAr("releaseClauseBrokenTitle", {
          v: p.name,
        });
        s.press.news.unshift({
          date: s.date,
          title: brokenTitle,
          text: brokenTitle,
          type: "انتقالات",
        });
        s.press.news = s.press.news.slice(0, 60);
      }
      message(s, {
        title: blackTextAr("releaseClauseBrokenTitle", { v: p.name }),
        body: blackTextAr("releaseClauseBrokenBody", {
          v: buyerName,
          money: item.clause.toLocaleString("en-US"),
        }),
        category: "transfers",
        priority: "high",
      });
    }
    bf.pendingAiBreaks = remaining;
  }
}

export function isReleaseBreakProtected(p, item) {
  if (!p || !item) return false;
  if (item.protected) return true;
  const currentClause = p.contractTerms?.releaseClause ?? 0;
  if (currentClause <= 0 || currentClause > item.clause) return true;
  if (
    item.salaryAtWarning !== undefined &&
    p.salary > item.salaryAtWarning
  )
    return true;
  if (
    item.contractEndAtWarning &&
    p.contractEnd &&
    p.contractEnd > item.contractEndAtWarning
  )
    return true;
  if (
    item.warnedOn &&
    p.contractTerms?.signedOn &&
    p.contractTerms.signedOn > item.warnedOn
  )
    return true;
  return false;
}

function finalizeReleaseBreakProtection(s, p, item) {
  if (
    item.budgetDeducted &&
    s.expansion?.budgets &&
    Object.hasOwn(s.expansion.budgets, item.buyer)
  ) {
    s.expansion.budgets[item.buyer] += item.clause;
    item.budgetDeducted = false;
  }
  for (const m of (s.inbox || []).filter(
    (m) => m.kind === "release-clause-alert" && m.ref === p.id,
  )) {
    m.status = "resolved";
    m.read = true;
  }
  const buyerName = extendedClub(item.buyer)?.name || item.buyer;
  const title = blackTextAr("releaseClauseProtectedTitle", { v: p.name });
  if (s.press && Array.isArray(s.press.news)) {
    s.press.news.unshift({
      date: s.date,
      title,
      text: title,
      type: "انتقالات",
    });
    s.press.news = s.press.news.slice(0, 60);
  }
  message(s, {
    title,
    body: blackTextAr("releaseClauseProtectedBody", {
      v: p.name,
      c: buyerName,
    }),
    category: "transfers",
    kind: "release-clause-protected",
    ref: p.id,
  });
}

export function resolvePendingReleaseBreakIfProtected(s, playerId) {
  const bf = s.blackFiles;
  if (!bf?.pendingAiBreaks?.length) return false;
  const idx = bf.pendingAiBreaks.findIndex((x) => x.playerId === playerId);
  if (idx === -1) return false;
  const item = bf.pendingAiBreaks[idx];
  const p = s.players.find((x) => x.id === playerId);
  if (!p || p.clubId !== s.clubId) return false;
  if (!isReleaseBreakProtected(p, item)) return false;
  bf.pendingAiBreaks.splice(idx, 1);
  finalizeReleaseBreakProtection(s, p, item);
  return true;
}

export function counterReleaseClauseBreak(
  s,
  playerId,
  method = "salary",
  options = {},
) {
  const bf = ensureBlackFiles(s);
  const p = s.players.find((x) => x.id === playerId);
  assert(p && p.clubId === s.clubId, "اللاعب ليس في النادي.");
  const idx = (bf.pendingAiBreaks || []).findIndex(
    (x) => x.playerId === playerId,
  );
  assert(idx !== -1, "لا يوجد إنذار كسر شرط جزائي معلق لهذا اللاعب.");
  const item = bf.pendingAiBreaks[idx];
  assert(
    !item.warned || !item.deadline || s.date < item.deadline,
    "انتهت مهلة الرد على كسر الشرط الجزائي.",
  );
  if (method === "salary") {
    const nextSalary =
      options.salary !== undefined
        ? Number(options.salary)
        : Math.max(p.salary + 1, Math.round(p.salary * 1.2));
    assert(
      Number.isSafeInteger(nextSalary) && nextSalary > p.salary,
      "الراتب الجديد يجب أن يكون أعلى من الراتب الحالي.",
    );
    p.salary = nextSalary;
    p.morale = clamp((p.morale || 70) + 6, 0, 100);
  } else if (method === "renew") {
    const years = [1, 2, 3, 4].includes(options.years) ? options.years : 3;
    const nextSalary =
      options.salary !== undefined
        ? Number(options.salary)
        : Math.max(p.salary + 1, Math.round(p.salary * 1.15));
    assert(
      Number.isSafeInteger(nextSalary) && nextSalary >= p.salary,
      "اللاعب يطلب الحفاظ على مرتبه على الأقل.",
    );
    const baseEnd =
      p.contractEnd && p.contractEnd > s.date ? p.contractEnd : s.date;
    p.salary = nextSalary;
    p.contractEnd = addDays(baseEnd, 365 * years);
    p.contractTerms = {
      ...(p.contractTerms || {}),
      signedOn: s.date,
      lastRaiseYear: s.date.slice(0, 4),
    };
    if (options.releaseClause !== undefined) {
      const nextClause = Number(options.releaseClause);
      assert(
        Number.isSafeInteger(nextClause) && nextClause >= 0,
        "شرط جزائي غير صالح.",
      );
      p.contractTerms.releaseClause = nextClause;
    }
    p.morale = clamp((p.morale || 70) + 8, 0, 100);
  } else if (method === "clause") {
    const nextClause =
      options.releaseClause !== undefined
        ? Number(options.releaseClause)
        : item.clause * 2;
    assert(
      Number.isSafeInteger(nextClause) &&
        (nextClause === 0 || nextClause > item.clause),
      "الشرط الجديد يجب أن يكون أعلى من الشرط الحالي أو صفرًا لإلغائه.",
    );
    p.contractTerms = {
      ...(p.contractTerms || {}),
      releaseClause: nextClause,
    };
    if (nextClause > item.clause)
      p.salary = Math.max(p.salary, Math.round(p.salary * 1.1));
  } else {
    assert(false, "طريقة التحصين غير صالحة.");
  }
  item.protected = true;
  bf.pendingAiBreaks.splice(idx, 1);
  finalizeReleaseBreakProtection(s, p, item);
  return { protected: true, method, playerId: p.id, buyer: item.buyer };
}

export const protectFromReleaseBreak = counterReleaseClauseBreak;

export function isTransferBanned(s) {
  const bf = ensureBlackFiles(s);
  return Boolean(bf.transferBanUntil && bf.transferBanUntil >= s.date);
}
