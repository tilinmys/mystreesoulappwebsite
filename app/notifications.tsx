import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuraBackground } from "../components/system/AuraBackground";
import { EmptyState } from "../components/system/EmptyState";
import { GlassCard } from "../components/system/GlassCard";
import { NotificationCard, type GentleNotification } from "../components/system/NotificationCard";
import { OfflineBanner, OfflineSyncCard } from "../components/system/OfflineBanner";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useColorMode } from "../hooks/useColorMode";
import { useHaptics } from "../hooks/useHaptics";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { useSafeBack } from "../hooks/useSafeBack";

const notificationGroups: Array<{ title: string; data: GentleNotification[] }> = [
  {
    title: "Today",
    data: [
      {
        category: "hydration",
        id: "hydration-today",
        message: "Your body may need extra water today.",
        time: "9:20 AM",
        title: "Hydration support",
        unread: true
      },
      {
        category: "mood",
        id: "mood-today",
        message: "A gentle check-in can help Bloop understand your rhythm.",
        time: "12:10 PM",
        title: "Mood check-in",
        unread: true
      },
      {
        category: "bloop",
        id: "bloop-today",
        message: "Bloop noticed your sleep recovery improved last night.",
        time: "2:45 PM",
        title: "Bloop message"
      }
    ]
  },
  {
    title: "This Week",
    data: [
      {
        category: "cycle",
        id: "cycle-week",
        message: "Your next cycle may begin in about 6 days.",
        time: "Yesterday",
        title: "Cycle prediction"
      },
      {
        category: "nutrition",
        id: "nutrition-week",
        message: "Iron-rich meals may support your energy this week.",
        time: "Tue",
        title: "Nutrition insight"
      },
      {
        category: "yoga",
        id: "yoga-week",
        message: "A slow flow is ready whenever your body wants softness.",
        time: "Mon",
        title: "Yoga reminder"
      }
    ]
  },
  {
    title: "Earlier",
    data: [
      {
        category: "sleep",
        id: "sleep-earlier",
        message: "Your body may benefit from a softer evening routine.",
        time: "Apr 29",
        title: "Sleep recovery"
      }
    ]
  }
];

export default function NotificationsCenterScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { colors, mode } = useColorMode();
  const haptics = useHaptics();
  const { isOffline, queuedLogs } = useOfflineStatus();
  const [quietMode, setQuietMode] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set<string>());

  const groups = useMemo(
    () =>
      notificationGroups.map((group) => ({
        ...group,
        data: group.data.map((item) => ({ ...item, unread: item.unread && !readIds.has(item.id) }))
      })),
    [readIds]
  );
  const hasNotifications = groups.some((group) => group.data.length > 0);

  const markAllRead = () => {
    haptics.success();
    setReadIds(new Set(notificationGroups.flatMap((group) => group.data.map((item) => item.id))));
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <AuraBackground variant="bloop" />
      <OfflineBanner visible={isOffline} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={safeBack}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: colors.text }]}>Gentle Reminders</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Wellness nudges from your body and Bloop.</Text>
          </View>
          <Pressable
            accessibilityLabel="Notification preferences"
            hitSlop={10}
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}
          >
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        {isOffline ? <OfflineSyncCard queuedLogs={queuedLogs} /> : null}

        <GlassCard mode={mode} style={styles.controls}>
          <View style={styles.controlCopy}>
            <Text style={[styles.controlTitle, { color: colors.text }]}>Quiet mode</Text>
            <Text style={[styles.controlSub, { color: colors.muted }]}>Pause nudges and keep logging gently.</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: quietMode }}
            onPress={() => {
              haptics.selection();
              setQuietMode((value) => !value);
            }}
            style={[styles.toggle, { backgroundColor: quietMode ? colors.sage : mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(231,216,201,0.70)" }]}
          >
            <View style={[styles.knob, quietMode && styles.knobOn]} />
          </Pressable>
        </GlassCard>

        <View style={styles.actionRow}>
          <Pressable onPress={markAllRead} style={({ pressed }) => [styles.actionPill, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
            <MaterialCommunityIcons name="check-all" size={18} color={colors.terracotta} />
            <Text style={[styles.actionText, { color: colors.terracotta }]}>Mark all as read</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [styles.actionPill, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
            <Ionicons name="settings-outline" size={17} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.muted }]}>Preferences</Text>
          </Pressable>
        </View>

        {hasNotifications ? (
          groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text style={[styles.groupTitle, { color: colors.muted }]}>{group.title}</Text>
              <View style={styles.groupCards}>
                {group.data.map((item) => (
                  <NotificationCard item={item} key={item.id} mode={mode} onPress={() => setReadIds((current) => new Set(current).add(item.id))} />
                ))}
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            actionLabel="Back to MyStree Soul"
            mode={mode}
            onAction={safeBack}
            subtitle="Bloop will gently check in when it matters."
            title="No reminders yet."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    paddingHorizontal: spacing.side,
    paddingTop: 16,
    paddingBottom: 34,
    gap: spacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 3
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    ...typography.screenTitle,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  controls: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  controlCopy: {
    flex: 1,
    gap: 4
  },
  controlTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900"
  },
  controlSub: {
    fontSize: 12,
    lineHeight: 17,
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
    backgroundColor: "#FFFFFF"
  },
  knobOn: {
    alignSelf: "flex-end"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  actionPill: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  group: {
    gap: 10
  },
  groupTitle: {
    ...typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 4
  },
  groupCards: {
    gap: 12
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  }
});
