// عبارات نظام الأحداث الموسّع 0.25 — نصوص كتالوج القرارات وأخبار النكهة.
// المفتاح هو النص العربي كما ورد في ملفات البيانات تمامًا (بلا نقطة نهاية الجملة)،
// والقيمة [الإنجليزية، الفرنسية]. يولّد هذا الملف ويُتحقق منه آليًا:
//   · node scripts/i18n-coverage.mjs  → لا يجوز أن يبقى حرف عربي غير مترجم
//   · tests/events-expansion.test.js  → كل عنوان/نص/خيار في الكتالوجين مترجم بالكامل
export const EVENT_PHRASES = {

  // ── مواضيع أحداث الكتالوج الأصلي (topic) (eventCatalog.js, 8 نصًا) ──
  "يوم مفتوح للجماهير في مقر النادي": [
    "An open day for the fans at the club grounds",
    "Journée portes ouvertes pour les supporters au siège du club",
  ],
  "حملة تجارية مشتركة مع راعٍ قائم": [
    "A joint commercial campaign with an existing sponsor",
    "Campagne commerciale conjointe avec un sponsor existant",
  ],
  "صيانة دورية لمنشآت النادي": [
    "Routine maintenance of the club facilities",
    "Entretien périodique des installations du club",
  ],
  "طلب طبي بتخفيف الحمل التدريبي": [
    "A medical request to reduce the training load",
    "Demande médicale d’alléger la charge d’entraînement",
  ],
  "تمويل تجربة لناشئ مولّد في عالم اللعبة": [
    "Funding a trial for a youth generated inside the game world",
    "Financer un essai pour un jeune généré dans le monde du jeu",
  ],
  "مبادرة جماهيرية لدعم الحضور": [
    "A fan initiative to support attendance",
    "Initiative des supporters pour soutenir l’affluence",
  ],
  "نشاط جماعي لبناء التفاهم في غرفة الملابس": [
    "A group activity to build understanding in the dressing room",
    "Activité collective pour souder le vestiaire",
  ],
  "تمويل تقرير موسّع عن مرشحي السوق": [
    "Funding an expanded report on market candidates",
    "Financer un rapport élargi sur les cibles du marché",
  ],

  // ── نصوص يولّدها محرك الأحداث (clubEvents.js, 3 نصًا) ──
  "التزام مترتب على قرار إداري": [
    "An obligation arising from a management decision",
    "Engagement découlant d’une décision de gestion",
  ],
  "قرار إداري": [
    "Management decision",
    "Décision de gestion",
  ],
  "أثر القرار على النادي": [
    "The decision's impact on the club",
    "L’impact de la décision sur le club",
  ],

  // ── قرارات المال والإدارة (decisions-money.js, 55 نصًا) ──
  "تسهيل ائتماني جسري من البنك": [
    "A bridge credit facility from the bank",
    "Facilité de crédit relais de la banque",
  ],
  "البنك يعرض تسهيلًا جسريًا": [
    "The bank offers a bridge facility",
    "La banque propose une facilité relais",
  ],
  "الخزينة تحت ضغط هذا الشهر، والبنك يعرض مبلغًا الآن يُسدَّد دفعة واحدة لاحقًا بتكلفة تمويل معلنة. البديل تقليص الالتزام أو الانتظار حتى إيراد الرعاية": [
    "The treasury is under pressure this month, and the bank offers a sum now to be repaid in one instalment later at a published financing cost. The alternative is trimming the commitment or waiting for the sponsorship income",
    "La trésorerie est sous pression ce mois-ci, et la banque propose une somme maintenant, remboursable en une fois plus tard à un coût de financement publié. L’alternative : réduire l’engagement ou attendre les recettes de sponsoring",
  ],
  "أخذ ٤ ملايين تُسدَّد بعد ٦٠ يومًا": [
    "Take 4 million, repaid after 60 days",
    "Prendre 4 millions, remboursés après 60 jours",
  ],
  "سداد التسهيل الجسري مع تكلفة التمويل": [
    "Repaying the bridge facility with its financing cost",
    "Remboursement de la facilité relais avec son coût de financement",
  ],
  "أخذ ١٫٥ مليون تُسدَّد بعد ٣٠ يومًا": [
    "Take 1.5 million, repaid after 30 days",
    "Prendre 1,5 million, remboursé après 30 jours",
  ],
  "سداد التسهيل الجسري المصغر": [
    "Repaying the mini bridge facility",
    "Remboursement de la petite facilité relais",
  ],
  "الانتظار حتى إيراد الرعاية": [
    "Wait for the sponsorship income",
    "Attendre les recettes de sponsoring",
  ],
  "مراجعة سلم رواتب القائمة": [
    "Reviewing the squad's wage ladder",
    "Révision de la grille salariale de l’effectif",
  ],
  "مراجعة سلم الرواتب": [
    "Reviewing the wage ladder",
    "Révision de la grille salariale",
  ],
  "الفارق بين أعلى راتب وأدناه في القائمة صار مصدر حديث داخلي. الضغط على القمة يوفّر ميزانية، ورفع القاع يشتري استقرارًا، والتجميد يترك التوتر مكانه": [
    "The gap between the highest and lowest wage in the squad has become internal talk. Squeezing the top saves budget, lifting the floor buys stability, and freezing it leaves the tension in place",
    "L’écart entre le salaire le plus haut et le plus bas de l’effectif fait parler en interne. Comprimer le haut économise du budget, relever le plancher achète la stabilité, et geler laisse la tension en place",
  ],
  "ضغط الرواتب الأعلى": [
    "Squeeze the top wages",
    "Comprimer les salaires les plus hauts",
  ],
  "رفع الحد الأدنى للرواتب": [
    "Raise the wage floor",
    "Relever le plancher salarial",
  ],
  "تجميد السلم لهذا الموسم": [
    "Freeze the ladder for this season",
    "Geler la grille cette saison",
  ],
  "برنامج وقاية وتأمين إصابات": [
    "An injury prevention and insurance programme",
    "Programme de prévention et d’assurance blessures",
  ],
  "تغطية الوقاية من الإصابات": [
    "Injury prevention cover",
    "Couverture de prévention des blessures",
  ],
  "شركة تأمين تعرض تغطية سنوية تشمل برنامج وقاية يوميًا في مركز التدريب. التغطية لا تمنع الإصابة، لكنها ترفع جاهزية القائمة وتخفض الحمل التراكمي": [
    "An insurer offers annual cover that includes a daily prevention programme at the training centre. The cover does not prevent injury, but it lifts squad fitness and lowers the accumulated load",
    "Un assureur propose une couverture annuelle incluant un programme de prévention quotidien au centre d’entraînement. Elle n’empêche pas la blessure, mais elle élève la forme de l’effectif et réduit la charge accumulée",
  ],
  "تغطية كاملة لكل القائمة": [
    "Full cover for the whole squad",
    "Couverture complète pour tout l’effectif",
  ],
  "تغطية الأساسيين فقط": [
    "Cover the key players only",
    "Couvrir uniquement les titulaires",
  ],
  "الاكتفاء بالبرنامج الحالي": [
    "Stick with the current programme",
    "S’en tenir au programme actuel",
  ],
  "مراجعة محاسبية على بند الرواتب": [
    "An accounting audit of the payroll line",
    "Audit comptable de la ligne salariale",
  ],
  "مراجعة محاسبية على الرواتب": [
    "An accounting audit of the payroll",
    "Audit comptable de la paie",
  ],
  "مراجع خارجي رصد فروقًا في احتساب البدلات. التسوية الفورية تُغلق الملف، والاعتراض يؤجل المبلغ ويزيده، وإعادة الهيكلة تخفض البند من أساسه": [
    "An external auditor found discrepancies in how allowances were calculated. Settling now closes the file, contesting defers and increases the amount, and restructuring cuts the line at its root",
    "Un auditeur externe a relevé des écarts dans le calcul des indemnités. Régler maintenant clôt le dossier, contester reporte et alourdit le montant, et restructurer réduit la ligne à la racine",
  ],
  "تسوية فورية وإغلاق الملف": [
    "Settle immediately and close the file",
    "Régler immédiatement et clore le dossier",
  ],
  "الاعتراض وتأجيل الملف": [
    "Contest and defer the file",
    "Contester et reporter le dossier",
  ],
  "تسوية المراجعة المحاسبية بعد الاعتراض": [
    "Settling the accounting audit after the contest",
    "Règlement de l’audit comptable après contestation",
  ],
  "إعادة هيكلة البدلات": [
    "Restructure the allowances",
    "Restructurer les indemnités",
  ],
  "بيع حقوق اسم الملعب": [
    "Selling the stadium naming rights",
    "Vendre les droits de nom du stade",
  ],
  "حقوق اسم الملعب على الطاولة": [
    "Stadium naming rights on the table",
    "Les droits de nom du stade sur la table",
  ],
  "شركة اتصالات تريد اسمها على واجهة الملعب لخمس سنوات. المبلغ كبير ومعلن، لكن جزءًا من الجمهور يرى في الاسم هوية لا تُباع": [
    "A telecoms company wants its name on the stadium façade for five years. The sum is large and published, but part of the fanbase sees the name as an identity that is not for sale",
    "Une société de télécoms veut son nom sur la façade du stade pour cinq ans. La somme est importante et publique, mais une partie du public voit dans ce nom une identité qui ne se vend pas",
  ],
  "توقيع عقد الخمس سنوات": [
    "Sign the five-year deal",
    "Signer le contrat de cinq ans",
  ],
  "الدفعة الأولى من حقوق اسم الملعب": [
    "The first instalment of the stadium naming rights",
    "Le premier versement des droits de nom du stade",
  ],
  "تجربة موسم واحد فقط": [
    "A single-season pilot only",
    "Un essai d’une seule saison",
  ],
  "عائد تجربة حقوق الاسم لموسم واحد": [
    "Revenue from the one-season naming-rights pilot",
    "Recette de l’essai des droits de nom sur une saison",
  ],
  "إبقاء الاسم كما هو": [
    "Keep the name as it is",
    "Garder le nom tel quel",
  ],
  "مستحقات رواتب متأخرة": [
    "Late wage arrears",
    "Arriérés de salaires",
  ],
  "غرفة الملابس تسأل عن المتأخرات": [
    "The dressing room asks about the arrears",
    "Le vestiaire s’interroge sur les arriérés",
  ],
  "قائد الفريق نقل سؤال اللاعبين عن متأخرات الرواتب. الدفع الفوري يرفع الثقة، والنصف يهدّئ ولا يحسم، والتأجيل يكلّف أكثر ويظهر في الأداء": [
    "The captain passed on the players' question about late wages. Paying at once lifts trust, paying half calms without settling, and delaying costs more and shows on the pitch",
    "Le capitaine a transmis la question des joueurs sur les salaires en retard. Payer immédiatement renforce la confiance, payer la moitié apaise sans régler, et reporter coûte davantage et se voit sur le terrain",
  ],
  "صرف كل المتأخرات اليوم": [
    "Pay all the arrears today",
    "Payer tous les arriérés aujourd’hui",
  ],
  "صرف نصف المتأخرات": [
    "Pay half the arrears",
    "Payer la moitié des arriérés",
  ],
  "وعد بالصرف بعد شهر": [
    "Promise payment in a month",
    "Promettre le paiement dans un mois",
  ],
  "المتأخرات مع غرامة التأخير": [
    "The arrears plus a late-payment penalty",
    "Les arriérés plus une pénalité de retard",
  ],
  "طلب زيادة رأس المال من المالك": [
    "Requesting a capital increase from the owner",
    "Demander une augmentation de capital au propriétaire",
  ],
  "المجلس يناقش تغطية العجز": [
    "The board discusses covering the deficit",
    "Le conseil discute de la couverture du déficit",
  ],
  "التقرير الشهري يظهر عجزًا تشغيليًا. أمامك زيادة رأس مال من المالك، أو تقشف يمسّ الرواتب، أو رفض الخطة وترك الأثر على سمعة الإدارة": [
    "The monthly report shows an operating deficit. Your options are a capital increase from the owner, austerity that touches wages, or refusing the plan and taking the hit to the management's reputation",
    "Le rapport mensuel montre un déficit d’exploitation. Les options : une augmentation de capital du propriétaire, une austérité qui touche les salaires, ou refuser le plan et porter atteinte à la réputation de la direction",
  ],
  "طلب زيادة رأس المال": [
    "Request the capital increase",
    "Demander l’augmentation de capital",
  ],
  "خطة تقشف على الرواتب": [
    "An austerity plan on wages",
    "Un plan d’austérité sur les salaires",
  ],
  "رفض الخطة والتمسك بالبرنامج": [
    "Refuse the plan and hold to the programme",
    "Refuser le plan et s’en tenir au programme",
  ],
  "تثبيت سعر صرف صفقة أجنبية": [
    "Hedging the exchange rate on a foreign deal",
    "Couvrir le taux de change d’une opération étrangère",
  ],
  "الصفقة الأجنبية وسعر الصرف": [
    "The foreign deal and the exchange rate",
    "L’opération étrangère et le taux de change",
  ],
  "أحد الملفات التفاوضية مقوّم بعملة أجنبية. التثبيت يكلّف الآن ويحمي لاحقًا، والتجاهل يجعل الفارق التزامًا مؤجلًا، والتحويل للعملة المحلية يخفض الميزانية ويثير الوكيل": [
    "One of the negotiation files is priced in a foreign currency. Hedging costs now and protects later, ignoring it turns the difference into a deferred obligation, and switching to the local currency lowers the budget and unsettles the agent",
    "L’un des dossiers de négociation est libellé en devise étrangère. Couvrir coûte maintenant et protège plus tard, l’ignorer transforme l’écart en engagement différé, et passer à la monnaie locale réduit le budget et agace l’agent",
  ],
  "تثبيت السعر الآن": [
    "Lock the rate now",
    "Bloquer le taux maintenant",
  ],
  "الدخول دون تثبيت": [
    "Go in without hedging",
    "S’engager sans couverture",
  ],
  "فروق سعر الصرف على الصفقة الأجنبية": [
    "Exchange-rate differences on the foreign deal",
    "Écarts de change sur l’opération étrangère",
  ],
  "إعادة التفاوض بالعملة المحلية": [
    "Renegotiate in the local currency",
    "Renégocier en monnaie locale",
  ],

  // ── قرارات القائمة والجهاز الطبي والفني (decisions-squad.js, 62 نصًا) ──
  "منح شارة القيادة": [
    "Awarding the captain's armband",
    "Attribuer le brassard de capitaine",
  ],
  "شارة القيادة شاغرة": [
    "The captaincy is vacant",
    "Le capitanat est vacant",
  ],
  "بعد رحيل القائد صار الملف مفتوحًا. الأقدم يراها استحقاقًا، والصاعد يراها رسالة للمستقبل، والتصويت الداخلي يوزّع المسؤولية على الغرفة كلها": [
    "With the captain gone the file is open. The senior player sees it as his due, the rising one sees it as a message about the future, and an internal vote spreads the responsibility across the whole room",
    "Le capitaine parti, le dossier est ouvert. L’aîné y voit un dû, le jeune une adresse à l’avenir, et un vote interne répartit la responsabilité sur tout le vestiaire",
  ],
  "منحها لأقدم لاعبي القائمة": [
    "Give it to the squad's most senior player",
    "Le donner au joueur le plus ancien de l’effectif",
  ],
  "منحها للاعب الصاعد": [
    "Give it to the rising player",
    "Le donner au joueur montant",
  ],
  "تصويت داخلي في غرفة الملابس": [
    "An internal vote in the dressing room",
    "Un vote interne dans le vestiaire",
  ],
  "مخالفة انضباطية داخل المعسكر": [
    "A disciplinary breach inside the camp",
    "Une faute disciplinaire dans le camp",
  ],
  "مخالفة في معسكر الفريق": [
    "A breach in the team camp",
    "Une faute dans le camp de l’équipe",
  ],
  "أحد اللاعبين غادر المعسكر دون إذن قبل مباراة. الغرفة تراقب كيف تتصرف: عقوبة داخلية تحفظ النظام، أو إعلان صارم يرضي الجمهور، أو احتواء هادئ يكلّفك هيبة القرار": [
    "A player left the camp without permission before a match. The room is watching how you act: an internal fine preserves order, a public sanction pleases the fans, and quiet containment costs you the authority of the decision",
    "Un joueur a quitté le camp sans autorisation avant un match. Le vestiaire observe votre réaction : une retenue interne préserve l’ordre, une sanction publique satisfait le public, et un étouffement discret vous coûte l’autorité de la décision",
  ],
  "خصم داخلي وإبقاء الملف مغلقًا": [
    "An internal deduction and keep the file closed",
    "Une retenue interne et garder le dossier clos",
  ],
  "إعلان العقوبة للجمهور": [
    "Announce the sanction to the fans",
    "Annoncer la sanction au public",
  ],
  "احتواء بلا عقوبة": [
    "Contain it without a sanction",
    "Étouffer sans sanction",
  ],
  "رأي طبي ثانٍ في إصابة قائمة": [
    "A second medical opinion on a live injury",
    "Un deuxième avis médical sur une blessure en cours",
  ],
  "ملف إصابة يحتاج حسمًا": [
    "An injury file needs a decision",
    "Un dossier de blessure à trancher",
  ],
  "الجهاز الطبي يعرض تشخيصًا محافظًا، وهناك أخصائي خارجي يمكن استدعاؤه. الرأي الثاني يكلّف لكنه قد يقصّر الغياب، والجراحة الفورية تطيل الغياب وتخفض خطر الانتكاسة": [
    "The medical staff presents a conservative diagnosis, and an outside specialist can be called in. The second opinion costs but may shorten the absence, while immediate surgery lengthens it and lowers the risk of a setback",
    "Le staff médical propose un diagnostic prudent, et un spécialiste extérieur peut être appelé. Le deuxième avis coûte mais peut raccourcir l’absence, tandis qu’une opération immédiate l’allonge et réduit le risque de rechute",
  ],
  "استدعاء أخصائي خارجي": [
    "Call in an outside specialist",
    "Faire appel à un spécialiste extérieur",
  ],
  "الالتزام بخطة الجهاز الطبي": [
    "Stick to the medical staff's plan",
    "Suivre le plan du staff médical",
  ],
  "جراحة فورية وحسم الملف": [
    "Immediate surgery and settle the file",
    "Opération immédiate et dossier tranché",
  ],
  "الغياب صار أطول، لكن ملف الانتكاسة أُغلق لهذا الموسم": [
    "The absence is now longer, but the setback risk is closed for this season",
    "L’absence est désormais plus longue, mais le risque de rechute est clos pour cette saison",
  ],
  "إدارة الأحمال في أسبوع مزدحم": [
    "Managing the loads in a congested week",
    "Gérer les charges lors d’une semaine chargée",
  ],
  "أسبوع مزدحم وأحمال مرتفعة": [
    "A congested week and high loads",
    "Semaine chargée et charges élevées",
  ],
  "أمامك مباراتان في عشرة أيام وقائمة مرهقة. التدوير يحمي الأجساد ويغضب من يخرج، والمواصلة تراهن على اللياقة، ووحدة الاستشفاء تحل جزءًا بمال": [
    "You have two matches in ten days and a tired squad. Rotation protects the bodies and angers those left out, carrying on bets on fitness, and an extra recovery unit solves part of it with money",
    "Deux matches en dix jours et un effectif fatigué. La rotation protège les corps et froisse les écartés, continuer parie sur la forme, et une unité de récupération supplémentaire en résout une partie avec de l’argent",
  ],
  "تدوير التشكيل": [
    "Rotate the lineup",
    "Faire tourner le onze",
  ],
  "المواصلة بنفس الأسماء": [
    "Carry on with the same names",
    "Continuer avec les mêmes noms",
  ],
  "تشغيل وحدة استشفاء إضافية": [
    "Run an extra recovery unit",
    "Mettre en place une unité de récupération supplémentaire",
  ],
  "ترقية داخل الجهاز المساعد": [
    "A promotion inside the assistant coaching staff",
    "Une promotion au sein du staff adjoint",
  ],
  "مقعد فارغ في الجهاز المساعد": [
    "An empty seat on the assistant staff",
    "Un siège vacant dans le staff adjoint",
  ],
  "مساعد رحل وترك مقعدًا. الترقية الداخلية رخيصة وترضي الغرفة، والاستقدام الأجنبي يضيف منهجًا جديدًا بتكلفة كبيرة، وإبقاء المقعد فارغًا يوزّع الحمل على الباقين": [
    "An assistant left and a seat is empty. An internal promotion is cheap and pleases the room, a foreign hire adds a new method at a high cost, and leaving the seat vacant spreads the load over the rest",
    "Un adjoint est parti et un siège est vacant. Une promotion interne est économique et plaît au vestiaire, un recrutement étranger ajoute une méthode nouvelle à coût élevé, et laisser le siège vide répartit la charge sur les autres",
  ],
  "ترقية من داخل الجهاز": [
    "Promote from within the staff",
    "Promouvoir en interne dans le staff",
  ],
  "استقدام اختصاصي أجنبي": [
    "Bring in a foreign specialist",
    "Recruter un spécialiste étranger",
  ],
  "إبقاء المقعد فارغًا": [
    "Leave the seat vacant",
    "Laisser le siège vacant",
  ],
  "تأسيس قسم تحليل الأداء": [
    "Setting up a performance analysis department",
    "Créer un département d’analyse de la performance",
  ],
  "عرض لتأسيس قسم تحليل": [
    "An offer to set up an analysis department",
    "Une offre pour créer un département d’analyse",
  ],
  "شركة بيانات تعرض بناء قسم تحليل داخل النادي. القسم يضيّق نطاق تقديرات الكشافين ويرفع سمعة النادي، والاكتفاء بالبرمجيات أرخص وأقل أثرًا": [
    "A data company offers to build an analysis department inside the club. The department narrows the range of the scouts' estimates and raises the club's reputation, while software alone is cheaper and has less impact",
    "Une société de données propose de construire un département d’analyse au sein du club. Ce département resserre la fourchette des estimations des recruteurs et améliore la réputation du club, tandis que le seul logiciel est moins cher et moins efficace",
  ],
  "بناء القسم داخليًا": [
    "Build the department in-house",
    "Construire le département en interne",
  ],
  "ترخيص برمجيات فقط": [
    "Licence the software only",
    "Licencier uniquement le logiciel",
  ],
  "تأجيل الملف": [
    "Postpone the file",
    "Reporter le dossier",
  ],
  "مدرب حراس متخصص": [
    "A specialist goalkeeper coach",
    "Un entraîneur des gardiens spécialisé",
  ],
  "مركز حراسة المرمى تحت المجهر": [
    "Goalkeeping under the microscope",
    "Le poste de gardien sous observation",
  ],
  "أخطاء الحراسة تكررت، والملف الفني يقترح مدربًا متخصصًا. الاختصاصي يرفع جاهزية المركز وثقته، والترقية من الأكاديمية أرخص، والرفض يترك أثره على الحراس": [
    "Goalkeeping errors have repeated themselves, and the technical file proposes a specialist coach. The specialist lifts the position's readiness and confidence, promoting from the academy is cheaper, and refusing leaves its mark on the keepers",
    "Les erreurs de gardiennage se répètent, et le dossier technique propose un entraîneur spécialisé. Le spécialiste élève la préparation et la confiance du poste, une promotion de l’académie est moins coûteuse, et le refus laisse des traces chez les gardiens",
  ],
  "تعيين مدرب حراس متخصص": [
    "Appoint a specialist goalkeeper coach",
    "Nommer un entraîneur des gardiens spécialisé",
  ],
  "ترقية مدرب من الأكاديمية": [
    "Promote a coach from the academy",
    "Promouvoir un entraîneur de l’académie",
  ],
  "إبقاء الوضع كما هو": [
    "Leave things as they are",
    "Laisser les choses en l’état",
  ],
  "مكافأة إجادة فورية للقائمة": [
    "An immediate performance bonus for the squad",
    "Une prime de performance immédiate pour l’effectif",
  ],
  "مكافأة إجادة على الطاولة": [
    "A performance bonus on the table",
    "Une prime de performance sur la table",
  ],
  "بعد سلسلة مباريات مضغوطة يقترح الجهاز الإداري مكافأة إجادة فورية. المكافأة السخية ترفع الغرفة والجمهور، والمتوسطة توازن، والرفض يُقرأ كرسالة تقشف": [
    "After a congested run of matches the management team proposes an immediate performance bonus. A generous bonus lifts the room and the fans, a moderate one balances things, and refusing reads as an austerity message",
    "Après une série de matches rapprochés, l’administration propose une prime de performance immédiate. Une prime généreuse élève le vestiaire et le public, une prime moyenne équilibre, et le refus se lit comme un message d’austérité",
  ],
  "مكافأة سخية لكل القائمة": [
    "A generous bonus for the whole squad",
    "Une prime généreuse pour tout l’effectif",
  ],
  "مكافأة متوسطة": [
    "A moderate bonus",
    "Une prime moyenne",
  ],
  "لا مكافآت هذا الشهر": [
    "No bonuses this month",
    "Aucune prime ce mois-ci",
  ],
  "تمديد عقد نجم يقترب من النهاية": [
    "Extending a star's contract that is nearing its end",
    "Prolonger le contrat d’une star qui arrive à échéance",
  ],
  "عقد على وشك الانتهاء": [
    "A contract about to expire",
    "Un contrat sur le point d’expirer",
  ],
  "أحد أهم عقود القائمة ينتهي قريبًا والوكيل يضغط. العقد الطويل يرفع بند الرواتب ويحسم الملف، والقصير يؤجل، وترك العقد يجري يعني خسارة بلا مقابل": [
    "One of the squad's most important contracts ends soon and the agent is pressing. A long deal raises the wage line and settles the file, a short one defers it, and letting the contract run down means losing him for nothing",
    "L’un des contrats les plus importants de l’effectif arrive bientôt à échéance et l’agent insiste. Un contrat long alourdit la masse salariale et règle le dossier, un court le reporte, et laisser le contrat arriver à son terme signifie perdre le joueur sans compensation",
  ],
  "عقد طويل براتب أعلى": [
    "A long contract at a higher wage",
    "Un contrat long à salaire plus élevé",
  ],
  "تجديد قصير بشروط حذرة": [
    "A short renewal on cautious terms",
    "Une prolongation courte à conditions prudentes",
  ],
  "ترك العقد حتى النهاية": [
    "Let the contract run to the end",
    "Laisser le contrat aller à son terme",
  ],
  "مصير اللاعبين خارج الحسابات": [
    "The fate of the players outside the plans",
    "Le sort des joueurs hors des plans",
  ],
  "لاعبون خارج الحسابات": [
    "Players outside the plans",
    "Des joueurs hors des plans",
  ],
  "مجموعة من القائمة لا تحصل على دقائق. الإعارة تعيد لهم اللعب وتدرّ عائدًا، والمصارحة تحفظ المعنويات، والتجاهل يحوّل الملف إلى مشكلة غرف ملابس": [
    "A group in the squad gets no minutes. Loans give them football and bring in revenue, frank talks preserve morale, and ignoring it turns the file into a dressing-room problem",
    "Un groupe de l’effectif n’obtient aucune minute. Les prêts leur redonnent du jeu et rapportent, des discussions franches préservent le moral, et l’indifférence transforme le dossier en problème de vestiaire",
  ],
  "برنامج إعارات منظم": [
    "An organised loan programme",
    "Un programme de prêts organisé",
  ],
  "حصة النادي من رواتب المعارين": [
    "The club's share of the loaned players' wages",
    "La part du club dans les salaires des joueurs prêtés",
  ],
  "جلسة مصارحة فردية": [
    "An individual frank talk",
    "Une discussion franche individuelle",
  ],
  "ترك الملف دون قرار": [
    "Leave the file without a decision",
    "Laisser le dossier sans décision",
  ],

  // ── قرارات السوق والكشف والأكاديمية (decisions-market.js, 58 نصًا) ──
  "ميزانية إضافية في آخر أيام السوق": [
    "An extra budget in the last days of the window",
    "Un budget supplémentaire dans les derniers jours du mercato",
  ],
  "المدير الرياضي يطلب سقفًا أعلى": [
    "The sporting director asks for a higher ceiling",
    "Le directeur sportif demande un plafond plus élevé",
  ],
  "ملف تعاقد مفتوح والسوق يقفل قريبًا. الموافقة ترفع بند الرواتب وتغلق الملف، والرد بعرض أقل يبقي التفاوض مفتوحًا، والانقلاب على الملف يكلّفك ثقة الغرفة والجمهور": [
    "A transfer file is open and the market closes soon. Approving raises the wage line and closes the file, replying with a lower offer keeps the negotiation open, and turning your back on the file costs you the trust of the room and the fans",
    "Un dossier de recrutement est ouvert et le marché ferme bientôt. Approuver alourdit la masse salariale et clôt le dossier, répondre par une offre moindre maintient la négociation, et tourner le dos au dossier vous coûte la confiance du vestiaire et du public",
  ],
  "رفع السقف وإغلاق الملف": [
    "Raise the ceiling and close the file",
    "Relever le plafond et clore le dossier",
  ],
  "ردّ بعرض أقل وإبقاء التفاوض": [
    "Reply with a lower offer and keep negotiating",
    "Répondre par une offre moindre et continuer à négocier",
  ],
  "إغلاق الملف نهائيًا": [
    "Close the file for good",
    "Clore le dossier définitivement",
  ],
  "حصة النادي من راتب لاعب معار": [
    "The club's share of a loaned player's wage",
    "La part du club dans le salaire d’un joueur prêté",
  ],
  "إعارة بحصة راتب": [
    "A loan with a wage share",
    "Un prêt avec partage de salaire",
  ],
  "نادٍ خارجي يقبل إعارة لاعب مقابل تحمّل جزء من راتبه. تحمّل الحصة كاملة يرفع بند الرواتب ويحسّن القائمة، والنصف حل وسط، والرفض يبقي الملف كما هو": [
    "A foreign club accepts loaning a player in return for taking on part of his wage. Covering the full share raises the wage line and improves the squad, half is a compromise, and refusing leaves the file as it is",
    "Un club étranger accepte de prêter un joueur en échange de la prise en charge d’une partie de son salaire. Couvrir la part entière alourdit la masse salariale et améliore l’effectif, la moitié est un compromis, et le refus laisse le dossier en l’état",
  ],
  "تحمّل الراتب كاملًا": [
    "Cover the full wage",
    "Prendre en charge le salaire entier",
  ],
  "معار بحصة كاملة": [
    "Loaned in on a full wage share",
    "Prêté avec prise en charge totale",
  ],
  "تحمّل نصف الراتب": [
    "Cover half the wage",
    "Prendre en charge la moitié du salaire",
  ],
  "معار بحصة نصفية": [
    "Loaned in on a half wage share",
    "Prêté avec prise en charge de moitié",
  ],
  "رفض الإعارة": [
    "Refuse the loan",
    "Refuser le prêt",
  ],
  "عرض شراء لأبرز لاعبي القائمة": [
    "A buy offer for the squad's standout player",
    "Une offre d’achat pour le joueur phare de l’effectif",
  ],
  "عرض كبير لأحد نجومك": [
    "A big offer for one of your stars",
    "Une grosse offre pour l’une de vos stars",
  ],
  "نادٍ أجنبي رفع عرضه لأفضل ما في قائمتك. القبول يملأ الخزينة ويغضب المدرجات، وتحسين العقد يبقي اللاعب، والرفض الحاسم رسالة لكنها بلا مقابل مالي": [
    "A foreign club has raised its offer for the best player in your squad. Accepting fills the treasury and angers the stands, improving his contract keeps the player, and a flat refusal is a statement but brings no money",
    "Un club étranger a relevé son offre pour le meilleur joueur de votre effectif. Accepter remplit la caisse et fâche les tribunes, améliorer son contrat garde le joueur, et un refus sec est un message mais sans contrepartie financière",
  ],
  "قبول العرض وبيع اللاعب": [
    "Accept the offer and sell the player",
    "Accepter l’offre et vendre le joueur",
  ],
  "الرحيل تمّ مقابل مبلغ مُعلَن؛ القائمة تحتاج تعويضًا في السوق": [
    "The departure went through for a published fee; the squad needs replacing in the market",
    "Le départ s’est fait contre un montant publié ; l’effectif doit être remplacé sur le marché",
  ],
  "رفض وتحسين عقده": [
    "Refuse and improve his contract",
    "Refuser et améliorer son contrat",
  ],
  "رفض بلا مفاوضات": [
    "Refuse without negotiating",
    "Refuser sans négocier",
  ],
  "تفعيل شرط جزائي في سوق محلي": [
    "Triggering a release clause in the domestic market",
    "Activer une clause libératoire sur le marché national",
  ],
  "شرط جزائي متاح للتفعيل": [
    "A release clause available to trigger",
    "Une clause libératoire activable",
  ],
  "لاعب محلي عقده يتضمن شرطًا جزائيًا معلوم القيمة. التفعيل الفوري يحسم الملف، والتقسيط يوزّع الحمل على شهرين، والانسحاب يترك الفرصة لمنافس": [
    "A domestic player's contract carries a release clause of a known value. Triggering it at once settles the file, instalments spread the burden over two months, and walking away leaves the chance to a rival",
    "Le contrat d’un joueur national comporte une clause libératoire d’un montant connu. L’activer immédiatement règle le dossier, l’échelonner répartit la charge sur deux mois, et se retirer laisse l’occasion à un rival",
  ],
  "تفعيل الشرط نقدًا": [
    "Trigger the clause in cash",
    "Activer la clause au comptant",
  ],
  "صفقة شرط جزائي": [
    "Release-clause signing",
    "Recrutement par clause libératoire",
  ],
  "تفعيل على دفعتين": [
    "Trigger it in two instalments",
    "Activer en deux versements",
  ],
  "الدفعة الثانية من الشرط الجزائي": [
    "The second instalment of the release clause",
    "Le deuxième versement de la clause libératoire",
  ],
  "الانسحاب من الملف": [
    "Withdraw from the file",
    "Se retirer du dossier",
  ],
  "توسيع شبكة الكشافين إلى سوق جديد": [
    "Expanding the scouting network into a new market",
    "Étendre le réseau de recrutement à un nouveau marché",
  ],
  "شبكة الكشافين تحتاج توسعة": [
    "The scouting network needs expanding",
    "Le réseau de recrutement doit s’étendre",
  ],
  "تقارير المرشحين الحالية ضيقة النطاق. تمويل الشبكة يفتح سوقًا جديدًا ويضيّق نطاق التقدير، وتكليف واحد أرخص وأبطأ، والتجميد يعني قرارات بلا معلومات": [
    "The current candidate reports are narrow in scope. Funding the network opens a new market and tightens the estimate, a single assignment is cheaper and slower, and freezing it means decisions without information",
    "Les rapports actuels sur les cibles sont étroits. Financer le réseau ouvre un nouveau marché et resserre l’estimation, une seule mission est moins chère et plus lente, et le gel signifie des décisions sans information",
  ],
  "تمويل شبكة دائمة": [
    "Fund a permanent network",
    "Financer un réseau permanent",
  ],
  "تقرير المرشحين متاح في ملفات اللاعبين من السوق المفعّلة": [
    "The candidate report is available in the player files of the activated markets",
    "Le rapport sur les cibles est disponible dans les fiches des joueurs des marchés activés",
  ],
  "تكليف كشّاف واحد بمهمة": [
    "Assign a single scout a task",
    "Confier une mission à un seul recruteur",
  ],
  "تجميد ملف الكشف": [
    "Freeze the scouting file",
    "Geler le dossier du recrutement",
  ],
  "تصعيد دفعة كاملة من الأكاديمية": [
    "Promoting a whole academy cohort",
    "Promouvoir toute une promotion de l’académie",
  ],
  "دفعة الأكاديمية جاهزة للتصعيد": [
    "The academy cohort is ready for promotion",
    "La promotion de l’académie est prête à monter",
  ],
  "المسؤول الفني يرشّح اسمين من فريق الشباب للتدريب مع الفريق الأول. التصعيد المزدوج يكلّف ويملأ مقعدين، والفرد أهدأ، وإبقاؤهم في الشباب يؤجل القرار ويخفض معنويات الصاعدين": [
    "The technical manager nominates two names from the youth team to train with the first team. Promoting both costs and fills two places, one is calmer, and keeping them in the youth side defers the decision and lowers the morale of those coming through",
    "Le responsable technique propose deux noms de l’équipe de jeunes pour s’entraîner avec l’équipe première. Les promouvoir tous les deux coûte et occupe deux places, un seul est plus calme, et les garder chez les jeunes reporte la décision et fait baisser le moral des montants",
  ],
  "تصعيدهم معًا للفريق الأول": [
    "Promote them both to the first team",
    "Les promouvoir tous les deux en équipe première",
  ],
  "تصعيد اسم واحد": [
    "Promote a single name",
    "Promouvoir un seul nom",
  ],
  "إبقاؤهم مع فريق الشباب": [
    "Keep them with the youth team",
    "Les garder avec l’équipe de jeunes",
  ],
  "توقيع لاعب حر بعد فترة تجربة": [
    "Signing a free agent after a trial period",
    "Signer un agent libre après une période d’essai",
  ],
  "لاعب حر أنهى فترة التجربة": [
    "A free agent has finished his trial",
    "Un agent libre a terminé son essai",
  ],
  "لاعب بلا عقد تدرب مع الفريق ثلاثة أسابيع والجهاز يملك رأيًا فنيًا فيه. عقد السنتين يرفع بند الرواتب، والعقد القصير بحوافز أقل خطرًا، والاعتذار يُغلق الملف": [
    "An unattached player trained with the team for three weeks and the staff has a technical view on him. A two-year deal raises the wage line, a short contract with incentives carries less risk, and declining closes the file",
    "Un joueur sans contrat s’est entraîné trois semaines avec l’équipe et le staff a un avis technique sur lui. Un contrat de deux ans alourdit la masse salariale, un contrat court avec primes est moins risqué, et décliner clôt le dossier",
  ],
  "عقد سنتين براتب معتدل": [
    "A two-year contract at a moderate wage",
    "Un contrat de deux ans à salaire modéré",
  ],
  "صفقة انتقال حر": [
    "Free-transfer signing",
    "Recrutement d’un agent libre",
  ],
  "عقد قصير بحوافز": [
    "A short contract with incentives",
    "Un contrat court avec primes",
  ],
  "صفقة قصيرة بحوافز": [
    "Short incentive deal",
    "Contrat court à primes",
  ],
  "الاعتذار وإنهاء التجربة": [
    "Decline and end the trial",
    "Décliner et mettre fin à l’essai",
  ],
  "عودة لاعب سابق إلى النادي": [
    "A former player's return to the club",
    "Le retour d’un ancien joueur au club",
  ],
  "لاعب سابق يطلب العودة": [
    "A former player asks to return",
    "Un ancien joueur demande à revenir",
  ],
  "اسم سابق في النادي صار حرًا ويعرض العودة بخبرة معلومة. الشراء النهائي يكلّف، والإعارة القصيرة تجربة محدودة الخطر، والرفض يُقرأ كجفاء تجاه أبناء النادي": [
    "A former name at the club is now unattached and offers to return with a known level of experience. A permanent signing costs, a short loan is a limited-risk trial, and refusing reads as coldness towards the club's own",
    "Un ancien nom du club est désormais libre et propose de revenir avec une expérience connue. Un achat définitif coûte, un prêt court est un essai à risque limité, et refuser se lit comme une froideur envers les enfants du club",
  ],
  "توقيع نهائي لموسمين": [
    "A permanent signing for two seasons",
    "Une signature définitive pour deux saisons",
  ],
  "عائد إلى النادي": [
    "Returned to the club",
    "De retour au club",
  ],
  "إعارة قصيرة حتى نهاية الموسم": [
    "A short loan until the end of the season",
    "Un prêt court jusqu’à la fin de la saison",
  ],
  "عائد على سبيل الإعارة": [
    "Returned on loan",
    "De retour en prêt",
  ],
  "اعتذار مهذب": [
    "A polite decline",
    "Un refus poli",
  ],

  // ── قرارات الإعلام والجماهير والمجتمع والأساطير (decisions-media.js, 52 نصًا) ──
  "مؤتمر صحفي بعد خسارة": [
    "A press conference after a defeat",
    "Conférence de presse après une défaite",
  ],
  "الصحافة تنتظرك بعد الخسارة": [
    "The press is waiting for you after the defeat",
    "La presse vous attend après la défaite",
  ],
  "القاعة ممتلئة والسؤال الأول عن المسؤولية. تحمّلها يرفع مكانتك عند الغرفة والجمهور، وتحويلها للتحكيم يرضي المدرجات ويكلّفك غرامة، والرد المحايد يمرّ بلا أثر": [
    "The room is full and the first question is about responsibility. Owning it raises your standing with the room and the fans, shifting it to the refereeing pleases the stands and costs you a fine, and a neutral answer passes without effect",
    "La salle est pleine et la première question porte sur la responsabilité. L’assumer élève votre standing auprès du vestiaire et du public, la renvoyer à l’arbitrage satisfait les tribunes et vous vaut une amende, et une réponse neutre passe sans effet",
  ],
  "تحمّل المسؤولية علنًا": [
    "Take responsibility publicly",
    "Assumer la responsabilité publiquement",
  ],
  "تحويل الملف إلى التحكيم": [
    "Shift the file to the refereeing",
    "Renvoyer le dossier à l’arbitrage",
  ],
  "غرامة تصريحات ضد منظومة التحكيم": [
    "A fine for statements against the refereeing system",
    "Une amende pour propos contre le corps arbitral",
  ],
  "إجابات محايدة قصيرة": [
    "Short neutral answers",
    "Des réponses neutres et brèves",
  ],
  "فريق تصوير وثائقي داخل النادي": [
    "A documentary crew inside the club",
    "Une équipe de documentaire au sein du club",
  ],
  "منصة تريد تصوير موسم من الداخل": [
    "A platform wants to film a season from the inside",
    "Une plateforme veut filmer une saison de l’intérieur",
  ],
  "فريق إنتاج يطلب دخول التدريبات وغرفة الملابس مقابل رسوم ترخيص. الوصول الكامل يرفع الاسم ويشتّت الغرفة، والمحدود أقل مالًا وأهدأ، والرفض يُبقي الأبواب مغلقة": [
    "A production team asks to enter the training ground and the dressing room for a licence fee. Full access raises the name and unsettles the room, limited access is less money and calmer, and refusing keeps the doors shut",
    "Une équipe de production demande l’accès aux entraînements et au vestiaire contre des droits de licence. Un accès total élève le nom et perturbe le vestiaire, un accès limité rapporte moins et reste plus calme, et refuser garde les portes closes",
  ],
  "وصول كامل طوال الموسم": [
    "Full access all season",
    "Accès complet toute la saison",
  ],
  "وصول محدود بأيام معدودة": [
    "Limited access on a few days",
    "Accès limité à quelques jours",
  ],
  "رفض التصوير": [
    "Refuse the filming",
    "Refuser le tournage",
  ],
  "احتجاج جماهيري على سعر التذكرة": [
    "A fan protest over the ticket price",
    "Protestation des supporters sur le prix du billet",
  ],
  "رابطتا مشجعين تعترضان على السعر": [
    "Two supporters' groups object to the price",
    "Deux groupes de supporters contestent le prix",
  ],
  "السعر الحالي أعلى من قدرة قطاع من المدرج. الخفض يملأ الملعب ويقلّص إيراد التذاكر، والحوار يهدّئ بلا مال، والإصرار على السعر يفرّغ المدرج تدريجيًا": [
    "The current price is beyond the means of part of the stand. Cutting it fills the stadium and shrinks ticket revenue, dialogue calms without money, and holding the price empties the stand gradually",
    "Le prix actuel dépasse les moyens d’une partie de la tribune. Le baisser remplit le stade et réduit les recettes de billetterie, le dialogue apaise sans argent, et le maintenir vide la tribune peu à peu",
  ],
  "خفض السعر فورًا": [
    "Cut the price immediately",
    "Baisser le prix immédiatement",
  ],
  "جلسة حوار مع الرابطتين": [
    "A meeting with the two groups",
    "Une réunion avec les deux groupes",
  ],
  "الإبقاء على السعر": [
    "Keep the price",
    "Maintenir le prix",
  ],
  "مبادرة مجتمعية في مدارس الحي": [
    "A community initiative in the neighbourhood schools",
    "Initiative communautaire dans les écoles du quartier",
  ],
  "مدارس الحي تطلب زيارة الفريق": [
    "The neighbourhood schools ask for a team visit",
    "Les écoles du quartier demandent une visite de l’équipe",
  ],
  "إدارة العلاقات تقترح برنامجًا مجتمعيًا في مدارس المنطقة. البرنامج الكامل يكلّف ويبني قاعدة جماهيرية جديدة، والزيارة الواحدة أثرها محدود، والاعتذار يُسجَّل": [
    "Community relations proposes a programme in the area's schools. The full programme costs and builds a new fanbase, a single visit has limited impact, and declining is recorded",
    "Les relations publiques proposent un programme dans les écoles du secteur. Le programme complet coûte et construit une nouvelle base de supporters, une seule visite a un effet limité, et le refus est consigné",
  ],
  "برنامج كامل لثلاثة أشهر": [
    "A full three-month programme",
    "Un programme complet de trois mois",
  ],
  "زيارة واحدة وصور تذكارية": [
    "A single visit and souvenir photos",
    "Une seule visite et des photos souvenirs",
  ],
  "الاعتذار لضيق الجدول": [
    "Decline because the schedule is tight",
    "Décliner faute de disponibilité",
  ],
  "طريقة إطلاق القميص الجديد": [
    "How to launch the new kit",
    "La manière de lancer le nouveau maillot",
  ],
  "القميص الجديد جاهز للإطلاق": [
    "The new kit is ready for launch",
    "Le nouveau maillot est prêt à être lancé",
  ],
  "المصنع سلّم الدفعة الأولى. حفل إطلاق كبير يكلّف ويضاعف المبيعات الأولى، والإطلاق الرقمي أرخص وأهدأ، والتأجيل يفوّت موسم المبيعات": [
    "The factory has delivered the first batch. A big launch event costs and doubles the opening sales, a digital launch is cheaper and calmer, and postponing misses the sales season",
    "L’usine a livré le premier lot. Un grand lancement coûte et double les premières ventes, un lancement numérique est moins cher et plus calme, et reporter fait manquer la saison des ventes",
  ],
  "حفل إطلاق في الملعب": [
    "A launch event at the stadium",
    "Un événement de lancement au stade",
  ],
  "مبيعات إطلاق القميص الجديد": [
    "Sales from the new kit launch",
    "Ventes du lancement du nouveau maillot",
  ],
  "إطلاق رقمي فقط": [
    "A digital launch only",
    "Un lancement numérique uniquement",
  ],
  "مبيعات القميص عبر المتجر الرقمي": [
    "Kit sales through the digital store",
    "Ventes du maillot via la boutique numérique",
  ],
  "تأجيل الإطلاق": [
    "Postpone the launch",
    "Reporter le lancement",
  ],
  "أزمة منشور لاعب على التواصل": [
    "A crisis over a player's social media post",
    "Crise autour d’une publication d’un joueur sur les réseaux",
  ],
  "منشور لاعب يتصدر الجدل": [
    "A player's post tops the debate",
    "La publication d’un joueur en tête du débat",
  ],
  "منشور من حساب أحد اللاعبين صار مادة للصحافة الرياضية. الإيقاف والخصم يحسمان الجدل ويكلّفان الغرفة، والدعم الخاص يحمي اللاعب ويدفع الثمن جماهيريًا، وبرنامج تدريب إعلامي يعالج الجذر": [
    "A post from one of the players' accounts has become material for the sports press. Suspension and a deduction settle the debate and cost the room, private support protects the player and pays for it with the fans, and a media training programme treats the root",
    "Une publication du compte d’un joueur est devenue un sujet pour la presse sportive. Suspension et retenue tranchent le débat et coûtent au vestiaire, un soutien privé protège le joueur et se paie auprès du public, et un programme de formation médiatique traite la racine",
  ],
  "إيقاف داخلي وخصم": [
    "Internal suspension and a deduction",
    "Suspension interne et retenue",
  ],
  "دعم اللاعب وإبقاء الملف خاصًا": [
    "Support the player and keep the file private",
    "Soutenir le joueur et garder le dossier privé",
  ],
  "برنامج تدريب إعلامي للقائمة": [
    "A media training programme for the squad",
    "Un programme de formation médiatique pour l’effectif",
  ],
  "تعيين أسطورة النادي سفيرًا رسميًا": [
    "Appointing a club legend as official ambassador",
    "Nommer une légende du club ambassadeur officiel",
  ],
  "أسطورة النادي بلا دور رسمي": [
    "A club legend with no official role",
    "Une légende du club sans rôle officiel",
  ],
  "اسم كبير من تاريخ النادي متاح لدور رسمي. السفير الكامل يربط الأجيال ويرفع المدرج، والمرشد الجزئي في الأكاديمية أرخص وأعمق أثرًا على الشباب، والتجاهل يفتح جرحًا قديمًا": [
    "A great name from the club's history is available for an official role. A full ambassador links the generations and lifts the stand, a part-time mentor in the academy is cheaper and cuts deeper with the youngsters, and ignoring it reopens an old wound",
    "Un grand nom de l’histoire du club est disponible pour un rôle officiel. Un ambassadeur à part entière relie les générations et soulève la tribune, un mentor à temps partiel à l’académie est moins cher et marque davantage les jeunes, et l’ignorer rouvre une vieille blessure",
  ],
  "تعيينه سفيرًا رسميًا للنادي": [
    "Appoint him official club ambassador",
    "Le nommer ambassadeur officiel du club",
  ],
  "دور مرشد في الأكاديمية": [
    "A mentor role in the academy",
    "Un rôle de mentor à l’académie",
  ],
  "عدم فتح الملف الآن": [
    "Do not open the file now",
    "Ne pas ouvrir le dossier maintenant",
  ],
  "مباراة خيرية في التوقف الدولي": [
    "A charity match during the international break",
    "Un match caritatif pendant la trêve internationale",
  ],
  "جمعية خيرية تطلب مباراة في التوقف": [
    "A charity asks for a match during the break",
    "Une association demande un match pendant la trêve",
  ],
  "النافسة الدولية الحالية بلا مباريات رسمية، وجمعية تطلب لقاءً وديًا يذهب ريعه لمستشفى أطفال. الاستضافة تكلّف تنظيمًا وتدرّ ريعًا، والتبرع بلا مباراة أهدأ، والرفض يسجّله الجمهور": [
    "The current international window has no official matches, and a charity asks for a friendly whose proceeds go to a children's hospital. Hosting costs in organisation and brings in proceeds, donating without a match is calmer, and refusing is noted by the fans",
    "La fenêtre internationale actuelle n’a pas de matches officiels, et une association demande une rencontre amicale dont les recettes iront à un hôpital pour enfants. L’accueillir coûte en organisation et rapporte des recettes, donner sans match est plus calme, et le refus est retenu par le public",
  ],
  "استضافة المباراة وديًا": [
    "Host the friendly",
    "Accueillir le match amical",
  ],
  "ريع المباراة الخيرية": [
    "Proceeds of the charity match",
    "Recettes du match caritatif",
  ],
  "تبرع مالي بلا مباراة": [
    "A cash donation without a match",
    "Un don en argent sans match",
  ],
  "الاعتذار عن الملف": [
    "Decline the request",
    "Décliner la demande",
  ],

  // ── قرارات يوم المباراة والمنافسين والتحكيم والطقس والمنشآت (decisions-matchday.js, 57 نصًا) ──
  "صرف أرضية الملعب في موسم الأمطار": [
    "Pitch drainage in the rainy season",
    "Le drainage du terrain en saison des pluies",
  ],
  "الأرضية لا تصرف مياه الأمطار": [
    "The pitch does not drain the rain",
    "Le terrain n’évacue pas la pluie",
  ],
  "موسم الأمطار كشف ضعف صرف الملعب، والأكثر إرهاقًا في القائمة هو أول من يدفع الثمن. أعمال الصرف الكاملة تعالج الجذر، والطبقة الرملية حل موسمي، والتأجيل يكلّف أجسادًا": [
    "The rainy season has exposed the stadium's weak drainage, and the most tired player in the squad pays for it first. Full drainage work treats the root, a sand layer is a seasonal fix, and postponing costs bodies",
    "La saison des pluies a révélé la faiblesse du drainage du stade, et le joueur le plus fatigué de l’effectif en paie d’abord le prix. Des travaux de drainage complets traitent la racine, une couche de sable est une solution saisonnière, et reporter coûte des organismes",
  ],
  "أعمال صرف كاملة للأرضية": [
    "Full drainage works on the pitch",
    "Travaux de drainage complets du terrain",
  ],
  "طبقة رملية مؤقتة": [
    "A temporary sand layer",
    "Une couche de sable temporaire",
  ],
  "تأجيل الأعمال لما بعد الموسم": [
    "Postpone the works until after the season",
    "Reporter les travaux après la saison",
  ],
  "عطل إنارة الملعب قبل مباراة": [
    "A floodlight fault before a match",
    "Une panne d’éclairage avant un match",
  ],
  "عطل في إنارة الملعب": [
    "A fault in the stadium lighting",
    "Une panne de l’éclairage du stade",
  ],
  "قبل مباراة قريبة أبلغ مهندس الملعب عن عطل في أبراج الإنارة. الإصلاح الطارئ يكلّف ويحفظ الموعد، والتأجيل غرامة وجمهور غاضب، والمولد الاحتياطي يمرّر المباراة ويضرّ بالاسم": [
    "Before an upcoming match the stadium engineer reported a fault in the floodlight towers. Emergency repair costs and keeps the date, postponement means a fine and angry fans, and the backup generator gets the match played and damages the name",
    "Avant un match proche, l’ingénieur du stade a signalé une panne des pylônes d’éclairage. Une réparation d’urgence coûte et préserve la date, le report signifie une amende et un public en colère, et le groupe électrogène de secours permet de jouer mais abîme le nom",
  ],
  "إصلاح طارئ قبل الموعد": [
    "Emergency repair before the date",
    "Réparation d’urgence avant la date",
  ],
  "طلب تأجيل المباراة": [
    "Ask to postpone the match",
    "Demander le report du match",
  ],
  "غرامة تأجيل المباراة لعطل فني": [
    "A fine for postponing the match over a technical fault",
    "Une amende pour report du match dû à une panne technique",
  ],
  "اللعب على مولد احتياطي": [
    "Play on the backup generator",
    "Jouer sur le groupe électrogène de secours",
  ],
  "ملف احتجاج رسمي على التحكيم": [
    "A formal protest file over the refereeing",
    "Un dossier de recours officiel sur l’arbitrage",
  ],
  "أخطاء تحكيمية متكررة في مبارياتك": [
    "Repeated refereeing errors in your matches",
    "Erreurs d’arbitrage répétées dans vos matches",
  ],
  "الملف الفني جمع ثلاث حالات في آخر الجولات. الاحتجاج الرسمي يرضي المدرج ويستفزّ اللجنة، وطلب مراقبين إضافيين هادئ ومكلف، والصمت يُقرأ كتنازل": [
    "The technical file has gathered three cases from the recent rounds. A formal protest pleases the stand and provokes the committee, requesting extra observers is calm and costly, and silence reads as surrender",
    "Le dossier technique a réuni trois cas lors des dernières journées. Un recours officiel satisfait la tribune et provoque la commission, demander des observateurs supplémentaires est calme et coûteux, et le silence se lit comme une capitulation",
  ],
  "احتجاج رسمي موثق بالفيديو": [
    "A formal protest documented on video",
    "Un recours officiel documenté par la vidéo",
  ],
  "رسوم وإعداد ملف الاحتجاج على التحكيم": [
    "Fees and preparation of the refereeing protest file",
    "Frais et préparation du dossier de recours sur l’arbitrage",
  ],
  "طلب مراقبين إضافيين للمباريات": [
    "Request extra match observers",
    "Demander des observateurs supplémentaires pour les matches",
  ],
  "عدم التصعيد": [
    "Do not escalate",
    "Ne pas faire monter le ton",
  ],
  "الترتيبات الأمنية لمباراة ديربي": [
    "Security arrangements for a derby",
    "Dispositif de sécurité pour un derby",
  ],
  "ديربي يقترب وخطة الأمن على الطاولة": [
    "A derby is coming and the security plan is on the table",
    "Un derby approche et le plan de sécurité est sur la table",
  ],
  "المباراة القادمة عالية الحساسية، والسلطات تطلب خطة تنظيم. خطة كاملة بالمشرفين تحمي المدرج وترفع الاسم، والتنظيم المعتاد يكفي على الورق، وتقليص مدرج الضيف يوفّر مالًا ويشعل الجدل": [
    "The upcoming match is highly sensitive and the authorities want an organisation plan. A full stewarding plan protects the stand and lifts the name, standard organisation is enough on paper, and cutting the away end saves money and ignites the debate",
    "Le match à venir est très sensible et les autorités demandent un plan d’organisation. Un dispositif complet de stadiers protège la tribune et valorise le nom, l’organisation habituelle suffit sur le papier, et réduire le parcage visiteurs économise de l’argent et enflamme le débat",
  ],
  "خطة إشراف كاملة داخل المدرجات": [
    "A full stewarding plan inside the stands",
    "Un dispositif complet de stadiers dans les tribunes",
  ],
  "الاكتفاء بالتنظيم المعتاد": [
    "Make do with standard organisation",
    "Se contenter de l’organisation habituelle",
  ],
  "تقليص حصة مدرج الضيف": [
    "Cut the away end allocation",
    "Réduire l’allocation du parcage visiteurs",
  ],
  "بروتوكول اللعب في الحر الشديد": [
    "A protocol for playing in extreme heat",
    "Un protocole pour jouer par forte chaleur",
  ],
  "مباريات في ذروة الحر": [
    "Matches at the peak of the heat",
    "Des matches au pic de la chaleur",
  ],
  "درجات الحرارة في أعلى الموسم، والأكثر إرهاقًا معرّض لضربة حر. مختبر الترطيب واستراحات التبريد يحميان القائمة، وتحويل التدريبات للمساء حل بلا تكلفة كبيرة، وترك الأمور كما هي مخاطرة معلنة": [
    "Temperatures are at the season's peak and the most tired player is exposed to heat stress. A hydration lab and cooling breaks protect the squad, moving training to the evening is a solution without a big cost, and leaving things as they are is a declared risk",
    "Les températures sont au plus haut de la saison et le joueur le plus fatigué est exposé au coup de chaleur. Un laboratoire d’hydratation et des pauses fraîcheur protègent l’effectif, déplacer les entraînements au soir est une solution sans grand coût, et laisser les choses en l’état est un risque assumé",
  ],
  "مختبر ترطيب واستراحات تبريد": [
    "A hydration lab and cooling breaks",
    "Un laboratoire d’hydratation et des pauses fraîcheur",
  ],
  "تحويل كل التدريبات للمساء": [
    "Move all training to the evening",
    "Déplacer tous les entraînements au soir",
  ],
  "إبقاء الجدول كما هو": [
    "Keep the schedule as it is",
    "Garder le programme tel quel",
  ],
  "لوجستيات رحلة قارية طويلة": [
    "Logistics for a long continental trip",
    "Logistique d’un long déplacement continental",
  ],
  "رحلة قارية بمسافة طويلة": [
    "A continental trip over a long distance",
    "Un déplacement continental sur une longue distance",
  ],
  "مباراتك القارية القادمة على بعد رحلة طويلة. الطائرة الخاصة تحمي اللياقة وتكلّف، والتجارية مع يوم راحة إضافي حل وسط، والحد الأدنى من اللوجستيات يظهر في الأرجل": [
    "Your next continental match is a long trip away. A private charter protects fitness and costs, a commercial flight with an extra rest day is a compromise, and minimum logistics show in the legs",
    "Votre prochain match continental est au bout d’un long voyage. Un avion privé protège la forme et coûte, un vol commercial avec un jour de repos supplémentaire est un compromis, et une logistique minimale se voit dans les jambes",
  ],
  "طائرة خاصة وطاقم استشفاء": [
    "A private jet and a recovery crew",
    "Un jet privé et une équipe de récupération",
  ],
  "رحلة تجارية ويوم راحة إضافي": [
    "A commercial flight and an extra rest day",
    "Un vol commercial et un jour de repos supplémentaire",
  ],
  "أدنى ترتيبات سفر": [
    "Minimum travel arrangements",
    "Le minimum d’organisation du voyage",
  ],
  "معسكر تدريبي في التوقف الدولي": [
    "A training camp during the international break",
    "Un stage d’entraînement pendant la trêve internationale",
  ],
  "التوقف الدولي: معسكر أم راحة؟": [
    "The international break: camp or rest?",
    "La trêve internationale : stage ou repos ?",
  ],
  "النافذة الدولية بلا مباريات رسمية للفريق. المعسكر الخارجي يرفع اللياقة والانسجام بمال كثير، والمعسكر الداخلي أرخص وأقل أثرًا، وإلغاء المعسكر يترك القائمة بلا حمل تدريبي منظم": [
    "The international window has no official matches for the team. An overseas camp lifts fitness and cohesion for a lot of money, a domestic camp is cheaper with less impact, and cancelling it leaves the squad without an organised training load",
    "La fenêtre internationale n’a pas de matches officiels pour l’équipe. Un stage à l’étranger élève la forme et la cohésion pour beaucoup d’argent, un stage national est moins cher et moins efficace, et l’annuler laisse l’effectif sans charge d’entraînement organisée",
  ],
  "معسكر خارجي لعشرة أيام": [
    "A ten-day overseas camp",
    "Un stage de dix jours à l’étranger",
  ],
  "معسكر داخلي في مركز التدريب": [
    "A domestic camp at the training centre",
    "Un stage national au centre d’entraînement",
  ],
  "إلغاء المعسكر ومنح راحة": [
    "Cancel the camp and grant rest",
    "Annuler le stage et accorder du repos",
  ],
  "إشراك الشباب في مسابقة الكأس المحلية": [
    "Entering the youngsters in the domestic cup",
    "Engager les jeunes dans la coupe nationale",
  ],
  "الكأس المحلية: بالشباب أم بالكبار؟": [
    "The domestic cup: with the youngsters or the seniors?",
    "La coupe nationale : avec les jeunes ou les seniors ?",
  ],
  "اللائحة تسمح بقائمة مختلطة في الأدوار الأولى. الدفع بالشباب يبني جيلًا ويكلّف رسوم تجهيز، والتشكيل المختلط يوازن، والانسحاب يوفّر مالًا ويغضب المدرج": [
    "The regulations allow a mixed squad in the early rounds. Fielding the youngsters builds a generation and costs entry and kit fees, a mixed lineup balances things, and withdrawing saves money and angers the stand",
    "Le règlement autorise un effectif mixte dans les premiers tours. Aligner les jeunes construit une génération et coûte des frais d’engagement et d’équipement, un onze mixte équilibre, et le forfait économise de l’argent et fâche la tribune",
  ],
  "الدفع بفريق الشباب كاملًا": [
    "Field the youth team in full",
    "Aligner l’équipe de jeunes au complet",
  ],
  "رسوم مشاركة وتجهيز فريق الشباب في الكأس": [
    "Entry and kit fees for the youth team in the cup",
    "Frais d’engagement et d’équipement de l’équipe de jeunes en coupe",
  ],
  "تشكيل مختلط من الشباب والخبرة": [
    "A mixed lineup of youth and experience",
    "Un onze mixte de jeunesse et d’expérience",
  ],
  "الانسحاب من الدور الأول": [
    "Withdraw from the first round",
    "Se retirer du premier tour",
  ],
  "مدرج مؤقت لزيادة السعة": [
    "A temporary stand to raise capacity",
    "Une tribune temporaire pour augmenter la capacité",
  ],
  "الطلب على التذاكر أعلى من السعة": [
    "Ticket demand is above capacity",
    "La demande de billets dépasse la capacité",
  ],
  "المدرج ممتلئ منذ أسابيع وقائمة الانتظار طويلة. مدرج مؤقت يرفع السعة ويكلّف، وتحسين حركة الدخول يضيف مقاعد قليلة بلا مخاطرة إنشائية، وترك القائمة كما هي يحوّل الطلب إلى غضب": [
    "The stadium has been full for weeks and the waiting list is long. A temporary stand raises capacity and costs, improving the flow of entry adds a few seats without structural risk, and leaving capacity as it is turns demand into anger",
    "Le stade est complet depuis des semaines et la liste d’attente est longue. Une tribune temporaire augmente la capacité et coûte, améliorer les flux d’entrée ajoute quelques places sans risque structurel, et laisser la capacité telle quelle transforme la demande en colère",
  ],
  "تركيب مدرج مؤقت": [
    "Install a temporary stand",
    "Installer une tribune temporaire",
  ],
  "تحسين حركة الدخول والمقاعد": [
    "Improve entry flow and seating",
    "Améliorer les flux d’entrée et les places",
  ],
  "إبقاء السعة كما هي": [
    "Keep capacity as it is",
    "Garder la capacité telle quelle",
  ],

  // ── نكهة: تدريبات · جماهير · صحافة (flavor-training-fans-press.js, 108 نصًا) ──
  "حصة كرات ثابتة إضافية بعد التدريب": [
    "An extra set-piece session after training",
    "Une séance de coups de pied arrêtés supplémentaire après l’entraînement",
  ],
  "حصة كرات ثابتة إضافية": [
    "An extra set-piece session",
    "Séance de coups de pied arrêtés supplémentaire",
  ],
  "بقي سبعة لاعبين بعد التدريب لعشرين دقيقة على الركنيات والرميات الجانبية الهجومية": [
    "Seven players stayed twenty minutes after training on corners and attacking throw-ins",
    "Sept joueurs sont restés vingt minutes après l’entraînement sur les corners et les touches offensives",
  ],
  "ناشئون يتدربون مع الفريق الأول": [
    "Youngsters training with the first team",
    "Des jeunes à l’entraînement avec l’équipe première",
  ],
  "ناشئون في حصة الفريق الأول": [
    "Youngsters in the first-team session",
    "Des jeunes dans la séance de l’équipe première",
  ],
  "الجهاز استدعى ثلاثة أسماء من فريق الشباب لإكمال تقسيمة اليوم": [
    "The staff called up three names from the youth team to complete today's practice match",
    "Le staff a appelé trois noms de l’équipe de jeunes pour compléter l’opposition du jour",
  ],
  "تحسن أرقام غرفة الأوزان الأسبوعية": [
    "The weekly weights-room numbers improve",
    "Les chiffres hebdomadaires de la salle de musculation progressent",
  ],
  "أرقام غرفة الأوزان تتحسن": [
    "The weights-room numbers are improving",
    "Les chiffres de la musculation s’améliorent",
  ],
  "تقرير اللياقة الأسبوعي سجّل ارتفاعًا في متوسط أحمال القوة دون إصابات جديدة": [
    "The weekly fitness report recorded a rise in average strength loads with no new injuries",
    "Le rapport hebdomadaire de forme a enregistré une hausse des charges moyennes de force sans nouvelle blessure",
  ],
  "حصة اختيارية حضرها الجميع": [
    "An optional session everyone attended",
    "Une séance facultative à laquelle tous ont assisté",
  ],
  "حصة اختيارية بكامل القائمة": [
    "An optional session with the full squad",
    "Séance facultative avec tout l’effectif",
  ],
  "الحصة الاختيارية يوم الإجازة حضرها كل من هو متاح، دون طلب من الجهاز": [
    "Everyone available attended the optional session on the day off, without being asked by the staff",
    "Tous les disponibles ont assisté à la séance facultative du jour de repos, sans demande du staff",
  ],
  "تدريبات انفراد للحراس": [
    "One-on-one drills for the keepers",
    "Exercices de face-à-face pour les gardiens",
  ],
  "يوم انفرادات للحراس": [
    "A one-on-one day for the keepers",
    "Journée de face-à-face pour les gardiens",
  ],
  "حراس المرمى أنهوا حصة مخصصة للمواقف الفردية ورد الفعل القصير": [
    "The goalkeepers finished a session devoted to one-on-one situations and short reaction",
    "Les gardiens ont terminé une séance consacrée aux duels et aux réflexes courts",
  ],
  "جلسة فيديو عن التمركز الدفاعي": [
    "A video session on defensive positioning",
    "Une séance vidéo sur le placement défensif",
  ],
  "جلسة فيديو للخط الأوسط": [
    "A video session for the midfield line",
    "Séance vidéo pour la ligne du milieu",
  ],
  "أربعون دقيقة من اللقطات عن المسافات بين الخطوط في آخر مباراتين": [
    "Forty minutes of footage on the distances between the lines in the last two matches",
    "Quarante minutes d’images sur les distances entre les lignes lors des deux derniers matches",
  ],
  "تقديم مواعيد التدريب في موجة حر": [
    "Bringing training times forward in a heatwave",
    "Avancer les horaires d’entraînement en période de canicule",
  ],
  "التدريب في السادسة صباحًا": [
    "Training at six in the morning",
    "Entraînement à six heures du matin",
  ],
  "الجهاز قدّم الحصص ساعتين تفاديًا لذروة الحرارة، واكتفى بحمل بدني أخف": [
    "The staff moved the sessions two hours earlier to avoid the peak heat and settled for a lighter physical load",
    "Le staff a avancé les séances de deux heures pour éviter le pic de chaleur et s’est contenté d’une charge physique plus légère",
  ],
  "أرضية زلقة تعطل حصة التمرير": [
    "A slippery surface disrupts the passing session",
    "Une surface glissante perturbe la séance de passes",
  ],
  "حصة ممطرة وأرضية زلقة": [
    "A rainy session and a slippery pitch",
    "Séance pluvieuse et terrain glissant",
  ],
  "توقف التمرير الطويل مرتين بعد مطر الصباح، واكتملت الحصة على الملعب الفرعي": [
    "Long passing stopped twice after the morning rain, and the session was completed on the side pitch",
    "Le jeu long s’est arrêté deux fois après la pluie du matin, et la séance s’est achevée sur le terrain annexe",
  ],
  "مصاب يعود للتدريب التدريجي": [
    "An injured player returns to graduated training",
    "Un blessé revient à l’entraînement progressif",
  ],
  "عودة تدريجية من الإصابة": [
    "A graduated return from injury",
    "Retour progressif de blessure",
  ],
  "أحد المصابين بدأ الجري المنفرد ضمن خطة العودة، دون التحامات حتى الآن": [
    "One of the injured players started solo running as part of the return plan, with no contact so far",
    "L’un des blessés a commencé la course individuelle dans le cadre du plan de retour, sans contact pour l’instant",
  ],
  "غياب الدوليين يخفف كثافة الحصة": [
    "The absence of the internationals lightens the session's intensity",
    "L’absence des internationaux allège l’intensité de la séance",
  ],
  "حصة ناقصة العدد": [
    "A session short of numbers",
    "Une séance en effectif réduit",
  ],
  "التوقف الدولي أبقى عددًا من القائمة مع منتخباتهم، فالتدريب جرى بمجموعة مصغّرة": [
    "The international break kept several squad members with their national teams, so training ran with a reduced group",
    "La trêve internationale a retenu plusieurs membres de l’effectif avec leurs sélections, l’entraînement s’est donc déroulé en groupe réduit",
  ],
  "إشادة من الجهاز بالالتزام اليومي": [
    "The staff praises the daily commitment",
    "Le staff salue l’engagement quotidien",
  ],
  "إشادة داخلية بالالتزام": [
    "Internal praise for commitment",
    "Éloge interne pour l’assiduité",
  ],
  "الجهاز الفني أبلغ الإدارة أن التزام القائمة بالمواعيد هذا الأسبوع كان كاملًا": [
    "The technical staff told the management that the squad's punctuality this week was complete",
    "Le staff technique a indiqué à la direction que la ponctualité de l’effectif cette semaine avait été totale",
  ],
  "تقرير أحمال أسبوعي روتيني": [
    "A routine weekly load report",
    "Un rapport de charges hebdomadaire de routine",
  ],
  "تقرير الأحمال الأسبوعي": [
    "The weekly load report",
    "Le rapport de charges hebdomadaire",
  ],
  "ملف الأحمال وصل كالمعتاد: متوسط المسافات المقطوعة مستقر، ولا توصيات استثنائية": [
    "The load file arrived as usual: average distances covered are stable, with no exceptional recommendations",
    "Le dossier des charges est arrivé comme d’habitude : les distances moyennes parcourues sont stables, sans recommandation exceptionnelle",
  ],
  "تحضير دخلة في المدرج": [
    "Preparing a tifo in the stand",
    "Préparation d’un tifo en tribune",
  ],
  "دخلة قيد التحضير": [
    "A tifo in preparation",
    "Un tifo en préparation",
  ],
  "رابطتا المشجعين تعملان على لوحة مدرج للمباراة القادمة، بتمويل ذاتي": [
    "The two supporters' groups are working on a stand display for the next match, self-funded",
    "Les deux groupes de supporters travaillent sur une animation de tribune pour le prochain match, en autofinancement",
  ],
  "امتلاء حافلات التشجيع خارج الأرض": [
    "The away supporters' buses are full",
    "Les cars de supporters pour le déplacement sont complets",
  ],
  "حافلات خارج الأرض ممتلئة": [
    "Away buses full",
    "Cars de déplacement complets",
  ],
  "حُجزت كل مقاعد الحافلات المتجهة لمباراة خارج الأرض في أقل من يوم": [
    "Every seat on the buses heading to the away match was booked in under a day",
    "Toutes les places des cars pour le match à l’extérieur ont été réservées en moins d’un jour",
  ],
  "حملة تبرع جماهيرية في المدرج": [
    "A fan donation drive in the stand",
    "Une collecte de dons des supporters en tribune",
  ],
  "تبرعات من المدرج": [
    "Donations from the stand",
    "Des dons venus de la tribune",
  ],
  "جمع المشجعون مبلغًا لمستشفى الأطفال ووصل النادي خطاب شكر رسمي": [
    "The fans raised a sum for the children's hospital and an official letter of thanks reached the club",
    "Les supporters ont récolté une somme pour l’hôpital pour enfants et une lettre officielle de remerciement est parvenue au club",
  ],
  "رقم قياسي في عضويات الجمهور": [
    "A record number of fan memberships",
    "Un nombre record d’adhésions de supporters",
  ],
  "عضويات قياسية": [
    "Record memberships",
    "Adhésions record",
  ],
  "اشتراكات العضوية هذا الشهر تجاوزت أفضل رقم سابق للنادي": [
    "Membership subscriptions this month passed the club's previous best figure",
    "Les adhésions de ce mois ont dépassé le meilleur chiffre précédent du club",
  ],
  "جدارية جماهيرية في حي النادي": [
    "A fan mural in the club's neighbourhood",
    "Une fresque de supporters dans le quartier du club",
  ],
  "جدارية على سور الحي": [
    "A mural on the neighbourhood wall",
    "Une fresque sur le mur du quartier",
  ],
  "رسم مشجعون جدارية بألوان النادي على سور الشارع الخلفي للملعب": [
    "Fans painted a mural in the club colours on the wall of the street behind the stadium",
    "Des supporters ont peint une fresque aux couleurs du club sur le mur de la rue derrière le stade",
  ],
  "تلويح جماهيري بمقاطعة الشوط الأول": [
    "Fans threaten to boycott the first half",
    "Les supporters menacent de boycotter la première période",
  ],
  "تلويح بمقاطعة الشوط الأول": [
    "A threatened first-half boycott",
    "Menace de boycott de la première période",
  ],
  "مجموعات من المدرج لوّحت بالصمت أول خمس عشرة دقيقة احتجاجًا على المواعيد": [
    "Groups in the stand threatened silence for the first fifteen minutes in protest at the kick-off times",
    "Des groupes de la tribune ont menacé de garder le silence les quinze premières minutes pour protester contre les horaires",
  ],
  "أغنية مدرج جديدة تنتشر": [
    "A new terrace song spreads",
    "Un nouveau chant de tribune se répand",
  ],
  "أغنية جديدة في المدرج": [
    "A new song in the stand",
    "Un nouveau chant en tribune",
  ],
  "لحن جديد انتشر بين الروابط هذا الأسبوع بلا علاقة بأي لاعب بعينه": [
    "A new tune spread among the groups this week with no reference to any particular player",
    "Un nouvel air s’est répandu parmi les groupes cette semaine, sans référence à un joueur en particulier",
  ],
  "طوابير على المتجر الرسمي": [
    "Queues at the official store",
    "Files d’attente à la boutique officielle",
  ],
  "طوابير في المتجر الرسمي": [
    "Queues in the official store",
    "Files d’attente dans la boutique officielle",
  ],
  "امتد الطابور أمام المتجر الرسمي بعد وصول دفعة القمصان الجديدة": [
    "The queue outside the official store stretched after the new kit batch arrived",
    "La file devant la boutique officielle s’est allongée après l’arrivée du nouveau lot de maillots",
  ],
  "دعوة جماهيرية لقدامى اللاعبين": [
    "A fan call to invite the club's former players",
    "Un appel des supporters à inviter les anciens joueurs",
  ],
  "دعوة للقدامى": [
    "An invitation to the former players",
    "Une invitation aux anciens",
  ],
  "الروابط طلبت تخصيص مقاعد دائمة للاعبي النادي السابقين في المدرج الرئيسي": [
    "The groups asked for permanent seats for the club's former players in the main stand",
    "Les groupes ont demandé des places permanentes pour les anciens joueurs du club dans la tribune principale",
  ],
  "رفع الحظر عن حضور الجمهور الضيف": [
    "The ban on away supporters is lifted",
    "L’interdiction des supporters visiteurs est levée",
  ],
  "الجمهور الضيف يعود": [
    "The away fans return",
    "Le retour des supporters visiteurs",
  ],
  "السماح مجددًا بحضور جمهور الفريق الضيف بعد جولتين من المنع": [
    "Away supporters are again allowed to attend after two rounds of bans",
    "Les supporters visiteurs sont de nouveau autorisés après deux journées d’interdiction",
  ],
  "يوم أعلام في المدرج": [
    "A flag day in the stand",
    "Une journée de drapeaux en tribune",
  ],
  "يوم الأعلام": [
    "Flag day",
    "Journée des drapeaux",
  ],
  "وُزّعت أعلام صغيرة على البوابات بمبادرة من متطوعين لا من النادي": [
    "Small flags were handed out at the gates on a volunteers' initiative, not the club's",
    "De petits drapeaux ont été distribués aux portes à l’initiative de bénévoles, pas du club",
  ],
  "رسائل أطفال إلى لاعبي القائمة": [
    "Children's letters to the squad",
    "Des lettres d’enfants aux joueurs de l’effectif",
  ],
  "رسائل إلى غرفة الملابس": [
    "Letters to the dressing room",
    "Des lettres au vestiaire",
  ],
  "وصلت صندوق الإدارة رسائل من تلاميذ مدرسة حيّ النادي موجهة للاعبين بالاسم": [
    "Letters arrived at the management's box from pupils of the club neighbourhood's school, addressed to the players by name",
    "Des lettres sont arrivées à la boîte de la direction, écrites par les élèves de l’école du quartier du club et adressées aux joueurs par leur nom",
  ],
  "تقرير صحفي من داخل التدريب": [
    "A press report from inside training",
    "Un reportage de presse depuis l’entraînement",
  ],
  "تقرير من التدريب": [
    "A report from training",
    "Un compte rendu de l’entraînement",
  ],
  "مراسل رياضي نشر وصفًا لحصة اليوم دون أي تصريح من الجهاز": [
    "A sports reporter published a description of today's session without any statement from the staff",
    "Un journaliste sportif a publié une description de la séance du jour sans aucune déclaration du staff",
  ],
  "عمود رأي يمدح إدارة النادي": [
    "An opinion column praising the club's management",
    "Une chronique saluant la direction du club",
  ],
  "عمود في صالح الإدارة": [
    "A column in the management's favour",
    "Une chronique en faveur de la direction",
  ],
  "كاتب رياضي خصّص عموده لإدارة النادي ووصف قراراتها المالية بالمتزنة": [
    "A sports writer devoted his column to the club's management and described its financial decisions as balanced",
    "Un journaliste sportif a consacré sa chronique à la direction du club et a qualifié ses décisions financières d’équilibrées",
  ],
  "عمود رأي ينتقد التبديلات": [
    "An opinion column criticising the substitutions",
    "Une chronique critiquant les remplacements",
  ],
  "عمود ناقد": [
    "A critical column",
    "Une chronique critique",
  ],
  "انتقد كاتب رياضي توقيت التبديلات في آخر مباراة ووصفها بالمتأخرة": [
    "A sports writer criticised the timing of the substitutions in the last match and called them late",
    "Un journaliste sportif a critiqué le moment des remplacements lors du dernier match et les a jugés tardifs",
  ],
  "شائعة انتقال في صحيفة صباحية": [
    "A transfer rumour in a morning paper",
    "Une rumeur de transfert dans un journal du matin",
  ],
  "شائعة انتقال": [
    "A transfer rumour",
    "Une rumeur de transfert",
  ],
  "صحيفة ربطت اسمًا من قائمتك بنادٍ خارجي دون مصدر واضح": [
    "A newspaper linked a name from your squad to a foreign club without a clear source",
    "Un journal a associé un nom de votre effectif à un club étranger sans source claire",
  ],
  "تحديث صحفي عن حالة مصاب": [
    "A press update on an injured player",
    "Un point de presse sur un blessé",
  ],
  "تحديث عن الإصابة": [
    "An injury update",
    "Le point sur la blessure",
  ],
  "الصحافة الرياضية تابعت حالة المصاب وسألت عن موعد العودة": [
    "The sports press followed the injured player's condition and asked about the return date",
    "La presse sportive a suivi l’état du blessé et s’est interrogée sur la date de retour",
  ],
  "تقييمات الصحف للاعبي الجولة": [
    "The papers' ratings for the round's players",
    "Les notes de la presse pour les joueurs de la journée",
  ],
  "تقييمات الجولة": [
    "The round's ratings",
    "Les notes de la journée",
  ],
  "حصد اثنان من قائمتك أعلى تقييمات الجولة في الصحف المحلية": [
    "Two of your squad took the highest ratings of the round in the local papers",
    "Deux joueurs de votre effectif ont obtenu les meilleures notes de la journée dans la presse locale",
  ],
  "مقابلة إذاعية مع الجهاز الفني": [
    "A radio interview with the technical staff",
    "Une interview radio du staff technique",
  ],
  "مقابلة إذاعية": [
    "A radio interview",
    "Une interview radio",
  ],
  "حديث قصير على إذاعة محلية عن خطة الأسبوع، بلا تصريحات مثيرة": [
    "A short talk on a local radio station about the week's plan, with no sensational statements",
    "Une brève intervention sur une radio locale à propos du plan de la semaine, sans déclaration tapageuse",
  ],
  "صورة من الملعب تفوز بصورة الأسبوع": [
    "A stadium photo wins picture of the week",
    "Une photo du stade remporte l’image de la semaine",
  ],
  "صورة الأسبوع": [
    "Picture of the week",
    "L’image de la semaine",
  ],
  "صورة من مدرج النادي اختيرت الأفضل هذا الأسبوع في موقع رياضي": [
    "A photo from the club's stand was chosen as the best of the week on a sports website",
    "Une photo de la tribune du club a été choisie meilleure de la semaine sur un site sportif",
  ],
  "مقطع وثائقي قصير عن النادي": [
    "A short documentary clip about the club",
    "Un court extrait documentaire sur le club",
  ],
  "مقطع وثائقي قصير": [
    "A short documentary clip",
    "Un court extrait documentaire",
  ],
  "قناة رياضية نشرت مقطعًا من ثلاث دقائق عن تاريخ النادي في حيّه": [
    "A sports channel published a three-minute clip on the club's history in its neighbourhood",
    "Une chaîne sportive a publié un extrait de trois minutes sur l’histoire du club dans son quartier",
  ],
  "تحليل بيانات في موقع متخصص": [
    "A data analysis on a specialist website",
    "Une analyse de données sur un site spécialisé",
  ],
  "تحليل أرقام": [
    "An analysis of the numbers",
    "Une analyse chiffrée",
  ],
  "موقع إحصائي نشر قراءة رقمية لأداء الفريق في الثلث الأخير من الملعب": [
    "A statistics website published a numerical reading of the team's performance in the final third",
    "Un site de statistiques a publié une lecture chiffrée de la performance de l’équipe dans le dernier tiers du terrain",
  ],
  "استفتاء جماهيري على أفضل لاعب": [
    "A fan poll for the best player",
    "Un vote des supporters pour le meilleur joueur",
  ],
  "استفتاء أفضل لاعب": [
    "The best-player poll",
    "Le vote du meilleur joueur",
  ],
  "استفتاء إلكتروني اختار لاعبًا من قائمتك الأفضل هذا الشهر": [
    "An online poll chose a player from your squad as the best this month",
    "Un vote en ligne a désigné un joueur de votre effectif comme meilleur du mois",
  ],
  "تطفل صحافة صفراء على خصوصية لاعب": [
    "Tabloid intrusion into a player's privacy",
    "Intrusion de la presse tabloïd dans la vie privée d’un joueur",
  ],
  "تطفل صحفي": [
    "Press intrusion",
    "Intrusion de presse",
  ],
  "مصوّر تابع صحيفة صفراء انتظر أمام منزل لاعب، والإدارة القانونية تتابع": [
    "A photographer working for a tabloid waited outside a player's home, and the legal department is following it up",
    "Un photographe d’un tabloïd a attendu devant le domicile d’un joueur, et le service juridique suit l’affaire",
  ],

  // ── نكهة: طقس وملاعب · لاعبون سابقون · أساطير النادي (flavor-weather-former-legends.js, 98 نصًا) ──
  "تحذير أرصاد من موجة حر يوم المباراة": [
    "A weather warning for a heatwave on match day",
    "Une alerte météo pour une canicule le jour du match",
  ],
  "تحذير من موجة حر": [
    "A heatwave warning",
    "Alerte canicule",
  ],
  "الأرصاد تتوقع ذروة حرارة يوم المباراة، والتنظيم جهّز نقاط مياه إضافية": [
    "The meteorological office expects peak heat on match day, and the organisers prepared extra water points",
    "La météo prévoit un pic de chaleur le jour du match, et l’organisation a préparé des points d’eau supplémentaires",
  ],
  "أمطار تؤجل مباراة فريق الشباب": [
    "Rain postpones the youth team's match",
    "La pluie reporte le match de l’équipe de jeunes",
  ],
  "تأجيل مباراة الشباب": [
    "The youth match is postponed",
    "Report du match des jeunes",
  ],
  "أرضية الملعب الفرعي غرقت فؤجّلت مباراة الشباب إلى الأسبوع القادم": [
    "The side pitch was flooded, so the youth match was postponed to next week",
    "Le terrain annexe était inondé, le match des jeunes est donc reporté à la semaine prochaine",
  ],
  "رياح تعطل حصة الكرات العرضية": [
    "Wind disrupts the crossing session",
    "Le vent perturbe la séance de centres",
  ],
  "رياح في وجه العرضيات": [
    "Wind against the crosses",
    "Du vent contre les centres",
  ],
  "الرياح الجانبية أفسدت حصة الكرات العرضية فاستُبدلت بعمل داخل الصالة": [
    "The crosswind ruined the crossing session, which was replaced by indoor work",
    "Le vent latéral a gâché la séance de centres, remplacée par un travail en salle",
  ],
  "أسبوع معتدل مثالي للتدريب": [
    "A mild week, ideal for training",
    "Une semaine douce, idéale pour l’entraînement",
  ],
  "أسبوع معتدل": [
    "A mild week",
    "Une semaine douce",
  ],
  "حرارة معتدلة ورياح خفيفة سمحتا بحصتين كاملتين على الملعب الرئيسي": [
    "Mild temperatures and light winds allowed two full sessions on the main pitch",
    "Des températures douces et un vent léger ont permis deux séances complètes sur le terrain principal",
  ],
  "تقرير حالة العشب قبل الجولة": [
    "A turf condition report before the round",
    "Un rapport sur l’état du gazon avant la journée",
  ],
  "تقرير العشب": [
    "The turf report",
    "Le rapport sur le gazon",
  ],
  "مهندس الأرضية سلّم تقريره قبل الجولة: كثافة العشب مقبولة ولا حاجة لعلاج": [
    "The groundsman handed in his report before the round: turf density is acceptable and no treatment is needed",
    "L’intendant du terrain a remis son rapport avant la journée : la densité du gazon est acceptable et aucun traitement n’est nécessaire",
  ],
  "تحديث بوابات الدخول الإلكترونية": [
    "An upgrade of the electronic entry gates",
    "Une mise à niveau des portiques d’entrée électroniques",
  ],
  "بوابات دخول جديدة": [
    "New entry gates",
    "De nouveaux portiques d’entrée",
  ],
  "رُكّبت بوابات إلكترونية عند المدخل الشمالي على نفقة شركة التشغيل": [
    "Electronic gates were installed at the north entrance at the operating company's expense",
    "Des portiques électroniques ont été installés à l’entrée nord aux frais de la société d’exploitation",
  ],
  "اختبار إنارة ليلي للملعب": [
    "A night lighting test at the stadium",
    "Un test d’éclairage nocturne du stade",
  ],
  "اختبار الإنارة": [
    "The lighting test",
    "Le test d’éclairage",
  ],
  "اختبار مسائي لأبراج الإنارة قبل مباريات الشهر، ومرّ دون ملاحظات": [
    "An evening test of the floodlight towers ahead of this month's matches passed without remarks",
    "Un test en soirée des pylônes d’éclairage avant les matches du mois s’est déroulé sans remarque",
  ],
  "نقل مباراة خارج الأرض لملعب آخر": [
    "An away match moved to another stadium",
    "Un match à l’extérieur déplacé dans un autre stade",
  ],
  "تغيير ملعب المباراة": [
    "A change of venue",
    "Un changement de stade",
  ],
  "نُقلت مباراتك القادمة خارج الأرض إلى ملعب بديل لأعمال صيانة": [
    "Your next away match was moved to an alternative stadium for maintenance works",
    "Votre prochain match à l’extérieur a été déplacé dans un stade de remplacement pour travaux d’entretien",
  ],
  "أغطية مطر على أرضية الملعب": [
    "Rain covers on the pitch",
    "Des bâches de pluie sur le terrain",
  ],
  "أغطية المطر": [
    "The rain covers",
    "Les bâches de pluie",
  ],
  "فُردت أغطية على الأرضية الرئيسية تحسبًا لمطر الليلة": [
    "Covers were laid over the main pitch in expectation of rain tonight",
    "Des bâches ont été déployées sur le terrain principal en prévision de la pluie de ce soir",
  ],
  "شهادة سعة جديدة من سلطات السلامة": [
    "A new capacity certificate from the safety authorities",
    "Un nouveau certificat de capacité délivré par les autorités de sécurité",
  ],
  "شهادة سعة محدثة": [
    "An updated capacity certificate",
    "Un certificat de capacité actualisé",
  ],
  "سلطات السلامة جددت شهادة السعة بعد معاينة مخارج الطوارئ": [
    "The safety authorities renewed the capacity certificate after inspecting the emergency exits",
    "Les autorités de sécurité ont renouvelé le certificat de capacité après inspection des issues de secours",
  ],
  "انقطاع مياه في مركز التدريب": [
    "A water cut at the training centre",
    "Une coupure d’eau au centre d’entraînement",
  ],
  "انقطاع مياه بمركز التدريب": [
    "Water cut at the training centre",
    "Coupure d’eau au centre d’entraînement",
  ],
  "انقطعت المياه ساعتين عن مركز التدريب فأُنهيت الحصة مبكرًا": [
    "The water was cut for two hours at the training centre, so the session ended early",
    "L’eau a été coupée deux heures au centre d’entraînement, la séance s’est donc terminée plus tôt",
  ],
  "لاعب سابق يحصل على رخصة تدريب": [
    "A former player earns a coaching licence",
    "Un ancien joueur obtient une licence d’entraîneur",
  ],
  "رخصة تدريب جديدة": [
    "A new coaching licence",
    "Une nouvelle licence d’entraîneur",
  ],
  "لاعب سابق من النادي أنهى متطلبات الرخصة التدريبية الثانية": [
    "A former club player completed the requirements for the second coaching licence",
    "Un ancien joueur du club a rempli les exigences de la deuxième licence d’entraîneur",
  ],
  "لاعب سابق محللًا في برنامج تلفزيوني": [
    "A former player as a television pundit",
    "Un ancien joueur comme consultant télé",
  ],
  "لاعب سابق على الشاشة": [
    "A former player on screen",
    "Un ancien joueur à l’écran",
  ],
  "انضم اسم سابق في النادي إلى طاولة تحليل برنامج مسائي": [
    "A former name of the club joined the analysis desk of an evening show",
    "Un ancien nom du club a rejoint le plateau d’analyse d’une émission du soir",
  ],
  "لاعب سابق يعمل في جهاز الأكاديمية": [
    "A former player working in the academy staff",
    "Un ancien joueur au sein du staff de l’académie",
  ],
  "سابق في الأكاديمية": [
    "A former player in the academy",
    "Un ancien à l’académie",
  ],
  "لاعب سابق بدأ عملًا جزئيًا مع فرق الأكاديمية في حصص إنهاء الهجمات": [
    "A former player started part-time work with the academy teams on finishing sessions",
    "Un ancien joueur a commencé un travail à temps partiel avec les équipes de l’académie sur les séances de finition",
  ],
  "لاعب سابق يطلق حملة خيرية باسم النادي": [
    "A former player launches a charity appeal in the club's name",
    "Un ancien joueur lance une collecte caritative au nom du club",
  ],
  "حملة خيرية باسم النادي": [
    "A charity appeal in the club's name",
    "Une collecte caritative au nom du club",
  ],
  "أطلق لاعب سابق حملة تبرعات لأطفال الحي وطلب شعار النادي عليها": [
    "A former player launched a donation drive for the neighbourhood's children and asked for the club crest on it",
    "Un ancien joueur a lancé une collecte de dons pour les enfants du quartier et a demandé le blason du club dessus",
  ],
  "اعتزال مبكر بسبب إصابة قديمة": [
    "An early retirement because of an old injury",
    "Une retraite précoce à cause d’une ancienne blessure",
  ],
  "اعتزال مبكر": [
    "An early retirement",
    "Une retraite précoce",
  ],
  "أعلن اسم سابق في النادي اعتزاله النهائي بعد إصابة لم تستجب للعلاج": [
    "A former name of the club announced his final retirement after an injury that did not respond to treatment",
    "Un ancien nom du club a annoncé sa retraite définitive après une blessure qui n’a pas répondu au traitement",
  ],
  "عشاء سنوي لقدامى النادي": [
    "An annual dinner for the club's former players",
    "Un dîner annuel des anciens du club",
  ],
  "عشاء القدامى": [
    "The former players' dinner",
    "Le dîner des anciens",
  ],
  "عشاء سنوي جمع قدامى النادي، وحضره اثنان من قائمتك الحالية": [
    "An annual dinner brought together the club's former players, attended by two of your current squad",
    "Un dîner annuel a réuni les anciens du club, auquel ont assisté deux joueurs de votre effectif actuel",
  ],
  "لاعب سابق يرشّح اسمًا للكشف": [
    "A former player recommends a name to the scouts",
    "Un ancien joueur recommande un nom aux recruteurs",
  ],
  "ترشيح من لاعب سابق": [
    "A recommendation from a former player",
    "Une recommandation d’un ancien joueur",
  ],
  "اتصل اسم سابق بالجهاز الفني ورشّح لاعبًا شاهده في دوري الدرجة الثانية": [
    "A former name contacted the technical staff and recommended a player he watched in the second division",
    "Un ancien nom a contacté le staff technique et recommandé un joueur qu’il a vu en deuxième division",
  ],
  "نجاح لاعب سابق في دوري أجنبي": [
    "A former player's success in a foreign league",
    "Le succès d’un ancien joueur dans un championnat étranger",
  ],
  "نجاح خارج الحدود": [
    "Success abroad",
    "Un succès à l’étranger",
  ],
  "لاعب سابق من أبناء النادي فاز بلقب محلي مع ناديه الأجنبي": [
    "A former player from the club's academy won a domestic title with his foreign club",
    "Un ancien joueur formé au club a remporté un titre national avec son club étranger",
  ],
  "زيارة لاعب سابق لحصة تدريبية": [
    "A former player visits a training session",
    "La visite d’un ancien joueur à une séance d’entraînement",
  ],
  "زيارة في التدريب": [
    "A visit to training",
    "Une visite à l’entraînement",
  ],
  "حضر لاعب سابق الحصة المفتوحة وتحدث دقائق قصيرة مع القائمة": [
    "A former player attended the open session and spoke for a few minutes with the squad",
    "Un ancien joueur a assisté à la séance ouverte et a parlé quelques minutes avec l’effectif",
  ],
  "مقتطف من مذكرات لاعب سابق": [
    "An extract from a former player's memoirs",
    "Un extrait des mémoires d’un ancien joueur",
  ],
  "مقتطف من مذكرات": [
    "An extract from memoirs",
    "Un extrait de mémoires",
  ],
  "نُشر فصل من مذكرات لاعب سابق يروي فيه ليلة لقب قديم في هذا الملعب": [
    "A chapter of a former player's memoirs was published, recounting an old title night at this stadium",
    "Un chapitre des mémoires d’un ancien joueur a été publié, racontant une nuit de titre d’autrefois dans ce stade",
  ],
  "التخطيط لمباراة تكريمية للاعب سابق": [
    "Planning a testimonial for a former player",
    "Préparer un match d’hommage pour un ancien joueur",
  ],
  "مباراة تكريمية قيد التخطيط": [
    "A testimonial in planning",
    "Un match d’hommage en préparation",
  ],
  "لجنة من القدامى تطلب موعدًا لمباراة تكريمية يعود ريعها لأسر اللاعبين": [
    "A committee of former players asks for a date for a testimonial whose proceeds go to players' families",
    "Un comité d’anciens demande une date pour un match d’hommage dont les recettes iront aux familles des joueurs",
  ],
  "إدراج اسم جديد في قاعة شرف النادي": [
    "A new name added to the club's hall of honour",
    "Un nouveau nom inscrit au panthéon du club",
  ],
  "اسم جديد في قاعة الشرف": [
    "A new name in the hall of honour",
    "Un nouveau nom au panthéon",
  ],
  "أُضيف اسم إلى قاعة شرف النادي بعد مراجعة لجنة التاريخ": [
    "A name was added to the club's hall of honour after review by the history committee",
    "Un nom a été ajouté au panthéon du club après examen par le comité d’histoire",
  ],
  "متحف النادي يستقبل زيارات مدرسية": [
    "The club museum receives school visits",
    "Le musée du club reçoit des visites scolaires",
  ],
  "زيارات مدرسية للمتحف": [
    "School visits to the museum",
    "Visites scolaires du musée",
  ],
  "ثلاث مدارس زارت ركن الكؤوس هذا الأسبوع بتنظيم من متطوعين": [
    "Three schools visited the trophy corner this week, organised by volunteers",
    "Trois écoles ont visité le coin des trophées cette semaine, organisé par des bénévoles",
  ],
  "حجب رقم قميص أسطورة": [
    "Retiring a legend's shirt number",
    "Retirer le numéro de maillot d’une légende",
  ],
  "رقم قميص محجوب": [
    "A retired shirt number",
    "Un numéro de maillot retiré",
  ],
  "قرر النادي حجب رقم قميص أحد أسمائه التاريخية في المواسم القادمة": [
    "The club decided to retire the shirt number of one of its historic names for the coming seasons",
    "Le club a décidé de retirer le numéro de maillot de l’un de ses noms historiques pour les saisons à venir",
  ],
  "ذكرى لقب تاريخي للنادي": [
    "The anniversary of a historic club title",
    "L’anniversaire d’un titre historique du club",
  ],
  "ذكرى لقب": [
    "A title anniversary",
    "Un anniversaire de titre",
  ],
  "يصادف هذا الأسبوع ذكرى لقب تاريخي، والمدرج يحضّر لافتة خاصة": [
    "This week marks the anniversary of a historic title, and the stand is preparing a special banner",
    "Cette semaine marque l’anniversaire d’un titre historique, et la tribune prépare une banderole spéciale",
  ],
  "تصريح لأسطورة عن الفريق الحالي": [
    "A legend's statement about the current team",
    "Une déclaration d’une légende sur l’équipe actuelle",
  ],
  "تصريح من أسطورة": [
    "A statement from a legend",
    "Une déclaration d’une légende",
  ],
  "قال اسم تاريخي في النادي إن هذه القائمة «تذكّره بجيل جيد»، وانتشر التصريح": [
    "A historic name of the club said this squad «reminds him of a good generation», and the remark spread",
    "Un nom historique du club a déclaré que cet effectif « lui rappelle une bonne génération », et la remarque s’est répandue",
  ],
  "حضور أسطورة لحصة تدريبية": [
    "A legend attends a training session",
    "Une légende assiste à une séance d’entraînement",
  ],
  "جلس أحد أساطير النادي على طرف الملعب وتابع الحصة كاملة": [
    "One of the club's legends sat at the side of the pitch and watched the whole session",
    "L’une des légendes du club s’est assise au bord du terrain et a suivi toute la séance",
  ],
  "ترميم أرشيف صور النادي": [
    "Restoring the club's photo archive",
    "Restaurer les archives photographiques du club",
  ],
  "ترميم الأرشيف": [
    "Restoring the archive",
    "Restauration des archives",
  ],
  "بدأ ترميم ألبومات صور الخمسينيات بمساعدة أرشيف حكومي": [
    "Work began on restoring the 1950s photo albums with the help of a state archive",
    "La restauration des albums photo des années 1950 a commencé avec l’aide d’une archive publique",
  ],
  "جدل جماهيري حول أحقية اسم بقاعة الشرف": [
    "A fan debate over a name's place in the hall of honour",
    "Un débat de supporters sur la place d’un nom au panthéon",
  ],
  "جدل على قاعة الشرف": [
    "A debate over the hall of honour",
    "Débat sur le panthéon",
  ],
  "اعترضت مجموعة من المشجعين على معايير الإدراج الأخيرة في قاعة الشرف": [
    "A group of fans objected to the latest criteria for inclusion in the hall of honour",
    "Un groupe de supporters a contesté les derniers critères d’inscription au panthéon",
  ],
  "مؤسسة أساطير النادي تتبرع لمستشفى": [
    "The club legends' foundation donates to a hospital",
    "La fondation des légendes du club fait un don à un hôpital",
  ],
  "تبرع مؤسسة الأساطير": [
    "The legends' foundation donation",
    "Le don de la fondation des légendes",
  ],
  "سلّمت مؤسسة قدامى النادي تبرعًا لمستشفى الأطفال باسم النادي": [
    "The club's former players' foundation handed over a donation to the children's hospital in the club's name",
    "La fondation des anciens du club a remis un don à l’hôpital pour enfants au nom du club",
  ],
  "أسطورة يتابع ناشئًا في مباراة الشباب": [
    "A legend watches a youngster in a youth match",
    "Une légende observe un jeune lors d’un match des jeunes",
  ],
  "عين أسطورة على الشباب": [
    "A legend's eye on the youth",
    "L’œil d’une légende sur les jeunes",
  ],
  "تابع اسم تاريخي مباراة فريق الشباب ودوّن ملاحظات عن ثلاثة لاعبين": [
    "A historic name watched the youth team's match and took notes on three players",
    "Un nom historique a suivi le match de l’équipe de jeunes et pris des notes sur trois joueurs",
  ],
  "إطلاق كتاب عن تاريخ النادي": [
    "Launching a book on the club's history",
    "Lancement d’un livre sur l’histoire du club",
  ],
  "كتاب تاريخ النادي": [
    "The club history book",
    "Le livre d’histoire du club",
  ],
  "أُطلق كتاب مصوّر عن تاريخ النادي، ونفدت الطبعة الأولى في المتجر": [
    "An illustrated book on the club's history was launched, and the first edition sold out in the store",
    "Un livre illustré sur l’histoire du club a été lancé, et la première édition s’est épuisée à la boutique",
  ],

  // ── نكهة: منافسون · تحكيم · سوق الانتقالات (flavor-rivals-refereeing-market.js, 93 نصًا) ──
  "صراع الصدارة يشتد في الجدول": [
    "The title race tightens in the table",
    "La course au titre se resserre au classement",
  ],
  "صدارة مضغوطة": [
    "A tight top of the table",
    "Un sommet de classement serré",
  ],
  "فارق النقاط بين أول أربعة أندية في الجدول صار نقطة أو نقطتين": [
    "The points gap between the top four clubs in the table is now one or two points",
    "L’écart de points entre les quatre premiers clubs du classement est désormais d’un ou deux points",
  ],
  "إقالة مدرب نادٍ منافس": [
    "A rival club sacks its coach",
    "Un club rival limoge son entraîneur",
  ],
  "إقالة في نادي منافس": [
    "A sacking at a rival club",
    "Un limogeage dans un club rival",
  ],
  "أقال نادٍ منافس مدربه بعد ثلاث جولات بلا فوز، وأسند المهمة لمدرب مؤقت": [
    "A rival club sacked its coach after three rounds without a win and handed the job to an interim coach",
    "Un club rival a limogé son entraîneur après trois journées sans victoire et confié la mission à un entraîneur intérimaire",
  ],
  "منافس يوقّع صفقة كبيرة": [
    "A rival signs a big deal",
    "Un rival signe un gros coup",
  ],
  "صفقة كبيرة لمنافس": [
    "A big signing for a rival",
    "Un gros recrutement pour un rival",
  ],
  "أعلن منافس مباشر توقيع لاعب بقيمة مرتفعة قبل إغلاق النافذة": [
    "A direct rival announced the signing of a player at a high value before the window closed",
    "Un rival direct a annoncé la signature d’un joueur à forte valeur avant la clôture du mercato",
  ],
  "إصابات تضرب منافسًا قبل مواجهتك": [
    "Injuries hit a rival before your meeting",
    "Des blessures frappent un rival avant votre confrontation",
  ],
  "إصابات عند المنافس": [
    "Injuries at the rival",
    "Blessures chez le rival",
  ],
  "فقد منافسك القادم ثلاثة أسماء بداعي الإصابة في جولة واحدة": [
    "Your next opponent lost three names to injury in a single round",
    "Votre prochain adversaire a perdu trois joueurs sur blessure en une seule journée",
  ],
  "منافس يصعّد ناشئًا للفريق الأول": [
    "A rival promotes a youngster to the first team",
    "Un rival promeut un jeune en équipe première",
  ],
  "ناشئ عند المنافس": [
    "A youngster at the rival",
    "Un jeune chez le rival",
  ],
  "أشرك نادٍ منافس ناشئًا في السادسة عشرة لمدة عشر دقائق": [
    "A rival club fielded a sixteen-year-old youngster for ten minutes",
    "Un club rival a aligné un jeune de seize ans pendant dix minutes",
  ],
  "عقوبة على جمهور نادٍ منافس": [
    "A sanction on a rival club's fans",
    "Une sanction contre les supporters d’un club rival",
  ],
  "عقوبة على جمهور منافس": [
    "A sanction on rival fans",
    "Une sanction contre des supporters rivaux",
  ],
  "قررت اللجنة منع جمهور نادٍ منافس من حضور مباراة بسبب أحداث المدرج": [
    "The committee decided to ban a rival club's fans from attending a match because of incidents in the stand",
    "La commission a décidé d’interdire aux supporters d’un club rival d’assister à un match en raison d’incidents en tribune",
  ],
  "منافس يبدأ أعمال تطوير في ملعبه": [
    "A rival starts development works at its stadium",
    "Un rival entame des travaux dans son stade",
  ],
  "تطوير ملعب منافس": [
    "A rival's stadium development",
    "Le développement du stade d’un rival",
  ],
  "بدأ نادٍ منافس أعمال توسعة في ملعبه ترفع سعته الموسم القادم": [
    "A rival club started expansion works at its stadium that will raise its capacity next season",
    "Un club rival a commencé des travaux d’agrandissement de son stade qui augmenteront sa capacité la saison prochaine",
  ],
  "اتهام منافس بمفاوضة لاعبك دون إذن": [
    "An accusation that a rival approached your player without permission",
    "Une accusation d’approche d’un rival envers votre joueur sans autorisation",
  ],
  "اتهام بمفاوضة غير قانونية": [
    "An accusation of illegal approach",
    "Une accusation d’approche illégale",
  ],
  "وصل الإدارة ما يفيد بأن نادًا منافسًا فاوض لاعبًا من قائمتك مباشرة": [
    "The management received word that a rival club negotiated directly with a player from your squad",
    "La direction a été informée qu’un club rival avait négocié directement avec un joueur de votre effectif",
  ],
  "منافس يقترح ودية خيرية مشتركة": [
    "A rival proposes a joint charity friendly",
    "Un rival propose un amical caritatif commun",
  ],
  "عرض ودية خيرية": [
    "A charity friendly offer",
    "Une offre de match amical caritatif",
  ],
  "اقترح نادٍ منافس مباراة ودية خيرية في التوقف يعود ريعها لصندوق مشترك": [
    "A rival club proposed a charity friendly during the break with proceeds going to a joint fund",
    "Un club rival a proposé un match amical caritatif pendant la trêve, dont les recettes iraient à un fonds commun",
  ],
  "رقم حضور قياسي في ديربي المدينة": [
    "A record attendance in the city derby",
    "Une affluence record dans le derby de la ville",
  ],
  "حضور قياسي في الديربي": [
    "A record derby attendance",
    "Affluence record au derby",
  ],
  "سجّل ديربي المدينة أعلى حضور في الجولة على مستوى المسابقة": [
    "The city derby recorded the highest attendance of the round in the competition",
    "Le derby de la ville a enregistré la plus forte affluence de la journée dans la compétition",
  ],
  "محاولة منافس خطف ناشئ من الأكاديمية": [
    "A rival's attempt to poach an academy youngster",
    "Une tentative d’un rival de débaucher un jeune de l’académie",
  ],
  "محاولة خطف ناشئ": [
    "An attempt to poach a youngster",
    "Une tentative de débauchage d’un jeune",
  ],
  "رصدت الأكاديمية تواصل نادٍ منافس مع أسرة ناشئ تحت السن": [
    "The academy detected a rival club contacting the family of an underage youngster",
    "L’académie a détecté la prise de contact d’un club rival avec la famille d’un jeune mineur",
  ],
  "إعلان طاقم تحكيم مباراتك القادمة": [
    "The officiating team for your next match is announced",
    "L’équipe arbitrale de votre prochain match est annoncée",
  ],
  "طاقم التحكيم": [
    "The officiating team",
    "L’équipe arbitrale",
  ],
  "أُعلن اسم حكم الساحة ومساعدَيه لمباراتك القادمة ضمن الجولة": [
    "The referee and his two assistants were announced for your next match of the round",
    "L’arbitre central et ses deux assistants ont été annoncés pour votre prochain match de la journée",
  ],
  "إحصائية مراجعات الفيديو هذا الموسم": [
    "Video review statistics for this season",
    "Statistiques des revues vidéo cette saison",
  ],
  "أرقام الفيديو": [
    "The video numbers",
    "Les chiffres de la vidéo",
  ],
  "نشرت اللجنة عدد مراجعات الفيديو هذا الموسم ومتوسط زمن المراجعة": [
    "The committee published the number of video reviews this season and the average review time",
    "La commission a publié le nombre de revues vidéo cette saison et la durée moyenne de revue",
  ],
  "جلسة تعريفية من الحكام لقادة الفرق": [
    "A briefing session from the referees to the team captains",
    "Une séance d’information des arbitres aux capitaines",
  ],
  "جلسة تعريفية للقادة": [
    "A captains' briefing",
    "Une séance d’information des capitaines",
  ],
  "شرح حكم دولي تعديلات لمسة اليد لقادة الأندية في جلسة مغلقة": [
    "An international referee explained the handball amendments to club captains in a closed session",
    "Un arbitre international a expliqué les amendements sur la main aux capitaines des clubs lors d’une séance à huis clos",
  ],
  "حكم محلي ينال شارة دولية": [
    "A domestic referee earns an international badge",
    "Un arbitre national obtient un badge international",
  ],
  "شارة دولية لحكم محلي": [
    "An international badge for a domestic referee",
    "Un badge international pour un arbitre national",
  ],
  "انضم حكم من المسابقة المحلية إلى القائمة الدولية هذا العام": [
    "A referee from the domestic competition joined the international list this year",
    "Un arbitre de la compétition nationale a rejoint la liste internationale cette année",
  ],
  "جدل تحكيمي على ركلة جزاء يتصدر البرامج": [
    "A refereeing row over a penalty tops the shows",
    "Une polémique arbitrale sur un penalty en tête des émissions",
  ],
  "جدل على ركلة جزاء": [
    "A row over a penalty",
    "Polémique sur un penalty",
  ],
  "ركلة جزاء محتسبة في الجولة شغلت البرامج الرياضية يومين كاملين": [
    "A penalty awarded in the round kept the sports shows busy for two full days",
    "Un penalty accordé lors de la journée a occupé les émissions sportives deux jours entiers",
  ],
  "إصابة حكم تؤخر بداية الشوط": [
    "A referee injury delays the start of the half",
    "La blessure d’un arbitre retarde le début de la période",
  ],
  "إصابة حكم": [
    "A referee injury",
    "Blessure d’un arbitre",
  ],
  "توقفت بداية الشوط الثاني سبع دقائق لإصابة مساعد الحكم": [
    "The start of the second half was held for seven minutes because of an assistant referee's injury",
    "Le début de la seconde période a été retardé de sept minutes à cause de la blessure d’un arbitre assistant",
  ],
  "فحص تقنية خط المرمى قبل الجولة": [
    "A goal-line technology check before the round",
    "Un contrôle de la technologie de ligne de but avant la journée",
  ],
  "فحص خط المرمى": [
    "The goal-line check",
    "Le contrôle de la ligne de but",
  ],
  "فريق التقنية أنهى فحص أنظمة خط المرمى في ملعب الجولة": [
    "The technical team finished checking the goal-line systems at the round's stadium",
    "L’équipe technique a achevé le contrôle des systèmes de ligne de but au stade de la journée",
  ],
  "رفض احتجاج نادٍ على قرار تحكيمي": [
    "A club's protest over a refereeing decision is rejected",
    "Le recours d’un club sur une décision arbitrale est rejeté",
  ],
  "احتجاج مرفوض": [
    "A rejected protest",
    "Un recours rejeté",
  ],
  "رفضت اللجنة احتجاج نادٍ على قرار تحكيمي وأيدت تقرير الحكم": [
    "The committee rejected a club's protest over a refereeing decision and upheld the referee's report",
    "La commission a rejeté le recours d’un club sur une décision arbitrale et confirmé le rapport de l’arbitre",
  ],
  "نقص حكام في مباريات الشباب": [
    "A shortage of officials in youth matches",
    "Une pénurie d’arbitres dans les matches de jeunes",
  ],
  "نقص حكام الشباب": [
    "The youth officials shortage",
    "La pénurie d’arbitres des jeunes",
  ],
  "أدار مباراة الشباب حكم واحد بلا مساعدين بسبب نقص الأطقم": [
    "The youth match was run by a single referee without assistants because of the shortage of crews",
    "Le match des jeunes a été dirigé par un seul arbitre sans assistants en raison du manque d’équipes",
  ],
  "تقرير شفافية من لجنة الحكام": [
    "A transparency report from the referees' committee",
    "Un rapport de transparence de la commission des arbitres",
  ],
  "تقرير شفافية": [
    "A transparency report",
    "Un rapport de transparence",
  ],
  "نشرت لجنة الحكام تسجيلات صوتية مختارة من غرفة الفيديو هذا الشهر": [
    "The referees' committee published selected audio recordings from the video room this month",
    "La commission des arbitres a publié des enregistrements audio choisis de la salle vidéo ce mois-ci",
  ],
  "فتح نافذة الانتقالات رسميًا": [
    "The transfer window opens officially",
    "Le mercato ouvre officiellement",
  ],
  "النافذة مفتوحة": [
    "The window is open",
    "Le mercato est ouvert",
  ],
  "فُتحت نافذة الانتقالات رسميًا وبدأ تسجيل العقود الجديدة": [
    "The transfer window officially opened and the registration of new contracts began",
    "Le mercato a officiellement ouvert et l’enregistrement des nouveaux contrats a commencé",
  ],
  "أيام معدودة على إغلاق النافذة": [
    "Only days left before the window closes",
    "Plus que quelques jours avant la clôture du mercato",
  ],
  "النافذة تقفل": [
    "The window is closing",
    "Le mercato se referme",
  ],
  "بقيت أيام على إغلاق النافذة، والحركة تتركز في الساعات الأخيرة": [
    "Days remain before the window closes, and activity is concentrated in the final hours",
    "Il reste des jours avant la clôture du mercato, et l’activité se concentre dans les dernières heures",
  ],
  "ارتفاع مؤشر أسعار السوق المحلية": [
    "The domestic market price index rises",
    "L’indice des prix du marché national augmente",
  ],
  "مؤشر الأسعار": [
    "The price index",
    "L’indice des prix",
  ],
  "رصد مركز دراسات ارتفاعًا في متوسط قيمة اللاعب المحلي هذا الموسم": [
    "A research centre recorded a rise in the average value of the domestic player this season",
    "Un centre d’études a relevé une hausse de la valeur moyenne du joueur national cette saison",
  ],
  "تقرير عن عمولات وكلاء اللاعبين": [
    "A report on player agents' commissions",
    "Un rapport sur les commissions des agents de joueurs",
  ],
  "عمولات الوكلاء": [
    "Agents' commissions",
    "Les commissions des agents",
  ],
  "نُشر مجموع عمولات الوسطاء في المسابقة، ورقم النادي ضمن المتوسط": [
    "The total of intermediaries' commissions in the competition was published, and the club's figure is within the average",
    "Le total des commissions des intermédiaires dans la compétition a été publié, et le chiffre du club se situe dans la moyenne",
  ],
  "رفض عرض لضم لاعب محلي بارز": [
    "An offer for a prominent domestic player is rejected",
    "Une offre pour un joueur national en vue est refusée",
  ],
  "عرض مرفوض": [
    "A rejected offer",
    "Une offre refusée",
  ],
  "رفض نادٍ محلي عرضًا للاعبه البارز ووصفه بأنه أقل من قيمته": [
    "A domestic club rejected an offer for its prominent player and called it below his value",
    "Un club national a refusé une offre pour son joueur en vue et l’a jugée inférieure à sa valeur",
  ],
  "ارتفاع قيمة ناشئي السوق": [
    "The market value of youngsters rises",
    "La valeur des jeunes sur le marché augmente",
  ],
  "قيم الناشئين ترتفع": [
    "Youth values are rising",
    "Les valeurs des jeunes augmentent",
  ],
  "قفزت تقديرات قيمة اللاعبين تحت ٢١ سنة في السوق المحلية": [
    "Value estimates for under-21 players jumped in the domestic market",
    "Les estimations de valeur des moins de 21 ans ont bondi sur le marché national",
  ],
  "تحديث قائمة اللاعبين الأحرار": [
    "The free agents list is updated",
    "La liste des agents libres est mise à jour",
  ],
  "قائمة الأحرار": [
    "The free agents list",
    "La liste des agents libres",
  ],
  "حُدّثت قائمة اللاعبين بلا عقود، وفيها أسماء محلية وخارجية": [
    "The list of players without contracts was updated, with domestic and foreign names on it",
    "La liste des joueurs sans contrat a été mise à jour, avec des noms nationaux et étrangers",
  ],
  "تذكير رسمي بلائحة الإعارات": [
    "An official reminder of the loan regulations",
    "Un rappel officiel du règlement des prêts",
  ],
  "تذكير بلائحة الإعارة": [
    "A reminder of the loan regulations",
    "Un rappel du règlement des prêts",
  ],
  "أرسلت الإدارة المنظمة تذكيرًا بحد الإعارات المسموح لكل نادٍ": [
    "The governing body sent a reminder of the loan limit allowed per club",
    "L’instance dirigeante a envoyé un rappel de la limite de prêts autorisée par club",
  ],
  "تسريب ملاحظة كشّاف عن هدف محتمل": [
    "A leaked scout note about a potential target",
    "Une note de recruteur fuitée sur une cible potentielle",
  ],
  "تسريب ملاحظة كشف": [
    "A leaked scouting note",
    "Une note de recrutement fuitée",
  ],
  "تسرّبت ملاحظة كشف داخلية عن اسم محتمل ووصلت إلى صحيفتين": [
    "An internal scouting note about a potential name leaked and reached two newspapers",
    "Une note de recrutement interne sur un nom potentiel a fuité et atteint deux journaux",
  ],
  "تضخم الرواتب في السوق الإقليمي": [
    "Wage inflation in the regional market",
    "L’inflation salariale sur le marché régional",
  ],
  "تضخم الرواتب": [
    "Wage inflation",
    "L’inflation salariale",
  ],
  "أندية الإقليم رفعت عروض الرواتب، والفارق مع بند رواتبك صار أوضح": [
    "The region's clubs have raised their wage offers, and the gap with your wage line has become clearer",
    "Les clubs de la région ont relevé leurs offres salariales, et l’écart avec votre masse salariale est devenu plus net",
  ],

  // ══ تحديث الدراما 0.25 ══

  // ── قرارات الدراما 0.25 (لاعبون · غرفة الملابس · جماهير · مالي · صحافة · موسمية) (decisions-drama.js, 183 نصًا) ──
  "وكيل الهدّاف يطلب إعادة تسعير العقد": [
    "The top scorer's agent asks for the contract to be repriced",
    "L'agent du meilleur buteur demande une revalorisation du contrat",
  ],
  "وكيل يطلب زيادة بعد موسم تهديفي": [
    "An agent demands a raise after a goal-scoring season",
    "Un agent réclame une hausse après une saison de buts",
  ],
  "وكيل هدّاف الفريق يربط بقاءه بإعادة تسعير العقد، ويستشهد بأرقامه المسجلة هذا الموسم. الموافقة ترفع بند الرواتب، والرفض قد يكلّفك غرفة الملابس": [
    "The squad's top scorer's agent ties his stay to a repriced contract, citing his recorded numbers this season. Agreeing lifts the wage budget; refusing may cost you the dressing room",
    "L'agent du meilleur buteur de l'effectif lie son maintien à un contrat revalorisé, citant ses chiffres enregistrés cette saison. Accepter alourdit la masse salariale ; refuser peut coûter le vestiaire",
  ],
  "اعتماد الزيادة فورًا": [
    "Approve the raise immediately",
    "Approuver la hausse immédiatement",
  ],
  "العقد الجديد رُفع في بند الرواتب، واللاعبون الأعلى تقييمًا قرأوا الرسالة إيجابيًا": [
    "The new contract was added to the wage budget, and the highest-rated players read the message positively",
    "Le nouveau contrat a été ajouté à la masse salariale, et les joueurs les mieux notés ont bien reçu le message",
  ],
  "زيادة مرتبطة بالأهداف والمشاركات": [
    "A raise linked to goals and appearances",
    "Une hausse indexée sur les buts et les apparitions",
  ],
  "البنود المرتبطة بالأداء ترفع التكلفة جزئيًا فقط، لكنها تُبقي الوكيل على الطاولة": [
    "Performance-linked clauses raise the cost only partly, but they keep the agent at the table",
    "Les clauses liées à la performance n'alourdissent le coût qu'en partie, mais elles gardent l'agent à la table",
  ],
  "رفض قاطع وإغلاق الملف": [
    "A firm refusal and closing the file",
    "Un refus ferme et le dossier clos",
  ],
  "الملف أُغلق بلا زيادة؛ المعنويات بين نجوم القائمة انخفضت بوضوح": [
    "The file was closed with no raise; morale among the squad's stars dropped visibly",
    "Le dossier a été clos sans hausse ; le moral des cadres a visiblement baissé",
  ],
  "نجم على الدكة يعترض علنًا": [
    "A star on the bench objects publicly",
    "Une star sur le banc conteste publiquement",
  ],
  "تمرد نجم على مقاعد البدلاء": [
    "A star rebels against the bench",
    "Révolte d'une star contre le banc",
  ],
  "لاعب بارز خرج من التشكيل الأساسي واعترض على القرار في وسائل الإعلام. الغرفة تراقب: أي ردّ سترسم به حدود الانضباط؟": [
    "A prominent player was dropped from the starting eleven and objected to the decision in the media. The dressing room is watching: which response will set your disciplinary boundaries?",
    "Un joueur majeur a été écarté du onze de départ et a contesté la décision dans les médias. Le vestiaire observe : quelle réponse fixera vos limites disciplinaires ?",
  ],
  "غرامة مالية وإبقاء خارج القائمة": [
    "A fine and keeping him out of the squad",
    "Une amende et un maintien hors du groupe",
  ],
  "الغرامة حُصّلت لصالح النادي، لكن النجوم شعروا أن الرسالة قاسية": [
    "The fine was collected for the club, but the stars felt the message was harsh",
    "L'amende a été encaissée par le club, mais les cadres ont trouvé le message dur",
  ],
  "حوار مغلق وإعادة دمج": [
    "A private talk and reintegrating him",
    "Une discussion en privé et une réintégration",
  ],
  "الحوار أعاد الهدوء، لكنه بدا للبعض تنازلًا عن مبدأ الاختيار الفني": [
    "The talk restored calm, but to some it looked like conceding the principle of the coach's selection",
    "La discussion a ramené le calme, mais certains y ont vu un renoncement au principe du choix technique",
  ],
  "فتح باب العروض أمامه": [
    "Opening the door to offers for him",
    "Ouvrir la porte aux offres le concernant",
  ],
  "عائد بيع محتمل بعد فتح باب العروض": [
    "Possible sale proceeds after offers were invited",
    "Produit de vente éventuel après l'ouverture aux offres",
  ],
  "السوق يعرف الآن أن اللاعب متاح؛ العائد المتوقع ليس مضمونًا قبل إتمام الصفقة": [
    "The market now knows the player is available; the expected return is not guaranteed before a deal is done",
    "Le marché sait désormais que le joueur est disponible ; le retour attendu n'est pas garanti avant la conclusion d'un accord",
  ],
  "طلب رحيل رسمي من لاعب في القائمة": [
    "A formal transfer request from a squad player",
    "Une demande de départ officielle d'un joueur de l'effectif",
  ],
  "طلب رحيل على مكتب الإدارة": [
    "A transfer request on the board's desk",
    "Une demande de départ sur le bureau de la direction",
  ],
  "لاعب مؤثر قدّم طلب رحيل مكتوبًا بعد اهتمام خارجي. البيع يمنح سيولة ويخسر الجمهور، والرفض يحفظ الهيبة ويهدد المعنويات": [
    "An influential player has submitted a written transfer request after outside interest. Selling brings cash and loses the crowd; refusing keeps the prestige and threatens morale",
    "Un joueur influent a remis une demande de départ écrite après un intérêt extérieur. Vendre apporte de la trésorerie et froisse le public ; refuser préserve le prestige et menace le moral",
  ],
  "قبول البيع بأفضل عرض": [
    "Accept the sale at the best offer",
    "Accepter la vente à la meilleure offre",
  ],
  "المبلغ دخل الحساب فورًا، والقائمة فقدت أحد أبرز أسمائها": [
    "The money entered the account immediately, and the squad lost one of its biggest names",
    "L'argent est entré immédiatement au compte, et l'effectif a perdu l'un de ses plus grands noms",
  ],
  "رفض علني مع تأكيد الالتزام": [
    "A public refusal reaffirming his commitment",
    "Un refus public réaffirmant son engagement",
  ],
  "البيان أرضى المدرّجات، لكنه ترك لاعبًا غير راضٍ داخل الغرفة": [
    "The statement pleased the stands, but it left an unhappy player inside the dressing room",
    "Le communiqué a plu aux tribunes, mais il a laissé un joueur mécontent dans le vestiaire",
  ],
  "تحسين العقد لسحب الطلب": [
    "Improve the contract to withdraw the request",
    "Améliorer le contrat pour retirer la demande",
  ],
  "الطلب سُحب مقابل عقد محسّن؛ بند الرواتب ارتفع على المدى الكامل": [
    "The request was withdrawn against an improved contract; the wage budget rose for its full term",
    "La demande a été retirée contre un contrat amélioré ; la masse salariale a augmenté sur toute sa durée",
  ],
  "شجار بين لاعبَين في حصة تدريبية": [
    "A fight between two players in a training session",
    "Une bagarre entre deux joueurs à l'entraînement",
  ],
  "شجار في التدريب": [
    "A fight at training",
    "Bagarre à l'entraînement",
  ],
  "احتكاك في تقسيمة التدريب تحوّل إلى شجار أمام الجهاز كله. التسريب للصحافة مسألة وقت؛ الطريقة التي تحسم بها اليوم هي ما سيتذكره اللاعبون": [
    "A challenge in the training match turned into a fight in front of the whole staff. A leak to the press is a matter of time; how you settle it today is what the players will remember",
    "Un contact dans le match d'entraînement a tourné à la bagarre devant tout le staff. La fuite vers la presse n'est qu'une question de temps ; la façon dont vous tranchez aujourd'hui est ce que les joueurs retiendront",
  ],
  "غرامة على الطرفَين أمام المجموعة": [
    "Fine both parties in front of the group",
    "Sanctionner les deux parties devant le groupe",
  ],
  "الغرامة حُصّلت وأُعلن القرار داخليًا؛ الانضباط واضح والثمن معنوي": [
    "The fine was collected and the decision announced internally; discipline is clear and the price is morale",
    "L'amende a été encaissée et la décision annoncée en interne ; la discipline est claire et le prix est moral",
  ],
  "احتواء داخلي بلا عقوبات": [
    "Contain it internally without sanctions",
    "Contenir l'affaire en interne sans sanctions",
  ],
  "الملف أُغلق داخل الغرفة، لكن غياب العقوبة ترك أسئلة عن المعايير": [
    "The file was closed inside the dressing room, but the absence of a sanction left questions about standards",
    "Le dossier a été clos dans le vestiaire, mais l'absence de sanction a laissé des questions sur les standards",
  ],
  "فصل الحصص وإعادة الجدولة": [
    "Split sessions and reschedule",
    "Séances séparées et nouvelle planification",
  ],
  "تكلفة حصص تدريبية إضافية منفصلة": [
    "Cost of separate extra training sessions",
    "Coût de séances d'entraînement supplémentaires séparées",
  ],
  "الحصص المنفصلة خفّضت الاحتكاك ورفعت التكلفة وقلّصت زمن التدريب المشترك": [
    "Separate sessions reduced contact, raised the cost and shortened the shared training time",
    "Les séances séparées ont réduit les contacts, augmenté le coût et raccourci le temps d'entraînement commun",
  ],
  "إصابة طويلة تفرض البحث عن بديل": [
    "A long injury forces the search for a replacement",
    "Une longue blessure impose de chercher un remplaçant",
  ],
  "غياب طويل يحتاج تغطية": [
    "A long absence needs cover",
    "Une longue absence nécessite une couverture",
  ],
  "التقرير الطبي يؤكد غيابًا يمتد لأكثر من شهر ونصف. المركز يحتاج تغطية الآن: السوق، أو الأكاديمية، أو إعادة توزيع الأدوار داخليًا": [
    "The medical report confirms an absence of more than six weeks. The position needs cover now: the market, the academy, or redistributing roles internally",
    "Le rapport médical confirme une absence de plus de six semaines. Le poste doit être couvert maintenant : le marché, le centre de formation, ou une redistribution interne des rôles",
  ],
  "بديل مؤقت حتى نهاية الموسم": [
    "A temporary replacement until the end of the season",
    "Un remplaçant temporaire jusqu'à la fin de la saison",
  ],
  "بديل مؤقت": [
    "Temporary cover",
    "Renfort temporaire",
  ],
  "الصفقة المؤقتة رُفعت إلى القائمة، وتكلفتها ظهرت في بند الرواتب": [
    "The temporary deal was added to the squad, and its cost showed up in the wage budget",
    "Le contrat temporaire a été ajouté à l'effectif, et son coût est apparu dans la masse salariale",
  ],
  "تصعيد بديل من الأكاديمية": [
    "Promote a replacement from the academy",
    "Promouvoir un remplaçant du centre de formation",
  ],
  "الناشئ انضم للقائمة الأولى؛ القرار قرأته المدرّجات كاستثمار في النادي": [
    "The youngster joined the first-team squad; the stands read the decision as investment in the club",
    "Le jeune a rejoint le groupe professionnel ; les tribunes y ont vu un investissement dans le club",
  ],
  "إعادة توزيع الأدوار داخليًا": [
    "Redistributing roles internally",
    "Redistribuer les rôles en interne",
  ],
  "بلا إنفاق وبلا وافد جديد، لكن الحمل البدني توزّع على قائمة أقصر": [
    "No spending and no new arrival, but the physical load spread across a shorter squad",
    "Aucune dépense et aucune recrue, mais la charge physique s'est répartie sur un effectif plus court",
  ],
  "أزمة إصابات تضرب القائمة دفعة واحدة": [
    "An injury crisis hits the squad all at once",
    "Une crise de blessures frappe l'effectif d'un coup",
  ],
  "غرفة العلاج ممتلئة": [
    "The treatment room is full",
    "La salle de soins est pleine",
  ],
  "أربعة لاعبين أو أكثر في قائمة المصابين في الوقت نفسه. الجهاز الطبي يطلب قرارًا: عيادة متخصصة، أو تدوير قاسٍ، أو الاستمرار كما هو": [
    "Four players or more are on the injury list at the same time. The medical staff wants a decision: a specialist clinic, harsh rotation, or carrying on as is",
    "Quatre joueurs ou plus figurent en même temps sur la liste des blessés. Le staff médical attend une décision : une clinique spécialisée, une rotation sévère, ou continuer comme ça",
  ],
  "تحويل الحالات إلى عيادة متخصصة": [
    "Transfer the cases to a specialist clinic",
    "Transférer les cas vers une clinique spécialisée",
  ],
  "العيادة المتخصصة قصّرت مدد الغياب المسجلة للحالات القائمة": [
    "The specialist clinic shortened the recorded absence periods for the existing cases",
    "La clinique spécialisée a raccourci les durées d'absence enregistrées pour les cas existants",
  ],
  "تدوير قاسٍ وإشراك الأسماء الأقل": [
    "Harsh rotation and using the lesser names",
    "Rotation sévère et recours aux noms les moins utilisés",
  ],
  "الدقائق وُزّعت على القائمة كلها؛ الأقل جاهزية تعرّض لإصابة إضافية، والأقل تقييمًا حصل على فرصة": [
    "Minutes were spread across the whole squad; the least fit player picked up an extra injury, and the lowest-rated got a chance",
    "Les minutes ont été réparties sur tout l'effectif ; le joueur le moins en forme s'est blessé à nouveau, et le moins bien noté a eu sa chance",
  ],
  "الاستمرار بالبرنامج الحالي": [
    "Carry on with the current programme",
    "Poursuivre le programme actuel",
  ],
  "لا إنفاق إضافيًا ولا تغيير؛ المصابون شعروا أن التعافي ليس أولوية": [
    "No extra spending and no change; the injured felt recovery was not a priority",
    "Aucune dépense supplémentaire et aucun changement ; les blessés ont senti que la récupération n'était pas prioritaire",
  ],
  "انقسام غرفة الملابس بعد هزيمة ثقيلة": [
    "The dressing room splits after a heavy defeat",
    "Le vestiaire se divise après une lourde défaite",
  ],
  "غرفة الملابس بعد هزيمة ثقيلة": [
    "The dressing room after a heavy defeat",
    "Le vestiaire après une lourde défaite",
  ],
  "الهزيمة الكبيرة تركت اتهامات متبادلة بين الخطوط. أمامك اجتماع مغلق، أو تغيير في التشكيل، أو تحمّل علني للمسؤولية": [
    "The heavy defeat left mutual accusations between the lines. You have a closed meeting, a change in the lineup, or taking responsibility publicly",
    "La lourde défaite a laissé des accusations mutuelles entre les lignes. Il vous reste une réunion à huis clos, un changement dans la composition, ou une prise de responsabilité publique",
  ],
  "اجتماع مغلق بلا أجهزة ولا صحافة": [
    "A closed meeting with no devices and no press",
    "Une réunion à huis clos, sans appareils ni presse",
  ],
  "الاجتماع الطويل أعاد الهدوء وخصم من زمن الاستشفاء": [
    "The long meeting restored calm and ate into recovery time",
    "La longue réunion a ramené le calme et a entamé le temps de récupération",
  ],
  "تغييرات فورية في التشكيل": [
    "Immediate changes to the lineup",
    "Des changements immédiats dans la composition",
  ],
  "الإبعاد أعاد ترتيب الأدوار؛ من خرج من الحسابات تلقّى الرسالة بقسوة": [
    "Dropping players reordered the roles; those left out received the message harshly",
    "Écarter des joueurs a redistribué les rôles ; ceux qui sont sortis ont reçu le message durement",
  ],
  "تحمّل المسؤولية أمام الصحافة": [
    "Take responsibility in front of the press",
    "Assumer la responsabilité devant la presse",
  ],
  "الظهور العلني رفع رصيد الإدارة وحمى اللاعبين، لكنه أثقل الغرفة": [
    "The public appearance raised the board's standing and shielded the players, but it weighed on the room",
    "L'apparition publique a rehaussé la crédibilité de la direction et protégé les joueurs, mais elle a pesé sur le vestiaire",
  ],
  "استثمار الروح المعنوية بعد فوز كبير": [
    "Cash in on the morale after a big win",
    "Exploiter le moral après une large victoire",
  ],
  "فوز كبير وروح عالية": [
    "A big win and high spirits",
    "Une large victoire et un moral élevé",
  ],
  "الفوز بفارق مريح رفع الروح في الغرفة. اللحظة قابلة للتحويل إلى رصيد: مكافأة، راحة، أو استثمار إعلامي مدروس": [
    "Winning by a comfortable margin lifted the mood in the room. The moment can be turned into credit: a bonus, rest, or a considered media push",
    "Gagner avec une marge confortable a remonté l'humeur du vestiaire. Le moment peut se transformer en capital : une prime, du repos, ou une exposition médiatique réfléchie",
  ],
  "مكافأة فورية للقائمة": [
    "An immediate bonus for the squad",
    "Une prime immédiate pour l'effectif",
  ],
  "المكافأة صُرفت نقدًا ورفعت المعنويات في كل القائمة": [
    "The bonus was paid in cash and lifted morale across the whole squad",
    "La prime a été versée en espèces et a remonté le moral de tout l'effectif",
  ],
  "يوم راحة إضافي واستشفاء": [
    "An extra rest day and recovery",
    "Un jour de repos supplémentaire et de la récupération",
  ],
  "الراحة الإضافية رفعت الجاهزية البدنية قبل الاستحقاق التالي": [
    "The extra rest raised physical readiness before the next commitment",
    "Le repos supplémentaire a augmenté la condition physique avant la prochaine échéance",
  ],
  "استثمار الفوز إعلاميًا وتجاريًا": [
    "Exploit the win in the media and commercially",
    "Exploiter la victoire médiatiquement et commercialement",
  ],
  "عائد حملة إعلامية بعد الفوز الكبير": [
    "Return from a media campaign after the big win",
    "Revenu d'une campagne médiatique après la large victoire",
  ],
  "الحملة الإعلامية جدولة عائدًا لاحقًا، ورفعت صورة النادي": [
    "The media campaign scheduled a later return and lifted the club's image",
    "La campagne médiatique a programmé un revenu ultérieur et a amélioré l'image du club",
  ],
  "لاعب مخضرم يعرض التدخل لإصلاح الغرفة": [
    "A veteran player offers to step in and mend the room",
    "Un vétéran propose d'intervenir pour réparer le vestiaire",
  ],
  "مبادرة من قائد كبير في السن": [
    "An initiative from a senior leader",
    "Une initiative d'un cadre expérimenté",
  ],
  "أحد مخضرمي القائمة يطلب تفويضًا لإصلاح العلاقة مع المجموعة المحبطة. دعمه يمنحك أثرًا معنويًا بلا إنفاق، ورفضه قد يعزله": [
    "One of the squad's veterans asks for a mandate to repair relations with the downcast group. Backing him gives you a morale effect at no cost; refusing may isolate him",
    "Un des vétérans de l'effectif demande un mandat pour réparer la relation avec le groupe abattu. Le soutenir offre un effet moral sans dépense ; le refuser risque de l'isoler",
  ],
  "منحه دورًا رسميًا داخل الجهاز": [
    "Give him an official role within the staff",
    "Lui confier un rôle officiel au sein du staff",
  ],
  "الدور الرسمي أضيف لبند الرواتب، وأثره ظهر على المخضرمين والمحبطِين": [
    "The official role was added to the wage budget, and its effect showed on the veterans and the downcast",
    "Le rôle officiel a été ajouté à la masse salariale, et son effet s'est vu sur les vétérans et les joueurs abattus",
  ],
  "دعمه بهدوء بلا إعلان": [
    "Back him quietly, without an announcement",
    "Le soutenir discrètement, sans annonce",
  ],
  "الدعم غير المعلن ترك المبادرة ملكًا للاعب، وأثرها أضعف من الإعلان": [
    "The unannounced support left the initiative in the player's hands, and its effect is weaker than going public",
    "Le soutien non annoncé a laissé l'initiative au joueur, et son effet est plus faible qu'une annonce publique",
  ],
  "رفض التدخل في عمل الجهاز": [
    "Refuse interference in the staff's work",
    "Refuser toute ingérence dans le travail du staff",
  ],
  "الحدود محفوظة للجهاز الفني، والمخضرمون قرأوا الرفض كإبعاد": [
    "The boundaries stay with the coaching staff, and the veterans read the refusal as being sidelined",
    "Les limites restent celles du staff technique, et les vétérans ont vécu le refus comme une mise à l'écart",
  ],
  "طلب تمويل تيفو قبل مباراة كبيرة": [
    "A request to fund a tifo before a big match",
    "Une demande de financement d'un tifo avant un grand match",
  ],
  "تيفو المقصورة أمام مباراة كبيرة": [
    "A stand tifo ahead of a big match",
    "Un tifo de tribune avant un grand match",
  ],
  "رابط المشجعين يعرض تصميمًا ضخمًا للمدرج قبل اللقاء الكبير ويطلب دعمًا لوجستيًا وماليًا. الأثر على الحضور والمعنويات واضح، والتكلفة فورية": [
    "The supporters' group has designed a huge stand display for the big match and asks for logistical and financial backing. The effect on attendance and morale is clear, and the cost is immediate",
    "Le groupe de supporters a conçu une immense animation de tribune pour le grand match et demande un soutien logistique et financier. L'effet sur l'affluence et le moral est net, et le coût est immédiat",
  ],
  "تمويل كامل للتصميم والتنفيذ": [
    "Full funding for the design and execution",
    "Un financement complet de la conception et de la réalisation",
  ],
  "المدرج امتلأ بالصورة نفسها التي أرادها الجمهور، واللاعبون رأوها قبل الصافرة": [
    "The stand was filled with the very image the fans wanted, and the players saw it before kick-off",
    "La tribune s'est remplie de l'image même voulue par les supporters, et les joueurs l'ont vue avant le coup d'envoi",
  ],
  "دعم لوجستي بلا تمويل نقدي": [
    "Logistical support without cash funding",
    "Un soutien logistique sans financement en espèces",
  ],
  "النادي وفّر الأمن والتصاريح والنقل، والجمهور تحمّل بقية التكلفة": [
    "The club provided security, permits and transport, and the fans covered the rest of the cost",
    "Le club a fourni la sécurité, les autorisations et le transport, et les supporters ont couvert le reste du coût",
  ],
  "الاعتذار لدواعٍ أمنية": [
    "Declining on security grounds",
    "Refuser pour des raisons de sécurité",
  ],
  "الرفض لأسباب تنظيمية أوقف التيفو وخفض حرارة المدرج": [
    "The refusal for organisational reasons stopped the tifo and cooled the temperature in the stand",
    "Le refus pour raisons organisationnelles a stoppé le tifo et fait retomber la température de la tribune",
  ],
  "مطالبة جماهيرية برحيل المدرب بعد سلسلة سيئة": [
    "Fans demand the coach's departure after a poor run",
    "Les supporters réclament le départ de l'entraîneur après une mauvaise série",
  ],
  "المدرّج يطلب رأس الجهاز الفني": [
    "The stands want the coaching staff's head",
    "Les tribunes réclament la tête du staff technique",
  ],
  "سلسلة نتائج سيئة أشعلت المدرجات وهاشتاغ يطالب برحيل المدرب. الإقالة تكلّف شرطًا جزائيًا وجهازًا جديدًا، والثقة العلنية قد تزيد الضغط": [
    "A poor run of results has set the stands alight along with a hashtag demanding the coach's departure. A sacking costs a release clause and a new staff; public confidence may add to the pressure",
    "Une mauvaise série de résultats a enflammé les tribunes et un mot-dièse réclame le départ de l'entraîneur. Un limogeage coûte une clause de rupture et un nouveau staff ; une confiance publique peut accroître la pression",
  ],
  "إعلان ثقة علني بالمدرب": [
    "A public statement of confidence in the coach",
    "Une déclaration publique de confiance en l'entraîneur",
  ],
  "البيان حمى الجهاز ورفع معنويات القائمة، وأغضب جزءًا من المدرّج": [
    "The statement protected the staff and lifted the squad's morale, and angered part of the stand",
    "Le communiqué a protégé le staff et remonté le moral de l'effectif, et fâché une partie de la tribune",
  ],
  "إقالة وتعيين جهاز مؤقت": [
    "Sack the coach and appoint an interim staff",
    "Limoger et nommer un staff intérimaire",
  ],
  "تعاقد جهاز فني بديل": [
    "Signing a replacement coaching staff",
    "Contrat d'un staff technique remplaçant",
  ],
  "الشرط الجزائي دُفع الآن، وعقد الجهاز البديل التزم به النادي على تسعين يومًا": [
    "The release clause was paid now, and the club committed to the replacement staff's contract over ninety days",
    "La clause de rupture a été payée maintenant, et le club s'est engagé sur le contrat du staff remplaçant sur quatre-vingt-dix jours",
  ],
  "تعيين مدير رياضي لامتصاص الضغط": [
    "Appoint a sporting director to absorb the pressure",
    "Nommer un directeur sportif pour absorber la pression",
  ],
  "الوجه الجديد تولّى الخطاب الإعلامي، وبقي الجهاز الفني في مكانه": [
    "The new face took over the media line, and the coaching staff stayed in place",
    "Le nouveau visage a repris le discours médiatique, et le staff technique est resté en place",
  ],
  "راعٍ طارئ بعرض مغرٍ وشروط صعبة": [
    "An emergency sponsor with a tempting offer and harsh terms",
    "Un sponsor d'urgence à l'offre alléchante et aux conditions difficiles",
  ],
  "عرض رعاية طارئ بشروط قاسية": [
    "An emergency sponsorship offer with harsh terms",
    "Une offre de sponsoring d'urgence aux conditions sévères",
  ],
  "شركة تعرض مبلغًا كبيرًا فورًا مقابل مساحة على القميص وبنود حصرية مشددة. المال يحلّ أزمة اليوم، والبنود تكلّف النادي لاحقًا وجماهيريًا": [
    "A company offers a large sum immediately for shirt space and strict exclusivity clauses. The money solves today's crisis, and the clauses cost the club later and with the fans",
    "Une entreprise propose une grosse somme immédiatement contre de l'espace sur le maillot et des clauses d'exclusivité strictes. L'argent règle la crise du jour, et les clauses coûtent au club plus tard et auprès des supporters",
  ],
  "قبول العرض ببنوده كاملة": [
    "Accept the offer with all its clauses",
    "Accepter l'offre avec toutes ses clauses",
  ],
  "التزامات الحصرية والغرامات التعاقدية للراعي الطارئ": [
    "Exclusivity commitments and contractual penalties for the emergency sponsor",
    "Engagements d'exclusivité et pénalités contractuelles du sponsor d'urgence",
  ],
  "المبلغ دخل الآن، والالتزام الأكبر استُحق بعد ستة أشهر حسب العقد": [
    "The amount came in now, and the larger commitment fell due six months later under the contract",
    "Le montant est entré maintenant, et l'engagement le plus important est devenu exigible six mois plus tard selon le contrat",
  ],
  "تفاوض على تخفيف البنود": [
    "Negotiate to soften the clauses",
    "Négocier un allègement des clauses",
  ],
  "التزامات مخفّضة بعد إعادة التفاوض مع الراعي الطارئ": [
    "Reduced commitments after renegotiating with the emergency sponsor",
    "Engagements réduits après renégociation avec le sponsor d'urgence",
  ],
  "إعادة التفاوض خفّضت المبلغ الفوري والالتزام اللاحق معًا": [
    "Renegotiating lowered both the immediate amount and the later commitment",
    "La renégociation a abaissé à la fois le montant immédiat et l'engagement ultérieur",
  ],
  "الانسحاب وحماية صورة النادي": [
    "Walk away and protect the club's image",
    "Se retirer et protéger l'image du club",
  ],
  "لا مال فوري ولا التزام لاحق؛ الصورة العامة هي المكسب الوحيد": [
    "No immediate money and no later commitment; the public image is the only gain",
    "Pas d'argent immédiat et aucun engagement ultérieur ; l'image publique est le seul gain",
  ],
  "تسريب التشكيلة قبل مباراة مهمة": [
    "The lineup is leaked before an important match",
    "La composition fuite avant un match important",
  ],
  "التشكيلة على صفحات الصحافة": [
    "The lineup on the press pages",
    "La composition à la une de la presse",
  ],
  "تشكيلة المباراة المهمة نُشرت قبل موعدها بأيام، والمصدر داخل المبنى. التحقيق يكلّف وقتًا ومالًا، وتغيير الخطة يكلّف استعدادًا بدنيًا": [
    "The lineup for the important match was published days early, and the source is inside the building. An investigation costs time and money, and changing the plan costs physical preparation",
    "La composition du match important a été publiée des jours à l'avance, et la source se trouve dans l'immeuble. Une enquête coûte du temps et de l'argent, et changer de plan coûte de la préparation physique",
  ],
  "تحقيق داخلي وإعلان نتائج مختصرة": [
    "An internal investigation and a summary of findings",
    "Une enquête interne et un résumé des conclusions",
  ],
  "التحقيق ضبط التسريب ورفع صورة الانضباط، وألقى بظلاله على الغرفة": [
    "The investigation tracked down the leak and raised the image of discipline, and it cast a shadow over the room",
    "L'enquête a identifié la fuite et renforcé l'image de discipline, tout en jetant une ombre sur le vestiaire",
  ],
  "تغيير الخطة والتشكيل بالكامل": [
    "Change the plan and the lineup entirely",
    "Changer complètement le plan et la composition",
  ],
  "إعادة التحضير في أيام قليلة استهلكت جاهزية القائمة وأربكت الخصم": [
    "Re-preparing in a few days consumed the squad's readiness and unsettled the opponent",
    "Se réadapter en quelques jours a consommé la fraîcheur de l'effectif et déstabilisé l'adversaire",
  ],
  "نفي علني والتصرف كأن شيئًا لم يكن": [
    "Deny it publicly and carry on as if nothing happened",
    "Démentir publiquement et agir comme si de rien n'était",
  ],
  "النفي أراح اللاعبين لكنه ترك مصداقية الإدارة محل سؤال": [
    "The denial reassured the players but it left the board's credibility in question",
    "Le démenti a rassuré les joueurs mais a laissé la crédibilité de la direction en question",
  ],
  "شائعة انتقال تطارد نجم الفريق": [
    "A transfer rumour hounds the team's star",
    "Une rumeur de transfert poursuit la star de l'équipe",
  ],
  "شائعة انتقال في الصفحات الأولى": [
    "A transfer rumour on the front pages",
    "Une rumeur de transfert en première page",
  ],
  "صحيفة تنشر عرضًا خارجيًا لنجم القائمة دون تأكيد. النفي القاطع يهدّئ المدرّج، والتجاهل يترك الشائعة تعمل، وفتح الباب يرفع القيمة ويخفض الثقة": [
    "A newspaper publishes an outside offer for the squad's star without confirmation. A flat denial calms the stands, ignoring it lets the rumour run, and opening the door raises the value and lowers trust",
    "Un journal publie une offre extérieure pour la star de l'effectif sans confirmation. Un démenti ferme calme les tribunes, l'ignorer laisse la rumeur courir, et ouvrir la porte augmente la valeur et réduit la confiance",
  ],
  "نفي قاطع على لسان النادي": [
    "A flat denial in the club's name",
    "Un démenti ferme au nom du club",
  ],
  "البيان أغلق الشائعة جماهيريًا وأحرج اللاعب أمام زملائه": [
    "The statement closed the rumour with the fans and embarrassed the player in front of his team-mates",
    "Le communiqué a clos la rumeur auprès des supporters et mis le joueur mal à l'aise devant ses coéquipiers",
  ],
  "تصريحات غامضة بلا نفي": [
    "Ambiguous remarks without a denial",
    "Des déclarations ambiguës sans démenti",
  ],
  "الغموض أبقى كل الخيارات مفتوحة ورفع التوتر داخل الغرفة": [
    "The ambiguity kept every option open and raised the tension inside the room",
    "L'ambiguïté a gardé toutes les options ouvertes et fait monter la tension dans le vestiaire",
  ],
  "الإقرار بالاهتمام وفتح التفاوض": [
    "Acknowledge the interest and open talks",
    "Reconnaître l'intérêt et ouvrir les négociations",
  ],
  "عائد بيع متوقع بعد فتح التفاوض على النجم": [
    "Expected sale proceeds after opening talks on the star",
    "Produit de vente attendu après l'ouverture de négociations sur la star",
  ],
  "السوق صار يعرف أن النادي يسمع العروض؛ العائد مرتبط بإتمام الصفقة": [
    "The market now knows the club is listening to offers; the return depends on completing a deal",
    "Le marché sait désormais que le club écoute les offres ; le retour dépend de la conclusion d'un accord",
  ],
  "طلب مقابلة حصرية مع إدارة النادي": [
    "A request for an exclusive interview with the club's board",
    "Une demande d'entretien exclusif avec la direction du club",
  ],
  "قناة تطلب مقابلة حصرية": [
    "A channel asks for an exclusive interview",
    "Une chaîne demande un entretien exclusif",
  ],
  "قناة كبيرة تعرض مبلغًا مقابل مقابلة حصرية مع الإدارة في توقيت حساس. الحصرية تفتح باب العائد والصورة، وقد تثير بقية المنصات": [
    "A major channel offers a sum for an exclusive interview with the board at a sensitive moment. Exclusivity opens the door to income and image, and it may upset the other outlets",
    "Une grande chaîne propose une somme pour un entretien exclusif avec la direction à un moment sensible. L'exclusivité ouvre la porte aux revenus et à l'image, et elle peut froisser les autres médias",
  ],
  "منح المقابلة مقابل عائد": [
    "Grant the interview for a return",
    "Accorder l'entretien contre un revenu",
  ],
  "عائد المقابلة الحصرية": [
    "Income from the exclusive interview",
    "Revenu de l'entretien exclusif",
  ],
  "العائد جُدول خلال شهر، وبقية الصحف اشتكت من الإقصاء": [
    "The income was scheduled within a month, and the other papers complained about being shut out",
    "Le revenu a été programmé dans le mois, et les autres journaux se sont plaints d'être écartés",
  ],
  "مؤتمر مفتوح لكل المنصات": [
    "An open press conference for every outlet",
    "Une conférence ouverte à tous les médias",
  ],
  "بلا عائد نقدي، لكن العلاقة مع كل المنصات بقيت متوازنة": [
    "No cash income, but relations with every outlet stayed balanced",
    "Aucun revenu en espèces, mais la relation avec tous les médias est restée équilibrée",
  ],
  "الاعتذار عن أي ظهور الآن": [
    "Decline any appearance for now",
    "Décliner toute apparition pour l'instant",
  ],
  "الصمت الكامل أراح الجهاز وأغضب الصحافة والمدرّج معًا": [
    "Total silence eased the staff and angered the press and the stands alike",
    "Le silence total a soulagé le staff et fâché à la fois la presse et la tribune",
  ],
  "أسبوع حسم اللقب في الجولات الأخيرة": [
    "The title-deciding week in the final rounds",
    "La semaine du sacre dans les dernières journées",
  ],
  "أسبوع حسم اللقب": [
    "The week the title is decided",
    "La semaine où le titre se joue",
  ],
  "النادي في الصدارة والجولات المتبقية قليلة. كل خيار هنا يبدل الاستعداد بالمال أو بالوعد: معسكر مغلق، روتين هادئ، أو مكافآت مرتبطة باللقب": [
    "The club is top of the table with few rounds left. Every option here trades preparation against money or a promise: a closed camp, a calm routine, or title-linked bonuses",
    "Le club est en tête et il reste peu de journées. Chaque option échange ici la préparation contre de l'argent ou une promesse : un stage à huis clos, une routine calme, ou des primes liées au titre",
  ],
  "معسكر مغلق حتى الحسم": [
    "A closed camp until it is decided",
    "Un stage à huis clos jusqu'au dénouement",
  ],
  "العزلة رفعت التركيز والجاهزية البدنية في أهم أسابيع الموسم": [
    "The isolation raised focus and physical readiness in the most important weeks of the season",
    "L'isolement a augmenté la concentration et la condition physique lors des semaines les plus importantes de la saison",
  ],
  "إبقاء الروتين وخفض الضجيج": [
    "Keep the routine and lower the noise",
    "Maintenir la routine et réduire le bruit",
  ],
  "بلا تغييرات ولا إنفاق؛ الاستقرار نفسه كان الرسالة": [
    "No changes and no spending; stability itself was the message",
    "Aucun changement et aucune dépense ; la stabilité elle-même était le message",
  ],
  "وعد بمكافآت لقب تُصرف عند الحسم": [
    "Promise title bonuses payable when it is decided",
    "Promettre des primes de titre payables au dénouement",
  ],
  "مكافآت اللقب المتفق عليها مع القائمة": [
    "Title bonuses agreed with the squad",
    "Primes de titre convenues avec l'effectif",
  ],
  "المكافآت التزام مؤجل لا تُدفع إلا في موعدها، وأثرها المعنوي فوري": [
    "The bonuses are a deferred commitment paid only on their date, and their morale effect is immediate",
    "Les primes sont un engagement différé payé seulement à leur échéance, et leur effet sur le moral est immédiat",
  ],
  "معركة الهبوط في الجولات الأخيرة": [
    "The relegation battle in the final rounds",
    "La bataille du maintien dans les dernières journées",
  ],
  "صراع البقاء في الجولات الأخيرة": [
    "The fight for survival in the final rounds",
    "La lutte pour le maintien dans les dernières journées",
  ],
  "النادي في مراكز الخطر وما تبقّى من الموسم قليل. الخيارات كلها مكلفة: مكافآت بقاء، إعادة ضبط تكتيكية، أو دفع الشباب في النار": [
    "The club sits in the danger places with little of the season left. Every option is costly: survival bonuses, a tactical reset, or throwing the youngsters into the fire",
    "Le club occupe les places dangereuses et il reste peu de saison. Toutes les options sont coûteuses : des primes de maintien, une remise à plat tactique, ou jeter les jeunes dans la bataille",
  ],
  "مكافآت بقاء تُصرف في نهاية الموسم": [
    "Survival bonuses paid at the end of the season",
    "Des primes de maintien versées en fin de saison",
  ],
  "مكافآت البقاء المتفق عليها مع القائمة": [
    "Survival bonuses agreed with the squad",
    "Primes de maintien convenues avec l'effectif",
  ],
  "الوعد بالمكافآت رفع المعنويات، والالتزام يُدفع في موعده فقط": [
    "The promise of bonuses lifted morale, and the commitment is paid only on its date",
    "La promesse de primes a remonté le moral, et l'engagement n'est payé qu'à son échéance",
  ],
  "إعادة ضبط تكتيكية عاجلة": [
    "An urgent tactical reset",
    "Une remise à plat tactique urgente",
  ],
  "الأسلوب الجديد احتاج حملًا بدنيًا إضافيًا؛ الأقل جاهزية دفع الثمن إصابة": [
    "The new approach needed extra physical load; the least fit player paid for it with an injury",
    "La nouvelle approche demandait une charge physique supplémentaire ; le joueur le moins en forme l'a payée d'une blessure",
  ],
  "الدفع بناشئَين في المباريات الحاسمة": [
    "Throw two youngsters into the decisive matches",
    "Lancer deux jeunes dans les matchs décisifs",
  ],
  "الناشئان دخلا القائمة في أصعب أسابيع الموسم؛ المخاطرة فنية وصورتهما صنعتها اللحظة": [
    "The two youngsters entered the squad in the hardest weeks of the season; the risk is technical and their image was made by the moment",
    "Les deux jeunes sont entrés dans le groupe lors des semaines les plus dures de la saison ; le risque est technique et leur image a été faite par le moment",
  ],
  "رد فعل النادي بعد الفوز في الديربي": [
    "The club's reaction after winning the derby",
    "La réaction du club après la victoire dans le derby",
  ],
  "ما بعد الفوز في الديربي": [
    "After the derby win",
    "Après la victoire dans le derby",
  ],
  "الفوز على الغريم التقليدي أشعل المدينة. أمامك استثمار اللحظة جماهيريًا، أو ضبط الخطاب، أو تحويلها إلى عائد تجاري": [
    "Beating the traditional rival has set the city alight. You can invest the moment with the fans, keep the message measured, or turn it into commercial income",
    "Battre le rival historique a enflammé la ville. Vous pouvez exploiter le moment avec les supporters, garder un discours mesuré, ou le transformer en revenu commercial",
  ],
  "احتفال مفتوح مع الجماهير": [
    "An open celebration with the fans",
    "Une célébration ouverte avec les supporters",
  ],
  "الاحتفال كلّف تنظيمًا وأمنًا، وحوّل الفوز إلى رصيد جماهيري": [
    "The celebration cost organisation and security, and it turned the win into credit with the fans",
    "La célébration a coûté en organisation et en sécurité, et elle a transformé la victoire en capital auprès des supporters",
  ],
  "خطاب هادئ والعودة للعمل": [
    "A calm message and back to work",
    "Un discours calme et retour au travail",
  ],
  "بلا إنفاق ولا استعراض؛ الرسالة أن الموسم لم ينته": [
    "No spending and no show; the message is that the season is not over",
    "Aucune dépense et aucune mise en scène ; le message est que la saison n'est pas finie",
  ],
  "استثمار تجاري في منتجات الفوز": [
    "Commercial investment in victory merchandise",
    "Investissement commercial dans les produits de la victoire",
  ],
  "عائد منتجات ومتاجر بعد فوز الديربي": [
    "Merchandise and store income after the derby win",
    "Revenus des produits et des boutiques après la victoire dans le derby",
  ],
  "المنتجات طُرحت خلال أيام؛ جزء من المدرّج قرأ الخطوة كتجارة في اللحظة": [
    "The products went on sale within days; part of the stand read the move as trading on the moment",
    "Les produits ont été mis en vente en quelques jours ; une partie de la tribune y a vu un commerce du moment",
  ],
  "رد فعل النادي بعد خسارة الديربي": [
    "The club's reaction after losing the derby",
    "La réaction du club après la défaite dans le derby",
  ],
  "ما بعد خسارة الديربي": [
    "After the derby defeat",
    "Après la défaite dans le derby",
  ],
  "الخسارة أمام الغريم التقليدي فتحت أسبوعًا من الغضب. الاعتذار العلني يمتص جزءًا منه، والصمت يعيد التركيز، واتهام التحكيم يشعل الساحة": [
    "Losing to the traditional rival has opened a week of anger. A public apology absorbs part of it, silence restores focus, and blaming the officials sets the arena alight",
    "Perdre contre le rival historique a ouvert une semaine de colère. Des excuses publiques en absorbent une partie, le silence ramène la concentration, et accuser l'arbitrage embrase la scène",
  ],
  "رسالة اعتذار للجماهير": [
    "A message of apology to the fans",
    "Un message d'excuses aux supporters",
  ],
  "الاعتذار العلني خفّف الغضب وذكّر اللاعبين بحجم الخسارة": [
    "The public apology eased the anger and reminded the players of the scale of the defeat",
    "Les excuses publiques ont apaisé la colère et rappelé aux joueurs l'ampleur de la défaite",
  ],
  "صمت كامل والعودة للتدريب": [
    "Total silence and back to training",
    "Un silence total et retour à l'entraînement",
  ],
  "بلا تصريحات ولا مؤتمرات؛ الرد تأجّل إلى الملعب": [
    "No statements and no conferences; the reply was postponed to the pitch",
    "Pas de déclarations ni de conférences ; la réponse a été reportée au terrain",
  ],
  "توجيه الغضب نحو التحكيم": [
    "Direct the anger towards the officiating",
    "Orienter la colère vers l'arbitrage",
  ],
  "الملف التحكيمي اشتعل وحمى اللاعبين يومًا واحدًا، وصورة النادي دفعت الثمن": [
    "The officiating file caught fire and shielded the players for one day, and the club's image paid the price",
    "Le dossier de l'arbitrage s'est enflammé et a protégé les joueurs une journée, et l'image du club en a payé le prix",
  ],

  // ── نكهة الدراما 0.25 (ديربي · إحصائيات الموسم · إصابات · جولات الحسم) (flavor-drama.js, 45 نصًا) ──
  "أجواء المدينة قبل الديربي": [
    "The city's mood before the derby",
    "L'atmosphère de la ville avant le derby",
  ],
  "المدينة تعيش أسبوع الديربي": [
    "The city is living derby week",
    "La ville vit la semaine du derby",
  ],
  "المقاهي والأزقة تتحدث عن اللقاء المرتقب مع الغريم، ورايات الناديين ظهرت في الشوارع قبل أيام من الصافرة": [
    "Cafés and alleys are talking about the awaited meeting with the rival, and both clubs' flags appeared in the streets days before kick-off",
    "Cafés et ruelles parlent de la rencontre attendue avec le rival, et les drapeaux des deux clubs sont apparus dans les rues des jours avant le coup d'envoi",
  ],
  "احتفال المدينة بعد الفوز في الديربي": [
    "The city celebrates after the derby win",
    "La ville fête la victoire dans le derby",
  ],
  "ليلتان من الاحتفال بعد الديربي": [
    "Two nights of celebration after the derby",
    "Deux nuits de fête après le derby",
  ],
  "الفوز على الغريم أبقى الشوارع ممتلئة حتى الفجر، وصفحات النادي تجاوزت أرقامها المعتادة في يوم واحد": [
    "Beating the rival kept the streets full until dawn, and the club's pages surpassed their usual numbers in a single day",
    "Battre le rival a gardé les rues pleines jusqu'à l'aube, et les pages du club ont dépassé leurs chiffres habituels en une journée",
  ],
  "صدمة المدرجات بعد خسارة الديربي": [
    "The stands are stunned after the derby defeat",
    "Les tribunes sous le choc après la défaite dans le derby",
  ],
  "خسارة الديربي تترك أثرها": [
    "The derby defeat leaves its mark",
    "La défaite dans le derby laisse des traces",
  ],
  "المدرج غادر في صمت، وصحيفة الغريم أفردت صفحاتها للسخرية؛ النادي فضّل عدم الرد": [
    "The stand left in silence, and the rival's paper devoted its pages to mockery; the club preferred not to reply",
    "La tribune est partie en silence, et le journal du rival a consacré ses pages à la moquerie ; le club a préféré ne pas répondre",
  ],
  "طوابير تذاكر مباراة القمة": [
    "Ticket queues for the summit match",
    "Files d'attente pour les billets du choc au sommet",
  ],
  "طوابير التذاكر قبل القمة": [
    "Ticket queues before the summit",
    "Les files pour les billets avant le sommet",
  ],
  "منافذ البيع شهدت طوابير من الليل، وخدمة الجمهور أعلنت نفاد حصتها الأولى خلال ساعتين": [
    "Outlets saw queues from the night, and the fan services announced its first allocation sold out within two hours",
    "Les points de vente ont connu des files dès la nuit, et le service supporters a annoncé que son premier quota était épuisé en deux heures",
  ],
  "تدريب رابط المشجعين على التيفو": [
    "The supporters' group rehearses the tifo",
    "Le groupe de supporters répète le tifo",
  ],
  "التيفو يُجرَّب ليلًا في المدرج": [
    "The tifo is trialled at night in the stand",
    "Le tifo est essayé la nuit dans la tribune",
  ],
  "رابط المشجعين جرّب اللوحة الضخمة في مدرج خالٍ قبل المباراة الكبيرة، وتمويلها ذاتي بالكامل": [
    "The supporters' group trialled the huge display in an empty stand before the big match, funded entirely from its own pocket",
    "Le groupe de supporters a essayé l'immense animation dans une tribune vide avant le grand match, financée entièrement sur ses propres fonds",
  ],
  "حسابات اللقب في الجولات الأخيرة": [
    "Title calculations in the final rounds",
    "Les calculs du titre dans les dernières journées",
  ],
  "الجماهير تحسب نقاط اللقب": [
    "The fans are counting the title points",
    "Les supporters comptent les points du titre",
  ],
  "الجماهير تتداول سيناريوهات الحسم: كم نقطة تكفي، ومتى يُحسم اللقب رياضيًا قبل الجولة الأخيرة": [
    "Supporters are trading scenarios for the decider: how many points are enough, and when the title is settled mathematically before the final round",
    "Les supporters échangent des scénarios pour le dénouement : combien de points suffisent, et quand le titre sera mathématiquement joué avant la dernière journée",
  ],
  "حسابات البقاء في مراكز الخطر": [
    "Survival calculations in the danger places",
    "Les calculs du maintien dans les places dangereuses",
  ],
  "حسابات البقاء على كل لسان": [
    "Survival maths on everyone's lips",
    "Les calculs du maintien sur toutes les lèvres",
  ],
  "الأنصار يحسبون فارق الأهداف والمواجهات المباشرة مع أندية القاع، وكل نقطة صارت تُقاس بموسم كامل": [
    "Supporters are working out goal difference and head-to-head records with the clubs at the bottom, and every point is now measured as a whole season",
    "Les supporters calculent la différence de buts et les confrontations directes avec les clubs du bas, et chaque point vaut désormais une saison entière",
  ],
  "هدّاف النادي في جدول الهدافين": [
    "The club's scorer in the goalscoring chart",
    "Le buteur du club dans le classement des buteurs",
  ],
  "هدّاف النادي يدخل جدول السباق": [
    "The club's scorer enters the race chart",
    "Le buteur du club entre dans la course",
  ],
  "أهدافه المسجلة هذا الموسم وضعته بين أسماء السباق على لقب الهدّاف، والصحافة المحلية تتابع رصيده جولة بعد جولة": [
    "His goals recorded this season have put him among the names in the race for the top scorer title, and the local press follows his tally round after round",
    "Ses buts enregistrés cette saison l'ont placé parmi les noms en lice pour le titre de meilleur buteur, et la presse locale suit son total journée après journée",
  ],
  "مقالات تضغط على الجهاز بعد سلسلة سيئة": [
    "Columns put pressure on the staff after a poor run",
    "Des chroniques mettent la pression sur le staff après une mauvaise série",
  ],
  "الصحافة تسأل عن مستقبل الجهاز": [
    "The press asks about the staff's future",
    "La presse s'interroge sur l'avenir du staff",
  ],
  "عمودان في صحيفتين مختلفتين تساءلا عن قدرة الجهاز على إيقاف النزيف، دون أن يذكرا أسماء بديلة": [
    "Two columns in different papers questioned the staff's ability to stop the bleeding, without naming replacements",
    "Deux chroniques dans des journaux différents ont mis en doute la capacité du staff à stopper l'hémorragie, sans citer de remplaçants",
  ],
  "لاعب في أعلى فورمة بحسب تقييمات الموسم": [
    "A player in top form according to the season ratings",
    "Un joueur en pleine forme selon les notes de la saison",
  ],
  "اسم «متوهج» في تقييمات الجولة": [
    "A name marked blazing in the round's ratings",
    "Un nom qualifié de flamboyant dans les notes de la journée",
  ],
  "تقييمات المباريات المتتالية رفعت اسم لاعب من النادي إلى خانة المتوهجين، والمحللون يربطون ذلك بتحسن أرقامه": [
    "Consecutive match ratings have lifted a club player into the blazing category, and analysts link it to his improving numbers",
    "Les notes de matchs consécutifs ont fait entrer un joueur du club dans la catégorie des flamboyants, et les analystes lient cela à l'amélioration de ses chiffres",
  ],
  "تراجع فورمة لاعب في تقييمات الموسم": [
    "A player's form dips in the season ratings",
    "La forme d'un joueur baisse dans les notes de la saison",
  ],
  "تقييمات باردة تلاحق اسمًا في القائمة": [
    "Cold ratings follow a name in the squad",
    "Des notes froides poursuivent un nom de l'effectif",
  ],
  "متوسط تقييمات أحد اللاعبين انخفض في الأسابيع الأخيرة، والصحافة تسأل إن كان الأمر إرهاقًا أم فقدان ثقة": [
    "One player's average rating has fallen in recent weeks, and the press asks whether it is fatigue or lost confidence",
    "La note moyenne d'un joueur a baissé ces dernières semaines, et la presse demande s'il s'agit de fatigue ou d'une confiance perdue",
  ],
  "جراحة بعد إصابة طويلة": [
    "Surgery after a long injury",
    "Une opération après une longue blessure",
  ],
  "برنامج تأهيل بعد غياب طويل": [
    "A rehabilitation programme after a long absence",
    "Un programme de rééducation après une longue absence",
  ],
  "الجهاز الطبي أعلن برنامج تأهيل يمتد لأكثر من شهر ونصف لحالة مسجّلة في القائمة، مع متابعة أسبوعية للحمل البدني": [
    "The medical staff announced a rehabilitation programme running more than six weeks for a case on the squad list, with weekly monitoring of the physical load",
    "Le staff médical a annoncé un programme de rééducation de plus de six semaines pour un cas inscrit dans l'effectif, avec un suivi hebdomadaire de la charge physique",
  ],
  "غرفة العلاج ممتلئة في الأسبوع نفسه": [
    "The treatment room is full in the same week",
    "La salle de soins est pleine la même semaine",
  ],
  "أربعة مصابين في الوقت نفسه": [
    "Four injured at the same time",
    "Quatre blessés en même temps",
  ],
  "غرفة العلاج تعمل بورديتين بعد تزامن أربع حالات، والجهاز الفني أعاد توزيع الحصص لتخفيف الحمل عن البقية": [
    "The treatment room is running two shifts after four cases coincided, and the coaching staff redistributed the sessions to lighten the load on the rest",
    "La salle de soins fonctionne en deux vacations après la coïncidence de quatre cas, et le staff technique a redistribué les séances pour alléger la charge des autres",
  ],
  "لاعب على بُعد بطاقة من الإيقاف": [
    "A player one card away from suspension",
    "Un joueur à une carte de la suspension",
  ],
  "ملف البطاقات يفتح قبل الجولة": [
    "The cards file opens before the round",
    "Le dossier des cartons s'ouvre avant la journée",
  ],
  "لاعب في القائمة بلغ رصيد البطاقات الذي يقرّبه من الإيقاف، والجهاز يدرس إراحته لتجنب غيابه عن مباراة أكبر": [
    "A squad player has reached the card tally that puts him close to suspension, and the staff is considering resting him to avoid missing a bigger match",
    "Un joueur de l'effectif a atteint le total de cartons qui le rapproche d'une suspension, et le staff envisage de le ménager pour éviter de manquer un match plus important",
  ],
  "دقائق محدودة للعائد من الإصابة": [
    "Limited minutes for the player returning from injury",
    "Des minutes limitées pour le joueur de retour de blessure",
  ],
  "خطة دقائق للعائد من الإصابة": [
    "A minutes plan for the returning player",
    "Un plan de minutes pour le joueur de retour",
  ],
  "العائد من الإصابة شارك في دقائق محدودة وفق خطة الجهاز الطبي، وخرج دون شكوى من الألم": [
    "The player returning from injury took part in limited minutes under the medical staff's plan, and came off without complaining of pain",
    "Le joueur de retour de blessure a pris part à des minutes limitées selon le plan du staff médical, et est sorti sans se plaindre de douleurs",
  ],
};
