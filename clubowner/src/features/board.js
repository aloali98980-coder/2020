// شاشة «الجمعية العمومية» 0.26 — اللائحة كاملة مع تتبع حي لكل بند أثناء الموسم.
//
// كل النصوص تُبنى من سجل النصوص الوحيد (boardTextFor) بلغة الواجهة الحالية،
// وبلا أي حرف عربي مكتوب هنا مباشرة، فيبقى فحص التغطية صفرًا بلا استثناءات.
import { heading, badge, statCard, progress, infoNote, empty } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { getLanguage } from "../i18n/index.js";
import { boardTextFor } from "../data/boardTexts.js";
import { AXIS_TEXT_KEYS, CLUB_SIZES, ITEM_KINDS } from "../data/boardMandates.js";
import { activeMandate, evaluateMandate, transferFrozen } from "../services/boardMandate.js";
import { money, num, date } from "../ui/format.js";

const t = (key, vars) => boardTextFor(key, vars, getLanguage());
const CATEGORY_KEYS = {
  "league-rank": "rank",
  "continental-qualify": "rank",
  "deficit-cap": "money",
  "min-liquidity": "money",
  "player-sale": "money",
};
const amountOf = (unit, value) =>
  unit === "money" || CATEGORY_KEYS[unit] === "money" ? money(value) : num(value);
const itemLabel = (item) => {
  const textKey = item.textKey || ITEM_KINDS[item.kind]?.textKey;
  const unit = item.unit || ITEM_KINDS[item.kind]?.unit;
  const shown =
    unit === "money"
      ? money(item.target)
      : unit === "rank"
        ? num(item.target)
        : num(item.target);
  return t(textKey, { v: shown });
};
const statusChip = (item) =>
  item.done
    ? badge(t("boardItemMet"), "green")
    : item.ratio < 0.5
      ? badge(t("boardItemBehind"), "red")
      : badge(t("boardItemOpen"), "gold");
const effectLine = (effect) => {
  switch (effect.kind) {
    case "investors":
      return t("cRewardInvestors", { money: money(effect.amount) });
    case "budget":
      return t("cRewardBudget", { n: num(Math.round(effect.share * 100)) });
    case "fans":
      return t("cRewardFans", { n: num(effect.amount) });
    case "budget-cut":
      return t("cBudgetCut", { n: num(Math.round(effect.share * 100)) });
    case "freeze":
      return t("cFreeze", { d: date(effect.until) });
    case "sponsor-out":
      return t("cSponsorOut");
    case "protest":
      return t("cProtest", { n: num(Math.abs(effect.amount)) });
    default:
      return "";
  }
};
const voteChip = (status) =>
  status === "passed"
    ? badge(t("boardChipPassed"), "green")
    : status === "partial"
      ? badge(t("boardChipPartial"), "gold")
      : badge(t("boardChipFailed"), "red");

export function boardView(s) {
  const mandate = activeMandate(s);
  const evaluation = mandate ? evaluateMandate(s, mandate) : null;
  const frozen = transferFrozen(s);
  const b = s.board;
  const head = heading(
    t("boardKicker"),
    t("boardTitle"),
    t("boardIntro"),
    frozen
      ? `<span class="badge red">${icon("calendar", 14)} ${t("freezeBadge", { d: date(b.freezeUntil) })}</span>`
      : "",
  );
  if (!mandate || !evaluation)
    return `${head}${empty(t("boardNoMandate"), t("boardNoMandateBody"), "crown")}${historyView(s)}${infoNote(t("boardNoDismissal"))}`;

  const cards = `<div class="stats-grid">${statCard(
    t("boardConfidence"),
    num(Math.round(b.confidence)),
    " / " + num(100),
    `${t("boardLabelSize")}: ${t(CLUB_SIZES[mandate.size].textKey)}`,
    "crown",
    b.confidence >= 60 ? "green" : "gold",
  )}${statCard(
    t("boardProgress"),
    num(evaluation.done),
    ` / ${num(evaluation.total)}`,
    t("boardItemsDone", { n: num(evaluation.done), d: num(evaluation.total) }),
    "shield",
    evaluation.status === "passed" ? "green" : evaluation.status === "failed" ? "red" : "gold",
  )}${statCard(
    t("boardLabelSize"),
    t(CLUB_SIZES[mandate.size].textKey),
    "",
    t("boardLabelAmbition") + ": " + t(ambitionTextKey(mandate.ambition)),
    "stadium",
  )}${statCard(
    t("boardLabelAmbition"),
    voteChip(evaluation.status),
    "",
    `${t("boardMidDate", { d: textDate(mandate.midDate) })} · ${t("boardEndDate", { d: textDate(mandate.endDate) })}`,
    "calendar",
    "gold",
  )}</div>`;

  const axes = AXES_VIEW.map((axis) => {
    const group = evaluation.byAxis[axis];
    if (!group || !group.total) return "";
    return `<section class="panel board-axis"><div class="panel-head"><h3>${icon("shield")} ${t(AXIS_TEXT_KEYS[axis])}</h3><span class="badge outline">${num(group.done)} / ${num(group.total)}</span></div><div class="board-items">${group.items
      .map(
        (item) => `<div class="board-item ${item.done ? "done" : ""}">
          <div class="board-item-top"><strong>${itemLabel(item)}</strong><span class="board-item-chips">${
            item.critical ? badge(t("boardCritical"), "outline") : ""
          }${statusChip(item)}</span></div>
          ${progress(Math.round(item.ratio * 100))}
          <div class="board-item-meta"><small>${t("boardCurrent")}: ${amountOf(item.unit, item.current)}</small><small>${t("boardTargetShort")}: ${amountOf(item.unit, item.target)}</small></div>
        </div>`,
      )
      .join("")}</div></section>`;
  }).join("");

  return `${head}${cards}<div class="board-layout">${axes}</div>${meetingsView(s)}${historyView(s)}${infoNote(t("boardNoDismissal"))}`;
}

const AXES_VIEW = ["sporting", "financial", "development"];
const ambitionTextKey = (key) =>
  ({
    survival: "boardAmbitionSurvival",
    stable: "boardAmbitionStable",
    ambitious: "boardAmbitionAmbitious",
    elite: "boardAmbitionElite",
    rebuild: "boardAmbitionRebuild",
  })[key] || "boardAmbitionStable";
const textDate = (value) => date(value);

function meetingsView(s) {
  const list = (s.board?.meetings || []).slice(-6).reverse();
  if (!list.length) return "";
  return `<section class="panel board-meetings"><div class="panel-head"><h3>${icon("inbox")} ${t("boardMeetings")}</h3></div><div class="desk-list">${list
    .map((m) => {
      const label =
        m.kind === "mid"
          ? m.status === "trust"
            ? t("boardChipTrust")
            : t("boardChipWarning")
          : voteChip(m.status);
      return `<div class="desk-item static"><span class="desk-icon ${
        m.status === "failed" || m.status === "warning" ? "gold" : ""
      }">${icon(m.kind === "mid" ? "flag" : "crown", 19)}</span><div><strong>${m.kind === "mid" ? t("midMeetingTag") : t("endMeetingTag")}</strong><span>${t("boardSeason", { n: num(m.season) })}</span></div><span class="desk-meta">${label}<small>${t("boardItemsDone", { n: num(m.done), d: num(m.total) })}</small></span></div>`;
    })
    .join("")}</div></section>`;
}

function historyView(s) {
  const history = [...(s.board?.history || [])].reverse();
  return `<section class="panel board-history"><div class="panel-head"><h3>${icon("chart")} ${t("boardHistory")}</h3></div>${
    history.length
      ? `<div class="board-history-rows">${history
          .map(
            (h) => `<div class="board-history-row"><div><strong>${t("boardSeason", { n: num(h.season) })}</strong><small>${t("boardItemsDone", { n: num(h.done), d: num(h.total) })}${h.tier ? ` · ${t("boardWarningStreak", { n: num(h.tier) })}` : ""}</small></div><span class="board-history-effects">${
              h.effects?.length
                ? h.effects.map(effectLine).filter(Boolean).join(" · ")
                : t("boardEffectNone")
            }</span>${voteChip(h.status)}</div>`,
          )
          .join("")}</div>`
      : `<p class="muted">${t("boardHistoryEmpty")}</p>`
  }</section>`;
}

// بطاقة مختصرة للوحة المالك: التقدم الحالي وزر الشاشة الكاملة.
export function boardCardView(s) {
  const mandate = activeMandate(s);
  if (!mandate) return "";
  const e = evaluateMandate(s, mandate);
  if (!e) return "";
  const top = [...e.items]
    .sort((a, b) => Number(a.done) - Number(b.done) || a.ratio - b.ratio)
    .slice(0, 3);
  return `<section class="panel board-card"><div class="panel-head"><h3>${icon("crown")} ${t("boardCardTitle")}</h3><span class="onboarding-progress">${num(e.done)} / ${num(e.total)}</span></div><div class="onboarding-progress-track"><i style="width:${Math.round((e.done / Math.max(1, e.total)) * 100)}%"></i></div><div class="onboarding-steps">${top
    .map(
      (item) => `<div class="onboarding-step ${item.done ? "done" : ""}"><span class="onboarding-check">${item.done ? icon("check", 16) : num(Math.round(item.ratio * 100)) + "٪"}</span><div><strong>${itemLabel(item)}</strong><small>${t("boardCurrent")}: ${amountOf(item.unit, item.current)} · ${t("boardTargetShort")}: ${amountOf(item.unit, item.target)}</small></div></div>`,
    )
    .join("")}</div><button class="btn secondary full" data-nav="board">${t("boardCardOpen")} ${icon("arrow", 16)}</button></section>`;
}
