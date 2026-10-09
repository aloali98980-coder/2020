// التسويق: حملات بعائد حقيقي + رضا الرعاة يحرّك قيمة العروض والتجديدات.
import { addDays, random } from "../../core/utils.js";
import { assert, clamp } from "../../core/utils.js";
import { message } from "../inbox.js";
import { post } from "../finance.js";
import { CAMPAIGN_TYPES } from "../../data/staffCatalog.js";
import { ensureStaffCorp, corpSkill, srng } from "./staffCorp.js";

export const sponsorMood = (s, assetId) => ensureStaffCorp(s).marketing.mood?.[assetId] ?? null;
// معامل قيمة عروض الرعاية: رضا مرتفع يرفع، وغاضب يخفض.
export function sponsorMoodFactor(s, assetId) {
  const m = sponsorMood(s, assetId);
  if (m == null) return 1;
  if (m >= 80) return 1.1;
  if (m < 40) return 0.85;
  return 1;
}
export function setSponsorMood(s, assetId, v) {
  const m = ensureStaffCorp(s).marketing;
  m.mood = m.mood || {};
  m.mood[assetId] = clamp(Math.round(v), 0, 100);
  return m.mood[assetId];
}
export function launchCampaign(s, type, budget) {
  assert(CAMPAIGN_TYPES[type], "حملة غير صالحة.");
  assert(Number.isFinite(budget) && budget >= 100000 && budget <= 50000000, "الميزانية من ١٠٠ ألف إلى ٥٠ مليونًا.");
  assert(s.finance.cash >= budget, "السيولة لا تغطي الحملة.");
  if (type === "derby") assert(s.bigMatches?.some((m) => m.date > s.date && m.date <= addDays(s.date, 21)), "لا ديربي خلال ٣ أسابيع — الحملة الجماهيرية تحتاج موعدًا قريبًا.");
  const t = CAMPAIGN_TYPES[type];
  post(s, -budget, "marketing", "حملة: " + t.name.ar, "campaign-" + type + s.date);
  const m = ensureStaffCorp(s).marketing;
  const c = { id: "cmp" + Date.now().toString(36) + Math.floor(random() * 999), type, budget, ends: addDays(s.date, t.days), skill: corpSkill(s, "marketing") };
  m.campaigns = m.campaigns || [];
  m.campaigns.push(c);
  message(s, { title: `حملة: ${t.name.ar}`, body: `انطلقت بميزانية ${budget.toLocaleString("ar-EG")} — العائد يظهر ${c.ends}.`, category: "business" });
  return c;
}
// تسوية الحملات المنتهية: عائد = ميزانية × (٠.٦ + مهارة + سمعة + حظ).
export function marketingDay(s) {
  const m = ensureStaffCorp(s).marketing;
  m.campaigns = m.campaigns || [];
  const done = m.campaigns.filter((c) => c.ends <= s.date);
  if (!done.length) return done;
  m.campaigns = m.campaigns.filter((c) => c.ends > s.date);
  const rep = s.reputation;
  for (const c of done) {
    const t = CAMPAIGN_TYPES[c.type];
    const mult = 0.6 + (c.skill || 0) / 120 + rep / 250 + srng(s) * 0.3;
    const ret = Math.round(c.budget * mult);
    post(s, ret, "marketing-return", "عائد حملة: " + t.name.ar, c.id);
    s.fanSupport = clamp(s.fanSupport + t.fans, 0, 100);
    for (const k of Object.keys(m.mood || {})) m.mood[k] = clamp(m.mood[k] + 8, 0, 100);
    message(s, {
      title: `عائد حملة: ${t.name.ar}`,
      body: `أعادت ${(ret - c.budget) >= 0 ? "+" : ""}${(ret - c.budget).toLocaleString("ar-EG")} صافيًا، والجماهير ${t.fans > 0 ? "+" : ""}${t.fans}، ورضا الرعاة ارتفع.`,
      category: "business", money: ret,
    });
  }
  return done;
}
// تآكل الرضا الشهري: الراعي ينسى إن لم تُدلله.
export function marketingMonth(s) {
  const m = ensureStaffCorp(s).marketing;
  for (const k of Object.keys(m.mood || {})) m.mood[k] = clamp(m.mood[k] - 2, 0, 100);
}
// رد فعل نهاية العقد: غاضب يرحل ويأخذ معه جزءًا من الجمهور، وراضٍ يترك وداعية.
export function sponsorExpiryMood(s, c) {
  const m = sponsorMood(s, c.assetId);
  revenueShare(s, 0); // إبقاء الواردات متوازنة مع الاستيراد
  if (m != null && m < 25) {
    s.fanSupport = clamp(s.fanSupport + -3, 0, 100);
    message(s, { title: "راعٍ غاضب يرحل", body: `رضا الراعي عن ${c.sector || "القطاع"} انهار (${m}٪) — رحل غاضبًا وأخذ جزءًا من الجمهور معه. دلّل الرعاة بالحملات.`, category: "business" });
  } else if (m != null && m >= 80) {
    post(s, Math.round(c.amount * 0.05), "sponsor-farewell", "وداعية راعٍ", c.id + "-farewell");
    message(s, { title: "وداعية كريمة", body: `الراعي الراضي (${m}٪) ترك مكافأة وداعية ٥٪ — والباب مفتوح لعودته بعرض أغلى.`, category: "business" });
  }
  if (m != null) delete ensureStaffCorp(s).marketing.mood[c.assetId];
  return m;
}
