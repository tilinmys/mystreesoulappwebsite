import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getColors, type AppColorMode } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useHaptics } from "../../hooks/useHaptics";

export type GentleNotification = {
  category: "hydration" | "mood" | "cycle" | "sleep" | "nutrition" | "yoga" | "bloop";
  id: string;
  message: string;
  time: string;
  title: string;
  unread?: boolean;
};

const meta: Record<GentleNotification["category"], { icon: keyof typeof MaterialCommunityIcons.glyphMap; tint: string }> = {
  bloop: { icon: "star-four-points", tint: "#BDB2FF" },
  cycle: { icon: "calendar-heart", tint: "#E07A5F" },
  hydration: { icon: "water-outline", tint: "#81B29A" },
  mood: { icon: "heart-outline", tint: "#D7A6A1" },
  nutrition: { icon: "food-apple-outline", tint: "#F4A261" },
  sleep: { icon: "weather-night", tint: "#BDB2FF" },
  yoga: { icon: "meditation", tint: "#81B29A" }
};

export function NotificationCard({
  item,
  mode = "light",
  onPress
}: {
  item: GentleNotification;
  mode?: AppColorMode;
  onPress?: () => void;
}) {
  const colors = getColors(mode);
  const haptics = useHaptics();
  const itemMeta = meta[item.category];

  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: item.unread ? itemMeta.tint : colors.border,
          shadowColor: item.unread ? itemMeta.tint : colors.navy
        },
        pressed && styles.pressed
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${itemMeta.tint}24` }]}>
        <MaterialCommunityIcons name={itemMeta.icon} size={22} color={itemMeta.tint} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          {item.unread ? <View style={[styles.dot, { backgroundColor: itemMeta.tint }]} /> : null}
        </View>
        <Text style={[styles.message, { color: colors.muted }]}>{item.message}</Text>
        <Text style={[styles.time, { color: colors.muted }]}>{item.time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    borderRadius: spacing.radiusXl,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 3
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  title: {
    ...typography.body,
    fontWeight: "900"
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 4
  },
  time: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    marginTop: 7,
    opacity: 0.72
  }
});
