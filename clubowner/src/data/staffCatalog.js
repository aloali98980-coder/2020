// المرحلة ١٢ «الإدارة الشاملة» 0.30 — كتالوج معلن واحد لكل ما يخص الجهاز الإداري.
// كل نص بثلاث لغات {ar,en,fr} من المصدر نفسه؛ لا نص عربي بلا مقابل.
export const L = (ar, en, fr) => Object.freeze({ ar, en, fr });

// ── الأدوار: أقصى شاغلين + راتب سوقي شهري لكل نقطة مهارة ────────────────────
export const STAFF_ROLES = Object.freeze({
  sporting: { name: L("المدير الرياضي", "Sporting Director", "Directeur sportif"), slots: 1, base: 380000, per: 5200 },
  coach: { name: L("مدرب الفريق الأول", "Head Coach", "Entraîneur principal"), slots: 1, base: 420000, per: 6000 },
  marketing: { name: L("مدير التسويق", "Marketing Director", "Directeur marketing"), slots: 1, base: 220000, per: 3400 },
  finance: { name: L("المدير المالي", "Finance Director", "Directeur financier"), slots: 1, base: 240000, per: 3600 },
  lawyer: { name: L("المستشار القانوني", "Legal Counsel", "Conseiller juridique"), slots: 1, base: 200000, per: 3200 },
  doctor: { name: L("طبيب الفريق", "Team Doctor", "Médecin de l’équipe"), slots: 1, base: 180000, per: 3000 },
  fitness: { name: L("مدرب اللياقة", "Fitness Coach", "Préparateur physique"), slots: 1, base: 150000, per: 2600 },
  gk: { name: L("مدرب الحراس", "Goalkeeping Coach", "Entraîneur des gardiens"), slots: 1, base: 140000, per: 2400 },
  scout: { name: L("كشاف", "Scout", "Recruteur"), slots: 3, base: 120000, per: 2200 },
  academy: { name: L("مدير الأكاديمية", "Academy Director", "Directeur de l’académie"), slots: 1, base: 160000, per: 2800 },
  social: { name: L("مدير السوشيال ميديا", "Social Media Manager", "Responsable réseaux sociaux"), slots: 1, base: 130000, per: 2300 },
  assistant: { name: L("مساعد إداري", "Administrative Assistant", "Assistant administratif"), slots: 99, base: 60000, per: 900 },
});
export const ROLE_IDS = Object.freeze(Object.keys(STAFF_ROLES));
// أدوار الإدارة العليا: أصحاب التقارير والطلبات في اجتماع المجلس الشهري.
export const DIRECTOR_ROLES = Object.freeze(["sporting", "marketing", "finance", "lawyer", "academy", "social"]);
// الراتب السوقي العادل لمهارة ما: أساس الدور + نقاط المهارة. الولاء يقاس عليه.
export const marketWage = (role, skill) =>
  Math.round(((STAFF_ROLES[role]?.base || 100000) + (STAFF_ROLES[role]?.per || 2000) * skill) / 1000) * 1000;

// ── المقر الإداري: ٦ مستويات حتى البرج الإداري ───────────────────────────────
// التمويل من الثروة الشخصية (فلوسك) مثل الملعب؛ البرج يشترط منشأة officeTower من المدينة.
export const HQ_LEVELS = Object.freeze([
  { name: L("مقر صغير", "Small Office", "Petit bureau"), cap: 6, cost: 0, days: 0 },
  { name: L("مقر موسّع", "Extended Office", "Bureau agrandi"), cap: 8, cost: 2_000_000, days: 30 },
  { name: L("مبنى إداري", "Admin Building", "Bâtiment administratif"), cap: 11, cost: 6_000_000, days: 60 },
  { name: L("مجمّع إداري", "Admin Complex", "Complexe administratif"), cap: 14, cost: 15_000_000, days: 90 },
  { name: L("مقر رئيسي", "Headquarters", "Siège principal"), cap: 18, cost: 35_000_000, days: 120 },
  { name: L("البرج الإداري", "Admin Tower", "Tour administrative"), cap: 25, cost: 80_000_000, days: 180, needsCity: "officeTower" },
]);

// ── مناطق الكشافين ─────────────────────────────────────────────────────────
export const SCOUT_REGIONS = Object.freeze({
  southAmerica: { name: L("أمريكا الجنوبية", "South America", "Amérique du Sud"), leagues: ["br", "ar", "uy", "co"] },
  africa: { name: L("أفريقيا", "Africa", "Afrique"), leagues: ["eg", "ma", "tn", "dz", "ng", "sn"] },
  europe: { name: L("أوروبا", "Europe", "Europe"), leagues: ["en", "es", "it", "de", "fr", "pt", "nl"] },
  middleEast: { name: L("الشرق الأوسط", "Middle East", "Moyen-Orient"), leagues: ["sa", "ae", "qa"] },
  asia: { name: L("آسيا", "Asia", "Asie"), leagues: ["jp", "kr"] },
  northAmerica: { name: L("أمريكا الشمالية", "North America", "Amérique du Nord"), leagues: ["us", "mx"] },
});
export const REGION_IDS = Object.freeze(Object.keys(SCOUT_REGIONS));

// ── المشهورون بأسمائهم الحقيقية: بيانات مرجعية — القدرات محاكاة للعبة ───────
// wageM راتب شهري مقترح بالملايين، clauseM شرط جزائي بالملايين، minRep بوابة الظهور.
export const FAMOUS_STAFF = Object.freeze([
  { fid: "monchi", role: "sporting", name: L("مونتشي", "Monchi", "Monchi"), skill: 91, wageM: 3.2, clauseM: 45, minRep: 55 },
  { fid: "campos", role: "sporting", name: L("لويس كامبوس", "Luís Campos", "Luís Campos"), skill: 89, wageM: 2.9, clauseM: 38, minRep: 50 },
  { fid: "edwards", role: "sporting", name: L("مايكل إدواردز", "Michael Edwards", "Michael Edwards"), skill: 90, wageM: 3.0, clauseM: 42, minRep: 55 },
  { fid: "begiristain", role: "sporting", name: L("تشيكي بيجيريستين", "Txiki Begiristain", "Txiki Begiristain"), skill: 88, wageM: 2.7, clauseM: 35, minRep: 50 },
  { fid: "guardiola", role: "coach", name: L("بيب جوارديولا", "Pep Guardiola", "Pep Guardiola"), skill: 97, wageM: 9.0, clauseM: 150, minRep: 78 },
  { fid: "klopp", role: "coach", name: L("يورجن كلوب", "Jürgen Klopp", "Jürgen Klopp"), skill: 94, wageM: 7.5, clauseM: 120, minRep: 72 },
  { fid: "ancelotti", role: "coach", name: L("كارلو أنشيلوتي", "Carlo Ancelotti", "Carlo Ancelotti"), skill: 95, wageM: 8.0, clauseM: 130, minRep: 74 },
  { fid: "mourinho", role: "coach", name: L("جوزيه مورينيو", "José Mourinho", "José Mourinho"), skill: 90, wageM: 6.0, clauseM: 90, minRep: 65 },
  { fid: "arteta", role: "coach", name: L("ميكيل أرتيتا", "Mikel Arteta", "Mikel Arteta"), skill: 89, wageM: 5.2, clauseM: 80, minRep: 62 },
  { fid: "cugat", role: "doctor", name: L("رامون كوجات", "Ramon Cugat", "Ramon Cugat"), skill: 93, wageM: 2.2, clauseM: 25, minRep: 55 },
  { fid: "pintus", role: "fitness", name: L("أنطونيو بينتوس", "Antonio Pintus", "Antonio Pintus"), skill: 92, wageM: 1.8, clauseM: 20, minRep: 55 },
  { fid: "devisser", role: "scout", name: L("بيت دي فيسر", "Piet de Visser", "Piet de Visser"), skill: 90, wageM: 1.2, clauseM: 15, minRep: 45 },
]);

// ── مولّد الأسماء للباقي ────────────────────────────────────────────────────
export const STAFF_FIRST = Object.freeze([
  ["كريم", "Karim"], ["طارق", "Tarek"], ["سامح", "Sameh"], ["وليد", "Walid"], ["هشام", "Hisham"],
  ["أشرف", "Ashraf"], ["نادر", "Nader"], ["فادي", "Fady"], ["ماجد", "Maged"], ["رامي", "Ramy"],
  ["شريف", "Sherif"], ["تامر", "Tamer"], ["حازم", "Hazem"], ["إيهاب", "Ihab"], ["منى", "Mona"],
  ["دينا", "Dina"], ["هبة", "Heba"], ["رانيا", "Rania"], ["سلمى", "Salma"], ["نور", "Nour"],
]);
export const STAFF_LAST = Object.freeze([
  ["الحسيني", "El-Hosseiny"], ["البرعي", "El-Borai"], ["منصور", "Mansour"], ["عبد الله", "Abdullah"],
  ["السيد", "El-Sayed"], ["فرج", "Farag"], ["النجار", "El-Naggar"], ["حمدي", "Hamdi"],
  ["الشريف", "El-Sherif"], ["عوض", "Awad"], ["الدسوقي", "El-Desouky"], ["غانم", "Ghanem"],
  ["الخطيب", "El-Khatib"], ["زيدان", "Zidan"], ["شاهين", "Shaheen"], ["علام", "Allam"],
]);

// ── فلسفات المدير الرياضي ───────────────────────────────────────────────────
export const SPORTING_PHILOSOPHIES = Object.freeze({
  youth: { name: L("مدرسة الشباب", "Youth Project", "Projet jeunes"), desc: L("صفقات تحت ٢٢ سنة بإمكانات عالية، وبيع النجوم الكبار بأسعار ممتازة.", "Signings under 22 with big potential; sells ageing stars at premium prices.", "Recrues de moins de 22 ans à fort potentiel ; vend les stars vieillissantes au meilleur prix.") },
  stars: { name: L("صفقات النجوم", "Galácticos", "Galactiques"), desc: L("نجوم جاهزون بتقييم ٨٠+ مهما كان السعر، والقمصان تُباع قبل الإعلان.", "Ready-made stars rated 80+ whatever the price; shirts sell before the unveiling.", "Stars confirmées notées 80+ à tout prix ; les maillots se vendent avant la présentation.") },
  smart: { name: L("صفقات ذكية", "Smart Deals", "Recrutement malin"), desc: L("أفضل نسبة جودة لسعر: عقود منتهية ومواهب مظلومة تُباع بربح لاحقًا.", "Best quality-per-price ratio: expiring contracts and undervalued gems flipped later.", "Meilleur rapport qualité-prix : fins de contrat et pépites sous-cotées revendues ensuite.") },
});

// ── مناهج الأكاديمية ────────────────────────────────────────────────────────
export const ACADEMY_CURRICULA = Object.freeze({
  technique: { name: L("تقنية", "Technical", "Technique"), desc: L("مهارة وتمرير: ناشئون بلمسة أنظف وإمكانات أعلى.", "Skill and passing: cleaner touch and higher potential.", "Technique et passes : toucher plus propre, potentiel accru.") },
  physical: { name: L("بدنية", "Physical", "Physique"), desc: L("قوة وسرعة ولياقة: ناشئون أجهز بدنيًا للموسم الطويل.", "Strength, pace and fitness: youngsters readier for a long season.", "Force, vitesse et endurance : jeunes plus prêts pour une longue saison.") },
  tactical: { name: L("تكتيكية", "Tactical", "Tactique"), desc: L("ذكاء وتمركز: ناشئون أنضج تكتيكيًا وأقل أخطاء.", "Intelligence and positioning: tactically riper, fewer mistakes.", "Intelligence et placement : tactiquement plus mûrs, moins d’erreurs.") },
});

// ── حملات التسويق ───────────────────────────────────────────────────────────
export const CAMPAIGN_TYPES = Object.freeze({
  season: { name: L("حملة الموسم", "Season Campaign", "Campagne de saison"), days: 45, fans: 3, desc: L("تذاكر وقمصان الموسم الجديد.", "New-season tickets and shirts.", "Billets et maillots de la saison.") },
  signing: { name: L("حملة اللاعب الجديد", "New Signing Campaign", "Campagne de recrue"), days: 30, fans: 2, desc: L("تقديم صفقة كبيرة للجماهير والرعاة.", "Unveiling a major signing to fans and sponsors.", "Présentation d’une recrue majeure aux supporters et sponsors.") },
  derby: { name: L("حملة الديربي", "Derby Campaign", "Campagne du derby"), days: 14, fans: 4, desc: L("أسبوع الديربي: تفاعل مضاعف وحضور قياسي.", "Derby week: doubled engagement and record crowds.", "Semaine du derby : engagement doublé, affluence record.") },
});

// ── محتوى السوشيال ميديا ────────────────────────────────────────────────────
export const SOCIAL_CONTENTS = Object.freeze({
  training: { name: L("كواليس التدريب", "Training Access", "Dans les coulisses"), cost: 50000, fans: 1, eng: 4 },
  interview: { name: L("لقاء حصري", "Exclusive Interview", "Interview exclusive"), cost: 30000, fans: 1, eng: 3 },
  behind: { name: L("يوم مع اللاعبين", "A Day With the Players", "Un jour avec les joueurs"), cost: 100000, fans: 2, eng: 5 },
  fanday: { name: L("يوم الجماهير", "Fans Day", "Journée des supporters"), cost: 200000, fans: 3, eng: 6 },
  charity: { name: L("مبادرة خيرية", "Charity Drive", "Action caritative"), cost: 150000, fans: 2, eng: 5 },
});

// ── أزمات السوشيال ميديا ──────────────────────────────────────────────────
export const SOCIAL_CRISES = Object.freeze({
  tweet: { name: L("تغريدة غبية", "Reckless Tweet", "Tweet déplacé"), desc: L("تغريدة مسيئة من حساب لاعب أشعلت الجماهير.", "An offensive player tweet enraged the fans.", "Un tweet offensant d’un joueur a enflammé les supporters.") },
  video: { name: L("فيديو مسيء", "Damaging Video", "Vidéo compromettante"), desc: L("فيديو مسرّب من غرفة الملابس ينتشر كالنار.", "A leaked dressing-room video is spreading fast.", "Une vidéo fuitée du vestiaire se propage comme une traînée de poudre.") },
  fight: { name: L("اشتباك جماهيري", "Fan Clash", "Affrontement de supporters"), desc: L("اشتباك بين جماهيرك ومنافس يُحمَّل ناديك مسؤوليته.", "A clash with rival fans is being pinned on your club.", "Un affrontement avec des supporters rivaux est imputé à votre club.") },
});

// ── القضايا القانونية ───────────────────────────────────────────────────────
export const CASE_KINDS = Object.freeze({
  ban: { name: L("استئناف عقوبة", "Sanction Appeal", "Appel d’une sanction"), fees: [50000, 100000, 150000] },
  scandal: { name: L("دفاع عن فضيحة", "Scandal Defence", "Défense de scandale"), fees: [80000, 140000, 200000] },
  contract: { name: L("نزاع تعاقدي", "Contract Dispute", "Litige contractuel"), fees: [60000, 110000, 170000] },
  succession: { name: L("نزاع ورثة", "Succession Dispute", "Conflit de succession"), fees: [100000, 180000, 260000] },
});
export const CASE_STAGES = Object.freeze(["appeal", "hearing", "verdict"]);

// ── أندية الخطف (منافسون أغنياء يطاردون موظفيك) ─────────────────────────────
export const POACH_CLUBS = Object.freeze([
  L("ريال مدريد", "Real Madrid", "Real Madrid"),
  L("مانشستر سيتي", "Manchester City", "Manchester City"),
  L("بايرن ميونخ", "Bayern Munich", "Bayern Munich"),
  L("باريس سان جيرمان", "Paris Saint-Germain", "Paris Saint-Germain"),
  L("الهلال", "Al-Hilal", "Al-Hilal"),
  L("النصر", "Al-Nassr", "Al-Nassr"),
  L("إنتر ميامي", "Inter Miami", "Inter Miami"),
  L("نيوكاسل", "Newcastle", "Newcastle"),
]);

export const staffText = (entry, lang = "ar") =>
  typeof entry === "string" ? entry : (entry?.[lang] ?? entry?.ar ?? "");
