// الشغل الشيطاني 😈 0.36 — رهانات داخلية بمعلومات مسربة، سلايدر مخاطرة/ربح، كومبو الرشوة.
import { clamp, random, addDays, uid } from "../../core/utils.js";
import { message } from "../inbox.js";
import { addSuspicion, triggerScandal } from "../blackFiles.js";
import { ensureBoard } from "../boardMandate.js";
import { ensureBetting, estimateMarketValue } from "./state.js";
import { ensureEmpire, personalIncome } from "../empire/wealth.js";
import { bettingText } from "../../data/bettingTexts.js";

function riskToMultiplier(risk) {
  return 1.2 + (risk / 100) * 4.0; // 1.2 → 5.2
}
function riskToDetectionBase(risk, sus, hasBribe) {
  let base = 0.04 + (risk / 100) * 0.58; // 0.04 → 0.62
  base += (sus / 100) * 0.12;
  if (hasBribe) base += 0.18;
  if (risk >= 85) base += 0.08; // all-in طمع
  return clamp(base, 0.02, 0.92);
}

export function placeInsiderBet(s, amount, risk, fixtureId) {
  const b = ensureBetting(s);
  const e = ensureEmpire(s);
  if (!b.owned) throw new Error(bettingText("noCompany"));
  if (b.licenseStatus !== "active") throw new Error("الترخيص غير نشط للمراهنة");
  if (b.pendingInsider) throw new Error("لديك رهان داخلي معلق بالفعل");
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("مبلغ رهان غير صالح");
  if (risk < 0 || risk > 100) throw new Error("مخاطرة غير صالحة");
  if (e.personal < amount) throw new Error(bettingText("needMoney"));
  // حد أدنى/أقصى: 100k → كل الثروة
  const max = e.personal;
  if (amount > max) throw new Error("المبلغ أكبر من ثروتك الشخصية");

  // التمويل من الثروة الشخصية
  e.personal -= amount;

  const hasBribe = Boolean(s.blackFiles?.active?.bribedOpponent);
  const detectionChance = riskToDetectionBase(risk, s.blackFiles?.suspicion ?? 0, hasBribe);
  const multiplier = riskToMultiplier(risk) * (hasBribe ? 1.75 : 1);
  const fixture = fixtureId || (s.fixtures?.find((f) => !f.played && (f.home === s.clubId || f.away === s.clubId))?.id) || `manual-${s.date}`;

  b.pendingInsider = {
    id: uid(s, "insider"),
    amount,
    risk,
    multiplier: Math.round(multiplier * 100) / 100,
    detectionChance: Math.round(detectionChance * 1000) / 1000,
    fixtureId: fixture,
    date: s.date,
    hasBribe,
  };

  message(s, {
    title: bettingText("insiderBetTitle"),
    body: bettingText("insiderBetBody").replace("{money}", String(amount)).replace("{risk}", String(risk)),
    category: "board",
    kind: "betting-insider",
  });

  if (hasBribe) {
    message(s, {
      title: bettingText("bribeComboTitle"),
      body: bettingText("bribeComboBody"),
      category: "board",
      kind: "betting-combo",
    });
  }

  return b.pendingInsider;
}

// يُستدعى بعد المباراة: نحسم الرهان
export function resolveInsiderBet(s, fixtureResult) {
  const b = ensureBetting(s);
  if (!b.pendingInsider) return null;
  const bet = b.pendingInsider;
  // نفترض أن fixtureResult فيه winner/happened. لو فريقك فاز → فوز الرهان بنسبة معلومات داخلية
  const isOurFixture = (() => {
    if (!fixtureResult) return true;
    return fixtureResult.home === s.clubId || fixtureResult.away === s.clubId;
  })();
  if (!isOurFixture && fixtureResult) {
    // ليس مباراة فريقك: الرهان يبقى معلقًا حتى الجولة القادمة
    return null;
  }

  // نسبة فوز مستندة لمعلومة داخلية: تعرف التشكيلة والإصابات
  const winChance = 0.58 + (bet.risk / 100) * 0.14 + (bet.hasBribe ? 0.11 : 0);
  const won = random(s) < clamp(winChance, 0.52, 0.88);
  const e = ensureEmpire(s);

  let outcome = null;

  // كشف؟
  const willExpose = random(s) < bet.detectionChance;
  if (willExpose) {
    outcome = exposeInsider(s, bet, won);
  } else if (won) {
    const profit = Math.round(bet.amount * bet.multiplier);
    const net = profit - bet.amount; // الربح الصافي فوق رأس المال (رأس المال سبق خصمه)
    // رأس المال يعود + الربح
    e.personal += profit;
    b.totalProfit += net;
    b.reputation = clamp(b.reputation - (bet.risk > 70 ? 4 : 1), 0, 100);
    b.insiderHistory.push({ ...bet, won: true, profit, net, date: s.date, exposed: false });
    message(s, {
      title: bettingText("insiderWinTitle"),
      body: bettingText("insiderWinBody").replace("{money}", String(profit)),
      category: "board",
    });
    outcome = { won: true, profit, exposed: false };
  } else {
    b.insiderHistory.push({ ...bet, won: false, profit: 0, net: -bet.amount, date: s.date, exposed: false });
    message(s, { title: "خسارة رهان داخلي", body: `خسرت ${bet.amount} — لكنك لم تُكشف.`, category: "board" });
    outcome = { won: false, profit: 0, exposed: false };
  }

  b.pendingInsider = null;
  estimateMarketValue(s);
  return outcome;
}

function exposeInsider(s, bet, wouldWin) {
  const b = ensureBetting(s);
  const e = ensureEmpire(s);

  // 1. سحب الترخيص نهائيًا
  b.licenseStatus = "revoked";
  b.suspensionUntil = null;
  b.customers = Math.max(0, Math.round(b.customers * 0.25));
  b.reputation = clamp(b.reputation - 35, 0, 100);
  b.marketValue = 0;

  // 2. فضيحة شبهات كبرى (الثامنة) +30 إلى +45
  const susAdd = 35 + Math.floor(random(s) * 11) + (bet.hasBribe ? 15 : 0);
  addSuspicion(s, susAdd);

  // 3. عزل من رئاسة الاتحاد (13)
  if (s.politics?.office?.held) {
    s.politics.office.held = false;
    s.politics.office.lastDeparture = s.date;
    s.politics.office.termEndSeason = s.seasonNumber;
    s.politics.integrity.score = clamp(s.politics.integrity.score - 28, 0, 100);
    s.politics.legacy.trial.status = "pending";
    s.politics.legacy.trial.charges = ["betting-insider", ...(bet.hasBribe ? ["bribery"] : [])];
    s.politics.legacy.trial.openedDate = s.date;
    message(s, {
      title: "عزل من رئاسة الاتحاد ⛔",
      body: "قضية الرهان الداخلي أسقطت رئاستك للاتحاد. لجنة النزاهة فتحت تحقيقًا فوريًا.",
      category: "board",
      required: true,
      priority: "high",
    });
  }

  // 4. دمار المسيرة: الجمعية العمومية (6) بند أخلاقي ينهار
  const board = ensureBoard(s);
  if (board) {
    board.confidence = clamp(board.confidence - 38 - (bet.hasBribe ? 12 : 0), 0, 100);
    board.failureStreak += 2;
    s.fanSupport = clamp(s.fanSupport - 22 - (bet.hasBribe ? 8 : 0), 0, 100);
    s.reputation = clamp(s.reputation - 6, 0, 100);
  }

  // 5. إذا كان كومبو رشوة: غرامة ضخمة ومهاجمة الصحافة
  if (bet.hasBribe) {
    const fine = 8_000_000 + Math.floor(random(s) * 12_000_000);
    const pay = Math.min(fine, e.personal);
    e.personal -= pay;
    if (pay < fine) e.debt += fine - pay;
    // استدعاء فضيحة الملفات السوداء إن بلغت 100
    if (s.blackFiles.suspicion >= 100) triggerScandal(s);
  }

  b.insiderHistory.push({ ...bet, won: wouldWin, profit: 0, net: -bet.amount, date: s.date, exposed: true });

  message(s, {
    title: bettingText("insiderExposedTitle"),
    body: bettingText("insiderExposedBody"),
    category: "board",
    required: true,
    kind: "betting-exposed",
    priority: "high",
    deadline: addDays(s.date, 7),
  });

  return { won: wouldWin, profit: 0, exposed: true };
}

// أداة اختبار: احتمال الكشف لنفس المتغيرات
export function estimateDetection(s, risk, hasBribe) {
  return riskToDetectionBase(risk, s.blackFiles?.suspicion ?? 0, hasBribe);
}
