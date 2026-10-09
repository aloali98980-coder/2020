import { tr } from "../i18n/index.js";
import { money, num, cur, esc } from "../ui/format.js";
import {
  CAPACITY_TIERS,
  DISTRICTS,
  DESIGNS,
  ensureSportsCity,
  realisticAttendance,
  stadiumQuote,
} from "../services/sportsCity.js";
import { CITY_FACILITIES, CITY_GROUPS } from "../data/sportsCityFacilities.js";
import { cityEconomy, cityEffects } from "../services/cityFacilities.js";

const l = (ar, en, fr) => tr(ar, en, fr);
const names = {
  center: ["الوسط", "Centre", "Centre"],
  suburbs: ["الضواحي", "Suburbs", "Banlieue"],
  waterfront: ["الواجهة البحرية", "Waterfront", "Front de mer"],
  classic: ["كلاسيكي", "Classic", "Classique"],
  modern: ["حديث", "Modern", "Moderne"],
  iconic: ["أيقوني", "Iconic", "Emblématique"],
  sport: ["رياضية", "Sport", "Sport"],
  commercial: ["تجارية", "Commercial", "Commercial"],
  entertainment: ["ترفيهية", "Entertainment", "Loisirs"],
  community: ["مجتمعية", "Community", "Communauté"],
  special: ["خاصة", "Special", "Spécial"],
};
const label = (key) => l(...names[key]);
const option = (value, text) => `<option value="${value}">${text}</option>`;

export function stadiumScene(s) {
  const st = ensureSportsCity(s).stadium,
    level = st.tier + 1;
  const built = ensureSportsCity(s).facilities;
  const rings = Array.from(
    { length: level },
    (_, i) =>
      `<ellipse cx="160" cy="116" rx="${53 + i * 9}" ry="${29 + i * 6}" fill="none" stroke="${i % 2 ? "#67b7cb" : "#f2d180"}" stroke-width="6"/>`,
  ).join("");
  const homeMatch =
    s.fixtures?.some((f) => f.date === s.date && f.home === s.clubId) || false;
  const blocks = CITY_FACILITIES.map((f, i) => {
    const x = 17 + (i % 9) * 34,
      y = 197 + Math.floor(i / 9) * 23;
    return `<rect x="${x}" y="${y}" width="26" height="17" rx="2" class="${built.includes(f.id) ? "lit" : "unbuilt"}"><title>${esc(l(f.name.ar, f.name.en, f.name.fr))}</title></rect>`;
  }).join("");
  return `<svg class="sports-city-scene ${homeMatch ? "match-night" : ""}" viewBox="0 0 330 300" role="img" aria-label="${l("خريطة المدينة الرياضية والملعب", "Sports city and stadium map", "Plan de la cité sportive et du stade")}"><defs><radialGradient id="city-sky"><stop stop-color="#274f60"/><stop offset="1" stop-color="#0b1826"/></radialGradient></defs><rect width="330" height="300" fill="url(#city-sky)"/><path d="M0 190h330M0 240h330M0 280h330M8 190v110m36-110v110m34-110v110m34-110v110m34-110v110m34-110v110m34-110v110m34-110v110m34-110v110m34-110v110" stroke="#3a5960" stroke-width="2"/><ellipse cx="160" cy="119" rx="${60 + level * 9}" ry="${35 + level * 6}" fill="#122b36" stroke="#f2d180" stroke-width="3"/>${rings}<ellipse cx="160" cy="116" rx="48" ry="25" fill="#32956e" stroke="white" stroke-width="2"/><path d="M160 92v48m-48-24h96" stroke="white" stroke-width="1"/><g class="floodlights"><path d="M35 40v75m249-75v75" stroke="#a9c9d2" stroke-width="3"/><circle cx="35" cy="40" r="8"/><circle cx="284" cy="40" r="8"/></g>${blocks}</svg>`;
}

export function sportsCityView(s) {
  const city = ensureSportsCity(s),
    st = city.stadium,
    built = new Set(city.facilities),
    eco = cityEconomy(s),
    fx = cityEffects(s);
  const pending = st.project;
  return `<section class="sports-city">
 <div class="city-hero"><div><h3>${l("المدينة الرياضية والملعب", "Sports city & stadium", "Cité sportive et stade")}</h3><p>${num(s.capacity)} ${l("مقعد", "seats", "places")} · ${l("حضور متوقع", "Expected crowd", "Affluence prévue")}: ${num(realisticAttendance(s))} · ${l("الثروة الشخصية", "Personal wealth", "Fortune personnelle")}: ${money(s.empire.personal)} ${cur()}</p><p>${l("الدخل / الصيانة الشهرية", "Monthly income / maintenance", "Revenus / entretien mensuels")}: ${money(eco.income)} / ${money(eco.upkeep)} ${cur()}</p></div>${stadiumScene(s)}</div>
 ${pending ? `<p class="city-status">${l("قيد البناء حتى", "Under construction until", "En construction jusqu’au")} ${esc(pending.end)} · ${num(CAPACITY_TIERS[pending.tier])} ${l("مقعد", "seats", "places")}</p>` : st.tier < 7 ? `<form id="city-stadium-form" class="city-form"><label>${l("المسار", "Route", "Projet")}<select name="route">${option("renovate", l("ترميم (حتى 60 ألف)", "Renovate (max 60k)", "Rénover (max 60 000)"))}${option("new", l("بناء جديد (2–3 مواسم)", "New build (2–3 seasons)", "Nouveau stade (2–3 saisons)"))}</select></label><label>${l("السعة", "Capacity", "Capacité")}<select name="tier">${CAPACITY_TIERS.map((n, i) => (i > st.tier ? option(i, num(n)) : "")).join("")}</select></label><label>${l("الحي", "District", "Quartier")}<select name="district">${DISTRICTS.map((x) => option(x, label(x))).join("")}</select></label><label>${l("التصميم", "Design", "Style")}<select name="design">${DESIGNS.map((x) => option(x, label(x))).join("")}</select></label><button class="btn primary" type="submit">${l("عرض السعر وبدء المشروع", "Quote & start project", "Devis et lancement")}</button><small>${l("السعر يتغير حسب المستوى والحي والتصميم؛ الترميم محدود وأرخص. التمويل من الثروة الشخصية.", "Price varies by tier, district and design; renovation is capped and cheaper. Personal wealth funds it.", "Le prix dépend du niveau, du quartier et du style ; la rénovation est limitée et moins chère. Fortune personnelle.")}</small></form>` : ""}
 ${
   st.oldGround === "undecided"
     ? `<div class="city-actions"><b>${l("مصير الملعب القديم", "Old ground", "Ancien stade")}</b>${[
         [
           "demolish",
           l("هدم وبيع الأرض", "Demolish & sell land", "Démolir et vendre"),
         ],
         ["youth", l("للناشئين", "For youth", "Pour les jeunes")],
         ["lease", l("تأجيره", "Lease out", "Louer")],
       ]
         .map(
           ([v, t]) =>
             `<button class="btn secondary" data-action="city-old" data-id="${v}">${t}</button>`,
         )
         .join("")}</div>`
     : ""
 }
 ${!st.naming ? `<div class="city-actions"><b>${l("حقوق الاسم", "Naming rights", "Droits de dénomination")}</b><button class="btn secondary" data-action="city-name" data-id="auction">${l("مزاد", "Auction", "Enchères")}</button><button class="btn secondary" data-action="city-name" data-id="owner">${l("اسم المالك + برستيج", "Owner name + prestige", "Nom du propriétaire + prestige")}</button></div>` : ""}
 <section class="city-group"><h4>${l("برامج القناة والجمهور", "Channel & social programmes", "Émissions et réseaux sociaux")}</h4>${
   (city.broadcasts || [])
     .slice(0, 5)
     .map(
       (b) =>
         `<p>${esc(b.date)} · ${esc(l(b.title.ar, b.title.en, b.title.fr))} · ${l("انتشار", "Reach", "Portée")} ×${num(b.reach)}</p>`,
     )
     .join("") ||
   `<p>${l("لا برامج بعد", "No programmes yet", "Pas encore d’émissions")}</p>`
 }</section>
 <section class="city-group"><h4>${l("أخبار المدينة", "City news", "Actualités de la cité")}</h4>${
   city.news
     .slice(0, 8)
     .map(
       (n) =>
         `<p><small>${esc(n.date)}</small> · ${esc(l(n.title.ar, n.title.en, n.title.fr))}</p>`,
     )
     .join("") ||
   `<p>${l("لا أخبار بعد", "No news yet", "Pas encore d’actualités")}</p>`
 }</section>
 ${Object.entries(CITY_GROUPS)
   .map(
     ([group, count]) =>
       `<section class="city-group"><h4>${label(group)} · ${num(CITY_FACILITIES.filter((x) => x.group === group && built.has(x.id)).length)}/${num(count)} ${fx.completed.includes(group) ? "★" : ""}</h4><div class="city-grid">${CITY_FACILITIES.filter(
         (x) => x.group === group,
       )
         .map(
           (f) =>
             `<article class="city-tile ${built.has(f.id) ? "built" : ""}"><strong>${esc(l(f.name.ar, f.name.en, f.name.fr))}</strong><small>${money(f.cost)} ${cur()} · ${money(f.upkeep)} / ${l("شهر", "month", "mois")}</small><small>${l("تأثير", "Effect", "Effet")}: ${esc(f.effect)} +${num(f.value)}</small>${!built.has(f.id) ? `<button class="btn secondary small" data-action="city-build" data-id="${f.id}">${l("ابنِ", "Build", "Construire")}</button>` : "✓"}</article>`,
         )
         .join("")}</div></section>`,
   )
   .join("")}
 </section>`;
}
