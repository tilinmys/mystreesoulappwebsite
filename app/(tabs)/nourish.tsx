import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
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
  Ellipse,
  LinearGradient as SvgGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
  Svg,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";

// ── Assets ────────────────────────────────────────────────────────────────────
const imgIronSupport  = require("../../public/images/nourish-iron-support.webp");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg1:       "#FCF7F6",
  bg2:       "#FDF5F2",
  bg3:       "#F8EFEA",
  deep:      "#2D2B32",
  muted:     "#8A8799",
  faint:     "#C4BDD8",
  sage:      "#7A907C",
  sagePale:  "#EAF0EB",
  sageLight: "#C4D4C8",
  teal:      "#82B5B2",
  tealPale:  "#E4F2F1",
  rose:      "#E07A5F",
  rosePale:  "#FFF0EC",
  pink:      "#F4A0A8",
  pinkPale:  "#FFF0F2",
  lavender:  "#9B82C8",
  lavPale:   "#F3EEFF",
  gold:      "#C9A040",
  goldPale:  "#FBF3E2",
  peach:     "#F4A261",
  peachPale: "#FFF4EC",
  cardBg:    "rgba(255,255,255,0.75)",
  border:    "rgba(255,255,255,0.90)",
};

// ── Constants ──────────────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");

// ── Hydration ring ─────────────────────────────────────────────────────────────
const RING_R    = 22;
const RING_CIRC = 2 * Math.PI * RING_R;        // ≈ 138.23
const CURRENT_GLASSES = 4;
const TARGET_GLASSES  = 8;
const FILL_PCT  = CURRENT_GLASSES / TARGET_GLASSES; // 0.5

// ── Phase filter data ──────────────────────────────────────────────────────────
const PHASES = [
  { id: "menstrual",  label: "Menstrual",  icon: "water-outline",          color: C.rose,     activeColor: "#FFD0D0", textColor: "#D45C6A" },
  { id: "ovulation",  label: "Ovulation",  icon: "white-balance-sunny",    color: C.gold,     activeColor: C.goldPale, textColor: C.gold },
  { id: "pms",        label: "PMS",        icon: "flower-outline",         color: C.lavender, activeColor: C.lavPale,  textColor: C.lavender },
  { id: "emotional",  label: "Emotional",  icon: "heart-outline",          color: "#D4637A",  activeColor: "#FFE8ED",  textColor: "#D4637A" },
  { id: "sleep",      label: "Sleep",      icon: "moon-waning-crescent",   color: "#7B8FCE",  activeColor: "#EEF0FF",  textColor: "#7B8FCE" },
];

// ── Today's focus data ─────────────────────────────────────────────────────────
const FOCUS_ITEMS = [
  { id: "iron",       label: "Iron",       icon: "leaf",               color: C.sage,   bg: C.sagePale  },
  { id: "hydration",  label: "Hydration",  icon: "water-outline",      color: C.teal,   bg: C.tealPale  },
  { id: "energy",     label: "Energy",     icon: "spa-outline",        color: C.peach,  bg: C.peachPale },
];

// ── Quick nourish ideas ────────────────────────────────────────────────────────
const QUICK_IDEAS = [
  { id: "tea",      label: "Herbal Tea",      icon: "tea-outline",          color: C.sage,  bg: C.sagePale   },
  { id: "soup",     label: "Warm Soup",       icon: "bowl-mix-outline",     color: C.peach, bg: C.peachPale  },
  { id: "smoothie", label: "Green Smoothie",  icon: "cup-water",            color: "#5B9E6A", bg: "#EBF5EF"  },
  { id: "nuts",     label: "Nuts & Seeds",    icon: "seed-outline",         color: C.gold,  bg: C.goldPale   },
];

// ── Hero SVG botanical illustration ───────────────────────────────────────────
function BotanicalHero() {
  return (
    <View style={styles.heroIllustWrap}>
      <Svg width={128} height={128} viewBox="0 0 128 128">
        <Defs>
          <SvgRadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0"   stopColor="#FFFFFF"  stopOpacity="0.95" />
            <Stop offset="0.6" stopColor="#F2EFE8"  stopOpacity="0.7" />
            <Stop offset="1"   stopColor="#F2EFE8"  stopOpacity="0"   />
          </SvgRadialGradient>
          <SvgGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0"   stopColor="#8FAE90" stopOpacity="1" />
            <Stop offset="1"   stopColor="#5E7D60" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        {/* Glow halo */}
        <Circle cx="64" cy="64" r="54" fill="url(#heroGlow)" />
        {/* White circle base */}
        <Circle cx="64" cy="80" r="38" fill="rgba(255,255,255,0.82)" />

        {/* Bowl */}
        <Path
          d="M 36 82 Q 36 100 64 100 Q 92 100 92 82 Z"
          fill="none"
          stroke="#7A907C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M 32 82 L 96 82"
          stroke="#7A907C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Bowl stem */}
        <Path
          d="M 64 82 L 64 76"
          stroke="#7A907C"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Main stem */}
        <Path
          d="M 64 75 C 64 68, 60 58, 56 44"
          stroke="#7A907C"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left large leaf */}
        <Path
          d="M 60 60 C 44 52, 38 38, 50 28 C 56 38, 58 52, 60 60 Z"
          fill="url(#leafGrad)"
          opacity="0.9"
        />
        {/* Left leaf vein */}
        <Path
          d="M 60 60 C 52 48, 46 36, 50 28"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Right large leaf */}
        <Path
          d="M 62 55 C 76 44, 88 32, 82 20 C 74 28, 66 44, 62 55 Z"
          fill="url(#leafGrad)"
          opacity="0.85"
        />
        {/* Right leaf vein */}
        <Path
          d="M 62 55 C 72 40, 80 28, 82 20"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Small accent leaf - left */}
        <Path
          d="M 56 50 C 46 46, 40 40, 44 32 C 50 36, 54 44, 56 50 Z"
          fill="#9BBF9E"
          opacity="0.75"
        />
        {/* Tiny sprout top */}
        <Path
          d="M 56 44 C 54 38, 56 32, 58 28"
          stroke="#7A907C"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 58 30 C 58 26, 62 22, 66 24"
          stroke="#7A907C"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Sprout tiny leaf */}
        <Path
          d="M 62 26 C 66 20, 72 20, 72 26 C 68 28, 62 28, 62 26 Z"
          fill="#9BBF9E"
          opacity="0.8"
        />
        {/* Floating dots */}
        <Circle cx="28" cy="44" r="2"   fill="#C4D4C8" opacity="0.6" />
        <Circle cx="98" cy="38" r="1.5" fill="#C4D4C8" opacity="0.5" />
        <Circle cx="90" cy="60" r="2.5" fill="#D4A066" opacity="0.4" />
        <Circle cx="22" cy="68" r="1.5" fill="#D4A066" opacity="0.35" />
      </Svg>
    </View>
  );
}

// ── SVG sparkle for insight card ──────────────────────────────────────────────
function InsightSparkles() {
  return (
    <Svg width={120} height={80} style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Sparkle 1 */}
      <Path d="M 88 12 L 90 8 L 92 12 L 88 12" fill="#C4A8E8" opacity="0.35" />
      <Path d="M 90 8 L 90 4 M 88 10 L 86 10 M 92 10 L 94 10" stroke="#C4A8E8" strokeWidth="1" opacity="0.3" />
      {/* Sparkle 2 */}
      <Path d="M 102 38 L 104 34 L 106 38 L 102 38" fill="#D4B8F0" opacity="0.28" />
      {/* Star */}
      <Path d="M 108 22 L 109.2 25.6 L 113 26.6 L 109.2 27.6 L 108 31.2 L 106.8 27.6 L 103 26.6 L 106.8 25.6 Z" fill="#B4A0D8" opacity="0.25" />
      {/* Dots */}
      <Circle cx="96" cy="58" r="2" fill="#C4A8E8" opacity="0.28" />
      <Circle cx="112" cy="50" r="1.5" fill="#D4B8F0" opacity="0.22" />
    </Svg>
  );
}

// ── Hydration ring ─────────────────────────────────────────────────────────────
function HydrationRing() {
  const progress = FILL_PCT * RING_CIRC;
  const offset   = RING_CIRC - progress;
  const cx = 28, cy = 28;

  return (
    <View style={styles.ringWrap}>
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <Defs>
          <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#A8D4D1" stopOpacity="1" />
            <Stop offset="1" stopColor="#5EA8A4" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={cx} cy={cy} r={RING_R}
          fill="none"
          stroke="#E4EEF0"
          strokeWidth="5"
        />
        {/* Progress */}
        <Circle
          cx={cx} cy={cy} r={RING_R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${RING_CIRC}`}
          strokeDashoffset={`${offset}`}
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      {/* Water drop in center */}
      <View style={styles.ringCenter}>
        <MaterialCommunityIcons name="water-outline" size={16} color={C.teal} />
      </View>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function NourishScreen() {
  const router = useRouter();
  const [activePhase, setActivePhase] = useState("menstrual");

  return (
    <LinearGradient colors={[C.bg1, C.bg2, C.bg3]} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Nourish</Text>
            <MaterialCommunityIcons
              name="leaf"
              size={16}
              color={C.gold}
              style={{ marginLeft: 6, marginTop: 4 }}
            />
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerBtn}>
              <MaterialCommunityIcons name="water-outline" size={18} color={C.teal} />
            </Pressable>
            <Pressable style={styles.headerBtn}>
              <MaterialCommunityIcons name="bookmark-outline" size={18} color={C.deep} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.headerSub}>Support your body gently</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* ── Hero banner ─────────────────────────────────────────────── */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={["#F4EFE7", "#EDE8DE", "#E8E3D8"]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Subtle ambient blobs */}
            <View style={[styles.heroBlob, { top: -20, right: 20, backgroundColor: "rgba(201,160,64,0.10)", width: 100, height: 100 }]} />
            <View style={[styles.heroBlob, { bottom: -10, left: 30, backgroundColor: "rgba(122,144,124,0.08)", width: 80, height: 80 }]} />

            <BotanicalHero />

            <Text style={styles.heroTitle}>Gentle iron support</Text>
            <Text style={styles.heroSubtitle}>for today 🍃</Text>

            <Pressable style={styles.heroBtn}>
              <MaterialCommunityIcons name="leaf" size={13} color={C.sage} />
              <Text style={styles.heroBtnText}>Hormone Support</Text>
            </Pressable>
          </View>

          {/* ── Phase filter ────────────────────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.phaseScroll}
            style={styles.phaseScrollWrap}
          >
            {PHASES.map(phase => {
              const active = activePhase === phase.id;
              return (
                <Pressable
                  key={phase.id}
                  onPress={() => setActivePhase(phase.id)}
                  style={[
                    styles.phaseCard,
                    active && { borderColor: phase.color + "60", backgroundColor: phase.activeColor },
                  ]}
                >
                  <View style={[
                    styles.phaseIconWrap,
                    active && { backgroundColor: phase.color + "20" },
                  ]}>
                    <MaterialCommunityIcons
                      name={phase.icon as any}
                      size={22}
                      color={active ? phase.color : C.muted}
                    />
                  </View>
                  <Text style={[
                    styles.phaseLabel,
                    active && { color: phase.textColor, fontFamily: F.uiSemiBold },
                  ]}>
                    {phase.label}
                  </Text>
                  {active && <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ── Today's focus ────────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Today's focus</Text>
          <View style={styles.focusCard}>
            {FOCUS_ITEMS.map((item, i) => (
              <View key={item.id} style={[styles.focusItem, i < FOCUS_ITEMS.length - 1 && styles.focusItemBorder]}>
                <View style={[styles.focusIconCircle, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.focusLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Cravings insight banner ──────────────────────────────────── */}
          <Pressable style={styles.insightCard}>
            <LinearGradient
              colors={["#F6EEFF", "#F0E8FF", "#FAF5FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <InsightSparkles />
            <View style={[styles.insightIconWrap, { backgroundColor: "rgba(155,130,200,0.15)" }]}>
              <MaterialCommunityIcons name="flower-tulip-outline" size={22} color={C.lavender} />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Cravings may rise</Text>
              <Text style={styles.insightBody}>Your body may be asking{"\n"}for magnesium.</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.lavender} style={{ marginLeft: "auto" }} />
          </Pressable>

          {/* ── Quick nourish ideas ──────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, styles.centeredTitle]}>Quick nourish ideas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickScroll}
          >
            {QUICK_IDEAS.map(idea => (
              <Pressable key={idea.id} style={styles.quickItem}>
                <View style={[styles.quickIconCircle, { backgroundColor: idea.bg }]}>
                  <MaterialCommunityIcons name={idea.icon as any} size={26} color={idea.color} />
                </View>
                <Text style={styles.quickLabel}>{idea.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* ── Hydration tracker ───────────────────────────────────────── */}
          <Pressable style={styles.hydrationCard}>
            <HydrationRing />
            <View style={styles.hydrationInfo}>
              <Text style={styles.hydrationTitle}>Hydration</Text>
              <View style={styles.hydrationRow}>
                <Text style={styles.hydrationCount}>
                  {CURRENT_GLASSES} / {TARGET_GLASSES} glasses
                </Text>
                <View style={styles.dropIcons}>
                  {Array.from({ length: TARGET_GLASSES }).map((_, i) => (
                    <MaterialCommunityIcons
                      key={i}
                      name={i < CURRENT_GLASSES ? "water" : "water-outline"}
                      size={14}
                      color={i < CURRENT_GLASSES ? C.teal : C.faint}
                    />
                  ))}
                </View>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={C.muted}
              style={styles.hydrationChevron}
            />
          </Pressable>

          {/* ── Meal inspiration strip ───────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Meals for this phase</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealScroll}
          >
            {[
              { src: require("../../public/images/nourish-iron-support.webp"),       label: "Iron-rich dinner",    tag: "Menstrual" },
              { src: require("../../public/images/nourish-anti-inflammatory.webp"),  label: "Anti-inflammatory",   tag: "Recovery"  },
              { src: require("../../public/images/nourish-hormone-smoothie.webp"),   label: "Hormone smoothie",    tag: "Balance"   },
              { src: require("../../public/images/nourish-stress-tea.webp"),         label: "Stress-ease tea",     tag: "Calm"      },
            ].map((meal, i) => (
              <Pressable key={i} style={styles.mealCard}>
                <CachedImage
                  source={meal.src}
                  style={styles.mealImage}
                />
                <LinearGradient
                  colors={["transparent", "rgba(44,40,50,0.52)"]}
                  style={styles.mealOverlay}
                />
                <View style={styles.mealTag}>
                  <Text style={styles.mealTagText}>{meal.tag}</Text>
                </View>
                <Text style={styles.mealLabel}>{meal.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
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
    paddingBottom: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 28,
    color: C.deep,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
  headerSub: {
    fontFamily: F.uiRegular,
    fontSize: 12.5,
    color: C.muted,
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  scroll: { paddingTop: 0 },

  // Hero
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#C4B8A8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
  heroBlob: {
    position: "absolute",
    borderRadius: 100,
  },
  heroIllustWrap: {
    width: 128,
    height: 128,
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: "#3A3526",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  heroSubtitle: {
    fontFamily: F.luxuryItalic,
    fontSize: 17,
    color: C.sage,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.sagePale,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "rgba(122,144,124,0.25)",
  },
  heroBtnText: {
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    color: C.sage,
  },

  // Phase filter
  phaseScrollWrap: { marginBottom: 4 },
  phaseScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 6,
  },
  phaseCard: {
    width: 74,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    gap: 6,
    position: "relative",
  },
  phaseIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  phaseLabel: {
    fontFamily: F.uiMedium,
    fontSize: 10.5,
    color: C.muted,
    textAlign: "center",
  },
  phaseDot: {
    position: "absolute",
    bottom: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Section titles
  sectionTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 17,
    color: C.deep,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  centeredTitle: {
    textAlign: "center",
    paddingHorizontal: 0,
  },

  // Today's focus
  focusCard: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    flexDirection: "row",
    paddingVertical: 18,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  focusItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  focusItemBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.05)",
  },
  focusIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  focusLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 12,
    color: C.deep,
  },

  // Cravings insight
  insightCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(196,168,232,0.3)",
    shadowColor: "#B490E0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  insightIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightText: { flex: 1 },
  insightTitle: {
    fontFamily: F.uiBold,
    fontSize: 14,
    color: C.lavender,
    marginBottom: 3,
  },
  insightBody: {
    fontFamily: F.bodyRegular,
    fontSize: 13.5,
    color: C.muted,
    lineHeight: 19,
  },

  // Quick ideas
  quickScroll: {
    paddingHorizontal: 20,
    gap: 14,
    paddingVertical: 4,
  },
  quickItem: {
    alignItems: "center",
    gap: 8,
  },
  quickIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
  },
  quickLabel: {
    fontFamily: F.uiMedium,
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    maxWidth: 66,
  },

  // Hydration
  hydrationCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  ringWrap: {
    width: 56,
    height: 56,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  hydrationInfo: { flex: 1 },
  hydrationTitle: {
    fontFamily: F.uiSemiBold,
    fontSize: 14,
    color: C.deep,
    marginBottom: 4,
  },
  hydrationRow: {
    gap: 6,
  },
  hydrationCount: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: C.muted,
  },
  dropIcons: {
    flexDirection: "row",
    gap: 3,
    marginTop: 2,
  },
  hydrationChevron: {
    marginLeft: "auto",
  },

  // Meal cards
  mealScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  mealCard: {
    width: 140,
    height: 170,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
    shadowColor: "#C0B0A8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  mealImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  mealOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mealTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginHorizontal: 10,
    marginBottom: 4,
  },
  mealTagText: {
    fontFamily: F.uiSemiBold,
    fontSize: 9.5,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  mealLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 12,
    color: "#FFFFFF",
    paddingHorizontal: 10,
    paddingBottom: 12,
    lineHeight: 16,
  },
});
