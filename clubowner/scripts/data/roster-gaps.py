"""Writes docs/ROSTER-GAPS.md — an honest gap report for the world pack:
clubs without players, thin squads (<18), per-market unknown-birthday share,
identity/birth methods, conflicts still excluded, and star-profile coverage.

Usage: python3 scripts/data/roster-gaps.py
"""
import ast, collections, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
PACK = ROOT / "src/data/packs/world"
OUT = ROOT / "docs/ROSTER-GAPS.md"


def load(name):
    return json.loads((PACK / name).read_text(encoding="utf-8"))


def star_keys():
    keys = []
    for line in (ROOT / "src/data/starProfiles.js").read_text(encoding="utf-8").splitlines():
        if line.startswith(" ["):
            py = re.sub(r"([{,])(\w+):", r"\1'\2':", line.strip().rstrip(","))
            keys.append(ast.literal_eval(py)[0])
    return keys


def main():
    players, clubs, leagues, manifest = load("players.json"), load("clubs.json"), load("leagues.json"), load("manifest.json")
    conflicts = load("conflicts.json").get("ambiguous", [])
    by_club = collections.Counter(p["clubId"] for p in players)
    league_name = {l["id"]: l.get("nameAr") or l.get("name") or l["id"] for l in leagues}
    empty = [c for c in clubs if not by_club[c["id"]]]
    thin = [c for c in clubs if 0 < by_club[c["id"]] < 18]
    stars = set(star_keys())
    star_by_league = collections.Counter(p["league"] for p in players if p.get("wiki") in stars)
    lines = [
        "# فجوات القوائم — تقرير آلي (0.18)",
        "",
        f"مُولَّد من `scripts/data/roster-gaps.py` على الحزمة `{manifest['id']}` (لقطة {manifest['asOf']}"
        + (f"، مكمَّلة {manifest['supplementedOn']}" if manifest.get("supplementedOn") else "") + ").",
        "",
        "## ملخص",
        "",
        f"- الأندية: {len(clubs)} — بلا لاعبين: {len(empty)} — أقل من 18 لاعبًا: {len(thin)}",
        f"- اللاعبون: {len(players)} — بهوية ويكي بيانات: {manifest.get('wikidataIdentityMatches', 0)} — بلا تاريخ ميلاد موثق: {manifest['unknownBirthDates']} ({manifest['unknownBirthDates'] * 100 // max(1, len(players))}٪)",
        f"- تضاربات ما زالت مستبعدة (اسم واحد في أكثر من نادٍ بلا دليل حاسم): {len(conflicts)}",
        f"- ملفات النجوم التحريرية: {len(stars)} مفتاحًا، منها {sum(star_by_league.values())} مطابقة لصفوف الحزمة",
        "",
        "## طرق تحديد الهوية وتاريخ الميلاد",
        "",
        "| الطريقة | الهوية | تاريخ الميلاد |",
        "|---|---|---|",
    ]
    im, bm = manifest.get("identityMethods", {}), manifest.get("birthMethods", {})
    for k in sorted(set(im) | set(bm), key=lambda x: -(im.get(x, 0) + bm.get(x, 0))):
        lines.append(f"| `{k}` | {im.get(k, '')} | {bm.get(k, '')} |")
    lines += [
        "",
        "`article` = مقال إنجليزي مرتبط بعنصر ويكي بيانات؛ `redirect` = عنوان أُعيد توجيهه/أُعيدت تسميته؛ `nationality-name`/`club-name` = مطابقة اسم فريدة بين لاعبي نفس الجنسية أو النادي (مسجَّلة كطريقة وليست توثيقًا مستقلًا)؛ `arwiki-*`/`frwiki-*`/`eswiki-*` = صف نفس النادي في جدول تشكيلة ويكيبيديا العربية/الفرنسية/الإسبانية (sitelink/item/name/number/fuzzy = طريقة المطابقة؛ الجداول الفرنسية والإسبانية تحمل تاريخ الميلاد نفسه)؛ `openfootball-name` = تاريخ ميلاد من openfootball (CC0) باسم فريد؛ `unknown` = عمر محاكاة موزَّع (18–36) ومعلَّم بـ «~».",
        "",
        "## الأندية بلا لاعبين",
        "",
    ]
    lines += [f"- {c['name']} ({league_name.get(c['league'], c['league'])}) — {c.get('error') or c.get('status') or ''}" for c in empty] or ["- لا يوجد."]
    lines += ["", "## الأندية الرقيقة (أقل من 18 لاعبًا)", ""]
    lines += [f"- {c['name']} ({league_name.get(c['league'], c['league'])}) — {by_club[c['id']]} لاعبًا" for c in sorted(thin, key=lambda c: by_club[c["id"]])] or ["- لا يوجد."]
    lines += ["", "## القوائم المكمَّلة من نسخة لغوية أخرى لويكيبيديا", ""]
    lines += [f"- {s['club']} ← {s['lang']}.wikipedia ({s['rows']} صفًا)" for s in manifest.get("supplementedClubs", [])] or ["- لا يوجد."]
    lines += ["", "## نسبة الأعمار غير الموثقة لكل سوق", "", "| السوق | اللاعبون | بلا تاريخ ميلاد | ٪ | نجوم تحريريون |", "|---|---|---|---|---|"]
    for l in sorted(leagues, key=lambda l: l["id"]):
        rows = [p for p in players if p["league"] == l["id"]]
        unk = sum(1 for p in rows if not p["birthDate"])
        lines.append(f"| {league_name.get(l['id'], l['id'])} (`{l['id']}`) | {len(rows)} | {unk} | {unk * 100 // max(1, len(rows))} | {star_by_league.get(l['id'], 0)} |")
    lines += ["", "## ما لا تفعله الحزمة", "",
              "- لا تخترع أسماء: كل صف من جدول تشكيلة منشور على ويكيبيديا (بالإنجليزية أو نسخة لغوية أخرى).",
              "- لا تدّعي اكتمال قوائم 2026/27 الرسمية (`sourceComplete:false`، `verifiedCurrentRegistration:false`).",
              "- القدرات والعقود والقيم تقديرات لعبة؛ ملفات النجوم تحريرية وليست تقييمات واقعية."]
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("wrote", OUT.relative_to(ROOT), "| empty", len(empty), "thin", len(thin), "conflicts", len(conflicts))


if __name__ == "__main__":
    main()
