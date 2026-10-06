// Structure and sporting tie rules; entry allocations and dates remain a game scenario.
export const CONTINENTAL = {
  caf: {
    name: "CAF Champions League",
    size: 16,
    finalLegs: 2,
    awayGoals: true,
    finalExtraTime: false,
    tableRule: "caf",
    alloc: { eg: 4, ma: 3, tn: 3, dz: 3, za: 3 },
  },
  confed: {
    name: "CAF Confederation Cup",
    size: 16,
    finalLegs: 2,
    awayGoals: true,
    finalExtraTime: false,
    tableRule: "caf",
    alloc: { eg: 4, ma: 3, tn: 3, dz: 3, za: 3 },
    exclude: "caf",
  },
  lib: {
    name: "CONMEBOL Libertadores",
    size: 32,
    finalLegs: 1,
    awayGoals: false,
    finalExtraTime: true,
    tableRule: "conmebol",
    alloc: {
      br: 7,
      ar: 6,
      uy: 3,
      co: 3,
      cl: 3,
      ec: 2,
      py: 2,
      pe: 2,
      bo: 2,
      ve: 2,
    },
  },
  suda: {
    name: "CONMEBOL Sudamericana",
    size: 32,
    finalLegs: 1,
    awayGoals: false,
    finalExtraTime: true,
    tableRule: "conmebol",
    alloc: {
      br: 6,
      ar: 6,
      uy: 3,
      co: 3,
      cl: 3,
      ec: 3,
      py: 2,
      pe: 2,
      bo: 2,
      ve: 2,
    },
    exclude: "lib",
    feed: "lib",
  },
};
export const DOMESTIC = {
  eg: { name: "كأس مصر", superName: "السوبر المصري", superSize: 4 },
  en: {
    name: "FA Cup",
    superName: "FA Community Shield",
    superSize: 2,
    neutralSemi: true,
  },
  es: {
    name: "Copa del Rey",
    superName: "Supercopa de España",
    superSize: 4,
    doubleSemi: true,
  },
  de: { name: "DFB-Pokal", superName: "DFL-Supercup", superSize: 2 },
  it: {
    name: "Coppa Italia",
    superName: "Supercoppa Italiana",
    superSize: 4,
    doubleSemi: true,
  },
  fr: {
    name: "Coupe de France",
    superName: "Trophée des Champions",
    superSize: 2,
  },
  // 0.13: the full domestic engine (single-leg ties, neutral final, extra
  // time then penalties) extends to every loaded market. Names follow the
  // established national cup where one exists; entry rounds, draws, dates,
  // prizes and super-cup sizes/existence beyond the verified six are game
  // scenarios, not certified official formats.
  pt: {
    name: "Taça de Portugal",
    superName: "Supertaça Cândido de Oliveira",
    superSize: 2,
  },
  nl: { name: "KNVB Cup", superName: "Johan Cruyff Shield", superSize: 2 },
  be: { name: "Belgian Cup", superName: "Belgian Super Cup", superSize: 2 },
  tr: { name: "Turkish Cup", superName: "Turkish Super Cup", superSize: 2 },
  sc: { name: "Scottish Cup", superName: "Scottish Super Cup", superSize: 2 },
  gr: { name: "Greek Cup", superName: "Greek Super Cup", superSize: 2 },
  at: { name: "Austrian Cup", superName: "Austrian Supercup", superSize: 2 },
  ch: { name: "Swiss Cup", superName: "Swiss Super Cup", superSize: 2 },
  dk: { name: "Danish Cup", superName: "Danish Super Cup", superSize: 2 },
  se: { name: "Svenska Cupen", superName: "Swedish Super Cup", superSize: 2 },
  no: { name: "Norwegian Cup", superName: "Mesterfinalen", superSize: 2 },
  pl: { name: "Polish Cup", superName: "Polish Super Cup", superSize: 2 },
  cz: { name: "Czech Cup", superName: "Czech Supercup", superSize: 2 },
  hr: { name: "Croatian Cup", superName: "Croatian Super Cup", superSize: 2 },
  rs: { name: "Serbian Cup", superName: "Serbian Super Cup", superSize: 2 },
  ro: { name: "Cupa României", superName: "Supercupa României", superSize: 2 },
  ua: { name: "Ukrainian Cup", superName: "Ukrainian Super Cup", superSize: 2 },
  ru: { name: "Russian Cup", superName: "Russian Super Cup", superSize: 2 },
  hu: { name: "Magyar Kupa", superName: "Hungarian Super Cup", superSize: 2 },
  br: {
    name: "Copa do Brasil",
    superName: "Supercopa do Brasil",
    superSize: 2,
  },
  ar: {
    name: "Copa Argentina",
    superName: "Supercopa Argentina",
    superSize: 2,
  },
  uy: { name: "Copa Uruguay", superName: "Supercopa Uruguaya", superSize: 2 },
  co: {
    name: "Copa Colombia",
    superName: "Superliga Colombiana",
    superSize: 2,
  },
  cl: { name: "Copa Chile", superName: "Supercopa de Chile", superSize: 2 },
  ec: { name: "Copa Ecuador", superName: "Supercopa Ecuador", superSize: 2 },
  py: { name: "Copa Paraguay", superName: "Supercopa Paraguay", superSize: 2 },
  pe: { name: "Copa Bicentenario", superName: "Supercopa Peruana", superSize: 2 },
  bo: { name: "Copa Bolivia", superName: "Supercopa de Bolivia", superSize: 2 },
  ve: {
    name: "Copa Venezuela",
    superName: "Supercopa de Venezuela",
    superSize: 2,
  },
  us: { name: "U.S. Open Cup", superName: "U.S. Super Cup", superSize: 2 },
  mx: {
    name: "Copa MX",
    superName: "Supercopa de la Liga MX",
    superSize: 2,
  },
  sa: { name: "King Cup", superName: "Saudi Super Cup", superSize: 4 },
  qa: {
    name: "Emir of Qatar Cup",
    superName: "Sheikh Jassim Cup",
    superSize: 2,
  },
  ae: {
    name: "UAE President's Cup",
    superName: "UAE Super Cup",
    superSize: 2,
  },
  jp: { name: "Emperor's Cup", superName: "Japanese Super Cup", superSize: 2 },
  kr: { name: "Korean FA Cup", superName: "Korean Super Cup", superSize: 2 },
  cn: {
    name: "Chinese FA Cup",
    superName: "Chinese FA Super Cup",
    superSize: 2,
  },
  au: { name: "Australia Cup", superName: "Australian Super Cup", superSize: 2 },
  ma: { name: "Coupe du Trône", superName: "Moroccan Super Cup", superSize: 2 },
  tn: { name: "Tunisian Cup", superName: "Tunisian Super Cup", superSize: 2 },
  dz: { name: "Algerian Cup", superName: "Algerian Super Cup", superSize: 2 },
  za: { name: "Nedbank Cup", superName: "South African Super Cup", superSize: 2 },
  in: { name: "AIFF Super Cup", superName: "Indian Champions Cup", superSize: 2 },
  th: {
    name: "Thai FA Cup",
    superName: "Thailand Champions Cup",
    superSize: 2,
  },
};
export const STAGE_NAMES = {
  groups: "دور المجموعات",
  "phase-one": "المرحلة الأولى",
  waiting: "انتظار المنتقلين من ليبرتادوريس",
  playoff: "ملحق سودأمريكانا",
  playin: "ملحق التأهل",
  third: "مباراة المركز الثالث",
  r1: "الدور الأول",
  r16: "ثمن النهائي",
  qf: "ربع النهائي",
  sf: "نصف النهائي",
  final: "النهائي",
  complete: "اكتملت",
};
export function policy(c) {
  if (c.engine === "asia-v1")
    return {
      legs:
        c.phase === "preliminary"
          ? 1
          : c.kind === "afc"
            ? c.phase === "r16"
              ? 2
              : 1
            : 2,
      finalLegs: 1,
      awayGoals: false,
      extraTime: true,
      finalExtraTime: true,
      neutralAll: c.kind === "afc" && ["qf", "sf"].includes(c.phase),
    };
  if (c.engine === "concacaf-v1")
    return {
      legs: 2,
      finalLegs: c.kind === "concacaf" || c.kind === "leagues-cup" ? 1 : 2,
      awayGoals: c.kind !== "leagues-cup",
      extraTime: c.kind !== "leagues-cup",
      finalExtraTime: c.kind === "concacaf",
    };
  if (CONTINENTAL[c.kind]) return { ...CONTINENTAL[c.kind], legs: 2 };
  if (c.kind === "domestic")
    return {
      legs: 1,
      finalLegs: 1,
      finalExtraTime: true,
      awayGoals: false,
      ...DOMESTIC[c.country],
    };
  if (c.kind === "super-domestic")
    return {
      legs: 1,
      finalLegs: 1,
      finalExtraTime: c.country === "eg",
      awayGoals: false,
    };
  if (c.kind === "recopa")
    return { legs: 2, finalLegs: 2, finalExtraTime: true, awayGoals: false };
  return {
    legs: 1,
    finalLegs: 1,
    finalExtraTime: c.country !== "en" && c.kind !== "super-caf",
    awayGoals: false,
  };
}
