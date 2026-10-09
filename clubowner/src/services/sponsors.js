import { difficulty } from "../models/difficulty.js";
import { ASSETS, SPONSORS } from "../data/catalog.js";
import { LOCAL_SPONSORS } from "../data/localSponsors.js";
import { marketBy } from "../data/worldMarkets.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { uid, assert, addDays, clamp } from "../core/utils.js";
import { post, obligation } from "./finance.js";
import { message } from "./inbox.js";
import { setSponsorMood, sponsorMoodFactor, sponsorExpiryMood } from "./staff/marketing.js";
// 0.15: local sponsors per market. Brand colors/initials derive
// deterministically so the data file stays compact triples.
const LOCAL_COLORS = [
  "#84b9fa",
  "#b9f36d",
  "#f5c86e",
  "#ef9f9f",
  "#c5a3f5",
  "#8fe3d0",
  "#f5a3d7",
  "#a3c8f5",
];
export function ownerCountry(s) {
  return extendedClub(s.clubId)?.country || "eg";
}
export function localSponsors(country) {
  return LOCAL_SPONSORS.filter((e) => e[0] === country).map(
    ([c, name, sector], i) => ({
      id: `${c}-local-${i}`,
      country: c,
      name,
      sector,
      color:
        LOCAL_COLORS[
          [...`${c}${i}`].reduce((a, ch) => a + ch.charCodeAt(0), 0) %
            LOCAL_COLORS.length
        ],
      initial: name.trim()[0],
      tag: `محلي — ${marketBy(c)?.nameAr || c}`,
      local: true,
    }),
  );
}
export function resolveSponsor(id) {
  return (
    SPONSORS.find((sp) => sp.id === id) ||
    localSponsors(String(id).split("-")[0]).find((sp) => sp.id === id)
  );
}
export function offersFor(s, assetId) {
  const asset = ASSETS.find((a) => a.id === assetId);
  const locals = localSponsors(ownerCountry(s));
  const assetIndex = Math.max(
    0,
    ASSETS.findIndex((a) => a.id === assetId),
  );
  const lineup = [
    locals[assetIndex % locals.length],
    SPONSORS[assetIndex % SPONSORS.length],
    locals[(assetIndex + 1) % locals.length],
  ];
  const dynastyNegotiation =
    1 + clamp(s.dynasty?.ownerBonuses?.sponsorNegotiation || 0, 0, 100) / 100;
  return lineup.map((sp, i) => ({
    id: sp.id + "-" + assetId,
    assetId,
    sponsorId: sp.id,
    amount: Math.round(
      asset.value *
        (0.86 + i * 0.075) *
        (s.reputation / 80) *
        difficulty(s).sponsor *
        dynastyNegotiation *
        (s.press ? 1 + (s.press.trust - 60) / 400 : 1) *
        sponsorMoodFactor(s, assetId),
    ),
    days: 360,
    exclusive: i === 1,
  }));
}
export function signSponsor(s, offer) {
  const asset = ASSETS.find((a) => a.id === offer.assetId),
    sponsor = resolveSponsor(offer.sponsorId);
  assert(
    asset &&
      sponsor &&
      offer.days === 360 &&
      Number.isSafeInteger(offer.amount) &&
      offer.amount > 0,
    "عرض رعاية غير صالح.",
  );
  assert(
    !s.sponsors.some(
      (c) => c.assetId === offer.assetId && c.status === "active",
    ),
    "المساحة محجوزة بعقد قائم.",
  );
  const active = s.sponsors.filter((c) => c.status === "active");
  assert(
    !active.some(
      (c) =>
        c.sponsorId !== sponsor.id &&
        resolveSponsor(c.sponsorId)?.sector === sponsor.sector &&
        (offer.exclusive || c.exclusive),
    ),
    "يوجد تعارض مع حصرية قطاع راعٍ قائم.",
  );
  const c = {
    ...offer,
    id: uid(s, "sponsor"),
    start: s.date,
    end: addDays(s.date, 360),
    status: "active",
  };
  s.sponsors.push(c);
  const priorMood = s.staffCorp?.marketing?.mood?.[c.assetId];
  setSponsorMood(s, c.assetId, Number.isFinite(priorMood) ? priorMood : 60);
  const upfront = Math.floor(c.amount * 0.25);
  post(
    s,
    upfront,
    "sponsorship",
    `دفعة توقيع: ${sponsor.name} — ${asset.name}`,
    c.id + "-upfront",
  );
  const rest = c.amount - upfront,
    each = Math.floor(rest / 11);
  for (let i = 1; i <= 11; i++)
    obligation(s, {
      amount: i === 11 ? rest - each * 10 : each,
      due: addDays(s.date, 30 * i),
      category: "sponsor-income",
      description: `دفعة رعاية ${sponsor.name}`,
      key: c.id + "-" + i,
      ref: c.id,
    });
  s.inbox
    .filter(
      (m) =>
        m.kind === "sponsor" && m.ref === offer.assetId && m.status === "open",
    )
    .forEach((m) => {
      m.status = "resolved";
      m.read = true;
    });
  message(s, {
    title: "شراكة جديدة للنادي",
    body: `تم توقيع رعاية ${asset.name} مع ${sponsor.name}. استلمت ٢٥٪ مقدمًا، والباقي على ١١ دفعة كل ٣٠ يومًا.`,
    category: "sponsors",
  });
  return c;
}
export function sponsorDay(s) {
  for (const c of s.sponsors) {
    if (c.status === "active" && c.end < s.date) {
      sponsorExpiryMood(s, c);
      c.status = "expired";
      message(s, {
        title: "انتهى عقد رعاية",
        body: "أصبحت المساحة الإعلانية متاحة لعروض جديدة.",
        category: "sponsors",
      });
    }
  }
}
// 0.16: counter-negotiation. The owner demands a raise over the posted offer;
// the sponsor accepts, counters halfway (min +5%), or walks away. Pure
// thresholds on reputation/trust so results are explainable; max 2 rounds
// per sponsor. Revised offers keep the 360-day shape, so signSponsor and
// exclusivity apply unchanged.
export const SPONSOR_RAISES = [10, 20, 30];
export function negotiateSponsor(s, assetId, sponsorId, raisePct) {
  const offer = offersFor(s, assetId).find((o) => o.sponsorId === sponsorId);
  assert(offer, "العرض غير متاح.");
  assert(SPONSOR_RAISES.includes(raisePct), "نسبة التفاوض غير صالحة.");
  assert(
    !s.sponsors.some((c) => c.assetId === assetId && c.status === "active"),
    "المساحة محجوزة بعقد قائم.",
  );
  s.sponsorDeals ||= [];
  let deal = s.sponsorDeals.find(
    (d) =>
      d.assetId === assetId &&
      d.sponsorId === sponsorId &&
      ["open", "countered", "accepted"].includes(d.status),
  );
  assert(
    !deal || deal.status !== "accepted",
    "تم الاتفاق بالفعل؛ وقّع العرض أو ارفضه أولًا.",
  );
  const round = deal ? deal.rounds + 1 : 1;
  assert(round <= 2, "انتهت جولات التفاوض مع هذا الراعي.");
  const asked = Math.round(offer.amount * (1 + raisePct / 100));
  const rep = s.reputation,
    trust = s.press?.trust ?? 60;
  const accepts =
    (raisePct <= 10 && rep >= 40) ||
    (raisePct <= 20 && rep >= 65 && trust >= 60) ||
    (raisePct <= 30 && rep >= 82 && trust >= 72);
  const sponsor = resolveSponsor(sponsorId);
  let status, current;
  if (accepts) {
    status = "accepted";
    current = { ...offer, amount: asked, negotiated: raisePct };
  } else if (rep >= 45) {
    const pct = Math.max(5, Math.floor(raisePct / 2));
    status = "countered";
    current = {
      ...offer,
      amount: Math.round(offer.amount * (1 + pct / 100)),
      negotiated: pct,
      countered: true,
    };
  } else {
    status = "dead";
    current = null;
  }
  if (!deal) {
    deal = {
      id: uid(s, "deal"),
      assetId,
      sponsorId,
      base: offer.amount,
      rounds: 0,
      status: "open",
      current: offer,
    };
    s.sponsorDeals.push(deal);
  }
  deal.rounds = round;
  deal.asked = asked;
  deal.status = status;
  if (current) deal.current = current;
  message(s, {
    title:
      status === "accepted"
        ? `وافق ${sponsor?.name || sponsorId} على طلبك`
        : status === "countered"
          ? `عرض مضاد من ${sponsor?.name || sponsorId}`
          : `انسحب ${sponsor?.name || sponsorId} من التفاوض`,
    body:
      status === "accepted"
        ? "قبل الراعي القيمة المطلوبة. يمكنك التوقيع بهذه القيمة من شاشة الرعايات."
        : status === "countered"
          ? "الراعي قابل طلبك في المنتصف. يمكنك التوقيع بالقيمة المضادة أو المحاولة مرة أخيرة."
          : "طلبك تجاوز سقف الراعي لسمعة ناديك الحالية. العروض الأخرى ما زالت متاحة.",
    category: "sponsors",
  });
  return deal;
}
export function answerSponsorDeal(s, dealId, accept) {
  const deal = s.sponsorDeals?.find((d) => d.id === dealId);
  assert(
    deal && ["accepted", "countered"].includes(deal.status),
    "التفاوض غير متاح.",
  );
  if (!accept) {
    deal.status = "declined";
    return null;
  }
  deal.status = "closed";
  return deal.current;
}
// 0.15: uniform performance bonuses, fractions of each active contract.
// Paid automatically at rollover when the just-completed season achieved
// them; expired contracts earn nothing. Modeled rates, not real clauses.
export const SPONSOR_BONUS = { title: 0.2, cup: 0.15, continental: 0.15 };
export const SPONSOR_BONUS_NAMES = {
  title: "لقب الدوري",
  cup: "لقب الكأس المحلية",
  continental: "التأهل القاري",
};
function continentalQualifier(s) {
  if (!s.expansion) return false;
  return s.expansion.cups.some(
    (c) =>
      c.entrants?.includes(s.clubId) &&
      (["europe-v1", "asia-v1", "concacaf-v1", "fifa-v1"].includes(c.engine) ||
        (c.engine === "continental-v1" &&
          !["domestic", "super-domestic"].includes(c.kind))),
  );
}
export function paySponsorBonuses(s, rank) {
  const active = s.sponsors.filter((c) => c.status === "active");
  if (!active.length) return [];
  const country = extendedClub(s.clubId)?.country;
  const achieved = {
    title: rank === 1,
    cup: s.expansion?.domesticHonours?.[country]?.winner === s.clubId,
    continental: continentalQualifier(s),
  };
  const paid = [];
  for (const c of active) {
    const sp = resolveSponsor(c.sponsorId);
    for (const [kind, hit] of Object.entries(achieved)) {
      if (!hit) continue;
      const amount = Math.round(c.amount * SPONSOR_BONUS[kind]);
      if (
        post(
          s,
          amount,
          "sponsor-bonus",
          `مكافأة ${SPONSOR_BONUS_NAMES[kind]} — ${sp?.name || c.sponsorId}`,
          `${c.id}-bonus-${kind}-s${s.seasonNumber}`,
        )
      )
        paid.push({ sponsorId: c.sponsorId, kind, amount });
    }
  }
  if (paid.length)
    message(s, {
      title: "مكافآت أداء من الرعاة",
      body:
        paid
          .map((p) => `${SPONSOR_BONUS_NAMES[p.kind]} لكل عقد قائم`)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join("؛ ") + ". صُرفت تلقائيًا نهاية الموسم.",
      category: "sponsors",
    });
  return paid;
}
