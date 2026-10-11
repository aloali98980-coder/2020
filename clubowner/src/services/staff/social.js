// السوشيال: حسابات رسمية ومحتوى مدروس يبيع القمصان، وحملات ديربي، وأزمات تُدار أو تنفجر.
import { addDays, assert, clamp, uid } from "../../core/utils.js";
import { closeThread, message } from "../inbox.js";
import { post } from "../finance.js";
import { SOCIAL_CONTENTS, SOCIAL_CRISES } from "../../data/staffCatalog.js";
import { ensureStaffCorp, corpSkill, srng } from "./staffCorp.js";
import { tr } from "../../i18n/index.js";

// 0.44 (القسم 5): المنصات الثلاث بأسمائها الحقيقية، وحسابات النادي الخيالية عليها.
// توزيع المتابعين بين المنصات ثابت ويجمع إلى 100%.
export const SOCIAL_PLATFORMS = Object.freeze([
  { id: "x", name: "X", handle: "@EmpireFC", share: 40 },
  { id: "instagram", name: "Instagram", handle: "@empire.fc", share: 35 },
  { id: "tiktok", name: "TikTok", handle: "@empirefc_official", share: 25 },
]);
// المحتوى الروتيني ينشر تلقائيًا كل شهر. المحتوى الكبير (ديربي/لقب/تعاقد نجم) يُنشر يدويًا فقط.
export const AUTO_ROUTINE_COST = 40_000;
export const SPONSOR_PER_THOUSAND = 300;
export const SPONSOR_MIN_FOLLOWERS = 100_000;

export function platformSplit(total) {
  const out = {};
  let left = Math.max(0, Math.round(total));
  SOCIAL_PLATFORMS.forEach((p, i) => {
    const part = i === SOCIAL_PLATFORMS.length - 1 ? left : Math.round((Math.max(0, total) * p.share) / 100);
    out[p.id] = part;
    left -= part;
  });
  return out;
}


export const socialState = (s) => ensureStaffCorp(s).social;
function ensureCrisisId(s, crisis) {
  if (crisis.id) return crisis.id;
  crisis.id = uid(s, "social-crisis");
  for (const item of s.inbox || []) {
    if (item.required && item.status === "open" && item.category === "business"
      && /أزمة سوشيال|الأزمة تتفاقم|انفجرت الأزمة/.test(item.title || "")) item.ref = crisis.id;
  }
  return crisis.id;
}
export function publishContent(s, kind) {
  assert(SOCIAL_CONTENTS[kind], "محتوى غير صالح.");
  const t = SOCIAL_CONTENTS[kind];
  assert(s.finance.cash >= t.cost, "السيولة لا تغطي إنتاج المحتوى.");
  const postId = uid(s, "social-post");
  post(s, -t.cost, "social-content", "محتوى: " + t.name.ar, postId);
  const st = socialState(s);
  const skill = corpSkill(s, "social");
  st.followers += Math.round((t.cost / 10) * (1 + skill / 80) * (1 + st.engagement / 200));
  st.engagement = clamp(st.engagement + t.eng, 0, 100);
  s.fanSupport = clamp(s.fanSupport + t.fans, 0, 100);
  st.posts = [{ kind, date: s.date }].concat(st.posts || []).slice(0, 20);
  message(s, { title: `محتوى جديد: ${t.name.ar}`, body: `التفاعل ${st.engagement}% والمتابعون ${st.followers.toLocaleString("en-US")} — الجمهور ${t.fans > 0 ? "+" : ""}${t.fans}.`, category: "business" });
  return st;
}
export function derbyCampaign(s) {
  const st = socialState(s);
  const match = (s.bigMatches || [])
    .filter((m) => m.date > s.date && m.date <= addDays(s.date, 7))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  assert(match, "لا ديربي خلال 7 أيام — الحملة الجماهيرية تحتاج موعدًا قريبًا.");
  const matchId = match.id || match.date;
  assert(st.lastDerbyMatch !== matchId, "أُطلقت حملة هذا الديربي بالفعل.");
  assert(s.finance.cash >= 300000, "السيولة لا تغطي حملة الديربي (300 ألف).");
  const postId = uid(s, "derby-campaign");
  post(s, -300000, "social-content", "حملة الديربي", postId);
  st.lastDerbyMatch = matchId;
  s.fanSupport = clamp(s.fanSupport + 3, 0, 100);
  for (const p of s.players.filter((p) => p.clubId === s.clubId && p.status === "active")) p.morale = clamp(p.morale + 2, 0, 100);
  st.followers = Math.round(st.followers * 1.05);
  st.posts = [{ kind: "derby", date: s.date, matchId }].concat(st.posts || []).slice(0, 20);
  message(s, { title: "أسبوع الديربي يشتعل", body: "حملة جماهيرية ب300 ألف: الجمهور +3 والمعنويات +2 والمتابعون +5% — الملعب سيغلي.", category: "business" });
  return true;
}
export function triggerCrisis(s, kind) {
  const st = socialState(s);
  if (st.crisis?.status === "open") return st.crisis;
  const k = kind && SOCIAL_CRISES[kind] ? kind : ["tweet", "video", "fight"][Math.floor(srng(s) * 3)];
  st.crisis = { id: uid(s, "social-crisis"), kind: k, status: "open", deadline: addDays(s.date, 3) };
  message(s, {
    title: `أزمة سوشيال: ${SOCIAL_CRISES[k].name.ar}`,
    body: `${SOCIAL_CRISES[k].desc.ar} أمامك 3 أيام للرد من تبويب السوشيال — التجاهل يكلّف الجمهور.`,
    category: "business", required: true, ref: st.crisis.id,
  });
  return st.crisis;
}
export function resolveCrisis(s, how) {
  const st = socialState(s);
  const c = st.crisis;
  assert(c?.status === "open", "لا أزمة مفتوحة.");
  ensureCrisisId(s, c);
  assert(["apology", "ignore", "fine"].includes(how), "رد غير صالح.");
  // فشل الدفع لا يحسم الأزمة: يمكن تخفيفها لاحقًا بعد تدبير السيولة.
  if (how === "apology") assert(s.finance.cash >= 200000, "الاعتذار العلني يكلف 200 ألف.");
  c.status = how;
  if (how === "apology") {
    post(s, -200000, "social-content", "اعتذار علني", uid(s, "social-apology"));
    s.fanSupport = clamp(s.fanSupport + 2, 0, 100);
    for (const p of s.players.filter((p) => p.clubId === s.clubId && p.status === "active")) p.morale = clamp(p.morale + -1, 0, 100);
    st.engagement = clamp(st.engagement + 5, 0, 100);
    message(s, { title: "اعتذار علني أنهى الأزمة", body: "اعتذار مدروس ب200 ألف: الجمهور +2 والتفاعل +5 — والفريق خسر نقطة معنوية واحدة.", category: "business" });
  } else if (how === "fine") {
    post(s, 150000, "discipline-fine", "غرامة انضباطية", uid(s, "social-fine"));
    for (const p of s.players.filter((p) => p.clubId === s.clubId && p.status === "active")) p.morale = clamp(p.morale + -3, 0, 100);
    st.engagement = clamp(st.engagement + 2, 0, 100);
    message(s, { title: "غرامة على المتسبب", body: "غرامة 150 ألفًا دخلت الخزينة، لكن المعنويات -3 — العدالة لها ثمن.", category: "business" });
  } else {
    s.fanSupport = clamp(s.fanSupport + -4, 0, 100);
    st.engagement = clamp(st.engagement - 10, 0, 100);
    if (srng(s) < 0.3) {
      c.status = "open";
      c.deadline = addDays(s.date, 3);
      message(s, { title: "الأزمة تتفاقم!", body: "التجاهل أشعلها أكثر: الجمهور -4 والتفاعل -10 — والأزمة مستمرة 3 أيام أخرى.", category: "business", required: true, ref: c.id });
      return c;
    }
    message(s, { title: "تجاهلت العاصفة", body: "مرت الأزمة بلا رد: الجمهور -4 والتفاعل -10 — الصمت هنا لم يكن ذهبًا.", category: "business" });
  }
  closeThread(s, c.id);
  return c;
}
// مضاعف سعر القميص أونلاين: كل ألف متابع ترفع الطلب.
export const onlineShirtMultiplier = (s) => 1 + Math.min(0.5, socialState(s).followers / 1000000);
export function socialDay(s) {
  const st = socialState(s);
  if (st.crisis?.status === "open" && st.crisis.deadline <= s.date) {
    ensureCrisisId(s, st.crisis);
    st.crisis.status = "exploded";
    s.fanSupport = clamp(s.fanSupport + -6, 0, 100);
    st.engagement = clamp(st.engagement - 12, 0, 100);
    message(s, { title: "انفجرت الأزمة!", body: "انتهت مهلة ال3 أيام بلا رد: الجمهور -6 والتفاعل -12 — الجماهير لا تنسى.", category: "business", required: true, ref: st.crisis.id });
    closeThread(s, st.crisis.id);
  }
  // شرارة عشوائية: تفاعل منخفض أو هزيمة ثقيلة يولّد أزمة.
  if (!st.crisis || st.crisis.status !== "open") {
    const lowEng = st.engagement < 30 && srng(s) < 0.08;
    const heavy = (s.lastMargin ?? 0) <= -3 && srng(s) < 0.1;
    if (lowEng || heavy) triggerCrisis(s);
  }
  return st;
}
export function socialMonth(s) {
  const st = socialState(s);
  st.followers += s.reputation * 50;
  st.engagement = clamp(st.engagement + (st.engagement < 50 ? 3 : -3), 0, 100);
  st.platforms = platformSplit(st.followers);
  // النشر التلقائي للروتيني فقط: كلفة صغيرة وأثر صغير، والكبرى تبقى يدوية.
  if (s.finance.cash >= AUTO_ROUTINE_COST) {
    post(s, -AUTO_ROUTINE_COST, "social-content", tr("نشر تلقائي روتيني", "Routine auto-post", "Publication automatique de routine"), uid(s, "social-auto") + s.date);
    st.autoPosts = (Number(st.autoPosts) || 0) + 1;
    st.engagement = clamp(st.engagement + 1, 0, 100);
  }
  // الرعاة يدفعون حسب المتابعين والتفاعل (دخل متحقق، لا رقم ثابت).
  if (st.followers >= SPONSOR_MIN_FOLLOWERS && st.engagement >= 30) {
    const sponsor = Math.round((Math.min(st.followers, 5_000_000) / 1000) * SPONSOR_PER_THOUSAND * (st.engagement / 100));
    if (sponsor > 0) {
      post(s, sponsor, "social-sponsor", tr("رعاية رقمية بالمتابعين", "Digital sponsorship by followers", "Parrainage numérique selon les abonnés"), "soc-sponsor" + s.date);
    }
  }
  // مبيعات أونلاين مرتبطة بالمتابعين إن كان المتجر مفتوحًا.
  if ((s.commerce?.businesses || []).includes("shop")) {
    const skill = Math.max(corpSkill(s, "marketing"), corpSkill(s, "social"));
    const income = Math.round((st.followers / 1000) * (s.commerce.shirtPrice || 0) * 0.02 * (1 + skill / 100));
    if (income > 0) {
      post(s, income, "online-shirts", "مبيعات المتجر أونلاين", "soc-shop" + s.date);
      message(s, { title: "مبيعات المتجر أونلاين", body: `جلب المتابعون ${income.toLocaleString("en-US")} هذا الشهر — المحتوى الجيد يبيع القمصان.`, category: "business", money: income });
    }
  }
  return st;
}
