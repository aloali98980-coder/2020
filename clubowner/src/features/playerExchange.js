import { getLanguage, tr, translateText } from "../i18n/index.js";
import { badge, button } from "../components/shared.js";
import { clubInfo, transferClubIds } from "../services/transferNegotiation.js";
import {
  exchangeFairness,
  exchangeOutcomeReason,
  exchangeValues,
  suggestedExchangeCash,
  transferWindowId,
} from "../services/playerExchange.js";
import { cur, esc, money, num } from "../ui/format.js";

const playerName = (player) =>
  getLanguage() === "ar"
    ? player?.name || ""
    : player?.nameLatin || player?.name || "";
const clubName = (id) => {
  const name = clubInfo(id).name;
  return getLanguage() === "ar" ? name : translateText(name);
};
const findPlayer = (s, id) =>
  s.players.find((player) => player.id === id) ||
  s.retired?.find((player) => player.id === id) ||
  null;
const activeExchanges = (s) =>
  (s.transferMarket?.exchanges || []).filter((deal) =>
    ["open", "agreed"].includes(deal.status),
  );
const exchangeStatus = (status) =>
  ({
    open: tr("عرض بانتظارك", "Offer awaiting you", "Offre en attente"),
    agreed: tr("اتفاق مبدئي", "Agreed in principle", "Accord de principe"),
    completed: tr("اكتمل", "Completed", "Terminé"),
    rejected: tr("مرفوض", "Rejected", "Refusé"),
    expired: tr("انتهت المهلة", "Expired", "Expiré"),
  })[status] || status;
const cashDescription = (deal) =>
  deal.cash > 0
    ? tr("تدفع", "You pay", "Vous payez")
    : deal.cash < 0
      ? tr("تستلم", "You receive", "Vous recevez")
      : tr("لا نقد", "No cash", "Sans argent");

function exchangeCard(s, deal) {
  const separator = getLanguage() === "ar" ? "، " : ", ";
  const outgoing = deal.outgoingPlayerIds
    .map((id) => findPlayer(s, id))
    .filter(Boolean)
    .map((player) => playerName(player))
    .join(separator);
  const incoming = deal.incomingPlayerIds
    .map((id) => findPlayer(s, id))
    .filter(Boolean)
    .map((player) => playerName(player))
    .join(separator);
  const cash = deal.cash ? Math.abs(deal.cash) : 0;
  return `<article class="exchange-deal-card"><div><strong>${esc(clubName(deal.opponentId))}</strong>${badge(exchangeStatus(deal.status), deal.status === "agreed" ? "green" : "gold")}</div><p><span>${esc(outgoing || "—")}</span><b>↔</b><span>${esc(incoming || "—")}</span></p><small>${cashDescription(deal)} ${money(cash)} ${cur()} · ${num(deal.outgoingPlayerIds.length)} × ${num(deal.incomingPlayerIds.length)}</small>${deal.reason ? `<p class="exchange-warning">${esc(deal.reason)}</p>` : ""}${button(tr("مراجعة التبادل", "Review exchange", "Examiner l’échange"), "player-exchange-view", deal.id, "small primary")}</article>`;
}

export function playerExchangePanel(s) {
  const rosterByClub = new Map();
  for (const player of s.players) {
    if (player.status === "retired" || player.loan) continue;
    const roster = rosterByClub.get(player.clubId) || [];
    roster.push(player);
    rosterByClub.set(player.clubId, roster);
  }
  const opponents = transferClubIds(s)
    .filter((id) => id !== s.clubId && (rosterByClub.get(id)?.length || 0) > 0)
    .sort((a, b) => clubInfo(b).rep - clubInfo(a).rep || clubName(a).localeCompare(clubName(b)))
    .slice(0, 40);
  const current = activeExchanges(s);
  const windowOpen = Boolean(transferWindowId(s));
  const recent = (s.transferMarket?.exchanges || [])
    .filter((deal) => ["completed", "rejected", "expired"].includes(deal.status))
    .slice(-4)
    .reverse();
  const launcher = !windowOpen
    ? `<p class="muted">${tr("التبادل متاح خلال نافذة الانتقالات فقط.", "Exchanges are only available during a transfer window.", "Les échanges ne sont possibles que pendant une période de transferts.")}</p>`
    : opponents.length
      ? `<div class="exchange-builder-launch"><label class="field"><span>${tr("اختر النادي المنافس", "Choose an opponent", "Choisir un club adverse")}</span><select id="player-exchange-opponent">${opponents
        .map((id, index) => `<option value="${esc(id)}" ${index === 0 ? "selected" : ""}>${esc(clubName(id))}</option>`)
        .join("")}</select></label>${button(tr("إنشاء تبادل لاعبين", "Build player exchange", "Créer un échange de joueurs"), "player-exchange-builder", "", "primary")}</div>`
    : `<p class="muted">${tr("لا يوجد نادٍ آخر لديه لاعبون متاحون للتبادل.", "No other club has players available for an exchange.", "Aucun autre club n’a de joueurs disponibles pour un échange.")}</p>`;
  return `<section class="panel player-exchange-panel"><div class="panel-head"><h3>${tr("تبادل اللاعبين", "Player exchange", "Échange de joueurs")}</h3>${badge(tr("حتى 5 مقابل 5", "Up to 5 for 5", "Jusqu’à 5 contre 5"), "outline")}</div><p class="muted">${tr("اختر لاعبين من الطرفين، ووازن فرق القيمة بالنقد. كل لاعب يوافق على راتبه ومستوى النادي والمدينة؛ رفض لاعب واحد يلغي الصفقة كلها.", "Select players on both sides and balance value with cash. Each player considers wages, club level and city; one refusal cancels the whole deal.", "Choisissez des joueurs des deux côtés et équilibrez la valeur avec de l’argent. Chaque joueur évalue le salaire, le niveau du club et la ville ; un seul refus annule tout l’échange.")}</p>${launcher}${current.length ? `<div class="exchange-deal-list">${current.slice(-4).reverse().map((deal) => exchangeCard(s, deal)).join("")}</div>` : `<p class="muted">${tr("لا توجد عروض تبادل نشطة. قد تعرض الأندية تبادلات في منتصف الشهر.", "No active exchange offers. Clubs may propose exchanges mid-month.", "Aucune offre d’échange active. Les clubs peuvent proposer un échange en milieu de mois.")}</p>`}${recent.length ? `<details class="exchange-history"><summary>${tr("سجل التبادلات", "Exchange history", "Historique des échanges")}</summary>${recent.map((deal) => `<p>${esc(clubName(deal.opponentId))} · ${exchangeStatus(deal.status)}${deal.reason ? ` — ${esc(deal.reason)}` : ""}</p>`).join("")}</details>` : ""}</section>`;
}

function playerOption(player, side, isIncoming = false) {
  const id = esc(player.id);
  const salary = Math.max(0, Math.round(player.salary || 0));
  return `<div class="exchange-player-choice"><label><input type="checkbox" name="${side}Player" value="${id}" data-exchange-side="${side}" data-value="${Math.max(0, Math.round(player.value || 0))}"><span><strong>${esc(playerName(player))}</strong><small>${esc(player.position || "—")} · ${tr("التقييم", "Rating", "Note")} ${num(Math.round(player.rating || 0))} · ${tr("القيمة", "Value", "Valeur")} ${money(player.value || 0)} ${cur()} · ${tr("الراتب", "Wage", "Salaire")} ${money(salary)} ${cur()}</small></span></label>${isIncoming ? `<label class="exchange-wage-input"><span>${tr("الراتب بعد التبادل", "New monthly wage", "Nouveau salaire mensuel")}</span><input type="number" min="0" step="1" value="${salary}" data-exchange-wage="${id}"></label>` : ""}</div>`;
}

function playerList(players, side, isIncoming = false) {
  if (!players.length)
    return `<p class="muted">${tr("لا يوجد لاعبون متاحون.", "No available players.", "Aucun joueur disponible.")}</p>`;
  return `<div class="exchange-player-list">${players
    .map((player) => playerOption(player, side, isIncoming))
    .join("")}</div>`;
}

export function playerExchangeView(s, opponentId) {
  const opponent = transferClubIds(s).includes(opponentId) && opponentId !== s.clubId;
  if (!opponent)
    return `<h2>${tr("نادي التبادل غير متاح", "Exchange club unavailable", "Club indisponible")}</h2>`;
  const ownPlayers = s.players
    .filter((player) => player.clubId === s.clubId && player.status !== "retired" && !player.loan)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.value || 0) - (a.value || 0));
  const opponentPlayers = s.players
    .filter((player) => player.clubId === opponentId && player.status !== "retired" && !player.loan)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.value || 0) - (a.value || 0));
  const values = exchangeValues(s, [], []);
  const initialCash = suggestedExchangeCash(s, [], []);
  return `<span class="eyebrow">${tr("مفاوضة تبادل اللاعبين", "Player exchange builder", "Préparer l’échange")}</span><h2>${esc(clubName(s.clubId))} ↔ ${esc(clubName(opponentId))}</h2><p class="muted">${tr("اختر من لاعب إلى خمسة لاعبين من كل نادٍ. النقد الموجب تدفعه أنت؛ والسالب يدفعه النادي الآخر.", "Choose 1 to 5 players from each club. Positive cash is paid by you; negative cash is paid by the other club.", "Choisissez 1 à 5 joueurs par club. Un montant positif est payé par vous ; un montant négatif par l’autre club.")}</p><form id="player-exchange-form" data-opponent-id="${esc(opponentId)}"><div class="exchange-builder-grid"><section><h3>${tr("يغادر ناديك", "Leaving your club", "Quitte votre club")}</h3>${playerList(ownPlayers, "outgoing")}</section><section><h3>${tr("ينضمون إلى ناديك", "Joining your club", "Rejoignent votre club")}</h3>${playerList(opponentPlayers, "incoming", true)}</section></div><div class="exchange-balance"><label class="field"><span>${tr("مبلغ الموازنة النقدية", "Balancing cash", "Compensation en espèces")} (${cur()})</span><input type="number" name="cash" step="1" value="${initialCash}" data-exchange-cash required></label><button type="button" class="btn secondary small" data-action="exchange-auto-balance">${tr("موازنة تلقائية", "Auto-balance cash", "Équilibrage automatique")}</button><p data-exchange-summary data-out-value="${values.outgoingValue}" data-in-value="${values.incomingValue}">${tr("القيمة التي تغادر ناديك", "Value leaving your club", "Valeur quittant votre club")}: ${money(values.outgoingValue)} ${cur()} · ${tr("القيمة التي تستلمها", "Value received", "Valeur reçue")}: ${money(values.incomingValue)} ${cur()}</p></div><p class="muted">${tr("سيُرفض العرض تلقائيًا إذا تجاوز فرق القيمة 15% أو خالف حد التشكيلة أو ميزانية الرواتب أو نافذة الانتقالات.", "Offers are auto-rejected if the value gap exceeds 15% or squad, wage-budget or transfer-window checks fail.", "L’offre est refusée automatiquement si l’écart dépasse 15 % ou si l’effectif, le budget salarial ou la période de transfert ne convient pas.")}</p><div class="modal-actions"><button class="btn primary" type="submit">${tr("إرسال اقتراح التبادل", "Send exchange proposal", "Envoyer la proposition")}</button></div></form>`;
}

function dealPlayerList(s, ids, wageOffers = null) {
  return `<ul>${ids
    .map((id) => {
      const player = findPlayer(s, id);
      const wage = wageOffers?.[id];
      return `<li>${esc(playerName(player))}${wage !== undefined ? ` <small>· ${tr("راتب", "wage", "salaire")} ${money(wage)} ${cur()}</small>` : ` <small>· ${money(player?.value || 0)} ${cur()}</small>`}</li>`;
    })
    .join("")}</ul>`;
}

export function playerExchangeDealView(s, dealId) {
  const deal = s.transferMarket?.exchanges?.find((item) => item.id === dealId);
  if (!deal)
    return `<h2>${tr("عرض التبادل غير متاح", "Exchange offer unavailable", "Offre indisponible")}</h2>`;
  const fairness = exchangeFairness(
    s,
    deal.outgoingPlayerIds,
    deal.incomingPlayerIds,
    deal.cash,
  );
  const preview = ["open", "agreed"].includes(deal.status)
    ? exchangeOutcomeReason(s, deal)
    : null;
  const approvals = preview?.approvals || deal.approvals || [];
  const approvalRows = approvals.length
    ? `<h3>${tr("موافقة كل لاعب", "Individual player approval", "Accord de chaque joueur")}</h3><ul class="exchange-approvals">${approvals
        .map((item) => `<li class="${item.approved ? "approved" : "refused"}"><span>${esc(item.name || playerName(findPlayer(s, item.playerId)))}</span><b>${item.approved ? tr("يوافق", "Approves", "Accepte") : tr("يرفض", "Refuses", "Refuse")}</b>${item.reason ? `<small>${esc(item.reason)}</small>` : ""}</li>`)
        .join("")}</ul>`
    : "";
  const summary = preview && !preview.ok
    ? `<p class="exchange-warning">${esc(preview.reason)}</p>`
    : deal.reason
      ? `<p class="exchange-warning">${esc(deal.reason)}</p>`
      : "";
  const cash = Math.abs(deal.cash || 0);
  const actionButtons = ["open", "agreed"].includes(deal.status)
    ? `<div class="modal-actions">${button(tr("تأكيد التبادل", "Complete exchange", "Confirmer l’échange"), "player-exchange-accept", deal.id, "primary")}${button(tr("رفض العرض", "Decline offer", "Refuser l’offre"), "player-exchange-reject", deal.id, "ghost")}</div>`
    : `<p class="muted">${exchangeStatus(deal.status)}${deal.completedOn ? ` · ${deal.completedOn}` : ""}</p>`;
  return `<span class="eyebrow">${tr("مراجعة التبادل", "Exchange review", "Examen de l’échange")}</span><h2>${esc(clubName(deal.opponentId))} ↔ ${esc(clubName(s.clubId))}</h2><div class="exchange-builder-grid"><section><h3>${tr("يغادر ناديك", "Leaving your club", "Quitte votre club")}</h3>${dealPlayerList(s, deal.outgoingPlayerIds)}</section><section><h3>${tr("ينضمون إلى ناديك", "Joining your club", "Rejoignent votre club")}</h3>${dealPlayerList(s, deal.incomingPlayerIds, deal.wageOffers)}</section></div><div class="exchange-value-summary"><div><small>${tr("قيمة لاعبيك", "Your players’ value", "Valeur de vos joueurs")}</small><strong>${money(fairness.outgoingValue)} ${cur()}</strong></div><div><small>${tr("القيمة المقابلة", "Other club’s value", "Valeur de l’autre club")}</small><strong>${money(fairness.incomingValue)} ${cur()}</strong></div><div><small>${tr("موازنة النقد", "Cash balancing", "Compensation")}</small><strong>${cashDescription(deal)} ${money(cash)} ${cur()}</strong></div></div><p class="muted">${tr("فرق القيمة", "Value gap", "Écart de valeur")}: ${num(Math.round(fairness.differenceRatio * 100))}% · ${tr("الهامش المسموح", "Allowed", "Limite autorisée")} ${num(Math.round(fairness.tolerance * 100))}% · ${tr("النافذة", "Window", "Période")}: ${esc(deal.windowId)}</p>${summary}${approvalRows}${["open", "agreed"].includes(deal.status) ? `<p class="muted">${tr("رفض لاعب واحد يُلغي الصفقة كاملة؛ لن تتغير الملكية أو الخزينة إلا بعد موافقة الجميع.", "One player's refusal cancels the entire deal; ownership and cash change only if everyone approves.", "Le refus d’un joueur annule tout l’échange ; aucune propriété ni somme ne change sans l’accord de tous.")}</p>` : ""}${actionButtons}`;
}
