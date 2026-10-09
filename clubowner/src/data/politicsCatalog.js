// Phase 13: all political identities and labels are fictional, stable, and explicitly trilingual.
export const P = (ar, en, fr) => Object.freeze({ ar, en, fr });

export const POLITICAL_BLOCS = Object.freeze({
  big: P("الكبار", "Major clubs", "Grands clubs"),
  regional: P("الأقاليم", "Regional clubs", "Clubs régionaux"),
  small: P("الصغار", "Smaller clubs", "Petits clubs"),
});

export const CLUB_DEMANDS = Object.freeze({
  equitableBroadcast: {
    id: "equitableBroadcast",
    lawId: "broadcast-formula",
    label: P(
      "حصة بث أكثر إنصافًا",
      "A fairer share of broadcast revenue",
      "Une part plus équitable des droits TV",
    ),
    blocs: ["regional", "small"],
  },
  youthPathway: {
    id: "youthPathway",
    lawId: "youth-pathway",
    label: P(
      "فرص وتمويل أكبر للناشئين",
      "More opportunity and funding for youth",
      "Plus d’opportunités et de financement pour les jeunes",
    ),
    blocs: ["regional", "small"],
  },
  foreignBalance: {
    id: "foreignBalance",
    lawId: "foreign-limit",
    label: P(
      "توازن واضح في قيد الأجانب",
      "Clear foreign-player registration limits",
      "Des limites claires pour les joueurs étrangers",
    ),
    blocs: ["big", "small"],
  },
  competitionIncome: {
    id: "competitionIncome",
    lawId: "league-format",
    label: P(
      "روزنامة تضمن دخلًا مستقرًا",
      "A calendar that protects stable income",
      "Un calendrier qui protège les revenus",
    ),
    blocs: ["small", "regional"],
  },
  governance: {
    id: "governance",
    lawId: "club-ownership",
    label: P(
      "قواعد ملكية وشفافية متساوية",
      "Equal ownership and transparency rules",
      "Des règles de propriété et de transparence équitables",
    ),
    blocs: ["big", "regional"],
  },
});

export const POLITICAL_CANDIDATES = Object.freeze([
  {
    id: "salim-nassar",
    name: P("سليم نصّار", "Salim Nassar", "Salim Nassar"),
    party: P("تيار الجمهور", "Supporters' List", "Liste des supporters"),
    profile: P("شعبي", "Popular", "Populaire"),
    traits: ["popular", "charismatic"],
    popularity: 79,
    competence: 58,
    corruption: 18,
    relationship: -8,
    blocAffinity: { big: 2, regional: 8, small: 12 },
    biography: P(
      "مرشح خيالي معروف بخطابه القريب من الجماهير وقدرته على حشد المؤيدين.",
      "A fictional candidate known for a crowd-friendly message and strong mobilising skills.",
      "Candidat fictif connu pour son discours populaire et sa capacité à mobiliser.",
    ),
  },
  {
    id: "nadia-fawzi",
    name: P("نادية فوزي", "Nadia Fawzi", "Nadia Fawzi"),
    party: P(
      "ائتلاف الإدارة",
      "Governance Coalition",
      "Coalition de gouvernance",
    ),
    profile: P("كفؤة", "Competent", "Compétente"),
    traits: ["competent", "reformer"],
    popularity: 67,
    competence: 91,
    corruption: 8,
    relationship: 4,
    blocAffinity: { big: 10, regional: 8, small: 4 },
    biography: P(
      "شخصية خيالية إدارية تَعِد بإصلاح اللوائح ورفع كفاءة المسابقات.",
      "A fictional administrator campaigning to modernise rules and improve competition management.",
      "Administratrice fictive qui promet de moderniser les règles et les compétitions.",
    ),
  },
  {
    id: "hassan-elmasry",
    name: P("حسن المصري", "Hassan Elmasry", "Hassan Elmasry"),
    party: P("رابطة الأندية", "Clubs' Association", "Association des clubs"),
    profile: P(
      "رئيس نادٍ منافس",
      "Rival club president",
      "Président d’un club rival",
    ),
    traits: ["club-president", "corrupt", "deal-maker"],
    popularity: 62,
    competence: 72,
    corruption: 76,
    relationship: -16,
    clubId: "zamalek",
    blocAffinity: { big: 15, regional: 0, small: -5 },
    biography: P(
      "رئيس نادٍ منافس خيالي؛ بارع في الصفقات، لكن سمعته تحمل أسئلة محرجة.",
      "A fictional rival-club president: a skilled deal-maker whose reputation raises awkward questions.",
      "Président fictif d’un club rival, habile négociateur mais à la réputation controversée.",
    ),
  },
]);

export const POLITICAL_DEMAND_BY_BLOC = Object.freeze({
  big: ["foreignBalance", "governance"],
  regional: ["equitableBroadcast", "youthPathway", "competitionIncome"],
  small: ["equitableBroadcast", "youthPathway", "competitionIncome"],
});

export const POLITICAL_CYCLE_SEASONS = 4;
export const POLITICAL_CAMPAIGN_MAX_FUNDING = 100_000_000;
export const POLITICAL_MAP_SUPPORT_MIN = 0;
export const POLITICAL_MAP_SUPPORT_MAX = 100;
