// التبرعات 0.50 — جلسة «السياسة والصلاحيات» الدفعة 1.
// تبرع علني لأي نادٍ على خريطة الاتحاد بمبلغ حر من ثروتك الشخصية:
// امتنان (ارتفاع تأييد النادي) ← أصوات (التأييد يرفع نتيجة النادي في الاقتراع)،
// مع عدّاد حي وتغطية صحفية وسجل كامل. **إضافة بحتة**: لا شبهات، لا حرارة،
// لا نزاهة، لا شرعية، ولا أي عقوبة — والتبرع متاح دائمًا ولا يُطلب أبدًا.
import { assert, clamp, uid } from "../../core/utils.js";
import { tr } from "../../i18n/index.js";
import { extendedClub } from "../../data/expandedCatalog.js";
import { personalExpense } from "../empire/wealth.js";
import { message } from "../inbox.js";
import { adjustClubSupport, ensurePolitics } from "./state.js";

export const DONATION_MIN = 50_000;
export const DONATION_MAX = 500_000_000;
export const DONATION_LOG_LIMIT = 60;
export const DONATION_PRESS_LIMIT = 40;
// من هذا المبلغ يرسل النادي رسالة امتنان علني إلى بريدك.
export const DONATION_NOTABLE = 5_000_000;
// عبارة الخبر الثابتة في ملف الصحافة — مفتاح ترجمة جاهز في قاموس السياسة.
export const DONATION_PRESS_TITLE = "تبرع علني لنادٍ في الدوري";
export const DONATION_PRESS_TYPE = "سياسة";

export const DONATION_TIERS = Object.freeze([
  { id: "token", min: 0 },
  { id: "warm", min: 500_000 },
  { id: "generous", min: 5_000_000 },
  { id: "historic", min: 25_000_000 },
]);

export const donationTier = (amount) =>
  [...DONATION_TIERS].reverse().find((tier) => amount >= tier.min).id;

/** امتنان النادي: يكبر مع المبلغ بجذر تربيعي، ويتراجع كلما ارتفع تأييده أصلًا. */
export function donationGratitude(amount, support = 50) {
  const raw = 1 + Math.sqrt(Math.max(0, amount) / 250_000);
  const scale = clamp(1 - Number(support || 0) / 130, 0.25, 1);
  return Math.round(clamp(raw * scale, 0.5, 12) * 10) / 10;
}

export const donationAvailable = (s) =>
  Math.max(0, Math.floor(Number(s.empire?.personal) || 0));

/** معكوس الامتنان: أصغر تبرع يعطي هذه النقاط عند هذا التأييد (يُقرّب لأعلى 50 ألفًا). */
export function donationForGratitude(points, support = 50) {
  const target = Math.max(0, Number(points) || 0);
  const scale = clamp(1 - Number(support || 0) / 130, 0.25, 1);
  const raw = clamp(target / scale, 1, 12);
  if (raw <= 1) return DONATION_MIN;
  const amount =
    Math.ceil((250_000 * (raw - 1) ** 2) / DONATION_MIN) * DONATION_MIN;
  return clamp(amount, DONATION_MIN, DONATION_MAX);
}

/** أقل عدد تبرعات وأقل مبلغ لرفع تأييد نادٍ بمقدار نقاط معيّن (كل تبرع بسقف 12 نقطة). */
export function donationPlanForSupport(support, points) {
  const room = clamp(100 - Number(support || 0), 0, 100);
  const target = Math.min(Math.max(0, Number(points) || 0), room);
  let current = Number(support || 0);
  let left = target;
  let amount = 0;
  let count = 0;
  while (left > 0.05 && count < 20) {
    const chunk = Math.min(left, 12);
    const chunkAmount = donationForGratitude(chunk, current);
    const gained = donationGratitude(chunkAmount, current);
    amount += chunkAmount;
    count += 1;
    current = clamp(Math.round((current + gained) * 10) / 10, 0, 100);
    left = Math.round((left - gained) * 10) / 10;
  }
  return {
    amount,
    count,
    reached: target > 0 && left <= 0.05,
    target,
    supportAfter: current,
  };
}

export function donationsState(s) {
  const p = ensurePolitics(s);
  p.donations ||= {
    total: 0,
    count: 0,
    gratitude: 0,
    clubs: {},
    log: [],
    press: [],
  };
  p.donations.clubs ||= {};
  p.donations.log ||= [];
  p.donations.press ||= [];
  return p.donations;
}

export function clubDonationRecord(s, clubId) {
  const d = donationsState(s);
  return (
    d.clubs[clubId] || { amount: 0, count: 0, gratitude: 0, lastDate: null }
  );
}

/** معاينة معلنة قبل الدفع: كم امتنانًا (كم نقطة تأييد) سيضيف هذا المبلغ الآن؟ */
export function donationPreview(s, clubId, amount) {
  const p = ensurePolitics(s);
  const club = p.clubs.find((row) => row.clubId === clubId);
  assert(
    club,
    tr(
      "النادي غير موجود في خريطة الاتحاد.",
      "That club is not on the association map.",
      "Ce club ne figure pas sur la carte de la fédération.",
    ),
  );
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  const gain = donationGratitude(value, club.support);
  const room = Math.round((100 - club.support) * 10) / 10;
  const gratitude = Math.max(0, Math.min(gain, room));
  return {
    clubId,
    amount: value,
    gratitude,
    supportBefore: club.support,
    supportAfter: clamp(
      Math.round((club.support + gratitude) * 10) / 10,
      0,
      100,
    ),
    capped: gratitude < gain,
    tier: donationTier(value),
  };
}

function recordPress(s, entry) {
  const p = ensurePolitics(s);
  const d = p.donations;
  d.press.unshift({
    id: entry.id,
    date: entry.date,
    season: entry.season,
    clubId: entry.clubId,
    amount: entry.amount,
  });
  d.press.length = Math.min(d.press.length, DONATION_PRESS_LIMIT);
  // مرآة في ملف الصحافة إن كان موجودًا (حفظات موسّعة) — عبارة ثابتة قابلة للترجمة.
  if (s.press && Array.isArray(s.press.news)) {
    s.press.news.unshift({
      date: entry.date,
      title: DONATION_PRESS_TITLE,
      type: DONATION_PRESS_TYPE,
    });
    s.press.news = s.press.news.slice(0, 60);
  }
}

/** تبرع علني واحد: خصم من الثروة الشخصية ← امتنان ← أصوات، بلا أي عقوبة. */
export function donateToClub(s, clubId, amount) {
  const p = ensurePolitics(s);
  const d = donationsState(s);
  const club = p.clubs.find((row) => row.clubId === clubId);
  assert(
    club,
    tr(
      "النادي غير موجود في خريطة الاتحاد.",
      "That club is not on the association map.",
      "Ce club ne figure pas sur la carte de la fédération.",
    ),
  );
  const value = Math.floor(Number(amount));
  assert(
    Number.isSafeInteger(value) && value >= DONATION_MIN,
    tr(
      `أقل تبرع علني ${DONATION_MIN.toLocaleString("en-US")}.`,
      `The smallest public donation is ${DONATION_MIN.toLocaleString("en-US")}.`,
      `Le don public minimal est de ${DONATION_MIN.toLocaleString("en-US")}.`,
    ),
  );
  assert(
    value <= DONATION_MAX,
    tr(
      `أعلى تبرع علني ${DONATION_MAX.toLocaleString("en-US")}.`,
      `The largest public donation is ${DONATION_MAX.toLocaleString("en-US")}.`,
      `Le don public maximal est de ${DONATION_MAX.toLocaleString("en-US")}.`,
    ),
  );
  assert(
    s.empire &&
      Number.isFinite(s.empire.personal) &&
      s.empire.personal >= value,
    tr(
      "الثروة الشخصية لا تكفي لهذا التبرع العلني.",
      "Personal wealth is not enough for this public donation.",
      "Votre fortune personnelle ne suffit pas pour ce don public.",
    ),
  );

  const preview = donationPreview(s, clubId, value);
  personalExpense(s, value);
  if (preview.gratitude > 0)
    adjustClubSupport(s, clubId, preview.gratitude, "public-donation");

  const entry = {
    id: uid(s, "donation"),
    date: s.date,
    season: s.seasonNumber,
    clubId,
    amount: value,
    gratitude: preview.gratitude,
    supportAfter: preview.supportAfter,
    tier: preview.tier,
  };
  d.total += value;
  d.count += 1;
  d.gratitude = Math.round((d.gratitude + preview.gratitude) * 10) / 10;
  const row = d.clubs[clubId] || {
    amount: 0,
    count: 0,
    gratitude: 0,
    lastDate: null,
  };
  row.amount += value;
  row.count += 1;
  row.gratitude = Math.round((row.gratitude + preview.gratitude) * 10) / 10;
  row.lastDate = s.date;
  d.clubs[clubId] = row;
  d.log.unshift(entry);
  d.log.length = Math.min(d.log.length, DONATION_LOG_LIMIT);
  recordPress(s, entry);

  if (value >= DONATION_NOTABLE) {
    const name = extendedClub(clubId)?.name || clubId;
    message(s, {
      title: tr(
        "امتنان علني على تبرعك",
        "Public gratitude for your donation",
        "Reconnaissance publique pour votre don",
      ),
      body: tr(
        `${name} يشكرك علنًا على تبرعك. الامتنان يرفع تأييده لك، والتأييد يظهر مباشرة في أصوات الاقتراع.`,
        `${name} thanks you publicly for your donation. The gratitude raises the club's support for you, and support shows directly in the ballots.`,
        `${name} vous remercie publiquement pour votre don. La reconnaissance renforce le soutien du club, et ce soutien apparaît directement dans les votes.`,
      ),
      category: "politics",
      kind: "public-donation",
      ref: entry.id,
    });
  }
  return entry;
}

/** العدّاد الحي: كل ما يُعرض في الواجهة يأتي من هنا. */
export function donationSummary(s) {
  const d = donationsState(s);
  const rows = Object.values(d.clubs || {});
  const largest = d.log.reduce((max, row) => Math.max(max, row.amount), 0);
  return {
    total: d.total,
    count: d.count,
    gratitude: d.gratitude,
    clubs: rows.filter((row) => row.count > 0).length,
    largest,
    available: donationAvailable(s),
    press: d.press.length,
    last: d.log[0] || null,
  };
}

export function donationTierLabel(tier) {
  if (tier === "historic")
    return tr("تبرع تاريخي", "Historic donation", "Don historique");
  if (tier === "generous")
    return tr("تبرع سخي", "Generous donation", "Don généreux");
  if (tier === "warm")
    return tr("تبرع ودود", "Warm donation", "Don chaleureux");
  return tr("لفتة طيبة", "Kind gesture", "Geste aimable");
}
