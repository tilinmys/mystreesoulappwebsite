/**
 * NotificationCard — per-notification list item
 *
 * Token mapping
 * ─────────────
 *  Card bg      →  colors.surface
 *  Border       →  colors.border (default) / category tint (unread)
 *  Shadow       →  colors.background  (not navy — lifts on dark surfaces correctly)
 *  Title        →  colors.textPrimary
 *  Message/time →  colors.textMuted
 *  Chevron      →  colors.textMuted
 *
 *  Category tint colors are informational identifiers, not brand colors —
 *  they are intentionally not mapped to the brand token set.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { type AppColorMode, getColors } from "../../constants/colors";
import { F } from "../../constants/fonts";
import { spacing } from "../../constants/spacing";
import { useHaptics } from "../../hooks/useHaptics";

export type GentleNotification = {
  category: "hydration" | "mood" | "cycle" | "sleep" | "nutrition" | "yoga" | "bloop";
  id:       string;
  message:  string;
  time:     string;
  title:    string;
  unread?:  boolean;
};

// Category tints — these are semantic informational identifiers, not brand colors
const meta: Record<GentleNotification["category"], {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint: string;
}> = {
  bloop:     { icon: "heart-pulse",       tint: "#BDB2FF" },
  cycle:     { icon: "calendar-heart",    tint: "#E8A6B6" },  // primaryCTA Bloom Pink
  hydration: { icon: "water-outline",     tint: "#7EC8A0" },  // fertileColor
  mood:      { icon: "heart-outline",     tint: "#E88090" },  // periodColor
  nutrition: { icon: "food-apple-outline",tint: "#D8B07C" },  // warning Golden Sand
  sleep:     { icon: "weather-night",     tint: "#BDB2FF" },
  yoga:      { icon: "meditation",        tint: "#7EC8A0" },  // fertileColor
};

export function NotificationCard({
  item,
  mode = "light",
  onPress,
}: {
  item:     GentleNotification;
  mode?:    AppColorMode;
  onPress?: () => void;
}) {
  const colors    = getColors(mode);
  const haptics   = useHaptics();
  const itemMeta  = meta[item.category];

  return (
    <Pressable
      onPress={() => { haptics.light(); onPress?.(); }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor:     item.unread ? itemMeta.tint : colors.border,
          // Shadow uses background token — creates correct depth on dark surfaces
          shadowColor:     colors.background,
        },
        pressed && styles.pressed,
      ]}
    >
      {/* Category icon bubble */}
      <View style={[styles.iconWrap, { backgroundColor: `${itemMeta.tint}22` }]}>
        <MaterialCommunityIcons name={itemMeta.icon} size={22} color={itemMeta.tint} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
          {item.unread
            ? <View style={[styles.dot, { backgroundColor: itemMeta.tint }]} />
            : null}
        </View>
        <Text style={[styles.message, { color: colors.textMuted }]}>{item.message}</Text>
        <Text style={[styles.time,    { color: colors.textMuted }]}>{item.time}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight:     92,
    borderRadius:  spacing.radiusXl,
    borderWidth:   1,
    padding:       spacing.md,
    flexDirection: "row",
    alignItems:    "center",
    gap:           12,
    shadowOffset:  { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius:  22,
    elevation:     4,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  copy:      { flex: 1 },
  titleRow:  { flexDirection: "row", alignItems: "center", gap: 7 },
  title: {
    fontFamily: F.ui,
    fontSize:   14,
    lineHeight: 18,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  message: {
    fontFamily: F.body,
    fontSize:   12,
    lineHeight: 18,
    marginTop:  4,
  },
  time: {
    fontFamily: F.ui,
    fontSize:   11,
    lineHeight: 14,
    marginTop:  7,
    opacity:    0.72,
  },
});
