import { EVENT_CATALOG } from "../data/eventCatalog.js";
import { difficulty } from "../models/difficulty.js";
import { squad, initializeCareer } from "../models/player.js";
import {
  uid,
  addDays,
  assert,
  clamp,
  random,
  daysBetween,
} from "../core/utils.js";
import { message, closeThread } from "./inbox.js";
import { post, obligation } from "./finance.js";
import { makePlayer } from "../data/catalog.js";
export function clubEventDay(s) {
  if (
    s.date < s.nextClubEventDate ||
    s.clubDecisions.some((e) => e.status === "open")
  )
    return;
  const available = EVENT_CATALOG.filter(
    (e) =>
      e.id !== s.lastClubEvent &&
      !(e.id === "youth-trial" && squad(s).length >= (s.squadLimit||30)),
  );
  const data = available[Math.floor(random(s) * available.length)];
  const ev = {
    id: uid(s, "decision"),
    type: data.id,
    date: s.date,
    status: "open",
    choice: null,
  };
  s.clubDecisions.push(ev);
  s.lastClubEvent = data.id;
  s.nextClubEventDate = addDays(s.date, difficulty(s).eventInterval);
  message(s, {
    title: data.title,
    body: data.body,
    category: "events",
    required: true,
    kind: "club-decision",
    ref: ev.id,
    priority: "high",
  });
}
export function resolveClubEvent(s, id, choiceId) {
  const ev = s.clubDecisions.find((e) => e.id === id);
  assert(ev?.status === "open", "الحدث تم حسمه بالفعل.");
  const data = EVENT_CATALOG.find((e) => e.id === ev.type),
    c = data.choices.find((c) => c.id === choiceId);
  assert(c, "قرار غير صالح.");
  assert(
    !(c.cash < 0) || s.finance.cash >= -c.cash,
    "السيولة لا تكفي لهذا القرار. اختر بديلًا مناسبًا.",
  );
  if (c.youth) assert(squad(s).length < (s.squadLimit||30), "القائمة ممتلئة.");
  if (c.cash)
    post(
      s,
      c.cash,
      "club-event",
      data.title + " — " + c.label,
      ev.id + "-decision",
    );
  for (const p of squad(s)) {
    p.morale = clamp(p.morale + (c.morale || 0), 0, 100);
    p.fitness = clamp(p.fitness + (c.fitness || 0), 0, 100);
  }
  s.fanSupport = clamp(s.fanSupport + (c.fans || 0), 0, 100);
  if (c.incomeLater)
    obligation(s, {
      amount: c.incomeLater,
      due: addDays(s.date, 30),
      category: "sponsor-income",
      description: "عائد الحملة التجارية",
      key: ev.id + "-income",
    });
  if (c.youth) {
    const p = makePlayer(
      uid(s, "youth"),
      "موهبة جديدة " + s.academyCount++,
      s.clubId,
      "eg",
      Math.floor(random(s) * 18),
      true,
    );
    p.nameLatin = "Academy prospect " + s.academyCount;
    p.age = 17;
    p.rating = 55 + Math.floor(random(s) * 10);
    p.potential = p.rating + 15;
    for (const k of Object.keys(p.attributes)) p.attributes[k] = p.rating;
    p.salary = 25000;
    p.value = 1000000;
    p.contractEnd = addDays(s.date, 730);
    initializeCareer(p, s.date);
    s.players.push(p);
  }
  if (c.report) {
    const market = s.players.filter(
      (p) => p.clubId !== s.clubId && p.status !== "retired",
    );
    if (market.length) {
      const p = market[Math.floor(random(s) * market.length)];
      p.scoutReport = {
        date: s.date,
        min: Math.max(1, Math.round(p.potential - 7)),
        max: Math.min(99, Math.round(p.potential + 7)),
        confidence: 45,
      };
      message(s, {
        title: `تقرير مرشح: ${p.name}`,
        body: "تقرير مبدئي متاح في ملف اللاعب. تعيين كشاف محترف يمكن أن يحسن دقته.",
        category: "careers",
      });
    }
  }
  ev.status = "resolved";
  ev.choice = choiceId;
  ev.resolvedOn = s.date;
  closeThread(s, id);
  message(s, {
    title: "تم تنفيذ قرار الإدارة",
    body:
      data.title + " — " + c.label + ". الآثار سُجلت في الحسابات وحالة النادي.",
    category: "events",
  });
}
