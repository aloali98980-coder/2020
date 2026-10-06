// 0.19 — screen chrome, forms, cards and toasts (Arabic source phrase -> [English, French]).
// Fragments that surround interpolated numbers/names are translated as fragments on purpose:
// the DOM walker sees them as separate text runs around the dynamic values.
export const UI_PHRASES = {
  // main.js — toasts, confirmations, dialogs
  "أيام. الوقت متوقف لقرارك": [
    "days. Time is paused for your decision",
    "jours. Le temps est en pause pour votre décision",
  ],
  "فيه قرار مهم محتاج ردك قبل تمرير الوقت": [
    "An important decision needs your answer before time can move on",
    "Une décision importante attend votre réponse avant de faire avancer le temps",
  ],
  "توقفت المحاكاة بعد المباراة. النتيجة في بريدك": [
    "Simulation paused after the match. The result is in your inbox",
    "Simulation en pause après le match. Le résultat est dans votre boîte de réception",
  ],
  "وحفظ اللعبة": ["and the game was saved", "et la partie a été sauvegardée"],
  "نسخة احتياطية سليمة": ["Backup is valid", "Sauvegarde de secours valide"],
  "استيراد الحفظة؟": ["Import this save?", "Importer cette sauvegarde ?"],
  "سيتم استبدال الحفظة النشطة على هذا المتصفح. صدّر الحالية أولًا لو محتاجها": [
    "The active save on this browser will be replaced. Export the current one first if you need it",
    "La sauvegarde active de ce navigateur sera remplacée. Exportez d’abord l’actuelle si vous en avez besoin",
  ],
  "تعذر الاستيراد": ["Import failed", "Importation impossible"],
  "لم يتم الخصم. لا يشمل المبلغ عقد اللاعب أو الوكيل": [
    "Nothing was charged. The amount excludes the player’s contract and the agent",
    "Rien n’a été débité. Le montant n’inclut ni le contrat du joueur ni l’agent",
  ],
  يشمل: ["includes", "inclut"],
  "تم إنهاء عقد الأسطورة": [
    "Legend contract terminated",
    "Contrat de légende résilié",
  ],
  "تم تسجيل قرارك": [
    "Your decision has been recorded",
    "Votre décision a été enregistrée",
  ],
  "تعويض الإنهاء: شهران من المرتب": [
    "Termination compensation: two months’ salary",
    "Indemnité de résiliation : deux mois de salaire",
  ],
  "أهلًا بيك. مشروعك بدأ، والحفظ التلقائي شغال": [
    "Welcome. Your project has started and autosave is on",
    "Bienvenue. Votre projet démarre et la sauvegarde automatique est active",
  ],
  "تم تعليم كل الرسائل كمقروءة. القرارات المطلوبة ما زالت نشطة": [
    "All messages marked as read. Pending decisions stay active",
    "Tous les messages sont marqués comme lus. Les décisions en attente restent actives",
  ],
  "راجع التمويل، ثم عُد للبريد لتأكيد التعامل مع تنبيه السيولة": [
    "Review the financing, then return to the inbox to confirm how you handle the liquidity alert",
    "Examinez le financement, puis revenez à la boîte de réception pour confirmer la gestion de l’alerte de trésorerie",
  ],
  "تم الاتفاق مع النادي. باقي عقد اللاعب": [
    "Agreed with the club. The player’s contract remains",
    "Accord trouvé avec le club. Reste le contrat du joueur",
  ],
  "تم إنهاء التفاوض بدون خصم أموال": [
    "Negotiation closed without any charge",
    "Négociation close sans aucun débit",
  ],
  "تم تحديث طاقم المنشأة": [
    "Facility staff updated",
    "Personnel de l’installation mis à jour",
  ],
  "عقد ٣٦٠ يومًا بقيمة": [
    "360-day contract worth",
    "Contrat de 360 jours d’une valeur de",
  ],
  "ج.م، ومقدم": ["EGP, with an advance of", "EGP, avec une avance de"],
  "ج.م. تشمل مكافآت أداء موحدة تُصرف تلقائيًا": [
    "EGP. Includes standard performance bonuses paid automatically",
    "EGP. Comprend des primes de performance standard versées automatiquement",
  ],
  "سيتم حجز": ["will be reserved", "sera réservé"],
  "طوال مدة العقد": [
    "for the whole contract term",
    "pendant toute la durée du contrat",
  ],
  "الباقي على ١١ دفعة متساوية تقريبًا كل ٣٠ يومًا. الفسخ المبكر غير متاح في هذه النسخة":
    [
      "The rest comes in 11 roughly equal instalments every 30 days. Early termination is not available in this version",
      "Le reste est versé en 11 mensualités à peu près égales tous les 30 jours. La résiliation anticipée n’est pas disponible dans cette version",
    ],
  "تم توقيع الرعاية وإيداع المقدم في الخزينة": [
    "Sponsorship signed; the advance is in the treasury",
    "Sponsoring signé ; l’avance est dans la trésorerie",
  ],
  "تم توقيع الرعاية بالقيمة المتفاوض عليها وإيداع المقدم": [
    "Sponsorship signed at the negotiated value; advance deposited",
    "Sponsoring signé à la valeur négociée ; avance déposée",
  ],
  "مساحة أكبر للسيولة… والتزام جديد": [
    "More room for liquidity… and a new commitment",
    "Plus de marge de trésorerie… et un nouvel engagement",
  ],
  "المبلغ المستلم": ["Amount received", "Montant reçu"],
  "٥ ملايين ج.م": ["EGP 5 million", "5 millions EGP"],
  "إجمالي السداد": ["Total repayment", "Remboursement total"],
  "٥٫٤ مليون ج.م": ["EGP 5.4 million", "5,4 millions EGP"],
  "الدفعة كل ٣٠ يومًا": [
    "Instalment every 30 days",
    "Mensualité tous les 30 jours",
  ],
  "١٢ دفعة تشمل تكلفة تمويل ثابتة ٤٠٠ ألف جنيه. حد أقصى قرضان خلال الحفظة التجريبية. لا يتضمن نموذج فائدة مركبة أو شروط بنك حقيقي":
    [
      "12 instalments including a fixed financing cost of EGP 400k. At most two loans per trial save. No compound-interest model or real bank terms",
      "12 mensualités incluant un coût de financement fixe de 400 k EGP. Deux prêts au maximum par sauvegarde d’essai. Pas de modèle d’intérêts composés ni de conditions bancaires réelles",
    ],
  "تم إيداع التمويل وجدولة الأقساط": [
    "Financing deposited and instalments scheduled",
    "Financement déposé et mensualités planifiées",
  ],
  "السعر الأعلى يرفع العائد لكل مشجع، لكنه يقلل الطلب. المقصورة أقل تأثرًا بالغلاء من العادية. أصحاب الاشتراكات يشغلون مقاعد العادية أولًا ولا يُحصّلون مرتين":
    [
      "A higher price raises revenue per fan but lowers demand. Boxes are less price-sensitive than standard seats. Season-ticket holders fill standard seats first and are never charged twice",
      "Un prix plus élevé augmente la recette par supporter mais réduit la demande. Les loges sont moins sensibles au prix que les places standard. Les abonnés occupent d’abord les places standard et ne paient jamais deux fois",
    ],
  "العادية (70٪ من السعة": [
    "Standard (70% of capacity",
    "Standard (70 % de la capacité",
  ],
  "الأولى (20٪ · 40–2000": [
    "Premium (20% · 40–2000",
    "Première (20 % · 40–2000",
  ],
  "المقصورة (10٪ · 100–5000": [
    "Boxes (10% · 100–5000",
    "Loges (10 % · 100–5000",
  ],
  "علاوة المباراة البيتية القادمة": [
    "Next home match surcharge",
    "Majoration du prochain match à domicile",
  ],
  "بدون علاوة": ["No surcharge", "Sans majoration"],
  "+١٠٠٪ ديربي ناري": ["+100% heated derby", "+100 % derby brûlant"],
  "حفظ أسعار التذاكر": [
    "Save ticket prices",
    "Enregistrer les prix des billets",
  ],
  "تم تجهيز ملف الحفظ للتنزيل": [
    "Save file ready to download",
    "Fichier de sauvegarde prêt à télécharger",
  ],
  "تم استيراد الحفظة": ["Save imported", "Sauvegarde importée"],
  "تبدأ حكاية جديدة؟": [
    "Start a new story?",
    "Commencer une nouvelle histoire ?",
  ],
  "الحفظة الجديدة هتستبدل الحالية عند بدء اللعب. صدّر الحالية لو حابب ترجع لها":
    [
      "The new save will replace the current one when play starts. Export the current one if you want to come back to it",
      "La nouvelle sauvegarde remplacera l’actuelle au début de la partie. Exportez l’actuelle si vous voulez y revenir",
    ],
  "العرض اتبعت. مرّر يومًا عشان يوصلك الرد": [
    "Offer sent. Advance a day to receive the reply",
    "Offre envoyée. Passez une journée pour recevoir la réponse",
  ],
  "تم توقيع العقد وتحديث السجل المالي": [
    "Contract signed and the ledger updated",
    "Contrat signé et registre financier mis à jour",
  ],
  "تم توقيع عقد الأسطورة": [
    "Legend contract signed",
    "Contrat de légende signé",
  ],
  "تم تجديد عقد الأسطورة": [
    "Legend contract renewed",
    "Contrat de légende renouvelé",
  ],
  "تم تجديد عقد المدرب": [
    "Head coach contract renewed",
    "Contrat de l’entraîneur renouvelé",
  ],
  "تم تعيين المدرب الجديد": [
    "New head coach appointed",
    "Nouvel entraîneur nommé",
  ],
  "المشروع بدأ. موعد الاستلام واتفاق الدفع في البريد": [
    "Project started. Delivery date and payment terms are in your inbox",
    "Projet lancé. Date de livraison et modalités de paiement dans votre boîte de réception",
  ],
  "السعر من ٥٠ إلى ٥٠٠ جنيه": [
    "Price between EGP 50 and 500",
    "Prix entre 50 et 500 EGP",
  ],
  "تم اعتماد أسعار الفئات والعلاوة للمباريات القادمة": [
    "Category prices and surcharge approved for the coming matches",
    "Prix des catégories et majoration validés pour les prochains matchs",
  ],
  "لا تتوفر قوائم للبدء في هذا البلد": [
    "No squads are available to start in this country",
    "Aucun effectif disponible pour démarrer dans ce pays",
  ],
  "هذه الدرجة غير متاحة": [
    "This division is not available",
    "Cette division n’est pas disponible",
  ],
  "تم حفظ إعداد وضع الأساطير": [
    "Legends mode setting saved",
    "Réglage du mode légendes enregistré",
  ],
  "تم حفظ إعداد المحاكاة": [
    "Simulation setting saved",
    "Réglage de simulation enregistré",
  ],
  "جارٍ فتح الحفظة…": ["Opening the save…", "Ouverture de la sauvegarde…"],
  "تم استرجاع النسخة الاحتياطية بعد تعذر قراءة الحفظ الأساسي": [
    "Backup restored because the main save could not be read",
    "Sauvegarde de secours restaurée car la sauvegarde principale était illisible",
  ],
  "الحفظة غير سليمة": ["The save is invalid", "La sauvegarde est invalide"],
  "تعذر الوصول للتخزين المحلي. افتح الرابط خارج الوضع الخاص واسمح ببيانات الموقع":
    [
      "Local storage is unavailable. Open the link outside private mode and allow site data",
      "Stockage local inaccessible. Ouvrez le lien hors navigation privée et autorisez les données du site",
    ],

  // expanded.js — expanded world hub
  "هذه الأنظمة تتطلب حفظة جديدة مع تفعيل «العالم الموسع»؛ الحفظات السابقة محفوظة دون تغيير منافساتها":
    [
      "These systems need a new save with “Expanded world” enabled; older saves keep their competitions unchanged",
      "Ces systèmes exigent une nouvelle sauvegarde avec « Monde étendu » activé ; les anciennes sauvegardes gardent leurs compétitions inchangées",
    ],
  "طريقة المشوار": ["Career mode", "Mode de carrière"],
  "نظام العالم": ["World system", "Système du monde"],
  "المنافسة التجريبية القديمة": [
    "Legacy trial competition",
    "Ancienne compétition d’essai",
  ],
  "عالم موسع 0.20 — اقتصاد وبطولات وأساطير ومسيرة طويلة": [
    "Expanded world 0.20 — economy, competitions, legends and long careers",
    "Monde étendu 0.20 — économie, compétitions, légendes et longues carrières",
  ],
  الدرجة: ["Division", "Division"],
  "تذاكر ومتجر": ["Tickets & shop", "Billetterie et boutique"],
  "التذكرة العادية": ["Standard ticket", "Billet standard"],
  "قميص النادي": ["Club shirt", "Maillot du club"],
  "اعتماد الأسعار": ["Apply prices", "Valider les prix"],
  "توقع الحضور": ["Expected attendance", "Affluence attendue"],
  "إيراد أساسي متوقع": ["Expected base revenue", "Recette de base attendue"],
  المشتركون: ["Season-ticket holders", "Abonnés"],
  "يُخصمون من المقاعد المدفوعة بكل مباراة": [
    "deducted from paid seats at every match",
    "déduits des places payantes à chaque match",
  ],
  "الدوري فقط، دون الكؤوس. حجز حتى 18٪ من السعة مرة واحدة بالموسم؛ لخمسة لقاءات متبقية على الأقل":
    [
      "League only, no cups. Reserve up to 18% of capacity once per season, with at least five home fixtures left",
      "Championnat seulement, sans les coupes. Réservation jusqu’à 18 % de la capacité une fois par saison, avec au moins cinq rencontres restantes",
    ],
  "مخزون المتجر": ["Shop stock", "Stock de la boutique"],
  "قميصًا · تكلفة الوحدة": ["shirts · unit cost", "maillots · coût unitaire"],
  "كمية الشراء": ["Purchase quantity", "Quantité à acheter"],
  "شراء المخزون": ["Buy stock", "Acheter du stock"],
  "ودية تجارية": ["Commercial friendly", "Match amical commercial"],
  "تكلفة 120 ألفًا · دخل متوقع": [
    "Cost 120k · expected income",
    "Coût 120 k · recette attendue",
  ],
  "إجهاد 8 نقاط. مرة كل 30 يومًا وبعيدًا عن موعد رسمي بثلاثة أيام": [
    "8 fatigue points. Once every 30 days and three days clear of any official fixture",
    "8 points de fatigue. Une fois tous les 30 jours et à trois jours de tout match officiel",
  ],
  "أنشطة المؤسسة": ["Club ventures", "Activités du club"],
  يعمل: ["Running", "En activité"],
  "فتح النشاط": ["Open venture", "Lancer l’activité"],
  "التسوية الشهرية للأنشطة": [
    "Monthly venture settlement",
    "Règlement mensuel des activités",
  ],
  "تظهر بعد أول تسوية": [
    "Shown after the first settlement",
    "Affiché après le premier règlement",
  ],
  كفاءة: ["Efficiency", "Efficacité"],
  "راتب شهري": ["Monthly salary", "Salaire mensuel"],
  "سنة واحدة": ["One year", "Un an"],
  سنتان: ["Two years", "Deux ans"],
  "التعويض عند الإقالة شهران عن كل سنة متبقية. انتهاء العقد دون تجديد يُخلي المنصب تلقائيًا":
    [
      "Dismissal pays two months per remaining year. A contract that ends without renewal vacates the post automatically",
      "Le licenciement coûte deux mois par année restante. Un contrat arrivé à terme sans renouvellement libère le poste automatiquement",
    ],
  "المدرب الحالي": ["Current head coach", "Entraîneur actuel"],
  الأجر: ["Pay", "Rémunération"],
  "ج.م. شهريًا · ثقة": ["EGP per month · trust", "EGP par mois · confiance"],
  "تعيين — توقيع شهر + فسخ السابق": [
    "Appoint — one month signing fee + previous coach’s severance",
    "Nommer — prime d’un mois + indemnité du prédécesseur",
  ],
  "الخطة والتشكيل": ["Plan & line-up", "Plan et composition"],
  "التشكيل الفارغ يفوّض الأفضل للمدرب. الاختيار اليدوي يؤثر على القوة والمشاركة؛ غير المتاح دوليًا أو للإصابة يُستبعد":
    [
      "An empty line-up lets the coach pick the best. Manual picks affect strength and playing time; players away on international duty or injured are excluded",
      "Une composition vide laisse l’entraîneur choisir les meilleurs. Les choix manuels influent sur la force et le temps de jeu ; les joueurs en sélection ou blessés sont exclus",
    ],
  "/ 11 مختارين — التشكيل أقل من 11 يُستكمل آليًا": [
    "/ 11 selected — a line-up short of 11 is completed automatically",
    "/ 11 sélectionnés — une composition incomplète est complétée automatiquement",
  ],
  "مع المنتخب": ["On international duty", "En sélection"],
  مصاب: ["Injured", "Blessé"],
  "عروض شراء لاعبيك": ["Offers for your players", "Offres pour vos joueurs"],
  موافقة: ["Accept", "Accepter"],
  رفض: ["Decline", "Refuser"],
  "تصل عروض نموذجية منتصف الشهر. لا بيع دون موافقتك": [
    "Model offers arrive mid-month. Nothing is sold without your approval",
    "Des offres types arrivent à la mi-mois. Aucune vente sans votre accord",
  ],
  "إعارة تطويرية / تقرير كشف": [
    "Development loan / scouting report",
    "Prêt de formation / rapport de recrutement",
  ],
  "اختيار سريع لشباب السوق؛ بقية اللاعبين من ملفاتهم. الإعارة الآن عرض ثم رد وموافقة. التقرير 10 آلاف ويعرض نطاق إمكانات":
    [
      "Quick pick from young players on the market; others from their profiles. A loan is now an offer, a reply and an approval. A report costs 10k and shows a potential range",
      "Sélection rapide parmi les jeunes du marché ; les autres depuis leur fiche. Le prêt passe désormais par offre, réponse et accord. Le rapport coûte 10 k et indique une fourchette de potentiel",
    ],
  "مصداقية الإدارة": ["Board credibility", "Crédibilité de la direction"],
  "الدعم: ثقة المدرب +5 والجماهير +1. المطالبة: الجماهير +2 ووعد بإنهاء الموسم في النصف الأعلى. عدم التعليق بلا مكافأة":
    [
      "Backing: coach trust +5, fans +1. Demanding: fans +2 and a promise to finish in the top half. No comment: no reward",
      "Soutien : confiance de l’entraîneur +5, supporters +1. Exigence : supporters +2 et promesse de finir dans la première moitié. Sans commentaire : aucune récompense",
    ],
  "دعم المدرب": ["Back the coach", "Soutenir l’entraîneur"],
  "وعد بالنصف الأعلى": [
    "Promise a top-half finish",
    "Promettre la première moitié",
  ],
  "لا تعليق": ["No comment", "Sans commentaire"],
  "سجل الوعود": ["Promise log", "Registre des promesses"],
  تحقق: ["Kept", "Tenue"],
  "لم يتحقق": ["Broken", "Non tenue"],
  "قيد المتابعة": ["In progress", "En cours"],
  "لا وعود مسجلة": ["No promises recorded", "Aucune promesse enregistrée"],
  "ملخص الصحافة": ["Press digest", "Revue de presse"],
  "تظهر الأخبار مع تقدم الوقت": [
    "News appears as time moves on",
    "Les nouvelles apparaissent au fil du temps",
  ],
  "قواعد النسخة وحدود محاكاة البطولات ↗": [
    "Version rules and competition simulation limits ↗",
    "Règles de la version et limites de simulation des compétitions ↗",
  ],
  أندية: ["clubs", "clubs"],
  "مباراة لكل نادٍ": ["matches per club", "matchs par club"],
  "مباريات ناديك في الدوري": [
    "Your club’s league fixtures",
    "Matchs de championnat de votre club",
  ],
  "اختر دوري ناديك": [
    "Choose your club’s league",
    "Choisissez le championnat de votre club",
  ],
  "أوروبا — الدوري وطريق اللقب": [
    "Europe — league phase and the road to the title",
    "Europe — phase de ligue et route vers le titre",
  ],
  "أفريقيا وأمريكا الجنوبية والكؤوس المحلية والسوبر": [
    "Africa, South America, domestic cups and super cups",
    "Afrique, Amérique du Sud, coupes nationales et supercoupes",
  ],
  "آسيا — ثلاث بطولات ومسارات التأهل": [
    "Asia — three competitions and qualification paths",
    "Asie — trois compétitions et parcours de qualification",
  ],
  "كونكاكاف — كأس الأبطال والبطولات الإقليمية": [
    "Concacaf — Champions Cup and regional tournaments",
    "Concacaf — Coupe des champions et tournois régionaux",
  ],
  "كأس العالم والإنتركونتيننتال": [
    "Club World Cup and Intercontinental",
    "Coupe du monde des clubs et Intercontinentale",
  ],
  "الكؤوس الأخرى — صيغ مبسطة": [
    "Other cups — simplified formats",
    "Autres coupes — formats simplifiés",
  ],
  متبقٍ: ["remaining", "restant"],
  "الجولة القادمة": ["Next round", "Prochaine journée"],
  "ناديك مشارك": ["Your club takes part", "Votre club participe"],
  "ناديك غير مشارك": [
    "Your club is not involved",
    "Votre club ne participe pas",
  ],
  "ذهاب وإياب — متأهل واحد": [
    "Two legs — one qualifier",
    "Aller-retour — un qualifié",
  ],
  "دور واحد — متأهلان؛ ملاعب محايدة في النموذج": [
    "Single round — two qualifiers; neutral venues in the model",
    "Tour unique — deux qualifiés ; terrains neutres dans le modèle",
  ],
  مباراة: ["match", "match"],
  "مصر: ثلاثة مقاعد بين الممتاز والثانية أ في هذا السيناريو؛ الثانية ب تعتمد الملحق. توزيع الهابطين على المجموعات يحافظ على أحجامها وليس قرعة جغرافية رسمية. في نظام 0.8 يصعد مؤهل من كل مجموعة غير مصرية ثم أفضل التاليين بالنقاط لكل مباراة إذا بقيت مقاعد. الاحتياط لا يتجاوز سقفه أو فريقه الأول؛ عند الحد الأدنى غير المحاكى يُلغى التبادل المخالف بدل اختراع بديل. لا هبوط من الثانية ب لغياب مستوى رابع موثق. التعادل الكامل يحسم بالهوية الثابتة، لا مباراة فاصلة":
    [
      "Egypt: three places between the Premier League and Second Division A in this scenario; Second Division B relies on play-offs. Relegated clubs are spread across groups to keep group sizes, not by an official geographic draw. In the 0.8 system one qualifier goes up from each non-Egyptian group, then the best runners-up by points per match if places remain. Reserve teams never pass their ceiling or their first team; at an unsimulated minimum the offending swap is cancelled rather than inventing a substitute. No relegation from Second Division B because no documented fourth tier exists. A perfect tie is settled by fixed identity, not a play-off",
      "Égypte : trois places entre la Premier League et la Deuxième division A dans ce scénario ; la Deuxième division B passe par des barrages. Les relégués sont répartis entre les groupes pour conserver leur taille, sans tirage géographique officiel. Dans le système 0.8, un qualifié monte de chaque groupe non égyptien, puis les meilleurs suivants aux points par match s’il reste des places. Les réserves ne dépassent jamais leur plafond ni leur équipe première ; à un minimum non simulé, l’échange fautif est annulé plutôt qu’un remplaçant inventé. Pas de relégation depuis la Deuxième division B faute de quatrième niveau documenté. Une égalité parfaite est tranchée par identité fixe, sans match d’appui",
    ],
  "المواسم السابقة": ["Previous seasons", "Saisons précédentes"],
  "يظهر الأرشيف بعد اكتمال أول موسم": [
    "The archive appears after the first full season",
    "Les archives apparaissent après la première saison complète",
  ],
  "آخر انتقالات أندية الكمبيوتر": [
    "Latest AI club transfers",
    "Derniers transferts des clubs IA",
  ],
  "تُعالج شهريًا ضمن ميزانيات مبسطة": [
    "processed monthly within simplified budgets",
    "traités chaque mois dans des budgets simplifiés",
  ],

  // legends.js (screen)
  سرعة: ["Pace", "Vitesse"],
  تسديد: ["Shooting", "Tir"],
  تمرير: ["Passing", "Passe"],
  دفاع: ["Defending", "Défense"],
  لياقة: ["Fitness", "Condition"],
  قرارات: ["Decisions", "Décisions"],
  "تقدير الذروة": ["Peak estimate", "Estimation du pic"],
  تخصص: ["Specialty", "Spécialité"],
  يستفيد: ["benefits", "en profitent"],
  لاعبًا: ["players", "joueurs"],
  "قوة التأثير": ["Impact strength", "Force d’impact"],
  "٪ · إضافة قوة المباراة +": [
    "% · match strength bonus +",
    "% · bonus de force en match +",
  ],
  "جلسات منفذة": ["Sessions delivered", "Séances réalisées"],
  "نقاط سمات مكتسبة": ["Attribute points gained", "Points d’attributs gagnés"],
  "سمعة +٠٫١٥ وجماهير +١ شهريًا · دخل حقوق صورة متراكم": [
    "Reputation +0.15 and fans +1 per month · accumulated image-rights income",
    "Réputation +0,15 et supporters +1 par mois · revenus de droits à l’image cumulés",
  ],
  "عودة كلاعب: تقييم": [
    "Comeback as a player: rating",
    "Retour comme joueur : note",
  ],
  "هدف · لياقة": ["goals · fitness", "buts · condition"],
  "عقده يُدار من شاشة الفريق كأي لاعب؛ عند انتهائه يعتزل ويدخل قاعة الإرث": [
    "His contract is managed from the squad screen like any player; when it ends he retires into the Hall of Legacy",
    "Son contrat se gère depuis l’écran de l’équipe comme tout joueur ; à son terme, il prend sa retraite et entre au Panthéon",
  ],
  حتى: ["until", "jusqu’au"],
  "ج.م · مقدم مدفوع": ["EGP · advance paid", "EGP · avance versée"],
  الدولة: ["Country", "Pays"],
  التخصص: ["Specialty", "Spécialité"],
  الفئة: ["Category", "Catégorie"],
  "أساطير حقيقية": ["Real legends", "Vraies légendes"],
  "بأدوار حقيقية داخل ناديك": [
    "in real roles inside your club",
    "avec de vrais rôles dans votre club",
  ],
  "حارس أسطوري يدرّب حراسك، ومهاجم تاريخي يرفع إنهاء مهاجميك شهرًا بعد شهر ويبطئ تراجعهم مع العمر، وسفير يجلب سمعة ودخلًا. الأسماء حقيقية؛ التقييمات والأرقام المالية تقديرات تحريرية للعبة":
    [
      "A legendary keeper coaches your goalkeepers, a historic striker improves your forwards’ finishing month after month and slows their decline with age, and an ambassador brings reputation and income. The names are real; ratings and money figures are editorial game estimates",
      "Un gardien légendaire entraîne vos gardiens, un attaquant historique améliore la finition de vos attaquants mois après mois et ralentit leur déclin, et un ambassadeur apporte réputation et revenus. Les noms sont réels ; notes et montants sont des estimations éditoriales du jeu",
    ],
  "وضع عودة الأساطير كلاعبين (خيالي": [
    "Legends comeback mode (fantasy",
    "Mode retour des légendes comme joueurs (fictif",
  ],
  "عند التفعيل يمكن التعاقد مع أسطورة لتلعب لك بعمر ٣١ (حراس ٣٤) بقدرات قريبة من ذروتها؛ بحد أقصى":
    [
      "When enabled you can sign a legend to play for you at age 31 (keepers 34) with near-peak ability; at most",
      "Une fois activé, vous pouvez engager une légende pour jouer à 31 ans (gardiens 34) avec des qualités proches de son pic ; au maximum",
    ],
  "رواتب الأساطير شهريًا (ج.م": [
    "Legend salaries per month (EGP",
    "Salaires mensuels des légendes (EGP",
  ],
  "لا توجد عقود أساطير بعد": [
    "No legend contracts yet",
    "Aucun contrat de légende pour l’instant",
  ],
  "اختر أسطورة من الكتالوج أدناه؛ المقدم كبير لكن الأثر شهري ومستمر": [
    "Pick a legend from the catalogue below; the advance is large but the effect is monthly and lasting",
    "Choisissez une légende dans le catalogue ci-dessous ; l’avance est élevée mais l’effet est mensuel et durable",
  ],
  "الجدار ما زال فارغًا": ["The wall is still empty", "Le mur est encore vide"],
  "أي لاعب يعتزل في ناديك بعد ١٠٠ مباراة أو ٤٠ هدفًا أو بتقييم ٨٥+ يدخل هنا تلقائيًا، وكذلك كل أسطورة عادت ولعبت لك":
    [
      "Any player who retires at your club after 100 matches, 40 goals or with an 85+ rating enters here automatically, as does every legend who came back and played for you",
      "Tout joueur qui prend sa retraite dans votre club après 100 matchs, 40 buts ou avec une note de 85+ entre ici automatiquement, ainsi que toute légende revenue jouer pour vous",
    ],
  "الأسطورة غير موجودة": ["Legend not found", "Légende introuvable"],
  مواليد: ["Born", "Né en"],
  "ذروة تقديرية": ["Estimated peak", "Pic estimé"],
  "التقييم والسمات تقدير تحريري لأغراض اللعبة": [
    "Rating and attributes are an editorial estimate for game purposes",
    "Note et attributs sont une estimation éditoriale à des fins de jeu",
  ],
  "السيرة على ويكيبيديا": [
    "Biography on Wikipedia",
    "Biographie sur Wikipédia",
  ],
  "٪: فرصة جلسة شهرية لكل لاعب في المجموعة": [
    "%: chance of a monthly session for each player in the group",
    "% : chance d’une séance mensuelle pour chaque joueur du groupe",
  ],
  "٪ بمكسب": ["% with a gain of", "% avec un gain de"],
  في: ["in", "en"],
  "بطء التراجع العمري ١٢٪ · +": [
    "Age decline slowed 12% · +",
    "Déclin lié à l’âge ralenti de 12 % · +",
  ],
  "قوة مباراة": ["match strength", "force en match"],
  "دخل حقوق صورة شهري تقديري": [
    "Estimated monthly image-rights income",
    "Revenu mensuel estimé des droits à l’image",
  ],
  "ج.م مقابل الراتب، مع سمعة +٠٫١٥ وجماهير +١ شهريًا": [
    "EGP against the salary, plus reputation +0.15 and fans +1 per month",
    "EGP contre le salaire, plus réputation +0,15 et supporters +1 par mois",
  ],
  "يعود بعمر": ["Returns at age", "Revient à l’âge de"],
  وتقييم: ["and rating", "et une note de"],
  "؛ يحتاج مكانًا في القائمة وضمن ميزانية المرتبات. ينتهي بالاعتزال ودخول قاعة الإرث":
    [
      "; needs a squad place and room in the wage budget. Ends with retirement into the Hall of Legacy",
      " ; il faut une place dans l’effectif et dans la masse salariale. Se termine par la retraite et l’entrée au Panthéon",
    ],
  "العقد غير موجود": ["Contract not found", "Contrat introuvable"],
  "إنهاء عقد أسطورة": [
    "Terminate legend contract",
    "Résilier le contrat d’une légende",
  ],
  "التعويض شهران عن كل سنة متبقية": [
    "Compensation is two months per remaining year",
    "L’indemnité est de deux mois par année restante",
  ],
  "يُخصم فورًا. يتوقف الأثر التدريبي من اليوم، ويمكنك التعاقد معه مجددًا لاحقًا بمقدم جديد":
    [
      "Charged immediately. The coaching effect stops today; you can sign him again later with a new advance",
      "Débité immédiatement. L’effet d’entraînement cesse aujourd’hui ; vous pourrez le réengager plus tard avec une nouvelle avance",
    ],
  "العقد الحالي حتى": ["Current contract until", "Contrat actuel jusqu’au"],
  "ج.م · مكافأة التجديد راتب شهر": [
    "EGP · renewal bonus of one month’s salary",
    "EGP · prime de renouvellement d’un mois de salaire",
  ],
  "ج.م) تُخصم فورًا": [
    "EGP) charged immediately",
    "EGP) débitée immédiatement",
  ],
  "مدة التمديد": ["Extension length", "Durée de la prolongation"],

  // talent.js
  شامل: ["Broad", "Général"],
  الإنهاء: ["Finishing", "Finition"],
  "لا تقرير حديث؛ افتح متابعة": [
    "No recent report; open a follow-up",
    "Aucun rapport récent ; lancez un suivi",
  ],
  "دفعة واحدة كل موسم، تصل بعد 14 يومًا. عند وصولها لديك 90 يومًا للتقييم. لا مرتبات للفريق الأول قبل التصعيد؛ تكلفة البرنامج":
    [
      "One intake per season, arriving after 14 days. Once it arrives you have 90 days to assess. No first-team wages before promotion; programme cost",
      "Une promotion par saison, qui arrive après 14 jours. Vous avez ensuite 90 jours pour évaluer. Pas de salaire d’équipe première avant la montée ; coût du programme",
    ],
  "ج.م. المستوى الأعلى يزيد حجم الدفعة، ومدرب الناشئين يحسن التقدير، ولا يضمن النجومية":
    [
      "EGP. A higher level enlarges the intake and the youth coach sharpens the estimate, but nothing guarantees a star",
      "EGP. Un niveau supérieur agrandit la promotion et l’entraîneur des jeunes affine l’estimation, sans garantir une star",
    ],
  "مكافأة التصعيد: راتب شهر، وعقد ثلاث سنوات بالراتب الموضح. اللاعب الذي يغادر ينتقل لسوق الأحرار بنفس هويته وتاريخه":
    [
      "Promotion bonus: one month’s salary and a three-year contract at the shown wage. A player who leaves joins the free-agent market with the same identity and history",
      "Prime de montée : un mois de salaire et un contrat de trois ans au salaire indiqué. Un joueur qui part rejoint le marché des agents libres avec la même identité et le même historique",
    ],
  "المشاركة والمدرب والمنشآت والإصابات تؤثر في التطور. التدريب المكثف يزيد الإجهاد؛ صغار السن لا يتطورون بنفس السرعة. البرامج لا تضمن بلوغ الإمكانات":
    [
      "Playing time, the coach, facilities and injuries drive development. Intensive training adds fatigue; the youngest do not all develop at the same speed. Programmes never guarantee reaching potential",
      "Temps de jeu, entraîneur, installations et blessures déterminent la progression. L’entraînement intensif fatigue ; les plus jeunes ne progressent pas tous au même rythme. Les programmes ne garantissent jamais d’atteindre le potentiel",
    ],
  التركيز: ["Focus", "Axe de travail"],
  الحمل: ["Load", "Charge"],
  خفيف: ["Light", "Légère"],
  عادي: ["Normal", "Normale"],
  مكثف: ["Intensive", "Intensive"],
  "مهمتان متزامنتان، حتى ستة تقارير لكل بحث. المتابعة تضيق نطاق التقدير ولا تغيّر قدرة اللاعب. الكشاف الخارجي متاح دون انتظار اعتزال موظف، وكشافك المعين يستخدم مهارته. الرسوم غير مستردة إذا غادر الكشاف قبل نهاية المهمة":
    [
      "Two concurrent assignments, up to six reports per search. A follow-up narrows the estimate but never changes the player’s ability. The external scout is available without waiting for a staff retirement, and your appointed scout uses his own skill. Fees are not refunded if the scout leaves before the assignment ends",
      "Deux missions simultanées, jusqu’à six rapports par recherche. Le suivi resserre l’estimation sans changer la qualité du joueur. Le recruteur externe est disponible sans attendre le départ d’un salarié, et votre recruteur attitré utilise sa propre compétence. Les frais ne sont pas remboursés si le recruteur part avant la fin de la mission",
    ],
  البلد: ["Country", "Pays"],
  "كل الأسواق المحملة": ["All loaded markets", "Tous les marchés chargés"],
  "أقل عمر": ["Min age", "Âge min."],
  "أقصى عمر": ["Max age", "Âge max."],
  "سقف قيمة اللاعب ج.م": [
    "Player value cap (EGP)",
    "Plafond de valeur du joueur (EGP)",
  ],
  "المدة والتكلفة": ["Duration and cost", "Durée et coût"],
  "21 يومًا — 60 ألف": ["21 days — 60k", "21 jours — 60 k"],
  الكشاف: ["Scout", "Recruteur"],
  "خدمة كشف خارجية": [
    "External scouting service",
    "Service de recrutement externe",
  ],
  "البحث المخصص في بلد أجنبي يضيف 15 ألفًا. البحث الشامل فحص مكتبي؛ ميزانية البحث ليست رسوم شراء اللاعبين":
    [
      "A targeted search in a foreign country adds 15k. The broad search is a desk review; the search budget is not a transfer fee",
      "Une recherche ciblée à l’étranger ajoute 15 k. La recherche générale est une revue documentaire ; le budget de recherche n’est pas une indemnité de transfert",
    ],
  "قيد التنفيذ": ["In progress", "En cours"],
  اكتملت: ["Completed", "Terminée"],
  توقفت: ["Stopped", "Interrompue"],
  "لاعبًا من أكاديميات الأندية": [
    "players from club academies",
    "joueurs issus des académies",
  ],
  "تعاقدًا حرًا": ["free-agent signings", "recrutements d’agents libres"],
  تجديدًا: ["renewals", "renouvellements"],
  "الأندية في الأسواق المحملة تعالج نقص القوائم والمراكز شهريًا وفق ميزانيات التوقيع. نموذج خفيف لا يحاكي كامل اقتصاد كل نادٍ؛ بحد 120 إضافة أو تعاقد حر شهريًا وحد 50 ألف لاعب نشط. المعتزلون ينتقلون إلى أرشيف مضغوط لا يُحتسب ضمن الحد ويحتفظ بأسمائهم وتاريخهم. تطور الصغار لدى الكمبيوتر تقريب تدريبي وفرص فنية، وليس سجل دقائق كاملًا":
    [
      "Clubs in the loaded markets fix squad and position gaps monthly within signing budgets. A light model that does not simulate every club’s full economy; at most 120 additions or free signings per month and a cap of 50,000 active players. Retirees move to a compact archive that does not count against the cap and keeps their names and history. AI youth development is a training approximation with football chances, not a full minutes log",
      "Les clubs des marchés chargés comblent chaque mois leurs manques d’effectif et de postes selon des budgets de recrutement. Modèle léger qui ne simule pas toute l’économie de chaque club ; au plus 120 ajouts ou recrutements libres par mois et un plafond de 50 000 joueurs actifs. Les retraités passent dans une archive compacte hors plafond qui conserve leurs noms et leur parcours. La progression des jeunes gérés par l’IA est une approximation d’entraînement et d’opportunités, pas un relevé complet des minutes",
    ],
  "لاعبًا نشطًا": ["active players", "joueurs actifs"],
  "معتزلًا في الأرشيف": ["retirees in the archive", "retraités dans l’archive"],
  "اعتزلوا دون نادٍ": ["retired without a club", "retraités sans club"],

  // players.js
  "في انتظار رد النادي": [
    "Awaiting the club’s reply",
    "En attente de la réponse du club",
  ],
  "وصل رد النادي · افتح البريد": [
    "The club replied · open the inbox",
    "Le club a répondu · ouvrez la boîte de réception",
  ],
  "اتفاق النادي تم · تفاوض على العقد": [
    "Club agreement done · negotiate the contract",
    "Accord avec le club conclu · négociez le contrat",
  ],
  "تفاوض نشط": ["Active negotiation", "Négociation en cours"],
  "مع المنتخب حتى": ["On international duty until", "En sélection jusqu’au"],
  "تابع الرد والتفاصيل من بريدك. لا يمكن إرسال عرضين متداخلين": [
    "Follow the reply and details in your inbox. Two overlapping offers cannot be sent",
    "Suivez la réponse et les détails dans votre boîte de réception. Impossible d’envoyer deux offres qui se chevauchent",
  ],
  "ج.م. النادي قد يطلب عرضًا مضادًا": [
    "EGP. The club may ask for a counter-offer",
    "EGP. Le club peut demander une contre-offre",
  ],
  "الأقساط كل ٣٠ يومًا. عمولة الوكيل ٣٪ عند التوقيع، وعقد اللاعب يتم التفاوض عليه بعد رد النادي":
    [
      "Instalments every 30 days. Agent commission 3% at signing; the player’s contract is negotiated after the club replies",
      "Mensualités tous les 30 jours. Commission d’agent de 3 % à la signature ; le contrat du joueur se négocie après la réponse du club",
    ],
  "طلب اللاعب الاسترشادي": [
    "Player’s indicative demand",
    "Demande indicative du joueur",
  ],
  "شرط جزائي — ج.م (صفر = لا يوجد": [
    "Release clause — EGP (zero = none",
    "Clause libératoire — EGP (zéro = aucune",
  ],

  // settings.js
  "بعد الاستضافة على HTTPS، ضيف الأيقونة من Safari. الأوفلاين يحتاج تجهيزًا أول مرة؛ معتمد ومختبر بالكامل على Safari وآيفون وChromium":
    [
      "Once hosted on HTTPS, add the icon from Safari. Offline needs a first-time setup; fully certified and tested on Safari, iPhone and Chromium",
      "Une fois hébergé en HTTPS, ajoutez l’icône depuis Safari. Le hors-ligne exige une préparation initiale ; pleinement certifié et testé sur Safari, iPhone et Chromium",
    ],
  العربية: ["Arabic", "Arabe"],
  "الترجمة الإنجليزية والفرنسية تجريبية؛ بعض النصوص التفصيلية ورسائل الحفظات قد تظل بالعربية":
    [
      "English and French are presentation translations; a few detailed texts and old save messages may remain in Arabic",
      "L’anglais et le français sont des traductions d’affichage ; quelques textes détaillés et messages d’anciennes sauvegardes peuvent rester en arabe",
    ],
  "حفظ العالم يُصدّر مضغوطًا JSON.GZ، مع قبول JSON القديم. حد ١٦٠ MiB بعد فك الضغط و٨٠ MiB للملف المضغوط. كل قرار يُحفظ تلقائيًا على جهازك. مسح بيانات المتصفح أو تغيير الرابط قد يفقد الوصول للحفظة؛ صدّر نسخة احتياطية بشكل دوري":
    [
      "World saves export as compressed JSON.GZ, while old JSON is still accepted. Limits: 160 MiB uncompressed and 80 MiB compressed. Every decision autosaves on your device. Clearing browser data or changing the URL can lose access to the save; export a backup regularly",
      "Les sauvegardes du monde s’exportent en JSON.GZ compressé, l’ancien JSON restant accepté. Limites : 160 Mio décompressé et 80 Mio compressé. Chaque décision est sauvegardée automatiquement sur votre appareil. Effacer les données du navigateur ou changer l’URL peut faire perdre l’accès ; exportez régulièrement une copie",
    ],
  "صيغة الحفظ v": ["Save format v", "Format de sauvegarde v"],
  "لاعب في العالم": ["players in the world", "joueurs dans le monde"],
  "اليوم والأسبوع يتم تمريرهما يومًا بيوم. النظام يحتفظ بالأيام المتبقية عند التوقف":
    [
      "Day and week advance one day at a time. The system keeps the remaining days when it stops",
      "Le jour et la semaine avancent jour par jour. Le système conserve les jours restants en cas d’arrêt",
    ],
  "نسخة ويب أولية قابلة للعب. الأنظمة منفصلة: محرك الوقت، التعاقدات، المالية، الرعايات، المنشآت، الحفظ، والشاشات":
    [
      "A playable early web build. Separate systems: time engine, transfers, finance, sponsorships, facilities, saving and screens",
      "Version web préliminaire jouable. Systèmes séparés : moteur du temps, transferts, finances, sponsoring, installations, sauvegarde et écrans",
    ],
  "مفاوضات وانتقالات وعقود": [
    "Negotiations, transfers and contracts",
    "Négociations, transferts et contrats",
  ],
  "دفعات ورعايات وحصرية": [
    "Instalments, sponsorships and exclusivity",
    "Versements, sponsoring et exclusivité",
  ],
  "مشروعات وآثار تشغيلية": [
    "Projects and operating effects",
    "Projets et effets d’exploitation",
  ],
  "عالم موسّع وأوروبا بمرحلة دوري وذهاب وإياب": [
    "Expanded world and Europe with a league phase and two-legged ties",
    "Monde étendu et Europe avec phase de ligue et confrontations aller-retour",
  ],
  "تقدر تختار ناديًا جديدًا وتبدأ من الصفر. صدّر حفظتك الحالية الأول، لأن النسخة تدعم حفظة نشطة واحدة":
    [
      "You can pick a new club and start from scratch. Export your current save first, because this version keeps one active save",
      "Vous pouvez choisir un nouveau club et repartir de zéro. Exportez d’abord votre sauvegarde actuelle : cette version ne conserve qu’une sauvegarde active",
    ],

  // setup.js
  "مش مجرد فريق": ["Not just a team", "Pas seulement une équipe"],
  مؤسستك: ["Your institution", "Votre institution"],
  "من أول صفقة لآخر مقعد في المدرجات": [
    "From the first deal to the last seat in the stands",
    "De la première signature au dernier siège des tribunes",
  ],
  "اختار ناديك، ابني مشروعك، وسيب بصمتك": [
    "Choose your club, build your project, leave your mark",
    "Choisissez votre club, bâtissez votre projet, laissez votre empreinte",
  ],
  قواعدك: ["Your rules", "Vos règles"],
  إرثك: ["Your legacy", "Votre héritage"],
  "الأسماء والأعمار مرجعية؛ القدرات والعقود والاعتزال والأحداث محاكاة وليست حقائق عن الأشخاص":
    [
      "Names and ages are reference data; abilities, contracts, retirements and events are simulation, not facts about real people",
      "Noms et âges sont des données de référence ; qualités, contrats, retraites et événements sont simulés, pas des faits sur des personnes réelles",
    ],
  "صُممت للقرارات الكبيرة. وتفاصيلها الصغيرة": [
    "Built for the big decisions. And their small details",
    "Conçu pour les grandes décisions. Et leurs petits détails",
  ],

  // inbox.js
  "مراجعة الأكاديمية": ["Review the academy", "Examiner l’académie"],
  "اطلعت — سأقرر خلال المهلة": [
    "Noted — I will decide within the deadline",
    "Vu — je déciderai dans le délai",
  ],
  "راجع شروط الإعارة": ["Review loan terms", "Examiner les conditions du prêt"],
  "رفض العرض": ["Decline the offer", "Refuser l’offre"],
  "اطلعت وسأراجع المصروفات": [
    "Noted — I will review the spending",
    "Vu — je vais revoir les dépenses",
  ],
  إدارة: ["Management", "Direction"],
  إلى: ["To", "À"],
  "تقدم الوقت متوقف حتى قرارك": [
    "Time is paused until you decide",
    "Le temps est en pause jusqu’à votre décision",
  ],
  "مع تحيات فريق الإدارة": [
    "Regards, the management team",
    "Cordialement, l’équipe de direction",
  ],
  مكتب: ["Office of", "Bureau"],

  // dashboard.js
  "ابنِ النادي": ["Build the club", "Bâtissez le club"],
  "الفريق يكسب مباراة. المؤسسة تبني إرثًا": [
    "A team wins a match. An institution builds a legacy",
    "Une équipe gagne un match. Une institution bâtit un héritage",
  ],
  "من ٤": ["of 4", "sur 4"],
  "ملعب محايد": ["Neutral venue", "Terrain neutre"],
  "لا مباراة مؤكدة قادمة": [
    "No confirmed upcoming match",
    "Aucun match confirmé à venir",
  ],
  "تُضاف مواجهات الكؤوس بعد تأكيد التأهل؛ يبدأ الموسم الجديد بعد اكتمال المنافسات":
    [
      "Cup ties are added once qualification is confirmed; the new season starts after all competitions finish",
      "Les matchs de coupe s’ajoutent une fois la qualification confirmée ; la nouvelle saison commence après la fin des compétitions",
    ],

  // finance.js
  "مكافأة رعاية": ["Sponsorship bonus", "Prime de sponsoring"],
  "أسطورة · مقدم/تعويض": [
    "Legend · advance/compensation",
    "Légende · avance/indemnité",
  ],
  "أسطورة · راتب": ["Legend · salary", "Légende · salaire"],
  "أسطورة · حقوق صورة": ["Legend · image rights", "Légende · droits à l’image"],
  "الرصيد الحالي": ["Current balance", "Solde actuel"],
  "رصيد افتتاحي + كل الحركات المسجلة": [
    "Opening balance + every recorded transaction",
    "Solde d’ouverture + toutes les opérations enregistrées",
  ],
  "يشمل دورة تشغيل شهرية واحدة. لا يشمل تذاكر أو صفقات لم تُبرم، وليس قائمة ربح وخسارة محاسبية":
    [
      "Covers one monthly operating cycle. Excludes tickets and deals not yet concluded; not an accounting profit-and-loss statement",
      "Couvre un cycle d’exploitation mensuel. Hors billetterie et opérations non conclues ; ce n’est pas un compte de résultat comptable",
    ],
  "الحد المعتمد": ["Approved limit", "Plafond approuvé"],
  "ج.م شهريًا": ["EGP per month", "EGP par mois"],

  // facilities.js
  التسليم: ["Delivery", "Livraison"],
  "منشأة المستوى": ["Level", "Installation de niveau"],
  "يعمل حاليًا": ["Currently working", "En poste actuellement"],
  "غير معيّن": ["Not appointed", "Non pourvu"],
  "وصلت إلى أقصى مستوى متاح في النسخة الحالية": [
    "You have reached the highest level available in this version",
    "Vous avez atteint le niveau maximal disponible dans cette version",
  ],

  // shell.js / shared.js
  "دخل النادي": ["Club income", "Revenus du club"],
  "الإدارة الرياضية": ["Sporting management", "Direction sportive"],
  "غرفة الصحافة": ["Press room", "Salle de presse"],
  جديد: ["New", "Nouveau"],
  "كل قرار يصنع مستقبل ناديك": [
    "Every decision shapes your club’s future",
    "Chaque décision façonne l’avenir de votre club",
  ],
  نادي: ["Club", "Club"],

  // management/loans.js
  "يومًا · رسوم": ["days · fee", "jours · frais"],
  "ج.م · المستعير": ["EGP · borrowing club", "EGP · club emprunteur"],
  "٪ من الراتب": ["% of the wage", "% du salaire"],
  "رد إعارة": ["Loan reply", "Réponse au prêt"],
  "تنتهي مهلة الرد": ["Reply deadline", "Fin du délai de réponse"],
  "الرسوم غير مستردة؛ العقد الحالي مستمر. المرتب محسوب في أول الشهر بلا توزيع يومي. خيار الشراء ملزم للمالك إذا فعّله المستعير":
    [
      "Fees are non-refundable; the current contract continues. Wages are charged on the first of the month, not per day. The purchase option binds the owner if the borrower triggers it",
      "Frais non remboursables ; le contrat actuel se poursuit. Le salaire est comptabilisé le premier du mois, sans répartition quotidienne. L’option d’achat engage le club propriétaire si l’emprunteur l’active",
    ],
  "اختر لاعبًا": ["Choose a player", "Choisissez un joueur"],
  الراتب: ["Wage", "Salaire"],
  "ج.م / شهر. يتطلب الرد والموافقة؛ لا خصم عند إرسال العرض": [
    "EGP / month. Needs a reply and approval; nothing is charged when the offer is sent",
    "EGP / mois. Réponse et accord requis ; aucun débit à l’envoi de l’offre",
  ],
  "مدة الإعارة": ["Loan length", "Durée du prêt"],
  "90 يومًا": ["90 days", "90 jours"],
  "180 يومًا": ["180 days", "180 jours"],
  "365 يومًا": ["365 days", "365 jours"],
  "الرسوم ج.م": ["Fee (EGP)", "Frais (EGP)"],
  "نسبة راتب المستعير ٪": [
    "Borrower’s wage share %",
    "Part du salaire prise par l’emprunteur %",
  ],
  "خيار الشراء ج.م — صفر لإلغائه": [
    "Purchase option (EGP) — zero to disable",
    "Option d’achat (EGP) — zéro pour la désactiver",
  ],
  "وعد المشاركة": ["Playing-time promise", "Promesse de temps de jeu"],
  "السماح للمالك بالاستدعاء بعد 60 يومًا": [
    "Allow the owner to recall after 60 days",
    "Autoriser le club propriétaire à rappeler après 60 jours",
  ],
  "النادي الآخر قد يعدّل الشروط أو يرفض. الرسوم لا ترد. مكافآت المباريات على المستعير. خيار الشراء ينقل العقد الحالي دون تمديد أو تفاوض تلقائي":
    [
      "The other club may amend the terms or decline. Fees are not refunded. Match bonuses fall on the borrower. The purchase option transfers the current contract without extension or automatic negotiation",
      "L’autre club peut modifier les conditions ou refuser. Les frais ne sont pas remboursés. Les primes de match incombent à l’emprunteur. L’option d’achat transfère le contrat actuel sans prolongation ni négociation automatique",
    ],
  "الإعارات الواردة والصادرة": [
    "Loans in and out",
    "Prêts entrants et sortants",
  ],
  "نوافذ سيناريو: يناير ويوليو–سبتمبر، وليست تقويم قيد رسميًا. خمس إعارات في كل اتجاه. نحتفظ بمساحة قائمة للمعارين العائدين":
    [
      "Scenario windows: January and July–September, not an official registration calendar. Five loans in each direction. Squad room is kept for returning loanees",
      "Fenêtres du scénario : janvier et juillet–septembre, pas un calendrier officiel d’enregistrement. Cinq prêts dans chaque sens. Une place est conservée pour les prêtés qui reviennent",
    ],
  "للاستعارة: افتح ملف أي لاعب من سوق الانتقالات واختر «التفاوض على إعارة": [
    "To borrow: open any player’s profile from the transfer market and choose “Negotiate a loan",
    "Pour emprunter : ouvrez la fiche d’un joueur depuis le marché des transferts et choisissez « Négocier un prêt",
  ],
  "استدعاء وفق الشرط": ["Recall under the clause", "Rappel selon la clause"],
  "تفعيل خيار الشراء": [
    "Trigger the purchase option",
    "Activer l’option d’achat",
  ],
  "العروض الأخيرة": ["Recent offers", "Offres récentes"],
  "بانتظار الرد": ["Awaiting reply", "En attente de réponse"],
  "عرض مضاد — يحتاج قرارك": [
    "Counter-offer — needs your decision",
    "Contre-offre — votre décision est attendue",
  ],
  مقبول: ["Accepted", "Acceptée"],
  مرفوض: ["Declined", "Refusée"],
  منتهي: ["Expired", "Expirée"],
  "مراجعة الشروط": ["Review terms", "Examiner les conditions"],
  "رفض / سحب": ["Decline / withdraw", "Refuser / retirer"],

  // management/tactics.js
  "الرسم وملاءمة المراكز": [
    "Shape and positional fit",
    "Schéma et adéquation des postes",
  ],
  "الضغط العالي يحتاج تحمّلًا ويزيد الإجهاد؛ السرعة تزيد المخاطرة. لا خطة تضمن الفوز":
    [
      "A high press needs stamina and adds fatigue; tempo adds risk. No plan guarantees a win",
      "Le pressing haut exige de l’endurance et fatigue ; le rythme accroît le risque. Aucun plan ne garantit la victoire",
    ],
  "التشكيل المتوقع الآن": [
    "Projected line-up now",
    "Composition prévue actuellement",
  ],
  "الاختيار اليدوي أدناه له أولوية؛ اللاعب خارج مركزه يتأثر، ويُستبعد المصاب والمستدعى. الدور يتأثر بمهارات اللاعب ومركزه في الرسم؛ بعض الأدوار تزيد الإجهاد أو تقلل التغطية. لا تبديلات حية بعد":
    [
      "Manual picks below take priority; a player out of position suffers, and injured or called-up players are excluded. The role depends on the player’s skills and his slot in the shape; some roles add fatigue or reduce cover. No live substitutions yet",
      "Les choix manuels ci-dessous sont prioritaires ; un joueur hors poste est pénalisé, les blessés et sélectionnés sont exclus. Le rôle dépend des qualités du joueur et de sa place dans le schéma ; certains rôles fatiguent davantage ou réduisent la couverture. Pas encore de remplacements en direct",
    ],

  // sponsors.js
  "حوّل جمهورك لقيمة مستدامة": [
    "Turn your audience into lasting value",
    "Transformez votre public en valeur durable",
  ],
  "الشراكات والرعايات": [
    "Partnerships & sponsorships",
    "Partenariats et sponsoring",
  ],
  "كل مساحة لها قيمة. وكل شراكة لها التزامات": [
    "Every space has a value. And every partnership has obligations",
    "Chaque espace a une valeur. Et chaque partenariat a ses obligations",
  ],
  "مساحات تُبنى عليها شراكات": [
    "Spaces that partnerships are built on",
    "Des espaces sur lesquels bâtir des partenariats",
  ],
  قميص: ["Shirt", "Maillot"],
  "نوّع مصادر الدخل بين الملعب، التدريب، والقميص. العروض هنا من شركات": [
    "Diversify income across the stadium, training and the shirt. Offers here come from",
    "Diversifiez vos revenus entre le stade, l’entraînement et le maillot. Les offres ici proviennent de sociétés",
  ],
  الخيالية: ["fictional companies", "fictives"],
  خيالي: ["fictional", "fictif"],
  ينتهي: ["Ends", "Expire le"],
  "مساحة متاحة لشريك جديد يناسب حجم ناديك وطموحه": [
    "Space available for a new partner matching your club’s size and ambition",
    "Espace disponible pour un nouveau partenaire à la mesure de votre club et de son ambition",
  ],
  "ج.م قيمة استرشادية": ["EGP indicative value", "EGP valeur indicative"],
  "عروض السوق المحلي": ["Local market offers", "Offres du marché local"],
  "رعاة خياليون": ["Fictional sponsors", "Sponsors fictifs"],
  "كل عرض لمدة ٣٦٠ يومًا. ٢٥٪ مقدمًا والباقي على ١١ دفعة كل ٣٠ يومًا": [
    "Every offer runs 360 days. 25% upfront and the rest in 11 instalments every 30 days",
    "Chaque offre dure 360 jours. 25 % d’avance et le reste en 11 versements tous les 30 jours",
  ],
  "بسعر عرض ثابت": ["at a fixed offer price", "à un prix d’offre fixe"],
  "من ٢": ["of 2", "sur 2"],
  "العرض المعلن": ["Published offer", "Offre annoncée"],
  "ج.م. سمعة ناديك": [
    "EGP. Your club’s reputation",
    "EGP. Réputation de votre club",
  ],
  "وثقة الصحافة": ["and press trust", "et confiance de la presse"],
  "الراعي يقيس طموحك عليهما": [
    "The sponsor measures your ambition against both",
    "Le sponsor mesure votre ambition à ces deux aunes",
  ],
  "طلب +١٠٪": ["Ask +10%", "Demander +10 %"],
  "طلب +٢٠٪": ["Ask +20%", "Demander +20 %"],
  "طلب +٣٠٪": ["Ask +30%", "Demander +30 %"],
  "طلبك تجاوز سقف الراعي لسمعة ناديك الحالية. العروض الأخرى للمساحة ما زالت متاحة، ويمكنك التوقيع المباشر دون تفاوض":
    [
      "Your ask exceeded what this sponsor pays for your current reputation. The other offers for this space are still open, and you can sign directly without negotiating",
      "Votre demande dépasse ce que ce sponsor accorde à votre réputation actuelle. Les autres offres pour cet espace restent ouvertes, et vous pouvez signer directement sans négocier",
    ],
  "عودة للعروض": ["Back to offers", "Retour aux offres"],
  "العرض الأصلي": ["Original offer", "Offre initiale"],
  "القيمة الآن": ["Value now", "Valeur actuelle"],
  "عقد رعاية فعّال": [
    "Active sponsorship contract",
    "Contrat de sponsoring actif",
  ],
  "مكافآت الأداء الموحدة": [
    "Standard performance bonuses",
    "Primes de performance standard",
  ],
  "لقب الدوري ٢٠٪، لقب الكأس المحلية ١٥٪، التأهل القاري ١٥٪ من قيمة العقد — تُصرف تلقائيًا نهاية الموسم عند تحققها للعقود القائمة":
    [
      "League title 20%, domestic cup 15%, continental qualification 15% of the contract value — paid automatically at season end for active contracts when achieved",
      "Titre de champion 20 %, coupe nationale 15 %, qualification continentale 15 % de la valeur du contrat — versés automatiquement en fin de saison pour les contrats en cours, si atteints",
    ],

  // competitions/cards.js
  المشاركون: ["Participants", "Participants"],
  "الجوائز بالجنيه والتواريخ تقديرات محاكاة": [
    "Prize money in EGP and dates are simulation estimates",
    "Dotations en EGP et dates sont des estimations de simulation",
  ],
  "الأول لثمن النهائي؛ الوصيف يواجه ثالث ليبرتادوريس في الملحق": [
    "Winner to the round of 16; runner-up meets a Libertadores third-placed side in the play-off",
    "Le premier va en huitièmes ; le deuxième affronte un troisième de Libertadores en barrage",
  ],
  "الأول والثاني لثمن النهائي؛ الثالث ينتقل لملحق سودأمريكانا": [
    "First and second to the round of 16; third drops into the Sudamericana play-off",
    "Premier et deuxième en huitièmes ; le troisième bascule en barrage de Sudamericana",
  ],
  "الأول والثاني لربع النهائي": [
    "First and second to the quarter-finals",
    "Premier et deuxième en quarts de finale",
  ],
  "المشاركون وأسباب التأهل": [
    "Participants and how they qualified",
    "Participants et motifs de qualification",
  ],
  "ثالث مجموعة ليبرتادوريس": [
    "Libertadores group third place",
    "Troisième de groupe de Libertadores",
  ],
  "مسار الكأس المحلي": ["Domestic cup path", "Parcours de la coupe nationale"],
  "ترتيب محلي / سمعة البداية": [
    "Domestic ranking / starting reputation",
    "Classement national / réputation initiale",
  ],
  "حسم الإقصائيات": [
    "Knockout tie-breaks",
    "Départage des matchs à élimination",
  ],
  المجموع: ["Aggregate", "Cumul"],
  المتأهل: ["Qualifier", "Qualifié"],
  "كل مباريات البطولة": [
    "All matches in the competition",
    "Tous les matchs de la compétition",
  ],

  // europe/cards.js
  "جدول ناديك — كل البطولات": [
    "Your club’s schedule — all competitions",
    "Calendrier de votre club — toutes compétitions",
  ],
  "الدوري والكؤوس في مكان واحد. التواريخ محاكاة بفاصل لا يقل عن 3 أيام بين مواعيد المباريات الرسمية الجديدة، وليست روزنامة رسمية. القرعات التالية تُضاف بعد حسم التأهل":
    [
      "League and cups in one place. Dates are simulated with at least 3 days between new official fixtures and are not an official calendar. Later draws are added once qualification is settled",
      "Championnat et coupes au même endroit. Les dates sont simulées avec au moins 3 jours entre nouveaux matchs officiels et ne constituent pas un calendrier officiel. Les tirages suivants s’ajoutent une fois la qualification acquise",
    ],
  "خصوم مختلفين لكل فريق، بالتساوي على ملعبه وخارجه": [
    "different opponents per team, split evenly home and away",
    "adversaires différents par équipe, à parts égales à domicile et à l’extérieur",
  ],
  "؛ المقاعد والمعاملات والجوائز محاكاة. لا تصفيات تمهيدية ولا انتقال للخاسر إلى مسابقة أخرى":
    [
      "; places, coefficients and prize money are simulated. No qualifying rounds and no drop into another competition for losers",
      " ; places, coefficients et dotations sont simulés. Pas de tours préliminaires ni de repêchage du perdant dans une autre compétition",
    ],
  "1–8: ثمن النهائي مباشرة": [
    "1–8: straight to the round of 16",
    "1–8 : directement en huitièmes",
  ],
  "9–24: الملحق": ["9–24: play-off", "9–24 : barrage"],
  "25–36: خروج": ["25–36: eliminated", "25–36 : éliminés"],
  "اسحب الجدول أفقيًا لعرض بقية الإحصاءات": [
    "Swipe the table sideways to see the remaining stats",
    "Faites glisser le tableau pour voir les autres statistiques",
  ],
  فوز: ["W", "V"],
  خسارة: ["L", "D"],
  "كيف يُحسم التعادل في النقاط؟": [
    "How are ties on points settled?",
    "Comment les égalités de points sont-elles départagées ?",
  ],
  "فارق الأهداف، الأهداف، الأهداف خارج الأرض، الانتصارات، الانتصارات خارج الأرض، مجموع نقاط الخصوم وفارقهم وأهدافهم، الأقل في نقاط الانضباط، ثم معامل النادي. المعامل والانضباط هنا نموذجان مولّدان، وليسَا أرقام UEFA الفعلية. قبل نهاية الدوري تُحسب إحصاءات الخصوم الذين لُعبت مواجهاتهم فقط":
    [
      "Goal difference, goals, away goals, wins, away wins, opponents’ combined points, goal difference and goals, fewest disciplinary points, then club coefficient. Coefficient and discipline here are generated models, not actual UEFA figures. Before the league phase ends, opponent statistics count only for matches already played",
      "Différence de buts, buts, buts à l’extérieur, victoires, victoires à l’extérieur, cumul des points, différence et buts des adversaires, le moins de points de discipline, puis coefficient du club. Coefficient et discipline sont ici des modèles générés, pas les chiffres réels de l’UEFA. Avant la fin de la phase de ligue, les statistiques des adversaires ne comptent que pour les matchs déjà joués",
    ],
  "أوعية القرعة وأسباب المشاركة": [
    "Draw pots and reasons for participation",
    "Chapeaux du tirage et motifs de participation",
  ],
  "لا لقاءات من نفس البلد في مرحلة الدوري، ولا أكثر من خصمين من بلد أجنبي واحد":
    [
      "No same-country ties in the league phase, and no more than two opponents from any one foreign country",
      "Pas de duel entre clubs du même pays en phase de ligue, ni plus de deux adversaires d’un même pays étranger",
    ],
  "لا تُطبق هنا قيود البث أو تسلسل الاستضافة الرسمي": [
    "Broadcast constraints and official hosting sequences are not applied here",
    "Les contraintes de diffusion et l’ordre officiel des réceptions ne sont pas appliqués ici",
  ],
  "في ترتيب السمعة الافتتاحي": [
    "in the opening reputation ranking",
    "au classement initial de réputation",
  ],
  "في الدوري السابق": [
    "in last season’s league",
    "dans le championnat précédent",
  ],
  المسار: ["Path", "Parcours"],
  البطل: ["Champion", "Champion"],
  "جميع مباريات البطولة": [
    "All competition matches",
    "Tous les matchs de la compétition",
  ],

  // asia/cards.js
  "بطل البطولة / مسار حامل اللقب": [
    "Competition winner / title-holder path",
    "Vainqueur de la compétition / parcours du tenant",
  ],
  "مسار لقب / وصافة البطولة الأدنى": [
    "Lower competition winner / runner-up path",
    "Parcours vainqueur / finaliste de la compétition inférieure",
  ],
  "ضيف من قائمة أندية حقيقية مرجعية": [
    "Guest from a reference list of real clubs",
    "Invité issu d’une liste de référence de clubs réels",
  ],
  "بداية المشوار بالسمعة": [
    "Career start by reputation",
    "Début de carrière par réputation",
  ],
  "ترتيب محلي محفوظ": [
    "Saved domestic ranking",
    "Classement national enregistré",
  ],
  "منتقل بعد خسارة التمهيدي الأعلى": [
    "Dropped after losing the higher preliminary",
    "Reversé après défaite au tour préliminaire supérieur",
  ],
  "مقاعد ومواعيد محاكاة — القواعد والتفاصيل": [
    "Simulated places and dates — rules and details",
    "Places et dates simulées — règles et détails",
  ],
  "صيغة لعب مبنية على 2026/27؛ ليست قائمة المشاركين المرخّصة أو روزنامة AFC الرسمية. توزيع المقاعد والتمهيدي والأوعية والجوائز تقديري. ضيوف البلدان غير المحمّلة أندية حقيقية بمحاكاة خفيفة، دون إضافة دوريات قابلة للاختيار أو قوائم لاعبين. نهائيات مفردة بمواقع محايدة نموذجية، ومجموعات التحدي مجمعة دون تحديد مضيف فعلي":
    [
      "A playable format based on 2026/27; not the licensed participant list or the official AFC calendar. Slot allocation, preliminaries, pots and prize money are estimates. Guests from unloaded countries are real clubs simulated lightly, without adding selectable leagues or squads. Single-match finals at model neutral venues; Challenge League groups are centralised without a real host",
      "Format jouable fondé sur 2026/27 ; ni la liste officielle des participants ni le calendrier de l’AFC. Répartition des places, préliminaires, chapeaux et dotations sont estimés. Les invités des pays non chargés sont des clubs réels simulés légèrement, sans championnats sélectionnables ni effectifs. Finales en match unique sur des sites neutres du modèle ; les groupes de la Challenge League sont centralisés sans hôte réel",
    ],
  "غرب آسيا": ["West Asia", "Asie de l’Ouest"],
  "شرق آسيا": ["East Asia", "Asie de l’Est"],
  المجموعة: ["Group", "Groupe"],
  "ترجيح خاص عند بقاء ناديين متساويين ولعب آخر مباراة بينهما؛ ثم الانضباط والقرعة المحفوظة. سجل الانضباط على مستوى الفريق، وليس إيقافات فردية":
    [
      "A special tie-break when two clubs remain level after their final meeting; then discipline and the saved draw. Discipline is recorded at team level, not as individual suspensions",
      "Départage spécial lorsque deux clubs restent à égalité après leur dernière confrontation ; puis discipline et tirage enregistré. La discipline est suivie au niveau de l’équipe, pas par suspensions individuelles",
    ],
  "المشاركون ومسارات التأهل": [
    "Participants and qualification paths",
    "Participants et parcours de qualification",
  ],
  غرب: ["West", "Ouest"],
  شرق: ["East", "Est"],
  "دخول المجموعات": ["Group entry", "Entrée en groupes"],
  تمهيدي: ["Preliminary", "Préliminaire"],
  الغرب: ["West", "Ouest"],
  الشرق: ["East", "Est"],
  وعاء: ["Pot", "Chapeau"],
  عمود: ["Column", "Colonne"],
  "الإقصائيات: لا أفضلية للهدف خارج الأرض؛ وقت إضافي ثم ترجيح عند التعادل": [
    "Knockouts: no away-goals rule; extra time then penalties when level",
    "Phases finales : pas de règle du but à l’extérieur ; prolongation puis tirs au but en cas d’égalité",
  ],
  "كل المباريات": ["All matches", "Tous les matchs"],

  // fifa/cards.js
  "مواجهة أفريقيا/آسيا وأوقيانوسيا": [
    "Africa/Asia v Oceania tie",
    "Duel Afrique/Asie – Océanie",
  ],
  "ديربي الأمريكتين": ["Derby of the Americas", "Derby des Amériques"],
  "بطل قاري": ["Continental champion", "Champion continental"],
  "ترتيب الدورة المحفوظ": [
    "Saved cycle ranking",
    "Classement du cycle enregistré",
  ],
  "ترتيب مسار أوقيانوسيا المحفوظ": [
    "Saved Oceania path ranking",
    "Classement enregistré du parcours Océanie",
  ],
  "استكمال بالسمعة — لا سجل دورة كامل": [
    "Filled by reputation — no complete cycle record",
    "Complété par réputation — pas de cycle complet enregistré",
  ],
  "مضيف السيناريو من الدوري الأمريكي": [
    "Scenario host from MLS",
    "Hôte du scénario issu de la MLS",
  ],
  "لا توجد بعد": ["None yet", "Aucun pour l’instant"],
  "ينتظر أبطال القارات الستة من الموسم الجاري داخل لعبتك، لا قائمة أسماء ثابتة ولا أصحاب ألقاب البطولات الثانوية. مواعيد نسبية بعد اكتمال الأبطال، وليست روزنامة ديسمبر الرسمية":
    [
      "Waits for the six continental champions of the current season inside your game — no fixed list of names and no winners of secondary competitions. Relative dates after all champions are known, not the official December calendar",
      "Attend les six champions continentaux de la saison en cours dans votre partie — ni liste fixe de noms ni vainqueurs de compétitions secondaires. Dates relatives une fois les champions connus, pas le calendrier officiel de décembre",
    ],
  "مسار خفيف لسبعة أندية حقيقية من قائمة OFC؛ ليس الدوري الاحترافي الرسمي. ساوث ملبورن مستبعد من مقعد أوقيانوسيا لانتسابه إلى AFC. أوكلاند يحتفظ بهويته الحالية في الدوري الأسترالي، ولا ننسخ النادي أو لاعبيه. الأندية الستة الأخرى ضيوف كؤوس دون دوريات أو قوائم لاعبين تفصيلية":
    [
      "A light path for seven real clubs from the OFC list; not the official professional league. South Melbourne is excluded from the Oceania place as an AFC member. Auckland keeps its current A-League identity; the club and its players are not duplicated. The other six clubs are cup guests without leagues or detailed squads",
      "Parcours léger pour sept clubs réels de la liste OFC ; pas le championnat professionnel officiel. South Melbourne est exclu de la place Océanie car affilié à l’AFC. Auckland garde son identité actuelle en A-League ; le club et ses joueurs ne sont pas dupliqués. Les six autres clubs sont des invités de coupe sans championnats ni effectifs détaillés",
    ],
  "الجوائز والمنشآت والأوعية والمواعيد تقديرات محاكاة. كونكاكاف ما زالت بصيغة مبسطة؛ بطل النخبة هو ممثل آسيا":
    [
      "Prize money, venues, pots and dates are simulation estimates. Concacaf remains simplified; the Elite champion is Asia’s representative",
      "Dotations, sites, chapeaux et dates sont des estimations de simulation. La Concacaf reste simplifiée ; le champion de l’Elite représente l’Asie",
    ],
  "ترتيب مسار التأهل": [
    "Qualification path ranking",
    "Classement du parcours de qualification",
  ],
  "نقطة نموذجية": ["model points", "points du modèle"],
  ألقاب: ["titles", "titres"],
  "تعادل الإقصائيات: وقت إضافي ثم ترجيح؛ لا أفضلية هدف خارج الأرض": [
    "Knockout ties: extra time then penalties; no away-goals rule",
    "Égalité en phase finale : prolongation puis tirs au but ; pas de règle du but à l’extérieur",
  ],
  "البطولتان العالميتان — منفصلتان": [
    "The two world competitions — separate",
    "Les deux compétitions mondiales — distinctes",
  ],
  "كأس العالم القادم": [
    "Next Club World Cup",
    "Prochaine Coupe du monde des clubs",
  ],
  "32 ناديًا كل أربع سنوات. الإنتركونتيننتال: ستة أبطال كل موسم. استمرار صيغة 2025 للكأس الكبير اختيار محاكاة، لا اعتماد نهائي للوائح 2029":
    [
      "32 clubs every four years. Intercontinental: six champions every season. Keeping the 2025 format for the big cup is a simulation choice, not a final adoption of the 2029 regulations",
      "32 clubs tous les quatre ans. Intercontinentale : six champions chaque saison. Conserver le format 2025 de la grande coupe est un choix de simulation, pas une adoption définitive du règlement 2029",
    ],
  "دورات تأهل محفوظة": [
    "Saved qualification cycles",
    "Cycles de qualification enregistrés",
  ],
  "لا نختلق نتائج لأعوام ما قبل بداية مشوارك": [
    "We never invent results for years before your career began",
    "Nous n’inventons aucun résultat pour les années antérieures à votre carrière",
  ],
  "حفظة قديمة: بطولات FIFA الحالية ونتائجها محفوظة. الصيغ الجديدة ومسار أوقيانوسيا يبدأان بعد نهاية هذا الموسم":
    [
      "Older save: current FIFA competitions and their results are kept. The new formats and the Oceania path start after this season ends",
      "Ancienne sauvegarde : les compétitions FIFA en cours et leurs résultats sont conservés. Les nouveaux formats et le parcours Océanie démarrent après cette saison",
    ],

  // concacaf/cards.js
  "بطل الدوري المحلي — إعفاء لثمن النهائي": [
    "Domestic league champion — bye to the round of 16",
    "Champion national — exempté jusqu’en huitièmes",
  ],
  "بطل إقليمي — إعفاء لثمن النهائي": [
    "Regional champion — bye to the round of 16",
    "Champion régional — exempté jusqu’en huitièmes",
  ],
  "متأهل إقليمي للدور الأول": [
    "Regional qualifier for round one",
    "Qualifié régional pour le premier tour",
  ],
  "إعفاء لثمن النهائي": [
    "Bye to the round of 16",
    "Exempté jusqu’en huitièmes",
  ],
  "الدور الأول": ["Round one", "Premier tour"],
  "المرحلة الأولى": ["First stage", "Première phase"],
  المجموعات: ["Groups", "Groupes"],
  فارق: ["GD", "Diff."],
  نقاط: ["Pts", "Pts"],
  "جدول الدوري المكسيكي": ["Liga MX table", "Classement de la Liga MX"],
  "جدول الدوري الأمريكي": ["MLS table", "Classement de la MLS"],
  "صيغة لعب مبنية على لوائح 2026؛ ليست قوائم المشاركين المرخّصة أو روزنامة Concacaf الرسمية. المقاعد الكندية وكؤوس أمريكا المحلية والأدوار التمهيدية للدرع غير ممثلة؛ تُستكمل من ترتيب الدوري. ضيوف أمريكا الوسطى والكاريبي أندية حقيقية بمحاكاة خفيفة، دون إضافة دوريات قابلة للاختيار أو قوائم لاعبين. النهائيات المفردة يستضيفها الأعلى تصنيفًا في النموذج":
    [
      "A playable format based on the 2026 regulations; not the licensed participant lists or the official Concacaf calendar. Canadian places, US domestic cups and Shield preliminaries are not represented; they are filled from league standings. Central American and Caribbean guests are real clubs simulated lightly, without selectable leagues or squads. Single-match finals are hosted by the higher-ranked side in the model",
      "Format jouable fondé sur le règlement 2026 ; ni listes officielles des participants ni calendrier officiel de la Concacaf. Places canadiennes, coupes nationales américaines et préliminaires du Shield ne sont pas représentés ; ils sont comblés par les classements. Les invités d’Amérique centrale et des Caraïbes sont des clubs réels simulés légèrement, sans championnats ni effectifs. Les finales en match unique sont accueillies par le mieux classé du modèle",
    ],
  "سجل الانضباط على مستوى الفريق، وليس إيقافات فردية. أهداف خارج الأرض تُحتسب من الوقت الأصلي فقط":
    [
      "Discipline is tracked at team level, not as individual suspensions. Away goals count from regulation time only",
      "La discipline est suivie au niveau de l’équipe, pas par suspensions individuelles. Les buts à l’extérieur ne comptent que dans le temps réglementaire",
    ],

  // index.html title
  "صاحب النادي — لعبة إدارة وملكية نادي كرة قدم": [
    "Club Owner — a football club ownership and management game",
    "Club Owner — jeu de gestion et de propriété d’un club de football",
  ],

  // platform/install.js
  "نسخة الويب على الآيفون": [
    "The web version on iPhone",
    "La version web sur iPhone",
  ],
  "افتح رابط اللعبة المستضاف مباشرة في": [
    "Open the hosted game link directly in",
    "Ouvrez le lien hébergé du jeu directement dans",
  ],
  "مش داخل نافذة معاينة أو تطبيق محادثة": [
    "not inside a preview pane or a chat app",
    "pas dans une fenêtre d’aperçu ni une appli de messagerie",
  ],
  اضغط: ["Tap", "Touchez"],
  مشاركة: ["Share", "Partager"],
  "في Safari، ثم": ["in Safari, then", "dans Safari, puis"],
  "إضافة إلى الشاشة الرئيسية": ["Add to Home Screen", "Sur l’écran d’accueil"],
  "لو ظهر اختيار": ["If the option", "Si l’option"],
  "فتح كتطبيق ويب": ["Open as web app", "Ouvrir comme app web"],
  "فعّله، ثم اضغط": [
    "appears, enable it, then tap",
    "apparaît, activez-la, puis touchez",
  ],
  إضافة: ["Add", "Ajouter"],
  "افتح أيقونة": ["Open the", "Ouvrez l’icône"],
  "وانتظر رسالة تجهيز اللعب دون اتصال أول مرة": [
    "icon and wait for the first-time offline-ready message",
    "et attendez le message de préparation hors ligne la première fois",
  ],
  "العمل دون اتصال يحتاج نسخة الإنتاج على HTTPS وفتحها مرة بنجاح حتى يكتمل التنزيل. المتصفح قد يمسح الكاش أو بيانات الموقع؛ صدّر حفظتك دوريًا. الدخول الخاص لدى الاستضافة قد يحتاج اتصالًا لإعادة تسجيل الدخول":
    [
      "Offline play needs the production build on HTTPS and one successful load so the download completes. The browser may clear the cache or site data; export your save regularly. Host-side private access may need a connection to sign in again",
      "Le hors-ligne exige la version de production en HTTPS et un premier chargement réussi pour terminer le téléchargement. Le navigateur peut effacer le cache ou les données du site ; exportez régulièrement votre sauvegarde. Un accès privé côté hébergeur peut exiger une connexion pour se reconnecter",
    ],
  "الحفظ في Safari أو أيقونة الشاشة الرئيسية قد يكون منفصلًا حسب إصدار iOS. صدّر حفظتك قبل الإضافة، واستوردها داخل الأيقونة إذا لم تظهر تلقائيًا":
    [
      "Saves in Safari and in the Home Screen icon may be separate depending on the iOS version. Export your save before adding the icon and import it inside the icon if it does not appear automatically",
      "Les sauvegardes de Safari et de l’icône d’accueil peuvent être séparées selon la version d’iOS. Exportez votre sauvegarde avant l’ajout et importez-la dans l’icône si elle n’apparaît pas automatiquement",
    ],

  // platform/offline.js
  "اكتمل تجهيز اللعبة للعمل دون اتصال على هذا المتصفح. صدّر حفظتك للاحتياط": [
    "The game is now ready to work offline in this browser. Export your save as a backup",
    "Le jeu est prêt à fonctionner hors ligne dans ce navigateur. Exportez votre sauvegarde par précaution",
  ],
  "اللعبة تعمل بالإنترنت، لكن تجهيز العمل دون اتصال لم يكتمل. جرّب إعادة فتح الرابط":
    [
      "The game works online, but offline preparation did not finish. Try reopening the link",
      "Le jeu fonctionne en ligne, mais la préparation hors ligne n’est pas terminée. Essayez de rouvrir le lien",
    ],
  "نسخة جديدة من اللعبة جاهزة": [
    "A new version of the game is ready",
    "Une nouvelle version du jeu est prête",
  ],
  "تحديث الآن": ["Update now", "Mettre à jour"],
  "الحفظة مسجلة تلقائيًا. سيتم إغلاق أي نموذج لم تؤكد إرساله وإعادة تحميل اللعبة. هل تريد التحديث الآن؟":
    [
      "Your save is stored automatically. Any unsubmitted form will close and the game will reload. Update now?",
      "Votre sauvegarde est enregistrée automatiquement. Tout formulaire non validé sera fermé et le jeu rechargé. Mettre à jour maintenant ?",
    ],
  لاحقًا: ["Later", "Plus tard"],

  // 0.21 Accounts & Cloud Sync
  "حساب المالك والمزامنة": ["Owner account & sync", "Compte propriétaire et synchronisation"],
  "تسجيل الدخول": ["Sign in", "Connexion"],
  "إنشاء حساب جديد": ["Create new account", "Créer un nouveau compte"],
  "الاسم الذي يظهر في حسابك": ["Name displayed on your account", "Nom affiché sur votre compte"],
  "تم تسجيل الخروج بنجاح.": ["Logged out successfully.", "Déconnexion réussie."],
  "لا توجد مسيرة نشطة حاليًا للمزامنة.": ["No active career currently to sync.", "Aucune carrière active à synchroniser actuellement."],
  "جارٍ رفع الحفظة إلى السحابة…": ["Uploading save to cloud…", "Téléversement de la sauvegarde vers le cloud…"],
  "تمت المزامنة السحابية بنجاح!": ["Cloud sync succeeded!", "Synchronisation cloud réussie !"],
  "تعذر إتمام المزامنة السحابية.": ["Failed to complete cloud sync.", "Échec de la synchronisation cloud."],
  "جارٍ فحص الحفظات على السحابة…": ["Checking cloud saves…", "Vérification des sauvegardes sur le cloud…"],
  "المزامنة السحابية": ["Cloud sync", "Synchronisation cloud"],
  "لا توجد أي حفظة سحابية مسجلة لحسابك حتى الآن.": ["No cloud saves registered for your account yet.", "Aucune sauvegarde cloud enregistrée pour votre compte pour l'instant."],
  "يمكنك مزامنة ناديك الحالي أولًا.": ["You can sync your current club first.", "Vous pouvez d'abord synchroniser votre club actuel."],
  "استرجاع الحفظة السحابية؟": ["Restore cloud save?", "Restaurer la sauvegarde cloud ?"],
  "سيتم استبدال الحفظة النشطة على جهازك بالنسخة المحفوظة سحابيًا.": ["The active save on your device will be replaced with the cloud copy.", "La sauvegarde active sur votre appareil sera remplacée par la copie du cloud."],
  "الحفظة المحلية الحالية": ["Current local save", "Sauvegarde locale actuelle"],
  "الحفظة على السحابة": ["Cloud save", "Sauvegarde cloud"],
  "الجهاز": ["Device", "Appareil"],
  "تعذر جلب الحفظة من السحابة.": ["Failed to fetch save from cloud.", "Impossible de récupérer la sauvegarde du cloud."],
  "جارٍ تنزيل واسترجاع الحفظة…": ["Downloading and restoring save…", "Téléchargement et restauration de la sauvegarde…"],
  "تم استرجاع ناديك من السحابة بنجاح!": ["Club restored from cloud successfully!", "Votre club a été restauré depuis le cloud avec succès !"],
  "تعذر فك واستعادة الحفظة السحابية.": ["Failed to decode and restore cloud save.", "Impossible de décoder et restaurer la sauvegarde cloud."],
  "جارٍ جلب سجل الحفظات…": ["Fetching saves history…", "Récupération de l'historique des sauvegardes…"],
  "سجل الحفظات السحابية": ["Cloud saves history", "Historique des sauvegardes cloud"],
  "لا توجد حفظات سحابية مسجلة بعد.": ["No cloud saves registered yet.", "Aucune sauvegarde cloud enregistrée pour le moment."],
  "يتم الاحتفاظ بآخر ٥ حفظات لحسابك تلقائيًا.": ["Your last 5 saves are kept automatically.", "Vos 5 dernières sauvegardes sont conservées automatiquement."],
  "يمكنك استرجاع أي نسخة أو حذفها.": ["You can restore or delete any version.", "Vous pouvez restaurer ou supprimer n'importe quelle version."],
  "متصفح": ["Browser", "Navigateur"],
  "استرجاع": ["Restore", "Restaurer"],
  "حذف": ["Delete", "Supprimer"],
  "تعذر جلب سجل الحفظات.": ["Failed to fetch saves history.", "Impossible de récupérer l'historique des sauvegardes."],
  "تم حذف النسخة السحابية.": ["Cloud save deleted.", "Sauvegarde cloud supprimée."],
  "تعذر حذف الحفظة.": ["Failed to delete save.", "Impossible de supprimer la sauvegarde."],
  "تم تسجيل الدخول بنجاح!": ["Signed in successfully!", "Connexion réussie !"],
  "تم إنشاء الحساب وتسجيل الدخول بنجاح!": ["Account created and signed in successfully!", "Compte créé et connecté avec succès !"],
  "لم تتم المزامنة بعد": ["Not synced yet", "Pas encore synchronisé"],
  "الحساب والمزامنة السحابية": ["Account & cloud sync", "Compte et synchronisation cloud"],
  "متصل بالسحابة": ["Connected to cloud", "Connecté au cloud"],
  "حفظتك مؤمنة ومرتبطة بحسابك؛": ["Your save is secured and linked to your account;", "Votre sauvegarde est sécurisée et liée à votre compte ;"],
  "يمكنك المزامنة واللعب من أي جهاز (كمبيوتر أو هاتف) واسترجاع مسيرتك فورًا حتى لو حُذفت بيانات المتصفح.": ["You can sync and play from any device (PC or phone) and restore your career immediately even if browser data is cleared.", "Vous pouvez synchroniser et jouer depuis n'importe quel appareil (PC ou téléphone) et restaurer votre carrière immédiatement même si les données du navigateur sont effacées."],
  "آخر مزامنة سحابية:": ["Last cloud sync:", "Dernière synchronisation cloud :"],
  "مزامنة الآن إلى السحابة": ["Sync now to cloud", "Synchroniser maintenant vers le cloud"],
  "احفظ مسيرتك سحابيًا لحمايتها من مسح المتصفح التلقائي على الآيفون والكمبيوتر،": ["Save your career to the cloud to protect it from automatic browser wipes on iPhone and PC,", "Sauvegardez votre carrière sur le cloud pour la protéger des suppressions automatiques sur iPhone et PC,"],
  "وتنقل بين أجهزتك بحرية.": ["and switch between your devices freely.", "et passez d'un appareil à l'autre en toute liberté."],
  "اللعب بدون حساب يظل متاحًا ومحليًا 100٪.": ["Playing without an account remains available and 100% local.", "Jouer sans compte reste disponible et 100 % local."],
  "تسجيل الدخول / إنشاء حساب": ["Sign in / Create account", "Connexion / Créer un compte"],
  "القاعدة الكبيرة محفوظة محليًا في IndexedDB، وتدعم المزامنة السحابية بحسابك. صدّر نسخة احتياطية دوريًا.": ["The large database is stored locally in IndexedDB and supports cloud sync with your account. Export backups regularly.", "La grande base est stockée localement dans IndexedDB et prend en charge la synchronisation cloud avec votre compte. Exportez régulièrement des sauvegardes."],
  "حفظ اللعبة محليًا": ["Local game save", "Sauvegarde locale du jeu"],
  "عالم موسّع ومزامنة سحابية": ["Expanded world & cloud sync", "Monde étendu et synchronisation cloud"],
  "يجب تسجيل الدخول لاستخدام السحابة.": ["You must be signed in to use the cloud.", "Vous devez être connecté pour utiliser le cloud."],
  "لا توجد حفظة حالية لرفعها.": ["No current save to upload.", "Aucune sauvegarde actuelle à téléverser."],
  "تعذر رفع الحفظة إلى السحابة.": ["Failed to upload save to cloud.", "Échec du téléversement de la sauvegarde vers le cloud."],
  "تعذر جلب قائمة الحفظات.": ["Failed to fetch saves list.", "Impossible de récupérer la liste des sauvegardes."],
  "الحفظة المطلوبة غير متوفرة.": ["Requested save is not available.", "La sauvegarde demandée n'est pas disponible."],
  "تعذر حذف الحفظة السحابية.": ["Failed to delete cloud save.", "Impossible de supprimer la sauvegarde cloud."],
  "حفظ على جهازك · مزامنة سحابية اختيارية · بدون دفع": ["Save on your device · optional cloud sync · no payment", "Sauvegarde sur votre appareil · synchronisation cloud facultative · sans paiement"],
  "استرجاع من السحابة": ["Restore from cloud", "Restaurer depuis le cloud"],
  "تعذر إنشاء الحساب.": ["Failed to create account.", "Impossible de créer le compte."],
  "تعذر تسجيل الدخول.": ["Failed to sign in.", "Échec de la connexion."],
  "استرجاع الحفظة ومتابعة اللعب": ["Restore save & continue playing", "Restaurer la sauvegarde et continuer à jouer"],
  "إنشاء الحساب والمتابعة": ["Create account & continue", "Créer le compte et continuer"],
  "البريد الإلكتروني أو اسم المستخدم": ["Email or username", "E-mail ou nom d'utilisateur"],
  "كلمة المرور (٦ أحرف على الأقل)": ["Password (at least 6 characters)", "Mot de passe (au moins 6 caractères)"],
  "سجل الحفظات": ["Saves history", "Historique des sauvegardes"],
  "على هذا المتصفح": ["On this browser", "Sur ce navigateur"],
  "تصدير ملف": ["Export file", "Exporter le fichier"],
  "استيراد ملف": ["Import file", "Importer le fichier"],

  // Exact scanner matched phrases for 0.21 cloud
  "حفظتك مؤمنة ومرتبطة بحسابك؛ يمكنك المزامنة واللعب من أي جهاز (كمبيوتر أو هاتف) واسترجاع مسيرتك فورًا حتى لو حُذفت بيانات المتصفح": ["Your save is secured and linked to your account; you can sync and play from any device (PC or phone) and restore your career immediately even if browser data is cleared", "Votre sauvegarde est sécurisée et liée à votre compte ; vous pouvez synchroniser et jouer depuis n'importe quel appareil (PC ou téléphone) et restaurer votre carrière immédiatement même si les données du navigateur sont effacées"],
  "تسجيل الخروج": ["Sign out", "Déconnexion"],
  "آخر مزامنة سحابية": ["Last cloud sync", "Dernière synchronisation cloud"],
  "اختياري": ["Optional", "Facultatif"],
  "احفظ مسيرتك سحابيًا لحمايتها من مسح المتصفح التلقائي على الآيفون والكمبيوتر، وتنقل بين أجهزتك بحرية. اللعب بدون حساب يظل متاحًا ومحليًا 100٪": ["Save your career to the cloud to protect it from automatic browser wipes on iPhone and PC, and switch between your devices freely. Playing without an account remains available and 100% local", "Sauvegardez votre carrière sur le cloud pour la protéger des suppressions automatiques sur iPhone et PC, et passez d'un appareil à l'autre en toute liberté. Jouer sans compte reste disponible et 100 % local"],
  "القاعدة الكبيرة محفوظة محليًا في IndexedDB، وتدعم المزامنة السحابية بحسابك. صدّر نسخة احتياطية دوريًا": ["The large database is stored locally in IndexedDB and supports cloud sync with your account. Export backups regularly", "La grande base est stockée localement dans IndexedDB et prend en charge la synchronisation cloud avec votre compte. Exportez régulièrement des sauvegardes"],
  "كلمة المرور": ["Password", "Mot de passe"],
  "إلغاء": ["Cancel", "Annuler"],
  "البريد الإلكتروني": ["Email", "E-mail"],
  "اسم المستخدم (اسم المالك": ["Username (owner name", "Nom d'utilisateur (nom propriétaire"],
  "كلمة المرور (٦ أحرف على الأقل": ["Password (at least 6 characters", "Mot de passe (au moins 6 caractères"],
  "تم تسجيل الخروج بنجاح": ["Signed out successfully", "Déconnexion réussie"],
  "لا توجد مسيرة نشطة حاليًا للمزامنة": ["No active career currently to sync", "Aucune carrière active à synchroniser actuellement"],
  "تعذر إتمام المزامنة السحابية": ["Failed to complete cloud sync", "Échec de la synchronisation cloud"],
  "لا توجد أي حفظة سحابية مسجلة لحسابك حتى الآن. يمكنك مزامنة ناديك الحالي أولًا": ["No cloud saves registered for your account yet. You can sync your current club first", "Aucune sauvegarde cloud enregistrée pour votre compte pour l'instant. Vous pouvez d'abord synchroniser votre club actuel"],
  "حسنًا": ["OK", "D'accord"],
  "سيتم استبدال الحفظة النشطة على جهازك بالنسخة المحفوظة سحابيًا": ["The active save on your device will be replaced with the cloud copy", "La sauvegarde active sur votre appareil sera remplacée par la copie du cloud"],
  "لا توجد": ["None", "Aucun"],
  "السيولة": ["Cash", "Trésorerie"],
  "تعذر جلب الحفظة من السحابة": ["Failed to fetch save from cloud", "Impossible de récupérer la sauvegarde du cloud"],
  "تعذر فك واستعادة الحفظة السحابية": ["Failed to decode and restore cloud save", "Impossible de décoder et restaurer la sauvegarde cloud"],
  "لا توجد حفظات سحابية مسجلة بعد": ["No cloud saves registered yet", "Aucune sauvegarde cloud enregistrée pour le moment"],
  "يتم الاحتفاظ بآخر ٥ حفظات لحسابك تلقائيًا. يمكنك استرجاع أي نسخة أو حذفها": ["Your last 5 saves are kept automatically. You can restore or delete any version", "Vos 5 dernières sauvegardes sont conservées automatiquement. Vous pouvez restaurer ou supprimer n'importe quelle version"],
  "المزامنة": ["Sync", "Synchronisation"],
  "تعذر جلب سجل الحفظات": ["Failed to fetch saves history", "Impossible de récupérer l'historique des sauvegardes"],
  "تم حذف النسخة السحابية": ["Cloud save deleted", "Sauvegarde cloud supprimée"],
  "تعذر حذف الحفظة": ["Failed to delete save", "Impossible de supprimer la sauvegarde"],
  "تعذر إنشاء الحساب": ["Failed to create account", "Impossible de créer le compte"],
  "تعذر تسجيل الدخول": ["Failed to sign in", "Échec de la connexion"],
  "يجب تسجيل الدخول لاستخدام السحابة": ["You must be signed in to use the cloud", "Vous devez être connecté pour utiliser le cloud"],
  "لا توجد حفظة حالية لرفعها": ["No current save to upload", "Aucune sauvegarde actuelle à téléverser"],
  "تعذر رفع الحفظة إلى السحابة": ["Failed to upload save to cloud", "Échec du téléversement de la sauvegarde vers le cloud"],
  "تعذر جلب قائمة الحفظات": ["Failed to fetch saves list", "Impossible de récupérer la liste des sauvegardes"],
  "الحفظة المطلوبة غير متوفرة": ["Requested save is not available", "La sauvegarde demandée n'est pas disponible"],
  "تعذر حذف الحفظة السحابية": ["Failed to delete cloud save", "Impossible de supprimer la sauvegarde cloud"],
};
