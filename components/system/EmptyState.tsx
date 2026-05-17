import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getColors, type AppColorMode } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
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
  title
}: {
  actionLabel?: string;
  cta?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  message?: string;
  mode?: AppColorMode;
  onAction?: () => void;
  onPress?: () => void;
  subtitle?: string;
  title: string;
}) {
  const haptics = useHaptics();
  const colors = getColors(mode);
  const action = onAction ?? onPress;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.illustration}>
        <BloopOrb size={58} />
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.sage} />
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{subtitle ?? message}</Text>
      {action ? (
        <Pressable
          onPress={() => {
            haptics.selection();
            action();
          }}
          style={({ pressed }) => [styles.cta, { backgroundColor: colors.terracotta }, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>{actionLabel ?? cta}</Text>
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
    borderWidth: 1
  },
  illustration: { width: 96, height: 76, alignItems: "center", justifyContent: "center" },
  iconBadge: {
    position: "absolute",
    right: 8,
    bottom: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.82)"
  },
  title: { ...typography.sectionTitle, marginTop: 10, textAlign: "center" },
  message: { fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 8, textAlign: "center" },
  cta: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18
  },
  ctaText: { color: "#FFFFFF", fontSize: 13, lineHeight: 17, fontWeight: "900" },
  pressed: { transform: [{ scale: 0.97 }] }
});
