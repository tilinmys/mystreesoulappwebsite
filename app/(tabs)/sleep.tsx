import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
  Svg,
  Line,
  Rect,
} from "react-native-svg";
import { F } from "../../constants/fonts";

// ── Dimensions ────────────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const GRAPH_W = W - 80;
const GRAPH_H = 88;

// ── Theme palettes ────────────────────────────────────────────────────────────
const DARK = {
  bg:         ["#1A162B", "#1F1A36", "#29224A"] as const,
  surface:    "rgba(255,255,255,0.07)",
  surfaceHi:  "rgba(255,255,255,0.11)",
  border:     "rgba(255,255,255,0.13)",
  text:       "#FDF5F2",
  subtext:    "#9C94B8",
  faint:      "rgba(255,255,255,0.28)",
  accent:     "#8A56D8",
  accentSoft: "#A478E8",
  peach:      "#F4A898",
  glow:       "rgba(138,86,216,0.35)",
  insightBg:  ["#2F2552", "#3B2D62"] as const,
  cardDeep:   "#231E3A",
  moon:       "#C4B8F0",
  starColor:  "rgba(255,255,255,0.65)",
  safeEdge:   "transparent" as const,
};

const LIGHT = {
  bg:         ["#F5F0FF", "#EDE5FF", "#E6DCFF"] as const,
  surface:    "rgba(255,255,255,0.80)",
  surfaceHi:  "rgba(255,255,255,0.92)",
  border:     "rgba(180,160,230,0.30)",
  text:       "#2D2544",
  subtext:    "#7B6FA8",
  faint:      "rgba(45,37,68,0.35)",
  accent:     "#7B52C8",
  accentSoft: "#9B7EC8",
  peach:      "#E07A5F",
  glow:       "rgba(123,82,200,0.18)",
  insightBg:  ["#EAE0FF", "#F0E8FF"] as const,
  cardDeep:   "#F0E8FF",
  moon:       "#9B82C8",
  starColor:  "rgba(123,82,200,0.5)",
  safeEdge:   "transparent" as const,
};

// ── Sleep graph data (depth 0–100, higher = deeper sleep) ────────────────────
const SLEEP_PTS = [
  { t: 0.00,  d: 8  },  // 10 PM
  { t: 0.19,  d: 72 },  // 11:30 PM
  { t: 0.38,  d: 88 },  // 1 AM
  { t: 0.50,  d: 100},  // 2 AM  ← deepest
  { t: 0.69,  d: 58 },  // 3:30 AM
  { t: 0.81,  d: 38 },  // 4:30 AM
  { t: 1.00,  d: 6  },  // 6 AM
];

const PAD_Y = 10;
function toPx(pt: { t: number; d: number }) {
  return {
    x: pt.t * GRAPH_W,
    y: GRAPH_H - PAD_Y - (pt.d / 100) * (GRAPH_H - PAD_Y * 2),
  };
}

function buildSleepPath() {
  const pts = SLEEP_PTS.map(toPx);
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Deepest point: t=0.50
const DEEP_PT  = toPx({ t: 0.50, d: 100 });

// ── Recovery card data ────────────────────────────────────────────────────────
const RECOVERY = [
  { id: "breath", title: "Calm\nBreathing",      duration: "5 min",  icon: "refresh",                color: "#A478E8" },
  { id: "audio",  title: "Deep Sleep\nAudio",    duration: "20 min", icon: "music-note",              color: "#82B5B2" },
  { id: "pms",    title: "PMS Sleep\nRecovery",  duration: "15 min", icon: "heart-outline",           color: "#F4A898" },
  { id: "stress", title: "Stress\nReset",        duration: "10 min", icon: "leaf",                    color: "#9BBF9E" },
];

// ── Gentle support data ───────────────────────────────────────────────────────
const SUPPORT = [
  { id: "tea",    label: "Calm Tea",      icon: "tea-outline",    color: "#9BBF9E" },
  { id: "mag",    label: "Magnesium",     icon: "leaf",           color: "#82B5B2" },
  { id: "screen", label: "Reduce Screen", icon: "cellphone-off",  color: "#F4A898" },
  { id: "str",    label: "Night Stretch", icon: "human-handsup",  color: "#A478E8" },
];

// ── SVG Sleeping Mascot ───────────────────────────────────────────────────────
function SleepingMascot({ dark }: { dark: boolean }) {
  const T = dark ? DARK : LIGHT;
  return (
    <View style={styles.mascotWrap}>
      <Svg width={148} height={148} viewBox="0 0 148 148">
        <Defs>
          <SvgRadialGradient id="mascGlow" cx="50%" cy="60%" r="55%">
            <Stop offset="0"   stopColor="#C4A0FF" stopOpacity={dark ? "0.40" : "0.25"} />
            <Stop offset="0.6" stopColor="#8A56D8" stopOpacity={dark ? "0.18" : "0.10"} />
            <Stop offset="1"   stopColor="#8A56D8" stopOpacity="0" />
          </SvgRadialGradient>
          <SvgGradient id="bodyGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0"   stopColor="#B090F0" stopOpacity="1" />
            <Stop offset="0.45" stopColor="#8A56D8" stopOpacity="1" />
            <Stop offset="1"   stopColor="#6641B0" stopOpacity="1" />
          </SvgGradient>
          <SvgGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor={dark ? "#5A4480" : "#C4A8E8"} stopOpacity="1" />
            <Stop offset="1"   stopColor={dark ? "#3E2E64" : "#A888D0"} stopOpacity="1" />
          </SvgGradient>
          <SvgRadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0"   stopColor="#FFD98E" stopOpacity="0.60" />
            <Stop offset="1"   stopColor="#FFD98E" stopOpacity="0"   />
          </SvgRadialGradient>
          {/* Body highlight */}
          <SvgRadialGradient id="bodyShine" cx="35%" cy="28%" r="45%">
            <Stop offset="0" stopColor="rgba(255,255,255,0.28)" stopOpacity="1" />
            <Stop offset="1" stopColor="rgba(255,255,255,0)"    stopOpacity="1" />
          </SvgRadialGradient>
        </Defs>

        {/* Ambient glow halo */}
        <Ellipse cx="74" cy="88" rx="52" ry="44" fill="url(#mascGlow)" />

        {/* Moon glow top-right */}
        <Circle cx="112" cy="22" r="22" fill="url(#moonGlow)" />
        <Path
          d="M 112 12 C 106 12, 100 17, 100 24 C 100 31, 106 36, 113 35 C 108 32, 105 28, 105 24 C 105 18, 108 14, 113 12 Z"
          fill="#FFD98E"
          opacity={dark ? "0.75" : "0.55"}
        />

        {/* Stars */}
        <Circle cx="24"  cy="18" r="1.8" fill={T.starColor} />
        <Circle cx="38"  cy="30" r="1.2" fill={T.starColor} />
        <Circle cx="128" cy="44" r="1.5" fill={T.starColor} />
        <Circle cx="18"  cy="54" r="1"   fill={T.starColor} />
        <Path d="M 30 46 L 31.4 50.2 L 35.8 50.2 L 32.2 52.6 L 33.6 56.8 L 30 54.4 L 26.4 56.8 L 27.8 52.6 L 24.2 50.2 L 28.6 50.2 Z"
              fill={T.starColor} transform="scale(0.5) translate(30, 30)" opacity="0.5" />

        {/* Body blob — organic rounded shape */}
        <Path
          d="M 74 28
             C 94 26, 106 38, 108 56
             C 110 72, 104 86, 94 94
             C 86 100, 74 102, 62 98
             C 50 94, 40 84, 40 68
             C 40 52, 50 30, 74 28 Z"
          fill="url(#bodyGrad)"
        />
        {/* Body highlight */}
        <Path
          d="M 74 28
             C 94 26, 106 38, 108 56
             C 110 72, 104 86, 94 94
             C 86 100, 74 102, 62 98
             C 50 94, 40 84, 40 68
             C 40 52, 50 30, 74 28 Z"
          fill="url(#bodyShine)"
        />

        {/* Cheeks */}
        <Ellipse cx="58" cy="72" rx="8" ry="5" fill="rgba(255,160,160,0.28)" />
        <Ellipse cx="90" cy="72" rx="8" ry="5" fill="rgba(255,160,160,0.28)" />

        {/* Eyes — closed peaceful arcs */}
        <Path d="M 63 60 C 65 56, 69 56, 71 60" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <Path d="M 77 60 C 79 56, 83 56, 85 60" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" fill="none" strokeLinecap="round" />

        {/* Tiny smile */}
        <Path d="M 70 70 C 72 73, 76 73, 78 70" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* Right arm curling under */}
        <Path
          d="M 104 70 C 110 68, 116 72, 112 80 C 110 84, 104 84, 100 82"
          stroke="#9268CC"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 104 70 C 110 68, 116 72, 112 80 C 110 84, 104 84, 100 82"
          stroke="#A880E0"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Cloud 1 — back left */}
        <Ellipse cx="46"  cy="104" rx="22" ry="14" fill="url(#cloudGrad)" opacity="0.7" />
        {/* Cloud 2 — back center */}
        <Ellipse cx="74"  cy="110" rx="28" ry="16" fill="url(#cloudGrad)" opacity="0.85" />
        {/* Cloud 3 — back right */}
        <Ellipse cx="102" cy="106" rx="24" ry="14" fill="url(#cloudGrad)" opacity="0.7" />
        {/* Cloud 4 — front center (fluffy) */}
        <Ellipse cx="60"  cy="118" rx="18" ry="11" fill="url(#cloudGrad)" />
        <Ellipse cx="86"  cy="120" rx="20" ry="12" fill="url(#cloudGrad)" />
        <Ellipse cx="74"  cy="124" rx="30" ry="10" fill="url(#cloudGrad)" opacity="0.9" />

        {/* Zzz floating */}
        <Path d="M 22 38 L 30 38 L 22 48 L 30 48" stroke={T.accentSoft} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <Path d="M 14 25 L 20 25 L 14 33 L 20 33" stroke={T.accentSoft} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
      </Svg>
    </View>
  );
}

// ── Sleep Rhythm Graph ────────────────────────────────────────────────────────
function SleepGraph({ dark }: { dark: boolean }) {
  const T    = dark ? DARK : LIGHT;
  const path = buildSleepPath();

  return (
    <View style={{ position: "relative", height: GRAPH_H }}>
      <Svg width={GRAPH_W} height={GRAPH_H} viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}>
        <Defs>
          <SvgGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0"    stopColor={dark ? "#F4A898" : "#E07A5F"} stopOpacity="1" />
            <Stop offset="0.5"  stopColor="#C4A0F8"                      stopOpacity="1" />
            <Stop offset="1"    stopColor={T.accent}                     stopOpacity="1" />
          </SvgGradient>
          <SvgGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={T.accent} stopOpacity={dark ? "0.22" : "0.12"} />
            <Stop offset="1" stopColor={T.accent} stopOpacity="0" />
          </SvgGradient>
          <SvgRadialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0"   stopColor="#FFD98E" stopOpacity="0.9" />
            <Stop offset="0.5" stopColor="#F4C060" stopOpacity="0.4" />
            <Stop offset="1"   stopColor="#F4C060" stopOpacity="0"   />
          </SvgRadialGradient>
        </Defs>

        {/* Filled area under curve */}
        <Path
          d={`${path} L ${GRAPH_W} ${GRAPH_H} L 0 ${GRAPH_H} Z`}
          fill="url(#fillGrad)"
        />

        {/* The curve */}
        <Path
          d={path}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Glow halo around marker */}
        <Circle cx={DEEP_PT.x} cy={DEEP_PT.y} r={14} fill="url(#dotGlow)" />
        {/* Outer ring */}
        <Circle cx={DEEP_PT.x} cy={DEEP_PT.y} r={7} fill="none" stroke="#FFD98E" strokeWidth="1.5" opacity="0.55" />
        {/* Inner dot */}
        <Circle cx={DEEP_PT.x} cy={DEEP_PT.y} r={4.5} fill="#FFD98E" />
        <Circle cx={DEEP_PT.x} cy={DEEP_PT.y} r={2}   fill="#FFFFFF" opacity="0.9" />
      </Svg>
    </View>
  );
}

// ── Insight Orb SVG ───────────────────────────────────────────────────────────
function InsightOrb({ dark }: { dark: boolean }) {
  const T = dark ? DARK : LIGHT;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 36; i++) {
    const x = (i / 36) * 56;
    const y = 28 + Math.sin((i / 36) * Math.PI * 3.5) * 10;
    pts.push({ x, y });
  }
  const wavePath = "M " + pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");

  return (
    <Svg width={56} height={56} viewBox="0 0 56 56">
      <Defs>
        <SvgRadialGradient id="orbFill" cx="50%" cy="50%" r="50%">
          <Stop offset="0"   stopColor={T.accent}     stopOpacity={dark ? "0.35" : "0.20"} />
          <Stop offset="0.7" stopColor={T.accent}     stopOpacity={dark ? "0.12" : "0.07"} />
          <Stop offset="1"   stopColor={T.accent}     stopOpacity="0" />
        </SvgRadialGradient>
      </Defs>
      {/* Glow ring */}
      <Circle cx="28" cy="28" r="26" fill="url(#orbFill)" />
      <Circle cx="28" cy="28" r="24" fill="none" stroke={T.accent} strokeWidth="1" opacity="0.45" />
      {/* Inner ring */}
      <Circle cx="28" cy="28" r="20" fill="none" stroke={T.accent} strokeWidth="0.5" opacity={dark ? "0.3" : "0.2"} />
      {/* Sine wave */}
      <Path
        d={wavePath}
        fill="none"
        stroke={T.accentSoft}
        strokeWidth="1.8"
        strokeLinecap="round"
        clipPath={`url(#orbClip)`}
        opacity={dark ? "0.7" : "0.55"}
      />
    </Svg>
  );
}

// ── Static waveform for audio player ────────────────────────────────────────
function AudioWaveform({ dark }: { dark: boolean }) {
  const T = dark ? DARK : LIGHT;
  const bars = [4,7,12,18,14,22,28,22,18,30,24,18,14,22,28,22,14,10,7,4];
  const bw = 3, gap = 2, total = bars.length * (bw + gap);
  const mid = 18;

  return (
    <Svg width={total} height={36} viewBox={`0 0 ${total} 36`}>
      <Defs>
        <SvgGradient id="waveG" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0"   stopColor={T.accent}     stopOpacity="0.4" />
          <Stop offset="0.5" stopColor={T.accentSoft} stopOpacity="0.8" />
          <Stop offset="1"   stopColor={T.accent}     stopOpacity="0.4" />
        </SvgGradient>
      </Defs>
      {bars.map((h, i) => (
        <Rect
          key={i}
          x={i * (bw + gap)}
          y={mid - h / 2}
          width={bw}
          height={h}
          rx={1.5}
          fill="url(#waveG)"
        />
      ))}
    </Svg>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function SleepScreen() {
  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;

  return (
    <LinearGradient colors={[...T.bg]} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={[styles.headerTitle, { color: T.text }]}>Sleep & Recovery</Text>
                <Text style={{ fontSize: 14 }}>✦</Text>
              </View>
              <Text style={[styles.headerSub, { color: T.subtext }]}>Your body heals through rest</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Theme toggle */}
            <View style={[styles.themeToggle, { backgroundColor: dark ? "rgba(255,255,255,0.10)" : "rgba(123,82,200,0.12)", borderColor: T.border }]}>
              <MaterialCommunityIcons name={dark ? "moon-waning-crescent" : "white-balance-sunny"} size={13} color={T.subtext} />
              <Switch
                value={dark}
                onValueChange={setDark}
                trackColor={{ false: "rgba(123,82,200,0.3)", true: "rgba(138,86,216,0.5)" }}
                thumbColor={dark ? T.accent : "#9B7EC8"}
                ios_backgroundColor="rgba(123,82,200,0.25)"
                style={{ transform: [{ scaleX: 0.72 }, { scaleY: 0.72 }] }}
              />
              <MaterialCommunityIcons name={dark ? "white-balance-sunny" : "moon-waning-crescent"} size={13} color={T.subtext} />
            </View>

            <Pressable style={[styles.headerBtn, { backgroundColor: T.surface, borderColor: T.border }]}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={17} color={T.moon} />
            </Pressable>
            <Pressable style={[styles.headerBtn, { backgroundColor: T.surface, borderColor: T.border }]}>
              <MaterialCommunityIcons name="tune-variant" size={17} color={T.subtext} />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Hero banner ─────────────────────────────────────────────── */}
          <View style={[styles.heroCard, { backgroundColor: T.surface, borderColor: T.border }]}>
            {/* Dark mode inner glow */}
            {dark && (
              <View style={styles.heroInnerGlow} pointerEvents="none" />
            )}
            <View style={styles.heroLeft}>
              <Text style={[styles.heroText, { color: T.text }]}>
                Your body may need{" "}
                <Text style={[styles.heroHighlight, { color: T.peach }]}>deeper recovery</Text>
                {" "}tonight.
              </Text>
              <Pressable style={[styles.heroBtn, { backgroundColor: dark ? "rgba(255,255,255,0.12)" : "rgba(123,82,200,0.14)", borderColor: T.border }]}>
                <MaterialCommunityIcons name="moon-waning-crescent" size={13} color={T.moon} />
                <Text style={[styles.heroBtnText, { color: T.text }]}>Deep Rest</Text>
              </Pressable>
            </View>
            <SleepingMascot dark={dark} />
          </View>

          {/* ── Sleep rhythm graph ───────────────────────────────────────── */}
          <View style={[styles.graphCard, { backgroundColor: T.surface, borderColor: T.border }]}>
            <View style={styles.graphHeader}>
              <Text style={[styles.cardTitle, { color: T.text }]}>Your Sleep Rhythm</Text>
              <Text style={{ color: T.accent, fontSize: 14, marginTop: 1 }}> ✦</Text>
            </View>
            <View style={styles.graphRow}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={16} color={T.subtext} style={{ marginRight: 8, marginTop: 36 }} />
              <SleepGraph dark={dark} />
              <MaterialCommunityIcons name="white-balance-sunny" size={16} color={T.subtext} style={{ marginLeft: 8, marginTop: 36 }} />
            </View>
            <View style={styles.graphLabels}>
              <Text style={[styles.graphLabel, { color: T.subtext }]}>10 PM</Text>
              <Text style={[styles.graphLabel, { color: T.subtext }]}>2 AM</Text>
              <Text style={[styles.graphLabel, { color: T.subtext }]}>6 AM</Text>
            </View>
          </View>

          {/* ── Recovery for tonight ─────────────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.cardTitle, { color: T.text }]}>Recovery for Tonight</Text>
            <MaterialCommunityIcons name="moon-waning-crescent" size={15} color={T.moon} style={{ marginLeft: 6, marginTop: 2 }} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recoveryScroll}
          >
            {RECOVERY.map(item => (
              <Pressable
                key={item.id}
                style={[styles.recoveryCard, { backgroundColor: T.surface, borderColor: T.border }]}
              >
                <View style={[styles.recoveryIcon, { backgroundColor: item.color + (dark ? "22" : "18") }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={[styles.recoveryTitle, { color: T.text }]}>{item.title}</Text>
                <Text style={[styles.recoveryDur, { color: T.subtext }]}>{item.duration}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* ── Insight banner ───────────────────────────────────────────── */}
          <Pressable style={[styles.insightCard, { borderColor: T.border }]}>
            <LinearGradient
              colors={[...T.insightBg]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <InsightOrb dark={dark} />
            <View style={styles.insightText}>
              <Text style={[styles.insightTitle, { color: T.text }]}>
                Stress may be affecting your sleep rhythm.
              </Text>
              <Text style={[styles.insightBody, { color: T.subtext }]}>
                Let's calm your nervous system.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={T.faint} />
          </Pressable>

          {/* ── Tonight's gentle support ─────────────────────────────────── */}
          <Text style={[styles.cardTitle, { color: T.text, paddingHorizontal: 20, marginTop: 24, marginBottom: 14 }]}>
            Tonight's Gentle Support
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.supportScroll}
          >
            {SUPPORT.map(item => (
              <Pressable key={item.id} style={styles.supportItem}>
                <View style={[styles.supportCircle, { backgroundColor: T.surface, borderColor: T.border }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={[styles.supportLabel, { color: T.subtext }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* ── Audio player pill ─────────────────────────────────────────── */}
          <View style={[styles.audioPill, { backgroundColor: T.surface, borderColor: T.border }]}>
            {/* Moon icon circle */}
            <LinearGradient
              colors={[T.accentSoft, T.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.audioIconCircle}
            >
              <MaterialCommunityIcons name="moon-waning-crescent" size={18} color="#FFFFFF" />
            </LinearGradient>

            <View style={styles.audioInfo}>
              <Text style={[styles.audioTitle, { color: T.text }]}>Peaceful Night</Text>
              <Text style={[styles.audioSub, { color: T.subtext }]}>Sleep Sound</Text>
            </View>

            <View style={styles.audioWave}>
              <AudioWaveform dark={dark} />
            </View>

            <Pressable style={[styles.audioPlay, { backgroundColor: dark ? "rgba(255,255,255,0.92)" : "#7B52C8" }]}>
              <MaterialCommunityIcons
                name="play"
                size={18}
                color={dark ? T.accent : "#FFFFFF"}
                style={{ marginLeft: 2 }}
              />
            </Pressable>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 26,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontFamily: F.uiRegular,
    fontSize: 12.5,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    gap: 2,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  scroll: { paddingTop: 4 },

  // Hero
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingRight: 0,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#0F0A1E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  heroInnerGlow: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(138,86,216,0.12)",
  },
  heroLeft: {
    flex: 1,
    paddingRight: 8,
  },
  heroText: {
    fontFamily: F.luxuryBold,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 14,
  },
  heroHighlight: {
    fontFamily: F.luxuryItalic,
    fontSize: 18,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  heroBtnText: {
    fontFamily: F.uiSemiBold,
    fontSize: 13,
  },
  mascotWrap: {
    width: 148,
    height: 148,
  },

  // Graph
  graphCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F0A1E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 5,
  },
  graphHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  graphRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  graphLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 24,
  },
  graphLabel: {
    fontFamily: F.uiMedium,
    fontSize: 11,
  },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 8,
  },
  cardTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 17,
    letterSpacing: -0.1,
  },

  // Recovery cards
  recoveryScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  recoveryCard: {
    width: 104,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
    shadowColor: "#0F0A1E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  recoveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  recoveryTitle: {
    fontFamily: F.uiSemiBold,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  recoveryDur: {
    fontFamily: F.uiRegular,
    fontSize: 11,
  },

  // Insight banner
  insightCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    shadowColor: "#0F0A1E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 14,
    marginBottom: 4,
  },
  insightText: { flex: 1 },
  insightTitle: {
    fontFamily: F.uiSemiBold,
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 3,
  },
  insightBody: {
    fontFamily: F.uiRegular,
    fontSize: 12.5,
  },

  // Support
  supportScroll: {
    paddingHorizontal: 20,
    gap: 22,
  },
  supportItem: {
    alignItems: "center",
    gap: 8,
  },
  supportCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#0F0A1E",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  supportLabel: {
    fontFamily: F.uiMedium,
    fontSize: 11.5,
    textAlign: "center",
    maxWidth: 68,
  },

  // Audio player
  audioPill: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 40,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingRight: 8,
    gap: 10,
    shadowColor: "#0F0A1E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 5,
  },
  audioIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  audioInfo: { gap: 1 },
  audioTitle: {
    fontFamily: F.uiSemiBold,
    fontSize: 13.5,
  },
  audioSub: {
    fontFamily: F.uiRegular,
    fontSize: 11.5,
  },
  audioWave: {
    flex: 1,
    alignItems: "center",
  },
  audioPlay: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
