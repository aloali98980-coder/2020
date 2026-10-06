// قاعة الأساطير — كتالوج تحريري للاعبين معتزلين بأسماء حقيقية.
// التقييمات والسمات والأسعار هنا تقديرات تحريرية لأغراض المحاكاة فقط،
// وليست إحصاءات رسمية ولا تعبّر عن أي جهة. (sourceStatus: legend-editorial)
import { WORLD_CLUBS, gameClubId } from "./packs/world.js";
import { marketBy } from "./worldMarkets.js";
import { clamp } from "../core/utils.js";

export const LEGEND_SOURCE_STATUS = "legend-editorial";

export const LEGEND_GROUPS = {
  gk: { id: "gk", name: "حراسة المرمى", positions: ["GK"] },
  defence: { id: "defence", name: "الدفاع", positions: ["CB", "RB", "LB", "DM"] },
  midfield: { id: "midfield", name: "صناعة اللعب", positions: ["CM", "AM"] },
  attack: { id: "attack", name: "الهجوم", positions: ["ST", "RW", "LW"] },
};

// الأدوار المتاحة عند التعاقد مع أسطورة.
export const LEGEND_ROLES = {
  gk: {
    id: "gk",
    name: "مدرب حراس المرمى",
    kind: "coach",
    group: "gk",
    attributes: ["defending", "decisions"],
    description: "يرفع تمركز حراسك وقراراتهم شهريًا، ويبطئ تراجعهم مع العمر.",
  },
  defence: {
    id: "defence",
    name: "مدرب الدفاع",
    kind: "coach",
    group: "defence",
    attributes: ["defending", "decisions"],
    description: "تدريب خاص لقلوب الدفاع والأظهرة والارتكاز: التزام وقراءة للعبة.",
  },
  midfield: {
    id: "midfield",
    name: "مدرب صناعة اللعب",
    kind: "coach",
    group: "midfield",
    attributes: ["passing", "decisions"],
    description: "يحسّن التمرير واتخاذ القرار عند لاعبي الوسط وصناع اللعب.",
  },
  attack: {
    id: "attack",
    name: "مدرب الهجوم",
    kind: "coach",
    group: "attack",
    attributes: ["shooting", "decisions"],
    description: "جلسات إنهاء وتحرك بلا كرة للمهاجمين والأجنحة.",
  },
  ambassador: {
    id: "ambassador",
    name: "سفير النادي",
    kind: "ambassador",
    group: null,
    attributes: [],
    description: "حضور إعلامي وفعاليات: سمعة وجماهير ودخل حقوق صورة شهري.",
  },
  player: {
    id: "player",
    name: "عودة كلاعب (وضع خيالي)",
    kind: "player",
    group: null,
    attributes: [],
    description: "الأسطورة تعود للملاعب بقدرات قريبة من ذروتها لموسم أو اثنين.",
  },
};

const COUNTRY_NAMES = {
  lr: "ليبيريا",
  cm: "الكاميرون",
  gh: "غانا",
  ng: "نيجيريا",
  ci: "كوت ديفوار",
  bg: "بلغاريا",
  wa: "ويلز",
};

// [id, latin, arabic, country, position, born, peak, era, clubs, bio, wiki, options]
// clubs: أسماء الكتالوج العالمي أو معرّفات الأندية المصرية القديمة (ahly, zamalek, ismaily, masry).
const ROWS = [
  // ——— مصر ———
  ["elkhatib", "Mahmoud El Khatib", "محمود الخطيب", "eg", "ST", 1954, 93, "1972–1988", ["Al Ahly SC"], "بيبو: أفضل لاعب في أفريقيا 1983، ورمز الأهلي داخل الملعب وخارجه.", "Mahmoud El Khatib", { rivals: ["Zamalek SC"] }],
  ["hossamhassan", "Hossam Hassan", "حسام حسن", "eg", "ST", 1966, 91, "1985–2008", ["Al Ahly SC", "Zamalek SC", "Al Masry SC"], "هداف منتخب مصر التاريخي، ومسيرة امتدت لأكثر من عقدين.", "Hossam Hassan"],
  ["aboutrika", "Mohamed Aboutrika", "محمد أبو تريكة", "eg", "AM", 1978, 92, "1997–2013", ["Al Ahly SC"], "صانع ألعاب ألقاب القارة؛ هدوء تحت الضغط وذكاء بلا كرة.", "Mohamed Aboutrika", { rivals: ["Zamalek SC"] }],
  ["elhadary", "Essam El-Hadary", "عصام الحضري", "eg", "GK", 1973, 91, "1993–2020", ["Al Ahly SC", "ismaily", "Zamalek SC", "Al Masry SC"], "السد العالي: أربعة ألقاب أفريقية مع المنتخب وأكبر لاعب يشارك في كأس العالم.", "Essam El-Hadary"],
  ["ahmedhassan", "Ahmed Hassan", "أحمد حسن", "eg", "CM", 1975, 88, "1995–2013", ["ismaily", "RSC Anderlecht", "Al Ahly SC", "Zamalek SC"], "القائد صاحب أكبر عدد مباريات دولية في تاريخ مصر.", "Ahmed Hassan"],
  ["hanyramzy", "Hany Ramzy", "هاني رمزي", "eg", "CB", 1969, 87, "1988–2005", ["Al Ahly SC", "SV Werder Bremen"], "قلب دفاع احترف في أوروبا مبكرًا وقاد دفاع المنتخب سنوات طويلة.", "Hany Ramzy"],
  ["hazememam", "Hazem Emam", "حازم إمام", "eg", "AM", 1975, 86, "1993–2008", ["Zamalek SC", "Udinese Calcio"], "أمير الزمالك: مراوغة وجرأة وتجربة احترافية في إيطاليا.", "Hazem Emam", { rivals: ["Al Ahly SC"] }],
  ["gaafar", "Farouk Gaafar", "فاروق جعفر", "eg", "CM", 1952, 87, "1970–1988", ["Zamalek SC"], "قلب وسط الزمالك الذهبي وقائد جيل السبعينيات والثمانينيات.", "Farouk Gaafar", { rivals: ["Al Ahly SC"] }],
  ["shobair", "Ahmed Shobair", "أحمد شوبير", "eg", "GK", 1960, 86, "1983–1998", ["Al Ahly SC"], "حارس الأهلي والمنتخب في مونديال 1990؛ ثبات في المواجهات الكبرى.", "Ahmed Shobair", { rivals: ["Zamalek SC"] }],
  ["ibrahimyoussef", "Ibrahim Youssef", "إبراهيم يوسف", "eg", "CB", 1959, 87, "1979–1994", ["Zamalek SC"], "قائد دفاع الزمالك في زمن الألقاب الأفريقية الأولى.", "Ibrahim Youssef", { rivals: ["Al Ahly SC"] }],
  ["abouzeid", "Taher Abouzeid", "طاهر أبو زيد", "eg", "AM", 1962, 88, "1981–1990", ["Al Ahly SC"], "الجنرال: هداف وصانع لعب في جيل الأهلي الذهبي بالثمانينيات.", "Taher Abouzeid", { rivals: ["Zamalek SC"] }],
  ["waelgomaa", "Wael Gomaa", "وائل جمعة", "eg", "CB", 1975, 87, "1995–2014", ["Al Ahly SC"], "صخرة الدفاع في أنجح حقب الأهلي القارية؛ قراءة وانضباط.", "Wael Gomaa", { rivals: ["Zamalek SC"] }],
  ["barakat", "Mohamed Barakat", "محمد بركات", "eg", "RW", 1976, 85, "1996–2013", ["ismaily", "Al-Ahli Saudi FC", "Al Ahly SC"], "جناح سريع وحاسم في جيل الأهلي 2005–2013، بعد بدايته مع الإسماعيلي.", "Mohamed Barakat"],
  ["shehata", "Hassan Shehata", "حسن شحاتة", "eg", "AM", 1949, 87, "1967–1983", ["Zamalek SC"], "المعلم: نجم الزمالك ثم المدرب صاحب ثلاثية أمم أفريقيا.", "Hassan Shehata", { rivals: ["Al Ahly SC"] }],
  ["mido", "Mido", "ميدو (أحمد حسام)", "eg", "ST", 1983, 84, "1999–2013", ["Zamalek SC", "AFC Ajax", "AS Roma", "Olympique de Marseille", "Tottenham Hotspur F.C."], "أول نجم مصري يجول الدوريات الأوروبية الكبرى في مطلع الألفية.", "Mido (footballer)"],
  ["abogreisha", "Ali Abo Greisha", "علي أبو جريشة", "eg", "ST", 1946, 86, "1964–1980", ["ismaily"], "أسطورة الإسماعيلي وبطل أفريقيا 1969 مع الدراويش.", "Ali Abo Greisha"],
  // ——— السعودية والخليج ———
  ["majed", "Majed Abdullah", "ماجد عبدالله", "sa", "ST", 1959, 90, "1977–1998", ["Al-Nassr FC"], "الأسطورة العربية: هداف النصر والمنتخب السعودي عبر عقدين.", "Majed Abdullah", { rivals: ["Al Hilal SFC"] }],
  ["aljaber", "Sami Al-Jaber", "سامي الجابر", "sa", "ST", 1972, 87, "1988–2008", ["Al Hilal SFC"], "رمز الهلال وأول سعودي في الدوري الإنجليزي (إعارة ولفرهامبتون).", "Sami Al-Jaber", { rivals: ["Al-Nassr FC"] }],
  ["alqahtani", "Yasser Al-Qahtani", "ياسر القحطاني", "sa", "ST", 1982, 85, "1999–2018", ["Al Qadsiah FC", "Al Hilal SFC"], "السهم: هداف الهلال وأفضل لاعب آسيوي 2007.", "Yasser Al-Qahtani"],
  ["aldeayea", "Mohamed Al-Deayea", "محمد الدعيع", "sa", "GK", 1972, 86, "1990–2010", ["Al Hilal SFC"], "حارس السعودية في نهائيات 1994 و1998 و2002 ومن أكثر اللاعبين تمثيلًا لمنتخبه.", "Mohamed Al-Deayea"],
  ["altalyani", "Adnan Al Talyani", "عدنان الطلياني", "ae", "ST", 1964, 82, "1983–1997", [], "أيقونة الإمارات وقائدها في مونديال 1990.", "Adnan Al Talyani"],
  ["muftah", "Mansour Muftah", "منصور مفتاح", "qa", "ST", 1957, 82, "1975–1994", ["Al-Arabi SC (Qatar)"], "هداف قطر التاريخي ونجم فضية مونديال الشباب 1981.", "Mansour Muftah"],
  // ——— المغرب العربي ———
  ["madjer", "Rabah Madjer", "رابح ماجر", "dz", "ST", 1958, 88, "1976–1992", ["FC Porto"], "كعب ماجر في نهائي كأس أوروبا 1987؛ أفضل لاعب في أفريقيا في العام نفسه.", "Rabah Madjer"],
  ["belloumi", "Lakhdar Belloumi", "لخضر بلومي", "dz", "AM", 1958, 87, "1976–1992", [], "أفضل لاعب في أفريقيا 1981 وصاحب هدف الفوز التاريخي على ألمانيا الغربية 1982.", "Lakhdar Belloumi"],
  ["zaki", "Badou Zaki", "بادو الزاكي", "ma", "GK", 1959, 86, "1978–1992", ["Wydad AC"], "أفضل لاعب أفريقي 1986 وحارس أول منتخب عربي يبلغ دور الـ16 في كأس العالم.", "Badou Zaki"],
  ["hadji", "Mustapha Hadji", "مصطفى حجي", "ma", "AM", 1971, 85, "1992–2010", ["Sporting CP", "Deportivo de A Coruña", "Coventry City F.C.", "Aston Villa F.C."], "أفضل لاعب في أفريقيا 1998 ونجم مونديال فرنسا مع أسود الأطلس.", "Mustapha Hadji"],
  ["dhiab", "Tarak Dhiab", "طارق ذياب", "tn", "AM", 1954, 86, "1972–1990", ["Espérance Sportive de Tunis", "Al-Ahli Saudi FC"], "أفضل لاعب في أفريقيا 1977 وأيقونة الترجي وأول مونديال تونسي.", "Tarak Dhiab"],
  // ——— أفريقيا ———
  ["weah", "George Weah", "جورج وياه", "lr", "ST", 1966, 93, "1985–2003", ["AS Monaco FC", "Paris Saint-Germain FC", "AC Milan", "Chelsea F.C.", "Manchester City F.C.", "Olympique de Marseille"], "الأفريقي الوحيد الفائز بالكرة الذهبية (1995)، ثم رئيس لبلاده.", "George Weah"],
  ["milla", "Roger Milla", "روجيه ميلا", "cm", "ST", 1952, 88, "1970–1996", ["AS Monaco FC"], "رقصة العلم الركني في مونديال 1990 وهو في الثامنة والثلاثين.", "Roger Milla"],
  ["abedipele", "Abedi Pelé", "أبيدي بيليه", "gh", "AM", 1964, 89, "1978–2000", ["Olympique de Marseille", "Lille OSC", "Olympique Lyonnais", "Torino FC"], "ثلاث كرات ذهبية أفريقية ودوري أبطال 1993 مع مارسيليا.", "Abedi Pele"],
  ["okocha", "Jay-Jay Okocha", "جاي جاي أوكوتشا", "ng", "AM", 1973, 88, "1990–2008", ["Eintracht Frankfurt", "Fenerbahçe S.K. (football)", "Paris Saint-Germain FC"], "مهارات لا تُنسى؛ ساحر نيجيريا في أوروبا وبولتون.", "Jay-Jay Okocha"],
  ["drogba", "Didier Drogba", "ديدييه دروجبا", "ci", "ST", 1978, 91, "1998–2018", ["Olympique de Marseille", "Chelsea F.C.", "Galatasaray S.K. (football)"], "هداف النهائيات الكبرى وبطل دوري الأبطال 2012 مع تشيلسي.", "Didier Drogba"],
  ["etoo", "Samuel Eto'o", "صامويل إيتو", "cm", "ST", 1981, 92, "1997–2019", ["Real Madrid CF", "FC Barcelona", "Inter Milan", "Chelsea F.C.", "Everton F.C."], "أربع كرات ذهبية أفريقية وثلاثية تاريخية مع إنتر 2010.", "Samuel Eto'o"],
  ["yayatoure", "Yaya Touré", "يايا توريه", "ci", "CM", 1983, 89, "2001–2019", ["Olympiacos F.C.", "AS Monaco FC", "FC Barcelona", "Manchester City F.C."], "محرك وسط مانشستر سيتي في ألقاب الدوري الأولى؛ قوة وتقدم بالكرة.", "Yaya Touré"],
  ["radebe", "Lucas Radebe", "لوكاس راديبي", "za", "CB", 1969, 86, "1989–2005", ["Kaizer Chiefs F.C.", "Leeds United F.C."], "قائد ليدز ورمز جنوب أفريقيا؛ صلابة وقيادة.", "Lucas Radebe"],
  ["mccarthy", "Benni McCarthy", "بيني مكارثي", "za", "ST", 1977, 86, "1995–2013", ["AFC Ajax", "RC Celta de Vigo", "FC Porto", "Orlando Pirates F.C."], "هداف جنوب أفريقيا التاريخي وبطل دوري الأبطال 2004 مع بورتو.", "Benni McCarthy"],
  // ——— أمريكا الجنوبية ———
  ["pele", "Pelé", "بيليه", "br", "ST", 1940, 98, "1956–1977", ["Santos FC"], "ثلاث كؤوس عالم؛ الاسم الذي صار مرادفًا للعبة.", "Pelé"],
  ["garrincha", "Garrincha", "غارينشا", "br", "RW", 1933, 95, "1953–1972", ["Botafogo FR"], "فرحة الشعب: مراوغة لا تُدرس؛ بطل العالم 1958 و1962.", "Garrincha"],
  ["zico", "Zico", "زيكو", "br", "AM", 1953, 94, "1971–1994", ["CR Flamengo", "Udinese Calcio", "Kashima Antlers"], "بيليه الأبيض: ركلات حرة وصناعة أهداف بلا حدود.", "Zico"],
  ["socrates", "Sócrates", "سقراط", "br", "CM", 1954, 90, "1974–1989", ["SC Corinthians Paulista", "ACF Fiorentina"], "الطبيب: كعب وذكاء وقيادة منتخب 1982 الجميل.", "Sócrates"],
  ["romario", "Romário", "روماريو", "br", "ST", 1966, 93, "1985–2009", ["CR Vasco da Gama", "PSV Eindhoven", "FC Barcelona", "CR Flamengo", "Valencia CF"], "الإنهاء في أبسط صوره؛ أفضل لاعب في مونديال 1994.", "Romário"],
  ["r9", "Ronaldo Nazário", "رونالدو نازاريو", "br", "ST", 1976, 96, "1993–2011", ["Cruzeiro EC", "PSV Eindhoven", "FC Barcelona", "Inter Milan", "Real Madrid CF", "AC Milan", "SC Corinthians Paulista"], "الظاهرة: سرعة وقوة وإنهاء لا مثيل له؛ هداف مونديال 2002.", "Ronaldo (Brazilian footballer)"],
  ["rivaldo", "Rivaldo", "ريفالدو", "br", "AM", 1972, 93, "1989–2015", ["SE Palmeiras", "Deportivo de A Coruña", "FC Barcelona", "AC Milan", "Olympiacos F.C."], "الكرة الذهبية 1999 ومقصية الهاتريك الشهيرة.", "Rivaldo"],
  ["robertocarlos", "Roberto Carlos", "روبرتو كارلوس", "br", "LB", 1973, 91, "1991–2015", ["SE Palmeiras", "Inter Milan", "Real Madrid CF", "Fenerbahçe S.K. (football)", "SC Corinthians Paulista"], "الظهير الصاروخي؛ ركلات حرة تتحدى الفيزياء.", "Roberto Carlos"],
  ["cafu", "Cafu", "كافو", "br", "RB", 1970, 91, "1989–2008", ["São Paulo FC", "SE Palmeiras", "AS Roma", "AC Milan"], "القائد الوحيد الذي لعب ثلاثة نهائيات كأس عالم متتالية.", "Cafu"],
  ["ronaldinho", "Ronaldinho", "رونالدينيو", "br", "AM", 1980, 94, "1998–2015", ["Grêmio FBPA", "Paris Saint-Germain FC", "FC Barcelona", "AC Milan", "CR Flamengo"], "ابتسامة وسحر؛ الكرة الذهبية 2005 وسنوات برشلونة الساحرة.", "Ronaldinho"],
  ["kaka", "Kaká", "كاكا", "br", "AM", 1982, 93, "2001–2017", ["São Paulo FC", "AC Milan", "Real Madrid CF", "Orlando City SC"], "الكرة الذهبية 2007؛ انطلاقات طويلة بالكرة.", "Kaká"],
  ["distefano", "Alfredo Di Stéfano", "ألفريدو دي ستيفانو", "ar", "ST", 1926, 97, "1945–1966", ["Club Atlético River Plate", "Millonarios F.C.", "Real Madrid CF"], "السهم الأشقر: خمس كؤوس أوروبية متتالية مع ريال مدريد.", "Alfredo Di Stéfano"],
  ["kempes", "Mario Kempes", "ماريو كيمبس", "ar", "ST", 1954, 91, "1970–1996", ["Rosario Central", "Valencia CF", "Club Atlético River Plate"], "الماتادور: هداف مونديال 1978 وبطله.", "Mario Kempes"],
  ["maradona", "Diego Maradona", "دييغو مارادونا", "ar", "AM", 1960, 98, "1976–1997", ["Boca Juniors", "FC Barcelona", "SSC Napoli", "Sevilla FC"], "مونديال 1986 وحده يكفي؛ نابولي لم تنسه.", "Diego Maradona"],
  ["batistuta", "Gabriel Batistuta", "غابرييل باتيستوتا", "ar", "ST", 1969, 92, "1988–2005", ["Club Atlético River Plate", "Boca Juniors", "ACF Fiorentina", "AS Roma", "Inter Milan"], "باتيغول: تسديد مدفعي ووفاء لفيورنتينا.", "Gabriel Batistuta"],
  ["zanetti", "Javier Zanetti", "خافيير زانيتي", "ar", "RB", 1973, 90, "1992–2014", ["Club Atlético Banfield", "Inter Milan"], "القائد: 19 موسمًا مع إنتر وثلاثية 2010.", "Javier Zanetti"],
  ["riquelme", "Juan Román Riquelme", "خوان رومان ريكيلمي", "ar", "AM", 1978, 90, "1996–2015", ["Boca Juniors", "FC Barcelona", "Villarreal CF"], "الإيقاع البطيء القاتل؛ آخر صناع اللعب الكلاسيكيين.", "Juan Román Riquelme", { rivals: ["Club Atlético River Plate"] }],
  ["francescoli", "Enzo Francescoli", "إنزو فرانشيسكولي", "uy", "AM", 1961, 90, "1980–1997", ["Club Atlético River Plate", "Olympique de Marseille"], "الأمير: أناقة أوروغواي ومثال زيدان الأعلى.", "Enzo Francescoli"],
  ["forlan", "Diego Forlán", "دييغو فورلان", "uy", "ST", 1979, 89, "1997–2019", ["Club Atlético Independiente", "Manchester United F.C.", "Villarreal CF", "Atlético Madrid", "Inter Milan", "Peñarol"], "أفضل لاعب في مونديال 2010 وحذاءان ذهبيان أوروبيان.", "Diego Forlán"],
  ["valderrama", "Carlos Valderrama", "كارلوس فالديراما", "co", "AM", 1961, 89, "1981–2004", ["Deportivo Cali", "Atlético Nacional"], "الشعر الذهبي: من أدق ممرري أمريكا الجنوبية في التسعينيات.", "Carlos Valderrama"],
  ["figueroa", "Elías Figueroa", "إلياس فيغيروا", "cl", "CB", 1946, 91, "1964–1982", ["Colo-Colo", "Peñarol", "SC Internacional"], "ثلاث مرات أفضل لاعب في أمريكا الجنوبية؛ مدافع كامل.", "Elías Figueroa"],
  ["zamorano", "Iván Zamorano", "إيفان زامورانو", "cl", "ST", 1967, 88, "1985–2003", ["Sevilla FC", "Real Madrid CF", "Inter Milan", "Club América", "Colo-Colo"], "بام بام: رأسيات لا تُصد وهداف الليغا 1995.", "Iván Zamorano"],
  ["salas", "Marcelo Salas", "مارسيلو سالاس", "cl", "ST", 1974, 89, "1993–2008", ["Club Universidad de Chile", "Club Atlético River Plate", "SS Lazio", "Juventus FC"], "الماتادور: يسرى قاتلة في ويمبلي 1998.", "Marcelo Salas"],
  ["cubillas", "Teófilo Cubillas", "تيوفيلو كوبياس", "pe", "AM", 1949, 89, "1966–1989", ["Alianza Lima", "FC Porto"], "نجم بيرو في مونديالي 1970 و1978؛ عشرة أهداف مونديالية.", "Teófilo Cubillas"],
  ["pizarro", "Claudio Pizarro", "كلاوديو بيزارو", "pe", "ST", 1978, 88, "1996–2020", ["Alianza Lima", "SV Werder Bremen", "FC Bayern Munich", "Chelsea F.C."], "من أكثر الأجانب تسجيلًا في تاريخ البوندسليغا.", "Claudio Pizarro"],
  ["chilavert", "José Luis Chilavert", "خوسيه لويس تشيلافيرت", "py", "GK", 1965, 89, "1982–2004", ["Club Atlético Vélez Sarsfield", "RC Strasbourg Alsace"], "الحارس الهداف: ركلات حرة وجزاء وثلاث مرات أفضل حارس في العالم.", "José Luis Chilavert"],
  ["santacruz", "Roque Santa Cruz", "روكي سانتا كروز", "py", "ST", 1981, 86, "1997–2023", ["Club Olimpia", "FC Bayern Munich", "Manchester City F.C."], "مسيرة امتدت 26 عامًا من أولمبيا إلى بايرن والعودة.", "Roque Santa Cruz"],
  ["etcheverry", "Marco Etcheverry", "ماركو إتشيفيري", "bo", "AM", 1970, 84, "1986–2004", ["Club Bolívar", "D.C. United"], "الشيطان: صانع ألعاب بوليفيا وأيقونة الدوري الأمريكي الأول.", "Marco Etcheverry"],
  ["arango", "Juan Arango", "خوان أرانغو", "ve", "LW", 1980, 85, "1997–2018", ["Borussia Mönchengladbach"], "من أفضل لاعبي فنزويلا في التاريخ؛ يسرى وركلات حرة.", "Juan Arango"],
  ["valencia", "Antonio Valencia", "أنطونيو فالنسيا", "ec", "RB", 1985, 86, "2003–2021", ["LDU Quito", "Manchester United F.C."], "قائد يونايتد وسرعة الجهة اليمنى لعقد كامل.", "Antonio Valencia"],
  // ——— أمريكا الشمالية ———
  ["hugosanchez", "Hugo Sánchez", "هوغو سانشيز", "mx", "ST", 1958, 92, "1976–1997", ["Pumas UNAM", "Atlético Madrid", "Real Madrid CF"], "الشقلبة الاحتفالية وخمسة ألقاب هداف الليغا.", "Hugo Sánchez"],
  ["blanco", "Cuauhtémoc Blanco", "كواوتيموك بلانكو", "mx", "AM", 1973, 86, "1992–2016", ["Club América", "Chicago Fire FC"], "القفزة الشهيرة في مونديال 1998 ورمز أمريكا.", "Cuauhtémoc Blanco"],
  ["marquez", "Rafael Márquez", "رافائيل ماركيز", "mx", "CB", 1979, 90, "1996–2018", ["Atlas F.C.", "AS Monaco FC", "FC Barcelona", "New York Red Bulls", "Club León"], "القيصر المكسيكي: خمس نهائيات كأس عالم وألقاب برشلونة.", "Rafael Márquez"],
  ["donovan", "Landon Donovan", "لاندون دونوفان", "us", "AM", 1982, 84, "1999–2016", ["San Jose Earthquakes", "LA Galaxy", "Everton F.C.", "Bayer 04 Leverkusen"], "أيقونة الكرة الأمريكية وهدف الجزائر 2010.", "Landon Donovan"],
  ["dempsey", "Clint Dempsey", "كلينت ديمبسي", "us", "ST", 1983, 85, "2004–2018", ["Fulham F.C.", "Tottenham Hotspur F.C.", "Seattle Sounders FC"], "أكثر أمريكي تسجيلًا في البريميرليغ.", "Clint Dempsey"],
  // ——— أوروبا ———
  ["cruyff", "Johan Cruyff", "يوهان كرويف", "nl", "AM", 1947, 96, "1964–1984", ["AFC Ajax", "FC Barcelona", "Feyenoord"], "عقل الكرة الشاملة؛ ثلاث كرات ذهبية وفلسفة غيرت اللعبة.", "Johan Cruyff"],
  ["vanbasten", "Marco van Basten", "ماركو فان باستن", "nl", "ST", 1964, 95, "1981–1995", ["AFC Ajax", "AC Milan"], "أجمل هدف في نهائي يورو 1988؛ ثلاث كرات ذهبية قبل الإصابة.", "Marco van Basten"],
  ["gullit", "Ruud Gullit", "رود خوليت", "nl", "AM", 1962, 92, "1979–1998", ["Feyenoord", "PSV Eindhoven", "AC Milan", "Chelsea F.C."], "قوة وأناقة؛ الكرة الذهبية 1987 وقائد يورو 1988.", "Ruud Gullit"],
  ["bergkamp", "Dennis Bergkamp", "دينيس بيركامب", "nl", "AM", 1969, 92, "1986–2006", ["AFC Ajax", "Inter Milan", "Arsenal F.C."], "اللمسة الأولى كفن؛ صانع ألعاب الأرسنال الذهبي.", "Dennis Bergkamp"],
  ["vandersar", "Edwin van der Sar", "إدوين فان دير سار", "nl", "GK", 1970, 91, "1990–2011", ["AFC Ajax", "Juventus FC", "Fulham F.C.", "Manchester United F.C."], "حارس يلعب بقدميه قبل أوانه؛ تصدي نهائي موسكو 2008.", "Edwin van der Sar"],
  ["robben", "Arjen Robben", "آريين روبن", "nl", "RW", 1984, 91, "2000–2021", ["FC Groningen", "PSV Eindhoven", "Chelsea F.C.", "Real Madrid CF", "FC Bayern Munich"], "الحركة المعروفة التي لا تُوقف؛ هدف نهائي 2013.", "Arjen Robben"],
  ["beckenbauer", "Franz Beckenbauer", "فرانز بيكنباور", "de", "CB", 1945, 96, "1964–1983", ["FC Bayern Munich", "Hamburger SV"], "القيصر: مخترع دور الليبرو وبطل العالم لاعبًا ومدربًا.", "Franz Beckenbauer"],
  ["gerdmuller", "Gerd Müller", "غيرد مولر", "de", "ST", 1945, 96, "1963–1981", ["FC Bayern Munich"], "قاذفة الأمم: معدلات تهديفية ما زالت تُروى.", "Gerd Müller"],
  ["matthaus", "Lothar Matthäus", "لوثار ماتيوس", "de", "CM", 1961, 93, "1979–2000", ["Borussia Mönchengladbach", "FC Bayern Munich", "Inter Milan"], "الكرة الذهبية 1990 وخمس نهائيات كأس عالم.", "Lothar Matthäus"],
  ["kahn", "Oliver Kahn", "أوليفر كان", "de", "GK", 1969, 93, "1987–2008", ["FC Bayern Munich"], "التيتان: أفضل لاعب في مونديال 2002 وقائد بايرن.", "Oliver Kahn"],
  ["ballack", "Michael Ballack", "ميكايل بالاك", "de", "CM", 1976, 91, "1995–2012", ["Bayer 04 Leverkusen", "FC Bayern Munich", "Chelsea F.C."], "قائد ألمانيا في مطلع الألفية؛ قوة وتوقيت في التسجيل.", "Michael Ballack"],
  ["klose", "Miroslav Klose", "ميروسلاف كلوزه", "de", "ST", 1978, 89, "1998–2016", ["SV Werder Bremen", "FC Bayern Munich", "SS Lazio"], "هداف كؤوس العالم التاريخي (16 هدفًا).", "Miroslav Klose"],
  ["lahm", "Philipp Lahm", "فيليب لام", "de", "RB", 1983, 91, "2002–2017", ["FC Bayern Munich", "VfB Stuttgart"], "قائد بطل العالم 2014؛ ذكاء موقعي نادر.", "Philipp Lahm"],
  ["schweinsteiger", "Bastian Schweinsteiger", "باستيان شفاينشتايغر", "de", "CM", 1984, 90, "2002–2019", ["FC Bayern Munich", "Manchester United F.C.", "Chicago Fire FC"], "قلب وسط بطل العالم 2014 ونهائي ماراكانا الملحمي.", "Bastian Schweinsteiger"],
  ["maldini", "Paolo Maldini", "باولو مالديني", "it", "CB", 1968, 95, "1984–2009", ["AC Milan"], "25 موسمًا بقميص واحد؛ الدفاع كفن.", "Paolo Maldini", { rivals: ["Inter Milan"] }],
  ["baresi", "Franco Baresi", "فرانكو باريزي", "it", "CB", 1960, 94, "1977–1997", ["AC Milan"], "قائد خط دفاع ميلان الأسطوري في زمن ساكي وكابيلو.", "Franco Baresi", { rivals: ["Inter Milan"] }],
  ["baggio", "Roberto Baggio", "روبرتو باجو", "it", "AM", 1967, 93, "1982–2004", ["ACF Fiorentina", "Juventus FC", "AC Milan", "Bologna FC 1909", "Inter Milan"], "الذيل الإلهي: الكرة الذهبية 1993 وموهبة إيطاليا الأنقى.", "Roberto Baggio"],
  ["buffon", "Gianluigi Buffon", "جانلويجي بوفون", "it", "GK", 1978, 95, "1995–2023", ["Parma Calcio 1913", "Juventus FC", "Paris Saint-Germain FC"], "حارس بطل العالم 2006 وأطول المسيرات في القمة.", "Gianluigi Buffon"],
  ["totti", "Francesco Totti", "فرانشيسكو توتي", "it", "AM", 1976, 92, "1992–2017", ["AS Roma"], "ابن روما وملكها؛ 25 عامًا بقميص واحد.", "Francesco Totti", { rivals: ["SS Lazio"] }],
  ["pirlo", "Andrea Pirlo", "أندريا بيرلو", "it", "DM", 1979, 92, "1995–2017", ["Inter Milan", "AC Milan", "Juventus FC", "New York City FC"], "المهندس: صانع لعب من العمق وركلات حرة دقيقة.", "Andrea Pirlo"],
  ["cannavaro", "Fabio Cannavaro", "فابيو كانافارو", "it", "CB", 1973, 92, "1992–2011", ["SSC Napoli", "Parma Calcio 1913", "Inter Milan", "Juventus FC", "Real Madrid CF"], "الكرة الذهبية 2006 كمدافع؛ قائد بطل العالم.", "Fabio Cannavaro"],
  ["delpiero", "Alessandro Del Piero", "أليساندرو ديل بييرو", "it", "ST", 1974, 92, "1991–2014", ["Juventus FC", "Sydney FC"], "هداف يوفنتوس التاريخي؛ منطقة ديل بييرو.", "Alessandro Del Piero"],
  ["casillas", "Iker Casillas", "إيكر كاسياس", "es", "GK", 1981, 93, "1999–2020", ["Real Madrid CF", "FC Porto"], "القديس: قائد إسبانيا في الثلاثية التاريخية 2008–2012.", "Iker Casillas", { rivals: ["FC Barcelona"] }],
  ["raul", "Raúl", "راؤول", "es", "ST", 1977, 91, "1994–2015", ["Real Madrid CF", "FC Schalke 04", "Al Sadd SC"], "قائد ريال مدريد وهدافه لسنوات؛ الذكاء داخل المنطقة.", "Raúl (footballer)", { rivals: ["FC Barcelona"] }],
  ["puyol", "Carles Puyol", "كارليس بويول", "es", "CB", 1978, 90, "1999–2014", ["FC Barcelona"], "قلب برشلونة وقائده؛ التزام وشراسة بلا حدود.", "Carles Puyol", { rivals: ["Real Madrid CF"] }],
  ["xavi", "Xavi", "تشافي", "es", "CM", 1980, 94, "1998–2019", ["FC Barcelona", "Al Sadd SC"], "مايسترو التيكي تاكا؛ تمرير ورؤية لا تنتهي.", "Xavi", { rivals: ["Real Madrid CF"] }],
  ["iniesta", "Andrés Iniesta", "أندريس إنييستا", "es", "CM", 1984, 94, "2002–2024", ["FC Barcelona", "Vissel Kobe"], "هدف نهائي 2010؛ مراوغة هادئة ووسط لا يفقد الكرة.", "Andrés Iniesta"],
  ["torres", "Fernando Torres", "فرناندو توريس", "es", "ST", 1984, 90, "2001–2019", ["Atlético Madrid", "Liverpool F.C.", "Chelsea F.C.", "AC Milan"], "الطفل: هدف نهائي يورو 2008 وسنوات ليفربول الذهبية.", "Fernando Torres"],
  ["villa", "David Villa", "دافيد فيا", "es", "ST", 1981, 91, "2000–2019", ["Valencia CF", "FC Barcelona", "Atlético Madrid", "New York City FC", "Vissel Kobe"], "هداف إسبانيا التاريخي؛ إنهاء من كل الزوايا.", "David Villa"],
  ["eusebio", "Eusébio", "أوزيبيو", "pt", "ST", 1942, 95, "1957–1979", ["S.L. Benfica"], "النمر الأسود: هداف مونديال 1966 وأسطورة بنفيكا.", "Eusébio"],
  ["figo", "Luís Figo", "لويس فيغو", "pt", "RW", 1972, 92, "1989–2009", ["Sporting CP", "FC Barcelona", "Real Madrid CF", "Inter Milan"], "جناح الكرة الذهبية 2000؛ مراوغة وعرضيات.", "Luís Figo"],
  ["ruicosta", "Rui Costa", "روي كوستا", "pt", "AM", 1972, 90, "1990–2008", ["S.L. Benfica", "ACF Fiorentina", "AC Milan"], "المايسترو البرتغالي؛ تمريرات مفتاحية ورؤية.", "Rui Costa"],
  ["platini", "Michel Platini", "ميشيل بلاتيني", "fr", "AM", 1955, 95, "1972–1987", ["Juventus FC"], "ثلاث كرات ذهبية متتالية؛ صانع الأهداف الهداف.", "Michel Platini"],
  ["zidane", "Zinedine Zidane", "زين الدين زيدان", "fr", "AM", 1972, 96, "1989–2006", ["Juventus FC", "Real Madrid CF"], "أناقة وسيطرة؛ ثنائية نهائي 1998 وأجمل أهداف نهائيات الأبطال.", "Zinedine Zidane"],
  ["henry", "Thierry Henry", "تييري هنري", "fr", "ST", 1977, 94, "1994–2014", ["AS Monaco FC", "Juventus FC", "Arsenal F.C.", "FC Barcelona", "New York Red Bulls"], "هداف الأرسنال التاريخي وملك موسم الـInvincibles.", "Thierry Henry"],
  ["cantona", "Eric Cantona", "إريك كانتونا", "fr", "ST", 1966, 90, "1983–1997", ["AJ Auxerre", "Olympique de Marseille", "Leeds United F.C.", "Manchester United F.C."], "الملك: شخصية غيرت مانشستر يونايتد في التسعينيات.", "Eric Cantona"],
  ["thuram", "Lilian Thuram", "ليليان تورام", "fr", "CB", 1972, 91, "1991–2008", ["AS Monaco FC", "Parma Calcio 1913", "Juventus FC", "FC Barcelona"], "ثنائية نصف نهائي 1998؛ من أكثر لاعبي فرنسا مشاركة.", "Lilian Thuram"],
  ["charlton", "Bobby Charlton", "بوبي تشارلتون", "en", "CM", 1937, 94, "1956–1975", ["Manchester United F.C."], "ناجٍ من ميونيخ وبطل العالم 1966 وأوروبا 1968.", "Bobby Charlton"],
  ["shearer", "Alan Shearer", "آلان شيرر", "en", "ST", 1970, 91, "1988–2006", ["Newcastle United F.C."], "هداف الدوري الإنجليزي التاريخي؛ رأس وقدم لا يرحمان.", "Alan Shearer"],
  ["beckham", "David Beckham", "ديفيد بيكهام", "en", "RW", 1975, 90, "1992–2013", ["Manchester United F.C.", "Real Madrid CF", "LA Galaxy", "AC Milan", "Paris Saint-Germain FC"], "عرضيات وركلات حرة صنعت أيقونة عالمية.", "David Beckham"],
  ["scholes", "Paul Scholes", "بول سكولز", "en", "CM", 1974, 90, "1993–2013", ["Manchester United F.C."], "تمرير طويل مثالي؛ لاعب اللاعبين.", "Paul Scholes", { rivals: ["Liverpool F.C.", "Manchester City F.C."] }],
  ["giggs", "Ryan Giggs", "رايان غيغز", "wa", "LW", 1973, 90, "1990–2014", ["Manchester United F.C."], "أكثر من 900 مباراة بقميص واحد و13 لقب دوري.", "Ryan Giggs", { rivals: ["Liverpool F.C.", "Manchester City F.C."] }],
  ["gerrard", "Steven Gerrard", "ستيفن جيرارد", "en", "CM", 1980, 91, "1998–2016", ["Liverpool F.C.", "LA Galaxy"], "قائد إسطنبول 2005؛ طاقة وتسديد وقيادة.", "Steven Gerrard", { rivals: ["Manchester United F.C.", "Everton F.C."] }],
  ["lampard", "Frank Lampard", "فرانك لامبارد", "en", "CM", 1978, 90, "1995–2016", ["Chelsea F.C.", "Manchester City F.C.", "New York City FC"], "هداف تشيلسي التاريخي من وسط الملعب.", "Frank Lampard"],
  ["rooney", "Wayne Rooney", "واين روني", "en", "ST", 1985, 91, "2002–2021", ["Everton F.C.", "Manchester United F.C.", "D.C. United"], "هداف يونايتد وإنجلترا التاريخي في عصره؛ شراسة وموهبة.", "Wayne Rooney"],
  ["dalglish", "Kenny Dalglish", "كيني دالغليش", "sc", "ST", 1951, 93, "1969–1990", ["Celtic F.C.", "Liverpool F.C."], "الملك كيني: ثلاث كؤوس أوروبية مع ليفربول.", "Kenny Dalglish"],
  ["ceulemans", "Jan Ceulemans", "يان سولمانس", "be", "CM", 1957, 88, "1974–1992", ["Club Brugge KV"], "قائد بلجيكا في مونديال 1986 ووفاء لكلوب بروج.", "Jan Ceulemans"],
  ["sukur", "Hakan Şükür", "هاكان شوكور", "tr", "ST", 1971, 87, "1987–2008", ["Galatasaray S.K. (football)", "Torino FC", "Inter Milan", "Parma Calcio 1913"], "ثور البوسفور: أسرع هدف في تاريخ كأس العالم.", "Hakan Şükür"],
  ["rustu", "Rüştü Reçber", "روشتو رجبر", "tr", "GK", 1973, 87, "1991–2012", ["Fenerbahçe S.K. (football)", "FC Barcelona", "Beşiktaş J.K."], "حارس المركز الثالث في مونديال 2002 بالخطوط السوداء الشهيرة.", "Rüştü Reçber"],
  ["zagorakis", "Theodoros Zagorakis", "ثيودوروس زاغوراكيس", "gr", "DM", 1971, 84, "1988–2007", ["PAOK FC", "AEK Athens F.C."], "قائد اليونان وأفضل لاعب في يورو 2004.", "Theodoros Zagorakis"],
  ["krankl", "Hans Krankl", "هانس كرانكل", "at", "ST", 1953, 87, "1970–1989", ["SK Rapid Wien", "FC Barcelona"], "الحذاء الذهبي الأوروبي 1978 وهداف رابيد فيينا.", "Hans Krankl"],
  ["chapuisat", "Stéphane Chapuisat", "ستيفان شابويزا", "ch", "ST", 1969, 86, "1986–2006", ["Borussia Dortmund"], "بطل دوري الأبطال 1997 وأشهر مهاجم سويسري.", "Stéphane Chapuisat"],
  ["schmeichel", "Peter Schmeichel", "بيتر شمايكل", "dk", "GK", 1963, 93, "1981–2003", ["Brøndby IF", "Manchester United F.C.", "Sporting CP", "Aston Villa F.C.", "Manchester City F.C."], "حارس الثلاثية 1999 وبطل أوروبا 1992 مع الدنمارك.", "Peter Schmeichel"],
  ["laudrup", "Michael Laudrup", "مايكل لاودروب", "dk", "AM", 1964, 93, "1981–1998", ["Brøndby IF", "SS Lazio", "Juventus FC", "FC Barcelona", "Real Madrid CF", "AFC Ajax"], "تمريرة دون نظر؛ الدنماركي الأكثر أناقة.", "Michael Laudrup"],
  ["larsson", "Henrik Larsson", "هنريك لارسون", "se", "ST", 1971, 90, "1988–2013", ["Celtic F.C.", "FC Barcelona", "Manchester United F.C."], "ملك سلتيك والحذاء الذهبي الأوروبي 2001.", "Henrik Larsson"],
  ["ibrahimovic", "Zlatan Ibrahimović", "زلاتان إبراهيموفيتش", "se", "ST", 1981, 93, "1999–2023", ["Malmö FF", "AFC Ajax", "Juventus FC", "Inter Milan", "FC Barcelona", "AC Milan", "Paris Saint-Germain FC", "Manchester United F.C.", "LA Galaxy"], "أهداف أكروباتية وشخصية طاغية في تسعة أندية كبرى.", "Zlatan Ibrahimović"],
  ["solskjaer", "Ole Gunnar Solskjær", "أولي غونار سولشاير", "no", "ST", 1973, 86, "1990–2007", ["Molde FK", "Manchester United F.C."], "القاتل ذو الوجه الطفولي؛ هدف الدقيقة 93 في نهائي 1999.", "Ole Gunnar Solskjær"],
  ["boniek", "Zbigniew Boniek", "زبيغنيف بونيك", "pl", "AM", 1956, 90, "1975–1988", ["Widzew Łódź", "Juventus FC", "AS Roma"], "جميل الليل: نجم بولندا في مونديالي 1978 و1982.", "Zbigniew Boniek"],
  ["nedved", "Pavel Nedvěd", "بافل نيدفيد", "cz", "AM", 1972, 92, "1991–2009", ["AC Sparta Prague", "SS Lazio", "Juventus FC"], "الكرة الذهبية 2003؛ طاقة وتسديد من الجهتين.", "Pavel Nedvěd"],
  ["cech", "Petr Čech", "بيتر تشيك", "cz", "GK", 1982, 91, "1999–2019", ["AC Sparta Prague", "Chelsea F.C.", "Arsenal F.C."], "الخوذة الشهيرة وأكثر الشباك نظافة في تاريخ البريميرليغ.", "Petr Čech"],
  ["suker", "Davor Šuker", "دافور شوكر", "hr", "ST", 1968, 89, "1984–2003", ["GNK Dinamo Zagreb", "Sevilla FC", "Real Madrid CF", "Arsenal F.C."], "الحذاء الذهبي لمونديال 1998 مع كرواتيا.", "Davor Šuker"],
  ["dzajic", "Dragan Džajić", "دراغان دجاييتش", "rs", "LW", 1946, 91, "1963–1978", ["Red Star Belgrade"], "الجناح الساحر للنجم الأحمر؛ ثالث الكرة الذهبية 1968.", "Dragan Džajić"],
  ["hagi", "Gheorghe Hagi", "جورجي هاجي", "ro", "AM", 1965, 91, "1982–2001", ["Real Madrid CF", "FC Barcelona", "Galatasaray S.K. (football)"], "مارادونا الكاربات؛ يسرى ساحرة وألقاب مع غلطة سراي.", "Gheorghe Hagi"],
  ["blokhin", "Oleh Blokhin", "أوليغ بلوخين", "ua", "LW", 1952, 92, "1969–1990", ["FC Dynamo Kyiv"], "الكرة الذهبية 1975 وهداف الاتحاد السوفيتي التاريخي.", "Oleh Blokhin"],
  ["shevchenko", "Andriy Shevchenko", "أندريه شيفتشينكو", "ua", "ST", 1976, 92, "1994–2012", ["FC Dynamo Kyiv", "AC Milan", "Chelsea F.C."], "الكرة الذهبية 2004 وهداف ميلان في نهائيات الأبطال.", "Andriy Shevchenko"],
  ["yashin", "Lev Yashin", "ليف ياشين", "ru", "GK", 1929, 95, "1950–1970", ["FC Dynamo Moscow"], "العنكبوت الأسود: الحارس الوحيد الفائز بالكرة الذهبية (1963).", "Lev Yashin"],
  ["arshavin", "Andrey Arshavin", "أندريه أرشافين", "ru", "AM", 1981, 87, "2000–2018", ["FC Zenit Saint Petersburg", "Arsenal F.C."], "نجم يورو 2008 ورباعية أنفيلد.", "Andrey Arshavin"],
  ["puskas", "Ferenc Puskás", "فيرينتس بوشكاش", "hu", "ST", 1927, 96, "1943–1966", ["Kispest Honvéd FC", "Real Madrid CF"], "الرائد الراكض: قدم يسرى أسطورية وأهداف بالجملة.", "Ferenc Puskás"],
  ["stoichkov", "Hristo Stoichkov", "خريستو ستويتشكوف", "bg", "LW", 1966, 91, "1982–2003", ["FC Barcelona", "Parma Calcio 1913", "Al-Nassr FC"], "الكرة الذهبية 1994 ونجم فريق أحلام كرويف.", "Hristo Stoichkov"],
  // ——— آسيا وأستراليا ———
  ["nakata", "Hidetoshi Nakata", "هيديتوشي ناكاتا", "jp", "AM", 1977, 86, "1995–2006", ["AS Roma", "Parma Calcio 1913", "Bologna FC 1909", "ACF Fiorentina"], "أول نجم ياباني في الكالتشيو؛ تمرير ورؤية.", "Hidetoshi Nakata"],
  ["parkjisung", "Park Ji-sung", "بارك جي سونغ", "kr", "RW", 1981, 85, "2000–2014", ["Kyoto Sanga FC", "PSV Eindhoven", "Manchester United F.C."], "ثلاث رئات: أول آسيوي يلعب نهائي دوري الأبطال.", "Park Ji-sung"],
  ["hongmyungbo", "Hong Myung-bo", "هونغ ميونغ بو", "kr", "CB", 1969, 87, "1992–2004", ["Pohang Steelers", "Kashiwa Reysol", "LA Galaxy"], "قائد كوريا في نصف نهائي مونديال 2002.", "Hong Myung-bo"],
  ["haohaidong", "Hao Haidong", "هاو هايدونغ", "cn", "ST", 1970, 84, "1986–2007", [], "هداف الصين التاريخي ونجمها في مونديال 2002.", "Hao Haidong"],
  ["bhutia", "Bhaichung Bhutia", "بايتشونغ بوتيا", "in", "ST", 1976, 80, "1993–2015", ["East Bengal FC", "Mohun Bagan Super Giant"], "كوبرا سيكيم: أول هندي يحترف في أوروبا.", "Bhaichung Bhutia"],
  ["kiatisuk", "Kiatisuk Senamuang", "كياتيسوك سينامونغ", "th", "ST", 1973, 82, "1989–2007", [], "زيكو: هداف تايلاند وبطولات جنوب شرق آسيا.", "Kiatisuk Senamuang"],
  ["kewell", "Harry Kewell", "هاري كيويل", "au", "LW", 1978, 87, "1995–2014", ["Leeds United F.C.", "Liverpool F.C.", "Galatasaray S.K. (football)", "Melbourne Victory FC"], "من أفضل لاعبي أستراليا في التاريخ؛ بطل إسطنبول 2005.", "Harry Kewell"],
  ["cahill", "Tim Cahill", "تيم كاهيل", "au", "AM", 1979, 84, "1997–2018", ["Everton F.C.", "New York Red Bulls", "Shanghai Shenhua F.C.", "Melbourne City FC"], "رأسيات لا تُصد وأهداف في ثلاث نهائيات كأس عالم.", "Tim Cahill"],
];

const LEGACY_IDS = new Set(["ahly", "zamalek", "ismaily", "masry", "ittihad", "pyramids"]);
const CLUB_INDEX = new Map();
for (const c of WORLD_CLUBS) {
  const id = gameClubId(c);
  if (c.name && !CLUB_INDEX.has(c.name)) CLUB_INDEX.set(c.name, id);
  if (c.wiki && !CLUB_INDEX.has(c.wiki)) CLUB_INDEX.set(c.wiki, id);
}

export const resolveLegendClub = (name) =>
  LEGACY_IDS.has(name) ? name : CLUB_INDEX.get(name) || null;

const TEMPLATES = {
  GK: { pace: -30, passing: -25, shooting: -55, defending: 0, stamina: -15, decisions: -2 },
  CB: { pace: -12, passing: -15, shooting: -35, defending: 0, stamina: -8, decisions: -3 },
  RB: { pace: -3, passing: -8, shooting: -25, defending: -4, stamina: 0, decisions: -8 },
  LB: { pace: -3, passing: -8, shooting: -25, defending: -4, stamina: 0, decisions: -8 },
  DM: { pace: -12, passing: -4, shooting: -20, defending: -6, stamina: -3, decisions: -2 },
  CM: { pace: -10, passing: 0, shooting: -14, defending: -18, stamina: -2, decisions: -1 },
  AM: { pace: -8, passing: 0, shooting: -6, defending: -35, stamina: -10, decisions: 0 },
  RW: { pace: 0, passing: -8, shooting: -8, defending: -38, stamina: -8, decisions: -6 },
  LW: { pace: 0, passing: -8, shooting: -8, defending: -38, stamina: -8, decisions: -6 },
  ST: { pace: -6, passing: -16, shooting: 0, defending: -45, stamina: -8, decisions: -3 },
};

export const legendGroup = (position) =>
  Object.values(LEGEND_GROUPS).find((g) => g.positions.includes(position))?.id || "attack";

export const legendTier = (peak) =>
  peak >= 94
    ? { id: "icon", name: "أيقونة عالمية" }
    : peak >= 90
      ? { id: "legend", name: "أسطورة" }
      : { id: "star", name: "نجم تاريخي" };

export function legendAttributes(position, peak) {
  const t = TEMPLATES[position] || TEMPLATES.ST;
  const out = {};
  for (const k of Object.keys(t)) out[k] = clamp(Math.round(peak + t[k]), 20, 99);
  return out;
}

export const legendCountryName = (code) =>
  marketBy(code)?.nameAr || COUNTRY_NAMES[code] || code;

export const LEGENDS = ROWS.map(
  ([id, nameLatin, name, country, position, born, peak, era, clubs, bio, wiki, options = {}]) => ({
    id,
    name,
    nameLatin,
    country,
    countryName: legendCountryName(country),
    position,
    group: legendGroup(position),
    born,
    peak,
    tier: legendTier(peak),
    era,
    clubs,
    clubIds: clubs.map(resolveLegendClub).filter(Boolean),
    rivals: options.rivals || [],
    rivalIds: (options.rivals || []).map(resolveLegendClub).filter(Boolean),
    bio,
    wiki,
    biographyUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.replace(/ /g, "_"))}`,
    attributes: legendAttributes(position, peak),
    sourceStatus: LEGEND_SOURCE_STATUS,
  }),
);

const BY_ID = new Map(LEGENDS.map((l) => [l.id, l]));
export const legendById = (id) => BY_ID.get(id) || null;
export const LEGEND_COUNTRIES = [...new Set(LEGENDS.map((l) => l.country))];
