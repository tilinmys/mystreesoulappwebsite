/**
 * Onboarding Screen 4 — Emotional Wellness
 *
 * "How have you been feeling lately?" — mood grid, energy/stress sliders,
 * sleep rhythm selector. Emotionally safe, premium, non-clinical.
 * Aligned with "Midnight Plum" dark-mode semantic design system.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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
import { FittedText } from "../../components/system/FittedText";
import { F } from "../../constants/fonts";
import { getEmotionalDefaults, getOnboardingPrompt } from "../../constants/onboardingAdaptation";
import { useOnboardingStore } from "../../store/onboardingStore";
import { useColorMode } from "../../hooks/useColorMode";
import { type AppColors } from "../../constants/colors";

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
    icon: "rocket-launch-outline",
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

// ─── Dynamic Styles Cache (Maximum Performance Engine) ──────────────────────────
let darkStyles: ReturnType<typeof getStyles> | null = null;
let lightStyles: ReturnType<typeof getStyles> | null = null;

function useStyles() {
  const { colors, isDark } = useColorMode();
  if (isDark) {
    if (!darkStyles) {
      darkStyles = getStyles(colors, true);
    }
    return { colors, isDark, s: darkStyles! };
  } else {
    if (!lightStyles) {
      lightStyles = getStyles(colors, false);
    }
    return { colors, isDark, s: lightStyles! };
  }
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function EmotionalWellnessScreen() {
  const router = useRouter();
  const { colors, isDark, s } = useStyles();

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

  // ── Screen entrance ────────────────────────────────────────────────────────
  const entranceOp = useRef(new Animated.Value(0)).current;
  const entranceY  = useRef(new Animated.Value(10)).current;
  const cardsOp    = useRef(new Animated.Value(0)).current;
  const cardsY     = useRef(new Animated.Value(8)).current;

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

    Animated.parallel([
      Animated.timing(entranceOp, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(entranceY,  { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(cardsOp, { toValue: 1, duration: 520, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardsY,  { toValue: 0, duration: 520, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

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
      {/* Ambient blobs — atmosphere only */}
      <View pointerEvents="none" style={s.blob1} />
      <View pointerEvents="none" style={s.blob2} />
      <View pointerEvents="none" style={s.blob3} />

      {/* Floating particle dots */}
      <FloatingParticles />

      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
        {/* ── Header row ────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
          </Pressable>
          <View style={s.headerCenter}>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandSub}>Your feelings matter here.</Text>
          </View>
          {/* Step 4/4 badge */}
          <View style={s.progressRingOuter}>
            <LinearGradient
              colors={isDark ? [colors.primaryCTA, colors.accentDark] : ["#E07A5F", "#F4A27D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.progressRing}
            >
              <Text style={s.progressNum}>4</Text>
              <Text style={s.progressSlash}>/</Text>
              <Text style={s.progressDenom}>4</Text>
            </LinearGradient>
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
          <Animated.View style={{ opacity: entranceOp, transform: [{ translateY: entranceY }] }}>
            <View style={s.focusPill}>
              <MaterialCommunityIcons name="heart-outline" size={12} color={colors.primaryCTA} />
              <Text style={s.focusPillText}>{prompt.focusLabel}</Text>
            </View>
            <Text style={s.heading}>{prompt.heading}</Text>
            <Text style={s.headingSub}>{prompt.subheading}</Text>
          </Animated.View>

          {/* ── 3×2 Mood grid ───────────────────────────────────────── */}
          <Animated.View style={{ opacity: cardsOp, transform: [{ translateY: cardsY }], width: "100%" }}>
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
          </Animated.View>

          {/* ── Energy & Stress sliders ──────────────────────────────── */}
          <View style={s.glassCard}>
            <Text style={s.cardTitle}>Your energy lately</Text>

            <SliderRow
              icon="leaf"
              iconBg={isDark ? "rgba(126, 200, 160, 0.16)" : "rgba(56,160,90,0.14)"}
              iconColor={isDark ? colors.fertileColor : "#38A05A"}
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
              iconBg={isDark ? "rgba(181, 138, 200, 0.16)" : "rgba(107,66,187,0.12)"}
              iconColor={isDark ? colors.textMuted : "#6B42BB"}
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
          {/* ── Continue CTA ─────────────────────────────────────────── */}
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [s.ctaShell, pressed && s.pressed]}
          >
            <LinearGradient
              colors={isDark ? [colors.primaryCTA, colors.accentDark] : ["#E07A5F", "#F4A27D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={isDark ? colors.background : "#FFF"} />
            </LinearGradient>
          </Pressable>

          {/* ── Page dots ─────────────────────────────────────────────── */}
          <View style={s.dotsRow}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={[s.dot, i === 3 && s.dotActive]} />
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* ── Bloop connect modal ──────────────────────────────────── */}
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
  const { colors, s, isDark } = useStyles();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 160, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.00, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [isSelected, pulse]);

  // Determine dynamic gradient and text/icon colors
  const cardGradColors: [string, string, ...string[]] = isSelected 
    ? mood.grad 
    : [colors.surface, colors.surface];

  const cardBorderColor = isSelected 
    ? mood.selBorder 
    : colors.border;

  const displayIconColor = isSelected 
    ? mood.iconColor 
    : colors.textMuted;

  const displayTextColor = isSelected 
    ? mood.textColor 
    : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.moodShell, pressed && s.pressed]}
    >
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient
          colors={cardGradColors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[
            s.moodCard,
            { borderColor: cardBorderColor },
            isSelected && {
              borderWidth: 2,
              shadowColor: mood.selBorder,
              shadowOpacity: isDark ? 0.40 : 0.30,
              shadowRadius: 16,
              elevation: 6,
            },
          ]}
        >
          {/* Icon illustration area */}
          <View style={s.moodIconArea}>
            <View style={[s.moodIconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.38)" }]}>
              <MaterialCommunityIcons
                name={mood.icon}
                size={34}
                color={displayIconColor}
              />
            </View>
          </View>

          {/* Label */}
          <View style={s.moodLabelArea}>
            <FittedText style={[s.moodLabel, { color: displayTextColor }]}>
              {mood.label}
            </FittedText>
          </View>

          {/* Selection badge */}
          {isSelected && (
            <View style={[s.moodBadge, { backgroundColor: isDark ? colors.primaryCTA : "#E07A5F" }]}>
              <Ionicons name="checkmark" size={11} color={isDark ? colors.background : "#FFF"} />
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
  const { s } = useStyles();
  // Use pageX (absolute screen coords) to eliminate locationX jitter
  const trackRef     = useRef<View>(null);
  const trackAbsLeft = useRef(0);
  const trackW       = useRef(0);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        // Re-measure absolute position each gesture start so scroll offset is fresh
        trackRef.current?.measure((_x, _y, width, _h, pageX) => {
          trackAbsLeft.current = pageX;
          trackW.current = width;
        });
        const pct = (e.nativeEvent.pageX - trackAbsLeft.current) / (trackW.current || 1);
        onChange(Math.round(Math.max(0, Math.min(100, pct * 100))));
      },
      onPanResponderMove: (e) => {
        const pct = (e.nativeEvent.pageX - trackAbsLeft.current) / (trackW.current || 1);
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
          ref={trackRef}
          onLayout={() => {
            // Capture absolute left + width after layout so pageX math is ready
            trackRef.current?.measure((_x, _y, width, _h, pageX) => {
              trackAbsLeft.current = pageX;
              trackW.current = width;
            });
          }}
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
  const { colors, s, isDark } = useStyles();

  // Dynamic colors for unselected/selected states
  const cardGradColors: [string, string, ...string[]] = isSelected 
    ? option.grad 
    : [colors.surface, colors.surface];

  const cardBorderColor = isSelected 
    ? (isDark ? colors.primaryCTA : "#E07A5F") 
    : colors.border;

  const displayIconColor = isSelected 
    ? option.iconColor 
    : colors.textMuted;

  const displayTextColor = isSelected 
    ? option.textColor 
    : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.sleepCardShell, pressed && s.pressed]}
    >
      <LinearGradient
        colors={cardGradColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          s.sleepCard,
          { borderColor: cardBorderColor },
          isSelected && {
            borderWidth: 2,
            shadowColor: isDark ? colors.primaryCTA : "#E07A5F",
            shadowOpacity: isDark ? 0.35 : 0.28,
            shadowRadius: 12,
            elevation: 5,
          },
        ]}
      >
        {/* Moon icon */}
        <Ionicons name="moon" size={22} color={displayIconColor} />

        {/* Soft dot accents */}
        <View style={s.sleepStarsRow}>
          <MaterialCommunityIcons name="circle-small" size={9} color={displayIconColor} style={{ opacity: 0.70 }} />
          <MaterialCommunityIcons name="circle-small" size={7} color={displayIconColor} style={{ opacity: 0.48, marginTop: 3 }} />
        </View>

        <Text style={[s.sleepLabel, { color: displayTextColor }]}>{option.label}</Text>

        {isSelected && (
          <View style={[s.sleepBadge, { backgroundColor: isDark ? colors.primaryCTA : "#E07A5F" }]}>
            <Ionicons name="checkmark" size={9} color={isDark ? colors.background : "#FFF"} />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// ─── BloopConnectModal ───────────────────────────────────────────────────────
function BloopConnectModal({
  sheetAnim,
  onClose,
}: {
  sheetAnim: Animated.Value;
  onClose: () => void;
}) {
  const { colors, s, isDark } = useStyles();
  const translateY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [440, 0] });
  const overlayOp  = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.50] });

  return (
    <>
      {/* Dim overlay */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#120B0D", opacity: overlayOp }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Dismiss" />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View style={[s.supportSheet, { transform: [{ translateY }] }]}>
        <View style={s.sheetHandle} />

        {/* Bloop mascot */}
        <View style={s.bloopModalArea}>
          <View style={s.bloopModalHalo} />
          <CachedImage
            source={imgBloop}
            style={s.bloopModalImg}
            contentFit="contain"
          />
        </View>

        <Text style={s.sheetTitle}>Meet Bloop 🌸</Text>
        <Text style={s.sheetBody}>
          Complete your onboarding to start chatting with Bloop — your personal wellness companion.
        </Text>

        <View style={s.sheetActions}>
          {/* Primary CTA */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [s.sheetPrimaryBtn, pressed && s.pressed]}
          >
            <LinearGradient
              colors={isDark ? [colors.primaryCTA, colors.accentDark] : ["#E07A5F", "#F4A27D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.sheetPrimaryGrad}
            >
              <MaterialCommunityIcons name="robot-happy-outline" size={20} color={isDark ? colors.background : "#FFF"} />
              <Text style={[s.sheetPrimaryLabel, { color: isDark ? colors.background : "#FFF" }]}>Got it, let's continue!</Text>
            </LinearGradient>
          </Pressable>

          {/* Ghost dismiss */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [s.sheetGhostBtn, pressed && s.pressed]}
          >
            <Text style={s.sheetGhostLabel}>Maybe later</Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
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
  const { isDark } = useStyles();
  const anims = useRef(PARTICLE_SEEDS.map(() => new Animated.Value(0.06))).current;

  useEffect(() => {
    const loops = anims.map((anim, i) => {
      const seed = PARTICLE_SEEDS[i];
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(seed.delay),
          Animated.timing(anim, { toValue: 0.18, duration: 2400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.06, duration: 2400, useNativeDriver: true }),
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
              backgroundColor: isDark ? "rgba(181, 138, 200, 0.30)" : "rgba(224,122,95,0.30)",
              opacity: anims[i],
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Styles Generator ──────────────────────────────────────────────────────────
function getStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safe: {
      flex: 1,
    },

    // Blobs — atmosphere only, 5% opacity dark, 8-10% light
    blob1: {
      position: "absolute",
      top: -140,
      left: -110,
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.05)" : "rgba(255,183,183,0.10)",
    },
    blob2: {
      position: "absolute",
      top: 320,
      right: -160,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor: isDark ? "rgba(181, 138, 200, 0.05)" : "rgba(189,172,255,0.08)",
    },
    blob3: {
      position: "absolute",
      bottom: -80,
      left: -90,
      width: 340,
      height: 340,
      borderRadius: 170,
      backgroundColor: isDark ? "rgba(126, 200, 160, 0.05)" : "rgba(162,202,178,0.08)",
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
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.20 : 0.08,
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
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
    brandSub: {
      fontFamily: F.bodyRegular,
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 1,
    },
    progressRingOuter: {
      shadowColor: isDark ? "#000" : colors.primaryCTA,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
      elevation: 6,
      borderRadius: 28,
    },
    progressRing: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 1,
    },
    progressNum: {
      fontFamily: F.uiExtraBold,
      fontSize: 18,
      color: isDark ? colors.background : "#FFF",
      lineHeight: 22,
    },
    progressSlash: {
      fontFamily: F.uiLight,
      fontSize: 14,
      color: isDark ? "rgba(34,24,34,0.70)" : "rgba(255,255,255,0.70)",
      lineHeight: 22,
    },
    progressDenom: {
      fontFamily: F.uiMedium,
      fontSize: 13,
      color: isDark ? "rgba(34,24,34,0.80)" : "rgba(255,255,255,0.80)",
      lineHeight: 22,
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
      borderColor: isDark ? "rgba(232, 166, 182, 0.16)" : "rgba(224,122,95,0.16)",
    },
    aura2: {
      position: "absolute",
      width: 168,
      height: 168,
      borderRadius: 84,
      borderWidth: 2,
      borderColor: isDark ? "rgba(232, 166, 182, 0.24)" : "rgba(224,122,95,0.24)",
    },
    aura1: {
      position: "absolute",
      width: 124,
      height: 124,
      borderRadius: 62,
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.08)" : "rgba(240,190,200,0.20)",
      borderWidth: 1.5,
      borderColor: isDark ? "rgba(232, 166, 182, 0.28)" : "rgba(224,122,95,0.28)",
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
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.42)" : "rgba(224,122,95,0.42)",
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
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.14)" : "rgba(240,190,200,0.42)",
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    focusPillText: {
      fontFamily: F.uiBlack,
      fontSize: 10,
      color: colors.primaryCTA,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    heading: {
      fontFamily: F.luxuryBold,
      fontSize: 34,
      lineHeight: 40,
      color: colors.textPrimary,
      textAlign: "center",
      letterSpacing: 0.2,
      marginTop: 4,
    },
    headingSub: {
      fontFamily: F.uiMedium,
      fontSize: 14,
      color: colors.textMuted,
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.25 : 0.12,
      shadowRadius: 18,
      elevation: 4,
    },
    moodCard: {
      width: MOOD_W,
      height: MOOD_H,
      borderRadius: 26,
      overflow: "hidden",
      borderWidth: 1.5,
      borderColor: colors.border,
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
      borderColor: "rgba(255,255,255,0.25)",
    },
    moodLabelArea: {
      paddingHorizontal: 6,
      paddingBottom: 2,
      width: "100%",
    },
    moodLabel: {
      fontFamily: F.uiBold,
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center",
      letterSpacing: 0.2,
      width: "100%",
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.20,
      shadowRadius: 8,
      elevation: 4,
    },

    // Glass card (Standard surface container)
    glassCard: {
      borderRadius: 28,
      padding: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.20 : 0.07,
      shadowRadius: 20,
      elevation: 3,
      marginBottom: 14,
    },
    cardTitle: {
      fontFamily: F.uiBold,
      fontSize: 15,
      color: colors.textPrimary,
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
      color: colors.textMuted,
    },
    sliderRight: {
      flex: 1,
    },
    sliderTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(200,180,190,0.28)",
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
      borderColor: colors.borderStrong,
      shadowColor: "#000",
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
      color: colors.textMuted,
      opacity: 0.60,
    },

    // Sleep row
    sleepRow: {
      flexDirection: "row",
      gap: 8,
    },
    sleepCardShell: {
      flex: 1,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.22 : 0.10,
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
      borderColor: colors.border,
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
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.20,
      shadowRadius: 6,
      elevation: 3,
    },

    // Support banner
    supportBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.18 : 0.06,
      shadowRadius: 14,
      elevation: 2,
    },
    supportIconWrap: {
      shadowColor: colors.primaryCTA,
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
      color: colors.textPrimary,
    },

    // CTA
    ctaShell: {
      borderRadius: 999,
      shadowColor: colors.primaryCTA,
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
      color: isDark ? colors.background : "#FFF",
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
      backgroundColor: colors.primaryCTA,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? "rgba(181, 138, 200, 0.28)" : "rgba(224,122,95,0.28)",
    },

    // Support sheet (Bottom modal dialog)
    supportSheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 52,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.20,
      shadowRadius: 24,
      elevation: 20,
      zIndex: 100,
    },
    sheetHandle: {
      width: 42,
      height: 5,
      borderRadius: 3,
      backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
      marginBottom: 22,
    },
    sheetIconBubble: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: "rgba(194,92,126,0.10)",
      borderWidth: 1,
      borderColor: "rgba(194,92,126,0.22)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    sheetTitle: {
      fontFamily: F.luxuryBold,
      fontSize: 22,
      color: colors.textPrimary,
      marginBottom: 8,
      textAlign: "center",
    },
    sheetBody: {
      fontFamily: F.uiRegular,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 21,
      marginBottom: 26,
      paddingHorizontal: 8,
    },
    sheetActions: {
      width: "100%",
      gap: 11,
    },
    sheetPrimaryBtn: {
      width: "100%",
      borderRadius: 999,
      shadowColor: colors.primaryCTA,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 16,
      elevation: 6,
    },
    sheetPrimaryGrad: {
      height: 54,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },
    sheetPrimaryLabel: {
      fontFamily: F.uiBlack,
      fontSize: 15,
      color: isDark ? colors.background : "#FFFFFF",
      letterSpacing: 0.4,
    },
    bloopModalArea: {
      width: 120,
      height: 120,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 16,
    },
    bloopModalHalo: {
      position: "absolute",
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.14)" : "rgba(240,190,200,0.30)",
    },
    bloopModalImg: {
      width: 104,
      height: 96,
    },

    sheetGhostBtn: {
      height: 46,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    sheetGhostLabel: {
      fontFamily: F.uiBold,
      fontSize: 14,
      color: colors.textMuted,
    },

    // Misc
    pressed: {
      transform: [{ scale: 0.97 }],
    },
  });
}
