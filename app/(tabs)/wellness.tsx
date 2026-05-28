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
  Platform,
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
const imgYogaMenstrual = require("../../public/images/yoga_menstrual.png");
const imgYogaFollicular = require("../../public/images/yoga_follicular.png");
const imgYogaOvulation  = require("../../public/images/yoga_ovulation.png");
const imgYogaLuteal     = require("../../public/images/yoga_luteal.png");

// ── Helper to map cycle day to active phase ──────────────────────────────────
function getPhaseForDay(day: number): PhaseKey {
  if (day >= 1 && day <= 5) return "menstrual";
  if (day >= 6 && day <= 13) return "follicular";
  if (day >= 14 && day <= 16) return "ovulation";
  return "luteal";
}

// ── Yoga & Pranayama Curriculum ─────────────────────────────────────────────
const YOGA_CURRICULUM: Record<PhaseKey, {
  title: string;
  level: string;
  duration: string;
  bgImage: any;
  gradientColors: [string, string];
  glowColor: string;
  poses: { name: string; desc: string; flowStep: string }[];
  breathingTitle: string;
  breathingDesc: string;
}> = {
  menstrual: {
    title: "Menstrual Care Yoga",
    level: "Gentle Recovery",
    duration: "15 min",
    bgImage: imgYogaMenstrual,
    gradientColors: ["#3D2520", "#1C100E"],
    glowColor: "#E07A5F",
    breathingTitle: "Menstrual Breathing: Deep Belly",
    breathingDesc: "Deep belly breaths to soothe uterine cramps",
    poses: [
      { name: "Supta Baddha Konasana", desc: "Reclined Butterfly relaxes pelvic walls and relieves cramps.", flowStep: "Step 1 of 3: Relieve cramps" },
      { name: "Balasana", desc: "Child's Pose stretches the lower spine and eases physical exhaustion.", flowStep: "Step 2 of 3: Release back fatigue" },
      { name: "Pavanmuktasana", desc: "Knees-to-Chest Pose provides soft compression for bloating.", flowStep: "Step 3 of 3: Soothe bloating" }
    ]
  },
  follicular: {
    title: "Follicular Rise Yoga",
    level: "Energising & Bright",
    duration: "18 min",
    bgImage: imgYogaFollicular,
    gradientColors: ["#3D2A1C", "#1B172E"],
    glowColor: "#F4A261",
    breathingTitle: "Follicular Breathing: Nadi Shodhana",
    breathingDesc: "Alternate nostril breathing for hormonal balance",
    poses: [
      { name: "Marjariasana-Bitilasana", desc: "Cat-Cow flow to warm up your spine and lower pelvic floor.", flowStep: "Step 1 of 3: Spinal mobility" },
      { name: "Bhujangasana", desc: "Cobra Pose opens the chest, boosting energy and circulation.", flowStep: "Step 2 of 3: Energy boost" },
      { name: "Virabhadrasana II", desc: "Warrior II builds leg strength and boosts confidence.", flowStep: "Step 3 of 3: Power & focus" }
    ]
  },
  ovulation: {
    title: "Ovulatory Vitality Yoga",
    level: "Expansive & Radiant",
    duration: "20 min",
    bgImage: imgYogaOvulation,
    gradientColors: ["#3A2C18", "#1E1810"],
    glowColor: "#F6C177",
    breathingTitle: "Ovulatory Breathing: Kapalabhati",
    breathingDesc: "Shining skull breathing to generate warmth",
    poses: [
      { name: "Ustrasana", desc: "Camel Pose opens the chest and shoulders.", flowStep: "Step 1 of 3: Chest opening" },
      { name: "Trikonasana", desc: "Triangle Pose improves pelvic blood supply and hip stability.", flowStep: "Step 2 of 3: Pelvic circulation" },
      { name: "Adho Mukha Svanasana", desc: "Downward Dog inversion to reverse blood flow and boost focus.", flowStep: "Step 3 of 3: Clarity inversion" }
    ]
  },
  luteal: {
    title: "Luteal Calming Yoga",
    level: "Grounded & Calming",
    duration: "15 min",
    bgImage: imgYogaLuteal,
    gradientColors: ["#1E2C24", "#151522"],
    glowColor: "#81B29A",
    breathingTitle: "Luteal Breathing: Bhramari",
    breathingDesc: "Humming bee breath to soothe pre-menstrual irritability",
    poses: [
      { name: "Setu Bandhasana", desc: "Bridge Pose opens hip flexors and gently massages abdomen.", flowStep: "Step 1 of 3: Abdominal relief" },
      { name: "Viparita Karani", desc: "Legs-Up-The-Wall Pose combats fluid retention and leg fatigue.", flowStep: "Step 2 of 3: Venous drainage" },
      { name: "Uttanasana", desc: "Standing Forward Fold is a cooling inversion to calm the mind.", flowStep: "Step 3 of 3: Calming inversion" }
    ]
  },
  pms: {
    title: "PMS Recovery Yoga",
    level: "Soft & Supportive",
    duration: "15 min",
    bgImage: imgYogaLuteal,
    gradientColors: ["#2E1E34", "#1A101C"],
    glowColor: "#BDB2FF",
    breathingTitle: "PMS Recovery: Bhramari",
    breathingDesc: "Calming hummingbird breath to soothe physical tension",
    poses: [
      { name: "Setu Bandhasana", desc: "Bridge Pose opens hip flexors and gently massages abdomen.", flowStep: "Step 1 of 3: Soothe tension" },
      { name: "Viparita Karani", desc: "Legs-Up-The-Wall Pose combats fluid retention and fatigue.", flowStep: "Step 2 of 3: Restless leg relief" },
      { name: "Uttanasana", desc: "Standing Forward Fold is a cooling inversion to calm the mind.", flowStep: "Step 3 of 3: Deep mental quiet" }
    ]
  }
};

// ── Palette — Midnight Plum dark theme ────────────────────────────────────────
const C = {
  bg1:     "#110812",   // background  (Midnight Plum)
  bg2:     "#261E28",
  bg3:     "#2A1E2C",
  text:    "#F6E9EF",   // textPrimary (Moon Pearl)
  muted:   "#B58AC8",   // textMuted   (Lavender Dust)
  faint:   "#6E5680",   // dimmed muted
  lavender:"#9277C8",   // informational accent
  purple:  "#8B63D6",   // informational accent
  pink:    "#D45C82",   // informational accent
  peach:   "#F4A261",   // informational accent
  sage:    "#5E9B6B",   // informational accent
  white:   "#FFFFFF",   // rec card play icon overlay
  cardBg:  "#2E2330",   // surface     (Blackberry Smoke)
  cardBdr: "rgba(246,233,239,0.10)",   // border      (Velvet Mauve)
} as const;

// ── Dimensions ────────────────────────────────────────────────────────────────
const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;
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
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "heat",
        title:    "Warm Heat\nTherapy",
        duration: "10 min",
        icon:     "fire",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "nourish",
        title:    "Iron-Rich\nNourish",
        duration: "5 min",
        icon:     "food-apple",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
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
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "creative",
        title:    "Creative\nJournaling",
        duration: "10 min",
        icon:     "pencil-outline",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "cardio",
        title:    "Gentle\nCardio",
        duration: "25 min",
        icon:     "run",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
    ],
    support: [
      {
        key:      "newthings",
        icon:     "flower-outline",
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
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "hiit",
        title:    "HIIT Lite\nWorkout",
        duration: "15 min",
        icon:     "lightning-bolt",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "connect",
        title:    "Connect &\nCommunicate",
        duration: "10 min",
        icon:     "account-voice",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
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
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "walk",
        title:    "Calming\nNature Walk",
        duration: "20 min",
        icon:     "walk",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "nourishreset",
        title:    "Nourish\nReset",
        duration: "10 min",
        icon:     "food-apple",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
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
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "bath",
        title:    "Warm Bath\nRitual",
        duration: "20 min",
        icon:     "hot-tub",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
      {
        key:      "breathe",
        title:    "Mindful\nBreathing",
        duration: "10 min",
        icon:     "meditation",
        colors:   ["#3D2E50", "#2A1E3A"],
        iconBg:   "rgba(255,255,255,0.12)",
      },
    ],
    support: [
      {
        key:      "mood",
        icon:     "emoticon-outline",
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
  useColorMode(); // keep hook for future use

  const [activePhase, setActivePhase] = useState<PhaseKey>(getPhaseForDay(18));
  const [isBreathing, setIsBreathing] = useState(false);

  // Derive all phase-specific content from the active phase
  const pc = PHASE_CONTENT[activePhase];
  const curriculum = YOGA_CURRICULUM[activePhase];

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
    <SafeAreaView edges={["top"]} style={styles.safe}>
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
              accessibilityLabel="Open wellness guidance"
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
                    borderColor: "#E8A6B6",
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

        {/* ── Today's Cycle-Synced Movement (phase-driven) ───────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel2}>Today's Cycle-Synced Movement</Text>
          <Pressable
            onPress={() =>
              askBloop(`Show me more about the ${curriculum.title} sequence for my ${pc.pillLabel.toLowerCase()} phase.`)
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
          {curriculum.poses.map((pose, idx) => (
            <Pressable
              key={idx}
              onPress={() =>
                askBloop(`I'd like to do the ${curriculum.title} pose: "${pose.name}". Can you guide me through this practice?`)
              }
              style={({ pressed }) => [
                styles.movementCard,
                idx === 0 && { marginLeft: 20 },
                pressed && styles.pressed,
              ]}
              accessibilityLabel={pose.name}
            >
              <View style={styles.movementCardInner}>
                <View
                  style={[
                    styles.movementAccent,
                    { backgroundColor: `${curriculum.glowColor}24` },
                  ]}
                />

                <View style={styles.movementThumbWrap}>
                  <CachedImage
                    source={curriculum.bgImage}
                    style={styles.movementThumb}
                    contentFit="contain"
                  />
                </View>

                <View style={styles.movementContent}>
                  <View style={styles.movementCardTop}>
                    <Text style={styles.movementStepText} numberOfLines={1}>
                      {pose.flowStep}
                    </Text>
                    <View
                      style={[
                        styles.movementPillTag,
                        {
                          backgroundColor: `${curriculum.glowColor}18`,
                          borderColor: `${curriculum.glowColor}36`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.movementPillTagText,
                          { color: curriculum.glowColor },
                        ]}
                        numberOfLines={1}
                      >
                        {curriculum.level}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.movementPoseName} numberOfLines={1}>
                    {pose.name}
                  </Text>
                  <Text style={styles.movementPoseDesc} numberOfLines={2}>
                    {pose.desc}
                  </Text>
                  
                  <View style={styles.movementPlayRow}>
                    <View style={styles.movementMetaRow}>
                      <MaterialCommunityIcons name="clock-outline" size={13} color={C.muted} />
                      <Text style={styles.movementDurationText}>{curriculum.duration}</Text>
                    </View>
                    <View
                      style={[
                        styles.movementPlayBtn,
                        { borderColor: `${curriculum.glowColor}40` },
                      ]}
                    >
                      <MaterialCommunityIcons name="play" size={16} color={C.text} />
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Breathing Space (calibrated and phase-appropriate) ───────── */}
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
            <Text style={styles.breathTitle} numberOfLines={1}>{curriculum.breathingTitle}</Text>
            <Text style={styles.breathSub} numberOfLines={2}>{curriculum.breathingDesc}</Text>
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
              <Animated.View style={[styles.breathOrb, breathAnimStyle, { backgroundColor: curriculum.glowColor, shadowColor: curriculum.glowColor }]} />
            </View>
            <Text style={styles.breathPhaseLabel}>Inhale · Hold · Exhale</Text>
          </View>

          <View style={styles.breathRight}>
            <Text style={styles.breathTimer}>2:30</Text>
            <Text style={styles.breathTimerUnit}>min</Text>
          </View>
        </View>

        {/* ── Today's support (phase-driven, each tip tappable → Bloop) ── */}
        {false && (
          <>
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

            {/* Phase-specific support prompt */}
            <Pressable
              onPress={() => askBloop(pc.careCopy)}
              style={({ pressed }) => [styles.bloopNudge, pressed && styles.pressed]}
              accessibilityLabel="Open phase support"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="chat-processing-outline" size={15} color={C.purple} />
              <Text style={styles.bloopNudgeText} numberOfLines={1}>
                Support: <Text style={styles.bloopNudgePrompt}>{pc.careCopy}</Text>
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
          </>
        )}
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
  scrollView: { flex: 1, backgroundColor: "transparent" },
  scroll: {
    paddingTop: 8,
    paddingBottom: 100,
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
    fontFamily:    F.uiBold,
    fontSize:      26,
    fontWeight:    "700",
    letterSpacing: -0.3,
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
    borderColor:     "rgba(246,233,239,0.10)",
    borderRadius:    999,
    borderWidth:     1,
    height:          40,
    justifyContent:  "center",
    shadowColor:     "#E8A6B6",
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
    fontFamily:        F.uiBold,
    fontSize:          20,
    fontWeight:        "700",
    lineHeight:        30,
    marginBottom:      14,
    paddingHorizontal: 28,
    textAlign:         "center",
  },
  heroAccent: {
    color:      C.purple,
    fontFamily: F.uiBold,
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
    color:             C.muted,
    fontFamily:        F.uiBold,
    fontSize:          12,
    letterSpacing:     1.0,
    marginBottom:      12,
    marginTop:         20,
    paddingHorizontal: 20,
    textTransform:     "uppercase",
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
    borderColor:       "rgba(246,233,239,0.10)",
    borderRadius:      24,
    borderWidth:       1,
    height:            88,
    justifyContent:    "center",
    gap:               8,
    paddingHorizontal: 8,
    shadowColor:       "#E8A6B6",
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
    color:         C.muted,
    fontFamily:    F.uiBold,
    fontSize:      12,
    letterSpacing: 1.0,
    textTransform: "uppercase",
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

  movementCard: {
    width: Math.min(312, W - 52),
    minHeight: 168,
    borderRadius: 24,
    marginRight: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
    shadowColor: "#E8A6B6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  movementCardInner: {
    flex: 1,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  movementAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    top: 0,
    width: 4,
  },
  movementThumbWrap: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(246,233,239,0.06)",
    borderColor: "rgba(246,233,239,0.10)",
    borderRadius: 20,
    borderWidth: 1,
    height: 104,
    justifyContent: "center",
    overflow: "hidden",
    width: 92,
  },
  movementThumb: {
    height: 92,
    opacity: 0.82,
    width: 92,
  },
  movementContent: {
    flex: 1,
    gap: 8,
    justifyContent: "space-between",
  },
  movementCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  movementStepText: {
    color: C.muted,
    flex: 1,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },
  movementPillTag: {
    maxWidth: 104,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  movementPillTagText: {
    fontFamily: F.uiBold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  movementPoseName: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 21,
  },
  movementPoseDesc: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  movementPlayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  movementMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(246,233,239,0.06)",
    borderColor: "rgba(246,233,239,0.10)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  movementDurationText: {
    color: C.text,
    fontFamily: F.uiMedium,
    fontSize: 12,
  },
  movementPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
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
    shadowColor:   "#E8A6B6",
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
    shadowColor:     "#E8A6B6",
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.10,
    shadowRadius:    6,
    width:           32,
  },

  // Breathing card (unchanged layout)
  breathingCard: {
    alignItems:        "center",
    backgroundColor:   C.cardBg,
    borderColor:       "rgba(246,233,239,0.10)",
    borderRadius:      28,
    borderWidth:       1,
    flexDirection:     "row",
    height:            BCARD_H,
    justifyContent:    "space-between",
    marginHorizontal:  20,
    marginTop:         20,
    overflow:          "hidden",
    paddingHorizontal: 20,
    shadowColor:       "#E8A6B6",
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
    borderColor:     "rgba(246,233,239,0.10)",
    borderRadius:    20,
    borderWidth:     1,
    height:          40,
    justifyContent:  "center",
    shadowColor:     "#E8A6B6",
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
    borderRadius:      24,
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
    borderColor:     "rgba(246,233,239,0.10)",
    borderRadius:    24,
    borderWidth:     1,
    flexDirection:   "row",
    gap:             10,
    minWidth:        (W - 40 - 10) / 3 - 1,
    flex:            1,
    padding:         20,
    shadowColor:     "#E8A6B6",
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
