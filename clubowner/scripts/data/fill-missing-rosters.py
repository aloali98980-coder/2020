"""0.18 step 8 — senior squads for clubs whose English article has no supported
squad table, adapted from the same club's article on another Wikipedia language
edition (found through Wikidata sitelinks). Same rules as the 0.3 import:
published first-senior-squad templates only, loaned-out rows excluded, no
invented names, article + revision retained for CC BY-SA attribution.
Output: src/data/packs/world/clubs-supplement.json (merged by finish-world.py).
"""
import json, re, urllib.parse
import mwparserfromhell as mw
from worldlib import api, fold, load_json, dump_json, wiki_url, SUPPLEMENTED_ON

MIN_ROWS = 11
PREFERENCE = {
    "eg": ["ar", "fr", "es"], "tn": ["fr", "ar", "es"], "ma": ["fr", "ar", "es"], "dz": ["fr", "ar", "es"],
    "sa": ["ar", "fr"], "qa": ["ar", "fr"], "ae": ["ar", "fr"], "za": ["af", "fr", "de"],
}
DEFAULT_LANGS = ["es", "pt", "fr", "it", "ar", "de", "tr", "nl", "pl", "ru", "uk", "ja", "ko", "zh", "th", "id"]
NAME_KEYS = ["name", "nom", "nombre", "nome", "اسم", "ad", "isim", "imię", "имя", "naam"]
POS_KEYS = ["pos", "poste", "posición", "posicion", "posição", "posicao", "مركز", "ruolo", "mevki", "pozycja", "позиция", "positie"]
NAT_KEYS = ["nat", "nac", "جنسية", "nazione", "nacionalidade", "país", "pais", "ülke", "kraj", "land", "nationalité", "nationality"]
OTHER_KEYS = ["other", "autre", "otro", "outro", "ملاحظة", "altro", "diğer", "opmerking"]
BAD_HEADING = re.compile(
    r"under|academy|reserve|loan|former|notable|historic|women|record|national|cup|retired|youth|"
    r"réserve|espoir|jeune|prêt|prêté|anciens|féminin|palmar|"
    r"cedid|prestad|juvenil|filial|femenin|reserva|histor|"
    r"معار|رديف|شباب|ناشئ|سيدات|سابق|أساطير|تاريخ|إعارة|"
    r"primavera|giovanil|prestit|femminil|"
    r"emprest|base|sub-|feminin|"
    r"jugend|leih|frauen|ehemalig",
    re.I,
)
POS_MAP = [
    (r"^(gk|g|por|gol|gr|tw|k|p|б|вр|حارس|gardien|portero|goleiro|portiere|kaleci|bramkarz|doelman)", "GK"),
    (r"^(df|d|def|zag|lat|dc|dg|dd|v|dif|مدافع|défenseur|defensa|zagueiro|lateral|difensore|defans|obrońca|verdediger|ab)", "DF"),
    (r"^(mf|m|med|mei|vol|mc|mo|md|c|وسط|milieu|centrocampista|mediocampista|meia|volante|centrocamp|orta|pomocnik|middenvelder)", "MF"),
    (r"^(fw|f|a|att|del|ata|ac|مهاجم|attaquant|delantero|atacante|attaccante|forvet|napastnik|aanvaller|st|w)", "FW"),
]
LOAN = re.compile(r"on loan|loan to|prêt|prêté|préstamo|cedido|emprest|معار|إعارة|prestito|kiralık|wypożycz|verhuurd", re.I)


def clean(x):
    return re.sub(r"\s+", " ", mw.parse(str(x)).strip_code()).strip()


def param(t, keys):
    for k in keys:
        if t.has(k):
            return t.get(k).value
    return None


def norm_pos(raw):
    s = clean(raw).lower().strip()
    if not s:
        return None
    for pattern, group in POS_MAP:
        if re.match(pattern, s):
            return group
    return None


def rows_from(section_text):
    rows = []
    for t in mw.parse(section_text).filter_templates(recursive=True):
        name_v, pos_v = param(t, NAME_KEYS), param(t, POS_KEYS)
        if name_v is None or pos_v is None:
            continue
        pos = norm_pos(pos_v)
        if not pos:
            continue
        other = param(t, OTHER_KEYS)
        if other is not None and LOAN.search(str(other)):
            continue
        name = clean(name_v)
        links = mw.parse(str(name_v)).filter_wikilinks()
        if not name and links:
            name = clean(links[0].title)
        if not name or re.search(r"tba|unknown|vacant|—|\?", name, re.I):
            continue
        nat = param(t, NAT_KEYS)
        rows.append({"name": name, "wiki": None, "positionGroup": pos, "nationalityCode": clean(nat) if nat is not None else ""})
    return list({fold(r["name"]): r for r in rows}.values())


def senior_squad(text):
    """First section (skipping youth/loan/former/women headings) with >= MIN_ROWS player rows."""
    parts = re.split(r"^(={2,4}\s*[^=\n]+?\s*={2,4})\s*$", text, flags=re.M)
    sections = [("", parts[0])] + [(parts[i], parts[i + 1]) for i in range(1, len(parts) - 1, 2)]
    for heading, body in sections:
        label = clean(heading.strip("= ")) if heading else ""
        if label and BAD_HEADING.search(label):
            continue
        rows = rows_from(body)
        if len(rows) >= MIN_ROWS:
            return rows, label
    return [], None


def sitelinks(titles):
    out = {}
    for i in range(0, len(titles), 50):
        j = api("www.wikidata.org", {"action": "wbgetentities", "sites": "enwiki", "titles": "|".join(titles[i:i + 50]),
                                     "props": "sitelinks"})
        back = {t.replace("_", " "): t for t in titles[i:i + 50]}
        for ent in j.get("entities", {}).values():
            links = ent.get("sitelinks", {})
            en = links.get("enwiki", {}).get("title")
            if not en:
                continue
            out[back.get(en, en)] = {"qid": ent.get("id"), "links": {k[:-4]: v["title"] for k, v in links.items() if k.endswith("wiki") and k != "commonswiki"}}
            out[en] = out[back.get(en, en)]
    return out


def main():
    raw = load_json("clubs-raw.json")
    targets = [c for c in raw if len(c["players"]) < 15]
    print("targets:", len(targets), [c["name"] for c in targets], flush=True)
    links = sitelinks([c["wiki"] for c in targets])
    supplement = load_json("clubs-supplement.json", {"generatedOn": SUPPLEMENTED_ON, "clubs": []})
    done = {c["clubId"] for c in supplement["clubs"]}
    for c in targets:
        if c["id"] in done:
            continue
        entry = links.get(c["wiki"]) or links.get(c["name"])
        if not entry:
            print("  no sitelinks:", c["name"], flush=True)
            continue
        langs = [l for l in PREFERENCE.get(c["league"], []) + DEFAULT_LANGS if l in entry["links"] and l != "en"]
        found = None
        tried = []
        for lang in langs:
            title = entry["links"][lang]
            host = f"{lang}.wikipedia.org"
            j = api(host, {"action": "query", "prop": "revisions", "rvprop": "ids|content|timestamp", "rvslots": "main", "titles": title, "redirects": 1})
            page = next(iter(j.get("query", {}).get("pages", {}).values()), {})
            rev = page.get("revisions", [{}])[0]
            text = rev.get("slots", {}).get("main", {}).get("*", "")
            rows, label = senior_squad(text)
            tried.append((lang, len(rows)))
            if rows:
                found = {"clubId": c["id"], "enTitle": c["wiki"], "league": c["league"], "lang": lang, "title": page.get("title", title),
                         "revision": rev.get("revid"), "revisionTime": rev.get("timestamp"),
                         "sourceUrl": wiki_url(host, page.get("title", title), rev.get("revid")), "section": label,
                         "license": "CC-BY-SA-4.0", "players": rows, "existingRows": len(c["players"])}
                break
        print(" ", c["league"], c["name"], "->", (found["lang"], len(found["players"])) if found else ("none", tried), flush=True)
        if found:
            supplement["clubs"].append(found)
    dump_json("clubs-supplement.json", supplement)
    print("FINISHED", len(supplement["clubs"]), "clubs supplemented,", sum(len(c["players"]) for c in supplement["clubs"]), "rows")


if __name__ == "__main__":
    main()
