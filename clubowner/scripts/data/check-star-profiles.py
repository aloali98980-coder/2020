"""Consistency check for src/data/starProfiles.js against the world pack.

Every star key must be the exact English Wikipedia title of a row in
src/data/packs/world/players.json (that is how packs/world.js applies the
editorial profile). Prints dead keys with fuzzy suggestions, duplicate keys,
out-of-range ratings, and age sanity notes (old players rated high, potential
given to players over 23). Exit code 1 when a hard problem exists.

Usage: python3 scripts/data/check-star-profiles.py
"""
import ast, difflib, json, pathlib, re, sys, unicodedata, collections

ROOT = pathlib.Path(__file__).resolve().parents[2]
PACK = ROOT / "src/data/packs/world"
STARS = ROOT / "src/data/starProfiles.js"
POSITIONS = {"GK", "CB", "RB", "LB", "DM", "CM", "AM", "RW", "LW", "ST"}
ASOF_YEAR = 2026


def fold(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s).lower() if c.isalnum() and not unicodedata.combining(c))


def star_rows():
    rows = []
    for line in STARS.read_text(encoding="utf-8").splitlines():
        if not line.startswith(" ["):
            continue
        py = re.sub(r"([{,])(\w+):", r"\1'\2':", line.strip().rstrip(","))
        rows.append(list(ast.literal_eval(py)))
    return rows


def main():
    players = json.loads((PACK / "players.json").read_text(encoding="utf-8"))
    by_wiki = {p["wiki"]: p for p in players if p.get("wiki")}
    by_fold = collections.defaultdict(list)
    for p in players:
        by_fold[fold(re.sub(r"\s*\(.*\)", "", p.get("wiki") or p["name"]))].append(p.get("wiki") or p["name"])
    rows = star_rows()
    hard, notes = [], []
    seen = collections.Counter(r[0] for r in rows)
    for k, n in seen.items():
        if n > 1:
            hard.append(f"duplicate key: {k} x{n}")
    for r in rows:
        wiki, name_ar, rating, pos = r[0], r[1], r[2], r[3]
        attrs = r[4] if len(r) > 4 else {}
        pot = r[5] if len(r) > 5 else None
        if wiki not in by_wiki:
            cands = by_fold.get(fold(re.sub(r"\s*\(.*\)", "", wiki))) or difflib.get_close_matches(wiki, list(by_wiki), n=3, cutoff=0.8)
            hard.append(f"dead key: {wiki!r} -> suggestions {cands}")
            continue
        if not 38 <= rating <= 94:
            hard.append(f"rating out of range: {wiki} {rating}")
        if pos not in POSITIONS:
            hard.append(f"bad position: {wiki} {pos}")
        if any(not 30 <= v <= 99 for v in attrs.values()):
            hard.append(f"attribute out of range: {wiki} {attrs}")
        if not name_ar or not re.search(r"[\u0600-\u06FF]", name_ar):
            hard.append(f"missing Arabic name: {wiki}")
        p = by_wiki[wiki]
        year = int(p["birthDate"][:4]) if p.get("birthDate") else None
        age = ASOF_YEAR - year if year else None
        if pot is not None:
            if pot < rating:
                hard.append(f"potential below rating: {wiki}")
            if age is not None and age > 23:
                notes.append(f"potential given to a player aged {age}: {wiki}")
        if age is not None and age >= 34 and rating >= 82:
            notes.append(f"age {age} rated {rating}: {wiki}")
        if age is not None and age <= 19 and rating >= 84:
            notes.append(f"age {age} rated {rating}: {wiki}")
    leagues = collections.Counter(by_wiki[r[0]]["league"] for r in rows if r[0] in by_wiki)
    print(f"star profiles: {len(rows)} rows, {len(rows) - sum(1 for h in hard if h.startswith('dead key'))} resolved")
    print("per market:", dict(leagues.most_common()))
    for n in notes:
        print("  note:", n)
    for h in hard:
        print("  PROBLEM:", h)
    return 1 if hard else 0


if __name__ == "__main__":
    sys.exit(main())
