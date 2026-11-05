// Browser-only development preview fallback. Android resolves previewStore.native.ts.
export type PreviewData = { step: number; highest: number };
const key = `journey-preview-v1-${new Date().getFullYear()}`;
export async function loadPreview(): Promise<PreviewData | null> {
  const raw = globalThis.localStorage?.getItem(key);
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (
    typeof value === "object" &&
    value !== null &&
    "step" in value &&
    "highest" in value &&
    typeof value.step === "number" &&
    typeof value.highest === "number" &&
    Number.isSafeInteger(value.step) &&
    Number.isSafeInteger(value.highest) &&
    value.step >= 0 &&
    value.highest >= value.step
  )
    return { step: value.step, highest: value.highest };
  return null;
}
export async function savePreview(value: PreviewData) {
  globalThis.localStorage?.setItem(key, JSON.stringify(value));
}
