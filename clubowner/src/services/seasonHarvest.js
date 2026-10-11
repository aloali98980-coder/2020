// الدفعة 6 — القسم 4: حصاد الموسم. مصادر فعلية فقط: تاريخ المواسم (الجدول والإحصاءات المؤرشفة)،
// وحفل الجوائز المحفوظ في قاعة المشاهير، والرسائل المهمة داخل نافذة الموسم.
import { AWARD_DEFS } from "../data/awardsTexts.js";

export const HARVEST_MAX_MOMENTS = 5;

export function lastSeason(s, number = null) {
  const history = s.seasonHistory || [];
  if (!history.length) return null;
  return number == null
    ? history[history.length - 1]
    : history.find((h) => h.number === number) || null;
}

// بداية الموسم: تاريخ الموسم السابق، أو قبل سنة من نهاية هذا الموسم لأول موسم.
function seasonStart(s, entry) {
  const history = s.seasonHistory || [];
  const i = history.indexOf(entry);
  if (i > 0) return history[i - 1].date;
  return `${Number(entry.date.slice(0, 4)) - 1}${entry.date.slice(4)}`;
}

export function harvestFor(s, number = null) {
  const entry = lastSeason(s, number);
  if (!entry) return null;
  const table = entry.table || [];
  const idx = table.findIndex((r) => r.clubId === s.clubId);
  const own = idx >= 0 ? table[idx] : null;
  const champion = table[0] || null;

  // الهداف: أعلى seasonGoals في الإحصاءات المؤرشفة، واسمه من اللاعبين إن ما زال موجودًا.
  let topScorer = null;
  for (const [id, st] of Object.entries(entry.playerStats || {})) {
    if (!topScorer || (st.seasonGoals || 0) > topScorer.goals) {
      const p = (s.players || []).find((x) => x.id === id);
      topScorer = p ? { id, name: p.name, goals: st.seasonGoals || 0 } : { id, name: null, goals: st.seasonGoals || 0 };
    }
  }
  if (topScorer && !(topScorer.goals > 0)) topScorer = null;

  const hall = (s.awards?.hall || []).find((h) => h.season === entry.number);
  const awards = hall
    ? Object.entries(hall.awards || {})
        .filter(([, w]) => w)
        .map(([id, w]) => {
          const list = Array.isArray(w) ? w : [w];
          return list.map((x) => ({
            id,
            label: AWARD_DEFS[id]?.name ?? null, // {ar,en,fr}
            winner: x.name || null,
            winnerLatin: x.nameLatin || x.name || null,
            own: Boolean(x.own),
          }));
        })
        .flat()
    : [];

  const from = seasonStart(s, entry);
  const moments = (s.inbox || [])
    .filter((m) => m.priority === "high" && m.date > from && m.date <= entry.date)
    .slice(0, HARVEST_MAX_MOMENTS)
    .map((m) => ({ date: m.date, title: m.title }));

  return {
    number: entry.number,
    date: entry.date,
    champion: champion ? { clubId: champion.clubId, own: champion.clubId === s.clubId } : null,
    ownPosition: idx >= 0 ? idx + 1 : null,
    own,
    topScorer,
    awards,
    moments,
  };
}
