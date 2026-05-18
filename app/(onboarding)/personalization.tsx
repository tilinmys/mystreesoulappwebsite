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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { getPersonalizationDefaults } from "../../constants/onboardingAdaptation";
import { useOnboardingStore } from "../../store/onboardingStore";

// ─── Screen geometry ──────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const SIDE_PAD  = 20;
const CARD_GAP  = 9;
const CARD_W    = (W - SIDE_PAD * 2 - CARD_GAP * 2) / 3;
const CARD_H    = Math.round(CARD_W * 1.52);
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

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  terra:     "#E07A5F",
  terraLight:"#F4A27D",
  onSurface: "#221B1C",
  onVariant: "#6B4C55",
  surface:   "rgba(255,255,255,0.66)",
  border:    "rgba(255,255,255,0.82)",
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
  { angle: -100, iconLib: "ion", icon: "water",     iconColor: "#3A8BC8", bg: "#D4EEFF", driftPhase: 0    },
  { angle:  -35, iconLib: "mci", icon: "run",        iconColor: "#4A9060", bg: "#D4EED9", driftPhase: 0.18 },
  { angle:   15, iconLib: "ion", icon: "moon",       iconColor: "#7B52CC", bg: "#E4D4F4", driftPhase: 0.34 },
  { angle:   80, iconLib: "ion", icon: "heart",      iconColor: "#C04870", bg: "#FFD4E8", driftPhase: 0.50 },
  { angle:  145, iconLib: "ion", icon: "sunny",      iconColor: "#C09020", bg: "#FEF0C0", driftPhase: 0.66 },
  { angle: -155, iconLib: "mci", icon: "spa",        iconColor: "#8060B0", bg: "#E4D4F4", driftPhase: 0.82 },
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
    iconColor: "#6040A0", grad: ["#B8A0E8", "#CEBCF4", "#E8E0FA"],
    labelColor: "#3E287A",
  },
  {
    id: "hydration", label: "Hydration",
    iconLib: "ion", icon: "water",
    iconColor: "#2878B8", grad: ["#90C8F0", "#B4DCF8", "#D8F0FE"],
    labelColor: "#184878",
  },
  {
    id: "gentle_move", label: "Gentle Movement",
    iconLib: "mci", icon: "human-handsup",
    iconColor: "#326848", grad: ["#90CC98", "#B4DEB8", "#D4EED8"],
    labelColor: "#1E4830",
  },
  {
    id: "mindful", label: "Mindful Routine",
    iconLib: "mci", icon: "meditation",
    iconColor: "#A85038", grad: ["#F0B090", "#F8CCAA", "#FEE8D4"],
    labelColor: "#703020",
  },
  {
    id: "energy", label: "Energy Balance",
    iconLib: "ion", icon: "sunny",
    iconColor: "#9C7000", grad: ["#FAD060", "#FDE89A", "#FEF6D4"],
    labelColor: "#6A4800",
  },
  {
    id: "stress_rec", label: "Stress Recovery",
    iconLib: "mci", icon: "weather-cloudy",
    iconColor: "#6040A0", grad: ["#B4A4E0", "#CAC0F0", "#E4DFF8"],
    labelColor: "#3C2870",
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
    iconLib: "mci", icon: "star-four-points",
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
  { id: "rest",     label: "Rest & Recovery",iconLib: "ion", icon: "heart",         iconColor: "#C04870" },
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
      {/* Gradient canvas */}
      <LinearGradient
        colors={["#FCE0D0", "#F5DCF0", "#E8DFF8", "#FAECD4"]}
        locations={[0, 0.30, 0.64, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient blobs */}
      <View pointerEvents="none" style={s.blob1} />
      <View pointerEvents="none" style={s.blob2} />
      <View pointerEvents="none" style={s.blob3} />

      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandSub}>Built around your rhythm.</Text>
          </View>
          <View style={s.lotusBtn}>
            <MaterialCommunityIcons name="spa" size={20} color={C.onVariant} />
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
          <Text style={s.heading}>{adaptation.heading}</Text>
          <Text style={s.headingSub}>{adaptation.subheading}</Text>

          {/* ── Wellness rhythm 3×2 grid ──────────────────────────────── */}
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
                      isSel && s.chipSelected,
                      pressed && s.pressed,
                    ]}
                  >
                    <View style={[s.chipIcon, { backgroundColor: chip.iconColor + "1A" }]}>
                      {chip.iconLib === "ion" ? (
                        <Ionicons name={chip.icon as any} size={15} color={chip.iconColor} />
                      ) : (
                        <MaterialCommunityIcons name={chip.icon as any} size={15} color={chip.iconColor} />
                      )}
                    </View>
                    <Text style={[s.chipText, isSel && s.chipTextSel]}>{chip.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── AI building preview banner ────────────────────────────── */}
          <View style={s.aiBanner}>
            <LinearGradient
              colors={["#D8CCEE", "#E8DCFA", "#F4ECFE"]}
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
              <Text style={s.aiText}>
                {adaptation.aiCopy}
              </Text>

              {/* Right — cosmic heart */}
              <View style={s.aiHeartWrap}>
                <Animated.View style={[s.aiHeartRing, { opacity: aiGlow }]} />
                <LinearGradient
                  colors={["#E07A5F", "#F4A27D"]}
                  style={s.aiHeartCircle}
                >
                  <Ionicons name="heart" size={16} color="#FFF" />
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
              colors={["#E07A5F", "#F4A27D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>Create My Space</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </LinearGradient>
          </Pressable>

          {/* ── Page dots ─────────────────────────────────────────────── */}
          <View style={s.dotsRow}>
            {[0, 1, 2, 3, 4, 5].map((i) =>
              i === 4 ? (
                <View key={i} style={s.dotActive} />
              ) : (
                <View key={i} style={s.dot} />
              )
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── WellnessCardItem ─────────────────────────────────────────────────────────
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
          shadowColor: card.iconColor,
          shadowOpacity: 0.30,
          shadowRadius: 18,
          elevation: 6,
        },
        pressed && s.pressed,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient
          colors={card.grad}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[
            s.wellnessCard,
            isSelected && {
              borderWidth: 2,
              borderColor: card.iconColor,
            },
          ]}
        >
          {/* Icon illustration area */}
          <View style={s.wellnessIconArea}>
            <View
              style={[
                s.wellnessIconCircle,
                { backgroundColor: "rgba(255,255,255,0.45)" },
              ]}
            >
              {card.iconLib === "ion" ? (
                <Ionicons name={card.icon as any} size={38} color={card.iconColor} />
              ) : (
                <MaterialCommunityIcons name={card.icon as any} size={38} color={card.iconColor} />
              )}
            </View>
            {/* Decorative sparkle dots */}
            <View style={[s.sparkle, { top: 8, right: 14 }]} />
            <View style={[s.sparkle, s.sparkleSm, { bottom: 10, left: 12 }]} />
          </View>

          {/* Label */}
          <View style={s.wellnessLabelArea}>
            <Text style={[s.wellnessLabel, { color: card.labelColor }]} numberOfLines={2}>
              {card.label}
            </Text>
          </View>

          {/* Selection badge */}
          {isSelected && (
            <View style={[s.wellnessBadge, { backgroundColor: C.terra }]}>
              <Ionicons name="checkmark" size={12} color="#FFF" />
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FCE0D0",
  },
  safe: { flex: 1 },

  // Blobs
  blob1: {
    position: "absolute", top: -160, left: -120,
    width: 420, height: 420, borderRadius: 210,
    backgroundColor: "rgba(240,190,200,0.34)",
  },
  blob2: {
    position: "absolute", top: 300, right: -180,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: "rgba(214,174,230,0.22)",
  },
  blob3: {
    position: "absolute", bottom: -100, left: -80,
    width: 360, height: 360, borderRadius: 180,
    backgroundColor: "rgba(198,228,200,0.18)",
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 8,
    paddingBottom: 6,
  },
  brandName: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: C.onSurface,
    letterSpacing: 0.3,
  },
  brandSub: {
    fontFamily: F.bodyRegular,
    fontSize: 13,
    color: C.onVariant,
    marginTop: 1,
  },
  lotusBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 10, elevation: 2,
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
    borderColor: "rgba(224,180,100,0.30)",
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
    borderColor: "rgba(255,255,255,0.70)",
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  heroAura3: {
    position: "absolute",
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.18)",
    left: HERO_CX - 80,
    top: HERO_CY - 80,
  },
  heroAura2: {
    position: "absolute",
    width: 116, height: 116, borderRadius: 58,
    backgroundColor: "rgba(240,190,200,0.20)",
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.28)",
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
    backgroundColor: "rgba(255,220,180,0.44)",
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
    color: C.onSurface,
    textAlign: "center",
    letterSpacing: 0.2,
    marginTop: 2,
    marginBottom: 8,
    alignSelf: "stretch",
  },
  headingSub: {
    fontFamily: F.uiMedium,
    fontSize: 14,
    color: C.onVariant,
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
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.70)",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  wellnessIconArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  wellnessIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.60)",
  },
  wellnessLabelArea: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    width: "100%",
    alignItems: "center",
  },
  wellnessLabel: {
    fontFamily: F.uiBold,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    letterSpacing: 0.2,
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
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08, shadowRadius: 22, elevation: 3,
    alignSelf: "stretch",
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: F.uiBold,
    fontSize: 14,
    color: C.onSurface,
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
    borderColor: "rgba(255,255,255,0.60)",
  },
  rhythmSelected: {
    borderWidth: 2,
    borderColor: C.terra,
    shadowColor: C.terra,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  rhythmLabel: {
    fontFamily: F.uiBold,
    fontSize: 9,
    lineHeight: 12,
    textAlign: "center",
    letterSpacing: 0.1,
    paddingHorizontal: 4,
  },
  rhythmBadge: {
    position: "absolute",
    top: 5, right: 5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.terra,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40, shadowRadius: 6, elevation: 3,
  },

  // ── Movement chips ────────────────────────────────────────────────────
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)",
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 2,
  },
  chipSelected: {
    backgroundColor: "rgba(224,122,95,0.12)",
    borderColor: "rgba(224,122,95,0.42)",
    shadowColor: C.terra,
    shadowOpacity: 0.16, shadowRadius: 12, elevation: 3,
  },
  chipIcon: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  chipText: {
    fontFamily: F.uiMedium,
    fontSize: 13,
    color: C.onVariant,
  },
  chipTextSel: {
    color: C.terra,
    fontFamily: F.uiSemiBold,
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
    borderColor: "rgba(255,255,255,0.80)",
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
    borderColor: "rgba(140,100,200,0.42)",
  },
  aiBloopGlow: {
    position: "absolute",
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(160,120,220,0.22)",
  },
  aiBloopImg: {
    width: 46, height: 42,
  },
  aiText: {
    flex: 1,
    fontFamily: F.uiMedium,
    fontSize: 12,
    lineHeight: 18,
    color: C.onVariant,
  },
  aiHeartWrap: {
    width: 44, height: 44,
    alignItems: "center", justifyContent: "center",
  },
  aiHeartRing: {
    position: "absolute",
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.50)",
  },
  aiHeartCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },

  // ── CTA ───────────────────────────────────────────────────────────────
  ctaShell: {
    borderRadius: 999,
    shadowColor: C.terra,
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
    color: "#FFF",
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
    backgroundColor: C.terra,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "rgba(224,122,95,0.28)",
  },

  // Misc
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
