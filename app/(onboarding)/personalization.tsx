/**
 * Onboarding Screen 5 — Personalization
 *
 * "What helps you feel your best?" — wellness rhythm grid, daily time selector,
 * movement style chips, AI-building preview banner.
 * Same ambient gradient canvas as screens 1–4.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { StatusBar } from "expo-status-bar";
import { CachedImage } from "../../components/CachedImage";
import { FittedText } from "../../components/system/FittedText";
import { F } from "../../constants/fonts";
import { getPersonalizationDefaults } from "../../constants/onboardingAdaptation";
import { darkColors } from "../../constants/colors";
import { useOnboardingStore } from "../../store/onboardingStore";

const colors = darkColors;

// ─── Screen geometry ──────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const SIDE_PAD  = 20;
const CARD_GAP  = 9;
const CARD_W    = (W - SIDE_PAD * 2 - CARD_GAP) / 2;
const CARD_H    = Math.round(CARD_W * 0.88);
const RHYTHM_W  = (W - SIDE_PAD * 2 - CARD_GAP * 3) / 4;
const RHYTHM_H  = Math.round(RHYTHM_W * 1.35);

// ─── Hero orbit geometry ──────────────────────────────────────────────────────
const HERO_H    = 260;
const HERO_W    = W - SIDE_PAD * 2;
const HERO_CX   = HERO_W / 2;
const HERO_CY   = 128;
const ORBIT_R   = 96;
const ORBIT_SZ  = 44;

function orbitPos(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: HERO_CX + Math.cos(rad) * ORBIT_R - ORBIT_SZ / 2,
    top:  HERO_CY + Math.sin(rad) * ORBIT_R - ORBIT_SZ / 2,
  };
}

// ─── Assets ───────────────────────────────────────────────────────────────────
const imgBloop = require("../../public/images/bloop-welcome.webp");
const imgBloopCalm = require("../../public/images/bloop-calm.webp");

// ─── Dark palette aliases (for readability in this file) ─────────────────────
const C = {
  terra:     darkColors.primaryCTA,   // Bloom Pink
  terraLight:darkColors.warning,      // Golden Sand
  onSurface: darkColors.textPrimary,  // Moon Pearl
  onVariant: darkColors.textMuted,    // Lavender Dust
  surface:   darkColors.surface,      // Blackberry Smoke
  border:    darkColors.border,       // rgba(255,255,255,0.12)
};

// ─── Orbit items ──────────────────────────────────────────────────────────────
type OrbitItem = {
  angle:     number;
  iconLib:   "ion" | "mci";
  icon:      string;
  iconColor: string;
  bg:        string;
  driftPhase: number; // 0–1 offset into breathe cycle
};

const ORBIT_ITEMS: OrbitItem[] = [
  { angle: -100, iconLib: "ion", icon: "water",     iconColor: "#5EB8FF", bg: "rgba(62,140,220,0.20)", driftPhase: 0    },
  { angle:  -35, iconLib: "mci", icon: "run",        iconColor: "#7EC8A0", bg: "rgba(94,180,140,0.18)", driftPhase: 0.18 },
  { angle:   15, iconLib: "ion", icon: "moon",       iconColor: "#B58AC8", bg: "rgba(130,100,200,0.20)", driftPhase: 0.34 },
  { angle:   80, iconLib: "ion", icon: "heart",      iconColor: "#E8A6B6", bg: "rgba(220,100,140,0.18)", driftPhase: 0.50 },
  { angle:  145, iconLib: "ion", icon: "sunny",      iconColor: "#D8B07C", bg: "rgba(210,160,100,0.18)", driftPhase: 0.66 },
  { angle: -155, iconLib: "mci", icon: "spa",        iconColor: "#A888D4", bg: "rgba(140,100,200,0.20)", driftPhase: 0.82 },
];

// ─── Wellness cards ───────────────────────────────────────────────────────────
type WellnessCard = {
  id:        string;
  label:     string;
  iconLib:   "ion" | "mci";
  icon:      string;
  iconColor: string;
  grad:      [string, string, ...string[]];
  labelColor:string;
};

const WELLNESS: WellnessCard[] = [
  {
    id: "better_sleep", label: "Better Sleep",
    iconLib: "ion", icon: "moon",
    iconColor: "#B58AC8", grad: ["#B8A0E8", "#CEBCF4", "#E8E0FA"],
    labelColor: "#B58AC8",
  },
  {
    id: "hydration", label: "Hydration",
    iconLib: "ion", icon: "water",
    iconColor: "#5EB8FF", grad: ["#90C8F0", "#B4DCF8", "#D8F0FE"],
    labelColor: "#5EB8FF",
  },
  {
    id: "gentle_move", label: "Gentle Movement",
    iconLib: "mci", icon: "human-handsup",
    iconColor: "#7EC8A0", grad: ["#90CC98", "#B4DEB8", "#D4EED8"],
    labelColor: "#7EC8A0",
  },
  {
    id: "mindful", label: "Mindful Routine",
    iconLib: "mci", icon: "meditation",
    iconColor: "#F4A261", grad: ["#F0B090", "#F8CCAA", "#FEE8D4"],
    labelColor: "#F4A261",
  },
  {
    id: "energy", label: "Energy Balance",
    iconLib: "ion", icon: "sunny",
    iconColor: "#D8B07C", grad: ["#FAD060", "#FDE89A", "#FEF6D4"],
    labelColor: "#D8B07C",
  },
  {
    id: "stress_rec", label: "Stress Recovery",
    iconLib: "mci", icon: "weather-cloudy",
    iconColor: "#9B72CB", grad: ["#B4A4E0", "#CAC0F0", "#E4DFF8"],
    labelColor: "#9B72CB",
  },
];

// ─── Daily rhythm ─────────────────────────────────────────────────────────────
type RhythmCard = {
  id:        string;
  label:     string;
  iconLib:   "ion" | "mci";
  icon:      string;
  iconColor: string;
  grad:      [string, string, ...string[]];
  labelColor:string;
};

const RHYTHMS: RhythmCard[] = [
  {
    id: "morning", label: "Morning Glow",
    iconLib: "ion", icon: "sunny",
    iconColor: "#FF8C00", grad: ["#FF8C42", "#FFAC68", "#FFD090", "#FFE8C0"],
    labelColor: "#7A3800",
  },
  {
    id: "midday", label: "Midday Flow",
    iconLib: "mci", icon: "white-balance-sunny",
    iconColor: "#2080C0", grad: ["#70B8E8", "#98D0F0", "#C4E8FA", "#E4F4FE"],
    labelColor: "#104870",
  },
  {
    id: "evening", label: "Evening Calm",
    iconLib: "ion", icon: "moon",
    iconColor: "#FFFFFF", grad: ["#8860A8", "#A888C4", "#D0A8D8", "#F0C8DC"],
    labelColor: "#FFFFFF",
  },
  {
    id: "night", label: "Late Night Mind",
    iconLib: "mci", icon: "moon-waning-crescent",
    iconColor: "#C8B8F8", grad: ["#18103C", "#2A1C60", "#40308A", "#5848B0"],
    labelColor: "#C8B8F8",
  },
];

// ─── Movement chips ───────────────────────────────────────────────────────────
type MovementChip = {
  id:        string;
  label:     string;
  iconLib:   "ion" | "mci";
  icon:      string;
  iconColor: string;
};

const MOVEMENTS: MovementChip[] = [
  { id: "yoga",     label: "Yoga",           iconLib: "mci", icon: "meditation",    iconColor: "#7B52CC" },
  { id: "walking",  label: "Walking",        iconLib: "mci", icon: "walk",          iconColor: "#4A9060" },
  { id: "stretch",  label: "Stretching",     iconLib: "mci", icon: "human-handsup", iconColor: "#7B52CC" },
  { id: "dance",    label: "Dance",          iconLib: "mci", icon: "music-note",    iconColor: "#8060B0" },
  { id: "workouts", label: "Light Workouts", iconLib: "mci", icon: "dumbbell",      iconColor: "#4A9060" },
  { id: "rest",     label: "Rest & Recovery",iconLib: "ion", icon: "leaf",          iconColor: "#C04870" },
];

// ─── Root component ───────────────────────────────────────────────────────────
export default function PersonalizationScreen() {
  const router          = useRouter();
  const setSelectedGoals = useOnboardingStore((s) => s.setSelectedGoals);
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const adaptation = getPersonalizationDefaults(selectedGoals);
  const orderedWellness = adaptation.wellnessOrder
    .map((id) => WELLNESS.find((card) => card.id === id))
    .filter((card): card is WellnessCard => card != null);

  const [selWellness,  setSelWellness ] = useState<string[]>(adaptation.wellness);
  const [selRhythm,    setSelRhythm   ] = useState(adaptation.rhythm);
  const [selMovements, setSelMovements] = useState<string[]>(adaptation.movements);

  // ── Screen entrance ────────────────────────────────────────────────────────
  const entranceOp = useRef(new Animated.Value(0)).current;
  const entranceY  = useRef(new Animated.Value(10)).current;
  const cardsOp    = useRef(new Animated.Value(0)).current;
  const cardsY     = useRef(new Animated.Value(8)).current;

  // ── Animations ──────────────────────────────────────────────────────────
  const breathe  = useRef(new Animated.Value(0)).current;
  const floatY   = useRef(new Animated.Value(0)).current;
  const auraOp   = useRef(new Animated.Value(0.28)).current;
  const aiPulse  = useRef(new Animated.Value(0)).current;
  const orbitDrifts = useRef(
    ORBIT_ITEMS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const mkLoop = (av: Animated.Value, dur: number, from: number, to: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(av, { toValue: to,   duration: dur, useNativeDriver: true }),
          Animated.timing(av, { toValue: from, duration: dur, useNativeDriver: true }),
        ])
      );

    const anims = [
      mkLoop(breathe,  3200, 0, 1),
      mkLoop(floatY,   2800, 0, 1),
      mkLoop(auraOp,   2600, 0.24, 0.58),
      mkLoop(aiPulse,  1800, 0, 1),
      ...orbitDrifts.map((d, i) => mkLoop(d, 3000 + i * 340, 0, 1)),
    ];
    anims.forEach((a) => a.start());

    Animated.parallel([
      Animated.timing(entranceOp, { toValue: 1, duration: 580, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(entranceY,  { toValue: 0, duration: 580, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(cardsOp, { toValue: 1, duration: 520, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardsY,  { toValue: 0, duration: 520, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    return () => anims.forEach((a) => a.stop());
  }, [breathe, floatY, auraOp, aiPulse, orbitDrifts]);

  const bloopScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const bloopFloat = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const aiGlow     = aiPulse.interpolate({ inputRange: [0, 1], outputRange: [0.24, 0.64] });
  const aiRingScale = aiPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.10] });

  // ── Actions ─────────────────────────────────────────────────────────────
  const toggleWellness = (id: string) =>
    setSelWellness((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleMovement = (id: string) =>
    setSelMovements((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  function handleCreate() {
    setSelectedGoals(Array.from(new Set([...selectedGoals, ...selWellness])));
    router.push("/(onboarding)/ready");
  }

  return (
    <View style={s.root}>
      <StatusBar style="light" backgroundColor="#110812" translucent />
      {/* Ambient blobs — atmosphere only */}
      <View pointerEvents="none" style={s.blob1} />
      <View pointerEvents="none" style={s.blob2} />
      <View pointerEvents="none" style={s.blob3} />

      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={s.headerCenter}>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandSub}>Built around your rhythm.</Text>
          </View>
          {/* Step 5/5 badge — Bloom Pink → Golden Sand (matches health-setup badge) */}
          <View style={[s.progressRingOuter, { shadowColor: colors.primaryCTA }]}>
            <LinearGradient
              colors={[colors.primaryCTA, colors.warning]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.progressRing}
            >
              <Text style={s.progressNum}>5</Text>
              <Text style={s.progressSlash}>/</Text>
              <Text style={s.progressDenom}>5</Text>
            </LinearGradient>
          </View>
        </View>

        {/* ── Scroll body ───────────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero — orbit scene ────────────────────────────────────── */}
          <View style={[s.heroContainer, { width: HERO_W, height: HERO_H }]}>
            {/* Botanical leaf motifs */}
            <View pointerEvents="none" style={s.leafLeft}>
              <MaterialCommunityIcons name="leaf" size={36} color="rgba(140,200,120,0.38)" />
            </View>
            <View pointerEvents="none" style={s.leafRight}>
              <MaterialCommunityIcons name="leaf" size={28} color="rgba(210,170,230,0.36)" />
            </View>

            {/* Outer orbit ring */}
            <View
              pointerEvents="none"
              style={[
                s.orbitRing,
                {
                  left: HERO_CX - ORBIT_R - ORBIT_SZ / 2 - 2,
                  top:  HERO_CY - ORBIT_R - ORBIT_SZ / 2 - 2,
                  width:  (ORBIT_R + ORBIT_SZ / 2) * 2 + 4,
                  height: (ORBIT_R + ORBIT_SZ / 2) * 2 + 4,
                  borderRadius: (ORBIT_R + ORBIT_SZ / 2) + 2,
                },
              ]}
            />

            {/* Orbit icon badges */}
            {ORBIT_ITEMS.map((item, i) => {
              const pos = orbitPos(item.angle);
              const drift = orbitDrifts[i].interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, item.driftPhase > 0.4 ? 6 : -6, 0],
              });
              const driftX = orbitDrifts[i].interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, item.driftPhase > 0.6 ? 3 : -3, 0],
              });
              return (
                <Animated.View
                  key={i}
                  pointerEvents="none"
                  style={[
                    s.orbitBadge,
                    { left: pos.left, top: pos.top, backgroundColor: item.bg },
                    { transform: [{ translateY: drift }, { translateX: driftX }] },
                  ]}
                >
                  {item.iconLib === "ion" ? (
                    <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                  ) : (
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
                  )}
                </Animated.View>
              );
            })}

            {/* Hero glow rings */}
            <Animated.View style={[s.heroAura3, { opacity: auraOp }]} />
            <Animated.View style={[s.heroAura2, { opacity: auraOp }]} />

            {/* Bloop orb */}
            <Animated.View
              style={[
                s.bloopWrap,
                { transform: [{ scale: bloopScale }, { translateY: bloopFloat }] },
              ]}
            >
              <View style={s.bloopGlow} />
              <CachedImage
                priority="high"
                source={imgBloop}
                style={s.bloopImg}
                contentFit="contain"
              />
            </Animated.View>
          </View>

          {/* ── Heading ───────────────────────────────────────────────── */}
          <Animated.View style={{ opacity: entranceOp, transform: [{ translateY: entranceY }], alignSelf: "stretch" }}>
            <Text style={s.heading}>{adaptation.heading}</Text>
            <Text style={s.headingSub}>{adaptation.subheading}</Text>
          </Animated.View>

          {/* ── Auto-selection notice ─────────────────────────────────── */}
          {adaptation.wellness.length > 0 && (
            <View style={s.autoSelectBanner}>
              <MaterialCommunityIcons name="tune-variant" size={14} color={colors.primaryCTA} />
              <Text style={s.autoSelectText}>
                Based on your goals, we selected a few starting points. You can change them.
              </Text>
            </View>
          )}

          {/* ── Wellness 2×3 grid ─────────────────────────────────────── */}
          <Animated.View style={{ opacity: cardsOp, transform: [{ translateY: cardsY }], alignSelf: "stretch" }}>
          <View style={s.wellnessGrid}>
            {orderedWellness.map((card) => {
              const isSel = selWellness.includes(card.id);
              return (
                <WellnessCardItem
                  key={card.id}
                  card={card}
                  isSelected={isSel}
                  onPress={() => toggleWellness(card.id)}
                />
              );
            })}
          </View>

          </Animated.View>

          {/* ── Daily rhythm section ──────────────────────────────────── */}
          <View style={s.glassCard}>
            <Text style={s.cardTitle}>When do you feel most like yourself?</Text>
            <View style={s.rhythmRow}>
              {RHYTHMS.map((r) => {
                const isSel = selRhythm === r.id;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setSelRhythm(r.id)}
                    style={({ pressed }) => [s.rhythmShell, pressed && s.pressed]}
                  >
                    <LinearGradient
                      colors={r.grad}
                      start={{ x: 0.2, y: 0 }}
                      end={{ x: 0.8, y: 1 }}
                      style={[s.rhythmCard, isSel && s.rhythmSelected]}
                    >
                      {/* Icon */}
                      {r.iconLib === "ion" ? (
                        <Ionicons name={r.icon as any} size={22} color={r.iconColor} />
                      ) : (
                        <MaterialCommunityIcons name={r.icon as any} size={22} color={r.iconColor} />
                      )}
                      {/* Label */}
                      <Text style={[s.rhythmLabel, { color: r.labelColor }]}>{r.label}</Text>
                      {/* Badge */}
                      {isSel && (
                        <View style={s.rhythmBadge}>
                          <Ionicons name="checkmark" size={9} color="#FFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── Movement style chips ──────────────────────────────────── */}
          <View style={s.glassCard}>
            <Text style={s.cardTitle}>What's your movement style?</Text>
            <View style={s.chipsWrap}>
              {MOVEMENTS.map((chip) => {
                const isSel = selMovements.includes(chip.id);
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => toggleMovement(chip.id)}
                    style={({ pressed }) => [
                      s.chip,
                      {
                        backgroundColor: isSel ? colors.primaryCTA : colors.surface,
                        borderColor: isSel ? colors.primaryCTA : colors.border,
                        shadowColor: isSel ? colors.primaryCTA : colors.background,
                      },
                      pressed && s.pressed,
                    ]}
                  >
                    <View style={[
                      s.chipIcon,
                      { backgroundColor: isSel ? `${colors.background}18` : `${chip.iconColor}1A` },
                    ]}>
                      {chip.iconLib === "ion" ? (
                        <Ionicons name={chip.icon as any} size={18} color={isSel ? colors.background : chip.iconColor} />
                      ) : (
                        <MaterialCommunityIcons name={chip.icon as any} size={18} color={isSel ? colors.background : chip.iconColor} />
                      )}
                    </View>
                    <Text style={[s.chipText, { color: isSel ? colors.background : colors.textPrimary }]}>
                      {chip.label}
                    </Text>
                    {isSel && (
                      <View style={s.chipCheck}>
                        <Ionicons name="checkmark" size={10} color={colors.primaryCTA} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── AI building preview banner ────────────────────────────── */}
          <View style={s.aiBanner}>
            <LinearGradient
              colors={[colors.surface, colors.surfaceRaised]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.aiBannerGrad}
            >
              {/* Left — Bloop face in orbit ring */}
              <View style={s.aiBloopWrap}>
                <Animated.View
                  style={[s.aiBloopRing, { transform: [{ scale: aiRingScale }] }]}
                />
                <Animated.View style={[s.aiBloopGlow, { opacity: aiGlow }]} />
                <CachedImage source={imgBloopCalm} style={s.aiBloopImg} contentFit="contain" />
              </View>

              {/* Center text */}
              <Text style={[s.aiText, { color: colors.textMuted }]}>
                {adaptation.aiCopy}
              </Text>

              {/* Right — guidance badge */}
              <View style={s.aiSparkleWrap}>
                <Animated.View style={[s.aiSparkleRing, { opacity: aiGlow }]} />
                <LinearGradient
                  colors={["#E07A5F", "#F4A27D"]}
                  style={s.aiSparkleCircle}
                >
                  <MaterialCommunityIcons name="heart-pulse" size={16} color="#FFF" />
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          {/* ── CTA ────────────────────────────────────────────────────── */}
          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => [s.ctaShell, pressed && s.pressed]}
          >
            <LinearGradient
              colors={[colors.primaryCTA, colors.warning]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>Create My Space</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.background} />
            </LinearGradient>
          </Pressable>

          {/* ── Page dots ─────────────────────────────────────────────── */}
          <View style={s.dotsRow}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={[s.dot, i === 4 && s.dotActive]} />
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── WellnessCardItem ─────────────────────────────────────────────────────────
// Unselected → colors.surface bg, subtle border
// Selected   → colors.surfaceRaised bg, 2px colors.primaryCTA border, bloom shadow
function WellnessCardItem({
  card,
  isSelected,
  onPress,
}: {
  card: WellnessCard;
  isSelected: boolean;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.00, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [isSelected, pulse]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.wellnessShell,
        isSelected && {
          shadowColor: colors.primaryCTA,
          shadowOpacity: 0.28,
          shadowRadius: 18,
          elevation: 6,
        },
        pressed && s.pressed,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <View
          style={[
            s.wellnessCard,
            {
              backgroundColor: isSelected ? colors.surfaceRaised : colors.surface,
              borderColor: isSelected ? colors.primaryCTA : colors.border,
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
        >
          {/* Icon illustration area */}
          <View style={s.wellnessIconArea}>
            <View
              style={[
                s.wellnessIconCircle,
                { backgroundColor: `${card.iconColor}22` },
              ]}
            >
              {card.iconLib === "ion" ? (
                <Ionicons name={card.icon as any} size={32} color={card.iconColor} />
              ) : (
                <MaterialCommunityIcons name={card.icon as any} size={32} color={card.iconColor} />
              )}
            </View>
          </View>

          {/* Label — always textPrimary on dark surface */}
          <View style={s.wellnessLabelArea}>
            <FittedText
              style={[s.wellnessLabel, { color: isSelected ? colors.primaryCTA : colors.textPrimary }]}
              numberOfLines={2}
              minScale={0.82}
            >
              {card.label}
            </FittedText>
          </View>

          {/* Selection badge */}
          {isSelected && (
            <View style={[s.wellnessBadge, { backgroundColor: colors.primaryCTA }]}>
              <Ionicons name="checkmark" size={12} color={colors.background} />
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
  safe: { flex: 1 },

  // Blobs — subtle dark atmosphere
  blob1: {
    position: "absolute", top: -140, left: -110,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: "rgba(232,166,182,0.05)",
  },
  blob2: {
    position: "absolute", top: 320, right: -160,
    width: 380, height: 380, borderRadius: 190,
    backgroundColor: "rgba(181,138,200,0.04)",
  },
  blob3: {
    position: "absolute", bottom: -80, left: -90,
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: "rgba(126,200,160,0.04)",
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: darkColors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: darkColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 2,
    flexShrink: 0,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  brandName: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: darkColors.textPrimary,
    letterSpacing: 0.3,
  },
  brandSub: {
    fontFamily: F.bodyRegular,
    fontSize: 13,
    color: darkColors.textMuted,
    marginTop: 1,
  },
  progressRingOuter: {
    shadowColor: darkColors.primaryCTA,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
    borderRadius: 28,
  },
  progressRing: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 1,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  progressNum:   { fontFamily: F.uiExtraBold, fontSize: 18, color: "#FFF", lineHeight: 22 },
  progressSlash: { fontFamily: F.uiLight,     fontSize: 14, color: "rgba(255,255,255,0.70)", lineHeight: 22 },
  progressDenom: { fontFamily: F.uiMedium,    fontSize: 13, color: "rgba(255,255,255,0.80)", lineHeight: 22 },
  lotusBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: darkColors.surfaceRaised,
    borderWidth: 1, borderColor: darkColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 2,
    flexShrink: 0,
  },

  // ScrollView
  scroll: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 16,
    alignItems: "center",
  },

  // ── Hero ────────────────────────────────────────────────────────────────
  heroContainer: {
    position: "relative",
    marginTop: 4,
    marginBottom: 8,
  },
  leafLeft: {
    position: "absolute",
    left: 0,
    top: 60,
    transform: [{ rotate: "-30deg" }],
    opacity: 0.85,
  },
  leafRight: {
    position: "absolute",
    right: 4,
    bottom: 40,
    transform: [{ rotate: "20deg" }],
    opacity: 0.78,
  },
  orbitRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: `${darkColors.primaryCTA}20`,
    borderStyle: "solid",
  },
  orbitBadge: {
    position: "absolute",
    width: ORBIT_SZ,
    height: ORBIT_SZ,
    borderRadius: ORBIT_SZ / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  heroAura3: {
    position: "absolute",
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1.5,
    borderColor: `${darkColors.primaryCTA}18`,
    left: HERO_CX - 80,
    top: HERO_CY - 80,
  },
  heroAura2: {
    position: "absolute",
    width: 116, height: 116, borderRadius: 58,
    backgroundColor: `${darkColors.primaryCTA}10`,
    borderWidth: 1.5,
    borderColor: `${darkColors.primaryCTA}22`,
    left: HERO_CX - 58,
    top: HERO_CY - 58,
  },
  bloopWrap: {
    position: "absolute",
    left: HERO_CX - 56,
    top: HERO_CY - 52,
    alignItems: "center",
    justifyContent: "center",
    width: 112,
    height: 104,
  },
  bloopGlow: {
    position: "absolute",
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: `${darkColors.primaryCTA}16`,
  },
  bloopImg: {
    width: 112,
    height: 104,
  },
  sparkle: {
    position: "absolute",
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: "rgba(224,122,95,0.44)",
  },
  sparkleSm: {
    width: 4, height: 4, borderRadius: 2,
  },

  // ── Heading ────────────────────────────────────────────────────────────
  heading: {
    fontFamily: F.luxuryBold,
    fontSize: 34,
    lineHeight: 40,
    color: darkColors.textPrimary,
    textAlign: "center",
    letterSpacing: 0.2,
    marginTop: 2,
    marginBottom: 8,
    alignSelf: "stretch",
  },
  headingSub: {
    fontFamily: F.uiMedium,
    fontSize: 14,
    color: darkColors.textMuted,
    textAlign: "center",
    marginBottom: 22,
    alignSelf: "stretch",
  },

  // ── Wellness grid ──────────────────────────────────────────────────────
  wellnessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
    alignSelf: "stretch",
    marginBottom: 16,
  },
  wellnessShell: {
    width: CARD_W,
    borderRadius: 24,
    shadowColor: "#7A4A5C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 18, elevation: 4,
  },
  wellnessCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 12,
  },
  wellnessIconArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  wellnessIconCircle: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.20)",
  },
  wellnessLabelArea: {
    paddingHorizontal: 10,
    paddingBottom: 2,
    width: "100%",
    alignItems: "center",
  },
  wellnessLabel: {
    fontFamily: F.uiBold,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    letterSpacing: 0.1,
    width: "100%",
  },
  wellnessBadge: {
    position: "absolute",
    top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 8, elevation: 4,
  },

  // ── Glass card ────────────────────────────────────────────────────────
  glassCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: darkColors.surface,
    borderWidth: 1, borderColor: darkColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 3,
    alignSelf: "stretch",
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: F.uiBold,
    fontSize: 14,
    color: darkColors.textPrimary,
    marginBottom: 14,
    letterSpacing: 0.2,
  },

  // ── Rhythm row ────────────────────────────────────────────────────────
  rhythmRow: {
    flexDirection: "row",
    gap: CARD_GAP,
  },
  rhythmShell: {
    flex: 1,
    borderRadius: 20,
    shadowColor: "#7A4A5C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 3,
  },
  rhythmCard: {
    height: RHYTHM_H,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 5,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.16)",
  },
  rhythmSelected: {
    borderWidth: 2,
    borderColor: darkColors.primaryCTA,
    shadowColor: darkColors.primaryCTA,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  rhythmLabel: {
    fontFamily: F.uiBold,
    fontSize: 10,
    lineHeight: 13,
    textAlign: "center",
    letterSpacing: 0.1,
    paddingHorizontal: 4,
  },
  rhythmBadge: {
    position: "absolute",
    top: 5, right: 5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: darkColors.primaryCTA,
    alignItems: "center", justifyContent: "center",
    shadowColor: darkColors.primaryCTA,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40, shadowRadius: 6, elevation: 3,
  },

  // ── Movement chips ────────────────────────────────────────────────────
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    alignItems: "stretch",
  },
  chip: {
    width: "48.3%",
    height: 82,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chipIcon: {
    width: 34, height: 34, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  chipText: {
    flex: 1,
    fontFamily: F.uiSemiBold,
    fontSize: 12.5,
    lineHeight: 16,
  },
  chipCheck: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: darkColors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── AI banner ─────────────────────────────────────────────────────────
  aiBanner: {
    alignSelf: "stretch",
    borderRadius: 24,
    shadowColor: "#8060B0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14, shadowRadius: 18, elevation: 4,
    marginBottom: 14,
    overflow: "hidden",
  },
  aiBannerGrad: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 24,
  },
  aiBloopWrap: {
    width: 52, height: 52,
    alignItems: "center", justifyContent: "center",
  },
  aiBloopRing: {
    position: "absolute",
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5,
    borderColor: `${darkColors.textMuted}55`,
  },
  aiBloopGlow: {
    position: "absolute",
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${darkColors.textMuted}18`,
  },
  aiBloopImg: {
    width: 46, height: 42,
  },
  aiText: {
    flex: 1,
    fontFamily: F.uiMedium,
    fontSize: 12,
    lineHeight: 18,
    color: darkColors.textMuted,
  },
  aiSparkleWrap: {
    width: 44, height: 44,
    alignItems: "center", justifyContent: "center",
  },
  aiSparkleRing: {
    position: "absolute",
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.50)",
  },
  aiSparkleCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },

  // ── CTA ───────────────────────────────────────────────────────────────
  ctaShell: {
    borderRadius: 999,
    shadowColor: darkColors.primaryCTA,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26, shadowRadius: 22, elevation: 6,
    alignSelf: "stretch",
    marginBottom: 18,
  },
  ctaBtn: {
    height: 60, borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    fontFamily: F.uiBlack,
    fontSize: 17,
    color: darkColors.background,
    letterSpacing: 0.3,
  },

  // ── Dots ──────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  dotActive: {
    width: 26, height: 8, borderRadius: 4,
    backgroundColor: darkColors.primaryCTA,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: `${darkColors.primaryCTA}44`,
  },

  // Auto-select notice
  autoSelectBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    alignSelf: "stretch",
    backgroundColor: `${darkColors.primaryCTA}10`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${darkColors.primaryCTA}28`,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  autoSelectText: {
    flex: 1,
    fontFamily: F.uiMedium,
    fontSize: 12.5,
    color: darkColors.textMuted,
    lineHeight: 18,
  },

  // Misc
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
