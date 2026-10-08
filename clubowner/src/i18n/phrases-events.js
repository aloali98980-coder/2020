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

  // ── الملفات السوداء 0.28 — ترجمات مؤقتة لتغطية فحص الترجمة (جودة لاحقة) ──
  "\n    ?.setAttribute(\"content\", theme === \"light\" ? \"#f2f6fb\" : \"#0a1322\");\n}\nmatchMedia(\"(prefers-color-scheme: light)\").addEventListener?.(\"change\", () => {\n  try {\n    if ((localStorage.getItem(\"clubowner.theme\") || \"dark\") === \"system\")\n      document.documentElement.dataset.theme = resolveTheme(\"system\");\n  } catch {}\n});\nfunction render() {\n  const s = getState();\n  if (s) {\n    // تفضيلات العرض تُطبق قبل بناء الشاشات: نمط الأرقام وتقليل الحركة.\n    setDigitsMode(s.preferences?.digits === \"western\" ? \"western\" : \"arabic\");\n    document.body.classList.toggle(\n      \"reduce-motion\",\n      !!s.preferences?.reduceMotion,\n    );\n  }\n  if (!s) {\n    app.innerHTML = setupView(\n      ui.setupClub,\n      ui.owner,\n      ui.leagues,\n      ui.setupConfig,\n    );\n    app.firstElementChild?.classList.add(\"page-enter\");\n    lastRenderedRoute = \"setup\";\n    translateDOM(app);\n    document.title = \"Empire FC\";\n    return;\n  }\n  const views = {\n    dashboard: () => dashboardView(s),\n    inbox: () => inboxView(s, ui.inboxFilter, ui.message),\n    squad: () => playersView(s, false, ui.playerFilters),\n    transfers: () => playersView(s, true, ui.playerFilters),\n    facilities: () => facilitiesView(s),\n    sponsors: () => sponsorsView(s),\n    finance: () => financeView(s, ui.financeTab),\n    board: () => boardView(s),\n    world: () =>\n      s.expansion\n        ? competitionsView(s, ui.expandedDivision)\n        : worldView(s, ui.worldTab),\n    commerce: () => commerceView(s),\n    management: () => managementView(s),\n    press: () => pressView(s),\n    black: () => blackFilesView(s),\n    legends: () => legendsView(s, ui.legendFilters),\n    settings: () => settingsView(s),\n    database: () => databaseView(),\n    careers: () => careersView(s, ui.talentPlayer),\n  };\n  app.innerHTML = shell(s, ui.route, (views[ui.route] || views.dashboard)());\n  if (ui.route !== lastRenderedRoute)\n    app.querySelector(\"#main-content\")?.classList.add(\"page-enter\");\n  lastRenderedRoute = ui.route;\n  translateDOM(app);\n  document.title =\n    (NAV.find((n) => n.id === ui.route)?.name || \"Empire FC\") + \" | Empire FC\";\n  document.title = translateText(document.title);\n}\nfunction navigate(route) {\n  closeModal();\n  closePalette();\n  ui.route = route;\n  if ([\"squad\", \"transfers\"].includes(route))\n    ui.playerFilters = { search: \"\", pos: \"all\", league: \"all\" };\n  render();\n  window.scrollTo({ top: 0, behavior: \"instant\" });\n}\n// البحث السريع: طبقة مستقلة فوق التطبيق، تُحدَّث وحدها دون إعادة رندر الشاشة الحالية.\nfunction renderPalette() {\n  const root = document.getElementById(\"palette-root\");\n  if (!root) return;\n  const s = getState();\n  if (!ui.palette.open || !s) {\n    root.innerHTML = \"\";\n    return;\n  }\n  root.innerHTML = paletteOverlay(s, ui.palette);\n  const input = root.querySelector(\"#palette-input\");\n  input?.focus();\n  if (input) input.setSelectionRange(input.value.length, input.value.length);\n}\nfunction openPalette() {\n  if (!getState()) return;\n  ui.palette = { open: true, q: \"\", sel: 0, items: paletteItems(getState(), \"\") };\n  renderPalette();\n}\nfunction closePalette() {\n  if (!ui.palette.open) return;\n  ui.palette.open = false;\n  renderPalette();\n}\nfunction paletteQuery(q) {\n  ui.palette.q = q;\n  ui.palette.sel = 0;\n  ui.palette.items = paletteItems(getState(), q);\n  renderPalette();\n}\nfunction paletteMove(d) {\n  const n = ui.palette.items.length;\n  if (!n) return;\n  ui.palette.sel = (ui.palette.sel + d + n) % n;\n  renderPalette();\n  document\n    .querySelector(\".palette-item.sel\")\n    ?.scrollIntoView({ block: \"nearest\" });\n}\nfunction paletteActivate(i) {\n  const item = ui.palette.items[i];\n  if (!item) return;\n  closePalette();\n  if (item.type === \"screen\") navigate(item.id);\n  else showPlayer(item.id);\n}\nasync function apply(operation, text) {\n  document.body.classList.add(\"saving-game\");\n  const indicator = document.querySelector(\".save-indicator\");\n  if (indicator)\n    indicator.textContent = tr(\"جارٍ الحفظ…\", \"Saving…\", \"Enregistrement…\");\n  let r;\n  try {\n    r = await commit(operation);\n  } catch (e) {\n    render();\n    throw e;\n  } finally {\n    document.body.classList.remove(\"saving-game\");\n  }\n  render();\n  if (text) toast(text);\n  return r;\n}\nasync function runTime(resume = false) {\n  const days = resume\n    ? null\n    : Number(document.getElementById(\"advance-days\")?.value || 7);\n  const stateBefore = getState(),\n    playedBefore = new Set(\n      stateBefore ? playedOwnFixtures(stateBefore).map((f) => f.id) : [],\n    );\n  const r = await apply((s) => {\n    const result = advanceTime(s, days);\n    if (result.advanced) markStep(s, \"week\");\n    return result;\n  });\n  // 0.24: شاشة لقطات الماتش أولاً، ثم تقرير الماتش الكامل.\n  const s = getState();\n  if (s && s.preferences?.autoMatchReport !== false) {\n    const fresh = playedOwnFixtures(s).filter((f) => !playedBefore.has(f.id));\n    if (fresh.length) {\n      const r = reportFor(s, fresh[fresh.length - 1]);\n      showHighlightsScreen(s, r, () => {\n        openModal(matchReportModal(s, r));\n      });\n    }\n  }\n  if (r.blocked) {\n    ui.route = \"inbox\";\n    ui.inboxFilter = \"required\";\n    ui.message = pendingActions(getState())[0]?.id;\n    render();\n    toast(\n      r.advanced\n        ? `تقدمنا ${num(r.advanced)} أيام. الوقت متوقف لقرارك.`\n        : \"فيه قرار مهم محتاج ردك قبل تمرير الوقت.\",\n    );\n  } else\n    toast(\n      r.match\n        ? \"توقفت المحاكاة بعد المباراة. النتيجة في بريدك.\"\n        : `تم تمرير ${num(r.advanced)} ${r.advanced === 1 ? \"يوم\" : \"أيام\"} وحفظ اللعبة.`,\n    );\n}\nfunction showPlayer(id) {\n  const s = getState(),\n    p = findPerson(s, id);\n  if (p) openModal(playerDetail(s, p));\n}\nfunction showContract(ref, renew = false) {\n  openModal(contractForm(getState(), ref, renew));\n  updateCalculations();\n}\nfunction showOffers(id) {\n  openModal(sponsorOffers(getState(), id), true);\n}\nfunction chooseImport() {\n  const input = document.createElement(\"input\");\n  input.type = \"file\";\n  input.accept = \".json,.gz,application/json,application/gzip\";\n  input.onchange = async () => {\n    if (!input.files?.[0]) return;\n    try {\n      pendingImport = await importGame(input.files[0]);\n      openModal(\n        `<span class=\"eyebrow\">نسخة احتياطية سليمة</span><h2>استيراد الحفظة؟</h2><p class=\"muted\">التاريخ ${esc(pendingImport.date)}. سيتم استبدال الحفظة النشطة على هذا المتصفح. صدّر الحالية أولًا لو محتاجها.</p><div class=\"modal-actions\">${button(\"استيراد والمتابعة\", \"confirm-import\", \"\", \"primary\")}${getState() ? button(\"تصدير الحالية أولًا\", \"export-save\", \"\", \"secondary\") : \"\"}</div>`,\n      );\n    } catch (e) {\n      toast(\"تعذر الاستيراد: \" + e.message, true);\n    }\n  };\n  input.click();\n}\nfunction updateCalculations() {\n  const s = getState(),\n    offer = document.querySelector(\"#offer-form\"),\n    contract = document.querySelector(\"#contract-form\");\n  if (offer) {\n    const fee = Number(offer.elements.fee.value),\n      percent = Number(offer.elements.upfront.value);\n    document.getElementById(\"offer-summary\").innerHTML =\n      `<div><span>المقدم عند التوقيع</span><strong>${money(Math.round((fee * percent) / 100))} ${cur()}</strong></div><div><span>باقي قيمة الانتقال</span><strong>${money(fee - Math.round((fee * percent) / 100))} ${cur()}</strong></div><small>لم يتم الخصم. لا يشمل المبلغ عقد اللاعب أو الوكيل.</small>`;\n  }\n  if (contract) {\n    const salary = Number(contract.elements.salary.value),\n      bonus = Number(contract.elements.bonus.value),\n      years = Number(contract.elements.years.value),\n      renew = contract.dataset.renew === \"true\";\n    const n = renew\n      ? null\n      : s.negotiations.find((n) => n.id === contract.dataset.ref);\n    const upfront = n ? Math.round((n.fee * n.upfrontPercent) / 100) : 0,\n      agent = n ? Math.round(n.fee * 0.03) : 0,\n      now = upfront + agent + bonus,\n      total =\n        (n?.fee || 0) +\n        agent +\n        bonus +\n        guaranteedWages(\n          salary,\n          years,\n          Number(contract.elements.annualRaisePct.value),\n        );\n    document.getElementById(\"contract-summary\").innerHTML =\n      `<div><span>المطلوب من الخزينة الآن</span><strong class=\"${now > s.finance.cash ? \"red\" : \"green\"}\">${money(now)} ${cur()}</strong></div><div><span>إجمالي الالتزام خلال العقد</span><strong>${money(total)} ${cur()}</strong></div>${n ? `<div><span>عمولة الوكيل (٣٪)</span><b>${money(agent)} ${cur()}</b></div>` : \"\"}<small>يشمل ${renew ? \"العقد الجديد والمكافأة\" : \"رسوم الانتقال والمرتب والمكافأة والوكيل\"}. الرصيد المتاح ${money(s.finance.cash)} ${cur()}.</small>`;\n  }\n  if (offer) translateDOM(document.getElementById(\"offer-summary\"));\n  if (contract) {\n    const summary = document.getElementById(\"contract-summary\");\n    summary.innerHTML += `<small>${tr(\"التكلفة المضمونة تشمل الزيادة السنوية ولا تشمل مكافآت المشاركات والأهداف المتغيرة. وعد الأساسي: المشاركة في ٦٠٪ من المباريات خلال أول ٦٠ يومًا؛ المخالفة تخفض المعنويات ١٢ نقطة. الشرط الجزائي يسمح لك بدفعه عند شراء لاعب من السوق؛ بيع لاعبيك للمنافسين غير متاح بعد.\", \"Guaranteed cost includes annual raises but excludes variable appearance and goal bonuses. Regular role: appear in 60% of matches during the first 60 days or lose 12 morale. A market player’s release clause can be activated when buying; AI purchases of your players are not yet enabled.\", \"Le coût garanti inclut les hausses annuelles, pas les primes variables. Titulaire : participer à 60 % des matchs des 60 premiers jours, sinon perte de 12 points de moral. La clause d’un joueur du marché peut être activée à l’achat ; ventes à l’IA non disponibles.\")}</small>`;\n    translateDOM(summary);\n  }\n}\nfunction authModalContent(activeTab = \"login\", error = \"\") {\n  return `<span class=\"eyebrow\">حساب المالك والمزامنة</span>\n  <h2>${activeTab === \"login\" ? \"تسجيل الدخول\" : \"إنشاء حساب جديد\"}</h2>\n  ${error ? `<div class=\"info-note\" style=\"border-inline-start-color: var(--red); margin-bottom: 15px;\"><span>${esc(error)}</span></div>` : \"\"}\n  <div class=\"auth-tabs\">\n    <button type=\"button\" class=\"auth-tab ${activeTab === \"login\" ? \"active\" : \"\"}\" data-action=\"auth-tab-login\">تسجيل الدخول</button>\n    <button type=\"button\" class=\"auth-tab ${activeTab === \"register\" ? \"active\" : \"\"}\" data-action=\"auth-tab-register\">إنشاء حساب جديد</button>\n  </div>\n  ${activeTab === \"login\" ? `\n    <form id=\"auth-login-form\">\n      <div class=\"form-grid\">\n        <label class=\"field\">\n          <span>البريد الإلكتروني أو اسم المستخدم</span>\n          <input type=\"text\" name=\"identifier\" required autocomplete=\"username\" placeholder=\"name@example.com\">\n        </label>\n        <label class=\"field\">\n          <span>كلمة المرور</span>\n          <input type=\"password\" name=\"password\" required autocomplete=\"current-password\" placeholder=\"••••••••\">\n        </label>\n      </div>\n      <div class=\"modal-actions\">\n        <button type=\"submit\" class=\"btn primary\">تسجيل الدخول</button>\n        ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")}\n      </div>\n    </form>\n  ` : `\n    <form id=\"auth-register-form\">\n      <div class=\"form-grid\">\n        <label class=\"field\">\n          <span>البريد الإلكتروني</span>\n          <input type=\"email\" name=\"email\" required autocomplete=\"email\" placeholder=\"name@example.com\">\n        </label>\n        <label class=\"field\">\n          <span>اسم المستخدم (اسم المالك)</span>\n          <input type=\"text\" name=\"username\" required autocomplete=\"nickname\" placeholder=\"الاسم الذي يظهر في حسابك\">\n        </label>\n        <label class=\"field\">\n          <span>كلمة المرور (٦ أحرف على الأقل)</span>\n          <input type=\"password\" name=\"password\" minlength=\"6\" required autocomplete=\"new-password\" placeholder=\"••••••••\">\n        </label>\n      </div>\n      <div class=\"modal-actions\">\n        <button type=\"submit\" class=\"btn primary\">إنشاء الحساب والمتابعة</button>\n        ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")}\n      </div>\n    </form>\n  `}`;\n}\n\nconst actions = {\n  // خزنة المالك السرية: مفاتيحها أرقام الإصدار (أسفل القائمة الجانبية + سطر EMPIRE FC في شيت «المزيد» + شارة «عن اللعبة»).\n  \"secret-vault\": () =>\n    openModal(\n      `<h2>${tr(\"خزنة المالك السرية 🤫\", \"The owner": [
    "Black files 1",
    "Dossiers noirs 1",
  ],
  "\n  )\n    return null;\n  const open = availableDecisions(s);\n  if (!open.length) return null; // لا حدث ممكن اليوم: البوابات كلها مغلقة\n  // التنويع: آخر ٨ أحداث في السجل + الحدث الأخير لا تعود، إلا إذا كان ذلك هو المتاح كله.\n  const recent = new Set(s.clubDecisions.slice(-8).map((e) => e.type));\n  recent.add(s.lastClubEvent);\n  const fresh = open.filter((e) => !recent.has(e.id));\n  const pool = fresh.length ? fresh : open.filter((e) => e.id !== s.lastClubEvent);\n  if (!pool.length) return null;\n  const data = pick(s, pool);\n  const ev = {\n    id: uid(s,": [
    "Black files 2",
    "Dossiers noirs 2",
  ],
  " +\n    ` سعة المسيرة الطويلة 0.20: نُقل ${retiring.length} معتزلًا إلى أرشيف مضغوط، وخفّ حجم سجل كل لاعب؛ النتائج والعقود والمالية محفوظة كما هي` +\n    (dropped ? `، وأُزيل ${dropped} مرشحًا مهنيًا قديمًا من خارج ناديك.` :": [
    "Black files 3",
    "Dossiers noirs 3",
  ],
  " return 0; // مرة في الشهر\n  const ownPlayers = s.players.filter((p) => p.clubId === s.clubId && p.status !==": [
    "Black files 4",
    "Dossiers noirs 4",
  ],
  " return true;\n  if (SPANISH_CLUBS.has(player.clubId)) return true;\n  if (SPANISH_CLUBS.has(player.clubName)) return true;\n  // في الحفظة الموسعة، نفحص هل النادي في مجموعة إسبانية؟\n  if (s?.expansion) {\n    const esDivisions = s.expansion.divisions?.filter((d) => d.country ===": [
    "Black files 5",
    "Dossiers noirs 5",
  ],
  " {\n      // نطاق بسيط حسب التقييم للحفظات المهاجرة — التفاصيل في releaseClause.js\n      const rating = p.rating || 60;\n      let min = 2000000, max = 5000000;\n      if (rating >= 70 && rating <= 74) { min = 5000000; max = 12000000; }\n      else if (rating >= 75 && rating <= 79) { min = 12000000; max = 30000000; }\n      else if (rating >= 80 && rating <= 84) { min = 30000000; max = 80000000; }\n      else if (rating >= 85) { min = 80000000; max = 150000000; }\n      // 25% بلا شرط\n      const rnd = Math.random();\n      p.contractTerms.releaseClause = rnd < 0.25 ? 0 : Math.round(min + (max - min) * ((rnd - 0.25) / 0.75));\n    }\n  }\n  s.migrationNote =\n    (s.migrationNote ||": [
    "Black files 6",
    "Dossiers noirs 6",
  ],
  " {\n      // نُسجل اجتماع فشل ثقة\n      b.meetings.push({\n        id: uid(s,": [
    "Black files 7",
    "Dossiers noirs 7",
  ],
  " {\n      const rnd = random(s);\n      p.contractTerms.releaseClause = calculateReleaseClause(p, s.date, rnd, s);\n    }\n  }\n}\n\n// كسر الشرط الجزائي: دفع دفعة واحدة ثم التفاوض مع اللاعب مباشرة\nexport function canBreakReleaseClause(s, player) {\n  if (!player) return false;\n  if (player.clubId === s.clubId) return false;\n  if (player.status ===": [
    "Black files 8",
    "Dossiers noirs 8",
  ],
  " {\n    // نحدد مباراة قادمة ضد خصم\n    const fixtures = s.fixtures?.filter((f) => !f.played && (f.home === s.clubId || f.away === s.clubId)) || [];\n    const next = fixtures.sort((a, b) => a.date.localeCompare(b.date))[0];\n    if (next) {\n      const oppId = next.home === s.clubId ? next.away : next.home;\n      bf.active.bribedOpponent = {\n        fixtureId: next.id,\n        opponent: oppId,\n        until: addDays(next.date, 1),\n        date: s.date,\n      };\n      message(s, {\n        title: blackTextAr": [
    "Black files 9",
    "Dossiers noirs 9",
  ],
  "&&\n      daysBetween(m.date, s.date) <= FLAVOR_REPEAT_WINDOW,\n  );\n\nfunction pick(s, pool) {\n  return pool[Math.floor(random(s) * pool.length)];\n}\n\n// ── قرارات الإدارة ─────────────────────────────────────────────────────────\nexport function clubEventDay(s) {\n  if (\n    s.date < s.nextClubEventDate ||\n    s.clubDecisions.some((e) => e.status ===": [
    "Black files 10",
    "Dossiers noirs 10",
  ],
  "&& daysBetween(m.date, s.date) <= FLAVOR_REPEAT_WINDOW, ); function pick(s, pool) { return pool[Math.floor(random(s) * pool.length)]; } // ── قرارات الإدارة ───────────────────────────────────────────────────────── export function clubEventDay(s) { if ( s.date < s.nextClubEventDate || s.clubDecisions.some((e) => e.status ===": [
    "Black files 11",
    "Dossiers noirs 11",
  ],
  ")\n    ?.setAttribute(\"content\", theme === \"light\" ? \"#f2f6fb\" : \"#0a1322\");\n}\nmatchMedia(\"(prefers-color-scheme: light)\").addEventListener?.(\"change\", () => {\n  try {\n    if ((localStorage.getItem(\"clubowner.theme\") || \"dark\") === \"system\")\n      document.documentElement.dataset.theme = resolveTheme(\"system\");\n  } catch {}\n});\nfunction render() {\n  const s = getState();\n  if (s) {\n    // تفضيلات العرض تُطبق قبل بناء الشاشات: نمط الأرقام وتقليل الحركة.\n    setDigitsMode(s.preferences?.digits === \"western\" ? \"western\" : \"arabic\");\n    document.body.classList.toggle(\n      \"reduce-motion\",\n      !!s.preferences?.reduceMotion,\n    );\n  }\n  if (!s) {\n    app.innerHTML = setupView(\n      ui.setupClub,\n      ui.owner,\n      ui.leagues,\n      ui.setupConfig,\n    );\n    app.firstElementChild?.classList.add(\"page-enter\");\n    lastRenderedRoute = \"setup\";\n    translateDOM(app);\n    document.title = \"Empire FC\";\n    return;\n  }\n  const views = {\n    dashboard: () => dashboardView(s),\n    inbox: () => inboxView(s, ui.inboxFilter, ui.message),\n    squad: () => playersView(s, false, ui.playerFilters),\n    transfers: () => playersView(s, true, ui.playerFilters),\n    facilities: () => facilitiesView(s),\n    sponsors: () => sponsorsView(s),\n    finance: () => financeView(s, ui.financeTab),\n    board: () => boardView(s),\n    world: () =>\n      s.expansion\n        ? competitionsView(s, ui.expandedDivision)\n        : worldView(s, ui.worldTab),\n    commerce: () => commerceView(s),\n    management: () => managementView(s),\n    press: () => pressView(s),\n    black: () => blackFilesView(s),\n    legends: () => legendsView(s, ui.legendFilters),\n    settings: () => settingsView(s),\n    database: () => databaseView(),\n    careers: () => careersView(s, ui.talentPlayer),\n  };\n  app.innerHTML = shell(s, ui.route, (views[ui.route] || views.dashboard)());\n  if (ui.route !== lastRenderedRoute)\n    app.querySelector(\"#main-content\")?.classList.add(\"page-enter\");\n  lastRenderedRoute = ui.route;\n  translateDOM(app);\n  document.title =\n    (NAV.find((n) => n.id === ui.route)?.name || \"Empire FC\") + \" | Empire FC\";\n  document.title = translateText(document.title);\n}\nfunction navigate(route) {\n  closeModal();\n  closePalette();\n  ui.route = route;\n  if ([\"squad\", \"transfers\"].includes(route))\n    ui.playerFilters = { search: \"\", pos: \"all\", league: \"all\" };\n  render();\n  window.scrollTo({ top: 0, behavior: \"instant\" });\n}\n// البحث السريع: طبقة مستقلة فوق التطبيق، تُحدَّث وحدها دون إعادة رندر الشاشة الحالية.\nfunction renderPalette() {\n  const root = document.getElementById(\"palette-root\");\n  if (!root) return;\n  const s = getState();\n  if (!ui.palette.open || !s) {\n    root.innerHTML = \"\";\n    return;\n  }\n  root.innerHTML = paletteOverlay(s, ui.palette);\n  const input = root.querySelector(\"#palette-input\");\n  input?.focus();\n  if (input) input.setSelectionRange(input.value.length, input.value.length);\n}\nfunction openPalette() {\n  if (!getState()) return;\n  ui.palette = { open: true, q: \"\", sel: 0, items: paletteItems(getState(), \"\") };\n  renderPalette();\n}\nfunction closePalette() {\n  if (!ui.palette.open) return;\n  ui.palette.open = false;\n  renderPalette();\n}\nfunction paletteQuery(q) {\n  ui.palette.q = q;\n  ui.palette.sel = 0;\n  ui.palette.items = paletteItems(getState(), q);\n  renderPalette();\n}\nfunction paletteMove(d) {\n  const n = ui.palette.items.length;\n  if (!n) return;\n  ui.palette.sel = (ui.palette.sel + d + n) % n;\n  renderPalette();\n  document\n    .querySelector(\".palette-item.sel\")\n    ?.scrollIntoView({ block: \"nearest\" });\n}\nfunction paletteActivate(i) {\n  const item = ui.palette.items[i];\n  if (!item) return;\n  closePalette();\n  if (item.type === \"screen\") navigate(item.id);\n  else showPlayer(item.id);\n}\nasync function apply(operation, text) {\n  document.body.classList.add(\"saving-game\");\n  const indicator = document.querySelector(\".save-indicator\");\n  if (indicator)\n    indicator.textContent = tr(\"جارٍ الحفظ…\", \"Saving…\", \"Enregistrement…\");\n  let r;\n  try {\n    r = await commit(operation);\n  } catch (e) {\n    render();\n    throw e;\n  } finally {\n    document.body.classList.remove(\"saving-game\");\n  }\n  render();\n  if (text) toast(text);\n  return r;\n}\nasync function runTime(resume = false) {\n  const days = resume\n    ? null\n    : Number(document.getElementById(\"advance-days\")?.value || 7);\n  const stateBefore = getState(),\n    playedBefore = new Set(\n      stateBefore ? playedOwnFixtures(stateBefore).map((f) => f.id) : [],\n    );\n  const r = await apply((s) => {\n    const result = advanceTime(s, days);\n    if (result.advanced) markStep(s, \"week\");\n    return result;\n  });\n  // 0.24: شاشة لقطات الماتش أولاً، ثم تقرير الماتش الكامل.\n  const s = getState();\n  if (s && s.preferences?.autoMatchReport !== false) {\n    const fresh = playedOwnFixtures(s).filter((f) => !playedBefore.has(f.id));\n    if (fresh.length) {\n      const r = reportFor(s, fresh[fresh.length - 1]);\n      showHighlightsScreen(s, r, () => {\n        openModal(matchReportModal(s, r));\n      });\n    }\n  }\n  if (r.blocked) {\n    ui.route = \"inbox\";\n    ui.inboxFilter = \"required\";\n    ui.message = pendingActions(getState())[0]?.id;\n    render();\n    toast(\n      r.advanced\n        ? `تقدمنا ${num(r.advanced)} أيام. الوقت متوقف لقرارك.`\n        : \"فيه قرار مهم محتاج ردك قبل تمرير الوقت.\",\n    );\n  } else\n    toast(\n      r.match\n        ? \"توقفت المحاكاة بعد المباراة. النتيجة في بريدك.\"\n        : `تم تمرير ${num(r.advanced)} ${r.advanced === 1 ? \"يوم\" : \"أيام\"} وحفظ اللعبة.`,\n    );\n}\nfunction showPlayer(id) {\n  const s = getState(),\n    p = findPerson(s, id);\n  if (p) openModal(playerDetail(s, p));\n}\nfunction showContract(ref, renew = false) {\n  openModal(contractForm(getState(), ref, renew));\n  updateCalculations();\n}\nfunction showOffers(id) {\n  openModal(sponsorOffers(getState(), id), true);\n}\nfunction chooseImport() {\n  const input = document.createElement(\"input\");\n  input.type = \"file\";\n  input.accept = \".json,.gz,application/json,application/gzip\";\n  input.onchange = async () => {\n    if (!input.files?.[0]) return;\n    try {\n      pendingImport = await importGame(input.files[0]);\n      openModal(\n        `<span class=\"eyebrow\">نسخة احتياطية سليمة</span><h2>استيراد الحفظة؟</h2><p class=\"muted\">التاريخ ${esc(pendingImport.date)}. سيتم استبدال الحفظة النشطة على هذا المتصفح. صدّر الحالية أولًا لو محتاجها.</p><div class=\"modal-actions\">${button(\"استيراد والمتابعة\", \"confirm-import\", \"\", \"primary\")}${getState() ? button(\"تصدير الحالية أولًا\", \"export-save\", \"\", \"secondary\") : \"\"}</div>`,\n      );\n    } catch (e) {\n      toast(\"تعذر الاستيراد: \" + e.message, true);\n    }\n  };\n  input.click();\n}\nfunction updateCalculations() {\n  const s = getState(),\n    offer = document.querySelector(\"#offer-form\"),\n    contract = document.querySelector(\"#contract-form\");\n  if (offer) {\n    const fee = Number(offer.elements.fee.value),\n      percent = Number(offer.elements.upfront.value);\n    document.getElementById(\"offer-summary\").innerHTML =\n      `<div><span>المقدم عند التوقيع</span><strong>${money(Math.round((fee * percent) / 100))} ${cur()}</strong></div><div><span>باقي قيمة الانتقال</span><strong>${money(fee - Math.round((fee * percent) / 100))} ${cur()}</strong></div><small>لم يتم الخصم. لا يشمل المبلغ عقد اللاعب أو الوكيل.</small>`;\n  }\n  if (contract) {\n    const salary = Number(contract.elements.salary.value),\n      bonus = Number(contract.elements.bonus.value),\n      years = Number(contract.elements.years.value),\n      renew = contract.dataset.renew === \"true\";\n    const n = renew\n      ? null\n      : s.negotiations.find((n) => n.id === contract.dataset.ref);\n    const upfront = n ? Math.round((n.fee * n.upfrontPercent) / 100) : 0,\n      agent = n ? Math.round(n.fee * 0.03) : 0,\n      now = upfront + agent + bonus,\n      total =\n        (n?.fee || 0) +\n        agent +\n        bonus +\n        guaranteedWages(\n          salary,\n          years,\n          Number(contract.elements.annualRaisePct.value),\n        );\n    document.getElementById(\"contract-summary\").innerHTML =\n      `<div><span>المطلوب من الخزينة الآن</span><strong class=\"${now > s.finance.cash ? \"red\" : \"green\"}\">${money(now)} ${cur()}</strong></div><div><span>إجمالي الالتزام خلال العقد</span><strong>${money(total)} ${cur()}</strong></div>${n ? `<div><span>عمولة الوكيل (٣٪)</span><b>${money(agent)} ${cur()}</b></div>` : \"\"}<small>يشمل ${renew ? \"العقد الجديد والمكافأة\" : \"رسوم الانتقال والمرتب والمكافأة والوكيل\"}. الرصيد المتاح ${money(s.finance.cash)} ${cur()}.</small>`;\n  }\n  if (offer) translateDOM(document.getElementById(\"offer-summary\"));\n  if (contract) {\n    const summary = document.getElementById(\"contract-summary\");\n    summary.innerHTML += `<small>${tr(\"التكلفة المضمونة تشمل الزيادة السنوية ولا تشمل مكافآت المشاركات والأهداف المتغيرة. وعد الأساسي: المشاركة في ٦٠٪ من المباريات خلال أول ٦٠ يومًا؛ المخالفة تخفض المعنويات ١٢ نقطة. الشرط الجزائي يسمح لك بدفعه عند شراء لاعب من السوق؛ بيع لاعبيك للمنافسين غير متاح بعد.\", \"Guaranteed cost includes annual raises but excludes variable appearance and goal bonuses. Regular role: appear in 60% of matches during the first 60 days or lose 12 morale. A market player’s release clause can be activated when buying; AI purchases of your players are not yet enabled.\", \"Le coût garanti inclut les hausses annuelles, pas les primes variables. Titulaire : participer à 60 % des matchs des 60 premiers jours, sinon perte de 12 points de moral. La clause d’un joueur du marché peut être activée à l’achat ; ventes à l’IA non disponibles.\")}</small>`;\n    translateDOM(summary);\n  }\n}\nfunction authModalContent(activeTab = \"login\", error = \"\") {\n  return `<span class=\"eyebrow\">حساب المالك والمزامنة</span>\n  <h2>${activeTab === \"login\" ? \"تسجيل الدخول\" : \"إنشاء حساب جديد\"}</h2>\n  ${error ? `<div class=\"info-note\" style=\"border-inline-start-color: var(--red); margin-bottom: 15px;\"><span>${esc(error)}</span></div>` : \"\"}\n  <div class=\"auth-tabs\">\n    <button type=\"button\" class=\"auth-tab ${activeTab === \"login\" ? \"active\" : \"\"}\" data-action=\"auth-tab-login\">تسجيل الدخول</button>\n    <button type=\"button\" class=\"auth-tab ${activeTab === \"register\" ? \"active\" : \"\"}\" data-action=\"auth-tab-register\">إنشاء حساب جديد</button>\n  </div>\n  ${activeTab === \"login\" ? `\n    <form id=\"auth-login-form\">\n      <div class=\"form-grid\">\n        <label class=\"field\">\n          <span>البريد الإلكتروني أو اسم المستخدم</span>\n          <input type=\"text\" name=\"identifier\" required autocomplete=\"username\" placeholder=\"name@example.com\">\n        </label>\n        <label class=\"field\">\n          <span>كلمة المرور</span>\n          <input type=\"password\" name=\"password\" required autocomplete=\"current-password\" placeholder=\"••••••••\">\n        </label>\n      </div>\n      <div class=\"modal-actions\">\n        <button type=\"submit\" class=\"btn primary\">تسجيل الدخول</button>\n        ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")}\n      </div>\n    </form>\n  ` : `\n    <form id=\"auth-register-form\">\n      <div class=\"form-grid\">\n        <label class=\"field\">\n          <span>البريد الإلكتروني</span>\n          <input type=\"email\" name=\"email\" required autocomplete=\"email\" placeholder=\"name@example.com\">\n        </label>\n        <label class=\"field\">\n          <span>اسم المستخدم (اسم المالك)</span>\n          <input type=\"text\" name=\"username\" required autocomplete=\"nickname\" placeholder=\"الاسم الذي يظهر في حسابك\">\n        </label>\n        <label class=\"field\">\n          <span>كلمة المرور (٦ أحرف على الأقل)</span>\n          <input type=\"password\" name=\"password\" minlength=\"6\" required autocomplete=\"new-password\" placeholder=\"••••••••\">\n        </label>\n      </div>\n      <div class=\"modal-actions\">\n        <button type=\"submit\" class=\"btn primary\">إنشاء الحساب والمتابعة</button>\n        ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")}\n      </div>\n    </form>\n  `}`;\n}\n\nconst actions = {\n  // خزنة المالك السرية: مفاتيحها أرقام الإصدار (أسفل القائمة الجانبية + سطر EMPIRE FC في شيت «المزيد» + شارة «عن اللعبة»).\n  \"secret-vault\": () =>\n    openModal(\n      `<h2>${tr(\"خزنة المالك السرية 🤫\", \"The owner": [
    "Black files 12",
    "Dossiers noirs 12",
  ],
  ")\n  )\n    return null;\n  const open = availableDecisions(s);\n  if (!open.length) return null; // لا حدث ممكن اليوم: البوابات كلها مغلقة\n  // التنويع: آخر ٨ أحداث في السجل + الحدث الأخير لا تعود، إلا إذا كان ذلك هو المتاح كله.\n  const recent = new Set(s.clubDecisions.slice(-8).map((e) => e.type));\n  recent.add(s.lastClubEvent);\n  const fresh = open.filter((e) => !recent.has(e.id));\n  const pool = fresh.length ? fresh : open.filter((e) => e.id !== s.lastClubEvent);\n  if (!pool.length) return null;\n  const data = pick(s, pool);\n  const ev = {\n    id: uid(s": [
    "Black files 13",
    "Dossiers noirs 13",
  ],
  ")\n  )\n    return null;\n  const open = availableDecisions(s);\n  if (!open.length) return null; // لا حدث ممكن اليوم: البوابات كلها مغلقة\n  // التنويع: آخر ٨ أحداث في السجل + الحدث الأخير لا تعود، إلا إذا كان ذلك هو المتاح كله.\n  const recent = new Set(s.clubDecisions.slice(-8).map((e) => e.type));\n  recent.add(s.lastClubEvent);\n  const fresh = open.filter((e) => !recent.has(e.id));\n  const pool = fresh.length ? fresh : open.filter((e) => e.id !== s.lastClubEvent);\n  if (!pool.length) return null;\n  const data = pick(s, pool);\n  const ev = {\n    id: uid(s,": [
    "Black files 14",
    "Dossiers noirs 14",
  ],
  ") +\n    ` سعة المسيرة الطويلة 0.20: نُقل ${retiring.length} معتزلًا إلى أرشيف مضغوط، وخفّ حجم سجل كل لاعب؛ النتائج والعقود والمالية محفوظة كما هي` +\n    (dropped ? `، وأُزيل ${dropped} مرشحًا مهنيًا قديمًا من خارج ناديك.` ": [
    "Black files 15",
    "Dossiers noirs 15",
  ],
  ") +\n    ` سعة المسيرة الطويلة 0.20: نُقل ${retiring.length} معتزلًا إلى أرشيف مضغوط، وخفّ حجم سجل كل لاعب؛ النتائج والعقود والمالية محفوظة كما هي` +\n    (dropped ? `، وأُزيل ${dropped} مرشحًا مهنيًا قديمًا من خارج ناديك.` :": [
    "Black files 16",
    "Dossiers noirs 16",
  ],
  ") return true;\n  if (SPANISH_CLUBS.has(player.clubId)) return true;\n  if (SPANISH_CLUBS.has(player.clubName)) return true;\n  // في الحفظة الموسعة، نفحص هل النادي في مجموعة إسبانية؟\n  if (s?.expansion) {\n    const esDivisions = s.expansion.divisions?.filter((d) => d.country ===": [
    "Black files 17",
    "Dossiers noirs 17",
  ],
  ") {\n      // نطاق بسيط حسب التقييم للحفظات المهاجرة — التفاصيل في releaseClause.js\n      const rating = p.rating || 60;\n      let min = 2000000, max = 5000000;\n      if (rating >= 70 && rating <= 74) { min = 5000000; max = 12000000; }\n      else if (rating >= 75 && rating <= 79) { min = 12000000; max = 30000000; }\n      else if (rating >= 80 && rating <= 84) { min = 30000000; max = 80000000; }\n      else if (rating >= 85) { min = 80000000; max = 150000000; }\n      // 25% بلا شرط\n      const rnd = Math.random();\n      p.contractTerms.releaseClause = rnd < 0.25 ? 0 : Math.round(min + (max - min) * ((rnd - 0.25) / 0.75));\n    }\n  }\n  s.migrationNote =\n    (s.migrationNote ||": [
    "Black files 18",
    "Dossiers noirs 18",
  ],
  ") {\n      const rnd = random(s);\n      p.contractTerms.releaseClause = calculateReleaseClause(p, s.date, rnd, s);\n    }\n  }\n}\n\n// كسر الشرط الجزائي: دفع دفعة واحدة ثم التفاوض مع اللاعب مباشرة\nexport function canBreakReleaseClause(s, player) {\n  if (!player) return false;\n  if (player.clubId === s.clubId) return false;\n  if (player.status ===": [
    "Black files 19",
    "Dossiers noirs 19",
  ],
  ") {\n    // نحدد مباراة قادمة ضد خصم\n    const fixtures = s.fixtures?.filter((f) => !f.played && (f.home === s.clubId || f.away === s.clubId)) || [];\n    const next = fixtures.sort((a, b) => a.date.localeCompare(b.date))[0];\n    if (next) {\n      const oppId = next.home === s.clubId ? next.away : next.home;\n      bf.active.bribedOpponent = {\n        fixtureId: next.id,\n        opponent: oppId,\n        until: addDays(next.date, 1),\n        date: s.date,\n      };\n      message(s, {\n        title: blackTextAr(": [
    "Black files 20",
    "Dossiers noirs 20",
  ],
  ")) return 0; // مرة في الشهر\n  const ownPlayers = s.players.filter((p) => p.clubId === s.clubId && p.status !==": [
    "Black files 21",
    "Dossiers noirs 21",
  ],
  ")) {\n      // نُسجل اجتماع فشل ثقة\n      b.meetings.push({\n        id: uid(s": [
    "Black files 22",
    "Dossiers noirs 22",
  ],
  ")) {\n      // نُسجل اجتماع فشل ثقة\n      b.meetings.push({\n        id: uid(s,": [
    "Black files 23",
    "Dossiers noirs 23",
  ],
  "));\n\n  // سحب لقب الموسم الحالي إن وجد — إذا كنت متصدرًا\n  const isLeader = ownRow && s.table?.every((t) => t.clubId === s.clubId || t.points <= ownRow.points);\n  if (isLeader) bf.titleStripped = true;\n\n  // هروب راعٍ\n  const activeSponsors = s.sponsors.filter((c) => c.status ===": [
    "Black files 24",
    "Dossiers noirs 24",
  ],
  "));\n  }\n\n  // غضب جماهيري -15 إلى -25\n  const fanDrop = 15 + Math.floor(random(s) * 11);\n  s.fanSupport = clamp(s.fanSupport - fanDrop, 0, 100);\n\n  // منع قيد لفترة 90-180 يوم\n  const banDays = 90 + Math.floor(random(s) * 91);\n  bf.transferBanUntil = addDays(s.date, banDays);\n\n  // تصفير المؤشر مع عقوبة سمعة دائمة خفيفة -2\n  bf.suspicion = 0;\n  bf.scandalCount += 1;\n  s.reputation = clamp(s.reputation - 2, 0, 100);\n  bf.permanentRepPenalty += 2;\n\n  bf.history.push({\n    date: s.date,\n    points: pointsDeduction,\n    fine,\n    sponsor: sponsorOut?.id || null,\n    fanDrop,\n    banDays,\n    titleStripped: Boolean(isLeader),\n  });\n\n  message(s, {\n    title: blackTextAr(": [
    "Black files 25",
    "Dossiers noirs 25",
  ],
  "),\n      ].map((el) => el.value);\n      if (e.target.id === \"setup-language\") setLanguage(e.target.value);\n      if (e.target.name === \"difficulty\")\n        ui.setupConfig.difficulty = e.target.value;\n      if (e.target.id === \"setup-database\")\n        ui.setupConfig.database = e.target.value;\n      if (e.target.id === \"setup-database\" && e.target.value !== \"world\") {\n        ui.setupConfig.expanded = false;\n        ui.setupClub = \"ahly\";\n      }\n      render();\n    }\n    if (e.target.id === \"clause-level\") {\n      const opt = e.target.selectedOptions[0];\n      const clauseVal = Number(opt?.dataset?.clause || 0);\n      const salaryFactor = Number(opt?.dataset?.salary || 1);\n      const clauseInput = document.getElementById(\"release-clause-input\");\n      if (clauseInput) clauseInput.value = clauseVal;\n      const salaryInput = e.target.form?.elements?.salary;\n      if (salaryInput && salaryFactor !== 1) {\n        const baseSalary = Number(salaryInput.dataset.base || salaryInput.value);\n        if (!salaryInput.dataset.base) salaryInput.dataset.base = salaryInput.value;\n        salaryInput.value = Math.round(baseSalary * salaryFactor);\n      }\n      updateCalculations();\n      return;\n    }\n    if (e.target.id === \"game-language\") {\n      const lang = e.target.value;\n      await apply((s) => (s.preferences.language = lang));\n      setLanguage(lang);\n      render();\n    }\n    if (e.target.id === \"position-filter\") {\n      ui.playerFilters.pos = e.target.value;\n      ui.playerFilters.page = 0;\n      render();\n    }\n    if (e.target.id === \"league-filter\") {\n      ui.playerFilters.league = e.target.value;\n      ui.playerFilters.page = 0;\n      render();\n    }\n    if (e.target.id === \"legend-player-mode\") {\n      await apply(\n        (s) => setLegendPlayerMode(s, e.target.checked),\n        \"تم حفظ إعداد وضع الأساطير.\",\n      );\n      return;\n    }\n    if (\n      [\"legend-country\", \"legend-group\", \"legend-tier\"].includes(e.target.id)\n    ) {\n      ui.legendFilters[e.target.id.replace(\"legend-\", \"\")] = e.target.value;\n      ui.legendFilters.page = 1;\n      render();\n      return;\n    }\n    if (\n      e.target.id === \"legend-offer-role\" ||\n      e.target.id === \"legend-offer-years\"\n    ) {\n      const form = e.target.form;\n      ui.legendOffer = {\n        id: form.dataset.id,\n        role: form.elements.role.value,\n        years: Number(form.elements.years.value),\n      };\n      openModal(\n        legendDetailModal(getState(), form.dataset.id, ui.legendOffer),\n        true,\n      );\n      return;\n    }\n    if (e.target.id === \"pause-matches\")\n      await apply(\n        (s) => (s.preferences.pauseMatches = e.target.checked),\n        \"تم حفظ إعداد المحاكاة.\",\n      );\n    if (e.target.id === \"theme-select\") {\n      applyThemePref(e.target.value);\n      return;\n    }\n    if (e.target.id === \"font-size\") {\n      try {\n        localStorage.setItem(\"clubowner.fontsize\", e.target.value);\n      } catch {}\n      document.documentElement.dataset.fontsize =\n        e.target.value === \"large\" ? \"large\" : \"normal\";\n      return;\n    }\n    if (e.target.id === \"display-currency\") {\n      setDisplayCurrency(e.target.value);\n      render();\n      toast(\n        tr(\n          \"تم تحويل المبالغ المعروضة إلى العملة المختارة.\",\n          \"Displayed amounts now use the selected currency.\",\n          \"Les montants affichés utilisent la devise sélectionnée.\",\n        ),\n      );\n      return;\n    }\n    if (e.target.id === \"auto-report\")\n      await apply(\n        (s) => (s.preferences.autoMatchReport = e.target.checked),\n        tr(\"تم حفظ الإعداد.\", \"Setting saved.\", \"Réglage enregistré.\"),\n      );\n    if (e.target.id === \"reduce-motion\")\n      await apply(\n        (s) => (s.preferences.reduceMotion = e.target.checked),\n        tr(\"تم حفظ إعداد العرض.\", \"Display setting saved.\", \"Réglage d": [
    "Black files 26",
    "Dossiers noirs 26",
  ],
  "),\n      ].map((x) => x.value);\n    const s = createGame({\n      clubId: ui.setupClub,\n      owner,\n      leagues,\n      ...ui.setupConfig,\n      language: getLanguage(),\n    });\n    await saveGame(s);\n    setState(s);\n    ui.route = \"dashboard\";\n    render();\n    window.scrollTo(0, 0);\n    toast(\"أهلًا بيك. مشروعك بدأ، والحفظ التلقائي شغال.\");\n  },\n  advance: async () => runTime(false),\n  resume: async () => runTime(true),\n  \"match-report\": async (el) => {\n    const s = getState();\n    const f = playedOwnFixtures(s).find((x) => x.id === el.dataset.id);\n    if (f) openModal(matchReportModal(s, reportFor(s, f)));\n  },\n  \"palette-open\": () => openPalette(),\n  \"palette-close\": () => closePalette(),\n  \"palette-select\": (el) => paletteActivate(Number(el.dataset.idx) || 0),\n  \"copy-email\": async () => {\n    try {\n      await navigator.clipboard.writeText(\"Madabeh777@gmail.com\");\n      toast(\n        tr(\n          \"تم نسخ البريد الإلكتروني.\",\n          \"Email address copied.\",\n          \"E-mail copié.\",\n        ),\n      );\n    } catch {\n      toast(\"Madabeh777@gmail.com\");\n    }\n  },\n  \"wipe-data\": async () =>\n    openModal(\n      `<h2>${tr(\"مسح كل البيانات المحلية؟\", \"Wipe all local data?\", \"Effacer toutes les données locales ?\")}</h2><p class=\"muted\">${tr(\"سيُحذف من هذا المتصفح نهائيًا: الحفظة النشطة، كل خانات الحفظ، والنسخ الاحتياطية. لا يمكن التراجع عن هذه الخطوة.\", \"Permanently deleted from this browser: the active save, every save slot, and backups. This cannot be undone.\", \"Suppression définitive sur ce navigateur : sauvegarde active, tous les emplacements et copies. Irréversible.\")}</p><div class=\"modal-actions\">${button(tr(\"مسح نهائي الآن\", \"Wipe everything now\", \"Tout effacer\"), \"wipe-data-confirm\", \"\", \"danger\")}${button(tr(\"إلغاء\", \"Cancel\", \"Annuler\"), \"close-modal\", \"\", \"secondary\")}</div>`,\n    ),\n  \"wipe-data-confirm\": async () => {\n    document.body.classList.add(\"saving-game\");\n    try {\n      const dbs = [\"clubowner.world.saves\", \"clubowner.slots\"];\n      await Promise.all(\n        dbs.map(\n          (name) =>\n            new Promise((resolve) => {\n              if (!globalThis.indexedDB) return resolve();\n              const r = indexedDB.deleteDatabase(name);\n              r.onsuccess = r.onerror = r.onblocked = () => resolve();\n            }),\n        ),\n      );\n      for (const key of Object.keys(localStorage))\n        if (key.startsWith(\"clubowner\")) localStorage.removeItem(key);\n    } catch (e) {\n      document.body.classList.remove(\"saving-game\");\n      showError(e.message);\n      return;\n    }\n    location.reload();\n  },\n  \"onboarding-dismiss\": () => {\n    hideOnboarding(getState());\n    render();\n  },\n  \"slot-save\": async () => {\n    const s = getState();\n    if (!s) return;\n    const name = document.getElementById(\"slot-name\")?.value || \"\";\n    document.body.classList.add(\"saving-game\");\n    try {\n      await writeSlot(s, name);\n      toast(\"تم حفظ الخانة بمعزل عن الحفظة النشطة.\");\n    } catch (e) {\n      showError(e.message);\n    } finally {\n      document.body.classList.remove(\"saving-game\");\n    }\n    render();\n  },\n  \"slot-load\": async (el) => {\n    const meta = listSlots().find((x) => x.id === el.dataset.id);\n    if (!meta) return;\n    openModal(\n      `<h2>${tr(`تحميل خانة «${meta.name}»؟`, `Load slot “${meta.name}”?`, `Charger l": [
    "Black files 27",
    "Dossiers noirs 27",
  ],
  "),\n    body: `تبرعت ${amount} — انخفضت الشبهات ${reduction.toFixed(1)}%.`,\n    category": [
    "Black files 28",
    "Dossiers noirs 28",
  ],
  "),\n    body: `تبرعت ${amount} — انخفضت الشبهات ${reduction.toFixed(1)}%.`,\n    category:": [
    "Black files 29",
    "Dossiers noirs 29",
  ],
  "),\n  more: async () =>\n    openModal(\n      `<h2>إدارة النادي</h2>${NAV_GROUPS.map(\n        (g) =>\n          `<div class=": [
    "Black files 30",
    "Dossiers noirs 30",
  ],
  ").innerHTML =\n      `<div><span>المطلوب من الخزينة الآن</span><strong class=": [
    "Black files 31",
    "Dossiers noirs 31",
  ],
  ").innerHTML =\n      `<div><span>المقدم عند التوقيع</span><strong>${money(Math.round((fee * percent) / 100))} ${cur()}</strong></div><div><span>باقي قيمة الانتقال</span><strong>${money(fee - Math.round((fee * percent) / 100))} ${cur()}</strong></div><small>لم يتم الخصم. لا يشمل المبلغ عقد اللاعب أو الوكيل.</small>`;\n  }\n  if (contract) {\n    const salary = Number(contract.elements.salary.value),\n      bonus = Number(contract.elements.bonus.value),\n      years = Number(contract.elements.years.value),\n      renew = contract.dataset.renew ===": [
    "Black files 32",
    "Dossiers noirs 32",
  ],
  ");\n        // إذا اختار مستوى، نستخدم القيمة المحسوبة من المستوى إن لم يعدلها يدويًا بشكل كبير\n        const selectedOption = form.elements.clauseLevel.selectedOptions[0];\n        const levelClause = Number(selectedOption?.dataset?.clause || 0);\n        if (levelClause === 0) releaseClause = 0;\n        else if (Math.abs(releaseClause - levelClause) < levelClause * 0.5) releaseClause = levelClause;\n      }\n      const terms = {\n        salary: Number(form.elements.salary.value),\n        years: Number(form.elements.years.value),\n        bonus: Number(form.elements.bonus.value),\n        role: form.elements.role.value,\n        appearanceBonus: Number(form.elements.appearanceBonus.value),\n        goalBonus: Number(form.elements.goalBonus.value),\n        annualRaisePct: Number(form.elements.annualRaisePct.value),\n        releaseClause,\n        clauseLevel,\n      };\n      await apply(\n        (s) =>\n          form.dataset.renew ===": [
    "Black files 33",
    "Dossiers noirs 33",
  ],
  ");\n    if (esDivisions?.some((d) => d.clubs.includes(player.clubId))) return true;\n  }\n  return false;\n}\n\nexport function contractYearsLeft(player, currentDate) {\n  if (!player?.contractEnd || !currentDate) return 2;\n  const days = daysBetween(currentDate, player.contractEnd);\n  return Math.max(0, days / 365);\n}\n\n// المضاعفات حسب المواصفات\nexport function releaseMultipliers(player, currentDate, spanish = false) {\n  let mult = 1;\n  const reasons = [];\n  if (player.age < 21) {\n    mult *= 1.5;\n    reasons.push(": [
    "Black files 34",
    "Dossiers noirs 34",
  ],
  ");\n    input.focus();\n    input.setSelectionRange(pos, pos);\n  }\n});\n// اختصارات البحث السريع: Ctrl/⌘+K للفتح والإغلاق، والأسهم وEnter للتنقل داخل النتائج.\ndocument.addEventListener(": [
    "Black files 35",
    "Dossiers noirs 35",
  ],
  ");\n    return result;\n  });\n  // 0.24: شاشة لقطات الماتش أولاً، ثم تقرير الماتش الكامل.\n  const s = getState();\n  if (s && s.preferences?.autoMatchReport !== false) {\n    const fresh = playedOwnFixtures(s).filter((f) => !playedBefore.has(f.id));\n    if (fresh.length) {\n      const r = reportFor(s, fresh[fresh.length - 1]);\n      showHighlightsScreen(s, r, () => {\n        openModal(matchReportModal(s, r));\n      });\n    }\n  }\n  if (r.blocked) {\n    ui.route =": [
    "Black files 36",
    "Dossiers noirs 36",
  ],
  ");\n    setState(state);\n    setLanguage(state.preferences?.language || getLanguage());\n    closeModal();\n    // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة.\n    location.reload();\n  }": [
    "Black files 37",
    "Dossiers noirs 37",
  ],
  ");\n    setState(state);\n    setLanguage(state.preferences?.language || getLanguage());\n    closeModal();\n    // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة.\n    location.reload();\n  },": [
    "Black files 38",
    "Dossiers noirs 38",
  ],
  ");\n  canDoOperation(s, opId);\n  // خصم التكلفة\n  const key = uid(s": [
    "Black files 39",
    "Dossiers noirs 39",
  ],
  ");\n  canDoOperation(s, opId);\n  // خصم التكلفة\n  const key = uid(s,": [
    "Black files 40",
    "Dossiers noirs 40",
  ],
  ");\n  if (last && daysBetween(last.date, s.date) < FLAVOR_GAP_DAYS) return null;\n  const shown = new Set(log.map((m) => m.ref));\n  const open = FLAVOR_CATALOG.filter((e) => gate(e, s) && !shown.has(flavorRef(e.id)));\n  if (!open.length) return null;\n  // توزيع الفئات: لا نضع فئتين متتاليتين من النوع نفسه ما دام هناك بديل.\n  const lastCategory = last?.flavorCategory;\n  const varied = lastCategory\n    ? open.filter((e) => e.category !== lastCategory)\n    : open;\n  const data = pick(s, varied.length ? varied : open);\n  const m = message(s, {\n    title: data.title,\n    body: data.body,\n    category": [
    "Black files 41",
    "Dossiers noirs 41",
  ],
  ");\n  if (last && daysBetween(last.date, s.date) < FLAVOR_GAP_DAYS) return null;\n  const shown = new Set(log.map((m) => m.ref));\n  const open = FLAVOR_CATALOG.filter((e) => gate(e, s) && !shown.has(flavorRef(e.id)));\n  if (!open.length) return null;\n  // توزيع الفئات: لا نضع فئتين متتاليتين من النوع نفسه ما دام هناك بديل.\n  const lastCategory = last?.flavorCategory;\n  const varied = lastCategory\n    ? open.filter((e) => e.category !== lastCategory)\n    : open;\n  const data = pick(s, varied.length ? varied : open);\n  const m = message(s, {\n    title: data.title,\n    body: data.body,\n    category:": [
    "Black files 42",
    "Dossiers noirs 42",
  ],
  ");\n  }\n  return { mult, reasons, years };\n}\n\n// الحساب الكامل: قيمة نهائية بعد المضاعفات، مع سقف 150-300M+ لسوبرستار صغير\nexport function calculateReleaseClause(player, currentDate, rnd = Math.random(), s = null) {\n  // ~25% بلا شرط جزائي أصلًا\n  if (rnd < 0.25) return 0;\n  const baseRnd = typeof rnd ===": [
    "Black files 43",
    "Dossiers noirs 43",
  ],
  ");\n  } catch {}\n});\nfunction render() {\n  const s = getState();\n  if (s) {\n    // تفضيلات العرض تُطبق قبل بناء الشاشات: نمط الأرقام وتقليل الحركة.\n    setDigitsMode(s.preferences?.digits ===": [
    "Black files 44",
    "Dossiers noirs 44",
  ],
  ")}\n      </div>\n    </form>\n  `}`;\n}\n\nconst actions = {\n  // خزنة المالك السرية: مفاتيحها أرقام الإصدار (أسفل القائمة الجانبية + سطر EMPIRE FC في شيت «المزيد» + شارة «عن اللعبة»)": [
    "Black files 45",
    "Dossiers noirs 45",
  ],
  ")}\n      </div>\n    </form>\n  `}`;\n}\n\nconst actions = {\n  // خزنة المالك السرية: مفاتيحها أرقام الإصدار (أسفل القائمة الجانبية + سطر EMPIRE FC في شيت «المزيد» + شارة «عن اللعبة»).": [
    "Black files 46",
    "Dossiers noirs 46",
  ],
  ")} — منذ ${date(bf.active.agentSince)}</p></div>`);\n\n  const ops = Object.values(OPERATIONS).map((op) => {\n    const cooldown = bf.cooldowns[op.id];\n    const busy = cooldown && cooldown >= s.date;\n    const ban = bf.transferBanUntil && bf.transferBanUntil >= s.date && [": [
    "Black files 47",
    "Dossiers noirs 47",
  ],
  ")}</div>`);\n        return;\n      }\n      openModal(`\n        <h2>سجل الحفظات السحابية</h2>\n        <p class=": [
    "Black files 48",
    "Dossiers noirs 48",
  ],
  ")}</h4><p>${bf.active.mediaWar.rival} — حتى ${date(bf.active.mediaWar.until)}</p></div>`);\n  if (bf.active.agentOnPayroll) active.push(`<div class=": [
    "Black files 49",
    "Dossiers noirs 49",
  ],
  "+ ` سعة المسيرة الطويلة 0.20: نُقل ${retiring.length} معتزلًا إلى أرشيف مضغوط، وخفّ حجم سجل كل لاعب؛ النتائج والعقود والمالية محفوظة كما هي` + (dropped ? `، وأُزيل ${dropped} مرشحًا مهنيًا قديمًا من خارج ناديك.`": [
    "Black files 50",
    "Dossiers noirs 50",
  ],
  "+ s.date);\n      }\n    }\n    if (bf.suspicion >= 100) triggerScandal(s);\n  }\n\n  // انتهاء آثار مؤقتة\n  if (bf.active.refereeBias && bf.active.refereeBias.until < s.date) {\n    bf.active.refereeBias = null;\n  }\n  if (bf.active.bribedOpponent && bf.active.bribedOpponent.until < s.date) {\n    bf.active.bribedOpponent = null;\n  }\n  if (bf.active.mediaWar && bf.active.mediaWar.until < s.date) {\n    bf.active.mediaWar = null;\n  }\n\n  // معالجة كسر AI للشرط الجزائي المعلق\n  if (bf.pendingAiBreaks?.length) {\n    const remaining = [];\n    for (const item of bf.pendingAiBreaks) {\n      const p = s.players.find((x) => x.id === item.playerId);\n      if (!p || p.clubId !== s.clubId) continue;\n      // نقل فوري\n      p.clubId = item.buyer;\n      p.careerHistory.push({ date: s.date, type": [
    "Black files 51",
    "Dossiers noirs 51",
  ],
  "+ s.date);\n      }\n    }\n    if (bf.suspicion >= 100) triggerScandal(s);\n  }\n\n  // انتهاء آثار مؤقتة\n  if (bf.active.refereeBias && bf.active.refereeBias.until < s.date) {\n    bf.active.refereeBias = null;\n  }\n  if (bf.active.bribedOpponent && bf.active.bribedOpponent.until < s.date) {\n    bf.active.bribedOpponent = null;\n  }\n  if (bf.active.mediaWar && bf.active.mediaWar.until < s.date) {\n    bf.active.mediaWar = null;\n  }\n\n  // معالجة كسر AI للشرط الجزائي المعلق\n  if (bf.pendingAiBreaks?.length) {\n    const remaining = [];\n    for (const item of bf.pendingAiBreaks) {\n      const p = s.players.find((x) => x.id === item.playerId);\n      if (!p || p.clubId !== s.clubId) continue;\n      // نقل فوري\n      p.clubId = item.buyer;\n      p.careerHistory.push({ date: s.date, type:": [
    "Black files 52",
    "Dossiers noirs 52",
  ],
  "+ s.date); } } if (bf.suspicion >= 100) triggerScandal(s); } // انتهاء آثار مؤقتة if (bf.active.refereeBias && bf.active.refereeBias.until < s.date) { bf.active.refereeBias = null; } if (bf.active.bribedOpponent && bf.active.bribedOpponent.until < s.date) { bf.active.bribedOpponent = null; } if (bf.active.mediaWar && bf.active.mediaWar.until < s.date) { bf.active.mediaWar = null; } // معالجة كسر AI للشرط الجزائي المعلق if (bf.pendingAiBreaks?.length) { const remaining = []; for (const item of bf.pendingAiBreaks) { const p = s.players.find((x) => x.id === item.playerId); if (!p || p.clubId !== s.clubId) continue; // نقل فوري p.clubId = item.buyer; p.careerHistory.push({ date: s.date, type": [
    "Black files 53",
    "Dossiers noirs 53",
  ],
  ",\n        description: `قسط شراء ${p.name}`,\n        key: n.id +": [
    "Black files 54",
    "Dossiers noirs 54",
  ],
  ",\n      ].map((el) => el.value);\n      if (e.target.id === \"setup-language\") setLanguage(e.target.value);\n      if (e.target.name === \"difficulty\")\n        ui.setupConfig.difficulty = e.target.value;\n      if (e.target.id === \"setup-database\")\n        ui.setupConfig.database = e.target.value;\n      if (e.target.id === \"setup-database\" && e.target.value !== \"world\") {\n        ui.setupConfig.expanded = false;\n        ui.setupClub = \"ahly\";\n      }\n      render();\n    }\n    if (e.target.id === \"clause-level\") {\n      const opt = e.target.selectedOptions[0];\n      const clauseVal = Number(opt?.dataset?.clause || 0);\n      const salaryFactor = Number(opt?.dataset?.salary || 1);\n      const clauseInput = document.getElementById(\"release-clause-input\");\n      if (clauseInput) clauseInput.value = clauseVal;\n      const salaryInput = e.target.form?.elements?.salary;\n      if (salaryInput && salaryFactor !== 1) {\n        const baseSalary = Number(salaryInput.dataset.base || salaryInput.value);\n        if (!salaryInput.dataset.base) salaryInput.dataset.base = salaryInput.value;\n        salaryInput.value = Math.round(baseSalary * salaryFactor);\n      }\n      updateCalculations();\n      return;\n    }\n    if (e.target.id === \"game-language\") {\n      const lang = e.target.value;\n      await apply((s) => (s.preferences.language = lang));\n      setLanguage(lang);\n      render();\n    }\n    if (e.target.id === \"position-filter\") {\n      ui.playerFilters.pos = e.target.value;\n      ui.playerFilters.page = 0;\n      render();\n    }\n    if (e.target.id === \"league-filter\") {\n      ui.playerFilters.league = e.target.value;\n      ui.playerFilters.page = 0;\n      render();\n    }\n    if (e.target.id === \"legend-player-mode\") {\n      await apply(\n        (s) => setLegendPlayerMode(s, e.target.checked),\n        \"تم حفظ إعداد وضع الأساطير.\",\n      );\n      return;\n    }\n    if (\n      [\"legend-country\", \"legend-group\", \"legend-tier\"].includes(e.target.id)\n    ) {\n      ui.legendFilters[e.target.id.replace(\"legend-\", \"\")] = e.target.value;\n      ui.legendFilters.page = 1;\n      render();\n      return;\n    }\n    if (\n      e.target.id === \"legend-offer-role\" ||\n      e.target.id === \"legend-offer-years\"\n    ) {\n      const form = e.target.form;\n      ui.legendOffer = {\n        id: form.dataset.id,\n        role: form.elements.role.value,\n        years: Number(form.elements.years.value),\n      };\n      openModal(\n        legendDetailModal(getState(), form.dataset.id, ui.legendOffer),\n        true,\n      );\n      return;\n    }\n    if (e.target.id === \"pause-matches\")\n      await apply(\n        (s) => (s.preferences.pauseMatches = e.target.checked),\n        \"تم حفظ إعداد المحاكاة.\",\n      );\n    if (e.target.id === \"theme-select\") {\n      applyThemePref(e.target.value);\n      return;\n    }\n    if (e.target.id === \"font-size\") {\n      try {\n        localStorage.setItem(\"clubowner.fontsize\", e.target.value);\n      } catch {}\n      document.documentElement.dataset.fontsize =\n        e.target.value === \"large\" ? \"large\" : \"normal\";\n      return;\n    }\n    if (e.target.id === \"display-currency\") {\n      setDisplayCurrency(e.target.value);\n      render();\n      toast(\n        tr(\n          \"تم تحويل المبالغ المعروضة إلى العملة المختارة.\",\n          \"Displayed amounts now use the selected currency.\",\n          \"Les montants affichés utilisent la devise sélectionnée.\",\n        ),\n      );\n      return;\n    }\n    if (e.target.id === \"auto-report\")\n      await apply(\n        (s) => (s.preferences.autoMatchReport = e.target.checked),\n        tr(\"تم حفظ الإعداد.\", \"Setting saved.\", \"Réglage enregistré.\"),\n      );\n    if (e.target.id === \"reduce-motion\")\n      await apply(\n        (s) => (s.preferences.reduceMotion = e.target.checked),\n        tr(\"تم حفظ إعداد العرض.\", \"Display setting saved.\", \"Réglage d": [
    "Black files 55",
    "Dossiers noirs 55",
  ],
  ",\n      ].map((x) => x.value);\n    const s = createGame({\n      clubId: ui.setupClub,\n      owner,\n      leagues,\n      ...ui.setupConfig,\n      language: getLanguage(),\n    });\n    await saveGame(s);\n    setState(s);\n    ui.route = \"dashboard\";\n    render();\n    window.scrollTo(0, 0);\n    toast(\"أهلًا بيك. مشروعك بدأ، والحفظ التلقائي شغال.\");\n  },\n  advance: async () => runTime(false),\n  resume: async () => runTime(true),\n  \"match-report\": async (el) => {\n    const s = getState();\n    const f = playedOwnFixtures(s).find((x) => x.id === el.dataset.id);\n    if (f) openModal(matchReportModal(s, reportFor(s, f)));\n  },\n  \"palette-open\": () => openPalette(),\n  \"palette-close\": () => closePalette(),\n  \"palette-select\": (el) => paletteActivate(Number(el.dataset.idx) || 0),\n  \"copy-email\": async () => {\n    try {\n      await navigator.clipboard.writeText(\"Madabeh777@gmail.com\");\n      toast(\n        tr(\n          \"تم نسخ البريد الإلكتروني.\",\n          \"Email address copied.\",\n          \"E-mail copié.\",\n        ),\n      );\n    } catch {\n      toast(\"Madabeh777@gmail.com\");\n    }\n  },\n  \"wipe-data\": async () =>\n    openModal(\n      `<h2>${tr(\"مسح كل البيانات المحلية؟\", \"Wipe all local data?\", \"Effacer toutes les données locales ?\")}</h2><p class=\"muted\">${tr(\"سيُحذف من هذا المتصفح نهائيًا: الحفظة النشطة، كل خانات الحفظ، والنسخ الاحتياطية. لا يمكن التراجع عن هذه الخطوة.\", \"Permanently deleted from this browser: the active save, every save slot, and backups. This cannot be undone.\", \"Suppression définitive sur ce navigateur : sauvegarde active, tous les emplacements et copies. Irréversible.\")}</p><div class=\"modal-actions\">${button(tr(\"مسح نهائي الآن\", \"Wipe everything now\", \"Tout effacer\"), \"wipe-data-confirm\", \"\", \"danger\")}${button(tr(\"إلغاء\", \"Cancel\", \"Annuler\"), \"close-modal\", \"\", \"secondary\")}</div>`,\n    ),\n  \"wipe-data-confirm\": async () => {\n    document.body.classList.add(\"saving-game\");\n    try {\n      const dbs = [\"clubowner.world.saves\", \"clubowner.slots\"];\n      await Promise.all(\n        dbs.map(\n          (name) =>\n            new Promise((resolve) => {\n              if (!globalThis.indexedDB) return resolve();\n              const r = indexedDB.deleteDatabase(name);\n              r.onsuccess = r.onerror = r.onblocked = () => resolve();\n            }),\n        ),\n      );\n      for (const key of Object.keys(localStorage))\n        if (key.startsWith(\"clubowner\")) localStorage.removeItem(key);\n    } catch (e) {\n      document.body.classList.remove(\"saving-game\");\n      showError(e.message);\n      return;\n    }\n    location.reload();\n  },\n  \"onboarding-dismiss\": () => {\n    hideOnboarding(getState());\n    render();\n  },\n  \"slot-save\": async () => {\n    const s = getState();\n    if (!s) return;\n    const name = document.getElementById(\"slot-name\")?.value || \"\";\n    document.body.classList.add(\"saving-game\");\n    try {\n      await writeSlot(s, name);\n      toast(\"تم حفظ الخانة بمعزل عن الحفظة النشطة.\");\n    } catch (e) {\n      showError(e.message);\n    } finally {\n      document.body.classList.remove(\"saving-game\");\n    }\n    render();\n  },\n  \"slot-load\": async (el) => {\n    const meta = listSlots().find((x) => x.id === el.dataset.id);\n    if (!meta) return;\n    openModal(\n      `<h2>${tr(`تحميل خانة «${meta.name}»؟`, `Load slot “${meta.name}”?`, `Charger l": [
    "Black files 56",
    "Dossiers noirs 56",
  ],
  ",\n      });\n    }\n    return { success: false, heat: op.heat * 0.6 };\n  }\n\n  // نجاح\n  addSuspicion(s, op.heat);\n\n  if (opId ===": [
    "Black files 57",
    "Dossiers noirs 57",
  ],
  ",\n      });\n    }\n  }\n\n  return {\n    pointsDeduction,\n    fine,\n    fanDrop,\n    banDays,\n    titleStripped: Boolean(isLeader),\n  };\n}\n\nexport function blackFilesDay(s) {\n  const bf = ensureBlackFiles(s);\n  if (!bf) return;\n\n  // مرور الوقت ينزل الشبهات 0.12 يوميًا\n  if (bf.suspicion > 0) {\n    bf.suspicion = clamp(bf.suspicion - 0.12, 0, 100);\n  }\n\n  // وكيل على المرتب: heat مستمر صغير 0.15 يوميًا + راتب شهري\n  if (bf.active.agentOnPayroll) {\n    bf.suspicion = clamp(bf.suspicion + 0.15, 0, 100);\n    if (s.date.endsWith": [
    "Black files 58",
    "Dossiers noirs 58",
  ],
  ",\n      });\n    }\n  }\n\n  return {\n    pointsDeduction,\n    fine,\n    fanDrop,\n    banDays,\n    titleStripped: Boolean(isLeader),\n  };\n}\n\nexport function blackFilesDay(s) {\n  const bf = ensureBlackFiles(s);\n  if (!bf) return;\n\n  // مرور الوقت ينزل الشبهات 0.12 يوميًا\n  if (bf.suspicion > 0) {\n    bf.suspicion = clamp(bf.suspicion - 0.12, 0, 100);\n  }\n\n  // وكيل على المرتب: heat مستمر صغير 0.15 يوميًا + راتب شهري\n  if (bf.active.agentOnPayroll) {\n    bf.suspicion = clamp(bf.suspicion + 0.15, 0, 100);\n    if (s.date.endsWith(": [
    "Black files 59",
    "Dossiers noirs 59",
  ],
  ",\n    );\n    if (market.length) {\n      const p = market[Math.floor(random(s) * market.length)];\n      p.scoutReport = {\n        date: s.date,\n        min: Math.max(1, Math.round(p.potential - 7)),\n        max: Math.min(99, Math.round(p.potential + 7)),\n        confidence: 45,\n      };\n      message(s, {\n        title: `تقرير مرشح: ${p.name}`,\n        body": [
    "Black files 60",
    "Dossiers noirs 60",
  ],
  ",\n    );\n    if (market.length) {\n      const p = market[Math.floor(random(s) * market.length)];\n      p.scoutReport = {\n        date: s.date,\n        min: Math.max(1, Math.round(p.potential - 7)),\n        max: Math.min(99, Math.round(p.potential + 7)),\n        confidence: 45,\n      };\n      message(s, {\n        title: `تقرير مرشح: ${p.name}`,\n        body:": [
    "Black files 61",
    "Dossiers noirs 61",
  ],
  ",\n    `سمعة: ${num(s.reputation)}`": [
    "Black files 62",
    "Dossiers noirs 62",
  ],
  ",\n    `سمعة: ${num(s.reputation)}`,": [
    "Black files 63",
    "Dossiers noirs 63",
  ],
  ",\n    body: `تبرعت ${amount} — انخفضت الشبهات ${reduction.toFixed(1)}%.`,\n    category:": [
    "Black files 64",
    "Dossiers noirs 64",
  ],
  ",\n    clausePaid: false,\n  };\n  s.negotiations.push(neg);\n  return neg;\n}\n\n// أندية AI تكسر شروط لاعبي اللاعب أيضًا (كاش فوري + غضب جماهيري + أحداث)\nexport function aiBreakReleaseClauses(s) {\n  if (!s.expansion) return 0;\n  if (!s.date.endsWith": [
    "Black files 65",
    "Dossiers noirs 65",
  ],
  ",\n    clausePaid: false,\n  };\n  s.negotiations.push(neg);\n  return neg;\n}\n\n// أندية AI تكسر شروط لاعبي اللاعب أيضًا (كاش فوري + غضب جماهيري + أحداث)\nexport function aiBreakReleaseClauses(s) {\n  if (!s.expansion) return 0;\n  if (!s.date.endsWith(": [
    "Black files 66",
    "Dossiers noirs 66",
  ],
  ",\n    deadline: addDays(s.date, 10),\n  });\n\n  // ربط باللائحة: بند لا فضائح يُسقط بند الثقة تلقائيًا\n  const b = ensureBoard(s);\n  if (b) {\n    b.confidence = clamp(b.confidence - 20 - bf.scandalCount * 3, 0, 100);\n    b.failureStreak += 1;\n    // إذا كانت لائحة نشطة، نضع علامة فشل فوري على بند لا فضائح\n    if (b.mandate?.items?.some((it) => it.kind ===": [
    "Black files 67",
    "Dossiers noirs 67",
  ],
  ",\n    });\n    // فشل خاص لخطف لاعب: غرامة + منع قيد\n    if (opId ===": [
    "Black files 68",
    "Dossiers noirs 68",
  ],
  ",\n  more: async () =>\n    openModal(\n      `<h2>إدارة النادي</h2>${NAV_GROUPS.map(\n        (g) =>\n          `<div class=": [
    "Black files 69",
    "Dossiers noirs 69",
  ],
  ",\n  });\n  return bf.suspicion;\n}\n\nexport function triggerScandal(s) {\n  const bf = ensureBlackFiles(s);\n  if (bf.suspicion < 100) return null;\n  // خصم 3-9 نقاط\n  const pointsDeduction = 3 + Math.floor(random(s) * 7);\n  const ownRow = s.table?.find((t) => t.clubId === s.clubId);\n  if (ownRow) ownRow.points = Math.max(0, ownRow.points - pointsDeduction);\n\n  // غرامات ضخمة 15-35M\n  const fine = 15000000 + Math.floor(random(s) * 20000000);\n  post(s, -fine": [
    "Black files 70",
    "Dossiers noirs 70",
  ],
  ",\n  });\n  return bf.suspicion;\n}\n\nexport function triggerScandal(s) {\n  const bf = ensureBlackFiles(s);\n  if (bf.suspicion < 100) return null;\n  // خصم 3-9 نقاط\n  const pointsDeduction = 3 + Math.floor(random(s) * 7);\n  const ownRow = s.table?.find((t) => t.clubId === s.clubId);\n  if (ownRow) ownRow.points = Math.max(0, ownRow.points - pointsDeduction);\n\n  // غرامات ضخمة 15-35M\n  const fine = 15000000 + Math.floor(random(s) * 20000000);\n  post(s, -fine,": [
    "Black files 71",
    "Dossiers noirs 71",
  ],
  ",\n  });\n  return ev;\n}\n\n// توليد لاعب داخل عالم اللعبة: ناشئ أكاديمية (السلوك الأصلي) أو صفقة معلومة الشروط.\n// كل الأسماء مولّدة ومعلَمة `fictional: true` — لا يُستدعى لاعب حقيقي من الحزم.\nfunction addGeneratedPlayer(s, opts = {}) {\n  const youth = Boolean(opts.youth);\n  const serial = youth ? s.academyCount++ : ++s.academyCount;\n  const labelAr = opts.labelAr ||": [
    "Black files 72",
    "Dossiers noirs 72",
  ],
  ",\n  });\n  return ev;\n}\n\n// ── أخبار النكهة ───────────────────────────────────────────────────────────\n// خبر قصير يدخل البريد كرسالة «للعلم»: لا `required`، فلا توقيف للزمن، ولا قرار.\n// الأثر — إن وُجد — صغير ومعلن، ويُنفَّذ مرة واحدة بمفتاح دفتر مرتبط بالرسالة.\nexport function flavorEventDay(s) {\n  if (daysBetween(s.startDate, s.date) < FLAVOR_MIN_CAREER_DAYS) return null;\n  const log = flavorLog(s);\n  const last = s.inbox.find((m) => m.kind ===": [
    "Black files 73",
    "Dossiers noirs 73",
  ],
  ",\n  },\n\n  // ── اجتماع منتصف الموسم ───────────────────────────────────────────────────\n  midMeetingGoodTitle: {\n    ar": [
    "Black files 74",
    "Dossiers noirs 74",
  ],
  ",\n  },\n\n  // ── اجتماع منتصف الموسم ───────────────────────────────────────────────────\n  midMeetingGoodTitle: {\n    ar:": [
    "Black files 75",
    "Dossiers noirs 75",
  ],
  ",\n  },\n\n  // ── التجميد في سوق الانتقالات ─────────────────────────────────────────────\n  freezeBlocked: {\n    ar": [
    "Black files 76",
    "Dossiers noirs 76",
  ],
  ",\n  },\n\n  // ── التجميد في سوق الانتقالات ─────────────────────────────────────────────\n  freezeBlocked: {\n    ar:": [
    "Black files 77",
    "Dossiers noirs 77",
  ],
  ",\n  },\n\n  // ── التصويت النهائي ───────────────────────────────────────────────────────\n  endMeetingPassedTitle: {\n    ar": [
    "Black files 78",
    "Dossiers noirs 78",
  ],
  ",\n  },\n\n  // ── التصويت النهائي ───────────────────────────────────────────────────────\n  endMeetingPassedTitle: {\n    ar:": [
    "Black files 79",
    "Dossiers noirs 79",
  ],
  ",\n  },\n\n  // ── العواقب والمكافآت ─────────────────────────────────────────────────────\n  cRewardInvestors: {\n    ar": [
    "Black files 80",
    "Dossiers noirs 80",
  ],
  ",\n  },\n\n  // ── العواقب والمكافآت ─────────────────────────────────────────────────────\n  cRewardInvestors: {\n    ar:": [
    "Black files 81",
    "Dossiers noirs 81",
  ],
  ",\n  },\n\n  // ── المحاور ───────────────────────────────────────────────────────────────\n  axisSporting: {\n    ar": [
    "Black files 82",
    "Dossiers noirs 82",
  ],
  ",\n  },\n\n  // ── المحاور ───────────────────────────────────────────────────────────────\n  axisSporting: {\n    ar:": [
    "Black files 83",
    "Dossiers noirs 83",
  ],
  ",\n  },\n\n  // ── بداية الموسم ──────────────────────────────────────────────────────────\n  mandateIssuedTitle: {\n    ar": [
    "Black files 84",
    "Dossiers noirs 84",
  ],
  ",\n  },\n\n  // ── بداية الموسم ──────────────────────────────────────────────────────────\n  mandateIssuedTitle: {\n    ar:": [
    "Black files 85",
    "Dossiers noirs 85",
  ],
  ",\n  },\n\n  // ── بطاقة اللوحة وبريد اللائحة ────────────────────────────────────────────\n  boardCardTitle: {\n    ar": [
    "Black files 86",
    "Dossiers noirs 86",
  ],
  ",\n  },\n\n  // ── بطاقة اللوحة وبريد اللائحة ────────────────────────────────────────────\n  boardCardTitle: {\n    ar:": [
    "Black files 87",
    "Dossiers noirs 87",
  ],
  ",\n  },\n\n  // ── بنود اللائحة (١٠ أنواع) ────────────────────────────────────────────────\n  itemLeagueRank: {\n    ar": [
    "Black files 88",
    "Dossiers noirs 88",
  ],
  ",\n  },\n\n  // ── بنود اللائحة (١٠ أنواع) ────────────────────────────────────────────────\n  itemLeagueRank: {\n    ar:": [
    "Black files 89",
    "Dossiers noirs 89",
  ],
  ",\n  },\n};\n\nexport function initBlackFiles(s) {\n  s.blackFiles = {\n    suspicion: 0,\n    permanentRepPenalty: 0,\n    lastOperationDate: null,\n    lastOperationType: null,\n    cooldowns: {},\n    active: {\n      refereeBias: null,\n      bribedOpponent: null,\n      mediaWar: null,\n      agentOnPayroll: false,\n      agentSince: null,\n    },\n    transferBanUntil: null,\n    scandalCount: 0,\n    history: [],\n    titleStripped: false,\n    pendingAiBreaks: [],\n    charityTotal: 0,\n  };\n  return s.blackFiles;\n}\n\nexport const ensureBlackFiles = (s) => s.blackFiles || initBlackFiles(s);\n\nexport function suspicionLevel(s) {\n  const v = ensureBlackFiles(s).suspicion;\n  if (v >= 100) return 4;\n  if (v >= 85) return 3;\n  if (v >= 60) return 2;\n  if (v >= 30) return 1;\n  return 0;\n}\n\nexport function addSuspicion(s, amount) {\n  const bf = ensureBlackFiles(s);\n  const before = bf.suspicion;\n  bf.suspicion = clamp(bf.suspicion + amount, 0, 100);\n  const after = bf.suspicion;\n  // إشعارات عبور العتبات\n  if (before < 30 && after >= 30) {\n    message(s, {\n      title: blackTextAr": [
    "Black files 90",
    "Dossiers noirs 90",
  ],
  ",\n  },\n};\n\nexport function initBlackFiles(s) {\n  s.blackFiles = {\n    suspicion: 0,\n    permanentRepPenalty: 0,\n    lastOperationDate: null,\n    lastOperationType: null,\n    cooldowns: {},\n    active: {\n      refereeBias: null,\n      bribedOpponent: null,\n      mediaWar: null,\n      agentOnPayroll: false,\n      agentSince: null,\n    },\n    transferBanUntil: null,\n    scandalCount: 0,\n    history: [],\n    titleStripped: false,\n    pendingAiBreaks: [],\n    charityTotal: 0,\n  };\n  return s.blackFiles;\n}\n\nexport const ensureBlackFiles = (s) => s.blackFiles || initBlackFiles(s);\n\nexport function suspicionLevel(s) {\n  const v = ensureBlackFiles(s).suspicion;\n  if (v >= 100) return 4;\n  if (v >= 85) return 3;\n  if (v >= 60) return 2;\n  if (v >= 30) return 1;\n  return 0;\n}\n\nexport function addSuspicion(s, amount) {\n  const bf = ensureBlackFiles(s);\n  const before = bf.suspicion;\n  bf.suspicion = clamp(bf.suspicion + amount, 0, 100);\n  const after = bf.suspicion;\n  // إشعارات عبور العتبات\n  if (before < 30 && after >= 30) {\n    message(s, {\n      title: blackTextAr(": [
    "Black files 91",
    "Dossiers noirs 91",
  ],
  ",\n  },\n};\n// يملأ عناصر الاستبدال {v}/{n}/{d} بـ vars. أي مفتاح ناقص يبقى كما هو (ظهور واضح للخلل).\nexport const fillBoardText = (template, vars = {}) =>\n  String(template).replace(/\\{(\\w+)\\}/g, (m, k) =>\n    vars[k] === undefined || vars[k] === null ? m : String(vars[k]),\n  );\n\n// نص جاهز للغة الواجهة الحالية — تستخدمه الشاشات (يُترجم قبل الحقن في DOM).\nexport const boardTextFor = (key, vars, language) => {\n  const entry = BOARD_TEXTS[key];\n  if (!entry) return key;\n  const code = language ===": [
    "Black files 92",
    "Dossiers noirs 92",
  ],
  ", ); if (market.length) { const p = market[Math.floor(random(s) * market.length)]; p.scoutReport = { date: s.date, min: Math.max(1, Math.round(p.potential - 7)), max: Math.min(99, Math.round(p.potential + 7)), confidence: 45, }; message(s, { title: `تقرير مرشح: ${p.name}`, body": [
    "Black files 93",
    "Dossiers noirs 93",
  ],
  ", 18)} الأقساط كل ٣٠ يومًا. عمولة الوكيل ٣٪ عند التوقيع (١٪ مع وكيل على المرتب)، وعقد اللاعب يتم التفاوض عليه بعد رد النادي.</div><div class=": [
    "Black files 94",
    "Dossiers noirs 94",
  ],
  ", 25)}<span>المرتبات الشهرية<strong>${money(wages(s))} <small>${cur()}</small></strong></span></div><div>${icon": [
    "Black files 95",
    "Dossiers noirs 95",
  ],
  ", 25)}<span>المرتبات الشهرية<strong>${money(wages(s))} <small>${cur()}</small></strong></span></div><div>${icon(": [
    "Black files 96",
    "Dossiers noirs 96",
  ],
  ", 25)}<span>متوسط التقييم<strong>${num(Math.round(players.reduce((a, p) => a + p.rating, 0) / Math.max(players.length, 1)))}</strong></span></div><div>${icon": [
    "Black files 97",
    "Dossiers noirs 97",
  ],
  ", 25)}<span>متوسط التقييم<strong>${num(Math.round(players.reduce((a, p) => a + p.rating, 0) / Math.max(players.length, 1)))}</strong></span></div><div>${icon(": [
    "Black files 98",
    "Dossiers noirs 98",
  ],
  ", 25)}<span>متوسط الجاهزية<strong>${num(Math.round(players.reduce((a, p) => a + p.fitness, 0) / Math.max(players.length, 1)))}٪</strong></span></div></div>`}<section class=": [
    "Black files 99",
    "Dossiers noirs 99",
  ],
  ", ].map((el) => el.value); if (e.target.id === \"setup-language\") setLanguage(e.target.value); if (e.target.name === \"difficulty\") ui.setupConfig.difficulty = e.target.value; if (e.target.id === \"setup-database\") ui.setupConfig.database = e.target.value; if (e.target.id === \"setup-database\" && e.target.value !== \"world\") { ui.setupConfig.expanded = false; ui.setupClub = \"ahly\"; } render(); } if (e.target.id === \"clause-level\") { const opt = e.target.selectedOptions[0]; const clauseVal = Number(opt?.dataset?.clause || 0); const salaryFactor = Number(opt?.dataset?.salary || 1); const clauseInput = document.getElementById(\"release-clause-input\"); if (clauseInput) clauseInput.value = clauseVal; const salaryInput = e.target.form?.elements?.salary; if (salaryInput && salaryFactor !== 1) { const baseSalary = Number(salaryInput.dataset.base || salaryInput.value); if (!salaryInput.dataset.base) salaryInput.dataset.base = salaryInput.value; salaryInput.value = Math.round(baseSalary * salaryFactor); } updateCalculations(); return; } if (e.target.id === \"game-language\") { const lang = e.target.value; await apply((s) => (s.preferences.language = lang)); setLanguage(lang); render(); } if (e.target.id === \"position-filter\") { ui.playerFilters.pos = e.target.value; ui.playerFilters.page = 0; render(); } if (e.target.id === \"league-filter\") { ui.playerFilters.league = e.target.value; ui.playerFilters.page = 0; render(); } if (e.target.id === \"legend-player-mode\") { await apply( (s) => setLegendPlayerMode(s, e.target.checked), \"تم حفظ إعداد وضع الأساطير.\", ); return; } if ( [\"legend-country\", \"legend-group\", \"legend-tier\"].includes(e.target.id) ) { ui.legendFilters[e.target.id.replace(\"legend-\", \"\")] = e.target.value; ui.legendFilters.page = 1; render(); return; } if ( e.target.id === \"legend-offer-role\" || e.target.id === \"legend-offer-years\" ) { const form = e.target.form; ui.legendOffer = { id: form.dataset.id, role: form.elements.role.value, years: Number(form.elements.years.value), }; openModal( legendDetailModal(getState(), form.dataset.id, ui.legendOffer), true, ); return; } if (e.target.id === \"pause-matches\") await apply( (s) => (s.preferences.pauseMatches = e.target.checked), \"تم حفظ إعداد المحاكاة.\", ); if (e.target.id === \"theme-select\") { applyThemePref(e.target.value); return; } if (e.target.id === \"font-size\") { try { localStorage.setItem(\"clubowner.fontsize\", e.target.value); } catch {} document.documentElement.dataset.fontsize = e.target.value === \"large\" ? \"large\" : \"normal\"; return; } if (e.target.id === \"display-currency\") { setDisplayCurrency(e.target.value); render(); toast( tr( \"تم تحويل المبالغ المعروضة إلى العملة المختارة.\", \"Displayed amounts now use the selected currency.\", \"Les montants affichés utilisent la devise sélectionnée.\", ), ); return; } if (e.target.id === \"auto-report\") await apply( (s) => (s.preferences.autoMatchReport = e.target.checked), tr(\"تم حفظ الإعداد.\", \"Setting saved.\", \"Réglage enregistré.\"), ); if (e.target.id === \"reduce-motion\") await apply( (s) => (s.preferences.reduceMotion = e.target.checked), tr(\"تم حفظ إعداد العرض.\", \"Display setting saved.\", \"Réglage d": [
    "Black files 100",
    "Dossiers noirs 100",
  ],
  ", ].map((x) => x.value); const s = createGame({ clubId: ui.setupClub, owner, leagues, ...ui.setupConfig, language: getLanguage(), }); await saveGame(s); setState(s); ui.route = \"dashboard\"; render(); window.scrollTo(0, 0); toast(\"أهلًا بيك. مشروعك بدأ، والحفظ التلقائي شغال.\"); }, advance: async () => runTime(false), resume: async () => runTime(true), \"match-report\": async (el) => { const s = getState(); const f = playedOwnFixtures(s).find((x) => x.id === el.dataset.id); if (f) openModal(matchReportModal(s, reportFor(s, f))); }, \"palette-open\": () => openPalette(), \"palette-close\": () => closePalette(), \"palette-select\": (el) => paletteActivate(Number(el.dataset.idx) || 0), \"copy-email\": async () => { try { await navigator.clipboard.writeText(\"Madabeh777@gmail.com\"); toast( tr( \"تم نسخ البريد الإلكتروني.\", \"Email address copied.\", \"E-mail copié.\", ), ); } catch { toast(\"Madabeh777@gmail.com\"); } }, \"wipe-data\": async () => openModal( `<h2>${tr(\"مسح كل البيانات المحلية؟\", \"Wipe all local data?\", \"Effacer toutes les données locales ?\")}</h2><p class=\"muted\">${tr(\"سيُحذف من هذا المتصفح نهائيًا: الحفظة النشطة، كل خانات الحفظ، والنسخ الاحتياطية. لا يمكن التراجع عن هذه الخطوة.\", \"Permanently deleted from this browser: the active save, every save slot, and backups. This cannot be undone.\", \"Suppression définitive sur ce navigateur : sauvegarde active, tous les emplacements et copies. Irréversible.\")}</p><div class=\"modal-actions\">${button(tr(\"مسح نهائي الآن\", \"Wipe everything now\", \"Tout effacer\"), \"wipe-data-confirm\", \"\", \"danger\")}${button(tr(\"إلغاء\", \"Cancel\", \"Annuler\"), \"close-modal\", \"\", \"secondary\")}</div>`, ), \"wipe-data-confirm\": async () => { document.body.classList.add(\"saving-game\"); try { const dbs = [\"clubowner.world.saves\", \"clubowner.slots\"]; await Promise.all( dbs.map( (name) => new Promise((resolve) => { if (!globalThis.indexedDB) return resolve(); const r = indexedDB.deleteDatabase(name); r.onsuccess = r.onerror = r.onblocked = () => resolve(); }), ), ); for (const key of Object.keys(localStorage)) if (key.startsWith(\"clubowner\")) localStorage.removeItem(key); } catch (e) { document.body.classList.remove(\"saving-game\"); showError(e.message); return; } location.reload(); }, \"onboarding-dismiss\": () => { hideOnboarding(getState()); render(); }, \"slot-save\": async () => { const s = getState(); if (!s) return; const name = document.getElementById(\"slot-name\")?.value || \"\"; document.body.classList.add(\"saving-game\"); try { await writeSlot(s, name); toast(\"تم حفظ الخانة بمعزل عن الحفظة النشطة.\"); } catch (e) { showError(e.message); } finally { document.body.classList.remove(\"saving-game\"); } render(); }, \"slot-load\": async (el) => { const meta = listSlots().find((x) => x.id === el.dataset.id); if (!meta) return; openModal( `<h2>${tr(`تحميل خانة «${meta.name}»؟`, `Load slot “${meta.name}”?`, `Charger l": [
    "Black files 101",
    "Dossiers noirs 101",
  ],
  ", `خطف ${p.name} — قيمة مخفضة`, uid(s": [
    "Black files 102",
    "Dossiers noirs 102",
  ],
  ", `خطف ${p.name} — قيمة مخفضة`, uid(s,": [
    "Black files 103",
    "Dossiers noirs 103",
  ],
  ", `سمعة: ${num(s.reputation)}`": [
    "Black files 104",
    "Dossiers noirs 104",
  ],
  ", `سمعة: ${num(s.reputation)}`,": [
    "Black files 105",
    "Dossiers noirs 105",
  ],
  ", `عمولة وكيل ${p.name}`, n.id +": [
    "Black files 106",
    "Dossiers noirs 106",
  ],
  ", `كسر شرط جزائي: ${p.name}`, uid(s": [
    "Black files 107",
    "Dossiers noirs 107",
  ],
  ", `كسر شرط جزائي: ${p.name}`, uid(s,": [
    "Black files 108",
    "Dossiers noirs 108",
  ],
  ", `مكافأة تجديد ${p.name}`, uid(s": [
    "Black files 109",
    "Dossiers noirs 109",
  ],
  ", `مكافأة تجديد ${p.name}`, uid(s,": [
    "Black files 110",
    "Dossiers noirs 110",
  ],
  ", `مكافأة توقيع ${p.name}`, n.id +": [
    "Black files 111",
    "Dossiers noirs 111",
  ],
  ", body: `تبرعت ${amount} — انخفضت الشبهات ${reduction.toFixed(1)}%.`, category": [
    "Black files 112",
    "Dossiers noirs 112",
  ],
  ", clausePaid: false, }; s.negotiations.push(neg); return neg; } // أندية AI تكسر شروط لاعبي اللاعب أيضًا (كاش فوري + غضب جماهيري + أحداث) export function aiBreakReleaseClauses(s) { if (!s.expansion) return 0; if (!s.date.endsWith": [
    "Black files 113",
    "Dossiers noirs 113",
  ],
  ", deadline: addDays(s.date, 10), }); // ربط باللائحة: بند لا فضائح يُسقط بند الثقة تلقائيًا const b = ensureBoard(s); if (b) { b.confidence = clamp(b.confidence - 20 - bf.scandalCount * 3, 0, 100); b.failureStreak += 1; // إذا كانت لائحة نشطة، نضع علامة فشل فوري على بند لا فضائح if (b.mandate?.items?.some((it) => it.kind ===": [
    "Black files 114",
    "Dossiers noirs 114",
  ],
  ", description: `قسط شراء ${p.name}`, key: n.id +": [
    "Black files 115",
    "Dossiers noirs 115",
  ],
  ", false);\n    // افتح عقد اللاعب عبر التفاوض الأخير\n    const s = getState();\n    const last = [...s.negotiations].reverse().find((n) => n.playerId === playerId && n.stage ===": [
    "Black files 116",
    "Dossiers noirs 116",
  ],
  ", false); // افتح عقد اللاعب عبر التفاوض الأخير const s = getState(); const last = [...s.negotiations].reverse().find((n) => n.playerId === playerId && n.stage ===": [
    "Black files 117",
    "Dossiers noirs 117",
  ],
  ", more: async () => openModal( `<h2>إدارة النادي</h2>${NAV_GROUPS.map( (g) => `<div class=": [
    "Black files 118",
    "Dossiers noirs 118",
  ],
  ", mult: 2.2, salaryFactor: 1.30 },\n];\n\nexport function clauseLevelForValue(base, value) {\n  if (!value || value <= 0) return CLAUSE_LEVELS[0];\n  const ratio = base > 0 ? value / base : 1;\n  if (ratio <= 0.7) return CLAUSE_LEVELS[1];\n  if (ratio <= 1.3) return CLAUSE_LEVELS[2];\n  if (ratio <= 1.9) return CLAUSE_LEVELS[3];\n  return CLAUSE_LEVELS[4];\n}\n\nexport function salaryFactorForClauseLevel(levelId) {\n  const lvl = CLAUSE_LEVELS.find((l) => l.id === levelId);\n  return lvl ? lvl.salaryFactor : 1;\n}\n\nexport function clauseValueForLevel(base, levelId) {\n  const lvl = CLAUSE_LEVELS.find((l) => l.id === levelId);\n  if (!lvl) return base;\n  if (lvl.mult === 0) return 0;\n  return Math.round(base * lvl.mult);\n}\n\n// يضمن وجود شرط جزائي لكل لاعب نشط (للحفظات القديمة)\nexport function ensureReleaseClause(s) {\n  if (!s?.players) return;\n  for (const p of s.players) {\n    if (p.status ===": [
    "Black files 119",
    "Dossiers noirs 119",
  ],
  ", mult: 2.2, salaryFactor: 1.30 }, ]; export function clauseLevelForValue(base, value) { if (!value || value <= 0) return CLAUSE_LEVELS[0]; const ratio = base > 0 ? value / base : 1; if (ratio <= 0.7) return CLAUSE_LEVELS[1]; if (ratio <= 1.3) return CLAUSE_LEVELS[2]; if (ratio <= 1.9) return CLAUSE_LEVELS[3]; return CLAUSE_LEVELS[4]; } export function salaryFactorForClauseLevel(levelId) { const lvl = CLAUSE_LEVELS.find((l) => l.id === levelId); return lvl ? lvl.salaryFactor : 1; } export function clauseValueForLevel(base, levelId) { const lvl = CLAUSE_LEVELS.find((l) => l.id === levelId); if (!lvl) return base; if (lvl.mult === 0) return 0; return Math.round(base * lvl.mult); } // يضمن وجود شرط جزائي لكل لاعب نشط (للحفظات القديمة) export function ensureReleaseClause(s) { if (!s?.players) return; for (const p of s.players) { if (p.status ===": [
    "Black files 120",
    "Dossiers noirs 120",
  ],
  ", sel: 0, items: [] },\n};\nlet pendingImport = null;\nlet actionBusy = false;\nlet lastRenderedRoute = null;\n// الثيم: تفضيل متصفح (مثل اللغة) يُطبق فورًا ويُحفظ خارج الحفظة.\nconst resolveTheme = (pref) =>\n  pref ===": [
    "Black files 121",
    "Dossiers noirs 121",
  ],
  ", sel: 0, items: [] }, }; let pendingImport = null; let actionBusy = false; let lastRenderedRoute = null; // الثيم: تفضيل متصفح (مثل اللغة) يُطبق فورًا ويُحفظ خارج الحفظة. const resolveTheme = (pref) => pref ===": [
    "Black files 122",
    "Dossiers noirs 122",
  ],
  ", { d: cooldownUntil }));\n  }\n  // فاصل عام بين أي عمليتين\n  if (bf.lastOperationDate) {\n    const minDate = addDays(bf.lastOperationDate, op.minInterval);\n    if (s.date < minDate) {\n      throw new Error(blackTextAr": [
    "Black files 123",
    "Dossiers noirs 123",
  ],
  ", { d: cooldownUntil }));\n  }\n  // فاصل عام بين أي عمليتين\n  if (bf.lastOperationDate) {\n    const minDate = addDays(bf.lastOperationDate, op.minInterval);\n    if (s.date < minDate) {\n      throw new Error(blackTextAr(": [
    "Black files 124",
    "Dossiers noirs 124",
  ],
  ", { d: cooldownUntil })); } // فاصل عام بين أي عمليتين if (bf.lastOperationDate) { const minDate = addDays(bf.lastOperationDate, op.minInterval); if (s.date < minDate) { throw new Error(blackTextAr": [
    "Black files 125",
    "Dossiers noirs 125",
  ],
  ", { d: minDate }));\n    }\n  }\n  return true;\n}\n\n// تنفيذ عملية قذرة\nexport function doOperation(s, opId, params = {}) {\n  const bf = ensureBlackFiles(s);\n  const op = OPERATIONS[opId];\n  assert(op": [
    "Black files 126",
    "Dossiers noirs 126",
  ],
  ", { d: minDate }));\n    }\n  }\n  return true;\n}\n\n// تنفيذ عملية قذرة\nexport function doOperation(s, opId, params = {}) {\n  const bf = ensureBlackFiles(s);\n  const op = OPERATIONS[opId];\n  assert(op,": [
    "Black files 127",
    "Dossiers noirs 127",
  ],
  ", { d: minDate })); } } return true; } // تنفيذ عملية قذرة export function doOperation(s, opId, params = {}) { const bf = ensureBlackFiles(s); const op = OPERATIONS[opId]; assert(op": [
    "Black files 128",
    "Dossiers noirs 128",
  ],
  ", { d: minDate })); } } return true; } // تنفيذ عملية قذرة export function doOperation(s, opId, params = {}) { const bf = ensureBlackFiles(s); const op = OPERATIONS[opId]; assert(op,": [
    "Black files 129",
    "Dossiers noirs 129",
  ],
  ", }); // فشل خاص لخطف لاعب: غرامة + منع قيد if (opId ===": [
    "Black files 130",
    "Dossiers noirs 130",
  ],
  ", }); return bf.suspicion; } export function triggerScandal(s) { const bf = ensureBlackFiles(s); if (bf.suspicion < 100) return null; // خصم 3-9 نقاط const pointsDeduction = 3 + Math.floor(random(s) * 7); const ownRow = s.table?.find((t) => t.clubId === s.clubId); if (ownRow) ownRow.points = Math.max(0, ownRow.points - pointsDeduction); // غرامات ضخمة 15-35M const fine = 15000000 + Math.floor(random(s) * 20000000); post(s, -fine": [
    "Black files 131",
    "Dossiers noirs 131",
  ],
  ", }); return bf.suspicion; } export function triggerScandal(s) { const bf = ensureBlackFiles(s); if (bf.suspicion < 100) return null; // خصم 3-9 نقاط const pointsDeduction = 3 + Math.floor(random(s) * 7); const ownRow = s.table?.find((t) => t.clubId === s.clubId); if (ownRow) ownRow.points = Math.max(0, ownRow.points - pointsDeduction); // غرامات ضخمة 15-35M const fine = 15000000 + Math.floor(random(s) * 20000000); post(s, -fine,": [
    "Black files 132",
    "Dossiers noirs 132",
  ],
  ", }); return ev; } // توليد لاعب داخل عالم اللعبة: ناشئ أكاديمية (السلوك الأصلي) أو صفقة معلومة الشروط. // كل الأسماء مولّدة ومعلَمة `fictional: true` — لا يُستدعى لاعب حقيقي من الحزم. function addGeneratedPlayer(s, opts = {}) { const youth = Boolean(opts.youth); const serial = youth ? s.academyCount++ : ++s.academyCount; const labelAr = opts.labelAr ||": [
    "Black files 133",
    "Dossiers noirs 133",
  ],
  ", }); return ev; } // ── أخبار النكهة ─────────────────────────────────────────────────────────── // خبر قصير يدخل البريد كرسالة «للعلم»: لا `required`، فلا توقيف للزمن، ولا قرار. // الأثر — إن وُجد — صغير ومعلن، ويُنفَّذ مرة واحدة بمفتاح دفتر مرتبط بالرسالة. export function flavorEventDay(s) { if (daysBetween(s.startDate, s.date) < FLAVOR_MIN_CAREER_DAYS) return null; const log = flavorLog(s); const last = s.inbox.find((m) => m.kind ===": [
    "Black files 134",
    "Dossiers noirs 134",
  ],
  ", }); } return { success: false, heat: op.heat * 0.6 }; } // نجاح addSuspicion(s, op.heat); if (opId ===": [
    "Black files 135",
    "Dossiers noirs 135",
  ],
  ", }); } } return { pointsDeduction, fine, fanDrop, banDays, titleStripped: Boolean(isLeader), }; } export function blackFilesDay(s) { const bf = ensureBlackFiles(s); if (!bf) return; // مرور الوقت ينزل الشبهات 0.12 يوميًا if (bf.suspicion > 0) { bf.suspicion = clamp(bf.suspicion - 0.12, 0, 100); } // وكيل على المرتب: heat مستمر صغير 0.15 يوميًا + راتب شهري if (bf.active.agentOnPayroll) { bf.suspicion = clamp(bf.suspicion + 0.15, 0, 100); if (s.date.endsWith": [
    "Black files 136",
    "Dossiers noirs 136",
  ],
  ", }, // ── اجتماع منتصف الموسم ─────────────────────────────────────────────────── midMeetingGoodTitle: { ar": [
    "Black files 137",
    "Dossiers noirs 137",
  ],
  ", }, // ── التجميد في سوق الانتقالات ───────────────────────────────────────────── freezeBlocked: { ar": [
    "Black files 138",
    "Dossiers noirs 138",
  ],
  ", }, // ── التصويت النهائي ─────────────────────────────────────────────────────── endMeetingPassedTitle: { ar": [
    "Black files 139",
    "Dossiers noirs 139",
  ],
  ", }, // ── العواقب والمكافآت ───────────────────────────────────────────────────── cRewardInvestors: { ar": [
    "Black files 140",
    "Dossiers noirs 140",
  ],
  ", }, // ── المحاور ─────────────────────────────────────────────────────────────── axisSporting: { ar": [
    "Black files 141",
    "Dossiers noirs 141",
  ],
  ", }, // ── بداية الموسم ────────────────────────────────────────────────────────── mandateIssuedTitle: { ar": [
    "Black files 142",
    "Dossiers noirs 142",
  ],
  ", }, // ── بطاقة اللوحة وبريد اللائحة ──────────────────────────────────────────── boardCardTitle: { ar": [
    "Black files 143",
    "Dossiers noirs 143",
  ],
  ", }, // ── بنود اللائحة (١٠ أنواع) ──────────────────────────────────────────────── itemLeagueRank: { ar": [
    "Black files 144",
    "Dossiers noirs 144",
  ],
  ", }, }; // يملأ عناصر الاستبدال {v}/{n}/{d} بـ vars. أي مفتاح ناقص يبقى كما هو (ظهور واضح للخلل). export const fillBoardText = (template, vars = {}) => String(template).replace(/\\{(\\w+)\\}/g, (m, k) => vars[k] === undefined || vars[k] === null ? m : String(vars[k]), ); // نص جاهز للغة الواجهة الحالية — تستخدمه الشاشات (يُترجم قبل الحقن في DOM). export const boardTextFor = (key, vars, language) => { const entry = BOARD_TEXTS[key]; if (!entry) return key; const code = language ===": [
    "Black files 145",
    "Dossiers noirs 145",
  ],
  ", }, }; export function initBlackFiles(s) { s.blackFiles = { suspicion: 0, permanentRepPenalty: 0, lastOperationDate: null, lastOperationType: null, cooldowns: {}, active: { refereeBias: null, bribedOpponent: null, mediaWar: null, agentOnPayroll: false, agentSince: null, }, transferBanUntil: null, scandalCount: 0, history: [], titleStripped: false, pendingAiBreaks: [], charityTotal: 0, }; return s.blackFiles; } export const ensureBlackFiles = (s) => s.blackFiles || initBlackFiles(s); export function suspicionLevel(s) { const v = ensureBlackFiles(s).suspicion; if (v >= 100) return 4; if (v >= 85) return 3; if (v >= 60) return 2; if (v >= 30) return 1; return 0; } export function addSuspicion(s, amount) { const bf = ensureBlackFiles(s); const before = bf.suspicion; bf.suspicion = clamp(bf.suspicion + amount, 0, 100); const after = bf.suspicion; // إشعارات عبور العتبات if (before < 30 && after >= 30) { message(s, { title: blackTextAr": [
    "Black files 146",
    "Dossiers noirs 146",
  ],
  ". الآثار سُجلت في الحسابات وحالة النادي": [
    "Black files 147",
    "Dossiers noirs 147",
  ],
  ". الآثار سُجلت في الحسابات وحالة النادي.": [
    "Black files 148",
    "Dossiers noirs 148",
  ],
  ".innerHTML =\n      `<div><span>المطلوب من الخزينة الآن</span><strong class=": [
    "Black files 149",
    "Dossiers noirs 149",
  ],
  ".innerHTML =\n      `<div><span>المقدم عند التوقيع</span><strong>${money(Math.round((fee * percent) / 100))} ${cur()}</strong></div><div><span>باقي قيمة الانتقال</span><strong>${money(fee - Math.round((fee * percent) / 100))} ${cur()}</strong></div><small>لم يتم الخصم. لا يشمل المبلغ عقد اللاعب أو الوكيل.</small>`;\n  }\n  if (contract) {\n    const salary = Number(contract.elements.salary.value),\n      bonus = Number(contract.elements.bonus.value),\n      years = Number(contract.elements.years.value),\n      renew = contract.dataset.renew ===": [
    "Black files 150",
    "Dossiers noirs 150",
  ],
  ": async () =>\n    openModal(\n      `<h2>تبدأ حكاية جديدة؟</h2><p class=": [
    "Black files 151",
    "Dossiers noirs 151",
  ],
  ": async () => {\n    const s = getState(),\n      prices = categoryPrices(s);\n    openModal(\n      `<h2>تسعير تذاكر المباريات</h2><p class=": [
    "Black files 152",
    "Dossiers noirs 152",
  ],
  ": async (el) =>\n    openModal(\n      `<h2>إنهاء العقد</h2><p>تعويض الإنهاء: شهران من المرتب.</p><strong>${money(getState().staff.find((p) => p.id === el.dataset.id).salary * 2)} ${cur()}</strong><div class=": [
    "Black files 153",
    "Dossiers noirs 153",
  ],
  ": async (el) =>\n    openModal(\n      `<h2>دورة تطوير</h2><p>${tr": [
    "Black files 154",
    "Dossiers noirs 154",
  ],
  ": async (el) =>\n    openModal(\n      `<h2>دورة تطوير</h2><p>${tr(": [
    "Black files 155",
    "Dossiers noirs 155",
  ],
  ": async (el) => {\n    const meta = listSlots().find((x) => x.id === el.dataset.id);\n    if (!meta) return;\n    openModal(\n      `<h2>${tr(`تحميل خانة «${meta.name}»؟`, `Load slot “${meta.name}”?`, `Charger l'emplacement « ${meta.name} » ?`)}</h2><p class=": [
    "Black files 156",
    "Dossiers noirs 156",
  ],
  ";\n\n  // سحب لقب الموسم الحالي إن وجد — إذا كنت متصدرًا\n  const isLeader = ownRow && s.table?.every((t) => t.clubId === s.clubId || t.points <= ownRow.points);\n  if (isLeader) bf.titleStripped = true;\n\n  // هروب راعٍ\n  const activeSponsors = s.sponsors.filter((c) => c.status ===": [
    "Black files 157",
    "Dossiers noirs 157",
  ],
  ";\n\n// 0.25 «نظام الأحداث الموسّع» — طبقتان بإيقاعين مختلفين:\n//\n//   ١) قرارات: حدث مهم كل `difficulty.eventInterval` يومًا (١٢–٢٨ حسب الصعوبة)،\n//      ورسالة `required: true` توقف الزمن حتى تحسمها — هذا هو «ضابط الإزعاج» الأصلي.\n//   ٢) نكهة: خبر قصير كل ٣ أيام على الأكثر، `required: false`، فلا يوقف الزمن أبدًا،\n//      وأثره صغير ومعلن أو بلا أثر.\n//\n// لا يُعرض حدث إلا إذا تحققت بوابته `when(s)` على الحفظ الحالي، ولا يتكرر حدث\n// ظهر مؤخرًا. إن لم يوجد حدث ممكن اليوم لا نُجبر شيئًا: نُعيد المحاولة لاحقًا.\nconst gate = (event, s) =>\n  typeof event.when ===": [
    "Black files 158",
    "Dossiers noirs 158",
  ],
  ";\n\nexport const RELEASE_RANGES = {\n  low: { maxRating: 69, min: 2000000, max: 5000000 },\n  midLow: { maxRating: 74, min: 5000000, max: 12000000 },\n  mid: { maxRating: 79, min: 12000000, max: 30000000 },\n  midHigh: { maxRating: 84, min: 30000000, max: 80000000 },\n  high: { maxRating: 100, min: 80000000, max: 150000000 },\n};\n\nexport function baseRangeForRating(rating) {\n  const r = Math.round(rating);\n  if (r < 70) return RELEASE_RANGES.low;\n  if (r <= 74) return RELEASE_RANGES.midLow;\n  if (r <= 79) return RELEASE_RANGES.mid;\n  if (r <= 84) return RELEASE_RANGES.midHigh;\n  return RELEASE_RANGES.high;\n}\n\n// قيمة أساسية عشوائية داخل النطاق، حتمية عبر random(s) إن وجد.\nexport function baseReleaseValue(rating, rnd = Math.random()) {\n  const range = baseRangeForRating(rating);\n  const span = range.max - range.min;\n  return Math.round(range.min + span * rnd);\n}\n\n// هل النادي إسباني؟ — عبر league أو عبر قائمة أندية الليجا\nconst SPANISH_CLUBS = new Set([": [
    "Black files 159",
    "Dossiers noirs 159",
  ],
  ";\n        // إذا اختار مستوى، نستخدم القيمة المحسوبة من المستوى إن لم يعدلها يدويًا بشكل كبير\n        const selectedOption = form.elements.clauseLevel.selectedOptions[0];\n        const levelClause = Number(selectedOption?.dataset?.clause || 0);\n        if (levelClause === 0) releaseClause = 0;\n        else if (Math.abs(releaseClause - levelClause) < levelClause * 0.5) releaseClause = levelClause;\n      }\n      const terms = {\n        salary: Number(form.elements.salary.value),\n        years: Number(form.elements.years.value),\n        bonus: Number(form.elements.bonus.value),\n        role: form.elements.role.value,\n        appearanceBonus: Number(form.elements.appearanceBonus.value),\n        goalBonus: Number(form.elements.goalBonus.value),\n        annualRaisePct: Number(form.elements.annualRaisePct.value),\n        releaseClause,\n        clauseLevel,\n      };\n      await apply(\n        (s) =>\n          form.dataset.renew ===": [
    "Black files 160",
    "Dossiers noirs 160",
  ],
  ";\n    // تحليل الشبهات من النص\n    if (note.includes": [
    "Black files 161",
    "Dossiers noirs 161",
  ],
  ";\n    // تحليل الشبهات من النص\n    if (note.includes(": [
    "Black files 162",
    "Dossiers noirs 162",
  ],
  ";\n    if (esDivisions?.some((d) => d.clubs.includes(player.clubId))) return true;\n  }\n  return false;\n}\n\nexport function contractYearsLeft(player, currentDate) {\n  if (!player?.contractEnd || !currentDate) return 2;\n  const days = daysBetween(currentDate, player.contractEnd);\n  return Math.max(0, days / 365);\n}\n\n// المضاعفات حسب المواصفات\nexport function releaseMultipliers(player, currentDate, spanish = false) {\n  let mult = 1;\n  const reasons = [];\n  if (player.age < 21) {\n    mult *= 1.5;\n    reasons.push": [
    "Black files 163",
    "Dossiers noirs 163",
  ],
  ";\n    input.focus();\n    input.setSelectionRange(pos, pos);\n  }\n});\n// اختصارات البحث السريع: Ctrl/⌘+K للفتح والإغلاق، والأسهم وEnter للتنقل داخل النتائج.\ndocument.addEventListener": [
    "Black files 164",
    "Dossiers noirs 164",
  ],
  ";\n    m.read = true;\n  }\n  message(s, {\n    title: `تجديد عقد ${p.name}`,\n    body": [
    "Black files 165",
    "Dossiers noirs 165",
  ],
  ";\n    m.read = true;\n  }\n  message(s, {\n    title: `تجديد عقد ${p.name}`,\n    body:": [
    "Black files 166",
    "Dossiers noirs 166",
  ],
  ";\n    render();\n  },\n  // 0.26: من البريد إلى لائحة الجمعية العمومية، ويُعلَّم بند الأونبوردنج تلقائيًا": [
    "Black files 167",
    "Dossiers noirs 167",
  ],
  ";\n    render();\n  },\n  // 0.26: من البريد إلى لائحة الجمعية العمومية، ويُعلَّم بند الأونبوردنج تلقائيًا.": [
    "Black files 168",
    "Dossiers noirs 168",
  ],
  ";\n    return result;\n  });\n  // 0.24: شاشة لقطات الماتش أولاً، ثم تقرير الماتش الكامل.\n  const s = getState();\n  if (s && s.preferences?.autoMatchReport !== false) {\n    const fresh = playedOwnFixtures(s).filter((f) => !playedBefore.has(f.id));\n    if (fresh.length) {\n      const r = reportFor(s, fresh[fresh.length - 1]);\n      showHighlightsScreen(s, r, () => {\n        openModal(matchReportModal(s, r));\n      });\n    }\n  }\n  if (r.blocked) {\n    ui.route =": [
    "Black files 169",
    "Dossiers noirs 169",
  ],
  ";\n    setState(state);\n    setLanguage(state.preferences?.language || getLanguage());\n    closeModal();\n    // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة.\n    location.reload();\n  },": [
    "Black files 170",
    "Dossiers noirs 170",
  ],
  ";\n    ui.message = pendingActions(getState())[0]?.id;\n    render();\n    toast(\n      r.advanced\n        ? `تقدمنا ${num(r.advanced)} أيام. الوقت متوقف لقرارك.`\n        ": [
    "Black files 171",
    "Dossiers noirs 171",
  ],
  ";\n    ui.message = pendingActions(getState())[0]?.id;\n    render();\n    toast(\n      r.advanced\n        ? `تقدمنا ${num(r.advanced)} أيام. الوقت متوقف لقرارك.`\n        :": [
    "Black files 172",
    "Dossiers noirs 172",
  ],
  ";\n  canDoOperation(s, opId);\n  // خصم التكلفة\n  const key = uid(s,": [
    "Black files 173",
    "Dossiers noirs 173",
  ],
  ";\n  closeThread(s, id);\n  const p = s.players.find((x) => x.id === n.playerId);\n  message(s, {\n    title: `شروط عقد ${p.name}`,\n    body": [
    "Black files 174",
    "Dossiers noirs 174",
  ],
  ";\n  closeThread(s, id);\n  const p = s.players.find((x) => x.id === n.playerId);\n  message(s, {\n    title: `شروط عقد ${p.name}`,\n    body:": [
    "Black files 175",
    "Dossiers noirs 175",
  ],
  ";\n  if (last && daysBetween(last.date, s.date) < FLAVOR_GAP_DAYS) return null;\n  const shown = new Set(log.map((m) => m.ref));\n  const open = FLAVOR_CATALOG.filter((e) => gate(e, s) && !shown.has(flavorRef(e.id)));\n  if (!open.length) return null;\n  // توزيع الفئات: لا نضع فئتين متتاليتين من النوع نفسه ما دام هناك بديل.\n  const lastCategory = last?.flavorCategory;\n  const varied = lastCategory\n    ? open.filter((e) => e.category !== lastCategory)\n    : open;\n  const data = pick(s, varied.length ? varied : open);\n  const m = message(s, {\n    title: data.title,\n    body: data.body,\n    category:": [
    "Black files 176",
    "Dossiers noirs 176",
  ],
  ";\n  message(s, {\n    title:\n      n.fee >= p.value * 0.93 * difficulty(s).transfer\n        ? `قبول مبدئي لعرض ${p.name}`\n        : `عرض مضاد: ${p.name}`,\n    body:\n      n.fee >= p.value * 0.93 * difficulty(s).transfer\n        ?": [
    "Black files 177",
    "Dossiers noirs 177",
  ],
  ";\n  n.signed = s.date;\n  n.total =\n    total +\n    rest +\n    guaranteedWages(terms.salary, terms.years, clauses.annualRaisePct);\n  closeThread(s, id);\n  message(s, {\n    title: `${p.name} ينضم إلى النادي`,\n    body": [
    "Black files 178",
    "Dossiers noirs 178",
  ],
  ";\n  n.signed = s.date;\n  n.total =\n    total +\n    rest +\n    guaranteedWages(terms.salary, terms.years, clauses.annualRaisePct);\n  closeThread(s, id);\n  message(s, {\n    title: `${p.name} ينضم إلى النادي`,\n    body:": [
    "Black files 179",
    "Dossiers noirs 179",
  ],
  ";\n  return fillBoardText(entry[code] ?? entry.ar, vars);\n};\n\n// نص عربي للادخار داخل الحفظة: البريد والرسائل تُخزَّن بالعربية دائمًا\n// (الحفظة لا تتغير بتغير اللغة) ثم يترجمها طبقة العرض عند الرسم.\nexport const boardTextAr = (key, vars) => boardTextFor(key, vars": [
    "Black files 180",
    "Dossiers noirs 180",
  ],
  ";\n  return fillBoardText(entry[code] ?? entry.ar, vars);\n};\n\n// نص عربي للادخار داخل الحفظة: البريد والرسائل تُخزَّن بالعربية دائمًا\n// (الحفظة لا تتغير بتغير اللغة) ثم يترجمها طبقة العرض عند الرسم.\nexport const boardTextAr = (key, vars) => boardTextFor(key, vars,": [
    "Black files 181",
    "Dossiers noirs 181",
  ],
  ";\n  return s;\n}\n\n// 0.28 (save v22): الملفات السوداء والشرط الجزائي.\n// الحفظة القديمة تبدأ بنظافة كاملة وشرط جزائي متدرج لكل لاعب نشط.\nfunction migrateToTwentyTwo(input) {\n  if (!input || input.version !== 21) return input;\n  const old = migrateToTwentyOne(input);\n  if (old?.version !== 21) return old;\n  const s = structuredClone(old);\n  s.version = 22;\n  s.blackFiles ??= {\n    suspicion: 0,\n    permanentRepPenalty: 0,\n    lastOperationDate: null,\n    lastOperationType: null,\n    cooldowns: {},\n    active: {\n      refereeBias: null,\n      bribedOpponent: null,\n      mediaWar: null,\n      agentOnPayroll: false,\n      agentSince: null,\n    },\n    transferBanUntil: null,\n    scandalCount: 0,\n    history: [],\n    titleStripped: false,\n    pendingAiBreaks: [],\n    charityTotal: 0,\n  };\n  // شرط جزائي لكل لاعب نشط\n  for (const p of s.players) {\n    if (p.status ===": [
    "Black files 182",
    "Dossiers noirs 182",
  ],
  ";\n  }\n\n  // غضب جماهيري -15 إلى -25\n  const fanDrop = 15 + Math.floor(random(s) * 11);\n  s.fanSupport = clamp(s.fanSupport - fanDrop, 0, 100);\n\n  // منع قيد لفترة 90-180 يوم\n  const banDays = 90 + Math.floor(random(s) * 91);\n  bf.transferBanUntil = addDays(s.date, banDays);\n\n  // تصفير المؤشر مع عقوبة سمعة دائمة خفيفة -2\n  bf.suspicion = 0;\n  bf.scandalCount += 1;\n  s.reputation = clamp(s.reputation - 2, 0, 100);\n  bf.permanentRepPenalty += 2;\n\n  bf.history.push({\n    date: s.date,\n    points: pointsDeduction,\n    fine,\n    sponsor: sponsorOut?.id || null,\n    fanDrop,\n    banDays,\n    titleStripped: Boolean(isLeader),\n  });\n\n  message(s, {\n    title: blackTextAr": [
    "Black files 183",
    "Dossiers noirs 183",
  ],
  ";\n  }\n  return { mult, reasons, years };\n}\n\n// الحساب الكامل: قيمة نهائية بعد المضاعفات، مع سقف 150-300M+ لسوبرستار صغير\nexport function calculateReleaseClause(player, currentDate, rnd = Math.random(), s = null) {\n  // ~25% بلا شرط جزائي أصلًا\n  if (rnd < 0.25) return 0;\n  const baseRnd = typeof rnd ===": [
    "Black files 184",
    "Dossiers noirs 184",
  ],
  ";\n  } catch {}\n});\nfunction render() {\n  const s = getState();\n  if (s) {\n    // تفضيلات العرض تُطبق قبل بناء الشاشات: نمط الأرقام وتقليل الحركة.\n    setDigitsMode(s.preferences?.digits ===": [
    "Black files 185",
    "Dossiers noirs 185",
  ],
  "; // 0.25 «نظام الأحداث الموسّع» — طبقتان بإيقاعين مختلفين: // // ١) قرارات: حدث مهم كل `difficulty.eventInterval` يومًا (١٢–٢٨ حسب الصعوبة)، // ورسالة `required: true` توقف الزمن حتى تحسمها — هذا هو «ضابط الإزعاج» الأصلي. // ٢) نكهة: خبر قصير كل ٣ أيام على الأكثر، `required: false`، فلا يوقف الزمن أبدًا، // وأثره صغير ومعلن أو بلا أثر. // // لا يُعرض حدث إلا إذا تحققت بوابته `when(s)` على الحفظ الحالي، ولا يتكرر حدث // ظهر مؤخرًا. إن لم يوجد حدث ممكن اليوم لا نُجبر شيئًا: نُعيد المحاولة لاحقًا. const gate = (event, s) => typeof event.when ===": [
    "Black files 186",
    "Dossiers noirs 186",
  ],
  "; // إذا اختار مستوى، نستخدم القيمة المحسوبة من المستوى إن لم يعدلها يدويًا بشكل كبير const selectedOption = form.elements.clauseLevel.selectedOptions[0]; const levelClause = Number(selectedOption?.dataset?.clause || 0); if (levelClause === 0) releaseClause = 0; else if (Math.abs(releaseClause - levelClause) < levelClause * 0.5) releaseClause = levelClause; } const terms = { salary: Number(form.elements.salary.value), years: Number(form.elements.years.value), bonus: Number(form.elements.bonus.value), role: form.elements.role.value, appearanceBonus: Number(form.elements.appearanceBonus.value), goalBonus: Number(form.elements.goalBonus.value), annualRaisePct: Number(form.elements.annualRaisePct.value), releaseClause, clauseLevel, }; await apply( (s) => form.dataset.renew ===": [
    "Black files 187",
    "Dossiers noirs 187",
  ],
  "; // تحليل الشبهات من النص if (note.includes": [
    "Black files 188",
    "Dossiers noirs 188",
  ],
  "; // سحب لقب الموسم الحالي إن وجد — إذا كنت متصدرًا const isLeader = ownRow && s.table?.every((t) => t.clubId === s.clubId || t.points <= ownRow.points); if (isLeader) bf.titleStripped = true; // هروب راعٍ const activeSponsors = s.sponsors.filter((c) => c.status ===": [
    "Black files 189",
    "Dossiers noirs 189",
  ],
  "; canDoOperation(s, opId); // خصم التكلفة const key = uid(s": [
    "Black files 190",
    "Dossiers noirs 190",
  ],
  "; canDoOperation(s, opId); // خصم التكلفة const key = uid(s,": [
    "Black files 191",
    "Dossiers noirs 191",
  ],
  "; closeThread(s, id); const p = s.players.find((x) => x.id === n.playerId); message(s, { title: `شروط عقد ${p.name}`, body": [
    "Black files 192",
    "Dossiers noirs 192",
  ],
  "; export const RELEASE_RANGES = { low: { maxRating: 69, min: 2000000, max: 5000000 }, midLow: { maxRating: 74, min: 5000000, max: 12000000 }, mid: { maxRating: 79, min: 12000000, max: 30000000 }, midHigh: { maxRating: 84, min: 30000000, max: 80000000 }, high: { maxRating: 100, min: 80000000, max: 150000000 }, }; export function baseRangeForRating(rating) { const r = Math.round(rating); if (r < 70) return RELEASE_RANGES.low; if (r <= 74) return RELEASE_RANGES.midLow; if (r <= 79) return RELEASE_RANGES.mid; if (r <= 84) return RELEASE_RANGES.midHigh; return RELEASE_RANGES.high; } // قيمة أساسية عشوائية داخل النطاق، حتمية عبر random(s) إن وجد. export function baseReleaseValue(rating, rnd = Math.random()) { const range = baseRangeForRating(rating); const span = range.max - range.min; return Math.round(range.min + span * rnd); } // هل النادي إسباني؟ — عبر league أو عبر قائمة أندية الليجا const SPANISH_CLUBS = new Set([": [
    "Black files 193",
    "Dossiers noirs 193",
  ],
  "; if (esDivisions?.some((d) => d.clubs.includes(player.clubId))) return true; } return false; } export function contractYearsLeft(player, currentDate) { if (!player?.contractEnd || !currentDate) return 2; const days = daysBetween(currentDate, player.contractEnd); return Math.max(0, days / 365); } // المضاعفات حسب المواصفات export function releaseMultipliers(player, currentDate, spanish = false) { let mult = 1; const reasons = []; if (player.age < 21) { mult *= 1.5; reasons.push": [
    "Black files 194",
    "Dossiers noirs 194",
  ],
  "; if (last && daysBetween(last.date, s.date) < FLAVOR_GAP_DAYS) return null; const shown = new Set(log.map((m) => m.ref)); const open = FLAVOR_CATALOG.filter((e) => gate(e, s) && !shown.has(flavorRef(e.id))); if (!open.length) return null; // توزيع الفئات: لا نضع فئتين متتاليتين من النوع نفسه ما دام هناك بديل. const lastCategory = last?.flavorCategory; const varied = lastCategory ? open.filter((e) => e.category !== lastCategory) : open; const data = pick(s, varied.length ? varied : open); const m = message(s, { title: data.title, body: data.body, category": [
    "Black files 195",
    "Dossiers noirs 195",
  ],
  "; input.focus(); input.setSelectionRange(pos, pos); } }); // اختصارات البحث السريع: Ctrl/⌘+K للفتح والإغلاق، والأسهم وEnter للتنقل داخل النتائج. document.addEventListener": [
    "Black files 196",
    "Dossiers noirs 196",
  ],
  "; m.read = true; } message(s, { title: `تجديد عقد ${p.name}`, body": [
    "Black files 197",
    "Dossiers noirs 197",
  ],
  "; message(s, { title: n.fee >= p.value * 0.93 * difficulty(s).transfer ? `قبول مبدئي لعرض ${p.name}` : `عرض مضاد: ${p.name}`, body: n.fee >= p.value * 0.93 * difficulty(s).transfer ?": [
    "Black files 198",
    "Dossiers noirs 198",
  ],
  "; n.signed = s.date; n.total = total + rest + guaranteedWages(terms.salary, terms.years, clauses.annualRaisePct); closeThread(s, id); message(s, { title: `${p.name} ينضم إلى النادي`, body": [
    "Black files 199",
    "Dossiers noirs 199",
  ],
  "; render(); }, // 0.26: من البريد إلى لائحة الجمعية العمومية، ويُعلَّم بند الأونبوردنج تلقائيًا": [
    "Black files 200",
    "Dossiers noirs 200",
  ],
  "; return fillBoardText(entry[code] ?? entry.ar, vars); }; // نص عربي للادخار داخل الحفظة: البريد والرسائل تُخزَّن بالعربية دائمًا // (الحفظة لا تتغير بتغير اللغة) ثم يترجمها طبقة العرض عند الرسم. export const boardTextAr = (key, vars) => boardTextFor(key, vars": [
    "Black files 201",
    "Dossiers noirs 201",
  ],
  "; return fillBoardText(entry[code] ?? entry.ar, vars); }; // نص عربي للادخار داخل الحفظة: البريد والرسائل تُخزَّن بالعربية دائمًا // (الحفظة لا تتغير بتغير اللغة) ثم يترجمها طبقة العرض عند الرسم. export const boardTextAr = (key, vars) => boardTextFor(key, vars,": [
    "Black files 202",
    "Dossiers noirs 202",
  ],
  "; return result; }); // 0.24: شاشة لقطات الماتش أولاً، ثم تقرير الماتش الكامل. const s = getState(); if (s && s.preferences?.autoMatchReport !== false) { const fresh = playedOwnFixtures(s).filter((f) => !playedBefore.has(f.id)); if (fresh.length) { const r = reportFor(s, fresh[fresh.length - 1]); showHighlightsScreen(s, r, () => { openModal(matchReportModal(s, r)); }); } } if (r.blocked) { ui.route =": [
    "Black files 203",
    "Dossiers noirs 203",
  ],
  "; return s; } // 0.28 (save v22): الملفات السوداء والشرط الجزائي. // الحفظة القديمة تبدأ بنظافة كاملة وشرط جزائي متدرج لكل لاعب نشط. function migrateToTwentyTwo(input) { if (!input || input.version !== 21) return input; const old = migrateToTwentyOne(input); if (old?.version !== 21) return old; const s = structuredClone(old); s.version = 22; s.blackFiles ??= { suspicion: 0, permanentRepPenalty: 0, lastOperationDate: null, lastOperationType: null, cooldowns: {}, active: { refereeBias: null, bribedOpponent: null, mediaWar: null, agentOnPayroll: false, agentSince: null, }, transferBanUntil: null, scandalCount: 0, history: [], titleStripped: false, pendingAiBreaks: [], charityTotal: 0, }; // شرط جزائي لكل لاعب نشط for (const p of s.players) { if (p.status ===": [
    "Black files 204",
    "Dossiers noirs 204",
  ],
  "; setState(state); setLanguage(state.preferences?.language || getLanguage()); closeModal(); // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة. location.reload(); }": [
    "Black files 205",
    "Dossiers noirs 205",
  ],
  "; setState(state); setLanguage(state.preferences?.language || getLanguage()); closeModal(); // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة. location.reload(); },": [
    "Black files 206",
    "Dossiers noirs 206",
  ],
  "; ui.message = pendingActions(getState())[0]?.id; render(); toast( r.advanced ? `تقدمنا ${num(r.advanced)} أيام. الوقت متوقف لقرارك.`": [
    "Black files 207",
    "Dossiers noirs 207",
  ],
  "; } // غضب جماهيري -15 إلى -25 const fanDrop = 15 + Math.floor(random(s) * 11); s.fanSupport = clamp(s.fanSupport - fanDrop, 0, 100); // منع قيد لفترة 90-180 يوم const banDays = 90 + Math.floor(random(s) * 91); bf.transferBanUntil = addDays(s.date, banDays); // تصفير المؤشر مع عقوبة سمعة دائمة خفيفة -2 bf.suspicion = 0; bf.scandalCount += 1; s.reputation = clamp(s.reputation - 2, 0, 100); bf.permanentRepPenalty += 2; bf.history.push({ date: s.date, points: pointsDeduction, fine, sponsor: sponsorOut?.id || null, fanDrop, banDays, titleStripped: Boolean(isLeader), }); message(s, { title: blackTextAr": [
    "Black files 208",
    "Dossiers noirs 208",
  ],
  "; } catch {} }); function render() { const s = getState(); if (s) { // تفضيلات العرض تُطبق قبل بناء الشاشات: نمط الأرقام وتقليل الحركة. setDigitsMode(s.preferences?.digits ===": [
    "Black files 209",
    "Dossiers noirs 209",
  ],
  "; } return { mult, reasons, years }; } // الحساب الكامل: قيمة نهائية بعد المضاعفات، مع سقف 150-300M+ لسوبرستار صغير export function calculateReleaseClause(player, currentDate, rnd = Math.random(), s = null) { // ~25% بلا شرط جزائي أصلًا if (rnd < 0.25) return 0; const baseRnd = typeof rnd ===": [
    "Black files 210",
    "Dossiers noirs 210",
  ],
  ">\n                <strong>${s.metadata.clubName} · الموسم ${s.metadata.seasonNumber}</strong>\n                <small>${date(s.metadata.date)} · السيولة ${money(s.metadata.cash)} ${cur()} · ${s.metadata.device ||": [
    "Black files 211",
    "Dossiers noirs 211",
  ],
  ">\n            <h4>الحفظة المحلية الحالية</h4>\n            <div><span>النادي:</span><b>${diff?.local ? diff.local.clubName ": [
    "Black files 212",
    "Dossiers noirs 212",
  ],
  ">\n            <h4>الحفظة المحلية الحالية</h4>\n            <div><span>النادي:</span><b>${diff?.local ? diff.local.clubName :": [
    "Black files 213",
    "Dossiers noirs 213",
  ],
  ">\n            <h4>الحفظة على السحابة</h4>\n            <div><span>النادي:</span><b>${diff.cloud.clubName}</b></div>\n            <div><span>الموسم:</span><b>${diff.cloud.season}</b></div>\n            <div><span>التاريخ:</span><b>${date(diff.cloud.date)}</b></div>\n            <div><span>السيولة:</span><b>${money(diff.cloud.cash)} ${cur()}</b></div>\n            <div><span>الجهاز:</span><b>${diff.cloud.device ||": [
    "Black files 214",
    "Dossiers noirs 214",
  ],
  ">\n          <span>اسم المستخدم (اسم المالك)</span>\n          <input type=": [
    "Black files 215",
    "Dossiers noirs 215",
  ],
  ">\n          <span>البريد الإلكتروني أو اسم المستخدم</span>\n          <input type=": [
    "Black files 216",
    "Dossiers noirs 216",
  ],
  ">\n          <span>البريد الإلكتروني</span>\n          <input type=": [
    "Black files 217",
    "Dossiers noirs 217",
  ],
  ">\n          <span>كلمة المرور (٦ أحرف على الأقل)</span>\n          <input type=": [
    "Black files 218",
    "Dossiers noirs 218",
  ],
  ">\n          <span>كلمة المرور</span>\n          <input type=": [
    "Black files 219",
    "Dossiers noirs 219",
  ],
  "> <h4>الحفظة المحلية الحالية</h4> <div><span>النادي:</span><b>${diff?.local ? diff.local.clubName": [
    "Black files 220",
    "Dossiers noirs 220",
  ],
  "> <h4>الحفظة على السحابة</h4> <div><span>النادي:</span><b>${diff.cloud.clubName}</b></div> <div><span>الموسم:</span><b>${diff.cloud.season}</b></div> <div><span>التاريخ:</span><b>${date(diff.cloud.date)}</b></div> <div><span>السيولة:</span><b>${money(diff.cloud.cash)} ${cur()}</b></div> <div><span>الجهاز:</span><b>${diff.cloud.device ||": [
    "Black files 221",
    "Dossiers noirs 221",
  ],
  "> <span>اسم المستخدم (اسم المالك)</span> <input type=": [
    "Black files 222",
    "Dossiers noirs 222",
  ],
  "> <span>البريد الإلكتروني أو اسم المستخدم</span> <input type=": [
    "Black files 223",
    "Dossiers noirs 223",
  ],
  "> <span>البريد الإلكتروني</span> <input type=": [
    "Black files 224",
    "Dossiers noirs 224",
  ],
  "> <span>كلمة المرور (٦ أحرف على الأقل)</span> <input type=": [
    "Black files 225",
    "Dossiers noirs 225",
  ],
  "> <span>كلمة المرور</span> <input type=": [
    "Black files 226",
    "Dossiers noirs 226",
  ],
  "> <strong>${s.metadata.clubName} · الموسم ${s.metadata.seasonNumber}</strong> <small>${date(s.metadata.date)} · السيولة ${money(s.metadata.cash)} ${cur()} · ${s.metadata.device ||": [
    "Black files 227",
    "Dossiers noirs 227",
  ],
  ">${button(`الموافقة على دورة ٢١ يومًا مقابل ${money(100000)} ${cur()}`": [
    "Black files 228",
    "Dossiers noirs 228",
  ],
  ">${button(`الموافقة على دورة ٢١ يومًا مقابل ${money(100000)} ${cur()}`,": [
    "Black files 229",
    "Dossiers noirs 229",
  ],
  ">${money(now)} ${cur()}</strong></div><div><span>إجمالي الالتزام خلال العقد</span><strong>${money(total)} ${cur()}</strong></div>${n ? `<div><span>عمولة الوكيل (٣٪)</span><b>${money(agent)} ${cur()}</b></div>`": [
    "Black files 230",
    "Dossiers noirs 230",
  ],
  ">${money(now)} ${cur()}</strong></div><div><span>إجمالي الالتزام خلال العقد</span><strong>${money(total)} ${cur()}</strong></div>${n ? `<div><span>عمولة الوكيل (٣٪)</span><b>${money(agent)} ${cur()}</b></div>` ": [
    "Black files 231",
    "Dossiers noirs 231",
  ],
  ">${money(now)} ${cur()}</strong></div><div><span>إجمالي الالتزام خلال العقد</span><strong>${money(total)} ${cur()}</strong></div>${n ? `<div><span>عمولة الوكيل (٣٪)</span><b>${money(agent)} ${cur()}</b></div>` :": [
    "Black files 232",
    "Dossiers noirs 232",
  ],
  ">${num(players.length)} لاعب</span></div><div class=": [
    "Black files 233",
    "Dossiers noirs 233",
  ],
  ">${suspicionLabel(suspicion)} — ${bf.scandalCount ? `${num(bf.scandalCount)} فضيحة` : t": [
    "Black files 234",
    "Dossiers noirs 234",
  ],
  ">${suspicionLabel(suspicion)} — ${bf.scandalCount ? `${num(bf.scandalCount)} فضيحة` : t(": [
    "Black files 235",
    "Dossiers noirs 235",
  ],
  ">${tr(`سيتم استبدال الحفظة النشطة بهذه اللقطة (${meta.clubName} · ${meta.date}).`, `The active save will be replaced by this snapshot (${meta.clubName} · ${meta.date}).`, `La sauvegarde active sera remplacée par cet instantané (${meta.clubName} · ${meta.date}).`)} ${tr": [
    "Black files 236",
    "Dossiers noirs 236",
  ],
  ">${tr(`سيتم استبدال الحفظة النشطة بهذه اللقطة (${meta.clubName} · ${meta.date}).`, `The active save will be replaced by this snapshot (${meta.clubName} · ${meta.date}).`, `La sauvegarde active sera remplacée par cet instantané (${meta.clubName} · ${meta.date}).`)} ${tr(": [
    "Black files 237",
    "Dossiers noirs 237",
  ],
  ">+١٠٠٪ ديربي ناري</option></select></label></div><div class=": [
    "Black files 238",
    "Dossiers noirs 238",
  ],
  ">+٢٥٪ مباراة كبيرة</option><option value=": [
    "Black files 239",
    "Dossiers noirs 239",
  ],
  ">+٥٠٪ قمة</option><option value=": [
    "Black files 240",
    "Dossiers noirs 240",
  ],
  "><div><small>الجاهزية</small><strong>${num(p.fitness)}٪</strong></div><div><small>المعنويات</small><strong>${num(p.morale)}٪</strong></div><div><small>المشاركات / الأهداف</small><strong>${num(p.appearances)} / ${num(p.goals)}</strong></div></div><div class=": [
    "Black files 241",
    "Dossiers noirs 241",
  ],
  "><div><small>القيمة المتوقعة</small><strong>${money(p.value)} ${cur()}</strong></div><div><small>المرتب الشهري</small><strong>${money(p.salary)} ${cur()}</strong></div><div><small>نهاية العقد</small><strong>${date(p.contractEnd)}</strong></div></div>${clauseBlock}<h3 class=": [
    "Black files 242",
    "Dossiers noirs 242",
  ],
  "><div><small>المبلغ المستلم</small><strong>٥ ملايين ${cur()}</strong></div><div><small>إجمالي السداد</small><strong>٥٫٤ مليون ${cur()}</strong></div><div><small>الدفعة كل ٣٠ يومًا</small><strong>٤٥٠ ألف ${cur()}</strong></div></div><p class=": [
    "Black files 243",
    "Dossiers noirs 243",
  ],
  "><h3>مراجعة المسيرة والعمر</h3><p>${p.status ===": [
    "Black files 244",
    "Dossiers noirs 244",
  ],
  "><h4>التقرير الكشفي</h4><p>${tr": [
    "Black files 245",
    "Dossiers noirs 245",
  ],
  "><h4>التقرير الكشفي</h4><p>${tr(": [
    "Black files 246",
    "Dossiers noirs 246",
  ],
  "><h4>الحقوق والالتزامات</h4><p>سيتم حجز ${asset.name} طوال مدة العقد. ${offer.exclusive ?": [
    "Black files 247",
    "Dossiers noirs 247",
  ],
  "><h4>المنتخب — داخل هذه الحفظة فقط</h4><p>مشاركات دولية ${num(p.internationalCaps || 0)} · أهداف ${num(p.internationalGoals || 0)}</p>${p.internationalUntil ? `<p>مع المنتخب حتى ${date(p.internationalUntil)}</p>`": [
    "Black files 248",
    "Dossiers noirs 248",
  ],
  "><h4>المنتخب — داخل هذه الحفظة فقط</h4><p>مشاركات دولية ${num(p.internationalCaps || 0)} · أهداف ${num(p.internationalGoals || 0)}</p>${p.internationalUntil ? `<p>مع المنتخب حتى ${date(p.internationalUntil)}</p>` ": [
    "Black files 249",
    "Dossiers noirs 249",
  ],
  "><h4>المنتخب — داخل هذه الحفظة فقط</h4><p>مشاركات دولية ${num(p.internationalCaps || 0)} · أهداف ${num(p.internationalGoals || 0)}</p>${p.internationalUntil ? `<p>مع المنتخب حتى ${date(p.internationalUntil)}</p>` :": [
    "Black files 250",
    "Dossiers noirs 250",
  ],
  "><option>أساسي</option><option>مداورة</option><option>بديل</option><option>مشروع للمستقبل</option></select></label></div><h3 class=": [
    "Black files 251",
    "Dossiers noirs 251",
  ],
  "><span>الأولى (20٪ · 40–2000)</span><input type=": [
    "Black files 252",
    "Dossiers noirs 252",
  ],
  "><span>الدفعة المقدمة</span><select name=": [
    "Black files 253",
    "Dossiers noirs 253",
  ],
  "><span>الدور داخل الفريق</span><select name=": [
    "Black files 254",
    "Dossiers noirs 254",
  ],
  "><span>الزيادة السنوية ٪</span><input name=": [
    "Black files 255",
    "Dossiers noirs 255",
  ],
  "><span>العادية (70٪ من السعة)</span><input type=": [
    "Black files 256",
    "Dossiers noirs 256",
  ],
  "><span>المرتب الشهري — ${cur()}</span><input type=": [
    "Black files 257",
    "Dossiers noirs 257",
  ],
  "><span>المقصورة (10٪ · 100–5000)</span><input type=": [
    "Black files 258",
    "Dossiers noirs 258",
  ],
  "><span>شرط جزائي — ${cur()} (صفر = لا يوجد)</span><input name=": [
    "Black files 259",
    "Dossiers noirs 259",
  ],
  "><span>علاوة المباراة البيتية القادمة</span><select name=": [
    "Black files 260",
    "Dossiers noirs 260",
  ],
  "><span>قيمة الانتقال — جنيه مصري</span><input type=": [
    "Black files 261",
    "Dossiers noirs 261",
  ],
  "><span>مبلغ التبرع</span><input type=": [
    "Black files 262",
    "Dossiers noirs 262",
  ],
  "><span>مدة العقد</span><select name=": [
    "Black files 263",
    "Dossiers noirs 263",
  ],
  "><span>مستوى الشرط الجزائي — ${cur()}</span><select name=": [
    "Black files 264",
    "Dossiers noirs 264",
  ],
  "><span>مصدر الاسم والقائمة</span><a href=": [
    "Black files 265",
    "Dossiers noirs 265",
  ],
  "><span>مكافأة التوقيع — ${cur()}</span><input name=": [
    "Black files 266",
    "Dossiers noirs 266",
  ],
  "><span>مكافأة المشاركة — ${cur()}</span><input name=": [
    "Black files 267",
    "Dossiers noirs 267",
  ],
  "><span>مكافأة الهدف — ${cur()}</span><input name=": [
    "Black files 268",
    "Dossiers noirs 268",
  ],
  "><thead><tr><th>اللاعب</th><th>المركز</th><th>العمر</th><th>التقييم</th><th>${market ?": [
    "Black files 269",
    "Dossiers noirs 269",
  ],
  ">إرسال العرض ${icon": [
    "Black files 270",
    "Dossiers noirs 270",
  ],
  ">إرسال العرض ${icon(": [
    "Black files 271",
    "Dossiers noirs 271",
  ],
  ">إنشاء الحساب والمتابعة</button>\n        ${button": [
    "Black files 272",
    "Dossiers noirs 272",
  ],
  ">إنشاء الحساب والمتابعة</button>\n        ${button(": [
    "Black files 273",
    "Dossiers noirs 273",
  ],
  ">إنشاء الحساب والمتابعة</button> ${button": [
    "Black files 274",
    "Dossiers noirs 274",
  ],
  ">إنشاء حساب جديد</button>\n  </div>\n  ${activeTab ===": [
    "Black files 275",
    "Dossiers noirs 275",
  ],
  ">إنشاء حساب جديد</button> </div> ${activeTab ===": [
    "Black files 276",
    "Dossiers noirs 276",
  ],
  ">افتح البريد</button></div>`;\n  const clause = p.contractTerms?.releaseClause || 0;\n  const clauseNote = clause > 0 ? `<div class=": [
    "Black files 277",
    "Dossiers noirs 277",
  ],
  ">افتح البريد</button></div>`; const clause = p.contractTerms?.releaseClause || 0; const clauseNote = clause > 0 ? `<div class=": [
    "Black files 278",
    "Dossiers noirs 278",
  ],
  ">التاريخ ${esc(pendingImport.date)}. سيتم استبدال الحفظة النشطة على هذا المتصفح. صدّر الحالية أولًا لو محتاجها.</p><div class=": [
    "Black files 279",
    "Dossiers noirs 279",
  ],
  ">الحفظة الجديدة هتستبدل الحالية عند بدء اللعب. صدّر الحالية لو حابب ترجع لها.</p><div class=": [
    "Black files 280",
    "Dossiers noirs 280",
  ],
  ">السعر الأعلى يرفع العائد لكل مشجع، لكنه يقلل الطلب. المقصورة أقل تأثرًا بالغلاء من العادية. أصحاب الاشتراكات يشغلون مقاعد العادية أولًا ولا يُحصّلون مرتين.</p><form id=": [
    "Black files 281",
    "Dossiers noirs 281",
  ],
  ">القدرات الفنية والبدنية</h3><div class=": [
    "Black files 282",
    "Dossiers noirs 282",
  ],
  ">القيمة الاسترشادية ${money(p.value)} ${cur()}. النادي قد يطلب عرضًا مضادًا.</p>${clauseNote}<form id=": [
    "Black files 283",
    "Dossiers noirs 283",
  ],
  ">المرحلة ١ من ٢ · التفاوض مع النادي</span><h2>عرض انتقال ${esc(getLanguage() ===": [
    "Black files 284",
    "Dossiers noirs 284",
  ],
  ">المزامنة السحابية</span>\n        <h2>استرجاع الحفظة السحابية؟</h2>\n        <p class=": [
    "Black files 285",
    "Dossiers noirs 285",
  ],
  ">المزامنة السحابية</span> <h2>استرجاع الحفظة السحابية؟</h2> <p class=": [
    "Black files 286",
    "Dossiers noirs 286",
  ],
  ">المزامنة: ${new Date(s.updatedAt).toLocaleString": [
    "Black files 287",
    "Dossiers noirs 287",
  ],
  ">المزامنة: ${new Date(s.updatedAt).toLocaleString(": [
    "Black files 288",
    "Dossiers noirs 288",
  ],
  ">بدون علاوة</option><option value=": [
    "Black files 289",
    "Dossiers noirs 289",
  ],
  ">بنود تؤثر فعليًا</h3><div class=": [
    "Black files 290",
    "Dossiers noirs 290",
  ],
  ">تابع الرد والتفاصيل من بريدك. لا يمكن إرسال عرضين متداخلين.</p><div class=": [
    "Black files 291",
    "Dossiers noirs 291",
  ],
  ">تسجيل الدخول</button>\n        ${button": [
    "Black files 292",
    "Dossiers noirs 292",
  ],
  ">تسجيل الدخول</button>\n        ${button(": [
    "Black files 293",
    "Dossiers noirs 293",
  ],
  ">تسجيل الدخول</button>\n    <button type=": [
    "Black files 294",
    "Dossiers noirs 294",
  ],
  ">تسجيل الدخول</button> ${button": [
    "Black files 295",
    "Dossiers noirs 295",
  ],
  ">تسجيل الدخول</button> <button type=": [
    "Black files 296",
    "Dossiers noirs 296",
  ],
  ">تمويل تجريبي ثابت</span><h2>مساحة أكبر للسيولة… والتزام جديد</h2><div class=": [
    "Black files 297",
    "Dossiers noirs 297",
  ],
  ">توقيع العقد واستلام المقدم ${icon": [
    "Black files 298",
    "Dossiers noirs 298",
  ],
  ">توقيع العقد واستلام المقدم ${icon(": [
    "Black files 299",
    "Dossiers noirs 299",
  ],
  ">جارٍ فتح الحفظة…</div>`;\n  try {\n    const loaded = await loadGame();\n    setState(loaded.state);\n    setLanguage(loaded.state?.preferences.language || getLanguage());\n    render();\n    if (loaded.backup)\n      toast": [
    "Black files 300",
    "Dossiers noirs 300",
  ],
  ">جارٍ فتح الحفظة…</div>`;\n  try {\n    const loaded = await loadGame();\n    setState(loaded.state);\n    setLanguage(loaded.state?.preferences.language || getLanguage());\n    render();\n    if (loaded.backup)\n      toast(": [
    "Black files 301",
    "Dossiers noirs 301",
  ],
  ">جارٍ فتح الحفظة…</div>`; try { const loaded = await loadGame(); setState(loaded.state); setLanguage(loaded.state?.preferences.language || getLanguage()); render(); if (loaded.backup) toast": [
    "Black files 302",
    "Dossiers noirs 302",
  ],
  ">حساب المالك والمزامنة</span>\n  <h2>${activeTab ===": [
    "Black files 303",
    "Dossiers noirs 303",
  ],
  ">حساب المالك والمزامنة</span> <h2>${activeTab ===": [
    "Black files 304",
    "Dossiers noirs 304",
  ],
  ">حفظ أسعار التذاكر</button></div></form>`,\n    );\n  }": [
    "Black files 305",
    "Dossiers noirs 305",
  ],
  ">حفظ أسعار التذاكر</button></div></form>`,\n    );\n  },": [
    "Black files 306",
    "Dossiers noirs 306",
  ],
  ">حفظ أسعار التذاكر</button></div></form>`, ); }": [
    "Black files 307",
    "Dossiers noirs 307",
  ],
  ">حفظ أسعار التذاكر</button></div></form>`, ); },": [
    "Black files 308",
    "Dossiers noirs 308",
  ],
  ">سيتم استبدال الحفظة النشطة على جهازك بالنسخة المحفوظة سحابيًا.</p>\n        <div class=": [
    "Black files 309",
    "Dossiers noirs 309",
  ],
  ">سيتم استبدال الحفظة النشطة على جهازك بالنسخة المحفوظة سحابيًا.</p> <div class=": [
    "Black files 310",
    "Dossiers noirs 310",
  ],
  ">طلب اللاعب الاسترشادي: ${money(p.salary)} ${cur()} شهريًا. ${tr": [
    "Black files 311",
    "Dossiers noirs 311",
  ],
  ">طلب اللاعب الاسترشادي: ${money(p.salary)} ${cur()} شهريًا. ${tr(": [
    "Black files 312",
    "Dossiers noirs 312",
  ],
  ">عرض المصدر ↗</a></div>`": [
    "Black files 313",
    "Dossiers noirs 313",
  ],
  ">عرض المصدر ↗</a></div>` ": [
    "Black files 314",
    "Dossiers noirs 314",
  ],
  ">عرض المصدر ↗</a></div>` :": [
    "Black files 315",
    "Dossiers noirs 315",
  ],
  ">عقد ٣٦٠ يومًا بقيمة ${money(offer.amount)} ${cur()}، ومقدم ${money(Math.floor(offer.amount * 0.25))} ${cur()}. تشمل مكافآت أداء موحدة تُصرف تلقائيًا.</p><div class=": [
    "Black files 316",
    "Dossiers noirs 316",
  ],
  ">قبل الالتزام</span><h2>${sp.name} × ${asset.name}</h2><p class=": [
    "Black files 317",
    "Dossiers noirs 317",
  ],
  ">كل الأسواق</option>${s.leagues.map((l) => `<option value=": [
    "Black files 318",
    "Dossiers noirs 318",
  ],
  ">لا توجد أي حفظة سحابية مسجلة لحسابك حتى الآن. يمكنك مزامنة ناديك الحالي أولًا.</p><div class=": [
    "Black files 319",
    "Dossiers noirs 319",
  ],
  ">لا توجد حفظات سحابية مسجلة بعد.</p><div class=": [
    "Black files 320",
    "Dossiers noirs 320",
  ],
  ">لا توجد ملفات سوداء بعد.</p></section>`;\n  const suspicion = Math.round(bf.suspicion * 10) / 10;\n  const color = suspicion >= 85 ?": [
    "Black files 321",
    "Dossiers noirs 321",
  ],
  ">لا توجد ملفات سوداء بعد.</p></section>`; const suspicion = Math.round(bf.suspicion * 10) / 10; const color = suspicion >= 85 ?": [
    "Black files 322",
    "Dossiers noirs 322",
  ],
  ">نسخة احتياطية سليمة</span><h2>استيراد الحفظة؟</h2><p class=": [
    "Black files 323",
    "Dossiers noirs 323",
  ],
  ">يتم الاحتفاظ بآخر ٥ حفظات لحسابك تلقائيًا. يمكنك استرجاع أي نسخة أو حذفها.</p>\n        <div class=": [
    "Black files 324",
    "Dossiers noirs 324",
  ],
  ">يتم الاحتفاظ بآخر ٥ حفظات لحسابك تلقائيًا. يمكنك استرجاع أي نسخة أو حذفها.</p> <div class=": [
    "Black files 325",
    "Dossiers noirs 325",
  ],
  ">١٠٠٪ دفعة واحدة</option></select></label></div><div class=": [
    "Black files 326",
    "Dossiers noirs 326",
  ],
  ">١٢ دفعة تشمل تكلفة تمويل ثابتة ٤٠٠ ألف جنيه. حد أقصى قرضان خلال الحفظة التجريبية. لا يتضمن نموذج فائدة مركبة أو شروط بنك حقيقي.</p>${infoNote": [
    "Black files 327",
    "Dossiers noirs 327",
  ],
  ">١٢ دفعة تشمل تكلفة تمويل ثابتة ٤٠٠ ألف جنيه. حد أقصى قرضان خلال الحفظة التجريبية. لا يتضمن نموذج فائدة مركبة أو شروط بنك حقيقي.</p>${infoNote(": [
    "Black files 328",
    "Dossiers noirs 328",
  ],
  ">٤٠٪ والباقي ٣ أقساط</option><option value=": [
    "Black files 329",
    "Dossiers noirs 329",
  ],
  ">٦٠٪ والباقي ٣ أقساط</option><option value=": [
    "Black files 330",
    "Dossiers noirs 330",
  ],
  "? (rnd - 0.25) / 0.75 : Math.random();\n  const base = baseReleaseValue(player.rating, Math.min(0.99, Math.max(0, baseRnd)));\n  const spanish = isSpanishClub(player, s);\n  const { mult } = releaseMultipliers(player, currentDate, spanish);\n  let value = Math.round(base * mult);\n  // عقد أقل من سنة: 50% بلا شرط — نطبقها هنا باحتمال إضافي\n  const years = contractYearsLeft(player, currentDate);\n  if (years < 1) {\n    // ~50% من حالات العقد القصير تصبح بلا شرط\n    if (baseRnd > 0.5) return 0;\n    value = Math.round(value * 0.5);\n  }\n  // سقف مرن: سوبرستار صغير بعقد طويل في نادٍ غني يصل 150-300M+\n  // إذا كان التقييم 85+ وعمر <23 وعقد 3+ سنين وإسباني، نسمح حتى 300M\n  if (player.rating >= 85 && player.age < 23 && years >= 3 && spanish) {\n    value = Math.min(300000000, Math.max(value, 150000000 + Math.round(baseRnd * 150000000)));\n  } else {\n    value = Math.min(300000000, value);\n  }\n  return Math.max(0, value);\n}\n\n// عند توقيع لاعب جديد: مستوى الشرط بمقايضة راتب\nexport const CLAUSE_LEVELS = [\n  { id": [
    "Black files 331",
    "Dossiers noirs 331",
  ],
  "? (rnd - 0.25) / 0.75 : Math.random();\n  const base = baseReleaseValue(player.rating, Math.min(0.99, Math.max(0, baseRnd)));\n  const spanish = isSpanishClub(player, s);\n  const { mult } = releaseMultipliers(player, currentDate, spanish);\n  let value = Math.round(base * mult);\n  // عقد أقل من سنة: 50% بلا شرط — نطبقها هنا باحتمال إضافي\n  const years = contractYearsLeft(player, currentDate);\n  if (years < 1) {\n    // ~50% من حالات العقد القصير تصبح بلا شرط\n    if (baseRnd > 0.5) return 0;\n    value = Math.round(value * 0.5);\n  }\n  // سقف مرن: سوبرستار صغير بعقد طويل في نادٍ غني يصل 150-300M+\n  // إذا كان التقييم 85+ وعمر <23 وعقد 3+ سنين وإسباني، نسمح حتى 300M\n  if (player.rating >= 85 && player.age < 23 && years >= 3 && spanish) {\n    value = Math.min(300000000, Math.max(value, 150000000 + Math.round(baseRnd * 150000000)));\n  } else {\n    value = Math.min(300000000, value);\n  }\n  return Math.max(0, value);\n}\n\n// عند توقيع لاعب جديد: مستوى الشرط بمقايضة راتب\nexport const CLAUSE_LEVELS = [\n  { id:": [
    "Black files 332",
    "Dossiers noirs 332",
  ],
  "? (rnd - 0.25) / 0.75 : Math.random(); const base = baseReleaseValue(player.rating, Math.min(0.99, Math.max(0, baseRnd))); const spanish = isSpanishClub(player, s); const { mult } = releaseMultipliers(player, currentDate, spanish); let value = Math.round(base * mult); // عقد أقل من سنة: 50% بلا شرط — نطبقها هنا باحتمال إضافي const years = contractYearsLeft(player, currentDate); if (years < 1) { // ~50% من حالات العقد القصير تصبح بلا شرط if (baseRnd > 0.5) return 0; value = Math.round(value * 0.5); } // سقف مرن: سوبرستار صغير بعقد طويل في نادٍ غني يصل 150-300M+ // إذا كان التقييم 85+ وعمر <23 وعقد 3+ سنين وإسباني، نسمح حتى 300M if (player.rating >= 85 && player.age < 23 && years >= 3 && spanish) { value = Math.min(300000000, Math.max(value, 150000000 + Math.round(baseRnd * 150000000))); } else { value = Math.min(300000000, value); } return Math.max(0, value); } // عند توقيع لاعب جديد: مستوى الشرط بمقايضة راتب export const CLAUSE_LEVELS = [ { id": [
    "Black files 333",
    "Dossiers noirs 333",
  ],
  "? Boolean(event.when(s)) : true;\n\nexport const availableDecisions = (s) => EVENT_CATALOG.filter((e) => gate(e, s));\nexport const availableFlavor = (s) => FLAVOR_CATALOG.filter((e) => gate(e, s));\n\n// أخبار النكهة لا تتكرر داخل الموسم: نتذكر ما صُرف خلال آخر ١٥٠ يوماً من البريد،\n// ثم ننسى — فمسيرة من عشرين موسمًا لا تُحرم من الأخبار بعد موسم واحد.\nconst FLAVOR_REPEAT_WINDOW = 150;\nconst FLAVOR_GAP_DAYS = 3;\nconst FLAVOR_MIN_CAREER_DAYS = 3;\nconst FLAVOR_NEWS_CAP = 60;\nconst flavorRef = (id) => `flavor:${id}`;\n\nconst flavorLog = (s) =>\n  s.inbox.filter(\n    (m) =>\n      m.kind ===": [
    "Black files 334",
    "Dossiers noirs 334",
  ],
  "? Boolean(event.when(s)) : true; export const availableDecisions = (s) => EVENT_CATALOG.filter((e) => gate(e, s)); export const availableFlavor = (s) => FLAVOR_CATALOG.filter((e) => gate(e, s)); // أخبار النكهة لا تتكرر داخل الموسم: نتذكر ما صُرف خلال آخر ١٥٠ يوماً من البريد، // ثم ننسى — فمسيرة من عشرين موسمًا لا تُحرم من الأخبار بعد موسم واحد. const FLAVOR_REPEAT_WINDOW = 150; const FLAVOR_GAP_DAYS = 3; const FLAVOR_MIN_CAREER_DAYS = 3; const FLAVOR_NEWS_CAP = 60; const flavorRef = (id) => `flavor:${id}`; const flavorLog = (s) => s.inbox.filter( (m) => m.kind ===": [
    "Black files 335",
    "Dossiers noirs 335",
  ],
  "? Math.max(0, Math.trunc(c.youth)) : c.youth ? 1 : 0;\nconst signingCountOf = (c) => (c.signing ? Math.max(1, c.signing.count || 1) : 0);\n\n// الآثار الموجَّهة لفئة من القائمة (targets). قاعدة الإصابة حتمية لا عشوائية:\n// الأيام الموجبة تُصيب «الأقل جاهزية» في الفئة، والسالبة تقصّر إصابة قائمة.\nfunction applyTargets(s, targets) {\n  const hit = [];\n  for (const t of targets || []) {\n    const players = inScope(s, t.scope);\n    if (!players.length) continue;\n    if (t.morale || t.fitness)\n      for (const p of players) {\n        p.morale = clamp(p.morale + (t.morale || 0), 0, 100);\n        p.fitness = clamp(p.fitness + (t.fitness || 0), 0, 100);\n      }\n    const days = Math.trunc(t.injuryDays || 0);\n    if (days < 0) {\n      for (const p of players) {\n        if (!p.injuryUntil || p.injuryUntil < s.date) continue;\n        const left = daysBetween(s.date, p.injuryUntil) + days;\n        p.injuryUntil = left > 0 ? addDays(s.date, left) : null;\n        hit.push(p);\n      }\n    } else if (days > 0) {\n      const candidates = players.filter(\n        (p) => !p.injuryUntil || p.injuryUntil < s.date,\n      );\n      if (candidates.length) {\n        const weakest = candidates.reduce((a, b) =>\n          a.fitness <= b.fitness ? a : b,\n        );\n        weakest.injuryUntil = addDays(s.date, days);\n        hit.push(weakest);\n      }\n    }\n  }\n  return hit;\n}\n\n// مرآة الخبر في ملف الصحافة إن كان موجودًا (الحفظات الموسعة فقط).\nfunction pressRelease(s, title, type) {\n  if (!s.press || !Array.isArray(s.press.news)) return false;\n  s.press.news.unshift({ date: s.date, title, type });\n  s.press.news = s.press.news.slice(0, FLAVOR_NEWS_CAP);\n  return true;\n}\n\n// فرصة رعاية مجدولة عبر machinery القائمة نفسها (eventsDay في services/time.js).\nfunction scheduleSponsorOffer(s, assetId, key) {\n  if (!assetId) return null;\n  const taken = s.events.some(\n    (e) => e.type ===": [
    "Black files 336",
    "Dossiers noirs 336",
  ],
  "? Math.max(0, Math.trunc(c.youth)) : c.youth ? 1 : 0; const signingCountOf = (c) => (c.signing ? Math.max(1, c.signing.count || 1) : 0); // الآثار الموجَّهة لفئة من القائمة (targets). قاعدة الإصابة حتمية لا عشوائية: // الأيام الموجبة تُصيب «الأقل جاهزية» في الفئة، والسالبة تقصّر إصابة قائمة. function applyTargets(s, targets) { const hit = []; for (const t of targets || []) { const players = inScope(s, t.scope); if (!players.length) continue; if (t.morale || t.fitness) for (const p of players) { p.morale = clamp(p.morale + (t.morale || 0), 0, 100); p.fitness = clamp(p.fitness + (t.fitness || 0), 0, 100); } const days = Math.trunc(t.injuryDays || 0); if (days < 0) { for (const p of players) { if (!p.injuryUntil || p.injuryUntil < s.date) continue; const left = daysBetween(s.date, p.injuryUntil) + days; p.injuryUntil = left > 0 ? addDays(s.date, left) : null; hit.push(p); } } else if (days > 0) { const candidates = players.filter( (p) => !p.injuryUntil || p.injuryUntil < s.date, ); if (candidates.length) { const weakest = candidates.reduce((a, b) => a.fitness <= b.fitness ? a : b, ); weakest.injuryUntil = addDays(s.date, days); hit.push(weakest); } } } return hit; } // مرآة الخبر في ملف الصحافة إن كان موجودًا (الحفظات الموسعة فقط). function pressRelease(s, title, type) { if (!s.press || !Array.isArray(s.press.news)) return false; s.press.news.unshift({ date: s.date, title, type }); s.press.news = s.press.news.slice(0, FLAVOR_NEWS_CAP); return true; } // فرصة رعاية مجدولة عبر machinery القائمة نفسها (eventsDay في services/time.js). function scheduleSponsorOffer(s, assetId, key) { if (!assetId) return null; const taken = s.events.some( (e) => e.type ===": [
    "Black files 337",
    "Dossiers noirs 337",
  ],
  "? `شرط عادي ${money(val)} (راتب ×1.0)` : lvl.id ===": [
    "Black files 338",
    "Dossiers noirs 338",
  ],
  "? `شرط عالٍ ${money(val)} (راتب ×1.15)` : `شرط عالٍ جدًا ${money(val)} (راتب ×1.30)`}</option>`;\n  }).join": [
    "Black files 339",
    "Dossiers noirs 339",
  ],
  "? `شرط عالٍ ${money(val)} (راتب ×1.15)` : `شرط عالٍ جدًا ${money(val)} (راتب ×1.30)`}</option>`;\n  }).join(": [
    "Black files 340",
    "Dossiers noirs 340",
  ],
  "? `شرط عالٍ ${money(val)} (راتب ×1.15)` : `شرط عالٍ جدًا ${money(val)} (راتب ×1.30)`}</option>`; }).join": [
    "Black files 341",
    "Dossiers noirs 341",
  ],
  "? `شرط قليل ${money(val)} (راتب ×0.90)` : lvl.id ===": [
    "Black files 342",
    "Dossiers noirs 342",
  ],
  "? `كسر شرط جزائي ${p.name}` : `مقدم شراء ${p.name}`, n.id +": [
    "Black files 343",
    "Dossiers noirs 343",
  ],
  "? p.name : p.nameLatin || p.name)}</h2><p>${position(p.position)} · ${num(p.age)} سنة · القدم ${p.foot}</p></div><span class=": [
    "Black files 344",
    "Dossiers noirs 344",
  ],
  "?.setAttribute(\"content\", theme === \"light\" ? \"#f2f6fb\" : \"#0a1322\"); } matchMedia(\"(prefers-color-scheme: light)\").addEventListener?.(\"change\", () => { try { if ((localStorage.getItem(\"clubowner.theme\") || \"dark\") === \"system\") document.documentElement.dataset.theme = resolveTheme(\"system\"); } catch {} }); function render() { const s = getState(); if (s) { // تفضيلات العرض تُطبق قبل بناء الشاشات: نمط الأرقام وتقليل الحركة. setDigitsMode(s.preferences?.digits === \"western\" ? \"western\" : \"arabic\"); document.body.classList.toggle( \"reduce-motion\", !!s.preferences?.reduceMotion, ); } if (!s) { app.innerHTML = setupView( ui.setupClub, ui.owner, ui.leagues, ui.setupConfig, ); app.firstElementChild?.classList.add(\"page-enter\"); lastRenderedRoute = \"setup\"; translateDOM(app); document.title = \"Empire FC\"; return; } const views = { dashboard: () => dashboardView(s), inbox: () => inboxView(s, ui.inboxFilter, ui.message), squad: () => playersView(s, false, ui.playerFilters), transfers: () => playersView(s, true, ui.playerFilters), facilities: () => facilitiesView(s), sponsors: () => sponsorsView(s), finance: () => financeView(s, ui.financeTab), board: () => boardView(s), world: () => s.expansion ? competitionsView(s, ui.expandedDivision) : worldView(s, ui.worldTab), commerce: () => commerceView(s), management: () => managementView(s), press: () => pressView(s), black: () => blackFilesView(s), legends: () => legendsView(s, ui.legendFilters), settings: () => settingsView(s), database: () => databaseView(), careers: () => careersView(s, ui.talentPlayer), }; app.innerHTML = shell(s, ui.route, (views[ui.route] || views.dashboard)()); if (ui.route !== lastRenderedRoute) app.querySelector(\"#main-content\")?.classList.add(\"page-enter\"); lastRenderedRoute = ui.route; translateDOM(app); document.title = (NAV.find((n) => n.id === ui.route)?.name || \"Empire FC\") + \" | Empire FC\"; document.title = translateText(document.title); } function navigate(route) { closeModal(); closePalette(); ui.route = route; if ([\"squad\", \"transfers\"].includes(route)) ui.playerFilters = { search: \"\", pos: \"all\", league: \"all\" }; render(); window.scrollTo({ top: 0, behavior: \"instant\" }); } // البحث السريع: طبقة مستقلة فوق التطبيق، تُحدَّث وحدها دون إعادة رندر الشاشة الحالية. function renderPalette() { const root = document.getElementById(\"palette-root\"); if (!root) return; const s = getState(); if (!ui.palette.open || !s) { root.innerHTML = \"\"; return; } root.innerHTML = paletteOverlay(s, ui.palette); const input = root.querySelector(\"#palette-input\"); input?.focus(); if (input) input.setSelectionRange(input.value.length, input.value.length); } function openPalette() { if (!getState()) return; ui.palette = { open: true, q: \"\", sel: 0, items: paletteItems(getState(), \"\") }; renderPalette(); } function closePalette() { if (!ui.palette.open) return; ui.palette.open = false; renderPalette(); } function paletteQuery(q) { ui.palette.q = q; ui.palette.sel = 0; ui.palette.items = paletteItems(getState(), q); renderPalette(); } function paletteMove(d) { const n = ui.palette.items.length; if (!n) return; ui.palette.sel = (ui.palette.sel + d + n) % n; renderPalette(); document .querySelector(\".palette-item.sel\") ?.scrollIntoView({ block: \"nearest\" }); } function paletteActivate(i) { const item = ui.palette.items[i]; if (!item) return; closePalette(); if (item.type === \"screen\") navigate(item.id); else showPlayer(item.id); } async function apply(operation, text) { document.body.classList.add(\"saving-game\"); const indicator = document.querySelector(\".save-indicator\"); if (indicator) indicator.textContent = tr(\"جارٍ الحفظ…\", \"Saving…\", \"Enregistrement…\"); let r; try { r = await commit(operation); } catch (e) { render(); throw e; } finally { document.body.classList.remove(\"saving-game\"); } render(); if (text) toast(text); return r; } async function runTime(resume = false) { const days = resume ? null : Number(document.getElementById(\"advance-days\")?.value || 7); const stateBefore = getState(), playedBefore = new Set( stateBefore ? playedOwnFixtures(stateBefore).map((f) => f.id) : [], ); const r = await apply((s) => { const result = advanceTime(s, days); if (result.advanced) markStep(s, \"week\"); return result; }); // 0.24: شاشة لقطات الماتش أولاً، ثم تقرير الماتش الكامل. const s = getState(); if (s && s.preferences?.autoMatchReport !== false) { const fresh = playedOwnFixtures(s).filter((f) => !playedBefore.has(f.id)); if (fresh.length) { const r = reportFor(s, fresh[fresh.length - 1]); showHighlightsScreen(s, r, () => { openModal(matchReportModal(s, r)); }); } } if (r.blocked) { ui.route = \"inbox\"; ui.inboxFilter = \"required\"; ui.message = pendingActions(getState())[0]?.id; render(); toast( r.advanced ? `تقدمنا ${num(r.advanced)} أيام. الوقت متوقف لقرارك.` : \"فيه قرار مهم محتاج ردك قبل تمرير الوقت.\", ); } else toast( r.match ? \"توقفت المحاكاة بعد المباراة. النتيجة في بريدك.\" : `تم تمرير ${num(r.advanced)} ${r.advanced === 1 ? \"يوم\" : \"أيام\"} وحفظ اللعبة.`, ); } function showPlayer(id) { const s = getState(), p = findPerson(s, id); if (p) openModal(playerDetail(s, p)); } function showContract(ref, renew = false) { openModal(contractForm(getState(), ref, renew)); updateCalculations(); } function showOffers(id) { openModal(sponsorOffers(getState(), id), true); } function chooseImport() { const input = document.createElement(\"input\"); input.type = \"file\"; input.accept = \".json,.gz,application/json,application/gzip\"; input.onchange = async () => { if (!input.files?.[0]) return; try { pendingImport = await importGame(input.files[0]); openModal( `<span class=\"eyebrow\">نسخة احتياطية سليمة</span><h2>استيراد الحفظة؟</h2><p class=\"muted\">التاريخ ${esc(pendingImport.date)}. سيتم استبدال الحفظة النشطة على هذا المتصفح. صدّر الحالية أولًا لو محتاجها.</p><div class=\"modal-actions\">${button(\"استيراد والمتابعة\", \"confirm-import\", \"\", \"primary\")}${getState() ? button(\"تصدير الحالية أولًا\", \"export-save\", \"\", \"secondary\") : \"\"}</div>`, ); } catch (e) { toast(\"تعذر الاستيراد: \" + e.message, true); } }; input.click(); } function updateCalculations() { const s = getState(), offer = document.querySelector(\"#offer-form\"), contract = document.querySelector(\"#contract-form\"); if (offer) { const fee = Number(offer.elements.fee.value), percent = Number(offer.elements.upfront.value); document.getElementById(\"offer-summary\").innerHTML = `<div><span>المقدم عند التوقيع</span><strong>${money(Math.round((fee * percent) / 100))} ${cur()}</strong></div><div><span>باقي قيمة الانتقال</span><strong>${money(fee - Math.round((fee * percent) / 100))} ${cur()}</strong></div><small>لم يتم الخصم. لا يشمل المبلغ عقد اللاعب أو الوكيل.</small>`; } if (contract) { const salary = Number(contract.elements.salary.value), bonus = Number(contract.elements.bonus.value), years = Number(contract.elements.years.value), renew = contract.dataset.renew === \"true\"; const n = renew ? null : s.negotiations.find((n) => n.id === contract.dataset.ref); const upfront = n ? Math.round((n.fee * n.upfrontPercent) / 100) : 0, agent = n ? Math.round(n.fee * 0.03) : 0, now = upfront + agent + bonus, total = (n?.fee || 0) + agent + bonus + guaranteedWages( salary, years, Number(contract.elements.annualRaisePct.value), ); document.getElementById(\"contract-summary\").innerHTML = `<div><span>المطلوب من الخزينة الآن</span><strong class=\"${now > s.finance.cash ? \"red\" : \"green\"}\">${money(now)} ${cur()}</strong></div><div><span>إجمالي الالتزام خلال العقد</span><strong>${money(total)} ${cur()}</strong></div>${n ? `<div><span>عمولة الوكيل (٣٪)</span><b>${money(agent)} ${cur()}</b></div>` : \"\"}<small>يشمل ${renew ? \"العقد الجديد والمكافأة\" : \"رسوم الانتقال والمرتب والمكافأة والوكيل\"}. الرصيد المتاح ${money(s.finance.cash)} ${cur()}.</small>`; } if (offer) translateDOM(document.getElementById(\"offer-summary\")); if (contract) { const summary = document.getElementById(\"contract-summary\"); summary.innerHTML += `<small>${tr(\"التكلفة المضمونة تشمل الزيادة السنوية ولا تشمل مكافآت المشاركات والأهداف المتغيرة. وعد الأساسي: المشاركة في ٦٠٪ من المباريات خلال أول ٦٠ يومًا؛ المخالفة تخفض المعنويات ١٢ نقطة. الشرط الجزائي يسمح لك بدفعه عند شراء لاعب من السوق؛ بيع لاعبيك للمنافسين غير متاح بعد.\", \"Guaranteed cost includes annual raises but excludes variable appearance and goal bonuses. Regular role: appear in 60% of matches during the first 60 days or lose 12 morale. A market player’s release clause can be activated when buying; AI purchases of your players are not yet enabled.\", \"Le coût garanti inclut les hausses annuelles, pas les primes variables. Titulaire : participer à 60 % des matchs des 60 premiers jours, sinon perte de 12 points de moral. La clause d’un joueur du marché peut être activée à l’achat ; ventes à l’IA non disponibles.\")}</small>`; translateDOM(summary); } } function authModalContent(activeTab = \"login\", error = \"\") { return `<span class=\"eyebrow\">حساب المالك والمزامنة</span> <h2>${activeTab === \"login\" ? \"تسجيل الدخول\" : \"إنشاء حساب جديد\"}</h2> ${error ? `<div class=\"info-note\" style=\"border-inline-start-color: var(--red); margin-bottom: 15px;\"><span>${esc(error)}</span></div>` : \"\"} <div class=\"auth-tabs\"> <button type=\"button\" class=\"auth-tab ${activeTab === \"login\" ? \"active\" : \"\"}\" data-action=\"auth-tab-login\">تسجيل الدخول</button> <button type=\"button\" class=\"auth-tab ${activeTab === \"register\" ? \"active\" : \"\"}\" data-action=\"auth-tab-register\">إنشاء حساب جديد</button> </div> ${activeTab === \"login\" ? ` <form id=\"auth-login-form\"> <div class=\"form-grid\"> <label class=\"field\"> <span>البريد الإلكتروني أو اسم المستخدم</span> <input type=\"text\" name=\"identifier\" required autocomplete=\"username\" placeholder=\"name@example.com\"> </label> <label class=\"field\"> <span>كلمة المرور</span> <input type=\"password\" name=\"password\" required autocomplete=\"current-password\" placeholder=\"••••••••\"> </label> </div> <div class=\"modal-actions\"> <button type=\"submit\" class=\"btn primary\">تسجيل الدخول</button> ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")} </div> </form> ` : ` <form id=\"auth-register-form\"> <div class=\"form-grid\"> <label class=\"field\"> <span>البريد الإلكتروني</span> <input type=\"email\" name=\"email\" required autocomplete=\"email\" placeholder=\"name@example.com\"> </label> <label class=\"field\"> <span>اسم المستخدم (اسم المالك)</span> <input type=\"text\" name=\"username\" required autocomplete=\"nickname\" placeholder=\"الاسم الذي يظهر في حسابك\"> </label> <label class=\"field\"> <span>كلمة المرور (٦ أحرف على الأقل)</span> <input type=\"password\" name=\"password\" minlength=\"6\" required autocomplete=\"new-password\" placeholder=\"••••••••\"> </label> </div> <div class=\"modal-actions\"> <button type=\"submit\" class=\"btn primary\">إنشاء الحساب والمتابعة</button> ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")} </div> </form> `}`; } const actions = { // خزنة المالك السرية: مفاتيحها أرقام الإصدار (أسفل القائمة الجانبية + سطر EMPIRE FC في شيت «المزيد» + شارة «عن اللعبة»). \"secret-vault\": () => openModal( `<h2>${tr(\"خزنة المالك السرية 🤫\", \"The owner": [
    "Black files 345",
    "Dossiers noirs 345",
  ],
  "].includes(n.stage),\n  );\n  if (active)\n    return `<h2>تفاوض قائم بالفعل</h2><p class=": [
    "Black files 346",
    "Dossiers noirs 346",
  ],
  "].includes(n.stage), ); if (active) return `<h2>تفاوض قائم بالفعل</h2><p class=": [
    "Black files 347",
    "Dossiers noirs 347",
  ],
  "abord la sauvegarde actuelle pour une copie externe.\")}</p><div class=\"modal-actions\">${button(tr(\"تحميل واستبدال\", \"Load and replace\", \"Charger et remplacer\"), \"slot-load-confirm\", meta.id, \"primary\")}${button(tr(\"إلغاء\", \"Cancel\", \"Annuler\"), \"close-modal\", \"\", \"secondary\")}</div>`,\n    );\n  },\n  \"slot-load-confirm\": async (el) => {\n    document.body.classList.add(\"saving-game\");\n    let state = null;\n    try {\n      state = await readSlot(el.dataset.id);\n      await saveGame(state);\n    } catch (e) {\n      document.body.classList.remove(\"saving-game\");\n      showError(e.message);\n      return;\n    }\n    document.body.classList.remove(\"saving-game\");\n    setState(state);\n    setLanguage(state.preferences?.language || getLanguage());\n    closeModal();\n    // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة.\n    location.reload();\n  },\n  \"slot-delete\": async (el) => {\n    try {\n      await deleteSlot(el.dataset.id);\n      toast(\"حُذفت الخانة.\");\n    } catch (e) {\n      showError(e.message);\n    }\n    render();\n  },\n  \"open-message\": async (el) => {\n    await apply((s) => {\n      const m = s.inbox.find((m) => m.id === el.dataset.id);\n      if (m) m.read = true;\n    });\n    ui.message = el.dataset.id;\n    ui.route = \"inbox\";\n    ui.inboxFilter = \"all\";\n    render();\n    if (innerWidth < 760)\n      document\n        .querySelector(\".message-detail\")\n        ?.scrollIntoView({ behavior: \"smooth\", block: \"start\" });\n  },\n  \"inbox-filter\": async (el) => {\n    ui.inboxFilter = el.dataset.id;\n    ui.message = null;\n    render();\n  },\n  \"read-all\": async () =>\n    await apply(\n      (s) => s.inbox.forEach((m) => (m.read = true)),\n      \"تم تعليم كل الرسائل كمقروءة. القرارات المطلوبة ما زالت نشطة.\",\n    ),\n  resolve: async (el) => {\n    await apply((s) => resolveInfo(s, el.dataset.id), \"تم تسجيل قرارك.\");\n  },\n  \"go-finance\": async (el) => {\n    navigate(\"finance\");\n    toast(\"راجع التمويل، ثم عُد للبريد لتأكيد التعامل مع تنبيه السيولة.\");\n  },\n  \"player-detail\": async (el) => showPlayer(el.dataset.id),\n  \"transfer-offer\": async (el) => {\n    const s = getState(),\n      p = s.players.find((p) => p.id === el.dataset.id);\n    openModal(offerForm(s, p));\n    updateCalculations();\n  },\n  \"accept-club\": async (el) => {\n    await apply(\n      (s) => acceptClub(s, el.dataset.id),\n      \"تم الاتفاق مع النادي. باقي عقد اللاعب.\",\n    );\n    showContract(el.dataset.id);\n  },\n  \"reject-transfer\": async (el) => {\n    await apply(\n      (s) => rejectNegotiation(s, el.dataset.id),\n      \"تم إنهاء التفاوض بدون خصم أموال.\",\n    );\n  },\n  \"player-contract\": async (el) => showContract(el.dataset.id),\n  \"renew-player\": async (el) => showContract(el.dataset.id, true),\n  \"facility-detail\": async (el) =>\n    openModal(facilityDetail(getState(), el.dataset.id)),\n  \"toggle-staff\": async (el) => {\n    await apply(\n      (s) => toggleFacilityStaff(s, el.dataset.id),\n      \"تم تحديث طاقم المنشأة.\",\n    );\n    openModal(facilityDetail(getState(), el.dataset.id));\n  },\n  \"sponsor-offers\": async (el) => showOffers(el.dataset.id),\n  \"sponsor-detail\": async (el) =>\n    openModal(sponsorDetail(getState(), el.dataset.id)),\n  \"confirm-sponsor\": async (el) => {\n    const s = getState(),\n      offer = offersFor(s, el.dataset.asset).find(\n        (o) => o.sponsorId === el.dataset.id,\n      ),\n      sp = resolveSponsor(offer.sponsorId),\n      asset = ASSETS.find((x) => x.id === offer.assetId);\n    openModal(\n      `<span class=\"eyebrow\">قبل الالتزام</span><h2>${sp.name} × ${asset.name}</h2><p class=\"muted\">عقد ٣٦٠ يومًا بقيمة ${money(offer.amount)} ${cur()}، ومقدم ${money(Math.floor(offer.amount * 0.25))} ${cur()}. تشمل مكافآت أداء موحدة تُصرف تلقائيًا.</p><div class=\"effect-card\"><h4>الحقوق والالتزامات</h4><p>سيتم حجز ${asset.name} طوال مدة العقد. ${offer.exclusive ? \"العقد حصري لقطاع \" + sp.sector + \"؛ يمنع التعاقد مع منافس في نفس القطاع.\" : \"بدون حصرية قطاع؛ مساحة الإعلان نفسها محجوزة لهذا الشريك فقط.\"}</p><small>الباقي على ١١ دفعة متساوية تقريبًا كل ٣٠ يومًا. الفسخ المبكر غير متاح في هذه النسخة.</small></div><div class=\"modal-actions\"><button class=\"btn primary\" data-action=\"sign-sponsor\" data-id=\"${sp.id}\" data-asset=\"${asset.id}\">توقيع العقد واستلام المقدم ${icon(\"check\", 17)}</button></div>`,\n    );\n  },\n  \"sign-sponsor\": async (el) => {\n    await apply((s) => {\n      const offer = offersFor(s, el.dataset.asset).find(\n        (o) => o.sponsorId === el.dataset.id,\n      );\n      signSponsor(s, offer);\n      markStep(s, \"sponsor\");\n    }, \"تم توقيع الرعاية وإيداع المقدم في الخزينة.\");\n    closeModal();\n  },\n  \"negotiate-sponsor\": async (el) =>\n    openModal(sponsorNegotiate(getState(), el.dataset.asset, el.dataset.id)),\n  \"sponsor-demand\": async (el) => {\n    let deal = null;\n    await apply((s) => {\n      deal = negotiateSponsor(\n        s,\n        el.dataset.asset,\n        el.dataset.id,\n        Number(el.dataset.raise),\n      );\n    });\n    if (deal) openModal(sponsorDealResult(getState(), deal));\n  },\n  \"sign-sponsor-deal\": async (el) => {\n    await apply((s) => {\n      const offer = answerSponsorDeal(s, el.dataset.id, true);\n      signSponsor(s, offer);\n    }, \"تم توقيع الرعاية بالقيمة المتفاوض عليها وإيداع المقدم.\");\n    closeModal();\n  },\n  \"finance-tab\": async (el) => {\n    ui.financeTab = el.dataset.id;\n    render();\n  },\n  \"world-tab\": async (el) => {\n    ui.worldTab = el.dataset.id;\n    render();\n  },\n  \"loan-modal\": async () =>\n    openModal(\n      `<span class=\"eyebrow\">تمويل تجريبي ثابت</span><h2>مساحة أكبر للسيولة… والتزام جديد</h2><div class=\"profile-stats\"><div><small>المبلغ المستلم</small><strong>٥ ملايين ${cur()}</strong></div><div><small>إجمالي السداد</small><strong>٥٫٤ مليون ${cur()}</strong></div><div><small>الدفعة كل ٣٠ يومًا</small><strong>٤٥٠ ألف ${cur()}</strong></div></div><p class=\"muted\">١٢ دفعة تشمل تكلفة تمويل ثابتة ٤٠٠ ألف جنيه. حد أقصى قرضان خلال الحفظة التجريبية. لا يتضمن نموذج فائدة مركبة أو شروط بنك حقيقي.</p>${infoNote(\"التمويل مش إيراد تشغيلي. القسط بيتسدد تلقائيًا حتى لو أدى لعجز في السيولة.\")}<div class=\"modal-actions\">${button(\"اعتماد التمويل\", \"take-loan\", \"\", \"primary\")}</div>`,\n    ),\n  \"take-loan\": async () => {\n    await apply(takeLoan, \"تم إيداع التمويل وجدولة الأقساط.\");\n    closeModal();\n  },\n  \"ticket-price\": async () => {\n    const s = getState(),\n      prices = categoryPrices(s);\n    openModal(\n      `<h2>تسعير تذاكر المباريات</h2><p class=\"muted\">السعر الأعلى يرفع العائد لكل مشجع، لكنه يقلل الطلب. المقصورة أقل تأثرًا بالغلاء من العادية. أصحاب الاشتراكات يشغلون مقاعد العادية أولًا ولا يُحصّلون مرتين.</p><form id=\"ticket-form\"><div class=\"form-grid\"><label class=\"field\"><span>العادية (70٪ من السعة)</span><input type=\"number\" name=\"price\" value=\"${s.ticketPrice}\" min=\"50\" max=\"500\" required></label><label class=\"field\"><span>الأولى (20٪ · 40–2000)</span><input type=\"number\" name=\"first\" value=\"${prices.first}\" min=\"40\" max=\"2000\" required></label><label class=\"field\"><span>المقصورة (10٪ · 100–5000)</span><input type=\"number\" name=\"vip\" value=\"${prices.vip}\" min=\"100\" max=\"5000\" required></label><label class=\"field\"><span>علاوة المباراة البيتية القادمة</span><select name=\"premium\"><option value=\"0\">بدون علاوة</option><option value=\"25\">+٢٥٪ مباراة كبيرة</option><option value=\"50\">+٥٠٪ قمة</option><option value=\"100\">+١٠٠٪ ديربي ناري</option></select></label></div><div class=\"modal-actions\"><button type=\"submit\" class=\"btn primary\">حفظ أسعار التذاكر</button></div></form>`,\n    );\n  },\n  \"export-save\": async () => {\n    await exportGame(getState());\n    toast(\"تم تجهيز ملف الحفظ للتنزيل.\");\n  },\n  \"import-save\": chooseImport,\n  \"confirm-import\": async () => {\n    if (!pendingImport) return;\n    await saveGame(pendingImport);\n    setState(pendingImport);\n    setLanguage(pendingImport.preferences.language);\n    pendingImport = null;\n    closeModal();\n    ui.route = \"dashboard\";\n    render();\n    toast(\"تم استيراد الحفظة.\");\n  },\n  \"new-game\": async () =>\n    openModal(\n      `<h2>تبدأ حكاية جديدة؟</h2><p class=\"muted\">الحفظة الجديدة هتستبدل الحالية عند بدء اللعب. صدّر الحالية لو حابب ترجع لها.</p><div class=\"modal-actions\">${button(\"تصدير الحالية\", \"export-save\", \"\", \"secondary\")}${button(\"اختيار نادي جديد\", \"confirm-new\", \"\", \"danger\")}</div>`,\n    ),\n  \"confirm-new\": async () => {\n    closeModal();\n    setState(null);\n    render();\n    window.scrollTo(0, 0);\n  },\n  \"modal-inbox\": async () => navigate(\"inbox\"),\n  more: async () =>\n    openModal(\n      `<h2>إدارة النادي</h2>${NAV_GROUPS.map(\n        (g) =>\n          `<div class=\"more-group\"><small>${g.caption}</small><div class=\"more-grid\">${g.items\n            .map(\n              (id) =>\n                `<button data-nav=\"${id}\">${icon(NAV_BY_ID[id].icon, 24)}<span>${NAV_BY_ID[id].name}</span></button>`,\n            )\n            .join(\"\")}</div></div>`,\n      ).join(\"\")}<div class=\"more-foot\"><span data-no-translate>EMPIRE FC</span><button type=\"button\" class=\"badge vault-key\" data-action=\"secret-vault\">v${APP_VERSION}</button></div>`,\n    ),\n    \"open-auth-modal\": () => openModal(authModalContent(\"login\")),\n  \"auth-tab-login\": () => openModal(authModalContent(\"login\")),\n  \"auth-tab-register\": () => openModal(authModalContent(\"register\")),\n  \"cloud-logout\": async () => {\n    await authLogout();\n    toast(\"تم تسجيل الخروج بنجاح.\");\n    render();\n  },\n  \"cloud-sync-now\": async () => {\n    if (!isAuthenticated()) {\n      openModal(authModalContent(\"login\"));\n      return;\n    }\n    const s = getState();\n    if (!s) {\n      toast(\"لا توجد مسيرة نشطة حاليًا للمزامنة.\");\n      return;\n    }\n    try {\n      toast(\"جارٍ رفع الحفظة إلى السحابة…\");\n      await uploadSaveToCloud(s);\n      toast(\"تمت المزامنة السحابية بنجاح!\");\n      render();\n    } catch (err) {\n      showError(err.message || \"تعذر إتمام المزامنة السحابية.\");\n    }\n  },\n  \"cloud-restore-prompt\": async () => {\n    if (!isAuthenticated()) {\n      openModal(authModalContent(\"login\"));\n      return;\n    }\n    try {\n      toast(\"جارٍ فحص الحفظات على السحابة…\");\n      const save = await fetchLatestCloudSave();\n      if (!save) {\n        openModal(`<h2>المزامنة السحابية</h2><p class=\"muted\">لا توجد أي حفظة سحابية مسجلة لحسابك حتى الآن. يمكنك مزامنة ناديك الحالي أولًا.</p><div class=\"modal-actions\">${button(\"حسنًا\", \"close-modal\", \"\", \"primary\")}</div>`);\n        return;\n      }\n      const local = getState();\n      const diff = compareCloudWithLocal(local, save);\n      openModal(`\n        <span class=\"eyebrow\">المزامنة السحابية</span>\n        <h2>استرجاع الحفظة السحابية؟</h2>\n        <p class=\"muted\">سيتم استبدال الحفظة النشطة على جهازك بالنسخة المحفوظة سحابيًا.</p>\n        <div class=\"cloud-diff-grid\">\n          <div class=\"cloud-diff-col\">\n            <h4>الحفظة المحلية الحالية</h4>\n            <div><span>النادي:</span><b>${diff?.local ? diff.local.clubName : \"لا توجد\"}</b></div>\n            <div><span>الموسم:</span><b>${diff?.local ? diff.local.season : \"—\"}</b></div>\n            <div><span>التاريخ:</span><b>${diff?.local ? date(diff.local.date) : \"—\"}</b></div>\n            <div><span>السيولة:</span><b>${diff?.local ? money(diff.local.cash) + \" \" + cur() : \"—\"}</b></div>\n          </div>\n          <div class=\"cloud-diff-col\">\n            <h4>الحفظة على السحابة</h4>\n            <div><span>النادي:</span><b>${diff.cloud.clubName}</b></div>\n            <div><span>الموسم:</span><b>${diff.cloud.season}</b></div>\n            <div><span>التاريخ:</span><b>${date(diff.cloud.date)}</b></div>\n            <div><span>السيولة:</span><b>${money(diff.cloud.cash)} ${cur()}</b></div>\n            <div><span>الجهاز:</span><b>${diff.cloud.device || \"متصفح\"}</b></div>\n          </div>\n        </div>\n        <div class=\"modal-actions\">\n          ${button(\"استرجاع الحفظة ومتابعة اللعب\", \"confirm-cloud-restore\", save.id, \"primary\")}\n          ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")}\n        </div>\n      `);\n    } catch (err) {\n      showError(err.message || \"تعذر جلب الحفظة من السحابة.\");\n    }\n  },\n  \"confirm-cloud-restore\": async (btn) => {\n    const saveId = btn?.dataset?.id;\n    try {\n      closeModal();\n      toast(\"جارٍ تنزيل واسترجاع الحفظة…\");\n      const { state } = await downloadCloudSave(saveId);\n      await saveGame(state);\n      setState(state);\n      setLanguage(state.preferences.language);\n      ui.route = \"dashboard\";\n      render();\n      toast(\"تم استرجاع ناديك من السحابة بنجاح!\");\n    } catch (err) {\n      showError(err.message || \"تعذر فك واستعادة الحفظة السحابية.\");\n    }\n  },\n  \"cloud-saves-list\": async () => {\n    if (!isAuthenticated()) {\n      openModal(authModalContent(\"login\"));\n      return;\n    }\n    try {\n      toast(\"جارٍ جلب سجل الحفظات…\");\n      const saves = await listCloudSaves();\n      if (!saves.length) {\n        openModal(`<h2>سجل الحفظات السحابية</h2><p class=\"muted\">لا توجد حفظات سحابية مسجلة بعد.</p><div class=\"modal-actions\">${button(\"إغلاق\", \"close-modal\", \"\", \"primary\")}</div>`);\n        return;\n      }\n      openModal(`\n        <h2>سجل الحفظات السحابية</h2>\n        <p class=\"muted\">يتم الاحتفاظ بآخر ٥ حفظات لحسابك تلقائيًا. يمكنك استرجاع أي نسخة أو حذفها.</p>\n        <div class=\"cloud-saves-container\">\n          ${saves.map(s => `\n            <div class=\"cloud-save-item\">\n              <div class=\"cloud-save-info\">\n                <strong>${s.metadata.clubName} · الموسم ${s.metadata.seasonNumber}</strong>\n                <small>${date(s.metadata.date)} · السيولة ${money(s.metadata.cash)} ${cur()} · ${s.metadata.device || \"متصفح\"}</small>\n                <small class=\"muted\">المزامنة: ${new Date(s.updatedAt).toLocaleString(\"ar-EG\")}</small>\n              </div>\n              <div class=\"settings-actions\">\n                ${button(\"استرجاع\", \"confirm-cloud-restore\", s.id, \"secondary small\")}\n                ${button(\"حذف\", \"delete-cloud-save\", s.id, \"danger small\")}\n              </div>\n            </div>\n          `).join(\"\")}\n        </div>\n        <div class=\"modal-actions\" style=\"margin-top: 15px;\">\n          ${button(\"إغلاق\", \"close-modal\", \"\", \"ghost\")}\n        </div>\n      `);\n    } catch (err) {\n      showError(err.message || \"تعذر جلب سجل الحفظات.\");\n    }\n  },\n  \"delete-cloud-save\": async (btn) => {\n    const saveId = btn?.dataset?.id;\n    if (!saveId) return;\n    try {\n      await deleteCloudSave(saveId);\n      toast(\"تم حذف النسخة السحابية.\");\n      actions[\"cloud-saves-list\"]();\n    } catch (err) {\n      showError(err.message || \"تعذر حذف الحفظة.\");\n    }\n  },\n\n  \"close-modal\": closeModal,\n};\ndocument.addEventListener(\"click\", async (e) => {\n  if (isSaving() || actionBusy) {\n    toast(tr(\"جارٍ حفظ القرار…\", \"Saving decision…\", \"Enregistrement…\"));\n    return;\n  }\n  const nav = e.target.closest(\"[data-nav]\");\n  if (nav) {\n    navigate(nav.dataset.nav);\n    return;\n  }\n  if (e.target.classList.contains(\"modal-backdrop\")) {\n    closeModal();\n    return;\n  }\n  const el = e.target.closest(\"[data-action]\");\n  if (!el) return;\n  try {\n    actionBusy = true;\n    await actions[el.dataset.action]?.(el);\n  } catch (err) {\n    showError(err.message);\n  } finally {\n    actionBusy = false;\n  }\n});\ndocument.addEventListener(\"submit\", async (e) => {\n  const form = e.target;\n  if (!form.matches(\"form\")) return;\n  e.preventDefault();\n  if (isSaving() || actionBusy) return;\n  try {\n        if (form.id === \"auth-login-form\") {\n      const id = form.elements.identifier.value;\n      const pass = form.elements.password.value;\n      try {\n        await authLogin(id, pass);\n        closeModal();\n        toast(\"تم تسجيل الدخول بنجاح!\");\n        render();\n      } catch (err) {\n        openModal(authModalContent(\"login\", err.message));\n      }\n      return;\n    }\n    if (form.id === \"auth-register-form\") {\n      const email = form.elements.email.value;\n      const username = form.elements.username.value;\n      const pass = form.elements.password.value;\n      try {\n        await authRegister(email, username, pass);\n        closeModal();\n        toast(\"تم إنشاء الحساب وتسجيل الدخول بنجاح!\");\n        render();\n      } catch (err) {\n        openModal(authModalContent(\"register\", err.message));\n      }\n      return;\n    }\n\n    if (form.id === \"talent-mission-form\") {\n      const t = Object.fromEntries(new FormData(form));\n      await apply((s) => requestMission(s, t));\n    }\n    if (form.id === \"talent-training-form\") {\n      ui.talentPlayer = form.elements.playerId.value;\n      const t = Object.fromEntries(new FormData(form));\n      await apply((s) => setTraining(s, t.playerId, t.focus, t.intensity));\n    }\n    if (form.id === \"commerce-prices\") {\n      const ticket = Number(form.elements.ticket.value),\n        shirt = Number(form.elements.shirt.value);\n      await apply((s) => setPrices(s, ticket, shirt));\n    }\n    if (form.id === \"shop-stock\") {\n      const quantity = Number(form.elements.quantity.value);\n      await apply((s) => stockShirts(s, quantity));\n    }\n    if (form.id === \"staff-hire-form\") {\n      await apply((s) =>\n        hireStaff(s, form.dataset.id, form.elements.staffRole.value),\n      );\n      closeModal();\n    }\n    if (form.id === \"scout-task-form\") {\n      await apply((s) =>\n        scoutAssignment(s, form.dataset.id, form.elements.playerId.value),\n      );\n      closeModal();\n    }\n    if (form.id === \"offer-form\") {\n      await apply(\n        (s) => {\n          const r = submitOffer(s, form.dataset.player, {\n            fee: Number(form.elements.fee.value),\n            upfrontPercent: Number(form.elements.upfront.value),\n          });\n          markStep(s, \"offer\");\n          return r;\n        },\n        \"العرض اتبعت. مرّر يومًا عشان يوصلك الرد.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"loan-offer-form\") {\n      const f = form.elements;\n      const terms = {\n        days: Number(f.days.value),\n        fee: Number(f.fee.value),\n        wageShare: Number(f.wageShare.value),\n        buyOption: Number(f.buyOption.value),\n        recallAllowed: f.recallAllowed.checked,\n        role: f.role.value,\n        borrower: f.borrower?.value,\n      };\n      await apply((s) => requestLoan(s, form.dataset.player, terms));\n      closeModal();\n    }\n    if (form.id === \"contract-form\") {\n      let releaseClause = Number(form.elements.releaseClause.value);\n      const clauseLevel = form.elements.clauseLevel?.value;\n      if (clauseLevel) {\n        const baseInput = document.getElementById(\"release-clause-input\");\n        // إذا اختار مستوى، نستخدم القيمة المحسوبة من المستوى إن لم يعدلها يدويًا بشكل كبير\n        const selectedOption = form.elements.clauseLevel.selectedOptions[0];\n        const levelClause = Number(selectedOption?.dataset?.clause || 0);\n        if (levelClause === 0) releaseClause = 0;\n        else if (Math.abs(releaseClause - levelClause) < levelClause * 0.5) releaseClause = levelClause;\n      }\n      const terms = {\n        salary: Number(form.elements.salary.value),\n        years: Number(form.elements.years.value),\n        bonus: Number(form.elements.bonus.value),\n        role: form.elements.role.value,\n        appearanceBonus: Number(form.elements.appearanceBonus.value),\n        goalBonus: Number(form.elements.goalBonus.value),\n        annualRaisePct: Number(form.elements.annualRaisePct.value),\n        releaseClause,\n        clauseLevel,\n      };\n      await apply(\n        (s) =>\n          form.dataset.renew === \"true\"\n            ? renewPlayer(s, form.dataset.ref, terms)\n            : signPlayer(s, form.dataset.ref, terms),\n        \"تم توقيع العقد وتحديث السجل المالي.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"black-charity\") {\n      const amount = Number(form.elements.amount.value);\n      await apply((s) => {\n        const { donateCharity } = requireBlack();\n        return donateCharity(s, amount);\n      }, \"تم التبرع الخيري وخفض الشبهات.\");\n    }\n    if (form.id === \"legend-offer-form\") {\n      const role = form.elements.role.value;\n      const years = Number(form.elements.years.value);\n      await apply(\n        (s) => signLegend(s, form.dataset.id, role, years),\n        \"تم توقيع عقد الأسطورة.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"legend-renew-form\") {\n      const years = Number(form.elements.years.value);\n      await apply(\n        (s) => renewLegend(s, form.dataset.id, years),\n        \"تم تجديد عقد الأسطورة.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"coach-form\") {\n      const years = Number(form.elements.years.value);\n      await apply(\n        (s) =>\n          form.dataset.mode === \"renew\"\n            ? renewCoach(s, years)\n            : appointCoach(s, form.dataset.id, years),\n        form.dataset.mode === \"renew\"\n          ? \"تم تجديد عقد المدرب.\"\n          : \"تم تعيين المدرب الجديد.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"project-form\") {\n      await apply(\n        (s) => {\n          const r = startProject(\n            s,\n            form.dataset.id,\n            form.elements.speed.value === \"fast\",\n          );\n          markStep(s, \"facility\");\n          return r;\n        },\n        \"المشروع بدأ. موعد الاستلام واتفاق الدفع في البريد.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"ticket-form\") {\n      const p = Number(form.elements.price.value);\n      if (!Number.isInteger(p) || p < 50 || p > 500)\n        throw new Error(\"السعر من ٥٠ إلى ٥٠٠ جنيه.\");\n      const first = Number(form.elements.first.value),\n        vip = Number(form.elements.vip.value),\n        premium = Number(form.elements.premium.value);\n      await apply((s) => {\n        s.ticketPrice = p;\n        setCategoryPrices(s, { first, vip });\n        setMatchPremium(s, premium);\n      }, \"تم اعتماد أسعار الفئات والعلاوة للمباريات القادمة.\");\n      closeModal();\n    }\n  } catch (err) {\n    showError(err.message);\n  }\n});\ndocument.addEventListener(\"input\", (e) => {\n  if (e.target.closest(\"#offer-form,#contract-form\")) updateCalculations();\n  if (e.target.id === \"palette-input\") {\n    paletteQuery(e.target.value);\n    return;\n  }\n  if (e.target.id === \"player-search\") {\n    const value = e.target.value,\n      pos = e.target.selectionStart;\n    ui.playerFilters.search = value;\n    ui.playerFilters.page = 0;\n    render();\n    const input = document.getElementById(\"player-search\");\n    input.focus();\n    input.setSelectionRange(pos, pos);\n  }\n});\n// اختصارات البحث السريع: Ctrl/⌘+K للفتح والإغلاق، والأسهم وEnter للتنقل داخل النتائج.\ndocument.addEventListener(\"keydown\", (e) => {\n  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === \"k\") {\n    e.preventDefault();\n    ui.palette.open ? closePalette() : openPalette();\n    return;\n  }\n  if (!ui.palette.open) return;\n  if (e.key === \"Escape\") closePalette();\n  else if (e.key === \"ArrowDown\") {\n    e.preventDefault();\n    paletteMove(1);\n  } else if (e.key === \"ArrowUp\") {\n    e.preventDefault();\n    paletteMove(-1);\n  } else if (e.key === \"Enter\") {\n    e.preventDefault();\n    paletteActivate(ui.palette.sel);\n  }\n});\ndocument.addEventListener(\"change\", async (e) => {\n  if (isSaving() || actionBusy) return;\n  try {\n    if (e.target.id === \"talent-training-player\") {\n      ui.talentPlayer = e.target.value;\n      const plan = getState().talent.training[ui.talentPlayer] || {\n        focus: \"balanced\",\n        intensity: \"normal\",\n      };\n      const form = e.target.form;\n      form.elements.focus.value = plan.focus;\n      form.elements.intensity.value = plan.intensity;\n      return;\n    }\n    if (e.target.dataset.playerRole) {\n      const id = e.target.dataset.playerRole,\n        role = e.target.value;\n      await apply((s) => setPlayerRole(s, id, role));\n      return;\n    }\n    if (e.target.dataset.tactical) {\n      const key = e.target.dataset.tactical,\n        value = e.target.value;\n      await apply((s) => setTactics(s, { [key]: value }));\n      return;\n    }\n    if (e.target.id === \"team-tactic\") {\n      const tactic = e.target.value;\n      await apply((s) => setTactic(s, tactic));\n      return;\n    }\n    if (e.target.id === \"division-view\") {\n      ui.expandedDivision = e.target.value;\n      render();\n      return;\n    }\n    if (\n      [\n        \"setup-career-mode\",\n        \"setup-region\",\n        \"setup-tier\",\n        \"setup-group\",\n        \"setup-expanded-club\",\n      ].includes(e.target.id)\n    ) {\n      ui.owner = document.getElementById(\"owner-name\")?.value || \"\";\n      ui.leagues = [\n        ...document.querySelectorAll(\"input[name=league]:checked\"),\n      ].map((x) => x.value);\n      if (e.target.id === \"setup-career-mode\") {\n        ui.setupConfig.expanded = e.target.value === \"expanded\";\n        ui.setupConfig.database = \"world\";\n        ui.setupClub = \"ahly\";\n      }\n      if (e.target.id === \"setup-region\") {\n        const c = EXPANDED_CLUBS.find(\n          (c) => c.selectable && c.country === e.target.value,\n        );\n        if (!c) throw Error(\"لا تتوفر قوائم للبدء في هذا البلد.\");\n        ui.setupClub = c.id;\n      }\n      if (e.target.id === \"setup-tier\") {\n        const country = extendedClub(ui.setupClub).country;\n        const c = EXPANDED_CLUBS.find(\n          (c) =>\n            c.selectable &&\n            c.country === country &&\n            c.tier === Number(e.target.value),\n        );\n        if (!c) throw Error(\"هذه الدرجة غير متاحة.\");\n        ui.setupClub = c.id;\n      }\n      if (e.target.id === \"setup-group\")\n        ui.setupClub = DIVISIONS.find((d) => d.id === e.target.value).clubs[0];\n      if (e.target.id === \"setup-expanded-club\") ui.setupClub = e.target.value;\n      render();\n      return;\n    }\n    if (\n      e.target.id === \"setup-language\" ||\n      e.target.name === \"difficulty\" ||\n      e.target.id === \"setup-database\"\n    ) {\n      ui.owner = document.getElementById(\"owner-name\")?.value || \"\";\n      ui.leagues = [\n        ...document.querySelectorAll": [
    "Black files 348",
    "Dossiers noirs 348",
  ],
  "abord la sauvegarde actuelle pour une copie externe.\")}</p><div class=\"modal-actions\">${button(tr(\"تحميل واستبدال\", \"Load and replace\", \"Charger et remplacer\"), \"slot-load-confirm\", meta.id, \"primary\")}${button(tr(\"إلغاء\", \"Cancel\", \"Annuler\"), \"close-modal\", \"\", \"secondary\")}</div>`,\n    );\n  },\n  \"slot-load-confirm\": async (el) => {\n    document.body.classList.add(\"saving-game\");\n    let state = null;\n    try {\n      state = await readSlot(el.dataset.id);\n      await saveGame(state);\n    } catch (e) {\n      document.body.classList.remove(\"saving-game\");\n      showError(e.message);\n      return;\n    }\n    document.body.classList.remove(\"saving-game\");\n    setState(state);\n    setLanguage(state.preferences?.language || getLanguage());\n    closeModal();\n    // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة.\n    location.reload();\n  },\n  \"slot-delete\": async (el) => {\n    try {\n      await deleteSlot(el.dataset.id);\n      toast(\"حُذفت الخانة.\");\n    } catch (e) {\n      showError(e.message);\n    }\n    render();\n  },\n  \"open-message\": async (el) => {\n    await apply((s) => {\n      const m = s.inbox.find((m) => m.id === el.dataset.id);\n      if (m) m.read = true;\n    });\n    ui.message = el.dataset.id;\n    ui.route = \"inbox\";\n    ui.inboxFilter = \"all\";\n    render();\n    if (innerWidth < 760)\n      document\n        .querySelector(\".message-detail\")\n        ?.scrollIntoView({ behavior: \"smooth\", block: \"start\" });\n  },\n  \"inbox-filter\": async (el) => {\n    ui.inboxFilter = el.dataset.id;\n    ui.message = null;\n    render();\n  },\n  \"read-all\": async () =>\n    await apply(\n      (s) => s.inbox.forEach((m) => (m.read = true)),\n      \"تم تعليم كل الرسائل كمقروءة. القرارات المطلوبة ما زالت نشطة.\",\n    ),\n  resolve: async (el) => {\n    await apply((s) => resolveInfo(s, el.dataset.id), \"تم تسجيل قرارك.\");\n  },\n  \"go-finance\": async (el) => {\n    navigate(\"finance\");\n    toast(\"راجع التمويل، ثم عُد للبريد لتأكيد التعامل مع تنبيه السيولة.\");\n  },\n  \"player-detail\": async (el) => showPlayer(el.dataset.id),\n  \"transfer-offer\": async (el) => {\n    const s = getState(),\n      p = s.players.find((p) => p.id === el.dataset.id);\n    openModal(offerForm(s, p));\n    updateCalculations();\n  },\n  \"accept-club\": async (el) => {\n    await apply(\n      (s) => acceptClub(s, el.dataset.id),\n      \"تم الاتفاق مع النادي. باقي عقد اللاعب.\",\n    );\n    showContract(el.dataset.id);\n  },\n  \"reject-transfer\": async (el) => {\n    await apply(\n      (s) => rejectNegotiation(s, el.dataset.id),\n      \"تم إنهاء التفاوض بدون خصم أموال.\",\n    );\n  },\n  \"player-contract\": async (el) => showContract(el.dataset.id),\n  \"renew-player\": async (el) => showContract(el.dataset.id, true),\n  \"facility-detail\": async (el) =>\n    openModal(facilityDetail(getState(), el.dataset.id)),\n  \"toggle-staff\": async (el) => {\n    await apply(\n      (s) => toggleFacilityStaff(s, el.dataset.id),\n      \"تم تحديث طاقم المنشأة.\",\n    );\n    openModal(facilityDetail(getState(), el.dataset.id));\n  },\n  \"sponsor-offers\": async (el) => showOffers(el.dataset.id),\n  \"sponsor-detail\": async (el) =>\n    openModal(sponsorDetail(getState(), el.dataset.id)),\n  \"confirm-sponsor\": async (el) => {\n    const s = getState(),\n      offer = offersFor(s, el.dataset.asset).find(\n        (o) => o.sponsorId === el.dataset.id,\n      ),\n      sp = resolveSponsor(offer.sponsorId),\n      asset = ASSETS.find((x) => x.id === offer.assetId);\n    openModal(\n      `<span class=\"eyebrow\">قبل الالتزام</span><h2>${sp.name} × ${asset.name}</h2><p class=\"muted\">عقد ٣٦٠ يومًا بقيمة ${money(offer.amount)} ${cur()}، ومقدم ${money(Math.floor(offer.amount * 0.25))} ${cur()}. تشمل مكافآت أداء موحدة تُصرف تلقائيًا.</p><div class=\"effect-card\"><h4>الحقوق والالتزامات</h4><p>سيتم حجز ${asset.name} طوال مدة العقد. ${offer.exclusive ? \"العقد حصري لقطاع \" + sp.sector + \"؛ يمنع التعاقد مع منافس في نفس القطاع.\" : \"بدون حصرية قطاع؛ مساحة الإعلان نفسها محجوزة لهذا الشريك فقط.\"}</p><small>الباقي على ١١ دفعة متساوية تقريبًا كل ٣٠ يومًا. الفسخ المبكر غير متاح في هذه النسخة.</small></div><div class=\"modal-actions\"><button class=\"btn primary\" data-action=\"sign-sponsor\" data-id=\"${sp.id}\" data-asset=\"${asset.id}\">توقيع العقد واستلام المقدم ${icon(\"check\", 17)}</button></div>`,\n    );\n  },\n  \"sign-sponsor\": async (el) => {\n    await apply((s) => {\n      const offer = offersFor(s, el.dataset.asset).find(\n        (o) => o.sponsorId === el.dataset.id,\n      );\n      signSponsor(s, offer);\n      markStep(s, \"sponsor\");\n    }, \"تم توقيع الرعاية وإيداع المقدم في الخزينة.\");\n    closeModal();\n  },\n  \"negotiate-sponsor\": async (el) =>\n    openModal(sponsorNegotiate(getState(), el.dataset.asset, el.dataset.id)),\n  \"sponsor-demand\": async (el) => {\n    let deal = null;\n    await apply((s) => {\n      deal = negotiateSponsor(\n        s,\n        el.dataset.asset,\n        el.dataset.id,\n        Number(el.dataset.raise),\n      );\n    });\n    if (deal) openModal(sponsorDealResult(getState(), deal));\n  },\n  \"sign-sponsor-deal\": async (el) => {\n    await apply((s) => {\n      const offer = answerSponsorDeal(s, el.dataset.id, true);\n      signSponsor(s, offer);\n    }, \"تم توقيع الرعاية بالقيمة المتفاوض عليها وإيداع المقدم.\");\n    closeModal();\n  },\n  \"finance-tab\": async (el) => {\n    ui.financeTab = el.dataset.id;\n    render();\n  },\n  \"world-tab\": async (el) => {\n    ui.worldTab = el.dataset.id;\n    render();\n  },\n  \"loan-modal\": async () =>\n    openModal(\n      `<span class=\"eyebrow\">تمويل تجريبي ثابت</span><h2>مساحة أكبر للسيولة… والتزام جديد</h2><div class=\"profile-stats\"><div><small>المبلغ المستلم</small><strong>٥ ملايين ${cur()}</strong></div><div><small>إجمالي السداد</small><strong>٥٫٤ مليون ${cur()}</strong></div><div><small>الدفعة كل ٣٠ يومًا</small><strong>٤٥٠ ألف ${cur()}</strong></div></div><p class=\"muted\">١٢ دفعة تشمل تكلفة تمويل ثابتة ٤٠٠ ألف جنيه. حد أقصى قرضان خلال الحفظة التجريبية. لا يتضمن نموذج فائدة مركبة أو شروط بنك حقيقي.</p>${infoNote(\"التمويل مش إيراد تشغيلي. القسط بيتسدد تلقائيًا حتى لو أدى لعجز في السيولة.\")}<div class=\"modal-actions\">${button(\"اعتماد التمويل\", \"take-loan\", \"\", \"primary\")}</div>`,\n    ),\n  \"take-loan\": async () => {\n    await apply(takeLoan, \"تم إيداع التمويل وجدولة الأقساط.\");\n    closeModal();\n  },\n  \"ticket-price\": async () => {\n    const s = getState(),\n      prices = categoryPrices(s);\n    openModal(\n      `<h2>تسعير تذاكر المباريات</h2><p class=\"muted\">السعر الأعلى يرفع العائد لكل مشجع، لكنه يقلل الطلب. المقصورة أقل تأثرًا بالغلاء من العادية. أصحاب الاشتراكات يشغلون مقاعد العادية أولًا ولا يُحصّلون مرتين.</p><form id=\"ticket-form\"><div class=\"form-grid\"><label class=\"field\"><span>العادية (70٪ من السعة)</span><input type=\"number\" name=\"price\" value=\"${s.ticketPrice}\" min=\"50\" max=\"500\" required></label><label class=\"field\"><span>الأولى (20٪ · 40–2000)</span><input type=\"number\" name=\"first\" value=\"${prices.first}\" min=\"40\" max=\"2000\" required></label><label class=\"field\"><span>المقصورة (10٪ · 100–5000)</span><input type=\"number\" name=\"vip\" value=\"${prices.vip}\" min=\"100\" max=\"5000\" required></label><label class=\"field\"><span>علاوة المباراة البيتية القادمة</span><select name=\"premium\"><option value=\"0\">بدون علاوة</option><option value=\"25\">+٢٥٪ مباراة كبيرة</option><option value=\"50\">+٥٠٪ قمة</option><option value=\"100\">+١٠٠٪ ديربي ناري</option></select></label></div><div class=\"modal-actions\"><button type=\"submit\" class=\"btn primary\">حفظ أسعار التذاكر</button></div></form>`,\n    );\n  },\n  \"export-save\": async () => {\n    await exportGame(getState());\n    toast(\"تم تجهيز ملف الحفظ للتنزيل.\");\n  },\n  \"import-save\": chooseImport,\n  \"confirm-import\": async () => {\n    if (!pendingImport) return;\n    await saveGame(pendingImport);\n    setState(pendingImport);\n    setLanguage(pendingImport.preferences.language);\n    pendingImport = null;\n    closeModal();\n    ui.route = \"dashboard\";\n    render();\n    toast(\"تم استيراد الحفظة.\");\n  },\n  \"new-game\": async () =>\n    openModal(\n      `<h2>تبدأ حكاية جديدة؟</h2><p class=\"muted\">الحفظة الجديدة هتستبدل الحالية عند بدء اللعب. صدّر الحالية لو حابب ترجع لها.</p><div class=\"modal-actions\">${button(\"تصدير الحالية\", \"export-save\", \"\", \"secondary\")}${button(\"اختيار نادي جديد\", \"confirm-new\", \"\", \"danger\")}</div>`,\n    ),\n  \"confirm-new\": async () => {\n    closeModal();\n    setState(null);\n    render();\n    window.scrollTo(0, 0);\n  },\n  \"modal-inbox\": async () => navigate(\"inbox\"),\n  more: async () =>\n    openModal(\n      `<h2>إدارة النادي</h2>${NAV_GROUPS.map(\n        (g) =>\n          `<div class=\"more-group\"><small>${g.caption}</small><div class=\"more-grid\">${g.items\n            .map(\n              (id) =>\n                `<button data-nav=\"${id}\">${icon(NAV_BY_ID[id].icon, 24)}<span>${NAV_BY_ID[id].name}</span></button>`,\n            )\n            .join(\"\")}</div></div>`,\n      ).join(\"\")}<div class=\"more-foot\"><span data-no-translate>EMPIRE FC</span><button type=\"button\" class=\"badge vault-key\" data-action=\"secret-vault\">v${APP_VERSION}</button></div>`,\n    ),\n    \"open-auth-modal\": () => openModal(authModalContent(\"login\")),\n  \"auth-tab-login\": () => openModal(authModalContent(\"login\")),\n  \"auth-tab-register\": () => openModal(authModalContent(\"register\")),\n  \"cloud-logout\": async () => {\n    await authLogout();\n    toast(\"تم تسجيل الخروج بنجاح.\");\n    render();\n  },\n  \"cloud-sync-now\": async () => {\n    if (!isAuthenticated()) {\n      openModal(authModalContent(\"login\"));\n      return;\n    }\n    const s = getState();\n    if (!s) {\n      toast(\"لا توجد مسيرة نشطة حاليًا للمزامنة.\");\n      return;\n    }\n    try {\n      toast(\"جارٍ رفع الحفظة إلى السحابة…\");\n      await uploadSaveToCloud(s);\n      toast(\"تمت المزامنة السحابية بنجاح!\");\n      render();\n    } catch (err) {\n      showError(err.message || \"تعذر إتمام المزامنة السحابية.\");\n    }\n  },\n  \"cloud-restore-prompt\": async () => {\n    if (!isAuthenticated()) {\n      openModal(authModalContent(\"login\"));\n      return;\n    }\n    try {\n      toast(\"جارٍ فحص الحفظات على السحابة…\");\n      const save = await fetchLatestCloudSave();\n      if (!save) {\n        openModal(`<h2>المزامنة السحابية</h2><p class=\"muted\">لا توجد أي حفظة سحابية مسجلة لحسابك حتى الآن. يمكنك مزامنة ناديك الحالي أولًا.</p><div class=\"modal-actions\">${button(\"حسنًا\", \"close-modal\", \"\", \"primary\")}</div>`);\n        return;\n      }\n      const local = getState();\n      const diff = compareCloudWithLocal(local, save);\n      openModal(`\n        <span class=\"eyebrow\">المزامنة السحابية</span>\n        <h2>استرجاع الحفظة السحابية؟</h2>\n        <p class=\"muted\">سيتم استبدال الحفظة النشطة على جهازك بالنسخة المحفوظة سحابيًا.</p>\n        <div class=\"cloud-diff-grid\">\n          <div class=\"cloud-diff-col\">\n            <h4>الحفظة المحلية الحالية</h4>\n            <div><span>النادي:</span><b>${diff?.local ? diff.local.clubName : \"لا توجد\"}</b></div>\n            <div><span>الموسم:</span><b>${diff?.local ? diff.local.season : \"—\"}</b></div>\n            <div><span>التاريخ:</span><b>${diff?.local ? date(diff.local.date) : \"—\"}</b></div>\n            <div><span>السيولة:</span><b>${diff?.local ? money(diff.local.cash) + \" \" + cur() : \"—\"}</b></div>\n          </div>\n          <div class=\"cloud-diff-col\">\n            <h4>الحفظة على السحابة</h4>\n            <div><span>النادي:</span><b>${diff.cloud.clubName}</b></div>\n            <div><span>الموسم:</span><b>${diff.cloud.season}</b></div>\n            <div><span>التاريخ:</span><b>${date(diff.cloud.date)}</b></div>\n            <div><span>السيولة:</span><b>${money(diff.cloud.cash)} ${cur()}</b></div>\n            <div><span>الجهاز:</span><b>${diff.cloud.device || \"متصفح\"}</b></div>\n          </div>\n        </div>\n        <div class=\"modal-actions\">\n          ${button(\"استرجاع الحفظة ومتابعة اللعب\", \"confirm-cloud-restore\", save.id, \"primary\")}\n          ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")}\n        </div>\n      `);\n    } catch (err) {\n      showError(err.message || \"تعذر جلب الحفظة من السحابة.\");\n    }\n  },\n  \"confirm-cloud-restore\": async (btn) => {\n    const saveId = btn?.dataset?.id;\n    try {\n      closeModal();\n      toast(\"جارٍ تنزيل واسترجاع الحفظة…\");\n      const { state } = await downloadCloudSave(saveId);\n      await saveGame(state);\n      setState(state);\n      setLanguage(state.preferences.language);\n      ui.route = \"dashboard\";\n      render();\n      toast(\"تم استرجاع ناديك من السحابة بنجاح!\");\n    } catch (err) {\n      showError(err.message || \"تعذر فك واستعادة الحفظة السحابية.\");\n    }\n  },\n  \"cloud-saves-list\": async () => {\n    if (!isAuthenticated()) {\n      openModal(authModalContent(\"login\"));\n      return;\n    }\n    try {\n      toast(\"جارٍ جلب سجل الحفظات…\");\n      const saves = await listCloudSaves();\n      if (!saves.length) {\n        openModal(`<h2>سجل الحفظات السحابية</h2><p class=\"muted\">لا توجد حفظات سحابية مسجلة بعد.</p><div class=\"modal-actions\">${button(\"إغلاق\", \"close-modal\", \"\", \"primary\")}</div>`);\n        return;\n      }\n      openModal(`\n        <h2>سجل الحفظات السحابية</h2>\n        <p class=\"muted\">يتم الاحتفاظ بآخر ٥ حفظات لحسابك تلقائيًا. يمكنك استرجاع أي نسخة أو حذفها.</p>\n        <div class=\"cloud-saves-container\">\n          ${saves.map(s => `\n            <div class=\"cloud-save-item\">\n              <div class=\"cloud-save-info\">\n                <strong>${s.metadata.clubName} · الموسم ${s.metadata.seasonNumber}</strong>\n                <small>${date(s.metadata.date)} · السيولة ${money(s.metadata.cash)} ${cur()} · ${s.metadata.device || \"متصفح\"}</small>\n                <small class=\"muted\">المزامنة: ${new Date(s.updatedAt).toLocaleString(\"ar-EG\")}</small>\n              </div>\n              <div class=\"settings-actions\">\n                ${button(\"استرجاع\", \"confirm-cloud-restore\", s.id, \"secondary small\")}\n                ${button(\"حذف\", \"delete-cloud-save\", s.id, \"danger small\")}\n              </div>\n            </div>\n          `).join(\"\")}\n        </div>\n        <div class=\"modal-actions\" style=\"margin-top: 15px;\">\n          ${button(\"إغلاق\", \"close-modal\", \"\", \"ghost\")}\n        </div>\n      `);\n    } catch (err) {\n      showError(err.message || \"تعذر جلب سجل الحفظات.\");\n    }\n  },\n  \"delete-cloud-save\": async (btn) => {\n    const saveId = btn?.dataset?.id;\n    if (!saveId) return;\n    try {\n      await deleteCloudSave(saveId);\n      toast(\"تم حذف النسخة السحابية.\");\n      actions[\"cloud-saves-list\"]();\n    } catch (err) {\n      showError(err.message || \"تعذر حذف الحفظة.\");\n    }\n  },\n\n  \"close-modal\": closeModal,\n};\ndocument.addEventListener(\"click\", async (e) => {\n  if (isSaving() || actionBusy) {\n    toast(tr(\"جارٍ حفظ القرار…\", \"Saving decision…\", \"Enregistrement…\"));\n    return;\n  }\n  const nav = e.target.closest(\"[data-nav]\");\n  if (nav) {\n    navigate(nav.dataset.nav);\n    return;\n  }\n  if (e.target.classList.contains(\"modal-backdrop\")) {\n    closeModal();\n    return;\n  }\n  const el = e.target.closest(\"[data-action]\");\n  if (!el) return;\n  try {\n    actionBusy = true;\n    await actions[el.dataset.action]?.(el);\n  } catch (err) {\n    showError(err.message);\n  } finally {\n    actionBusy = false;\n  }\n});\ndocument.addEventListener(\"submit\", async (e) => {\n  const form = e.target;\n  if (!form.matches(\"form\")) return;\n  e.preventDefault();\n  if (isSaving() || actionBusy) return;\n  try {\n        if (form.id === \"auth-login-form\") {\n      const id = form.elements.identifier.value;\n      const pass = form.elements.password.value;\n      try {\n        await authLogin(id, pass);\n        closeModal();\n        toast(\"تم تسجيل الدخول بنجاح!\");\n        render();\n      } catch (err) {\n        openModal(authModalContent(\"login\", err.message));\n      }\n      return;\n    }\n    if (form.id === \"auth-register-form\") {\n      const email = form.elements.email.value;\n      const username = form.elements.username.value;\n      const pass = form.elements.password.value;\n      try {\n        await authRegister(email, username, pass);\n        closeModal();\n        toast(\"تم إنشاء الحساب وتسجيل الدخول بنجاح!\");\n        render();\n      } catch (err) {\n        openModal(authModalContent(\"register\", err.message));\n      }\n      return;\n    }\n\n    if (form.id === \"talent-mission-form\") {\n      const t = Object.fromEntries(new FormData(form));\n      await apply((s) => requestMission(s, t));\n    }\n    if (form.id === \"talent-training-form\") {\n      ui.talentPlayer = form.elements.playerId.value;\n      const t = Object.fromEntries(new FormData(form));\n      await apply((s) => setTraining(s, t.playerId, t.focus, t.intensity));\n    }\n    if (form.id === \"commerce-prices\") {\n      const ticket = Number(form.elements.ticket.value),\n        shirt = Number(form.elements.shirt.value);\n      await apply((s) => setPrices(s, ticket, shirt));\n    }\n    if (form.id === \"shop-stock\") {\n      const quantity = Number(form.elements.quantity.value);\n      await apply((s) => stockShirts(s, quantity));\n    }\n    if (form.id === \"staff-hire-form\") {\n      await apply((s) =>\n        hireStaff(s, form.dataset.id, form.elements.staffRole.value),\n      );\n      closeModal();\n    }\n    if (form.id === \"scout-task-form\") {\n      await apply((s) =>\n        scoutAssignment(s, form.dataset.id, form.elements.playerId.value),\n      );\n      closeModal();\n    }\n    if (form.id === \"offer-form\") {\n      await apply(\n        (s) => {\n          const r = submitOffer(s, form.dataset.player, {\n            fee: Number(form.elements.fee.value),\n            upfrontPercent: Number(form.elements.upfront.value),\n          });\n          markStep(s, \"offer\");\n          return r;\n        },\n        \"العرض اتبعت. مرّر يومًا عشان يوصلك الرد.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"loan-offer-form\") {\n      const f = form.elements;\n      const terms = {\n        days: Number(f.days.value),\n        fee: Number(f.fee.value),\n        wageShare: Number(f.wageShare.value),\n        buyOption: Number(f.buyOption.value),\n        recallAllowed: f.recallAllowed.checked,\n        role: f.role.value,\n        borrower: f.borrower?.value,\n      };\n      await apply((s) => requestLoan(s, form.dataset.player, terms));\n      closeModal();\n    }\n    if (form.id === \"contract-form\") {\n      let releaseClause = Number(form.elements.releaseClause.value);\n      const clauseLevel = form.elements.clauseLevel?.value;\n      if (clauseLevel) {\n        const baseInput = document.getElementById(\"release-clause-input\");\n        // إذا اختار مستوى، نستخدم القيمة المحسوبة من المستوى إن لم يعدلها يدويًا بشكل كبير\n        const selectedOption = form.elements.clauseLevel.selectedOptions[0];\n        const levelClause = Number(selectedOption?.dataset?.clause || 0);\n        if (levelClause === 0) releaseClause = 0;\n        else if (Math.abs(releaseClause - levelClause) < levelClause * 0.5) releaseClause = levelClause;\n      }\n      const terms = {\n        salary: Number(form.elements.salary.value),\n        years: Number(form.elements.years.value),\n        bonus: Number(form.elements.bonus.value),\n        role: form.elements.role.value,\n        appearanceBonus: Number(form.elements.appearanceBonus.value),\n        goalBonus: Number(form.elements.goalBonus.value),\n        annualRaisePct: Number(form.elements.annualRaisePct.value),\n        releaseClause,\n        clauseLevel,\n      };\n      await apply(\n        (s) =>\n          form.dataset.renew === \"true\"\n            ? renewPlayer(s, form.dataset.ref, terms)\n            : signPlayer(s, form.dataset.ref, terms),\n        \"تم توقيع العقد وتحديث السجل المالي.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"black-charity\") {\n      const amount = Number(form.elements.amount.value);\n      await apply((s) => {\n        const { donateCharity } = requireBlack();\n        return donateCharity(s, amount);\n      }, \"تم التبرع الخيري وخفض الشبهات.\");\n    }\n    if (form.id === \"legend-offer-form\") {\n      const role = form.elements.role.value;\n      const years = Number(form.elements.years.value);\n      await apply(\n        (s) => signLegend(s, form.dataset.id, role, years),\n        \"تم توقيع عقد الأسطورة.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"legend-renew-form\") {\n      const years = Number(form.elements.years.value);\n      await apply(\n        (s) => renewLegend(s, form.dataset.id, years),\n        \"تم تجديد عقد الأسطورة.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"coach-form\") {\n      const years = Number(form.elements.years.value);\n      await apply(\n        (s) =>\n          form.dataset.mode === \"renew\"\n            ? renewCoach(s, years)\n            : appointCoach(s, form.dataset.id, years),\n        form.dataset.mode === \"renew\"\n          ? \"تم تجديد عقد المدرب.\"\n          : \"تم تعيين المدرب الجديد.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"project-form\") {\n      await apply(\n        (s) => {\n          const r = startProject(\n            s,\n            form.dataset.id,\n            form.elements.speed.value === \"fast\",\n          );\n          markStep(s, \"facility\");\n          return r;\n        },\n        \"المشروع بدأ. موعد الاستلام واتفاق الدفع في البريد.\",\n      );\n      closeModal();\n    }\n    if (form.id === \"ticket-form\") {\n      const p = Number(form.elements.price.value);\n      if (!Number.isInteger(p) || p < 50 || p > 500)\n        throw new Error(\"السعر من ٥٠ إلى ٥٠٠ جنيه.\");\n      const first = Number(form.elements.first.value),\n        vip = Number(form.elements.vip.value),\n        premium = Number(form.elements.premium.value);\n      await apply((s) => {\n        s.ticketPrice = p;\n        setCategoryPrices(s, { first, vip });\n        setMatchPremium(s, premium);\n      }, \"تم اعتماد أسعار الفئات والعلاوة للمباريات القادمة.\");\n      closeModal();\n    }\n  } catch (err) {\n    showError(err.message);\n  }\n});\ndocument.addEventListener(\"input\", (e) => {\n  if (e.target.closest(\"#offer-form,#contract-form\")) updateCalculations();\n  if (e.target.id === \"palette-input\") {\n    paletteQuery(e.target.value);\n    return;\n  }\n  if (e.target.id === \"player-search\") {\n    const value = e.target.value,\n      pos = e.target.selectionStart;\n    ui.playerFilters.search = value;\n    ui.playerFilters.page = 0;\n    render();\n    const input = document.getElementById(\"player-search\");\n    input.focus();\n    input.setSelectionRange(pos, pos);\n  }\n});\n// اختصارات البحث السريع: Ctrl/⌘+K للفتح والإغلاق، والأسهم وEnter للتنقل داخل النتائج.\ndocument.addEventListener(\"keydown\", (e) => {\n  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === \"k\") {\n    e.preventDefault();\n    ui.palette.open ? closePalette() : openPalette();\n    return;\n  }\n  if (!ui.palette.open) return;\n  if (e.key === \"Escape\") closePalette();\n  else if (e.key === \"ArrowDown\") {\n    e.preventDefault();\n    paletteMove(1);\n  } else if (e.key === \"ArrowUp\") {\n    e.preventDefault();\n    paletteMove(-1);\n  } else if (e.key === \"Enter\") {\n    e.preventDefault();\n    paletteActivate(ui.palette.sel);\n  }\n});\ndocument.addEventListener(\"change\", async (e) => {\n  if (isSaving() || actionBusy) return;\n  try {\n    if (e.target.id === \"talent-training-player\") {\n      ui.talentPlayer = e.target.value;\n      const plan = getState().talent.training[ui.talentPlayer] || {\n        focus: \"balanced\",\n        intensity: \"normal\",\n      };\n      const form = e.target.form;\n      form.elements.focus.value = plan.focus;\n      form.elements.intensity.value = plan.intensity;\n      return;\n    }\n    if (e.target.dataset.playerRole) {\n      const id = e.target.dataset.playerRole,\n        role = e.target.value;\n      await apply((s) => setPlayerRole(s, id, role));\n      return;\n    }\n    if (e.target.dataset.tactical) {\n      const key = e.target.dataset.tactical,\n        value = e.target.value;\n      await apply((s) => setTactics(s, { [key]: value }));\n      return;\n    }\n    if (e.target.id === \"team-tactic\") {\n      const tactic = e.target.value;\n      await apply((s) => setTactic(s, tactic));\n      return;\n    }\n    if (e.target.id === \"division-view\") {\n      ui.expandedDivision = e.target.value;\n      render();\n      return;\n    }\n    if (\n      [\n        \"setup-career-mode\",\n        \"setup-region\",\n        \"setup-tier\",\n        \"setup-group\",\n        \"setup-expanded-club\",\n      ].includes(e.target.id)\n    ) {\n      ui.owner = document.getElementById(\"owner-name\")?.value || \"\";\n      ui.leagues = [\n        ...document.querySelectorAll(\"input[name=league]:checked\"),\n      ].map((x) => x.value);\n      if (e.target.id === \"setup-career-mode\") {\n        ui.setupConfig.expanded = e.target.value === \"expanded\";\n        ui.setupConfig.database = \"world\";\n        ui.setupClub = \"ahly\";\n      }\n      if (e.target.id === \"setup-region\") {\n        const c = EXPANDED_CLUBS.find(\n          (c) => c.selectable && c.country === e.target.value,\n        );\n        if (!c) throw Error(\"لا تتوفر قوائم للبدء في هذا البلد.\");\n        ui.setupClub = c.id;\n      }\n      if (e.target.id === \"setup-tier\") {\n        const country = extendedClub(ui.setupClub).country;\n        const c = EXPANDED_CLUBS.find(\n          (c) =>\n            c.selectable &&\n            c.country === country &&\n            c.tier === Number(e.target.value),\n        );\n        if (!c) throw Error(\"هذه الدرجة غير متاحة.\");\n        ui.setupClub = c.id;\n      }\n      if (e.target.id === \"setup-group\")\n        ui.setupClub = DIVISIONS.find((d) => d.id === e.target.value).clubs[0];\n      if (e.target.id === \"setup-expanded-club\") ui.setupClub = e.target.value;\n      render();\n      return;\n    }\n    if (\n      e.target.id === \"setup-language\" ||\n      e.target.name === \"difficulty\" ||\n      e.target.id === \"setup-database\"\n    ) {\n      ui.owner = document.getElementById(\"owner-name\")?.value || \"\";\n      ui.leagues = [\n        ...document.querySelectorAll(": [
    "Black files 349",
    "Dossiers noirs 349",
  ],
  "abord la sauvegarde actuelle pour une copie externe.\")}</p><div class=\"modal-actions\">${button(tr(\"تحميل واستبدال\", \"Load and replace\", \"Charger et remplacer\"), \"slot-load-confirm\", meta.id, \"primary\")}${button(tr(\"إلغاء\", \"Cancel\", \"Annuler\"), \"close-modal\", \"\", \"secondary\")}</div>`, ); }, \"slot-load-confirm\": async (el) => { document.body.classList.add(\"saving-game\"); let state = null; try { state = await readSlot(el.dataset.id); await saveGame(state); } catch (e) { document.body.classList.remove(\"saving-game\"); showError(e.message); return; } document.body.classList.remove(\"saving-game\"); setState(state); setLanguage(state.preferences?.language || getLanguage()); closeModal(); // ذاكرة الحفظات الكبيرة: إعادة تحميل نظيفة بعد استبدال الحفظة النشطة. location.reload(); }, \"slot-delete\": async (el) => { try { await deleteSlot(el.dataset.id); toast(\"حُذفت الخانة.\"); } catch (e) { showError(e.message); } render(); }, \"open-message\": async (el) => { await apply((s) => { const m = s.inbox.find((m) => m.id === el.dataset.id); if (m) m.read = true; }); ui.message = el.dataset.id; ui.route = \"inbox\"; ui.inboxFilter = \"all\"; render(); if (innerWidth < 760) document .querySelector(\".message-detail\") ?.scrollIntoView({ behavior: \"smooth\", block: \"start\" }); }, \"inbox-filter\": async (el) => { ui.inboxFilter = el.dataset.id; ui.message = null; render(); }, \"read-all\": async () => await apply( (s) => s.inbox.forEach((m) => (m.read = true)), \"تم تعليم كل الرسائل كمقروءة. القرارات المطلوبة ما زالت نشطة.\", ), resolve: async (el) => { await apply((s) => resolveInfo(s, el.dataset.id), \"تم تسجيل قرارك.\"); }, \"go-finance\": async (el) => { navigate(\"finance\"); toast(\"راجع التمويل، ثم عُد للبريد لتأكيد التعامل مع تنبيه السيولة.\"); }, \"player-detail\": async (el) => showPlayer(el.dataset.id), \"transfer-offer\": async (el) => { const s = getState(), p = s.players.find((p) => p.id === el.dataset.id); openModal(offerForm(s, p)); updateCalculations(); }, \"accept-club\": async (el) => { await apply( (s) => acceptClub(s, el.dataset.id), \"تم الاتفاق مع النادي. باقي عقد اللاعب.\", ); showContract(el.dataset.id); }, \"reject-transfer\": async (el) => { await apply( (s) => rejectNegotiation(s, el.dataset.id), \"تم إنهاء التفاوض بدون خصم أموال.\", ); }, \"player-contract\": async (el) => showContract(el.dataset.id), \"renew-player\": async (el) => showContract(el.dataset.id, true), \"facility-detail\": async (el) => openModal(facilityDetail(getState(), el.dataset.id)), \"toggle-staff\": async (el) => { await apply( (s) => toggleFacilityStaff(s, el.dataset.id), \"تم تحديث طاقم المنشأة.\", ); openModal(facilityDetail(getState(), el.dataset.id)); }, \"sponsor-offers\": async (el) => showOffers(el.dataset.id), \"sponsor-detail\": async (el) => openModal(sponsorDetail(getState(), el.dataset.id)), \"confirm-sponsor\": async (el) => { const s = getState(), offer = offersFor(s, el.dataset.asset).find( (o) => o.sponsorId === el.dataset.id, ), sp = resolveSponsor(offer.sponsorId), asset = ASSETS.find((x) => x.id === offer.assetId); openModal( `<span class=\"eyebrow\">قبل الالتزام</span><h2>${sp.name} × ${asset.name}</h2><p class=\"muted\">عقد ٣٦٠ يومًا بقيمة ${money(offer.amount)} ${cur()}، ومقدم ${money(Math.floor(offer.amount * 0.25))} ${cur()}. تشمل مكافآت أداء موحدة تُصرف تلقائيًا.</p><div class=\"effect-card\"><h4>الحقوق والالتزامات</h4><p>سيتم حجز ${asset.name} طوال مدة العقد. ${offer.exclusive ? \"العقد حصري لقطاع \" + sp.sector + \"؛ يمنع التعاقد مع منافس في نفس القطاع.\" : \"بدون حصرية قطاع؛ مساحة الإعلان نفسها محجوزة لهذا الشريك فقط.\"}</p><small>الباقي على ١١ دفعة متساوية تقريبًا كل ٣٠ يومًا. الفسخ المبكر غير متاح في هذه النسخة.</small></div><div class=\"modal-actions\"><button class=\"btn primary\" data-action=\"sign-sponsor\" data-id=\"${sp.id}\" data-asset=\"${asset.id}\">توقيع العقد واستلام المقدم ${icon(\"check\", 17)}</button></div>`, ); }, \"sign-sponsor\": async (el) => { await apply((s) => { const offer = offersFor(s, el.dataset.asset).find( (o) => o.sponsorId === el.dataset.id, ); signSponsor(s, offer); markStep(s, \"sponsor\"); }, \"تم توقيع الرعاية وإيداع المقدم في الخزينة.\"); closeModal(); }, \"negotiate-sponsor\": async (el) => openModal(sponsorNegotiate(getState(), el.dataset.asset, el.dataset.id)), \"sponsor-demand\": async (el) => { let deal = null; await apply((s) => { deal = negotiateSponsor( s, el.dataset.asset, el.dataset.id, Number(el.dataset.raise), ); }); if (deal) openModal(sponsorDealResult(getState(), deal)); }, \"sign-sponsor-deal\": async (el) => { await apply((s) => { const offer = answerSponsorDeal(s, el.dataset.id, true); signSponsor(s, offer); }, \"تم توقيع الرعاية بالقيمة المتفاوض عليها وإيداع المقدم.\"); closeModal(); }, \"finance-tab\": async (el) => { ui.financeTab = el.dataset.id; render(); }, \"world-tab\": async (el) => { ui.worldTab = el.dataset.id; render(); }, \"loan-modal\": async () => openModal( `<span class=\"eyebrow\">تمويل تجريبي ثابت</span><h2>مساحة أكبر للسيولة… والتزام جديد</h2><div class=\"profile-stats\"><div><small>المبلغ المستلم</small><strong>٥ ملايين ${cur()}</strong></div><div><small>إجمالي السداد</small><strong>٥٫٤ مليون ${cur()}</strong></div><div><small>الدفعة كل ٣٠ يومًا</small><strong>٤٥٠ ألف ${cur()}</strong></div></div><p class=\"muted\">١٢ دفعة تشمل تكلفة تمويل ثابتة ٤٠٠ ألف جنيه. حد أقصى قرضان خلال الحفظة التجريبية. لا يتضمن نموذج فائدة مركبة أو شروط بنك حقيقي.</p>${infoNote(\"التمويل مش إيراد تشغيلي. القسط بيتسدد تلقائيًا حتى لو أدى لعجز في السيولة.\")}<div class=\"modal-actions\">${button(\"اعتماد التمويل\", \"take-loan\", \"\", \"primary\")}</div>`, ), \"take-loan\": async () => { await apply(takeLoan, \"تم إيداع التمويل وجدولة الأقساط.\"); closeModal(); }, \"ticket-price\": async () => { const s = getState(), prices = categoryPrices(s); openModal( `<h2>تسعير تذاكر المباريات</h2><p class=\"muted\">السعر الأعلى يرفع العائد لكل مشجع، لكنه يقلل الطلب. المقصورة أقل تأثرًا بالغلاء من العادية. أصحاب الاشتراكات يشغلون مقاعد العادية أولًا ولا يُحصّلون مرتين.</p><form id=\"ticket-form\"><div class=\"form-grid\"><label class=\"field\"><span>العادية (70٪ من السعة)</span><input type=\"number\" name=\"price\" value=\"${s.ticketPrice}\" min=\"50\" max=\"500\" required></label><label class=\"field\"><span>الأولى (20٪ · 40–2000)</span><input type=\"number\" name=\"first\" value=\"${prices.first}\" min=\"40\" max=\"2000\" required></label><label class=\"field\"><span>المقصورة (10٪ · 100–5000)</span><input type=\"number\" name=\"vip\" value=\"${prices.vip}\" min=\"100\" max=\"5000\" required></label><label class=\"field\"><span>علاوة المباراة البيتية القادمة</span><select name=\"premium\"><option value=\"0\">بدون علاوة</option><option value=\"25\">+٢٥٪ مباراة كبيرة</option><option value=\"50\">+٥٠٪ قمة</option><option value=\"100\">+١٠٠٪ ديربي ناري</option></select></label></div><div class=\"modal-actions\"><button type=\"submit\" class=\"btn primary\">حفظ أسعار التذاكر</button></div></form>`, ); }, \"export-save\": async () => { await exportGame(getState()); toast(\"تم تجهيز ملف الحفظ للتنزيل.\"); }, \"import-save\": chooseImport, \"confirm-import\": async () => { if (!pendingImport) return; await saveGame(pendingImport); setState(pendingImport); setLanguage(pendingImport.preferences.language); pendingImport = null; closeModal(); ui.route = \"dashboard\"; render(); toast(\"تم استيراد الحفظة.\"); }, \"new-game\": async () => openModal( `<h2>تبدأ حكاية جديدة؟</h2><p class=\"muted\">الحفظة الجديدة هتستبدل الحالية عند بدء اللعب. صدّر الحالية لو حابب ترجع لها.</p><div class=\"modal-actions\">${button(\"تصدير الحالية\", \"export-save\", \"\", \"secondary\")}${button(\"اختيار نادي جديد\", \"confirm-new\", \"\", \"danger\")}</div>`, ), \"confirm-new\": async () => { closeModal(); setState(null); render(); window.scrollTo(0, 0); }, \"modal-inbox\": async () => navigate(\"inbox\"), more: async () => openModal( `<h2>إدارة النادي</h2>${NAV_GROUPS.map( (g) => `<div class=\"more-group\"><small>${g.caption}</small><div class=\"more-grid\">${g.items .map( (id) => `<button data-nav=\"${id}\">${icon(NAV_BY_ID[id].icon, 24)}<span>${NAV_BY_ID[id].name}</span></button>`, ) .join(\"\")}</div></div>`, ).join(\"\")}<div class=\"more-foot\"><span data-no-translate>EMPIRE FC</span><button type=\"button\" class=\"badge vault-key\" data-action=\"secret-vault\">v${APP_VERSION}</button></div>`, ), \"open-auth-modal\": () => openModal(authModalContent(\"login\")), \"auth-tab-login\": () => openModal(authModalContent(\"login\")), \"auth-tab-register\": () => openModal(authModalContent(\"register\")), \"cloud-logout\": async () => { await authLogout(); toast(\"تم تسجيل الخروج بنجاح.\"); render(); }, \"cloud-sync-now\": async () => { if (!isAuthenticated()) { openModal(authModalContent(\"login\")); return; } const s = getState(); if (!s) { toast(\"لا توجد مسيرة نشطة حاليًا للمزامنة.\"); return; } try { toast(\"جارٍ رفع الحفظة إلى السحابة…\"); await uploadSaveToCloud(s); toast(\"تمت المزامنة السحابية بنجاح!\"); render(); } catch (err) { showError(err.message || \"تعذر إتمام المزامنة السحابية.\"); } }, \"cloud-restore-prompt\": async () => { if (!isAuthenticated()) { openModal(authModalContent(\"login\")); return; } try { toast(\"جارٍ فحص الحفظات على السحابة…\"); const save = await fetchLatestCloudSave(); if (!save) { openModal(`<h2>المزامنة السحابية</h2><p class=\"muted\">لا توجد أي حفظة سحابية مسجلة لحسابك حتى الآن. يمكنك مزامنة ناديك الحالي أولًا.</p><div class=\"modal-actions\">${button(\"حسنًا\", \"close-modal\", \"\", \"primary\")}</div>`); return; } const local = getState(); const diff = compareCloudWithLocal(local, save); openModal(` <span class=\"eyebrow\">المزامنة السحابية</span> <h2>استرجاع الحفظة السحابية؟</h2> <p class=\"muted\">سيتم استبدال الحفظة النشطة على جهازك بالنسخة المحفوظة سحابيًا.</p> <div class=\"cloud-diff-grid\"> <div class=\"cloud-diff-col\"> <h4>الحفظة المحلية الحالية</h4> <div><span>النادي:</span><b>${diff?.local ? diff.local.clubName : \"لا توجد\"}</b></div> <div><span>الموسم:</span><b>${diff?.local ? diff.local.season : \"—\"}</b></div> <div><span>التاريخ:</span><b>${diff?.local ? date(diff.local.date) : \"—\"}</b></div> <div><span>السيولة:</span><b>${diff?.local ? money(diff.local.cash) + \" \" + cur() : \"—\"}</b></div> </div> <div class=\"cloud-diff-col\"> <h4>الحفظة على السحابة</h4> <div><span>النادي:</span><b>${diff.cloud.clubName}</b></div> <div><span>الموسم:</span><b>${diff.cloud.season}</b></div> <div><span>التاريخ:</span><b>${date(diff.cloud.date)}</b></div> <div><span>السيولة:</span><b>${money(diff.cloud.cash)} ${cur()}</b></div> <div><span>الجهاز:</span><b>${diff.cloud.device || \"متصفح\"}</b></div> </div> </div> <div class=\"modal-actions\"> ${button(\"استرجاع الحفظة ومتابعة اللعب\", \"confirm-cloud-restore\", save.id, \"primary\")} ${button(\"إلغاء\", \"close-modal\", \"\", \"ghost\")} </div> `); } catch (err) { showError(err.message || \"تعذر جلب الحفظة من السحابة.\"); } }, \"confirm-cloud-restore\": async (btn) => { const saveId = btn?.dataset?.id; try { closeModal(); toast(\"جارٍ تنزيل واسترجاع الحفظة…\"); const { state } = await downloadCloudSave(saveId); await saveGame(state); setState(state); setLanguage(state.preferences.language); ui.route = \"dashboard\"; render(); toast(\"تم استرجاع ناديك من السحابة بنجاح!\"); } catch (err) { showError(err.message || \"تعذر فك واستعادة الحفظة السحابية.\"); } }, \"cloud-saves-list\": async () => { if (!isAuthenticated()) { openModal(authModalContent(\"login\")); return; } try { toast(\"جارٍ جلب سجل الحفظات…\"); const saves = await listCloudSaves(); if (!saves.length) { openModal(`<h2>سجل الحفظات السحابية</h2><p class=\"muted\">لا توجد حفظات سحابية مسجلة بعد.</p><div class=\"modal-actions\">${button(\"إغلاق\", \"close-modal\", \"\", \"primary\")}</div>`); return; } openModal(` <h2>سجل الحفظات السحابية</h2> <p class=\"muted\">يتم الاحتفاظ بآخر ٥ حفظات لحسابك تلقائيًا. يمكنك استرجاع أي نسخة أو حذفها.</p> <div class=\"cloud-saves-container\"> ${saves.map(s => ` <div class=\"cloud-save-item\"> <div class=\"cloud-save-info\"> <strong>${s.metadata.clubName} · الموسم ${s.metadata.seasonNumber}</strong> <small>${date(s.metadata.date)} · السيولة ${money(s.metadata.cash)} ${cur()} · ${s.metadata.device || \"متصفح\"}</small> <small class=\"muted\">المزامنة: ${new Date(s.updatedAt).toLocaleString(\"ar-EG\")}</small> </div> <div class=\"settings-actions\"> ${button(\"استرجاع\", \"confirm-cloud-restore\", s.id, \"secondary small\")} ${button(\"حذف\", \"delete-cloud-save\", s.id, \"danger small\")} </div> </div> `).join(\"\")} </div> <div class=\"modal-actions\" style=\"margin-top: 15px;\"> ${button(\"إغلاق\", \"close-modal\", \"\", \"ghost\")} </div> `); } catch (err) { showError(err.message || \"تعذر جلب سجل الحفظات.\"); } }, \"delete-cloud-save\": async (btn) => { const saveId = btn?.dataset?.id; if (!saveId) return; try { await deleteCloudSave(saveId); toast(\"تم حذف النسخة السحابية.\"); actions[\"cloud-saves-list\"](); } catch (err) { showError(err.message || \"تعذر حذف الحفظة.\"); } }, \"close-modal\": closeModal, }; document.addEventListener(\"click\", async (e) => { if (isSaving() || actionBusy) { toast(tr(\"جارٍ حفظ القرار…\", \"Saving decision…\", \"Enregistrement…\")); return; } const nav = e.target.closest(\"[data-nav]\"); if (nav) { navigate(nav.dataset.nav); return; } if (e.target.classList.contains(\"modal-backdrop\")) { closeModal(); return; } const el = e.target.closest(\"[data-action]\"); if (!el) return; try { actionBusy = true; await actions[el.dataset.action]?.(el); } catch (err) { showError(err.message); } finally { actionBusy = false; } }); document.addEventListener(\"submit\", async (e) => { const form = e.target; if (!form.matches(\"form\")) return; e.preventDefault(); if (isSaving() || actionBusy) return; try { if (form.id === \"auth-login-form\") { const id = form.elements.identifier.value; const pass = form.elements.password.value; try { await authLogin(id, pass); closeModal(); toast(\"تم تسجيل الدخول بنجاح!\"); render(); } catch (err) { openModal(authModalContent(\"login\", err.message)); } return; } if (form.id === \"auth-register-form\") { const email = form.elements.email.value; const username = form.elements.username.value; const pass = form.elements.password.value; try { await authRegister(email, username, pass); closeModal(); toast(\"تم إنشاء الحساب وتسجيل الدخول بنجاح!\"); render(); } catch (err) { openModal(authModalContent(\"register\", err.message)); } return; } if (form.id === \"talent-mission-form\") { const t = Object.fromEntries(new FormData(form)); await apply((s) => requestMission(s, t)); } if (form.id === \"talent-training-form\") { ui.talentPlayer = form.elements.playerId.value; const t = Object.fromEntries(new FormData(form)); await apply((s) => setTraining(s, t.playerId, t.focus, t.intensity)); } if (form.id === \"commerce-prices\") { const ticket = Number(form.elements.ticket.value), shirt = Number(form.elements.shirt.value); await apply((s) => setPrices(s, ticket, shirt)); } if (form.id === \"shop-stock\") { const quantity = Number(form.elements.quantity.value); await apply((s) => stockShirts(s, quantity)); } if (form.id === \"staff-hire-form\") { await apply((s) => hireStaff(s, form.dataset.id, form.elements.staffRole.value), ); closeModal(); } if (form.id === \"scout-task-form\") { await apply((s) => scoutAssignment(s, form.dataset.id, form.elements.playerId.value), ); closeModal(); } if (form.id === \"offer-form\") { await apply( (s) => { const r = submitOffer(s, form.dataset.player, { fee: Number(form.elements.fee.value), upfrontPercent: Number(form.elements.upfront.value), }); markStep(s, \"offer\"); return r; }, \"العرض اتبعت. مرّر يومًا عشان يوصلك الرد.\", ); closeModal(); } if (form.id === \"loan-offer-form\") { const f = form.elements; const terms = { days: Number(f.days.value), fee: Number(f.fee.value), wageShare: Number(f.wageShare.value), buyOption: Number(f.buyOption.value), recallAllowed: f.recallAllowed.checked, role: f.role.value, borrower: f.borrower?.value, }; await apply((s) => requestLoan(s, form.dataset.player, terms)); closeModal(); } if (form.id === \"contract-form\") { let releaseClause = Number(form.elements.releaseClause.value); const clauseLevel = form.elements.clauseLevel?.value; if (clauseLevel) { const baseInput = document.getElementById(\"release-clause-input\"); // إذا اختار مستوى، نستخدم القيمة المحسوبة من المستوى إن لم يعدلها يدويًا بشكل كبير const selectedOption = form.elements.clauseLevel.selectedOptions[0]; const levelClause = Number(selectedOption?.dataset?.clause || 0); if (levelClause === 0) releaseClause = 0; else if (Math.abs(releaseClause - levelClause) < levelClause * 0.5) releaseClause = levelClause; } const terms = { salary: Number(form.elements.salary.value), years: Number(form.elements.years.value), bonus: Number(form.elements.bonus.value), role: form.elements.role.value, appearanceBonus: Number(form.elements.appearanceBonus.value), goalBonus: Number(form.elements.goalBonus.value), annualRaisePct: Number(form.elements.annualRaisePct.value), releaseClause, clauseLevel, }; await apply( (s) => form.dataset.renew === \"true\" ? renewPlayer(s, form.dataset.ref, terms) : signPlayer(s, form.dataset.ref, terms), \"تم توقيع العقد وتحديث السجل المالي.\", ); closeModal(); } if (form.id === \"black-charity\") { const amount = Number(form.elements.amount.value); await apply((s) => { const { donateCharity } = requireBlack(); return donateCharity(s, amount); }, \"تم التبرع الخيري وخفض الشبهات.\"); } if (form.id === \"legend-offer-form\") { const role = form.elements.role.value; const years = Number(form.elements.years.value); await apply( (s) => signLegend(s, form.dataset.id, role, years), \"تم توقيع عقد الأسطورة.\", ); closeModal(); } if (form.id === \"legend-renew-form\") { const years = Number(form.elements.years.value); await apply( (s) => renewLegend(s, form.dataset.id, years), \"تم تجديد عقد الأسطورة.\", ); closeModal(); } if (form.id === \"coach-form\") { const years = Number(form.elements.years.value); await apply( (s) => form.dataset.mode === \"renew\" ? renewCoach(s, years) : appointCoach(s, form.dataset.id, years), form.dataset.mode === \"renew\" ? \"تم تجديد عقد المدرب.\" : \"تم تعيين المدرب الجديد.\", ); closeModal(); } if (form.id === \"project-form\") { await apply( (s) => { const r = startProject( s, form.dataset.id, form.elements.speed.value === \"fast\", ); markStep(s, \"facility\"); return r; }, \"المشروع بدأ. موعد الاستلام واتفاق الدفع في البريد.\", ); closeModal(); } if (form.id === \"ticket-form\") { const p = Number(form.elements.price.value); if (!Number.isInteger(p) || p < 50 || p > 500) throw new Error(\"السعر من ٥٠ إلى ٥٠٠ جنيه.\"); const first = Number(form.elements.first.value), vip = Number(form.elements.vip.value), premium = Number(form.elements.premium.value); await apply((s) => { s.ticketPrice = p; setCategoryPrices(s, { first, vip }); setMatchPremium(s, premium); }, \"تم اعتماد أسعار الفئات والعلاوة للمباريات القادمة.\"); closeModal(); } } catch (err) { showError(err.message); } }); document.addEventListener(\"input\", (e) => { if (e.target.closest(\"#offer-form,#contract-form\")) updateCalculations(); if (e.target.id === \"palette-input\") { paletteQuery(e.target.value); return; } if (e.target.id === \"player-search\") { const value = e.target.value, pos = e.target.selectionStart; ui.playerFilters.search = value; ui.playerFilters.page = 0; render(); const input = document.getElementById(\"player-search\"); input.focus(); input.setSelectionRange(pos, pos); } }); // اختصارات البحث السريع: Ctrl/⌘+K للفتح والإغلاق، والأسهم وEnter للتنقل داخل النتائج. document.addEventListener(\"keydown\", (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === \"k\") { e.preventDefault(); ui.palette.open ? closePalette() : openPalette(); return; } if (!ui.palette.open) return; if (e.key === \"Escape\") closePalette(); else if (e.key === \"ArrowDown\") { e.preventDefault(); paletteMove(1); } else if (e.key === \"ArrowUp\") { e.preventDefault(); paletteMove(-1); } else if (e.key === \"Enter\") { e.preventDefault(); paletteActivate(ui.palette.sel); } }); document.addEventListener(\"change\", async (e) => { if (isSaving() || actionBusy) return; try { if (e.target.id === \"talent-training-player\") { ui.talentPlayer = e.target.value; const plan = getState().talent.training[ui.talentPlayer] || { focus: \"balanced\", intensity: \"normal\", }; const form = e.target.form; form.elements.focus.value = plan.focus; form.elements.intensity.value = plan.intensity; return; } if (e.target.dataset.playerRole) { const id = e.target.dataset.playerRole, role = e.target.value; await apply((s) => setPlayerRole(s, id, role)); return; } if (e.target.dataset.tactical) { const key = e.target.dataset.tactical, value = e.target.value; await apply((s) => setTactics(s, { [key]: value })); return; } if (e.target.id === \"team-tactic\") { const tactic = e.target.value; await apply((s) => setTactic(s, tactic)); return; } if (e.target.id === \"division-view\") { ui.expandedDivision = e.target.value; render(); return; } if ( [ \"setup-career-mode\", \"setup-region\", \"setup-tier\", \"setup-group\", \"setup-expanded-club\", ].includes(e.target.id) ) { ui.owner = document.getElementById(\"owner-name\")?.value || \"\"; ui.leagues = [ ...document.querySelectorAll(\"input[name=league]:checked\"), ].map((x) => x.value); if (e.target.id === \"setup-career-mode\") { ui.setupConfig.expanded = e.target.value === \"expanded\"; ui.setupConfig.database = \"world\"; ui.setupClub = \"ahly\"; } if (e.target.id === \"setup-region\") { const c = EXPANDED_CLUBS.find( (c) => c.selectable && c.country === e.target.value, ); if (!c) throw Error(\"لا تتوفر قوائم للبدء في هذا البلد.\"); ui.setupClub = c.id; } if (e.target.id === \"setup-tier\") { const country = extendedClub(ui.setupClub).country; const c = EXPANDED_CLUBS.find( (c) => c.selectable && c.country === country && c.tier === Number(e.target.value), ); if (!c) throw Error(\"هذه الدرجة غير متاحة.\"); ui.setupClub = c.id; } if (e.target.id === \"setup-group\") ui.setupClub = DIVISIONS.find((d) => d.id === e.target.value).clubs[0]; if (e.target.id === \"setup-expanded-club\") ui.setupClub = e.target.value; render(); return; } if ( e.target.id === \"setup-language\" || e.target.name === \"difficulty\" || e.target.id === \"setup-database\" ) { ui.owner = document.getElementById(\"owner-name\")?.value || \"\"; ui.leagues = [ ...document.querySelectorAll": [
    "Black files 350",
    "Dossiers noirs 350",
  ],
  "accumule. Suspicion 0-100% avec paliers annoncés.\",\n  },\n  suspicionLabel: {\n    ar: \"مؤشر الشبهات\",\n    en: \"Suspicion index\",\n    fr: \"Indice de suspicion\",\n  },\n  suspicionLevel0: {\n    ar: \"نظيف\",\n    en: \"Clean\",\n    fr: \"Propre\",\n  },\n  suspicionLevel30: {\n    ar: \"همسات صحفية\",\n    en: \"Press whispers\",\n    fr: \"Rumeurs de presse\",\n  },\n  suspicionLevel60: {\n    ar: \"تسريبات وتحقيق أولي\",\n    en: \"Leaks & preliminary probe\",\n    fr: \"Fuites et enquête préliminaire\",\n  },\n  suspicionLevel85: {\n    ar: \"تحقيق رسمي وشيك\",\n    en: \"Formal investigation imminent\",\n    fr: \"Enquête officielle imminente\",\n  },\n  suspicionLevel100: {\n    ar: \"الفضيحة الكبرى\",\n    en: \"Major scandal\",\n    fr: \"Scandale majeur\",\n  },\n  opRefereeBias: {\n    ar: \"تحيز تحكيمي لمباراة واحدة\",\n    en: \"Referee bias for one match\",\n    fr: \"Arbitrage biaisé pour un match\",\n  },\n  opRefereeBiasDesc: {\n    ar: \"ضربة جزاء مشكوك فيها / إلغاء هدف للخصم / تساهل في البطاقات — لمباراة واحدة فقط\",\n    en: \"Dubious penalty / disallow opponent goal / lenient cards — for one match only\",\n    fr: \"Penalty douteux / but adverse annulé / clémence sur les cartons — pour un match seulement\",\n  },\n  opPoachPlayer: {\n    ar: \"خطف لاعب متعاقد بدون إذن\",\n    en: \"Poach a contracted player\",\n    fr: \"Détourner un joueur sous contrat\",\n  },\n  opPoachPlayerDesc: {\n    ar: \"أرخص وأسرع من التفاوض العادي، ولو انكشف: غرامة + منع قيد\",\n    en: \"Cheaper and faster than normal negotiation, if exposed: fine + transfer ban\",\n    fr: \"Moins cher et plus rapide que la négociation normale, si découvert : amende + interdiction de recrutement\",\n  },\n  opBribeOpponent: {\n    ar: \"رشوة لاعب خصم قبل المواجهة\",\n    en: \"Bribe opponent player before clash\",\n    fr: \"Corrompre un joueur adverse avant le match\",\n  },\n  opBribeOpponentDesc: {\n    ar: \"الأغلى والأخطر — لاعب الخصم يتراجع في المباراة القادمة\",\n    en: \"Most expensive & most dangerous — opponent player underperforms next match\",\n    fr: \"Le plus cher et le plus risqué — le joueur adverse sous-performe au prochain match\",\n  },\n  opMediaWar: {\n    ar: \"حرب إعلامية ملفقة ضد منافس\",\n    en: \"Fabricated media war vs rival\",\n    fr: \"Guerre médiatique fabriquée contre un rival\",\n  },\n  opMediaWarDesc: {\n    ar: \"تشويه سمعة منافس مباشر — معنوياته تنخفض وجماهيرك ترتفع مؤقتًا\",\n    en: \"Smear direct rival — his morale drops, your fans rise temporarily\",\n    fr: \"Dénigrer un rival direct — son moral chute, vos supporters montent temporairement\",\n  },\n  opAgentPayroll: {\n    ar: \"وكيل على المرتب\",\n    en: \"Agent on payroll\",\n    fr: \"Agent à la solde\",\n  },\n  opAgentPayrollDesc: {\n    ar: \"عمولات أرخص (1% بدل 3%) مقابل heat مستمر صغير\",\n    en: \"Cheaper commissions (1% vs 3%) for small continuous heat\",\n    fr: \"Commissions moins chères (1% vs 3%) contre un peu de suspicion continue\",\n  },\n  opCost: {\n    ar: \"التكلفة: {money}\",\n    en: \"Cost: {money}\",\n    fr: \"Coût : {money}\",\n  },\n  opHeat: {\n    ar: \"الشبهات: +{n}%\",\n    en: \"Heat: +{n}%\",\n    fr: \"Suspicion : +{n}%\",\n  },\n  opFailChance: {\n    ar: \"احتمال الفشل: {n}%\",\n    en: \"Failure chance: {n}%\",\n    fr: \"Risque d": [
    "Black files 351",
    "Dossiers noirs 351",
  ],
  "accumule. Suspicion 0-100% avec paliers annoncés.\", }, suspicionLabel: { ar: \"مؤشر الشبهات\", en: \"Suspicion index\", fr: \"Indice de suspicion\", }, suspicionLevel0: { ar: \"نظيف\", en: \"Clean\", fr: \"Propre\", }, suspicionLevel30: { ar: \"همسات صحفية\", en: \"Press whispers\", fr: \"Rumeurs de presse\", }, suspicionLevel60: { ar: \"تسريبات وتحقيق أولي\", en: \"Leaks & preliminary probe\", fr: \"Fuites et enquête préliminaire\", }, suspicionLevel85: { ar: \"تحقيق رسمي وشيك\", en: \"Formal investigation imminent\", fr: \"Enquête officielle imminente\", }, suspicionLevel100: { ar: \"الفضيحة الكبرى\", en: \"Major scandal\", fr: \"Scandale majeur\", }, opRefereeBias: { ar: \"تحيز تحكيمي لمباراة واحدة\", en: \"Referee bias for one match\", fr: \"Arbitrage biaisé pour un match\", }, opRefereeBiasDesc: { ar: \"ضربة جزاء مشكوك فيها / إلغاء هدف للخصم / تساهل في البطاقات — لمباراة واحدة فقط\", en: \"Dubious penalty / disallow opponent goal / lenient cards — for one match only\", fr: \"Penalty douteux / but adverse annulé / clémence sur les cartons — pour un match seulement\", }, opPoachPlayer: { ar: \"خطف لاعب متعاقد بدون إذن\", en: \"Poach a contracted player\", fr: \"Détourner un joueur sous contrat\", }, opPoachPlayerDesc: { ar: \"أرخص وأسرع من التفاوض العادي، ولو انكشف: غرامة + منع قيد\", en: \"Cheaper and faster than normal negotiation, if exposed: fine + transfer ban\", fr: \"Moins cher et plus rapide que la négociation normale, si découvert : amende + interdiction de recrutement\", }, opBribeOpponent: { ar: \"رشوة لاعب خصم قبل المواجهة\", en: \"Bribe opponent player before clash\", fr: \"Corrompre un joueur adverse avant le match\", }, opBribeOpponentDesc: { ar: \"الأغلى والأخطر — لاعب الخصم يتراجع في المباراة القادمة\", en: \"Most expensive & most dangerous — opponent player underperforms next match\", fr: \"Le plus cher et le plus risqué — le joueur adverse sous-performe au prochain match\", }, opMediaWar: { ar: \"حرب إعلامية ملفقة ضد منافس\", en: \"Fabricated media war vs rival\", fr: \"Guerre médiatique fabriquée contre un rival\", }, opMediaWarDesc: { ar: \"تشويه سمعة منافس مباشر — معنوياته تنخفض وجماهيرك ترتفع مؤقتًا\", en: \"Smear direct rival — his morale drops, your fans rise temporarily\", fr: \"Dénigrer un rival direct — son moral chute, vos supporters montent temporairement\", }, opAgentPayroll: { ar: \"وكيل على المرتب\", en: \"Agent on payroll\", fr: \"Agent à la solde\", }, opAgentPayrollDesc: { ar: \"عمولات أرخص (1% بدل 3%) مقابل heat مستمر صغير\", en: \"Cheaper commissions (1% vs 3%) for small continuous heat\", fr: \"Commissions moins chères (1% vs 3%) contre un peu de suspicion continue\", }, opCost: { ar: \"التكلفة: {money}\", en: \"Cost: {money}\", fr: \"Coût : {money}\", }, opHeat: { ar: \"الشبهات: +{n}%\", en: \"Heat: +{n}%\", fr: \"Suspicion : +{n}%\", }, opFailChance: { ar: \"احتمال الفشل: {n}%\", en: \"Failure chance: {n}%\", fr: \"Risque d": [
    "Black files 352",
    "Dossiers noirs 352",
  ],
  "async () => openModal( `<h2>تبدأ حكاية جديدة؟</h2><p class=": [
    "Black files 353",
    "Dossiers noirs 353",
  ],
  "async () => { const s = getState(), prices = categoryPrices(s); openModal( `<h2>تسعير تذاكر المباريات</h2><p class=": [
    "Black files 354",
    "Dossiers noirs 354",
  ],
  "async (el) => openModal( `<h2>إنهاء العقد</h2><p>تعويض الإنهاء: شهران من المرتب.</p><strong>${money(getState().staff.find((p) => p.id === el.dataset.id).salary * 2)} ${cur()}</strong><div class=": [
    "Black files 355",
    "Dossiers noirs 355",
  ],
  "async (el) => openModal( `<h2>دورة تطوير</h2><p>${tr": [
    "Black files 356",
    "Dossiers noirs 356",
  ],
  "async (el) => { const meta = listSlots().find((x) => x.id === el.dataset.id); if (!meta) return; openModal( `<h2>${tr(`تحميل خانة «${meta.name}»؟`, `Load slot “${meta.name}”?`, `Charger l'emplacement « ${meta.name} » ?`)}</h2><p class=": [
    "Black files 357",
    "Dossiers noirs 357",
  ],
  "au {d}\",\n  },\n  opAgentActive: {\n    ar: \"وكيل على المرتب نشط — عمولات 1%\",\n    en: \"Agent on payroll active — 1% commission\",\n    fr: \"Agent à la solde actif — commission 1%\",\n  },\n  opNotEnoughCash: {\n    ar: \"السيولة لا تكفي لهذه العملية\",\n    en: \"Not enough cash for this operation\",\n    fr: \"Trésorerie insuffisante pour cette opération\",\n  },\n  opCooldownActive: {\n    ar: \"الوسيط مشغول حتى {d} — فاصل أمان بين العمليات\",\n    en: \"Fixer busy until {d} — safety interval between operations\",\n    fr: \"Intermédiaire occupé jusqu": [
    "Black files 358",
    "Dossiers noirs 358",
  ],
  "au {d}\", }, opAgentActive: { ar: \"وكيل على المرتب نشط — عمولات 1%\", en: \"Agent on payroll active — 1% commission\", fr: \"Agent à la solde actif — commission 1%\", }, opNotEnoughCash: { ar: \"السيولة لا تكفي لهذه العملية\", en: \"Not enough cash for this operation\", fr: \"Trésorerie insuffisante pour cette opération\", }, opCooldownActive: { ar: \"الوسيط مشغول حتى {d} — فاصل أمان بين العمليات\", en: \"Fixer busy until {d} — safety interval between operations\", fr: \"Intermédiaire occupé jusqu": [
    "Black files 359",
    "Dossiers noirs 359",
  ],
  "innerHTML = `<div><span>المطلوب من الخزينة الآن</span><strong class=": [
    "Black files 360",
    "Dossiers noirs 360",
  ],
  "innerHTML = `<div><span>المقدم عند التوقيع</span><strong>${money(Math.round((fee * percent) / 100))} ${cur()}</strong></div><div><span>باقي قيمة الانتقال</span><strong>${money(fee - Math.round((fee * percent) / 100))} ${cur()}</strong></div><small>لم يتم الخصم. لا يشمل المبلغ عقد اللاعب أو الوكيل.</small>`; } if (contract) { const salary = Number(contract.elements.salary.value), bonus = Number(contract.elements.bonus.value), years = Number(contract.elements.years.value), renew = contract.dataset.renew ===": [
    "Black files 361",
    "Dossiers noirs 361",
  ],
  "intermédiaire demande le silence.\",\n  },\n  opRefereeActive: {\n    ar: \"تحيز تحكيمي نشط حتى {d}\",\n    en: \"Referee bias active until {d}\",\n    fr: \"Arbitrage biaisé actif jusqu": [
    "Black files 362",
    "Dossiers noirs 362",
  ],
  "intermédiaire demande le silence.\", }, opRefereeActive: { ar: \"تحيز تحكيمي نشط حتى {d}\", en: \"Referee bias active until {d}\", fr: \"Arbitrage biaisé actif jusqu": [
    "Black files 363",
    "Dossiers noirs 363",
  ],
  "intermédiaire\",\n  },\n  blackIntro: {\n    ar: \"اللعب غير النظيف كمحتوى عادي في اللعبة وبأسماء حقيقية — كل عملية لها تكلفة كبيرة واحتمال فشل وheat يتراكم. الشبهات 0-100% ولها مستويات عواقب معلنة.\",\n    en: \"Dirty play as regular game content with real names — every operation has a big cost, a failure chance and accumulating heat. Suspicion 0-100% with declared consequence tiers.\",\n    fr: \"Le jeu sale comme contenu régulier avec de vrais noms — chaque opération a un coût élevé, un risque d": [
    "Black files 364",
    "Dossiers noirs 364",
  ],
  "intermédiaire\", }, blackIntro: { ar: \"اللعب غير النظيف كمحتوى عادي في اللعبة وبأسماء حقيقية — كل عملية لها تكلفة كبيرة واحتمال فشل وheat يتراكم. الشبهات 0-100% ولها مستويات عواقب معلنة.\", en: \"Dirty play as regular game content with real names — every operation has a big cost, a failure chance and accumulating heat. Suspicion 0-100% with declared consequence tiers.\", fr: \"Le jeu sale comme contenu régulier avec de vrais noms — chaque opération a un coût élevé, un risque d": [
    "Black files 365",
    "Dossiers noirs 365",
  ],
  "opérations sales\",\n  },\n  charityDonation: {\n    ar: \"تبرع خيري لخفض الشبهات\",\n    en: \"Charity donation to lower suspicion\",\n    fr: \"Don caritatif pour baisser la suspicion\",\n  },\n  charityDonationDesc: {\n    ar: \"تبرع علني يخفض الشبهات — كل مليون يخفض 2%\",\n    en: \"Public donation lowers suspicion — each million lowers 2%\",\n    fr: \"Don public baisse la suspicion — chaque million baisse 2%\",\n  },\n  cutMiddlemen: {\n    ar: \"قطع الوسطاء\",\n    en: \"Cut the middlemen\",\n    fr: \"Couper les intermédiaires\",\n  },\n  cutMiddlemenDesc: {\n    ar: \"إنهاء شبكة الوسيط — يخفض الشبهات 15% فورًا\",\n    en: \"End the fixer network — lowers suspicion 15% instantly\",\n    fr: \"Mettre fin au réseau — baisse la suspicion de 15% immédiatement\",\n  },\n  scandalTitle: {\n    ar: \"الفضيحة الكبرى — {n} نقاط وغرامات\",\n    en: \"Major scandal — {n} points & fines\",\n    fr: \"Scandale majeur — {n} points et amendes\",\n  },\n  scandalBody: {\n    ar: \"التحقيق الرسمي اكتمل. خصم {n} نقاط، غرامة {money}، هروب راعٍ، غضب جماهيري، ومنع قيد {d} يومًا. الشبهات صُفرت مع عقوبة سمعة دائمة خفيفة.\",\n    en: \"Formal investigation completed. {n} points deducted, fine {money}, sponsor fled, fan fury, transfer ban {d} days. Suspicion reset with light permanent rep penalty.\",\n    fr: \"Enquête officielle terminée. {n} points retirés, amende {money}, sponsor parti, fureur des supporters, interdiction {d} jours. Suspicion remise à zéro avec légère pénalité permanente de réputation.\",\n  },\n  scandalWhispersTitle: {\n    ar: \"همسات صحفية — الشبهات {n}%\",\n    en: \"Press whispers — suspicion {n}%\",\n    fr: \"Rumeurs de presse — suspicion {n}%\",\n  },\n  scandalWhispersBody: {\n    ar: \"صحفيون يتحدثون عن علاقات مشبوهة. لا تحقيق بعد، لكن العيون بدأت تراقب.\",\n    en: \"Journalists whisper about shady connections. No probe yet, but eyes are watching.\",\n    fr: \"Les journalistes murmurent sur des liens douteux. Pas encore d": [
    "Black files 366",
    "Dossiers noirs 366",
  ],
  "opérations sales\", }, charityDonation: { ar: \"تبرع خيري لخفض الشبهات\", en: \"Charity donation to lower suspicion\", fr: \"Don caritatif pour baisser la suspicion\", }, charityDonationDesc: { ar: \"تبرع علني يخفض الشبهات — كل مليون يخفض 2%\", en: \"Public donation lowers suspicion — each million lowers 2%\", fr: \"Don public baisse la suspicion — chaque million baisse 2%\", }, cutMiddlemen: { ar: \"قطع الوسطاء\", en: \"Cut the middlemen\", fr: \"Couper les intermédiaires\", }, cutMiddlemenDesc: { ar: \"إنهاء شبكة الوسيط — يخفض الشبهات 15% فورًا\", en: \"End the fixer network — lowers suspicion 15% instantly\", fr: \"Mettre fin au réseau — baisse la suspicion de 15% immédiatement\", }, scandalTitle: { ar: \"الفضيحة الكبرى — {n} نقاط وغرامات\", en: \"Major scandal — {n} points & fines\", fr: \"Scandale majeur — {n} points et amendes\", }, scandalBody: { ar: \"التحقيق الرسمي اكتمل. خصم {n} نقاط، غرامة {money}، هروب راعٍ، غضب جماهيري، ومنع قيد {d} يومًا. الشبهات صُفرت مع عقوبة سمعة دائمة خفيفة.\", en: \"Formal investigation completed. {n} points deducted, fine {money}, sponsor fled, fan fury, transfer ban {d} days. Suspicion reset with light permanent rep penalty.\", fr: \"Enquête officielle terminée. {n} points retirés, amende {money}, sponsor parti, fureur des supporters, interdiction {d} jours. Suspicion remise à zéro avec légère pénalité permanente de réputation.\", }, scandalWhispersTitle: { ar: \"همسات صحفية — الشبهات {n}%\", en: \"Press whispers — suspicion {n}%\", fr: \"Rumeurs de presse — suspicion {n}%\", }, scandalWhispersBody: { ar: \"صحفيون يتحدثون عن علاقات مشبوهة. لا تحقيق بعد، لكن العيون بدأت تراقب.\", en: \"Journalists whisper about shady connections. No probe yet, but eyes are watching.\", fr: \"Les journalistes murmurent sur des liens douteux. Pas encore d": [
    "Black files 367",
    "Dossiers noirs 367",
  ],
  "return 0; // مرة في الشهر const ownPlayers = s.players.filter((p) => p.clubId === s.clubId && p.status !==": [
    "Black files 368",
    "Dossiers noirs 368",
  ],
  "return null; const open = availableDecisions(s); if (!open.length) return null; // لا حدث ممكن اليوم: البوابات كلها مغلقة // التنويع: آخر ٨ أحداث في السجل + الحدث الأخير لا تعود، إلا إذا كان ذلك هو المتاح كله. const recent = new Set(s.clubDecisions.slice(-8).map((e) => e.type)); recent.add(s.lastClubEvent); const fresh = open.filter((e) => !recent.has(e.id)); const pool = fresh.length ? fresh : open.filter((e) => e.id !== s.lastClubEvent); if (!pool.length) return null; const data = pick(s, pool); const ev = { id: uid(s": [
    "Black files 369",
    "Dossiers noirs 369",
  ],
  "return null; const open = availableDecisions(s); if (!open.length) return null; // لا حدث ممكن اليوم: البوابات كلها مغلقة // التنويع: آخر ٨ أحداث في السجل + الحدث الأخير لا تعود، إلا إذا كان ذلك هو المتاح كله. const recent = new Set(s.clubDecisions.slice(-8).map((e) => e.type)); recent.add(s.lastClubEvent); const fresh = open.filter((e) => !recent.has(e.id)); const pool = fresh.length ? fresh : open.filter((e) => e.id !== s.lastClubEvent); if (!pool.length) return null; const data = pick(s, pool); const ev = { id: uid(s,": [
    "Black files 370",
    "Dossiers noirs 370",
  ],
  "return true; if (SPANISH_CLUBS.has(player.clubId)) return true; if (SPANISH_CLUBS.has(player.clubName)) return true; // في الحفظة الموسعة، نفحص هل النادي في مجموعة إسبانية؟ if (s?.expansion) { const esDivisions = s.expansion.divisions?.filter((d) => d.country ===": [
    "Black files 371",
    "Dossiers noirs 371",
  ],
  "{ // نحدد مباراة قادمة ضد خصم const fixtures = s.fixtures?.filter((f) => !f.played && (f.home === s.clubId || f.away === s.clubId)) || []; const next = fixtures.sort((a, b) => a.date.localeCompare(b.date))[0]; if (next) { const oppId = next.home === s.clubId ? next.away : next.home; bf.active.bribedOpponent = { fixtureId: next.id, opponent: oppId, until: addDays(next.date, 1), date: s.date, }; message(s, { title: blackTextAr": [
    "Black files 372",
    "Dossiers noirs 372",
  ],
  "{ // نطاق بسيط حسب التقييم للحفظات المهاجرة — التفاصيل في releaseClause.js const rating = p.rating || 60; let min = 2000000, max = 5000000; if (rating >= 70 && rating <= 74) { min = 5000000; max = 12000000; } else if (rating >= 75 && rating <= 79) { min = 12000000; max = 30000000; } else if (rating >= 80 && rating <= 84) { min = 30000000; max = 80000000; } else if (rating >= 85) { min = 80000000; max = 150000000; } // 25% بلا شرط const rnd = Math.random(); p.contractTerms.releaseClause = rnd < 0.25 ? 0 : Math.round(min + (max - min) * ((rnd - 0.25) / 0.75)); } } s.migrationNote = (s.migrationNote ||": [
    "Black files 373",
    "Dossiers noirs 373",
  ],
  "{ // نُسجل اجتماع فشل ثقة b.meetings.push({ id: uid(s": [
    "Black files 374",
    "Dossiers noirs 374",
  ],
  "{ // نُسجل اجتماع فشل ثقة b.meetings.push({ id: uid(s,": [
    "Black files 375",
    "Dossiers noirs 375",
  ],
  "{ const rnd = random(s); p.contractTerms.releaseClause = calculateReleaseClause(p, s.date, rnd, s); } } } // كسر الشرط الجزائي: دفع دفعة واحدة ثم التفاوض مع اللاعب مباشرة export function canBreakReleaseClause(s, player) { if (!player) return false; if (player.clubId === s.clubId) return false; if (player.status ===": [
    "Black files 376",
    "Dossiers noirs 376",
  ],
  "{n} من {d} بندًا": [
    "Black files 377",
    "Dossiers noirs 377",
  ],
  "}\n      </div>\n    </form>\n  `}`;\n}\n\nconst actions = {\n  // خزنة المالك السرية: مفاتيحها أرقام الإصدار (أسفل القائمة الجانبية + سطر EMPIRE FC في شيت «المزيد» + شارة «عن اللعبة»).": [
    "Black files 378",
    "Dossiers noirs 378",
  ],
  "} </div> </form> `}`; } const actions = { // خزنة المالك السرية: مفاتيحها أرقام الإصدار (أسفل القائمة الجانبية + سطر EMPIRE FC في شيت «المزيد» + شارة «عن اللعبة": [
    "Black files 379",
    "Dossiers noirs 379",
  ],
  "} — منذ ${date(bf.active.agentSince)}</p></div>`);\n\n  const ops = Object.values(OPERATIONS).map((op) => {\n    const cooldown = bf.cooldowns[op.id];\n    const busy = cooldown && cooldown >= s.date;\n    const ban = bf.transferBanUntil && bf.transferBanUntil >= s.date && [": [
    "Black files 380",
    "Dossiers noirs 380",
  ],
  "} — منذ ${date(bf.active.agentSince)}</p></div>`); const ops = Object.values(OPERATIONS).map((op) => { const cooldown = bf.cooldowns[op.id]; const busy = cooldown && cooldown >= s.date; const ban = bf.transferBanUntil && bf.transferBanUntil >= s.date && [": [
    "Black files 381",
    "Dossiers noirs 381",
  ],
  "});\n}\n// البحث السريع: طبقة مستقلة فوق التطبيق، تُحدَّث وحدها دون إعادة رندر الشاشة الحالية.\nfunction renderPalette() {\n  const root = document.getElementById": [
    "Black files 382",
    "Dossiers noirs 382",
  ],
  "});\n}\n// البحث السريع: طبقة مستقلة فوق التطبيق، تُحدَّث وحدها دون إعادة رندر الشاشة الحالية.\nfunction renderPalette() {\n  const root = document.getElementById(": [
    "Black files 383",
    "Dossiers noirs 383",
  ],
  "}); } // البحث السريع: طبقة مستقلة فوق التطبيق، تُحدَّث وحدها دون إعادة رندر الشاشة الحالية. function renderPalette() { const root = document.getElementById": [
    "Black files 384",
    "Dossiers noirs 384",
  ],
  "}</b></div>\n            <div><span>التاريخ:</span><b>${diff?.local ? date(diff.local.date) ": [
    "Black files 385",
    "Dossiers noirs 385",
  ],
  "}</b></div>\n            <div><span>التاريخ:</span><b>${diff?.local ? date(diff.local.date) :": [
    "Black files 386",
    "Dossiers noirs 386",
  ],
  "}</b></div>\n            <div><span>السيولة:</span><b>${diff?.local ? money(diff.local.cash) +": [
    "Black files 387",
    "Dossiers noirs 387",
  ],
  "}</b></div>\n            <div><span>الموسم:</span><b>${diff?.local ? diff.local.season ": [
    "Black files 388",
    "Dossiers noirs 388",
  ],
  "}</b></div>\n            <div><span>الموسم:</span><b>${diff?.local ? diff.local.season :": [
    "Black files 389",
    "Dossiers noirs 389",
  ],
  "}</b></div> <div><span>التاريخ:</span><b>${diff?.local ? date(diff.local.date": [
    "Black files 390",
    "Dossiers noirs 390",
  ],
  "}</b></div> <div><span>السيولة:</span><b>${diff?.local ? money(diff.local.cash) +": [
    "Black files 391",
    "Dossiers noirs 391",
  ],
  "}</b></div> <div><span>الموسم:</span><b>${diff?.local ? diff.local.season": [
    "Black files 392",
    "Dossiers noirs 392",
  ],
  "}</div>`);\n        return;\n      }\n      openModal(`\n        <h2>سجل الحفظات السحابية</h2>\n        <p class=": [
    "Black files 393",
    "Dossiers noirs 393",
  ],
  "}</div>`); return; } openModal(` <h2>سجل الحفظات السحابية</h2> <p class=": [
    "Black files 394",
    "Dossiers noirs 394",
  ],
  "}</h4><p>${bf.active.mediaWar.rival} — حتى ${date(bf.active.mediaWar.until)}</p></div>`);\n  if (bf.active.agentOnPayroll) active.push(`<div class=": [
    "Black files 395",
    "Dossiers noirs 395",
  ],
  "}</h4><p>${bf.active.mediaWar.rival} — حتى ${date(bf.active.mediaWar.until)}</p></div>`); if (bf.active.agentOnPayroll) active.push(`<div class=": [
    "Black files 396",
    "Dossiers noirs 396",
  ],
  "}<small>يشمل ${renew ?": [
    "Black files 397",
    "Dossiers noirs 397",
  ],
  "؛ يمنع التعاقد مع منافس في نفس القطاع": [
    "Black files 398",
    "Dossiers noirs 398",
  ],
  "؛ يمنع التعاقد مع منافس في نفس القطاع.": [
    "Black files 399",
    "Dossiers noirs 399",
  ],
  "أبلغت؛ الشبهات -12%": [
    "Black files 400",
    "Dossiers noirs 400",
  ],
  "أبلغت؛ الشبهات -12%.": [
    "Black files 401",
    "Dossiers noirs 401",
  ],
  "أثر القرار على النادي": [
    "Black files 402",
    "Dossiers noirs 402",
  ],
  "أحد رعاة القميص قرأ التسريبات ويطلب توضيحًا عاجلًا. الطمأنة تحافظ عليه، التبرع الخيري يخفض الشبهات، والتجاهل قد يفقده": [
    "Black files 403",
    "Dossiers noirs 403",
  ],
  "أحد رعاة القميص قرأ التسريبات ويطلب توضيحًا عاجلًا. الطمأنة تحافظ عليه، التبرع الخيري يخفض الشبهات، والتجاهل قد يفقده.": [
    "Black files 404",
    "Dossiers noirs 404",
  ],
  "أحد لاعبيك شاهد لقاءً بين الوسيط وحكم قبل مباراة. اللاعب مرتبك ويفكر في الحديث. إقناعه بالصمت، نقله، أو مكافأته": [
    "Black files 405",
    "Dossiers noirs 405",
  ],
  "أحد لاعبيك شاهد لقاءً بين الوسيط وحكم قبل مباراة. اللاعب مرتبك ويفكر في الحديث. إقناعه بالصمت، نقله، أو مكافأته.": [
    "Black files 406",
    "Dossiers noirs 406",
  ],
  "أحداث القرارات غير سليمة": [
    "Black files 407",
    "Dossiers noirs 407",
  ],
  "أحداث القرارات غير سليمة.": [
    "Black files 408",
    "Dossiers noirs 408",
  ],
  "أرخص وأسرع من التفاوض العادي، ولو انكشف: غرامة + منع قيد": [
    "Black files 409",
    "Dossiers noirs 409",
  ],
  "أرشيف المعتزلين غير سليم": [
    "Black files 410",
    "Dossiers noirs 410",
  ],
  "أرشيف المعتزلين غير سليم.": [
    "Black files 411",
    "Dossiers noirs 411",
  ],
  "أرشيف المعتزلين يكرر سجل لاعب": [
    "Black files 412",
    "Dossiers noirs 412",
  ],
  "أرشيف المعتزلين يكرر سجل لاعب.": [
    "Black files 413",
    "Dossiers noirs 413",
  ],
  "أرقام تحكيمية لافتة": [
    "Black files 414",
    "Dossiers noirs 414",
  ],
  "أساسي": [
    "Black files 415",
    "Dossiers noirs 415",
  ],
  "أسواق غير مدعومة": [
    "Black files 416",
    "Dossiers noirs 416",
  ],
  "أسواق غير مدعومة.": [
    "Black files 417",
    "Dossiers noirs 417",
  ],
  "أضيف مركز المواهب دون استبدال قوائمك. التجدد الآلي يبدأ مستقبلًا في الأسواق المحملة؛ دفعات المالك تحتاج طلبه وموافقته": [
    "Black files 418",
    "Dossiers noirs 418",
  ],
  "أضيف مركز المواهب دون استبدال قوائمك. التجدد الآلي يبدأ مستقبلًا في الأسواق المحملة؛ دفعات المالك تحتاج طلبه وموافقته.": [
    "Black files 419",
    "Dossiers noirs 419",
  ],
  "أقنعته؛ معنويات النجوم انخفضت": [
    "Black files 420",
    "Dossiers noirs 420",
  ],
  "أقنعته؛ معنويات النجوم انخفضت.": [
    "Black files 421",
    "Dossiers noirs 421",
  ],
  "ألا يقل صافي الموسم عن {v}": [
    "Black files 422",
    "Dossiers noirs 422",
  ],
  "أهلًا بيك. مشروعك بدأ، والحفظ التلقائي شغال": [
    "Black files 423",
    "Dossiers noirs 423",
  ],
  "أهلًا بيك. مشروعك بدأ، والحفظ التلقائي شغال.": [
    "Black files 424",
    "Dossiers noirs 424",
  ],
  "أيام": [
    "Black files 425",
    "Dossiers noirs 425",
  ],
  "إبلاغ الاتحاد (يخفض الشبهات": [
    "Black files 426",
    "Dossiers noirs 426",
  ],
  "إبلاغ الاتحاد (يخفض الشبهات)": [
    "Black files 427",
    "Dossiers noirs 427",
  ],
  "إتمام مشروع منشأة واحد على الأقل": [
    "Black files 428",
    "Dossiers noirs 428",
  ],
  "إحصائيات الموسم 0.23: عدّادات أهداف وأسيست وبطاقات وتصنيفات ودقائق لكل لاعب تتراكم تلقائيًا وتُحفظ في نهاية الموسم؛ النتائج والعقود والمالية محفوظة كما هي": [
    "Black files 429",
    "Dossiers noirs 429",
  ],
  "إحصائيات الموسم 0.23: عدّادات أهداف وأسيست وبطاقات وتصنيفات ودقائق لكل لاعب تتراكم تلقائيًا وتُحفظ في نهاية الموسم؛ النتائج والعقود والمالية محفوظة كما هي.": [
    "Black files 430",
    "Dossiers noirs 430",
  ],
  "إحصائية تحكيمية غريبة لصالحك": [
    "Black files 431",
    "Dossiers noirs 431",
  ],
  "إخفاق جزئي": [
    "Black files 432",
    "Dossiers noirs 432",
  ],
  "إخفاق كبير": [
    "Black files 433",
    "Dossiers noirs 433",
  ],
  "إخفاق متتالٍ: {n}": [
    "Black files 434",
    "Dossiers noirs 434",
  ],
  "إعدادات المحاكاة ناقصة": [
    "Black files 435",
    "Dossiers noirs 435",
  ],
  "إعدادات المحاكاة ناقصة.": [
    "Black files 436",
    "Dossiers noirs 436",
  ],
  "إعلان تبرع خيري كبير للعلاقات": [
    "Black files 437",
    "Dossiers noirs 437",
  ],
  "إعلان تبرع لمستشفى أطفال خفف حدة العناوين الصحفية عن الشبهات": [
    "Black files 438",
    "Dossiers noirs 438",
  ],
  "إعلان تبرع لمستشفى أطفال خفف حدة العناوين الصحفية عن الشبهات.": [
    "Black files 439",
    "Dossiers noirs 439",
  ],
  "إغلاق": [
    "Black files 440",
    "Dossiers noirs 440",
  ],
  "إغلاق الخزنة": [
    "Black files 441",
    "Dossiers noirs 441",
  ],
  "إقناعه بالصمت لمصلحة النادي": [
    "Black files 442",
    "Dossiers noirs 442",
  ],
  "إلغاء": [
    "Black files 443",
    "Dossiers noirs 443",
  ],
  "إلغاء حصة تدريبية للحكام بعد جدل تحكيمي": [
    "Black files 444",
    "Dossiers noirs 444",
  ],
  "إنذار رسمي": [
    "Black files 445",
    "Dossiers noirs 445",
  ],
  "إنشاء حساب جديد": [
    "Black files 446",
    "Dossiers noirs 446",
  ],
  "إنهاء العقد": [
    "Black files 447",
    "Dossiers noirs 447",
  ],
  "إنهاء الموسم بسيولة لا تقل عن {v}": [
    "Black files 448",
    "Dossiers noirs 448",
  ],
  "إنهاء شبكة الوسيط — يخفض الشبهات 15% فورًا": [
    "Black files 449",
    "Dossiers noirs 449",
  ],
  "إيداع فوري بفلوس تجريبية لمن يعرف المكان. يُسجَّل في الدفاتر مثل أي تدفق نقدية فتبقى الإدارة المالية صادقة": [
    "Black files 450",
    "Dossiers noirs 450",
  ],
  "إيداع فوري بفلوس تجريبية لمن يعرف المكان. يُسجَّل في الدفاتر مثل أي تدفق نقدية فتبقى الإدارة المالية صادقة.": [
    "Black files 451",
    "Dossiers noirs 451",
  ],
  "ابحث باسم اللاعب": [
    "Black files 452",
    "Dossiers noirs 452",
  ],
  "ابحث باسم اللاعب…": [
    "Black files 453",
    "Dossiers noirs 453",
  ],
  "ابحث، فاوض، ووازن تكلفة الصفقة على المدى الطويل": [
    "Black files 454",
    "Dossiers noirs 454",
  ],
  "ابحث، فاوض، ووازن تكلفة الصفقة على المدى الطويل.": [
    "Black files 455",
    "Dossiers noirs 455",
  ],
  "ابدأ باتفاق مع النادي أولًا": [
    "Black files 456",
    "Dossiers noirs 456",
  ],
  "ابدأ باتفاق مع النادي أولًا.": [
    "Black files 457",
    "Dossiers noirs 457",
  ],
  "اتفاق النادي تم · تفاوض على العقد": [
    "Black files 458",
    "Dossiers noirs 458",
  ],
  "اتهام علني من منافس": [
    "Black files 459",
    "Dossiers noirs 459",
  ],
  "اتهام علني من منافس في مؤتمر صحفي": [
    "Black files 460",
    "Dossiers noirs 460",
  ],
  "احتجاج جماهيري خارج المقر −{n}": [
    "Black files 461",
    "Dossiers noirs 461",
  ],
  "احتفظ تحديث 0.8 بكل أنديتك ودرجاتك ونتائجك، بما فيها المستويات الإضافية القديمة. القوائم الجديدة وقواعد الاحتياط تبدأ في مشوار جديد فقط": [
    "Black files 462",
    "Dossiers noirs 462",
  ],
  "احتفظ تحديث 0.8 بكل أنديتك ودرجاتك ونتائجك، بما فيها المستويات الإضافية القديمة. القوائم الجديدة وقواعد الاحتياط تبدأ في مشوار جديد فقط.": [
    "Black files 463",
    "Dossiers noirs 463",
  ],
  "احتلال مركز مؤهل قاريًا — {v} أو أفضل": [
    "Black files 464",
    "Dossiers noirs 464",
  ],
  "احتمال الفشل: {n}%": [
    "Black files 465",
    "Dossiers noirs 465",
  ],
  "اختيار نادي جديد": [
    "Black files 466",
    "Dossiers noirs 466",
  ],
  "استرجاع": [
    "Black files 467",
    "Dossiers noirs 467",
  ],
  "استرجاع الحفظة ومتابعة اللعب": [
    "Black files 468",
    "Dossiers noirs 468",
  ],
  "استيراد والمتابعة": [
    "Black files 469",
    "Dossiers noirs 469",
  ],
  "اسم المالك غير صالح": [
    "Black files 470",
    "Dossiers noirs 470",
  ],
  "اسم المالك غير صالح.": [
    "Black files 471",
    "Dossiers noirs 471",
  ],
  "اشتريت التسجيل؛ الشبهات -15% لكن التكلفة عالية": [
    "Black files 472",
    "Dossiers noirs 472",
  ],
  "اشتريت التسجيل؛ الشبهات -15% لكن التكلفة عالية.": [
    "Black files 473",
    "Dossiers noirs 473",
  ],
  "اطلعت على اللائحة": [
    "Black files 474",
    "Dossiers noirs 474",
  ],
  "اطّلع على لائحة الجمعية العمومية": [
    "Black files 475",
    "Dossiers noirs 475",
  ],
  "اعتراف جزئي وتقديم كبش فداء": [
    "Black files 476",
    "Dossiers noirs 476",
  ],
  "اعترفت جزئيًا؛ الشبهات انخفضت 12% لكن الجماهير غاضبة": [
    "Black files 477",
    "Dossiers noirs 477",
  ],
  "اعترفت جزئيًا؛ الشبهات انخفضت 12% لكن الجماهير غاضبة.": [
    "Black files 478",
    "Dossiers noirs 478",
  ],
  "اعتماد التمويل": [
    "Black files 479",
    "Dossiers noirs 479",
  ],
  "افتح اللائحة كاملة": [
    "Black files 480",
    "Dossiers noirs 480",
  ],
  "افتح مكتب الوسيط": [
    "Black files 481",
    "Dossiers noirs 481",
  ],
  "اقتصاد 0.15: رعاة محليون لبلد ناديك، وعرض الرصيد بالعملة المحلية، ومكافآت أداء تلقائية للعقود القائمة؛ العقود والنتائج الحالية محفوظة": [
    "Black files 482",
    "Dossiers noirs 482",
  ],
  "اقتصاد 0.15: رعاة محليون لبلد ناديك، وعرض الرصيد بالعملة المحلية، ومكافآت أداء تلقائية للعقود القائمة؛ العقود والنتائج الحالية محفوظة.": [
    "Black files 483",
    "Dossiers noirs 483",
  ],
  "اقتصاد 0.16: تفاوض مضاد على الرعاية، وفئات تذاكر وعلاوة مباراة، وسوق مدربين موسع بعقود مؤرخة؛ العقود والنتائج الحالية محفوظة": [
    "Black files 484",
    "Dossiers noirs 484",
  ],
  "اقتصاد 0.16: تفاوض مضاد على الرعاية، وفئات تذاكر وعلاوة مباراة، وسوق مدربين موسع بعقود مؤرخة؛ العقود والنتائج الحالية محفوظة.": [
    "Black files 485",
    "Dossiers noirs 485",
  ],
  "الآثار سُجلت في الحسابات وحالة النادي": [
    "Black files 486",
    "Dossiers noirs 486",
  ],
  "الأساطير 0.17: قاعة أساطير بأسماء حقيقية وأدوار تدريبية حسب المركز؛ الحفظة القديمة تعمل كما هي وبدون عقود أساطير": [
    "Black files 487",
    "Dossiers noirs 487",
  ],
  "الأساطير 0.17: قاعة أساطير بأسماء حقيقية وأدوار تدريبية حسب المركز؛ الحفظة القديمة تعمل كما هي وبدون عقود أساطير.": [
    "Black files 488",
    "Dossiers noirs 488",
  ],
  "الأسماء والأعمار مرجعية؛ القدرات والعقود والاعتزال والأحداث محاكاة وليست حقائق عن الأشخاص": [
    "Black files 489",
    "Dossiers noirs 489",
  ],
  "الأسماء والأعمار مرجعية؛ القدرات والعقود والاعتزال والأحداث محاكاة وليست حقائق عن الأشخاص.": [
    "Black files 490",
    "Dossiers noirs 490",
  ],
  "الأغلى والأخطر — لاعب الخصم يتراجع في المباراة القادمة": [
    "Black files 491",
    "Dossiers noirs 491",
  ],
  "الإبقاء وتبريره كاستشاري": [
    "Black files 492",
    "Dossiers noirs 492",
  ],
  "الاتحاد فتح ملفًا رسميًا. أي عملية إضافية قد تفجر الفضيحة الكبرى": [
    "Black files 493",
    "Dossiers noirs 493",
  ],
  "الاتحاد فتح ملفًا رسميًا. أي عملية إضافية قد تفجر الفضيحة الكبرى.": [
    "Black files 494",
    "Dossiers noirs 494",
  ],
  "الاسم الذي يظهر في حسابك": [
    "Black files 495",
    "Dossiers noirs 495",
  ],
  "البحث عن لاعب": [
    "Black files 496",
    "Dossiers noirs 496",
  ],
  "التالي": [
    "Black files 497",
    "Dossiers noirs 497",
  ],
  "التجاهل رفع احتمال هروب الراعي": [
    "Black files 498",
    "Dossiers noirs 498",
  ],
  "التجاهل رفع احتمال هروب الراعي.": [
    "Black files 499",
    "Dossiers noirs 499",
  ],
  "التحقيق الرسمي اكتمل. خصم {n} نقاط، غرامة {money}، هروب راعٍ، غضب جماهيري، ومنع قيد {d} يومًا. الشبهات صُفرت مع عقوبة سمعة دائمة خفيفة": [
    "Black files 500",
    "Dossiers noirs 500",
  ],
  "التحقيق الرسمي اكتمل. خصم {n} نقاط، غرامة {money}، هروب راعٍ، غضب جماهيري، ومنع قيد {d} يومًا. الشبهات صُفرت مع عقوبة سمعة دائمة خفيفة.": [
    "Black files 501",
    "Dossiers noirs 501",
  ],
  "التحمل": [
    "Black files 502",
    "Dossiers noirs 502",
  ],
  "التراجع البدني تدريجي ويختلف للحارس. القرارات الفنية قد تستقر أو تتحسن قبل تراجعها": [
    "Black files 503",
    "Dossiers noirs 503",
  ],
  "التراجع البدني تدريجي ويختلف للحارس. القرارات الفنية قد تستقر أو تتحسن قبل تراجعها.": [
    "Black files 504",
    "Dossiers noirs 504",
  ],
  "التزام مترتب على قرار إداري": [
    "Black files 505",
    "Dossiers noirs 505",
  ],
  "التزامات مالية مكررة": [
    "Black files 506",
    "Dossiers noirs 506",
  ],
  "التزامات مالية مكررة.": [
    "Black files 507",
    "Dossiers noirs 507",
  ],
  "التسديد": [
    "Black files 508",
    "Dossiers noirs 508",
  ],
  "التصويت النهائي": [
    "Black files 509",
    "Dossiers noirs 509",
  ],
  "التصويت النهائي: {d}": [
    "Black files 510",
    "Dossiers noirs 510",
  ],
  "التصويت النهائي: إخفاق جزئي — تحذير نهائي": [
    "Black files 511",
    "Dossiers noirs 511",
  ],
  "التصويت النهائي: إخفاق كبير": [
    "Black files 512",
    "Dossiers noirs 512",
  ],
  "التعاقد مع لاعب لا يزيد عمره عن {v} عامًا": [
    "Black files 513",
    "Dossiers noirs 513",
  ],
  "التعاون الجزئي وتقديم وثائق مجتزأة": [
    "Black files 514",
    "Dossiers noirs 514",
  ],
  "التعاون خفض الشبهات 6%": [
    "Black files 515",
    "Dossiers noirs 515",
  ],
  "التعاون خفض الشبهات 6%.": [
    "Black files 516",
    "Dossiers noirs 516",
  ],
  "التفاوض على إعارة": [
    "Black files 517",
    "Dossiers noirs 517",
  ],
  "التقييم مبني على الدور والعمر ومستوى السوق وتنوع فردي ثابت. الاحترافية واللياقة الطبيعية والإمكانات صفات محاكاة وليست معلومات شخصية مؤكدة": [
    "Black files 518",
    "Dossiers noirs 518",
  ],
  "التقييم مبني على الدور والعمر ومستوى السوق وتنوع فردي ثابت. الاحترافية واللياقة الطبيعية والإمكانات صفات محاكاة وليست معلومات شخصية مؤكدة.": [
    "Black files 519",
    "Dossiers noirs 519",
  ],
  "التكلفة المضمونة تشمل الزيادة السنوية ولا تشمل مكافآت المشاركات والأهداف المتغيرة. وعد الأساسي: المشاركة في ٦٠٪ من المباريات خلال أول ٦٠ يومًا؛ المخالفة تخفض المعنويات ١٢ نقطة. الشرط الجزائي يسمح لك بدفعه عند شراء لاعب من السوق؛ بيع لاعبيك للمنافسين غير متاح بعد": [
    "Black files 520",
    "Dossiers noirs 520",
  ],
  "التكلفة المضمونة تشمل الزيادة السنوية ولا تشمل مكافآت المشاركات والأهداف المتغيرة. وعد الأساسي: المشاركة في ٦٠٪ من المباريات خلال أول ٦٠ يومًا؛ المخالفة تخفض المعنويات ١٢ نقطة. الشرط الجزائي يسمح لك بدفعه عند شراء لاعب من السوق؛ بيع لاعبيك للمنافسين غير متاح بعد.": [
    "Black files 521",
    "Dossiers noirs 521",
  ],
  "التكلفة: {money}": [
    "Black files 522",
    "Dossiers noirs 522",
  ],
  "التمرير": [
    "Black files 523",
    "Dossiers noirs 523",
  ],
  "التهديد المتبادل رفع الشبهات 8%": [
    "Black files 524",
    "Dossiers noirs 524",
  ],
  "التهديد المتبادل رفع الشبهات 8%.": [
    "Black files 525",
    "Dossiers noirs 525",
  ],
  "التهديد رفع الشبهات 12%": [
    "Black files 526",
    "Dossiers noirs 526",
  ],
  "التهديد رفع الشبهات 12%.": [
    "Black files 527",
    "Dossiers noirs 527",
  ],
  "الجاهزية": [
    "Black files 528",
    "Dossiers noirs 528",
  ],
  "الجمعية العمومية": [
    "Black files 529",
    "Dossiers noirs 529",
  ],
  "الجمعية العمومية 0.26: مجلس إدارة ومستثمرون يصدرون لائحة مطالب الموسم بثلاثة محاور، مع مراجعة منتصف الموسم وتصويت نهائي؛ الملكية لا تُمس في أي حال": [
    "Black files 530",
    "Dossiers noirs 530",
  ],
  "الجمعية العمومية والمستثمرون يحددون مطالب الموسم قبل أول جولة. كل بند له هدف قابل للقياس ويتتبعه النظام لحظيًا، والتصويت في نهاية الموسم": [
    "Black files 531",
    "Dossiers noirs 531",
  ],
  "الجمعية العمومية والمستثمرون يحددون مطالب الموسم قبل أول جولة. كل بند له هدف قابل للقياس ويتتبعه النظام لحظيًا، والتصويت في نهاية الموسم.": [
    "Black files 532",
    "Dossiers noirs 532",
  ],
  "الجمعية راجعت التقدم في منتصف الموسم: البنود في إيقاعها الصحيح أو أقرب. المستثمرون راضون، والجماهير تستشعر الاستقرار. استمر على نفس النهج": [
    "Black files 533",
    "Dossiers noirs 533",
  ],
  "الجمعية راجعت التقدم في منتصف الموسم: بنود كثيرة متأخرة عن إيقاعها. هذا إنذار أصفر رسمي بمهلة حتى نهاية الموسم. لا وصاية على قراراتك، لكن التصويت النهائي سيكون على هذا الأساس": [
    "Black files 534",
    "Dossiers noirs 534",
  ],
  "الجمعية سجّلت إخفاقًا جزئيًا في لائحة الموسم. ليست كارثة، لكنها ليست اللائحة المطلوبة: هذا تحذير نهائي مكتوب، والموسم القادم يُقاس على تحسّن ملموس. ملكيتك للنادي كما هي": [
    "Black files 535",
    "Dossiers noirs 535",
  ],
  "الجمعية سجّلت إخفاقًا كبيرًا في لائحة الموسم، والعواقب التنفيذية صدرت بالفعل. الملكية باقية لك، واللائحة القادمة تُبنى على إعادة البناء لا العقاب. تفاصيل الميزانية والتجميد والرعاية في شاشة الجمعية العمومية": [
    "Black files 536",
    "Dossiers noirs 536",
  ],
  "الجمعية والمستثمرون صوّتوا بالثقة: اللائحة نُفِّذت. المكافآت دخلت فعلًا — دعم مالي من المستثمرين، وزيادة ميزانية التعاقدات للموسم القادم، ودفعة في حب الجماهير": [
    "Black files 537",
    "Dossiers noirs 537",
  ],
  "الحالي": [
    "Black files 538",
    "Dossiers noirs 538",
  ],
  "الحدث تم حسمه بالفعل": [
    "Black files 539",
    "Dossiers noirs 539",
  ],
  "الحدث تم حسمه بالفعل.": [
    "Black files 540",
    "Dossiers noirs 540",
  ],
  "الحرب الإعلامية اشتعلت؛ الشبهات +6%": [
    "Black files 541",
    "Dossiers noirs 541",
  ],
  "الحرب الإعلامية اشتعلت؛ الشبهات +6%.": [
    "Black files 542",
    "Dossiers noirs 542",
  ],
  "الحفاظ على أصول النادي": [
    "Black files 543",
    "Dossiers noirs 543",
  ],
  "الحفظة غير سليمة": [
    "Black files 544",
    "Dossiers noirs 544",
  ],
  "الحفظة غير سليمة:": [
    "Black files 545",
    "Dossiers noirs 545",
  ],
  "الحكام يلغون حصة تدريبية": [
    "Black files 546",
    "Dossiers noirs 546",
  ],
  "الحكم الذي كان يتعاون معك أبلغ الوسيط أنه يتوقف خوفًا من التحقيق. الدفع الإضافي قد يعيده، التهديد يرفع الشبهات، والقبول ينهي التحيز": [
    "Black files 547",
    "Dossiers noirs 547",
  ],
  "الحكم الذي كان يتعاون معك أبلغ الوسيط أنه يتوقف خوفًا من التحقيق. الدفع الإضافي قد يعيده، التهديد يرفع الشبهات، والقبول ينهي التحيز.": [
    "Black files 548",
    "Dossiers noirs 548",
  ],
  "الحكم الصديق يتوقف": [
    "Black files 549",
    "Dossiers noirs 549",
  ],
  "الحكم الصديق يتوقف عن التعاون": [
    "Black files 550",
    "Dossiers noirs 550",
  ],
  "الحكم غادر سريعًا بعد صافرة مباراة شهدت قرارًا مثيرًا للجدل لصالحكم": [
    "Black files 551",
    "Dossiers noirs 551",
  ],
  "الحكم غادر سريعًا بعد صافرة مباراة شهدت قرارًا مثيرًا للجدل لصالحكم.": [
    "Black files 552",
    "Dossiers noirs 552",
  ],
  "الدفاع": [
    "Black files 553",
    "Dossiers noirs 553",
  ],
  "الرفض زاد همسات الصحافة، والشبهات ارتفعت 5%": [
    "Black files 554",
    "Dossiers noirs 554",
  ],
  "الرفض زاد همسات الصحافة، والشبهات ارتفعت 5%.": [
    "Black files 555",
    "Dossiers noirs 555",
  ],
  "السابق": [
    "Black files 556",
    "Dossiers noirs 556",
  ],
  "الساعات الأخيرة": [
    "Black files 557",
    "Dossiers noirs 557",
  ],
  "السرعة": [
    "Black files 558",
    "Dossiers noirs 558",
  ],
  "السعر من ٥٠ إلى ٥٠٠ جنيه": [
    "Black files 559",
    "Dossiers noirs 559",
  ],
  "السعر من ٥٠ إلى ٥٠٠ جنيه.": [
    "Black files 560",
    "Dossiers noirs 560",
  ],
  "السوق يغلق الليلة عند منتصف الليل 23:59 بدقة · عروض متسارعة وفرص أخيرة": [
    "Black files 561",
    "Dossiers noirs 561",
  ],
  "السيولة غير كافية": [
    "Black files 562",
    "Dossiers noirs 562",
  ],
  "السيولة غير كافية.": [
    "Black files 563",
    "Dossiers noirs 563",
  ],
  "السيولة لا تكفي لدفع قيمة الخطف المخفضة": [
    "Black files 564",
    "Dossiers noirs 564",
  ],
  "السيولة لا تكفي لدفع قيمة الخطف المخفضة.": [
    "Black files 565",
    "Dossiers noirs 565",
  ],
  "السيولة لا تكفي للتبرع": [
    "Black files 566",
    "Dossiers noirs 566",
  ],
  "السيولة لا تكفي للتبرع.": [
    "Black files 567",
    "Dossiers noirs 567",
  ],
  "السيولة لا تكفي للمقدم ومكافأة التوقيع وعمولة الوكيل": [
    "Black files 568",
    "Dossiers noirs 568",
  ],
  "السيولة لا تكفي للمقدم ومكافأة التوقيع وعمولة الوكيل.": [
    "Black files 569",
    "Dossiers noirs 569",
  ],
  "السيولة لا تكفي لمقدم العرض": [
    "Black files 570",
    "Dossiers noirs 570",
  ],
  "السيولة لا تكفي لمقدم العرض.": [
    "Black files 571",
    "Dossiers noirs 571",
  ],
  "السيولة لا تكفي لهذا القرار. اختر بديلًا مناسبًا": [
    "Black files 572",
    "Dossiers noirs 572",
  ],
  "السيولة لا تكفي لهذا القرار. اختر بديلًا مناسبًا.": [
    "Black files 573",
    "Dossiers noirs 573",
  ],
  "السيولة لا تكفي لهذه العملية": [
    "Black files 574",
    "Dossiers noirs 574",
  ],
  "الشبهات": [
    "Black files 575",
    "Dossiers noirs 575",
  ],
  "الشبهات: +{n}%": [
    "Black files 576",
    "Dossiers noirs 576",
  ],
  "الشرط الجزائي": [
    "Black files 577",
    "Dossiers noirs 577",
  ],
  "الشرط الجزائي: {money}": [
    "Black files 578",
    "Dossiers noirs 578",
  ],
  "الصحافة المحلية تشيد بنظافة ملفات ناديك هذا الموسم": [
    "Black files 579",
    "Dossiers noirs 579",
  ],
  "الصحافة المحلية تشيد بنظافة ملفات ناديك هذا الموسم.": [
    "Black files 580",
    "Dossiers noirs 580",
  ],
  "الصمت فُسر كضعف؛ الشبهات +3%": [
    "Black files 581",
    "Dossiers noirs 581",
  ],
  "الصمت فُسر كضعف؛ الشبهات +3%.": [
    "Black files 582",
    "Dossiers noirs 582",
  ],
  "العرض اتبعت. مرّر يومًا عشان يوصلك الرد": [
    "Black files 583",
    "Dossiers noirs 583",
  ],
  "العرض اتبعت. مرّر يومًا عشان يوصلك الرد.": [
    "Black files 584",
    "Dossiers noirs 584",
  ],
  "العرض غير متاح": [
    "Black files 585",
    "Dossiers noirs 585",
  ],
  "العرض غير متاح.": [
    "Black files 586",
    "Dossiers noirs 586",
  ],
  "العمر تقديري للمحاكاة؛ لا يتوفر تاريخ ميلاد موثق لهذا السجل": [
    "Black files 587",
    "Dossiers noirs 587",
  ],
  "العمر تقديري للمحاكاة؛ لا يتوفر تاريخ ميلاد موثق لهذا السجل.": [
    "Black files 588",
    "Dossiers noirs 588",
  ],
  "العين على الصفقة القادمة": [
    "Black files 589",
    "Dossiers noirs 589",
  ],
  "الفريق الأول": [
    "Black files 590",
    "Dossiers noirs 590",
  ],
  "الفضيحة الكبرى": [
    "Black files 591",
    "Dossiers noirs 591",
  ],
  "الفضيحة الكبرى — {n} نقاط وغرامات": [
    "Black files 592",
    "Dossiers noirs 592",
  ],
  "الفوز بـ{v} مواجهات إقصائية في الكأس": [
    "Black files 593",
    "Dossiers noirs 593",
  ],
  "القائمة ممتلئة": [
    "Black files 594",
    "Dossiers noirs 594",
  ],
  "القائمة ممتلئة.": [
    "Black files 595",
    "Dossiers noirs 595",
  ],
  "القرارات": [
    "Black files 596",
    "Dossiers noirs 596",
  ],
  "اللائحة لا تمس ملكيتك للنادي أبدًا: العواقب مالية وجماهيرية وإدارية فقط، ومفيش أي مسار ينهي مسيرتك": [
    "Black files 597",
    "Dossiers noirs 597",
  ],
  "اللائحة لا تمس ملكيتك للنادي أبدًا: العواقب مالية وجماهيرية وإدارية فقط، ومفيش أي مسار ينهي مسيرتك.": [
    "Black files 598",
    "Dossiers noirs 598",
  ],
  "اللائحة منشورة كاملة في شاشة الجمعية العمومية: بنود على ثلاثة محاور، لكل بند هدف قابل للقياس. مراجعة منتصف الموسم ثم تصويت نهائي في نهاية الموسم. الالتزام الجيد يعني مكافآت حقيقية، والتأخر يعني تحذيرًا رسميًا": [
    "Black files 599",
    "Dossiers noirs 599",
  ],
  "اللاعب اعتزل ولا يمكن تسجيله": [
    "Black files 600",
    "Dossiers noirs 600",
  ],
  "اللاعب اعتزل ولا يمكن تسجيله.": [
    "Black files 601",
    "Dossiers noirs 601",
  ],
  "اللاعب غير متاح للشراء": [
    "Black files 602",
    "Dossiers noirs 602",
  ],
  "اللاعب غير متاح للشراء.": [
    "Black files 603",
    "Dossiers noirs 603",
  ],
  "اللاعب ليس في النادي": [
    "Black files 604",
    "Dossiers noirs 604",
  ],
  "اللاعب ليس في النادي.": [
    "Black files 605",
    "Dossiers noirs 605",
  ],
  "اللاعب معار الآن": [
    "Black files 606",
    "Dossiers noirs 606",
  ],
  "اللاعب معار الآن.": [
    "Black files 607",
    "Dossiers noirs 607",
  ],
  "اللاعب معتزل داخل هذه الحفظة. لا يمكن التعاقد معه كلاعب": [
    "Black files 608",
    "Dossiers noirs 608",
  ],
  "اللاعب معتزل داخل هذه الحفظة. لا يمكن التعاقد معه كلاعب.": [
    "Black files 609",
    "Dossiers noirs 609",
  ],
  "اللاعب مُعار؛ لا يمكن شراء عقده في هذا النموذج": [
    "Black files 610",
    "Dossiers noirs 610",
  ],
  "اللاعب مُعار؛ لا يمكن شراء عقده في هذا النموذج.": [
    "Black files 611",
    "Dossiers noirs 611",
  ],
  "اللاعب يرفض المرتب. جرّب الاقتراب من طلبه الموضّح": [
    "Black files 612",
    "Dossiers noirs 612",
  ],
  "اللاعب يرفض المرتب. جرّب الاقتراب من طلبه الموضّح.": [
    "Black files 613",
    "Dossiers noirs 613",
  ],
  "اللاعب يطلب الحفاظ على مرتبه على الأقل": [
    "Black files 614",
    "Dossiers noirs 614",
  ],
  "اللاعب يطلب الحفاظ على مرتبه على الأقل.": [
    "Black files 615",
    "Dossiers noirs 615",
  ],
  "اللعب غير النظيف كمحتوى عادي في اللعبة وبأسماء حقيقية — كل عملية لها تكلفة كبيرة واحتمال فشل وheat يتراكم. الشبهات 0-100% ولها مستويات عواقب معلنة": [
    "Black files 616",
    "Dossiers noirs 616",
  ],
  "اللعب غير النظيف كمحتوى عادي في اللعبة وبأسماء حقيقية — كل عملية لها تكلفة كبيرة واحتمال فشل وheat يتراكم. الشبهات 0-100% ولها مستويات عواقب معلنة.": [
    "Black files 617",
    "Dossiers noirs 617",
  ],
  "المحور التطويري": [
    "Black files 618",
    "Dossiers noirs 618",
  ],
  "المحور المالي": [
    "Black files 619",
    "Dossiers noirs 619",
  ],
  "المدرج يهتف: التحكيم معنا": [
    "Black files 620",
    "Dossiers noirs 620",
  ],
  "المدرج يهتف: التحكيم معنا؟": [
    "Black files 621",
    "Dossiers noirs 621",
  ],
  "المرحلة ٢ من ٢ · شروط اللاعب": [
    "Black files 622",
    "Dossiers noirs 622",
  ],
  "المشروع بدأ. موعد الاستلام واتفاق الدفع في البريد": [
    "Black files 623",
    "Dossiers noirs 623",
  ],
  "المشروع بدأ. موعد الاستلام واتفاق الدفع في البريد.": [
    "Black files 624",
    "Dossiers noirs 624",
  ],
  "الملف": [
    "Black files 625",
    "Dossiers noirs 625",
  ],
  "الملفات السوداء": [
    "Black files 626",
    "Dossiers noirs 626",
  ],
  "الملفات السوداء 0.28: مؤشر شبهات 0-100% مع عواقب معلنة، وعمليات عبر الوسيط بتكلفة كبيرة واحتمال فشل، وشرط جزائي متدرج حسب التقييم مع مضاعفات؛ الحفظة القديمة تبدأ نظيفة": [
    "Black files 627",
    "Dossiers noirs 627",
  ],
  "الملفات السوداء 0.28: مؤشر شبهات 0-100% مع عواقب معلنة، وعمليات عبر الوسيط بتكلفة كبيرة واحتمال فشل، وشرط جزائي متدرج حسب التقييم مع مضاعفات؛ الحفظة القديمة تبدأ نظيفة.": [
    "Black files 628",
    "Dossiers noirs 628",
  ],
  "المماطلة رفعت الشبهات 5%": [
    "Black files 629",
    "Dossiers noirs 629",
  ],
  "المماطلة رفعت الشبهات 5%.": [
    "Black files 630",
    "Dossiers noirs 630",
  ],
  "المنافس المستهدف بحربك الإعلامية أصدر بيانًا غاضبًا واتهم جهات مجهولة": [
    "Black files 631",
    "Dossiers noirs 631",
  ],
  "المنافس المستهدف بحربك الإعلامية أصدر بيانًا غاضبًا واتهم جهات مجهولة.": [
    "Black files 632",
    "Dossiers noirs 632",
  ],
  "المنافس يرد بغضب": [
    "Black files 633",
    "Dossiers noirs 633",
  ],
  "المهلة: {d}": [
    "Black files 634",
    "Dossiers noirs 634",
  ],
  "النادي أصدر بيانًا مقتضبًا يؤكد التزامه بالنزاهة بعد همسات صحفية": [
    "Black files 635",
    "Dossiers noirs 635",
  ],
  "النادي أصدر بيانًا مقتضبًا يؤكد التزامه بالنزاهة بعد همسات صحفية.": [
    "Black files 636",
    "Dossiers noirs 636",
  ],
  "النادي يطلب زيادة قيمة الانتقال. يمكنك قبول القيمة الجديدة والانتقال لشروط اللاعب، أو إنهاء التفاوض": [
    "Black files 637",
    "Dossiers noirs 637",
  ],
  "النادي يطلب زيادة قيمة الانتقال. يمكنك قبول القيمة الجديدة والانتقال لشروط اللاعب، أو إنهاء التفاوض.": [
    "Black files 638",
    "Dossiers noirs 638",
  ],
  "النصر": [
    "Black files 639",
    "Dossiers noirs 639",
  ],
  "النفي القاطع هدّأ الرعاة": [
    "Black files 640",
    "Dossiers noirs 640",
  ],
  "النفي القاطع هدّأ الرعاة.": [
    "Black files 641",
    "Dossiers noirs 641",
  ],
  "النفي لم يقنع الجميع؛ الشبهات +5%": [
    "Black files 642",
    "Dossiers noirs 642",
  ],
  "النفي لم يقنع الجميع؛ الشبهات +5%.": [
    "Black files 643",
    "Dossiers noirs 643",
  ],
  "الهجوم": [
    "Black files 644",
    "Dossiers noirs 644",
  ],
  "الهدايا خفضت الشبهات 8% لكنها عملية قذرة +6% لاحقًا": [
    "Black files 645",
    "Dossiers noirs 645",
  ],
  "الهدايا خفضت الشبهات 8% لكنها عملية قذرة +6% لاحقًا.": [
    "Black files 646",
    "Dossiers noirs 646",
  ],
  "الهدف": [
    "Black files 647",
    "Dossiers noirs 647",
  ],
  "الوسط": [
    "Black files 648",
    "Dossiers noirs 648",
  ],
  "الوسيط الذي نفذ عملياتك يطلب زيادة 40% على أتعابه مقابل الاستمرار في التغطية. الدفع يحافظ على الشبكة، الرفض يقطعها ويخفض الشبهات": [
    "Black files 649",
    "Dossiers noirs 649",
  ],
  "الوسيط الذي نفذ عملياتك يطلب زيادة 40% على أتعابه مقابل الاستمرار في التغطية. الدفع يحافظ على الشبكة، الرفض يقطعها ويخفض الشبهات.": [
    "Black files 650",
    "Dossiers noirs 650",
  ],
  "الوسيط شوهد في مقهى قرب الاتحاد": [
    "Black files 651",
    "Dossiers noirs 651",
  ],
  "الوسيط في مقهى الاتحاد": [
    "Black files 652",
    "Dossiers noirs 652",
  ],
  "الوسيط مشغول حتى {d} — فاصل أمان بين العمليات": [
    "Black files 653",
    "Dossiers noirs 653",
  ],
  "الوسيط والشبهات": [
    "Black files 654",
    "Dossiers noirs 654",
  ],
  "الوسيط يطلب زيادة": [
    "Black files 655",
    "Dossiers noirs 655",
  ],
  "الوسيط يطلب زيادة مقابل الاستمرار": [
    "Black files 656",
    "Dossiers noirs 656",
  ],
  "الوكيل الدائم في المقر": [
    "Black files 657",
    "Dossiers noirs 657",
  ],
  "الوكيل على المرتب شوهد في النادي": [
    "Black files 658",
    "Dossiers noirs 658",
  ],
  "انسحاب راعٍ من العقد": [
    "Black files 659",
    "Dossiers noirs 659",
  ],
  "انقسام جماهيري حول أخلاقيات الفوز": [
    "Black files 660",
    "Dossiers noirs 660",
  ],
  "انكشاف خطف لاعب": [
    "Black files 661",
    "Dossiers noirs 661",
  ],
  "بدون حصرية قطاع؛ مساحة الإعلان نفسها محجوزة لهذا الشريك فقط": [
    "Black files 662",
    "Dossiers noirs 662",
  ],
  "بدون حصرية قطاع؛ مساحة الإعلان نفسها محجوزة لهذا الشريك فقط.": [
    "Black files 663",
    "Dossiers noirs 663",
  ],
  "بديل": [
    "Black files 664",
    "Dossiers noirs 664",
  ],
  "بررت؛ الشبهات +3%": [
    "Black files 665",
    "Dossiers noirs 665",
  ],
  "بررت؛ الشبهات +3%.": [
    "Black files 666",
    "Dossiers noirs 666",
  ],
  "بطولات آسيا الثلاث تبدأ بعد نهاية الموسم الجاري؛ النتائج والدرجات الحالية محفوظة": [
    "Black files 667",
    "Dossiers noirs 667",
  ],
  "بطولات آسيا الثلاث تبدأ بعد نهاية الموسم الجاري؛ النتائج والدرجات الحالية محفوظة.": [
    "Black files 668",
    "Dossiers noirs 668",
  ],
  "بطولات كونكاكاف الأربع تبدأ بعد نهاية الموسم الجاري؛ النتائج والدرجات الحالية محفوظة": [
    "Black files 669",
    "Dossiers noirs 669",
  ],
  "بطولات كونكاكاف الأربع تبدأ بعد نهاية الموسم الجاري؛ النتائج والدرجات الحالية محفوظة.": [
    "Black files 670",
    "Dossiers noirs 670",
  ],
  "بلا شرط": [
    "Black files 671",
    "Dossiers noirs 671",
  ],
  "بلا شرط (راتب ×0.85": [
    "Black files 672",
    "Dossiers noirs 672",
  ],
  "بلا شرط (راتب ×0.85)": [
    "Black files 673",
    "Dossiers noirs 673",
  ],
  "بلا عواقب": [
    "Black files 674",
    "Dossiers noirs 674",
  ],
  "بند حاسم": [
    "Black files 675",
    "Dossiers noirs 675",
  ],
  "بند محقق": [
    "Black files 676",
    "Dossiers noirs 676",
  ],
  "بنود عقد أو مرجع مصدر غير صالح": [
    "Black files 677",
    "Dossiers noirs 677",
  ],
  "بنود عقد أو مرجع مصدر غير صالح.": [
    "Black files 678",
    "Dossiers noirs 678",
  ],
  "بيان نظافة من النادي بعد همسات": [
    "Black files 679",
    "Dossiers noirs 679",
  ],
  "بيان: نادينا نظيف": [
    "Black files 680",
    "Dossiers noirs 680",
  ],
  "بيانات إحصائيات الموسم غير سليمة": [
    "Black files 681",
    "Dossiers noirs 681",
  ],
  "بيانات إحصائيات الموسم غير سليمة.": [
    "Black files 682",
    "Dossiers noirs 682",
  ],
  "بيانات الحياة المهنية والأحداث ناقصة": [
    "Black files 683",
    "Dossiers noirs 683",
  ],
  "بيانات الحياة المهنية والأحداث ناقصة.": [
    "Black files 684",
    "Dossiers noirs 684",
  ],
  "بيانات القدرات أو مصادر الميلاد غير سليمة": [
    "Black files 685",
    "Dossiers noirs 685",
  ],
  "بيانات القدرات أو مصادر الميلاد غير سليمة.": [
    "Black files 686",
    "Dossiers noirs 686",
  ],
  "بيانات اللاعبين غير سليمة أو متكررة": [
    "Black files 687",
    "Dossiers noirs 687",
  ],
  "بيانات اللاعبين غير سليمة أو متكررة.": [
    "Black files 688",
    "Dossiers noirs 688",
  ],
  "بيانات المنشآت غير سليمة": [
    "Black files 689",
    "Dossiers noirs 689",
  ],
  "بيانات المنشآت غير سليمة.": [
    "Black files 690",
    "Dossiers noirs 690",
  ],
  "بيانات الموظفين غير سليمة": [
    "Black files 691",
    "Dossiers noirs 691",
  ],
  "بيانات الموظفين غير سليمة.": [
    "Black files 692",
    "Dossiers noirs 692",
  ],
  "بيانات النادي أو التاريخ غير سليمة": [
    "Black files 693",
    "Dossiers noirs 693",
  ],
  "بيانات النادي أو التاريخ غير سليمة.": [
    "Black files 694",
    "Dossiers noirs 694",
  ],
  "بيانات عواقب الملعب غير سليمة": [
    "Black files 695",
    "Dossiers noirs 695",
  ],
  "بيانات عواقب الملعب غير سليمة.": [
    "Black files 696",
    "Dossiers noirs 696",
  ],
  "بيانات مالية غير سليمة": [
    "Black files 697",
    "Dossiers noirs 697",
  ],
  "بيانات مالية غير سليمة.": [
    "Black files 698",
    "Dossiers noirs 698",
  ],
  "بيع لاعب بمقابل لا يقل عن {v}": [
    "Black files 699",
    "Dossiers noirs 699",
  ],
  "تاريخ الميلاد": [
    "Black files 700",
    "Dossiers noirs 700",
  ],
  "تاريخ الميلاد:": [
    "Black files 701",
    "Dossiers noirs 701",
  ],
  "تبرع خيري 5M خفض الشبهات 10%": [
    "Black files 702",
    "Dossiers noirs 702",
  ],
  "تبرع خيري 5M خفض الشبهات 10%.": [
    "Black files 703",
    "Dossiers noirs 703",
  ],
  "تبرع خيري لخفض الشبهات": [
    "Black files 704",
    "Dossiers noirs 704",
  ],
  "تبرع خيري يلمع الصورة": [
    "Black files 705",
    "Dossiers noirs 705",
  ],
  "تبرع خيري يلمع الصورة بعد شبهات": [
    "Black files 706",
    "Dossiers noirs 706",
  ],
  "تبرع علني يخفض الشبهات — كل مليون يخفض 2%": [
    "Black files 707",
    "Dossiers noirs 707",
  ],
  "تجاهل القلق": [
    "Black files 708",
    "Dossiers noirs 708",
  ],
  "تجاوز {v} مواجهات إقصائية في البطولة القارية": [
    "Black files 709",
    "Dossiers noirs 709",
  ],
  "تجاوز ميزانية المرتبات": [
    "Black files 710",
    "Dossiers noirs 710",
  ],
  "تجاوز ميزانية المرتبات الشهرية": [
    "Black files 711",
    "Dossiers noirs 711",
  ],
  "تجاوز ميزانية المرتبات الشهرية.": [
    "Black files 712",
    "Dossiers noirs 712",
  ],
  "تجاوز ميزانية المرتبات.": [
    "Black files 713",
    "Dossiers noirs 713",
  ],
  "تجديد العقد": [
    "Black files 714",
    "Dossiers noirs 714",
  ],
  "تجديد عقد": [
    "Black files 715",
    "Dossiers noirs 715",
  ],
  "تجميد التعاقدات حتى {d}": [
    "Black files 716",
    "Dossiers noirs 716",
  ],
  "تحذير رسمي عند منتصف الموسم": [
    "Black files 717",
    "Dossiers noirs 717",
  ],
  "تحقيق رسمي وشيك": [
    "Black files 718",
    "Dossiers noirs 718",
  ],
  "تحقيق رسمي وشيك — الشبهات {n}%": [
    "Black files 719",
    "Dossiers noirs 719",
  ],
  "تحقيق روتيني من اللجنة": [
    "Black files 720",
    "Dossiers noirs 720",
  ],
  "تحقيق روتيني من لجنة النزاهة": [
    "Black files 721",
    "Dossiers noirs 721",
  ],
  "تحميل واستبدال": [
    "Black files 722",
    "Dossiers noirs 722",
  ],
  "تحويله لعقد استشاري معلن": [
    "Black files 723",
    "Dossiers noirs 723",
  ],
  "تحيز تحكيمي لمباراة واحدة": [
    "Black files 724",
    "Dossiers noirs 724",
  ],
  "تحيز تحكيمي نشط حتى {d}": [
    "Black files 725",
    "Dossiers noirs 725",
  ],
  "تسجيل الدخول": [
    "Black files 726",
    "Dossiers noirs 726",
  ],
  "تسجيل صوتي بين الوسيط ومسؤولك عن عملية تحيز تحكيمي بدأ ينتشر في مجموعات واتساب صحفية. شراء التسجيل، نفي صحته، أو الاعتراف الجزئي": [
    "Black files 727",
    "Dossiers noirs 727",
  ],
  "تسجيل صوتي بين الوسيط ومسؤولك عن عملية تحيز تحكيمي بدأ ينتشر في مجموعات واتساب صحفية. شراء التسجيل، نفي صحته، أو الاعتراف الجزئي.": [
    "Black files 728",
    "Dossiers noirs 728",
  ],
  "تسريب تسجيلي مسرب": [
    "Black files 729",
    "Dossiers noirs 729",
  ],
  "تسريب تسجيلي يهدد بالانتشار": [
    "Black files 730",
    "Dossiers noirs 730",
  ],
  "تسريب عقد الوكيل": [
    "Black files 731",
    "Dossiers noirs 731",
  ],
  "تسريب عقد الوكيل على المرتب": [
    "Black files 732",
    "Dossiers noirs 732",
  ],
  "تسريب عن محاولة رشوة فاشلة لاعب خصم قبل مباراة — بلا دليل مادي": [
    "Black files 733",
    "Dossiers noirs 733",
  ],
  "تسريب عن محاولة رشوة فاشلة لاعب خصم قبل مباراة — بلا دليل مادي.": [
    "Black files 734",
    "Dossiers noirs 734",
  ],
  "تسريب وثائق، تحقيق أولي، وقلق رعاة. الصحافة تطلب توضيحًا": [
    "Black files 735",
    "Dossiers noirs 735",
  ],
  "تسريب وثائق، تحقيق أولي، وقلق رعاة. الصحافة تطلب توضيحًا.": [
    "Black files 736",
    "Dossiers noirs 736",
  ],
  "تسريبات وتحقيق أولي": [
    "Black files 737",
    "Dossiers noirs 737",
  ],
  "تسريبات وتحقيق أولي — الشبهات {n}%": [
    "Black files 738",
    "Dossiers noirs 738",
  ],
  "تشويه سمعة منافس مباشر — معنوياته تنخفض وجماهيرك ترتفع مؤقتًا": [
    "Black files 739",
    "Dossiers noirs 739",
  ],
  "تصدر اللائحة عند بداية الموسم القادم حسب حجم النادي وطموحه": [
    "Black files 740",
    "Dossiers noirs 740",
  ],
  "تصدر اللائحة عند بداية الموسم القادم حسب حجم النادي وطموحه.": [
    "Black files 741",
    "Dossiers noirs 741",
  ],
  "تصدير الحالية": [
    "Black files 742",
    "Dossiers noirs 742",
  ],
  "تصدير الحالية أولًا": [
    "Black files 743",
    "Dossiers noirs 743",
  ],
  "تصفية السوق": [
    "Black files 744",
    "Dossiers noirs 744",
  ],
  "تصفية المركز": [
    "Black files 745",
    "Dossiers noirs 745",
  ],
  "تعاقدات مجمّدة حتى {d}": [
    "Black files 746",
    "Dossiers noirs 746",
  ],
  "تعاون كامل وتسليم المستندات": [
    "Black files 747",
    "Dossiers noirs 747",
  ],
  "تعذر إتمام المزامنة السحابية": [
    "Black files 748",
    "Dossiers noirs 748",
  ],
  "تعذر إتمام المزامنة السحابية.": [
    "Black files 749",
    "Dossiers noirs 749",
  ],
  "تعذر الاستيراد": [
    "Black files 750",
    "Dossiers noirs 750",
  ],
  "تعذر الاستيراد:": [
    "Black files 751",
    "Dossiers noirs 751",
  ],
  "تعذر الوصول للتخزين المحلي. افتح الرابط خارج الوضع الخاص واسمح ببيانات الموقع": [
    "Black files 752",
    "Dossiers noirs 752",
  ],
  "تعذر الوصول للتخزين المحلي. افتح الرابط خارج الوضع الخاص واسمح ببيانات الموقع.": [
    "Black files 753",
    "Dossiers noirs 753",
  ],
  "تعذر جلب الحفظة من السحابة": [
    "Black files 754",
    "Dossiers noirs 754",
  ],
  "تعذر جلب الحفظة من السحابة.": [
    "Black files 755",
    "Dossiers noirs 755",
  ],
  "تعذر جلب سجل الحفظات": [
    "Black files 756",
    "Dossiers noirs 756",
  ],
  "تعذر جلب سجل الحفظات.": [
    "Black files 757",
    "Dossiers noirs 757",
  ],
  "تعذر حذف الحفظة": [
    "Black files 758",
    "Dossiers noirs 758",
  ],
  "تعذر حذف الحفظة.": [
    "Black files 759",
    "Dossiers noirs 759",
  ],
  "تعذر فك واستعادة الحفظة السحابية": [
    "Black files 760",
    "Dossiers noirs 760",
  ],
  "تعذر فك واستعادة الحفظة السحابية.": [
    "Black files 761",
    "Dossiers noirs 761",
  ],
  "تغيرت ملكية اللاعب أو اعتزل؛ أعد التفاوض": [
    "Black files 762",
    "Dossiers noirs 762",
  ],
  "تغيرت ملكية اللاعب أو اعتزل؛ أعد التفاوض.": [
    "Black files 763",
    "Dossiers noirs 763",
  ],
  "تفاوض": [
    "Black files 764",
    "Dossiers noirs 764",
  ],
  "تفاوض على نصف الزيادة": [
    "Black files 765",
    "Dossiers noirs 765",
  ],
  "تفاوض نشط": [
    "Black files 766",
    "Dossiers noirs 766",
  ],
  "تفاوضت؛ الشبهات -5%": [
    "Black files 767",
    "Dossiers noirs 767",
  ],
  "تفاوضت؛ الشبهات -5%.": [
    "Black files 768",
    "Dossiers noirs 768",
  ],
  "تقدم اللائحة": [
    "Black files 769",
    "Dossiers noirs 769",
  ],
  "تقديم عرض": [
    "Black files 770",
    "Dossiers noirs 770",
  ],
  "تقليص ميزانية المرتبات {n}٪": [
    "Black files 771",
    "Dossiers noirs 771",
  ],
  "تكلفة عملية": [
    "Black files 772",
    "Dossiers noirs 772",
  ],
  "تم إرسال عرض الانتقال": [
    "Black files 773",
    "Dossiers noirs 773",
  ],
  "تم إنشاء الحساب وتسجيل الدخول بنجاح": [
    "Black files 774",
    "Dossiers noirs 774",
  ],
  "تم إنشاء الحساب وتسجيل الدخول بنجاح!": [
    "Black files 775",
    "Dossiers noirs 775",
  ],
  "تم إنهاء التفاوض بدون خصم أموال": [
    "Black files 776",
    "Dossiers noirs 776",
  ],
  "تم إنهاء التفاوض بدون خصم أموال.": [
    "Black files 777",
    "Dossiers noirs 777",
  ],
  "تم إنهاء عقد الأسطورة": [
    "Black files 778",
    "Dossiers noirs 778",
  ],
  "تم إنهاء عقد الأسطورة.": [
    "Black files 779",
    "Dossiers noirs 779",
  ],
  "تم إيداع": [
    "Black files 780",
    "Dossiers noirs 780",
  ],
  "تم إيداع التمويل وجدولة الأقساط": [
    "Black files 781",
    "Dossiers noirs 781",
  ],
  "تم إيداع التمويل وجدولة الأقساط.": [
    "Black files 782",
    "Dossiers noirs 782",
  ],
  "تم استرجاع ناديك من السحابة بنجاح": [
    "Black files 783",
    "Dossiers noirs 783",
  ],
  "تم استرجاع ناديك من السحابة بنجاح!": [
    "Black files 784",
    "Dossiers noirs 784",
  ],
  "تم استيراد الحفظة": [
    "Black files 785",
    "Dossiers noirs 785",
  ],
  "تم استيراد الحفظة.": [
    "Black files 786",
    "Dossiers noirs 786",
  ],
  "تم اعتماد أسعار الفئات والعلاوة للمباريات القادمة": [
    "Black files 787",
    "Dossiers noirs 787",
  ],
  "تم اعتماد أسعار الفئات والعلاوة للمباريات القادمة.": [
    "Black files 788",
    "Dossiers noirs 788",
  ],
  "تم اعتماد قرارات دفعة الناشئين بنجاح": [
    "Black files 789",
    "Dossiers noirs 789",
  ],
  "تم الاتفاق مع النادي. باقي عقد اللاعب": [
    "Black files 790",
    "Dossiers noirs 790",
  ],
  "تم الاتفاق مع النادي. باقي عقد اللاعب.": [
    "Black files 791",
    "Dossiers noirs 791",
  ],
  "تم الاحتفاظ بنتائج الموسم الحالي وقوائمه. نظام أوروبا الجديد يبدأ مع الموسم التالي؛ مواعيد الكؤوس المقبلة تراعي فاصل الراحة": [
    "Black files 792",
    "Dossiers noirs 792",
  ],
  "تم الاحتفاظ بنتائج الموسم الحالي وقوائمه. نظام أوروبا الجديد يبدأ مع الموسم التالي؛ مواعيد الكؤوس المقبلة تراعي فاصل الراحة.": [
    "Black files 793",
    "Dossiers noirs 793",
  ],
  "تم التبرع الخيري وخفض الشبهات": [
    "Black files 794",
    "Dossiers noirs 794",
  ],
  "تم التبرع الخيري وخفض الشبهات.": [
    "Black files 795",
    "Dossiers noirs 795",
  ],
  "تم تجديد عقد الأسطورة": [
    "Black files 796",
    "Dossiers noirs 796",
  ],
  "تم تجديد عقد الأسطورة.": [
    "Black files 797",
    "Dossiers noirs 797",
  ],
  "تم تجديد عقد المدرب": [
    "Black files 798",
    "Dossiers noirs 798",
  ],
  "تم تجديد عقد المدرب.": [
    "Black files 799",
    "Dossiers noirs 799",
  ],
  "تم تجهيز ملف الحفظ للتنزيل": [
    "Black files 800",
    "Dossiers noirs 800",
  ],
  "تم تجهيز ملف الحفظ للتنزيل.": [
    "Black files 801",
    "Dossiers noirs 801",
  ],
  "تم تحديث طاقم المنشأة": [
    "Black files 802",
    "Dossiers noirs 802",
  ],
  "تم تحديث طاقم المنشأة.": [
    "Black files 803",
    "Dossiers noirs 803",
  ],
  "تم تحويل المبالغ المعروضة إلى العملة المختارة": [
    "Black files 804",
    "Dossiers noirs 804",
  ],
  "تم تحويل المبالغ المعروضة إلى العملة المختارة.": [
    "Black files 805",
    "Dossiers noirs 805",
  ],
  "تم ترحيل الحفظة القديمة دون استبدال لاعبيها أو تغيير رصيدها. قاعدة الأسماء الحقيقية تحتاج حفظة جديدة": [
    "Black files 806",
    "Dossiers noirs 806",
  ],
  "تم ترحيل الحفظة القديمة دون استبدال لاعبيها أو تغيير رصيدها. قاعدة الأسماء الحقيقية تحتاج حفظة جديدة.": [
    "Black files 807",
    "Dossiers noirs 807",
  ],
  "تم تسجيل الخروج بنجاح": [
    "Black files 808",
    "Dossiers noirs 808",
  ],
  "تم تسجيل الخروج بنجاح.": [
    "Black files 809",
    "Dossiers noirs 809",
  ],
  "تم تسجيل الدخول بنجاح": [
    "Black files 810",
    "Dossiers noirs 810",
  ],
  "تم تسجيل الدخول بنجاح!": [
    "Black files 811",
    "Dossiers noirs 811",
  ],
  "تم تسجيل قرارك": [
    "Black files 812",
    "Dossiers noirs 812",
  ],
  "تم تسجيل قرارك.": [
    "Black files 813",
    "Dossiers noirs 813",
  ],
  "تم تعليم كل الرسائل كمقروءة. القرارات المطلوبة ما زالت نشطة": [
    "Black files 814",
    "Dossiers noirs 814",
  ],
  "تم تعليم كل الرسائل كمقروءة. القرارات المطلوبة ما زالت نشطة.": [
    "Black files 815",
    "Dossiers noirs 815",
  ],
  "تم تعيين المدرب الجديد": [
    "Black files 816",
    "Dossiers noirs 816",
  ],
  "تم تعيين المدرب الجديد.": [
    "Black files 817",
    "Dossiers noirs 817",
  ],
  "تم تنفيذ العملية عبر الوسيط": [
    "Black files 818",
    "Dossiers noirs 818",
  ],
  "تم تنفيذ العملية عبر الوسيط.": [
    "Black files 819",
    "Dossiers noirs 819",
  ],
  "تم تنفيذ قرار الإدارة": [
    "Black files 820",
    "Dossiers noirs 820",
  ],
  "تم توقيع الرعاية بالقيمة المتفاوض عليها وإيداع المقدم": [
    "Black files 821",
    "Dossiers noirs 821",
  ],
  "تم توقيع الرعاية بالقيمة المتفاوض عليها وإيداع المقدم.": [
    "Black files 822",
    "Dossiers noirs 822",
  ],
  "تم توقيع الرعاية وإيداع المقدم في الخزينة": [
    "Black files 823",
    "Dossiers noirs 823",
  ],
  "تم توقيع الرعاية وإيداع المقدم في الخزينة.": [
    "Black files 824",
    "Dossiers noirs 824",
  ],
  "تم توقيع العقد وتحديث السجل المالي": [
    "Black files 825",
    "Dossiers noirs 825",
  ],
  "تم توقيع العقد وتحديث السجل المالي.": [
    "Black files 826",
    "Dossiers noirs 826",
  ],
  "تم توقيع عقد الأسطورة": [
    "Black files 827",
    "Dossiers noirs 827",
  ],
  "تم توقيع عقد الأسطورة.": [
    "Black files 828",
    "Dossiers noirs 828",
  ],
  "تم حذف النسخة السحابية": [
    "Black files 829",
    "Dossiers noirs 829",
  ],
  "تم حذف النسخة السحابية.": [
    "Black files 830",
    "Dossiers noirs 830",
  ],
  "تم حفظ إعداد العرض": [
    "Black files 831",
    "Dossiers noirs 831",
  ],
  "تم حفظ إعداد العرض.": [
    "Black files 832",
    "Dossiers noirs 832",
  ],
  "تم حفظ إعداد المحاكاة": [
    "Black files 833",
    "Dossiers noirs 833",
  ],
  "تم حفظ إعداد المحاكاة.": [
    "Black files 834",
    "Dossiers noirs 834",
  ],
  "تم حفظ إعداد وضع الأساطير": [
    "Black files 835",
    "Dossiers noirs 835",
  ],
  "تم حفظ إعداد وضع الأساطير.": [
    "Black files 836",
    "Dossiers noirs 836",
  ],
  "تم حفظ الإعداد": [
    "Black files 837",
    "Dossiers noirs 837",
  ],
  "تم حفظ الإعداد.": [
    "Black files 838",
    "Dossiers noirs 838",
  ],
  "تم حفظ الخانة بمعزل عن الحفظة النشطة": [
    "Black files 839",
    "Dossiers noirs 839",
  ],
  "تم حفظ الخانة بمعزل عن الحفظة النشطة.": [
    "Black files 840",
    "Dossiers noirs 840",
  ],
  "تم حفظ نمط الأرقام": [
    "Black files 841",
    "Dossiers noirs 841",
  ],
  "تم حفظ نمط الأرقام.": [
    "Black files 842",
    "Dossiers noirs 842",
  ],
  "تم رفض العرض العاجل": [
    "Black files 843",
    "Dossiers noirs 843",
  ],
  "تم قطع الوسطاء": [
    "Black files 844",
    "Dossiers noirs 844",
  ],
  "تم قطع الوسطاء.": [
    "Black files 845",
    "Dossiers noirs 845",
  ],
  "تم كسر الشرط الجزائي — التفاوض مع اللاعب مباشرة": [
    "Black files 846",
    "Dossiers noirs 846",
  ],
  "تم كسر الشرط الجزائي — التفاوض مع اللاعب مباشرة.": [
    "Black files 847",
    "Dossiers noirs 847",
  ],
  "تم نسخ البريد الإلكتروني": [
    "Black files 848",
    "Dossiers noirs 848",
  ],
  "تم نسخ البريد الإلكتروني.": [
    "Black files 849",
    "Dossiers noirs 849",
  ],
  "تمت المزامنة السحابية بنجاح": [
    "Black files 850",
    "Dossiers noirs 850",
  ],
  "تمت المزامنة السحابية بنجاح!": [
    "Black files 851",
    "Dossiers noirs 851",
  ],
  "تمت الموافقة على بيع اللاعب في اللحظات الأخيرة": [
    "Black files 852",
    "Dossiers noirs 852",
  ],
  "تنفيذ كامل": [
    "Black files 853",
    "Dossiers noirs 853",
  ],
  "تهديد بكشف تعاونه السابق": [
    "Black files 854",
    "Dossiers noirs 854",
  ],
  "تهديد قانوني مضاد": [
    "Black files 855",
    "Dossiers noirs 855",
  ],
  "توقفت المحاكاة بعد المباراة. النتيجة في بريدك": [
    "Black files 856",
    "Dossiers noirs 856",
  ],
  "توقفت المحاكاة بعد المباراة. النتيجة في بريدك.": [
    "Black files 857",
    "Dossiers noirs 857",
  ],
  "توقيع التجديد": [
    "Black files 858",
    "Dossiers noirs 858",
  ],
  "توقيع وإتمام الصفقة": [
    "Black files 859",
    "Dossiers noirs 859",
  ],
  "ثقة الجمعية": [
    "Black files 860",
    "Dossiers noirs 860",
  ],
  "ثلاثة محاور تُقاس طوال الموسم، والتصويت في النهاية": [
    "Black files 861",
    "Dossiers noirs 861",
  ],
  "جارٍ الحفظ": [
    "Black files 862",
    "Dossiers noirs 862",
  ],
  "جارٍ الحفظ…": [
    "Black files 863",
    "Dossiers noirs 863",
  ],
  "جارٍ تنزيل واسترجاع الحفظة": [
    "Black files 864",
    "Dossiers noirs 864",
  ],
  "جارٍ تنزيل واسترجاع الحفظة…": [
    "Black files 865",
    "Dossiers noirs 865",
  ],
  "جارٍ جلب سجل الحفظات": [
    "Black files 866",
    "Dossiers noirs 866",
  ],
  "جارٍ جلب سجل الحفظات…": [
    "Black files 867",
    "Dossiers noirs 867",
  ],
  "جارٍ حفظ القرار": [
    "Black files 868",
    "Dossiers noirs 868",
  ],
  "جارٍ حفظ القرار…": [
    "Black files 869",
    "Dossiers noirs 869",
  ],
  "جارٍ رفع الحفظة إلى السحابة": [
    "Black files 870",
    "Dossiers noirs 870",
  ],
  "جارٍ رفع الحفظة إلى السحابة…": [
    "Black files 871",
    "Dossiers noirs 871",
  ],
  "جارٍ فحص الحفظات على السحابة": [
    "Black files 872",
    "Dossiers noirs 872",
  ],
  "جارٍ فحص الحفظات على السحابة…": [
    "Black files 873",
    "Dossiers noirs 873",
  ],
  "جدول الالتزامات غير سليم": [
    "Black files 874",
    "Dossiers noirs 874",
  ],
  "جدول الالتزامات غير سليم.": [
    "Black files 875",
    "Dossiers noirs 875",
  ],
  "جدول الترتيب غير سليم": [
    "Black files 876",
    "Dossiers noirs 876",
  ],
  "جدول الترتيب غير سليم.": [
    "Black files 877",
    "Dossiers noirs 877",
  ],
  "جدول المباريات غير سليم": [
    "Black files 878",
    "Dossiers noirs 878",
  ],
  "جدول المباريات غير سليم.": [
    "Black files 879",
    "Dossiers noirs 879",
  ],
  "جرّب اسمًا آخر أو غيّر الفلاتر": [
    "Black files 880",
    "Dossiers noirs 880",
  ],
  "جرّب اسمًا آخر أو غيّر الفلاتر.": [
    "Black files 881",
    "Dossiers noirs 881",
  ],
  "جزء من جماهيرك هتف بسخرية عن التحكيم بعد قرار مثير للجدل لصالحكم": [
    "Black files 882",
    "Dossiers noirs 882",
  ],
  "جزء من جماهيرك هتف بسخرية عن التحكيم بعد قرار مثير للجدل لصالحكم.": [
    "Black files 883",
    "Dossiers noirs 883",
  ],
  "جماهيرك رفعت لافتة كبيرة: نريد الفوز نظيفًا": [
    "Black files 884",
    "Dossiers noirs 884",
  ],
  "جماهيرك رفعت لافتة كبيرة: نريد الفوز نظيفًا.": [
    "Black files 885",
    "Dossiers noirs 885",
  ],
  "حالة الجمعية العمومية غير سليمة": [
    "Black files 886",
    "Dossiers noirs 886",
  ],
  "حالة المحاكاة غير سليمة": [
    "Black files 887",
    "Dossiers noirs 887",
  ],
  "حالة المحاكاة غير سليمة.": [
    "Black files 888",
    "Dossiers noirs 888",
  ],
  "حالة المسيرة غير صالحة": [
    "Black files 889",
    "Dossiers noirs 889",
  ],
  "حالة المسيرة غير صالحة.": [
    "Black files 890",
    "Dossiers noirs 890",
  ],
  "حالة الملفات السوداء غير سليمة": [
    "Black files 891",
    "Dossiers noirs 891",
  ],
  "حالة الملفات السوداء غير سليمة.": [
    "Black files 892",
    "Dossiers noirs 892",
  ],
  "حالة وكيل المرتب غير سليمة": [
    "Black files 893",
    "Dossiers noirs 893",
  ],
  "حالة وكيل المرتب غير سليمة.": [
    "Black files 894",
    "Dossiers noirs 894",
  ],
  "حجم النادي": [
    "Black files 895",
    "Dossiers noirs 895",
  ],
  "حد قائمة غير صالح": [
    "Black files 896",
    "Dossiers noirs 896",
  ],
  "حد قائمة غير صالح.": [
    "Black files 897",
    "Dossiers noirs 897",
  ],
  "حذف": [
    "Black files 898",
    "Dossiers noirs 898",
  ],
  "حراسة المرمى": [
    "Black files 899",
    "Dossiers noirs 899",
  ],
  "حرب إعلامية": [
    "Black files 900",
    "Dossiers noirs 900",
  ],
  "حرب إعلامية تؤتي أثرها ضد منافس": [
    "Black files 901",
    "Dossiers noirs 901",
  ],
  "حرب إعلامية ملفقة ضد منافس": [
    "Black files 902",
    "Dossiers noirs 902",
  ],
  "حركات مالية مكررة": [
    "Black files 903",
    "Dossiers noirs 903",
  ],
  "حركات مالية مكررة.": [
    "Black files 904",
    "Dossiers noirs 904",
  ],
  "حسنًا": [
    "Black files 905",
    "Dossiers noirs 905",
  ],
  "حفظت 0.6 فرقك ومجموعاتك ونتائجك القديمة؛ عضوية مصر الجديدة تحتاج مشوارًا جديدًا. سوق الحفظ القديم يبقى مفتوحًا والخطة الموضعية اختيارية": [
    "Black files 906",
    "Dossiers noirs 906",
  ],
  "حفظت 0.6 فرقك ومجموعاتك ونتائجك القديمة؛ عضوية مصر الجديدة تحتاج مشوارًا جديدًا. سوق الحفظ القديم يبقى مفتوحًا والخطة الموضعية اختيارية.": [
    "Black files 907",
    "Dossiers noirs 907",
  ],
  "حكم يتجنب الكاميرات": [
    "Black files 908",
    "Dossiers noirs 908",
  ],
  "حكم يتجنب المصافحة بعد مباراة متحيزة": [
    "Black files 909",
    "Dossiers noirs 909",
  ],
  "حولت العقد؛ الشبهات -8%": [
    "Black files 910",
    "Dossiers noirs 910",
  ],
  "حولت العقد؛ الشبهات -8%.": [
    "Black files 911",
    "Dossiers noirs 911",
  ],
  "حُذفت الخانة": [
    "Black files 912",
    "Dossiers noirs 912",
  ],
  "حُذفت الخانة.": [
    "Black files 913",
    "Dossiers noirs 913",
  ],
  "خزنة المالك السرية 🤫": [
    "Black files 914",
    "Dossiers noirs 914",
  ],
  "خسرت المال وارتفعت الشبهات بلا فائدة. الوسيط يطلب الصمت": [
    "Black files 915",
    "Dossiers noirs 915",
  ],
  "خسرت المال وارتفعت الشبهات بلا فائدة. الوسيط يطلب الصمت.": [
    "Black files 916",
    "Dossiers noirs 916",
  ],
  "خطة إعادة البناء": [
    "Black files 917",
    "Dossiers noirs 917",
  ],
  "خطف لاعب": [
    "Black files 918",
    "Dossiers noirs 918",
  ],
  "خطف لاعب متعاقد بدون إذن": [
    "Black files 919",
    "Dossiers noirs 919",
  ],
  "دعم المستثمرين": [
    "Black files 920",
    "Dossiers noirs 920",
  ],
  "دفع إضافي لإعادته": [
    "Black files 921",
    "Dossiers noirs 921",
  ],
  "دفع الزيادة والاستمرار": [
    "Black files 922",
    "Dossiers noirs 922",
  ],
  "دفع لإسكات الصحفي (قذر": [
    "Black files 923",
    "Dossiers noirs 923",
  ],
  "دفع لإسكات الصحفي (قذر)": [
    "Black files 924",
    "Dossiers noirs 924",
  ],
  "دفع مقابل الصمت": [
    "Black files 925",
    "Dossiers noirs 925",
  ],
  "دفعة في حب الجماهير +{n}": [
    "Black files 926",
    "Dossiers noirs 926",
  ],
  "دفعت الزيادة؛ الشبكة مستمرة والشبهات مستقرة": [
    "Black files 927",
    "Dossiers noirs 927",
  ],
  "دفعت الزيادة؛ الشبكة مستمرة والشبهات مستقرة.": [
    "Black files 928",
    "Dossiers noirs 928",
  ],
  "دفعت لإسكاته؛ الشبهات انخفضت مؤقتًا 8% لكن العملية قذرة +7% heat": [
    "Black files 929",
    "Dossiers noirs 929",
  ],
  "دفعت لإسكاته؛ الشبهات انخفضت مؤقتًا 8% لكن العملية قذرة +7% heat.": [
    "Black files 930",
    "Dossiers noirs 930",
  ],
  "دفعت مكافأة؛ الشبهات -4%": [
    "Black files 931",
    "Dossiers noirs 931",
  ],
  "دفعت مكافأة؛ الشبهات -4%.": [
    "Black files 932",
    "Dossiers noirs 932",
  ],
  "دفعت؛ التحيز استمر أسبوعًا إضافيًا": [
    "Black files 933",
    "Dossiers noirs 933",
  ],
  "دفعت؛ التحيز استمر أسبوعًا إضافيًا.": [
    "Black files 934",
    "Dossiers noirs 934",
  ],
  "دفعت؛ الشبهات انخفضت 10% مؤقتًا": [
    "Black files 935",
    "Dossiers noirs 935",
  ],
  "دفعت؛ الشبهات انخفضت 10% مؤقتًا.": [
    "Black files 936",
    "Dossiers noirs 936",
  ],
  "رئيس نادٍ منافس اتهمك علنًا بالتحيز التحكيمي في مؤتمر صحفي. الرد الهادئ يحفظ الصورة، الهجوم المضاد يشعل حربًا، والصمت يترك الاتهام ينتشر": [
    "Black files 937",
    "Dossiers noirs 937",
  ],
  "رئيس نادٍ منافس اتهمك علنًا بالتحيز التحكيمي في مؤتمر صحفي. الرد الهادئ يحفظ الصورة، الهجوم المضاد يشعل حربًا، والصمت يترك الاتهام ينتشر.": [
    "Black files 938",
    "Dossiers noirs 938",
  ],
  "راتب وكيل على المرتب": [
    "Black files 939",
    "Dossiers noirs 939",
  ],
  "راجع التمويل، ثم عُد للبريد لتأكيد التعامل مع تنبيه السيولة": [
    "Black files 940",
    "Dossiers noirs 940",
  ],
  "راجع التمويل، ثم عُد للبريد لتأكيد التعامل مع تنبيه السيولة.": [
    "Black files 941",
    "Dossiers noirs 941",
  ],
  "راجع اللائحة": [
    "Black files 942",
    "Dossiers noirs 942",
  ],
  "راجع قيمة العرض ونسبة المقدم": [
    "Black files 943",
    "Dossiers noirs 943",
  ],
  "راجع قيمة العرض ونسبة المقدم.": [
    "Black files 944",
    "Dossiers noirs 944",
  ],
  "راعٍ قلق يطلب اجتماعًا": [
    "Black files 945",
    "Dossiers noirs 945",
  ],
  "راعٍ قلق يطلب توضيحًا عن التسريبات": [
    "Black files 946",
    "Dossiers noirs 946",
  ],
  "راعٍ يجتمع بلجنة النزاهة": [
    "Black files 947",
    "Dossiers noirs 947",
  ],
  "راعٍ يجتمع بلجنة النزاهة؟": [
    "Black files 948",
    "Dossiers noirs 948",
  ],
  "راعٍ يراقب بصمت": [
    "Black files 949",
    "Dossiers noirs 949",
  ],
  "راعٍ ينظر بريبة لتقارير الشبهات": [
    "Black files 950",
    "Dossiers noirs 950",
  ],
  "رد هادئ ونفي قاطع": [
    "Black files 951",
    "Dossiers noirs 951",
  ],
  "رسائل البريد غير سليمة": [
    "Black files 952",
    "Dossiers noirs 952",
  ],
  "رسائل البريد غير سليمة.": [
    "Black files 953",
    "Dossiers noirs 953",
  ],
  "رسالة ثقة": [
    "Black files 954",
    "Dossiers noirs 954",
  ],
  "رسوم الانتقال والمرتب والمكافأة والوكيل": [
    "Black files 955",
    "Dossiers noirs 955",
  ],
  "رشوة لاعب خصم": [
    "Black files 956",
    "Dossiers noirs 956",
  ],
  "رشوة لاعب خصم قبل المواجهة": [
    "Black files 957",
    "Dossiers noirs 957",
  ],
  "رشوة لاعب خصم نشطة ضد {v} حتى {d}": [
    "Black files 958",
    "Dossiers noirs 958",
  ],
  "رفض العرض": [
    "Black files 959",
    "Dossiers noirs 959",
  ],
  "رفض المقابلة وإغلاق الباب": [
    "Black files 960",
    "Dossiers noirs 960",
  ],
  "رفضت؛ السمعة ارتفعت قليلًا": [
    "Black files 961",
    "Dossiers noirs 961",
  ],
  "رفضت؛ السمعة ارتفعت قليلًا.": [
    "Black files 962",
    "Dossiers noirs 962",
  ],
  "زيادة ميزانية التعاقدات {n}٪ للموسم القادم": [
    "Black files 963",
    "Dossiers noirs 963",
  ],
  "ستحصل على عائد لاحق لكن الجماهير تشك": [
    "Black files 964",
    "Dossiers noirs 964",
  ],
  "ستحصل على عائد لاحق لكن الجماهير تشك.": [
    "Black files 965",
    "Dossiers noirs 965",
  ],
  "سجل اجتماعات الجمعية العمومية غير سليم": [
    "Black files 966",
    "Dossiers noirs 966",
  ],
  "سجل الاجتماعات": [
    "Black files 967",
    "Dossiers noirs 967",
  ],
  "سجل الملفات السوداء غير سليم": [
    "Black files 968",
    "Dossiers noirs 968",
  ],
  "سجل الملفات السوداء غير سليم.": [
    "Black files 969",
    "Dossiers noirs 969",
  ],
  "سجل المواسم": [
    "Black files 970",
    "Dossiers noirs 970",
  ],
  "سجل لائحة الجمعية العمومية غير سليم": [
    "Black files 971",
    "Dossiers noirs 971",
  ],
  "سلم القيمة حسب التقييم": [
    "Black files 972",
    "Dossiers noirs 972",
  ],
  "سنة": [
    "Black files 973",
    "Dossiers noirs 973",
  ],
  "سنوات": [
    "Black files 974",
    "Dossiers noirs 974",
  ],
  "سوق الانتقالات": [
    "Black files 975",
    "Dossiers noirs 975",
  ],
  "سيُحذف من هذا المتصفح نهائيًا: الحفظة النشطة، كل خانات الحفظ، والنسخ الاحتياطية. لا يمكن التراجع عن هذه الخطوة": [
    "Black files 976",
    "Dossiers noirs 976",
  ],
  "سيُحذف من هذا المتصفح نهائيًا: الحفظة النشطة، كل خانات الحفظ، والنسخ الاحتياطية. لا يمكن التراجع عن هذه الخطوة.": [
    "Black files 977",
    "Dossiers noirs 977",
  ],
  "شائعة اجتماع راعٍ مع لجنة النزاهة": [
    "Black files 978",
    "Dossiers noirs 978",
  ],
  "شائعة رشوة في غرفة الملابس": [
    "Black files 979",
    "Dossiers noirs 979",
  ],
  "شائعة عن اجتماع بين راعيك ولجنة النزاهة لمراجعة بنود الأخلاقيات في العقد": [
    "Black files 980",
    "Dossiers noirs 980",
  ],
  "شائعة عن اجتماع بين راعيك ولجنة النزاهة لمراجعة بنود الأخلاقيات في العقد.": [
    "Black files 981",
    "Dossiers noirs 981",
  ],
  "شائعة فشل رشوة": [
    "Black files 982",
    "Dossiers noirs 982",
  ],
  "شائعة فشل رشوة لاعب خصم": [
    "Black files 983",
    "Dossiers noirs 983",
  ],
  "شائعة في غرفة الملابس": [
    "Black files 984",
    "Dossiers noirs 984",
  ],
  "شخص مجهول يتصل ويعرض شبكة تحكيم وإعلام جاهزة مقابل مبلغ مقدم. القبول يفتح باب العمليات القذرة، الرفض يحافظ على النظافة، والتبليغ يخفض الشبهات": [
    "Black files 985",
    "Dossiers noirs 985",
  ],
  "شخص مجهول يتصل ويعرض شبكة تحكيم وإعلام جاهزة مقابل مبلغ مقدم. القبول يفتح باب العمليات القذرة، الرفض يحافظ على النظافة، والتبليغ يخفض الشبهات.": [
    "Black files 986",
    "Dossiers noirs 986",
  ],
  "شراء التسجيل وحذفه": [
    "Black files 987",
    "Dossiers noirs 987",
  ],
  "شرط جزائي عالٍ = راتب أعلى مطلوب": [
    "Black files 988",
    "Dossiers noirs 988",
  ],
  "شرط عادي": [
    "Black files 989",
    "Dossiers noirs 989",
  ],
  "شرط عالٍ": [
    "Black files 990",
    "Dossiers noirs 990",
  ],
  "شرط عالٍ جدًا": [
    "Black files 991",
    "Dossiers noirs 991",
  ],
  "شرط قليل": [
    "Black files 992",
    "Dossiers noirs 992",
  ],
  "شرط قليل = راتب أقل لكن قابل للخطف": [
    "Black files 993",
    "Dossiers noirs 993",
  ],
  "شروط العقد غير صالحة": [
    "Black files 994",
    "Dossiers noirs 994",
  ],
  "شروط العقد غير صالحة.": [
    "Black files 995",
    "Dossiers noirs 995",
  ],
  "شروط غير صالحة": [
    "Black files 996",
    "Dossiers noirs 996",
  ],
  "شروط غير صالحة.": [
    "Black files 997",
    "Dossiers noirs 997",
  ],
  "شوهد الوكيل الذي على مرتبك يدخل مكتب التعاقدات صباحًا بلا موعد معلن": [
    "Black files 998",
    "Dossiers noirs 998",
  ],
  "شوهد الوكيل الذي على مرتبك يدخل مكتب التعاقدات صباحًا بلا موعد معلن.": [
    "Black files 999",
    "Dossiers noirs 999",
  ],
  "صحفي استقصائي ألغى حضوره لمباراتكم وكتب أنه يفضل متابعة الملفات بدل الملعب": [
    "Black files 1000",
    "Dossiers noirs 1000",
  ],
  "صحفي استقصائي ألغى حضوره لمباراتكم وكتب أنه يفضل متابعة الملفات بدل الملعب.": [
    "Black files 1001",
    "Dossiers noirs 1001",
  ],
  "صحفي استقصائي على الباب": [
    "Black files 1002",
    "Dossiers noirs 1002",
  ],
  "صحفي استقصائي يطلب مقابلة عن الوسيط": [
    "Black files 1003",
    "Dossiers noirs 1003",
  ],
  "صحفي استقصائي يلغي دعوة لتغطية مباراتكم": [
    "Black files 1004",
    "Dossiers noirs 1004",
  ],
  "صحفي معروف بتقاريره عن الفساد يطلب مقابلة حول علاقتك بوسيط معروف. الموافقة قد تكشف جزءًا من الملفات، الرفض يزيد الشبهات، والدفع لإسكاته مكلف وقذر": [
    "Black files 1005",
    "Dossiers noirs 1005",
  ],
  "صحفي معروف بتقاريره عن الفساد يطلب مقابلة حول علاقتك بوسيط معروف. الموافقة قد تكشف جزءًا من الملفات، الرفض يزيد الشبهات، والدفع لإسكاته مكلف وقذر.": [
    "Black files 1006",
    "Dossiers noirs 1006",
  ],
  "صحفي يلغي الحضور": [
    "Black files 1007",
    "Dossiers noirs 1007",
  ],
  "صحفيون يتحدثون عن علاقات مشبوهة. لا تحقيق بعد، لكن العيون بدأت تراقب": [
    "Black files 1008",
    "Dossiers noirs 1008",
  ],
  "صحفيون يتحدثون عن علاقات مشبوهة. لا تحقيق بعد، لكن العيون بدأت تراقب.": [
    "Black files 1009",
    "Dossiers noirs 1009",
  ],
  "صمت وتجاهل الاتهام": [
    "Black files 1010",
    "Dossiers noirs 1010",
  ],
  "صيغة الحفظ غير مدعومة": [
    "Black files 1011",
    "Dossiers noirs 1011",
  ],
  "صيغة الحفظ غير مدعومة.": [
    "Black files 1012",
    "Dossiers noirs 1012",
  ],
  "صيغتا FIFA الجديدتان تبدآن بعد نهاية الموسم الحالي؛ القرعات والنتائج القديمة باقية، وعدد الدرجات والصعود لم يتغيرا": [
    "Black files 1013",
    "Dossiers noirs 1013",
  ],
  "صيغتا FIFA الجديدتان تبدآن بعد نهاية الموسم الحالي؛ القرعات والنتائج القديمة باقية، وعدد الدرجات والصعود لم يتغيرا.": [
    "Black files 1014",
    "Dossiers noirs 1014",
  ],
  "ضبط تقديري للاعب معروف": [
    "Black files 1015",
    "Dossiers noirs 1015",
  ],
  "ضربة جزاء مشكوك فيها / إلغاء هدف للخصم / تساهل في البطاقات — لمباراة واحدة فقط": [
    "Black files 1016",
    "Dossiers noirs 1016",
  ],
  "طمأنة الراعي باجتماع مغلق": [
    "Black files 1017",
    "Dossiers noirs 1017",
  ],
  "طمأنت الراعي؛ بقي العقد": [
    "Black files 1018",
    "Dossiers noirs 1018",
  ],
  "طمأنت الراعي؛ بقي العقد.": [
    "Black files 1019",
    "Dossiers noirs 1019",
  ],
  "طموح الاستقرار": [
    "Black files 1020",
    "Dossiers noirs 1020",
  ],
  "طموح البقاء": [
    "Black files 1021",
    "Dossiers noirs 1021",
  ],
  "طموح القمة": [
    "Black files 1022",
    "Dossiers noirs 1022",
  ],
  "طموح المنافسة": [
    "Black files 1023",
    "Dossiers noirs 1023",
  ],
  "طموح الموسم": [
    "Black files 1024",
    "Dossiers noirs 1024",
  ],
  "عائد الحملة التجارية": [
    "Black files 1025",
    "Dossiers noirs 1025",
  ],
  "عدم تفجير أي فضيحة كبرى (الشبهات لا تصل 100%": [
    "Black files 1026",
    "Dossiers noirs 1026",
  ],
  "عدم تفجير أي فضيحة كبرى (الشبهات لا تصل 100%)": [
    "Black files 1027",
    "Dossiers noirs 1027",
  ],
  "عرضه للبيع سريعًا": [
    "Black files 1028",
    "Dossiers noirs 1028",
  ],
  "عقد": [
    "Black files 1029",
    "Dossiers noirs 1029",
  ],
  "عقد اللاعب المُعار يخص ناديه الأصلي": [
    "Black files 1030",
    "Dossiers noirs 1030",
  ],
  "عقد اللاعب المُعار يخص ناديه الأصلي.": [
    "Black files 1031",
    "Dossiers noirs 1031",
  ],
  "عقد الوكيل الذي على مرتبك تسرب للإعلام. الصحافة تسأل عن سبب وجوده. الإبقاء، القطع، أو تحويله لعقد استشاري": [
    "Black files 1032",
    "Dossiers noirs 1032",
  ],
  "عقد الوكيل الذي على مرتبك تسرب للإعلام. الصحافة تسأل عن سبب وجوده. الإبقاء، القطع، أو تحويله لعقد استشاري.": [
    "Black files 1033",
    "Dossiers noirs 1033",
  ],
  "عقد مهني غير سليم": [
    "Black files 1034",
    "Dossiers noirs 1034",
  ],
  "عقد مهني غير سليم.": [
    "Black files 1035",
    "Dossiers noirs 1035",
  ],
  "عقوبة سمعة دائمة": [
    "Black files 1036",
    "Dossiers noirs 1036",
  ],
  "عقود الرعاية غير سليمة": [
    "Black files 1037",
    "Dossiers noirs 1037",
  ],
  "عقود الرعاية غير سليمة.": [
    "Black files 1038",
    "Dossiers noirs 1038",
  ],
  "علاقات التعاقدات غير سليمة": [
    "Black files 1039",
    "Dossiers noirs 1039",
  ],
  "علاقات التعاقدات غير سليمة.": [
    "Black files 1040",
    "Dossiers noirs 1040",
  ],
  "عمر مرجعي فقط؛ يوم الميلاد غير موثق": [
    "Black files 1041",
    "Dossiers noirs 1041",
  ],
  "عمر مرجعي فقط؛ يوم الميلاد غير موثق.": [
    "Black files 1042",
    "Dossiers noirs 1042",
  ],
  "عملية غير موجودة": [
    "Black files 1043",
    "Dossiers noirs 1043",
  ],
  "عملية غير موجودة.": [
    "Black files 1044",
    "Dossiers noirs 1044",
  ],
  "عمولات أرخص (1% بدل 3%) مقابل heat مستمر صغير": [
    "Black files 1045",
    "Dossiers noirs 1045",
  ],
  "عمولات أرخص تثير التساؤل": [
    "Black files 1046",
    "Dossiers noirs 1046",
  ],
  "عواقب الملعب 0.24: إصابات أثناء المباريات، وإنذارات متراكمة تؤدي للإيقاف، وفورمة اللاعب تؤثر على الأداء؛ النتائج والعقود والمالية محفوظة كما هي": [
    "Black files 1047",
    "Dossiers noirs 1047",
  ],
  "عواقب الملعب 0.24: إصابات أثناء المباريات، وإنذارات متراكمة تؤدي للإيقاف، وفورمة اللاعب تؤثر على الأداء؛ النتائج والعقود والمالية محفوظة كما هي.": [
    "Black files 1048",
    "Dossiers noirs 1048",
  ],
  "غرامة الفضيحة الكبرى": [
    "Black files 1049",
    "Dossiers noirs 1049",
  ],
  "غرامة كشف خطف لاعب": [
    "Black files 1050",
    "Dossiers noirs 1050",
  ],
  "فاصل أدنى: {n} يومًا": [
    "Black files 1051",
    "Dossiers noirs 1051",
  ],
  "فتحت الملفات السوداء؛ الشبهات +10%": [
    "Black files 1052",
    "Dossiers noirs 1052",
  ],
  "فتحت الملفات السوداء؛ الشبهات +10%.": [
    "Black files 1053",
    "Dossiers noirs 1053",
  ],
  "فخر جماهيري بنظافة النادي": [
    "Black files 1054",
    "Dossiers noirs 1054",
  ],
  "فشلت العملية": [
    "Black files 1055",
    "Dossiers noirs 1055",
  ],
  "فضيحة مسجلة هذا الموسم": [
    "Black files 1056",
    "Dossiers noirs 1056",
  ],
  "في انتظار رد النادي": [
    "Black files 1057",
    "Dossiers noirs 1057",
  ],
  "في خزينة النادي 🤫": [
    "Black files 1058",
    "Dossiers noirs 1058",
  ],
  "قائمة الأحداث غير سليمة": [
    "Black files 1059",
    "Dossiers noirs 1059",
  ],
  "قائمة الأحداث غير سليمة.": [
    "Black files 1060",
    "Dossiers noirs 1060",
  ],
  "قائمة الفريق ممتلئة؛ راجع الحد الموضح في شاشة الفريق": [
    "Black files 1061",
    "Dossiers noirs 1061",
  ],
  "قائمة الفريق ممتلئة؛ راجع الحد الموضح في شاشة الفريق.": [
    "Black files 1062",
    "Dossiers noirs 1062",
  ],
  "قبلت؛ الشبهات -5%": [
    "Black files 1063",
    "Dossiers noirs 1063",
  ],
  "قبلت؛ الشبهات -5%.": [
    "Black files 1064",
    "Dossiers noirs 1064",
  ],
  "قبول التوقف وإنهاء التحيز": [
    "Black files 1065",
    "Dossiers noirs 1065",
  ],
  "قبول العرض وفتح الملفات السوداء": [
    "Black files 1066",
    "Dossiers noirs 1066",
  ],
  "قدرات تقديرية للعبة وليست تقييمًا رسميًا": [
    "Black files 1067",
    "Dossiers noirs 1067",
  ],
  "قدرات تقديرية للعبة وليست تقييمًا رسميًا.": [
    "Black files 1068",
    "Dossiers noirs 1068",
  ],
  "قدمت كبش فداء؛ الشبهات -20% لكن الجماهير غاضبة": [
    "Black files 1069",
    "Dossiers noirs 1069",
  ],
  "قدمت كبش فداء؛ الشبهات -20% لكن الجماهير غاضبة.": [
    "Black files 1070",
    "Dossiers noirs 1070",
  ],
  "قدّمت جزءًا من الحقيقة؛ الصحفي نشر تقريرًا مخففًا": [
    "Black files 1071",
    "Dossiers noirs 1071",
  ],
  "قدّمت جزءًا من الحقيقة؛ الصحفي نشر تقريرًا مخففًا.": [
    "Black files 1072",
    "Dossiers noirs 1072",
  ],
  "قرار إداري": [
    "Black files 1073",
    "Dossiers noirs 1073",
  ],
  "قرار غير صالح": [
    "Black files 1074",
    "Dossiers noirs 1074",
  ],
  "قرار غير صالح.": [
    "Black files 1075",
    "Dossiers noirs 1075",
  ],
  "قطع العقد فورًا": [
    "Black files 1076",
    "Dossiers noirs 1076",
  ],
  "قطع الوسطاء": [
    "Black files 1077",
    "Dossiers noirs 1077",
  ],
  "قطع الوسطاء فورًا": [
    "Black files 1078",
    "Dossiers noirs 1078",
  ],
  "قطعت الوسطاء؛ الشبهات -15% لكن الوكيل على المرتب توقف": [
    "Black files 1079",
    "Dossiers noirs 1079",
  ],
  "قطعت الوسطاء؛ الشبهات -15% لكن الوكيل على المرتب توقف.": [
    "Black files 1080",
    "Dossiers noirs 1080",
  ],
  "قطعت؛ الشبهات -15%": [
    "Black files 1081",
    "Dossiers noirs 1081",
  ],
  "قطعت؛ الشبهات -15%.": [
    "Black files 1082",
    "Dossiers noirs 1082",
  ],
  "قلب مشروعك": [
    "Black files 1083",
    "Dossiers noirs 1083",
  ],
  "قوائم ٢٠٢٦/٢٧ — مراجعة أولية": [
    "Black files 1084",
    "Dossiers noirs 1084",
  ],
  "قيد التنفيذ": [
    "Black files 1085",
    "Dossiers noirs 1085",
  ],
  "قيود مالية غير صالحة": [
    "Black files 1086",
    "Dossiers noirs 1086",
  ],
  "قيود مالية غير صالحة.": [
    "Black files 1087",
    "Dossiers noirs 1087",
  ],
  "كؤوس 0.13 المحلية الكاملة تبدأ من الموسم الجديد؛ كؤوس الموسم الجاري ونتائجها محفوظة، وسوبر الأسواق الجديدة يُلعب بنتائج هذا الموسم عند اكتماله": [
    "Black files 1088",
    "Dossiers noirs 1088",
  ],
  "كؤوس 0.13 المحلية الكاملة تبدأ من الموسم الجديد؛ كؤوس الموسم الجاري ونتائجها محفوظة، وسوبر الأسواق الجديدة يُلعب بنتائج هذا الموسم عند اكتماله.": [
    "Black files 1089",
    "Dossiers noirs 1089",
  ],
  "كسر الشرط الجزائي": [
    "Black files 1090",
    "Dossiers noirs 1090",
  ],
  "كسر الشرط الجزائي الآن": [
    "Black files 1091",
    "Dossiers noirs 1091",
  ],
  "كشف الحساب لا يطابق الرصيد": [
    "Black files 1092",
    "Dossiers noirs 1092",
  ],
  "كشف الحساب لا يطابق الرصيد.": [
    "Black files 1093",
    "Dossiers noirs 1093",
  ],
  "كشف جزئي طوعي وتخفيض الضرر": [
    "Black files 1094",
    "Dossiers noirs 1094",
  ],
  "كل المراكز": [
    "Black files 1095",
    "Dossiers noirs 1095",
  ],
  "كل لاعب له دور. وكل عقد له أثر على مستقبل النادي": [
    "Black files 1096",
    "Dossiers noirs 1096",
  ],
  "كل لاعب له دور. وكل عقد له أثر على مستقبل النادي.": [
    "Black files 1097",
    "Dossiers noirs 1097",
  ],
  "كُسر الشرط الجزائي — {v} غادر": [
    "Black files 1098",
    "Dossiers noirs 1098",
  ],
  "لا تتوفر قوائم للبدء في هذا البلد": [
    "Black files 1099",
    "Dossiers noirs 1099",
  ],
  "لا تتوفر قوائم للبدء في هذا البلد.": [
    "Black files 1100",
    "Dossiers noirs 1100",
  ],
  "لا توجد لائحة نشطة": [
    "Black files 1101",
    "Dossiers noirs 1101",
  ],
  "لا توجد مسيرة نشطة حاليًا للمزامنة": [
    "Black files 1102",
    "Dossiers noirs 1102",
  ],
  "لا توجد مسيرة نشطة حاليًا للمزامنة.": [
    "Black files 1103",
    "Dossiers noirs 1103",
  ],
  "لا توجد نتائج": [
    "Black files 1104",
    "Dossiers noirs 1104",
  ],
  "لا فضائح — الحفاظ على نظافة الملفات": [
    "Black files 1105",
    "Dossiers noirs 1105",
  ],
  "لا يمكن كسر الشرط الجزائي": [
    "Black files 1106",
    "Dossiers noirs 1106",
  ],
  "لا يمكن كسر الشرط الجزائي.": [
    "Black files 1107",
    "Dossiers noirs 1107",
  ],
  "لا يوجد شرط جزائي — تفاوض عادي": [
    "Black files 1108",
    "Dossiers noirs 1108",
  ],
  "لا يوجد وسطاء لقطعهم": [
    "Black files 1109",
    "Dossiers noirs 1109",
  ],
  "لا يوجد وسطاء لقطعهم.": [
    "Black files 1110",
    "Dossiers noirs 1110",
  ],
  "لائحة الجمعية العمومية غير سليمة": [
    "Black files 1111",
    "Dossiers noirs 1111",
  ],
  "لائحة مطالب الموسم": [
    "Black files 1112",
    "Dossiers noirs 1112",
  ],
  "لاعب": [
    "Black files 1113",
    "Dossiers noirs 1113",
  ],
  "لاعب شاهد عملية قذرة": [
    "Black files 1114",
    "Dossiers noirs 1114",
  ],
  "لاعب شاهد ما لا يجب أن يراه": [
    "Black files 1115",
    "Dossiers noirs 1115",
  ],
  "لاعب غير متاح للخطف": [
    "Black files 1116",
    "Dossiers noirs 1116",
  ],
  "لاعب غير متاح للخطف.": [
    "Black files 1117",
    "Dossiers noirs 1117",
  ],
  "لاعب غير موجود": [
    "Black files 1118",
    "Dossiers noirs 1118",
  ],
  "لاعب غير موجود.": [
    "Black files 1119",
    "Dossiers noirs 1119",
  ],
  "لاعبون يتهامسون عن عرض غريب وصل لزميلهم قبل مباراة كبيرة": [
    "Black files 1120",
    "Dossiers noirs 1120",
  ],
  "لاعبون يتهامسون عن عرض غريب وصل لزميلهم قبل مباراة كبيرة.": [
    "Black files 1121",
    "Dossiers noirs 1121",
  ],
  "لاعبًا": [
    "Black files 1122",
    "Dossiers noirs 1122",
  ],
  "لافتات جماهيرية تطالب باللعب النظيف": [
    "Black files 1123",
    "Dossiers noirs 1123",
  ],
  "لافتة: نريدها نظيفة": [
    "Black files 1124",
    "Dossiers noirs 1124",
  ],
  "لجنة الحكام ألغت حصة تدريبية بعد جدل واسع عن قرارات جولة سابقة": [
    "Black files 1125",
    "Dossiers noirs 1125",
  ],
  "لجنة الحكام ألغت حصة تدريبية بعد جدل واسع عن قرارات جولة سابقة.": [
    "Black files 1126",
    "Dossiers noirs 1126",
  ],
  "لجنة النزاهة تطلب مستندات روتينية عن تعاقداتك الأخيرة. التعاون الكامل يخفض الشبهات، المماطلة ترفعها، وتقديم هدايا للجنة قذر ومكلف": [
    "Black files 1127",
    "Dossiers noirs 1127",
  ],
  "لجنة النزاهة تطلب مستندات روتينية عن تعاقداتك الأخيرة. التعاون الكامل يخفض الشبهات، المماطلة ترفعها، وتقديم هدايا للجنة قذر ومكلف.": [
    "Black files 1128",
    "Dossiers noirs 1128",
  ],
  "لغة غير مدعومة": [
    "Black files 1129",
    "Dossiers noirs 1129",
  ],
  "لغة غير مدعومة.": [
    "Black files 1130",
    "Dossiers noirs 1130",
  ],
  "لم يُصوَّت على لائحة بعد": [
    "Black files 1131",
    "Dossiers noirs 1131",
  ],
  "لم يُصوَّت على لائحة بعد.": [
    "Black files 1132",
    "Dossiers noirs 1132",
  ],
  "مؤشر الشبهات": [
    "Black files 1133",
    "Dossiers noirs 1133",
  ],
  "مؤشرات الجمعية العمومية غير سليمة": [
    "Black files 1134",
    "Dossiers noirs 1134",
  ],
  "مؤشرات النادي غير سليمة": [
    "Black files 1135",
    "Dossiers noirs 1135",
  ],
  "مؤشرات النادي غير سليمة.": [
    "Black files 1136",
    "Dossiers noirs 1136",
  ],
  "مانشستر سيتي": [
    "Black files 1137",
    "Dossiers noirs 1137",
  ],
  "مبلغ التبرع غير صالح": [
    "Black files 1138",
    "Dossiers noirs 1138",
  ],
  "مبلغ التبرع غير صالح.": [
    "Black files 1139",
    "Dossiers noirs 1139",
  ],
  "متأخر عن الإيقاع": [
    "Black files 1140",
    "Dossiers noirs 1140",
  ],
  "مجلس الإدارة والمستثمرين": [
    "Black files 1141",
    "Dossiers noirs 1141",
  ],
  "مجموعات من جماهيرك انقسمت بين مؤيد للفوز بأي ثمن ورافض للملفات السوداء": [
    "Black files 1142",
    "Dossiers noirs 1142",
  ],
  "مجموعات من جماهيرك انقسمت بين مؤيد للفوز بأي ثمن ورافض للملفات السوداء.": [
    "Black files 1143",
    "Dossiers noirs 1143",
  ],
  "محرك قدرات فردي": [
    "Black files 1144",
    "Dossiers noirs 1144",
  ],
  "مداورة": [
    "Black files 1145",
    "Dossiers noirs 1145",
  ],
  "مراجعة 0.14: جداول كونكاكاف الجديدة تتجنب ازدحام المباريات تلقائيًا، وجوائز البطولات أصبحت متدرجة حسب المستوى؛ نتائج الموسم الجاري محفوظة": [
    "Black files 1146",
    "Dossiers noirs 1146",
  ],
  "مراجعة 0.14: جداول كونكاكاف الجديدة تتجنب ازدحام المباريات تلقائيًا، وجوائز البطولات أصبحت متدرجة حسب المستوى؛ نتائج الموسم الجاري محفوظة.": [
    "Black files 1147",
    "Dossiers noirs 1147",
  ],
  "مراجعة المنتصف": [
    "Black files 1148",
    "Dossiers noirs 1148",
  ],
  "مراجعة منتصف الموسم: {d}": [
    "Black files 1149",
    "Dossiers noirs 1149",
  ],
  "مرجع اعتزال مفقود": [
    "Black files 1150",
    "Dossiers noirs 1150",
  ],
  "مرجع اعتزال مفقود.": [
    "Black files 1151",
    "Dossiers noirs 1151",
  ],
  "مرجع تفاوض مفقود في البريد": [
    "Black files 1152",
    "Dossiers noirs 1152",
  ],
  "مرجع تفاوض مفقود في البريد.": [
    "Black files 1153",
    "Dossiers noirs 1153",
  ],
  "مرجع قرار مفقود": [
    "Black files 1154",
    "Dossiers noirs 1154",
  ],
  "مرجع قرار مفقود.": [
    "Black files 1155",
    "Dossiers noirs 1155",
  ],
  "مرجع لاعب مفقود في البريد": [
    "Black files 1156",
    "Dossiers noirs 1156",
  ],
  "مرجع لاعب مفقود في البريد.": [
    "Black files 1157",
    "Dossiers noirs 1157",
  ],
  "مرجع موظف مفقود": [
    "Black files 1158",
    "Dossiers noirs 1158",
  ],
  "مرجع موظف مفقود.": [
    "Black files 1159",
    "Dossiers noirs 1159",
  ],
  "مسؤول تسويق الراعي حضر المباراة وجلس بعيدًا عن المنصة، دون تصريح": [
    "Black files 1160",
    "Dossiers noirs 1160",
  ],
  "مسؤول تسويق الراعي حضر المباراة وجلس بعيدًا عن المنصة، دون تصريح.": [
    "Black files 1161",
    "Dossiers noirs 1161",
  ],
  "مسؤول سابق في إدارة التعاقدات يملك تسجيلات عن الوسيط ويطلب مبلغًا مقابل الصمت. التسريب قد يفجر 15% شبهات إضافية": [
    "Black files 1162",
    "Dossiers noirs 1162",
  ],
  "مسؤول سابق في إدارة التعاقدات يملك تسجيلات عن الوسيط ويطلب مبلغًا مقابل الصمت. التسريب قد يفجر 15% شبهات إضافية.": [
    "Black files 1163",
    "Dossiers noirs 1163",
  ],
  "مسابقات موسمك الحالي ونتائجها محفوظة؛ أنظمة كؤوس 0.9 تبدأ بعد نهاية الموسم، دون تغيير درجاتك أو نظام صعودك": [
    "Black files 1164",
    "Dossiers noirs 1164",
  ],
  "مسابقات موسمك الحالي ونتائجها محفوظة؛ أنظمة كؤوس 0.9 تبدأ بعد نهاية الموسم، دون تغيير درجاتك أو نظام صعودك.": [
    "Black files 1165",
    "Dossiers noirs 1165",
  ],
  "مساحة رعاية محجوزة مرتين": [
    "Black files 1166",
    "Dossiers noirs 1166",
  ],
  "مساحة رعاية محجوزة مرتين.": [
    "Black files 1167",
    "Dossiers noirs 1167",
  ],
  "مستوى صعوبة غير صالح": [
    "Black files 1168",
    "Dossiers noirs 1168",
  ],
  "مستوى صعوبة غير صالح.": [
    "Black files 1169",
    "Dossiers noirs 1169",
  ],
  "مسح كل البيانات المحلية": [
    "Black files 1170",
    "Dossiers noirs 1170",
  ],
  "مسح كل البيانات المحلية؟": [
    "Black files 1171",
    "Dossiers noirs 1171",
  ],
  "مسح نهائي الآن": [
    "Black files 1172",
    "Dossiers noirs 1172",
  ],
  "مشروع للمستقبل": [
    "Black files 1173",
    "Dossiers noirs 1173",
  ],
  "مصدر الميلاد": [
    "Black files 1174",
    "Dossiers noirs 1174",
  ],
  "معامل ميزانية التعاقدات: {n}٪": [
    "Black files 1175",
    "Dossiers noirs 1175",
  ],
  "مكافآت المشاركة والأهداف تُصرف عند المباريات، والزيادة السنوية تُطبق تلقائيًا. وعد الأساسي يُراجع بعد ٦٠ يومًا. شرط جزائي عالٍ = راتب أعلى مطلوب، شرط قليل = راتب أقل لكن قابل للخطف. سلم القيم: <70 2-5M / 70-74 5-12M / 75-79 12-30M / 80-84 30-80M / 85+ 80-150M+ مع مضاعفات (u21 ×1.5، عقد 3+ ×1.3، إسباني ×2، <سنة ×0.5، >30 ×0.7، 25% بلا شرط": [
    "Black files 1176",
    "Dossiers noirs 1176",
  ],
  "مكافآت المشاركة والأهداف تُصرف عند المباريات، والزيادة السنوية تُطبق تلقائيًا. وعد الأساسي يُراجع بعد ٦٠ يومًا. شرط جزائي عالٍ = راتب أعلى مطلوب، شرط قليل = راتب أقل لكن قابل للخطف. سلم القيم: <70 2-5M / 70-74 5-12M / 75-79 12-30M / 80-84 30-80M / 85+ 80-150M+ مع مضاعفات (u21 ×1.5، عقد 3+ ×1.3، إسباني ×2، <سنة ×0.5، >30 ×0.7، 25% بلا شرط)": [
    "Black files 1177",
    "Dossiers noirs 1177",
  ],
  "مكافآت المشاركة والأهداف تُصرف عند المباريات، والزيادة السنوية تُطبق تلقائيًا. وعد الأساسي يُراجع بعد ٦٠ يومًا. شرط جزائي عالٍ = راتب أعلى مطلوب، شرط قليل = راتب أقل لكن قابل للخطف. سلم القيم: <70 2-5M / 70-74 5-12M / 75-79 12-30M / 80-84 30-80M / 85+ 80-150M+ مع مضاعفات (u21 ×1.5، عقد 3+ ×1.3، إسباني ×2، <سنة ×0.5، >30 ×0.7، 25% بلا شرط).": [
    "Black files 1178",
    "Dossiers noirs 1178",
  ],
  "مكافأة صمت كبيرة": [
    "Black files 1179",
    "Dossiers noirs 1179",
  ],
  "مكتب الوسيط": [
    "Black files 1180",
    "Dossiers noirs 1180",
  ],
  "ملف الحفظ أكبر من حدود النسخة": [
    "Black files 1181",
    "Dossiers noirs 1181",
  ],
  "ملف الحفظ أكبر من حدود النسخة.": [
    "Black files 1182",
    "Dossiers noirs 1182",
  ],
  "ملف الحفظ ناقص": [
    "Black files 1183",
    "Dossiers noirs 1183",
  ],
  "ملف الحفظ ناقص:": [
    "Black files 1184",
    "Dossiers noirs 1184",
  ],
  "ملف اللاعب": [
    "Black files 1185",
    "Dossiers noirs 1185",
  ],
  "ملفاتك السوداء": [
    "Black files 1186",
    "Dossiers noirs 1186",
  ],
  "مماطلة وتأجيل التسليم": [
    "Black files 1187",
    "Dossiers noirs 1187",
  ],
  "منافس يستعين بمحامٍ لمراجعة مباراتكم": [
    "Black files 1188",
    "Dossiers noirs 1188",
  ],
  "منافس يكلف محاميًا": [
    "Black files 1189",
    "Dossiers noirs 1189",
  ],
  "منح الناشئين {v} دقيقة لعب": [
    "Black files 1190",
    "Dossiers noirs 1190",
  ],
  "منع قيد سارٍ حتى {d} — لا عمليات انتقال قذرة": [
    "Black files 1191",
    "Dossiers noirs 1191",
  ],
  "منع قيد سارٍ — لا عمليات انتقال حتى ينتهي الحظر": [
    "Black files 1192",
    "Dossiers noirs 1192",
  ],
  "منع قيد سارٍ — لا عمليات انتقال حتى ينتهي الحظر.": [
    "Black files 1193",
    "Dossiers noirs 1193",
  ],
  "مهمة كشف غير سليمة": [
    "Black files 1194",
    "Dossiers noirs 1194",
  ],
  "مهمة كشف غير سليمة.": [
    "Black files 1195",
    "Dossiers noirs 1195",
  ],
  "موسم {n}": [
    "Black files 1196",
    "Dossiers noirs 1196",
  ],
  "موظف سابق يهدد بالكشف": [
    "Black files 1197",
    "Dossiers noirs 1197",
  ],
  "موظف سابق يهدد بكشف المستور": [
    "Black files 1198",
    "Dossiers noirs 1198",
  ],
  "موظفون في الاتحاد يتحدثون عن زيارات متكررة لوسيط معروف لمقر ناديك": [
    "Black files 1199",
    "Dossiers noirs 1199",
  ],
  "موظفون في الاتحاد يتحدثون عن زيارات متكررة لوسيط معروف لمقر ناديك.": [
    "Black files 1200",
    "Dossiers noirs 1200",
  ],
  "موعد الاعتزال المخطط": [
    "Black files 1201",
    "Dossiers noirs 1201",
  ],
  "موقع إحصائي أظهر أن ناديك حصل على 3 قرارات كبيرة متتالية لصالحه": [
    "Black files 1202",
    "Dossiers noirs 1202",
  ],
  "موقع إحصائي أظهر أن ناديك حصل على 3 قرارات كبيرة متتالية لصالحه.": [
    "Black files 1203",
    "Dossiers noirs 1203",
  ],
  "ميزانية المرتبات الحالية: {money}": [
    "Black files 1204",
    "Dossiers noirs 1204",
  ],
  "نادل مقهى قرب مقر الاتحاد قال إن الوسيط اجتمع مع شخصين لساعة": [
    "Black files 1205",
    "Dossiers noirs 1205",
  ],
  "نادل مقهى قرب مقر الاتحاد قال إن الوسيط اجتمع مع شخصين لساعة.": [
    "Black files 1206",
    "Dossiers noirs 1206",
  ],
  "نادي {v} دفع الشرط الجزائي {money} دفعة واحدة. كاش فوري في الخزينة، لكن الجماهير غاضبة": [
    "Black files 1207",
    "Dossiers noirs 1207",
  ],
  "نادي {v} دفع الشرط الجزائي {money} دفعة واحدة. كاش فوري في الخزينة، لكن الجماهير غاضبة.": [
    "Black files 1208",
    "Dossiers noirs 1208",
  ],
  "نادي منافس كلف مكتب محاماة بمراجعة قرارات مباراته ضدكم": [
    "Black files 1209",
    "Dossiers noirs 1209",
  ],
  "نادي منافس كلف مكتب محاماة بمراجعة قرارات مباراته ضدكم.": [
    "Black files 1210",
    "Dossiers noirs 1210",
  ],
  "نادينا بلا شبهات": [
    "Black files 1211",
    "Dossiers noirs 1211",
  ],
  "نادٍ صغير": [
    "Black files 1212",
    "Dossiers noirs 1212",
  ],
  "نادٍ عملاق": [
    "Black files 1213",
    "Dossiers noirs 1213",
  ],
  "نادٍ كبير": [
    "Black files 1214",
    "Dossiers noirs 1214",
  ],
  "نادٍ متوسط": [
    "Black files 1215",
    "Dossiers noirs 1215",
  ],
  "نجحت العملية": [
    "Black files 1216",
    "Dossiers noirs 1216",
  ],
  "نظيف": [
    "Black files 1217",
    "Dossiers noirs 1217",
  ],
  "نفي صحته واتهام التزييف": [
    "Black files 1218",
    "Dossiers noirs 1218",
  ],
  "هتاف جماهيري يشكك في التحكيم لصالحك": [
    "Black files 1219",
    "Dossiers noirs 1219",
  ],
  "هجوم مضاد واتهام متبادل": [
    "Black files 1220",
    "Dossiers noirs 1220",
  ],
  "هدايا للجنة (قذرة": [
    "Black files 1221",
    "Dossiers noirs 1221",
  ],
  "هدايا للجنة (قذرة)": [
    "Black files 1222",
    "Dossiers noirs 1222",
  ],
  "هذه الدرجة غير متاحة": [
    "Black files 1223",
    "Dossiers noirs 1223",
  ],
  "هذه الدرجة غير متاحة.": [
    "Black files 1224",
    "Dossiers noirs 1224",
  ],
  "هل الفوز يبرر الوسيلة": [
    "Black files 1225",
    "Dossiers noirs 1225",
  ],
  "هل الفوز يبرر الوسيلة؟": [
    "Black files 1226",
    "Dossiers noirs 1226",
  ],
  "همسات صحفية": [
    "Black files 1227",
    "Dossiers noirs 1227",
  ],
  "همسات صحفية — الشبهات {n}%": [
    "Black files 1228",
    "Dossiers noirs 1228",
  ],
  "همسات عن عمولات أرخص بفضل وكيل المرتب": [
    "Black files 1229",
    "Dossiers noirs 1229",
  ],
  "همسات في ممرات الاتحاد": [
    "Black files 1230",
    "Dossiers noirs 1230",
  ],
  "همسات في ممرات الاتحاد عن علاقات مشبوهة": [
    "Black files 1231",
    "Dossiers noirs 1231",
  ],
  "وسيط مجهول يعرض خدماته": [
    "Black files 1232",
    "Dossiers noirs 1232",
  ],
  "وسيط مجهول يعرض نفسه": [
    "Black files 1233",
    "Dossiers noirs 1233",
  ],
  "وصل رد النادي · افتح البريد": [
    "Black files 1234",
    "Dossiers noirs 1234",
  ],
  "وكيل على المرتب": [
    "Black files 1235",
    "Dossiers noirs 1235",
  ],
  "وكيل على المرتب نشط — عمولات 1%": [
    "Black files 1236",
    "Dossiers noirs 1236",
  ],
  "وكيل لاعبين علق أن عمولات ناديك صارت أقل من السوق بشكل لافت": [
    "Black files 1237",
    "Dossiers noirs 1237",
  ],
  "وكيل لاعبين علق أن عمولات ناديك صارت أقل من السوق بشكل لافت.": [
    "Black files 1238",
    "Dossiers noirs 1238",
  ],
  "يجب تحديد اللاعب": [
    "Black files 1239",
    "Dossiers noirs 1239",
  ],
  "يجب تحديد اللاعب.": [
    "Black files 1240",
    "Dossiers noirs 1240",
  ],
  "يسرى": [
    "Black files 1241",
    "Dossiers noirs 1241",
  ],
  "يمكن كسره بدفع فوري دفعة واحدة + التفاوض مع اللاعب مباشرة. أندية AI تكسر شروط لاعبيك أيضًا (كاش فوري + غضب جماهيري": [
    "Black files 1242",
    "Dossiers noirs 1242",
  ],
  "يمكن كسره بدفع فوري دفعة واحدة + التفاوض مع اللاعب مباشرة. أندية AI تكسر شروط لاعبيك أيضًا (كاش فوري + غضب جماهيري)": [
    "Black files 1243",
    "Dossiers noirs 1243",
  ],
  "يمكن كسره بدفع فوري دفعة واحدة + التفاوض مع اللاعب مباشرة. أندية AI تكسر شروط لاعبيك أيضًا (كاش فوري + غضب جماهيري).": [
    "Black files 1244",
    "Dossiers noirs 1244",
  ],
  "يمكن كسره فورًا بدفع كامل + التفاوض مع اللاعب": [
    "Black files 1245",
    "Dossiers noirs 1245",
  ],
  "يمنى": [
    "Black files 1246",
    "Dossiers noirs 1246",
  ],
  "يوجد تفاوض إعارة قائم": [
    "Black files 1247",
    "Dossiers noirs 1247",
  ],
  "يوجد تفاوض إعارة قائم.": [
    "Black files 1248",
    "Dossiers noirs 1248",
  ],
  "يوجد تفاوض قائم": [
    "Black files 1249",
    "Dossiers noirs 1249",
  ],
  "يوجد تفاوض قائم مع اللاعب": [
    "Black files 1250",
    "Dossiers noirs 1250",
  ],
  "يوجد تفاوض قائم مع اللاعب.": [
    "Black files 1251",
    "Dossiers noirs 1251",
  ],
  "يوجد تفاوض قائم.": [
    "Black files 1252",
    "Dossiers noirs 1252",
  ],
  "يوجد شرط جزائي": [
    "Black files 1253",
    "Dossiers noirs 1253",
  ],
  "يوم": [
    "Black files 1254",
    "Dossiers noirs 1254",
  ],
  "يوم قفل القيد — أطول ليلة في الموسم": [
    "Black files 1255",
    "Dossiers noirs 1255",
  ],
  "— تكلفة عملية": [
    "Black files 1256",
    "Dossiers noirs 1256",
  ],
  "— حرب إعلامية": [
    "Black files 1257",
    "Dossiers noirs 1257",
  ],
  "— خطف لاعب": [
    "Black files 1258",
    "Dossiers noirs 1258",
  ],
  "— رشوة لاعب خصم": [
    "Black files 1259",
    "Dossiers noirs 1259",
  ],
  "— وكيل على المرتب": [
    "Black files 1260",
    "Dossiers noirs 1260",
  ],

  "لا توجد ملفات سوداء بعد": [
    "Extra 10000",
    "Extra fr 10000",
  ],
  "سمعة": [
    "Extra 10001",
    "Extra fr 10001",
  ],
  "منذ": [
    "Extra 10002",
    "Extra fr 10002",
  ],
  "مبلغ التبرع": [
    "Extra 10003",
    "Extra fr 10003",
  ],
  "فضيحة": [
    "Extra 10004",
    "Extra fr 10004",
  ],
  "الأقساط كل ٣٠ يومًا. عمولة الوكيل ٣٪ عند التوقيع (١٪ مع وكيل على المرتب)، وعقد اللاعب يتم التفاوض عليه بعد رد النادي": [
    "Extra 10005",
    "Extra fr 10005",
  ],
  "مكافآت المشاركة والأهداف تُصرف عند المباريات، والزيادة السنوية تُطبق تلقائيًا. وعد الأساسي يُراجع بعد ٦٠ يومًا. شرط جزائي عالٍ = راتب أعلى مطلوب، شرط قليل = راتب أقل لكن قابل للخطف. سلم القيم": [
    "Extra 10006",
    "Extra fr 10006",
  ],
  "30 ×0.7، 25% بلا شرط": [
    "Extra 10007",
    "Extra fr 10007",
  ],
  "عملية غير صالحة": [
    "Extra 10008",
    "Extra fr 10008",
  ],
  "العملية فشلت وانكشفت. غرامة": [
    "Extra 10009",
    "Extra fr 10009",
  ],
  "ومنع قيد 60 يومًا حتى": [
    "Extra 10010",
    "Extra fr 10010",
  ],
  "خطف": [
    "Extra 10011",
    "Extra fr 10011",
  ],
  "قيمة مخفضة": [
    "Extra 10012",
    "Extra fr 10012",
  ],
  "انتقل بدون إذن ناديه مقابل": [
    "Extra 10013",
    "Extra fr 10013",
  ],
  "العملية سريعة لكن الشبهات ارتفعت": [
    "Extra 10014",
    "Extra fr 10014",
  ],
  "حملة ملفقة ضد": [
    "Extra 10015",
    "Extra fr 10015",
  ],
  "جماهيرك ارتفعت مؤقتًا، لكن الشبهات تراكمت": [
    "Extra 10016",
    "Extra fr 10016",
  ],
  "تبرعت": [
    "Extra 10017",
    "Extra fr 10017",
  ],
  "انخفضت الشبهات": [
    "Extra 10018",
    "Extra fr 10018",
  ],
  "كسر شرط جزائي": [
    "Extra 10019",
    "Extra fr 10019",
  ],
};
