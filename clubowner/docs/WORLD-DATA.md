# World data provenance and reproducibility — 0.3 snapshot, 0.4 supplement (game 0.18)

Read `public/data-license.html` for complete per-club attribution, revisions,
contributor histories and transcluded template revisions. The distributable
adaptation is `public/data/world-data.zip` under CC BY-SA 4.0, with CC0 biography
fields clearly identified in NOTICE.txt. No logos, portraits or proprietary
ratings are copied. The previous provisional pack remains separate; its
unresolved provenance is recorded in DATA-SOURCES.md.

## Actual pipeline
1. `scripts/data/markets.json`: 50 intended market definitions.
2. `import-wikipedia.py`: cached league discovery with rowspan-aware tables.
   Current-club candidates are NOT independently certified membership.
   In this snapshot Qatar discovery explicitly uses the 2025–26 season;
   Morocco's fallback is also older. The original per-club HTML stage was
   abandoned for rate limiting; **do not restart its bulk main**.
3. `batch-rosters.py`: cached Wikipedia revision queries (30 titles/request),
   two-second pacing, Retry-After >=60s for 429/503, stop after repeated limits.
   Parses first senior squad Fs/Fs2 templates and referenced squad pages.
   Does not use all-time lists or loaned-out/academy tables as senior squads.
4. `wikidata-bios.py`: exact article identity via SPARQL POST batches of 250,
   paced and cached. Only unambiguous day-precision, non-deprecated DOB;
   Arabic labels optional. Retrieval snapshot, not a pinned Wikidata revision.
5. `finish-world.py`: fallback CC0 DOB from openfootball/players at commit
   125d20f7cc06cac7e758b40df535a7695632680a, using unique normalized-name match.
   Archive is read from `.arena/openfootball.tar.gz`, falling back to the
   persisted copy `scripts/data/cache/openfootball-125d20f7.tar.gz` (601 KB,
   same pinned commit). Matching is not independent identity certification.
   Resolves identity keys, excludes deceased records detected in Wikidata,
   excludes conflicting clubs; no fabricated replacement names or birthdays.
6. `build-attribution.py`: generates the public attribution page and data ZIP.

### 0.4 supplement steps (game 0.18, run 2026-09-27 on the frozen 0.3 raw data)
All of them go through `worldlib.py` (2 s pacing per host, Retry-After on
429/503, on-disk cache under `.arena/world-0.18/`, SPARQL 504 → year-range
splitting). Order matters; each is idempotent on its cache.
7. `enrich-identities.py` → `identity-supplement.json`. Pass 1 resolves red
   links / renamed article titles through `wbgetentities` redirects (167). Pass 2
   matches roster names that have no article to living footballers (P106
   Q937857, P27 nationality, born ≥1978, day-precision DOB) by a *unique* folded
   label per country (2,064); pass 3 does the same per club through P54 (23).
   The `method` (`redirect`, `nationality-name`, `nationality-name-loose`,
   `club-name`) is written into every row (`identityMethod`, `biographyMethod`)
   — it is a probabilistic match, not certification, and `finish-world.py`
   rejects name matches whose implied age is outside 16–39.
8. `fill-missing-rosters.py` → `clubs-supplement.json`. For clubs whose English
   article has no supported squad table (19 empty + 1 thin), finds the same
   club's article on another Wikipedia edition through Wikidata sitelinks and
   parses its first senior-squad template (ar/es/fr/it templates; same
   loan/academy exclusions). 14 clubs, 420 rows; 5 clubs still have none
   (`docs/ROSTER-GAPS.md`). Rows keep the other-language article + revision
   as `sourceUrl`/`sourceLang` for attribution.
9. `resolve-conflicts.py` → `conflict-resolutions.json`. Identities listed by
   two clubs (273) are decided by: the player's own infobox `currentclub`
   (106) → open Wikidata P54 membership → article-linked row beats name-only
   matches (8, the name-matched rows stay as unmatched people) → newer source
   page by ≥30 days (47) → plain namesakes without any article kept as distinct
   people (57). 55 stay excluded. This restored e.g. Vinícius Júnior (Real
   Madrid), who the 0.3 rule had dropped because a namesake row was mislinked.
9b. `squad-tables.py` (0.18b) → `identity-supplement.json` `birthdays`,
    `matches`, `tableSources`. For rows still without an item or birthday in the
    Arab, Maghreb and Latin American markets, reads the same club's squad table
    on ar/fr/es Wikipedia (through Wikidata sitelinks; first senior table only,
    ≥11 rows, loan/reserve/youth/women sections skipped). French `Feff joueur`
    and Spanish `Jugador de fútbol` rows carry the birthday inside the table;
    Arabic `تشكيلة لاعب` rows link Arabic articles whose items carry it. Match
    order per player, one table row each, unique on both sides: English
    sitelink → same item → equal folded name/word set → same shirt number and
    position group as the pinned English revision (only when the table is a
    2026/27 or calendar-2026 list, and the names are ≥0.5 similar) → same
    position and ≥0.85 spelling similarity. Wikidata's single day-precision
    date wins over a table date; a contradiction drops the date
    (`dobConflict`). Methods `arwiki-*`/`frwiki-*`/`eswiki-*` are written to
    `identityMethod`/`biographyMethod`; the pages are listed per club on the
    attribution page. Default plan: fr → tn ma dz; ar → eg sa qa ae tn ma dz;
    es → co bo uy ar ve pe cl py ec (`python3 scripts/data/squad-tables.py`, or
    `squad-tables.py <lang> <markets…>`).
10. `finish-world.py` merges everything and writes the final pack (manifest id
    `world-wikipedia-20260924-v2`): after 0.18b, 23,463 players (0.17: 22,818),
    17,937 with a Wikidata item (was 15,371), 4,272 unknown birthdays (was
    7,459; 6,273 before the squad-table pass), 5 clubs without players (was 19),
    57 conflicting identities excluded, 2,049 birthdays credited to ar/fr/es
    squad tables (`manifest.tableBirthdays`, 262 pages in
    `identity-supplement.json` `tableSources`). `roster-gaps.py` writes `docs/ROSTER-GAPS.md`;
    `check-star-profiles.py` verifies every `starProfiles.js` key.

For this frozen snapshot, shipped JSON files are the authoritative inputs to
the game. Re-querying mutable sites will produce different coverage/revisions.
Caches under `.arena` are intentionally not in the source release. Raw roster
adaptations, biography snapshots and final JSON are included. Python deps:
`pip install -r scripts/data/requirements.txt`. Run scripts from project root.

## Model vs source
`src/models/ability.js` + `src/data/starProfiles.js` are deterministic game
estimates. `src/data/packs/world.js` joins the separate data to the model.
DOB null => seeded simulation age drawn per row from a bell curve (Bates(3),
mean 25.5, sd ≈4, clamped 18–36, goalkeepers +1.5), flagged `ageEstimated`
and shown with "~"; never fabricated as an actual birthdate (0.18; 0.3–0.17
used a flat 23). `starProfiles.js` holds 1,059 editorial profiles keyed by
exact article title (rating, position, distinctive attributes, potential for
players ≤23); they are calibrated by identity and age for 2026/27 and are
game estimates, not real assessments.
Detailed position, preferred foot, ability, potential, professionalism, natural
fitness, susceptibility, wages, transfer value and contract dates are modelled.
Training/development/decline integration is partial, not a completed scouting
or physiology engine. Clubs without rosters stay empty in coverage.

All country groups are transfer pools, not independently simulated competitions.
The world pack does not expand the four selectable ownership clubs yet.
