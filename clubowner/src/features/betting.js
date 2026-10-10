// شاشة إمبراطورية المراهنات 0.36 — الشراء والتأسيس والتراخيص (المجموعة 1).
import { icon } from "../components/icons.js";
import { badge } from "../components/shared.js";
import { money, num, esc } from "../ui/format.js";
import { tr } from "../i18n/index.js";
import {
  LICENSE_TIERS,
  LICENSE_ORDER,
  BETTING_COMPANIES,
  BRANCH_LEVELS,
  ONLINE_LEVELS,
} from "../data/bettingCatalog.js";
import { BETTING_TEXTS } from "../data/bettingTexts.js";

const t = (k) => {
  const x = BETTING_TEXTS[k];
  if (!x) return k;
  return tr(x.ar, x.en, x.fr);
};
const lang = (o) => (o ? tr(o.ar, o.en, o.fr) : "");

export function bettingView(s) {
  const b = s.betting;
  if (!b) return `<div class="empty-state"><p>${t("noCompany")}</p></div>`;

  // ── لا شركة: عرض السوق المفتوح + خيارات الدخول ────────────────────────
  if (!b.owned) {
    return `<div class="betting-page">
      <div class="empire-hero">
        <h2>🎰 ${t("bettingName")}</h2>
        <p class="muted">${t("bettingKicker")}</p>
        <p class="muted">${t("marketValueHint")}</p>
      </div>

      <section class="panel">
        <div class="panel-head"><h3>${icon("finance")} درجات الترخيص</h3></div>
        <div class="vehicle-grid">
          ${LICENSE_ORDER.map((id) => {
            const tier = LICENSE_TIERS[id];
            const can = (() => {
              const sus = s.blackFiles?.suspicion ?? 0;
              return sus < tier.maxSuspicion;
            })();
            return `<div class="vehicle-card">
              <h4>${lang(tier.name)} — ${money(tier.fee + tier.setup)}</h4>
              <p class="muted">${lang(tier.desc)}</p>
              <small>سمعة ≥ ${tier.minReputation} · شبهات < ${tier.maxSuspicion}% · صيانة ${money(tier.upkeep)}/${t("onlineLabel")}</small>
              <small>رسوم ترخيص ${money(tier.fee)} + تجهيز ${money(tier.setup)} · إطلاق ${tier.days} يوم</small>
              <button class="btn primary" data-action="betting-found" data-tier="${tier.id}" ${can ? "" : "disabled"}>${t("foundLabel")} ${lang(tier.name)}</button>
              ${can ? "" : `<small class="red">${t("needSuspicion")}</small>`}
            </div>`;
          }).join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><h3>${icon("transfer")} شركات قائمة للبيع</h3></div>
        <div class="vehicle-grid">
          ${BETTING_COMPANIES.map((c) => {
            const afford = (s.empire?.personal ?? 0) >= c.price;
            return `<div class="vehicle-card">
              <h4>${lang(c.name)} <small>${c.size} · ${c.customers} عميل · سمعة ${c.reputation}</small></h4>
              <p class="muted">${lang(c.desc)}</p>
              <p>فروع ${c.branches} · تطبيق ${c.onlineLevel} · <b>${money(c.price)}</b></p>
              <button class="btn ${afford ? "primary" : "secondary"}" data-action="betting-buy" data-id="${c.id}" ${afford ? "" : "disabled"}>${t("buyLabel")} — ${money(c.price)}</button>
            </div>`;
          }).join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><h3>${icon("crown")} منافسون في السوق</h3></div>
        <div class="report-list">
          ${(b.competitors || []).map((co) => `<div class="report-row"><b>${lang(co.name)}</b><span>${num(co.customers)} عميل</span><span>سمعة ${co.reputation}</span></div>`).join("")}
        </div>
      </section>
    </div>`;
  }

  // ── تملك شركة: لوحة القيادة الأساسية (تُوسَّع في مجموعات لاحقة) ──────
  const tier = LICENSE_TIERS[b.licenseTier] || LICENSE_TIERS.local;
  const susp = s.blackFiles?.suspicion ?? 0;
  const susBlock = susp >= tier.maxSuspicion;
  return `<div class="betting-page">
    <div class="empire-hero">
      <h2>🎰 ${esc(lang(b.name))} — ${lang(tier.name)}</h2>
      <p class="muted">${t("bettingKicker")} · ${t("licenseLabel")}: ${lang(tier.name)} · ${t("reputationLabel")} ${b.reputation} · ${t("customersLabel")} ${num(b.customers)}</p>
      ${b.licenseStatus === "suspended" ? `<p class="red">⏸️ ${t("licenseSuspendedTitle")} حتى ${b.suspensionUntil || "—"}</p>` : ""}
      ${b.licenseStatus === "revoked" ? `<p class="red">⛔ ${t("licenseRevokedTitle")}</p>` : ""}
    </div>

    <div class="empire-fortunes">
      <div class="fortune-card"><small>${t("customersLabel")}</small><strong>${num(b.customers)}</strong></div>
      <div class="fortune-card"><small>${t("reputationLabel")}</small><strong>${num(b.reputation)}/100</strong></div>
      <div class="fortune-card"><small>${t("profitLabel")}</small><strong>${money(b.lastMonthProfit || 0)}</strong></div>
      <div class="fortune-card"><small>${t("valuationLabel")}</small><strong>${money(b.marketValue || 0)}</strong><small>${t("marketValueHint")}</small></div>
    </div>

    <section class="panel">
      <div class="panel-head"><h3>${icon("finance")} ${t("licenseLabel")}: ${lang(tier.name)}</h3>${badge(b.licenseStatus, b.licenseStatus === "active" ? "gold" : "danger")}</div>
      <p class="muted">${lang(tier.desc)}</p>
      <div class="transfer-grid">
        ${LICENSE_ORDER.map((id) => {
          const tt = LICENSE_TIERS[id];
          const isCurrent = b.licenseTier === id;
          const canUpgrade = LICENSE_ORDER.indexOf(id) > LICENSE_ORDER.indexOf(b.licenseTier);
          const needRep = b.reputation >= tt.minReputation;
          const needSus = susp < tt.maxSuspicion;
          return `<div class="transfer-box">
            <h4>${lang(tt.name)}</h4>
            <small>${money(tt.fee + tt.setup)} · سمعة ≥ ${tt.minReputation} · شبهات < ${tt.maxSuspicion}%</small>
            ${isCurrent ? `<span class="badge gold">حالي</span>` : canUpgrade ? `<button class="btn secondary" data-action="betting-upgrade-license" data-tier="${id}" ${needRep && needSus ? "" : "disabled"}>ترقية</button>${!needRep ? `<small class="red">${t("needReputation")}</small>` : ""}${!needSus ? `<small class="red">${t("needSuspicion")}</small>` : ""}` : `<small class="muted">—</small>`}
          </div>`;
        }).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h3>${icon("stadium")} ${t("branchesLabel")} ${b.branches} · ${t("onlineLabel")} ${b.onlineLevel}</h3></div>
      <div class="transfer-grid">
        <div class="transfer-box">
          <h4>${t("branchesLabel")}</h4>
          <p class="muted">مستوى ${b.branches} → التالي ${b.branches + 1 <= 5 ? BRANCH_LEVELS[b.branches + 1].cost ? money(BRANCH_LEVELS[b.branches + 1].cost) : "الأقصى" : "الأقصى"}</p>
          ${b.branches < 5 ? `<button class="btn secondary" data-action="betting-up-branch">ترقية الفروع</button>` : `<small class="muted">الأقصى</small>`}
        </div>
        <div class="transfer-box">
          <h4>${t("onlineLabel")}</h4>
          <p class="muted">مستوى ${b.onlineLevel} → التالي ${b.onlineLevel + 1 <= 5 ? ONLINE_LEVELS[b.onlineLevel + 1].cost ? money(ONLINE_LEVELS[b.onlineLevel + 1].cost) : "الأقصى" : "الأقصى"}</p>
          ${b.onlineLevel < 5 ? `<button class="btn secondary" data-action="betting-up-online">ترقية المنصة</button>` : `<small class="muted">الأقصى</small>`}
        </div>
      </div>
      <div class="transfer-box" style="margin-top:10px">
        <h4>${t("marketingLabel")}</h4>
        <small>الحالي ${money(b.marketingSpend)}/شهر — حد أقصى ${money(2_000_000)}</small>
        <input type="range" min="0" max="2000000" step="50000" value="${b.marketingSpend}" data-action="betting-marketing-slide" id="betting-marketing">
        <span id="betting-marketing-val">${money(b.marketingSpend)}</span>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h3>📈 الربحية (آخر 6 أشهر)</h3></div>
      <div class="report-list">
        ${(b.profits || []).slice(-6).map((r) => `<div class="report-row"><b>${r.month}</b><span class="${r.profit >= 0 ? "green" : "red"}">${money(r.profit)}</span><span>${r.customers} عميل</span></div>`).join("") || `<p class="muted">لا أرباح بعد</p>`}
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h3>🏷️ منافسون</h3></div>
      <div class="report-list">
        ${(b.competitors || []).map((co) => `<div class="report-row"><b>${lang(co.name)}</b><span>${num(co.customers)} عميل</span><span>سمعة ${co.reputation}</span><button class="btn secondary" data-action="betting-buy-competitor" data-id="${co.id}">شراء</button></div>`).join("")}
      </div>
    </section>
  </div>`;
}
