// واجهة يوم تصعيد الناشئين 0.27 — ملفات مختصرة وقرارات ثلاثية
import { icon } from "../components/icons.js";
import { avatar } from "../components/shared.js";
import { esc, num } from "../ui/format.js";
import { tr, getLanguage } from "../i18n/index.js";

/**
 * نافذة يوم تصعيد الناشئين
 */
export function youthIntakeModal(s) {
  const batch = s.youthIntakeBatch;
  if (!batch || !batch.candidates || !batch.candidates.length) {
    return `<div class="empty-state"><p>${tr("لا توجد دفعة ناشئين معلقة حاليًا.", "No youth intake class pending right now.", "Aucune promotion de jeunes en attente actuellement.")}</p></div>`;
  }

  return `<div class="youth-intake-modal">
    <header class="youth-intake-header">
      <div class="youth-intake-icon">${icon("academy", 30)}</div>
      <div>
        <span class="eyebrow">${tr("حدث موسمي ثابت", "Fixed Seasonal Event", "Événement saisonnier fixe")}</span>
        <h2>${tr("يوم تصعيد الناشئين", "Youth Intake Day", "Journée de promotion des jeunes")}</h2>
        <p class="muted">${tr("دفعة خريجي الأكاديمية الجديدة. استعرض ملفات المواهب وقرر: من تصعّد للفريق الأول، ومن تعير، ومن تسرّح؟", "New academy graduating class. Review talent briefs and decide: who to promote, loan out, or release?", "Nouvelle promotion de l'académie. Consultez les profils et décidez : qui promouvoir, prêter ou libérer ?")}</p>
      </div>
    </header>

    <div class="youth-candidates-list">
      ${batch.candidates.map((c, idx) => {
        const p = c.player;
        const name = getLanguage() === "ar" ? p.name : p.nameLatin || p.name;
        const [pMin, pMax] = c.range || [p.rating, p.potential];
        const rec = c.recommendedAction || "promote";

        return `<article class="youth-candidate-card" data-player-id="${esc(p.id)}">
          <div class="youth-card-top">
            ${avatar(p, false)}
            <div class="youth-card-info">
              <div class="youth-card-title">
                <strong>${esc(name)}</strong>
                <span class="badge ${p.position === "GK" ? "gold" : p.position.includes("B") ? "blue" : p.position.includes("M") ? "green" : "red"}">${esc(p.position)}</span>
                <small class="muted">${num(p.age)} ${tr("سنة", "yrs", "ans")}</small>
              </div>
              <div class="youth-card-metrics">
                <span>${tr("التقييم الحالي:", "Current:", "Actuel :")} <b>${num(Math.round(p.rating))}</b></span>
                <span>${tr("الإمكانات المتوقعة:", "Potential:", "Potentiel :")} <b class="gold">${num(pMin)}–${num(pMax)} ★</b></span>
              </div>
            </div>
          </div>

          <div class="youth-card-attrs">
            ${Object.entries(p.attributes || {}).slice(0, 4).map(([k, v]) => `
              <div class="youth-attr-pill">
                <small>${esc(k)}</small>
                <strong>${num(Math.round(v))}</strong>
              </div>
            `).join("")}
          </div>

          <div class="youth-card-actions">
            <span class="actions-label">${tr("القرار الإداري:", "Your Decision:", "Votre décision :")}</span>
            <div class="youth-decision-options">
              <label class="decision-radio promote">
                <input type="radio" name="youth-dec-${esc(p.id)}" value="promote" ${rec === "promote" ? "checked" : ""}>
                <span>${icon("check", 14)} ${tr("تصعيد للفريق الأول", "Promote to First Team", "Promouvoir en équipe première")}</span>
              </label>
              <label class="decision-radio loan">
                <input type="radio" name="youth-dec-${esc(p.id)}" value="loan" ${rec === "loan" ? "checked" : ""}>
                <span>${icon("arrow", 14)} ${tr("إعارة لكسب الخبرة", "Loan for Experience", "Prêter pour aguerrissement")}</span>
              </label>
              <label class="decision-radio release">
                <input type="radio" name="youth-dec-${esc(p.id)}" value="release" ${rec === "release" ? "checked" : ""}>
                <span>${icon("close", 14)} ${tr("تسريح كلاعب حر", "Release as Free Agent", "Libérer en joueur libre")}</span>
              </label>
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>

    <footer class="youth-intake-footer">
      <button class="btn primary full" data-action="confirm-youth-intake">
        ${icon("check", 18)} ${tr("اعتماد قرارات الناشئين", "Confirm Youth Decisions", "Confirmer les décisions")}
      </button>
    </footer>
  </div>`;
}
