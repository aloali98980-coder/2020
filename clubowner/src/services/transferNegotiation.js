import { CLUBS } from "../data/catalog.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { tr } from "../i18n/index.js";
import { addDays, assert, daysBetween, random, uid } from "../core/utils.js";
import { marketOpen, teamPower, settleSellOnClause } from "./market.js";
import { obligation, post } from "./finance.js";
import { message, closeThread } from "./inbox.js";
import {
  canTransferByClauseOnly,
  hasReleaseClause,
} from "./releaseClause.js";
import { recordSupporterSale } from "./ultras.js";

export const SALE_ROUNDS = 3;
export const LOYALTY_SALE_BLOCK = 85;
export const CLUB_PERSONAS = [
  {
    id: "frugal",
    offer: 0.82,
    target: 1.02,
    concession: 0.2,
    upfront: 40,
    auction: 0.88,
  },
  {
    id: "generous",
    offer: 1.02,
    target: 1.12,
    concession: 0.72,
    upfront: 60,
    auction: 1.12,
  },
  {
    id: "hesitant",
    offer: 0.9,
    target: 1.07,
    concession: 0.43,
    upfront: 40,
    auction: 0.95,
  },
  {
    id: "impatient",
    offer: 0.98,
    target: 1.08,
    concession: 0.82,
    upfront: 100,
    auction: 1.05,
  },
  {
    id: "tough",
    offer: 0.86,
    target: 1.18,
    concession: 0.16,
    upfront: 100,
    auction: 1.02,
  },
];

const ACTIVE_SALE_STATES = new Set(["open", "agreed"]);
const AI_BID_LIMIT = 2;
const ACTIVE_AUCTION_STATES = new Set(["open"]);
const integerAmount = (n) => Number.isSafeInteger(n) && n >= 0;
const isClosingDate = (date) => date?.endsWith("-09-30") || date?.endsWith("-01-31");
export const deadlinePriceMultiplier = (date) => (isClosingDate(date) ? 1.5 : 1);
export const playerLoyalty = (p) => Math.max(0, Math.min(100, Number(p?.loyalty ?? 50)));
export const refusesSaleForLoyalty = (p) => playerLoyalty(p) >= LOYALTY_SALE_BLOCK;

export function ensureTransferMarket(s) {
  if (!s.transferMarket || typeof s.transferMarket !== "object")
    s.transferMarket = {};
  const m = s.transferMarket;
  m.sales ??= [];
  m.auctions ??= [];
  m.clauses ??= [];
  m.exchanges ??= [];
  m.aiBudgets ??= {};
  m.lastOfferDate ??= null;
  for (const id of s.expansion ? [] : transferClubIds(s)) {
    if (id === s.clubId || Object.hasOwn(m.aiBudgets, id)) continue;
    const info = clubInfo(id);
    m.aiBudgets[id] = Math.max(
      5_000_000,
      Math.round(info.cash || (info.rep || 60) * 900_000),
    );
  }
  return m;
}

export function transferClubIds(s) {
  const ids = s.expansion?.divisions?.length
    ? s.expansion.divisions.flatMap((d) => d.clubs)
    : (s.table || []).map((row) => row.clubId);
  return [...new Set(ids.filter((id) => typeof id === "string" && id.length))];
}

export function clubInfo(id) {
  const club = extendedClub(id) || CLUBS.find((item) => item.id === id);
  return {
    id,
    name: club?.name || id,
    city: club?.city || club?.name || id,
    country: club?.country || "eg",
    rep: Number(club?.rep ?? club?.overall ?? 60),
    cash: Number(club?.cash || 0),
  };
}

const stableHash = (text) => {
  let h = 2166136261;
  for (const c of String(text)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};
export function clubPersona(clubId) {
  return CLUB_PERSONAS[stableHash(clubId) % CLUB_PERSONAS.length];
}
export function personaName(id) {
  const labels = {
    frugal: tr("بخيل", "Frugal", "Économe"),
    generous: tr("كريم", "Generous", "Généreux"),
    hesitant: tr("متردد", "Hesitant", "Hésitant"),
    impatient: tr("مستعجل", "Impatient", "Pressé"),
    tough: tr("صعب", "Tough", "Difficile"),
  };
  return labels[id] || "—";
}

export function aiClubBudget(s, clubId) {
  if (clubId === s.clubId) return Math.max(0, s.finance?.cash || 0);
  if (s.expansion && Object.hasOwn(s.expansion.budgets || {}, clubId))
    return Math.max(0, s.expansion.budgets[clubId] || 0);
  const m = ensureTransferMarket(s);
  return Math.max(0, m.aiBudgets[clubId] || 0);
}

function addClubBudget(s, clubId, amount) {
  if (!integerAmount(amount) || amount === 0) return;
  if (s.expansion && Object.hasOwn(s.expansion.budgets || {}, clubId)) {
    s.expansion.budgets[clubId] += amount;
    return;
  }
  const m = ensureTransferMarket(s);
  m.aiBudgets[clubId] = (m.aiBudgets[clubId] || 0) + amount;
}

function spendClubBudget(s, clubId, amount) {
  assert(integerAmount(amount), tr("راجع قيمة العرض المالي.", "Check the fee amount.", "Vérifiez le montant du transfert."));
  const available = aiClubBudget(s, clubId);
  assert(available >= amount, tr("ميزانية النادي المشتري لا تكفي لهذه الصفقة.", "The buyer does not have enough budget for this deal.", "Le budget de l’acheteur est insuffisant pour ce transfert."));
  if (s.expansion && Object.hasOwn(s.expansion.budgets || {}, clubId))
    s.expansion.budgets[clubId] -= amount;
  else {
    const m = ensureTransferMarket(s);
    m.aiBudgets[clubId] = available - amount;
  }
}

function assertMarketOpen(s) {
  assert(marketOpen(s), tr("سوق الانتقالات مغلق حتى النافذة القادمة.", "The transfer window is closed until the next opening.", "Le marché des transferts est fermé jusqu’à la prochaine période."));
}

function ownedPlayer(s, playerId) {
  const p = s.players.find((item) => item.id === playerId);
  assert(
    p && p.clubId === s.clubId && p.status !== "retired",
    tr("اللاعب لم يعد متاحًا للبيع.", "The player is no longer available for sale.", "Le joueur n’est plus disponible à la vente."),
  );
  assert(!p.loan, tr("لا يحق بيع لاعب مُعار.", "A loan player cannot be sold.", "Un joueur prêté ne peut pas être vendu."));
  assert(
    s.players.filter((item) => item.clubId === s.clubId && item.status !== "retired").length > 16,
    tr("يجب الاحتفاظ بـ16 لاعبًا على الأقل.", "Keep at least 16 players in the squad.", "Conservez au moins 16 joueurs dans l’effectif."),
  );
  assert(!refusesSaleForLoyalty(p), tr("ولاء اللاعب مرتفع؛ يرفض كل عروض الرحيل.", "The player is loyal and refuses every move.", "Le joueur est fidèle et refuse tout départ."));
  assert(
    !hasReleaseClause(p),
    tr(
      "اللاعب محمي بشرط جزائي — لا انتقال إلا بكسر الشرط الجزائي.",
      "The player is protected by a release clause — no transfer except by triggering the release clause.",
      "Le joueur est protégé par une clause libératoire — aucun transfert hors activation de la clause.",
    ),
  );
  return p;
}

function eligibleBuyerIds(s, player, { exclude = [], minimumBudget = 0 } = {}) {
  const excluded = new Set([s.clubId, ...exclude]);
  const squadLimit = s.squadLimit || 30;
  return transferClubIds(s).filter((id) => {
    if (excluded.has(id)) return false;
    const size = s.players.filter((p) => p.clubId === id && p.status !== "retired").length;
    return (
      size < squadLimit &&
      aiClubBudget(s, id) >= Math.max(minimumBudget, Math.round(player.value * 0.45)) &&
      (teamPower(s, id) >= player.rating - 12 || player.rating < 65)
    );
  });
}

function saleTarget(s, player, persona) {
  const pressure = player.transferRequested ? 0.82 : 1;
  return Math.max(
    1,
    Math.round(player.value * persona.target * pressure * deadlinePriceMultiplier(s.date)),
  );
}

function validateSaleTerms(terms, playerValue) {
  assert(
    terms && integerAmount(terms.fee) && terms.fee > 0,
    tr("أدخل أي مبلغ صحيح أكبر من صفر للعرض المضاد.", "Enter any positive whole-number counter-offer.", "Saisissez un montant entier positif pour la contre-offre."),
  );
  assert([40, 60, 100].includes(terms.upfrontPercent), tr("اختر المقدم 40% أو 60% أو 100%.", "Choose a 40%, 60%, or 100% upfront payment.", "Choisissez un acompte de 40 %, 60 % ou 100 %."));
  assert(
    integerAmount(terms.appearanceBonus ?? 0) &&
      (terms.appearanceBonus ?? 0) <= 100_000_000 &&
      integerAmount(terms.goalBonus ?? 0) &&
      (terms.goalBonus ?? 0) <= 100_000_000,
    tr("إضافات المباريات والأهداف يجب أن تكون مبالغ صحيحة ضمن الحد.", "Appearance and goal add-ons must be valid amounts within the limit.", "Les bonus de matchs et de buts doivent respecter les montants autorisés."),
  );
  const sellOnPercent = Number(terms.sellOnPercent || 0);
  assert(
    sellOnPercent === 0 || (Number.isInteger(sellOnPercent) && sellOnPercent >= 10 && sellOnPercent <= 30),
    tr("نسبة البيع المستقبلية إما صفر أو من 10% إلى 30%.", "The sell-on share must be zero or between 10% and 30%.", "Le pourcentage à la revente doit être nul ou compris entre 10 % et 30 %."),
  );
  assert(terms.fee <= Number.MAX_SAFE_INTEGER && playerValue > 0, tr("قيمة الصفقة خارج النطاق.", "The deal value is out of range.", "Le montant du transfert est hors limites."));
  return {
    fee: terms.fee,
    upfrontPercent: terms.upfrontPercent,
    appearanceBonus: terms.appearanceBonus || 0,
    goalBonus: terms.goalBonus || 0,
    sellOnPercent,
  };
}

const contingentValue = (terms, player) =>
  Math.round(
    (terms.appearanceBonus || 0) * 0.2 +
      (terms.goalBonus || 0) * 0.2 +
      player.value * ((terms.sellOnPercent || 0) / 100) * 0.25,
  );

function makeSaleMessage(s, deal, title, body) {
  return message(s, {
    title,
    body,
    category: "transfers",
    kind: "sale-offer",
    ref: deal.id,
    deadline: deal.expires,
    priority: deal.urgent ? "high" : "normal",
  });
}

export function createAiSaleOffer(s, playerId, { buyerId = null, urgent = false } = {}) {
  assertMarketOpen(s);
  const player = ownedPlayer(s, playerId);
  const market = ensureTransferMarket(s);
  assert(
    !market.sales.some((sale) => sale.playerId === playerId && ACTIVE_SALE_STATES.has(sale.status)) &&
      !market.auctions.some((auction) => auction.playerId === playerId && ACTIVE_AUCTION_STATES.has(auction.status)),
    tr("هناك تفاوض أو مزاد نشط على اللاعب بالفعل.", "This player already has active talks or an auction.", "Ce joueur fait déjà l’objet d’une négociation ou d’une enchère."),
  );
  const activeBids = market.sales.filter((sale) => ACTIVE_SALE_STATES.has(sale.status)).length;
  assert(activeBids < AI_BID_LIMIT, tr("وصلت إلى الحد الأقصى لعروض البيع النشطة.", "The maximum number of active sale offers has been reached.", "Le nombre maximal d’offres de vente actives est atteint."));
  const eligible = eligibleBuyerIds(s, player, { minimumBudget: Math.round(player.value * 0.6) });
  if (!buyerId) {
    assert(eligible.length, tr("لا يوجد نادٍ قادر على تمويل العرض الآن.", "No club can finance this offer right now.", "Aucun club ne peut financer cette offre pour le moment."));
    buyerId = eligible[Math.floor(random(s) * eligible.length)];
  }
  assert(eligible.includes(buyerId), tr("النادي المشتري غير مؤهل أو لا يملك الميزانية الكافية.", "The buyer is ineligible or does not have enough budget.", "L’acheteur n’est pas admissible ou son budget est insuffisant."));
  const persona = clubPersona(buyerId);
  const multiplier = player.transferRequested ? 0.8 : persona.offer;
  const fee = Math.max(
    1,
    Math.min(
      aiClubBudget(s, buyerId),
      Math.round(player.value * multiplier * deadlinePriceMultiplier(s.date)),
    ),
  );
  const deal = {
    id: uid(s, "sale"),
    playerId,
    seller: s.clubId,
    buyer: buyerId,
    buyerName: clubInfo(buyerId).name,
    personaId: persona.id,
    status: "open",
    fee,
    terms: {
      fee,
      upfrontPercent: urgent ? 100 : persona.upfront,
      appearanceBonus: 0,
      goalBonus: 0,
      sellOnPercent: 0,
    },
    round: 0,
    maxRounds: SALE_ROUNDS,
    expires: addDays(s.date, urgent ? 0 : 7),
    urgent: Boolean(urgent),
    history: [
      {
        side: "buyer",
        date: s.date,
        fee,
        upfrontPercent: urgent ? 100 : persona.upfront,
        appearanceBonus: 0,
        goalBonus: 0,
        sellOnPercent: 0,
      },
    ],
  };
  market.sales.push(deal);
  market.lastOfferDate = s.date;
  makeSaleMessage(
    s,
    deal,
    tr("عرض شراء جديد للاعبك", "A new bid for your player", "Nouvelle offre pour votre joueur"),
    tr(
      `${deal.buyerName} يعرض ${deal.fee} لضم ${player.name}. يمكنك قبول العرض أو تقديم عرض مضاد؛ التفاوض حتى 3 جولات.`,
      `${deal.buyerName} offers ${deal.fee} for ${player.name}. Accept or counter; negotiations last up to 3 rounds.`,
      `${deal.buyerName} propose ${deal.fee} pour ${player.name}. Acceptez ou contre-proposez ; jusqu’à 3 tours de négociation.`,
    ),
  );
  return deal;
}

function currentSale(s, id) {
  const deal = ensureTransferMarket(s).sales.find((sale) => sale.id === id);
  assert(deal && ACTIVE_SALE_STATES.has(deal.status), tr("عرض البيع غير متاح.", "This sale offer is unavailable.", "Cette offre de vente n’est pas disponible."));
  assert(deal.expires >= s.date, tr("انتهت مهلة عرض البيع.", "The sale offer has expired.", "L’offre de vente a expiré."));
  assertMarketOpen(s);
  const player = s.players.find((p) => p.id === deal.playerId);
  assert(player && player.clubId === s.clubId && player.status !== "retired" && !player.loan, tr("اللاعب لم يعد متاحًا للبيع.", "The player is no longer available for sale.", "Le joueur n’est plus disponible à la vente."));
  if (refusesSaleForLoyalty(player)) {
    deal.status = "rejected";
    deal.reason = tr("رفض اللاعب الرحيل بسبب ولائه المرتفع للنادي.", "The player refused to leave because of strong club loyalty.", "Le joueur refuse de partir en raison de sa forte loyauté au club.");
    return { deal, player, refused: true };
  }
  return { deal, player, refused: false };
}

function closeSale(s, deal, status, reason = null) {
  deal.status = status;
  if (reason) deal.reason = reason;
  closeThread(s, deal.id);
}

export function counterSaleOffer(s, id, rawTerms) {
  const { deal, player, refused } = currentSale(s, id);
  if (refused) return { status: "rejected", reason: deal.reason };
  assert(deal.round < deal.maxRounds, tr("وصل التفاوض إلى 3 جولات؛ يمكنك قبول آخر عرض أو الانسحاب.", "Negotiations have reached 3 rounds; accept the latest offer or withdraw.", "La négociation a atteint 3 tours ; acceptez la dernière offre ou retirez-vous."));
  const terms = validateSaleTerms(rawTerms, player.value);
  const persona = CLUB_PERSONAS.find((p) => p.id === deal.personaId) || clubPersona(deal.buyer);
  const previousBuyerFee = deal.terms.fee;
  deal.round++;
  deal.history.push({ side: "seller", date: s.date, ...terms });
  const buyerBudget = aiClubBudget(s, deal.buyer);
  const valueToBuyer = terms.fee + contingentValue(terms, player);
  const acceptable =
    terms.fee <= buyerBudget &&
    (terms.fee <= previousBuyerFee || valueToBuyer >= saleTarget(s, player, persona) * 0.92);
  if (acceptable) {
    deal.terms = terms;
    deal.fee = terms.fee;
    deal.status = "agreed";
    deal.history.push({ side: "buyer", date: s.date, response: "accepted", ...terms });
    return { status: "agreed", deal };
  }
  if (deal.round >= deal.maxRounds) {
    closeSale(
      s,
      deal,
      "withdrawn",
      tr("انسحب النادي بعد استنفاد جولات المساومة الثلاث.", "The club withdrew after all three negotiation rounds.", "Le club se retire après les trois tours de négociation."),
    );
    deal.history.push({ side: "buyer", date: s.date, response: "withdrawn" });
    return { status: "withdrawn", deal };
  }
  const target = Math.min(saleTarget(s, player, persona), buyerBudget);
  const gap = Math.max(0, terms.fee - previousBuyerFee);
  const step = Math.max(Math.round(player.value * 0.015), Math.round(gap * persona.concession));
  const counterFee = Math.max(
    previousBuyerFee,
    Math.min(target, previousBuyerFee + step),
  );
  if (counterFee <= previousBuyerFee && terms.fee > previousBuyerFee) {
    closeSale(
      s,
      deal,
      "withdrawn",
      tr("تمسك النادي بحده المالي وانسحب من التفاوض.", "The club held to its budget and withdrew from talks.", "Le club maintient sa limite budgétaire et se retire."),
    );
    deal.history.push({ side: "buyer", date: s.date, response: "withdrawn" });
    return { status: "withdrawn", deal };
  }
  deal.terms = {
    fee: counterFee,
    upfrontPercent: persona.upfront,
    appearanceBonus: 0,
    goalBonus: 0,
    sellOnPercent: 0,
  };
  deal.fee = counterFee;
  deal.history.push({ side: "buyer", date: s.date, response: "counter", ...deal.terms });
  return { status: "countered", deal };
}

function payClub(s, clubId, amount, key, description) {
  if (!amount) return;
  if (clubId === s.clubId) {
    post(s, amount, "player-sale", description, key);
    return;
  }
  addClubBudget(s, clubId, amount);
}

function saleRecord(s, deal, buyer, fee, terms, id = deal.id) {
  return {
    id,
    playerId: deal.playerId,
    seller: deal.seller || s.clubId,
    buyer,
    fee,
    terms,
    status: "sold",
    date: s.date,
  };
}

function executeSale(s, deal, buyerId, fee, rawTerms, id = deal.id) {
  const player = s.players.find((p) => p.id === deal.playerId);
  assert(player && player.clubId === s.clubId && player.status !== "retired" && !player.loan, tr("اللاعب لم يعد متاحًا للبيع.", "The player is no longer available for sale.", "Le joueur n’est plus disponible à la vente."));
  assert(!refusesSaleForLoyalty(player), tr("ولاء اللاعب مرتفع؛ يرفض كل عروض الرحيل.", "The player is loyal and refuses every move.", "Le joueur est fidèle et refuse tout départ."));
  assertMarketOpen(s);
  assert(
    s.players.filter((p) => p.clubId === s.clubId && p.status !== "retired").length > 16,
    tr("يجب الاحتفاظ بـ16 لاعبًا على الأقل.", "Keep at least 16 players in the squad.", "Conservez au moins 16 joueurs dans l’effectif."),
  );
  assert(
    s.players.filter((p) => p.clubId === buyerId && p.status !== "retired").length < (s.squadLimit || 30),
    tr("قائمة النادي المشتري مكتملة.", "The buyer’s squad is full.", "L’effectif de l’acheteur est complet."),
  );
  const terms = validateSaleTerms(rawTerms, player.value);
  assert(
    canTransferByClauseOnly(player, fee),
    tr(
      "اللاعب محمي بشرط جزائي — لا انتقال إلا بكسر الشرط الجزائي.",
      "The player is protected by a release clause — no transfer except by triggering the release clause.",
      "Le joueur est protégé par une clause libératoire — aucun transfert hors activation de la clause.",
    ),
  );
  assert(terms.fee === fee, tr("قيمة المزاد أو الاتفاق تغيرت؛ راجع العرض.", "The auction or agreed fee changed; review the offer.", "Le montant de l’enchère ou de l’accord a changé ; vérifiez l’offre."));
  assert(aiClubBudget(s, buyerId) >= fee, tr("لم تعد ميزانية المشتري تكفي.", "The buyer no longer has enough budget.", "Le budget de l’acheteur est désormais insuffisant."));
  settleSellOnClause(s, player, fee);
  spendClubBudget(s, buyerId, fee);
  const upfront = Math.round((fee * terms.upfrontPercent) / 100);
  const rest = fee - upfront;
  const record = saleRecord(s, deal, buyerId, fee, terms, id);
  const market = ensureTransferMarket(s);
  if (deal.type === "auction") market.sales.push(record);
  else {
    deal.status = "sold";
    deal.fee = fee;
    deal.terms = terms;
    deal.signed = s.date;
  }
  payClub(
    s,
    s.clubId,
    upfront,
    `${id}-upfront`,
    tr(`مقدم بيع ${player.name}`, `Sale advance for ${player.name}`, `Acompte de vente pour ${player.name}`),
  );
  if (Object.hasOwn(s.expansion?.budgets || {}, s.clubId))
    s.expansion.budgets[s.clubId] += upfront;
  if (rest) {
    const part = Math.floor(rest / 3);
    for (let i = 1; i <= 3; i++)
      obligation(s, {
        amount: i === 3 ? rest - part * 2 : part,
        due: addDays(s.date, i * 30),
        category: "transfer-income",
        description: tr(`قسط بيع ${player.name}`, `Sale instalment: ${player.name}`, `Échéance de vente : ${player.name}`),
        key: `${id}-income-installment-${i}`,
        ref: record.id,
      });
  }
  const clause = {
    id: uid(s, "sell-on"),
    playerId: player.id,
    seller: s.clubId,
    buyer: buyerId,
    sellOnPercent: terms.sellOnPercent,
    appearanceBonus: terms.appearanceBonus,
    goalBonus: terms.goalBonus,
    appearanceTarget: player.appearances + 10,
    goalTarget: player.goals + 5,
    appearancePaid: false,
    goalPaid: false,
    date: s.date,
  };
  if (clause.sellOnPercent || clause.appearanceBonus || clause.goalBonus)
    market.clauses.push(clause);
  recordSupporterSale(s, player);
  player.clubId = buyerId;
  player.clubName = clubInfo(buyerId).name;
  player.transferRequested = false;
  player.careerHistory.push({
    date: s.date,
    type: "transfer-out",
    clubId: buyerId,
    from: s.clubId,
    fee,
    sellOnPercent: terms.sellOnPercent,
  });
  if (deal.type === "auction") {
    deal.status = "sold";
    deal.winner = buyerId;
    deal.finalFee = fee;
  }
  closeThread(s, deal.id);
  message(s, {
    title: tr("اكتملت صفقة بيع اللاعب", "Player sale completed", "Vente du joueur conclue"),
    body: tr(
      `انتقل ${player.name} إلى ${clubInfo(buyerId).name} مقابل ${fee}. وصل المقدم إلى الخزينة والباقي مجدول على 3 أقساط.`,
      `${player.name} joined ${clubInfo(buyerId).name} for ${fee}. The upfront payment reached the treasury; the remainder is scheduled in 3 instalments.`,
      `${player.name} rejoint ${clubInfo(buyerId).name} pour ${fee}. L’acompte est versé et le solde prévu en 3 échéances.`,
    ),
    category: "transfers",
  });
  return record;
}

export function acceptSaleOffer(s, id) {
  const { deal, player, refused } = currentSale(s, id);
  if (refused) return { status: "rejected", reason: deal.reason };
  assert(deal.round <= deal.maxRounds, tr("تجاوز التفاوض الحد الأقصى للجولات.", "Negotiations exceeded the maximum number of rounds.", "La négociation a dépassé le nombre maximal de tours."));
  const terms = validateSaleTerms(deal.terms, player.value);
  const result = executeSale(s, deal, deal.buyer, deal.fee, terms, deal.id);
  deal.status = "sold";
  return { status: "sold", deal, result };
}

export function rejectSaleOffer(s, id) {
  const { deal } = currentSale(s, id);
  closeSale(s, deal, "rejected");
  deal.history.push({ side: "seller", date: s.date, response: "withdrawn" });
  return deal;
}

function marketWindowClose(s) {
  if (!s.management || s.management.marketMode !== "windows") return null;
  const day = s.date.slice(5);
  return day >= "07-01" && day <= "09-30"
    ? `${s.date.slice(0, 4)}-09-30`
    : day >= "01-01" && day <= "01-31"
      ? `${s.date.slice(0, 4)}-01-31`
      : null;
}

function highestAuctionBid(auction) {
  return auction.bids.reduce(
    (highest, bid) => (!highest || bid.fee > highest.fee ? bid : highest),
    null,
  );
}

function pushAuctionBid(s, auction, bidder, fee) {
  if (auction.bids.some((bid) => bid.buyer === bidder.clubId && bid.date === s.date)) return false;
  const budget = aiClubBudget(s, bidder.clubId);
  if (fee <= 0 || fee > budget) return false;
  const bid = {
    date: s.date,
    buyer: bidder.clubId,
    buyerName: clubInfo(bidder.clubId).name,
    personaId: bidder.personaId,
    fee,
  };
  auction.bids.push(bid);
  auction.highestBid = fee;
  auction.highestBidder = bidder.clubId;
  return true;
}

function placeAuctionBids(s, auction, opening = false) {
  const player = s.players.find((p) => p.id === auction.playerId);
  if (!player || player.clubId !== s.clubId) return;
  const highest = highestAuctionBid(auction);
  for (const bidder of auction.bidders) {
    const persona = CLUB_PERSONAS.find((p) => p.id === bidder.personaId) || clubPersona(bidder.clubId);
    const current = auction.bids
      .filter((bid) => bid.buyer === bidder.clubId)
      .reduce((n, bid) => Math.max(n, bid.fee), 0);
    if (!opening && highest?.buyer === bidder.clubId) continue;
    let fee;
    if (opening) {
      fee = Math.min(
        aiClubBudget(s, bidder.clubId),
        Math.round(
          player.value *
            persona.auction *
            (player.transferRequested ? 0.82 : 1) *
            deadlinePriceMultiplier(s.date),
        ),
      );
    } else {
      const step = Math.max(Math.round(player.value * 0.025), Math.round((highest?.fee || player.value) * 0.025));
      fee = Math.max(current + step, (highest?.fee || 0) + step);
      if (isClosingDate(s.date)) fee = Math.round(fee * 1.5);
    }
    if (fee <= current || (highest && fee <= highest.fee)) continue;
    pushAuctionBid(s, auction, bidder, fee);
  }
  const top = highestAuctionBid(auction);
  if (top) {
    auction.highestBid = top.fee;
    auction.highestBidder = top.buyer;
  }
}

function finishAuction(s, auction) {
  const top = highestAuctionBid(auction);
  if (!top) {
    auction.status = "unsold";
    return;
  }
  const buyerBid = auction.bidders.find((bidder) => bidder.clubId === top.buyer);
  const persona = CLUB_PERSONAS.find((p) => p.id === buyerBid?.personaId) || clubPersona(top.buyer);
  const terms = {
    fee: top.fee,
    upfrontPercent: persona.upfront,
    appearanceBonus: 0,
    goalBonus: 0,
    sellOnPercent: 0,
  };
  executeSale(s, auction, top.buyer, top.fee, terms, `${auction.id}-sale`);
}

export function startPlayerAuction(s, playerId, { days = 3 } = {}) {
  assertMarketOpen(s);
  const player = ownedPlayer(s, playerId);
  assert(Number.isInteger(days) && days >= 1 && days <= 7, tr("مدة المزاد من يوم إلى 7 أيام.", "An auction must last from 1 to 7 days.", "Une enchère doit durer de 1 à 7 jours."));
  const market = ensureTransferMarket(s);
  assert(
    !market.sales.some((sale) => sale.playerId === playerId && ACTIVE_SALE_STATES.has(sale.status)) &&
      !market.auctions.some((auction) => auction.playerId === playerId && ACTIVE_AUCTION_STATES.has(auction.status)),
    tr("هناك تفاوض أو مزاد نشط على اللاعب بالفعل.", "This player already has active talks or an auction.", "Ce joueur fait déjà l’objet d’une négociation ou d’une enchère."),
  );
  const buyers = eligibleBuyerIds(s, player, { minimumBudget: Math.round(player.value * 0.6) });
  assert(buyers.length >= 2, tr("يلزم ناديان على الأقل لبدء مزاد علني.", "A public auction needs at least two clubs.", "Une enchère publique nécessite au moins deux clubs."));
  const shuffled = [...buyers].sort(() => random(s) - 0.5).slice(0, Math.min(4, buyers.length));
  const close = marketWindowClose(s);
  let endsOn = addDays(s.date, days);
  if (close && close < endsOn) endsOn = close;
  const auction = {
    id: uid(s, "auction"),
    type: "auction",
    playerId,
    seller: s.clubId,
    status: "open",
    startedOn: s.date,
    endsOn,
    days,
    bidders: shuffled.map((clubId) => ({ clubId, personaId: clubPersona(clubId).id })),
    bids: [],
    highestBid: 0,
    highestBidder: null,
  };
  market.auctions.push(auction);
  placeAuctionBids(s, auction, true);
  if (auction.endsOn === s.date) finishAuction(s, auction);
  return auction;
}

export function auctionDaysRemaining(s, auction) {
  return Math.max(0, daysBetween(s.date, auction.endsOn));
}

export function requestPlayerTransfer(s, playerId) {
  const player = s.players.find((p) => p.id === playerId);
  assert(
    player && player.clubId === s.clubId && player.status !== "retired" && !player.loan,
    tr("اللاعب غير متاح لطلب الانتقال.", "This player cannot request a transfer.", "Ce joueur ne peut pas demander de transfert."),
  );
  if (!player.transferRequested)
    assert(!refusesSaleForLoyalty(player), tr("ولاء اللاعب مرتفع؛ لن يطلب الرحيل.", "The player is too loyal to request a move.", "Le joueur est trop fidèle pour demander un départ."));
  player.transferRequested = !player.transferRequested;
  if (player.transferRequested) player.morale = Math.max(20, player.morale - 10);
  message(s, {
    title: player.transferRequested
      ? tr("اللاعب طلب الرحيل", "Player requested a transfer", "Le joueur demande son départ")
      : tr("سحب طلب الانتقال", "Transfer request withdrawn", "Demande de transfert retirée"),
    body: player.transferRequested
      ? tr(
          `${player.name} طلب إدراجه في سوق الانتقالات؛ سيقبل بسعر أقل من المعتاد.`,
          `${player.name} asked to be listed; interested clubs will expect a lower fee.`,
          `${player.name} demande à être placé sur la liste des transferts ; les clubs intéressés viseront un prix inférieur.`,
        )
      : tr(
          `${player.name} سحب طلب الانتقال وسيبقى مع الفريق.`,
          `${player.name} withdrew the transfer request and will stay with the squad.`,
          `${player.name} retire sa demande et restera dans l’équipe.`,
        ),
    category: "transfers",
  });
  return player.transferRequested;
}

export function processTransferClauses(s) {
  const market = s.transferMarket;
  if (!market?.clauses?.length) return 0;
  let paid = 0;
  for (const clause of market.clauses) {
    const player = s.players.find((p) => p.id === clause.playerId);
    if (!player) continue;
    if (!clause.appearancePaid && clause.appearanceBonus && player.appearances >= clause.appearanceTarget) {
      payClub(s, clause.seller, clause.appearanceBonus, `${clause.id}-appearance`, tr(`إضافة مشاركات ${player.name}`, `Appearance add-on: ${player.name}`, `Bonus de matchs : ${player.name}`));
      clause.appearancePaid = true;
      paid++;
    }
    if (!clause.goalPaid && clause.goalBonus && player.goals >= clause.goalTarget) {
      payClub(s, clause.seller, clause.goalBonus, `${clause.id}-goals`, tr(`إضافة أهداف ${player.name}`, `Goal add-on: ${player.name}`, `Bonus de buts : ${player.name}`));
      clause.goalPaid = true;
      paid++;
    }
  }
  return paid;
}

function expireSales(s) {
  const market = ensureTransferMarket(s);
  for (const deal of market.sales) {
    if (ACTIVE_SALE_STATES.has(deal.status) && deal.expires < s.date) {
      deal.status = "expired";
      closeThread(s, deal.id);
    }
  }
}

function startScheduledAiOffer(s) {
  const market = ensureTransferMarket(s);
  if (!s.date.endsWith("-15") || market.lastOfferDate === s.date || !marketOpen(s)) return null;
  if (market.sales.filter((sale) => ACTIVE_SALE_STATES.has(sale.status)).length >= AI_BID_LIMIT) return null;
  const candidates = s.players
    .filter(
      (p) =>
        p.clubId === s.clubId &&
        p.status !== "retired" &&
        !p.loan &&
        !hasReleaseClause(p) &&
        !refusesSaleForLoyalty(p) &&
        (p.rating >= 74 || p.value >= 10_000_000) &&
        !market.sales.some((sale) => sale.playerId === p.id && ACTIVE_SALE_STATES.has(sale.status)) &&
        !market.auctions.some((auction) => auction.playerId === p.id && ACTIVE_AUCTION_STATES.has(auction.status)) &&
        !s.management?.outgoing?.some((offer) => offer.playerId === p.id && offer.status === "open"),
    )
    .sort((a, b) => b.rating - a.rating || b.value - a.value);
  if (!candidates.length) return null;
  const player = candidates[Math.floor(random(s) * Math.min(5, candidates.length))];
  const eligible = eligibleBuyerIds(s, player, { minimumBudget: Math.round(player.value * 0.6) });
  if (!eligible.length) return null;
  const buyer = eligible[Math.floor(random(s) * eligible.length)];
  try {
    return createAiSaleOffer(s, player.id, { buyerId: buyer });
  } catch {
    return null;
  }
}

export function transferMarketDay(s) {
  if (!s) return;
  processTransferClauses(s);
  expireSales(s);
  for (const auction of ensureTransferMarket(s).auctions) {
    if (auction.status !== "open" || auction.startedOn >= s.date) continue;
    const player = s.players.find((p) => p.id === auction.playerId);
    if (!player || player.clubId !== s.clubId || !marketOpen(s)) {
      auction.status = "expired";
      continue;
    }
    placeAuctionBids(s, auction, false);
    if (s.date >= auction.endsOn) finishAuction(s, auction);
  }
  startScheduledAiOffer(s);
}
