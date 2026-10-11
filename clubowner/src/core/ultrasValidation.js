import { ULTRAS_DEMANDS, ULTRAS_EVENT_CATALOG } from "../data/ultrasEvents.js";
import { isoDate } from "./isoDate.js";

const id = (value) => typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const text = (value, max = 500) => typeof value === "string" && value.length > 0 && value.length <= max;
const safe = (value, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= 0 && value <= max;
const validOptionalDate = (value) => value === null || value === undefined || isoDate(value);
const check = (condition, reason) => { if (!condition) throw new Error(reason); };
const localized = (value) => value && ["ar", "en", "fr"].every((lang) => text(value[lang], 180));

export function validateUltras(save) {
  const system = save.ultras;
  check(
    system && system.schema === 1 && system.groups && typeof system.groups === "object" && !Array.isArray(system.groups),
    "بيانات مجموعات المشجعين غير سليمة.",
  );
  const requiredClubIds = new Set([save.clubId, ...(save.table || []).map((row) => row.clubId)]);
  const addFixtureClubs = (fixture) => {
    if (fixture?.home) requiredClubIds.add(fixture.home);
    if (fixture?.away) requiredClubIds.add(fixture.away);
  };
  for (const fixture of [...(save.fixtures || []), ...(save.friendlies || [])]) addFixtureClubs(fixture);
  for (const division of save.expansion?.divisions || [])
    for (const clubId of division.clubs || []) requiredClubIds.add(clubId);
  for (const playoff of save.expansion?.playoffs || [])
    for (const clubId of playoff.clubs || []) requiredClubIds.add(clubId);
  for (const cup of save.expansion?.cups || []) {
    for (const clubId of [...(cup.entrants || []), ...(cup.alive || [])]) requiredClubIds.add(clubId);
    for (const fixture of [...(cup.fixtures || []), ...(cup.pendingMatches || []), ...(cup.results || [])]) addFixtureClubs(fixture);
    if (cup.winner) requiredClubIds.add(cup.winner);
  }
  check([...requiredClubIds].every((clubId) => system.groups[clubId]), "توجد أندية مشاركة بلا مجموعة مشجعين.");
  const groups = Object.values(system.groups);
  check(groups.length >= 8 && groups.length <= 2500, "عدد مجموعات المشجعين خارج الحدود.");
  const names = { ar: new Set(), en: new Set(), fr: new Set() };
  for (const [clubId, group] of Object.entries(system.groups)) {
    check(
      id(clubId) && group && group.clubId === clubId && localized(group.name) &&
        ["ar", "en", "fr"].every((lang) => {
          const key = group.name[lang].trim().toLocaleLowerCase();
          if (names[lang].has(key)) return false;
          names[lang].add(key);
          return true;
        }),
      "اسم مجموعة المشجعين مكرر أو غير مترجم.",
    );
    check(
      Number.isFinite(group.mood) && group.mood >= 0 && group.mood <= 100 &&
        group.capo && localized(group.capo.name) &&
        group.capo.personality && id(group.capo.personality.id) &&
        ["ar", "en", "fr"].every((lang) => text(group.capo.personality[lang], 100)) &&
        Number.isFinite(group.capo.confidence) && group.capo.confidence >= 0 && group.capo.confidence <= 100,
      "مزاج المجموعة أو بيانات الكابو غير سليمة.",
    );
    check(
      ["boycottUntil", "chantStrikeUntil", "protestUntil", "awayUntil", "lastOwnerActionDate"].every((key) => validOptionalDate(group[key])) &&
        (group.tifoFixtureId === null || group.tifoFixtureId === undefined || id(group.tifoFixtureId)) &&
        (group.awayFixtureId === null || group.awayFixtureId === undefined || id(group.awayFixtureId)) &&
        safe(group.tifoCount) && safe(group.banners) && safe(group.bannersStolen) &&
        Number.isSafeInteger(group.capoAnniversaryMonth) && group.capoAnniversaryMonth >= 1 && group.capoAnniversaryMonth <= 12 &&
        Number.isSafeInteger(group.capoAnniversaryDay) && group.capoAnniversaryDay >= 1 && group.capoAnniversaryDay <= 28 &&
        Array.isArray(group.moodHistory) && group.moodHistory.length <= 24 &&
        group.moodHistory.every((entry) => isoDate(entry.date) && Number.isSafeInteger(entry.delta) && text(entry.reason, 60)),
      "سجل المجموعة أو مواعيدها غير سليمة.",
    );
    if (group.demand) {
      const demand = group.demand;
      check(
        id(demand.id) && ULTRAS_DEMANDS[demand.kind] && isoDate(demand.opened) && isoDate(demand.due) &&
          safe(demand.escalation, 3) && safe(demand.ignoredCount, 100) && safe(demand.negotiations, 100) &&
          (demand.signedStarId === null || demand.signedStarId === undefined || id(demand.signedStarId)),
        "المطالبة الجماهيرية أو موعدها غير سليم.",
      );
    }
    if (group.lastIncident) {
      check(
        ["clash", "protest", "pyrotechnic"].includes(group.lastIncident.kind) &&
          isoDate(group.lastIncident.date) && safe(group.lastIncident.severity, 5) &&
          (group.lastIncident.rivalClubId === null || group.lastIncident.rivalClubId === undefined || id(group.lastIncident.rivalClubId)),
        "سجل حادثة المشجعين غير سليم.",
      );
    }
    if (group.lastResult)
      check(
        isoDate(group.lastResult.date) && ["win", "loss", "draw"].includes(group.lastResult.outcome) && id(group.lastResult.opponent),
        "نتيجة مجموعة المشجعين غير سليمة.",
      );
    if (group.lastSigningPlayer)
      check(id(group.lastSigningPlayer.id) && safe(group.lastSigningPlayer.rating, 100), "سجل الصفقة الجماهيري غير سليم.");
    for (const [key, value] of Object.entries(group)) {
      if (key.endsWith("Date") || key.endsWith("Until")) check(validOptionalDate(value), `موعد مجموعة المشجعين غير سليم: ${key}`);
      if (key.endsWith("Year") && value !== null && value !== undefined) check(Number.isSafeInteger(value) && value >= 1900 && value <= 9999, `سنة مجموعة المشجعين غير سليمة: ${key}`);
    }
  }
  check(
    isoDate(system.createdAt) && isoDate(system.nextEventDate) && isoDate(system.nextDemandDate) &&
      Array.isArray(system.history) && system.history.length <= 120 &&
      new Set(system.history.map((entry) => entry.id)).size === system.history.length &&
      system.history.every((entry) => id(entry.id) && id(entry.eventId) && isoDate(entry.date) &&
        (entry.clubId === undefined || id(entry.clubId)) && (entry.targetClubId === undefined || id(entry.targetClubId)) &&
        (entry.demandKind === undefined || Boolean(ULTRAS_DEMANDS[entry.demandKind])) && text(String(entry.result || "event"), 100)),
    "سجل أجواء المشجعين غير سليم.",
  );
  check(
    Array.isArray(system.sanctions) && system.sanctions.length <= 100 &&
      system.sanctions.every((entry) => id(entry.id) && id(entry.clubId) && isoDate(entry.date) && isoDate(entry.until) && entry.type === "away-stand-closure"),
    "عقوبات الملاعب الجماهيرية غير سليمة.",
  );
  if (system.pendingEvent) {
    const pending = system.pendingEvent;
    check(
      id(pending.id) && (pending.eventId === "demand-response" || ULTRAS_EVENT_CATALOG.some((event) => event.id === pending.eventId)) &&
        isoDate(pending.date) && ["decision", "flavor"].includes(pending.mode) && id(pending.messageId) &&
        save.inbox.some((mail) => mail.id === pending.messageId && mail.ref === pending.id && mail.kind === "ultras-event") &&
        (pending.fixtureId === null || pending.fixtureId === undefined || id(pending.fixtureId)) &&
        (pending.rivalClubId === null || pending.rivalClubId === undefined || id(pending.rivalClubId)),
      "الحدث الجماهيري المفتوح غير سليم.",
    );
  }
  return system;
}
