// Consequences are explicit and deterministic at decision time; not random punishment.
export const EVENT_CATALOG = [
  {
    id: "community",
    title: "يوم مفتوح للجماهير",
    body: "إدارة العلاقات تقترح يومًا مفتوحًا في النادي. ميزانية واضحة مقابل تحسين العلاقة مع الجمهور.",
    choices: [
      { id: "host", label: "تنظيم اليوم المفتوح", cash: -120000, fans: 4 },
      {
        id: "digital",
        label: "لقاء رقمي منخفض التكلفة",
        cash: -25000,
        fans: 1,
      },
      { id: "decline", label: "تأجيل النشاط", cash: 0, fans: 0 },
    ],
  },
  {
    id: "sponsor-activation",
    title: "حملة مشتركة مع الرعاة",
    body: "شريكك التجاري يقترح حملة محلية. المشاركة تحقق مبلغًا تعاقديًا لاحقًا، وليست ربحًا مضمونًا في كل حملات المستقبل.",
    choices: [
      {
        id: "join",
        label: "اعتماد الحملة",
        cash: -100000,
        incomeLater: 180000,
        fans: 2,
      },
      { id: "decline", label: "الاعتذار بدون غرامة", cash: 0, fans: 0 },
    ],
  },
  {
    id: "maintenance",
    title: "تقرير صيانة المنشآت",
    body: "الفحص الدوري كشف حاجة لصيانة إضافية. يمكنك المعالجة الكاملة أو إصلاحًا جزئيًا؛ التأجيل يخفض جاهزية الفريق في هذه الدورة.",
    choices: [
      { id: "full", label: "صيانة شاملة", cash: -180000, fitness: 3 },
      { id: "partial", label: "إصلاح أساسي", cash: -60000, fitness: 0 },
      { id: "delay", label: "تأجيل الصيانة", cash: 0, fitness: -5 },
    ],
  },
  {
    id: "fatigue",
    title: "الجهاز الطبي يطلب تخفيف الحمل",
    body: "عدد من اللاعبين يعانون إجهادًا تدريبيًا. القرار يوازن بين الاستشفاء والمعنويات والتكلفة.",
    choices: [
      { id: "rest", label: "راحة واستشفاء", cash: 0, fitness: 7, morale: 1 },
      {
        id: "recovery",
        label: "برنامج استشفاء متخصص",
        cash: -90000,
        fitness: 10,
        morale: 2,
      },
      {
        id: "continue",
        label: "استمرار البرنامج الحالي",
        cash: 0,
        fitness: -4,
        morale: -2,
      },
    ],
  },
  {
    id: "youth-trial",
    title: "فرصة تجربة موهبة شابة",
    body: "وصل طلب تجربة من لاعب ناشئ مولّد داخل عالم اللعبة. التجربة لا تضمن نجمًا، لكنها تمنحك فرصة تطويره.",
    choices: [
      {
        id: "trial",
        label: "تمويل التجربة وإضافة الناشئ",
        cash: -75000,
        youth: true,
      },
      { id: "decline", label: "الاكتفاء بالقائمة الحالية", cash: 0 },
    ],
  },
  {
    id: "ticket-pressure",
    title: "الجمهور يطلب دعم الحضور",
    body: "ممثلون للمشجعين يقترحون تمويل مبادرة حضور. الأثر الموضح على ثقة الجمهور؛ سعر التذكرة نفسه لا يتغير دون قرارك.",
    choices: [
      { id: "support", label: "دعم المبادرة", cash: -70000, fans: 3 },
      { id: "explain", label: "شرح أولويات الميزانية", cash: 0, fans: 0 },
      { id: "ignore", label: "رفض المبادرة دون لقاء", cash: 0, fans: -3 },
    ],
  },
  {
    id: "dressing-room",
    title: "اجتماع غرفة الملابس",
    body: "الجهاز يقترح يومًا لبناء التفاهم بين اللاعبين. الوعود المحددة في العقود تظل مستقلة، ولا تمحوها الأنشطة الجماعية.",
    choices: [
      { id: "camp", label: "معسكر يوم واحد", cash: -110000, morale: 5 },
      { id: "meeting", label: "اجتماع داخلي", cash: 0, morale: 2 },
      { id: "skip", label: "التركيز على التدريب فقط", cash: 0, morale: -1 },
    ],
  },
  {
    id: "scouting-budget",
    title: "توسيع ملف المرشحين",
    body: "المدير الرياضي يعرض مراجعة تقارير مرشحين من الأسواق المفعلة. التقرير يضيّق نطاق تقدير الإمكانات، ولا يكشف المستقبل يقينًا.",
    choices: [
      { id: "fund", label: "تمويل التقرير", cash: -50000, report: true },
      { id: "decline", label: "عدم تخصيص ميزانية الآن", cash: 0 },
    ],
  },
];
