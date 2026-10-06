"""0.18 step 7b — birthdays and identities from the same club's squad table in
another Wikipedia language edition (Arabic, French, Spanish).

Why: after the English import + Wikidata passes, the Arab, Maghreb and Latin
American markets still had 50–75 % of rows without a birthday, because those
players have no English article and no Wikidata item. The club article in the
regional language edition lists the same squad, and
  * French  {{Feff joueur|num=|prénom=|nom=|pos=|jour=|mois=|an=}} and
  * Spanish {{Jugador de fútbol|num=|name=[[..]]|pos=|edad={{edad|d|m|y}}}}
carry the birthday inside the table row, while
  * Arabic  {{تشكيلة لاعب|الرقم=|مركز=|اسم=[[..]]}} links Arabic articles whose
    Wikidata items carry the birthday.

Per club: 1) find the regional article through Wikidata sitelinks; 2) parse the
FIRST senior table (sections about loans/reserves/youth/women/former players are
skipped, at least 11 rows); 3) resolve linked titles to items (labels, aliases,
enwiki sitelink, P569 day precision, P570); 4) match table rows to our rows that
still lack an item or a birthday, one table row per player, in this order:
     <lang>wiki-sitelink : item's English sitelink == our (red-link) title
     <lang>wiki-item     : item == our row's item (birthday only)
     <lang>wiki-name     : folded names equal (or same word set), unique on both sides
     <lang>wiki-number   : same shirt number + position group as the pinned English
                           revision, table is a 2026/27 (or 2026) list, spellings
                           >= 0.6 similar or sharing a name word
     <lang>wiki-fuzzy    : same position group, folded names >= 0.85 similar, unique
5) write to identity-supplement.json:
     matches[clubId|name]   item identity for rows without one (never overwritten)
     birthdays[clubId|name] birthday + permalink for rows without one (never overwritten)
     tableSources[clubId]   the consulted pages (for the attribution page)
   finish-world.py writes the method into identityMethod / biographyMethod.
Facts only: no row is invented, nothing is guessed when two candidates remain,
Wikidata's single day-precision birthday wins over a table date, a table date
that contradicts Wikidata is dropped (dobConflict), and a table date replaces
only the weaker openfootball unique-name fallback (recorded as `replaces`).

Usage: python3 scripts/data/squad-tables.py                 # whole plan below
       python3 scripts/data/squad-tables.py fr tn ma dz     # one language, given markets
       python3 scripts/data/squad-tables.py --prune         # re-apply the number-match spelling rule offline
"""
import collections, datetime, difflib, json, re, sys, urllib.parse
import mwparserfromhell as mw
from worldlib import api, fold, load_json, dump_json, SUPPLEMENTED_ON

PLAN = [("fr", ["tn", "ma", "dz"]),
        ("ar", ["eg", "sa", "qa", "ae", "tn", "ma", "dz"]),
        ("es", ["co", "bo", "uy", "ar", "ve", "pe", "cl", "py", "ec"])]
HOST = {"ar": "ar.wikipedia.org", "fr": "fr.wikipedia.org", "es": "es.wikipedia.org"}
ROW_TEMPLATES = {
    "ar": {"تشكيلة لاعب", "لاعب تشكيلة كرة قدم", "fs player", "football squad player", "fs2 player"},
    "fr": {"feff joueur", "fs player", "football squad player"},
    "es": {"jugador de fútbol", "jugador de fútbol con esquema", "fs player", "football squad player", "fs2 player"},  # "jugador de fútbol cedido" = loaned out, ignored
}
END_TEMPLATES = {"تشكيلة نهاية", "نهاية تشكيلة كرة قدم", "نهاية تشكيلة فريق كرة قدم", "feff fin", "plantilla de fútbol final",
                 "fs end", "football squad end", "fs2 end", "football squad end2"}
START_TEMPLATES = {"تشكيلة بداية", "تشكيلة فريق كرة قدم", "feff début", "plantilla de fútbol inicio", "fs start", "football squad start", "fs2 start"}
BAD_HEADING = re.compile(r"معار|إعارة|رديف|شباب|ناشئ|تحت|سيدات|سابق|أساطير|تاريخ|أكاديمية|منتخب|قدامى|"
                         r"réserve|espoirs|prêt|féminin|jeunes|anciens|"
                         r"cedidos|préstamo|filial|reserva|juvenil|femenin|históric|ex-?jugadores|"
                         r"\bU-?\d\d\b|sub-?\d\d|women|reserves|youth|loan", re.I)  # staff headings are not excluded: they never hold 11 player rows
LATIN_POS = {"gk": "GK", "g": "GK", "por": "GK", "df": "DF", "d": "DF", "def": "DF", "lat": "DF", "mf": "MF", "m": "MF", "med": "MF",
             "cen": "MF", "vol": "MF", "fw": "FW", "a": "FW", "del": "FW", "ext": "FW"}
ARABIC_POS = [(r"حارس|حراسة", "GK"), (r"دفاع|مدافع|ظهير|قلب", "DF"), (r"وسط|ارتكاز|صانع", "MF"), (r"هجوم|مهاجم|جناح", "FW")]
DOB_TEMPLATES = {"edad": "dmy", "edad2": "dmy", "fecha de nacimiento y edad": "dmy", "birth date and age": "ymd", "date de naissance": "dmy", "عمر": "ymd", "تاريخ الميلاد والعمر": "ymd"}
MIN_ROWS = 11


def txt(value):
    return re.sub(r"\s+", " ", mw.parse(str(value)).strip_code()).strip() if value is not None else ""


def param(t, *names):
    for n in names:
        if t.has(n):
            return t.get(n).value
    return None


def digits(value):
    return re.sub(r"\D", "", str(value or ""))


def pos_group(raw):
    s = txt(raw)
    for pat, g in ARABIC_POS:
        if re.search(pat, s):
            return g
    head = re.split(r"[\s/,(]+", s.lower())[0] if s else ""
    return LATIN_POS.get(head)


def iso(d, m, y):
    try:
        return datetime.date(int(str(y).strip()), int(str(m).strip()), int(str(d).strip())).isoformat()
    except (TypeError, ValueError):
        return None


def dob_from(value):
    """{{edad|d|m|y}} / {{birth date and age|y|m|d}} inside a parameter -> ISO date or None."""
    if value is None:
        return None
    for e in mw.parse(str(value)).filter_templates():
        order = DOB_TEMPLATES.get(str(e.name).strip().lower())
        if not order:
            continue
        parts = [str(p.value).strip() for p in e.params if not p.showkey][:3]
        if len(parts) == 3:
            return iso(*parts) if order == "dmy" else iso(parts[2], parts[1], parts[0])
    return None


def link_target(value):
    """[[target|display]] -> (target, display); plain text -> (None, text)."""
    code = mw.parse(str(value))
    links = code.filter_wikilinks()
    display = re.sub(r"\s+", " ", code.strip_code()).strip()
    if links:
        t = str(links[0].title).strip().split("#")[0]
        return (t[0].upper() + t[1:]) if t else None, display or (str(links[0].text).strip() if links[0].text else t)
    return None, display


def parse_row(lang, t):
    name = str(t.name).strip().lower()
    if lang == "fr" and name == "feff joueur":
        first, last = txt(param(t, "prénom")), txt(param(t, "nom"))
        display = (first + " " + last).strip()
        dab = txt(param(t, "dab"))
        title = None if txt(param(t, "nolink")) else display + (f" ({dab})" if dab else "")
        dob = iso(param(t, "jour"), param(t, "mois"), param(t, "an")) or dob_from(param(t, "date de naissance"))
        return {"no": digits(param(t, "num", "no")), "pos": pos_group(param(t, "pos")), "title": title, "name": display, "dob": dob}
    title, display = link_target(param(t, "name", "nombre", "اسم") or "")
    return {"no": digits(param(t, "num", "no", "الرقم")), "pos": pos_group(param(t, "pos", "مركز")), "title": title, "name": display,
            "dob": dob_from(param(t, "edad", "age", "العمر", "birth"))}


def season_current(ctx, ts):
    """Is this table a 2026/27 (or calendar-2026) list? Only then are shirt numbers comparable with the English snapshot."""
    ranges = re.findall(r"20(\d\d)\s*[–\-/]\s*(?:20)?(\d\d)", ctx)
    if ranges:
        return any(b == "27" for a, b in ranges)
    if re.search(r"\b2026\b", ctx):
        return True
    if re.search(r"\b202[0-5]\b", ctx):
        return False
    return bool(ts and ts[:10] >= "2026-08-01")


def squad_table(lang, title):
    """(rows, revid, timestamp, pagetitle, current) from the first senior squad table of the article."""
    j = api(HOST[lang], {"action": "query", "prop": "revisions", "rvprop": "ids|content|timestamp", "rvslots": "main", "titles": title, "redirects": 1})
    page = next(iter(j.get("query", {}).get("pages", {}).values()), {})
    rev = page.get("revisions", [{}])[0]
    text = rev.get("slots", {}).get("main", {}).get("*", "")
    if not text:
        return [], None, None, None, False
    for section in mw.parse(text).get_sections(include_lead=True, flat=True):
        heads = section.filter_headings()
        heading = str(heads[0].title).strip() if heads else ""
        if BAD_HEADING.search(heading):
            continue
        rows, ctx = [], heading
        for t in section.filter_templates(recursive=True):
            name = str(t.name).strip().lower()
            if name in START_TEMPLATES:
                if rows:
                    break
                ctx += " " + txt(param(t, "titre", "título", "titulo", "title", "العنوان") or "")
            elif name in END_TEMPLATES:
                if rows:
                    break
            elif name in ROW_TEMPLATES[lang]:
                r = parse_row(lang, t)
                if r["name"]:
                    rows.append(r)
        if len(rows) >= MIN_ROWS:
            ctx += " " + str(section)[:400]
            return rows, rev.get("revid"), rev.get("timestamp"), page.get("title"), season_current(ctx, rev.get("timestamp"))
    return [], rev.get("revid"), rev.get("timestamp"), page.get("title"), False


def enwiki_numbers(title, revision):
    """folded name -> shirt number from the pinned English revision the 0.3 import used."""
    params = {"action": "query", "prop": "revisions", "rvprop": "content", "rvslots": "main"}
    if revision:
        params["revids"] = revision
    else:
        params.update({"titles": title, "redirects": 1})
    j = api("en.wikipedia.org", params)
    page = next(iter(j.get("query", {}).get("pages", {}).values()), {})
    text = page.get("revisions", [{}])[0].get("slots", {}).get("main", {}).get("*", "")
    out = {}
    for t in mw.parse(text).filter_templates():
        if str(t.name).strip().lower() not in ("fs player", "football squad player", "fs2 player", "football squad player2") or not t.has("name"):
            continue
        target, display = link_target(t.get("name").value)
        no = digits(t.get("no").value) if t.has("no") else ""
        if no:
            out.setdefault(fold(display), no)
            if target:
                out.setdefault(fold(target), no)
    return out


def sitelinks(titles, site="enwiki"):
    out = {}
    for i in range(0, len(titles), 50):
        j = api("www.wikidata.org", {"action": "wbgetentities", "sites": site, "titles": "|".join(titles[i:i + 50]), "props": "sitelinks"})
        for ent in j.get("entities", {}).values():
            links = ent.get("sitelinks", {})
            key = links.get(site, {}).get("title")
            if key:
                out[key] = {"qid": ent.get("id"), "links": {k: v["title"] for k, v in links.items()}}
    return out


def entities_for(lang, titles):
    """regional title -> item summary (labels, aliases, English sitelink, single day-precision birthday, death)."""
    out, site = {}, lang + "wiki"
    for i in range(0, len(titles), 50):
        j = api("www.wikidata.org", {"action": "wbgetentities", "sites": site, "titles": "|".join(titles[i:i + 50]), "props": "labels|aliases|sitelinks|claims", "languages": "en|ar|" + lang})
        for ent in j.get("entities", {}).values():
            links = ent.get("sitelinks", {})
            local = links.get(site, {}).get("title")
            if not local:
                continue
            claims = ent.get("claims", {})
            dobs = set()
            for c in claims.get("P569", []):
                if c.get("rank") == "deprecated":
                    continue
                v = c.get("mainsnak", {}).get("datavalue", {}).get("value", {})
                if v.get("precision") == 11:
                    dobs.add(v["time"][1:11])
            labels = ent.get("labels", {})
            names = {fold(labels.get("en", {}).get("value", "")), fold(labels.get(lang, {}).get("value", ""))}
            names |= {fold(a["value"]) for a in ent.get("aliases", {}).get("en", [])}
            names.discard("")
            out[local] = {"qid": ent["id"], "names": names, "enwiki": links.get("enwiki", {}).get("title"), "labelEn": labels.get("en", {}).get("value"),
                          "nameAr": labels.get("ar", {}).get("value"), "dob": next(iter(dobs)) if len(dobs) == 1 else None, "deceased": bool(claims.get("P570"))}
    return out


def tokens(name):
    return frozenset(x for x in (fold(t) for t in re.split(r"[\s\-'’.]+", name or "")) if x)


def similar(a, b):
    return difflib.SequenceMatcher(None, fold(a), fold(b)).ratio()


def latin(r):
    """A Latin-script spelling of a table row's name: the row text itself, or the item's English label for Arabic rows."""
    if re.search(r"[A-Za-z]", r["name"]):
        return r["name"]
    return (r.get("item") or {}).get("labelEn") or ""


def alike(a, b):
    """Shirt-number matches also need the spellings to look like the same person (>= 0.6 similar or a shared name word)."""
    return similar(a, b) >= 0.6 or bool(tokens(a) & tokens(b))


def prune(supplement):
    """Re-apply the number-match spelling rule to entries written by an earlier run (idempotent, no network)."""
    dropped = 0
    for bucket in ("birthdays", "matches"):
        for key, v in list(supplement.get(bucket, {}).items()):
            if not v.get("method", "").endswith("-number"):
                continue
            src = v if "row" in v else v.get("source", {})
            row = src.get("rowLatin") or src.get("row") or ""
            if not alike(row, key.split("|", 1)[1]):
                del supplement[bucket][key]
                dropped += 1
                print("  pruned", bucket, key, "<->", row)
    return dropped


def process(lang, leagues, players, supplement, stats):
    clubs = [c for c in load_json("clubs.json") if c["league"] in leagues]
    matches, birthdays, sources = supplement.setdefault("matches", {}), supplement.setdefault("birthdays", {}), supplement.setdefault("tableSources", {})
    links = sitelinks([c["wiki"] for c in clubs])
    by_club = collections.defaultdict(list)
    for p in players:
        by_club[p["clubId"]].append(p)
    for n, c in enumerate(clubs):
        entry = links.get(c["wiki"])
        title = entry["links"].get(lang + "wiki") if entry else None
        if not title:
            stats["no-page"] += 1
            print(f"  {lang} no page: {c['name']}", flush=True)
            continue
        rows, revid, ts, pagetitle, current = squad_table(lang, title)
        if not rows:
            stats["no-table"] += 1
            print(f"  {lang} no squad table: {c['name']} -> {title}", flush=True)
            continue
        ents = entities_for(lang, sorted({r["title"] for r in rows if r["title"]}))
        for r in rows:
            r["item"] = ents.get(r["title"]) if r["title"] else None
            r["keys"] = {fold(r["name"])} | ({fold(re.sub(r"\s*\(.*\)$", "", r["title"]))} if r["title"] else set()) | (r["item"]["names"] if r["item"] else set())
            r["tokens"] = tokens(r["name"])
        mine = by_club[c["id"]]
        todo = [p for p in mine if not p["qid"] or not p["birthDate"] or p.get("biographyMethod") == "openfootball-name"]
        numbers = enwiki_numbers(c["wiki"], c.get("revision")) if todo else {}
        key_count = collections.Counter(k for p in mine for k in ({fold(p["name"])} | ({fold(p["wiki"])} if p["wiki"] else set())))
        tok_count = collections.Counter(tokens(p["name"]) for p in mine)
        row_key_count = collections.Counter(k for r in rows for k in r["keys"])
        row_tok_count = collections.Counter(r["tokens"] for r in rows)
        taken, found, done = set(), 0, set()

        def accept(p, r, method):
            item = r["item"]
            if item and item["deceased"]:
                return False
            if item and p["qid"] and item["qid"] != p["qid"]:
                stats["item-mismatch"] += 1
                return False
            table_dob, item_dob = r["dob"], item["dob"] if item else None
            birth = item_dob or table_dob
            conflict = bool(item_dob and table_dob and item_dob != table_dob)
            if conflict:
                birth = None
            replaces = None
            if p["birthDate"] and birth and p["birthDate"] != birth:
                if p.get("biographyMethod") == "openfootball-name":
                    replaces = "openfootball-name"  # a global unique-name match from 2024 loses to the same club's own table row
                else:
                    stats["dob-mismatch"] += 1
                    return False
            key = c["id"] + "|" + p["name"]
            url = f"https://{HOST[lang]}/w/index.php?title={urllib.parse.quote(pagetitle.replace(' ', '_'))}&oldid={revid}"
            src = {"lang": lang, "title": pagetitle, "revision": revid, "url": url, "row": r["name"], **({"rowLatin": latin(r)} if latin(r) != r["name"] else {})}
            wrote = False
            if item and not p["qid"] and key not in matches:
                matches[key] = {"qid": item["qid"], "label": item["labelEn"] or r["name"], "nameAr": item["nameAr"] or (r["name"] if re.search(r"[\u0600-\u06FF]", r["name"]) else None), "birthDate": birth, "method": f"{lang}wiki-{method}",
                                "clubConfirmed": True, "source": src, **({"dobConflict": [item_dob, table_dob]} if conflict else {})}
                stats["identity"] += 1
                wrote = True
            if birth and (not p["birthDate"] or replaces) and key not in birthdays:
                birthdays[key] = {"birthDate": birth, "method": f"{lang}wiki-{method}", "from": "wikidata" if item_dob else "table", "qid": item["qid"] if item else None,
                                  **({"replaces": replaces, "replacedDate": p["birthDate"]} if replaces else {}), **src}
                stats["birthday" if not replaces else "birthday-replaces-openfootball"] += 1
                wrote = True
            if wrote:
                stats[f"{lang}wiki-{method}"] += 1
            taken.add(id(r))
            done.add(p["id"])
            return wrote

        def unique_rows(pred):
            cands = [r for r in rows if id(r) not in taken and pred(r)]
            return cands[0] if len(cands) == 1 else None

        # phase A: sitelink / same item / exact name
        for p in todo:
            keys = {fold(p["name"])} | ({fold(p["wiki"])} if p["wiki"] else set())
            r = m = None
            if p["wiki"]:
                r = unique_rows(lambda r: r["item"] and r["item"]["enwiki"] == p["wiki"]); m = "sitelink" if r else None
            if not r and p["qid"]:
                r = unique_rows(lambda r: r["item"] and r["item"]["qid"] == p["qid"]); m = "item" if r else None
            if not r:
                cands = [r for r in rows if id(r) not in taken and (r["keys"] & keys or (len(r["tokens"]) >= 2 and r["tokens"] == tokens(p["name"])))]
                if len(cands) == 1 and all(key_count[k] <= 1 for k in cands[0]["keys"] & keys) and tok_count[tokens(p["name"])] <= 1 \
                        and all(row_key_count[k] <= 1 for k in cands[0]["keys"] & keys):
                    r, m = cands[0], "name"
            if r:
                found += accept(p, r, m)
        # phase B: shirt number + position group (current-season tables only), names must look alike
        if current:
            for p in todo:
                if p["id"] in done:
                    continue
                no = numbers.get(fold(p["name"])) or (numbers.get(fold(p["wiki"])) if p["wiki"] else None)
                if not no or sum(1 for q in mine if numbers.get(fold(q["name"])) == no and q["positionGroup"] == p["positionGroup"]) != 1:
                    continue
                r = unique_rows(lambda r: r["no"] == no and r["pos"] == p["positionGroup"])
                if r and latin(r) and alike(latin(r), p["name"]):
                    found += accept(p, r, "number")
                elif r:
                    stats["number-name-unlike"] += 1
        # phase C: near-identical spelling within the same position group
        for p in todo:
            if p["id"] in done:
                continue
            cands = [r for r in rows if id(r) not in taken and r["pos"] == p["positionGroup"] and latin(r) and similar(latin(r), p["name"]) >= 0.85]
            if len(cands) == 1 and sum(1 for q in mine if q["positionGroup"] == p["positionGroup"] and similar(latin(cands[0]), q["name"]) >= 0.85) == 1:
                found += accept(p, cands[0], "fuzzy")
        sources.setdefault(c["id"], [])
        sources[c["id"]] = [s for s in sources[c["id"]] if s["lang"] != lang] + [{
            "lang": lang, "title": pagetitle, "revision": revid, "timestamp": ts, "rows": len(rows), "linked": sum(1 for r in rows if r["item"]), "withDob": sum(1 for r in rows if r["dob"]),
            "current": current, "matched": found, "url": f"https://{HOST[lang]}/w/index.php?title={urllib.parse.quote(pagetitle.replace(' ', '_'))}&oldid={revid}"}]
        print(f"  {lang} {c['league']} {c['name']}: rows {len(rows)} (items {sum(1 for r in rows if r['item'])}, dob {sum(1 for r in rows if r['dob'])}, {'2026/27' if current else 'older'}) | ours to fill {len(todo)} -> {found}", flush=True)
        if n % 10 == 9:
            dump_json("identity-supplement.json", supplement)


def main():
    if sys.argv[1:] == ["--prune"]:
        supplement = load_json("identity-supplement.json", {})
        print("pruned", prune(supplement))
        dump_json("identity-supplement.json", supplement)
        return
    plan = [(sys.argv[1], sys.argv[2:])] if len(sys.argv) > 2 else PLAN
    players = load_json("players.json")
    supplement = load_json("identity-supplement.json", {"generatedOn": SUPPLEMENTED_ON, "matches": {}})
    for lang, leagues in plan:
        stats = collections.Counter()
        process(lang, leagues, players, supplement, stats)
        supplement.setdefault("tableRuns", []).append({"lang": lang, "leagues": leagues, "on": SUPPLEMENTED_ON, "stats": dict(stats)})
        dump_json("identity-supplement.json", supplement)
        print(lang, json.dumps(dict(stats), ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
