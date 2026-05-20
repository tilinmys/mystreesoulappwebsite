/**
 * Onboarding Screen 3 — Life Stage
 *
 * "Tell us about yourself" — Full Name + 2×2 life-stage card grid.
 * Cycle basics: inline DateWheelPicker for last period start, Stepper for
 * period / cycle length, chips for flow / support needs / fertility intent.
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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../../components/CachedImage";
import { ValidationToast } from "../../components/ValidationToast";
import { F } from "../../constants/fonts";
import { getOnboardingPrompt } from "../../constants/onboardingAdaptation";
import { useSafeBack } from "../../hooks/useSafeBack";
import { CycleBasics, LifeStage, useOnboardingStore } from "../../store/onboardingStore";

// ─── Screen geometry ──────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const SIDE_PAD = 20;
const CARD_GAP = 12;
const CARD_W = (W - SIDE_PAD * 2 - CARD_GAP) / 2;
const CARD_H = Math.round(CARD_W * 1.32);

// ─── Image assets ─────────────────────────────────────────────────────────────
const imgBloop    = require("../../public/images/bloop-welcome.webp");
const imgTeen     = require("../../public/images/adolescence-safe-space.webp");
const imgCycle    = require("../../public/images/fertility-glow-visual.webp");
const imgPreg     = require("../../public/images/pregnancy-journey-visual.webp");
const imgMeno     = require("../../public/images/menopause-transition-visual.webp");

const C = {
  terra:       "#E07A5F",
  terraLight:  "#F4A27D",
  terraGlow:   "rgba(224,122,95,0.22)",
  sage:        "#5E9B6B",
  lavender:    "#9277C8",
  gold:        "#C9A96E",
  onSurface:   "#221B1C",
  onVariant:   "#6B4C55",
  placeholder: "rgba(107,76,85,0.40)",
  surface:     "rgba(255,255,255,0.68)",
  border:      "rgba(255,255,255,0.80)",
  aura1:       "rgba(240,190,200,0.32)",
  aura2:       "rgba(214,174,230,0.22)",
  aura3:       "rgba(198,186,238,0.16)",
};

// ─── Cycle setup choices ─────────────────────────────────────────────────────
const usualFlowOptions = [
  { label: "Spotting", fill: 0.18, icon: "water-outline" as const, color: "#E89A86", sub: "Tiny marks" },
  { label: "Light", fill: 0.38, icon: "water-percent" as const, color: "#E9856B", sub: "Easy days" },
  { label: "Medium", fill: 0.68, icon: "water" as const, color: "#E07A5F", sub: "Steady flow" },
  { label: "Heavy", fill: 1.0, icon: "water-alert" as const, color: "#B84040", sub: "Needs care" },
] as const;

const cycleSupportNeeds = [
  { label: "Cramps", icon: "lightning-bolt" as const, color: "#E07A5F", sub: "Pain relief cues" },
  { label: "Mood", icon: "heart-flash" as const, color: "#E05875", sub: "Emotional shifts" },
  { label: "Energy", icon: "battery-heart" as const, color: "#C9A96E", sub: "Low or high days" },
  { label: "Sleep", icon: "moon-waning-crescent" as const, color: "#9277C8", sub: "Rest rhythm" },
] as const;

const fertilityOptions = [
  { label: "Yes", icon: "sprout" as const, color: "#5E9B6B", sub: "Show fertile window and ovulation cues" },
  { label: "Maybe later", icon: "calendar-clock" as const, color: "#C9A96E", sub: "Keep it gentle for now" },
  { label: "No", icon: "shield-check" as const, color: "#E07A5F", sub: "Focus on cycle and period care" },
] as const;

const CONDITIONS = [
  "PCOS", "PCOD", "Endometriosis", "Thyroid",
  "Fibroids", "Irregular cycles", "Prefer not to say", "Other",
] as const;

// ─── Month labels ─────────────────────────────────────────────────────────────
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Brand palette ────────────────────────────────────────────────────────────
// ─── Life-stage card data ─────────────────────────────────────────────────────
type StageCard = {
  id: LifeStage;
  label: string;
  image: ReturnType<typeof require>;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconBg: string;
  grad: [string, string, ...string[]];
  labelColor: string;
  gradOverlay: string;
};

const STAGES: StageCard[] = [
  {
    id: "teen",
    label: "Teen",
    image: imgTeen,
    icon: "account-heart-outline",
    iconBg: "rgba(46,125,69,0.16)",
    grad: ["#C8E6C9", "#A5D6A7", "#E8F5E9"],
    labelColor: "#2E7D45",
    gradOverlay: "#C8E6C9",
  },
  {
    id: "cycle_fertility",
    label: "Cycle &\nFertility",
    image: imgCycle,
    icon: "calendar-heart",
    iconBg: "rgba(173,62,104,0.16)",
    grad: ["#FDDDE8", "#F9C0D0", "#FBF0F4"],
    labelColor: "#AD3E68",
    gradOverlay: "#FDDDE8",
  },
  {
    id: "pregnancy",
    label: "Pregnancy",
    image: imgPreg,
    icon: "human-pregnant",
    iconBg: "rgba(176,37,53,0.15)",
    grad: ["#FFCDD2", "#EF9A9A", "#FFF3F4"],
    labelColor: "#B02535",
    gradOverlay: "#FFCDD2",
  },
  {
    id: "menopause",
    label: "Menopause",
    image: imgMeno,
    icon: "weather-sunset",
    iconBg: "rgba(138,90,10,0.14)",
    grad: ["#FFE082", "#FFCC02", "#FFF8E1"],
    labelColor: "#8A5A0A",
    gradOverlay: "#FFE082",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HealthSetupScreen() {
  const router     = useRouter();
  const safeBack   = useSafeBack("/(onboarding)/privacy-consent");
  const name       = useOnboardingStore((s) => s.name);
  const setName    = useOnboardingStore((s) => s.setName);
  const lifeStage  = useOnboardingStore((s) => s.lifeStage);
  const setLifeStage = useOnboardingStore((s) => s.setLifeStage);
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const cycleBasics = useOnboardingStore((s) => s.cycleBasics);
  const prompt        = getOnboardingPrompt(selectedGoals);
  const setCycleBasics = useOnboardingStore((s) => s.setCycleBasics);

  const [selected, setSelected]     = useState<LifeStage>(lifeStage ?? "teen");
  const [cycleDraft, setCycleDraft] = useState<CycleBasics>(cycleBasics);
  const [conditions, setConditions]   = useState<string[]>([]);
  const [nameError, setNameError]     = useState(false);
  const [flowError, setFlowError]     = useState(false);
  const [fertilityError, setFertilityError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // ── New date / length pickers state ────────────────────────────────────────
  const [lastPeriodDate, setLastPeriodDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // default: one week ago
    return d;
  });
  const [periodLengthDays, setPeriodLengthDays] = useState(5);
  const [cycleLengthDays, setCycleLengthDays]   = useState(28);

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
  const breathe = useRef(new Animated.Value(0)).current;
  const floatY  = useRef(new Animated.Value(0)).current;
  const auraOp  = useRef(new Animated.Value(0.32)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a1 = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe,   { toValue: 1, duration: 3400, useNativeDriver: true }),
        Animated.timing(breathe,   { toValue: 0, duration: 3400, useNativeDriver: true }),
      ])
    );
    const a2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY,    { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(floatY,    { toValue: 0, duration: 2800, useNativeDriver: true }),
      ])
    );
    const a3 = Animated.loop(
      Animated.sequence([
        Animated.timing(auraOp,    { toValue: 0.62, duration: 2600, useNativeDriver: true }),
        Animated.timing(auraOp,    { toValue: 0.22, duration: 2600, useNativeDriver: true }),
      ])
    );
    const a4 = Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
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
    setNameError(false);
    setFlowError(false);
    setFertilityError(false);
    setToastMessage(null);
    setLifeStage(selected);
    if (selected === "cycle_fertility" || selectedGoals.includes("cycle")) {
      // Merge date-picker and stepper values into cycleDraft before saving
      const dateStr = `${MONTH_LABELS[lastPeriodDate.getMonth()]} ${lastPeriodDate.getDate()}, ${lastPeriodDate.getFullYear()}`;
      setCycleBasics({
        ...cycleDraft,
        lastPeriodStart: dateStr,
        periodLength:    `${periodLengthDays} days`,
        cycleLength:     `${cycleLengthDays} days`,
      });
    }
    router.push("/(onboarding)/emotional-wellness");
  }

  const updateCycleDraft = (key: keyof CycleBasics, value: string) => {
    setCycleDraft((current) => ({ ...current, [key]: value }));
  };

  const toggleCycleSupport = (value: string) => {
    setCycleDraft((current) => {
      const hasValue = current.supportNeeds.includes(value);
      return {
        ...current,
        supportNeeds: hasValue
          ? current.supportNeeds.filter((item) => item !== value)
          : [...current.supportNeeds, value],
      };
    });
  };

  const toggleCondition = (c: string) => {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const showCycleSection = selected === "cycle_fertility" || selectedGoals.includes("cycle");

  return (
    <View style={s.root}>
      {/* ── Ambient blobs — atmosphere only ──────────────────────────────── */}
      <View pointerEvents="none" style={s.blob1} />
      <View pointerEvents="none" style={s.blob2} />
      <View pointerEvents="none" style={s.blob3} />

      {/* ── Validation toast — guides user to unfilled fields ────────────── */}
      <ValidationToast message={toastMessage} onDismiss={() => setToastMessage(null)} top={56} />

      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>

        {/* ── Brand header ─────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <Pressable
            onPress={safeBack}
            style={({ pressed }) => [s.headerBackBtn, pressed && s.pressed]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={C.onVariant} />
          </Pressable>

          <View style={s.headerCenter}>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandTagline}>For every stage of you.</Text>
          </View>

          {/* Step 3/4 badge */}
          <View style={s.progressRingOuter}>
            <LinearGradient
              colors={["#E07A5F", "#F4A27D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
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
            <Animated.View style={[s.auraRing3, { opacity: auraOp, transform: [{ scale: ringScale }] }]} />
            <Animated.View style={[s.auraRing2, { opacity: auraOp }]} />
            <Animated.View style={[s.auraRing1, { opacity: auraOp }]} />

            <View style={s.crescentLeft} />
            <View style={s.crescentRight} />

            <View style={[s.sparkle, { top: 28, left: W * 0.28 }]} />
            <View style={[s.sparkle, { top: 48, right: W * 0.26 }]} />
            <View style={[s.sparkle, { bottom: 30, left: W * 0.32 }]} />

            <Animated.View
              style={[
                s.bloopContainer,
                { transform: [{ scale: bloopScale }, { translateY: bloopFloat }] },
              ]}
            >
              <View style={s.bloopAura} />
              <CachedImage
                priority="high"
                source={imgBloop}
                style={s.bloopImg}
                contentFit="contain"
              />
            </Animated.View>
          </View>

          {/* ── Main heading ────────────────────────────────────────────── */}
          <Animated.View style={{ opacity: entranceOp, transform: [{ translateY: entranceY }] }}>
            <Text style={s.heading}>Tell us about{"\n"}yourself</Text>
            <Text style={s.headingSub}>{prompt.subheading}</Text>
          </Animated.View>

          {/* ── Full Name input ─────────────────────────────────────────── */}
          <View style={[s.inputRow, nameError && !hasFullName && s.inputRowError]}>
            <View style={s.inputIconBox}>
              <Ionicons name="person-outline" size={19} color={nameError && !hasFullName ? "#C05555" : C.onVariant} />
            </View>
            <TextInput
              style={s.nameInput}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError && text.trim().split(/\s+/).filter(Boolean).length >= 2) {
                  setNameError(false);
                }
              }}
              placeholder="Full Name"
              placeholderTextColor={C.placeholder}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
          {nameError && !hasFullName && (
            <Text style={s.nameError}>Please enter your full name.</Text>
          )}

          {/* ── Life stage section label ─────────────────────────────────── */}
          <View style={s.sectionLabelRow}>
            <Text style={s.sectionLabel}>Your Life Stage</Text>
            <MaterialCommunityIcons
              name="star-four-points"
              size={13}
              color={C.terra}
              style={{ marginTop: 1, marginLeft: 4 }}
            />
          </View>

          {/* ── 2 × 2 card grid ──────────────────────────────────────────── */}
          <Animated.View style={{ opacity: cardsOp, transform: [{ translateY: cardsY }] }}>
            <View style={s.grid}>
              {STAGES.map((stage) => {
                const isSel = selected === stage.id;
                return (
                  <Pressable
                    key={stage.id}
                    onPress={() => setSelected(stage.id)}
                    style={({ pressed }) => [s.cardShell, pressed && s.pressed]}
                  >
                    <LinearGradient
                      colors={stage.grad}
                      start={{ x: 0.1, y: 0 }}
                      end={{ x: 0.9, y: 1 }}
                      style={[s.card, isSel && s.cardSelected]}
                    >
                      <View style={s.cardImgWrap}>
                        <CachedImage
                          source={stage.image}
                          style={s.cardImg}
                          contentFit="cover"
                        />
                        <LinearGradient
                          colors={["transparent", stage.gradOverlay + "F5"]}
                          style={s.cardImgFade}
                        />
                      </View>
                      <View style={s.cardBottom}>
                        <View style={[s.stageIconBadge, { backgroundColor: stage.iconBg }]}>
                          <MaterialCommunityIcons name={stage.icon} size={16} color={stage.labelColor} />
                        </View>
                        <Text style={[s.cardLabel, { color: stage.labelColor }]}>
                          {stage.label}
                        </Text>
                      </View>
                      {isSel && (
                        <View style={s.checkBadge}>
                          <Ionicons name="checkmark" size={13} color="#FFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* ── Health conditions (optional) ─────────────────────────────── */}
          <View style={s.sectionLabelRow}>
            <Text style={s.sectionLabel}>Health Conditions</Text>
            <View style={s.optionalBadge}>
              <Text style={s.optionalBadgeText}>Optional</Text>
            </View>
          </View>
          <Text style={s.conditionsSub}>Helps Bloop tailor guidance to your body.</Text>
          <View style={s.conditionsWrap}>
            {CONDITIONS.map((c) => {
              const active = conditions.includes(c);
              return (
                <Pressable
                  key={c}
                  onPress={() => toggleCondition(c)}
                  style={({ pressed }) => [
                    s.conditionChip,
                    active && s.conditionChipActive,
                    pressed && s.pressed,
                  ]}
                >
                  {active && (
                    <Ionicons name="checkmark-circle" size={13} color={C.terra} style={{ marginRight: 3 }} />
                  )}
                  <Text style={[s.conditionChipText, active && s.conditionChipTextActive]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── Cycle basics ─────────────────────────────────────────────── */}
          {showCycleSection && (
            <View style={s.cycleBasicsCard}>
              <View style={s.cycleBasicsHeader}>
                <MaterialCommunityIcons name="calendar-heart" size={18} color={C.terra} />
                <Text style={s.cycleBasicsTitle}>Cycle basics</Text>
              </View>

              {/* ── Last period date ─────────────────────────────────── */}
              <View style={s.cycleBlock}>
                <Text style={s.cycleBlockLabel}>Last period started</Text>
                <View style={s.datePickerCard}>
                  <DateWheelPicker
                    date={lastPeriodDate}
                    onChange={setLastPeriodDate}
                  />
                </View>
              </View>

              {/* ── Period length stepper ─────────────────────────────── */}
              <View style={s.stepperPair}>
                <StepperBlock
                  label="Period lasts"
                  value={periodLengthDays}
                  unit="days"
                  min={1}
                  max={14}
                  onChange={setPeriodLengthDays}
                />
                <View style={s.stepperDivider} />
                <StepperBlock
                  label="Cycle length"
                  value={cycleLengthDays}
                  unit="days"
                  min={20}
                  max={45}
                  onChange={setCycleLengthDays}
                />
              </View>

              {/* ── Usual flow chips ──────────────────────────────────── */}
              <View style={s.cycleBlock}>
                <View style={s.cycleBlockHeader}>
                  <View style={s.cycleBlockIcon}>
                    <MaterialCommunityIcons name="water" size={15} color={C.terra} />
                  </View>
                  <View style={s.cycleBlockCopy}>
                    <Text style={s.cycleBlockLabel}>Usual flow</Text>
                    <Text style={s.cycleBlockSub}>Pick the pattern closest to most periods.</Text>
                  </View>
                </View>
                {flowError && !cycleDraft.usualFlow && (
                  <Text style={s.fieldError}>Please select your usual flow.</Text>
                )}
                <View style={[s.flowChoiceGrid, flowError && !cycleDraft.usualFlow && s.gridError]}>
                  {usualFlowOptions.map((option) => {
                    const active = cycleDraft.usualFlow === option.label;
                    return (
                      <Pressable
                        key={option.label}
                        onPress={() => { updateCycleDraft("usualFlow", option.label); setFlowError(false); }}
                        style={({ pressed }) => [
                          s.flowChoiceCard,
                          active && { borderColor: option.color, backgroundColor: `${option.color}12` },
                          pressed && s.pressed,
                        ]}
                      >
                        <FlowDrop fill={option.fill} color={option.color} active={active} />
                        <Text style={[s.flowChoiceLabel, active && { color: option.color }]}>{option.label}</Text>
                        <Text style={s.flowChoiceSub}>{option.sub}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* ── Support needs chips ───────────────────────────────── */}
              <View style={s.cycleBlock}>
                <View style={s.cycleBlockHeader}>
                  <View style={[s.cycleBlockIcon, { backgroundColor: "rgba(146,119,200,0.12)" }]}>
                    <MaterialCommunityIcons name="heart-plus" size={15} color={C.lavender} />
                  </View>
                  <View style={s.cycleBlockCopy}>
                    <Text style={s.cycleBlockLabel}>Need support with</Text>
                    <Text style={s.cycleBlockSub}>Choose all that should shape your guidance.</Text>
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
                          active && { borderColor: `${option.color}88`, backgroundColor: `${option.color}10` },
                          pressed && s.pressed,
                        ]}
                      >
                        {active && (
                          <View style={s.supportCheckBadge}>
                            <Ionicons name="checkmark" size={10} color="#FFF" />
                          </View>
                        )}
                        <View style={[s.supportChoiceIcon, { backgroundColor: `${option.color}18` }]}>
                          <MaterialCommunityIcons name={option.icon} size={22} color={option.color} />
                        </View>
                        <Text style={[s.supportChoiceLabel, active && { color: option.color }]}>{option.label}</Text>
                        <Text style={s.supportChoiceSub}>{option.sub}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* ── Fertility guidance chips ──────────────────────────── */}
              <View style={s.cycleBlock}>
                <View style={s.guidanceHeaderCard}>
                  <View style={s.guidanceIconStack}>
                    <MaterialCommunityIcons name={selected === "teen" ? "book-heart" : "sprout"} size={20} color={C.sage} />
                  </View>
                  <View style={s.guidanceHeaderCopy}>
                    <Text style={s.cycleBlockLabel}>
                      {selected === "teen" ? "Period education guidance" : "Fertility-aware guidance"}
                    </Text>
                    <Text style={s.cycleBlockSub}>
                      {selected === "teen"
                        ? "Simple, age-safe explanations without pressure."
                        : "Ovulation and fertile-window cues only if you want them."}
                    </Text>
                  </View>
                </View>
                {fertilityError && !cycleDraft.fertilityIntent && (
                  <Text style={s.fieldError}>Please choose a guidance preference.</Text>
                )}
                <View style={[s.guidanceChoiceStack, fertilityError && !cycleDraft.fertilityIntent && s.gridError]}>
                  {fertilityOptions.map((option) => {
                    const active = cycleDraft.fertilityIntent === option.label;
                    return (
                      <Pressable
                        key={option.label}
                        onPress={() => { updateCycleDraft("fertilityIntent", option.label); setFertilityError(false); }}
                        style={({ pressed }) => [
                          s.guidanceChoice,
                          active && { borderColor: `${option.color}88`, backgroundColor: `${option.color}10` },
                          pressed && s.pressed,
                        ]}
                      >
                        <View style={[s.guidanceChoiceIcon, { backgroundColor: `${option.color}18` }]}>
                          <MaterialCommunityIcons name={option.icon} size={19} color={option.color} />
                        </View>
                        <View style={s.guidanceChoiceCopy}>
                          <Text style={[s.guidanceChoiceLabel, active && { color: option.color }]}>{option.label}</Text>
                          <Text style={s.guidanceChoiceSub}>{option.sub}</Text>
                        </View>
                        <View style={[s.guidanceRadio, active && { borderColor: option.color, backgroundColor: option.color }]}>
                          {active ? <Ionicons name="checkmark" size={11} color="#FFF" /> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

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

          {/* ── Lock hint ───────────────────────────────────────────────── */}
          <View style={s.lockRow}>
            <MaterialCommunityIcons name="lock-outline" size={13} color={C.onVariant} />
            <Text style={s.lockText}>You can always update this later.</Text>
          </View>

          {/* ── Page dots ───────────────────────────────────────────────── */}
          <View style={s.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[s.dot, i === 2 && s.dotActive]} />
            ))}
          </View>

          <View style={{ height: 36 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── DateWheelPicker ──────────────────────────────────────────────────────────
// Inline 3-column wheel (Month | Day | Year) — no external lib required.

const WH = 40;   // wheel row height
const WV = 5;    // visible rows (center = selected)

function WheelCol({
  items,
  index,
  onIndex,
  width,
}: {
  items: string[];
  index: number;
  onIndex: (i: number) => void;
  width: number;
}) {
  const ref      = useRef<ScrollView>(null);
  const [live, setLive] = useState(index);

  // Scroll to external index changes (e.g. day clamping when month changes)
  useEffect(() => {
    ref.current?.scrollTo({ y: index * WH, animated: true });
    setLive(index);
  }, [index]);

  const commit = (y: number) => {
    const i = Math.max(0, Math.min(Math.round(y / WH), items.length - 1));
    setLive(i);
    onIndex(i);
    ref.current?.scrollTo({ y: i * WH, animated: true });
  };

  return (
    <View style={{ width, height: WH * WV, overflow: "hidden" }}>
      {/* Center-row selection stripe */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: WH * 2,
          left: 4,
          right: 4,
          height: WH,
          borderRadius: 10,
          backgroundColor: "rgba(224,122,95,0.09)",
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: "rgba(224,122,95,0.22)",
        }}
      />

      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={WH}
        decelerationRate="fast"
        nestedScrollEnabled
        contentContainerStyle={{ paddingVertical: WH * 2 }}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.y / WH);
          setLive(Math.max(0, Math.min(i, items.length - 1)));
        }}
        onMomentumScrollEnd={(e) => commit(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e)      => commit(e.nativeEvent.contentOffset.y)}
      >
        {items.map((item, i) => {
          const dist  = Math.abs(i - live);
          const isSel = dist === 0;
          return (
            <View
              key={i}
              style={{ height: WH, alignItems: "center", justifyContent: "center" }}
            >
              <Text
                style={{
                  fontFamily:  isSel ? F.uiBold : F.bodyRegular,
                  fontSize:    isSel ? 17 : dist === 1 ? 14 : 12,
                  color:       isSel
                    ? C.terra
                    : dist === 1
                    ? "rgba(107,76,85,0.55)"
                    : "rgba(107,76,85,0.25)",
                }}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Fade top/bottom so non-selected items dissolve naturally */}
      <LinearGradient
        colors={["rgba(250,247,249,1)", "rgba(250,247,249,0)"]}
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: WH * 1.6 }}
      />
      <LinearGradient
        colors={["rgba(250,247,249,0)", "rgba(250,247,249,1)"]}
        pointerEvents="none"
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: WH * 1.6 }}
      />
    </View>
  );
}

function DateWheelPicker({
  date,
  onChange,
}: {
  date: Date;
  onChange: (d: Date) => void;
}) {
  const today  = new Date();
  // Show 3 full years so users can pick "last period started" from well over a year ago
  const MIN_YR = today.getFullYear() - 2;
  const MAX_YR = today.getFullYear();

  const [mo,  setMo ] = useState(date.getMonth());
  const [day, setDay] = useState(date.getDate() - 1); // 0-indexed
  const [yr,  setYr ] = useState(date.getFullYear());

  // Cap months to today's month when on current year (no future months)
  const maxMo = yr === MAX_YR ? today.getMonth() : 11;
  // Cap days to today's day when on current year + current month
  const rawDays = new Date(yr, mo + 1, 0).getDate();
  const maxDay  = yr === MAX_YR && mo === today.getMonth() ? today.getDate() : rawDays;

  const moList  = MONTH_LABELS.slice(0, maxMo + 1);
  const dayList = Array.from({ length: maxDay }, (_, i) => String(i + 1));
  const yrList  = Array.from({ length: MAX_YR - MIN_YR + 1 }, (_, i) => String(MIN_YR + i));

  // Safe day index that never exceeds the capped day count
  const safeDay = Math.min(day, maxDay - 1);
  // Safe month index that never exceeds the capped month count
  const safeMo  = Math.min(mo, maxMo);

  function push(newMo: number, newDayIdx: number, newYr: number) {
    const capMo    = newYr === MAX_YR ? today.getMonth() : 11;
    const clampMo  = Math.min(newMo, capMo);
    const rawD     = new Date(newYr, clampMo + 1, 0).getDate();
    const capDay   = newYr === MAX_YR && clampMo === today.getMonth() ? today.getDate() : rawD;
    const clampDay = Math.min(newDayIdx, capDay - 1);
    setMo(clampMo); setDay(clampDay); setYr(newYr);
    onChange(new Date(newYr, clampMo, clampDay + 1));
  }

  return (
    <View style={s.wheelRow}>
      <WheelCol
        items={moList}
        index={safeMo}
        onIndex={(i) => push(i, safeDay, yr)}
        width={72}
      />
      <View style={s.wheelColDivider} />
      <WheelCol
        items={dayList}
        index={safeDay}
        onIndex={(i) => push(safeMo, i, yr)}
        width={52}
      />
      <View style={s.wheelColDivider} />
      <WheelCol
        items={yrList}
        index={yr - MIN_YR}
        onIndex={(i) => push(safeMo, safeDay, MIN_YR + i)}
        width={80}
      />
    </View>
  );
}

// ─── StepperBlock ─────────────────────────────────────────────────────────────
function StepperBlock({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit:  string;
  min:   number;
  max:   number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={s.stepperBlock}>
      <Text style={s.stepperBlockLabel}>{label}</Text>
      <View style={s.stepperControls}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          style={({ pressed }) => [s.stepperBtn, value <= min && s.stepperBtnDisabled, pressed && s.pressed]}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={18} color={value <= min ? "rgba(224,122,95,0.35)" : C.terra} />
        </Pressable>

        <View style={s.stepperValueWrap}>
          <Text style={s.stepperValue}>{value}</Text>
          <Text style={s.stepperUnit}>{unit}</Text>
        </View>

        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          style={({ pressed }) => [s.stepperBtn, value >= max && s.stepperBtnDisabled, pressed && s.pressed]}
          disabled={value >= max}
        >
          <Ionicons name="add" size={18} color={value >= max ? "rgba(224,122,95,0.35)" : C.terra} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function FlowDrop({ fill, color, active }: { fill: number; color: string; active: boolean }) {
  return (
    <View style={[s.flowDropShell, active && { borderColor: color }]}>
      <View style={[s.flowDropFill, { backgroundColor: color, height: `${Math.round(fill * 100)}%` }]} />
      <View style={s.flowDropShine} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safe: {
    flex: 1,
  },

  // ── Ambient blobs ─────────────────────────────────────────────────────────
  blob1: {
    position: "absolute",
    top: -140, left: -110,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: "rgba(255,183,183,0.10)",
  },
  blob2: {
    position: "absolute",
    top: 300, right: -160,
    width: 380, height: 380, borderRadius: 190,
    backgroundColor: "rgba(189,172,255,0.08)",
  },
  blob3: {
    position: "absolute",
    bottom: -80, left: -90,
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: "rgba(162,202,178,0.08)",
  },

  // ── Brand header row ──────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 10,
  },
  headerBackBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(248,244,248,0.96)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(232,225,230,0.70)",
    shadowColor: C.onVariant,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 2,
    flexShrink: 0,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 1,
  },
  brandName: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: C.onSurface,
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontFamily: F.bodyRegularItalic,
    fontSize: 13,
    lineHeight: 18,
    color: C.onVariant,
    letterSpacing: 0.15,
  },
  progressRingOuter: {
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 14, elevation: 6,
    borderRadius: 28,
  },
  progressRing: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 1,
  },
  progressNum: {
    fontFamily: F.uiExtraBold,
    fontSize: 18, color: "#FFF", lineHeight: 22,
  },
  progressSlash: {
    fontFamily: F.uiLight,
    fontSize: 14, color: "rgba(255,255,255,0.70)", lineHeight: 22,
  },
  progressDenom: {
    fontFamily: F.uiMedium,
    fontSize: 13, color: "rgba(255,255,255,0.80)", lineHeight: 22,
  },

  // ── ScrollView ────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 16,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroWrap: {
    height: 210,
    alignItems: "center", justifyContent: "center",
    marginTop: 8, marginBottom: 4,
  },
  auraRing3: {
    position: "absolute",
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1.5, borderColor: "rgba(224,122,95,0.18)",
  },
  auraRing2: {
    position: "absolute",
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 2, borderColor: "rgba(224,122,95,0.26)",
  },
  auraRing1: {
    position: "absolute",
    width: 118, height: 118, borderRadius: 59,
    backgroundColor: "rgba(240,190,200,0.22)",
    borderWidth: 1.5, borderColor: "rgba(224,122,95,0.30)",
  },
  crescentLeft: {
    position: "absolute",
    left: W * 0.10, top: 30,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "rgba(214,174,230,0.42)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.60)",
  },
  crescentRight: {
    position: "absolute",
    right: W * 0.10, bottom: 36,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: "rgba(198,228,200,0.42)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.60)",
  },
  sparkle: {
    position: "absolute",
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: "rgba(224,122,95,0.44)",
  },
  bloopContainer: {
    alignItems: "center", justifyContent: "center",
  },
  bloopAura: {
    position: "absolute",
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(240,190,200,0.38)",
  },
  bloopImg: {
    width: 110, height: 100,
  },

  // ── Heading ───────────────────────────────────────────────────────────────
  heading: {
    fontFamily: F.luxuryBold,
    fontSize: 36, lineHeight: 42,
    color: C.onSurface,
    textAlign: "center",
    marginTop: 4, letterSpacing: 0.2,
  },
  headingSub: {
    fontFamily: F.uiMedium,
    fontSize: 14, lineHeight: 20,
    color: C.onVariant,
    textAlign: "center",
    marginTop: 8, marginBottom: 22,
    paddingHorizontal: 16,
  },

  // ── Name input ────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(250,247,249,0.98)",
    borderRadius: 20, borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    paddingHorizontal: 14, height: 58,
    marginBottom: 6,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06, shadowRadius: 14, elevation: 2,
  },
  inputIconBox: {
    width: 34, alignItems: "center", justifyContent: "center",
  },
  nameInput: {
    flex: 1,
    fontFamily: F.uiSemiBold,
    fontSize: 16, color: C.onSurface,
    paddingLeft: 6, height: "100%",
  },
  inputRowError: {
    borderColor: "rgba(192,85,85,0.45)",
    backgroundColor: "rgba(255,245,245,0.98)",
  },
  nameError: {
    fontFamily: F.uiMedium,
    fontSize: 12.5, color: "#C05555",
    marginBottom: 10, marginLeft: 4, lineHeight: 18,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: 18, marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: F.uiBold,
    fontSize: 16, color: C.onSurface, letterSpacing: 0.3,
  },

  // ── 2×2 card grid ─────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: CARD_GAP, marginBottom: 28,
  },
  cardShell: {
    width: CARD_W, borderRadius: 24,
    shadowColor: "#7A4A5C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12, shadowRadius: 22, elevation: 4,
  },
  card: {
    width: CARD_W, height: CARD_H,
    borderRadius: 24, overflow: "hidden",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.70)",
  },
  cardSelected: {
    borderWidth: 2, borderColor: C.terra,
    shadowColor: C.terra,
    shadowOpacity: 0.28, shadowRadius: 18, elevation: 6,
  },
  cardImgWrap: { flex: 1, overflow: "hidden" },
  cardImg:     { width: "100%", height: "100%" },
  cardImgFade: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 64,
  },
  cardBottom: {
    alignItems: "center", flexDirection: "row", gap: 8,
    paddingHorizontal: 12, paddingBottom: 14, paddingTop: 10,
    backgroundColor: "transparent",
  },
  stageIconBadge: {
    alignItems: "center", borderRadius: 14, height: 28,
    justifyContent: "center", width: 28,
  },
  cardLabel: {
    fontFamily: F.uiBold,
    fontSize: 14, lineHeight: 19, letterSpacing: 0.2,
  },
  checkBadge: {
    position: "absolute", top: 10, right: 10,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.terra,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 8, elevation: 4,
  },

  // ── Cycle basics card ─────────────────────────────────────────────────────
  cycleBasicsCard: {
    backgroundColor: "rgba(250,247,249,0.98)",
    borderColor: "rgba(232,225,230,0.70)",
    borderRadius: 24, borderWidth: 1,
    marginBottom: 22, marginTop: -6,
    padding: 18,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, shadowRadius: 18, elevation: 3,
    gap: 18,
  },
  cycleBasicsHeader: {
    alignItems: "center", flexDirection: "row", gap: 8,
  },
  cycleBasicsTitle: {
    color: C.onSurface, fontFamily: F.uiBold, fontSize: 15,
  },

  // Cycle section blocks
  cycleBlock: {
    gap: 10,
  },
  cycleBlockLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 12, color: C.onVariant,
    letterSpacing: 0.2,
  },
  cycleBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cycleBlockIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: "rgba(224,122,95,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cycleBlockCopy: {
    flex: 1,
  },
  cycleBlockSub: {
    fontFamily: F.uiRegular,
    fontSize: 11.5,
    color: C.onVariant,
    lineHeight: 16,
    marginTop: 2,
  },
  flowChoiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  gridError: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(192,85,85,0.28)",
    padding: 8,
  },
  fieldError: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: "#C05555",
    marginBottom: 6,
    marginLeft: 2,
  },
  flowChoiceCard: {
    flexBasis: "48%",
    minHeight: 118,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    backgroundColor: "rgba(255,255,255,0.78)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 6,
  },
  flowDropShell: {
    width: 42,
    height: 52,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(232,225,230,0.84)",
    backgroundColor: "rgba(255,255,255,0.88)",
    overflow: "hidden",
    transform: [{ rotate: "45deg" }],
  },
  flowDropFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  flowDropShine: {
    position: "absolute",
    width: 12,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.58)",
    top: 8,
    left: 9,
  },
  flowChoiceLabel: {
    fontFamily: F.uiBlack,
    fontSize: 13,
    color: C.onSurface,
    marginTop: 4,
  },
  flowChoiceSub: {
    fontFamily: F.uiMedium,
    fontSize: 10.5,
    color: C.onVariant,
  },
  supportChoiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  supportChoiceCard: {
    flexBasis: "48%",
    minHeight: 110,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    backgroundColor: "rgba(255,255,255,0.76)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 8,
  },
  supportCheckBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.terra,
    alignItems: "center",
    justifyContent: "center",
  },
  supportChoiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  supportChoiceLabel: {
    fontFamily: F.uiBlack,
    fontSize: 13,
    color: C.onSurface,
    textAlign: "center",
  },
  supportChoiceSub: {
    fontFamily: F.uiRegular,
    fontSize: 10.5,
    lineHeight: 14,
    color: C.onVariant,
    textAlign: "center",
  },
  guidanceHeaderCard: {
    borderRadius: 18,
    backgroundColor: "rgba(94,155,107,0.10)",
    borderWidth: 1,
    borderColor: "rgba(94,155,107,0.20)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  guidanceIconStack: {
    width: 42,
    height: 42,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(94,155,107,0.14)",
  },
  guidanceHeaderCopy: {
    flex: 1,
  },
  guidanceChoiceStack: {
    gap: 9,
  },
  guidanceChoice: {
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    backgroundColor: "rgba(255,255,255,0.76)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  guidanceChoiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  guidanceChoiceCopy: {
    flex: 1,
  },
  guidanceChoiceLabel: {
    fontFamily: F.uiBlack,
    fontSize: 13,
    color: C.onSurface,
  },
  guidanceChoiceSub: {
    fontFamily: F.uiRegular,
    fontSize: 11,
    lineHeight: 15,
    color: C.onVariant,
    marginTop: 2,
  },
  guidanceRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(107,76,85,0.22)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Date picker container
  datePickerCard: {
    borderRadius: 18,
    backgroundColor: "rgba(248,244,248,0.98)",
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.50)",
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
    overflow: "hidden",
  },
  wheelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    paddingHorizontal: 12,
  },
  wheelColDivider: {
    width: 1,
    height: WH,
    backgroundColor: "rgba(232,225,230,0.50)",
    marginHorizontal: 4,
  },

  // Stepper pair
  stepperPair: {
    flexDirection: "row",
    borderRadius: 18,
    backgroundColor: "rgba(248,244,248,0.98)",
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.50)",
    overflow: "hidden",
  },
  stepperBlock: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
  },
  stepperDivider: {
    width: 1,
    backgroundColor: "rgba(232,225,230,0.60)",
    marginVertical: 14,
  },
  stepperBlockLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 11,
    color: C.onVariant,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepperBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(224,122,95,0.09)",
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.24)",
  },
  stepperBtnDisabled: {
    backgroundColor: "rgba(200,190,200,0.06)",
    borderColor: "rgba(200,190,200,0.20)",
  },
  stepperValueWrap: {
    alignItems: "center",
    minWidth: 42,
  },
  stepperValue: {
    fontFamily: F.luxuryBold,
    fontSize: 38,
    color: C.onSurface,
    lineHeight: 42,
  },
  stepperUnit: {
    fontFamily: F.uiRegular,
    fontSize: 11,
    color: C.onVariant,
    textAlign: "center",
  },

  // Cycle chips
  cycleChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cycleChip: {
    backgroundColor: "rgba(248,244,248,0.96)",
    borderColor: "rgba(232,225,230,0.70)",
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  cycleChipActive: {
    backgroundColor: "rgba(224,122,95,0.14)",
    borderColor: "rgba(224,122,95,0.36)",
  },
  cycleChipText: {
    color: C.onVariant, fontFamily: F.uiBold, fontSize: 11,
  },
  cycleChipTextActive: {
    color: C.terra,
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  ctaShell: {
    borderRadius: 999,
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26, shadowRadius: 22, elevation: 6,
    marginBottom: 16,
  },
  ctaBtn: {
    height: 60, borderRadius: 999,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10,
  },
  ctaText: {
    fontFamily: F.uiBlack, fontSize: 17,
    color: "#FFF", letterSpacing: 0.3,
  },

  // ── Lock hint ─────────────────────────────────────────────────────────────
  lockRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5, marginBottom: 20,
  },
  lockText: {
    fontFamily: F.uiMedium, fontSize: 12, color: C.onVariant,
  },

  // ── Page dots ─────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 7,
  },
  dotActive: {
    width: 26, height: 8, borderRadius: 4,
    backgroundColor: C.terra,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "rgba(224,122,95,0.28)",
  },

  // ── Health conditions ─────────────────────────────────────────────────────
  conditionsSub: {
    fontFamily: F.uiRegular,
    fontSize: 12, color: C.onVariant,
    marginTop: -10, marginBottom: 12,
  },
  optionalBadge: {
    marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(200,190,210,0.14)",
    borderWidth: 1, borderColor: "rgba(200,190,210,0.30)",
  },
  optionalBadgeText: {
    fontFamily: F.uiBold, fontSize: 9,
    color: C.onVariant, letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  conditionsWrap: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 8, marginBottom: 22,
  },
  conditionChip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 13, paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(248,244,248,0.98)",
    borderWidth: 1, borderColor: "rgba(232,225,230,0.70)",
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  conditionChipActive: {
    backgroundColor: "rgba(224,122,95,0.12)",
    borderColor: "rgba(224,122,95,0.36)",
  },
  conditionChipText: {
    fontFamily: F.uiBold, fontSize: 12, color: C.onVariant,
  },
  conditionChipTextActive: {
    color: C.terra,
  },

  // ── Misc ──────────────────────────────────────────────────────────────────
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
