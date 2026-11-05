import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Modal,
  PixelRatio,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeInUp,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "../components/Icon";
import { RoundButton } from "../components/RoundButton";
import { palette, softShadow } from "../design/tokens";
import { JourneyWorld, type WorldHandle } from "./JourneyWorld";
import {
  milestoneForStep,
  nextMilestoneAfter,
  normalizeStep,
  resolveCharacterState,
  themeForStep,
  tierForStep,
  type CharacterState,
  type Milestone,
} from "./model";
import { PreviewPanel } from "./PreviewPanel";
import { loadPreview, savePreview } from "./previewStore";
import { iteration } from "../iteration.json";

type Panel = "settings" | "back" | "goals" | "workouts" | "preview" | null;
const copy = {
  settings: {
    title: "A space that’s yours",
    eyebrow: "SETTINGS",
    body: "Your journey, at your pace. Appearance, local profiles and backup preferences will live here in a future chapter.",
  },
  back: {
    title: "One step at a time",
    eyebrow: "WEEKLY WORKOUTS",
    body: "Your training week will live here. For now, enjoy exploring your Journey. Every completed activity will move your explorer one stone forward.",
  },
  goals: {
    title: "Dream a little bigger",
    eyebrow: "YOUR QUESTS",
    body: "A marathon. A first 5K. Feeling stronger. Personal quests will become little islands beside your path, with progress independent of your activity count.",
  },
  workouts: {
    title: "Make room for movement",
    eyebrow: "YOUR TRAINING",
    body: "Workout editing is coming in a later chapter. Strength, running or a bonus adventure: each completed activity will count as one step.",
  },
};
export function JourneyScreen() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const world = useRef<WorldHandle>(null);
  const [step, setStep] = useState(0);
  const [highest, setHighest] = useState(0);
  const [hydrated, setHydrated] = useState(!__DEV__);
  const [previewState, setPreviewState] = useState<CharacterState | "auto">(
    "auto",
  );
  const [follow, setFollow] = useState(true);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<Milestone | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const celebration = useSharedValue(0);
  const previousStep = useRef(0);
  const saveQueue = useRef(Promise.resolve());
  const theme = themeForStep(step);
  const tier = tierForStep(step);
  const state =
    previewState === "auto" ? resolveCharacterState(step) : previewState;
  const nextMilestone = nextMilestoneAfter(step);
  const year = new Date().getFullYear();
  const navBottom = Math.max(18, insets.bottom + 12);
  const compact = height < 680 || fontScale > 1.3;
  useEffect(() => {
    let active = true;
    if (__DEV__)
      loadPreview()
        .then((value) => {
          if (active && value) {
            setStep(value.step);
            setHighest(value.highest);
            previousStep.current = value.step;
          }
        })
        .catch(() => {
          if (active) setStorageError(true);
        })
        .finally(() => {
          if (active) setHydrated(true);
        });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (__DEV__ && hydrated) {
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(() => savePreview({ step, highest }))
        .catch(() => setStorageError(true));
    }
  }, [step, highest, hydrated]);
  useEffect(() => {
    const previous = previousStep.current;
    previousStep.current = step;
    if (
      step > previous &&
      (tierForStep(previous) !== tier || milestoneForStep(step))
    ) {
      setCelebrating(milestoneForStep(step)?.name ?? theme.label);
      celebration.value = 0;
      celebration.value = withSequence(
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 1700 }),
        withTiming(0, { duration: 500 }),
      );
      const timer = setTimeout(() => setCelebrating(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [step, tier, theme.label, celebration]);
  useEffect(() => {
    if (!selected) return;
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      setSelected(null);
      return true;
    });
    return () => handler.remove();
  }, [selected]);
  const celebrationStyle = useAnimatedStyle(() => ({
    opacity: celebration.value,
    transform: [{ translateY: (1 - celebration.value) * -16 }],
  }));
  function changeStep(value: number) {
    const next = normalizeStep(value);
    setStep(next);
    setHighest((h) => Math.max(h, next));
    setSelected(null);
  }
  const panelCopy = panel && panel !== "preview" ? copy[panel] : null;
  return (
    <View style={styles.screen}>
      <JourneyWorld
        ref={world}
        width={width}
        height={height}
        step={step}
        characterState={state}
        selected={selected?.step}
        onMilestone={setSelected}
        follow={follow}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["#F6F3EB", "#F6F3EBF2", "#F6F3EB00"]}
        locations={[0, 0.72, 1]}
        style={[styles.topWash, { height: insets.top + (compact ? 190 : 235) }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["#F6F3EB00", "#F6F3EBE6", "#F6F3EB"]}
        style={[styles.bottomWash, { height: navBottom + 170 }]}
      />
      <View
        pointerEvents="box-none"
        style={[styles.header, { top: insets.top + 18, left: 24, right: 20 }]}
      >
        <Pressable
          accessibilityRole={__DEV__ ? "button" : undefined}
          accessibilityLabel={
            __DEV__
              ? `The Journey, iteration ${iteration}. Long press for developer preview`
              : `The Journey, iteration ${iteration}`
          }
          onLongPress={__DEV__ ? () => setPanel("preview") : undefined}
          delayLongPress={650}
          style={styles.titleArea}
        >
          <Text style={styles.eyebrow}>{year} / YOUR OWN ADVENTURE</Text>
          <Text
            style={[styles.title, { fontSize: compact ? 30 : 36 }]}
            maxFontSizeMultiplier={1.4}
          >
            The Journey<Text style={styles.titleDot}>.</Text>
            <Text style={styles.iteration}> {iteration}</Text>
          </Text>
        </Pressable>
        <RoundButton
          compact
          icon="settings"
          label="Settings"
          onPress={() => setPanel("settings")}
        />
        <View style={styles.stats}>
          <View style={styles.countRow}>
            <Text style={styles.count}>{step.toLocaleString()}</Text>
            <Text style={styles.steps}> {step === 1 ? "step" : "steps"}</Text>
            <View style={styles.divider} />
            <View style={[styles.tierDot, { backgroundColor: theme.right }]} />
            <Text style={[styles.tier, { color: theme.accent }]}>
              {tier === "base" ? "The beginning" : theme.label}
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={`${step} activities. Reference goal 260. The journey continues beyond it.`}
            accessibilityValue={{ min: 0, max: 260, now: Math.min(step, 260) }}
            style={styles.progressTrack}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, (step / 260) * 100)}%`,
                  backgroundColor: theme.right,
                },
              ]}
            />
            {[180, 200, 220, 240].map((s) => (
              <View
                key={s}
                style={[styles.progressTick, { left: `${(s / 260) * 100}%` }]}
              />
            ))}
          </View>
        </View>
      </View>
      {!selected && (
        <View
          pointerEvents="box-none"
          style={[
            styles.discovery,
            { bottom: navBottom + (compact ? 112 : 132), left: 24, right: 22 },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Next reward, ${nextMilestone.name}, step ${nextMilestone.step}`}
            onPress={() => setSelected(nextMilestone)}
            style={styles.rewardPill}
          >
            <View style={styles.rewardIcon}>
              <Icon name="spark" size={17} color="#A78748" />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.next}>NEXT LITTLE VICTORY</Text>
              <Text style={styles.rewardName} numberOfLines={1}>
                Step {nextMilestone.step}{" "}
                <Text style={{ color: palette.muted }}>
                  {" "}
                  / {nextMilestone.name}
                </Text>
              </Text>
            </View>
          </Pressable>
          <RoundButton
            compact
            icon="locate"
            label="Recenter on explorer"
            onPress={() => world.current?.recenter()}
          />
        </View>
      )}
      {selected && (
        <Animated.View
          entering={FadeInUp.duration(220)}
          exiting={FadeOutDown.duration(160)}
          style={[
            styles.milestoneCard,
            { bottom: navBottom + 116, left: 20, right: 20 },
          ]}
        >
          <View style={styles.milestoneHead}>
            <View style={styles.unlocked}>
              <Icon
                name={highest >= selected.step ? "check" : "spark"}
                size={16}
                color={theme.accent}
              />
              <Text style={styles.unlockText}>
                {highest >= selected.step ? "COLLECTED" : "WAITING FOR YOU"} ·
                STEP {selected.step}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss milestone"
              onPress={() => setSelected(null)}
              style={styles.dismiss}
            >
              <Icon name="close" size={18} />
            </Pressable>
          </View>
          <Text style={styles.milestoneTitle}>{selected.name}</Text>
          <Text style={styles.description}>
            {highest >= selected.step
              ? "A small reminder of every time you showed up. This reward stays yours."
              : `${selected.step - step} more ${selected.step - step === 1 ? "activity" : "activities"} to this little landmark. No rush. Your path is your own.`}
          </Text>
        </Animated.View>
      )}
      <View
        style={[
          styles.navigation,
          { bottom: navBottom, paddingHorizontal: Math.max(26, width * 0.075) },
        ]}
      >
        <RoundButton
          icon="back"
          label="Back"
          onPress={() => setPanel("back")}
        />
        <RoundButton
          icon="target"
          label="Edit Goals"
          dark
          large
          onPress={() => setPanel("goals")}
        />
        <RoundButton
          icon="workout"
          label="Edit Workouts"
          onPress={() => setPanel("workouts")}
        />
      </View>
      {step === 0 && !compact && !selected && (
        <View
          pointerEvents="none"
          style={[styles.mapHint, { bottom: navBottom + 238 }]}
        >
          <Text style={styles.mapHintText}>
            DRAG TO WANDER · PINCH TO EXPLORE
          </Text>
        </View>
      )}
      {__DEV__ && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open developer preview"
          onPress={() => setPanel("preview")}
          style={[
            styles.devBadge,
            { top: insets.top + compactTop(compact), right: 20 },
          ]}
        >
          <Text style={styles.devText}>DEV</Text>
        </Pressable>
      )}
      {celebrating && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.celebration,
            { top: insets.top + 185, left: 24, right: 24 },
            celebrationStyle,
          ]}
        >
          <Icon name="spark" size={25} color="#BB9450" />
          <View style={{ flex: 1 }}>
            <Text style={styles.next}>LOOK HOW FAR YOU’VE COME</Text>
            <Text style={styles.celebrationTitle}>{celebrating}</Text>
          </View>
          <Text style={styles.confetti}>✦</Text>
        </Animated.View>
      )}
      <Modal
        visible={panel !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPanel(null)}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close panel"
            onPress={() => setPanel(null)}
            style={styles.scrim}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                maxHeight: height - insets.top - 28,
                paddingBottom: Math.max(insets.bottom + 20, 28),
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.eyebrow}>
                {panel === "preview"
                  ? "DEVELOPMENT SANDBOX"
                  : panelCopy?.eyebrow}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close panel"
                onPress={() => setPanel(null)}
                style={styles.dismiss}
              >
                <Icon name="close" size={22} />
              </Pressable>
            </View>
            <Text style={styles.sheetTitle}>
              {panel === "preview"
                ? "Explore the possibilities."
                : panelCopy?.title}
            </Text>
            {panel === "preview" ? (
              <PreviewPanel
                step={step}
                state={previewState}
                onStep={changeStep}
                onState={setPreviewState}
                follow={follow}
                onFollow={setFollow}
              />
            ) : (
              <ScrollView>
                <Text style={styles.sheetBody}>{panelCopy?.body}</Text>
                <View style={styles.futureLabel}>
                  <View style={styles.smallDot} />
                  <Text style={styles.futureText}>
                    A future chapter · Journey preview only
                  </Text>
                </View>
                {panel === "settings" && (
                  <Text style={styles.deviceInfo}>
                    {Math.round(width)} × {Math.round(height)} dp ·{" "}
                    {PixelRatio.get().toFixed(1)}× density · {Platform.OS}
                    {storageError
                      ? "\nPreview progress could not be saved on this device."
                      : ""}
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
function compactTop(compact: boolean) {
  return compact ? 151 : 164;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  topWash: { position: "absolute", top: 0, left: 0, right: 0 },
  bottomWash: { position: "absolute", bottom: 0, left: 0, right: 0 },
  header: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  titleArea: { flex: 1, minWidth: 170 },
  eyebrow: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: palette.muted,
    lineHeight: 16,
  },
  title: {
    fontFamily: "serif",
    fontWeight: "500",
    letterSpacing: -1.4,
    color: palette.ink,
    lineHeight: 47,
  },
  titleDot: { color: "#91AB77" },
  iteration: {
    fontFamily: "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0,
    color: palette.muted,
  },
  stats: { width: "100%", gap: 12, paddingTop: 5, paddingRight: 64 },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 3,
  },
  count: {
    fontSize: 27,
    fontWeight: "500",
    letterSpacing: -1,
    color: palette.ink,
  },
  steps: { fontSize: 12, color: palette.muted },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: "#D7DFCD",
    marginHorizontal: 10,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: "center",
    marginRight: 4,
  },
  tier: { fontSize: 11, fontWeight: "500", flexShrink: 1 },
  progressTrack: {
    height: 3,
    backgroundColor: "#E1E5D8",
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: 3, borderRadius: 2 },
  progressTick: {
    position: "absolute",
    height: 3,
    width: 2,
    backgroundColor: palette.paper,
  },
  discovery: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rewardPill: {
    backgroundColor: "#FFFEF9ED",
    borderWidth: 1,
    borderColor: "#E6E9DE",
    borderRadius: 22,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
    paddingVertical: 10,
    minHeight: 52,
  },
  rewardIcon: {
    width: 34,
    height: 34,
    backgroundColor: "#EDE8D7",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  next: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: palette.muted,
    fontWeight: "700",
    lineHeight: 16,
  },
  rewardName: {
    fontSize: 10,
    color: palette.ink,
    fontWeight: "600",
    lineHeight: 19,
  },
  navigation: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  mapHint: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  mapHintText: { fontSize: 7, letterSpacing: 1.7, color: "#98A58D" },
  devBadge: {
    position: "absolute",
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  devText: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#9AA58E",
    borderWidth: 1,
    borderColor: "#D8DFCD",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  milestoneCard: {
    position: "absolute",
    padding: 20,
    paddingTop: 8,
    borderRadius: 24,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#E1E5D7",
    ...softShadow,
  },
  milestoneHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unlocked: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1 },
  unlockText: {
    fontSize: 8,
    letterSpacing: 1.1,
    color: palette.muted,
    fontWeight: "700",
    flexShrink: 1,
  },
  dismiss: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneTitle: {
    fontFamily: "serif",
    fontSize: 24,
    color: palette.ink,
    marginBottom: 8,
  },
  description: { fontSize: 12, color: palette.muted, lineHeight: 19 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  scrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#23382E55",
  },
  sheet: {
    backgroundColor: palette.paper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 26,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D9C8",
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontFamily: "serif",
    fontSize: 31,
    letterSpacing: -0.5,
    color: palette.ink,
    marginBottom: 20,
  },
  sheetBody: { fontSize: 15, lineHeight: 25, color: "#788773" },
  futureLabel: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingVertical: 24,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A2B88E",
  },
  futureText: { fontSize: 10, color: palette.muted, flexShrink: 1 },
  deviceInfo: { fontSize: 10, color: palette.muted, lineHeight: 18 },
  celebration: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 17,
    borderRadius: 22,
    backgroundColor: "#FFF9E8",
    ...softShadow,
  },
  celebrationTitle: { fontFamily: "serif", fontSize: 20, color: palette.ink },
  confetti: { fontSize: 25, color: "#D3AD69" },
});
