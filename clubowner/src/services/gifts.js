// الهدايا 0.46 — العطاء يُكافأ، والمنع لا يُعاقب.
// منح فردية وجماعية من خزينة النادي، ترقيات بلقب وراتب، هدايا لاعبين من الثروة
// الشخصية (نقدًا أو قيمة، وتتضاعف في عيد الميلاد)، وخط الغرباء 🔥 لصحفي أو مسؤول
// قاري — أثره معلن وكلفته على الشبهات معلنة قبل الدفع، ولا يوجد أي عقوبات على
// عدم الإهداء (لا فحص بخل، ولا رسائل لوم، ولا تراجع مؤشرات مع الوقت).
import { assert, clamp, uid, addDays, daysBetween } from "../core/utils.js";
import { post } from "./finance.js";
import { message } from "./inbox.js";
import { tr } from "../i18n/index.js";
import { ensureEmpire } from "./empire/wealth.js";
import { addSuspicion } from "./blackFiles.js";
import {
  PLAYER_TITLES,
  VALUE_GIFTS,
  GRANT_LIMITS,
  CASH_GIFT,
  STRANGER_KINDS,
  CONFEDERATIONS,
  playerTitle,
  valueGift,
} from "../data/giftCatalog.js";

export { PLAYER_TITLES, VALUE_GIFTS, GRANT_LIMITS, CASH_GIFT, STRANGER_KINDS, CONFEDERATIONS };

const G = (s) => s.gifts;

export function ensureGifts(s) {
  if (!s.gifts || s.gifts.schema !== 1)
    s.gifts = {
      schema: 1,
      log: [],
      lastGrantPlayer: {},
      lastSquadGrant: null,
      lastGiftPlayer: {},
      lastStranger: {},
      titles: {},
      birthdays: [],
    };
  return s.gifts;
}

// ولاء اللاعب: حقل هادئ يبدأ من 50، يتحرك بهداء المالك فقط في هذا النظام.
export const playerLoyalty = (p) => clamp(Number(p?.loyalty ?? 50), 0, 100);

function record(s, entry) {
  const g = ensureGifts(s);
  g.log.unshift({ id: uid(s, "gift"), date: s.date, ...entry });
  g.log.length = Math.min(g.log.length, 60);
}

const squadOf = (s) => s.players.filter((p) => p.clubId === s.clubId && p.status !== "retired");
const onCooldown = (date, today, days) => !!date && daysBetween(date, today) < days;

function bumpPlayer(s, p, morale, loyalty) {
  p.morale = clamp(Math.round(p.morale + morale), 0, 100);
  p.loyalty = clamp(Math.round(playerLoyalty(p) + loyalty), 0, 100);
}

// ── المنح: من خزينة النادي، مسجلة في الدفاتر كأي صرف حقيقي ──────────────────
export function grantPersonal(s, playerId, amount) {
  const g = ensureGifts(s);
  const p = s.players.find((x) => x.id === playerId && x.clubId === s.clubId && x.status !== "retired");
  assert(p, "لاعب غير متاح للمنح.");
  assert(
    Number.isSafeInteger(amount) &&
      amount >= GRANT_LIMITS.personalMin &&
      amount <= GRANT_LIMITS.personalMax,
    `المنحة الفردية من ${GRANT_LIMITS.personalMin.toLocaleString("en-US")} إلى ${GRANT_LIMITS.personalMax.toLocaleString("en-US")}.`,
  );
  assert(s.finance.cash >= amount, "خزينة النادي لا تكفي.");
  assert(
    !onCooldown(g.lastGrantPlayer[playerId], s.date, GRANT_LIMITS.personalCooldownDays),
    "هذا اللاعب تلقى منحة حديثًا؛ انتظر انتهاء الفاصل.",
  );
  post(s, -amount, "gifts", `منحة تقديرية لـ ${p.name}`, `gift-grant-${playerId}-${s.date}`);
  bumpPlayer(s, p, GRANT_LIMITS.personalMorale, GRANT_LIMITS.personalLoyalty);
  g.lastGrantPlayer[playerId] = s.date;
  record(s, { kind: "grant", target: p.name, label: tr("منحة فردية", "Personal grant", "Prime individuelle"), amount });
  message(s, {
    title: tr("منحة فردية", "Personal grant", "Prime individuelle"),
    body: tr(
      `منحة ${amount.toLocaleString("en-US")} لـ ${p.name} من خزينة النادي. المعنويات والولاء ارتفعا، والدفاتر سجلت الصرف.`,
      `A ${amount.toLocaleString("en-US")} grant for ${p.name} from the club treasury. Morale and loyalty rose; the ledger recorded it.`,
      `Une prime de ${amount.toLocaleString("en-US")} pour ${p.name} depuis la trésorerie. Moral et loyauté en hausse ; le registre est à jour.`,
    ),
    category: "events",
  });
  return { morale: p.morale, loyalty: p.loyalty };
}

export function grantSquad(s, amount) {
  const g = ensureGifts(s);
  const list = squadOf(s);
  assert(list.length, "لا قائمة متاحة.");
  assert(
    Number.isSafeInteger(amount) &&
      amount >= GRANT_LIMITS.squadMin &&
      amount <= GRANT_LIMITS.squadMax,
    `المنحة الجماعية من ${GRANT_LIMITS.squadMin.toLocaleString("en-US")} إلى ${GRANT_LIMITS.squadMax.toLocaleString("en-US")}.`,
  );
  assert(s.finance.cash >= amount, "خزينة النادي لا تكفي.");
  assert(
    !onCooldown(g.lastSquadGrant, s.date, GRANT_LIMITS.squadCooldownDays),
    "منحة جماعية حديثة؛ انتظر انتهاء الفاصل.",
  );
  post(s, -amount, "gifts", "منحة جماعية للقائمة", `gift-squad-${s.date}`);
  for (const p of list) bumpPlayer(s, p, GRANT_LIMITS.squadMorale, GRANT_LIMITS.squadLoyalty);
  s.fanSupport = clamp(s.fanSupport + GRANT_LIMITS.squadFans, 0, 100);
  g.lastSquadGrant = s.date;
  record(s, { kind: "grant", target: tr("القائمة كاملة", "The whole squad", "Tout l'effectif"), label: tr("منحة جماعية", "Squad grant", "Prime collective"), amount });
  message(s, {
    title: tr("منحة جماعية", "Squad grant", "Prime collective"),
    body: tr(
      `منحة ${amount.toLocaleString("en-US")} وزعت على القائمة كاملة من خزينة النادي. الغرفة ارتفعت معنوياتها.`,
      `A ${amount.toLocaleString("en-US")} grant was shared across the whole squad from the club treasury. The dressing room's morale rose.`,
      `Une prime de ${amount.toLocaleString("en-US")} a été partagée avec tout l'effectif depuis la trésorerie. Le moral du vestiaire a monté.`,
    ),
    category: "events",
  });
  return list.length;
}

// ── الترقيات: لقب + راتب + ولاء — من خزينة النادي ───────────────────────────
export function promotePlayer(s, playerId, titleId, raisePct = 0) {
  const g = ensureGifts(s);
  const p = s.players.find((x) => x.id === playerId && x.clubId === s.clubId && x.status !== "retired");
  assert(p, "لاعب غير متاح للترقية.");
  const title = playerTitle(titleId);
  assert(title, "لقب غير معروف.");
  assert(!g.titles[playerId], "هذا اللاعب يحمل لقبًا بالفعل.");
  assert(
    !Object.values(g.titles).includes(titleId),
    "هذا اللقب محمول من لاعب آخر — الألقاب فريدة.",
  );
  assert(
    [0, 5, 10, 15, 20].includes(raisePct),
    "الزيادة المقررة: 0 أو 5 أو 10 أو 15 أو 20%.",
  );
  const oldSalary = p.salary;
  p.salary = Math.round(oldSalary * (1 + raisePct / 100));
  bumpPlayer(s, p, title.morale, title.loyalty);
  g.titles[playerId] = titleId;
  const raiseText = raisePct
    ? tr(` مع زيادة راتب ${raisePct}%`, ` with a ${raisePct}% wage raise`, ` avec une hausse de salaire de ${raisePct} %`)
    : "";
  record(s, {
    kind: "title",
    target: p.name,
    label: title.name.ar,
    amount: raisePct ? Math.round((p.salary - oldSalary) * 12) : 0,
  });
  message(s, {
    title: tr("ترقية مستحقة", "A deserved promotion", "Une promotion méritée"),
    body: tr(
      `${p.name} حمل لقب «${title.name.ar}»${raiseText}. الولاء والمعنويات ارتفعا.`,
      `${p.name} now carries the title "${title.name.en}"${raiseText}. Loyalty and morale rose.`,
      `${p.name} porte désormais le titre « ${title.name.fr} »${raiseText}. Loyauté et moral en hausse.`,
    ),
    category: "events",
  });
  return { title: titleId, salary: p.salary };
}

// ── هدايا اللاعبين: من الثروة الشخصية، نقدًا أو قيمة، والميلاد يضاعف ─────────
export const isBirthday = (p, date) =>
  !!p?.birthDate && p.birthDate.slice(5) === date.slice(5);

function applyGift(s, p, morale, loyalty, amount, label, birthday) {
  const g = ensureGifts(s);
  const f = birthday ? CASH_GIFT.birthdayFactor : 1;
  bumpPlayer(s, p, Math.round(morale * f), Math.round(loyalty * f));
  if (birthday) g.birthdays.push(`${p.id}:${s.date.slice(0, 4)}`);
  g.lastGiftPlayer[p.id] = s.date;
  record(s, { kind: "gift", target: p.name, label, amount, birthday });
  message(s, {
    title: birthday ? tr("هدية عيد ميلاد 🎂", "A birthday gift 🎂", "Un cadeau d'anniversaire 🎂") : tr("هدية أسعدت غرفة الملابس", "A gift that brightened the dressing room", "Un cadeau qui a réjoui le vestiaire"),
    body: birthday
      ? tr(
          `في عيد ميلاده وصلت إلى ${p.name} ${label}. الأثر تضاعف في هذا اليوم الخاص.`,
          `On his birthday, ${p.name} received ${label}. The effect was doubled on this special day.`,
          `Le jour de son anniversaire, ${p.name} a reçu ${label}. L'effet a été doublé en ce jour spécial.`,
        )
      : tr(
          `وصلت إلى ${p.name} ${label}. المعنويات والولاء ارتفعا.`,
          `${p.name} received ${label}. Morale and loyalty rose.`,
          `${p.name} a reçu ${label}. Moral et loyauté en hausse.`,
        ),
    category: "events",
  });
}

export function givePlayerCash(s, playerId, amount) {
  const g = ensureGifts(s);
  const p = s.players.find((x) => x.id === playerId && x.clubId === s.clubId && x.status !== "retired");
  assert(p, "لاعب غير متاح.");
  assert(
    Number.isSafeInteger(amount) && amount >= CASH_GIFT.min && amount <= CASH_GIFT.max,
    `الهدية المالية من ${CASH_GIFT.min.toLocaleString("en-US")} إلى ${CASH_GIFT.max.toLocaleString("en-US")}.`,
  );
  assert(
    !onCooldown(g.lastGiftPlayer[playerId], s.date, CASH_GIFT.cooldownDays),
    "هادف للاعب حديثًا؛ انتظر انتهاء الفاصل.",
  );
  const birthday = isBirthday(p, s.date);
  const e = ensureEmpire(s);
  assert(e.personal >= amount, "الثروة الشخصية لا تكفي.");
  e.personal -= amount;
  e.monthTrack.expenses += amount;
  applyGift(
    s,
    p,
    clamp(Math.round(amount / 500_000), 2, 8),
    clamp(Math.round(amount / 1_000_000), 1, 5),
    amount,
    tr("هدية مالية", "A cash gift", "Un cadeau en espèces"),
    birthday,
  );
  return { morale: p.morale, loyalty: p.loyalty, birthday };
}

export function givePlayerValueGift(s, playerId, giftId) {
  const g = ensureGifts(s);
  const p = s.players.find((x) => x.id === playerId && x.clubId === s.clubId && x.status !== "retired");
  assert(p, "لاعب غير متاح.");
  const gift = valueGift(giftId);
  assert(gift, "هدية غير معروفة.");
  assert(
    !onCooldown(g.lastGiftPlayer[playerId], s.date, CASH_GIFT.cooldownDays),
    "هادف للاعب حديثًا؛ انتظر انتهاء الفاصل.",
  );
  const birthday = isBirthday(p, s.date);
  const e = ensureEmpire(s);
  assert(e.personal >= gift.cost, "الثروة الشخصية لا تكفي.");
  e.personal -= gift.cost;
  e.monthTrack.expenses += gift.cost;
  applyGift(s, p, gift.morale, gift.loyalty, gift.cost, gift.name.ar, birthday);
  return { morale: p.morale, loyalty: p.loyalty, birthday };
}

// ── خط الغرباء 🔥: صحفي (ثقة الصحافة) أو مسؤول قاري (علاقات) — والشبهات الثمن ─
function ensurePress(s) {
  if (!s.press)
    s.press = { trust: 60, news: [], questions: [], promises: [], lastQuestion: null, delegate: false };
  return s.press;
}

export function giftStranger(s, kind, amount, target = null) {
  const g = ensureGifts(s);
  const def = STRANGER_KINDS[kind];
  assert(def, "خط غير معروف.");
  assert(
    def.amounts.includes(amount),
    "اختر قيمة من الخيارات المعلنة.",
  );
  assert(
    !onCooldown(g.lastStranger[kind], s.date, def.cooldownDays),
    "هدية على هذا الخط حديثة؛ انتظر انتهاء الفاصل.",
  );
  const e = ensureEmpire(s);
  assert(e.personal >= amount, "الثروة الشخصية لا تكفي.");
  e.personal -= amount;
  e.monthTrack.expenses += amount;
  const suspicion = Math.round(amount / 1_000_000 * def.suspicionPerMillion * 10) / 10;
  addSuspicion(s, suspicion);
  g.lastStranger[kind] = s.date;
  let detail;
  if (kind === "journalist") {
    const press = ensurePress(s);
    const gain = Math.min(def.trustCap, Math.round((amount / 1_000_000) * def.trustPerMillion));
    const before = press.trust;
    press.trust = clamp(press.trust + gain, 0, 100);
    detail = { gained: press.trust - before, channel: "trust" };
    record(s, { kind: "stranger", target: tr("صحفي", "A journalist", "Un journaliste"), label: tr("هدية صحفية 🔥", "A press gift 🔥", "Un cadeau presse 🔥"), amount });
  } else {
    const conf = CONFEDERATIONS.includes(target) ? target : "CAF";
    const rel = s.politics?.foreign?.relations;
    assert(rel && Number.isFinite(rel[conf]), "علاقات الاتحادات غير متاحة.");
    const gain = Math.min(def.relationsCap, Math.round((amount / 1_000_000) * def.relationsPerMillion));
    const before = rel[conf];
    rel[conf] = clamp(rel[conf] + gain, 0, 100);
    if (Number.isFinite(s.politics.foreign.influence))
      s.politics.foreign.influence = clamp(s.politics.foreign.influence + 1, -100, 100);
    detail = { gained: rel[conf] - before, channel: conf };
    record(s, { kind: "stranger", target: conf, label: tr("هدية مسؤول 🔥", "An official's gift 🔥", "Un cadeau pour un dirigeant 🔥"), amount });
  }
  message(s, {
    title: kind === "journalist" ? tr("هدية على الخط الصحفي 🔥", "A gift on the press line 🔥", "Un cadeau sur la ligne presse 🔥") : tr("هدية على خط المسؤولين 🔥", "A gift on the officials' line 🔥", "Un cadeau sur la ligne des dirigeants 🔥"),
    body: kind === "journalist"
      ? tr(
          `هدية ${amount.toLocaleString("en-US")} من الثروة الشخصية إلى صحفي. مصداقية الإدارة في الصحافة تحسنت، ومؤشر الشبهات ارتفع ${suspicion}%.`,
          `A ${amount.toLocaleString("en-US")} gift from your personal fortune to a journalist. Press credibility improved; suspicion rose by ${suspicion}%.`,
          `Un cadeau de ${amount.toLocaleString("en-US")} de votre fortune à un journaliste. La crédibilité presse s'est améliorée ; les soupçons ont monté de ${suspicion} %.`,
        )
      : tr(
          `هدية ${amount.toLocaleString("en-US")} من الثروة الشخصية إلى مسؤول في ${detail.channel}. العلاقة تحسنت، ومؤشر الشبهات ارتفع ${suspicion}%.`,
          `A ${amount.toLocaleString("en-US")} gift from your personal fortune to an official at ${detail.channel}. The relationship improved; suspicion rose by ${suspicion}%.`,
          `Un cadeau de ${amount.toLocaleString("en-US")} de votre fortune à un dirigeant de la ${detail.channel}. La relation s'est améliorée ; les soupçons ont monté de ${suspicion} %.`,
        ),
    category: "events",
  });
  return { suspicion, ...detail };
}

// ── الإيقاع اليومي: تذكير أعياد الميلاد فقط، ولا شيء آخر ────────────────────
export function giftsDay(s) {
  const g = s.gifts || ensureGifts(s);
  const soon = addDays(s.date, 3);
  for (const p of squadOf(s)) {
    if (!p.birthDate) continue;
    if (p.birthDate.slice(5) === soon.slice(5) && p.birthDate.slice(5) !== s.date.slice(5))
      message(s, {
        title: tr("عيد ميلاد قريب 🎂", "A birthday is coming 🎂", "Un anniversaire approche 🎂"),
        body: tr(
          `عيد ميلاد ${p.name} بعد أيام. هدية في اليوم نفسه يكون أثرها أكبر — ومن لا يُهدي لا شيء عليه.`,
          `${p.name}'s birthday is in a few days. A gift on the day itself counts double — and giving nothing carries no penalty.`,
          `L'anniversaire de ${p.name} est dans quelques jours. Un cadeau le jour même compte double — et ne rien offrir n'a aucune conséquence.`,
        ),
        category: "events",
      });
  }
  // الولاء العالي في الغرفة يمنح دفعة معنويات شهرية خفيفة.
  if (s.date.endsWith("-01")) {
    const list = squadOf(s);
    if (list.length && list.every((p) => playerLoyalty(p) >= 75))
      for (const p of list) p.morale = clamp(p.morale + 1, 0, 100);
  }
}
