import { ownFixtures } from "./calendar.js";
import { assert, addDays } from "../core/utils.js";
import { difficulty } from "../models/difficulty.js";
import { message } from "./inbox.js";
export function normalizeClauses(t) {
  const c = {
    appearanceBonus: Number(t.appearanceBonus || 0),
    goalBonus: Number(t.goalBonus || 0),
    annualRaisePct: Number(t.annualRaisePct || 0),
    releaseClause: Number(t.releaseClause || 0),
  };
  for (const [k, v] of Object.entries(c))
    assert(Number.isSafeInteger(v) && v >= 0, "شروط إضافية غير صالحة.");
  assert(
    c.annualRaisePct <= 15 &&
      c.appearanceBonus <= 500000 &&
      c.goalBonus <= 1000000,
    "المكافآت أو الزيادة خارج حدود النسخة.",
  );
  return c;
}
export function guaranteedWages(salary, years, raisePct) {
  let total = 0,
    current = salary;
  for (let i = 0; i < years; i++) {
    total += current * 12;
    current = Math.round(current * (1 + raisePct / 100));
  }
  return total;
}
export function contractDay(s) {
  for (const p of s.players.filter(
    (p) =>
      p.status !== "retired" &&
      (p.clubId === s.clubId || p.loan?.parent === s.clubId),
  )) {
    const c = p.contractTerms;
    if (!c) continue;
    if (
      c.annualRaisePct &&
      s.date.slice(5) === c.signedOn.slice(5) &&
      s.date > c.signedOn &&
      c.lastRaiseYear !== s.date.slice(0, 4)
    ) {
      p.salary = Math.round(p.salary * (1 + c.annualRaisePct / 100));
      c.lastRaiseYear = s.date.slice(0, 4);
      message(s, {
        title: `زيادة تعاقدية: ${p.name}`,
        body: "تم تطبيق الزيادة السنوية المتفق عليها. المرتب الجديد ينعكس على كشف الرواتب؛ الزيادة التعاقدية قد تتجاوز الميزانية المعتمدة.",
        category: "transfers",
      });
    }
    if (
      !p.loan &&
      p.role === "أساسي" &&
      c.reviewDate &&
      s.date >= c.reviewDate &&
      !c.reviewed
    ) {
      c.reviewed = true;
      const played = p.appearances - (c.appearancesAtSigning || 0);
      const teamMatches = ownFixtures(s).filter(
        (f) =>
          f.played &&
          f.date >= c.signedOn &&
          (f.home === s.clubId || f.away === s.clubId),
      ).length;
      if (teamMatches >= 4 && played / teamMatches < 0.6) {
        p.morale = Math.max(0, p.morale - 12);
        message(s, {
          title: `مراجعة وعد المشاركة: ${p.name}`,
          body: "اللاعب شارك في أقل من ٦٠٪ من مباريات فترة المراجعة رغم وعد الأساسي. انخفضت المعنويات ١٢ نقطة. راجع ترتيب فريقك أو تفاوض على دور مناسب.",
          category: "transfers",
        });
      }
    }
  }
}
export function activateReleaseClause(s, p) {
  return p.contractTerms?.releaseClause > 0
    ? p.contractTerms.releaseClause
    : null;
}
