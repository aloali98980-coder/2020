// الدفعة 6 — القسم 1: صفحة الإنجازات. الأساسيات ظاهرة (الاسم، المرتبة، التقدم)، والتفاصيل خلف ⓘ.
import { esc, num, money } from "../ui/format.js";
import { getLanguage } from "../i18n/index.js";
import { achievementList, ensureAchievements } from "../services/achievements.js";
import { ACHIEVEMENT_FAMILIES, ACHIEVEMENT_TIERS, ACHIEVEMENT_UI, TIER_NAME } from "../data/achievements.js";

const pick = (o) => o[getLanguage()] || o.ar;
const info = (text) =>
  `<details class="info-toggle"><summary aria-label="ⓘ">ⓘ</summary><p>${esc(text)}</p></details>`;

// القيم النقدية بصيغة المال، والباقي أعداد لاتينية.
const valueText = (family, value) => (family.id === "cash" ? money(value) : num(value));

export function achievementsView(s) {
  ensureAchievements(s);
  const list = achievementList(s);
  const unlocked = list.filter((a) => a.unlocked).length;
  const total = list.length;
  const percent = Math.floor((unlocked / total) * 100);

  const families = ACHIEVEMENT_FAMILIES.map((fam) => {
    const items = list.filter((a) => a.family.id === fam.id);
    const rows = ACHIEVEMENT_TIERS.map((tier) => {
      const a = items.find((x) => x.tier === tier);
      const name = pick(TIER_NAME[tier]);
      return `<li class="achievement-row ${a.unlocked ? "is-unlocked" : ""}">
        <span class="achievement-tier tier-${tier}">${esc(name)}</span>
        <span class="achievement-target">${valueText(fam, a.value)} / ${valueText(fam, a.target)}</span>
        <span class="achievement-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${a.progress}"><i style="width:${a.progress}%"></i></span>
        <span class="achievement-pct">${num(a.progress)}%</span>
        <span class="achievement-state">${a.unlocked ? esc(pick(ACHIEVEMENT_UI.open)) : esc(pick(ACHIEVEMENT_UI.locked))}</span>
      </li>`;
    }).join("");
    return `<section class="panel achievement-family">
      <header><h3>${esc(pick(fam.name))}</h3>${info(pick(fam.info))}</header>
      <ul class="achievement-list">${rows}</ul>
    </section>`;
  }).join("");

  return `<div class="page achievements-page">
    <header class="page-head"><h2>${esc(pick(ACHIEVEMENT_UI.title))}</h2>
      <p class="muted">${esc(pick(ACHIEVEMENT_UI.unlocked))} ${num(unlocked)} / ${num(total)} (${num(percent)}%)</p>
    </header>
    <div class="achievement-grid">${families}</div>
  </div>`;
}
