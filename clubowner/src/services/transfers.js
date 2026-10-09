import { assertMarket } from "./market.js";
import { reservedSquadSize } from "./employment.js";
import { difficulty } from "../models/difficulty.js";
import { normalizeClauses, guaranteedWages } from "./contractClauses.js";
import { assert, uid, addDays, clamp } from "../core/utils.js";
import { message, closeThread } from "./inbox.js";
import { post, obligation, wages } from "./finance.js";
import { assertTransfersAllowed } from "./boardMandate.js";
import { isTransferBanned } from "./blackFiles.js";
export function submitOffer(s, playerId, terms) {
  assertTransfersAllowed(s);
  if (isTransferBanned(s)) throw new Error("منع قيد سارٍ — لا عمليات انتقال حتى ينتهي الحظر.");
  const p = s.players.find((p) => p.id === playerId);
  assertMarket(s, p);
  assert(!p?.loan, "اللاعب مُعار؛ لا يمكن شراء عقده في هذا النموذج.");
  assert(
    p && p.clubId !== s.clubId && p.status !== "retired",
    "اللاعب غير متاح للشراء.",
  );
  assert(
    !s.negotiations.some(
      (n) =>
        n.playerId === playerId &&
        ["waiting", "club-reply", "personal"].includes(n.stage),
    ),
    "يوجد تفاوض قائم مع اللاعب.",
  );
  assert(
    Number.isSafeInteger(terms.fee) &&
      terms.fee >= 0 &&
      [40, 60, 100].includes(terms.upfrontPercent),
    "راجع قيمة العرض ونسبة المقدم.",
  );
  assert(
    s.finance.cash >= Math.round((terms.fee * terms.upfrontPercent) / 100),
    "السيولة لا تكفي لمقدم العرض.",
  );
  assert(
    !s.management?.loanOffers?.some(
      (o) =>
        o.playerId === playerId && ["waiting", "countered"].includes(o.status),
    ),
    "يوجد تفاوض إعارة قائم.",
  );
  const n = {
    id: uid(s, "neg"),
    playerId,
    seller: p.clubId,
    ...terms,
    date: s.date,
    stage: "waiting",
  };
  s.negotiations.push(n);
  s.events.push({
    id: uid(s, "ev"),
    date: addDays(s.date, 1),
    type: "transfer-reply",
    ref: n.id,
    done: false,
  });
  message(s, {
    title: "تم إرسال عرض الانتقال",
    body: `أرسلنا العرض إلى نادي ${p.name}. الرد المتوقع غدًا؛ لم يتم خصم أي مبلغ.`,
    category: "transfers",
    ref: n.id,
  });
  return n;
}
export function transferReply(s, id) {
  const n = s.negotiations.find((x) => x.id === id);
  if (!n || n.stage !== "waiting") return;
  const p = s.players.find((x) => x.id === n.playerId);
  const relations = clamp(s.dynasty?.ownerBonuses?.playerRelations || 0, 0, 100);
  const acceptanceThreshold =
    p.value * clamp(0.93 - relations / 100, 0.75, 0.93) * difficulty(s).transfer;
  n.counter =
    p.contractTerms?.releaseClause > 0 && n.fee >= p.contractTerms.releaseClause
      ? n.fee
      : Math.max(n.fee, Math.round(acceptanceThreshold));
  n.stage = "club-reply";
  message(s, {
    title:
      n.fee >= acceptanceThreshold
        ? `قبول مبدئي لعرض ${p.name}`
        : `عرض مضاد: ${p.name}`,
    body:
      n.fee >= acceptanceThreshold
        ? "النادي وافق على قيمة العرض. الاتفاق النهائي يتطلب التفاوض على عقد اللاعب والفحص والتسجيل."
        : "النادي يطلب زيادة قيمة الانتقال. يمكنك قبول القيمة الجديدة والانتقال لشروط اللاعب، أو إنهاء التفاوض.",
    category: "transfers",
    required: true,
    kind: "transfer",
    ref: id,
    deadline: addDays(s.date, 4),
    priority: "high",
  });
}
export function acceptClub(s, id) {
  const n = s.negotiations.find((x) => x.id === id);
  assert(n && n.stage === "club-reply", "العرض غير متاح.");
  n.fee = n.counter;
  n.stage = "personal";
  closeThread(s, id);
  const p = s.players.find((x) => x.id === n.playerId);
  message(s, {
    title: `شروط عقد ${p.name}`,
    body: "حدد المرتب ومدة العقد والمكافأة والدور. لم تكتمل الصفقة بعد ولن تُخصم الأموال قبل التوقيع.",
    category: "transfers",
    required: true,
    kind: "personal",
    ref: id,
    deadline: addDays(s.date, 4),
    priority: "high",
  });
}
export function rejectNegotiation(s, id) {
  const n = s.negotiations.find((x) => x.id === id);
  if (n) n.stage = "rejected";
  closeThread(s, id);
}
export function signPlayer(s, id, terms) {
  assertTransfersAllowed(s);
  const n = s.negotiations.find((x) => x.id === id);
  assert(n && n.stage === "personal", "ابدأ باتفاق مع النادي أولًا.");
  const p = s.players.find((x) => x.id === n.playerId);
  assertMarket(s, p);
  assert(!p.loan, "اللاعب معار الآن.");
  assert(
    p.status !== "retired" && (!n.seller || p.clubId === n.seller),
    "تغيرت ملكية اللاعب أو اعتزل؛ أعد التفاوض.",
  );
  assert(
    Number.isSafeInteger(terms.salary) &&
      terms.salary > 0 &&
      Number.isSafeInteger(terms.bonus) &&
      terms.bonus >= 0 &&
      [1, 2, 3, 4].includes(terms.years),
    "شروط العقد غير صالحة.",
  );
  assert(
    terms.salary >= Math.round(p.salary * 0.95 * difficulty(s).wage),
    "اللاعب يرفض المرتب. جرّب الاقتراب من طلبه الموضّح.",
  );
  assert(
    reservedSquadSize(s) < (s.squadLimit || 30),
    "قائمة الفريق ممتلئة؛ راجع الحد الموضح في شاشة الفريق.",
  );
  assert(
    wages(s) + terms.salary <= s.finance.wageBudget,
    "تجاوز ميزانية المرتبات الشهرية.",
  );
  const clauses = normalizeClauses(terms);
  const commissionRate = s.blackFiles?.active?.agentOnPayroll ? 0.01 : 0.03;
  let upfront = Math.round((n.fee * n.upfrontPercent) / 100);
  let agent = Math.round(n.fee * commissionRate);
  let total = upfront + agent + terms.bonus;
  let rest = n.fee - upfront;
  if (n.kind === "release-clause") {
    upfront = n.fee;
    agent = Math.round(n.fee * commissionRate);
    total = upfront + agent + terms.bonus;
    rest = 0;
  }
  assert(
    s.finance.cash >= total,
    "السيولة لا تكفي للمقدم ومكافأة التوقيع وعمولة الوكيل.",
  );
  n.seller = n.seller || p.clubId;
  if (Object.hasOwn(s.expansion?.budgets || {}, n.seller))
    s.expansion.budgets[n.seller] += upfront;
  post(s, -upfront, "transfer", n.kind === "release-clause" ? `كسر شرط جزائي ${p.name}` : `مقدم شراء ${p.name}`, n.id + "-fee");
  post(s, -agent, "agent", `عمولة وكيل ${p.name}`, n.id + "-agent");
  post(s, -terms.bonus, "signing", `مكافأة توقيع ${p.name}`, n.id + "-bonus");
  if (n.kind === "release-clause") n.clausePaid = true;
  const each = Math.floor(rest / 3);
  if (rest)
    for (let i = 1; i <= 3; i++)
      obligation(s, {
        amount: i === 3 ? rest - each * 2 : each,
        due: addDays(s.date, i * 30),
        category: "transfer",
        description: `قسط شراء ${p.name}`,
        key: n.id + "-installment-" + i,
        ref: n.id,
      });
  assert(p.status !== "retired", "اللاعب اعتزل ولا يمكن تسجيله.");
  p.careerHistory.push({
    date: s.date,
    type: "transfer-in",
    clubId: s.clubId,
    from: n.seller,
    fee: n.fee,
  });
  p.clubId = s.clubId;
  p.salary = terms.salary;
  p.role = terms.role;
  p.contractEnd = addDays(s.date, 365 * terms.years);
  p.morale = 85;
  p.contractTerms = {
    ...clauses,
    signedOn: s.date,
    lastRaiseYear: s.date.slice(0, 4),
    reviewDate: addDays(s.date, 60),
    reviewed: false,
    appearancesAtSigning: p.appearances,
  };
  n.stage = "signed";
  n.signed = s.date;
  n.total =
    total +
    rest +
    guaranteedWages(terms.salary, terms.years, clauses.annualRaisePct);
  closeThread(s, id);
  message(s, {
    title: `${p.name} ينضم إلى النادي`,
    body: "تم التوقيع والتسجيل وفق قواعد القائمة التجريبية. الفحص الطبي في هذه النسخة مبسّط ونتيجته سليمة؛ النظام الطبي التفصيلي لاحقًا.",
    category: "transfers",
  });
}
export function renewPlayer(s, playerId, terms) {
  const p = s.players.find((x) => x.id === playerId);
  assert(!p?.loan, "عقد اللاعب المُعار يخص ناديه الأصلي.");
  assert(p && p.clubId === s.clubId, "اللاعب ليس في النادي.");
  assert(
    Number.isSafeInteger(terms.salary) &&
      Number.isSafeInteger(terms.bonus) &&
      terms.bonus >= 0 &&
      [1, 2, 3, 4].includes(terms.years),
    "شروط غير صالحة.",
  );
  assert(terms.salary >= p.salary, "اللاعب يطلب الحفاظ على مرتبه على الأقل.");
  assert(s.finance.cash >= terms.bonus, "السيولة غير كافية.");
  assert(
    wages(s) - p.salary + terms.salary <= s.finance.wageBudget,
    "تجاوز ميزانية المرتبات.",
  );
  const clauses = normalizeClauses(terms);
  post(s, -terms.bonus, "signing", `مكافأة تجديد ${p.name}`, uid(s, "renew"));
  p.contractTerms = {
    ...clauses,
    signedOn: s.date,
    lastRaiseYear: s.date.slice(0, 4),
    reviewDate: addDays(s.date, 60),
    reviewed: false,
    appearancesAtSigning: p.appearances,
  };
  p.salary = terms.salary;
  p.role = terms.role;
  p.contractEnd = addDays(s.date, 365 * terms.years);
  p.morale = Math.min(100, p.morale + 8);
  for (const m of s.inbox.filter(
    (m) => m.kind === "renewal" && m.ref === p.id,
  )) {
    m.status = "resolved";
    m.read = true;
  }
  message(s, {
    title: `تجديد عقد ${p.name}`,
    body: "تم تحديث العقد والمرتب والدور داخل الفريق.",
    category: "transfers",
  });
}
