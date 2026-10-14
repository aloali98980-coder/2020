import { FACILITIES } from "../data/catalog.js";
import { assert, uid, addDays } from "../core/utils.js";
import { post, obligation } from "./finance.js";
import { message } from "./inbox.js";
import { tr } from "../i18n/index.js";
import { addInsideInformation } from "./stockMarket/insider.js";

// المعجل 0.48 — ثلاث طرق معلنة لكل مشروع منشأة: قياسي (سعر + انتظار)،
// معجّل (+20% و70% من المدة)، وفوري ⚡ (+45% واستلام اليوم بلا انتظار إجباري).
export const FACILITY_INSTANT_FACTOR = 1.45;

const speedMode = (speed) =>
  speed === true
    ? "fast"
    : speed === false || speed == null
      ? "normal"
      : ["normal", "fast", "instant"].includes(speed)
        ? speed
        : null;

export function projectQuote(f, speed = "normal") {
  const base = FACILITIES.find((x) => x.id === f.id);
  const mode = speedMode(speed);
  assert(mode, tr("طريقة تنفيذ غير معروفة.", "Unknown execution mode.", "Mode d'exécution inconnu."));
  if (mode === "instant")
    return {
      cost: Math.round(
        base.cost * (1 + (f.level - 1) * 0.6) * FACILITY_INSTANT_FACTOR,
      ),
      days: 0,
      upkeep: base.upkeep,
      instant: true,
    };
  return {
    cost: Math.round(base.cost * (1 + (f.level - 1) * 0.6) * (mode === "fast" ? 1.2 : 1)),
    days: Math.max(3, Math.round(base.days * (mode === "fast" ? 0.7 : 1))),
    upkeep: base.upkeep,
  };
}

// استلام المشروع: نفس أثر facilityDay للاستلام المتأخر، بصيغة قابلة للاستدعاء الفوري.
function completeProject(s, f, quote) {
  f.level++;
  f.monthlyCost += quote.upkeep;
  if (f.id === "stadium") s.capacity += 3000;
}

export function startProject(s, id, speed = "normal") {
  const f = s.facilities.find((f) => f.id === id);
  assert(f, "منشأة غير موجودة.");
  const mode = speedMode(speed);
  assert(mode, tr("طريقة تنفيذ غير معروفة.", "Unknown execution mode.", "Mode d'exécution inconnu."));
  assert(!f.project, "يوجد مشروع قيد التنفيذ.");
  assert(f.level < 4, "وصلت إلى الحد المتاح في النسخة التجريبية.");
  if (mode === "instant") {
    const quote = projectQuote(f, "instant");
    assert(
      s.finance.cash >= quote.cost,
      tr(
        "الدفعة الفورية تحتاج رصيدًا يغطي كامل التكلفة.",
        "The instant payment needs cash covering the full cost.",
        "Le paiement instantané exige une trésorerie couvrant tout le coût.",
      ),
    );
    post(
      s,
      -quote.cost,
      "construction",
      tr("تطوير فوري", "Instant upgrade", "Amélioration instantanée") + ` — ${f.name}`,
      `facility-instant-${id}-${s.date}-${uid(s, "fi")}`,
    );
    completeProject(s, f, quote);
    message(s, {
      title: tr(
        `اكتمل تطوير ${f.name} فورًا`,
        `The ${f.name} upgrade finished instantly`,
        `L'amélioration ${f.name} est terminée instantanément`,
      ),
      body: tr(
        `دفعت ${quote.cost.toLocaleString("en-US")} كاملة ودُفع المعجل ⚡: المستوى ${f.level} يعمل من اليوم بلا أي انتظار أو التزامات مؤجلة.`,
        `You paid the full ${quote.cost.toLocaleString("en-US")} and the accelerator ⚡: level ${f.level} works from today with no waiting or deferred obligations.`,
        `Vous avez payé la totalité (${quote.cost.toLocaleString("en-US")}) avec l'accélérateur ⚡ : le niveau ${f.level} fonctionne dès aujourd'hui, sans attente ni obligations différées.`,
      ),
      category: "facilities",
    });
    return { instant: true, ...quote, level: f.level };
  }
  const quote = projectQuote(f, mode),
    upfront = Math.round(quote.cost * 0.4);
  assert(
    s.finance.cash >= quote.cost,
    "يلزم توفير قيمة المشروع كاملة كاحتياطي قبل الالتزام به.",
  );
  const project = {
    id: uid(s, "project"),
    start: s.date,
    end: addDays(s.date, quote.days),
    ...quote,
    fast: mode === "fast",
  };
  f.project = project;
  post(
    s,
    -upfront,
    "construction",
    `مقدم تطوير ${f.name}`,
    project.id + "-upfront",
  );
  obligation(s, {
    amount: quote.cost - upfront,
    due: project.end,
    category: "construction",
    description: `دفعة استلام ${f.name}`,
    key: project.id + "-final",
    ref: project.id,
  });
  message(s, {
    title: `بدأ مشروع ${f.name}`,
    body: `تم دفع 40%. الاستلام المتوقع ${project.end} مع سداد الباقي وإضافة تكلفة التشغيل.`,
    category: "facilities",
  });
  if (s.stockMarket)
    addInsideInformation(s, {
      clubId: s.clubId,
      kind: "facility",
      publicOn: project.end,
      sourceRef: `facility:${project.id}`,
      source: "construction-office",
    });
  return project;
}
export function toggleFacilityStaff(s, id) {
  const f = s.facilities.find((x) => x.id === id);
  assert(f && f.staffCost, "هذه المنشأة لا تتطلب تعيينًا مستقلًا.");
  f.staff = !f.staff;
  message(s, {
    title: f.staff ? "تعيين موظف متخصص" : "إنهاء تكليف الموظف",
    body: `تم تحديث طاقم ${f.name}. التكلفة الشهرية والأثر التشغيلي يتغيران وفقًا لذلك.`,
    category: "facilities",
  });
}
export function facilityDay(s) {
  for (const f of s.facilities) {
    if (f.project && f.project.end <= s.date) {
      f.level++;
      f.monthlyCost += f.project.upkeep;
      if (f.id === "stadium") s.capacity += 3000;
      f.project = null;
      message(s, {
        title: `اكتمل تطوير ${f.name}`,
        body:
          f.staffCost && !f.staff
            ? "البناء مكتمل؛ عيّن الموظف المطلوب لتفعيل الأثر الرياضي."
            : "المنشأة تعمل بمستواها الجديد. راجع تكاليف التشغيل والأثر.",
        category: "facilities",
      });
    }
  }
}
