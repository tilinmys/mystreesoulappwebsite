import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { getColors, type AppColorMode } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { useHaptics } from "../../hooks/useHaptics";

export function GlassCard({
  children,
  mode = "light",
  onPress,
  style
}: {
  children: ReactNode;
  mode?: AppColorMode;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const colors = getColors(mode);
  const haptics = useHaptics();
  const cardStyle = [styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style];

  if (!onPress) return <View style={cardStyle}>{children}</View>;

  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.radiusXl,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: "#2B2D42",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 3
  },
  pressed: { transform: [{ scale: 0.97 }] }
});
