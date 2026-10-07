// 0.19 — system layer: save validation/migration notes, competition engines (Europe/Asia/CONCACAF/
// FIFA/domestic), save codecs, difficulty presets, data catalog copy, currencies and event copy.
// A plain string value means "same wording in English and French" (brand-like labels, codes).
export const SYSTEM_PHRASES = {
  // core/validation.js + *Validation.js + utils.js + store.js
  "صيغة الحفظ غير مدعومة": [
    "Unsupported save format",
    "Format de sauvegarde non pris en charge",
  ],
  "بيانات النادي أو التاريخ غير سليمة": [
    "Club or date data is invalid",
    "Données du club ou de la date invalides",
  ],
  "اسم المالك غير صالح": ["Invalid owner name", "Nom du propriétaire invalide"],
  "حالة المحاكاة غير سليمة": [
    "Simulation state is invalid",
    "État de simulation invalide",
  ],
  "مؤشرات النادي غير سليمة": [
    "Club indicators are invalid",
    "Indicateurs du club invalides",
  ],
  "ملف الحفظ ناقص": [
    "Save file is incomplete",
    "Fichier de sauvegarde incomplet",
  ],
  "ملف الحفظ أكبر من حدود النسخة": [
    "Save file exceeds this version’s limits",
    "Le fichier dépasse les limites de cette version",
  ],
  "أسواق غير مدعومة": ["Unsupported markets", "Marchés non pris en charge"],
  "إعدادات المحاكاة ناقصة": [
    "Simulation settings are incomplete",
    "Réglages de simulation incomplets",
  ],
  "بيانات مالية غير سليمة": [
    "Financial data is invalid",
    "Données financières invalides",
  ],
  "قيود مالية غير صالحة": [
    "Invalid ledger entries",
    "Écritures comptables invalides",
  ],
  "كشف الحساب لا يطابق الرصيد": [
    "The statement does not match the balance",
    "Le relevé ne correspond pas au solde",
  ],
  "حركات مالية مكررة": [
    "Duplicate financial entries",
    "Écritures financières en double",
  ],
  "جدول الالتزامات غير سليم": [
    "Commitments schedule is invalid",
    "Échéancier des engagements invalide",
  ],
  "التزامات مالية مكررة": [
    "Duplicate financial commitments",
    "Engagements financiers en double",
  ],
  "بيانات اللاعبين غير سليمة أو متكررة": [
    "Player data is invalid or duplicated",
    "Données de joueurs invalides ou en double",
  ],
  "بيانات المنشآت غير سليمة": [
    "Facility data is invalid",
    "Données des installations invalides",
  ],
  "علاقات التعاقدات غير سليمة": [
    "Transfer relations are invalid",
    "Relations de transfert invalides",
  ],
  "عقود الرعاية غير سليمة": [
    "Sponsorship contracts are invalid",
    "Contrats de sponsoring invalides",
  ],
  "مساحة رعاية محجوزة مرتين": [
    "A sponsorship space is booked twice",
    "Un espace de sponsoring est réservé deux fois",
  ],
  "رسائل البريد غير سليمة": [
    "Inbox messages are invalid",
    "Messages de la boîte de réception invalides",
  ],
  "مرجع تفاوض مفقود في البريد": [
    "Missing negotiation reference in the inbox",
    "Référence de négociation manquante dans la boîte",
  ],
  "مرجع لاعب مفقود في البريد": [
    "Missing player reference in the inbox",
    "Référence de joueur manquante dans la boîte",
  ],
  "قائمة الأحداث غير سليمة": [
    "Event list is invalid",
    "Liste d’événements invalide",
  ],
  "جدول المباريات غير سليم": [
    "Fixture list is invalid",
    "Calendrier des matchs invalide",
  ],
  "جدول الترتيب غير سليم": ["League table is invalid", "Classement invalide"],
  "مستوى صعوبة غير صالح": [
    "Invalid difficulty level",
    "Niveau de difficulté invalide",
  ],
  "لغة غير مدعومة": ["Unsupported language", "Langue non prise en charge"],
  "بيانات الحياة المهنية والأحداث ناقصة": [
    "Career and event data is incomplete",
    "Données de carrière et d’événements incomplètes",
  ],
  "حالة المسيرة غير صالحة": [
    "Invalid career state",
    "État de carrière invalide",
  ],
  "بيانات الموظفين غير سليمة": [
    "Staff data is invalid",
    "Données du personnel invalides",
  ],
  "بنود عقد أو مرجع مصدر غير صالح": [
    "Invalid contract clauses or source reference",
    "Clauses de contrat ou référence de source invalides",
  ],
  "عقد مهني غير سليم": [
    "Invalid professional contract",
    "Contrat professionnel invalide",
  ],
  "أحداث القرارات غير سليمة": [
    "Decision events are invalid",
    "Événements de décision invalides",
  ],
  "مهمة كشف غير سليمة": [
    "Invalid scouting assignment",
    "Mission de recrutement invalide",
  ],
  "مرجع قرار مفقود": [
    "Missing decision reference",
    "Référence de décision manquante",
  ],
  "مرجع اعتزال مفقود": [
    "Missing retirement reference",
    "Référence de retraite manquante",
  ],
  "مرجع موظف مفقود": [
    "Missing staff reference",
    "Référence de personnel manquante",
  ],
  "حد قائمة غير صالح": ["Invalid squad limit", "Limite d’effectif invalide"],
  "بيانات القدرات أو مصادر الميلاد غير سليمة": [
    "Ability or birth-source data is invalid",
    "Données de capacités ou de sources de naissance invalides",
  ],
  "بيانات البطولات الآسيوية غير سليمة": [
    "Asian competition data is invalid",
    "Données des compétitions asiatiques invalides",
  ],
  "بيانات مجموعات أو أدوار كأس 0.9 غير سليمة": [
    "0.9 cup group or round data is invalid",
    "Données des groupes ou tours de coupe 0.9 invalides",
  ],
  "بيانات بطولات كونكاكاف غير سليمة": [
    "CONCACAF competition data is invalid",
    "Données des compétitions CONCACAF invalides",
  ],
  "بيانات البطولة الأوروبية غير سليمة": [
    "European competition data is invalid",
    "Données de la compétition européenne invalides",
  ],
  "بيانات العالم الموسع غير سليمة": [
    "Expanded world data is invalid",
    "Données du monde étendu invalides",
  ],
  "بيانات بطولة FIFA أو تأهل أوقيانوسيا غير سليمة": [
    "FIFA competition or Oceania qualification data is invalid",
    "Données de la compétition FIFA ou de la qualification Océanie invalides",
  ],
  "حفظة تالفة: بيانات الأساطير غير صالحة": [
    "Corrupt save: legends data is invalid",
    "Sauvegarde corrompue : données des légendes invalides",
  ],
  "بيانات الإعارات أو التكتيك أو ملاحق الصعود غير سليمة": [
    "Loan, tactics or play-off data is invalid",
    "Données de prêts, de tactique ou de barrages invalides",
  ],
  "بيانات مركز المواهب غير سليمة": [
    "Talent centre data is invalid",
    "Données du centre de talents invalides",
  ],
  "القيمة المالية غير صالحة": [
    "Invalid monetary value",
    "Valeur monétaire invalide",
  ],
  "انتظر اكتمال الحفظ الحالي": [
    "Wait for the current save to finish",
    "Attendez la fin de la sauvegarde en cours",
  ],
  "ابدأ حفظة جديدة": ["Start a new save", "Commencez une nouvelle sauvegarde"],

  // core/game.js, models/difficulty.js
  "اختر ناديًا متاحًا": [
    "Choose an available club",
    "Choisissez un club disponible",
  ],
  "العالم الموسع يتطلب قاعدة العالم": [
    "The expanded world requires the world database",
    "Le monde étendu exige la base mondiale",
  ],
  "قائمة النادي غير متاحة": [
    "The club’s squad is unavailable",
    "L’effectif du club est indisponible",
  ],
  "القائمة المفتوحة لهذا النادي لم تكتمل بما يكفي للعب. اختر ناديًا آخر أو حزمة 0.2 القديمة":
    [
      "This club’s open roster is not complete enough to play. Choose another club or the legacy 0.2 pack",
      "L’effectif ouvert de ce club n’est pas assez complet pour jouer. Choisissez un autre club ou l’ancien pack 0.2",
    ],
  "مشروعك يبدأ هنا. اللعبة تمزج بيانات مرجعية بعالم محاكاة يتطور داخل حفظتك. القدرات والعقود والأحداث والتقاعد ليست حقائق عن الأشخاص. راجع صفحة المصادر لتفاصيل البيانات، وصدّر حفظتك دوريًا":
    [
      "Your project starts here. The game blends reference data with a simulated world that evolves inside your save. Abilities, contracts, events and retirements are not facts about real people. See the sources page for data details, and export your save regularly",
      "Votre projet commence ici. Le jeu mêle données de référence et monde simulé qui évolue dans votre sauvegarde. Capacités, contrats, événements et retraites ne sont pas des faits sur des personnes réelles. Consultez la page des sources et exportez régulièrement votre sauvegarde",
    ],
  "سيولة أكبر ٨٠٪، وتشغيل أقل ٢٠٪، وتفاوض أسهل. القدرات والنتائج لا تتغير سرًا":
    [
      "80% more cash, 20% lower operating costs and easier negotiations. Abilities and results are never secretly altered",
      "80 % de trésorerie en plus, 20 % de charges en moins et négociations plus faciles. Capacités et résultats ne sont jamais modifiés en secret",
    ],
  "سيولة أكبر ٣٠٪، وتشغيل أقل ١٠٪، ومساحة أكبر للتجربة": [
    "30% more cash, 10% lower operating costs and more room to experiment",
    "30 % de trésorerie en plus, 10 % de charges en moins et plus de marge pour expérimenter",
  ],
  "الاقتصاد والتفاوض بمعدلاتهما الأساسية. قرارات لها مكاسب وتكاليف": [
    "Economy and negotiations at their base rates. Decisions have gains and costs",
    "Économie et négociations aux taux de base. Chaque décision a ses gains et ses coûts",
  ],
  "سيولة أقل ٢٥٪، وتشغيل أعلى ١٥٪، ورعايات أقل وتفاوض أصعب": [
    "25% less cash, 15% higher operating costs, fewer sponsors and harder negotiations",
    "25 % de trésorerie en moins, 15 % de charges en plus, moins de sponsors et négociations plus dures",
  ],

  // core/migrations.js
  "تم الاحتفاظ بنتائج الموسم الحالي وقوائمه. نظام أوروبا الجديد يبدأ مع الموسم التالي؛ مواعيد الكؤوس المقبلة تراعي فاصل الراحة":
    [
      "This season’s results and squads were kept. The new European system starts next season; upcoming cup dates respect the rest gap",
      "Résultats et effectifs de la saison ont été conservés. Le nouveau système européen commence la saison prochaine ; les prochaines dates de coupe respectent le repos",
    ],
  "تم ترحيل الحفظة القديمة دون استبدال لاعبيها أو تغيير رصيدها. قاعدة الأسماء الحقيقية تحتاج حفظة جديدة":
    [
      "The old save was migrated without replacing its players or changing its balance. The real-names database needs a new save",
      "L’ancienne sauvegarde a été migrée sans remplacer ses joueurs ni modifier son solde. La base de vrais noms exige une nouvelle sauvegarde",
    ],
  "حفظت 0.6 فرقك ومجموعاتك ونتائجك القديمة؛ عضوية مصر الجديدة تحتاج مشوارًا جديدًا. سوق الحفظ القديم يبقى مفتوحًا والخطة الموضعية اختيارية":
    [
      "0.6 kept your teams, groups and old results; the new Egyptian membership needs a new career. The old save’s market stays open and the positional plan is optional",
      "0.6 a conservé vos équipes, groupes et anciens résultats ; la nouvelle composition égyptienne exige une nouvelle carrière. Le marché de l’ancienne sauvegarde reste ouvert et le plan de postes est facultatif",
    ],
  "أضيف مركز المواهب دون استبدال قوائمك. التجدد الآلي يبدأ مستقبلًا في الأسواق المحملة؛ دفعات المالك تحتاج طلبه وموافقته":
    [
      "The talent centre was added without replacing your squads. Automatic renewal starts later in the loaded markets; owner intakes need your request and approval",
      "Le centre de talents a été ajouté sans remplacer vos effectifs. Le renouvellement automatique démarre plus tard dans les marchés chargés ; les promotions du propriétaire exigent sa demande et son accord",
    ],
  "احتفظ تحديث 0.8 بكل أنديتك ودرجاتك ونتائجك، بما فيها المستويات الإضافية القديمة. القوائم الجديدة وقواعد الاحتياط تبدأ في مشوار جديد فقط":
    [
      "Update 0.8 kept all your clubs, divisions and results, including the old extra tiers. New rosters and reserve rules only start in a new career",
      "La mise à jour 0.8 a conservé clubs, divisions et résultats, y compris les anciens niveaux supplémentaires. Nouveaux effectifs et règles de réserve ne s’appliquent qu’à une nouvelle carrière",
    ],
  "مسابقات موسمك الحالي ونتائجها محفوظة؛ أنظمة كؤوس 0.9 تبدأ بعد نهاية الموسم، دون تغيير درجاتك أو نظام صعودك":
    [
      "Your current season’s competitions and results are kept; the 0.9 cup systems start after the season ends, without changing your divisions or promotion system",
      "Compétitions et résultats de la saison en cours sont conservés ; les coupes 0.9 démarrent après la saison, sans modifier vos divisions ni votre système de montée",
    ],
  "صيغتا FIFA الجديدتان تبدآن بعد نهاية الموسم الحالي؛ القرعات والنتائج القديمة باقية، وعدد الدرجات والصعود لم يتغيرا":
    [
      "The two new FIFA formats start after the current season; old draws and results remain, and the number of divisions and promotion are unchanged",
      "Les deux nouveaux formats FIFA démarrent après la saison en cours ; anciens tirages et résultats restent, divisions et montées inchangées",
    ],
  "بطولات آسيا الثلاث تبدأ بعد نهاية الموسم الجاري؛ النتائج والدرجات الحالية محفوظة":
    [
      "The three Asian competitions start after the current season; current results and divisions are kept",
      "Les trois compétitions asiatiques démarrent après la saison en cours ; résultats et divisions actuels sont conservés",
    ],
  "بطولات كونكاكاف الأربع تبدأ بعد نهاية الموسم الجاري؛ النتائج والدرجات الحالية محفوظة":
    [
      "The four CONCACAF competitions start after the current season; current results and divisions are kept",
      "Les quatre compétitions CONCACAF démarrent après la saison en cours ; résultats et divisions actuels sont conservés",
    ],
  "كؤوس 0.13 المحلية الكاملة تبدأ من الموسم الجديد؛ كؤوس الموسم الجاري ونتائجها محفوظة، وسوبر الأسواق الجديدة يُلعب بنتائج هذا الموسم عند اكتماله":
    [
      "The full 0.13 domestic cups start from the new season; this season’s cups and results are kept, and the new markets’ super cups use this season’s results once complete",
      "Les coupes nationales complètes 0.13 démarrent à la nouvelle saison ; coupes et résultats en cours sont conservés, et les supercoupes des nouveaux marchés utilisent les résultats de cette saison une fois terminée",
    ],
  "مراجعة 0.14: جداول كونكاكاف الجديدة تتجنب ازدحام المباريات تلقائيًا، وجوائز البطولات أصبحت متدرجة حسب المستوى؛ نتائج الموسم الجاري محفوظة":
    [
      "0.14 review: the new CONCACAF schedules avoid fixture congestion automatically and prize money is now tiered by level; this season’s results are kept",
      "Révision 0.14 : les nouveaux calendriers CONCACAF évitent automatiquement l’encombrement et les dotations sont désormais graduées par niveau ; résultats de la saison conservés",
    ],
  "اقتصاد 0.15: رعاة محليون لبلد ناديك، وعرض الرصيد بالعملة المحلية، ومكافآت أداء تلقائية للعقود القائمة؛ العقود والنتائج الحالية محفوظة":
    [
      "Economy 0.15: local sponsors for your club’s country, balance shown in local currency and automatic performance bonuses for active contracts; current contracts and results are kept",
      "Économie 0.15 : sponsors locaux du pays de votre club, solde affiché en monnaie locale et primes de performance automatiques pour les contrats actifs ; contrats et résultats conservés",
    ],
  "اقتصاد 0.16: تفاوض مضاد على الرعاية، وفئات تذاكر وعلاوة مباراة، وسوق مدربين موسع بعقود مؤرخة؛ العقود والنتائج الحالية محفوظة":
    [
      "Economy 0.16: sponsorship counter-negotiation, ticket categories and match surcharge, and a wider coach market with dated contracts; current contracts and results are kept",
      "Économie 0.16 : contre-négociation de sponsoring, catégories de billets et majoration de match, marché des entraîneurs élargi avec contrats datés ; contrats et résultats conservés",
    ],
  // 0.20 — long-career capacity (migration note, retiree archive, codec)
  "سعة المسيرة الطويلة 0.20: نُقل": [
    "Long-career capacity 0.20: moved",
    "Capacité longue carrière 0.20 : déplacement de",
  ],
  "معتزلًا إلى أرشيف مضغوط، وخفّ حجم سجل كل لاعب؛ النتائج والعقود والمالية محفوظة كما هي": [
    "retired players to a compact archive and slimmed every player record; results, contracts and finances are preserved as they are",
    "joueurs retraités vers une archive compacte et allègement de chaque fiche joueur ; résultats, contrats et finances sont conservés tels quels",
  ],
  "وأُزيل": ["and removed", "et suppression de"],
  "مرشحًا مهنيًا قديمًا من خارج ناديك": [
    "stale staff candidates from outside your club",
    "anciens candidats professionnels extérieurs à votre club",
  ],
  "أرشيف المعتزلين غير سليم": [
    "The retiree archive is invalid",
    "L’archive des retraités est invalide",
  ],
  "أرشيف المعتزلين يكرر سجل لاعب": [
    "The retiree archive duplicates a player record",
    "L’archive des retraités duplique une fiche joueur",
  ],
  "لا يمكن أرشفة لاعب غير معتزل": [
    "Only a retired player can be archived",
    "Seul un joueur retraité peut être archivé",
  ],
  "الأساطير 0.17: قاعة أساطير بأسماء حقيقية وأدوار تدريبية حسب المركز؛ الحفظة القديمة تعمل كما هي وبدون عقود أساطير":
    [
      "Legends 0.17: a Hall of Legends with real names and position-based coaching roles; old saves work as they are, without legend contracts",
      "Légendes 0.17 : un Panthéon avec de vrais noms et des rôles d’entraîneur par poste ; les anciennes sauvegardes fonctionnent telles quelles, sans contrats de légendes",
    ],

  // 0.23 — per-player season stats (migration note)
  "إحصائيات الموسم 0.23: عدّادات أهداف وأسيست وبطاقات وتصنيفات ودقائق لكل لاعب تتراكم تلقائيًا وتُحفظ في نهاية الموسم؛ النتائج والعقود والمالية محفوظة كما هي":
    [
      "Season stats 0.23: per-player counters for goals, assists, cards, ratings and minutes accumulate automatically and are saved at season end; results, contracts and finances are preserved as they are",
      "Statistiques saisonnières 0.23 : compteurs par joueur (buts, passes, cartons, notes et minutes) cumulés automatiquement et sauvegardés en fin de saison ; résultats, contrats et finances conservés tels quels",
    ],
  "بيانات إحصائيات الموسم غير سليمة": [
    "Season stats data is invalid",
    "Données de statistiques saisonnières invalides",
  ],

  // 0.24 — match consequences (migration note + validation + form labels)
  "عواقب الملعب 0.24: إصابات أثناء المباريات، وإنذارات متراكمة تؤدي للإيقاف، وفورمة اللاعب تؤثر على الأداء؛ النتائج والعقود والمالية محفوظة كما هي":
    [
      "Match consequences 0.24: in-match injuries, accumulated yellow card suspensions, and player form affecting performance; results, contracts and finances are preserved as they are",
      "Conséquences de match 0.24 : blessures en match, suspensions par cartons jaunes cumulés et forme du joueur affectant la performance ; résultats, contrats et finances conservés tels quels",
    ],
  "بيانات عواقب الملعب غير سليمة": [
    "Match consequence data is invalid",
    "Données de conséquences de match invalides",
  ],
  "متوهج": ["Hot", "En forme"],
  "عادي": ["Normal", "Normal"],
  "بارد": ["Cold", "En froid"],
  "إصابة —": ["Injury —", "Blessure —"],
  "طرد —": ["Red card —", "Carton rouge —"],
  "إنذارات متراكمة —": ["Accumulated yellows —", "Cartons jaunes cumulés —"],
  "التواء الكاحل": ["Ankle sprain", "Entorse de la cheville"],
  "تمزق عضلي": ["Muscle tear", "Déchirure musculaire"],
  "إصابة في الركبة": ["Knee injury", "Blessure au genou"],
  "كدمة قوية": ["Heavy bruise", "Contusion sévère"],
  "شد في الفخذ": ["Thigh strain", "Clou de la cuisse"],
  "أسابيع": ["weeks", "semaines"],
  "أشهر": ["months", "mois"],
  "إنذارات متراكمة": ["Accumulated yellows", "Cartons jaunes cumulés"],
  "تلقى": ["received", "a reçu"],
  "إنذاره الصفراء الرابع هذا الموسم. إيقاف مباراة واحدة حتى": [
    "his fourth yellow this season. One-match suspension until",
    "son quatrième jaune de la saison. Suspension d'un match jusqu'au",
  ],
  "طرد": ["Red card", "Carton rouge"],
  "تم طرد": ["was sent off", "a été expulsé"],
  "من المباراة. إيقاف مباراة واحدة حتى": [
    "from the match. One-match suspension until",
    "du match. Suspension d'un match jusqu'au",
  ],
  "إصابة": ["Injury", "Blessure"],
  "لمدّة": ["for", "pour"],
  "سيعود حوالي": ["will return around", "reviendra vers le"],

  // services/competitions/engine.js, domestic.js, presets.js, draw.js, qualification.js
  ناديًا: ["clubs", "clubs"],
  "مجموعات · ذهاب وإياب": ["groups · home and away", "groupes · aller-retour"],
  "؛ التأهل والمقاعد والتواريخ والجوائز محاكاة": [
    "; qualification, places, dates and prize money are simulated",
    " ; qualification, places, dates et dotations simulées",
  ],
  "خروج مغلوب بين الأندية المتاحة؛ دخول الأندية والتقويم والجوائز محاكاة": [
    "Knockout between the available clubs; entries, calendar and prize money are simulated",
    "Élimination directe entre les clubs disponibles ; entrées, calendrier et dotations simulés",
  ],
  "الإياب سبق الذهاب": [
    "The second leg precedes the first",
    "Le match retour précède l’aller",
  ],
  "سُجل اللقب في تاريخ النادي. التأهل والجوائز والتقويم سيناريو محاكاة، لا أرقام رسمية":
    [
      "The title was recorded in the club’s history. Qualification, prize money and calendar are a simulated scenario, not official figures",
      "Le titre est inscrit dans l’histoire du club. Qualification, dotations et calendrier sont un scénario simulé, pas des chiffres officiels",
    ],
  "انتقلت إلى سودأمريكانا": [
    "Transferred to the Sudamericana",
    "Reversé en Sudamericana",
  ],
  "المركز الثالث في مجموعة ليبرتادوريس منحك مواجهة ملحق من ذهاب وإياب أمام وصيف مجموعة سودأمريكانا":
    [
      "Third place in the Libertadores group earned you a two-legged play-off against a Sudamericana group runner-up",
      "La troisième place du groupe de Libertadores vous vaut un barrage aller-retour contre un deuxième de groupe de Sudamericana",
    ],
  "جائزة مجموعات تقديرية": [
    "Estimated group-stage prize",
    "Dotation de groupes estimée",
  ],
  "جائزة تأهل تقديرية": [
    "Estimated qualification prize",
    "Dotation de qualification estimée",
  ],
  "مواجهة إقصائية غير محسومة": [
    "Knockout tie not settled",
    "Confrontation à élimination directe non tranchée",
  ],
  "كأس محلي · مباراة واحدة": [
    "Domestic cup · single match",
    "Coupe nationale · match unique",
  ],
  "نهائي محايد؛ المشاركون من المستويات المحملة والدخول والقرعة والتقويم محاكاة":
    [
      "Neutral final; entrants come from the loaded tiers, and entries, draw and calendar are simulated",
      "Finale sur terrain neutre ; participants issus des niveaux chargés, entrées, tirage et calendrier simulés",
    ],
  "سوبر من": ["Super cup of", "Supercoupe à"],
  "أندية بنتائج هذا الموسم · محايد · توقيت ومقاعد محاكاة": [
    "clubs by this season’s results · neutral · timing and places simulated",
    "clubs selon les résultats de la saison · neutre · calendrier et places simulés",
  ],
  "بطلا ليبرتادوريس وسودأمريكانا · ذهاب وإياب · مواعيد وجوائز محاكاة": [
    "Libertadores and Sudamericana champions · home and away · simulated dates and prize money",
    "Vainqueurs de la Libertadores et de la Sudamericana · aller-retour · dates et dotations simulées",
  ],
  "بطلا أفريقيا والكونفدرالية · مباراة محايدة · ترجيح عند التعادل دون وقت إضافي":
    [
      "African and Confederation champions · neutral match · penalties if level, no extra time",
      "Vainqueurs d’Afrique et de la Confédération · match neutre · tirs au but en cas d’égalité, sans prolongation",
    ],
  "السوبر المصري": ["Egyptian Super Cup", "Supercoupe d’Égypte"],
  "دور المجموعات": ["Group stage", "Phase de groupes"],
  "انتظار المنتقلين من ليبرتادوريس": [
    "Awaiting the Libertadores drop-downs",
    "En attente des reversés de la Libertadores",
  ],
  "ملحق سودأمريكانا": ["Sudamericana play-off", "Barrage de Sudamericana"],
  "ملحق التأهل": ["Qualification play-off", "Barrage de qualification"],
  "مباراة المركز الثالث": [
    "Third-place match",
    "Match pour la troisième place",
  ],
  "تعذر توزيع مجموعات البطولة دون تكرار البلد": [
    "Could not draw the groups without repeating a country",
    "Impossible de tirer les groupes sans répéter un pays",
  ],
  "تعذر قرعة الفائزين والوصيف": [
    "Could not draw winners against runners-up",
    "Impossible de tirer vainqueurs contre deuxièmes",
  ],
  "مسابقة عليا ناقصة للتأهل": [
    "A higher competition is missing for qualification",
    "Une compétition supérieure manque pour la qualification",
  ],
  "عدد الأندية المؤهلة غير كافٍ": [
    "Not enough qualified clubs",
    "Pas assez de clubs qualifiés",
  ],
  "عدد مقاعد البطولة غير سليم": [
    "Invalid number of competition places",
    "Nombre de places invalide",
  ],

  // europe/engine.js, europe/draw.js
  "مرحلة الدوري": ["League phase", "Phase de ligue"],
  "أندية غير كافية لتكوين قائمة التأهل الأوروبية": [
    "Not enough clubs to build the European qualification list",
    "Pas assez de clubs pour constituer la liste de qualification européenne",
  ],
  "36 ناديًا · دوري ثم ملحق وذهاب وإياب · نهائي محايد": [
    "36 clubs · league phase, then play-off and two-legged rounds · neutral final",
    "36 clubs · phase de ligue, puis barrage et tours aller-retour · finale sur terrain neutre",
  ],
  "أُضيفت القرعة والمواعيد إلى جدول ناديك. الذهاب والإياب يُحسمان بمجموع الأهداف دون أفضلية الهدف خارج الأرض. التواريخ ومبالغ الجوائز محاكاة":
    [
      "The draw and dates were added to your schedule. Two-legged ties are decided on aggregate without away goals. Dates and prize amounts are simulated",
      "Le tirage et les dates ont été ajoutés à votre calendrier. Les doubles confrontations se jouent au cumul sans règle du but à l’extérieur. Dates et dotations simulées",
    ],
  "جائزة أوروبية تقديرية": [
    "Estimated European prize",
    "Dotation européenne estimée",
  ],
  "تأهل أوروبي — مبالغ محاكاة": [
    "European qualification — simulated amounts",
    "Qualification européenne — montants simulés",
  ],
  "مجموع الأهداف": ["Aggregate", "Cumul"],
  "نهاية مرحلة الدوري": ["End of the league phase", "Fin de la phase de ligue"],
  مركزك: ["Your position", "Votre position"],
  "سُجل اللقب في موسمك. المشاركون والمعاملات والجوائز والتقويم محاكاة وليست بيانات UEFA الرسمية":
    [
      "The title was recorded in your season. Entrants, coefficients, prize money and calendar are simulated, not official UEFA data",
      "Le titre est inscrit dans votre saison. Participants, coefficients, dotations et calendrier sont simulés, pas des données officielles de l’UEFA",
    ],
  "القرعة الأوروبية تتطلب 36 ناديًا مختلفًا": [
    "The European draw needs 36 different clubs",
    "Le tirage européen exige 36 clubs différents",
  ],
  "أوعية القرعة غير سليمة": [
    "Draw pots are invalid",
    "Chapeaux du tirage invalides",
  ],
  "تعذر استيفاء قيود القرعة دون تخفيفها؛ لم تُنشأ قرعة غير سليمة": [
    "Draw constraints could not be met without relaxing them; no invalid draw was created",
    "Les contraintes du tirage n’ont pu être satisfaites sans assouplissement ; aucun tirage invalide n’a été créé",
  ],

  // asia/engine.js, asia/draw.js, asia/access.js
  "الدور التمهيدي": ["Preliminary round", "Tour préliminaire"],
  "انتظار المنتقلين من البطولة الأعلى": [
    "Awaiting the drop-downs from the higher competition",
    "En attente des reversés de la compétition supérieure",
  ],
  "مرحلة الدوري / المجموعات": [
    "League / group stage",
    "Phase de ligue / groupes",
  ],
  "ثمن النهائي": ["Round of 16", "Huitièmes de finale"],
  "ربع النهائي": ["Quarter-finals", "Quarts de finale"],
  "نصف النهائي": ["Semi-finals", "Demi-finales"],
  النهائي: ["Final", "Finale"],
  "32 ناديًا · 16 شرقًا و16 غربًا · 8 مباريات (4 داخل و4 خارج) · أول 8 في كل منطقة إلى ثمن نهائي ذهاب وإياب · نهائيات مجمعة من ربع النهائي":
    [
      "32 clubs · 16 East and 16 West · 8 matches (4 home, 4 away) · top 8 in each region to a two-legged round of 16 · centralised finals from the quarter-finals",
      "32 clubs · 16 Est et 16 Ouest · 8 matchs (4 à domicile, 4 à l’extérieur) · les 8 premiers de chaque zone en huitièmes aller-retour · phase finale centralisée dès les quarts",
    ],
  "32 ناديًا · 8 مجموعات إقليمية ذهاب وإياب · أول وثاني كل مجموعة · إقصائيات إقليمية ذهاب وإياب · نهائي واحد":
    [
      "32 clubs · 8 regional groups home and away · top two of each group · two-legged regional knockouts · single final",
      "32 clubs · 8 groupes régionaux aller-retour · deux premiers de chaque groupe · éliminatoires régionales aller-retour · finale unique",
    ],
  "20 ناديًا · 3 مجموعات غرب و2 شرق · مجموعات مجمعة من دور واحد · الغرب: الأوائل وأفضل وصيف؛ الشرق: الأول والثاني · ربع ونصف نهائي إقليميان ذهاب وإياب · نهائي واحد":
    [
      "20 clubs · 3 West and 2 East groups · centralised single-round groups · West: winners plus best runner-up; East: top two · two-legged regional quarter- and semi-finals · single final",
      "20 clubs · 3 groupes Ouest et 2 Est · groupes centralisés à un tour · Ouest : premiers et meilleur deuxième ; Est : deux premiers · quarts et demies régionaux aller-retour · finale unique",
    ],
  "انتقلت إلى": ["Transferred to", "Reversé en"],
  "الخروج من تمهيدي البطولة الأعلى منح ناديك مكانًا في مجموعات البطولة التالية":
    [
      "Elimination in the higher competition’s preliminary round gave your club a place in the next competition’s groups",
      "L’élimination au tour préliminaire de la compétition supérieure a offert à votre club une place dans les groupes de la compétition suivante",
    ],
  "جائزة آسيوية تقديرية": [
    "Estimated Asian prize",
    "Dotation asiatique estimée",
  ],
  "تأهل / تتويج": ["Qualification / title", "Qualification / titre"],
  خروج: ["Eliminated", "Élimination"],
  مجموع: ["aggregate", "cumul"],
  "؛ بالترجيح": ["; on penalties", " ; aux tirs au but"],
  "؛ بعد وقت إضافي": ["; after extra time", " ; après prolongation"],
  "مواجهة آسيوية غير محسومة": [
    "Asian tie not settled",
    "Confrontation asiatique non tranchée",
  ],
  بطل: ["Champion:", "Champion :"],
  "اللقب يؤهلك للإنتركونتيننتال ويدخل سجل تأهل كأس العالم": [
    "The title qualifies you for the Intercontinental Cup and enters the Club World Cup qualification record",
    "Le titre vous qualifie pour la Coupe intercontinentale et entre dans le registre de qualification du Mondial des clubs",
  ],
  "اللقب يفتح مسار التأهل للبطولة الآسيوية الأعلى في الموسم القادم": [
    "The title opens the path to next season’s top Asian competition",
    "Le titre ouvre la voie à la première compétition asiatique la saison prochaine",
  ],
  "دوري المنطقة يحتاج 16 ناديًا": [
    "The regional league needs 16 clubs",
    "La ligue régionale exige 16 clubs",
  ],
  "تعذر توزيع اتحادات النخبة على الأعمدة": [
    "Could not distribute the elite associations across the columns",
    "Impossible de répartir les associations d’élite sur les colonnes",
  ],
  "تعذر تكوين أعمدة النخبة": [
    "Could not build the elite columns",
    "Impossible de constituer les colonnes d’élite",
  ],
  "قائمة التأهل الآسيوي غير مكتملة": [
    "The Asian qualification list is incomplete",
    "La liste de qualification asiatique est incomplète",
  ],
  "لا توجد مقاعد آمنة للمجموعات الآسيوية": [
    "No safe places for the Asian groups",
    "Aucune place sûre pour les groupes asiatiques",
  ],

  // concacaf/engine.js, concacaf/access.js
  "27 ناديًا · 22 في الدور الأول و5 معفاة لثمن النهائي · ذهاب وإياب حتى نصف النهائي · نهائي واحد يستضيفه الأعلى تصنيفًا":
    [
      "27 clubs · 22 in round one and 5 byes to the round of 16 · home and away up to the semi-finals · single final hosted by the higher seed",
      "27 clubs · 22 au premier tour et 5 exemptés jusqu’aux huitièmes · aller-retour jusqu’aux demies · finale unique chez le mieux classé",
    ],
  "36 ناديًا (18 مكسيكيًا و18 أمريكيًا) · 3 مباريات عابرة للدوريين لكل نادٍ · جدول منفصل لكل دوري · أول 4 من كل جدول لربع نهائي مفرد":
    [
      "36 clubs (18 Mexican, 18 American) · 3 cross-league matches per club · separate table per league · top 4 of each table to single-match quarter-finals",
      "36 clubs (18 mexicains et 18 américains) · 3 matchs inter-ligues par club · classement séparé par ligue · les 4 premiers de chaque classement en quarts à match unique",
    ],
  "20 ناديًا · 4 مجموعات من دور واحد · أول وثاني كل مجموعة · ربع نهائي ثم نصف نهائي وملحق تأهل ثم نهائي ذهاب وإياب":
    [
      "20 clubs · 4 single-round groups · top two of each group · quarter-finals, then semi-finals and a qualification play-off, then a two-legged final",
      "20 clubs · 4 groupes à un tour · deux premiers de chaque groupe · quarts, puis demies et barrage de qualification, puis finale aller-retour",
    ],
  "10 أندية · مجموعتان من دور واحد · أول وثاني كل مجموعة لنصف النهائي · نهائي ومباراة ثالث ذهاب وإياب":
    [
      "10 clubs · two single-round groups · top two of each group to the semi-finals · two-legged final and third-place match",
      "10 clubs · deux groupes à un tour · deux premiers de chaque groupe en demies · finale et match pour la troisième place aller-retour",
    ],
  "تعذر جدولة مجموعة كونكاكاف": [
    "Could not schedule a CONCACAF group",
    "Impossible de programmer un groupe CONCACAF",
  ],
  "تعذر قرعة المرحلة الأولى لكأس الدوريات": [
    "Could not draw the Leagues Cup first phase",
    "Impossible de tirer la première phase de la Leagues Cup",
  ],
  "؛ المقاعد والقرعة والمواعيد والجوائز محاكاة": [
    "; places, draw, dates and prize money are simulated",
    " ; places, tirage, dates et dotations simulés",
  ],
  "؛ الأوعية والمناطق والتأهل والجوائز محاكاة": [
    "; pots, regions, qualification and prize money are simulated",
    " ; chapeaux, zones, qualification et dotations simulés",
  ],
  "تأهل الدور الأول لكونكاكاف غير مكتمل": [
    "CONCACAF round-one qualification is incomplete",
    "La qualification du premier tour CONCACAF est incomplète",
  ],
  "نهائي كونكاكاف غير محسوم": [
    "CONCACAF final not settled",
    "Finale CONCACAF non tranchée",
  ],
  "مباراة المركز الثالث غير محسومة": [
    "Third-place match not settled",
    "Match pour la troisième place non tranché",
  ],
  "اللقب يفتح مسار التأهل لكأس الأبطال في الموسم القادم": [
    "The title opens the path to next season’s Champions Cup",
    "Le titre ouvre la voie à la Coupe des champions la saison prochaine",
  ],
  "جائزة كونكاكاف تقديرية": [
    "Estimated CONCACAF prize",
    "Dotation CONCACAF estimée",
  ],
  "؛ حُسم بأهداف خارج الأرض في الوقت الأصلي": [
    "; decided on away goals in normal time",
    " ; décidé aux buts à l’extérieur dans le temps réglementaire",
  ],
  "مواجهة كونكاكاف غير محسومة": [
    "CONCACAF tie not settled",
    "Confrontation CONCACAF non tranchée",
  ],
  "دوري أعلى ناقص لتأهل كونكاكاف": [
    "A top league is missing for CONCACAF qualification",
    "Une première division manque pour la qualification CONCACAF",
  ],
  "قائمة ضيوف كونكاكاف غير مكتملة": [
    "The CONCACAF guest list is incomplete",
    "La liste des invités CONCACAF est incomplète",
  ],
  "تعذر استكمال مقاعد كأس أبطال كونكاكاف": [
    "Could not fill the CONCACAF Champions Cup places",
    "Impossible de compléter les places de la Coupe des champions CONCACAF",
  ],
  "قائمة كأس أبطال كونكاكاف غير سليمة": [
    "The CONCACAF Champions Cup list is invalid",
    "La liste de la Coupe des champions CONCACAF est invalide",
  ],

  // fifa/engine.js, fifa/draw.js, fifa/access.js
  "المساران الافتتاحيان": [
    "The two opening paths",
    "Les deux parcours d’ouverture",
  ],
  "كأس أفريقيا وآسيا والمحيط الهادئ": [
    "Africa–Asia–Pacific Cup",
    "Coupe Afrique–Asie–Pacifique",
  ],
  "كأس التحدي": ["Challenger Cup", "Coupe Challenger"],
  "انتظار الأبطال القاريين الستة": [
    "Awaiting the six continental champions",
    "En attente des six champions continentaux",
  ],
  "مسار تأهل أوقيانوسيا": [
    "Oceania qualification path",
    "Parcours de qualification Océanie",
  ],
  "7 أندية حقيقية مؤهلة من قائمة OFC؛ دوري خفيف من دور واحد ثم نهائي بين الأول والثاني. ليس الصيغة الرسمية للدوري الاحترافي ذي الثمانية أندية":
    [
      "7 real clubs qualified from the OFC list; a light single-round league, then a final between first and second. Not the official format of the eight-club professional league",
      "7 vrais clubs qualifiés depuis la liste OFC ; ligue légère à un tour puis finale entre le premier et le deuxième. Pas le format officiel de la ligue professionnelle à huit clubs",
    ],
  "سنوي · 6 أبطال قاريين · 5 مباريات · بطل أوروبا إلى النهائي مباشرة؛ مواعيد وجوائز اللعبة محاكاة":
    [
      "Annual · 6 continental champions · 5 matches · Europe’s champion goes straight to the final; the game’s dates and prize money are simulated",
      "Annuel · 6 champions continentaux · 5 matchs · le champion d’Europe va directement en finale ; dates et dotations du jeu simulées",
    ],
  "32 ناديًا · 8 مجموعات من دور واحد · الأول والثاني لثمن النهائي · إقصائيات محايدة من مباراة واحدة · كل 4 سنوات. صيغة 2025 للعبة، لا اعتماد نهائي للوائح 2029":
    [
      "32 clubs · 8 single-round groups · top two to the round of 16 · single-match neutral knockouts · every 4 years. The game uses the 2025 format; the 2029 regulations are not final",
      "32 clubs · 8 groupes à un tour · deux premiers en huitièmes · éliminatoires neutres à match unique · tous les 4 ans. Format 2025 du jeu ; le règlement 2029 n’est pas définitif",
    ],
  "مشاركة كأس العالم — تقدير محاكاة": [
    "Club World Cup participation — simulated estimate",
    "Participation au Mondial des clubs — estimation simulée",
  ],
  "تأهلت لكأس العالم للأندية": [
    "You qualified for the Club World Cup",
    "Vous êtes qualifié pour le Mondial des clubs",
  ],
  "قرعة 32 ناديًا محفوظة. سبب تأهلك ومصدر المقعد ظاهر في بطاقة البطولة؛ الجوائز والتصنيف والمضيف سيناريو اللعبة":
    [
      "The 32-club draw is saved. Your qualification reason and place source show on the competition card; prize money, seeding and host are the game’s scenario",
      "Le tirage à 32 clubs est enregistré. Le motif de votre qualification et l’origine de la place figurent sur la fiche de la compétition ; dotations, têtes de série et hôte sont le scénario du jeu",
    ],
  "أبطال القارات غير مؤهلين أو مكررون": [
    "Continental champions are ineligible or duplicated",
    "Champions continentaux inéligibles ou en double",
  ],
  "تأهلت للإنتركونتيننتال": [
    "You qualified for the Intercontinental Cup",
    "Vous êtes qualifié pour la Coupe intercontinentale",
  ],
  "تأهل من لقبك القاري لهذا الموسم. بطل أوروبا ينتظر النهائي؛ البقية في مسارين ثم كأس التحدي. البطولة منفصلة عن كأس العالم للأندية":
    [
      "Qualified through this season’s continental title. Europe’s champion awaits the final; the rest play two paths and then the Challenger Cup. This competition is separate from the Club World Cup",
      "Qualifié grâce à votre titre continental de la saison. Le champion d’Europe attend en finale ; les autres jouent deux parcours puis la Coupe Challenger. Compétition distincte du Mondial des clubs",
    ],
  "حُسم بالترجيح": ["decided on penalties", "décidé aux tirs au but"],
  "بعد وقت إضافي": ["after extra time", "après prolongation"],
  "مكافأة تقديرية": ["Estimated bonus", "Prime estimée"],
  "مواجهة عالمية لم تحسم": [
    "World tie not settled",
    "Confrontation mondiale non tranchée",
  ],
  "سُجل اللقب في مشوار النادي؛ البطولة والتأهل والمواعيد والجوائز ضمن نموذج اللعبة":
    [
      "The title was recorded in the club’s career; competition, qualification, dates and prize money belong to the game’s model",
      "Le titre est inscrit dans la carrière du club ; compétition, qualification, dates et dotations relèvent du modèle du jeu",
    ],
  "أوعية كأس العالم غير مكتملة": [
    "Club World Cup pots are incomplete",
    "Chapeaux du Mondial des clubs incomplets",
  ],
  "تعذرت قرعة كأس العالم دون مخالفة قيود القارات والبلدان": [
    "The Club World Cup draw could not be made without breaking continent and country constraints",
    "Le tirage du Mondial des clubs n’a pu être fait sans enfreindre les contraintes de continent et de pays",
  ],
  "تعذر استكمال مقاعد كأس العالم": [
    "Could not fill the Club World Cup places",
    "Impossible de compléter les places du Mondial des clubs",
  ],

  // localSaveCodec.js, saveCompression.js
  "تجاوز الحفظ حد ١٦٠ MiB؛ احتفظ بالنسخة السابقة وقلل العالم في المشاوير الجديدة":
    [
      "The save exceeded the 160 MiB limit; keep the previous copy and load a smaller world in new careers",
      "La sauvegarde dépasse la limite de 160 Mio ; gardez la copie précédente et réduisez le monde dans les nouvelles carrières",
    ],
  "أجزاء الحفظ المحلي غير سليمة": [
    "Local save chunks are invalid",
    "Fragments de sauvegarde locale invalides",
  ],
  "أجزاء الحفظ تتجاوز حد الذاكرة المسموح": [
    "Save chunks exceed the allowed memory limit",
    "Les fragments dépassent la limite mémoire autorisée",
  ],
  "رأس الحفظ المحلي غير سليم": [
    "Local save header is invalid",
    "En-tête de sauvegarde locale invalide",
  ],
  "دفعة لاعبين غير سليمة": ["Invalid player batch", "Lot de joueurs invalide"],
  "عدد لاعبي الحفظ غير متطابق": [
    "Save player count mismatch",
    "Nombre de joueurs de la sauvegarde incohérent",
  ],
  "حجم الحفظ تجاوز ١٦٠ ميجابايت؛ لا يمكن إنشاء نسخة لا تقبل الاستيراد": [
    "The save exceeded 160 MB; a copy that cannot be imported will not be created",
    "La sauvegarde dépasse 160 Mo ; impossible de créer une copie non importable",
  ],
  "النسخة المضغوطة تجاوزت ٨٠ ميجابايت": [
    "The compressed copy exceeded 80 MB",
    "La copie compressée dépasse 80 Mo",
  ],
  "أقصى حجم للحفظ غير المضغوط ١٦٠ ميجابايت": [
    "Maximum uncompressed save size is 160 MB",
    "Taille maximale non compressée : 160 Mo",
  ],
  "أقصى حجم للملف المضغوط ٨٠ ميجابايت": [
    "Maximum compressed file size is 80 MB",
    "Taille maximale du fichier compressé : 80 Mo",
  ],
  "هذا المتصفح لا يفك الحفظ المضغوط؛ فك ملف gzip إلى JSON ثم استورده": [
    "This browser cannot decompress the save; unzip the gzip file to JSON and import that",
    "Ce navigateur ne décompresse pas la sauvegarde ; décompressez le gzip en JSON puis importez-le",
  ],
  "الحفظ بعد فك الضغط تجاوز حد ١٦٠ ميجابايت": [
    "The decompressed save exceeded the 160 MB limit",
    "La sauvegarde décompressée dépasse la limite de 160 Mo",
  ],

  // clubManagement.js leftover
  "التعويض عند الإقالة شهران عن كل سنة متبقية": [
    "Dismissal compensation is two months per remaining year",
    "L’indemnité de licenciement est de deux mois par année restante",
  ],

  // Game-state data values rendered directly (roles, feet, unknown nationality)
  أساسي: ["Starter", "Titulaire"],
  مداورة: ["Rotation", "Rotation"],
  بديل: ["Substitute", "Remplaçant"],
  "مشروع للمستقبل": ["Prospect", "Espoir"],
  يسرى: ["Left", "Gauche"],
  يمنى: ["Right", "Droit"],
  "منتخب ومسيرة محلية": [
    "National team and domestic career",
    "Sélection et carrière nationale",
  ],
  "مسيرة محلية ومنتخب": [
    "Domestic career and national team",
    "Carrière nationale et sélection",
  ],

  // data/catalog.js — legacy catalog copy
  "أسماء الأندية حقيقية. اللاعبون والقدرات والميزانيات والرعاة ونتائج المحاكاة تجريبية وليست بيانات واقعية":
    [
      "Club names are real. Players, abilities, budgets, sponsors and simulation results are experimental, not real-world data",
      "Les noms de clubs sont réels. Joueurs, capacités, budgets, sponsors et résultats de simulation sont expérimentaux, pas des données réelles",
    ],
  "طموح بلا سقف": ["Ambition without limits", "Une ambition sans plafond"],
  "قاعدة جماهيرية كبيرة، وضغط دائم لتحقيق الفوز": [
    "A huge fan base and constant pressure to win",
    "Un immense public et une pression permanente pour gagner",
  ],
  "اكتب فصلًا جديدًا": ["Write a new chapter", "Écrivez un nouveau chapitre"],
  "هوية كبيرة ومشروع يحتاج إلى قرارات ذكية": [
    "A big identity and a project that needs smart decisions",
    "Une grande identité et un projet qui exige des décisions intelligentes",
  ],
  "طموح مدينة كاملة": [
    "The ambition of a whole city",
    "L’ambition de toute une ville",
  ],
  "وازن بين تطوير النادي والمنافسة على القمة": [
    "Balance club development with competing at the top",
    "Conciliez développement du club et lutte pour le sommet",
  ],
  "من البحر إلى القمة": ["From the sea to the summit", "De la mer au sommet"],
  "ابنِ مؤسسة مستدامة، وامنح المواهب فرصة": [
    "Build a sustainable institution and give talent a chance",
    "Bâtissez une institution durable et donnez leur chance aux talents",
  ],
  "جودة أفضل للحصص اليومية، ومساحة أكبر لتطوير الفريق": [
    "Better daily sessions and more room to develop the team",
    "De meilleures séances quotidiennes et plus de marge pour développer l’équipe",
  ],
  "تجديد الملاعب وغرفة التحليل": [
    "Pitch renovation and analysis room",
    "Rénovation des terrains et salle d’analyse",
  ],
  "تحسن تدريجي لقدرات اللاعبين الصغار في المراجعة الشهرية، بشرط تعيين مدرب تطوير":
    [
      "Gradual improvement of young players in the monthly review, provided a development coach is appointed",
      "Progression graduelle des jeunes lors du bilan mensuel, à condition de nommer un entraîneur de développement",
    ],
  "مدرب تطوير لتفعيل أثر التطوير": [
    "A development coach to activate the development effect",
    "Un entraîneur de développement pour activer l’effet",
  ],
  "ملعبان · تجهيز أساسي": [
    "Two pitches · basic equipment",
    "Deux terrains · équipement de base",
  ],
  "استثمر في تجربة الجماهير، وليس في عدد المقاعد فقط": [
    "Invest in the fan experience, not only in seat count",
    "Investissez dans l’expérience des supporters, pas seulement dans le nombre de sièges",
  ],
  "توسعة المدرج الشرقي": [
    "East stand expansion",
    "Extension de la tribune est",
  ],
  "إضافة ٣٬٠٠٠ مقعد لكل توسعة. الدخل يعتمد على الحضور الفعلي؛ يُغلق ١٠٪ من السعة أثناء البناء":
    [
      "Adds 3,000 seats per expansion. Income depends on actual attendance; 10% of capacity closes during construction",
      "Ajoute 3 000 sièges par extension. Les recettes dépendent de l’affluence réelle ; 10 % de la capacité ferme pendant les travaux",
    ],
  "تكلفة تنظيم إضافية ضمن التشغيل": [
    "Extra organisation cost within operations",
    "Coût d’organisation supplémentaire dans l’exploitation",
  ],
  "مدرجات وخدمات أساسية": [
    "Basic stands and services",
    "Tribunes et services de base",
  ],
  "تأهيل أقوى ومتابعة أفضل لجاهزية اللاعبين": [
    "Stronger rehabilitation and better fitness monitoring",
    "Rééducation renforcée et meilleur suivi de la forme",
  ],
  "وحدة العلاج والاستشفاء": [
    "Treatment and recovery unit",
    "Unité de soins et de récupération",
  ],
  "تحسين استعادة الجاهزية اليومية بعد المباريات عند تشغيل الوحدة بأخصائي؛ لا يمنع الإصابات":
    [
      "Better daily recovery after matches when the unit runs with a specialist; it does not prevent injuries",
      "Meilleure récupération quotidienne après les matchs quand l’unité fonctionne avec un spécialiste ; n’empêche pas les blessures",
    ],
  "أخصائي تأهيل لتفعيل الاستشفاء": [
    "A rehabilitation specialist to activate recovery",
    "Un spécialiste de rééducation pour activer la récupération",
  ],
  "عيادة أولية": ["Basic clinic", "Clinique de base"],
  "ابنِ الطريق بين الموهبة والفريق الأول": [
    "Build the road from talent to first team",
    "Tracez la route du talent à l’équipe première",
  ],
  "سكن الناشئين وملعب إضافي": [
    "Youth residence and an extra pitch",
    "Résidence des jeunes et terrain supplémentaire",
  ],
  "استقبال موهبة تجريبية جديدة كل شهر بعد اكتمال المشروع وتعيين المدير، إذا توفرت مساحة بالقائمة":
    [
      "Receive a new trial talent every month once the project is complete and the director appointed, if the squad has room",
      "Accueil d’un nouveau talent d’essai chaque mois une fois le projet terminé et le directeur nommé, si l’effectif a de la place",
    ],
  "مدير أكاديمية لتفعيل استقبال المواهب": [
    "An academy director to activate talent intake",
    "Un directeur d’académie pour activer l’accueil des talents",
  ],
  "فريق ناشئين محلي": ["Local youth team", "Équipe de jeunes locale"],
  "نادي مصري تجريبي": ["Trial Egyptian club", "Club égyptien d’essai"],
  "نادي إنجليزي تجريبي": ["Trial English club", "Club anglais d’essai"],
  "نادي سعودي تجريبي": ["Trial Saudi club", "Club saoudien d’essai"],

  // data/legacyExpandedCatalog.js, expandedCatalog.js, asianGuests.js, fifaGuests.js
  "نادي حقيقي · قوائم منشورة غير معتمدة كقيد رسمي": [
    "Real club · published rosters, not certified as official registration",
    "Club réel · effectifs publiés, non certifiés comme enregistrement officiel",
  ],
  "درجة أولى": ["First division", "Première division"],
  "نادٍ حقيقي · لاعبون خياليون مولّدون · الجنيه وحدة الحساب في السيناريو": [
    "Real club · generated fictional players · the pound is the scenario’s unit of account",
    "Club réel · joueurs fictifs générés · la livre est l’unité de compte du scénario",
  ],
  "نادٍ حقيقي · عضوية منشورة غير معتمدة · لاعبون مولّدون": [
    "Real club · published membership, uncertified · generated players",
    "Club réel · appartenance publiée non certifiée · joueurs générés",
  ],
  "نادٍ حقيقي · قوائم مرجعية غير معتمدة كقيد رسمي": [
    "Real club · reference rosters, not certified as official registration",
    "Club réel · effectifs de référence, non certifiés comme enregistrement officiel",
  ],
  "نادٍ حقيقي من قائمة مرجعية؛ ضيف كؤوس بمحاكاة خفيفة دون دوري محلي أو قائمة لاعبين معتمدة":
    [
      "Real club from a reference list; a lightly simulated cup guest without a domestic league or certified roster",
      "Club réel issu d’une liste de référence ; invité de coupe en simulation légère, sans championnat national ni effectif certifié",
    ],
  "نادٍ حقيقي مشارك في مسار أوقيانوسيا الخفيف؛ القوة والمنشآت تقديرية ولا توجد قائمة لاعبين معتمدة":
    [
      "Real club in the light Oceania path; strength and facilities are estimated and there is no certified roster",
      "Club réel du parcours Océanie léger ; force et installations estimées, sans effectif certifié",
    ],

  // data/eventCatalog.js
  "إدارة العلاقات تقترح يومًا مفتوحًا في النادي. ميزانية واضحة مقابل تحسين العلاقة مع الجمهور":
    [
      "Community relations proposes an open day at the club. A clear budget in exchange for a better bond with the fans",
      "Les relations publiques proposent une journée portes ouvertes. Un budget clair contre un meilleur lien avec le public",
    ],
  "شريكك التجاري يقترح حملة محلية. المشاركة تحقق مبلغًا تعاقديًا لاحقًا، وليست ربحًا مضمونًا في كل حملات المستقبل":
    [
      "Your commercial partner proposes a local campaign. Taking part earns a contractual sum later, not a guaranteed profit in every future campaign",
      "Votre partenaire commercial propose une campagne locale. Y participer rapporte plus tard une somme contractuelle, pas un profit garanti pour toutes les campagnes futures",
    ],
  "الفحص الدوري كشف حاجة لصيانة إضافية. يمكنك المعالجة الكاملة أو إصلاحًا جزئيًا؛ التأجيل يخفض جاهزية الفريق في هذه الدورة":
    [
      "The routine inspection found extra maintenance needs. You can fix it fully or partially; postponing lowers team fitness this cycle",
      "L’inspection de routine révèle un besoin d’entretien supplémentaire. Réparation complète ou partielle ; reporter réduit la forme de l’équipe ce cycle",
    ],
  "عدد من اللاعبين يعانون إجهادًا تدريبيًا. القرار يوازن بين الاستشفاء والمعنويات والتكلفة":
    [
      "Several players suffer training fatigue. The decision balances recovery, morale and cost",
      "Plusieurs joueurs souffrent de fatigue d’entraînement. La décision arbitre entre récupération, moral et coût",
    ],
  "وصل طلب تجربة من لاعب ناشئ مولّد داخل عالم اللعبة. التجربة لا تضمن نجمًا، لكنها تمنحك فرصة تطويره":
    [
      "A trial request arrived from a youth player generated inside the game world. The trial guarantees no star, but gives you a chance to develop him",
      "Une demande d’essai est arrivée d’un jeune généré dans le monde du jeu. L’essai ne garantit pas une star, mais vous donne une chance de le former",
    ],
  "ممثلون للمشجعين يقترحون تمويل مبادرة حضور. الأثر الموضح على ثقة الجمهور؛ سعر التذكرة نفسه لا يتغير دون قرارك":
    [
      "Fan representatives propose funding an attendance initiative. The shown effect is on fan trust; the ticket price itself never changes without your decision",
      "Des représentants des supporters proposent de financer une initiative d’affluence. L’effet indiqué porte sur la confiance du public ; le prix du billet ne change pas sans votre décision",
    ],
  "الجهاز يقترح يومًا لبناء التفاهم بين اللاعبين. الوعود المحددة في العقود تظل مستقلة، ولا تمحوها الأنشطة الجماعية":
    [
      "The staff proposes a team-building day. Promises written in contracts remain separate and are not erased by group activities",
      "Le staff propose une journée de cohésion. Les promesses écrites dans les contrats restent distinctes et ne sont pas effacées par les activités de groupe",
    ],
  "المدير الرياضي يعرض مراجعة تقارير مرشحين من الأسواق المفعلة. التقرير يضيّق نطاق تقدير الإمكانات، ولا يكشف المستقبل يقينًا":
    [
      "The sporting director offers to review candidate reports from the active markets. A report narrows the potential estimate; it never reveals the future for certain",
      "Le directeur sportif propose d’examiner des rapports de candidats des marchés actifs. Un rapport resserre l’estimation du potentiel ; il ne révèle jamais l’avenir avec certitude",
    ],

  // data/currencies.js
  "جنيه مصري": ["Egyptian pound", "Livre égyptienne"],
  "جنيه إسترليني": ["Pound sterling", "Livre sterling"],
  "ريال سعودي": ["Saudi riyal", "Riyal saoudien"],
  يورو: ["Euro", "Euro"],
  "ليرة تركية": ["Turkish lira", "Livre turque"],
  "فرنك سويسري": ["Swiss franc", "Franc suisse"],
  "كرونة دنماركية": ["Danish krone", "Couronne danoise"],
  "كرونة سويدية": ["Swedish krona", "Couronne suédoise"],
  "كرونة نرويجية": ["Norwegian krone", "Couronne norvégienne"],
  "زلوتي بولندي": ["Polish złoty", "Złoty polonais"],
  "كرونة تشيكية": ["Czech koruna", "Couronne tchèque"],
  "دينار صربي": ["Serbian dinar", "Dinar serbe"],
  "ليو روماني": ["Romanian leu", "Leu roumain"],
  "هريفنيا أوكرانية": ["Ukrainian hryvnia", "Hryvnia ukrainienne"],
  "روبل روسي": ["Russian ruble", "Rouble russe"],
  "فورنت مجري": ["Hungarian forint", "Forint hongrois"],
  "ريال برازيلي": ["Brazilian real", "Réal brésilien"],
  "بيزو أرجنتيني": ["Argentine peso", "Peso argentin"],
  "بيزو أوروغوياني": ["Uruguayan peso", "Peso uruguayen"],
  "بيزو كولومبي": ["Colombian peso", "Peso colombien"],
  "بيزو تشيلي": ["Chilean peso", "Peso chilien"],
  "دولار أمريكي": ["US dollar", "Dollar américain"],
  "غواراني باراغوياني": ["Paraguayan guaraní", "Guaraní paraguayen"],
  "سول بيروفي": ["Peruvian sol", "Sol péruvien"],
  بوليفيانو: ["Boliviano", "Boliviano"],
  "بوليفار فنزويلي": ["Venezuelan bolívar", "Bolívar vénézuélien"],
  "بيزو مكسيكي": ["Mexican peso", "Peso mexicain"],
  "ين ياباني": ["Japanese yen", "Yen japonais"],
  "وون كوري": ["Korean won", "Won coréen"],
  "يوان صيني": ["Chinese yuan", "Yuan chinois"],
  "دولار أسترالي": ["Australian dollar", "Dollar australien"],
  "ريال قطري": ["Qatari riyal", "Riyal qatari"],
  "درهم إماراتي": ["UAE dirham", "Dirham des Émirats"],
  "درهم مغربي": ["Moroccan dirham", "Dirham marocain"],
  "دينار تونسي": ["Tunisian dinar", "Dinar tunisien"],
  "دينار جزائري": ["Algerian dinar", "Dinar algérien"],
  "راند جنوب أفريقي": ["South African rand", "Rand sud-africain"],
  "روبية هندية": ["Indian rupee", "Roupie indienne"],
  "باهت تايلاندي": ["Thai baht", "Baht thaïlandais"],
  "ر.س": "SAR",
  "ر.ق": "QAR",
  "د.إ": "AED",
  "د.م": "MAD",
  "د.ت": "TND",
  "د.ج": "DZD",
};
