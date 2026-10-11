import { CLUBS } from "../data/catalog.js";
import { extendedClub } from "../data/expandedCatalog.js";
import {
  ULTRAS_DEMANDS,
  ULTRAS_EVENT_CATALOG,
  availableUltrasEvents,
  eventFixture,
  upcomingUltrasFixtures,
} from "../data/ultrasEvents.js";
import { addDays, assert, clamp, daysBetween, random, uid } from "../core/utils.js";
import { post } from "./finance.js";
import { closeThread, message } from "./inbox.js";
import { adjustClubSupport } from "./politics/state.js";
import { addSuspicion } from "./blackFiles.js";
import { dismissCoach, coachYearsLeft } from "./clubManagement.js";
import { projectQuote, startProject } from "./facilities.js";

const HISTORY_LIMIT = 120;
const MOOD_HISTORY_LIMIT = 24;
const DEMAND_KINDS = ["ticket", "star", "coach", "youth"];
const COLORS = {
  red: { ar: "الحمراء", en: "Red", fr: "Rouge" },
  blue: { ar: "الزرقاء", en: "Blue", fr: "Bleu" },
  green: { ar: "الخضراء", en: "Green", fr: "Vert" },
  gold: { ar: "الذهبية", en: "Gold", fr: "Or" },
  white: { ar: "البيضاء", en: "White", fr: "Blanc" },
  black: { ar: "السوداء", en: "Black", fr: "Noir" },
};
const PERSONAS = [
  { id: "diplomat", ar: "دبلوماسي هادئ", en: "Calm diplomat", fr: "Diplomate calme" },
  { id: "organizer", ar: "منظم تكتيكي", en: "Tactical organizer", fr: "Organisateur tactique" },
  { id: "firebrand", ar: "صوت حماسي", en: "Passionate firebrand", fr: "Orateur passionné" },
  { id: "singer", ar: "قائد أهازيج", en: "Chant leader", fr: "Chef de chant" },
];
const locale = (value, lang = "ar") =>
  typeof value === "string" ? value : value?.[lang] || value?.en || value?.ar || "";
const language = (save) => ["ar", "en", "fr"].includes(save?.preferences?.language)
  ? save.preferences.language
  : "ar";
const localizedText = (save, ar, en, fr) => locale({ ar, en, fr }, language(save));
const ownGroup = (save) => save?.ultras?.groups?.[save.clubId] || null;
const normalizedName = (value) => String(value || "").trim().toLocaleLowerCase();
const isArabic = (value) => /[\u0600-\u06ff]/.test(String(value || ""));

function hash(value) {
  let h = 2166136261;
  for (const character of String(value || "")) {
    h ^= character.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function stableWord(id) {
  return String(id || "club")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Club";
}

function colorKey(color = "") {
  const hex = String(color).replace("#", "");
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) return "blue";
  const full = hex.length === 3 ? [...hex].map((x) => x + x).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (r > 205 && g > 205 && b > 205) return "white";
  if (Math.max(r, g, b) < 70) return "black";
  if (r > g * 1.35 && r > b * 1.25) return "red";
  if (g > r * 1.2 && g > b * 1.1) return "green";
  if (r > 170 && g > 115 && b < 115) return "gold";
  return "blue";
}

function namesForClub(clubId, club = {}) {
  const fallback = stableWord(clubId);
  const sourceName = club.nameAr || club.name || club.short || fallback;
  const shortAr = club.shortAr || (isArabic(club.short) ? club.short : "") ||
    (isArabic(sourceName) ? sourceName : fallback);
  const english = club.nameEn || club.wiki || (!isArabic(club.short) && club.short) ||
    (!isArabic(club.name) && club.name) || fallback;
  const french = club.nameFr || club.wiki || english;
  const citySource = club.city || "";
  const cityAr = club.cityAr || (isArabic(citySource) ? citySource : shortAr);
  const cityEn = club.cityEn || (!isArabic(citySource) ? citySource : "") || english;
  const cityFr = club.cityFr || (!isArabic(citySource) ? citySource : "") || french;
  const color = COLORS[colorKey(club.color)];
  const year = 1950 + (hash(clubId) % 70);
  const templates = [
    {
      ar: `ألتراس ${shortAr}`,
      en: `Ultras ${english}`,
      fr: `Ultras ${french}`,
    },
    {
      ar: `أبناء ${cityAr}`,
      en: `${cityEn} Boys`,
      fr: `Les Enfants de ${cityFr}`,
    },
    {
      ar: `مدرج ${color.ar}`,
      en: `${color.en} End`,
      fr: `Virage ${color.fr}`,
    },
    {
      ar: `رابطة ${shortAr}`,
      en: `${english} Supporters`,
      fr: `Supporters ${french}`,
    },
  ];
  return { ...templates[hash(clubId) % templates.length], year };
}

/** Generate deterministic, collision-free AR/EN/FR names for a set of clubs. */
export function generateUniqueUltrasNames(clubIds, clubsById = {}) {
  const ids = [...new Set((clubIds || []).filter(Boolean))].map(String).sort();
  const used = { ar: new Set(), en: new Set(), fr: new Set() };
  const names = {};
  for (const clubId of ids) {
    const club = typeof clubsById === "function"
      ? clubsById(clubId)
      : clubsById?.[clubId] || CLUBS.find((entry) => entry.id === clubId) || extendedClub(clubId) || {};
    const base = namesForClub(clubId, club);
    let candidate = base;
    let suffix = (hash(clubId).toString(36).slice(-4) || "club").toUpperCase();
    let attempt = 0;
    const collides = (entry) => ["ar", "en", "fr"].some((lang) =>
      used[lang].has(normalizedName(entry[lang])),
    );
    while (collides(candidate)) {
      const tag = attempt++ ? `${suffix}-${attempt}` : suffix;
      candidate = {
        ...base,
        ar: `${base.ar} · ${tag}`,
        en: `${base.en} · ${tag}`,
        fr: `${base.fr} · ${tag}`,
      };
    }
    names[clubId] = candidate;
    for (const lang of ["ar", "en", "fr"]) used[lang].add(normalizedName(candidate[lang]));
  }
  return names;
}

export function supporterClubIds(save) {
  const ids = new Set(CLUBS.map((club) => club.id));
  const addFixture = (fixture) => {
    if (fixture?.home) ids.add(fixture.home);
    if (fixture?.away) ids.add(fixture.away);
  };
  if (save?.expansion) {
    for (const division of save.expansion.divisions || [])
      for (const clubId of division.clubs || []) ids.add(clubId);
    for (const playoff of save.expansion.playoffs || [])
      for (const clubId of playoff.clubs || []) ids.add(clubId);
    for (const cup of save.expansion.cups || []) {
      for (const clubId of cup.entrants || []) ids.add(clubId);
      for (const clubId of cup.alive || []) ids.add(clubId);
      for (const fixture of [
        ...(cup.fixtures || []),
        ...(cup.pendingMatches || []),
        ...(cup.results || []),
      ]) addFixture(fixture);
      if (cup.winner) ids.add(cup.winner);
    }
  } else {
    for (const row of save?.table || []) if (row.clubId) ids.add(row.clubId);
    for (const fixture of [...(save?.fixtures || []), ...(save?.friendlies || [])])
      addFixture(fixture);
  }
  if (save?.clubId) ids.add(save.clubId);
  return [...ids].filter(Boolean).sort();
}

function newGroup(clubId, name, save) {
  const code = hash(clubId);
  const persona = PERSONAS[code % PERSONAS.length];
  const short = namesForClub(clubId, extendedClub(clubId) || CLUBS.find((club) => club.id === clubId) || {}).en;
  return {
    clubId,
    name,
    capo: {
      name: {
        ar: `كابو ${name.ar.replace(/^(ألتراس|أبناء|مدرج|رابطة)\s*/, "")}`,
        en: `Capo ${short}`,
        fr: `Capo ${short}`,
      },
      personality: { id: persona.id, ar: persona.ar, en: persona.en, fr: persona.fr },
      confidence: 58 + (code % 25),
    },
    mood: 66 + (code % 18),
    boycottUntil: null,
    chantStrikeUntil: null,
    protestUntil: null,
    awayFixtureId: null,
    awayUntil: null,
    tifoFixtureId: null,
    tifoCount: 0,
    banners: 2 + (code % 5),
    bannersStolen: 0,
    capoAnniversaryMonth: 1 + (code % 12),
    capoAnniversaryDay: 1 + ((code >>> 5) % 28),
    lastIncident: null,
    stadiumSanctionUntil: null,
    demand: null,
    demandCursor: code % DEMAND_KINDS.length,
    lastOwnerActionDate: save?.date || "2026-01-01",
    lastResult: null,
    moodHistory: [],
    flagsRestored: false,
    familySection: false,
  };
}

export function initializeUltras(save) {
  const ids = supporterClubIds(save);
  const names = generateUniqueUltrasNames(ids);
  const groups = Object.fromEntries(ids.map((clubId) => [clubId, newGroup(clubId, names[clubId], save)]));
  save.ultras = {
    schema: 1,
    groups,
    history: [],
    sanctions: [],
    pendingEvent: null,
    nextEventDate: addDays(save.date, 9),
    nextDemandDate: addDays(save.date, 45),
    createdAt: save.date,
  };
  return save.ultras;
}

export function ensureUltras(save) {
  if (!save?.ultras || save.ultras.schema !== 1 || !save.ultras.groups)
    return initializeUltras(save);
  const system = save.ultras;
  system.history ||= [];
  system.sanctions ||= [];
  system.pendingEvent ??= null;
  system.nextEventDate ||= addDays(save.date, 9);
  system.nextDemandDate ||= addDays(save.date, 45);
  const missing = supporterClubIds(save).filter((clubId) => !system.groups[clubId]);
  if (missing.length) {
    const used = Object.fromEntries(["ar", "en", "fr"].map((lang) => [
      lang,
      new Set(Object.values(system.groups).map((group) => normalizedName(group.name?.[lang]))),
    ]));
    for (const clubId of missing) {
      const base = namesForClub(
        clubId,
        extendedClub(clubId) || CLUBS.find((club) => club.id === clubId) || {},
      );
      const name = { ar: base.ar, en: base.en, fr: base.fr };
      const suffix = (hash(clubId).toString(36).slice(-4) || "club").toUpperCase();
      let attempt = 0;
      while (["ar", "en", "fr"].some((lang) => used[lang].has(normalizedName(name[lang])))) {
        const tag = attempt++ ? `${suffix}-${attempt}` : suffix;
        name.ar = `${base.ar} · ${tag}`;
        name.en = `${base.en} · ${tag}`;
        name.fr = `${base.fr} · ${tag}`;
      }
      for (const lang of ["ar", "en", "fr"]) used[lang].add(normalizedName(name[lang]));
      system.groups[clubId] = newGroup(clubId, name, save);
    }
  }
  return system;
}

export const ultrasGroup = (save, clubId = save?.clubId) =>
  save?.ultras?.groups?.[clubId] || null;

export function moodLevel(value) {
  if (value >= 85) return "love";
  if (value >= 68) return "happy";
  if (value >= 45) return "neutral";
  if (value >= 25) return "angry";
  return "rebellious";
}

function updateBoycott(group, save) {
  if (group.mood < 25) {
    if (!group.boycottUntil || group.boycottUntil < save.date)
      group.boycottUntil = addDays(save.date, 14);
  } else if (group.mood >= 38) {
    group.boycottUntil = null;
  }
  if (group.mood < 20 && group.chantStrikeUntil === null)
    group.chantStrikeUntil = addDays(save.date, 10);
  if (group.mood >= 42) group.chantStrikeUntil = null;
}

export function setSupporterMood(save, clubId, delta, reason = "club-action") {
  const group = ultrasGroup(save, clubId);
  if (!group || !Number.isFinite(delta)) return null;
  const before = group.mood;
  group.mood = clamp(Math.round(before + delta), 0, 100);
  const applied = group.mood - before;
  if (!applied) return group.mood;
  group.moodHistory ||= [];
  group.moodHistory.unshift({ date: save.date, delta: applied, reason: String(reason).slice(0, 50) });
  group.moodHistory = group.moodHistory.slice(0, MOOD_HISTORY_LIMIT);
  updateBoycott(group, save);
  if (clubId === save.clubId) {
    save.fanSupport = clamp((save.fanSupport || 0) + Math.sign(applied) * Math.min(2, Math.ceil(Math.abs(applied) / 7)), 10, 100);
    if (save.politics?.clubs?.some((club) => club.clubId === clubId)) {
      try {
        adjustClubSupport(save, clubId, applied / 16, `ultras-${String(reason).slice(0, 50)}`);
      } catch { /* some legacy maps intentionally omit non-league rivals */ }
    }
  }
  return group.mood;
}

export function fanAttendanceMultiplier(save, clubId = save?.clubId, date = save?.date) {
  const group = ultrasGroup(save, clubId);
  if (!group) return 1;
  let factor = 1;
  if (group.boycottUntil && group.boycottUntil >= date) factor *= 0.56;
  else if (group.mood < 25) factor *= 0.7;
  else if (group.mood < 40) factor *= 0.84;
  else if (group.mood < 55) factor *= 0.93;
  else if (group.mood >= 88) factor *= 1.035;
  if (group.chantStrikeUntil && group.chantStrikeUntil >= date) factor *= 0.9;
  if (group.protestUntil && group.protestUntil >= date) factor *= 0.9;
  if (group.stadiumSanctionUntil && group.stadiumSanctionUntil >= date) factor *= 0.72;
  return clamp(factor, 0.25, 1.05);
}

export function supporterMatchBonus(save, clubId, fixture, isHome) {
  const group = ultrasGroup(save, clubId);
  if (!group || !fixture) return 0;
  let bonus = 0;
  if (isHome && group.boycottUntil && group.boycottUntil >= fixture.date) bonus -= 1.25;
  if (isHome && group.mood <= 35) bonus -= 0.75;
  if (isHome && group.mood >= 85) bonus += 0.45;
  if (isHome && group.tifoFixtureId === fixture.id) bonus += 0.85;
  if (!isHome && group.awayFixtureId === fixture.id && group.awayUntil >= fixture.date) bonus += 0.75;
  if (!isHome && group.mood >= 90) bonus += 0.2;
  return clamp(bonus, -2, 1.3);
}

export function recordSupporterResult(save, fixture) {
  const groups = save?.ultras?.groups;
  if (!groups || !fixture?.home || !fixture?.away) return null;
  const home = groups[fixture.home];
  const away = groups[fixture.away];
  if (!home || !away) return null;
  const homeWon = fixture.homeGoals > fixture.awayGoals;
  const awayWon = fixture.awayGoals > fixture.homeGoals;
  const derby = Boolean(fixture.isDerby);
  const margin = Math.abs((fixture.homeGoals || 0) - (fixture.awayGoals || 0));
  const swing = derby ? 2 : 0;
  setSupporterMood(save, fixture.home, homeWon ? 7 + swing : awayWon ? -7 - swing : 1, `match-${homeWon ? "win" : awayWon ? "loss" : "draw"}`);
  setSupporterMood(save, fixture.away, awayWon ? 7 + swing : homeWon ? -7 - swing : 1, `match-${awayWon ? "win" : homeWon ? "loss" : "draw"}`);
  home.lastResult = { date: save.date, outcome: homeWon ? "win" : awayWon ? "loss" : "draw", opponent: fixture.away };
  away.lastResult = { date: save.date, outcome: awayWon ? "win" : homeWon ? "loss" : "draw", opponent: fixture.home };
  for (const [clubId, group, won] of [[fixture.home, home, homeWon], [fixture.away, away, awayWon]]) {
    if (won && (derby || fixture.competition || margin >= 3)) group.lastBigWinDate = save.date;
    if (derby) group.lastDerbyDate = save.date;
    if (group.tifoFixtureId === fixture.id) {
      group.tifoFixtureId = null;
      group.tifoCount = (group.tifoCount || 0) + 1;
      group.lastTifoDate = save.date;
    }
    if (group.awayFixtureId === fixture.id) {
      group.awayFixtureId = null;
      group.awayUntil = null;
    }
    if (clubId === save.clubId && !won && group.mood <= 38) {
      for (const player of save.players.filter((person) => person.clubId === save.clubId && person.status === "active"))
        player.morale = clamp(player.morale - 1, 0, 100);
    }
  }
  return { home: home.mood, away: away.mood };
}

export function recordTicketPriceChange(save, previous, next) {
  const group = ownGroup(save);
  if (!group || previous === next) return group;
  const change = next - previous;
  const impact = Math.min(16, Math.ceil(Math.abs(change) / 18));
  setSupporterMood(save, save.clubId, change > 0 ? -impact : impact, "ticket-price");
  group.lastOwnerActionDate = save.date;
  group.lastTicketPrice = next;
  group.lastTicketChangeDate = save.date;
  if (change > 0 && next >= 180) group.boycottUntil = addDays(save.date, 7);
  return group;
}

function mediaPulse(save, kind, { followers = 1200, engagement = 2, title = null, body = null } = {}) {
  const social = save.staffCorp?.social;
  if (social) {
    social.followers = Math.max(0, Math.round((social.followers || 0) + followers));
    social.engagement = clamp((social.engagement || 0) + engagement, 0, 100);
    social.posts = [{ kind: `ultras-${kind}`, date: save.date }].concat(social.posts || []).slice(0, 20);
  }
  if (title && save.press?.news) {
    save.press.news.unshift({ date: save.date, title: locale(title, language(save)), type: localizedText(save, "الجماهير", "Supporters", "Supporters") });
    save.press.news = save.press.news.slice(0, 100);
  }
  if (title && body) message(save, { title: locale(title, language(save)), body: locale(body, language(save)), category: "business" });
}

function pushHistory(save, entry) {
  const system = save.ultras;
  system.history.unshift({ id: uid(save, "ultras-history"), date: save.date, ...entry });
  system.history = system.history.slice(0, HISTORY_LIMIT);
}

function addPendingEvent(save, eventId, extra = {}) {
  if (save.ultras.pendingEvent) return save.ultras.pendingEvent;
  const event = ULTRAS_EVENT_CATALOG.find((item) => item.id === eventId);
  const id = uid(save, "ultras-event");
  const pending = {
    id,
    eventId,
    date: save.date,
    mode: event?.mode || "decision",
    messageId: null,
    ...extra,
  };
  save.ultras.pendingEvent = pending;
  const title = event?.title || {
    ar: "مطالب جماهيرية على الطاولة",
    en: "Supporter demands are on the table",
    fr: "Les revendications des supporters sont sur la table",
  };
  const body = event?.body || {
    ar: "انتهت مهلة المطالب دون اتفاق. يمكنك الاستجابة أو التفاوض أو التجاهل وتحمل التصعيد.",
    en: "The demand deadline passed without an agreement. You can fulfil it, negotiate, or ignore it and face escalation.",
    fr: "Le délai est dépassé sans accord. Vous pouvez satisfaire la demande, négocier ou l’ignorer et subir une escalade.",
  };
  const mail = message(save, {
    title: locale(title, language(save)),
    body: locale(body, language(save)),
    category: "board",
    required: false,
    kind: "ultras-event",
    ref: id,
    priority: "normal",
  });
  pending.messageId = mail.id;
  return pending;
}

function recentEvent(save, eventId, cooldown) {
  const last = save.ultras.history.find((entry) => entry.eventId === eventId);
  return last && daysBetween(last.date, save.date) < cooldown;
}

export function eligibleUltrasEvents(save) {
  return availableUltrasEvents(save).filter((event) => !recentEvent(save, event.id, event.cooldown || 90));
}

export function startSupporterDemand(save, kind) {
  assert(DEMAND_KINDS.includes(kind), localizedText(save, "نوع المطالبة الجماهيرية غير صالح.", "Invalid supporter-demand type.", "Type de demande des supporters invalide."));
  const group = ownGroup(save);
  assert(group, localizedText(save, "مجموعة المشجعين غير موجودة.", "The supporters’ group is unavailable.", "Le groupe de supporters est introuvable."));
  assert(!group.demand, localizedText(save, "هناك مطلب جماهيري مفتوح بالفعل.", "A supporter demand is already open.", "Une demande des supporters est déjà en cours."));
  const copy = ULTRAS_DEMANDS[kind];
  group.demand = {
    id: uid(save, "ultras-demand"),
    kind,
    opened: save.date,
    due: addDays(save.date, 21),
    escalation: 0,
    ignoredCount: 0,
    negotiations: 0,
    signedStarId: null,
  };
  message(save, {
    title: `${locale(copy.name, language(save))} — ${locale({ ar: "مطالبة جماهيرية", en: "Supporter demand", fr: "Demande des supporters" }, language(save))}`,
    body: `${locale(copy.detail, language(save))} · ${locale({ ar: "الموعد النهائي", en: "Deadline", fr: "Échéance" }, language(save))}: ${group.demand.due}.`,
    category: "board",
    kind: "ultras-demand",
    ref: group.demand.id,
    deadline: group.demand.due,
  });
  return group.demand;
}

export function canFulfilSupporterDemand(save, group = ownGroup(save)) {
  const demand = group?.demand;
  if (!demand) return false;
  if (demand.kind === "ticket") return save.ticketPrice > 50;
  if (demand.kind === "star")
    return save.players.some((player) =>
      player.id === demand.signedStarId && player.clubId === save.clubId && player.rating >= 72,
    );
  if (demand.kind === "coach") {
    const coach = save.management?.coach;
    return Boolean(coach && save.finance.cash >= coach.salary * 2 * coachYearsLeft(save));
  }
  if (demand.kind === "youth") {
    const academy = save.facilities?.find((facility) => facility.id === "academy");
    return Boolean(academy && !academy.project && academy.level < 4 && save.finance.cash >= projectQuote(academy).cost);
  }
  return false;
}

function recordClash(save, group, rivalId = null) {
  const rival = rivalId && save.ultras.groups[rivalId];
  const incident = { kind: "clash", date: save.date, severity: 3, rivalClubId: rivalId || null };
  group.lastIncident = incident;
  group.incidentCount = (group.incidentCount || 0) + 1;
  group.protestUntil = addDays(save.date, 10);
  // 0.45: غرامة معقولة (100,000) ولا تتكرر قبل 60 يومًا لكل مجموعة؛ الحادثة تُسجَّل دائمًا.
  const lastFine = group.lastFineDate;
  const fineDue = !lastFine || addDays(lastFine, 60) <= save.date;
  if (fineDue) {
    group.lastFineDate = save.date;
    post(save, -100_000, "ultras-fine", localizedText(save, "غرامة اشتباك جماهيري", "Supporter-clash fine", "Amende après affrontement de supporters"), uid(save, "ultras-fine"));
  }
  save.reputation = clamp((save.reputation || 0) - 2, 0, 100);
  save.fanSupport = clamp((save.fanSupport || 0) - 5, 10, 100);
  if (rival) {
    rival.lastIncident = { kind: "clash", date: save.date, severity: 2, rivalClubId: save.clubId };
    rival.incidentCount = (rival.incidentCount || 0) + 1;
  }
  try { addSuspicion(save, 5); } catch { /* older saves may lack the integrity schema */ }
  mediaPulse(save, "clash", {
    followers: -800,
    engagement: -8,
    title: { ar: "اشتباك جماهيري يجر غرامة", en: "A fan clash brings a fine", fr: "Un affrontement entraîne une amende" },
    body: { ar: "فرضت الرابطة غرامة محاكاة بعد حادثة بين المشجعين؛ السمعة والجماهير تراجعتا وارتفعت الشبهات.", en: "A simulated association fine followed a clash between supporters; reputation and fan support fell, and suspicion rose.", fr: "Une amende simulée de la fédération a suivi un affrontement ; la réputation et le soutien des supporters baissent, tandis que les soupçons augmentent." },
  });
  pushHistory(save, { eventId: "supporter-clash", clubId: save.clubId, result: "fine-and-scandal" });
  return incident;
}

function escalateDemand(save, group, demand) {
  demand.escalation = Math.min(3, (demand.escalation || 0) + 1);
  demand.due = addDays(save.date, 14);
  if (demand.escalation === 1) {
    setSupporterMood(save, save.clubId, -8, "demand-boycott");
    group.boycottUntil = addDays(save.date, 14);
  } else if (demand.escalation === 2) {
    setSupporterMood(save, save.clubId, -10, "demand-protest");
    group.chantStrikeUntil = addDays(save.date, 21);
    group.protestUntil = addDays(save.date, 10);
  } else {
    setSupporterMood(save, save.clubId, -8, "demand-clash-risk");
    recordClash(save, group);
  }
}

function closePending(save, eventId) {
  const pending = save.ultras.pendingEvent;
  if (pending && (!eventId || pending.id === eventId)) {
    closeThread(save, pending.id);
    const eventMail = save.inbox.find((mail) => mail.id === pending.messageId);
    if (eventMail) {
      eventMail.status = "resolved";
      eventMail.read = true;
    }
    save.ultras.pendingEvent = null;
  }
}

function closeDemandPending(save) {
  const pending = save.ultras?.pendingEvent;
  if (pending?.eventId === "demand-response") closePending(save, pending.id);
}

export function fulfilSupporterDemand(save) {
  const group = ownGroup(save);
  const demand = group?.demand;
  assert(demand, localizedText(save, "لا توجد مطالبة جماهيرية مفتوحة.", "There is no open supporter demand.", "Aucune demande des supporters n’est en cours."));
  assert(canFulfilSupporterDemand(save, group), localizedText(save, "لم يتحقق شرط المطالبة بعد أو لا تكفي السيولة.", "The demand is not yet fulfilled or the club lacks the required funds.", "La demande n’est pas encore satisfaite ou le club ne dispose pas des fonds nécessaires."));
  if (demand.kind === "ticket") {
    const oldPrice = save.ticketPrice;
    save.ticketPrice = Math.max(50, Math.floor(save.ticketPrice * 0.84));
    recordTicketPriceChange(save, oldPrice, save.ticketPrice);
  } else if (demand.kind === "coach") dismissCoach(save);
  else if (demand.kind === "youth") startProject(save, "academy", false);
  const completed = { ...demand, completed: save.date };
  group.demand = null;
  group.lastOwnerActionDate = save.date;
  group.capo.confidence = clamp(group.capo.confidence + 8, 0, 100);
  setSupporterMood(save, save.clubId, 14, `demand-${completed.kind}-fulfilled`);
  save.ultras.nextDemandDate = addDays(save.date, 90);
  pushHistory(save, { eventId: "demand-fulfilled", demandKind: completed.kind, result: "fulfilled" });
  mediaPulse(save, "demand-fulfilled", {
    followers: 1800,
    engagement: 3,
    title: { ar: "المالك يستجيب لمطالب الجماهير", en: "The owner responds to supporters", fr: "Le propriétaire répond aux supporters" },
    body: { ar: "تم تسجيل تنفيذ مطلب جماهيري، فعادت المجموعة إلى طاولة الحوار.", en: "A supporter demand was fulfilled, bringing the group back to the table.", fr: "Une demande des supporters a été satisfaite et le groupe revient au dialogue." },
  });
  closeDemandPending(save);
  return completed;
}

function negotiateDemand(save) {
  const group = ownGroup(save);
  const demand = group?.demand;
  assert(demand, localizedText(save, "لا توجد مطالبة للتفاوض عليها.", "There is no demand to negotiate.", "Aucune demande à négocier."));
  demand.negotiations = (demand.negotiations || 0) + 1;
  demand.due = addDays(save.date, 21);
  group.lastOwnerActionDate = save.date;
  group.capo.confidence = clamp(group.capo.confidence + 3, 0, 100);
  setSupporterMood(save, save.clubId, 4, "demand-negotiated");
  closeDemandPending(save);
  message(save, {
    title: locale({ ar: "تم تمديد المهلة بعد التفاوض", en: "The deadline was extended after talks", fr: "Le délai est prolongé après négociation" }, language(save)),
    body: locale({ ar: `المهلة الجديدة ${demand.due}. سيعود التصعيد إذا لم يصل الطرفان إلى اتفاق.`, en: `The new deadline is ${demand.due}. Pressure may rise again if no agreement is reached.`, fr: `La nouvelle échéance est le ${demand.due}. La pression peut remonter sans accord.` }, language(save)),
    category: "board",
  });
  return demand;
}

function ignoreDemand(save) {
  const group = ownGroup(save);
  const demand = group?.demand;
  assert(demand, localizedText(save, "لا توجد مطالبة لتجاهلها.", "There is no demand to ignore.", "Aucune demande à ignorer."));
  demand.ignoredCount = Math.min(100, (demand.ignoredCount || 0) + 1);
  demand.due = addDays(save.date, 14);
  if (demand.escalation < 3) demand.escalation++;
  group.lastOwnerActionDate = save.date;
  group.capo.confidence = clamp(group.capo.confidence - 8, 0, 100);
  setSupporterMood(save, save.clubId, -10 - 2 * demand.ignoredCount, "demand-ignored");
  if (demand.escalation === 1) group.boycottUntil = addDays(save.date, 14);
  if (demand.escalation === 2) {
    group.chantStrikeUntil = addDays(save.date, 21);
    group.protestUntil = addDays(save.date, 10);
  }
  if (demand.escalation >= 3) recordClash(save, group);
  pushHistory(save, { eventId: "demand-ignored", demandKind: demand.kind, result: `stage-${demand.escalation}` });
  closeDemandPending(save);
  return demand;
}

export function respondToSupporterDemand(save, choiceId) {
  if (choiceId === "fulfil") return fulfilSupporterDemand(save);
  if (choiceId === "negotiate") return negotiateDemand(save);
  if (choiceId === "ignore") return ignoreDemand(save);
  throw new Error(localizedText(save, "استجابة المطالبة غير صالحة.", "Invalid response to the demand.", "Réponse à la demande invalide."));
}

export function ultrasDay(save) {
  if (!save?.ultras?.groups) return null;
  const system = ensureUltras(save);
  const group = ownGroup(save);
  if (!group) return null;
  if (system.pendingEvent && system.pendingEvent.eventId !== "demand-response" && daysBetween(system.pendingEvent.date, save.date) >= 14) {
    const expired = system.pendingEvent;
    closePending(save, expired.id);
    pushHistory(save, { eventId: expired.eventId, mode: expired.mode, result: "expired" });
  }
  if (save.date.endsWith("-01") && daysBetween(group.lastOwnerActionDate || save.startDate, save.date) >= 45)
    setSupporterMood(save, save.clubId, -2, "owner-neglect");

  if (group.demand && group.demand.due <= save.date) {
    const demandWasPending = system.pendingEvent?.eventId === "demand-response";
    escalateDemand(save, group, group.demand);
    if (!system.pendingEvent) addPendingEvent(save, "demand-response", { demandId: group.demand.id });
    else {
      message(save, {
        title: locale({ ar: "تصعيد جديد لمطلب الجماهير", en: "Supporter demand escalated again", fr: "Nouvelle escalade de la demande des supporters" }, language(save)),
        body: locale({
          ar: `لم يصل اتفاق بشأن ${locale(ULTRAS_DEMANDS[group.demand.kind].name, language(save))}. ستتجدد الضغوط بعد ${group.demand.due}.`,
          en: `No agreement was reached on ${locale(ULTRAS_DEMANDS[group.demand.kind].name, language(save))}. Pressure will rise again after ${group.demand.due}.`,
          fr: `Aucun accord sur ${locale(ULTRAS_DEMANDS[group.demand.kind].name, language(save))}. La pression remontera après le ${group.demand.due}.`,
        }, language(save)),
        category: "board",
        kind: "ultras-demand-escalation",
        ref: group.demand.id,
        deadline: group.demand.due,
      });
      if (demandWasPending) system.pendingEvent.escalation = group.demand.escalation;
    }
  }

  if (!group.demand && save.date >= system.nextDemandDate && group.mood <= 64) {
    const kind = DEMAND_KINDS[group.demandCursor % DEMAND_KINDS.length];
    group.demandCursor = (group.demandCursor + 1) % DEMAND_KINDS.length;
    startSupporterDemand(save, kind);
    system.nextDemandDate = addDays(save.date, 75);
  } else if (!group.demand && save.date >= system.nextDemandDate) {
    system.nextDemandDate = addDays(save.date, 30);
  }

  if (!system.pendingEvent && save.date >= system.nextEventDate) {
    const options = eligibleUltrasEvents(save);
    if (!options.length) {
      system.nextEventDate = addDays(save.date, 6);
      return system;
    }
    const event = options[Math.floor(random(save) * options.length)];
    const fixture = eventFixture(save, event.id);
    const rivalClubId = fixture
      ? fixture.home === save.clubId ? fixture.away : fixture.home
      : null;
    if (event.mode === "flavor") {
      pushHistory(save, { eventId: event.id, mode: "flavor", result: "shared" });
      if (event.id === "old-stand-photograph") group.archivePhotoYear = Number(save.date.slice(0, 4));
      if (event.id === "capo-radio-chant") group.radioChantYear = Number(save.date.slice(0, 4));
      if (event.id === "rainy-flag-repair") group.rainRepairYear = Number(save.date.slice(0, 4));
      if (event.id === "marriage-kiss-cam") group.weddingWaveYear = Number(save.date.slice(0, 4));
      if (event.id === "dog-rescue-thanks") group.dogThanksYear = Number(save.date.slice(0, 4));
      if (event.id === "tifo-recycling") group.recycleYear = Number(save.date.slice(0, 4));
      mediaPulse(save, event.id, { title: event.title, body: event.body, followers: 600, engagement: 2 });
      system.nextEventDate = addDays(save.date, 12);
    } else {
      const pending = addPendingEvent(save, event.id, {
        fixtureId: fixture?.id || null,
        rivalClubId,
      });
      system.nextEventDate = addDays(save.date, 24);
      return pending;
    }
  }
  return system;
}

export function stageTifo(save, fixtureId = null, { community = false } = {}) {
  const group = ownGroup(save);
  assert(group, localizedText(save, "مجموعة المشجعين غير موجودة.", "The supporters’ group is unavailable.", "Le groupe de supporters est introuvable."));
  const fixture = upcomingUltrasFixtures(save, 30).find((entry) => entry.id === fixtureId) ||
    upcomingUltrasFixtures(save, 30).find((entry) =>
      (entry.home === save.clubId || entry.away === save.clubId) &&
      (community || entry.competition || entry.isDerby || entry.home === save.clubId),
    );
  assert(fixture, localizedText(save, "لا توجد مباراة قريبة تصلح لعرض التيفو.", "There is no upcoming fixture suitable for a tifo.", "Aucun match à venir ne convient à un tifo."));
  const cost = Math.max(180_000, Math.round((save.capacity || 20_000) * (community ? 5 : 8)));
  assert(save.finance.cash >= cost, localizedText(save, "السيولة لا تكفي لتجهيز التيفو.", "The club cannot afford the tifo.", "Le club ne peut pas financer le tifo."));
  post(save, -cost, "ultras-tifo", community ? localizedText(save, "تيفو مجتمعي", "Community tifo", "Tifo solidaire") : localizedText(save, "تجهيز تيفو جماهيري", "Supporters’ tifo", "Tifo des supporters"), uid(save, "ultras-tifo"));
  group.tifoFixtureId = fixture.id;
  group.lastOwnerActionDate = save.date;
  group.capo.confidence = clamp(group.capo.confidence + 4, 0, 100);
  setSupporterMood(save, save.clubId, community ? 8 : 12, community ? "community-tifo" : "tifo-staged");
  for (const player of save.players.filter((person) => person.clubId === save.clubId && person.status === "active"))
    player.morale = clamp(player.morale + 1, 0, 100);
  mediaPulse(save, "tifo", {
    followers: 6500,
    engagement: 6,
    title: { ar: "المدرج يجهز تيفو للمباراة المقبلة", en: "The stand prepares a tifo for the next match", fr: "Le virage prépare un tifo pour le prochain match" },
    body: { ar: `تم حجز التيفو للمباراة ${fixture.date}. الجمهور +3، المعنويات +1، والحماس يرفع أفضلية الملعب قليلًا.`, en: `The tifo is booked for ${fixture.date}. Fan support rises by 3, morale by 1, with a small home-atmosphere boost.`, fr: `Le tifo est prévu pour le ${fixture.date}. Le soutien augmente de 3, le moral de 1, avec un léger avantage à domicile.` },
  });
  save.fanSupport = clamp(save.fanSupport + 2, 10, 100);
  group.tifoCount = (group.tifoCount || 0) + 1;
  return fixture;
}

export function organizeAwaySupport(save, fixtureId = null) {
  const group = ownGroup(save);
  assert(group, localizedText(save, "مجموعة المشجعين غير موجودة.", "The supporters’ group is unavailable.", "Le groupe de supporters est introuvable."));
  const fixture = upcomingUltrasFixtures(save, 21).find((entry) =>
    entry.id === fixtureId && entry.away === save.clubId && !entry.neutral,
  ) || upcomingUltrasFixtures(save, 21).find((entry) => entry.away === save.clubId && !entry.neutral);
  assert(fixture, localizedText(save, "لا توجد مباراة خارجية خلال 21 يومًا.", "There is no away match in the next 21 days.", "Aucun match à l’extérieur n’est prévu dans les 21 prochains jours."));
  const cost = 180_000;
  assert(save.finance.cash >= cost, localizedText(save, "السيولة لا تكفي لحافلات المشجعين.", "The club cannot afford supporter coaches.", "Le club ne peut pas financer les cars des supporters."));
  post(save, -cost, "ultras-away-trip", localizedText(save, "تنظيم رحلة مشجعين خارجية", "Organize an away supporters’ trip", "Organiser le déplacement des supporters"), uid(save, "ultras-away"));
  group.awayFixtureId = fixture.id;
  group.awayUntil = fixture.date;
  group.lastOwnerActionDate = save.date;
  setSupporterMood(save, save.clubId, 6, "away-support-trip");
  save.fanSupport = clamp(save.fanSupport + 2, 10, 100);
  mediaPulse(save, "away-trip", { followers: 2200, engagement: 3 });
  return fixture;
}

export function launchChant(save) {
  const group = ownGroup(save);
  assert(group, localizedText(save, "مجموعة المشجعين غير موجودة.", "The supporters’ group is unavailable.", "Le groupe de supporters est introuvable."));
  const fixture = upcomingUltrasFixtures(save, 10).find((entry) => entry.home === save.clubId || entry.away === save.clubId);
  assert(fixture, localizedText(save, "لا توجد مباراة لنشر الهتاف خلالها خلال 10 أيام.", "There is no fixture in the next 10 days for the chant.", "Aucun match n’est prévu dans les 10 prochains jours pour lancer le chant."));
  group.lastOwnerActionDate = save.date;
  setSupporterMood(save, save.clubId, 4, "owner-backed-chant");
  for (const player of save.players.filter((person) => person.clubId === save.clubId && person.status === "active"))
    player.morale = clamp(player.morale + 1, 0, 100);
  save.fanSupport = clamp(save.fanSupport + 2, 10, 100);
  mediaPulse(save, "chant", { followers: 2600, engagement: 4 });
  return fixture;
}

export function pressureRivalSupporters(save, rivalId) {
  const own = ownGroup(save);
  const rival = ultrasGroup(save, rivalId);
  assert(own && rival && rivalId !== save.clubId, localizedText(save, "اختر مجموعة منافسة معروفة.", "Choose a known rival supporters’ group.", "Choisissez un groupe de supporters rival connu."));
  const fixture = upcomingUltrasFixtures(save, 30).find((entry) =>
    [entry.home, entry.away].includes(save.clubId) && [entry.home, entry.away].includes(rivalId),
  );
  assert(fixture, localizedText(save, "لا توجد مواجهة قريبة مع هذا النادي.", "There is no upcoming fixture against this club.", "Aucun match contre ce club n’est prévu prochainement."));
  const cost = 300_000;
  assert(save.finance.cash >= cost, localizedText(save, "السيولة لا تكفي لحملة المنافسة.", "The club cannot afford the rival campaign.", "Le club ne peut pas financer la campagne contre le rival."));
  post(save, -cost, "ultras-rival-campaign", localizedText(save, "حملة جماهيرية للمنافسة", "Rivalry supporters’ campaign", "Campagne de supporters contre le rival"), uid(save, "ultras-rival"));
  setSupporterMood(save, save.clubId, 3, "rival-campaign");
  setSupporterMood(save, rivalId, -4, "rival-campaign-pressure");
  rival.pressuredUntil = addDays(save.date, 10);
  try { addSuspicion(save, 4); } catch { /* integrity system is optional in imported legacy data */ }
  own.lastOwnerActionDate = save.date;
  mediaPulse(save, "rival-campaign", { followers: 900, engagement: -1 });
  return fixture;
}

export function imposeUltrasStadiumSanction(save, rivalId) {
  const rival = ultrasGroup(save, rivalId);
  assert(save.politics?.office?.held, localizedText(save, "تحتاج إلى رئاسة الاتحاد لتطبيق عقوبة ملعب.", "You must be association president to issue a stadium sanction.", "Vous devez présider la fédération pour prononcer une sanction de stade."));
  assert(rival && rivalId !== save.clubId, localizedText(save, "اختر ناديًا منافسًا مسجلًا.", "Choose a registered rival club.", "Choisissez un club rival enregistré."));
  assert(rival.lastIncident?.kind === "clash" && daysBetween(rival.lastIncident.date, save.date) <= 90, localizedText(save, "لا توجد حادثة اشتباك حديثة تبرر العقوبة.", "No recent clash justifies a sanction.", "Aucun affrontement récent ne justifie une sanction."));
  assert(!rival.stadiumSanctionUntil || rival.stadiumSanctionUntil < save.date, localizedText(save, "العقوبة الحالية ما زالت سارية.", "The current stadium sanction is still active.", "La sanction actuelle du stade est toujours en vigueur."));
  const until = addDays(save.date, 14);
  rival.stadiumSanctionUntil = until;
  const record = { id: uid(save, "ultras-sanction"), clubId: rivalId, date: save.date, until, type: "away-stand-closure" };
  save.ultras.sanctions.unshift(record);
  save.ultras.sanctions = save.ultras.sanctions.slice(0, 100);
  const committees = save.politics.committees;
  committees.history.push({ id: `committee-${(save.nextId = (save.nextId || 0) + 1)}`, date: save.date, season: save.seasonNumber, type: "ultras-stadium-sanction", clubId: rivalId, until });
  committees.history = committees.history.slice(-300);
  pushHistory(save, { eventId: "association-stadium-sanction", targetClubId: rivalId, result: "14-day-away-stand-closure" });
  message(save, {
    title: locale({ ar: "عقوبة مدرج صادرة عن الاتحاد", en: "Association away-stand sanction issued", fr: "Sanction de tribune prononcée par la fédération" }, language(save)),
    body: locale({ ar: `إغلاق مدرج الضيوف للنادي المحدد حتى ${until} بعد مراجعة حادثة جماهيرية.`, en: `The named club’s away stand is closed until ${until} following review of a supporter incident.`, fr: `Le virage visiteurs du club concerné est fermé jusqu’au ${until} après examen de l’incident.` }, language(save)),
    category: "board",
  });
  return record;
}

export function recordSupporterSigning(save, player) {
  const group = ownGroup(save);
  if (!group || !player || player.clubId !== save.clubId || player.rating < 72) return false;
  group.lastSigningDate = save.date;
  group.lastSigningPlayer = { id: player.id, rating: Math.round(player.rating) };
  group.lastOwnerActionDate = save.date;
  if (group.demand?.kind === "star" && save.date >= group.demand.opened) group.demand.signedStarId = player.id;
  group.capo.confidence = clamp(group.capo.confidence + 5, 0, 100);
  setSupporterMood(save, save.clubId, 7, "star-signing-welcome");
  save.fanSupport = clamp(save.fanSupport + 2, 10, 100);
  mediaPulse(save, "airport-welcome", {
    followers: 5200,
    engagement: 5,
    title: { ar: "استقبال جماهيري للاعب الجديد", en: "Supporters welcome the new signing", fr: "Les supporters accueillent la nouvelle recrue" },
    body: { ar: "مجموعة المشجعين نظمت ترحيبًا آمنًا بالصفقة الجديدة؛ المعنويات والدعم الجماهيري ارتفعا.", en: "The supporters’ group organized a safe welcome for the new signing; morale and fan support improved.", fr: "Le groupe a organisé un accueil sûr pour la nouvelle recrue ; le moral et le soutien des fans progressent." },
  });
  return true;
}

export function recordSupporterSale(save, player) {
  const group = ownGroup(save);
  if (!group || !player || player.rating < 65) return false;
  const penalty = player.rating >= 80 ? 16 : player.rating >= 72 ? 11 : 5;
  group.lastStarSaleDate = save.date;
  group.lastStarSaleRating = Math.round(player.rating);
  group.lastOwnerActionDate = save.date;
  setSupporterMood(save, save.clubId, -penalty, player.rating >= 72 ? "star-sold" : "player-sold");
  group.capo.confidence = clamp(group.capo.confidence - Math.ceil(penalty / 3), 0, 100);
  if (player.rating >= 72) {
    for (const person of save.players.filter((entry) => entry.clubId === save.clubId && entry.status === "active"))
      person.morale = clamp(person.morale - 1, 0, 100);
    mediaPulse(save, "star-sale", {
      followers: -2500,
      engagement: -5,
      title: { ar: "غضب بعد بيع نجم الفريق", en: "Anger after a star sale", fr: "Colère après la vente d’une star" },
      body: { ar: "الجمهور يطالب بخطة لإعادة الاستثمار، وقد تظهر مطالبة بالتعاقد مع بديل.", en: "Supporters want a reinvestment plan, and may demand a replacement signing.", fr: "Les supporters réclament un plan de réinvestissement et pourraient demander une recrue." },
    });
  }
  return true;
}

function applyEventChoice(save, pending, event, choice) {
  const group = ownGroup(save);
  const effect = choice.effect;
  group.lastOwnerActionDate = save.date;
  switch (effect) {
    case "stage-tifo": stageTifo(save, pending.fixtureId); break;
    case "escort-dog":
      group.dogRescueDate = save.date;
      group.lastOwnerActionDate = save.date;
      setSupporterMood(save, save.clubId, 2, "humane-pitch-response");
      mediaPulse(save, "dog-rescue", { followers: 750, engagement: 2 });
      break;
    case "approve-proposal":
      setSupporterMood(save, save.clubId, 3, "fan-proposal-approved");
      mediaPulse(save, "community-moment", { followers: 900, engagement: 2 });
      break;
    case "private-proposal":
      setSupporterMood(save, save.clubId, 2, "fan-proposal-private");
      break;
    case "airport-greeting":
      mediaPulse(save, "airport-welcome", { followers: 1800, engagement: 3 });
      setSupporterMood(save, save.clubId, 2, "airport-welcome");
      break;
    case "online-welcome":
      mediaPulse(save, "online-welcome", { followers: 3200, engagement: 4 });
      setSupporterMood(save, save.clubId, 3, "online-welcome");
      break;
    case "organize-away": organizeAwaySupport(save, pending.fixtureId); break;
    case "meet-capo":
    case "listen-strike":
    case "dialogue-banner":
    case "peaceful-protest":
      group.lastInterviewDate = save.date;
      group.lastOwnerBannerDate = save.date;
      group.lastProtestDate = save.date;
      group.chantStrikeUntil = null;
      group.protestUntil = null;
      group.capo.confidence = clamp(group.capo.confidence + 9, 0, 100);
      setSupporterMood(save, save.clubId, 9, "owner-dialogue");
      mediaPulse(save, "dialogue", { followers: 1000, engagement: 3 });
      break;
    case "ignore-strike":
    case "ignore-banner":
    case "hardline-protest":
      group.lastProtestDate = save.date;
      group.protestUntil = addDays(save.date, 14);
      group.chantStrikeUntil = addDays(save.date, 18);
      setSupporterMood(save, save.clubId, -12, "supporter-protest-ignored");
      break;
    case "safe-banner-exchange": {
      group.lastBannerWarYear = Number(save.date.slice(0, 4));
      group.bannersStolen = Math.max(0, (group.bannersStolen || 0) - 1);
      setSupporterMood(save, save.clubId, 3, "banner-returned-peacefully");
      const rival = pending.rivalClubId && ultrasGroup(save, pending.rivalClubId);
      if (rival) {
        rival.banners = (rival.banners || 0) + 1;
        setSupporterMood(save, pending.rivalClubId, 2, "banner-returned-peacefully");
      }
      break;
    }
    case "banner-clash": {
      group.lastBannerWarYear = Number(save.date.slice(0, 4));
      group.bannersStolen = (group.bannersStolen || 0) + 1;
      setSupporterMood(save, save.clubId, 3, "banner-war");
      const rival = pending.rivalClubId && ultrasGroup(save, pending.rivalClubId);
      if (rival) rival.banners = Math.max(0, (rival.banners || 0) - 1);
      recordClash(save, group, pending.rivalClubId);
      break;
    }
    case "hire-marshals": {
      const cost = 125_000;
      assert(save.finance.cash >= cost, localizedText(save, "السيولة لا تكفي لتأمين الديربي.", "The club cannot afford extra derby stewards.", "Le club ne peut pas financer des stadiers supplémentaires pour le derby."));
      post(save, -cost, "ultras-stewards", localizedText(save, "منظمون إضافيون للديربي", "Extra derby stewards", "Stadiers supplémentaires pour le derby"), uid(save, "ultras-stewards"));
      group.lastOwnerActionDate = save.date;
      group.capo.confidence = clamp(group.capo.confidence + 2, 0, 100);
      break;
    }
    case "fund-youth-workshop":
    case "fund-community":
    case "fund-supporter-mural":
    case "supporter-mural":
    case "fund-community-tifo": {
      const cost = 100_000;
      assert(save.finance.cash >= cost, localizedText(save, "السيولة لا تكفي للمبادرة الجماهيرية.", "The club cannot afford the supporters’ initiative.", "Le club ne peut pas financer l’initiative des supporters."));
      post(save, -cost, "ultras-community", localizedText(save, "مبادرة مجتمعية للمشجعين", "Supporters’ community initiative", "Initiative solidaire des supporters"), uid(save, "ultras-community"));
      group.muralYear = Number(save.date.slice(0, 4));
      group.communityTifoYear = Number(save.date.slice(0, 4));
      setSupporterMood(save, save.clubId, 6, "community-project");
      mediaPulse(save, "community-project", { followers: 2000, engagement: 5 });
      break;
    }
    case "community-tifo":
    case "fund-tifo-charity": stageTifo(save, pending.fixtureId, { community: true }); break;
    case "restore-flags":
      group.flagsRestored = true;
      group.banners = (group.banners || 0) + 1;
      setSupporterMood(save, save.clubId, 4, "historic-banners-restored");
      break;
    case "captain-chant":
      group.captainChantYear = Number(save.date.slice(0, 4));
      setSupporterMood(save, save.clubId, 4, "captain-chant");
      mediaPulse(save, "captain-chant", { followers: 1400, engagement: 4 });
      break;
    case "family-section":
      group.familySection = true;
      setSupporterMood(save, save.clubId, 3, "family-section");
      break;
    case "safe-rivalry-exchange":
      group.lastRivalExchangeYear = Number(save.date.slice(0, 4));
      setSupporterMood(save, save.clubId, 3, "safe-rivalry-event");
      break;
    case "honor-capo":
      group.capoAnniversaryYear = Number(save.date.slice(0, 4));
      group.capo.confidence = clamp(group.capo.confidence + 5, 0, 100);
      setSupporterMood(save, save.clubId, 4, "capo-tribute");
      break;
    case "open-capo-vote":
      group.capoVoteYear = Number(save.date.slice(0, 4));
      group.capo.confidence = clamp(group.capo.confidence + 2, 0, 100);
      setSupporterMood(save, save.clubId, 5, "capo-vote");
      break;
    case "reaffirm-capo":
      group.capoVoteYear = Number(save.date.slice(0, 4));
      group.capo.confidence = clamp(group.capo.confidence - 5, 0, 100);
      setSupporterMood(save, save.clubId, -2, "capo-reaffirmed-without-vote");
      break;
    case "city-march":
      group.lastMarchDate = save.date;
      setSupporterMood(save, save.clubId, 5, "city-march-approved");
      mediaPulse(save, "city-march", { followers: 1900, engagement: 5 });
      break;
    case "schedule-protest":
      group.lastOwnerActionDate = save.date;
      setSupporterMood(save, save.clubId, 2, "fixture-objection");
      mediaPulse(save, "fixture-objection", { followers: 500, engagement: 1 });
      break;
    case "consult-badge":
      group.badgePollYear = Number(save.date.slice(0, 4));
      setSupporterMood(save, save.clubId, 4, "badge-consultation");
      break;
    case "redesign-badge":
      group.badgePollYear = Number(save.date.slice(0, 4));
      group.badgeRevision = (group.badgeRevision || 0) + 1;
      setSupporterMood(save, save.clubId, -12, "badge-redesign");
      mediaPulse(save, "badge-redesign", { followers: 900, engagement: -2 });
      break;
    case "keep-badge":
      group.badgePollYear = Number(save.date.slice(0, 4));
      setSupporterMood(save, save.clubId, 2, "badge-preserved");
      break;
    case "reinvest-sale":
      group.lastSaleResponseDate = save.date;
      setSupporterMood(save, save.clubId, 6, "sale-reinvestment-plan");
      mediaPulse(save, "reinvestment-plan", { followers: 2200, engagement: 3 });
      break;
    case "save-sale-cash":
      group.lastSaleResponseDate = save.date;
      setSupporterMood(save, save.clubId, -5, "sale-plan-delayed");
      break;
    case "decline-march":
    case "decline":
    case "community-volunteer":
    case "cancel-march":
    case "save-tifo":
    case "no-action":
    default:
      break;
  }
  if (event?.id === "capo-radio-interview" && effect === "meet-capo") group.lastInterviewDate = save.date;
  if (event?.id === "derby-banner-theft" && pending.rivalClubId) group.lastBannerWarYear = Number(save.date.slice(0, 4));
}

export function resolveUltrasEvent(save, eventInstanceId, choiceId) {
  const pending = save.ultras?.pendingEvent;
  assert(pending && pending.id === eventInstanceId, localizedText(save, "الحدث الجماهيري لم يعد مفتوحًا.", "That supporter event is no longer open.", "Cet événement des supporters n’est plus ouvert."));
  if (pending.eventId === "demand-response") {
    respondToSupporterDemand(save, choiceId);
    pushHistory(save, { eventId: "demand-response", result: choiceId, demandId: pending.demandId });
    return true;
  }
  const event = ULTRAS_EVENT_CATALOG.find((item) => item.id === pending.eventId);
  const response = event?.choices.find((item) => item.id === choiceId);
  assert(event && response, localizedText(save, "استجابة جماهيرية غير صالحة.", "Invalid supporter-event response.", "Réponse à l’événement des supporters invalide."));
  applyEventChoice(save, pending, event, response);
  pushHistory(save, { eventId: event.id, result: response.id, mode: event.mode });
  if (event.id === "derby-banner-theft" && !ownGroup(save).lastBannerWarYear)
    ownGroup(save).lastBannerWarYear = Number(save.date.slice(0, 4));
  closePending(save, pending.id);
  return true;
}

export function forceSupporterClash(save, rivalId = null) {
  const group = ownGroup(save);
  assert(group, localizedText(save, "مجموعة المشجعين غير موجودة.", "The supporters’ group is unavailable.", "Le groupe de supporters est introuvable."));
  return recordClash(save, group, rivalId);
}
