import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getColors, type AppColorMode } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useHaptics } from "../../hooks/useHaptics";

type ConsentIcon = keyof typeof MaterialCommunityIcons.glyphMap;

export function PrivacyConsentCard({
  enabled,
  icon,
  mode = "light",
  onToggle,
  required,
  text,
  title
}: {
  enabled: boolean;
  icon: ConsentIcon;
  mode?: AppColorMode;
  onToggle: () => void;
  required?: boolean;
  text: string;
  title: string;
}) {
  const colors = getColors(mode);
  const haptics = useHaptics();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      onPress={() => {
        haptics.selection();
        onToggle();
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: enabled ? colors.sage : colors.border,
          shadowColor: enabled ? colors.sage : colors.navy
        },
        pressed && styles.pressed
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: mode === "dark" ? "rgba(129,178,154,0.16)" : "rgba(129,178,154,0.18)" }]}>
        <MaterialCommunityIcons name={icon} size={23} color={colors.sage} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {required ? <Text style={[styles.required, { color: colors.terracotta }]}>Required</Text> : null}
        </View>
        <Text style={[styles.text, { color: colors.muted }]}>{text}</Text>
      </View>
      <View
        style={[
          styles.toggle,
          {
            backgroundColor: enabled ? colors.terracotta : mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(231,216,201,0.72)"
          }
        ]}
      >
        <View style={[styles.knob, enabled && styles.knobOn]}>
          {enabled ? <Ionicons name="checkmark" size={13} color={colors.terracotta} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 132,
    borderRadius: spacing.radiusXl,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: 7
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8
  },
  title: {
    ...typography.body,
    fontWeight: "900"
  },
  required: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 4,
    justifyContent: "center"
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2B2D42",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2
  },
  knobOn: {
    alignSelf: "flex-end"
  }
});
