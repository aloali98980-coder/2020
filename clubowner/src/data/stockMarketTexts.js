// بورصة الأندية 0.37 — كل نص جديد له نسخة عربية وإنجليزية وفرنسية من مصدر واحد.
export const STOCK_MARKET_TEXTS = Object.freeze({
  marketName: {
    ar: "بورصة الأندية",
    en: "Club Exchange",
    fr: "Bourse des clubs",
  },
  marketKicker: {
    ar: "النتائج والألقاب والصفقات والأسرار تتحول هنا إلى أسعار.",
    en: "Results, trophies, transfers and secrets become prices here.",
    fr: "Résultats, trophées, transferts et secrets deviennent ici des cours.",
  },
  overview: { ar: "السوق", en: "Market", fr: "Marché" },
  trading: {
    ar: "التداول والمحفظة",
    en: "Trading & portfolio",
    fr: "Négoce et portefeuille",
  },
  insider: {
    ar: "المعلومات الداخلية",
    en: "Inside information",
    fr: "Informations privilégiées",
  },
  regulation: { ar: "الرقابة", en: "Regulation", fr: "Régulation" },
  listings: { ar: "الأسهم المدرجة", en: "Listed shares", fr: "Actions cotées" },
  index: {
    ar: "مؤشر إمباير العام",
    en: "Empire All-Club Index",
    fr: "Indice général Empire",
  },
  indexHint: {
    ar: "مؤشر موزون بالقيمة السوقية لكل أندية عالم حفظتك.",
    en: "A market-cap weighted index of every club in your saved world.",
    fr: "Un indice pondéré par la capitalisation de tous les clubs de votre monde sauvegardé.",
  },
  sharePrice: { ar: "سعر السهم", en: "Share price", fr: "Cours de l’action" },
  monthlyChange: {
    ar: "التغير الشهري",
    en: "Monthly change",
    fr: "Variation mensuelle",
  },
  marketCap: {
    ar: "القيمة السوقية",
    en: "Market capitalisation",
    fr: "Capitalisation",
  },
  history: {
    ar: "تاريخ السعر",
    en: "Price history",
    fr: "Historique du cours",
  },
  privateClub: {
    ar: "خاص — قبل الاكتتاب",
    en: "Private — pre-IPO",
    fr: "Privé — avant introduction",
  },
  listed: { ar: "مدرج", en: "Listed", fr: "Coté" },
  halted: { ar: "موقوف", en: "Halted", fr: "Suspendu" },
  distressed: { ar: "متعثر", en: "Distressed", fr: "En difficulté" },
  noHistory: {
    ar: "يبدأ الرسم من أول تسعير شهري.",
    en: "The chart starts with the first monthly quote.",
    fr: "Le graphique commence au premier cours mensuel.",
  },
  priceEngine: {
    ar: "محرك التسعير يقرأ النتائج والألقاب والصفقات والفضائح والإصابات وقرارات الاتحاد وافتتاح المنشآت.",
    en: "The pricing engine reads results, trophies, transfers, scandals, injuries, federation decisions and facility openings.",
    fr: "Le moteur de prix tient compte des résultats, trophées, transferts, scandales, blessures, décisions fédérales et ouvertures d’installations.",
  },
  allClubs: { ar: "كل الأندية", en: "All clubs", fr: "Tous les clubs" },
  gainers: {
    ar: "الأكثر صعودًا",
    en: "Top gainers",
    fr: "Plus fortes hausses",
  },
  losers: { ar: "الأكثر هبوطًا", en: "Top losers", fr: "Plus fortes baisses" },
  ownClub: { ar: "ناديك", en: "Your club", fr: "Votre club" },
  searchClub: {
    ar: "ابحث عن نادٍ",
    en: "Search for a club",
    fr: "Rechercher un club",
  },
  lastUpdate: { ar: "آخر تسعير", en: "Last pricing", fr: "Dernière cotation" },
  neutralCycle: {
    ar: "سوق متوازن",
    en: "Balanced market",
    fr: "Marché équilibré",
  },
  initialMarket: {
    ar: "سوق أولي بلا محفظة؛ يمكنك بدء التداول متى أردت.",
    en: "An initial market with an empty portfolio; trade whenever you wish.",
    fr: "Un marché initial avec un portefeuille vide ; négociez quand vous le souhaitez.",
  },
  migrationNote: {
    ar: "البورصة 0.37: أُنشئت أسعار أولية لكل الأندية ومحفظة فارغة دون المساس بثروتك أو نتائجك السابقة.",
    en: "Exchange 0.37: initial prices were created for every club and an empty portfolio was added without changing prior wealth or results.",
    fr: "Bourse 0.37 : des cours initiaux ont été créés pour chaque club et un portefeuille vide a été ajouté sans modifier la fortune ni les résultats antérieurs.",
  },
  invalidListing: {
    ar: "السهم غير موجود.",
    en: "The share does not exist.",
    fr: "L’action n’existe pas.",
  },
  invalidSignal: {
    ar: "إشارة السوق غير صالحة.",
    en: "Invalid market signal.",
    fr: "Signal de marché invalide.",
  },
  marketUpdated: {
    ar: "تحدثت أسعار البورصة.",
    en: "Exchange prices updated.",
    fr: "Les cours de la bourse ont été actualisés.",
  },
  portfolio: { ar: "محفظتي", en: "My portfolio", fr: "Mon portefeuille" },
  personalWealth: {
    ar: "الثروة الشخصية",
    en: "Personal wealth",
    fr: "Fortune personnelle",
  },
  portfolioValue: {
    ar: "قيمة المحفظة",
    en: "Portfolio value",
    fr: "Valeur du portefeuille",
  },
  costBasis: { ar: "تكلفة الشراء", en: "Cost basis", fr: "Prix de revient" },
  unrealizedProfit: {
    ar: "ربح غير محقق",
    en: "Unrealised profit",
    fr: "Gain latent",
  },
  realizedProfit: { ar: "ربح محقق", en: "Realised profit", fr: "Gain réalisé" },
  dividends: { ar: "أرباح موزعة", en: "Dividends", fr: "Dividendes" },
  quantity: { ar: "عدد الأسهم", en: "Shares", fr: "Nombre d’actions" },
  averagePrice: { ar: "متوسط الشراء", en: "Average price", fr: "Prix moyen" },
  buyShares: { ar: "شراء أسهم", en: "Buy shares", fr: "Acheter des actions" },
  sellShares: { ar: "بيع أسهم", en: "Sell shares", fr: "Vendre des actions" },
  orderEstimate: {
    ar: "تقدير الأمر",
    en: "Order estimate",
    fr: "Estimation de l’ordre",
  },
  brokerageFee: {
    ar: "عمولة السمسرة",
    en: "Brokerage fee",
    fr: "Frais de courtage",
  },
  total: { ar: "الإجمالي", en: "Total", fr: "Total" },
  holdings: { ar: "مراكزي", en: "Holdings", fr: "Positions" },
  noHoldings: {
    ar: "لا تملك أسهمًا بعد.",
    en: "You do not own shares yet.",
    fr: "Vous ne détenez pas encore d’actions.",
  },
  dividendHint: {
    ar: "الأندية والشركات الرابحة توزع جزءًا من أرباحها شهريًا مباشرة إلى ثروتك.",
    en: "Profitable clubs and companies distribute part of their monthly profits directly to your wealth.",
    fr: "Les clubs et sociétés bénéficiaires versent une part de leurs profits mensuels directement à votre fortune.",
  },
  orderBought: {
    ar: "تم شراء الأسهم من ثروتك الشخصية.",
    en: "Shares bought from your personal wealth.",
    fr: "Actions achetées avec votre fortune personnelle.",
  },
  orderSold: {
    ar: "تم بيع الأسهم وإعادة العائد إلى ثروتك.",
    en: "Shares sold and proceeds returned to your wealth.",
    fr: "Actions vendues et produit reversé à votre fortune.",
  },
  invalidQuantity: {
    ar: "عدد الأسهم غير صالح.",
    en: "Invalid share quantity.",
    fr: "Nombre d’actions invalide.",
  },
  notTradable: {
    ar: "هذا السهم غير متاح للتداول الآن.",
    en: "This share is not tradable now.",
    fr: "Cette action n’est pas négociable actuellement.",
  },
  tradingSuspended: {
    ar: "التداول موقوف بأمر الهيئة الرقابية.",
    en: "Trading is suspended by the regulator.",
    fr: "La négociation est suspendue par le régulateur.",
  },
  insufficientWealth: {
    ar: "ثروتك الشخصية لا تكفي لتنفيذ الأمر.",
    en: "Your personal wealth is insufficient for this order.",
    fr: "Votre fortune personnelle ne suffit pas pour cet ordre.",
  },
  insufficientShares: {
    ar: "لا تملك هذا العدد من الأسهم.",
    en: "You do not own that many shares.",
    fr: "Vous ne détenez pas autant d’actions.",
  },
  dividendPaid: {
    ar: "وصلت أرباح الأسهم إلى ثروتك.",
    en: "Share dividends reached your wealth.",
    fr: "Les dividendes ont été versés à votre fortune.",
  },
  secrets: {
    ar: "أسرارك في السوق 😈",
    en: "Your market secrets 😈",
    fr: "Vos secrets de marché 😈",
  },
  manipulation: {
    ar: "التلاعب والشائعات",
    en: "Manipulation & rumours",
    fr: "Manipulation et rumeurs",
  },
  insideKnowledge: {
    ar: "معلومات لم يعرفها السوق بعد",
    en: "Information the market does not know yet",
    fr: "Informations encore inconnues du marché",
  },
  noInsideKnowledge: {
    ar: "لا توجد معلومة داخلية نشطة الآن.",
    en: "There is no active inside information now.",
    fr: "Aucune information privilégiée n’est active actuellement.",
  },
  plannedTransfer: {
    ar: "صفقة قبل الإعلان",
    en: "Deal before announcement",
    fr: "Transfert avant annonce",
  },
  coachDismissal: {
    ar: "إقالة مدرب قبل الإعلان",
    en: "Coach dismissal before announcement",
    fr: "Limogeage avant annonce",
  },
  federationLaw: {
    ar: "قانون اتحاد قبل التصويت",
    en: "Federation law before the vote",
    fr: "Loi fédérale avant le vote",
  },
  facilityOpening: {
    ar: "افتتاح منشأة قبل الإعلان",
    en: "Facility opening before announcement",
    fr: "Ouverture d’installation avant annonce",
  },
  injurySecret: {
    ar: "إصابة لم تُعلن",
    en: "Unannounced injury",
    fr: "Blessure non annoncée",
  },
  expectedMove: {
    ar: "الحركة المتوقعة",
    en: "Expected move",
    fr: "Mouvement attendu",
  },
  publicDate: {
    ar: "موعد الإعلان",
    en: "Public date",
    fr: "Date de publication",
  },
  profitPotential: {
    ar: "ربح محتمل",
    en: "Profit potential",
    fr: "Gain potentiel",
  },
  detectionRisk: {
    ar: "خطر الكشف",
    en: "Detection risk",
    fr: "Risque de détection",
  },
  tradeInsideBuy: {
    ar: "شراء بالمعلومة 😈",
    en: "Buy on the tip 😈",
    fr: "Acheter sur l’info 😈",
  },
  tradeInsideSell: {
    ar: "بيع بالمعلومة 😈",
    en: "Sell on the tip 😈",
    fr: "Vendre sur l’info 😈",
  },
  planSecret: {
    ar: "خطط سرًا",
    en: "Plan in secret",
    fr: "Planifier en secret",
  },
  duplicateSecret: {
    ar: "هذه المعلومة مسجلة بالفعل.",
    en: "This information is already recorded.",
    fr: "Cette information est déjà enregistrée.",
  },
  invalidSecret: {
    ar: "المعلومة الداخلية غير صالحة.",
    en: "Invalid inside information.",
    fr: "Information privilégiée invalide.",
  },
  secretUsed: {
    ar: "تداولت قبل الإعلان؛ الهيئة قد تربط التوقيت بك.",
    en: "You traded before disclosure; the regulator may connect the timing to you.",
    fr: "Vous avez négocié avant publication ; le régulateur peut relier le timing à vous.",
  },
  wrongInsideDirection: {
    ar: "هذا الأمر لا يستفيد من اتجاه المعلومة.",
    en: "This order does not benefit from the information’s direction.",
    fr: "Cet ordre ne profite pas du sens de l’information.",
  },
  channelRumor: {
    ar: "زرع شائعة عبر القناة والسوشيال",
    en: "Plant a rumour through your channel and social media",
    fr: "Lancer une rumeur via votre chaîne et les réseaux",
  },
  pumpCampaign: {
    ar: "تضخيم ثم بيع",
    en: "Pump and dump",
    fr: "Gonfler puis vendre",
  },
  negativeRumor: {
    ar: "حرب شائعات هابطة",
    en: "Bearish rumour war",
    fr: "Guerre de rumeurs baissières",
  },
  shortSell: {
    ar: "بيع على المكشوف",
    en: "Short selling",
    fr: "Vente à découvert",
  },
  shortBeforePoach: {
    ar: "بيع المنافس قبل خطف نجمه 😈",
    en: "Short the rival before poaching its star 😈",
    fr: "Vendre le rival avant de lui prendre sa star 😈",
  },
  closeShort: {
    ar: "إغلاق البيع المكشوف",
    en: "Close short",
    fr: "Clôturer la vente à découvert",
  },
  dumpNow: {
    ar: "ارمِ الأسهم الآن",
    en: "Dump the shares now",
    fr: "Vendre les actions maintenant",
  },
  campaignBudget: {
    ar: "ميزانية الشائعة",
    en: "Rumour budget",
    fr: "Budget de la rumeur",
  },
  activeCampaigns: {
    ar: "عمليات نشطة",
    en: "Active operations",
    fr: "Opérations actives",
  },
  whistleblower: {
    ar: "مبلغ داخلي سلّم أدلة للهيئة!",
    en: "A whistleblower gave evidence to the regulator!",
    fr: "Un lanceur d’alerte a remis des preuves au régulateur !",
  },
  regulatorName: {
    ar: "هيئة نزاهة الأسواق الرياضية",
    en: "Sports Market Integrity Authority",
    fr: "Autorité d’intégrité des marchés sportifs",
  },
  regulatorRisk: {
    ar: "مؤشر المخاطر الرقابية",
    en: "Regulatory risk score",
    fr: "Indice de risque réglementaire",
  },
  cleanStatus: { ar: "ملف نظيف", en: "Clear file", fr: "Dossier vierge" },
  watchStatus: {
    ar: "تحت المراقبة",
    en: "Under watch",
    fr: "Sous surveillance",
  },
  investigationStatus: {
    ar: "تحقيق مفتوح",
    en: "Open investigation",
    fr: "Enquête ouverte",
  },
  criminalStatus: {
    ar: "فضيحة جنائية",
    en: "Criminal scandal",
    fr: "Scandale pénal",
  },
  auditNow: {
    ar: "اطلب تدقيقًا طوعيًا",
    en: "Request voluntary audit",
    fr: "Demander un audit volontaire",
  },
  cooperate: {
    ar: "تعاون مع التحقيق",
    en: "Cooperate with investigation",
    fr: "Coopérer avec l’enquête",
  },
  fightCase: {
    ar: "قاوم الاتهام",
    en: "Fight the case",
    fr: "Contester l’accusation",
  },
  auditClean: {
    ar: "أغلق التدقيق بلا مخالفة.",
    en: "The audit closed without a breach.",
    fr: "L’audit s’est achevé sans infraction.",
  },
  auditOpened: {
    ar: "فتح المنظم تحقيقًا رسميًا.",
    en: "The regulator opened a formal investigation.",
    fr: "Le régulateur a ouvert une enquête officielle.",
  },
  marketFine: {
    ar: "غرامة تلاعب أو تداول داخلي",
    en: "Manipulation or insider-trading fine",
    fr: "Amende pour manipulation ou délit d’initié",
  },
  marketSuspension: {
    ar: "إيقاف التداول والتحقيق مستمران.",
    en: "Trading suspension and investigation continue.",
    fr: "La suspension des échanges et l’enquête se poursuivent.",
  },
  criminalScandal: {
    ar: "فضيحة تداول جنائية تهدد رئاستك!",
    en: "A criminal trading scandal threatens your presidency!",
    fr: "Un scandale boursier pénal menace votre présidence !",
  },
  removedFromOffice: {
    ar: "عُزلت من رئاسة الاتحاد بسبب الفضيحة.",
    en: "You were removed from the federation presidency over the scandal.",
    fr: "Vous avez été destitué de la présidence fédérale à cause du scandale.",
  },
  invalidCampaign: {
    ar: "عملية التلاعب غير صالحة.",
    en: "Invalid manipulation operation.",
    fr: "Opération de manipulation invalide.",
  },
  campaignStarted: {
    ar: "بدأت حملة السوق؛ الربح كبير والجريمة أكبر إن كُشفت.",
    en: "The market campaign started; the profit is huge and so is the crime if exposed.",
    fr: "La campagne de marché a commencé ; le gain est énorme, tout comme le crime s’il est découvert.",
  },
  shortOpened: {
    ar: "فُتح مركز بيع مكشوف.",
    en: "Short position opened.",
    fr: "Position vendeuse ouverte.",
  },
  shortClosed: {
    ar: "أُغلق مركز البيع المكشوف.",
    en: "Short position closed.",
    fr: "Position vendeuse clôturée.",
  },
  insufficientMargin: {
    ar: "ثروتك لا تكفي لهامش البيع المكشوف.",
    en: "Your wealth cannot cover the short margin.",
    fr: "Votre fortune ne couvre pas la marge de la vente à découvert.",
  },
  ipos: { ar: "الاكتتابات", en: "IPOs", fr: "Introductions en bourse" },
  ipo: { ar: "طرح للاكتتاب", en: "Launch IPO", fr: "Lancer l’introduction" },
  bettingIpo: {
    ar: "اكتتاب شركة المراهنات",
    en: "Betting company IPO",
    fr: "Introduction de la société de paris",
  },
  clubIpo: {
    ar: "إدراج ناديك جماهيريًا",
    en: "List your club for the fans",
    fr: "Introduire votre club auprès des supporters",
  },
  secondaryOffering: {
    ar: "بيع حصة إضافية",
    en: "Sell another stake",
    fr: "Vendre une participation supplémentaire",
  },
  offerPercent: {
    ar: "الحصة المطروحة",
    en: "Stake offered",
    fr: "Part proposée",
  },
  ipoDiscount: {
    ar: "خصم الاكتتاب",
    en: "IPO discount",
    fr: "Décote d’introduction",
  },
  ipoProceeds: {
    ar: "حصيلة الاكتتاب",
    en: "IPO proceeds",
    fr: "Produit de l’introduction",
  },
  founderStake: {
    ar: "حصة المؤسس",
    en: "Founder stake",
    fr: "Part du fondateur",
  },
  fanShareholders: {
    ar: "مساهمون من الجماهير",
    en: "Fan shareholders",
    fr: "Supporters actionnaires",
  },
  quarterlyPressure: {
    ar: "ضغط النتائج الربعية",
    en: "Quarterly pressure",
    fr: "Pression trimestrielle",
  },
  nextQuarterReview: {
    ar: "المراجعة الربعية القادمة",
    en: "Next quarterly review",
    fr: "Prochaine revue trimestrielle",
  },
  bettingNotEligible: {
    ar: "شركة المراهنات غير مؤهلة للاكتتاب الآن.",
    en: "The betting company is not eligible for an IPO now.",
    fr: "La société de paris n’est pas éligible à une introduction actuellement.",
  },
  bettingCompanyGeneric: {
    ar: "شركة مراهنات",
    en: "Betting company",
    fr: "Société de paris",
  },
  invalidMarketState: {
    ar: "حالة بورصة الأندية غير سليمة.",
    en: "The club exchange state is invalid.",
    fr: "L’état de la bourse des clubs est invalide.",
  },
  invalidListingSave: {
    ar: "سجل سهم غير صالح في ملف الحفظ.",
    en: "The save contains an invalid share record.",
    fr: "La sauvegarde contient un enregistrement d’action invalide.",
  },
  invalidClubReference: {
    ar: "مرجع نادي البورصة غير صالح.",
    en: "The exchange club reference is invalid.",
    fr: "La référence du club coté est invalide.",
  },
  invalidCompanyReference: {
    ar: "مرجع شركة البورصة غير صالح.",
    en: "The exchange company reference is invalid.",
    fr: "La référence de la société cotée est invalide.",
  },
  invalidMarketIndex: {
    ar: "مؤشر البورصة غير صالح.",
    en: "The market index is invalid.",
    fr: "L’indice boursier est invalide.",
  },
  invalidTradingPortfolio: {
    ar: "محفظة تداول المالك غير سليمة.",
    en: "The owner’s trading portfolio is invalid.",
    fr: "Le portefeuille de négociation du propriétaire est invalide.",
  },
  invalidRegulatorState: {
    ar: "حالة رقابة البورصة غير سليمة.",
    en: "The market regulator state is invalid.",
    fr: "L’état du régulateur du marché est invalide.",
  },
  invalidAbuseRecords: {
    ar: "سجلات الداخلي والتلاعب غير سليمة.",
    en: "The insider and manipulation records are invalid.",
    fr: "Les registres d’initiés et de manipulation sont invalides.",
  },
  invalidIpoRecords: {
    ar: "سجل الاكتتابات غير سليم.",
    en: "The IPO records are invalid.",
    fr: "Les registres d’introduction en bourse sont invalides.",
  },
  invalidCycleRecords: {
    ar: "دورات وأحداث البورصة غير سليمة.",
    en: "The market cycles and events are invalid.",
    fr: "Les cycles et événements du marché sont invalides.",
  },
  clubAlreadyListed: {
    ar: "النادي مدرج بالفعل.",
    en: "The club is already listed.",
    fr: "Le club est déjà coté.",
  },
  invalidIpo: {
    ar: "شروط الاكتتاب غير صالحة.",
    en: "Invalid IPO terms.",
    fr: "Conditions d’introduction invalides.",
  },
  bettingIpoDone: {
    ar: "أدرجت شركة المراهنات وقبضت حصيلة بيع الحصة.",
    en: "The betting company was listed and you received the stake proceeds.",
    fr: "La société de paris a été cotée et vous avez reçu le produit de la participation.",
  },
  clubIpoDone: {
    ar: "أدرجت النادي؛ دخلت السيولة خزينته وصار للجماهير صوت كمساهمين.",
    en: "The club was listed; cash entered its treasury and fans gained a shareholder voice.",
    fr: "Le club a été coté ; la trésorerie a reçu les fonds et les supporters ont acquis une voix d’actionnaires.",
  },
  goodQuarter: {
    ar: "ربع قوي هدّأ المساهمين.",
    en: "A strong quarter calmed shareholders.",
    fr: "Un bon trimestre a rassuré les actionnaires.",
  },
  badQuarter: {
    ar: "النتائج الربعية أغضبت مساهمي الجماهير.",
    en: "Quarterly results angered fan shareholders.",
    fr: "Les résultats trimestriels ont irrité les supporters actionnaires.",
  },
  cycles: {
    ar: "الدورات والأزمات",
    en: "Cycles & crises",
    fr: "Cycles et crises",
  },
  cycleNeutral: { ar: "متوازن", en: "Balanced", fr: "Équilibré" },
  cycleBull: { ar: "صعود", en: "Bull market", fr: "Marché haussier" },
  cycleBubble: { ar: "فقاعة", en: "Bubble", fr: "Bulle" },
  cycleCrash: { ar: "انهيار", en: "Crash", fr: "Krach" },
  cycleRecovery: { ar: "تعافٍ", en: "Recovery", fr: "Reprise" },
  buyTheDip: {
    ar: "اشترِ القاع!",
    en: "Buy the dip!",
    fr: "Achetez au plus bas !",
  },
  distressedClubs: {
    ar: "أندية متعثرة رخيصة",
    en: "Cheap distressed clubs",
    fr: "Clubs en difficulté à bas prix",
  },
  futureClubSale: {
    ar: "مرشح للبيع في المرحلة القادمة",
    en: "Potential sale candidate in the next phase",
    fr: "Candidat potentiel à la vente lors de la prochaine phase",
  },
  askingValue: {
    ar: "قيمة استرشادية",
    en: "Indicative value",
    fr: "Valeur indicative",
  },
  marketEvents: {
    ar: "أحداث السوق",
    en: "Market events",
    fr: "Événements de marché",
  },
  pendingEvent: {
    ar: "قرار سوق ينتظرك",
    en: "A market decision awaits",
    fr: "Une décision de marché vous attend",
  },
  eventResolved: {
    ar: "حُسم حدث السوق وسُجل أثره.",
    en: "The market event was resolved and its effect recorded.",
    fr: "L’événement de marché est résolu et son effet enregistré.",
  },
  eventExpired: {
    ar: "انتهى حدث السوق بلا قرار.",
    en: "The market event expired without a decision.",
    fr: "L’événement de marché a expiré sans décision.",
  },
  invalidEvent: {
    ar: "حدث السوق أو الاختيار غير صالح.",
    en: "Invalid market event or choice.",
    fr: "Événement ou choix de marché invalide.",
  },
});

export const stockText = (key, language = "ar") => {
  const value = STOCK_MARKET_TEXTS[key];
  return value?.[language] || value?.en || key;
};

export const STOCK_MARKET_PHRASES = Object.freeze(
  Object.values(STOCK_MARKET_TEXTS).reduce((phrases, value) => {
    phrases[value.ar] = [value.en, value.fr];
    const bareAr = value.ar.replace(/[.؛:!؟…،,»«()]+$/, "");
    const bareEn = value.en.replace(/[.!?…,:;]+$/, "");
    const bareFr = value.fr.replace(/[.!?…,:;]+$/, "");
    if (bareAr && !phrases[bareAr]) phrases[bareAr] = [bareEn, bareFr];
    return phrases;
  }, {}),
);
