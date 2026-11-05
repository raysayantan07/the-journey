# Install The Journey on the Fold cover screen

The React Native application is implemented in this repository. `App.tsx` opens `JourneyScreen` directly. The current task adds build/update infrastructure only; it does not add app features.

## Current status

- Expo SDK 58 and its native dependencies validate against the installed SDK's compatibility manifest.
- `eas.json` uses `distribution: "internal"`, `android.buildType: "apk"`, `channel: "preview"`, and `environment: "preview"`.
- SDK-compatible `expo-updates` is installed. The intended runtime policy is `fingerprint`.
- **No EAS project exists yet**, so there is no real project UUID or update URL in `app.json`. These must be generated under your Expo account; there are no invented placeholders.
- `eas whoami` returned **Not logged in**. The preview build attempt exited before submission: **An Expo user account is required to proceed**.
- A request to `https://api.expo.dev` received **HTTP 403 / CONNECT tunnel failed** from the environment's proxy.
- **No build ID, signed APK, installation URL, or EAS Update publication exists from this task.** Local Hermes exports are not APKs.

## 1. Unblock cloud access and authenticate

Use this cloud terminal; no Windows/Mac or local Android SDK is required.

The environment configuration draft now requests `api.expo.dev`, `expo.dev`, `u.expo.dev`, and `assets.eascdn.net`, retaining the package-manager preset. It also declares an optional **personal `EXPO_TOKEN`** binding for the Expo API. Saving that draft did not change the running network policy. Review and save it in environment settings, enter a token securely if using that path, and publish the environment as requested by the product to activate the new configuration. The agent has not published the environment.

An Expo account is required. If you do not have one, create it at https://expo.dev. Either:

- Add your personal Expo access token through the secure `EXPO_TOKEN` environment setting, never through chat or a repository file; or
- Run `npx eas login` in a terminal with secure interactive input after network access is enabled.

Then verify actual authentication:

```sh
cd /workspace/the-journey
npm ci
npx eas whoami
```

The EAS CLI is pinned in development dependencies. A successful registry install does not establish access to Expo APIs. Artifact uploads may use additional signed storage hosts returned by Expo; if a specific upload is denied, add that exact host through environment settings and retry. Do not bypass the proxy or disable TLS verification.

## 2. Create and link the Expo project, then configure updates

Replace `YOUR_EXPO_USERNAME` below with your actual Expo account name. This creates/links an **Expo project**, not another GitHub repository.

```sh
npx eas init --account YOUR_EXPO_USERNAME --non-interactive
npx eas update:configure --platform android --environment preview --non-interactive
npm run eas:ready
```

`eas init` must write the real `expo.extra.eas.projectId` (and the account owner if needed). `eas update:configure` must set:

```text
expo.updates.url = https://u.expo.dev/<that same real project UUID>
expo.runtimeVersion.policy = fingerprint
```

The `runtimeVersion` policy is already declared as `fingerprint`; retain it if the CLI proposes another default. The preflight rejects missing IDs, a mismatched URL, disabled updates, an incorrect preview profile, or local generated native directories. Commit the actual account/project configuration written by these commands. Project IDs and update URLs are public identifiers, not credentials.

This project uses Expo native generation. `android/` and `ios/` should remain absent from the checkout at EAS command time. Local Android generation was validated and its generated output preserved outside the checkout in `/tmp`. If you later run `expo prebuild` locally, preserve any deliberate manual native edits before removing generated directories; do not blindly delete native work.

**Do not build a preview APK before linking/configuring updates.** Without the real update URL, native generation disables updates. A binary built that way cannot gain EAS Update support through an OTA update; it would require a new APK. `npm run android:preview` prevents that accidental build.

## 3. Build the first signed APK

```sh
npm run check
npm run android:preview
```

The build script runs the local EAS preflight and then:

```sh
npx eas build --platform android --profile preview
```

For the first build, allow EAS to create/manage the Android signing keystore and create the `preview` channel if prompted. Keep using that project's signing credentials for future APK upgrades. The first credential setup can require interactive prompts; a CI token does not itself create an Android keystore. Once credentials/project/channel exist, unattended builds can use:

```sh
npm run android:preview -- --non-interactive
```

Wait for the **remote build** to succeed. EAS prints the actual build page and install link. If returning to the task later:

```sh
npx eas build:list --platform android --build-profile preview --limit 5
npx eas build:view REAL_BUILD_ID
```

Only use the install link for a successful build. No example URL in this document is an APK link.

## 4. Download and install on Android

Open the successful EAS build page on your phone and choose its APK download/install action. Open the downloaded `.apk`; allow that browser/file manager to install unknown apps if Android asks. Install and open **The Journey**. This standalone preview APK contains the application and does not need Metro, a USB cable, Expo Go, or a development machine.

The preview APK is a release build: **DEV controls are intentionally hidden** and it starts at step 0. You can still pan through the world, pinch, inspect milestones and recenter. To exercise manual progress/pose previews on the phone, use the existing development build profile and connect it to Metro; do not expect a production preview APK to display the sandbox.

## 5. Test the outer screen

Keep the phone folded, portrait, using its cover display:

1. Confirm the app opens directly into the illustrated Journey, with the sleeping explorer on step 0.
2. Check the title/settings clear the camera cutout and status bar; bottom circles clear gesture navigation.
3. Drag in both directions, repeatedly pinch at different focal points, then tap recenter. The explorer must remain on its stone.
4. Tap a landmark or next-reward chip; dismiss the panel without moving the camera. Test Android Back dismissal.
5. Tap Settings, Back, Edit Goals and Edit Workouts; these are intentional future-screen placeholders.
6. Repeat with Samsung display scaling and Android font size changed. Settings shows runtime **dp**, density and platform. Physical 1080 × 2520 resolution is not the React Native layout size.
7. Background/resume and cold-launch offline. Check animation fluidity on the actual device. Browser tests do not validate the native cutout, SQLite execution or 60/120 Hz performance.

## 6. Publish compatible UI and animation updates later

Once this configured APK is installed, the `preview` channel selects the update stream, and the fingerprint runtime restricts updates to compatible native builds. The EAS channel/branch is separate from a Git branch. Keep the same EAS project and `preview` environment for the binary and updates.

For a reviewed UI-only change:

```sh
npm ci
npm run check
npm run eas:ready
npx eas fingerprint:compare --build-id REAL_INSTALLED_BUILD_ID --environment preview
npm run update:preview -- --message "Refine Journey tile lighting"
```

The last command expands to:

```sh
npx eas update --channel preview --platform android --environment preview --message "Refine Journey tile lighting"
```

SDK 58 requires the `--environment` selection. A successful publication returns an update group, not a new APK. The build must have the same runtime fingerprint as the update; if the comparison differs, inspect the native changes and build a new APK instead of changing runtime values to force compatibility.

With `checkAutomatically: "ON_LOAD"` and `fallbackToCacheTimeout: 0`, the app opens promptly from its embedded/cached bundle while checking for updates. Open it online, give the update time to download, fully close it and reopen it. Updates ordinarily take effect on a subsequent launch. An offline launch continues using the available embedded/cached code.

| Change                                                                                                 | OTA or new APK?                        |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| React component layout, colors, SVG art, text, JS-driven animation choreography                        | OTA when the fingerprint still matches |
| Image/JS assets compatible with the existing native modules                                            | OTA when the fingerprint still matches |
| Expo SDK, React Native, Reanimated/Worklets or another native dependency                               | New APK                                |
| New native module, permission, config plugin, native code, launcher icon or other native configuration | New APK                                |
| Adding Expo Updates to a binary that lacks it, changing project/update wiring or the binary's channel  | New APK                                |

To undo a bad publication, find its real update group ID and roll it back:

```sh
npx eas channel:view preview
npx eas update:list --branch preview
npx eas update:rollback BAD_UPDATE_GROUP_ID --platform android --message "Restore previous preview"
```

Use the branch shown by `channel:view` if it differs from the default `preview` branch. EAS rolls back the latest update for its branch/runtime to the preceding update, or to the embedded update when appropriate. Verify the channel and runtime before acting. Future publication is an explicit command; neither `npm run check` nor a Git push publishes an OTA update.

The app remains offline-first and has no user authentication or backend. Expo credentials here authorize builds/publications only.
