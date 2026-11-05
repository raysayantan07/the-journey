import { useEffect } from "react";
import { AppState } from "react-native";
import {
  cancelAnimation,
  Easing,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
/** One quiet loop; suspend background work and respect the device's motion preference. */
export function useAmbientPhase(duration: number) {
  const phase = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const update = (active: boolean) => {
      cancelAnimation(phase);
      phase.set(0);
      if (active && !reduced)
        phase.set(
          withRepeat(
            withTiming(Math.PI * 2, { duration, easing: Easing.linear }),
            -1,
            false,
          ),
        );
    };
    update(
      AppState.currentState !== "background" &&
        AppState.currentState !== "inactive",
    );
    const listener = AppState.addEventListener("change", (state) =>
      update(state === "active"),
    );
    return () => {
      listener.remove();
      cancelAnimation(phase);
    };
  }, [duration, phase, reduced]);
  return phase;
}
