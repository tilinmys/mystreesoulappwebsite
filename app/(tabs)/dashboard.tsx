import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { useOnboardingStore, type LifeStage } from "../../store/onboardingStore";

const bloopWelcome       = require("../../public/images/bloop-welcome.webp");
const bloopCalm          = require("../../public/images/bloop-calm.webp");
const bloopCycle         = require("../../public/images/bloop-cycle.webp");
const companionJiggy     = require("../../public/images/companion-jiggy-cutout.webp");
const companionManchi    = require("../../public/images/companion-manchi-cutout.webp");
const companionYogi      = require("../../public/images/companion-yogi-cutout.webp");

const { width: W } = Dimensions.get("window");

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
  { label: "Privacy &\nsafety",  icon: "shield-check-outline",iconColor: C.rose,       bg: "rgba(215,166,161,0.13)" },
] as const;

// ── Animated circle helper ────────────────────────────────────────────────────
const AnimCircle = Animated.createAnimatedComponent(Circle);

// ── Root screen ───────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router   = useRouter();

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
  const ringProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(ringProgress, {
      toValue: 1, duration: 1400, useNativeDriver: false,
    }).start();
  }, []);

  // Cycle ring: 73% filled = Day 12 of ~16-day window
  const CIRC = 2 * Math.PI * 54;
  const ringOffset = ringProgress.interpolate({
    inputRange:  [0, 1],
    outputRange: [CIRC, CIRC * 0.27],
  });

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* 1 ── Header */}
        <Header onNotifications={() => router.push("/notifications")} />

        {/* 2 ── Hero card */}
        <HeroCard onLog={() => setLogOpen(true)} />

        {/* 3 ── Today at a glance */}
        <Text style={s.sectionLabel}>Today at a glance</Text>
        <TodayGrid
          ringOffset={ringOffset}
          AnimCircle={AnimCircle}
          CIRC={CIRC}
          onSymptoms={() => {}}
          onMood={() => { setActiveLog("mood"); setLogOpen(true); }}
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
          onPremium={() => router.push("/premium")}
        />

        {/* 7 ── Life stage module — only when a stage is stored */}
        {lifeStage != null && (
          <LifeStageModuleCard lifeStage={lifeStage} router={router} />
        )}

        {/* 8 ── Mental Health Hub — only when at least one MH goal was selected */}
        {hasMentalHealthGoal && (
          <MentalHealthHubCard onPress={() => router.push("/premium")} />
        )}

        {/* 9 ── Programs for you */}
        <Text style={s.sectionLabel}>Our Programs</Text>
        <ProgramsSection lifeStage={lifeStage} router={router} />

        {/* 10 ── Women like you also explored */}
        <Text style={s.sectionLabel}>Women like you also explored</Text>
        <ExploredSection />

        {/* 11 ── Your companions */}
        <Text style={s.sectionLabel}>Your companions</Text>
        <CompanionsRow
          onPremium={() => router.push("/premium")}
          router={router}
        />

        <View style={{ height: 110 }} />
      </ScrollView>

      {logOpen && (
        <QuickLogSheet
          activeQuickLog={activeQuickLog}
          onClose={() => setLogOpen(false)}
          onSave={() => setLogOpen(false)}
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
        onPress={onNotifications}
        style={({ pressed }) => [s.bellWrap, pressed && s.pressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={C.text} />
        <View style={s.bellDot} />
      </Pressable>
    </View>
  );
}

// ── 2. Hero card ──────────────────────────────────────────────────────────────
function HeroCard({ onLog }: { onLog: () => void }) {
  return (
    <View style={s.heroCard}>
      {/* subtle lavender-peach wash behind the card */}
      <LinearGradient
        colors={["rgba(189,178,255,0.18)", "rgba(244,162,97,0.10)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Left text */}
      <View style={s.heroLeft}>
        <Text style={s.heroHeadline}>
          {"You're in control\nof your health"}
        </Text>
        <Text style={s.heroSub}>Small steps today,{"\n"}big changes tomorrow.</Text>
        <Pressable
          onPress={onLog}
          style={({ pressed }) => [s.heroCta, pressed && s.pressed]}
        >
          <Text style={s.heroCtaText}>Log today</Text>
          <Ionicons name="arrow-forward" size={15} color="#FFF" />
        </Pressable>
      </View>

      {/* Right illustration */}
      <View style={s.heroRight} pointerEvents="none">
        <CachedImage source={bloopWelcome} style={s.heroImage} />
      </View>
    </View>
  );
}

// ── 3. Today at a glance ──────────────────────────────────────────────────────
function TodayGrid({
  ringOffset, AnimCircle, CIRC, onSymptoms, onMood, onCalendar
}: {
  ringOffset: Animated.AnimatedInterpolation<number | string>;
  AnimCircle: ReturnType<typeof Animated.createAnimatedComponent<typeof Circle>>;
  CIRC: number;
  onSymptoms: () => void;
  onMood:     () => void;
  onCalendar: () => void;
}) {
  return (
    <View style={s.todayGrid}>
      {/* LEFT — tall cycle card */}
      <View style={s.cycleCard}>
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
          <Svg width={120} height={120} viewBox="0 0 120 120">
            {/* track */}
            <Circle
              cx={60} cy={60} r={54}
              fill="transparent"
              stroke={`rgba(224,122,95,0.15)`}
              strokeWidth={9}
            />
            {/* fill */}
            <AnimCircle
              cx={60} cy={60} r={54}
              fill="transparent"
              stroke={C.terracotta}
              strokeWidth={9}
              strokeDasharray={CIRC}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              rotation="-90"
              originX={60}
              originY={60}
            />
          </Svg>
          <View style={s.ringCenter} pointerEvents="none">
            <Text style={s.ringLabel}>Next period</Text>
            <Text style={s.ringDays}><Text style={s.ringDaysNum}>16 </Text>days</Text>
          </View>
        </View>

        {/* View calendar button */}
        <Pressable
          onPress={onCalendar}
          style={({ pressed }) => [s.viewCalBtn, pressed && s.pressed]}
        >
          <Text style={s.viewCalText}>View calendar</Text>
          <Ionicons name="chevron-forward" size={14} color={C.muted} />
        </Pressable>
      </View>

      {/* RIGHT — two stacked cards */}
      <View style={s.rightCol}>
        {/* Symptoms card */}
        <Pressable
          onPress={onSymptoms}
          style={({ pressed }) => [s.glanceCard, pressed && s.pressed]}
        >
          <View style={[s.glanceIconBubble, { backgroundColor: "rgba(129,178,154,0.14)" }]}>
            <MaterialCommunityIcons name="flower-outline" size={20} color={C.sage} />
          </View>
          <View style={s.glanceText}>
            <Text style={s.glanceTitle}>Symptoms</Text>
            <Text style={s.glanceSub}>2 logged today</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={C.faint} />
        </Pressable>

        {/* Mood card */}
        <Pressable
          onPress={onMood}
          style={({ pressed }) => [s.glanceCard, pressed && s.pressed]}
        >
          <View style={[s.glanceIconBubble, { backgroundColor: "rgba(224,122,95,0.12)" }]}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={20} color={C.terracotta} />
          </View>
          <View style={s.glanceText}>
            <Text style={s.glanceTitle}>Mood today</Text>
            <Text style={s.glanceSub}>Check in</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={C.faint} />
        </Pressable>
      </View>
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
    "/settings",
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

function MentalHealthHubCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.mhCard, pressed && s.pressed]}
    >
      <CachedImage source={bloopCalm} style={s.mhArt} contentFit="contain" />
      <View style={s.mhIconBubble}>
        <MaterialCommunityIcons name="brain" size={24} color={C.lavender} />
      </View>
      <View style={s.mhTextCol}>
        <Text style={s.mhTitle}>Mental Health Hub</Text>
        <Text style={s.mhSubtitle}>
          Guided support unlocks with Soul Premium
        </Text>
        <View style={s.mhLockRow}>
          <MaterialCommunityIcons name="lock-outline" size={11} color={C.lavender} />
          <Text style={s.mhLockLabel}>Soul Premium</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.faint} />
    </Pressable>
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
}: {
  lifeStage: LifeStage;
  router: ReturnType<typeof useRouter>;
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
          onPress={() => router.push("/premium")}
          style={({ pressed }) => [s.programCard, pressed && s.pressed]}
        >
          <View style={[s.programIconBubble, { backgroundColor: prog.bg }]}>
            <MaterialCommunityIcons name={prog.icon} size={22} color={prog.color} />
          </View>
          <Text style={s.programTitle}>{prog.title}</Text>
          <Text style={s.programSubtitle}>{prog.subtitle}</Text>
          <View style={[s.programTag, { backgroundColor: prog.bg }]}>
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
  onPremium,
  router,
}: {
  onPremium: () => void;
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
          onPress={() => (c.locked ? onPremium() : router.push("/bloop"))}
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
  scroll: { paddingHorizontal: SIDE_PAD, paddingTop: 18, gap: 20 },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  headerLeft: { flex: 1, paddingRight: 12 },
  greetingName: {
    fontFamily: F.handwrittenBold,      // Caveat Bold — warm personal greeting
    fontSize: 28,
    lineHeight: 34,
    color: C.text,
    letterSpacing: 0.2,
  },
  greetingEmoji: { fontSize: 22 },
  greetingSub: {
    fontFamily: F.uiRegular,            // Nunito Regular — soft subtitle
    fontSize: 13,
    lineHeight: 18,
    color: C.muted,
    marginTop: 3,
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

  // ── Hero card ──
  heroCard: {
    borderRadius: CARD_RADIUS + 4,
    minHeight: 180,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: C.white,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 4,
    paddingLeft: 22,
    paddingVertical: 22,
  },
  heroLeft: { flex: 1, paddingRight: 8 },
  heroHeadline: {
    fontFamily: F.handwrittenBold,            // Caveat Bold — warm personal hero headline
    fontSize: 22,
    lineHeight: 28,
    color: C.text,
    letterSpacing: 0.2,
  },
  heroSub: {
    fontFamily: F.uiMedium,                   // Nunito Medium — soft subtitle
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
    marginTop: 8,
  },
  heroCta: {
    marginTop: 18,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.terracotta,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 9,
  },
  heroCtaText: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — button label
    color: "#FFFFFF",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  heroRight: {
    width: 140,
    height: 180,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  heroImage: {
    width: 140,
    height: 160,
  },

  // ── Section label ──
  sectionLabel: {
    fontFamily: F.uiBold,                     // Nunito Bold — section header
    fontSize: 17,
    lineHeight: 22,
    color: C.text,
    letterSpacing: 0.2,
  },

  // ── Today grid ──
  todayGrid: {
    flexDirection: "row",
    gap: COL_GAP,
    alignItems: "stretch",   // both columns grow to the tallest child's height
  },

  // Left cycle card — drives the row height; right column stretches to match
  cycleCard: {
    width: LEFT_COL,
    borderRadius: CARD_RADIUS,
    backgroundColor: C.white,
    padding: 18,
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
    right: -20,
    bottom: 56,
    width: 96,
    height: 96,
    opacity: 0.18,
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
    fontFamily: F.uiBold,                     // Nunito Bold — card label
    fontSize: 13,
    color: C.muted,
  },
  cycleDayNum: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — large metric number
    fontSize: 32,
    lineHeight: 38,
    color: C.text,
    letterSpacing: 0.2,
  },
  cyclePhase: {
    fontFamily: F.uiSemiBold,                 // Nunito SemiBold — phase label
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
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
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
  mhLockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  mhLockLabel: {
    fontFamily: F.uiExtraBold,                // Nunito ExtraBold — premium label
    fontSize: 11,
    color: C.lavender,
    letterSpacing: 0.4,
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
