import { developIndividual } from "./talent/training.js";
import { reservedSquadSize } from "./employment.js";
import { generatedPlayer } from "../models/generatedPlayers.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { developmentGain } from "../models/ability.js";
import { staffSkill } from "./staff.js";
import { initializeCareer } from "../models/player.js";
import { random, clamp, uid, addDays } from "../core/utils.js";
import { makePlayer } from "../data/catalog.js";
import { message } from "./inbox.js";
export function developmentDay(s) {
  const coaching = Math.max(
    staffSkill(s, "coach"),
    s.management?.coach?.skill || 0,
  );
  const medical = s.facilities.find((f) => f.id === "medical"),
    training = s.facilities.find((f) => f.id === "training"),
    academy = s.facilities.find((f) => f.id === "academy");
  for (const p of s.players.filter(
    (p) => p.clubId === s.clubId && p.status !== "retired",
  )) {
    p.fitness = clamp(
      p.fitness + (medical.level > 1 && medical.staff ? 4 : 2),
      0,
      100,
    );
    if (
      !p.loan &&
      !s.events.some(
        (e) => e.type === "renewal" && e.ref === p.id && !e.done,
      ) &&
      p.contractEnd >= s.date &&
      p.contractEnd <= addDays(s.date, 30) &&
      p.renewalWarningEnd !== p.contractEnd
    ) {
      p.renewalWarningEnd = p.contractEnd;
      if (
        !s.inbox.some(
          (m) => m.kind === "renewal" && m.ref === p.id && m.status === "open",
        )
      )
        message(s, {
          title: `عقد ${p.name} يقترب من النهاية`,
          body: "اللاعب يحتاج قرارًا: افتح شروط التجديد أو قرّر السماح بانتهاء العقد. التجديد ليس تلقائيًا.",
          category: "transfers",
          required: true,
          kind: "renewal",
          ref: p.id,
        });
    }
    if (p.contractEnd < s.date) {
      p.clubId = "لاعب حر";
      p.clubName = "لاعب حر";
      p.value = 0;
      message(s, {
        title: `انتهى عقد ${p.name}`,
        body: "اللاعب غادر القائمة بعد انتهاء عقده. راقب التنبيهات وجدّد العقود قبل موعد الانتهاء.",
        category: "transfers",
      });
      continue;
    }
    if (s.talent) developIndividual(s, p);
    if (
      !s.talent &&
      s.date.endsWith("-01") &&
      p.age < 25 &&
      training.level > 1 &&
      (training.staff || coaching > 0) &&
      random(s) < 0.3 + (training.level - 1) * 0.1 + coaching / 500
    ) {
      const gain = p.abilityVersion
        ? developmentGain(p, {
            coach: coaching,
            training: training.level,
            minutes: p.appearances,
            injured: !!p.injuryUntil && p.injuryUntil >= s.date,
          })
        : 0.3;
      p.rating = Math.min(p.potential, p.rating + gain);
      for (const key of Object.keys(p.attributes))
        p.attributes[key] = Math.min(99, p.attributes[key] + gain);
    }
  }
  if (
    !s.talent &&
    s.date.endsWith("-01") &&
    academy.level > 1 &&
    (academy.staff || staffSkill(s, "academy") > 0) &&
    reservedSquadSize(s) < (s.squadLimit || 30)
  ) {
    const p = s.expansion
      ? generatedPlayer(
          extendedClub(s.clubId),
          10000 + s.academyCount++,
          s.date,
          s.seed,
          true,
        )
      : makePlayer(
          uid(s, "youth"),
          "موهبة الأكاديمية " + s.academyCount++,
          s.clubId,
          "eg",
          Math.floor(random(s) * 18),
          true,
        );
    p.age = 17;
    if (s.expansion)
      p.birthDate = String(Number(s.date.slice(0, 4)) - 17) + "-01-01";
    p.rating = 56 + Math.floor(random(s) * 10);
    p.potential = Math.min(
      95,
      p.rating + 15 + Math.round(staffSkill(s, "academy") / 15),
    );
    p.salary = 25000;
    p.value = 1500000;
    for (const k of Object.keys(p.attributes)) p.attributes[k] = p.rating;
    p.contractEnd = String(Number(s.date.slice(0, 4)) + 3) + s.date.slice(4);
    if (!s.expansion) p.nameLatin = "Academy prospect " + s.academyCount;
    initializeCareer(p, s.date);
    s.players.push(p);
    message(s, {
      title: "موهبة جديدة من الأكاديمية",
      body: `${p.name} أصبح ضمن قائمة الفريق. قدراته مولّدة تجريبيًا؛ فرص اللعب وتطويره الأوسع ضمن المراحل القادمة.`,
      category: "club",
    });
  }
}
