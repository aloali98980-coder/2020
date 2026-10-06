import { PLAYER_ROLES, roleEffect } from "../../services/playerRoles.js";
import {
  FORMATIONS,
  TACTICAL_DEFAULTS,
  selectXI,
} from "../../services/tactics.js";
import { esc, num } from "../../ui/format.js";
export function tacticsPanel(s) {
  const t = s.management.tactics || TACTICAL_DEFAULTS;
  const opts = (key, list) =>
    `<label class="field">${{ formation: "الرسم", press: "الضغط", tempo: "الإيقاع", style: "أسلوب اللعب" }[key]}<select data-tactical="${key}">${list.map(([v, n]) => `<option value="${v}" ${t[key] === v ? "selected" : ""}>${n}</option>`).join("")}</select></label>`;
  return `<section class="panel"><h3>الرسم وملاءمة المراكز</h3><p>${t.enabled ? "المحرك الموضعي مفعّل." : "حفظة قديمة: غيّر أحد الإعدادات لتفعيل المحرك الموضعي."} الضغط العالي يحتاج تحمّلًا ويزيد الإجهاد؛ السرعة تزيد المخاطرة. لا خطة تضمن الفوز.</p><div class="form-grid">${opts(
    "formation",
    Object.keys(FORMATIONS).map((k) => [k, k]),
  )}${opts("press", [
    ["low", "منخفض"],
    ["balanced", "متوازن"],
    ["high", "عالٍ"],
  ])}${opts("tempo", [
    ["slow", "بطيء"],
    ["normal", "عادي"],
    ["fast", "سريع"],
  ])}${opts("style", [
    ["balanced", "متوازن"],
    ["possession", "استحواذ"],
    ["direct", "مباشر"],
    ["counter", "مرتدات"],
  ])}</div><h4>التشكيل المتوقع الآن</h4><div class="lineup-list">${selectXI(s)
    .map(
      (x) =>
        `<div class="lineup-player"><b>${esc(x.slot)} · ${esc(x.p.name)}</b><span>مركزه ${esc(x.p.position)} · الملاءمة ${num(Math.round(x.fit * 100))}٪</span><label>الدور<select data-player-role="${esc(x.p.id)}">${Object.entries(
          PLAYER_ROLES,
        )
          .filter(([, r]) => r.positions.includes(x.p.position))
          .map(
            ([key, r]) =>
              `<option value="${key}" ${roleEffect(s, x.p, x.slot).role === key ? "selected" : ""}>${r.name}</option>`,
          )
          .join(
            "",
          )}</select></label><small>ملاءمة الدور ${num(Math.round(roleEffect(s, x.p, x.slot).fit * 100))}٪</small></div>`,
    )
    .join(
      "",
    )}</div><p class="muted">الاختيار اليدوي أدناه له أولوية؛ اللاعب خارج مركزه يتأثر، ويُستبعد المصاب والمستدعى. الدور يتأثر بمهارات اللاعب ومركزه في الرسم؛ بعض الأدوار تزيد الإجهاد أو تقلل التغطية. لا تبديلات حية بعد.</p></section>`;
}
