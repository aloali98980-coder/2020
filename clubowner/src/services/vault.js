// الخزنة الموحدة 0.44 — المصدر/الوجهة الوحيدان: خزينة النادي والثروة الشخصية.
// • مبالغ الخزنة الثابتة: 10M / 100M / 500M / 1B.
// • التحويل إلى النادي: حر بلا عقوبة (لا حد ولا شبهات).
// • التحويل إلى الشخصي: يمر على قواعد التحويلات الذكية (السقف والأرضية والنهب) في transfers.js.
// • كل حركة تُسجَّل في الدفتر (category: vault) وفي سجل الخزنة (آخر 40 حركة): المبلغ والمصدر والوجهة والسبب.
// • فتح الخزنة بخمس نقرات متتالية خلال 3 ثوانٍ على شارة الإصدار (في الواجهة).

import { assert, uid } from "../core/utils.js";
import { post } from "./finance.js";
import { ensureEmpire } from "./empire/wealth.js";
import { takeFromClub } from "./empire/transfers.js";
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

/**
 * ينقل مبلغًا من خزينة إلى أخرى (مبالغ الخزنة الأربعة فقط).
 * @param {object} s
 * @param {{to: "club"|"personal", amount: number, confirmLoot?: boolean}} move — to هي الوجهة
 */
export function vaultMove(s, { to, amount, confirmLoot = false }) {
  assert(VAULT_DESTINATIONS.includes(to), tr("وجهة التحويل غير صالحة.", "Invalid transfer destination.", "Destination de transfert invalide."));
  assert(VAULT_AMOUNTS.includes(amount), tr("المبلغ غير مسموح به في الخزنة.", "This amount is not allowed in the vault.", "Ce montant n’est pas autorisé dans le coffre."));
  if (to === "club") {
    return moveFunds(s, {
      to,
      amount,
      reason: tr("تحويل من الخزنة الشخصية", "Transfer from personal vault", "Transfert depuis le coffre personnel"),
    });
  }
  // السحب الشخصي يمر على قواعد التحويلات الذكية (سقف الثقة والأرضية والنهب).
  return takeFromClub(s, amount, { confirmLoot });
}
