// تنفيذ آثار قرارات «حياة الملياردير» 0.29 — المفاتيح العامة (شخصية/برستيج/
// شهرة/سعادة الزوجة) + الميكانيكات الخاصة لكل حدث.
import { clamp, random } from "../../core/utils.js";
import { addSuspicion, reduceSuspicion } from "../blackFiles.js";
import { message } from "../inbox.js";
import { empireText } from "../../data/empireTexts.js";

function payPersonal(s, amount) {
  const e = s.empire;
  if (!e) return 0;
  if (amount >= 0) {
    e.personal += amount;
    e.monthTrack.income += amount;
    return amount;
  }
  const paid = Math.min(-amount, e.personal);
  e.personal -= paid;
  e.monthTrack.expenses += paid;
  return -paid;
}

function firstKid(s, minYears) {
  const kids = s.empire?.family?.children || [];
  return (
    kids.find((c) => {
      const years = (Date.parse(s.date) - Date.parse(c.born)) / 31557600000;
      return years >= minYears;
    }) || kids[kids.length - 1] || null
  );
}

// المفاتيح العامة: تنفذ لأي حدث قرار يحملها.
export function applyEmpireGeneral(s, c) {
  if (!s.empire) return;
  const e = s.empire;
  if (c.personal) payPersonal(s, c.personal);
  if (c.prestige) e.prestige = clamp(e.prestige + c.prestige, 0, 400);
  if (c.fame) e.fame = clamp(e.fame + c.fame, 0, 100);
  if (c.wifeHappy && e.family?.wife)
    e.family.wife.happiness = clamp(e.family.wife.happiness + c.wifeHappy, 0, 100);
}

// الميكانيكات الخاصة بأحداث محددة، حسب معرف الحدث والخيار.
export function applyEmpireSpecial(s, eventId, choiceId) {
  const e = s.empire;
  if (!e) return;
  const year = Number(s.date.slice(0, 4));
  switch (eventId + "/" + choiceId) {
    case "empire-currency-crash/sell-now":
      e.portfolio.coin = Math.round(e.portfolio.coin * 0.8);
      break;
    case "empire-currency-crash/hold-tight":
      e.portfolio.coin = Math.round(e.portfolio.coin * 0.55);
      break;
    case "empire-currency-crash/diversify":
      e.portfolio.deposit += e.portfolio.coin;
      e.portfolio.coin = 0;
      break;
    case "empire-cousin-lawsuit/fight-court": {
      const r = random(s);
      if (r < 0.55) {
        e.prestige = clamp(e.prestige + 5, 0, 400);
        message(s, {
          title: empireText("courtWinTitle"),
          body: empireText("courtWinBody"),
          category: "events",
        });
      } else {
        const loss = Math.min(12_000_000, e.personal);
        e.personal -= loss;
        e.monthTrack.expenses += loss;
        e.fame = clamp(e.fame - 2, 0, 100);
        message(s, {
          title: empireText("courtLostTitle"),
          body: empireText("courtLostBody"),
          category: "events",
        });
      }
      break;
    }
    case "empire-forgot-anniversary/grand-apology":
    case "empire-forgot-anniversary/flowers-dinner":
      if (e.family?.wife) e.family.wife.giftYear = year;
      break;
    case "empire-child-school-call/attend-meeting": {
      const kid = firstKid(s, 13);
      if (kid) kid.discipline = clamp(kid.discipline + 10, 0, 100);
      break;
    }
    case "empire-child-school-call/pay-tutor": {
      const kid = firstKid(s, 13);
      if (kid) kid.talent = clamp(kid.talent + 8, 0, 100);
      break;
    }
    case "empire-child-school-call/strict-rules": {
      const kid = firstKid(s, 13);
      if (kid) {
        kid.discipline = clamp(kid.discipline + 12, 0, 100);
        kid.ambition = clamp(kid.ambition - 6, 0, 100);
      }
      break;
    }
    case "empire-child-talent-show/sponsor-show":
    case "empire-child-talent-show/just-attend":
    case "empire-child-talent-show/skip-show": {
      const kid = firstKid(s, 3);
      if (kid) {
        if (choiceId === "sponsor-show") kid.talent = clamp(kid.talent + 10, 0, 100);
        if (choiceId === "just-attend") kid.ambition = clamp(kid.ambition + 8, 0, 100);
        if (choiceId === "skip-show") kid.ambition = clamp(kid.ambition - 8, 0, 100);
      }
      break;
    }
    case "empire-debt-collector/pay-debt-now":
      e.debt = Math.max(0, e.debt - 5_000_000);
      break;
    case "empire-debt-collector/negotiate-debt":
      e.debt = Math.max(0, e.debt - 2_000_000);
      e.fame = clamp(e.fame - 2, 0, 100);
      break;
    case "empire-debt-collector/deny-debt":
      addSuspicion(s, 8);
      break;
    case "empire-angel-offer/angel-invest":
      e.portfolio.startup += 5_000_000;
      break;
    case "empire-crypto-tip/invest-tip":
      e.portfolio.coin += 2_000_000;
      addSuspicion(s, 4);
      break;
    case "empire-crypto-tip/report-tip":
      reduceSuspicion(s, 5);
      break;
    case "empire-art-forgery/burn-spectacle": {
      const idx = e.assets.findIndex(
        (a) => a.assetId === "art-painting" || a.assetId === "art-collection",
      );
      if (idx >= 0) e.assets.splice(idx, 1);
      break;
    }
    case "empire-tax-audit/full-coop":
      reduceSuspicion(s, 8);
      break;
    case "empire-tax-audit/aggressive-lawyers":
      addSuspicion(s, 6);
      break;
    case "empire-tax-audit/negotiate-deal":
      reduceSuspicion(s, 2);
      break;
    case "empire-charity-gala/host-gala":
      reduceSuspicion(s, 10);
      break;
    case "empire-lion-escape/cover-up":
      addSuspicion(s, 8);
      break;
    case "empire-security-threat/dismiss-threat":
      addSuspicion(s, 3);
      break;
    case "empire-movie-offer/accept-full":
      addSuspicion(s, 4);
      break;
    case "empire-yacht-regatta/enter-race":
    case "empire-yacht-regatta/host-afterparty": {
      const yacht = e.assets
        .map((a) => a.assetId)
        .find((id) => id.startsWith("yacht-"));
      const bonus = yacht === "yacht-mega" ? 8 : yacht === "yacht-60" ? 5 : 3;
      e.prestige = clamp(e.prestige + bonus, 0, 400);
      break;
    }
    case "empire-gold-steak-banquet/own-banquet":
      reduceSuspicion(s, 4);
      break;
    case "empire-school-visit/visit-donate":
      reduceSuspicion(s, 3);
      break;
    case "empire-island-visitors/donate-nature":
      reduceSuspicion(s, 5);
      break;
    default:
      break;
  }
}
