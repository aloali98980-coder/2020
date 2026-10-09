// أحداث قرارات قذرة 0.28 — 10 أحداث على الأقل بشروط ظهور منطقية (لا حدث فضيحة والشبهات صفرية)
// كلها مربوطة بمؤشر الشبهات والوسيط
import {
  all,
  cashAtLeast,
  fansBelow,
  hasActiveSponsor,
  squadAtLeast,
  repAtLeast,
  scopeNonEmpty,
  hasMarket,
} from "./conditions.js";

const suspicionAtLeast = (n) => (s) => (s.blackFiles?.suspicion || 0) >= n;
const suspicionBelow = (n) => (s) => (s.blackFiles?.suspicion || 0) < n;
const hasSuspicion = (s) => (s.blackFiles?.suspicion || 0) > 0;
const hasAgent = (s) => Boolean(s.blackFiles?.active?.agentOnPayroll);
const hasRefBias = (s) => Boolean(s.blackFiles?.active?.refereeBias);
const hasMediaWar = (s) => Boolean(s.blackFiles?.active?.mediaWar);
const transferBanned = (s) => Boolean(s.blackFiles?.transferBanUntil && s.blackFiles.transferBanUntil >= s.date);

export const BLACK_DECISIONS = [
  {
    id: "black-investigative-journalist",
    group: "media",
    theme: "press",
    topic: "صحفي استقصائي يطلب مقابلة عن الوسيط",
    when: all(hasSuspicion, suspicionAtLeast(20)),
    title: "صحفي استقصائي على الباب",
    body: "صحفي معروف بتقاريره عن الفساد يطلب مقابلة حول علاقتك بوسيط معروف. الموافقة قد تكشف جزءًا من الملفات، الرفض يزيد الشبهات، والدفع لإسكاته مكلف وقذر.",
    choices: [
      { id: "cooperate", label: "التعاون الجزئي وتقديم وثائق مجتزأة", cash: -500000, fans: -1, reputation: 1, note: "قدّمت جزءًا من الحقيقة؛ الصحفي نشر تقريرًا مخففًا." },
      { id: "refuse", label: "رفض المقابلة وإغلاق الباب", fans: -2, reputation: -2, note: "الرفض زاد همسات الصحافة، والشبهات ارتفعت 5%." },
      { id: "pay-silence", label: "دفع لإسكات الصحفي (قذر)", cash: -4000000, fans: 1, reputation: -3, note: "دفعت لإسكاته؛ الشبهات انخفضت مؤقتًا 8% لكن العملية قذرة +7% heat." },
    ],
  },
  {
    id: "black-former-employee-threat",
    group: "money",
    theme: "finance",
    topic: "موظف سابق يهدد بكشف المستور",
    when: all(hasSuspicion, suspicionAtLeast(25), cashAtLeast(1000000)),
    title: "موظف سابق يهدد بالكشف",
    body: "مسؤول سابق في إدارة التعاقدات يملك تسجيلات عن الوسيط ويطلب مبلغًا مقابل الصمت. التسريب قد يفجر 15% شبهات إضافية.",
    choices: [
      { id: "pay-off", label: "دفع مقابل الصمت", cash: -6000000, note: "دفعت؛ الشبهات انخفضت 10% مؤقتًا." },
      { id: "legal-threat", label: "تهديد قانوني مضاد", cash: -800000, reputation: -2, fans: -2, note: "التهديد المتبادل رفع الشبهات 8%." },
      { id: "expose-yourself", label: "كشف جزئي طوعي وتخفيض الضرر", fans: -4, reputation: 2, note: "اعترفت جزئيًا؛ الشبهات انخفضت 12% لكن الجماهير غاضبة." },
    ],
  },
  {
    id: "black-public-accusation",
    group: "media",
    theme: "press",
    topic: "اتهام علني من منافس في مؤتمر صحفي",
    when: all(suspicionAtLeast(35), squadAtLeast(12)),
    title: "اتهام علني من منافس",
    body: "رئيس نادٍ منافس اتهمك علنًا بالتحيز التحكيمي في مؤتمر صحفي. الرد الهادئ يحفظ الصورة، الهجوم المضاد يشعل حربًا، والصمت يترك الاتهام ينتشر.",
    choices: [
      { id: "calm-response", label: "رد هادئ ونفي قاطع", reputation: 2, fans: 1, note: "النفي القاطع هدّأ الرعاة." },
      { id: "counter-attack", label: "هجوم مضاد واتهام متبادل", reputation: -3, fans: 2, note: "الحرب الإعلامية اشتعلت؛ الشبهات +6%." },
      { id: "silence", label: "صمت وتجاهل الاتهام", reputation: -1, fans: -2, note: "الصمت فُسر كضعف؛ الشبهات +3%." },
    ],
  },
  {
    id: "black-fixer-demands-more",
    group: "money",
    theme: "finance",
    topic: "الوسيط يطلب زيادة مقابل الاستمرار",
    when: all(hasSuspicion, cashAtLeast(5000000)),
    title: "الوسيط يطلب زيادة",
    body: "الوسيط الذي نفذ عملياتك يطلب زيادة 40% على أتعابه مقابل الاستمرار في التغطية. الدفع يحافظ على الشبكة، الرفض يقطعها ويخفض الشبهات.",
    choices: [
      { id: "pay-more", label: "دفع الزيادة والاستمرار", cash: -5000000, note: "دفعت الزيادة؛ الشبكة مستمرة والشبهات مستقرة." },
      { id: "cut-network", label: "قطع الوسطاء فورًا", fans: -1, reputation: 1, note: "قطعت الوسطاء؛ الشبهات -15% لكن الوكيل على المرتب توقف." },
      { id: "negotiate", label: "تفاوض على نصف الزيادة", cash: -2500000, reputation: -1, note: "تفاوضت؛ الشبهات -5%." },
    ],
  },
  {
    id: "black-player-witness",
    group: "squad",
    theme: "players",
    topic: "لاعب شاهد عملية قذرة",
    when: all(suspicionAtLeast(15), scopeNonEmpty("topRated")),
    title: "لاعب شاهد ما لا يجب أن يراه",
    body: "أحد لاعبيك شاهد لقاءً بين الوسيط وحكم قبل مباراة. اللاعب مرتبك ويفكر في الحديث. إقناعه بالصمت، نقله، أو مكافأته.",
    choices: [
      { id: "convince-silence", label: "إقناعه بالصمت لمصلحة النادي", targets: [{ scope: "topRated", morale: -6 }], reputation: -1, note: "أقنعته؛ معنويات النجوم انخفضت." },
      { id: "transfer-him", label: "عرضه للبيع سريعًا", incomeLater: 5000000, incomeDays: 30, fans: -3, note: "ستحصل على عائد لاحق لكن الجماهير تشك." },
      { id: "bonus-silence", label: "مكافأة صمت كبيرة", cash: -2000000, targets: [{ scope: "topRated", morale: 3 }], note: "دفعت مكافأة؛ الشبهات -4%." },
    ],
  },
  {
    id: "black-unknown-fixer",
    group: "money",
    theme: "finance",
    topic: "وسيط مجهول يعرض خدماته",
    when: all(suspicionBelow(70), cashAtLeast(8000000)),
    title: "وسيط مجهول يعرض نفسه",
    body: "شخص مجهول يتصل ويعرض شبكة تحكيم وإعلام جاهزة مقابل مبلغ مقدم. القبول يفتح باب العمليات القذرة، الرفض يحافظ على النظافة، والتبليغ يخفض الشبهات.",
    choices: [
      { id: "accept", label: "قبول العرض وفتح الملفات السوداء", cash: -3000000, note: "فتحت الملفات السوداء؛ الشبهات +10%." },
      { id: "decline", label: "رفض العرض", reputation: 2, fans: 1, note: "رفضت؛ السمعة ارتفعت قليلًا." },
      { id: "report", label: "إبلاغ الاتحاد (يخفض الشبهات)", reputation: 3, fans: 2, note: "أبلغت؛ الشبهات -12%." },
    ],
  },
  {
    id: "black-routine-investigation",
    group: "media",
    theme: "press",
    topic: "تحقيق روتيني من لجنة النزاهة",
    when: all(hasSuspicion, suspicionAtLeast(10)),
    title: "تحقيق روتيني من اللجنة",
    body: "لجنة النزاهة تطلب مستندات روتينية عن تعاقداتك الأخيرة. التعاون الكامل يخفض الشبهات، المماطلة ترفعها، وتقديم هدايا للجنة قذر ومكلف.",
    choices: [
      { id: "full-coop", label: "تعاون كامل وتسليم المستندات", reputation: 2, note: "التعاون خفض الشبهات 6%." },
      { id: "delay", label: "مماطلة وتأجيل التسليم", reputation: -2, fans: -1, note: "المماطلة رفعت الشبهات 5%." },
      { id: "gift", label: "هدايا للجنة (قذرة)", cash: -2500000, reputation: -2, note: "الهدايا خفضت الشبهات 8% لكنها عملية قذرة +6% لاحقًا." },
    ],
  },
  {
    id: "black-worried-sponsor",
    group: "money",
    theme: "finance",
    topic: "راعٍ قلق يطلب توضيحًا عن التسريبات",
    when: all(hasSuspicion, hasActiveSponsor, suspicionAtLeast(45)),
    title: "راعٍ قلق يطلب اجتماعًا",
    body: "أحد رعاة القميص قرأ التسريبات ويطلب توضيحًا عاجلًا. الطمأنة تحافظ عليه، التبرع الخيري يخفض الشبهات، والتجاهل قد يفقده.",
    choices: [
      { id: "reassure", label: "طمأنة الراعي باجتماع مغلق", cash: -300000, reputation: 1, fans: 1, note: "طمأنت الراعي؛ بقي العقد." },
      { id: "charity-pr", label: "إعلان تبرع خيري كبير للعلاقات", cash: -5000000, fans: 3, reputation: 2, note: "تبرع خيري 5M خفض الشبهات 10%." },
      { id: "ignore", label: "تجاهل القلق", reputation: -2, fans: -2, note: "التجاهل رفع احتمال هروب الراعي." },
    ],
  },
  {
    id: "black-friendly-ref-stops",
    group: "matchday",
    theme: "seasonal",
    topic: "الحكم الصديق يتوقف عن التعاون",
    when: all(hasRefBias, suspicionAtLeast(20)),
    title: "الحكم الصديق يتوقف",
    body: "الحكم الذي كان يتعاون معك أبلغ الوسيط أنه يتوقف خوفًا من التحقيق. الدفع الإضافي قد يعيده، التهديد يرفع الشبهات، والقبول ينهي التحيز.",
    choices: [
      { id: "pay-extra", label: "دفع إضافي لإعادته", cash: -4000000, note: "دفعت؛ التحيز استمر أسبوعًا إضافيًا." },
      { id: "threaten", label: "تهديد بكشف تعاونه السابق", reputation: -3, note: "التهديد رفع الشبهات 12%." },
      { id: "accept-stop", label: "قبول التوقف وإنهاء التحيز", reputation: 1, note: "قبلت؛ الشبهات -5%." },
    ],
  },
  {
    id: "black-recording-leak",
    group: "media",
    theme: "press",
    topic: "تسريب تسجيلي يهدد بالانتشار",
    when: all(suspicionAtLeast(55), cashAtLeast(3000000)),
    title: "تسريب تسجيلي مسرب",
    body: "تسجيل صوتي بين الوسيط ومسؤولك عن عملية تحيز تحكيمي بدأ ينتشر في مجموعات واتساب صحفية. شراء التسجيل، نفي صحته، أو الاعتراف الجزئي.",
    choices: [
      { id: "buy-recording", label: "شراء التسجيل وحذفه", cash: -8000000, note: "اشتريت التسجيل؛ الشبهات -15% لكن التكلفة عالية." },
      { id: "deny-fake", label: "نفي صحته واتهام التزييف", reputation: -2, fans: -3, note: "النفي لم يقنع الجميع؛ الشبهات +5%." },
      { id: "partial-confess", label: "اعتراف جزئي وتقديم كبش فداء", fans: -6, reputation: 1, note: "قدمت كبش فداء؛ الشبهات -20% لكن الجماهير غاضبة." },
    ],
  },
  {
    id: "black-agent-salary-leak",
    group: "money",
    theme: "finance",
    topic: "تسريب عقد الوكيل على المرتب",
    when: all(hasAgent, suspicionAtLeast(30)),
    title: "تسريب عقد الوكيل",
    body: "عقد الوكيل الذي على مرتبك تسرب للإعلام. الصحافة تسأل عن سبب وجوده. الإبقاء، القطع، أو تحويله لعقد استشاري.",
    choices: [
      { id: "keep", label: "الإبقاء وتبريره كاستشاري", reputation: -1, note: "بررت؛ الشبهات +3%." },
      { id: "cut", label: "قطع العقد فورًا", reputation: 2, note: "قطعت؛ الشبهات -15%." },
      { id: "convert", label: "تحويله لعقد استشاري معلن", cash: -1000000, reputation: 1, note: "حولت العقد؛ الشبهات -8%." },
    ],
  },
];
