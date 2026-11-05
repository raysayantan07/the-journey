import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { CHARACTER_STATES, PREVIEW_STEPS, type CharacterState } from "./model";
import { palette } from "../design/tokens";
export function PreviewPanel({
  step,
  state,
  onStep,
  onState,
  follow,
  onFollow,
}: {
  step: number;
  state: CharacterState | "auto";
  onStep: (s: number) => void;
  onState: (s: CharacterState | "auto") => void;
  follow: boolean;
  onFollow: (v: boolean) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.note}>
        A separate sandbox. Sample activities are never real workout history.
      </Text>
      <Text style={styles.heading}>COMPLETED ACTIVITIES</Text>
      <View style={styles.grid}>
        {PREVIEW_STEPS.map((s) => (
          <Pressable
            key={s}
            accessibilityRole="button"
            accessibilityLabel={`Preview ${s} steps`}
            accessibilityState={{ selected: step === s }}
            onPress={() => onStep(s)}
            style={[styles.chip, step === s && styles.selected]}
          >
            <Text style={[styles.text, step === s && styles.selectedText]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => onStep(step + 1)}
        style={styles.add}
      >
        <Text style={styles.addText}>Complete a sample activity +1</Text>
      </Pressable>
      <Text style={styles.heading}>CHARACTER ANIMATION</Text>
      <View style={styles.grid}>
        {(["auto", ...CHARACTER_STATES] as const).map((s) => (
          <Pressable
            key={s}
            accessibilityRole="button"
            accessibilityState={{ selected: state === s }}
            onPress={() => onState(s)}
            style={[styles.chip, state === s && styles.selected]}
          >
            <Text style={[styles.text, state === s && styles.selectedText]}>
              {s === "broken" ? "broken streak" : s}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>Follow progress with camera</Text>
        <Switch
          accessibilityLabel="Follow progress with camera"
          value={follow}
          onValueChange={onFollow}
          trackColor={{ true: "#8CAF91", false: "#D7DCD0" }}
        />
      </View>
      <Text style={styles.note}>
        Animation previews are independent of workout count. Real streak
        calculations arrive in a later milestone. Long-press the title to reopen
        this panel.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  body: { gap: 16, paddingBottom: 24 },
  note: { fontSize: 12, lineHeight: 19, color: palette.muted },
  heading: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: palette.muted,
    fontWeight: "700",
    marginTop: 6,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 17,
    backgroundColor: "#EAEDE2",
    borderWidth: 1,
    borderColor: "#DCE2D3",
  },
  selected: { backgroundColor: palette.dark, borderColor: palette.dark },
  text: { fontSize: 13, color: palette.ink, textTransform: "capitalize" },
  selectedText: { color: palette.white },
  add: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#DBE8CC",
    alignItems: "center",
    minHeight: 52,
  },
  addText: { fontSize: 13, fontWeight: "600", color: palette.dark },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
});
