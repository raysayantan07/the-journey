import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Text as SvgText,
} from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  cameraAt,
  positionForStep,
  routeWindow,
  type CharacterState,
  type Milestone,
} from "./model";
import { Character } from "./Character";
import { Garden, Stone, WorldDefs } from "./WorldArt";
import { useAmbientPhase } from "../components/useAmbientPhase";
import { motion } from "../design/tokens";

const AnimatedGroup = Animated.createAnimatedComponent(G);
const isWeb = Platform.OS === "web";
export type WorldHandle = { recenter: () => void };
type Props = {
  width: number;
  height: number;
  step: number;
  characterState: CharacterState;
  selected?: number;
  onMilestone: (milestone: Milestone) => void;
  follow: boolean;
};
export const JourneyWorld = forwardRef<WorldHandle, Props>(
  function JourneyWorld(
    { width, height, step, characterState, selected, onMilestone, follow },
    ref,
  ) {
    const initialZoom = Math.min(0.92, Math.max(0.65, width / 470));
    const initial = cameraAt(positionForStep(step), width, height, initialZoom);
    const zoom = useSharedValue(initialZoom);
    const tx = useSharedValue(initial.x);
    const ty = useSharedValue(initial.y);
    const startZoom = useSharedValue(1);
    const worldFocalX = useSharedValue(0);
    const worldFocalY = useSharedValue(0);
    const travel = useSharedValue(step);
    const facing = useSharedValue(1);
    const pulse = useAmbientPhase(7000);
    const reduced = useReducedMotion();
    const pinching = useSharedValue(false);
    const [centerStep, setCenterStep] = useState(step);
    const maxStep = Math.max(320, step + 80);
    const visible = useMemo(
      () =>
        routeWindow(
          Math.max(0, centerStep - 35),
          Math.min(maxStep, centerStep + 35),
        ),
      [centerStep, maxStep],
    );
    const recenter = useCallback(() => {
      const p = positionForStep(step);
      const target = cameraAt(p, width, height, initialZoom);
      zoom.value = withTiming(initialZoom, {
        duration: reduced ? 0 : motion.camera,
      });
      tx.value = withTiming(target.x, {
        duration: reduced ? 0 : motion.camera,
      });
      ty.value = withTiming(target.y, {
        duration: reduced ? 0 : motion.camera,
      });
    }, [step, width, height, initialZoom, zoom, tx, ty, reduced]);
    useImperativeHandle(ref, () => ({ recenter }), [recenter]);
    useEffect(() => {
      const distance = Math.abs(step - travel.value);
      const from = positionForStep(Math.floor(travel.value));
      const next = positionForStep(
        Math.floor(travel.value) + (step >= travel.value ? 1 : -1),
      );
      facing.value = next.x >= from.x ? 1 : -1;
      // Small activity increments travel every stone; large developer jumps use a short scenic transition.
      travel.value = withTiming(step, {
        duration: reduced
          ? 0
          : Math.min(3200, Math.max(450, distance * motion.hop)),
        easing: Easing.inOut(Easing.cubic),
      });
      if (follow) recenter();
    }, [step, travel, facing, follow, recenter, reduced]);
    useEffect(() => {
      const subscription = AppState.addEventListener("change", (state) => {
        if (state !== "active") {
          cancelAnimation(tx);
          cancelAnimation(ty);
          cancelAnimation(zoom);
          travel.value = step;
        }
      });
      return () => subscription.remove();
    }, [tx, ty, zoom, travel, step]);
    useAnimatedReaction(
      () => Math.round((140 - (height / 2 - ty.value) / zoom.value) / 540) * 10,
      (bucket, previous) => {
        if (bucket !== previous)
          runOnJS(setCenterStep)(Math.max(0, Math.min(maxStep, bucket)));
      },
      [height, maxStep],
    );
    useDerivedValue(() => {
      const id = Math.floor(travel.value);
      const s = Math.floor((id + 3) / 6);
      // Mirror the figurine at each switchback, including reverse travel.
      facing.value = (s % 2 === 0 ? 1 : -1) * (step >= travel.value ? 1 : -1);
    }, [step]);
    const cameraProps = useAnimatedProps(() => ({
      opacity: 1,
      ...(isWeb
        ? {
            transform: `matrix(${zoom.value} 0 0 ${zoom.value} ${tx.value} ${ty.value})`,
          }
        : { matrix: [zoom.value, 0, 0, zoom.value, tx.value, ty.value] }),
    }));
    const ambientProps = useAnimatedProps(() => ({
      opacity: 0.4 + Math.sin(pulse.value) * 0.2,
    }));
    const boundX = (x: number, s: number) => {
      "worklet";
      return Math.max(width / 2 - 500 * s, Math.min(width / 2 + 300 * s, x));
    };
    const boundY = (y: number, s: number) => {
      "worklet";
      return Math.max(
        height * 0.25 - 240 * s,
        Math.min(maxStep * 54 * s + height * 0.75, y),
      );
    };
    const pan = Gesture.Pan()
      .maxPointers(1)
      .minDistance(7)
      .onStart(() => {
        cancelAnimation(tx);
        cancelAnimation(ty);
      })
      .onChange((e) => {
        if (!pinching.value) {
          tx.value = boundX(tx.value + e.changeX, zoom.value);
          ty.value = boundY(ty.value + e.changeY, zoom.value);
        }
      });
    const pinch = Gesture.Pinch()
      .onStart((e) => {
        cancelAnimation(tx);
        cancelAnimation(ty);
        cancelAnimation(zoom);
        pinching.value = true;
        startZoom.value = zoom.value;
        worldFocalX.value = (e.focalX - tx.value) / zoom.value;
        worldFocalY.value = (e.focalY - ty.value) / zoom.value;
      })
      .onUpdate((e) => {
        const s = Math.max(0.48, Math.min(1.65, startZoom.value * e.scale));
        zoom.value = s;
        tx.value = e.focalX - worldFocalX.value * s;
        ty.value = e.focalY - worldFocalY.value * s;
      })
      .onFinalize(() => {
        pinching.value = false;
        tx.value = withTiming(boundX(tx.value, zoom.value), { duration: 250 });
        ty.value = withTiming(boundY(ty.value, zoom.value), { duration: 250 });
      });
    const hitMilestone = useCallback(
      (x: number, y: number) => {
        const nearest = visible.find(
          (t) =>
            t.milestone &&
            Math.abs(t.x - x) < 65 &&
            Math.abs(t.y - y - 14) < 65,
        );
        if (nearest?.milestone) onMilestone(nearest.milestone);
      },
      [visible, onMilestone],
    );
    const tap = Gesture.Tap()
      .maxDistance(7)
      .onEnd((e, success) => {
        if (success)
          runOnJS(hitMilestone)(
            (e.x - tx.value) / zoom.value,
            (e.y - ty.value) / zoom.value,
          );
      });
    const gesture = Gesture.Simultaneous(pinch, Gesture.Exclusive(pan, tap));
    return (
      <View
        style={StyleSheet.absoluteFill}
        accessibilityLabel="Journey adventure map. Drag to explore, pinch to zoom. Use the next reward button to inspect a milestone."
      >
        <GestureDetector gesture={gesture}>
          <View style={StyleSheet.absoluteFill} collapsable={false}>
            <Svg testID="journey-scene" width={width} height={height}>
              <WorldDefs />
              <AnimatedGroup id="world-camera" animatedProps={cameraProps}>
                {visible
                  .filter((t) => t.id % 12 === 0)
                  .map((t) => (
                    <G key={`mist${t.id}`}>
                      <Ellipse
                        cx={t.x + 80}
                        cy={t.y - 100}
                        rx="310"
                        ry="170"
                        fill={`url(#mist-${t.tier})`}
                      />
                    </G>
                  ))}
                {visible.map((t) => (
                  <G key={`trail${t.id}`}>
                    <Circle
                      cx={t.x + 60}
                      cy={t.y + 35}
                      r="2"
                      fill="#BBC6AC"
                      opacity=".5"
                    />
                    <Circle
                      cx={t.x - 70}
                      cy={t.y - 22}
                      r="1.5"
                      fill="#BBC6AC"
                      opacity=".6"
                    />
                  </G>
                ))}
                {visible
                  .slice()
                  .reverse()
                  .map((t) => (
                    <G key={t.id}>
                      <Garden tile={t} />
                      <Stone
                        tile={t}
                        completed={t.id <= step}
                        selected={selected === t.id}
                      />
                    </G>
                  ))}
                {centerStep < 30 && (
                  <G x="110" y="254">
                    <Path
                      d="M-30-8 Q0 4 30-8"
                      fill="none"
                      stroke="#CBD7BB"
                      strokeWidth="1"
                    />
                    <SvgText
                      textAnchor="middle"
                      y="22"
                      fontFamily="sans-serif"
                      fontSize="12"
                      letterSpacing="3"
                      fill="#8C9D81"
                    >
                      THE FIRST CHAPTER
                    </SvgText>
                    <SvgText
                      textAnchor="middle"
                      y="44"
                      fontFamily="sans-serif"
                      fontSize="11"
                      fill="#A1AD94"
                    >
                      Every adventure starts somewhere.
                    </SvgText>
                  </G>
                )}
                <AnimatedGroup animatedProps={ambientProps}>
                  {visible
                    .filter((t) => t.id % 8 === 0)
                    .map((t) => (
                      <G key={t.id} x={t.x - 95} y={t.y - 55}>
                        <Path
                          d="M0-5 V5 M-5 0 H5"
                          stroke="#D4BA7D"
                          strokeWidth="1.5"
                        />
                        <Circle cx="20" cy="-16" r="1.5" fill="#D4BA7D" />
                      </G>
                    ))}
                </AnimatedGroup>
                <Character
                  travel={travel}
                  state={characterState}
                  facing={facing}
                />
              </AnimatedGroup>
            </Svg>
          </View>
        </GestureDetector>
      </View>
    );
  },
);
