// الفروع 0.47 — شاشة «الفروع»: اختيار دولة من الأسواق الخمسين، ميزتها المعلنة،
// التكلفة والمدة، عوائدها، الترقية، مدير الكفاءة، مرشحو الناشئين، والقرارات
// الإضافية. كل الخيارات إضافة بحتة: لا خيار يضر، والتجاهل بلا عقوبة.
import { tr, getLanguage } from "../i18n/index.js";
import { money, num, cur, date, esc } from "../ui/format.js";
import { heading, badge, button, infoNote } from "../components/shared.js";
import { icon } from "../components/icons.js";
import {
  ensureBranches,
  builtBranches,
  branchQuote,
  branchByCountry,
  branchIncome,
  managerCandidates,
  ownedClubsIn,
  marketName,
} from "../services/branches.js";
import {
  MARKETS,
} from "../data/worldMarkets.js";
import {
  BRANCH_CAP,
  BRANCH_LEVELS,
  BRANCH_DECISIONS,
  countryEdge,
  EDGE_NAMES,
  EDGE_DESCS,
  CANDIDATE_SIGNING_COST,
} from "../data/branchCatalog.js";
import { ensureEmpire } from "../services/empire/wealth.js";

const mname = (m) => (getLanguage() === "ar" ? m.nameAr : m.name);
const edgeName = (id) => tr(EDGE_NAMES[id].ar, EDGE_NAMES[id].en, EDGE_NAMES[id].fr);

function availableMarkets(s) {
  const b = ensureBranches(s);
  const busy = new Set([
    ...b.list.map((x) => x.country),
    ...b.projects.map((p) => p.country),
  ]);
  return MARKETS.filter((m) => !busy.has(m.id));
}

function openPanel(s, selected) {
  const b = ensureBranches(s);
  const markets = availableMarkets(s);
  const capReached = b.list.length >= BRANCH_CAP;
  const current = markets.some((m) => m.id === selected) ? selected : markets[0]?.id;
  return `<section class="panel"><div class="panel-head"><h3>🌍 ${tr("افتح فرعًا بدولة", "Open a branch in a country", "Ouvrir une branche dans un pays")}</h3>${badge(`${num(b.list.length)} / ${num(BRANCH_CAP)}`, capReached ? "gold" : "green")}</div>
  ${capReached ? `<p class="muted">${tr("بلغت سقف الفروع في هذه النسخة.", "You reached the branch cap in this version.", "Vous avez atteint la limite des branches dans cette version.")}</p>` : markets.length ? `<div class="gift-form"><select id="branch-country">${markets
    .map(
      (m) =>
        `<option value="${m.id}" ${m.id === current ? "selected" : ""}>${esc(mname(m))} · ${edgeName(countryEdge(m.id))} · ${money(branchQuote(s, m.id, 1).cost)} ${cur()}</option>`,
    )
    .join("")}</select>${button(tr("افتح الفرع", "Open the branch", "Ouvrir la branche"), "branch-open", "", "secondary")}${button(tr("فورًا ⚡", "Instant ⚡", "Immédiat ⚡"), "branch-open-instant", "", "soft")}</div>
  ${current ? branchPreview(s, current) : ""}` : `<p class="muted">${tr("كل الأسواق فيها فروع.", "Every market already has a branch.", "Chaque marché a déjà une branche.")}</p>`}</section>`;
}

function branchPreview(s, country) {
  const q = branchQuote(s, country, 1);
  const fast = branchQuote(s, country, 1, { instant: true });
  const edge = countryEdge(country);
  const owned = ownedClubsIn(s, country);
  return `<div class="branch-preview" data-country="${country}"><p><b>${tr("ميزة الدولة:", "Country edge:", "Atout du pays :")}</b> ${edgeName(edge)} — ${tr(EDGE_DESCS[edge].ar, EDGE_DESCS[edge].en, EDGE_DESCS[edge].fr)}</p>
  <p><b>${tr("عادي:", "Normal:", "Normal :")}</b> ${money(q.cost)} ${cur()} · ${num(q.days)} ${tr("يومًا", "days", "jours")}</p>
  <p><b>${tr("معجل ⚡:", "Accelerated ⚡:", "Accéléré ⚡ :")}</b> ${money(fast.cost)} ${cur()} · ${tr("استلام فوري اليوم (+25%)", "instant delivery today (+25%)", "livraison immédiate aujourd'hui (+25 %)")}${q.bridge ? ` · 🌉 ${tr("خصم الجسر مفعّل (أندية تملكها هنا)", "empire bridge discount active (owned clubs here)", "remise du pont actif (clubs possédés ici)")}` : ""}</p></div>`;
}

function branchCard(s, branch) {
  const edge = countryEdge(branch.country);
  const income = branchIncome(s, branch);
  const levelBars = [1, 2, 3]
    .map((i) => `<i class="${i <= branch.level ? "filled" : ""}"></i>`)
    .join("");
  const project = ensureBranches(s).projects.find((p) => p.country === branch.country);
  const decisions = ensureBranches(s).decisions.filter((d) => d.branchId === branch.id);
  const cands = ensureBranches(s).candidates.filter((c) => c.branchId === branch.id);
  const managers = branch.manager ? "" : managerCandidates(s, branch.country);
  return `<section class="panel branch-card" data-country="${branch.country}">
  <div class="panel-head"><h3>🏟 ${esc(marketName(branch.country))}</h3><span class="level-bars">${levelBars}</span>${badge(`${tr("مستوى", "Level", "Niveau")} ${num(branch.level)}`, "green")}</div>
  <p class="muted">${edgeName(edge)} · ${tr("العائد الشهري الحالي:", "Current monthly income:", "Revenu mensuel actuel :")} <b>${money(income)} ${cur()}</b>${branch.manager ? ` · 👤 ${esc(branch.manager.name)} (${num(branch.manager.skill)})` : ""}</p>
  ${project ? `<p>⏳ ${tr("مشروع جارٍ حتى", "Project under way until", "Projet en cours jusqu'au")} ${date(project.end)} (${tr("المستوى", "level", "niveau")} ${num(project.targetLevel)})</p>` : branch.level < BRANCH_LEVELS ? `<div class="gift-form">${button(tr("ترقية للمستوى", "Upgrade to level", "Améliorer au niveau") + " " + num(branch.level + 1), "branch-upgrade", branch.country, "soft")} ${button(tr("ترقية فورية ⚡", "Instant upgrade ⚡", "Amélioration immédiate ⚡"), "branch-upgrade-instant", branch.country, "secondary")} <small class="muted">${money(branchQuote(s, branch.country, branch.level + 1).cost)} ${cur()} · ${num(branchQuote(s, branch.country, branch.level + 1).days)} ${tr("يومًا", "days", "jours")} — ${tr("أو فوري ⚡ بـ", "or instant ⚡ at", "ou immédiat ⚡ à")} ${money(branchQuote(s, branch.country, branch.level + 1, { instant: true }).cost)} ${cur()}</small></div>` : `<p class="muted">${tr("أقصى مستوى.", "Maximum level.", "Niveau maximum.")}</p>`}
  ${branch.manager ? button(tr("إنهاء تكليف المدير", "Dismiss the manager", "Renvoyer le directeur"), "branch-fire-manager", branch.country, "ghost small") : `<div class="gift-form"><select id="branch-mgr-${branch.country}">${managers.map((c) => `<option value="${c.id}">${esc(c.name)} · ${tr("مهارة", "skill", "compétence")} ${num(c.skill)} · ${money(c.wage)} ${cur()}</option>`).join("")}</select>${button(tr("عيّن مدير كفاءة", "Hire the manager", "Nommer le directeur"), "branch-hire-manager", branch.country, "secondary small")}</div>`}
  ${decisions.map((d) => {
    const def = BRANCH_DECISIONS.find((x) => x.id === d.defId);
    return `<div class="branch-decision"><b>${esc(tr(def.name.ar, def.name.en, def.name.fr))}</b><small class="muted">${esc(tr(def.note.ar, def.note.en, def.note.fr))}</small><span>${money(d.cost)} ${cur()} · ${tr("ينتهي", "expires", "expire")} ${date(d.expires)}</span>${button(tr("فعّل التعزيز", "Apply the boost", "Activer le renfort"), "branch-decide", d.id, "soft small")}</div>`;
  }).join("")}
  ${cands.map((c) => {
    const p = c.player;
    return `<div class="branch-candidate"><b>🌱 ${esc(p.name)}</b><small class="muted">${p.position} · ${num(p.age)} ${tr("سنة", "yrs", "ans")} · ${tr("تقييم", "rating", "note")} ${num(Math.round(p.rating))} → ${num(Math.round(p.potential))}</small>${button(tr("ضم", "Sign", "Recruter"), "branch-sign", c.id, "secondary small")} ${button(tr("بع", "Sell", "Vendre"), "branch-sell", c.id, "soft small")} ${button(tr("أطلق", "Release", "Libérer"), "branch-release", c.id, "ghost small")}<small class="muted">${tr("الضم", "Signing:", "Recrutement :")} ${money(CANDIDATE_SIGNING_COST)} ${cur()}</small></div>`;
  }).join("")}
  </section>`;
}

export function branchesView(s, selected = null) {
  const b = ensureBranches(s);
  const e = ensureEmpire(s);
  const bridgeNote = tr(
    "جسر إمبراطور الأندية: كل نادٍ تملكه في بلد الفرع يخفض التكلفة 20% (حتى 40%) ويرفع العائد 15% (حتى 30%).",
    "Club-emperor bridge: each club you own in the branch's country cuts the cost by 20% (up to 40%) and raises income by 15% (up to 30%).",
    "Pont Empereur des clubs : chaque club possédé dans le pays de la branche réduit le coût de 20 % (jusqu'à 40 %) et augmente les revenus de 15 % (jusqu'à 30 %).",
  );
  const projects = b.projects
    .map(
      (p) =>
        `<div class="report-row"><span>${esc(marketName(p.country))}</span><span>${p.kind === "open" ? tr("فتح", "Opening", "Ouverture") : tr("ترقية", "Upgrade", "Amélioration")}</span><span>${tr("الاستلام", "Delivery", "Livraison")}: ${date(p.end)}</span></div>`,
    )
    .join("");
  return `${heading(
    tr("ناديك خلف حدودك", "Your club beyond its borders", "Votre club au-delà de ses frontières"),
    tr("الفروع", "Branches", "Branches"),
    tr(
      "فرع بدولة بتكلفة ومستوى 1–3، وميزة دولة معلنة، وعوائد شهرية. القرارات كلها إضافة: كل خيار تعزيز، والتجاهل بلا أي عقوبة.",
      "A branch per country with a cost and levels 1–3, a stated country edge and monthly returns. Every decision is additive: each option is a boost, and ignoring them carries no penalty.",
      "Une branche par pays avec un coût et des niveaux 1–3, un atout annoncé et des revenus mensuels. Chaque décision est additive : toute option est un renfort, et les ignorer n'a aucune conséquence.",
    ),
    badge(`🌍 ${num(b.list.length)} / ${num(BRANCH_CAP)}`, "green"),
  )}
  ${openPanel(s, selected)}
  ${b.projects.length ? `<section class="panel"><div class="panel-head"><h3>⏳ ${tr("مشاريع جارية", "Projects under way", "Projets en cours")}</h3></div><div class="report-list">${projects}</div></section>` : ""}
  ${b.list.map((branch) => branchCard(s, branch)).join("")}
  ${b.candidates.length ? `<section class="panel"><div class="panel-head"><h3>🌱 ${tr("ناشئو الفروع", "Branch prospects", "Jeunes des branches")}</h3></div><p class="muted">${tr("كل ناشئ: ضم أو بيع أو إطلاق — ولا مسار فيه خسارة غير معلنة.", "Each prospect: sign, sell or release — no path hides a loss.", "Chaque jeune : recruter, vendre ou libérer — aucun chemin ne cache une perte.")}</p></section>` : ""}
  ${b.log.length ? `<section class="panel"><div class="panel-head"><h3>📒 ${tr("سجل الفروع", "Branches log", "Registre des branches")}</h3></div><div class="report-list">${b.log.slice(0, 10).map((x) => `<div class="report-row"><span>${date(x.date)}</span><b>${esc(x.label)}</b><span>${esc(marketName(x.country) || "")}</span><span>${x.amount ? money(x.amount) + " " + cur() : "—"}</span></div>`).join("")}</div></section>` : ""}
  ${infoNote(bridgeNote)}${""}`;
}
