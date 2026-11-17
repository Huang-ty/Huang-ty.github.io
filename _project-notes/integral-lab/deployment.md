# Integral Lab on the personal website

Published path: `/projects/integral-lab/` (season overview: `#season`).

The static release was copied from Integral Lab 1.1.0 on 2026-11-17. Before copying, `app.js` was checked byte for byte against the existing public training site. The release includes 66 archived MIT 2026 problems plus four original variations. All JavaScript, KaTeX fonts, and Nerdamer assets are local to this project directory. The existing MIT attribution and vendor licenses are retained.

Personal-site changes: a canonical URL, a return-home link, and an entry on the homepage. Training, verification, timers, and storage behavior are unchanged.

Progress is browser-local and origin-specific. To transfer from the previous chatgpt.site address, export progress from 學習足跡 on the old site, then import that JSON file on this site. No server or GPT service is required.

Validation before publication: the original 31 automated tests passed. Jekyll build passed. Relative module and Worker paths and all 20 font faces were verified in the built output. A browser check at the nested project URL verified the 66-question season view, an exact answer submission through the Worker, and solution unlocking. The 390 px viewport had no horizontal page overflow or formula errors; no browser warnings or errors were reported.


## Verification loading fix — 2026-11-17

A browser submission of the correct Qualifier #2 input `e^(2026*e^x)/2026` reproduced a six-second timeout. Both that notation and the canonical `exp(2026*exp(x))/2026` verified locally in a few milliseconds, so exponential normalization was not changed. The old six-second watchdog started at Worker construction, before Nerdamer and the verifier module had loaded.

The Worker now announces readiness after dependency loading. Loading has a separate 30-second timeout and a distinct status; only actual calculation uses the six-second budget. Constructor errors, dependency failures, message errors, and both timeout types release the busy state. These infrastructure failures do not create practice history, increment attempts, or eliminate a player in a timed challenge. Wrong answers and unsupported mathematical identities retain their existing behavior.

Updated entry, Worker, and verifier URLs use a release query to avoid mixing cached protocol versions. Input help now explains exponent parentheses, and non-finite evaluations mention overflow as well as domain errors.

Validation: all original 31 tests pass against this release, including all 70 canonical answers; six new regression tests cover delayed loading, computation limits, retry, blocked Workers, dependency failure, practice/timed records, and exponential syntax. Jekyll builds successfully. Browser testing of the built site at `/projects/integral-lab/#train` verifies the exact user input after adding the missing exponent parentheses and unlocks its solution.
