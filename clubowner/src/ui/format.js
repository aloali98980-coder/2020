import { getLanguage } from "../i18n/index.js";
import { currencyFor } from "../data/currencies.js";
// إعداد العرض: نمط الأرقام (هندية ٣٤٥ أو غربية 345) — فرع عرض فقط في Locale نفسه.
let digitsMode = "arabic";
export const setDigitsMode = (mode) => {
  digitsMode = mode === "western" ? "western" : "arabic";
};
const locale = () => {
  const base = ({ ar: "ar-EG", en: "en-GB", fr: "fr-FR" })[getLanguage()] || "ar-EG";
  return digitsMode === "western" ? base + "-u-nu-latn" : base;
};
export const num = (n) =>
  new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(n ?? 0);
export function money(n, compact = true) {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n),
    sign = n < 0 ? "−" : "";
  if (compact && a >= 1000000)
    return sign + num(Math.round(a / 100000) / 10) + " مليون";
  if (compact && a >= 1000)
    return sign + num(Math.round(a / 100) / 10) + " ألف";
  return sign + num(a);
}
// 0.15: display-only conversion. All money stays in EGP; the rate is a
// fixed modeled number, never live forex.
export const convertEGP = (n, country) =>
  Math.round((n ?? 0) * currencyFor(country).perEGP);
export function moneyLocal(n, country, compact = true) {
  return `${money(convertEGP(n, country), compact)} ${currencyFor(country).symbol}`;
}
export const date = (d) => {
  if (typeof d !== "string" || !d) return "—";
  const value = new Date(d + "T12:00:00Z");
  if (Number.isNaN(value.getTime())) return "—";
  return new Intl.DateTimeFormat(locale(), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
};
export const shortDate = (d) =>
  new Intl.DateTimeFormat(locale(), {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(d + "T12:00:00Z"));
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const position = (p) =>
  ({
    GK: "حارس مرمى",
    CB: "قلب دفاع",
    RB: "ظهير أيمن",
    LB: "ظهير أيسر",
    DM: "وسط دفاعي",
    CM: "وسط ملعب",
    AM: "صانع لعب",
    RW: "جناح أيمن",
    LW: "جناح أيسر",
    ST: "مهاجم",
  })[p] || p;
export const category = (c) =>
  ({
    club: "إدارة النادي",
    transfers: "التعاقدات",
    finance: "المالية",
    sponsors: "الرعايات",
    facilities: "المنشآت",
    matches: "المباريات",
    careers: "الجهاز الفني والمسيرة",
    events: "أحداث النادي",
  })[c] || c;
