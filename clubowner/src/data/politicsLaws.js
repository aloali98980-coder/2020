// Phase 13, group 2: fictional association laws with explicit trilingual copy.
import { P } from "./politicsCatalog.js";

export const POLITICAL_LAWS = Object.freeze({
  "broadcast-equity": {
    id: "broadcast-equity",
    title: P(
      "لائحة التوزيع العادل للبث",
      "Fair Broadcast Distribution",
      "Répartition équitable des droits TV",
    ),
    summary: P(
      "تعيد توزيع عائدات البث لصالح حصة تضامنية أكبر للأندية الصغيرة.",
      "Rebalances broadcast revenue toward a larger solidarity share for smaller clubs.",
      "Rééquilibre les droits TV en faveur d’une part solidaire plus importante pour les petits clubs.",
    ),
    explain: P(
      "بعد إقرارها تصبح معادلة توزيع البث 25% أداء و15% شعبية و60% تساوٍ: نصيب الأندية الصغيرة والإقليمية يرتفع في كل توزيع سنوي، ونصيب الكبار ينخفض. أثرها على ناديك يتبع حجمه لا اسمه.",
      "Once passed, the broadcast formula becomes 25% performance, 15% popularity and 60% equality: smaller and regional clubs gain in every annual distribution while the biggest lose share. Its effect on your club follows its size, not its name.",
      "Une fois adoptée, la formule devient 25 % performance, 15 % popularité et 60 % égalité : les petits clubs et les clubs régionaux gagnent à chaque répartition annuelle, les plus grands perdent. L’effet sur votre club suit sa taille, pas son nom.",
    ),
    reaction: {
      passed: P(
        "ترحب الأندية الإقليمية والصغيرة بزيادة الحصة المتساوية، فيما تطالب بعض الأندية الكبرى بمراجعة أثرها التنافسي.",
        "Regional and smaller clubs welcome a larger equal share; some major clubs call for a review of the competitive impact.",
        "Les clubs régionaux et modestes saluent la hausse de la part égale ; certains grands clubs demandent une étude de son effet compétitif.",
      ),
      rejected: P(
        "تأسف الأندية الصغيرة لضياع فرصة تقليص فجوة الموارد.",
        "Smaller clubs regret the lost chance to narrow the resource gap.",
        "Les petits clubs regrettent l’occasion manquée de réduire l’écart de ressources.",
      ),
    },
    category: "finance",
    demandId: "equitableBroadcast",
    blocReaction: { big: -4, regional: 7, small: 12 },
    constitutional: false,
    effect: "broadcast-equity",
  },
  "youth-development": {
    id: "youth-development",
    title: P(
      "صندوق تطوير الناشئين",
      "Youth Development Fund",
      "Fonds de développement des jeunes",
    ),
    summary: P(
      "يرصد منحة سنوية لتطوير الأكاديميات والبنية الأساسية للناشئين.",
      "Earmarks an annual grant for academies and youth infrastructure.",
      "Réserve une aide annuelle aux académies et aux infrastructures de formation.",
    ),
    explain: P(
      "يُحجز 5 ملايين جنيه من عائدات البث كل موسم في منحة تطوير الناشئين، وتظهر في توزيعات الاتحاد. المبلغ جماعي من عائد البث لا من خزينة ناديك.",
      "Five million pounds are earmarked from broadcast revenue every season as a youth-development grant, shown in the association's distributions. The money is pooled from broadcast income, not from your club's treasury.",
      "Cinq millions sont réservés chaque saison sur les droits TV comme aide au développement des jeunes, visibles dans les répartitions. La somme vient des droits TV, pas de la caisse de votre club.",
    ),
    reaction: {
      passed: P(
        "تؤيد الأندية التي تستثمر في الأكاديميات استمرار التمويل.",
        "Clubs investing in academies support the continuing grant.",
        "Les clubs qui investissent dans les académies soutiennent la reconduction de l’aide.",
      ),
      rejected: P(
        "تحذر الأندية من تفاوت فرص الناشئين بين المناطق.",
        "Clubs warn that youth opportunities may diverge between regions.",
        "Les clubs mettent en garde contre l’inégalité des possibilités de formation selon les régions.",
      ),
    },
    category: "finance",
    demandId: "youthPathway",
    blocReaction: { big: 2, regional: 8, small: 10 },
    constitutional: false,
    effect: "youth-development",
  },
  "solidarity-fund": {
    id: "solidarity-fund",
    title: P(
      "صندوق تضامن الأندية",
      "Club Solidarity Fund",
      "Fonds de solidarité des clubs",
    ),
    summary: P(
      "ينشئ مخصصًا لدعم الأندية الأقل مواردًا بمنح منشورة ومحددة الغرض.",
      "Creates a ring-fenced fund for published, purpose-bound grants to lower-resource clubs.",
      "Crée un fonds dédié à des aides publiées et affectées aux clubs les moins dotés.",
    ),
    explain: P(
      "يُحجز 5 ملايين كل موسم لصندوق التضامن لدعم الأندية الأصغر. الأثر في سجل التوزيعات المعلن، ولا يُخصم شيء من أي نادٍ.",
      "Five million are reserved each season for the solidarity fund supporting smaller clubs. The effect appears in the published distribution record, and nothing is deducted from any club.",
      "Cinq millions sont réservés chaque saison au fonds de solidarité pour les petits clubs. L’effet figure dans le registre des répartitions, sans prélèvement sur aucun club.",
    ),
    reaction: {
      passed: P(
        "ترحب الأندية الصغيرة بالصندوق، وتطالب برقابة واضحة على المنح.",
        "Smaller clubs welcome the fund and call for clear grant oversight.",
        "Les petits clubs accueillent le fonds et demandent un contrôle clair des aides.",
      ),
      rejected: P(
        "تقول الأندية المحتاجة إن أداة الدعم ستظل غائبة.",
        "Lower-resource clubs say the support mechanism will remain absent.",
        "Les clubs moins dotés déplorent l’absence persistante d’un mécanisme de soutien.",
      ),
    },
    category: "finance",
    demandId: "equitableBroadcast",
    blocReaction: { big: -3, regional: 7, small: 11 },
    constitutional: false,
    effect: "solidarity-fund",
  },
  "financial-disclosure": {
    id: "financial-disclosure",
    title: P(
      "إفصاح مالي موحد",
      "Standardised Financial Disclosure",
      "Publication financière normalisée",
    ),
    summary: P(
      "يفرض نشر الإيرادات والمنح والتوزيعات في سجل موحد قابل للمراجعة.",
      "Requires revenue, grants, and distributions to appear in one reviewable ledger.",
      "Impose la publication des revenus, aides et répartitions dans un registre vérifiable.",
    ),
    explain: P(
      "تفتح الإفصاح العام: أرقام ميزانية الاتحاد والتوزيعات وأرصدة الأندية تصبح ظاهرة في واجهة المجلس لمن يريد التدقيق، بلا غرامات.",
      "Opens public disclosure: the association budget, distributions and club balances become visible on the council screen for anyone to check, with no fines.",
      "Ouvre la publication : le budget, les répartitions et les soldes des clubs deviennent visibles sur l’écran du conseil, sans amende.",
    ),
    reaction: {
      passed: P(
        "ترحب الأندية الشفافة بالقاعدة، فيما تطلب أخرى ضمان حماية البيانات الحساسة.",
        "Clubs favouring transparency welcome the rule; others ask that sensitive data remain protected.",
        "Les clubs favorables à la transparence saluent la règle, tandis que d’autres demandent la protection des données sensibles.",
      ),
      rejected: P(
        "تتجدد مطالب الأندية بنشر الحسابات والقرارات المالية.",
        "Clubs renew their calls for published accounts and financial decisions.",
        "Les clubs renouvellent leur demande de publication des comptes et décisions financières.",
      ),
    },
    category: "governance",
    demandId: "governance",
    blocReaction: { big: -1, regional: 6, small: 7 },
    constitutional: false,
    effect: "financial-disclosure",
  },
  "independent-audit": {
    id: "independent-audit",
    title: P(
      "مراجعة مالية مستقلة",
      "Independent Financial Audit",
      "Audit financier indépendant",
    ),
    summary: P(
      "يعتمد مراجعة سنوية مستقلة لحساب الاتحاد والمنح والتوزيعات.",
      "Mandates an independent annual review of association accounts, grants, and distributions.",
      "Impose un audit annuel indépendant des comptes, aides et répartitions de la fédération.",
    ),
    explain: P(
      "تصبح المراجعة المالية إلزامية تلقائيًا كل موسم، وتُسجَّل نتيجتها (مطابقة أو فرق) في سجل الاتحاد دون أن توقف اللعب.",
      "Financial review becomes automatically mandatory every season, and its result (reconciled or a discrepancy) is recorded in the association register without pausing play.",
      "L’audit devient obligatoire chaque saison ; son résultat (rapproché ou écart) est consigné au registre, sans interrompre la partie.",
    ),
    reaction: {
      passed: P(
        "ترحب الأندية بالمراجعة، وتنتظر تقريرًا علنيًا عن الحساب الختامي.",
        "Clubs welcome the audit and expect a public year-end report.",
        "Les clubs saluent l’audit et attendent un rapport public de clôture.",
      ),
      rejected: P(
        "تحذر الأندية من أن الحسابات ستبقى بلا تدقيق خارجي.",
        "Clubs warn that accounts will remain without an independent review.",
        "Les clubs avertissent que les comptes resteront sans contrôle indépendant.",
      ),
    },
    category: "governance",
    demandId: "governance",
    blocReaction: { big: -2, regional: 6, small: 8 },
    constitutional: false,
    effect: "independent-audit",
  },
  "club-ownership-register": {
    id: "club-ownership-register",
    title: P(
      "سجل موحد لملكية الأندية",
      "Unified Club Ownership Register",
      "Registre unifié de propriété des clubs",
    ),
    summary: P(
      "يوحد الإفصاح عن ملكية الأندية وتعارض المصالح وفق قواعد مشتركة.",
      "Standardises ownership and conflict-of-interest disclosures under shared rules.",
      "Harmonise les déclarations de propriété et de conflits d’intérêts selon des règles communes.",
    ),
    explain: P(
      "يسجّل ملكية الأندية في سجل علني ويفتح الإفصاح العام مثل لائحة الإفصاح؛ أثرها في الشفافية لا في العقوبات.",
      "Registers club ownership in a public record and opens public disclosure like the disclosure article; its effect is transparency, not penalties.",
      "Inscrit la propriété des clubs dans un registre public et ouvre la publication, comme le texte sur la transparence ; l’effet est la clarté, pas les sanctions.",
    ),
    reaction: {
      passed: P(
        "تطالب الأندية بتطبيق موحد على جميع الدرجات دون استثناء.",
        "Clubs call for consistent enforcement across every division.",
        "Les clubs demandent une application cohérente à toutes les divisions.",
      ),
      rejected: P(
        "تستمر الخلافات حول الإفصاح عن المصالح والملكية.",
        "Disputes over ownership and interests continue.",
        "Les désaccords sur la propriété et les intérêts se poursuivent.",
      ),
    },
    category: "governance",
    demandId: "governance",
    blocReaction: { big: 1, regional: 5, small: 4 },
    constitutional: false,
    effect: "club-ownership-register",
  },
  "foreign-player-limit": {
    id: "foreign-player-limit",
    title: P(
      "لائحة واضحة لقيد اللاعبين الأجانب",
      "Clear Foreign-Player Registration Rule",
      "Règle claire d’inscription des joueurs étrangers",
    ),
    summary: P(
      "يحدد إطارًا موحدًا لقيد اللاعبين الأجانب؛ التفاصيل الرياضية تُطبق مع مجموعة المسابقات.",
      "Sets a consistent registration framework; sporting enforcement is handled by the competitions group.",
      "Établit un cadre d’inscription commun ; l’application sportive relève du groupe des compétitions.",
    ),
    explain: P(
      "مادة رياضية نافذة في كتالوج المجلس: لا تغيّر ميزانية الاتحاد ولا تخصم شيئًا، لكنها ترفع تأييد الأندية الكبرى (+7) وتُرضي مطالب توازن الأجانب.",
      "A sporting article in the council catalogue: it changes no association budget and deducts nothing, but raises the biggest clubs' support (+7) and satisfies demands for foreign-player balance.",
      "Un article sportif du catalogue : aucun budget modifié, mais le soutien des grands clubs progresse (+7) et les demandes d’équilibre des étrangers sont satisfaites.",
    ),
    reaction: {
      passed: P(
        "تختلف الأندية بين الترحيب بالتوازن والتحذير من تقييد المنافسة.",
        "Clubs are divided between welcoming balance and warning against restricting competition.",
        "Les clubs sont partagés entre recherche d’équilibre et crainte d’une concurrence restreinte.",
      ),
      rejected: P(
        "تطالب الأندية بحسم قواعد قيد الأجانب قبل الموسم المقبل.",
        "Clubs call for registration rules to be settled before next season.",
        "Les clubs demandent que les règles d’inscription soient fixées avant la prochaine saison.",
      ),
    },
    category: "sport",
    demandId: "foreignBalance",
    blocReaction: { big: 7, regional: 1, small: 4 },
    constitutional: false,
    effect: "foreign-player-limit",
  },
  "league-calendar": {
    id: "league-calendar",
    title: P(
      "روزنامة توازن الدخل والراحة",
      "Balanced League Calendar",
      "Calendrier équilibré des recettes et du repos",
    ),
    summary: P(
      "يعتمد إطارًا مستقرًا لمواعيد المسابقات، مع مراعاة الراحة ودخل الأندية.",
      "Sets a stable competition calendar that accounts for rest and club income.",
      "Établit un calendrier stable qui tient compte du repos et des revenus des clubs.",
    ),
    explain: P(
      "مادة رياضية لتنظيم التقويم: أثرها في مواقف الأندية (الإقليمية +7 والصغيرة +9)، ولا تمس الميزانية أو الاقتراع.",
      "A sporting article organising the calendar: its effect is on club positions (regional +7, small +9); it touches neither the budget nor the ballot.",
      "Article sportif sur le calendrier : effet sur les positions (régionaux +7, petits +9), sans toucher au budget ni au vote.",
    ),
    reaction: {
      passed: P(
        "ترحب الأندية باستقرار الجدول وتتابع أثره على مواعيد المسابقات.",
        "Clubs welcome a steadier schedule and will monitor its effect on competition dates.",
        "Les clubs saluent la stabilité du calendrier et suivront son effet sur les dates des compétitions.",
      ),
      rejected: P(
        "تستمر المطالب بروزنامة أكثر قابلية للتنبؤ.",
        "Calls continue for a more predictable calendar.",
        "Les demandes d’un calendrier plus prévisible se poursuivent.",
      ),
    },
    category: "sport",
    demandId: "competitionIncome",
    blocReaction: { big: -2, regional: 7, small: 9 },
    constitutional: false,
    effect: "league-calendar",
  },
  "independent-referees": {
    id: "independent-referees",
    title: P(
      "استقلال لجنة الحكام",
      "Independent Referees Committee",
      "Commission d’arbitrage indépendante",
    ),
    summary: P(
      "يفصل تعيين الحكام ومراجعتهم عن المصالح المباشرة للأندية.",
      "Separates referee appointments and reviews from clubs’ direct interests.",
      "Sépare les nominations et évaluations des arbitres des intérêts directs des clubs.",
    ),
    explain: P(
      "تفصل التحكيم عن الضغوط: ترفع تأييد الأندية الإقليمية والصغيرة (5 و7)، ويبقى ملف التعيينات في مساره الحالي داخل لجنة الحكام.",
      "Separates refereeing from pressure: regional and small clubs gain support (5 and 7), while appointments stay in the existing referees committee path.",
      "Sépare l’arbitrage des pressions : les clubs régionaux et modestes gagnent du soutien (5 et 7), les nominations restant à la commission des arbitres.",
    ),
    reaction: {
      passed: P(
        "تتوقع الأندية قرارات أكثر اتساقًا وتطالب بآلية تظلم مستقلة.",
        "Clubs expect more consistent decisions and request an independent appeal route.",
        "Les clubs espèrent des décisions plus cohérentes et demandent un recours indépendant.",
      ),
      rejected: P(
        "تتجدد الشكاوى من تضارب المصالح في تعيين الحكام.",
        "Complaints about conflicts in referee appointments resurface.",
        "Les plaintes sur les conflits d’intérêts dans les nominations d’arbitres reprennent.",
      ),
    },
    category: "sport",
    demandId: "governance",
    blocReaction: { big: -1, regional: 5, small: 7 },
    constitutional: false,
    effect: "independent-referees",
  },
  "fair-discipline": {
    id: "fair-discipline",
    title: P(
      "لائحة انضباط واستئناف متوازنة",
      "Balanced Discipline and Appeals",
      "Discipline et recours équilibrés",
    ),
    summary: P(
      "ينشر درجات العقوبة ويتيح مراجعة مستقلة للقرارات التأديبية.",
      "Publishes sanction ranges and allows independent review of disciplinary decisions.",
      "Publie les niveaux de sanction et autorise un réexamen indépendant des décisions disciplinaires.",
    ),
    explain: P(
      "توحّد العقوبات وتنشر قرارات الانضباط: أثرها في مواقف الأندية (الصغيرة +5) ومسار الشكاوى القائم في لجنة الانضباط.",
      "Standardises sanctions and publishes disciplinary rulings: the effect is on club positions (small +5) and on the existing appeals path in the discipline committee.",
      "Uniformise les sanctions et publie les décisions : effet sur les positions (petits +5) et sur la voie de recours de la commission de discipline.",
    ),
    reaction: {
      passed: P(
        "ترحب الأندية بوضوح العقوبات وتنتظر تطبيقًا متسقًا.",
        "Clubs welcome clearer sanctions and expect consistent enforcement.",
        "Les clubs saluent la clarté des sanctions et attendent une application cohérente.",
      ),
      rejected: P(
        "تستمر المخاوف من اختلاف العقوبات بين الأندية.",
        "Concern persists about inconsistent sanctions between clubs.",
        "Les inquiétudes sur l’inégalité des sanctions persistent.",
      ),
    },
    category: "sport",
    demandId: "governance",
    blocReaction: { big: 2, regional: 3, small: 5 },
    constitutional: false,
    effect: "fair-discipline",
  },
  "competition-integrity": {
    id: "competition-integrity",
    title: P(
      "نزاهة المسابقات",
      "Competition Integrity Standard",
      "Norme d’intégrité des compétitions",
    ),
    summary: P(
      "يفرض إعلان تضارب المصالح ومراجعة القرارات المؤثرة في المسابقات.",
      "Requires conflict disclosures and review of decisions affecting competitions.",
      "Impose la déclaration des conflits et l’examen des décisions influant sur les compétitions.",
    ),
    explain: P(
      "تجعل نزاهة المسابقات بندًا معلنًا: أثرها في مواقف الأندية (الإقليمية +4 والصغيرة +6) ودعم ملف النزاهة السياسي دون تحقيقات آلية.",
      "Makes competition integrity a declared clause: its effect is on club positions (regional +4, small +6) and on the political integrity file, without automatic investigations.",
      "Fait de l’intégrité une clause déclarée : effet sur les positions (régionaux +4, petits +6) et sur le dossier d’intégrité, sans enquête automatique.",
    ),
    reaction: {
      passed: P(
        "تؤيد الأندية الفصل بين إدارة المسابقة ومصالح المتنافسين.",
        "Clubs support separating competition administration from the interests of entrants.",
        "Les clubs soutiennent la séparation entre gestion de la compétition et intérêts des participants.",
      ),
      rejected: P(
        "تحذر الأندية من بقاء قرارات المسابقة بلا مراجعة كافية.",
        "Clubs warn that competition decisions may remain insufficiently reviewed.",
        "Les clubs avertissent que les décisions de compétition risquent de rester insuffisamment contrôlées.",
      ),
    },
    category: "governance",
    demandId: "governance",
    blocReaction: { big: 0, regional: 4, small: 6 },
    constitutional: false,
    effect: "competition-integrity",
  },
  "two-term-limit": {
    id: "two-term-limit",
    title: P(
      "تعديل دستوري: حد ولايتين للرئيس",
      "Constitutional Amendment: Two-Term Limit",
      "Amendement constitutionnel : deux mandats maximum",
    ),
    summary: P(
      "يمنع الرئيس من الترشح بعد ولايتين ناجحتين؛ يحتاج التعديل إلى أغلبية دستورية موصوفة.",
      "Bars a president from standing after two successful terms; this amendment needs a constitutional supermajority.",
      "Interdit au président de se représenter après deux mandats réussis ; cet amendement exige une majorité constitutionnelle renforcée.",
    ),
    explain: P(
      "تعديل دستوري: يمنع الترشح بعد ولايتين. إن كنت أكملت ولايتين فستُستبعد من الاقتراع القادم مثل أي مرشح آخر، ويبقى السجل محفوظًا.",
      "A constitutional amendment: no candidacy after two terms. If you have served two, you are excluded from the coming ballot like any other candidate, and the record stays saved.",
      "Amendement constitutionnel : plus de candidature après deux mandats. Si vous en avez accompli deux, vous êtes écarté du prochain vote comme tout autre candidat, le registre restant conservé.",
    ),
    reaction: {
      passed: P(
        "ترحب الأندية بتحديد تداول المنصب، ويستعد المجلس لتطبيق السقف على الدورات المقبلة.",
        "Clubs welcome a limit on tenure; the council will apply it to future election cycles.",
        "Les clubs saluent la limitation des mandats ; le conseil l’appliquera aux prochains cycles électoraux.",
      ),
      rejected: P(
        "يبقى عدد الولايات الرئاسية بلا سقف دستوري.",
        "Presidential terms remain without a constitutional cap.",
        "Le nombre de mandats présidentiels reste sans limite constitutionnelle.",
      ),
    },
    category: "constitution",
    demandId: "governance",
    blocReaction: { big: -1, regional: 4, small: 7 },
    constitutional: true,
    effect: "two-term-limit",
  },
});

export const POLITICAL_LAW_LIST = Object.values(POLITICAL_LAWS);
