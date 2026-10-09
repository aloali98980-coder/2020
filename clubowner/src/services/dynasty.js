import { addDays, assert, clamp, random, uid } from "../core/utils.js";
import { staffSkill } from "./staff.js";
import { ageAt } from "../models/player.js";
import { isoDate } from "../core/isoDate.js";
import { fileLegalCase } from "./staff/legal.js";
import { closeThread, message } from "./inbox.js";
import {
  ACADEMY_FOCUS_IDS,
  ACADEMY_POSITION_IDS,
  CAREER_PATH_IDS,
  CHILD_STAGES,
  DYNASTY_SCHEMA,
  DYNASTY_TRAITS,
  TRAIT_IDS,
  UPBRINGING_IDS,
} from "../data/dynasty.js";

const SAFE_ID = /^[a-zA-Z0-9_-]{1,100}$/;
const DEFAULT_OWNER_AGE = 45;
const saveDate = (s) =>
  isoDate(s?.date) ? s.date : isoDate(s?.startDate) ? s.startDate : "2026-01-01";
const childStage = (age) =>
  CHILD_STAGES.find((stage) => age >= stage.minAge && age <= stage.maxAge)?.id ||
  "young";
const numberInRange = (value, min, max, fallback) =>
  Number.isFinite(Number(value))
    ? clamp(Number(value), min, max)
    : fallback;
const integerInRange = (value, min, max, fallback) =>
  Math.round(numberInRange(value, min, max, fallback));
const validMonth = (value) =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

function dateForAge(date, age) {
  const year = Math.max(1, Number(date.slice(0, 4)) - age);
  let value = `${String(year).padStart(4, "0")}${date.slice(4)}`;
  if (!isoDate(value) && value.endsWith("-02-29")) value = value.slice(0, -2) + "28";
  return isoDate(value) ? value : `${String(year).padStart(4, "0")}-01-01`;
}

function existingOwnerAge(s, existing) {
  const candidates = [
    existing?.owner?.age,
    existing?.ownerAge,
    s.ownerAge,
    typeof s.owner === "object" ? s.owner.age : null,
    s.ownerProfile?.age,
    s.personal?.ownerAge,
    s.tycoon?.ownerAge,
    s.billionaire?.ownerAge,
    s.life?.ownerAge,
  ];
  return integerInRange(
    candidates.find((value) => Number.isFinite(Number(value))),
    18,
    120,
    DEFAULT_OWNER_AGE,
  );
}

function existingChildren(s, existing) {
  const candidates = [
    existing?.children,
    s.children,
    s.family?.children,
    s.ownerProfile?.children,
    s.personal?.children,
    s.tycoon?.children,
    s.billionaire?.children,
    s.heirs,
  ].filter(Array.isArray);
  return candidates.find((children) => children.length) || candidates[0] || [];
}

function existingSpouse(s, existing) {
  const value =
    existing?.spouse ??
    s.spouse ??
    s.family?.spouse ??
    s.personal?.spouse ??
    s.tycoon?.spouse ??
    s.billionaire?.spouse ??
    null;
  if (typeof value === "string") return value.trim().slice(0, 80) || null;
  if (value && typeof value === "object")
    return String(value.name || value.fullName || "").trim().slice(0, 80) || null;
  return null;
}

function normalizeTraits(value) {
  if (!Array.isArray(value)) return [];
  const aliases = {
    "مجتهد": "hardworking",
    "طموح": "ambitious",
    "قيادي": "leader",
    "خجول": "shy",
    "متمرد": "rebellious",
    "مغرور": "arrogant",
    "مبدع": "creative",
    "وفيّ": "loyal",
  };
  return [...new Set(value.map((trait) => aliases[trait] || trait))]
    .filter((trait) => TRAIT_IDS.includes(trait))
    .slice(0, 8);
}

function normalizeChild(s, raw, index, usedIds, generation, parentId = null) {
  const source = raw && typeof raw === "object" ? raw : {};
  let id = typeof source.id === "string" && SAFE_ID.test(source.id)
    ? source.id
    : `dynasty-child-${index + 1}`;
  while (usedIds.has(id)) id = uid(s, "dynasty-child");
  usedIds.add(id);

  const sourceBirthday =
    source.birthDate || source.bornOn || source.dateOfBirth || source.birthday;
  const birthday = isoDate(sourceBirthday) && sourceBirthday <= s.date
    ? sourceBirthday
    : dateForAge(
        s.date,
        integerInRange(source.age ?? source.currentAge, 0, 120, 0),
      );
  const age = ageAt({ birthDate: birthday }, s.date);
  const oldStats = source.stats && typeof source.stats === "object" ? source.stats : {};
  const stats = {
    talent: numberInRange(
      oldStats.talent ?? source.talent ?? source.footballTalent,
      0,
      100,
      42,
    ),
    discipline: numberInRange(
      oldStats.discipline ?? source.discipline ?? source.disciplineScore,
      0,
      100,
      45,
    ),
    ambition: numberInRange(
      oldStats.ambition ?? source.ambition ?? source.ambitionScore,
      0,
      100,
      40,
    ),
  };
  const rawAcademy = source.academy && typeof source.academy === "object"
    ? structuredClone(source.academy)
    : null;
  if (rawAcademy) {
    rawAcademy.enrolled = rawAcademy.enrolled !== false;
    rawAcademy.focus = ACADEMY_FOCUS_IDS.includes(rawAcademy.focus)
      ? rawAcademy.focus
      : "balanced";
    rawAcademy.position = ACADEMY_POSITION_IDS.includes(rawAcademy.position)
      ? rawAcademy.position
      : "CM";
    rawAcademy.enteredOn = isoDate(rawAcademy.enteredOn) ? rawAcademy.enteredOn : s.date;
    rawAcademy.mentorId = typeof rawAcademy.mentorId === "string" ? rawAcademy.mentorId.slice(0, 120) : null;
    rawAcademy.injuryUntil = isoDate(rawAcademy.injuryUntil) ? rawAcademy.injuryUntil : null;
    rawAcademy.form = numberInRange(rawAcademy.form, 0, 100, 50);
    rawAcademy.rating = numberInRange(
      rawAcademy.rating,
      0,
      99,
      clamp(35 + stats.talent * 0.38 + stats.discipline * 0.12 + Math.max(0, age - 10) * 0.8, 25, 99),
    );
    rawAcademy.appearances = integerInRange(rawAcademy.appearances, 0, 5000, 0);
    rawAcademy.goals = integerInRange(rawAcademy.goals, 0, 5000, 0);
    rawAcademy.minutes = integerInRange(rawAcademy.minutes, 0, 500000, 0);
    rawAcademy.trainingSessions = integerInRange(rawAcademy.trainingSessions, 0, 5000, 0);
    rawAcademy.trialReady = Boolean(rawAcademy.trialReady);
    rawAcademy.lastTrainingMonth = validMonth(rawAcademy.lastTrainingMonth)
      ? rawAcademy.lastTrainingMonth
      : rawAcademy.enteredOn.slice(0, 7);
    rawAcademy.lastMatchMonth = validMonth(rawAcademy.lastMatchMonth)
      ? rawAcademy.lastMatchMonth
      : rawAcademy.enteredOn.slice(0, 7);
    rawAcademy.matches = Array.isArray(rawAcademy.matches)
      ? rawAcademy.matches.slice(-5000).filter((match) => match && isoDate(match.date)).map((match, i) => ({
          date: match.date,
          played: Boolean(match.played),
          minutes: integerInRange(match.minutes, 0, 120, 0),
          performance: match.performance == null ? null : numberInRange(match.performance, 0, 10, 0),
          goals: integerInRange(match.goals, 0, 10, 0),
          opponent: integerInRange(match.opponent, 1, 20, (i % 20) + 1),
        }))
      : [];
    rawAcademy.reports = Array.isArray(rawAcademy.reports)
      ? rawAcademy.reports.slice(-100).filter((report) => report && isoDate(report.date)).map((report) => ({
          date: report.date,
          focus: ACADEMY_FOCUS_IDS.includes(report.focus) ? report.focus : rawAcademy.focus,
          rating: numberInRange(report.rating, 0, 99, rawAcademy.rating),
          form: numberInRange(report.form, 0, 100, rawAcademy.form),
          gain: numberInRange(report.gain, 0, 10, 0),
          appearances: integerInRange(report.appearances, 0, 5000, rawAcademy.appearances),
          goals: integerInRange(report.goals, 0, 5000, rawAcademy.goals),
        }))
      : [];
  }
  const rawPath = source.careerPath ?? source.path ?? source.route;
  const careerPath = CAREER_PATH_IDS.includes(rawPath) ? rawPath : null;
  const children = Array.isArray(source.offspring)
    ? source.offspring
    : Array.isArray(source.children)
      ? source.children
      : [];
  const normalized = {
    id,
    name: String(source.name || source.fullName || `Child ${index + 1}`).trim().slice(0, 80) || `Child ${index + 1}`,
    birthDate: birthday,
    bornOn: birthday,
    age,
    stage: childStage(age),
    generation: integerInRange(source.generation, 1, Number.MAX_SAFE_INTEGER, generation),
    parentId: parentId || (typeof source.parentId === "string" ? source.parentId : null),
    stats,
    traits: normalizeTraits(source.traits ?? source.personalityTraits),
    upbringing: UPBRINGING_IDS.includes(source.upbringing) ? source.upbringing : "balanced",
    careerPath,
    education: typeof source.education === "string" ? source.education.slice(0, 60) : null,
    relationship: numberInRange(source.relationship ?? source.relationshipWithOwner, 0, 100, 65),
    jealousy: numberInRange(source.jealousy, 0, 100, 0),
    spouse: typeof source.spouse === "string" ? source.spouse.slice(0, 80) : null,
    isHeir: Boolean(source.isHeir || source.heir || source.inheritor),
    excludedFromSuccession: Boolean(source.excludedFromSuccession),
    legalClaim: Boolean(source.legalClaim),
    offspring: [],
    academy: rawAcademy,
    playerId: typeof source.playerId === "string" && SAFE_ID.test(source.playerId)
      ? source.playerId
      : null,
    growth: {
      lastMonth: source.growth?.lastMonth || source.lastGrowthMonth || s.date.slice(0, 7),
      lastAge: age,
      lastStage: childStage(age),
      personalityMilestones: Array.isArray(source.growth?.personalityMilestones)
        ? source.growth.personalityMilestones.filter(Number.isInteger).slice(0, 12)
        : [],
      pendingMilestones: Array.isArray(source.growth?.pendingMilestones)
        ? [...new Set(source.growth.pendingMilestones.filter((value) => typeof value === "string"))].slice(-8)
        : [],
      pathChoiceRaised: Boolean(source.growth?.pathChoiceRaised),
    },
  };
  normalized.offspring = children.map((child, childIndex) =>
    normalizeChild(s, child, childIndex, usedIds, generation + 1, id),
  );
  return normalized;
}

export function stageForAge(age) {
  return childStage(integerInRange(age, 0, 120, 0));
}

export function allDynastyChildren(s) {
  const out = [];
  const visit = (children) => {
    for (const child of children || []) {
      out.push(child);
      visit(child.offspring);
    }
  };
  visit(s.dynasty?.children);
  return out;
}

export function findDynastyChild(s, id) {
  return allDynastyChildren(s).find((child) => child.id === id) || null;
}

export function availableAcademyMentors(s) {
  const candidates = [
    ...(s.players || [])
      .filter(
        (person) =>
          person.clubId === s.clubId &&
          person.status !== "retired" &&
          (person.age >= 27 || (person.appearances || 0) >= 80 || person.rating >= 82),
      )
      .map((person) => ({
        id: person.id,
        name: person.name || person.nameLatin,
        position: person.position,
        rating: person.rating,
        appearances: person.appearances,
        mentorType: "squad",
      })),
    ...(s.retired || [])
      .filter(
        (person) =>
          person.previousClubId === s.clubId &&
          ((person.appearances || 0) >= 50 || person.rating >= 70),
      )
      .map((person) => ({
        id: person.id,
        name: person.name || person.nameLatin,
        position: person.position,
        rating: person.rating,
        appearances: person.appearances,
        mentorType: "alumni",
      })),
  ];
  const seen = new Set();
  const mentors = [];
  for (const person of candidates) {
    if (!SAFE_ID.test(person.id) || seen.has(person.id)) continue;
    seen.add(person.id);
    mentors.push({
      id: person.id,
      name: String(person.name || person.nameLatin || person.id),
      position: person.position || "CM",
      rating: numberInRange(person.rating, 0, 99, 50),
      appearances: integerInRange(person.appearances, 0, 100000, 0),
      type: person.mentorType,
    });
  }
  return mentors;
}

function academyMentor(s, mentorId) {
  if (!mentorId) return null;
  return availableAcademyMentors(s).find((mentor) => mentor.id === mentorId) || null;
}

export function createDynastyChild(s, { name, age = 0, birthDate = null, parentId = null, stats = null } = {}) {
  const d = s.dynasty || (s.dynasty = migrateDynasty(s));
  const today = saveDate(s);
  const parent = parentId ? findDynastyChild(s, parentId) : null;
  const childAge = integerInRange(age, 0, 120, 0);
  const born = isoDate(birthDate) && birthDate <= today ? birthDate : dateForAge(today, childAge);
  const actualAge = ageAt({ birthDate: born }, today);
  const bonus = d.inheritanceBonus || 0;
  const baseline = parent
    ? {
        talent: 38 + parent.stats.talent * 0.32 + bonus,
        discipline: 42 + parent.stats.discipline * 0.3 + bonus,
        ambition: 38 + parent.stats.ambition * 0.3 + bonus,
      }
    : { talent: 42 + bonus, discipline: 45 + bonus, ambition: 40 + bonus };
  const chosenStats = stats && typeof stats === "object" ? stats : {};
  const id = uid(s, "dynasty-child");
  return {
    id,
    name: String(name || "").trim().slice(0, 80) || `Child ${d.children.length + 1}`,
    birthDate: born,
    bornOn: born,
    age: actualAge,
    stage: stageForAge(actualAge),
    generation: parent ? parent.generation + 1 : d.generation,
    parentId,
    stats: {
      talent: numberInRange(chosenStats.talent, 0, 100, baseline.talent),
      discipline: numberInRange(chosenStats.discipline, 0, 100, baseline.discipline),
      ambition: numberInRange(chosenStats.ambition, 0, 100, baseline.ambition),
    },
    traits: [],
    upbringing: "balanced",
    careerPath: null,
    education: null,
    relationship: 65,
    jealousy: 0,
    spouse: null,
    isHeir: false,
    excludedFromSuccession: false,
    legalClaim: false,
    offspring: [],
    academy: null,
    playerId: null,
    growth: {
      lastMonth: today.slice(0, 7),
      lastAge: actualAge,
      lastStage: stageForAge(actualAge),
      personalityMilestones: [],
      pendingMilestones: [],
      pathChoiceRaised: false,
    },
  };
}

export function marryOwner(s, partnerName) {
  const d = s.dynasty || (s.dynasty = migrateDynasty(s));
  const partner = String(partnerName || "").trim().slice(0, 80);
  assert(partner.length > 0, "اكتب اسم الشريك أولًا.");
  assert(!d.owner.retired && d.owner.age >= 18, "الزواج غير متاح للمالك الحالي.");
  assert(!d.spouse, "المالك متزوج بالفعل.");
  d.spouse = partner;
  return d.spouse;
}

export function haveChild(s, name) {
  const d = s.dynasty || (s.dynasty = migrateDynasty(s));
  assert(d.spouse, "ابدأ بتكوين الأسرة بالزواج؛ قرار الإنجاب يأتي بعده.");
  assert(!d.owner.retired && d.owner.age >= 18 && d.owner.age <= 70, "الإنجاب غير متاح في هذا العمر أو بعد التقاعد.");
  assert(d.children.length < 50, "وصلت الأسرة إلى الحد المدعوم من الأبناء.");
  const child = createDynastyChild(s, { name, age: 0, birthDate: saveDate(s) });
  d.children.push(child);
  return child;
}

function roundStat(value) {
  return Math.round(clamp(value, 0, 100) * 100) / 100;
}

function traitHas(child, trait) {
  return child.traits.includes(trait);
}

function deriveTrait(child) {
  const { talent, discipline, ambition } = child.stats;
  const candidates = [];
  if (child.upbringing === "strict" && discipline < 52) candidates.push("rebellious");
  if (discipline >= 60) candidates.push("hardworking", "leader");
  if (ambition >= 62) candidates.push("ambitious", "arrogant");
  if (talent >= 58) candidates.push("creative");
  if (discipline < 38) candidates.push("shy");
  if (child.relationship >= 70) candidates.push("loyal");
  candidates.push("leader", "hardworking", "ambitious", "creative", "loyal", "shy");
  return candidates.find((trait) => !traitHas(child, trait)) || null;
}

export function formPersonalityTrait(child) {
  child.growth ??= { lastMonth: "", lastAge: child.age, lastStage: child.stage, personalityMilestones: [], pendingMilestones: [], pathChoiceRaised: false };
  child.growth.personalityMilestones ??= [];
  const milestone = [3, 13, 18].find(
    (age) => child.age >= age && !child.growth.personalityMilestones.includes(age),
  );
  if (!milestone || child.traits.length >= 8) return null;
  const trait = deriveTrait(child);
  child.growth.personalityMilestones.push(milestone);
  if (trait) child.traits.push(trait);
  return trait;
}

export function growChild(s, childOrId) {
  const child = typeof childOrId === "string" ? findDynastyChild(s, childOrId) : childOrId;
  assert(child && child.stats && Array.isArray(child.traits), "الطفل غير موجود أو ملفه ناقص.");
  child.growth ??= { lastMonth: "", lastAge: child.age, lastStage: child.stage, personalityMilestones: [], pendingMilestones: [], pathChoiceRaised: false };
  const month = saveDate(s).slice(0, 7);
  if (child.growth.lastMonth === month) return false;
  child.growth.lastMonth = month;
  const styles = {
    balanced: { talent: 0.11, discipline: 0.13, ambition: 0.12 },
    education: { talent: 0.17, discipline: 0.2, ambition: 0.08 },
    football: { talent: 0.27, discipline: 0.13, ambition: 0.17 },
    strict: { talent: 0.07, discipline: 0.28, ambition: 0.03 },
    freedom: { talent: 0.12, discipline: -0.05, ambition: 0.24 },
  };
  const growth = { ...(styles[child.upbringing] || styles.balanced) };
  const ageScale = child.age < 3 ? 0.55 : child.age < 13 ? 1 : child.age < 18 ? 1.12 : 0.65;
  for (const traitId of child.traits) {
    const effects = DYNASTY_TRAITS.find((trait) => trait.id === traitId)?.effects || {};
    for (const key of ["talent", "discipline", "ambition"])
      growth[key] += effects[key] || 0;
    if (traitId === "rebellious" && child.upbringing === "strict")
      growth.discipline += effects.strictDiscipline || 0;
    if (traitId === "leader" || traitId === "loyal")
      child.relationship = roundStat(child.relationship + (effects.relationship || 0));
  }
  child.stats.talent = roundStat(child.stats.talent + growth.talent * ageScale);
  child.stats.discipline = roundStat(child.stats.discipline + growth.discipline * ageScale);
  child.stats.ambition = roundStat(child.stats.ambition + growth.ambition * ageScale);
  if (traitHas(child, "rebellious") && child.upbringing === "strict")
    child.relationship = roundStat(child.relationship - 0.12 * ageScale);
  formPersonalityTrait(child);
  return true;
}

export function setUpbringing(s, childId, style) {
  const child = findDynastyChild(s, childId);
  assert(child && UPBRINGING_IDS.includes(style), "أسلوب التربية غير متاح.");
  child.upbringing = style;
  return style;
}

export function enrollDynastyAcademy(s, childId, position = "CM") {
  const child = findDynastyChild(s, childId);
  assert(child, "الطفل غير موجود أو ملفه ناقص.");
  assert(child.age >= 10 && child.age <= 17, "الالتحاق بالأكاديمية متاح من عمر ١٠ إلى ١٧ سنة.");
  assert(
    child.careerPath === null || child.careerPath === "player",
    "اختار هذا الابن مسارًا خارج كرة القدم.",
  );
  assert(ACADEMY_POSITION_IDS.includes(position), "مركز الأكاديمية غير معروف.");
  assert(!child.academy?.enrolled, "الابن مسجل بالفعل في الأكاديمية.");
  const today = saveDate(s);
  const academy = child.academy || {};
  Object.assign(academy, {
    enrolled: true,
    enteredOn: isoDate(academy.enteredOn) ? academy.enteredOn : today,
    focus: ACADEMY_FOCUS_IDS.includes(academy.focus) ? academy.focus : "balanced",
    position,
    mentorId: typeof academy.mentorId === "string" ? academy.mentorId : null,
    injuryUntil: isoDate(academy.injuryUntil) ? academy.injuryUntil : null,
    form: numberInRange(academy.form, 0, 100, 55),
    rating: numberInRange(
      academy.rating,
      0,
      99,
      clamp(35 + child.stats.talent * 0.38 + child.stats.discipline * 0.12 + (child.age - 10) * 0.8, 25, 99),
    ),
    appearances: integerInRange(academy.appearances, 0, 5000, 0),
    goals: integerInRange(academy.goals, 0, 5000, 0),
    minutes: integerInRange(academy.minutes, 0, 500000, 0),
    trainingSessions: integerInRange(academy.trainingSessions, 0, 5000, 0),
    trialReady: Boolean(academy.trialReady),
    lastTrainingMonth: today.slice(0, 7),
    lastMatchMonth: today.slice(0, 7),
    matches: Array.isArray(academy.matches) ? academy.matches.slice(-5000) : [],
    reports: Array.isArray(academy.reports) ? academy.reports.slice(-100) : [],
  });
  child.academy = academy;
  return academy;
}

export function leaveDynastyAcademy(s, childId) {
  const child = findDynastyChild(s, childId);
  assert(child?.academy?.enrolled, "الابن غير مسجل في الأكاديمية.");
  child.academy.enrolled = false;
  child.academy.lastTrainingMonth = saveDate(s).slice(0, 7);
  child.academy.lastMatchMonth = saveDate(s).slice(0, 7);
  return child.academy;
}

export function setAcademyFocus(s, childId, focus) {
  const child = findDynastyChild(s, childId);
  assert(child?.academy?.enrolled && ACADEMY_FOCUS_IDS.includes(focus), "تركيز الأكاديمية غير متاح.");
  child.academy.focus = focus;
  return focus;
}

export function setAcademyPosition(s, childId, position) {
  const child = findDynastyChild(s, childId);
  assert(child?.academy?.enrolled && ACADEMY_POSITION_IDS.includes(position), "مركز الأكاديمية غير متاح.");
  child.academy.position = position;
  return position;
}

export function setAcademyMentor(s, childId, mentorId) {
  const child = findDynastyChild(s, childId);
  assert(child?.academy?.enrolled, "الابن غير مسجل في الأكاديمية.");
  if (!mentorId) {
    child.academy.mentorId = null;
    return null;
  }
  const mentor = academyMentor(s, mentorId);
  assert(mentor, "المرشد غير متاح في النادي.");
  child.academy.mentorId = mentor.id;
  return mentor;
}

function academyLevel(s) {
  return integerInRange(s.facilities?.find((facility) => facility.id === "academy")?.level, 1, 4, 1);
}

function academyCoachSkill(s) {
  return Array.isArray(s.staff) ? staffSkill(s, "academy") : 0;
}

function runAcademyMatch(s, child, academy, today, mentors) {
  const mentor = mentors.get(academy.mentorId) || null;
  const selectionChance = clamp(
    0.32 + academy.rating * 0.005 + child.stats.discipline * 0.0015 + (mentor ? 0.04 : 0),
    0.35,
    0.94,
  );
  const played = random(s) < selectionChance;
  let minutes = 0;
  let performance = null;
  let goals = 0;
  if (played) {
    minutes = 60 + Math.floor(random(s) * 31);
    performance = Math.round(
      clamp(5.2 + (academy.rating - 55) * 0.035 + (academy.form - 50) * 0.025 + (random(s) - 0.5) * 2.4, 2, 10) * 10,
    ) / 10;
    const goalChance = academy.position === "ST" ? 0.34 : ["LW", "RW", "AM"].includes(academy.position) ? 0.2 : 0.08;
    if (performance >= 5.5 && random(s) < goalChance) goals = 1;
    academy.appearances = Math.min(5000, academy.appearances + 1);
    academy.goals = Math.min(5000, academy.goals + goals);
    academy.minutes = Math.min(500000, academy.minutes + minutes);
    academy.form = numberInRange(academy.form + (performance >= 7 ? 2 : performance < 5 ? -2 : 0.5), 0, 100, 50);
    if (random(s) < 0.012) {
      academy.injuryUntil = addDays(today, 14 + Math.floor(random(s) * 28));
      academy.form = numberInRange(academy.form - 4, 0, 100, 50);
    }
  }
  academy.matches.push({
    date: today,
    played,
    minutes,
    performance,
    goals,
    opponent: 1 + Math.floor(random(s) * 20),
  });
  if (academy.matches.length > 5000) academy.matches.shift();
}

export function academyJourneyDay(s) {
  if (!s.dynasty) return;
  const today = saveDate(s);
  const month = today.slice(0, 7);
  const level = academyLevel(s);
  const coach = academyCoachSkill(s);
  const children = allDynastyChildren(s);
  if (!children.some((child) => child.academy?.enrolled && child.age >= 10)) return;
  const mentors = new Map(availableAcademyMentors(s).map((mentor) => [mentor.id, mentor]));
  for (const child of children) {
    const academy = child.academy;
    if (!academy?.enrolled || child.age < 10) continue;
    if (academy.injuryUntil && academy.injuryUntil < today) academy.injuryUntil = null;
    if (academy.lastTrainingMonth === month) continue;
    academy.lastTrainingMonth = month;
    const injured = academy.injuryUntil && academy.injuryUntil >= today;
    const mentor = mentors.get(academy.mentorId) || null;
    if (!mentor) academy.mentorId = null;
    const mentorBonus = mentor
      ? clamp((mentor.rating - 45) * 0.001 + mentor.appearances / 5000, 0.02, 0.12)
      : 0;
    let gain = 0;
    if (!injured) {
      const focusScale = {
        balanced: 1,
        technical: 1.17,
        physical: 1.08,
        tactical: 1.1,
        leadership: 1.04,
      }[academy.focus] || 1;
      const ageScale = child.age < 13 ? 0.7 : child.age < 18 ? 1.2 : 0.65;
      const traitScale = child.traits.includes("hardworking") ? 1.1 : 1;
      gain = (0.07 + level * 0.035 + coach / 500 + mentorBonus) * focusScale * ageScale * traitScale;
      academy.rating = numberInRange(academy.rating + gain, 0, 99, academy.rating);
      const statFocus = {
        balanced: { talent: 1, discipline: 1, ambition: 1 },
        technical: { talent: 1.7, discipline: 0.8, ambition: 0.8 },
        physical: { talent: 0.8, discipline: 1.7, ambition: 0.8 },
        tactical: { talent: 1.1, discipline: 1.4, ambition: 1 },
        leadership: { talent: 0.8, discipline: 1.2, ambition: 1.5 },
      }[academy.focus] || { talent: 1, discipline: 1, ambition: 1 };
      for (const key of ["talent", "discipline", "ambition"])
        child.stats[key] = roundStat(child.stats[key] + gain * statFocus[key] * 0.16);
      academy.trainingSessions = Math.min(5000, academy.trainingSessions + 1);
    }
    if (child.age >= 12 && academy.lastMatchMonth !== month) {
      academy.lastMatchMonth = month;
      if (!injured) runAcademyMatch(s, child, academy, today, mentors);
      else {
        academy.matches.push({ date: today, played: false, minutes: 0, performance: null, goals: 0, opponent: 1 });
        if (academy.matches.length > 5000) academy.matches.shift();
      }
    }
    academy.trialReady = child.age >= 16 && academy.rating >= 60;
    academy.reports.push({
      date: today,
      focus: academy.focus,
      rating: academy.rating,
      form: academy.form,
      gain: Math.round(gain * 100) / 100,
      appearances: academy.appearances,
      goals: academy.goals,
    });
    if (academy.reports.length > 100) academy.reports.shift();
  }
}

export function dynastyGrowthDay(s) {
  if (!s.dynasty) return;
  const today = saveDate(s);
  const month = today.slice(0, 7);
  for (const child of allDynastyChildren(s)) {
    const previousAge = child.age;
    const previousStage = child.stage;
    child.age = ageAt({ birthDate: child.birthDate }, today);
    child.stage = stageForAge(child.age);
    child.growth ??= { lastMonth: month, lastAge: previousAge, lastStage: previousStage, personalityMilestones: [], pendingMilestones: [], pathChoiceRaised: false };
    child.growth.pendingMilestones ??= [];
    if (child.age !== previousAge) child.growth.lastAge = child.age;
    if (child.stage !== previousStage) {
      child.growth.lastStage = child.stage;
      if (!child.growth.pendingMilestones.includes(child.stage))
        child.growth.pendingMilestones.push(child.stage);
    }
    if (child.age >= 15 && !child.careerPath && !child.growth.pathChoiceRaised) {
      child.growth.pathChoiceRaised = true;
      child.growth.pendingMilestones.push("career-path-choice");
    }
    if (child.age >= 18 && child.careerPath === null && child.growth.pendingMilestones.includes("career-path-choice"))
      child.growth.pendingMilestones = child.growth.pendingMilestones.filter((item) => item !== "career-path-choice");
    growChild(s, child);
  }
  s.dynasty.lastProcessedMonth = month;
}

export function initDynasty(s, { ownerAge } = {}) {
  const today = saveDate(s);
  const age = integerInRange(ownerAge, 18, 120, DEFAULT_OWNER_AGE);
  const birthDate = dateForAge(today, age);
  const familyName = String(s.familyName || "").trim() ||
    String(s.owner || "").trim().split(/\s+/).filter(Boolean).at(-1) || "Club";
  return {
    schema: DYNASTY_SCHEMA,
    generation: 1,
    owner: {
      name: String(s.owner || "مالك النادي").slice(0, 80),
      age,
      birthDate,
      health: 100,
      retired: false,
      since: today,
      retirementAge: 65,
      forcedRetirementAge: 85,
      lastRetirementOfferAge: 0,
    },
    familyName,
    spouse: null,
    children: [],
    heirId: null,
    ownerRoute: null,
    ownerTraits: [],
    ownerBonuses: { playerRelations: 0, sponsorNegotiation: 0, clubFame: 0, autonomy: 0 },
    inheritanceBonus: 0,
    personalWealth: null,
    titlesWon: 0,
    legacyScore: 0,
    legacyHistory: [],
    familyArchive: [],
    publicBalance: 50,
    balanceHistory: [],
    shirtSales: 0,
    fanConfidence: 60,
    legalPrelude: { status: "none", claimantId: null, preparedOn: null },
    events: [],
    eventCooldowns: {},
    lastEventMonth: null,
    lastSiblingMonth: null,
    lastProcessedMonth: null,
    lastOwnerMonth: null,
    lastLegacyMonth: null,
    retirementOffer: null,
  };
}

export function migrateDynasty(s) {
  const today = saveDate(s);
  const context = today === s.date ? s : { ...s, date: today };
  const existing = s.dynasty && typeof s.dynasty === "object" ? s.dynasty : {};
  const sourceChildren = existingChildren(s, existing);
  const age = existingOwnerAge(s, existing);
  const ownerSource = existing.owner && typeof existing.owner === "object"
    ? existing.owner
    : {};
  const birthday = isoDate(ownerSource.birthDate) && ownerSource.birthDate <= today
    ? ownerSource.birthDate
    : dateForAge(today, age);
  const actualAge = ageAt({ birthDate: birthday }, today);
  const childIds = new Set();
  const children = sourceChildren.map((child, index) =>
    normalizeChild(context, child, index, childIds, integerInRange(existing.generation, 1, Number.MAX_SAFE_INTEGER, 1)),
  );
  let heirId = existing.heirId || s.heirId || s.inheritorId || null;
  if (!heirId) heirId = children.find((child) => child.isHeir)?.id || null;
  if (!children.some((child) => child.id === heirId)) heirId = null;
  for (const child of children) child.isHeir = child.id === heirId;
  const defaults = initDynasty(context, { ownerAge: actualAge });
  const retirementAge = integerInRange(ownerSource.retirementAge, 50, 80, 65);
  const forcedRetirementAge = Math.max(
    retirementAge + 1,
    integerInRange(ownerSource.forcedRetirementAge, 75, 120, 85),
  );
  const oldBonuses = existing.ownerBonuses && typeof existing.ownerBonuses === "object"
    ? existing.ownerBonuses
    : {};
  const existingEvents = Array.isArray(existing.events)
    ? structuredClone(existing.events).filter((event) => event && typeof event === "object")
    : [];
  return {
    ...defaults,
    ...existing,
    schema: DYNASTY_SCHEMA,
    generation: integerInRange(existing.generation, 1, Number.MAX_SAFE_INTEGER, 1),
    owner: {
      ...defaults.owner,
      ...ownerSource,
      name: String(ownerSource.name || (typeof s.owner === "string" ? s.owner : s.owner?.name) || "مالك النادي").slice(0, 80),
      age: actualAge,
      birthDate: birthday,
      health: numberInRange(ownerSource.health, 0, 100, 100),
      retired: Boolean(ownerSource.retired),
      since: isoDate(ownerSource.since) ? ownerSource.since : today,
      retirementAge,
      forcedRetirementAge,
      lastRetirementOfferAge: integerInRange(ownerSource.lastRetirementOfferAge, 0, 120, 0),
    },
    familyName: String(existing.familyName || s.familyName || defaults.familyName).trim().slice(0, 80) || defaults.familyName,
    spouse: existingSpouse(s, existing),
    children,
    heirId,
    ownerRoute: CAREER_PATH_IDS.includes(existing.ownerRoute) ? existing.ownerRoute : null,
    ownerTraits: normalizeTraits(existing.ownerTraits),
    ownerBonuses: {
      ...defaults.ownerBonuses,
      ...Object.fromEntries(
        ["playerRelations", "sponsorNegotiation", "clubFame", "autonomy"].map((key) => [
          key,
          numberInRange(oldBonuses[key], 0, 100, 0),
        ]),
      ),
    },
    inheritanceBonus: numberInRange(existing.inheritanceBonus, 0, 20, 0),
    personalWealth: Number.isFinite(existing.personalWealth) && existing.personalWealth >= 0
      ? existing.personalWealth
      : null,
    titlesWon: integerInRange(existing.titlesWon, 0, 1000000, 0),
    legacyScore: integerInRange(existing.legacyScore, 0, 1000, 0),
    legacyHistory: Array.isArray(existing.legacyHistory) ? existing.legacyHistory.slice(-100) : [],
    familyArchive: Array.isArray(existing.familyArchive) ? existing.familyArchive.slice(-100) : [],
    publicBalance: numberInRange(existing.publicBalance, 0, 100, 50),
    balanceHistory: Array.isArray(existing.balanceHistory) ? existing.balanceHistory.slice(-100) : [],
    shirtSales: integerInRange(existing.shirtSales, 0, Number.MAX_SAFE_INTEGER, 0),
    fanConfidence: numberInRange(existing.fanConfidence, 0, 100, 60),
    legalPrelude: {
      status: ["none", "seeded", "prepared", "settled"].includes(existing.legalPrelude?.status)
        ? existing.legalPrelude.status
        : "none",
      claimantId: typeof existing.legalPrelude?.claimantId === "string"
        ? existing.legalPrelude.claimantId
        : null,
      preparedOn: isoDate(existing.legalPrelude?.preparedOn) ? existing.legalPrelude.preparedOn : null,
    },
    events: existingEvents,
    eventCooldowns: existing.eventCooldowns && typeof existing.eventCooldowns === "object"
      ? Object.fromEntries(
          Object.entries(existing.eventCooldowns)
            .filter(([key, value]) => SAFE_ID.test(key) && isoDate(value))
            .slice(-100),
        )
      : {},
    lastEventMonth: validMonth(existing.lastEventMonth) ? existing.lastEventMonth : null,
    lastSiblingMonth: validMonth(existing.lastSiblingMonth) ? existing.lastSiblingMonth : null,
    lastProcessedMonth: validMonth(existing.lastProcessedMonth)
      ? existing.lastProcessedMonth
      : null,
    lastOwnerMonth: validMonth(existing.lastOwnerMonth)
      ? existing.lastOwnerMonth
      : null,
    lastLegacyMonth: validMonth(existing.lastLegacyMonth)
      ? existing.lastLegacyMonth
      : null,
    retirementOffer:
      existing.retirementOffer &&
      SAFE_ID.test(existing.retirementOffer.id) &&
      isoDate(existing.retirementOffer.openedOn) &&
      typeof existing.retirementOffer.forced === "boolean"
        ? {
            id: existing.retirementOffer.id,
            openedOn: existing.retirementOffer.openedOn,
            forced: existing.retirementOffer.forced,
          }
        : null,
  };
}

export function calculateLegacyScore(s) {
  const d = s?.dynasty;
  if (!d) return 0;
  const descendants = allDynastyChildren(s);
  const resolvedEvents = (d.events || []).filter((event) => event.status === "resolved").length;
  const chosenPaths = descendants.filter((child) => child.careerPath).length;
  const reputation = Number.isFinite(s.reputation) ? s.reputation : 0;
  const score =
    Math.min(200, d.generation * 20) +
    Math.min(250, (d.titlesWon || 0) * 25) +
    Math.min(100, descendants.length * 4) +
    Math.min(120, resolvedEvents * 2) +
    Math.min(80, chosenPaths * 8) +
    (d.publicBalance || 0) * 0.35 +
    (d.fanConfidence || 0) * 0.2 +
    reputation * 0.25 +
    Math.min(50, Math.log10(Math.max(0, d.shirtSales || 0) + 1) * 8) +
    Math.min(150, (d.familyArchive || []).length * 10);
  return Math.round(clamp(score, 0, 1000));
}

export function recordLegacyScore(s, reason = "monthly") {
  const d = s.dynasty;
  assert(d, "ملف الإرث غير متاح.");
  const score = calculateLegacyScore(s);
  d.legacyScore = score;
  const snapshot = {
    date: saveDate(s),
    generation: d.generation,
    owner: d.owner.name,
    score,
    reason: String(reason || "monthly").slice(0, 40),
  };
  const previous = d.legacyHistory.at(-1);
  if (
    previous?.date === snapshot.date &&
    previous?.generation === snapshot.generation &&
    previous?.owner === snapshot.owner
  ) {
    Object.assign(previous, snapshot);
  } else {
    d.legacyHistory.push(snapshot);
  }
  if (d.legacyHistory.length > 100) d.legacyHistory.splice(0, d.legacyHistory.length - 100);
  return score;
}

export function setDynastyHeir(s, childId) {
  const d = s.dynasty;
  const child = d?.children.find((person) => person.id === childId);
  assert(child, "يمكن تعيين وريث واحد من أبناء المالك الحالي.");
  assert(!child.excludedFromSuccession, "أُبعد هذا الابن عن الخلافة.");
  for (const sibling of d.children) sibling.isHeir = sibling.id === child.id;
  child.legalClaim = true;
  d.heirId = child.id;
  d.legalPrelude = {
    status: "prepared",
    claimantId: child.id,
    preparedOn: saveDate(s),
  };
  return child;
}

export function setSuccessionEligibility(s, childId, eligible) {
  const d = s.dynasty;
  const child = d?.children.find((person) => person.id === childId);
  assert(child && typeof eligible === "boolean", "بيانات أهلية الخلافة غير صالحة.");
  const disputedClaim = !eligible && child.legalClaim;
  child.excludedFromSuccession = !eligible;
  child.legalClaim = eligible;
  if (!eligible && d.heirId === child.id) {
    d.heirId = null;
    child.isHeir = false;
  }
  d.legalPrelude = {
    status: d.heirId ? "prepared" : "seeded",
    claimantId: d.heirId,
    preparedOn: d.heirId ? saveDate(s) : null,
  };
  if (disputedClaim)
    fileLegalCase(s, "succession", {
      source: "succession-exclusion",
      sourceId: `succession-${child.id}`,
      claimantId: child.id,
      severity: 2,
    });
  return child.excludedFromSuccession;
}

function legacyMemberSummary(child) {
  return {
    id: child.id,
    name: child.name,
    age: child.age,
    generation: child.generation,
    careerPath: child.careerPath,
    traits: [...child.traits],
    playerId: child.playerId,
    descendantCount: allDescendantsCount(child.offspring),
  };
}

function allDescendantsCount(children) {
  let total = 0;
  for (const child of children || []) total += 1 + allDescendantsCount(child.offspring);
  return total;
}

function distantRelative(s) {
  const d = s.dynasty;
  const person = createDynastyChild(s, {
    name: `${d.familyName} Cousin`,
    age: 38,
    stats: { talent: 55, discipline: 62, ambition: 48 },
  });
  person.careerPath = "business";
  person.education = "Family governance";
  person.relationship = 22;
  person.legalClaim = true;
  person.isHeir = true;
  return person;
}

function retireCurrentOwner(s) {
  const d = s.dynasty;
  const eligible = d.children
    .filter((child) => child.age >= 18 && !child.excludedFromSuccession)
    .sort((a, b) => {
      if (a.id === b.id) return 0;
      const aNamedHeir = Number(a.id === d.heirId);
      const bNamedHeir = Number(b.id === d.heirId);
      if (aNamedHeir !== bNamedHeir) return bNamedHeir - aNamedHeir;
      if (a.legalClaim !== b.legalClaim) return Number(b.legalClaim) - Number(a.legalClaim);
      if (a.relationship !== b.relationship) return b.relationship - a.relationship;
      if (a.jealousy !== b.jealousy) return a.jealousy - b.jealousy;
      if (a.stats.discipline !== b.stats.discipline) return b.stats.discipline - a.stats.discipline;
      return a.id.localeCompare(b.id);
    });
  const heir = eligible[0] || distantRelative(s);
  const usedDistantRelative = eligible.length === 0;
  heir.isHeir = true;
  heir.legalClaim = true;

  const previousScore = recordLegacyScore(s, "retirement");
  const archive = {
    date: saveDate(s),
    generation: d.generation,
    owner: d.owner.name,
    ownerAge: d.owner.age,
    ownerRoute: d.ownerRoute,
    retired: true,
    legacyScore: previousScore,
    successorId: heir.id,
    successorName: heir.name,
    successionSource: usedDistantRelative ? "distant-relative" : "family",
    members: d.children.map(legacyMemberSummary),
  };
  d.familyArchive.push(archive);
  if (d.familyArchive.length > 100) d.familyArchive.shift();

  const nextGeneration = Math.min(
    Number.MAX_SAFE_INTEGER,
    Math.max(d.generation + 1, heir.generation + 1),
  );
  const nextChildren = (heir.offspring || []).slice(0, 50);
  for (const child of nextChildren) {
    child.parentId = null;
    child.generation = nextGeneration;
    child.isHeir = false;
    child.excludedFromSuccession = false;
    child.legalClaim = false;
  }
  const nextOwnerAge = ageAt({ birthDate: heir.birthDate }, saveDate(s));
  d.generation = nextGeneration;
  d.children = nextChildren;
  d.heirId = null;
  d.owner = {
    name: heir.name,
    age: nextOwnerAge,
    birthDate: heir.birthDate,
    health: 100,
    retired: false,
    since: saveDate(s),
    retirementAge: 65,
    forcedRetirementAge: 85,
    lastRetirementOfferAge: 0,
  };
  d.spouse = heir.spouse || null;
  d.ownerRoute = CAREER_PATH_IDS.includes(heir.careerPath) ? heir.careerPath : null;
  d.ownerTraits = [...heir.traits];
  d.inheritanceBonus = Math.min(20, (d.inheritanceBonus || 0) + 1 + Math.floor(previousScore / 250));
  d.legalPrelude = { status: "none", claimantId: null, preparedOn: null };
  d.retirementOffer = null;
  const month = saveDate(s).slice(0, 7);
  d.lastOwnerMonth = month;
  d.lastLegacyMonth = month;
  d.lastSiblingMonth = month;
  d.lastProcessedMonth = month;
  s.owner = heir.name;
  recordLegacyScore(s, "succession");
  message(s, {
    title: "جيل جديد يتولى إدارة النادي",
    body: usedDistantRelative
      ? "انتقلت الإدارة إلى قريب بعيد من العائلة، مع حفظ نقاط الإرث وسجل الأجيال لمواصلة السلالة."
      : "انتقلت الإدارة إلى الوريث، مع حفظ سجل الأسرة ونقاط الإرث لمواصلة الأجيال.",
    category: "management",
    kind: "dynasty-succession",
    ref: heir.id,
  });
  return { heir, usedDistantRelative, archive };
}

export function dynastyLifeDay(s) {
  const d = s.dynasty;
  if (!d) return null;
  const today = saveDate(s);
  const month = today.slice(0, 7);
  const owner = d.owner;
  owner.age = ageAt({ birthDate: owner.birthDate }, today);
  if (d.lastOwnerMonth !== month) {
    d.lastOwnerMonth = month;
    if (owner.age >= 80) owner.health = roundStat(owner.health - 0.35);
    else if (owner.age >= 70) owner.health = roundStat(owner.health - 0.12);
  }
  if (d.lastLegacyMonth !== month) {
    recordLegacyScore(s, "monthly");
    d.lastLegacyMonth = month;
  }
  const due =
    (owner.age >= owner.retirementAge && owner.age > owner.lastRetirementOfferAge) ||
    owner.health <= 0;
  if (!owner.retired && due && !d.retirementOffer) {
    const forced = owner.age >= owner.forcedRetirementAge || owner.health <= 0;
    const offer = { id: uid(s, "dynasty-retirement"), openedOn: today, forced };
    d.retirementOffer = offer;
    message(s, {
      title: "موعد تقاعد مالك النادي",
      body: forced
        ? "بلغ المالك سن التقاعد الإلزامي. اختر وريثًا مؤهلًا، أو ستتولى الخلافة شخصية من فرع بعيد للعائلة."
        : "وصل المالك إلى سن التقاعد. يمكنك نقل الإرث الآن أو تمديد فترة الإدارة سنة واحدة.",
      category: "management",
      required: true,
      kind: "dynasty-retirement",
      ref: offer.id,
      priority: forced ? "urgent" : "high",
    });
    return offer;
  }
  return null;
}

export function resolveRetirementOffer(s, offerId, decision) {
  const d = s.dynasty;
  const offer = d?.retirementOffer;
  assert(offer && offer.id === offerId, "عرض التقاعد غير مفتوح.");
  if (decision === "continue") {
    assert(!offer.forced, "بلغ المالك سن التقاعد الإلزامي.");
    d.owner.retirementAge = Math.min(
      d.owner.forcedRetirementAge - 1,
      Math.max(d.owner.retirementAge + 1, d.owner.age + 1),
    );
    d.owner.lastRetirementOfferAge = d.owner.age;
    d.retirementOffer = null;
    closeThread(s, offer.id);
    return { continued: true, owner: d.owner };
  }
  assert(decision === "retire", "قرار التقاعد غير صالح.");
  const succession = retireCurrentOwner(s);
  closeThread(s, offer.id);
  return { continued: false, ...succession };
}
