import { excerpt, getLanguage } from "../i18n/index.js";
import { boardTextFor } from "../data/boardTexts.js";
import { eventDecisionView } from "./events.js";
import { heading, badge, empty, button } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { num, date, esc, category, money , cur} from "../ui/format.js";
export function inboxView(s, filter = "all", selected = null) {
  const list = s.inbox.filter((m) =>
    filter === "all" || filter === "required"
      ? filter === "all" || (m.required && m.status === "open")
      : m.category === filter,
  );
  const m = s.inbox.find((m) => m.id === selected) || list[0];
  return `${heading("مركز القرارات", "البريد الوارد", "الأحداث المهمة هنا. مفيش قرار كبير هيفوتك.", button("تعليم الكل كمقروء", "read-all", "", "ghost"))}<div class="filter-tabs">${[
    ["all", "كل الرسائل"],
    ["required", "مطلوب قرار"],
    ["transfers", "التعاقدات"],
    ["sponsors", "الرعايات"],
    ["finance", "المالية"],
    ["facilities", "المنشآت"],
    ["matches", "المباريات"],
    ["careers", "الجهاز الفني والمسيرة"],
    ["events", "أحداث النادي"],
    ["board", "الجمعية العمومية"],
  ]
    .map(
      ([id, title]) =>
        `<button data-action="inbox-filter" data-id="${id}" class="${id === filter ? "active" : ""}">${title}${id === "all" ? ` <span>${num(s.inbox.length)}</span>` : ""}</button>`,
    )
    .join(
      "",
    )}</div><div class="inbox-layout"><section class="panel message-list">${list.length ? list.map((x) => `<button class="message-preview ${x.id === m?.id ? "selected" : ""} ${!x.read ? "unread" : ""}" data-action="open-message" data-id="${x.id}"><div class="message-preview-top"><span>${category(x.category)}</span><small>${date(x.date).split(" ").slice(0, 2).join(" ")}</small></div><h4>${!x.read ? '<i class="unread-dot"></i>' : ""}${esc(x.title)}</h4><p>${excerpt(x.body, 90)}</p>${x.required && x.status === "open" ? badge("ينتظر قرارك", "gold") : x.status === "resolved" ? badge("تم التعامل", "green") : ""}</button>`).join("") : empty("مفيش رسائل هنا", "الرسائل الجديدة هتظهر أول ما توصل.")}</section><section class="panel message-detail">${m && list.some((x) => x.id === m.id) ? messageDetail(s, m) : empty("بريدك منظم", "اختار قسم أو رسالة لعرض التفاصيل.")}</section></div>`;
}
export function messageDetail(s, m) {
  let actions = "";
  const isBoard = typeof m.kind === "string" && m.kind.startsWith("board-");
  // رسائل الجمعية العمومية للعلم: زر واحد يفتح اللائحة كاملة.
  if (isBoard && !(m.required && m.status === "open"))
    actions = button(boardTextFor("boardMailOpen", null, getLanguage()), "go-board", "", "primary");
  if (m.required && m.status === "open") {
    if (isBoard)
      actions =
        button(boardTextFor("boardMailOpen", null, getLanguage()), "go-board", "", "primary") +
        button(boardTextFor("boardMailSeen", null, getLanguage()), "resolve", m.id, "ghost");
    if (m.kind === "academy-review")
      actions =
        button("مراجعة الأكاديمية", "go-talent", m.ref, "primary") +
        button("اطلعت — سأقرر خلال المهلة", "resolve", m.id, "ghost");
    if (m.kind === "loan-offer")
      actions =
        button("راجع شروط الإعارة", "loan-review", m.ref, "primary") +
        button("رفض العرض", "loan-reject", m.ref, "ghost");
    if (m.kind === "club-decision") actions = eventDecisionView(s, m.ref);
    if (m.kind === "retirement")
      actions =
        button(
          `تأهيل لمسار مهني — ${money(60000)} ${cur()}`,
          "retire-prepare",
          m.ref,
          "primary",
        ) +
        button("طلب تأجيل الاعتزال", "retire-extend", m.ref, "secondary") +
        button("احترام قرار الاعتزال", "retire-respect", m.ref, "ghost");
    if (m.kind === "career-offer")
      actions =
        button("مراجعة العرض الوظيفي", "hire-staff", m.ref, "primary") +
        button("عدم تقديم عرض الآن", "resolve", m.id, "ghost");
    if (m.kind === "sponsor")
      actions =
        button("راجع عروض الرعاية", "sponsor-offers", m.ref, "primary") +
        button("رفض الفرصة", "resolve", m.id, "ghost");
    if (m.kind === "transfer") {
      const n = s.negotiations.find((n) => n.id === m.ref);
      actions =
        `<div class="decision-amount"><small>قيمة الانتقال المطلوبة</small><strong>${money(n.counter)} ${cur()}</strong></div>` +
        button("موافقة والتفاوض مع اللاعب", "accept-club", m.ref, "primary") +
        button("إنهاء التفاوض", "reject-transfer", m.ref, "ghost");
    }
    if (m.kind === "personal")
      actions =
        button("تفاوض على العقد", "player-contract", m.ref, "primary") +
        button("الانسحاب من الصفقة", "reject-transfer", m.ref, "ghost");
    if (m.kind === "renewal")
      actions =
        button("شروط التجديد", "renew-player", m.ref, "primary") +
        button("السماح بانتهاء العقد", "resolve", m.id, "ghost");
    if (m.kind === "liquidity")
      actions =
        button("راجع التمويل", "go-finance", m.id, "primary") +
        button("اطلعت وسأراجع المصروفات", "resolve", m.id, "ghost");
  }
  return `<div class="message-detail-header"><span class="sender-avatar">${icon(m.category === "transfers" ? "transfer" : m.category === "sponsors" ? "sponsor" : "building", 23)}</span><div><strong>إدارة ${category(m.category)}</strong><small>إلى: <span data-no-translate>${esc(s.owner)}</span> · ${date(m.date)}</small></div>${badge(m.status === "resolved" ? "تم التعامل" : m.required ? "قرار مطلوب" : "للعلم", m.status === "resolved" ? "green" : m.required ? "gold" : "")}</div><h2>${esc(m.title)}</h2><p class="message-body">${esc(m.body)}</p>${m.deadline ? `<div class="deadline">${icon("clock", 18)} آخر موعد: ${date(m.deadline)}${m.status === "open" ? " · تقدم الوقت متوقف حتى قرارك" : ""}</div>` : ""}${actions ? `<div class="message-actions">${actions}</div>` : ""}<div class="message-signature">مع تحيات فريق الإدارة،<br><strong>مكتب ${category(m.category)}</strong></div>`;
}
