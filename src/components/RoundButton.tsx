import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Icon, type IconName } from "./Icon";
import { motion, palette, softShadow } from "../design/tokens";
export function RoundButton({
  icon,
  label,
  onPress,
  large = false,
  dark = false,
  compact = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  large?: boolean;
  dark?: boolean;
  compact?: boolean;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <View style={styles.wrap}>
      <Animated.View style={animated}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={onPress}
          onPressIn={() => {
            scale.set(withSpring(0.92, motion.press));
          }}
          onPressOut={() => {
            scale.set(withSpring(1, motion.press));
          }}
          style={[
            styles.button,
            large && styles.large,
            compact && styles.compact,
            dark && styles.dark,
          ]}
        >
          <Icon
            name={icon}
            size={large ? 27 : compact ? 21 : 25}
            color={dark ? "#F3F3DC" : palette.dark}
          />
        </Pressable>
      </Animated.View>
      {!compact && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10 },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E7D9",
    ...softShadow,
  },
  large: { width: 72, height: 72, borderRadius: 36 },
  compact: { width: 48, height: 48, borderRadius: 24 },
  dark: { backgroundColor: palette.dark, borderColor: "#466755" },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: palette.ink,
  },
});
