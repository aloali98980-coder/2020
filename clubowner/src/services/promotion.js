import { rankedPromotionMoves } from "./promotionRules.js";
import { addDays } from "../core/utils.js";
import { rankLeague } from "./leagueTable.js";
import { cupPriorityCalendar, availableDate } from "./calendar.js";
import { message } from "./inbox.js";
const egyptGroups = ["eg-3-a", "eg-3-b", "eg-3-c", "eg-3-d", "eg-3-e"];
export function promotionDay(s, { blankRow, schedule, simulate }) {
  const x = s.expansion;
  if (!x?.promotionVersion) return;
  const groups = egyptGroups.map((id) => x.divisions.find((d) => d.id === id));
  if (groups.some((d) => !d)) return;
  x.playoffs ??= [];
  if (
    !x.playoffs.length &&
    groups.every((d) => d.fixtures.every((f) => f.played))
  ) {
    const calendar = cupPriorityCalendar(s);
    for (const [key, name, ds, places, legs] of [
      ["upper", "ملحق الصعيد", groups.slice(0, 2), 1, 2],
      ["north", "ملحق القاهرة والقناة وبحري", groups.slice(2), 2, 1],
    ]) {
      const clubs = ds.flatMap((d) =>
        rankLeague(d)
          .slice(0, 2)
          .map((r) => r.clubId),
      );
      const p = {
        id: `promotion-eg-${key}-s${s.seasonNumber}`,
        name,
        clubs,
        table: clubs.map(blankRow),
        fixtures: [],
        places,
        legs,
        winners: [],
        tieBreak: "head-to-head",
        sourceGroups: ds.map((d) => d.id),
      };
      p.fixtures = schedule(clubs, s.date, p.id)
        .filter((f) => legs === 2 || f.round <= clubs.length - 1)
        .map((f) => {
          f.competition = name;
          f.promotion = true;
          f.neutral = key === "north";
          f.date = availableDate(calendar, f.home, f.away, f.date);
          calendar.reserve(f);
          return f;
        });
      x.playoffs.push(p);
      if (clubs.includes(s.clubId))
        message(s, {
          title: "تأهلت إلى " + name,
          body: "أضيفت مباريات الملحق إلى جدول ناديك. لا صعود حتى حسم ترتيب الملحق. التواريخ محاكاة، والتساوي الكامل يحسم بالهوية الثابتة دون مباراة فاصلة إضافية.",
          category: "matches",
        });
    }
    x.calendarDirty = true;
  }
  for (const p of x.playoffs) {
    if (p.winners.length) continue;
    for (const f of p.fixtures)
      if (!f.played && f.date === s.date) simulate(s, f, p);
    if (p.fixtures.every((f) => f.played)) {
      p.winners = rankLeague(p)
        .slice(0, p.places)
        .map((r) => r.clubId);
      p.finished = s.date;
      if (p.clubs.includes(s.clubId))
        message(s, {
          title: p.winners.includes(s.clubId)
            ? "حسمت مقعد الصعود"
            : "انتهى ملحق الصعود",
          body: p.winners.includes(s.clubId)
            ? "يتنفذ انتقالك للدرجة الأعلى عند ترحيل الموسم، دون تغيير هويات اللاعبين."
            : "احتفظ النادي بمكانه في المستوى الحالي. المالك مستمر.",
          category: "matches",
        });
    }
  }
}
function legacyPromotionMoves(x, ordered) {
  const moves = [];
  const egypt =
    x.promotionVersion &&
    egyptGroups.every((id) => x.divisions.some((d) => d.id === id));
  for (const high of x.divisions) {
    const lows = x.divisions.filter(
      (d) => d.country === high.country && d.tier === high.tier + 1,
    );
    if (!lows.length) continue;
    if (egypt && high.id === "eg-2") {
      const promoted = (x.playoffs || []).flatMap((p) => p.winners);
      if (promoted.length !== 3) throw Error("لم تحسم ملاحق الصعود المصرية.");
      const down = ordered.get(high.id).slice(-3);
      promoted.forEach((id, i) => {
        const from = lows.find((d) => d.clubs.includes(id));
        moves.push([id, from, high], [down[i], high, from]);
      });
      continue;
    }
    // Other countries retain the earlier single-division model. Never silently connect only one regional group.
    if (lows.length !== 1) continue;
    const low = lows[0];
    const n = Math.min(
      egypt && high.id === "eg-1" ? 3 : 2,
      Math.floor(Math.min(high.clubs.length, low.clubs.length) / 4),
    );
    for (const id of ordered.get(low.id).slice(0, n))
      moves.push([id, low, high]);
    for (const id of ordered.get(high.id).slice(-n))
      moves.push([id, high, low]);
  }
  return moves;
}

export function promotionMoves(x, ordered) {
  if (x.promotionVersion !== 2) return legacyPromotionMoves(x, ordered);
  const egyptMoves = legacyPromotionMoves(x, ordered).filter(
    (m) => m[1].country === "eg" && Math.max(m[1].tier, m[2].tier) === 3,
  );
  return rankedPromotionMoves(
    x,
    ordered,
    egyptMoves.length ? egyptMoves : null,
  );
}
