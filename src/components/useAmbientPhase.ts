import { createContext, useContext, useEffect } from "react";
import { AppState } from "react-native";
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const CameraInteractionContext = createContext<
  SharedValue<boolean> | undefined
>(undefined);

/** Suspend decorative SVG redraws during camera gestures and in the background. */
export function useAmbientPhase(
  duration: number,
  paused?: SharedValue<boolean>,
) {
  const cameraInteraction = useContext(CameraInteractionContext);
  const interaction = paused ?? cameraInteraction;
  const phase = useSharedValue(0);
  const active = useSharedValue(
    AppState.currentState !== "background" &&
      AppState.currentState !== "inactive",
  );
  const reduced = useReducedMotion();
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      active.set(state === "active");
    });
    return () => {
      listener.remove();
      cancelAnimation(phase);
    };
  }, [active, phase]);
  useAnimatedReaction(
    () => active.value && !reduced && !interaction?.value,
    (running, previous) => {
      if (running === previous) return;
      cancelAnimation(phase);
      if (running) {
        // Resume from the frozen pose rather than jumping back to phase zero.
        phase.set(
          withRepeat(
            withTiming(phase.value + Math.PI * 2, {
              duration,
              easing: Easing.linear,
            }),
            -1,
            false,
          ),
        );
      }
    },
    [duration, reduced, interaction],
  );
  return phase;
}
