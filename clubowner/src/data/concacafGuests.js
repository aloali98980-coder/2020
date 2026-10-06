// Real club identities; cup-only reference pool, NOT certified current entry lists or player registrations.
// Central American Cup uses 20 clubs (Belize 1, Costa Rica 4, El Salvador 3,
// Guatemala 4, Honduras 3, Nicaragua 2, Panama 3). Caribbean Cup uses 10 clubs
// (Dominican Republic 2, Haiti 1, Jamaica 3, Suriname 2, Trinidad & Tobago 2);
// the last two Caribbean slots model the CFU Shield path with real clubs.
const data = [
  // Central America (20)
  ["verdes", "Verdes FC", "bz", 50],
  ["alajuelense", "LD Alajuelense", "cr", 67],
  ["saprissa", "Deportivo Saprissa", "cr", 68],
  ["cartagines", "CS Cartaginés", "cr", 64],
  ["herediano", "CS Herediano", "cr", 65],
  ["alianza", "Alianza FC", "sv", 62],
  ["firpo", "CD Luis Ángel Firpo", "sv", 59],
  ["fas", "CD FAS", "sv", 60],
  ["municipal", "CSD Municipal", "gt", 63],
  ["comunicaciones", "Comunicaciones FC", "gt", 63],
  ["antigua", "Antigua GFC", "gt", 60],
  ["mixco", "Deportivo Mixco", "gt", 55],
  ["olimpia", "Club Olimpia Deportivo", "hn", 67],
  ["motagua", "FC Motagua", "hn", 64],
  ["marathon", "CD Marathón", "hn", 62],
  ["diriangen", "Diriangén FC", "ni", 57],
  ["esteli", "Real Estelí FC", "ni", 58],
  ["cai", "CA Independiente", "pa", 61],
  ["tauro", "Tauro FC", "pa", 60],
  ["plaza-amador", "CD Plaza Amador", "pa", 58],
  // Caribbean (10)
  ["cibao", "Cibao FC", "do", 60],
  ["salcedo", "Salcedo FC", "do", 53],
  ["violette", "Violette AC", "ht", 59],
  ["cavalier", "Cavalier FC", "jm", 58],
  ["portmore", "Portmore United FC", "jm", 57],
  ["mount-pleasant", "Mount Pleasant FA", "jm", 54],
  ["broki", "SV Broki", "sr", 52],
  ["robinhood", "SV Robinhood", "sr", 54],
  ["club-sando", "Club Sando FC", "tt", 55],
  ["defence-force", "Defence Force FC", "tt", 56],
];
export const CONCACAF_GUESTS = data.map(([key, name, country, rep]) => ({
  id: "ccaf-" + key,
  name,
  wiki: name,
  short: name,
  initial: name[0],
  country,
  rep,
  overall: rep,
  tier: 1,
  cupOnly: true,
  confederation: "concacaf",
  selectable: false,
  capacity: 12000,
  cash: 20000000,
  color: "#3f7a5e",
  city: country,
  desc: "نادٍ حقيقي من قائمة مرجعية؛ ضيف كؤوس بمحاكاة خفيفة دون دوري محلي أو قائمة لاعبين معتمدة",
  sourceUrl:
    "https://en.wikipedia.org/wiki/" +
    encodeURIComponent(name.replaceAll(" ", "_")),
  reviewedOn: "2026-09-26",
}));
export const CONCACAF_GUEST_IDS = new Set(CONCACAF_GUESTS.map((c) => c.id));
export const CONCACAF_CENTRAL = ["bz", "cr", "sv", "gt", "hn", "ni", "pa"];
export const CONCACAF_CARIBBEAN = ["do", "ht", "jm", "sr", "tt"];
export const CONCACAF_NORTH = ["us", "mx"];
