import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { F } from "../../constants/fonts";
import { useUserProfile } from "../../hooks/useUserProfile";
import { CachedImage } from "../CachedImage";

const bloop = require("../../public/images/bloop-nav.webp");

const palette = {
  deepCharcoal: "#2B2D42",
  muted: "#6B708D",
  terracotta: "#E07A5F",
  warmShadow: "#D6C3B9"
};

const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  community: "account-heart-outline",
  cycle: "calendar-heart",
  dashboard: "home-heart",
  insights: "chart-timeline-variant",
  nourish: "food-apple-outline",
  profile: "account-circle-outline",
  sleep: "moon-waning-crescent",
  wellness: "heart-plus-outline"
};

// Resolved dynamically per journey — see hooks/useUserProfile.ts
const labelMap: Record<string, string> = {
  community: "Community",
  cycle:     "Cycle",
  dashboard: "Today",
  insights:  "Insights",
  nourish:   "Nourish",
  profile:   "Profile",
  sleep:     "Sleep",
  wellness:  "Care",
};

// Bloop button visible on all tabs except the cycle detail tab
// (to avoid blocking the quick-log bar)
const bloopHiddenTabs: string[] = ["cycle"];

export function FloatingTabBar({ navigation, state }: { navigation: any; state: any }) {
  const router = useRouter();
  const profile = useUserProfile();
  const currentRouteName = state.routes[state.index]?.name;
  const showBloop = !bloopHiddenTabs.includes(currentRouteName);

  // Only render tabs the user's journey calls for, in the order defined by the profile
  const journeyTabs = profile.visibleTabs;

  return (
    <View pointerEvents="box-none" style={styles.navWrap}>
      {showBloop ? <BloopButton onPress={() => router.push("/bloop-chat" as any)} /> : null}
      <View style={styles.navBar}>
        <View style={styles.tabsRow}>
          {journeyTabs
            .map((tabName) => state.routes.find((route: { name: string }) => route.name === tabName))
            .filter(Boolean)
            .map((route: { key: string; name: string }) => {
            const focused = state.routes[state.index]?.name === route.name;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={({ pressed }) => [
                  styles.navButton,
                  focused && styles.navButtonActive,
                  pressed && styles.pressed
                ]}
              >
                <MaterialCommunityIcons
                  name={iconMap[route.name] ?? "circle-outline"}
                  size={22}
                  color={focused ? palette.terracotta : palette.muted}
                />
                <Text numberOfLines={1} style={[styles.navLabel, focused && styles.navLabelActive]}>
                  {labelMap[route.name] ?? route.name}
                </Text>
                {focused ? <View style={styles.navActiveDot} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function BloopButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Chat with Bloop"
      onPress={onPress}
      style={({ pressed }) => [styles.aiButtonShell, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={["rgba(255,248,245,0.96)", "rgba(255,231,214,0.94)", "rgba(237,229,245,0.96)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiButton}
      >
        <View style={styles.aiImageWrap}>
          <CachedImage priority="high" source={bloop} style={styles.aiButtonImage} />
          <View style={styles.chatOnlineDot} />
        </View>
        <View style={styles.aiTextWrap}>
          <View style={styles.chatLabelRow}>
            <MaterialCommunityIcons name="message-text-outline" size={13} color={palette.terracotta} />
            <Text style={styles.aiButtonTitle}>Bloop</Text>
          </View>
          <Text style={styles.aiButtonSub}>Chat</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navWrap: {
    bottom: 20,
    left: 18,
    position: "absolute",
    right: 18,
    zIndex: 40
  },
  navBar: {
    alignItems: "center",
    backgroundColor: "rgba(255,253,252,0.96)",
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 30,
    borderWidth: 1,
    elevation: 6,
    flexDirection: "row",
    height: 68,
    justifyContent: "center",
    paddingHorizontal: 8,
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22,
    shadowRadius: 22
  },
  tabsRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4
  },
  navButton: {
    alignItems: "center",
    borderRadius: 22,
    flex: 1,
    gap: 3,
    height: 52,
    justifyContent: "center",
    minWidth: 44
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
  navActiveDot: {
    backgroundColor: palette.terracotta,
    borderRadius: 2,
    bottom: 4,
    height: 4,
    position: "absolute",
    width: 4
  },
  navLabel: {
    color: palette.muted,
    fontFamily: F.uiBold,
    fontSize: 9.5,
    lineHeight: 12
  },
  navLabelActive: {
    color: palette.terracotta
  },
  aiButtonShell: {
    alignItems: "center",
    borderRadius: 28,
    bottom: 82,
    elevation: 10,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 4,
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    width: 118,
    zIndex: 5
  },
  aiButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.86)",
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    flex: 1,
    gap: 8,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 9,
    width: "100%"
  },
  aiImageWrap: {
    alignItems: "center",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    overflow: "hidden",
    width: 34
  },
  aiButtonImage: {
    height: 32,
    width: 32
  },
  chatOnlineDot: {
    position: "absolute",
    right: 1,
    top: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#81B29A",
    borderWidth: 1,
    borderColor: "#FFFFFF"
  },
  aiTextWrap: {
    flex: 1,
    minWidth: 0
  },
  chatLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3
  },
  aiButtonTitle: {
    color: palette.deepCharcoal,
    fontFamily: F.uiBlack,
    fontSize: 12,
    lineHeight: 14
  },
  aiButtonSub: {
    color: palette.muted,
    fontFamily: F.uiBold,
    fontSize: 10,
    lineHeight: 12
  },
  pressed: {
    transform: [{ scale: 0.96 }]
  }
});
