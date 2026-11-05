# Journey preview releases

- Keep work on `feat/fluid-camera-windowing` until the user approves a merge.
- Publish preview updates with `EXPO_NO_TELEMETRY=1 node scripts/update-preview.cjs --message "..." --non-interactive`. This runs the EAS preflight and increments `src/iteration.json` before bundling. Failed commands restore the previous number for retry. Do not publish with direct `eas update` or the older `npm run update:preview`: they bypass the iteration counter.
- Commit the resulting iteration file after a successful publication. The heading number identifies the running bundle, not launches or downloads. The first numbered release is 1.
- Preserve the installed APK's runtime fingerprint. Even changing `package.json` scripts changes this SDK's fingerprint; keep those scripts intact for compatible OTA releases.
- Before publishing, run `npm run check`, `node --test tests/update-preview.test.cjs`, and compare a newly generated Android preview fingerprint with the installed build. Do not override runtime versions to force compatibility.
- Keep Android terrain in small independent SVG roots. Character/reward animation invalidates its own SVG bitmap; it must never invalidate one giant SVG containing the entire map window.
