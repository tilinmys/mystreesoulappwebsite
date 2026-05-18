/**
 * Grounding / SOS Screen
 * Emotional support space — zero cognitive load, maximum safety.
 * Route: /grounding  (push from anywhere in the app)
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Rect,
  Stop,
  Svg,
} from "react-native-svg";
import { F } from "../constants/fonts";
import { useSafeBack } from "../hooks/useSafeBack";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:        ["#FFF4E6", "#FDF1F4", "#EAE0F5"] as const,
  deep:      "#2D2B3D",
  muted:     "#8A84A8",
  faint:     "#C4BDD8",
  lavender:  "#8A56D8",
  lavLight:  "#B490E0",
  lavPale:   "#F0E8FF",
  lavSoft:   "#EAE0F5",
  rose:      "#F4A0A8",
  peach:     "#F4C0A0",
  cardBg:    "rgba(255,255,255,0.72)",
  border:    "rgba(255,255,255,0.90)",
};

// ── Dimensions ────────────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const RING_SIZE = 264;
const RING_R    = RING_SIZE / 2;
const ORB_SIZE  = 200;

// ── Breathing phases ──────────────────────────────────────────────────────────
const PHASES = ["Breathe in", "Hold", "Breathe out", "Rest"];
const PHASE_DURATION = 4000; // ms each phase

// ── Quick action data ─────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: "qa1", label: "Calm\nThoughts",    icon: "cloud-outline",      color: "#7B6FA8" },
  { id: "qa2", label: "Breathing\nReset",  icon: "refresh",            color: "#7B6FA8" },
  { id: "qa3", label: "Gentle\nAudio",     icon: "headphones",         color: "#7B6FA8" },
  { id: "qa4", label: "Talk to\nCompanion",icon: "message-heart-outline", color: "#7B6FA8" },
];

const REACH_ITEMS = [
  { id: "r1", label: "Trusted\nContact",    icon: "account-outline",        color: "#7B6FA8" },
  { id: "r2", label: "Emotional\nSupport",  icon: "phone-in-talk-outline",  color: "#7B6FA8" },
  { id: "r3", label: "Therapist\nSupport",  icon: "doctor",                 color: "#7B6FA8" },
  { id: "r4", label: "Care\nTeam",          icon: "account-group-outline",  color: "#7B6FA8" },
];

// ── Audio waveform SVG ────────────────────────────────────────────────────────
function AudioWave() {
  const bars = [5, 9, 14, 20, 16, 24, 30, 24, 18, 32, 26, 20, 16, 24, 30, 24, 16, 12, 9, 5];
  const bw = 3, gap = 3, mid = 18;
  const total = bars.length * (bw + gap) - gap;
  return (
    <Svg width={total} height={36}>
      <Defs>
        <SvgGradient id="wvG" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0"   stopColor="#FFFFFF" stopOpacity="0.35" />
          <Stop offset="0.5" stopColor="#D4C4F8" stopOpacity="0.9"  />
          <Stop offset="1"   stopColor="#FFFFFF" stopOpacity="0.35" />
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
          fill="url(#wvG)"
        />
      ))}
    </Svg>
  );
}

// ── Background sparkles ───────────────────────────────────────────────────────
function BackgroundSparkles() {
  const H = 820;
  const items = [
    { cx: 32,  cy: 90,  r: 2.2, o: 0.35 },
    { cx: W-28, cy: 72,  r: 2,   o: 0.28 },
    { cx: 60,  cy: 240, r: 1.5, o: 0.22 },
    { cx: W-44, cy: 200, r: 2.5, o: 0.30 },
    { cx: 24,  cy: 380, r: 1.8, o: 0.20 },
    { cx: W-20, cy: 350, r: 1.5, o: 0.25 },
    { cx: 48,  cy: 520, r: 2,   o: 0.18 },
    { cx: W-55, cy: 490, r: 2.2, o: 0.22 },
    { cx: 36,  cy: 660, r: 1.6, o: 0.18 },
    { cx: W-32, cy: 640, r: 2,   o: 0.20 },
    { cx: 80,  cy: 160, r: 1.2, o: 0.18 },
    { cx: W-80, cy: 420, r: 1.2, o: 0.16 },
  ];
  // Star paths (4-point sparkle)
  const stars = [
    { x: 54,   y: 136, s: 5,  o: 0.30 },
    { x: W-62, y: 290, s: 5,  o: 0.25 },
    { x: 42,   y: 580, s: 4.5,o: 0.20 },
    { x: W-38, y: 560, s: 4,  o: 0.22 },
  ];

  return (
    <Svg
      width={W}
      height={H}
      style={{ position: "absolute", top: 0, left: 0 }}
      pointerEvents="none"
    >
      {items.map((d, i) => (
        <Circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#8A56D8" opacity={d.o} />
      ))}
      {stars.map((s, i) => (
        <Path
          key={i}
          d={`M ${s.x} ${s.y - s.s} L ${s.x + 1.2} ${s.y - 1.2} L ${s.x + s.s} ${s.y} L ${s.x + 1.2} ${s.y + 1.2} L ${s.x} ${s.y + s.s} L ${s.x - 1.2} ${s.y + 1.2} L ${s.x - s.s} ${s.y} L ${s.x - 1.2} ${s.y - 1.2} Z`}
          fill="#B490E0"
          opacity={s.o}
        />
      ))}
      {/* Faint gold accent dots */}
      <Circle cx={W * 0.7} cy={180} r={2.5} fill="#D4A066" opacity="0.22" />
      <Circle cx={W * 0.25} cy={440} r={2}   fill="#D4A066" opacity="0.18" />
      <Circle cx={W * 0.8}  cy={600} r={1.8} fill="#F4A0A8" opacity="0.22" />
    </Svg>
  );
}

// ── Breathing orb sine wave ───────────────────────────────────────────────────
function OrbSineWave() {
  const W_WAVE = 112, H_WAVE = 36, mid = 18;
  let d = `M 0 ${mid}`;
  for (let x = 2; x <= W_WAVE; x += 2) {
    const y = mid + Math.sin((x / W_WAVE) * Math.PI * 2.6) * 11;
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return (
    <Svg width={W_WAVE} height={H_WAVE} viewBox={`0 0 ${W_WAVE} ${H_WAVE}`}>
      <Defs>
        <SvgGradient id="sineG" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0"   stopColor="rgba(255,255,255,0.3)" stopOpacity="1" />
          <Stop offset="0.5" stopColor="rgba(255,255,255,0.9)" stopOpacity="1" />
          <Stop offset="1"   stopColor="rgba(255,255,255,0.3)" stopOpacity="1" />
        </SvgGradient>
      </Defs>
      <Path
        d={d}
        fill="none"
        stroke="url(#sineG)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Breathing orb component ───────────────────────────────────────────────────
function BreathingOrb({ phaseText }: { phaseText: string }) {
  const orbProgress = useRef(new Animated.Value(0)).current;
  const glowProgress = useRef(new Animated.Value(0)).current;
  const orbitProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb scale: inhale → hold → exhale → rest (4s each)
    const orbLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbProgress, {
          toValue: 1,
          duration: PHASE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(PHASE_DURATION),
        Animated.timing(orbProgress, {
          toValue: 0,
          duration: PHASE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(PHASE_DURATION),
      ]),
    );
    // Glow slightly lags
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowProgress, {
          toValue: 1,
          duration: PHASE_DURATION + 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(PHASE_DURATION - 200),
        Animated.timing(glowProgress, {
          toValue: 0,
          duration: PHASE_DURATION + 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(PHASE_DURATION - 200),
      ]),
    );
    // Orbit dot: one full circle per 16s cycle
    const orbitLoop = Animated.loop(
      Animated.timing(orbitProgress, {
        toValue: 1,
        duration: PHASE_DURATION * 4,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    orbLoop.start();
    glowLoop.start();
    orbitLoop.start();
    return () => {
      orbLoop.stop();
      glowLoop.stop();
      orbitLoop.stop();
    };
  }, [glowProgress, orbProgress, orbitProgress]);

  const orbAnimStyle = {
    transform: [{
      scale: orbProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.86, 1.14],
      }),
    }],
  };
  const glowAnimStyle = {
    transform: [{
      scale: glowProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.82, 1.22],
      }),
    }],
    opacity: glowProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 0.57],
    }),
  };
  const orbitDotStyle = {
    transform: [
      {
        rotate: orbitProgress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
      { translateY: -(RING_R - 5) },
    ],
  };

  return (
    <View style={styles.orbContainer}>
      {/* Outer ambient glow */}
      <Animated.View style={[styles.orbOuterGlow, glowAnimStyle]} />

      {/* Dashed orbit ring */}
      <View style={styles.orbRing}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgGradient id="ringBorder" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#D4C4F8" stopOpacity="0.45" />
              <Stop offset="1" stopColor="#F4A0A8" stopOpacity="0.25" />
            </SvgGradient>
          </Defs>
          <Circle
            cx={RING_R}
            cy={RING_R}
            r={RING_R - 3}
            fill="none"
            stroke="url(#ringBorder)"
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />
          {/* Second subtle inner ring */}
          <Circle
            cx={RING_R}
            cy={RING_R}
            r={RING_R - 18}
            fill="none"
            stroke="rgba(212,196,248,0.18)"
            strokeWidth="1"
          />
        </Svg>

        {/* Orbit dot */}
        <View style={styles.orbitDotOrigin} pointerEvents="none">
          <Animated.View style={[styles.orbitDotArm, orbitDotStyle]}>
            <View style={styles.orbitDot} />
          </Animated.View>
        </View>

        {/* Inner pulsing orb */}
        <View style={styles.orbInnerWrap}>
          <Animated.View style={[styles.orbInner, orbAnimStyle]}>
            <Svg
              width={ORB_SIZE}
              height={ORB_SIZE}
              viewBox={`0 0 ${ORB_SIZE} ${ORB_SIZE}`}
              style={StyleSheet.absoluteFill}
            >
              <Defs>
                <SvgRadialGradient id="orbFill" cx="44%" cy="38%" r="60%">
                  <Stop offset="0"   stopColor="#FFFFFF"  stopOpacity="0.95" />
                  <Stop offset="0.3" stopColor="#EDE0FF"  stopOpacity="1"    />
                  <Stop offset="0.65" stopColor="#C4A8F0" stopOpacity="1"    />
                  <Stop offset="1"   stopColor="#9B72D8"  stopOpacity="1"    />
                </SvgRadialGradient>
                <SvgRadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0"   stopColor="#D4C4F8" stopOpacity="0.55" />
                  <Stop offset="0.7" stopColor="#B490E0" stopOpacity="0.18" />
                  <Stop offset="1"   stopColor="#B490E0" stopOpacity="0"    />
                </SvgRadialGradient>
              </Defs>
              {/* Outer glow layer */}
              <Circle cx={ORB_SIZE / 2} cy={ORB_SIZE / 2} r={ORB_SIZE / 2} fill="url(#orbGlow)" />
              {/* Main orb */}
              <Circle cx={ORB_SIZE / 2} cy={ORB_SIZE / 2} r={ORB_SIZE / 2 - 4} fill="url(#orbFill)" />
            </Svg>

            {/* Orb content */}
            <View style={styles.orbContent} pointerEvents="none">
              <OrbSineWave />
              <Text style={styles.orbPhaseText}>{phaseText}</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

// ── Square action card ────────────────────────────────────────────────────────
function ActionCard({ icon, label, color, onPress }: {
  icon: string; label: string; color: string; onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.actionIconWrap}>
        <MaterialCommunityIcons name={icon as any} size={26} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function GroundingScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setPhaseIdx(i => (i + 1) % PHASES.length);
    }, PHASE_DURATION);
    return () => clearInterval(iv);
  }, []);

  return (
    <LinearGradient colors={[...C.bg]} style={styles.root}>
      <BackgroundSparkles />
      <SafeAreaView style={styles.safe} edges={["top"]}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable style={styles.headerCircleBtn} onPress={safeBack}>
            <MaterialCommunityIcons name="close" size={18} color={C.deep} />
          </Pressable>

          <View style={styles.safeTextWrap}>
            <Text style={styles.safeText}>You are safe here</Text>
            <MaterialCommunityIcons name="heart-outline" size={16} color={C.lavender} style={{ marginLeft: 5, marginTop: 1 }} />
          </View>

          <Pressable style={styles.headerCircleBtn}>
            <Text style={styles.helpText}>?</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          bounces={false}
        >
          {/* ── Breathing orb ───────────────────────────────────────────── */}
          <View style={styles.orbSection}>
            <BreathingOrb phaseText={PHASES[phaseIdx]} />

            {/* Pagination dots */}
            <View style={styles.pagDots}>
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  style={[
                    styles.pagDot,
                    i === phaseIdx % 3 && styles.pagDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* ── Quick action grid ────────────────────────────────────────── */}
          <View style={styles.actionGrid}>
            {QUICK_ACTIONS.map(a => (
              <ActionCard
                key={a.id}
                icon={a.icon}
                label={a.label}
                color={a.color}
                onPress={a.id === "qa4" ? () => router.push("/bloop-chat" as any) : undefined}
              />
            ))}
          </View>

          {/* ── Empathy banner ───────────────────────────────────────────── */}
          <View style={styles.empathyBanner}>
            <MaterialCommunityIcons name="heart-outline" size={22} color={C.lavender} />
            <Text style={styles.empathyText}>
              You don't need to carry{"\n"}everything alone.
            </Text>
            <View style={styles.empathySparkle}>
              <Text style={{ fontSize: 18 }}>✦</Text>
            </View>
          </View>

          {/* ── Audio player pill ────────────────────────────────────────── */}
          <View style={styles.audioPill}>
            <LinearGradient
              colors={["#F0E5FF", "#FAF5FF", "#F5EEFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Play button */}
            <Pressable style={styles.audioPlayBtn}>
              <LinearGradient
                colors={["#C4A0FF", "#8A56D8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.audioPlayGrad}
              >
                <MaterialCommunityIcons name="play" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </LinearGradient>
            </Pressable>

            {/* Waveform */}
            <View style={styles.audioWaveWrap}>
              <AudioWave />
            </View>

            {/* Track info */}
            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>Calming Rain</Text>
              <Text style={styles.audioDur}>8 min</Text>
            </View>
            <MaterialCommunityIcons name="cloud-outline" size={20} color={C.lavender} />
          </View>

          {/* ── Reach out section ────────────────────────────────────────── */}
          <Text style={styles.reachTitle}>Reach out if you need</Text>
          <View style={styles.actionGrid}>
            {REACH_ITEMS.map(r => (
              <ActionCard key={r.id} icon={r.icon} label={r.label} color={r.color} />
            ))}
          </View>

          {/* ── Footer affirmation ───────────────────────────────────────── */}
          <View style={styles.footer}>
            <MaterialCommunityIcons name="leaf" size={16} color={C.muted} />
            <Text style={styles.footerText}>You are important. You matter.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ACTION_CARD_W = (W - 40 - 30) / 4; // 4 cards, 10px gaps, 20px side padding

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C8C0D8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  helpText: {
    fontFamily: F.uiSemiBold,
    fontSize: 16,
    color: C.deep,
  },
  safeTextWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  safeText: {
    fontFamily: F.uiMedium,
    fontSize: 14.5,
    color: C.deep,
    letterSpacing: 0.1,
  },

  scroll: { paddingTop: 4 },

  // Orb section
  orbSection: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  orbContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  orbOuterGlow: {
    position: "absolute",
    width: RING_SIZE + 60,
    height: RING_SIZE + 60,
    borderRadius: (RING_SIZE + 60) / 2,
    backgroundColor: "rgba(196,168,248,0.22)",
  },
  orbRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  orbitDotOrigin: {
    position: "absolute",
    width: 0,
    height: 0,
    top: RING_R,
    left: RING_R,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitDotArm: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  orbitDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: "#8A56D8",
    shadowColor: "#8A56D8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  orbInnerWrap: {
    position: "absolute",
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  orbInner: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.75)",
    overflow: "hidden",
    shadowColor: "#8A56D8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 28,
    elevation: 10,
  },
  orbContent: {
    position: "absolute",
    alignItems: "center",
    gap: 10,
  },
  orbPhaseText: {
    fontFamily: F.uiSemiBold,
    fontSize: 17,
    color: "#5A3A96",
    letterSpacing: 0.3,
  },

  // Pagination
  pagDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  pagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(138,86,216,0.28)",
  },
  pagDotActive: {
    backgroundColor: "#8A56D8",
    width: 20,
    borderRadius: 4,
  },

  // Action grid
  actionGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 10,
    shadowColor: "#C8C0D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 2,
    minHeight: 100,
    justifyContent: "center",
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(138,86,216,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontFamily: F.uiMedium,
    fontSize: 11,
    color: C.deep,
    textAlign: "center",
    lineHeight: 15,
  },

  // Empathy banner
  empathyBanner: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: "#C8C0D8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 2,
  },
  empathyText: {
    flex: 1,
    fontFamily: F.bodyRegular,
    fontSize: 16,
    color: C.deep,
    lineHeight: 24,
  },
  empathySparkle: {
    opacity: 0.55,
  },

  // Audio pill
  audioPill: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(212,196,248,0.45)",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingRight: 14,
    gap: 10,
    overflow: "hidden",
    shadowColor: "#C4A8E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  audioPlayBtn: {
    flexShrink: 0,
  },
  audioPlayGrad: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  audioWaveWrap: {
    flex: 1,
    alignItems: "center",
  },
  audioInfo: {
    alignItems: "flex-end",
  },
  audioTitle: {
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    color: C.lavender,
  },
  audioDur: {
    fontFamily: F.uiRegular,
    fontSize: 11.5,
    color: C.muted,
  },

  // Reach out
  reachTitle: {
    fontFamily: F.uiSemiBold,
    fontSize: 15,
    color: C.deep,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 4,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 28,
    paddingBottom: 16,
  },
  footerText: {
    fontFamily: F.uiMedium,
    fontSize: 13.5,
    color: C.muted,
    letterSpacing: 0.2,
  },
});
