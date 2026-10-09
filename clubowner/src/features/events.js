import { EVENT_CATALOG } from "../data/eventCatalog.js";
import { badge } from "../components/shared.js";
import { money, num, esc, cur } from "../ui/format.js";
import { tr } from "../i18n/index.js";

// أسماء فئات القائمة الموجَّهة (targets) — نفس مفاتيح data/events/conditions.js.
const SCOPE_LABEL = {
  all: () => tr("كل القائمة", "The whole squad", "Tout l’effectif"),
  veterans: () => tr("اللاعبون القدامى", "Veterans", "Les vétérans"),
  youngsters: () => tr("الشباب", "Youngsters", "Les jeunes"),
  keepers: () => tr("حراس المرمى", "Goalkeepers", "Les gardiens"),
  strikers: () => tr("المهاجمون", "Strikers", "Les attaquants"),
  defenders: () => tr("المدافعون", "Defenders", "Les défenseurs"),
  midfielders: () => tr("لاعبو الوسط", "Midfielders", "Les milieux"),
  lowRated: () => tr("الأقل تقييمًا", "Lower-rated players", "Les moins bien notés"),
  topRated: () => tr("الأعلى تقييمًا", "Top-rated players", "Les mieux notés"),
  lowMorale: () => tr("الأقل معنويات", "Low-morale players", "Au moral bas"),
  tired: () => tr("الأكثر إرهاقًا", "The most tired", "Les plus fatigués"),
  injured: () => tr("المصابون", "Injured players", "Les blessés"),
  fit: () => tr("الجاهزون", "Fit players", "Les joueurs aptes"),
  expiring: () =>
    tr(
      "أصحاب العقود القريبة من النهاية",
      "Players with expiring contracts",
      "Contrats en fin",
    ),
  abroad: () =>
    tr(
      "الغائبون مع المنتخبات",
      "Players away on international duty",
      "Absents en sélection",
    ),
};
const scopeLabel = (scope) => (SCOPE_LABEL[scope] ? SCOPE_LABEL[scope]() : scope);

const L = {
  cash: () => tr("أثر السيولة", "Cash impact", "Effet sur la trésorerie"),
  income: () => tr("إيراد لاحق", "Income later", "Recette ultérieure"),
  cost: () => tr("التزام لاحق", "Cost later", "Charge ultérieure"),
  fans: () => tr("ثقة الجمهور", "Fan support", "Soutien du public"),
  morale: () => tr("المعنويات", "Morale", "Moral"),
  fitness: () => tr("الجاهزية", "Fitness", "Forme"),
  reputation: () => tr("سمعة النادي", "Club reputation", "Réputation du club"),
  wageBudget: () => tr("بند الرواتب", "Wage budget", "Masse salariale"),
  ticketPrice: () => tr("سعر التذكرة", "Ticket price", "Prix du billet"),
  capacity: () => tr("سعة الملعب", "Stadium capacity", "Capacité du stade"),
  youth: () =>
    tr(
      "ناشئون مولّدون داخل عالم اللعبة",
      "Generated academy prospects",
      "Jeunes générés dans le monde du jeu",
    ),
  signing: () =>
    tr(
      "صفقة مولّدة بشروط معلنة",
      "Generated signing on published terms",
      "Recrutement généré aux conditions publiées",
    ),
  report: () =>
    tr(
      "تقرير عن لاعب من السوق",
      "Report on a market player",
      "Rapport sur un joueur du marché",
    ),
  press: () =>
    tr("يصل إلى ملف الصحافة", "Reaches the press feed", "Atteint le fil de presse"),
  note: () =>
    tr(
      "أثر إضافي مسجّل في البريد",
      "Extra effect logged in the inbox",
      "Effet supplémentaire dans la messagerie",
    ),
  sponsorOffer: () =>
    tr(
      "يفتح فرصة رعاية",
      "Opens a sponsorship opportunity",
      "Ouvre une opportunité de sponsoring",
    ),
  injuryShorter: () => tr("تقصير الغياب", "Shorter absence", "Absence raccourcie"),
  injuryRisk: () =>
    tr(
      "إصابة الأقل جاهزية",
      "Injures the least fit player",
      "Blesse le joueur le moins apte",
    ),
  none: () =>
    tr(
      "بلا أثر مباشر مسجّل",
      "No direct recorded effect",
      "Aucun effet direct enregistré",
    ),
  apply: () => tr("نفّذ القرار", "Apply the decision", "Appliquer la décision"),
  broke: () => tr("السيولة لا تكفي", "Not enough cash", "Trésorerie insuffisante"),
  full: () => tr("القائمة ممتلئة", "Squad is full", "Effectif complet"),
  after: () => tr("بعد", "after", "après"),
  days: () => tr("يومًا", "days", "jours"),
  yes: () => tr("نعم", "yes", "oui"),
  months: () => tr("شهرًا", "months", "mois"),
  contract: () => tr("مدة العقد", "contract", "contrat"),
  age: () => tr("العمر", "age", "âge"),
  rating: () => tr("التقييم", "rating", "note"),
  wage: () => tr("الراتب", "wage", "salaire"),
  count: () => tr("العدد", "count", "nombre"),
  perMonth: () => tr("شهريًا", "per month", "par mois"),
  twoYears: () => tr("عقد سنتين", "two-year contract", "contrat de deux ans"),
  inFile: () =>
    tr(
      "متاح في ملف اللاعب",
      "available in the player file",
      "disponible dans la fiche du joueur",
    ),
  onAsset: () =>
    tr(
      "على الأصل التجاري",
      "on the commercial asset",
      "sur l’actif commercial",
    ),
};

const daysLabel = (n) => `${L.after()} ${num(n)} ${L.days()}`;

const signingTerms = (sig) => {
  const parts = [
    `${L.age()} ${num(sig.age ?? 17)}`,
    `${L.rating()} ${num(sig.rating ?? 55)}`,
    `${L.wage()} ${money(sig.wage ?? 25000)} ${cur()}`,
    `${L.contract()} ${num(Math.round((sig.contractDays ?? 730) / 30))} ${L.months()}`,
  ];
  if (sig.count && sig.count > 1) parts.unshift(`${L.count()} ${num(sig.count)}`);
  return parts.join(" · ");
};

const youthCount = (c) =>
  typeof c.youth === "number" ? c.youth : c.youth ? 1 : 0;

// الآثار المعلنة لقرار واحد — تُعرض قبل التنفيذ حتى يبقى الأثر صريحًا لا مفاجأة.
export function choiceEffects(c) {
  const rows = [];
  if (c.cash) rows.push([L.cash(), `${money(c.cash)} ${cur()}`]);
  if (c.incomeLater)
    rows.push([
      L.income(),
      `+${money(c.incomeLater)} ${cur()} · ${daysLabel(c.incomeDays || 30)}`,
    ]);
  if (c.costLater)
    rows.push([
      L.cost(),
      `−${money(c.costLater)} ${cur()} · ${daysLabel(c.costDays || 30)}`,
    ]);
  if (c.fans) rows.push([L.fans(), num(c.fans)]);
  if (c.morale) rows.push([`${L.morale()} · ${scopeLabel("all")}`, num(c.morale)]);
  if (c.fitness)
    rows.push([`${L.fitness()} · ${scopeLabel("all")}`, num(c.fitness)]);
  if (c.reputation) rows.push([L.reputation(), num(c.reputation)]);
  if (c.wageBudget)
    rows.push([L.wageBudget(), `${money(c.wageBudget)} ${cur()}`]);
  if (c.ticketPrice)
    rows.push([L.ticketPrice(), `${money(c.ticketPrice)} ${cur()}`]);
  if (c.capacity) rows.push([L.capacity(), num(c.capacity)]);
  for (const t of c.targets || []) {
    const who = scopeLabel(t.scope);
    if (t.morale) rows.push([`${L.morale()} · ${who}`, num(t.morale)]);
    if (t.fitness) rows.push([`${L.fitness()} · ${who}`, num(t.fitness)]);
    if (t.injuryDays && t.injuryDays < 0)
      rows.push([`${L.injuryShorter()} · ${who}`, num(Math.abs(t.injuryDays))]);
    if (t.injuryDays && t.injuryDays > 0)
      rows.push([`${L.injuryRisk()} · ${who}`, `${num(t.injuryDays)} ${L.days()}`]);
  }
  if (youthCount(c))
    rows.push([
      L.youth(),
      `${num(youthCount(c))} · ${L.wage()} ${money(25000)} ${cur()} ${L.perMonth()} · ${L.twoYears()}`,
    ]);
  if (c.signing) rows.push([L.signing(), signingTerms(c.signing)]);
  if (c.report) rows.push([L.report(), L.inFile()]);
  if (c.sponsorOffer) rows.push([L.sponsorOffer(), L.onAsset()]);
  if (c.press) rows.push([L.press(), L.yes()]);
  if (c.note) rows.push([L.note(), L.yes()]);
  return rows;
}

export function eventDecisionView(s, id) {
  const ev = s.clubDecisions.find((e) => e.id === id);
  if (!ev) return "";
  const data = EVENT_CATALOG.find((e) => e.id === ev.type);
  if (!data) return "";
  const limit = s.squadLimit || 30;
  const ownCount = s.players.filter(
    (p) => p.clubId === s.clubId && p.status === "active",
  ).length;
  return `<div class="event-choices">${data.choices
    .map((c) => {
      const rows = choiceEffects(c);
      const incoming = youthCount(c) + (c.signing ? c.signing.count || 1 : 0);
      const broke = c.cash < 0 && s.finance.cash < -c.cash;
      const full = incoming > 0 && ownCount + incoming > limit;
      const blocked = broke || full;
      const reason = broke ? L.broke() : full ? L.full() : "";
      return `<article><h4>${esc(c.label)}</h4><ul>${
        rows.length
          ? rows
              .map(
                ([k, v]) =>
                  `<li>${esc(k)}: <b dir="auto">${esc(String(v))}</b></li>`,
              )
              .join("")
          : `<li>${esc(L.none())}</li>`
      }</ul>${blocked ? badge(reason, "gold") : ""}<button class="btn soft full" data-action="event-choice" data-id="${id}" data-choice="${
        c.id
      }" ${blocked ? "disabled" : ""}>${esc(L.apply())}</button></article>`;
    })
    .join("")}</div>`;
}
