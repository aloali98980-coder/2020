const tr = (ar, en, fr) => ({ ar, en, fr });

export const CELEBRATION_TEXTS = Object.freeze({
  title: {
    label: tr("أبطال الموسم", "Season champions", "Champions de la saison"),
    kicker: tr("ليلة المجد", "A night of glory", "Une nuit de gloire"),
    speech: tr(
      "هذا اللقب لكم. وقفتم خلف النادي في كل لحظة، واليوم المدينة كلها تحتفل.",
      "This title belongs to you. You stood behind the club every step, and tonight the whole city celebrates.",
      "Ce titre est à vous. Vous avez soutenu le club à chaque instant, et ce soir toute la ville célèbre.",
    ),
    merchandise: tr("مبيعات قمصان التتويج", "Championship shirt sales", "Ventes des maillots du titre"),
    sponsor: tr("مكافأة تفعيل رعاة التتويج", "Championship sponsor activation", "Activation des sponsors du titre"),
  },
  cup: {
    label: tr("أبطال الكأس", "Cup winners", "Vainqueurs de la coupe"),
    kicker: tr("الكأس لنا", "The cup is ours", "La coupe est à nous"),
    speech: tr(
      "قاتلنا حتى الصافرة الأخيرة. هذه الكأس بداية لحكاية أكبر.",
      "We fought until the final whistle. This cup is the start of a bigger story.",
      "Nous nous sommes battus jusqu’au dernier coup de sifflet. Cette coupe ouvre une plus grande histoire.",
    ),
    merchandise: tr("مبيعات قمصان الكأس", "Cup shirt sales", "Ventes des maillots de coupe"),
    sponsor: tr("مكافأة راعي الكأس", "Cup sponsor bonus", "Prime du sponsor de la coupe"),
  },
  derby: {
    label: tr("انتصار الديربي", "Derby victory", "Victoire du derby"),
    kicker: tr("المدينة لنا الليلة", "The city is ours tonight", "La ville est à nous ce soir"),
    speech: tr(
      "سمعنا صوتكم في المدرجات. هذا الفوز هدية لكل مشجع حمل الألوان.",
      "We heard you in the stands. This win is for every supporter who wore the colors.",
      "Nous vous avons entendus dans les tribunes. Cette victoire est pour chaque supporter qui porte nos couleurs.",
    ),
    merchandise: tr("مبيعات يوم الديربي", "Derby-day merchandise", "Ventes du jour de derby"),
    sponsor: tr("تفعيل راعي الديربي", "Derby sponsor activation", "Activation du sponsor du derby"),
  },
  promotion: {
    label: tr("ليلة الصعود", "Promotion night", "Soirée de promotion"),
    kicker: tr("إلى الدرجة الأعلى", "One tier higher", "Un niveau plus haut"),
    speech: tr(
      "هذا الملعب حملنا إلى الأعلى. سنصعد معًا، ونبقى أوفياء للمدينة.",
      "This ground carried us upward. We rise together and stay true to our city.",
      "Ce stade nous a portés plus haut. Nous montons ensemble, fidèles à notre ville.",
    ),
    merchandise: tr("مبيعات قمصان الصعود", "Promotion shirt sales", "Ventes des maillots de montée"),
    sponsor: tr("مكافأة راعي الصعود", "Promotion sponsor bonus", "Prime du sponsor de la montée"),
  },
});

export const CELEBRATION_COPY = Object.freeze({
  bus: tr("موكب مفتوح يجوب المدينة", "Open-top bus parade through the city", "Défilé en bus ouvert dans la ville"),
  pitch: tr("الجماهير تقتحم أرض الملعب للاحتفال", "Fans flood the pitch to celebrate", "Les supporters envahissent la pelouse pour célébrer"),
  broadcast: tr("تغطية مباشرة للقناة", "Live channel coverage", "Couverture en direct de la chaîne"),
  social: tr("السوشيال ينفجر", "Social media is exploding", "Les réseaux sociaux s’enflamment"),
  close: tr("إغلاق المشهد", "Close scene", "Fermer la scène"),
  next: tr("المشهد التالي", "Next scene", "Scène suivante"),
  bigCity: tr("المدينة كلها في الشوارع", "The whole city is out", "Toute la ville est dans la rue"),
  tifo: tr("تيفو تاريخي", "Historic tifo", "Tifo historique"),
  rivals: tr("ديربي مشتعل", "A derby ablaze", "Un derby en feu"),
});
