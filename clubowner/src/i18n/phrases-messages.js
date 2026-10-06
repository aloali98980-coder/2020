// 0.19 — service-layer messages: inbox subjects/bodies, ledger labels, action errors and toasts
// raised by src/services/*. Leading verbs that precede an interpolated name are rendered as
// labels ("Accepted:", "Return:") so the English/French reads naturally around the name.
export const MESSAGE_PHRASES = {
  // clubManagement.js — coaches, line-up, press, offers
  "سامر مراد": ["Samer Mourad", "Samer Mourad"],
  "آدم منصور": ["Adam Mansour", "Adam Mansour"],
  "يوسف الحداد": ["Youssef El-Haddad", "Youssef El-Haddad"],
  "كريم عز الدين": ["Karim Ezzeldin", "Karim Ezzeldin"],
  "عمر فاروق": ["Omar Farouk", "Omar Farouk"],
  متوازن: ["Balanced", "Équilibré"],
  هجومي: ["Attacking", "Offensif"],
  دفاعي: ["Defensive", "Défensif"],
  "تطوير الشباب": ["Youth development", "Formation des jeunes"],
  "خبير بطولات": ["Cup specialist", "Spécialiste des coupes"],
  "ضغط عالٍ": ["High press", "Pressing haut"],
  "صلابة دفاعية": ["Defensive solidity", "Solidité défensive"],
  "هجوم شامل": ["Total attack", "Attaque totale"],
  "بناء وتدوير": ["Build-up and rotation", "Construction et rotation"],
  "عقلية الفوز": ["Winning mentality", "Mentalité de vainqueur"],
  "مدرب غير متاح": ["Coach unavailable", "Entraîneur indisponible"],
  "مدة عقد المدرب 1–3 سنوات": [
    "Coach contract length is 1–3 years",
    "Le contrat de l’entraîneur dure 1 à 3 ans",
  ],
  "هذا مدربك الحالي": [
    "This is your current coach",
    "C’est déjà votre entraîneur",
  ],
  "السيولة لا تغطي الفسخ والتوقيع": [
    "Cash does not cover the severance and the signing",
    "La trésorerie ne couvre pas l’indemnité et la signature",
  ],
  "فسخ وتوقيع عقد المدرب": [
    "Coach severance and signing",
    "Rupture et signature du contrat de l’entraîneur",
  ],
  "لا يوجد مدرب لإقالته": [
    "There is no coach to dismiss",
    "Aucun entraîneur à licencier",
  ],
  "السيولة لا تغطي التعويض (شهران عن كل سنة متبقية": [
    "Cash does not cover the compensation (two months per remaining year",
    "La trésorerie ne couvre pas l’indemnité (deux mois par année restante",
  ],
  "إقالة المدرب — تعويض": [
    "Coach dismissal — compensation of",
    "Licenciement de l’entraîneur — indemnité de",
  ],
  شهرًا: ["months", "mois"],
  "لا يوجد مدرب للتجديد": [
    "There is no coach to renew",
    "Aucun entraîneur à renouveler",
  ],
  "مدة التجديد 1–3 سنوات": [
    "Renewal length is 1–3 years",
    "Le renouvellement dure 1 à 3 ans",
  ],
  "السيولة لا تغطي مكافأة التجديد": [
    "Cash does not cover the renewal bonus",
    "La trésorerie ne couvre pas la prime de renouvellement",
  ],
  "مكافأة تجديد عقد المدرب": [
    "Coach renewal bonus",
    "Prime de renouvellement de l’entraîneur",
  ],
  "خطة غير صالحة": ["Invalid plan", "Plan invalide"],
  "لاعب غير متاح": ["Player unavailable", "Joueur indisponible"],
  "اختَر 11 لاعبًا كحد أقصى": [
    "Pick at most 11 players",
    "Choisissez au plus 11 joueurs",
  ],
  "حارس واحد بالتشكيل": [
    "Only one goalkeeper in the line-up",
    "Un seul gardien dans la composition",
  ],
  "التشكيل الكامل يحتاج حارسًا": [
    "A full line-up needs a goalkeeper",
    "Une composition complète exige un gardien",
  ],
  "السؤال أُجيب أو غير موجود": [
    "The question was already answered or does not exist",
    "Question déjà traitée ou inexistante",
  ],
  "رد غير صالح": ["Invalid reply", "Réponse invalide"],
  "الإدارة تدعم الجهاز الفني": [
    "The board backs the coaching staff",
    "La direction soutient le staff technique",
  ],
  "المالك يعد بإنهاء الموسم في النصف الأعلى": [
    "The owner promises a top-half finish",
    "Le propriétaire promet de finir dans la première moitié",
  ],
  "الإدارة ترفض التعليق": [
    "The board declines to comment",
    "La direction refuse de commenter",
  ],
  رسمي: ["Official", "Officiel"],
  "راتب المدرب الشهري": [
    "Coach’s monthly salary",
    "Salaire mensuel de l’entraîneur",
  ],
  "انتهى عقد المدرب": [
    "The coach’s contract has ended",
    "Le contrat de l’entraîneur est terminé",
  ],
  "المنصب شاغر الآن. عيّن مدربًا جديدًا من مركز الإدارة الرياضية؛ الفريق يعمل دون توجيه حتى التعيين":
    [
      "The post is vacant. Appoint a new coach from the sporting management hub; the team plays without guidance until then",
      "Le poste est vacant. Nommez un nouvel entraîneur depuis la direction sportive ; l’équipe joue sans consignes d’ici là",
    ],
  "المرصد الرياضي": ["The Sports Observer", "L’Observateur sportif"],
  "حصيلة آخر مباراة": ["Last match round-up", "Bilan du dernier match"],
  "وترقب لاختيارات المدرب": [
    "and anticipation of the coach’s choices",
    "et attente des choix de l’entraîneur",
  ],
  "تقرير مبني على المباراة": [
    "A report built on the match",
    "Compte rendu fondé sur le match",
  ],
  "صوت المدرج يسأل: ما رسالتك للجماهير عن طموح هذا الموسم؟": [
    "The stands are asking: what is your message to the fans about this season’s ambition?",
    "Les tribunes demandent : quel message adressez-vous aux supporters sur l’ambition de la saison ?",
  ],
  "سؤال صحفي للمالك": [
    "A press question for the owner",
    "Question de la presse au propriétaire",
  ],
  "راجع غرفة الصحافة للرد أو تجاهله. الصحيفة والشخصيات الإعلامية خيالية": [
    "Answer or ignore it from the press room. The newspaper and media figures are fictional",
    "Répondez ou ignorez depuis la salle de presse. Le journal et les figures médiatiques sont fictifs",
  ],
  "وصل عرض شراء للاعبك": [
    "A bid arrived for your player",
    "Une offre est arrivée pour votre joueur",
  ],
  "القرار لك من مركز الإدارة. لن يُباع اللاعب دون موافقتك": [
    "The decision is yours in the management hub. The player will not be sold without your approval",
    "La décision vous appartient depuis le centre de direction. Le joueur ne sera pas vendu sans votre accord",
  ],
  "العرض غير متاح": ["Offer unavailable", "Offre indisponible"],
  "اللاعب لم يعد في ناديك": [
    "The player is no longer at your club",
    "Le joueur n’est plus dans votre club",
  ],
  "لا تملك حق بيع لاعب مُعار": [
    "You cannot sell a loaned player",
    "Vous ne pouvez pas vendre un joueur prêté",
  ],
  "قائمة المشتري أصبحت مكتملة": [
    "The buyer’s squad is now full",
    "L’effectif de l’acheteur est désormais complet",
  ],
  "احتفظ بـ16 لاعبًا على الأقل": [
    "Keep at least 16 players",
    "Conservez au moins 16 joueurs",
  ],
  "النادي المشتري لم يعد يملك السيولة": [
    "The buying club no longer has the cash",
    "Le club acheteur n’a plus la trésorerie",
  ],
  بيع: ["Sale of", "Vente de"],
  "اللاعب غير مؤهل للإعارة التطويرية": [
    "The player is not eligible for a development loan",
    "Le joueur n’est pas éligible au prêt de formation",
  ],
  "القائمة مكتملة": ["The squad is full", "L’effectif est complet"],
  "إعارة واردة واحدة في النموذج الحالي": [
    "One incoming loan in the current model",
    "Un seul prêt entrant dans le modèle actuel",
  ],
  "السيولة لا تكفي رسوم الإعارة": [
    "Cash does not cover the loan fee",
    "La trésorerie ne couvre pas les frais de prêt",
  ],
  "إعارة ستة أشهر": ["Six-month loan", "Prêt de six mois"],
  "لاعب غير موجود": ["Player not found", "Joueur introuvable"],
  "تكلفة التقرير 10 آلاف": ["The report costs 10k", "Le rapport coûte 10 k"],
  "تقرير كشف تقديري": [
    "Estimated scouting report",
    "Rapport de recrutement estimatif",
  ],

  // legends.js (service)
  "الدور غير معروف": ["Unknown role", "Rôle inconnu"],
  "هذا الدور لا يناسب مركز الأسطورة": [
    "This role does not fit the legend’s position",
    "Ce rôle ne correspond pas au poste de la légende",
  ],
  "مدة العقد غير متاحة": [
    "Contract length unavailable",
    "Durée de contrat indisponible",
  ],
  "علاقته التاريخية بالنادي تجعله يقبل مباشرة، وبخصم على المقدم": [
    "His history with the club makes him accept at once, with a discount on the advance",
    "Son histoire avec le club le fait accepter aussitôt, avec une remise sur l’avance",
  ],
  "سمعة النادي تكفي لإقناعه بالمشروع": [
    "The club’s reputation is enough to convince him of the project",
    "La réputation du club suffit à le convaincre du projet",
  ],
  "لن ينضم لغريم ناديه التاريخي مهما كان العرض": [
    "He will never join his historic club’s rival, whatever the offer",
    "Il ne rejoindra jamais le rival de son club historique, quelle que soit l’offre",
  ],
  "وضع عودة الأساطير كلاعبين متوقف من الإعدادات": [
    "Legends comeback mode is disabled in settings",
    "Le mode retour des légendes est désactivé dans les réglages",
  ],
  "متردد بسبب سمعة النادي: يطلب علاوة مشروع على المقدم والراتب": [
    "Hesitant because of the club’s reputation: he asks a project premium on the advance and salary",
    "Hésitant à cause de la réputation du club : il demande une prime de projet sur l’avance et le salaire",
  ],
  "أقل بكثير من مستوى المشروع الذي يبحث عنه (يحتاج": [
    "far below the project level he is looking for (needs",
    "bien en deçà du projet qu’il recherche (il faut",
  ],
  "على الأقل": ["at least", "au moins"],
  "الأسطورة مرتبطة بعقد نشط بالفعل": [
    "The legend already has an active contract",
    "La légende a déjà un contrat actif",
  ],
  يوجد: ["There is already a", "Il y a déjà un"],
  "أسطوري بالفعل؛ أنهِ عقده أولًا": [
    "legend in that role; end his contract first",
    "légendaire à ce poste ; résiliez d’abord son contrat",
  ],
  "يوجد سفير أسطوري بالفعل": [
    "There is already a legend ambassador",
    "Il y a déjà un ambassadeur légendaire",
  ],
  "الحد الأقصى": ["Maximum", "Maximum"],
  "أسطورة كلاعبين في الوقت نفسه": [
    "legends as players at the same time",
    "légendes comme joueurs en même temps",
  ],
  "القائمة ممتلئة؛ حرّر مكانًا أولًا": [
    "The squad is full; free a place first",
    "L’effectif est complet ; libérez d’abord une place",
  ],
  "راتب الأسطورة يتجاوز ميزانية المرتبات": [
    "The legend’s salary exceeds the wage budget",
    "Le salaire de la légende dépasse la masse salariale",
  ],
  "السيولة لا تكفي لمقدم العقد وأول راتب": [
    "Cash does not cover the advance and the first salary",
    "La trésorerie ne couvre pas l’avance et le premier salaire",
  ],
  "مقدم تعاقد الأسطورة": [
    "Legend signing advance",
    "Avance de signature de la légende",
  ],
  "ينضم إلى": ["joins", "rejoint"],
  "عودة خيالية": ["Fantasy comeback", "Retour fictif"],
  "يلعب لك حتى": ["plays for you until", "joue pour vous jusqu’au"],
  بتقييم: ["with a rating of", "avec une note de"],
  مقدم: ["advance", "avance"],
  "وراتب شهري": ["and a monthly salary of", "et un salaire mensuel de"],
  "العقد غير نشط": ["Contract not active", "Contrat inactif"],
  "السيولة لا تكفي لتعويض إنهاء العقد": [
    "Cash does not cover the termination compensation",
    "La trésorerie ne couvre pas l’indemnité de résiliation",
  ],
  "تعويض إنهاء عقد الأسطورة": [
    "Legend termination compensation",
    "Indemnité de résiliation de la légende",
  ],
  "إنهاء عقد": ["Contract ended:", "Fin de contrat :"],
  "دفعت تعويضًا": [
    "You paid compensation of",
    "Vous avez versé une indemnité de",
  ],
  "وأُنهي العقد بالتراضي": [
    "and the contract ended by mutual consent",
    "et le contrat a pris fin d’un commun accord",
  ],
  "عقود اللاعبين تُجدد من شاشة الفريق كأي لاعب": [
    "Player contracts are renewed from the squad screen like any player",
    "Les contrats de joueurs se renouvellent depuis l’écran de l’équipe",
  ],
  "مدة التجديد غير متاحة": [
    "Renewal length unavailable",
    "Durée de renouvellement indisponible",
  ],
  "السيولة لا تكفي لمكافأة التجديد (راتب شهر": [
    "Cash does not cover the renewal bonus (one month’s salary",
    "La trésorerie ne couvre pas la prime de renouvellement (un mois de salaire",
  ],
  "مكافأة تجديد": ["Renewal bonus:", "Prime de renouvellement :"],
  "العقد ممتد حتى": ["Contract extended until", "Contrat prolongé jusqu’au"],
  "مكافأة التجديد": ["Renewal bonus", "Prime de renouvellement"],
  "يدخل قاعة إرث النادي": [
    "enters the club’s Hall of Legacy",
    "entre au Panthéon du club",
  ],
  "اعتزل بعد": ["Retired after", "Retraite après"],
  "مباراة و": ["matches and ", "matchs et "],
  "هدفًا مع النادي. اسمه الآن على جدار القاعة": [
    "goals for the club. His name is now on the hall’s wall",
    "buts pour le club. Son nom figure désormais sur le mur du Panthéon",
  ],
  "حقوق صورة وفعاليات السفير": [
    "Ambassador image rights and events",
    "Droits à l’image et événements de l’ambassadeur",
  ],
  "غادر النادي": ["left the club", "a quitté le club"],
  "انتهت عودة الأسطورة بعد رحيله عن الفريق": [
    "The legend’s comeback ended when he left the team",
    "Le retour de la légende a pris fin avec son départ",
  ],
  "يعلن اعتزاله مجددًا": [
    "retires once again",
    "annonce à nouveau sa retraite",
  ],
  "انتهت العودة الخيالية بعد": [
    "The fantasy comeback ended after",
    "Le retour fictif s’achève après",
  ],
  "هدفًا. الجماهير تودّعه بالتصفيق": [
    "goals. The fans applaud him off",
    "buts. Les supporters l’applaudissent",
  ],
  "انتهت مدة عمله كـ": ["His spell ended as", "Fin de sa mission comme"],
  "يمكنك التعاقد معه مجددًا من قاعة الأساطير": [
    "You can sign him again from the Hall of Legends",
    "Vous pouvez le réengager depuis le Panthéon des légendes",
  ],
  "راتب الأسطورة": ["Legend salary", "Salaire de la légende"],

  // loans.js
  "شروط الإعارة غير سليمة": [
    "Invalid loan terms",
    "Conditions de prêt invalides",
  ],
  "الإعارات الموسعة تحتاج عالمًا موسعًا": [
    "Extended loans need the expanded world",
    "Les prêts étendus exigent le monde étendu",
  ],
  "اللاعب غير متاح للإعارة": [
    "The player is not available for loan",
    "Le joueur n’est pas disponible pour un prêt",
  ],
  "أكمل العروض المعلقة أولًا": [
    "Finish the pending offers first",
    "Terminez d’abord les offres en attente",
  ],
  "اختر ناديًا مستعيرًا متاحًا": [
    "Choose an available borrowing club",
    "Choisissez un club emprunteur disponible",
  ],
  "عقد اللاعب يجب أن يستمر لما بعد نهاية الإعارة": [
    "The player’s contract must outlast the loan",
    "Le contrat du joueur doit dépasser la fin du prêt",
  ],
  "يوجد تفاوض قائم مع هذا اللاعب": [
    "A negotiation with this player is already open",
    "Une négociation est déjà en cours avec ce joueur",
  ],
  "أُرسل عرض إعارة": ["Loan offer sent for", "Offre de prêt envoyée pour"],
  "الرد في اليوم التالي. لم تخصم رسوم، ولم ينتقل اللاعب. شروط الرد تحتاج موافقتك":
    [
      "Reply comes the next day. No fee was charged and the player has not moved. The reply terms need your approval",
      "Réponse le lendemain. Aucun frais débité, le joueur n’a pas bougé. Les conditions de la réponse exigent votre accord",
    ],
  "تغيرت إتاحة اللاعب أو أُغلق السوق": [
    "The player’s availability changed or the market closed",
    "La disponibilité du joueur a changé ou le marché a fermé",
  ],
  "رفض فني أو قائمة غير كافية لدى أحد الناديين": [
    "Sporting refusal or an insufficient squad at one of the clubs",
    "Refus sportif ou effectif insuffisant dans l’un des clubs",
  ],
  "رد الإعارة": ["Loan reply:", "Réponse au prêt :"],
  رسوم: ["Fee", "Frais"],
  "ج.م · المستعير يدفع": ["EGP · the borrower pays", "EGP · l’emprunteur paie"],
  "يومًا. راجع التفاصيل قبل الموافقة، وخيار الشراء يلزم المالك إذا فعّله المستعير":
    [
      "days. Check the details before approving; the purchase option binds the owner if the borrower triggers it",
      "jours. Vérifiez les détails avant d’accepter ; l’option d’achat engage le propriétaire si l’emprunteur l’active",
    ],
  "رفض عرض إعارة": ["Loan offer declined:", "Offre de prêt refusée :"],
  "العرض انتهى": ["The offer expired", "L’offre a expiré"],
  "انتظر الرد أو أعد تقديم عرض منتهي": [
    "Wait for the reply or resubmit an expired offer",
    "Attendez la réponse ou renouvelez une offre expirée",
  ],
  "تغيرت إتاحة اللاعب": [
    "The player’s availability changed",
    "La disponibilité du joueur a changé",
  ],
  "لم تعد مدة العقد تكفي للإعارة": [
    "The contract no longer runs long enough for the loan",
    "Le contrat ne court plus assez longtemps pour le prêt",
  ],
  "أحد الناديين لا يستوفي حد القائمة": [
    "One of the clubs does not meet the squad limit",
    "L’un des clubs ne respecte pas la limite d’effectif",
  ],
  "الحد خمس إعارات نشطة في كل اتجاه": [
    "The limit is five active loans in each direction",
    "La limite est de cinq prêts actifs dans chaque sens",
  ],
  "احتفظ بمساحة لعودة المعارين؛ القائمة مكتملة": [
    "Keep room for returning loanees; the squad is full",
    "Gardez de la place pour les prêtés qui reviennent ; l’effectif est complet",
  ],
  "تجاوز ميزانية المرتبات": [
    "Exceeds the wage budget",
    "Dépasse la masse salariale",
  ],
  "ميزانية المستعير لا تكفي": [
    "The borrower’s budget is insufficient",
    "Le budget de l’emprunteur est insuffisant",
  ],
  "رسوم استعارة": ["Loan-in fee:", "Frais de prêt entrant :"],
  "رسوم إعارة": ["Loan-out fee:", "Frais de prêt sortant :"],
  "بدأت إعارة": ["Loan started:", "Prêt commencé :"],
  "نسبة الراتب على المستعير؛ مكافآت المباريات عليه أيضًا. الرسوم غير مستردة. خيار الشراء ينقل العقد الحالي دون تمديده. العودة تتم تلقائيًا ولا تعيد توليد اللاعب":
    [
      "The wage share falls on the borrower, as do match bonuses. Fees are not refunded. The purchase option transfers the current contract without extending it. The return is automatic and never regenerates the player",
      "La part de salaire incombe à l’emprunteur, tout comme les primes de match. Frais non remboursables. L’option d’achat transfère le contrat actuel sans le prolonger. Le retour est automatique et ne régénère jamais le joueur",
    ],
  "عودة من الإعارة": ["Back from loan:", "Retour de prêt :"],
  "الرسوم المدفوعة لا تُرد، وعقد اللاعب الأصلي مستمر ما لم ينتهِ": [
    "Paid fees are not refunded, and the player’s original contract continues unless it has expired",
    "Les frais versés ne sont pas remboursés et le contrat d’origine se poursuit sauf s’il a expiré",
  ],
  "الاستدعاء للمالك فقط إذا اتُّفق عليه وبعد 60 يومًا": [
    "Only the owner may recall, if agreed and after 60 days",
    "Seul le propriétaire peut rappeler, si convenu et après 60 jours",
  ],
  "استدعاء مبكر وفق الشرط المتفق عليه": [
    "Early recall under the agreed clause",
    "Rappel anticipé selon la clause convenue",
  ],
  "خيار الشراء غير متاح": [
    "Purchase option unavailable",
    "Option d’achat indisponible",
  ],
  "المستعير وحده يقرر تفعيل الخيار": [
    "Only the borrower decides to trigger the option",
    "Seul l’emprunteur décide d’activer l’option",
  ],
  "السيولة لا تكفي": ["Insufficient cash", "Trésorerie insuffisante"],
  "الراتب الكامل يتجاوز الميزانية": [
    "The full wage exceeds the budget",
    "Le salaire complet dépasse le budget",
  ],
  "تفعيل شراء": ["Purchase option triggered:", "Option d’achat activée :"],
  "سيولة المستعير لا تكفي": [
    "The borrower’s cash is insufficient",
    "La trésorerie de l’emprunteur est insuffisante",
  ],
  "المستعير فعّل شراء": ["The borrower bought", "L’emprunteur a acheté"],
  "انتقال نهائي": ["Permanent transfer", "Transfert définitif"],
  "فُعّل خيار الشراء المتفق عليه. العقد الحالي والراتب مستمران دون تمديد تلقائي؛ لم تُحصّل رسوم الإعارة مرة ثانية":
    [
      "The agreed purchase option was triggered. The current contract and wage continue without automatic extension; the loan fee was not collected twice",
      "L’option d’achat convenue a été activée. Contrat et salaire actuels se poursuivent sans prolongation automatique ; les frais de prêt n’ont pas été perçus deux fois",
    ],
  "اعتزال اللاعب": ["The player retired", "Retraite du joueur"],
  "انتهى العقد": ["The contract ended", "Le contrat est terminé"],
  "النادي الآخر لم يعد قادرًا على تحمل حصته من الراتب": [
    "The other club can no longer afford its share of the wage",
    "L’autre club ne peut plus assumer sa part du salaire",
  ],
  "النادي الأصلي استدعى اللاعب بسبب قلة المشاركات الموعودة": [
    "The parent club recalled the player over the promised playing time",
    "Le club d’origine a rappelé le joueur faute du temps de jeu promis",
  ],
  "مراجعة إعارة": ["Loan review:", "Bilan de prêt :"],
  "المشاركة أقل من وعد الأساسي. انخفضت المعنويات؛ راجع التشكيل أو استدعِ اللاعب إذا كان الشرط يسمح":
    [
      "Playing time is below the starter promise. Morale dropped; review the line-up or recall the player if the clause allows",
      "Le temps de jeu est inférieur à la promesse de titulaire. Le moral a baissé ; revoyez la composition ou rappelez le joueur si la clause le permet",
    ],

  // commerce.js
  "متجر النادي": ["Club shop", "Boutique du club"],
  "خدمات يوم المباراة": ["Matchday services", "Services de jour de match"],
  "جولات الملعب": ["Stadium tours", "Visites du stade"],
  "مدرسة الكرة": ["Football school", "École de football"],
  "ضيافة الشركات": ["Corporate hospitality", "Hospitalité d’entreprise"],
  "نشاط غير متاح أو مفتوح بالفعل": [
    "Venture unavailable or already open",
    "Activité indisponible ou déjà ouverte",
  ],
  "سمعة النادي أقل من المطلوب": [
    "The club’s reputation is below the requirement",
    "La réputation du club est insuffisante",
  ],
  "السيولة غير كافية": ["Insufficient cash", "Trésorerie insuffisante"],
  تجهيز: ["Set-up:", "Mise en place :"],
  "افتح المتجر أولًا": ["Open the shop first", "Ouvrez d’abord la boutique"],
  "الكمية 10 إلى 2000": [
    "Quantity between 10 and 2000",
    "Quantité entre 10 et 2000",
  ],
  "سعة المخزن 5000": [
    "Warehouse capacity is 5000",
    "Capacité de stockage : 5000",
  ],
  "شراء مخزون قمصان": ["Shirt stock purchase", "Achat de stock de maillots"],
  "التذكرة بين 20 و1000": [
    "Ticket between 20 and 1000",
    "Billet entre 20 et 1000",
  ],
  "القميص بين 200 و1500": [
    "Shirt between 200 and 1500",
    "Maillot entre 200 et 1500",
  ],
  عادية: ["Standard", "Standard"],
  أولى: ["Premium", "Première"],
  "الأولى بين 40 و2000": [
    "Premium between 40 and 2000",
    "Première entre 40 et 2000",
  ],
  "المقصورة بين 100 و5000": [
    "Boxes between 100 and 5000",
    "Loges entre 100 et 5000",
  ],
  "ترتيب الفئات: المقصورة ≥ الأولى ≥ العادية": [
    "Category order: boxes ≥ premium ≥ standard",
    "Ordre des catégories : loges ≥ première ≥ standard",
  ],
  "علاوة المباراة غير صالحة": [
    "Invalid match surcharge",
    "Majoration de match invalide",
  ],
  "بيع الاشتراكات مرة واحدة للموسم": [
    "Season tickets are sold once per season",
    "Les abonnements se vendent une fois par saison",
  ],
  "عدد المباريات المتبقية غير كافٍ": [
    "Not enough matches remaining",
    "Pas assez de matchs restants",
  ],
  "اشتراكات الموسم — لا تُحصّل المقاعد مرة أخرى": [
    "Season tickets — seats are not charged again",
    "Abonnements — les places ne sont pas facturées deux fois",
  ],
  "تذاكر منفردة بعد خصم الاشتراكات": [
    "Single tickets after season-ticket deduction",
    "Billets à l’unité après déduction des abonnements",
  ],
  "تشغيل المباراة": ["Match operations", "Organisation du match"],
  "مبيعات خدمات المدرجات": [
    "Concourse service sales",
    "Ventes des services en tribunes",
  ],
  "تكلفة خدمات المدرجات": [
    "Concourse service costs",
    "Coût des services en tribunes",
  ],
  "ترقية ضيافة — تكلفة المقعد الأساسي محسوبة بالتذاكر": [
    "Hospitality upgrade — the base seat is already counted in tickets",
    "Surclassement hospitalité — la place de base est déjà comptée dans la billetterie",
  ],
  "تشغيل الضيافة": ["Hospitality operations", "Exploitation de l’hospitalité"],
  "ودية تجارية واحدة كل 30 يومًا": [
    "One commercial friendly every 30 days",
    "Un match amical commercial tous les 30 jours",
  ],
  "موعد قريب من مباراة رسمية": [
    "Too close to an official match",
    "Trop proche d’un match officiel",
  ],
  "تكلفة تنظيم الودية 120 ألفًا": [
    "Staging the friendly costs 120k",
    "L’organisation de l’amical coûte 120 k",
  ],
  "تنظيم ودية تجارية": [
    "Commercial friendly staging",
    "Organisation d’un amical commercial",
  ],
  "إيراد ودية تجارية مبسطة": [
    "Simplified commercial friendly income",
    "Recette simplifiée d’amical commercial",
  ],
  إيراد: ["Income:", "Recette :"],
  "مبيعات قمصان": ["Shirt sales", "Ventes de maillots"],

  // transfers.js
  "اللاعب مُعار؛ لا يمكن شراء عقده في هذا النموذج": [
    "The player is on loan; his contract cannot be bought in this model",
    "Le joueur est prêté ; son contrat ne peut pas être acheté dans ce modèle",
  ],
  "اللاعب غير متاح للشراء": [
    "The player is not available to buy",
    "Le joueur n’est pas à vendre",
  ],
  "يوجد تفاوض قائم مع اللاعب": [
    "A negotiation with the player is already open",
    "Une négociation est déjà en cours avec le joueur",
  ],
  "راجع قيمة العرض ونسبة المقدم": [
    "Check the offer value and the advance share",
    "Vérifiez la valeur de l’offre et la part d’avance",
  ],
  "السيولة لا تكفي لمقدم العرض": [
    "Cash does not cover the offer’s advance",
    "La trésorerie ne couvre pas l’avance de l’offre",
  ],
  "يوجد تفاوض إعارة قائم": [
    "A loan negotiation is already open",
    "Une négociation de prêt est déjà en cours",
  ],
  "أرسلنا العرض إلى نادي": [
    "We sent the offer to",
    "Nous avons envoyé l’offre à",
  ],
  "الرد المتوقع غدًا؛ لم يتم خصم أي مبلغ": [
    "Reply expected tomorrow; nothing has been charged",
    "Réponse attendue demain ; rien n’a été débité",
  ],
  "عرض مضاد": ["Counter-offer", "Contre-offre"],
  "النادي وافق على قيمة العرض. الاتفاق النهائي يتطلب التفاوض على عقد اللاعب والفحص والتسجيل":
    [
      "The club accepted the offer value. The final deal still needs the player’s contract, the medical and registration",
      "Le club a accepté la valeur de l’offre. L’accord final exige encore le contrat du joueur, la visite médicale et l’enregistrement",
    ],
  "النادي يطلب زيادة قيمة الانتقال. يمكنك قبول القيمة الجديدة والانتقال لشروط اللاعب، أو إنهاء التفاوض":
    [
      "The club asks for a higher fee. You can accept the new value and move on to the player’s terms, or end the negotiation",
      "Le club demande une indemnité plus élevée. Vous pouvez accepter la nouvelle valeur et passer aux conditions du joueur, ou clore la négociation",
    ],
  "حدد المرتب ومدة العقد والمكافأة والدور. لم تكتمل الصفقة بعد ولن تُخصم الأموال قبل التوقيع":
    [
      "Set the wage, contract length, bonus and role. The deal is not complete and nothing is charged before signing",
      "Fixez salaire, durée, prime et rôle. L’opération n’est pas finalisée et rien n’est débité avant la signature",
    ],
  "ابدأ باتفاق مع النادي أولًا": [
    "Reach an agreement with the club first",
    "Trouvez d’abord un accord avec le club",
  ],
  "اللاعب معار الآن": [
    "The player is currently on loan",
    "Le joueur est actuellement prêté",
  ],
  "تغيرت ملكية اللاعب أو اعتزل؛ أعد التفاوض": [
    "The player changed club or retired; negotiate again",
    "Le joueur a changé de club ou pris sa retraite ; renégociez",
  ],
  "شروط العقد غير صالحة": [
    "Invalid contract terms",
    "Conditions de contrat invalides",
  ],
  "اللاعب يرفض المرتب. جرّب الاقتراب من طلبه الموضّح": [
    "The player rejects the wage. Try moving closer to his stated demand",
    "Le joueur refuse le salaire. Rapprochez-vous de sa demande indiquée",
  ],
  "قائمة الفريق ممتلئة؛ راجع الحد الموضح في شاشة الفريق": [
    "The squad is full; check the limit shown on the squad screen",
    "L’effectif est complet ; vérifiez la limite affichée sur l’écran de l’équipe",
  ],
  "تجاوز ميزانية المرتبات الشهرية": [
    "Exceeds the monthly wage budget",
    "Dépasse la masse salariale mensuelle",
  ],
  "السيولة لا تكفي للمقدم ومكافأة التوقيع وعمولة الوكيل": [
    "Cash does not cover the advance, signing bonus and agent fee",
    "La trésorerie ne couvre pas l’avance, la prime à la signature et la commission d’agent",
  ],
  "مقدم شراء": ["Transfer advance:", "Avance de transfert :"],
  "عمولة وكيل": ["Agent fee:", "Commission d’agent :"],
  "مكافأة توقيع": ["Signing bonus:", "Prime à la signature :"],
  "قسط شراء": ["Transfer instalment:", "Mensualité de transfert :"],
  "اللاعب اعتزل ولا يمكن تسجيله": [
    "The player retired and cannot be registered",
    "Le joueur a pris sa retraite et ne peut pas être enregistré",
  ],
  "تم التوقيع والتسجيل وفق قواعد القائمة التجريبية. الفحص الطبي في هذه النسخة مبسّط ونتيجته سليمة؛ النظام الطبي التفصيلي لاحقًا":
    [
      "Signed and registered under the trial squad rules. The medical in this version is simplified and passed; a detailed medical system comes later",
      "Signé et enregistré selon les règles d’effectif d’essai. La visite médicale est simplifiée et concluante ; un système médical détaillé viendra plus tard",
    ],
  "عقد اللاعب المُعار يخص ناديه الأصلي": [
    "A loaned player’s contract belongs to his parent club",
    "Le contrat d’un joueur prêté appartient à son club d’origine",
  ],
  "اللاعب ليس في النادي": [
    "The player is not at the club",
    "Le joueur n’est pas au club",
  ],
  "شروط غير صالحة": ["Invalid terms", "Conditions invalides"],
  "اللاعب يطلب الحفاظ على مرتبه على الأقل": [
    "The player asks to keep at least his current wage",
    "Le joueur demande au moins le maintien de son salaire",
  ],
  "تم تحديث العقد والمرتب والدور داخل الفريق": [
    "Contract, wage and role updated within the squad",
    "Contrat, salaire et rôle mis à jour dans l’équipe",
  ],

  // sponsors.js
  محلي: ["Local", "Local"],
  "عرض رعاية غير صالح": [
    "Invalid sponsorship offer",
    "Offre de sponsoring invalide",
  ],
  "المساحة محجوزة بعقد قائم": [
    "The space is taken by an active contract",
    "L’espace est occupé par un contrat en cours",
  ],
  "يوجد تعارض مع حصرية قطاع راعٍ قائم": [
    "Conflicts with an existing sponsor’s sector exclusivity",
    "Conflit avec l’exclusivité sectorielle d’un sponsor existant",
  ],
  "دفعة توقيع": ["Signing payment:", "Versement à la signature :"],
  "شراكة جديدة للنادي": [
    "A new partnership for the club",
    "Nouveau partenariat pour le club",
  ],
  "تم توقيع رعاية": ["Sponsorship signed for", "Sponsoring signé pour"],
  مع: ["with", "avec"],
  "استلمت ٢٥٪ مقدمًا، والباقي على ١١ دفعة كل ٣٠ يومًا": [
    "You received 25% upfront; the rest comes in 11 instalments every 30 days",
    "Vous avez reçu 25 % d’avance ; le reste suit en 11 versements tous les 30 jours",
  ],
  "انتهى عقد رعاية": ["Sponsorship ended:", "Sponsoring terminé :"],
  "أصبحت المساحة الإعلانية متاحة لعروض جديدة": [
    "The advertising space is open to new offers",
    "L’espace publicitaire est ouvert à de nouvelles offres",
  ],
  "نسبة التفاوض غير صالحة": [
    "Invalid negotiation percentage",
    "Pourcentage de négociation invalide",
  ],
  "تم الاتفاق بالفعل؛ وقّع العرض أو ارفضه أولًا": [
    "Already agreed; sign or decline the offer first",
    "Déjà convenu ; signez ou refusez d’abord l’offre",
  ],
  "انتهت جولات التفاوض مع هذا الراعي": [
    "No negotiation rounds left with this sponsor",
    "Plus de tour de négociation avec ce sponsor",
  ],
  وافق: ["Accepted:", "Accord :"],
  "على طلبك": ["agreed to your request", "a accepté votre demande"],
  "عرض مضاد من": ["Counter-offer from", "Contre-offre de"],
  انسحب: ["Withdrawn:", "Retrait :"],
  "من التفاوض": ["left the negotiation", "s’est retiré de la négociation"],
  "قبل الراعي القيمة المطلوبة. يمكنك التوقيع بهذه القيمة من شاشة الرعايات": [
    "The sponsor accepted the requested value. You can sign at that value from the sponsorship screen",
    "Le sponsor a accepté la valeur demandée. Vous pouvez signer à cette valeur depuis l’écran sponsoring",
  ],
  "الراعي قابل طلبك في المنتصف. يمكنك التوقيع بالقيمة المضادة أو المحاولة مرة أخيرة":
    [
      "The sponsor met you halfway. Sign at the counter value or try one last time",
      "Le sponsor coupe la poire en deux. Signez à la contre-valeur ou tentez une dernière fois",
    ],
  "طلبك تجاوز سقف الراعي لسمعة ناديك الحالية. العروض الأخرى ما زالت متاحة": [
    "Your ask exceeded the sponsor’s ceiling for your current reputation. The other offers remain open",
    "Votre demande dépasse le plafond du sponsor pour votre réputation actuelle. Les autres offres restent ouvertes",
  ],
  "التفاوض غير متاح": ["Negotiation unavailable", "Négociation indisponible"],
  "لقب الدوري": ["League title", "Titre de champion"],
  "لقب الكأس المحلية": ["Domestic cup", "Coupe nationale"],
  "التأهل القاري": ["Continental qualification", "Qualification continentale"],
  مكافأة: ["Bonus:", "Prime :"],
  "مكافآت أداء من الرعاة": [
    "Performance bonuses from sponsors",
    "Primes de performance des sponsors",
  ],
  "لكل عقد قائم": ["for every active contract", "pour chaque contrat en cours"],
  "صُرفت تلقائيًا نهاية الموسم": [
    "paid automatically at season end",
    "versées automatiquement en fin de saison",
  ],

  // staff.js
  "الموظف أو الدور غير متاح": [
    "Staff member or role unavailable",
    "Membre du personnel ou rôle indisponible",
  ],
  "حد الطاقم في هذه النسخة ٣ أدوار، بموظف واحد لكل دور": [
    "This version allows 3 staff roles, one person per role",
    "Cette version permet 3 rôles, une personne par rôle",
  ],
  "الدور مشغول؛ أنهِ عقد الموظف الحالي أولًا": [
    "The role is filled; end the current contract first",
    "Le rôle est occupé ; résiliez d’abord le contrat actuel",
  ],
  "يلزم رصيد يغطي شهرًا واحدًا على الأقل": [
    "You need cash for at least one month",
    "Il faut une trésorerie couvrant au moins un mois",
  ],
  انضمام: ["Staff arrival:", "Arrivée :"],
  "إلى الجهاز": ["joins the staff", "rejoint le staff"],
  "تم التعيين بدور": ["Appointed as", "Nommé au poste de"],
  "المرتب يصرف مع التشغيل أول كل شهر. قدراته المهنية محاكاة مستقلة عن قدراته كلاعب":
    [
      "The salary is paid with operations on the first of each month. His professional skills are simulated separately from his playing ability",
      "Le salaire est versé avec les charges le premier de chaque mois. Ses compétences professionnelles sont simulées indépendamment de ses qualités de joueur",
    ],
  "الموظف غير معين": [
    "Staff member not appointed",
    "Membre du personnel non nommé",
  ],
  "تعويض إنهاء العقد يساوي شهرين": [
    "Termination compensation equals two months",
    "L’indemnité de résiliation vaut deux mois",
  ],
  تعويض: ["Compensation:", "Indemnité :"],
  "الدورة غير متاحة": ["Course unavailable", "Formation indisponible"],
  "تكلفة الدورة ١٠٠ ألف جنيه": [
    "The course costs EGP 100k",
    "La formation coûte 100 k EGP",
  ],
  "دورة مهنية": ["Professional course:", "Formation professionnelle :"],
  "مهمة غير صالحة": ["Invalid assignment", "Mission invalide"],
  "الكشاف مشغول بمهمة قائمة": [
    "The scout is busy with an ongoing assignment",
    "Le recruteur est occupé par une mission en cours",
  ],
  "ميزانية المهمة ٤٠ ألف جنيه": [
    "The assignment budget is EGP 40k",
    "Le budget de la mission est de 40 k EGP",
  ],
  "اكتملت دورة": ["Course completed:", "Formation terminée :"],
  "تحسنت المهارة المهنية الأساسية ٦ نقاط حتى حد ٩٥. أثره في النادي يتحدث تلقائيًا":
    [
      "Core professional skill improved by 6 points up to a cap of 95. His effect on the club updates automatically",
      "La compétence principale progresse de 6 points jusqu’à 95. Son effet sur le club se met à jour automatiquement",
    ],
  المهني: ["professional", "professionnel"],
  "توقف مرتب الموظف وتأثيره في النادي. يمكنك إعادة تعيينه من الجهاز الفني": [
    "The salary and the club effect have stopped. You can reappoint him from the staff screen",
    "Le salaire et l’effet sur le club cessent. Vous pouvez le renommer depuis l’écran du staff",
  ],
  "تقرير كشف": ["Scouting report:", "Rapport de recrutement :"],
  "وصل نطاق تقدير الإمكانات إلى ملف اللاعب. كلما تحسنت مهارة الكشاف ضاق النطاق، لكنه ليس ضمانًا لمستقبل اللاعب":
    [
      "The potential range is now on the player’s profile. The better the scout, the narrower the range — never a guarantee of the player’s future",
      "La fourchette de potentiel figure sur la fiche du joueur. Plus le recruteur est compétent, plus elle est étroite — jamais une garantie sur l’avenir du joueur",
    ],

  // facilities.js (service)
  "منشأة غير موجودة": ["Facility not found", "Installation introuvable"],
  "يوجد مشروع قيد التنفيذ": [
    "A project is already under way",
    "Un projet est déjà en cours",
  ],
  "وصلت إلى الحد المتاح في النسخة التجريبية": [
    "You reached the limit available in the trial version",
    "Vous avez atteint la limite de la version d’essai",
  ],
  "يلزم توفير قيمة المشروع كاملة كاحتياطي قبل الالتزام به": [
    "The full project value must be held in reserve before committing",
    "La valeur totale du projet doit être en réserve avant l’engagement",
  ],
  "مقدم تطوير": ["Development advance:", "Avance de développement :"],
  "دفعة استلام": ["Delivery payment:", "Versement à la livraison :"],
  "بدأ مشروع": ["Project started:", "Projet lancé :"],
  "تم دفع ٤٠٪. الاستلام المتوقع": [
    "40% paid. Expected delivery",
    "40 % versés. Livraison prévue le",
  ],
  "مع سداد الباقي وإضافة تكلفة التشغيل": [
    "with the balance due then and operating costs added",
    "avec le solde à régler alors et les coûts d’exploitation en plus",
  ],
  "هذه المنشأة لا تتطلب تعيينًا مستقلًا": [
    "This facility needs no separate appointment",
    "Cette installation n’exige pas de nomination distincte",
  ],
  "تعيين موظف متخصص": [
    "Specialist appointment:",
    "Nomination d’un spécialiste :",
  ],
  "إنهاء تكليف الموظف": ["Assignment ended:", "Fin de mission :"],
  "تم تحديث طاقم": ["Staff updated:", "Personnel mis à jour :"],
  "التكلفة الشهرية والأثر التشغيلي يتغيران وفقًا لذلك": [
    "Monthly cost and operating effect change accordingly",
    "Coût mensuel et effet d’exploitation évoluent en conséquence",
  ],
  "اكتمل تطوير": ["Development completed:", "Développement achevé :"],
  "البناء مكتمل؛ عيّن الموظف المطلوب لتفعيل الأثر الرياضي": [
    "Construction is complete; appoint the required staff to activate the sporting effect",
    "Construction terminée ; nommez le personnel requis pour activer l’effet sportif",
  ],
  "المنشأة تعمل بمستواها الجديد. راجع تكاليف التشغيل والأثر": [
    "The facility runs at its new level. Check operating costs and effect",
    "L’installation fonctionne à son nouveau niveau. Vérifiez coûts d’exploitation et effet",
  ],

  // talent/academy.js
  "الأكاديمية الجديدة تحتاج العالم الموسع": [
    "The new academy needs the expanded world",
    "La nouvelle académie exige le monde étendu",
  ],
  "دفعة واحدة لكل موسم؛ احسم الدفعة الحالية أولًا": [
    "One intake per season; settle the current intake first",
    "Une promotion par saison ; réglez d’abord la promotion actuelle",
  ],
  "وصل العالم إلى حد السجلات؛ لم تخصم الرسوم": [
    "The world reached its record limit; no fee was charged",
    "Le monde a atteint sa limite de fiches ; aucun frais débité",
  ],
  "السيولة لا تكفي برنامج الاختبارات": [
    "Cash does not cover the trials programme",
    "La trésorerie ne couvre pas le programme d’essais",
  ],
  "برنامج اختبارات الناشئين": [
    "Youth trials programme",
    "Programme d’essais des jeunes",
  ],
  "بدأت اختبارات الأكاديمية": [
    "Academy trials started",
    "Les essais de l’académie ont commencé",
  ],
  "تصل الدفعة بعد 14 يومًا. بعدها تختار التصعيد أو السماح بالمغادرة خلال 90 يومًا. لا رواتب للفريق الأول قبل توقيعك":
    [
      "The intake arrives after 14 days. Then you promote or release within 90 days. No first-team wages before you sign them",
      "La promotion arrive après 14 jours. Vous aurez ensuite 90 jours pour promouvoir ou libérer. Aucun salaire d’équipe première avant votre signature",
    ],
  "فترة تقييم اللاعب انتهت": [
    "The player’s assessment period has ended",
    "La période d’évaluation du joueur est terminée",
  ],
  "القائمة ممتلئة أو محجوزة للعائدين من الإعارة": [
    "The squad is full or reserved for returning loanees",
    "L’effectif est complet ou réservé aux prêtés qui reviennent",
  ],
  "راتب اللاعب يتجاوز ميزانية المرتبات": [
    "The player’s wage exceeds the wage budget",
    "Le salaire du joueur dépasse la masse salariale",
  ],
  "مكافأة التوقيع تساوي راتب شهر": [
    "The signing bonus equals one month’s wage",
    "La prime à la signature vaut un mois de salaire",
  ],
  تصعيد: ["Promotion:", "Promotion :"],
  "دفعة الأكاديمية جاهزة للتقييم": [
    "The academy intake is ready for assessment",
    "La promotion de l’académie est prête à être évaluée",
  ],
  "لاعبين ينتظرون قرارك في الجهاز الفني. التقدير ليس ضمانًا للتطور؛ اللاعب الذي يغادر يحتفظ بهويته في سوق الأحرار":
    [
      "players await your decision in the talent centre. The estimate is no guarantee of development; a released player keeps his identity on the free-agent market",
      "joueurs attendent votre décision au centre de talents. L’estimation ne garantit pas la progression ; un joueur libéré garde son identité sur le marché des agents libres",
    ],
  "تعذر استقبال الدفعة": [
    "The intake could not be received",
    "La promotion n’a pas pu être accueillie",
  ],
  "بلغ العالم حد 50 ألف سجل. أُعيدت رسوم البرنامج": [
    "The world reached 50,000 records. The programme fee was refunded",
    "Le monde a atteint 50 000 fiches. Les frais du programme ont été remboursés",
  ],
  "رد رسوم البرنامج": [
    "Programme fee refund",
    "Remboursement des frais du programme",
  ],

  "قاموس أسماء البلد غير متاح؛ لا نستخدم أسماء من بلد آخر": [
    "The country’s name pool is unavailable; names from another country are not used",
    "Le répertoire de noms du pays est indisponible ; aucun nom d’un autre pays n’est utilisé",
  ],
  // talent/scouting.js, training.js, world.js
  "شبكة الكشف تحتاج العالم الموسع": [
    "The scouting network needs the expanded world",
    "Le réseau de recrutement exige le monde étendu",
  ],
  "مهمتان متزامنتان كحد أقصى": [
    "At most two concurrent assignments",
    "Au plus deux missions simultanées",
  ],
  "راجع شروط مهمة الكشف": [
    "Check the scouting assignment terms",
    "Vérifiez les conditions de la mission",
  ],
  "الكشاف غير متاح": ["Scout unavailable", "Recruteur indisponible"],
  "الكشاف مشغول": ["The scout is busy", "Le recruteur est occupé"],
  "اللاعب غير متاح للمتابعة": [
    "The player cannot be followed up",
    "Le joueur ne peut pas être suivi",
  ],
  "السيولة لا تغطي المهمة": [
    "Cash does not cover the assignment",
    "La trésorerie ne couvre pas la mission",
  ],
  "مهمة شبكة الكشافين": [
    "Scouting network assignment",
    "Mission du réseau de recrutement",
  ],
  "اللاعب غير موجود": ["Player not found", "Joueur introuvable"],
  "القائمة المختصرة تستوعب 40 لاعبًا": [
    "The shortlist holds 40 players",
    "La liste de suivi contient 40 joueurs",
  ],
  "الكشاف لم يعد معينًا؛ تكلفة السفر والعمل المنفّذ غير مستردة": [
    "The scout is no longer employed; travel and work already done are not refunded",
    "Le recruteur n’est plus employé ; déplacements et travail effectué ne sont pas remboursés",
  ],
  "اكتملت مهمة الكشافين": [
    "Scouting assignment completed",
    "Mission de recrutement terminée",
  ],
  وصل: ["Received", "Reçu :"],
  "تقريرًا وفق نطاق البحث. راجع مركز المواهب؛ الأسعار والتقييمات تقديرات بتاريخ التقرير وليست ضمانًا":
    [
      "reports within the search scope. Check the talent centre; prices and ratings are estimates as of the report date, not guarantees",
      "rapports dans le périmètre de recherche. Consultez le centre de talents ; prix et notes sont des estimations à la date du rapport, pas des garanties",
    ],
  "برنامج التدريب غير صالح": [
    "Invalid training programme",
    "Programme d’entraînement invalide",
  ],
  "العالم بلغ حد سجلات اللاعبين": [
    "The world reached its player record limit",
    "Le monde a atteint sa limite de fiches de joueurs",
  ],
  "توقف إدخال لاعبين جدد عند 50 ألف سجل. الأسماء والتاريخ لم تُحذف؛ أندية الكمبيوتر تواصل البحث عن لاعبين أحرار. هذا حد للنسخة وليس ضمانًا لمحاكاة عقود غير محدودة":
    [
      "New players stop entering at 50,000 records. Names and history are not deleted; AI clubs keep looking for free agents. This is a version limit, not a promise of unlimited decades",
      "L’entrée de nouveaux joueurs s’arrête à 50 000 fiches. Noms et historique ne sont pas supprimés ; les clubs IA continuent de chercher des agents libres. C’est une limite de version, pas une promesse de décennies illimitées",
    ],

  // finance.js
  "مبلغ غير صالح": ["Invalid amount", "Montant invalide"],
  "مرتبات اللاعبين الشهرية": [
    "Monthly player wages",
    "Salaires mensuels des joueurs",
  ],
  "تشغيل المنشآت والموظفين": [
    "Facilities and staff operations",
    "Exploitation des installations et personnel",
  ],
  "تم سداد المرتبات وتكاليف التشغيل. راجع كشف الحساب والتزامات الشهر القادم": [
    "Wages and operating costs were paid. Review the statement and next month’s commitments",
    "Salaires et charges d’exploitation payés. Consultez le relevé et les engagements du mois prochain",
  ],
  "عجز في السيولة يحتاج قرارك": [
    "A cash shortfall needs your decision",
    "Un déficit de trésorerie exige votre décision",
  ],
  "الرصيد أصبح سالبًا بعد سداد الالتزامات. راجع التمويل والمصروفات؛ التعاقدات والمشروعات الجديدة تتطلب سيولة كافية":
    [
      "The balance went negative after paying commitments. Review financing and spending; new signings and projects need sufficient cash",
      "Le solde est devenu négatif après le paiement des engagements. Revoyez financement et dépenses ; recrutements et projets exigent une trésorerie suffisante",
    ],
  "الحد الأقصى قرضان في هذه النسخة": [
    "At most two loans in this version",
    "Deux prêts au maximum dans cette version",
  ],
  "تمويل بنكي تجريبي لمدة سنة": [
    "One-year trial bank financing",
    "Financement bancaire d’essai sur un an",
  ],
  "قسط قرض شامل تكلفة التمويل": [
    "Loan instalment including financing cost",
    "Mensualité de prêt, coût de financement inclus",
  ],
  "تم إيداع التمويل": ["Financing deposited", "Financement déposé"],
  "٥ ملايين جنيه دخلت الخزينة. إجمالي السداد ٥٫٤ مليون على ١٢ دفعة كل ٣٠ يومًا. النموذج تمويلي مبسط، وليس عرضًا بنكيًا حقيقيًا":
    [
      "EGP 5 million entered the treasury. Total repayment is 5.4 million over 12 instalments every 30 days. A simplified financing model, not a real bank offer",
      "5 millions EGP sont entrés en trésorerie. Remboursement total de 5,4 millions en 12 mensualités tous les 30 jours. Modèle simplifié, pas une offre bancaire réelle",
    ],

  // careers.js
  "اللاعب يفكر في الاعتزال خلال ٤٥ يومًا داخل هذه الحفظة. يمكنك تجهيز مسار مهني بتكلفة ٦٠ ألف جنيه، طلب الاستمرار (غير مضمون)، أو احترام القرار. هذا حدث محاكاة، وليس خبرًا عن اللاعب الحقيقي":
    [
      "The player is considering retirement within 45 days in this save. You can prepare a career path for EGP 60k, ask him to continue (not guaranteed) or respect the decision. A simulation event, not news about the real player",
      "Le joueur envisage la retraite sous 45 jours dans cette sauvegarde. Vous pouvez préparer une reconversion pour 60 k EGP, lui demander de continuer (sans garantie) ou respecter sa décision. Événement simulé, pas une information sur le vrai joueur",
    ],
  "قرار الاعتزال غير متاح": [
    "Retirement decision unavailable",
    "Décision de retraite indisponible",
  ],
  "السيولة لا تكفي لدورة التأهيل": [
    "Cash does not cover the retraining course",
    "La trésorerie ne couvre pas la formation de reconversion",
  ],
  "تأهيل مهني": ["Professional retraining:", "Reconversion professionnelle :"],
  "تم طلب الاستمرار بالفعل": [
    "He was already asked to continue",
    "La demande de prolongation a déjà été faite",
  ],
  "تم تأجيل مراجعة الاعتزال ١٨٠ يومًا. عقد اللاعب لا يتمدد تلقائيًا؛ راجع تاريخ نهايته":
    [
      "The retirement review was postponed 180 days. The contract does not extend automatically; check its end date",
      "L’examen de la retraite est reporté de 180 jours. Le contrat ne se prolonge pas automatiquement ; vérifiez sa date de fin",
    ],
  "احترم رغبته وخطط للبديل. ما زال بإمكانه بدء مسار مهني بعد الاعتزال إذا توفرت الرغبة":
    [
      "Respect his wish and plan a replacement. He may still start a career after retiring if he wants to",
      "Respectez son souhait et prévoyez un remplaçant. Il pourra encore entamer une carrière après sa retraite s’il le souhaite",
    ],
  "اختيار غير صالح": ["Invalid choice", "Choix invalide"],
  "اعتزل داخل الحفظة وتوقف مرتب اللاعب. أبدى رغبة في العمل؛ راجع تقييمه المهني المستقل قبل تعيينه. الشهرة لا تعني كفاءة تدريبية":
    [
      "Retired within this save and his wage stopped. He wants to work; check his separate professional rating before appointing him. Fame is not coaching competence",
      "Retraité dans cette sauvegarde, son salaire cesse. Il souhaite travailler ; consultez son évaluation professionnelle distincte avant de le nommer. La notoriété n’est pas une compétence d’entraîneur",
    ],
  "اعتزل داخل الحفظة وتوقف مرتبه. اختار الابتعاد عن العمل الكروي في الوقت الحالي؛ لن يظهر كموظف متاح":
    [
      "Retired within this save and his wage stopped. He chose to step away from football for now; he will not appear as available staff",
      "Retraité dans cette sauvegarde, son salaire cesse. Il choisit de s’éloigner du football pour l’instant ; il n’apparaîtra pas comme personnel disponible",
    ],

  // clubEvents.js
  "الحدث تم حسمه بالفعل": [
    "The event was already settled",
    "L’événement est déjà tranché",
  ],
  "قرار غير صالح": ["Invalid decision", "Décision invalide"],
  "السيولة لا تكفي لهذا القرار. اختر بديلًا مناسبًا": [
    "Cash does not cover this decision. Choose a suitable alternative",
    "La trésorerie ne couvre pas cette décision. Choisissez une autre option",
  ],
  "القائمة ممتلئة": ["The squad is full", "L’effectif est complet"],
  "عائد الحملة التجارية": [
    "Commercial campaign return",
    "Retour de la campagne commerciale",
  ],
  "موهبة جديدة": ["New talent", "Nouveau talent"],
  "تقرير مرشح": ["Candidate report", "Rapport sur un candidat"],
  "تقرير مبدئي متاح في ملف اللاعب. تعيين كشاف محترف يمكن أن يحسن دقته": [
    "A preliminary report is on the player’s profile. Appointing a professional scout can improve its accuracy",
    "Un rapport préliminaire figure sur la fiche du joueur. Nommer un recruteur professionnel peut améliorer sa précision",
  ],
  "الآثار سُجلت في الحسابات وحالة النادي": [
    "The effects were recorded in the accounts and the club’s state",
    "Les effets ont été enregistrés dans les comptes et l’état du club",
  ],

  // market.js
  "سوق الانتقالات مغلق: نوافذ نموذجية في يناير ويوليو–سبتمبر، وليست لوائح القيد الرسمية":
    [
      "The transfer market is closed: model windows in January and July–September, not official registration rules",
      "Le marché des transferts est fermé : fenêtres types en janvier et juillet–septembre, pas le règlement officiel",
    ],
  "سوق مفتوح للحفظة القديمة": [
    "Market open for the older save",
    "Marché ouvert pour l’ancienne sauvegarde",
  ],
  "السوق مغلق — يفتح": ["Market closed — opens", "Marché fermé — ouverture le"],
  "سيناريو، وليس قيدًا رسميًا": [
    "scenario, not official registration",
    "scénario, pas un enregistrement officiel",
  ],
  مقابل: ["for", "pour"],
  محاكاة: ["simulation", "simulation"],

  // development.js
  "اللاعب يحتاج قرارًا: افتح شروط التجديد أو قرّر السماح بانتهاء العقد. التجديد ليس تلقائيًا":
    [
      "The player needs a decision: open renewal terms or let the contract run out. Renewal is not automatic",
      "Le joueur attend une décision : ouvrez les conditions de renouvellement ou laissez le contrat expirer. Le renouvellement n’est pas automatique",
    ],
  "انتهى عقد": ["Contract expired:", "Contrat expiré :"],
  "اللاعب غادر القائمة بعد انتهاء عقده. راقب التنبيهات وجدّد العقود قبل موعد الانتهاء":
    [
      "The player left the squad when his contract expired. Watch the alerts and renew before the end date",
      "Le joueur a quitté l’effectif à l’expiration de son contrat. Surveillez les alertes et renouvelez avant l’échéance",
    ],
  "موهبة الأكاديمية": ["Academy talent", "Talent de l’académie"],
  "موهبة جديدة من الأكاديمية": [
    "New talent from the academy",
    "Nouveau talent issu de l’académie",
  ],
  "أصبح ضمن قائمة الفريق. قدراته مولّدة تجريبيًا؛ فرص اللعب وتطويره الأوسع ضمن المراحل القادمة":
    [
      "is now in the squad. His abilities are generated for the trial; playing chances and wider development come in later phases",
      "fait désormais partie de l’effectif. Ses qualités sont générées pour l’essai ; temps de jeu et progression élargie viendront dans les prochaines phases",
    ],

  // internationals.js
  عودة: ["Return:", "Retour :"],
  "من المنتخب": ["back from international duty", "de retour de sélection"],
  "مشاركتان دوليتان في المعسكر المحاكى، مع احتساب الإجهاد. هذا سيناريو داخل اللعبة، وليس خبرًا عن اللاعب الحقيقي":
    [
      "Two international appearances in the simulated camp, with fatigue counted. An in-game scenario, not news about the real player",
      "Deux sélections lors du stage simulé, fatigue comptabilisée. Scénario du jeu, pas une information sur le vrai joueur",
    ],
  استدعاء: ["Call-up:", "Convocation :"],
  "من لاعبيك للمنتخبات": [
    "of your players called up by national teams",
    "de vos joueurs convoqués en sélection",
  ],
  "غياب لمدة عشرة أيام. الاختيار من جنسية اللاعب ومستواه ومشاركاته. المواعيد والمعسكرات مبسطة وليست روزنامة FIFA الرسمية":
    [
      "Away for ten days. Selection follows nationality, level and appearances. Dates and camps are simplified, not the official FIFA calendar",
      "Absents dix jours. La sélection dépend de la nationalité, du niveau et du temps de jeu. Dates et stages sont simplifiés, pas le calendrier officiel de la FIFA",
    ],

  // contractClauses.js
  "شروط إضافية غير صالحة": [
    "Invalid additional clauses",
    "Clauses supplémentaires invalides",
  ],
  "المكافآت أو الزيادة خارج حدود النسخة": [
    "Bonuses or raise outside this version’s limits",
    "Primes ou augmentation hors des limites de la version",
  ],
  "زيادة تعاقدية": ["Contractual raise:", "Augmentation contractuelle :"],
  "تم تطبيق الزيادة السنوية المتفق عليها. المرتب الجديد ينعكس على كشف الرواتب؛ الزيادة التعاقدية قد تتجاوز الميزانية المعتمدة":
    [
      "The agreed annual raise was applied. The new wage shows on the payroll; a contractual raise may exceed the approved budget",
      "L’augmentation annuelle convenue a été appliquée. Le nouveau salaire figure sur la masse salariale ; elle peut dépasser le budget approuvé",
    ],
  "مراجعة وعد المشاركة": [
    "Playing-time promise review:",
    "Bilan de la promesse de temps de jeu :",
  ],
  "اللاعب شارك في أقل من ٦٠٪ من مباريات فترة المراجعة رغم وعد الأساسي. انخفضت المعنويات ١٢ نقطة. راجع ترتيب فريقك أو تفاوض على دور مناسب":
    [
      "The player featured in under 60% of matches in the review period despite the starter promise. Morale fell 12 points. Review your line-up or negotiate a suitable role",
      "Le joueur a disputé moins de 60 % des matchs de la période malgré la promesse de titulaire. Le moral a baissé de 12 points. Revoyez la composition ou négociez un rôle adapté",
    ],

  // matches.js, save.js, season.js, tactics.js, time.js, calendar.js, playerRoles.js
  "إيراد تذاكر المباراة": [
    "Match ticket income",
    "Recette de billetterie du match",
  ],
  "تنظيم وأمن المباراة": [
    "Match organisation and security",
    "Organisation et sécurité du match",
  ],
  "تقرير المباراة": ["Match report", "Compte rendu du match"],
  "المحاكاة احتمالية ومبسطة، وليست مباراة مرئية": [
    "The simulation is probabilistic and simplified, not a visible match",
    "La simulation est probabiliste et simplifiée, pas un match visible",
  ],
  "المتصفح لا يدعم تخزين القاعدة الكبيرة. جرّب Safari أو Chrome خارج الوضع الخاص":
    [
      "This browser cannot store the large database. Try Safari or Chrome outside private mode",
      "Ce navigateur ne peut pas stocker la grande base. Essayez Safari ou Chrome hors navigation privée",
    ],
  "تعذر كتابة النسخة المحلية": [
    "Could not write the local copy",
    "Impossible d’écrire la copie locale",
  ],
  "تعذر إتمام الحفظ المحلي": [
    "Local save could not be completed",
    "La sauvegarde locale n’a pas pu aboutir",
  ],
  "تعذر حفظ القاعدة الكبيرة؛ لم يتم تطبيق القرار": [
    "The large database could not be saved; the decision was not applied",
    "La grande base n’a pas pu être sauvegardée ; la décision n’a pas été appliquée",
  ],
  "بداية موسم جديد": ["A new season begins", "Début d’une nouvelle saison"],
  "تم أرشفة الترتيب السابق وإنشاء ١٤ جولة جديدة للدوري التجريبي. اللاعبون والعقود والمنشآت يستمرون؛ لا يوجد صعود أو هبوط في هذه النسخة":
    [
      "The previous table was archived and 14 new rounds created for the trial league. Players, contracts and facilities carry on; no promotion or relegation in this version",
      "L’ancien classement est archivé et 14 nouvelles journées créées pour le championnat d’essai. Joueurs, contrats et installations se poursuivent ; pas de montée ni de descente dans cette version",
    ],
  "الإدارة غير متاحة": ["Management unavailable", "Gestion indisponible"],
  "تعليمات تكتيكية غير صالحة": [
    "Invalid tactical instructions",
    "Consignes tactiques invalides",
  ],
  "وصلت عروض من شركات مصرية تجريبية. راجع القيمة والحصرية وجدول الدفع، أو ارفض الفرصة. تقدم الوقت متوقف حتى قرارك":
    [
      "Offers arrived from trial Egyptian companies. Review value, exclusivity and payment schedule, or decline. Time is paused until you decide",
      "Des offres de sociétés égyptiennes d’essai sont arrivées. Examinez valeur, exclusivité et échéancier, ou refusez. Le temps est en pause jusqu’à votre décision",
    ],
  "تعذر إيجاد موعد آمن للمباراة": [
    "No safe date could be found for the match",
    "Aucune date sûre trouvée pour le match",
  ],
  "الدور غير مناسب للمركز الطبيعي": [
    "The role does not suit the natural position",
    "Le rôle ne convient pas au poste naturel",
  ],

  // promotion.js, pyramid.js
  "ملحق الصعيد": ["Upper Egypt play-off", "Barrage de Haute-Égypte"],
  "ملحق القاهرة والقناة وبحري": [
    "Cairo, Canal and Delta play-off",
    "Barrage Le Caire, Canal et Delta",
  ],
  "تأهلت إلى": ["Qualified for", "Qualifié pour"],
  "أضيفت مباريات الملحق إلى جدول ناديك. لا صعود حتى حسم ترتيب الملحق. التواريخ محاكاة، والتساوي الكامل يحسم بالهوية الثابتة دون مباراة فاصلة إضافية":
    [
      "Play-off matches were added to your schedule. No promotion until the play-off table is settled. Dates are simulated and a perfect tie is settled by fixed identity, without an extra decider",
      "Les matchs de barrage ont été ajoutés à votre calendrier. Pas de montée avant le classement final du barrage. Dates simulées ; une égalité parfaite est tranchée par identité fixe, sans match d’appui",
    ],
  "حسمت مقعد الصعود": [
    "You secured the promotion place",
    "Vous avez décroché la montée",
  ],
  "انتهى ملحق الصعود": [
    "The promotion play-off is over",
    "Le barrage de montée est terminé",
  ],
  "يتنفذ انتقالك للدرجة الأعلى عند ترحيل الموسم، دون تغيير هويات اللاعبين": [
    "Your move to the higher division takes effect at season rollover, without changing player identities",
    "Votre passage en division supérieure prend effet au changement de saison, sans modifier l’identité des joueurs",
  ],
  "احتفظ النادي بمكانه في المستوى الحالي. المالك مستمر": [
    "The club keeps its place at the current level. The owner stays on",
    "Le club conserve sa place au niveau actuel. Le propriétaire reste",
  ],
  "لم تحسم ملاحق الصعود المصرية": [
    "The Egyptian promotion play-offs are not yet settled",
    "Les barrages de montée égyptiens ne sont pas encore tranchés",
  ],
  "اختيار الأسواق يتجاوز سعة القاعدة الحالية؛ قلل الأسواق المحملة": [
    "The selected markets exceed the current database capacity; load fewer markets",
    "Les marchés sélectionnés dépassent la capacité actuelle ; chargez moins de marchés",
  ],
  "لم تتوفر بطولة النادي": [
    "The club’s competition is unavailable",
    "La compétition du club est indisponible",
  ],
  "مباراة واحدة على ملعب محايد — مواعيد وجوائز محاكاة": [
    "One match at a neutral venue — simulated dates and prize money",
    "Un seul match sur terrain neutre — dates et dotations simulées",
  ],
  "خروج مغلوب مبسّط — ليست اللائحة الرسمية": [
    "Simplified knockout — not the official regulations",
    "Élimination directe simplifiée — pas le règlement officiel",
  ],
  كأس: ["Cup", "Coupe"],
  "مكافأة تأهل": ["Qualification bonus:", "Prime de qualification :"],
  "بطولة جديدة": ["A new trophy", "Un nouveau trophée"],
  "تم تسجيل الكأس في تاريخ النادي. صيغة هذه البطولة مبسّطة وليست اللائحة الرسمية":
    [
      "The cup was recorded in the club’s history. This competition’s format is simplified, not the official regulations",
      "La coupe est inscrite dans l’histoire du club. Le format de cette compétition est simplifié, pas le règlement officiel",
    ],
  "موسم جديد": ["New season", "Nouvelle saison"],
  "مركزك السابق": ["Your previous position", "Votre position précédente"],
  "أُجري الصعود والهبوط بين الدرجات المتاحة. ملاحق مصر تعمل عندما تتوفر مجموعاتها؛ بقية المسارات مبسطة. المالك مستمر، وهويات اللاعبين محفوظة":
    [
      "Promotion and relegation ran between the available divisions. Egypt’s play-offs run when their groups exist; other paths are simplified. The owner stays on and player identities are kept",
      "Montées et descentes ont été appliquées entre les divisions disponibles. Les barrages égyptiens fonctionnent quand leurs groupes existent ; les autres parcours sont simplifiés. Le propriétaire reste et l’identité des joueurs est conservée",
    ],
  "توزيع بث شهري محاكى": [
    "Simulated monthly broadcast distribution",
    "Répartition mensuelle simulée des droits TV",
  ],
};
