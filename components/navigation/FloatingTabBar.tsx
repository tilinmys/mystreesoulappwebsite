/**
 * FloatingTabBar — Midnight Plum  v3
 *
 * Token mapping
 * ─────────────
 *  Nav pill surface (dark)  →  colors.surface    (#2E2330 Blackberry Smoke)
 *  Active icon / label      →  per-tab accent    (primaryCTA or warning — never old brand hex)
 *  Inactive icon / label    →  colors.textMuted  (#B58AC8 Lavender Dust)
 *  Active indicator         →  single underline dot only (no competing background bubbles)
 *  More-sheet surface       →  colors.surface (dark) / near-white (light)
 *
 * Visual normalization (v3)
 * ──────────────────────────
 *  - Outline icon variants for lighter visual weight
 *  - Single active indicator: accent dot underline only
 *  - Bloop orb reduced from 58→52px, shadow softened
 *  - Removed floating chat badge from Bloop button
 *  - navLabel always uiBold (color signals state, not weight)
 *
 * Mascot constraint (Bloop button)
 * ──────────────────────────────────
 *  The Bloop image is NEVER tinted, filtered, or overlaid.
 *  Only the LinearGradient behind it is theme-adjusted.
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebSafeModal } from "../WebSafeModal";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { useUserProfile } from "../../hooks/useUserProfile";
import { CachedImage } from "../CachedImage";

const bloop = require("../../public/images/bloop-nav.webp");

// ── Nav surface constants (rgba forms of darkColors tokens, safe in StyleSheet) ──
// surface    #2E2330 = rgb(46,35,48)
// surfaceRaised #4A394D = rgb(74,57,77)
// background #110812 = rgb(17,8,18)
const NAV_SURFACE_DARK        = "rgba(46,35,48,0.97)";    // colors.surface
// const NAV_ACTIVE_BUBBLE_ALPHA = "20"; // v3: removed — active bubble backgrounds eliminated
const NAV_SCRIM_DARK          = "rgba(22,17,28,0.72)";     // deeper scrim on dark bg
const NAV_SCRIM_LIGHT         = "rgba(34,24,34,0.28)";

// ── Per-tab accent color map ─────────────────────────────────────────────────
// Dark accents must be either primaryCTA (#E8A6B6) or warning (#D8B07C) per Phase 2 directive.
// Light accents keep the original expressive per-tab colors.
const BLOOM_PINK   = "#E8A6B6"; // darkColors.primaryCTA
const GOLDEN_SAND  = "#D8B07C"; // darkColors.warning

const TAB_CONFIG: Record<string, {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  accentLight: string;
  accentDark:  string;
}> = {
  // Outline variants used throughout for calmer visual weight
  dashboard: { icon: "home-variant-outline",           label: "Today",    accentLight: "#E07A5F", accentDark: BLOOM_PINK   },
  cycle:     { icon: "water-outline",                  label: "Cycle",    accentLight: "#D04870", accentDark: BLOOM_PINK   },
  insights:  { icon: "chart-bell-curve-cumulative",    label: "Insights", accentLight: "#7B4DB8", accentDark: BLOOM_PINK   },
  wellness:  { icon: "spa-outline",                    label: "Wellness", accentLight: "#2E8B50", accentDark: BLOOM_PINK   },
  nourish:   { icon: "food-apple-outline",             label: "Nourish",  accentLight: "#C97010", accentDark: GOLDEN_SAND  },
  sleep:     { icon: "moon-waning-crescent",           label: "Sleep",    accentLight: "#3654B8", accentDark: GOLDEN_SAND  },
  profile:   { icon: "account-circle-outline",         label: "Profile",  accentLight: "#9277C8", accentDark: BLOOM_PINK   },
  more:      { icon: "dots-grid",                      label: "More",     accentLight: "#81B29A", accentDark: BLOOM_PINK   },
};

const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = Object.fromEntries(
  Object.entries(TAB_CONFIG).map(([k, v]) => [k, v.icon])
);
const labelMap: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_CONFIG).map(([k, v]) => [k, v.label])
);

// ─────────────────────────────────────────────────────────────────────────────
export function FloatingTabBar({ navigation, state }: { navigation: any; state: any }) {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { colors, isDark } = useColorMode();
  const profile  = useUserProfile();
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleRoutes = profile.visibleTabs
    .map((tabName) => state.routes.find((r: { name: string }) => r.name === tabName))
    .filter(Boolean) as { key: string; name: string }[];

  const { primaryRoutes, overflowRoutes } = useMemo(() => {
    if (visibleRoutes.length <= 4) {
      return { primaryRoutes: visibleRoutes, overflowRoutes: [] as { key: string; name: string }[] };
    }
    const byName    = new Map(visibleRoutes.map((r) => [r.name, r]));
    const mainName  = ["cycle","wellness","nourish","sleep","insights"].find((n) => byName.has(n));
    const primNames = ["dashboard", mainName, "more", "profile"].filter(Boolean) as string[];
    const primary   = primNames.map((n) => n === "more" ? { key: "more", name: "more" } : byName.get(n)).filter(Boolean) as { key: string; name: string }[];
    const overflow  = visibleRoutes.filter((r) => !primNames.includes(r.name));
    return { primaryRoutes: primary, overflowRoutes: overflow };
  }, [visibleRoutes]);

  const midpoint   = Math.ceil(primaryRoutes.length / 2);
  const firstHalf  = primaryRoutes.slice(0, midpoint);
  const secondHalf = primaryRoutes.slice(midpoint);

  const renderTab = (route: { key: string; name: string }) => {
    const focused    = state.routes[state.index]?.name === route.name;
    const isMore     = route.name === "more";
    const moreActive = overflowRoutes.some((r) => state.routes[state.index]?.name === r.name);
    const selected   = focused || (isMore && moreActive);
    const cfg        = TAB_CONFIG[route.name];

    // Active accent: from design-system-only values; inactive: textMuted
    const accent    = isDark ? (cfg?.accentDark ?? BLOOM_PINK) : (cfg?.accentLight ?? "#E07A5F");
    const iconColor = selected
      ? accent
      : isDark
        ? colors.textMuted               // Lavender Dust — satisfies ≥ 4.5:1 on nav surface
        : "rgba(107,112,141,0.58)";

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={selected ? { selected: true } : {}}
        key={route.key}
        onPress={() => { isMore ? setMoreOpen(true) : navigation.navigate(route.name); }}
        style={({ pressed }) => [
          styles.navButton,
          // v3: no competing button-level bg/border/shadow on active state.
          // Active state is communicated by icon/label color + underline dot only.
          pressed && styles.pressed,
        ]}
      >
        {/* Icon — no tinted bubble fill, icon color alone signals active */}
        <View style={styles.iconBubble}>
          <MaterialCommunityIcons
            name={iconMap[route.name] ?? "circle-outline"}
            size={20}
            color={iconColor}
          />
        </View>

        {/* Label — uiBold always; accent color signals active state */}
        <Text
          numberOfLines={1}
          style={[
            styles.navLabel,
            { color: selected ? accent : isDark ? colors.textMuted : "rgba(107,112,141,0.58)" },
          ]}
        >
          {labelMap[route.name] ?? route.name}
        </Text>

        {/* Single active indicator: slim underline dot */}
        {selected && <View style={[styles.navActiveDot, { backgroundColor: accent }]} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.navWrap, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 10) }]}>
      {/* Nav pill — distinctly lifts off the background */}
      <View style={[
        styles.navBar,
        {
          backgroundColor: isDark ? NAV_SURFACE_DARK : "rgba(255,253,252,0.96)",
          borderColor:     isDark ? colors.border    : "rgba(255,255,255,0.88)",
          shadowColor:     isDark ? colors.background : "#D6C3B9",
        },
      ]}>
        <View style={styles.tabsRow}>
          <View style={styles.tabSide}>{firstHalf.map(renderTab)}</View>
          <View style={styles.bloopCenter}>
            <BloopButton isDark={isDark} colors={colors} onPress={() => router.push("/bloop-chat" as any)} />
          </View>
          <View style={styles.tabSide}>{secondHalf.map(renderTab)}</View>
        </View>
      </View>

      {/* Overflow "More" sheet */}
      <WebSafeModal transparent={true} statusBarTranslucent={true} visible={moreOpen} animationType="fade" onRequestClose={() => setMoreOpen(false)}>
        <View style={styles.modalShell}>
        <Pressable style={[styles.moreScrim, { backgroundColor: isDark ? NAV_SCRIM_DARK : NAV_SCRIM_LIGHT }]} onPress={() => setMoreOpen(false)}>
          <View style={[
            styles.moreSheet,
            {
              backgroundColor: isDark ? colors.surface       : "rgba(255,253,252,0.98)",
              borderColor:     isDark ? colors.border        : "rgba(255,255,255,0.88)",
              shadowColor:     isDark ? colors.background    : "#9B7B70",
            },
          ]}>
            <Text style={[styles.moreTitle, { color: colors.textPrimary }]}>More from MyStree</Text>
            <View style={styles.moreGrid}>
              {overflowRoutes.map((route) => {
                const cfg    = TAB_CONFIG[route.name];
                const accent = isDark ? (cfg?.accentDark ?? BLOOM_PINK) : (cfg?.accentLight ?? "#E07A5F");
                return (
                  <Pressable
                    key={route.key}
                    style={({ pressed }) => [
                      styles.moreItem,
                      {
                        backgroundColor: isDark ? colors.surfaceRaised + "60" : "rgba(255,250,247,0.92)",
                        borderColor:     isDark ? colors.border               : `${accent}18`,
                      },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => { setMoreOpen(false); navigation.navigate(route.name); }}
                  >
                    <View style={[styles.moreIcon, { backgroundColor: `${accent}22` }]}>
                      <MaterialCommunityIcons name={iconMap[route.name] ?? "circle-outline"} size={22} color={accent} />
                    </View>
                    <Text style={[styles.moreLabel, { color: colors.textPrimary }]}>
                      {labelMap[route.name] ?? route.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
        </View>
      </WebSafeModal>
    </View>
  );
}

// ── BloopButton — mascot image is NEVER tinted ───────────────────────────────
function BloopButton({ isDark, colors, onPress }: {
  isDark:  boolean;
  colors:  ReturnType<typeof useColorMode>["colors"];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Chat with Bloop"
      onPress={onPress}
      style={({ pressed }) => [styles.aiButtonShell, { shadowColor: isDark ? colors.background : "#D6C3B9" }, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={isDark
          // Dark: plum-toned frame using surface / surfaceRaised / background tokens
          ? ["rgba(46,35,48,0.98)", "rgba(74,57,77,0.96)", "rgba(17,8,18,0.98)"]
          // Light: warm cream frame — keeps Bloop in her natural habitat
          : ["rgba(255,248,245,0.98)", "rgba(255,231,214,0.96)", "rgba(232,241,231,0.98)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiButton}
      >
        <View style={styles.aiImageWrap}>
          {/* ⚠️  Image only — no tintColor, no overlays, no filters */}
          <CachedImage priority="high" source={bloop} style={styles.aiButtonImage} />
          {/* Online indicator — uses fertileColor semantic token */}
          <View style={[
            styles.chatOnlineDot,
            {
              backgroundColor: colors.fertileColor,
              borderColor:     isDark ? colors.surface : "#FFFFFF",
            },
          ]} />
        </View>
        {/* v3: floating chat badge removed — reduces clutter without removing Bloop button */}
      </LinearGradient>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Nav wrapper (transparent strip below the pill) ──────────────────────────
  navWrap: {
    paddingHorizontal: 18,
    paddingTop: 6,
    zIndex: 40,
    // Pin to bottom on web — expo-router places the custom tabBar above
    // screen content in the flex layout without this.
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  // ── Nav pill ─────────────────────────────────────────────────────────────────
  // Color-sensitive props (bg, border, shadow) are applied inline using tokens.
  navBar: {
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    elevation: 6,
    flexDirection: "row",
    height: 68,             // v3: slimmed from 72 for calmer proportion
    justifyContent: "center",
    paddingHorizontal: 10,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },

  // ── Tab layout ───────────────────────────────────────────────────────────────
  tabsRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  tabSide: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    minWidth: 0,
  },
  bloopCenter: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
  },

  // ── Tab button ───────────────────────────────────────────────────────────────
  navButton: {
    alignItems: "center",
    borderRadius: 20,
    flex: 1,
    gap: 2,
    height: 56,
    justifyContent: "center",
    minWidth: 0,
  },
  navActiveDot: {
    borderRadius: 2,
    bottom: 3,
    height: 4,
    position: "absolute",
    width: 14,
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
    fontFamily: F.uiBold,   // v3: always uiBold — color signals active, not weight
    fontSize: 9,
    lineHeight: 11,
  },

  // ── Bloop center button — v3: reduced from 58→52px, shadow softened ─────────
  aiButtonShell: {
    alignItems: "center",
    borderRadius: 30,
    elevation: 8,           // v3: reduced from 14
    height: 52,             // v3: reduced from 58
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,    // v3: reduced from 0.32
    shadowRadius: 16,       // v3: reduced from 22
    width: 52,              // v3: reduced from 58
    zIndex: 5,
  },
  aiButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.70)",
    borderRadius: 30,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  aiImageWrap: {
    alignItems: "center",
    borderRadius: 20,
    height: 38,             // v3: proportionally reduced
    justifyContent: "center",
    overflow: "hidden",
    width: 38,              // v3: proportionally reduced
  },
  aiButtonImage: {
    height: 36,             // v3: proportionally reduced from 40
    width: 36,              // v3: proportionally reduced from 40
  },
  chatOnlineDot: {
    borderRadius: 3,
    borderWidth: 1.5,
    bottom: 1,
    height: 7,
    position: "absolute",
    right: 1,
    width: 7,
  },
  // aiChatMark removed in v3 — floating badge created visual clutter

  // ── More sheet ────────────────────────────────────────────────────────────────
  modalShell: {
    flex: 1,
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
  },
  moreScrim: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
  },
  moreSheet: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    // Web: keep inside 390px shell
    maxWidth: 390,
    alignSelf: "center",
    width: "100%",
  },
  moreTitle: {
    fontFamily: F.uiBold,   // v3: reduced from uiBlack for calmer header weight
    fontSize: 14,
    marginBottom: 14,
  },
  moreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  moreItem: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    gap: 8,
    minHeight: 88,
    padding: 12,
  },
  moreIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  moreLabel: {
    fontFamily: F.uiBold,
    fontSize: 11,
    textAlign: "center",
  },

  // ── Shared ────────────────────────────────────────────────────────────────────
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
