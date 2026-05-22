/**
 * GlassCard — base card primitive
 *
 * Token mapping
 * ─────────────
 *  Background  →  colors.surface  (#2E2330 dark / #F0E8F8 light)
 *  Border      →  colors.border
 *  Shadow      →  colors.background  (the deepest tone lifts the card subtly)
 */
import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { type AppColorMode, getColors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { useHaptics } from "../../hooks/useHaptics";

export function GlassCard({
  children,
  mode = "light",
  onPress,
  style,
}: {
  children:  ReactNode;
  mode?:     AppColorMode;
  onPress?:  () => void;
  style?:    ViewStyle;
}) {
  const colors  = getColors(mode);
  const haptics = useHaptics();

  // Use surface (not card legacy alias) + tokens for shadow depth
  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderColor:     colors.border,
      // Shadow uses the deepest background tone so the card appears to float
      // above the page; no need for heavy borders when the shadow is tuned.
      shadowColor: colors.background,
    },
    style,
  ];

  if (!onPress) return <View style={cardStyle}>{children}</View>;

  return (
    <Pressable
      onPress={() => { haptics.light(); onPress(); }}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius:   spacing.radiusXl,
    borderWidth:    1,
    padding:        spacing.md,
    shadowOffset:   { width: 0, height: 12 },
    shadowOpacity:  0.38,       // higher opacity on dark shadow for visible lift
    shadowRadius:   28,
    elevation:      4,
  },
  pressed: { transform: [{ scale: 0.97 }] },
});
