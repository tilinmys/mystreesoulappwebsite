/**
 * EmptyState — zero-data placeholder card
 *
 * Token mapping
 * ─────────────
 *  Card bg        →  colors.surface
 *  Icon badge bg  →  colors.surfaceRaised  (lifted above card, not raw white)
 *  Icon color     →  colors.fertileColor   (sage-green — calm, non-urgent)
 *  Title          →  colors.textPrimary
 *  Message        →  colors.textMuted
 *  CTA bg         →  colors.primaryCTA     (Bloom Pink)
 *  CTA text       →  colors.background     (Midnight Plum — 10.4:1 contrast ✓✓✓)
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { type AppColorMode, getColors } from "../../constants/colors";
import { F, TS } from "../../constants/fonts";
import { spacing } from "../../constants/spacing";
import { useHaptics } from "../../hooks/useHaptics";
import { BloopOrb } from "./BloopOrb";

export function EmptyState({
  actionLabel,
  cta = "Log Today",
  icon = "flower-outline",
  message,
  mode = "light",
  onAction,
  onPress,
  subtitle,
  title,
}: {
  actionLabel?: string;
  cta?:         string;
  icon?:        keyof typeof MaterialCommunityIcons.glyphMap;
  message?:     string;
  mode?:        AppColorMode;
  onAction?:    () => void;
  onPress?:     () => void;
  subtitle?:    string;
  title:        string;
}) {
  const haptics = useHaptics();
  const colors  = getColors(mode);
  const action  = onAction ?? onPress;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.illustration}>
        {/* Bloop mascot — displayed as-is, no tints or overlays */}
        <BloopOrb size={58} />
        {/* Icon badge lifts above the card surface using surfaceRaised */}
        <View style={[styles.iconBadge, { backgroundColor: colors.surfaceRaised }]}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.fertileColor} />
        </View>
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{subtitle ?? message}</Text>

      {action ? (
        <Pressable
          onPress={() => { haptics.selection(); action(); }}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.primaryCTA },
            pressed && styles.pressed,
          ]}
        >
          {/* Dark text on Bloom Pink: Midnight Plum (#221822) → 10.4:1 contrast ✓✓✓ */}
          <Text style={[styles.ctaText, { color: colors.background }]}>
            {actionLabel ?? cta}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: spacing.radiusXXl,
    padding: spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 4,
  },
  illustration: {
    width: 96,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    position: "absolute",
    right: 8,
    bottom: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...TS.sectionTitle,
    marginTop: 10,
    textAlign: "center",
  },
  message: {
    fontFamily: F.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: "center",
  },
  cta: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  ctaText: {
    fontFamily: F.uiLabel,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.6,
  },
  pressed: { transform: [{ scale: 0.97 }] },
});
