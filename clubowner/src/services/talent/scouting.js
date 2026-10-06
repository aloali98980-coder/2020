import { assert, uid, addDays, clamp } from "../../core/utils.js";
import { hash } from "../../models/ability.js";
import { MARKETS } from "../../data/worldMarkets.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { POSITIONS } from "./state.js";
import { post } from "../finance.js";
import { message } from "../inbox.js";
export function requestMission(s, input) {
  assert(s.talent, "شبكة الكشف تحتاج العالم الموسع.");
  const q = s.talent.scouting;
  assert(
    q.missions.filter((m) => m.status === "running").length < 2,
    "مهمتان متزامنتان كحد أقصى.",
  );
  const t = {
    country: input.country,
    position: input.position,
    minAge: Number(input.minAge),
    maxAge: Number(input.maxAge),
    budget: Number(input.budget),
    days: Number(input.days),
    staffId: input.staffId || "external",
    playerId: input.playerId || null,
  };
  assert(
    (t.country === "all" || MARKETS.some((m) => m.id === t.country)) &&
      (t.position === "all" || POSITIONS.includes(t.position)) &&
      Number.isInteger(t.minAge) &&
      Number.isInteger(t.maxAge) &&
      t.minAge >= 16 &&
      t.maxAge <= 40 &&
      t.minAge <= t.maxAge &&
      Number.isSafeInteger(t.budget) &&
      t.budget >= 0 &&
      t.budget <= 10000000000 &&
      [7, 21].includes(t.days),
    "راجع شروط مهمة الكشف.",
  );
  const staff = s.staff.find((p) => p.id === t.staffId);
  assert(
    t.staffId === "external" ||
      (staff?.status === "employed" && staff.role === "scout"),
    "الكشاف غير متاح.",
  );
  assert(
    t.staffId === "external" ||
      (!q.missions.some(
        (m) => m.status === "running" && m.staffId === t.staffId,
      ) &&
        !s.scoutAssignments.some((m) => !m.done && m.staffId === t.staffId)),
    "الكشاف مشغول.",
  );
  if (t.playerId)
    assert(
      s.players.some(
        (p) =>
          p.id === t.playerId &&
          p.status !== "retired" &&
          p.clubId !== s.clubId &&
          p.loan?.parent !== s.clubId,
      ),
      "اللاعب غير متاح للمتابعة.",
    );
  const fee =
    (t.days === 7 ? 25000 : 60000) +
    (t.country !== "all" && t.country !== extendedClub(s.clubId).country
      ? 15000
      : 0);
  assert(s.finance.cash >= fee, "السيولة لا تغطي المهمة.");
  const id = uid(s, "network");
  post(s, -fee, "scouting", "مهمة شبكة الكشافين", id);
  q.missions.push({
    ...t,
    id,
    fee,
    started: s.date,
    due: addDays(s.date, t.days),
    quality: staff?.skills.scouting || 45,
    status: "running",
    results: [],
  });
  q.missions = q.missions.slice(-40);
  return id;
}
export function followPlayer(s, id) {
  const p = s.players.find((p) => p.id === id);
  assert(p, "لاعب غير موجود.");
  return requestMission(s, {
    country: "all",
    position: "all",
    minAge: 16,
    maxAge: 40,
    budget: 10000000000,
    days: 21,
    playerId: id,
  });
}
export function toggleShortlist(s, id) {
  const q = s.talent.scouting;
  if (q.shortlist.includes(id)) {
    q.shortlist = q.shortlist.filter((x) => x !== id);
    return;
  }
  assert(
    s.players.some((p) => p.id === id),
    "اللاعب غير موجود.",
  );
  assert(q.shortlist.length < 40, "القائمة المختصرة تستوعب 40 لاعبًا.");
  q.shortlist.push(id);
}
export function scoutingDay(s) {
  const q = s.talent?.scouting;
  if (!q) return;
  for (const m of q.missions) {
    if (m.status !== "running" || m.due > s.date) continue;
    const staff = s.staff.find((p) => p.id === m.staffId);
    if (
      m.staffId !== "external" &&
      (staff?.status !== "employed" || staff.role !== "scout")
    ) {
      m.status = "cancelled";
      message(s, {
        title: "توقفت مهمة كشف",
        body: "الكشاف لم يعد معينًا؛ تكلفة السفر والعمل المنفّذ غير مستردة.",
        category: "careers",
      });
      continue;
    }
    m.status = "complete";
    let candidates = s.players.filter(
      (p) =>
        p.status !== "retired" &&
        p.clubId !== s.clubId &&
        p.loan?.parent !== s.clubId &&
        (m.playerId
          ? p.id === m.playerId
          : (m.country === "all" ||
              (extendedClub(p.clubId)?.country || p.league) === m.country) &&
            (m.position === "all" || p.position === m.position) &&
            p.age >= m.minAge &&
            p.age <= m.maxAge &&
            p.value <= m.budget),
    );
    candidates.sort(
      (a, b) =>
        b.rating +
        (b.potential - b.rating) * 0.15 +
        (hash(b.id + m.id) % 13) -
        (a.rating + (a.potential - a.rating) * 0.15 + (hash(a.id + m.id) % 13)),
    );
    for (const p of candidates.slice(0, m.playerId ? 1 : 6)) {
      const old = q.reports[p.id],
        confidence = clamp(
          Math.max(
            m.quality + (m.days === 21 ? 10 : 0),
            (old?.confidence || 0) + 5,
          ),
          20,
          90,
        ),
        error = Math.max(2, Math.ceil((100 - confidence) / 9)),
        bias = (hash(p.id + "report") % 5) - 2,
        min = clamp(
          Math.max(
            Math.floor(p.rating),
            Math.floor(p.potential - error + bias),
          ),
          1,
          99,
        );
      q.reports[p.id] = {
        playerId: p.id,
        date: s.date,
        confidence,
        visits: (old?.visits || 0) + 1,
        rating: [
          Math.max(1, Math.floor(p.rating - error / 2)),
          Math.min(99, Math.ceil(p.rating + error / 2)),
        ],
        potential: [
          min,
          Math.max(min, Math.min(99, Math.ceil(p.potential + error + bias))),
        ],
        fee: [Math.round(p.value * 0.8), Math.round(p.value * 1.2)],
        salary: p.salary,
      };
      m.results.push(p.id);
    }
    const keep = Object.values(q.reports)
      .sort(
        (a, b) =>
          Number(q.shortlist.includes(b.playerId)) -
            Number(q.shortlist.includes(a.playerId)) ||
          b.date.localeCompare(a.date),
      )
      .slice(0, 200);
    q.reports = Object.fromEntries(keep.map((r) => [r.playerId, r]));
    message(s, {
      title: "اكتملت مهمة الكشافين",
      body: `وصل ${m.results.length} تقريرًا وفق نطاق البحث. راجع مركز المواهب؛ الأسعار والتقييمات تقديرات بتاريخ التقرير وليست ضمانًا.`,
      category: "careers",
    });
  }
}
