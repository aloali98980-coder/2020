import { academyDay } from "./talent/academy.js";
import { scoutingDay } from "./talent/scouting.js";
import { worldTalentDay } from "./talent/world.js";
import { cleanTraining } from "./talent/training.js";
import { loanDayStart, loanDayEnd } from "./loans.js";
import { ownFixtures, allFixtures } from "./calendar.js";
import { pyramidDay } from "./pyramid.js";
import { commerceDay } from "./commerce.js";
import { managementDay } from "./clubManagement.js";
import { legendDay } from "./legends.js";
import { aiTransferDay } from "./market.js";
import { internationalDay } from "./internationals.js";
import { contractDay } from "./contractClauses.js";
import { agingDay, retirementDay } from "./careers.js";
import { staffDay } from "./staff.js";
import { clubEventDay } from "./clubEvents.js";
import { seasonDay } from "./season.js";
import { addDays } from "../core/utils.js";
import { message, pendingActions } from "./inbox.js";
import { financeDay } from "./finance.js";
import { facilityDay } from "./facilities.js";
import { sponsorDay } from "./sponsors.js";
import { transferReply } from "./transfers.js";
import { matchDay } from "./matches.js";
import { developmentDay } from "./development.js";
import { academyJourneyDay, dynastyGrowthDay } from "./dynasty.js";
import { dynastyEventDay } from "./dynastyEvents.js";
import { siblingConflictDay } from "./dynastyCareers.js";
import { dynastyLifeDay } from "./dynasty.js";
function eventsDay(s) {
  for (const e of s.events) {
    if (e.done || e.date > s.date) continue;
    e.done = true;
    if (e.type === "transfer-reply") transferReply(s, e.ref);
    if (
      e.type === "sponsor" &&
      !s.sponsors.some((c) => c.assetId === e.ref && c.status === "active")
    )
      message(s, {
        title: "فرصة رعاية على كم القميص",
        body: "وصلت عروض من شركات مصرية تجريبية. راجع القيمة والحصرية وجدول الدفع، أو ارفض الفرصة. تقدم الوقت متوقف حتى قرارك.",
        category: "sponsors",
        required: true,
        kind: "sponsor",
        ref: e.ref,
        deadline: addDays(s.date, 3),
        priority: "high",
      });
    if (e.type === "renewal") {
      const p = s.players.find((p) => p.id === e.ref);
      if (p && p.clubId === s.clubId && p.contractEnd < addDays(s.date, 40)) {
        p.renewalWarningEnd = p.contractEnd;
        message(s, {
          title: `عقد ${p.name} يقترب من النهاية`,
          body: "اللاعب يحتاج قرارًا: افتح شروط التجديد أو قرّر السماح بانتهاء العقد. التجديد ليس تلقائيًا.",
          category: "transfers",
          required: true,
          kind: "renewal",
          ref: p.id,
          deadline: p.contractEnd,
          priority: "high",
        });
      }
    }
  }
}
export function advanceTime(s, days = null) {
  const target = days ?? s.remainingDays ?? 1;
  if (!Number.isInteger(target) || target < 1 || target > 30)
    return { advanced: 0, blocked: false };
  if (pendingActions(s).length) {
    if (!s.remainingDays) s.remainingDays = target;
    return { advanced: 0, blocked: true };
  }
  s.remainingDays = target;
  let advanced = 0;
  while (s.remainingDays > 0) {
    s.date = addDays(s.date, 1);
    s.remainingDays--;
    advanced++;
    agingDay(s);
    dynastyGrowthDay(s);
    siblingConflictDay(s);
    academyJourneyDay(s);
    dynastyEventDay(s);
    dynastyLifeDay(s);
    retirementDay(s);
    staffDay(s);
    if (!s.expansion) seasonDay(s);
    internationalDay(s);
    contractDay(s);
    loanDayStart(s);
    worldTalentDay(s);
    academyDay(s);
    scoutingDay(s);
    cleanTraining(s);
    financeDay(s);
    facilityDay(s);
    sponsorDay(s);
    developmentDay(s);
    matchDay(s);
    const loanFixtures = s.players.some(
      (p) => p.loan?.version === 2 && p.loan.parent === s.clubId,
    )
      ? allFixtures(s).filter((f) => f.date === s.date)
      : [];
    pyramidDay(s);
    loanDayEnd(s, loanFixtures);
    commerceDay(s);
    managementDay(s);
    legendDay(s);
    aiTransferDay(s);
    eventsDay(s);
    clubEventDay(s);
    if (pendingActions(s).length) return { advanced, blocked: true };
    if (
      s.preferences.pauseMatches &&
      ownFixtures(s).some(
        (f) =>
          f.played &&
          f.date === s.date &&
          (f.home === s.clubId || f.away === s.clubId),
      )
    )
      return { advanced, blocked: false, match: true };
  }
  return { advanced, blocked: false };
}
