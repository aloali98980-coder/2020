## 0.10 FIFA addition
`services/fifa/{engine,access,draw}.js` + `core/fifaValidation.js` + `features/fifa/cards.js`. `fifaGuests.js` registers six real cup-only opponents without changing selectable clubs or division membership; existing Auckland remains one identity. `fifaVersion` gates old-save behavior until rollover. Four-year qualification history is separate from general history. No promotion-code or league-data changes. See docs/FIFA-0.10.md.

## 0.9 competition addition
`services/competitions/{engine,presets,draw,qualification,table,domestic}.js` is separate from UEFA. `features/competitions/cards.js` renders it; `core/competitionValidation.js` validates graph/results; calendar explicitly dispatches both engines. A shared UEFA shootout helper preserves existing UEFA semantics. Schema 9 migration preserves active cups and selects new formats only at rollover via `competitionVersion`. See docs/COMPETITIONS-0.9.md for boundaries. League membership/promotion code unchanged.

> **0.8 / save v8:** `data/legacyExpandedCatalog` retains old identities; `expandedCatalog` seeds the new scoped membership from reviewed `pyramidMembership`, `topMembershipCorrections`, `reserveClubs` and `pyramidCoverage`. Migrations never reconstruct saved club/division arrays. `promotionRules` implements version-2 grouped ranked exchanges, closed connections and parent/reserve constraints; old saves keep their prior promotion version. Non-Egyptian official play-offs remain unimplemented. `localSaveCodec` stores a header and 256-player compressed binary batches in one immutable IDB snapshot, reading one batch at a time. It reads old object snapshots too. `saveCompression` exports streamed gzip and bounds decoded backup size at 160 MiB. No player IDs are removed; 50k total records remains an explicit long-career limit. See RELEASE-0.8 and review/release-v08.json.

> **0.5 / save v5:** `services/europe/{draw,table,engine}` للقرعة والمفاضلة وشجرة الإقصائيات؛ `services/calendar` لتجميع المواعيد وحجز الكؤوس وإعادة توزيع الدوري المستقبلية؛ `core/europeValidation` يتحقق من الأوعية والمواجهات والتقدم؛ `features/europe/cards` يعرض الجدول والشجرة. المنافسات القديمة تُبقى كما هي عند الترحيل، وتُنشأ صيغة أوروبا الجديدة عند rollover فقط. التصدير JSON compact يحافظ على البيانات ويخفض حجم النسخ الناضجة.

> **0.4:** `expandedCatalog` يضيف أندية الدرجات الأقل؛ `generatedPlayers` مولّد مستقل؛ `pyramid` للجداول والكؤوس والصعود؛ `commerce` للدخل؛ `clubManagement` و`internationals` للإدارة والاستدعاءات؛ `expansionValidation` يتحقق من البيانات ويربط جدول النادي بمسابقة العالم بعد استيراد JSON. الحفظ v4، والعالم الموسع اختياري للحفظة الجديدة فقط.

> تحديث 0.3: حزم بيانات عالمية منفصلة، نموذج قدرات حتمي، ترحيل صيغة v3، وحفظ IndexedDB بلقطات ثابتة ومؤشرات localStorage للحالية والسابقة. راجع docs/RELEASE-0.3.md وdocs/WORLD-DATA.md للتفاصيل الحديثة.

# Architecture & invariants

## Boundaries

The engine uses plain serializable objects and has no DOM or SwiftUI dependencies. Services modify a supplied state; they never import a global UI store. Views return presentation markup and dispatch commands through the application layer. The store clones the state, applies the command, validates and persists the draft, and only then commits it.

The original demo catalog remains available for classic careers. Separate current/world snapshots and the expanded club catalog seed larger careers, with explicit coverage and provenance caveats. Saved instances own their evolving contracts, identities and facilities; catalogs do not overwrite them each tick. Expanded careers include lightweight global leagues, modeled lower divisions and versioned European formats, not complete official regulations for every country.

## Financial invariants

- EGP only, represented as safe integer whole pounds; no floating point currency balances.
- Every money movement uses `post()` and has a unique idempotency key.
- `initialCash + sum(ledger.amount) === cash` is validated at every commit/import.
- Future payments are obligations with due dates and a paid/pending state.
- Loans are funding, not operating cash income. The UI does not label cash receipts as accounting profit.
- Salary and operating cost entries have a monthly unique key; repeated processing cannot charge them twice.
- Transfer fee, agent fee and signing bonus are separate ledger entries.
- Project commitments do not reserve cash; the UI requires full cost liquidity at commitment, then deducts 40% and schedules the rest. Later spending may still create a cash deficit; this produces an inbox warning. This tradeoff is explicit.

## Time & decisions

`advanceTime(state, days)` advances one day at a time and returns the number advanced and whether it stopped for a required action. Existing required actions block advancement; marking a message read does not resolve its action. Remaining time is saved and can be resumed. A blocked click does not overwrite an already partially consumed time request.

Tick sequence: increment date → settle finance → complete facilities → expire sponsorships → recovery/development/expiring player contracts → matches → scheduled decision events → inspect pause policy. It never skips over a blocking date during a weekly request.

Required messages refer to a negotiation, player or asset ID, not a second mutable copy of the deal. Transactions update the original entity and resolve associated messages. Non-required reports remain non-blocking.

## Transfers

States: `waiting → club-reply → personal → signed`, with rejection possible along the way. The club responds the next simulated day. Accepting its response is NOT signing the player. Signing checks liquidity, salary budget and a prototype 30-player squad cap. The physical examination is explicitly simplified as passed. Registration regulations, transfer windows, sale offers and detailed promise consequences are not yet modeled.

## Sponsorship rights

Six distinct assets. One active agreement per asset. Sector exclusivity is checked for conflicting sponsors. A contract pays 25% on signature and eleven future payments every 30 days; rounding goes into the final payment so the sum exactly equals the contract value. Marketing-deliverable simulation and renewal negotiation are future work.

## Facilities

A facility has level, recurring cost, specialist employment and at most one project. Projects retain start/end dates, price and agreed upkeep. Effects are applied only on delivery. Training and academy development and medical recovery also require the specialist. Stadium demand is capped by current usable capacity and responds to ticket price and fan confidence. The construction model has no random delay or contractor risk yet.

## Simulation fidelity

Classic careers retain the fixed 8-team, 14-round demonstration league. Expanded careers simulate available divisions and promotion, with detailed owner fixtures and lighter background results. The save owns its deterministic random seed. The owner can select a lineup, coach and one of three tactical approaches; unselected slots are filled automatically. Goals, appearances, morale, fitness and home commerce are recorded. Europe has league phases and aggregate ties; access lists, coefficients, calendars and prize money remain modeled. Other cup formats remain simplified.

## Persistence and safety

Versioned saves, a previous-save backup, structural/cross-reference validation, and explicit confirmation before replacing a career. Versions 1–4 migrate to v5 without replacing player identities; unknown future schemas are rejected. Small classic saves use localStorage; world saves use immutable IndexedDB snapshots referenced by localStorage pointers. Compact JSON export/import and mature full-world backups are browser-tested. No cloud sync, analytics, user accounts or simulation worker thread exist; physical-device and multi-decade testing remain outstanding.

## Test coverage

Node tests cover interruption/resumption, read-vs-resolve semantics, deterministic results, fixture uniqueness, ledger idempotency, deal stage transitions, duplicate rights, installments, completed projects, staff gating, loans, renewals, save roundtrip and invalid imports. Browser checks cover navigation and an actual transfer/facility/sponsor/loan flow on Chromium; a WebKit mobile-emulation flow checks transfer signing and persistent settings. Physical device testing is still required.

## Production packaging and offline shell (0.1.1)

Vite still consumes separate source modules. The deployment build is an optimized static bundle, not the editable architecture. `scripts/build-offline.mjs` hashes the built contents and generates a versioned worker with a precache list. Every resource is local, including fonts. Runtime save data stays in IndexedDB/localStorage, depending on the career, and never goes into service-worker caches. The worker is registered in production only. Navigation uses network first and the matching precached index when offline; network HTML is not stored over another version's shell. Older caches are retained so an already-open older tab is not broken by a newer deployment. Cleanup of old caches is a future enhancement.

Worker activation waits for user confirmation (or for all old tabs to close). Updates can be deferred; the confirmation warns that unsent forms are discarded on reload. The iOS setup guide explicitly describes Safari installation, secure context, initial cache download, possible separate standalone storage and export/import. `_headers` and robots/meta noindex reduce indexing but provide no authentication; host-level private visibility or an authentication system is still needed for privacy.


## v0.2 additions
- `data/packs/current-2026.js`: curated provisional real-name snapshot, factual vs estimated fields.
- `models/player.js`, `models/difficulty.js`: career defaults, age reference, economic presets.
- `services/careers.js`, `staff.js`, `clubEvents.js`, `contractClauses.js`, `season.js`: lifecycle, appointments, explicit choices, contractual consequences, annual schedule archive.
- `core/migrations.js`: v1 -> v2 adds defaults, preserving identities/cash/date. Import/load migrates before validation; version-2 malformed state is rejected, not silently repaired.
- `i18n/`: local presentation dictionaries plus explicit tr() calls, preserved option IDs/roles, locale formatting, persisted language, RTL/LTR. EN/FR are beta, not full narrative translation. No translation service or network dependency.
- `features/careers.js`, `events.js`, `dataSources.js`: independent interfaces; `styles/readability.css` adds local Cairo and mobile sizes.
- Added integration tests include one simulated year and old-save migration, browser language/contract/staff/event flows.

## v0.5 competition invariants
- League-phase fixture records are canonical; `results` remains empty for `engine: europe-v1`, preserving a separate legacy cup path. First legs and league draws have no forced winner.
- Table order recomputes opponent aggregates. Knockout `ranking` freezes after the league phase; modeled coefficients for the current season do not change mid-season.
- Knockout ties reference ordered leg IDs. Aggregate goals include extra time, never shootout kicks. A neutral final earns no owner-stadium gate money.
- Cup priority scheduling never changes a played fixture. Future domestic matches move forward if necessary; model international windows and three-date-day spacing apply. Stage planning marks the calendar dirty and rebalances once per tick.
- All domestic fixtures keep the original root/own-division alias after JSON validation. Old 0.4 saves retain their current cup format and results; the next rollover creates the new European competitions.
- `encodeSave` emits compact JSON. Pretty-printed full-world saves exceed 80 MiB after a season, so default export must not reintroduce indentation. Tests retain pretty-input compatibility within the limit and exercise mature compact UI import/export.
- Tests: `npm test`, `node tests/europe-browser.mjs` (dev), `node tests/full-world-v05.mjs`, then `node tests/mature-save-browser.mjs`. Actual 0.4 migration additionally requires extracting the delivered source archive into `.arena/v04-original`. No test fixture or generated 63 MB career is included in the source ZIP.


## 0.6 modules
- `data/egyptPyramid.json`: attributed factual compilation, separate from Wikipedia-derived historical membership.
- `services/promotion.js` and `leagueTable.js`: regional playoff progression, head-to-head ranking and atomic season moves.
- `services/loans.js`, `employment.js`, `market.js`: negotiated loans, actual-fixture appearances, retained salaries, reserved return capacity and scenario windows.
- `services/tactics.js` / `features/management/*`: positional selection and tactical UI.
- `core/managementValidation.js`: v6 loan, tactic and playoff validation. Migration deliberately keeps old membership, open market and old tactical mode.

- `services/saveEncoding.js`: bounded-array Blob parts for browser backup export; byte-identical JSON without building a single giant UTF-16 string.

## 0.7
`services/talent/{state,academy,scouting,training,world}.js` separate intake decisions, scouting reports, development and NPC succession. Trainees remain outside first-team payroll; signing/release moves the same object/ID into the world. Population cap includes candidates. `playerRoles.js` owns role-fit/effects; `talentValidation.js` validates new state. `features/talent.js` composes the new careers hub; general source metadata stays intact despite removal of per-player generated badges.

## 0.11 — Asian competitions
- `data/asianGuests.js`: real cup-only identities, not new selectable leagues or player rosters.
- `services/asia/{access,draw,table,engine}.js`: 84 unique initial routes, Elite column graph, recursive group ranking, preliminary transfers and regional knockout paths.
- `core/asiaValidation.js`: phase, participant, draw, fixture, aggregate, ranking and source-link checks.
- `features/asia/cards.js`: transparent qualification, region tables, pots/columns and results.
- Shared calendar includes Asia fixtures; FIFA access accepts known Asian guests with saved performances. Schema 11 preserves the old season until rollover.

## 0.12 — CONCACAF competitions
- `data/concacafGuests.js`: 30 real cup-only identities (Central America 20, Caribbean 10), not new selectable leagues or player rosters.
- `services/concacaf/{access,table,engine}.js`: 27/36/20/10 routes, seeded R1/R16 draws, competition-record hosting ranks, away-goals regulation tiebreakers, Leagues Cup 3/2/1 tables, play-in and third-place paths, honours-fed next-season access.
- `core/concacafValidation.js`: phase, participant, draw, fixture, aggregate, ranking, seed and progression checks.
- `features/concacaf/cards.js`: transparent qualification, group/league tables, pots and results.
- Champions Cup keeps kind `concacaf`, so FIFA and Intercontinental integration is unchanged; CWC access accepts known CONCACAF guests with saved performances. Schema 12 preserves the old season until rollover.

## 0.13 — Domestic cups for all markets
- `services/competitions/presets.js`: `DOMESTIC` grows from 6 to 50 entries (cup/super names, super sizes 4 for EG/ES/IT/SA else 2); the six original entries are byte-identical.
- `services/competitions/domestic.js`: `createDomestic` declines degenerate entry so it falls back to the legacy knockout; `superCupsDay` unchanged in logic, now covering every market.
- `core/game.js` + `core/migrations.js`: `SAVE_VERSION` 13; v12 saves migrate with current-season cups untouched and upgrade at rollover without a new version flag.
- No engine/UI/validation changes: the `continental-v1` knockout, `competitionCard` and `validateCompetition` already generalized; the section header now reads domestic cups and super cups.

## 0.14 — Qualification, calendar and prize review
- `services/calendar.js`: `cupFixtures` now includes `concacaf-v1`, so all newly scheduled fixtures respect the 3-day rest rule against CONCACAF matches; baked old-season schedules are kept as-is.
- Prize tiering follows one pattern in all five engines: exported `*_PRIZE_FACTOR` maps plus `*Prize` helpers (base × tier). Europe (UEL ×0.5, UECL ×0.25), continental (Confed/Suda ×0.6, domestic ×0.4, super-domestic ×0.25, super-caf ×0.6, Recopa ×0.8) and FIFA (Intercontinental ×0.6) gain tiers; Asia/CONCACAF keep their established factors with the same exported shape. The continental round-win prize is capped at 3M so it can never exceed its own 3.5M final.
- Qualification audit: no entry bug found; primary/secondary lists are disjoint per region (documented overlaps: Leagues Cup, CWC/IC, domestic side cups) and locked by a cross-engine matrix test.
- `core/game.js` + `core/migrations.js`: `SAVE_VERSION` 14; the v13→v14 migration is stamp-only (code-driven behavior), so old/new engines diverge by design and the byte-identity test is retired.

## 0.15 — Sponsorship economy and currencies
- `data/localSponsors.js`: 150 fictional local sponsors (3 per market); `services/sponsors.js` mixes two owner-country locals with one rotating global per asset via `resolveSponsor`, keeping the amount formula and sector-exclusivity rules.
- `data/currencies.js` + `ui/format.js`: one fixed modeled display rate per market; `moneyLocal` renders EGP amounts in the club-country currency, labeled as a fixed display rate. Storage and simulation stay in EGP.
- `paySponsorBonuses` (called from `rollover` after `createCups`): uniform 20/15/15% performance bonuses for league title, domestic cup and continental qualification, posted once per season per active contract.
- `SAVE_VERSION` 15; the v14→v15 migration is stamp-only and additive (locals and bonuses apply to current contracts immediately).

## 0.16 — Economy completion
- `services/sponsors.js`: `negotiateSponsor`/`answerSponsorDeal` add a 2-round counter-negotiation (accept/counter/walk on reputation+trust thresholds); revised offers keep the 360-day shape so signing, exclusivity and bonuses apply unchanged.
- `services/market.js`: `aiTransferDay` runs monthly inside windows (≤3 budget/level-checked AI-to-AI moves, press-logged, counts preserved); `windowStatus` feeds the market-screen banner.
- `services/commerce.js`: `TICKET_CATEGORIES` (standard/first/vip) with per-tier demand, `setMatchPremium` for one home gate, subscribers always seated in standard first (never double-billed).
- `services/clubManagement.js`: 8 fictional coaches with 1–3 year dated contracts (`renewCoach`, tenure-scaled dismissal, auto-expiry).
- `SAVE_VERSION` 16; the v15→v16 migration is additive (deal ledger, tier prices, premium, coach dates).

## 0.17 — Legends
- `data/legends.js`: editorial catalogue of 148 real retired legends (`sourceStatus: "legend-editorial"`), club names resolved to game ids at load (`resolveLegendClub`), derived tier/specialty/attributes, optional `rivals`.
- `services/legends.js`: `legendQuote` (pure, deterministic pricing + accept/counter/refuse), `signLegend`/`renewLegend`/`releaseLegend`, `legendDay` (monthly salaries, position-group coaching gains capped at potential, ambassador income/reputation, contract expiry, comeback-player retirement + hall induction), `legendMatchBonus` (hooked in `matches.strength` for the owner's club), `legendWearFactor` (hooked in `careers.agingDay`), `inductRetiree` (hooked in `careers.retirementDay`).
- `core/legendsValidation.js`: `validateLegends` invoked from `validateSave` (unique ids, one active contract per legend/role, ≤2 comeback players, player refs carry `legendId`).
- `features/legends.js`: hall screen (contracts, filtered catalogue, hall of legacy) and modals (`legend-offer-form`, `legend-renew-form`, release confirm); `main.js` wires actions/forms and the `legend-player-mode` switch.
- `SAVE_VERSION` 17; the v16→v17 migration only adds `s.legends` (`initLegends()`).
