import { getLanguage, translateDOM, tr } from "../i18n/index.js";
import { esc, num, money, cur, date } from "../ui/format.js";
import { heading, badge, button, empty } from "../components/shared.js";
import { icon } from "../components/icons.js";
import {
  AWARD_DEFS,
  SCORER_SCOPES,
  AWARDS_COPY,
} from "../data/awardsTexts.js";
import {
  pendingCeremony,
  campaignFanVote,
} from "../services/awards.js";

const local = (copy) => copy?.[getLanguage()] || copy?.en || copy?.ar || "";
const personName = (rec) =>
  getLanguage() === "ar" ? rec.name : rec.nameLatin || rec.name;

function awardName(id) {
  return local(AWARD_DEFS[id]?.name) || id;
}

function winnerChip(rec, extra = "") {
  if (!rec) return `<span class="award-vacant">${local(AWARDS_COPY.noCandidate)}</span>`;
  return `<span class="award-chip ${rec.own ? "own-chip" : ""}">
    <strong data-no-translate>${esc(personName(rec))}</strong>
    <small data-no-translate>${esc(rec.clubName || "")}</small>
    ${rec.own ? `<em>${local(AWARDS_COPY.ownPlayer)}</em>` : ""}
    ${extra ? `<i>${esc(extra)}</i>` : ""}
  </span>`;
}

// ————— صفحة الجوائز وقاعة المشاهير —————
function ceremonyPanel(s) {
  const pending = pendingCeremony(s);
  const last = s.awards.hall[0];
  const steps = pending?.steps || (last ? null : []);
  void steps;
  return `<section class="panel awards-ceremony-panel">
    <div class="panel-head">
      <h3>🏆 ${local(AWARDS_COPY.seasonCeremony)}</h3>
      ${
        pending
          ? button(local(AWARDS_COPY.ceremonyOpen), "view-ceremony", "", "primary")
          : last
            ? button(local(AWARDS_COPY.ceremonyRepeat), "view-ceremony", "", "soft")
            : ""
      }
    </div>
    <p class="muted">${local(AWARDS_COPY.ceremonyIntro)}</p>
    ${
      pending
        ? `<div class="award-banner">${icon("crown", 20)} ${local(AWARDS_COPY.ceremonyPending)}</div>`
        : last
          ? `<div class="award-mini-grid">${Object.entries(last.awards || {})
              .filter(([id]) => id !== "top-scorer-competition" && id !== "team-of-season")
              .slice(0, 6)
              .map(
                ([id, rec]) =>
                  `<div class="award-mini"><span>${esc(awardName(id))}</span>${winnerChip(rec)}</div>`,
              )
              .join("")}</div>`
          : empty(local(AWARDS_COPY.seasonCeremony), local(AWARDS_COPY.ceremonyIntro))
    }
  </section>`;
}

function fanVotePanel(s) {
  const vote = s.awards.fanVote;
  if (!vote)
    return `<section class="panel">
      <div class="panel-head"><h3>🗳️ ${local(AWARDS_COPY.voteTitle)}</h3></div>
      ${empty(local(AWARDS_COPY.voteClosed), local(AWARDS_COPY.voteHint))}
    </section>`;
  const max = Math.max(1, ...vote.candidates.map((c) => c.votes || c.base));
  return `<section class="panel fan-vote-panel">
    <div class="panel-head">
      <h3>🗳️ ${local(AWARDS_COPY.voteTitle)}</h3>
      ${badge(
        vote.closed ? local(AWARDS_COPY.voteClosed) : local(AWARDS_COPY.voteOpen),
        vote.closed ? "soft" : "gold",
      )}
    </div>
    <p class="muted">${local(AWARDS_COPY.voteHint)}</p>
    <div class="fan-vote-list">
      ${vote.candidates
        .map((c) => {
          const value = c.votes ?? c.base;
          return `<div class="fan-vote-row ${c.own ? "own-chip" : ""}">
            <div class="fan-vote-info">
              <strong data-no-translate>${esc(personName(c))}</strong>
              <small data-no-translate>${esc(c.clubName || "")}</small>
            </div>
            <div class="fan-vote-bar"><i style="width:${Math.round((value / max) * 100)}%"></i></div>
            <b>${num(value)}</b>
          </div>`;
        })
        .join("")}
    </div>
    ${
      !vote.closed
        ? `<div class="fan-vote-actions">
            <span class="muted">${local(AWARDS_COPY.campaignCost)}: <b>${money(vote.campaignCost)} ${cur()}</b></span>
            ${
              vote.campaigned
                ? badge(local(AWARDS_COPY.campaignd), "green")
                : button(local(AWARDS_COPY.campaign), "fan-campaign", "", "primary")
            }
          </div>`
        : ""
    }
  </section>`;
}

function monthlyPanel(s) {
  const rows = (s.awards.monthly || []).slice(0, 6);
  return `<section class="panel">
    <div class="panel-head"><h3>📅 ${local(AWARDS_COPY.monthlyTitle)}</h3></div>
    ${
      rows.length
        ? `<div class="monthly-strip">${rows
            .map(
              (m) => `<div class="monthly-card">
                <span class="monthly-tag">${local(AWARDS_COPY.monthOf)} <b data-no-translate>${esc(m.month)}</b></span>
                <div><em>⚽</em>${winnerChip(m.player)}</div>
                <div><em>🧑‍🏫</em>${winnerChip(m.coach)}</div>
              </div>`,
            )
            .join("")}</div>`
        : empty(local(AWARDS_COPY.monthlyTitle), local(AWARDS_COPY.monthlyNone))
    }
  </section>`;
}

function hallPanel(s) {
  const hall = s.awards.hall || [];
  return `<section class="panel hall-panel">
    <div class="panel-head"><h3>🏛️ ${local(AWARDS_COPY.hallTitle)}</h3></div>
    <p class="muted">${local(AWARDS_COPY.hallHint)}</p>
    ${
      hall.length
        ? hall
            .map(
              (entry) => `<article class="hall-season">
                <header><strong>${local(AWARDS_COPY.seasonOf)} ${num(entry.season)}</strong><small>${date(entry.date)}</small></header>
                <div class="hall-grid">
                  ${Object.entries(entry.awards || {})
                    .map(([id, value]) => {
                      if (id === "team-of-season" && Array.isArray(value))
                        return `<div class="hall-cell hall-team"><span>${esc(awardName(id))}</span><p>${value
                          .map((r) => `<b data-no-translate>${esc(personName(r))}</b>`)
                          .join(" · ")}</p></div>`;
                      if (id === "top-scorer-competition" && Array.isArray(value))
                        return value
                          .map(
                            (r) =>
                              `<div class="hall-cell"><span>${esc(local(r.scopeName) || awardName(id))}</span>${winnerChip(r, `${num(r.goals)} ${local(AWARDS_COPY.winner)}`)}</div>`,
                          )
                          .join("");
                      return `<div class="hall-cell"><span>${esc(awardName(id))}</span>${winnerChip(value)}</div>`;
                    })
                    .join("")}
                </div>
              </article>`,
            )
            .join("")
        : empty(local(AWARDS_COPY.hallTitle), local(AWARDS_COPY.hallHint))
    }
  </section>`;
}

export function awardsView(s) {
  if (!s.awards)
    return empty(
      tr("الجوائز", "Awards", "Prix"),
      tr("ابدأ موسمًا لتوزيع الجوائز.", "Start a season to award prizes.", "Lancez une saison pour décerner les prix."),
    );
  return `${heading(
    local(AWARDS_COPY.ceremonyKicker),
    local(AWARDS_COPY.seasonCeremony),
    local(AWARDS_COPY.hallHint),
  )}${ceremonyPanel(s)}${fanVotePanel(s)}${monthlyPanel(s)}${hallPanel(s)}`;
}

// بطاقة مختصرة على مكتب المالك.
export function awardsCardView(s) {
  if (!s.awards) return "";
  const pending = pendingCeremony(s);
  const best = s.awards.hall[0]?.awards?.["best-player"];
  return `<section class="panel awards-mini-card" data-nav="awards" role="button" tabindex="0" style="cursor:pointer">
    <div class="panel-head"><h3>🏆 ${local(AWARDS_COPY.seasonCeremony)}</h3><button class="text-button" data-nav="awards">${local(AWARDS_COPY.hallTitle)} ${icon("arrow", 14)}</button></div>
    ${
      pending
        ? `<p class="muted">${local(AWARDS_COPY.ceremonyPending)}</p>`
        : best
          ? `<p class="muted">${local(AWARDS_COPY.winner)}: <strong data-no-translate>${esc(personName(best))}</strong></p>`
          : `<p class="muted">${local(AWARDS_COPY.hallHint)}</p>`
    }
  </section>`;
}

// ————— مشهد الحفل —————
function stageSvg(step) {
  const isTeam = step.awardId === "team-of-season";
  return `<svg class="awards-stage" viewBox="0 0 1000 360" role="img" aria-label="${esc(local(AWARDS_COPY.ceremonyKicker))}">
    <defs>
      <linearGradient id="aw-stage-sky" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#121b36"/><stop offset="1" stop-color="#2a2150"/>
      </linearGradient>
      <linearGradient id="aw-spot" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1000" height="360" rx="20" fill="url(#aw-stage-sky)"/>
    <path class="aw-curtain" d="M0 0h150v360H0zM850 0h150v360H850z"/>
    <path d="M330 0 L250 360 L750 360 L670 0 Z" fill="url(#aw-spot)"/>
    <g class="aw-confetti">
      ${[120, 220, 320, 420, 520, 620, 720, 820]
        .map(
          (x, i) =>
            `<rect x="${x}" y="${40 + (i % 3) * 30}" width="10" height="16" rx="3" style="--d:${i * 0.35}s"/>`,
        )
        .join("")}
    </g>
    <g class="aw-trophy" transform="translate(500 128)">
      <path d="M-34-40h68v18c0 30-14 46-34 49-20-3-34-19-34-49z"/>
      <path d="M-34-31h-16v12c0 16 10 22 22 23M34-31h16v12c0 16-10 22-22 23"/>
      <path d="M-8 28h16v18h-16zM-22 48h44v10h-44z"/>
    </g>
    <g class="aw-podium">
      <rect x="360" y="240" width="280" height="90" rx="10"/>
      <rect x="330" y="270" width="90" height="60" rx="8" class="aw-step2"/>
      <rect x="580" y="285" width="90" height="45" rx="8" class="aw-step3"/>
      ${isTeam ? `<text x="500" y="205" text-anchor="middle" class="aw-stage-mark">XI</text>` : `<text x="500" y="205" text-anchor="middle" class="aw-stage-mark">★</text>`}
    </g>
  </svg>`;
}

function stepMarkup(step) {
  const def = AWARD_DEFS[step.awardId];
  const value = step.value;
  if (step.awardId === "team-of-season" && Array.isArray(value))
    return `<div class="award-team-grid">${value
      .map(
        (r) =>
          `<div class="award-team-card ${r.own ? "own-chip" : ""}"><b data-no-translate>${esc(personName(r))}</b><small data-no-translate>${esc(r.clubName || "")}</small><em>${esc(r.slot.toUpperCase())}</em></div>`,
      )
      .join("")}</div>`;
  if (step.awardId === "top-scorer-competition" && Array.isArray(value))
    return `<div class="award-scorers">${value
      .map(
        (r) =>
          `<div class="award-scorer-row"><span>${esc(local(r.scopeName) || local(SCORER_SCOPES[r.scope] || {}))}</span>${winnerChip(r, `${num(r.goals)} ⚽`)}</div>`,
      )
      .join("")}</div>`;
  return winnerChip(value);
}

export function awardCeremonyOverlay(save, ceremony, index = 0) {
  const steps = ceremony.steps || [];
  const step = steps[index];
  const isLast = index >= steps.length - 1;
  if (!step)
    return `<div class="modal-backdrop celebration-backdrop">
      <section class="awards-ceremony" role="dialog" aria-modal="true" tabindex="-1">
        <header><span class="eyebrow">${esc(local(AWARDS_COPY.ceremonyKicker))}</span><h2>${esc(local(AWARDS_COPY.seasonCeremony))}</h2></header>
        ${stageSvg({ awardId: "team-of-season" })}
        <p class="awards-ceremony-intro">${esc(local(AWARDS_COPY.ceremonyIntro))}</p>
        <footer><button type="button" class="btn primary" data-action="ceremony-close">${esc(local(AWARDS_COPY.ceremonyClose))}</button></footer>
      </section>
    </div>`;
  const def = AWARD_DEFS[step.awardId];
  return `<div class="modal-backdrop celebration-backdrop">
    <section class="awards-ceremony" role="dialog" aria-modal="true" aria-label="${esc(
      `${local(AWARDS_COPY.seasonOf)} ${ceremony.season} — ${awardName(step.awardId)}`,
    )}" tabindex="-1">
      <header>
        <span class="eyebrow">${esc(local(def?.kicker || AWARDS_COPY.ceremonyKicker))}</span>
        <h2>${esc(awardName(step.awardId))}</h2>
        <p>${esc(local(AWARDS_COPY.seasonOf))} ${num(ceremony.season)} · ${esc(date(ceremony.date))}</p>
      </header>
      ${stageSvg(step)}
      <div class="awards-step-body">
        <span class="awards-winner-label">${esc(local(AWARDS_COPY.winners))}</span>
        ${stepMarkup(step)}
      </div>
      <footer>
        <span class="awards-progress">${num(index + 1)} / ${num(steps.length)}</span>
        <button type="button" class="btn primary" data-action="ceremony-next">
          ${esc(isLast ? local(AWARDS_COPY.ceremonyClose) : local(AWARDS_COPY.ceremonyNext))}
        </button>
      </footer>
    </section>
  </div>`;
}

export function showAwardCeremony(save, ceremony, onDone = () => {}) {
  const root = document.getElementById("modal-root");
  if (!root) return onDone();
  let index = 0;
  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    root.innerHTML = "";
    root.removeEventListener("click", handler);
    document.body.classList.remove("modal-open");
    onDone();
  };
  const advance = () => {
    const steps = ceremony.steps || [];
    if (index >= steps.length - 1) return finish();
    index++;
    root.innerHTML = awardCeremonyOverlay(save, ceremony, index);
    translateDOM(root);
    root.querySelector(".awards-ceremony")?.focus();
  };
  const handler = (event) => {
    const action = event.target.closest("[data-action]");
    if (!action && !event.target.classList.contains("celebration-backdrop")) return;
    if (!action || ["ceremony-next", "ceremony-close"].includes(action.dataset.action)) {
      event.preventDefault();
      event.stopPropagation();
      if (action?.dataset.action === "ceremony-close") finish();
      else advance();
    }
  };
  root.innerHTML = awardCeremonyOverlay(save, ceremony, ceremony.steps?.length ? 0 : -1);
  root.addEventListener("click", handler);
  document.body.classList.add("modal-open");
  translateDOM(root);
  root.querySelector(".awards-ceremony")?.focus();
}

// إغلاق الحفل من خلال زر الانتهاء عند عدم وجود خطوات.
export function ceremonyDoneAction() {
  return tr("إغلاق الحفل", "Close the ceremony", "Fermer la cérémonie");
}

// أزرار طلبات العقود داخل البريد (تُستدعى من features/inbox.js).
export function awardDemandActions(m) {
  return (
    button(local(AWARDS_COPY.demandRaise), "award-demand-raise", m.id, "primary") +
    button(local(AWARDS_COPY.demandImprove), "award-demand-improve", m.id, "soft") +
    button(local(AWARDS_COPY.demandRefuse), "award-demand-refuse", m.id, "ghost")
  );
}

export function coachDemandActions(m) {
  return (
    button(local(AWARDS_COPY.coachDemandRaise), "coach-demand-raise", m.id, "primary") +
    button(local(AWARDS_COPY.coachDemandRefuse), "coach-demand-refuse", m.id, "ghost")
  );
}

export { campaignFanVote };
