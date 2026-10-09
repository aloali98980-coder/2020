// السوشيال: حسابات رسمية ومحتوى مدروس يبيع القمصان، وحملات ديربي، وأزمات تُدار أو تنفجر.
import { addDays, assert, clamp, uid } from "../../core/utils.js";
import { closeThread, message } from "../inbox.js";
import { post } from "../finance.js";
import { SOCIAL_CONTENTS, SOCIAL_CRISES } from "../../data/staffCatalog.js";
import { ensureStaffCorp, corpSkill, srng } from "./staffCorp.js";

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
  message(s, { title: `محتوى جديد: ${t.name.ar}`, body: `التفاعل ${st.engagement}٪ والمتابعون ${st.followers.toLocaleString("ar-EG")} — الجمهور ${t.fans > 0 ? "+" : ""}${t.fans}.`, category: "business" });
  return st;
}
export function derbyCampaign(s) {
  const st = socialState(s);
  const match = (s.bigMatches || [])
    .filter((m) => m.date > s.date && m.date <= addDays(s.date, 7))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  assert(match, "لا ديربي خلال ٧ أيام — الحملة الجماهيرية تحتاج موعدًا قريبًا.");
  const matchId = match.id || match.date;
  assert(st.lastDerbyMatch !== matchId, "أُطلقت حملة هذا الديربي بالفعل.");
  assert(s.finance.cash >= 300000, "السيولة لا تغطي حملة الديربي (٣٠٠ ألف).");
  const postId = uid(s, "derby-campaign");
  post(s, -300000, "social-content", "حملة الديربي", postId);
  st.lastDerbyMatch = matchId;
  s.fanSupport = clamp(s.fanSupport + 3, 0, 100);
  for (const p of s.players.filter((p) => p.clubId === s.clubId && p.status === "active")) p.morale = clamp(p.morale + 2, 0, 100);
  st.followers = Math.round(st.followers * 1.05);
  st.posts = [{ kind: "derby", date: s.date, matchId }].concat(st.posts || []).slice(0, 20);
  message(s, { title: "أسبوع الديربي يشتعل", body: "حملة جماهيرية ب٣٠٠ ألف: الجمهور +٣ والمعنويات +٢ والمتابعون +٥٪ — الملعب سيغلي.", category: "business" });
  return true;
}
export function triggerCrisis(s, kind) {
  const st = socialState(s);
  if (st.crisis?.status === "open") return st.crisis;
  const k = kind && SOCIAL_CRISES[kind] ? kind : ["tweet", "video", "fight"][Math.floor(srng(s) * 3)];
  st.crisis = { id: uid(s, "social-crisis"), kind: k, status: "open", deadline: addDays(s.date, 3) };
  message(s, {
    title: `أزمة سوشيال: ${SOCIAL_CRISES[k].name.ar}`,
    body: `${SOCIAL_CRISES[k].desc.ar} أمامك ٣ أيام للرد من تبويب السوشيال — التجاهل يكلّف الجمهور.`,
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
  if (how === "apology") assert(s.finance.cash >= 200000, "الاعتذار العلني يكلف ٢٠٠ ألف.");
  c.status = how;
  if (how === "apology") {
    post(s, -200000, "social-content", "اعتذار علني", uid(s, "social-apology"));
    s.fanSupport = clamp(s.fanSupport + 2, 0, 100);
    for (const p of s.players.filter((p) => p.clubId === s.clubId && p.status === "active")) p.morale = clamp(p.morale + -1, 0, 100);
    st.engagement = clamp(st.engagement + 5, 0, 100);
    message(s, { title: "اعتذار علني أنهى الأزمة", body: "اعتذار مدروس ب٢٠٠ ألف: الجمهور +٢ والتفاعل +٥ — والفريق خسر نقطة معنوية واحدة.", category: "business" });
  } else if (how === "fine") {
    post(s, 150000, "discipline-fine", "غرامة انضباطية", uid(s, "social-fine"));
    for (const p of s.players.filter((p) => p.clubId === s.clubId && p.status === "active")) p.morale = clamp(p.morale + -3, 0, 100);
    st.engagement = clamp(st.engagement + 2, 0, 100);
    message(s, { title: "غرامة على المتسبب", body: "غرامة ١٥٠ ألفًا دخلت الخزينة، لكن المعنويات -٣ — العدالة لها ثمن.", category: "business" });
  } else {
    s.fanSupport = clamp(s.fanSupport + -4, 0, 100);
    st.engagement = clamp(st.engagement - 10, 0, 100);
    if (srng(s) < 0.3) {
      c.status = "open";
      c.deadline = addDays(s.date, 3);
      message(s, { title: "الأزمة تتفاقم!", body: "التجاهل أشعلها أكثر: الجمهور -٤ والتفاعل -١٠ — والأزمة مستمرة ٣ أيام أخرى.", category: "business", required: true, ref: c.id });
      return c;
    }
    message(s, { title: "تجاهلت العاصفة", body: "مرت الأزمة بلا رد: الجمهور -٤ والتفاعل -١٠ — الصمت هنا لم يكن ذهبًا.", category: "business" });
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
    message(s, { title: "انفجرت الأزمة!", body: "انتهت مهلة ال٣ أيام بلا رد: الجمهور -٦ والتفاعل -١٢ — الجماهير لا تنسى.", category: "business", required: true, ref: st.crisis.id });
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
  // مبيعات أونلاين مرتبطة بالمتابعين إن كان المتجر مفتوحًا.
  if ((s.commerce?.businesses || []).includes("shop")) {
    const skill = Math.max(corpSkill(s, "marketing"), corpSkill(s, "social"));
    const income = Math.round((st.followers / 1000) * (s.commerce.shirtPrice || 0) * 0.02 * (1 + skill / 100));
    if (income > 0) {
      post(s, income, "online-shirts", "مبيعات المتجر أونلاين", "soc-shop" + s.date);
      message(s, { title: "مبيعات المتجر أونلاين", body: `جلب المتابعون ${income.toLocaleString("ar-EG")} هذا الشهر — المحتوى الجيد يبيع القمصان.`, category: "business", money: income });
    }
  }
  return st;
}
