// واجهة بورصة الأندية 0.37 — مؤشر، رسوم SVG، تداول ومحفظة بلا مكتبات خارجية.
import { badge } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { cur, esc, money, num } from "../ui/format.js";
import { getLanguage } from "../i18n/index.js";
import { STOCK_MARKET_TEXTS } from "../data/stockMarketTexts.js";
import {
  STOCK_MARKET_EVENTS,
  STOCK_MARKET_EVENT_BY_ID,
} from "../data/stockMarketEvents.js";
import {
  ensureStockMarket,
  listingById,
} from "../services/stockMarket/state.js";
import { marketMovers } from "../services/stockMarket/engine.js";
import {
  portfolioSummary,
  tradeQuote,
} from "../services/stockMarket/trading.js";
import { insideOpportunity } from "../services/stockMarket/insider.js";
import { combinedMarketExposure } from "../services/stockMarket/regulation.js";

const text = (key) => {
  const value = STOCK_MARKET_TEXTS[key];
  const language = getLanguage();
  return value?.[language] || value?.en || key;
};
const localized = (value) =>
  value?.[getLanguage()] || value?.en || value?.ar || "";
const localName = (listing) =>
  localized(listing?.name) || listing?.symbol || "—";
const cycleLabel = (phase) =>
  text(
    phase === "bull"
      ? "cycleBull"
      : phase === "bubble"
        ? "cycleBubble"
        : phase === "crash"
          ? "cycleCrash"
          : phase === "recovery"
            ? "cycleRecovery"
            : "cycleNeutral",
  );
const pct = (value) =>
  `${value >= 0 ? "+" : ""}${num((Number(value) || 0) * 100)}%`;
const statusText = (listing) =>
  listing.haltedUntil
    ? text("halted")
    : listing.status === "private"
      ? text("privateClub")
      : listing.distressScore >= 60
        ? text("distressed")
        : text("listed");
const statusTone = (listing) =>
  listing.haltedUntil || listing.distressScore >= 60
    ? "danger"
    : listing.status === "private"
      ? ""
      : "gold";

function chart(history, { height = 150, label = "" } = {}) {
  const values = (history || [])
    .map((entry) => Number(entry[1]))
    .filter(Number.isFinite);
  if (!values.length) return `<p class="muted">${text("noHistory")}</p>`;
  const width = 640;
  const pad = 14;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(0.01, max - min);
  const points = values
    .map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : pad + (index * (width - pad * 2)) / (values.length - 1);
      const y = height - pad - ((value - min) / spread) * (height - pad * 2);
      return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
    })
    .join(" ");
  const rising = values.at(-1) >= values[0];
  return `<svg class="market-chart ${rising ? "up" : "down"}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
    <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" class="market-axis"/>
    <polyline points="${points}" fill="none" vector-effect="non-scaling-stroke"/>
    <text x="${pad}" y="12">${num(max)}</text><text x="${pad}" y="${height - 2}">${num(min)}</text>
  </svg>`;
}

function moverList(items) {
  return `<div class="market-movers">${items
    .map(
      (
        listing,
      ) => `<button type="button" class="market-mover" data-action="market-select" data-id="${esc(listing.id)}">
        <span><b>${esc(localName(listing))}</b><small>${esc(listing.symbol)}</small></span>
        <strong class="${listing.lastReturn >= 0 ? "green" : "red"}">${pct(listing.lastReturn)}</strong>
      </button>`,
    )
    .join("")}</div>`;
}

function listingTable(listings, selectedId, query) {
  const needle = String(query || "")
    .trim()
    .toLocaleLowerCase();
  const filtered = listings.filter(
    (listing) =>
      !needle ||
      `${localName(listing)} ${listing.symbol} ${listing.country}`
        .toLocaleLowerCase()
        .includes(needle),
  );
  const visible = filtered
    .sort(
      (a, b) =>
        Number(b.ownerControlled) - Number(a.ownerControlled) ||
        b.marketCap - a.marketCap,
    )
    .slice(0, 80);
  return `<section class="panel market-list-panel">
    <div class="panel-head"><h3>${icon("finance")} ${text("listings")}</h3><span>${num(filtered.length)} / ${num(listings.length)}</span></div>
    <label class="market-search"><span>${text("searchClub")}</span><input id="market-search" type="search" value="${esc(query || "")}" placeholder="${esc(text("searchClub"))}" autocomplete="off"></label>
    <div class="market-table" role="table">
      ${
        visible
          .map(
            (
              listing,
            ) => `<button type="button" class="market-row ${listing.id === selectedId ? "selected" : ""}" data-action="market-select" data-id="${esc(listing.id)}" role="row">
            <span class="market-company"><b>${esc(localName(listing))}</b><small>${esc(listing.symbol)} · ${esc(listing.country || "—")}</small></span>
            <span><small>${text("sharePrice")}</small><b>${money(listing.price, false)} ${cur()}</b></span>
            <span><small>${text("monthlyChange")}</small><b class="${listing.lastReturn >= 0 ? "green" : "red"}">${pct(listing.lastReturn)}</b></span>
            <span><small>${text("marketCap")}</small><b>${money(listing.marketCap)}</b></span>
            <span>${badge(statusText(listing), statusTone(listing))}</span>
          </button>`,
          )
          .join("") || `<p class="empty-state">${text("searchClub")}</p>`
      }
    </div>
  </section>`;
}

function selectedCard(listing) {
  if (!listing) return "";
  return `<section class="panel market-focus-card">
    <div class="panel-head">
      <div><h3>${esc(localName(listing))} <small>${esc(listing.symbol)}</small></h3><p class="muted">${text("lastUpdate")}: ${esc(listing.history.at(-1)?.[0] || "—")}</p></div>
      ${badge(statusText(listing), statusTone(listing))}
    </div>
    <div class="market-quote-grid">
      <div><small>${text("sharePrice")}</small><strong>${money(listing.price, false)} ${cur()}</strong></div>
      <div><small>${text("monthlyChange")}</small><strong class="${listing.lastReturn >= 0 ? "green" : "red"}">${pct(listing.lastReturn)}</strong></div>
      <div><small>${text("marketCap")}</small><strong>${money(listing.marketCap)}</strong></div>
      <div><small>${text("history")}</small><strong>${num(listing.history.length)}</strong></div>
    </div>
    ${chart(listing.history, { label: `${text("history")} — ${localName(listing)}` })}
  </section>`;
}

function overviewTab(s, market, selected, query) {
  const listings = market.listings;
  const movers = marketMovers(s);
  return `<section class="panel market-index-panel">
      <div class="panel-head"><div><h3>${text("index")}</h3><p class="muted">${text("indexHint")}</p></div>${badge(cycleLabel(market.cycle.phase), market.cycle.phase === "crash" ? "danger" : "gold")}</div>
      ${chart(market.index.history, { label: text("index") })}
      <p class="market-engine-note">${text("priceEngine")}</p>
    </section>
    <div class="market-columns">
      <section class="panel"><div class="panel-head"><h3>🚀 ${text("gainers")}</h3></div>${moverList(movers.gainers)}</section>
      <section class="panel"><div class="panel-head"><h3>📉 ${text("losers")}</h3></div>${moverList(movers.losers)}</section>
    </div>
    ${selectedCard(selected)}
    ${listingTable(listings, selected?.id, query)}`;
}

function positionRows(summary) {
  if (!summary.positions.length)
    return `<div class="empty-state"><p>${text("noHoldings")}</p></div>`;
  return `<div class="market-position-list">${summary.positions
    .map(
      (
        position,
      ) => `<button type="button" class="market-position" data-action="market-select" data-id="${esc(position.listingId)}">
        <span><b>${esc(localName(position.listing))}</b><small>${esc(position.listing?.symbol || "—")}</small></span>
        <span><small>${text("quantity")}</small><b>${num(position.quantity)}</b></span>
        <span><small>${text("averagePrice")}</small><b>${money(position.averagePrice, false)}</b></span>
        <span><small>${text("portfolioValue")}</small><b>${money(position.marketValue)}</b></span>
        <strong class="${position.unrealized >= 0 ? "green" : "red"}">${money(position.unrealized)} · ${position.returnPct >= 0 ? "+" : ""}${num(position.returnPct)}%</strong>
      </button>`,
    )
    .join("")}</div>`;
}

function tradingTab(s, market, selected) {
  const summary = portfolioSummary(s);
  const tradable =
    selected?.status === "listed"
      ? selected
      : market.listings.find((listing) => listing.status === "listed");
  const owned = summary.positions.find(
    (position) => position.listingId === tradable?.id,
  );
  const sample = tradable ? tradeQuote(tradable, 100, "buy") : null;
  return `<div class="market-portfolio-summary">
      <div><small>${text("personalWealth")}</small><strong>${money(s.empire?.personal || 0)}</strong></div>
      <div><small>${text("portfolioValue")}</small><strong>${money(summary.value)}</strong></div>
      <div><small>${text("unrealizedProfit")}</small><strong class="${summary.unrealized >= 0 ? "green" : "red"}">${money(summary.unrealized)}</strong></div>
      <div><small>${text("realizedProfit")}</small><strong class="${summary.realized >= 0 ? "green" : "red"}">${money(summary.realized)}</strong></div>
      <div><small>${text("dividends")}</small><strong>${money(summary.dividends)}</strong></div>
    </div>
    <section class="panel market-trade-ticket">
      <div class="panel-head"><div><h3>${esc(localName(tradable))} · ${esc(tradable?.symbol || "—")}</h3><p class="muted">${text("sharePrice")}: ${money(tradable?.price || 0, false)} ${cur()} · ${text("quantity")}: ${num(owned?.quantity || 0)}</p></div>${tradable ? badge(statusText(tradable), statusTone(tradable)) : ""}</div>
      <div class="market-ticket-grid">
        <label><span>${text("quantity")}</span><input id="market-trade-quantity" type="number" min="1" step="1" value="100"></label>
        <div><small>${text("orderEstimate")} · 100</small><strong>${sample ? money(sample.total) : "—"}</strong><small>${text("brokerageFee")}: ${sample ? money(sample.fee) : "—"}</small></div>
      </div>
      <div class="market-ticket-actions">
        <button class="btn primary" data-action="market-buy" data-id="${esc(tradable?.id || "")}" ${tradable ? "" : "disabled"}>${text("buyShares")}</button>
        <button class="btn secondary" data-action="market-sell" data-id="${esc(tradable?.id || "")}" ${owned?.quantity ? "" : "disabled"}>${text("sellShares")}</button>
      </div>
      <p class="market-engine-note">${text("dividendHint")}</p>
    </section>
    <section class="panel"><div class="panel-head"><h3>${icon("transfer")} ${text("holdings")}</h3><span>${num(summary.positions.length)}</span></div>${positionRows(summary)}</section>
    ${selectedCard(tradable)}`;
}

function insiderRows(s, market) {
  const active = market.insider.knowledge.filter((info) =>
    ["active", "used"].includes(info.status),
  );
  if (!active.length)
    return `<div class="empty-state"><p>${text("noInsideKnowledge")}</p></div>`;
  return `<div class="inside-list">${active
    .map((info) => {
      const listing = market.listings.find(
        (entry) => entry.id === info.listingId,
      );
      const side = info.direction > 0 ? "buy" : "sell";
      let opportunity = null;
      try {
        opportunity = insideOpportunity(s, info.id, 100, side);
      } catch {}
      const owned = market.portfolio.positions.find(
        (position) => position.listingId === info.listingId,
      );
      return `<article class="inside-card">
        <div class="panel-head"><div><h4>${esc(localName(listing))} · ${text(info.textKey)}</h4><small>${text("publicDate")}: ${esc(info.publicOn)}</small></div>${badge(`${info.direction > 0 ? "↗" : "↘"} ${text("expectedMove")}`, info.direction > 0 ? "gold" : "danger")}</div>
        <div class="inside-metrics"><span>${text("profitPotential")}: <b class="green">${opportunity ? money(Math.abs(opportunity.expectedProfit)) : "—"}</b></span><span>${text("detectionRisk")}: <b class="red">${opportunity ? num(opportunity.detectionChance) : "—"}%</b></span></div>
        <label><span>${text("quantity")}</span><input id="inside-qty-${esc(info.id)}" type="number" min="1" step="1" value="100"></label>
        <div class="market-ticket-actions">
          <button class="btn primary" data-action="market-insider-buy" data-id="${esc(info.id)}" ${listing?.status === "listed" ? "" : "disabled"}>${text("tradeInsideBuy")}</button>
          <button class="btn secondary" data-action="market-insider-sell" data-id="${esc(info.id)}" ${listing?.status === "listed" && owned?.quantity ? "" : "disabled"}>${text("tradeInsideSell")}</button>
        </div>
      </article>`;
    })
    .join("")}</div>`;
}

function manipulationRows(s, market) {
  const campaigns = market.manipulation.campaigns.filter(
    (campaign) => campaign.status === "active",
  );
  const shorts = market.portfolio.shorts.filter(
    (position) => position.status === "open",
  );
  if (!campaigns.length && !shorts.length)
    return `<p class="muted">${text("activeCampaigns")}: 0</p>`;
  return `<div class="market-operation-list">
    ${campaigns
      .map((campaign) => {
        const listing = market.listings.find(
          (entry) => entry.id === campaign.listingId,
        );
        return `<div class="market-operation"><span><b>${esc(localName(listing))}</b><small>${campaign.type === "pump-dump" ? text("pumpCampaign") : campaign.type === "poach-short" ? text("shortBeforePoach") : text("channelRumor")}</small></span><span>${text("detectionRisk")}: <b class="red">${num(campaign.detectionRisk)}%</b></span>${campaign.type === "pump-dump" ? `<button class="btn danger" data-action="market-dump" data-id="${esc(campaign.id)}">${text("dumpNow")}</button>` : ""}</div>`;
      })
      .join("")}
    ${shorts
      .map((position) => {
        const listing = market.listings.find(
          (entry) => entry.id === position.listingId,
        );
        const running = Math.round(
          (position.entryPrice - (listing?.price || 0)) * position.quantity,
        );
        return `<div class="market-operation"><span><b>${esc(localName(listing))}</b><small>${text("shortSell")} · ${num(position.quantity)}</small></span><strong class="${running >= 0 ? "green" : "red"}">${money(running)}</strong><button class="btn secondary" data-action="market-close-short" data-id="${esc(position.id)}">${text("closeShort")}</button></div>`;
      })
      .join("")}
  </div>`;
}

function insiderTab(s, market, selected) {
  const tradable =
    selected?.status === "listed"
      ? selected
      : market.listings.find((listing) => listing.status === "listed");
  return `<div class="market-risk-strip">
      <div><small>${text("detectionRisk")}</small><strong class="red">${num(combinedMarketExposure(s))}%</strong></div>
      <div><small>${text("regulatorRisk")}</small><strong>${num(market.regulator.risk)}%</strong></div>
      <div><small>${text("realizedProfit")}</small><strong>${money(market.insider.profit + market.manipulation.profit)}</strong></div>
    </div>
    <section class="panel market-dark-panel"><div class="panel-head"><h3>${text("secrets")}</h3>${badge(`${num(market.insider.exposure)}%`, "danger")}</div><p class="muted">${text("insideKnowledge")}</p>${insiderRows(s, market)}</section>
    <section class="panel"><div class="panel-head"><h3>${text("planSecret")}: ${esc(localName(tradable))}</h3></div><div class="market-ticket-actions"><button class="btn secondary" data-action="market-plan-secret" data-kind="transfer" data-id="${esc(tradable?.id || "")}">${text("plannedTransfer")}</button><button class="btn secondary" data-action="market-plan-secret" data-kind="coach-dismissal" data-id="${esc(tradable?.id || "")}">${text("coachDismissal")}</button><button class="btn secondary" data-action="market-plan-secret" data-kind="federation-law" data-id="${esc(tradable?.id || "")}" ${s.politics?.office?.held ? "" : "disabled"}>${text("federationLaw")}</button></div></section>
    <section class="panel market-dark-panel">
      <div class="panel-head"><h3>${text("manipulation")}</h3>${badge(`${num(market.manipulation.exposure)}%`, "danger")}</div>
      <p class="muted">${text("channelRumor")}</p>
      <div class="market-ticket-grid"><label><span>${text("campaignBudget")}</span><input id="market-rumor-budget" type="number" min="100000" step="100000" value="1000000"></label><label><span>${text("quantity")}</span><input id="market-manip-quantity" type="number" min="1" step="1" value="1000"></label></div>
      <div class="market-ticket-actions"><button class="btn primary" data-action="market-pump-dump" data-id="${esc(tradable?.id || "")}">${text("pumpCampaign")}</button><button class="btn secondary" data-action="market-bear-rumor" data-id="${esc(tradable?.id || "")}">${text("negativeRumor")}</button><button class="btn danger" data-action="market-short-poach" data-id="${esc(tradable?.id || "")}" ${tradable?.clubId === s.clubId ? "disabled" : ""}>${text("shortBeforePoach")}</button></div>
      ${manipulationRows(s, market)}
    </section>`;
}

function regulatorStatusText(status) {
  return status === "criminal"
    ? text("criminalStatus")
    : status === "investigation"
      ? text("investigationStatus")
      : status === "watch" || status === "suspended"
        ? text("watchStatus")
        : text("cleanStatus");
}

function regulationTab(s, market) {
  const regulator = market.regulator;
  const open = regulator.investigations.filter(
    (investigation) => investigation.status === "open",
  );
  return `<div class="market-risk-strip">
      <div><small>${text("regulatorRisk")}</small><strong class="${regulator.risk >= 50 ? "red" : "green"}">${num(regulator.risk)}%</strong></div>
      <div><small>${text("regulation")}</small><strong>${regulatorStatusText(regulator.status)}</strong></div>
      <div><small>${text("brokerageFee")}</small><strong>${money(regulator.finesTotal)}</strong></div>
      <div><small>${text("whistleblower")}</small><strong>${num(regulator.whistleblowers)}</strong></div>
    </div>
    <section class="panel"><div class="panel-head"><div><h3>⚖️ ${text("regulatorName")}</h3><p class="muted">${text("marketSuspension")}</p></div>${badge(regulatorStatusText(regulator.status), regulator.status === "clear" ? "gold" : "danger")}</div><button class="btn secondary" data-action="market-audit">${text("auditNow")}</button></section>
    ${open
      .map(
        (investigation) =>
          `<section class="panel market-investigation"><div class="panel-head"><h3>${text("investigationStatus")} · ${esc(investigation.id)}</h3>${badge(`${text("detectionRisk")} ${num(investigation.evidence)}%`, "danger")}</div><p class="muted">${text("publicDate")}: ${esc(investigation.dueOn)}</p><div class="market-ticket-actions"><button class="btn primary" data-action="market-case-response" data-response="cooperate" data-id="${esc(investigation.id)}">${text("cooperate")}</button><button class="btn danger" data-action="market-case-response" data-response="fight" data-id="${esc(investigation.id)}">${text("fightCase")}</button></div></section>`,
      )
      .join("")}
    <section class="panel"><div class="panel-head"><h3>${text("history")}</h3><span>${num(regulator.audits.length)}</span></div><div class="report-list">${regulator.audits
      .slice(0, 12)
      .map(
        (audit) =>
          `<div class="report-row"><b>${esc(audit.date)}</b><span>${audit.status === "clean" ? text("auditClean") : text("auditOpened")}</span><span>${num(audit.risk)}%</span></div>`,
      )
      .join("")}</div></section>`;
}

function ipoTerms(prefix, action, label, disabled = false) {
  return `<div class="market-ticket-grid market-ipo-terms">
    <label><span>${text("offerPercent")}</span><input id="market-${prefix}-ipo-percent" type="number" min="5" max="49" step="1" value="25"></label>
    <label><span>${text("ipoDiscount")}</span><input id="market-${prefix}-ipo-discount" type="number" min="0" max="25" step="1" value="8"></label>
  </div><button class="btn primary" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;
}

function ipoTab(s, market) {
  const betting = s.betting || {};
  const bettingIpo = market.ipos.betting;
  const clubIpo = market.ipos.club;
  const bettingListing = bettingIpo
    ? market.listings.find((listing) => listing.id === bettingIpo.listingId)
    : null;
  const clubListing = listingById(s, clubIpo?.listingId);
  return `<div class="market-columns market-ipo-columns">
    <section class="panel market-ipo-card">
      <div class="panel-head"><div><h3>🎟️ ${text("bettingIpo")}</h3><p class="muted">${betting.owned ? localized(betting.name) : text("bettingNotEligible")}</p></div>${badge(bettingIpo ? text("listed") : text("privateClub"), bettingIpo ? "gold" : "")}</div>
      <div class="market-quote-grid">
        <div><small>${text("marketCap")}</small><strong>${money(bettingListing?.marketCap || betting.marketValue || bettingIpo?.valuation || 0)}</strong></div>
        <div><small>${text("founderStake")}</small><strong>${num(betting.founderOwnershipPct ?? 100)}%</strong></div>
        <div><small>${text("ipoProceeds")}</small><strong>${money(betting.ipoProceeds || bettingIpo?.proceeds || 0)}</strong></div>
      </div>
      ${
        bettingIpo
          ? `<div class="market-ticket-grid"><label><span>${text("offerPercent")}</span><input id="market-betting-secondary-percent" type="number" min="1" max="25" step="1" value="10"></label></div><button class="btn secondary" data-action="market-betting-secondary">${text("secondaryOffering")}</button>`
          : ipoTerms(
              "betting",
              "market-betting-ipo",
              text("ipo"),
              !betting.owned || betting.licenseStatus !== "active",
            )
      }
    </section>
    <section class="panel market-ipo-card">
      <div class="panel-head"><div><h3>🏟️ ${text("clubIpo")}</h3><p class="muted">${text("fanShareholders")}</p></div>${badge(clubIpo ? text("listed") : text("privateClub"), clubIpo ? "gold" : "")}</div>
      <div class="market-quote-grid">
        <div><small>${text("marketCap")}</small><strong>${money(clubListing?.marketCap || 0)}</strong></div>
        <div><small>${text("fanShareholders")}</small><strong>${num(clubIpo?.fanOwnershipPct || 0)}%</strong></div>
        <div><small>${text("quarterlyPressure")}</small><strong class="${(clubIpo?.pressure || 0) >= 60 ? "red" : "green"}">${num(clubIpo?.pressure || 0)}%</strong></div>
      </div>
      ${
        clubIpo
          ? `<p class="market-engine-note">${text("nextQuarterReview")}: ${esc(clubIpo.nextReview)}</p>`
          : ipoTerms("club", "market-club-ipo", text("ipo"))
      }
    </section>
  </div>
  <section class="panel market-cycle-card">
    <div class="panel-head"><div><h3>${text("cycles")}</h3><p class="muted">${text("priceEngine")}</p></div>${badge(cycleLabel(market.cycle.phase), market.cycle.phase === "crash" ? "danger" : "gold")}</div>
    <div class="market-risk-strip"><div><small>${text("cycles")}</small><strong>${cycleLabel(market.cycle.phase)}</strong></div><div><small>${text("detectionRisk")}</small><strong>${num(market.cycle.intensity)}%</strong></div><div><small>${text("history")}</small><strong>${num(market.cycle.history.length)}</strong></div></div>
  </section>
  <section class="panel">
    <div class="panel-head"><div><h3>🏚️ ${text("distressedClubs")}</h3><p class="muted">${text("futureClubSale")}</p></div><span>${num(market.distressed.length)}</span></div>
    <div class="market-distressed-list">${
      market.distressed
        .map((candidate) => {
          const listing = listingById(s, candidate.listingId);
          return `<button type="button" class="market-operation" data-action="market-select" data-id="${esc(candidate.listingId)}"><span><b>${esc(localName(listing))}</b><small>${text("distressed")} · ${num(candidate.score)}%</small></span><span><small>${text("askingValue")}</small><b>${money(candidate.askingValue)}</b></span></button>`;
        })
        .join("") || `<p class="muted">${text("noHistory")}</p>`
    }</div>
  </section>`;
}

function eventsTab(market) {
  const pending = market.events.pending;
  const activeEvent = pending
    ? STOCK_MARKET_EVENT_BY_ID[pending.eventId]
    : null;
  return `<section class="panel market-event-stage ${activeEvent ? "is-pending" : ""}">
    <div class="panel-head"><div><h3>⚡ ${text("marketEvents")}</h3><p class="muted">${activeEvent ? text("pendingEvent") : `${num(STOCK_MARKET_EVENTS.length)} ${text("marketEvents")}`}</p></div>${activeEvent ? badge(text("pendingEvent"), "danger") : badge(cycleLabel(market.cycle.phase), "gold")}</div>
    ${
      activeEvent
        ? `<article class="market-event-card"><h2>${esc(localized(activeEvent.title))}</h2><p>${esc(localized(activeEvent.prompt))}</p><small>${text("publicDate")}: ${esc(pending.expiresOn)}</small><div class="market-event-choices">${activeEvent.choices.map((choice) => `<button class="btn ${choice.id === "ignore" || choice.id === "wait" ? "secondary" : "primary"}" data-action="market-event-choice" data-id="${esc(choice.id)}">${esc(localized(choice.label))}</button>`).join("")}</div></article>`
        : `<div class="empty-state"><p>${text("noHistory")}</p></div>`
    }
  </section>
  <section class="panel"><div class="panel-head"><h3>${text("history")}</h3><span>${num(market.events.history.length)}</span></div><div class="report-list">${market.events.history
    .slice(0, 20)
    .map((record) => {
      const item = STOCK_MARKET_EVENT_BY_ID[record.eventId];
      return `<div class="report-row"><b>${esc(record.resolvedOn || record.openedOn)}</b><span>${esc(localized(item?.title) || record.eventId)}</span><span>${record.status === "resolved" ? text("eventResolved") : text("eventExpired")}</span></div>`;
    })
    .join("")}</div></section>`;
}

export function stockMarketView(
  s,
  { tab = "overview", selectedId = null, query = "" } = {},
) {
  const market = ensureStockMarket(s);
  const clubs = market.listings.filter(
    (listing) => listing.assetType === "club",
  );
  const selected =
    listingById(s, selectedId) ||
    clubs.find((listing) => listing.clubId === s.clubId) ||
    clubs[0];
  const active = [
    "overview",
    "trading",
    "insider",
    "regulation",
    "ipos",
    "events",
  ].includes(tab)
    ? tab
    : "overview";
  return `<div class="stock-market-page">
    <div class="market-hero">
      <div><span class="market-live"><i></i> ${text("lastUpdate")} ${esc(market.lastUpdate)}</span><h2>📈 ${text("marketName")}</h2><p>${text("marketKicker")}</p></div>
      <div class="market-index-value"><small>${text("index")}</small><strong>${num(market.index.value)}</strong><span class="${market.index.change >= 0 ? "green" : "red"}">${market.index.change >= 0 ? "+" : ""}${num(market.index.change)}%</span></div>
    </div>
    <div class="market-tabs" role="tablist">
      <button class="market-tab ${active === "overview" ? "active" : ""}" data-action="market-tab" data-id="overview">${text("overview")}</button>
      <button class="market-tab ${active === "trading" ? "active" : ""}" data-action="market-tab" data-id="trading">${text("trading")}</button>
      <button class="market-tab ${active === "insider" ? "active" : ""}" data-action="market-tab" data-id="insider">${text("insider")}</button>
      <button class="market-tab ${active === "regulation" ? "active" : ""}" data-action="market-tab" data-id="regulation">${text("regulation")}</button>
      <button class="market-tab ${active === "ipos" ? "active" : ""}" data-action="market-tab" data-id="ipos">${text("ipos")}</button>
      <button class="market-tab ${active === "events" ? "active" : ""}" data-action="market-tab" data-id="events">${text("marketEvents")}</button>
    </div>
    ${
      active === "trading"
        ? tradingTab(s, market, selected)
        : active === "insider"
          ? insiderTab(s, market, selected)
          : active === "regulation"
            ? regulationTab(s, market)
            : active === "ipos"
              ? ipoTab(s, market)
              : active === "events"
                ? eventsTab(market)
                : overviewTab(s, market, selected, query)
    }
  </div>`;
}
