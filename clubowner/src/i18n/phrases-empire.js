// قاموس «حياة الملياردير» 0.29 — مشتق آليًا من src/data/empireTexts.js،
// ومعه نصوص كتالوج الأصول والقصر وأحداث الإمبراطورية (المرحلة التاسعة).
import { EMPIRE_TEXTS } from "../data/empireTexts.js";
import { EMPIRE_ASSETS, ASSET_CATEGORIES, PALACE_TIERS } from "../data/empireAssets.js";
import {
  BRIDES,
  WEDDING_TIERS,
  SCHOOLS,
  ALLOWANCES,
  KID_NAMES,
} from "../data/empireFamily.js";
import { INVEST_VEHICLES } from "../data/empireInvestments.js";
import { RIVAL_POOL, RACE_TYPES } from "../data/empireRivals.js";
import { EMPIRE_DECISION_PHRASES } from "../data/events/decisions-empire.js";
import { FLAVOR_EMPIRE_PHRASES } from "../data/events/flavor-empire.js";

const fromTexts = (() => {
  const out = {};
  for (const entry of Object.values(EMPIRE_TEXTS)) {
    out[entry.ar] = [entry.en, entry.fr];
    const bare = entry.ar.replace(/[.؛:!؟…،,]+$/, "");
    if (bare && !out[bare]) out[bare] = [entry.en, entry.fr];
  }
  return out;
})();

// نصوص واجهة إضافية لا تمر عبر EMPIRE_TEXTS (رسائل تحقق، توستات، بطاقات الإعداد).
const EXTRA = {
  "حالة حياة الملياردير غير سليمة.": [
    "The billionaire life state is invalid.",
    "L'état de la vie de milliardaire est invalide.",
  ],
  "ثروة المالك الشخصية غير سليمة.": [
    "The owner's personal fortune is invalid.",
    "La fortune personnelle du propriétaire est invalide.",
  ],
  "حدود التحويل بين الخزينتين غير سليمة.": [
    "The transfer caps between the two vaults are invalid.",
    "Les plafonds de transfert entre les deux coffres sont invalides.",
  ],
  "أصول المالك غير سليمة.": [
    "The owner's assets are invalid.",
    "Les actifs du propriétaire sont invalides.",
  ],
  "حالة عائلة المالك غير سليمة.": [
    "The owner's family state is invalid.",
    "L'état de la famille du propriétaire est invalide.",
  ],
  "محفظة المالك غير سليمة.": [
    "The owner's portfolio is invalid.",
    "Le portefeuille du propriétaire est invalide.",
  ],
  "قائمة المنافسين المليارديرات غير سليمة.": [
    "The rival billionaires list is invalid.",
    "La liste des milliardaires rivaux est invalide.",
  ],
  "سجل الخير غير سليم.": [
    "The charity record is invalid.",
    "Le registre de charité est invalide.",
  ],
  "سجلات حياة الملياردير غير سليمة.": [
    "The billionaire life logs are invalid.",
    "Les journaux de la vie de milliardaire sont invalides.",
  ],
  "٨٠ مليونًا + ٦٠٠ ألف شهريًا": [
    "80M + 600k/month",
    "80 M + 600 k/mois",
  ],
  "٤٠ مليونًا + ٣٥٠ ألف شهريًا": [
    "40M + 350k/month",
    "40 M + 350 k/mois",
  ],
  "١٥ مليونًا + دين ١٠ ملايين": [
    "15M + 10M debt",
    "15 M + 10 M de dette",
  ],
  "تم التحويل من خزينة النادي إلى ثروتك الشخصية.": [
    "Transferred from the club treasury to your personal fortune.",
    "Transfert de la trésorerie du club vers votre fortune personnelle.",
  ],
  "تم دعم خزينة النادي من ثروتك الشخصية.": [
    "The club treasury was supported from your personal fortune.",
    "La trésorerie du club a été soutenue par votre fortune personnelle.",
  ],
  "تم سداد جزء من الدين.": [
    "Part of the debt was repaid.",
    "Une partie de la dette a été remboursée.",
  ],
  "مستوى معيشة غير معروف.": [
    "Unknown lifestyle.",
    "Train de vie inconnu.",
  ],
  "مبلغ السداد غير صالح.": [
    "Invalid repayment amount.",
    "Montant de remboursement invalide.",
  ],
  "تم شراء الأصل وإضافته إلى إمبراطوريتك.": [
    "Asset purchased and added to your empire.",
    "Actif acheté et ajouté à votre empire.",
  ],
  "تم بيع الأصل وإضافة قيمته إلى ثروتك.": [
    "Asset sold and its value added to your fortune.",
    "Actif vendu et sa valeur ajoutée à votre fortune.",
  ],
  "تمت الخطوبة بنجاح.": [
    "The engagement is official.",
    "Les fiançailles sont officielles.",
  ],
  "تم الفرح. عقبال المئة سنة.": [
    "The wedding is done. Here's to a hundred years.",
    "Le mariage est célébré. À cent ans ensemble.",
  ],
  "وصلت الهدية وأسعدت البيت.": [
    "The gift arrived and brightened the home.",
    "Le cadeau est arrivé et a illuminé la maison.",
  ],
  "تم الطلاق ودُفعت التسوية.": [
    "The divorce is final and the settlement paid.",
    "Le divorce est prononcé et le règlement payé.",
  ],
  "باقة ورد": ["Flowers", "Bouquet"],
  "طقم مجوهرات": ["Jewelry set", "Parure de bijoux"],
  "رحلة خاصة": ["Private trip", "Voyage privé"],
  "تم استثمار المبلغ.": ["Amount invested.", "Montant investi."],
  "تم سحب المبلغ إلى ثروتك.": ["Amount withdrawn to your fortune.", "Montant retiré vers votre fortune."],
  "تم التبرع وارتفعت سمعتك.": ["Donation made — your reputation rose.", "Don effectué — votre réputation a augmenté."],
  "بدأ العمل في مشروعك الخيري.": ["Work began on your charity project.", "Les travaux de votre projet caritatif ont commencé."],
  "مدرسة": ["school", "école"],
  "مستشفى": ["hospital", "hôpital"],
  "دار أيتام": ["orphanage", "orphelinat"],
};

const withBare = (map) => {
  const out = {};
  for (const [ar, pair] of Object.entries(map)) {
    out[ar] = pair;
    const bare = ar.replace(/[.؛:!؟…،,]+$/, "");
    if (bare && !out[bare]) out[bare] = pair;
  }
  return out;
};

// نصوص كتالوج الأصول والفئات ومراحل القصر: كل حقل عربي يدخل القاموس.
// المفاتيح اللاتينية (مثل «Empire Coin») لا تحتاج ترجمة ولا تدخل القاموس.
const AR = /[\u0600-\u06FF]/;
const fromCatalog = (() => {
  const out = {};
  const put = (entry) => {
    if (!entry?.ar || !AR.test(entry.ar)) return;
    out[entry.ar] = [entry.en, entry.fr];
    const bare = entry.ar.replace(/[.؛:!؟…،,]+$/, "");
    if (bare && !out[bare]) out[bare] = [entry.en, entry.fr];
  };
  for (const a of EMPIRE_ASSETS) {
    put(a.name);
    put(a.desc);
  }
  for (const c of ASSET_CATEGORIES) put(c.name);
  for (const t of PALACE_TIERS) put(t.name);
  for (const b of Object.values(BRIDES)) {
    put(b.name);
    put(b.desc);
    put(b.bonus);
  }
  for (const w of Object.values(WEDDING_TIERS)) {
    put(w.name);
    put(w.desc);
  }
  for (const sc of Object.values(SCHOOLS)) put(sc.name);
  for (const al of Object.values(ALLOWANCES)) put(al.name);
  for (const k of KID_NAMES) put(k);
  for (const v of Object.values(INVEST_VEHICLES)) {
    put(v.name);
    put(v.desc);
    put(v.risk);
  }
  for (const r of RIVAL_POOL) {
    put({ ar: r.nameAr, en: r.nameEn, fr: r.nameFr });
    put(r.persona);
  }
  for (const rt of RACE_TYPES) put(rt.name);
  return out;
})();

export const EMPIRE_PHRASES = {
  ...fromTexts,
  ...fromCatalog,
  ...EMPIRE_DECISION_PHRASES,
  ...FLAVOR_EMPIRE_PHRASES,
  ...withBare(EXTRA),
};
export default EMPIRE_PHRASES;
