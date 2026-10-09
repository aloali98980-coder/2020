import {
  POLITICAL_SPONSORS,
  POLITICAL_TOURNAMENTS,
} from "../../data/politicsCommittees.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { addDays } from "../../core/utils.js";
import { getLanguage, tr } from "../../i18n/index.js";
import {
  createSupportFund,
  grantFromSupportFund,
  recordTournamentSponsorship,
  chargeTournamentSetup,
} from "./associationFinance.js";
import { ensurePolitics } from "./state.js";

const MAX_TOURNAMENTS_PER_SEASON = 12;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const language = () => getLanguage();
const localized = (words) => words?.[language()] || words?.en || "";

function requirePresident(s) {
  const p = ensurePolitics(s);
  if (!p.office.held)
    throw new Error(
      tr(
        "تحتاج إلى انتخابك رئيسًا لتنظيم بطولات الاتحاد.",
        "You must be elected president to organise association competitions.",
        "Vous devez être élu à la présidence pour organiser les compétitions de la fédération.",
      ),
    );
  return p;
}

function hash32(text) {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function tableRank(s) {
  return new Map((s.table || []).map((row, index) => [row.clubId, index]));
}

function eligibleEntrants(s, template) {
  const p = ensurePolitics(s);
  const rank = tableRank(s);
  return p.clubs
    .filter((club) => template.eligibleBlocs.includes(club.bloc))
    .sort(
      (left, right) =>
        (rank.get(left.clubId) ?? 9999) - (rank.get(right.clubId) ?? 9999) ||
        right.support - left.support ||
        left.clubId.localeCompare(right.clubId),
    )
    .slice(0, template.entryCount)
    .map((club) => club.clubId);
}

function drawn(ids, seed) {
  return [...ids].sort(
    (a, b) =>
      hash32(`${seed}|${a}`) - hash32(`${seed}|${b}`) || a.localeCompare(b),
  );
}

function newFixture(tournamentId, round, index, homeId, awayId, scheduledDate) {
  return {
    id: `${tournamentId}-r${round}-m${index + 1}`,
    round,
    homeId,
    awayId,
    scheduledDate,
    played: false,
    homeGoals: null,
    awayGoals: null,
    winnerId: null,
  };
}

function roundRobin(entrants, tournamentId, startDate, gapDays) {
  const teams = [...entrants];
  if (teams.length % 2) teams.push(null);
  const rounds = teams.length - 1;
  const half = teams.length / 2;
  const schedule = [];
  let rotation = [...teams];
  for (let round = 1; round <= rounds; round++) {
    const fixtures = [];
    for (let index = 0; index < half; index++) {
      let homeId = rotation[index];
      let awayId = rotation[rotation.length - 1 - index];
      if (!homeId || !awayId) continue;
      if (round % 2) [homeId, awayId] = [awayId, homeId];
      fixtures.push(
        newFixture(
          tournamentId,
          round,
          fixtures.length,
          homeId,
          awayId,
          addDays(startDate, (round - 1) * gapDays),
        ),
      );
    }
    schedule.push(...fixtures);
    rotation = [rotation[0], rotation.at(-1), ...rotation.slice(1, -1)];
  }
  return schedule;
}

function initialLeagueTable(entrants) {
  return Object.fromEntries(
    entrants.map((clubId) => [
      clubId,
      {
        clubId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        points: 0,
      },
    ]),
  );
}

function clubPower(s, clubId) {
  const club = ensurePolitics(s).clubs.find((entry) => entry.clubId === clubId);
  const details = extendedClub(clubId);
  const reputation = Number(details?.rep ?? details?.overall ?? 55);
  return (
    reputation * 0.58 +
    Number(club?.popularity || 50) * 0.24 +
    Number(club?.voteWeight || 1) * 4
  );
}

function tournamentGoals(s, tournament, fixture, clubId, opponentId) {
  const expected = clamp(
    1.15 + (clubPower(s, clubId) - clubPower(s, opponentId)) / 38,
    0.25,
    2.9,
  );
  let value = hash32(`${s.date}|${tournament.id}|${fixture.id}|${clubId}`);
  let goals = 0;
  for (let attempt = 0; attempt < 7; attempt++) {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    const roll = (value >>> 0) / 4_294_967_296;
    if (roll < expected / 7) goals++;
  }
  return goals;
}

function resolveFixture(s, tournament, fixture) {
  const homeGoals = tournamentGoals(
    s,
    tournament,
    fixture,
    fixture.homeId,
    fixture.awayId,
  );
  const awayGoals = tournamentGoals(
    s,
    tournament,
    fixture,
    fixture.awayId,
    fixture.homeId,
  );
  const winnerId =
    homeGoals === awayGoals
      ? hash32(`${tournament.id}|${fixture.id}|extra-time`) % 2
        ? fixture.homeId
        : fixture.awayId
      : homeGoals > awayGoals
        ? fixture.homeId
        : fixture.awayId;
  fixture.homeGoals = homeGoals;
  fixture.awayGoals = awayGoals;
  fixture.winnerId = winnerId;
  fixture.played = true;
  return fixture;
}

function updateLeagueTable(table, fixture) {
  const home = table[fixture.homeId];
  const away = table[fixture.awayId];
  home.played++;
  away.played++;
  home.gf += fixture.homeGoals;
  home.ga += fixture.awayGoals;
  away.gf += fixture.awayGoals;
  away.ga += fixture.homeGoals;
  if (fixture.homeGoals > fixture.awayGoals) {
    home.wins++;
    home.points += 3;
    away.losses++;
  } else if (fixture.homeGoals < fixture.awayGoals) {
    away.wins++;
    away.points += 3;
    home.losses++;
  } else {
    home.draws++;
    away.draws++;
    home.points++;
    away.points++;
  }
}

function leagueChampion(tournament) {
  return Object.values(tournament.table).sort(
    (left, right) =>
      right.points - left.points ||
      right.gf - right.ga - (left.gf - left.ga) ||
      right.gf - left.gf ||
      left.clubId.localeCompare(right.clubId),
  )[0]?.clubId;
}

function awardChampion(s, tournament, clubId) {
  grantFromSupportFund(s, tournament.prizeFundId, clubId, tournament.prizePool);
  tournament.status = "complete";
  tournament.championId = clubId;
  tournament.completedDate = s.date;
  const committees = ensurePolitics(s).committees.competitions;
  committees.history ||= [];
  committees.history.push({
    tournamentId: tournament.id,
    championId: clubId,
    date: s.date,
    prize: tournament.prizePool,
  });
  while (committees.history.length > 120) committees.history.shift();
}

export function createAssociationTournament(s, templateId, sponsorId) {
  const p = requirePresident(s);
  const template = POLITICAL_TOURNAMENTS[templateId];
  const sponsor = POLITICAL_SPONSORS.find((entry) => entry.id === sponsorId);
  if (!template || !sponsor)
    throw new Error(
      tr(
        "البطولة أو الراعي غير متاح.",
        "The competition or sponsor is not available.",
        "La compétition ou le sponsor n’est pas disponible.",
      ),
    );
  const currentSeason = p.committees.competitions.tournaments.filter(
    (entry) => entry.season === s.seasonNumber,
  );
  if (currentSeason.length >= MAX_TOURNAMENTS_PER_SEASON)
    throw new Error(
      tr(
        "وصلت إلى الحد الموسمي لتنظيم البطولات.",
        "The seasonal competition limit has been reached.",
        "La limite saisonnière de compétitions est atteinte.",
      ),
    );
  if (currentSeason.some((entry) => entry.templateId === templateId))
    throw new Error(
      tr(
        "نُظمت هذه البطولة بالفعل في الموسم الحالي.",
        "This competition has already been organised this season.",
        "Cette compétition a déjà été organisée cette saison.",
      ),
    );
  const entrants = eligibleEntrants(s, template);
  if (entrants.length !== template.entryCount)
    throw new Error(
      tr(
        "لا يوجد عدد كافٍ من الأندية المؤهلة لإقامة البطولة.",
        "There are not enough eligible clubs to run this competition.",
        "Il n’y a pas assez de clubs admissibles pour organiser cette compétition.",
      ),
    );
  if (
    template.format === "knockout" &&
    (template.entryCount & (template.entryCount - 1)) !== 0
  )
    throw new Error(
      "Knockout competitions require a power-of-two entry count.",
    );
  const id = `tournament-${(s.nextId = (s.nextId || 0) + 1)}`;
  const drawSeed = `${s.seasonNumber}|${s.date}|${id}|${templateId}`;
  const draw = drawn(entrants, drawSeed);
  const calendarPolicy = p.committees.competitions.calendar;
  const roundGapDays =
    calendarPolicy === "rest-first"
      ? 14
      : calendarPolicy === "commercial"
        ? 3
        : 7;
  const drawFixtures =
    template.format === "knockout"
      ? Array.from({ length: draw.length / 2 }, (_, index) =>
          newFixture(
            id,
            1,
            index,
            draw[index * 2],
            draw[index * 2 + 1],
            s.date,
          ),
        )
      : roundRobin(draw, id, s.date, roundGapDays);
  if (p.finance.funds.length >= 50)
    throw new Error(
      tr(
        "وصل سجل الصناديق إلى الحد الأقصى.",
        "The support-fund register is full.",
        "Le registre des fonds de soutien est plein.",
      ),
    );
  if (
    p.finance.balance + sponsor.contribution <
    template.setupCost + template.prizePool
  )
    throw new Error(
      tr(
        "لا تكفي الخزينة لتغطية جائزة البطولة وتكلفة تنظيمها.",
        "The treasury cannot cover the prize and setup cost.",
        "La trésorerie ne peut pas couvrir le prix et les frais d’organisation.",
      ),
    );
  recordTournamentSponsorship(s, {
    tournamentId: id,
    sponsorId,
    amount: sponsor.contribution,
  });
  chargeTournamentSetup(s, { tournamentId: id, amount: template.setupCost });
  const prizeFund = createSupportFund(s, {
    name: `${localized(template.name)} prize`.slice(0, 60),
    amount: template.prizePool,
    criteria: "all",
  });
  const tournament = {
    id,
    templateId,
    name: template.name,
    description: template.description,
    format: template.format,
    season: s.seasonNumber,
    createdDate: s.date,
    status: "scheduled",
    currentRound: 1,
    entrants: draw,
    drawSeed,
    drawAudited: Boolean(p.council.laws["competition-integrity"]),
    calendarPolicy,
    roundGapDays,
    scheduleStartDate: s.date,
    sponsorId,
    sponsorName: sponsor.name,
    sponsorContribution: sponsor.contribution,
    setupCost: template.setupCost,
    prizePool: template.prizePool,
    prizeFundId: prizeFund.id,
    fixtures: drawFixtures,
    table: template.format === "league" ? initialLeagueTable(draw) : null,
    championId: null,
    completedDate: null,
  };
  p.committees.competitions.tournaments.push(tournament);
  if (p.committees.competitions.tournaments.length > 120)
    p.committees.competitions.tournaments.shift();
  return tournament;
}

export function playAssociationTournamentRound(s, tournamentId) {
  const p = requirePresident(s);
  const tournament = p.committees.competitions.tournaments.find(
    (entry) => entry.id === tournamentId,
  );
  if (!tournament || tournament.status !== "scheduled")
    throw new Error(
      tr(
        "البطولة غير متاحة أو اكتملت بالفعل.",
        "The competition is unavailable or already complete.",
        "La compétition n’est pas disponible ou est déjà terminée.",
      ),
    );
  const pending = tournament.fixtures.filter(
    (fixture) => fixture.round === tournament.currentRound && !fixture.played,
  );
  if (!pending.length)
    throw new Error(
      tr(
        "لا توجد مباريات متبقية في هذه الجولة.",
        "There are no remaining matches in this round.",
        "Il ne reste aucun match dans cette journée.",
      ),
    );
  const scheduledDate = pending[0].scheduledDate;
  if (s.date < scheduledDate)
    throw new Error(
      `${tr(
        "موعد الجولة القادمة هو",
        "The next round is scheduled for",
        "La prochaine journée est prévue le",
      )} ${scheduledDate}.`,
    );
  for (const fixture of pending) {
    resolveFixture(s, tournament, fixture);
    if (tournament.format === "league")
      updateLeagueTable(tournament.table, fixture);
  }
  if (tournament.format === "league") {
    const rounds = Math.max(
      ...tournament.fixtures.map((fixture) => fixture.round),
    );
    if (tournament.currentRound < rounds) tournament.currentRound++;
    else awardChampion(s, tournament, leagueChampion(tournament));
  } else {
    const winners = pending.map((fixture) => fixture.winnerId);
    if (winners.length === 1) awardChampion(s, tournament, winners[0]);
    else {
      const nextRound = tournament.currentRound + 1;
      const nextDraw = drawn(
        winners,
        `${tournament.drawSeed}|round-${nextRound}`,
      );
      const nextFixtures = Array.from(
        { length: nextDraw.length / 2 },
        (_, index) =>
          newFixture(
            tournament.id,
            nextRound,
            index,
            nextDraw[index * 2],
            nextDraw[index * 2 + 1],
            addDays(
              tournament.scheduleStartDate,
              (nextRound - 1) * tournament.roundGapDays,
            ),
          ),
      );
      tournament.fixtures.push(...nextFixtures);
      tournament.currentRound = nextRound;
    }
  }
  return tournament;
}

export const politicalTournamentTemplates = () =>
  Object.values(POLITICAL_TOURNAMENTS);
export const politicalSponsors = () => POLITICAL_SPONSORS;
