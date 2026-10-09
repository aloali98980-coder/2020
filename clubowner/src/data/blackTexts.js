// نصوص نظام «الملفات السوداء» 0.28 — مصدر واحد بثلاث لغات.
// كل مفتاح هنا يصبح ترجمة تلقائية عبر القاموس المولد.
// المتغيرات {v}/{n}/{d}/{money} تُملأ عند العرض.
export const BLACK_TEXTS = {
  blackName: {
    ar: "الملفات السوداء",
    en: "The Black Files",
    fr: "Les dossiers noirs",
  },
  blackKicker: {
    ar: "الوسيط والشبهات",
    en: "Fixer & suspicion",
    fr: "Intermédiaire et soupçons",
  },
  blackTitle: {
    ar: "مكتب الوسيط",
    en: "The Fixer's Office",
    fr: "Le bureau de l'intermédiaire",
  },
  blackIntro: {
    ar: "اللعب غير النظيف كمحتوى عادي في اللعبة وبأسماء حقيقية — كل عملية لها تكلفة كبيرة واحتمال فشل وheat يتراكم. الشبهات 0-100% ولها مستويات عواقب معلنة.",
    en: "Dirty play as regular game content with real names — every operation has a big cost, a failure chance and accumulating heat. Suspicion 0-100% with declared consequence tiers.",
    fr: "Le jeu sale comme contenu régulier avec de vrais noms — chaque opération a un coût élevé, un risque d'échec et de la suspicion qui s'accumule. Suspicion 0-100% avec paliers annoncés.",
  },
  suspicionLabel: {
    ar: "مؤشر الشبهات",
    en: "Suspicion index",
    fr: "Indice de suspicion",
  },
  suspicionLevel0: {
    ar: "نظيف",
    en: "Clean",
    fr: "Propre",
  },
  suspicionLevel30: {
    ar: "همسات صحفية",
    en: "Press whispers",
    fr: "Rumeurs de presse",
  },
  suspicionLevel60: {
    ar: "تسريبات وتحقيق أولي",
    en: "Leaks & preliminary probe",
    fr: "Fuites et enquête préliminaire",
  },
  suspicionLevel85: {
    ar: "تحقيق رسمي وشيك",
    en: "Formal investigation imminent",
    fr: "Enquête officielle imminente",
  },
  suspicionLevel100: {
    ar: "الفضيحة الكبرى",
    en: "Major scandal",
    fr: "Scandale majeur",
  },
  opRefereeBias: {
    ar: "تحيز تحكيمي لمباراة واحدة",
    en: "Referee bias for one match",
    fr: "Arbitrage biaisé pour un match",
  },
  opRefereeBiasDesc: {
    ar: "ضربة جزاء مشكوك فيها / إلغاء هدف للخصم / تساهل في البطاقات — لمباراة واحدة فقط",
    en: "Dubious penalty / disallow opponent goal / lenient cards — for one match only",
    fr: "Penalty douteux / but adverse annulé / clémence sur les cartons — pour un match seulement",
  },
  opPoachPlayer: {
    ar: "خطف لاعب متعاقد بدون إذن",
    en: "Poach a contracted player",
    fr: "Détourner un joueur sous contrat",
  },
  opPoachPlayerDesc: {
    ar: "أرخص وأسرع من التفاوض العادي، ولو انكشف: غرامة + منع قيد",
    en: "Cheaper and faster than normal negotiation, if exposed: fine + transfer ban",
    fr: "Moins cher et plus rapide que la négociation normale, si découvert : amende + interdiction de recrutement",
  },
  opBribeOpponent: {
    ar: "رشوة لاعب خصم قبل المواجهة",
    en: "Bribe opponent player before clash",
    fr: "Corrompre un joueur adverse avant le match",
  },
  opBribeOpponentDesc: {
    ar: "الأغلى والأخطر — لاعب الخصم يتراجع في المباراة القادمة",
    en: "Most expensive & most dangerous — opponent player underperforms next match",
    fr: "Le plus cher et le plus risqué — le joueur adverse sous-performe au prochain match",
  },
  opMediaWar: {
    ar: "حرب إعلامية ملفقة ضد منافس",
    en: "Fabricated media war vs rival",
    fr: "Guerre médiatique fabriquée contre un rival",
  },
  opMediaWarDesc: {
    ar: "تشويه سمعة منافس مباشر — معنوياته تنخفض وجماهيرك ترتفع مؤقتًا",
    en: "Smear direct rival — his morale drops, your fans rise temporarily",
    fr: "Dénigrer un rival direct — son moral chute, vos supporters montent temporairement",
  },
  opAgentPayroll: {
    ar: "وكيل على المرتب",
    en: "Agent on payroll",
    fr: "Agent à la solde",
  },
  opAgentPayrollDesc: {
    ar: "عمولات أرخص (1% بدل 3%) مقابل heat مستمر صغير",
    en: "Cheaper commissions (1% vs 3%) for small continuous heat",
    fr: "Commissions moins chères (1% vs 3%) contre un peu de suspicion continue",
  },
  opCost: {
    ar: "التكلفة: {money}",
    en: "Cost: {money}",
    fr: "Coût : {money}",
  },
  opHeat: {
    ar: "الشبهات: +{n}%",
    en: "Heat: +{n}%",
    fr: "Suspicion : +{n}%",
  },
  opFailChance: {
    ar: "احتمال الفشل: {n}%",
    en: "Failure chance: {n}%",
    fr: "Risque d'échec : {n}%",
  },
  opCooldown: {
    ar: "فاصل أدنى: {n} يومًا",
    en: "Min interval: {n} days",
    fr: "Intervalle min : {n} jours",
  },
  opSuccess: {
    ar: "نجحت العملية",
    en: "Operation succeeded",
    fr: "Opération réussie",
  },
  opFailed: {
    ar: "فشلت العملية",
    en: "Operation failed",
    fr: "Opération échouée",
  },
  opFailedBody: {
    ar: "خسرت المال وارتفعت الشبهات بلا فائدة. الوسيط يطلب الصمت.",
    en: "You lost the money and heat rose with no benefit. The fixer asks for silence.",
    fr: "Vous avez perdu l'argent et la suspicion a monté sans bénéfice. L'intermédiaire demande le silence.",
  },
  opRefereeActive: {
    ar: "تحيز تحكيمي نشط حتى {d}",
    en: "Referee bias active until {d}",
    fr: "Arbitrage biaisé actif jusqu'au {d}",
  },
  opBribeActive: {
    ar: "رشوة لاعب خصم نشطة ضد {v} حتى {d}",
    en: "Opponent bribe active vs {v} until {d}",
    fr: "Corruption active contre {v} jusqu'au {d}",
  },
  opAgentActive: {
    ar: "وكيل على المرتب نشط — عمولات 1%",
    en: "Agent on payroll active — 1% commission",
    fr: "Agent à la solde actif — commission 1%",
  },
  opNotEnoughCash: {
    ar: "السيولة لا تكفي لهذه العملية",
    en: "Not enough cash for this operation",
    fr: "Trésorerie insuffisante pour cette opération",
  },
  opCooldownActive: {
    ar: "الوسيط مشغول حتى {d} — فاصل أمان بين العمليات",
    en: "Fixer busy until {d} — safety interval between operations",
    fr: "Intermédiaire occupé jusqu'au {d} — intervalle de sécurité",
  },
  opTransferBanned: {
    ar: "منع قيد سارٍ حتى {d} — لا عمليات انتقال قذرة",
    en: "Transfer ban until {d} — no dirty transfer ops",
    fr: "Interdiction de recrutement jusqu'au {d} — pas d'opérations sales",
  },
  charityDonation: {
    ar: "تبرع خيري لخفض الشبهات",
    en: "Charity donation to lower suspicion",
    fr: "Don caritatif pour baisser la suspicion",
  },
  charityDonationDesc: {
    ar: "تبرع علني يخفض الشبهات — كل مليون يخفض 2%",
    en: "Public donation lowers suspicion — each million lowers 2%",
    fr: "Don public baisse la suspicion — chaque million baisse 2%",
  },
  cutMiddlemen: {
    ar: "قطع الوسطاء",
    en: "Cut the middlemen",
    fr: "Couper les intermédiaires",
  },
  cutMiddlemenDesc: {
    ar: "إنهاء شبكة الوسيط — يخفض الشبهات 15% فورًا",
    en: "End the fixer network — lowers suspicion 15% instantly",
    fr: "Mettre fin au réseau — baisse la suspicion de 15% immédiatement",
  },
  scandalTitle: {
    ar: "الفضيحة الكبرى — {n} نقاط وغرامات",
    en: "Major scandal — {n} points & fines",
    fr: "Scandale majeur — {n} points et amendes",
  },
  scandalBody: {
    ar: "التحقيق الرسمي اكتمل. خصم {n} نقاط، غرامة {money}، هروب راعٍ، غضب جماهيري، ومنع قيد {d} يومًا. الشبهات صُفرت مع عقوبة سمعة دائمة خفيفة.",
    en: "Formal investigation completed. {n} points deducted, fine {money}, sponsor fled, fan fury, transfer ban {d} days. Suspicion reset with light permanent rep penalty.",
    fr: "Enquête officielle terminée. {n} points retirés, amende {money}, sponsor parti, fureur des supporters, interdiction {d} jours. Suspicion remise à zéro avec légère pénalité permanente de réputation.",
  },
  scandalWhispersTitle: {
    ar: "همسات صحفية — الشبهات {n}%",
    en: "Press whispers — suspicion {n}%",
    fr: "Rumeurs de presse — suspicion {n}%",
  },
  scandalWhispersBody: {
    ar: "صحفيون يتحدثون عن علاقات مشبوهة. لا تحقيق بعد، لكن العيون بدأت تراقب.",
    en: "Journalists whisper about shady connections. No probe yet, but eyes are watching.",
    fr: "Les journalistes murmurent sur des liens douteux. Pas encore d'enquête, mais on vous observe.",
  },
  scandalLeaksTitle: {
    ar: "تسريبات وتحقيق أولي — الشبهات {n}%",
    en: "Leaks & preliminary probe — {n}%",
    fr: "Fuites et enquête préliminaire — {n}%",
  },
  scandalLeaksBody: {
    ar: "تسريب وثائق، تحقيق أولي، وقلق رعاة. الصحافة تطلب توضيحًا.",
    en: "Documents leaked, preliminary investigation, sponsor anxiety. Press demands clarification.",
    fr: "Documents fuités, enquête préliminaire, inquiétude des sponsors. La presse exige des explications.",
  },
  scandalFormalTitle: {
    ar: "تحقيق رسمي وشيك — الشبهات {n}%",
    en: "Formal investigation imminent — {n}%",
    fr: "Enquête officielle imminente — {n}%",
  },
  scandalFormalBody: {
    ar: "الاتحاد فتح ملفًا رسميًا. أي عملية إضافية قد تفجر الفضيحة الكبرى.",
    en: "Federation opened a formal file. Any further operation may trigger the major scandal.",
    fr: "La fédération a ouvert un dossier officiel. Toute opération supplémentaire peut déclencher le scandale majeur.",
  },
  // release clause
  releaseClauseLabel: {
    ar: "الشرط الجزائي",
    en: "Release clause",
    fr: "Clause libératoire",
  },
  releaseClauseNone: {
    ar: "لا يوجد شرط جزائي — تفاوض عادي",
    en: "No release clause — normal negotiation",
    fr: "Pas de clause — négociation normale",
  },
  releaseClauseValue: {
    ar: "الشرط الجزائي: {money}",
    en: "Release clause: {money}",
    fr: "Clause libératoire : {money}",
  },
  releaseClauseBrokenTitle: {
    ar: "كُسر الشرط الجزائي — {v} غادر",
    en: "Release clause triggered — {v} left",
    fr: "Clause déclenchée — {v} parti",
  },
  releaseClauseBrokenBody: {
    ar: "نادي {v} دفع الشرط الجزائي {money} دفعة واحدة. كاش فوري في الخزينة، لكن الجماهير غاضبة.",
    en: "Club {v} paid release clause {money} upfront. Instant cash, but fans furious.",
    fr: "Le club {v} a payé la clause {money} comptant. Cash immédiat, mais supporters furieux.",
  },
  releaseClauseHighSalary: {
    ar: "شرط جزائي عالٍ = راتب أعلى مطلوب",
    en: "High clause = higher salary demanded",
    fr: "Clause élevée = salaire plus élevé exigé",
  },
  releaseClauseLowSalary: {
    ar: "شرط قليل = راتب أقل لكن قابل للخطف",
    en: "Low clause = lower salary but poachable",
    fr: "Clause basse = salaire moindre mais vulnérable",
  },
  itemNoScandal: {
    ar: "لا فضائح — الحفاظ على نظافة الملفات",
    en: "No scandals — keep files clean",
    fr: "Pas de scandales — garder les dossiers propres",
  },
  // operations UI
  blackCardTitle: {
    ar: "ملفاتك السوداء",
    en: "Your black files",
    fr: "Vos dossiers noirs",
  },
  blackCardOpen: {
    ar: "افتح مكتب الوسيط",
    en: "Open fixer office",
    fr: "Ouvrir le bureau de l'intermédiaire",
  },
};

export const fillBlackText = (template, vars = {}) =>
  String(template).replace(/\{(\w+)\}/g, (m, k) =>
    vars[k] === undefined || vars[k] === null ? m : String(vars[k]),
  );

export const blackTextFor = (key, vars, language) => {
  const entry = BLACK_TEXTS[key];
  if (!entry) return key;
  const code = language === "en" ? "en" : language === "fr" ? "fr" : "ar";
  return fillBlackText(entry[code] ?? entry.ar, vars);
};

export const blackTextAr = (key, vars) => blackTextFor(key, vars, "ar");
export default BLACK_TEXTS;
