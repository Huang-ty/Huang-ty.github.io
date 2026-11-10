# Polygon forward-problem experiment — 10 November 2026

## Purpose and place in the essay

The opening now starts with a known planar drumhead and asks what its modes and
eigenvalues are. The inline experiment precedes the existing rectangular-mode
lesson, scale prediction, Weyl-law demonstration and exact isospectral example.
The main navigation and hero link to `#forward-lab`. The static edition explains
the forward problem and links to the working solver.

The model is the positive Dirichlet Laplacian on an ideal uniform planar membrane:
`−Δφ = λφ`, `φ|∂Ω = 0`, with `f = c√λ/(2π)`. Eigenfunctions are spatial
patterns; the eigenvalue list, counted with multiplicities, is the spectrum.
The output is six low numerical estimates, not the full infinite spectrum or a
test of exact isospectrality. Physical Hz requires wave speed and physical units.

## Implementation

- Simple 3–16 vertex polygons, convex or concave, with fixed model coordinates.
  Click corners and close; drag vertices; or enter and edit coordinates by
  keyboard. Examples: square, 2×1 rectangle, right triangle and concave L.
- Ear-clipping triangulation with conforming uniform refinement; quick meshes
  have at most 1,024 triangles, refined meshes at most 4,096. Extremely thin root
  triangles are rejected; crossings, touching boundaries, duplicates and
  near-zero area receive actionable messages. Holes are outside the scope.
- P1 finite elements: stiffness K, row-sum lumped mass M, boundary elimination,
  symmetric mass scaling, block inverse iteration with nine vectors, PCG inner
  solves and Rayleigh–Ritz projection. A block method retains independent
  vectors at repeated eigenvalues. Results are accepted only when all six
  relative algebraic residuals are below 3e−5. This is not a continuum error bound.
- Computation runs in a dedicated Web Worker, with cancellation and a 30-second
  limit. Edits invalidate all displayed eigenpairs immediately. Coordinates
  remain in browser memory; no service receives or stores visitors' drawings.
- Piecewise linear eigenfunctions appear as normalized signed displacement
  fields. Optional mesh and approximate zero contours; manually started slowed
  motion preserves frequency ratios. Offscreen or hidden-page motion stops.
- Mode selector beside the plot and selectable spectrum rows. A table click
  brings the field into view. English/Chinese explanations, keyboard coordinate
  controls, accessible status messages and text descriptions.
- Rectangles show their exact lowest eigenvalue for comparison. Changing mesh
  resolution on the same coordinates reports the change in λ₁, without calling
  it an error bound. Different triangulations may give different finite-mesh
  errors even on congruent domains; rigid invariance is exact for the continuum
  and the same transformed mesh, not a promise about arbitrary remeshing.

## Validation

`node _checks/drum-forward.cjs` passed:

- All six eigenvalues compared against independent continuum formulas on the
  square, rectangle and right isosceles triangle. Refined errors below 1.2% in
  these benchmarks; each improved by over 2.5× from quick to refined.
- Independent five-point eigenvalue formula on the square mesh; repeated second
  and third eigenvalues; mass orthogonality of modes; independently recomputed
  matrix residuals; exactly zero boundary values.
- Concave-domain triangulated area; scale law; rotation and translation;
  reflection of the same mesh; clockwise input; redundant collinear points;
  invalid and excessively thin boundaries.

Refined lowest values: square side 2, 4.930840 (exact 4.934802); rectangle 2×1,
12.327100 (exact 12.337006); right triangle legs 2, 12.328585 (exact 12.337006).
These are example validations, not guarantees for every user-drawn polygon.

The existing `_checks/drum-math.cjs` and `_checks/drum-congruence.cjs` passed.
Jekyll builds, unique IDs, internal anchors and local assets passed inspection.

Browser checks covered: initial rectangular computation, square degeneracy,
mode/table selection and plot selector, mesh overlay, English/Chinese switch,
play/pause, an actually clicked concave pentagon, vertex dragging and recomputing,
keyboard entry, self-intersection rejection without stale results, quick/refined
comparison, cancellation and enabled controls afterward. No browser warnings or
errors were observed in these checks. At a 390×844 viewport the panels stack,
translated controls fit, and document width equals viewport width. This is a
browser viewport check, not testing on a physical phone or audience evaluation.

## Sources for the numerical explanation

- Stanford Math 220B, Laplacian eigenvalues:
  https://web.stanford.edu/class/math220b/handouts/eigenvalues.pdf
- Jeremy Bleyer, P1 row-sum mass lumping:
  https://comet-fenics.readthedocs.io/en/latest/demo/tips_and_tricks/mass_lumping.html

The browser implementation is original project code using these standard
methods. These references support the mathematics; they are separate from the
course project instructions and from the exact counterexample proof.
