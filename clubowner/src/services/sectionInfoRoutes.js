// الدفعة 6 — القسم 7 (بند 6ب): بطاقة تعريف لكل قسم في الشريط الجانبي.
// كل بطاقة 2–4 سطور بثلاث لغات (حد أقصى 6). تُقرأ عبر SECTION_INFO في sectionInfo.js.
export const ROUTE_INFO = Object.freeze({
  dashboard: {
    ar: ["مكتب المالك: ملخص يومي للنادي.", "الخزينة والمباريات القادمة والقرارات المعلقة في مكان واحد.", "كل بطاقة تفتح شاشتها الكاملة."],
    en: ["Owner's office: a daily summary of the club.", "Cash, next matches and pending decisions in one place.", "Each card opens its full screen."],
    fr: ["Bureau du propriétaire : résumé quotidien du club.", "Trésorerie, prochains matchs et décisions en attente au même endroit.", "Chaque carte ouvre son écran complet."],
  },
  inbox: {
    ar: ["البريد الوارد: رسائل النادي والقرارات المطلوبة.", "القرار المطلوب يتوقف عنده الوقت حتى تحسمه."],
    en: ["Inbox: club messages and required decisions.", "A required decision pauses time until you settle it."],
    fr: ["Boîte de réception : messages du club et décisions requises.", "Une décision requise met le temps en pause jusqu'à ce que vous la tranchiez."],
  },
  empire: {
    ar: ["القصر: ثروتك الشخصية وأصولك وعائلتك.", "معيشتك وأصولك تُحسب شهريًا ولا تمسّ خزينة النادي."],
    en: ["The palace: your personal wealth, assets and family.", "Your lifestyle and assets are settled monthly and never touch the club treasury."],
    fr: ["Le palais : votre fortune personnelle, vos actifs et votre famille.", "Votre train de vie et vos actifs se règlent chaque mois, sans toucher à la trésorerie."],
  },
  board: {
    ar: ["الجمعية العمومية: لائحة الموسم والتصويت عليها.", "الالتزام بالأهداف يرفع الثقة، والتأخر يعني تحذيرًا."],
    en: ["General assembly: the season mandate and its vote.", "Meeting targets raises confidence; falling behind brings a warning."],
    fr: ["Assemblée générale : mandat de la saison et son vote.", "Atteindre les objectifs renforce la confiance ; un retard entraîne un avertissement."],
  },
  politics: {
    ar: ["رئاسة الاتحاد: الحملات الانتخابية والحوكمة والتوزيعات.", "القرارات السياسية تُحسم في نهاية موسم الحملة."],
    en: ["Federation presidency: campaigns, governance and distributions.", "Political decisions are settled at the end of the campaign season."],
    fr: ["Présidence de la fédération : campagnes, gouvernance et répartitions.", "Les décisions politiques se tranchent à la fin de la saison de campagne."],
  },
  black: {
    ar: ["الملفات السوداء: عمليات سرية ولها ثمن.", "الشبهات ترتفع مع كل عملية، وتؤثر في السمعة والجماهير."],
    en: ["Black files: secret operations with a price.", "Suspicion rises with each operation and affects reputation and fans."],
    fr: ["Dossiers noirs : opérations secrètes, avec un prix.", "Les soupçons montent à chaque opération et pèsent sur la réputation et les supporters."],
  },
  squad: {
    ar: ["الفريق الأول: اللاعبون وعقودهم وحالتهم البدنية.", "تابع التشكيل والإصابات والعقود قبل كل جولة."],
    en: ["First team: players, contracts and fitness.", "Check the line-up, injuries and contracts before each round."],
    fr: ["Équipe première : joueurs, contrats et forme.", "Vérifiez la composition, les blessures et les contrats avant chaque journée."],
  },
  transfers: {
    ar: ["سوق الانتقالات: عروض الشراء والتفاوض مع اللاعبين.", "الصفقات الكبيرة تحتاج تأكيدًا، وتمنعها وضع الإجازة."],
    en: ["Transfer market: buying offers and player negotiations.", "Big deals need confirmation, and holiday mode blocks them."],
    fr: ["Marché des transferts : offres d'achat et négociations.", "Les grosses opérations exigent une confirmation, bloquée par le mode vacances."],
  },
  database: {
    ar: ["قاعدة اللاعبين: بحث في كل اللاعبين المعروفين.", "استخدمها للمقارنة قبل أي عرض."],
    en: ["Player database: search every known player.", "Use it to compare before any offer."],
    fr: ["Base de joueurs : recherche parmi tous les joueurs connus.", "Utilisez-la pour comparer avant toute offre."],
  },
  careers: {
    ar: ["المواهب والجهاز الفني: الأكاديمية والمدربون والمواهب الصاعدة.", "التطوير يحتاج وقتًا، والنتائج تظهر في المواسم."],
    en: ["Talent & staff: academy, coaches and rising talents.", "Development takes time, and results show across seasons."],
    fr: ["Talents et encadrement : académie, entraîneurs et jeunes talents.", "Le développement prend du temps ; les résultats se voient sur plusieurs saisons."],
  },
  management: {
    ar: ["الإدارة الرياضية: التكتيك وطريقة اللعب.", "التكتيك يؤثر في نتائج المباريات وإيقاع اللعب."],
    en: ["Sporting management: tactics and style of play.", "Tactics affect results and the rhythm of matches."],
    fr: ["Gestion sportive : tactique et style de jeu.", "La tactique influence les résultats et le rythme des matchs."],
  },
  staff: {
    ar: ["الإدارة الشاملة: الموظفون والأقسام الإدارية.", "رواتب الجهاز تُصرف أول كل شهر."],
    en: ["Full management: staff and administrative departments.", "Staff salaries are paid at the start of each month."],
    fr: ["Direction générale : personnel et services administratifs.", "Les salaires du personnel sont versés au début de chaque mois."],
  },
  press: {
    ar: ["غرفة الصحافة: الأخبار والتصريحات وتأثيرها.", "الصحافة تتابع الصفقات والنتائج، وتؤثر في الرأي العام."],
    en: ["Press room: news, statements and their impact.", "The press follows deals and results, and shapes public opinion."],
    fr: ["Salle de presse : actualités, déclarations et leur impact.", "La presse suit transferts et résultats, et influence l'opinion."],
  },
  ultras: {
    ar: ["الجماهير والألتراس: مزاج المشجعين ومجموعاتهم.", "القرارات تؤثر في المزاج، والاشتباكات تكلف غرامات."],
    en: ["Supporters & ultras: fan mood and their groups.", "Decisions shift the mood, and clashes cost fines."],
    fr: ["Supporters et ultras : humeur des fans et de leurs groupes.", "Les décisions changent l'humeur ; les affrontements coûtent des amendes."],
  },
  facilities: {
    ar: ["منشآت النادي: تطوير الملاعب والمرافق.", "كل منشأة لها تكلفة شهرية وأثر على الأداء والدخل."],
    en: ["Club facilities: stadium and amenity upgrades.", "Each facility has a monthly cost and affects performance and income."],
    fr: ["Installations du club : améliorations du stade et des équipements.", "Chaque installation a un coût mensuel et influe sur la performance et les revenus."],
  },
  sponsors: {
    ar: ["الرعايات: عقود الرعاة وعوائدها.", "الرعاية تدفع حسب المدة والشروط المتفق عليها."],
    en: ["Sponsorships: sponsor contracts and their returns.", "Sponsors pay according to the agreed duration and terms."],
    fr: ["Sponsors : contrats des partenaires et leurs revenus.", "Les sponsors paient selon la durée et les conditions convenues."],
  },
  commerce: {
    ar: ["دخل النادي: التذاكر والمتجر والاشتراكات.", "الدخل يتغير مع النتائج والجماهير والسمعة."],
    en: ["Club income: tickets, shop and subscriptions.", "Income changes with results, fans and reputation."],
    fr: ["Revenus du club : billets, boutique et abonnements.", "Les revenus varient avec les résultats, les supporters et la réputation."],
  },
  finance: {
    ar: ["الإدارة المالية: الخزينة والالتزامات والتدفقات.", "المرتبات والتشغيل يُصرفان أول كل شهر."],
    en: ["Financial management: treasury, obligations and cash flow.", "Wages and operations are paid at the start of each month."],
    fr: ["Gestion financière : trésorerie, engagements et flux.", "Salaires et exploitation sont payés en début de mois."],
  },
  market: {
    ar: ["بورصة الأندية: أسهم الأندية وتداولها.", "أسعار الأسهم تتحرك مع الأحداث والنتائج."],
    en: ["Club exchange: club shares and trading.", "Share prices move with events and results."],
    fr: ["Bourse des clubs : actions des clubs et négociations.", "Les cours bougent avec les événements et les résultats."],
  },
  world: {
    ar: ["عالم الكرة: الدوريات والبطولات الأخرى.", "تابع ما يحدث خارج ناديك."],
    en: ["World of football: other leagues and competitions.", "Follow what happens beyond your club."],
    fr: ["Monde du football : autres championnats et compétitions.", "Suivez ce qui se passe au-delà de votre club."],
  },
  legends: {
    ar: ["قاعة الأساطير: لاعبون سابقون يعودون للنادي.", "الأساطير يدعمون الفريق ويكلفون مرتبات محددة."],
    en: ["Hall of legends: former players returning to the club.", "Legends support the team for agreed salaries."],
    fr: ["Panthéon des légendes : anciens joueurs de retour au club.", "Les légendes soutiennent l'équipe pour des salaires convenus."],
  },
  awards: {
    ar: ["الجوائز وقاعة المشاهير: جوائز الموسم والمشاهير.", "المدخلون إلى قاعة المشاهير تُسجَّل هنا."],
    en: ["Awards & hall of fame: season awards and inductees.", "Hall of fame inductees are recorded here."],
    fr: ["Prix et panthéon : prix de la saison et intronisés.", "Les intronisés du panthéon sont inscrits ici."],
  },
  dynasty: {
    ar: ["الأجيال: عائلة المالك وخلافة الملكية.", "القرارات العائلية تؤثر في الإرث ونقاطه."],
    en: ["Generations: the owner's family and succession.", "Family decisions shape the legacy and its points."],
    fr: ["Générations : famille du propriétaire et succession.", "Les décisions familiales façonnent l'héritage et ses points."],
  },
});
