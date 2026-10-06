import { assert, addDays, uid, random } from "../core/utils.js";
import { message, closeThread } from "./inbox.js";
import { post } from "./finance.js";
export const STAFF_ROLES = {
  coach: { name: "مدرب تطوير", skill: "coaching" },
  scout: { name: "كشاف مواهب", skill: "scouting" },
  academy: { name: "مدرب ناشئين", skill: "youth" },
};
export const staffSalary = (person, role) =>
  Math.round(25000 + person.skills[STAFF_ROLES[role].skill] * 800);
export const staffSkill = (s, role) =>
  Math.max(
    0,
    ...s.staff
      .filter((p) => p.status === "employed" && p.role === role)
      .map((p) => p.skills[STAFF_ROLES[role].skill]),
  );
export function hireStaff(s, id, role) {
  const p = s.staff.find((p) => p.id === id);
  assert(
    p && p.status === "available" && STAFF_ROLES[role],
    "الموظف أو الدور غير متاح.",
  );
  assert(
    s.staff.filter((x) => x.status === "employed").length < 3,
    "حد الطاقم في هذه النسخة ٣ أدوار، بموظف واحد لكل دور.",
  );
  assert(
    !s.staff.some((x) => x.status === "employed" && x.role === role),
    "الدور مشغول؛ أنهِ عقد الموظف الحالي أولًا.",
  );
  const salary = staffSalary(p, role);
  assert(s.finance.cash >= salary, "يلزم رصيد يغطي شهرًا واحدًا على الأقل.");
  p.status = "employed";
  p.role = role;
  p.salary = salary;
  p.contractEnd = addDays(s.date, 365);
  p.joined = s.date;
  closeThread(s, id);
  message(s, {
    title: `انضمام ${p.name} إلى الجهاز`,
    body: `تم التعيين بدور ${STAFF_ROLES[role].name}. المرتب يصرف مع التشغيل أول كل شهر. قدراته المهنية محاكاة مستقلة عن قدراته كلاعب.`,
    category: "careers",
  });
}
export function dismissStaff(s, id) {
  const p = s.staff.find((p) => p.id === id);
  assert(p?.status === "employed", "الموظف غير معين.");
  const compensation = p.salary * 2;
  assert(s.finance.cash >= compensation, "تعويض إنهاء العقد يساوي شهرين.");
  post(
    s,
    -compensation,
    "staff-compensation",
    `تعويض ${p.name}`,
    uid(s, "dismiss"),
  );
  p.status = "available";
  p.salary = 0;
  p.role = null;
  p.contractEnd = null;
  p.course = null;
  for (const a of s.scoutAssignments.filter(
    (a) => !a.done && a.staffId === id,
  )) {
    a.done = true;
    a.cancelled = true;
  }
}
export function trainStaff(s, id) {
  const p = s.staff.find((p) => p.id === id);
  assert(p?.status === "employed" && !p.course, "الدورة غير متاحة.");
  assert(s.finance.cash >= 100000, "تكلفة الدورة ١٠٠ ألف جنيه.");
  post(s, -100000, "staff-course", `دورة مهنية: ${p.name}`, uid(s, "course"));
  p.course = { end: addDays(s.date, 21) };
}
export function scoutAssignment(s, staffId, playerId) {
  const staff = s.staff.find((p) => p.id === staffId),
    player = s.players.find((p) => p.id === playerId);
  assert(
    staff?.status === "employed" &&
      staff.role === "scout" &&
      player &&
      player.status !== "retired" &&
      player.clubId !== s.clubId,
    "مهمة غير صالحة.",
  );
  assert(
    !s.scoutAssignments.some((a) => !a.done && a.staffId === staffId) &&
      !s.talent?.scouting.missions.some(
        (m) => m.status === "running" && m.staffId === staffId,
      ),
    "الكشاف مشغول بمهمة قائمة.",
  );
  assert(s.finance.cash >= 40000, "ميزانية المهمة ٤٠ ألف جنيه.");
  post(
    s,
    -40000,
    "scouting",
    `مهمة كشف ${player.name}`,
    uid(s, "scout-payment"),
  );
  s.scoutAssignments.push({
    id: uid(s, "assignment"),
    staffId,
    playerId,
    end: addDays(s.date, 7),
    done: false,
  });
}
export function staffDay(s) {
  for (const p of s.staff) {
    if (p.course && p.course.end <= s.date) {
      const key = STAFF_ROLES[p.role]?.skill;
      if (key) p.skills[key] = Math.min(95, p.skills[key] + 6);
      p.qualification = "qualified";
      p.course = null;
      message(s, {
        title: `اكتملت دورة ${p.name}`,
        body: "تحسنت المهارة المهنية الأساسية ٦ نقاط حتى حد ٩٥. أثره في النادي يتحدث تلقائيًا.",
        category: "careers",
      });
    }
    if (p.status === "employed" && p.contractEnd < s.date) {
      p.status = "available";
      p.salary = 0;
      p.role = null;
      p.course = null;
      message(s, {
        title: `انتهى عقد ${p.name} المهني`,
        body: "توقف مرتب الموظف وتأثيره في النادي. يمكنك إعادة تعيينه من الجهاز الفني.",
        category: "careers",
      });
    }
  }
  for (const a of s.scoutAssignments) {
    if (a.done || a.end > s.date) continue;
    a.done = true;
    const staff = s.staff.find((p) => p.id === a.staffId),
      p = s.players.find((p) => p.id === a.playerId);
    if (
      !staff ||
      staff.status !== "employed" ||
      staff.role !== "scout" ||
      !p ||
      p.status === "retired"
    )
      continue;
    const error = Math.max(2, Math.round((100 - staff.skills.scouting) / 8));
    p.scoutReport = {
      date: s.date,
      min: Math.max(1, Math.floor(p.potential - error)),
      max: Math.min(99, Math.ceil(p.potential + error)),
      scoutId: staff.id,
      confidence: staff.skills.scouting,
    };
    message(s, {
      title: `تقرير كشف: ${p.name}`,
      body: `وصل نطاق تقدير الإمكانات إلى ملف اللاعب. كلما تحسنت مهارة الكشاف ضاق النطاق، لكنه ليس ضمانًا لمستقبل اللاعب.`,
      category: "careers",
    });
  }
}
