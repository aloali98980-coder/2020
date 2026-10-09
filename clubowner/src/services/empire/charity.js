// الخير والسمعة في «حياة الملياردير» 0.29 — تبرعات ومشاريع خيرية باسم المالك
// ترفع السمعة وتخفض مؤشر الشبهات (المرحلة ٨)، والبخل يجرّ هجوم الصحافة.
import { assert, clamp, uid, daysBetween, addDays } from "../../core/utils.js";
import { message } from "../inbox.js";
import { reduceSuspicion } from "../blackFiles.js";
import { empireText } from "../../data/empireTexts.js";
import { ensureEmpire, netWorth, registerEmpireMonthHook } from "./wealth.js";

// الخبر الواحد يوصف بثلاث لغات من مصدر واحد.
const fill = (tpl, vars) =>
  Object.entries(vars).reduce((out, [k, v]) => out.replaceAll("{" + k + "}", v), tpl);

export const CHARITY_PROJECTS = Object.freeze({
  school: {
    cost: 8_000_000,
    days: 240,
    rep: 4,
    fans: 3,
    prestige: 12,
    suspicion: 6,
    name: { ar: "مدرسة", en: "school", fr: "école" },
  },
  hospital: {
    cost: 25_000_000,
    days: 365,
    rep: 7,
    fans: 6,
    prestige: 30,
    suspicion: 12,
    name: { ar: "مستشفى", en: "hospital", fr: "hôpital" },
  },
  orphanage: {
    cost: 12_000_000,
    days: 300,
    rep: 5,
    fans: 4,
    prestige: 18,
    suspicion: 9,
    name: { ar: "دار أيتام", en: "orphanage", fr: "orphelinat" },
  },
});

export const STINGY_NET_WORTH = 50_000_000;
export const STINGY_DAYS = 120;

// تبرع شخصي مباشر من الثروة 💎 — يخفض الشبهات ويرفع السمعة والشهرة.
export function donatePersonal(s, amount) {
  const e = ensureEmpire(s);
  assert(
    Number.isSafeInteger(amount) && amount >= 500_000 && amount <= 20_000_000,
    empireText("donateInvalid"),
  );
  assert(e.personal >= amount, empireText("donateNoFunds"));
  e.personal -= amount;
  e.monthTrack.expenses += amount;
  e.charity.personalTotal += amount;
  e.charity.total += amount;
  e.charity.lastGift = s.date;
  const reduction = (amount / 1_000_000) * 1.5;
  reduceSuspicion(s, reduction);
  s.reputation = clamp(s.reputation + Math.min(5, Math.round(amount / 2_000_000)), 0, 100);
  e.fame = clamp(e.fame + 1, 0, 100);
  e.prestige = clamp(e.prestige + Math.round(amount / 5_000_000), 0, 400);
  message(s, {
    title: empireText("personalDonateTitle"),
    body: empireText("personalDonateBody"),
    category: "events",
  });
  return reduction;
}

// مشروع خيري باسم المالك: يُدفع فورًا ويُفتتح بعد مدة البناء.
export function startCharityProject(s, kind) {
  const e = ensureEmpire(s);
  const def = CHARITY_PROJECTS[kind];
  assert(def, empireText("projectUnknown"));
  assert(
    !e.charity.projects.some((p) => p.kind === kind && !p.done),
    empireText("projectRunning"),
  );
  assert(e.personal >= def.cost, empireText("projectNoFunds"));
  e.personal -= def.cost;
  e.monthTrack.expenses += def.cost;
  e.charity.personalTotal += def.cost;
  e.charity.total += def.cost;
  e.charity.lastGift = s.date;
  const completesOn = addDays(s.date, def.days);
  e.charity.projects.push({
    id: uid(s, "charity"),
    kind,
    startedOn: s.date,
    completesOn,
    cost: def.cost,
    done: false,
  });
  message(s, {
    title: empireText("projectStartedTitle"),
    body: empireText("projectStartedBody"),
    category: "events",
  });
  return e.charity.projects.at(-1);
}

// فحص يومي: افتتاح المشاريع المكتملة.
export function charityDay(s) {
  const e = s.empire;
  if (!e) return null;
  const opened = [];
  for (const p of e.charity.projects) {
    if (p.done || p.completesOn > s.date) continue;
    p.done = true;
    const def = CHARITY_PROJECTS[p.kind];
    s.reputation = clamp(s.reputation + def.rep, 0, 100);
    s.fanSupport = clamp(s.fanSupport + def.fans, 0, 100);
    e.prestige = clamp(e.prestige + def.prestige, 0, 400);
    reduceSuspicion(s, def.suspicion);
    opened.push(p.kind);
    message(s, {
      title: empireText("projectOpenedTitle"),
      body: fill(empireText("projectOpenedBody"), {
        project: def.name.ar,
        owner: s.owner,
      }),
      category: "events",
    });
  }
  return opened.length ? opened : null;
}

// الفحص الشهري للبخل: ثروة كبيرة بلا عطاء طويل = هجوم صحفي.
function stinginessMonthHook(s) {
  const e = ensureEmpire(s);
  const worth = netWorth(s);
  if (worth < STINGY_NET_WORTH) return {};
  const last = e.charity.lastGift || s.startDate;
  if (daysBetween(last, s.date) <= STINGY_DAYS) return {};
  e.charity.stingyStrikes += 1;
  e.fame = clamp(e.fame - 3, 0, 100);
  s.fanSupport = clamp(s.fanSupport - 2, 0, 100);
  message(s, {
    title: empireText("stingyTitle"),
    body: empireText("stingyBody"),
    category: "events",
  });
  return { stingy: true };
}
registerEmpireMonthHook(stinginessMonthHook);
