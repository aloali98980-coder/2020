import { campaignTick } from "./campaign.js";
import { committeeDay } from "./committees.js";
import { foreignDay } from "./foreign.js";
import { integrityDay } from "./integrity.js";
import { oppositionDay } from "./opposition.js";
import { politicalEventDay } from "./events.js";
import { ensurePolitics, reconcilePoliticalMap } from "./state.js";

export function politicsDay(s) {
  const politics = ensurePolitics(s);
  const month = s.date.slice(0, 7);
  if (politics.mapCheckMonth !== month) {
    reconcilePoliticalMap(s);
    politics.mapCheckMonth = month;
  }
  campaignTick(s);
  committeeDay(s);
  integrityDay(s);
  oppositionDay(s);
  foreignDay(s);
  politicalEventDay(s);
}
