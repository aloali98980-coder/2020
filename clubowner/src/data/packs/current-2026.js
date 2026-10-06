// Manually curated, LIMITED factual snapshot. No official ability ratings or salary data.
// Club membership/ages are provisional source snapshots, not a live registration feed.
export const SNAPSHOT_DATE = "2026-09-24";
export const SOURCES = {
  ahly: "https://www.espn.com/soccer/team/squad/_/id/10207/al-ahly",
  zamalek: "https://www.transfermarkt.us/zamalek-sc/kader/verein/664",
  masry: "https://www.espn.com/soccer/team/squad/_/id/7339/al-masry",
  ittihad:
    "https://www.soccerway.com/team/al-ittihad-alexandria/WpApD7JG/squad/",
  city: "https://www.espn.com/soccer/team/squad/_/id/382/manchester-city",
  nassr: "https://www.espn.com/soccer/team/squad/_/id/817/al-nassr",
};
// [Arabic display name, international display name, snapshot age, game position, estimated game rating]
export const ROSTERS = {
  ahly: [
    ["محمد الشناوي", "Mohamed El Shenawy", 37, "GK", 80],
    ["مصطفى شوبير", "Mostafa Shoubir", 26, "GK", 77],
    ["ياسر إبراهيم", "Yasser Ibrahim", 33, "CB", 76],
    ["محمد هاني", "Mohamed Hany", 30, "RB", 76],
    ["ياسين مرعي", "Yassin Marei", 24, "CB", 72],
    ["كريم الدبيس", "Karim El Debes", 23, "LB", 70],
    ["كريم فؤاد", "Karim Fouad", 26, "RB", 73],
    ["أحمد عيد", "Ahmed Eid", 25, "RB", 70],
    ["مروان عطية", "Marawan Attia", 28, "DM", 78],
    ["إمام عاشور", "Emam Ashour", 28, "CM", 81],
    ["أحمد سيد زيزو", "Zizo", 30, "RW", 82],
    ["محمد مجدي أفشة", "Mohamed Magdy Afsha", 30, "AM", 77],
    ["حسين الشحات", "Hussein El Shahat", 34, "LW", 77],
    ["أحمد نبيل كوكا", "Ahmed Koka", 25, "DM", 73],
    ["طاهر محمد طاهر", "Taher Mohamed", 29, "RW", 73],
    ["أشرف بن شرقي", "Achraf Bencharki", 32, "LW", 79],
    ["منصف بقرار", "Monsef Bakrar", 25, "ST", 76],
    ["سفيان بنجديدة", "Soufiane Benjdida", 25, "ST", 73],
  ],
  zamalek: [
    ["محمد صبحي", "Mohamed Sobhi", 27, "GK", 75],
    ["المهدي سليمان", "El Mahdi Soliman", 39, "GK", 74],
    ["محمد عواد", "Mohamed Awad", 34, "GK", 75],
    ["محمد إسماعيل", "Mohamed Ismail", 27, "CB", 72],
    ["محمود حمدي الونش", "Mahmoud El Wensh", 31, "CB", 76],
    ["مصطفى الزناري", "Mostafa El Zenary", 27, "CB", 70],
    ["محمود بنتايك", "Mahmoud Bentayg", 26, "LB", 76],
    ["أحمد فتوح", "Ahmed Fatouh", 28, "LB", 77],
    ["عمر جابر", "Omar Gaber", 34, "RB", 73],
    ["محمد شحاتة", "Mohamed Shehata", 25, "CM", 74],
    ["عبد الله السعيد", "Abdallah El Said", 41, "AM", 77],
    ["أحمد ربيع", "Ahmed Rabie", 25, "DM", 69],
    ["سيف جعفر", "Seif Gaafar", 26, "CM", 70],
    ["آدم كايد", "Adam Kaied", 24, "AM", 70],
    ["شيكو بانزا", "Chico Banza", 27, "LW", 72],
    ["أحمد شريف", "Ahmed Sherif", 23, "LW", 70],
    ["ناصر منسي", "Nasser Mansy", 28, "ST", 76],
    ["عدي الدباغ", "Oday Dabbagh", 27, "ST", 77],
  ],
  masry: [
    ["عصام ثروت", "Essam Tharwat", 37, "GK", 68],
    ["محمود حمدي", "Mahmoud Hamdy", 32, "GK", 71],
    ["كريم العراقي", "Karim El Eraki", 28, "RB", 72],
    ["باهر المحمدي", "Baher El Mohamady", 29, "CB", 72],
    ["مصطفى العش", "Mostafa El Aash", 25, "CB", 72],
    ["خالد صبحي", "Khaled Sobhy", 31, "CB", 69],
    ["عمرو السعداوي", "Amr El Saadawy", 29, "LB", 69],
    ["محمود حمادة", "Mahmoud Hamada", 32, "DM", 73],
    ["محمد مخلوف", "Mohamed Makhlouf", 28, "CM", 70],
    ["يوسف الجوهري", "Youssef El Gohary", 28, "CM", 69],
    ["عبد الرحيم دغموم", "Abderrahim Deghmoum", 27, "AM", 75],
    ["عميد صوافطة", "Ameed Sawafta", 26, "CM", 69],
    ["حسن علي", "Hassan Ali", 29, "LM", 70],
    ["مصطفى زيدان", "Moustafa Zeidan", 28, "AM", 72],
    ["صلاح محسن", "Salah Mohsen", 28, "ST", 74],
    ["محمد الشامي", "Mohamed El Shamy", 30, "RW", 71],
  ],
  ittihad: [
    ["صبحي سليمان", "Sobhi Soliman", 29, "GK", 70],
    ["علي الجابري", "Ali El Gabry", 25, "GK", 64],
    ["مؤمن عوض", "Momen Awad", 25, "RB", 68],
    ["مصطفى إبراهيم", "Mostafa Ibrahim", 26, "CB", 68],
    ["خالد موسى مسعد", "Khaled Mosaad", 25, "CB", 67],
    ["ميدو مصطفى", "Mido Mostafa", 32, "LB", 68],
    ["مؤمن شريف", "Moamen Sherif", 20, "LB", 63],
    ["محمد فخري", "Mohamed Fakhri", 27, "CM", 69],
    ["محمود عماد", "Mahmoud Emad", 28, "DM", 67],
    ["سافيور إيزاك", "Saviour Isaac", 24, "AM", 71],
    ["كينيث سيماكولا", "Kenneth Semakula", 23, "DM", 68],
    ["محمد توني", "Mohamed Tony", 30, "CM", 70],
    ["أحمد عاطف", "Ahmed Atef", 21, "CM", 65],
    ["حسام حسن", "Hossam Hassan", 33, "ST", 73],
    ["جون إيبوكا", "John Ebuka", 29, "ST", 72],
    ["يسري وحيد", "Youssry Wahid", 28, "RW", 70],
    ["باسكال فيري", "Pascal Phiri", 21, "LW", 67],
    ["جوزيف أرومالا", "Joseph Arumala", 22, "LW", 67],
  ],
  city: [
    ["إيرلينج هالاند", "Erling Haaland", 26, "ST", 92],
    ["فيل فودين", "Phil Foden", 26, "AM", 88],
    ["جيانلويجي دوناروما", "Gianluigi Donnarumma", 27, "GK", 89],
    ["روبن دياز", "Ruben Dias", 29, "CB", 88],
    ["ريكو لويس", "Rico Lewis", 21, "RB", 80],
    ["ريان شرقي", "Rayan Cherki", 23, "AM", 84],
    ["ماتيوس نونيز", "Matheus Nunes", 28, "CM", 81],
    ["يوشكو جفارديول", "Josko Gvardiol", 24, "CB", 86],
  ],
  nassr: [
    ["كريستيانو رونالدو", "Cristiano Ronaldo", 41, "ST", 86],
    ["ساديو ماني", "Sadio Mane", 34, "LW", 83],
    ["كينجسلي كومان", "Kingsley Coman", 30, "LW", 83],
    ["بينتو", "Bento", 27, "GK", 80],
    ["محمد سيماكان", "Mohamed Simakan", 26, "CB", 80],
    ["سلطان الغنام", "Sultan Al Ghannam", 32, "RB", 74],
    ["عبد الله الخيبري", "Abdullah Al Khaibari", 30, "DM", 72],
    ["أنجيلو جابرييل", "Angelo Gabriel", 21, "RW", 78],
  ],
};
export function currentPlayers(clubId, leagues) {
  const selected = [
    "ahly",
    "zamalek",
    "masry",
    "ittihad",
    ...(leagues.includes("en") ? ["city"] : []),
    ...(leagues.includes("sa") ? ["nassr"] : []),
  ];
  return selected.flatMap((team) =>
    ROSTERS[team].map((row, i) => {
      let [name, nameLatin, age, position, rating] = row;
      if (position === "LM") position = "LW";
      const league = team === "city" ? "en" : team === "nassr" ? "sa" : "eg";
      const identifier = `real-${team}-${i}`;
      const physical = Math.max(35, rating - Math.max(0, age - 29) * 2.1);
      const attributes = {
        pace: Math.round(position === "GK" ? 40 : physical),
        passing: rating - 3,
        shooting:
          position === "GK" ? 25 : position === "ST" ? rating : rating - 10,
        defending: ["CB", "DM", "LB", "RB"].includes(position)
          ? rating
          : position === "GK"
            ? 60
            : rating - 22,
        stamina: Math.round(physical + 2),
        decisions: Math.min(
          94,
          rating + Math.min(6, Math.max(0, age - 25) / 2),
        ),
      };
      for (const k in attributes) attributes[k] = Math.round(attributes[k]);
      const value =
        league === "en"
          ? Math.round((rating - 60) ** 2 * 900000)
          : league === "sa"
            ? Math.round((rating - 58) ** 2 * 100000)
            : Math.round((rating - 52) * 550000);
      return {
        id: identifier,
        name,
        nameLatin,
        clubId: team,
        league,
        position,
        age,
        ageReference: age,
        ageReferenceDate: SNAPSHOT_DATE,
        birthDate: null,
        rating,
        potential: Math.min(95, rating + (age < 24 ? 10 : age < 28 ? 4 : 0)),
        foot: "يمنى",
        nationality: "غير موثقة",
        value,
        salary:
          league === "en"
            ? Math.round((rating - 55) * 150000)
            : league === "sa"
              ? Math.round((rating - 50) * 30000)
              : Math.round((rating - 45) * 6500),
        morale: 80,
        fitness: 95,
        contractEnd: "2028-06-30",
        role: i < 11 ? "أساسي" : "مداورة",
        attributes,
        appearances: 0,
        goals: 0,
        fictional: false,
        sourceUrl: SOURCES[team],
        sourceAsOf: SNAPSHOT_DATE,
        sourceStatus: "provisional",
        estimatedFields: [
          "attributes",
          "potential",
          "salary",
          "value",
          "contract",
          "foot",
          "position-detail",
        ],
        status: "active",
        naturalFitness: 70 + ((i * 7) % 21),
        careerInterest: (i * 17 + age) % 100,
        careerHistory: [],
        lastAgingMonth: null,
        injuryUntil: null,
      };
    }),
  );
}
