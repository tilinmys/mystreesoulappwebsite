/**
 * Wellness / Care Space screen
 *
 * Phase cards now drive all visible content:
 *   - Hero text + pill
 *   - Recommended activities
 *   - Today's support tips (each tappable → Bloop)
 *
 * Breathing Space is preserved exactly.
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
  Defs,
  Ellipse,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
  Svg,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { openBloopWithContext } from "../../lib/openBloopWithContext";

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
const HERO_H  = 290;
const BCARD_W = W - 40;
const BCARD_H = 156;

// ── Breathing card wave paths (unchanged) ─────────────────────────────────────
const bw1 = `M -10 ${BCARD_H * 0.38} C ${BCARD_W * 0.18} ${BCARD_H * 0.10} ${BCARD_W * 0.38} ${BCARD_H * 0.56} ${BCARD_W * 0.52} ${BCARD_H * 0.34} C ${BCARD_W * 0.66} ${BCARD_H * 0.14} ${BCARD_W * 0.84} ${BCARD_H * 0.50} ${BCARD_W + 10} ${BCARD_H * 0.30}`;
const bw2 = `M -10 ${BCARD_H * 0.55} C ${BCARD_W * 0.15} ${BCARD_H * 0.28} ${BCARD_W * 0.35} ${BCARD_H * 0.70} ${BCARD_W * 0.50} ${BCARD_H * 0.48} C ${BCARD_W * 0.65} ${BCARD_H * 0.28} ${BCARD_W * 0.85} ${BCARD_H * 0.64} ${BCARD_W + 10} ${BCARD_H * 0.44}`;
const bw3 = `M -10 ${BCARD_H * 0.68} C ${BCARD_W * 0.20} ${BCARD_H * 0.45} ${BCARD_W * 0.40} ${BCARD_H * 0.82} ${BCARD_W * 0.55} ${BCARD_H * 0.60} C ${BCARD_W * 0.70} ${BCARD_H * 0.40} ${BCARD_W * 0.88} ${BCARD_H * 0.74} ${BCARD_W + 10} ${BCARD_H * 0.56}`;

// ── Phase types ───────────────────────────────────────────────────────────────
type PhaseKey = "menstrual" | "follicular" | "ovulation" | "luteal" | "pms";

type RecItem = {
  key:      string;
  title:    string;
  duration: string;
  icon:     React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  colors:   [string, string];
  iconBg:   string;
};

type SupportItem = {
  key:      string;
  icon:     React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color:    string;
  bg:       string;
  text:     string;
  bloopMsg: string;
};

type PhaseContent = {
  // Hero copy split around the accent word
  heroPre:     string;
  heroAccent:  string;
  heroPost:    string;
  // Recovery pill
  pillLabel:   string;
  pillIcon:    React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  // Bloop nudge copy
  careCopy:    string;
  // Recommendation cards
  recs:        RecItem[];
  // Today's support tips
  support:     SupportItem[];
};

// ── Phase cards row ───────────────────────────────────────────────────────────
const PHASES: {
  key:   PhaseKey;
  label: string;
  icon:  React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}[] = [
  { key: "menstrual",  label: "Menstrual\nCare",   icon: "water-outline",        color: C.lavender },
  { key: "follicular", label: "Follicular\nRise",  icon: "sprout-outline",       color: C.sage     },
  { key: "ovulation",  label: "Ovulation\nEnergy", icon: "white-balance-sunny",  color: C.peach    },
  { key: "luteal",     label: "Luteal\nPhase",     icon: "moon-first-quarter",   color: C.purple   },
  { key: "pms",        label: "PMS\nRecovery",     icon: "moon-waning-crescent", color: C.pink     },
];

// ── Phase content map ─────────────────────────────────────────────────────────
const PHASE_CONTENT: Record<PhaseKey, PhaseContent> = {

  menstrual: {
    heroPre:    "Your body deserves ",
    heroAccent: "warmth",
    heroPost:   " and gentle rest today.",
    pillLabel:  "Rest & Restore",
    pillIcon:   "leaf-circle-outline",
    careCopy:   "What should I eat to support my body during menstruation?",
    recs: [
      {
        key:      "restyoga",
        title:    "Restorative\nYoga",
        duration: "15 min",
        icon:     "yoga",
        colors:   ["#DDD8F5", "#B8AEE0"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
      {
        key:      "heat",
        title:    "Warm Heat\nTherapy",
        duration: "10 min",
        icon:     "fire",
        colors:   ["#F9D0C4", "#F2A99C"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
      {
        key:      "nourish",
        title:    "Iron-Rich\nNourish",
        duration: "5 min",
        icon:     "food-apple",
        colors:   ["#C5E8C9", "#8DC993"],
        iconBg:   "rgba(255,255,255,0.28)",
      },
    ],
    support: [
      {
        key:      "hydrate",
        icon:     "water-outline",
        color:    "#4BA3C3",
        bg:       "rgba(75,163,195,0.12)",
        text:     "Hydrate more\ntoday",
        bloopMsg: "How much water should I drink during my period?",
      },
      {
        key:      "energy",
        icon:     "white-balance-sunny",
        color:    C.peach,
        bg:       "rgba(244,162,97,0.12)",
        text:     "Energy may dip\ntonight",
        bloopMsg: "Why does my energy dip during menstruation?",
      },
      {
        key:      "stretch",
        icon:     "sprout-outline",
        color:    C.sage,
        bg:       "rgba(94,155,107,0.12)",
        text:     "Gentle stretching\nmay help cramps",
        bloopMsg: "Show me gentle stretches for cramps.",
      },
    ],
  },

  follicular: {
    heroPre:    "Energy is rising — follow your natural ",
    heroAccent: "curiosity",
    heroPost:   " today.",
    pillLabel:  "Rising Energy",
    pillIcon:   "sprout-outline",
    careCopy:   "How can I make the most of my follicular phase energy?",
    recs: [
      {
        key:      "morningflow",
        title:    "Morning Flow\nYoga",
        duration: "20 min",
        icon:     "yoga",
        colors:   ["#C5E8C9", "#7DC47A"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
      {
        key:      "creative",
        title:    "Creative\nJournaling",
        duration: "10 min",
        icon:     "pencil-outline",
        colors:   ["#FDE9B8", "#FBCC7A"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
      {
        key:      "cardio",
        title:    "Gentle\nCardio",
        duration: "25 min",
        icon:     "run",
        colors:   ["#FDDFC4", "#F9C490"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
    ],
    support: [
      {
        key:      "newthings",
        icon:     "star-four-points-outline",
        color:    C.peach,
        bg:       "rgba(244,162,97,0.12)",
        text:     "Good time to\ntry new things",
        bloopMsg: "What activities are best in the follicular phase?",
      },
      {
        key:      "focus",
        icon:     "brain",
        color:    C.purple,
        bg:       "rgba(139,99,214,0.10)",
        text:     "Your focus is\nnaturally sharper",
        bloopMsg: "How does the follicular phase affect my brain and focus?",
      },
      {
        key:      "move",
        icon:     "run",
        color:    C.sage,
        bg:       "rgba(94,155,107,0.12)",
        text:     "Light movement\nfeels great now",
        bloopMsg: "What's the best exercise during the follicular phase?",
      },
    ],
  },

  ovulation: {
    heroPre:    "You're at your most ",
    heroAccent: "radiant",
    heroPost:   " — lean into your energy.",
    pillLabel:  "Peak Energy",
    pillIcon:   "white-balance-sunny",
    careCopy:   "How can I channel ovulation week energy positively?",
    recs: [
      {
        key:      "dance",
        title:    "Dance\nFlow",
        duration: "20 min",
        icon:     "music",
        colors:   ["#FDDFC4", "#F9A870"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
      {
        key:      "hiit",
        title:    "HIIT Lite\nWorkout",
        duration: "15 min",
        icon:     "lightning-bolt",
        colors:   ["#FDE8B8", "#FBC56A"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
      {
        key:      "connect",
        title:    "Connect &\nCommunicate",
        duration: "10 min",
        icon:     "account-heart-outline",
        colors:   ["#F9D5D3", "#F2A09C"],
        iconBg:   "rgba(255,255,255,0.28)",
      },
    ],
    support: [
      {
        key:      "social",
        icon:     "account-group-outline",
        color:    C.pink,
        bg:       "rgba(212,92,130,0.10)",
        text:     "Social energy\npeaks today",
        bloopMsg: "How does ovulation affect social confidence and mood?",
      },
      {
        key:      "projects",
        icon:     "lightbulb-on-outline",
        color:    C.peach,
        bg:       "rgba(244,162,97,0.12)",
        text:     "Great time for\nnew projects",
        bloopMsg: "What makes ovulation week ideal for creativity and productivity?",
      },
      {
        key:      "highenergy",
        icon:     "lightning-bolt-outline",
        color:    "#E67E22",
        bg:       "rgba(230,126,34,0.10)",
        text:     "High-energy\nmovement suits you",
        bloopMsg: "What exercises are best during ovulation?",
      },
    ],
  },

  luteal: {
    heroPre:    "Slow down and ",
    heroAccent: "listen",
    heroPost:   " to what your body needs.",
    pillLabel:  "Wind Down",
    pillIcon:   "moon-first-quarter",
    careCopy:   "How do I manage luteal phase fatigue and mood shifts?",
    recs: [
      {
        key:      "yin",
        title:    "Yin\nYoga",
        duration: "25 min",
        icon:     "yoga",
        colors:   ["#C5C0F0", "#9B8DDC"],
        iconBg:   "rgba(255,255,255,0.25)",
      },
      {
        key:      "walk",
        title:    "Calming\nNature Walk",
        duration: "20 min",
        icon:     "walk",
        colors:   ["#C5E8C9", "#8DC993"],
        iconBg:   "rgba(255,255,255,0.28)",
      },
      {
        key:      "nourishreset",
        title:    "Nourish\nReset",
        duration: "10 min",
        icon:     "food-apple",
        colors:   ["#FDDFC4", "#F9C490"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
    ],
    support: [
      {
        key:      "cravings",
        icon:     "food-croissant",
        color:    C.peach,
        bg:       "rgba(244,162,97,0.12)",
        text:     "Cravings are\nnormal now",
        bloopMsg: "Why do I crave sweet foods in the luteal phase?",
      },
      {
        key:      "caffeine",
        icon:     "coffee-outline",
        color:    C.muted,
        bg:       "rgba(155,142,171,0.12)",
        text:     "Reduce caffeine\ntoday",
        bloopMsg: "How does caffeine affect PMS and luteal symptoms?",
      },
      {
        key:      "rest",
        icon:     "sleep",
        color:    C.lavender,
        bg:       "rgba(146,119,200,0.12)",
        text:     "Rest more\nthan usual",
        bloopMsg: "Why am I more tired in the luteal phase?",
      },
    ],
  },

  pms: {
    heroPre:    "Be extra ",
    heroAccent: "gentle",
    heroPost:   " with yourself — this too shall pass.",
    pillLabel:  "PMS Recovery",
    pillIcon:   "moon-waning-crescent",
    careCopy:   "What can I do to ease PMS symptoms naturally?",
    recs: [
      {
        key:      "gentlestretch",
        title:    "Gentle\nStretching",
        duration: "15 min",
        icon:     "human-handsup",
        colors:   ["#DDD8F5", "#B8AEE0"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
      {
        key:      "bath",
        title:    "Warm Bath\nRitual",
        duration: "20 min",
        icon:     "hot-tub",
        colors:   ["#F9D0C4", "#F2A99C"],
        iconBg:   "rgba(255,255,255,0.30)",
      },
      {
        key:      "breathe",
        title:    "Mindful\nBreathing",
        duration: "10 min",
        icon:     "meditation",
        colors:   ["#C5C0F0", "#9B8DDC"],
        iconBg:   "rgba(255,255,255,0.25)",
      },
    ],
    support: [
      {
        key:      "mood",
        icon:     "heart-outline",
        color:    C.pink,
        bg:       "rgba(212,92,130,0.10)",
        text:     "Mood may feel\ntender today",
        bloopMsg: "Why do I feel so emotional before my period?",
      },
      {
        key:      "warmth",
        icon:     "fire",
        color:    C.peach,
        bg:       "rgba(244,162,97,0.12)",
        text:     "Warmth helps\nwith cramps",
        bloopMsg: "Does heat therapy really help with period cramps?",
      },
      {
        key:      "magnesium",
        icon:     "leaf-circle-outline",
        color:    C.sage,
        bg:       "rgba(94,155,107,0.12)",
        text:     "Magnesium may\nease symptoms",
        bloopMsg: "What vitamins and minerals help with PMS symptoms?",
      },
    ],
  },
};

// ── Botanical SVG background (unchanged) ─────────────────────────────────────
function BotanicalLeaves() {
  return (
    <Svg
      width={W}
      height={HERO_H}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {/* Left branch */}
      <Path d={`M 22 ${HERO_H} Q 36 ${HERO_H * 0.74} 52 ${HERO_H * 0.56} Q 64 ${HERO_H * 0.42} 72 ${HERO_H * 0.26}`}                             stroke="rgba(146,119,200,0.22)" strokeWidth={1.4} fill="none" />
      <Path d={`M 38 ${HERO_H * 0.72} Q 12 ${HERO_H * 0.65} 8 ${HERO_H * 0.54} Q 22 ${HERO_H * 0.62} 38 ${HERO_H * 0.72}`}                       stroke="rgba(146,119,200,0.18)" strokeWidth={1}   fill="rgba(146,119,200,0.07)" />
      <Path d={`M 48 ${HERO_H * 0.58} Q 18 ${HERO_H * 0.50} 14 ${HERO_H * 0.38} Q 30 ${HERO_H * 0.48} 48 ${HERO_H * 0.58}`}                      stroke="rgba(146,119,200,0.16)" strokeWidth={1}   fill="rgba(146,119,200,0.06)" />
      <Path d={`M 60 ${HERO_H * 0.42} Q 30 ${HERO_H * 0.32} 26 ${HERO_H * 0.20} Q 44 ${HERO_H * 0.32} 60 ${HERO_H * 0.42}`}                      stroke="rgba(146,119,200,0.15)" strokeWidth={0.9} fill="rgba(146,119,200,0.05)" />
      <Path d={`M 68 ${HERO_H * 0.28} Q 52 ${HERO_H * 0.18} 56 ${HERO_H * 0.08} Q 65 ${HERO_H * 0.18} 68 ${HERO_H * 0.28}`}                      stroke="rgba(146,119,200,0.14)" strokeWidth={0.8} fill="rgba(146,119,200,0.04)" />
      {/* Right branch */}
      <Path d={`M ${W-22} ${HERO_H} Q ${W-36} ${HERO_H*0.74} ${W-52} ${HERO_H*0.56} Q ${W-64} ${HERO_H*0.42} ${W-72} ${HERO_H*0.26}`}           stroke="rgba(212,92,130,0.18)" strokeWidth={1.4} fill="none" />
      <Path d={`M ${W-38} ${HERO_H*0.72} Q ${W-12} ${HERO_H*0.65} ${W-8} ${HERO_H*0.54} Q ${W-22} ${HERO_H*0.62} ${W-38} ${HERO_H*0.72}`}       stroke="rgba(212,92,130,0.14)" strokeWidth={1}   fill="rgba(212,92,130,0.06)" />
      <Path d={`M ${W-48} ${HERO_H*0.58} Q ${W-18} ${HERO_H*0.50} ${W-14} ${HERO_H*0.38} Q ${W-30} ${HERO_H*0.48} ${W-48} ${HERO_H*0.58}`}      stroke="rgba(212,92,130,0.12)" strokeWidth={1}   fill="rgba(212,92,130,0.05)" />
      <Path d={`M ${W-60} ${HERO_H*0.42} Q ${W-30} ${HERO_H*0.32} ${W-26} ${HERO_H*0.20} Q ${W-44} ${HERO_H*0.32} ${W-60} ${HERO_H*0.42}`}      stroke="rgba(212,92,130,0.11)" strokeWidth={0.9} fill="rgba(212,92,130,0.04)" />
      <Path d={`M ${W-68} ${HERO_H*0.28} Q ${W-52} ${HERO_H*0.18} ${W-56} ${HERO_H*0.08} Q ${W-65} ${HERO_H*0.18} ${W-68} ${HERO_H*0.28}`}      stroke="rgba(212,92,130,0.10)" strokeWidth={0.8} fill="rgba(212,92,130,0.04)" />
    </Svg>
  );
}

// ── Hero glow (unchanged) ─────────────────────────────────────────────────────
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
  const router = useRouter();
  const { isDark } = useColorMode();

  const [activePhase, setActivePhase] = useState<PhaseKey>("menstrual");
  const [isBreathing, setIsBreathing] = useState(false);

  // Derive all phase-specific content from the active phase
  const pc = PHASE_CONTENT[activePhase];

  // ── Breathing animation (preserved exactly) ───────────────────────────────
  const breathValue = useRef(new Animated.Value(0)).current;
  const breathLoop  = useRef<Animated.CompositeAnimation | null>(null);

  const startBreathing = () => {
    breathLoop.current?.stop();
    breathLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(breathValue, {
          toValue: 1, duration: 4000,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(breathValue, {
          toValue: 0, duration: 4000,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
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
      toValue: 0, duration: 600,
      easing: Easing.out(Easing.ease), useNativeDriver: true,
    }).start();
  };

  const toggleBreathing = () => {
    if (isBreathing) stopBreathing();
    else             startBreathing();
    setIsBreathing((prev) => !prev);
  };

  useEffect(() => () => breathLoop.current?.stop(), []);

  const breathAnimStyle = {
    opacity: breathValue.interpolate({ inputRange: [0, 1], outputRange: [0.52, 0.88] }),
    transform: [
      { scale: breathValue.interpolate({ inputRange: [0, 1], outputRange: [0.68, 1] }) },
    ],
  };

  // ── Bloop helper ──────────────────────────────────────────────────────────
  function askBloop(message: string) {
    openBloopWithContext(router, message, "Wellness");
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, isDark && styles.safeDark]}>
      <LinearGradient
        colors={isDark ? ["#111827", "#211B32", "#291B24"] : [C.bg1, C.bg2, C.bg3]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        style={styles.scrollView}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Care Space</Text>
            <Text style={styles.headerSub}>Your healing space</Text>
          </View>
          <View style={styles.headerBtns}>
            {/* Ask Bloop for help with current phase */}
            <Pressable
              onPress={() =>
                askBloop(
                  `Help me find the right wellness routine for my ${pc.pillLabel.toLowerCase()} phase.`
                )
              }
              style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
              accessibilityLabel="Ask Bloop for wellness help"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="chat-question-outline" size={20} color={C.muted} />
            </Pressable>
            {/* Decorative brand mark */}
            <View style={styles.headerIconBtnDecor} pointerEvents="none">
              <MaterialCommunityIcons name="spa-outline" size={20} color={C.lavender} />
            </View>
          </View>
        </View>

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <BotanicalLeaves />
          <HeroGlow />

          <View style={styles.bloopWrap}>
            <CachedImage source={imgBloop} style={styles.bloopImg} />
          </View>

          {/* Hero text — driven by active phase */}
          <Text style={styles.heroText}>
            {pc.heroPre}
            <Text style={styles.heroAccent}>{pc.heroAccent}</Text>
            {pc.heroPost}
          </Text>

          {/* Recovery pill — driven by active phase */}
          <View style={styles.recoveryPill}>
            <MaterialCommunityIcons name={pc.pillIcon} size={16} color={C.purple} />
            <Text style={styles.recoveryPillText}>{pc.pillLabel}</Text>
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
                  active && {
                    borderColor: p.color,
                    borderWidth: 1.5,
                    backgroundColor: p.color + "12",
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityLabel={p.label.replace("\n", " ")}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <MaterialCommunityIcons
                  name={p.icon}
                  size={22}
                  color={active ? p.color : C.muted}
                />
                <Text
                  style={[
                    styles.phaseCardLabel,
                    active && { color: p.color, fontFamily: F.uiSemiBold },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Recommended for you (phase-driven) ──────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel2}>Recommended for you</Text>
          <Pressable
            onPress={() =>
              askBloop(`Show me more wellness recommendations for my ${pc.pillLabel.toLowerCase()} phase.`)
            }
            style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
            accessibilityLabel="View all recommendations"
            hitSlop={10}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={C.lavender} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recScroll}
        >
          {pc.recs.map((r, i) => (
            <Pressable
              key={r.key}
              onPress={() => askBloop(`Tell me more about "${r.title.replace("\n", " ")}" for my ${pc.pillLabel.toLowerCase()} phase.`)}
              style={({ pressed }) => [
                styles.recCard,
                i === 0 && { marginLeft: 20 },
                pressed && styles.pressed,
              ]}
              accessibilityLabel={r.title.replace("\n", " ")}
            >
              <LinearGradient
                colors={r.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 1 }}
                style={styles.recCardInner}
              >
                <View style={[styles.recIconWrap, { backgroundColor: r.iconBg }]}>
                  <MaterialCommunityIcons name={r.icon} size={36} color={C.white} />
                </View>
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
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Breathing Space (preserved exactly) ─────────────────────── */}
        <View style={styles.breathingCard}>
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

          <View style={styles.breathLeft}>
            <Text style={styles.breathTitle}>Breathing space</Text>
            <Text style={styles.breathSub}>Take a moment for you</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isBreathing ? "Pause breathing exercise" : "Start breathing exercise"}
              style={styles.breathPlayBtn}
              onPress={toggleBreathing}
            >
              <MaterialCommunityIcons
                name={isBreathing ? "pause" : "play"}
                size={18}
                color={C.text}
              />
            </Pressable>
          </View>

          <View style={styles.breathCenter}>
            <View style={styles.breathOrbWrap}>
              <Animated.View style={[styles.breathOrb, breathAnimStyle]} />
            </View>
            <Text style={styles.breathPhaseLabel}>Inhale · Hold · Exhale</Text>
          </View>

          <View style={styles.breathRight}>
            <Text style={styles.breathTimer}>2:30</Text>
            <Text style={styles.breathTimerUnit}>min</Text>
          </View>
        </View>

        {/* ── Today's support (phase-driven, each tip tappable → Bloop) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel2}>Today's support</Text>
          <Pressable
            onPress={() =>
              askBloop(`What else can help me today during my ${pc.pillLabel.toLowerCase()} phase?`)
            }
            style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
            accessibilityLabel="See all support tips"
            hitSlop={10}
          >
            <Text style={styles.viewAllText}>See all</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={C.lavender} />
          </Pressable>
        </View>

        {/* Bloop nudge — phase-specific prompt */}
        <Pressable
          onPress={() => askBloop(pc.careCopy)}
          style={({ pressed }) => [styles.bloopNudge, pressed && styles.pressed]}
          accessibilityLabel="Ask Bloop"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="chat-processing-outline" size={15} color={C.purple} />
          <Text style={styles.bloopNudgeText} numberOfLines={1}>
            Ask Bloop: <Text style={styles.bloopNudgePrompt}>{pc.careCopy}</Text>
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={14} color={C.lavender} />
        </Pressable>

        <View style={styles.supportGrid}>
          {pc.support.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => askBloop(item.bloopMsg)}
              style={({ pressed }) => [styles.supportPill, pressed && styles.pressed]}
              accessibilityLabel={item.text.replace("\n", " ")}
              accessibilityRole="button"
            >
              <View style={[styles.supportIconWrap, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.supportText}>{item.text}</Text>
              <MaterialCommunityIcons name="chevron-right" size={13} color={C.faint} />
            </Pressable>
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
  safeDark: {
    backgroundColor: "#111827",
  },
  scrollView: { flex: 1, backgroundColor: "transparent" },
  scroll: {
    paddingTop: 8,
    paddingBottom: 28,
    flexGrow: 1,
  },

  // Header
  header: {
    alignItems:      "flex-start",
    flexDirection:   "row",
    justifyContent:  "space-between",
    marginBottom:    0,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color:         C.text,
    fontFamily:    F.luxuryBold,
    fontSize:      28,
    letterSpacing: 0.2,
    lineHeight:    34,
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
    alignItems:      "center",
    backgroundColor: C.cardBg,
    borderColor:     C.cardBdr,
    borderRadius:    20,
    borderWidth:     1,
    height:          40,
    justifyContent:  "center",
    shadowColor:     "#D6C3B9",
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.12,
    shadowRadius:    8,
    width:           40,
  },
  // Purely decorative — same size as button but no shadow/border interaction cue
  headerIconBtnDecor: {
    alignItems:     "center",
    height:         40,
    justifyContent: "center",
    width:          40,
    opacity:        0.55,
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
    color:             C.text,
    fontFamily:        F.luxuryBold,
    fontSize:          20,
    lineHeight:        30,
    marginBottom:      14,
    paddingHorizontal: 28,
    textAlign:         "center",
  },
  heroAccent: {
    color:      C.purple,
    fontFamily: F.luxuryItalic,
  },
  recoveryPill: {
    alignItems:        "center",
    backgroundColor:   "rgba(139,99,214,0.10)",
    borderColor:       "rgba(139,99,214,0.22)",
    borderRadius:      24,
    borderWidth:       1,
    flexDirection:     "row",
    gap:               6,
    paddingHorizontal: 16,
    paddingVertical:   8,
  },
  recoveryPillText: {
    color:      C.purple,
    fontFamily: F.uiSemiBold,
    fontSize:   13,
  },

  // Phase cards
  sectionLabel: {
    color:             C.text,
    fontFamily:        F.uiBold,
    fontSize:          15,
    marginBottom:      12,
    marginTop:         20,
    paddingHorizontal: 20,
  },
  phaseScrollView: {
    marginBottom: 6,
  },
  phaseScroll: {
    gap:               10,
    paddingHorizontal: 20,
  },
  phaseCard: {
    alignItems:        "center",
    backgroundColor:   C.cardBg,
    borderColor:       C.cardBdr,
    borderRadius:      18,
    borderWidth:       1,
    height:            88,
    justifyContent:    "center",
    gap:               8,
    paddingHorizontal: 8,
    shadowColor:       "#D6C3B9",
    shadowOffset:      { width: 0, height: 3 },
    shadowOpacity:     0.10,
    shadowRadius:      8,
    width:             88,
  },
  phaseCardLabel: {
    color:      C.muted,
    fontFamily: F.uiMedium,
    fontSize:   11,
    textAlign:  "center",
  },

  // Section headers
  sectionHeader: {
    alignItems:        "center",
    flexDirection:     "row",
    justifyContent:    "space-between",
    marginBottom:      12,
    marginTop:         22,
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

  // Recommendation cards
  recScroll: {
    gap:          12,
    paddingRight: 20,
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
  recBottomLeft: { flex: 1 },
  recTitle: {
    color:        C.white,
    fontFamily:   F.uiBold,
    fontSize:     13,
    lineHeight:   18,
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
    alignItems:      "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius:    16,
    height:          32,
    justifyContent:  "center",
    shadowColor:     "#000",
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.10,
    shadowRadius:    6,
    width:           32,
  },

  // Breathing card (unchanged layout)
  breathingCard: {
    alignItems:        "center",
    backgroundColor:   C.cardBg,
    borderColor:       C.cardBdr,
    borderRadius:      28,
    borderWidth:       1,
    flexDirection:     "row",
    height:            BCARD_H,
    justifyContent:    "space-between",
    marginHorizontal:  20,
    marginTop:         0,
    overflow:          "hidden",
    paddingHorizontal: 16,
    shadowColor:       "#D6C3B9",
    shadowOffset:      { width: 0, height: 6 },
    shadowOpacity:     0.12,
    shadowRadius:      18,
  },
  breathLeft: { flex: 1, gap: 4 },
  breathTitle: {
    color:      C.text,
    fontFamily: F.uiBold,
    fontSize:   15,
  },
  breathSub: {
    color:        C.muted,
    fontFamily:   F.uiRegular,
    fontSize:     11,
    marginBottom: 10,
  },
  breathPlayBtn: {
    alignItems:      "center",
    backgroundColor: C.cardBg,
    borderColor:     C.cardBdr,
    borderRadius:    20,
    borderWidth:     1,
    height:          40,
    justifyContent:  "center",
    shadowColor:     "#D6C3B9",
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.12,
    shadowRadius:    8,
    width:           40,
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
    color:         C.muted,
    fontFamily:    F.uiMedium,
    fontSize:      10,
    letterSpacing: 0.5,
  },
  breathRight: { alignItems: "flex-end", flex: 0.7 },
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

  // Bloop nudge strip
  bloopNudge: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               8,
    marginHorizontal:  20,
    marginBottom:      12,
    paddingVertical:   10,
    paddingHorizontal: 14,
    borderRadius:      16,
    backgroundColor:   "rgba(139,99,214,0.07)",
    borderWidth:       1,
    borderColor:       "rgba(139,99,214,0.16)",
  },
  bloopNudgeText: {
    flex:       1,
    fontFamily: F.uiMedium,
    fontSize:   12,
    color:      C.muted,
  },
  bloopNudgePrompt: {
    fontFamily: F.uiSemiBold,
    color:      C.purple,
  },

  // Today's support pills
  supportGrid: {
    flexDirection:     "row",
    flexWrap:          "wrap",
    gap:               10,
    paddingHorizontal: 20,
  },
  supportPill: {
    alignItems:      "center",
    backgroundColor: C.cardBg,
    borderColor:     C.cardBdr,
    borderRadius:    18,
    borderWidth:     1,
    flexDirection:   "row",
    gap:             10,
    minWidth:        (W - 40 - 10) / 3 - 1,
    flex:            1,
    padding:         12,
    shadowColor:     "#D6C3B9",
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.10,
    shadowRadius:    8,
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

  pressed: { transform: [{ scale: 0.97 }] },
});
