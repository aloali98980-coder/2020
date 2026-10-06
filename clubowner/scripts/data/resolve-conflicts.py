"""0.18 step 9 — decide what to do with identities listed by more than one club
(the 0.3 pipeline excluded all of them, which silently dropped real players
such as a star whose namesake was mis-linked on another club's page).

Decision order, recorded per identity in conflict-resolutions.json:
 1. Wikidata/Wikipedia identities with an English article: the article's own
    infobox `currentclub` names one of the conflicting clubs -> that club.
 2. Otherwise the Wikidata item's open club membership (P54 without end time)
    names exactly one of them -> that club.
 3. Otherwise the club whose page carries the later "as of"/revision date, but
    only when the dates differ by 30+ days -> that club (method `newer-source`).
 4. Same-name rows with no article and no item are treated as DISTINCT people
    (common Arabic/Spanish names) and keep one row per club.
 5. Anything else stays excluded, exactly as before.
"""
import importlib.util, json, pathlib, re, collections, urllib.parse
from worldlib import api, sparql, val, qid_of, load_json, dump_json, SUPPLEMENTED_ON

spec = importlib.util.spec_from_file_location("fw", pathlib.Path(__file__).with_name("finish-world.py"))
fw = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fw)
MONTHS = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"], 1)}


def source_day(club):
    """Approximate date of a club page snapshot from its 'as of' text (None if unknown)."""
    t = (club.get("sourceDateText") or "").lower()
    m = re.search(r"(\d{1,2})?\s*(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})", t)
    if not m:
        return None
    day = int(m.group(1) or 15)
    return (int(m.group(3)), MONTHS[m.group(2)], min(day, 28))


def days(d):
    return d[0] * 365 + d[1] * 30 + d[2]


def normalize_title(t):
    t = t.strip()
    return t[0].upper() + t[1:] if t else t


def infobox_clubs(titles):
    """title -> currentclub article title from the player's own infobox (cached, 30 per call)."""
    out = {}
    for i in range(0, len(titles), 30):
        chunk = titles[i:i + 30]
        j = api("en.wikipedia.org", {"action": "query", "prop": "revisions", "rvprop": "content", "rvslots": "main",
                                     "titles": "|".join(chunk), "redirects": 1}, kind="infobox")
        q = j.get("query", {})
        alias = {x["from"]: x["to"] for k in ("normalized", "redirects") for x in q.get(k, [])}
        pages = {p.get("title"): p for p in q.get("pages", {}).values()}
        for t in chunk:
            canonical = t
            for _ in range(5):
                canonical = alias.get(canonical, canonical)
            text = pages.get(canonical, {}).get("revisions", [{}])[0].get("slots", {}).get("main", {}).get("*", "")
            m = re.search(r"\|\s*currentclub\s*=\s*([^\n]*)", text)
            if not m:
                continue
            links = re.findall(r"\[\[([^\]|#]+)", m.group(1))
            out[t] = normalize_title(links[0]) if links else re.sub(r"\{\{[^}]*\}\}", "", m.group(1)).strip() or None
    return out


def open_memberships(qids):
    """qid -> set of club items whose P54 statement has no end time (P582)."""
    out = collections.defaultdict(set)
    qids = sorted(set(qids))
    for i in range(0, len(qids), 150):
        rows = sparql("SELECT ?p ?club WHERE { VALUES ?p { %s } ?p p:P54 ?st . ?st ps:P54 ?club . FILTER NOT EXISTS { ?st pq:P582 ?end } }"
                      % " ".join("wd:" + q for q in qids[i:i + 150]), kind="p54open")
        for r in rows:
            out[qid_of(val(r, "p"))].add(qid_of(val(r, "club")))
    return out


def main():
    clubs = fw.merged_clubs()
    bios = load_json("wikidata-bios.json", {})
    supplement = load_json("identity-supplement.json", {})
    occ = fw.occurrences(clubs, bios, supplement)
    conflicts = {k: rows for k, rows in occ.items() if len({r["club"]["id"] for r in rows}) > 1}
    print("conflicting identities:", len(conflicts), flush=True)
    club_by_title = {c["wiki"]: c for c in clubs}
    club_by_title.update({c["name"]: c for c in clubs})
    # club items for P54 comparison
    club_items = {}
    titles = [c["wiki"] for c in clubs]
    for i in range(0, len(titles), 100):
        urls = " ".join("<https://en.wikipedia.org/wiki/" + urllib.parse.quote(n.replace(" ", "_"), safe="()/,") + ">" for n in titles[i:i + 100])
        for r in sparql("SELECT ?article ?c WHERE { VALUES ?article { %s } ?article schema:about ?c . }" % urls):
            club_items[qid_of(val(r, "c"))] = urllib.parse.unquote(val(r, "article").split("/wiki/")[-1]).replace("_", " ")
    item_of_club = {v: k for k, v in club_items.items()}

    article_titles, qid_keys = [], []
    for key, rows in conflicts.items():
        if key.startswith("Q") and key[1:].isdigit():
            qid_keys.append(key)
            wiki = next((r["raw"]["wiki"] for r in rows if r["raw"]["wiki"]), None)
            if wiki:
                article_titles.append(wiki)
    current = infobox_clubs(sorted(set(article_titles)))
    memberships = open_memberships(qid_keys)
    resolutions, stats = {}, collections.Counter()
    for key, rows in conflicts.items():
        club_ids = {r["club"]["id"] for r in rows}
        decision = None
        if key in qid_keys:
            wiki = next((r["raw"]["wiki"] for r in rows if r["raw"]["wiki"]), None)
            cur = current.get(wiki) if wiki else None
            target = club_by_title.get(cur) if cur else None
            if target and target["id"] in club_ids:
                decision = {"club": target["id"], "method": "article-currentclub", "evidence": cur}
            else:
                open_items = memberships.get(key, set())
                hits = {item_of_club.get(q) for q in open_items} & {r["club"]["wiki"] for r in rows}
                if len(hits) == 1:
                    decision = {"club": club_by_title[next(iter(hits))]["id"], "method": "wikidata-p54-open"}
        if not decision and key in qid_keys:
            # one club links the player's own article; the other rows only reached this item through a
            # name match -> trust the article, and finish-world.py keeps the other rows as unmatched people
            strong = {r["club"]["id"] for r in rows if r["method"] in ("article", "redirect")}
            if len(strong) == 1 and all(r["method"] in ("article", "redirect") or (r["method"] or "").startswith(("nationality-name", "club-name", "arwiki-", "frwiki-", "eswiki-")) for r in rows):
                decision = {"club": next(iter(strong)), "method": "article-over-name-match"}
        if not decision:
            dated = [(source_day(r["club"]), r) for r in rows]
            dated = [(d, r) for d, r in dated if d]
            if len(dated) >= 2:
                dated.sort(key=lambda x: days(x[0]), reverse=True)
                if days(dated[0][0]) - days(dated[1][0]) >= 30 and dated[0][1]["club"]["id"] != dated[1][1]["club"]["id"]:
                    decision = {"club": dated[0][1]["club"]["id"], "method": "newer-source"}
        if not decision and key not in qid_keys and not any(r["raw"].get("wiki") for r in rows):
            # plain names shared by rows without any article or item: common namesakes, one row per club
            decision = {"distinct": True, "method": "distinct-namesakes"}
        if decision:
            resolutions[key] = decision
            stats[decision["method"]] += 1
        else:
            stats["unresolved"] += 1
    dump_json("conflict-resolutions.json", {"generatedOn": SUPPLEMENTED_ON, "resolutions": resolutions, "stats": dict(stats)}, pretty=True)
    print(json.dumps(dict(stats), indent=2))


if __name__ == "__main__":
    main()
