export const DYNASTY_SCHEMA = 1;

export const CHILD_STAGES = [
  { id: "infant", minAge: 0, maxAge: 2, label: { ar: "رضيع", en: "Infant", fr: "Nourrisson" } },
  { id: "child", minAge: 3, maxAge: 12, label: { ar: "طفل", en: "Child", fr: "Enfant" } },
  { id: "teen", minAge: 13, maxAge: 17, label: { ar: "مراهق", en: "Teenager", fr: "Adolescent" } },
  { id: "young", minAge: 18, maxAge: 120, label: { ar: "شاب", en: "Young adult", fr: "Jeune adulte" } },
];

export const DYNASTY_TRAITS = [
  {
    id: "hardworking",
    label: { ar: "مجتهد", en: "Hardworking", fr: "Travailleur" },
    description: { ar: "يتطور أسرع مع التدريب المنتظم.", en: "Develops faster with consistent training.", fr: "Progresse plus vite avec un entraînement régulier." },
    effects: { talent: 0.08, discipline: 0.1 },
  },
  {
    id: "ambitious",
    label: { ar: "طموح", en: "Ambitious", fr: "Ambitieux" },
    description: { ar: "يميل إلى الأهداف الكبيرة والمسارات التنافسية.", en: "Leans toward big goals and competitive paths.", fr: "Vise de grands objectifs et les parcours compétitifs." },
    effects: { ambition: 0.12 },
  },
  {
    id: "leader",
    label: { ar: "قيادي", en: "Leader", fr: "Leader" },
    description: { ar: "يعزز الانضباط والثقة في التفاعلات.", en: "Strengthens discipline and confidence in interactions.", fr: "Renforce la discipline et l’assurance dans les interactions." },
    effects: { discipline: 0.07, ambition: 0.05, relationship: 0.02 },
  },
  {
    id: "shy",
    label: { ar: "خجول", en: "Shy", fr: "Timide" },
    description: { ar: "يفضل الخصوصية ويحتاج دعمًا أمام الضغط الإعلامي.", en: "Prefers privacy and needs support under media pressure.", fr: "Préfère la discrétion et a besoin de soutien face aux médias." },
    effects: { discipline: 0.04, ambition: -0.02 },
  },
  {
    id: "rebellious",
    label: { ar: "متمرد", en: "Rebellious", fr: "Rebelle" },
    description: { ar: "يدافع عن اختياراته؛ رفض الكرة مسار مشروع بلا عقوبة.", en: "Stands by personal choices; refusing football is a valid, unpunished path.", fr: "Défend ses choix ; refuser le football est un parcours légitime, sans pénalité." },
    effects: { ambition: 0.08, strictDiscipline: -0.12 },
  },
  {
    id: "arrogant",
    label: { ar: "مغرور", en: "Arrogant", fr: "Arrogant" },
    description: { ar: "يرفع سقف طموحه لكنه حساس للنقد.", en: "Raises personal ambition but is sensitive to criticism.", fr: "Élève ses ambitions, mais supporte mal les critiques." },
    effects: { talent: 0.04, ambition: 0.08, criticism: -0.04 },
  },
  {
    id: "creative",
    label: { ar: "مبدع", en: "Creative", fr: "Créatif" },
    description: { ar: "يتألق في المهارات والتعبير الإعلامي.", en: "Thrives in technical skills and creative media.", fr: "S’épanouit dans les qualités techniques et l’expression médiatique." },
    effects: { talent: 0.12, fame: 0.04 },
  },
  {
    id: "loyal",
    label: { ar: "وفيّ", en: "Loyal", fr: "Loyal" },
    description: { ar: "يحافظ على رابط الأسرة والنادي.", en: "Maintains strong family and club ties.", fr: "Préserve les liens avec la famille et le club." },
    effects: { discipline: 0.03, relationship: 0.05 },
  },
];

export const DYNASTY_PATHS = [
  {
    id: "player",
    label: { ar: "لاعب للفريق الأول", en: "First-team player", fr: "Joueur de l’équipe première" },
    bonus: { ar: "علاقات أفضل مع اللاعبين والوكلاء", en: "Stronger player and agent relationships", fr: "Meilleures relations avec les joueurs et agents" },
  },
  {
    id: "business",
    label: { ar: "رجل أعمال", en: "Business owner", fr: "Entrepreneur" },
    bonus: { ar: "نفوذ إضافي في الرعايات والصفقات", en: "More leverage in sponsorships and deals", fr: "Plus d’influence sur les sponsors et les contrats" },
  },
  {
    id: "celebrity",
    label: { ar: "مشهور وإعلامي", en: "Celebrity and media", fr: "Célébrité et médias" },
    bonus: { ar: "شهرة أكبر للنادي وجمهور أوسع", en: "More club fame and a wider fanbase", fr: "Plus de notoriété pour le club et un public élargi" },
  },
  {
    id: "rebellious",
    label: { ar: "مسار مستقل عن الكرة", en: "Independent, non-football path", fr: "Parcours indépendant du football" },
    bonus: { ar: "لا عقوبة؛ يختار حياته خارج كرة القدم", en: "No penalty; chooses a life beyond football", fr: "Aucune pénalité ; choisit une vie hors du football" },
  },
];

export const UPBRINGING_STYLES = [
  { id: "balanced", label: { ar: "تربية متوازنة", en: "Balanced upbringing", fr: "Éducation équilibrée" } },
  { id: "education", label: { ar: "تعليم ومعرفة", en: "Education and learning", fr: "Études et savoir" } },
  { id: "football", label: { ar: "كرة القدم", en: "Football", fr: "Football" } },
  { id: "strict", label: { ar: "انضباط صارم", en: "Structured discipline", fr: "Discipline structurée" } },
  { id: "freedom", label: { ar: "حرية الاختيار", en: "Freedom to choose", fr: "Liberté de choisir" } },
];

export const ACADEMY_POSITION_IDS = ["GK", "CB", "RB", "LB", "DM", "CM", "AM", "LW", "RW", "ST"];

export const ACADEMY_FOCUSES = [
  { id: "balanced", label: { ar: "متوازن", en: "Balanced", fr: "Équilibré" } },
  { id: "technical", label: { ar: "مهارات فنية", en: "Technical skills", fr: "Technique" } },
  { id: "physical", label: { ar: "لياقة بدنية", en: "Physical conditioning", fr: "Préparation physique" } },
  { id: "tactical", label: { ar: "فهم تكتيكي", en: "Tactical awareness", fr: "Compréhension tactique" } },
  { id: "leadership", label: { ar: "قيادة وشخصية", en: "Leadership", fr: "Leadership" } },
];

export const CAREER_PATH_IDS = DYNASTY_PATHS.map((path) => path.id);
export const TRAIT_IDS = DYNASTY_TRAITS.map((trait) => trait.id);
export const STAGE_IDS = CHILD_STAGES.map((stage) => stage.id);
export const UPBRINGING_IDS = UPBRINGING_STYLES.map((style) => style.id);
export const ACADEMY_FOCUS_IDS = ACADEMY_FOCUSES.map((focus) => focus.id);
