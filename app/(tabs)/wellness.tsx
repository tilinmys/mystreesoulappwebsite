import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Defs,
  Ellipse,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
  Svg,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";

// ── Assets ────────────────────────────────────────────────────────────────────
const imgBloop = require("../../public/images/bloop-welcome.webp");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg1:     "#FDF8F8",
  bg2:     "#F5E8F7",
  bg3:     "#FEF2F0",
  text:    "#161C2D",
  muted:   "#9B8EAB",
  faint:   "#D4C8E0",
  lavender:"#9277C8",
  purple:  "#8B63D6",
  pink:    "#D45C82",
  peach:   "#F4A261",
  sage:    "#5E9B6B",
  white:   "#FFFFFF",
  cardBg:  "rgba(255,255,255,0.72)",
  cardBdr: "rgba(255,255,255,0.92)",
} as const;

// ── Dimensions ────────────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const HERO_H = 290;
const BCARD_W = W - 40;
const BCARD_H = 156;

// ── Breathing card wave paths ─────────────────────────────────────────────────
const bw1 = `M -10 ${BCARD_H * 0.38} C ${BCARD_W * 0.18} ${BCARD_H * 0.10} ${BCARD_W * 0.38} ${BCARD_H * 0.56} ${BCARD_W * 0.52} ${BCARD_H * 0.34} C ${BCARD_W * 0.66} ${BCARD_H * 0.14} ${BCARD_W * 0.84} ${BCARD_H * 0.50} ${BCARD_W + 10} ${BCARD_H * 0.30}`;
const bw2 = `M -10 ${BCARD_H * 0.55} C ${BCARD_W * 0.15} ${BCARD_H * 0.28} ${BCARD_W * 0.35} ${BCARD_H * 0.70} ${BCARD_W * 0.50} ${BCARD_H * 0.48} C ${BCARD_W * 0.65} ${BCARD_H * 0.28} ${BCARD_W * 0.85} ${BCARD_H * 0.64} ${BCARD_W + 10} ${BCARD_H * 0.44}`;
const bw3 = `M -10 ${BCARD_H * 0.68} C ${BCARD_W * 0.20} ${BCARD_H * 0.45} ${BCARD_W * 0.40} ${BCARD_H * 0.82} ${BCARD_W * 0.55} ${BCARD_H * 0.60} C ${BCARD_W * 0.70} ${BCARD_H * 0.40} ${BCARD_W * 0.88} ${BCARD_H * 0.74} ${BCARD_W + 10} ${BCARD_H * 0.56}`;

// ── Phase categories ──────────────────────────────────────────────────────────
const PHASES = [
  { key: "menstrual",  label: "Menstrual\nCare",    icon: "water-outline"          as const, color: C.lavender },
  { key: "ovulation",  label: "Ovulation\nEnergy",  icon: "white-balance-sunny"    as const, color: C.peach    },
  { key: "pms",        label: "PMS\nRecovery",      icon: "moon-waning-crescent"   as const, color: C.purple   },
  { key: "emotional",  label: "Emotional\nReset",   icon: "heart-outline"          as const, color: C.pink     },
  { key: "sleep",      label: "Better\nSleep",      icon: "sleep"                  as const, color: C.lavender },
] as const;

// ── Recommendation cards ──────────────────────────────────────────────────────
const RECS = [
  {
    key:      "breathwork",
    title:    "5-Minute\nBreathwork",
    duration: "5 min",
    icon:     "meditation"            as const,
    colors:   ["#DDD8F5", "#B8AEE0"] as [string, string],
    iconBg:   "rgba(255,255,255,0.30)",
  },
  {
    key:      "yoga",
    title:    "Hormone Balance\nYoga",
    duration: "15 min",
    icon:     "yoga"                  as const,
    colors:   ["#FDDFC4", "#F9C490"] as [string, string],
    iconBg:   "rgba(255,255,255,0.30)",
  },
  {
    key:      "sleep",
    title:    "Sleep Recovery\nFlow",
    duration: "20 min",
    icon:     "moon-waning-crescent"  as const,
    colors:   ["#C5C0F0", "#9B8DDC"] as [string, string],
    iconBg:   "rgba(255,255,255,0.25)",
  },
] as const;

// ── Today's support ───────────────────────────────────────────────────────────
const SUPPORT = [
  { key: "hydrate",  icon: "water-outline"    as const, color: "#4BA3C3", bg: "rgba(75,163,195,0.12)",  text: "Hydrate more\ntoday"            },
  { key: "energy",   icon: "white-balance-sunny" as const, color: C.peach,  bg: "rgba(244,162,97,0.12)", text: "Energy may dip\ntonight"         },
  { key: "stretch",  icon: "sprout-outline"   as const, color: C.sage,   bg: "rgba(94,155,107,0.12)", text: "Gentle stretching\nmay help cramps" },
] as const;

// ── Botanical SVG background ──────────────────────────────────────────────────
function BotanicalLeaves() {
  return (
    <Svg
      width={W}
      height={HERO_H}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {/* ── Left branch ─────────────────────────────── */}
      {/* Main stem */}
      <Path
        d={`M 22 ${HERO_H} Q 36 ${HERO_H * 0.74} 52 ${HERO_H * 0.56} Q 64 ${HERO_H * 0.42} 72 ${HERO_H * 0.26}`}
        stroke="rgba(146,119,200,0.22)"
        strokeWidth={1.4}
        fill="none"
      />
      {/* Leaf 1 lower-left */}
      <Path
        d={`M 38 ${HERO_H * 0.72} Q 12 ${HERO_H * 0.65} 8 ${HERO_H * 0.54} Q 22 ${HERO_H * 0.62} 38 ${HERO_H * 0.72}`}
        stroke="rgba(146,119,200,0.18)"
        strokeWidth={1}
        fill="rgba(146,119,200,0.07)"
      />
      {/* Leaf 2 mid-left */}
      <Path
        d={`M 48 ${HERO_H * 0.58} Q 18 ${HERO_H * 0.50} 14 ${HERO_H * 0.38} Q 30 ${HERO_H * 0.48} 48 ${HERO_H * 0.58}`}
        stroke="rgba(146,119,200,0.16)"
        strokeWidth={1}
        fill="rgba(146,119,200,0.06)"
      />
      {/* Leaf 3 upper-left */}
      <Path
        d={`M 60 ${HERO_H * 0.42} Q 30 ${HERO_H * 0.32} 26 ${HERO_H * 0.20} Q 44 ${HERO_H * 0.32} 60 ${HERO_H * 0.42}`}
        stroke="rgba(146,119,200,0.15)"
        strokeWidth={0.9}
        fill="rgba(146,119,200,0.05)"
      />
      {/* Small top leaf */}
      <Path
        d={`M 68 ${HERO_H * 0.28} Q 52 ${HERO_H * 0.18} 56 ${HERO_H * 0.08} Q 65 ${HERO_H * 0.18} 68 ${HERO_H * 0.28}`}
        stroke="rgba(146,119,200,0.14)"
        strokeWidth={0.8}
        fill="rgba(146,119,200,0.04)"
      />

      {/* ── Right branch ────────────────────────────── */}
      <Path
        d={`M ${W - 22} ${HERO_H} Q ${W - 36} ${HERO_H * 0.74} ${W - 52} ${HERO_H * 0.56} Q ${W - 64} ${HERO_H * 0.42} ${W - 72} ${HERO_H * 0.26}`}
        stroke="rgba(212,92,130,0.18)"
        strokeWidth={1.4}
        fill="none"
      />
      <Path
        d={`M ${W - 38} ${HERO_H * 0.72} Q ${W - 12} ${HERO_H * 0.65} ${W - 8} ${HERO_H * 0.54} Q ${W - 22} ${HERO_H * 0.62} ${W - 38} ${HERO_H * 0.72}`}
        stroke="rgba(212,92,130,0.14)"
        strokeWidth={1}
        fill="rgba(212,92,130,0.06)"
      />
      <Path
        d={`M ${W - 48} ${HERO_H * 0.58} Q ${W - 18} ${HERO_H * 0.50} ${W - 14} ${HERO_H * 0.38} Q ${W - 30} ${HERO_H * 0.48} ${W - 48} ${HERO_H * 0.58}`}
        stroke="rgba(212,92,130,0.12)"
        strokeWidth={1}
        fill="rgba(212,92,130,0.05)"
      />
      <Path
        d={`M ${W - 60} ${HERO_H * 0.42} Q ${W - 30} ${HERO_H * 0.32} ${W - 26} ${HERO_H * 0.20} Q ${W - 44} ${HERO_H * 0.32} ${W - 60} ${HERO_H * 0.42}`}
        stroke="rgba(212,92,130,0.11)"
        strokeWidth={0.9}
        fill="rgba(212,92,130,0.04)"
      />
      <Path
        d={`M ${W - 68} ${HERO_H * 0.28} Q ${W - 52} ${HERO_H * 0.18} ${W - 56} ${HERO_H * 0.08} Q ${W - 65} ${HERO_H * 0.18} ${W - 68} ${HERO_H * 0.28}`}
        stroke="rgba(212,92,130,0.10)"
        strokeWidth={0.8}
        fill="rgba(212,92,130,0.04)"
      />
    </Svg>
  );
}

// ── Hero glow (warm peach/gold radial) ───────────────────────────────────────
function HeroGlow() {
  const S = 220;
  return (
    <Svg width={S} height={S} style={styles.heroGlowSvg} pointerEvents="none">
      <Defs>
        <SvgRadialGradient id="hglow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#FFE0A8" stopOpacity="0.55" />
          <Stop offset="50%"  stopColor="#FFD090" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#FFD090" stopOpacity="0"    />
        </SvgRadialGradient>
      </Defs>
      <Ellipse cx={S / 2} cy={S / 2} rx={S / 2} ry={S / 2} fill="url(#hglow)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function WellnessScreen() {
  const [activePhase, setActivePhase]   = useState("menstrual");
  const [isBreathing, setIsBreathing]   = useState(false);

  // Reanimated breathing values
  const breathValue = useRef(new Animated.Value(0)).current;
  const breathLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startBreathing = () => {
    // Box breathing: 4s inhale → 2s hold → 4s exhale → 2s hold
    breathLoop.current?.stop();
    breathLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(breathValue, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(breathValue, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    );
    breathLoop.current.start();
  };

  const stopBreathing = () => {
    breathLoop.current?.stop();
    breathLoop.current = null;
    Animated.timing(breathValue, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const toggleBreathing = () => {
    if (isBreathing) {
      stopBreathing();
    } else {
      startBreathing();
    }
    setIsBreathing(prev => !prev);
  };

  useEffect(() => () => breathLoop.current?.stop(), []);

  const breathAnimStyle = {
    opacity: breathValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.52, 0.88],
    }),
    transform: [
      {
        scale: breathValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.68, 1],
        }),
      },
    ],
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      {/* Full-screen background gradient */}
      <LinearGradient
        colors={[C.bg1, C.bg2, C.bg3]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Care Space</Text>
            <Text style={styles.headerSub}>Your healing space</Text>
          </View>
          <View style={styles.headerBtns}>
            <View style={styles.headerIconBtn} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <MaterialCommunityIcons name="magnify" size={20} color={C.muted} />
            </View>
            <View style={styles.headerIconBtn} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <MaterialCommunityIcons name="spa-outline" size={20} color={C.lavender} />
            </View>
          </View>
        </View>

        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Botanical SVG overlay */}
          <BotanicalLeaves />

          {/* Warm glow behind mascot */}
          <HeroGlow />

          {/* Bloop mascot */}
          <View style={styles.bloopWrap}>
            <CachedImage source={imgBloop} style={styles.bloopImg} />
          </View>

          {/* Hero text */}
          <Text style={styles.heroText}>
            {"Your body may need gentle "}
            <Text style={styles.heroAccent}>slowing down</Text>
            {" today."}
          </Text>

          {/* Recovery pill */}
          <View style={styles.recoveryPill}>
            <MaterialCommunityIcons name="leaf-circle-outline" size={16} color={C.purple} />
            <Text style={styles.recoveryPillText}>Recovery</Text>
          </View>
        </View>

        {/* ── For your current phase ───────────────────────────────────── */}
        <Text style={styles.sectionLabel}>For your current phase</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.phaseScroll}
          style={styles.phaseScrollView}
        >
          {PHASES.map((p) => {
            const active = activePhase === p.key;
            return (
              <Pressable
                key={p.key}
                onPress={() => setActivePhase(p.key)}
                style={({ pressed }) => [
                  styles.phaseCard,
                  active && { borderColor: C.purple, borderWidth: 1.5, backgroundColor: "rgba(139,99,214,0.06)" },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons
                  name={p.icon}
                  size={22}
                  color={active ? C.purple : C.muted}
                />
                <Text style={[styles.phaseCardLabel, active && { color: C.purple, fontFamily: F.uiSemiBold }]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Recommended for you ──────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel2}>Recommended for you</Text>
          <View style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View all</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={C.lavender} />
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recScroll}
        >
          {RECS.map((r, i) => (
            <View
              key={r.key}
              style={[
                styles.recCard,
                i === 0 && { marginLeft: 20 },
              ]}
            >
              <LinearGradient
                colors={r.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 1 }}
                style={styles.recCardInner}
              >
                {/* Icon */}
                <View style={[styles.recIconWrap, { backgroundColor: r.iconBg }]}>
                  <MaterialCommunityIcons name={r.icon} size={36} color={C.white} />
                </View>

                {/* Bottom row */}
                <View style={styles.recBottom}>
                  <View style={styles.recBottomLeft}>
                    <Text style={styles.recTitle}>{r.title}</Text>
                    <View style={styles.recMeta}>
                      <MaterialCommunityIcons name="clock-outline" size={11} color="rgba(255,255,255,0.70)" />
                      <Text style={styles.recDuration}>{r.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.recPlayBtn}>
                    <MaterialCommunityIcons name="play" size={16} color={C.text} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>

        {/* ── Breathing Space ───────────────────────────────────────────── */}
        <View style={styles.breathingCard}>
          {/* Background sine waves */}
          <Svg
            width={BCARD_W}
            height={BCARD_H}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Path d={bw3} stroke="rgba(146,119,200,0.08)" strokeWidth={1.5} fill="none" />
            <Path d={bw2} stroke="rgba(146,119,200,0.10)" strokeWidth={1.5} fill="none" />
            <Path d={bw1} stroke="rgba(146,119,200,0.13)" strokeWidth={1.8} fill="none" />
          </Svg>

          {/* Left: title + play */}
          <View style={styles.breathLeft}>
            <Text style={styles.breathTitle}>Breathing space</Text>
            <Text style={styles.breathSub}>Take a moment for you</Text>
            <Pressable style={styles.breathPlayBtn} onPress={toggleBreathing}>
              <MaterialCommunityIcons
                name={isBreathing ? "pause" : "play"}
                size={18}
                color={C.text}
              />
            </Pressable>
          </View>

          {/* Center: animated orb + label */}
          <View style={styles.breathCenter}>
            <View style={styles.breathOrbWrap}>
              <Animated.View style={[styles.breathOrb, breathAnimStyle]} />
            </View>
            <Text style={styles.breathPhaseLabel}>Inhale · Hold · Exhale</Text>
          </View>

          {/* Right: timer */}
          <View style={styles.breathRight}>
            <Text style={styles.breathTimer}>2:30</Text>
            <Text style={styles.breathTimerUnit}>min</Text>
          </View>
        </View>

        {/* ── Today's support ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel2}>Today's support</Text>
          <View style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>See all</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={C.lavender} />
          </View>
        </View>
        <View style={styles.supportGrid}>
          {SUPPORT.map((s) => (
            <View key={s.key} style={styles.supportPill}>
              <View style={[styles.supportIconWrap, { backgroundColor: s.bg }]}>
                <MaterialCommunityIcons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={styles.supportText}>{s.text}</Text>
            </View>
          ))}
        </View>

        {/* Spacer for FloatingTabBar */}
        <View style={{ height: 108 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    backgroundColor: C.bg1,
    flex: 1,
  },
  scroll: {
    paddingTop: 8,
  },

  // Header
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color:      C.text,
    fontFamily: F.luxuryBold,
    fontSize:   28,
    letterSpacing: 0.2,
    lineHeight: 34,
  },
  headerSub: {
    color:      C.muted,
    fontFamily: F.uiRegular,
    fontSize:   13,
    marginTop:  2,
  },
  headerBtns: {
    alignItems:    "center",
    flexDirection: "row",
    gap:           10,
    marginTop:     6,
  },
  headerIconBtn: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     20,
    borderWidth:      1,
    height:           40,
    justifyContent:   "center",
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 3 },
    shadowOpacity:    0.12,
    shadowRadius:     8,
    width:            40,
  },

  // Hero
  heroSection: {
    alignItems:     "center",
    height:         HERO_H,
    justifyContent: "center",
    overflow:       "hidden",
    position:       "relative",
  },
  heroGlowSvg: {
    position: "absolute",
    top:      HERO_H * 0.08,
  },
  bloopWrap: {
    alignItems:     "center",
    height:         160,
    justifyContent: "center",
    marginBottom:   12,
    width:          160,
  },
  bloopImg: {
    borderRadius: 80,
    height:       148,
    width:        148,
  },
  heroText: {
    color:       C.text,
    fontFamily:  F.luxuryBold,
    fontSize:    20,
    lineHeight:  30,
    marginBottom: 14,
    paddingHorizontal: 28,
    textAlign:   "center",
  },
  heroAccent: {
    color:      C.purple,
    fontFamily: F.luxuryItalic,
  },
  recoveryPill: {
    alignItems:       "center",
    backgroundColor:  "rgba(139,99,214,0.10)",
    borderColor:      "rgba(139,99,214,0.22)",
    borderRadius:     24,
    borderWidth:      1,
    flexDirection:    "row",
    gap:              6,
    paddingHorizontal: 16,
    paddingVertical:  8,
  },
  recoveryPillText: {
    color:      C.purple,
    fontFamily: F.uiSemiBold,
    fontSize:   13,
  },

  // Phase cards
  sectionLabel: {
    color:      C.text,
    fontFamily: F.uiBold,
    fontSize:   15,
    marginBottom: 12,
    marginTop:  20,
    paddingHorizontal: 20,
  },
  phaseScrollView: {
    marginBottom: 6,
  },
  phaseScroll: {
    gap:             10,
    paddingHorizontal: 20,
  },
  phaseCard: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     18,
    borderWidth:      1,
    height:           88,
    justifyContent:   "center",
    gap:              8,
    paddingHorizontal: 8,
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 3 },
    shadowOpacity:    0.10,
    shadowRadius:     8,
    width:            88,
  },
  phaseCardLabel: {
    color:      C.muted,
    fontFamily: F.uiMedium,
    fontSize:   11,
    textAlign:  "center",
  },

  // Recommended
  sectionHeader: {
    alignItems:     "center",
    flexDirection:  "row",
    justifyContent: "space-between",
    marginBottom:   12,
    marginTop:      22,
    paddingHorizontal: 20,
  },
  sectionLabel2: {
    color:      C.text,
    fontFamily: F.uiBold,
    fontSize:   15,
  },
  viewAllBtn: {
    alignItems:    "center",
    flexDirection: "row",
    gap:           2,
  },
  viewAllText: {
    color:      C.lavender,
    fontFamily: F.uiSemiBold,
    fontSize:   12,
  },
  recScroll: {
    gap:              12,
    paddingRight:     20,
  },
  recCard: {
    borderRadius:  24,
    height:        200,
    overflow:      "hidden",
    shadowColor:   "#D6C3B9",
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius:  14,
    width:         W * 0.46,
  },
  recCardInner: {
    flex:           1,
    justifyContent: "space-between",
    padding:        16,
  },
  recIconWrap: {
    alignItems:     "center",
    alignSelf:      "center",
    borderRadius:   28,
    height:         72,
    justifyContent: "center",
    width:          72,
    marginTop:      8,
  },
  recBottom: {
    alignItems:     "flex-end",
    flexDirection:  "row",
    justifyContent: "space-between",
  },
  recBottomLeft: {
    flex: 1,
  },
  recTitle: {
    color:      C.white,
    fontFamily: F.uiBold,
    fontSize:   13,
    lineHeight: 18,
    marginBottom: 4,
  },
  recMeta: {
    alignItems:    "center",
    flexDirection: "row",
    gap:           4,
  },
  recDuration: {
    color:      "rgba(255,255,255,0.70)",
    fontFamily: F.uiMedium,
    fontSize:   11,
  },
  recPlayBtn: {
    alignItems:       "center",
    backgroundColor:  "rgba(255,255,255,0.92)",
    borderRadius:     16,
    height:           32,
    justifyContent:   "center",
    shadowColor:      "#000",
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.10,
    shadowRadius:     6,
    width:            32,
  },

  // Breathing card
  breathingCard: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     28,
    borderWidth:      1,
    flexDirection:    "row",
    height:           BCARD_H,
    justifyContent:   "space-between",
    marginHorizontal: 20,
    marginTop:        0,
    overflow:         "hidden",
    paddingHorizontal: 16,
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 6 },
    shadowOpacity:    0.12,
    shadowRadius:     18,
  },
  breathLeft: {
    flex:    1,
    gap:     4,
  },
  breathTitle: {
    color:      C.text,
    fontFamily: F.uiBold,
    fontSize:   15,
  },
  breathSub: {
    color:      C.muted,
    fontFamily: F.uiRegular,
    fontSize:   11,
    marginBottom: 10,
  },
  breathPlayBtn: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     20,
    borderWidth:      1,
    height:           40,
    justifyContent:   "center",
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 3 },
    shadowOpacity:    0.12,
    shadowRadius:     8,
    width:            40,
  },
  breathCenter: {
    alignItems: "center",
    flex:       1.2,
    gap:        6,
  },
  breathOrbWrap: {
    alignItems:     "center",
    height:         80,
    justifyContent: "center",
    width:          80,
  },
  breathOrb: {
    backgroundColor: C.lavender,
    borderRadius:    40,
    height:          72,
    opacity:         0.52,
    shadowColor:     C.lavender,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.55,
    shadowRadius:    18,
    width:           72,
  },
  breathPhaseLabel: {
    color:      C.muted,
    fontFamily: F.uiMedium,
    fontSize:   10,
    letterSpacing: 0.5,
  },
  breathRight: {
    alignItems: "flex-end",
    flex:       0.7,
  },
  breathTimer: {
    color:      C.text,
    fontFamily: F.uiBold,
    fontSize:   22,
    lineHeight: 26,
  },
  breathTimerUnit: {
    color:      C.muted,
    fontFamily: F.uiRegular,
    fontSize:   11,
  },

  // Today's support
  supportGrid: {
    flexDirection:  "row",
    flexWrap:       "wrap",
    gap:            10,
    paddingHorizontal: 20,
  },
  supportPill: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     18,
    borderWidth:      1,
    flexDirection:    "row",
    gap:              10,
    minWidth:         (W - 40 - 10) / 3 - 1,
    flex:             1,
    padding:          12,
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 3 },
    shadowOpacity:    0.10,
    shadowRadius:     8,
  },
  supportIconWrap: {
    alignItems:     "center",
    borderRadius:   12,
    height:         36,
    justifyContent: "center",
    width:          36,
  },
  supportText: {
    color:      C.text,
    flex:       1,
    fontFamily: F.uiMedium,
    fontSize:   11,
    lineHeight: 15,
  },

  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
