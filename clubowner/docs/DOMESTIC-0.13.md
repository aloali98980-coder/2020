# Domestic cups and super cups 0.13 — implementation boundary

Reviewed 2026-09-26. This phase extends the full domestic engine from 6 to all
50 loaded markets. It is **part of the competition work**, not completion of
the final game.

## Implemented

- Fifty full domestic cups, one per market, on the existing `continental-v1`
  knockout engine: single-leg ties, neutral final, extra time then penalties,
  no away-goal rule. Spain/Italy keep two-legged semi-finals; England keeps
  neutral semi-finals. Entrants are the loaded tiers only, reserve clubs
  excluded; first-round byes avoid inventing clubs.
- Fifty domestic super cups, played at the end of the same game season from
  saved league/cup results with duplicate replacement: 4 clubs in
  Egypt/Spain/Italy/Saudi Arabia, 2 everywhere else. All super fixtures are
  neutral. Egypt's final permits extra time; the rest use direct penalties.
- Cup names follow the established national title where one exists
  (Taça de Portugal, Copa do Brasil, Emperor's Cup, Coupe du Trône, Nedbank
  Cup, …); all 100 cup/super names are unique. Entry rounds, draws, dates,
  prizes and super sizes/existence beyond the previously verified six are
  game scenarios, not certified official formats. There is no second cup per
  market (no EFL Cup, no Egyptian League Cup).
- `domesticHonours` is now recorded for all 50 markets at cup completion and
  feeds the secondary continental path (e.g. a Moroccan cup winner takes
  Confederation Cup priority), exactly as the old six did.
- Degenerate entry (fewer than two eligible clubs) declines the full cup and
  falls back to the legacy simplified knockout instead of inventing clubs.
- Migration is schema 13 with no new version flag: old saves keep their
  current-season cups untouched (legacy cups finish under legacy rules), the
  44 new super cups play at the end of the current season from saved results,
  and all 50 full cups activate automatically at rollover when `createCups`
  runs again. Pre-0.9 saves (`competitionVersion: 0`) upgrade the same way
  at their next rollover.
- Owner clubs in new markets play real squad ties with home gates on
  non-neutral ties, no double counting on replay, and cup prize/result
  messages. UI renders all 50 cards with ties, results and qualification
  notes; the legacy section now only carries the UEFA Super Cup in new games.

## Evidence (all on the final 0.13 build)

- Unit: `review/unit-v013.txt`, **164/164 passed** (10 new domestic tests:
  50-cup coverage/entrants, synthetic completion with exact fixture counts
  `entrants−1` (+2 for Spain/Italy), Saudi 4-team super gates/reasons/
  idempotency, Moroccan cup-winner Confederation priority, degenerate
  fallback, v012 migration load, 10-day old-vs-new byte identity, 30-day
  legacy continuation, owned Saudi club gates, name uniqueness).
- Full world: `review/full-world-v013.json`, **3 seasons**, 50 markets /
  116 divisions, 46,931 → **49,012 players**; 50 cups + 50 supers with
  winners every season, 1,810 cup matches per season; Asia/CONCACAF/FIFA
  counts exact (regression net); daily ≥3-day rest across season 1 for all
  fixtures the calendar sees (see known issue below); byte-exact save
  roundtrip (110,920,664 raw / 9,831,584 gz); 259s server-side.
- Migration: `review/actual-v012-migration-v013.json` — authentic v012
  full-world save (80 old-engine days), migrated to 13 with cups untouched,
  **10 days byte-identical** between old and new engines, season 1 finished
  (all 50 new supers in history with winners), rollover activates 50 full
  cups, players/history retained.
- Browser: `review/domestic-browser-v013.json` — **Chromium + WebKit passed**
  at 390px (each engine in its own process): Saudi start, 50 domestic cards,
  own club in King Cup, mid-season full-world import → reload → export
  **byte exact**, advance + IDB reload, authentic v012 import preserves cups
  (6 full + 44 simplified shown), no errors, no horizontal overflow.
- Offline: `review/offline-v013.json` — current-build **Chromium offline
  passed** (24 resources, cache `club-owner-8a4cd13c7779`); no physical
  iPhone certification.

## Explicitly NOT official / NOT done

- Entry lists, entry rounds, draws, dates, hosts, prizes and most super-cup
  sizes/existence are scenarios. Super cups for markets without an
  established one (e.g. Scotland, Switzerland, USA, Australia, India) exist
  in-game as modeled season-end events and are labelled as simulation.
- The six original cup behaviours are byte-identical to 0.12 (verified by
  the old-vs-new comparison); only coverage grew.
- No separate League Cups, no county/regional cups, no cup-winner European
  exceptions beyond the existing secondary-continental priority.

## Known issues (carried + newly found)

- **NEW, pre-existing 0.12 bug, fix deferred:** `cupFixtures` in
  `src/services/calendar.js` does not list `concacaf-v1`, so CONCACAF
  fixtures are invisible to rest enforcement, `availableDate` scheduling,
  rebalancing and the rest-gap checks. Measured on real saves: ~160 fixture
  pairs under 3 days rest in the 0.13 mid-season save (175 in the v012
  baseline), **all** involving a CONCACAF fixture — including same-day pairs
  (e.g. league + Leagues Cup on 2026-10-31) — and **zero** violations among
  all other competitions. Seasons still complete with winners everywhere; no
  crash or block. The fix is one line (add the engine to the list) but
  changes scheduling behaviour, so it is scheduled for the calendar-review
  phase with fresh baselines instead of voiding this phase's byte-identical
  migration proof. This corrects the scope of the 0.12 rest claim.
- **WebKit sequential memory (extends the 0.11/0.12 note):** running the
  Chromium and WebKit suites back-to-back in one process crashed WebKit on
  the large import after the heavy 100-card world render in this 2 GiB
  sandbox. Each engine passes standalone (mid-season import, export,
  advance, v012 import). Not an application fix; large-save switching stay
  a prefinal concern, and no physical iPhone is certified.
- **50k cap:** three full-world seasons end at 49,012 players; long careers
  still need a capacity solution before the final version.
- Test maintenance: the europe 320-day window became until-completion
  (≤400 days) because the 30-club leagues' new supers finish ~day 326; the
  season itself runs 365 days. Rest-gap and completion assertions are
  unchanged and now cover ~100 engine cups.
- Discovered invariant (documented, not changed): `validateExpansion`
  re-aliases `s.fixtures`/`s.table` with the own division's arrays after
  checking equality; a JSON round-trip breaks that alias, so tests must
  validate JSON-parsed saves before ticking them — production imports
  always do.
