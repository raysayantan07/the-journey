// Fail before uploading if the first APK cannot receive this project's updates.
// A public Expo project UUID must come from `eas init`, never a placeholder.
const fs = require("node:fs");
const path = require("node:path");
const root = path.dirname(require.resolve("../package.json"));
const app = JSON.parse(
  fs.readFileSync(path.join(root, "app.json"), "utf8"),
).expo;
const eas = JSON.parse(fs.readFileSync(path.join(root, "eas.json"), "utf8"));
const errors = [];
const id = app.extra?.eas?.projectId;
if (
  !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id || "") ||
  id === "00000000-0000-0000-0000-000000000000"
) {
  errors.push(
    "Link a real Expo project: npx eas init --account YOUR_EXPO_USERNAME --non-interactive",
  );
}
if (!id || app.updates?.url !== `https://u.expo.dev/${id}`) {
  errors.push(
    "Configure its update URL: npx eas update:configure --platform android --environment preview --non-interactive",
  );
}
if (app.updates?.enabled === false)
  errors.push("expo.updates.enabled must not be false for the preview APK.");
if (app.runtimeVersion?.policy !== "fingerprint")
  errors.push(
    "Keep expo.runtimeVersion.policy set to fingerprint to isolate incompatible native runtimes.",
  );
const preview = eas.build?.preview;
if (
  preview?.distribution !== "internal" ||
  preview?.android?.buildType !== "apk"
)
  errors.push(
    "The preview build must use internal distribution and APK output.",
  );
if (preview?.channel !== "preview" || preview?.environment !== "preview")
  errors.push(
    "The preview build channel and environment must both be preview.",
  );
for (const dir of ["android", "ios"]) {
  if (fs.existsSync(path.join(root, dir)))
    errors.push(
      `Local ${dir}/ exists. This project uses Expo native generation; preserve any manual native edits, then remove the generated directory before EAS commands.`,
    );
}
if (errors.length) {
  console.error(
    "EAS preview is not ready yet:\n" + errors.map((e) => `- ${e}`).join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    "EAS preview config is ready: linked project, matching update URL, fingerprint runtime, preview channel/environment, internal APK.",
  );
}
