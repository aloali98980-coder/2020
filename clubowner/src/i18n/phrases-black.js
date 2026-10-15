// قاموس «الملفات السوداء» 0.28 — مشتق آليًا من src/data/blackTexts.js
import { BLACK_TEXTS } from "../data/blackTexts.js";

export const BLACK_PHRASES = (() => {
  const out = {
    "تحصين": ["Protected", "Protection de"],
    "سيكسر شرط": [
      "will trigger the release clause of",
      "va activer la clause libératoire de",
    ],
    "إنذار عاجل: نادي": ["Urgent alert: Club", "Alerte urgente : le club"],
    "أعلن نيته كسر الشرط الجزائي": [
      "announced its intent to trigger the release clause",
      "a annoncé son intention d'activer la clause libératoire",
    ],
    "لضم": ["to sign", "pour recruter"],
    "أمامك مهلة رد حتى": [
      "You have a response deadline until",
      "Vous disposez d'un délai de réponse jusqu'au",
    ],
    "لتحصين اللاعب عبر رفع الراتب أو تجديد العقد أو تعديل الشرط الجزائي": [
      "to protect the player by raising salary, renewing the contract, or updating the release clause",
      "pour protéger le joueur en augmentant le salaire, en prolongeant le contrat ou en modifiant la clause libératoire",
    ],
    "إحباط كسر الشرط": [
      "release clause break foiled",
      "activation de clause déjouée",
    ],
    "نجحت في تحصين": [
      "You succeeded in protecting",
      "Vous avez réussi à protéger",
    ],
    "خلال مهلة الرد، فتوقف تحرك نادي": [
      "within the response deadline, halting Club",
      "dans le délai de réponse, stoppant la tentative du club",
    ],
    "لكسر الشرط الجزائي وبقي اللاعب في ناديك": [
      "from triggering the release clause and the player stayed at your club",
      "d'activer la clause libératoire et le joueur est resté dans votre club",
    ],
    "لا يوجد إنذار كسر شرط جزائي معلق لهذا اللاعب": [
      "No pending release clause break alert for this player",
      "Aucune alerte d'activation de clause en attente pour ce joueur",
    ],
    "انتهت مهلة الرد على كسر الشرط الجزائي": [
      "The response deadline for the release clause break has expired",
      "Le délai de réponse à l'activation de la clause a expiré",
    ],
    "الراتب الجديد يجب أن يكون أعلى من الراتب الحالي": [
      "The new salary must be higher than the current salary",
      "Le nouveau salaire doit être supérieur au salaire actuel",
    ],
    "شرط جزائي غير صالح": [
      "Invalid release clause",
      "Clause libératoire invalide",
    ],
    "الشرط الجديد يجب أن يكون أعلى من الشرط الحالي أو صفرًا لإلغائه": [
      "The new clause must be higher than the current clause or zero to remove it",
      "La nouvelle clause doit être supérieure à la clause actuelle ou zéro pour la supprimer",
    ],
    "طريقة التحصين غير صالحة": [
      "Invalid protection method",
      "Méthode de protection invalide",
    ],
  };
  for (const entry of Object.values(BLACK_TEXTS)) {
    out[entry.ar] = [entry.en, entry.fr];
    const bare = entry.ar.replace(/[.؛:!؟…،,]+$/, "");
    if (bare && !out[bare]) out[bare] = [entry.en, entry.fr];
  }
  return out;
})();
export default BLACK_PHRASES;
