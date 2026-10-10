// أحداث بورصة الأندية 0.37 — سيناريوهات مشروطة، وكل نص AR/EN/FR.
import { addDays } from "../core/utils.js";

const words = (ar, en, fr) => Object.freeze({ ar, en, fr });
const choice = (id, label, effects = {}) =>
  Object.freeze({
    id,
    label: words(...label),
    effects: Object.freeze(effects),
  });
const event = (
  id,
  category,
  conditionKey,
  title,
  prompt,
  when,
  choices,
  weight = 1,
  cooldownMonths = 6,
) =>
  Object.freeze({
    id,
    category,
    conditionKey,
    title: words(...title),
    prompt: words(...prompt),
    when,
    choices: Object.freeze(choices),
    weight,
    cooldownMonths,
  });

const market = (s) => s.stockMarket || {};
const holdings = (s) => market(s).portfolio?.positions || [];
const openShorts = (s) =>
  (market(s).portfolio?.shorts || []).filter(
    (position) => position.status === "open",
  );
const activeCampaigns = (s) =>
  (market(s).manipulation?.campaigns || []).filter(
    (campaign) => campaign.status === "active",
  );
const exposure = (s) =>
  Math.max(
    market(s).insider?.exposure || 0,
    market(s).manipulation?.exposure || 0,
  );
const ownListing = (s) =>
  market(s).listings?.find(
    (listing) => listing.assetType === "club" && listing.clubId === s.clubId,
  );
const derbySoon = (s) =>
  (s.fixtures || []).some(
    (fixture) =>
      !fixture.played &&
      fixture.isDerby &&
      fixture.date >= s.date &&
      fixture.date <= addDays(s.date, 14),
  );
const wonRecentDerby = (s) =>
  (s.fixtures || []).some((fixture) => {
    if (!fixture.played || !fixture.isDerby) return false;
    if (fixture.home === s.clubId) return fixture.homeGoals > fixture.awayGoals;
    if (fixture.away === s.clubId) return fixture.awayGoals > fixture.homeGoals;
    return false;
  });

export const STOCK_MARKET_EVENTS = Object.freeze([
  event(
    "board-member-leak",
    "insider",
    "active-inside-information",
    [
      "عضو مجلس يسرّب محضرًا سريًا",
      "A board member leaks secret minutes",
      "Un administrateur divulgue un procès-verbal secret",
    ],
    [
      "سمسار يعرض شراء المعلومة قبل إعلان النادي.",
      "A broker offers to buy the information before the club announcement.",
      "Un courtier propose d’acheter l’information avant l’annonce du club.",
    ],
    (s) =>
      (market(s).insider?.knowledge || []).some((info) =>
        ["active", "used"].includes(info.status),
      ),
    [
      choice("report", ["أبلغ الهيئة", "Report it", "Le signaler"], {
        risk: -12,
        insiderExposure: -10,
      }),
      choice(
        "trade",
        ["استغل التسريب", "Trade on the leak", "Exploiter la fuite"],
        { wealth: 1_500_000, risk: 18, insiderExposure: 20, suspicion: 6 },
      ),
    ],
    1.4,
  ),
  event(
    "crash-wipes-savings",
    "crisis",
    "crash-and-invested",
    [
      "الانهيار يمحو مدخراتك الورقية",
      "The crash wipes out your paper savings",
      "Le krach efface votre épargne sur le papier",
    ],
    [
      "شاشات حمراء ومحفظتك تهبط في دقائق.",
      "Screens turn red and your portfolio falls within minutes.",
      "Les écrans virent au rouge et votre portefeuille chute en quelques minutes.",
    ],
    (s) => market(s).cycle?.phase === "crash" && holdings(s).length > 0,
    [
      choice(
        "hold",
        ["تمسك بالأسهم", "Hold the shares", "Conserver les actions"],
        { risk: -2 },
      ),
      choice(
        "panic",
        ["بع في الذعر", "Sell in panic", "Vendre dans la panique"],
        { allListingsShock: -0.12, wealth: -500_000 },
      ),
    ],
    1.6,
    12,
  ),
  event(
    "rumour-war",
    "manipulation",
    "active-manipulation",
    ["حرب شائعات تشتعل", "A rumour war erupts", "Une guerre de rumeurs éclate"],
    [
      "حسابات منافسة ترد على حملتك بوثائق وصور مضللة.",
      "Rival accounts answer your campaign with documents and misleading images.",
      "Des comptes rivaux répondent à votre campagne avec des documents et images trompeurs.",
    ],
    (s) => activeCampaigns(s).length > 0,
    [
      choice("retreat", ["أوقف التصعيد", "De-escalate", "Désamorcer"], {
        manipulationExposure: -12,
        wealth: -300_000,
      }),
      choice("double", ["ضاعف الهجوم", "Double down", "Redoubler l’attaque"], {
        listingShock: -1.2,
        risk: 15,
        manipulationExposure: 18,
      }),
    ],
    1.5,
  ),
  event(
    "regulator-speech",
    "regulation",
    "regulator-risk-20",
    [
      "خطاب رقابي يهز السوق",
      "A regulatory speech shakes the market",
      "Un discours réglementaire secoue le marché",
    ],
    [
      "رئيس الهيئة يتعهد بملاحقة التداول الداخلي والتلاعب.",
      "The regulator vows to pursue insider trading and manipulation.",
      "Le régulateur promet de poursuivre délits d’initiés et manipulations.",
    ],
    (s) => (market(s).regulator?.risk || 0) >= 20,
    [
      choice(
        "comply",
        ["افتح دفاترك", "Open your books", "Ouvrir vos comptes"],
        { risk: -10, wealth: -250_000 },
      ),
      choice(
        "mock",
        [
          "اسخر عبر القناة",
          "Mock it on your channel",
          "S’en moquer sur votre chaîne",
        ],
        { risk: 12, indexShock: -0.02 },
      ),
    ],
  ),
  event(
    "whistleblower-target",
    "regulation",
    "high-exposure",
    [
      "مبلغ يتحدث عنك!",
      "A whistleblower names you!",
      "Un lanceur d’alerte vous cite !",
    ],
    [
      "موظف سابق سلّم سجل التوقيتات والرسائل للهيئة.",
      "A former employee handed timing logs and messages to the regulator.",
      "Un ancien employé a remis au régulateur les horaires et messages.",
    ],
    (s) => exposure(s) >= 45,
    [
      choice(
        "cooperate",
        ["تعاون فورًا", "Cooperate immediately", "Coopérer immédiatement"],
        { risk: -8, wealth: -1_000_000 },
      ),
      choice(
        "silence",
        [
          "حاول إسكات المصدر",
          "Try to silence the source",
          "Tenter de faire taire la source",
        ],
        { risk: 28, suspicion: 12, whistleblower: true },
      ),
    ],
    1.8,
    18,
  ),
  event(
    "broker-tip",
    "broker",
    "always",
    [
      "نصيحة سمسار: موثوقة؟",
      "Broker tip: can it be trusted?",
      "Conseil d’un courtier : fiable ?",
    ],
    [
      "سمسار لامع يزعم أن صندوقًا كبيرًا سيدخل سهمًا الليلة.",
      "A slick broker claims a major fund will enter a share tonight.",
      "Un courtier habile affirme qu’un grand fonds achètera une action ce soir.",
    ],
    () => true,
    [
      choice(
        "follow",
        ["اتبع النصيحة", "Follow the tip", "Suivre le conseil"],
        { brokerTip: true, wealth: -200_000 },
      ),
      choice("ignore", ["تجاهلها", "Ignore it", "L’ignorer"], { risk: -1 }),
    ],
    0.9,
    8,
  ),
  event(
    "rival-pump-dump",
    "manipulation",
    "multiple-listed-clubs",
    [
      "منافس يضخم ثم يرمي عليك",
      "A rival pumps, then dumps on you",
      "Un rival gonfle le cours puis vous laisse tout",
    ],
    [
      "رئيس نادٍ منافس روّج للسهم ثم باع حزمته دفعة واحدة.",
      "A rival chairman promoted the share, then sold his block at once.",
      "Un président rival a vanté l’action puis vendu tout son bloc.",
    ],
    (s) =>
      (market(s).listings || []).filter(
        (listing) => listing.status === "listed",
      ).length >= 3,
    [
      choice(
        "expose",
        ["اكشف المخطط", "Expose the scheme", "Révéler le montage"],
        { risk: -5, listingShock: -0.8 },
      ),
      choice("counter", ["اشترِ الهبوط", "Buy the dip", "Acheter la baisse"], {
        wealth: -750_000,
        listingShock: 0.8,
      }),
    ],
  ),
  event(
    "derby-panic",
    "matchday",
    "derby-within-14-days",
    [
      "ذعر السوق قبل الديربي",
      "Market panic before the derby",
      "Panique du marché avant le derby",
    ],
    [
      "شائعة عن التشكيل تدفع أسهم الناديين إلى تذبذب حاد.",
      "A lineup rumour sends both clubs’ shares into violent swings.",
      "Une rumeur de composition fait fortement osciller les actions des deux clubs.",
    ],
    derbySoon,
    [
      choice(
        "calm",
        [
          "انشر بيانًا هادئًا",
          "Issue a calm statement",
          "Publier un communiqué apaisant",
        ],
        { ownListingShock: 0.6, wealth: -150_000 },
      ),
      choice("fuel", ["زد الحماس", "Fuel the hype", "Attiser l’engouement"], {
        ownListingShock: 1.2,
        risk: 5,
      }),
    ],
    1.5,
    4,
  ),
  event(
    "trophy-rally",
    "football",
    "own-club-has-title",
    [
      "لقب يشعل موجة شراء",
      "A trophy sparks a buying wave",
      "Un trophée déclenche une vague d’achats",
    ],
    [
      "الجماهير والمضاربون يطاردون سهم البطل.",
      "Fans and speculators chase the champion’s share.",
      "Supporters et spéculateurs se ruent sur l’action du champion.",
    ],
    (s) => (ownListing(s)?.metrics?.titles || 0) > 0,
    [
      choice(
        "celebrate",
        [
          "احتفل مع المستثمرين",
          "Celebrate with investors",
          "Célébrer avec les investisseurs",
        ],
        { ownListingShock: 1.5, fanSupport: 2 },
      ),
      choice(
        "temper",
        ["حذر من المبالغة", "Temper expectations", "Modérer les attentes"],
        { ownListingShock: 0.5, risk: -2 },
      ),
    ],
    1.2,
    12,
  ),
  event(
    "injury-shock",
    "football",
    "two-own-injuries",
    [
      "قائمة إصابات تصدم السهم",
      "Injury list shocks the share",
      "La liste des blessés choque l’action",
    ],
    [
      "تسرب غياب أكثر من لاعب أساسي قبل بيان النادي.",
      "Multiple starters’ absences leak before the club statement.",
      "L’absence de plusieurs titulaires fuite avant le communiqué du club.",
    ],
    (s) => (ownListing(s)?.metrics?.injuries || 0) >= 2,
    [
      choice(
        "disclose",
        [
          "أعلن بشفافية",
          "Disclose transparently",
          "Communiquer avec transparence",
        ],
        { ownListingShock: -0.5, risk: -5 },
      ),
      choice(
        "hide",
        ["أخفِ التفاصيل", "Hide the details", "Cacher les détails"],
        { ownListingShock: 0.3, insiderExposure: 9, risk: 8 },
      ),
    ],
  ),
  event(
    "transfer-desk-leak",
    "insider",
    "active-transfer-negotiation",
    [
      "صورة من غرفة المفاوضات",
      "A photo from the negotiation room",
      "Une photo de la salle des négociations",
    ],
    [
      "اسم الهدف وقيمة العرض انتشرا قبل التوقيع.",
      "The target and fee spread before the signature.",
      "La cible et le montant circulent avant la signature.",
    ],
    (s) =>
      (s.negotiations || []).some((negotiation) =>
        ["waiting", "club-reply", "personal"].includes(negotiation.stage),
      ),
    [
      choice(
        "confirm",
        [
          "أكد وجود المفاوضات",
          "Confirm the talks",
          "Confirmer les discussions",
        ],
        { ownListingShock: 0.8, risk: -2 },
      ),
      choice("deny", ["انفِ كل شيء", "Deny everything", "Tout nier"], {
        ownListingShock: -0.3,
        risk: 5,
      }),
    ],
  ),
  event(
    "coach-dismissal-leak",
    "insider",
    "coach-employed",
    [
      "خبر إقالة المدرب يسبق القرار",
      "Coach dismissal leaks before the decision",
      "Le limogeage de l’entraîneur fuite avant la décision",
    ],
    [
      "القناة المنافسة تقول إن غرفة الملابس تعرف أن النهاية قريبة.",
      "A rival channel says the dressing room knows the end is near.",
      "Une chaîne rivale affirme que le vestiaire sait la fin proche.",
    ],
    (s) => Boolean(s.management?.coach),
    [
      choice(
        "back",
        [
          "ادعم المدرب علنًا",
          "Back the coach publicly",
          "Soutenir publiquement l’entraîneur",
        ],
        { ownListingShock: 0.4 },
      ),
      choice(
        "prepare",
        [
          "حضّر البديل سرًا",
          "Prepare a replacement secretly",
          "Préparer secrètement le remplaçant",
        ],
        { insiderExposure: 8, ownListingShock: -0.5 },
      ),
    ],
    0.7,
    9,
  ),
  event(
    "federation-front-running",
    "insider",
    "president-with-open-bill",
    [
      "السوق يسبق قانون الاتحاد",
      "The market front-runs federation law",
      "Le marché anticipe la loi fédérale",
    ],
    [
      "أسهم أندية بعينها تتحرك قبل جلسة التصويت التي ترأسها.",
      "Selected club shares move before the vote you chair.",
      "Certaines actions bougent avant le vote que vous présidez.",
    ],
    (s) =>
      Boolean(
        s.politics?.office?.held &&
        ["debate", "voting"].includes(s.politics?.council?.currentBill?.status),
      ),
    [
      choice(
        "recuse",
        [
          "امتنع عن التداول",
          "Recuse yourself from trading",
          "Vous récuser des échanges",
        ],
        { risk: -14, insiderExposure: -8 },
      ),
      choice(
        "front-run",
        [
          "تداول قبل الجلسة",
          "Trade before the session",
          "Négocier avant la séance",
        ],
        { wealth: 2_000_000, risk: 25, suspicion: 8, insiderExposure: 18 },
      ),
    ],
    1.7,
    12,
  ),
  event(
    "facility-opening-rally",
    "club",
    "active-facility-project",
    [
      "صور المنشأة الجديدة ترفع التوقعات",
      "New facility photos lift expectations",
      "Les photos de la nouvelle installation dopent les attentes",
    ],
    [
      "صور جوية تكشف قرب الافتتاح قبل حملتك الرسمية.",
      "Aerial photos reveal the opening is near before your official campaign.",
      "Des vues aériennes révèlent l’ouverture proche avant votre campagne officielle.",
    ],
    (s) => (s.facilities || []).some((facility) => facility.project),
    [
      choice(
        "tour",
        [
          "نظم جولة للمستثمرين",
          "Host an investor tour",
          "Organiser une visite d’investisseurs",
        ],
        { ownListingShock: 1.1, wealth: -300_000 },
      ),
      choice(
        "wait",
        ["انتظر الافتتاح", "Wait for opening", "Attendre l’ouverture"],
        { ownListingShock: 0.3 },
      ),
    ],
  ),
  event(
    "bubble-champagne",
    "cycle",
    "bubble-phase",
    [
      "حفلة الفقاعة لا تتوقف",
      "The bubble party will not stop",
      "La fête de la bulle ne s’arrête plus",
    ],
    [
      "أسعار الأندية تنفصل عن الأرباح والجميع يعلن أنه عبقري.",
      "Club prices detach from earnings and everyone claims to be a genius.",
      "Les cours se détachent des bénéfices et chacun se croit génial.",
    ],
    (s) => market(s).cycle?.phase === "bubble",
    [
      choice(
        "trim",
        ["بع جزءًا من محفظتك", "Trim the portfolio", "Alléger le portefeuille"],
        { indexShock: -0.02, risk: -3 },
      ),
      choice(
        "ride",
        ["واصل الركوب", "Ride the bubble", "Profiter de la bulle"],
        { indexShock: 0.06, cycleIntensity: 8 },
      ),
    ],
    1.5,
    12,
  ),
  event(
    "buy-crash-bottom",
    "cycle",
    "crash-phase",
    ["هل هذا هو القاع؟", "Is this the bottom?", "Est-ce le point bas ?"],
    [
      "نادي كبير يتداول بنصف قيمته الأولى.",
      "A major club trades at half its initial value.",
      "Un grand club cote à la moitié de sa valeur initiale.",
    ],
    (s) => market(s).cycle?.phase === "crash",
    [
      choice("buy", ["اشترِ القاع!", "Buy the dip!", "Achetez au plus bas !"], {
        wealth: -1_000_000,
        indexShock: 0.03,
      }),
      choice("cash", ["احتفظ بالسيولة", "Keep cash", "Garder les liquidités"], {
        risk: -2,
      }),
    ],
    1.6,
    10,
  ),
  event(
    "short-margin-call",
    "trading",
    "open-short-position",
    ["نداء هامش عند الفجر", "Margin call at dawn", "Appel de marge à l’aube"],
    [
      "السمسار يطلب ضمانًا إضافيًا لمراكز البيع المكشوف.",
      "The broker demands more collateral for short positions.",
      "Le courtier exige davantage de garantie sur les positions vendeuses.",
    ],
    (s) => openShorts(s).length > 0,
    [
      choice("fund", ["غطِ الهامش", "Fund the margin", "Couvrir la marge"], {
        wealth: -750_000,
      }),
      choice("close", ["أغلق بالقوة", "Force-close", "Clôturer de force"], {
        wealth: -1_500_000,
        risk: -2,
      }),
    ],
    1.2,
    5,
  ),
  event(
    "dividend-surprise",
    "earnings",
    "profitable-held-share",
    [
      "توزيع أرباح يفوق التوقعات",
      "Dividend beats expectations",
      "Le dividende dépasse les attentes",
    ],
    [
      "مجلس نادي تملكه جزئيًا أعلن توزيعًا سخيًا.",
      "A club you partly own announces a generous distribution.",
      "Un club que vous détenez partiellement annonce une distribution généreuse.",
    ],
    (s) =>
      holdings(s).some(
        (position) =>
          (market(s).listings || []).find(
            (listing) => listing.id === position.listingId,
          )?.lastProfit > 0,
      ),
    [
      choice("reinvest", ["أعد الاستثمار", "Reinvest", "Réinvestir"], {
        listingShock: 0.9,
      }),
      choice("take", ["خذ النقد", "Take the cash", "Prendre le cash"], {
        wealth: 500_000,
      }),
    ],
  ),
  event(
    "fan-shareholder-revolt",
    "governance",
    "club-ipo-high-pressure",
    [
      "ثورة مساهمي الجماهير",
      "Fan shareholders revolt",
      "Révolte des supporters actionnaires",
    ],
    [
      "المساهمون يطالبون بخطة نتائج لا بخطاب عاطفي.",
      "Shareholders demand a results plan, not an emotional speech.",
      "Les actionnaires exigent un plan de résultats, pas un discours émotionnel.",
    ],
    (s) => (market(s).ipos?.club?.pressure || 0) >= 45,
    [
      choice(
        "meeting",
        [
          "اعقد جمعية مفتوحة",
          "Hold an open assembly",
          "Tenir une assemblée ouverte",
        ],
        { shareholderPressure: -14, wealth: -400_000, fanSupport: 2 },
      ),
      choice("dismiss", ["تجاهلهم", "Dismiss them", "Les ignorer"], {
        shareholderPressure: 15,
        fanSupport: -4,
        ownListingShock: -1,
      }),
    ],
    1.5,
    6,
  ),
  event(
    "betting-ipo-hype",
    "ipo",
    "betting-company-listed",
    [
      "هوس اكتتاب شركة المراهنات",
      "Betting IPO frenzy",
      "Frénésie autour de l’introduction des paris",
    ],
    [
      "طلبات الأفراد تتجاوز الأسهم المطروحة عدة مرات.",
      "Retail orders exceed the shares offered several times over.",
      "Les ordres des particuliers dépassent plusieurs fois l’offre.",
    ],
    (s) => Boolean(market(s).ipos?.betting),
    [
      choice(
        "allocate",
        [
          "فضل المستثمر الصغير",
          "Favor small investors",
          "Favoriser les petits investisseurs",
        ],
        { listingShock: 1.2, risk: -2 },
      ),
      choice("funds", ["بع للصناديق", "Sell to funds", "Vendre aux fonds"], {
        wealth: 1_000_000,
        listingShock: 0.4,
      }),
    ],
    1.3,
    12,
  ),
  event(
    "betting-license-scare",
    "company",
    "listed-betting-compliance-risk",
    [
      "ذعر ترخيص شركة المراهنات",
      "Betting licence scare",
      "Crainte sur la licence de paris",
    ],
    [
      "السوق يخشى أن يتحول التدقيق إلى إيقاف ترخيص.",
      "The market fears an audit may become a licence suspension.",
      "Le marché craint qu’un audit ne mène à une suspension de licence.",
    ],
    (s) =>
      Boolean(
        market(s).ipos?.betting &&
        ((s.betting?.compliance?.auditRisk || 0) >= 35 ||
          s.betting?.licenseStatus === "suspended"),
      ),
    [
      choice(
        "compliance",
        [
          "ارفع الإنفاق على الامتثال",
          "Boost compliance spending",
          "Renforcer la conformité",
        ],
        { wealth: -1_000_000, listingShock: 0.5, risk: -7 },
      ),
      choice("deny", ["انفِ المخاطر", "Deny the risk", "Nier le risque"], {
        listingShock: -1.2,
        risk: 8,
      }),
    ],
  ),
  event(
    "distressed-club-whisper",
    "distress",
    "distressed-candidate",
    [
      "نادٍ متعثر يُعرض بسعر بخس",
      "A distressed club is offered cheaply",
      "Un club en difficulté est proposé à bas prix",
    ],
    [
      "البنوك تريد مخرجًا سريعًا قبل فتح سوق بيع الأندية.",
      "Banks want a quick exit before the club-sale market opens.",
      "Les banques veulent sortir vite avant l’ouverture du marché des clubs.",
    ],
    (s) => (market(s).distressed || []).length > 0,
    [
      choice(
        "study",
        [
          "اطلب الفحص النافي للجهالة",
          "Request due diligence",
          "Demander un audit préalable",
        ],
        { wealth: -300_000 },
      ),
      choice(
        "pass",
        [
          "انتظر المرحلة القادمة",
          "Wait for the next phase",
          "Attendre la prochaine phase",
        ],
        { risk: -1 },
      ),
    ],
    1.6,
    5,
  ),
  event(
    "prosecutor-letter",
    "regulation",
    "open-investigation",
    [
      "خطاب من نيابة الأموال",
      "A letter from the financial prosecutor",
      "Une lettre du parquet financier",
    ],
    [
      "الهيئة أحالت جزءًا من ملف التداول إلى محقق جنائي.",
      "The regulator referred part of the trading file to a criminal investigator.",
      "Le régulateur a transmis une partie du dossier à un enquêteur pénal.",
    ],
    (s) =>
      (market(s).regulator?.investigations || []).some(
        (investigation) =>
          investigation.status === "open" && investigation.evidence >= 65,
      ),
    [
      choice(
        "lawyer",
        [
          "عيّن فريق دفاع",
          "Hire a defense team",
          "Engager une équipe de défense",
        ],
        { wealth: -2_000_000, risk: -8 },
      ),
      choice(
        "destroy",
        ["أتلف الرسائل", "Destroy the messages", "Détruire les messages"],
        { risk: 30, suspicion: 15 },
      ),
    ],
    1.8,
    18,
  ),
  event(
    "clean-audit-rally",
    "regulation",
    "latest-audit-clean",
    [
      "براءة رقابية تريح المستثمرين",
      "Clean audit reassures investors",
      "Un audit vierge rassure les investisseurs",
    ],
    [
      "إغلاق التدقيق بلا مخالفة يعيد السيولة للأسهم.",
      "Closing the audit without a breach brings liquidity back.",
      "La clôture sans infraction ramène les liquidités.",
    ],
    (s) => market(s).regulator?.audits?.[0]?.status === "clean",
    [
      choice(
        "publish",
        [
          "انشر التقرير كاملًا",
          "Publish the full report",
          "Publier le rapport complet",
        ],
        { indexShock: 0.025, risk: -5 },
      ),
      choice(
        "quiet",
        [
          "اكتفِ ببيان مقتضب",
          "Issue a short statement",
          "Publier un bref communiqué",
        ],
        { indexShock: 0.01 },
      ),
    ],
  ),
  event(
    "short-squeeze",
    "trading",
    "short-against-rising-share",
    [
      "ضغط شراء يحاصر البائعين على المكشوف",
      "A short squeeze traps sellers",
      "Un short squeeze piège les vendeurs",
    ],
    [
      "السهم المقصود يقفز والمراكز المكشوفة تطلب سيولة.",
      "The targeted share jumps and short positions demand cash.",
      "L’action visée bondit et les positions vendeuses exigent du cash.",
    ],
    (s) =>
      openShorts(s).some(
        (position) =>
          ((market(s).listings || []).find(
            (listing) => listing.id === position.listingId,
          )?.lastReturn || 0) > 0.08,
      ),
    [
      choice("cover", ["غطِ فورًا", "Cover now", "Racheter maintenant"], {
        wealth: -1_000_000,
      }),
      choice("wait", ["قاوم الضغط", "Hold the short", "Tenir la position"], {
        wealth: -500_000,
        risk: 4,
      }),
    ],
    1.3,
    6,
  ),
  event(
    "influencer-tip",
    "media",
    "large-social-channel",
    [
      "مؤثر يطلب توصية مدفوعة",
      "An influencer asks for a paid tip",
      "Un influenceur demande un conseil sponsorisé",
    ],
    [
      "منشور واحد قد يحرك سهمًا صغيرًا، لكنه يترك فاتورة واضحة.",
      "One post could move a small share, but leaves an obvious invoice.",
      "Une publication peut bouger une petite action, mais laisse une facture évidente.",
    ],
    (s) =>
      Number(s.staffCorp?.social?.followers ?? s.social?.followers ?? 0) >=
      50_000,
    [
      choice("decline", ["ارفض", "Decline", "Refuser"], { risk: -3 }),
      choice("sponsor", ["ادفع وانشر", "Pay and post", "Payer et publier"], {
        wealth: -500_000,
        listingShock: 1,
        manipulationExposure: 10,
        risk: 8,
      }),
    ],
  ),
  event(
    "sponsor-exit",
    "club",
    "own-club-listed-and-sponsored",
    [
      "راعٍ يبيع حصته بصمت",
      "A sponsor quietly sells its stake",
      "Un sponsor vend discrètement sa participation",
    ],
    [
      "حجم بيع غير معتاد يظهر قبل إعلان تجاري.",
      "Unusual selling appears before a commercial announcement.",
      "Des ventes inhabituelles précèdent une annonce commerciale.",
    ],
    (s) =>
      ownListing(s)?.status === "listed" &&
      (s.sponsors || []).some((sponsor) => sponsor.status === "active"),
    [
      choice(
        "call",
        ["اتصل بالراعي", "Call the sponsor", "Appeler le sponsor"],
        { ownListingShock: 0.3 },
      ),
      choice(
        "ignore",
        [
          "اترك السوق يقرر",
          "Let the market decide",
          "Laisser le marché décider",
        ],
        { ownListingShock: -0.8 },
      ),
    ],
  ),
  event(
    "derby-win-rally",
    "matchday",
    "recent-derby-win",
    [
      "فوز الديربي يفتح السوق على صعود",
      "Derby win opens the market higher",
      "La victoire dans le derby fait monter le marché",
    ],
    [
      "الجماهير تحول الاحتفال إلى أوامر شراء.",
      "Fans turn celebration into buy orders.",
      "Les supporters transforment la fête en ordres d’achat.",
    ],
    wonRecentDerby,
    [
      choice(
        "campaign",
        [
          "أطلق حملة جماهيرية",
          "Launch a fan campaign",
          "Lancer une campagne de supporters",
        ],
        { ownListingShock: 1.4, fanSupport: 2 },
      ),
      choice(
        "focus",
        [
          "ركز على المباراة التالية",
          "Focus on the next match",
          "Se concentrer sur le prochain match",
        ],
        { ownListingShock: 0.7 },
      ),
    ],
    1.5,
    4,
  ),
  event(
    "transfer-window-fever",
    "seasonal",
    "transfer-window-month",
    ["حمى سوق الانتقالات", "Transfer-window fever", "Fièvre du mercato"],
    [
      "كل إشاعة تعاقد تحرك أسهم الأندية في ساعات.",
      "Every transfer rumour moves club shares within hours.",
      "Chaque rumeur de transfert fait bouger les actions en quelques heures.",
    ],
    (s) => [1, 7, 8].includes(Number(s.date?.slice(5, 7))),
    [
      choice(
        "research",
        ["موّل البحث", "Fund research", "Financer la recherche"],
        { wealth: -250_000, listingShock: 0.5 },
      ),
      choice(
        "speculate",
        [
          "ضارب على الأخبار",
          "Speculate on headlines",
          "Spéculer sur les gros titres",
        ],
        { wealth: 500_000, risk: 6 },
      ),
    ],
    1.4,
    3,
  ),
  event(
    "year-end-window-dressing",
    "seasonal",
    "december",
    [
      "تجميل المحافظ في نهاية السنة",
      "Year-end window dressing",
      "Habillage des portefeuilles en fin d’année",
    ],
    [
      "الصناديق تشتري الأسماء الكبيرة قبل إغلاق دفاترها.",
      "Funds buy big names before closing their books.",
      "Les fonds achètent les grands noms avant de clôturer leurs comptes.",
    ],
    (s) => s.date?.slice(5, 7) === "12",
    [
      choice(
        "sell",
        ["بع في القوة", "Sell into strength", "Vendre dans la hausse"],
        { indexShock: -0.01, wealth: 400_000 },
      ),
      choice("hold", ["احتفظ", "Hold", "Conserver"], { indexShock: 0.02 }),
    ],
    1.1,
    10,
  ),
  event(
    "election-market-shock",
    "politics",
    "active-election-campaign",
    [
      "الانتخابات تربك أسهم الأندية",
      "Election uncertainty shakes club shares",
      "L’incertitude électorale secoue les actions",
    ],
    [
      "كل مرشح يعد بقواعد مالية مختلفة.",
      "Each candidate promises different financial rules.",
      "Chaque candidat promet des règles financières différentes.",
    ],
    (s) => Boolean(s.politics?.campaign?.active),
    [
      choice(
        "platform",
        [
          "انشر برنامجًا واضحًا",
          "Publish a clear platform",
          "Publier un programme clair",
        ],
        { indexShock: 0.015, wealth: -300_000 },
      ),
      choice(
        "attack",
        ["هاجم المنافسين", "Attack rivals", "Attaquer les rivaux"],
        { indexShock: -0.02, risk: 4 },
      ),
    ],
  ),
  event(
    "no-confidence-selloff",
    "politics",
    "president-under-pressure",
    [
      "مخاوف العزل تضرب السوق",
      "Removal fears hit the market",
      "La crainte d’une destitution frappe le marché",
    ],
    [
      "المستثمرون يخشون إلغاء قراراتك فور رحيلك.",
      "Investors fear your decisions may be reversed if you leave.",
      "Les investisseurs craignent l’annulation de vos décisions si vous partez.",
    ],
    (s) =>
      Boolean(
        s.politics?.office?.held &&
        (s.politics?.opposition?.pressure || 0) >= 55,
      ),
    [
      choice(
        "confidence",
        [
          "اطلب تصويت ثقة",
          "Seek a confidence vote",
          "Demander un vote de confiance",
        ],
        { indexShock: 0.01, risk: -2 },
      ),
      choice(
        "deals",
        [
          "اعقد صفقات سرية",
          "Make private deals",
          "Conclure des accords privés",
        ],
        { indexShock: 0.025, suspicion: 6, risk: 8 },
      ),
    ],
  ),
  event(
    "stadium-opening-preview",
    "club",
    "stadium-project-active",
    [
      "جولة سرية في الاستاد الجديد",
      "A private tour of the new stadium",
      "Une visite privée du nouveau stade",
    ],
    [
      "محللون يرفعون تقييم النادي بعد رؤية الإيرادات المحتملة.",
      "Analysts lift the club valuation after seeing revenue potential.",
      "Les analystes relèvent la valorisation après avoir vu le potentiel de revenus.",
    ],
    (s) =>
      Boolean(
        (s.facilities || []).find((facility) => facility.id === "stadium")
          ?.project || s.sportsCity?.stadium?.project,
      ),
    [
      choice(
        "invite",
        ["ادعُ المحللين", "Invite analysts", "Inviter les analystes"],
        { ownListingShock: 1.3, wealth: -200_000 },
      ),
      choice("secret", ["أبقِه سريًا", "Keep it secret", "Garder le secret"], {
        insiderExposure: 7,
        ownListingShock: 0.4,
      }),
    ],
  ),
  event(
    "betting-data-breach",
    "company",
    "listed-betting-company",
    [
      "اختراق بيانات شركة المراهنات",
      "Betting company data breach",
      "Fuite de données de la société de paris",
    ],
    [
      "قاعدة عملاء مسربة تهدد السمعة والسعر.",
      "A leaked customer database threatens reputation and price.",
      "Une base clients divulguée menace la réputation et le cours.",
    ],
    (s) => Boolean(market(s).ipos?.betting),
    [
      choice(
        "disclose",
        ["أعلن واصلح", "Disclose and fix", "Annoncer et réparer"],
        { wealth: -1_500_000, listingShock: -0.5, risk: -3 },
      ),
      choice(
        "conceal",
        ["أخفِ الاختراق", "Conceal the breach", "Cacher la fuite"],
        { listingShock: -1.5, risk: 16, suspicion: 5 },
      ),
    ],
    0.8,
    18,
  ),
  event(
    "fake-broker",
    "broker",
    "has-personal-wealth",
    [
      "سمسار مزيف يعرض صفقة مضمونة",
      "A fake broker offers a guaranteed trade",
      "Un faux courtier propose une opération garantie",
    ],
    [
      "العائد خيالي والعقد مليء بالثقوب.",
      "The return is fantastic and the contract is full of holes.",
      "Le rendement est fabuleux et le contrat plein de failles.",
    ],
    (s) => (s.empire?.personal || 0) >= 1_000_000,
    [
      choice(
        "verify",
        ["تحقق من الترخيص", "Verify the licence", "Vérifier la licence"],
        { wealth: -50_000, risk: -2 },
      ),
      choice("wire", ["حوّل المال", "Wire the money", "Virer l’argent"], {
        wealth: -1_000_000,
      }),
    ],
    0.7,
    12,
  ),
  event(
    "fan-buying-wave",
    "governance",
    "own-club-listed",
    [
      "الجماهير تشتري سهم ناديها",
      "Fans buy their club’s share",
      "Les supporters achètent l’action de leur club",
    ],
    [
      "حملة شعبية تطلب من كل مشجع امتلاك سهم واحد.",
      "A grassroots campaign asks every fan to own one share.",
      "Une campagne populaire demande à chaque supporter de détenir une action.",
    ],
    (s) => Boolean(market(s).ipos?.club && ownListing(s)?.status === "listed"),
    [
      choice(
        "support",
        ["ادعم الحملة", "Support the campaign", "Soutenir la campagne"],
        { ownListingShock: 1, fanSupport: 3, shareholderPressure: 4 },
      ),
      choice("neutral", ["ابقَ محايدًا", "Remain neutral", "Rester neutre"], {
        ownListingShock: 0.3,
      }),
    ],
    1.2,
    6,
  ),
  event(
    "foreign-fund-inflows",
    "cycle",
    "bull-or-strong-index",
    [
      "صندوق أجنبي يدخل أسهم الأندية",
      "A foreign fund enters club shares",
      "Un fonds étranger entre sur les actions de clubs",
    ],
    [
      "تدفقات كبيرة تبحث عن العلامات الجماهيرية الأقوى.",
      "Large inflows seek the strongest fan brands.",
      "D’importants flux recherchent les marques les plus populaires.",
    ],
    (s) =>
      market(s).cycle?.phase === "bull" || (market(s).index?.change || 0) >= 3,
    [
      choice(
        "welcome",
        ["رحب بالصندوق", "Welcome the fund", "Accueillir le fonds"],
        { indexShock: 0.04 },
      ),
      choice(
        "limits",
        [
          "طالب بحدود ملكية",
          "Demand ownership limits",
          "Exiger des limites de détention",
        ],
        { indexShock: -0.01, fanSupport: 2 },
      ),
    ],
  ),
  event(
    "recession-warning",
    "crisis",
    "weak-index-or-crash",
    [
      "تحذير ركود يضغط كل الأسهم",
      "Recession warning pressures every share",
      "Une alerte de récession pèse sur toutes les actions",
    ],
    [
      "المحللون يخفضون توقعات التذاكر والرعاية والانتقالات.",
      "Analysts cut ticket, sponsorship and transfer forecasts.",
      "Les analystes réduisent leurs prévisions de billetterie, sponsoring et transferts.",
    ],
    (s) =>
      market(s).cycle?.phase === "crash" ||
      (market(s).index?.change || 0) <= -4,
    [
      choice(
        "cash",
        ["ارفع السيولة", "Raise cash", "Renforcer la trésorerie"],
        { allListingsShock: -0.04 },
      ),
      choice(
        "invest",
        [
          "استثمر عكس الدورة",
          "Invest counter-cyclically",
          "Investir à contre-cycle",
        ],
        { wealth: -1_000_000, indexShock: 0.02 },
      ),
    ],
    1.3,
    10,
  ),
  event(
    "earnings-restatement",
    "earnings",
    "holding-or-own-listing",
    [
      "إعادة صياغة حسابات نادٍ",
      "A club restates its accounts",
      "Un club révise ses comptes",
    ],
    [
      "الربح المعلن كان أعلى من الحقيقة بسبب خطأ محاسبي.",
      "Reported profit was overstated by an accounting error.",
      "Le bénéfice publié était surestimé à cause d’une erreur comptable.",
    ],
    (s) => holdings(s).length > 0 || ownListing(s)?.status === "listed",
    [
      choice(
        "audit",
        [
          "موّل تدقيقًا مستقلًا",
          "Fund an independent audit",
          "Financer un audit indépendant",
        ],
        { wealth: -400_000, listingShock: -0.4, risk: -3 },
      ),
      choice("sell", ["اخرج سريعًا", "Exit quickly", "Sortir rapidement"], {
        listingShock: -1.1,
      }),
    ],
  ),
  event(
    "academy-prospect-boom",
    "football",
    "academy-developed",
    [
      "موهبة الأكاديمية ترفع التقييم",
      "Academy prospect lifts valuation",
      "Un espoir du centre fait monter la valorisation",
    ],
    [
      "الكشافون يتحدثون عن نجم قد يوفر عشرات الملايين.",
      "Scouts discuss a star who could save tens of millions.",
      "Les recruteurs parlent d’une future star qui pourrait économiser des dizaines de millions.",
    ],
    (s) =>
      (s.facilities || []).find((facility) => facility.id === "academy")
        ?.level >= 2,
    [
      choice(
        "showcase",
        [
          "اعرض الموهبة إعلاميًا",
          "Showcase the prospect",
          "Médiatiser l’espoir",
        ],
        { ownListingShock: 0.9, fanSupport: 1 },
      ),
      choice(
        "protect",
        ["احمه من الضجيج", "Protect from hype", "Le protéger du bruit"],
        { ownListingShock: 0.3 },
      ),
    ],
  ),
  event(
    "criminal-rumour",
    "regulation",
    "criminal-or-suspended",
    [
      "شائعة اتهام جنائي جديدة",
      "A fresh criminal-charge rumour",
      "Une nouvelle rumeur d’accusation pénale",
    ],
    [
      "حتى قبل الحكم، البنوك تقلص حدود التداول.",
      "Even before judgment, banks cut trading limits.",
      "Avant même le jugement, les banques réduisent les limites de négociation.",
    ],
    (s) => ["criminal", "suspended"].includes(market(s).regulator?.status),
    [
      choice(
        "defend",
        ["انشر دفاعك", "Publish your defense", "Publier votre défense"],
        { wealth: -750_000, risk: -4, indexShock: -0.01 },
      ),
      choice(
        "attack",
        [
          "اتهم الهيئة بالتسييس",
          "Accuse the regulator of politics",
          "Accuser le régulateur de politisation",
        ],
        { risk: 12, indexShock: -0.03 },
      ),
    ],
    1.4,
    12,
  ),
  event(
    "market-holiday-liquidity",
    "seasonal",
    "holiday-month",
    [
      "سيولة ضعيفة في عطلة السوق",
      "Thin holiday liquidity",
      "Faible liquidité pendant les fêtes",
    ],
    [
      "أمر صغير قد يحرك السعر أكثر من المعتاد.",
      "A small order could move price more than usual.",
      "Un petit ordre peut déplacer le cours plus que d’habitude.",
    ],
    (s) => [6, 12].includes(Number(s.date?.slice(5, 7))),
    [
      choice(
        "wait",
        [
          "انتظر عودة السيولة",
          "Wait for liquidity",
          "Attendre le retour de la liquidité",
        ],
        { risk: -1 },
      ),
      choice(
        "trade",
        [
          "استغل الفراغ",
          "Exploit the thin market",
          "Profiter du marché étroit",
        ],
        { wealth: 300_000, risk: 5, listingShock: 0.5 },
      ),
    ],
    0.8,
    5,
  ),
  event(
    "supporters-boycott",
    "governance",
    "listed-own-low-fans",
    [
      "مقاطعة جماهيرية تضغط السهم",
      "Fan boycott pressures the share",
      "Un boycott des supporters pèse sur l’action",
    ],
    [
      "حملة تطالب بعدم شراء التذاكر أو السهم حتى تتحسن القرارات.",
      "A campaign urges fans to avoid tickets and shares until decisions improve.",
      "Une campagne appelle à éviter billets et actions jusqu’à de meilleures décisions.",
    ],
    (s) => ownListing(s)?.status === "listed" && (s.fanSupport || 0) < 55,
    [
      choice(
        "listen",
        ["افتح حوارًا", "Open a dialogue", "Ouvrir le dialogue"],
        { wealth: -250_000, fanSupport: 5, ownListingShock: 0.4 },
      ),
      choice(
        "dismiss",
        ["تجاهل المقاطعة", "Dismiss the boycott", "Ignorer le boycott"],
        { fanSupport: -4, ownListingShock: -1.2 },
      ),
    ],
    1.3,
    6,
  ),
  event(
    "analyst-upgrade",
    "broker",
    "profitable-listing",
    [
      "محلل يرفع السعر المستهدف",
      "Analyst raises the price target",
      "Un analyste relève son objectif de cours",
    ],
    [
      "تقرير جديد يرى أن السوق يقلل من قيمة العلامة الجماهيرية.",
      "A new report says the market undervalues the fan brand.",
      "Un nouveau rapport estime que le marché sous-évalue la marque des supporters.",
    ],
    (s) => (market(s).listings || []).some((listing) => listing.lastProfit > 0),
    [
      choice(
        "share",
        ["شارك التقرير", "Share the report", "Partager le rapport"],
        { listingShock: 0.8 },
      ),
      choice("silence", ["لا تعلق", "Do not comment", "Ne pas commenter"], {
        listingShock: 0.3,
      }),
    ],
    0.9,
    5,
  ),
  event(
    "market-circuit-breaker",
    "crisis",
    "large-index-drop",
    [
      "قاطع آلي يوقف التداول",
      "Circuit breaker halts trading",
      "Un coupe-circuit suspend les échanges",
    ],
    [
      "هبوط المؤشر تجاوز حد الحماية وعلقت الأوامر.",
      "The index drop crossed the protection limit and orders were paused.",
      "La baisse de l’indice a franchi le seuil de protection et les ordres sont suspendus.",
    ],
    (s) =>
      (market(s).index?.change || 0) <= -7 ||
      market(s).cycle?.phase === "crash",
    [
      choice(
        "respect",
        ["احترم الإيقاف", "Respect the halt", "Respecter la suspension"],
        { risk: -3, indexShock: 0.01 },
      ),
      choice(
        "offbook",
        ["تداول خارج الدفتر", "Trade off-book", "Négocier hors marché"],
        { wealth: 700_000, risk: 20, suspicion: 7 },
      ),
    ],
    1.5,
    8,
  ),
  event(
    "club-credit-downgrade",
    "distress",
    "negative-own-profit",
    [
      "خفض التصنيف الائتماني للنادي",
      "Club credit rating downgraded",
      "La note de crédit du club est abaissée",
    ],
    [
      "المراجع يحذر من حرق السيولة وارتفاع الالتزامات.",
      "The reviewer warns about cash burn and rising obligations.",
      "L’auditeur alerte sur la consommation de trésorerie et les engagements.",
    ],
    (s) => (ownListing(s)?.lastProfit || 0) < -2_000_000,
    [
      choice(
        "plan",
        [
          "أعلن خطة خفض نفقات",
          "Announce a cost plan",
          "Annoncer un plan d’économies",
        ],
        { ownListingShock: 0.3, fanSupport: -1 },
      ),
      choice(
        "deny",
        ["ارفض التقرير", "Reject the report", "Rejeter le rapport"],
        { ownListingShock: -0.8, risk: 4 },
      ),
    ],
  ),
  event(
    "fans-demand-dividend",
    "governance",
    "fan-owners-and-profit",
    [
      "المساهمون يطالبون بتوزيع أكبر",
      "Shareholders demand a bigger dividend",
      "Les actionnaires exigent un dividende plus élevé",
    ],
    [
      "الأرباح موجودة لكن الجماهير تريد مالًا وإنجازات في الوقت نفسه.",
      "Profits exist, but fans want cash and trophies at the same time.",
      "Les bénéfices sont là, mais les supporters veulent argent et trophées.",
    ],
    (s) =>
      Boolean(market(s).ipos?.club && (ownListing(s)?.lastProfit || 0) > 0),
    [
      choice(
        "pay",
        ["زد التوزيع", "Raise the dividend", "Augmenter le dividende"],
        { wealth: 400_000, shareholderPressure: -8, ownListingShock: 0.5 },
      ),
      choice(
        "reinvest",
        ["أعد استثمار الربح", "Reinvest the profit", "Réinvestir le bénéfice"],
        { shareholderPressure: 6, ownListingShock: 0.8 },
      ),
    ],
  ),
]);

export const STOCK_MARKET_EVENT_BY_ID = Object.freeze(
  Object.fromEntries(STOCK_MARKET_EVENTS.map((item) => [item.id, item])),
);

export const STOCK_MARKET_EVENT_PHRASES = Object.freeze(
  STOCK_MARKET_EVENTS.reduce((phrases, item) => {
    for (const value of [
      item.title,
      item.prompt,
      ...item.choices.map((entry) => entry.label),
    ]) {
      phrases[value.ar] = [value.en, value.fr];
      const bareAr = value.ar.replace(/[.؛:!؟…،,»«()]+$/, "");
      const bareEn = value.en.replace(/[.!?…,:;]+$/, "");
      const bareFr = value.fr.replace(/[.!?…,:;]+$/, "");
      if (bareAr && !phrases[bareAr]) phrases[bareAr] = [bareEn, bareFr];
    }
    return phrases;
  }, {}),
);
