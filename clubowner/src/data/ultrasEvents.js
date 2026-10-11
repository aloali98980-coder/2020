import { addDays } from "../core/utils.js";
import { getDerbyInfo } from "../services/derby.js";

const L = (ar, en, fr) => ({ ar, en, fr });
const group = (s) => s.ultras?.groups?.[s.clubId];

function ownFixtures(s) {
  const output = [];
  const seen = new Set();
  const add = (list) => {
    for (const fixture of list || []) {
      if (!fixture?.id || seen.has(fixture.id)) continue;
      if (![fixture.home, fixture.away].includes(s.clubId)) continue;
      seen.add(fixture.id);
      output.push(fixture);
    }
  };
  add(s.fixtures);
  add(s.friendlies);
  for (const division of s.expansion?.divisions || [])
    if (division.clubs?.includes(s.clubId)) add(division.fixtures);
  for (const cup of s.expansion?.cups || []) {
    add(cup.fixtures);
    add(cup.pendingMatches);
    add(cup.results);
  }
  return output;
}

function upcoming(s, days, predicate = () => true) {
  const through = addDays(s.date, days);
  return ownFixtures(s)
    .filter(
      (fixture) =>
        !fixture.played &&
        fixture.date >= s.date &&
        fixture.date <= through &&
        predicate(fixture),
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}

const derbySoon = (s, days = 30) =>
  upcoming(s, days, (fixture) =>
    getDerbyInfo(fixture.home, fixture.away, s).isDerby,
  );
const homeMatchSoon = (s, days = 21) =>
  upcoming(s, days, (fixture) => fixture.home === s.clubId && !fixture.neutral);
const bigMatchSoon = (s, days = 21) =>
  upcoming(s, days, (fixture) =>
    fixture.competition ||
    getDerbyInfo(fixture.home, fixture.away, s).isDerby,
  );
const currentYear = (s) => Number(s.date.slice(0, 4));

const choice = (id, label, effect) => ({ id, label, effect });
const decision = (id, title, body, condition, choices, cooldown = 70) => ({
  id,
  mode: "decision",
  title,
  body,
  condition,
  choices,
  cooldown,
});
const flavor = (id, title, body, condition, cooldown = 110) => ({
  id,
  mode: "flavor",
  title,
  body,
  condition,
  choices: [],
  cooldown,
});

// Each scene has its own logical gate and translated copy; flavor scenes never
// block the calendar, while decisions have an explicit player response.
export const ULTRAS_EVENT_CATALOG = [
  decision(
    "derby-tifo-plan",
    L("ليلة الديربي تقترب", "Derby night is approaching", "Le derby approche"),
    L("الكابو يقترح تيفو كبيرًا يلف المدرج بالألوان. التجهيز يرفع الحماس لكنه يحتاج ميزانية وتنظيمًا.", "The capo proposes a full-stand tifo in the club colours. It boosts the atmosphere but needs a budget and careful coordination.", "Le capo propose un tifo couvrant toute la tribune aux couleurs du club. Il renforce l’ambiance, avec un coût et une organisation à prévoir."),
    (s) => !!group(s) && !!derbySoon(s, 18),
    [choice("stage", L("اعتماد التيفو", "Stage the tifo", "Préparer le tifo"), "stage-tifo"), choice("defer", L("تأجيله لهذه المرة", "Save it for another match", "Le garder pour un autre match"), "decline")],
    85,
  ),
  decision(
    "derby-banner-theft",
    L("راية غريمة اختفت", "A rival banner has gone missing", "Une bannière rivale a disparu"),
    L("قبل الديربي، يتداول المشجعون خبر سرقة راية من المدرج المقابل. أمامك تسوية هادئة أو تصعيد قد يجلب غرامة وفضيحة.", "Before the derby, supporters report a banner taken from the rival end. You can seek a quiet exchange or risk a costly confrontation.", "Avant le derby, des supporters signalent qu’une bannière a été prise dans le virage adverse. Vous pouvez négocier un échange ou risquer un affrontement coûteux."),
    (s) => !!group(s) && !!derbySoon(s, 14) && (group(s).lastBannerWarYear !== currentYear(s)),
    [choice("exchange", L("تنظيم تبادل بإشراف", "Arrange a supervised exchange", "Organiser un échange encadré"), "safe-banner-exchange"), choice("fight", L("Laisser le capo riposter", "Let the capo retaliate", "Laisser le capo riposter"), "banner-clash")],
    180,
  ),
  decision(
    "dog-on-pitch",
    L("ضيف مفاجئ في الملعب 🐕", "An unexpected guest on the pitch 🐕", "Un invité inattendu sur la pelouse 🐕"),
    L("كلب صغير دخل أرض الملعب قبل المباراة، والجماهير تهتف له. يمكن إيقاف اللعب بهدوء واستدعاء فريق الإنقاذ بدل مطاردته.", "A small dog has wandered onto the pitch before kick-off and the crowd is cheering. Stewards can pause play and guide it to safety instead of chasing it.", "Un petit chien s’est aventuré sur la pelouse avant le coup d’envoi. Les stadiers peuvent interrompre le jeu et le conduire en sécurité plutôt que de le poursuivre."),
    (s) => !!group(s) && !!homeMatchSoon(s, 3),
    [choice("safe", L("إيقاف اللعب وإحضار فريق الإنقاذ", "Pause play and call animal rescue", "Interrompre le jeu et appeler les secours animaliers"), "escort-dog"), choice("ignore", L("ترك المنظمين يتصرفون", "Let the stewards handle it", "Laisser les stadiers gérer la situation"), "decline")],
    150,
  ),
  decision(
    "stand-proposal",
    L("طلب زواج في المدرجات 💍", "A proposal in the stands 💍", "Une demande en mariage dans les tribunes 💍"),
    L("مشجعان يطلبان لحظة قصيرة على الشاشة قبل المباراة. موافقتهما واضحة، ويمكن تنسيق اللقطة دون تعطيل الدخول أو تصوير من لم يوافق.", "Two supporters ask for a brief moment on the stadium screen before kick-off. Both have agreed, and the club can keep the moment short and avoid filming anyone who has not consented.", "Deux supporters demandent un court instant sur l’écran avant le coup d’envoi. Leur accord est explicite et le club peut préserver leur intimité ainsi que celle des autres spectateurs."),
    (s) => !!group(s) && !!homeMatchSoon(s, 14),
    [choice("approve", L("تنسيق اللحظة بموافقتهما", "Coordinate the moment with their consent", "Organiser le moment avec leur accord"), "approve-proposal"), choice("private", L("اقتراح مساحة خاصة بعيدًا عن الكاميرات", "Offer a private moment away from cameras", "Proposer un moment privé, loin des caméras"), "private-proposal")],
    220,
  ),
  decision(
    "airport-welcome",
    L("استقبال الصفقة الجديدة", "A welcome for the new signing", "Accueil de la nouvelle recrue"),
    L("وصل لاعب جديد بتوقعات كبيرة. الكابو يعرض استقبالًا منظمًا في المطار؛ النشر على المنصات أقل كلفة وأسهل أمنيًا.", "A high-profile signing has arrived. The capo offers a coordinated airport welcome; a social-media greeting is cheaper and easier to secure.", "Une recrue très attendue vient d’arriver. Le capo propose un accueil organisé à l’aéroport ; un message sur les réseaux coûte moins cher et se sécurise plus facilement."),
    (s) => !!group(s) && group(s).lastSigningDate && group(s).lastSigningDate >= addDays(s.date, -7),
    [choice("airport", L("تنسيق استقبال هادئ", "Arrange a calm welcome", "Organiser un accueil calme"), "airport-greeting"), choice("online", L("ترحيب عبر المنصات فقط", "Welcome them online", "Souhaiter la bienvenue en ligne"), "online-welcome")],
    120,
  ),
  decision(
    "away-support-trip",
    L("رحلة خلف الفريق", "An away-day trip", "Un déplacement derrière l’équipe"),
    L("هناك مباراة خارج الملعب خلال أسبوع. المشجعون يطلبون حافلة منظمة؛ السفر الجماعي يرفع المعنويات ويمنح الفريق دفعة صغيرة.", "The team has an away match within a week. Supporters ask for an organized coach trip; travelling together lifts morale and gives the side a small boost.", "L’équipe joue à l’extérieur cette semaine. Les supporters demandent un car organisé ; le déplacement renforce le moral et offre un léger coup de pouce à l’équipe."),
    (s) => !!group(s) && !!upcoming(s, 7, (fixture) => fixture.away === s.clubId && !fixture.neutral),
    [choice("go", L("تمويل رحلة منظمة", "Fund the organized trip", "Financer le déplacement organisé"), "organize-away"), choice("stay", L("الاعتذار هذه المرة", "Skip this trip", "Renoncer à ce déplacement"), "decline")],
    100,
  ),
  decision(
    "capo-radio-interview",
    L("الكابو على الهواء", "The capo is invited on air", "Le capo est invité à l’antenne"),
    L("محطة رياضية تدعو قائد المجموعة للحديث عن الفريق. حوار محترم قد يهدئ التوتر أو يرفع صوت المطالب.", "A sports station invites the capo to discuss the club. A respectful interview could ease tensions or give supporters’ demands a louder platform.", "Une radio sportive invite le capo à parler du club. Un échange respectueux peut apaiser les tensions ou donner plus d’écho aux revendications."),
    (s) => !!group(s) && group(s).mood <= 70 && !group(s).lastInterviewDate,
    [choice("listen", L("إتاحة الحوار ووضع قواعد واضحة", "Allow the interview with clear ground rules", "Autoriser l’entretien avec des règles claires"), "meet-capo"), choice("decline", L("تأجيل المقابلة", "Decline for now", "Reporter l’entretien"), "decline")],
    200,
  ),
  decision(
    "chant-strike-vote",
    L("تصويت على صمت المدرج", "A vote on a silent stand", "Vote pour un virage silencieux"),
    L("بسبب تراجع الثقة، يقترح المنظمون إيقاف الأهازيج في المباراة المقبلة. الحوار قد يعيد الصوت قبل أن يتحول الصمت إلى عادة.", "After confidence fell, organizers propose stopping chants at the next match. Listening now may bring the noise back before silence becomes routine.", "La confiance a baissé et les organisateurs proposent de suspendre les chants au prochain match. Un dialogue peut rendre sa voix au virage avant que le silence ne s’installe."),
    (s) => !!group(s) && group(s).mood <= 38 && !!homeMatchSoon(s, 30),
    [choice("talk", L("فتح جلسة استماع", "Hold a listening meeting", "Organiser une rencontre d’écoute"), "listen-strike"), choice("ignore", L("تجاهل المقاطعة", "Ignore the call", "Ignorer l’appel"), "ignore-strike")],
    130,
  ),
  decision(
    "anti-owner-banner",
    L("لافتة ضد المالك", "A banner criticizes the owner", "Une banderole critique le propriétaire"),
    L("المدرج يجهز لافتة تعترض على قرارات الإدارة. الرد الهادئ يفتح باب التفاوض؛ المنع قد يحولها إلى احتجاج أوسع.", "The stand is preparing a banner criticizing the board. A calm response opens negotiations; suppressing it may turn the banner into a larger protest.", "Le virage prépare une banderole contre la direction. Une réponse posée ouvre le dialogue ; l’interdire pourrait élargir la contestation."),
    (s) => !!group(s) && group(s).mood <= 52 && !group(s).lastOwnerBannerDate,
    [choice("dialogue", L("لقاء ممثلي المشجعين", "Meet supporter representatives", "Rencontrer les représentants des supporters"), "dialogue-banner"), choice("ignore", L("ترك اللافتة دون رد", "Leave the banner unanswered", "Ne pas répondre à la banderole"), "ignore-banner")],
    180,
  ),
  decision(
    "peaceful-protest-plan",
    L("وقفة أمام النادي", "A peaceful protest is planned", "Une manifestation pacifique se prépare"),
    L("الغضب تجاوز المدرج، وممثلون يطلبون وقفة سلمية أمام المقر. استقبالهم قد يمنع الاحتقان، أما الإهمال فيزيد المقاطعة.", "Anger has moved beyond the stands, and representatives request a peaceful gathering outside the club offices. Meeting them may prevent escalation; neglect can deepen the boycott.", "La colère dépasse les tribunes et des représentants demandent un rassemblement pacifique devant le siège. Les recevoir peut éviter l’escalade ; les ignorer risque d’aggraver le boycott."),
    (s) => !!group(s) && group(s).mood <= 27 && !group(s).lastProtestDate,
    [choice("receive", L("استقبال وفد والتفاوض", "Receive a delegation and negotiate", "Recevoir une délégation et négocier"), "peaceful-protest"), choice("refuse", L("رفض اللقاء", "Refuse the meeting", "Refuser la rencontre"), "hardline-protest")],
    240,
  ),
  decision(
    "derby-safety-plan",
    L("خطة أمان للديربي", "A derby safety plan", "Plan de sécurité du derby"),
    L("الشرطة والملعب يطلبان زيادة المنظمين قبل مواجهة الغريم. الاستثمار يخفف احتمال الاشتباك ويحمي العائلات.", "Police and stadium staff ask for extra stewards before the derby. The investment lowers the risk of clashes and helps protect families.", "La police et le stade demandent davantage de stadiers avant le derby. Cet investissement réduit le risque d’affrontement et protège les familles."),
    (s) => !!group(s) && !!derbySoon(s, 10),
    [choice("marshal", L("تعيين منظمين إضافيين", "Hire extra stewards", "Engager des stadiers supplémentaires"), "hire-marshals"), choice("skip", L("الاكتفاء بالخطة الحالية", "Keep the current plan", "Garder le dispositif actuel"), "decline")],
    160,
  ),
  decision(
    "youth-tifo-workshop",
    L("ورشة رايات للناشئين", "A youth banner workshop", "Atelier de banderoles pour les jeunes"),
    L("مجموعة من الناشئين تريد تصميم راية مع الكابو. فعالية آمنة تربط الأجيال وتدعم هوية النادي.", "Young supporters want to design a banner with the capo. A supervised workshop can connect generations and celebrate the club’s identity.", "De jeunes supporters veulent créer une bannière avec le capo. Un atelier encadré peut rapprocher les générations et célébrer l’identité du club."),
    (s) => !!group(s) && (s.facilities?.find((item) => item.id === "academy")?.level || 0) <= 2,
    [choice("fund", L("تمويل الورشة", "Fund the workshop", "Financer l’atelier"), "fund-youth-workshop"), choice("later", L("تأجيل النشاط", "Schedule it later", "Reporter l’activité"), "decline")],
    200,
  ),
  decision(
    "supporter-food-drive",
    L("مبادرة طعام قبل المباراة", "A match-day food drive", "Collecte alimentaire avant le match"),
    L("المشجعون يقترحون جمع تبرعات غذائية خارج الملعب. مساهمة النادي اختيارية ويمكن تنسيقها مع جمعية محلية.", "Supporters propose collecting food outside the stadium. The club’s contribution is optional and can be coordinated with a local charity.", "Les supporters proposent une collecte alimentaire devant le stade. La contribution du club reste facultative et peut être organisée avec une association locale."),
    (s) => !!group(s) && !!homeMatchSoon(s, 21),
    [choice("fund", L("دعم المبادرة", "Support the drive", "Soutenir la collecte"), "fund-community"), choice("skip", L("السماح للمتطوعين بالتنظيم فقط", "Let volunteers organize independently", "Laisser les bénévoles organiser seuls"), "community-volunteer")],
    190,
  ),
  decision(
    "forgotten-flags",
    L("الرايات القديمة في المخزن", "Old flags in storage", "Les anciennes banderoles du local"),
    L("المشجعون عثروا على رايات تاريخية تحتاج إلى ترميم. إعادتها إلى المدرج تعزز الانتماء، مع تخصيص ممرات آمنة.", "Supporters found historic flags that need repair. Restoring them for the stand can strengthen belonging while keeping access routes clear.", "Les supporters ont retrouvé d’anciennes banderoles à restaurer. Les remettre en tribune renforce le sentiment d’appartenance, tout en gardant les accès dégagés."),
    (s) => !!group(s) && !group(s).flagsRestored,
    [choice("restore", L("ترميم الرايات", "Restore the flags", "Restaurer les banderoles"), "restore-flags"), choice("store", L("إبقاؤها في الأرشيف", "Keep them in the archive", "Les conserver aux archives"), "decline")],
    240,
  ),
  decision(
    "captain-chant",
    L("أغنية للقائد", "A chant for the captain", "Un chant pour le capitaine"),
    L("الكابو كتب هتافًا جديدًا لقائد الفريق، ويريد إطلاقه في التمرين المفتوح. يمكن دعم الحملة أو تركها مبادرة جماهيرية.", "The capo wrote a new chant for the captain and wants to launch it at an open training session. The club can promote it or let supporters lead.", "Le capo a écrit un nouveau chant pour le capitaine et veut le lancer lors d’un entraînement ouvert. Le club peut le relayer ou laisser les supporters mener l’initiative."),
    (s) => !!group(s) && !group(s).captainChantYear && (s.players || []).some((player) => player.clubId === s.clubId && player.status === "active" && player.role === "captain"),
    [choice("promote", L("نشر الهتاف رسميًا", "Share the chant officially", "Relayer le chant officiellement"), "captain-chant"), choice("organic", L("تركه للجماهير", "Let supporters lead", "Laisser les supporters mener"), "decline")],
    250,
  ),
  decision(
    "family-stand-request",
    L("طلب مساحة عائلية", "A request for a family section", "Demande d’un espace familial"),
    L("عائلات تطلب مساحة قريبة من الخدمات وبعيدة عن الألعاب النارية. تخصيصها يحسن تجربة الجمهور ويخفض السعة المتاحة قليلًا.", "Families request a section near amenities and away from pyrotechnics. Setting one aside improves the experience but slightly reduces saleable capacity.", "Des familles demandent une tribune proche des services et à l’écart des fumigènes. La réserver améliore l’accueil, mais réduit légèrement les places vendables."),
    (s) => !!group(s) && !group(s).familySection,
    [choice("create", L("إنشاء مساحة عائلية", "Create a family section", "Créer un espace familial"), "family-section"), choice("later", L("دراسة الطلب لاحقًا", "Review the request later", "Étudier la demande plus tard"), "decline")],
    220,
  ),
  decision(
    "supporter-mural",
    L("جدارية على سور الملعب", "A mural on the stadium wall", "Fresque sur le mur du stade"),
    L("فنان محلي يعرض رسم جدارية بموافقة الحي والملعب. العمل يبرز تاريخ النادي ويحتاج تنسيقًا وتمويلًا بسيطًا.", "A local artist offers a mural, subject to stadium and neighborhood approval. It can celebrate the club’s history with a modest contribution.", "Un artiste local propose une fresque, sous réserve de l’accord du stade et du quartier. Elle célébrerait l’histoire du club avec une contribution modeste."),
    (s) => !!group(s) && !group(s).muralYear,
    [choice("approve", L("تمويل الجدارية", "Fund the mural", "Financer la fresque"), "supporter-mural"), choice("decline", L("الاعتذار للفنان", "Decline the proposal", "Décliner la proposition"), "decline")],
    260,
  ),
  decision(
    "rival-sticker-exchange",
    L("مبادرة ملصقات بين الغريمين", "A sticker exchange between rivals", "Échange de stickers entre rivaux"),
    L("مجموعة من المشجعين تعرض تبادل ملصقات فنيًا مع جماهير الغريم قبل المباراة. لقاء منظم أفضل من ترك الأمر للشائعات.", "Supporters propose an art-sticker exchange with the rival crowd before the match. A supervised meet-up is safer than leaving it to rumor.", "Des supporters proposent un échange artistique d’autocollants avec le camp adverse avant le match. Une rencontre encadrée vaut mieux que les rumeurs."),
    (s) => !!group(s) && !!derbySoon(s, 21) && group(s).lastRivalExchangeYear !== currentYear(s),
    [choice("safe", L("تنظيم تبادل آمن", "Arrange a safe exchange", "Organiser un échange sécurisé"), "safe-rivalry-exchange"), choice("skip", L("عدم تنظيم اللقاء", "Do not arrange it", "Ne pas organiser la rencontre"), "decline")],
    300,
  ),
  decision(
    "capo-anniversary",
    L("ذكرى للكابو", "A capo’s anniversary", "Un anniversaire du capo"),
    L("تقترب ذكرى انضمام الكابو إلى المدرج. لافتة تكريم صغيرة توحد المجموعة، أو يمكن ترك المشجعين يحتفلون بطريقتهم.", "The capo’s anniversary with the stand is approaching. A small tribute can unite the group, or supporters can celebrate on their own.", "L’anniversaire de l’arrivée du capo dans le virage approche. Un petit hommage peut rassembler le groupe, ou les supporters peuvent célébrer librement."),
    (s) => {
      const current = group(s);
      if (!current || current.capoAnniversaryYear) return false;
      const target = `${String(current.capoAnniversaryMonth).padStart(2, "0")}-${String(current.capoAnniversaryDay).padStart(2, "0")}`;
      const end = addDays(s.date, 10).slice(5);
      return s.date.slice(5) <= target && target <= end;
    },
    [choice("honor", L("تنظيم تكريم متواضع", "Arrange a modest tribute", "Organiser un hommage modeste"), "honor-capo"), choice("organic", L("ترك الاحتفال للمجموعة", "Let the group celebrate", "Laisser le groupe célébrer"), "decline")],
    320,
  ),
  decision(
    "capo-confidence-vote",
    L("الكابو يطلب تجديد الثقة", "The capo asks for a confidence vote", "Le capo demande un vote de confiance"),
    L("بعد تراجع النتائج، ظهرت دعوة لتصويت داخلي على قيادة المجموعة. فتح تصويت سلمي قد يجدد الثقة؛ رفضه قد يزيد التوتر.", "After a run of poor results, supporters call for an internal vote on the group’s leadership. A peaceful vote may renew trust; refusing it could raise tensions.", "Après une série de mauvais résultats, des supporters demandent un vote interne sur le leadership du groupe. Un scrutin apaisé peut rétablir la confiance ; le refuser risque d’aggraver les tensions."),
    (s) => !!group(s) && group(s).mood <= 58 && group(s).capoConfidence < 50 && !group(s).capoVoteYear,
    [choice("vote", L("فتح تصويت داخلي", "Open an internal vote", "Ouvrir un vote interne"), "open-capo-vote"), choice("reaffirm", L("تأكيد دعم الكابو", "Reaffirm the capo", "Renouveler la confiance au capo"), "reaffirm-capo")],
    280,
  ),
  decision(
    "city-celebration-march",
    L("مسيرة احتفال في المدينة", "A celebration march through town", "Défilé de célébration en ville"),
    L("بعد نتيجة كبيرة، يريد المشجعون مسيرة سلمية بتنسيق مع المدينة. الموافقة المنظمة ترفع الروح؛ إلغاءها يقلل مخاطر الازدحام.", "After a major result, supporters want a peaceful march coordinated with the city. Approval lifts morale; cancelling it avoids crowding risks.", "Après un grand résultat, les supporters souhaitent un défilé pacifique coordonné avec la ville. L’autoriser renforce le moral ; l’annuler limite les risques de foule."),
    (s) => !!group(s) && group(s).lastBigWinDate && group(s).lastBigWinDate >= addDays(s.date, -10) && !group(s).lastMarchDate,
    [choice("permit", L("السماح بمسيرة منظمة", "Permit an organized march", "Autoriser un défilé organisé"), "city-march"), choice("cancel", L("إقامة احتفال داخل الملعب", "Celebrate inside the stadium", "Célébrer dans le stade"), "cancel-march")],
    200,
  ),
  decision(
    "fixture-change-protest",
    L("اعتراض على موعد المباراة", "A protest over the fixture time", "Contestation de l’horaire du match"),
    L("تغيير موعد المباراة يربك سفر الجماهير. بإمكان النادي رفع اعتراض رسمي أو نشر خطة نقل بديلة.", "A fixture-time change disrupts supporter travel. The club can file a formal objection or publish an alternative transport plan.", "Le changement d’horaire perturbe les déplacements. Le club peut déposer une objection officielle ou proposer un plan de transport alternatif."),
    (s) => !!group(s) && !!upcoming(s, 14, (fixture) => fixture.away === s.clubId && fixture.date.slice(5) < "06-01"),
    [choice("protest", L("رفع اعتراض للمنظمين", "Object to the organizers", "Contester auprès des organisateurs"), "schedule-protest"), choice("transport", L("تنسيق نقل بديل", "Arrange alternative travel", "Organiser un transport alternatif"), "organize-away")],
    170,
  ),
  decision(
    "badge-redesign-poll",
    L("اقتراح تحديث الشعار", "A proposal to refresh the badge", "Projet de modernisation de l’écusson"),
    L("فريق الهوية يقترح تحديث الشعار مع الحفاظ على الألوان الأساسية. المشجعون يريدون استشارتهم قبل أي تغيير يمس تاريخ النادي.", "The design team proposes a badge refresh that keeps the club’s core colours. Supporters ask to be consulted before changing a piece of club history.", "L’équipe graphique propose de moderniser l’écusson en gardant les couleurs du club. Les supporters demandent à être consultés avant toute modification de leur histoire."),
    (s) => !!group(s) && !group(s).badgePollYear,
    [choice("consult", L("عرض التصميم على المشجعين", "Put the design to supporters", "Soumettre le projet aux supporters"), "consult-badge"), choice("redesign", L("اعتماد التحديث مع الحفاظ على الألوان", "Approve the refresh while preserving the colours", "Approuver la modernisation en gardant les couleurs"), "redesign-badge"), choice("keep", L("الإبقاء على الشعار الحالي", "Keep the current badge", "Garder l’écusson actuel"), "keep-badge")],
    350,
  ),
  decision(
    "star-sale-response",
    L("الجمهور يسأل عن بيع النجم", "Supporters ask why the star was sold", "Les supporters questionnent la vente de la star"),
    L("بعد رحيل لاعب محبوب، يطالب المشجعون بخطة واضحة لإعادة الاستثمار. الشفافية قد تهدئ الغضب، والاحتفاظ بالمبلغ يترك الأسئلة مفتوحة.", "After a popular player leaves, supporters ask how the fee will be reinvested. A clear plan may calm the stand; keeping quiet leaves questions open.", "Après le départ d’un joueur apprécié, les supporters demandent comment réinvestir le montant. Un plan clair peut calmer le virage ; le silence laisse les questions ouvertes."),
    (s) => !!group(s) && group(s).lastStarSaleDate && group(s).lastStarSaleDate >= addDays(s.date, -14) && !group(s).lastSaleResponseDate,
    [choice("plan", L("نشر خطة لإعادة الاستثمار", "Publish a reinvestment plan", "Publier un plan de réinvestissement"), "reinvest-sale"), choice("hold", L("تأجيل الإعلان", "Delay the announcement", "Reporter l’annonce"), "save-sale-cash")],
    170,
  ),
  decision(
    "community-tifo-drive",
    L("تيفو لدعم الحي", "A tifo for the neighborhood", "Un tifo solidaire pour le quartier"),
    L("الجماعة تعرض تيفو يسلط الضوء على مشروع شبابي محلي بدل رسائل العداء. تمويله يضيف أثرًا اجتماعيًا للنادي.", "The group proposes a tifo spotlighting a local youth project instead of hostile messages. Funding it gives the club a positive community story.", "Le groupe propose un tifo consacré à un projet jeunesse local plutôt qu’à des messages hostiles. Le financer crée une action positive pour le quartier."),
    (s) => !!group(s) && !!homeMatchSoon(s, 21) && !group(s).communityTifoYear,
    [choice("fund", L("تمويل تيفو مجتمعي", "Fund the community tifo", "Financer le tifo solidaire"), "community-tifo"), choice("decline", L("ترك التمويل للمشجعين", "Let supporters fund it", "Laisser les supporters le financer"), "decline")],
    260,
  ),
  flavor(
    "away-coach-arrival",
    L("حافلة الغريم وصلت مبكرًا", "The rivals’ coach arrived early", "Le car adverse est arrivé en avance"),
    L("المنظمون يستقبلون الجماهير الزائرة ويوجهونها إلى البوابة المخصصة. الأعلام متبادلة، والمدينة تستعد للمباراة.", "Stewards welcome the visiting supporters and guide them to their entrance. Flags are flying as the city prepares for kick-off.", "Les stadiers accueillent les supporters visiteurs et les orientent vers leur entrée. Les drapeaux flottent tandis que la ville se prépare au coup d’envoi."),
    (s) => !!group(s) && !!derbySoon(s, 3),
  ),
  flavor(
    "club-song-leak",
    L("أغنية النادي تملأ الشوارع", "The club song fills the streets", "Le chant du club résonne en ville"),
    L("مقطع من أغنية الجماهير انتشر بين المشجعين قبل المباراة. الكابو يضحك ويقول إن النسخة الحية أفضل دائمًا.", "A clip of the supporters’ song is spreading before the match. The capo says the live version is always better.", "Un extrait du chant des supporters circule avant le match. Le capo rappelle que la version chantée en tribune reste la meilleure."),
    (s) => !!group(s) && !!homeMatchSoon(s, 7),
  ),
  flavor(
    "old-stand-photograph",
    L("صورة قديمة من المدرج", "A photograph from the old stand", "Une photo de l’ancienne tribune"),
    L("وجد المشجعون صورة بالأبيض والأسود لراية قديمة. أُرسلت إلى الأرشيف، وبدأت حكايات الأجيال تدور من جديد.", "Supporters found a black-and-white photograph of an old banner. It is going into the archive, and stories from earlier generations are being shared again.", "Les supporters ont retrouvé une photo en noir et blanc d’une ancienne bannière. Elle rejoint les archives et les souvenirs des générations précédentes circulent à nouveau."),
    (s) => !!group(s) && !group(s).archivePhotoYear,
    320,
  ),
  flavor(
    "capo-radio-chant",
    L("هتاف ارتجالي على الراديو", "An improvised chant on the radio", "Un chant improvisé à la radio"),
    L("الكابو أنهى مقابلة قصيرة بهتاف لطيف، فانتشر التسجيل بين جماهير النادي من دون أن يسيء إلى أحد.", "The capo ended a short interview with a playful chant. The clip spread among supporters without targeting anyone.", "Le capo a terminé une courte interview par un chant bon enfant. L’extrait circule parmi les supporters sans viser personne."),
    (s) => !!group(s) && !group(s).radioChantYear,
    250,
  ),
  flavor(
    "rainy-flag-repair",
    L("المطر اختبر الرايات", "Rain put the flags to the test", "La pluie a mis les drapeaux à l’épreuve"),
    L("بعد عاصفة قصيرة، تطوع المشجعون لتجفيف الرايات وإصلاح الخيوط قبل المباراة المقبلة. المجموعة أنهت العمل معًا.", "After a brief storm, supporters volunteered to dry the flags and repair their ropes before the next match. The group finished the work together.", "Après une brève averse, les supporters ont séché les drapeaux et réparé leurs cordages avant le prochain match. Le groupe a terminé le travail ensemble."),
    (s) => !!group(s) && !!homeMatchSoon(s, 30) && !group(s).rainRepairYear,
    300,
  ),
  flavor(
    "fan-mosaic",
    L("فسيفساء بشرية في المدرج", "A human mosaic in the stand", "Une mosaïque humaine dans les tribunes"),
    L("رفع المشجعون بطاقات ملونة بتنسيق تلقائي، وصنعوا لوحة جميلة قبل الإحماء. لا ألعاب نارية ولا رسائل مسيئة، فقط ألوان النادي.", "Supporters raised colored cards in an impromptu mosaic before warm-ups. No pyrotechnics or hostile messages—just the club colours.", "Les supporters ont levé des cartons colorés pour créer une mosaïque avant l’échauffement. Pas de fumigènes ni de messages hostiles, seulement les couleurs du club."),
    (s) => !!group(s) && !!bigMatchSoon(s, 5),
    270,
  ),
  flavor(
    "marriage-kiss-cam",
    L("تصفيق لعروسين في المدرجات", "Applause for a couple in the stands", "Les tribunes applaudissent un couple"),
    L("التقطت الكاميرا العروسين بعد موافقتهما، فصفق الجمهور وعاد التركيز إلى المباراة. ذكرى جميلة بلا إحراج لأحد.", "With their consent, the camera found a newly married couple. The crowd applauded, then turned its attention back to the match.", "Avec leur accord, la caméra a montré un couple de jeunes mariés. Le public a applaudi puis s’est reconcentré sur le match."),
    (s) => !!group(s) && !!homeMatchSoon(s, 10) && !group(s).weddingWaveYear,
    360,
  ),
  flavor(
    "dog-rescue-thanks",
    L("شكر لفريق إنقاذ الكلب", "Thanks to the dog-rescue team", "Merci à l’équipe de secours animalier"),
    L("بعد مغادرة الضيف الصغير بأمان، أرسل النادي شكرًا للمتطوعين. المشجعون يطالبون بصورة تذكارية له قرب البوابة.", "After the small guest was safely escorted out, the club thanked the volunteers. Supporters are asking for a commemorative photo near the gate.", "Après avoir raccompagné le petit invité en sécurité, le club a remercié les bénévoles. Les supporters demandent une photo souvenir près de la porte."),
    (s) => !!group(s) && group(s).dogRescueDate && group(s).dogRescueDate >= addDays(s.date, -30) && !group(s).dogThanksYear,
    300,
  ),
  flavor(
    "tifo-recycling",
    L("المدرج يعيد استخدام التيفو", "The stand reuses its tifo", "Le virage réutilise son tifo"),
    L("المجموعة أعادت تدوير الأقمشة من عرض سابق وصنعت رايات أصغر. مبادرة بسيطة خفضت التكلفة والنفايات.", "The group repurposed fabric from an earlier display into smaller flags. A simple idea lowered both costs and waste.", "Le groupe a réutilisé les tissus d’un ancien tifo pour fabriquer de petits drapeaux. Une idée simple qui réduit les coûts et les déchets."),
    (s) => !!group(s) && group(s).tifoCount > 0 && !group(s).recycleYear,
    300,
  ),
];

export const ULTRAS_DEMANDS = {
  ticket: {
    name: L("خفض أسعار التذاكر", "Reduce ticket prices", "Baisser le prix des billets"),
    detail: L("خفض السعر الأساسي ١٥٪ على الأقل للمباريات القادمة.", "Reduce the base ticket price by at least 15% for upcoming matches.", "Baisser le prix de base d’au moins 15 % pour les prochains matchs."),
  },
  star: {
    name: L("التعاقد مع نجم", "Sign a star player", "Recruter une star"),
    detail: L("ضم لاعب بتقييم ٧٢ أو أعلى خلال المهلة.", "Sign a player rated 72 or higher before the deadline.", "Recruter avant l’échéance un joueur noté au moins 72."),
  },
  coach: {
    name: L("إقالة المدرب", "Dismiss the coach", "Remplacer l’entraîneur"),
    detail: L("إنهاء عقد المدرب الحالي وفق تعويضه المستحق.", "End the current coach’s contract and pay the required compensation.", "Mettre fin au contrat actuel en versant l’indemnité prévue."),
  },
  youth: {
    name: L("تطوير قطاع الناشئين", "Develop youth facilities", "Développer la formation des jeunes"),
    detail: L("بدء مشروع تطوير أكاديمية النادي خلال المهلة.", "Start a project to improve the club academy before the deadline.", "Lancer un projet de développement de l’académie avant l’échéance."),
  },
};

export function eventFixture(s, eventId) {
  if (eventId === "derby-tifo-plan" || eventId === "derby-banner-theft" || eventId === "rival-sticker-exchange") return derbySoon(s, 30);
  if (["dog-on-pitch", "stand-proposal", "family-stand-request", "community-tifo-drive"].includes(eventId)) return homeMatchSoon(s, 21);
  if (["away-support-trip", "fixture-change-protest"].includes(eventId)) return upcoming(s, 21, (fixture) => fixture.away === s.clubId);
  return bigMatchSoon(s, 21);
}

export function availableUltrasEvents(s) {
  return ULTRAS_EVENT_CATALOG.filter((event) => event.condition(s));
}

export function upcomingUltrasFixtures(s, days = 30) {
  const through = addDays(s.date, days);
  return ownFixtures(s)
    .filter((fixture) => !fixture.played && fixture.date >= s.date && fixture.date <= through)
    .sort((a, b) => a.date.localeCompare(b.date));
}
