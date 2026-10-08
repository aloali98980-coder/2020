import { roleEffect } from "./playerRoles.js";
import { selectXI, tacticalEffects } from "./tactics.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { matchCommerce } from "./commerce.js";
import { getDerbyInfo, derbyPreMatchMessage, derbyPostMatchMessage } from "./derby.js";
import { CLUBS } from "../data/catalog.js";
import { addDays, random, clamp } from "../core/utils.js";
import { post } from "./finance.js";
import { message } from "./inbox.js";
import { legendMatchBonus } from "./legends.js";
import { recordMatchStats } from "./seasonStats.js";
import { generateCardDistribution, applyMatchConsequences } from "./matchConsequences.js";
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
function goals(s, power, opponent, home) {
  const expected = clamp(
    1.25 + (power - opponent) / 30 + (home ? 0.2 : 0),
    0.25,
    3.2,
  );
  let g = 0;
  for (let i = 0; i < 6; i++) if (random(s) < expected / 6) g++;
  return g;
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
    const hp = strength(s, f.home),
      ap = strength(s, f.away);
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
        f.attendance = Math.floor(capacity * fill);
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
      if (team.length)
        for (let i = 0; i < our; i++) {
          const scorer = team[Math.floor(random(s) * team.length)];
          scorer.goals++;
          const bonus = scorer.contractTerms?.goalBonus || 0;
          if (bonus)
            post(
              s,
              -bonus,
              "goal-bonus",
              `مكافأة هدف ${scorer.name}`,
              f.id + "-goal-" + i,
            );
        }
      // 0.23+0.24: accumulate season stats + apply match consequences.
      // Cards are generated once and shared between both systems for determinism.
      const xi = Array.isArray(f.lineup) && f.lineup.length
        ? f.lineup.map((x) => s.players.find((y) => y.id === x.playerId)).filter(Boolean)
        : selectXI(s).filter((x) => x.p.status !== "retired").map((x) => x.p);
      const cards = generateCardDistribution(xi, () => random(s), { isDerby: f.isDerby });
      recordMatchStats(s, f, () => random(s), our, cards);
      const { redCardPenalty } = applyMatchConsequences(s, f, cards, () => random(s));
      // Red card numerical disadvantage: reduce score with probability.
      if (!f.extraTime && redCardPenalty > 0 && random(s) < 0.3) {
        f[our === "homeGoals" ? "homeGoals" : "awayGoals"] = Math.max(0, f[
          f.home === s.clubId ? "homeGoals" : "awayGoals"
        ] - 1);
      }
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
    }
  }
}
export const sortedTable = (s) =>
  [...s.table].sort(
    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf,
  );
