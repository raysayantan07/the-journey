import { themes, type Theme } from "../design/tokens";
export type Point = { x: number; y: number };
export type Tier =
  "base" | "solid" | "excellent" | "extraordinary" | "champion" | "legendary";
export type CharacterState =
  | "sleeping"
  | "standing"
  | "jogging"
  | "running"
  | "flying"
  | "broken"
  | "vacation"
  | "sick"
  | "injury";
export type RewardKind =
  "chest" | "trophy" | "glow" | "gateway" | "collectible" | "monument";
export type Milestone = { step: number; name: string; kind: RewardKind };
export type Tile = Point & {
  id: number;
  tier: Tier;
  milestone?: Milestone;
  size: number;
};
export const PREVIEW_STEPS = [
  0, 5, 25, 60, 100, 180, 205, 230, 250, 260, 261, 280,
];
export const CHARACTER_STATES: CharacterState[] = [
  "sleeping",
  "standing",
  "jogging",
  "running",
  "flying",
  "broken",
  "vacation",
  "sick",
  "injury",
];
export function normalizeStep(value: number): number {
  "worklet";
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
export function tierForStep(value: number): Tier {
  const step = normalizeStep(value);
  if (step >= 261) return "legendary";
  if (step >= 240) return "champion";
  if (step >= 220) return "extraordinary";
  if (step >= 200) return "excellent";
  if (step >= 180) return "solid";
  return "base";
}
export function themeForStep(step: number): Theme {
  return themes[tierForStep(step)]!;
}
const milestones: Record<number, Omit<Milestone, "step">> = {
  10: { name: "First footprints", kind: "chest" },
  25: { name: "Finding your rhythm", kind: "collectible" },
  50: { name: "The growing grove", kind: "monument" },
  75: { name: "A little momentum", kind: "chest" },
  100: { name: "One hundred little wins", kind: "trophy" },
  150: { name: "The long way, together", kind: "glow" },
  180: { name: "Solid Year", kind: "gateway" },
  200: { name: "Excellent Year", kind: "monument" },
  220: { name: "Extraordinary Year", kind: "collectible" },
  240: { name: "Champion Year", kind: "trophy" },
  260: { name: "The Legendary gateway", kind: "gateway" },
};
export function milestoneForStep(step: number): Milestone | undefined {
  const reward =
    milestones[step] ??
    (step > 260 && (step - 260) % 20 === 0
      ? { name: "Beyond the ordinary", kind: "trophy" as const }
      : undefined);
  return reward ? { step, ...reward } : undefined;
}
export function nextMilestoneAfter(value: number): Milestone {
  const step = normalizeStep(value);
  const next =
    Object.keys(milestones)
      .map(Number)
      .find((id) => id > step) ??
    260 + (Math.floor((step - 260) / 20) + 1) * 20;
  return milestoneForStep(next)!;
}
// An isometric lattice: each edge travels one diagonal; rounded switchbacks every 6 steps.
// O(1), prefix-stable positions. No annual cap or dependence on the rendered window.
export function positionForStep(value: number): Point {
  "worklet";
  const step = normalizeStep(value);
  const phase = (step + 3) % 12;
  const lane = phase <= 6 ? phase : 12 - phase;
  return { x: 110 + (lane - 3) * 60, y: 140 - step * 54 };
}
export function tileForStep(id: number): Tile {
  const step = normalizeStep(id);
  return {
    id: step,
    ...positionForStep(step),
    tier: tierForStep(step),
    milestone: milestoneForStep(step),
    size: milestoneForStep(step) || step === 0 ? 54 : 43,
  };
}
export function routeWindow(
  first: number,
  last: number,
  previous: readonly Tile[] = [],
): Tile[] {
  const start = normalizeStep(first);
  const end = Math.max(start, normalizeStep(last));
  // Retain overlapping tile objects so memoized artwork can skip rendering.
  // Only the current window is retained; exploring never grows a global cache.
  const existing = new Map(previous.map((tile) => [tile.id, tile]));
  return Array.from(
    { length: end - start + 1 },
    (_, i) => existing.get(start + i) ?? tileForStep(start + i),
  );
}
export function positionForProgress(value: number): Point {
  "worklet";
  const floor = Math.floor(Math.max(0, value));
  const mix = Math.max(0, value) - floor;
  const p = positionForStep(floor);
  const q = positionForStep(floor + 1);
  return { x: p.x + (q.x - p.x) * mix, y: p.y + (q.y - p.y) * mix };
}
export function characterPosition(
  from: number,
  to: number,
  fraction: number,
): Point {
  const a = normalizeStep(from);
  const b = normalizeStep(to);
  const progress = Math.max(0, Math.min(1, fraction));
  const along = a + (b - a) * progress;
  return positionForProgress(along);
}
export function resolveCharacterState(
  steps: number,
  earnedWeeks = 0,
  pause?: "vacation" | "sick" | "injury",
  recentlyBroken = false,
): CharacterState {
  if (pause) return pause;
  if (recentlyBroken) return "broken";
  if (earnedWeeks >= 26) return "flying";
  if (earnedWeeks >= 13) return "running";
  if (earnedWeeks >= 4) return "jogging";
  return steps >= 5 ? "standing" : "sleeping";
}
export function cameraAt(
  point: Point,
  width: number,
  height: number,
  zoom: number,
): Point {
  return { x: width / 2 - point.x * zoom, y: height * 0.59 - point.y * zoom };
}
export function zoomAtFocal(
  camera: Point,
  oldZoom: number,
  newZoom: number,
  focal: Point,
): Point {
  return {
    x: focal.x - ((focal.x - camera.x) * newZoom) / oldZoom,
    y: focal.y - ((focal.y - camera.y) * newZoom) / oldZoom,
  };
}

/** Zoom bands keep window changes off the per-frame camera path. */
export function cameraZoomBand(zoom: number) {
  "worklet";
  return Math.max(0.48, Math.floor((zoom + 1e-6) / 0.12) * 0.12);
}

/** Gesture velocity is in screen dp/s, so flick feel stays consistent at every zoom. */
export function flickVelocity(
  velocity: number,
  reducedMotion = false,
  idleMilliseconds = 0,
) {
  "worklet";
  if (
    reducedMotion ||
    idleMilliseconds > 120 ||
    !Number.isFinite(idleMilliseconds) ||
    !Number.isFinite(velocity) ||
    Math.abs(velocity) < 90
  )
    return 0;
  return Math.max(-4500, Math.min(4500, velocity));
}

export function cameraBounds(
  width: number,
  height: number,
  maxStep: number,
  zoom: number,
) {
  "worklet";
  return {
    minX: width / 2 - 500 * zoom,
    maxX: width / 2 + 300 * zoom,
    minY: height * 0.25 - 240 * zoom,
    maxY: maxStep * 54 * zoom + height * 0.75,
  };
}

/** Viewport plus overscan for a 10-step camera bucket and artwork extents. */
export function cameraCanvas(centerStep: number, height: number, zoom = 0.48) {
  const halfWindow = Math.ceil(height / (cameraZoomBand(zoom) * 108)) + 8;
  return {
    halfWindow,
    x: -600,
    y: positionForStep(centerStep).y - halfWindow * 54 - 320,
    width: 1300,
    height: halfWindow * 108 + 640,
  };
}
