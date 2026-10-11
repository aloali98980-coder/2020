import assert from "node:assert/strict";
import test from "node:test";
import { addDays } from "../src/core/utils.js";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { ticketForecast } from "../src/services/commerce.js";
import { getDerbyInfo } from "../src/services/derby.js";
import { advanceTime } from "../src/services/time.js";
import { acceptClub, signPlayer, submitOffer } from "../src/services/transfers.js";
import { answerBid } from "../src/services/clubManagement.js";
import {
  canFulfilSupporterDemand,
  eligibleUltrasEvents,
  fanAttendanceMultiplier,
  forceSupporterClash,
  fulfilSupporterDemand,
  generateUniqueUltrasNames,
  imposeUltrasStadiumSanction,
  moodLevel,
  organizeAwaySupport,
  pressureRivalSupporters,
  recordSupporterResult,
  recordSupporterSale,
  recordSupporterSigning,
  resolveUltrasEvent,
  supporterMatchBonus,
  recordTicketPriceChange,
  respondToSupporterDemand,
  setSupporterMood,
  startSupporterDemand,
  ultrasDay,
  ultrasGroup,
} from "../src/services/ultras.js";
import { ULTRAS_EVENT_CATALOG } from "../src/data/ultrasEvents.js";

const makeGame = () => createGame({ database: "demo", leagues: ["eg"] });
const makeFixture = (save, id, home, away, days = 3) => ({
  id,
  date: addDays(save.date, days),
  home,
  away,
  neutral: false,
  played: false,
  homeGoals: 0,
  awayGoals: 0,
});

test("every active club gets a deterministic, unique AR/EN/FR ultras name", () => {
  const ids = ["north-town", "south-town", "east-town", "west-town"];
  const clubs = Object.fromEntries(ids.map((id) => [id, {
    name: "Harbor City FC",
    short: "Harbor",
    city: "Port City",
    color: "#345678",
    wiki: "Harbor City Football Club",
  }]));
  const first = generateUniqueUltrasNames(ids, clubs);
  const second = generateUniqueUltrasNames(ids, clubs);
  assert.deepEqual(first, second, "name generation remains stable across reloads");
  for (const lang of ["ar", "en", "fr"]) {
    const values = Object.values(first).map((name) => name[lang].toLocaleLowerCase());
    assert.equal(new Set(values).size, ids.length, `${lang} names are collision-free`);
    assert(values.every((name) => name.length > 3));
  }
  const s = makeGame();
  assert.equal(Object.keys(s.ultras.groups).length, s.table.length);
  for (const row of s.table) assert.equal(s.ultras.groups[row.clubId].clubId, row.clubId);
  assert.equal(new Set(Object.values(s.ultras.groups).map((group) => group.name.en)).size, Object.keys(s.ultras.groups).length);
  assert.equal(validateSave(s), s);
});

test("match results, ticket changes and supporter actions move mood and council confidence", () => {
  const s = makeGame();
  const home = ultrasGroup(s, s.clubId);
  const rival = ultrasGroup(s, "zamalek");
  const originalMood = home.mood;
  const originalFanSupport = s.fanSupport;
  const political = s.politics.clubs.find((club) => club.clubId === s.clubId);
  const originalPoliticalSupport = political.support;
  const playerMorale = s.players.find((player) => player.clubId === s.clubId).morale;
  setSupporterMood(s, s.clubId, -35, "test-price-grievance");
  assert.equal(moodLevel(home.mood), "angry");
  assert(home.mood < originalMood);
  assert(s.fanSupport < originalFanSupport);
  const afterMoodDrop = home.mood;

  const fixture = { ...makeFixture(s, "ultras-derby-test", s.clubId, "zamalek"), isDerby: true, homeGoals: 0, awayGoals: 2, played: true };
  recordSupporterResult(s, fixture);
  assert(home.mood < afterMoodDrop, "a derby loss lowers our supporters’ mood");
  assert(rival.mood > 66, "a derby win lifts rival supporters’ mood");
  assert.equal(home.lastResult.outcome, "loss");
  assert.equal(rival.lastResult.outcome, "win");
  assert(s.players.find((player) => player.clubId === s.clubId).morale < playerMorale, "angry supporters boo and affect morale");
  assert(political.support < originalPoliticalSupport, "supporter mood also informs the association council map");

  const beforeTicketMood = home.mood;
  recordTicketPriceChange(s, 100, 220);
  assert(home.mood < beforeTicketMood, "a steep ticket-price hike angers supporters");
  assert(home.boycottUntil >= s.date, "high prices can spark a short boycott");
});

test("selling stars, changing the badge, neglect, and away travel affect supporters", () => {
  const sale = makeGame();
  const group = ultrasGroup(sale, sale.clubId);
  const star = sale.players.find((player) => player.clubId === sale.clubId && player.status === "active");
  star.rating = 84;
  const moodBeforeSale = group.mood;
  assert.equal(recordSupporterSale(sale, star), true);
  assert(group.mood < moodBeforeSale);
  assert.equal(group.lastStarSaleDate, sale.date);

  const demand = startSupporterDemand(sale, "star");
  const newSigning = sale.players.find((player) => player.clubId !== sale.clubId && player.status === "active");
  newSigning.rating = 78;
  newSigning.clubId = sale.clubId;
  const moodBeforeWelcome = group.mood;
  assert.equal(recordSupporterSigning(sale, newSigning), true);
  assert(group.mood > moodBeforeWelcome);
  assert.equal(demand.signedStarId, newSigning.id);
  assert.equal(canFulfilSupporterDemand(sale), true);

  const badgeGame = makeGame();
  const badgeGroup = ultrasGroup(badgeGame, badgeGame.clubId);
  const badgeMood = badgeGroup.mood;
  badgeGame.ultras.pendingEvent = {
    id: "ultras-badge-test",
    eventId: "badge-redesign-poll",
    date: badgeGame.date,
    mode: "decision",
    messageId: "ultras-message-test",
  };
  resolveUltrasEvent(badgeGame, "ultras-badge-test", "redesign");
  assert.equal(badgeGroup.badgeRevision, 1);
  assert(badgeGroup.mood < badgeMood, "a badge redesign without consent can cause an identity backlash");

  const neglected = makeGame();
  const neglectedGroup = ultrasGroup(neglected, neglected.clubId);
  neglected.date = `${neglected.date.slice(0, 4)}-12-01`;
  neglectedGroup.lastOwnerActionDate = addDays(neglected.date, -60);
  const neglectedMood = neglectedGroup.mood;
  ultrasDay(neglected);
  assert.equal(neglectedGroup.mood, neglectedMood - 2);

  const away = makeGame();
  const awayFixture = makeFixture(away, "ultras-away-bonus", "zamalek", away.clubId, 6);
  away.fixtures.push(awayFixture);
  organizeAwaySupport(away, awayFixture.id);
  assert(supporterMatchBonus(away, away.clubId, awayFixture, false) > 0, "organized away support adds a small performance boost");
});

test("real transfers welcome an incoming star and sour supporters after an outgoing star sale", () => {
  const signing = createGame({ database: "demo", clubId: "ahly", leagues: ["eg", "en", "sa"] });
  const candidate = signing.players.find((player) =>
    player.clubId !== signing.clubId && player.status === "active" && !player.loan && player.rating >= 72,
  );
  assert(candidate, "the demo market has a signing-quality player");
  const demandGroup = ultrasGroup(signing, signing.clubId);
  const moodBeforeSigning = demandGroup.mood;
  const negotiation = submitOffer(signing, candidate.id, { fee: candidate.value, upfrontPercent: 40 });
  signing.finance.cash = Math.max(signing.finance.cash, candidate.value * 2);
  signing.finance.wageBudget = Math.max(signing.finance.wageBudget, 1_000_000_000);
  const reply = advanceTime(signing, 1);
  assert.equal(reply.advanced, 1);
  assert.equal(negotiation.stage, "club-reply");
  acceptClub(signing, negotiation.id);
  signPlayer(signing, negotiation.id, {
    salary: Math.max(candidate.salary, 1),
    bonus: 0,
    years: 3,
    role: "أساسي",
  });
  assert.equal(candidate.clubId, signing.clubId);
  assert.equal(demandGroup.lastSigningPlayer.id, candidate.id);
  assert(demandGroup.mood > moodBeforeSigning);

  const sale = createGame({ database: "world", clubId: "ahly", expanded: true, leagues: ["eg"] });
  const star = sale.players.find((player) =>
    player.clubId === sale.clubId && player.status === "active" && !player.loan && player.rating >= 80,
  );
  const buyer = sale.table.find((row) => row.clubId !== sale.clubId)?.clubId;
  assert(star && buyer, "the expanded season has an eligible star and buyer");
  const supporters = ultrasGroup(sale, sale.clubId);
  const moodBeforeSale = supporters.mood;
  sale.expansion.budgets[buyer] = Math.max(sale.expansion.budgets[buyer] || 0, 200_000);
  sale.management.outgoing.push({
    id: "ultras-star-sale-test",
    playerId: star.id,
    buyer,
    fee: 100_000,
    expires: addDays(sale.date, 7),
    status: "open",
  });
  answerBid(sale, "ultras-star-sale-test", true);
  assert.equal(star.clubId, buyer);
  assert.equal(supporters.lastStarSaleRating, Math.round(star.rating));
  assert(supporters.mood < moodBeforeSale);
});

test("timed demands support fulfil, negotiate, ignore, and escalating consequences", () => {
  const fulfil = makeGame();
  const group = ultrasGroup(fulfil, fulfil.clubId);
  const originalPrice = fulfil.ticketPrice;
  startSupporterDemand(fulfil, "ticket");
  assert.equal(fulfil.ultras.groups[fulfil.clubId].demand.due, addDays(fulfil.date, 21));
  assert.equal(canFulfilSupporterDemand(fulfil), true);
  fulfilSupporterDemand(fulfil);
  assert(fulfil.ticketPrice < originalPrice);
  assert.equal(group.demand, null);
  assert(group.mood > 66);

  const negotiate = makeGame();
  const negotiation = startSupporterDemand(negotiate, "coach");
  const originalDeadline = negotiation.due;
  respondToSupporterDemand(negotiate, "negotiate");
  assert.equal(negotiation.due, addDays(negotiate.date, 21));
  assert(negotiation.due >= originalDeadline);
  assert.equal(negotiation.negotiations, 1);
  respondToSupporterDemand(negotiate, "ignore");
  assert.equal(negotiation.escalation, 1);
  assert(negotiate.ultras.groups[negotiate.clubId].boycottUntil >= negotiate.date);

  negotiation.due = negotiate.date;
  ultrasDay(negotiate);
  const pending = negotiate.ultras.pendingEvent;
  assert.equal(pending.eventId, "demand-response");
  assert.equal(negotiate.ultras.groups[negotiate.clubId].demand.escalation, 2);
  assert(negotiate.ultras.groups[negotiate.clubId].chantStrikeUntil >= negotiate.date);
  respondToSupporterDemand(negotiate, "negotiate");
  assert.equal(negotiate.ultras.pendingEvent, null);
  assert(negotiate.inbox.some((mail) => mail.kind === "ultras-event" && mail.status === "resolved"));
  assert.equal(validateSave(negotiate), negotiate);
});

test("boycotts reduce attendance and ticket revenue; away trips and media pressure have effects", () => {
  const s = makeGame();
  const homeFixture = makeFixture(s, "ultras-ticket-test", s.clubId, "zamalek", 4);
  const baseline = ticketForecast(s, homeFixture);
  const group = ultrasGroup(s, s.clubId);
  group.boycottUntil = addDays(homeFixture.date, 2);
  assert(fanAttendanceMultiplier(s, s.clubId, homeFixture.date) < 0.6);
  const boycotted = ticketForecast(s, homeFixture);
  assert(boycotted.attendance < baseline.attendance);
  assert(boycotted.gross < baseline.gross);

  s.fixtures.push(makeFixture(s, "ultras-rival-campaign", s.clubId, "zamalek", 5));
  const suspicion = s.blackFiles.suspicion;
  pressureRivalSupporters(s, "zamalek");
  assert(s.blackFiles.suspicion > suspicion, "pressure campaigns feed the suspicion system");
  assert(s.staffCorp.social.posts.some((post) => post.kind === "ultras-rival-campaign"));
  assert(s.staffCorp.social.followers > 0);

  const trip = makeGame();
  const awayFixture = makeFixture(trip, "ultras-away-trip", "zamalek", trip.clubId, 6);
  trip.fixtures.push(awayFixture);
  const beforeCash = trip.finance.cash;
  const organized = organizeAwaySupport(trip, awayFixture.id);
  assert.equal(organized.id, awayFixture.id);
  assert(trip.finance.cash < beforeCash);
  assert.equal(trip.ultras.groups[trip.clubId].awayFixtureId, awayFixture.id);
});

test("more than twenty logically gated, translated choice and flavor events are defined", () => {
  assert(ULTRAS_EVENT_CATALOG.length >= 20);
  for (const event of ULTRAS_EVENT_CATALOG) {
    assert.equal(typeof event.condition, "function", `${event.id} has a condition`);
    for (const lang of ["ar", "en", "fr"]) {
      assert(event.title[lang], `${event.id} has a ${lang} title`);
      assert(event.body[lang], `${event.id} has ${lang} copy`);
      for (const action of event.choices) assert(action.label[lang], `${event.id} choice has ${lang} copy`);
    }
  }
  const s = makeGame();
  assert.equal(eligibleUltrasEvents(s).some((event) => event.id === "dog-on-pitch"), false, "the dog event needs a home match in the next three days");
  const dog = makeFixture(s, "ultras-dog-event", s.clubId, "zamalek", 2);
  s.fixtures.push(dog);
  const eligible = eligibleUltrasEvents(s);
  assert(eligible.some((event) => event.id === "dog-on-pitch"));
  assert(eligible.some((event) => event.id === "stand-proposal"));
  const derby = makeFixture(s, "ultras-derby-event", s.clubId, "zamalek", 8);
  s.fixtures.push(derby);
  assert(getDerbyInfo(derby.home, derby.away, s).isDerby);
  assert(eligibleUltrasEvents(s).some((event) => event.id === "derby-tifo-plan"));
});

test("supporter choice mail is non-blocking and stale choices expire into the history", () => {
  const s = makeGame();
  const group = ultrasGroup(s, s.clubId);
  group.mood = 90;
  s.ultras.nextEventDate = s.date;
  ultrasDay(s);
  const pending = s.ultras.pendingEvent;
  assert(pending);
  const mail = s.inbox.find((entry) => entry.id === pending.messageId);
  assert(mail);
  assert.equal(mail.required, false, "supporter scenes should not pause regular game progression");

  s.date = addDays(s.date, 14);
  ultrasDay(s);
  assert.equal(mail.status, "resolved");
  assert.equal(mail.read, true);
  assert.notEqual(s.ultras.pendingEvent?.id, pending.id);
  assert(s.ultras.history.some((entry) => entry.eventId === pending.eventId && entry.result === "expired"));
});

test("clashes carry fines and scandal; association presidents can sanction a rival stand", () => {
  const s = makeGame();
  const rival = ultrasGroup(s, "zamalek");
  const cash = s.finance.cash;
  const reputation = s.reputation;
  const suspicion = s.blackFiles.suspicion;
  forceSupporterClash(s, "zamalek");
  assert.equal(s.finance.cash, cash - 100_000); // 0.45: الغرامة 100,000 (انظر docs/balance-audit-0.44.md)
  assert(s.reputation < reputation);
  assert(s.blackFiles.suspicion > suspicion);
  assert.equal(rival.lastIncident.kind, "clash");
  s.politics.office.held = true;
  const sanction = imposeUltrasStadiumSanction(s, "zamalek");
  assert.equal(rival.stadiumSanctionUntil, addDays(s.date, 14));
  assert.equal(sanction.clubId, "zamalek");
  assert(s.politics.committees.history.some((entry) => entry.type === "ultras-stadium-sanction"));
  assert(fanAttendanceMultiplier(s, "zamalek") < 0.75);
});

test("v36 saves migrate with a generated group for every club and preserve audio and money", () => {
  const old = makeGame();
  old.version = 36;
  delete old.ultras;
  const cash = old.finance.cash;
  const tableIds = old.table.map((row) => row.clubId);
  const migrated = migrateSave(old);
  assert.equal(old.version, 36, "migration does not mutate source save");
  assert.equal(SAVE_VERSION, 38);
  assert.equal(migrated.version, 38);
  assert.equal(migrated.finance.cash, cash);
  assert.equal(migrated.preferences.audio.enabled, true);
  for (const clubId of tableIds) assert(migrated.ultras.groups[clubId]);
  assert.equal(migrateSave(migrated), migrated);
  assert.equal(validateSave(migrated), migrated);
});
