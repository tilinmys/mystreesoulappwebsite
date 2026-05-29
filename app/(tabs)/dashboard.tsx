import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Storage from "../../utils/storage";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  type DimensionValue,
} from "react-native";
// Note: react-native-reanimated 4.x requires a dev-client build and cannot run
// in Expo Go. All entrance animations are handled with React Native's built-in
// Animated API instead.
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Polyline } from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { DailyLogSheet } from "../../components/cycle/DailyLogSheet";
import { FittedText } from "../../components/system/FittedText";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { useOnboardingStore, type LifeStage } from "../../store/onboardingStore";
import { useDailyLogStore } from "../../store/dailyLogStore";
import { darkColors, lightColors, type AppColors } from "../../constants/colors";
import {
  resolveDashboardPersonalization,
  resolveDashboardGridOrder,
  isGridVisible as sharedIsGridVisible,
  getDashboardGridState,
} from "../../lib/gridVisibilityEngine";
import type {
  DashboardGridId,
  DashboardPersonalizationConfig,
} from "../../types/personalization";

const bloopWelcome       = require("../../public/images/bloop-welcome.webp");
const bloopCalm          = require("../../public/images/bloop-calm.webp");
const bloopCycle         = require("../../public/images/bloop-cycle.webp");
const companionJiggy     = require("../../public/images/companion-jiggy-cutout.webp");
const companionManchi    = require("../../public/images/companion-manchi-cutout.webp");
const companionYogi      = require("../../public/images/companion-yogi-cutout.webp");

const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;
const DASHBOARD_HERO_DISMISSED_KEY = "mystree.dashboard.hero.dismissed";

// ── Phase 2 mascot constraint (design, not personalization) ───────────────────
// Maximum one Bloop mascot per dashboard view. Assets kept; decorative
// duplicates suppressed with named flags so the intent is clear in code.
const MASCOT_CYCLE_CARD_VISIBLE = false;
const MASCOT_MH_HUB_VISIBLE     = false;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parsePositiveInt(value: string | number | null | undefined) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function resolveCycleGlance(cycleBasics: {
  lastPeriodStart?: string | null;
  periodLength?: string | number | null;
  cycleLength?: string | number | null;
}) {
  const cycleLength = parsePositiveInt(cycleBasics.cycleLength);
  const periodLength = parsePositiveInt(cycleBasics.periodLength) ?? 5;
  const startTime = cycleBasics.lastPeriodStart
    ? new Date(cycleBasics.lastPeriodStart).getTime()
    : Number.NaN;

  if (!cycleLength || !Number.isFinite(startTime)) {
    return {
      cycleDayDisplay: "--",
      phaseDisplay: "Tracking...",
      nextPeriodDisplay: "--",
      ringFill: 0,
    };
  }

  const elapsedDays = Math.max(1, Math.floor((Date.now() - startTime) / 86400000) + 1);
  const cycleDay = ((elapsedDays - 1) % cycleLength) + 1;
  const nextPeriodDays = Math.max(1, cycleLength - cycleDay + 1);
  const phaseDisplay =
    cycleDay <= periodLength
      ? "Period phase"
      : cycleDay <= Math.ceil(cycleLength * 0.55)
        ? "Rising phase"
        : cycleDay <= Math.ceil(cycleLength * 0.72)
          ? "Ovulation window"
          : "Luteal phase";

  return {
    cycleDayDisplay: String(cycleDay),
    phaseDisplay,
    nextPeriodDisplay: String(nextPeriodDays),
    ringFill: Math.min(1, Math.max(0.06, cycleDay / cycleLength)),
  };
}

// â"€â"€ Static data structures (Dynamic Color Mapping) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function getHealthWay(colors: AppColors) {
  return [
    { label: "Period\ntracker",    icon: "water",               iconColor: colors.periodColor, bg: `${colors.periodColor}22` },
    { label: "Symptoms\ntracker",  icon: "clipboard-pulse-outline", iconColor: colors.primaryCTA,  bg: `${colors.primaryCTA}22` },
    { label: "Wellness",           icon: "flower-outline",      iconColor: colors.warning,     bg: `${colors.warning}22` },
    { label: "Health\ninsights",   icon: "chart-bubble",        iconColor: colors.fertileColor,bg: `${colors.fertileColor}22` },
  ] as const;
}

// â"€â"€ Animated circle helper â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const AnimCircle = Animated.createAnimatedComponent(Circle);

// â"€â"€ Dynamic Styles Cache (Maximum Performance Engine) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
let darkStyles: ReturnType<typeof getStyles> | null = null;
let lightStyles: ReturnType<typeof getStyles> | null = null;
let darkPremiumStyles: ReturnType<typeof getPremiumStyles> | null = null;
let lightPremiumStyles: ReturnType<typeof getPremiumStyles> | null = null;

function useStyles() {
  const { colors, isDark } = useColorMode();
  if (isDark) {
    if (!darkStyles) {
      darkStyles = getStyles(darkColors, true);
      darkPremiumStyles = getPremiumStyles(darkColors, true);
    }
    return { colors, isDark, s: darkStyles!, ps: darkPremiumStyles! };
  } else {
    if (!lightStyles) {
      lightStyles = getStyles(lightColors, false);
      lightPremiumStyles = getPremiumStyles(lightColors, false);
    }
    return { colors, isDark, s: lightStyles!, ps: lightPremiumStyles! };
  }
}

// ── Phase 4: Personalization — see lib/gridVisibilityEngine.ts ───────────────
// Types: types/personalization.ts
// Engine: resolveDashboardPersonalization, isGridVisible, getDashboardGridState
// Priority scoring: lib/onboardingPriorityEngine.ts → resolveDashboardFlags
// Copy: lib/copyPersonalizationEngine.ts → resolveDashboardCopyMap
// Icons: lib/iconPersonalizationEngine.ts → resolveDashboardIconMap
//
// Known goal IDs stored by onboarding:
//   "cycle"         → isCycleFocused  → CycleHero
//   "self_love"     → emotionalState + stress flags → MentalHealthHub (secondary)
//   "nutrition"     → isNutritionFocused → NourishPreview
//   "inner_harmony" → WellnessReset condition
//   "goal_setting"  → not mapped to a specific grid (Phase 5)
//
// ✓ Phase 4 fix applied: fertilityIntent normalization now strips underscores
//   (normalizeFertilityIntent in onboardingPriorityEngine.ts line 15-17).
//   Comparison safely uses "maybe later" (space). No workaround needed in JSX.

// ── Root screen ───────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router   = useRouter();
  const { colors, isDark, s, ps } = useStyles();

  // ── Personalisation data from onboarding ──────────────────────────────────
  const name           = useOnboardingStore((s) => s.name) || "";
  const selectedGoals  = useOnboardingStore((s) => s.selectedGoals) || [];
  const lifeStage      = useOnboardingStore((s) => s.lifeStage) || null;
  const stressLevel    = useOnboardingStore((s) => s.stressLevel) ?? 50;
  const sleepScore     = useOnboardingStore((s) => s.sleepScore) || "okay";
  const emotionalState = useOnboardingStore((s) => s.emotionalState) || "calm";
  const cycleBasics    = useOnboardingStore((s) => s.cycleBasics) || {
    lastPeriodStart: "",
    periodLength: "",
    cycleLength: "",
    usualFlow: "",
    supportNeeds: [],
    fertilityIntent: "",
  };

  // ── Phase 4: Shared personalization engine ─────────────────────────────────
  // TODO: Architectural Migration Step
  // In the next cleanup phase, transition this screen logic to the pure dashboardEngine:
  //
  // import { resolveDashboardState } from "../../lib/dashboardEngine";
  // import { getCycleWheelData } from "../../lib/cycleEngine";
  //
  // const cycleState = getCycleWheelData(cycleBasics);
  // const todayLog = useDailyLogStore.getState().getLogForDate(todayKey());
  // const dashboardState = resolveDashboardState({
  //   onboardingProfile: { name, selectedGoals, lifeStage, stressLevel, sleepScore, emotionalState, cycleBasics },
  //   cycleState,
  //   todayLog,
  // });
  //
  // Source: lib/gridVisibilityEngine.ts → resolveDashboardPersonalization
  // Input shape: types/personalization.ts → DashboardPersonalizationInput
  const dashboardConfig: DashboardPersonalizationConfig = useMemo(
    () =>
      resolveDashboardPersonalization({
        name,
        selectedGoals,
        lifeStage,
        stressLevel,
        sleepScore,
        emotionalState,
        cycleBasics: {
          fertilityIntent: cycleBasics.fertilityIntent,
          supportNeeds:    cycleBasics.supportNeeds,
        },
      }),
    [name, selectedGoals, lifeStage, stressLevel, sleepScore, emotionalState, cycleBasics]
  );

  /**
   * Returns true when the named grid should render.
   * Includes both "visible" (primary) and "secondary" grids — the engine
   * places HealthInsights and MentalHealthHub in secondaryGrids, not
   * visibleGrids, but both states mean "render it."
   */
  function isGridVisible(gridId: DashboardGridId): boolean {
    return (
      sharedIsGridVisible(dashboardConfig, gridId) ||
      getDashboardGridState(dashboardConfig, gridId) === "secondary"
    );
  }

  const [logOpen, setLogOpen]           = useState(false);
  const [nudgeState, setNudgeState] = useState<"loading" | "logged" | "nudge" | "dismissed">("loading");

  const hasLoggedToday = useDailyLogStore((s) => s.hasLoggedToday);

  // â"€â"€ Premium gate sheet â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const [premiumSheetVisible, setPremiumSheetVisible] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<{ title: string; desc: string }>({
    title: "", desc: "",
  });
  const premiumSheetAnim = useRef(new Animated.Value(0)).current;

  function showPremiumSheet(title: string, desc: string) {
    setPremiumFeature({ title, desc });
    setPremiumSheetVisible(true);
    Animated.timing(premiumSheetAnim, {
      toValue: 1, duration: 240,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }

  function hidePremiumSheet(andNavigate?: boolean) {
    Animated.timing(premiumSheetAnim, {
      toValue: 0, duration: 220, useNativeDriver: true,
    }).start(() => {
      setPremiumSheetVisible(false);
      if (andNavigate) router.push("/premium");
    });
  }

  const ringProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(ringProgress, {
      toValue: 1, duration: 260, useNativeDriver: false,
    }).start();
  }, []);

  // ── Phase 6: adaptive section fade-in ────────────────────────────────────
  const adaptiveCardsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(adaptiveCardsOpacity, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  // Ordered list of adaptive grid IDs, sorted by weight from the shared engine
  const adaptiveCards = useMemo(
    () => resolveDashboardGridOrder(dashboardConfig),
    [dashboardConfig]
  );

  useEffect(() => {
    // Check if already logged today first (fast Zustand read), then check dismissed flag.
    if (hasLoggedToday()) {
      setNudgeState("logged");
      return;
    }
    // [WEB-COMPAT] Replaced SecureStore with Storage
    Storage.getItem(`${DASHBOARD_HERO_DISMISSED_KEY}.${todayKey()}`)
      .then((value) => setNudgeState(value === "true" ? "dismissed" : "nudge"))
      .catch(() => setNudgeState("nudge"));
  }, [hasLoggedToday]);

  function dismissNudge() {
    setNudgeState("dismissed");
    // [WEB-COMPAT] Replaced SecureStore with Storage
    Storage.setItem(`${DASHBOARD_HERO_DISMISSED_KEY}.${todayKey()}`, "true").catch(() => undefined);
  }

  function onLogSaved(payload?: any) {
    setLogOpen(false);
    setNudgeState("logged");
    if (payload?.symptoms?.includes("cramps")) {
      setTimeout(() => {
        router.push({
          pathname: "/bloop-chat",
          params: {
            prompt: "I am experiencing cramps today",
            autoSend: "true",
            source: "cycle",
          },
        });
      }, 1000);
    }
  }

  const cycleGlance = useMemo(() => resolveCycleGlance(cycleBasics), [cycleBasics]);

  // Cycle ring uses a placeholder track until persisted cycle data hydrates.
  const CIRC = 2 * Math.PI * 66;
  const ringOffset = ringProgress.interpolate({
    inputRange:  [0, 1],
    outputRange: [CIRC, CIRC * (1 - cycleGlance.ringFill)],
  });
  // TEMP DEBUG — remove after confirming
  console.log('Dashboard render state:', { name, selectedGoals, lifeStage, stressLevel, cycleBasics });

  return (
    <SafeAreaView edges={["top"]} style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        style={s.scrollView}
      >
        {/* 1 ——— Header */}
        <Header onNotifications={() => router.push("/notifications")} />

        {/* 2 ——— Daily log nudge */}
        {nudgeState === "nudge" ? (
          <AnimatedSlideUp>
            <LogNudgeCard onDismiss={dismissNudge} onLog={() => setLogOpen(true)} />
          </AnimatedSlideUp>
        ) : nudgeState === "logged" ? (
          <AnimatedFadeIn>
            <LogSuccessStrip />
          </AnimatedFadeIn>
        ) : nudgeState === "dismissed" ? (
          <AnimatedFadeIn duration={240}>
            <LogPillNudge onLog={() => setLogOpen(true)} />
          </AnimatedFadeIn>
        ) : null}

        {/* 3 ── Today at a glance */}
        <Text style={s.sectionLabel}>Today at a glance</Text>
        <TodayGrid
          ringOffset={ringOffset}
          AnimCircle={AnimCircle}
          CIRC={CIRC}
          cycleDayDisplay={cycleGlance.cycleDayDisplay}
          phaseDisplay={cycleGlance.phaseDisplay}
          nextPeriodDisplay={cycleGlance.nextPeriodDisplay}
          onCalendar={() => router.navigate("/(tabs)/cycle")}
          onLog={() => setLogOpen(true)}
        />

        {/* 4 ── Health way row — shown only when personalization config enables it */}
        {isGridVisible("HealthWayRow") && (
          <>
            <Text style={s.sectionLabel}>Your health, your way</Text>
            <HealthWayRow router={router} />
          </>
        )}

        {/* 5 ── Health insights */}
        {isGridVisible("HealthInsights") && (
          <InsightsSection onSeeMore={() => router.navigate("/(tabs)/insights")} />
        )}

        {/* 6 ── Health overview strip — always visible per Phase 3 spec */}
        {isGridVisible("HealthOverview") && (
          <>
            <Text style={s.sectionLabel}>Your health overview</Text>
            <HealthOverviewStrip
              emotionalState={emotionalState}
              sleepScore={sleepScore}
              stressLevel={stressLevel}
              onPremium={() =>
                showPremiumSheet(
                  "Pattern insights",
                  "Hormone and mood pattern analysis. Unlocks with Premium."
                )
              }
            />
          </>
        )}

        {/* ── Phase 6 Dynamic Secondary Grid Slots ─────────────────────────────────────── */}
        {(() => {
          let renderedCount = 0;
          return dashboardConfig.gridOrder.map((gridId) => {
            if (!isGridVisible(gridId)) return null;

            let cardElement: React.ReactNode = null;
            switch (gridId) {
              case "NourishPreview":
                cardElement = <NourishPreviewCard key="NourishPreview" onPress={() => router.push("/(tabs)/nourish")} />;
                break;
              case "WellnessReset":
                cardElement = <WellnessResetCard key="WellnessReset" onPress={() => router.push("/(tabs)/wellness")} />;
                break;
              case "SleepSupport":
                cardElement = <SleepSupportCard key="SleepSupport" onPress={() => router.push("/(tabs)/wellness")} />;
                break;
              case "FertilityDetail":
                cardElement = <FertilityDetailCard key="FertilityDetail" onPress={() => router.push("/(tabs)/cycle")} />;
                break;
              case "LifeStageCard":
                cardElement = <LifeStageModuleCard key="LifeStageCard" lifeStage={lifeStage} router={router} />;
                break;
              case "MentalHealthHub":
                cardElement = (
                  <MentalHealthHubCard
                    key="MentalHealthHub"
                    onPress={() => router.push("/grounding")}
                    onBloop={() => router.push("/bloop-chat")}
                  />
                );
                break;
            }

            if (cardElement) {
              // High-Stress Density Reduction (limit to top 3 visible cards)
              if (dashboardConfig.flags.isDenseReduced && renderedCount >= 3) {
                return null;
              }
              renderedCount++;
              return cardElement;
            }
            return null;
          });
        })()}
        {/* ── End Dynamic Secondary Grid Slots ────────────────────────────────────────── */}

        {/* 6.5 ── Gentle movement — shown only when personalization config enables it */}
        {isGridVisible("GentleMovementWidget") && (
          <>
            <Text style={s.sectionLabel}>Today's gentle movement</Text>
            <GentleMovementWidget router={router} />
          </>
        )}

        {/* 9 ── Programs for you — hidden in Phase 3, wired via config */}
        {isGridVisible("ProgramsSection") && (
          <>
            <Text style={s.sectionLabel}>Programs for you</Text>
            <ProgramsSection
              lifeStage={lifeStage}
              router={router}
              onPremiumPress={(title, desc) => showPremiumSheet(title, desc)}
            />
          </>
        )}

        {/* 10 ── More to explore — hidden in Phase 3, wired via config */}
        {isGridVisible("ExploredSection") && (
          <>
            <Text style={s.sectionLabel}>More to explore</Text>
            <ExploredSection />
          </>
        )}

        {/* 11 ── Companions — hidden in Phase 3, wired via config */}
        {isGridVisible("CompanionsRow") && (
          <>
            <Text style={s.sectionLabel}>Companions</Text>
            <CompanionsRow
              onPremiumPress={(title, desc) => showPremiumSheet(title, desc)}
              router={router}
            />
          </>
        )}

        <View style={{ height: 12 }} />
      </ScrollView>

      <DailyLogSheet
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        onSave={onLogSaved}
      />

      {premiumSheetVisible && (
        <PremiumSheet
          sheetAnim={premiumSheetAnim}
          title={premiumFeature.title}
          desc={premiumFeature.desc}
          onClose={() => hidePremiumSheet(false)}
          onExplore={() => hidePremiumSheet(true)}
        />
      )}
    </SafeAreaView>
  );
}

// â"€â"€ 1. Header â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function Header({ onNotifications }: { onNotifications: () => void }) {
  const { colors, s } = useStyles();
  const name = useOnboardingStore((state) => state.name);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const display = name.trim() || "there";
  
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <Text style={s.greetingName}>
          {greeting} {display}
        </Text>
        <Text style={s.greetingSub}>Your daily health check-in.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
        onPress={onNotifications}
        style={({ pressed }) => [s.bellWrap, pressed && s.pressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
        <View style={s.bellDot} />
      </Pressable>
    </View>
  );
}

// â"€â"€ Animated entrance helpers (Expo Go-safe, no Reanimated worklets) â"€â"€â"€â"€â"€â"€â"€â"€â"€
function AnimatedSlideUp({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      {children}
    </Animated.View>
  );
}

function AnimatedFadeIn({ children, duration = 240 }: { children: React.ReactNode; duration?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }).start();
  }, [duration]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

// â"€â"€ 2a. Full log nudge card (not logged + not dismissed) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function LogNudgeCard({ onDismiss, onLog }: { onDismiss: () => void; onLog: () => void }) {
  const { colors, isDark, s } = useStyles();
  return (
    <View style={s.nudgeCard}>
      {/* Glowing gradient wash */}
      <LinearGradient
        colors={[
          isDark ? `${colors.primaryCTA}0D` : `${colors.primaryCTA}14`,
          isDark ? `${colors.textMuted}12` : `${colors.textMuted}1E`,
          isDark ? `${colors.warning}08` : `${colors.warning}0F`
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Glow ring accent */}
      <View style={s.nudgeGlowRing} pointerEvents="none" />

      {/* Left text */}
      <View style={s.heroLeft}>
        <Pressable
          accessibilityLabel="Dismiss logging reminder for today"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onDismiss}
          style={({ pressed }) => [s.heroCloseBtn, pressed && s.pressed]}
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
        <Text style={s.nudgeHeadline}>{"Log today"}</Text>
        <Text style={s.heroSub}>A quick check-in keeps patterns clear.</Text>
        <Pressable
          onPress={onLog}
          style={({ pressed }) => [s.nudgeCta, pressed && s.pressed]}
        >
          <LinearGradient
            colors={[colors.primaryCTA, colors.accentDark]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.nudgeCtaGradient}
          >
            <Text style={s.nudgeCtaText}>Log today</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.background} />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Right illustration */}
      <View style={s.heroRight} pointerEvents="none">
        <CachedImage source={bloopWelcome} style={s.heroImage} />
      </View>
    </View>
  );
}

// â"€â"€ 2b. Compact success strip (logged today) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function LogSuccessStrip() {
  const { colors, s } = useStyles();
  return (
    <View style={s.successStrip}>
      <LinearGradient
        colors={[
          colors.surfaceSage,
          `${colors.primaryCTA}10`
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.successIconWrap}>
        <MaterialCommunityIcons name="check-circle-outline" size={22} color={colors.primaryCTA} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.successTitle}>All caught up today</Text>
        <Text style={s.successSub}>Your daily log is saved.</Text>
      </View>
    </View>
  );
}

// â"€â"€ 2c. Minimal pill nudge (dismissed but not logged) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function LogPillNudge({ onLog }: { onLog: () => void }) {
  const { colors, s } = useStyles();
  return (
    <Pressable
      onPress={onLog}
      style={({ pressed }) => [s.pillNudge, pressed && s.pressed]}
      accessibilityLabel="Log your daily check-in"
      accessibilityRole="button"
    >
      <MaterialCommunityIcons name="pencil-plus-outline" size={16} color={colors.primaryCTA} />
      <Text style={s.pillNudgeText}>Add today's check-in</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
    </Pressable>
  );
}

// â"€â"€ 3. Today at a glance â€" premium full-width hero â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function TodayGrid({
  ringOffset,
  AnimCircle,
  CIRC,
  cycleDayDisplay,
  phaseDisplay,
  nextPeriodDisplay,
  onCalendar,
  onLog,
}: {
  ringOffset: Animated.AnimatedInterpolation<number | string>;
  AnimCircle: ReturnType<typeof Animated.createAnimatedComponent<typeof Circle>>;
  CIRC: number;
  cycleDayDisplay: string;
  phaseDisplay: string;
  nextPeriodDisplay: string;
  onCalendar: () => void;
  onLog: () => void;
}) {
  const { colors, s, isDark } = useStyles();
  return (
    <View style={s.cycleCard}>
      {/* Subtle gradient wash */}
      <LinearGradient
        colors={
          isDark
            ? [colors.surface, colors.surface]
            : ["rgba(255,248,245,0.98)", "rgba(255,231,214,0.78)", "rgba(232,241,231,0.72)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative mascot — suppressed by MASCOT_CYCLE_CARD_VISIBLE (Phase 2 design constraint) */}
      {MASCOT_CYCLE_CARD_VISIBLE && <CachedImage source={bloopCycle} style={s.cycleCardArt} contentFit="contain" />}

      {/* Header pill row */}
      <View style={s.cycleCardHeader}>
        <View style={s.cycleIconBubble}>
          <MaterialCommunityIcons name="calendar-month-outline" size={16} color={colors.periodColor} />
        </View>
        <Text style={s.cycleCardLabel}>Cycle day</Text>
      </View>

      {/* â"€â"€ Hero number area â"€â"€ */}
      <View style={s.cycleHeroArea}>
        {/* Soft glow aura behind the number */}
        <View style={s.cycleHeroAura} />
        <Text style={s.cycleDayLabel}>DAY</Text>
        <Text style={s.cycleDayNum}>{cycleDayDisplay ?? "--"}</Text>
        <Text style={s.cyclePhase}>{phaseDisplay ?? "Tracking..."}</Text>
      </View>

      {/* Progress ring */}
      <View style={s.ringWrap}>
        <Svg width={150} height={150} viewBox="0 0 150 150">
          {/* track */}
          <Circle
            cx={75} cy={75} r={66}
            fill="transparent"
            stroke={isDark ? colors.borderSubtle : `${colors.periodColor}22`}
            strokeWidth={11}
          />
          {/* fill */}
          <AnimCircle
            cx={75} cy={75} r={66}
            fill="transparent"
            stroke={colors.periodColor}
            strokeWidth={11}
            strokeDasharray={CIRC}
            strokeDashoffset={ringOffset}
            strokeLinecap="round"
            rotation="-90"
            originX={75}
            originY={75}
          />
        </Svg>
        <View style={s.ringCenter} pointerEvents="none">
          <Text style={s.ringLabel}>Next period</Text>
          <Text style={s.ringDays}><Text style={s.ringDaysNum}>{nextPeriodDisplay ?? "--"} </Text>days</Text>
        </View>
      </View>

      {/* Action row â€" View calendar + Log today */}
      <View style={s.logActionRow}>
        <Pressable
          onPress={onCalendar}
          style={({ pressed }) => [s.logActionBtn, pressed && s.pressed]}
          accessibilityRole="button"
          accessibilityLabel="View cycle calendar"
        >
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={s.logActionText}>View calendar</Text>
        </Pressable>
        <Pressable
          onPress={onLog}
          style={({ pressed }) => [s.logActionBtn, s.logActionBtnPrimary, pressed && s.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Log today"
        >
          <Ionicons name="pencil-outline" size={13} color="#221822" />
          <Text style={s.logActionTextPrimary}>Log today</Text>
        </Pressable>
      </View>
    </View>
  );
}

// â"€â"€ 4. Health way row â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function HealthWayRow({ router }: { router: ReturnType<typeof useRouter> }) {
  const { colors, s } = useStyles();
  const healthWayData = getHealthWay(colors);
  const destinations = [
    "/(tabs)/cycle",
    "/(tabs)/cycle",
    "/(tabs)/wellness",
    "/(tabs)/insights",
  ] as const;

  return (
    <View style={s.healthRow}>
      {healthWayData.map((item, i) => (
        <Pressable
          key={item.label}
          onPress={() => router.navigate(destinations[i])}
          style={({ pressed }) => [s.healthItem, pressed && s.pressed]}
        >
          <View style={[s.healthCircle, { backgroundColor: item.bg }]}>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color={item.iconColor}
            />
          </View>
          <Text style={s.healthLabel}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// â"€â"€ 5. Health insights section â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function InsightsSection({ onSeeMore }: { onSeeMore: () => void }) {
  const { colors, s } = useStyles();
  // simple sparkline points
  const pts = [
    [0, 38], [18, 28], [36, 32], [54, 16], [72, 22], [90, 10], [108, 18]
  ];
  const polyPts = pts.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <View style={s.insightsCard}>
      {/* Section header */}
      <View style={s.insightsHeader}>
        <View style={s.insightsHeaderLeft}>
          <MaterialCommunityIcons name="trending-up" size={18} color={colors.primaryCTA} />
          <Text style={s.insightsTitle}>Health insights</Text>
        </View>
        <Pressable onPress={onSeeMore} hitSlop={10}>
          <Text style={s.seeMore}>See more</Text>
        </Pressable>
      </View>

      {/* Body */}
      <View style={s.insightsBody}>
        <View style={s.insightsTextCol}>
          <Text style={s.insightsText}>
            Rhythm looks steady.
          </Text>
          <Text style={s.insightsCheer}>Patterns are building.</Text>
        </View>
        {/* Sparkline chart */}
        <View style={s.chartWrap}>
          <Svg width={112} height={52} viewBox="0 0 112 52">
            {/* area fill */}
            <Path
              d={`M0,${pts[0][1]} ` +
                pts.map(([x, y]) => `L${x},${y}`).join(" ") +
                ` L${pts[pts.length - 1][0]},52 L0,52 Z`}
              fill={`${colors.primaryCTA}18`}
            />
            {/* line */}
            <Polyline
              points={polyPts}
              fill="none"
              stroke={colors.primaryCTA}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* end dot */}
            <Circle
              cx={pts[pts.length - 1][0]}
              cy={pts[pts.length - 1][1]}
              r={4}
              fill={colors.primaryCTA}
            />
          </Svg>
        </View>
      </View>
    </View>
  );
}


// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€ Premium Gate Sheet â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// Shows before routing to /premium so users know what they're unlocking.
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function PremiumSheet({
  sheetAnim,
  title,
  desc,
  onClose,
  onExplore,
}: {
  sheetAnim: Animated.Value;
  title: string;
  desc: string;
  onClose: () => void;
  onExplore: () => void;
}) {
  const { colors, ps, s } = useStyles();
  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1], outputRange: [300, 0],
  });
  const overlayOp = sheetAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 1],
  });

  return (
    <View style={ps.overlay}>
      <Animated.View style={[StyleSheet.absoluteFill, ps.scrim, { opacity: overlayOp }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[ps.sheet, { transform: [{ translateY }] }]}>
        <View style={ps.grabber} />

        {/* Crown icon */}
        <View style={ps.crownRow}>
          <View style={ps.crownCircle}>
            <MaterialCommunityIcons name="crown-outline" size={28} color={colors.premium} />
          </View>
        </View>

        <Text style={ps.sheetTitle}>{title}</Text>
        <Text style={ps.sheetDesc}>{desc}</Text>

        <View style={ps.benefitRow}>
          {[
            { icon: "check-circle-outline" as const, text: "Personalised to your cycle" },
            { icon: "check-circle-outline" as const, text: "Pattern-aware insights" },
            { icon: "check-circle-outline" as const, text: "Private & encrypted" },
          ].map((b) => (
            <View key={b.text} style={ps.benefitItem}>
              <MaterialCommunityIcons name={b.icon} size={15} color={colors.fertileColor} />
              <Text style={ps.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Explore CTA */}
        <Pressable
          onPress={onExplore}
          style={({ pressed }) => [ps.exploreShell, pressed && s.pressed]}
        >
          <LinearGradient
            colors={[colors.primaryCTA, colors.accentDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={ps.exploreBtn}
          >
            <MaterialCommunityIcons name="crown-outline" size={16} color={colors.background} />
            <Text style={ps.exploreBtnText}>Explore Premium</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onClose} hitSlop={12} style={ps.laterBtn}>
          <Text style={ps.laterText}>Maybe later</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function HealthOverviewStrip({
  emotionalState,
  sleepScore,
  stressLevel,
  onPremium,
}: {
  emotionalState: string;
  sleepScore: string;
  stressLevel: number;
  onPremium: () => void;
}) {
  const { colors, s } = useStyles();
  const formatLabel = (str: string) =>
    str
      .replace(/[_-]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  const stressColor =
    stressLevel < 34 ? colors.primaryCTA : stressLevel < 67 ? colors.warning : colors.periodColor;
  const stressTone = stressLevel < 34 ? "Easy today" : stressLevel < 67 ? "Needs care" : "Go gently";
  const stressFill: DimensionValue = `${Math.max(6, Math.min(stressLevel, 100))}%`;

  return (
    <View style={s.overviewGrid}>
      {/* Stress Score */}
      <View style={s.overviewTile}>
        <View style={s.overviewTileHeader}>
          <View style={[s.overviewIconBubble, { backgroundColor: `${stressColor}18` }]}>
            <MaterialCommunityIcons name="lightning-bolt-outline" size={17} color={stressColor} />
          </View>
          <Text style={s.overviewKicker}>Stress</Text>
        </View>
        <View style={s.overviewValueRow}>
          <Text style={[s.overviewValue, { color: stressColor }]}>{stressLevel}</Text>
          <Text style={s.overviewUnit}>/100</Text>
        </View>
        <View style={s.overviewMeterTrack}>
          <View style={[s.overviewMeterFill, { width: stressFill, backgroundColor: stressColor }]} />
        </View>
        <Text style={s.overviewCaption}>{stressTone}</Text>
      </View>

      {/* Sleep Level */}
      <View style={s.overviewTile}>
        <View style={s.overviewTileHeader}>
          <View style={[s.overviewIconBubble, { backgroundColor: `${colors.textMuted}18` }]}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={17} color={colors.textMuted} />
          </View>
          <Text style={s.overviewKicker}>Sleep</Text>
        </View>
        <FittedText style={[s.overviewValue, { color: colors.textMuted }]} minScale={0.7}>
          {formatLabel(sleepScore)}
        </FittedText>
        <Text style={s.overviewCaption}>Rest rhythm</Text>
      </View>

      {/* Emotional State */}
      <View style={s.overviewTile}>
        <View style={s.overviewTileHeader}>
          <View style={[s.overviewIconBubble, { backgroundColor: `${colors.primaryCTA}18` }]}>
            <MaterialCommunityIcons name="emoticon-outline" size={17} color={colors.primaryCTA} />
          </View>
          <Text style={s.overviewKicker}>Mood</Text>
        </View>
        <FittedText style={[s.overviewValue, { color: colors.primaryCTA }]} minScale={0.7}>
          {formatLabel(emotionalState)}
        </FittedText>
        <Text style={s.overviewCaption}>Emotional state</Text>
      </View>

      {/* Pattern insights locked premium tile */}
      <Pressable
        onPress={onPremium}
        style={({ pressed }) => [
          s.overviewTile,
          s.overviewTileLocked,
          pressed && s.pressed,
        ]}
      >
        <View style={s.overviewTileHeader}>
          <View style={[s.overviewIconBubble, { backgroundColor: `${colors.premium}18` }]}>
            <MaterialCommunityIcons name="crown-outline" size={17} color={colors.premium} />
          </View>
          <Text style={s.overviewKicker}>Patterns</Text>
        </View>
        <Text style={[s.overviewValue, { color: colors.premium }]}>Insights</Text>
        <View style={s.overviewLockRow}>
          <MaterialCommunityIcons name="lock-outline" size={12} color={colors.textMuted} />
          <Text style={s.overviewLockLabel}>Premium</Text>
        </View>
      </Pressable>
    </View>
  );
}

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€ 7. Life Stage Module Card â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

// ─────────────────────────────────────────────────────────────────────────────
// ── 6.5. Gentle Movement Widget ─────────────────────────────────────────────
function GentleMovementWidget({ router }: { router: ReturnType<typeof useRouter> }) {
  const { colors, isDark, s } = useStyles();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/bloop-chat",
          params: {
            prompt: "Luteal Calming Yoga",
            autoSend: "true",
            source: "cycle",
          },
        })
      }
      style={({ pressed }) => [s.gentleMovementCard, pressed && s.pressed]}
    >
      <LinearGradient
        colors={isDark ? ["#1E2C24", "#151522"] : ["#E8F2EC", "#F5F5FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.gentleMovementGradient}
      >
        <View style={s.gmHeader}>
          <View style={s.gmHeaderLeft}>
            <View style={[s.gmPill, { backgroundColor: isDark ? "rgba(129, 178, 154, 0.15)" : "rgba(94, 155, 107, 0.15)" }]}>
              <Text style={[s.gmPillText, { color: isDark ? "#81B29A" : "#5E9B6B" }]}>
                Luteal Phase · Day 18
              </Text>
            </View>
            <Text style={s.gmTitle}>Luteal Calming Yoga</Text>
          </View>
          <View style={[s.gmPlayBtn, { backgroundColor: isDark ? "#81B29A" : "#5E9B6B" }]}>
            <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
          </View>
        </View>

        <Text style={s.gmSubtitle}>
          Cooling somatic sequence to release tension.
        </Text>

        <View style={s.gmDivider} />

        <View style={s.gmFooter}>
          <View style={s.gmPoseRow}>
            <View style={[s.gmPoseBadge, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
              <MaterialCommunityIcons name="spa-outline" size={12} color={isDark ? "#81B29A" : "#5E9B6B"} />
              <Text style={s.gmPoseText}>Bridge Pose</Text>
            </View>
            <View style={[s.gmPoseBadge, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
              <MaterialCommunityIcons name="spa-outline" size={12} color={isDark ? "#81B29A" : "#5E9B6B"} />
              <Text style={s.gmPoseText}>Legs-up-Wall</Text>
            </View>
            <View style={[s.gmPoseBadge, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
              <MaterialCommunityIcons name="spa-outline" size={12} color={isDark ? "#81B29A" : "#5E9B6B"} />
              <Text style={s.gmPoseText}>Forward Fold</Text>
            </View>
          </View>
          
          <Text style={s.gmDuration}>15m · Gentle</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function LifeStageModuleCard({
  lifeStage,
  router,
}: {
  lifeStage: LifeStage;
  router: ReturnType<typeof useRouter>;
}) {
  const { colors, s } = useStyles();
  const fallbackData = {
    title:    "Life Stage",
    subtitle: "Tracking...",
    icon:     "heart-outline" as const,
    color:    colors.textMuted,
    bg:       `${colors.textMuted}22`,
    route:    "/(tabs)/profile" as const,
  };
  const lifeStageData = {
    teen: {
      title:    "Teen Wellness",
      subtitle: "A safe space to understand your body",
      icon:     "school-outline" as const,
      color:    colors.textMuted,
      bg:       `${colors.textMuted}22`,
      route:    "/adolescence" as const,
    },
    cycle_fertility: {
      title:    "Cycle & Fertility",
      subtitle: "Track, understand, and optimise your cycle",
      icon:     "flower-outline" as const,
      color:    colors.periodColor,
      bg:       `${colors.periodColor}22`,
      route:    "/(tabs)/cycle" as const,
    },
    pregnancy: {
      title:    "Pregnancy Care",
      subtitle: "Planned for V2",
      icon:     "baby-carriage" as const,
      color:    colors.primaryCTA,
      bg:       `${colors.primaryCTA}22`,
      route:    "/pregnancy" as const,
    },
    menopause: {
      title:    "Menopause Support",
      subtitle: "Navigate this transition with confidence",
      icon:     "sun-wireless-outline" as const,
      color:    colors.warning,
      bg:       `${colors.warning}22`,
      route:    "/menopause" as const,
    },
  };
  const data = lifeStage ? lifeStageData[lifeStage] : fallbackData;

  return (
    <Pressable
      onPress={() => router.navigate(data.route as any)}
      style={({ pressed }) => [s.lifeStageCard, pressed && s.pressed]}
    >
      <View style={[s.lifeStageIconBubble, { backgroundColor: data.bg }]}>
        <MaterialCommunityIcons name={data.icon} size={26} color={data.color} />
      </View>
      <View style={s.lifeStageTextCol}>
        <Text style={s.lifeStageTitle}>{data.title}</Text>
        <Text style={s.lifeStageSubtitle}>{data.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
    </Pressable>
  );
}

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€ 8. Mental Health Hub â€" support / safety, never gated â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function MentalHealthHubCard({
  onPress,
  onBloop,
}: {
  onPress: () => void;
  onBloop: () => void;
}) {
  const { colors, s } = useStyles();
  return (
    <View style={s.mhCard}>
      {/* Decorative mascot — suppressed by MASCOT_MH_HUB_VISIBLE (Phase 2 design constraint) */}
      {MASCOT_MH_HUB_VISIBLE && <CachedImage source={bloopCalm} style={s.mhArt} contentFit="contain" />}

      {/* Main content row */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [s.mhMainRow, pressed && s.pressed]}
      >
        <View style={s.mhIconBubble}>
          <MaterialCommunityIcons name="brain" size={24} color={colors.textMuted} />
        </View>
        <View style={s.mhTextCol}>
          <Text style={s.mhTitle}>Mental Health Hub</Text>
          <Text style={s.mhSubtitle}>
            Breathing and grounding support
          </Text>
          <View style={s.mhSupportRow}>
            <MaterialCommunityIcons name="meditation" size={11} color={colors.primaryCTA} />
            <Text style={s.mhSupportLabel}>Grounding exercises</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
      </Pressable>

      {/* Quick-access Bloop button */}
      <Pressable
        onPress={onBloop}
        style={({ pressed }) => [s.mhBloopBtn, pressed && s.pressed]}
        accessibilityLabel="Open support chat"
      >
        <MaterialCommunityIcons name="chat-processing-outline" size={14} color={colors.textMuted} />
        <Text style={s.mhBloopText}>Open support</Text>
      </Pressable>
    </View>
  );
}

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€ 9. Programs For You â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

// ─────────────────────────────────────────────────────────────────────────────
// Phase 5 compact cards: NourishPreview / WellnessReset / SleepSupport / FertilityDetail
// ─────────────────────────────────────────────────────────────────────────────

function NourishPreviewCard({ onPress }: { onPress: () => void }) {
  const { colors, s } = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.phase5Card, pressed && s.phase5Pressed]}
    >
      <View style={[s.phase5IconBubble, { backgroundColor: `${colors.primaryCTA}22` }]}>
        <MaterialCommunityIcons name="food-apple-outline" size={26} color={colors.primaryCTA} />
      </View>
      <View style={s.phase5TextCol}>
        <Text style={s.phase5Kicker}>NOURISH</Text>
        <Text style={s.phase5Title}>Nourish Her</Text>
        <Text style={s.phase5Subtitle}>Support your phase</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
    </Pressable>
  );
}

function WellnessResetCard({ onPress }: { onPress: () => void }) {
  const { colors, s } = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.phase5Card, pressed && s.phase5Pressed]}
    >
      <View style={[s.phase5IconBubble, { backgroundColor: `${colors.warning}22` }]}>
        <MaterialCommunityIcons name="meditation" size={26} color={colors.warning} />
      </View>
      <View style={s.phase5TextCol}>
        <Text style={s.phase5Kicker}>RESET</Text>
        <Text style={s.phase5Title}>Wellness Reset</Text>
        <Text style={s.phase5Subtitle}>Start a calm reset</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
    </Pressable>
  );
}

function SleepSupportCard({ onPress }: { onPress: () => void }) {
  const { colors, s } = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.phase5Card, pressed && s.phase5Pressed]}
    >
      <View style={[s.phase5IconBubble, { backgroundColor: `${colors.textMuted}18` }]}>
        <MaterialCommunityIcons name="moon-waning-crescent" size={26} color={colors.textMuted} />
      </View>
      <View style={s.phase5TextCol}>
        <Text style={s.phase5Kicker}>SLEEP</Text>
        <Text style={s.phase5Title}>Sleep Support</Text>
        <Text style={s.phase5Subtitle}>Rest may help tonight</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
    </Pressable>
  );
}

function FertilityDetailCard({ onPress }: { onPress: () => void }) {
  const { colors, s } = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.phase5Card, pressed && s.phase5Pressed]}
    >
      <View style={[s.phase5IconBubble, { backgroundColor: `${colors.periodColor}22` }]}>
        <MaterialCommunityIcons name="calendar-month-outline" size={26} color={colors.periodColor} />
      </View>
      <View style={s.phase5TextCol}>
        <Text style={s.phase5Kicker}>CYCLE</Text>
        <Text style={s.phase5Title}>Fertile Window</Text>
        <Text style={s.phase5Subtitle}>Track fertile days</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
    </Pressable>
  );
}

type ProgramDatum = {
  id:       string;
  title:    string;
  subtitle: string;
  icon:     React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color:    string;
  bg:       string;
};

function ProgramsSection({
  lifeStage,
  router,
  onPremiumPress,
}: {
  lifeStage: LifeStage;
  router: ReturnType<typeof useRouter>;
  onPremiumPress: (title: string, desc: string) => void;
}) {
  const { colors, s } = useStyles();
  const programs: ProgramDatum[] = [
    {
      id:       "mojo",
      title:    "Mystree Mojo 1",
      subtitle: "Build your rhythm and own your cycle",
      icon:     "pulse",
      color:    colors.primaryCTA,
      bg:       `${colors.primaryCTA}22`,
    },
    {
      id:       "reset",
      title:    "Safe campaign",
      subtitle: "Feel supported, informed, and never alone",
      icon:     "restore",
      color:    colors.fertileColor,
      bg:       `${colors.fertileColor}22`,
    },
    ...(lifeStage != null ? [{
      teen:            { id: "teen-prog",  title: "Teen Balance",   subtitle: "Understanding your changing body",    icon: "school-outline" as const,       color: colors.textMuted,   bg: `${colors.textMuted}22` },
      cycle_fertility: { id: "fertile",    title: "Fertile Window", subtitle: "Timing, tracking, and optimising",   icon: "flower-outline" as const,       color: colors.periodColor, bg: `${colors.periodColor}22`  },
      pregnancy:       { id: "birth-prep", title: "Birth Prep",     subtitle: "Week-by-week readiness guide",        icon: "baby-carriage" as const,        color: colors.primaryCTA,   bg: `${colors.primaryCTA}22` },
      menopause:       { id: "transition", title: "Transition Kit", subtitle: "Cooling rituals and hormone support", icon: "sun-wireless-outline" as const, color: colors.warning,      bg: `${colors.warning}22`  },
    }[lifeStage]] : []),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.hScroll}
      contentContainerStyle={s.hScrollContent}
    >
      {programs.map((prog) => (
        <Pressable
          key={prog.id}
          onPress={() =>
            onPremiumPress(
              prog.title,
              `${prog.subtitle}. This program is part of Premium.`
            )
          }
          style={({ pressed }) => [s.programCard, pressed && s.pressed]}
        >
          <View style={[s.programIconBubble, { backgroundColor: prog.bg }]}>
            <MaterialCommunityIcons name={prog.icon} size={22} color={prog.color} />
          </View>
          <Text style={s.programTitle}>{prog.title}</Text>
          <Text style={s.programSubtitle}>{prog.subtitle}</Text>
          <View style={[s.programTag, { backgroundColor: prog.bg }]}>
            <MaterialCommunityIcons name="crown-outline" size={10} color={prog.color} />
            <Text style={[s.programTagText, { color: prog.color }]}>Coming soon</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€ 10. Women Like You Also Explored â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function ExploredSection() {
  const { colors, s } = useStyles();
  const EXPLORED_CARDS = [
    { id: "breathwork", title: "Calming activities",    subtitle: "4-7-8 reset for anxious moments", icon: "weather-windy" as const,          color: colors.fertileColor, bg: `${colors.fertileColor}22` },
    { id: "hormones",   title: "Future Her",            subtitle: "What your cycle is telling you",  icon: "chart-bell-curve" as const,       color: colors.textMuted,    bg: `${colors.textMuted}22` },
    { id: "journaling", title: "Patient Story",         subtitle: "Real journeys, softly told",      icon: "book-open-variant" as const,      color: colors.periodColor,  bg: `${colors.periodColor}22` },
    { id: "sleep",      title: "Affirmations",          subtitle: "Words for calm and clarity",      icon: "moon-waning-crescent" as const,   color: colors.warning,      bg: `${colors.warning}22` },
  ] as const;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.hScroll}
      contentContainerStyle={s.hScrollContent}
    >
      {EXPLORED_CARDS.map((card) => (
        <View key={card.id} style={s.exploredCard}>
          <View style={[s.exploredIconBubble, { backgroundColor: card.bg }]}>
            <MaterialCommunityIcons name={card.icon} size={20} color={card.color} />
          </View>
          <Text style={s.exploredTitle}>{card.title}</Text>
          <Text style={s.exploredSubtitle}>{card.subtitle}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€ 11. Your Companions Row â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

type CompanionDatum = {
  id:     string;
  name:   string;
  role:   string;
  color:  string;
  icon:   React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  locked: boolean;
  image:  ImageSource | number;
};

function CompanionsRow({
  onPremiumPress,
  router,
}: {
  onPremiumPress: (title: string, desc: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { colors, s } = useStyles();
  const companions: CompanionDatum[] = [
    { id: "bloop",  name: "Bloop",  role: "Wellness",   color: colors.primaryCTA, icon: "face-woman-shimmer-outline", locked: false, image: bloopCalm       },
    { id: "jiggy",  name: "Jiggy",  role: "Emotional",  color: colors.textMuted,   icon: "emoticon-outline",           locked: true,  image: companionJiggy  },
    { id: "manchi", name: "Manchi", role: "Psychology", color: colors.premium,    icon: "head-snowflake-outline",     locked: true,  image: companionManchi },
    { id: "yogi",   name: "Yogi",   role: "Movement",   color: colors.fertileColor,       icon: "yoga",                       locked: true,  image: companionYogi   },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.hScroll}
      contentContainerStyle={s.hScrollContent}
    >
      {companions.map((c) => (
        <Pressable
          key={c.id}
          onPress={() =>
            c.locked
              ? onPremiumPress(
                  c.name,
                  `Chat with ${c.name}, your ${c.role.toLowerCase()} companion. Available with Premium.`
                )
              : router.push("/bloop")
          }
          style={({ pressed }) => [s.companionCard, pressed && s.pressed]}
        >
          {/* Avatar */}
          <View style={[s.companionAvatar, { backgroundColor: `${c.color}22` }]}>
            <CachedImage source={c.image} style={s.companionBloopImage} contentFit="contain" />
            {/* Lock badge on locked companions */}
            {c.locked && (
              <View style={s.companionLockBadge}>
                <MaterialCommunityIcons name="lock-outline" size={10} color={colors.background} />
              </View>
            )}
          </View>

          <Text style={s.companionName}>{c.name}</Text>
          <Text style={s.companionRole}>{c.role}</Text>

          {c.locked && (
            <View style={[s.companionPremiumPill, { backgroundColor: `${c.color}22` }]}>
              <Text style={[s.companionPremiumText, { color: c.color }]}>Premium</Text>
            </View>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

// â"€â"€ Styles â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const CARD_RADIUS  = 24;
const SIDE_PAD     = 20;

const getStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: SIDE_PAD, paddingTop: 18, paddingBottom: Platform.OS === "web" ? 110 : 28, gap: 20 },

  // â"€â"€ Header â"€â"€
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  headerLeft: { flex: 1, paddingRight: 12 },
  greetingName: {
    fontFamily: F.luxuryBold,           // Fraunces SemiBold â€" warm serif H1 greeting
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontFamily: F.uiRegular,            // Inter Regular â€" clean readable subtitle
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: 4,
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.12 : 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryCTA,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },

  // â"€â"€ Log nudge cards â"€â"€
  nudgeCard: {
    borderRadius: CARD_RADIUS,
    minHeight: 148,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDark ? 0.20 : 0.06,
    shadowRadius: 28,
    elevation: 5,
    padding: 20,
  },
  nudgeGlowRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${colors.primaryCTA}10`,
    top: -80,
    right: -40,
  },
  heroLeft: { flex: 1, paddingRight: 8 },
  heroCloseBtn: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: -6,
    width: 28,
    zIndex: 3,
  },
  nudgeHeadline: {
    fontFamily: F.handwrittenBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.2,
    marginTop: 4,
  },
  heroSub: {
    fontFamily: F.uiMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 8,
  },
  nudgeCta: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 999,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.30 : 0.15,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  nudgeCtaGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  nudgeCtaText: {
    fontFamily: F.uiExtraBold,
    color: colors.background,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  heroRight: {
    width: 112,
    height: 138,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  heroImage: {
    width: 112,
    height: 130,
  },
  // â"€â"€ Success strip (logged today) â"€â"€
  successStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 20,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.20 : 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  successIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.fertileColor}22`,
  },
  successTitle: {
    fontFamily: F.uiExtraBold,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  successSub: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginTop: 2,
  },
  // â"€â"€ Pill nudge (dismissed) â"€â"€
  pillNudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: colors.surface,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0.20 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pillNudgeText: {
    fontFamily: F.uiBold,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },

  // â"€â"€ Section label â"€â"€
  sectionLabel: {
    fontFamily: F.ui,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    letterSpacing: 1.0,
    textTransform: "uppercase",
    marginBottom: -8,
  },


  // â"€â"€ Full-width premium hero cycle card â"€â"€
  cycleCard: {
    width: W - SIDE_PAD * 2,
    minHeight: 396,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 20,
    overflow: "hidden",
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.44 : 0.12,
    shadowRadius: 32,
    elevation: 5,
  },
  cycleCardArt: {
    position: "absolute",
    right: -20,
    bottom: 36,
    width: 160,
    height: 160,
    opacity: 0.30,
  },
  // Hero day number area
  cycleHeroArea: {
    alignItems: "center",
    minHeight: 138,
    paddingVertical: 14,
    position: "relative",
  },
  cycleHeroAura: {
    position: "absolute",
    width: 246,
    height: 246,
    borderRadius: 123,
    backgroundColor: `${colors.periodColor}1F`,
    top: -50,
  },
  cycleDayLabel: {
    fontFamily: F.ui,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: colors.periodColor,
    marginBottom: 2,
  },
  cycleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cycleIconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${colors.periodColor}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleCardLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  cycleDayNum: {
    fontFamily: F.display,                    // Cormorant Garamond â€" premium display serif
    fontSize: 96,
    lineHeight: 102,
    color: colors.textPrimary,
    textAlign: "center",
    letterSpacing: -3,
    textShadowColor: `${colors.periodColor}55`,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  cyclePhase: {
    fontFamily: F.ui,
    fontSize: 11,
    color: colors.periodColor,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  ringWrap: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    minHeight: 150,
    marginTop: 18,
    marginBottom: 8,
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
  },
  ringLabel: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" ring inner label
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
  },
  ringDays: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" "X days" suffix
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: 2,
  },
  ringDaysNum: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold â€" countdown number
    fontSize: 22,
    color: colors.periodColor,
  },
  viewCalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: `${colors.periodColor}18`,
  },
  viewCalText: {
    fontFamily: F.uiBold,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Dual-action row at the bottom of the cycle hero card
  logActionRow: {
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    marginTop: 14,
  },
  logActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: `${colors.periodColor}18`,
  },
  logActionBtnPrimary: {
    backgroundColor: colors.primaryCTA,
  },
  logActionText: {
    fontFamily: F.uiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  logActionTextPrimary: {
    fontFamily: F.uiBold,
    fontSize: 12,
    color: "#221822",
  },


  // â"€â"€ Health way â"€â"€
  healthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  healthItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
    minHeight: 80,
  },
  healthCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  healthLabel: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" health way label
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 13,
  },

  // â"€â"€ Insights card â"€â"€
  insightsCard: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    minHeight: 80,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 20,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.14 : 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  insightsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightsTitle: {
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold â€" insights card title
    fontSize: 15,
    color: colors.textPrimary,
  },
  seeMore: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" link text
    fontSize: 13,
    color: colors.primaryCTA,
  },
  insightsBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  insightsTextCol: { flex: 1 },
  insightsText: {
    fontFamily: F.bodyMedium,                 // Cormorant Garamond Medium â€" body insight copy
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 23,
  },
  insightsCheer: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" cheerful reinforcement
    fontSize: 12,
    color: colors.primaryCTA,
    marginTop: 4,
  },
  chartWrap: {
    width: 112,
    height: 52,
    borderRadius: 8,
    overflow: "hidden",
  },


  // â"€â"€ Health Overview Strip â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 10,
  },
  overviewTile: {
    width: (W - SIDE_PAD * 2 - 10) / 2,
    minHeight: 124,
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 16,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.10 : 0.05,
    shadowRadius: 10,
    elevation: 2,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  overviewTileLocked: {
    backgroundColor: isDark ? colors.surfaceRaised : colors.surface,
  },
  overviewTileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 30,
  },
  overviewIconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  overviewKicker: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" uppercase kicker
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    flex: 1,
  },
  overviewValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginTop: 8,
  },
  overviewValue: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold â€" metric value
    fontSize: 20,
    lineHeight: 25,
    color: colors.textPrimary,
    width: "100%",
    marginTop: 8,
  },
  overviewUnit: {
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold â€" unit suffix
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  overviewCaption: {
    fontFamily: F.uiMedium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  overviewMeterTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: isDark ? "rgba(246,233,239,0.10)" : "rgba(46,35,48,0.08)",
    overflow: "hidden",
    marginTop: 7,
  },
  overviewMeterFill: {
    height: "100%",
    borderRadius: 999,
  },
  overviewLockRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: isDark ? "rgba(246,233,239,0.08)" : "rgba(46,35,48,0.06)",
  },
  overviewLockLabel: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" lock label
    fontSize: 11,
    color: colors.textMuted,
  },

  // â"€â"€ Life Stage Module Card â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  lifeStageCard: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    minHeight: 80,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.14 : 0.06,
    shadowRadius: 18,
    elevation: 3,
    overflow: "hidden",
  },
  lifeStageIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lifeStageTextCol: {
    flex: 1,
  },
  lifeStageTitle: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" life stage card title
    fontSize: 16,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  lifeStageSubtitle: {
    fontFamily: F.bodyRegular,                // Cormorant Garamond Regular â€" descriptive subtitle
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 20,
  },

  // â"€â"€ Mental Health Hub Card â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  mhCard: {
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    minHeight: 80,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    paddingTop: 4,
    paddingBottom: 14,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.14 : 0.06,
    shadowRadius: 18,
    elevation: 3,
    overflow: "hidden",
  },
  mhArt: {
    position: "absolute",
    right: -10,
    bottom: -16,
    width: 96,
    height: 96,
  },
  // pressable inner row â€" icon + text + chevron
  mhMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  mhIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.textMuted}18`,
    flexShrink: 0,
  },
  mhTextCol: {
    flex: 1,
    gap: 3,
  },
  mhTitle: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" MH hub card title
    fontSize: 16,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  mhSubtitle: {
    fontFamily: F.bodyRegular,                // Cormorant Garamond Regular â€" descriptive text
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 20,
  },
  mhSupportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  mhSupportLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 11,
    color: colors.primaryCTA,
    letterSpacing: 0.2,
  },
  // "Talk to Bloop" pill under the main row
  mhBloopBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surfaceRaised,
  },
  mhBloopText: {
    fontFamily: F.uiBold,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },

  // ── Phase 5 compact cards ─────────────────────────────────────────────────
  phase5Card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: CARD_RADIUS,
    minHeight: 80,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 20,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.14 : 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  phase5IconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0,
  },
  phase5TextCol: {
    flex: 1,
    gap: 2,
  },
  phase5Kicker: {
    fontFamily: F.uiSemiBold,
    fontSize: 10,
    letterSpacing: 1.0,
    color: colors.textMuted,
    textTransform: "uppercase" as const,
  },
  phase5Title: {
    fontFamily: F.uiBold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  phase5Subtitle: {
    fontFamily: F.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 19,
  },
  // Phase 6 press feedback: gentler than global s.pressed (0.96 → 0.98)
  phase5Pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  // Phase 6 adaptive section wrapper — cards are spaced by the parent scroll gap;
  // internal gap keeps cards evenly spaced within the animated container
  adaptiveSection: {
    gap: 20,
  },

  // ── Shared horizontal scroll â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  hScroll: {
    marginHorizontal: -SIDE_PAD,
  },
  hScrollContent: {
    paddingHorizontal: SIDE_PAD,
    gap: 12,
    paddingRight: SIDE_PAD + 4,
  },

  // â"€â"€ Programs For You â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  programCard: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 20,
    gap: 8,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.12 : 0.05,
    shadowRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
  programIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  programTitle: {
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold â€" program card title
    fontSize: 14,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  programSubtitle: {
    fontFamily: F.bodyRegular,                // Cormorant Garamond Regular â€" program description
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 19,
  },
  programTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  programTagText: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold â€" tag label
    fontSize: 10,
    letterSpacing: 0.4,
  },

  // â"€â"€ Women Like You Also Explored â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  exploredCard: {
    width: 152,
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 20,
    gap: 8,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.12 : 0.05,
    shadowRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
  exploredIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  exploredTitle: {
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold â€" explored card title
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  exploredSubtitle: {
    fontFamily: F.bodyRegular,                // Cormorant Garamond Regular â€" card description
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 19,
  },

  // â"€â"€ Your Companions Row â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  companionCard: {
    width: 112,
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    padding: 20,
    alignItems: "center",
    gap: 6,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.12 : 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  companionAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  companionBloopImage: {
    width: 64,
    height: 64,
  },
  companionLockBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  companionName: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" companion name
    fontSize: 13,
    lineHeight: 17,
    color: colors.textPrimary,
    textAlign: "center",
  },
  companionRole: {
    fontFamily: F.uiBold,                     // Nunito Bold â€" role tag
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  companionPremiumPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  companionPremiumText: {
    fontFamily: F.uiBlack,                    // Nunito Black â€" premium badge
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  gentleMovementCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    minHeight: 80,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(246,233,239,0.10)",
    overflow: "hidden",
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  gentleMovementGradient: {
    padding: 20,
  },
  gmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  gmHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  gmPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gmPillText: {
    fontFamily: F.uiBold,
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gmTitle: {
    fontFamily: F.uiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 4,
  },
  gmPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  gmSubtitle: {
    fontFamily: F.uiRegular,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textMuted,
    marginBottom: 14,
  },
  gmDivider: {
    height: 1,
    backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    marginBottom: 14,
  },
  gmFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gmPoseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
    marginRight: 10,
  },
  gmPoseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  gmPoseText: {
    fontFamily: F.uiMedium,
    fontSize: 11,
    color: colors.textPrimary,
  },
  gmDuration: {
    fontFamily: F.uiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  pressed: { transform: [{ scale: 0.96 }] },
});

// â"€â"€ Premium Sheet styles â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const getPremiumStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    justifyContent: "flex-end",
  },
  scrim: {
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingBottom: 36,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 28,
    elevation: 16,
  },
  grabber: {
    width: 42, height: 5, borderRadius: 999,
    alignSelf: "center",
    marginTop: 12, marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  crownRow: {
    alignItems: "center",
    marginBottom: 14,
  },
  crownCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: `${colors.premium}22`,
    alignItems: "center", justifyContent: "center",
  },
  sheetTitle: {
    fontFamily: F.uiBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  sheetDesc: {
    fontFamily: F.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 20,
  },
  benefitRow: {
    gap: 10,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontFamily: F.uiMedium,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  exploreShell: {
    borderRadius: 999,
    shadowColor: colors.primaryCTA,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.30 : 0.15,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 14,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 999,
  },
  exploreBtnText: {
    fontFamily: F.uiBlack,
    color: colors.background,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  laterBtn: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  laterText: {
    fontFamily: F.uiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
});
