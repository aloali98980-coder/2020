import { cityEffects } from "./cityFacilities.js";
import { roleEffect } from "./playerRoles.js";
import { selectXI, tacticalEffects } from "./tactics.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { matchCommerce } from "./commerce.js";
import { getDerbyInfo, derbyPreMatchMessage, derbyPostMatchMessage } from "./derby.js";
import { CLUBS } from "../data/catalog.js";
import { addDays, random, clamp } from "../core/utils.js";
import { tr } from "../i18n/index.js";
import { post } from "./finance.js";
import { message } from "./inbox.js";
import { legendMatchBonus } from "./legends.js";
import { recordMatchStats } from "./seasonStats.js";
import { planOwnGoals } from "./goalModel.js";
import { buildTimeline, compactTimeline } from "./matchTimeline.js";

const ourGoalsOf = (f, s) => (f.home === s.clubId ? f.homeGoals : f.awayGoals) || 0;
import { applyMatchConsequences } from "./matchConsequences.js";
import { recordDisciplineIncident, refereeSuspensionThreshold } from "./politics/committees.js";
import { resolveInsiderBet } from "./betting/insider.js";
import { fanAttendanceMultiplier, recordSupporterResult, supporterMatchBonus } from "./ultras.js";
export function fixtures(date) {
  let order = CLUBS.map((c) => c.id),
    out = [];
  for (let r = 0; r < 7; r++) {
    for (let i = 0; i < 4; i++) {
      let a = order[i],
        b = order[7 - i];
      if (r % 2) [a, b] = [b, a];
      out.push({
        id: `fix-${r}-${i}`,
        round: r + 1,
        date: addDays(date, 7 * (r + 1)),
        home: a,
        away: b,
        played: false,
      });
    }
    order = [order[0], order[7], ...order.slice(1, 7)];
  }
  return [
    ...out,
    ...out.map((f, i) => ({
      ...f,
      id: "return-" + i,
      round: f.round + 7,
      date: addDays(date, 7 * (f.round + 7)),
      home: f.away,
      away: f.home,
    })),
  ];
}
function strength(s, id) {
  if (
    id !== s.clubId &&
    !s.players.some((p) => p.clubId === id && p.status !== "retired")
  )
    return extendedClub(id).rep * 0.65 + 22;
  const selected = selectXI(s, id);
  const squad = selected.map((x) => x.p);
  return (
    (id === s.clubId && s.management?.coach
      ? (s.management.coach.skill - 60) *
        0.035 *
        (0.6 + s.management.coach.confidence / 250)
      : 0) +
    (id === s.clubId ? legendMatchBonus(s) : 0) +
    squad.reduce(
      (n, p) =>
        n +
        p.rating *
          (0.55 + 0.45 * (selected.find((x) => x.p.id === p.id)?.fit || 1)) *
          (0.75 + p.fitness / 400) *
          (0.9 + p.morale / 1000) +
        // 0.24: form modifier — small boost/penalty based on recent ratings.
        (p.form || 0),
      0,
    ) /
      11 +
    (s.expansion &&
    id !== s.clubId &&
    s.players.filter((p) => p.clubId === id && p.status !== "retired").length <
      11
      ? ((11 - squad.length) * (extendedClub(id).rep * 0.65 + 22)) / 11
      : 0)
  );
}
// ── نموذج النتائج 0.43 (مواصفة «النتائج المتوازنة» المقفولة) ─────────────────
// متوسط ~4 أهداف للمباراة (أعلى من الدوريات الحقيقية عمدًا: دراما)، يزداد مع قوة الفريق.
// فارق قوة 20 ← الأقوى ~60–65%، المفاجآت ~20–25%، الباقي تعادلات.
// لا سقف صلب: الحد الأقصى لهدف فريق 14 (الذيل الكبير موجود)، والأرقام مقفولة في tests/engine-balance.test.js.
export const GOAL_MODEL = Object.freeze({
  base: 2, // λ لفريقين متكافئين → 4 أهداف للمباراة
  sensitivity: 0.035, // حساسية القوة
  floor: 0.8, // أرضية λ للضعيف (يحدّ الذيل الصفري)
  ceiling: 2.5, // سقف λ للقوي (يحدّ فضائح القوي ضد الضعيف)
  cap: 14, // أقصى هدف لفريق في مباراة
  homeFactor: 1.03,
});

// بواسون بطريقة كنوث مع مولّد المحاكاة الحتمي
function poissonDraw(rng, lam) {
  const L = Math.exp(-lam);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L && k <= GOAL_MODEL.cap + 1);
  return Math.min(GOAL_MODEL.cap, k - 1);
}

// فضيحتان مقفولتان: قوي ضد ضعيف (فارق قوة 30+ وفارق أهداف 6+)، وكبار متقاربون (فارق قوة أقل من 15 وفارق أهداف 5+).
export function scandalKind(power, opp, hg, ag) {
  const gap = Math.abs((power || 0) - (opp || 0));
  const margin = Math.abs((hg || 0) - (ag || 0));
  if (gap >= 30 && margin >= 6) return "rout";
  if (gap < 15 && margin >= 5) return "giants";
  return null;
}
function scandalMessage(s, f, kind) {
  const home = extendedClub(f.home).name;
  const away = extendedClub(f.away).name;
  const score = `${f.homeGoals}–${f.awayGoals}`;
  if (kind === "giants")
    message(s, {
      title: tr("يوم أسود للكبار! 💥", "A black day for the giants! 💥", "Un jour noir pour les grands ! 💥"),
      body: tr(
        `${home} ${score} ${away}: انهيار مفاجئ لم يتوقعه أحد. طرد مبكر وأخطاء دفاعية تصدّرت الأخبار.`,
        `${home} ${score} ${away}: a sudden collapse nobody expected. An early red card and defensive errors dominated the headlines.`,
        `${home} ${score} ${away} : effondrement soudain que personne n'attendait. Expulsion précoce et erreurs défensives à la une.`,
      ),
      category: "matches",
      kind: "info",
    });
  else
    message(s, {
      title: tr("سحق تاريخي! 📰", "Historic rout! 📰", "Déroute historique ! 📰"),
      body: tr(
        `${home} ${score} ${away}: نتيجة تُحكى للأحفاد. فريسة من فرق الدنيا تحوّلت إلى ذبح كامل.`,
        `${home} ${score} ${away}: a result to tell the grandchildren. A total massacre of a weaker side.`,
        `${home} ${score} ${away} : un résultat à raconter aux petits-enfants. Un massacre total face à plus faible.`,
      ),
      category: "matches",
      kind: "info",
    });
}
/** أهداف فريق واحد: power = قوته، opponent = قوة خصمه. */
export function goals(s, power, opponent, home) {
  const raw = GOAL_MODEL.base * Math.exp((GOAL_MODEL.sensitivity * ((power || 0) - (opponent || 0))) / 2);
  const lam = clamp(raw, GOAL_MODEL.floor, GOAL_MODEL.ceiling) * (home ? GOAL_MODEL.homeFactor : 1);
  return poissonDraw(() => random(s), lam);
}

export function matchDay(
  s,
  fixturesToPlay = s.fixtures,
  table = s.table,
  options = {},
) {
  for (const f of fixturesToPlay) {
    if (f.played || f.date !== s.date) continue;
    const owns = [f.home, f.away].includes(s.clubId),
      ourHome = f.home === s.clubId;

    // 0.28: black files active effects
    const bf = s.blackFiles;
    const hasRefBias = Boolean(bf?.active?.refereeBias && bf.active.refereeBias.until >= s.date);
    const hasBribe = Boolean(bf?.active?.bribedOpponent && bf.active.bribedOpponent.fixtureId === f.id);

    const derby = getDerbyInfo(f.home, f.away, s);
    if (derby.isDerby) {
      f.isDerby = true;
      f.derbyName = derby.nameAr;
      f.derbyInfo = derby;
      if (owns) {
        if (!s.derbyNotices) s.derbyNotices = {};
        if (!s.derbyNotices[f.id]) {
          s.derbyNotices[f.id] = true;
          message(s, derbyPreMatchMessage(extendedClub(s.clubId), extendedClub(ourHome ? f.away : f.home), derby));
        }
      }
    }

    const effects = owns
      ? tacticalEffects(s, ourHome ? f.away : f.home)
      : { attack: 0, defence: 0, fatigue: 0 };
    let hp = strength(s, f.home) + supporterMatchBonus(s, f.home, f, true),
      ap = strength(s, f.away) + supporterMatchBonus(s, f.away, f, false);
    // bribed opponent: opponent underperforms
    if (hasBribe && owns) {
      if (f.home === s.clubId) ap = ap * 0.75;
      else hp = hp * 0.75;
    }
    f.homeGoals = goals(
      s,
      hp + (owns && ourHome ? effects.attack : 0),
      ap + (owns && !ourHome ? effects.defence : 0),
      !f.neutral,
    );
    f.awayGoals = goals(
      s,
      ap + (owns && !ourHome ? effects.attack : 0),
      hp + (owns && ourHome ? effects.defence : 0),
      false,
    );
    // referee bias: extra goal / cancel opponent goal
    if (hasRefBias && owns) {
      const biasType = bf.active.refereeBias.type;
      if (biasType === "penalty-dubious" || biasType === "goal-cancel") {
        if (f.home === s.clubId) f.homeGoals += 1;
        else f.awayGoals += 1;
      }
      if (biasType === "goal-cancel") {
        if (f.home === s.clubId) f.awayGoals = Math.max(0, f.awayGoals - 1);
        else f.homeGoals = Math.max(0, f.homeGoals - 1);
      }
    }
    if (owns && s.management?.tactics?.enabled) {
      f.tactics = { ...effects };
      f.lineup = selectXI(s).map((x) => ({
        playerId: x.p.id,
        slot: x.slot,
        role: roleEffect(s, x.p, x.slot).role,
        fit: Math.round(x.fit * 100),
      }));
    }
    if (s.management && (f.home === s.clubId || f.away === s.clubId)) {
      const our = f.home === s.clubId ? "homeGoals" : "awayGoals",
        opp = our === "homeGoals" ? "awayGoals" : "homeGoals";
      if (s.management.tactic === "attack") {
        if (random(s) < 0.18) f[our]++;
        if (random(s) < 0.15) f[opp]++;
      }
      if (s.management.tactic === "defend") {
        if (random(s) < 0.25) f[our] = Math.max(0, f[our] - 1);
        if (random(s) < 0.3) f[opp] = Math.max(0, f[opp] - 1);
      }
    }
    options.afterScore?.(f);
    f.played = true;
    recordSupporterResult(s, f);
    const h = table.find((t) => t.clubId === f.home),
      a = table.find((t) => t.clubId === f.away);
    h.played++;
    a.played++;
    h.gf += f.homeGoals;
    h.ga += f.awayGoals;
    a.gf += f.awayGoals;
    a.ga += f.homeGoals;
    if (f.homeGoals > f.awayGoals) {
      h.wins++;
      a.losses++;
      h.points += 3;
    } else if (f.homeGoals < f.awayGoals) {
      a.wins++;
      h.losses++;
      a.points += 3;
    } else {
      a.draws++;
      h.draws++;
      a.points++;
      h.points++;
    }
    if (f.home === s.clubId || f.away === s.clubId) {
      const home = f.home === s.clubId,
        our = home ? f.homeGoals : f.awayGoals,
        opp = home ? f.awayGoals : f.homeGoals;
      const result = our > opp ? "فوز" : our === opp ? "تعادل" : "خسارة";
      const derbyWinBoost = f.isDerby ? 7 : 3;
      const derbyLossPenalty = f.isDerby ? -6 : -4;
      s.fanSupport = clamp(
        s.fanSupport + (our > opp ? derbyWinBoost : our === opp ? 0 : derbyLossPenalty),
        10,
        100,
      );
      if (!home && !f.neutral && s.sportsCity && !(cityEffects(s).totals.awayStay))
        post(s,-35_000,"away-accommodation","إقامة الفريق خارج ملعبه",f.id+"-away-hotel");
      if (home && !f.neutral && s.commerce) matchCommerce(s, f);
      if (home && !f.neutral && !s.commerce) {
        const capacity = Math.floor(
          s.capacity *
            (s.facilities.find((x) => x.id === "stadium").project ? 0.9 : 1),
        );
        const fill = f.isDerby
          ? clamp(0.92 + s.fanSupport / 400, 0.88, 0.99)
          : clamp(
              0.48 + s.fanSupport / 230 - (s.ticketPrice - 100) / 650,
              0.2,
              0.98,
            );
        f.attendance = Math.floor(capacity * fill * fanAttendanceMultiplier(s, s.clubId, f.date));
        const effectivePrice = f.isDerby ? s.ticketPrice * 2 : s.ticketPrice;
        post(
          s,
          f.attendance * effectivePrice,
          "tickets",
          f.isDerby ? "إيراد تذاكر مباراة الديربي (أسعار مضاعفة)" : "إيراد تذاكر المباراة",
          f.id + "-tickets",
        );
        post(
          s,
          -Math.round(f.attendance * 18),
          "match-costs",
          "تنظيم وأمن المباراة",
          f.id + "-costs",
        );
      }
      const team = selectXI(s).map((x) => x.p);
      team.forEach((p) => {
        p.fitness = Math.max(
          45,
          p.fitness -
            (effects.fatigue || 0) -
            (s.management?.tactics?.enabled ? roleEffect(s, p).fatigue : 0) -
            (s.management?.tactic === "attack"
              ? 16 + (f.extraTime ? 4 : 0)
              : s.management?.tactic === "defend"
                ? 10 + (f.extraTime ? 4 : 0)
                : 12 + (f.extraTime ? 4 : 0)),
        );
        p.appearances++;
        const bonus = p.contractTerms?.appearanceBonus || 0;
        if (bonus)
          post(
            s,
            -bonus,
            "appearance-bonus",
            `مكافأة مشاركة ${p.name}`,
            f.id + "-app-" + p.id,
          );
        const moraleDelta = our > opp ? (f.isDerby ? 5 : 3) : -1;
        p.morale = clamp(p.morale + moraleDelta, 0, 100);
      });
      // 0.43: مخطط زمني واحد للمباراة: بطاقات وطرد وتبديلات، ثم الأهداف من يوم اللاعب على الأرض فقط.
      const lineupPlayers = (Array.isArray(f.lineup) && f.lineup.length
        ? f.lineup
            .map((x) => s.players.find((y) => y.id === x.playerId))
            .filter((p) => p && p.status !== "retired")
        : selectXI(s).filter((x) => x.p.status !== "retired").map((x) => x.p));
      const onStarting = new Set(lineupPlayers.map((p) => p.id));
      const bench = s.players
        .filter(
          (p) =>
            p.clubId === s.clubId &&
            p.status !== "retired" &&
            !onStarting.has(p.id) &&
            !(p.injuryUntil && p.injuryUntil > s.date) &&
            !(p.suspendedUntil && p.suspendedUntil >= s.date),
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      const politics = s.politics;
      const refereePolicy = politics?.committees?.referees?.policy || "balanced";
      const suspensionThreshold = refereeSuspensionThreshold(politics);
      const tl = buildTimeline(lineupPlayers, bench, () => random(s), {
        isDerby: f.isDerby,
        refereePolicy,
        extraTime: f.extraTime,
      });
      const byIdAll = new Map([...lineupPlayers, ...bench].map((p) => [p.id, p]));
      // عقوبة النقص العددي تُطبَّق قبل توزيع الأهداف حتى لا تزيد الخطة على النتيجة النهائية
      const reds = tl.events.filter((e) => e.t === "r");
      if (!f.extraTime && reds.length && random(s) < 0.3) {
        const side = f.home === s.clubId ? "Home" : "Away";
        const key = side === "Home" ? "homeGoals" : "awayGoals";
        f[key] = Math.max(0, (f[key] || 0) - 1);
        // المسابقات الأوروبية تحفظ النظامي بجانب النتيجة: نُبقيهما متطابقين
        const regKey = side === "Home" ? "regulationHome" : "regulationAway";
        if (Number.isFinite(f[regKey])) f[regKey] = Math.max(0, f[regKey] - 1);
      }
      const ourFinal = ourGoalsOf(f, s);
      const poolAt = (m) =>
        [...tl.participants()]
          .filter((id) => tl.onPitchAt(id, m))
          .map((id) => ({ p: byIdAll.get(id) }))
          .filter((x) => x.p);
      if (ourFinal > 0) {
        f.goalPlan = planOwnGoals(() => random(s), lineupPlayers.map((p) => ({ p })), ourFinal, f.extraTime, poolAt);
        f.goalPlan.forEach((g, i) => {
          const scorer = s.players.find((p) => p.id === g.s);
          if (!scorer) return;
          scorer.goals++;
          const bonus = scorer.contractTerms?.goalBonus || 0;
          if (bonus)
            post(s, -bonus, "goal-bonus", `مكافأة هدف ${scorer.name}`, f.id + "-goal-" + i);
        });
      } else {
        f.goalPlan = [];
      }
      f.timeline = compactTimeline(tl);
      const cards = {
        yellows: tl.events.filter((e) => e.t === "y").map((e) => byIdAll.get(e.p)).filter(Boolean),
        reds: reds.map((e) => byIdAll.get(e.p)).filter(Boolean),
      };
      recordMatchStats(s, f, () => random(s), ourFinal, cards);
      const { redCardPenalty } = applyMatchConsequences(s, f, cards, () => random(s), { suspensionThreshold });
      for (const player of cards.reds) recordDisciplineIncident(s, f, player);
      void redCardPenalty;
      message(s, {
        title: `${f.isDerby ? "🔥 " : ""}${result} ${our}–${opp} | تقرير ${f.isDerby ? "الديربي" : "المباراة"}`,
        body: `${extendedClub(f.home).name} ${f.homeGoals} — ${f.awayGoals} ${extendedClub(f.away).name}. ${f.neutral ? "مباراة على ملعب محايد؛ لا إيراد تذاكر ملعب ناديك." : home ? (f.isDerby ? "تم تسجيل تذاكر الديربي بأسعار مضاعفة ومصروفات التنظيم." : "تم تسجيل التذاكر ومصروفات التنظيم في الحسابات.") : "مباراة خارج ملعبك."} ${f.tactics ? `خطة ${f.tactics.formation} · ملاءمة المراكز ${f.tactics.fit}٪ · الضغط والإيقاع يؤثران على الفرص والإجهاد. ` : ""}المحاكاة احتمالية ومبسطة، وليست مباراة مرئية.`,
        category: "matches",
      });
      if (f.isDerby) {
        message(s, derbyPostMatchMessage(
          extendedClub(s.clubId),
          extendedClub(home ? f.away : f.home),
          our > opp ? "win" : our === opp ? "draw" : "loss",
          our,
          opp,
          derby
        ));
      }
      // 0.36: حسم الرهان الداخلي إن كان معلقًا على هذه المباراة
      try {
        const pend = s.betting?.pendingInsider;
        if (pend && (pend.fixtureId === f.id || String(pend.fixtureId).startsWith("manual-"))) {
          resolveInsiderBet(s, f);
        }
      } catch {}
    }
    // 0.43: فضيحة النتيجة بعد كل التعديلات (عقوبة الطرد أولًا). تُسجَّل في المباراة،
    // ومن طرف ناديك تصل نكهة إخبارية تلقائية.
    const scandal = scandalKind(hp, ap, f.homeGoals, f.awayGoals);
    if (scandal) {
      f.scandal = scandal;
      if (owns) scandalMessage(s, f, scandal);
    }
  }
}
export const sortedTable = (s) =>
  [...s.table].sort(
    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf,
  );
