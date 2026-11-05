# Milestone 1 validation

Validated in Codex Cloud using Node 24.22.1, npm 11.9.0 and system Chromium. Captures use a **360 × 840 logical-pixel** browser viewport. They are browser renders of actual SVG scene elements, not Android screenshots or assets used as map backgrounds.

## Passed

- `npm run check`: strict TypeScript, Expo ESLint and **6 executed tests**, all passing. Tests cover every tier boundary, deterministic prefix-stable/non-overlapping route windows through step 1000, reverse/forward character position interpolation, pause/ability priority, repeated focal camera math, and extendable milestones through step 1,000,020.
- `npm run format:check`: all supported source files formatted.
- `EXPO_OFFLINE=1 npx expo install --check`: dependencies match Expo SDK 58's bundled version metadata. The online Expo directory/compatibility API was blocked by the cloud network policy; this was not counted as an online check.
- `EXPO_OFFLINE=1 npx expo prebuild --platform android --no-install`: Android project and config plugins generated successfully. `expo-system-ui` resolves the initial light-appearance warning. Generated native files remain ignored; EAS can regenerate them from configuration.
- `EXPO_OFFLINE=1 npx expo export --platform android --output-dir dist/android`: the finished Android code compiled to a Hermes bundle, approximately 3.3 MB. **This is not an APK or a Gradle build.**
- `npm run smoke`, with a running Expo web development server: tier previews at 180, 205, 230, 250, 260, 261 and 280; nine manual character states; settings and all three destination buttons; three repeated touch pan/pinch cycles; camera recentering; real world-coordinate milestone tapping; panel camera preservation; minimum 48 px control bounds at 320/360/412 widths; sandbox restoration after reload. No browser runtime errors were recorded.

The initial pinch test ended too soon after the recognizer's activation threshold; the corrected test moves both touches farther and verifies a real scale change. The initial monument tap landed under the fixed next-reward HUD; the corrected test pans that monument into the unobstructed map before hit testing. Neither case was accepted as a passing interaction without diagnosis and rerun.

- `npm ci`: clean installation from the lockfile succeeded (769 packages).
- Production web export and browser check: opens at step 0 even when development sandbox storage contains 280; developer controls are absent and the world renders without browser runtime errors.

The final milestone panel enter/exit animation was checked after a cache-cleared development startup: opens and dismisses correctly, with no browser errors or warnings.

## Visual review

The initial composition spread too far across the narrow viewport. The refined route uses tighter centered switchbacks, rounded/beveled top faces, extruded side faces, radial cast shadows, softened ground lighting, distinct muted future stones, a more opaque HUD fade, and a readable floating reward chip. Reward artwork is offset from the explorer at milestones. Animated original character artwork includes breathing, locomotion, floating wings, tear/rest variants and a seated recovery pose.

| Fresh journey                                   | Violet region                                    | Legendary extension                                       |
| ----------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| ![Fresh journey](screenshots/journey-start.png) | ![Violet region](screenshots/journey-violet.png) | ![Legendary extension](screenshots/journey-legendary.png) |

## Still unverified

- A signed Android preview APK was produced by EAS build `dc97c00b-092a-4de5-8f53-4c1e0f21cbee`; native behavior and frame timing still require device testing.
- Native Android rendering, SQLite execution, hardware Back behavior, actual cutout/gesture safe areas, Samsung font/display scaling, gesture transitions and background/resume must be tested in the APK. Native project generation and Hermes compilation do not establish these behaviors on a device.
- No 60/120 fps claim: frame timing and battery/thermal behavior need actual Fold cover-screen profiling.
- Production has no real workout data source yet. SQLite persistence in this milestone is explicitly the isolated development preview, not the eventual workout schema.

### Camera responsiveness

- Native pan/zoom now transforms the SVG's containing view on the UI thread instead of changing the SVG group matrix on every gesture frame. Android can reuse the SVG bitmap while the camera moves.
- Decorative ambient animation pauses during active camera gestures and resumes from its current pose. Failed pinch recognition after a single-finger pan no longer starts a competing settle animation.
- The world canvas uses zoom bands and viewport-dependent overscan. At 840dp height it renders at most 51 tiles at minimum zoom, about 39 near normal zoom, and 27 near maximum zoom. Overlapping tile objects and keyed elements are retained; outgoing tiles are released, with no growing tile cache. Stone and garden artwork are memoized. Regression tests cover zoom-band boundaries, viewport coverage, bounded windows, retained object identity, and stable world coordinates across render-window changes.
- Validate on the Android preview device: repeatedly pinch in/out around an off-center landmark, drag between route windows, lift one finger during a pinch, tap rewards, and recenter. Check frame timing and memory on the device; browser correctness checks do not establish Android frame rate.

### Preview delivery for camera and windowing changes

- `npm run check`: TypeScript, lint, and all 10 tests pass.
- EAS Android fingerprint generated using the `preview` build profile matches the installed preview build `dc97c00b-092a-4de5-8f53-4c1e0f21cbee`: `58c8ef5b9e8676eec1ab0efa5f28ec870ebfec3e`.
- These changes use existing native modules and can be delivered as JavaScript through the `preview` EAS Update channel. Project `8356cd34-3b01-4c62-b64a-d1e879ed94a2` and Android package `com.thejourney.personal` are unchanged. No signing credentials are generated.
- Keep this work on `feat/fluid-camera-windowing` until device testing and user approval; do not merge into `main` yet.
