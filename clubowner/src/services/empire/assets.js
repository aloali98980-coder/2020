// أصول «حياة الملياردير» 0.29 — الشراء والبيع والصيانة الشهرية ومرحلة القصر.
// الشراء من الثروة الشخصية 💎 فقط؛ خزينة النادي لا تُمسّ. أصل واحد من كل نوع
// (لا معنى ليختين من الطراز نفسه في المرسى نفسه). الصيانة تُخصم أول كل شهر
// عبر خطاف التسوية الشهرية، والعجز يتحول دينًا مثل مصروف المعيشة.
import { assert, clamp, uid } from "../../core/utils.js";
import { message } from "../inbox.js";
import { assetById, PALACE_TIERS } from "../../data/empireAssets.js";
import { empireText } from "../../data/empireTexts.js";
import {
  ensureEmpire,
  personalExpense,
  registerEmpireMonthHook,
} from "./wealth.js";

// يملأ متغيرات {asset}/{money}/{upkeep} في نص مترجم واحد.
const fill = (tpl, vars) =>
  Object.entries(vars).reduce((t, [k, v]) => t.split("{" + k + "}").join(v), tpl);

export function ownedAssets(s) {
  return (s.empire?.assets || []).map((o) => ({
    ...o,
    asset: assetById(o.assetId),
  }));
}

export const owns = (s, assetId) =>
  (s.empire?.assets || []).some((a) => a.assetId === assetId);

export function buyAsset(s, assetId) {
  const e = ensureEmpire(s);
  const def = assetById(assetId);
  assert(def, empireText("assetUnknown"));
  assert(!owns(s, assetId), empireText("assetOwned"));
  assert(e.personal >= def.price, empireText("assetTooExpensive"));
  e.personal -= def.price;
  e.monthTrack.expenses += def.price;
  e.assets.push({
    id: uid(s, "asset"),
    assetId,
    boughtOn: s.date,
    price: def.price,
    sellValue: Math.round(def.price * def.sellPct),
  });
  e.prestige = clamp(e.prestige + def.prestige, 0, 400);
  e.fame = clamp(e.fame + 1, 0, 100);
  message(s, {
    title: empireText("assetBoughtTitle"),
    body: fill(empireText("assetBoughtBody"), {
      asset: def.name.ar,
      money: String(def.price),
      upkeep: String(def.upkeep),
    }),
    category: "events",
  });
  return e.assets.at(-1);
}

export function sellAsset(s, ownershipId) {
  const e = ensureEmpire(s);
  const idx = e.assets.findIndex((a) => a.id === ownershipId);
  assert(idx >= 0, empireText("assetMissing"));
  const owned = e.assets[idx];
  const def = assetById(owned.assetId);
  e.personal += owned.sellValue;
  e.monthTrack.income += owned.sellValue;
  e.assets.splice(idx, 1);
  e.prestige = clamp(e.prestige - (def?.prestige || 0), 0, 400);
  message(s, {
    title: empireText("assetSoldTitle"),
    body: fill(empireText("assetSoldBody"), {
      asset: def?.name.ar || owned.assetId,
      money: String(owned.sellValue),
    }),
    category: "events",
  });
  return owned.sellValue;
}

// مرحلة القصر البصري: أعلى سكن مملوك (شقة ← فيلا ← قصر ← جزيرة).
export function palaceTier(s) {
  let best = 0;
  for (const o of s.empire?.assets || []) {
    const def = assetById(o.assetId);
    if (def?.cat === "home" && (def.tier || 0) > best) best = def.tier;
  }
  return best;
}

export const palaceStage = (s) =>
  PALACE_TIERS.find((t) => t.tier === palaceTier(s)) || PALACE_TIERS[0];

// الصيانة الشهرية لكل الأصول المملوكة.
export function totalUpkeep(s) {
  return (s.empire?.assets || []).reduce(
    (sum, o) => sum + (assetById(o.assetId)?.upkeep || 0),
    0,
  );
}

function upkeepMonthHook(s) {
  const e = ensureEmpire(s);
  const upkeep = totalUpkeep(s);
  if (upkeep <= 0) return {};
  const shortfall = personalExpense(s, upkeep);
  if (shortfall > 0) {
    e.debt += shortfall;
    message(s, {
      title: empireText("upkeepShortTitle"),
      body: empireText("upkeepShortBody"),
      category: "events",
    });
  }
  return { upkeep };
}
registerEmpireMonthHook(upkeepMonthHook);
