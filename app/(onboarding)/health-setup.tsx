/**
 * Onboarding Screen 3 — Life Stage
 *
 * "Tell us about yourself" — Full Name + 2×2 life-stage card grid.
 * Cycle basics: inline DateWheelPicker for last period start, Stepper for
 * period / cycle length, chips for flow / support needs / fertility intent.
 *
 * Token mapping
 * ─────────────
 *  Root bg            →  colors.background   (Midnight Plum #221822)
 *  Cards (unselected) →  colors.surface       (Blackberry Smoke #2E2330)
 *  Cards (selected)   →  colors.surfaceRaised + 1px primaryCTA border
 *  Text primary       →  colors.textPrimary   (Moon Pearl #F6E9EF)
 *  Text secondary     →  colors.textMuted     (Lavender Dust #B58AC8)
 *  CTA gradient       →  primaryCTA → warning (Bloom Pink → Golden Sand)
 *  CTA text           →  colors.background    (Midnight Plum — 10.4:1 ✓✓✓)
 *  Progress ring      →  primaryCTA → warning gradient
 *  Stepper / picker   →  colors.surfaceRaised bg, colors.primaryCTA accents
 *  Field error        →  colors.periodColor   (Period Rose #E88090)
 *
 * Mascot constraint
 * ─────────────────
 *  Bloop (imgBloop) is rendered via CachedImage with NO tintColor,
 *  NO colorFilter, NO overlay on the image itself.
 *  The soft aura ring BEHIND the mascot uses primaryCTA at low opacity.
 *
 * Life-stage card images (teen/cycle/pregnancy/menopause) are scene
 * illustrations — they carry a dark gradient scrim at the bottom for
 * legibility only. No character tinting applied.
 */
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Svg, { Path, Rect, Defs, ClipPath } from "react-native-svg";
import {
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";

// Enable Android LayoutAnimations
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../../components/CachedImage";
import { FittedText } from "../../components/system/FittedText";
import { ValidationToast } from "../../components/ValidationToast";
import { F } from "../../constants/fonts";
import { getOnboardingPrompt } from "../../constants/onboardingAdaptation";
import { darkColors } from "../../constants/colors";
import { StatusBar } from "expo-status-bar";
import { useSafeBack } from "../../hooks/useSafeBack";
import { CycleBasics, LifeStage, useOnboardingStore } from "../../store/onboardingStore";

// ─── Screen geometry ──────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const SIDE_PAD = 20;
const CARD_GAP = 12;
const CARD_W = (W - SIDE_PAD * 2 - CARD_GAP) / 2;
const CAL_CELL_SIZE = Math.min(34, Math.floor((W - SIDE_PAD * 2 - 72) / 7));
const CARD_H = Math.round(CARD_W * 0.96);   // was 1.32 — more compact

// ─── Image assets ─────────────────────────────────────────────────────────────
const imgBloop = require("../../public/images/bloop-welcome.webp");
const imgTeen  = require("../../public/images/adolescence-safe-space.webp");
const imgCycle = require("../../public/images/fertility-glow-visual.webp");
const imgPreg  = require("../../public/images/pregnancy-journey-visual.webp");
const imgMeno  = require("../../public/images/menopause-transition-visual.webp");

// ─── Cycle setup choices ──────────────────────────────────────────────────────
// Colors here are semantic biological/intensity indicators — intentionally
// distinct from brand tokens so flow states remain unambiguous.
const usualFlowOptions = [
  { label: "Spotting", fill: 0.18, icon: "water-outline" as const, color: "#E89A86", sub: "Tiny marks"  },
  { label: "Light",    fill: 0.38, icon: "water-percent" as const, color: "#E9856B", sub: "Easy days"   },
  { label: "Medium",   fill: 0.68, icon: "water"         as const, color: "#E07A5F", sub: "Steady flow" },
  { label: "Heavy",    fill: 1.0,  icon: "water-alert"   as const, color: "#B84040", sub: "Needs care"  },
] as const;

const cycleSupportNeeds = [
  { label: "Cramps", icon: "lightning-bolt"      as const, color: "#E07A5F", sub: "Pain relief cues"  },
  { label: "Mood",   icon: "emoticon-happy-outline" as const, color: "#E05875", sub: "Emotional shifts"  },
  { label: "Energy", icon: "flash-outline"        as const, color: "#C9A96E", sub: "Low or high days"  },
  { label: "Sleep",  icon: "moon-waning-crescent" as const, color: "#9277C8", sub: "Rest rhythm"       },
] as const;

const fertilityOptions = [
  { label: "Yes",         icon: "flower-tulip-outline" as const, color: "#E8A6B6", sub: "Show fertile window and ovulation cues" },
  { label: "Maybe later", icon: "calendar-clock" as const, color: "#C9A96E", sub: "Keep it gentle for now"                 },
  { label: "No",          icon: "shield-check"   as const, color: "#E07A5F", sub: "Focus on cycle and period care"         },
] as const;

// ── Health conditions — each gets a unique icon + accent color ────────────────
// Colors are informational identifiers (not brand tokens), same pattern as
// NotificationCard category tints.
const CONDITIONS_WITH_ICONS = [
  { label: "PCOS",              icon: "circle-multiple-outline"    as const, color: "#BDB2FF" },
  { label: "PCOD",              icon: "circle-multiple"            as const, color: "#D4A5D4" },
  { label: "Endometriosis",     icon: "flower-pollen-outline"      as const, color: "#E8A6B6" },
  { label: "Thyroid",           icon: "butterfly-outline"          as const, color: "#F4C2A1" },
  { label: "Fibroids",          icon: "dots-horizontal-circle"     as const, color: "#C9A96E" },
  { label: "Irregular cycles",  icon: "calendar-refresh-outline"   as const, color: "#BDB2FF" },
  { label: "Prefer not to say", icon: "eye-off-outline"            as const, color: "#9E8FA8" },
  { label: "Other",             icon: "plus-circle-outline"        as const, color: "#9E8FA8" },
] as const;

// ─── Month labels ─────────────────────────────────────────────────────────────
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Life-stage card data (color-free — tints resolved from tokens at render) ─
type StageCard = {
  id:    NonNullable<LifeStage>;
  label: string;
  image: ReturnType<typeof require>;
  icon:  React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const STAGES: StageCard[] = [
  { id: "teen",            label: "Teen",              image: imgTeen,  icon: "account-outline"       },
  { id: "cycle_fertility", label: "Cycle &\nFertility", image: imgCycle, icon: "calendar-month-outline" },
  { id: "pregnancy",       label: "Pregnancy",         image: imgPreg,  icon: "human-pregnant"         },
  { id: "menopause",       label: "Menopause",         image: imgMeno,  icon: "weather-sunset"         },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HealthSetupScreen() {
  const router      = useRouter();
  const safeBack    = useSafeBack("/(onboarding)/privacy-consent");
  const colors = darkColors;

  const name           = useOnboardingStore((s) => s.name);
  const setName        = useOnboardingStore((s) => s.setName);
  const lifeStage      = useOnboardingStore((s) => s.lifeStage);
  const setLifeStage   = useOnboardingStore((s) => s.setLifeStage);
  const selectedGoals  = useOnboardingStore((s) => s.selectedGoals);
  const cycleBasics    = useOnboardingStore((s) => s.cycleBasics);
  const setCycleBasics = useOnboardingStore((s) => s.setCycleBasics);
  const prompt         = getOnboardingPrompt(selectedGoals);

  const [selected,        setSelected       ] = useState<LifeStage>(lifeStage ?? "teen");
  const [cycleDraft,      setCycleDraft     ] = useState<CycleBasics>(cycleBasics);
  const [conditions,      setConditions     ] = useState<string[]>([]);
  const [nameError,       setNameError      ] = useState(false);
  const [flowError,       setFlowError      ] = useState(false);
  const [fertilityError,  setFertilityError ] = useState(false);
  const [toastMessage,    setToastMessage   ] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const [lastPeriodDate,  setLastPeriodDate ] = useState<Date>(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d;
  });
  const [periodLengthDays, setPeriodLengthDays] = useState(5);
  const [cycleLengthDays,  setCycleLengthDays ] = useState(28);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);

  // ── Stage accent colours — resolved from tokens, not hardcoded ────────────
  // These are thematic identifiers for each life stage, using the closest
  // semantic brand token for each life phase.
  const STAGE_ACCENTS: Record<NonNullable<LifeStage>, string> = {
    teen:            colors.fertileColor,  // sage-green → growth, learning
    cycle_fertility: colors.primaryCTA,   // Bloom Pink → feminine health focus
    pregnancy:       colors.periodColor,  // warm rose  → nurturing warmth
    menopause:       colors.warning,      // Golden Sand → wisdom, transition
  };

  // ── Screen entrance ────────────────────────────────────────────────────────
  const entranceOp = useRef(new Animated.Value(0)).current;
  const entranceY  = useRef(new Animated.Value(10)).current;
  const cardsOp    = useRef(new Animated.Value(0)).current;
  const cardsY     = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOp, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(entranceY,  { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(cardsOp, { toValue: 1, duration: 520, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardsY,  { toValue: 0, duration: 520, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Hero animations ────────────────────────────────────────────────────────
  const breathe   = useRef(new Animated.Value(0)).current;
  const floatY    = useRef(new Animated.Value(0)).current;
  const auraOp    = useRef(new Animated.Value(0.28)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a1 = Animated.loop(Animated.sequence([
      Animated.timing(breathe,   { toValue: 1, duration: 3400, useNativeDriver: true }),
      Animated.timing(breathe,   { toValue: 0, duration: 3400, useNativeDriver: true }),
    ]));
    const a2 = Animated.loop(Animated.sequence([
      Animated.timing(floatY,    { toValue: 1, duration: 2800, useNativeDriver: true }),
      Animated.timing(floatY,    { toValue: 0, duration: 2800, useNativeDriver: true }),
    ]));
    const a3 = Animated.loop(Animated.sequence([
      Animated.timing(auraOp,    { toValue: 0.55, duration: 2600, useNativeDriver: true }),
      Animated.timing(auraOp,    { toValue: 0.18, duration: 2600, useNativeDriver: true }),
    ]));
    const a4 = Animated.loop(Animated.sequence([
      Animated.timing(ringPulse, { toValue: 1, duration: 4000, useNativeDriver: true }),
      Animated.timing(ringPulse, { toValue: 0, duration: 4000, useNativeDriver: true }),
    ]));
    a1.start(); a2.start(); a3.start(); a4.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); a4.stop(); };
  }, [breathe, floatY, auraOp, ringPulse]);

  const bloopScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const bloopFloat = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });
  const ringScale  = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  // ── Validation ─────────────────────────────────────────────────────────────
  const nameParts   = name.trim().split(/\s+/).filter(Boolean);
  const hasFullName = nameParts.length >= 2;

  function handleContinue() {
    if (!hasFullName) {
      setNameError(true);
      setToastMessage("Please enter your full name to continue.");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (showCycleSection) {
      if (!cycleDraft.usualFlow) {
        setFlowError(true);
        setToastMessage("Tap a usual-flow option so we can tailor your cycle care.");
        scrollRef.current?.scrollTo({ y: 9999, animated: true });
        return;
      }
      if (!cycleDraft.fertilityIntent) {
        setFertilityError(true);
        setToastMessage("Choose a fertility guidance preference to continue.");
        scrollRef.current?.scrollTo({ y: 9999, animated: true });
        return;
      }
    }
    setNameError(false); setFlowError(false); setFertilityError(false); setToastMessage(null);
    setLifeStage(selected);
    if (selected === "cycle_fertility" || selectedGoals.includes("cycle")) {
      const dateStr = `${MONTH_LABELS[lastPeriodDate.getMonth()]} ${lastPeriodDate.getDate()}, ${lastPeriodDate.getFullYear()}`;
      setCycleBasics({
        ...cycleDraft,
        lastPeriodStart: dateStr,
        periodLength: `${periodLengthDays} days`,
        cycleLength:  `${cycleLengthDays} days`,
      });
    }
    router.push("/(onboarding)/emotional-wellness");
  }

  const updateCycleDraft = (key: keyof CycleBasics, value: string) =>
    setCycleDraft((cur) => ({ ...cur, [key]: value }));

  const toggleCycleSupport = (value: string) =>
    setCycleDraft((cur) => ({
      ...cur,
      supportNeeds: cur.supportNeeds.includes(value)
        ? cur.supportNeeds.filter((i) => i !== value)
        : [...cur.supportNeeds, value],
    }));

  const toggleCondition = (c: string) =>
    setConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const showCycleSection = selected === "cycle_fertility" || selectedGoals.includes("cycle");

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" backgroundColor="#110812" translucent />
      {/* ── Ambient blobs — low opacity, dark-toned ──────────────────────── */}
      <ValidationToast message={toastMessage} onDismiss={() => setToastMessage(null)} top={56} />

      <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>

        {/* ── Brand header ─────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <Pressable
            onPress={safeBack}
            style={({ pressed }) => [s.headerBackBtn,
              { backgroundColor: colors.surfaceRaised, borderColor: colors.border,
                shadowColor: colors.background },
              pressed && s.pressed,
            ]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>

          <View style={s.headerCenter}>
            <Text style={[s.brandName, { color: colors.textPrimary }]}>MyStree Soul</Text>
            <Text style={[s.brandTagline, { color: colors.textMuted }]}>For every stage of you.</Text>
          </View>

          {/* Step 3/4 badge — Bloom Pink → Golden Sand */}
          <View style={[s.progressRingOuter, { shadowColor: colors.primaryCTA }]}>
            <LinearGradient
              colors={[colors.primaryCTA, colors.warning]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.progressRing}
            >
              <Text style={s.progressNum}>3</Text>
              <Text style={s.progressSlash}>/</Text>
              <Text style={s.progressDenom}>4</Text>
            </LinearGradient>
          </View>
        </View>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Hero illustration ─────────────────────────────────────── */}
          <View style={s.heroWrap}>
            <Animated.View style={[s.auraRing3, { opacity: auraOp, borderColor: `${colors.primaryCTA}1A`,
              transform: [{ scale: ringScale }] }]} />
            <Animated.View style={[s.auraRing2, { opacity: auraOp, borderColor: `${colors.primaryCTA}28` }]} />
            <Animated.View style={[s.auraRing1, { opacity: auraOp,
              backgroundColor: `${colors.primaryCTA}18`, borderColor: `${colors.primaryCTA}30` }]} />

            <View style={[s.crescentLeft,  { backgroundColor: `${colors.textMuted}40`,  borderColor: `${colors.textMuted}28`   }]} />
            <View style={[s.crescentRight, { backgroundColor: `${colors.fertileColor}38`, borderColor: `${colors.fertileColor}22` }]} />

            <View style={[s.sparkle, { top: 28, left: W * 0.28, backgroundColor: `${colors.primaryCTA}55` }]} />
            <View style={[s.sparkle, { top: 48, right: W * 0.26, backgroundColor: `${colors.primaryCTA}44` }]} />
            <View style={[s.sparkle, { bottom: 30, left: W * 0.32, backgroundColor: `${colors.warning}44`  }]} />

            <Animated.View style={[s.bloopContainer,
              { transform: [{ scale: bloopScale }, { translateY: bloopFloat }] }]}>
              {/* Soft aura ring BEHIND Bloop — not on the image */}
              <View style={[s.bloopAura, { backgroundColor: `${colors.primaryCTA}22` }]} />
              {/* ⚠️ Bloop — no tintColor, no colorFilter, no overlay on the image */}
              <CachedImage priority="high" source={imgBloop} style={s.bloopImg} contentFit="contain" />
            </Animated.View>
          </View>

          {/* ── Main heading ────────────────────────────────────────────── */}
          <Animated.View style={{ opacity: entranceOp, transform: [{ translateY: entranceY }] }}>
            <Text style={[s.heading,    { color: colors.textPrimary }]}>Tell us about{"\n"}yourself</Text>
            <Text style={[s.headingSub, { color: colors.textMuted   }]}>{prompt.subheading}</Text>
          </Animated.View>

          {/* ── Full Name input ─────────────────────────────────────────── */}
          <View style={[s.inputRow,
            { backgroundColor: colors.surface, borderColor: colors.border,
              shadowColor: colors.background },
            nameError && !hasFullName && { borderColor: `${colors.periodColor}55` },
          ]}>
            <View style={s.inputIconBox}>
              <Ionicons name="person-outline" size={19}
                color={nameError && !hasFullName ? colors.periodColor : colors.textMuted} />
            </View>
            <TextInput
              style={[s.nameInput, { color: colors.textPrimary }]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError && text.trim().split(/\s+/).filter(Boolean).length >= 2)
                  setNameError(false);
              }}
              placeholder="Full Name"
              placeholderTextColor={`${colors.textMuted}66`}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
          {nameError && !hasFullName && (
            <Text style={[s.nameError, { color: colors.periodColor }]}>Please enter your full name.</Text>
          )}

          {/* ── Life stage section label ─────────────────────────────────── */}
          <View style={s.sectionLabelRow}>
            <Text style={[s.sectionLabel, { color: colors.textPrimary }]}>Your Life Stage</Text>
            <MaterialCommunityIcons name="flower-outline" size={13} color={colors.primaryCTA}
              style={{ marginTop: 1, marginLeft: 4 }} />
          </View>

          {/* ── 2 × 2 card grid ──────────────────────────────────────────── */}
          <Animated.View style={{ opacity: cardsOp, transform: [{ translateY: cardsY }] }}>
            <View style={s.grid}>
              {STAGES.map((stage) => {
                const isSel  = selected === stage.id;
                const accent = STAGE_ACCENTS[stage.id];
                // Image fade goes to the card's background tone for a clean scrim
                const fadeTarget = isSel ? colors.surfaceRaised : colors.surface;
                return (
                  <Pressable
                    key={stage.id}
                    onPress={() => setSelected(stage.id)}
                    style={({ pressed }) => [s.cardShell, { shadowColor: colors.background }, pressed && s.pressed]}
                  >
                    <View style={[s.card,
                      { backgroundColor: isSel ? colors.surfaceRaised : colors.surface,
                        borderColor: isSel ? colors.primaryCTA : colors.border,
                        borderWidth: isSel ? 1.5 : 1 },
                    ]}>
                      {/* Scene illustration — NOT a mascot, gradient scrim is fine */}
                      <View style={s.cardImgWrap}>
                        <CachedImage source={stage.image} style={s.cardImg} contentFit="cover" priority="high" />
                        {/* Dark absolute scrim so no image whites or borders break the theme */}
                        <View
                          pointerEvents="none"
                          style={[
                            StyleSheet.absoluteFillObject,
                            { backgroundColor: "rgba(34, 24, 34, 0.45)" },
                          ]}
                        />
                        <LinearGradient
                          colors={["transparent", `${fadeTarget}F0`]}
                          style={s.cardImgFade}
                        />
                      </View>

                      <View style={s.cardBottom}>
                        <View style={[s.stageIconBadge, { backgroundColor: `${accent}22` }]}>
                          <MaterialCommunityIcons name={stage.icon} size={16} color={accent} />
                        </View>
                        {/* All card labels use textPrimary — uniform elegance */}
                        <FittedText style={[s.cardLabel, { color: colors.textPrimary }]} numberOfLines={2}>
                          {stage.label}
                        </FittedText>
                      </View>

                      {isSel && (
                        <View style={[s.checkBadge,
                          { backgroundColor: colors.primaryCTA, shadowColor: colors.primaryCTA }]}>
                          <Ionicons name="checkmark" size={13} color={colors.background} />
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* ── Health conditions (optional) ─────────────────────────────── */}
          <View style={s.sectionLabelRow}>
            <Text style={[s.sectionLabel, { color: colors.textPrimary }]}>Health Conditions</Text>
            <View style={[s.optionalBadge,
              { backgroundColor: `${colors.textMuted}18`, borderColor: `${colors.textMuted}36` }]}>
              <Text style={[s.optionalBadgeText, { color: colors.textMuted }]}>Optional</Text>
            </View>
          </View>
          <Text style={[s.conditionsSub, { color: colors.textMuted }]}>
            Helps Bloop tailor guidance to your body. Select all that apply.
          </Text>

          {/* ── 4-column icon-card grid — much richer than pill checkboxes ── */}
          <View style={s.conditionGrid}>
            {CONDITIONS_WITH_ICONS.map((c) => {
              const active = conditions.includes(c.label);
              return (
                <Pressable
                  key={c.label}
                  onPress={() => toggleCondition(c.label)}
                  style={({ pressed }) => [
                    s.conditionCard,
                    {
                      backgroundColor: active ? `${colors.primaryCTA}1A` : colors.surface,
                      borderColor:     active ? colors.primaryCTA         : colors.border,
                      shadowColor:     colors.background,
                    },
                    pressed && s.pressed,
                  ]}
                >
                  {/* Top-right checkmark when active */}
                  {active && (
                    <View style={[s.conditionCheck,
                      { backgroundColor: colors.primaryCTA }]}>
                      <Ionicons name="checkmark" size={9} color={colors.background} />
                    </View>
                  )}
                  {/* Icon circle */}
                  <View style={[s.conditionIconCircle,
                    { backgroundColor: active ? `${colors.primaryCTA}22` : `${c.color}18` }]}>
                    <MaterialCommunityIcons
                      name={c.icon}
                      size={20}
                      color={active ? colors.primaryCTA : c.color}
                    />
                  </View>
                  {/* Label */}
                  <FittedText
                    style={[s.conditionCardLabel,
                      { color: active ? colors.primaryCTA : colors.textPrimary }]}
                    numberOfLines={2}
                  >
                    {c.label}
                  </FittedText>
                </Pressable>
              );
            })}
          </View>

          {/* ── Cycle basics ─────────────────────────────────────────────── */}
          {showCycleSection && (
            <View style={[s.cycleBasicsCard,
              { backgroundColor: colors.surface, borderColor: colors.border,
                shadowColor: colors.background }]}>
              <View style={s.cycleBasicsHeader}>
                <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.primaryCTA} />
                <Text style={[s.cycleBasicsTitle, { color: colors.textPrimary }]}>Cycle basics</Text>
              </View>

              {/* ── Last period date ───────────────────────────────── */}
              <View style={s.cycleBlock}>
                {isCalendarExpanded ? (
                  <View style={[s.datePickerCard,
                    { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                    <InlineCalendar
                      date={lastPeriodDate}
                      onChange={(newDate) => {
                        setLastPeriodDate(newDate);
                        // Animate calendar collapse beautifully
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setIsCalendarExpanded(false);
                      }}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => {
                      // Expand calendar grid back in place
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setIsCalendarExpanded(true);
                    }}
                    style={({ pressed }) => [
                      s.confirmedDateCard,
                      {
                        backgroundColor: colors.surfaceRaised,
                        borderColor: colors.border,
                      },
                      pressed && s.pressed,
                    ]}
                  >
                    <View style={s.confirmedDateLeft}>
                      <View style={[s.confirmedDateIconCircle, { backgroundColor: `${colors.primaryCTA}14` }]}>
                        <MaterialCommunityIcons name="calendar-check" size={18} color={colors.primaryCTA} />
                      </View>
                      <View style={s.confirmedDateCopy}>
                        <Text style={[s.confirmedDateLabel, { color: colors.textMuted }]}>Last period started</Text>
                        <Text style={[s.confirmedDateValue, { color: colors.textPrimary }]}>
                          {MONTH_LABELS[lastPeriodDate.getMonth()]} {lastPeriodDate.getDate()}, {lastPeriodDate.getFullYear()}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Calendar Icon for quick edit */}
                    <View style={[s.confirmedDateEditCircle, { backgroundColor: `${colors.textMuted}10` }]}>
                      <Ionicons name="calendar-outline" size={16} color={colors.primaryCTA} />
                    </View>
                  </Pressable>
                )}
              </View>

              {/* ── Period / Cycle length steppers ─────────────────── */}
              <View style={[s.stepperPair,
                { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                <StepperBlock
                  label="Period lasts" value={periodLengthDays} unit="days"
                  min={1} max={14} onChange={setPeriodLengthDays}
                />
                <View style={[s.stepperDivider, { backgroundColor: colors.border }]} />
                <StepperBlock
                  label="Cycle length" value={cycleLengthDays} unit="days"
                  min={20} max={45} onChange={setCycleLengthDays}
                />
              </View>

              {/* ── Usual flow chips ──────────────────────────────── */}
              <View style={s.cycleBlock}>
                <View style={s.cycleBlockHeader}>
                  <View style={[s.cycleBlockIcon, { backgroundColor: `${colors.primaryCTA}14` }]}>
                    <MaterialCommunityIcons name="water" size={15} color={colors.primaryCTA} />
                  </View>
                  <View style={s.cycleBlockCopy}>
                    <Text style={[s.cycleBlockLabel, { color: colors.textMuted }]}>Usual flow</Text>
                  </View>
                </View>
                {flowError && !cycleDraft.usualFlow && (
                  <Text style={[s.fieldError, { color: colors.periodColor }]}>
                    Please select your usual flow.
                  </Text>
                )}
                <View style={[s.flowChoiceGrid,
                  flowError && !cycleDraft.usualFlow && { borderWidth: 1,
                    borderColor: `${colors.periodColor}36`, borderRadius: 16, padding: 8 }]}>
                  {usualFlowOptions.map((option) => {
                    const active = cycleDraft.usualFlow === option.label;
                    return (
                      <Pressable
                        key={option.label}
                        onPress={() => { updateCycleDraft("usualFlow", option.label); setFlowError(false); }}
                        style={({ pressed }) => [
                          s.flowChoiceCard,
                          { backgroundColor: active ? `${option.color}14` : colors.surface,
                            borderColor:     active ? `${option.color}66`  : colors.border },
                          pressed && s.pressed,
                        ]}
                      >
                        <FlowDrop fill={option.fill} color={option.color} active={active} />
                        <FittedText style={[s.flowChoiceLabel,
                          { color: active ? option.color : colors.textPrimary }]}>
                          {option.label}
                        </FittedText>
                        <Text style={[s.flowChoiceSub, { color: colors.textMuted }]}>{option.sub}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* ── Support needs chips ───────────────────────────── */}
              <View style={s.cycleBlock}>
                <View style={s.cycleBlockHeader}>
                  <View style={[s.cycleBlockIcon, { backgroundColor: `${colors.textMuted}14` }]}>
                    <MaterialCommunityIcons name="heart-outline" size={15} color={colors.textMuted} />
                  </View>
                  <View style={s.cycleBlockCopy}>
                    <Text style={[s.cycleBlockLabel, { color: colors.textMuted }]}>Need support with</Text>
                    <Text style={[s.cycleBlockSub,   { color: colors.textMuted }]}>
                      Choose all that should shape your guidance.
                    </Text>
                  </View>
                </View>
                <View style={s.supportChoiceGrid}>
                  {cycleSupportNeeds.map((option) => {
                    const active = cycleDraft.supportNeeds.includes(option.label);
                    return (
                      <Pressable
                        key={option.label}
                        onPress={() => toggleCycleSupport(option.label)}
                        style={({ pressed }) => [
                          s.supportChoiceCard,
                          { backgroundColor: active ? `${option.color}12` : colors.surface,
                            borderColor:     active ? `${option.color}70`  : colors.border },
                          pressed && s.pressed,
                        ]}
                      >
                        {active && (
                          <View style={[s.supportCheckBadge, { backgroundColor: colors.primaryCTA }]}>
                            <Ionicons name="checkmark" size={10} color={colors.background} />
                          </View>
                        )}
                        <View style={[s.supportChoiceIcon, { backgroundColor: `${option.color}18` }]}>
                          <MaterialCommunityIcons name={option.icon} size={22} color={option.color} />
                        </View>
                        <FittedText style={[s.supportChoiceLabel,
                          { color: active ? option.color : colors.textPrimary }]}>
                          {option.label}
                        </FittedText>
                        <Text style={[s.supportChoiceSub, { color: colors.textMuted }]}>{option.sub}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* ── Fertility guidance chips ──────────────────────── */}
              <View style={s.cycleBlock}>
                <View style={[s.guidanceHeaderCard,
                  { backgroundColor: `${colors.primaryCTA}14`,
                    borderColor:     `${colors.primaryCTA}26` }]}>
                  <View style={[s.guidanceIconStack, { backgroundColor: `${colors.primaryCTA}1C` }]}>
                    {selected === "teen" ? (
                      <MaterialCommunityIcons name="book-open-outline" size={20} color={colors.primaryCTA} />
                    ) : (
                      <Ionicons name="flower-outline" size={21} color={colors.primaryCTA} />
                    )}
                  </View>
                  <View style={s.guidanceHeaderCopy}>
                    <Text style={[s.cycleBlockLabel, { color: colors.textMuted }]}>
                      {selected === "teen" ? "Period education guidance" : "Fertility-aware guidance"}
                    </Text>
                    <Text style={[s.cycleBlockSub, { color: colors.textMuted }]}>
                      {selected === "teen"
                        ? "Simple, age-safe explanations without pressure."
                        : "Ovulation and fertile-window cues only if you want them."}
                    </Text>
                  </View>
                </View>
                {fertilityError && !cycleDraft.fertilityIntent && (
                  <Text style={[s.fieldError, { color: colors.periodColor }]}>
                    Please choose a guidance preference.
                  </Text>
                )}
                <View style={[s.guidanceChoiceStack,
                  fertilityError && !cycleDraft.fertilityIntent && {
                    borderWidth: 1, borderColor: `${colors.periodColor}36`,
                    borderRadius: 16, padding: 8 }]}>
                  {fertilityOptions.map((option) => {
                    const active = cycleDraft.fertilityIntent === option.label;
                    return (
                      <Pressable
                        key={option.label}
                        onPress={() => { updateCycleDraft("fertilityIntent", option.label); setFertilityError(false); }}
                        style={({ pressed }) => [
                          s.guidanceChoice,
                          { backgroundColor: active ? `${option.color}12` : colors.surface,
                            borderColor:     active ? `${option.color}70`  : colors.border },
                          pressed && s.pressed,
                        ]}
                      >
                        <View style={[s.guidanceChoiceIcon, { backgroundColor: `${option.color}18` }]}>
                          {option.label === "Yes" ? (
                            <Feather name="droplet" size={18} color={option.color} />
                          ) : (
                            <MaterialCommunityIcons name={option.icon} size={19} color={option.color} />
                          )}
                        </View>
                        <View style={s.guidanceChoiceCopy}>
                          <FittedText style={[s.guidanceChoiceLabel,
                            { color: active ? option.color : colors.textPrimary }]}>
                          {option.label}
                          </FittedText>
                          <Text style={[s.guidanceChoiceSub, { color: colors.textMuted }]}>{option.sub}</Text>
                        </View>
                        <View style={[s.guidanceRadio,
                          { borderColor:     active ? option.color : colors.border,
                            backgroundColor: active ? option.color : "transparent" }]}>
                          {active ? <Ionicons name="checkmark" size={11} color={colors.background} /> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* ── CTA — Bloom Pink → Golden Sand, Midnight Plum text (10.4:1 ✓) */}
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [s.ctaShell, { shadowColor: colors.primaryCTA }, pressed && s.pressed]}
          >
            <LinearGradient
              colors={[colors.primaryCTA, colors.warning]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.ctaBtn}
            >
              <Text style={[s.ctaText, { color: colors.background }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.background} />
            </LinearGradient>
          </Pressable>

          {/* ── Lock hint ───────────────────────────────────────────────── */}
          <View style={s.lockRow}>
            <MaterialCommunityIcons name="lock-outline" size={13} color={colors.textMuted} />
            <Text style={[s.lockText, { color: colors.textMuted }]}>You can always update this later.</Text>
          </View>

          {/* ── Page dots ───────────────────────────────────────────────── */}
          <View style={s.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[s.dot,
                i === 2
                  ? { width: 26, height: 8, borderRadius: 4, backgroundColor: colors.primaryCTA }
                  : { backgroundColor: `${colors.primaryCTA}40` },
              ]} />
            ))}
          </View>

          <View style={{ height: 36 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── InlineCalendar ──────────────────────────────────────────────────────────────────
// Replaces the gesture-conflicting DateWheelPicker with a tap-based 7-column
// inline calendar. Zero nested ScrollViews — no gesture conflicts at all.
// Confirm Date button appears after selection — micro-animation on confirm.
const CAL_DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function InlineCalendar({
  date,
  onChange,
}: {
  date: Date;
  onChange: (d: Date) => void;
}) {
  const colors = darkColors;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear ] = useState(date.getFullYear());
  const [viewMonth, setViewMonth] = useState(date.getMonth());

  // Pending date: what the user tapped. Starts matching currently confirmed date.
  const [pendingDate, setPendingDate] = useState<Date>(() => {
    const d = new Date(date); d.setHours(0, 0, 0, 0); return d;
  });

  // Pulse animation for selection
  const selectionScale = useRef(new Animated.Value(1)).current;

  // Keep internal calendar state in sync with parent value
  useEffect(() => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    setPendingDate(d);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [date]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    if (nextY > today.getFullYear() || (nextY === today.getFullYear() && nextM > today.getMonth())) return;
    setViewMonth(nextM);
    setViewYear(nextY);
  }

  // Build day cells
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoNext =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  const confirmed = new Date(date); confirmed.setHours(0, 0, 0, 0);

  return (
    <View style={s.calWrap}>
      {/* Month / year navigation */}
      <View style={s.calHeader}>
        <Pressable
          onPress={prevMonth}
          style={({ pressed }) => [s.calNavBtn, pressed && s.pressed]}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={17} color={colors.textPrimary} />
        </Pressable>
        <Text style={[s.calHeaderLabel, { color: colors.textPrimary }]}>
          {MONTH_LABELS[viewMonth]} {viewYear}
        </Text>
        <Pressable
          onPress={nextMonth}
          style={({ pressed }) => [
            s.calNavBtn,
            !canGoNext && { opacity: 0.28 },
            pressed && s.pressed,
          ]}
          hitSlop={10}
          disabled={!canGoNext}
        >
          <Ionicons name="chevron-forward" size={17} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View style={s.calDayNames}>
        {CAL_DAY_NAMES.map((d) => (
          <Text key={d} style={[s.calDayName, { color: colors.textMuted }]}>{d}</Text>
        ))}
      </View>

      {/* Day grid — highlights selected cell dynamically */}
      <View style={s.calGrid}>
        {cells.map((day, idx) => {
          if (day == null) return <View key={idx} style={s.calCell} />;
          const cellDate = new Date(viewYear, viewMonth, day);
          cellDate.setHours(0, 0, 0, 0);
          const isPending  = cellDate.getTime() === pendingDate.getTime();
          const isConfirmed = cellDate.getTime() === confirmed.getTime();
          const isFuture = cellDate > today;
          
          return (
            <Pressable
              key={idx}
              onPress={() => {
                if (!isFuture) {
                  const next = new Date(viewYear, viewMonth, day);
                  next.setHours(0, 0, 0, 0);
                  setPendingDate(next);
                  
                  // Trigger high-end selection checkmark scale spring pulse animation
                  selectionScale.setValue(0.5);
                  Animated.spring(selectionScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 180,
                    useNativeDriver: true,
                  }).start(() => {
                    onChange(next);
                  });
                }
              }}
              disabled={isFuture}
              style={({ pressed }) => [
                s.calCell,
                isFuture && { opacity: 0.22 },
                pressed && !isFuture && s.pressed,
              ]}
            >
              {isPending ? (
                <Animated.View
                  style={{
                    position: "absolute",
                    width: CAL_CELL_SIZE - 4,
                    height: CAL_CELL_SIZE - 4,
                    borderRadius: (CAL_CELL_SIZE - 4) / 2,
                    backgroundColor: colors.primaryCTA,
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ scale: selectionScale }],
                  }}
                >
                  <Ionicons name="checkmark" size={16} color={colors.background} />
                </Animated.View>
              ) : isConfirmed ? (
                <View
                  style={{
                    position: "absolute",
                    width: CAL_CELL_SIZE - 4,
                    height: CAL_CELL_SIZE - 4,
                    borderRadius: (CAL_CELL_SIZE - 4) / 2,
                    borderWidth: 1.5,
                    borderColor: `${colors.primaryCTA}80`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={[s.calCellText, { color: colors.textPrimary, fontFamily: F.uiBold }]}>
                    {day}
                  </Text>
                </View>
              ) : (
                <Text style={[s.calCellText, { color: colors.textPrimary }]}>
                  {day}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}


function StepperBlock({
  label, value, unit, min, max, onChange,
}: {
  label: string; value: number; unit: string;
  min: number; max: number; onChange: (v: number) => void;
}) {
  const colors = darkColors;
  return (
    <View style={s.stepperBlock}>
      <Text style={[s.stepperBlockLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={s.stepperControls}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          style={({ pressed }) => [
            s.stepperBtn,
            { backgroundColor: `${colors.primaryCTA}12`, borderColor: `${colors.primaryCTA}2A` },
            value <= min && { backgroundColor: `${colors.border}20`, borderColor: colors.border },
            pressed && s.pressed,
          ]}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={18}
            color={value <= min ? `${colors.textMuted}44` : colors.primaryCTA} />
        </Pressable>

        <View style={s.stepperValueWrap}>
          <Text style={[s.stepperValue, { color: colors.textPrimary }]}>{value}</Text>
          <Text style={[s.stepperUnit,  { color: colors.textMuted  }]}>{unit}</Text>
        </View>

        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          style={({ pressed }) => [
            s.stepperBtn,
            { backgroundColor: `${colors.primaryCTA}12`, borderColor: `${colors.primaryCTA}2A` },
            value >= max && { backgroundColor: `${colors.border}20`, borderColor: colors.border },
            pressed && s.pressed,
          ]}
          disabled={value >= max}
        >
          <Ionicons name="add" size={18}
            color={value >= max ? `${colors.textMuted}44` : colors.primaryCTA} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── FlowDrop ─────────────────────────────────────────────────────────────────
// Represents water/blood drop fill level. Shell uses surfaceRaised so it reads
// as a container on dark cards without flashing pure white.
// Represents water/blood drop fill level. Uses Svg with a ClipPath to achieve horizontal level filling.
function FlowDrop({ fill, color, active }: { fill: number; color: string; active: boolean }) {
  const colors = darkColors;
  const height = 48;
  const fillHeight = Math.round(fill * 46);
  const fillY = height - fillHeight;

  return (
    <View style={{ width: 44, height: 54, justifyContent: 'center', alignItems: 'center', marginVertical: 4 }}>
      <Svg width={36} height={48} viewBox="0 0 36 48">
        <Defs>
          <ClipPath id="dropClip">
            <Path d="M18 2C18 2 34 18 34 32A16 16 0 1 1 2 32C2 18 18 2 18 2Z" />
          </ClipPath>
        </Defs>
        
        {/* Background Droplet Container (Empty State) */}
        <Path 
          d="M18 2C18 2 34 18 34 32A16 16 0 1 1 2 32C2 18 18 2 18 2Z" 
          fill={colors.surfaceRaised} 
          stroke={active ? color : colors.border} 
          strokeWidth={1.5}
        />
        
        {/* Filled Liquid level-filling layer (Clipped) */}
        <Rect 
          x={0} 
          y={fillY} 
          width={36} 
          height={fillHeight} 
          fill={color} 
          clipPath="url(#dropClip)"
        />
        
        {/* Precise Droplet Outline Border */}
        <Path 
          d="M18 2C18 2 34 18 34 32A16 16 0 1 1 2 32C2 18 18 2 18 2Z" 
          fill="none" 
          stroke={active ? color : colors.border} 
          strokeWidth={1.5}
        />

        {/* Soft highlight reflection curve inside droplet */}
        <Path
          d="M11 14C8 18 8 22 8 22"
          fill="none"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

// ─── Styles (layout only — all colors injected inline) ────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  headerRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SIDE_PAD, paddingTop: 8, paddingBottom: 6, gap: 10,
  },
  headerBackBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 2,
    flexShrink: 0,
  },
  headerCenter: { flex: 1, alignItems: "center", gap: 1 },
  brandName: {
    fontFamily: F.luxuryBold, fontSize: 20, letterSpacing: 0.3,
  },
  brandTagline: {
    fontFamily: F.bodyRegularItalic, fontSize: 13, lineHeight: 18, letterSpacing: 0.15,
  },
  progressRingOuter: {
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14,
    elevation: 6, borderRadius: 28,
  },
  progressRing: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 1,
  },
  progressNum:   { fontFamily: F.uiExtraBold, fontSize: 18, color: "#FFF", lineHeight: 22 },
  progressSlash: { fontFamily: F.uiLight,     fontSize: 14, color: "rgba(255,255,255,0.70)", lineHeight: 22 },
  progressDenom: { fontFamily: F.uiMedium,    fontSize: 13, color: "rgba(255,255,255,0.80)", lineHeight: 22 },

  scroll: { paddingHorizontal: SIDE_PAD, paddingBottom: 16 },

  heroWrap: { height: 210, alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 4 },
  auraRing3: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 1.5 },
  auraRing2: { position: "absolute", width: 160, height: 160, borderRadius: 80, borderWidth: 2   },
  auraRing1: { position: "absolute", width: 118, height: 118, borderRadius: 59, borderWidth: 1.5 },
  crescentLeft:  { position: "absolute", left: W * 0.10, top: 30,    width: 22, height: 22, borderRadius: 11, borderWidth: 1 },
  crescentRight: { position: "absolute", right: W * 0.10, bottom: 36, width: 16, height: 16, borderRadius: 8,  borderWidth: 1 },
  sparkle: { position: "absolute", width: 7, height: 7, borderRadius: 3.5 },
  bloopContainer: { alignItems: "center", justifyContent: "center" },
  bloopAura:  { position: "absolute", width: 100, height: 100, borderRadius: 50 },
  bloopImg:   { width: 110, height: 100 },

  heading: {
    fontFamily: F.luxuryBold, fontSize: 36, lineHeight: 42,
    textAlign: "center", marginTop: 4, letterSpacing: 0.2,
  },
  headingSub: {
    fontFamily: F.uiMedium, fontSize: 14, lineHeight: 20,
    textAlign: "center", marginTop: 8, marginBottom: 22, paddingHorizontal: 16,
  },

  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 14, height: 58, marginBottom: 6,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 2,
  },
  inputIconBox: { width: 34, alignItems: "center", justifyContent: "center" },
  nameInput: {
    flex: 1, fontFamily: F.uiSemiBold, fontSize: 16,
    paddingLeft: 6, height: "100%",
  },
  nameError: { fontFamily: F.uiMedium, fontSize: 12.5, marginBottom: 10, marginLeft: 4, lineHeight: 18 },

  sectionLabelRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 14 },
  sectionLabel: { fontFamily: F.uiBold, fontSize: 16, letterSpacing: 0.3 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: CARD_GAP, marginBottom: 28 },
  cardShell: {
    width: CARD_W, borderRadius: 24,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.20, shadowRadius: 22, elevation: 4,
  },
  card: {
    width: CARD_W, height: CARD_H,
    borderRadius: 24, overflow: "hidden",
  },
  cardImgWrap: { flex: 1, overflow: "hidden" },
  cardImg:     { width: "100%", height: "100%" },
  cardImgFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 64 },
  cardBottom: {
    alignItems: "center", flexDirection: "row", gap: 8,
    paddingHorizontal: 12, paddingBottom: 14, paddingTop: 10,
  },
  stageIconBadge: {
    alignItems: "center", borderRadius: 14, height: 28, justifyContent: "center", width: 28,
  },
  cardLabel: {
    fontFamily: F.uiBold, fontSize: 14, lineHeight: 19, letterSpacing: 0.2,
    flex: 1,
  },
  checkBadge: {
    position: "absolute", top: 10, right: 10,
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.40, shadowRadius: 8, elevation: 4,
  },

  cycleBasicsCard: {
    borderRadius: 24, borderWidth: 1,
    marginBottom: 22, marginTop: -6, padding: 18,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 3,
    gap: 18,
  },
  cycleBasicsHeader: { alignItems: "center", flexDirection: "row", gap: 8 },
  cycleBasicsTitle:  { fontFamily: F.uiBold, fontSize: 15 },
  cycleBlock:        { gap: 10 },
  cycleBlockLabel:   { fontFamily: F.uiSemiBold, fontSize: 12, letterSpacing: 0.2 },
  cycleBlockHeader:  { flexDirection: "row", alignItems: "center", gap: 10 },
  cycleBlockIcon: {
    width: 34, height: 34, borderRadius: 13,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  cycleBlockCopy: { flex: 1 },
  cycleBlockSub:  { fontFamily: F.uiRegular, fontSize: 11.5, lineHeight: 16, marginTop: 2 },

  flowChoiceGrid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "space-between", rowGap: 10,
  },
  fieldError: { fontFamily: F.uiMedium, fontSize: 12, marginBottom: 6, marginLeft: 2 },
  flowChoiceCard: {
    width: "48%",
    minHeight: 96, borderRadius: 20, borderWidth: 1,
    alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 8, gap: 5,
  },
  flowDropShell: {
    width: 34, height: 42,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 8,
    borderWidth: 1.5, overflow: "hidden",
    transform: [{ rotate: "45deg" }],
  },
  flowDropFill: { position: "absolute", left: 0, right: 0, bottom: 0 },
  flowDropShine: {
    position: "absolute", width: 12, height: 18, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)", top: 8, left: 9,
  },
  flowChoiceLabel: { fontFamily: F.uiBlack, fontSize: 13, marginTop: 4, textAlign: "center", width: "100%" },
  flowChoiceSub:   { fontFamily: F.uiMedium, fontSize: 10.5 },

  supportChoiceGrid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "space-between", gap: 10,
  },
  supportChoiceCard: {
    flexBasis: "48%", minHeight: 110, borderRadius: 18, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
    paddingVertical: 14, paddingHorizontal: 10, gap: 8,
  },
  supportCheckBadge: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  supportChoiceIcon: {
    width: 44, height: 44, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  supportChoiceLabel: { fontFamily: F.uiBlack, fontSize: 13, textAlign: "center", width: "100%" },
  supportChoiceSub:   { fontFamily: F.uiRegular, fontSize: 10.5, lineHeight: 14, textAlign: "center" },

  guidanceHeaderCard: {
    borderRadius: 18, borderWidth: 1, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  guidanceIconStack: {
    width: 42, height: 42, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },
  guidanceHeaderCopy: { flex: 1 },
  guidanceChoiceStack: { gap: 9 },
  guidanceChoice: {
    minHeight: 68, borderRadius: 18, borderWidth: 1,
    flexDirection: "row", alignItems: "center",
    gap: 10, paddingHorizontal: 12, paddingVertical: 11,
  },
  guidanceChoiceIcon: {
    width: 38, height: 38, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
  },
  guidanceChoiceCopy: { flex: 1 },
  guidanceChoiceLabel: { fontFamily: F.uiBlack, fontSize: 13, width: "100%" },
  guidanceChoiceSub:   { fontFamily: F.uiRegular, fontSize: 11, lineHeight: 15, marginTop: 2 },
  guidanceRadio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },

  datePickerCard: {
    borderRadius: 16, borderWidth: 1,
    paddingVertical: 0, paddingHorizontal: 0,
    overflow: "hidden",
  },

  // ─── InlineCalendar styles ────────────────────────────────────────────────────────────
  calWrap: {
    width: "100%",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  calHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 6, paddingHorizontal: 2,
  },
  calHeaderLabel: {
    fontFamily: F.uiBold, fontSize: 13, letterSpacing: 0.2,
  },
  calNavBtn: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  calDayNames: {
    flexDirection: "row", marginBottom: 3,
    alignSelf: "center", width: CAL_CELL_SIZE * 7,
  },
  calDayName: {
    flex: 1, textAlign: "center",
    fontFamily: F.uiSemiBold, fontSize: 10, letterSpacing: 0.4, textTransform: "uppercase",
  },
  calGrid: {
    flexDirection: "row", flexWrap: "wrap",
    alignSelf: "center", width: CAL_CELL_SIZE * 7,
  },
  calCell: {
    width: CAL_CELL_SIZE,
    height: CAL_CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  calCellText: {
    fontFamily: F.uiMedium, fontSize: 12,
  },
  calConfirmWrap: {
    marginTop: 10,
    alignItems: "center",
  },
  calConfirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: darkColors.primaryCTA,
  },
  calConfirmText: {
    fontFamily: F.uiBold,
    fontSize: 13,
    color: darkColors.background,
  },

  stepperPair: {
    flexDirection: "row", borderRadius: 18, borderWidth: 1, overflow: "hidden",
  },
  stepperBlock:  { flex: 1, alignItems: "center", paddingVertical: 14, gap: 6 },
  stepperDivider:{ width: 1, marginVertical: 14 },
  stepperBlockLabel: {
    fontFamily: F.uiSemiBold, fontSize: 11, letterSpacing: 0.3, textTransform: "uppercase",
  },
  stepperControls: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepperBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  stepperValueWrap: { alignItems: "center", minWidth: 42 },
  stepperValue: { fontFamily: F.luxuryBold, fontSize: 38, lineHeight: 42 },
  stepperUnit:  { fontFamily: F.uiRegular, fontSize: 11, textAlign: "center" },

  ctaShell: {
    borderRadius: 999,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 22, elevation: 6,
    marginBottom: 16,
  },
  ctaBtn: {
    height: 60, borderRadius: 999,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  ctaText: { fontFamily: F.uiBlack, fontSize: 17, letterSpacing: 0.3 },

  lockRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5, marginBottom: 20,
  },
  lockText: { fontFamily: F.uiMedium, fontSize: 12 },

  dotsRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },

  conditionsSub: { fontFamily: F.uiRegular, fontSize: 12, marginTop: -10, marginBottom: 12 },
  optionalBadge: {
    marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, borderWidth: 1,
  },
  optionalBadgeText: {
    fontFamily: F.uiBold, fontSize: 9, letterSpacing: 0.4, textTransform: "uppercase",
  },

  // ── 4-column icon-card grid for health conditions ──────────────────────────
  conditionGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 22,
  },
  conditionCard: {
    width: Math.floor((W - SIDE_PAD * 2 - 8 * 3) / 4),
    paddingVertical: 12, paddingHorizontal: 6,
    borderRadius: 18, borderWidth: 1,
    alignItems: "center", gap: 6,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 2,
  },
  conditionIconCircle: {
    width: 40, height: 40, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  conditionCardLabel: {
    fontFamily: F.uiSemiBold, fontSize: 10.5, textAlign: "center", lineHeight: 13,
    width: "100%",
  },
  conditionCheck: {
    position: "absolute", top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },

  // ── Confirmed date card styles ─────────────────────────────────────────────
  confirmedDateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  confirmedDateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confirmedDateIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmedDateCopy: {
    flexDirection: "column",
    gap: 1.5,
  },
  confirmedDateLabel: {
    fontFamily: F.uiMedium,
    fontSize: 10.5,
  },
  confirmedDateValue: {
    fontFamily: F.uiBold,
    fontSize: 13,
  },
  confirmedDateEditCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Selected date pill (above InlineCalendar) ─────────────────────────────
  selectedDatePill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "center", paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1, marginBottom: 8,
  },
  selectedDateText: {
    fontFamily: F.uiBold, fontSize: 13, letterSpacing: 0.2,
  },

  pressed: { transform: [{ scale: 0.97 }] },
});
