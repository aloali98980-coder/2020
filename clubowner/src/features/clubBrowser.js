// 0.43 — متصفح الأندية: من الدوري إلى قائمة اللاعبين إلى بطاقة اللاعب.
// يقرأ من الحفظة نفسها (s.expansion.divisions و s.players)؛ لا يخترع قوائم لنادٍ
// بلا لاعبين محفوظين، ويعرض المصدر حين يكون النادي من حزمة العالم الموثقة.
import { marketBy } from "../data/worldMarkets.js";
import { extendedClub } from "../data/expandedCatalog.js";
import { CLUBS } from "../data/catalog.js";
import {
  crest,
  heading,
  badge,
  infoNote,
  button,
  empty,
  avatar,
} from "../components/shared.js";
import { icon } from "../components/icons.js";
import { tr, getLanguage } from "../i18n/index.js";
import { esc, num, money, date, cur } from "../ui/format.js";
import { standings, ownDivision } from "../services/pyramid.js";

const clubName = (id) =>
  extendedClub(id)?.name || CLUBS.find((c) => c.id === id)?.name || id;
const countryLabel = (id) => {
  const m = marketBy(id);
  if (!m) return id;
  return getLanguage() === "ar" ? m.nameAr : m.name;
};
const tierLabel = (tier) =>
  tr(`الدرجة ${num(tier)}`, `Tier ${num(tier)}`, `Division ${num(tier)}`);
// بطولات المتصفح: الدوريات المحاكاة في الحفظة، أو الدوري التجريبي (8 أندية) في النظام الأساسي.
function browserLeagues(s) {
  if (s.expansion?.divisions?.length)
    return s.expansion.divisions.map((d) => ({
      id: d.id,
      name: d.name,
      country: d.country,
      tier: d.tier,
      clubs: [...d.clubs],
      table: standings(d),
    }));
  return [
    {
      id: "demo",
      name: tr("الدوري التجريبي", "Demo league", "Ligue de démonstration"),
      country: "eg",
      tier: 1,
      clubs: CLUBS.map((c) => c.id),
      table: s.table.map((r) => ({ ...r })),
    },
  ];
}
// فهرس واحد لكل لاعبي الحفظة: عدد القائمة ومتوسط التقييم والأهداف لكل نادٍ معروض.
function squadIndex(s, ids) {
  const want = new Set(ids),
    map = new Map();
  for (const p of s.players) {
    if (p.status === "retired" || !want.has(p.clubId)) continue;
    const row = map.get(p.clubId) || {
      count: 0,
      rating: 0,
      goals: 0,
      seasonGoals: 0,
    };
    row.count += 1;
    row.rating += p.rating;
    row.goals += p.goals || 0;
    row.seasonGoals += p.seasonGoals || 0;
    map.set(p.clubId, row);
  }
  return map;
}
function leagueSelect(leagues, current) {
  const groups = new Map();
  for (const l of leagues) {
    if (!groups.has(l.country)) groups.set(l.country, []);
    groups.get(l.country).push(l);
  }
  return `<label class="field"><span>${tr("الدوري أو المجموعة", "League or group", "Ligue ou groupe")}</span><select id="club-league">${[
    ...groups,
  ]
    .map(
      ([country, list]) =>
        `<optgroup label="${esc(countryLabel(country))}">${list
          .map(
            (l) =>
              `<option value="${esc(l.id)}" ${l.id === current.id ? "selected" : ""}>${esc(l.name)} · ${tierLabel(l.tier)}</option>`,
          )
          .join("")}</optgroup>`,
    )
    .join("")}</select></label>`;
}
export function clubBrowserView(s, sel = {}) {
  const leagues = browserLeagues(s);
  const current =
    leagues.find((l) => l.id === sel.league) ||
    leagues.find((l) => l.id === ownDivision(s)?.id) ||
    leagues[0];
  const rankOf = new Map(current.table.map((r, i) => [r.clubId, i + 1]));
  const query = String(sel.q || "")
    .trim()
    .toLowerCase();
  const visible = current.clubs.filter(
    (id) => !query || clubName(id).toLowerCase().includes(query),
  );
  const stats = squadIndex(s, current.clubs);
  const selected = current.clubs.includes(sel.club) ? sel.club : null;
  const clubCount = leagues.reduce((a, l) => a + l.clubs.length, 0);
  return `${heading(
    tr("دليل الأندية", "Clubs directory", "Répertoire des clubs"),
    tr(
      "من الدوري إلى قائمة اللاعبين",
      "From league to squad",
      "De la ligue à l'effectif",
    ),
    tr(
      "اختر البطولة ثم النادي لعرض قائمته المحفوظة وفتح بطاقة أي لاعب. كل الأرقام من هذه الحفظة، لا من ملفات خارجية.",
      "Pick a competition, then a club, to open its saved squad and any player card. Every number comes from this career, not an external file.",
      "Choisissez une compétition puis un club pour ouvrir son effectif enregistré et la fiche d'un joueur. Tous les chiffres viennent de cette carrière.",
    ),
    badge(
      `${num(leagues.length)} ${tr("بطولة", "competitions", "compétitions")} · ${num(clubCount)} ${tr("ناديًا", "clubs", "clubs")}`,
    ),
  )}<section class="panel club-browser-filter"><div class="player-filters">${leagueSelect(leagues, current)}<label class="search-field">${icon("search", 19)}<input id="club-search" placeholder="${tr("ابحث باسم النادي…", "Search a club…", "Rechercher un club…")}" value="${esc(sel.q || "")}" aria-label="${tr("البحث عن نادٍ", "Search a club", "Rechercher un club")}"></label><span class="muted result-count">${num(visible.length)} ${tr("ناديًا في العرض", "clubs shown", "clubs affichés")}</span></div></section><section class="panel"><div class="panel-head"><h3>${esc(current.name)}</h3><span class="muted">${esc(countryLabel(current.country))} · ${tierLabel(current.tier)} · ${num(current.clubs.length)} ${tr("ناديًا", "clubs", "clubs")}</span></div><div class="table-scroll"><table class="league-table"><thead><tr><th>#</th><th>${tr("النادي", "Club", "Club")}</th><th>${tr("اللاعبون", "Players", "Joueurs")}</th><th>${tr("متوسط التقييم", "Avg rating", "Note moyenne")}</th><th>${tr("أهداف الموسم", "Season goals", "Buts de la saison")}</th><th></th></tr></thead><tbody>${visible
    .map((id) => {
      const st = stats.get(id) || { count: 0, rating: 0, seasonGoals: 0 };
      return `<tr class="${[id === s.clubId ? "own" : "", id === selected ? "selected" : ""].filter(Boolean).join(" ")}"><td>${rankOf.has(id) ? num(rankOf.get(id)) : "—"}</td><td><span class="club-cell">${crest(id, "tiny")}<strong><bdi dir="auto">${esc(clubName(id))}</bdi></strong>${id === s.clubId ? badge(tr("ناديك", "Your club", "Votre club"), "green") : ""}</span></td><td>${st.count ? num(st.count) : badge(tr("بلا قائمة", "No squad", "Sans effectif"))}</td><td>${st.count ? num(Math.round(st.rating / st.count)) : "—"}</td><td>${st.count ? num(st.seasonGoals) : "—"}</td><td>${button(tr("القائمة", "Squad", "Effectif"), "club-open", id, "small " + (id === selected ? "primary" : "ghost"))}</td></tr>`;
    })
    .join(
      "",
    )}</tbody></table></div>${visible.length ? "" : empty(tr("لا نتائج", "No results", "Aucun résultat"), tr("جرّب اسمًا آخر أو امسح البحث.", "Try another name or clear the search.", "Essayez un autre nom."), "search")}</section>${selected ? clubPanel(s, selected, current, rankOf.get(selected)) : infoNote(tr("اختر «القائمة» بجانب أي نادٍ لعرض لاعبيه.", "Choose “Squad” next to a club to list its players.", "Choisissez « Effectif » pour afficher ses joueurs."))}${infoNote(
    tr(
      "اللاعبون هنا هم لاعبو هذه الحفظة فقط: أسواق لم تُفعّل عند بدء المشوار تظهر أنديتها بلا قوائم، ولا تُملأ القوائم الناقصة بأسماء مختلقة. القدرات والعقود تقديرات محاكاة.",
      "Players here are the ones saved in this career: markets not enabled at setup list their clubs with no squad, and missing squads are never filled with invented names. Abilities and contracts are simulation estimates.",
      "Les joueurs affichés sont ceux de cette carrière : les marchés non activés n'ont pas d'effectif enregistré, et aucun nom inventé ne comble une lacune. Les notes et contrats sont estimés.",
    ),
  )}`;
}
function clubPanel(s, clubId, league, rank) {
  const c = extendedClub(clubId),
    squad = s.players
      .filter((p) => p.clubId === clubId && p.status !== "retired")
      .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  const avg = (list, key) =>
    list.length
      ? Math.round(list.reduce((a, p) => a + (p[key] || 0), 0) / list.length)
      : 0;
  const seasonGoals = squad.reduce((a, p) => a + (p.seasonGoals || 0), 0);
  const wages = squad.reduce((a, p) => a + (p.salary || 0), 0);
  const head = `<div class="player-profile-head">${crest(clubId)}<div><span class="eyebrow">${esc(countryLabel(league.country))} · ${esc(league.name)}${rank ? " · " + tr("المركز", "Rank", "Rang") + " " + num(rank) : ""}</span><h2><bdi dir="auto">${esc(clubName(clubId))}</bdi></h2><p>${tierLabel(league.tier)}${c?.city ? " · " + esc(c.city) : ""}${c?.level ? " · " + esc(c.level) : ""}</p></div>${clubId === s.clubId ? badge(tr("ناديك", "Your club", "Votre club"), "green") : ""}</div>`;
  if (!squad.length)
    return `<section class="panel club-card">${head}<div class="profile-stats"><div><small>${tr("اللاعبون المحفوظون", "Saved players", "Joueurs enregistrés")}</small><strong>0</strong></div>${c?.importedCount ? `<div><small>${tr("أسماء موثقة في الحزمة", "Sourced names in the pack", "Noms sourcés dans le paquet")}</small><strong>${num(c.importedCount)}</strong></div>` : ""}</div>${empty(tr("لا قائمة محفوظة لهذا النادي", "No saved squad for this club", "Aucun effectif enregistré"), tr("لم يكن سوق هذا النادي مفعّلًا عند إنشاء المشوار، أو أُفرغت قائمته. لا نعرض أسماء غير محفوظة.", "This club's market was not enabled when the career was created, or its squad was cleared. Names that are not saved are not shown.", "Le marché de ce club n'était pas activé à la création de la carrière. Aucun nom non enregistré n'est affiché."), "search")}${c?.sourceUrl ? `<div class="source-link"><span>${tr("صفحة القائمة المصدرية", "Source squad page", "Page source de l'effectif")}</span><a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener noreferrer">${tr("عرض المصدر ↗", "View source ↗", "Voir la source ↗")}</a></div>` : ""}</section>`;
  return `<section class="panel club-card">${head}<div class="profile-stats"><div><small>${tr("اللاعبون", "Players", "Joueurs")}</small><strong>${num(squad.length)}</strong></div><div><small>${tr("متوسط التقييم", "Avg rating", "Note moyenne")}</small><strong>${num(avg(squad, "rating"))}</strong></div><div><small>${tr("متوسط العمر", "Avg age", "Âge moyen")}</small><strong>${num(avg(squad, "age"))}</strong></div><div><small>${tr("أهداف الموسم", "Season goals", "Buts de la saison")}</small><strong>${num(seasonGoals)}</strong></div><div><small>${tr("المرتبات الشهرية", "Monthly wages", "Salaires mensuels")}</small><strong>${money(wages)} <small>${cur()}</small></strong></div></div><div class="table-scroll"><table class="players-table"><thead><tr><th>${tr("اللاعب", "Player", "Joueur")}</th><th>${tr("المركز", "Position", "Poste")}</th><th>${tr("العمر", "Age", "Âge")}</th><th>${tr("التقييم", "Rating", "Note")}</th><th>${tr("مشاركات / أهداف", "Apps / goals", "Matchs / buts")}</th><th>${tr("هذا الموسم", "This season", "Cette saison")}</th><th>${tr("نهاية العقد", "Contract end", "Fin de contrat")}</th><th></th></tr></thead><tbody>${squad
    .map(
      (p) =>
        `<tr><td><button class="player-name" data-action="player-detail" data-id="${p.id}">${avatar(p, true)}<span><strong>${esc(getLanguage() === "ar" ? p.name : p.nameLatin || p.name)}</strong><small>${esc(p.nationality)} · ${esc(p.role || p.position)}</small></span></button></td><td><span class="position-tag">${p.position}</span></td><td>${p.ageEstimated ? "~" : ""}${num(p.age)}</td><td><span class="rating ${p.rating >= 78 ? "excellent" : ""}">${num(Math.round(p.rating))}</span></td><td><b dir="ltr">${num(p.appearances || 0)}</b> / <b dir="ltr">${num(p.goals || 0)}</b></td><td><b dir="ltr">${num(p.seasonGoals || 0)}</b> / <span dir="ltr">${num(p.seasonAssists || 0)}</span></td><td>${date(p.contractEnd)}</td><td>${button(tr("الملف", "Profile", "Fiche"), "player-detail", p.id, "small ghost")}</td></tr>`,
    )
    .join(
      "",
    )}</tbody></table></div><p class="fine-print">${tr("«هذا الموسم» أهداف/أسيست للعدّاد الحالي. اضغط اسم اللاعب لبطاقته الكاملة وسجل مواسمه.", "“This season” shows goals/assists in the current counter. Tap a name for the full card and season record.", "« Cette saison » : buts/passes du compteur en cours. Touchez un nom pour la fiche complète.")}</p>${c?.sourceUrl ? `<div class="source-link"><span>${tr("صفحة القائمة المصدرية", "Source squad page", "Page source de l'effectif")}</span><a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener noreferrer">${tr("عرض المصدر ↗", "View source ↗", "Voir la source ↗")}</a></div>` : ""}</section>`;
}
