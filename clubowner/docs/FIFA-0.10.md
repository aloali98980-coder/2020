# FIFA competitions — 0.10 boundaries and sources

Reviewed 2026-09-26. Implements the **agreed 32-club game format based on 2025**, not a declaration that the 2029 regulations or host are finalized. Reports about 2029 expansion conflict; no unverified 48-team announcement is implemented or certified.

## Club World Cup
- 32 distinct clubs, eight groups of four, single round robin (three games each). Top two to round of 16; fixed opposite-half paths for teams from the same group; single neutral knockouts, extra time then penalties, no third-place match. **63 matches**.
- Four-year cycle: first 2029 in a new September-2026 career, then 2033/2037. The target year is stored separately from season number; no extra edition every time a career is reloaded or imported. Group dates start from modeled June 15; the shared rest scheduler may move dates.
- Allocation follows the 2025 structural template: UEFA12, CONMEBOL6, AFC4, CAF4, CONCACAF4, OFC1, host1. **USA is a scenario host**, not a claimed 2029 selection. Its prior saved domestic leader gets the host slot; that club is excluded from the other 31 selections. This host-selection policy is a game rule, not FIFA's future host procedure.
- Uses the preceding four calendar years of saved primary continental results. Distinct continental titleholders enter before ranking clubs (OFC uses its modeled cumulative qualifying score). Rank fillers are capped at two clubs per association; distinct titleholders may exceed that cap. Host entry is separate. Missing pre-career years are NOT fabricated: remaining places use internal reputation and say `scenario-fill` in the entry list. Old-save archive summaries can preserve titles but cannot recreate missing per-match ranking results.
- Ranking is deliberately modeled: 3 for a regulation win, 1 for a draw, 3 for a completed tie progression and 10 for a title. It is not FIFA/UEFA's official access coefficient. Only primary continental competitions count, not secondary cups, domestic supercups or prior FIFA winners.
- Pots follow the regional composition of the 2025 template with internal scoring/reputation, not official seed rankings. One club from each pot/group, different associations, 1–2 UEFA clubs per group, no repeated other confederation. Host fixed to Group A; no certified broadcasting/venue allocation.
- Group tiebreak: head-to-head points/GD/goals; reapply to a surviving tied subset; overall GD/goals, weighted conduct, saved lottery. Conduct categories have weights 1/3/4/5 and represent non-overlapping anonymous participants; they are generated team-level values, not a complete player/coach disciplinary or suspension system.

## Annual Intercontinental
- Waits for **six current-career continental champions**, not arbitrary reputation seeds or the previous Club World Cup winner. Five matches, with UEFA champion entering only the final.
- Opening path: AFC or CAF champion hosts OFC, alternating by edition year (AFC in even years). Winner travels to the other AFC/CAF champion for the African-Asian-Pacific Cup.
- CONCACAF vs Libertadores champions in a neutral modeled Derby of the Americas; winner vs African-Asian-Pacific winner for the neutral Challenger Cup; winner vs UEFA for the neutral final. All tied knockout games have extra time then penalties. Regional title winners are stored and displayed.
- Edition year follows the end year of the game's season. Matches take place after all six champions are known, **not on a certified December calendar**. This avoids inventing current champions when the simulated qualifying tournaments have not finished.

## Oceania without inventing clubs or changing league scope
- Seven real eligible OFC entrants from the published Pro League list: existing Auckland FC plus Bula FC, PNG Hekari FC, Solomon Kings FC, South Island United, Tahiti United and Vanuatu United FC.
- A disclosed **lightweight qualifying scenario**: single round robin then top-two final (22 matches). This is NOT the official eight-team OFC Pro League format, leaders/challengers pathways or registration list. South Melbourne is AFC-affiliated and excluded from Oceania's FIFA slot, consistent with the published 2026 eligibility explanation.
- Auckland uses its existing club ID in the Australian league and is associated with NZ/OFC for FIFA eligibility. It is excluded, along with Wellington Phoenix, from modeled AFC selection; the next eligible Australian league club fills that modeled place. The game **does not separate Auckland's OFC and A-League player registrations**.
- Six guest club records live in `fifaGuests.js`, resolvable for cups but absent from selectable clubs/domestic divisions and transfer budgets. No fictitious club names, duplicate Auckland, new domestic leagues, or new claimed real-player registrations. Guest strength/capacity/finances are estimates; opponents use lightweight strength rather than detailed invented lineups.
- Underlying AFC and CONCACAF championships remain the existing simplified engines. Full official access, registration, ownership, sanctions, OFC competition detail and future 2029 rules are not certified by this implementation.

## Integration and persistence
`fifa-v1` has its own engine, access ledger, constrained draw, validation and cards. The shared calendar, finances, owner match effects and shootout resolver are reused. Neutral games do not collect home-stadium gate receipts. Per-fixture reward keys prevent repeated payment. The four-year qualification history is separate from the rolling general season archive.

Schema 10 migration keeps all active old competitions/draws/results. `fifaVersion: 0` uses their existing behavior until the season completes, then initializes the new FIFA pathway. It does not retroactively replace a completed simplified World Cup or delete old history. Classic games stay classic. League membership, accepted rank-based promotion and Morocco/Bolivia/Qatar top-only scope are unchanged.

## References (facts, not redistributed regulation text or logos)
- FIFA Club World Cup 2025 regulations, articles 12–13: https://digitalhub.fifa.com/m/18848e4224efbd91/original/FCWC25_Regulations_EN.pdf
- FIFA confirmation of Auckland FC's 2026 Intercontinental entry: https://www.fifa.com/en/tournaments/mens/fifa-club-world-cup/articles/auckland-fc-qualify-oceania
- Auckland FC official 2026 title/eligibility explanation (including South Melbourne and cumulative Oceania pathway): https://aucklandfc.co.nz/news/auckland-make-history-as-ofc-pro-league-champions/
- Official OFC Pro League team list: https://www.ofcproleague.com/
- 2026 Intercontinental five-match path and participants (secondary): https://www.goal.com/en-us/tickets-travel/match/fifa-intercontinental-cup/A~blt571706677f5257db
- 2029 uncertainty (secondary, not an adopted rulebook): https://en.wikipedia.org/wiki/2029_FIFA_Club_World_Cup

Some secondary 2026 articles incorrectly named Auckland City instead of Auckland FC. The FIFA and club sources above take precedence. All references are external reading only; gameplay does not fetch them.
