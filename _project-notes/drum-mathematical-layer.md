# Visible mathematics beside the experiments — 10 November 2026

## Source and editorial intent

The user asked to restore mathematical prominence while keeping the existing
visual design and interactions. Source material is the 56-page expanded Chinese
study PDF, sections 6–16, and its matching editable notes. The PDF text was read
and a representative derivation page visually inspected. The mathematical spine
is now visible throughout the public essay; detailed proofs remain expandable.
Personal progress, mastery assessments and other private learning material from
the notes were not published.

Adaptation map:

- §§6–8: local second derivatives, the four-neighbor interpretation of Δ,
  Dirichlet conditions, the two-mass eigenvector example, separation of variables,
  the energy/Rayleigh quotient and the square-root frequency relation.
- §9: boundary-selected integer wave numbers, two sine factors, both second
  derivatives, exact rectangular eigenvalues and permanent nodal lines.
- §§10–11: the chain-rule scale law, eigenspace dimension and multiplicity.
- §§12–13: mode counts, quarter-ellipse lattice counting, Weyl's law, the heat
  trace, the exact half-plane boundary-loss integral and perimeter extraction.
- §§14–16: injectivity of the spectral map, distinct geometric/spectral claims,
  coordinate maps in transplantation, an explicit seam and outer-edge check,
  eigenspace isomorphism, and superposition versus a single tone.

A weak-form/P1 finite-element bridge was added for the newer polygon solver;
the older study PDF described this as a future direction. It is identified as a
numerical approximation, with row-sum mass lumping and a distinction between
algebraic residual and continuum error. The public page links the Laplacian
handout and P1 mass-lumping reference rather than an inaccessible private note.

## What readers see

The opening has a mathematical route and symbol key. Each experiment has a
visible key equation, explanatory prose and a short list of the tools involved.
The selected polygon eigenpair has a live mathematical readout beside its plot,
including the actual matrix dimension, eigenvalue and frequency calculation.
The analytic rectangle has its current sine product, exact eigenvalue and nodal
coordinates inside the experiment, directly after the mode controls. The scale,
counting and transplantation readouts follow their respective selections.

Five detailed derivations carry the longer intermediate steps. Existing visuals,
sounds and controls are retained. The static edition includes the same full
mathematical reading path, with worked examples replacing interactive placeholders.
The non-congruence page adds the isometry formula, current transformation and
exact squared corner distances. Its existing three-corner proof remains intact.

Typography uses the site's already-vendored MathJax and local fonts, so no new
external renderer or CDN is required. The implementation typesets only equation
containers and serializes updates. Without the renderer, readable Unicode/text
equations remain. There are no equations updated on every animation frame.
The paper background, ink/teal/rust palette, serif hierarchy and restrained rules
are shared with the original design. Long equations scroll within their own
container; they do not widen the page.

## Accuracy decisions

- Continuous equations and analytic rectangular values are distinguished from
  finite-element estimates. Exact rational values such as 13π²/16 are used
  instead of putting a rounded decimal after an equality sign.
- Nodal positions use exact fractions for the analytic examples. Numerical
  frequency substitutions use approximation signs.
- The spectrum counts independent modes, including repeated eigenvalues; a
  particular basis for a repeated eigenspace is not unique.
- The heat trace has −Δ normalization, a heat parameter with length² units and
  a stated small-parameter limit. Six low eigenvalues do not determine it.
- The transplantation formula explicitly aligns source coordinates. Seam
  derivatives use a common normal direction. Invertibility alone is not used as
  a boundary proof: the signed continuation identities are included as well.
- The edge-continuation matrices are distinguished from a differential Laplacian.
- Geometry comparison remains a current-placement measurement plus a separate
  argument ruling out all isometries, not an overlap search masquerading as proof.

## Validation

`_checks/drum-mathematics.cjs` compares live formula models against the existing
analytic/math modules and solver output. It checks exact fractions and nodes,
scale and audio ratios, counting substitutions, selected eigenpairs and matrix
size, coordinate maps/signs, unique IDs and the five interaction hooks.
Existing audio, forward numerical, analytic/transplantation and non-congruence
checks passed. HTML anchors/local assets and the Jekyll build passed.

Browser checks covered selected polygon eigenpairs, bilingual explanations,
rectangular mode/scale changes, all five derivations, cutoff 8,000 with exact
counts 2,481/2,490, target transplantation triangle 4 and its coordinate maps,
rotation/reflection formulas, static reading and continued sound playback.
The main page rendered 43 equation containers, the static page 38 and the geometry
page 3, with no MathJax formula errors. Fresh standalone page checks had no new
page warnings after removing a redundant request to load an already-bundled AMS
component.

A local same-origin iframe with a real 390 px CSS viewport was used for narrow
layout review (the browser's top-level viewport override was unreliable). It
rendered all 43 formulas, the Chinese selected-eigenpair calculation fit its
287 px container, and document width equaled viewport width. This is not a
physical phone test. An anonymous MutationObserver error appeared in the browser
automation's iframe harness; neither the project scripts nor the renderer bundle
contain MutationObserver, and standalone pages rendered without that error.

Primary references remain linked next to the derivations and in the source list.
The project’s exact seven-triangle construction and proof are credited to Buser
and colleagues; the PDE handout, Kac paper and existing local MathJax documentation
were consulted to check conventions and rendering behavior.
