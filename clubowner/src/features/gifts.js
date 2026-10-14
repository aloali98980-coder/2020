// الهدايا 0.46 — شاشة واحدة لكل خطوط العطاء: منح، ترقيات، هدايا لاعبين، وغرباء 🔥.
// الأساسيات ظاهرة (اللاعب، القيمة، الأثر)، والقاعدة معلنة: العطاء يُكافأ والمنع لا يُعاقب.
import { tr } from "../i18n/index.js";
import { money, num, cur, date, esc } from "../ui/format.js";
import { heading, badge, button, infoNote } from "../components/shared.js";
import { icon } from "../components/icons.js";
import { squad } from "../models/player.js";
import {
  PLAYER_TITLES,
  VALUE_GIFTS,
  GRANT_LIMITS,
  CASH_GIFT,
  CONFEDERATIONS,
} from "../services/gifts.js";
import { ensureGifts, playerLoyalty, isBirthday } from "../services/gifts.js";

const option = (value, text, selected = false) =>
  `<option value="${value}" ${selected ? "selected" : ""}>${text}</option>`;

const playerOptions = (s) =>
  squad(s)
    .map(
      (p) =>
        option(
          p.id,
          `${esc(p.name)} · ${num(Math.round(p.rating))} · ${tr("معنويات", "Morale", "Moral")} ${num(Math.round(p.morale))}`,
        ),
    )
    .join("");

const loyaltyTag = (p) =>
  `<small>${tr("الولاء", "Loyalty", "Loyauté")}: <b>${num(playerLoyalty(p))}%</b></small>`;

function grantsPanel(s) {
  const g = ensureGifts(s);
  return `<section class="panel"><div class="panel-head"><h3>💰 ${tr("المنح — من خزينة النادي", "Grants — from the club treasury", "Primes — depuis la trésorerie du club")}</h3></div>
  <p class="muted">${tr("منحة فردية للاعب أو جماعية للقائمة، مسجلة في الدفاتر. لا منحة = لا شيء يحدث أبدًا.", "A personal grant for one player or a squad-wide one, recorded in the ledger. No grant = nothing happens, ever.", "Une prime individuelle ou collective, enregistrée au registre. Pas de prime = rien ne se passe, jamais.")}</p>
  <div class="gift-form"><select id="grant-player">${playerOptions(s)}</select>
  <select id="grant-amount">${[2_500_000, 5_000_000, 10_000_000].map((v) => option(v, money(v) + " " + cur())).join("")}</select>
  ${button(tr("منحة فردية", "Personal grant", "Prime individuelle"), "gift-grant-personal", "", "secondary")}</div>
  <div class="gift-form"><select id="squad-amount" disabled hidden>${option(GRANT_LIMITS.squadMax, "")}</select>
  <select id="squad-amount-choice">${[5_000_000, 15_000_000, 30_000_000].map((v) => option(v, money(v) + " " + cur())).join("")}</select>
  ${button(tr("منحة جماعية للقائمة", "Squad-wide grant", "Prime collective"), "gift-grant-squad", "", "secondary")}
  <small class="muted">${g.lastSquadGrant ? tr("آخر منحة جماعية", "Last squad grant", "Dernière prime collective") + " " + date(g.lastSquadGrant) : tr("لا منحة جماعية بعد.", "No squad grant yet.", "Aucune prime collective pour l'instant.")}</small></div></section>`;
}

function promotionsPanel(s) {
  const g = ensureGifts(s);
  const taken = new Set(Object.values(g.titles));
  const free = PLAYER_TITLES.filter((t) => !taken.has(t.id));
  const holderOf = (titleId) =>
    Object.entries(g.titles).find(([, t]) => t === titleId)?.[0];
  const titlesRows = PLAYER_TITLES.map((t) => {
    const holderId = holderOf(t.id);
    const holder = holderId ? squad(s).find((p) => p.id === holderId) : null;
    return `<div class="gift-title-row"><b>${esc(tr(t.name.ar, t.name.en, t.name.fr))}</b><small class="muted">${esc(tr(t.desc.ar, t.desc.en, t.desc.fr))}</small>${
      holder
        ? `<span class="muted">» ${esc(holder.name)}</span>`
        : `<span class="muted">${tr("شاغر", "Vacant", "Vacant")}</span>`
    }</div>`;
  }).join("");
  return `<section class="panel"><div class="panel-head"><h3>🎖 ${tr("الترقيات — لقب + راتب + ولاء", "Promotions — title + wage + loyalty", "Promotions — titre + salaire + loyauté")}</h3></div>
  ${titlesRows}
  ${free.length ? `<div class="gift-form"><select id="promote-player">${playerOptions(s)}</select>
  <select id="promote-title">${free.map((t) => option(t.id, `${esc(t.name.ar)} (+${num(t.morale)} ${tr("معنويات", "morale", "moral")})`)).join("")}</select>
  <select id="promote-raise">${[0, 5, 10, 15, 20].map((v) => option(v, v ? `+${num(v)}% ${tr("راتب", "wage", "salaire")}` : tr("بدون زيادة", "No raise", "Sans hausse"))).join("")}</select>
  ${button(tr("ترقية", "Promote", "Promouvoir"), "gift-promote", "", "secondary")}</div>` : `<p class="muted">${tr("كل الألقاب محمولة الآن.", "Every title is currently held.", "Tous les titres sont portés actuellement.")}</p>`}
  </section>`;
}

function playerGiftsPanel(s) {
  const g = ensureGifts(s);
  const list = squad(s);
  const birthdays = list
    .filter((p) => p.birthDate)
    .map((p) => ({ p, today: isBirthday(p, s.date) }))
    .filter((x) => x.today);
  const minCash = CASH_GIFT.min.toLocaleString("en-US");
  const maxCash = CASH_GIFT.max.toLocaleString("en-US");
  const cashHint = tr(
    `من ${minCash} إلى ${maxCash} — والميلاد يضاعف الأثر.`,
    `Between ${minCash} and ${maxCash} — birthdays double the effect.`,
    `Entre ${minCash} et ${maxCash} — les anniversaires doublent l'effet.`,
  );
  return `<section class="panel"><div class="panel-head"><h3>🎁 ${tr("هدايا اللاعبين — من الثروة الشخصية", "Player gifts — from your personal fortune", "Cadeaux aux joueurs — depuis votre fortune")}</h3></div>
  ${birthdays.length ? `<div class="gift-birthdays">${birthdays.map((x) => `<span>🎂 ${esc(x.p.name)} — ${tr("عيد ميلاده اليوم! أثر الهدية يتضاعف.", "It's their birthday today! Gift effects are doubled.", "C'est son anniversaire aujourd'hui ! L'effet du cadeau est doublé.")}</span>`).join("")}</div>` : ""}
  <div class="gift-form"><select id="gift-player">${playerOptions(s)}</select></div>
  <div class="vehicle-grid">${VALUE_GIFTS.map(
    (x) => `<div class="vehicle-card"><h4>${esc(tr(x.name.ar, x.name.en, x.name.fr))}</h4><p class="muted">${money(x.cost)} ${cur()} · +${num(x.morale)} ${tr("معنويات", "morale", "moral")} · +${num(x.loyalty)} ${tr("ولاء", "loyalty", "loyauté")}</p>${button(tr("أهدِ", "Give", "Offrir"), "gift-player-value", x.id, "soft")}</div>`,
  ).join("")}</div>
  <div class="gift-form"><input id="gift-cash" type="number" min="${CASH_GIFT.min}" max="${CASH_GIFT.max}" step="50000" placeholder="1000000" />
  ${button(tr("هدية مالية", "Cash gift", "Cadeau en espèces"), "gift-player-cash", "", "secondary")}
  <small class="muted">${cashHint}</small></div></section>`;
}

function strangersPanel(s) {
  return `<section class="panel gift-risk"><div class="panel-head"><h3>🔥 ${tr("خط الغرباء — صحفي أو مسؤول", "The strangers' line — a journalist or an official", "La ligne des inconnus — journaliste ou dirigeant")}</h3></div>
  <p class="muted">${tr("هدية من ثروتك الشخصية تُحسب رشوة في الدفاتر الخفية: الأثر المطلوب يتحقق فورًا، ومؤشر الشبهات يرتفع بمقدار معلن. عدم الإهداء ليس له أي عقوبة.", "A gift from your personal fortune counts as a bribe in the hidden files: the wanted effect lands at once, and suspicion rises by a stated amount. Not giving carries no penalty at all.", "Un cadeau de votre fortune compte comme un pot-de-vin dans les dossiers cachés : l'effet voulu s'applique aussitôt, et les soupçons montent d'un montant annoncé. Ne rien offrir n'a aucune conséquence.")}</p>
  <div class="gift-form"><b>${tr("صحفي → مصداقية الإدارة في الصحافة", "Journalist → press credibility", "Journaliste → crédibilité presse")}</b>
  <select id="stranger-press-amount">${[1_000_000, 2_500_000, 5_000_000].map((v) => option(v, money(v) + " " + cur())).join("")}</select>
  ${button(tr("قدّم الهدية", "Give the gift", "Offrir le cadeau"), "gift-stranger-press", "", "danger")}</div>
  <div class="gift-form"><b>${tr("مسؤول قاري → علاقة الاتحاد", "Confederation official → federation relation", "Dirigeant continental → relation fédérale")}</b>
  <select id="stranger-official-target">${CONFEDERATIONS.map((c) => option(c, c)).join("")}</select>
  <select id="stranger-official-amount">${[1_000_000, 2_500_000, 5_000_000].map((v) => option(v, money(v) + " " + cur())).join("")}</select>
  ${button(tr("قدّم الهدية", "Give the gift", "Offrir le cadeau"), "gift-stranger-official", "", "danger")}</div>
  ${infoNote(tr("الخط الأحمر: كل هدية تُسجل أثرًا على مؤشر الشبهات في الملفات السوداء، ولا يمكن التراجع عنها.", "The red line: every gift leaves a stated mark on the black-files suspicion meter and cannot be undone.", "La ligne rouge : chaque cadeau laisse une trace annoncée sur les soupçons des dossiers noirs, sans retour arrière."))}</section>`;
}

function logPanel(s) {
  const g = ensureGifts(s);
  return g.log.length
    ? `<section class="panel"><div class="panel-head"><h3>📒 ${tr("سجل العطاء", "The giving log", "Le registre des dons")}</h3></div><div class="report-list">${g.log
        .slice(0, 12)
        .map(
          (x) =>
            `<div class="report-row"><span>${date(x.date)}</span><b>${esc(x.label)}</b><span>${esc(x.target)}</span><span>${x.amount ? money(x.amount) + " " + cur() : "—"}</span></div>`,
        )
        .join("")}</div></section>`
    : "";
}

export function giftsView(s) {
  const g = ensureGifts(s);
  const squadList = squad(s);
  const avgLoyalty = squadList.length
    ? Math.round(squadList.reduce((a, p) => a + playerLoyalty(p), 0) / squadList.length)
    : 50;
  return `${heading(
    tr("العطاء يُكافأ، والمنع لا يُعاقب", "Giving is rewarded; withholding is never punished", "Donner est récompensé ; ne pas donner n'est jamais puni"),
    tr("الهدايا", "Gifts", "Cadeaux"),
    tr("منح وترقيات وهدايا للاعبيك، وخط أحمر للغرباء. كل الأرقام والأثر معلنة قبل أي ضغطة.", "Grants, promotions and gifts for your players, and a red line for strangers. Every figure and effect is stated before any click.", "Primes, promotions et cadeaux pour vos joueurs, et une ligne rouge pour les inconnus. Chaque chiffre et effet est annoncé avant tout clic."),
    badge(`${tr("متوسط الولاء", "Average loyalty", "Loyauté moyenne")} ${num(avgLoyalty)}%`, avgLoyalty >= 75 ? "green" : ""),
  )}
  ${grantsPanel(s)}
  ${promotionsPanel(s)}
  ${playerGiftsPanel(s)}
  ${strangersPanel(s)}
  ${logPanel(s)}
  ${infoNote(tr("لا يوجد فحص بخل ولا رسالة لوم على عدم الإهداء — العطاء قرار حر تمامًا.", "There is no stinginess check and no blame message for not giving — giving is entirely your call.", "Aucun contrôle d'avarice et aucun reproche pour l'absence de don — offrir reste un libre choix."))}`;
}
