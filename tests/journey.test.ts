import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cameraAt,
  characterPosition,
  milestoneForStep,
  nextMilestoneAfter,
  positionForStep,
  resolveCharacterState,
  routeWindow,
  tierForStep,
  zoomAtFocal,
} from "../src/journey/model";
test("achievement ranges include every boundary exactly once", () => {
  const cases = [
    [0, "base"],
    [179, "base"],
    [180, "solid"],
    [199, "solid"],
    [200, "excellent"],
    [219, "excellent"],
    [220, "extraordinary"],
    [239, "extraordinary"],
    [240, "champion"],
    [260, "champion"],
    [261, "legendary"],
    [10000, "legendary"],
  ] as const;
  for (const [step, tier] of cases) assert.equal(tierForStep(step), tier);
});
test("route windows are deterministic, extendable and never overlap", () => {
  assert.deepEqual(routeWindow(230, 290), routeWindow(0, 320).slice(230, 291));
  const route = routeWindow(0, 1000);
  assert.equal(new Set(route.map((p) => `${p.x},${p.y}`)).size, route.length);
  for (let i = 1; i < route.length; i++) {
    const p = route[i]!;
    const previous = route[i - 1]!;
    assert.ok(Math.hypot(p.x - previous.x, p.y - previous.y) < 100);
    // Diamond half-height <= 27. Even the two largest platforms stay separate.
    assert.ok(Math.abs(p.y - previous.y) >= 54);
  }
  assert.equal(milestoneForStep(280)?.kind, "trophy");
  assert.equal(milestoneForStep(300)?.kind, "trophy");
});
test("character movement follows route corners rather than cutting across", () => {
  assert.deepEqual(characterPosition(5, 7, 0.5), positionForStep(6));
  assert.deepEqual(characterPosition(7, 5, 0.5), positionForStep(6));
  assert.deepEqual(characterPosition(0, 280, 1), positionForStep(280));
  assert.deepEqual(characterPosition(0, 5, -1), positionForStep(0));
});
test("pause and temporary disappointment preserve earned ability inputs", () => {
  assert.equal(resolveCharacterState(0), "sleeping");
  assert.equal(resolveCharacterState(5), "standing");
  assert.equal(resolveCharacterState(8, 4), "jogging");
  assert.equal(resolveCharacterState(60, 13), "running");
  assert.equal(resolveCharacterState(150, 26), "flying");
  assert.equal(resolveCharacterState(150, 26, "vacation", true), "vacation");
  assert.equal(resolveCharacterState(150, 26, undefined, true), "broken");
  assert.equal(resolveCharacterState(150, 26), "flying");
});
test("focal zoom preserves the world point over repeated camera operations", () => {
  let camera = cameraAt(positionForStep(205), 360, 840, 0.8);
  let zoom = 0.8;
  const focal = { x: 123, y: 345 };
  const original = {
    x: (focal.x - camera.x) / zoom,
    y: (focal.y - camera.y) / zoom,
  };
  for (const next of [1.2, 0.55, 1.6, 0.7, 1.1, 0.8]) {
    camera = zoomAtFocal(camera, zoom, next, focal);
    zoom = next;
    assert.ok(Math.abs((focal.x - camera.x) / zoom - original.x) < 1e-8);
    assert.ok(Math.abs((focal.y - camera.y) / zoom - original.y) < 1e-8);
  }
});

test("upcoming rewards extend without generating an entire route prefix", () => {
  assert.equal(nextMilestoneAfter(0).step, 10);
  assert.equal(nextMilestoneAfter(259).step, 260);
  assert.equal(nextMilestoneAfter(260).step, 280);
  assert.equal(nextMilestoneAfter(280).step, 300);
  assert.equal(nextMilestoneAfter(1000000).step, 1000020);
});
