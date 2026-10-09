// أول 60 ثانية 0.27 — مباراة ودية فورية في نفس اليوم
// زر «العب ماتش ودي النهاردة» يرتب مباراة فورية ضد فريق قريب المستوى في نفس اليوم، بتقرير ولقطات كاملة.
import { selectXI, tacticalEffects } from "./tactics.js";
import { roleEffect } from "./playerRoles.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { CLUBS } from "../data/catalog.js";
import { clamp, random } from "../core/utils.js";
import { post } from "./finance.js";
import { message } from "./inbox.js";
import { recordMatchStats } from "./seasonStats.js";
import { generateCardDistribution, applyMatchConsequences } from "./matchConsequences.js";
import { reportFor } from "./matchReport.js";

/**
 * اختيار منافس قريب المستوى لمباراة ودية متكافئة
 */
export function findFriendlyOpponent(s) {
  const userRep = s.reputation || 75;

  let candidates = [];
  if (s.expansion?.divisions) {
    const userDiv = s.expansion.divisions.find((d) => d.clubs.includes(s.clubId));
    if (userDiv) {
      candidates = userDiv.clubs.filter((id) => id !== s.clubId && !extendedClub(id)?.reserve);
    }
    if (!candidates.length) {
      candidates = s.expansion.divisions.flatMap((d) => d.clubs).filter((id) => id !== s.clubId && !extendedClub(id)?.reserve);
    }
  }

  if (!candidates.length) {
    candidates = CLUBS.filter((c) => c.id !== s.clubId).map((c) => c.id);
  }

  // ترتيب المرشحين حسب فارق السمعة لاختيار أقرب مستوى
  candidates.sort((a, b) => {
    const repA = extendedClub(a)?.rep || 65;
    const repB = extendedClub(b)?.rep || 65;
    return Math.abs(repA - userRep) - Math.abs(repB - userRep);
  });

  return candidates[0] || "zamalek";
}

function calcStrength(s, id) {
  if (id !== s.clubId && !s.players.some((p) => p.clubId === id && p.status !== "retired")) {
    return extendedClub(id).rep * 0.65 + 22;
  }
  const selected = selectXI(s, id);
  const squad = selected.map((x) => x.p);
  return (
    squad.reduce(
      (n, p) =>
        n +
        p.rating *
          (0.55 + 0.45 * (selected.find((x) => x.p.id === p.id)?.fit || 1)) *
          (0.75 + p.fitness / 400) *
          (0.9 + p.morale / 1000),
      0,
    ) / 11
  );
}

function simGoals(s, power, opponent) {
  const expected = clamp(1.25 + (power - opponent) / 30 + 0.2, 0.5, 3.2);
  let g = 0;
  for (let i = 0; i < 6; i++) {
    if (random(s) < expected / 6) g++;
  }
  return g;
}

/**
 * ترتيب وتنفيذ مباراة ودية فورية في نفس اليوم
 */
export function playInstantFriendly(s) {
  const oppId = findFriendlyOpponent(s);
  const oppClub = extendedClub(oppId) || { id: oppId, name: oppId };

  const fixture = {
    id: `instant-friendly-${s.clubId}-${s.seasonNumber}-${s.nextId++}`,
    round: 0,
    date: s.date,
    home: s.clubId,
    away: oppId,
    played: false,
    competition: "مباراة ودية تحضيرية",
    friendly: true,
    isFriendly: true,
    neutral: false,
  };

  if (!Array.isArray(s.friendlies)) s.friendlies = [];
  s.friendlies.push(fixture);
  if (!s.expansion && Array.isArray(s.fixtures)) {
    s.fixtures.push(fixture);
  }

  // محاكاة المباراة
  const effects = tacticalEffects(s, oppId);
  const hp = calcStrength(s, s.clubId);
  const ap = calcStrength(s, oppId);

  fixture.homeGoals = simGoals(s, hp + effects.attack, ap);
  fixture.awayGoals = simGoals(s, ap, hp + effects.defence);

  // إعداد التشكيلة والتكتيك
  fixture.tactics = { ...effects };
  const team = selectXI(s).map((x) => x.p);
  fixture.lineup = selectXI(s).map((x) => ({
    playerId: x.p.id,
    slot: x.slot,
    role: roleEffect(s, x.p, x.slot).role,
    fit: Math.round(x.fit * 100),
  }));

  fixture.played = true;

  // إحصاءات الحضور والتذاكر للمباراة الودية
  const capacity = s.capacity || 25000;
  fixture.attendance = Math.floor(capacity * 0.65);
  const ticketGross = Math.round(fixture.attendance * (s.ticketPrice || 100) * 0.5);
  post(s, ticketGross, "tickets", "إيراد تذاكر مباراة ودية تحضيرية", fixture.id + "-tickets");
  post(s, -Math.round(fixture.attendance * 10), "match-costs", "تنظيم مباراة ودية", fixture.id + "-costs");

  // تحديث اللاعبين (إجهاد خفيف، معنويات، أهداف)
  const our = fixture.homeGoals;
  const opp = fixture.awayGoals;

  team.forEach((p) => {
    p.fitness = Math.max(50, p.fitness - 8);
    p.appearances++;
    p.morale = clamp(p.morale + (our > opp ? 3 : our === opp ? 1 : -1), 0, 100);
  });

  if (team.length && our > 0) {
    for (let i = 0; i < our; i++) {
      const scorer = team[Math.floor(random(s) * team.length)];
      scorer.goals++;
    }
  }

  // بطاقات وعواقب
  const xi = fixture.lineup.map((x) => s.players.find((y) => y.id === x.playerId)).filter(Boolean);
  const cards = generateCardDistribution(xi, () => random(s));
  recordMatchStats(s, fixture, () => random(s), our, cards);
  applyMatchConsequences(s, fixture, cards, () => random(s));

  // تحديث حالة الأونبوردنج
  if (!s.onboarding) s.onboarding = {};
  s.onboarding.friendlyPlayed = true;

  const resultWord = our > opp ? "فوز" : our === opp ? "تعادل" : "خسارة";

  // إرسال تقرير في البريد
  message(s, {
    title: `${resultWord} ${our}–${opp} | ودية ${oppClub.name}`,
    body: `أول نبضة كروية لمشروعك! انتهت المباراة الودية الافتتاحية بنتيجة ${our}–${opp} أمام ${oppClub.name}. تم تسجيل دخل التذاكر وتقييمات اللاعبين واللقطات في سجلك.`,
    category: "matches",
    kind: "friendly-report",
    ref: fixture.id,
  });

  const report = reportFor(s, fixture);

  return { fixture, report };
}
