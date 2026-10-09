import { POLITICAL_LAWS } from "../../data/politicsLaws.js";
import { tr } from "../../i18n/index.js";
import { ensurePolitics } from "./state.js";

const MAX_FUND_AMOUNT = 50_000_000;
const MIN_GRANT = 100_000;
const MAX_DIRECT_GRANT = 10_000_000;
const MAX_LEDGER = 5_000;
const MAX_HISTORY = 120;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const intMoney = (value) => Number.isSafeInteger(value) && value > 0;

function requirePresident(s) {
  const p = ensurePolitics(s);
  if (!p.office.held)
    throw new Error(
      tr(
        "لا تملك صلاحية إدارة مالية الاتحاد قبل انتخابك للرئاسة.",
        "You need to be elected president before managing association finances.",
        "Vous devez être élu à la présidence avant de gérer les finances de la fédération.",
      ),
    );
  return p;
}

function appendLedger(s, direction, amount, type, details = {}) {
  const finance = ensurePolitics(s).finance;
  const entry = {
    id: `assoc-${(s.nextId = (s.nextId || 0) + 1)}`,
    date: s.date,
    season: s.seasonNumber,
    direction,
    amount,
    type,
    ...details,
  };
  finance.ledger.push(entry);
  finance.ledgerRevision = (finance.ledgerRevision || 0) + 1;
  while (finance.ledger.length > MAX_LEDGER) {
    const archived = finance.ledger.shift();
    if (archived.direction === "credit")
      finance.ledgerOpeningBalance += archived.amount;
    else if (archived.direction === "debit")
      finance.ledgerOpeningBalance -= archived.amount;
  }
  return entry;
}

function changeTreasury(s, direction, amount, type, details = {}) {
  const finance = ensurePolitics(s).finance;
  if (!intMoney(amount) || !["credit", "debit"].includes(direction))
    throw new Error(
      tr(
        "عملية مالية غير صالحة.",
        "Invalid association financial transaction.",
        "Opération financière invalide pour la fédération.",
      ),
    );
  if (direction === "debit" && finance.balance < amount)
    throw new Error(
      tr(
        "رصيد الاتحاد لا يكفي لهذه العملية.",
        "The association treasury cannot cover this transaction.",
        "La trésorerie de la fédération ne peut pas couvrir cette opération.",
      ),
    );
  finance.balance += direction === "credit" ? amount : -amount;
  appendLedger(s, direction, amount, type, details);
  return finance.balance;
}

export function recordTournamentSponsorship(
  s,
  { tournamentId, sponsorId, amount } = {},
) {
  requirePresident(s);
  if (
    !intMoney(amount) ||
    typeof tournamentId !== "string" ||
    typeof sponsorId !== "string"
  )
    throw new Error(
      tr(
        "بيانات رعاية البطولة غير صالحة.",
        "Invalid tournament sponsorship details.",
        "Détails de parrainage du tournoi invalides.",
      ),
    );
  return changeTreasury(s, "credit", amount, "tournament-sponsorship", {
    tournamentId,
    sponsorId,
  });
}

export function chargeTournamentSetup(s, { tournamentId, amount } = {}) {
  requirePresident(s);
  if (!intMoney(amount) || typeof tournamentId !== "string")
    throw new Error(
      tr(
        "بيانات تكلفة تنظيم البطولة غير صالحة.",
        "Invalid competition setup charge.",
        "Frais d’organisation du tournoi invalides.",
      ),
    );
  return changeTreasury(s, "debit", amount, "tournament-setup", {
    tournamentId,
  });
}

export function chargeGovernanceMission(s, { type, amount, referenceId } = {}) {
  requirePresident(s);
  if (
    ![
      "diplomatic-summit",
      "hosting-bid",
      "integrity-investigation",
      "executive-seat",
    ].includes(type) ||
    !intMoney(amount) ||
    typeof referenceId !== "string"
  )
    throw new Error(
      tr(
        "بيانات مهمة الحوكمة غير صالحة.",
        "Invalid governance mission details.",
        "Détails de mission de gouvernance invalides.",
      ),
    );
  return changeTreasury(s, "debit", amount, type, { referenceId });
}

export function recordPoliticalEventTransaction(
  s,
  { eventId, direction, amount } = {},
) {
  requirePresident(s);
  if (
    typeof eventId !== "string" ||
    !/^[a-z0-9-]{1,80}$/.test(eventId) ||
    !["credit", "debit"].includes(direction) ||
    !intMoney(amount)
  )
    throw new Error(
      tr(
        "بيانات العملية المالية للحدث السياسي غير صالحة.",
        "Invalid political-event financial transaction.",
        "Opération financière de l’événement politique invalide.",
      ),
    );
  return changeTreasury(s, direction, amount, "political-event", {
    eventId,
  });
}

export function creditHostingAward(s, { bidId, organizationId, amount } = {}) {
  ensurePolitics(s);
  if (
    typeof bidId !== "string" ||
    typeof organizationId !== "string" ||
    !intMoney(amount)
  )
    throw new Error(
      tr(
        "بيانات منحة الاستضافة غير صالحة.",
        "Invalid hosting award details.",
        "Détails de prime d’accueil invalides.",
      ),
    );
  return changeTreasury(s, "credit", amount, "hosting-award", {
    bidId,
    organizationId,
  });
}

function accountFor(s, clubId) {
  const p = ensurePolitics(s);
  if (!p.clubs.some((club) => club.clubId === clubId))
    throw new Error(
      tr(
        "النادي غير موجود في سجل الاتحاد.",
        "The club is not on the association register.",
        "Le club ne figure pas au registre de la fédération.",
      ),
    );
  p.finance.clubAccounts[clubId] ||= {
    balance: 0,
    totalReceived: 0,
    totalGrants: 0,
  };
  return p.finance.clubAccounts[clubId];
}

function creditClub(s, clubId, amount, { grant = false } = {}) {
  const account = accountFor(s, clubId);
  account.balance += amount;
  account.totalReceived += amount;
  if (grant) account.totalGrants += amount;
  return account;
}

function ranking(s, clubIds) {
  const rowById = new Map((s.table || []).map((row) => [row.clubId, row]));
  const sorted = [...clubIds].sort((leftId, rightId) => {
    const left = rowById.get(leftId) || {};
    const right = rowById.get(rightId) || {};
    return (
      Number(right.points || 0) - Number(left.points || 0) ||
      Number(right.gf || 0) -
        Number(right.ga || 0) -
        (Number(left.gf || 0) - Number(left.ga || 0)) ||
      Number(right.gf || 0) - Number(left.gf || 0) ||
      leftId.localeCompare(rightId)
    );
  });
  return new Map(
    sorted.map((clubId, index) => [clubId, sorted.length - index]),
  );
}

function allocate(s, amount, formula, type, eligibleClubIds = null) {
  if (!intMoney(amount)) return { total: 0, shares: {} };
  const p = ensurePolitics(s);
  const clubs = p.clubs.filter(
    (club) => !eligibleClubIds || eligibleClubIds.includes(club.clubId),
  );
  if (!clubs.length) return { total: 0, shares: {} };
  const weights = {
    performance: Number(formula.performance),
    popularity: Number(formula.popularity),
    equality: Number(formula.equality),
  };
  const rankWeights = ranking(
    s,
    clubs.map((club) => club.clubId),
  );
  const sumRank = [...rankWeights.values()].reduce(
    (sum, value) => sum + value,
    0,
  );
  const sumPopularity = clubs.reduce(
    (sum, club) => sum + Math.max(1, Number(club.popularity || 1)),
    0,
  );
  const raw = clubs.map((club) => {
    const performance = (rankWeights.get(club.clubId) || 1) / sumRank;
    const popularity =
      Math.max(1, Number(club.popularity || 1)) / sumPopularity;
    const equal = 1 / clubs.length;
    const ratio =
      (performance * weights.performance +
        popularity * weights.popularity +
        equal * weights.equality) /
      100;
    return { club, exact: amount * ratio, share: 0 };
  });
  let left = amount;
  for (const entry of raw) {
    entry.share = Math.floor(entry.exact);
    left -= entry.share;
  }
  raw.sort(
    (a, b) =>
      b.exact - b.share - (a.exact - a.share) ||
      a.club.clubId.localeCompare(b.club.clubId),
  );
  for (let i = 0; left > 0; i++, left--) raw[i % raw.length].share++;
  const shares = {};
  for (const { club, share } of raw) {
    if (!share) continue;
    creditClub(s, club.clubId, share, { grant: type !== "broadcast" });
    shares[club.clubId] = share;
  }
  changeTreasury(s, "debit", amount, `${type}-distribution`, {
    clubIds: Object.keys(shares),
  });
  const record = {
    id: `distribution-${(s.nextId = (s.nextId || 0) + 1)}`,
    date: s.date,
    season: s.seasonNumber,
    type,
    total: amount,
    formula: { ...weights },
    shares,
  };
  p.finance.distributions.push(record);
  if (p.finance.distributions.length > MAX_HISTORY)
    p.finance.distributions.splice(
      0,
      p.finance.distributions.length - MAX_HISTORY,
    );
  return record;
}

export function associationDevelopmentGrant(s, clubId, amount, billId) {
  const p = requirePresident(s);
  if (!intMoney(amount) || amount < MIN_GRANT || amount > MAX_DIRECT_GRANT)
    throw new Error(
      tr(
        "يجب أن تتراوح المنحة التفاوضية بين ١٠٠ ألف و١٠ ملايين.",
        "A negotiated grant must be between 100,000 and 10,000,000.",
        "Une aide négociée doit être comprise entre 100 000 et 10 000 000.",
      ),
    );
  const account = accountFor(s, clubId);
  changeTreasury(s, "debit", amount, "council-development-grant", {
    clubId,
    billId,
  });
  creditClub(s, clubId, amount, { grant: true });
  return account;
}

export function createSupportFund(
  s,
  { name = "Association support fund", amount, criteria = "small" } = {},
) {
  const p = requirePresident(s);
  const finance = p.finance;
  if (!intMoney(amount) || amount < 1_000_000 || amount > MAX_FUND_AMOUNT)
    throw new Error(
      tr(
        "يجب أن يتراوح رصيد صندوق الدعم بين مليون و٥٠ مليونًا.",
        "A support fund must hold between 1,000,000 and 50,000,000.",
        "Un fonds de soutien doit contenir entre 1 000 000 et 50 000 000.",
      ),
    );
  if (!["small", "regional", "all"].includes(criteria))
    throw new Error(
      tr(
        "معيار أهلية الصندوق غير صالح.",
        "Invalid support-fund eligibility rule.",
        "Critère d’éligibilité du fonds invalide.",
      ),
    );
  if (finance.funds.length >= 50)
    throw new Error(
      tr(
        "وصل سجل الصناديق إلى الحد الأقصى.",
        "The support-fund register is full.",
        "Le registre des fonds de soutien est plein.",
      ),
    );
  const safeName = String(name).trim().slice(0, 60);
  if (!safeName)
    throw new Error(
      tr(
        "اسم الصندوق غير صالح.",
        "Invalid fund name.",
        "Nom du fonds invalide.",
      ),
    );
  changeTreasury(s, "debit", amount, "support-fund-reserve", { criteria });
  const fund = {
    id: `fund-${(s.nextId = (s.nextId || 0) + 1)}`,
    name: safeName,
    criteria,
    amount,
    remaining: amount,
    createdDate: s.date,
    createdSeason: s.seasonNumber,
    grants: [],
    status: "open",
  };
  finance.funds.push(fund);
  return fund;
}

export function grantFromSupportFund(s, fundId, clubId, amount) {
  const p = requirePresident(s);
  const fund = p.finance.funds.find((entry) => entry.id === fundId);
  const club = p.clubs.find((entry) => entry.clubId === clubId);
  if (!fund || fund.status !== "open" || !club)
    throw new Error(
      tr(
        "الصندوق أو النادي غير متاح.",
        "The fund or club is not available.",
        "Le fonds ou le club n’est pas disponible.",
      ),
    );
  if (
    (fund.criteria === "small" && club.bloc !== "small") ||
    (fund.criteria === "regional" && club.bloc === "big")
  )
    throw new Error(
      tr(
        "هذا النادي لا يطابق شروط الصندوق.",
        "This club does not meet the fund's eligibility rules.",
        "Ce club ne répond pas aux critères du fonds.",
      ),
    );
  if (fund.grants.some((grant) => grant.clubId === clubId))
    throw new Error(
      tr(
        "حصل النادي على منحة من هذا الصندوق بالفعل.",
        "This club has already received a grant from this fund.",
        "Ce club a déjà reçu une aide de ce fonds.",
      ),
    );
  if (!intMoney(amount) || amount < MIN_GRANT || amount > fund.remaining)
    throw new Error(
      tr(
        "قيمة المنحة تتجاوز الرصيد المتاح أو لا تصل إلى الحد الأدنى.",
        "The grant exceeds the available balance or is below the minimum.",
        "L’aide dépasse le solde disponible ou est inférieure au minimum.",
      ),
    );
  fund.remaining -= amount;
  if (!fund.remaining) fund.status = "closed";
  fund.grants.push({ clubId, amount, date: s.date });
  creditClub(s, clubId, amount, { grant: true });
  appendLedger(s, "memo", amount, "support-fund-grant", {
    fundId,
    clubId,
  });
  return fund;
}

function equalSplit(s, amount, type, eligibleClubIds) {
  const eligible = ensurePolitics(s)
    .clubs.filter((club) => eligibleClubIds.includes(club.clubId))
    .map((club) => club.clubId);
  if (!eligible.length || !intMoney(amount)) return { total: 0, shares: {} };
  return allocate(
    s,
    amount,
    { performance: 0, popularity: 0, equality: 100 },
    type,
    eligible,
  );
}

function reconcileAudit(finance) {
  const net = finance.ledger.reduce((total, entry) => {
    if (entry.direction === "credit") return total + entry.amount;
    if (entry.direction === "debit") return total - entry.amount;
    return total;
  }, 0);
  return (finance.ledgerOpeningBalance ?? finance.initialBalance) + net;
}

export function runFinancialAudit(
  s,
  { automatic = false, force = false } = {},
) {
  const p = ensurePolitics(s);
  if (!automatic) requirePresident(s);
  const finance = p.finance;
  const previous = finance.audits.find(
    (report) => report.season === s.seasonNumber,
  );
  if (previous && !force && previous.ledgerRevision === finance.ledgerRevision)
    return previous;
  if (previous)
    finance.audits = finance.audits.filter(
      (report) => report.season !== s.seasonNumber,
    );
  const ledgerBalance = reconcileAudit(finance);
  const discrepancy = finance.balance - ledgerBalance;
  const report = {
    id: `audit-${(s.nextId = (s.nextId || 0) + 1)}`,
    date: s.date,
    season: s.seasonNumber,
    status: discrepancy === 0 ? "clean" : "discrepancy",
    balance: finance.balance,
    ledgerBalance,
    discrepancy,
    entriesReviewed: finance.ledger.length,
    ledgerRevision: finance.ledgerRevision || 0,
    independent: Boolean(finance.auditMandate),
    findings:
      discrepancy === 0
        ? []
        : [
            {
              code: "ledger-mismatch",
              discrepancy,
            },
          ],
  };
  finance.audits.push(report);
  if (finance.audits.length > MAX_HISTORY)
    finance.audits.splice(0, finance.audits.length - MAX_HISTORY);
  finance.lastAuditSeason = s.seasonNumber;
  if (!automatic) return report;
  return report;
}

export function associationSeasonEnd(s) {
  const p = ensurePolitics(s);
  const finance = p.finance;
  if (finance.lastDistributionSeason === s.seasonNumber) return null;
  const broadcastIncome = Math.max(
    0,
    Math.min(
      500_000_000,
      Number(finance.broadcastRevenue || finance.tvPool || 0),
    ),
  );
  const tvPool = Math.max(
    0,
    Math.min(500_000_000, Number(finance.tvPool || broadcastIncome)),
  );
  if (broadcastIncome)
    changeTreasury(s, "credit", broadcastIncome, "broadcast-revenue");
  if (tvPool) {
    const amount = Math.min(tvPool, finance.balance);
    if (amount) allocate(s, amount, finance.distributionFormula, "broadcast");
  }
  if (finance.youthGrantPerSeason > 0) {
    const amount = Math.min(finance.youthGrantPerSeason, finance.balance);
    if (amount) {
      changeTreasury(s, "credit", amount, "youth-development-revenue");
      const eligible = p.clubs.map((club) => club.clubId);
      equalSplit(s, amount, "youth-development", eligible);
    }
  }
  if (finance.solidarityPerSeason > 0) {
    const amount = Math.min(finance.solidarityPerSeason, finance.balance);
    if (amount) {
      changeTreasury(s, "credit", amount, "solidarity-fund-revenue");
      let eligible = p.clubs
        .filter((club) => club.bloc === "small")
        .map((club) => club.clubId);
      if (!eligible.length)
        eligible = p.clubs
          .filter((club) => club.bloc === "regional")
          .map((club) => club.clubId);
      equalSplit(s, amount, "solidarity", eligible);
    }
  }
  finance.lastDistributionSeason = s.seasonNumber;
  const audit = runFinancialAudit(s, { automatic: true, force: true });
  return {
    season: s.seasonNumber,
    tvPool,
    audit,
    distributions: finance.distributions.filter(
      (record) => record.season === s.seasonNumber,
    ),
  };
}

export function financeSummary(s) {
  const p = ensurePolitics(s);
  return {
    balance: p.finance.balance,
    tvPool: p.finance.tvPool,
    formula: { ...p.finance.distributionFormula },
    lastDistributionSeason: p.finance.lastDistributionSeason,
    lastAudit: p.finance.audits.at(-1) || null,
    accounts: p.finance.clubAccounts,
    funds: p.finance.funds,
    laws: Object.keys(p.council.laws).filter((id) => POLITICAL_LAWS[id]),
  };
}
