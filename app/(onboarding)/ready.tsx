/**
 * Onboarding Screen 6 — Soul Ready
 *
 * Premium Cinematic Space Preparation & Dynamic Synthesis Screen.
 * Designed with a high-end editorial feel, micro-animations, color-shifting auras,
 * dynamic briefing data extraction, and high-performance overlays.
 *
 * Follows the Midnight Plum Design System carefully.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { CachedImage } from "../../components/CachedImage";
import { FittedText } from "../../components/system/FittedText";
import { F } from "../../constants/fonts";
import { getUserProfile } from "../../constants/userProfile";
import { darkColors } from "../../constants/colors";
import { useOnboardingStore } from "../../store/onboardingStore";

const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;
const SIDE_PAD = 20;

// ─── Assets ───────────────────────────────────────────────────────────────────
const imgBloop = require("../../public/images/bloop-welcome.webp");

// Helper to trigger haptics safely (prevents crashing on web/unsupported devices)
const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    void Haptics.impactAsync(style);
  } catch (e) {
    // silent fallback
  }
};

export default function ReadyScreen() {
  const router             = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  
  // ── Retrieve actual briefings chosen in onboarding ─────────────────────────
  const name               = useOnboardingStore((s) => s.name);
  const selectedGoals      = useOnboardingStore((s) => s.selectedGoals);
  const lifeStage          = useOnboardingStore((s) => s.lifeStage);
  const stressLevel        = useOnboardingStore((s) => s.stressLevel);
  const emotionalState     = useOnboardingStore((s) => s.emotionalState);
  
  const profile            = getUserProfile(selectedGoals);

  // ── States for active progress & dynamic status logging ────────────────────
  const [percent, setPercent] = useState(0);
  const [statusLog, setStatusLog] = useState("Aligning biological rhythm...");
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");

  // ── Build dynamic status cards from the user's actual selections ───────────
  const dynamicCards = (() => {
    // 1. Life Stage Card
    let stageLabel = "Cycle Profile";
    let stageIcon = "calendar-heart-outline";
    let stageAccent = darkColors.periodColor; // Rose

    if (lifeStage === "teen") {
      stageLabel = "Adolescence Care";
      stageIcon = "flower-outline";
      stageAccent = darkColors.periodColor;
    } else if (lifeStage === "cycle_fertility") {
      stageLabel = "Cycle Harmony";
      stageIcon = "calendar-heart-outline";
      stageAccent = darkColors.periodColor;
    } else if (lifeStage === "pregnancy") {
      stageLabel = "Pregnancy Space";
      stageIcon = "baby-face-outline";
      stageAccent = darkColors.premium; // Golden Sand
    } else if (lifeStage === "menopause") {
      stageLabel = "Menopause Care";
      stageIcon = "leaf-maple";
      stageAccent = darkColors.warning; // Golden Sand
    }

    // 2. Wellness Priorities
    const wellnessCount = selectedGoals.filter(g => 
      ["better_sleep", "hydration", "gentle_move", "mindful", "energy", "stress_rec"].includes(g)
    ).length || selectedGoals.length || 3;
    const wellnessLabel = `${wellnessCount} Wellness Goals`;

    // 3. Emotional State / Mood Calibrated
    const moodStr = emotionalState ? emotionalState.charAt(0).toUpperCase() + emotionalState.slice(1) : "Calm";
    const emotionalLabel = `${moodStr} Mood (Stress: ${stressLevel}%)`;

    // 4. Soul Space
    const spaceLabel = "Your Soul Space";

    return [
      { id: "stage",     icon: stageIcon, lib: "mci" as const, label: stageLabel, accent: stageAccent },
      { id: "wellness",  icon: "heart-pulse" as const, lib: "mci" as const, label: wellnessLabel, accent: darkColors.primaryCTA }, // Bloom Pink
      { id: "emotional", icon: "heart-outline" as const, lib: "ion" as const, label: emotionalLabel, accent: darkColors.textMuted }, // Lavender Accent
      { id: "space",     icon: "shield-check-outline" as const, lib: "mci" as const, label: spaceLabel, accent: darkColors.fertileColor }, // Sage Green
    ];
  })();

  // ── Core Animation References ──────────────────────────────────────────────
  const progressAnim = useRef(new Animated.Value(0)).current;
  const breathe      = useRef(new Animated.Value(0)).current;
  const floatY       = useRef(new Animated.Value(0)).current;
  
  // Concentric aura ring breathing loops
  const auraOp       = useRef(new Animated.Value(0.24)).current;
  
  // Custom states for each card's visual activation (scale & active layer opacity)
  const cardScale1   = useRef(new Animated.Value(1.0)).current;
  const cardGlow1    = useRef(new Animated.Value(0)).current;
  const cardScale2   = useRef(new Animated.Value(1.0)).current;
  const cardGlow2    = useRef(new Animated.Value(0)).current;
  const cardScale3   = useRef(new Animated.Value(1.0)).current;
  const cardGlow3    = useRef(new Animated.Value(0)).current;
  const cardScale4   = useRef(new Animated.Value(1.0)).current;
  const cardGlow4    = useRef(new Animated.Value(0)).current;

  // GPU-driven auras behind Bloop for color-shifting blend
  const auraRoseOp   = useRef(new Animated.Value(0.12)).current;
  const auraPeachOp  = useRef(new Animated.Value(0)).current;
  const auraPlumOp   = useRef(new Animated.Value(0)).current;
  const auraSageOp   = useRef(new Animated.Value(0)).current;

  // Staggered screen elements entry
  const headerOp     = useRef(new Animated.Value(0)).current;
  const headerY      = useRef(new Animated.Value(-10)).current;
  const centerSceneOp= useRef(new Animated.Value(0)).current;
  const centerSceneScale = useRef(new Animated.Value(0.92)).current;
  const gridOp       = useRef(new Animated.Value(0)).current;
  const gridY        = useRef(new Animated.Value(12)).current;
  const ctaOp        = useRef(new Animated.Value(0)).current;
  const ctaScale     = useRef(new Animated.Value(0.90)).current;

  useEffect(() => {
    // 1. Loop animations for general environment breathing
    const mkLoop = (av: Animated.Value, dur: number, lo: number, hi: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(av, { toValue: hi, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(av, { toValue: lo, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );

    const loops = [
      mkLoop(breathe, 3200, 0, 1),
      mkLoop(floatY,  2800, 0, 1),
      mkLoop(auraOp,  2600, 0.20, 0.52),
    ];
    loops.forEach((l) => l.start());

    // 2. Entrance Stagger Sequence
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(centerSceneOp, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(centerSceneScale, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(gridOp, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(gridY,  { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ])
    ]).start();

    // ── Track status card activation state dynamically ───────────────────────
    let activatedCards = new Set<number>();

    const progressListener = progressAnim.addListener(({ value }) => {
      const pct = Math.floor(value * 100);
      setPercent(pct);

      // Dynamic logs & card pops at designated milestones
      if (value < 0.25) {
        setStatusLog(`Aligning ${lifeStage ? lifeStage.replace("_", " ") : "cycle"} rhythm...`);
        // Activate Card 1
        if (value >= 0.12 && !activatedCards.has(0)) {
          activatedCards.add(0);
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          Animated.parallel([
            Animated.timing(cardGlow1, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(cardScale1, { toValue: 1.08, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
              Animated.timing(cardScale1, { toValue: 1.0, duration: 220, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
            // Morph background colors dynamically via opacities
            Animated.timing(auraRoseOp,  { toValue: 0.16, duration: 400, useNativeDriver: true }),
            Animated.timing(auraPeachOp, { toValue: 0.0, duration: 400, useNativeDriver: true }),
          ]).start();
        }
      } 
      else if (value >= 0.25 && value < 0.50) {
        setStatusLog(`Weaving ${selectedGoals.length || 3} chosen wellness objectives...`);
        // Activate Card 2
        if (value >= 0.38 && !activatedCards.has(1)) {
          activatedCards.add(1);
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          Animated.parallel([
            Animated.timing(cardGlow2, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(cardScale2, { toValue: 1.08, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
              Animated.timing(cardScale2, { toValue: 1.0, duration: 220, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
            Animated.timing(auraRoseOp,  { toValue: 0.0, duration: 400, useNativeDriver: true }),
            Animated.timing(auraPeachOp, { toValue: 0.18, duration: 400, useNativeDriver: true }),
          ]).start();
        }
      } 
      else if (value >= 0.50 && value < 0.75) {
        setStatusLog(`Tuning insights to your ${emotionalState || 'calm'} mood baseline...`);
        // Activate Card 3
        if (value >= 0.62 && !activatedCards.has(2)) {
          activatedCards.add(2);
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          Animated.parallel([
            Animated.timing(cardGlow3, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(cardScale3, { toValue: 1.08, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
              Animated.timing(cardScale3, { toValue: 1.0, duration: 220, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
            Animated.timing(auraPeachOp, { toValue: 0.0, duration: 400, useNativeDriver: true }),
            Animated.timing(auraPlumOp,  { toValue: 0.20, duration: 400, useNativeDriver: true }),
          ]).start();
        }
      } 
      else if (value >= 0.75 && value < 1.0) {
        setStatusLog("Preparing your personalized Soul space...");
        // Activate Card 4
        if (value >= 0.88 && !activatedCards.has(3)) {
          activatedCards.add(3);
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          Animated.parallel([
            Animated.timing(cardGlow4, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(cardScale4, { toValue: 1.08, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
              Animated.timing(cardScale4, { toValue: 1.0, duration: 220, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
            Animated.timing(auraPlumOp, { toValue: 0.0, duration: 400, useNativeDriver: true }),
            Animated.timing(auraSageOp, { toValue: 0.18, duration: 400, useNativeDriver: true }),
          ]).start();
        }
      }
    });

    // ── Main Timeline Execution (4.8 seconds duration) ───────────────────────
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsDone(true);
        setStatusLog("Your Soul space is prepared.");
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

        // Fade in Enter CTA
        Animated.parallel([
          Animated.timing(ctaOp, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(ctaScale, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.15)), useNativeDriver: true }),
        ]).start();

        // Frictionless auto-redirect to dashboard after 1.5s display cushion
        const redirectTimer = setTimeout(() => {
          handleEnter();
        }, 1500);

        return () => clearTimeout(redirectTimer);
      }
    });

    return () => {
      loops.forEach((l) => l.stop());
      progressAnim.removeListener(progressListener);
    };
  }, []);

  // ── Interpolated Hero Scales ───────────────────────────────────────────────
  const bloopScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.08] });
  const bloopFloat = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  // ── Enter main flow logic ──────────────────────────────────────────────────
  function handleEnter() {
    setError("");
    void completeOnboarding()
      .then((ok) => {
        if (ok) router.replace("/(tabs)/dashboard");
        else setError("Could not secure space settings. Press Enter Soul again.");
      })
      .catch(() => setError("Could not secure space settings. Press Enter Soul again."));
  }

  return (
    <View style={s.root}>
      <StatusBar style="light" backgroundColor={darkColors.background} translucent />

      <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>

        {/* ── Editorial Header ────────────────────────────────────────────── */}
        <Animated.View style={[s.headerRow, { opacity: headerOp, transform: [{ translateY: headerY }] }]}>
          <View>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandSub}>Synthesizing your sacred space</Text>
          </View>
          <View style={s.lotusBadge}>
            <MaterialCommunityIcons name="spa" size={19} color={darkColors.primaryCTA} />
          </View>
        </Animated.View>

        {/* ── Dynamic Center Scene (Bloop, Morphing Aura & Percent Track) ──── */}
        <Animated.View style={[s.heroWrap, { opacity: centerSceneOp, transform: [{ scale: centerSceneScale }] }]}>
          
          {/* Overlapping, high-performance GPU-driven morphing color spots */}
          <Animated.View style={[s.auraRingGlow, { backgroundColor: darkColors.periodColor, opacity: auraRoseOp }]} />
          <Animated.View style={[s.auraRingGlow, { backgroundColor: darkColors.primaryCTA, opacity: auraPeachOp }]} />
          <Animated.View style={[s.auraRingGlow, { backgroundColor: darkColors.textMuted, opacity: auraPlumOp }]} />
          <Animated.View style={[s.auraRingGlow, { backgroundColor: darkColors.fertileColor, opacity: auraSageOp }]} />

          {/* Environmental Breathe Concentric Halos */}
          <Animated.View style={[s.auraRing3, { opacity: auraOp }]} />
          <Animated.View style={[s.auraRing2, { opacity: auraOp }]} />
          <Animated.View style={[s.auraRing1, { opacity: auraOp }]} />

          {/* Bloop Hero Character */}
          <Animated.View
            style={[s.bloopContainer, { transform: [{ scale: bloopScale }, { translateY: bloopFloat }] }]}
          >
            <View style={s.bloopGlow} />
            <CachedImage priority="high" source={imgBloop} style={s.bloopImg} contentFit="contain" />
          </Animated.View>

          {/* Large Editorial Percent Metric Display */}
          <View style={s.counterWrapper}>
            <Text style={s.counterText}>
              {percent}<Text style={s.counterPercent}>%</Text>
            </Text>
            <Text style={s.quoteText}>
              {percent === 100 ? profile.readyHeroMessage : statusLog}
            </Text>
          </View>

          {/* Sleek, Modern Minimal Line Progress Track */}
          <View style={s.progressLineContainer}>
            <View style={s.progressLineBg} />
            <Animated.View 
              style={[
                s.progressLineFill, 
                { 
                  transform: [
                    {
                      translateX: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-(W - 120), 0]
                      })
                    }
                  ]
                }
              ]} 
            />
          </View>

        </Animated.View>

        {/* ── Briefing Cards 2x2 Staggered Grid ───────────────────────────── */}
        <Animated.View style={[s.cardsGrid, { opacity: gridOp, transform: [{ translateY: gridY }] }]}>
          {dynamicCards.map((card, i) => {
            // Pick corresponding ref values
            const cardScale = i === 0 ? cardScale1 : i === 1 ? cardScale2 : i === 2 ? cardScale3 : cardScale4;
            const activeOp  = i === 0 ? cardGlow1  : i === 1 ? cardGlow2  : i === 2 ? cardGlow3  : cardGlow4;

            return (
              <Animated.View
                key={card.id}
                style={[
                  s.statusCard,
                  { transform: [{ scale: cardScale }] }
                ]}
              >
                {/* 1. Card Base (Inactive State style) */}
                <View style={s.cardBaseContent}>
                  <View style={[s.statusIconCircle, s.iconCircleInactive]}>
                    {card.lib === "ion" ? (
                      <Ionicons name={card.icon as any} size={18} color={darkColors.textHint} />
                    ) : (
                      <MaterialCommunityIcons name={card.icon as any} size={18} color={darkColors.textHint} />
                    )}
                  </View>
                  <FittedText style={[s.statusLabel, s.labelInactive]} numberOfLines={1}>
                    {card.label}
                  </FittedText>
                  <View style={s.dotInactive} />
                </View>

                {/* 2. Card Active Overlay Layer (High-Performance GPU opacity transition) */}
                <Animated.View 
                  pointerEvents="none" 
                  style={[
                    s.cardActiveOverlay, 
                    { 
                      opacity: activeOp, 
                      borderColor: card.accent,
                      backgroundColor: `${card.accent}0A`,
                      shadowColor: card.accent
                    }
                  ]}
                >
                  <View style={[s.statusIconCircle, { backgroundColor: `${card.accent}1C` }]}>
                    {card.lib === "ion" ? (
                      <Ionicons name={card.icon as any} size={18} color={card.accent} />
                    ) : (
                      <MaterialCommunityIcons name={card.icon as any} size={18} color={card.accent} />
                    )}
                  </View>
                  <FittedText style={[s.statusLabel, { color: darkColors.textPrimary }]} numberOfLines={1}>
                    {card.label}
                  </FittedText>
                  <View style={[s.statusDot, { backgroundColor: card.accent }]} />
                </Animated.View>

              </Animated.View>
            );
          })}
        </Animated.View>

        {/* ── Secure Saves State Feedback ─────────────────────────────────── */}
        {error ? <Text style={s.errorText}>{error}</Text> : null}

        {/* ── Glowing Enter Soul Button (Fades & Springs in when 100% done) ─ */}
        <View style={s.ctaSection}>
          <Animated.View style={{ opacity: ctaOp, transform: [{ scale: ctaScale }] }}>
            <Pressable
              accessibilityLabel="Enter Soul space"
              accessibilityRole="button"
              onPress={handleEnter}
              style={({ pressed }) => [s.ctaShell, pressed && s.pressed]}
            >
              <LinearGradient
                colors={[darkColors.primaryCTA, darkColors.warning]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.ctaBtn}
              >
                <Text style={s.ctaText}>Enter Soul Space</Text>
                <Ionicons name="chevron-forward" size={19} color={darkColors.background} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        {/* ── Subtitle Confirmation Footer Tag ────────────────────────────── */}
        <View style={s.footerConfirmWrapper}>
          <Ionicons name="shield-checkmark" size={13} color={`${darkColors.primaryCTA}AA`} />
          <Text style={s.footerConfirmText}>Private · Dynamic Tuning · Complete</Text>
        </View>

        <View style={{ height: 16 }} />
      </SafeAreaView>
    </View>
  );
}

// ─── High-Fidelity Premium Styles ─────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
  safe: { flex: 1 },

  // Ambient fluid structural spots
  blob1: {
    position: "absolute", top: -140, left: -100,
    width: 380, height: 380, borderRadius: 190,
    backgroundColor: "rgba(232,166,182,0.03)",
  },
  blob2: {
    position: "absolute", bottom: 40, right: -120,
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: "rgba(126,200,160,0.025)",
  },

  // Premium Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandName: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: darkColors.textPrimary,
    letterSpacing: 0.3,
  },
  brandSub: {
    fontFamily: F.bodyRegular,
    fontSize: 12,
    color: darkColors.textMuted,
    marginTop: 1,
  },
  lotusBadge: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: darkColors.surface,
    borderWidth: 1, borderColor: darkColors.border,
  },

  // Highly-visual preparing scene
  heroWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxHeight: 310,
    minHeight: 250,
    position: "relative",
  },
  
  // Concentric color shifting auror circles directly behind Bloop
  auraRingGlow: {
    position: "absolute",
    width: 140, height: 140, borderRadius: 70,
    filter: "blur(30px)", // Web support
    opacity: 0,
  },

  auraRing3: {
    position: "absolute",
    width: 210, height: 210, borderRadius: 105,
    borderWidth: 1,
    borderColor: `${darkColors.primaryCTA}10`,
  },
  auraRing2: {
    position: "absolute",
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1.5,
    borderColor: `${darkColors.primaryCTA}1A`,
  },
  auraRing1: {
    position: "absolute",
    width: 116, height: 116, borderRadius: 58,
    backgroundColor: `${darkColors.primaryCTA}0B`,
    borderWidth: 1,
    borderColor: `${darkColors.primaryCTA}22`,
  },
  bloopContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  bloopGlow: {
    position: "absolute",
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: `${darkColors.primaryCTA}0F`,
  },
  bloopImg: {
    width: 110, height: 102,
  },

  // Metric displays
  counterWrapper: {
    alignItems: "center",
    marginTop: 16,
    gap: 4,
  },
  counterText: {
    fontFamily: F.luxuryBold,
    fontSize: 48,
    lineHeight: 52,
    color: darkColors.textPrimary,
    letterSpacing: -1,
  },
  counterPercent: {
    fontFamily: F.luxuryItalic,
    fontSize: 26,
    color: darkColors.primaryCTA,
  },
  quoteText: {
    fontFamily: F.luxuryItalic,
    fontSize: 13,
    lineHeight: 18,
    color: darkColors.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
    minHeight: 36,
  },

  // Progress Bar Line
  progressLineContainer: {
    width: W - 120,
    height: 3,
    position: "relative",
    marginTop: 12,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressLineBg: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: `${darkColors.textPrimary}14`,
  },
  progressLineFill: {
    position: "absolute",
    top: 0, left: 0, bottom: 0, right: 0,
    backgroundColor: darkColors.primaryCTA,
    borderRadius: 99,
  },

  // 2x2 grid styling
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: SIDE_PAD,
    marginTop: 8,
    marginBottom: 16,
  },
  statusCard: {
    flexBasis: (W - SIDE_PAD * 2 - 10) / 2,
    height: 72,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },

  // Inactive Base Card View
  cardBaseContent: {
    flex: 1,
    backgroundColor: `${darkColors.surface}99`,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkColors.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircleInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  labelInactive: {
    color: darkColors.textHint,
  },
  dotInactive: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginLeft: "auto",
  },

  // Active overlay overlay View
  cardActiveOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },

  statusIconCircle: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },
  statusLabel: {
    fontFamily: F.uiBold,
    fontSize: 12,
    flex: 1,
  },
  statusDot: {
    width: 6, height: 6, borderRadius: 3,
    marginLeft: "auto",
  },

  // Error feedback
  errorText: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: darkColors.periodColor,
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: SIDE_PAD,
  },

  // CTA Enter Action button
  ctaSection: {
    paddingHorizontal: SIDE_PAD,
    height: 60,
    marginBottom: 8,
  },
  ctaShell: {
    borderRadius: 999,
    shadowColor: darkColors.primaryCTA,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22, shadowRadius: 18, elevation: 5,
  },
  ctaBtn: {
    height: 56, borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    fontFamily: F.uiBlack,
    fontSize: 16,
    color: darkColors.background,
    letterSpacing: 0.3,
  },

  // Secure indicators footer
  footerConfirmWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  footerConfirmText: {
    fontFamily: F.uiMedium,
    fontSize: 11,
    color: `${darkColors.textMuted}95`,
    letterSpacing: 0.2,
  },

  pressed: { transform: [{ scale: 0.98 }] },
});
