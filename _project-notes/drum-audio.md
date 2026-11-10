# Single-mode sound — 10 November 2026

## Behavior

Both moving membrane experiments now have sound: the polygon forward solver and
the analytic rectangular drum. Each displayed single eigenmode has a sine tone.
Play starts animation and sound; pause, reset, invalidating the polygon, leaving
the animation's viewport, hiding the document, printing or leaving the page stops
the relevant playback. Starting another experiment interrupts the previous one.
Mode changes during playback retune the tone and retain playback. Each experiment
has an independent Sound checkbox and keyboard-accessible volume slider; default
volume is 25% of a conservatively scaled oscillator gain. There is no sound on
page load. No audio recordings, microphone input, third-party audio service,
visitor uploads, libraries or stored preferences are involved.

The page's hero is a still image drawn on canvas. Triangle highlights, rigid
placement and transplantation diagrams illustrate geometry or functions rather
than an actual vibrating eigenmode, and have no assigned acoustic frequency.
They retain their existing visual behavior.

After answering the scale prediction, size buttons are also available next to
the rectangular animation's sound controls. Readers can compare the two sizes
by ear while keeping the moving membrane in view.

## Mathematical calibration

Every shape uses the same reference, not a separate tuning of its first mode:

`f_demo(λ) = 220 sqrt(λ / (1.25 π²)) Hz`.

The analytic 2×1 rectangle's lowest mode is therefore 220 Hz; its doubled version
is 110 Hz. Other rectangular modes are approximately 278.280 and 354.739 Hz.
The forward experiment uses its computed eigenvalues, so the refined rectangular
estimate is approximately 219.9 Hz. Degenerate eigenvalues give the same pitch
even when their plotted eigenfunctions differ.

Both animations now use a common visual rate of
`0.42 sqrt(λ / (1.25 π²)) cycles/second`. This also removes the old forward view's
per-shape normalization of its lowest visual frequency. Sound and motion preserve
the same ratios and have a common slowdown factor of 220/0.42; individual audible
cycles are not shown at real speed. The page and static edition distinguish
illustrative pitch, actual material-dependent Hz, a pure single mode and a real
strike's mixture of modes. Changing shape or scale can change the absolute demo
pitch. Out-of-range tones are omitted with an explanation, not silently clamped.

## Implementation and checks

`audio.js` supplies lazy Web Audio creation, sine oscillators, soft attacks and
releases, volume/mute, exclusive channel ownership, resume-race cancellation,
system-interruption handling, and fallback messages when playback is unavailable.
Only user-driven play/unmute events can start sound. A suspended context's late
resume cannot restart a stopped voice.

`_checks/drum-audio.cjs` passed pitch and scale laws, shared slowdown, lazy
initialization, fade scheduling, mute/zero-volume recovery, exclusive playback,
inactive-channel stop isolation, suspension recovery, unsupported/blocked
contexts, cancellation of late resumes, and out-of-range handling.

`_checks/drum-audio-browser.html` was copied into the local preview only. Native
OfflineAudioContext rendered actual PCM buffers using the production oscillator
and envelope functions. Independent positive zero-crossing measurement verified:

- 220.000, 278.280 and 354.739 Hz for the analytic rectangle;
- 110.000 Hz for the doubled rectangle;
- 218.801 Hz for each of two quick-mesh square modes sharing an eigenvalue.

All six buffers passed RMS amplitude, soft onset and silence after release checks.
This caught and corrected a missing gain-envelope anchor before publication.
These are generated-signal checks, not a measurement of the user's speakers.

Browser UI checks passed initial silence, live AudioContext playback, polygon mode
retuning, equal-pitch square modes, mute/unmute, zero-volume recovery, pause,
editing-to-stop, original rectangular mode changes, doubled/original size changes,
and stopping when the animation leaves view. No warning/error logs were observed
in those interactions. The viewport override did not resize the current browser,
so this change has no new verified narrow-screen result; responsive CSS follows
the existing stacking layout. Temporary overrides were reset.

Existing forward-solver, rectangular/transplantation and non-congruence numerical
checks passed. Jekyll build, HTML IDs, local assets and internal anchors passed.

API references consulted:

- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode
- https://www.w3.org/TR/webaudio-1.0/

These document the browser API; the common mathematical calibration and sound
controller are project code. This is sonification of the displayed ideal modes,
not an acoustic-radiation model or an audio proof of the isospectral example.
