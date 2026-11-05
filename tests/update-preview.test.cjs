const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

test("preview publication increments the bundled iteration and failed retries preserve it", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "journey-release-test-"));
  try {
    for (const dir of ["scripts", "src", "node_modules/.bin"]) {
      fs.mkdirSync(path.join(root, dir), { recursive: true });
    }
    fs.writeFileSync(path.join(root, "package.json"), "{}");
    fs.writeFileSync(
      path.join(root, "scripts/eas-ready.cjs"),
      "// Preflight fixture\n",
    );
    fs.copyFileSync(
      require.resolve("../scripts/update-preview.cjs"),
      path.join(root, "scripts/update-preview.cjs"),
    );
    const file = path.join(root, "src/iteration.json");
    fs.writeFileSync(file, '{"iteration":0}\n');
    // No network or publication: this executable verifies the actual CLI invocation.
    fs.writeFileSync(
      path.join(root, "node_modules/.bin/eas"),
      `#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
assert.deepEqual(process.argv.slice(2), ['update', '--channel', 'preview', '--platform', 'android', '--environment', 'preview', '--message', 'Test update', '--non-interactive']);
assert.equal(JSON.parse(fs.readFileSync('src/iteration.json')).iteration, Number(process.env.EXPECTED_ITERATION));
process.exit(Number(process.env.FAKE_EAS_EXIT));
`,
      { mode: 0o755 },
    );
    const run = (expected, exit) =>
      spawnSync(
        process.execPath,
        [
          path.join(root, "scripts/update-preview.cjs"),
          "--message",
          "Test update",
          "--non-interactive",
        ],
        {
          cwd: root,
          env: {
            ...process.env,
            EXPECTED_ITERATION: String(expected),
            FAKE_EAS_EXIT: String(exit),
          },
          encoding: "utf8",
        },
      );
    for (const [expected, exit, stored] of [
      [1, 0, 1],
      [2, 0, 2],
      [3, 1, 2],
      [3, 0, 3],
    ]) {
      const result = run(expected, exit);
      assert.equal(result.status, exit, result.stderr);
      assert.equal(JSON.parse(fs.readFileSync(file)).iteration, stored);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
