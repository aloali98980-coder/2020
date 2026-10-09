import test from "node:test";
import assert from "node:assert/strict";
import { createGame, SAVE_VERSION } from "../src/core/game.js";
import { migrateSave } from "../src/core/migrations.js";
import { validateSave } from "../src/core/validation.js";
import { advanceTime } from "../src/services/time.js";
import { retirementDay } from "../src/services/careers.js";
import { extendedClub } from "../src/data/expandedCatalog.js";
import {
  LEGENDS,
  LEGEND_ROLES,
  LEGEND_GROUPS,
  legendById,
  resolveLegendClub,
  legendGroup,
} from "../src/data/legends.js";
import {
  initLegends,
  legendQuote,
  signLegend,
  releaseLegend,
  renewLegend,
  legendReleaseCost,
  legendDay,
  legendMatchBonus,
  legendWearFactor,
  legendBeneficiaries,
  setLegendPlayerMode,
  activeLegendContracts,
  inductRetiree,
  MAX_LEGEND_PLAYERS,
} from "../src/services/legends.js";
import { legendsView, legendDetailModal, filteredLegends } from "../src/features/legends.js";

const game = (clubId) =>
  createGame({
    database: "world",
    expanded: true,
    leagues: ["eg"],
    difficulty: "easy",
    ...(clubId ? { clubId } : {}),
  });

const settle = (s) => {
  for (const m of s.inbox) if (m.required) m.status = "resolved";
};

const POSITIONS = ["GK", "CB", "RB", "LB", "DM", "CM", "AM", "RW", "LW", "ST"];

test("Legends catalogue: real retired names, resolvable clubs, editorial flags", () => {
  assert(LEGENDS.length >= 140);
  assert.equal(new Set(LEGENDS.map((l) => l.id)).size, LEGENDS.length);
  assert.equal(new Set(LEGENDS.map((l) => l.nameLatin)).size, LEGENDS.length);
  for (const l of LEGENDS) {
    assert(POSITIONS.includes(l.position), l.id);
    assert(l.peak >= 78 && l.peak <= 99, l.id);
    assert(l.born >= 1920 && l.born <= 1990, l.id);
    assert(/^\d{4}–\d{4}$/.test(l.era), l.id);
    assert(l.name && l.nameLatin && l.bio && l.countryName, l.id);
    assert(l.biographyUrl.startsWith("https://en.wikipedia.org/wiki/"), l.id);
    assert.equal(l.sourceStatus, "legend-editorial");
    assert.equal(l.clubIds.length, l.clubs.length, `${l.id}: ${l.clubs.join(",")}`);
    assert.equal(l.rivalIds.length, l.rivals.length, l.id);
    for (const id of [...l.clubIds, ...l.rivalIds]) assert(extendedClub(id), `${l.id} → ${id}`);
    assert.equal(l.group, legendGroup(l.position));
    assert(LEGEND_GROUPS[l.group].positions.includes(l.position));
    for (const k of ["pace", "passing", "shooting", "defending", "stamina", "decisions"])
      assert(l.attributes[k] >= 20 && l.attributes[k] <= 99, `${l.id}.${k}`);
    assert(["icon", "legend", "star"].includes(l.tier.id));
  }
  assert(LEGENDS.filter((l) => l.country === "eg").length >= 15);
  assert(LEGENDS.filter((l) => l.country === "sa").length >= 3);
  for (const g of Object.keys(LEGEND_GROUPS))
    assert(LEGENDS.filter((l) => l.group === g).length >= 10, g);
  assert.equal(resolveLegendClub("Al Ahly SC"), "ahly");
  assert.equal(resolveLegendClub("ismaily"), "ismaily");
  assert.equal(resolveLegendClub("Nowhere FC"), null);
  assert.deepEqual(legendById("elkhatib").rivalIds, ["zamalek"]);
  assert.equal(legendById("elhadary").group, "gk");
  assert.equal(LEGEND_ROLES.gk.attributes[0], "defending");
});

test("New saves ship v17 legends state; classic and expanded both validate", () => {
  assert.equal(SAVE_VERSION, 24);
  const s = game();
  assert.deepEqual(s.legends, initLegends());
  assert.equal(s.legends.playerMode, true);
  validateSave(s);
  const classic = createGame({ clubId: "ahly" });
  assert.equal(classic.version, SAVE_VERSION);
  assert.deepEqual(classic.legends, initLegends());
  validateSave(classic);
  const c = signLegend(classic, "shobair", "gk", 1);
  assert.equal(c.status, "active");
  validateSave(classic);
});

test("Quotes are pure and deterministic: affiliation discount, rival refusal, reputation gates", () => {
  const s = game();
  assert.equal(s.clubId, "ahly");
  const aff = legendQuote(s, "elkhatib", "attack", 2);
  assert.equal(aff.status, "accepted");
  assert(aff.affiliated);
  assert.equal(aff.total, aff.fee + aff.salary * 24);
  const t = structuredClone(s);
  t.clubId = "pyramids";
  const plain = legendQuote(t, "elkhatib", "attack", 2);
  assert(!plain.affiliated);
  assert.equal(aff.fee, Math.round((plain.fee * 0.75) / 100_000) * 100_000);
  assert.deepEqual(legendQuote(s, "elkhatib", "attack", 2), aff);
  const rival = legendQuote(s, "gaafar", "midfield", 1);
  assert.equal(rival.status, "refused");
  assert(rival.rival);
  const weak = structuredClone(s);
  weak.clubId = "pyramids";
  weak.reputation = 50;
  assert.equal(legendQuote(weak, "elkhatib", "attack", 1).status, "refused");
  weak.reputation = 66;
  const counter = legendQuote(weak, "elkhatib", "attack", 1);
  assert.equal(counter.status, "countered");
  assert(counter.fee > plain.fee);
  weak.reputation = 80;
  assert.equal(legendQuote(weak, "elkhatib", "attack", 1).status, "accepted");
  const player = legendQuote(s, "elkhatib", "player", 1);
  assert(player.fee > aff.fee * 2, "player comeback costs far more than a coaching role");
  setLegendPlayerMode(s, false);
  assert.equal(legendQuote(s, "elkhatib", "player", 1).status, "refused");
  setLegendPlayerMode(s, true);
  assert.throws(() => legendQuote(s, "elkhatib", "gk", 1), /لا يناسب/);
  assert.throws(() => legendQuote(s, "elkhatib", "player", 3), /مدة/);
  assert.throws(() => legendQuote(s, "nobody", "attack", 1), /غير موجودة/);
});

test("Signing a legend coach: fee posted once, one per role, match bonus and slower ageing for the group", () => {
  const s = game();
  const cash = s.finance.cash;
  const q = legendQuote(s, "elkhatib", "attack", 2);
  const c = signLegend(s, "elkhatib", "attack", 2);
  assert.equal(s.finance.cash, cash - q.fee);
  assert.equal(s.finance.ledger.filter((e) => e.key === `legend-fee-${c.id}`).length, 1);
  assert.equal(c.kind, "coach");
  assert.equal(c.end, "2028-09-23");
  assert(s.inbox.some((m) => m.kind === "legend-signed" && m.ref === c.id));
  assert.throws(() => signLegend(s, "elkhatib", "ambassador", 1), /عقد نشط/);
  assert.throws(() => signLegend(s, "hossamhassan", "attack", 1), /بالفعل/);
  assert.throws(() => signLegend(s, "hazememam", "midfield", 1), /غريم/);
  const bonus = legendMatchBonus(s);
  assert(bonus > 0.3 && bonus < 0.5, String(bonus));
  const striker = s.players.find((p) => p.clubId === s.clubId && p.position === "ST");
  const keeper = s.players.find((p) => p.clubId === s.clubId && p.position === "GK");
  const foreign = s.players.find((p) => p.clubId !== s.clubId && p.position === "ST");
  assert.equal(legendWearFactor(s, striker), 0.88);
  assert.equal(legendWearFactor(s, keeper), 1);
  assert.equal(legendWearFactor(s, foreign), 1);
  assert(legendBeneficiaries(s, c).every((p) => LEGEND_GROUPS.attack.positions.includes(p.position)));
  validateSave(s);
});

test("Monthly legend day: idempotent salary, capped attribute gains, ambassador income", () => {
  const s = game();
  const coach = signLegend(s, "elhadary", "gk", 1);
  const amb = signLegend(s, "hossamhassan", "ambassador", 1);
  const keepers = legendBeneficiaries(s, coach);
  assert(keepers.length >= 1);
  for (const p of keepers) {
    p.attributes.defending = 98.9;
    p.rating = p.potential;
  }
  while (s.date < "2026-10-01") {
    settle(s);
    advanceTime(s, 1);
  }
  assert.equal(s.date, "2026-10-01");
  const salaries = s.finance.ledger.filter((e) => e.category === "legend-salary" && e.date === s.date);
  assert.equal(salaries.length, 2);
  assert.deepEqual(
    salaries.map((e) => -e.amount).sort(),
    [coach.salary, amb.salary].sort(),
  );
  const income = s.finance.ledger.find((e) => e.category === "legend-income" && e.date === s.date);
  assert(income && income.amount > 0 && income.amount < amb.salary);
  assert.equal(amb.income, income.amount);
  assert.equal(amb.sessions, 1);
  const again = s.finance.cash;
  legendDay(s);
  assert.equal(s.finance.cash, again, "same day never posts twice");
  assert.equal(amb.sessions, 1);
  for (const p of keepers) {
    assert(p.attributes.defending <= 99);
    assert(p.rating <= Math.max(p.potential, p.rating));
  }
  const before = s.finance.ledger.filter((e) => e.category === "legend-salary").length;
  while (s.date < "2026-12-01") {
    settle(s);
    advanceTime(s, 1);
  }
  assert.equal(s.finance.ledger.filter((e) => e.category === "legend-salary").length, before + 4);
  assert(coach.sessions >= 1, "three months of sessions should hit at least one keeper");
  assert(coach.lastEffect && coach.lastEffect.date === "2026-12-01");
  assert.equal(amb.sessions, 3);
  validateSave(s);
});

test("Fantasy comeback: legend plays for the club, retires when the contract ends and enters the hall", () => {
  const s = game();
  const squad = s.players.filter((p) => p.clubId === s.clubId).length;
  const c = signLegend(s, "aboutrika", "player", 1);
  const p = s.players.find((x) => x.id === c.playerId);
  assert(p && p.clubId === s.clubId && p.legendId === "aboutrika");
  assert.equal(p.age, 31);
  assert.equal(p.rating, 88);
  assert.equal(p.potential, 88);
  assert.equal(p.sourceStatus, "legend-editorial");
  assert.equal(p.fictional, false);
  assert.equal(s.players.filter((x) => x.clubId === s.clubId).length, squad + 1);
  validateSave(s);
  signLegend(s, "hossamhassan", "player", 1);
  assert.throws(() => signLegend(s, "elkhatib", "player", 1), new RegExp(String(MAX_LEGEND_PLAYERS)));
  for (let day = 0; day < 372 && s.legends.contracts[0].status === "active"; day++) {
    settle(s);
    advanceTime(s, 1);
  }
  const ended = s.legends.contracts[0];
  assert.equal(ended.status, "ended");
  assert.equal(ended.endedBecause, "expired");
  assert.equal(p.status, "retired");
  assert.equal(p.clubId, "retired");
  assert(p.appearances > 5, `legend should actually play: ${p.appearances}`);
  assert(s.legends.hall.some((h) => h.playerId === p.id && h.legendId === "aboutrika"));
  assert(s.inbox.some((m) => m.kind === "legend-inducted" && m.ref === p.id));
  assert(!s.staff.some((x) => x.personId === p.id), "legends never become generic staff candidates");
  validateSave(s);
});

test("Release and renewal follow the coach rules: two months per remaining year, one-month renewal bonus", () => {
  const s = game();
  const c = signLegend(s, "waelgomaa", "defence", 3);
  assert.equal(legendReleaseCost(s, c.id), c.salary * 2 * 3);
  const cash = s.finance.cash;
  renewLegend(s, c.id, 1);
  assert.equal(s.finance.cash, cash - c.salary);
  assert.equal(c.end, "2030-09-23");
  assert.equal(c.years, 4);
  assert.throws(() => renewLegend(s, c.id, 5), /مدة/);
  const cost = legendReleaseCost(s, c.id);
  assert.equal(cost, c.salary * 2 * 4);
  releaseLegend(s, c.id);
  assert.equal(c.status, "ended");
  assert.equal(c.endedBecause, "released");
  assert.equal(activeLegendContracts(s).length, 0);
  assert.equal(legendMatchBonus(s), 0);
  const again = signLegend(s, "waelgomaa", "defence", 1);
  assert.notEqual(again.id, c.id);
  assert.throws(() => releaseLegend(s, c.id), /غير نشط/);
  validateSave(s);
});

test("Coaching contracts expire on their own and free the role", () => {
  const s = game();
  const c = signLegend(s, "abouzeid", "midfield", 1);
  const t = structuredClone(s);
  t.date = "2027-09-24";
  legendDay(t);
  assert.equal(t.legends.contracts[0].status, "active", "still active on the last day");
  t.date = "2027-09-25";
  legendDay(t);
  const ended = t.legends.contracts[0];
  assert.equal(ended.status, "ended");
  assert.equal(ended.endedBecause, "expired");
  assert.equal(ended.endedOn, "2027-09-25");
  assert(t.inbox.some((m) => m.kind === "legend-ended" && m.ref === c.id));
  const next = signLegend(t, "ahmedhassan", "midfield", 1);
  assert.equal(next.status, "active");
  assert.equal(activeLegendContracts(t).length, 1);
});

test("Hall of legacy: natural retirements at the owner's club are inducted by merit only", () => {
  const s = game();
  const own = s.players.filter((p) => p.clubId === s.clubId);
  const star = own[0];
  star.appearances = 120;
  star.careerInterest = 99;
  star.retirementPlan = { date: s.date, announced: s.date, prepared: false, extensionAsked: false };
  const bench = own[1];
  bench.appearances = 3;
  bench.goals = 0;
  bench.rating = 60;
  bench.careerInterest = 99;
  bench.retirementPlan = { date: s.date, announced: s.date, prepared: false, extensionAsked: false };
  retirementDay(s);
  assert(s.legends.hall.some((h) => h.playerId === star.id));
  assert(!s.legends.hall.some((h) => h.playerId === bench.id));
  assert.equal(inductRetiree(s, star, s.clubId), false, "no duplicate induction");
  const foreign = s.players.find((p) => p.clubId !== s.clubId);
  foreign.appearances = 300;
  assert.equal(inductRetiree(s, foreign, foreign.clubId), false);
  validateSave(s);
});

test("Validation rejects tampered legend state", () => {
  const s = game();
  const c = signLegend(s, "elkhatib", "attack", 1);
  const dup = structuredClone(s);
  dup.legends.contracts.push({ ...c, id: "lg-x", legendId: "hossamhassan" });
  assert.throws(() => validateSave(dup), /الأساطير/);
  const ghost = structuredClone(s);
  ghost.legends.contracts[0].legendId = "nobody";
  assert.throws(() => validateSave(ghost), /الأساطير/);
  const shape = structuredClone(s);
  shape.legends.playerMode = "yes";
  assert.throws(() => validateSave(shape), /الأساطير/);
  const missing = structuredClone(s);
  delete missing.legends;
  assert.throws(() => validateSave(missing), /الأساطير/);
});

test("v16 and v15 saves migrate to v17 with an empty hall and no other change", () => {
  const s = game();
  const v16 = structuredClone(s);
  v16.version = 16;
  delete v16.legends;
  delete v16.migrationNote;
  const m = migrateSave(v16);
  assert.equal(m.version, SAVE_VERSION);
  assert.equal(v16.version, 16);
  assert.deepEqual(m.legends, initLegends());
  assert(m.migrationNote.includes("0.17"));
  assert.deepEqual(m.players.map((p) => [p.id, p.rating]), s.players.map((p) => [p.id, p.rating]));
  assert.equal(m.finance.cash, s.finance.cash);
  validateSave(m);
  const v15 = structuredClone(s);
  v15.version = 15;
  delete v15.legends;
  delete v15.sponsorDeals;
  const m15 = migrateSave(v15);
  assert.equal(m15.version, SAVE_VERSION);
  assert.deepEqual(m15.sponsorDeals, []);
  assert.deepEqual(m15.legends, initLegends());
  validateSave(m15);
  assert.equal(migrateSave(s), s, "current version passes through untouched");
});

test("Legends screen renders catalogue, filters, contracts, hall and disclaimers", () => {
  const s = game();
  let html = legendsView(s);
  assert(html.includes("قاعة الأساطير"));
  assert(html.includes("legend-player-mode"));
  assert(html.includes("data-action=\"legend-detail\""));
  assert(html.includes("لا توجد عقود أساطير بعد"));
  assert(html.includes("تقديرات تحريرية"));
  assert(html.includes("محمود الخطيب"));
  const c = signLegend(s, "elkhatib", "attack", 1);
  signLegend(s, "aboutrika", "player", 1);
  html = legendsView(s, { country: "eg", group: "attack", tier: "all", page: 1 });
  assert(html.includes("أساطير تحت التعاقد"));
  assert(html.includes(`data-id="${c.id}"`));
  assert(html.includes("يستفيد"));
  assert(html.includes("عودة كلاعب"));
  const mine = filteredLegends(s, { country: "all", group: "all", tier: "mine" });
  assert(mine.length >= 8 && mine.every((l) => l.clubIds.includes("ahly")));
  const eg = filteredLegends(s, { country: "eg", group: "gk", tier: "all" });
  assert(eg.every((l) => l.country === "eg" && l.position === "GK"));
  const modal = legendDetailModal(s, "elhadary", { role: "gk", years: 2 });
  assert(modal.includes("legend-offer-form"));
  assert(modal.includes("عصام الحضري"));
  assert(modal.includes("مدرب حراس المرمى"));
  assert(modal.includes("توقيع العقد"));
  const refused = legendDetailModal(s, "gaafar", { role: "midfield", years: 1 });
  assert(refused.includes("disabled"));
  assert(refused.includes("غريم"));
  const signed = legendDetailModal(s, "elkhatib", {});
  assert(signed.includes("مرتبط بعقد نشط"));
});

test("legends: staff salaries appear in the 30-day forecast, finance labels and data-sources note", async () => {
  const { forecast, legendPayroll } = await import("../src/services/finance.js");
  const { financeView } = await import("../src/features/finance.js");
  const { sourcesView } = await import("../src/features/dataSources.js");
  const s = game();
  const before = forecast(s).out;
  assert.equal(legendPayroll(s), 0);
  const coach = signLegend(s, "elhadary", "gk", 2);
  const ambassador = signLegend(s, "aboutrika", "ambassador", 1);
  signLegend(s, "hossamhassan", "player", 1);
  // Coaches and ambassadors are payroll; comeback players are already in wages().
  assert.equal(legendPayroll(s), coach.salary + ambassador.salary);
  assert.equal(forecast(s).out - before, coach.salary + ambassador.salary + s.players.find((p) => p.legendId === "hossamhassan").salary);
  const html = financeView(s);
  assert(html.includes("رواتب الأساطير"));
  assert(html.includes("أسطورة · مقدم/تعويض"));
  assert(!html.includes(">legend-fee<"));
  assert(sourcesView().includes("قاعة الأساطير (0.17)"));
});
