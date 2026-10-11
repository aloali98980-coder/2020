// الخزنة الموحدة 0.44 — الشفرة: إيداع 10M / 100M / 500M / 1B يُخلق للوجهة مباشرة.
// • تتجاوز كل قواعد التحويلات الذكية: لا سقف، لا أرضية، لا نهب، لا حرارة/ثقة/فصل.
// • قيد تغطية في الدفتر عند الإيداع للنادي؛ الإيداع الشخصي يزيد الثروة دون مسّ الخزينة.
// • الشارة شكلية (خمس نقرات تفتح الواجهة فقط).
// • دعم النادي العادي (جيب→نادي) يبقى في transfers.js بفحص الرصيد.

import { assert, uid } from "../core/utils.js";
import { post } from "./finance.js";
import { ensureEmpire } from "./empire/wealth.js";
import { tr } from "../i18n/index.js";

export const VAULT_AMOUNTS = Object.freeze([10_000_000, 100_000_000, 500_000_000, 1_000_000_000]);
export const VAULT_DESTINATIONS = Object.freeze(["club", "personal"]);
export const VAULT_LOG_LIMIT = 40;
export const VAULT_TAPS = 5;
export const VAULT_TAP_WINDOW_MS = 3000;

export function ensureVault(s) {
  s.vault ??= { log: [] };
  s.vault.log ??= [];
  return s.vault;
}

/**
 * الحركة الأساسية لكل التحويلات بين الخزينتين. تُرسل إلى الدفتر أولًا،
 * ثم تُحدَّث الأرصدة (فلا يبقى تغيير جزئي عند الفشل).
 */
export function moveFunds(s, { to, amount, reason, kind = "vault", project = null }) {
  const e = ensureEmpire(s);
  const key = uid(s, "vault-move");
  if (to === "club") {
    assert(e.personal >= amount, tr("الثروة الشخصية لا تكفي هذا التحويل.", "Your personal wealth cannot cover this transfer.", "Votre fortune personnelle ne couvre pas ce transfert."));
    const ok = post(s, amount, "vault", reason, key);
    assert(ok, tr("تعذر تسجيل التحويل.", "The transfer could not be recorded.", "Le transfert n’a pas pu être enregistré."));
    e.personal -= amount;
  } else {
    assert(s.finance.cash >= amount, tr("خزينة النادي لا تكفي هذا التحويل.", "The club treasury cannot cover this transfer.", "La trésorerie du club ne couvre pas ce transfert."));
    const ok = post(s, -amount, "vault", reason, key);
    assert(ok, tr("تعذر تسجيل التحويل.", "The transfer could not be recorded.", "Le transfert n’a pas pu être enregistré."));
    e.personal += amount;
  }
  const v = ensureVault(s);
  const entry = {
    id: key,
    date: s.date,
    from: to === "club" ? "personal" : "club",
    to,
    amount,
    kind,
    reason,
    project,
  };
  v.log.unshift(entry);
  v.log.length = Math.min(v.log.length, VAULT_LOG_LIMIT);
  return entry;
}

function logVault(s, { to, amount, reason, kind, id }) {
  const v = ensureVault(s);
  const entry = {
    id,
    date: s.date,
    from: "cipher",
    to,
    amount,
    kind,
    reason,
    project: null,
  };
  v.log.unshift(entry);
  v.log.length = Math.min(v.log.length, VAULT_LOG_LIMIT);
  return entry;
}

/**
 * الشفرة: يُخلق المبلغ للوجهة مباشرة (شخصي أو نادي) بلا فحص رصيد المصدر
 * وبلا سقف/أرضية/نهب. قيد التغطية عبر post() عند الوجهة النادي.
 */
export function vaultMove(s, { to, amount }) {
  assert(VAULT_DESTINATIONS.includes(to), tr("وجهة التحويل غير صالحة.", "Invalid transfer destination.", "Destination de transfert invalide."));
  assert(VAULT_AMOUNTS.includes(amount), tr("المبلغ غير مسموح به في الخزنة.", "This amount is not allowed in the vault.", "Ce montant n’est pas autorisé dans le coffre."));
  const e = ensureEmpire(s);
  const key = uid(s, "vault-cipher");
  const reason = tr("إيداع الخزنة (الشفرة)", "Vault deposit (cipher)", "Dépôt du coffre (chiffre)");
  if (to === "club") {
    const ok = post(s, amount, "vault", reason, key);
    assert(ok, tr("تعذر تسجيل التحويل.", "The transfer could not be recorded.", "Le transfert n’a pas pu être enregistré."));
  } else {
    e.personal += amount;
  }
  return logVault(s, { to, amount, reason, kind: "cipher", id: key });
}
