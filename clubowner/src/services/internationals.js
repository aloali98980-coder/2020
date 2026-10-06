import { addDays, random } from "../core/utils.js";
import { message } from "./inbox.js";
export function internationalDay(s) {
  if (!s.expansion) return;
  for (const p of s.players) {
    if (p.internationalUntil && p.internationalUntil <= s.date) {
      p.internationalCaps = (p.internationalCaps || 0) + 2;
      if (["ST", "LW", "RW", "AM"].includes(p.position) && random(s) < 0.28)
        p.internationalGoals = (p.internationalGoals || 0) + 1;
      p.fitness = Math.max(30, p.fitness - 12);
      p.internationalUntil = null;
      if (random(s) < 0.015) p.injuryUntil = addDays(s.date, 7);
      if (p.clubId === s.clubId)
        message(s, {
          title: "عودة " + p.name + " من المنتخب",
          body: "مشاركتان دوليتان في المعسكر المحاكى، مع احتساب الإجهاد. هذا سيناريو داخل اللعبة، وليس خبرًا عن اللاعب الحقيقي.",
          category: "club",
        });
    }
  }
  if (s.expansion.lastInternationalWindow === s.date) return;
  if (!["03-20", "06-01", "09-05", "11-10"].includes(s.date.slice(5))) return;
  s.expansion.lastInternationalWindow = s.date;
  const nations = new Map();
  for (const p of s.players) {
    if (p.status === "retired" || p.injuryUntil >= s.date || p.rating < 55)
      continue;
    const n = p.nationality;
    if (!n || n === "غير موثقة") continue;
    if (!nations.has(n)) nations.set(n, []);
    nations.get(n).push(p);
  }
  let own = 0;
  for (const players of nations.values()) {
    const sorted = players.sort(
      (a, b) =>
        b.rating + b.appearances * 0.02 - (a.rating + a.appearances * 0.02),
    );
    const chosen = [
      ...sorted.filter((p) => p.position === "GK").slice(0, 3),
      ...sorted.filter((p) => p.position !== "GK").slice(0, 20),
    ];
    for (const p of chosen) {
      p.internationalUntil = addDays(s.date, 10);
      if (p.clubId === s.clubId) own++;
    }
  }
  if (own)
    message(s, {
      title: "استدعاء " + own + " من لاعبيك للمنتخبات",
      body: "غياب لمدة عشرة أيام. الاختيار من جنسية اللاعب ومستواه ومشاركاته. المواعيد والمعسكرات مبسطة وليست روزنامة FIFA الرسمية.",
      category: "club",
    });
}
