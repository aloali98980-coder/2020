"""Shared helpers for the 0.18 roster-completion scripts.

Polite, cached access to the MediaWiki API and the Wikidata SPARQL endpoint:
one request at a time, two-second pacing, Retry-After honoured, hard stop on
repeated limiting (never bypassed). Everything fetched is cached under
`.arena/` so a re-run costs no network. Data policy is unchanged from 0.3:
CC BY-SA squad adaptations, CC0 Wikidata metadata, no invented people.
"""
import hashlib, json, pathlib, re, time, unicodedata, urllib.parse
import requests

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "src/data/packs/world"
CACHE = ROOT / ".arena/world-0.18"
CACHE.mkdir(parents=True, exist_ok=True)
HEADERS = {
    "User-Agent": "ClubOwnerPrototype/0.18 (noncommercial educational football game; "
    "Wikipedia CC BY-SA roster review + Wikidata CC0 biography review; cached, serial, paced requests)"
}
SPARQL = "https://query.wikidata.org/sparql"
ASOF = "2026-09-24"          # roster snapshot the 0.3 pipeline froze
SUPPLEMENTED_ON = "2026-09-27"  # this completion pass
_last = {"t": 0.0}


def _pace(seconds=2.0):
    wait = seconds - (time.monotonic() - _last["t"])
    if wait > 0:
        time.sleep(wait)
    _last["t"] = time.monotonic()


def _cache_file(kind, key):
    return CACHE / kind / (hashlib.sha1(key.encode()).hexdigest() + ".json")


def api(host, params, kind="api"):
    """GET a MediaWiki API call (any language wiki), cached by parameters."""
    params = {**params, "format": "json", "maxlag": 5}
    f = _cache_file(kind, host + json.dumps(params, sort_keys=True, ensure_ascii=False))
    if f.exists():
        return json.loads(f.read_text())
    f.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(4):
        _pace()
        r = requests.get(f"https://{host}/w/api.php", params=params, headers=HEADERS, timeout=95)
        if r.status_code in (429, 503):
            wait = max(60, int(r.headers.get("Retry-After", "60") or 60))
            print("RATE LIMIT:", host, "waiting", wait, "s", flush=True)
            time.sleep(wait)
            continue
        r.raise_for_status()
        j = r.json()
        if j.get("error", {}).get("code") == "maxlag":
            time.sleep(30)
            continue
        f.write_text(json.dumps(j, ensure_ascii=False))
        return j
    raise RuntimeError("Repeated rate limiting: stop, keep cache, resume later")


def sparql(query, kind="sparql"):
    """POST a SPARQL query to Wikidata, cached by query text."""
    f = _cache_file(kind, query)
    if f.exists():
        return json.loads(f.read_text())
    f.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(4):
        _pace(1.5)
        r = requests.post(SPARQL, data={"query": query, "format": "json"}, headers=HEADERS, timeout=175)
        if r.status_code in (429, 503):
            wait = max(45, int(r.headers.get("Retry-After", "45") or 45))
            print("SPARQL LIMIT: waiting", wait, "s", flush=True)
            time.sleep(wait)
            continue
        if r.status_code == 504 or (r.status_code == 500 and "TimeoutException" in r.text):
            raise TimeoutError("SPARQL timeout")
        r.raise_for_status()
        rows = r.json()["results"]["bindings"]
        f.write_text(json.dumps(rows, ensure_ascii=False))
        return rows
    raise RuntimeError("Repeated SPARQL limiting: stop, keep cache, resume later")


def val(row, key, default=None):
    return row.get(key, {}).get("value", default)


def qid_of(uri):
    return uri.rsplit("/", 1)[-1]


def fold(name):
    """Accent/case/punctuation-insensitive key (same as finish-world.py)."""
    return "".join(c for c in unicodedata.normalize("NFKD", str(name)).lower() if c.isalnum() and not unicodedata.combining(c))


_TRANSLIT = [
    (r"\bmohammed\b|\bmuhammad\b|\bmuhammed\b|\bmohamad\b|\bmohammad\b", "mohamed"),
    (r"\bahmad\b", "ahmed"),
    (r"\byousef\b|\byusuf\b|\byoussef\b|\byousuf\b|\byusef\b", "youssef"),
    (r"\babdul\b|\babd el\b|\babdel\b|\babdul-", "abdel"),
    (r"\bel[- ]", "el"),
    (r"\bal[- ]", "al"),
    (r"\bhussein\b|\bhossein\b|\bhusain\b", "hussein"),
    (r"\bmahmoud\b|\bmahmud\b", "mahmoud"),
    (r"\bkarim\b|\bkareem\b", "karim"),
    (r"\bibrahim\b|\bibrahem\b", "ibrahim"),
    (r"\bsaid\b|\bsaeed\b|\bsayed\b", "said"),
    (r"\bosama\b|\busama\b", "osama"),
]


def loose(name):
    """fold() after a few common Arabic-Latin transliteration normalisations."""
    s = unicodedata.normalize("NFKD", str(name)).lower()
    s = "".join(c for c in s if not unicodedata.combining(c))
    for pattern, repl in _TRANSLIT:
        s = re.sub(pattern, repl, s)
    return "".join(c for c in s if c.isalnum())


def wiki_url(host, title, revision=None):
    u = f"https://{host}/w/index.php?title=" + urllib.parse.quote(title.replace(" ", "_"))
    if revision:
        u += "&oldid=" + str(revision)
    return u


def load_json(name, default=None):
    p = OUT / name
    return json.loads(p.read_text()) if p.exists() else default


def dump_json(name, data, pretty=False):
    (OUT / name).write_text(
        json.dumps(data, ensure_ascii=False, indent=2 if pretty else None, separators=None if pretty else (",", ":"))
    )
