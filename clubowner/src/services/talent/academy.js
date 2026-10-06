import { assert, uid, addDays, clamp, random } from "../../core/utils.js";
import { prospect, population, POSITIONS } from "./state.js";
import { reservedSquadSize } from "../employment.js";
import { post, wages } from "../finance.js";
import { message, closeThread } from "../inbox.js";
import { staffSkill } from "../staff.js";
import { ageAt } from "../../models/player.js";
export const intakeCost = (s) =>
  25000 + s.facilities.find((f) => f.id === "academy").level * 15000;
export function startIntake(s) {
  const a = s.talent?.academy;
  assert(a, "الأكاديمية الجديدة تحتاج العالم الموسع.");
  assert(
    !a.pending && !a.candidates.length && a.season !== s.seasonNumber,
    "دفعة واحدة لكل موسم؛ احسم الدفعة الحالية أولًا.",
  );
  const level = s.facilities.find((f) => f.id === "academy").level;
  assert(
    population(s) + 3 + level <= 50000,
    "وصل العالم إلى حد السجلات؛ لم تخصم الرسوم.",
  );
  const fee = intakeCost(s);
  assert(s.finance.cash >= fee, "السيولة لا تكفي برنامج الاختبارات.");
  const id = uid(s, "intake");
  post(s, -fee, "academy-trials", "برنامج اختبارات الناشئين", id);
  a.season = s.seasonNumber;
  a.pending = {
    id,
    season: s.seasonNumber,
    started: s.date,
    due: addDays(s.date, 14),
    level,
    fee,
  };
  message(s, {
    title: "بدأت اختبارات الأكاديمية",
    body: "تصل الدفعة بعد 14 يومًا. بعدها تختار التصعيد أو السماح بالمغادرة خلال 90 يومًا. لا رواتب للفريق الأول قبل توقيعك.",
    category: "careers",
  });
}
export function chooseCandidate(s, id, accept) {
  const a = s.talent?.academy,
    c = a?.candidates.find((c) => c.player.id === id);
  assert(c && c.expires >= s.date, "فترة تقييم اللاعب انتهت.");
  const p = c.player;
  if (accept) {
    assert(
      reservedSquadSize(s) < s.squadLimit,
      "القائمة ممتلئة أو محجوزة للعائدين من الإعارة.",
    );
    assert(
      wages(s) + p.salary <= s.finance.wageBudget,
      "راتب اللاعب يتجاوز ميزانية المرتبات.",
    );
    assert(s.finance.cash >= p.salary, "مكافأة التوقيع تساوي راتب شهر.");
    post(
      s,
      -p.salary,
      "academy-signing",
      "تصعيد " + p.name,
      "graduate-" + p.id,
    );
    p.contractEnd = addDays(s.date, 1095);
    p.contractTerms.signedOn = s.date;
    p.contractTerms.lastRaiseYear = s.date.slice(0, 4);
    p.careerHistory.push({
      date: s.date,
      type: "academy-promotion",
      clubId: s.clubId,
    });
  } else {
    p.clubId = "لاعب حر";
      p.clubName = "لاعب حر";
    p.value = 0;
    p.contractEnd = s.date;
    p.careerHistory.push({
      date: s.date,
      type: "academy-release",
      clubId: s.clubId,
    });
  }
  s.players.push(p);
  a.candidates = a.candidates.filter((x) => x !== c);
  if (!a.candidates.length) closeThread(s, c.intakeId);
}
export function academyDay(s) {
  const a = s.talent?.academy;
  if (!a) return;
  const intake = a.pending;
  if (intake && intake.due <= s.date) {
    const count = Math.min(3 + intake.level, 50000 - population(s));
    for (let i = 0; i < count; i++) {
      const position = POSITIONS[(s.seasonNumber * 3 + i) % POSITIONS.length],
        p = prospect(s, s.clubId, position);
      const error = Math.max(
        3,
        10 - intake.level - Math.floor(staffSkill(s, "academy") / 25),
      );
      a.candidates.push({
        player: p,
        intakeId: intake.id,
        expires: addDays(s.date, 90),
        lastMonth: s.date.slice(0, 7),
        range: [
          Math.max(Math.round(p.rating), Math.floor(p.potential - error)),
          Math.min(99, Math.ceil(p.potential + error)),
        ],
      });
    }
    a.pending = null;
    if (count)
      message(s, {
        title: "دفعة الأكاديمية جاهزة للتقييم",
        body: `${count} لاعبين ينتظرون قرارك في الجهاز الفني. التقدير ليس ضمانًا للتطور؛ اللاعب الذي يغادر يحتفظ بهويته في سوق الأحرار.`,
        category: "careers",
        required: true,
        kind: "academy-review",
        ref: intake.id,
        deadline: addDays(s.date, 90),
      });
    else
      message(s, {
        title: "تعذر استقبال الدفعة",
        body: "بلغ العالم حد 50 ألف سجل. أُعيدت رسوم البرنامج.",
        category: "careers",
      });
    if (!count)
      post(
        s,
        intake.fee,
        "academy-refund",
        "رد رسوم البرنامج",
        intake.id + "-refund",
      );
  }
  for (const c of [...a.candidates]) {
    const p = c.player;
    p.age = ageAt(p, s.date);
    if (c.expires < s.date) {
      p.clubId = "لاعب حر";
      p.clubName = "لاعب حر";
      p.value = 0;
      p.contractEnd = s.date;
      p.careerHistory.push({
        date: s.date,
        type: "academy-release",
        clubId: s.clubId,
      });
      s.players.push(p);
      a.candidates = a.candidates.filter((x) => x !== c);
      if (!a.candidates.length) closeThread(s, c.intakeId);
      continue;
    }
    if (c.lastMonth !== s.date.slice(0, 7)) {
      c.lastMonth = s.date.slice(0, 7);
      if (random(s) < 0.55) {
        const gain = Math.max(
          0,
          Math.min(
            0.08 +
              s.facilities.find((f) => f.id === "academy").level * 0.035 +
              staffSkill(s, "academy") / 1000,
            p.potential - p.rating,
          ),
        );
        p.rating += gain;
        for (const k of Object.keys(p.attributes))
          p.attributes[k] = clamp(p.attributes[k] + gain, 0, 99);
      }
    }
  }
}
