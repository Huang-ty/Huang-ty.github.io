# Integral Lab on the personal website

Published path: `/projects/integral-lab/` (season overview: `#season`).

The static release was copied from Integral Lab 1.1.0 on 2026-11-17. Before copying, `app.js` was checked byte for byte against the existing public training site. The release includes 66 archived MIT 2026 problems plus four original variations. All JavaScript, KaTeX fonts, and Nerdamer assets are local to this project directory. The existing MIT attribution and vendor licenses are retained.

Personal-site changes: a canonical URL, a return-home link, and an entry on the homepage. Training, verification, timers, and storage behavior are unchanged.

Progress is browser-local and origin-specific. To transfer from the previous chatgpt.site address, export progress from 學習足跡 on the old site, then import that JSON file on this site. No server or GPT service is required.

Validation before publication: the original 31 automated tests passed. Jekyll build passed. Relative module and Worker paths and all 20 font faces were verified in the built output. A browser check at the nested project URL verified the 66-question season view, an exact answer submission through the Worker, and solution unlocking. The 390 px viewport had no horizontal page overflow or formula errors; no browser warnings or errors were reported.
