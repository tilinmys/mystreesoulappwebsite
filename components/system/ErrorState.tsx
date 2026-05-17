import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getColors, type AppColorMode } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useHaptics } from "../../hooks/useHaptics";

export function ErrorState({ mode = "light", onBack, onRetry }: { mode?: AppColorMode; onBack?: () => void; onRetry?: () => void }) {
  const haptics = useHaptics();
  const colors = getColors(mode);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.icon}>
        <MaterialCommunityIcons name="heart-broken-outline" size={24} color={colors.coral} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Something didn't load gently.</Text>
      <Text style={[styles.copy, { color: colors.muted }]}>Let's try again.</Text>
      <View style={styles.actions}>
        {onRetry ? (
          <Pressable
            onPress={() => {
              haptics.error();
              onRetry();
            }}
            style={({ pressed }) => [styles.primary, { backgroundColor: colors.coral }, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Retry</Text>
          </Pressable>
        ) : null}
        {onBack ? (
          <Pressable onPress={onBack} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={16} color={colors.text} />
            <Text style={[styles.secondaryText, { color: colors.text }]}>Go back</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: spacing.radiusXXl, padding: spacing.lg, borderWidth: 1 },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(217,122,114,0.12)" },
  title: { ...typography.sectionTitle, marginTop: 14 },
  copy: { fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 6 },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  primary: { minHeight: 44, borderRadius: 22, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#FFFFFF", fontSize: 13, lineHeight: 17, fontWeight: "900" },
  secondary: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.62)"
  },
  secondaryText: { fontSize: 13, lineHeight: 17, fontWeight: "900" },
  pressed: { transform: [{ scale: 0.97 }] }
});
