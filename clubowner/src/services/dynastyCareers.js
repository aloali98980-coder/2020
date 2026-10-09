import { addDays, assert, clamp, uid } from "../core/utils.js";
import { CAREER_PATH_IDS, DYNASTY_PATHS, ACADEMY_POSITION_IDS } from "../data/dynasty.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { generatedPlayer } from "../models/generatedPlayers.js";
import { initializeCareer } from "../models/player.js";
import { reservedSquadSize } from "./employment.js";
import { post, wages } from "./finance.js";
import { message } from "./inbox.js";
import { fileSuccessionCase } from "./staff/legal.js";
import {
  allDynastyChildren,
  enrollDynastyAcademy,
  findDynastyChild,
  leaveDynastyAcademy,
} from "./dynasty.js";

const PATH_BONUS = {
  player: ["playerRelations", 5],
  business: ["sponsorNegotiation", 5],
  celebrity: ["clubFame", 5],
  rebellious: ["autonomy", 5],
};
const meter = (value) => Math.round(clamp(Number(value) || 0, 0, 100) * 100) / 100;
const roundStat = (value) => Math.round(clamp(value, 0, 100) * 100) / 100;

export function dynastySiblings(s, childOrId) {
  const child = typeof childOrId === "string" ? findDynastyChild(s, childOrId) : childOrId;
  if (!child) return [];
  if (child.parentId) {
    const parent = findDynastyChild(s, child.parentId);
    if (parent) return parent.offspring || [];
    return allDynastyChildren(s).filter((person) => person.parentId === child.parentId);
  }
  return (s.dynasty?.children || []).filter((person) => !person.parentId);
}

export function setCareerPath(s, childId, path) {
  const d = s.dynasty;
  const child = findDynastyChild(s, childId);
  assert(child, "الابن غير موجود أو ملفه ناقص.");
  assert(child.age >= 15, "يمكن اختيار المسار المهني من عمر ١٥ سنة.");
  assert(CAREER_PATH_IDS.includes(path), "المسار المهني غير معروف.");
  if (child.careerPath === path) return path;
  assert(child.careerPath === null, "اختار الابن مساره بالفعل؛ لا يمكن فرض مسار بديل.");

  if (path === "player") {
    child.careerPath = path;
    if (child.age <= 17 && !child.academy?.enrolled)
      enrollDynastyAcademy(s, child.id, child.academy?.position || "CM");
  } else {
    if (child.academy?.enrolled) leaveDynastyAcademy(s, child.id);
    child.careerPath = path;
  }
  const [bonusKey, amount] = PATH_BONUS[path];
  d.ownerBonuses[bonusKey] = meter(d.ownerBonuses[bonusKey] + amount);
  child.growth.pendingMilestones = (child.growth.pendingMilestones || []).filter(
    (milestone) => milestone !== "career-path-choice",
  );
  child.growth.pathChoiceRaised = true;

  if (path === "celebrity") {
    d.shirtSales = Math.min(Number.MAX_SAFE_INTEGER, d.shirtSales + 500);
    s.reputation = meter((s.reputation || 0) + 1);
    s.fanSupport = meter((s.fanSupport || 0) + 1);
  }
  if (path === "business") s.reputation = meter((s.reputation || 0) + 0.5);
  if (path === "rebellious") child.relationship = roundStat(child.relationship + 2);
  return path;
}

export function promoteDynastyPlayer(s, childId) {
  const child = findDynastyChild(s, childId);
  const academy = child?.academy;
  assert(child && child.careerPath === "player", "هذا الابن لم يختر مسار اللاعب.");
  assert(!child.playerId, "تم تسجيل هذا الابن لاعبًا بالفعل.");
  assert(
    academy?.enrolled && academy.trialReady && child.age >= 16 && child.age <= 21,
    "التصعيد يحتاج ناشئًا جاهزًا لتجربة الفريق الأول.",
  );
  assert(
    reservedSquadSize(s) < (s.squadLimit || 30),
    "قائمة الفريق ممتلئة؛ أفرغ مكانًا قبل التصعيد.",
  );

  const clubData = extendedClub(s.clubId);
  const currentPlayer = s.players.find((player) => player.clubId === s.clubId);
  const club = {
    id: s.clubId,
    name: clubData?.name || currentPlayer?.clubName || s.clubId,
    country: clubData?.country || currentPlayer?.league || "eg",
    overall: clubData?.overall || currentPlayer?.rating || 60,
  };
  const positionIndex = Math.max(0, ACADEMY_POSITION_IDS.indexOf(academy.position));
  const seedIndex = 2_400_000 + (s.nextId || 0) * 100 + positionIndex;
  const player = generatedPlayer(club, seedIndex, s.date, s.seed || 84721, true);
  const rating = Math.round(clamp(academy.rating, 45, 94));
  const change = rating - player.rating;
  for (const [key, value] of Object.entries(player.attributes || {}))
    if (Number.isFinite(value)) player.attributes[key] = clamp(Math.round(value + change), 1, 99);
  player.id = uid(s, "dynasty-player");
  player.name = child.name;
  player.nameLatin = child.name;
  player.clubId = s.clubId;
  player.clubName = club.name;
  player.league = club.country;
  player.position = academy.position;
  player.birthDate = child.birthDate;
  player.age = child.age;
  player.ageEstimated = false;
  player.ageReference = child.age;
  player.ageReferenceDate = s.date;
  player.rating = rating;
  player.potential = Math.round(clamp(Math.max(rating, rating + child.stats.talent * 0.12), rating, 99));
  player.value = Math.round((rating - 25) ** 2 * 4500);
  player.salary = Math.max(3000, Math.round(((rating - 25) ** 2 * 18) / 1000) * 1000);
  player.contractEnd = addDays(s.date, 1095);
  player.contractTerms.signedOn = s.date;
  player.contractTerms.lastRaiseYear = s.date.slice(0, 4);
  player.status = "active";
  player.morale = 80;
  player.fitness = 95;
  player.appearances = 0;
  player.goals = 0;
  player.careerInterest = child.stats.ambition;
  player.careerHistory = [{ date: s.date, type: "dynasty-academy-graduation", clubId: s.clubId }];
  player.dynastyChildId = child.id;
  initializeCareer(player, s.date);

  assert(s.finance.cash >= player.salary, "السيولة لا تكفي لمكافأة توقيع الناشئ.");
  assert(
    wages(s) + player.salary <= s.finance.wageBudget,
    "راتب الناشئ يتجاوز ميزانية المرتبات الشهرية.",
  );
  post(s, -player.salary, "dynasty-academy-signing", `تصعيد ${child.name}`, `dynasty-graduate-${child.id}`);
  s.players.push(player);
  child.playerId = player.id;
  academy.enrolled = false;
  academy.trialReady = false;
  child.growth.pendingMilestones = (child.growth.pendingMilestones || []).filter(
    (milestone) => milestone !== "career-path-choice",
  );
  message(s, {
    title: "خريج الأكاديمية ينضم للفريق الأول",
    body: "تم تسجيل خريج أكاديمية العائلة بعقد النادي. سيظهر ملفه في قائمة الفريق مع الحفاظ على صلته بشجرة الأسرة.",
    category: "careers",
    kind: "dynasty-graduate",
    ref: player.id,
  });
  return player;
}

export function siblingConflictDay(s) {
  const d = s.dynasty;
  if (!d) return;
  const month = s.date.slice(0, 7);
  if (d.lastSiblingMonth === month) return;
  d.lastSiblingMonth = month;
  const groups = new Map();
  for (const child of allDynastyChildren(s)) {
    const key = child.parentId || "owner";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(child);
  }
  for (const siblings of groups.values()) {
    if (siblings.length < 2) continue;
    const heir = siblings.find((child) => child.isHeir || d.heirId === child.id) || null;
    for (const child of siblings) {
      const others = siblings.filter((sibling) => sibling.id !== child.id);
      const visibleRival = others.some((sibling) => sibling.stats.talent >= child.stats.talent + 15);
      let tension = heir && heir.id !== child.id ? 0.7 : 0.15;
      if (child.stats.ambition >= 70) tension += 0.35;
      if (child.traits.includes("arrogant")) tension += 0.25;
      if (visibleRival) tension += 0.25;
      if (d.publicBalance < 35) tension += 0.2;
      if (child.relationship >= 75) tension -= 0.8;
      else if (child.relationship >= 60) tension -= 0.35;
      child.jealousy = meter(child.jealousy + Math.max(-0.75, tension));
      if (child.jealousy >= 50) {
        child.relationship = roundStat(child.relationship - 0.15);
        if (!child.growth.pendingMilestones.includes("sibling-conflict"))
          child.growth.pendingMilestones.push("sibling-conflict");
        if (heir && heir.id !== child.id && child.legalClaim)
          fileSuccessionCase(s, child.id, "sibling-conflict");
      } else if (child.jealousy < 30) {
        child.growth.pendingMilestones = child.growth.pendingMilestones.filter(
          (milestone) => milestone !== "sibling-conflict",
        );
      }
    }
  }
}

export function reconcileSiblings(s, childId) {
  const child = findDynastyChild(s, childId);
  const siblings = dynastySiblings(s, child);
  assert(child && siblings.length >= 2, "لا يوجد إخوة يحتاجون إلى جلسة مصالحة.");
  for (const sibling of siblings) {
    sibling.jealousy = meter(sibling.jealousy - 18);
    sibling.relationship = meter(sibling.relationship + (sibling.id === child.id ? 6 : 3));
    sibling.growth.pendingMilestones = (sibling.growth.pendingMilestones || []).filter(
      (milestone) => milestone !== "sibling-conflict",
    );
  }
  return siblings;
}
