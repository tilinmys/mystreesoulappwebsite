/**
 * Onboarding Screen 3 — Life Stage
 *
 * "Tell us about yourself" — Full Name + 2×2 life-stage card grid.
 * Background: same ambient gradient/blob system as screens 1 & 2.
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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
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

const cycleQuestionGroups = [
  { key: "lastPeriodStart", label: "Last period", options: ["This week", "Last week", "2+ weeks", "Not sure"] },
  { key: "periodLength", label: "Period lasts", options: ["3 days", "5 days", "7 days", "Varies"] },
  { key: "cycleLength", label: "Cycle length", options: ["26 days", "28 days", "30 days", "Irregular"] },
  { key: "usualFlow", label: "Usual flow", options: ["Light", "Medium", "Heavy", "Spotting"] },
] as const;

const cycleSupportNeeds = ["Cramps", "Mood", "Energy", "Sleep"] as const;
const fertilityOptions = ["Yes", "Maybe later", "No"] as const;

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  terra:       "#E07A5F",
  terraLight:  "#F4A27D",
  terraGlow:   "rgba(224,122,95,0.22)",
  onSurface:   "#221B1C",
  onVariant:   "#6B4C55",
  placeholder: "rgba(107,76,85,0.40)",
  surface:     "rgba(255,255,255,0.68)",
  border:      "rgba(255,255,255,0.80)",
  aura1:       "rgba(240,190,200,0.32)",
  aura2:       "rgba(214,174,230,0.22)",
  aura3:       "rgba(198,186,238,0.16)",
};

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
  const name       = useOnboardingStore((s) => s.name);
  const setName    = useOnboardingStore((s) => s.setName);
  const lifeStage  = useOnboardingStore((s) => s.lifeStage);
  const setLifeStage = useOnboardingStore((s) => s.setLifeStage);
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const cycleBasics = useOnboardingStore((s) => s.cycleBasics);
  const setCycleBasics = useOnboardingStore((s) => s.setCycleBasics);

  // Pre-select "teen" on first visit
  const [selected, setSelected] = useState<LifeStage>(lifeStage ?? "teen");
  const [cycleDraft, setCycleDraft] = useState<CycleBasics>(cycleBasics);

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
  const canContinue = hasFullName && selected !== null;

  function handleContinue() {
    setLifeStage(selected);
    if (selected === "cycle_fertility" || selectedGoals.includes("cycle")) {
      setCycleBasics(cycleDraft);
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

  return (
    <View style={s.root}>
      {/* ── Gradient canvas ──────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#FCE0D0", "#F5DCF0", "#E8DFF8", "#FAECD4"]}
        locations={[0, 0.30, 0.64, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Ambient blobs ────────────────────────────────────────────────── */}
      <View pointerEvents="none" style={s.blob1} />
      <View pointerEvents="none" style={s.blob2} />
      <View pointerEvents="none" style={s.blob3} />

      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>

        {/* ── Brand header ─────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View style={s.brandWrap}>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandTagline}>For every stage of you.</Text>
          </View>

          {/* Circular 3/5 progress badge */}
          <View style={s.progressRingOuter}>
            <LinearGradient
              colors={["#E07A5F", "#F4A27D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.progressRing}
            >
              <Text style={s.progressNum}>3</Text>
              <Text style={s.progressSlash}>/</Text>
              <Text style={s.progressDenom}>5</Text>
            </LinearGradient>
          </View>
        </View>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Hero illustration ─────────────────────────────────────── */}
          <View style={s.heroWrap}>
            {/* Outermost aura ring */}
            <Animated.View style={[s.auraRing3, { opacity: auraOp, transform: [{ scale: ringScale }] }]} />
            {/* Middle aura ring */}
            <Animated.View style={[s.auraRing2, { opacity: auraOp }]} />
            {/* Inner aura ring */}
            <Animated.View style={[s.auraRing1, { opacity: auraOp }]} />

            {/* Decorative moon-phase crescents */}
            <View style={s.crescentLeft} />
            <View style={s.crescentRight} />

            {/* Small sparkle dots */}
            <View style={[s.sparkle, { top: 28, left: W * 0.28 }]} />
            <View style={[s.sparkle, { top: 48, right: W * 0.26 }]} />
            <View style={[s.sparkle, { bottom: 30, left: W * 0.32 }]} />

            {/* Bloop orb */}
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
          <Text style={s.heading}>Tell us about{"\n"}yourself</Text>
          <Text style={s.headingSub}>
            So we can personalize your wellness space.
          </Text>

          {/* ── Full Name input ─────────────────────────────────────────── */}
          <View style={s.inputRow}>
            <View style={s.inputIconBox}>
              <Ionicons name="person-outline" size={19} color={C.onVariant} />
            </View>
            <TextInput
              style={s.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor={C.placeholder}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
          {name.trim().length > 0 && !hasFullName && (
            <Text style={s.nameHint}>Please enter your first and last name.</Text>
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
                    {/* Illustration image */}
                    <View style={s.cardImgWrap}>
                      <CachedImage
                        source={stage.image}
                        style={s.cardImg}
                        contentFit="cover"
                      />
                      {/* Bottom fade-into-card-gradient */}
                      <LinearGradient
                        colors={["transparent", stage.gradOverlay + "F5"]}
                        style={s.cardImgFade}
                      />
                    </View>

                    {/* Label */}
                    <View style={s.cardBottom}>
                      <View style={[s.stageIconBadge, { backgroundColor: stage.iconBg }]}>
                        <MaterialCommunityIcons name={stage.icon} size={16} color={stage.labelColor} />
                      </View>
                      <Text style={[s.cardLabel, { color: stage.labelColor }]}>
                        {stage.label}
                      </Text>
                    </View>

                    {/* Selection badge */}
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

          {/* ── Continue CTA ─────────────────────────────────────────────── */}
          {(selected === "cycle_fertility" || selectedGoals.includes("cycle")) && (
            <View style={s.cycleBasicsCard}>
              <View style={s.cycleBasicsHeader}>
                <MaterialCommunityIcons name="calendar-heart" size={18} color={C.terra} />
                <Text style={s.cycleBasicsTitle}>Cycle basics</Text>
              </View>
              <View style={s.cycleQuestionGrid}>
                {cycleQuestionGroups.map((group) => (
                  <View key={group.key} style={s.cycleQuestionBlock}>
                    <Text style={s.cycleQuestionLabel}>{group.label}</Text>
                    <View style={s.cycleChipWrap}>
                      {group.options.map((option) => {
                        const active = cycleDraft[group.key] === option;
                        return (
                          <Pressable
                            key={option}
                            onPress={() => updateCycleDraft(group.key, option)}
                            style={({ pressed }) => [s.cycleChip, active && s.cycleChipActive, pressed && s.pressed]}
                          >
                            <Text style={[s.cycleChipText, active && s.cycleChipTextActive]}>{option}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
                <View style={s.cycleQuestionBlockWide}>
                  <Text style={s.cycleQuestionLabel}>Need support with</Text>
                  <View style={s.cycleChipWrap}>
                    {cycleSupportNeeds.map((option) => {
                      const active = cycleDraft.supportNeeds.includes(option);
                      return (
                        <Pressable
                          key={option}
                          onPress={() => toggleCycleSupport(option)}
                          style={({ pressed }) => [s.cycleChip, active && s.cycleChipActive, pressed && s.pressed]}
                        >
                          <Text style={[s.cycleChipText, active && s.cycleChipTextActive]}>{option}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={s.cycleQuestionBlockWide}>
                  <Text style={s.cycleQuestionLabel}>Fertility-aware guidance?</Text>
                  <View style={s.cycleChipWrap}>
                    {fertilityOptions.map((option) => {
                      const active = cycleDraft.fertilityIntent === option;
                      return (
                        <Pressable
                          key={option}
                          onPress={() => updateCycleDraft("fertilityIntent", option)}
                          style={({ pressed }) => [s.cycleChip, active && s.cycleChipActive, pressed && s.pressed]}
                        >
                          <Text style={[s.cycleChipText, active && s.cycleChipTextActive]}>{option}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          )}

          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            style={({ pressed }) => [
              s.ctaShell,
              pressed && canContinue && s.pressed,
              !canContinue && s.ctaDisabled,
            ]}
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
            {[0, 1, 2, 3, 4].map((i) =>
              i === 2 ? (
                <View key={i} style={s.dotActive} />
              ) : (
                <View key={i} style={s.dot} />
              )
            )}
          </View>

          <View style={{ height: 36 }} />
        </ScrollView>
      </SafeAreaView>
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

  // ── Ambient blobs ─────────────────────────────────────────────────────────
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
    top: 260,
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

  // ── Brand header row ───────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 8,
    paddingBottom: 6,
  },
  brandWrap: {
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
    color: C.onVariant,
    letterSpacing: 0.2,
  },
  progressRingOuter: {
    shadowColor: C.terra,
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
    color: "#FFF",
    lineHeight: 22,
  },
  progressSlash: {
    fontFamily: F.uiLight,
    fontSize: 14,
    color: "rgba(255,255,255,0.70)",
    lineHeight: 22,
  },
  progressDenom: {
    fontFamily: F.uiMedium,
    fontSize: 13,
    color: "rgba(255,255,255,0.80)",
    lineHeight: 22,
  },

  // ── ScrollView ────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 16,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroWrap: {
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  auraRing3: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.18)",
  },
  auraRing2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "rgba(224,122,95,0.26)",
  },
  auraRing1: {
    position: "absolute",
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "rgba(240,190,200,0.22)",
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.30)",
  },
  crescentLeft: {
    position: "absolute",
    left: W * 0.10,
    top: 30,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(214,174,230,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.60)",
  },
  crescentRight: {
    position: "absolute",
    right: W * 0.10,
    bottom: 36,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(198,228,200,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.60)",
  },
  sparkle: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(224,122,95,0.44)",
  },
  bloopContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  bloopAura: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(240,190,200,0.38)",
  },
  bloopImg: {
    width: 110,
    height: 100,
  },

  // ── Heading ───────────────────────────────────────────────────────────────
  heading: {
    fontFamily: F.luxuryBold,
    fontSize: 36,
    lineHeight: 42,
    color: C.onSurface,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.2,
  },
  headingSub: {
    fontFamily: F.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: C.onVariant,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
    paddingHorizontal: 16,
  },

  // ── Name input ────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 58,
    marginBottom: 6,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },
  inputIconBox: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  nameInput: {
    flex: 1,
    fontFamily: F.uiSemiBold,
    fontSize: 16,
    color: C.onSurface,
    paddingLeft: 6,
    height: "100%",
  },
  nameHint: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: "#CA8E4C",
    marginBottom: 10,
    marginLeft: 4,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: F.uiBold,
    fontSize: 16,
    color: C.onSurface,
    letterSpacing: 0.3,
  },

  // ── 2×2 card grid ─────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
    marginBottom: 28,
  },
  cardShell: {
    width: CARD_W,
    borderRadius: 24,
    shadowColor: "#7A4A5C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 4,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.70)",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: C.terra,
    shadowColor: C.terra,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  cardImgWrap: {
    flex: 1,
    overflow: "hidden",
  },
  cardImg: {
    width: "100%",
    height: "100%",
  },
  cardImgFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  cardBottom: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  stageIconBadge: {
    alignItems: "center",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  cardLabel: {
    fontFamily: F.uiBold,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.terra,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  cycleBasicsCard: {
    backgroundColor: C.surface,
    borderColor: C.border,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 22,
    marginTop: -6,
    padding: 14,
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  cycleBasicsHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  cycleBasicsTitle: {
    color: C.onSurface,
    fontFamily: F.uiBold,
    fontSize: 15,
  },
  cycleQuestionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cycleQuestionBlock: {
    width: (W - SIDE_PAD * 2 - 28 - 10) / 2,
  },
  cycleQuestionBlockWide: {
    width: "100%",
  },
  cycleQuestionLabel: {
    color: C.onVariant,
    fontFamily: F.uiSemiBold,
    fontSize: 11,
    marginBottom: 7,
  },
  cycleChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cycleChip: {
    backgroundColor: "rgba(255,255,255,0.58)",
    borderColor: "rgba(255,255,255,0.78)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  cycleChipActive: {
    backgroundColor: "rgba(224,122,95,0.16)",
    borderColor: "rgba(224,122,95,0.36)",
  },
  cycleChipText: {
    color: C.onVariant,
    fontFamily: F.uiBold,
    fontSize: 10.5,
  },
  cycleChipTextActive: {
    color: C.terra,
  },

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
  ctaDisabled: {
    opacity: 0.52,
  },

  // ── Lock hint ─────────────────────────────────────────────────────────────
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 20,
  },
  lockText: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: C.onVariant,
  },

  // ── Page dots ─────────────────────────────────────────────────────────────
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

  // ── Misc ──────────────────────────────────────────────────────────────────
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
