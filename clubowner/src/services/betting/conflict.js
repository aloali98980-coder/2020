// تضارب المصالح 0.36 — رئيس الاتحاد وتنظيم صناعة شركتك + رعاية الدوري + احتجاجات + بند أخلاقي.
import { clamp, random } from "../../core/utils.js";
import { message } from "../inbox.js";
import { ensureBetting } from "./state.js";
import { ensureBoard } from "../boardMandate.js";
import { ensurePolitics } from "../politics/state.js";

export function conflictScore(s) {
  const b = s.betting;
  if (!b?.owned) return 0;
  let score = 0;
  if (b.licenseTier === "global") score += 22;
  else if (b.licenseTier === "continental") score += 14;
  else score += 8;
  if (b.sponsorLeague) score += 25;
  if (s.politics?.office?.held) score += 30;
  if (b.customers > 150_000) score += 10;
  if ((s.blackFiles?.suspicion || 0) > 45) score += 8;
  if (b.compliance?.responsibleLevel === 0) score += 6;
  return clamp(score, 0, 100);
}

export function sponsorLeagueToggle(s, enable) {
  const b = ensureBetting(s);
  if (!b.owned) throw new Error("لا تملك شركة");
  b.sponsorLeague = Boolean(enable);
  if (enable) {
    // ترعى الدوري الذي تحكمه — مكافأة دخل + سمعة لكن تضارب
    b.reputation = clamp(b.reputation + 2, 0, 100);
    if (s.politics?.opposition) s.politics.opposition.pressure = clamp((s.politics.opposition.pressure || 0) + 10, 0, 100);
    message(s, { title: "شركتك ترعى الدوري الذي تحكمه!", body: "عقد رعاية بقيمة 4.2M سنويًا للدوري — المعارضة والصحافة تراقب التضارب.", category: "board" });
  } else {
    message(s, { title: "إلغاء رعاية الدوري", body: "ألغيت رعاية شركتك للدوري لتخفيف تضارب المصالح.", category: "board" });
  }
  return b.sponsorLeague;
}

// تشديد/تخفيف القوانين على المنافسين/نفسك — ربط مع تشريعات 13
export function regulateBettingMarket(s, mode) {
  const b = ensureBetting(s);
  if (!b.owned) throw new Error("لا شركة");
  const pol = ensurePolitics(s);
  if (!pol.office.held) throw new Error("لست رئيس الاتحاد لتنظيم السوق");

  if (mode === "tighten-on-rivals") {
    // تشديد على المنافسين: عملاؤهم -8% وسمعتهم -5، لكن تزيد الشبهات عليك +6
    for (const c of b.competitors) {
      c.customers = Math.max(5_000, Math.round(c.customers * 0.92));
      c.reputation = clamp(c.reputation - 5, 20, 92);
    }
    s.blackFiles.suspicion = clamp(s.blackFiles.suspicion + 6, 0, 100);
    pol.legitimacy = clamp(pol.legitimacy - 4, 0, 100);
    message(s, { title: "شدّدت القوانين على المنافسين!", body: "ضرائب وقيود جديدة على منافسي المراهنات — مكاسبك ارتفعت، لكن المعارضة تلمح لمحاباة.", category: "board" });
  } else if (mode === "loosen-for-self") {
    // تخفيف على نفسك: خفّض تكلفة الامتثال 40% لـ 60 يوم، لكن جمهور متدين يحتج أكثر
    b._loosenUntil = s.date.slice(0, 7); // مبسط: تخفيض لشهرين
    b.compliance._discount = 0.4;
    b.reputation = clamp(b.reputation - 3, 0, 100);
    s.fanSupport = clamp(s.fanSupport - 4, 10, 100);
    message(s, { title: "خفّفت القوانين على شركتك", body: "أعفاءات امتثال لشركتك — وفرت المال لكن الشارع لاحظ.", category: "board" });
  } else {
    throw new Error("وضع تنظيم غير معروف");
  }
  return mode;
}

// احتجاج جماهيري متدين + بند أخلاقي في لائحة النادي (6)
export function bettingConflictDay(s) {
  const b = s.betting;
  if (!b?.owned) return null;
  const score = conflictScore(s);
  const board = ensureBoard(s);

  // بند أخلاقي: إذا كان ضمن لائحة الجمعية (kind: betting-ethics)
  const mandate = board?.mandate;
  const hasEthicsClause = mandate?.items?.some((it) => it.kind === "betting-ethics" || it.kind === "no-betting-conflict");
  if (hasEthicsClause && score > 40) {
    board.confidence = clamp(board.confidence - 0.08, 0, 100); // تآكل يومي طفيف
  }

  // جماهير متدينة تحتج: احتمال شهري
  if (s.date.endsWith("-15") && random(s) < 0.18 + score / 350) {
    s.fanSupport = clamp(s.fanSupport - (2 + Math.floor(random(s) * 4)), 10, 100);
    message(s, {
      title: "احتجاج جماهيري 🌙",
      body: "جمعيات جماهيرية ترفع لافتات «كرة بلا قمار» أمام الملعب. بعض العائلات تقاطع المتجر.",
      category: "board",
      kind: "betting-protest",
    });
  }

  // تضارب عالي يولّد ضغط معارضة
  if (score > 65 && s.politics?.opposition) {
    if (random(s) < 0.07) {
      s.politics.opposition.pressure = clamp(s.politics.opposition.pressure + 3, 0, 100);
    }
  }

  return { score };
}
