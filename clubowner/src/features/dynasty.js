import { heading, button, badge, infoNote, progress } from "../components/shared.js";
import { availableAcademyMentors, allDynastyChildren } from "../services/dynasty.js";
import { dynastySiblings } from "../services/dynastyCareers.js";
import { DYNASTY_EVENTS } from "../data/dynastyEvents.js";
import {
  ACADEMY_FOCUSES,
  ACADEMY_POSITION_IDS,
  CHILD_STAGES,
  DYNASTY_PATHS,
  DYNASTY_TRAITS,
  UPBRINGING_STYLES,
} from "../data/dynasty.js";
import { esc, num, date } from "../ui/format.js";
import { tr } from "../i18n/index.js";

const positionName = (id) =>
  ({
    GK: tr("حارس مرمى", "Goalkeeper", "Gardien"),
    CB: tr("قلب دفاع", "Centre-back", "Défenseur central"),
    RB: tr("ظهير أيمن", "Right-back", "Arrière droit"),
    LB: tr("ظهير أيسر", "Left-back", "Arrière gauche"),
    DM: tr("محور دفاعي", "Defensive midfielder", "Milieu défensif"),
    CM: tr("وسط", "Central midfielder", "Milieu central"),
    AM: tr("وسط هجومي", "Attacking midfielder", "Milieu offensif"),
    LW: tr("جناح أيسر", "Left winger", "Ailier gauche"),
    RW: tr("جناح أيمن", "Right winger", "Ailier droit"),
    ST: tr("مهاجم", "Striker", "Avant-centre"),
  })[id] || id;

function selects(items, selected, label) {
  return items
    .map(
      (item) =>
        `<option value="${esc(item.id)}" ${item.id === selected ? "selected" : ""}>${esc(label(item))}</option>`,
    )
    .join("");
}

function academyPanel(s, child) {
  const academy = child.academy;
  const mentors = availableAcademyMentors(s);
  if (child.playerId) {
    const player = s.players.find((item) => item.id === child.playerId) || (s.retired || []).find((item) => item.id === child.playerId);
    return `<section class="dynasty-academy"><div class="dynasty-academy-head"><div><span class="eyebrow">${tr("خريج الأكاديمية", "Academy graduate", "Diplômé de l’académie")}</span><h4>${tr("الفريق الأول", "First team", "Équipe première")}</h4></div>${badge(player?.status === "retired" ? tr("معتزل", "Retired", "Retraité") : tr("مسجل", "Registered", "Enregistré"), player?.status === "retired" ? "" : "green")}</div>${player ? `<p><bdi data-no-translate>${esc(player.name)}</bdi> · ${esc(positionName(player.position))} · ${tr("التقييم", "Rating", "Note")} ${num(Math.round(player.rating))}</p>${button(tr("عرض ملف اللاعب", "View player profile", "Voir le profil du joueur"), "player-detail", player.id, "secondary")}` : `<p class="muted">${tr("لم يعد ملف اللاعب في قائمة النادي.", "The player's profile is no longer in the club roster.", "Le profil du joueur n’est plus dans l’effectif du club.")}</p>`}</section>`;
  }
  if (!academy?.enrolled) {
    if (child.age < 10 || child.age > 17 || (child.careerPath && child.careerPath !== "player"))
      return `<div class="dynasty-academy-locked">${tr("الالتحاق متاح من عمر ١٠ إلى ١٧، إذا اختار الابن مسار كرة القدم.", "Enrollment is open from age 10 to 17 for children pursuing football.", "L’inscription est ouverte de 10 à 17 ans aux enfants qui choisissent le football.")}</div>`;
    return `<div class="dynasty-academy-start"><label class="field"><span>${tr("المركز المفضل", "Preferred position", "Poste préféré")}</span><select id="dynasty-academy-position-${esc(child.id)}">${ACADEMY_POSITION_IDS.map((id) => `<option value="${id}" ${id === "CM" ? "selected" : ""}>${esc(positionName(id))}</option>`).join("")}</select></label>${button(tr("بدء رحلة الأكاديمية", "Start academy journey", "Commencer le parcours à l’académie"), "dynasty-academy-enroll", child.id, "primary")}</div>`;
  }
  const recent = [...academy.reports].slice(-3).reverse();
  const focusLabel = (focus) => {
    const item = ACADEMY_FOCUSES.find((x) => x.id === focus);
    return item ? tr(item.label.ar, item.label.en, item.label.fr) : focus;
  };
  return `<section class="dynasty-academy"><div class="dynasty-academy-head"><div><span class="eyebrow">${tr("مسار الناشئين", "Youth pathway", "Parcours de formation")}</span><h4>${tr("رحلة الأكاديمية", "Academy journey", "Parcours à l’académie")}</h4></div>${badge(academy.trialReady ? tr("جاهز لتجربة الفريق", "Ready for first-team trial", "Prêt pour un essai en équipe première") : tr("قيد التطوير", "In development", "En progression"), academy.trialReady ? "green" : "gold")}</div><div class="dynasty-academy-stats"><div><strong>${num(Math.round(academy.rating))}</strong><small>${tr("تقييم الأكاديمية", "Academy rating", "Note à l’académie")}</small></div><div><strong>${num(academy.appearances)}</strong><small>${tr("مشاركة", "Appearances", "Apparitions")}</small></div><div><strong>${num(academy.goals)}</strong><small>${tr("أهداف", "Goals", "Buts")}</small></div><div><strong>${num(Math.round(academy.form))}٪</strong><small>${tr("الحالة", "Form", "Forme")}</small></div></div>${academy.injuryUntil && academy.injuryUntil >= s.date ? `<p class="dynasty-injury">${tr("برنامج تأهيل حتى", "Rehabilitation through", "Rééducation jusqu’au")} ${date(academy.injuryUntil)}</p>` : ""}<div class="form-grid dynasty-academy-controls"><label class="field"><span>${tr("تركيز التدريب", "Training focus", "Axe d’entraînement")}</span><select data-dynasty-academy-focus="${esc(child.id)}">${selects(ACADEMY_FOCUSES, academy.focus, (x) => tr(x.label.ar, x.label.en, x.label.fr))}</select></label><label class="field"><span>${tr("مركز اللعب", "Playing position", "Poste")}</span><select data-dynasty-academy-position="${esc(child.id)}">${ACADEMY_POSITION_IDS.map((id) => `<option value="${id}" ${id === academy.position ? "selected" : ""}>${esc(positionName(id))}</option>`).join("")}</select></label><label class="field"><span>${tr("مرشد من النادي", "Club mentor", "Mentor du club")}</span><select data-dynasty-academy-mentor="${esc(child.id)}"><option value="">${tr("دون مرشد", "No mentor", "Sans mentor")}</option>${mentors.map((mentor) => `<option value="${esc(mentor.id)}" ${mentor.id === academy.mentorId ? "selected" : ""}>${esc(mentor.name)} · ${esc(positionName(mentor.position))} · ${num(Math.round(mentor.rating))}</option>`).join("")}</select></label></div><p class="dynasty-academy-note">${tr("تؤثر المنشآت ومدرب الناشئين والمرشد والتركيز في التطور. المشاركة والإصابة والحالة تسجل شهريًا؛ تقييم الأكاديمية ليس ضمانًا للاحتراف.", "Facilities, the youth coach, mentor and focus shape development. Appearances, injuries and form are logged monthly; an academy rating does not guarantee a professional career.", "Les installations, l’entraîneur des jeunes, le mentor et l’axe influencent la progression. Apparitions, blessures et forme sont consignées chaque mois ; la note ne garantit pas une carrière professionnelle.")}</p>${recent.length ? `<div class="dynasty-reports"><strong>${tr("آخر تقارير الشهر", "Recent monthly reports", "Derniers rapports mensuels")}</strong>${recent.map((report) => `<div><span>${date(report.date)} · ${esc(focusLabel(report.focus))}</span><b>${num(Math.round(report.rating))} <small>${tr("تقييم", "rating", "note")}</small></b><span>+${num(report.gain)} ${tr("تطور", "growth", "progression")}</span></div>`).join("")}</div>` : `<p class="muted">${tr("سيظهر أول تقرير شهري بعد تقدم الوقت.", "The first monthly report appears as time advances.", "Le premier rapport mensuel apparaîtra après l’avancement du temps.")}</p>`}${academy.trialReady && child.careerPath === "player" ? button(tr("تصعيد إلى الفريق الأول", "Promote to the first team", "Promouvoir en équipe première"), "dynasty-academy-graduate", child.id, "primary") : ""}${button(tr("الانسحاب من الأكاديمية", "Leave academy", "Quitter l’académie"), "dynasty-academy-leave", child.id, "ghost small")}</section>`;
}

function careerPathPanel(child) {
  if (child.careerPath) {
    const path = DYNASTY_PATHS.find((item) => item.id === child.careerPath);
    if (!path) return "";
    return `<div class="dynasty-career-path"><span class="eyebrow">${tr("المسار المختار", "Chosen path", "Parcours choisi")}</span><div>${badge(tr(path.label.ar, path.label.en, path.label.fr), path.id === "rebellious" ? "gold" : "green")}</div><p>${tr(path.bonus.ar, path.bonus.en, path.bonus.fr)}</p></div>`;
  }
  if (child.age < 15) return "";
  return `<section class="dynasty-career-path"><span class="eyebrow">${tr("قرار المسار المهني", "Career-path decision", "Choix du parcours")}</span><p>${tr("من عمر ١٥، يختار الابن طريقه. المسار المستقل عن الكرة مشروع بلا عقوبة.", "From age 15, the child chooses their route. An independent path beyond football is valid and unpenalized.", "À partir de 15 ans, l’enfant choisit sa voie. Le parcours indépendant du football est légitime et sans pénalité.")}</p><div class="dynasty-path-options">${DYNASTY_PATHS.map((path) => `<button class="dynasty-path-option" data-action="dynasty-career-path" data-id="${esc(child.id)}" data-path="${path.id}"><strong>${tr(path.label.ar, path.label.en, path.label.fr)}</strong><small>${tr(path.bonus.ar, path.bonus.en, path.bonus.fr)}</small></button>`).join("")}</div></section>`;
}

function siblingPanel(s, child) {
  const siblings = dynastySiblings(s, child.id);
  if (siblings.length < 2) return "";
  const conflict = child.jealousy >= 35 || siblings.some((sibling) => sibling.id !== child.id && sibling.jealousy >= 35);
  return `<div class="dynasty-sibling-state"><div><span>${tr("رابطة الإخوة", "Sibling bond", "Liens fraternels")}</span><b>${num(Math.round(child.jealousy))}٪ ${tr("توتر", "tension", "tension")}</b></div>${progress(child.jealousy)}<small>${conflict ? tr("تراكم الغيرة قد يضعف العلاقة؛ يمكنك فتح حوار عائلي.", "Growing jealousy can strain relationships; a family conversation can help.", "La jalousie peut fragiliser les relations ; une discussion familiale peut aider.") : tr("المنافسة طبيعية ما دامت العلاقة متوازنة.", "Competition is healthy while relationships remain balanced.", "La compétition reste saine tant que les relations sont équilibrées.")}</small>${conflict ? button(tr("جلسة مصالحة بين الإخوة", "Reconcile the siblings", "Réconcilier la fratrie"), "dynasty-sibling-reconcile", child.id, "small secondary") : ""}</div>`;
}

function childCard(s, child) {
  const stage = CHILD_STAGES.find((item) => item.id === child.stage);
  const traits = child.traits
    .map((id) => DYNASTY_TRAITS.find((trait) => trait.id === id))
    .filter(Boolean)
    .map((trait) => badge(tr(trait.label.ar, trait.label.en, trait.label.fr), ""))
    .join(" ");
  const upbringing = UPBRINGING_STYLES.find((item) => item.id === child.upbringing);
  const parent = child.parentId ? allDynastyChildren(s).find((item) => item.id === child.parentId) : null;
  return `<article class="panel dynasty-child-card"><div class="dynasty-child-head"><div><span class="eyebrow">${tr("الجيل", "Generation", "Génération")} ${num(child.generation)} · ${stage ? tr(stage.label.ar, stage.label.en, stage.label.fr) : ""}</span><h3><bdi data-no-translate>${esc(child.name)}</bdi></h3><p>${num(child.age)} ${tr("سنة", "years old", "ans")}${parent ? ` · ${tr("ابن", "child of", "enfant de")} <bdi data-no-translate>${esc(parent.name)}</bdi>` : ""}</p></div>${child.isHeir ? badge(tr("الوريث الرسمي", "Official heir", "Héritier officiel"), "gold") : ""}</div><div class="dynasty-child-stats"><div><span>${tr("الموهبة", "Talent", "Talent")}</span><b>${num(Math.round(child.stats.talent))}</b></div><div><span>${tr("الانضباط", "Discipline", "Discipline")}</span><b>${num(Math.round(child.stats.discipline))}</b></div><div><span>${tr("الطموح", "Ambition", "Ambition")}</span><b>${num(Math.round(child.stats.ambition))}</b></div><div><span>${tr("العلاقة", "Relationship", "Relation")}</span><b>${num(Math.round(child.relationship))}٪</b></div></div><div class="dynasty-traits">${traits || `<span class="muted">${tr("تتشكل الصفات مع العمر والتجارب.", "Traits form through age and experience.", "Les traits se forment avec l’âge et l’expérience.")}</span>`}</div><label class="field dynasty-upbringing"><span>${tr("أسلوب التربية", "Upbringing", "Éducation")}</span><select data-dynasty-upbringing="${esc(child.id)}">${selects(UPBRINGING_STYLES, child.upbringing, (item) => tr(item.label.ar, item.label.en, item.label.fr))}</select><small>${upbringing ? tr(upbringing.label.ar, upbringing.label.en, upbringing.label.fr) : ""}</small></label>${careerPathPanel(child)}${siblingPanel(s, child)}${academyPanel(s, child)}</article>`;
}

const EVENT_BY_ID = new Map(DYNASTY_EVENTS.map((item) => [item.id, item]));

function eventCard(s, record) {
  const definition = EVENT_BY_ID.get(record.type);
  if (!definition) return "";
  const child = record.childId ? allDynastyChildren(s).find((item) => item.id === record.childId) : null;
  return `<article class="panel dynasty-event"><div class="dynasty-event-head"><div><span class="eyebrow">${tr("قرار مطلوب", "Decision required", "Décision requise")} · ${date(record.date)}</span><h3>${tr(definition.title.ar, definition.title.en, definition.title.fr)}</h3>${child ? `<p><bdi data-no-translate>${esc(child.name)}</bdi></p>` : ""}</div>${badge(tr("الوقت متوقف", "Time paused", "Temps en pause"), "gold")}</div><p>${tr(definition.body.ar, definition.body.en, definition.body.fr)}</p><div class="dynasty-event-choices">${definition.choices.map((choice) => `<button class="btn secondary" data-action="dynasty-event-choice" data-id="${esc(record.id)}" data-choice="${esc(choice.id)}">${tr(choice.label.ar, choice.label.en, choice.label.fr)}</button>`).join("")}</div></article>`;
}

function publicBalancePanel(d) {
  const mood = d.publicBalance >= 65
    ? [tr("تأييد واضح", "Strong support", "Soutien marqué"), "green"]
    : d.publicBalance <= 35
      ? [tr("توتر وانتقاد", "Tension and criticism", "Tensions et critiques"), "red"]
      : [tr("رأي متوازن", "Mixed opinion", "Opinion partagée"), "gold"];
  const changes = d.balanceHistory.slice(-4).reverse();
  return `<section class="panel dynasty-balance"><div class="dynasty-balance-head"><div><span class="eyebrow">${tr("الصورة العامة للعائلة", "Family public standing", "Image publique de la famille")}</span><h2>${tr("ميزان الرأي العام", "Public-opinion balance", "Équilibre de l’opinion publique")}</h2></div>${badge(mood[0], mood[1])}</div><div class="dynasty-balance-value"><strong>${num(Math.round(d.publicBalance))}٪</strong><span>${tr("محايد", "Neutral", "Neutre")} 50٪</span></div>${progress(d.publicBalance)}<p>${tr("تؤثر قرارات الأسرة وشفافيتها على نظرة الجمهور. لا توجد إجابة واحدة صحيحة؛ يمكنك إصلاح الثقة بقرارات لاحقة.", "Family choices and transparency shape public sentiment. There is no single correct answer; later decisions can rebuild trust.", "Les choix et la transparence de la famille influencent l’opinion. Il n’y a pas de réponse unique ; les décisions suivantes peuvent rétablir la confiance.")}</p>${changes.length ? `<div class="dynasty-balance-history"><strong>${tr("أحدث التحركات", "Recent changes", "Évolutions récentes")}</strong>${changes.map((item) => `<div><span>${date(item.date)}</span><b class="${item.delta > 0 ? "positive" : "negative"}">${item.delta > 0 ? "+" : ""}${num(item.delta)}</b></div>`).join("")}</div>` : ""}</section>`;
}

function eventHistory(d) {
  const recent = d.events.filter((item) => item.status === "resolved").slice(-5).reverse();
  if (!recent.length) return "";
  return `<section class="panel dynasty-event-history"><h3>${tr("سجل القرارات العائلية", "Family decision history", "Historique des décisions familiales")}</h3>${recent.map((record) => {
    const definition = EVENT_BY_ID.get(record.type);
    const choice = definition?.choices.find((item) => item.id === record.choiceId);
    return definition && choice ? `<div><span>${date(record.date)} · ${tr(definition.title.ar, definition.title.en, definition.title.fr)}</span><b>${tr(choice.label.ar, choice.label.en, choice.label.fr)}</b></div>` : "";
  }).join("")}</section>`;
}

export function dynastyView(s) {
  const d = s.dynasty;
  const children = allDynastyChildren(s);
  const owner = d.owner;
  const marriage = !d.spouse && !owner.retired && owner.age >= 18
    ? `<section class="panel dynasty-action-panel"><span class="eyebrow">${tr("بداية السلالة", "Begin the dynasty", "Commencer la dynastie")}</span><h2>${tr("كوّن أسرتك", "Start your family", "Fondez votre famille")}</h2><p>${tr("الترحيل حافظ على عمر المالك والأبناء الموجودين. إذا لم تكن لديك أسرة، ابدأ بالزواج ثم قرر الإنجاب.", "Migration preserves the owner's age and existing children. If you have no family yet, marry first, then decide whether to have children.", "La migration préserve l’âge du propriétaire et les enfants existants. Sans famille, commencez par vous marier, puis décidez d’avoir des enfants.")}</p><form id="dynasty-marriage-form" class="dynasty-inline-form"><label class="field"><span>${tr("اسم الشريك", "Partner's name", "Nom du partenaire")}</span><input name="partner" maxlength="80" required placeholder="${tr("اكتب الاسم", "Enter a name", "Saisir un nom")}"></label><button class="btn primary">${tr("الزواج", "Marry", "Se marier")}</button></form></section>`
    : "";
  const birth = d.spouse && !owner.retired && owner.age <= 70 && d.children.length < 50
    ? `<section class="panel dynasty-action-panel"><span class="eyebrow">${tr("قرار عائلي", "Family decision", "Décision familiale")}</span><h2>${tr("إضافة ابن أو ابنة", "Welcome a child", "Accueillir un enfant")}</h2><p>${tr("لا يبدأ النظام بطفل افتراضي. كل إضافة قرار منك، وتبدأ رحلة النمو من تاريخ الميلاد.", "The system does not create a default child. Each addition is your choice, and growth begins from the birth date.", "Le système ne crée pas d’enfant par défaut. Chaque naissance est votre décision et la croissance commence à cette date.")}</p><form id="dynasty-child-form" class="dynasty-inline-form"><label class="field"><span>${tr("اسم الطفل", "Child's name", "Nom de l’enfant")}</span><input name="childName" maxlength="80" required placeholder="${tr("اسم ولقب", "First and last name", "Prénom et nom")}"></label><button class="btn primary">${tr("تسجيل الميلاد", "Record birth", "Enregistrer la naissance")}</button></form></section>`
    : "";
  const openEvents = d.events.filter((item) => item.status === "open");
  return `${heading(tr("العائلة والإرث", "Family and legacy", "Famille et héritage"), tr("الأجيال", "Dynasty", "Dynastie"), tr("تابع نمو الأسرة، قرارات التربية، ومشوار ناشئي العائلة داخل النادي. تتقدم الأنظمة مع مرور الأيام والأشهر.", "Follow the family's growth, upbringing choices and youth pathway at the club. Systems advance as days and months pass.", "Suivez la croissance familiale, les choix d’éducation et le parcours des jeunes au club. Les systèmes évoluent avec les jours et les mois."), badge(`${tr("الجيل", "Generation", "Génération")} ${num(d.generation)}`, "gold"))}${publicBalancePanel(d)}${openEvents.map((record) => eventCard(s, record)).join("")}<section class="panel dynasty-overview"><div><span class="eyebrow">${tr("المالك الحالي", "Current owner", "Propriétaire actuel")}</span><h2><bdi data-no-translate>${esc(owner.name)}</bdi></h2><p>${num(owner.age)} ${tr("سنة", "years old", "ans")} · ${tr("العائلة", "Family", "Famille")} <bdi data-no-translate>${esc(d.familyName)}</bdi>${d.spouse ? ` · ${tr("الشريك", "Partner", "Partenaire")} <bdi data-no-translate>${esc(d.spouse)}</bdi>` : ""}</p></div><div class="dynasty-overview-stats"><div><strong>${num(children.length)}</strong><small>${tr("أبناء وأحفاد", "Children and descendants", "Enfants et descendants")}</small></div><div><strong>${num(children.filter((child) => child.academy?.enrolled).length)}</strong><small>${tr("في الأكاديمية", "In the academy", "À l’académie")}</small></div><div><strong>${num(d.legacyScore)}</strong><small>${tr("نقاط الإرث", "Legacy score", "Score d’héritage")}</small></div></div></section>${marriage}${birth}<div class="dynasty-section-title"><div><span class="eyebrow">${tr("شجرة العائلة", "Family tree", "Arbre généalogique")}</span><h2>${tr("أفراد السلالة", "Dynasty members", "Membres de la dynastie")}</h2></div><span>${num(children.length)} ${tr("فرد", "members", "membres")}</span></div>${children.length ? `<div class="dynasty-family-grid">${children.map((child) => childCard(s, child)).join("")}</div>` : `<section class="panel dynasty-empty"><h3>${tr("لا يوجد أبناء مسجلون بعد", "No children recorded yet", "Aucun enfant enregistré")}</h3><p>${tr("عند اكتمال الزواج يمكنك بدء الأسرة من النموذج أعلاه. الحفظ القديم بلا بيانات عائلية يبقى دون أبناء تلقائيين.", "After marriage, start a family using the form above. Legacy saves without family data remain child-free until you choose otherwise.", "Après le mariage, fondez votre famille avec le formulaire ci-dessus. Les anciennes sauvegardes sans données familiales restent sans enfants jusqu’à votre décision.")}</p></section>`}${eventHistory(d)}${infoNote(tr("التقارير والصفات محفوظة في ملف الحفظ. إعداد الأكاديمية شهري، وقرار المسار يبقى للشخص نفسه عند بلوغه.", "Reports and traits are stored in the save. Academy progress is monthly; each person chooses their own path when they come of age.", "Les rapports et les traits sont enregistrés. La progression à l’académie est mensuelle ; chacun choisit son parcours en grandissant."))}`;
}
