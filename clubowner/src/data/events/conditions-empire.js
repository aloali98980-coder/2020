// بوابات أحداث «حياة الملياردير» 0.29 — لا يظهر حدث عمّا ليس موجودًا في
// الحفظة: لا يخت لمن لا يملك يختًا، ولا حماة لمن لم يتزوج. كل دالة تتحمل
// حفظة بلا وحدة الإمبراطورية (تعيد false بلا رمي).
import { daysBetween } from "../../core/utils.js";

const emp = (s) => s.empire || null;

export const hasEmpire = (s) => !!emp(s);

export const ownsAsset = (assetId) => (s) =>
  (emp(s)?.assets || []).some((a) => a.assetId === assetId);

export const ownsCategory = (cat) => (s) =>
  (emp(s)?.assets || []).some(
    (a) => a.assetId.split("-")[0] === cat || a.assetId.startsWith(cat),
  );

export const ownsAny = (ids) => (s) =>
  (emp(s)?.assets || []).some((a) => ids.includes(a.assetId));

export const personalAtLeast = (n) => (s) => (emp(s)?.personal || 0) >= n;
export const netWorthAtLeast = (n) => (s) => {
  const e = emp(s);
  if (!e) return false;
  const assets = e.assets.reduce((sum, a) => sum + (a.sellValue || 0), 0);
  const p = e.portfolio;
  const port = p.rental + p.stocks + p.startup + p.coin + p.deposit;
  return e.personal + assets + port - e.debt >= n;
};
export const prestigeAtLeast = (n) => (s) => (emp(s)?.prestige || 0) >= n;
export const fameAtLeast = (n) => (s) => (emp(s)?.fame || 0) >= n;
export const lifestyleIs = (tier) => (s) => emp(s)?.lifestyle === tier;
export const storyIs = (story) => (s) => emp(s)?.story === story;
export const hasDebt = (s) => (emp(s)?.debt || 0) > 0;
export const isMarried = (s) => emp(s)?.family?.status === "married";
export const hasWife = (s) => !!emp(s)?.family?.wife;
export const childrenAtLeast = (n) => (s) =>
  (emp(s)?.family?.children || []).length >= n;
export const hasChildStage = (stage) => (s) => {
  const kids = emp(s)?.family?.children || [];
  return kids.some((c) => {
    const years = daysBetween(c.born, s.date) / 365;
    if (stage === "infant") return years < 3;
    if (stage === "child") return years >= 3 && years < 13;
    return years >= 13; // teen
  });
};
export const portfolioAtLeast = (kind, n) => (s) =>
  (emp(s)?.portfolio?.[kind] || 0) >= n;
export const charityGivenAtLeast = (n) => (s) =>
  (emp(s)?.charity?.personalTotal || 0) >= n;
export const wifeSad = (s) => {
  const w = emp(s)?.family?.wife;
  return !!w && w.happiness < 70;
};
export const wifeUnhappy = (s) => {
  const w = emp(s)?.family?.wife;
  return !!w && w.happiness < 60;
};
// هل اقتربت الذكرى السنوية أو عيد الميلاد خلال نافذة أيام؟
const monthDay = (date) => date.slice(5, 10);
export const anniversaryWithin = (days) => (s) => {
  const w = emp(s)?.family?.wife;
  if (!w) return false;
  const target = w.marriedOn.slice(5, 10);
  if (monthDay(s.date) === target) return true;
  // تقريب بسيط: نفس الشهر واقتراب اليوم.
  return (
    s.date.slice(5, 7) === w.marriedOn.slice(5, 7) &&
    Math.abs(Number(s.date.slice(8, 10)) - Number(w.marriedOn.slice(8, 10))) <= days
  );
};
export const birthdayWithin = (days) => (s) => {
  const w = emp(s)?.family?.wife;
  if (!w) return false;
  const target = w.birthday;
  if (monthDay(s.date) === target) return true;
  const mm = Number(target.slice(0, 2));
  const curMm = Number(s.date.slice(5, 7));
  if (curMm !== mm) return false;
  return Math.abs(Number(s.date.slice(8, 10)) - Number(target.slice(3, 5))) <= days;
};
export const notGiftedThisYear = (s) => {
  const w = emp(s)?.family?.wife;
  if (!w) return false;
  return (w.giftYear || 0) < Number(s.date.slice(0, 4));
};

export const all =
  (...fns) =>
  (s) =>
    fns.every((f) => f(s));
export const any =
  (...fns) =>
  (s) =>
    fns.some((f) => f(s));
