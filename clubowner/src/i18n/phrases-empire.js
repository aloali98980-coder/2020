// قاموس «حياة الملياردير» 0.29 — مشتق آليًا من src/data/empireTexts.js،
// ومعه نصوص التحقق والتوستات (المرحلة التاسعة).
import { EMPIRE_TEXTS } from "../data/empireTexts.js";

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

export const EMPIRE_PHRASES = {
  ...fromTexts,
  ...withBare(EXTRA),
};
export default EMPIRE_PHRASES;
