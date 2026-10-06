import {
  assert,
  uid,
  addDays,
  daysBetween,
  random,
  clamp,
} from "../core/utils.js";
import { post, wages } from "./finance.js";
import { message, closeThread } from "./inbox.js";
import { marketOpen, assertMarket, teamPower } from "./market.js";
import { reservedSquadSize } from "./employment.js";
import { allFixtures } from "./calendar.js";
import { extendedClub } from "../data/expandedCatalog.js";
const active = (p) => p.status !== "retired";
const known = (s, id) =>
  s.expansion?.divisions.some((d) => d.clubs.includes(id));
const count = (s, id) =>
  s.players.filter((p) => active(p) && p.clubId === id).length;
const n = (v) => Number.isSafeInteger(v) && v >= 0 && v <= 10000000000;
export function normalizeLoanTerms(t) {
  const terms = {
    days: Number(t.days),
    fee: Number(t.fee),
    wageShare: Number(t.wageShare),
    buyOption: Number(t.buyOption || 0),
    recallAllowed: !!t.recallAllowed,
    role: t.role,
  };
  assert(
    [90, 180, 365].includes(terms.days) &&
      n(terms.fee) &&
      n(terms.wageShare) &&
      terms.wageShare <= 100 &&
      n(terms.buyOption) &&
      ["rotation", "starter"].includes(terms.role),
    "شروط الإعارة غير سليمة.",
  );
  return terms;
}
export function loanDestinations(s, p) {
  const groups = new Map();
  for (const player of s.players) {
    if (!active(player)) continue;
    if (!groups.has(player.clubId)) groups.set(player.clubId, []);
    groups.get(player.clubId).push(player.rating);
  }
  const country = extendedClub(s.clubId)?.country;
  return s.expansion.divisions
    .flatMap((d) => d.clubs)
    .map((id) => {
      const ratings = (groups.get(id) || []).sort((a, b) => b - a);
      const power = ratings.length
        ? ratings.slice(0, 11).reduce((n, v) => n + v, 0) /
          Math.min(11, ratings.length)
        : 60;
      return {
        id,
        power,
        size: ratings.length,
        local: extendedClub(id)?.country === country,
      };
    })
    .filter(
      (c) =>
        c.id !== s.clubId &&
        c.size < 45 &&
        p.rating >= c.power - 12 &&
        p.rating <= c.power + 25,
    )
    .sort(
      (a, b) =>
        Number(b.local) - Number(a.local) ||
        Math.abs(p.rating - a.power) - Math.abs(p.rating - b.power) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 150)
    .map((c) => c.id);
}
export function requestLoan(s, playerId, t) {
  assert(s.management && s.expansion, "الإعارات الموسعة تحتاج عالمًا موسعًا.");
  const p = s.players.find((x) => x.id === playerId);
  assert(
    p && active(p) && !p.loan && known(s, p.clubId),
    "اللاعب غير متاح للإعارة.",
  );
  assertMarket(s, p);
  assert(
    s.management.loanOffers.filter((o) =>
      ["waiting", "countered"].includes(o.status),
    ).length < 20,
    "أكمل العروض المعلقة أولًا.",
  );
  const terms = normalizeLoanTerms(t),
    out = p.clubId === s.clubId,
    parent = p.clubId,
    borrower = out ? t.borrower : s.clubId;
  assert(
    known(s, borrower) && borrower !== parent,
    "اختر ناديًا مستعيرًا متاحًا.",
  );
  assert(
    p.contractEnd > addDays(s.date, terms.days),
    "عقد اللاعب يجب أن يستمر لما بعد نهاية الإعارة.",
  );
  assert(
    !s.management.loanOffers.some(
      (o) =>
        o.playerId === playerId && ["waiting", "countered"].includes(o.status),
    ) &&
      !s.negotiations.some(
        (o) =>
          o.playerId === playerId &&
          ["waiting", "club-reply", "personal"].includes(o.stage),
      ),
    "يوجد تفاوض قائم مع هذا اللاعب.",
  );
  const o = {
    id: uid(s, "loan-offer"),
    playerId,
    parent,
    borrower,
    direction: out ? "out" : "in",
    date: s.date,
    replyDate: addDays(s.date, 1),
    expires: addDays(s.date, 8),
    status: "waiting",
    proposed: terms,
  };
  s.management.loanOffers.push(o);
  s.management.loanOffers = s.management.loanOffers.filter(
    (o) =>
      ["waiting", "countered"].includes(o.status) ||
      s.players.some((p) => p.loan?.id === o.id) ||
      s.management.loanOffers.indexOf(o) >= s.management.loanOffers.length - 80,
  );
  message(s, {
    title: "أُرسل عرض إعارة " + p.name,
    body: "الرد في اليوم التالي. لم تخصم رسوم، ولم ينتقل اللاعب. شروط الرد تحتاج موافقتك.",
    category: "transfers",
    ref: o.id,
  });
  return o;
}
function respond(s, o) {
  const p = s.players.find((p) => p.id === o.playerId);
  if (!p || !active(p) || p.loan || p.clubId !== o.parent || !marketOpen(s)) {
    o.status = "rejected";
    o.reason = "تغيرت إتاحة اللاعب أو أُغلق السوق.";
    return;
  }
  const t = { ...o.proposed },
    borrowerPower = teamPower(s, o.borrower),
    parentPower = teamPower(s, o.parent);
  if (
    p.rating < borrowerPower - 12 ||
    p.rating > borrowerPower + 25 ||
    count(s, o.parent) <= 16 ||
    count(s, o.borrower) >= 45
  ) {
    o.status = "rejected";
    o.reason = "رفض فني أو قائمة غير كافية لدى أحد الناديين.";
  } else {
    const factor = t.days / 180;
    if (o.direction === "in") {
      t.fee = Math.max(
        t.fee,
        Math.round(
          Math.max(
            20000,
            p.value * (p.rating >= parentPower ? 0.12 : 0.04) * factor,
          ),
        ),
      );
      t.wageShare = Math.max(t.wageShare, p.rating >= parentPower ? 80 : 50);
      if (t.buyOption)
        t.buyOption = Math.max(t.buyOption, Math.round(p.value * 1.15));
    } else {
      t.fee = Math.min(
        t.fee,
        Math.round(Math.max(20000, p.value * 0.07 * factor)),
        s.expansion.budgets[o.borrower],
      );
      t.wageShare = Math.min(
        t.wageShare,
        clamp(Math.round(70 + (p.rating - borrowerPower) * 2), 30, 100),
      );
      if (t.buyOption)
        t.buyOption = Math.min(t.buyOption, Math.round(p.value * 1.15));
    }
    o.counter = t;
    o.status = "countered";
    o.expires = addDays(s.date, 7);
    message(s, {
      title: "رد الإعارة: " + p.name,
      body: `رسوم ${t.fee} ج.م · المستعير يدفع ${t.wageShare}٪ من الراتب · ${t.days} يومًا. راجع التفاصيل قبل الموافقة، وخيار الشراء يلزم المالك إذا فعّله المستعير.`,
      category: "transfers",
      required: true,
      kind: "loan-offer",
      ref: o.id,
      deadline: o.expires,
    });
  }
  if (o.status === "rejected")
    message(s, {
      title: "رفض عرض إعارة " + p.name,
      body: o.reason,
      category: "transfers",
    });
}
export function answerLoan(s, id, accept) {
  const o = s.management.loanOffers.find((x) => x.id === id);
  assert(o && ["waiting", "countered"].includes(o.status), "العرض انتهى.");
  if (!accept) {
    o.status = "rejected";
    closeThread(s, id);
    return;
  }
  assert(
    o.status === "countered" && o.expires >= s.date,
    "انتظر الرد أو أعد تقديم عرض منتهي.",
  );
  const p = s.players.find((x) => x.id === o.playerId),
    t = o.counter;
  assert(
    p && active(p) && !p.loan && p.clubId === o.parent,
    "تغيرت إتاحة اللاعب.",
  );
  assertMarket(s, p);
  assert(
    p.contractEnd > addDays(s.date, t.days),
    "لم تعد مدة العقد تكفي للإعارة.",
  );
  assert(
    count(s, o.parent) > 16 && count(s, o.borrower) < 45,
    "أحد الناديين لا يستوفي حد القائمة.",
  );
  assert(
    s.players.filter(
      (p) =>
        p.loan?.version === 2 &&
        (o.direction === "in"
          ? p.loan.borrower === s.clubId
          : p.loan.parent === s.clubId),
    ).length < 5,
    "الحد خمس إعارات نشطة في كل اتجاه.",
  );
  const share = Math.round((p.salary * t.wageShare) / 100);
  if (o.direction === "in") {
    assert(
      reservedSquadSize(s) < s.squadLimit,
      "احتفظ بمساحة لعودة المعارين؛ القائمة مكتملة.",
    );
    assert(s.finance.cash >= t.fee, "السيولة لا تكفي رسوم الإعارة.");
    assert(wages(s) + share <= s.finance.wageBudget, "تجاوز ميزانية المرتبات.");
  } else
    assert(
      s.expansion.budgets[o.borrower] >= t.fee,
      "ميزانية المستعير لا تكفي.",
    );
  if (o.direction === "in") {
    post(s, -t.fee, "loan-fee", "رسوم استعارة " + p.name, o.id + "-fee");
    s.expansion.budgets[o.parent] += t.fee;
  } else {
    s.expansion.budgets[o.borrower] -= t.fee;
    post(s, t.fee, "loan-income", "رسوم إعارة " + p.name, o.id + "-fee");
  }
  p.loan = {
    version: 2,
    id: o.id,
    parent: o.parent,
    borrower: o.borrower,
    starts: s.date,
    until: addDays(s.date, t.days),
    ...t,
    appearancesAtStart: p.appearances,
    lastReview: s.date,
    reviewAppearances: p.appearances,
    developmentAppearances: p.appearances,
  };
  p.clubId = o.borrower;
  p.careerHistory.push({
    date: s.date,
    type: "loan-start",
    clubId: o.borrower,
    parent: o.parent,
  });
  s.management.lineup = s.management.lineup.filter((id) => id !== p.id);
  o.status = "accepted";
  o.accepted = s.date;
  closeThread(s, id);
  message(s, {
    title: "بدأت إعارة " + p.name,
    body: "نسبة الراتب على المستعير؛ مكافآت المباريات عليه أيضًا. الرسوم غير مستردة. خيار الشراء ينقل العقد الحالي دون تمديده. العودة تتم تلقائيًا ولا تعيد توليد اللاعب.",
    category: "transfers",
  });
}
function returnLoan(s, p, reason) {
  const l = p.loan;
  p.clubId = !active(p)
    ? "retired"
    : p.contractEnd < s.date
      ? "لاعب حر"
      : l.parent;
  p.loan = null;
  s.management.lineup = s.management.lineup.filter((id) => id !== p.id);
  p.careerHistory.push({
    date: s.date,
    type: "loan-return",
    clubId: l.parent,
    reason,
  });
  message(s, {
    title: "عودة من الإعارة: " + p.name,
    body:
      reason +
      " الرسوم المدفوعة لا تُرد، وعقد اللاعب الأصلي مستمر ما لم ينتهِ.",
    category: "transfers",
  });
}
export function recallLoan(s, id) {
  const p = s.players.find((p) => p.id === id),
    l = p?.loan;
  assert(
    l?.version === 2 &&
      l.parent === s.clubId &&
      l.recallAllowed &&
      daysBetween(l.starts, s.date) >= 60,
    "الاستدعاء للمالك فقط إذا اتُّفق عليه وبعد 60 يومًا.",
  );
  returnLoan(s, p, "استدعاء مبكر وفق الشرط المتفق عليه.");
}
function purchaseOption(s, p, byAI = false) {
  const l = p.loan;
  assert(
    l?.version === 2 && l.buyOption > 0 && s.date < l.until && active(p),
    "خيار الشراء غير متاح.",
  );
  assert(
    byAI ? l.parent === s.clubId : l.borrower === s.clubId,
    "المستعير وحده يقرر تفعيل الخيار.",
  );
  if (!byAI) {
    assert(s.finance.cash >= l.buyOption, "السيولة لا تكفي.");
    assert(
      wages(s) - Math.round((p.salary * l.wageShare) / 100) + p.salary <=
        s.finance.wageBudget,
      "الراتب الكامل يتجاوز الميزانية.",
    );
    post(s, -l.buyOption, "transfer", "تفعيل شراء " + p.name, l.id + "-option");
    s.expansion.budgets[l.parent] += l.buyOption;
  } else {
    assert(
      s.expansion.budgets[l.borrower] >= l.buyOption,
      "سيولة المستعير لا تكفي.",
    );
    s.expansion.budgets[l.borrower] -= l.buyOption;
    post(
      s,
      l.buyOption,
      "player-sale",
      "المستعير فعّل شراء " + p.name,
      l.id + "-option",
    );
  }
  p.loan = null;
  p.careerHistory.push({ date: s.date, type: "loan-option", clubId: p.clubId });
  message(s, {
    title: "انتقال نهائي: " + p.name,
    body: "فُعّل خيار الشراء المتفق عليه. العقد الحالي والراتب مستمران دون تمديد تلقائي؛ لم تُحصّل رسوم الإعارة مرة ثانية.",
    category: "transfers",
  });
}
export const buyLoanOption = (s, id) =>
  purchaseOption(
    s,
    s.players.find((p) => p.id === id),
  );
export function loanDayStart(s) {
  if (!s.management) return;
  for (const o of s.management.loanOffers || []) {
    if (["waiting", "countered"].includes(o.status) && o.expires < s.date) {
      o.status = "expired";
      closeThread(s, o.id);
    } else if (o.status === "waiting" && o.replyDate <= s.date) respond(s, o);
  }
  for (const p of s.players) {
    const l = p.loan;
    if (l?.version !== 2) continue;
    if (!active(p) || p.contractEnd < s.date || l.until <= s.date) {
      returnLoan(
        s,
        p,
        !active(p)
          ? "اعتزال اللاعب."
          : p.contractEnd < s.date
            ? "انتهى العقد."
            : "انتهت المدة.",
      );
      continue;
    }
    if (l.parent === s.clubId) p.fitness = clamp(p.fitness + 2, 0, 100);
    if (s.date.endsWith("-01") && l.lastPayroll !== s.date) {
      const share = Math.round((p.salary * l.wageShare) / 100),
        counterparty = l.parent === s.clubId ? l.borrower : l.parent,
        cost = l.parent === s.clubId ? share : p.salary - share;
      if (s.expansion.budgets[counterparty] < cost) {
        returnLoan(s, p, "النادي الآخر لم يعد قادرًا على تحمل حصته من الراتب.");
        continue;
      }
      s.expansion.budgets[counterparty] -= cost;
      l.lastPayroll = s.date;
    }
    if (
      l.parent === s.clubId &&
      l.buyOption &&
      daysBetween(s.date, l.until) <= 14 &&
      p.appearances - l.appearancesAtStart >= 6 &&
      l.buyOption <= p.value * 1.2 &&
      s.expansion.budgets[l.borrower] >= l.buyOption &&
      p.rating >= teamPower(s, l.borrower) - 3
    ) {
      purchaseOption(s, p, true);
      continue;
    }
    if (daysBetween(l.lastReview, s.date) >= 60) {
      const appearances = p.appearances - l.reviewAppearances;
      l.lastReview = s.date;
      l.reviewAppearances = p.appearances;
      if (l.role === "starter" && appearances < 3) {
        p.morale = clamp(p.morale - 5, 0, 100);
        if (l.borrower === s.clubId && l.recallAllowed) {
          returnLoan(
            s,
            p,
            "النادي الأصلي استدعى اللاعب بسبب قلة المشاركات الموعودة.",
          );
          continue;
        }
        message(s, {
          title: "مراجعة إعارة " + p.name,
          body: "المشاركة أقل من وعد الأساسي. انخفضت المعنويات؛ راجع التشكيل أو استدعِ اللاعب إذا كان الشرط يسمح.",
          category: "transfers",
        });
      }
    }
  }
}
export function loanDayEnd(s, fixtures = allFixtures(s)) {
  if (!s.management) return;
  const loans = s.players.filter(
    (p) => p.loan?.version === 2 && p.loan.parent === s.clubId,
  );
  if (!loans.length) return;
  const played = fixtures.filter((f) => f.played && f.date === s.date);
  for (const p of loans) {
    const l = p.loan,
      f = played.find((f) => [f.home, f.away].includes(l.borrower));
    if (
      f &&
      l.lastAppearanceDate !== s.date &&
      (!p.injuryUntil || p.injuryUntil < s.date) &&
      (!p.internationalUntil || p.internationalUntil <= s.date)
    ) {
      l.lastAppearanceDate = s.date;
      const chance = clamp(
        (l.role === "starter" ? 0.82 : 0.55) +
          (p.rating - teamPower(s, l.borrower)) * 0.015,
        0.2,
        0.95,
      );
      if (random(s) < chance) {
        p.appearances++;
        p.fitness = Math.max(45, p.fitness - 10);
        const goals =
          (f.home === l.borrower ? f.homeGoals : f.awayGoals) -
          (f.loanGoalCounts?.[l.borrower] || 0);
        const scored = goals && random(s) < (p.position === "ST" ? 0.25 : 0.08);
        if (scored) {
          p.goals++;
          f.loanGoalCounts ??= {};
          f.loanGoalCounts[l.borrower] =
            (f.loanGoalCounts[l.borrower] || 0) + 1;
        }
        const bonus =
          (p.contractTerms?.appearanceBonus || 0) +
          (scored ? p.contractTerms?.goalBonus || 0 : 0);
        s.expansion.budgets[l.borrower] = Math.max(
          0,
          s.expansion.budgets[l.borrower] - bonus,
        );
      }
    }
    if (s.date.endsWith("-01") && l.lastDevelopment !== s.date) {
      l.lastDevelopment = s.date;
      const matches = p.appearances - l.developmentAppearances;
      l.developmentAppearances = p.appearances;
      if (
        p.age < 25 &&
        matches >= 2 &&
        p.rating < p.potential &&
        random(s) < 0.45
      ) {
        const gain = Math.min(0.25, p.potential - p.rating);
        p.rating += gain;
        for (const k of Object.keys(p.attributes))
          p.attributes[k] = Math.min(99, p.attributes[k] + gain);
      }
    }
  }
}
