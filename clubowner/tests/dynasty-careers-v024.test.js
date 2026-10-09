import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { validateSave } from "../src/core/validation.js";
import { offersFor } from "../src/services/sponsors.js";
import { transferReply } from "../src/services/transfers.js";
import { createDynastyChild } from "../src/services/dynasty.js";
import {
  dynastySiblings,
  promoteDynastyPlayer,
  reconcileSiblings,
  setCareerPath,
  siblingConflictDay,
} from "../src/services/dynastyCareers.js";
import { dynastyView } from "../src/features/dynasty.js";
import { getLanguage, setLanguage } from "../src/i18n/index.js";

test("all four career paths are selectable, with useful distinct effects and no rebellion penalty", () => {
  const playerSave = createGame({ database: "current", leagues: ["eg"] });
  const playerChild = createDynastyChild(playerSave, { name: "Future Player", age: 16 });
  playerSave.dynasty.children.push(playerChild);
  setCareerPath(playerSave, playerChild.id, "player");
  assert.equal(playerChild.careerPath, "player");
  assert.equal(playerChild.academy.enrolled, true, "the player path opens the academy route");
  assert.equal(playerSave.dynasty.ownerBonuses.playerRelations, 5);
  assert.throws(() => setCareerPath(playerSave, playerChild.id, "business"), /اختار الابن مساره بالفعل/);
  validateSave(playerSave);

  const businessSave = createGame({ database: "current", leagues: ["eg"] });
  const businessChild = createDynastyChild(businessSave, { name: "Future Entrepreneur", age: 19 });
  businessSave.dynasty.children.push(businessChild);
  const beforeOffer = offersFor(businessSave, "front")[0].amount;
  setCareerPath(businessSave, businessChild.id, "business");
  assert.equal(businessChild.careerPath, "business");
  assert.equal(businessSave.dynasty.ownerBonuses.sponsorNegotiation, 5);
  assert(offersFor(businessSave, "front")[0].amount > beforeOffer);
  validateSave(businessSave);

  const celebritySave = createGame({ database: "current", leagues: ["eg"] });
  const celebrityChild = createDynastyChild(celebritySave, { name: "Future Celebrity", age: 17 });
  celebritySave.dynasty.children.push(celebrityChild);
  const reputation = celebritySave.reputation;
  const shirts = celebritySave.dynasty.shirtSales;
  setCareerPath(celebritySave, celebrityChild.id, "celebrity");
  assert.equal(celebritySave.dynasty.ownerBonuses.clubFame, 5);
  assert(celebritySave.reputation > reputation);
  assert(celebritySave.dynasty.shirtSales > shirts);
  validateSave(celebritySave);

  const independentSave = createGame({ database: "current", leagues: ["eg"] });
  const independentChild = createDynastyChild(independentSave, { name: "Independent", age: 16 });
  independentSave.dynasty.children.push(independentChild);
  const balance = independentSave.dynasty.publicBalance;
  const independentReputation = independentSave.reputation;
  setCareerPath(independentSave, independentChild.id, "rebellious");
  assert.equal(independentChild.careerPath, "rebellious");
  assert.equal(independentSave.dynasty.publicBalance, balance, "the independent path is never penalized");
  assert.equal(independentSave.reputation, independentReputation);
  assert.equal(independentSave.dynasty.ownerBonuses.autonomy, 5);
  validateSave(independentSave);
});

test("player-path relations improve the club's transfer-reply threshold", () => {
  const baseline = createGame({ database: "current", leagues: ["eg"] });
  const connected = structuredClone(baseline);
  const prepare = (s) => {
    const player = s.players.find((item) => item.clubId !== s.clubId && item.status !== "retired");
    player.value = 1_000_000;
    player.contractTerms.releaseClause = 0;
    s.negotiations.push({ id: "relationship-negotiation", playerId: player.id, stage: "waiting", fee: 0, seller: player.clubId });
  };
  prepare(baseline);
  prepare(connected);
  connected.dynasty.ownerBonuses.playerRelations = 5;
  transferReply(baseline, "relationship-negotiation");
  transferReply(connected, "relationship-negotiation");
  assert(connected.negotiations[0].counter < baseline.negotiations[0].counter);
});

test("a ready academy graduate becomes a linked first-team player exactly once", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(s, {
    name: "First Team Heir",
    age: 16,
    stats: { talent: 88, discipline: 82, ambition: 75 },
  });
  s.dynasty.children.push(child);
  setCareerPath(s, child.id, "player");
  child.academy.rating = 76;
  child.academy.trialReady = true;
  const count = s.players.length;
  const cash = s.finance.cash;
  const player = promoteDynastyPlayer(s, child.id);
  assert.equal(s.players.length, count + 1);
  assert.equal(child.playerId, player.id);
  assert.equal(player.name, child.name);
  assert.equal(player.birthDate, child.birthDate);
  assert.equal(player.age, child.age);
  assert.equal(player.position, "CM");
  assert.equal(player.clubId, s.clubId);
  assert.equal(player.dynastyChildId, child.id);
  assert.equal(child.academy.enrolled, false);
  assert.equal(child.academy.trialReady, false);
  assert(s.finance.cash < cash, "the signing bonus is posted to the club ledger");
  assert.throws(() => promoteDynastyPlayer(s, child.id), /تسجيل هذا الابن لاعبًا بالفعل/);
  validateSave(s);
});

test("monthly sibling rivalry responds to heir attention and can be reconciled", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const heir = createDynastyChild(s, {
    name: "Heir",
    age: 16,
    stats: { talent: 92, discipline: 70, ambition: 35 },
  });
  const sibling = createDynastyChild(s, {
    name: "Sibling",
    age: 16,
    stats: { talent: 55, discipline: 65, ambition: 92 },
  });
  const third = createDynastyChild(s, { name: "Youngest", age: 13 });
  heir.isHeir = true;
  s.dynasty.heirId = heir.id;
  s.dynasty.children.push(heir, sibling, third);
  sibling.relationship = 35;
  sibling.jealousy = 50;
  s.dynasty.publicBalance = 25;
  s.dynasty.lastSiblingMonth = null;
  assert.equal(dynastySiblings(s, sibling.id).length, 3);
  siblingConflictDay(s);
  assert(sibling.jealousy > 0);
  assert(sibling.growth.pendingMilestones.includes("sibling-conflict"));
  const snapshot = sibling.jealousy;
  siblingConflictDay(s);
  assert.equal(sibling.jealousy, snapshot, "rivalry is updated once per month");
  sibling.jealousy = 60;
  const beforeRelation = sibling.relationship;
  reconcileSiblings(s, sibling.id);
  assert.equal(sibling.jealousy, 42);
  assert(sibling.relationship > beforeRelation);
  assert.equal(heir.jealousy, 0, "the discussion lowers jealousy across the sibling group");
  assert(!sibling.growth.pendingMilestones.includes("sibling-conflict"));
  validateSave(s);
});

test("career-path choices render in Arabic, English and French", () => {
  const s = createGame({ database: "current", leagues: ["eg"] });
  const child = createDynastyChild(s, { name: "Route Heir", age: 16 });
  s.dynasty.children.push(child);
  const original = getLanguage();
  try {
    for (const [language, routeLabel] of [
      ["ar", "لاعب للفريق الأول"],
      ["en", "First-team player"],
      ["fr", "Joueur de l’équipe première"],
    ]) {
      setLanguage(language);
      const html = dynastyView(s);
      assert(html.includes(routeLabel));
      assert(html.includes('data-action="dynasty-career-path"'));
      assert(html.includes('data-path="rebellious"'));
    }
  } finally {
    setLanguage(original);
  }
});
