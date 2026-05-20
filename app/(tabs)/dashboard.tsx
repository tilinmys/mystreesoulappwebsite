import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
// Note: react-native-reanimated 4.x requires a dev-client build and cannot run
// in Expo Go. All entrance animations are handled with React Native's built-in
// Animated API instead.
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { DailyLogSheet } from "../../components/cycle/DailyLogSheet";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { useOnboardingStore, type LifeStage } from "../../store/onboardingStore";
import { useDailyLogStore } from "../../store/dailyLogStore";

const bloopWelcome       = require("../../public/images/bloop-welcome.webp");
const bloopCalm          = require("../../public/images/bloop-calm.webp");
const bloopCycle         = require("../../public/images/bloop-cycle.webp");
const companionJiggy     = require("../../public/images/companion-jiggy-cutout.webp");
const companionManchi    = require("../../public/images/companion-manchi-cutout.webp");
const companionYogi      = require("../../public/images/companion-yogi-cutout.webp");

const { width: W } = Dimensions.get("window");
const DASHBOARD_HERO_DISMISSED_KEY = "mystree.dashboard.hero.dismissed";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:         "#FAF9F6",
  white:      "#FFFFFF",
  text:       "#2B2D42",
  muted:      "#6B708D",
  faint:      "#A89F9B",
  terracotta: "#E07A5F",
  peach:      "#F4A261",
  sage:       "#81B29A",
  lavender:   "#BDB2FF",
  sand:       "#E7D8C9",
  rose:       "#D7A6A1",
};

// ── Static data ───────────────────────────────────────────────────────────────
const logMoods = [
  { label: "Calm",        icon: "emoticon-outline",           color: "#81B29A" },
  { label: "Emotional",   icon: "heart-outline",              color: "#F1A7C4" },
  { label: "Happy",       icon: "emoticon-happy-outline",     color: "#FFD166" },
  { label: "Irritated",   icon: "lightning-bolt-outline",     color: "#E07A5F" },
  { label: "Overwhelmed", icon: "weather-lightning-rainy",    color: "#C17ACB" },
  { label: "Anxious",     icon: "pulse",                      color: "#F1A7C4" },
  { label: "Burned Out",  icon: "battery-alert-variant-outline", color: "#E07A5F" },
  { label: "Low Energy",  icon: "sleep",                      color: "#81B29A" },
] as const;

const flowOptions = [
  { label: "Spotting", fill: 0.25 },
  { label: "Light",    fill: 0.46 },
  { label: "Medium",   fill: 0.70 },
  { label: "Heavy",    fill: 1.00 },
] as const;

const logSymptoms = [
  { label: "Cramps",     icon: "fire" },
  { label: "Bloating",   icon: "stomach" },
  { label: "Headache",   icon: "head-snowflake-outline" },
  { label: "Acne",       icon: "face-woman-shimmer-outline" },
  { label: "Fatigue",    icon: "bed-outline" },
  { label: "Back Pain",  icon: "human-handsdown" },
  { label: "Tenderness", icon: "heart-pulse" },
  { label: "Cravings",   icon: "food-croissant" },
] as const;

const healthWay = [
  { label: "Period\ntracker",    icon: "water",               iconColor: C.terracotta, bg: "rgba(224,122,95,0.13)" },
  { label: "Symptoms\ntracker",  icon: "heart",               iconColor: C.lavender,   bg: "rgba(189,178,255,0.15)" },
  { label: "Wellness",           icon: "flower-outline",      iconColor: C.peach,      bg: "rgba(244,162,97,0.13)" },
  { label: "Health\ninsights",   icon: "chart-bubble",        iconColor: C.sage,       bg: "rgba(129,178,154,0.15)" },
] as const;

// ── Animated circle helper ────────────────────────────────────────────────────
const AnimCircle = Animated.createAnimatedComponent(Circle);

// ── Root screen ───────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router   = useRouter();
  const { isDark } = useColorMode();

  // ── Personalisation data from onboarding ─────────────────────────────────
  const selectedGoals  = useOnboardingStore((s) => s.selectedGoals);
  const lifeStage      = useOnboardingStore((s) => s.lifeStage);
  const stressLevel    = useOnboardingStore((s) => s.stressLevel);
  const sleepScore     = useOnboardingStore((s) => s.sleepScore);
  const emotionalState = useOnboardingStore((s) => s.emotionalState);

  // Goal IDs from adaptive onboarding and personalization.
  const hasMentalHealthGoal = selectedGoals.some((g) =>
    ["self_love", "stress_rec", "mindful", "better_sleep"].includes(g)
  );

  const [logOpen, setLogOpen]           = useState(false);
  const [activeQuickLog, setActiveLog]  = useState("mood");
  // nudge: null = loading, "logged" | "nudge" | "dismissed"
  const [nudgeState, setNudgeState] = useState<"loading" | "logged" | "nudge" | "dismissed">("loading");

  const hasLoggedToday = useDailyLogStore((s) => s.hasLoggedToday);

  // ── Premium gate sheet ────────────────────────────────────────────────────
  const [premiumSheetVisible, setPremiumSheetVisible] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<{ title: string; desc: string }>({
    title: "", desc: "",
  });
  const premiumSheetAnim = useRef(new Animated.Value(0)).current;

  function showPremiumSheet(title: string, desc: string) {
    setPremiumFeature({ title, desc });
    setPremiumSheetVisible(true);
    Animated.timing(premiumSheetAnim, {
      toValue: 1, duration: 340,
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
      toValue: 1, duration: 1400, useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    // Check if already logged today first (fast Zustand read), then check dismissed flag.
    if (hasLoggedToday()) {
      setNudgeState("logged");
      return;
    }
    SecureStore.getItemAsync(`${DASHBOARD_HERO_DISMISSED_KEY}.${todayKey()}`)
      .then((value) => setNudgeState(value === "true" ? "dismissed" : "nudge"))
      .catch(() => setNudgeState("nudge"));
  }, []);

  function dismissNudge() {
    setNudgeState("dismissed");
    SecureStore.setItemAsync(`${DASHBOARD_HERO_DISMISSED_KEY}.${todayKey()}`, "true").catch(() => undefined);
  }

  function onLogSaved() {
    setLogOpen(false);
    setNudgeState("logged");
  }

  // Cycle ring: 73% filled = Day 12 of ~16-day window
  const CIRC = 2 * Math.PI * 66;
  const ringOffset = ringProgress.interpolate({
    inputRange:  [0, 1],
    outputRange: [CIRC, CIRC * 0.27],
  });

  return (
    <SafeAreaView edges={["top"]} style={[s.screen, isDark && s.screenDark]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        style={[s.scrollView, isDark && s.scrollViewDark]}
      >
        {/* 1 ── Header */}
        <Header onNotifications={() => router.push("/notifications")} />

        {/* 2 ── Daily log nudge */}
        {nudgeState === "nudge" ? (
          <AnimatedSlideUp>
            <LogNudgeCard onDismiss={dismissNudge} onLog={() => setLogOpen(true)} />
          </AnimatedSlideUp>
        ) : nudgeState === "logged" ? (
          <AnimatedFadeIn>
            <LogSuccessStrip />
          </AnimatedFadeIn>
        ) : nudgeState === "dismissed" ? (
          <AnimatedFadeIn duration={320}>
            <LogPillNudge onLog={() => setLogOpen(true)} />
          </AnimatedFadeIn>
        ) : null}

        {/* 3 ── Today at a glance */}
        <Text style={s.sectionLabel}>Today at a glance</Text>
        <TodayGrid
          ringOffset={ringOffset}
          AnimCircle={AnimCircle}
          CIRC={CIRC}
          onCalendar={() => router.navigate("/(tabs)/cycle")}
        />

        {/* 4 ── Your health, your way */}
        <Text style={s.sectionLabel}>Your health, your way</Text>
        <HealthWayRow router={router} />

        {/* 5 ── Health insights */}
        <InsightsSection onSeeMore={() => router.navigate("/(tabs)/insights")} />

        {/* 6 ── Health overview strip */}
        <Text style={s.sectionLabel}>Your health overview</Text>
        <HealthOverviewStrip
          emotionalState={emotionalState}
          sleepScore={sleepScore}
          stressLevel={stressLevel}
          onPremium={() =>
            showPremiumSheet(
              "AI Insights",
              "Personalised hormone and mood pattern analysis, powered by Bloop. Unlocks with Soul Premium."
            )
          }
        />

        {/* 7 ── Life stage module — only when a stage is stored */}
        {lifeStage != null && (
          <LifeStageModuleCard lifeStage={lifeStage} router={router} />
        )}

        {/* 8 ── Mental Health Hub — support / safety, never gated */}
        {hasMentalHealthGoal && (
          <MentalHealthHubCard
            onPress={() => router.push("/grounding")}
            onBloop={() => router.push("/bloop-chat")}
          />
        )}

        {/* 9 ── Programs for you */}
        <Text style={s.sectionLabel}>Our Programs</Text>
        <ProgramsSection
          lifeStage={lifeStage}
          router={router}
          onPremiumPress={(title, desc) => showPremiumSheet(title, desc)}
        />

        {/* 10 ── Women like you also explored */}
        <Text style={s.sectionLabel}>Women like you also explored</Text>
        <ExploredSection />

        {/* 11 ── Your companions */}
        <Text style={s.sectionLabel}>Your companions</Text>
        <CompanionsRow
          onPremiumPress={(title, desc) => showPremiumSheet(title, desc)}
          router={router}
        />

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

// ── 1. Header ─────────────────────────────────────────────────────────────────
function Header({ onNotifications }: { onNotifications: () => void }) {
  const name = useOnboardingStore((state) => state.name);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const display = name.trim() || "there";

  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <Text style={s.greetingName}>
          {greeting}, {display}{" "}
          <Text style={s.greetingEmoji}>💕</Text>
        </Text>
        <Text style={s.greetingSub}>Take care of yourself today and every day.</Text>
      </View>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open notifications"
      onPress={onNotifications}
      style={({ pressed }) => [s.bellWrap, pressed && s.pressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={C.text} />
        <View style={s.bellDot} />
      </Pressable>
    </View>
  );
}

// ── Animated entrance helpers (Expo Go-safe, no Reanimated worklets) ─────────
function AnimatedSlideUp({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      {children}
    </Animated.View>
  );
}

function AnimatedFadeIn({ children, duration = 450 }: { children: React.ReactNode; duration?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }).start();
  }, []);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

// ── 2a. Full log nudge card (not logged + not dismissed) ──────────────────────
function LogNudgeCard({ onDismiss, onLog }: { onDismiss: () => void; onLog: () => void }) {
  return (
    <View style={s.nudgeCard}>
      {/* Glowing gradient wash */}
      <LinearGradient
        colors={["rgba(212,92,130,0.14)", "rgba(189,178,255,0.18)", "rgba(244,162,97,0.10)"]}
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
          <Ionicons name="close" size={16} color={C.muted} />
        </Pressable>
        <Text style={s.nudgeHeadline}>{"Log today,\nstay in tune ✨"}</Text>
        <Text style={s.heroSub}>A tiny check-in helps your cycle insights feel more like you.</Text>
        <Pressable
          onPress={onLog}
          style={({ pressed }) => [s.nudgeCta, pressed && s.pressed]}
        >
          <LinearGradient
            colors={["#E07A5F", "#D45C82"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.nudgeCtaGradient}
          >
            <Text style={s.nudgeCtaText}>Log today</Text>
            <Ionicons name="arrow-forward" size={15} color="#FFF" />
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

// ── 2b. Compact success strip (logged today) ──────────────────────────────────
function LogSuccessStrip() {
  return (
    <View style={s.successStrip}>
      <LinearGradient
        colors={["rgba(94,155,107,0.14)", "rgba(129,178,154,0.10)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.successIconWrap}>
        <MaterialCommunityIcons name="check-circle-outline" size={22} color="#5E9B6B" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.successTitle}>You're all caught up today 🌿</Text>
        <Text style={s.successSub}>Your log has been saved. See you tomorrow!</Text>
      </View>
    </View>
  );
}

// ── 2c. Minimal pill nudge (dismissed but not logged) ────────────────────────
function LogPillNudge({ onLog }: { onLog: () => void }) {
  return (
    <Pressable
      onPress={onLog}
      style={({ pressed }) => [s.pillNudge, pressed && s.pressed]}
      accessibilityLabel="Log your daily check-in"
      accessibilityRole="button"
    >
      <MaterialCommunityIcons name="pencil-plus-outline" size={16} color={C.terracotta} />
      <Text style={s.pillNudgeText}>Add today's check-in</Text>
      <Ionicons name="chevron-forward" size={14} color={C.muted} />
    </Pressable>
  );
}

// ── 3. Today at a glance ──────────────────────────────────────────────────────
function TodayGrid({
  ringOffset, AnimCircle, CIRC, onCalendar
}: {
  ringOffset: Animated.AnimatedInterpolation<number | string>;
  AnimCircle: ReturnType<typeof Animated.createAnimatedComponent<typeof Circle>>;
  CIRC: number;
  onCalendar: () => void;
}) {
  return (
    <View style={s.todayGrid}>
      {/* LEFT — tall cycle card */}
      <Pressable
        onPress={onCalendar}
        style={({ pressed }) => [s.cycleCard, pressed && s.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Open cycle tracker"
      >
        <LinearGradient
          colors={["rgba(255,248,245,0.98)", "rgba(255,231,214,0.78)", "rgba(232,241,231,0.72)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <CachedImage source={bloopCycle} style={s.cycleCardArt} contentFit="contain" />
        {/* header row */}
        <View style={s.cycleCardHeader}>
          <View style={s.cycleIconBubble}>
            <MaterialCommunityIcons name="calendar-heart" size={16} color={C.terracotta} />
          </View>
          <Text style={s.cycleCardLabel}>Cycle day</Text>
        </View>

        <Text style={s.cycleDayNum}>Day 12</Text>
        <Text style={s.cyclePhase}>Rising phase</Text>

        {/* Ring */}
        <View style={s.ringWrap}>
          <Svg width={150} height={150} viewBox="0 0 150 150">
            {/* track */}
            <Circle
              cx={75} cy={75} r={66}
              fill="transparent"
              stroke={`rgba(224,122,95,0.15)`}
              strokeWidth={11}
            />
            {/* fill */}
            <AnimCircle
              cx={75} cy={75} r={66}
              fill="transparent"
              stroke={C.terracotta}
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
            <Text style={s.ringDays}><Text style={s.ringDaysNum}>16 </Text>days</Text>
          </View>
        </View>

        {/* View calendar button */}
        <View style={s.viewCalBtn}>
          <Text style={s.viewCalText}>View calendar</Text>
          <Ionicons name="chevron-forward" size={14} color={C.muted} />
        </View>
      </Pressable>

      {/* RIGHT — two stacked cards */}
    </View>
  );
}

// ── 4. Health way row ─────────────────────────────────────────────────────────
function HealthWayRow({ router }: { router: ReturnType<typeof useRouter> }) {
  const destinations = [
    "/(tabs)/cycle",
    "/(tabs)/cycle",
    "/(tabs)/wellness",
    "/(tabs)/insights",
  ] as const;

  return (
    <View style={s.healthRow}>
      {healthWay.map((item, i) => (
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

// ── 5. Health insights section ────────────────────────────────────────────────
function InsightsSection({ onSeeMore }: { onSeeMore: () => void }) {
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
          <MaterialCommunityIcons name="trending-up" size={18} color={C.terracotta} />
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
            Steady rhythm. Soft win.
          </Text>
          <Text style={s.insightsCheer}>
            Bloop says: body wisdom.
          </Text>
        </View>
        {/* Sparkline chart */}
        <View style={s.chartWrap}>
          <Svg width={112} height={52} viewBox="0 0 112 52">
            {/* area fill */}
            <Path
              d={`M0,${pts[0][1]} ` +
                pts.map(([x, y]) => `L${x},${y}`).join(" ") +
                ` L${pts[pts.length - 1][0]},52 L0,52 Z`}
              fill={`rgba(224,122,95,0.10)`}
            />
            {/* line */}
            <Polyline
              points={polyPts}
              fill="none"
              stroke={C.terracotta}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* end dot */}
            <Circle
              cx={pts[pts.length - 1][0]}
              cy={pts[pts.length - 1][1]}
              r={4}
              fill={C.terracotta}
            />
          </Svg>
        </View>
      </View>
    </View>
  );
}

// ── Quick log sheet (preserved) ───────────────────────────────────────────────
function QuickLogSheet({
  activeQuickLog, onClose, onSave
}: {
  activeQuickLog: string;
  onClose: () => void;
  onSave:  () => void;
}) {
  const [mood, setMood]           = useState("Calm");
  const [flow, setFlow]           = useState("Light");
  const [symptoms, setSymptoms]   = useState(new Set(["Bloating"]));
  const [energy, setEnergy]       = useState(4);
  const [stress, setStress]       = useState(1);
  const [note, setNote]           = useState("");

  const toggleSymptom = (label: string) => {
    setSymptoms((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  return (
    <View style={s.overlay}>
      <Pressable style={s.scrim} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.grabber} />

        {/* Sheet header */}
        <View style={s.sheetHeader}>
          <View>
            <Text style={s.sheetTitle}>How is your Mood Today?</Text>
            <Text style={s.sheetSub}>A quick check-in for your body and mind.</Text>
          </View>
          <Pressable onPress={onClose} style={({ pressed }) => [s.closeBtn, pressed && s.pressed]}>
            <Ionicons name="close" size={22} color="rgba(240,210,225,0.72)" />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.sheetContent}
        >
          {/* Mood */}
          <SheetSection title="Mood">
            <View style={s.moodWrap}>
              {logMoods.map((item) => {
                const sel = mood === item.label;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => setMood(item.label)}
                    style={({ pressed }) => [
                      s.moodChip,
                      sel && { borderColor: item.color, backgroundColor: `${item.color}22` },
                      pressed && s.pressed,
                    ]}
                  >
                    <MaterialCommunityIcons name={item.icon} size={18} color={sel ? item.color : "rgba(240,210,225,0.52)"} />
                    <Text style={[s.moodChipText, sel && { color: "#FFF0F5" }]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </SheetSection>

          {/* Flow */}
          <SheetSection title="How's your flow?">
            <View style={s.flowRow}>
              {flowOptions.map((item) => {
                const sel = flow === item.label;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => setFlow(item.label)}
                    style={({ pressed }) => [s.flowCard, sel && s.flowCardSel, pressed && s.pressed]}
                  >
                    <View style={s.dropShape}>
                      <View style={[s.dropFill, { height: `${item.fill * 100}%` as any }]} />
                      <MaterialCommunityIcons name="water" size={22} color={sel ? "#FFF0F5" : "rgba(240,210,225,0.44)"} />
                    </View>
                    <Text style={[s.flowLabel, sel && { color: "#FFF0F5" }]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </SheetSection>

          {/* Symptoms */}
          <SheetSection title="Physical symptoms">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.symptomRow}>
              {logSymptoms.map((item) => {
                const sel = symptoms.has(item.label);
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => toggleSymptom(item.label)}
                    style={({ pressed }) => [s.symptomCard, sel && s.symptomCardSel, pressed && s.pressed]}
                  >
                    <MaterialCommunityIcons name={item.icon as any} size={22} color={sel ? C.peach : "rgba(240,210,225,0.44)"} />
                    <Text style={[s.symptomLabel, sel && { color: "#FFF0F5" }]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </SheetSection>

          {/* Energy & stress */}
          <SheetSection title="Energy & stress">
            <SheetSlider label="Energy Level" accent={C.peach}  value={energy} max={5} onChange={() => setEnergy((v) => v >= 5 ? 1 : v + 1)} maxLabel="High" />
            <SheetSlider label="Stress"       accent={C.sage}   value={stress} max={5} onChange={() => setStress((v) => v >= 5 ? 1 : v + 1)} maxLabel={stress <= 2 ? "Low" : "Elevated"} />
          </SheetSection>

          {/* Notes */}
          <SheetSection title="Optional notes">
            <TextInput
              multiline
              value={note}
              onChangeText={setNote}
              placeholder="Anything you'd like to remember today?"
              placeholderTextColor="rgba(240,210,225,0.35)"
              style={s.noteInput}
              textAlignVertical="top"
            />
          </SheetSection>
        </ScrollView>

        {/* Save */}
        <View style={s.sheetFooter}>
          <Pressable onPress={onSave} style={({ pressed }) => [s.saveShell, pressed && s.pressed]}>
            <LinearGradient
              colors={[C.terracotta, C.peach]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.saveBtn}
            >
              <Text style={s.saveBtnText}>Save Today's Log</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={s.skipText}>Skip Notes</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SheetSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={s.sheetSection}>
      <Text style={s.sheetSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SheetSlider({
  accent, label, maxLabel, onChange, value, max
}: {
  accent: string; label: string; maxLabel: string;
  onChange: () => void; value: number; max: number;
}) {
  return (
    <Pressable onPress={onChange} style={({ pressed }) => [s.sliderBlock, pressed && s.pressed]}>
      <View style={s.sliderRow}>
        <Text style={s.sliderLabel}>{label}</Text>
        <Text style={[s.sliderVal, { color: accent }]}>{maxLabel}</Text>
      </View>
      <View style={s.sliderTrack}>
        <LinearGradient
          colors={[`${accent}88`, accent]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[s.sliderFill, { width: `${(value / max) * 100}%` }]}
        />
        <View style={[s.sliderThumb, { left: `${Math.min(88, (value / max) * 100)}%` as any, borderColor: accent }]} />
      </View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Premium Gate Sheet ───────────────────────────────────────────────────────
// Shows before routing to /premium so users know what they're unlocking.
// ─────────────────────────────────────────────────────────────────────────────

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
            <MaterialCommunityIcons name="crown-outline" size={28} color={C.terracotta} />
          </View>
        </View>

        <Text style={ps.sheetTitle}>{title}</Text>
        <Text style={ps.sheetDesc}>{desc}</Text>

        <View style={ps.benefitRow}>
          {[
            { icon: "check-circle-outline" as const, text: "Personalised to your cycle" },
            { icon: "check-circle-outline" as const, text: "Powered by Bloop AI" },
            { icon: "check-circle-outline" as const, text: "Private & encrypted" },
          ].map((b) => (
            <View key={b.text} style={ps.benefitItem}>
              <MaterialCommunityIcons name={b.icon} size={15} color={C.sage} />
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
            colors={[C.terracotta, C.peach]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={ps.exploreBtn}
          >
            <MaterialCommunityIcons name="crown-outline" size={16} color="#FFF" />
            <Text style={ps.exploreBtnText}>Explore Soul Premium</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onClose} hitSlop={12} style={ps.laterBtn}>
          <Text style={ps.laterText}>Maybe later</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 6. Health Overview Strip ─────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

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
  const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  const stressColor =
    stressLevel < 34 ? C.sage : stressLevel < 67 ? C.peach : C.terracotta;

  return (
    <View style={s.overviewGrid}>
      {/* Stress Score */}
      <View style={[s.overviewTile, { borderColor: `${stressColor}44` }]}>
        <View style={[s.overviewIconBubble, { backgroundColor: `${stressColor}18` }]}>
          <MaterialCommunityIcons name="lightning-bolt-outline" size={17} color={stressColor} />
        </View>
        <Text style={s.overviewKicker}>Stress Score</Text>
        <View style={s.overviewValueRow}>
          <Text style={[s.overviewValue, { color: stressColor }]}>{stressLevel}</Text>
          <Text style={s.overviewUnit}>/100</Text>
        </View>
      </View>

      {/* Sleep Level */}
      <View style={[s.overviewTile, { borderColor: `${C.lavender}44` }]}>
        <View style={[s.overviewIconBubble, { backgroundColor: `${C.lavender}18` }]}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={17} color={C.lavender} />
        </View>
        <Text style={s.overviewKicker}>Sleep Level</Text>
        <Text style={[s.overviewValue, { color: C.lavender }]}>{cap(sleepScore)}</Text>
      </View>

      {/* Emotional State */}
      <View style={[s.overviewTile, { borderColor: `${C.sage}44` }]}>
        <View style={[s.overviewIconBubble, { backgroundColor: `${C.sage}18` }]}>
          <MaterialCommunityIcons name="heart-outline" size={17} color={C.sage} />
        </View>
        <Text style={s.overviewKicker}>Emotional State</Text>
        <Text style={[s.overviewValue, { color: C.sage }]}>{cap(emotionalState)}</Text>
      </View>

      {/* AI Insights — locked premium tile */}
      <Pressable
        onPress={onPremium}
        style={({ pressed }) => [
          s.overviewTile,
          s.overviewTileLocked,
          pressed && s.pressed,
        ]}
      >
        <View style={[s.overviewIconBubble, { backgroundColor: "rgba(224,122,95,0.12)" }]}>
          <MaterialCommunityIcons name="crown-outline" size={17} color={C.terracotta} />
        </View>
        <Text style={s.overviewKicker}>AI Insights</Text>
        <View style={s.overviewLockRow}>
          <MaterialCommunityIcons name="lock-outline" size={12} color={C.muted} />
          <Text style={s.overviewLockLabel}>Premium</Text>
        </View>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 7. Life Stage Module Card ────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

type LifeStageDatum = {
  title:    string;
  subtitle: string;
  icon:     React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color:    string;
  bg:       string;
  route:    string;
};

const LIFE_STAGE_DATA: Record<NonNullable<LifeStage>, LifeStageDatum> = {
  teen: {
    title:    "Teen Wellness",
    subtitle: "A safe space to understand your body",
    icon:     "school-outline",
    color:    C.lavender,
    bg:       "rgba(189,178,255,0.12)",
    route:    "/adolescence",
  },
  cycle_fertility: {
    title:    "Cycle & Fertility",
    subtitle: "Track, understand, and optimise your cycle",
    icon:     "flower-outline",
    color:    C.terracotta,
    bg:       "rgba(224,122,95,0.10)",
    route:    "/(tabs)/cycle",
  },
  pregnancy: {
    title:    "Pregnancy Care",
    subtitle: "Planned for V2",
    icon:     "baby-carriage",
    color:    C.rose,
    bg:       "rgba(215,166,161,0.13)",
    route:    "/pregnancy",
  },
  menopause: {
    title:    "Menopause Support",
    subtitle: "Navigate this transition with confidence",
    icon:     "sun-wireless-outline",
    color:    C.peach,
    bg:       "rgba(244,162,97,0.12)",
    route:    "/menopause",
  },
};

function LifeStageModuleCard({
  lifeStage,
  router,
}: {
  lifeStage: NonNullable<LifeStage>;
  router: ReturnType<typeof useRouter>;
}) {
  const data = LIFE_STAGE_DATA[lifeStage];
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
      <Ionicons name="chevron-forward" size={18} color={C.faint} />
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 8. Mental Health Hub — locked premium card ───────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function MentalHealthHubCard({
  onPress,
  onBloop,
}: {
  onPress: () => void;
  onBloop: () => void;
}) {
  return (
    <View style={s.mhCard}>
      <CachedImage source={bloopCalm} style={s.mhArt} contentFit="contain" />

      {/* Main content row */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [s.mhMainRow, pressed && s.pressed]}
      >
        <View style={s.mhIconBubble}>
          <MaterialCommunityIcons name="brain" size={24} color={C.lavender} />
        </View>
        <View style={s.mhTextCol}>
          <Text style={s.mhTitle}>Mental Health Hub</Text>
          <Text style={s.mhSubtitle}>
            Breathing, grounding, and Bloop support
          </Text>
          <View style={s.mhSupportRow}>
            <MaterialCommunityIcons name="leaf" size={11} color={C.sage} />
            <Text style={s.mhSupportLabel}>Grounding exercises</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.faint} />
      </Pressable>

      {/* Quick-access Bloop button */}
      <Pressable
        onPress={onBloop}
        style={({ pressed }) => [s.mhBloopBtn, pressed && s.pressed]}
        accessibilityLabel="Talk to Bloop"
      >
        <MaterialCommunityIcons name="chat-processing-outline" size={14} color={C.lavender} />
        <Text style={s.mhBloopText}>Talk to Bloop</Text>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 9. Programs For You ──────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

type ProgramDatum = {
  id:       string;
  title:    string;
  subtitle: string;
  icon:     React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color:    string;
  bg:       string;
};

const BASE_PROGRAMS: ProgramDatum[] = [
  {
    id:       "mojo",
    title:    "Mystree Mojo 1",
    subtitle: "Build your rhythm and own your cycle",
    icon:     "star-four-points-outline",
    color:    C.terracotta,
    bg:       "rgba(224,122,95,0.10)",
  },
  {
    id:       "reset",
    title:    "Safe campaign",
    subtitle: "Feel supported, informed, and never alone",
    icon:     "restore",
    color:    C.sage,
    bg:       "rgba(129,178,154,0.12)",
  },
];

const LIFE_STAGE_PROGRAMS: Record<NonNullable<LifeStage>, ProgramDatum> = {
  teen:            { id: "teen-prog",  title: "Teen Balance",   subtitle: "Understanding your changing body",    icon: "school-outline",       color: C.lavender,   bg: "rgba(189,178,255,0.12)" },
  cycle_fertility: { id: "fertile",    title: "Fertile Window", subtitle: "Timing, tracking, and optimising",   icon: "flower-outline",       color: C.terracotta, bg: "rgba(224,122,95,0.10)"  },
  pregnancy:       { id: "birth-prep", title: "Birth Prep",     subtitle: "Week-by-week readiness guide",        icon: "baby-carriage",        color: C.rose,       bg: "rgba(215,166,161,0.13)" },
  menopause:       { id: "transition", title: "Transition Kit", subtitle: "Cooling rituals and hormone support", icon: "sun-wireless-outline", color: C.peach,      bg: "rgba(244,162,97,0.12)"  },
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
  const programs: ProgramDatum[] = [
    ...BASE_PROGRAMS,
    ...(lifeStage != null ? [LIFE_STAGE_PROGRAMS[lifeStage]] : []),
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
              `${prog.subtitle}. This program is part of Soul Premium.`
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

// ─────────────────────────────────────────────────────────────────────────────
// ── 10. Women Like You Also Explored ────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const EXPLORED_CARDS = [
  { id: "breathwork", title: "Calming activities",    subtitle: "4-7-8 reset for anxious moments", icon: "weather-windy",          color: C.sage       },
  { id: "hormones",   title: "Future Her",            subtitle: "What your cycle is telling you",  icon: "chart-bell-curve",       color: C.lavender   },
  { id: "journaling", title: "Patient Story",         subtitle: "Real journeys, softly told",      icon: "book-heart-outline",     color: C.terracotta },
  { id: "sleep",      title: "Affirmations",          subtitle: "Words for calm and clarity",      icon: "moon-waning-crescent",   color: C.peach      },
] as const;

function ExploredSection() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.hScroll}
      contentContainerStyle={s.hScrollContent}
    >
      {EXPLORED_CARDS.map((card) => (
        <View key={card.id} style={s.exploredCard}>
          <View style={[s.exploredIconBubble, { backgroundColor: `${card.color}18` }]}>
            <MaterialCommunityIcons name={card.icon} size={20} color={card.color} />
          </View>
          <Text style={s.exploredTitle}>{card.title}</Text>
          <Text style={s.exploredSubtitle}>{card.subtitle}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 11. Your Companions Row ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

type CompanionDatum = {
  id:     string;
  name:   string;
  role:   string;
  color:  string;
  icon:   React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  locked: boolean;
  image:  ImageSource | number;
};

const COMPANIONS: CompanionDatum[] = [
  { id: "bloop",  name: "Bloop",  role: "Wellness",   color: C.terracotta, icon: "face-woman-shimmer-outline", locked: false, image: bloopCalm       },
  { id: "jiggy",  name: "Jiggy",  role: "Emotional",  color: C.lavender,   icon: "heart-pulse",                locked: true,  image: companionJiggy  },
  { id: "manchi", name: "Manchi", role: "Psychology", color: "#8B5CF6",    icon: "head-snowflake-outline",     locked: true,  image: companionManchi },
  { id: "yogi",   name: "Yogi",   role: "Movement",   color: C.sage,       icon: "yoga",                       locked: true,  image: companionYogi   },
];

function CompanionsRow({
  onPremiumPress,
  router,
}: {
  onPremiumPress: (title: string, desc: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.hScroll}
      contentContainerStyle={s.hScrollContent}
    >
      {COMPANIONS.map((c) => (
        <Pressable
          key={c.id}
          onPress={() =>
            c.locked
              ? onPremiumPress(
                  c.name,
                  `Chat with ${c.name}, your ${c.role.toLowerCase()} companion. Available with Soul Premium.`
                )
              : router.push("/bloop")
          }
          style={({ pressed }) => [s.companionCard, pressed && s.pressed]}
        >
          {/* Avatar */}
          <View style={[s.companionAvatar, { backgroundColor: `${c.color}18` }]}>
            <CachedImage source={c.image} style={s.companionBloopImage} contentFit="contain" />
            {/* Lock badge on locked companions */}
            {c.locked && (
              <View style={s.companionLockBadge}>
                <MaterialCommunityIcons name="lock-outline" size={10} color="#FFF" />
              </View>
            )}
          </View>

          <Text style={s.companionName}>{c.name}</Text>
          <Text style={s.companionRole}>{c.role}</Text>

          {c.locked && (
            <View style={[s.companionPremiumPill, { backgroundColor: `${c.color}18` }]}>
              <Text style={[s.companionPremiumText, { color: c.color }]}>Premium</Text>
            </View>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_RADIUS  = 24;
const SIDE_PAD     = 20;
const COL_GAP      = 12;
const LEFT_COL     = (W - SIDE_PAD * 2 - COL_GAP) * 0.52;
const RIGHT_COL    = (W - SIDE_PAD * 2 - COL_GAP) * 0.48;
const RIGHT_CARD_H = (LEFT_COL - COL_GAP) / 2;   // each right card = half of left

const SHEET_BG  = "rgba(30,14,22,0.96)";
const SHEET_CARD = "rgba(255,220,240,0.07)";

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  screenDark: { backgroundColor: "#111827" },
  scrollView: { flex: 1, backgroundColor: "transparent" },
  scrollViewDark: { backgroundColor: "#111827" },
  scroll: { paddingHorizontal: SIDE_PAD, paddingTop: 18, paddingBottom: 28, gap: 20, flexGrow: 1 },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  headerLeft: { flex: 1, paddingRight: 12 },
  greetingName: {
    fontFamily: F.luxuryBold,           // Fraunces SemiBold — warm serif H1 greeting
    fontSize: 30,
    lineHeight: 36,
    color: "#1C1528",
    letterSpacing: -0.3,
  },
  greetingEmoji: { fontSize: 22 },
  greetingSub: {
    fontFamily: F.uiRegular,            // Inter Regular — clean readable subtitle
    fontSize: 13,
    lineHeight: 20,
    color: C.muted,
    marginTop: 4,
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.white,
    shadowColor: C.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
    backgroundColor: C.terracotta,
    borderWidth: 1.5,
    borderColor: C.white,
  },

  // ── Log nudge cards ──
  nudgeCard: {
    borderRadius: CARD_RADIUS + 4,
    minHeight: 148,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,253,252,0.96)",
    borderWidth: 1,
    borderColor: "rgba(212,92,130,0.18)",
    shadowColor: "#D45C82",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 5,
    paddingLeft: 20,
    paddingVertical: 18,
  },
  nudgeGlowRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(212,92,130,0.06)",
    top: -80,
    right: -40,
  },
  heroLeft: { flex: 1, paddingRight: 8 },
  heroCloseBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
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
    fontSize: 21,
    lineHeight: 26,
    color: C.text,
    letterSpacing: 0.2,
    marginTop: 4,
  },
  heroSub: {
    fontFamily: F.uiMedium,
    fontSize: 12.5,
    lineHeight: 18,
    color: C.muted,
    marginTop: 8,
  },
  nudgeCta: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 999,
    shadowColor: "#D45C82",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
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
    color: "#FFFFFF",
    fontSize: 13,
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
  // ── Success strip (logged today) ──
  successStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(94,155,107,0.22)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#5E9B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 2,
  },
  successIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(94,155,107,0.12)",
  },
  successTitle: {
    fontFamily: F.uiExtraBold,
    fontSize: 13.5,
    lineHeight: 18,
    color: C.text,
  },
  successSub: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    lineHeight: 17,
    color: C.muted,
    marginTop: 2,
  },
  // ── Pill nudge (dismissed) ──
  pillNudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "rgba(255,255,255,0.90)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.22)",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  pillNudgeText: {
    fontFamily: F.uiBold,
    fontSize: 13,
    color: C.text,
    flex: 1,
  },

  // ── Section label — Montserrat SemiBold, ALL-CAPS, wide tracking (Proxima Nova role) ──
  sectionLabel: {
    fontFamily: F.bodySemiBold,               // Montserrat SemiBold
    fontSize: 11,
    lineHeight: 16,
    color: C.muted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: -8,                         // tighten gap to the card below
  },

  // ── Today grid ──
  todayGrid: {
    alignItems: "stretch",
  },

  // Left cycle card — drives the row height; right column stretches to match
  cycleCard: {
    width: "100%",
    minHeight: 328,
    borderRadius: CARD_RADIUS,
    backgroundColor: C.white,
    padding: 22,
    justifyContent: "space-between",  // spreads content evenly down the card
    overflow: "hidden",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 3,
  },
  cycleCardArt: {
    position: "absolute",
    right: -18,
    bottom: 44,
    width: 144,
    height: 144,
    opacity: 0.14,
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
    backgroundColor: "rgba(224,122,95,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cycleCardLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    color: C.text,                            // promoted from muted → full text for legibility
    opacity: 0.70,
  },
  cycleDayNum: {
    fontFamily: F.luxuryBold,                 // Fraunces SemiBold — warm serif for the hero number
    fontSize: 44,
    lineHeight: 50,
    color: "#1C1528",                         // deepest plum — max contrast, never fades
    letterSpacing: -0.5,
    fontWeight: "600",                        // explicit weight guard for Inter fallback path
  },
  cyclePhase: {
    fontFamily: F.bodySemiBold,               // Montserrat SemiBold — structural subhead
    fontSize: 11,
    color: C.terracotta,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  ringWrap: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
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
    fontFamily: F.uiBold,                     // Nunito Bold — ring inner label
    fontSize: 10,
    color: C.muted,
    textAlign: "center",
  },
  ringDays: {
    fontFamily: F.uiBold,                     // Nunito Bold — "X days" suffix
    fontSize: 13,
    color: C.text,
    textAlign: "center",
    marginTop: 2,
  },
  ringDaysNum: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — countdown number
    fontSize: 22,
    color: C.terracotta,
  },
  viewCalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "rgba(224,122,95,0.07)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.14)",
  },
  viewCalText: {
    fontFamily: F.uiBold,                     // Nunito Bold — subtle CTA
    fontSize: 12,
    color: C.muted,
  },

  // Right column — stretches to match cycleCard height, cards split space equally
  rightCol: {
    width: RIGHT_COL,
    gap: COL_GAP,
    flexDirection: "column",   // explicit column so flex: 1 on children works
  },
  glanceCard: {
    flex: 1,                   // each card takes exactly half the column height
    borderRadius: CARD_RADIUS,
    backgroundColor: C.white,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  glanceIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  glanceText: { flex: 1 },
  glanceTitle: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — glance card title
    fontSize: 13,
    color: C.text,
  },
  glanceSub: {
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold — glance sub-label
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },

  // ── Health way ──
  healthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  healthItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
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
    fontFamily: F.uiBold,                     // Nunito Bold — health way label
    fontSize: 10,
    color: C.muted,
    textAlign: "center",
    lineHeight: 13,
  },

  // ── Insights card ──
  insightsCard: {
    backgroundColor: C.white,
    borderRadius: CARD_RADIUS,
    padding: 18,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
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
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold — insights card title
    fontSize: 15,
    color: C.text,
  },
  seeMore: {
    fontFamily: F.uiBold,                     // Nunito Bold — link text
    fontSize: 13,
    color: C.terracotta,
  },
  insightsBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  insightsTextCol: { flex: 1 },
  insightsText: {
    fontFamily: F.bodyMedium,                 // Cormorant Garamond Medium — body insight copy
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
  },
  insightsCheer: {
    fontFamily: F.uiBold,                     // Nunito Bold — cheerful reinforcement
    fontSize: 12,
    color: C.sage,
    marginTop: 4,
  },
  chartWrap: {
    width: 112,
    height: 52,
    borderRadius: 8,
    overflow: "hidden",
  },

  // ── Quick log sheet ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(43,45,66,0.48)",
  },
  sheet: {
    height: "90%",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: SHEET_BG,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.32,
    shadowRadius: 34,
    elevation: 18,
  },
  grabber: {
    width: 42, height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginTop: 12, marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  sheetHeader: {
    paddingHorizontal: 24,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  sheetTitle: {
    fontFamily: F.handwrittenBold,            // Caveat Bold — warm personal question
    color: "#FFF0F5",
    fontSize: 26,
    lineHeight: 32,
  },
  sheetSub: {
    fontFamily: F.uiBold,                     // Nunito Bold — sheet subtitle
    color: "rgba(240,210,225,0.72)",
    fontSize: 13, lineHeight: 19, marginTop: 4,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  sheetContent: { paddingHorizontal: 24, paddingBottom: 160, gap: 24 },
  sheetSection: { gap: 12 },
  sheetSectionTitle: {
    fontFamily: F.uiBlack,                    // Nunito Black — uppercase section dividers
    color: "rgba(240,210,225,0.62)",
    fontSize: 11, lineHeight: 15,
    letterSpacing: 1.4, textTransform: "uppercase",
  },
  moodWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  moodChip: {
    minHeight: 44, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: SHEET_CARD,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  moodChipText: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — chip label
    color: "rgba(240,210,225,0.52)",
    fontSize: 13,
  },
  flowRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  flowCard: {
    flex: 1, minHeight: 118, borderRadius: 26,
    alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: SHEET_CARD,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  flowCardSel: {
    borderColor: "rgba(224,122,95,0.55)",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.36, shadowRadius: 14,
  },
  dropShape: {
    width: 44, height: 58,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  dropFill: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(224,122,95,0.58)",
  },
  flowLabel: { fontFamily: F.uiBlack, color: "rgba(240,210,225,0.52)", fontSize: 11 },
  symptomRow: { gap: 12, paddingRight: 24 },
  symptomCard: {
    width: 82, height: 88, borderRadius: 24,
    alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: SHEET_CARD,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  symptomCardSel: {
    backgroundColor: "rgba(224,122,95,0.12)",
    borderColor: "rgba(224,122,95,0.46)",
  },
  symptomLabel: {
    fontFamily: F.uiBlack,                    // Nunito Black — compact symptom labels
    color: "rgba(240,210,225,0.52)",
    fontSize: 10, textAlign: "center",
  },
  sliderBlock: {
    borderRadius: 22, padding: 16,
    backgroundColor: SHEET_CARD,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  sliderRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 12,
  },
  sliderLabel: {
    fontFamily: F.uiBlack,                    // Nunito Black — uppercase slider label
    color: "rgba(240,210,225,0.62)",
    fontSize: 12,
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  sliderVal: { fontFamily: F.uiBlack, fontSize: 13 },
  sliderTrack: { height: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.09)", overflow: "visible" },
  sliderFill:  { height: 8, borderRadius: 999 },
  sliderThumb: {
    position: "absolute", top: -5,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#FFF0F5", borderWidth: 2,
  },
  noteInput: {
    fontFamily: F.uiBold,                     // Nunito Bold — note input text
    minHeight: 92, borderRadius: 22, padding: 16,
    color: "#FFF0F5",
    fontSize: 14, lineHeight: 20,
    backgroundColor: SHEET_CARD,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
  },
  sheetFooter: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32,
    alignItems: "center", gap: 12,
    backgroundColor: "rgba(24,10,18,0.96)",
  },
  saveShell: {
    width: "100%", borderRadius: 999,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30, shadowRadius: 22, elevation: 8,
  },
  saveBtn: {
    minHeight: 56, borderRadius: 999,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10,
  },
  saveBtnText: {
    fontFamily: F.uiBlack,                    // Nunito Black — CTA button label
    color: "#FFFFFF", fontSize: 13,
    letterSpacing: 1.2, textTransform: "uppercase",
  },
  skipText: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — skip link
    color: "rgba(240,210,225,0.52)",
    fontSize: 12,
  },

  // ── Health Overview Strip ──────────────────────────────────────────────────
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  overviewTile: {
    width: (W - SIDE_PAD * 2 - 10) / 2,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
    gap: 8,
    overflow: "hidden",
  },
  overviewTileLocked: {
    opacity: 0.82,
  },
  overviewIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  overviewKicker: {
    fontFamily: F.uiBold,                     // Nunito Bold — uppercase kicker
    fontSize: 11,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  overviewValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  overviewValue: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — metric value
    fontSize: 22,
    lineHeight: 28,
    color: C.text,
  },
  overviewUnit: {
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold — unit suffix
    fontSize: 12,
    color: C.muted,
    marginBottom: 2,
  },
  overviewLockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  overviewLockLabel: {
    fontFamily: F.uiBold,                     // Nunito Bold — lock label
    fontSize: 11,
    color: C.muted,
  },

  // ── Life Stage Module Card ─────────────────────────────────────────────────
  lifeStageCard: {
    backgroundColor: C.white,
    borderRadius: CARD_RADIUS,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
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
    fontFamily: F.uiBold,                     // Nunito Bold — life stage card title
    fontSize: 16,
    lineHeight: 21,
    color: C.text,
  },
  lifeStageSubtitle: {
    fontFamily: F.bodyRegular,                // Cormorant Garamond Regular — descriptive subtitle
    fontSize: 15,
    color: C.muted,
    marginTop: 3,
    lineHeight: 20,
  },

  // ── Mental Health Hub Card ─────────────────────────────────────────────────
  mhCard: {
    backgroundColor: "rgba(189,178,255,0.10)",
    borderRadius: CARD_RADIUS,
    paddingTop: 4,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(189,178,255,0.24)",
    shadowColor: C.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 2,
    overflow: "hidden",
  },
  mhArt: {
    position: "absolute",
    right: -10,
    bottom: -16,
    width: 96,
    height: 96,
    opacity: 0.20,
  },
  // pressable inner row — icon + text + chevron
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
    backgroundColor: "rgba(189,178,255,0.18)",
    flexShrink: 0,
  },
  mhTextCol: {
    flex: 1,
    gap: 3,
  },
  mhTitle: {
    fontFamily: F.uiBold,                     // Nunito Bold — MH hub card title
    fontSize: 16,
    lineHeight: 21,
    color: C.text,
  },
  mhSubtitle: {
    fontFamily: F.bodyRegular,                // Cormorant Garamond Regular — descriptive text
    fontSize: 15,
    color: C.muted,
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
    color: C.sage,
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
    borderWidth: 1,
    borderColor: "rgba(189,178,255,0.38)",
    backgroundColor: "rgba(189,178,255,0.10)",
  },
  mhBloopText: {
    fontFamily: F.uiBold,
    fontSize: 12,
    color: C.lavender,
    letterSpacing: 0.2,
  },

  // ── Shared horizontal scroll ───────────────────────────────────────────────
  hScroll: {
    marginHorizontal: -SIDE_PAD,
  },
  hScrollContent: {
    paddingHorizontal: SIDE_PAD,
    gap: 12,
    paddingRight: SIDE_PAD + 4,
  },

  // ── Programs For You ───────────────────────────────────────────────────────
  programCard: {
    width: 168,
    backgroundColor: C.white,
    borderRadius: CARD_RADIUS,
    padding: 18,
    gap: 8,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
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
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold — program card title
    fontSize: 14,
    lineHeight: 19,
    color: C.text,
  },
  programSubtitle: {
    fontFamily: F.bodyRegular,                // Cormorant Garamond Regular — program description
    fontSize: 14,
    color: C.muted,
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
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — tag label
    fontSize: 10,
    letterSpacing: 0.4,
  },

  // ── Women Like You Also Explored ───────────────────────────────────────────
  exploredCard: {
    width: 152,
    backgroundColor: C.white,
    borderRadius: CARD_RADIUS,
    padding: 16,
    gap: 8,
    shadowColor: C.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
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
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold — explored card title
    fontSize: 13,
    lineHeight: 18,
    color: C.text,
  },
  exploredSubtitle: {
    fontFamily: F.bodyRegular,                // Cormorant Garamond Regular — card description
    fontSize: 14,
    color: C.muted,
    lineHeight: 19,
  },

  // ── Your Companions Row ────────────────────────────────────────────────────
  companionCard: {
    width: 112,
    backgroundColor: C.white,
    borderRadius: CARD_RADIUS,
    padding: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
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
    backgroundColor: C.muted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.white,
  },
  companionName: {
    fontFamily: F.uiBold,                     // Nunito Bold — companion name
    fontSize: 13,
    lineHeight: 17,
    color: C.text,
    textAlign: "center",
  },
  companionRole: {
    fontFamily: F.uiBold,                     // Nunito Bold — role tag
    fontSize: 10,
    color: C.muted,
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
    fontFamily: F.uiBlack,                    // Nunito Black — premium badge
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  pressed: { transform: [{ scale: 0.96 }] },
});

// ── Premium Sheet styles ───────────────────────────────────────────────────────
const ps = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    justifyContent: "flex-end",
  },
  scrim: {
    backgroundColor: "rgba(43,45,66,0.52)",
  },
  sheet: {
    backgroundColor: "#FDFCFB",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 16,
  },
  grabber: {
    width: 42, height: 5, borderRadius: 999,
    alignSelf: "center",
    marginTop: 12, marginBottom: 20,
    backgroundColor: "rgba(43,45,66,0.12)",
  },
  crownRow: {
    alignItems: "center",
    marginBottom: 14,
  },
  crownCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(224,122,95,0.10)",
    borderWidth: 1, borderColor: "rgba(224,122,95,0.20)",
    alignItems: "center", justifyContent: "center",
  },
  sheetTitle: {
    fontFamily: F.uiBold,
    fontSize: 20,
    lineHeight: 26,
    color: C.text,
    textAlign: "center",
    marginBottom: 10,
  },
  sheetDesc: {
    fontFamily: F.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: C.muted,
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
    color: C.text,
    flex: 1,
  },
  exploreShell: {
    borderRadius: 999,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
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
    color: "#FFFFFF",
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
    color: C.muted,
  },
});
