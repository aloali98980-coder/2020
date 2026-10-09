import { addDays, clamp, random } from "../core/utils.js";
import { ensureSportsCity, finishStadium } from "./sportsCity.js";
import { cityEffects, settleCityMonth } from "./cityFacilities.js";
import { CITY_EVENTS, eligibleCityEvents } from "../data/sportsCityEvents.js";
import { message } from "./inbox.js";
import { personalExpense } from "./empire/wealth.js";

export function publishCityEvent(s, id) {
  const city = ensureSportsCity(s),
    e = CITY_EVENTS.find((x) => x.id === id);
  if (!e || city.eventsSeen.includes(id) || !e.when(s)) return false;
  city.eventsSeen.push(id);
  city.news.unshift({ id, date: s.date, title: e.name });
  city.news.length = Math.min(city.news.length, 40);
  if (
    ["opening", "derby", "record", "guinness", "marathon", "wedding"].includes(
      id,
    )
  ) {
    const strength = 1 + (cityEffects(s).totals.channel || 0);
    city.broadcasts ??= [];
    city.broadcasts.unshift({
      date: s.date,
      event: id,
      reach: strength,
      title: e.name,
    });
    city.broadcasts.length = Math.min(city.broadcasts.length, 30);
    s.empire.fame = clamp((s.empire.fame || 0) + strength, 0, 100);
  }
  if (e.effect === "delay" && city.stadium.project) {
    city.stadium.project.end = addDays(city.stadium.project.end, 45);
    city.stadium.project.delays++;
    if (id === "runaway")
      s.empire.debt += personalExpense(
        s,
        Math.round(city.stadium.project.cost * 0.05),
      );
  }
  if (e.effect === "opening") {
    city.stadium.openingPending = false;
    s.fanSupport = clamp(s.fanSupport + 4, 0, 100);
  }
  if (e.effect === "mockery") s.fanSupport = clamp(s.fanSupport - 3, 0, 100);
  if (e.effect === "prestige")
    s.empire.prestige = clamp(s.empire.prestige + 20, 0, 400);
  if (e.effect === "repair") s.empire.debt += personalExpense(s, 250_000);
  message(s, { title: e.name.ar, body: e.name.ar, category: "events" });
  if (s.press?.news) {
    s.press.news.unshift({
      date: s.date,
      title: e.name.ar,
      type: "sports-city",
    });
    s.press.news.length = Math.min(s.press.news.length, 100);
  }
  return true;
}
export function sportsCityDay(s) {
  const city = ensureSportsCity(s);
  finishStadium(s);
  if (s.date.slice(8) === "01") settleCityMonth(s);
  // Milestones are guaranteed; other stories roll only once per month.
  for (const id of ["opening", "guinness", "empty", "record"])
    publishCityEvent(s, id);
  if (s.date.slice(8) === "10") {
    const choices = eligibleCityEvents(s).filter(
      (e) => !["opening", "guinness", "empty", "record"].includes(e.id),
    );
    if (choices.length && random(s) < 0.5)
      publishCityEvent(s, choices[Math.floor(random(s) * choices.length)].id);
  }
  return city;
}

// Called after match settlement, so conditions never fire on yesterday's derby.
export function sportsCityMatchDay(s) {
  const st = ensureSportsCity(s).stadium;
  if (st.lastDerbyDate === s.date) {
    publishCityEvent(s, "derby");
    publishCityEvent(s, "blackout");
  }
  for (const id of ["empty", "record"]) publishCityEvent(s, id);
}
