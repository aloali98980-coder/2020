// قاموس المراهنات 0.36 — مشتق من bettingTexts + كتالوج + قرارات 30 + واجهة.
import { BETTING_TEXTS } from "../data/bettingTexts.js";
import { BETTING_COMPANIES, LICENSE_TIERS, BRANCH_LEVELS, ONLINE_LEVELS, COMPETITOR_TEMPLATES } from "../data/bettingCatalog.js";
import { BETTING_DECISION_PHRASES } from "../data/events/decisions-betting.js";

const fromTexts = (() => {
  const out = {};
  for (const v of Object.values(BETTING_TEXTS)) {
    out[v.ar] = [v.en, v.fr];
    const bare = v.ar.replace(/[.؛:!؟…،,»«()]+$/, "");
    if (bare && !out[bare]) out[bare] = [v.en, v.fr];
  }
  return out;
})();

const EXTRA = {};
for (const c of BETTING_COMPANIES) {
  EXTRA[c.name.ar] = [c.name.en, c.name.fr];
  EXTRA[c.desc.ar] = [c.desc.en, c.desc.fr];
  for (const v of [c.name, c.desc]) {
    const bare = v.ar.replace(/[.؛:!؟…،,»«()]+$/, "");
    if (bare && !EXTRA[bare]) EXTRA[bare] = [v.en, v.fr];
  }
}
for (const t of Object.values(LICENSE_TIERS)) {
  EXTRA[t.name.ar] = [t.name.en, t.name.fr];
  EXTRA[t.desc.ar] = [t.desc.en, t.desc.fr];
  for (const v of [t.name, t.desc]) {
    const bare = v.ar.replace(/[.؛:!؟…،,»«()]+$/, "");
    if (bare && !EXTRA[bare]) EXTRA[bare] = [v.en, v.fr];
  }
}
for (const b of BRANCH_LEVELS) {
  EXTRA[b.name.ar] = [b.name.en, b.name.fr];
  const bare = b.name.ar.replace(/[.؛:!؟…،,]+$/, "");
  if (bare && !EXTRA[bare]) EXTRA[bare] = [b.name.en, b.name.fr];
}
for (const o of ONLINE_LEVELS) {
  EXTRA[o.name.ar] = [o.name.en, o.name.fr];
  const bare = o.name.ar.replace(/[.؛:!؟…،,]+$/, "");
  if (bare && !EXTRA[bare]) EXTRA[bare] = [o.name.en, o.name.fr];
}
for (const c of COMPETITOR_TEMPLATES) {
  EXTRA[c.name.ar] = [c.name.en, c.name.fr];
  const bare = c.name.ar.replace(/[.؛:!؟…،,]+$/, "");
  if (bare && !EXTRA[bare]) EXTRA[bare] = [c.name.en, c.name.fr];
}
// ملاحظة الترحيل — نص عربي ثابت في src/core/migrations.js
EXTRA["إمبراطورية المراهنات 0.36: أُضيفت شركات مراهنات قابلة للشراء أو التأسيس بدرجات ترخيص وسمعة وامتثال، وسوق مراهنات عام يعمل دون الحاجة لشركة؛ الحفظة القديمة بلا شركة"] = [
  "Betting Empire 0.36: purchasable/foundable betting companies with licences, reputation & compliance, plus a general betting market that works without a company; old saves have no company",
  "Empire des paris 0.36 : sociétés de paris achetables/fondables avec licences, réputation et conformité, plus un marché général qui fonctionne sans société ; anciennes sauvegardes sans société",
];
EXTRA["إمبراطورية المراهنات 0.36: أُضيفت شركات مراهنات قابلة للشراء أو التأسيس بدرجات ترخيص وسمعة وامتثال، وسوق مراهنات عام يعمل دون الحاجة لشركة؛ الحفظة القديمة بلا شركة."] = [
  "Betting Empire 0.36: purchasable/foundable betting companies with licences, reputation & compliance, plus a general betting market that works without a company; old saves have no company",
  "Empire des paris 0.36 : sociétés de paris achetables/fondables avec licences, réputation et conformité, plus un marché général qui fonctionne sans société ; anciennes sauvegardes sans société",
];

// واجهة المراهنات — كل عبارة عربية ثابتة في features/betting.js و services/betting/*
// تُترجم هنا حتى لا يبقى حرف عربي في وضع EN/FR (يختبره i18n.test.js).
const UI = {
  "درجات الترخيص": ["Licence tiers", "Niveaux de licence"],
  "شبهات أقل من": ["Suspicion below", "Soupçons inférieurs à"],
  "% · صيانة": ["% · upkeep", "% · entretien"],
  "رسوم ترخيص": ["Licence fee", "Frais de licence"],
  "إطلاق": ["Launch", "Lancement"],
  "شركات قائمة للبيع": ["Established companies for sale", "Sociétés établies à vendre"],
  "عميل · سمعة": ["customers · reputation", "clients · réputation"],
  "فروع": ["Branches", "Agences"],
  "تطبيق": ["App", "Appli"],
  "منافسون في السوق": ["Market competitors", "Concurrents sur le marché"],
  "عميل": ["customer", "client"],
  "حالي": ["Current", "Actuel"],
  "الأقصى": ["Maximum", "Maximum"],
  "ترقية المنصة": ["Upgrade platform", "Améliorer la plateforme"],
  "/شهر — حد أقصى": ["/month — max", "/mois — max"],
  "📈 الربحية (آخر 6 أشهر": ["📈 Profitability (last 6 months)", "📈 Rentabilité (6 derniers mois)"],
  "لا أرباح بعد": ["No profits yet", "Pas encore de profits"],
  "🏷️ منافسون": ["🏷️ Competitors", "🏷️ Concurrents"],
  "المنظم والامتثال": ["Regulator & compliance", "Régulateur et conformité"],
  "مخاطر": ["Risk", "Risque"],
  "تدقيق كل ~90 يوم · غرامات تراكمية": ["Audit every ~90 days · cumulative fines", "Audit tous les ~90 jours · amendes cumulées"],
  "إيقافات": ["Suspensions", "Suspensions"],
  "القادم": ["Next", "Prochain"],
  "بلا": ["None", "Aucun"],
  "بلا حماية": ["No protection", "Sans protection"],
  "حماية أساسية": ["Basic protection", "Protection de base"],
  "تحمي الترخيص": ["Protects licence", "Protège la licence"],
  "احترافي — أقل مخاطر": ["Professional — lowest risk", "Professionnel — risque minimal"],
  "⚖️ تضارب المصالح": ["⚖️ Conflict of interest", "⚖️ Conflit d'intérêts"],
  "تضارب": ["Conflict", "Conflit"],
  "أنت رئيس الاتحاد وتنظم صناعة شركتك! جماهير متدينة تحتج 🌙 واللائحة تحمل بندًا أخلاقيًا": ["You preside the federation and regulate your own industry! Religious fans protest 🌙 and the mandate carries an ethics clause", "Vous présidez la fédération et régulez votre propre industrie ! Des supporters pieux protestent 🌙 et le mandat porte une clause éthique"],
  "رعاية الدوري": ["League sponsorship", "Parrainage du championnat"],
  "لا رعاية حاليًا": ["No sponsorship currently", "Pas de parrainage actuellement"],
  "إلغاء الرعاية": ["Cancel sponsorship", "Annuler le parrainage"],
  "رعاية الدوري (4.2M": ["Sponsor league (4.2M", "Parrainer le championnat (4,2M"],
  "التشريع — ربط مع 13": ["Legislation — linked to 13", "Législation — liée à 13"],
  "تشدد على المنافسين؟ تخفف على نفسك؟": ["Tighten on rivals? Ease for yourself?", "Durcir pour les rivaux ? Assouplir pour vous ?"],
  ">تشديد على المنافسين": [">Tighten on rivals", ">Durcir pour les rivaux"],
  ">تخفيف على نفسك": [">Ease for yourself", ">Assouplir pour vous"],
  "تحتاج رئاسة الاتحاد": ["Requires federation presidency", "Nécessite la présidence de la fédération"],
  "😈 الشغل الشيطاني — رهان داخلي بمعلومة مسربة": ["😈 Devil's work — insider bet with leaked info", "😈 sale boulot — pari d'initié avec fuite"],
  "رهان معلق": ["Bet pending", "Pari en attente"],
  "معلق": ["Pending", "En attente"],
  "مخاطرة": ["Risk", "Risque"],
  "% · كشف": ["% · exposure", "% · exposition"],
  "تعرف التشكيل والإصابات! انتظر نتيجة المباراة": ["You know the lineup & injuries! Await the result", "Vous connaissez compo & blessures ! Attendez le résultat"],
  "سلايدر مخاطرة/ربح: رهانات صغيرة آمنة نسبيًا ← all-in بأرباح خيالية. الانكشاف = سحب الترخيص + فضيحة شبهات كبرى + عزل من الرئاسة + دمار المسيرة! كومبو رشوة لاعبين (ملفات سوداء) + رهانات شركتك = ملايين… أو حريق شامل": ["Risk/reward slider: small bets relatively safe ← all-in with fantasy returns. Exposure = licence revoked + major scandal + ousting + career ruin! Bribe combo = millions… or inferno", "Curseur risque/gain : petits paris assez sûrs ← all-in aux gains fous. Exposition = licence révoquée + scandale + éviction + ruine ! Combo corruption = millions… ou brasier"],
  "المبلغ (من الثروة الشخصية) — تملك": ["Amount (from personal wealth) — you own", "Montant (fortune perso) — vous possédez"],
  "مخاطرة/ربح": ["Risk/reward", "Risque/gain"],
  "مضاعف": ["Multiplier", "Multiplicateur"],
  "كشف": ["Exposure", "Exposition"],
  "يسار آمن، يمين خيالي لكن مدمر إن انكشف": ["Left safe, right fantasy but devastating if exposed", "Gauche sûr, droite folle mais dévastatrice si exposé"],
  ">😈 راهن على مباراة فريقك": [">😈 Bet on your team's match", ">😈 Pariez sur votre équipe"],
  "⚠️ لديك رشوة نشطة": ["⚠️ Active bribe", "⚠️ Corruption active"],
  "الكومبو يضاعف الربح والكشف!": ["Combo doubles profit & exposure!", "Le combo double gain & exposition !"],
  "⛔ انكشف": ["⛔ Exposed", "⛔ Exposé"],
  "✅ ربح": ["✅ Win", "✅ Gain"],
  "كومبو": ["Combo", "Combo"],
  "لا شركة": ["No company", "Pas de société"],
  "متقدم": ["Advanced", "Avancé"],
  "احترافي": ["Professional", "Professionnel"],
  "مستوى لعب مسؤول غير صالح": ["Invalid responsible gaming level", "Niveau de jeu responsable invalide"],
  "تكلفة شهرية": ["Monthly cost", "Coût mensuel"],
  "بدون إجراءات لعب مسؤول — المخاطر أعلى": ["No responsible gaming — higher risk", "Sans jeu responsable — risque supérieur"],
  "إعادة تفعيل الترخيص": ["Re-activate licence", "Réactiver la licence"],
  "انتهت مدة الإيقاف وعاد ترخيصك نشطًا": ["Suspension ended, licence re-activated", "Suspension levée, licence réactivée"],
  "تدقيق رقابي ناجح ✅": ["Regulatory audit passed ✅", "Audit réglementaire réussi ✅"],
  "اجتزت التدقيق الدوري. سمعة الشركة ارتفعت قليلًا": ["Passed the periodic audit. Company reputation rose slightly", "Audit périodique réussi. Réputation en légère hausse"],
  "لا تملك شركة": ["You own no company", "Vous ne possédez pas de société"],
  "عقد رعاية بقيمة 4.2M سنويًا للدوري — المعارضة والصحافة تراقب التضارب": ["4.2M annual league sponsorship — opposition & press watch the conflict", "Parrainage de 4,2M par an pour la ligue — opposition & presse surveillent le conflit"],
  "إلغاء رعاية الدوري": ["Cancel league sponsorship", "Annuler le parrainage de la ligue"],
  "ألغيت رعاية شركتك للدوري لتخفيف تضارب المصالح": ["Cancelled your company's league sponsorship to reduce conflict", "Parrainage annulé pour réduire le conflit"],
  "لست رئيس الاتحاد لتنظيم السوق": ["Not federation president to regulate the market", "Pas président pour réguler le marché"],
  "شدّدت القوانين على المنافسين!": ["Tightened laws on competitors!", "Lois durcies sur les concurrents !"],
  "ضرائب وقيود جديدة على منافسي المراهنات — مكاسبك ارتفعت، لكن المعارضة تلمح لمحاباة": ["New taxes/restrictions on betting rivals — your gains rose, but opposition hints at favouritism", "Nouvelles taxes/contraintes sur les rivaux — gains en hausse, opposition crie au favoritisme"],
  "خفّفت القوانين على شركتك": ["Eased laws for your company", "Lois assouplies pour votre société"],
  "أعفاءات امتثال لشركتك — وفرت المال لكن الشارع لاحظ": ["Compliance exemptions for your company — saved money but the street noticed", "Exemptions de conformité — économies mais rue a remarqué"],
  "وضع تنظيم غير معروف": ["Unknown regulatory mode", "Mode réglementaire inconnu"],
  "جمعيات جماهيرية ترفع لافتات «كرة بلا قمار» أمام الملعب. بعض العائلات تقاطع المتجر": ["Fan groups hold “football without gambling” banners outside the stadium. Some families boycott the shop", "Groupes de supporters brandissent « foot sans paris » devant le stade. Des familles boycottent la boutique"],
  "الترخيص غير نشط للمراهنة": ["Licence inactive for betting", "Licence inactive pour parier"],
  "لديك رهان داخلي معلق بالفعل": ["You already have a pending insider bet", "Vous avez déjà un pari d'initié en attente"],
  "مبلغ رهان غير صالح": ["Invalid bet amount", "Montant de pari invalide"],
  "مخاطرة غير صالحة": ["Invalid risk", "Risque invalide"],
  "المبلغ أكبر من ثروتك الشخصية": ["Amount exceeds personal wealth", "Montant supérieur à votre fortune perso"],
  "خسرت": ["You lost", "Vous avez perdu"],
  "لكنك لم تُكشف": ["but were not exposed", "mais non exposé"],
  "عزل من رئاسة الاتحاد ⛔": ["Ousted from federation presidency ⛔", "Éviction de la présidence ⛔"],
  "قضية الرهان الداخلي أسقطت رئاستك للاتحاد. لجنة النزاهة فتحت تحقيقًا فوريًا": ["Insider betting case toppled your presidency. Integrity committee opened immediate investigation", "L'affaire de pari d'initié a fait chuter votre présidence. Commission d'intégrité a ouvert enquête"],
  "عرض شراء لشركتك من": ["Purchase offer for your company from", "Offre d'achat pour votre société de"],
  "يعرض": ["offers", "propose"],
  "لشراء شركتك": ["to buy your company", "pour acheter votre société"],
  "عميل). المنافس أقوى منك حاليًا": ["customers). Rival currently stronger", "clients). Rival plus fort actuellement"],
  "فرصة استحواذ": ["Acquisition opportunity", "Opportunité d'acquisition"],
  "للبيع": ["For sale", "À vendre"],
  "متاح للاستحواذ مقابل": ["Available for acquisition for", "Disponible à l'acquisition pour"],
  "منافس غير موجود": ["Competitor not found", "Concurrent introuvable"],
  "استحواذ على منافس": ["Acquire competitor", "Racheter un concurrent"],
  "استحوذت على": ["Acquired", "Acquis"],
  "وأضفت": ["and added", "et ajouté"],
  "مشترٍ غير موجود": ["Buyer not found", "Acheteur introuvable"],
  "بعت شركة المراهنات": ["Sold betting company", "Société de paris vendue"],
  "بعت شركتك إلى": ["Sold your company to", "Vendu votre société à"],
  "خرجت من السوق": ["Exited the market", "Sorti du marché"],
  "شركة الأحلام": ["Dream company", "Société de rêve"],
  "الترقية يجب أن تكون لمستوى أعلى": ["Upgrade must be to a higher level", "La mise à niveau doit être supérieure"],
  "مستوى الفروع يجب أن يكون أعلى": ["Branch level must be higher", "Le niveau d'agences doit être supérieur"],
  "مستوى غير معروف": ["Unknown level", "Niveau inconnu"],
  "الفروع الآن مستوى": ["Branches now level", "Agences désormais niveau"],
  "مستوى التطبيق يجب أن يكون أعلى": ["App level must be higher", "Le niveau d'appli doit être supérieur"],
  "المنصة الآن مستوى": ["Platform now level", "Plateforme désormais niveau"],
  "إنفاق تسويقي غير صالح": ["Invalid marketing spend", "Dépenses marketing invalides"],
  "حصلت شركتك على ترخيص {tier}": ["Your company obtained a {tier} licence", "Votre société a obtenu une licence {tier}"],
  "استحوذت على «{name}» مقابل {money}": ["Acquired “{name}” for {money}", "Vous avez acquis « {name} » pour {money}"],
  "أسست شركة جديدة بترخيص {tier}. تبدأ العمل بعد {days} يومًا": ["Founded a new company with a {tier} licence. Launches in {days} days", "Nouvelle société fondée avec une licence {tier}. Lancement dans {days} jours"],
  "فرضت هيئة الرقابة غرامة {money} بسبب مخالفة امتثال": ["The regulator fined you {money} for a compliance breach", "Le régulateur vous a infligé {money} d'amende pour non-conformité"],
  "ترخيصك موقوف حتى {date} بعد تدقيق فاشل": ["Your licence is suspended until {date} after a failed audit", "Votre licence est suspendue jusqu'au {date} après un audit raté"],
  "سُحب ترخيص شركتك نهائيًا بسبب مراهنات داخلية مكشوفة": ["Your company's licence was revoked after exposed insider betting", "La licence a été révoquée après des paris d'initiés exposés"],
  "راهنت {money} على مباراة فريقك بمخاطرة {risk}%": ["You bet {money} on your team's match at {risk}% risk", "Vous avez parié {money} sur le match de votre équipe à {risk}% de risque"],
  "ربحت {money} من رهانك الداخلي": ["You won {money} from your insider bet", "Vous avez gagné {money} avec votre pari d'initié"],
  "انكشف رهانك الداخلي — سُحب الترخيص، شبهات كبرى، وعزلك من رئاسة الاتحاد": ["Your insider bet was exposed — licence revoked, major suspicion, removed from presidency", "Votre pari d'initié a été exposé — licence révoquée, gros soupçons, éviction de la présidence"],
  "رشوت لاعبًا وربطتها برهان شركتك — أرباح طائلة أو حريق شامل": ["You bribed a player and tied it to your company's bet — huge profit or total inferno", "Vous avez corrompu un joueur et lié cela à votre pari — énorme profit ou enfer total"],
  "شركتك ترعى الدوري الذي تحكمه — المعارضة والجماهير تراقب": ["Your company sponsors the league you govern — opposition and fans watch", "Votre société sponsorise la ligue que vous présidez — opposition et supporters observent"],
  "جماهير متدينة تحتج على نشاط المراهنات وتطالب بالمقاطعة": ["Religious fans protest your betting activity and call for a boycott", "Des supporters pieux protestent contre vos paris et appellent au boycott"],
  "القيمة السوقية = (أرباح × سمعة × عملاء × ترخيص) — تُستخدم للاكتتاب لاحقًا": ["Market value = (profits × reputation × customers × licence) — for future IPO", "Valeur marchande = (profits × réputation × clients × licence) — pour future IPO"],
  "القيمة السوقية = (أرباح × سمعة × عملاء × ترخيص) — تُستخدم للاكتتاب لاحقًا.": ["Market value = (profits × reputation × customers × licence) — for future IPO", "Valeur marchande = (profits × réputation × clients × licence) — pour future IPO"],
  "بند أخلاقي: لا تضارب بين النادي وشركة المراهنات (التضارب أقل من 40)": ["Ethics clause: no conflict between club and betting company (conflict below 40)", "Clause éthique : pas de conflit entre le club et la société de paris (conflit inférieur à 40)"],
  "بند أخلاقي: لا تضارب بين النادي وشركة المراهنات (التضارب أقل من 40": ["Ethics clause: no conflict between club and betting company (conflict below 40", "Clause éthique : pas de conflit entre le club et la société de paris (conflit inférieur à 40"],
  "بند أخلاقي: لا تضارب بين النادي وشركة المراهنات (تضارب < 40": ["Ethics clause: no conflict (conflict below 40", "Clause éthique : pas de conflit (conflit inférieur à 40"],
  "بند أخلاقي: لا تضارب بين النادي وشركة المراهنات (تضارب < 40)": ["Ethics clause: no conflict between club and betting company (conflict below 40)", "Clause éthique : pas de conflit entre le club et la société de paris (conflit inférieur à 40)"],
  "شبهات <": ["Suspicion <", "Soupçons <"],
  "شبهات": ["Suspicion", "Soupçons"],
};

export const BETTING_PHRASES = { ...fromTexts, ...BETTING_DECISION_PHRASES, ...EXTRA, ...UI };
export default BETTING_PHRASES;
