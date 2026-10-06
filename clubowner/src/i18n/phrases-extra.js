// 0.19 — strings that live inside nested template expressions (`${a ? `…` : "…"}`), which the
// first scanner pass could not see: expanded-world panels, competition cards, tactics, loans,
// talent centre, legends contracts and match reports.
export const EXTRA_PHRASES = {
  // features/expanded.js
  "الدرجة المتاحة": ["Available division", "Division disponible"],
  "البطولة / المجموعة": ["Competition / group", "Compétition / groupe"],
  "أندية حقيقية ولاعبون مولّدون في الدرجات الأقل. مصر: الثانية أ 20 ناديًا، والثانية ب 5 مجموعات تضم 70 اسمًا بعد التوفيق بين تقارير متعارضة؛ ليست شهادة تسجيل رسمي. المستوى الرابع المصري غير مضاف. إجمالي":
    [
      "Real clubs with generated players in the lower tiers. Egypt: Second Division A with 20 clubs and Second Division B with 5 groups of 70 names reconciled from conflicting reports; not an official registration record. Egypt’s fourth tier is not included. Total",
      "Clubs réels et joueurs générés dans les divisions inférieures. Égypte : Deuxième division A à 20 clubs et Deuxième division B à 5 groupes de 70 noms réconciliés à partir de sources divergentes ; pas un registre officiel. Le quatrième niveau égyptien n’est pas inclus. Total",
    ],
  "مسابقة أقل في": [
    "lower competitions across",
    "compétitions inférieures dans",
  ],
  سوقًا: ["markets", "marchés"],
  "المصادر والحدود ↗": ["Sources and limits ↗", "Sources et limites ↗"],
  "التواريخ والاقتصاد بالجنيه نماذج محاكاة": [
    "Dates and the pound-based economy are simulation models",
    "Dates et économie en livres sont des modèles de simulation",
  ],
  "التجارة والخدمات": ["Commerce and services", "Commerce et services"],
  "مصادر دخل النادي": ["Club revenue sources", "Sources de revenus du club"],
  "الربح بعد التكلفة، وليس كل إيراد مكسبًا": [
    "Profit after cost — not every revenue is a gain",
    "Le profit après coûts — toute recette n’est pas un gain",
  ],
  "بيع اشتراكات الموسم (خصم 25٪": [
    "Sell season tickets (25% discount",
    "Vendre les abonnements (remise de 25 %",
  ],
  "تنظيم الودية": ["Stage the friendly", "Organiser l’amical"],
  التأسيس: ["Set-up", "Mise en place"],
  "السمعة المطلوبة": ["Required reputation", "Réputation requise"],
  "تدفق نقدي": ["cash flow", "flux de trésorerie"],
  "ج.م. · ربح تشغيلي": [
    "EGP · operating profit",
    "EGP · bénéfice d’exploitation",
  ],
  "ج.م. بعد تكلفة القمصان المباعة. لا يشمل استثمار التأسيس": [
    "EGP after the cost of shirts sold. Excludes the set-up investment",
    "EGP après le coût des maillots vendus. Hors investissement de mise en place",
  ],
  "ج.م تُخصم فورًا": ["EGP charged immediately", "EGP débités immédiatement"],
  "تكلفة التعيين الآن": [
    "Appointment cost now",
    "Coût de la nomination maintenant",
  ],
  "ج.م (فسخ السابق + توقيع شهر": [
    "EGP (previous severance + one month’s signing",
    "EGP (rupture du précédent + un mois de signature",
  ],
  "المالك مستمر": ["The owner stays on", "Le propriétaire reste"],
  "مركز الإدارة الرياضية": [
    "Sporting management hub",
    "Centre de direction sportive",
  ],
  "اختيار المدرب والتشكيل والصفقات الصادرة. المدربون هنا شخصيات خيالية": [
    "Coach selection, line-up and outgoing deals. Coaches here are fictional characters",
    "Choix de l’entraîneur, composition et ventes. Les entraîneurs sont des personnages fictifs",
  ],
  "دون مدرب": ["No coach", "Sans entraîneur"],
  "إقالة — تعويض": ["Dismiss — compensation", "Licencier — indemnité"],
  راتب: ["salary", "salaire"],
  "التفاوض على إعارة": ["Negotiate a loan", "Négocier un prêt"],
  "شراء تقرير": ["Buy a report", "Acheter un rapport"],
  مستوى: ["level", "niveau"],
  "إمكانات تقديرية": ["estimated potential", "potentiel estimé"],
  "صحافة خيالية · أحداث من حفظتك": [
    "Fictional press · events from your save",
    "Presse fictive · événements de votre sauvegarde",
  ],
  "التصريحات لا تغيّر القدرات مباشرة. الوعود تُراجع في نهاية الموسم": [
    "Statements do not change abilities directly. Promises are reviewed at season end",
    "Les déclarations ne modifient pas directement les capacités. Les promesses sont évaluées en fin de saison",
  ],
  "إلغاء تفويض الردود": [
    "Stop delegating replies",
    "Cesser de déléguer les réponses",
  ],
  "تفويض الردود الروتينية بلا تعليق": [
    "Delegate routine replies with no comment",
    "Déléguer les réponses de routine sans commentaire",
  ],
  موسم: ["season", "saison"],
  "النصف الأعلى": ["top half", "première moitié"],
  "عالم المحاكاة": ["Simulation world", "Monde simulé"],
  "الدوريات والبطولات": [
    "Leagues and competitions",
    "Championnats et compétitions",
  ],
  "دوريات ودرجات وكؤوس، وأوروبا بمرحلة دوري وملحق وذهاب وإياب": [
    "Leagues, divisions and cups, plus Europe with a league phase, play-off and two-legged rounds",
    "Championnats, divisions et coupes, plus l’Europe avec phase de ligue, barrage et tours aller-retour",
  ],
  "العالم والروزنامة والمقاعد والجوائز محاكاة. البطولات الأوروبية الجديدة تطبق البنية الأساسية من 36 ناديًا حتى النهائي، لا قائمة القبول أو التصفيات أو المعاملات الرسمية. أفريقيا وليبرتادوريس وسودأمريكانا لها مجموعات وإقصائيات؛ المقاعد والتأهل الأولي محاكاة. آسيا وكونكاكاف بصيغ لعب مبنية على اللوائح مع مقاعد وقرعة ومواعيد محاكاة. صيغتا FIFA الجديدتان منفصلتان؛ التأهل والمعاملات والمضيف والمواعيد محاكاة. الصعود الترتيبي الحالي معتمد ضمن نطاق اللعبة. الحفظة القديمة تُبقي صيغة موسمها الجاري حتى نهايته":
    [
      "World, calendar, places and prize money are simulated. The new European competitions apply the basic 36-club structure through to the final, not the official entry list, qualifiers or coefficients. Africa, Libertadores and Sudamericana have groups and knockouts; places and initial qualification are simulated. Asia and CONCACAF use regulation-based formats with simulated places, draws and dates. The two new FIFA formats are separate; qualification, coefficients, host and dates are simulated. The current table-based promotion is adopted within the game’s scope. An old save keeps its current season format until it ends",
      "Monde, calendrier, places et dotations sont simulés. Les nouvelles compétitions européennes appliquent la structure de base à 36 clubs jusqu’à la finale, pas la liste d’accès, les qualifications ni les coefficients officiels. Afrique, Libertadores et Sudamericana ont groupes et éliminatoires ; places et qualification initiale simulées. Asie et CONCACAF utilisent des formats fondés sur les règlements avec places, tirages et dates simulés. Les deux nouveaux formats FIFA sont distincts ; qualification, coefficients, hôte et dates simulés. La montée au classement actuelle est adoptée dans le cadre du jeu. Une ancienne sauvegarde garde le format de sa saison jusqu’à son terme",
    ],
  "قواعد الحفظة القديمة محفوظة؛ كتالوج 0.8 لا يستبدلها": [
    "The old save’s rules are preserved; the 0.8 catalog does not replace them",
    "Les règles de l’ancienne sauvegarde sont conservées ; le catalogue 0.8 ne les remplace pas",
  ],
  "بطولة ناديك": ["Your club’s competition", "La compétition de votre club"],
  "محاكاة خفيفة بالخلفية": [
    "Light background simulation",
    "Simulation légère en arrière-plan",
  ],
  "بطولات آسيا الجديدة تبدأ بعد نهاية الموسم المحفوظ القديم": [
    "The new Asian competitions start after the old saved season ends",
    "Les nouvelles compétitions asiatiques démarrent après la fin de l’ancienne saison sauvegardée",
  ],
  "بطولات كونكاكاف الجديدة تبدأ بعد نهاية الموسم المحفوظ القديم": [
    "The new CONCACAF competitions start after the old saved season ends",
    "Les nouvelles compétitions CONCACAF démarrent après la fin de l’ancienne saison sauvegardée",
  ],
  "ركلات ترجيح": ["penalties", "tirs au but"],
  صعد: ["promoted", "promu"],

  // features/competitions/cards.js
  مجموعة: ["Group", "Groupe"],
  "المواجهة الأولى": ["First leg", "Match aller"],
  الإياب: ["Second leg", "Match retour"],
  محايد: ["neutral", "neutre"],
  "أفضلية أهداف خارج الأرض": ["away-goals rule", "règle du but à l’extérieur"],
  "أوعية القرعة حسب السمعة الداخلية، لا تصنيف الاتحاد الرسمي. المقاعد موزعة على الأسواق المتاحة، وليست قائمة الدخول الرسمية أو تصفيات كل الاتحاد":
    [
      "Draw pots follow in-game reputation, not the official confederation ranking. Places are spread across the available markets, not the official entry list or every association’s qualifiers",
      "Les chapeaux suivent la réputation du jeu, pas le classement officiel de la confédération. Les places sont réparties entre les marchés disponibles, pas la liste d’accès officielle ni les qualifications de chaque fédération",
    ],
  "أفريقيا ممثلة بخمسة أسواق فقط، وحصصها هنا أعلى من الرسمية": [
    "Africa is represented by only five markets, whose quotas here exceed the official ones",
    "L’Afrique n’est représentée que par cinq marchés, dont les quotas dépassent ici les quotas officiels",
  ],
  "من سمعة البداية، وليسوا قائمة موسم حقيقي معتمدة": [
    "from starting reputation, not a certified real-season list",
    "d’après la réputation initiale, pas une liste officielle de saison réelle",
  ],
  "من نتائج الدوري والكأس المحفوظة داخل لعبتك": [
    "from the league and cup results saved in your game",
    "d’après les résultats de championnat et de coupe sauvegardés dans votre partie",
  ],
  "المفاضلة تبدأ بالمواجهات المباشرة ثم الإحصاءات العامة؛ بطاقات أمريكا الجنوبية أرقام محاكاة، والقرعة الأخيرة ترتيب عشوائي ثابت محفوظ. ليست منظومة انضباط وإيقافات كاملة":
    [
      "Tiebreaks start with head-to-head, then overall statistics; South American cards are simulated numbers and the final draw is a fixed saved random order. Not a full discipline and suspension system",
      "Le départage commence par les confrontations directes puis les statistiques générales ; les cartons sud-américains sont simulés et le tirage final est un ordre aléatoire fixe sauvegardé. Pas un système complet de discipline et de suspensions",
    ],
  "مجموع الأهداف ثم أهداف خارج الأرض ثم الترجيح، دون وقت إضافي": [
    "Aggregate, then away goals, then penalties, without extra time",
    "Cumul, puis buts à l’extérieur, puis tirs au but, sans prolongation",
  ],
  "وقت إضافي ثم ترجيح عند تعادل المباراة أو مجموع المواجهتين؛ لا أفضلية هدف خارج الأرض":
    [
      "Extra time then penalties when the match or aggregate is level; no away-goals rule",
      "Prolongation puis tirs au but en cas d’égalité sur le match ou le cumul ; pas de règle du but à l’extérieur",
    ],
  "ذهاب وإياب بلا أفضلية هدف خارج الأرض؛ وقت إضافي ثم ترجيح في الإياب، وبطل ليبرتادوريس يستضيفه":
    [
      "Two legs without the away-goals rule; extra time then penalties in the second leg, hosted by the Libertadores champion",
      "Aller-retour sans règle du but à l’extérieur ; prolongation puis tirs au but au retour, accueilli par le vainqueur de la Libertadores",
    ],
  "بلا أفضلية هدف خارج الأرض؛ الترجيح مباشرة في أدوار ما قبل النهائي، والوقت الإضافي في النهائي قبل الترجيح":
    [
      "No away-goals rule; straight to penalties before the final, and extra time in the final before penalties",
      "Pas de règle du but à l’extérieur ; tirs au but directs avant la finale, prolongation en finale avant les tirs au but",
    ],
  "ترجيح مباشر عند التعادل": [
    "Straight to penalties if level",
    "Tirs au but directs en cas d’égalité",
  ],
  "إعفاء هذه الجولة": ["Bye this round", "Exempt ce tour"],
  "مواجهات ناديك": ["Your club’s ties", "Les confrontations de votre club"],
  "أحدث النتائج والمواعيد": [
    "Latest results and fixtures",
    "Derniers résultats et prochains matchs",
  ],

  // features/legends.js
  "آخر شهر": ["Last month", "Dernier mois"],
  "جلسة (+": ["sessions (+", "séances (+"],
  "الإرث لا يُشترى. يُبنى… ويُصقل بالأساطير": [
    "Legacy is not bought. It is built… and polished by legends",
    "L’héritage ne s’achète pas. Il se bâtit… et se polit avec des légendes",
  ],
  "تعاقد مع أساطير حقيقية معتزلة كمدربين متخصصين حسب مراكزهم، أو سفراء للنادي، أو — في وضع خيالي اختياري — كلاعبين يعودون للملاعب":
    [
      "Sign real retired legends as specialist coaches by position, as club ambassadors or — in an optional fantasy mode — as players returning to the pitch",
      "Engagez de vraies légendes retraitées comme entraîneurs spécialisés par poste, ambassadeurs du club ou — dans un mode fictif facultatif — comme joueurs de retour sur le terrain",
    ],
  "لا نتائج": ["No results", "Aucun résultat"],
  "غيّر الفلاتر": ["Change the filters", "Modifiez les filtres"],
  الاسم: ["Name", "Nom"],
  مباريات: ["Matches", "Matchs"],
  أهداف: ["Goals", "Buts"],
  "تقييم الاعتزال": ["Rating at retirement", "Note à la retraite"],
  "تاريخ الدخول": ["Inducted on", "Date d’entrée"],
  "أسطورة عائدة": ["Returning legend", "Légende de retour"],
  "الأسماء حقيقية لأساطير معتزلة؛ الذروة والسمات والأسعار والرواتب وردود القبول كلها تقديرات تحريرية لأغراض المحاكاة وليست بيانات رسمية ولا تصريحات من الأشخاص أو الأندية":
    [
      "Names are those of real retired legends; peaks, attributes, fees, salaries and acceptance replies are all editorial estimates for the simulation, not official data nor statements by the people or clubs",
      "Les noms sont ceux de vraies légendes retraitées ; sommets, attributs, prix, salaires et réponses sont des estimations éditoriales pour la simulation, pas des données officielles ni des déclarations des personnes ou des clubs",
    ],
  "مرتبط بعقد نشط معك": [
    "Under an active contract with you",
    "Sous contrat actif avec vous",
  ],
  "لديك بالفعل": ["You already have a", "Vous avez déjà un"],
  أسطوري: ["legend", "légendaire"],
  "; أنهِ عقده أولًا": [
    "; end his contract first",
    " ; résiliez d’abord son contrat",
  ],
  تراجع: ["Cancel", "Annuler"],
  "قبل العرض بعد العلاوة": [
    "accepted the offer after the premium",
    "a accepté l’offre après la prime",
  ],

  // features/europe/cards.js
  نهائي: ["Final", "Finale"],
  ذهاب: ["First leg", "Aller"],
  إياب: ["Second leg", "Retour"],
  "مؤجلة لمراعاة الراحة": [
    "Postponed to respect the rest gap",
    "Reportée pour respecter le repos",
  ],
  "لا مباريات مؤكدة": ["No confirmed matches", "Aucun match confirmé"],
  "الموعد التالي": ["Next date", "Prochaine date"],
  "سيناريو افتتاحي حسب سمعة الأندية داخل اللعبة، لا قائمة رسمية": [
    "Opening scenario by in-game club reputation, not an official list",
    "Scénario d’ouverture selon la réputation des clubs dans le jeu, pas une liste officielle",
  ],
  "من ترتيب الدوريات في الموسم السابق داخل حفظتك": [
    "from last season’s league tables in your save",
    "d’après les classements de la saison précédente dans votre sauvegarde",
  ],
  "مركز ناديك": ["Your club’s position", "La position de votre club"],
  الوعاء: ["Pot", "Chapeau"],
  "خصم من كل وعاء؛ توازن الاستضافة بين كل زوج من الأوعية": [
    "opponents from each pot; hosting balanced across every pair of pots",
    "adversaires par chapeau ; réception équilibrée entre chaque paire de chapeaux",
  ],
  "خصمان من كل وعاء: واحد على ملعبك والآخر خارجه": [
    "Two opponents from each pot: one at home, one away",
    "Deux adversaires par chapeau : un à domicile, un à l’extérieur",
  ],
  مركز: ["Position", "Position"],
  "معامل محاكاة": ["simulated coefficient", "coefficient simulé"],
  "طريق الأدوار الإقصائية": ["Knockout path", "Parcours à élimination directe"],
  "مجموع الأهداف بلا أفضلية الهدف خارج الأرض؛ التعادل يقود لوقت إضافي ثم الترجيح. أرقام ركلات الترجيح منفصلة عن النتيجة. أفضلية إياب ربع/نصف النهائي تتبع مسار المصنف إذا أُقصي":
    [
      "Aggregate without the away-goals rule; a tie leads to extra time then penalties. Shoot-out figures are separate from the score. Second-leg advantage in the quarter/semi-finals follows the seed’s path if he is eliminated",
      "Cumul sans règle du but à l’extérieur ; une égalité mène à la prolongation puis aux tirs au but. Les chiffres des tirs au but sont séparés du score. L’avantage du retour en quarts/demies suit le parcours de la tête de série si elle est éliminée",
    ],

  // features/management/tactics.js
  الرسم: ["Formation", "Schéma"],
  الضغط: ["Pressing", "Pressing"],
  الإيقاع: ["Tempo", "Tempo"],
  "أسلوب اللعب": ["Playing style", "Style de jeu"],
  "المحرك الموضعي مفعّل": [
    "Positional engine active",
    "Moteur de postes actif",
  ],
  "حفظة قديمة: غيّر أحد الإعدادات لتفعيل المحرك الموضعي": [
    "Old save: change any setting to activate the positional engine",
    "Ancienne sauvegarde : modifiez un réglage pour activer le moteur de postes",
  ],
  منخفض: ["Low", "Bas"],
  عالٍ: ["High", "Haut"],
  بطيء: ["Slow", "Lent"],
  سريع: ["Fast", "Rapide"],
  استحواذ: ["Possession", "Possession"],
  مباشر: ["Direct", "Direct"],
  مرتدات: ["Counter-attack", "Contre-attaque"],
  مركزه: ["his position", "son poste"],
  الملاءمة: ["Fit", "Adéquation"],
  "ملاءمة الدور": ["Role fit", "Adéquation du rôle"],

  // features/asia/cards.js
  "موقع مجمع / محايد": [
    "Centralised / neutral venue",
    "Site centralisé / neutre",
  ],
  "ملعب صاحب الأرض": ["Home side’s ground", "Terrain du club recevant"],
  "وقت إضافي": ["extra time", "prolongation"],
  ترجيح: ["penalties", "tirs au but"],
  "القرعة: أربعة أعمدة؛ تستضيف العمود التالي وتزور السابق. لا خصم من نفس الاتحاد؛ لا يزيد اتحاد واحد على ثلاثة أندية في العمود. توزيع الأوعية بالسمعة داخل أعمدة قابلة للتنفيذ، وليس بمعامل AFC الرسمي. لا ملحق للمراكز 7–10 في صيغة هذا الموسم":
    [
      "Draw: four columns; you host the next column and visit the previous one. No opponent from the same association; no association has more than three clubs in a column. Pots are set by reputation within feasible columns, not by the official AFC coefficient. No play-off for places 7–10 in this season’s format",
      "Tirage : quatre colonnes ; vous recevez la colonne suivante et visitez la précédente. Aucun adversaire de la même fédération ; pas plus de trois clubs d’une fédération par colonne. Chapeaux par réputation dans des colonnes réalisables, pas par le coefficient officiel de l’AFC. Pas de barrage pour les places 7–10 dans le format de cette saison",
    ],
  "الخاسرون في تمهيدي النخبة ينتقلون للمجموعات هنا. بطل البطولة يدخل مسار النخبة في الموسم التالي؛ أهلية محلية أعلى لها الأولوية":
    [
      "Losers of the Elite preliminary round drop into these groups. The champion enters the Elite path next season; a higher domestic entitlement takes priority",
      "Les perdants du tour préliminaire Élite sont reversés dans ces groupes. Le champion entre dans le parcours Élite la saison suivante ; un droit national supérieur a la priorité",
    ],
  "الخاسرون في تمهيدي دوري الأبطال 2 ينتقلون للمجموعات هنا. بطل التحدي يدخل مجموعات دوري الأبطال 2 والوصيف مسار تمهيديه في النموذج؛ لا تمهيدي مستقل للتحدي حاليًا":
    [
      "Losers of the Champions League Two preliminary round drop into these groups. The Challenge League winner enters the Champions League Two groups and the runner-up its preliminary path in the model; no separate Challenge preliminary yet",
      "Les perdants du tour préliminaire de la Ligue des champions 2 sont reversés ici. Le vainqueur de la Challenge League entre dans les groupes de la Ligue des champions 2 et le finaliste dans son tour préliminaire ; pas de préliminaire distinct pour la Challenge pour l’instant",
    ],
  "في انتظار نتائج التمهيدي الأعلى؛ لن نملأ المقاعد بأندية مكررة": [
    "Awaiting the higher preliminary round’s results; places will not be filled with duplicate clubs",
    "En attente des résultats du tour préliminaire supérieur ; les places ne seront pas comblées avec des clubs en double",
  ],
  "النقاط ثم الفارق والأهداف والانتصارات": [
    "Points, then goal difference, goals scored and wins",
    "Points, puis différence de buts, buts marqués et victoires",
  ],
  "النقاط ثم المواجهات المباشرة مع إعادة تطبيقها على المتعادلين الباقين، ثم الفارق والأهداف":
    [
      "Points, then head-to-head reapplied among the remaining tied teams, then goal difference and goals",
      "Points, puis confrontations directes réappliquées entre les équipes encore à égalité, puis différence de buts et buts",
    ],
  "ترجيح حسم الترتيب (لا يغير نقاط التعادل": [
    "Standings shoot-out (does not change the draw’s points",
    "Tirs au but de classement (ne modifient pas les points du nul",
  ],
  "أوعية قرعة": ["Draw pots", "Chapeaux du tirage"],
  "تصنيف نموذجي": ["model seeding", "classement modélisé"],
  "بطل النخبة وحده يمثل آسيا في الإنتركونتيننتال ويُسجل في دورة تأهل كأس العالم":
    [
      "Only the Elite champion represents Asia in the Intercontinental Cup and enters the Club World Cup qualification cycle",
      "Seul le champion Élite représente l’Asie en Coupe intercontinentale et entre dans le cycle de qualification du Mondial des clubs",
    ],

  // features/talent.js
  الإمكانات: ["Potential", "Potentiel"],
  الثقة: ["Confidence", "Confiance"],
  متابعة: ["Follow up", "Suivre"],
  "السعر المقدر": ["Estimated price", "Prix estimé"],
  بتاريخ: ["as of", "au"],
  "؛ السعر والحالة الحالية قد يتغيران": [
    "; price and current status may change",
    " ; prix et situation actuelle peuvent changer",
  ],
  "متابعة 21 يومًا — 60 ألف": [
    "21-day follow-up — 60k",
    "Suivi de 21 jours — 60 k",
  ],
  "إزالة من المختصرة": ["Remove from shortlist", "Retirer de la liste"],
  "إضافة للمختصرة": ["Add to shortlist", "Ajouter à la liste"],
  "الدفعة قيد الاختبار حتى": [
    "Intake under assessment until",
    "Promotion en évaluation jusqu’au",
  ],
  "استخدمت دفعة هذا الموسم": [
    "This season’s intake has been used",
    "La promotion de cette saison a été utilisée",
  ],
  "سنة · مستوى": ["yrs · level", "ans · niveau"],
  تقارير: ["reports", "rapports"],
  "أضف اللاعبين للمقارنة هنا": [
    "Add players here to compare them",
    "Ajoutez des joueurs ici pour les comparer",
  ],

  // features/management/loans.js
  "استدعاء مسموح بعد 60 يومًا": [
    "recall allowed after 60 days",
    "rappel autorisé après 60 jours",
  ],
  "لا استدعاء مبكر": ["no early recall", "pas de rappel anticipé"],
  "خيار شراء": ["purchase option", "option d’achat"],
  "بلا خيار شراء": ["no purchase option", "sans option d’achat"],
  "اعتماد الشروط": ["Approve the terms", "Valider les conditions"],
  "عرض للإعارة": ["Loan offer", "Offre de prêt"],
  "طلب إعارة": ["Loan request", "Demande de prêt"],
  "النادي المستعير": ["Borrowing club", "Club emprunteur"],
  "عرض لاعبك للإعارة": [
    "Offer your player on loan",
    "Proposer votre joueur en prêt",
  ],
  "مشاركات خلال الإعارة": [
    "Appearances during the loan",
    "Apparitions pendant le prêt",
  ],
  "الهوية والتاريخ محفوظان": [
    "Identity and history preserved",
    "Identité et historique conservés",
  ],

  // features/fifa/cards.js
  "على ملعب صاحب الأرض": [
    "at the home side’s ground",
    "sur le terrain du club recevant",
  ],
  "التأهل من نتائج": [
    "Qualification from the results of",
    "Qualification d’après les résultats de",
  ],
  "سنوات متاحة": ["available years", "années disponibles"],
  "المقاعد الناقصة تُستكمل بالسمعة مع بيان السبب، والتصنيف ليس معامل FIFA الرسمي. أمريكا مضيف سيناريو، وليست إعلانًا عن مضيف":
    [
      "Missing places are filled by reputation with the reason stated, and seeding is not the official FIFA coefficient. The USA is a scenario host, not a host announcement",
      "Les places manquantes sont comblées par réputation avec le motif indiqué, et le classement n’est pas le coefficient officiel de la FIFA. Les États-Unis sont un hôte de scénario, pas une annonce officielle",
    ],
  "لن تُجرى قرعة بديلة من أندية عشوائية؛ تبدأ البطولة عندما يُعرف الأبطال الستة":
    [
      "No substitute draw of random clubs will be made; the competition starts once the six champions are known",
      "Aucun tirage de remplacement avec des clubs aléatoires ; la compétition démarre une fois les six champions connus",
    ],
  "أوقيانوسيا تواجه بطل آسيا أو أفريقيا بالتبادل السنوي، ثم البطل الآخر. بطل كونكاكاف يواجه بطل ليبرتادوريس في ديربي الأمريكتين. الفائزان يلعبان كأس التحدي؛ الفائز يواجه بطل أوروبا في النهائي":
    [
      "Oceania faces the Asian or African champion in yearly rotation, then the other champion. The CONCACAF champion faces the Libertadores champion in the Derby of the Americas. The two winners play the Challenger Cup; its winner meets Europe’s champion in the final",
      "L’Océanie affronte le champion d’Asie ou d’Afrique en alternance annuelle, puis l’autre champion. Le champion CONCACAF affronte le vainqueur de la Libertadores dans le Derby des Amériques. Les deux vainqueurs jouent la Coupe Challenger ; le gagnant rencontre le champion d’Europe en finale",
    ],
  "المواجهات المباشرة، وإعادة تطبيقها على المتعادلين المتبقين، ثم الفارق والأهداف والانضباط والقرعة المحفوظة. الانضباط موزون 1/3/4/5 وهو سجل فريق محاكى، لا إيقافات فردية":
    [
      "Head-to-head, reapplied among the remaining tied teams, then goal difference, goals, discipline and the saved draw. Discipline is weighted 1/3/4/5 and is a simulated team record, not individual suspensions",
      "Confrontations directes, réappliquées entre les équipes encore à égalité, puis différence de buts, buts, discipline et tirage sauvegardé. La discipline est pondérée 1/3/4/5 et constitue un bilan d’équipe simulé, pas des suspensions individuelles",
    ],
  "لا مباراة للمركز الثالث؛ 63 مباراة حتى التتويج": [
    "No third-place match; 63 matches to the title",
    "Pas de match pour la troisième place ; 63 matchs jusqu’au titre",
  ],
  "تُسجل بعد اكتمال أول موسم": [
    "recorded after the first full season",
    "enregistrées après la première saison complète",
  ],

  // features/players.js
  "ابحث، فاوض، ووازن تكلفة الصفقة على المدى الطويل": [
    "Search, negotiate and weigh the long-term cost of the deal",
    "Cherchez, négociez et pesez le coût de l’opération à long terme",
  ],
  "كل لاعب له دور. وكل عقد له أثر على مستقبل النادي": [
    "Every player has a role. Every contract shapes the club’s future",
    "Chaque joueur a un rôle. Chaque contrat pèse sur l’avenir du club",
  ],
  "جرّب اسمًا آخر أو غيّر الفلاتر": [
    "Try another name or change the filters",
    "Essayez un autre nom ou modifiez les filtres",
  ],
  "اللاعب معتزل داخل هذه الحفظة. لا يمكن التعاقد معه كلاعب": [
    "The player has retired within this save. He cannot be signed as a player",
    "Le joueur a pris sa retraite dans cette sauvegarde. Il ne peut pas être engagé comme joueur",
  ],
  "المنتخب — داخل هذه الحفظة فقط": [
    "National team — within this save only",
    "Sélection — dans cette sauvegarde seulement",
  ],
  "مشاركات دولية": ["international caps", "sélections"],
  "قدرات تقديرية للعبة وليست تقييمًا رسميًا": [
    "Estimated abilities for the game, not an official rating",
    "Capacités estimées pour le jeu, pas une évaluation officielle",
  ],
  "مكافآت المشاركة والأهداف تُصرف عند المباريات، والزيادة السنوية تُطبق تلقائيًا. وعد الأساسي يُراجع بعد ٦٠ يومًا. الإعارات وشراء المنافسين للاعبيك لم تُفعّل بعد":
    [
      "Appearance and goal bonuses are paid at matches and the annual raise applies automatically. The starter promise is reviewed after 60 days. Loans and rival bids for your players are not active yet",
      "Les primes de match et de but sont versées lors des matchs et l’augmentation annuelle s’applique automatiquement. La promesse de titulaire est évaluée après 60 jours. Prêts et offres des rivaux pour vos joueurs ne sont pas encore actifs",
    ],

  // main.js
  "تصدير الحالية أولًا": [
    "Export the current save first",
    "Exportez d’abord la sauvegarde actuelle",
  ],
  "عمولة الوكيل (٣٪": ["Agent fee (3%", "Commission d’agent (3 %"],
  "العقد الجديد والمكافأة": [
    "New contract and bonus",
    "Nouveau contrat et prime",
  ],
  "رسوم الانتقال والمرتب والمكافأة والوكيل": [
    "Transfer fee, wage, bonus and agent",
    "Indemnité de transfert, salaire, prime et agent",
  ],
  "العقد حصري لقطاع": [
    "Exclusive contract for the sector",
    "Contrat exclusif pour le secteur",
  ],
  "؛ يمنع التعاقد مع منافس في نفس القطاع": [
    "; blocks signing a competitor from the same sector",
    " ; interdit de signer un concurrent du même secteur",
  ],
  "بدون حصرية قطاع؛ مساحة الإعلان نفسها محجوزة لهذا الشريك فقط": [
    "No sector exclusivity; only the advertising space itself is reserved for this partner",
    "Sans exclusivité sectorielle ; seul l’espace publicitaire est réservé à ce partenaire",
  ],
  "التمويل مش إيراد تشغيلي. القسط بيتسدد تلقائيًا حتى لو أدى لعجز في السيولة": [
    "Financing is not operating income. The instalment is paid automatically even if it causes a cash shortfall",
    "Le financement n’est pas une recette d’exploitation. La mensualité est prélevée automatiquement même si elle crée un déficit de trésorerie",
  ],

  // features/concacaf/cards.js
  "حُسم بأهداف خارج الأرض في الوقت الأصلي": [
    "decided on away goals in normal time",
    "décidé aux buts à l’extérieur dans le temps réglementaire",
  ],
  "الدور الأول: 22 ناديًا، الأعلى تصنيفًا يستضيف الإياب. ثمن النهائي: المعفون الخمسة مع الفائزين بمواجهات أعلى 3 مصنفين يستضيفون الإياب. ربع ونصف النهائي والنهائي حسب سجل البطولة (النقاط ثم الفارق والأهداف والأهداف خارج الأرض والانتصارات ثم الانضباط والسمعة والقرعة). التعادل: أهداف خارج الأرض في الوقت الأصلي، ثم وقت إضافي لا تُحتسب فيه، ثم ترجيح. النهائي دون أفضلية خارج الأرض":
    [
      "Round one: 22 clubs, the higher seed hosts the second leg. Round of 16: the five byes join the winners, with the top 3 seeds hosting the second leg. Quarter-finals, semi-finals and final by competition record (points, then goal difference, goals, away goals and wins, then discipline, reputation and the draw). Ties: away goals in normal time, then extra time where they do not count, then penalties. No away-goals rule in the final",
      "Premier tour : 22 clubs, la meilleure tête de série reçoit au retour. Huitièmes : les cinq exemptés rejoignent les vainqueurs, les 3 meilleures têtes de série recevant au retour. Quarts, demies et finale selon le bilan de la compétition (points, puis différence, buts, buts à l’extérieur et victoires, puis discipline, réputation et tirage). Égalité : buts à l’extérieur dans le temps réglementaire, puis prolongation où ils ne comptent pas, puis tirs au but. Pas de règle du but à l’extérieur en finale",
    ],
  "لا تعادلات: المتعادل في التسعين يذهب للترجيح مباشرة (الفوز الأصلي 3 نقاط، والفوز بالترجيح نقطتان، والخسارة به نقطة). الترتيب: النقاط ثم الانتصارات الأصلية ثم الفارق والأهداف وأقل استقبال ثم الانضباط. أول 4 من كل جدول لربع نهائي مفرد بقرعة ثابتة، ثم نصف نهائي ومباراة ثالث ونهائي. أول 3 يتأهلون لكأس الأبطال":
    [
      "No draws: a match level after 90 minutes goes straight to penalties (a regulation win is 3 points, a shoot-out win 2, a shoot-out loss 1). Standings: points, then regulation wins, then goal difference, goals scored and fewest conceded, then discipline. The top 4 of each table reach single-match quarter-finals with a fixed draw, then semi-finals, a third-place match and the final. The top 3 qualify for the Champions Cup",
      "Pas de nuls : une égalité après 90 minutes va directement aux tirs au but (victoire réglementaire 3 points, victoire aux tirs au but 2, défaite aux tirs au but 1). Classement : points, puis victoires réglementaires, puis différence, buts marqués et moins encaissés, puis discipline. Les 4 premiers de chaque classement jouent des quarts à match unique selon un tirage fixe, puis demies, match pour la troisième place et finale. Les 3 premiers se qualifient pour la Coupe des champions",
    ],
  "المجموعات من دور واحد (مباراتان داخل ومباراتان خارج). الترتيب: النقاط ثم الفارق والأهداف ثم المواجهات المباشرة ثم الانضباط والسمعة والقرعة. ربع النهائي: 1×8 و4×5 و2×7 و3×6؛ الفائزون لنصف النهائي والخاسرون لملحق التأهل. 6 أندية تتأهل لكأس الأبطال والبطل معفى لثمن النهائي":
    [
      "Single-round groups (two home, two away). Standings: points, then goal difference and goals, then head-to-head, then discipline, reputation and the draw. Quarter-finals: 1v8, 4v5, 2v7 and 3v6; winners to the semi-finals, losers to the qualification play-off. 6 clubs qualify for the Champions Cup and the champion gets a bye to the round of 16",
      "Groupes à un tour (deux matchs à domicile, deux à l’extérieur). Classement : points, puis différence et buts, puis confrontations directes, puis discipline, réputation et tirage. Quarts : 1-8, 4-5, 2-7 et 3-6 ; vainqueurs en demies, perdants au barrage de qualification. 6 clubs se qualifient pour la Coupe des champions et le champion est exempté jusqu’aux huitièmes",
    ],
  "المجموعتان من دور واحد. نصف النهائي: أول كل مجموعة مع وصيف الأخرى والفائز يستضيف الإياب. النهائي ومباراة الثالث ذهاب وإياب، والأعلى سجلًا يستضيف الإياب. أول 3 يتأهلون لكأس الأبطال والبطل معفى لثمن النهائي":
    [
      "Two single-round groups. Semi-finals: each group winner against the other group’s runner-up, with the winner hosting the second leg. Final and third-place match over two legs, the better record hosting the second leg. The top 3 qualify for the Champions Cup and the champion gets a bye to the round of 16",
      "Deux groupes à un tour. Demies : le premier de chaque groupe contre le deuxième de l’autre, le vainqueur recevant au retour. Finale et match pour la troisième place en aller-retour, le meilleur bilan recevant au retour. Les 3 premiers se qualifient pour la Coupe des champions et le champion est exempté jusqu’aux huitièmes",
    ],
  "أوعية القرعة — تصنيف نموذجي": [
    "Draw pots — model seeding",
    "Chapeaux du tirage — classement modélisé",
  ],

  // features/facilities.js
  "كل مشروع له وقت وتكلفة تشغيل وأثر. الاستثمار مش مجرد مستوى جديد": [
    "Every project has a duration, an operating cost and an effect. Investment is more than a new level",
    "Chaque projet a une durée, un coût d’exploitation et un effet. Investir, ce n’est pas seulement un niveau de plus",
  ],
  "مشروعات نشطة": ["Active projects", "Projets en cours"],
  "الآثار مفعلة: توسعة سعة الاستاد، استعادة جاهزية أفضل، تطوير شهري للصغار، وتوليد ناشئ شهريًا. الأثر الرياضي يحتاج الموظف المناسب":
    [
      "Effects active: stadium capacity expansion, better fitness recovery, monthly development of young players and a monthly youth intake. The sporting effect needs the right staff member",
      "Effets actifs : extension de la capacité du stade, meilleure récupération, progression mensuelle des jeunes et arrivée mensuelle d’un jeune. L’effet sportif exige le bon membre du personnel",
    ],
  الاستلام: ["Delivery", "Livraison"],
  "تم دفع ٤٠٪، والباقي مستحق عند الاستلام. لا يمكن إلغاء الالتزام بعد بدء البناء في النسخة الحالية":
    [
      "40% paid, the balance due on delivery. The commitment cannot be cancelled once construction starts in this version",
      "40 % versés, le solde dû à la livraison. L’engagement ne peut pas être annulé une fois les travaux commencés dans cette version",
    ],
  "٤٠٪ مقدم + ٦٠٪ عند الاستلام. يلزم رصيد يغطي المشروع كاملًا قبل البدء. زيادة التشغيل":
    [
      "40% upfront + 60% on delivery. Cash must cover the full project before starting. Operating increase",
      "40 % d’avance + 60 % à la livraison. La trésorerie doit couvrir tout le projet avant le début. Hausse d’exploitation",
    ],

  // features/finance.js
  "افصل الرصيد المتاح عن الدخل والالتزامات المستقبلية": [
    "Separate available cash from income and future commitments",
    "Distinguez la trésorerie disponible des recettes et des engagements futurs",
  ],
  "تدفقات نقدية، وليست أرباحًا محاسبية": [
    "Cash flows, not accounting profit",
    "Flux de trésorerie, pas un bénéfice comptable",
  ],
  "تشمل الأصول والأقساط والمصروفات": [
    "Includes assets, instalments and expenses",
    "Inclut actifs, mensualités et dépenses",
  ],
  "بدون الرواتب المتجددة أو التشغيل": [
    "Excluding recurring wages and operations",
    "Hors salaires récurrents et exploitation",
  ],
  "رواتب الأساطير (مدربون وسفراء": [
    "Legend salaries (coaches and ambassadors",
    "Salaires des légendes (entraîneurs et ambassadeurs",
  ],
  "كل حركة مالية هتظهر هنا بشكل تلقائي": [
    "Every financial entry will appear here automatically",
    "Chaque écriture financière apparaîtra ici automatiquement",
  ],

  // services/matches.js
  "مباراة على ملعب محايد؛ لا إيراد تذاكر ملعب ناديك": [
    "Match at a neutral venue; no ticket income from your ground",
    "Match sur terrain neutre ; pas de recette de billetterie de votre stade",
  ],
  "تم تسجيل التذاكر ومصروفات التنظيم في الحسابات": [
    "Tickets and organisation costs were recorded in the accounts",
    "Billetterie et frais d’organisation ont été enregistrés dans les comptes",
  ],
  "مباراة خارج ملعبك": ["Away match", "Match à l’extérieur"],
  خطة: ["Formation", "Schéma"],
  "ملاءمة المراكز": ["positional fit", "adéquation des postes"],
  "٪ · الضغط والإيقاع يؤثران على الفرص والإجهاد": [
    "% · pressing and tempo affect chances and fatigue",
    " % · pressing et tempo influent sur les occasions et la fatigue",
  ],

  // services/competitions/engine.js, domestic.js, europe/engine.js
  "نهائي ذهاب وإياب": ["Two-legged final", "Finale aller-retour"],
  "نهائي محايد واحد": [
    "Single neutral final",
    "Finale unique sur terrain neutre",
  ],
  "؛ حُسم بأهداف خارج الأرض": [
    "; decided on away goals",
    " ; décidé aux buts à l’extérieur",
  ],
  "؛ حُسم بالترجيح": ["; decided on penalties", " ; décidé aux tirs au but"],
  "نصف النهائي ذهاب وإياب": [
    "Two-legged semi-finals",
    "Demi-finales aller-retour",
  ],
  "؛ كأس الرابطة غير ممثلة، تُستكمل المقاعد من الدوري والكأس": [
    "; the League Cup is not represented, places are completed from the league and cup",
    " ; la Coupe de la Ligue n’est pas représentée, les places sont complétées par le championnat et la coupe",
  ],
  "حُسمت بركلات الترجيح": ["decided on penalties", "décidée aux tirs au but"],
  "تأهل مباشر لثمن النهائي": [
    "Direct qualification for the round of 16",
    "Qualification directe pour les huitièmes",
  ],
  "خروج دون انتقال لبطولة أوروبية أخرى": [
    "Eliminated without dropping into another European competition",
    "Éliminé sans reversement dans une autre compétition européenne",
  ],

  // features/careers.js, dashboard.js, inbox.js, settings.js, setup.js, sponsors.js, world.js, install.js
  "قدرات الموظف مستقلة عن تقييمه كلاعب. التعيين عقد ومرتب وتأثير فعلي": [
    "A staff member’s skills are separate from his playing rating. An appointment means a contract, a salary and a real effect",
    "Les compétences d’un membre du staff sont distinctes de sa note de joueur. Une nomination, c’est un contrat, un salaire et un effet réel",
  ],
  "لا توجد خطط اعتزال معلنة الآن": [
    "No retirement plans announced right now",
    "Aucun plan de retraite annoncé pour l’instant",
  ],
  "المعتزلون الراغبون في العمل سيظهرون هنا، وليس كل معتزل مؤهلًا أو راغبًا": [
    "Retirees who want to work will appear here; not every retiree is qualified or willing",
    "Les retraités souhaitant travailler apparaîtront ici ; tous ne sont pas qualifiés ou volontaires",
  ],
  "القدرات المهنية تقديرية داخل اللعبة، وليست تقييمًا حقيقيًا للشخص": [
    "Professional skills are in-game estimates, not a real assessment of the person",
    "Les compétences professionnelles sont des estimations du jeu, pas une évaluation réelle de la personne",
  ],
  "أهلًا بك في مكتبك": [
    "Welcome to your office",
    "Bienvenue dans votre bureau",
  ],
  "الصورة الكاملة لناديك. والقرار القادم في إيدك": [
    "The full picture of your club — and the next decision is yours",
    "La vue d’ensemble de votre club — et la prochaine décision vous appartient",
  ],
  "الدوري المحلي": ["Domestic league", "Championnat national"],
  "الأحداث المهمة هنا. مفيش قرار كبير هيفوتك": [
    "The important events are here. No big decision will slip past you",
    "Les événements importants sont ici. Aucune grande décision ne vous échappera",
  ],
  "الرسائل الجديدة هتظهر أول ما توصل": [
    "New messages will appear as soon as they arrive",
    "Les nouveaux messages apparaîtront dès leur arrivée",
  ],
  "اختار قسم أو رسالة لعرض التفاصيل": [
    "Choose a section or a message to see the details",
    "Choisissez une rubrique ou un message pour voir les détails",
  ],
  "آخر موعد": ["Deadline", "Échéance"],
  "حافظ على مشوارك، واضبط إيقاع العالم": [
    "Protect your career and set the world’s pace",
    "Protégez votre carrière et réglez le rythme du monde",
  ],
  "القاعدة الكبيرة محفوظة محليًا في IndexedDB، وليست على السحابة. صدّر نسخة احتياطية دوريًا، ولا تمسح بيانات الموقع":
    [
      "The large database is stored locally in IndexedDB, not in the cloud. Export a backup regularly and do not clear the site data",
      "La grande base est stockée localement dans IndexedDB, pas dans le cloud. Exportez régulièrement une sauvegarde et n’effacez pas les données du site",
    ],
  "اختر البلد والدرجة والنادي أدناه": [
    "Choose the country, division and club below",
    "Choisissez le pays, la division et le club ci-dessous",
  ],
  "٤ أندية في النمط القديم": [
    "4 clubs in the legacy mode",
    "4 clubs dans le mode classique",
  ],
  سوق: ["market", "marché"],
  تجريبي: ["trial", "d’essai"],
  "العروض تختلف في القيمة والحصرية، وتشمل كلها مكافآت الأداء الموحدة. يمكنك التفاوض على زيادة ١٠–٣٠٪؛ القبول يعتمد على سمعة ناديك وثقة الصحافة، والطمع قد يفقدك الراعي":
    [
      "Offers differ in value and exclusivity and all include the standard performance bonuses. You can negotiate a 10–30% increase; acceptance depends on your club’s reputation and press confidence, and greed can cost you the sponsor",
      "Les offres diffèrent par la valeur et l’exclusivité et incluent toutes les primes de performance standard. Vous pouvez négocier une hausse de 10 à 30 % ; l’acceptation dépend de la réputation du club et de la confiance de la presse, et la gourmandise peut vous coûter le sponsor",
    ],
  "القبول الفوري يحتاج سمعة أعلى كلما زاد طلبك؛ غير ذلك يعرض الراعي حلًا وسطًا أو ينسحب":
    [
      "Instant acceptance needs a higher reputation the more you ask; otherwise the sponsor offers a compromise or withdraws",
      "L’acceptation immédiate exige une réputation d’autant plus élevée que vous demandez ; sinon le sponsor propose un compromis ou se retire",
    ],
  "نافس محليًا، وابحث عن فرص في الأسواق اللي اخترتها": [
    "Compete at home and look for opportunities in the markets you chose",
    "Rivalisez chez vous et cherchez des opportunités dans les marchés choisis",
  ],
  "المواعيد والفرق والقواعد هنا إعداد اختبار وليست الموسم المصري الحقيقي. المحرك الحالي يحاكي النتائج والتذاكر والجاهزية؛ التكتيك المباشر والصعود والهبوط لم تُفعّل بعد. يبدأ جدول تجريبي جديد أول يوليو بعد اكتمال الجدول السابق":
    [
      "Dates, teams and rules here are a test set-up, not the real Egyptian season. The current engine simulates results, tickets and fitness; direct tactics and promotion/relegation are not active yet. A new trial schedule starts on 1 July once the previous one is complete",
      "Dates, équipes et règles sont une configuration de test, pas la vraie saison égyptienne. Le moteur actuel simule résultats, billetterie et forme ; tactique directe et montées/descentes ne sont pas encore actives. Un nouveau calendrier d’essai commence le 1er juillet une fois le précédent terminé",
    ],
  "اللعبة مفتوحة من الشاشة الرئيسية": [
    "The game is open from the home screen",
    "Le jeu est ouvert depuis l’écran d’accueil",
  ],
  "ضيف اللعبة لشاشتك الرئيسية": [
    "Add the game to your home screen",
    "Ajoutez le jeu à votre écran d’accueil",
  ],

  // data/*.json display strings (Egyptian pyramid divisions, coverage notes, Saudi second tier)
  "دوري المحترفين — القسم الثاني أ": [
    "Professional League — Second Division A",
    "Ligue professionnelle — Deuxième division A",
  ],
  "القسم الثاني ب — الصعيد أ": [
    "Second Division B — Upper Egypt A",
    "Deuxième division B — Haute-Égypte A",
  ],
  "القسم الثاني ب — الصعيد ب": [
    "Second Division B — Upper Egypt B",
    "Deuxième division B — Haute-Égypte B",
  ],
  "القسم الثاني ب — القاهرة والجيزة": [
    "Second Division B — Cairo & Giza",
    "Deuxième division B — Le Caire et Gizeh",
  ],
  "القسم الثاني ب — القناة والدلتا": [
    "Second Division B — Canal & Delta",
    "Deuxième division B — Canal et Delta",
  ],
  "القسم الثاني ب — بحري": [
    "Second Division B — Bahari (Lower Egypt)",
    "Deuxième division B — Bahari (Basse-Égypte)",
  ],
  "دوري يلو": ["Yelo League", "Yelo League"],
  "الأولى ثم الثانية أ ثم خمس مجموعات الثانية ب؛ ملاحق الصعود المجمعة محفوظة. ليست الدرجة الثالثة المسماة (المستوى الرابع)":
    [
      "Premier League, then Second Division A, then the five Second Division B groups; the pooled promotion play-offs are kept. Not the so-called Third Division (fourth tier)",
      "Première division, puis Deuxième division A, puis les cinq groupes de Deuxième division B ; les barrages de montée groupés sont conservés. Pas la « Troisième division » (quatrième niveau)",
    ],
  "الصعود والتقويم محاكاة مبسطة؛ ليست كل الملاحق ولوائح الترخيص الرسمية مطبقة":
    [
      "Promotion and the calendar are a simplified simulation; not every play-off or official licensing rule is applied",
      "Montée et calendrier sont une simulation simplifiée ; tous les barrages et règles de licence officielles ne sont pas appliqués",
    ],
  "الدوري الأعلى فقط باتفاق النطاق؛ إضافة الدرجة الثانية مستبعدة وليست عملًا متبقيًا":
    [
      "Top flight only by scope agreement; adding the second tier is excluded, not pending work",
      "Élite seulement par accord de périmètre ; l’ajout de la deuxième division est exclu, pas un travail en attente",
    ],
  "USL Championship مسار ثانٍ مستقل؛ لا صعود تلقائي إلى MLS. المؤتمران موجودان، دون محاكاة ملحق البطل الرسمي":
    [
      "USL Championship is a separate second track; no automatic promotion to MLS. Both conferences exist, without the official championship play-off",
      "L’USL Championship est une deuxième voie distincte ; pas de montée automatique en MLS. Les deux conférences existent, sans le barrage officiel du titre",
    ],
  "Liga de Expansión MX موجودة؛ الصعود التلقائي إلى Liga MX مغلق في السيناريو إلى حين تنفيذ أهلية وترخيص الاتحاد":
    [
      "Liga de Expansión MX exists; automatic promotion to Liga MX is closed in the scenario until the federation’s eligibility and licensing are implemented",
      "La Liga de Expansión MX existe ; la montée automatique en Liga MX est fermée dans le scénario jusqu’à la mise en œuvre de l’éligibilité et des licences fédérales",
    ],
  "Australian Championship بطولة وطنية من 16 فريقًا في مرجع 2026، ممثلة بجدول دوري مبسط؛ لا صعود تلقائي إلى A-League":
    [
      "The Australian Championship is a 16-team national competition in the 2026 reference, represented by a simplified league table; no automatic promotion to the A-League",
      "L’Australian Championship est une compétition nationale à 16 équipes dans la référence 2026, représentée par un classement simplifié ; pas de montée automatique en A-League",
    ],
  // settings/setup 0.19 labels
  "الإنجليزية والفرنسية تغطيان كل الشاشات والرسائل والتقارير المولّدة داخل اللعبة؛ ما تكتبه أنت (اسم المالك) يبقى كما هو":
    [
      "English and French cover every screen, message and report generated in the game; what you type yourself (the owner name) stays as written",
      "L’anglais et le français couvrent tous les écrans, messages et rapports générés dans le jeu ; ce que vous saisissez (le nom du propriétaire) reste tel quel",
    ],
};
