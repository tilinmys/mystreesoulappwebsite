import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { F } from "../constants/fonts";
import { useColorMode } from "../hooks/useColorMode";
import { useSafeBack } from "../hooks/useSafeBack";

// ─── Mocked saved programs ────────────────────────────────────────────────────
type SavedProgram = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  progress: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  gradient: [string, string];
};

const PROGRAMS: SavedProgram[] = [
  {
    id: "1",
    title: "Cycle-Synced Movement",
    tag: "Fitness",
    duration: "4 weeks",
    progress: 0.55,
    icon: "run-fast",
    color: "#E07A5F",
    gradient: ["#FFEDE9", "#FFD6CC"],
  },
  {
    id: "2",
    title: "Stress-Free Sleep Ritual",
    tag: "Sleep",
    duration: "2 weeks",
    progress: 0.80,
    icon: "moon-waning-crescent",
    color: "#6E86D8",
    gradient: ["#E8EDFF", "#D4DCF8"],
  },
  {
    id: "3",
    title: "Hormone Balance Nutrition",
    tag: "Nutrition",
    duration: "6 weeks",
    progress: 0.30,
    icon: "food-apple",
    color: "#F4A261",
    gradient: ["#FFF3E8", "#FFE4C8"],
  },
  {
    id: "4",
    title: "Daily Emotional Reset",
    tag: "Wellness",
    duration: "3 weeks",
    progress: 0.68,
    icon: "heart-pulse",
    color: "#81B29A",
    gradient: ["#E8F5EF", "#D4EDE4"],
  },
  {
    id: "5",
    title: "PMS Relief Toolkit",
    tag: "Cycle",
    duration: "Ongoing",
    progress: 0.45,
    icon: "flower-tulip-outline",
    color: "#D04870",
    gradient: ["#FFE8F0", "#FFD4E4"],
  },
];

export default function SavedProgramsScreen() {
  const safeBack = useSafeBack();
  const { isDark, colors } = useColorMode();

  return (
    <SafeAreaView style={[styles.screen, isDark && { backgroundColor: "#1A1028" }]} edges={["top", "bottom"]}>
      {/* Background auras */}
      <View style={[styles.auraOne, isDark && { backgroundColor: "rgba(129,178,154,0.08)" }]} />
      <View style={[styles.auraTwo, isDark && { backgroundColor: "rgba(244,162,97,0.07)" }]} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={safeBack}
          style={({ pressed }) => [styles.iconButton, isDark && styles.iconButtonDark, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Programs</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>Curated for your journey</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Stats strip */}
      <View style={[styles.statsStrip, isDark && styles.statsStripDark]}>
        <StatPill icon="bookmark-multiple-outline" value={`${PROGRAMS.length}`} label="Saved" color="#E07A5F" isDark={isDark} />
        <View style={styles.statDivider} />
        <StatPill icon="play-circle-outline" value="2" label="Active" color="#81B29A" isDark={isDark} />
        <View style={styles.statDivider} />
        <StatPill icon="check-circle-outline" value="1" label="Completed" color="#BDB2FF" isDark={isDark} />
      </View>

      {/* List */}
      <FlatList
        data={PROGRAMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.programCard,
              isDark && styles.programCardDark,
              pressed && styles.pressed,
            ]}
            onPress={() => {}}
          >
            <LinearGradient
              colors={isDark ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.03)"] : (item.gradient as [string, string])}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Icon bubble */}
              <View style={[styles.programIconWrap, { backgroundColor: `${item.color}22` }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              </View>

              {/* Content */}
              <View style={styles.programBody}>
                <View style={styles.programTopRow}>
                  <View style={[styles.tagPill, { backgroundColor: `${item.color}1A` }]}>
                    <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
                  </View>
                  <Text style={[styles.durationText, { color: colors.muted }]}>{item.duration}</Text>
                </View>
                <Text style={[styles.programTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressWrap}>
                  <View style={[styles.progressTrack, isDark && { backgroundColor: "rgba(255,255,255,0.10)" }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.round(item.progress * 100)}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: item.color }]}>
                    {Math.round(item.progress * 100)}%
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color={colors.hint} />
            </LinearGradient>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function StatPill({
  color,
  icon,
  isDark,
  label,
  value,
}: {
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isDark: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statPill}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color: isDark ? "#F2EFF8" : "#1C1528" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: isDark ? "#C4BAD6" : "#6B708D" }]}>{label}</Text>
    </View>
  );
}

const palette = {
  background: "#FAF9F6",
  warmShadow: "#D6C3B9",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  auraOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(129,178,154,0.10)",
    top: -50,
    left: -70,
  },
  auraTwo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(244,162,97,0.09)",
    bottom: 80,
    right: -60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.70)",
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 2,
  },
  iconButtonDark: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  headerCopy: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 22,
    lineHeight: 28,
  },
  headerSub: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  statsStrip: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.60)",
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 2,
  },
  statsStripDark: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
  },
  statPill: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  statValue: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(200,192,210,0.35)",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  programCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.60)",
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 2,
  },
  programCardDark: {
    borderColor: "rgba(255,255,255,0.10)",
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
  },
  programIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  programBody: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  programTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  programTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 15,
    lineHeight: 20,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(200,192,210,0.30)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    minWidth: 32,
    textAlign: "right",
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
