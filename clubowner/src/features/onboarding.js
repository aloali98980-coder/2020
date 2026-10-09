// خطواتك الأولى 0.22b — قائمة إرشاد قصيرة على لوحة المالك للحفظة الجديدة.
// تكتمل تلقائيًا مع أفعلك الحقيقية داخل نفس عملية الحفظ (بلا حفظ إضافي)، وتُخفى نهائيًا
// من التخزين المحلي عند الإغلاق اليدوي، بمفتاح مرتبط بالنادي وتاريخ بداية الحفظة.
import { icon } from "../components/icons.js";
import { num } from "../ui/format.js";
import { tr } from "../i18n/index.js";

export const ONBOARDING_STEPS = [
  {
    key: "offer",
    label: tr("قدّم عرضك الأول للاعب", "Make your first bid", "Faites votre première offre"),
    hint: tr(
      "من سوق الانتقالات: اختر لاعبًا وحدد الرسوم والمقدم",
      "Transfer market: pick a player, set the fee and upfront",
      "Marché : choisissez un joueur, fixez le transfert et l'acompte",
    ),
  },
  {
    key: "sponsor",
    label: tr("وقّع أول عقد رعاية", "Sign your first sponsor", "Signez votre premier sponsor"),
    hint: tr(
      "مساحات القميص والملعب تنتظر توقيعك",
      "Shirt and stadium spaces await your signature",
      "Maillot et stade attendent votre signature",
    ),
  },
  {
    key: "facility",
    label: tr("ابدأ مشروع منشأة", "Start a facility project", "Lancez un projet d'installation"),
    hint: tr(
      "استثمار مبكر يعني دخلًا وأداءً أفضل لاحقًا",
      "Early investment means income and performance later",
      "Investir tôt, c'est des revenus et des performances ensuite",
    ),
  },
  {
    key: "board",
    label: tr("اطّلع على لائحة الجمعية العمومية", "Read the assembly mandate", "Lire le mandat de l’assemblée"),
    hint: tr(
      "ثلاثة محاور تُقاس طوال الموسم، والتصويت في النهاية",
      "Three axes measured all season, with a vote at the end",
      "Trois axes mesurés toute la saison, avec un vote à la fin",
    ),
  },
  {
    key: "week",
    label: tr("مرّر أول أسبوع", "Advance your first week", "Avancez votre première semaine"),
    hint: tr(
      "شاهد المحاكاة تعمل وتابع ردود البريد",
      "Watch the simulation run and follow your inbox",
      "Lancez la simulation et suivez votre boîte de réception",
    ),
  },
];
export const onboardingState = (s) => s.onboarding?.steps || {};
export function markStep(s, key) {
  if (!s.onboarding) s.onboarding = {};
  if (!s.onboarding.steps) s.onboarding.steps = {};
  s.onboarding.steps[key] = true;
}
const dismissKey = (s) => `clubowner.onboarding.hide.${s.clubId}.${s.startDate}`;
export const onboardingHidden = (s) => {
  try {
    return localStorage.getItem(dismissKey(s)) === "1";
  } catch {
    return false;
  }
};
export const hideOnboarding = (s) => {
  try {
    localStorage.setItem(dismissKey(s), "1");
  } catch {}
};
export function onboardingView(s) {
  const steps = onboardingState(s),
    done = ONBOARDING_STEPS.filter((x) => steps[x.key]).length;
  if (done === ONBOARDING_STEPS.length || onboardingHidden(s)) return "";
  const friendlyDone = !!s.onboarding?.friendlyPlayed;
  return `<section class="panel onboarding-card">
    <div class="panel-head">
      <h3>${icon("academy")} ${tr("خطواتك الأولى", "Your first steps", "Vos premiers pas")}</h3>
      <span class="onboarding-progress">${num(done)} / ${num(ONBOARDING_STEPS.length)}</span>
      <button class="icon-btn" data-action="onboarding-dismiss" aria-label="${tr("إخفاء نهائي", "Hide forever", "Masquer définitivement")}">${icon("close", 18)}</button>
    </div>
    <div class="instant-friendly-callout ${friendlyDone ? "friendly-done" : ""}">
      <div class="instant-friendly-copy">
        <span class="eyebrow">${icon("play", 14)} ${tr("أول 60 ثانية", "First 60 seconds", "Premières 60 secondes")}</span>
        <h4>${tr("أول نبضة كروية", "First football pulse", "Premier frisson du football")}</h4>
        <p class="muted">${tr("اختبر تشكيلتك فوراً في مباراة ودية متوازنة على ملعبك اليوم، مع تقرير كامل ولقطات حية.", "Test your lineup immediately in a balanced home friendly today, with full report and live highlights.", "Testez votre onze immédiatement lors d'un match amical équilibré à domicile aujourd'hui, avec rapport complet et moments forts.")}</p>
      </div>
      <button class="btn primary instant-friendly-btn" data-action="instant-friendly">
        ${icon("play", 16)} ${tr("العب ماتش ودي النهاردة", "Play a friendly match today", "Jouer un match amical aujourd'hui")}
      </button>
    </div>
    <div class="onboarding-progress-track"><i style="width:${Math.round((done / ONBOARDING_STEPS.length) * 100)}%"></i></div>
    <div class="onboarding-steps">${ONBOARDING_STEPS.map((x) => `<div class="onboarding-step ${steps[x.key] ? "done" : ""}"><span class="onboarding-check">${steps[x.key] ? icon("check", 16) : num(ONBOARDING_STEPS.indexOf(x) + 1)}</span><div><strong>${x.label}</strong><small>${x.hint}</small></div></div>`).join("")}</div>
  </section>`;
}
