/* Requires a running development server: npm run web -- --port 8081 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("@playwright/test");
const output = process.env.JOURNEY_CAPTURE_DIR || "/tmp/journey-validation";
const url = process.env.JOURNEY_URL || "http://localhost:8081";
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 360, height: 840 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const dev = page.getByRole("button", {
      name: "Open developer preview",
      exact: true,
    });
    await dev.waitFor();
    const close = () =>
      page
        .getByRole("button", { name: "Close panel", exact: true })
        .last()
        .click();
    async function choose(step, state = "auto") {
      await dev.click();
      await page
        .getByRole("button", { name: `Preview ${step} steps`, exact: true })
        .click();
      await page.getByRole("button", { name: state, exact: true }).click();
      await close();
      await page.waitForTimeout(3500);
    }
    await choose(0);
    await page.screenshot({ path: `${output}/journey-0.png` });
    for (const label of ["Back", "Edit Goals", "Edit Workouts", "Settings"]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      assert.ok(
        await page
          .getByText(/future chapter|future chapter|Journey preview only/i)
          .count(),
      );
      await close();
    }
    for (const [step, tier] of [
      [180, "Solid Year"],
      [205, "Excellent Year"],
      [230, "Extraordinary Year"],
      [250, "Champion Year"],
      [260, "Champion Year"],
      [261, "Legendary Year"],
      [280, "Legendary Year"],
    ]) {
      await choose(step);
      assert.ok(await page.getByText(tier, { exact: true }).count());
      await page.screenshot({ path: `${output}/journey-${step}.png` });
    }
    for (const state of [
      "sleeping",
      "standing",
      "jogging",
      "running",
      "flying",
      "broken streak",
      "vacation",
      "sick",
      "injury",
    ])
      await choose(280, state);
    await choose(205, "jogging");
    const camera = page.locator("#world-camera");
    const matrix = async () =>
      (await camera.getAttribute("transform"))
        .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)
        .map(Number);
    const original = await matrix();
    const cdp = await context.newCDPSession(page);
    async function touch(type, points) {
      await cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: points.map((p, i) => ({ x: p[0], y: p[1], id: i })),
        modifiers: 0,
      });
      await page.waitForTimeout(35);
    }
    for (let loop = 0; loop < 3; loop++) {
      await touch("touchStart", [[140, 360]]);
      for (let i = 1; i <= 5; i++)
        await touch("touchMove", [[140 + i * 8, 360 + i * 10]]);
      await touch("touchEnd", []);
      const before = await matrix();
      await touch("touchStart", [
        [130, 420],
        [230, 420],
      ]);
      for (let i = 1; i <= 12; i++)
        await touch("touchMove", [
          [130 - i * 5, 420],
          [230 + i * 5, 420],
        ]);
      await touch("touchEnd", []);
      await page.waitForTimeout(400);
      const after = await matrix();
      assert.ok(after[0] >= before[0], "pinch increases scale");
      assert.ok(
        Math.abs(after[0] - before[0]) > 0.01 || after[0] > 1.64,
        "pinch recognizer actually ran",
      );
    }
    assert.notDeepEqual(await matrix(), original, "camera moved");
    await page
      .getByRole("button", { name: "Recenter on explorer", exact: true })
      .click();
    await page.waitForTimeout(900);
    const restored = await matrix();
    for (let i = 0; i < 6; i++)
      assert.ok(
        Math.abs(original[i] - restored[i]) < 0.1,
        "recenter restores camera",
      );
    await page.getByRole("button", { name: /Next reward/ }).click();
    assert.ok(await page.getByText("COLLECTED · STEP 220").count());
    const atPanel = await matrix();
    await page.getByRole("button", { name: "Dismiss milestone" }).click();
    assert.deepEqual(await matrix(), atPanel);
    // Bring step 200 clear of the fixed bottom HUD before tapping its world geometry.
    await touch("touchStart", [[180, 400]]);
    for (let i = 1; i <= 6; i++)
      await touch("touchMove", [[180, 400 - i * 24]]);
    await touch("touchEnd", []);
    await page.waitForTimeout(300);
    // Tap the visible step-200 monument in world coordinates, not a HUD button.
    const { positionForStep } = await import("../src/journey/model.ts");
    const p = positionForStep(200);
    const m = await matrix();
    await page.touchscreen.tap(p.x * m[0] + m[4], (p.y - 10) * m[3] + m[5]);
    await page.getByText("COLLECTED · STEP 200", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Dismiss milestone" }).click();
    for (const width of [320, 360, 412]) {
      await page.setViewportSize({ width, height: 840 });
      await page.waitForTimeout(900);
      for (const label of ["Back", "Edit Goals", "Edit Workouts", "Settings"]) {
        const rect = await page
          .getByRole("button", { name: label, exact: true })
          .boundingBox();
        assert.ok(
          rect.x >= 0 && rect.x + rect.width <= width + 0.1,
          `${label} fits ${width}dp`,
        );
        assert.ok(rect.width >= 48 && rect.height >= 48);
      }
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.screenshot({ path: `${output}/width-${width}.png` });
    }
    await page.reload();
    await dev.waitFor();
    await page.waitForTimeout(1000);
    assert.ok(
      await page.getByText("205", { exact: true }).count(),
      "preview persists",
    );
    assert.deepEqual(errors, [], "no runtime errors");
    console.log(
      "PASS: tier previews; nine animation states; four navigation actions; repeated touch pan/pinch; recenter; map milestone tap; panel camera preservation; 320/360/412dp controls; persistence.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
