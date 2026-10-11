import { clamp } from "../core/utils.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { CELEBRATION_TEXTS } from "../data/celebrationTexts.js";
import { ensureSportsCity } from "./sportsCity.js";
import { post } from "./finance.js";
import { message } from "./inbox.js";

const REWARDS = Object.freeze({
  title: { merchandise: 1_800_000, sponsor: 1_200_000, morale: 8, fans: 8, rep: 2, followers: 35_000, engagement: 12 },
  cup: { merchandise: 850_000, sponsor: 520_000, morale: 5, fans: 5, rep: 1, followers: 18_000, engagement: 8 },
  derby: { merchandise: 300_000, sponsor: 180_000, morale: 3, fans: 4, rep: 0, followers: 8_000, engagement: 6 },
  promotion: { merchandise: 700_000, sponsor: 400_000, morale: 6, fans: 6, rep: 1, followers: 14_000, engagement: 7 },
});

const hash = (value) => {
  let h = 2166136261;
  for (const character of String(value))
    h = Math.imul(h ^ character.codePointAt(0), 16777619);
  return h >>> 0;
};
const local = (copy, language = "ar") =>
  copy?.[language] || copy?.en || copy?.ar || "";
const ownDivision = (save) =>
  save.expansion?.divisions?.find((division) =>
    division.clubs?.includes(save.clubId),
  ) || null;

function relevantFixtures(save) {
  const expansion = save.expansion;
  const output = [];
  const seen = new Set();
  const add = (fixtures) => {
    for (const fixture of fixtures || []) {
      if (
        !fixture?.id ||
        seen.has(fixture.id) ||
        ![fixture.home, fixture.away].includes(save.clubId)
      )
        continue;
      seen.add(fixture.id);
      output.push(fixture);
    }
  };
  add(save.fixtures);
  add(save.friendlies);
  for (const division of expansion?.divisions || [])
    if (division.clubs?.includes(save.clubId)) add(division.fixtures);
  for (const cup of expansion?.cups || []) {
    add(cup.fixtures);
    add(cup.pendingMatches);
    add(cup.results);
  }
  for (const playoff of expansion?.playoffs || [])
    if (playoff.clubs?.includes(save.clubId)) add(playoff.fixtures);
  return output;
}

/** Capture only compact title and fixture markers; never clone a full world save. */
export function celebrationSnapshot(save) {
  return {
    clubId: save.clubId,
    date: save.date,
    seasonNumber: save.seasonNumber,
    seasonHistoryCount: save.seasonHistory?.length || 0,
    champions: { ...(save.expansion?.champions || {}) },
    cups: Object.fromEntries(
      (save.expansion?.cups || []).map((cup) => [
        cup.id,
        { winner: cup.winner || null, finished: cup.finished || null },
      ]),
    ),
    domesticHonours: Object.fromEntries(
      Object.entries(save.expansion?.domesticHonours || {}).map(([country, item]) => [
        country,
        { winner: item?.winner || null, season: item?.season || null },
      ]),
    ),
    ownTier: ownDivision(save)?.tier ?? null,
    playedFixtureIds: new Set(
      relevantFixtures(save)
        .filter(
          (fixture) =>
            fixture?.played &&
            [fixture.home, fixture.away].includes(save.clubId) &&
            fixture.id,
        )
        .map((fixture) => fixture.id),
    ),
  };
}

/** Find fresh celebrations from already-existing competition results. */
export function detectCelebrationEvents(before, save) {
  if (!before || before.clubId !== save.clubId) return [];
  const found = [];
  const season = save.seasonNumber || 1;
  const championKeys = new Set();
  for (const [competition, winner] of Object.entries(save.expansion?.champions || {})) {
    if (winner !== save.clubId || before.champions?.[competition] === save.clubId)
      continue;
    championKeys.add(competition);
    found.push({
      kind: "title",
      sourceId: `champion-${competition}-s${season}`,
      name: `${competition} · ${season}`,
    });
  }
  for (const cup of save.expansion?.cups || []) {
    if (!cup?.id || cup.winner !== save.clubId) continue;
    const previous = before.cups?.[cup.id];
    if (
      previous?.winner === save.clubId ||
      !cup.finished ||
      (previous?.finished && previous.finished >= cup.finished)
    )
      continue;
    const representedByChampion = [...championKeys].some(
      (key) => cup.id === key || cup.id.startsWith(`${key}-`),
    );
    if (representedByChampion) continue;
    found.push({
      kind: "cup",
      sourceId: `cup-${cup.id}`,
      name: String(cup.name || cup.id),
    });
  }
  for (const [country, honour] of Object.entries(save.expansion?.domesticHonours || {})) {
    const prior = before.domesticHonours?.[country];
    if (
      honour?.winner !== save.clubId ||
      (prior?.winner === save.clubId && prior?.season === honour.season)
    )
      continue;
    const representedByCup = (save.expansion?.cups || []).some(
      (cup) => cup.winner === save.clubId && cup.finished >= before.date,
    );
    if (!representedByCup)
      found.push({
        kind: "cup",
        sourceId: `domestic-${country}-s${honour.season || season}`,
        name: String(country),
      });
  }
  for (const entry of (save.seasonHistory || []).slice(before.seasonHistoryCount)) {
    const champion = entry?.table?.[0]?.clubId;
    if (champion === save.clubId)
      found.push({
        kind: "title",
        sourceId: `league-s${entry.number || season}`,
        name: `League season ${entry.number || season}`,
      });
  }
  const currentTier = ownDivision(save)?.tier ?? null;
  if (before.ownTier !== null && currentTier !== null && currentTier < before.ownTier)
    found.push({
      kind: "promotion",
      sourceId: `promotion-s${season}-tier${before.ownTier}-${currentTier}`,
      name: `${before.ownTier} → ${currentTier}`,
    });
  for (const fixture of relevantFixtures(save)) {
    if (
      !fixture?.played ||
      !fixture.isDerby ||
      !fixture.id ||
      before.playedFixtureIds.has(fixture.id) ||
      ![fixture.home, fixture.away].includes(save.clubId)
    )
      continue;
    const ownGoals = fixture.home === save.clubId ? fixture.homeGoals : fixture.awayGoals;
    const rivalGoals = fixture.home === save.clubId ? fixture.awayGoals : fixture.homeGoals;
    if (ownGoals > rivalGoals)
      found.push({
        kind: "derby",
        sourceId: `derby-${fixture.id}`,
        name: String(fixture.derbyName || "Derby"),
      });
  }
  const seen = new Set();
  return found.filter((item) => {
    const key = `${item.kind}:${item.sourceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function ensureCelebrations(save) {
  if (!Array.isArray(save.celebrations)) save.celebrations = [];
  return save.celebrations;
}

function eventCopy(kind) {
  return CELEBRATION_TEXTS[kind] || CELEBRATION_TEXTS.cup;
}

function cityBroadcast(save, record, copy) {
  const city = ensureSportsCity(save);
  city.broadcasts ??= [];
  const channelLevel = Math.min(4, (city.facilities || []).length);
  city.broadcasts.unshift({
    date: save.date,
    event: record.id,
    reach: 1 + channelLevel,
    title: local(copy.label, save.preferences?.language),
  });
  city.broadcasts.length = Math.min(30, city.broadcasts.length);
  if (save.press?.news) {
    save.press.news.unshift({
      date: save.date,
      title: local(copy.label, save.preferences?.language),
      type: "celebration",
    });
    save.press.news.length = Math.min(100, save.press.news.length);
  }
}

/** Apply celebration gains once. This changes presentation/rewards, never match rules. */
export function awardCelebration(save, event) {
  if (!event || !Object.hasOwn(REWARDS, event.kind)) return null;
  const celebrations = ensureCelebrations(save);
  const sourceKey = `${event.kind}:${event.sourceId}`;
  const existing = celebrations.find((item) => item.sourceKey === sourceKey);
  if (existing) return existing;
  const id = `celebration-${hash(sourceKey).toString(36)}`;
  const base = REWARDS[event.kind];
  const scale = clamp((save.capacity || 30_000) / 30_000, 0.6, 2);
  const reward = {
    merchandise: Math.round((base.merchandise * scale) / 10_000) * 10_000,
    sponsor: Math.round((base.sponsor * scale) / 10_000) * 10_000,
    morale: base.morale,
    fans: base.fans,
    reputation: base.rep,
    followers: base.followers,
    engagement: base.engagement,
  };
  const record = {
    id,
    kind: event.kind,
    sourceId: String(event.sourceId).slice(0, 160),
    sourceKey: sourceKey.slice(0, 220),
    name: String(event.name || "").slice(0, 120),
    date: save.date,
    season: save.seasonNumber || 1,
    seen: false,
    reward,
  };
  const copy = eventCopy(event.kind);
  const language = save.preferences?.language || "ar";
  post(
    save,
    reward.merchandise,
    "celebration-merchandise",
    local(copy.merchandise, language),
    `${id}-merchandise`,
  );
  post(
    save,
    reward.sponsor,
    "celebration-sponsor",
    local(copy.sponsor, language),
    `${id}-sponsor`,
  );
  save.fanSupport = clamp((save.fanSupport || 0) + reward.fans, 0, 100);
  save.reputation = clamp((save.reputation || 0) + reward.reputation, 0, 100);
  for (const player of save.players || [])
    if (player.clubId === save.clubId && player.status !== "retired")
      player.morale = clamp((player.morale || 0) + reward.morale, 0, 100);
  if (save.staffCorp?.social) {
    const social = save.staffCorp.social;
    social.followers = Math.max(0, Math.round((social.followers || 0) + reward.followers));
    social.engagement = clamp((social.engagement || 0) + reward.engagement, 0, 100);
    social.posts = [
      { kind: "celebration", date: save.date, sourceId: record.id },
      ...(social.posts || []),
    ].slice(0, 20);
  }
  if (save.empire)
    save.empire.fame = clamp((save.empire.fame || 0) + 1 + reward.reputation, 0, 100);
  cityBroadcast(save, record, copy);
  celebrations.push(record);
  if (celebrations.length > 500) celebrations.splice(0, celebrations.length - 500);
  message(save, {
    title: `${local(copy.label, language)} — ${record.name || local(copy.kicker, language)}`,
    body: `${local(copy.merchandise, language)} +${reward.merchandise.toLocaleString("en-US")}; ${local(copy.sponsor, language)} +${reward.sponsor.toLocaleString("en-US")}; morale +${reward.morale}.`,
    category: "matches",
    kind: "celebration",
    ref: record.id,
  });
  return record;
}

export function trackCelebrationEvents(save, before) {
  const fresh = detectCelebrationEvents(before, save);
  return fresh.map((event) => awardCelebration(save, event)).filter(Boolean);
}

export function pendingCelebrations(save) {
  return ensureCelebrations(save).filter((item) => !item.seen);
}

export function markCelebrationSeen(save, id) {
  const record = ensureCelebrations(save).find((item) => item.id === id);
  if (!record) return false;
  record.seen = true;
  return true;
}


export function clubCity(save) {
  return extendedClub(save.clubId)?.city || extendedClub(save.clubId)?.name || save.clubId;
}
