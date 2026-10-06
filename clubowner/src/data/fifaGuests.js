// Club names verified against the official OFC Pro League site (2026-09-26).
// No invented clubs, no new selectable leagues, no imported player registrations.
export const OFC_AUCKLAND = "wiki-cad37cca741f";
export const FIFA_GUESTS = [
  ["ofc-bula", "Bula FC", "fj", 55],
  ["ofc-hekari", "PNG Hekari FC", "pg", 56],
  ["ofc-solomon", "Solomon Kings FC", "sb", 53],
  ["ofc-south-island", "South Island United", "nz", 59],
  ["ofc-tahiti", "Tahiti United", "pf", 54],
  ["ofc-vanuatu", "Vanuatu United FC", "vu", 53],
].map(([id, name, country, rep]) => ({
  id,
  name,
  wiki: name,
  short: name,
  initial: name[0],
  country,
  rep,
  overall: rep,
  tier: 1,
  cupOnly: true,
  selectable: false,
  capacity: 10000,
  cash: 20000000,
  color: "#397f91",
  city: country,
  desc: "نادٍ حقيقي مشارك في مسار أوقيانوسيا الخفيف؛ القوة والمنشآت تقديرية ولا توجد قائمة لاعبين معتمدة",
  sourceUrl: "https://www.ofcproleague.com/",
  reviewedOn: "2026-09-26",
}));
export const OFC_ENTRANTS = [OFC_AUCKLAND, ...FIFA_GUESTS.map((c) => c.id)];
