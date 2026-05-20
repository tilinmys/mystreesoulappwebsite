import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { useUserProfile } from "../../hooks/useUserProfile";
import { CachedImage } from "../CachedImage";

const bloop = require("../../public/images/bloop-nav.webp");

const palette = {
  deepCharcoal: "#2B2D42",
  muted: "#6B708D",
  terracotta: "#E07A5F",
  peach: "#F4A261",
  sage: "#81B29A",
  lavender: "#BDB2FF",
  rose: "#D7A6A1",
  gold: "#C9A040",
  warmShadow: "#D6C3B9"
};

// Tab config: each route gets a distinct accent + icon so the bar is colorful
// even before a tab is selected.
const TAB_CONFIG: Record<string, {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  accentLight: string;
  accentDark: string;
}> = {
  dashboard: {
    icon: "home-variant",
    label: "Today",
    accentLight: "#E07A5F",
    accentDark: "#F08A70",
  },
  cycle: {
    icon: "water",
    label: "Cycle",
    accentLight: "#D04870",
    accentDark: "#E86090",
  },
  insights: {
    icon: "chart-bell-curve-cumulative",
    label: "Insights",
    accentLight: "#7B4DB8",
    accentDark: "#A880E0",
  },
  wellness: {
    icon: "spa",
    label: "Wellness",
    accentLight: "#2E8B50",
    accentDark: "#4EB870",
  },
  nourish: {
    icon: "food-apple",
    label: "Nourish",
    accentLight: "#C97010",
    accentDark: "#F09030",
  },
  sleep: {
    icon: "moon-waning-crescent",
    label: "Sleep",
    accentLight: "#3654B8",
    accentDark: "#6878E0",
  },
  profile: {
    icon: "account-circle",
    label: "Profile",
    accentLight: "#9277C8",
    accentDark: "#B09AE0",
  },
  more: {
    icon: "dots-grid",
    label: "More",
    accentLight: "#81B29A",
    accentDark: "#8EC4A8",
  },
};

// Derived maps for icon name and label lookups
const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = Object.fromEntries(
  Object.entries(TAB_CONFIG).map(([k, v]) => [k, v.icon])
);

const labelMap: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_CONFIG).map(([k, v]) => [k, v.label])
);

export function FloatingTabBar({ navigation, state }: { navigation: any; state: any }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useColorMode();
  const profile = useUserProfile();
  const [moreOpen, setMoreOpen] = useState(false);

  // Only render tabs the user's journey calls for, in the order defined by the profile
  const visibleRoutes = profile.visibleTabs
    .map((tabName) => state.routes.find((route: { name: string }) => route.name === tabName))
    .filter(Boolean) as { key: string; name: string }[];

  const { primaryRoutes, overflowRoutes } = useMemo(() => {
    if (visibleRoutes.length <= 4) {
      return { primaryRoutes: visibleRoutes, overflowRoutes: [] as { key: string; name: string }[] };
    }

    const byName = new Map(visibleRoutes.map((route) => [route.name, route]));
    const mainName = ["cycle", "wellness", "nourish", "sleep", "insights"]
      .find((name) => byName.has(name));
    const primaryNames = ["dashboard", mainName, "more", "profile"].filter(Boolean) as string[];
    const primary = primaryNames.map((name) => {
      if (name === "more") return { key: "more", name: "more" };
      return byName.get(name);
    }).filter(Boolean) as { key: string; name: string }[];
    const overflow = visibleRoutes.filter((route) => !primaryNames.includes(route.name));

    return { primaryRoutes: primary, overflowRoutes: overflow };
  }, [visibleRoutes]);

  const midpoint = Math.ceil(primaryRoutes.length / 2);
  const firstHalf = primaryRoutes.slice(0, midpoint);
  const secondHalf = primaryRoutes.slice(midpoint);

  const renderTab = (route: { key: string; name: string }) => {
    const focused = state.routes[state.index]?.name === route.name;
    const isMore = route.name === "more";
    const moreActive = overflowRoutes.some((item) => state.routes[state.index]?.name === item.name);
    const selected = focused || (isMore && moreActive);
    const cfg = TAB_CONFIG[route.name];
    const accent = isDark ? (cfg?.accentDark ?? palette.terracotta) : (cfg?.accentLight ?? palette.terracotta);
    // Inactive icons are muted so the selected tab's color really stands out
    const iconColor = selected
      ? accent
      : isDark
      ? "rgba(196,186,214,0.55)"
      : "rgba(107,112,141,0.50)";
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={selected ? { selected: true } : {}}
        key={route.key}
        onPress={() => {
          if (isMore) {
            setMoreOpen(true);
            return;
          }
          navigation.navigate(route.name);
        }}
        style={({ pressed }) => [
          styles.navButton,
          selected && styles.navButtonActive,
          selected && isDark && styles.navButtonActiveDark,
          pressed && styles.pressed
        ]}
      >
        <View
          style={[
            styles.iconBubble,
            selected && { backgroundColor: `${accent}22`, borderRadius: 14 },
          ]}
        >
          <MaterialCommunityIcons
            name={iconMap[route.name] ?? "circle-outline"}
            size={22}
            color={iconColor}
          />
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.navLabel,
            isDark && styles.navLabelDark,
            selected && { color: accent, fontFamily: "Inter_800ExtraBold" },
          ]}
        >
          {labelMap[route.name] ?? route.name}
        </Text>
        {selected ? <View style={[styles.navActiveDot, { backgroundColor: accent }]} /> : null}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.navWrap,
        {
          // Transparent so the pill truly floats — no white/cream band
          // visible above or below the bar on any screen.
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <View style={[styles.navBar, isDark && styles.navBarDark]}>
        <View style={styles.tabsRow}>
          <View style={styles.tabSide}>{firstHalf.map(renderTab)}</View>
          <View style={styles.bloopCenter}>
            <BloopButton isDark={isDark} onPress={() => router.push("/bloop-chat" as any)} />
          </View>
          <View style={styles.tabSide}>{secondHalf.map(renderTab)}</View>
        </View>
      </View>
      <Modal transparent visible={moreOpen} animationType="fade" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.moreScrim} onPress={() => setMoreOpen(false)}>
          <View style={[styles.moreSheet, isDark && styles.moreSheetDark]}>
            <Text style={[styles.moreTitle, isDark && styles.moreTitleDark]}>More from MyStree</Text>
            <View style={styles.moreGrid}>
              {overflowRoutes.map((route) => {
                const cfg = TAB_CONFIG[route.name];
                const accent = isDark ? (cfg?.accentDark ?? palette.terracotta) : (cfg?.accentLight ?? palette.terracotta);
                return (
                  <Pressable
                    key={route.key}
                    style={({ pressed }) => [styles.moreItem, isDark && styles.moreItemDark, pressed && styles.pressed]}
                    onPress={() => {
                      setMoreOpen(false);
                      navigation.navigate(route.name);
                    }}
                  >
                    <View style={[styles.moreIcon, { backgroundColor: `${accent}22` }]}>
                      <MaterialCommunityIcons name={iconMap[route.name] ?? "circle-outline"} size={22} color={accent} />
                    </View>
                    <Text style={[styles.moreLabel, isDark && styles.moreLabelDark]}>{labelMap[route.name] ?? route.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function BloopButton({ isDark, onPress }: { isDark: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Chat with Bloop"
      onPress={onPress}
      style={({ pressed }) => [styles.aiButtonShell, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={
          isDark
            ? ["rgba(55,43,62,0.98)", "rgba(93,57,52,0.96)", "rgba(40,62,52,0.98)"]
            : ["rgba(255,248,245,0.98)", "rgba(255,231,214,0.96)", "rgba(232,241,231,0.98)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiButton}
      >
        <View style={styles.aiImageWrap}>
          <CachedImage priority="high" source={bloop} style={styles.aiButtonImage} />
          <View style={styles.chatOnlineDot} />
        </View>
        <View style={styles.aiChatMark}>
          <MaterialCommunityIcons name="message-text-outline" size={12} color={palette.terracotta} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navWrap: {
    paddingHorizontal: 18,
    paddingTop: 6,
    zIndex: 40,
  },
  navBar: {
    alignItems: "center",
    backgroundColor: "rgba(255,253,252,0.96)",
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 30,
    borderWidth: 1,
    elevation: 6,
    flexDirection: "row",
    height: 72,
    justifyContent: "center",
    marginBottom: 0,
    paddingHorizontal: 10,
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22,
    shadowRadius: 22
  },
  navBarDark: {
    backgroundColor: "rgba(27,24,34,0.96)",
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000000",
  },
  tabsRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6
  },
  tabSide: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    minWidth: 0
  },
  bloopCenter: {
    alignItems: "center",
    justifyContent: "center",
    width: 64
  },
  navButton: {
    alignItems: "center",
    borderRadius: 20,
    flex: 1,
    gap: 2,
    height: 56,
    justifyContent: "center",
    minWidth: 0
  },
  navButtonActive: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderColor: "rgba(224,122,95,0.20)",
    borderWidth: 1,
    shadowColor: palette.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12
  },
  navButtonActiveDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(224,122,95,0.32)",
  },
  navActiveDot: {
    borderRadius: 2,
    bottom: 3,
    height: 4,
    position: "absolute",
    width: 14
  },
  iconBubble: {
    alignItems: "center",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    overflow: "hidden",
    width: 34,
  },
  navLabel: {
    color: palette.muted,
    fontFamily: F.uiBold,
    fontSize: 9,
    lineHeight: 11
  },
  navLabelDark: {
    color: "#D8D1E5"
  },
  aiButtonShell: {
    alignItems: "center",
    borderRadius: 34,
    elevation: 12,
    height: 58,
    justifyContent: "center",
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    width: 58,
    zIndex: 5
  },
  aiButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.86)",
    borderRadius: 34,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%"
  },
  aiImageWrap: {
    alignItems: "center",
    borderRadius: 23,
    height: 42,
    justifyContent: "center",
    overflow: "hidden",
    width: 42
  },
  aiButtonImage: {
    height: 40,
    width: 40
  },
  chatOnlineDot: {
    position: "absolute",
    right: 2,
    top: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#81B29A",
    borderWidth: 1,
    borderColor: "#FFFFFF"
  },
  aiChatMark: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 9,
    bottom: 6,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    width: 18
  },
  pressed: {
    transform: [{ scale: 0.96 }]
  },
  moreScrim: {
    backgroundColor: "rgba(22,18,28,0.32)",
    flex: 1,
    justifyContent: "flex-end",
    padding: 18
  },
  moreSheet: {
    backgroundColor: "rgba(255,253,252,0.98)",
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#9B7B70",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 26
  },
  moreSheetDark: {
    backgroundColor: "rgba(27,24,34,0.98)",
    borderColor: "rgba(255,255,255,0.12)"
  },
  moreTitle: {
    color: palette.deepCharcoal,
    fontFamily: F.uiBlack,
    fontSize: 15,
    marginBottom: 14
  },
  moreTitleDark: {
    color: "#F8FAFC"
  },
  moreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  moreItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,250,247,0.92)",
    borderColor: "rgba(224,122,95,0.10)",
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    gap: 8,
    minHeight: 88,
    padding: 12
  },
  moreItemDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.10)"
  },
  moreIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  moreLabel: {
    color: palette.deepCharcoal,
    fontFamily: F.uiBold,
    fontSize: 11,
    textAlign: "center"
  },
  moreLabelDark: {
    color: "#F8FAFC"
  }
});
