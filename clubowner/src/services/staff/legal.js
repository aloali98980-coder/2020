// إدارة القضايا: مراحل ومواعيد ورسوم ونتائج متصلة بفضائح الملفات السوداء ونزاعات الخلافة.
import { addDays, assert, clamp, uid } from "../../core/utils.js";
import { CASE_KINDS, CASE_STAGES } from "../../data/staffCatalog.js";
import { message } from "../inbox.js";
import { post } from "../finance.js";
import { corpSkill, ensureStaffCorp, srng } from "./staffCorp.js";

const OPEN_CASE_LIMIT = 8;
const CASE_HISTORY_LIMIT = 40;
const STAGE_DAYS = 14;
const DEADLINE_GRACE_DAYS = 30;

const stageFee = (item) =>
  CASE_KINDS[item.kind].fees[CASE_STAGES.indexOf(item.stage)];
export const legalSettlementCost = (item) =>
  Math.round(stageFee(item) * 2 + item.severity * 50_000);

function staffLegal(s) {
  const legal = ensureStaffCorp(s).legal;
  legal.cases ||= [];
  legal.wins ||= 0;
  legal.losses ||= 0;
  legal.settlements ||= 0;
  legal.retainerUntil ??= null;
  return legal;
}

function dynastyMember(s, claimantId) {
  const pending = [...(s.dynasty?.children || [])];
  while (pending.length) {
    const person = pending.pop();
    if (person.id === claimantId) return person;
    pending.push(...(person.offspring || []));
  }
  return null;
}

function setSuccessionPrelude(s, claimantId) {
  const dynasty = s.dynasty;
  if (!dynasty) return;
  dynasty.legalPrelude = {
    status: "settled",
    claimantId: claimantId || dynasty.heirId || null,
    preparedOn: s.date,
  };
}

function fileMessage(s, item) {
  const fee = stageFee(item);
  message(s, {
    title: `قضية قانونية جديدة: ${CASE_KINDS[item.kind].name.ar}`,
    body: `تم فتح القضية في مرحلة الاستئناف. موعد الجلسة: ${item.nextOn}. أتعاب المرحلة: ${fee.toLocaleString()}.`,
    category: "club",
    kind: "staff-legal-case",
    ref: item.id,
  });
}

/** Open a case once for a unique source. Filing is free; fees begin when counsel acts. */
export function fileLegalCase(s, kind, options = {}) {
  assert(Object.hasOwn(CASE_KINDS, kind), "نوع القضية القانونية غير صالح.");
  const legal = staffLegal(s);
  const sourceId =
    typeof options.sourceId === "string"
      ? options.sourceId.slice(0, 100)
      : null;
  if (sourceId) {
    const existing = legal.cases.find((item) => item.sourceId === sourceId);
    if (existing) return existing;
  }
  assert(
    sourceId ||
      legal.cases.filter((item) => item.status === "open").length <
        OPEN_CASE_LIMIT,
    "وصلت إلى الحد الأقصى للقضايا المفتوحة؛ احسم قضية أولًا.",
  );
  if (legal.cases.length >= CASE_HISTORY_LIMIT) {
    const closedIndex = legal.cases.findIndex((item) => item.status !== "open");
    assert(closedIndex >= 0, "سجل القضايا ممتلئ.");
    legal.cases.splice(closedIndex, 1);
  }
  const severity = clamp(Math.round(Number(options.severity) || 1), 1, 3);
  const item = {
    id: uid(s, "legal-case"),
    kind,
    source:
      typeof options.source === "string"
        ? options.source.slice(0, 40)
        : "owner-filed",
    sourceId,
    claimantId:
      typeof options.claimantId === "string"
        ? options.claimantId.slice(0, 100)
        : null,
    severity,
    status: "open",
    stage: CASE_STAGES[0],
    openedOn: s.date,
    nextOn: addDays(s.date, STAGE_DAYS),
    hearingNotified: false,
    stageResults: [],
    closedOn: null,
  };
  legal.cases.unshift(item);
  if (kind === "succession" && s.dynasty)
    s.dynasty.legalPrelude = {
      status: "prepared",
      claimantId: item.claimantId,
      preparedOn: s.date,
    };
  fileMessage(s, item);
  return item;
}

/** File or reuse the succession claim associated with a dynasty member. */
export function fileSuccessionCase(s, claimantId, source = "dynasty-conflict") {
  const claimant = dynastyMember(s, claimantId);
  if (!claimant || !claimant.legalClaim) return null;
  return fileLegalCase(s, "succession", {
    source,
    sourceId: `succession-${claimant.id}`,
    claimantId: claimant.id,
    severity: 2,
  });
}

function adjustTransferBan(s, won) {
  const files = s.blackFiles;
  if (!files?.transferBanUntil || files.transferBanUntil < s.date) return;
  if (won) files.transferBanUntil = s.date;
  else files.transferBanUntil = addDays(files.transferBanUntil, 30);
}

function applyOutcome(s, item, won) {
  if (item.kind === "ban") {
    adjustTransferBan(s, won);
  } else if (item.kind === "scandal") {
    if (won) {
      s.fanSupport = clamp((s.fanSupport || 0) + 4, 0, 100);
      s.reputation = clamp((s.reputation || 0) + 1, 0, 100);
      adjustTransferBan(s, true);
    } else {
      s.fanSupport = clamp((s.fanSupport || 0) - 5, 0, 100);
      s.reputation = clamp((s.reputation || 0) - 2, 0, 100);
      adjustTransferBan(s, false);
    }
  } else if (item.kind === "contract" && won) {
    const award = Math.min(1_000_000, stageFee(item) * 4);
    post(
      s,
      award,
      "legal-compensation",
      "تعويض نزاع تعاقدي",
      `legal-award-${item.id}`,
    );
  } else if (item.kind === "succession") {
    const claimant = dynastyMember(s, item.claimantId);
    if (claimant) {
      claimant.legalClaim = won;
      claimant.excludedFromSuccession = !won;
      claimant.isHeir = won && s.dynasty.heirId === claimant.id;
      if (!won && s.dynasty.heirId === claimant.id) s.dynasty.heirId = null;
    }
    setSuccessionPrelude(s, item.claimantId);
  }
}

function finishCase(s, item, status) {
  const legal = staffLegal(s);
  const won = status === "won";
  item.status = status;
  item.closedOn = s.date;
  item.hearingNotified = false;
  if (won) legal.wins += 1;
  else legal.losses += 1;
  applyOutcome(s, item, won);
  message(s, {
    title: won ? "كسب النادي القضية" : "خسر النادي القضية",
    body: `حُسمت قضية ${CASE_KINDS[item.kind].name.ar} في ${s.date}. ${won ? "نجح الدفاع القانوني." : "لم ينجح الدفاع القانوني."}`,
    category: "club",
    kind: "staff-legal-result",
    ref: item.id,
  });
}

/** Contest the scheduled hearing or settle the matter at the current stage. */
export function resolveLegalCase(s, caseId, action = "contest") {
  const legal = staffLegal(s);
  const item = legal.cases.find((candidate) => candidate.id === caseId);
  assert(item?.status === "open", "القضية غير مفتوحة.");

  if (action === "settle") {
    const cost = legalSettlementCost(item);
    assert(s.finance.cash >= cost, "السيولة لا تكفي لتسوية القضية.");
    post(
      s,
      -cost,
      "legal-settlement",
      "تسوية قضية قانونية",
      `legal-settle-${item.id}`,
    );
    item.status = "settled";
    item.closedOn = s.date;
    legal.settlements += 1;
    if (item.kind === "succession") setSuccessionPrelude(s, item.claimantId);
    if (item.kind === "scandal" || item.kind === "ban")
      adjustTransferBan(s, true);
    message(s, {
      title: "تمت تسوية القضية",
      body: `أُغلقت قضية ${CASE_KINDS[item.kind].name.ar} بتسوية قدرها ${cost.toLocaleString()}.`,
      category: "club",
      kind: "staff-legal-result",
      ref: item.id,
    });
    return { item, action, cost };
  }

  assert(action === "contest", "الإجراء القانوني غير صالح.");
  assert(s.date >= item.nextOn, "موعد الجلسة لم يحن بعد.");
  const fee = stageFee(item);
  assert(s.finance.cash >= fee, "السيولة لا تغطي أتعاب المرحلة القانونية.");
  post(
    s,
    -fee,
    "legal-fee",
    "أتعاب التمثيل القانوني",
    `legal-fee-${item.id}-${item.stage}`,
  );

  const skill = corpSkill(s, "lawyer");
  const retainer = legal.retainerUntil && legal.retainerUntil >= s.date;
  const chance = clamp(
    45 + skill * 0.3 + (retainer ? 10 : 0) - item.severity * 8,
    15,
    90,
  );
  const won = srng(s) * 100 < chance;
  item.stageResults.push({
    stage: item.stage,
    date: s.date,
    fee,
    skill,
    retainer: Boolean(retainer),
    chance,
    won,
  });
  const lastStage = item.stage === CASE_STAGES.at(-1);
  if (lastStage) {
    finishCase(s, item, won ? "won" : "lost");
  } else {
    item.severity = clamp(item.severity + (won ? -1 : 1), 1, 3);
    item.stage = CASE_STAGES[CASE_STAGES.indexOf(item.stage) + 1];
    item.nextOn = addDays(s.date, STAGE_DAYS);
    item.hearingNotified = false;
    message(s, {
      title: won ? "تقدم في القضية" : "تعثر في الجلسة",
      body: `انتهت مرحلة ${item.stageResults.at(-1).stage}. الجلسة التالية في ${item.nextOn}؛ مستوى القضية الآن ${item.severity}.`,
      category: "club",
      kind: "staff-legal-stage",
      ref: item.id,
    });
  }
  return { item, action, fee, chance, won };
}

/** Send a hearing reminder and close cases ignored beyond the response window. */
export function legalDay(s) {
  const legal = staffLegal(s);
  for (const item of [...legal.cases]) {
    if (item.status !== "open" || !item.nextOn) continue;
    if (s.date > addDays(item.nextOn, DEADLINE_GRACE_DAYS)) {
      finishCase(s, item, "lost");
      continue;
    }
    if (s.date >= item.nextOn && !item.hearingNotified) {
      item.hearingNotified = true;
      message(s, {
        title: "موعد جلسة القضية اليوم",
        body: `حان موعد المرحلة التالية من قضية ${CASE_KINDS[item.kind].name.ar}. تحرك قبل انتهاء مهلة الثلاثين يومًا.`,
        category: "club",
        kind: "staff-legal-hearing",
        ref: item.id,
      });
    }
  }
}
