> هذا الملف يصف حزمة 0.2 القديمة فقط. لقاعدة 0.3 العالمية المرخصة واستكمالها في 0.18 (إصدار بيانات 0.4) راجع [WORLD-DATA.md](WORLD-DATA.md) و[ROSTER-GAPS.md](ROSTER-GAPS.md) و`public/data-license.html`.

# Limited 2026/27 factual snapshot

Reviewed 2026-09-24. Manual selection, 86 names with all markets enabled. Membership and reference ages are provisional; this is not a live feed or an official registration database.

| Team | Selected players | Source |
|---|---:|---|
| Al Ahly | 18 | https://www.espn.com/soccer/team/squad/_/id/10207/al-ahly |
| Zamalek | 18 | https://www.transfermarkt.us/zamalek-sc/kader/verein/664 |
| Al Masry | 16 | https://www.espn.com/soccer/team/squad/_/id/7339/al-masry |
| Al Ittihad Alexandria | 18 | https://www.soccerway.com/team/al-ittihad-alexandria/WpApD7JG/squad/ |
| Manchester City | 8 | https://www.espn.com/soccer/team/squad/_/id/382/manchester-city |
| Al Nassr | 8 | https://www.espn.com/soccer/team/squad/_/id/817/al-nassr |

ESPN team ID 817 identifies Al Nassr even when a stale `/al-hilal` URL slug is accepted. Al Masry's page presented inconsistent season labels (2026/27 title versus 2025/26 selector); treat its roster as especially provisional. Two insufficiently supported Masry entries were removed before release. A player listed in conflicting Ahly/Masry material was not included. Lists are deliberately partial rather than represented as complete.

Exact birthdays are not established. The game stores source age + reference date and approximates annual age progression. Detailed sub-positions are simulation classifications where sources only supply a broad position. Ability ratings, potential, preferred foot, financial values, contracts, staff aptitude and all career narratives are game estimates. `sourceStatus: provisional`, `estimatedFields`, and source links preserve that separation in the pack.

No photographs, official crests, proprietary commercial-game ratings, or complete copied database. Data redistribution/licensing clearance has not been established. Review rights and procure a suitable source before broad commercial publication. Source links acknowledge provenance; they are not a licence or endorsement.

Fonts: Cairo from Google Fonts (SIL OFL), bundled locally with `public/fonts/Cairo-OFL.txt`; legacy Noto Sans Arabic files retained with their OFL notice. No runtime font CDN is required.

## Legends catalogue (0.17)

`src/data/legends.js` lists 148 retired footballers by their real names (Arabic and Latin), birth year, main position, playing era, a few career clubs, a one-line biography, and a Wikipedia title used only to build a reference link. Peak rating, the six attributes, tier, transfer fees, salaries, acceptance responses, and every in-game effect are **editorial estimates for simulation** (`sourceStatus: "legend-editorial"`), not official statistics, awards records, or statements by the people or clubs involved. Club lists are abbreviated to well-known spells. No photographs, quotes, or proprietary ratings are used. The optional "comeback as a player" mode is explicitly labelled as fantasy in the UI.

## Attribution inside saves (0.20)

Until 0.19 every world-pack player carried its own copy of the attribution fields (`sourceUrl`, `biographyUrl`, `sourceAsOf`, `sourceStatus`, `sourceLicense`, `sourceSeasonText`, `estimatedFields`) plus the default `abilityMethod` string — roughly 250 bytes per player, ~12 MB of a full-world save, repeated in every save. Since 0.20 these values are **derived at display time** from the bundled pack (`src/models/provenance.js` → `provenance(p)`; the pack keeps them per row in `src/data/packs/world/players.json` and `clubs.json`). Nothing changes in what the player profile, the sources screen or `public/data-license.html` show, and the licence obligations are unchanged: the source page, the CC BY-SA 4.0 / CC0 notices and the estimated-field list are still available for every imported name.

Rules:

- Records that carry explicit values (the 0.2 `current` pack, legends, generated players' `sourceStatus: simulated`, or any imported save whose fields differ from the pack) keep them; explicit values always win over the derived ones.
- `abilityMethod` is stored only when it is not the default (`editorial-estimate` for the 1,059 star profiles). An absent method with `abilityVersion` present means `seeded-role-age-estimate`.
- The v18 migration drops the copies only when they are byte-for-byte equal to the pack's values; anything else is preserved.
- Retirees are archived (`s.retired`) with `sourceUrl`/`biographyUrl` only if they were explicit; for pack players the archive entry is resolved through the pack like an active player.
