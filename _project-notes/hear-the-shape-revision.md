# Drum essay revision — 28 October 2026

## Reason for this revision

The student requested a revision following an editorial assessment of the existing article. The assessment found a missing positive result (what a spectrum does determine), a weak bridge from vibration to eigenvalues, and a transplantation explanation that named the technique without showing a rule. This is an editorial revision, not evidence from the course's required two human audience tests.

## Changes and their purpose

- Explain natural modes through coordination between neighboring points and the fixed boundary; connect the Laplacian to the wave equation in optional mathematics.
- Place a positive result before the counterexample: the complete spectrum determines area and, for the stated regular boundaries, perimeter. Define spectral geometry in the narrative.
- Add an optional mode-counting experiment for 4 × 1 and 2 × 2 rectangles, both with area 4. Counts at eigenvalue cutoffs 80, 800 and 8,000 are exact; area estimates use the leading Weyl asymptotic. These are explicitly not an isospectral pair, and finite estimates are not asserted to improve monotonically.
- Let readers inspect all seven signed transplantation rules, highlighting contributing source functions and a selected target triangle. The visualization shows symbolic function combinations, not computed eigenmodes or physical tile movement.
- State the role of linearity, seam matching, the outer boundary and invertibility. Cite the original proof and distinguish it from finite numerical matching.
- Add a positive uniqueness result within the class of triangles, followed by a question about what additional geometric information changes the inverse problem.
- Rewrite the static edition to preserve the complete explanation, with a calculated table and a labelled transplantation example. Keep optional material in expandable sections.

## Important mathematical checks

The project uses the positive operator −Δ, hence f = c√λ/(2π) and N(Λ)/Λ → A/(4π). Kac's original paper uses a different operator normalization. The text explicitly distinguishes them.

For a smooth bounded planar domain, the first heat-trace terms are A/(4πt) − L/(8√(πt)); polygons have the same area and perimeter terms with corner contributions at constant order. No general claim about recovering the number of holes is made.

The source and target triangle labels follow Buser et al.'s edge-color adjacencies:

- A: a=(0 1)(2 5), b=(0 2)(4 3), c=(0 4)(1 6).
- B: a=(0 4)(2 3), b=(0 1)(4 6), c=(0 2)(1 5).

The signed transplantation matrix in `math.js` satisfies T A_c = B_c T for each color, using −1 on a boundary diagonal and +1 between glued neighbors. Its determinant is exactly 24. The central row is f1+f2+f4; target row 4 is f0−f4+f5. This is an exact algebraic consistency check of the implemented rules, not a replacement for the analytic seam/boundary argument in the paper.

## Verification performed

- `_checks/drum-math.cjs` passes: original membrane boundary/scaling checks; independent mode enumeration; multiplicity at an exact eigenvalue threshold; scaling of counts; all three exact signed adjacency identities; nonzero determinant.
- Node syntax check passed for the new interaction script.
- Jekyll build passed; project files are copied to the expected subdirectory.
- Checked both HTML pages for unique IDs and existing local file/fragment links.
- Checks and this process note use underscore-prefixed directories and are not part of the public Jekyll output.
- Browser automation was unavailable during this revision (connection closed). Attempted native preview inspection was also unavailable. The new controls and responsive CSS have not been verified through live browser interaction in this revision; earlier browser checks apply only to the previous version.

## Before-and-after example

Before: readers were told that spectra contain geometric information, then shown an isospectral counterexample, without a concrete recoverable geometric quantity.

After: readers first learn that area can be recovered, inspect a count-based estimate, and then meet a pair whose entire spectra agree. The counterexample therefore answers a stronger, better-motivated question.

## Sources and contribution

1. Mark Kac, *Can One Hear the Shape of a Drum?* (1966): https://www.math.ucdavis.edu/~hunter/m207b/kac.pdf
2. Buser, Conway, Doyle and Semmler, *Some planar isospectral domains*, 1994 version, §2, Figure 3 and the edge-color adjacencies: https://math.dartmouth.edu/~doyle/docs/drum/drum.pdf
3. Grieser and Maronna, *Hearing the Shape of a Triangle*, 2013 version: https://arxiv.org/abs/1208.3163
4. The original Gordon–Webb–Wolpert and wave-equation references remain in the article.

Codex drafted and implemented this revision and its automated checks following the student's request. The student still needs to check the explanations personally, carry out real audience testing, record any subsequent revision, and prepare the reflection and oral defense. Do not present this record as completed human audience testing.
