"""0.18 step 7 — identity/DOB enrichment for roster rows the 0.3 pipeline left
without a Wikidata identity (red links, renamed articles, unlinked names).

Three cached, paced passes — all CC0 Wikidata metadata, no ratings, no
invented people:
 1. Renamed/redirected article titles -> canonical title + Wikidata item
    (MediaWiki `redirects=1` + `pageprops.wikibase_item`), then DOB/Arabic label.
 2. Unlinked names -> living association-football players of the SAME
    nationality (P27 + P106, born >= 1978) whose English label folds to the
    roster name. Unique label only; ties are broken by club membership (P54)
    and otherwise left unknown. Optional loose transliteration pass.
 3. Remaining names -> current/former members of the SAME club (P54), unique
    folded label inside that club.
Output: src/data/packs/world/identity-supplement.json, consumed by
finish-world.py. Every match records its method so the pack stays honest
about which birthdays are certified by article identity and which by name.
"""
import collections, json, re, sys, urllib.parse
from worldlib import (ASOF, SUPPLEMENTED_ON, api, sparql, val, qid_of, fold, loose,
                      load_json, dump_json)

FOOTBALLER = "Q937857"
# FIFA trigrams that differ from IOC codes (P984) or have no country item.
CODE_OVERRIDES = {
    # non-standard codes seen in the pack
    "SER": "Q403", "GIN": "Q1006", "DRC": "Q974", "MRT": "Q1025", "DNK": "Q35", "MLD": "Q217",
    "ENG": "Q21", "SCO": "Q22", "WAL": "Q25", "NIR": "Q26", "NGA": "Q1033", "IRN": "Q794",
    "BHR": "Q398", "LBY": "Q1016", "TRI": "Q754", "IDN": "Q252", "SVN": "Q215", "LVA": "Q211",
    "GNB": "Q1007", "EQG": "Q983", "CTA": "Q929", "CUW": "Q25279", "KOS": "Q1246", "GIB": "Q1410",
    "TPE": "Q865", "PRK": "Q423", "ZAM": "Q953", "ZIM": "Q954", "ANG": "Q916", "MTN": "Q1025",
    "RSA": "Q258", "KSA": "Q851", "UAE": "Q878", "SUI": "Q39", "NED": "Q55", "GER": "Q183",
    "POR": "Q45", "CRO": "Q224", "DEN": "Q35", "GRE": "Q41", "CHI": "Q298", "URU": "Q77",
    "PAR": "Q733", "BOL": "Q750", "VEN": "Q717", "PER": "Q419", "ECU": "Q736", "CRC": "Q800",
    "HON": "Q783", "GUA": "Q774", "SLV": "Q792", "HAI": "Q790", "JAM": "Q766", "PUR": "Q1183",
    "DOM": "Q786", "CUB": "Q241", "SUR": "Q730", "GUY": "Q734", "MAS": "Q833", "PHI": "Q928",
    "VIE": "Q881", "MYA": "Q836", "CAM": "Q424", "LAO": "Q819", "SIN": "Q334", "TKM": "Q874",
    "KGZ": "Q813", "TJK": "Q863", "UZB": "Q265", "KAZ": "Q232", "AFG": "Q889", "BAN": "Q902",
    "SRI": "Q854", "NEP": "Q837", "BHU": "Q917", "MDV": "Q826", "PLE": "Q219060", "LIB": "Q822",
    "LBN": "Q822", "SYR": "Q858", "JOR": "Q810", "IRQ": "Q796", "KUW": "Q817", "OMA": "Q842",
    "QAT": "Q846", "YEM": "Q805", "SUD": "Q1049", "SSD": "Q958", "ETH": "Q115", "ERI": "Q986",
    "DJI": "Q977", "SOM": "Q1045", "KEN": "Q114", "UGA": "Q1036", "TAN": "Q924", "RWA": "Q1037",
    "BDI": "Q967", "COD": "Q974", "CGO": "Q971", "GAB": "Q1000", "CMR": "Q1009", "CHA": "Q657",
    "NIG": "Q1032", "MLI": "Q912", "BFA": "Q965", "GHA": "Q117", "TOG": "Q945", "BEN": "Q962",
    "CIV": "Q1008", "LBR": "Q1014", "SLE": "Q1044", "GUI": "Q1006", "SEN": "Q1041", "GAM": "Q1005",
    "CPV": "Q1011", "MAD": "Q1019", "MRI": "Q1027", "SEY": "Q1042", "COM": "Q970", "MOZ": "Q1029",
    "MWI": "Q1020", "BOT": "Q963", "NAM": "Q1030", "LES": "Q1013", "SWZ": "Q1050", "MAR": "Q1028",
    "TUN": "Q948", "ALG": "Q262", "EGY": "Q79", "NZL": "Q664", "FIJ": "Q712", "PNG": "Q691",
    "SOL": "Q685", "TAH": "Q30971", "NCL": "Q33788", "VAN": "Q686", "SAM": "Q683", "TGA": "Q678",
    "COK": "Q26988", "ASA": "Q16641", "GUM": "Q16635", "MTQ": "Q17054", "GLP": "Q17012",
    "GUF": "Q3769", "REU": "Q17070", "BER": "Q23635", "CAY": "Q5785", "ARU": "Q21203",
    "SKN": "Q763", "LCA": "Q760", "VIN": "Q757", "GRN": "Q769", "BRB": "Q244", "ATG": "Q781",
    "DMA": "Q784", "BAH": "Q778", "BLZ": "Q242", "NCA": "Q811", "PAN": "Q804", "MEX": "Q96",
    "USA": "Q30", "CAN": "Q16", "COL": "Q739", "ARG": "Q414", "BRA": "Q155", "ISL": "Q189",
    "FRO": "Q4628", "MDA": "Q217", "MKD": "Q221", "BIH": "Q225", "MNE": "Q236", "SRB": "Q403",
    "ALB": "Q222", "BUL": "Q219", "ROU": "Q218", "HUN": "Q28", "SVK": "Q214", "CZE": "Q213",
    "POL": "Q36", "UKR": "Q212", "BLR": "Q184", "RUS": "Q159", "LTU": "Q37", "EST": "Q191",
    "FIN": "Q33", "SWE": "Q34", "NOR": "Q20", "IRL": "Q27", "AUT": "Q40", "BEL": "Q31",
    "LUX": "Q32", "FRA": "Q142", "ESP": "Q29", "ITA": "Q38", "MLT": "Q233", "CYP": "Q229",
    "TUR": "Q43", "GEO": "Q230", "ARM": "Q399", "AZE": "Q227", "ISR": "Q801", "AUS": "Q408",
    "JPN": "Q17", "KOR": "Q884", "CHN": "Q148", "HKG": "Q8646", "MAC": "Q14773", "MNG": "Q711",
    "IND": "Q668", "PAK": "Q843", "THA": "Q869", "AND": "Q228", "SMR": "Q238", "LIE": "Q347",
    "MON": "Q235", "VAT": "Q237", "CHN ": "Q148",
}
NAME_ALIASES = {"egypt": "Q79", "ecuador": "Q736", "england": "Q21", "scotland": "Q22", "wales": "Q25",
                "northern ireland": "Q26", "ivory coast": "Q1008", "cote d'ivoire": "Q1008", "dr congo": "Q974",
                "congo dr": "Q974", "south korea": "Q884", "north korea": "Q423", "united states": "Q30",
                "cape verde": "Q1011", "czech republic": "Q213", "türkiye": "Q43", "turkey": "Q43"}


def country_qid(code, p984):
    c = (code or "").strip()
    if not c:
        return None
    up = c.upper()
    if up in CODE_OVERRIDES:
        return CODE_OVERRIDES[up]
    if up in p984:
        return p984[up]
    low = c.lower()
    if low in NAME_ALIASES:
        return NAME_ALIASES[low]
    return None


def p984_map():
    rows = sparql('SELECT ?c ?code WHERE { ?c wdt:P984 ?code ; wdt:P31/wdt:P279* wd:Q6256 . }')
    m = {}
    for r in rows:
        m.setdefault(val(r, "code"), qid_of(val(r, "c")))
    # labels for full-name nationalities
    rows = sparql('SELECT ?c ?l WHERE { ?c wdt:P984 ?code ; wdt:P31/wdt:P279* wd:Q6256 ; rdfs:label ?l FILTER(LANG(?l)="en") }')
    for r in rows:
        NAME_ALIASES.setdefault(val(r, "l").lower(), qid_of(val(r, "c")))
    return m


def club_qids(clubs):
    """enwiki article -> club item, via sitelinks (VALUES batches)."""
    out = {}
    titles = [c["wiki"] for c in clubs]
    for i in range(0, len(titles), 100):
        names = titles[i:i + 100]
        urls = " ".join("<https://en.wikipedia.org/wiki/" + urllib.parse.quote(n.replace(" ", "_"), safe="()/,") + ">" for n in names)
        rows = sparql("SELECT ?article ?c WHERE { VALUES ?article { %s } ?article schema:about ?c . }" % urls)
        for r in rows:
            title = urllib.parse.unquote(val(r, "article").split("/wiki/")[-1]).replace("_", " ")
            out[title] = qid_of(val(r, "c"))
    return out


def qid_bios(qids):
    """DOB (day precision, non-deprecated), Arabic label, death flag for items."""
    out = {}
    qids = sorted(set(qids))
    for i in range(0, len(qids), 200):
        chunk = qids[i:i + 200]
        rows = sparql(
            "SELECT ?p ?dob ?precision ?ar ?death WHERE { VALUES ?p { %s } "
            "OPTIONAL { ?p p:P569 ?birth . ?birth psv:P569 ?value . ?value wikibase:timeValue ?dob; wikibase:timePrecision ?precision . "
            "FILTER NOT EXISTS { ?birth wikibase:rank wikibase:DeprecatedRank } } "
            "OPTIONAL { ?p rdfs:label ?ar . FILTER(LANG(?ar)=\"ar\") } OPTIONAL { ?p wdt:P570 ?death } }"
            % " ".join("wd:" + q for q in chunk)
        )
        for r in rows:
            q = qid_of(val(r, "p"))
            d = out.setdefault(q, {"qid": q, "birthDates": [], "nameAr": None, "deceased": False})
            if "dob" in r and int(val(r, "precision", 0)) >= 11:
                if val(r, "dob")[:10] not in d["birthDates"]:
                    d["birthDates"].append(val(r, "dob")[:10])
            if "ar" in r:
                d["nameAr"] = val(r, "ar")
            if val(r, "death", "9999") <= ASOF + "T23:59:59Z":
                d["deceased"] = True
    return out


def footballers_by_country(qid, years=(1978, 2011)):
    """Living footballers of a nationality with DOB, labels and club items."""
    lo, hi = years
    query = (
        "SELECT ?p ?en ?ar ?dob ?prec (GROUP_CONCAT(DISTINCT ?club; separator=\" \") AS ?clubs) WHERE { "
        "?p wdt:P27 wd:%s ; wdt:P106 wd:%s . FILTER NOT EXISTS { ?p wdt:P570 ?d } "
        "?p p:P569 ?b . ?b psv:P569 ?v . ?v wikibase:timeValue ?dob ; wikibase:timePrecision ?prec . "
        "FILTER NOT EXISTS { ?b wikibase:rank wikibase:DeprecatedRank } FILTER(YEAR(?dob) >= %d && YEAR(?dob) < %d) "
        "?p rdfs:label ?en FILTER(LANG(?en)=\"en\") OPTIONAL { ?p rdfs:label ?ar FILTER(LANG(?ar)=\"ar\") } "
        "OPTIONAL { ?p wdt:P54 ?club } } GROUP BY ?p ?en ?ar ?dob ?prec" % (qid, FOOTBALLER, lo, hi)
    )
    try:
        return sparql(query)
    except TimeoutError:
        if hi - lo <= 2:
            raise
        mid = (lo + hi) // 2
        return footballers_by_country(qid, (lo, mid)) + footballers_by_country(qid, (mid, hi))


def club_members(qids):
    rows = sparql(
        "SELECT ?club ?p ?en ?ar ?dob ?prec WHERE { VALUES ?club { %s } ?p wdt:P54 ?club ; wdt:P31 wd:Q5 . "
        "FILTER NOT EXISTS { ?p wdt:P570 ?d } ?p p:P569 ?b . ?b psv:P569 ?v . ?v wikibase:timeValue ?dob ; wikibase:timePrecision ?prec . "
        "FILTER NOT EXISTS { ?b wikibase:rank wikibase:DeprecatedRank } FILTER(YEAR(?dob) >= 1978) "
        "?p rdfs:label ?en FILTER(LANG(?en)=\"en\") OPTIONAL { ?p rdfs:label ?ar FILTER(LANG(?ar)=\"ar\") } }"
        % " ".join("wd:" + q for q in qids)
    )
    return rows


def index_people(rows):
    """fold(label) -> list of person dicts (deduplicated by qid + dob)."""
    people = {}
    for r in rows:
        q = qid_of(val(r, "p"))
        d = people.setdefault(q, {"qid": q, "en": val(r, "en"), "ar": val(r, "ar"), "dobs": set(), "clubs": set()})
        if int(val(r, "prec", 0)) >= 11:
            d["dobs"].add(val(r, "dob")[:10])
        for c in (val(r, "clubs", "") or "").split():
            d["clubs"].add(qid_of(c))
        if "club" in r:
            d["clubs"].add(qid_of(val(r, "club")))
    exact, lax = collections.defaultdict(list), collections.defaultdict(list)
    for d in people.values():
        exact[fold(d["en"])].append(d)
        lax[loose(d["en"])].append(d)
    return exact, lax


def pick(cands, club_qid):
    if len(cands) == 1:
        return cands[0]
    by_club = [c for c in cands if club_qid and club_qid in c["clubs"]]
    return by_club[0] if len(by_club) == 1 else None


def main():
    raw = load_json("clubs-raw.json")
    bios = load_json("wikidata-bios.json", {})
    supplement = {"generatedOn": SUPPLEMENTED_ON, "asOf": ASOF, "license": "CC0-1.0 (Wikidata metadata); identity matches are not certification",
                  "redirects": {}, "qidBios": {}, "matches": {}, "unresolvedCodes": [], "stats": {}}
    # ---- pass 1: renamed / redirected article titles
    titles = sorted({p["wiki"] for c in raw for p in c["players"] if p["wiki"] and p["wiki"] not in bios})
    print("pass 1: titles without bios", len(titles), flush=True)
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        j = api("en.wikipedia.org", {"action": "query", "titles": "|".join(chunk), "redirects": 1, "prop": "pageprops", "ppprop": "wikibase_item"})
        q = j.get("query", {})
        alias = {x["from"]: x["to"] for k in ("normalized", "redirects") for x in q.get(k, [])}
        pages = {p.get("title"): p for p in q.get("pages", {}).values()}
        for t in chunk:
            canonical = t
            for _ in range(5):
                canonical = alias.get(canonical, canonical)
            page = pages.get(canonical)
            item = page.get("pageprops", {}).get("wikibase_item") if page else None
            if item:
                supplement["redirects"][t] = {"canonical": canonical, "qid": item}
        if (i // 50) % 10 == 0:
            print("  redirects", min(i + 50, len(titles)), "/", len(titles), flush=True)
    supplement["qidBios"] = qid_bios([r["qid"] for r in supplement["redirects"].values()])
    print("pass 1 done:", len(supplement["redirects"]), "titles resolved to items", flush=True)

    # ---- candidates for name matching
    clubs_q = club_qids(raw)
    p984 = p984_map()
    have = set(bios) | set(supplement["redirects"])
    cands = []
    for c in raw:
        for p in c["players"]:
            if p["wiki"] and p["wiki"] in have:
                continue
            cands.append((c, p))
    print("candidates without identity:", len(cands), flush=True)
    by_country = collections.defaultdict(list)
    unresolved = collections.Counter()
    for c, p in cands:
        q = country_qid(p.get("nationalityCode"), p984)
        if q:
            by_country[q].append((c, p))
        else:
            unresolved[p.get("nationalityCode") or "?"] += 1
    supplement["unresolvedCodes"] = sorted(unresolved.items(), key=lambda kv: -kv[1])
    print("countries to query:", len(by_country), "unresolved codes:", supplement["unresolvedCodes"][:15], flush=True)

    # ---- pass 2: nationality + name
    matched = 0
    for n, (cq, items) in enumerate(sorted(by_country.items(), key=lambda kv: -len(kv[1]))):
        try:
            rows = footballers_by_country(cq)
        except Exception as e:  # keep going; unresolved rows stay unknown
            print("  country", cq, "failed:", e, flush=True)
            continue
        exact, lax = index_people(rows)
        for c, p in items:
            key = c["id"] + "|" + p["name"]
            hit, method = pick(exact.get(fold(p["name"]), []), clubs_q.get(c["wiki"])), "nationality-name"
            if not hit:
                hit, method = pick(lax.get(loose(p["name"]), []), clubs_q.get(c["wiki"])), "nationality-name-loose"
            if hit:
                matched += 1
                supplement["matches"][key] = {
                    "qid": hit["qid"], "label": hit["en"], "nameAr": hit["ar"],
                    "birthDate": next(iter(hit["dobs"])) if len(hit["dobs"]) == 1 else None,
                    "method": method, "clubConfirmed": bool(clubs_q.get(c["wiki"]) in hit["clubs"]),
                }
        if n % 10 == 0:
            print("  country", n + 1, "/", len(by_country), "matched so far", matched, flush=True)
    print("pass 2 done:", matched, "matches", flush=True)

    # ---- pass 3: club membership + name
    remaining = collections.defaultdict(list)
    for c, p in cands:
        if c["id"] + "|" + p["name"] not in supplement["matches"] and clubs_q.get(c["wiki"]):
            remaining[clubs_q[c["wiki"]]].append((c, p))
    club_ids = sorted(remaining)
    print("pass 3: clubs with remaining rows", len(club_ids), flush=True)
    matched3 = 0
    for i in range(0, len(club_ids), 12):
        chunk = club_ids[i:i + 12]
        try:
            rows = club_members(chunk)
        except Exception as e:
            print("  members batch failed:", e, flush=True)
            continue
        per_club = collections.defaultdict(list)
        for r in rows:
            per_club[qid_of(val(r, "club"))].append(r)
        for cq in chunk:
            exact, lax = index_people(per_club.get(cq, []))
            for c, p in remaining[cq]:
                hit = pick(exact.get(fold(p["name"]), []), cq) or pick(lax.get(loose(p["name"]), []), cq)
                if hit:
                    matched3 += 1
                    supplement["matches"][c["id"] + "|" + p["name"]] = {
                        "qid": hit["qid"], "label": hit["en"], "nameAr": hit["ar"],
                        "birthDate": next(iter(hit["dobs"])) if len(hit["dobs"]) == 1 else None,
                        "method": "club-name", "clubConfirmed": True,
                    }
        if (i // 12) % 10 == 0:
            print("  clubs", min(i + 12, len(club_ids)), "/", len(club_ids), "matched", matched3, flush=True)
    print("pass 3 done:", matched3, "matches", flush=True)
    supplement["stats"] = {
        "titlesWithoutBios": len(titles), "redirectsResolved": len(supplement["redirects"]),
        "candidates": len(cands), "nationalityMatches": matched, "clubMatches": matched3,
        "withBirthDate": sum(1 for m in supplement["matches"].values() if m["birthDate"]),
    }
    dump_json("identity-supplement.json", supplement)
    print(json.dumps(supplement["stats"], indent=2))


if __name__ == "__main__":
    main()
