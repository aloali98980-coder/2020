// نصوص «لائحة الجمعية العمومية» 0.26 — مصدر واحد لكل عبارة بثلاث لغات.
//
// لماذا ملف مستقل؟ لأن كل نص في هذا النظام يُشتق منه القاموس تلقائيًا
// (src/i18n/phrases-board.js) فيبقى التغطية كاملة بالبناء لا بالاجتهاد:
//   · أي نص عربي هنا يصبح مفتاح ترجمة فورًا، فلا تبقى عبارة غير مترجمة.
//   · اختبار الوحدة يمرّ على كل نص ويتحقق أن الإنجليزية والفرنسية خاليتان من العربية.
//
// المقاطع {v} و {n} و {d} عناصر استبدال تُملأ عند العرض (أرقام/مبالغ/تواريخ).
export const BOARD_TEXTS = {
  // ── الهوية والشاشة ────────────────────────────────────────────────────────
  boardName: {
    ar: "الجمعية العمومية",
    en: "The General Assembly",
    fr: "L’assemblée générale",
  },
  boardKicker: {
    ar: "مجلس الإدارة والمستثمرين",
    en: "Board and investors",
    fr: "Conseil et investisseurs",
  },
  boardTitle: {
    ar: "لائحة مطالب الموسم",
    en: "Season mandate",
    fr: "Mandat de la saison",
  },
  boardIntro: {
    ar: "الجمعية العمومية والمستثمرون يحددون مطالب الموسم قبل أول جولة. كل بند له هدف قابل للقياس ويتتبعه النظام لحظيًا، والتصويت في نهاية الموسم.",
    en: "The assembly and the investors set the season’s demands before the first matchday. Every clause has a measurable target tracked live, with a vote at the end of the season.",
    fr: "L’assemblée et les investisseurs fixent les exigences de la saison avant la première journée. Chaque clause a un objectif mesurable suivi en direct, avec un vote en fin de saison.",
  },
  boardNoMandate: {
    ar: "لا توجد لائحة نشطة",
    en: "No active mandate",
    fr: "Aucun mandat actif",
  },
  boardNoMandateBody: {
    ar: "تصدر اللائحة عند بداية الموسم القادم حسب حجم النادي وطموحه.",
    en: "The mandate is issued at the start of the next season, sized to your club and its ambition.",
    fr: "Le mandat est émis au début de la saison suivante, selon la taille et l’ambition du club.",
  },
  boardConfidence: {
    ar: "ثقة الجمعية",
    en: "Assembly confidence",
    fr: "Confiance de l’assemblée",
  },
  boardProgress: {
    ar: "تقدم اللائحة",
    en: "Mandate progress",
    fr: "Progression du mandat",
  },
  boardItemsDone: {
    ar: "{n} من {d} بندًا",
    en: "{n} of {d} clauses",
    fr: "{n} sur {d} clauses",
  },
  boardCritical: {
    ar: "بند حاسم",
    en: "Key clause",
    fr: "Clause clé",
  },
  boardDeadline: {
    ar: "المهلة: {d}",
    en: "Deadline: {d}",
    fr: "Échéance : {d}",
  },
  boardMidDate: {
    ar: "مراجعة منتصف الموسم: {d}",
    en: "Mid-season review: {d}",
    fr: "Revue de mi-saison : {d}",
  },
  boardEndDate: {
    ar: "التصويت النهائي: {d}",
    en: "Final vote: {d}",
    fr: "Vote final : {d}",
  },
  boardItemMet: {
    ar: "بند محقق",
    en: "Clause met",
    fr: "Clause remplie",
  },
  boardItemOpen: {
    ar: "قيد التنفيذ",
    en: "In progress",
    fr: "En cours",
  },
  boardItemBehind: {
    ar: "متأخر عن الإيقاع",
    en: "Behind schedule",
    fr: "En retard",
  },
  boardHistory: {
    ar: "سجل المواسم",
    en: "Season history",
    fr: "Historique des saisons",
  },
  boardHistoryEmpty: {
    ar: "لم يُصوَّت على لائحة بعد.",
    en: "No mandate has been voted on yet.",
    fr: "Aucun mandat n’a encore été voté.",
  },
  boardSeason: {
    ar: "موسم {n}",
    en: "Season {n}",
    fr: "Saison {n}",
  },
  boardSizeSmall: {
    ar: "نادٍ صغير",
    en: "Small club",
    fr: "Petit club",
  },
  boardSizeMedium: {
    ar: "نادٍ متوسط",
    en: "Mid-sized club",
    fr: "Club moyen",
  },
  boardSizeLarge: {
    ar: "نادٍ كبير",
    en: "Large club",
    fr: "Grand club",
  },
  boardSizeGiant: {
    ar: "نادٍ عملاق",
    en: "Giant club",
    fr: "Club géant",
  },
  boardAmbitionSurvival: {
    ar: "طموح البقاء",
    en: "Survival ambition",
    fr: "Ambition de survie",
  },
  boardAmbitionStable: {
    ar: "طموح الاستقرار",
    en: "Stability ambition",
    fr: "Ambition de stabilité",
  },
  boardAmbitionAmbitious: {
    ar: "طموح المنافسة",
    en: "Competitive ambition",
    fr: "Ambition compétitive",
  },
  boardAmbitionElite: {
    ar: "طموح القمة",
    en: "Elite ambition",
    fr: "Ambition d’élite",
  },
  boardAmbitionRebuild: {
    ar: "خطة إعادة البناء",
    en: "Rebuild plan",
    fr: "Plan de reconstruction",
  },
  boardNoDismissal: {
    ar: "اللائحة لا تمس ملكيتك للنادي أبدًا: العواقب مالية وجماهيرية وإدارية فقط، ومفيش أي مسار ينهي مسيرتك.",
    en: "The mandate never touches your ownership: consequences are financial, popular and administrative only, and no path ends your career.",
    fr: "Le mandat ne touche jamais à votre propriété : les conséquences sont financières, populaires et administratives, et aucun chemin ne met fin à votre carrière.",
  },

  // ── المحاور ───────────────────────────────────────────────────────────────
  axisSporting: {
    ar: "المحور الرياضي",
    en: "Sporting",
    fr: "Sportif",
  },
  axisFinancial: {
    ar: "المحور المالي",
    en: "Financial",
    fr: "Financier",
  },
  axisDevelopment: {
    ar: "المحور التطويري",
    en: "Development",
    fr: "Développement",
  },

  // ── بنود اللائحة (١٠ أنواع) ────────────────────────────────────────────────
  itemLeagueRank: {
    ar: "المركز {v} أو أفضل في الدوري",
    en: "Finish {v} or better in the league",
    fr: "Terminer {v}e ou mieux en championnat",
  },
  itemCupTies: {
    ar: "الفوز بـ{v} مواجهات إقصائية في الكأس",
    en: "Win {v} knockout ties in the cup",
    fr: "Remporter {v} tours à élimination en coupe",
  },
  itemContinentalStage: {
    ar: "تجاوز {v} مواجهات إقصائية في البطولة القارية",
    en: "Win {v} knockout ties in the continental competition",
    fr: "Remporter {v} tours à élimination en compétition continentale",
  },
  itemContinentalQualify: {
    ar: "احتلال مركز مؤهل قاريًا — {v} أو أفضل",
    en: "Finish in a continental spot — {v} or better",
    fr: "Terminer à une place continentale — {v}e ou mieux",
  },
  itemDeficitCap: {
    ar: "ألا يقل صافي الموسم عن {v}",
    en: "Season net result no worse than {v}",
    fr: "Résultat net de la saison pas pire que {v}",
  },
  itemMinLiquidity: {
    ar: "إنهاء الموسم بسيولة لا تقل عن {v}",
    en: "End the season with at least {v} in cash",
    fr: "Terminer la saison avec au moins {v} en caisse",
  },
  itemPlayerSale: {
    ar: "بيع لاعب بمقابل لا يقل عن {v}",
    en: "Sell a player for at least {v}",
    fr: "Vendre un joueur pour au moins {v}",
  },
  itemYouthMinutes: {
    ar: "منح الناشئين {v} دقيقة لعب",
    en: "Give the academy players {v} minutes",
    fr: "Donner {v} minutes aux jeunes",
  },
  itemFacilityProject: {
    ar: "إتمام مشروع منشأة واحد على الأقل",
    en: "Complete at least one facility project",
    fr: "Achever au moins un projet d’installation",
  },
  itemYoungSigning: {
    ar: "التعاقد مع لاعب لا يزيد عمره عن {v} عامًا",
    en: "Sign a player aged {v} or younger",
    fr: "Recruter un joueur de {v} ans ou moins",
  },
  itemBettingEthics: {
    ar: "بند أخلاقي: لا تضارب بين النادي وشركة المراهنات (التضارب أقل من 40)",
    en: "Ethics clause: no conflict between club and betting company (conflict below 40)",
    fr: "Clause éthique : pas de conflit entre le club et la société de paris (conflit inférieur à 40)",
  },

  // ── بداية الموسم ──────────────────────────────────────────────────────────
  mandateIssuedTitle: {
    ar: "الجمعية العمومية تصدر لائحة الموسم",
    en: "The assembly issues the season mandate",
    fr: "L’assemblée publie le mandat de la saison",
  },
  mandateIssuedBody: {
    ar: "اللائحة منشورة كاملة في شاشة الجمعية العمومية: بنود على ثلاثة محاور، لكل بند هدف قابل للقياس. مراجعة منتصف الموسم ثم تصويت نهائي في نهاية الموسم. الالتزام الجيد يعني مكافآت حقيقية، والتأخر يعني تحذيرًا رسميًا",
    en: "The full mandate is on the assembly screen: clauses across three axes, each with a measurable target. A mid-season review, then a final vote at the end of the season. Meeting it brings real rewards; falling behind brings a formal warning",
    fr: "Le mandat complet est sur l’écran de l’assemblée : des clauses sur trois axes, chacune avec un objectif mesurable. Une revue de mi-saison, puis un vote final en fin de saison. Le respect apporte de vraies récompenses ; le retard, un avertissement officiel",
  },

  // ── اجتماع منتصف الموسم ───────────────────────────────────────────────────
  midMeetingGoodTitle: {
    ar: "رسالة ثقة من منتصف الموسم",
    en: "A mid-season vote of confidence",
    fr: "Un vote de confiance à mi-saison",
  },
  midMeetingGoodBody: {
    ar: "الجمعية راجعت التقدم في منتصف الموسم: البنود في إيقاعها الصحيح أو أقرب. المستثمرون راضون، والجماهير تستشعر الاستقرار. استمر على نفس النهج",
    en: "The assembly reviewed mid-season progress: the clauses are on pace or close. The investors are satisfied and the fans feel the stability. Keep it going",
    fr: "L’assemblée a examiné la progression à mi-saison : les clauses sont dans les temps ou proches. Les investisseurs sont satisfaits et les supporters sentent la stabilité. Continuez ainsi",
  },
  midMeetingWarnTitle: {
    ar: "تحذير رسمي عند منتصف الموسم",
    en: "A formal warning at mid-season",
    fr: "Avertissement officiel à mi-saison",
  },
  midMeetingWarnBody: {
    ar: "الجمعية راجعت التقدم في منتصف الموسم: بنود كثيرة متأخرة عن إيقاعها. هذا إنذار أصفر رسمي بمهلة حتى نهاية الموسم. لا وصاية على قراراتك، لكن التصويت النهائي سيكون على هذا الأساس",
    en: "The assembly reviewed mid-season progress: too many clauses are behind pace. This is a formal yellow warning with a deadline until the season’s end. Your decisions stay yours, but the final vote will be held on this basis",
    fr: "L’assemblée a examiné la progression à mi-saison : trop de clauses sont en retard. Ceci est un avertissement jaune officiel avec échéance à la fin de la saison. Vos décisions restent les vôtres, mais le vote final se tiendra sur cette base",
  },
  midMeetingTag: {
    ar: "مراجعة المنتصف",
    en: "Mid-season review",
    fr: "Revue de mi-saison",
  },

  // ── التصويت النهائي ───────────────────────────────────────────────────────
  endMeetingPassedTitle: {
    ar: "التصويت النهائي: تنفيذ كامل للائحة",
    en: "Final vote: the mandate was fully delivered",
    fr: "Vote final : mandat pleinement rempli",
  },
  endMeetingPassedBody: {
    ar: "الجمعية والمستثمرون صوّتوا بالثقة: اللائحة نُفِّذت. المكافآت دخلت فعلًا — دعم مالي من المستثمرين، وزيادة ميزانية التعاقدات للموسم القادم، ودفعة في حب الجماهير",
    en: "The assembly and the investors voted confidence: the mandate was delivered. The rewards are real — investor funding, a bigger transfer budget next season and a lift in fan affection",
    fr: "L’assemblée et les investisseurs ont voté la confiance : le mandat a été rempli. Les récompenses sont réelles — financement des investisseurs, budget de transfert plus élevé la saison prochaine et hausse de l’affection des supporters",
  },
  endMeetingPartialTitle: {
    ar: "التصويت النهائي: إخفاق جزئي — تحذير نهائي",
    en: "Final vote: partial failure — final warning",
    fr: "Vote final : échec partiel — avertissement final",
  },
  endMeetingPartialBody: {
    ar: "الجمعية سجّلت إخفاقًا جزئيًا في لائحة الموسم. ليست كارثة، لكنها ليست اللائحة المطلوبة: هذا تحذير نهائي مكتوب، والموسم القادم يُقاس على تحسّن ملموس. ملكيتك للنادي كما هي",
    en: "The assembly recorded a partial failure on the season mandate. Not a disaster, but not the mandate either: this is a written final warning, and next season will be judged on visible improvement. Your ownership is untouched",
    fr: "L’assemblée a enregistré un échec partiel du mandat. Pas une catastrophe, mais pas le mandat non plus : ceci est un avertissement final écrit, et la saison prochaine sera jugée sur des progrès visibles. Votre propriété reste intacte",
  },
  endMeetingFailedTitle: {
    ar: "التصويت النهائي: إخفاق كبير",
    en: "Final vote: a heavy failure",
    fr: "Vote final : échec lourd",
  },
  endMeetingFailedBody: {
    ar: "الجمعية سجّلت إخفاقًا كبيرًا في لائحة الموسم، والعواقب التنفيذية صدرت بالفعل. الملكية باقية لك، واللائحة القادمة تُبنى على إعادة البناء لا العقاب. تفاصيل الميزانية والتجميد والرعاية في شاشة الجمعية العمومية",
    en: "The assembly recorded a heavy failure on the season mandate, and the executive consequences are already in effect. Ownership stays yours, and the next mandate is built on rebuilding rather than punishment. The budget, freeze and sponsor details are on the assembly screen",
    fr: "L’assemblée a enregistré un échec lourd du mandat, et les conséquences exécutives sont déjà appliquées. La propriété vous reste, et le prochain mandat mise sur la reconstruction plutôt que la sanction. Les détails budget, gel et sponsor sont sur l’écran de l’assemblée",
  },
  endMeetingTag: {
    ar: "التصويت النهائي",
    en: "Final vote",
    fr: "Vote final",
  },

  // ── العواقب والمكافآت ─────────────────────────────────────────────────────
  cRewardInvestors: {
    ar: "دعم مالي من المستثمرين {money}",
    en: "investor funding of {money}",
    fr: "un financement des investisseurs de {money}",
  },
  cRewardBudget: {
    ar: "زيادة ميزانية التعاقدات {n}٪ للموسم القادم",
    en: "a {n}% bigger transfer budget next season",
    fr: "un budget de transfert en hausse de {n}% la saison prochaine",
  },
  cRewardFans: {
    ar: "دفعة في حب الجماهير +{n}",
    en: "a fan-affection boost of +{n}",
    fr: "un gain d’affection des supporters de +{n}",
  },
  cBudgetCut: {
    ar: "تقليص ميزانية المرتبات {n}٪",
    en: "a {n}% cut to the wage budget",
    fr: "une réduction du budget salarial de {n}%",
  },
  cFreeze: {
    ar: "تجميد التعاقدات حتى {d}",
    en: "a transfer freeze until {d}",
    fr: "un gel des transferts jusqu’au {d}",
  },
  cSponsorOut: {
    ar: "انسحاب راعٍ من العقد",
    en: "a sponsor walking away from its deal",
    fr: "un sponsor qui quitte son contrat",
  },
  cProtest: {
    ar: "احتجاج جماهيري خارج المقر −{n}",
    en: "a fan protest outside the ground, −{n}",
    fr: "une protestation des supporters devant le stade, −{n}",
  },
  cWageBudgetNote: {
    ar: "ميزانية المرتبات الحالية: {money}",
    en: "Current wage budget: {money}",
    fr: "Budget salarial actuel : {money}",
  },

  // ── التجميد في سوق الانتقالات ─────────────────────────────────────────────
  freezeBlocked: {
    ar: "تجميد التعاقدات ساري حتى {d} بقرار الجمعية العمومية؛ لا يمكن فتح مفاوضات جديدة الآن.",
    en: "The transfer freeze ordered by the assembly runs until {d}; no new negotiations can be opened right now.",
    fr: "Le gel des transferts ordonné par l’assemblée court jusqu’au {d} ; aucune nouvelle négociation n’est possible pour l’instant.",
  },
  freezeBadge: {
    ar: "تعاقدات مجمّدة حتى {d}",
    en: "Transfers frozen until {d}",
    fr: "Transferts gelés jusqu’au {d}",
  },

  // ── بطاقة اللوحة وبريد اللائحة ────────────────────────────────────────────
  boardCardTitle: {
    ar: "مطالب الجمعية العمومية",
    en: "Assembly demands",
    fr: "Exigences de l’assemblée",
  },
  boardCardOpen: {
    ar: "افتح اللائحة كاملة",
    en: "Open the full mandate",
    fr: "Ouvrir le mandat complet",
  },
  boardMailSeen: {
    ar: "اطلعت على اللائحة",
    en: "Noted the mandate",
    fr: "Mandat pris en compte",
  },
  boardMailOpen: {
    ar: "راجع اللائحة",
    en: "Review the mandate",
    fr: "Consulter le mandat",
  },
  boardOnboardingStep: {
    ar: "اطّلع على لائحة الجمعية العمومية",
    en: "Read the assembly mandate",
    fr: "Lire le mandat de l’assemblée",
  },
  boardOnboardingHint: {
    ar: "ثلاثة محاور تُقاس طوال الموسم، والتصويت في النهاية",
    en: "Three axes measured all season, with a vote at the end",
    fr: "Trois axes mesurés toute la saison, avec un vote à la fin",
  },
  boardInboxCategory: {
    ar: "الجمعية العمومية",
    en: "General assembly",
    fr: "Assemblée générale",
  },
  boardWarningStreak: {
    ar: "إخفاق متتالٍ: {n}",
    en: "Consecutive failures: {n}",
    fr: "Échecs consécutifs : {n}",
  },
  boardBudgetFactor: {
    ar: "معامل ميزانية التعاقدات: {n}٪",
    en: "Transfer budget factor: {n}%",
    fr: "Coefficient du budget transferts : {n}%",
  },
  boardLabelSize: {
    ar: "حجم النادي",
    en: "Club size",
    fr: "Taille du club",
  },
  boardLabelAmbition: {
    ar: "طموح الموسم",
    en: "Season ambition",
    fr: "Ambition de la saison",
  },
  boardMeetings: {
    ar: "سجل الاجتماعات",
    en: "Meetings log",
    fr: "Journal des réunions",
  },
  boardEffectNone: {
    ar: "بلا عواقب",
    en: "No consequences",
    fr: "Aucune conséquence",
  },
  boardChipPassed: {
    ar: "تنفيذ كامل",
    en: "Fully delivered",
    fr: "Pleinement rempli",
  },
  boardChipPartial: {
    ar: "إخفاق جزئي",
    en: "Partial failure",
    fr: "Échec partiel",
  },
  boardChipFailed: {
    ar: "إخفاق كبير",
    en: "Heavy failure",
    fr: "Échec lourd",
  },
  boardChipTrust: {
    ar: "رسالة ثقة",
    en: "Vote of confidence",
    fr: "Vote de confiance",
  },
  boardChipWarning: {
    ar: "إنذار رسمي",
    en: "Formal warning",
    fr: "Avertissement officiel",
  },
  boardMigrationNote: {
    ar: "الجمعية العمومية 0.26: مجلس إدارة ومستثمرون يصدرون لائحة مطالب الموسم بثلاثة محاور، مع مراجعة منتصف الموسم وتصويت نهائي؛ الملكية لا تُمس في أي حال",
    en: "The assembly 0.26: a board and investors issue a three-axis season mandate, with a mid-season review and a final vote; ownership is never touched",
    fr: "L’assemblée 0.26 : un conseil et des investisseurs publient un mandat de saison en trois axes, avec une revue de mi-saison et un vote final ; la propriété n’est jamais touchée",
  },
  boardInvalidState: {
    ar: "حالة الجمعية العمومية غير سليمة",
    en: "The assembly state is not valid",
    fr: "L’état de l’assemblée n’est pas valide",
  },
  boardInvalidMetrics: {
    ar: "مؤشرات الجمعية العمومية غير سليمة",
    en: "The assembly indicators are not valid",
    fr: "Les indicateurs de l’assemblée ne sont pas valides",
  },
  boardInvalidMandate: {
    ar: "لائحة الجمعية العمومية غير سليمة",
    en: "The assembly mandate is not valid",
    fr: "Le mandat de l’assemblée n’est pas valide",
  },
  boardInvalidHistory: {
    ar: "سجل لائحة الجمعية العمومية غير سليم",
    en: "The assembly mandate history is not valid",
    fr: "L’historique des mandats n’est pas valide",
  },
  boardInvalidMeetings: {
    ar: "سجل اجتماعات الجمعية العمومية غير سليم",
    en: "The assembly meetings log is not valid",
    fr: "Le journal des réunions de l’assemblée n’est pas valide",
  },
  boardLedgerSupport: {
    ar: "دعم المستثمرين",
    en: "Investor funding",
    fr: "Financement des investisseurs",
  },
  boardCurrent: {
    ar: "الحالي",
    en: "Current",
    fr: "Actuel",
  },
  boardTargetShort: {
    ar: "الهدف",
    en: "Target",
    fr: "Objectif",
  },
  itemNoScandal: {
    ar: "لا فضائح — الحفاظ على نظافة الملفات",
    en: "No scandals — keep files clean",
    fr: "Pas de scandales — garder les dossiers propres",
  },
  itemNoScandalExplain: {
    ar: "عدم تفجير أي فضيحة كبرى (الشبهات لا تصل 100%)",
    en: "No major scandal (suspicion must not hit 100%)",
    fr: "Pas de scandale majeur (la suspicion ne doit pas atteindre 100%)",
  },
  boardScandalBadge: {
    ar: "فضيحة مسجلة هذا الموسم",
    en: "Scandal recorded this season",
    fr: "Scandale enregistré cette saison",
  },
};
// يملأ عناصر الاستبدال {v}/{n}/{d} بـ vars. أي مفتاح ناقص يبقى كما هو (ظهور واضح للخلل).
export const fillBoardText = (template, vars = {}) =>
  String(template).replace(/\{(\w+)\}/g, (m, k) =>
    vars[k] === undefined || vars[k] === null ? m : String(vars[k]),
  );

// نص جاهز للغة الواجهة الحالية — تستخدمه الشاشات (يُترجم قبل الحقن في DOM).
export const boardTextFor = (key, vars, language) => {
  const entry = BOARD_TEXTS[key];
  if (!entry) return key;
  const code = language === "en" ? "en" : language === "fr" ? "fr" : "ar";
  return fillBoardText(entry[code] ?? entry.ar, vars);
};

// نص عربي للادخار داخل الحفظة: البريد والرسائل تُخزَّن بالعربية دائمًا
// (الحفظة لا تتغير بتغير اللغة) ثم يترجمها طبقة العرض عند الرسم.
export const boardTextAr = (key, vars) => boardTextFor(key, vars, "ar");
export default BOARD_TEXTS;
