import test from "node:test";
import assert from "node:assert/strict";
import {
  CITY_EVENTS,
  eligibleCityEvents,
} from "../src/data/sportsCityEvents.js";
import {
  publishCityEvent,
  sportsCityDay,
} from "../src/services/sportsCityDay.js";
import { cityEffects } from "../src/services/cityFacilities.js";
import { itemProgress } from "../src/services/boardMandate.js";
import { ensureSportsCity } from "../src/services/sportsCity.js";
const state = () => ({
  date: "2026-04-01",
  capacity: 250000,
  clubId: "city",
  fanSupport: 20,
  reputation: 20,
  empire: {
    personal: 2e9,
    debt: 0,
    prestige: 0,
    monthTrack: { income: 0, expenses: 0 },
  },
  players: [],
  press: { news: [] },
  inbox: [],
  nextId: 1,
  seed: 10,
  facilities: [],
});
test("28 distinct trilingual conditional events", () => {
  const s = state();
  s.capacity = 15000;
  ensureSportsCity(s);
  assert.ok(CITY_EVENTS.length >= 25);
  assert.equal(new Set(CITY_EVENTS.map((x) => x.id)).size, CITY_EVENTS.length);
  assert.ok(CITY_EVENTS.every((e) => e.name.ar && e.name.en && e.name.fr));
  assert.ok(
    !eligibleCityEvents(s).some((x) =>
      [
        "runaway",
        "opening",
        "guinness",
        "marathon",
        "blackout",
        "empty",
      ].includes(x.id),
    ),
  );
  s.sportsCity.stadium.project = {
    route: "new",
    cost: 1e7,
    end: "2028-04-01",
    delays: 0,
  };
  assert.ok(eligibleCityEvents(s).some((x) => x.id === "runaway"));
  assert.equal(publishCityEvent(s, "runaway"), true);
  assert.equal(s.sportsCity.stadium.project.end, "2028-05-16");
  assert.equal(publishCityEvent(s, "runaway"), false);
});
test("opening, Guinness, record, empty crowd, derby and facility guards", () => {
  const s = state(),
    city = ensureSportsCity(s);
  city.stadium.tier = 7;
  city.stadium.openingPending = true;
  assert.equal(publishCityEvent(s, "opening"), true);
  assert.equal(publishCityEvent(s, "guinness"), true);
  assert.equal(s.empire.prestige, 20);
  city.stadium.lastAttendance = 20000;
  assert.equal(publishCityEvent(s, "empty"), true);
  assert.equal(publishCityEvent(s, "blackout"), false);
  city.stadium.lastDerbyDate = s.date;
  assert.equal(publishCityEvent(s, "blackout"), true);
  assert.equal(publishCityEvent(s, "marathon"), false);
  city.facilities.push(
    "track",
    "medical",
    "academyBuilding",
    "hospital",
    "channelStudio",
  );
  assert.equal(publishCityEvent(s, "marathon"), true);
  assert.equal(cityEffects(s).totals.recovery, 6);
  assert.equal(cityEffects(s).totals.academy, 4);
  assert.equal(s.press.news.length, 5);
});
test("city construction counts for existing board facility mandate relative to its baseline", () => {
  const s = state();
  ensureSportsCity(s).facilities = ["track"];
  const mandate = {
    startDate: s.date,
    baseline: { facilityLevels: {}, cityFacilities: [] },
  };
  assert.equal(
    itemProgress(s, { kind: "facility-project", target: 1 }, mandate).done,
    true,
  );
});
test("studio boosts opening broadcast; recovery and academy effect channels depend on buildings", () => {
  const s = state(),
    city = ensureSportsCity(s);
  city.stadium.openingPending = true;
  assert.equal(cityEffects(s).totals.channel || 0, 0);
  city.facilities.push(
    "channelStudio",
    "medical",
    "academyBuilding",
    "hospital",
  );
  publishCityEvent(s, "opening");
  assert.equal(city.broadcasts[0].reach, 3);
  assert.equal(s.empire.fame, 3);
  assert.equal(cityEffects(s).totals.recovery, 6);
  assert.equal(cityEffects(s).totals.academy, 4);
});
test("derby news fires after the match only and records channel/social reach", async () => {
  const { sportsCityMatchDay } =
    await import("../src/services/sportsCityDay.js");
  const s = state(),
    city = ensureSportsCity(s);
  city.facilities.push("channelStudio");
  city.stadium.lastDerbyDate = s.date;
  sportsCityMatchDay(s);
  assert.ok(
    city.eventsSeen.includes("derby") && city.eventsSeen.includes("blackout"),
  );
  assert.equal(city.broadcasts[0].reach, 3);
  const count = city.news.length;
  sportsCityMatchDay(s);
  assert.equal(city.news.length, count);
});
