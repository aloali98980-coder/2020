import { ULTRAS_DEMANDS, ULTRAS_EVENT_CATALOG, upcomingUltrasFixtures } from "../data/ultrasEvents.js";
import { CLUBS } from "../data/catalog.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { getLanguage } from "../i18n/index.js";
import { badge, button, empty, heading, infoNote } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { date, esc, money, num } from "../ui/format.js";
import {
  canFulfilSupporterDemand,
  fanAttendanceMultiplier,
  moodLevel,
  ultrasGroup,
} from "../services/ultras.js";
import { getDerbyInfo } from "../services/derby.js";
import { daysBetween } from "../core/utils.js";

const MOOD_COPY = {
  love: { ar: "حب وولاء", en: "Love and loyalty", fr: "Amour et fidélité" },
  happy: { ar: "سعيد", en: "Happy", fr: "Heureux" },
  neutral: { ar: "محايد", en: "Neutral", fr: "Neutre" },
  angry: { ar: "غاضب", en: "Angry", fr: "En colère" },
  rebellious: { ar: "متمرد", en: "Rebellious", fr: "En révolte" },
};
const l = (words) => words[getLanguage()] || words.en || words.ar;
const clubName = (id) => {
  const club = extendedClub(id) || CLUBS.find((entry) => entry.id === id);
  const name = club?.name || id;
  if (getLanguage() === "ar") return club?.nameAr || name;
  if (getLanguage() === "fr") return club?.nameFr || club?.wiki || (/[\u0600-\u06ff]/.test(name) ? id.replaceAll("_", " ") : name);
  return club?.nameEn || club?.wiki || (/[\u0600-\u06ff]/.test(name) ? id.replaceAll("_", " ") : name);
};

function rivalIds(save) {
  const ids = new Set((save.table || []).map((row) => row.clubId));
  if (save.expansion) {
    for (const division of save.expansion.divisions || [])
      if (division.clubs?.includes(save.clubId)) for (const id of division.clubs) ids.add(id);
    for (const cup of save.expansion.cups || [])
      if (cup.entrants?.includes(save.clubId) || cup.alive?.includes(save.clubId))
        for (const id of cup.entrants || cup.alive || []) ids.add(id);
  }
  for (const fixture of upcomingUltrasFixtures(save, 365)) {
    if ([fixture.home, fixture.away].includes(save.clubId)) {
      ids.add(fixture.home);
      ids.add(fixture.away);
    }
  }
  ids.delete(save.clubId);
  return [...ids].filter((id) => save.ultras?.groups?.[id]).sort((a, b) => clubName(a).localeCompare(clubName(b)));
}

function nextDerby(save) {
  return upcomingUltrasFixtures(save, 60).find((fixture) => getDerbyInfo(fixture.home, fixture.away, save).isDerby) || null;
}

function tifoGraphic(group) {
  const name = esc(group.name[getLanguage()] || group.name.en);
  const label = esc(l({ ar: "إمباير إف سي · ألتراس", en: "EMPIRE FC · ULTRAS", fr: "EMPIRE FC · ULTRAS" }));
  return `<div class="ultras-tifo-art" aria-label="${esc(l({ ar: "راية مجموعة المشجعين", en: "Supporters’ group banner", fr: "Banderole du groupe de supporters" }))}"><span class="tifo-star tifo-star-a">✦</span><span class="tifo-star tifo-star-b">✦</span><svg viewBox="0 0 640 190" role="img" aria-label="${name}"><defs><linearGradient id="ultras-tifo-gradient" x1="0" x2="1"><stop stop-color="#30cba5"/><stop offset="1" stop-color="#61a6ff"/></linearGradient></defs><path d="M15 25h610v130H15z" fill="url(#ultras-tifo-gradient)"/><path d="M35 40h570v100H35z" fill="#071b30" opacity=".93"/><path d="M45 50v80m550-80v80" stroke="#e7c36a" stroke-width="7"/><text x="320" y="85" text-anchor="middle" fill="#fff" font-size="16" font-weight="800" letter-spacing="5">${label}</text><text x="320" y="119" text-anchor="middle" fill="#e7c36a" font-size="24" font-weight="900">${name}</text></svg></div>`;
}

function demandPanel(save, group) {
  const demand = group.demand;
  if (!demand) return `<section class="panel ultras-demand-panel"><div class="ultras-section-title"><div><span class="eyebrow">${l({ ar: "علاقة الإدارة بالجماهير", en: "Owner and supporters", fr: "Direction et supporters" })}</span><h2>${l({ ar: "لا مطالب معلقة", en: "No open demands", fr: "Aucune demande en cours" })}</h2></div>${badge(l({ ar: "الحوار مفتوح", en: "Talks are open", fr: "Dialogue ouvert" }), "green")}</div><p class="muted">${l({ ar: "تظهر المطالب تلقائيًا عند تراجع المزاج أو إهمال الحوار، ويكون أمامك 21 يومًا للاستجابة أو التفاوض.", en: "Demands appear when confidence falls or dialogue is neglected. You will have 21 days to fulfil or negotiate.", fr: "Les demandes apparaissent lorsque la confiance baisse ou que le dialogue est négligé. Vous disposerez de 21 jours pour répondre ou négocier." })}</p></section>`;
  const item = ULTRAS_DEMANDS[demand.kind];
  const canFulfil = canFulfilSupporterDemand(save, group);
  const remaining = Math.max(0, daysBetween(save.date, demand.due));
  const urgency = demand.escalation >= 2 ? "danger" : remaining <= 5 ? "gold" : "";
  return `<section class="panel ultras-demand-panel ${urgency ? `demand-${urgency}` : ""}"><div class="ultras-section-title"><div><span class="eyebrow">${l({ ar: "مهلة محددة · تصعيد تدريجي", en: "Timed demand · escalating pressure", fr: "Délai limité · pression progressive" })}</span><h2>${esc(l(item.name))}</h2></div>${badge(l({ ar: `تصعيد ${demand.escalation}/3`, en: `Stage ${demand.escalation}/3`, fr: `Étape ${demand.escalation}/3` }), demand.escalation ? "gold" : "")}</div><p>${esc(l(item.detail))}</p><div class="ultras-demand-meta"><span>${icon("clock", 16)} ${l({ ar: "المهلة", en: "Deadline", fr: "Échéance" })}: <strong>${date(demand.due)}</strong></span><span>${remaining ? `${num(remaining)} ${l({ ar: "يومًا متبقيًا", en: "days left", fr: "jours restants" })}` : l({ ar: "انتهت المهلة", en: "Deadline passed", fr: "Délai dépassé" })}</span><span>${l({ ar: "تفاوضات", en: "Negotiations", fr: "Négociations" })}: ${num(demand.negotiations)}</span></div>${demand.escalation ? `<p class="ultras-warning">${l({ ar: "التجاهل يفرض مقاطعة أو إضراب هتاف أو غرامة، ثم قد تتحول الأزمة إلى اشتباك وفضيحة.", en: "Ignoring the demand can trigger a boycott, chant strike, fine, and eventually a clash or scandal.", fr: "Ignorer la demande peut entraîner un boycott, une grève des chants, une amende, puis un affrontement ou un scandale." })}</p>` : ""}<div class="ultras-button-row"><button class="btn primary" data-action="ultras-demand-choice" data-id="fulfil" ${canFulfil ? "" : "disabled"}>${l({ ar: "تنفيذ المطلب", en: "Fulfil demand", fr: "Satisfaire la demande" })}</button><button class="btn secondary" data-action="ultras-demand-choice" data-id="negotiate">${l({ ar: "التفاوض وتمديد المهلة", en: "Negotiate an extension", fr: "Négocier un délai" })}</button><button class="btn ghost danger-text" data-action="ultras-demand-choice" data-id="ignore">${l({ ar: "تجاهل المطلب", en: "Ignore the demand", fr: "Ignorer la demande" })}</button></div>${!canFulfil ? `<small class="muted">${l({ ar: demand.kind === "star" ? "يلزم توقيع لاعب بتقييم 72 أو أعلى بعد بدء المطلب." : demand.kind === "coach" ? "تحقق من وجود مدرب وسيولة كافية لتعويض الإقالة." : demand.kind === "youth" ? "يلزم توفر ميزانية وموعد شاغر لمشروع الأكاديمية." : "لا يمكن خفض السعر أكثر من الحد الأدنى." , en: demand.kind === "star" ? "Sign a 72+ rated player after the demand begins." : demand.kind === "coach" ? "A coach and enough compensation budget are required." : demand.kind === "youth" ? "The academy needs an available project slot and sufficient funds." : "The ticket price is already at its minimum." , fr: demand.kind === "star" ? "Recrutez un joueur noté 72 ou plus après l’ouverture de la demande." : demand.kind === "coach" ? "Un entraîneur et une indemnité suffisante sont nécessaires." : demand.kind === "youth" ? "Un créneau de projet et un budget suffisant sont nécessaires." : "Le prix du billet est déjà au minimum." })}</small>` : ""}</section>`;
}

function pendingCard(save, group) {
  const pending = save.ultras.pendingEvent;
  if (!pending) return "";
  if (pending.eventId === "demand-response") {
    const demand = group.demand;
    const copy = demand && ULTRAS_DEMANDS[demand.kind];
    return `<section class="panel ultras-pending-card"><div class="ultras-section-title"><div><span class="eyebrow">${l({ ar: "في انتظار قرارك", en: "Awaiting your decision", fr: "En attente de votre décision" })}</span><h2>${l({ ar: "مطالب الجماهير تصعّد الضغط", en: "Supporters escalate their demand", fr: "Les supporters accentuent la pression" })}</h2></div>${badge(l({ ar: "عاجل", en: "Urgent", fr: "Urgent" }), "gold")}</div><p>${copy ? esc(l(copy.name)) : ""} · ${l({ ar: "التصعيد الحالي", en: "Current stage", fr: "Étape actuelle" })} ${num(demand?.escalation || 0)}/3.</p><div class="ultras-button-row"><button class="btn primary" data-action="ultras-event-choice" data-event="${pending.id}" data-id="fulfil" ${canFulfilSupporterDemand(save, group) ? "" : "disabled"}>${l({ ar: "تنفيذ الآن", en: "Fulfil now", fr: "Satisfaire maintenant" })}</button><button class="btn secondary" data-action="ultras-event-choice" data-event="${pending.id}" data-id="negotiate">${l({ ar: "تفاوض", en: "Negotiate", fr: "Négocier" })}</button><button class="btn ghost danger-text" data-action="ultras-event-choice" data-event="${pending.id}" data-id="ignore">${l({ ar: "تجاهل", en: "Ignore", fr: "Ignorer" })}</button></div></section>`;
  }
  const event = ULTRAS_EVENT_CATALOG.find((item) => item.id === pending.eventId);
  if (!event) return "";
  return `<section class="panel ultras-pending-card"><div class="ultras-section-title"><div><span class="eyebrow">${l({ ar: "اختيار جماهيري", en: "Supporter decision", fr: "Décision des supporters" })}</span><h2>${esc(l(event.title))}</h2></div>${badge(l({ ar: "اختيارك", en: "Your choice", fr: "Votre choix" }), "gold")}</div><p>${esc(l(event.body))}</p>${event.id.includes("tifo") ? tifoGraphic(group) : ""}<div class="ultras-choice-grid">${event.choices.map((item) => `<button class="ultras-choice" data-action="ultras-event-choice" data-event="${pending.id}" data-id="${item.id}"><strong>${esc(l(item.label))}</strong><span>${icon("arrow", 15)}</span></button>`).join("")}</div></section>`;
}

function rivalPanel(save, ids) {
  const rivals = ids.map((id) => ({ id, group: ultrasGroup(save, id) })).filter((row) => row.group);
  const rows = rivals.slice(0, 18).map(({ id, group }) => {
    const state = moodLevel(group.mood);
    const sanctionable = group.lastIncident?.kind === "clash" && daysBetween(group.lastIncident.date, save.date) <= 90 && save.politics?.office?.held && (!group.stadiumSanctionUntil || group.stadiumSanctionUntil < save.date);
    return `<article class="ultras-rival-row"><div class="mini-crest">${esc(extendedClub(id)?.initial || clubName(id).slice(0, 1))}</div><div class="ultras-rival-details"><strong>${esc(clubName(id))}</strong><span>${esc(l(group.name))}</span></div><div class="ultras-rival-state"><span class="mood-dot mood-${state}"></span>${num(group.mood)} · ${l(MOOD_COPY[state])}</div>${sanctionable ? `<button class="btn ghost small" data-action="ultras-sanction" data-id="${esc(id)}">${l({ ar: "عقوبة ملعب (الاتحاد)", en: "Association sanction", fr: "Sanction fédérale" })}</button>` : ""}</article>`;
  }).join("");
  const select = rivals.length ? `<div class="ultras-rival-action"><label>${l({ ar: "خصمك التالي", en: "Choose a rival", fr: "Choisir un rival" })}<select id="ultras-rival-select">${rivals.slice(0, 60).map(({ id }) => `<option value="${esc(id)}">${esc(clubName(id))}</option>`).join("")}</select></label><button class="btn ghost" data-action="ultras-pressure">${l({ ar: "حملة منافسة (ترفع الشبهات)", en: "Rival campaign (raises suspicion)", fr: "Campagne rivale (augmente les soupçons)" })}</button></div>` : "";
  return `<section class="panel ultras-rivals-panel"><div class="ultras-section-title"><div><span class="eyebrow">${l({ ar: "خصوم اليوم وغدًا", en: "Rivals today and tomorrow", fr: "Rivaux d’aujourd’hui et de demain" })}</span><h2>${l({ ar: "مجموعات المنافسين", en: "Rival supporter groups", fr: "Groupes de supporters rivaux" })}</h2></div>${badge(`${num(Object.keys(save.ultras.groups).length)} ${l({ ar: "مجموعة", en: "groups", fr: "groupes" })}`, "")}</div><p class="muted">${l({ ar: "لكل نادٍ في الدوريات والبطولات المحملة مجموعة فريدة وكابو ومزاج مستقل. يمكن لرئيس الاتحاد تطبيق عقوبة مدرج بعد حادثة موثقة.", en: "Every club in loaded leagues and cups has a distinct group, capo and mood. The association president can sanction a stand after a recorded incident.", fr: "Chaque club des ligues et coupes chargées possède un groupe, un capo et un moral distincts. Le président de la fédération peut sanctionner une tribune après un incident documenté." })}</p><div class="ultras-rival-list">${rows || empty(l({ ar: "لا توجد مجموعات منافسة محملة", en: "No rival groups are loaded", fr: "Aucun groupe rival n’est chargé" }))}</div>${select}</section>`;
}

function activityFeed(save, group) {
  const items = save.ultras.history.filter((item) => !item.clubId || item.clubId === save.clubId).slice(0, 8);
  const social = save.staffCorp?.social?.posts?.filter((post) => String(post.kind).startsWith("ultras-")) || [];
  const socialLabels = {
    "ultras-tifo": { ar: "تيفو جماهيري", en: "Supporter tifo", fr: "Tifo des supporters" },
    "ultras-airport-welcome": { ar: "استقبال صفقة", en: "Signing welcome", fr: "Accueil d’une recrue" },
    "ultras-star-sale": { ar: "رد فعل على بيع نجم", en: "Star-sale reaction", fr: "Réaction à une vente" },
    "ultras-clash": { ar: "حادثة جماهيرية", en: "Supporter incident", fr: "Incident de supporters" },
    "ultras-community-project": { ar: "مبادرة مجتمعية", en: "Community project", fr: "Projet communautaire" },
    "ultras-chant": { ar: "هتاف جماهيري", en: "Supporter chant", fr: "Chant des supporters" },
  };
  return `<section class="panel ultras-activity"><div class="ultras-section-title"><div><span class="eyebrow">${l({ ar: "الإعلام (9) · التواصل الاجتماعي (12)", en: "Media (9) · Social (12)", fr: "Médias (9) · Réseaux sociaux (12)" })}</span><h2>${l({ ar: "صوت المدرج", en: "The stand’s voice", fr: "La voix du virage" })}</h2></div><span class="social-counter">${num(save.staffCorp?.social?.followers || 0)} ${l({ ar: "متابع", en: "followers", fr: "abonnés" })}</span></div><div class="ultras-feed-list">${social.slice(0, 4).map((post) => `<article><i>${icon("inbox", 16)}</i><div><strong>${esc(l(socialLabels[post.kind] || { ar: "خبر جماهيري", en: "Supporter update", fr: "Actualité des supporters" }))}</strong><small>${date(post.date)}</small></div></article>`).join("")}${items.map((item) => { const event = ULTRAS_EVENT_CATALOG.find((entry) => entry.id === item.eventId); const response = event?.choices.find((choice) => choice.id === item.result)?.label; const outcome = response ? l(response) : l({ ar: "تم تسجيل أثر جماهيري", en: "Supporter action recorded", fr: "Action des supporters enregistrée" }); return `<article><i>${icon(item.eventId.includes("clash") ? "shield" : "stadium", 16)}</i><div><strong>${esc(event ? l(event.title) : l({ ar: "خبر جماهيري", en: "Supporter update", fr: "Actualité des supporters" }))}</strong><small>${date(item.date)} · ${esc(outcome)}</small></div></article>`; }).join("") || (!social.length ? empty(l({ ar: "لا توجد أخبار جماهيرية بعد", en: "No supporter updates yet", fr: "Pas encore d’actualité des supporters" })) : "")}</div></section>`;
}

export function ultrasView(save) {
  const group = ultrasGroup(save);
  if (!group) return empty(l({ ar: "مجموعة المشجعين غير متاحة", en: "Supporter group unavailable", fr: "Groupe de supporters indisponible" }));
  const mood = moodLevel(group.mood);
  const capoName = group.capo.name[getLanguage()] || group.capo.name.en;
  const capoPersona = group.capo.personality[getLanguage()] || group.capo.personality.en;
  const away = upcomingUltrasFixtures(save, 21).find((fixture) => fixture.away === save.clubId && !fixture.neutral);
  const chant = upcomingUltrasFixtures(save, 10).some((fixture) => fixture.home === save.clubId || fixture.away === save.clubId);
  const derby = nextDerby(save);
  const bigMatch = upcomingUltrasFixtures(save, 60).find((fixture) => fixture.competition || getDerbyInfo(fixture.home, fixture.away, save).isDerby) || derby;
  const rivals = rivalIds(save);
  const attendance = Math.round(fanAttendanceMultiplier(save, save.clubId) * 100);
  const lastMood = group.moodHistory?.[0];
  return `${heading(l({ ar: "مجموعة فريدة لكل نادٍ · مواقف ومطالب وتيفوهات", en: "A distinct group for every club · choices, demands and tifos", fr: "Un groupe unique par club · choix, demandes et tifos" }), l({ ar: "الجماهير والألتراس", en: "Supporters & Ultras", fr: "Supporters et ultras" }), l({ ar: "صوت المدرج يؤثر في الحضور والإيرادات والمعنويات والاتحاد — من دون التدخل في محرك اللعب إلا بأثر طفيف ومحدد.", en: "The stand affects attendance, revenue, morale and association politics, with only a small, deliberate influence on match performance.", fr: "Le virage influence l’affluence, les recettes, le moral et la fédération, avec un effet limité et ciblé sur les performances." }))}
  <section class="ultras-hero panel"><div class="ultras-hero-copy"><span class="eyebrow">${l({ ar: "مجموعة النادي الرسمية", en: "Official club supporters’ group", fr: "Groupe officiel des supporters" })}</span><h2>${esc(l(group.name))}</h2><p>${l({ ar: "قائد المجموعة", en: "Capo", fr: "Capo" })}: <strong>${esc(capoName)}</strong> · ${esc(capoPersona)}</p><div class="mood-bar"><span class="mood-dot mood-${mood}"></span><strong>${l(MOOD_COPY[mood])}</strong><span>${num(group.mood)} / 100</span></div><div class="mood-track"><i class="mood-fill mood-fill-${mood}" style="width:${group.mood}%"></i></div><small>${lastMood ? `${l({ ar: "آخر تغير", en: "Last movement", fr: "Dernière évolution" })}: ${lastMood.delta > 0 ? "+" : ""}${num(lastMood.delta)} · ${date(lastMood.date)}` : l({ ar: "المزاج يتأثر بالنتائج والأسعار والهوية والاهتمام.", en: "Mood responds to results, prices, identity and owner attention.", fr: "Le moral dépend des résultats, des prix, de l’identité et de l’attention de la direction." })}</small></div><div class="ultras-tifo-badge">${icon("stadium", 38)}<strong>${num(group.tifoCount || 0)}</strong><span>${l({ ar: "تيفو منظم", en: "organized tifos", fr: "tifos organisés" })}</span></div></section>
  <div class="ultras-stat-grid"><article class="ultras-stat"><small>${l({ ar: "تأثير المقاطعة على الحضور", en: "Boycott attendance factor", fr: "Effet du boycott sur l’affluence" })}</small><strong>${num(attendance)}${getLanguage() === "ar" ? "%" : "%"}</strong><span>${group.boycottUntil && group.boycottUntil >= save.date ? l({ ar: "مقاطعة نشطة", en: "Boycott active", fr: "Boycott en cours" }) : l({ ar: "لا توجد مقاطعة نشطة", en: "No active boycott", fr: "Aucun boycott en cours" })}</span></article><article class="ultras-stat"><small>${l({ ar: "الرايات", en: "Banners", fr: "Banderoles" })}</small><strong>${num(group.banners || 0)}</strong><span>${l({ ar: "المسروقة", en: "stolen", fr: "volées" })}: ${num(group.bannersStolen || 0)}</span></article><article class="ultras-stat"><small>${l({ ar: "رحلة خارجية", en: "Away trip", fr: "Déplacement" })}</small><strong>${away ? date(away.date) : "—"}</strong><span>${away ? esc(clubName(away.home)) : l({ ar: "لا توجد رحلة قريبة", en: "No nearby away match", fr: "Aucun déplacement proche" })}</span></article><article class="ultras-stat"><small>${l({ ar: "الديربي المقبل", en: "Next derby", fr: "Prochain derby" })}</small><strong>${derby ? date(derby.date) : "—"}</strong><span>${derby ? esc(clubName(derby.home === save.clubId ? derby.away : derby.home)) : l({ ar: "لا مواجهة خلال 60 يومًا", en: "No derby in 60 days", fr: "Aucun derby dans les 60 jours" })}</span></article></div>
  ${pendingCard(save, group)}
  <div class="ultras-two-column"><div>${demandPanel(save, group)}<section class="panel ultras-actions-panel"><div class="ultras-section-title"><div><span class="eyebrow">${l({ ar: "أفعال اختيارية", en: "Optional actions", fr: "Actions facultatives" })}</span><h2>${l({ ar: "أشعل المدرج", en: "Bring the stand to life", fr: "Faire vibrer le virage" })}</h2></div></div><div class="ultras-action-grid">${button(l({ ar: "تجهيز تيفو لليلة كبيرة", en: "Stage a big-night tifo", fr: "Préparer un tifo pour le grand soir" }), "ultras-tifo", bigMatch?.id || "", "primary", bigMatch ? "" : "disabled")}${button(l({ ar: "رحلة خلف الفريق", en: "Organize away support", fr: "Organiser le déplacement" }), "ultras-away", away?.id || "", "secondary", away ? "" : "disabled")}${button(l({ ar: "إطلاق هتاف", en: "Launch a chant", fr: "Lancer un chant" }), "ultras-chant", "", "secondary", chant ? "" : "disabled")}<p class="muted">${l({ ar: "التيفو يكلف نحو", en: "A tifo costs around", fr: "Un tifo coûte environ" })} ${money(Math.max(180000, Math.round((save.capacity || 20000) * 8)))} · ${l({ ar: "رحلة المشجعين", en: "away coach trip", fr: "le car des supporters" })} ${money(180000)}.</p></div></section></div><div>${rivalPanel(save, rivals)}${activityFeed(save, group)}</div></div>
  ${infoNote(l({ ar: "المطالب تنشأ مع انخفاض المزاج أو الإهمال، وتُمنح مهلة ثم تتصاعد إلى مقاطعة أو إضراب أو احتجاج أو غرامة عند التجاهل. حملات الضغط على الغريم تزيد مؤشر الشبهات. التغييرات محاكاة داخل الحفظة.", en: "Demands emerge when mood falls or the group is neglected. They have a deadline, then can escalate into boycotts, chant strikes, protests or fines. Rival-pressure campaigns raise suspicion. All effects are simulated in this save.", fr: "Les demandes apparaissent lorsque le moral baisse ou que le groupe est négligé. Après un délai, elles peuvent entraîner boycott, grève des chants, manifestation ou amende. Les campagnes contre un rival augmentent les soupçons. Tous les effets restent simulés dans cette sauvegarde." }))}`;
}
