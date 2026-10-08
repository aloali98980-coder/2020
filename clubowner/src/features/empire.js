// شاشة «حياة الملياردير» 0.29 — اللعبة داخل اللعبة: ثروتان منفصلتان 💼💎،
// معيشة، أصول، عائلة، استثمارات، منافسون، وخير.
import { icon } from "../components/icons.js";
import { badge } from "../components/shared.js";
import { money, num, cur, esc } from "../ui/format.js";
import { tr } from "../i18n/index.js";
import {
  OWNER_STORIES,
  LIFESTYLES,
  TRANSFER_CAP,
  transferRemaining,
  netWorth,
} from "../services/empire/wealth.js";
import { palaceStage, owns, totalUpkeep } from "../services/empire/assets.js";
import { childStage } from "../services/empire/family.js";
import {
  EMPIRE_ASSETS,
  ASSET_CATEGORIES,
  assetsOfCat,
} from "../data/empireAssets.js";
import {
  BRIDES,
  WEDDING_TIERS,
  SCHOOLS,
  ALLOWANCES,
} from "../data/empireFamily.js";
import { GIFTS, familyHappiness } from "../services/empire/family.js";
import { EMPIRE_TEXTS } from "../data/empireTexts.js";

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const t = (k) => {
  const x = EMPIRE_TEXTS[k];
  if (!x) return k;
  return tr(x.ar, x.en, x.fr);
};
// يختار لغة حقل {ar,en,fr} في كائنات الكتالوج.
const lang = (o) => (o ? tr(o.ar, o.en, o.fr) : "");

export const EMPIRE_TABS = [
  { id: "wealth", key: "empireTabWealth", icon: "finance" },
  { id: "assets", key: "empireTabAssets", icon: "stadium" },
  { id: "family", key: "empireTabFamily", icon: "academy" },
];

function wealthTab(s) {
  const e = s.empire;
  const story = OWNER_STORIES[e.story] || OWNER_STORIES.selfmade;
  const remainingOut = transferRemaining(s, "toPersonal");
  const remainingIn = transferRemaining(s, "toClub");
  return `
  <div class="empire-fortunes">
    <div class="fortune-card club">
      <span class="fortune-emoji">💼</span>
      <div><small>${t("clubTreasury")}</small><strong>${money(s.finance.cash)}</strong><span>${cur()}</span></div>
    </div>
    <div class="fortune-card personal">
      <span class="fortune-emoji">💎</span>
      <div><small>${t("personalWealth")}</small><strong>${money(e.personal)}</strong><span>${cur()}</span></div>
    </div>
    <div class="fortune-card mini">
      <small>${t("empireNetWorth")}</small><strong>${money(netWorth(s))}</strong>
      <small>${t("empireDebt")}: ${money(e.debt)}</small>
    </div>
    <div class="fortune-card mini">
      <small>${t("empirePrestige")}</small><strong>${num(e.prestige)}</strong>
      <small>${t("empireFame")}: ${num(e.fame)}/100</small>
    </div>
  </div>

  <section class="panel">
    <div class="panel-head"><h3>${icon("crown")} ${t("ownerStoryTitle")}</h3>${badge(t("story" + cap(e.story)), "gold")}</div>
    <p class="muted">${t("story" + cap(e.story) + "Desc")}</p>
    <p>${t("storyIncome")}: <strong>${money(story.income)}</strong> ${t("perMonth")}</p>
  </section>

  <section class="panel">
    <div class="panel-head"><h3>${icon("home")} ${t("lifestyleTitle")}</h3></div>
    <p class="muted">${t("lifestyleHint")}</p>
    <div class="lifestyle-grid">
      ${Object.entries(LIFESTYLES)
        .map(
          ([tier, l]) => `
        <label class="lifestyle-option ${e.lifestyle === tier ? "selected" : ""}">
          <input type="radio" name="empire-lifestyle" value="${tier}" ${e.lifestyle === tier ? "checked" : ""}>
          <strong>${t("lifestyle" + cap(tier))}</strong>
          <small>${t("lifestyleCostLabel")}: ${money(l.cost)} / ${t("monthLabel")}</small>
        </label>`,
        )
        .join("")}
    </div>
  </section>

  <section class="panel">
    <div class="panel-head"><h3>${icon("transfer")} ${t("transfersTitle")}</h3></div>
    <p class="muted">${t("transfersHint")}</p>
    <div class="transfer-grid">
      <form id="empire-draw-form" class="transfer-box">
        <h4>💼 → 💎 ${t("transferToPersonal")}</h4>
        <small>${t("transferMonthlyCap")}: ${money(remainingOut)} / ${money(TRANSFER_CAP)}</small>
        <input type="number" name="amount" min="1" max="${remainingOut}" step="100000" placeholder="1000000">
        <button class="btn secondary" type="submit" ${remainingOut <= 0 ? "disabled" : ""}>${t("transferToPersonal")}</button>
      </form>
      <form id="empire-support-form" class="transfer-box">
        <h4>💎 → 💼 ${t("transferToClub")}</h4>
        <small>${t("transferMonthlyCap")}: ${money(remainingIn)} / ${money(TRANSFER_CAP)}</small>
        <input type="number" name="amount" min="1" max="${remainingIn}" step="100000" placeholder="1000000">
        <button class="btn secondary" type="submit" ${remainingIn <= 0 ? "disabled" : ""}>${t("transferToClub")}</button>
      </form>
    </div>
  </section>

  ${
    e.debt > 0
      ? `<section class="panel debt-panel">
    <div class="panel-head"><h3>${icon("flag")} ${t("empireDebt")}: ${money(e.debt)}</h3></div>
    <form id="empire-repay-form">
      <input type="number" name="amount" min="1" max="${Math.min(e.debt, e.personal)}" step="100000" placeholder="1000000">
      <button class="btn primary" type="submit">${t("repayDebt")}</button>
    </form>
  </section>`
      : ""
  }`;
}

function palaceBanner(s) {
  const stage = palaceStage(s);
  return `<section class="panel palace-banner">
    <div class="palace-art">${stage.art}</div>
    <div class="palace-meta">
      <small>${t("palaceStageLabel")}</small>
      <strong>${lang(stage.name)}</strong>
      <span class="muted">${t("upkeepLabel")}: ${money(totalUpkeep(s))} / ${t("monthLabel")}</span>
    </div>
  </section>`;
}

function assetRow(s, a) {
  const owned = owns(s, a.assetId);
  const afford = s.empire.personal >= a.price;
  return `<div class="asset-row ${owned ? "owned" : ""}">
    <div class="asset-info">
      <strong>${lang(a.name)}</strong>
      <small class="muted">${lang(a.desc)}</small>
      <div class="asset-nums">
        <span>💰 ${money(a.price)}</span>
        <span>🛠 ${money(a.upkeep)}/${t("monthLabel")}</span>
        <span>↩️ ${money(Math.round(a.price * a.sellPct))}</span>
        <span>✨ +${num(a.prestige)} ${t("empirePrestige")}</span>
      </div>
    </div>
    ${
      owned
        ? `<span class="badge gold">${t("ownedLabel")}</span>`
        : `<button class="btn ${afford ? "primary" : "secondary"}" data-action="empire-buy-asset" data-id="${a.assetId}" ${afford ? "" : "disabled"}>${t("buyLabel")}</button>`
    }
  </div>`;
}

function statBar(label, v) {
  return `<div class="kid-stat"><small>${label}</small><div class="bar"><i style="width:${Math.round(v)}%"></i></div><span>${num(Math.round(v))}</span></div>`;
}

function familyTab(s) {
  const fam = s.empire.family;
  const w = fam.wife;
  // ── أعزب/مطلق: اختر عروسًا ──
  if (fam.status === "single" || fam.status === "divorced") {
    return `<p class="muted">${t("familyTabHint")}</p>
    <div class="bride-grid">
      ${Object.entries(BRIDES)
        .map(
          ([id, b]) => `
        <div class="bride-card">
          <strong>${lang(b.name)}</strong>
          <small class="muted">${lang(b.desc)}</small>
          <small class="gold-text">${lang(b.bonus)}</small>
          <small>💍 ${money(b.ring)}</small>
          <button class="btn primary" data-action="empire-propose" data-id="${id}">${t("proposeLabel")}</button>
        </div>`,
        )
        .join("")}
    </div>`;
  }
  // ── مخطوب: اختر درجة الفرح ──
  if (fam.status === "engaged") {
    const bride = BRIDES[fam.brideId];
    return `<section class="panel"><div class="panel-head"><h3>💍 ${t("engagedLabel")} — ${lang(bride.name)}</h3></div>
    <p class="muted">${t("familyTabHint")}</p></section>
    <div class="bride-grid">
      ${Object.entries(WEDDING_TIERS)
        .map(
          ([id, wt]) => `
        <div class="bride-card">
          <strong>${lang(wt.name)}</strong>
          <small class="muted">${lang(wt.desc)}</small>
          <small>💰 ${money(wt.cost)}</small>
          <button class="btn primary" data-action="empire-marry" data-id="${id}">${t("marryLabel")}</button>
        </div>`,
        )
        .join("")}
    </div>`;
  }
  // ── متزوج: الزوجة والأولاد ──
  return `
  <section class="panel wife-panel">
    <div class="panel-head"><h3>💖 ${t("wifeLabel")}: ${w.name}</h3>${badge(t("happinessLabel") + " " + num(w.happiness) + "/100", w.happiness >= 60 ? "gold" : "")}</div>
    <div class="wife-meta">
      <span>${t("birthdayLabel")}: <b>${w.birthday}</b></span>
      <span>${t("anniversaryLabel")}: <b>${w.marriedOn.slice(5, 10)}</b></span>
      ${w.demandActive ? `<span class="red">⚠️ ${t("demandTitle")}</span>` : ""}
    </div>
    <div class="gift-row">
      ${Object.entries(GIFTS)
        .map(
          ([id, g]) =>
            `<button class="btn secondary" data-action="empire-gift" data-id="${id}">${lang(g.name)} — ${money(g.cost)}</button>`,
        )
        .join("")}
      <button class="btn danger" data-action="empire-divorce">${t("divorceLabel")}</button>
    </div>
  </section>
  <section class="panel">
    <div class="panel-head"><h3>🧒 ${t("childrenLabel")} (${num(fam.children.length)})</h3></div>
    ${
      fam.children.length === 0
        ? `<p class="muted">${t("noFamilyYet")}</p>`
        : fam.children
            .map((c) => {
              const stage = childStage(c, s.date);
              const stageKey =
                stage === "infant"
                  ? "stageInfant"
                  : stage === "child"
                    ? "stageChild"
                    : "stageTeen";
              return `<div class="kid-row">
        <div class="kid-head"><strong>${c.name}</strong> <small>${t(stageKey)}</small></div>
        <div class="kid-stats">
          ${statBar(t("disciplineLabel"), c.discipline)}
          ${statBar(t("talentLabel"), c.talent)}
          ${statBar(t("ambitionLabel"), c.ambition)}
        </div>
        <div class="kid-controls">
          <label>${t("schoolLabel")}
            <select data-child="${c.id}" data-kind="school">
              ${Object.entries(SCHOOLS)
                .map(
                  ([id, sc]) =>
                    `<option value="${id}" ${c.school === id ? "selected" : ""}>${lang(sc.name)}${sc.cost ? ` (${money(sc.cost)})` : ""}</option>`,
                )
                .join("")}
            </select>
          </label>
          <label>${t("allowanceLabel")}
            <select data-child="${c.id}" data-kind="allowance">
              ${Object.entries(ALLOWANCES)
                .map(
                  ([id, al]) =>
                    `<option value="${id}" ${c.allowance === id ? "selected" : ""}>${lang(al.name)}${al.cost ? ` (${money(al.cost)})` : ""}</option>`,
                )
                .join("")}
            </select>
          </label>
        </div>
      </div>`;
            })
            .join("")
    }
  </section>`;
}

function ownedList(s) {
  const rows = (s.empire.assets || []).map((o) => {
    const a = EMPIRE_ASSETS.find((x) => x.id === o.assetId);
    if (!a) return "";
    return `<div class="asset-row owned">
      <div class="asset-info">
        <strong>${lang(a.name)}</strong>
        <small class="muted">${lang(a.desc)}</small>
        <div class="asset-nums">
          <span>🛠 ${money(a.upkeep)}/${t("monthLabel")}</span>
          <span>↩️ ${money(o.sellValue)}</span>
        </div>
      </div>
      <button class="btn secondary" data-action="empire-sell-asset" data-id="${o.id}">${t("sellLabel")}</button>
    </div>`;
  });
  return `<section class="panel">
    <div class="panel-head"><h3>${t("ownedLabel")} (${num(s.empire.assets.length)})</h3></div>
    <div class="asset-list">${rows.join("") || `<p class="muted">—</p>`}</div>
  </section>`;
}

function assetsTab(s) {
  return `${palaceBanner(s)}
  <p class="muted">${t("assetsTabHint")}</p>
  ${ownedList(s)}
  ${ASSET_CATEGORIES.map(
    (cat) => `
    <section class="panel">
      <div class="panel-head"><h3>${lang(cat.name)}</h3></div>
      <div class="asset-list">${assetsOfCat(cat.id).map((a) => assetRow(s, a)).join("")}</div>
    </section>`,
  ).join("")}`;
}

export function empireView(s, tab = "wealth") {
  if (!s.empire)
    return `<div class="empty-state"><h3>${t("empireName")}</h3><p>${t("empireEmptyStory")}</p></div>`;
  const active = EMPIRE_TABS.some((x) => x.id === tab) ? tab : "wealth";
  return `<div class="empire-page">
    <div class="empire-hero">
      <h2>🏰 ${t("empireName")}</h2>
      <p class="muted">${t("empireKicker")}</p>
    </div>
    <div class="empire-tabs" role="tablist">
      ${EMPIRE_TABS.map(
        (x) =>
          `<button class="empire-tab ${active === x.id ? "active" : ""}" data-action="empire-tab" data-tab="${x.id}">${icon(x.icon, 16)} ${t(x.key)}</button>`,
      ).join("")}
    </div>
    <div class="empire-tab-body">${
      active === "wealth"
        ? wealthTab(s)
        : active === "assets"
          ? assetsTab(s)
          : active === "family"
            ? familyTab(s)
            : `<div class="empty-state"><p>${t("empireTab" + cap(active))}…</p></div>`
    }</div>
  </div>`;
}
