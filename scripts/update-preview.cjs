const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

require("./eas-ready.cjs");
if (process.exitCode) process.exit(process.exitCode);

// The number lives in the bundle: it identifies the code actually running,
// rather than the number of launches or updates the phone has downloaded.
const root = path.dirname(require.resolve("../package.json"));
const file = path.join(root, "src/iteration.json");
const previous = fs.readFileSync(file, "utf8");
const { iteration } = JSON.parse(previous);
if (!Number.isSafeInteger(iteration) || iteration < 0) {
  throw new Error("App iteration must be a nonnegative integer.");
}
fs.writeFileSync(
  file,
  JSON.stringify({ iteration: iteration + 1 }, null, 2) + "\n",
);
console.log(`Publishing Journey iteration ${iteration + 1}`);
const result = spawnSync(
  path.join(root, "node_modules/.bin/eas"),
  [
    "update",
    "--channel",
    "preview",
    "--platform",
    "android",
    "--environment",
    "preview",
    ...process.argv.slice(2),
  ],
  { cwd: root, stdio: "inherit", env: process.env },
);
if (result.status !== 0) {
  fs.writeFileSync(file, previous);
  console.error(
    "Publication failed; restored the previous iteration so a retry uses the same number.",
  );
  if (result.error) console.error(result.error.message);
  process.exitCode = result.status || 1;
}
