import { addDays, assert, clamp, random, uid } from "../core/utils.js";
import { getLanguage, tr, translateText } from "../i18n/index.js";
import { closeThread, message } from "./inbox.js";
import { hasReleaseClause } from "./releaseClause.js";
import { aiClubBudget, clubInfo, ensureTransferMarket, transferClubIds } from "./transferNegotiation.js";
import { marketOpen } from "./market.js";
import { post, wages } from "./finance.js";

export const EXCHANGE_MAX_PLAYERS = 5;
export const EXCHANGE_FAIR_TOLERANCE = 0.15;
export const EXCHANGE_OFFER_DAYS = 3;
const ACTIVE_EXCHANGE_STATES = new Set(["open", "agreed"]);
const amount = (n) => Number.isSafeInteger(n);
const clubPlayerName = (player) =>
  getLanguage() === "ar"
    ? player?.name || ""
    : player?.nameLatin || player?.name || "";
const playerValue = (player) =>
  Math.max(0, Math.round(Number(player?.value) || 0));
const playerWage = (player) =>
  Math.max(0, Math.round(Number(player?.salary) || 0));

export function transferWindowId(s, date = s?.date) {
  if (!date || !marketOpen(s, date)) return null;
  const monthDay = date.slice(5);
  const year = date.slice(0, 4);
  if (monthDay >= "07-01" && monthDay <= "09-30") return `summer-${year}`;
  if (monthDay >= "01-01" && monthDay <= "01-31") return `winter-${year}`;
  return `continuous-${year}`;
}

function exchangesFor(s) {
  return ensureTransferMarket(s).exchanges;
}

function activePlayerIds(s, exceptId = null) {
  const blocked = new Set();
  const market = s.transferMarket || {};
  for (const deal of market.exchanges || []) {
    if (deal.id === exceptId || !ACTIVE_EXCHANGE_STATES.has(deal.status)) continue;
    for (const id of [...(deal.outgoingPlayerIds || []), ...(deal.incomingPlayerIds || [])])
      blocked.add(id);
  }
  for (const deal of market.sales || [])
    if (["open", "agreed"].includes(deal.status)) blocked.add(deal.playerId);
  for (const auction of market.auctions || [])
    if (auction.status === "open") blocked.add(auction.playerId);
  for (const offer of s.management?.outgoing || [])
    if (offer.status === "open") blocked.add(offer.playerId);
  return blocked;
}

function activeRosterPlayer(s, playerId, clubId, blocked) {
  const player = s.players.find((item) => item.id === playerId);
  assert(
    player &&
      player.clubId === clubId &&
      player.status !== "retired" &&
      !player.loan,
    tr(
      "أحد اللاعبين غير متاح أو مرتبط بصفقة أخرى.",
      "A selected player is unavailable or already involved in another deal.",
      "Un joueur sélectionné est indisponible ou déjà engagé dans un autre transfert.",
    ),
  );
  assert(
    !hasReleaseClause(player),
    tr(
      "اللاعب محمي بشرط جزائي — لا انتقال إلا بالشرط الجزائي.",
      "The player is protected by a release clause — no transfer except by the release clause.",
      "Le joueur est protégé par une clause libératoire — aucun transfert hors clause.",
    ),
  );
  assert(
    !blocked.has(player.id),
    tr(
      "أحد اللاعبين غير متاح أو مرتبط بصفقة أخرى.",
      "A selected player is unavailable or already involved in another deal.",
      "Un joueur sélectionné est indisponible ou déjà engagé dans un autre transfert.",
    ),
  );
  return player;
}

function distinctIds(ids, label) {
  assert(
    Array.isArray(ids) &&
      ids.length >= 1 &&
      ids.length <= EXCHANGE_MAX_PLAYERS &&
      new Set(ids).size === ids.length &&
      ids.every((id) => typeof id === "string" && id.length > 0),
    tr(
      `اختر من لاعب إلى ${EXCHANGE_MAX_PLAYERS} لاعبين في ${label}.`,
      `Select 1 to ${EXCHANGE_MAX_PLAYERS} players in ${label}.`,
      `Sélectionnez 1 à ${EXCHANGE_MAX_PLAYERS} joueurs dans ${label}.`,
    ),
  );
  return [...ids];
}

function findPlayer(s, id) {
  return s.players.find((player) => player.id === id) ||
    s.retired?.find((player) => player.id === id) ||
    null;
}

export function exchangeValues(s, outgoingPlayerIds = [], incomingPlayerIds = []) {
  const outgoingValue = outgoingPlayerIds.reduce(
    (total, id) => total + playerValue(findPlayer(s, id)),
    0,
  );
  const incomingValue = incomingPlayerIds.reduce(
    (total, id) => total + playerValue(findPlayer(s, id)),
    0,
  );
  return { outgoingValue, incomingValue };
}

export function suggestedExchangeCash(s, outgoingPlayerIds, incomingPlayerIds) {
  const { outgoingValue, incomingValue } = exchangeValues(
    s,
    outgoingPlayerIds,
    incomingPlayerIds,
  );
  // Positive means your club pays the other club; negative means it pays you.
  return incomingValue - outgoingValue;
}

export function exchangeFairness(
  s,
  outgoingPlayerIds,
  incomingPlayerIds,
  cash = 0,
) {
  const { outgoingValue, incomingValue } = exchangeValues(
    s,
    outgoingPlayerIds,
    incomingPlayerIds,
  );
  const userGives = outgoingValue + Math.max(0, cash);
  const userReceives = incomingValue + Math.max(0, -cash);
  const denominator = Math.max(1, userGives, userReceives);
  const difference = Math.abs(userGives - userReceives);
  const differenceRatio = difference / denominator;
  return {
    outgoingValue,
    incomingValue,
    userGives,
    userReceives,
    difference,
    differenceRatio,
    tolerance: EXCHANGE_FAIR_TOLERANCE,
    balanced: differenceRatio <= EXCHANGE_FAIR_TOLERANCE,
  };
}

function rosterCount(s, clubId) {
  return s.players.filter(
    (player) =>
      player.status !== "retired" &&
      (player.clubId === clubId || player.loan?.parent === clubId),
  ).length;
}

function rosterWages(s, clubId) {
  return s.players
    .filter((player) => player.status !== "retired" && player.clubId === clubId)
    .reduce((total, player) => total + playerWage(player), 0);
}

function wageOfferFor(deal, playerId, player) {
  return deal.wageOffers?.[playerId] ?? playerWage(player);
}

function aiWageBudget(s, clubId) {
  const payroll = rosterWages(s, clubId);
  const cashLimit = Math.round(aiClubBudget(s, clubId) * 0.1);
  return Math.max(payroll + Math.max(100_000, Math.round(payroll * 0.15)), cashLimit);
}

function exchangeReason(code, extra = "") {
  const reasons = {
    "fair-value": tr(
      "رُفض العرض تلقائيًا: فرق القيمة يتجاوز هامش 15%. أضف مبلغًا للموازنة.",
      "Auto-rejected: the value gap exceeds 15%. Add balancing cash.",
      "Offre refusée automatiquement : l’écart dépasse 15 %. Ajoutez une compensation.",
    ),
    window: tr(
      "انتهت نافذة الانتقالات أو تغيّرت؛ يجب إتمام التبادل داخل النافذة نفسها.",
      "The transfer window closed or changed; the exchange must finish in the same window.",
      "La période de transferts est terminée ou a changé ; l’échange doit être conclu dans la même fenêtre.",
    ),
    roster: tr(
      "قائمة أحد الناديين ستتجاوز حد التشكيلة بعد التبادل.",
      "One club would exceed its squad limit after the exchange.",
      "L’effectif d’un des clubs dépasserait sa limite après l’échange.",
    ),
    "wage-budget": tr(
      "راتب أحد الطرفين سيتجاوز ميزانية الأجور بعد التبادل.",
      "One club would exceed its wage budget after the exchange.",
      "Un des clubs dépasserait son budget salarial après l’échange.",
    ),
    cash: tr(
      "لا يملك الطرف الذي سيدفع المبلغ رصيدًا كافيًا.",
      "The paying club does not have enough available cash.",
      "Le club qui doit payer ne dispose pas de fonds suffisants.",
    ),
    player: tr(
      "تغيرت ملكية أحد اللاعبين أو لم يعد متاحًا؛ أُلغيت الصفقة كاملة.",
      "A player's club or availability changed; the entire deal was cancelled.",
      "Le club ou la disponibilité d’un joueur a changé ; l’échange entier est annulé.",
    ),
    wage: tr(
      "رفض اللاعب التبادل لأن عرض الأجر أقل من توقعاته.",
      "The player refused because the wage offer is below expectations.",
      "Le joueur refuse car le salaire proposé est inférieur à ses attentes.",
    ),
    "club-level": tr(
      "رفض اللاعب الانتقال إلى نادٍ بمستوى أدنى.",
      "The player refused a move to a lower-level club.",
      "Le joueur refuse de rejoindre un club de niveau inférieur.",
    ),
    city: tr(
      "رفض اللاعب الانتقال بسبب المدينة أو البُعد عن تفضيلاته.",
      "The player refused because of the destination city or personal preference.",
      "Le joueur refuse en raison de la ville de destination ou de ses préférences.",
    ),
  };
  const base = reasons[code] || tr(
    "رفض أحد اللاعبين؛ أُلغيت الصفقة كاملة.",
    "A player refused; the entire deal was cancelled.",
    "Un joueur refuse ; l’échange entier est annulé.",
  );
  return extra ? `${base} ${extra}` : base;
}

function assessResources(s, deal) {
  if (transferWindowId(s) !== deal.windowId)
    return { ok: false, code: "window", reason: exchangeReason("window") };
  const ownPlayers = deal.outgoingPlayerIds.map((id) => s.players.find((p) => p.id === id));
  const targetPlayers = deal.incomingPlayerIds.map((id) => s.players.find((p) => p.id === id));
  if (
    ownPlayers.some((p) => !p || p.clubId !== s.clubId || p.status === "retired" || p.loan) ||
    targetPlayers.some((p) => !p || p.clubId !== deal.opponentId || p.status === "retired" || p.loan)
  )
    return { ok: false, code: "player", reason: exchangeReason("player") };

  const fairness = exchangeFairness(
    s,
    deal.outgoingPlayerIds,
    deal.incomingPlayerIds,
    deal.cash,
  );
  if (!fairness.balanced)
    return {
      ok: false,
      code: "fair-value",
      reason: exchangeReason("fair-value"),
      fairness,
    };

  const squadLimit = s.squadLimit || 45;
  const userRoster = rosterCount(s, s.clubId) - ownPlayers.length + targetPlayers.length;
  const aiRoster = rosterCount(s, deal.opponentId) - targetPlayers.length + ownPlayers.length;
  if (userRoster > squadLimit || aiRoster > squadLimit)
    return { ok: false, code: "roster", reason: exchangeReason("roster"), fairness };

  const userWages =
    wages(s) - ownPlayers.reduce((n, p) => n + playerWage(p), 0) +
    targetPlayers.reduce((n, p) => n + wageOfferFor(deal, p.id, p), 0);
  const aiWages =
    rosterWages(s, deal.opponentId) -
    targetPlayers.reduce((n, p) => n + playerWage(p), 0) +
    ownPlayers.reduce((n, p) => n + playerWage(p), 0);
  if (userWages > (s.finance.wageBudget || 0) || aiWages > aiWageBudget(s, deal.opponentId))
    return {
      ok: false,
      code: "wage-budget",
      reason: exchangeReason("wage-budget"),
      fairness,
      userWages,
      aiWages,
    };

  if (deal.cash > 0) {
    const userBudget = Object.hasOwn(s.expansion?.budgets || {}, s.clubId)
      ? Math.min(s.finance.cash || 0, s.expansion.budgets[s.clubId] || 0)
      : s.finance.cash || 0;
    if (userBudget < deal.cash)
      return { ok: false, code: "cash", reason: exchangeReason("cash"), fairness };
  } else if (deal.cash < 0 && aiClubBudget(s, deal.opponentId) < Math.abs(deal.cash)) {
    return { ok: false, code: "cash", reason: exchangeReason("cash"), fairness };
  }

  return { ok: true, fairness, userWages, aiWages, userRoster, aiRoster };
}

export function exchangePlayerApproval(s, player, destinationId, offeredWage = playerWage(player)) {
  const currentClub = clubInfo(player.clubId);
  const destination = clubInfo(destinationId);
  const currentWage = playerWage(player);
  if (!amount(offeredWage) || offeredWage < Math.ceil(currentWage * 0.95))
    return {
      approved: false,
      code: "wage",
      reason: exchangeReason("wage"),
      score: 0,
    };

  const wageRatio = currentWage > 0 ? offeredWage / currentWage : 1;
  const levelDifference = destination.rep - currentClub.rep;
  const cityChanged = destination.city !== currentClub.city;
  const preferredCity =
    player.preferredCity || player.cityPreference || player.hometown || null;
  const preferenceMismatch = Boolean(preferredCity && preferredCity !== destination.city);
  let score = 55;
  score += clamp((wageRatio - 1) * 35, -15, 15);
  score += clamp(levelDifference * 0.65, -20, 20);
  score += cityChanged ? -10 : 4;
  if (preferredCity) score += preferenceMismatch ? -25 : 10;

  if (score >= 40) return { approved: true, code: null, reason: null, score };
  const code = preferenceMismatch || cityChanged ? "city" : levelDifference <= -8 ? "club-level" : "wage";
  return { approved: false, code, reason: exchangeReason(code), score };
}

export function previewExchangeApprovals(s, deal) {
  const ownPlayers = deal.outgoingPlayerIds.map((id) => s.players.find((p) => p.id === id));
  const targetPlayers = deal.incomingPlayerIds.map((id) => s.players.find((p) => p.id === id));
  const approvals = [
    ...ownPlayers.map((player) => ({
      playerId: player.id,
      name: clubPlayerName(player),
      destinationId: deal.opponentId,
      ...exchangePlayerApproval(s, player, deal.opponentId, playerWage(player)),
    })),
    ...targetPlayers.map((player) => ({
      playerId: player.id,
      name: clubPlayerName(player),
      destinationId: s.clubId,
      ...exchangePlayerApproval(
        s,
        player,
        s.clubId,
        wageOfferFor(deal, player.id, player),
      ),
    })),
  ];
  return approvals;
}

function emitExchangeMessage(s, deal, title, body) {
  return message(s, {
    title,
    body,
    category: "transfers",
    kind: "player-exchange",
    ref: deal.id,
    deadline: deal.expires,
    required: ACTIVE_EXCHANGE_STATES.has(deal.status),
  });
}

function setExchangeStatus(s, deal, status, reason = null, reasonCode = null) {
  deal.status = status;
  if (reason) deal.reason = reason;
  if (reasonCode) deal.reasonCode = reasonCode;
  if (!ACTIVE_EXCHANGE_STATES.has(status)) closeThread(s, deal.id);
}

function exchangeMessageBody(s, deal) {
  const ownNames = deal.outgoingPlayerIds
    .map((id) => clubPlayerName(s.players.find((p) => p.id === id)))
    .join(", ");
  const targetNames = deal.incomingPlayerIds
    .map((id) => clubPlayerName(s.players.find((p) => p.id === id)))
    .join(", ");
  const opponentName =
    getLanguage() === "ar"
      ? clubInfo(deal.opponentId).name
      : translateText(clubInfo(deal.opponentId).name);
  const cashText = deal.cash > 0
    ? tr(`ناديك سيدفع ${deal.cash}`, `Your club pays ${deal.cash}`, `Votre club paie ${deal.cash}`)
    : deal.cash < 0
      ? tr(`ستحصل على ${Math.abs(deal.cash)}`, `You receive ${Math.abs(deal.cash)}`, `Vous recevez ${Math.abs(deal.cash)}`)
      : tr("دون مبلغ نقدي", "No cash payment", "Sans paiement en espèces");
  return tr(
    `${opponentName}: ${ownNames} مقابل ${targetNames} — ${cashText}.`,
    `${opponentName}: ${ownNames} for ${targetNames} — ${cashText}.`,
    `${opponentName} : ${ownNames} contre ${targetNames} — ${cashText}.`,
  );
}

function draftDeal(
  s,
  { opponentId, outgoingPlayerIds, incomingPlayerIds, cash = 0, wageOffers = {}, initiator = "user" },
  { save = true } = {},
) {
  const windowId = transferWindowId(s);
  assert(
    windowId && transferClubIds(s).includes(opponentId) && opponentId !== s.clubId,
    tr(
      "اختر ناديًا آخر أثناء نافذة الانتقالات.",
      "Choose another club during an open transfer window.",
      "Choisissez un autre club pendant une période de transferts ouverte.",
    ),
  );
  const outgoing = distinctIds(outgoingPlayerIds, tr("ناديك", "your club", "votre club"));
  const incoming = distinctIds(incomingPlayerIds, tr("النادي الآخر", "the other club", "l’autre club"));
  assert(amount(cash), tr("مبلغ الموازنة يجب أن يكون عددًا صحيحًا.", "The balancing cash must be a whole amount.", "La compensation doit être un montant entier."));
  const blocked = activePlayerIds(s);
  const ownPlayers = outgoing.map((id) => activeRosterPlayer(s, id, s.clubId, blocked));
  const targetPlayers = incoming.map((id) => activeRosterPlayer(s, id, opponentId, blocked));
  const salaryOffers = {};
  for (const player of targetPlayers) {
    const value = wageOffers?.[player.id] ?? playerWage(player);
    assert(
      amount(value) && value >= 0 && value <= 100_000_000,
      tr("عرض راتب غير صالح.", "A proposed wage is invalid.", "Un salaire proposé est invalide."),
    );
    salaryOffers[player.id] = value;
  }
  const deal = {
    id: uid(s, "exchange"),
    initiator,
    opponentId,
    outgoingPlayerIds: outgoing,
    incomingPlayerIds: incoming,
    cash,
    wageOffers: salaryOffers,
    windowId,
    createdOn: s.date,
    expires: addDays(s.date, EXCHANGE_OFFER_DAYS),
    status: "open",
  };
  if (save) exchangesFor(s).push(deal);
  return deal;
}

export function proposePlayerExchange(s, draft) {
  const deal = draftDeal(s, { ...draft, initiator: "user" });
  const market = ensureTransferMarket(s);
  const active = market.exchanges.filter((item) => ACTIVE_EXCHANGE_STATES.has(item.status));
  if (active.length > 2) {
    setExchangeStatus(s, deal, "rejected", exchangeReason("roster"), "roster");
    return deal;
  }
  const fairness = exchangeFairness(s, deal.outgoingPlayerIds, deal.incomingPlayerIds, deal.cash);
  if (!fairness.balanced) {
    setExchangeStatus(s, deal, "rejected", exchangeReason("fair-value"), "fair-value");
    deal.fairness = fairness;
    return deal;
  }
  const resources = assessResources(s, deal);
  if (!resources.ok) {
    setExchangeStatus(s, deal, "rejected", resources.reason, resources.code);
    deal.fairness = resources.fairness || fairness;
    return deal;
  }
  deal.fairness = resources.fairness;
  deal.status = "agreed";
  emitExchangeMessage(
    s,
    deal,
    tr("وافق النادي مبدئيًا على تبادل اللاعبين", "The club agreed to the exchange in principle", "Le club accepte l’échange en principe"),
    exchangeMessageBody(s, deal),
  );
  return deal;
}

export function createAiPlayerExchangeOffer(s) {
  const windowId = transferWindowId(s);
  if (!windowId) return null;
  const market = ensureTransferMarket(s);
  if (
    market.lastExchangeOfferDate === s.date ||
    market.exchanges.filter((deal) => ACTIVE_EXCHANGE_STATES.has(deal.status)).length >= 2
  )
    return null;
  const blocked = activePlayerIds(s);
  const ownPlayers = s.players
    .filter(
      (player) =>
        player.clubId === s.clubId &&
        player.status !== "retired" &&
        !player.loan &&
        !hasReleaseClause(player) &&
        player.value > 0 &&
        !blocked.has(player.id),
    )
    .sort((a, b) => playerValue(b) - playerValue(a));
  if (!ownPlayers.length) return null;
  const topOwn = ownPlayers.slice(0, Math.min(8, ownPlayers.length));
  const allOpponentPlayers = s.players.filter(
    (player) =>
      player.clubId !== s.clubId &&
      player.status !== "retired" &&
      !player.loan &&
      !hasReleaseClause(player) &&
      player.value > 0 &&
      !blocked.has(player.id),
  );
  if (!allOpponentPlayers.length) return null;
  const ownOrder = [...topOwn].sort(() => random(s) - 0.5);
  for (const ownPlayer of ownOrder) {
    const candidates = allOpponentPlayers
      .filter((player) => player.clubId !== s.clubId)
      .sort(
        (a, b) =>
          Math.abs(playerValue(a) - playerValue(ownPlayer)) -
          Math.abs(playerValue(b) - playerValue(ownPlayer)),
      )
      .slice(0, 15);
    for (const aiPlayer of candidates) {
      const opponentId = aiPlayer.clubId;
      const cash = playerValue(aiPlayer) - playerValue(ownPlayer);
      const draft = {
        opponentId,
        outgoingPlayerIds: [ownPlayer.id],
        incomingPlayerIds: [aiPlayer.id],
        cash,
        wageOffers: { [aiPlayer.id]: playerWage(aiPlayer) },
        initiator: "ai",
      };
      let deal;
      try {
        deal = draftDeal(s, draft, { save: false });
      } catch {
        continue;
      }
      const resources = assessResources(s, deal);
      if (!resources.ok) continue;
      market.exchanges.push(deal);
      deal.fairness = resources.fairness;
      market.lastExchangeOfferDate = s.date;
      emitExchangeMessage(
        s,
        deal,
        tr("عرض تبادل لاعبين من نادٍ آخر", "A club offered a player exchange", "Un club propose un échange de joueurs"),
        exchangeMessageBody(s, deal),
      );
      return deal;
    }
  }
  market.lastExchangeOfferDate = s.date;
  return null;
}

export function playerExchangeDay(s) {
  if (!s) return;
  const market = ensureTransferMarket(s);
  for (const deal of market.exchanges) {
    if (ACTIVE_EXCHANGE_STATES.has(deal.status) && deal.expires < s.date)
      setExchangeStatus(
        s,
        deal,
        "expired",
        tr("انتهت مهلة عرض التبادل.", "The exchange offer expired.", "L’offre d’échange a expiré."),
        "window",
      );
    else if (
      ACTIVE_EXCHANGE_STATES.has(deal.status) &&
      transferWindowId(s) !== deal.windowId
    )
      setExchangeStatus(s, deal, "expired", exchangeReason("window"), "window");
  }
  if (s.date.endsWith("-22")) createAiPlayerExchangeOffer(s);
}

export function completePlayerExchange(s, id) {
  const market = ensureTransferMarket(s);
  const deal = market.exchanges.find((item) => item.id === id);
  if (!deal || !ACTIVE_EXCHANGE_STATES.has(deal.status))
    return { status: deal?.status || "unavailable", deal: deal || null };
  if (deal.expires < s.date || transferWindowId(s) !== deal.windowId) {
    setExchangeStatus(s, deal, "expired", exchangeReason("window"), "window");
    return { status: "expired", deal, reason: deal.reason };
  }
  const resources = assessResources(s, deal);
  if (!resources.ok) {
    setExchangeStatus(s, deal, "rejected", resources.reason, resources.code);
    return { status: "rejected", deal, reason: deal.reason, reasonCode: deal.reasonCode };
  }
  const approvals = previewExchangeApprovals(s, deal);
  deal.approvals = approvals.map((approval) => ({
    playerId: approval.playerId,
    destinationId: approval.destinationId,
    approved: approval.approved,
    reason: approval.reason,
    reasonCode: approval.code,
  }));
  const refusal = approvals.find((approval) => !approval.approved);
  if (refusal) {
    deal.rejectedPlayerId = refusal.playerId;
    const playerName = refusal.name;
    const explanation = exchangeReason("player", `${playerName}: ${refusal.reason}`);
    setExchangeStatus(s, deal, "rejected", explanation, refusal.code);
    emitExchangeMessage(
      s,
      deal,
      tr("رفض اللاعب التبادل؛ الصفقة ملغاة", "A player refused the exchange; the deal is cancelled", "Un joueur refuse l’échange ; l’offre est annulée"),
      explanation,
    );
    return { status: "rejected", deal, reason: explanation, reasonCode: refusal.code };
  }

  // All checks happen before any mutation, so the exchange is atomic.
  if (deal.cash) {
    const description = tr(
      `موازنة نقدية لصفقة تبادل اللاعبين`,
      "Cash balancing for player exchange",
      "Compensation pour l’échange de joueurs",
    );
    const posted = post(s, -deal.cash, "player-exchange", description, `${deal.id}-cash`);
    assert(posted, tr("تم تسجيل المبلغ لهذه الصفقة سابقًا.", "This deal's cash payment was already posted.", "Le paiement de cette offre a déjà été enregistré."));
    if (Object.hasOwn(s.expansion?.budgets || {}, s.clubId))
      s.expansion.budgets[s.clubId] -= deal.cash;
    if (Object.hasOwn(s.expansion?.budgets || {}, deal.opponentId))
      s.expansion.budgets[deal.opponentId] += deal.cash;
    else {
      const current = market.aiBudgets[deal.opponentId] || aiClubBudget(s, deal.opponentId);
      market.aiBudgets[deal.opponentId] = current + deal.cash;
    }
  }

  const destinations = [
    ...deal.outgoingPlayerIds.map((playerId) => ({
      playerId,
      clubId: deal.opponentId,
      salary: playerWage(s.players.find((p) => p.id === playerId)),
    })),
    ...deal.incomingPlayerIds.map((playerId) => ({
      playerId,
      clubId: s.clubId,
      salary: wageOfferFor(
        deal,
        playerId,
        s.players.find((p) => p.id === playerId),
      ),
    })),
  ];
  for (const move of destinations) {
    const player = s.players.find((item) => item.id === move.playerId);
    const from = player.clubId;
    player.clubId = move.clubId;
    player.clubName = clubInfo(move.clubId).name;
    player.salary = move.salary;
    player.transferRequested = false;
    player.careerHistory.push({
      date: s.date,
      type: "player-exchange",
      from,
      clubId: move.clubId,
      exchangeId: deal.id,
    });
  }
  deal.completedOn = s.date;
  deal.fairness = resources.fairness;
  setExchangeStatus(
    s,
    deal,
    "completed",
    tr("اكتمل تبادل اللاعبين بنجاح.", "The player exchange was completed.", "L’échange de joueurs est terminé."),
  );
  emitExchangeMessage(
    s,
    deal,
    tr("اكتمل تبادل اللاعبين", "Player exchange completed", "Échange de joueurs terminé"),
    exchangeMessageBody(s, deal),
  );
  return { status: "completed", deal, approvals };
}

export function rejectPlayerExchange(s, id) {
  const deal = exchangesFor(s).find((item) => item.id === id);
  if (!deal || !ACTIVE_EXCHANGE_STATES.has(deal.status))
    return { status: deal?.status || "unavailable", deal: deal || null };
  setExchangeStatus(
    s,
    deal,
    "rejected",
    tr("رفضت الإدارة عرض التبادل.", "Your club rejected the exchange offer.", "Votre club a refusé l’offre d’échange."),
  );
  emitExchangeMessage(
    s,
    deal,
    tr("تم رفض عرض التبادل", "Exchange offer declined", "Offre d’échange refusée"),
    deal.reason,
  );
  return { status: "rejected", deal };
}

export function exchangeOutcomeReason(s, deal) {
  if (!deal) return null;
  const resourceCheck = assessResources(s, deal);
  if (!resourceCheck.ok) return resourceCheck;
  const approvals = previewExchangeApprovals(s, deal);
  const refusal = approvals.find((item) => !item.approved);
  return refusal
    ? {
        ok: false,
        code: refusal.code,
        reason: exchangeReason("player", `${refusal.name}: ${refusal.reason}`),
        approvals,
      }
    : { ok: true, approvals, fairness: resourceCheck.fairness };
}
