import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { lightColors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { useNetworkStore } from "../../store/networkStore";

export function OfflineBanner({ visible }: { visible?: boolean }) {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const shouldShow = visible ?? !isOnline;

  if (!shouldShow) return null;

  return (
    <View pointerEvents="none" style={styles.banner}>
      <MaterialCommunityIcons name="cloud-off-outline" size={17} color={lightColors.text} />
      <Text style={styles.bannerText}>You're offline. We'll save your updates and sync later.</Text>
    </View>
  );
}

export function OfflineSyncCard({ onPress, queuedLogs = 3 }: { onPress?: () => void; queuedLogs?: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <MaterialCommunityIcons name="sync-alert" size={22} color={lightColors.sage} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{queuedLogs} wellness logs waiting to sync.</Text>
        <Text style={styles.sub}>Symptom logging still works while offline.</Text>
      </View>
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>View queued logs</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 54,
    left: 18,
    right: 18,
    zIndex: 100,
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,248,245,0.94)",
    borderWidth: 1,
    borderColor: "rgba(231,216,201,0.86)",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  bannerText: {
    color: lightColors.text,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  card: {
    borderRadius: spacing.radiusXl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(231,216,201,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.78)",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.60)",
  },
  copy: { flex: 1 },
  title: { color: lightColors.text, fontSize: 13, lineHeight: 17, fontWeight: "900" },
  sub: { color: lightColors.muted, fontSize: 11, lineHeight: 15, fontWeight: "700", marginTop: 4 },
  cta: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.66)",
  },
  ctaText: { color: lightColors.text, fontSize: 11, lineHeight: 15, fontWeight: "900" },
  pressed: { transform: [{ scale: 0.97 }] },
});
