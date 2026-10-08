// واجهة مراسم قرعة الكأس 0.27 — لحظة ترقب ومواجهات مكشوفة
import { icon } from "../components/icons.js";
import { crest, clubBy } from "../components/shared.js";
import { esc, num } from "../ui/format.js";
import { tr } from "../i18n/index.js";

/**
 * نافذة مراسم قرعة الكأس (Modal)
 * @param {object} s - كائن الحالة
 * @param {object} draw - كائن القرعة
 */
export function cupDrawModal(s, draw) {
  if (!draw) return `<div class="empty-state"><p>${tr("لا توجد بيانات قرعة متاحة.", "No draw data available.", "Aucune donnée de tirage disponible.")}</p></div>`;

  const pairs = draw.pairs || [];
  const byes = draw.byes || [];

  return `<div class="cup-draw-modal">
    <header class="cup-draw-header">
      <div class="cup-draw-trophy">${icon("trophy", 32)}</div>
      <div>
        <span class="eyebrow">${tr("مراسم القرعة الرسمية", "Official Draw Ceremony", "Cérémonie officielle du tirage")}</span>
        <h2>${esc(draw.cupName)}</h2>
        <div class="cup-draw-meta">
          <span class="badge gold">${esc(draw.stageLabel || draw.phase)}</span>
          <small class="muted">${draw.date}</small>
        </div>
      </div>
    </header>

    ${draw.userMatchup ? `
      <div class="cup-draw-user-banner">
        <span class="banner-sparkle">⭐</span>
        <div>
          <strong>${tr("مواجهة ناديك في القرعة", "Your Club's Draw Matchup", "Match de votre club au tirage")}</strong>
          <p>${esc(clubBy(draw.userMatchup.home)?.name || draw.userMatchup.home)} × ${esc(clubBy(draw.userMatchup.away)?.name || draw.userMatchup.away)}</p>
        </div>
      </div>
    ` : draw.userBye ? `
      <div class="cup-draw-user-banner bye">
        <span class="banner-sparkle">✨</span>
        <div>
          <strong>${tr("إعفاء رسمي لناديك", "Official Bye for Your Club", "Exemption officielle pour votre club")}</strong>
          <p>${tr("تأهل ناديك مباشرة إلى الدور القادم من المسابقة دون خوض هذا الدور.", "Your club advances directly to the next round without playing this round.", "Votre club est directement qualifié pour le tour suivant.")}</p>
        </div>
      </div>
    ` : ""}

    <div class="cup-draw-section-title">
      <h3>${icon("calendar", 16)} ${tr("مواجهات هذا الدور", "Round Matchups", "Matchs de ce tour")} (${num(pairs.length)})</h3>
    </div>

    <div class="cup-draw-grid">
      ${pairs.map((p, idx) => {
        const isUserMatch = p.home === s.clubId || p.away === s.clubId;
        const clubHome = clubBy(p.home);
        const clubAway = clubBy(p.away);
        return `<article class="cup-draw-pair ${isUserMatch ? "user-pair" : ""}">
          <div class="cup-draw-pair-num">#${num(idx + 1)} ${isUserMatch ? `<span class="badge royal">${tr("مواجهة ناديك", "Your Matchup", "Votre match")}</span>` : ""}</div>
          <div class="cup-draw-teams">
            <div class="cup-draw-team ${p.home === s.clubId ? "is-user" : ""}">
              ${crest(p.home, "small")}
              <strong>${esc(clubHome?.name || p.home)}</strong>
              ${p.home === s.clubId ? `<small class="gold">${tr("ناديك", "Your club", "Votre club")}</small>` : ""}
            </div>
            <span class="cup-draw-vs">VS</span>
            <div class="cup-draw-team ${p.away === s.clubId ? "is-user" : ""}">
              ${crest(p.away, "small")}
              <strong>${esc(clubAway?.name || p.away)}</strong>
              ${p.away === s.clubId ? `<small class="gold">${tr("ناديك", "Your club", "Votre club")}</small>` : ""}
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>

    ${byes.length ? `
      <div class="cup-draw-byes">
        <h4>${tr("الأندية المعفاة من الدور", "Clubs with Byes", "Clubs exemptés")}</h4>
        <div class="byes-list">
          ${byes.map((id) => `<span class="bye-pill ${id === s.clubId ? "is-user" : ""}">${crest(id, "tiny")} ${esc(clubBy(id)?.name || id)}</span>`).join("")}
        </div>
      </div>
    ` : ""}

    <footer class="cup-draw-actions">
      <button class="btn primary" data-action="close-modal">${tr("إغلاق", "Close", "Fermer")}</button>
    </footer>
  </div>`;
}
