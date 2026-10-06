export const DIFFICULTIES = {
  beginner: {
    name: "مبتدئ",
    cash: 1.8,
    operating: 0.8,
    transfer: 0.82,
    wage: 0.9,
    sponsor: 1.18,
    eventInterval: 28,
    description:
      "سيولة أكبر ٨٠٪، وتشغيل أقل ٢٠٪، وتفاوض أسهل. القدرات والنتائج لا تتغير سرًا.",
  },
  easy: {
    name: "سهل",
    cash: 1.3,
    operating: 0.9,
    transfer: 0.9,
    wage: 0.95,
    sponsor: 1.08,
    eventInterval: 21,
    description: "سيولة أكبر ٣٠٪، وتشغيل أقل ١٠٪، ومساحة أكبر للتجربة.",
  },
  normal: {
    name: "متوسط",
    cash: 1,
    operating: 1,
    transfer: 1,
    wage: 1,
    sponsor: 1,
    eventInterval: 18,
    description:
      "الاقتصاد والتفاوض بمعدلاتهما الأساسية. قرارات لها مكاسب وتكاليف.",
  },
  hard: {
    name: "صعب",
    cash: 0.75,
    operating: 1.15,
    transfer: 1.15,
    wage: 1.12,
    sponsor: 0.85,
    eventInterval: 12,
    description: "سيولة أقل ٢٥٪، وتشغيل أعلى ١٥٪، ورعايات أقل وتفاوض أصعب.",
  },
};
export const difficulty = (s) =>
  DIFFICULTIES[s.difficulty] || DIFFICULTIES.normal;
