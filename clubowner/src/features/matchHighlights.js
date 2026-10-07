// شاشة لقطات الماتش 0.24 — عرض متسلسل للأحداث بعد صافرة النهاية.
// حتمية: تُولَّد من buildMatchReport (نفس البذرة = نفس اللقطات دائمًا).
// متسقة: نفس المصدر المستخدم في تقرير الماتش الكامل.
// mobile-first + هوية اللعبة (كحلي + ذهبي).
import { icon } from "../components/icons.js";
import { crest, clubBy } from "../components/shared.js";
import { esc, num, shortDate } from "../ui/format.js";
import { translateDOM, tr } from "../i18n/index.js";

const pName = (s, id) => {
  const p = s.players.find((x) => x.id === id);
  if (!p) return "";
  return tr(p.name, p.nameLatin || p.name, p.nameLatin || p.name);
};

function eventIcon(type) {
  if (type === "goal") return `<span class="hl-icon-goal">⚽</span>`;
  if (type === "yellow") return `<span class="hl-icon-yellow">🟨</span>`;
  if (type === "red") return `<span class="hl-icon-red">🟥</span>`;
  if (type === "sub") return `<span class="hl-icon-sub">🔄</span>`;
  return "";
}

function hlCard(s, e) {
  const our = e.clubId === s.clubId;
  const side = our ? "our" : "opp";
  if (e.type === "goal") {
    const scorer = pName(s, e.playerId) || (our ? tr("ناديك", "Your club", "Votre club") : tr("المنافس", "Opponent", "Adversaire"));
    const assist = e.assistId ? pName(s, e.assistId) : "";
    const oppClub = !our ? clubBy(e.clubId)?.name : "";
    return `<div class="hl-card hl-goal ${side}">
      <span class="hl-min">${num(e.min)}′</span>
      <span class="hl-icon">${eventIcon("goal")}</span>
      <span class="hl-body">
        <strong>${esc(scorer)}</strong>
        ${assist ? `<small>${tr("أسيست", "Assist", "Passe")} ${esc(assist)}</small>` : ""}
        ${oppClub ? `<small>${esc(oppClub)}</small>` : ""}
      </span>
    </div>`;
  }
  if (e.type === "yellow" || e.type === "red") {
    return `<div class="hl-card hl-card-${e.type} ${side}">
      <span class="hl-min">${num(e.min)}′</span>
      <span class="hl-icon">${eventIcon(e.type)}</span>
      <span class="hl-body"><strong>${esc(pName(s, e.playerId))}</strong></span>
    </div>`;
  }
  if (e.type === "sub") {
    return `<div class="hl-card hl-sub ${side}">
      <span class="hl-min">${num(e.min)}′</span>
      <span class="hl-icon">${eventIcon("sub")}</span>
      <span class="hl-body"><small>${tr("تبديل", "Sub", "Rempl.")}</small> <strong>${esc(pName(s, e.playerId))}</strong> <small>↗ ${esc(pName(s, e.out))}</small></span>
    </div>`;
  }
  return "";
}

function kickoffCard(s, r) {
  const home = r.home === s.clubId;
  return `<div class="hl-card hl-kickoff">
    <div class="hl-teams">
      <span class="hl-team">${crest(r.home, "small")} <b>${esc(clubBy(r.home)?.name || "")}</b></span>
      <span class="hl-vs">VS</span>
      <span class="hl-team">${crest(r.away, "small")} <b>${esc(clubBy(r.away)?.name || "")}</b></span>
    </div>
    <small class="hl-meta">${icon("calendar", 14)} ${shortDate(r.date)} · ${r.neutral ? tr("ملعب محايد", "Neutral", "Neutre") : home ? tr("بيتك", "Home", "Dom.") : tr("خارج الأرض", "Away", "Ext.")}</small>
  </div>`;
}

function htCard() {
  return `<div class="hl-card hl-halftime">
    <span class="hl-ht-label">⏱ ${tr("استراحة الشوطين", "Half-time", "Mi-temps")}</span>
  </div>`;
}

function resultCard(s, r) {
  const home = r.home === s.clubId;
  const ours = home ? r.homeGoals : r.awayGoals;
  const theirs = home ? r.awayGoals : r.homeGoals;
  const label = ours > theirs ? tr("فوز", "Win", "Victoire") : ours === theirs ? tr("تعادل", "Draw", "Nul") : tr("خسارة", "Defeat", "Défaite");
  const tone = ours > theirs ? "hl-win" : ours === theirs ? "hl-draw" : "hl-loss";
  return `<div class="hl-card hl-result ${tone}">
    <div class="hl-final-score">${num(r.homeGoals)} – ${num(r.awayGoals)}</div>
    <div class="hl-final-label">${label}</div>
  </div>`;
}

/**
 * بناء بيانات اللقطات من تقرير الماتش — حتمية ومتسقة.
 * @returns {{ steps: string[], htIdx: number }}
 */
export function buildHighlightsData(s, r) {
  const events = (r.events || []).filter((e) => e.clubId === s.clubId || e.type === "goal");
  const first = events.filter((e) => e.min <= 45);
  const second = events.filter((e) => e.min > 45);
  const steps = [kickoffCard(s, r)];
  for (const e of first) steps.push(hlCard(s, e));
  const htIdx = steps.length;
  steps.push(htCard());
  for (const e of second) steps.push(hlCard(s, e));
  steps.push(resultCard(s, r));
  return { steps, htIdx };
}

/**
 * عرض شاشة اللقطات المتسلسلة داخل modal-root.
 * @param {object} s — حالة اللعبة
 * @param {object} r — تقرير الماتش
 * @param {function} onDone — callback عند الانتهاء
 */
export function showHighlightsScreen(s, r, onDone) {
  const { steps, htIdx } = buildHighlightsData(s, r);
  const root = document.getElementById("modal-root");
  let current = 0; // index of the last visible step
  let showingHT = false;

  function render() {
    // Build visible HTML
    let html = "";
    for (let i = 0; i <= current && i < steps.length; i++) {
      const isNew = i === current && i > 0;
      html += isNew ? steps[i].replace('class="hl-card ', 'class="hl-card hl-enter ') : steps[i];
    }

    // Is this the halftime card?
    const isHT = showingHT && current === htIdx;
    // Is this the final card?
    const isFinal = current >= steps.length - 1;

    const nextText = isHT
      ? tr("الشوط الثاني ▶", "Second half ▶", "2e mi-temps ▶")
      : isFinal
        ? tr("عرض التقرير الكامل", "Full report", "Rapport complet")
        : tr("التالي ▶", "Next ▶", "Suivant ▶");

    root.innerHTML = `<div class="modal-backdrop hl-backdrop">
      <section role="dialog" aria-label="${tr("لقطات الماتش", "Match highlights", "Moments du match")}" class="modal hl-modal" tabindex="-1">
        <button class="hl-skip" data-action="hl-skip">${icon("fast-forward", 16)} ${tr("تخطي للنتيجة", "Skip to result", "Passer au résultat")}</button>
        <div class="hl-content">${html}</div>
        <div class="hl-bar">
          <div class="hl-progress"><span style="width:${Math.round((current / (steps.length - 1)) * 100)}%"></span></div>
          <button class="btn primary hl-next" data-action="hl-next">${nextText}</button>
        </div>
      </section>
    </div>`;
    translateDOM(root);
  }

  function next() {
    if (current < steps.length - 1) {
      current++;
      showingHT = current === htIdx;
      render();
    } else {
      finish();
    }
  }

  function finish() {
    root.innerHTML = "";
    root.removeEventListener("click", handler);
    onDone();
  }

  function handler(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    if (el.dataset.action === "hl-next") next();
    if (el.dataset.action === "hl-skip") finish();
  }

  root.addEventListener("click", handler);
  render();
}
