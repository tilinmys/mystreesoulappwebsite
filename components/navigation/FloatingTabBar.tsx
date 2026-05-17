import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { CachedImage } from "../CachedImage";

const bloop = require("../../public/images/bloop-nav.webp");

const palette = {
  deepCharcoal: "#2B2D42",
  muted: "#6B708D",
  terracotta: "#E07A5F"
};

const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  cycle: "calendar-heart",
  dashboard: "home-variant",
  insights: "chart-donut",
  nourish: "food-apple-outline",
  profile: "account-outline",
  wellness: "spa-outline"
};

export function FloatingTabBar({ navigation, state }: { navigation: any; state: any }) {
  const router = useRouter();

  return (
    <View pointerEvents="box-none" style={styles.navWrap}>
      <BloopButton onPress={() => router.push("/bloop")} />
      <View style={styles.navBar}>
        <View style={styles.tabsRow}>
          {state.routes.map((route: { key: string; name: string }, index: number) => {
            const focused = state.index === index;
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
      accessibilityLabel="Open Bloop chat"
      onPress={onPress}
      style={({ pressed }) => [styles.aiButtonShell, pressed && styles.pressed]}
    >
      <View style={styles.aiGlow} />
      <LinearGradient
        colors={["#FFF8F5", "#FFE7D6", "#E8F1E7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiButton}
      >
        <CachedImage priority="high" source={bloop} style={styles.aiButtonImage} />
        <View style={styles.chatOnlineDot} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navWrap: {
    bottom: 24,
    left: 24,
    position: "absolute",
    right: 24,
    zIndex: 40
  },
  navBar: {
    alignItems: "center",
    backgroundColor: "rgba(250,249,246,0.86)",
    borderColor: "rgba(255,255,255,0.86)",
    borderRadius: 34,
    borderWidth: 1,
    elevation: 7,
    flexDirection: "row",
    height: 68,
    justifyContent: "center",
    paddingHorizontal: 8,
    shadowColor: palette.deepCharcoal,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 30
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
    borderRadius: 24,
    flex: 1,
    height: 48,
    justifyContent: "center",
    minWidth: 44
  },
  navButtonActive: {
    backgroundColor: "rgba(255,255,255,0.88)",
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
    bottom: 5,
    height: 4,
    position: "absolute",
    width: 4
  },
  aiButtonShell: {
    alignItems: "center",
    borderRadius: 35,
    bottom: 84,
    elevation: 10,
    height: 70,
    justifyContent: "center",
    position: "absolute",
    right: 2,
    shadowColor: palette.terracotta,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    width: 70,
    zIndex: 5
  },
  aiGlow: {
    position: "absolute",
    width: 72,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(224,122,95,0.18)",
    transform: [{ translateY: 7 }]
  },
  aiButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 31,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    overflow: "hidden",
    width: 62
  },
  aiButtonImage: {
    height: 48,
    width: 48
  },
  chatOnlineDot: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#81B29A",
    borderWidth: 1,
    borderColor: "#FFFFFF"
  },
  pressed: {
    transform: [{ scale: 0.96 }]
  }
});
