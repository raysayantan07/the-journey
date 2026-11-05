# The Journey

A private, offline-first Android fitness adventure for two people. **Milestone 1 implements only the Journey screen.** The app launches directly into an original, interactive miniature isometric world. Workout, goal and settings destinations deliberately explain their future scope.

[Screenshots and validation evidence](docs/VALIDATION.md)

## Run

Use Node **24.3+** (the implementation was validated on 24.22.1) and npm. Use the existing checkout; cloud tasks are already isolated and do not need another worktree.

```sh
cd /workspace/the-journey
npm ci
npm start
```

Use an SDK-58-compatible Expo Go client for a quick preview if available. The reliable Android path is the EAS development build below. A cloud machine's LAN address is usually not reachable from the phone: use `npx expo start --dev-client --tunnel` if the environment allows Expo tunneling, or use the standalone preview APK, which needs no Metro connection.

Browser inspection, with Chromium installed:

```sh
npm run web -- --port 8081
# In another terminal:
npm run smoke
```

If dependencies are reinstalled while Metro is running, restart it with `npx expo start --clear` to refresh its file cache.

The browser is a layout/interaction aid; Android is the target. Browser rendering does not validate Android safe areas, GPU frame rate or native gesture recognition.

## Explore

- Drag the landscape; pinch around any focal point. Floating controls stay in place.
- Tap a reward platform to inspect its milestone. The next-reward chip offers an accessible alternative. Closing the panel preserves the camera.
- Tap the crosshair to return to the explorer.
- In development, tap **DEV** or long-press the title. Select activity counts, choose any character state, simulate `+1`, or toggle camera following. Close the sheet to inspect the scene.
- Preview data is separate from workout history. Android saves this sandbox in SQLite; browser previews use local storage. The highest preview achievement remains unlocked when moving backwards. Production starts at step 0 and contains no developer controls or fabricated workout history.

## Stack and structure

Expo **58.0.23**, React Native **0.88.1**, React **19.3.0**, Reanimated **4.7.1**, Worklets **0.13.0**, SVG **15.16.0**, Gesture Handler **3.3.x**. Versions were selected from Expo's stable package and bundled native compatibility manifest, rather than mixing latest native packages.

- `src/journey/model.ts`: typed deterministic route, tier boundaries, milestones, character state and camera mathematics. Steps represent completed activities, never dates. Step 260 is Champion; 261 begins the unbounded Legendary region.
- `WorldArt.tsx`: original SVG platform extrusions, bevels, ambient shadows, trees, rocks, crystals, rewards and gateway.
- `JourneyWorld.tsx`: UI-thread camera matrix, simultaneous focal pinch/pan, bounded exploration, viewport windowing, hit testing and route travel.
- `Character.tsx`: replaceable layered figurine with rest, locomotion, flying and recovery previews, breathing, limb motion, route hops and direction changes.
- `JourneyScreen.tsx`: safe-area HUD, persistent fixed controls, milestone panel, celebrations and minimal destination sheets.
- `previewStore.native.ts`: SQLite-backed developer sandbox only. No real workout schema or streak engine is implemented.
- `src/design` and `src/components`: reusable visual tokens, hand-drawn icons and spring buttons.

SVG is used instead of a full 3D engine: it keeps original artwork crisp across pixel densities, avoids texture downloads, and lets platforms, scenery and character share one transform. Only a window of tiles is mounted. React is not called on each camera frame. Skia is intentionally not required for this milestone.

## Validate

```sh
npm run check           # strict TypeScript, Expo ESLint, 6 domain/camera tests
npm run format:check
npm run smoke           # running dev web server + system Chromium required
npx expo install --check
npx expo export --platform android --output-dir dist/android
```

`CHROMIUM_PATH`, `JOURNEY_URL`, and `JOURNEY_CAPTURE_DIR` customize the smoke runner. Captures default to `/tmp/journey-validation`. The smoke test uses actual Chromium touch events and checks repeated pan/pinch, recentering, world milestone hit testing, all tier/pose previews, destination buttons, persistence and narrow control bounds. It changes only the browser's sandbox preview data.

If Expo's compatibility endpoint is blocked, `EXPO_OFFLINE=1 npx expo install --check` checks against the SDK's locally installed version metadata. This does not prove that Expo cloud services are reachable.

## Android APK without a desktop development machine

No Android SDK, Windows or Mac is needed for EAS cloud builds. An Expo account, authenticated EAS CLI and network access to Expo services are required. No APK has been generated as part of this implementation.

1. In a terminal with secure interactive input, authenticate and link the existing project:

   ```sh
   npx eas-cli@latest login
   npx eas-cli@latest whoami
   npx eas-cli@latest init
   ```

   This may add the real account owner/project ID to `app.json`. Do not invent IDs or paste credentials into source or chat. In restricted cloud environments, Expo API access (including `api.expo.dev`) must be allowed in environment settings. If CLI login is unavailable, configure an Expo access token securely as `EXPO_TOKEN` in an execution environment that supports EAS CLI authentication.

2. Build a self-contained installable APK:

   ```sh
   npx eas-cli@latest build --platform android --profile preview
   ```

   Allow EAS to generate/manage the Android keystore when prompted. Preserve the signing credentials for future updates. The `preview` profile produces an **APK**, not an AAB. Its developer sandbox is absent.

3. Open the resulting EAS build page, wait for the actual build to finish, and download the APK on your phone. Alternatively use `npx eas-cli@latest build:list --platform android` to locate it. Install from Downloads; Android may ask to allow that browser/file manager to install unknown apps.

4. For progress/animation previews, build the development client:

   ```sh
   npx eas-cli@latest build --platform android --profile development
   npx expo start --dev-client --tunnel
   ```

   Install the development APK from the EAS build page and connect it to Metro. Tunneling requires additional network support and may prompt to install Expo's tunnel package. If unavailable, use a reachable Metro host. A release APK does not need a development server.

5. Test on the **outer display**, portrait, with the phone folded. Check status/camera cutout and gesture-navigation clearance, three buttons, map focal zoom, repeated gesture transitions and recentering. Repeat with Samsung display scaling and Android font sizes changed; record the runtime **dp** dimensions/density in the Settings placeholder. Do not treat 1080 × 2520 physical pixels as dp. Check background/resume and Android Back dismissal of sheets. Test a long session and observe frame timing on the actual device; 120 Hz performance is not claimed from a browser test.

## Scope and next pass

There is no authentication, backend, workout editor, goal editor, real history, training calendar, streak-credit calculation, pause scheduling, multi-profile engine or import/export. The developer sandbox demonstrates those visual states without asserting fitness readiness from workout count.

Next visual iteration: inspect the actual Fold cover display, tune native shadow/contrast and label sizes, enrich region-specific scenery and quest islands, refine limb articulation and depth occlusion, and profile SVG draw cost before choosing Skia. A native APK/device pass is still required before claiming Android visual acceptance or sustained 60/120 fps.

See [product invariants](docs/PRODUCT.md) for the long-term integration constraints.
