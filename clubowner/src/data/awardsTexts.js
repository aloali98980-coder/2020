// 0.42 — نصوص الجوائز وحفل نهاية الموسم وقاعة المشاهير بثلاث لغات.
// كل سلسلة تُبنى عبر tr(ar, en, fr) محليًا — نفس نمط celebrationTexts.js.
const tr = (ar, en, fr) => ({ ar, en, fr });

// تعريف الجوائز السبع عشرة: المعرّف يُستخدم في الحفظة، والاسم للعرض.
export const AWARD_DEFS = Object.freeze({
  "best-player": {
    cadence: "season",
    name: tr("الأفضل عالميًا", "Best Player in the World", "Meilleur joueur du monde"),
    kicker: tr("الكرة الذهبية", "The golden ball", "Le ballon d’or"),
  },
  "best-u21": {
    cadence: "season",
    name: tr("أفضل U21 عالميًا", "Best U21 in the World", "Meilleur U21 du monde"),
    kicker: tr("المستقبل الآن", "The future is now", "L’avenir c’est maintenant"),
  },
  "best-african": {
    cadence: "season",
    name: tr("الأفضل أفريقيًا", "Best African Player", "Meilleur joueur africain"),
    kicker: tr("نجم أفريقيا", "Africa’s star", "La star africaine"),
  },
  "best-u23-african": {
    cadence: "season",
    name: tr("أفضل U23 أفريقيًا", "Best U23 African Player", "Meilleur Africain U23"),
    kicker: tr("الجيل الصاعد", "The rising generation", "La génération montante"),
  },
  "top-scorer-season": {
    cadence: "season",
    name: tr("هداف الموسم", "Season Top Scorer", "Meilleur buteur de la saison"),
    kicker: tr("رجل الأهداف", "The goals man", "L’homme des buts"),
  },
  "top-scorer-competition": {
    cadence: "season",
    name: tr("هداف المسابقات", "Competition Top Scorer", "Meilleur buteur des compétitions"),
    kicker: tr("هداف كل مسابقة", "Top scorer in every competition", "Buteur de chaque compétition"),
  },
  "team-of-season": {
    cadence: "season",
    name: tr("تشكيلة الموسم", "Team of the Season", "Équipe de la saison"),
    kicker: tr("الحديقة عشر", "The dream eleven", "Le onze de rêve"),
  },
  "golden-glove": {
    cadence: "season",
    name: tr("القفاز الذهبي", "Golden Glove", "Gant d’or"),
    kicker: tr("حصن الفريق", "The fortress", "La forteresse"),
  },
  "assist-king": {
    cadence: "season",
    name: tr("ملك الأسيست", "King of Assists", "Roi des passes"),
    kicker: tr("صانع الأفراح", "The joy maker", "Le faiseur de joie"),
  },
  "best-arab": {
    cadence: "season",
    name: tr("الأفضل عربيًا", "Best Arab Player", "Meilleur joueur arabe"),
    kicker: tr("فخر العرب", "Pride of the Arab world", "La fierté arabe"),
  },
  "best-in-africa": {
    cadence: "season",
    name: tr("الأفضل داخل أفريقيا", "Best Player in Africa", "Meilleur joueur en Afrique"),
    kicker: tr("نجم القارة", "The continent’s star", "La star du continent"),
  },
  "fan-best": {
    cadence: "season",
    name: tr("الأفضل بتصويت الجماهير", "Fans’ Player of the Year", "Joueur de l’année des supporters"),
    kicker: tr("صوت المدرجات", "Voice of the stands", "La voix des tribunes"),
  },
  "best-youngster": {
    cadence: "season",
    name: tr("أفضل ناشئ", "Best Youngster", "Meilleur espoir"),
    kicker: tr("جوهرة الموسم", "Gem of the season", "La pépite de la saison"),
  },
  "best-transfer": {
    cadence: "season",
    name: tr("أفضل صفقة", "Best Transfer", "Meilleur transfert"),
    kicker: tr("صفقة الموسم", "Deal of the season", "Le coup de la saison"),
  },
  "coach-of-year": {
    cadence: "season",
    name: tr("أفضل مدرب عالميًا", "World Coach of the Year", "Meilleur entraîneur du monde"),
    kicker: tr("الرجل خلف الكاميرا", "The man behind the team", "L’homme de l’ombre"),
  },
  "player-of-month": {
    cadence: "month",
    name: tr("لاعب الشهر", "Player of the Month", "Joueur du mois"),
    kicker: tr("قمة الشهر", "Top of the month", "Le sommet du mois"),
  },
  "coach-of-month": {
    cadence: "month",
    name: tr("مدرب الشهر", "Coach of the Month", "Entraîneur du mois"),
    kicker: tr("قيادة الشهر", "Leadership of the month", "Le leadership du mois"),
  },
});

// أسماء مسابقات الهداف حسب النطاق.
export const SCORER_SCOPES = Object.freeze({
  league: tr("الدوري المحلي", "Domestic League", "Championnat national"),
  cup: tr("الكأس المحلية", "Domestic Cup", "Coupe nationale"),
  continental: tr("البطولة القارية", "Continental Cup", "Coupe continentale"),
});

export const AWARDS_COPY = Object.freeze({
  seasonCeremony: tr(
    "حفل توزيع جوائز نهاية الموسم",
    "End-of-Season Awards Ceremony",
    "Cérémonie des prix de fin de saison",
  ),
  ceremonyKicker: tr(
    "ليلة الجوائز الكبرى",
    "The grand awards night",
    "La grande soirée des prix",
  ),
  ceremonyIntro: tr(
    "الأضواء تشتعل، والموسم يُختم بأسماء خالدة في قاعة المشاهير.",
    "The lights rise on a season sealed with names that will live in the hall of fame.",
    "Les lumières s’allument sur une saison gravée dans le panthéon.",
  ),
  ceremonyNext: tr("الجائزة التالية", "Next award", "Prix suivant"),
  ceremonyClose: tr("إغلاق الحفل", "Close the ceremony", "Fermer la cérémonie"),
  ceremonyOpen: tr(
    "شاهد حفل الجوائز",
    "Watch the awards ceremony",
    "Voir la cérémonie des prix",
  ),
  ceremonyRepeat: tr(
    "أعد مشاهدة الحفل",
    "Replay the ceremony",
    "Revoir la cérémonie",
  ),
  ceremonyPending: tr(
    "حفل الموسم جاهز للعرض!",
    "The season ceremony is ready!",
    "La cérémonie de la saison est prête !",
  ),
  winner: tr("الفائز", "Winner", "Vainqueur"),
  winners: tr("الفائزون", "Winners", "Vainqueurs"),
  noCandidate: tr(
    "لا يوجد مرشح مؤهل هذا الموسم",
    "No eligible candidate this season",
    "Aucun candidat éligible cette saison",
  ),
  ownPlayer: tr("لاعبنا", "Our player", "Notre joueur"),
  voteTitle: tr(
    "استفتاء الجماهير — الأفضل هذا الموسم",
    "Fan vote — Player of the Season",
    "Vote des supporters — joueur de la saison",
  ),
  voteOpen: tr("التصويت مفتوح", "Voting is open", "Le vote est ouvert"),
  voteClosed: tr("التصويت مغلق", "Voting is closed", "Le vote est clôturé"),
  voteHint: tr(
    "الأصوات تتأثر بشعبية النادي وتفاعل السوشيال وحملتك الدعائية.",
    "Votes grow with club popularity, social engagement and your campaign.",
    "Les votes évoluent avec la popularité du club, l’engagement social et votre campagne.",
  ),
  campaign: tr("حملة دعائية لمرشحك", "Campaign for your candidate", "Campagne pour votre candidat"),
  campaigned: tr("أطلقت حملتك", "Your campaign is running", "Votre campagne est lancée"),
  campaignCost: tr("تكلفة الحملة", "Campaign cost", "Coût de la campagne"),
  votes: tr("صوت", "votes", "votes"),
  monthlyTitle: tr("جوائز الشهر", "Monthly awards", "Prix du mois"),
  monthlyNone: tr("لم تُوزَّع جوائز بعد", "No awards yet", "Pas encore de prix"),
  hallTitle: tr("قاعة المشاهير", "Hall of Fame", "Panthéon des vainqueurs"),
  hallHint: tr(
    "سجل الفائزين محفوظ في حفظتك عبر المواسم.",
    "The winners’ roll is saved in your save across seasons.",
    "Le palmarès est enregistré dans votre sauvegarde, saison après saison.",
  ),
  demandTitle: tr("مطلب عقدي بعد الجائزة", "Contract demand after the award", "Demande contractuelle après le prix"),
  demandRaise: tr("الموافقة على زيادة مجزية", "Approve a rewarding raise", "Accorder une augmentation"),
  demandImprove: tr("تحسين العقد بالمعقول", "Improve the deal moderately", "Améliorer raisonnablement le contrat"),
  demandRefuse: tr("رفض المطلب", "Refuse the demand", "Refuser la demande"),
  demandRaiseDone: tr(
    "قُبلت الزيادة وحُسّن العقد — المعنويات في الأعلى.",
    "The raise was approved and the deal improved — morale is high.",
    "L’augmentation est accordée et le contrat amélioré — le moral est au top.",
  ),
  demandImproveDone: tr(
    "حُسّن العقد بمعقول — اللاعب مرتاح.",
    "The deal improved moderately — the player is content.",
    "Le contrat est modestement amélioré — le joueur est satisfait.",
  ),
  demandRefused: tr(
    "رُفض المطلب — المعنويات تأثرت.",
    "The demand was refused — morale took a hit.",
    "La demande est refusée — le moral en prend un coup.",
  ),
  demandExpired: tr(
    "انتهت مهلة مطلب العقد دون رد — اللاعب خاب أمله.",
    "The contract demand expired without an answer — the player is disappointed.",
    "La demande a expiré sans réponse — le joueur est déçu.",
  ),
  coachDemandTitle: tr("مطلب المدرب — مراجعة الراتب", "Coach demand — salary review", "Demande de l’entraîneur — salaire"),
  coachDemandRaise: tr("الموافقة على زيادة المدرب", "Approve the coach’s raise", "Accorder l’augmentation"),
  coachDemandRefuse: tr("رفض مطلب المدرب", "Refuse the coach", "Refuser la demande"),
  coachDemandDone: tr(
    "رُفِع راتب المدرب وامتد عقده — الثقة أعلى.",
    "The coach’s salary rose and the contract extended — confidence is higher.",
    "Le salaire de l’entraîneur augmente et son contrat est prolongé — confiance renforcée.",
  ),
  coachDemandRefused: tr(
    "رُفض مطلب المدرب — الثقة تأثرت.",
    "The coach’s demand was refused — confidence dropped.",
    "La demande est refusée — la confiance baisse.",
  ),
  fanBoost: tr(
    "تصاعد التفاعل على السوشيال بعد التتويج.",
    "Social engagement surged after the win.",
    "L’engagement social a explosé après la victoire.",
  ),
  seasonOf: tr("الموسم", "Season", "Saison"),
  monthOf: tr("شهر", "Month", "Mois"),
  scoreLabel: tr("التقييم", "Score", "Score"),
  transferNote: tr(
    "أفضل أثر لصفقة مقابل تكلفتها خلال الموسم.",
    "Best impact-per-cost signing of the season.",
    "Meilleur transfert rapport/coût de la saison.",
  ),
});
