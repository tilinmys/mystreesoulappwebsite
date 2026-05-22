import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { F } from "../../constants/fonts";
import { useOnboardingStore } from "../../store/onboardingStore";
import { darkColors, type AppColors } from "../../constants/colors";
import { StatusBar } from "expo-status-bar";

const { width: W, height: H } = Dimensions.get("window");
const SIDE_PAD = 20;

// ── Assets ────────────────────────────────────────────────────────────────────
const cycleBgImage   = require("../../public/images/cycle_track_bg.webp");
const nourishBgImage = require("../../public/images/nourish_her_bg.webp");
const wellnessBgImage = require("../../public/images/wellness_reset_bg.webp");
const bloopProfile   = require("../../public/images/bloop-profile-meditation-cutout.webp");

// ── Cycle phase definitions ──────────────────────────────────────────────────
// ── Cycle phase definitions ──────────────────────────────────────────────────
const CYCLE_PHASES = [
  {
    name: "Menstruation",
    days: "DAYS 1-5",
    desc: "Uterine lining sheds",
    iconColor: "#E8A6B6", // Bloom Pink
    bubbleBg: "rgba(232, 166, 182, 0.14)",
    tileBg: "rgba(232, 166, 182, 0.06)",
    tileBorder: "rgba(232, 166, 182, 0.22)",
    icon: "water-outline" as const,
  },
  {
    name: "Follicular",
    days: "DAYS 1-13",
    desc: "Follicle develops",
    iconColor: "#B58AC8", // Lavender Dust
    bubbleBg: "rgba(181, 138, 200, 0.14)",
    tileBg: "rgba(181, 138, 200, 0.06)",
    tileBorder: "rgba(181, 138, 200, 0.22)",
    icon: "sprout-outline" as const,
  },
  {
    name: "Ovulation",
    days: "DAY 14",
    desc: "Egg release",
    iconColor: "#7EC8A0", // Sage Green / Fertility Glow
    bubbleBg: "rgba(126, 200, 160, 0.14)",
    tileBg: "rgba(126, 200, 160, 0.06)",
    tileBorder: "rgba(126, 200, 160, 0.22)",
    icon: "flower-outline" as const,
  },
  {
    name: "Luteal",
    days: "DAYS 15-28",
    desc: "Progesterone rises",
    iconColor: "#F4B86E", // Peach / Warm Golden
    bubbleBg: "rgba(244, 184, 110, 0.14)",
    tileBg: "rgba(244, 184, 110, 0.06)",
    tileBorder: "rgba(244, 184, 110, 0.22)",
    icon: "fire-outline" as const,
  },
] as const;

export default function OnboardingGoalsScreen() {
  const router           = useRouter();
  const setSelectedGoals = useOnboardingStore((s) => s.setSelectedGoals);
  const setLifeStage     = useOnboardingStore((s) => s.setLifeStage);
  const colors = darkColors;
  const isDark = true;

  // Multi-selection states. We default to having "cycle" preselected.
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["cycle"]));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Entrance animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    setSelectedGoals(Array.from(selected));
    setLifeStage("cycle_fertility");
    router.push("/(onboarding)/privacy-consent");
  };

  const s = getStyles(colors, isDark);

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>
      <StatusBar style="light" backgroundColor="#110812" translucent />
      {/* Ambient background atmosphere */}
      <View style={s.blob1} pointerEvents="none" />
      <View style={s.blob2} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable
          style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
          accessibilityLabel="Menu Options"
        >
          <MaterialCommunityIcons name="octagram-outline" size={20} color={colors.primaryCTA} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.logoText}>
            MyStree <Text style={{ color: "#F4B86E" }}>Soul</Text>
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.profileWrap, pressed && s.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open profile setup"
          onPress={() => toggle("self_love")}
        >
          <Image source={bloopProfile} style={s.profileImg} resizeMode="contain" />
        </Pressable>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={s.scroll}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* ── Large Cycle Tracking Card ── */}
          <Pressable
            onPress={() => toggle("cycle")}
            style={[
              s.cardShell,
              selected.has("cycle") && {
                borderColor: colors.primaryCTA,
                shadowColor: colors.primaryCTA,
                shadowOpacity: 0.25,
                shadowRadius: 18,
                elevation: 6,
              },
            ]}
          >
            {/* Absolute Sketch Illustration inside Card */}
            <Image source={cycleBgImage} style={s.cardBg} resizeMode="cover" />
            <View
              style={[
                s.cardBgOverlay,
                selected.has("cycle") && {
                  backgroundColor: "rgba(24, 10, 18, 0.88)",
                },
              ]}
            />

            <View style={s.cardContent}>
              {/* Header row of card */}
                <View style={s.cardHeaderRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Select full cycle tracking"
                    onPress={() => toggle("cycle")}
                    hitSlop={8}
                    style={({ pressed }) => [s.iconBubbleSquare, pressed && s.pressed]}
                  >
                    <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.primaryCTA} />
                  </Pressable>

                  {selected.has("cycle") && (
                    <View style={s.cardCheckmarkBadge}>
                      <Ionicons name="checkmark-circle" size={22} color={colors.primaryCTA} />
                    </View>
                  )}
                </View>

              <Text style={s.cardTitle}>Full Cycle Tracking</Text>
              <Text style={s.cardSub}>Understand your rhythm</Text>

              {/* 2x2 Grid of compact cycle phases */}
              <View style={s.phaseGrid}>
                <View style={s.phaseGridRow}>
                  {CYCLE_PHASES.slice(0, 2).map((p, i) => (
                    <Pressable
                      key={i}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${p.name} cycle phase`}
                      onPress={() => toggle("cycle")}
                      style={({ pressed }) => [
                        s.phaseTile,
                        { backgroundColor: p.tileBg, borderColor: p.tileBorder },
                        pressed && s.pressed
                      ]}
                    >
                      <View style={[s.phaseIconBubble, { borderColor: p.iconColor, backgroundColor: p.bubbleBg }]}>
                        <MaterialCommunityIcons name={p.icon as any} size={14} color={p.iconColor} />
                      </View>
                      <Text style={s.phaseName}>{p.name}</Text>
                      <Text style={[s.phaseDays, { color: p.iconColor }]}>{p.days}</Text>
                      <Text style={s.phaseDesc}>{p.desc}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={s.phaseGridRow}>
                  {CYCLE_PHASES.slice(2, 4).map((p, i) => (
                    <Pressable
                      key={i}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${p.name} cycle phase`}
                      onPress={() => toggle("cycle")}
                      style={({ pressed }) => [
                        s.phaseTile,
                        { backgroundColor: p.tileBg, borderColor: p.tileBorder },
                        pressed && s.pressed
                      ]}
                    >
                      <View style={[s.phaseIconBubble, { borderColor: p.iconColor, backgroundColor: p.bubbleBg }]}>
                        <MaterialCommunityIcons name={p.icon as any} size={14} color={p.iconColor} />
                      </View>
                      <Text style={s.phaseName}>{p.name}</Text>
                      <Text style={[s.phaseDays, { color: p.iconColor }]}>{p.days}</Text>
                      <Text style={s.phaseDesc}>{p.desc}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </Pressable>

          {/* ── Two Half-Width Cards ── */}
          <View style={s.cardRow}>
            {/* Nourish Her Card */}
            <Pressable
              onPress={() => toggle("nutrition")}
              style={[
                s.halfCardShell,
                selected.has("nutrition") && {
                  borderColor: "#F4B86E",
                  shadowColor: "#F4B86E",
                  shadowOpacity: 0.25,
                  shadowRadius: 18,
                  elevation: 6,
                },
              ]}
            >
              <Image source={nourishBgImage} style={s.cardBg} resizeMode="cover" />
              <View
                style={[
                  s.cardBgOverlay,
                  selected.has("nutrition") && {
                    backgroundColor: "rgba(24, 18, 10, 0.88)",
                  },
                ]}
              />

              <View style={s.halfCardContent}>
                <View style={s.cardHeaderRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Select nutrition"
                    onPress={() => toggle("nutrition")}
                    hitSlop={8}
                    style={({ pressed }) => [s.halfIconBubbleSquare, { borderColor: "rgba(244, 184, 110, 0.24)" }, pressed && s.pressed]}
                  >
                    <MaterialCommunityIcons name="leaf" size={18} color="#F4B86E" />
                  </Pressable>

                  {selected.has("nutrition") && (
                    <View style={s.cardCheckmarkBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#F4B86E" />
                    </View>
                  )}
                </View>

                <View style={s.halfCardTextWrap}>
                  <Text style={s.halfCardTitle}>Nourish Her</Text>
                  <Text style={s.halfCardSub}>Support your body</Text>
                </View>

                {/* Bottom icons */}
                <View style={s.bottomIconsRow}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Select nutrition leaf" onPress={() => toggle("nutrition")} hitSlop={8} style={({ pressed }) => pressed && s.pressed}>
                    <MaterialCommunityIcons name="leaf" size={14} color="#F4B86E" style={{ marginRight: 6 }} />
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel="Select hydration support" onPress={() => toggle("nutrition")} hitSlop={8} style={({ pressed }) => pressed && s.pressed}>
                    <MaterialCommunityIcons name="water-outline" size={14} color="#F4B86E" />
                  </Pressable>
                </View>
              </View>
            </Pressable>

            {/* Wellness Reset Card */}
            <Pressable
              onPress={() => toggle("inner_harmony")}
              style={[
                s.halfCardShell,
                selected.has("inner_harmony") && {
                  borderColor: "#B58AC8",
                  shadowColor: "#B58AC8",
                  shadowOpacity: 0.25,
                  shadowRadius: 18,
                  elevation: 6,
                },
              ]}
            >
              <Image source={wellnessBgImage} style={s.cardBg} resizeMode="cover" />
              <View
                style={[
                  s.cardBgOverlay,
                  selected.has("inner_harmony") && {
                    backgroundColor: "rgba(18, 10, 24, 0.88)",
                  },
                ]}
              />

              <View style={s.halfCardContent}>
                <View style={s.cardHeaderRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Select wellness reset"
                    onPress={() => toggle("inner_harmony")}
                    hitSlop={8}
                    style={({ pressed }) => [s.halfIconBubbleSquare, { borderColor: "rgba(181, 138, 200, 0.24)" }, pressed && s.pressed]}
                  >
                    <MaterialCommunityIcons name="meditation" size={18} color="#B58AC8" />
                  </Pressable>

                  {selected.has("inner_harmony") && (
                    <View style={s.cardCheckmarkBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#B58AC8" />
                    </View>
                  )}
                </View>

                <View style={s.halfCardTextWrap}>
                  <Text style={s.halfCardTitle}>Wellness Reset</Text>
                  <Text style={s.halfCardSub}>Find your center</Text>
                </View>

                {/* Bottom icons */}
                <View style={s.bottomIconsRow}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Select sleep support" onPress={() => toggle("inner_harmony")} hitSlop={8} style={({ pressed }) => pressed && s.pressed}>
                    <MaterialCommunityIcons name="moon-waning-crescent" size={14} color="#B58AC8" style={{ marginRight: 6 }} />
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel="Select breathing support" onPress={() => toggle("inner_harmony")} hitSlop={8} style={({ pressed }) => pressed && s.pressed}>
                    <MaterialCommunityIcons name="weather-windy" size={14} color="#B58AC8" />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Scroll footer padding */}
        <View style={{ height: 130 }} />
      </ScrollView>

      {/* ── Fixed Bottom Bar ── */}
      <View style={s.ctaArea}>
        <Pressable
          onPress={handleContinue}
          disabled={selected.size === 0}
          style={({ pressed }) => [
            s.ctaShell,
            pressed && s.pressed,
            selected.size === 0 && s.ctaDim,
          ]}
        >
          <View style={s.ctaContent}>
            <Text style={[s.ctaLabel, { color: colors.background }]}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.background} />
          </View>
        </Pressable>

        {/* Page indicators */}
        <View style={s.dotsRow}>
          <View style={s.dotActive} />
          <View style={s.dot} />
          <View style={s.dot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function getStyles(colors: AppColors, isDark: boolean) {
  const isSmallScreen = H < 780;
  const CARD_PADDING = isSmallScreen ? 12 : 16;
  const RESP_CARD_GAP = isSmallScreen ? 10 : 12;
  const RESP_HALF_W = (W - SIDE_PAD * 2 - RESP_CARD_GAP) / 2;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      overflow: "hidden",
    },

    // Ambient light accent blobs
    blob1: {
      position: "absolute",
      top: -120,
      left: -100,
      width: 360,
      height: 360,
      borderRadius: 180,
      backgroundColor: "rgba(232, 166, 182, 0.04)",
    },
    blob2: {
      position: "absolute",
      bottom: 100,
      right: -140,
      width: 340,
      height: 340,
      borderRadius: 170,
      backgroundColor: "rgba(181, 138, 200, 0.04)",
    },

    // Header row
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SIDE_PAD,
      paddingTop: 10,
      paddingBottom: 10,
      zIndex: 10,
    },
    logoText: {
      fontFamily: F.display,
      fontSize: 26,
      color: "#FFFFFF",
      letterSpacing: 0.5,
      textAlign: "center",
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(46, 35, 48, 0.40)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    profileWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
      overflow: "hidden",
      backgroundColor: "rgba(46, 35, 48, 0.40)",
      alignItems: "center",
      justifyContent: "center",
    },
    profileImg: {
      width: 32,
      height: 32,
    },

    // Scroll container
    scroll: {
      paddingHorizontal: SIDE_PAD,
      paddingTop: 6,
      gap: RESP_CARD_GAP,
    },

    // Large main card container
    cardShell: {
      width: "100%",
      borderRadius: 28,
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.06)",
      backgroundColor: colors.surface,
      overflow: "hidden",
      position: "relative",
      marginBottom: RESP_CARD_GAP,
    },
    cardBg: {
      position: "absolute",
      width: "100%",
      height: "100%",
      opacity: 0.55,
    },
    cardBgOverlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(17, 8, 18, 0.80)",
    },
    cardContent: {
      padding: CARD_PADDING + 2,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    iconBubbleSquare: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "rgba(232, 166, 182, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(232, 166, 182, 0.20)",
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontFamily: F.display,
      fontSize: 26,
      color: colors.textPrimary,
      lineHeight: 30,
      marginBottom: 3,
    },
    cardSub: {
      fontFamily: F.body,
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: 16,
    },

    // Compact 2x2 grid inside main card
    phaseGrid: {
      flexDirection: "column",
      gap: RESP_CARD_GAP,
    },
    phaseGridRow: {
      flexDirection: "row",
      gap: RESP_CARD_GAP,
    },
    phaseTile: {
      flex: 1,
      borderRadius: 20,
      backgroundColor: "rgba(17, 8, 18, 0.82)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
      paddingHorizontal: 11,
      paddingTop: 10,
      paddingBottom: 11,
      flexDirection: "column",
      alignItems: "flex-start",
    },
    phaseIconBubble: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      marginBottom: 8,
    },
    phaseName: {
      fontFamily: F.display,
      fontSize: 14.5,
      color: colors.textPrimary,
      lineHeight: 16,
      marginBottom: 2,
    },
    phaseDays: {
      fontFamily: F.uiLabel,
      fontSize: 9.5,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    phaseDesc: {
      fontFamily: F.body,
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 14,
    },

    // Two Half-Width Cards Stacked Below
    cardRow: {
      flexDirection: "row",
      gap: RESP_CARD_GAP,
    },
    halfCardShell: {
      width: RESP_HALF_W,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.06)",
      backgroundColor: colors.surface,
      overflow: "hidden",
      position: "relative",
      height: isSmallScreen ? 140 : 160,
    },
    halfCardContent: {
      padding: 12,
      flex: 1,
      justifyContent: "space-between",
    },
    halfIconBubbleSquare: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderWidth: 1.2,
      alignItems: "center",
      justifyContent: "center",
    },
    halfCardTextWrap: {
      gap: 2,
      marginTop: 4,
    },
    halfCardTitle: {
      fontFamily: F.display,
      fontSize: 18,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    halfCardSub: {
      fontFamily: F.body,
      fontSize: 12,
      color: colors.textPrimary,
      lineHeight: 14,
    },
    bottomIconsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    cardCheckmarkBadge: {
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },

    // Bottom Action Area
    ctaArea: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: SIDE_PAD,
      paddingTop: 12,
      paddingBottom: isSmallScreen ? 14 : 20,
      gap: 10,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    ctaShell: {
      width: "100%",
      borderRadius: 999,
      backgroundColor: colors.primaryCTA,
      shadowColor: colors.primaryCTA,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.28,
      shadowRadius: 20,
      elevation: 6,
    },
    ctaContent: {
      height: 56,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    ctaLabel: {
      fontFamily: F.uiLabel,
      fontSize: 15,
      letterSpacing: 0.5,
    },
    ctaDim: {
      opacity: 0.48,
    },

    // Dots indicator
    dotsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "rgba(232, 166, 182, 0.24)",
    },
    dotActive: {
      width: 26,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryCTA,
    },

    pressed: {
      transform: [{ scale: 0.98 }],
    },
  });
}
