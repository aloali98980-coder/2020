import { fixtures, sortedTable } from "./matches.js";
import { CLUBS } from "../data/catalog.js";
import { message } from "./inbox.js";
export function seasonDay(s) {
  if (s.date < s.nextSeasonDate || s.fixtures.some((f) => !f.played)) return;
  s.seasonHistory.push({
    number: s.seasonNumber,
    date: s.date,
    table: structuredClone(sortedTable(s)),
  });
  s.seasonNumber++;
  s.table = CLUBS.map((c) => ({
    clubId: c.id,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    points: 0,
  }));
  s.fixtures = fixtures(s.date).map((f) => ({
    ...f,
    id: `season${s.seasonNumber}-${f.id}`,
  }));
  s.nextSeasonDate = `${Number(s.date.slice(0, 4)) + 1}-07-01`;
  message(s, {
    title: "بداية موسم جديد",
    body: "تم أرشفة الترتيب السابق وإنشاء ١٤ جولة جديدة للدوري التجريبي. اللاعبون والعقود والمنشآت يستمرون؛ لا يوجد صعود أو هبوط في هذه النسخة.",
    category: "matches",
  });
}
