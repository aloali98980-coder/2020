// واجهة «الملفات السوداء» 0.28 — لوحة الوسيط ومؤشر الشبهات
import { heading, badge, statCard, progress, infoNote, button } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { getLanguage } from "../i18n/index.js";
import { blackTextFor } from "../data/blackTexts.js";
import { money, num, date } from "../ui/format.js";
import { OPERATIONS } from "../services/blackFiles.js";

const t = (key, vars) => blackTextFor(key, vars, getLanguage());

const suspicionLabel = (v) => {
  if (v >= 100) return t("suspicionLevel100");
  if (v >= 85) return t("suspicionLevel85");
  if (v >= 60) return t("suspicionLevel60");
  if (v >= 30) return t("suspicionLevel30");
  return t("suspicionLevel0");
};

export function blackFilesView(s) {
  const bf = s.blackFiles;
  if (!bf) return `<section class="panel"><h3>${t("blackTitle")}</h3><p class="muted">لا توجد ملفات سوداء بعد.</p></section>`;
  const suspicion = Math.round(bf.suspicion * 10) / 10;
  const color = suspicion >= 85 ? "red" : suspicion >= 60 ? "gold" : suspicion >= 30 ? "gold" : "green";
  const head = heading(
    t("blackKicker"),
    t("blackTitle"),
    t("blackIntro"),
    `<span class="badge ${color}">${t("suspicionLabel")}: ${num(suspicion)}% — ${suspicionLabel(suspicion)}</span>`,
  );

  const stats = `<div class="stats-grid">${statCard(
    t("suspicionLabel"),
    num(suspicion),
    "%",
    suspicionLabel(suspicion),
    "shield",
    color,
  )}${statCard(
    t("blackName"),
    num(bf.scandalCount),
    ` ${t("suspicionLevel100")}`,
    bf.transferBanUntil ? `${t("opTransferBanned", { d: date(bf.transferBanUntil) })}` : t("suspicionLevel0"),
    "crown",
    bf.scandalCount ? "red" : "green",
  )}${statCard(
    "عقوبة سمعة دائمة",
    num(bf.permanentRepPenalty),
    "",
    `سمعة: ${num(s.reputation)}`,
    "chart",
    bf.permanentRepPenalty ? "red" : "green",
  )}</div><div style="margin:12px 0">${progress(Math.round(suspicion))}</div>`;

  const active = [];
  if (bf.active.refereeBias) active.push(`<div class="effect-card"><h4>${t("opRefereeBias")}</h4><p>${t("opRefereeActive", { d: date(bf.active.refereeBias.until) })} — ${bf.active.refereeBias.type}</p></div>`);
  if (bf.active.bribedOpponent) active.push(`<div class="effect-card"><h4>${t("opBribeOpponent")}</h4><p>${t("opBribeActive", { v: bf.active.bribedOpponent.opponent, d: date(bf.active.bribedOpponent.until) })}</p></div>`);
  if (bf.active.mediaWar) active.push(`<div class="effect-card"><h4>${t("opMediaWar")}</h4><p>${bf.active.mediaWar.rival} — حتى ${date(bf.active.mediaWar.until)}</p></div>`);
  if (bf.active.agentOnPayroll) active.push(`<div class="effect-card"><h4>${t("opAgentPayroll")}</h4><p>${t("opAgentActive")} — منذ ${date(bf.active.agentSince)}</p></div>`);

  const ops = Object.values(OPERATIONS).map((op) => {
    const cooldown = bf.cooldowns[op.id];
    const busy = cooldown && cooldown >= s.date;
    const ban = bf.transferBanUntil && bf.transferBanUntil >= s.date && ["poach-player", "bribe-opponent"].includes(op.id);
    return `<section class="panel"><div class="panel-head"><h3>${t(op.textKey)}</h3>${badge(`${money(op.cost)}`, "outline")}</div><p class="muted">${t(op.descKey)}</p><div class="board-items"><small>${t("opCost", { money: money(op.cost) })} · ${t("opHeat", { n: op.heat })} · ${t("opFailChance", { n: Math.round(op.failChance * 100) })} · ${t("opCooldown", { n: op.cooldown })}</small></div>${busy ? `<p class="muted">${t("opCooldownActive", { d: date(cooldown) })}</p>` : ""}${ban ? `<p class="muted red">${t("opTransferBanned", { d: date(bf.transferBanUntil) })}</p>` : ""}<div class="modal-actions"><button class="btn primary small" data-action="black-op" data-id="${op.id}" ${busy || ban || s.finance.cash < op.cost ? "disabled" : ""}>${t(op.textKey)} ${icon("arrow", 14)}</button></div></section>`;
  }).join("");

  const reduction = `<section class="panel"><h3>${t("charityDonation")}</h3><p class="muted">${t("charityDonationDesc")}</p><form id="black-charity"><label class="field"><span>مبلغ التبرع</span><input type="number" name="amount" min="100000" max="20000000" step="100000" value="2000000"></label><button class="btn secondary small" type="submit">${t("charityDonation")}</button></form></section><section class="panel"><h3>${t("cutMiddlemen")}</h3><p class="muted">${t("cutMiddlemenDesc")}</p><button class="btn secondary small" data-action="black-cut">${t("cutMiddlemen")}</button></section>`;

  return `${head}${stats}${active.length ? `<div class="expansion-grid">${active.join("")}</div>` : ""}<div class="expansion-grid">${ops}</div>${reduction}${infoNote(t("blackIntro"))}`;
}

export function blackCardView(s) {
  const bf = s.blackFiles;
  if (!bf) return "";
  const suspicion = Math.round(bf.suspicion);
  const color = suspicion >= 60 ? "red" : suspicion >= 30 ? "gold" : "green";
  return `<section class="panel board-card"><div class="panel-head"><h3>${icon("shield")} ${t("blackCardTitle")}</h3><span class="badge ${color}">${num(suspicion)}%</span></div><div class="onboarding-progress-track"><i style="width:${suspicion}%"></i></div><p class="muted">${suspicionLabel(suspicion)} — ${bf.scandalCount ? `${num(bf.scandalCount)} فضيحة` : t("suspicionLevel0")}</p><button class="btn secondary full" data-nav="black">${t("blackCardOpen")} ${icon("arrow", 16)}</button></section>`;
}
