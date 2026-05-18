import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { DailyLogSheet } from "../../components/cycle/DailyLogSheet";
import {
  Dimensions,
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
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Svg,
  Line,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";

// ── Assets ────────────────────────────────────────────────────────────────────
const imgCycleCenter = require("../../public/images/bloop-cycle.webp");
const imgPetals      = require("../../public/images/fertility-glow-visual.webp");
const imgBloop       = require("../../public/images/bloop-calm.webp");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg1:         "#FFF0E6",
  bg2:         "#FDE4F2",
  bg3:         "#F4E5FA",
  text:        "#1C1528",
  muted:       "#8A7A9A",
  faint:       "#C4B8D4",
  terracotta:  "#E07A5F",
  lavender:    "#9277C8",
  pink:        "#D45C82",
  gold:        "#C9A040",
  sage:        "#5E9B6B",
  peach:       "#F4A261",
  navy:        "#3D4B7C",
  white:       "#FFFFFF",
  cardBg:      "rgba(255,255,255,0.72)",
  cardBorder:  "rgba(255,255,255,0.88)",
} as const;

// ── Cycle data ────────────────────────────────────────────────────────────────
const CURRENT_DAY   = 18;
const CYCLE_LENGTH  = 28;
const OVULATION_DAY = 21;

const ESTROGEN_DATA    = [10,12,15,20,25,32,40,52,62,72,80,85,82,78,75,78,82,88,90,88,85,72,55,45,55,65,50,30];
const PROGESTERONE_DATA= [5,5,5,6,6,7,7,8,8,9,10,10,10,12,14,18,22,28,32,38,52,68,78,82,80,72,55,30];
const LH_DATA          = [8,8,9,10,10,12,14,16,18,20,22,24,28,32,38,48,62,78,88,92,95,72,35,20,15,12,10,8];

// ── Ring geometry ─────────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const RING_SIZE = W - 48;
const CX = RING_SIZE / 2;
const CY = RING_SIZE / 2;
const R  = RING_SIZE * 0.345;
const SW = 22;

// ── SVG helpers ───────────────────────────────────────────────────────────────
function toRad(deg: number) { return (deg * Math.PI) / 180; }

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const sweep = (endDeg - startDeg + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function buildPath(data: number[], w: number, h: number): string {
  const n = data.length;
  const xStep = w / (n - 1);
  const pad = 6;
  const pts = data.map((v, i) => ({
    x: i * xStep,
    y: h - pad - (v / 100) * (h - pad * 2),
  }));
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

// Phase arc definitions (startDeg, endDeg from -90° top)
// Menstruation: day 1-5  → 0° to 64.3°  (from -90: -90 to -25.7)
// Follicular:   day 6-13 → 64.3° to 141.4° (includes ovulation window)
// Ovulation:    day 14-16→ 154.3° to 180°
// Luteal:       day 17-28→ 180° to 360°/-90°

const PHASE_ARCS = [
  { id: "menstru",    start: -90,   end: -24,   gradId: "gMen",  label: "Menstruation", labelAngle: -57 },
  { id: "follicular", start: -24,   end:  90,   gradId: "gFol",  label: "Follicular",   labelAngle:  33 },
  { id: "ovulation",  start:  90,   end: 153,   gradId: "gOvu",  label: "Ovulation",    labelAngle: 121 },
  { id: "luteal",     start:  153,  end: 270,   gradId: "gLut",  label: "Luteal",       labelAngle: 211 },
];

const CURRENT_ANGLE = -90 + (CURRENT_DAY / CYCLE_LENGTH) * 360; // ~141.4°

// ── Phase label position helper ───────────────────────────────────────────────
function phasePos(angleDeg: number, r: number, cx: number, cy: number) {
  return {
    x: cx + r * Math.cos(toRad(angleDeg)),
    y: cy + r * Math.sin(toRad(angleDeg)),
  };
}

// ── Metric cards data ─────────────────────────────────────────────────────────
const METRICS = [
  { key: "mood",   label: "Mood",   value: "Calm",   pct: 0.72, icon: "emoticon-happy-outline",  color: C.lavender, bg: "rgba(146,119,200,0.12)" },
  { key: "energy", label: "Energy", value: "High",   pct: 0.80, icon: "lightning-bolt",           color: C.peach,    bg: "rgba(244,162,97,0.12)"  },
  { key: "sleep",  label: "Sleep",  value: "Good",   pct: 0.65, icon: "moon-waning-crescent",     color: C.navy,     bg: "rgba(61,75,124,0.12)"   },
  { key: "flow",   label: "Flow",   value: "Light",  pct: 0.30, icon: "water-outline",            color: C.pink,     bg: "rgba(212,92,130,0.12)"  },
];

// ── Log actions ───────────────────────────────────────────────────────────────
const LOG_ACTIONS = [
  { key: "mood",     label: "Mood",     icon: "emoticon-outline" as const,       color: C.lavender },
  { key: "flow",     label: "Flow",     icon: "water-outline" as const,          color: C.pink     },
  { key: "symptom",  label: "Symptom",  icon: "pill" as const,                   color: C.peach    },
  { key: "sleep",    label: "Sleep",    icon: "sleep" as const,                  color: C.navy     },
  { key: "note",     label: "Note",     icon: "pencil-outline" as const,         color: C.sage     },
];

// ── Graph width ───────────────────────────────────────────────────────────────
const GRAPH_W = W - 64;
const GRAPH_H = 90;
const TODAY_X = ((CURRENT_DAY - 1) / (CYCLE_LENGTH - 1)) * GRAPH_W;

// ─────────────────────────────────────────────────────────────────────────────
export default function CycleScreen() {
  const router = useRouter();
  const [activeGraph,  setActiveGraph]  = useState<"all" | "estrogen" | "progesterone" | "lh">("all");
  const [logSheetOpen, setLogSheetOpen] = useState(false);

  const dotX = CX + R * Math.cos(toRad(CURRENT_ANGLE));
  const dotY = CY + R * Math.sin(toRad(CURRENT_ANGLE));

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      {/* ── Background ────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={[C.bg1, C.bg2, C.bg3]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, { top: -60,  left: -60,  backgroundColor: "rgba(224,122,95,0.10)", width: 200, height: 200 }]} />
      <View style={[styles.blob, { top: 200,  right: -80, backgroundColor: "rgba(212,92,130,0.08)", width: 240, height: 240 }]} />
      <View style={[styles.blob, { bottom: 120, left: -40, backgroundColor: "rgba(146,119,200,0.09)", width: 220, height: 220 }]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Your Cycle</Text>
            <View style={styles.headerSubRow}>
              <View style={styles.headerDot} />
              <Text style={styles.headerSub}>Day {CURRENT_DAY} · Follicular Phase</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => router.push("/notifications" as any)}
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color={C.text} />
              <View style={styles.bellBadge} />
            </Pressable>
            <Pressable style={styles.logBtn} onPress={() => setLogSheetOpen(true)}>
              <MaterialCommunityIcons name="plus" size={16} color={C.white} />
              <Text style={styles.logBtnText}>Log today</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Cycle Ring Hero ──────────────────────────────────────────────── */}
        <View style={styles.ringCard}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Defs>
              {/* Phase gradients */}
              <SvgGradient id="gMen" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#E07A5F" stopOpacity="1" />
                <Stop offset="1" stopColor="#D45C82" stopOpacity="1" />
              </SvgGradient>
              <SvgGradient id="gFol" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#F4A261" stopOpacity="1" />
                <Stop offset="1" stopColor="#C9A040" stopOpacity="1" />
              </SvgGradient>
              <SvgGradient id="gOvu" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#5E9B6B" stopOpacity="1" />
                <Stop offset="1" stopColor="#81C784" stopOpacity="1" />
              </SvgGradient>
              <SvgGradient id="gLut" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#9277C8" stopOpacity="1" />
                <Stop offset="1" stopColor="#B39DDB" stopOpacity="1" />
              </SvgGradient>
              {/* Progress glow */}
              <SvgGradient id="gProgress" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#F4A261" stopOpacity="1" />
                <Stop offset="1" stopColor="#9277C8" stopOpacity="1" />
              </SvgGradient>
            </Defs>

            {/* Track ring */}
            <Circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="rgba(196,184,212,0.20)"
              strokeWidth={SW + 2}
            />

            {/* Phase arcs */}
            {PHASE_ARCS.map((arc) => (
              <Path
                key={arc.id}
                d={describeArc(CX, CY, R, arc.start + 2, arc.end - 2)}
                stroke={`url(#${arc.gradId})`}
                strokeWidth={SW}
                fill="none"
                strokeLinecap="round"
              />
            ))}

            {/* Progress overlay arc (semi-transparent white overlay to dim future) */}
            <Path
              d={describeArc(CX, CY, R, CURRENT_ANGLE + 4, 270 - 1)}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={SW + 4}
              fill="none"
              strokeLinecap="butt"
            />

            {/* Phase label markers (small dots on track) */}
            {PHASE_ARCS.map((arc) => {
              const pos = phasePos(arc.labelAngle, R + SW / 2 + 14, CX, CY);
              return (
                <Circle
                  key={arc.id + "-dot"}
                  cx={pos.x}
                  cy={pos.y}
                  r={3}
                  fill={arc.id === "menstru" ? "#E07A5F"
                      : arc.id === "follicular" ? "#C9A040"
                      : arc.id === "ovulation" ? "#5E9B6B"
                      : "#9277C8"}
                />
              );
            })}

            {/* Inner soft ring */}
            <Circle
              cx={CX}
              cy={CY}
              r={R - SW / 2 - 6}
              fill="none"
              stroke="rgba(212,184,200,0.14)"
              strokeWidth={1}
            />

            {/* Current-day dot */}
            <Circle
              cx={dotX}
              cy={dotY}
              r={10}
              fill="rgba(255,255,255,0.9)"
              stroke="#E07A5F"
              strokeWidth={2.5}
            />
            <Circle
              cx={dotX}
              cy={dotY}
              r={5}
              fill="#E07A5F"
            />
          </Svg>

          {/* Center content (absolute overlay) */}
          <View style={[styles.ringCenter, { width: (R - SW / 2 - 14) * 2, height: (R - SW / 2 - 14) * 2, borderRadius: R - SW / 2 - 14 }]}>
            <CachedImage source={imgCycleCenter} style={styles.ringCenterImage} />
            <View style={styles.ringCenterOverlay}>
              <Text style={styles.ringDayNum}>Day {CURRENT_DAY}</Text>
              <Text style={styles.ringPhaseName}>Follicular</Text>
              <View style={styles.ringCountdown}>
                <MaterialCommunityIcons name="circle-medium" size={10} color="#5E9B6B" />
                <Text style={styles.ringCountdownText}>{OVULATION_DAY - CURRENT_DAY}d to Ovulation</Text>
              </View>
            </View>
          </View>

          {/* Phase legend pills */}
          <View style={styles.phaseLegend}>
            {[
              { label: "Period",      color: "#E07A5F" },
              { label: "Follicular",  color: "#C9A040" },
              { label: "Ovulation",   color: "#5E9B6B" },
              { label: "Luteal",      color: "#9277C8" },
            ].map((p) => (
              <View key={p.label} style={styles.legendPill}>
                <View style={[styles.legendDot, { backgroundColor: p.color }]} />
                <Text style={styles.legendText}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Hormone Graph ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Hormone Rhythm</Text>
              <Text style={styles.cardSub}>Cycle days 1–{CYCLE_LENGTH}</Text>
            </View>
            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={C.lavender} />
          </View>

          {/* Graph toggle chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphChips}>
            {[
              { key: "all",          label: "All",          color: C.muted    },
              { key: "estrogen",     label: "Estrogen",     color: C.lavender },
              { key: "progesterone", label: "Progesterone", color: C.pink     },
              { key: "lh",           label: "LH",           color: C.gold     },
            ].map((chip) => (
              <Pressable
                key={chip.key}
                onPress={() => setActiveGraph(chip.key as typeof activeGraph)}
                style={[
                  styles.graphChip,
                  activeGraph === chip.key && { backgroundColor: chip.color, borderColor: chip.color },
                ]}
              >
                <Text style={[
                  styles.graphChipText,
                  activeGraph === chip.key && { color: C.white },
                ]}>
                  {chip.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* SVG waveform */}
          <View style={styles.graphWrap}>
            <Svg width={GRAPH_W} height={GRAPH_H}>
              <Defs>
                <SvgGradient id="gEst" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={C.lavender} stopOpacity="0.25" />
                  <Stop offset="1" stopColor={C.lavender} stopOpacity="0" />
                </SvgGradient>
                <SvgGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={C.pink} stopOpacity="0.20" />
                  <Stop offset="1" stopColor={C.pink} stopOpacity="0" />
                </SvgGradient>
                <SvgGradient id="gLh" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={C.gold} stopOpacity="0.20" />
                  <Stop offset="1" stopColor={C.gold} stopOpacity="0" />
                </SvgGradient>
              </Defs>

              {/* Estrogen */}
              {(activeGraph === "all" || activeGraph === "estrogen") && (
                <Path
                  d={buildPath(ESTROGEN_DATA, GRAPH_W, GRAPH_H)}
                  stroke={C.lavender}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* Progesterone */}
              {(activeGraph === "all" || activeGraph === "progesterone") && (
                <Path
                  d={buildPath(PROGESTERONE_DATA, GRAPH_W, GRAPH_H)}
                  stroke={C.pink}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* LH */}
              {(activeGraph === "all" || activeGraph === "lh") && (
                <Path
                  d={buildPath(LH_DATA, GRAPH_W, GRAPH_H)}
                  stroke={C.gold}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Today line */}
              <Line
                x1={TODAY_X}
                y1={0}
                x2={TODAY_X}
                y2={GRAPH_H}
                stroke={C.terracotta}
                strokeWidth={1.5}
                strokeDasharray="4,3"
                strokeLinecap="round"
              />
              <Circle cx={TODAY_X} cy={4} r={4} fill={C.terracotta} />
            </Svg>

            {/* X-axis day labels */}
            <View style={styles.graphXAxis}>
              {[1, 7, 14, 21, 28].map((d) => (
                <Text key={d} style={[
                  styles.graphXLabel,
                  d === CURRENT_DAY && { color: C.terracotta, fontFamily: F.uiBold },
                ]}>
                  {d === CURRENT_DAY ? `Day ${d}` : d}
                </Text>
              ))}
            </View>
          </View>

          {/* Legend row */}
          <View style={styles.graphLegendRow}>
            {[
              { label: "Estrogen",     color: C.lavender },
              { label: "Progesterone", color: C.pink     },
              { label: "LH",           color: C.gold     },
            ].map((l) => (
              <View key={l.label} style={styles.graphLegendItem}>
                <View style={[styles.graphLegendLine, { backgroundColor: l.color }]} />
                <Text style={styles.graphLegendLabel}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Metric Cards Grid ────────────────────────────────────────────── */}
        <View style={styles.metricsGrid}>
          {METRICS.map((m) => (
            <View key={m.key} style={styles.metricCard}>
              <View style={[styles.metricIconBubble, { backgroundColor: m.bg }]}>
                <MaterialCommunityIcons name={m.icon as any} size={18} color={m.color} />
              </View>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <View style={styles.metricBarTrack}>
                <View style={[styles.metricBarFill, { width: `${m.pct * 100}%` as any, backgroundColor: m.color }]} />
              </View>
            </View>
          ))}
        </View>

        {/* ── AI Insight Card ──────────────────────────────────────────────── */}
        <LinearGradient
          colors={["rgba(146,119,200,0.12)", "rgba(212,92,130,0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightCard}
        >
          <View style={styles.insightLeft}>
            <View style={styles.insightIconRow}>
              <MaterialCommunityIcons name="molecule-co2" size={14} color={C.lavender} />
              <Text style={styles.insightTag}>Cycle Insight</Text>
            </View>
            <Text style={styles.insightTitle}>Peak fertility window approaching</Text>
            <Text style={styles.insightBody}>
              Estrogen is rising steadily. Your body is priming for ovulation around Day {OVULATION_DAY}.
              Energy and libido often peak now — a great time for strength training.
            </Text>
            <Pressable style={styles.insightCta}>
              <Text style={styles.insightCtaText}>View full insight</Text>
              <MaterialCommunityIcons name="arrow-right" size={13} color={C.lavender} />
            </Pressable>
          </View>
          <View style={styles.insightImageWrap}>
            <CachedImage source={imgBloop} style={styles.insightImage} />
            <View style={styles.insightGlow} />
          </View>
        </LinearGradient>

        {/* ── Wellness Recommendation ──────────────────────────────────────── */}
        <View style={styles.wellnessCard}>
          <CachedImage source={imgPetals} style={styles.wellnessImage} />
          <LinearGradient
            colors={["transparent", "rgba(28,21,40,0.72)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.wellnessContent}>
            <View style={styles.wellnessTag}>
              <MaterialCommunityIcons name="yoga" size={12} color={C.white} />
              <Text style={styles.wellnessTagText}>Recommended for Day {CURRENT_DAY}</Text>
            </View>
            <Text style={styles.wellnessTitle}>Follicular Yoga Flow</Text>
            <Text style={styles.wellnessSub}>18 min · Energising · All levels</Text>
          </View>
          <Pressable style={styles.playBtn}>
            <LinearGradient
              colors={["#F4A261", "#E07A5F"]}
              style={styles.playBtnInner}
            >
              <MaterialCommunityIcons name="play" size={20} color={C.white} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── Cycle Calendar Strip ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>This Month</Text>
            <Pressable>
              <Text style={styles.seeAllText}>See calendar</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calStrip}>
            {Array.from({ length: CYCLE_LENGTH }, (_, i) => {
              const day = i + 1;
              const isToday = day === CURRENT_DAY;
              const isPast  = day < CURRENT_DAY;
              const phase =
                day <= 5 ? "period" :
                day <= 13 ? "follicular" :
                day <= 16 ? "ovulation" : "luteal";
              const phaseColor =
                phase === "period"     ? C.terracotta :
                phase === "follicular" ? C.gold :
                phase === "ovulation"  ? C.sage :
                C.lavender;

              return (
                <View key={day} style={[styles.calDay, isToday && styles.calDayToday]}>
                  <View style={[
                    styles.calDot,
                    { backgroundColor: isPast || isToday ? phaseColor : "rgba(196,184,212,0.35)" },
                    isToday && styles.calDotToday,
                  ]} />
                  <Text style={[
                    styles.calDayNum,
                    isToday && styles.calDayNumToday,
                    !isPast && !isToday && { color: C.faint },
                  ]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.quickLogInline}>
          <Text style={styles.quickLogTitle}>Log what changed today</Text>
          <LinearGradient
            colors={["rgba(255,255,255,0.86)", "rgba(255,255,255,0.94)"]}
            style={styles.quickLogBar}
          >
            {LOG_ACTIONS.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => setLogSheetOpen(true)}
                style={({ pressed }) => [styles.quickLogBtn, pressed && styles.pressed]}
              >
                <View style={[styles.quickLogIcon, { backgroundColor: action.color + "1A" }]}>
                  <MaterialCommunityIcons name={action.icon} size={18} color={action.color} />
                </View>
                <Text style={styles.quickLogLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </LinearGradient>
        </View>

        <View style={{ height: 92 }} />
      </ScrollView>

      {/* ── Daily Log Sheet ──────────────────────────────────────────────────── */}
      <DailyLogSheet
        visible={logSheetOpen}
        onClose={() => setLogSheetOpen(false)}
      /></SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  blob: {
    borderRadius: 999,
    position: "absolute",
  },

  // Header
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: C.text,
    fontFamily: F.luxuryBold,
    fontSize: 26,
    letterSpacing: 0.2,
  },
  headerSubRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 2,
  },
  headerDot: {
    backgroundColor: C.terracotta,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  headerSub: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 13,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    alignItems: "center",
    backgroundColor: C.cardBg,
    borderColor: C.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  bellBadge: {
    backgroundColor: C.terracotta,
    borderColor: C.white,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 8,
    position: "absolute",
    right: 8,
    top: 7,
    width: 8,
  },
  logBtn: {
    alignItems: "center",
    backgroundColor: C.terracotta,
    borderRadius: 18,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  logBtnText: {
    color: C.white,
    fontFamily: F.uiBold,
    fontSize: 13,
  },

  // Ring card
  ringCard: {
    alignItems: "center",
    backgroundColor: C.cardBg,
    borderColor: C.cardBorder,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    paddingBottom: 16,
    paddingTop: 20,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "absolute",
    top: 20 + CY - (R - SW / 2 - 14),
  },
  ringCenterImage: {
    borderRadius: R - SW / 2 - 14,
    height: "100%",
    opacity: 0.55,
    width: "100%",
  },
  ringCenterOverlay: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  ringDayNum: {
    color: C.text,
    fontFamily: F.luxuryBold,
    fontSize: 32,
    lineHeight: 36,
  },
  ringPhaseName: {
    color: C.muted,
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    marginTop: 2,
  },
  ringCountdown: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    marginTop: 6,
  },
  ringCountdownText: {
    color: C.sage,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },
  phaseLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 12,
  },
  legendPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.70)",
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  legendText: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },

  // Generic card
  card: {
    backgroundColor: C.cardBg,
    borderColor: C.cardBorder,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardTitle: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 15,
  },
  cardSub: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 11,
    marginTop: 1,
  },
  seeAllText: {
    color: C.lavender,
    fontFamily: F.uiSemiBold,
    fontSize: 12,
  },

  // Graph
  graphChips: {
    marginBottom: 12,
  },
  graphChip: {
    borderColor: "rgba(196,184,212,0.40)",
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  graphChipText: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },
  graphWrap: {
    alignItems: "flex-start",
  },
  graphXAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 2,
    width: GRAPH_W,
  },
  graphXLabel: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 10,
  },
  graphLegendRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },
  graphLegendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  graphLegendLine: {
    borderRadius: 2,
    height: 3,
    width: 18,
  },
  graphLegendLabel: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 11,
  },

  // Metric grid
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: C.cardBg,
    borderColor: C.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    width: (W - 40 - 12) / 2,
  },
  metricIconBubble: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    marginBottom: 8,
    width: 36,
  },
  metricLabel: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },
  metricValue: {
    fontFamily: F.uiBold,
    fontSize: 18,
    marginBottom: 6,
    marginTop: 2,
  },
  metricBarTrack: {
    backgroundColor: "rgba(196,184,212,0.22)",
    borderRadius: 4,
    height: 4,
    overflow: "hidden",
  },
  metricBarFill: {
    borderRadius: 4,
    height: 4,
  },

  // Insight card
  insightCard: {
    borderColor: "rgba(146,119,200,0.20)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 16,
    overflow: "hidden",
    padding: 18,
  },
  insightLeft: {
    flex: 1,
    paddingRight: 12,
  },
  insightIconRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 6,
  },
  insightTag: {
    color: C.lavender,
    fontFamily: F.uiSemiBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  insightTitle: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  insightBody: {
    color: C.muted,
    fontFamily: F.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  insightCta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  insightCtaText: {
    color: C.lavender,
    fontFamily: F.uiSemiBold,
    fontSize: 12,
  },
  insightImageWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 72,
  },
  insightImage: {
    height: 72,
    width: 72,
  },
  insightGlow: {
    backgroundColor: "rgba(146,119,200,0.18)",
    borderRadius: 36,
    bottom: -6,
    height: 36,
    position: "absolute",
    width: 52,
  },

  // Wellness card
  wellnessCard: {
    borderRadius: 24,
    height: 160,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  wellnessImage: {
    height: "100%",
    width: "100%",
  },
  wellnessContent: {
    bottom: 16,
    left: 18,
    position: "absolute",
  },
  wellnessTag: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  wellnessTagText: {
    color: "rgba(255,255,255,0.90)",
    fontFamily: F.uiMedium,
    fontSize: 10,
  },
  wellnessTitle: {
    color: C.white,
    fontFamily: F.uiBold,
    fontSize: 17,
  },
  wellnessSub: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: F.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  playBtn: {
    bottom: 16,
    position: "absolute",
    right: 18,
    shadowColor: C.peach,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  playBtnInner: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  // Calendar strip
  calStrip: {
    marginHorizontal: -4,
  },
  calDay: {
    alignItems: "center",
    marginHorizontal: 4,
    width: 28,
  },
  calDayToday: {
    opacity: 1,
  },
  calDot: {
    borderRadius: 6,
    height: 10,
    marginBottom: 4,
    width: 10,
  },
  calDotToday: {
    borderColor: C.white,
    borderWidth: 2,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  calDayNum: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 10,
  },
  calDayNumToday: {
    color: C.terracotta,
    fontFamily: F.uiBold,
  },

  // Quick log bar
  quickLogInline: {
    gap: 10,
  },
  quickLogTitle: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  quickLogBar: {
    borderColor: C.cardBorder,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 10,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  quickLogBtn: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  quickLogIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  quickLogLabel: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 10,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});

