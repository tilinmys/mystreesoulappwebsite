import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Circle,
  Defs,
  Line as SvgLine,
  LinearGradient as SvgGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
  Svg,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { darkColors } from "../../constants/colors";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { openBloopWithContext } from "../../lib/openBloopWithContext";

// ── Assets ────────────────────────────────────────────────────────────────────
const imgBloop = require("../../public/images/bloop-welcome.webp");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg1:      darkColors.background,
  bg2:      darkColors.background,
  bg3:      darkColors.background,
  text:     darkColors.textPrimary,
  muted:    darkColors.textMuted,
  faint:    darkColors.textHint,
  terra:    darkColors.primaryCTA,
  lavender: darkColors.textMuted,
  pink:     darkColors.periodColor,
  orange:   darkColors.warning,
  sage:     darkColors.fertileColor,
  navy:     darkColors.surfaceRaised,
  white:    darkColors.textPrimary,
  cardBg:   darkColors.surface,
  cardBdr:  darkColors.border,
  sheetBg:  darkColors.surface,
  surfaceRaised: darkColors.surfaceRaised,
} as const;

// ── Screen / graph geometry ───────────────────────────────────────────────────
const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;
const H = Platform.OS === "web" ? 844 : Dimensions.get("window").height;
const CARD_MX   = 20;
const CARD_PX   = 18;
const GRAPH_W   = W - CARD_MX * 2 - CARD_PX * 2;
const ICON_R    = 17;
const ICON_CY   = 4 + ICON_R;
const GRAPH_TOP = ICON_CY + ICON_R + 14;
const GRAPH_H   = 98;
const SVG_H     = GRAPH_TOP + GRAPH_H + 6;

// ── Wave data ─────────────────────────────────────────────────────────────────
const WAVE_DATA = [
  62, 56, 46, 36, 30, 35, 44, 53, 62, 68, 75, 81, 86, 88, 90,
  88, 81, 70, 56, 40, 30, 35, 44, 56, 66, 70, 66, 62,
];
const GRAPH_MARKERS = [
  { idx: 3,  emoji: "🌙", bg: `${C.surfaceRaised}CC`, border: C.lavender },
  { idx: 9,  emoji: "😊", bg: `${C.surfaceRaised}CC`, border: C.pink     },
  { idx: 14, emoji: "⚡", bg: `${C.surfaceRaised}CC`, border: C.orange   },
  { idx: 19, emoji: "🩸", bg: `${C.surfaceRaised}CC`, border: C.pink     },
  { idx: 24, emoji: "🌸", bg: `${C.surfaceRaised}CC`, border: C.pink     },
] as const;

// ── SVG helpers ───────────────────────────────────────────────────────────────
function waveY(value: number) {
  const pad = 5;
  return GRAPH_TOP + GRAPH_H - pad - (value / 100) * (GRAPH_H - pad * 2);
}
function waveX(idx: number) { return idx * (GRAPH_W / (WAVE_DATA.length - 1)); }
function buildWavePath(data: number[]) {
  const n   = data.length;
  const pts = data.map((v, i) => ({ x: waveX(i), y: waveY(v) }));
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Mountain SVG for AI Prediction card
const MTN_W = 128, MTN_H = 54;
const mtn1 = `M 0 ${MTN_H} L ${MTN_W*0.05} ${MTN_H*0.62} Q ${MTN_W*0.22} ${MTN_H*0.08} ${MTN_W*0.42} ${MTN_H*0.48} Q ${MTN_W*0.62} ${MTN_H*0.78} ${MTN_W*0.78} ${MTN_H*0.36} L ${MTN_W} ${MTN_H*0.52} L ${MTN_W} ${MTN_H} Z`;
const mtn2 = `M ${MTN_W*0.18} ${MTN_H} L ${MTN_W*0.28} ${MTN_H*0.44} Q ${MTN_W*0.48} ${MTN_H*-0.04} ${MTN_W*0.62} ${MTN_H*0.36} Q ${MTN_W*0.78} ${MTN_H*0.66} ${MTN_W} ${MTN_H*0.28} L ${MTN_W} ${MTN_H} Z`;

// ── Key Pattern detail content ────────────────────────────────────────────────
const PATTERN_DETAIL = {
  title:    "Pre-period emotional dip",
  what:     "In the 3–5 days before your period (late luteal phase), estrogen and progesterone both drop sharply. This hormonal withdrawal directly reduces serotonin and GABA levels in the brain.",
  why:      "Progesterone's metabolite allopregnanolone normally calms the nervous system. When it drops, the brain loses this buffer — resulting in heightened emotional sensitivity, lower mood threshold, and heightened reactivity to stress.",
  helps: [
    "Magnesium-rich foods (pumpkin seeds, dark chocolate) support GABA production",
    "Reducing caffeine lessens cortisol spikes during this sensitive window",
    "Light movement — yoga or walking — boosts endorphins without depleting energy",
    "Planning softer social commitments in the days before your period reduces pressure",
    "Tracking this pattern over 3 cycles reveals your personal onset day",
  ],
  bloopMsg: "I notice I feel emotionally lower in the 3 days before my period. Why does this happen hormonally and what are the most evidence-based ways I can manage it?",
};

// ── All insights teaser rows ──────────────────────────────────────────────────
const INSIGHT_TEASERS = [
  { icon: "moon-waning-crescent", color: C.lavender, bg: C.surfaceRaised, title: "Sleep quality improved by 18%", sub: "Last 7 days vs. prior week", locked: false },
  { icon: "emoticon-happy-outline", color: C.pink, bg: C.surfaceRaised, title: "Mood was highest at ovulation",  sub: "Day 13–15 · Typical pattern",  locked: false },
  { icon: "lightning-bolt", color: C.orange, bg: C.surfaceRaised, title: "Energy dips 2 days post-ovulation", sub: "Consistent across 3 cycles", locked: true  },
  { icon: "water-outline", color: C.sage, bg: C.surfaceRaised, title: "Hydration lowest during PMS week",  sub: "Below target on 4/7 days",     locked: true  },
];

// ── Filter options ────────────────────────────────────────────────────────────
const FILTER_TIME   = [{ id: "week", label: "This week" }, { id: "month", label: "This month" }, { id: "quarter", label: "Last 3 months" }];
const FILTER_AREAS  = [{ id: "all", label: "All" }, { id: "sleep", label: "Sleep" }, { id: "mood", label: "Mood" }, { id: "energy", label: "Energy" }, { id: "cycle", label: "Cycle" }];

// ── Glowing sphere ────────────────────────────────────────────────────────────
function GlowSphere() {
  const S = 148, cx = S*0.52, cy = S*0.52, r = S*0.36;
  const sw1 = `M ${cx-r-22} ${cy+8} C ${cx-r*0.4} ${cy-22} ${cx+r*0.4} ${cy+38} ${cx+r+22} ${cy+8}`;
  const sw2 = `M ${cx-r-14} ${cy-14} C ${cx-r*0.4} ${cy+18} ${cx+r*0.4} ${cy-28} ${cx+r+14} ${cy-14}`;
  return (
    <Svg width={S} height={S}>
      <Defs>
        <SvgRadialGradient id="sph" cx="38%" cy="32%" r="65%" fx="38%" fy="32%">
          <Stop offset="0%"   stopColor="#EEE0FF" stopOpacity="1" />
          <Stop offset="42%"  stopColor="#C9A8EA" stopOpacity="1" />
          <Stop offset="100%" stopColor="#7B50C0" stopOpacity="1" />
        </SvgRadialGradient>
        <SvgRadialGradient id="gl1" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#C4A0E8" stopOpacity="0.38" />
          <Stop offset="100%" stopColor="#C4A0E8" stopOpacity="0"    />
        </SvgRadialGradient>
        <SvgRadialGradient id="gl2" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#E4D0F8" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#E4D0F8" stopOpacity="0"    />
        </SvgRadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r+30} fill="url(#gl2)" />
      <Circle cx={cx} cy={cy} r={r+16} fill="url(#gl1)" />
      <Path d={sw2} stroke={C.text} opacity="0.30" strokeWidth={1.2} fill="none" />
      <Path d={sw1} stroke={C.text} opacity="0.42" strokeWidth={1.6} fill="none" />
      <Circle cx={cx} cy={cy} r={r} fill="url(#sph)" />
      <Circle cx={cx-r*0.28} cy={cy-r*0.30} r={r*0.20} fill={C.text} opacity="0.38" />
      <Circle cx={cx-r*0.18} cy={cy-r*0.20} r={r*0.09} fill={C.text} opacity="0.62" />
      <Circle cx={cx+r*0.55} cy={cy-r*0.60} r={3}   fill={C.text} opacity="0.90" />
      <Circle cx={cx+r*0.72} cy={cy-r*0.20} r={1.8} fill={C.text} opacity="0.70" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function InsightsScreen() {
  const router   = useRouter();
  const { colors } = useColorMode();
  const wavePath = buildWavePath(WAVE_DATA);

  // Filter sheet state
  const [filterTime, setFilterTime]   = useState<"week" | "month" | "quarter">("week");
  const [filterArea, setFilterArea]   = useState("all");
  const [filterOpen, setFilterOpen]   = useState(false);
  const filterAnim = useRef(new Animated.Value(0)).current;

  // Key pattern sheet state
  const [patternOpen, setPatternOpen] = useState(false);
  const patternAnim = useRef(new Animated.Value(0)).current;

  // View-all sheet state
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const viewAllAnim = useRef(new Animated.Value(0)).current;

  // Derived animated values
  const filterSlide   = filterAnim.interpolate({ inputRange: [0,1], outputRange: [520, 0] });
  const filterOverlay = filterAnim.interpolate({ inputRange: [0,1], outputRange: [0,   1] });
  const patternSlide   = patternAnim.interpolate({ inputRange: [0,1], outputRange: [560, 0] });
  const patternOverlay = patternAnim.interpolate({ inputRange: [0,1], outputRange: [0,   1] });
  const viewAllSlide   = viewAllAnim.interpolate({ inputRange: [0,1], outputRange: [500, 0] });
  const viewAllOverlay = viewAllAnim.interpolate({ inputRange: [0,1], outputRange: [0,   1] });

  function askBloop(message: string) {
    openBloopWithContext(router, message, "Insights");
  }

  // ── Filter sheet
  function openFilter() {
    setFilterOpen(true);
    Animated.timing(filterAnim, { toValue: 1, duration: 330, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }
  function closeFilter() {
    Animated.timing(filterAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setFilterOpen(false);
      filterAnim.setValue(0);
    });
  }

  // ── Pattern sheet
  function openPattern() {
    setPatternOpen(true);
    Animated.timing(patternAnim, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }
  function closePattern(thenBloop?: string) {
    Animated.timing(patternAnim, { toValue: 0, duration: 230, useNativeDriver: true }).start(() => {
      setPatternOpen(false);
      patternAnim.setValue(0);
      if (thenBloop) askBloop(thenBloop);
    });
  }

  // ── View-all sheet
  function openViewAll() {
    setViewAllOpen(true);
    Animated.timing(viewAllAnim, { toValue: 1, duration: 330, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }
  function closeViewAll(thenBloop?: string) {
    Animated.timing(viewAllAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setViewAllOpen(false);
      viewAllAnim.setValue(0);
      if (thenBloop) askBloop(thenBloop);
    });
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Background */}
      <LinearGradient
        colors={[colors.background, colors.background, colors.background]}
        locations={[0, 0.48, 1]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, { top: -50,   left: -50,  backgroundColor: `${colors.surfaceRaised}26`, width: 180, height: 180 }]} />
      <View style={[styles.blob, { top: 280,   right: -70, backgroundColor: `${colors.periodColor}18`,  width: 220, height: 220 }]} />
      <View style={[styles.blob, { bottom: 100, left: -40, backgroundColor: `${colors.warning}18`,  width: 200, height: 200 }]} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never" style={styles.scrollView}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Insights</Text>
            <Text style={styles.headerSub}>Your wellness patterns</Text>
            <View style={styles.headerLine}>
              <View style={styles.headerLineDot} />
            </View>
          </View>
          <View style={styles.headerBtns}>
            {/* Filter — opens filter sheet */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open insight filters"
              style={styles.headerIconBtn}
              onPress={openFilter}
            >
              <MaterialCommunityIcons name="tune-variant" size={18} color={C.muted} />
            </Pressable>
            {/* Sparkle — ask Bloop to explain insights */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ask Bloop about insights"
              onPress={() => askBloop("Explain my wellness insights.")}
            >
              <LinearGradient
                colors={[C.terra, C.lavender]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sparkleBtn}
              >
                <MaterialCommunityIcons name="shimmer" size={20} color={C.white} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* ── AI Hero Card ──────────────────────────────────────────────── */}
        <Pressable
          onPress={() => askBloop("My stress and sleep patterns may be influencing my pre-cycle anxiety. Can you explain why this happens and what I can do to ease it?")}
          style={({ pressed }) => [pressed && { opacity: 0.88 }]}
        >
          <LinearGradient
            colors={[C.cardBg, C.surfaceRaised, C.cardBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroLeft}>
              <View style={styles.heroTagRow}>
                <Text style={styles.heroTagStar}>♥</Text>
                <Text style={styles.heroTag}>AI Insight</Text>
              </View>
              <Text style={styles.heroTitle}>
                Your stress and sleep patterns may be influencing your pre-cycle anxiety.
              </Text>
              <Text style={styles.heroSub}>Your body is trying to tell you something. 🌸</Text>
            </View>
            <View style={styles.heroRight}>
              <GlowSphere />
            </View>
          </LinearGradient>
        </Pressable>

        {/* ── Cycle Pattern Card ───────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Your cycle pattern</Text>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Today · Day 18</Text>
            </View>
          </View>

          {/* Wave graph */}
          <View style={styles.graphWrap}>
            <Svg width={GRAPH_W} height={SVG_H}>
              <Defs>
                <SvgGradient id="waveGrad" x1="0" y1="0" x2={GRAPH_W} y2="0" gradientUnits="userSpaceOnUse">
                  <Stop offset="0%"   stopColor={C.lavender} stopOpacity="1" />
                  <Stop offset="45%"  stopColor={C.orange}   stopOpacity="1" />
                  <Stop offset="100%" stopColor={C.pink}      stopOpacity="1" />
                </SvgGradient>
              </Defs>
              {GRAPH_MARKERS.map((m) => {
                const mx = waveX(m.idx);
                const my = waveY(WAVE_DATA[m.idx]);
                return (
                  <SvgLine key={m.idx + "-line"} x1={mx} y1={ICON_CY + ICON_R + 4} x2={mx} y2={my - 6}
                    stroke={C.faint} strokeWidth={1} strokeDasharray="3,3" />
                );
              })}
              <Path d={wavePath} stroke="url(#waveGrad)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {GRAPH_MARKERS.map((m) => {
                const dotColor = m.idx <= 13 ? C.lavender : m.idx <= 17 ? C.orange : C.pink;
                return (
                  <Circle key={m.idx + "-dot"} cx={waveX(m.idx)} cy={waveY(WAVE_DATA[m.idx])} r={5}
                    fill={C.white} stroke={dotColor} strokeWidth={2} />
                );
              })}
            </Svg>
            {GRAPH_MARKERS.map((m) => (
              <View key={m.idx + "-icon"} style={[styles.markerCircle, {
                left: waveX(m.idx) - ICON_R, top: 4, width: ICON_R*2, height: ICON_R*2,
                borderRadius: ICON_R, backgroundColor: m.bg, borderColor: m.border + "40",
              }]}>
                <Text style={styles.markerEmoji}>{m.emoji}</Text>
              </View>
            ))}
          </View>

          {/* Phase legend */}
          <View style={styles.phaseLegend}>
            {[
              { label: "Follicular", color: C.lavender },
              { label: "Ovulation",  color: C.orange   },
              { label: "Luteal",     color: C.pink      },
            ].map((p) => (
              <View key={p.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: p.color }]} />
                <Text style={styles.legendLabel}>{p.label}</Text>
              </View>
            ))}
          </View>

          {/* Key Pattern sub-card — opens detail sheet */}
          <Pressable style={styles.keyPatternCard} onPress={openPattern}>
            <View style={styles.keyPatternIconWrap}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={C.lavender} />
            </View>
            <View style={styles.keyPatternText}>
              <Text style={styles.keyPatternTitle}>Key Pattern</Text>
              <Text style={styles.keyPatternBody}>
                You feel emotionally lower in the 3 days before your period.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.faint} />
          </Pressable>
        </View>

        {/* ── AI Prediction Card ───────────────────────────────────────── */}
        <Pressable
          onPress={() => askBloop("My energy peak may happen in 3 days. How can I prepare my body and make the most of this window?")}
          style={({ pressed }) => [pressed && { opacity: 0.88 }]}
        >
          <LinearGradient
            colors={[C.cardBg, C.surfaceRaised]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.predCard}
          >
            <View style={styles.predLeft}>
              <View style={styles.predIconWrap}>
                <MaterialCommunityIcons name="calendar-month-outline" size={22} color={C.lavender} />
              </View>
              <View style={styles.predText}>
                <View style={styles.predTagRow}>
                  <Text style={styles.predTagStar}>♥</Text>
                  <Text style={styles.predTag}>AI Prediction</Text>
                </View>
                <Text style={styles.predTitle}>Your next energy peak{"\n"}may happen in 3 days.</Text>
              </View>
            </View>
            <View style={styles.predMountains}>
              <Svg width={MTN_W} height={MTN_H}>
                <Path d={mtn1} fill={C.surfaceRaised} />
                <Path d={mtn2} fill={C.navy} />
              </Svg>
            </View>
          </LinearGradient>
        </Pressable>

        {/* ── Today's Top Insight ───────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Top Insight</Text>
          {/* View all — opens insight list sheet */}
          <Pressable onPress={openViewAll}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        <View style={styles.topInsightRow}>
          {/* Sleep */}
          <Pressable
            style={[styles.insightMiniCard, { flex: 1.12 }]}
            onPress={() => askBloop("What did you notice about my sleep this week?")}
          >
            <View style={[styles.insightMiniIcon, { backgroundColor: C.surfaceRaised }]}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={18} color={C.lavender} />
            </View>
            <View>
              <Text style={styles.insightMiniTitle}>Sleep</Text>
              <Text style={[styles.insightMiniValue, { color: C.lavender }]}>Good</Text>
              <Text style={styles.insightMiniSub}>7.2 hrs</Text>
            </View>
          </Pressable>

          {/* Mood */}
          <Pressable
            style={styles.insightMiniCard}
            onPress={() => askBloop("My mood has been calm today. Is this typical for my current cycle phase?")}
          >
            <View style={[styles.insightMiniIcon, { backgroundColor: C.surfaceRaised }]}>
              <MaterialCommunityIcons name="emoticon-happy-outline" size={18} color={C.pink} />
            </View>
            <View>
              <Text style={styles.insightMiniTitle}>Mood</Text>
              <View style={styles.insightMiniValueRow}>
                <Text style={[styles.insightMiniValue, { color: C.pink }]}>Calm</Text>
                <View style={[styles.statusDot, { backgroundColor: C.pink }]} />
              </View>
            </View>
          </Pressable>

          {/* Energy */}
          <Pressable
            style={styles.insightMiniCard}
            onPress={() => askBloop("My energy is high today. How can I make the most of this energy window in my cycle?")}
          >
            <View style={[styles.insightMiniIcon, { backgroundColor: C.surfaceRaised }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={18} color={C.orange} />
            </View>
            <View>
              <Text style={styles.insightMiniTitle}>Energy</Text>
              <View style={styles.insightMiniValueRow}>
                <Text style={[styles.insightMiniValue, { color: C.orange }]}>High</Text>
                <View style={[styles.statusDot, { backgroundColor: C.orange }]} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* ── For your current phase ───────────────────────────────────── */}
        <View style={[styles.card, styles.phaseCard]}>
          <View style={[styles.phaseIconWrap, { backgroundColor: C.surfaceRaised }]}>
            <MaterialCommunityIcons name="sprout-outline" size={22} color={C.sage} />
          </View>
          <View style={styles.phaseText}>
            <Text style={styles.phaseTitle}>For your current phase</Text>
            <Text style={styles.phaseBody}>
              Hydrate more and try a gentle yoga flow to support your energy.
            </Text>
          </View>
          {/* Explore — contextual Bloop action */}
          <Pressable
            style={styles.exploreBtn}
            onPress={() => askBloop("Bloop recommends I hydrate more and try a gentle yoga flow for my current phase. What specific hydration targets and yoga poses would help me most right now?")}
          >
            <Text style={styles.exploreBtnText}>Explore</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={C.sage} />
          </Pressable>
        </View>

        {/* ── Bloop noticed ────────────────────────────────────────────── */}
        <Pressable
          style={[styles.card, styles.bloopCard]}
          onPress={() => askBloop("What did you notice about my sleep this week?")}
        >
          <View style={styles.bloopImageWrap}>
            <CachedImage source={imgBloop} style={styles.bloopImage} />
          </View>
          <View style={styles.bloopText}>
            <Text style={styles.bloopTag}>Bloop noticed</Text>
            <Text style={styles.bloopBody}>Your sleep has improved this week 💜</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={C.faint} />
        </Pressable>
      </ScrollView>

      {/* ── Filter sheet ─────────────────────────────────────────────────────── */}
      {filterOpen && (
        <>
          <Animated.View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, styles.sheetScrim, { opacity: filterOverlay }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeFilter} />
          </Animated.View>
          <Animated.View
            style={[styles.filterSheet, { transform: [{ translateY: filterSlide }] }]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter Insights</Text>
            <Text style={styles.sheetSub}>Focus on what matters to you right now</Text>

            {/* Time range */}
            <Text style={styles.filterGroupLabel}>Time range</Text>
            <View style={styles.filterChipRow}>
              {FILTER_TIME.map(t => (
                <Pressable
                  key={t.id}
                  style={[styles.filterChip, filterTime === t.id && styles.filterChipActive]}
                  onPress={() => setFilterTime(t.id as typeof filterTime)}
                >
                  <Text style={[styles.filterChipText, filterTime === t.id && styles.filterChipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Focus area */}
            <Text style={styles.filterGroupLabel}>Focus area</Text>
            <View style={styles.filterChipRow}>
              {FILTER_AREAS.map(a => (
                <Pressable
                  key={a.id}
                  style={[styles.filterChip, filterArea === a.id && styles.filterChipActive]}
                  onPress={() => setFilterArea(a.id)}
                >
                  <Text style={[styles.filterChipText, filterArea === a.id && styles.filterChipTextActive]}>
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Apply */}
            <Pressable style={styles.filterApplyBtn} onPress={closeFilter}>
              <LinearGradient
                colors={[C.terra, C.lavender]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.filterApplyText}>Apply filter</Text>
            </Pressable>

            <Pressable style={styles.sheetCloseBtn} onPress={closeFilter}>
              <Text style={styles.sheetCloseText}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </>
      )}

      {/* ── Key Pattern detail sheet ──────────────────────────────────────────── */}
      {patternOpen && (
        <>
          <Animated.View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, styles.sheetScrim, { opacity: patternOverlay }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closePattern()} />
          </Animated.View>
          <Animated.View
            style={[styles.patternSheet, { transform: [{ translateY: patternSlide }] }]}
          >
            <View style={styles.sheetHandle} />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Tag row */}
              <View style={styles.patternTagRow}>
                <View style={styles.patternTag}>
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={12} color={C.lavender} />
                  <Text style={styles.patternTagText}>Key Pattern</Text>
                </View>
                <View style={styles.patternCycleTag}>
                  <Text style={styles.patternCycleTagText}>Late luteal phase</Text>
                </View>
              </View>

              <Text style={styles.patternTitle}>{PATTERN_DETAIL.title}</Text>

              {/* What this is */}
              <View style={styles.patternSection}>
                <View style={styles.patternSectionHeader}>
                  <MaterialCommunityIcons name="information-outline" size={14} color={C.muted} />
                  <Text style={styles.patternSectionLabel}>What this is</Text>
                </View>
                <Text style={styles.patternSectionBody}>{PATTERN_DETAIL.what}</Text>
              </View>

              {/* Why it happens */}
              <View style={styles.patternSection}>
                <View style={styles.patternSectionHeader}>
                  <MaterialCommunityIcons name="dna" size={14} color={C.muted} />
                  <Text style={styles.patternSectionLabel}>Why it happens</Text>
                </View>
                <Text style={styles.patternSectionBody}>{PATTERN_DETAIL.why}</Text>
              </View>

              {/* What can help */}
              <View style={styles.patternSection}>
                <View style={styles.patternSectionHeader}>
                  <MaterialCommunityIcons name="sprout-outline" size={14} color={C.sage} />
                  <Text style={[styles.patternSectionLabel, { color: C.sage }]}>What can help</Text>
                </View>
                {PATTERN_DETAIL.helps.map((h, i) => (
                  <View key={i} style={styles.patternHelpRow}>
                    <View style={[styles.patternHelpDot, { backgroundColor: C.lavender }]} />
                    <Text style={styles.patternHelpText}>{h}</Text>
                  </View>
                ))}
              </View>

              {/* Ask Bloop CTA */}
              <Pressable
                style={styles.patternBloopBtn}
                onPress={() => closePattern(PATTERN_DETAIL.bloopMsg)}
              >
                <LinearGradient
                  colors={[C.cardBg, C.surfaceRaised]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <MaterialCommunityIcons name="chat-processing-outline" size={17} color={C.lavender} />
                <Text style={styles.patternBloopText}>Ask Bloop about this pattern</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={C.lavender} />
              </Pressable>

              <Pressable style={styles.sheetCloseBtn} onPress={() => closePattern()}>
                <Text style={styles.sheetCloseText}>Close</Text>
              </Pressable>
              <View style={{ height: 20 }} />
            </ScrollView>
          </Animated.View>
        </>
      )}

      {/* ── View-all insight sheet ────────────────────────────────────────────── */}
      {viewAllOpen && (
        <>
          <Animated.View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, styles.sheetScrim, { opacity: viewAllOverlay }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeViewAll()} />
          </Animated.View>
          <Animated.View
            style={[styles.viewAllSheet, { transform: [{ translateY: viewAllSlide }] }]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.viewAllHeaderRow}>
              <Text style={styles.sheetTitle}>All Insights</Text>
              <View style={styles.viewAllBadge}>
                <Text style={styles.viewAllBadgeText}>4 this week</Text>
              </View>
            </View>
            <Text style={styles.sheetSub}>Your full pattern history, built over time.</Text>

            {INSIGHT_TEASERS.map((item, i) => (
              <Pressable
                key={i}
                style={[styles.viewAllRow, item.locked && styles.viewAllRowLocked]}
                onPress={item.locked
                  ? () => closeViewAll(`Tell me more about this insight: ${item.title}`)
                  : () => closeViewAll(`Tell me more about this insight: ${item.title}`)
                }
              >
                <View style={[styles.viewAllRowIcon, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={styles.viewAllRowText}>
                  <Text style={[styles.viewAllRowTitle, item.locked && { color: C.faint }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.viewAllRowSub}>{item.sub}</Text>
                </View>
                {item.locked
                  ? <MaterialCommunityIcons name="lock-outline" size={16} color={C.faint} />
                  : <MaterialCommunityIcons name="chevron-right" size={18} color={C.faint} />
                }
              </Pressable>
            ))}

            <View style={styles.viewAllMoreBanner}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={16} color={C.lavender} />
              <Text style={styles.viewAllMoreText}>Full history unlocks after 3 tracked cycles</Text>
            </View>

            {/* Bloop summary CTA */}
            <Pressable
              style={styles.viewAllBloopBtn}
              onPress={() => closeViewAll("Give me a summary of my wellness insights from this week and what they mean for my cycle.")}
            >
              <LinearGradient
                colors={[C.cardBg, C.surfaceRaised]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialCommunityIcons name="chat-processing-outline" size={17} color={C.lavender} />
              <Text style={styles.viewAllBloopText}>Ask Bloop for a weekly summary</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={C.lavender} />
            </Pressable>

            <Pressable style={styles.sheetCloseBtn} onPress={() => closeViewAll()}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </Pressable>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { backgroundColor: C.bg1, flex: 1 },
  safeDark: { backgroundColor: C.bg1 },
  scrollView: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: CARD_MX, paddingTop: 8, paddingBottom: 100, flexGrow: 1 },
  blob: { borderRadius: 999, position: "absolute" },

  // Header
  header: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 18, marginTop: 4 },
  headerTitle: { color: C.text, fontFamily: F.luxuryBold, fontSize: 34, letterSpacing: 0.2, lineHeight: 40 },
  headerSub:   { color: C.muted, fontFamily: F.uiRegular, fontSize: 13, marginTop: 1 },
  headerLine:  { alignItems: "center", flexDirection: "row", gap: 4, marginTop: 5 },
  headerLineDot: { backgroundColor: C.terra, borderRadius: 4, height: 5, width: 5 },
  headerBtns: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 8 },
  headerIconBtn: {
    alignItems: "center", backgroundColor: C.cardBg, borderColor: C.cardBdr,
    borderRadius: 20, borderWidth: 1, height: 40, justifyContent: "center",
    shadowColor: C.bg1, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, width: 40,
  },
  sparkleBtn: {
    alignItems: "center", borderRadius: 20, height: 40, justifyContent: "center",
    shadowColor: C.lavender, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 10, width: 40,
  },

  // Hero card
  heroCard: {
    borderColor: C.cardBdr, borderRadius: 24, borderWidth: 1,
    flexDirection: "row", marginBottom: 14, overflow: "hidden", padding: 20,
    shadowColor: C.bg1, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20,
  },
  heroLeft: { flex: 1, justifyContent: "center", paddingRight: 8 },
  heroTagRow: { alignItems: "center", flexDirection: "row", gap: 5, marginBottom: 10 },
  heroTagStar: { color: C.lavender, fontSize: 11 },
  heroTag:  { color: C.lavender, fontFamily: F.uiSemiBold, fontSize: 12, letterSpacing: 0.3 },
  heroTitle: { color: C.text, fontFamily: F.luxuryBold, fontSize: 18, lineHeight: 26, marginBottom: 10 },
  heroSub:  { color: C.muted, fontFamily: F.bodyRegular, fontSize: 13, lineHeight: 18 },
  heroRight: { alignItems: "center", justifyContent: "center", marginRight: -10, marginTop: -10 },

  // Generic card
  card: {
    backgroundColor: C.cardBg, borderColor: C.cardBdr, borderRadius: 24, borderWidth: 1,
    marginBottom: 14, padding: CARD_PX,
    shadowColor: C.bg1, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 18,
  },
  cardHeaderRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  cardTitle: { color: C.text, fontFamily: F.uiBold, fontSize: 15 },
  todayBadge: { backgroundColor: C.surfaceRaised, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  todayBadgeText: { color: C.lavender, fontFamily: F.uiSemiBold, fontSize: 12 },

  // Wave graph
  graphWrap: { height: SVG_H, position: "relative", width: GRAPH_W },
  markerCircle: { alignItems: "center", borderWidth: 1, justifyContent: "center", position: "absolute" },
  markerEmoji: { fontSize: 15, lineHeight: 20 },

  // Phase legend
  phaseLegend: { flexDirection: "row", gap: 18, marginTop: 10, paddingHorizontal: 4 },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 5 },
  legendDot: { borderRadius: 4, height: 8, width: 8 },
  legendLabel: { color: C.muted, fontFamily: F.uiMedium, fontSize: 12 },

  // Key pattern sub-card
  keyPatternCard: {
    alignItems: "center", backgroundColor: C.surfaceRaised, borderColor: C.cardBdr,
    borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 14, padding: 14,
  },
  keyPatternIconWrap: { alignItems: "center", backgroundColor: C.cardBg, borderRadius: 12, height: 38, justifyContent: "center", width: 38 },
  keyPatternText: { flex: 1 },
  keyPatternTitle: { color: C.text, fontFamily: F.uiBold, fontSize: 13, marginBottom: 2 },
  keyPatternBody: { color: C.muted, fontFamily: F.bodyRegular, fontSize: 13, lineHeight: 18 },

  // AI Prediction card
  predCard: {
    alignItems: "center", borderColor: C.cardBdr, borderRadius: 22, borderWidth: 1,
    flexDirection: "row", marginBottom: 18, overflow: "hidden", padding: 16,
  },
  predLeft: { alignItems: "center", flex: 1, flexDirection: "row", gap: 12 },
  predIconWrap: { alignItems: "center", backgroundColor: C.surfaceRaised, borderRadius: 14, height: 48, justifyContent: "center", width: 48 },
  predText: { flex: 1 },
  predTagRow: { alignItems: "center", flexDirection: "row", gap: 4, marginBottom: 4 },
  predTagStar: { color: C.lavender, fontSize: 10 },
  predTag:  { color: C.lavender, fontFamily: F.uiSemiBold, fontSize: 11, letterSpacing: 0.3 },
  predTitle: { color: C.text, fontFamily: F.uiBold, fontSize: 14, lineHeight: 20 },
  predMountains: { alignItems: "flex-end", justifyContent: "flex-end", marginBottom: -16, marginRight: -16 },

  // Section header
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: C.text, fontFamily: F.uiBold, fontSize: 15 },
  viewAll: { color: C.lavender, fontFamily: F.uiSemiBold, fontSize: 12 },

  // Top insight row — now Pressable
  topInsightRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  insightMiniCard: {
    alignItems: "center", backgroundColor: C.cardBg, borderColor: C.cardBdr, borderRadius: 20, borderWidth: 1,
    flex: 1, flexDirection: "row", gap: 10, padding: 12,
    shadowColor: C.bg1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12,
  },
  insightMiniIcon: { alignItems: "center", borderRadius: 14, height: 36, justifyContent: "center", width: 36 },
  insightMiniTitle: { color: C.muted, fontFamily: F.uiMedium, fontSize: 11, marginBottom: 1 },
  insightMiniValue: { fontFamily: F.uiBold, fontSize: 13 },
  insightMiniSub: { color: C.faint, fontFamily: F.uiRegular, fontSize: 10, marginTop: 1 },
  insightMiniValueRow: { alignItems: "center", flexDirection: "row", gap: 4 },
  statusDot: { borderRadius: 4, height: 6, width: 6 },

  // Phase card
  phaseCard: { alignItems: "center", flexDirection: "row", gap: 12 },
  phaseIconWrap: { alignItems: "center", borderRadius: 14, height: 44, justifyContent: "center", width: 44 },
  phaseText: { flex: 1 },
  phaseTitle: { color: C.text, fontFamily: F.uiBold, fontSize: 13, marginBottom: 3 },
  phaseBody: { color: C.muted, fontFamily: F.bodyRegular, fontSize: 13, lineHeight: 18 },
  exploreBtn: {
    alignItems: "center", backgroundColor: C.surfaceRaised, borderColor: C.cardBdr,
    borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 2, paddingHorizontal: 12, paddingVertical: 7,
  },
  exploreBtnText: { color: C.sage, fontFamily: F.uiSemiBold, fontSize: 12 },

  // Bloop card
  bloopCard: { alignItems: "center", flexDirection: "row", gap: 12 },
  bloopImageWrap: { height: 52, width: 52 },
  bloopImage: { borderRadius: 26, height: 52, width: 52 },
  bloopText: { flex: 1 },
  bloopTag:  { color: C.lavender, fontFamily: F.uiSemiBold, fontSize: 12, marginBottom: 3 },
  bloopBody: { color: C.text, fontFamily: F.uiBold, fontSize: 13, lineHeight: 18 },

  // ── Shared sheet primitives ────────────────────────────────────────────────
  sheetScrim: { backgroundColor: `${C.bg1}CC`, zIndex: 40 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: C.surfaceRaised, alignSelf: "center", marginBottom: 18 },
  sheetTitle: { fontFamily: F.luxuryBold, fontSize: 22, color: C.text, letterSpacing: -0.2, marginBottom: 4 },
  sheetSub:   { fontFamily: F.uiRegular, fontSize: 13, color: C.muted, marginBottom: 22, lineHeight: 18 },
  sheetCloseBtn: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 24, marginTop: 6 },
  sheetCloseText: { fontFamily: F.uiMedium, fontSize: 13.5, color: C.muted },

  // ── Filter sheet ───────────────────────────────────────────────────────────
  filterSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    maxWidth: 390, width: "100%", alignSelf: "center", overflow: "hidden",
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: C.cardBdr,
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 14,
    zIndex: 50,
    shadowColor: C.bg1, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 14,
  },
  filterGroupLabel: { fontFamily: F.uiSemiBold, fontSize: 12, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 },
  filterChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 22 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.surfaceRaised, borderWidth: 1, borderColor: C.cardBdr,
  },
  filterChipActive: { backgroundColor: C.navy, borderColor: C.lavender + "55" },
  filterChipText: { fontFamily: F.uiMedium, fontSize: 13, color: C.muted },
  filterChipTextActive: { color: C.lavender, fontFamily: F.uiSemiBold },
  filterApplyBtn: {
    borderRadius: 24, overflow: "hidden", alignItems: "center", justifyContent: "center",
    paddingVertical: 15, marginBottom: 4, marginTop: 4,
  },
  filterApplyText: { fontFamily: F.uiSemiBold, fontSize: 15, color: C.white },

  // ── Key Pattern detail sheet ───────────────────────────────────────────────
  patternSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0, maxHeight: H * 0.86,
    maxWidth: 390, width: "100%", alignSelf: "center", overflow: "hidden",
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: C.cardBdr,
    paddingHorizontal: 24, paddingTop: 14,
    zIndex: 50,
    shadowColor: C.bg1, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 14,
  },
  patternTagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  patternTag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.surfaceRaised, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  patternTagText: { fontFamily: F.uiSemiBold, fontSize: 11.5, color: C.lavender },
  patternCycleTag: {
    backgroundColor: C.surfaceRaised, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  patternCycleTagText: { fontFamily: F.uiSemiBold, fontSize: 11.5, color: C.orange },
  patternTitle: { fontFamily: F.luxuryBold, fontSize: 24, color: C.text, letterSpacing: -0.3, marginBottom: 20, lineHeight: 30 },
  patternSection: { marginBottom: 18 },
  patternSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  patternSectionLabel: { fontFamily: F.uiSemiBold, fontSize: 12, color: C.muted, letterSpacing: 0.4, textTransform: "uppercase" },
  patternSectionBody: { fontFamily: F.bodyRegular, fontSize: 15.5, color: C.text, lineHeight: 24 },
  patternHelpRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 5 },
  patternHelpDot: { width: 6, height: 6, borderRadius: 3, marginTop: 9, flexShrink: 0 },
  patternHelpText: { fontFamily: F.uiRegular, fontSize: 14.5, color: C.text, lineHeight: 22, flex: 1 },
  patternBloopBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 20, borderWidth: 1, borderColor: C.cardBdr,
    paddingHorizontal: 18, paddingVertical: 15,
    overflow: "hidden", marginTop: 4, marginBottom: 4,
  },
  patternBloopText: { flex: 1, fontFamily: F.uiSemiBold, fontSize: 14.5, color: C.lavender },

  // ── View-all insight sheet ─────────────────────────────────────────────────
  viewAllSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    maxWidth: 390, width: "100%", alignSelf: "center", overflow: "hidden",
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: C.cardBdr,
    paddingHorizontal: 24, paddingBottom: 36, paddingTop: 14,
    zIndex: 50,
    shadowColor: C.bg1, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 14,
  },
  viewAllHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  viewAllBadge: { backgroundColor: C.surfaceRaised, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  viewAllBadgeText: { fontFamily: F.uiSemiBold, fontSize: 12, color: C.lavender },
  viewAllRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: C.cardBdr,
  },
  viewAllRowLocked: { opacity: 0.52 },
  viewAllRowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  viewAllRowText: { flex: 1 },
  viewAllRowTitle: { fontFamily: F.uiSemiBold, fontSize: 13.5, color: C.text, marginBottom: 2 },
  viewAllRowSub:   { fontFamily: F.uiRegular,  fontSize: 12, color: C.muted },
  viewAllMoreBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.surfaceRaised, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    marginTop: 12, marginBottom: 16,
  },
  viewAllMoreText: { fontFamily: F.uiMedium, fontSize: 12.5, color: C.lavender, flex: 1 },
  viewAllBloopBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 20, borderWidth: 1, borderColor: C.cardBdr,
    paddingHorizontal: 18, paddingVertical: 15,
    overflow: "hidden", marginBottom: 4,
  },
  viewAllBloopText: { flex: 1, fontFamily: F.uiSemiBold, fontSize: 14.5, color: C.lavender },
});
