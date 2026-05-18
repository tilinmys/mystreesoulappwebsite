/**
 * Onboarding Screen 4 — Emotional Wellness
 *
 * "How have you been feeling lately?" — mood grid, energy/stress sliders,
 * sleep rhythm selector. Emotionally safe, premium, non-clinical.
 * Same ambient gradient canvas as screens 1–3.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { getEmotionalDefaults, getOnboardingPrompt } from "../../constants/onboardingAdaptation";
import { useOnboardingStore } from "../../store/onboardingStore";

// ─── Screen geometry ──────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const SIDE_PAD = 20;
const MOOD_GAP = 9;
const MOOD_W   = (W - SIDE_PAD * 2 - MOOD_GAP * 2) / 3;
const MOOD_H   = Math.round(MOOD_W * 1.38);

// ─── Assets ───────────────────────────────────────────────────────────────────
const imgBloop = require("../../public/images/bloop-calm.webp");

// ─── Mood cards ───────────────────────────────────────────────────────────────
type MoodCard = {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  grad: [string, string];
  iconColor: string;
  textColor: string;
  selBorder: string;
};

const MOODS: MoodCard[] = [
  {
    id: "calm",
    label: "Calm",
    icon: "leaf",
    grad: ["#A8D8B0", "#C8EDD0"],
    iconColor: "#2E7A46",
    textColor: "#1B5230",
    selBorder: "#3E9B57",
  },
  {
    id: "anxious",
    label: "Anxious",
    icon: "weather-cloudy",
    grad: ["#C9B6ED", "#DED2F7"],
    iconColor: "#6B42BB",
    textColor: "#47298A",
    selBorder: "#7B52CC",
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    icon: "weather-windy",
    grad: ["#F2B49A", "#FAD5C7"],
    iconColor: "#B84030",
    textColor: "#883020",
    selBorder: "#D05040",
  },
  {
    id: "burnt_out",
    label: "Burnt Out",
    icon: "fire",
    grad: ["#FAC870", "#FDE9BC"],
    iconColor: "#B06000",
    textColor: "#7A4200",
    selBorder: "#C87800",
  },
  {
    id: "sad",
    label: "Sad",
    icon: "water-outline",
    grad: ["#AABDE8", "#CADAF8"],
    iconColor: "#2E4EA0",
    textColor: "#1C3477",
    selBorder: "#3A63C0",
  },
  {
    id: "motivated",
    label: "Motivated",
    icon: "star-shooting",
    grad: ["#FAE57A", "#FEF4C0"],
    iconColor: "#B08800",
    textColor: "#7A5E00",
    selBorder: "#D0A400",
  },
];

// ─── Sleep options ────────────────────────────────────────────────────────────
type SleepOption = {
  id: string;
  label: string;
  scoreKey: "poor" | "okay" | "good" | "great";
  grad: [string, string];
  iconColor: string;
  textColor: string;
};

const SLEEP_OPTIONS: SleepOption[] = [
  {
    id: "restless",
    label: "Restless",
    scoreKey: "poor",
    grad: ["#CDB9EC", "#E3D5F5"],
    iconColor: "#6B42BB",
    textColor: "#47298A",
  },
  {
    id: "okay",
    label: "Okay",
    scoreKey: "okay",
    grad: ["#A5B4E8", "#C5D0F5"],
    iconColor: "#3A52AA",
    textColor: "#223688",
  },
  {
    id: "deep_sleep",
    label: "Deep Sleep",
    scoreKey: "good",
    grad: ["#6B82C8", "#8FA4E0"],
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
  },
  {
    id: "well_rested",
    label: "Well Rested",
    scoreKey: "great",
    grad: ["#FAC870", "#FDE9BC"],
    iconColor: "#B06000",
    textColor: "#7A4200",
  },
];

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  terra:     "#E07A5F",
  terraGlow: "rgba(224,122,95,0.22)",
  onSurface: "#221B1C",
  onVariant: "#6B4C55",
  surface:   "rgba(255,255,255,0.66)",
  border:    "rgba(255,255,255,0.82)",
};

// ─── Root component ───────────────────────────────────────────────────────────
export default function EmotionalWellnessScreen() {
  const router = useRouter();
  const setEmotionalState = useOnboardingStore((s) => s.setEmotionalState);
  const setStressLevel    = useOnboardingStore((s) => s.setStressLevel);
  const setSleepScore     = useOnboardingStore((s) => s.setSleepScore);
  const selectedGoals     = useOnboardingStore((s) => s.selectedGoals);
  const prompt            = getOnboardingPrompt(selectedGoals);
  const defaults          = getEmotionalDefaults(selectedGoals);

  const [selectedMood,  setSelectedMood ] = useState(defaults.mood);
  const [energy,        setEnergy       ] = useState(52);   // 0–100
  const [stress,        setStress       ] = useState(68);   // 0–100
  const [selectedSleep, setSelectedSleep] = useState(defaults.sleep);

  // ── Hero animations ──────────────────────────────────────────────────────
  const breathe = useRef(new Animated.Value(0)).current;
  const floatY  = useRef(new Animated.Value(0)).current;
  const auraOp  = useRef(new Animated.Value(0.30)).current;
  const petal1  = useRef(new Animated.Value(0)).current;
  const petal2  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mkLoop = (
      av: Animated.Value,
      dur: number,
      from: number,
      to: number
    ) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(av, { toValue: to,   duration: dur, useNativeDriver: true }),
          Animated.timing(av, { toValue: from, duration: dur, useNativeDriver: true }),
        ])
      );

    const animations = [
      mkLoop(breathe, 3200, 0, 1),
      mkLoop(floatY,  2800, 0, 1),
      mkLoop(auraOp,  2500, 0.25, 0.60),
      mkLoop(petal1,  6000, 0, 1),
      mkLoop(petal2,  7200, 0, 1),
    ];
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [breathe, floatY, auraOp, petal1, petal2]);

  const bloopScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const bloopFloat = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  const petal1Y = petal1.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const petal1X = petal1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 6, 0] });
  const petal2Y = petal2.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const petal2X = petal2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -5, 0] });

  // ── Continue handler ──────────────────────────────────────────────────────
  function handleContinue() {
    setEmotionalState(selectedMood);
    setStressLevel(stress);
    setSleepScore(
      SLEEP_OPTIONS.find((o) => o.id === selectedSleep)?.scoreKey ?? "okay"
    );
    router.push("/(onboarding)/personalization");
  }

  return (
    <View style={s.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#FCE0D0", "#F5DCF0", "#E8DFF8", "#FAECD4"]}
        locations={[0, 0.30, 0.64, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient blobs */}
      <View pointerEvents="none" style={s.blob1} />
      <View pointerEvents="none" style={s.blob2} />
      <View pointerEvents="none" style={s.blob3} />

      {/* Floating particle dots */}
      <FloatingParticles />

      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
        {/* ── Header row ────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandSub}>Your feelings matter here.</Text>
          </View>
          <View style={s.lotusBtn}>
            <MaterialCommunityIcons name="spa" size={20} color={C.onVariant} />
          </View>
        </View>

        {/* ── Scrollable body ──────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Hero ─────────────────────────────────────────────────── */}
          <View style={s.heroWrap}>
            {/* Outermost aura */}
            <Animated.View style={[s.aura3, { opacity: auraOp }]} />
            {/* Middle aura */}
            <Animated.View style={[s.aura2, { opacity: auraOp }]} />
            {/* Inner aura */}
            <Animated.View style={[s.aura1, { opacity: auraOp }]} />

            {/* Floating botanical petals */}
            <Animated.View
              pointerEvents="none"
              style={[s.petal, s.petalLeft, { transform: [{ translateX: petal1X }, { translateY: petal1Y }] }]}
            >
              <MaterialCommunityIcons name="leaf" size={28} color="rgba(130,200,140,0.50)" />
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[s.petal, s.petalRight, { transform: [{ translateX: petal2X }, { translateY: petal2Y }] }]}
            >
              <MaterialCommunityIcons name="leaf" size={20} color="rgba(200,160,220,0.42)" />
            </Animated.View>

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

            {/* Sparkle accents */}
            <View style={[s.sparkle, { top: 24, left: W * 0.22 }]} />
            <View style={[s.sparkle, { top: 52, right: W * 0.20 }]} />
            <View style={[s.sparkle, s.sparkleSm, { bottom: 28, left: W * 0.36 }]} />
          </View>

          {/* ── Heading ──────────────────────────────────────────────── */}
          <View style={s.focusPill}>
            <MaterialCommunityIcons name="star-four-points" size={12} color={C.terra} />
            <Text style={s.focusPillText}>{prompt.focusLabel}</Text>
          </View>
          <Text style={s.heading}>How is your Mood Today?</Text>
          <Text style={s.headingSub}>{prompt.subheading}</Text>

          {/* ── 3×2 Mood grid ───────────────────────────────────────── */}
          <View style={s.moodGrid}>
            {MOODS.map((mood) => (
              <MoodCard
                key={mood.id}
                mood={mood}
                isSelected={selectedMood === mood.id}
                onPress={() => setSelectedMood(mood.id)}
              />
            ))}
          </View>

          {/* ── Energy & Stress sliders ──────────────────────────────── */}
          <View style={s.glassCard}>
            <Text style={s.cardTitle}>Your energy lately</Text>

            <SliderRow
              icon="leaf"
              iconBg="rgba(56,160,90,0.14)"
              iconColor="#38A05A"
              label="Energy"
              value={energy}
              onChange={setEnergy}
              gradColors={["#74C98C", "#C6E87A", "#FAC850"]}
              leftLabel="Low"
              midLabel="Balanced"
              rightLabel="Drained"
            />

            <View style={s.sliderSpacer} />

            <SliderRow
              icon="lightning-bolt"
              iconBg="rgba(107,66,187,0.12)"
              iconColor="#6B42BB"
              label="Stress"
              value={stress}
              onChange={setStress}
              gradColors={["#A5B4E8", "#FAC870", "#E06060"]}
              leftLabel="Low"
              midLabel="Balanced"
              rightLabel="High"
            />
          </View>

          {/* ── Sleep rhythm ────────────────────────────────────────── */}
          <View style={s.glassCard}>
            <Text style={s.cardTitle}>Your sleep rhythm</Text>
            <View style={s.sleepRow}>
              {SLEEP_OPTIONS.map((opt) => (
                <SleepCard
                  key={opt.id}
                  option={opt}
                  isSelected={selectedSleep === opt.id}
                  onPress={() => setSelectedSleep(opt.id)}
                />
              ))}
            </View>
          </View>

          {/* ── Support banner ───────────────────────────────────────── */}
          <Pressable
            style={({ pressed }) => [s.supportBanner, pressed && s.pressed]}
            onPress={() => {/* future: navigate to resources */}}
          >
            <View style={s.supportIconWrap}>
              <LinearGradient
                colors={["#FDDDE8", "#FBF0F4"]}
                style={s.supportIconGrad}
              >
                <Ionicons name="heart" size={16} color="#C25C7E" />
              </LinearGradient>
            </View>
            <Text style={s.supportText}>Support is always available.</Text>
            <Ionicons name="chevron-forward" size={16} color={C.onVariant} />
          </Pressable>

          {/* ── Continue CTA ─────────────────────────────────────────── */}
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [s.ctaShell, pressed && s.pressed]}
          >
            <LinearGradient
              colors={["#E07A5F", "#F4A27D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </LinearGradient>
          </Pressable>

          {/* ── Page dots ─────────────────────────────────────────────── */}
          <View style={s.dotsRow}>
            {[0, 1, 2, 3, 4].map((i) =>
              i === 3 ? (
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

// ─── MoodCard ─────────────────────────────────────────────────────────────────
function MoodCard({
  mood,
  isSelected,
  onPress,
}: {
  mood: MoodCard;
  isSelected: boolean;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 160, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.00, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [isSelected, pulse]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.moodShell, pressed && s.pressed]}
    >
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient
          colors={mood.grad}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[
            s.moodCard,
            isSelected && {
              borderWidth: 2,
              borderColor: mood.selBorder,
              shadowColor: mood.selBorder,
              shadowOpacity: 0.30,
              shadowRadius: 16,
              elevation: 6,
            },
          ]}
        >
          {/* Icon illustration area */}
          <View style={s.moodIconArea}>
            <View style={[s.moodIconCircle, { backgroundColor: "rgba(255,255,255,0.38)" }]}>
              <MaterialCommunityIcons
                name={mood.icon}
                size={34}
                color={mood.iconColor}
              />
            </View>
          </View>

          {/* Label */}
          <View style={s.moodLabelArea}>
            <Text style={[s.moodLabel, { color: mood.textColor }]}>{mood.label}</Text>
          </View>

          {/* Selection badge */}
          {isSelected && (
            <View style={[s.moodBadge, { backgroundColor: C.terra }]}>
              <Ionicons name="checkmark" size={11} color="#FFF" />
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ─── SliderRow ────────────────────────────────────────────────────────────────
function SliderRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  onChange,
  gradColors,
  leftLabel,
  midLabel,
  rightLabel,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  gradColors: [string, string, string];
  leftLabel: string;
  midLabel: string;
  rightLabel: string;
}) {
  const trackWidth = useRef(0);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const pct = e.nativeEvent.locationX / (trackWidth.current || 1);
        onChange(Math.round(Math.max(0, Math.min(100, pct * 100))));
      },
      onPanResponderMove: (e) => {
        const pct = e.nativeEvent.locationX / (trackWidth.current || 1);
        onChange(Math.round(Math.max(0, Math.min(100, pct * 100))));
      },
    })
  ).current;

  // Clamp fill% so thumb doesn't overflow visually
  const fillPct: DimensionValue = `${value}%`;
  const thumbPct: DimensionValue = `${Math.max(2, Math.min(91, value))}%`;

  return (
    <View style={s.sliderRow}>
      {/* Icon badge + label */}
      <View style={s.sliderLeft}>
        <View style={[s.sliderIconBadge, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={s.sliderLabel}>{label}</Text>
      </View>

      {/* Track */}
      <View style={s.sliderRight}>
        <View
          onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
          style={s.sliderTrack}
          {...responder.panHandlers}
        >
          {/* Gradient fill */}
          <LinearGradient
            colors={gradColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[s.sliderFill, { width: fillPct }]}
          />
          {/* Thumb */}
          <View style={[s.sliderThumb, { left: thumbPct }]} />
        </View>

        {/* Axis labels */}
        <View style={s.sliderAxisRow}>
          <Text style={s.axisLabel}>{leftLabel}</Text>
          <Text style={s.axisLabel}>{midLabel}</Text>
          <Text style={s.axisLabel}>{rightLabel}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── SleepCard ────────────────────────────────────────────────────────────────
function SleepCard({
  option,
  isSelected,
  onPress,
}: {
  option: SleepOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.sleepCardShell, pressed && s.pressed]}
    >
      <LinearGradient
        colors={option.grad}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          s.sleepCard,
          isSelected && {
            borderWidth: 2,
            borderColor: C.terra,
            shadowColor: C.terra,
            shadowOpacity: 0.28,
            shadowRadius: 12,
            elevation: 5,
          },
        ]}
      >
        {/* Moon icon */}
        <Ionicons name="moon" size={22} color={option.iconColor} />

        {/* Star accents */}
        <View style={s.sleepStarsRow}>
          <MaterialCommunityIcons name="star-four-points" size={7} color={option.iconColor} style={{ opacity: 0.70 }} />
          <MaterialCommunityIcons name="star-four-points" size={5} color={option.iconColor} style={{ opacity: 0.48, marginTop: 3 }} />
        </View>

        <Text style={[s.sleepLabel, { color: option.textColor }]}>{option.label}</Text>

        {isSelected && (
          <View style={s.sleepBadge}>
            <Ionicons name="checkmark" size={9} color="#FFF" />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// ─── Floating particles (ambient background) ─────────────────────────────────
const PARTICLE_SEEDS = [
  { top: 80,  left: "8%",  size: 8,  delay: 0    },
  { top: 180, left: "88%", size: 6,  delay: 600  },
  { top: 340, left: "6%",  size: 7,  delay: 1200 },
  { top: 500, left: "90%", size: 9,  delay: 1800 },
  { top: 680, left: "14%", size: 5,  delay: 900  },
  { top: 820, left: "82%", size: 7,  delay: 300  },
] as const;

function FloatingParticles() {
  const anims = useRef(PARTICLE_SEEDS.map(() => new Animated.Value(0.14))).current;

  useEffect(() => {
    const loops = anims.map((anim, i) => {
      const seed = PARTICLE_SEEDS[i];
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(seed.delay),
          Animated.timing(anim, { toValue: 0.44, duration: 2400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.12, duration: 2400, useNativeDriver: true }),
        ])
      );
      loop.start();
      return loop;
    });
    return () => loops.forEach((l) => l.stop());
  }, [anims]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PARTICLE_SEEDS.map((seed, i) => (
        <Animated.View
          key={i}
          style={[
            {
              position: "absolute",
              top: seed.top,
              left: seed.left,
              width: seed.size,
              height: seed.size,
              borderRadius: seed.size / 2,
              backgroundColor: "rgba(224,122,95,0.55)",
              opacity: anims[i],
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FCE0D0",
  },
  safe: {
    flex: 1,
  },

  // Blobs
  blob1: {
    position: "absolute",
    top: -160,
    left: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(240,190,200,0.34)",
  },
  blob2: {
    position: "absolute",
    top: 300,
    right: -180,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(214,174,230,0.22)",
  },
  blob3: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 360,
    height: 360,
    borderRadius: 180,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 2,
  },

  // ScrollView
  scroll: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 16,
  },

  // Hero
  heroWrap: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 2,
  },
  aura3: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.16)",
  },
  aura2: {
    position: "absolute",
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
    borderColor: "rgba(224,122,95,0.24)",
  },
  aura1: {
    position: "absolute",
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "rgba(240,190,200,0.20)",
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.28)",
  },
  petal: {
    position: "absolute",
  },
  petalLeft: {
    left: W * 0.08,
    top: 44,
  },
  petalRight: {
    right: W * 0.10,
    bottom: 40,
  },
  sparkle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(224,122,95,0.42)",
  },
  sparkleSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  bloopWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  bloopGlow: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(240,190,200,0.42)",
  },
  bloopImg: {
    width: 112,
    height: 104,
  },

  // Heading
  focusPill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    marginBottom: 10,
  },
  focusPillText: {
    fontFamily: F.uiBlack,
    fontSize: 10,
    color: C.terra,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: F.luxuryBold,
    fontSize: 34,
    lineHeight: 40,
    color: C.onSurface,
    textAlign: "center",
    letterSpacing: 0.2,
    marginTop: 4,
  },
  headingSub: {
    fontFamily: F.uiMedium,
    fontSize: 14,
    color: C.onVariant,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },

  // Mood grid
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MOOD_GAP,
    marginBottom: 18,
  },
  moodShell: {
    width: MOOD_W,
    borderRadius: 26,
    shadowColor: "#7A4A5C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  moodCard: {
    width: MOOD_W,
    height: MOOD_H,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.70)",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
  },
  moodIconArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moodIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  moodLabelArea: {
    paddingHorizontal: 6,
    paddingBottom: 2,
  },
  moodLabel: {
    fontFamily: F.uiBold,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  moodBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 8,
    elevation: 4,
  },

  // Glass card
  glassCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 3,
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: F.uiBold,
    fontSize: 15,
    color: C.onSurface,
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  // Slider
  sliderSpacer: {
    height: 18,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  sliderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    width: 100,
    paddingTop: 6,
  },
  sliderIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    color: C.onVariant,
  },
  sliderRight: {
    flex: 1,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(200,180,190,0.28)",
    overflow: "visible",
    marginTop: 11,
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  sliderThumb: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(224,192,177,0.70)",
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
    marginLeft: -12,
  },
  sliderAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  axisLabel: {
    fontFamily: F.uiRegular,
    fontSize: 10,
    color: "rgba(107,76,85,0.60)",
  },

  // Sleep row
  sleepRow: {
    flexDirection: "row",
    gap: 8,
  },
  sleepCardShell: {
    flex: 1,
    borderRadius: 20,
    shadowColor: "#7A4A5C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 3,
  },
  sleepCard: {
    height: 90,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.65)",
    gap: 4,
  },
  sleepStarsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  sleepLabel: {
    fontFamily: F.uiBold,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  sleepBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.terra,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },

  // Support banner
  supportBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },
  supportIconWrap: {
    shadowColor: "#C25C7E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
    borderRadius: 16,
  },
  supportIconGrad: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: {
    flex: 1,
    fontFamily: F.uiMedium,
    fontSize: 13,
    color: C.onVariant,
  },

  // CTA
  ctaShell: {
    borderRadius: 999,
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 22,
    elevation: 6,
    marginBottom: 16,
  },
  ctaBtn: {
    height: 60,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaText: {
    fontFamily: F.uiBlack,
    fontSize: 17,
    color: "#FFF",
    letterSpacing: 0.3,
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  dotActive: {
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.terra,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(224,122,95,0.28)",
  },

  // Misc
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
