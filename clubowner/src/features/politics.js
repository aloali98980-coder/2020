import { POLITICAL_BLOCS, CLUB_DEMANDS } from "../data/politicsCatalog.js";
import { POLITICAL_LAW_LIST, POLITICAL_LAWS } from "../data/politicsLaws.js";
import {
  COMMITTEE_POLICIES,
  POLITICAL_OFFICIALS,
  POLITICAL_SPONSORS,
  POLITICAL_TOURNAMENTS,
} from "../data/politicsCommittees.js";
import {
  FOREIGN_ORGANIZATIONS,
  HOSTING_EVENTS,
  INTEGRITY_SUBJECTS,
  LEGACY_TITLES,
  OPPOSITION_RESPONSES,
} from "../data/politicsGovernance.js";
import {
  POLITICAL_EVENT_BY_ID,
  POLITICAL_EVENTS,
} from "../data/politicsEvents.js";
import { committeeChair } from "../services/politics/committees.js";
import { financeSummary } from "../services/politics/associationFinance.js";
import { extendedClub } from "../data/expandedCatalog.js";
import {
  heading,
  badge,
  statCard,
  progress,
  infoNote,
  empty,
} from "../components/shared.js";
import { icon } from "../components/icons.js";
import { getLanguage, tr } from "../i18n/index.js";
import { blocSummary, politicalSentiment } from "../services/politics/state.js";
import {
  campaignStatus,
  isCampaignActive,
} from "../services/politics/campaign.js";
import { esc, money, num, date } from "../ui/format.js";

const local = (value) => value?.[getLanguage()] || value?.en || value || "";
const tabs = [
  ["overview", ["نظرة عامة", "Overview", "Vue d’ensemble"]],
  ["map", ["الخريطة السياسية", "Political map", "Carte politique"]],
  [
    "campaign",
    ["الحملة والانتخابات", "Campaign & election", "Campagne et élection"],
  ],
  ["council", ["المجلس والقوانين", "Council & laws", "Conseil et lois"]],
  [
    "committees",
    ["اللجان والبطولات", "Committees & cups", "Commissions et coupes"],
  ],
  [
    "opposition",
    [
      "المعارضة والشرعية",
      "Opposition & legitimacy",
      "Opposition et légitimité",
    ],
  ],
  ["foreign", ["العلاقات الخارجية", "Foreign affairs", "Affaires étrangères"]],
  ["legacy", ["الفترات والإرث", "Terms & legacy", "Mandats et héritage"]],
  ["events", ["الأحداث السياسية", "Political events", "Événements politiques"]],
];
const button = (label, action, id = "", tone = "secondary", disabled = false) =>
  `<button class="btn ${tone}" data-action="${action}" data-id="${esc(id)}" ${disabled ? "disabled" : ""}>${label}</button>`;
const partyName = (p, id) =>
  local(p.candidates.find((candidate) => candidate.id === id)?.name) || id;

function summaryCards(s) {
  const p = s.politics;
  const blocs = blocSummary(s);
  const weight = p.clubs.reduce((n, club) => n + club.voteWeight, 0);
  const weighted = p.clubs.reduce(
    (n, club) => n + club.support * club.voteWeight,
    0,
  );
  const status = campaignStatus(s);
  return `<div class="stats-grid politics-stats">
    ${statCard(tr("المنصب", "Office", "Fonction"), p.office.held ? tr("رئيس الاتحاد", "Association president", "Président de la fédération") : tr("مالك نادٍ / مرشح", "Club owner / candidate", "Propriétaire / candidat"), "", p.office.held ? tr("ولاية قائمة", "Incumbent", "Mandat en cours") : tr("خريطة محايدة عند التأسيس", "Neutral starting map", "Carte neutre au départ"), "crown", p.office.held ? "green" : "gold")}
    ${statCard(tr("الشرعية", "Legitimacy", "Légitimité"), num(Math.round(p.legitimacy)), "/ 100", tr("ثقة الأندية والمؤسسات", "Club and institutional confidence", "Confiance des clubs et institutions"), "shield", p.legitimacy >= 60 ? "green" : "gold")}
    ${statCard(tr("الدورة الانتخابية", "Election cycle", "Cycle électoral"), num(p.election.season), tr("الموسم", "Season", "Saison"), status.active ? tr("الحملة جارية", "Campaign active", "Campagne en cours") : tr("كل أربع مواسم", "Every four seasons", "Tous les quatre saisons"), "calendar", status.active ? "green" : "")}
    ${statCard(tr("قوة الأصوات", "Voting weight", "Poids électoral"), num(weight), tr("صوتًا موزونًا", "weighted votes", "voix pondérées"), `${tr("التأييد الموزون", "Weighted support", "Soutien pondéré")}: ${num(weight ? Math.round(weighted / weight) : 0)}٪`, "chart", "gold")}
  </div>${blocs.map((b) => `<div class="politics-bloc-chip"><b>${esc(local(b.label))}</b><span>${num(b.clubs)} ${tr("أندية", "clubs", "clubs")} · ${num(b.weight)} ${tr("أصوات", "votes", "voix")}</span><span>${num(b.support)}٪</span></div>`).join("")}`;
}

function clubName(clubId) {
  return extendedClub(clubId)?.name || clubId;
}

function mapView(s) {
  const p = s.politics;
  const clubs = [...p.clubs].sort(
    (a, b) =>
      a.bloc.localeCompare(b.bloc) ||
      b.support - a.support ||
      clubName(a.clubId).localeCompare(clubName(b.clubId)),
  );
  const lines = clubs
    .map((club) => {
      const sentiment = politicalSentiment(club.support);
      const demand = CLUB_DEMANDS[club.demandId];
      const coalition = p.alliances.find(
        (alliance) => alliance.id === club.allianceId,
      );
      return `<article class="politics-club-card">
      <div class="politics-club-title"><strong>${esc(clubName(club.clubId))}</strong><span class="badge ${sentiment === "supporter" ? "green" : sentiment === "opponent" ? "red" : "gold"}">${sentiment === "supporter" ? tr("مؤيد", "Supporter", "Soutien") : sentiment === "opponent" ? tr("معارض", "Opponent", "Opposition") : tr("محايد", "Neutral", "Neutre")}</span></div>
      <div class="politics-meter">${progress(Math.round(club.support))}<b>${num(Math.round(club.support))}٪</b></div>
      <div class="politics-club-meta"><span>${esc(local(POLITICAL_BLOCS[club.bloc]))}</span><span>${num(club.voteWeight)} ${tr("أصوات", "votes", "voix")}</span></div>
      <small class="muted">${tr("المطلب الخاص", "Special demand", "Demande spéciale")}: ${esc(local(demand?.label || "—"))}</small>
      ${coalition ? `<small class="politics-alliance-label">${icon("users", 14)} ${esc(coalition.name)}</small>` : ""}
      <div class="politics-club-actions">${button(`${icon("handshake", 15)} ${tr("زيارة النادي", "Visit club", "Visiter le club")}`, "politics-visit", club.clubId, "soft", !isCampaignActive(s) || !p.campaign.playerEligible || p.campaign.visits.some((visit) => visit.clubId === club.clubId))}${button(`${icon("scroll", 15)} ${tr("تسجيل وعد", "Make a promise", "Prendre un engagement")}`, "politics-promise", club.clubId, "ghost", !isCampaignActive(s) || !p.campaign.playerEligible || p.campaign.promises.some((promise) => promise.clubId === club.clubId && promise.demandId === club.demandId))}</div>
    </article>`;
    })
    .join("");
  const coalitionButtons = Object.entries(POLITICAL_BLOCS)
    .map(([bloc, label]) => {
      const members = p.clubs
        .filter((club) => club.bloc === bloc)
        .map((club) => club.clubId);
      return button(
        `${tr("تكوين تكتل", "Form bloc", "Former un bloc")} · ${esc(local(label))}`,
        "politics-form-bloc",
        bloc,
        "secondary",
        members.length < 2,
      );
    })
    .join("");
  return `${heading(tr("مواقف كل أندية الدوري", "Every league club's position", "Position de chaque club du championnat"), tr("خريطة الأصوات", "The vote map", "La carte des votes"), tr("الموقف ٠–١٠٠، الوزن التصويتي، المطلب الخاص والتكتل. الزيارات والوعود والمفاوضات تغيّر الخريطة وتبقى محفوظة.", "Support from 0–100, voting weight, special demand, and bloc. Visits, promises, and negotiations change the map and are saved.", "Soutien de 0 à 100, poids du vote, demande spéciale et bloc. Visites, promesses et négociations modifient la carte et sont enregistrées."))}
    <section class="panel"><div class="panel-head"><h3>${icon("users")} ${tr("التكتلات الإقليمية", "Club blocs", "Blocs de clubs")}</h3></div><div class="politics-bloc-actions">${coalitionButtons}</div></section>
    <div class="politics-club-grid">${lines || empty(tr("لا توجد أندية في الخريطة", "No clubs on the map", "Aucun club sur la carte"), "", "users")}</div>`;
}

function candidateCard(s, candidate) {
  const relation = Math.round(candidate.relationship);
  const alliance = candidate.endorsedPlayer;
  const club = candidate.clubId ? clubName(candidate.clubId) : null;
  return `<article class="politics-candidate-card ${alliance ? "endorsed" : ""}">
    <div class="politics-candidate-top"><span class="politics-candidate-avatar">${esc(local(candidate.name).slice(0, 1))}</span><div><strong>${esc(local(candidate.name))}</strong><small>${esc(local(candidate.party))}</small></div>${badge(esc(local(candidate.profile)), candidate.traits.includes("corrupt") ? "red" : candidate.traits.includes("competent") ? "green" : "gold")}</div>
    <p>${esc(local(candidate.biography))}</p>
    <div class="politics-candidate-metrics"><span>${tr("الشعبية", "Popularity", "Popularité")} <b>${num(candidate.popularity)}</b></span><span>${tr("الكفاءة", "Competence", "Compétence")} <b>${num(candidate.competence)}</b></span><span>${tr("العلاقة بك", "Your relationship", "Relation avec vous")} <b>${num(relation)}</b></span></div>
    ${club ? `<small class="politics-rival-club">${tr("رئيس النادي المنافس", "President of rival club", "Président du club rival")}: ${esc(club)}</small>` : ""}
    ${alliance ? `<span class="badge green">${tr("تحالف انتخابي معلن", "Public electoral alliance", "Alliance électorale publique")}</span>` : button(tr("اقتراح تحالف", "Propose alliance", "Proposer une alliance"), "politics-alliance", candidate.id, "soft", !isCampaignActive(s) || !s.politics.campaign.playerEligible || candidate.withdrawn)}
  </article>`;
}

function campaignView(s) {
  const p = s.politics;
  const status = campaignStatus(s);
  const poll = p.campaign.polls.at(-1);
  const campaignControls =
    status.active && !p.campaign.playerEligible
      ? `<section class="panel politics-campaign-panel"><div class="panel-head"><h3>${icon("shield")} ${tr("الحد الدستوري للولايات", "Constitutional term limit", "Limite constitutionnelle des mandats")}</h3>${badge(tr("غير مؤهل للترشح", "Not eligible to run", "Inéligible"), "red")}</div><p>${tr("بلغت الحد الأقصى لولايتين. يستمر الاقتراع العلني بين المنافسين، لكن لا يمكنك تمويل الحملة أو تقديم الوعود أو التفاوض باسم مرشح.", "You have reached the two-term limit. The public election proceeds among the rivals, but you cannot fund a campaign, make promises, or negotiate as a candidate.", "Vous avez atteint la limite de deux mandats. Le vote public se poursuit entre les adversaires, mais vous ne pouvez ni financer une campagne, ni prendre des engagements, ni négocier comme candidat.")}</p></section>`
      : status.active
        ? `<section class="panel politics-campaign-panel"><div class="panel-head"><h3>${icon("megaphone")} ${tr("نشاط الحملة", "Campaign actions", "Actions de campagne")}</h3><span class="badge green">${tr("موسم كامل", "Full season", "Saison complète")}</span></div>
    <p class="muted">${tr("الزيارات والمؤتمرات تُموّل من ثروتك الشخصية. الوعود لها مطلب محدد وستُحاسب عند التصويت.", "Visits and conferences are funded from personal wealth. Promises name a specific demand and are reviewed at election time.", "Les visites et conférences sont financées par votre fortune personnelle. Chaque engagement correspond à une demande vérifiable.")}</p>
    <div class="politics-actions-row">${Object.entries(POLITICAL_BLOCS)
      .map(([bloc, label]) =>
        button(
          `${tr("مؤتمر", "Conference", "Conférence")} · ${esc(local(label))} (${money(650000)})`,
          "politics-conference",
          bloc,
          "secondary",
          p.campaign.conferences.some(
            (item) => item.key === `${s.date.slice(0, 7)}:${bloc}`,
          ),
        ),
      )
      .join("")}</div>
    <form class="politics-fund-form" id="politics-campaign-fund"><label class="field"><span>${tr("تمويل شخصي معلن", "Declared personal funding", "Financement personnel déclaré")}</span><input id="politics-fund-input" name="amount" type="number" min="1000000" max="25000000" step="1000000" value="5000000" required></label><button type="submit" class="btn primary">${tr("تمويل الحملة", "Fund campaign", "Financer la campagne")}</button><small>${tr("الحد الأقصى التراكمي", "Cumulative campaign ceiling", "Plafond cumulé")}: ${money(100000000)} ${tr("المتاح", "used", "utilisé")}: ${money(p.campaign.funds)}</small></form>
    <form class="politics-debate-form" id="politics-debate-form"><label class="field"><span>${tr("المنافس في المناظرة", "Debate opponent", "Adversaire du débat")}</span><select name="candidateId">${p.candidates
      .filter((candidate) => !candidate.withdrawn && !candidate.endorsedPlayer)
      .map(
        (candidate) =>
          `<option value="${candidate.id}">${esc(local(candidate.name))}</option>`,
      )
      .join(
        "",
      )}</select></label><label class="field"><span>${tr("النهج", "Strategy", "Stratégie")}</span><select name="strategy"><option value="policy">${tr("برنامج وسياسات", "Policy", "Programme")}</option><option value="attack">${tr("مواجهة الفساد", "Challenge corruption", "Dénoncer la corruption")}</option><option value="unity">${tr("وحدة الصف", "Unity", "Unité")}</option></select></label><button type="submit" class="btn primary" ${p.campaign.debate ? "disabled" : ""}>${tr("إجراء المناظرة العلنية", "Hold the public debate", "Tenir le débat public")}</button></form>
    ${p.campaign.debate ? `<div class="politics-debate-result ${p.campaign.debate.result}"><b>${tr("نتيجة المناظرة", "Debate result", "Résultat du débat")}: ${p.campaign.debate.result === "strong" ? tr("أداء قوي", "Strong performance", "Bonne prestation") : p.campaign.debate.result === "close" ? tr("تقارب", "Close", "Serré") : tr("مناظرة كارثية", "Disastrous debate", "Débat catastrophique")}</b><span>${num(p.campaign.debate.margin)} ${tr("نقطة فارق", "point margin", "points d’écart")}</span></div>` : ""}
  </section>`
        : `<section class="panel politics-campaign-panel"><div class="panel-head"><h3>${icon("calendar")} ${tr("موعد الحملة القادمة", "Next campaign", "Prochaine campagne")}</h3>${badge(tr("مجدولة", "Scheduled", "Programmée"), "gold")}</div><p>${tr("أول انتخابات قادمة في الموسم", "The next election is in season", "La prochaine élection aura lieu à la saison")} <b>${num(p.election.season)}</b>. ${tr("تبدأ الحملة الكاملة مع بداية ذلك الموسم.", "The full-season campaign begins at the start of that season.", "La campagne complète commence au début de cette saison.")}</p></section>`;
  const pollCard = poll
    ? `<section class="panel politics-poll-panel"><div class="panel-head"><h3>${icon("chart")} ${tr("استطلاع الشهر", "Monthly poll", "Sondage mensuel")}</h3><small>${date(poll.date)}</small></div><div class="politics-poll-list"><div><strong>${tr("أنت", "You", "Vous")}</strong>${progress(Math.round(poll.shares.player || 0))}<b>${num(poll.shares.player || 0)}٪</b></div>${p.candidates.map((candidate) => `<div><strong>${esc(local(candidate.name))}</strong>${progress(Math.round(poll.shares[candidate.id] || 0))}<b>${num(poll.shares[candidate.id] || 0)}٪</b></div>`).join("")}</div></section>`
    : "";
  const promises = p.campaign.promises.length
    ? `<section class="panel"><div class="panel-head"><h3>${icon("scroll")} ${tr("سجل الوعود", "Promise register", "Registre des engagements")}</h3><span class="badge outline">${num(p.campaign.promises.length)}</span></div><div class="politics-promise-list">${p.campaign.promises.map((promise) => `<div><b>${esc(clubName(promise.clubId))}</b><span>${esc(local(CLUB_DEMANDS[promise.demandId]?.label))}</span>${badge(promise.status === "fulfilled" ? tr("منفذ", "Fulfilled", "Tenu") : promise.status === "broken" ? tr("مكسور", "Broken", "Non tenu") : tr("قيد المحاسبة", "Pending review", "À vérifier"), promise.status === "fulfilled" ? "green" : promise.status === "broken" ? "red" : "gold")}</div>`).join("")}</div></section>`
    : "";
  return `${heading(tr("موسم الحملة", "Campaign season", "Saison de campagne"), tr("انتخابات رئاسة الاتحاد", "Association presidency election", "Élection à la présidence de la fédération"), tr("ثلاث شخصيات سياسية ثابتة، زيارات، مؤتمرات، تعهدات، مناظرة واستطلاعات شهرية. التصويت سريّ؟ لا: تُنشر بطاقة الاقتراع بأسماء الأندية وأوزانها.", "Three persistent political rivals, club visits, conferences, promises, a public debate, and monthly polls. The vote is not secret: every club and its weight appear on the public ballot.", "Trois adversaires politiques récurrents, visites, conférences, engagements, débat public et sondages mensuels. Le vote est nominatif : chaque club et son poids sont publiés."))}
    ${campaignControls}<section class="politics-candidates-grid">${p.candidates.map((candidate) => candidateCard(s, candidate)).join("")}</section>${pollCard}${promises}`;
}

function councilView(s) {
  const p = s.politics;
  const summary = financeSummary(s);
  const activeBill = p.council.currentBill;
  const activeLaw = activeBill ? POLITICAL_LAWS[activeBill.lawId] : null;
  const openForDebate =
    activeBill && ["debate", "voting"].includes(activeBill.status);
  const active = new Set(p.clubs.map((club) => club.clubId));
  const categoryName = (category) =>
    ({
      finance: tr("مالية", "Finance", "Finances"),
      governance: tr("حوكمة", "Governance", "Gouvernance"),
      sport: tr("رياضية", "Sport", "Sport"),
      constitution: tr(
        "تعديل دستوري",
        "Constitutional amendment",
        "Amendement constitutionnel",
      ),
    })[category] || category;
  const lawCards = POLITICAL_LAW_LIST.map((law) => {
    const enacted = p.council.laws[law.id];
    const inDebate = activeBill?.lawId === law.id && openForDebate;
    const history = p.council.history.find((item) => item.lawId === law.id);
    const state = enacted
      ? badge(tr("نافذة", "In force", "En vigueur"), "green")
      : inDebate
        ? badge(tr("قيد المداولة", "Under debate", "En débat"), "gold")
        : history?.passed === false
          ? badge(tr("مرفوضة", "Rejected", "Rejetée"), "red")
          : badge(tr("مقترحة", "Available", "Disponible"), "outline");
    return `<article class="politics-law-card"><div class="politics-law-title"><div><small>${esc(categoryName(law.category))}</small><h4>${esc(local(law.title))}</h4></div>${state}</div><p>${esc(local(law.summary))}</p><small class="muted">${tr("الأثر المتوقع", "Expected reaction", "Réaction attendue")}: ${esc(local(law.reaction.passed))}</small>${button(`${icon("scroll", 15)} ${tr("تقديم للمجلس", "Introduce bill", "Présenter le texte")}`, "politics-propose-law", law.id, "secondary", !p.office.held || Boolean(openForDebate) || Boolean(enacted))}</article>`;
  }).join("");
  const currentBillPanel = activeBill
    ? `<section class="panel politics-bill-panel"><div class="panel-head"><div><small>${tr("مشروع اللائحة", "Bill before the council", "Texte soumis au conseil")}</small><h3>${esc(local(activeLaw?.title))}</h3></div>${badge(activeBill.status === "debate" ? tr("مداولة", "Debate", "Débat") : activeBill.status === "passed" ? tr("مُقرة", "Passed", "Adoptée") : activeBill.status === "rejected" ? tr("مرفوضة", "Rejected", "Rejetée") : tr("تصويت", "Voting", "Vote"), activeBill.status === "passed" ? "green" : activeBill.status === "rejected" ? "red" : "gold")}</div><p>${esc(local(activeLaw?.summary))}</p>${openForDebate ? `<form id="politics-bargain-form" class="politics-bargain-form"><input type="hidden" name="billId" value="${esc(activeBill.id)}"><label class="field"><span>${tr("النادي للتفاوض", "Negotiate with club", "Négocier avec le club")}</span><select name="clubId" required>${p.clubs.map((club) => `<option value="${esc(club.clubId)}" ${activeBill.lobby.some((item) => item.clubId === club.clubId) ? "disabled" : ""}>${esc(clubName(club.clubId))} · ${esc(local(POLITICAL_BLOCS[club.bloc]))}</option>`).join("")}</select></label><label class="field"><span>${tr("عرض المجلس", "Council offer", "Proposition du conseil")}</span><select name="offer"><option value="policy-concession">${tr("تبنّي مطلب النادي", "Adopt the club's demand", "Adopter la demande du club")}</option><option value="public-case">${tr("شرح علني لأثر اللائحة", "Public policy case", "Argumentaire public sur la loi")}</option><option value="development-grant">${tr("منحة تطوير معلنة", "Declared development grant", "Aide au développement déclarée")}</option></select></label><label class="field"><span>${tr("مبلغ المنحة عند اختيارها", "Grant amount, if selected", "Montant de l’aide, si sélectionnée")}</span><input name="amount" type="number" min="100000" max="10000000" step="100000" value="1000000"></label><button class="btn soft" type="submit">${tr("تسجيل التفاوض", "Record negotiation", "Enregistrer la négociation")}</button></form><div class="politics-bill-actions">${button(`${icon("check", 15)} ${tr("إجراء اقتراع علني", "Hold public vote", "Organiser le vote public")}`, "politics-vote-bill", activeBill.id, "primary")}</div>` : activeBill.outcome ? `<div class="politics-vote-result"><div><b>${num(activeBill.outcome.yesWeight)} / ${num(activeBill.outcome.totalWeight)}</b><span>${tr("أصوات مؤيدة", "weighted votes in favour", "voix pondérées pour")}</span></div><div><b>${num(activeBill.outcome.noWeight)}</b><span>${tr("أصوات معارضة", "weighted votes against", "voix pondérées contre")}</span></div><div><b>${num(activeBill.outcome.threshold)}٪</b><span>${tr("نصاب الإقرار", "pass threshold", "seuil d’adoption")}</span></div></div><div class="politics-dissent-list"><b>${tr("الأندية التي صوّتت ضدك", "Clubs that voted against you", "Clubs ayant voté contre vous")}</b><div>${activeBill.outcome.dissentIds.map((id) => `<span>${esc(clubName(id))}</span>`).join("") || `<span>${tr("لم يسجل المجلس أصواتًا معارضة.", "No opposing votes were recorded.", "Aucun vote contre n’a été enregistré.")}</span>`}</div></div><p class="muted">${esc(local(activeLaw?.reaction[activeBill.outcome.passed ? "passed" : "rejected"]))}</p>` : ""}</section>`
    : `<section class="panel politics-bill-panel"><div class="panel-head"><h3>${icon("scroll")} ${tr("لا يوجد مشروع مفتوح", "No bill is before the council", "Aucun texte n’est soumis au conseil")}</h3>${badge(tr("جدول الأعمال متاح", "Agenda open", "Ordre du jour ouvert"), "outline")}</div><p>${tr("اختر لائحة من الكتالوج لبدء المداولة والتفاوض ثم إجراء اقتراع علني بالأوزان والأسماء.", "Choose a law from the catalogue to begin debate and bargaining, then hold a named, weighted public vote.", "Choisissez un texte du catalogue pour ouvrir le débat et la négociation, puis organiser un vote public nominatif et pondéré.")}</p></section>`;
  const recentVotes = p.council.voteLog
    .slice(-5)
    .reverse()
    .map(
      (vote) =>
        `<article class="politics-vote-log-item"><div><b>${esc(local(POLITICAL_LAWS[vote.lawId]?.title || vote.lawId))}</b><small>${date(vote.date)} · ${tr("الموسم", "Season", "Saison")} ${num(vote.season)}</small></div><span>${vote.passed ? badge(tr("مُقرة", "Passed", "Adoptée"), "green") : badge(tr("مرفوضة", "Rejected", "Rejetée"), "red")}</span><small>${tr("المعارضون", "Opposed", "Opposition")}: ${vote.dissentIds.map((id) => esc(clubName(id))).join("، ") || tr("لا أحد", "None", "Aucun")}</small></article>`,
    )
    .join("");
  const accountRows = p.clubs
    .slice()
    .sort(
      (a, b) =>
        (summary.accounts[b.clubId]?.totalReceived || 0) -
        (summary.accounts[a.clubId]?.totalReceived || 0),
    )
    .map(
      (club) =>
        `<tr><td>${esc(clubName(club.clubId))}</td><td>${esc(local(POLITICAL_BLOCS[club.bloc]))}</td><td>${money(summary.accounts[club.clubId]?.balance || 0)}</td><td>${money(summary.accounts[club.clubId]?.totalReceived || 0)}</td></tr>`,
    )
    .join("");
  const distributionRows = p.finance.distributions
    .slice(-4)
    .reverse()
    .map(
      (item) =>
        `<div class="politics-finance-log"><span>${esc(item.type === "broadcast" ? tr("توزيع البث", "Broadcast distribution", "Répartition TV") : item.type === "solidarity" ? tr("تضامن", "Solidarity", "Solidarité") : tr("تطوير الناشئين", "Youth development", "Développement des jeunes"))} · ${tr("الموسم", "Season", "Saison")} ${num(item.season)}</span><b>${money(item.total)}</b></div>`,
    )
    .join("");
  const fundRows = p.finance.funds
    .slice()
    .reverse()
    .map(
      (fund) =>
        `<div class="politics-finance-log"><span>${esc(fund.name)} · ${num(fund.grants.length)} ${tr("منح", "grants", "aides")}</span><b>${money(fund.remaining)} / ${money(fund.amount)}</b></div>`,
    )
    .join("");
  const audit = summary.lastAudit;
  const auditPanel = audit
    ? `<div class="politics-audit-result ${audit.status}"><b>${audit.status === "clean" ? tr("الحسابات متطابقة", "Accounts reconcile", "Comptes rapprochés") : tr("فرق يحتاج إلى مراجعة", "Discrepancy requires review", "Écart à examiner")}</b><span>${tr("الخزينة", "Treasury", "Trésorerie")}: ${money(audit.balance)} · ${tr("الرصيد الدفتري", "Ledger balance", "Solde comptable")}: ${money(audit.ledgerBalance)}${audit.discrepancy ? ` · ${tr("الفرق", "Difference", "Écart")}: ${money(audit.discrepancy)}` : ""}</span><small>${tr("بنود راجعها المدقق", "Entries reviewed", "Écritures vérifiées")}: ${num(audit.entriesReviewed)} · ${date(audit.date)}</small></div>`
    : `<p class="muted">${tr("لم تجرِ مراجعة مالية بعد؛ تُراجع الحسابات تلقائيًا عند إقفال الموسم.", "No financial review yet; accounts are audited automatically at season close.", "Aucun audit pour le moment ; les comptes sont contrôlés automatiquement à la clôture de la saison.")}</p>`;
  const financePanel = `<section class="panel politics-finance-panel"><div class="panel-head"><div><small>${tr("ميزانية الاتحاد", "Association budget", "Budget de la fédération")}</small><h3>${tr("البث والمنح والمراجعة المالية", "Broadcast, grants and financial review", "Droits TV, aides et audit financier")}</h3></div>${badge(p.finance.publicDisclosure ? tr("إفصاح عام", "Public disclosure", "Publication publique") : tr("سجل المجلس", "Council register", "Registre du conseil"), p.finance.publicDisclosure ? "green" : "gold")}</div><div class="stats-grid politics-finance-stats">${statCard(tr("الخزينة", "Treasury", "Trésorerie"), money(summary.balance), "", tr("رصيد الاتحاد المتاح", "Available association balance", "Solde disponible de la fédération"), "wallet", "gold")}${statCard(tr("حقوق البث", "Broadcast pool", "Droits TV"), money(summary.tvPool), "", tr("إجمالي التوزيع السنوي", "Annual distribution pool", "Enveloppe annuelle"), "chart", "green")}${statCard(tr("المراجعة الأخيرة", "Last audit", "Dernier audit"), audit ? date(audit.date) : tr("لم تبدأ", "Not yet", "Pas encore"), "", audit?.status === "clean" ? tr("مطابقة", "Reconciled", "Rapprochée") : tr("مراجعة موسمية", "Seasonal review", "Audit saisonnier"), "shield", audit?.status === "clean" ? "green" : "gold")}</div><div class="politics-formula"><b>${tr("معادلة توزيع البث", "Broadcast distribution formula", "Formule de répartition TV")}</b><span>${tr("الأداء", "Performance", "Performance")} ${num(summary.formula.performance)}٪ · ${tr("الشعبية", "Popularity", "Popularité")} ${num(summary.formula.popularity)}٪ · ${tr("التساوي", "Equality", "Égalité")} ${num(summary.formula.equality)}٪</span></div><div class="politics-finance-columns"><div><h4>${tr("أرصدة الأندية", "Club accounts", "Comptes des clubs")}</h4><div class="table-wrap"><table><thead><tr><th>${tr("النادي", "Club", "Club")}</th><th>${tr("التكتل", "Bloc", "Bloc")}</th><th>${tr("الرصيد", "Balance", "Solde")}</th><th>${tr("إجمالي المستلم", "Total received", "Total reçu")}</th></tr></thead><tbody>${accountRows}</tbody></table></div></div><div><h4>${tr("آخر التوزيعات", "Recent distributions", "Dernières répartitions")}</h4>${distributionRows || empty(tr("لا توجد توزيعات بعد", "No distributions yet", "Aucune répartition"), "", "chart")}<h4>${tr("صناديق الدعم", "Support funds", "Fonds de soutien")}</h4>${fundRows || empty(tr("لا توجد صناديق دعم", "No support funds", "Aucun fonds de soutien"), "", "wallet")}</div></div><div class="politics-support-fund-controls"><form id="politics-support-fund-form"><h4>${tr("إنشاء صندوق دعم", "Create a support fund", "Créer un fonds de soutien")}</h4><label class="field"><span>${tr("اسم الصندوق", "Fund name", "Nom du fonds")}</span><input name="name" maxlength="60" value="${tr("صندوق تضامن الأندية", "Club solidarity fund", "Fonds de solidarité des clubs")}" required></label><label class="field"><span>${tr("المبلغ", "Amount", "Montant")}</span><input name="amount" type="number" min="1000000" max="50000000" step="1000000" value="5000000" required></label><label class="field"><span>${tr("الأهلية", "Eligibility", "Éligibilité")}</span><select name="criteria"><option value="small">${tr("الأندية الصغيرة فقط", "Smaller clubs only", "Petits clubs uniquement")}</option><option value="regional">${tr("الإقليمية والصغيرة", "Regional and smaller clubs", "Clubs régionaux et modestes")}</option><option value="all">${tr("كل الأندية", "All clubs", "Tous les clubs")}</option></select></label><button class="btn secondary" type="submit" ${p.office.held ? "" : "disabled"}>${tr("حجز المبلغ من الخزينة", "Reserve from treasury", "Réserver sur la trésorerie")}</button></form><form id="politics-support-grant-form"><h4>${tr("صرف منحة", "Award a grant", "Attribuer une aide")}</h4><label class="field"><span>${tr("الصندوق", "Fund", "Fonds")}</span><select name="fundId" required>${p.finance.funds
    .filter((fund) => fund.status === "open")
    .map(
      (fund) =>
        `<option value="${esc(fund.id)}">${esc(fund.name)} · ${money(fund.remaining)}</option>`,
    )
    .join(
      "",
    )}</select></label><label class="field"><span>${tr("النادي", "Club", "Club")}</span><select name="clubId" required>${p.clubs.map((club) => `<option value="${esc(club.clubId)}">${esc(clubName(club.clubId))}</option>`).join("")}</select></label><label class="field"><span>${tr("المبلغ", "Amount", "Montant")}</span><input name="amount" type="number" min="100000" step="100000" value="1000000" required></label><button class="btn secondary" type="submit" ${p.office.held && p.finance.funds.some((fund) => fund.status === "open") ? "" : "disabled"}>${tr("صرف المنحة", "Award grant", "Verser l’aide")}</button></form></div><div class="politics-audit-area"><div><h4>${tr("مراجعة مالية", "Financial review", "Audit financier")}</h4>${auditPanel}</div>${button(`${icon("shield", 15)} ${tr("إجراء مراجعة الآن", "Run financial audit", "Lancer l’audit")}`, "politics-financial-audit", "", "secondary", !p.office.held)}</div></section>`;
  return `${heading(tr("أعمال المجلس", "Council business", "Travaux du conseil"), tr("القوانين والميزانية العامة", "Legislation and public finance", "Législation et finances publiques"), tr("قدّم اللوائح، فاوض الأندية علنًا، ثم سجّل اقتراعًا موزونًا بأسماء المؤيدين والمعارضين. تُوزع عائدات البث وتُراجع حسابات الاتحاد كل موسم.", "Introduce laws, negotiate openly with clubs, then log a named weighted vote. Broadcast revenue is distributed and association accounts are audited each season.", "Présentez des lois, négociez ouvertement avec les clubs, puis consignez un vote nominatif pondéré. Les droits TV sont répartis et les comptes contrôlés chaque saison."))}${!p.office.held ? `<section class="panel politics-coming"><h3>${tr("أدوات المجلس متاحة بعد انتخابك", "Council powers unlock after election", "Les pouvoirs du conseil s’ouvrent après l’élection")}</h3><p>${tr("يمكنك الاطلاع على كتالوج القوانين والميزانية التأسيسية الآن؛ تقديم اللوائح والمنح والمراجعات اليدوية يتطلب تولي المنصب.", "You can review the law catalogue and opening budget now; proposing bills, grants and manual audits requires holding office.", "Vous pouvez consulter le catalogue et le budget initial ; proposer des textes, aides et audits manuels exige d’être en fonction.")}</p></section>` : ""}${currentBillPanel}<section class="politics-law-grid">${lawCards}</section><section class="panel politics-vote-log"><div class="panel-head"><h3>${icon("history")} ${tr("سجل التصويت العلني", "Public vote ledger", "Registre des votes publics")}</h3><span class="badge outline">${num(p.council.voteLog.length)}</span></div>${recentVotes || empty(tr("لم يصوت المجلس على لوائح بعد", "The council has not voted on any bills yet", "Le conseil n’a encore voté aucun texte"), "", "history")}</section>${financePanel}`;
}

function committeeView(s) {
  const p = s.politics;
  const committees = p.committees;
  const labels = {
    referees: tr(
      "لجنة الحكام",
      "Referees committee",
      "Commission des arbitres",
    ),
    discipline: tr(
      "لجنة الانضباط",
      "Disciplinary committee",
      "Commission disciplinaire",
    ),
    competitions: tr(
      "لجنة المسابقات",
      "Competitions committee",
      "Commission des compétitions",
    ),
  };
  const policyNames = {
    balanced: tr("متوازن", "Balanced", "Équilibré"),
    strict: tr("حازم", "Strict", "Strict"),
    lenient: tr("مرن", "Lenient", "Clément"),
    standard: tr("تقليدي", "Standard", "Standard"),
    "rest-first": tr(
      "أولوية راحة اللاعبين",
      "Player-rest first",
      "Priorité au repos",
    ),
    commercial: tr(
      "ملائم للبث والرعاية",
      "Broadcast and sponsor friendly",
      "Adapté aux médias et sponsors",
    ),
  };
  const committeeCards = ["referees", "discipline", "competitions"]
    .map((id) => {
      const committee = committees[id];
      const chair = committeeChair(committees, id);
      const policyKey =
        id === "discipline"
          ? "strictness"
          : id === "competitions"
            ? "calendar"
            : "policy";
      const nominees = POLITICAL_OFFICIALS.filter((official) =>
        official.roles.includes(id),
      );
      return `<article class="politics-committee-card"><div class="panel-head"><div><small>${esc(labels[id])}</small><h3>${chair ? esc(local(chair.name)) : tr("مقعد شاغر", "Vacant seat", "Post vacant")}</h3></div>${badge(chair ? `${num(chair.competence)} ${tr("خبرة", "skill", "compétence")}` : tr("لم يُعيّن رئيس", "No chair appointed", "Aucun président nommé"), chair ? "green" : "gold")}</div>${chair ? `<p>${esc(local(chair.profile))} · ${tr("النزاهة", "integrity", "intégrité")} ${num(chair.integrity)}٪</p>` : `<p>${tr("اختر رئيسًا مؤهلًا لإدارة الملف باستقلال وكفاءة.", "Appoint a qualified chair to manage this remit with competence and independence.", "Nommez un président qualifié pour gérer ce dossier avec compétence et indépendance.")}</p>`}<div class="politics-committee-policy"><span>${tr("السياسة الحالية", "Current policy", "Politique actuelle")}</span><b>${esc(policyNames[committee[policyKey]] || committee[policyKey])}</b></div><form id="politics-chair-${id}-form" class="politics-committee-form"><input type="hidden" name="committeeId" value="${id}"><label class="field"><span>${tr("رئيس اللجنة", "Committee chair", "Président de commission")}</span><select name="officialId" required>${nominees.map((official) => `<option value="${esc(official.id)}" ${official.id === committee.chairId ? "selected" : ""}>${esc(local(official.name))} · ${num(official.competence)}/${num(official.integrity)}</option>`).join("")}</select></label><button class="btn secondary" type="submit" ${p.office.held ? "" : "disabled"}>${tr("تعيين أو استبدال", "Appoint or replace", "Nommer ou remplacer")}</button></form><form id="politics-policy-${id}-form" class="politics-committee-form"><input type="hidden" name="committeeId" value="${id}"><label class="field"><span>${tr("توجيه اللجنة", "Committee policy", "Orientation de la commission")}</span><select name="policy">${COMMITTEE_POLICIES[id].map((policy) => `<option value="${esc(policy)}" ${committee[policyKey] === policy ? "selected" : ""}>${esc(policyNames[policy] || policy)}</option>`).join("")}</select></label><button class="btn soft" type="submit" ${p.office.held ? "" : "disabled"}>${tr("اعتماد السياسة", "Set policy", "Adopter la politique")}</button></form></article>`;
    })
    .join("");
  const cases = [...committees.discipline.cases].slice(-8).reverse();
  const caseRows = cases
    .map(
      (record) =>
        `<article class="politics-discipline-case"><div><b>${esc(record.playerName)}</b><small>${esc(clubName(record.clubId))} · ${date(record.date)} · ${tr("مباراة", "Match", "Match")} ${esc(record.matchId)}</small></div>${record.status === "pending" ? `<span class="badge gold">${tr("قيد المراجعة", "Pending review", "En attente")}</span><div class="politics-case-actions">${button(tr("تثبيت", "Uphold", "Confirmer"), "politics-discipline-ruling", `${record.id}|uphold`, "secondary", !p.office.held)}${button(tr("تخفيف", "Reduce", "Réduire"), "politics-discipline-ruling", `${record.id}|reduce`, "soft", !p.office.held)}${button(tr("إلغاء", "Dismiss", "Annuler"), "politics-discipline-ruling", `${record.id}|dismiss`, "danger", !p.office.held)}</div>` : `<span class="badge ${record.verdict === "dismiss" ? "red" : "green"}">${esc(record.verdict === "dismiss" ? tr("أُلغي الإيقاف", "Dismissed", "Annulée") : record.verdict === "reduce" ? tr("خُفّف الإيقاف", "Reduced", "Réduite") : tr("ثُبّت الإيقاف", "Upheld", "Confirmée"))} · ${num(record.sanctionDays || 0)} ${tr("يومًا", "days", "jours")}</span>`}</article>`,
    )
    .join("");
  const currentSeason = committees.competitions.tournaments.filter(
    (entry) => entry.season === s.seasonNumber,
  );
  const availableTemplates = Object.values(POLITICAL_TOURNAMENTS).filter(
    (template) =>
      !currentSeason.some((entry) => entry.templateId === template.id),
  );
  const tournamentForm = `<form id="politics-tournament-create-form" class="politics-tournament-form"><label class="field"><span>${tr("صيغة البطولة", "Competition format", "Format de compétition")}</span><select name="templateId" required>${availableTemplates.map((template) => `<option value="${esc(template.id)}">${esc(local(template.name))} · ${template.format === "league" ? tr("دوري", "league", "ligue") : tr("خروج مغلوب", "knockout", "élimination directe")} · ${num(template.entryCount)} ${tr("أندية", "clubs", "clubs")}</option>`).join("")}</select></label><label class="field"><span>${tr("الراعي الرئيسي", "Title sponsor", "Sponsor principal")}</span><select name="sponsorId" required>${POLITICAL_SPONSORS.map((sponsor) => `<option value="${esc(sponsor.id)}">${esc(local(sponsor.name))} · ${money(sponsor.contribution)}</option>`).join("")}</select></label><button class="btn primary" type="submit" ${p.office.held && availableTemplates.length ? "" : "disabled"}>${icon("trophy", 15)} ${tr("إطلاق البطولة والقرعة", "Launch competition and draw", "Lancer la compétition et le tirage")}</button></form>`;
  const tournamentCards = [...committees.competitions.tournaments]
    .slice(-8)
    .reverse()
    .map((tournament) => {
      const activeFixtures = tournament.fixtures.filter(
        (fixture) => fixture.round === tournament.currentRound,
      );
      const formatName =
        tournament.format === "league"
          ? tr("دوري", "round robin", "championnat")
          : tr("خروج مغلوب", "knockout", "élimination directe");
      const upcomingDate =
        activeFixtures.find((fixture) => !fixture.played)?.scheduledDate ||
        activeFixtures[0]?.scheduledDate;
      const canPlayNow = Boolean(upcomingDate && s.date >= upcomingDate);
      const drawRows = activeFixtures
        .map(
          (fixture) =>
            `<li><span>${esc(clubName(fixture.homeId))}</span><b>${fixture.played ? `${num(fixture.homeGoals)}–${num(fixture.awayGoals)}` : "vs"}</b><span>${esc(clubName(fixture.awayId))}</span></li>`,
        )
        .join("");
      const standings =
        tournament.format === "league" && tournament.table
          ? Object.values(tournament.table)
              .sort(
                (a, b) =>
                  b.points - a.points ||
                  b.gf - b.ga - (a.gf - a.ga) ||
                  a.clubId.localeCompare(b.clubId),
              )
              .map(
                (row, index) =>
                  `<li><span>${num(index + 1)}. ${esc(clubName(row.clubId))}</span><b>${num(row.points)} ${tr("نقطة", "pts", "pts")}</b></li>`,
              )
              .join("")
          : "";
      return `<article class="politics-tournament-card"><div class="panel-head"><div><small>${esc(formatName)} · ${tr("الموسم", "Season", "Saison")} ${num(tournament.season)}</small><h3>${esc(local(tournament.name))}</h3></div>${badge(tournament.status === "complete" ? tr("اكتملت", "Complete", "Terminée") : `${tr("الجولة", "Round", "Tour")} ${num(tournament.currentRound)}`, tournament.status === "complete" ? "green" : "gold")}</div><p>${esc(local(tournament.description))}</p><div class="politics-tournament-meta"><span>${tr("الراعي", "Sponsor", "Sponsor")}: <b>${esc(local(tournament.sponsorName))}</b></span><span>${tr("مساهمة", "Contribution", "Contribution")}: <b>${money(tournament.sponsorContribution)}</b></span><span>${tr("جائزة البطل", "Champion prize", "Prix du vainqueur")}: <b>${money(tournament.prizePool)}</b></span><span>${tr("موعد الجولة", "Round date", "Date de la journée")}: <b>${upcomingDate ? date(upcomingDate) : "—"}</b></span>${tournament.drawAudited ? `<span class="badge green">${tr("قرعة مدققة", "Audited draw", "Tirage audité")}</span>` : ""}</div><h4>${tr("القرعة / مباريات الجولة", "Draw / current round", "Tirage / journée actuelle")}</h4><ul class="politics-draw-list">${drawRows || `<li>${tr("لا توجد مباريات في هذه الجولة.", "No fixtures in this round.", "Aucun match pour cette journée.")}</li>`}</ul>${standings ? `<h4>${tr("الترتيب", "Standings", "Classement")}</h4><ol class="politics-draw-list">${standings}</ol>` : ""}${tournament.championId ? `<div class="politics-champion">${icon("trophy", 16)} ${tr("البطل", "Champion", "Vainqueur")}: <b>${esc(clubName(tournament.championId))}</b> · ${money(tournament.prizePool)}</div>` : button(`${icon("play", 15)} ${tr("محاكاة الجولة التالية", "Simulate next round", "Simuler la prochaine journée")}`, "politics-tournament-advance", tournament.id, "secondary", !p.office.held || !canPlayNow)}</article>`;
    })
    .join("");
  return `${heading(tr("اللجان والبطولات", "Committees and competitions", "Commissions et compétitions"), tr("حوكمة التحكيم والانضباط وتنظيم الكؤوس", "Govern refereeing, discipline and association cups", "Gouvernez l’arbitrage, la discipline et les coupes de la fédération"), tr("عيّن مسؤولين مؤهلين، واضبط سياسات التحكيم والانضباط والروزنامة. أطلق بطولات مرخصة بقرعة قابلة للتدقيق، ورعاية مسجلة وجوائز مدفوعة من الخزينة.", "Appoint qualified officials; set refereeing, disciplinary and calendar policies. Launch sponsored competitions with auditable draws and prizes paid from the treasury.", "Nommez des responsables qualifiés et définissez les politiques d’arbitrage, de discipline et de calendrier. Organisez des compétitions sponsorisées avec tirage auditable et primes versées par la trésorerie."))}${!p.office.held ? `<section class="panel politics-coming"><h3>${tr("صلاحيات اللجان بعد الانتخابات", "Committee powers after election", "Pouvoirs des commissions après l’élection")}</h3><p>${tr("يمكنك معاينة الهيكل؛ تعيين الرؤساء وتغيير اللوائح وتنظيم البطولات يتطلب تفويضًا انتخابيًا.", "You can inspect the structure; appointing chairs, changing rules and organising tournaments requires an electoral mandate.", "Vous pouvez consulter la structure ; nommer les présidents, modifier les règles et organiser les compétitions exige un mandat électoral.")}</p></section>` : ""}<section class="politics-committee-grid">${committeeCards}</section><section class="panel politics-discipline-panel"><div class="panel-head"><div><small>${tr("مساءلة رياضية", "Sporting due process", "Procédure disciplinaire sportive")}</small><h3>${tr("قضايا البطاقات الحمراء", "Red-card cases", "Dossiers de cartons rouges")}</h3></div>${badge(num(committees.discipline.cases.filter((entry) => entry.status === "pending").length), "gold")}</div><p>${tr("تُسجّل حالات الطرد في مباريات ناديك تلقائيًا إذا كنت في الرئاسة. يتيح الحكم تثبيت العقوبة أو تخفيفها أو إلغاءها، ويُسجل القرار علنًا.", "Dismissals in your club matches are logged automatically while you hold office. Uphold, reduce or dismiss the sanction; each ruling is recorded.", "Les expulsions dans les matchs de votre club sont enregistrées automatiquement pendant votre mandat. Confirmez, réduisez ou annulez la sanction ; chaque décision est consignée.")}</p><div class="politics-case-list">${caseRows || empty(tr("لا توجد قضايا انضباط مسجلة", "No disciplinary cases recorded", "Aucun dossier disciplinaire"), tr("تظهر هنا حالات الطرد التي تتطلب مراجعة.", "Dismissals requiring review appear here.", "Les expulsions à examiner apparaîtront ici."), "shield")}</div></section><section class="panel politics-tournament-section"><div class="panel-head"><div><small>${tr("روزنامة الاتحاد", "Association calendar", "Calendrier de la fédération")}</small><h3>${tr("البطولات والرعاة والجوائز", "Competitions, sponsors and prizes", "Compétitions, sponsors et primes")}</h3></div>${badge(`${num(currentSeason.length)} ${tr("بطولات هذا الموسم", "competitions this season", "compétitions cette saison")}`, "outline")}</div><p>${tr("تُحجز الجائزة في صندوق مستقل عند التسجيل، وتُحوّل إلى حساب النادي البطل عند اكتمال الجدول أو النهائي. تُضاف الرعاية والتكاليف إلى دفتر الاتحاد.", "The prize is reserved in a separate fund at registration and paid to the champion's club account when the table or final is complete. Sponsorship and costs are posted to the association ledger.", "La prime est réservée dans un fonds distinct à l’inscription puis versée au club vainqueur à la fin du classement ou de la finale. Parrainage et frais figurent au registre de la fédération.")}</p>${tournamentForm}<div class="politics-tournament-grid">${tournamentCards || empty(tr("لم تُنظم بطولات بعد", "No competitions organised yet", "Aucune compétition organisée"), tr("اختر صيغة وراعيًا لإجراء القرعة.", "Choose a format and sponsor to hold the draw.", "Choisissez un format et un sponsor pour effectuer le tirage."), "trophy")}</div></section>`;
}

function oppositionView(s) {
  const p = s.politics;
  const noConfidence = p.opposition.noConfidence;
  const statusNames = {
    quiet: tr("هدوء", "Quiet", "Calme"),
    open: tr("اقتراح مفتوح", "Motion open", "Motion ouverte"),
    "vote-ready": tr("جاهز للاقتراع", "Ready for vote", "Prête au vote"),
    failed: tr("مرفوض", "Defeated", "Rejetée"),
    passed: tr("حُجبَت الثقة", "Confidence withdrawn", "Défiance votée"),
  };
  const responseForm = `<form id="politics-opposition-response-form" class="politics-governance-form"><label class="field"><span>${tr("طريقة الرد العلني", "Public response", "Réponse publique")}</span><select name="responseId">${Object.entries(
    OPPOSITION_RESPONSES,
  )
    .map(
      ([id, label]) =>
        `<option value="${esc(id)}">${esc(local(label))}</option>`,
    )
    .join(
      "",
    )}</select></label><button class="btn secondary" type="submit" ${p.office.held ? "" : "disabled"}>${tr("تسجيل الرد", "Record response", "Enregistrer la réponse")}</button></form>`;
  const motions = [...p.opposition.motions]
    .slice(-10)
    .reverse()
    .map((motion) => {
      const label =
        motion.type === "no-confidence"
          ? tr("اقتراح حجب الثقة", "No-confidence motion", "Motion de défiance")
          : motion.type === "confidence-result"
            ? tr(
                "نتيجة اقتراع الثقة",
                "Confidence vote result",
                "Résultat du vote de confiance",
              )
            : local(OPPOSITION_RESPONSES[motion.responseId]) ||
              tr("رد رئاسي", "Presidential response", "Réponse présidentielle");
      return `<article class="politics-opposition-row"><div><b>${esc(label)}</b><small>${date(motion.date)} · ${num(motion.season)} ${tr("الموسم", "season", "saison")}</small></div>${badge(esc(statusNames[motion.status] || motion.status), motion.status === "passed" ? "red" : motion.status === "vote-ready" ? "gold" : "outline")}</article>`;
    })
    .join("");
  const ballots =
    noConfidence.votes?.votes
      ?.map(
        (vote) =>
          `<tr><td>${esc(clubName(vote.clubId))}</td><td>${vote.vote === "no-confidence" ? tr("حجب الثقة", "No confidence", "Défiance") : tr("تأييد الرئيس", "Confidence", "Confiance")}</td><td>${num(vote.weight)}</td></tr>`,
      )
      .join("") || "";
  const pendingInvestigations = p.integrity.investigations.filter(
    (entry) => entry.status === "open",
  ).length;
  return `${heading(tr("المعارضة والشرعية", "Opposition and legitimacy", "Opposition et légitimité"), tr("الرقابة البرلمانية واقتراع الثقة", "Assembly oversight and confidence vote", "Contrôle de l’assemblée et vote de confiance"), tr("تتدرج المعارضة بحسب الشرعية والنزاهة والتحقيقات المفتوحة. أجب علنًا، أو واجه اقتراعًا مسجلًا بالأسماء وبالأوزان السياسية للأندية.", "Opposition pressure follows legitimacy, integrity and open investigations. Answer publicly or face a named vote weighted by club representation.", "La pression de l’opposition dépend de la légitimité, de l’intégrité et des enquêtes ouvertes. Répondez publiquement ou affrontez un vote nominatif pondéré par les clubs."))}<section class="stats-grid politics-finance-stats">${statCard(tr("ضغط المعارضة", "Opposition pressure", "Pression de l’opposition"), num(Math.round(p.opposition.pressure)), "/ 100", tr("يزداد عند تراجع الشرعية والنزاهة", "Rises when legitimacy and integrity fall", "Monte lorsque légitimité et intégrité baissent"), "users", p.opposition.pressure >= 60 ? "red" : "gold")}${statCard(tr("اقتراع الثقة", "Confidence motion", "Motion de confiance"), esc(statusNames[noConfidence.status] || noConfidence.status), "", `${num(noConfidence.counter)} / ${num(noConfidence.threshold)}`, "shield", noConfidence.status === "vote-ready" ? "red" : "")}${statCard(tr("تحقيقات مفتوحة", "Open investigations", "Enquêtes ouvertes"), num(pendingInvestigations), "", tr("تحتاج إلى قرار معلل", "Awaiting a reasoned decision", "En attente d’une décision motivée"), "search", pendingInvestigations ? "gold" : "green")}</section><section class="panel politics-opposition-panel"><div class="panel-head"><div><small>${tr("رد الحكومة", "Government response", "Réponse du gouvernement")}</small><h3>${tr("الشفافية أو الحوار أو التصعيد", "Transparency, dialogue or escalation", "Transparence, dialogue ou escalade")}</h3></div>${badge(p.office.held ? tr("ولاية قائمة", "In office", "En fonction") : tr("خارج المنصب", "Out of office", "Hors fonction"), p.office.held ? "green" : "outline")}</div><p>${tr("نشر السجل المالي يفعّل الإفصاح العام ويرفع النزاهة. جلسة الاستماع تبني الشرعية. مهاجمة المعارضين تخفض الضغط قليلًا لكنها تُسجل كتصرف يضر النزاهة.", "Publishing the financial register enables disclosure and improves integrity. A public hearing builds legitimacy. Attacking opponents may ease pressure briefly but damages integrity.", "La publication des comptes active la transparence et renforce l’intégrité. Une audience publique améliore la légitimité. Attaquer les opposants peut réduire brièvement la pression, mais nuit à l’intégrité.")}</p>${responseForm}${noConfidence.status === "vote-ready" ? button(`${icon("check", 15)} ${tr("إجراء اقتراع الثقة", "Hold confidence vote", "Organiser le vote de confiance")}`, "politics-confidence-vote", "", "primary", !p.office.held) : `<div class="politics-confidence-meter"><span>${tr("تراكم ضغط حجب الثقة", "No-confidence pressure", "Pression de défiance")}</span>${progress(Math.round((noConfidence.counter / noConfidence.threshold) * 100))}</div>`}</section><section class="panel"><div class="panel-head"><h3>${icon("history")} ${tr("الاقتراحات والسجل العلني", "Motions and public record", "Motions et registre public")}</h3><span class="badge outline">${num(p.opposition.motions.length)}</span></div><div class="politics-case-list">${motions || empty(tr("لا توجد اقتراحات للمعارضة", "No opposition motions", "Aucune motion de l’opposition"), tr("تظهر الاقتراحات وفق مؤشرات الشرعية والنزاهة.", "Motions appear as legitimacy and integrity indicators change.", "Les motions apparaissent selon l’évolution de la légitimité et de l’intégrité."), "history")}</div>${ballots ? `<h4>${tr("أسماء التصويت الأخير", "Latest named ballot", "Dernier scrutin nominatif")}</h4><div class="table-wrap"><table><thead><tr><th>${tr("النادي", "Club", "Club")}</th><th>${tr("الموقف", "Position", "Position")}</th><th>${tr("الوزن", "Weight", "Poids")}</th></tr></thead><tbody>${ballots}</tbody></table></div>` : ""}</section>`;
}

function foreignView(s) {
  const p = s.politics;
  const foreign = p.foreign;
  const relations = Object.values(FOREIGN_ORGANIZATIONS)
    .map(
      (organization) =>
        `<article class="politics-foreign-card"><div><b>${esc(local(organization.name))}</b><span>${esc(organization.id)}</span></div><div class="politics-meter">${progress(Math.round(foreign.relations[organization.id] || 0))}<b>${num(Math.round(foreign.relations[organization.id] || 0))}٪</b></div><small>${tr("نفوذ دبلوماسي", "Association influence", "Influence de la fédération")}: ${num(foreign.influence)}</small></article>`,
    )
    .join("");
  const eventOptions = Object.values(HOSTING_EVENTS)
    .map(
      (event) =>
        `<option value="${esc(event.id)}">${esc(local(event.name))} · ${money(event.bidCost)} · ${tr("المكافأة", "award", "prime")} ${money(event.award)}</option>`,
    )
    .join("");
  const bidRows = [...foreign.hostingBids]
    .slice(-10)
    .reverse()
    .map((bid) => {
      const event = HOSTING_EVENTS[bid.eventId];
      const status =
        bid.status === "pending"
          ? tr("بانتظار القرار", "Pending decision", "En attente")
          : bid.status === "awarded"
            ? tr("مقبولة", "Awarded", "Attribuée")
            : tr("مرفوضة", "Declined", "Refusée");
      return `<article class="politics-opposition-row"><div><b>${esc(local(event?.name))}</b><small>${date(bid.submittedDate)} · ${tr("موعد النتيجة", "Decision due", "Décision prévue")} ${date(bid.dueDate)}${bid.score === null ? "" : ` · ${tr("التقييم", "score", "score")} ${num(bid.score)}`}</small></div>${badge(esc(status), bid.status === "awarded" ? "green" : bid.status === "declined" ? "red" : "gold")}</article>`;
    })
    .join("");
  const seat = foreign.executiveSeat;
  const missions = foreign.missions
    .slice(-5)
    .reverse()
    .map(
      (mission) =>
        `<div class="politics-foreign-history"><span>${esc(local(FOREIGN_ORGANIZATIONS[mission.organizationId]?.name))} · ${date(mission.date)}</span><b>${money(mission.cost)}</b></div>`,
    )
    .join("");
  return `${heading(tr("العلاقات الخارجية", "Foreign affairs", "Affaires étrangères"), tr("الدبلوماسية وملفات الاستضافة والمقاعد الدولية", "Diplomacy, hosting bids and international seats", "Diplomatie, candidatures d’accueil et sièges internationaux"), tr("ابنِ الثقة والنفوذ عبر بعثات ممولة بوضوح، قدّم ملفات استضافة، واسْعَ إلى مقعد تنفيذي عند توافر شروط العلاقة والنزاهة.", "Build relations and influence through disclosed missions, submit hosting bids, and seek an executive seat when trust and integrity thresholds are met.", "Développez les relations et l’influence par des missions déclarées, déposez des candidatures d’accueil et visez un siège exécutif si les seuils de confiance et d’intégrité sont atteints."))}<section class="stats-grid politics-finance-stats">${statCard(tr("النفوذ", "Influence", "Influence"), num(foreign.influence), "/ 100", tr("رصيد دبلوماسي", "Diplomatic standing", "Capital diplomatique"), "globe", "gold")}${statCard(tr("مقعد تنفيذي", "Executive seat", "Siège exécutif"), seat ? esc(FOREIGN_ORGANIZATIONS[seat.organizationId]?.id || seat.organizationId) : tr("لا يوجد", "None", "Aucun"), "", seat ? `${tr("ينتهي بعد الموسم", "Expires after season", "Expire après la saison")} ${num(seat.expiresSeason)}` : tr("يتطلب علاقة 70+ ونفوذ ونزاهة", "Requires 70+ relation, influence and integrity", "Exige 70+ en relation, influence et intégrité"), "crown", seat ? "green" : "")}${statCard(tr("ملفات الاستضافة", "Hosting bids", "Candidatures d’accueil"), num(foreign.hostingBids.length), "", tr("تُحسم بعد 30 يومًا", "Resolved after 30 days", "Décision après 30 jours"), "calendar", "")}</section><section class="politics-foreign-grid">${relations}</section><section class="panel politics-foreign-panel"><div class="panel-head"><div><small>${tr("التمثيل الخارجي", "Diplomatic representation", "Représentation diplomatique")}</small><h3>${tr("بعثة تعاون رسمية", "Official cooperation mission", "Mission officielle de coopération")}</h3></div></div><form id="politics-diplomatic-mission-form" class="politics-governance-form"><label class="field"><span>${tr("الجهة", "Organisation", "Organisation")}</span><select name="organizationId">${Object.values(
    FOREIGN_ORGANIZATIONS,
  )
    .map(
      (organization) =>
        `<option value="${esc(organization.id)}">${esc(local(organization.name))}</option>`,
    )
    .join(
      "",
    )}</select></label><label class="field"><span>${tr("مسار البعثة", "Mission focus", "Objet de mission")}</span><select name="missionType"><option value="dialogue">${tr("حوار مؤسسي · 2 م", "Institutional dialogue · 2m", "Dialogue institutionnel · 2 M")}</option><option value="youth-exchange">${tr("تبادل ناشئين · 3 م", "Youth exchange · 3m", "Échange jeunes · 3 M")}</option><option value="governance">${tr("حوكمة ونزاهة · 2.5 م", "Governance and integrity · 2.5m", "Gouvernance et intégrité · 2,5 M")}</option></select></label><button class="btn secondary" type="submit" ${p.office.held ? "" : "disabled"}>${tr("إرسال بعثة", "Send delegation", "Envoyer une délégation")}</button></form><form id="politics-hosting-bid-form" class="politics-governance-form"><label class="field"><span>${tr("فرصة الاستضافة", "Hosting opportunity", "Possibilité d’accueil")}</span><select name="eventId">${eventOptions}</select></label><button class="btn primary" type="submit" ${p.office.held ? "" : "disabled"}>${tr("تقديم الملف", "Submit bid", "Déposer la candidature")}</button></form><form id="politics-executive-seat-form" class="politics-governance-form"><label class="field"><span>${tr("الجهة للمقعد التنفيذي", "Organisation for the seat", "Organisation du siège")}</span><select name="organizationId">${Object.values(
    FOREIGN_ORGANIZATIONS,
  )
    .map(
      (organization) =>
        `<option value="${esc(organization.id)}">${esc(local(organization.name))}</option>`,
    )
    .join(
      "",
    )}</select></label><button class="btn soft" type="submit" ${p.office.held ? "" : "disabled"}>${tr("طلب الترشح للمقعد", "Seek executive seat", "Candidater au siège")}</button></form></section><section class="panel"><div class="panel-head"><h3>${tr("طلبات الاستضافة", "Hosting bids", "Candidatures d’accueil")}</h3></div><div class="politics-case-list">${bidRows || empty(tr("لا توجد ملفات استضافة", "No hosting bids", "Aucune candidature"), tr("قدّم ملفًا وستظهر النتيجة بعد الموعد المحدد.", "File a bid; its result appears after the due date.", "Déposez une candidature ; le résultat sera publié à la date prévue."), "globe")}</div><h4>${tr("البعثات الأخيرة", "Recent missions", "Missions récentes")}</h4>${missions || `<p class="muted">${tr("لا توجد بعثات مسجلة.", "No missions recorded.", "Aucune mission enregistrée.")}</p>`}</section>`;
}

function legacyView(s) {
  const p = s.politics;
  const integrity = p.integrity;
  const trial = p.legacy.trial;
  const investigationRows = [...integrity.investigations]
    .slice(-8)
    .reverse()
    .map((entry) => {
      const status =
        entry.status === "open"
          ? tr("مفتوح", "Open", "Ouvert")
          : entry.status === "cleared"
            ? tr("مُبرأ", "Cleared", "Classé")
            : entry.status === "referred"
              ? tr("أُحيل للمراجعة", "Referred", "Transmis")
              : entry.status === "obstructed"
                ? tr("اعتراض علني", "Public objection", "Contesté")
                : tr("غير مثبت", "Unsubstantiated", "Non établi");
      const due = s.date >= entry.dueDate;
      return `<article class="politics-opposition-row"><div><b>${esc(local(INTEGRITY_SUBJECTS[entry.subject]))}</b><small>${date(entry.date)} · ${tr("نقاط الأدلة", "Evidence score", "Indice de preuve")} ${num(entry.evidenceScore)} · ${tr("الحسم بعد", "Decision after", "Décision après")} ${date(entry.dueDate)}</small></div>${entry.status === "open" ? `<div class="politics-case-actions">${button(tr("تبرئة", "Clear", "Classer"), "politics-integrity-decision", `${entry.id}|clear`, "secondary", !due)}${button(tr("إحالة", "Refer", "Transmettre"), "politics-integrity-decision", `${entry.id}|refer`, "danger", !due)}</div>` : badge(esc(status), entry.status === "cleared" ? "green" : entry.status === "referred" ? "red" : "gold")}</article>`;
    })
    .join("");
  const legacyRows = [...p.legacy.departures]
    .slice(-8)
    .reverse()
    .map(
      (record) =>
        `<article class="politics-legacy-row"><div><b>${esc(local(LEGACY_TITLES[record.titleId]))}</b><small>${tr("المواسم", "Seasons", "Saisons")} ${num(record.startedSeason)}–${num(record.endedSeason)} · ${date(record.date)}</small></div><span>${tr("النزاهة", "Integrity", "Intégrité")} ${num(record.integrityScore)} · ${tr("الشرعية", "legitimacy", "légitimité")} ${num(record.legitimacy)}</span></article>`,
    )
    .join("");
  const honorRows = p.legacy.honours
    .map(
      (honor) =>
        `<span class="badge green">${esc(local(LEGACY_TITLES[honor.titleId]))} · ${date(honor.date)}</span>`,
    )
    .join("");
  const currentTitle = p.legacy.title
    ? local(LEGACY_TITLES[p.legacy.title])
    : tr(
        "لم يُسجل إرث بعد",
        "No legacy recorded yet",
        "Aucun héritage enregistré",
      );
  const trialPanel =
    trial.status === "open"
      ? `<section class="panel politics-trial-panel"><div class="panel-head"><h3>${tr("ملف إرث مفتوح", "Open legacy case", "Dossier d’héritage ouvert")}</h3>${badge(`${num(trial.evidenceScore)} ${tr("دليل", "evidence", "preuves")}`, "red")}</div><p>${tr("اختر التعاون الكامل أو contestation قانونية. النتيجة تعتمد على الأدلة المسجلة ومؤشرات النزاهة.", "Choose cooperation or legal contest. The outcome depends on recorded evidence and integrity.", "Choisissez la coopération ou la contestation juridique. Le verdict dépend des preuves et de l’intégrité.")}</p>${button(tr("التعاون", "Cooperate", "Coopérer"), "politics-legacy-trial", "cooperate", "secondary")}${button(tr("الطعن", "Contest", "Contester"), "politics-legacy-trial", "contest", "danger")}</section>`
      : "";
  const seats = p.office.held
    ? button(
        `${icon("log-out", 15)} ${tr("الاستقالة وتوثيق الإرث", "Resign and close the term", "Démissionner et clore le mandat")}`,
        "politics-office-resign",
        "",
        "danger",
        p.campaign.active,
      )
    : "";
  return `${heading(tr("النزاهة والإرث", "Integrity and legacy", "Intégrité et héritage"), tr("الإفصاح والتحقيقات وسجل ما بعد المنصب", "Disclosure, investigations and post-office record", "Transparence, enquêtes et bilan après mandat"), tr("أعلن أصول الاتحاد، راجع الخزينة، وافتح تحقيقًا محدد النطاق. بعد انتهاء الولاية، يُقيّم إرثك وتُحسم أي إحالة قضائية.", "Disclose association assets, audit the treasury and open scoped reviews. After leaving office, your record is assessed and any referred case is resolved.", "Déclarez le patrimoine de la fédération, auditez la trésorerie et ouvrez des examens ciblés. Après le mandat, votre héritage est évalué et toute affaire transmise est jugée."))}<section class="stats-grid politics-finance-stats">${statCard(tr("النزاهة", "Integrity", "Intégrité"), num(Math.round(integrity.score)), "/ 100", integrity.exposed ? tr("تحت المراجعة العامة", "Under public scrutiny", "Sous examen public") : tr("سجل الاتحاد", "Association record", "Registre de la fédération"), "shield", integrity.score < 40 ? "red" : "green")}${statCard(tr("الإجراءات النظيفة", "Clean actions", "Actions intègres"), num(integrity.cleanActions), "", tr("إقرارات وتدقيقات معلنة", "Disclosures and open audits", "Déclarations et audits publics"), "check", "green")}${statCard(tr("المخالفات", "Illicit actions", "Actions illicites"), num(integrity.illicitActions), "", tr("تظهر في سجل المراجعة", "Tracked in the review log", "Suivies au registre d’examen"), "alert", integrity.illicitActions ? "red" : "")}${statCard(tr("الإرث الحالي", "Current legacy", "Héritage actuel"), esc(currentTitle), "", p.office.held ? tr("ولاية جارية", "Current term", "Mandat en cours") : tr("بعد ترك المنصب", "Post-office", "Après mandat"), "crown", "gold")}</section><section class="panel politics-integrity-panel"><div class="panel-head"><div><small>${tr("المساءلة الوقائية", "Preventive accountability", "Responsabilité préventive")}</small><h3>${tr("الإفصاح والتدقيق", "Disclosure and audit", "Transparence et audit")}</h3></div>${badge(integrity.lastAudit ? esc(integrity.lastAudit.status) : tr("لا يوجد تدقيق", "No audit", "Aucun audit"), integrity.lastAudit?.status === "clean" ? "green" : "gold")}</div><p>${tr("إقرار الأصول يثبت رصيد الاتحاد وتعديلات دفتره في بداية الفترة. التدقيق يعيد مطابقة الدفتر بالخزينة، ويُحفظ أثره مع النزاهة.", "An asset declaration snapshots treasury and ledger revision. An audit reconciles the ledger against the treasury and updates the integrity record.", "La déclaration d’actifs fige la trésorerie et la révision du registre. L’audit rapproche ensuite le registre de la trésorerie et met à jour l’intégrité.")}</p><div class="politics-governance-actions">${button(tr("إقرار أصول هذا الموسم", "File seasonal asset declaration", "Déclarer les actifs de la saison"), "politics-integrity-declare", "", "secondary", !p.office.held || integrity.assetDeclarations.some((entry) => entry.season === s.seasonNumber))}${button(tr("تدقيق النزاهة الآن", "Run integrity audit", "Lancer l’audit d’intégrité"), "politics-integrity-audit", "", "primary", !p.office.held)}</div>${integrity.assetDeclarations.length ? `<div class="politics-foreign-history"><span>${tr("آخر إقرار", "Latest declaration", "Dernière déclaration")} · ${date(integrity.assetDeclarations.at(-1).date)}</span><b>${money(integrity.assetDeclarations.at(-1).associationBalance)}</b></div>` : ""}</section><section class="panel politics-investigation-panel"><div class="panel-head"><div><small>${tr("تحقيقات مستقلة", "Independent reviews", "Examens indépendants")}</small><h3>${tr("ملفات محددة النطاق", "Scoped investigations", "Enquêtes ciblées")}</h3></div></div><form id="politics-integrity-investigation-form" class="politics-governance-form"><label class="field"><span>${tr("مجال التحقيق", "Review subject", "Objet de l’examen")}</span><select name="subject">${Object.entries(
    INTEGRITY_SUBJECTS,
  )
    .map(
      ([id, label]) =>
        `<option value="${esc(id)}">${esc(local(label))}</option>`,
    )
    .join(
      "",
    )}</select></label><button class="btn secondary" type="submit" ${p.office.held ? "" : "disabled"}>${tr("فتح تحقيق · 1 م", "Open review · 1m", "Ouvrir l’examen · 1 M")}</button></form><div class="politics-case-list">${investigationRows || empty(tr("لا توجد تحقيقات", "No investigations", "Aucune enquête"), tr("التحقيقات تتضمن نطاقًا وموعدًا وقرارًا وأدلة محفوظة.", "Each investigation stores its scope, due date, decision and evidence.", "Chaque enquête conserve son objet, son échéance, sa décision et ses preuves."), "search")}</div></section>${trialPanel}<section class="panel politics-legacy-panel"><div class="panel-head"><h3>${icon("history")} ${tr("سجل ما بعد المنصب", "Post-office archive", "Archives après mandat")}</h3>${seats}</div>${honorRows ? `<div class="politics-honours">${honorRows}</div>` : ""}<div class="politics-case-list">${legacyRows || empty(tr("لا توجد فترة رئاسية مؤرشفة", "No presidential term archived", "Aucun mandat présidentiel archivé"), tr("يُسجل الإرث عند خسارة الانتخابات أو حجب الثقة أو الاستقالة.", "Legacy is recorded after an election loss, a no-confidence vote or resignation.", "L’héritage est enregistré après une défaite électorale, un vote de défiance ou une démission."), "crown")}</div></section>`;
}

function eventsView(s) {
  const p = s.politics;
  const state = p.eventState;
  const pending = state.pending;
  const event = pending ? POLITICAL_EVENT_BY_ID[pending.eventId] : null;
  const pendingPanel =
    event && pending
      ? `<section class="panel politics-event-pending"><div class="panel-head"><div><small>${tr("قرار سياسي مطلوب", "Decision required", "Décision requise")} · ${esc(eventCategory(event.category))}</small><h3>${esc(local(event.title))}</h3></div>${badge(`${tr("آخر موعد", "Deadline", "Échéance")} ${date(pending.expiresDate)}`, s.date > pending.expiresDate ? "red" : "gold")}</div><p>${esc(local(event.prompt))}</p><div class="politics-event-choices">${event.choices
          .map((choice) => {
            const treasury = choice.effects?.treasury;
            const unaffordable =
              treasury?.direction === "debit" &&
              p.finance.balance < treasury.amount;
            const amountNote = treasury
              ? ` · ${treasury.direction === "debit" ? "−" : "+"}${money(treasury.amount)}`
              : "";
            return button(
              `${esc(local(choice.label))}${amountNote}`,
              "politics-event-choice",
              choice.id,
              "primary",
              unaffordable || s.date > pending.expiresDate,
            );
          })
          .join(
            "",
          )}</div><small class="muted">${tr("اختيارك يؤثر في الشرعية والنزاهة والميزانية والعلاقات، ويُحفظ في السجل.", "Your choice can affect legitimacy, integrity, the treasury and relations, and is saved to the record.", "Votre choix peut affecter la légitimité, l’intégrité, le budget et les relations ; il est archivé.")}</small></section>`
      : empty(
          tr(
            "لا يوجد حدث ينتظر القرار",
            "No event awaits a decision",
            "Aucun événement n’attend de décision",
          ),
          tr(
            "تظهر قضايا سياسية متجددة خلال الموسم؛ لكل قضية خيارات وآثار مسجلة.",
            "New political cases can appear throughout the season; each has recorded choices and consequences.",
            "De nouveaux événements peuvent survenir pendant la saison ; chacun possède des choix et des conséquences consignés.",
          ),
          "calendar",
        );
  const historyRows = state.history
    .slice(0, 18)
    .map((record) => {
      const archivedEvent = POLITICAL_EVENT_BY_ID[record.eventId];
      const selected = archivedEvent?.choices.find(
        (choice) => choice.id === record.choiceId,
      );
      return `<article class="politics-event-history-row"><div><b>${esc(local(archivedEvent?.title) || record.eventId)}</b><small>${esc(eventCategory(archivedEvent?.category || ""))} · ${date(record.date)}</small></div><span class="badge ${record.status === "resolved" ? "green" : "gold"}">${record.status === "resolved" ? esc(local(selected?.label) || tr("حُسم", "Resolved", "Tranché")) : tr("انتهت المهلة", "Expired", "Expiré")}</span></article>`;
    })
    .join("");
  return `${heading(tr("قرارات متجددة", "Recurring decisions", "Décisions récurrentes"), tr("الأحداث السياسية", "Political events", "Événements politiques"), tr("استجب لقضايا الجمعية والميزانية والنزاهة والدبلوماسية والحملة. الأحداث خيالية، وتُحفظ اختياراتك وآثارها.", "Respond to association, budget, integrity, diplomacy and campaign cases. Events are fictional; choices and their consequences are saved.", "Répondez aux situations liées à la fédération, au budget, à l’intégrité, à la diplomatie et à la campagne. Les événements sont fictifs ; choix et conséquences sont enregistrés."))}<section class="panel politics-events-intro"><div class="panel-head"><div><small>${tr("تواتر شهري واحتمالات متنوعة", "Monthly opportunities, varied outcomes", "Occasions mensuelles, issues variées")}</small><h3>${tr(`${num(POLITICAL_EVENTS.length)} سيناريو تفاعلي`, `${num(POLITICAL_EVENTS.length)} interactive scenarios`, `${num(POLITICAL_EVENTS.length)} scénarios interactifs`)}</h3></div>${badge(`${num(state.history.length)} ${tr("قرار مؤرشف", "decisions archived", "décisions archivées")}`, "gold")}</div><p>${tr("قد يعتمد ظهور القضية على وجودك في المنصب أو أثناء الحملة. لكل حدث مهلة ثلاثون يومًا؛ وإذا انتهت، يُؤرشف بلا أثر مالي.", "Events may depend on whether you hold office or are campaigning. Each decision remains open for thirty days, then expires without a financial effect.", "L’apparition d’un événement peut dépendre de votre mandat ou de la campagne. Chaque décision reste ouverte trente jours, puis expire sans effet financier.")}</p></section>${pendingPanel}<section class="panel politics-event-history"><div class="panel-head"><h3>${icon("history")} ${tr("أرشيف القرارات", "Decision archive", "Archives des décisions")}</h3></div>${historyRows || empty(tr("لا توجد قرارات مؤرشفة", "No archived decisions", "Aucune décision archivée"), "", "history")}</section>`;
}

function eventCategory(category) {
  return (
    {
      opposition: tr("المعارضة", "Opposition", "Opposition"),
      council: tr("المجلس", "Council", "Conseil"),
      integrity: tr("النزاهة", "Integrity", "Intégrité"),
      finance: tr("المالية", "Finance", "Finances"),
      foreign: tr("الدبلوماسية", "Diplomacy", "Diplomatie"),
      campaign: tr("الحملة", "Campaign", "Campagne"),
      legacy: tr("الإرث", "Legacy", "Héritage"),
    }[category] || tr("سياسة", "Politics", "Politique")
  );
}

function futureTab(tab) {
  const copy = {
    council: [
      "المجلس والقوانين",
      "Council and legislation",
      "Conseil et législation",
    ],
    committees: [
      "اللجان والبطولات",
      "Committees and competitions",
      "Commissions et compétitions",
    ],
    opposition: [
      "المعارضة والنزاهة",
      "Opposition and integrity",
      "Opposition et intégrité",
    ],
    foreign: ["العلاقات الخارجية", "Foreign affairs", "Affaires étrangères"],
    legacy: ["الفترات والإرث", "Terms and legacy", "Mandats et héritage"],
  }[tab];
  return `<section class="panel politics-coming"><span class="politics-seal">${icon("shield", 28)}</span><h2>${tr(...copy)}</h2><p>${tr("تظهر أدوات هذا الملف عندما تدخل مجموعته في مسار رئاسة الاتحاد. كل مجموعة لها سجل مستقل واختبارات حفظ وترحيل.", "This dossier opens as its presidency feature group is implemented. Each group has its own ledger, save migration, and tests.", "Ce dossier s’ouvrira avec la mise en place de son groupe de fonctionnalités. Chaque groupe possède son registre, sa migration et ses tests.")}</p></section>`;
}

function overview(s) {
  const p = s.politics;
  const campaign = isCampaignActive(s);
  const recent = p.history.slice(0, 5);
  return `${summaryCards(s)}<section class="panel politics-overview-panel"><div class="panel-head"><h3>${icon("crown")} ${tr("مكتب الرئاسة", "Presidency desk", "Bureau de la présidence")}</h3>${badge(p.office.held ? tr("في المنصب", "In office", "En fonction") : tr("خارج المنصب", "Out of office", "Hors fonction"), p.office.held ? "green" : "gold")}</div><p>${p.office.held ? tr("أنت رئيس الاتحاد. أدر المجلس واللجان والمال العام، لكن استغلال سلطتك لصالح ناديك يرفع الشبهات ويهدد ولايتك.", "You are association president. Lead the council, committees, and public funds—but abusing office for your club raises suspicion and risks your term.", "Vous présidez la fédération. Dirigez le conseil, les commissions et les fonds publics, mais tout abus au profit de votre club accroît les soupçons et menace votre mandat.") : tr("أنت مالك نادٍ ومرشح محتمل. ابنِ تحالفاتك، اكسب ثقة الأندية، واستعد للحملة المقبلة.", "You are a club owner and potential candidate. Build alliances, earn clubs' trust, and prepare for the next campaign.", "Vous êtes propriétaire d’un club et candidat potentiel. Bâtissez des alliances, gagnez la confiance des clubs et préparez la prochaine campagne.")}</p><div class="politics-overview-actions">${button(`${icon("users", 16)} ${tr("عرض خريطة الأصوات", "Open voting map", "Ouvrir la carte des votes")}`, "politics-tab", "map", "secondary")}${button(`${icon("megaphone", 16)} ${tr("إدارة الحملة", "Open campaign", "Ouvrir la campagne")}`, "politics-tab", "campaign", "primary", !campaign)}${button(`${icon("calendar", 16)} ${p.eventState.pending ? tr("حدث سياسي ينتظر قرارك", "Political event awaiting your decision", "Un événement politique attend votre décision") : tr("الأحداث السياسية", "Political events", "Événements politiques")}`, "politics-tab", "events", p.eventState.pending ? "danger" : "secondary")}</div></section>
    <section class="panel"><div class="panel-head"><h3>${icon("users")} ${tr("المنافسون السياسيون", "Political rivals", "Adversaires politiques")}</h3></div><div class="politics-rival-strip">${p.candidates.map((candidate) => `<div><b>${esc(local(candidate.name))}</b><span>${esc(local(candidate.profile))} · ${tr("العلاقة", "relation", "relation")} ${num(Math.round(candidate.relationship))}</span></div>`).join("")}</div></section>
    <section class="panel"><div class="panel-head"><h3>${icon("history")} ${tr("آخر محطات السياسة", "Political record", "Dernières étapes politiques")}</h3></div>${recent.length ? `<div class="politics-history-list">${recent.map((entry) => `<div><span>${entry.type === "election" ? tr("انتخابات", "Election", "Élection") : esc(entry.type)}</span><b>${entry.won ? tr("فوز", "Won", "Gagnée") : tr("نتيجة", "Result", "Résultat")}</b><small>${tr("الموسم", "Season", "Saison")} ${num(entry.season)} · ${date(entry.date)}</small></div>`).join("")}</div>` : empty(tr("لا يوجد سجل انتخابي بعد", "No election record yet", "Aucun historique électoral"), tr("تُحفظ كل نتيجة وتصويت علني هنا.", "Every result and public ballot will be archived here.", "Chaque résultat et scrutin public sera archivé ici."), "history")}</section>
    ${infoNote(tr("محاكاة سياسية داخل اللعبة. الشخصيات والأحزاب في هذا النظام خيالية، والتصويت والتمويل لا يمثلان وقائع أو أموالًا حقيقية.", "Political simulation for gameplay. This system's characters and parties are fictional; votes and funding are not real-world events or money.", "Simulation politique de jeu. Les personnages et partis de ce système sont fictifs ; votes et financements ne représentent ni faits ni argent réels."))}`;
}

export function politicsView(s, tab = "overview") {
  const p = s.politics;
  const active = tabs.some(([id]) => id === tab) ? tab : "overview";
  const labels = tabs
    .map(
      ([id, words]) =>
        `<button class="politics-tab ${active === id ? "active" : ""}" data-action="politics-tab" data-id="${id}">${tr(...words)}</button>`,
    )
    .join("");
  const body =
    active === "overview"
      ? overview(s)
      : active === "map"
        ? mapView(s)
        : active === "campaign"
          ? campaignView(s)
          : active === "council"
            ? councilView(s)
            : active === "committees"
              ? committeeView(s)
              : active === "opposition"
                ? oppositionView(s)
                : active === "foreign"
                  ? foreignView(s)
                  : active === "legacy"
                    ? legacyView(s)
                    : eventsView(s);
  return `<div class="presidency-page">${heading(tr("المرحلة ١٣ · نظام الحكم", "Phase 13 · governance", "Phase 13 · gouvernance"), tr("رئاسة الاتحاد", "Football Association Presidency", "Présidence de la fédération"), tr("لعبة سياسة كاملة داخل Empire FC: أصوات وتحالفات وحملات وقرارات علنية؛ نزاهتك ومصيرك السياسي يتأثران بكل صفقة.", "A full political game inside Empire FC: votes, alliances, campaigns, public decisions, and a political future shaped by every deal.", "Un jeu politique complet dans Empire FC : votes, alliances, campagnes et décisions publiques ; chaque accord façonne votre intégrité et votre avenir."))}
  <nav class="politics-tabs" aria-label="${tr("أقسام رئاسة الاتحاد", "Presidency sections", "Rubriques de la présidence")}">${labels}</nav>
  <div class="politics-content" data-political-tab="${active}">${body}</div>
  <div class="politics-integrity-foot"><span>${tr("شرعية", "Legitimacy", "Légitimité")}: <b>${num(Math.round(p.legitimacy))}٪</b></span><span>${tr("نزاهة", "Integrity", "Intégrité")}: <b>${num(Math.round(p.integrity.score))}٪</b></span><span>${tr("أندية الخريطة", "Mapped clubs", "Clubs cartographiés")}: <b>${num(p.clubs.length)}</b></span></div></div>`;
}
