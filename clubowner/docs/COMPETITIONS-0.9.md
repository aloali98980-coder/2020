# Competition engine 0.9 — implementation boundary

Reviewed 2026-09-26. This is **part one of the competition work**, not completion of the full competition phase.

## Implemented
- CAF Champions League and Confederation Cup: 16 teams, four groups of four, six home/away group games each; top two to quarter-finals; two-legged quarter-finals, semi-finals and final. Aggregate, away goals, then direct penalties. CAF group ties reapply head-to-head to a surviving tied subset.
- Libertadores: 32 teams, eight groups of four; top two to the round of 16; third places transfer to the Sudamericana playoff. Two legs until a single neutral final. No away-goal rule; direct penalties before the final; extra time then penalties in the final.
- Sudamericana: 32 initial entrants; eight group winners wait for the round of 16; eight runners-up play eight Libertadores third places. Best runner-up vs lowest-ranked third, with the runner-up hosting the return. Eight playoff winners join the eight direct qualifiers. 40 distinct participants over the full competition, not 40 in its group stage.
- CONMEBOL group ties use 2026 head-to-head points, goal difference and goals, then overall goal difference, goals, fewer reds, fewer yellows and a saved random lot. Unlike CAF, the criteria do not restart on a surviving subset. Cards are team-level simulation values, not a player suspension system.
- Group pots use internal reputation, one team per pot/group, no repeated association in a group. CAF quarter-final winners/runner-up draw prevents a repeat of the same group. CONMEBOL knockout draws permit same-group and same-country opponents; subsequent paths are saved, not redrawn. Libertadores later return hosting follows the stored performance order. Sudamericana playoff winners' internal seed order remains modeled.
- Six domestic cups: Egypt, England, Spain, Germany, Italy and France. Only loaded tiers participate; reserve clubs are excluded. Modeled first-round byes avoid inventing clubs. Single matches except Spanish/Italian semi-finals over two legs. Neutral final; FA Cup semi-finals neutral. Extra time/penalties without away goals.
- Six domestic supercups: two clubs in England/Germany/France; four in Spain/Italy/Egypt. Saved current-season league/cup results supply entrants; duplicates are replaced with the next league club. These modeled events happen at the end of the same game season. **Egypt's League Cup is not represented**; league/cup places fill the four-team scenario instead. Egypt's final permits extra time; the other five supercups use direct penalties.
- CAF Super Cup: current in-game CAF champions, neutral, direct penalties. Recopa: Libertadores/Sudamericana champions, two legs, Libertadores champion hosts the return, extra time/penalties if level.
- Calendar, owner-match effects, prize ledger, results inbox, group/tie cards, archived champion/group/finalist summaries, import validation and save/reload integrated. Shootouts do not inflate football scores. Neutral games do not collect the owner's home-stadium ticket revenue. A replayed processing call cannot pay again.

## Access and calendars are explicitly NOT official
The top-level country catalog contains five African markets and ten South American markets. We have not inserted fictitious clubs or represented missing African associations as loaded leagues. CAF scenario allocations are EG 4, MA/TN/DZ/ZA 3 in each competition; this **exceeds real country quotas** to form the complete group-stage structures with available real clubs. Libertadores allocation is BR7/AR6/UY3/CO3/CL3/EC2/PY2/PE2/BO2/VE2; Sudamericana BR6/AR6/UY3/CO3/CL3/EC3/PY2/PE2/BO2/VE2. These are game allocations, not certified entry lists.

Season one uses internal reputation. Later entry uses saved domestic positions; the secondary competition prioritizes an eligible domestic cup winner within its modeled national allocation. Primary/secondary initial entrants cannot overlap. A cup winner outside the current loaded top division is not given an exception in this implementation. There are no preliminary qualifying rounds or complete titleholder access exceptions. Pots are not official confederation coefficients. Absolute dates, gate sharing, travel costs, registration, disciplinary suspensions, domestic entry rounds and money remain modeled. Egyptian four-team supercup entry and all supercup timing are scenarios.

## Preservation and remaining phase work
Schema 9 preserves the active competitions, draws, scores and identities of schema-8 saves. `competitionVersion: 0` keeps the old season's competition code; it switches to 1 only at rollover. Old records are not converted into fictional group-stage histories. Classic games remain classic. League depth and promotion algorithms were not changed.

Still pending: AFC formats including the announced 2026/27 expansion, CONCACAF access/structure, full **32-team quadrennial Club World Cup** and separate **six-champion annual Intercontinental** with OFC representation. Existing FIFA placeholders remain separate but simplified five-region knockouts, on scenario seasons rather than a certified 2029 calendar. Their champion seed pool now excludes secondary continental champions. Other countries' domestic cups/supercups and official access/qualifying exceptions also remain unfinished. Do not interpret the labels of those placeholders as implemented official formats.

## Sources and review notes
Only factual structures are implemented; no regulation text, association logos or official databases are redistributed. Sources are references, not live network dependencies.

1. CAF official group-stage overview: https://www.cafonline.com/caf-champions-league/news/everything-you-need-to-know-about-the-202526-totalenergies-caf-champions-league/
2. CAF official Confederation Cup overview: https://www.cafonline.com/caf-confederation-cup/news/everything-you-need-to-know-about-the-totalenergies-caf-confederation-cup/
3. CAF group tie-break details (secondary, cites regulations): https://en.wikipedia.org/wiki/2025%E2%80%9326_CAF_Champions_League_group_stage
4. CAF final rules (secondary): https://en.wikipedia.org/wiki/2026_CAF_Champions_League_final and https://en.wikipedia.org/wiki/2026_CAF_Confederation_Cup_final
5. Primary CONMEBOL 2026 manual, reviewed printed pp.48–55: https://cdn.conmebol.com/wp-content/uploads/2025/12/Manual-de-Clubes-CONMEBOL-Libertadores-2026-ESP.pdf — confirms group access/third-place transfer, same-group knockout eligibility, bracket/return hosting, 2026 tie order and no reapplication, Recopa return host, direct penalties except the final.
6. Sudamericana 2026 knockout details: https://en.wikipedia.org/wiki/2026_Copa_Sudamericana_final_stages
7. Recopa 2026 extra-time rule: https://en.wikipedia.org/wiki/2026_Recopa_Sudamericana — competition-specific page; the generic Recopa article had contradictory older wording and was not used for that rule.
8. Spanish Supercup no extra time from 2025: https://www.sport.es/es/noticias/futbol/supercopa/hay-prorroga-final-supercopa-espana-125500713
9. AFC expansion reference for the NEXT implementation, not a claim of completed support: https://www.the-afc.com/en/club/afc_champions_league_elite.html/news/afc-announces-landmark-expansion-of-afc-champions-league-elite%E2%84%A2-from-202627-season-1

An older CAF PDF included obsolete substitution text. We did not certify its entire regulations as current. Detailed current domestic access lists are not certified by this release.
