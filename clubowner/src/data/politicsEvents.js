import { P } from "./politicsCatalog.js";

const choice = (id, label, effects = {}) => ({
  id,
  label: P(...label),
  effects,
});

const EVENT_WEIGHTS = Object.freeze({
  opposition: 1.2,
  council: 1,
  integrity: 1.15,
  finance: 1,
  foreign: 0.9,
  campaign: 1.1,
  legacy: 0.8,
});

const event = (
  id,
  category,
  scope,
  title,
  prompt,
  choices,
  weight = EVENT_WEIGHTS[category] || 1,
) => ({
  id,
  category,
  scope,
  title: P(...title),
  prompt: P(...prompt),
  choices,
  weight,
  cooldownDays: 120,
});

// Forty-eight fictional, choice-driven political events. Every visible line is
// authored in Arabic, English, and French; no generated filler is used.
export const POLITICAL_EVENTS = Object.freeze([
  event(
    "assembly-audit",
    "opposition",
    "office",
    [
      "الجمعية تطلب تدقيقًا عاجلًا",
      "Assembly requests an urgent audit",
      "L’assemblée demande un audit urgent",
    ],
    [
      "تطالب أندية الجمعية بنشر الحسابات قبل التصويت على جدول الموسم.",
      "Assembly clubs demand published accounts before voting on the season calendar.",
      "Les clubs de l’assemblée réclament les comptes avant le vote du calendrier.",
    ],
    [
      choice(
        "publish",
        [
          "نشر الدفتر كاملًا",
          "Publish the full ledger",
          "Publier le registre complet",
        ],
        {
          integrity: 5,
          legitimacy: 3,
          oppositionPressure: -6,
          disclosure: true,
          cleanActions: 1,
        },
      ),
      choice(
        "delay",
        [
          "تأجيل النشر إلى ما بعد التصويت",
          "Delay publication until after the vote",
          "Reporter la publication après le vote",
        ],
        {
          integrity: -6,
          legitimacy: -3,
          oppositionPressure: 7,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "clubs-petition",
    "opposition",
    "office",
    [
      "عريضة الأندية تطالب بجلسة استماع",
      "Clubs petition for a hearing",
      "Les clubs réclament une audition",
    ],
    [
      "وقعت أندية من أكثر من تكتل عريضة بشأن تأخر الرد على مطالبها.",
      "Clubs from several blocs signed a petition over unanswered demands.",
      "Des clubs de plusieurs blocs ont signé une pétition sur leurs demandes restées sans réponse.",
    ],
    [
      choice(
        "hearing",
        [
          "فتح جلسة استماع علنية",
          "Hold a public hearing",
          "Ouvrir une audition publique",
        ],
        {
          legitimacy: 4,
          integrity: 2,
          oppositionPressure: -5,
          support: { bloc: "regional", delta: 3 },
        },
      ),
      choice(
        "dismiss",
        [
          "اعتبارها حملة انتخابية",
          "Call it an election stunt",
          "Y voir une manœuvre électorale",
        ],
        {
          legitimacy: -3,
          integrity: -2,
          oppositionPressure: 8,
          support: { bloc: "small", delta: -3 },
        },
      ),
    ],
  ),
  event(
    "confidence-rumor",
    "opposition",
    "office",
    [
      "شائعة عن اقتراح حجب ثقة",
      "No-confidence motion rumour",
      "Rumeur de motion de défiance",
    ],
    [
      "تتداول الكتل خبر إعداد اقتراح حجب ثقة، لكن لم يُودع اقتراح رسمي بعد.",
      "Blocs report a draft no-confidence motion, though none has been formally filed.",
      "Les blocs évoquent une motion de défiance en préparation, sans dépôt officiel.",
    ],
    [
      choice(
        "answer",
        [
          "دعوة المعارضة إلى نقاش مفتوح",
          "Invite the opposition to open talks",
          "Inviter l’opposition à un débat ouvert",
        ],
        {
          legitimacy: 3,
          oppositionPressure: -8,
          noConfidence: -15,
          integrity: 1,
        },
      ),
      choice(
        "bargain",
        [
          "تقديم تنازلات سرية للكتل",
          "Offer private concessions to blocs",
          "Proposer des concessions privées aux blocs",
        ],
        {
          legitimacy: -1,
          oppositionPressure: -5,
          integrity: -5,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "reform-group",
    "council",
    "any",
    [
      "مجموعة إصلاح تطلب مقاعد في المجلس",
      "Reform group seeks council seats",
      "Un groupe réformateur réclame des sièges au conseil",
    ],
    [
      "تطلب مجموعة من الأندية قواعد أوضح للمشاركة في لجان الاتحاد.",
      "A club reform group wants clearer rules for participation in association committees.",
      "Un groupe de clubs souhaite des règles plus claires pour participer aux commissions.",
    ],
    [
      choice(
        "commission",
        [
          "تشكيل لجنة مفتوحة المعايير",
          "Create a committee with open criteria",
          "Créer une commission aux critères publics",
        ],
        {
          integrity: 4,
          legitimacy: 3,
          cleanActions: 1,
          support: { bloc: "small", delta: 2 },
        },
      ),
      choice(
        "closed",
        [
          "حصر المقاعد في الحلفاء",
          "Reserve seats for allies",
          "Réserver les sièges aux alliés",
        ],
        {
          integrity: -6,
          legitimacy: -4,
          illicitActions: 1,
          support: { bloc: "big", delta: 2 },
        },
      ),
    ],
  ),
  event(
    "regional-alliance",
    "opposition",
    "office",
    [
      "تكتل إقليمي يلوح بالانسحاب",
      "Regional bloc threatens to walk out",
      "Un bloc régional menace de quitter la séance",
    ],
    [
      "يعترض تكتل إقليمي على تركّز القرارات في أندية القمة.",
      "A regional bloc objects to decision-making being concentrated among leading clubs.",
      "Un bloc régional conteste la concentration des décisions parmi les grands clubs.",
    ],
    [
      choice(
        "mediate",
        [
          "التفاوض على تمثيل متوازن",
          "Negotiate balanced representation",
          "Négocier une représentation équilibrée",
        ],
        {
          legitimacy: 3,
          oppositionPressure: -4,
          support: { bloc: "regional", delta: 4 },
          integrity: 1,
        },
      ),
      choice(
        "divide",
        [
          "استمالة ناديين لكسر التكتل",
          "Win over two clubs to split the bloc",
          "Rallier deux clubs pour diviser le bloc",
        ],
        {
          legitimacy: -2,
          oppositionPressure: -2,
          support: { bloc: "regional", delta: -2 },
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "opposition-spokesperson",
    "opposition",
    "office",
    [
      "المتحدث باسم المعارضة يطلب حق الرد",
      "Opposition spokesperson requests a reply",
      "Le porte-parole de l’opposition demande un droit de réponse",
    ],
    [
      "يريد المتحدث عرض ملاحظاته في نشرة الاتحاد الأسبوعية.",
      "The spokesperson wants to publish a response in the association’s weekly bulletin.",
      "Le porte-parole souhaite publier sa réponse dans le bulletin hebdomadaire.",
    ],
    [
      choice(
        "reply",
        [
          "منحه مساحة متساوية",
          "Give equal space",
          "Accorder un espace équitable",
        ],
        {
          legitimacy: 4,
          integrity: 3,
          oppositionPressure: -5,
          cleanActions: 1,
        },
      ),
      choice(
        "attack",
        [
          "منع النشر ومهاجمة المتحدث",
          "Block publication and attack the speaker",
          "Interdire la publication et attaquer le porte-parole",
        ],
        {
          legitimacy: -3,
          integrity: -7,
          oppositionPressure: 5,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "council-transparency",
    "council",
    "office",
    [
      "محضر المجلس يثير أسئلة",
      "Council minutes raise questions",
      "Le procès-verbal du conseil soulève des questions",
    ],
    [
      "تسربت ملاحظات متضاربة عن تصويت مغلق على قواعد المسابقة.",
      "Conflicting accounts emerged about a closed vote on competition rules.",
      "Des versions contradictoires circulent sur un vote à huis clos concernant le règlement.",
    ],
    [
      choice(
        "minutes",
        [
          "نشر المحضر والأصوات",
          "Publish the minutes and ballots",
          "Publier le procès-verbal et les votes",
        ],
        { integrity: 5, legitimacy: 3, disclosure: true, cleanActions: 1 },
      ),
      choice(
        "seal",
        [
          "إبقاء المحضر سريًا",
          "Keep the minutes sealed",
          "Garder le procès-verbal confidentiel",
        ],
        { integrity: -5, legitimacy: -3, oppositionPressure: 4 },
      ),
    ],
  ),
  event(
    "constitutional-petition",
    "council",
    "office",
    [
      "عريضة تطالب بضمانات دستورية",
      "Petition calls for constitutional safeguards",
      "Une pétition réclame des garanties constitutionnelles",
    ],
    [
      "تطلب مجموعة من الأندية ضمان مراجعة مستقلة لحدود الولايات.",
      "A group of clubs requests an independent review of term limits.",
      "Un groupe de clubs demande un examen indépendant des limites de mandat.",
    ],
    [
      choice(
        "review",
        [
          "إحالة الطلب إلى لجنة مستقلة",
          "Refer it to an independent panel",
          "Saisir une commission indépendante",
        ],
        {
          integrity: 4,
          legitimacy: 3,
          support: { bloc: "regional", delta: 2 },
        },
      ),
      choice(
        "block",
        [
          "رفض النقاش قبل نهاية ولايتك",
          "Reject debate until your term ends",
          "Refuser le débat jusqu’à la fin du mandat",
        ],
        { integrity: -4, legitimacy: -5, oppositionPressure: 5 },
      ),
    ],
  ),
  event(
    "sports-council-inquiry",
    "opposition",
    "office",
    [
      "المجلس الرياضي يطلب توضيحًا",
      "Sports council asks for clarification",
      "Le conseil sportif demande des précisions",
    ],
    [
      "طلب المجلس الرياضي تفسيرًا علنيًا لتأجيل قرار يخص عدة أندية.",
      "The sports council asks why a multi-club decision was delayed.",
      "Le conseil sportif demande pourquoi une décision concernant plusieurs clubs a été reportée.",
    ],
    [
      choice(
        "explain",
        [
          "نشر الأسباب والموعد الجديد",
          "Publish the reasons and a new date",
          "Publier les motifs et une nouvelle échéance",
        ],
        { legitimacy: 3, integrity: 3, oppositionPressure: -3 },
      ),
      choice(
        "deflect",
        [
          "إلقاء اللوم على الموظفين",
          "Blame the staff",
          "Rejeter la faute sur le personnel",
        ],
        { legitimacy: -3, integrity: -4, oppositionPressure: 3 },
      ),
    ],
  ),
  event(
    "minority-clubs",
    "council",
    "office",
    [
      "الأندية الصغيرة تطالب بحق التصويت",
      "Smaller clubs demand a vote",
      "Les petits clubs réclament un droit de vote",
    ],
    [
      "تقول أندية صغيرة إن مشاورات الجدول لا تمنحها وقتًا كافيًا.",
      "Smaller clubs say calendar consultations give them too little time to respond.",
      "Les petits clubs estiment que la consultation sur le calendrier leur laisse trop peu de temps.",
    ],
    [
      choice(
        "extend",
        [
          "تمديد المشاورة أسبوعين",
          "Extend consultation by two weeks",
          "Prolonger la consultation de deux semaines",
        ],
        { legitimacy: 3, integrity: 2, support: { bloc: "small", delta: 5 } },
      ),
      choice(
        "close",
        [
          "إغلاق التصويت فورًا",
          "Close the vote immediately",
          "Clore le vote immédiatement",
        ],
        {
          legitimacy: -4,
          oppositionPressure: 5,
          support: { bloc: "small", delta: -5 },
        },
      ),
    ],
  ),
  event(
    "procurement-disclosure",
    "integrity",
    "office",
    [
      "مناقصة تجهيزات تحتاج إلى إفصاح",
      "Equipment tender needs disclosure",
      "L’appel d’offres pour le matériel doit être publié",
    ],
    [
      "تسأل الأندية عن معايير اختيار المورد في مناقصة تجهيزات الاتحاد.",
      "Clubs ask how the association selected an equipment supplier.",
      "Les clubs demandent comment le fournisseur de matériel a été choisi.",
    ],
    [
      choice(
        "publish",
        [
          "نشر العروض ومحضر الاختيار",
          "Publish bids and the selection record",
          "Publier les offres et le procès-verbal",
        ],
        { integrity: 5, legitimacy: 2, cleanActions: 1, disclosure: true },
      ),
      choice(
        "shortcut",
        [
          "تمرير المورد المفضل بلا مراجعة",
          "Approve the preferred supplier without review",
          "Valider le fournisseur préféré sans examen",
        ],
        { integrity: -8, illicitActions: 1, oppositionPressure: 4 },
      ),
    ],
  ),
  event(
    "grant-favoritism",
    "integrity",
    "office",
    [
      "شكوى عن منحة غير متكافئة",
      "Complaint over an uneven grant",
      "Plainte concernant une aide inégale",
    ],
    [
      "يدعي نادٍ أن منحة التطوير لم توزع وفق المعايير المنشورة.",
      "A club claims a development grant ignored the published criteria.",
      "Un club affirme qu’une aide au développement n’a pas respecté les critères publiés.",
    ],
    [
      choice(
        "recheck",
        [
          "إعادة تقييم الطلبات علنًا",
          "Reassess applications publicly",
          "Réévaluer publiquement les demandes",
        ],
        { integrity: 4, legitimacy: 3, support: { bloc: "small", delta: 3 } },
      ),
      choice(
        "protect",
        [
          "حماية قرار اللجنة دون نشر الملف",
          "Protect the committee without releasing its file",
          "Protéger la commission sans publier son dossier",
        ],
        { integrity: -5, legitimacy: -2, oppositionPressure: 4 },
      ),
    ],
  ),
  event(
    "staff-whistleblower",
    "integrity",
    "office",
    [
      "موظف يكشف خللًا في المشتريات",
      "Staff member reports a procurement flaw",
      "Un employé signale une irrégularité d’achat",
    ],
    [
      "قدم موظف مستندات عن تقسيم عقد كبير لتجاوز مراجعة التكاليف.",
      "A staff member submitted evidence that a large contract was split to bypass review.",
      "Un employé a fourni des preuves qu’un gros contrat a été fractionné pour éviter un contrôle.",
    ],
    [
      choice(
        "protect",
        [
          "حماية المبلغ وفتح مراجعة",
          "Protect the whistleblower and review the file",
          "Protéger le lanceur d’alerte et examiner le dossier",
        ],
        {
          integrity: 6,
          legitimacy: 2,
          cleanActions: 1,
          oppositionPressure: -2,
        },
      ),
      choice(
        "silence",
        [
          "نقل الموظف وإغلاق الملف",
          "Transfer the employee and close the file",
          "Muter l’employé et classer le dossier",
        ],
        {
          integrity: -9,
          legitimacy: -4,
          illicitActions: 1,
          oppositionPressure: 5,
        },
      ),
    ],
  ),
  event(
    "leaked-conflict",
    "integrity",
    "office",
    [
      "تسريب يكشف تضارب مصالح محتملًا",
      "Leak points to a possible conflict of interest",
      "Une fuite révèle un possible conflit d’intérêts",
    ],
    [
      "تربط وثيقة متداولة بين قرار مالي ومصلحة لنادٍ يخص أحد المقربين.",
      "A circulating document links a financial decision to a close associate’s club.",
      "Un document qui circule lie une décision financière au club d’un proche.",
    ],
    [
      choice(
        "declare",
        [
          "إعلان الصلة والتنحي عن المراجعة",
          "Disclose the link and recuse yourself",
          "Déclarer le lien et se récuser",
        ],
        { integrity: 5, legitimacy: 2, cleanActions: 1 },
      ),
      choice(
        "deny",
        [
          "إنكار الصلة وطلب حذف الوثيقة",
          "Deny the link and seek removal of the file",
          "Nier le lien et demander le retrait du document",
        ],
        { integrity: -10, legitimacy: -5, illicitActions: 1 },
      ),
    ],
  ),
  event(
    "discipline-favoritism",
    "integrity",
    "office",
    [
      "اتهام بتفاوت العقوبات",
      "Allegation of uneven discipline",
      "Accusation de sanctions inégales",
    ],
    [
      "تقارن الأندية بين عقوبتين متشابهتين صدرتا عن لجنة الانضباط.",
      "Clubs compare two similar cases that received different disciplinary sanctions.",
      "Les clubs comparent deux affaires similaires qui ont reçu des sanctions différentes.",
    ],
    [
      choice(
        "appeal",
        [
          "إحالة القرار إلى استئناف مستقل",
          "Send the ruling to an independent appeal",
          "Saisir une instance d’appel indépendante",
        ],
        { integrity: 4, legitimacy: 3, committeeMorale: 2 },
      ),
      choice(
        "defend",
        [
          "الدفاع عن القرار دون نشر أسبابه",
          "Defend the ruling without publishing reasons",
          "Défendre la décision sans en publier les motifs",
        ],
        { integrity: -5, legitimacy: -3, committeeMorale: -8 },
      ),
    ],
  ),
  event(
    "sponsor-envelope",
    "integrity",
    "office",
    [
      "راعي يرسل هدية إلى مكتبك",
      "Sponsor sends a gift to your office",
      "Un sponsor envoie un cadeau à votre bureau",
    ],
    [
      "ممثل راعٍ ترك ظرفًا باهظ القيمة قبل اجتماع تجديد العقد.",
      "A sponsor representative left a valuable gift before a contract-renewal meeting.",
      "Un représentant du sponsor a laissé un cadeau de valeur avant une réunion de renouvellement.",
    ],
    [
      choice(
        "return",
        [
          "إعادة الهدية وتسجيل الواقعة",
          "Return the gift and log the incident",
          "Rendre le cadeau et consigner l’incident",
        ],
        { integrity: 5, legitimacy: 2, cleanActions: 1 },
      ),
      choice(
        "keep",
        [
          "قبول الهدية مقابل تسريع التجديد",
          "Keep the gift in exchange for a fast renewal",
          "Garder le cadeau contre un renouvellement accéléré",
        ],
        {
          integrity: -12,
          legitimacy: -4,
          illicitActions: 1,
          oppositionPressure: 5,
        },
      ),
    ],
  ),
  event(
    "referee-gift",
    "integrity",
    "office",
    [
      "هدية مشبوهة لمسؤول تحكيم",
      "Suspicious gift to a referee official",
      "Cadeau suspect à un responsable de l’arbitrage",
    ],
    [
      "يبلغ مسؤول نزيه عن هدية مجهولة وصلت قبل تعيين حكام مباراة مهمة.",
      "An honest official reports an anonymous gift before an important referee appointment.",
      "Un responsable intègre signale un cadeau anonyme avant une désignation importante.",
    ],
    [
      choice(
        "investigate",
        [
          "تجميد التعيين وفحص السجل",
          "Pause the appointment and review the record",
          "Suspendre la désignation et examiner le dossier",
        ],
        { integrity: 5, committeeMorale: 5, oppositionPressure: -2 },
      ),
      choice(
        "ignore",
        [
          "إتمام التعيين لتجنب التأجيل",
          "Proceed to avoid a delay",
          "Maintenir la désignation pour éviter un retard",
        ],
        { integrity: -8, committeeMorale: -10, illicitActions: 1 },
      ),
    ],
  ),
  event(
    "travel-receipts",
    "integrity",
    "office",
    [
      "إيصالات سفر مفقودة",
      "Missing travel receipts",
      "Des justificatifs de déplacement manquent",
    ],
    [
      "لم يقدم وفد الاتحاد إيصالات كاملًا عن رحلة خارجية حديثة.",
      "The association delegation did not submit complete receipts for a recent overseas trip.",
      "La délégation de la fédération n’a pas remis tous les justificatifs d’un récent déplacement à l’étranger.",
    ],
    [
      choice(
        "reconcile",
        [
          "نشر المصروفات وإعادة الفائض",
          "Publish expenses and return the surplus",
          "Publier les dépenses et restituer le solde",
        ],
        {
          integrity: 4,
          legitimacy: 2,
          cleanActions: 1,
          treasury: { direction: "credit", amount: 500000 },
        },
      ),
      choice(
        "writeoff",
        [
          "شطب الفروق كتكاليف إدارية",
          "Write off the difference as administration",
          "Passer l’écart en frais administratifs",
        ],
        {
          integrity: -5,
          illicitActions: 1,
          treasury: { direction: "debit", amount: 500000 },
        },
      ),
    ],
  ),
  event(
    "data-privacy",
    "integrity",
    "office",
    [
      "ملف أعضاء سُرب إلى الصحافة",
      "Members’ file leaked to the press",
      "Un fichier des membres a fuité dans la presse",
    ],
    [
      "تحتوي النسخة المسربة على بيانات شخصية لأعضاء أندية الجمعية.",
      "The leaked file contains personal details about association club members.",
      "Le fichier divulgué contient des données personnelles de membres des clubs.",
    ],
    [
      choice(
        "notify",
        [
          "إخطار المتضررين وفتح مراجعة أمنية",
          "Notify those affected and review security",
          "Prévenir les personnes concernées et auditer la sécurité",
        ],
        { legitimacy: 2, integrity: 5, cleanActions: 1 },
      ),
      choice(
        "conceal",
        [
          "إخفاء التسريب حتى يهدأ الخبر",
          "Hide the leak until the story fades",
          "Cacher la fuite jusqu’à ce que l’affaire retombe",
        ],
        {
          legitimacy: -5,
          integrity: -8,
          illicitActions: 1,
          oppositionPressure: 4,
        },
      ),
    ],
  ),
  event(
    "ballot-security",
    "council",
    "any",
    [
      "مخاوف بشأن أمن التصويت",
      "Concerns over ballot security",
      "Des inquiétudes sur la sécurité du scrutin",
    ],
    [
      "طلب مراقبون تدقيقًا تقنيًا في سجل أصوات اجتماع الجمعية المقبل.",
      "Observers requested a technical audit of the next assembly ballot record.",
      "Des observateurs demandent un audit technique des prochains votes de l’assemblée.",
    ],
    [
      choice(
        "observer",
        [
          "السماح بمراقبين مستقلين",
          "Allow independent observers",
          "Autoriser des observateurs indépendants",
        ],
        { integrity: 4, legitimacy: 4, cleanActions: 1 },
      ),
      choice(
        "internal",
        [
          "قصر الفحص على فريقك",
          "Limit the audit to your own team",
          "Limiter le contrôle à votre équipe",
        ],
        { integrity: -4, legitimacy: -3, oppositionPressure: 3 },
      ),
    ],
  ),
  event(
    "broadcast-rights",
    "finance",
    "office",
    [
      "عرض لحقوق البث يحتاج إلى حسم",
      "Broadcast-rights offer needs a decision",
      "Une offre sur les droits TV doit être tranchée",
    ],
    [
      "قدم موزع عرضًا أعلى مقابل إغلاق تفاصيل التوزيع عن الأندية.",
      "A distributor offered more money in exchange for keeping distribution details from clubs.",
      "Un diffuseur offre davantage en échange de la confidentialité sur la répartition.",
    ],
    [
      choice(
        "open",
        [
          "قبول العرض مع نشر المعادلة",
          "Accept with a published formula",
          "Accepter avec une formule publiée",
        ],
        {
          treasury: { direction: "credit", amount: 3000000 },
          integrity: 4,
          legitimacy: 2,
          disclosure: true,
        },
      ),
      choice(
        "secret",
        [
          "قبول العرض السري",
          "Accept the confidential offer",
          "Accepter l’offre confidentielle",
        ],
        {
          treasury: { direction: "credit", amount: 5000000 },
          integrity: -8,
          legitimacy: -4,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "solidarity-grant",
    "finance",
    "office",
    [
      "أندية مهددة تطلب دعمًا تضامنيًا",
      "At-risk clubs request solidarity aid",
      "Des clubs en difficulté demandent une aide de solidarité",
    ],
    [
      "تواجه أندية صغيرة فجوة سيولة قبل موعد تسجيل اللاعبين.",
      "Smaller clubs face a cash-flow gap before player registration.",
      "De petits clubs manquent de liquidités avant l’enregistrement des joueurs.",
    ],
    [
      choice(
        "targeted",
        [
          "منح مشروطة بمعايير معلنة",
          "Issue grants under public criteria",
          "Accorder des aides selon des critères publics",
        ],
        {
          treasury: { direction: "debit", amount: 1500000 },
          legitimacy: 4,
          support: { bloc: "small", delta: 4 },
          cleanActions: 1,
        },
      ),
      choice(
        "friends",
        [
          "توزيع سريع على الحلفاء",
          "Distribute quickly to allies",
          "Distribuer rapidement aux alliés",
        ],
        {
          treasury: { direction: "debit", amount: 1500000 },
          legitimacy: -3,
          integrity: -5,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "stadium-fund",
    "finance",
    "office",
    [
      "صندوق الملاعب لا يغطي كل الطلبات",
      "Stadium fund cannot cover every request",
      "Le fonds des stades ne peut couvrir toutes les demandes",
    ],
    [
      "وصلت طلبات تطوير أكثر من المبلغ المرصود في صندوق الاتحاد.",
      "Development requests exceed the amount reserved in the association fund.",
      "Les demandes de rénovation dépassent le montant réservé par la fédération.",
    ],
    [
      choice(
        "criteria",
        [
          "ترتيب المشروعات بحسب الحاجة",
          "Rank projects by need",
          "Classer les projets selon les besoins",
        ],
        {
          treasury: { direction: "debit", amount: 2000000 },
          legitimacy: 3,
          support: { bloc: "regional", delta: 3 },
        },
      ),
      choice(
        "headline",
        [
          "تمويل مشروع النادي الأشهر",
          "Fund the most famous club’s project",
          "Financer le projet du club le plus médiatisé",
        ],
        {
          treasury: { direction: "debit", amount: 2000000 },
          integrity: -6,
          legitimacy: -3,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "club-debt",
    "finance",
    "office",
    [
      "اقتراح لإعادة جدولة ديون الأندية",
      "Proposal to reschedule club debts",
      "Proposition de rééchelonnement des dettes",
    ],
    [
      "تقترح مجموعة من الأندية خطة سداد موحدة لتفادي إيقاف التسجيل.",
      "A group of clubs proposes a common repayment plan to avoid registration bans.",
      "Un groupe de clubs propose un échéancier commun pour éviter des interdictions d’enregistrement.",
    ],
    [
      choice(
        "rules",
        [
          "خطة منشورة بضمانات متساوية",
          "Publish a plan with equal safeguards",
          "Publier un plan avec des garanties égales",
        ],
        { legitimacy: 3, integrity: 2, support: { bloc: "small", delta: 2 } },
      ),
      choice(
        "waive",
        [
          "إعفاء حليف من جزء من الدين",
          "Forgive part of an ally’s debt",
          "Effacer une partie de la dette d’un allié",
        ],
        {
          treasury: { direction: "debit", amount: 1000000 },
          legitimacy: -3,
          integrity: -7,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "sponsor-crisis",
    "finance",
    "office",
    [
      "راعٍ يهدد بفسخ العقد",
      "Sponsor threatens to terminate its deal",
      "Un sponsor menace de rompre son contrat",
    ],
    [
      "اعترض الراعي على قواعد الشفافية الجديدة وطلب استثناءً خاصًا.",
      "A sponsor objected to new transparency rules and requested a special exemption.",
      "Un sponsor conteste les règles de transparence et demande une exception.",
    ],
    [
      choice(
        "equal",
        [
          "تطبيق القواعد على جميع الشركاء",
          "Apply the rules to every partner",
          "Appliquer les règles à tous les partenaires",
        ],
        {
          legitimacy: 3,
          integrity: 4,
          support: { bloc: "regional", delta: 2 },
        },
      ),
      choice(
        "exempt",
        [
          "منح استثناء لضمان استمرار المال",
          "Grant an exemption to keep the money",
          "Accorder une exception pour préserver le financement",
        ],
        {
          treasury: { direction: "credit", amount: 2000000 },
          integrity: -7,
          legitimacy: -3,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "youth-academies",
    "finance",
    "office",
    [
      "الأكاديميات تطالب بحصة من الميزانية",
      "Academies ask for a budget share",
      "Les académies réclament une part du budget",
    ],
    [
      "تطلب الأندية الصغيرة تمويلًا مباشرًا لمرافق تطوير الناشئين.",
      "Smaller clubs request direct funding for youth-development facilities.",
      "Les petits clubs demandent un financement direct pour leurs centres de formation.",
    ],
    [
      choice(
        "match",
        [
          "تمويل مشترك بتقارير سنوية",
          "Co-fund with annual reports",
          "Co-financer avec rapports annuels",
        ],
        {
          treasury: { direction: "debit", amount: 1800000 },
          legitimacy: 4,
          support: { bloc: "small", delta: 4 },
        },
      ),
      choice(
        "promise",
        [
          "إعلان وعد بلا بند في الميزانية",
          "Announce a promise without a budget line",
          "Promettre sans ligne budgétaire",
        ],
        {
          legitimacy: -2,
          oppositionPressure: 3,
          support: { bloc: "small", delta: -2 },
        },
      ),
    ],
  ),
  event(
    "womens-football",
    "finance",
    "office",
    [
      "الأندية تطالب بدعم كرة القدم النسائية",
      "Clubs request support for women’s football",
      "Les clubs demandent un soutien au football féminin",
    ],
    [
      "قدمت الأندية خطة لتوسيع المسابقة النسائية وتحسين الملاعب.",
      "Clubs proposed expanding the women’s competition and improving facilities.",
      "Les clubs proposent d’élargir la compétition féminine et d’améliorer les installations.",
    ],
    [
      choice(
        "fund",
        [
          "تخصيص منحة بداية معلنة",
          "Create a published starter grant",
          "Créer une aide de lancement publiée",
        ],
        {
          treasury: { direction: "debit", amount: 1200000 },
          legitimacy: 4,
          support: { bloc: "regional", delta: 3 },
          cleanActions: 1,
        },
      ),
      choice(
        "defer",
        [
          "تأجيل الخطة إلى الموسم القادم",
          "Defer the plan until next season",
          "Reporter le projet à la saison prochaine",
        ],
        { legitimacy: -1, oppositionPressure: 2 },
      ),
    ],
  ),
  event(
    "league-expansion",
    "finance",
    "office",
    [
      "مقترح لتوسيع المسابقة",
      "Proposal to expand the competition",
      "Proposition d’élargir la compétition",
    ],
    [
      "قد يرفع توسيع الدوري الإيرادات، لكنه يضغط على السفر والروزنامة.",
      "Expanding the league could raise revenue but strain travel and the calendar.",
      "L’élargissement du championnat pourrait accroître les recettes, mais alourdir les déplacements et le calendrier.",
    ],
    [
      choice(
        "study",
        [
          "طلب دراسة أثر مستقلة",
          "Commission an independent impact study",
          "Commander une étude d’impact indépendante",
        ],
        {
          treasury: { direction: "debit", amount: 500000 },
          integrity: 2,
          legitimacy: 2,
          committeeMorale: 2,
        },
      ),
      choice(
        "rush",
        [
          "إقرار التوسيع فورًا",
          "Approve expansion immediately",
          "Approuver l’élargissement immédiatement",
        ],
        {
          legitimacy: -2,
          oppositionPressure: 3,
          support: { bloc: "small", delta: 2 },
        },
      ),
    ],
  ),
  event(
    "club-licensing",
    "finance",
    "office",
    [
      "معايير الترخيص تواجه اعتراضًا",
      "Licensing standards face objections",
      "Les critères de licence sont contestés",
    ],
    [
      "تقول أندية إن موعد تطبيق المعايير الجديدة لا يراعي تفاوت البنية التحتية.",
      "Clubs say the new standards’ deadline ignores unequal infrastructure.",
      "Des clubs estiment que l’échéance des nouveaux critères ignore les inégalités d’infrastructures.",
    ],
    [
      choice(
        "phase",
        [
          "تطبيق تدريجي مع مساعدة فنية",
          "Phase in the rules with technical help",
          "Appliquer progressivement avec un soutien technique",
        ],
        {
          treasury: { direction: "debit", amount: 900000 },
          legitimacy: 3,
          integrity: 2,
          support: { bloc: "small", delta: 3 },
        },
      ),
      choice(
        "strict",
        [
          "فرض الموعد نفسه على الجميع",
          "Enforce one deadline for all",
          "Imposer la même échéance à tous",
        ],
        {
          legitimacy: -3,
          oppositionPressure: 4,
          support: { bloc: "small", delta: -3 },
        },
      ),
    ],
  ),
  event(
    "association-reserve",
    "finance",
    "office",
    [
      "الخزينة تطلب سياسة احتياطي",
      "Treasury needs a reserve policy",
      "La trésorerie a besoin d’une réserve",
    ],
    [
      "يقترح المدقق تحديد حد أدنى يحمي الاتحاد من تذبذب الإيرادات.",
      "The auditor proposed a minimum reserve to protect against revenue volatility.",
      "L’auditeur propose une réserve minimale contre la volatilité des recettes.",
    ],
    [
      choice(
        "reserve",
        [
          "اعتماد احتياطي معلن",
          "Adopt a published reserve",
          "Adopter une réserve publiée",
        ],
        {
          integrity: 4,
          legitimacy: 2,
          disclosure: true,
          treasury: { direction: "debit", amount: 750000 },
        },
      ),
      choice(
        "spend",
        [
          "صرف الفائض على مكافآت عاجلة",
          "Spend the surplus on urgent bonuses",
          "Dépenser le surplus en primes urgentes",
        ],
        {
          legitimacy: -1,
          integrity: -4,
          illicitActions: 1,
          treasury: { direction: "debit", amount: 750000 },
        },
      ),
    ],
  ),
  event(
    "continental-congress",
    "foreign",
    "office",
    [
      "دعوة إلى مؤتمر قاري",
      "Invitation to a continental congress",
      "Invitation à un congrès continental",
    ],
    [
      "تطلب جهة قارية عرض خطة الاتحاد في مؤتمر الحوكمة القادم.",
      "A continental body invited the association to present its governance plan.",
      "Une instance continentale invite la fédération à présenter son plan de gouvernance.",
    ],
    [
      choice(
        "present",
        [
          "عرض خطة شفافة بوفد محدود",
          "Present a transparent plan with a small delegation",
          "Présenter un plan transparent avec une délégation réduite",
        ],
        {
          relation: { organizationId: "CAF", delta: 5 },
          influence: 3,
          legitimacy: 2,
          treasury: { direction: "debit", amount: 600000 },
        },
      ),
      choice(
        "luxury",
        [
          "إرسال وفد كبير بلا تقرير",
          "Send a large delegation without a report",
          "Envoyer une grande délégation sans rapport",
        ],
        {
          relation: { organizationId: "CAF", delta: 2 },
          influence: 2,
          integrity: -5,
          illicitActions: 1,
          treasury: { direction: "debit", amount: 1800000 },
        },
      ),
    ],
  ),
  event(
    "fifa-governance",
    "foreign",
    "office",
    [
      "مشاورات حوكمة دولية",
      "International governance consultation",
      "Consultation internationale sur la gouvernance",
    ],
    [
      "دعت جهة دولية الاتحادات إلى اقتراح قواعد للإفصاح وتضارب المصالح.",
      "An international body invited associations to propose disclosure and conflict-of-interest rules.",
      "Une instance internationale consulte les fédérations sur la transparence et les conflits d’intérêts.",
    ],
    [
      choice(
        "contribute",
        [
          "تقديم قواعد قابلة للتدقيق",
          "Submit auditable standards",
          "Proposer des règles vérifiables",
        ],
        {
          relation: { organizationId: "FIFA", delta: 4 },
          influence: 4,
          integrity: 3,
          cleanActions: 1,
        },
      ),
      choice(
        "withhold",
        [
          "الامتناع عن الالتزام بالمراجعة",
          "Avoid committing to review",
          "Éviter tout engagement de contrôle",
        ],
        {
          relation: { organizationId: "FIFA", delta: -3 },
          influence: -1,
          integrity: -3,
        },
      ),
    ],
  ),
  event(
    "youth-exchange",
    "foreign",
    "office",
    [
      "برنامج تبادل للناشئين",
      "Youth exchange programme",
      "Programme d’échange pour les jeunes",
    ],
    [
      "اقترحت جهة إقليمية تبادلًا تدريبيًا بين أكاديميات الأندية.",
      "A regional body proposed a coaching exchange between club academies.",
      "Une instance régionale propose un échange de formation entre académies.",
    ],
    [
      choice(
        "open",
        [
          "فتح البرنامج لكل الأندية المؤهلة",
          "Open the programme to all eligible clubs",
          "Ouvrir le programme à tous les clubs admissibles",
        ],
        {
          relation: { organizationId: "AFC", delta: 3 },
          influence: 2,
          support: { bloc: "small", delta: 2 },
          treasury: { direction: "debit", amount: 800000 },
        },
      ),
      choice(
        "select",
        [
          "اختيار أندية الحلفاء فقط",
          "Select allied clubs only",
          "Choisir uniquement les clubs alliés",
        ],
        {
          relation: { organizationId: "AFC", delta: 1 },
          influence: 1,
          integrity: -5,
          illicitActions: 1,
          treasury: { direction: "debit", amount: 800000 },
        },
      ),
    ],
  ),
  event(
    "hosting-debate",
    "foreign",
    "office",
    [
      "استضافة بطولة تثير نقاشًا",
      "Hosting a tournament sparks debate",
      "L’accueil d’un tournoi suscite un débat",
    ],
    [
      "يختلف المجلس حول تكلفة تنظيم بطولة دولية ومكاسبها للأندية.",
      "The council is split over the cost and club benefits of an international tournament.",
      "Le conseil débat du coût et des retombées d’un tournoi international pour les clubs.",
    ],
    [
      choice(
        "bid",
        [
          "إعداد ملف بميزانية معلنة",
          "Prepare a bid with a public budget",
          "Préparer un dossier avec budget public",
        ],
        {
          relation: { organizationId: "CAF", delta: 3 },
          influence: 2,
          legitimacy: 2,
          treasury: { direction: "debit", amount: 1000000 },
        },
      ),
      choice(
        "rush",
        [
          "تقديم الملف قبل اكتمال الحسابات",
          "File before the accounts are ready",
          "Déposer le dossier avant la fin des comptes",
        ],
        {
          relation: { organizationId: "CAF", delta: 1 },
          influence: 1,
          integrity: -5,
          treasury: { direction: "debit", amount: 1500000 },
        },
      ),
    ],
  ),
  event(
    "executive-seat-campaign",
    "foreign",
    "office",
    [
      "مقعد تنفيذي دولي شاغر",
      "International executive seat opens",
      "Un siège exécutif international se libère",
    ],
    [
      "أبلغت منظمة دولية الاتحاد بفتح باب الترشح لعضويتها التنفيذية.",
      "An international body announced nominations for its executive board.",
      "Une instance internationale ouvre les candidatures à son conseil exécutif.",
    ],
    [
      choice(
        "platform",
        [
          "نشر برنامج إصلاح وترشح",
          "Publish a reform platform and run",
          "Publier un programme de réforme et candidater",
        ],
        {
          relation: { organizationId: "FIFA", delta: 3 },
          influence: 4,
          legitimacy: 2,
          integrity: 2,
          treasury: { direction: "debit", amount: 700000 },
        },
      ),
      choice(
        "trade",
        [
          "مبادلة التأييد بوعود خاصة",
          "Trade support for private promises",
          "Échanger des soutiens contre des promesses privées",
        ],
        {
          relation: { organizationId: "FIFA", delta: 2 },
          influence: 5,
          integrity: -8,
          illicitActions: 1,
          treasury: { direction: "debit", amount: 700000 },
        },
      ),
    ],
  ),
  event(
    "sanctions-dialogue",
    "foreign",
    "office",
    [
      "خلاف على عقوبة عابرة للحدود",
      "Cross-border sanction dispute",
      "Litige sur une sanction transfrontalière",
    ],
    [
      "اعترض نادٍ شريك على عقوبة تؤثر في انتقال لاعب بين اتحادين.",
      "A partner club challenged a sanction affecting a player transfer between associations.",
      "Un club partenaire conteste une sanction qui affecte un transfert entre deux fédérations.",
    ],
    [
      choice(
        "mediate",
        [
          "طلب وساطة موثقة",
          "Request documented mediation",
          "Demander une médiation documentée",
        ],
        {
          relation: { organizationId: "UEFA", delta: 3 },
          legitimacy: 2,
          integrity: 2,
          influence: 2,
        },
      ),
      choice(
        "threaten",
        [
          "التلويح بقطع العلاقات",
          "Threaten to cut relations",
          "Menacer de rompre les relations",
        ],
        {
          relation: { organizationId: "UEFA", delta: -5 },
          legitimacy: -2,
          oppositionPressure: 2,
        },
      ),
    ],
  ),
  event(
    "refereeing-observers",
    "foreign",
    "office",
    [
      "مراقبون دوليون للتحكيم",
      "International refereeing observers",
      "Observateurs internationaux de l’arbitrage",
    ],
    [
      "عرضت جهة قارية إرسال مراقبين لتقييم جودة التحكيم المحلي.",
      "A continental body offered observers to assess local refereeing.",
      "Une instance continentale propose des observateurs pour évaluer l’arbitrage local.",
    ],
    [
      choice(
        "welcome",
        [
          "قبول المراقبة ونشر النتائج",
          "Welcome observers and publish results",
          "Accueillir les observateurs et publier leurs résultats",
        ],
        {
          relation: { organizationId: "CAF", delta: 4 },
          influence: 2,
          integrity: 3,
          committeeMorale: 3,
        },
      ),
      choice(
        "refuse",
        [
          "رفض المراقبة لحماية السمعة",
          "Decline to protect the association’s image",
          "Refuser pour protéger l’image de la fédération",
        ],
        {
          relation: { organizationId: "CAF", delta: -4 },
          integrity: -4,
          committeeMorale: -5,
        },
      ),
    ],
  ),
  event(
    "sports-science",
    "foreign",
    "office",
    [
      "شراكة دولية للطب الرياضي",
      "International sports-science partnership",
      "Partenariat international en sciences du sport",
    ],
    [
      "تقترح جامعة شريكة تبادل خبرات للوقاية من إصابات اللاعبين.",
      "A partner university proposed sharing expertise on player injury prevention.",
      "Une université partenaire propose un échange d’expertise sur la prévention des blessures.",
    ],
    [
      choice(
        "research",
        [
          "تمويل دراسة مفتوحة للأندية",
          "Fund open research for clubs",
          "Financer une étude ouverte aux clubs",
        ],
        {
          relation: { organizationId: "AFC", delta: 2 },
          influence: 2,
          legitimacy: 2,
          treasury: { direction: "debit", amount: 900000 },
        },
      ),
      choice(
        "exclusive",
        [
          "حصر المنفعة في أندية مختارة",
          "Restrict benefits to selected clubs",
          "Réserver les bénéfices à certains clubs",
        ],
        {
          relation: { organizationId: "AFC", delta: 1 },
          influence: 1,
          integrity: -4,
          support: { bloc: "small", delta: -2 },
          treasury: { direction: "debit", amount: 900000 },
        },
      ),
    ],
  ),
  event(
    "solidarity-border",
    "foreign",
    "office",
    [
      "اتحادات جوار تطلب تضامنًا",
      "Neighbouring associations request solidarity",
      "Des fédérations voisines demandent la solidarité",
    ],
    [
      "تعرضت مسابقة إقليمية لأزمة ملاعب، وطلبت الاتحادات الشريكة دعمًا مؤقتًا.",
      "A regional competition faces a venue crisis, and partner associations requested temporary help.",
      "Une compétition régionale manque de terrains et les fédérations partenaires demandent une aide temporaire.",
    ],
    [
      choice(
        "share",
        [
          "توفير منشآت بشروط معلنة",
          "Share facilities under published terms",
          "Partager les installations selon des règles publiques",
        ],
        {
          relation: { organizationId: "CONCACAF", delta: 4 },
          influence: 3,
          legitimacy: 2,
        },
      ),
      choice(
        "charge",
        [
          "فرض رسوم استثنائية على الشركاء",
          "Charge partners an exceptional fee",
          "Facturer des frais exceptionnels aux partenaires",
        ],
        {
          relation: { organizationId: "CONCACAF", delta: -4 },
          influence: -1,
          legitimacy: -2,
        },
      ),
    ],
  ),
  event(
    "continental-format",
    "foreign",
    "office",
    [
      "مقترح لتغيير صيغة بطولة قارية",
      "Proposal to change a continental format",
      "Proposition de modifier le format continental",
    ],
    [
      "الاتحادات طلبت رأي الأندية في صيغة جديدة للمسابقة القارية.",
      "Associations asked clubs to comment on a new continental competition format.",
      "Les fédérations consultent les clubs sur un nouveau format continental.",
    ],
    [
      choice(
        "consult",
        [
          "تنظيم مشاورة متعددة اللغات",
          "Run a multilingual consultation",
          "Organiser une consultation multilingue",
        ],
        {
          relation: { organizationId: "CAF", delta: 3 },
          influence: 2,
          legitimacy: 3,
          support: { bloc: "regional", delta: 2 },
        },
      ),
      choice(
        "endorse",
        [
          "تأييد الصيغة دون الرجوع للأندية",
          "Endorse the format without consulting clubs",
          "Soutenir le format sans consulter les clubs",
        ],
        {
          relation: { organizationId: "CAF", delta: 2 },
          influence: 2,
          legitimacy: -4,
          oppositionPressure: 3,
        },
      ),
    ],
  ),
  event(
    "presidential-debate",
    "campaign",
    "campaign",
    [
      "دعوة إلى مناظرة رئاسية",
      "Invitation to a presidential debate",
      "Invitation à un débat présidentiel",
    ],
    [
      "دعت قناة رياضية المرشحين إلى مناظرة مباشرة حول مستقبل الاتحاد.",
      "A sports channel invited candidates to debate the association’s future live.",
      "Une chaîne sportive invite les candidats à débattre en direct de l’avenir de la fédération.",
    ],
    [
      choice(
        "debate",
        [
          "قبول مناظرة بأسئلة موحدة",
          "Accept a debate with shared questions",
          "Accepter un débat aux questions communes",
        ],
        {
          legitimacy: 3,
          support: { bloc: "regional", delta: 3 },
          relationship: { candidateId: "nadia-fawzi", delta: 2 },
        },
      ),
      choice(
        "decline",
        [
          "رفض الدعوة ومهاجمة المنافسين",
          "Decline and attack the rivals",
          "Refuser et attaquer les adversaires",
        ],
        {
          legitimacy: -2,
          support: { bloc: "small", delta: -2 },
          relationship: { candidateId: "nadia-fawzi", delta: -4 },
        },
      ),
    ],
  ),
  event(
    "rival-coalition",
    "campaign",
    "campaign",
    [
      "منافس يعرض تحالفًا انتخابيًا",
      "Rival offers an electoral alliance",
      "Un adversaire propose une alliance électorale",
    ],
    [
      "عرض مرشح منافس تنسيق المواقف مقابل دعم متبادل في بعض الأندية.",
      "A rival offered coordinated positions in return for mutual support among clubs.",
      "Un candidat adverse propose de coordonner les positions contre un soutien mutuel dans certains clubs.",
    ],
    [
      choice(
        "public",
        [
          "اتفاق علني على نقاط مشتركة",
          "Sign a public agreement on shared points",
          "Conclure un accord public sur des points communs",
        ],
        {
          support: { bloc: "regional", delta: 3 },
          relationship: { candidateId: "nadia-fawzi", delta: 5 },
          legitimacy: 2,
        },
      ),
      choice(
        "secret",
        [
          "صفقة سرية لتقسيم المناصب",
          "Make a secret deal to divide offices",
          "Conclure un accord secret de partage des postes",
        ],
        {
          support: { bloc: "big", delta: 4 },
          relationship: { candidateId: "nadia-fawzi", delta: 8 },
          integrity: -7,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "campaign-finance",
    "campaign",
    "campaign",
    [
      "تبرع انتخابي كبير يثير الشبهة",
      "Large campaign donation raises concern",
      "Un don électoral important suscite des soupçons",
    ],
    [
      "عرض أحد الممولين تغطية نفقات الحملة مقابل وعد بتسهيل عقد مستقبلي.",
      "A donor offered to cover campaign costs in return for a future contract favour.",
      "Un financeur propose de couvrir la campagne contre une faveur sur un futur contrat.",
    ],
    [
      choice(
        "declare",
        [
          "رفض العرض ونشر سجل التمويل",
          "Decline and publish campaign finance",
          "Refuser et publier les comptes de campagne",
        ],
        {
          integrity: 5,
          legitimacy: 3,
          cleanActions: 1,
          disclosure: true,
          support: { bloc: "small", delta: 2 },
        },
      ),
      choice(
        "accept",
        [
          "قبول المال والوعد بالخدمة",
          "Take the money and promise a favour",
          "Accepter l’argent et promettre une faveur",
        ],
        {
          integrity: -10,
          legitimacy: -3,
          illicitActions: 1,
          support: { bloc: "big", delta: 3 },
        },
      ),
    ],
  ),
  event(
    "electoral-promise",
    "campaign",
    "campaign",
    [
      "مطالب متعارضة في تجمع انتخابي",
      "Conflicting demands at a campaign rally",
      "Des demandes contradictoires lors d’un rassemblement",
    ],
    [
      "تريد الأندية الصغيرة دعمًا مباشرًا، بينما تطالب أندية القمة بحصة بث أكبر.",
      "Smaller clubs want direct aid, while leading clubs demand a larger broadcast share.",
      "Les petits clubs veulent une aide directe tandis que les grands réclament une part TV accrue.",
    ],
    [
      choice(
        "formula",
        [
          "عرض صيغة متوازنة قابلة للحساب",
          "Offer a balanced, measurable formula",
          "Proposer une formule équilibrée et mesurable",
        ],
        { support: { bloc: "small", delta: 2 }, legitimacy: 3, integrity: 2 },
      ),
      choice(
        "promise-all",
        [
          "وعد كل طرف بما يريد",
          "Promise each side what it wants",
          "Promettre à chaque camp ce qu’il souhaite",
        ],
        {
          support: { bloc: "big", delta: 3 },
          legitimacy: -4,
          oppositionPressure: 3,
        },
      ),
    ],
  ),
  event(
    "term-limit-debate",
    "council",
    "office",
    [
      "نقاش عام حول حدود الولايات",
      "Public debate on term limits",
      "Débat public sur la limitation des mandats",
    ],
    [
      "طالبت منظمات الأندية بجدول زمني واضح لمناقشة حد الولايات الرئاسية.",
      "Club organisations called for a clear timetable to debate presidential term limits.",
      "Des organisations de clubs demandent un calendrier clair pour débattre de la limite des mandats.",
    ],
    [
      choice(
        "schedule",
        [
          "تحديد جلسة علنية للتعديل",
          "Schedule a public amendment hearing",
          "Programmer une audition publique sur l’amendement",
        ],
        { legitimacy: 4, integrity: 2, oppositionPressure: -3 },
      ),
      choice(
        "delay",
        [
          "تأجيل الملف إلى ما بعد الانتخابات",
          "Delay the issue until after elections",
          "Reporter le dossier après les élections",
        ],
        { legitimacy: -4, oppositionPressure: 4, integrity: -2 },
      ),
    ],
  ),
  event(
    "archive-request",
    "legacy",
    "any",
    [
      "باحث يطلب سجلات ولاية سابقة",
      "Researcher requests records from a past term",
      "Un chercheur demande les archives d’un ancien mandat",
    ],
    [
      "طلب باحث مستقل الاطلاع على قرارات المجلس ومحاضر التمويل السابقة.",
      "An independent researcher requested past council decisions and funding minutes.",
      "Un chercheur indépendant demande les décisions et comptes rendus financiers d’un ancien conseil.",
    ],
    [
      choice(
        "open-archive",
        [
          "فتح السجلات مع حماية البيانات",
          "Open records while protecting personal data",
          "Ouvrir les archives en protégeant les données personnelles",
        ],
        { legitimacy: 3, integrity: 3, disclosure: true },
      ),
      choice(
        "deny-archive",
        [
          "رفض الطلب دون تفسير",
          "Reject the request without explanation",
          "Refuser la demande sans explication",
        ],
        { legitimacy: -3, integrity: -3, oppositionPressure: 2 },
      ),
    ],
  ),
  event(
    "legacy-foundation",
    "legacy",
    "office",
    [
      "اقتراح لتأسيس صندوق إرث رياضي",
      "Proposal for a sporting legacy fund",
      "Projet de fonds pour l’héritage sportif",
    ],
    [
      "طلبت الأندية تحويل جزء من فوائض الاتحاد إلى مشروع يخدم الناشئين على المدى الطويل.",
      "Clubs proposed using part of the association surplus for a long-term youth project.",
      "Les clubs proposent d’affecter une partie des excédents à un projet durable pour les jeunes.",
    ],
    [
      choice(
        "charter",
        [
          "تأسيس صندوق بميثاق مستقل",
          "Create a fund with an independent charter",
          "Créer un fonds doté d’une charte indépendante",
        ],
        {
          treasury: { direction: "debit", amount: 1000000 },
          legitimacy: 4,
          integrity: 3,
          cleanActions: 1,
        },
      ),
      choice(
        "personal",
        [
          "ربط المشروع باسمك وحملتك",
          "Attach the project to your name and campaign",
          "Associer le projet à votre nom et à votre campagne",
        ],
        {
          treasury: { direction: "debit", amount: 1000000 },
          legitimacy: -2,
          integrity: -6,
          illicitActions: 1,
        },
      ),
    ],
  ),
  event(
    "succession-endorsement",
    "legacy",
    "any",
    [
      "الصحافة تسأل عن خليفتك السياسي",
      "Press asks about your political successor",
      "La presse vous interroge sur votre successeur politique",
    ],
    [
      "يسأل صحفيون إن كنت ستدعم مرشحًا بعينه بعد انتهاء ولايتك.",
      "Journalists asked whether you would endorse a particular candidate after your term.",
      "Des journalistes demandent si vous soutiendrez un candidat précis après votre mandat.",
    ],
    [
      choice(
        "neutral",
        [
          "الدعوة إلى تنافس مفتوح",
          "Call for an open contest",
          "Appeler à une compétition ouverte",
        ],
        {
          legitimacy: 3,
          integrity: 2,
          relationship: { candidateId: "nadia-fawzi", delta: 1 },
        },
      ),
      choice(
        "anoint",
        [
          "تسمية حليفك خليفةً لك",
          "Name your ally as your successor",
          "Désigner votre allié comme successeur",
        ],
        {
          legitimacy: -3,
          integrity: -4,
          oppositionPressure: 3,
          relationship: { candidateId: "hassan-elmasry", delta: 6 },
        },
      ),
    ],
  ),
]);

export const POLITICAL_EVENT_BY_ID = Object.freeze(
  Object.fromEntries(POLITICAL_EVENTS.map((entry) => [entry.id, entry])),
);
