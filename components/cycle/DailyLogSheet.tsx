/**
 * DailyLogSheet — Premium Cycle Logging Bottom Sheet
 *
 * Built with React Native Modal + Animated (no extra packages needed).
 * Gesture-draggable, glassmorphic, thumb-friendly, emotionally safe.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Path as SvgPath, LinearGradient as SvgLinearGradient, Stop as SvgStop } from "react-native-svg";
import { CachedImage } from "../CachedImage";
import { FittedText } from "../system/FittedText";
import { darkColors, lightColors, type AppColors } from "../../constants/colors";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { useDailyLogStore } from "../../store/dailyLogStore";

const imgBloop = require("../../public/images/bloop-welcome.webp");

const { width: W, height: H } = Dimensions.get("window");
const SHEET_HEIGHT = H * 0.88;

// ── Palette — Midnight Plum dark theme ────────────────────────────────────────
const C = {
  bg:         "#2E2330",   // surface      (Blackberry Smoke — sheet base)
  text:       "#F6E9EF",   // textPrimary  (Moon Pearl)
  muted:      "#B58AC8",   // textMuted    (Lavender Dust)
  faint:      "#6E5680",   // dimmed muted
  terracotta: "#E07A5F",   // informational accent (kept)
  lavender:   "#9277C8",   // informational accent (kept)
  pink:       "#D45C82",   // informational accent (kept)
  gold:       "#C9A040",   // informational accent (kept)
  sage:       "#5E9B6B",   // informational accent (kept)
  peach:      "#F4A261",   // informational accent (kept)
  navy:       "#3D4B7C",   // informational accent (kept)
  white:      "#FFFFFF",   // send button + SVG highlights
  cardBg:     "#3A2D3E",   // slightly raised surface card
  border:     "#4A394D",   // Velvet Mauve (border / surfaceRaised)
  softPeach:  "#2E1E18",   // dark rose tinted surface (flow active)
  softLav:    "#28203A",   // dark lavender tinted surface
} as const;

// ── Data ──────────────────────────────────────────────────────────────────────
const MOODS = [
  { key: "calm",        label: "Calm",        emoji: "😌", color: C.muted, bg: "rgba(146,119,200,0.12)" },
  { key: "sensitive",   label: "Sensitive",   emoji: "🥹", color: C.pink,     bg: "rgba(212,92,130,0.12)"  },
  { key: "tired",       label: "Tired",       emoji: "😴", color: C.navy,     bg: "rgba(61,75,124,0.10)"   },
  { key: "energetic",   label: "Energetic",   emoji: "🤩", color: C.gold,     bg: "rgba(201,160,64,0.12)"  },
  { key: "overwhelmed", label: "Overwhelmed", emoji: "😵", color: C.terracotta, bg: "rgba(224,122,95,0.10)" },
  { key: "motivated",   label: "Motivated",   emoji: "🥰", color: C.sage,     bg: "rgba(94,155,107,0.12)"  },
] as const;

const FLOWS = [
  { key: "spotting", label: "Spotting", fill: 0.18, color: "#F2A58E" },
  { key: "light",    label: "Light",    fill: 0.38, color: "#E9856B" },
  { key: "medium",   label: "Medium",   fill: 0.68, color: C.terracotta },
  { key: "heavy",    label: "Heavy",    fill: 1.00, color: "#B84040" },
] as const;

const SYMPTOMS = [
  { key: "cramps",      label: "Cramps",      icon: "lightning-bolt"            as const, color: C.muted  },
  { key: "bloating",    label: "Bloating",    icon: "water-plus-outline"        as const, color: C.peach     },
  { key: "headache",    label: "Headache",    icon: "head-dots-horizontal"      as const, color: C.navy      },
  { key: "acne",        label: "Acne",        icon: "face-woman-shimmer-outline" as const, color: C.pink     },
  { key: "fatigue",     label: "Fatigue",     icon: "battery-low"               as const, color: C.muted     },
  { key: "back_pain",   label: "Back Pain",   icon: "human-handsdown"           as const, color: C.gold      },
  { key: "tenderness",  label: "Tenderness",  icon: "heart-pulse"               as const, color: C.terracotta},
  { key: "cravings",    label: "Cravings",    icon: "food-croissant"            as const, color: C.peach     },
  { key: "mood_swings", label: "Mood Swings", icon: "emoticon-sad-outline"      as const, color: C.pink      },
  { key: "anxiety",     label: "Anxiety",     icon: "heart-pulse"               as const, color: C.terracotta},
] as const;

const BODY_SIGNALS = [
  { key: "sleep",          label: "Sleep",       icon: "moon-waning-crescent" as const, dot: C.sage     },
  { key: "hydration",      label: "Hydration",   icon: "water-outline"        as const, dot: C.lavender },
  { key: "body_temp",      label: "Body temp",   icon: "thermometer"          as const, dot: C.peach    },
  { key: "cervical_mucus", label: "Body fluids", icon: "flower-outline"       as const, dot: C.pink     },
] as const;

// ── Slider component ──────────────────────────────────────────────────────────
type SliderProps = {
  value: number;
  onChange: (v: number) => void;
  gradientColors: [string, string];
  labels: [string, string, string];
};

function CycleSlider({ value, onChange, gradientColors, labels }: SliderProps) {
  const trackRef  = useRef<View>(null);
  const trackWRef = useRef(0);
  const trackXRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        const relX = e.nativeEvent.pageX - trackXRef.current;
        const v = Math.max(0, Math.min(100, (relX / trackWRef.current) * 100));
        onChange(v);
        Haptics.selectionAsync().catch(() => {});
      },
      onPanResponderMove: (e) => {
        const relX = e.nativeEvent.pageX - trackXRef.current;
        const v = Math.max(0, Math.min(100, (relX / trackWRef.current) * 100));
        onChange(v);
      },
    })
  ).current;

  const thumbPct = `${value}%` as `${number}%`;

  return (
    <View style={slStyles.wrap}>
      <View
        ref={trackRef}
        style={slStyles.track}
        onLayout={() => {
          // measure fires after layout is committed — gives correct absolute coords
          trackRef.current?.measure((_fx, _fy, w, _h, px) => {
            trackWRef.current = w;
            trackXRef.current = px;
          });
        }}
        {...panResponder.panHandlers}
      >
        {/* Fill */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[slStyles.fill, { width: thumbPct }]}
        />
        {/* Thumb */}
        <View style={[slStyles.thumbWrap, { left: thumbPct, marginLeft: -14 }]}>
          <View style={slStyles.thumb} />
        </View>
      </View>
      <View style={slStyles.labelsRow}>
        <Text style={slStyles.labelText}>{labels[0]}</Text>
        <Text style={slStyles.labelText}>{labels[1]}</Text>
        <Text style={[slStyles.labelText, { color: gradientColors[1] }]}>{labels[2]}</Text>
      </View>
    </View>
  );
}

const slStyles = StyleSheet.create({
  wrap: { flex: 1 },
  track: {
    backgroundColor: "rgba(74,57,77,0.60)",
    borderRadius: 8,
    height: 8,
    justifyContent: "center",
    marginBottom: 6,
    position: "relative",
  },
  fill: {
    borderRadius: 8,
    height: 8,
    position: "absolute",
    left: 0,
  },
  thumbWrap: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    position: "absolute",
    top: -10,
    width: 28,
  },
  thumb: {
    backgroundColor: "#F6E9EF",
    borderRadius: 14,
    elevation: 4,
    height: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.30,
    shadowRadius: 6,
    width: 22,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelText: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 10,
  },
});

// ── Premium SVG Droplet — dynamic fill rises with flow selection ──────────────
const DROP_VP_W = 36;
const DROP_VP_H = 48;
const DROP_PATH = "M18 2C18 2 34 18 34 32A16 16 0 1 1 2 32C2 18 18 2 18 2Z";

function SvgDroplet({
  color,
  fill,
  active,
  outlineColor,
  periodColor,
}: {
  color: string;
  fill: number;
  active: boolean;
  outlineColor: string;
  periodColor?: string;
}) {
  // Unique gradient ID per color — avoids ID collisions when 4 droplets render simultaneously
  const gradId = `drop_grad_${color.replace(/#/g, "").slice(0, 6)}`;
  
  // Fill rises from bottom: y1=1 (bottom) to y2=0 (top)
  const fillPct = fill * 100;
  
  // The empty part overlay opacity: reads elegantly on dark theme surface cards
  const emptyColor = active ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.15)";
  const fillColor = active ? color : `${color}A0`; // slightly transparent if inactive but still vibrant
  
  return (
    <Svg width={DROP_VP_W} height={DROP_VP_H} viewBox={`0 0 ${DROP_VP_W} ${DROP_VP_H}`}>
      <Defs>
        <SvgLinearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
          <SvgStop offset="0%" stopColor={fillColor} stopOpacity={1} />
          <SvgStop offset={`${fillPct}%`} stopColor={fillColor} stopOpacity={1} />
          <SvgStop offset={`${fillPct + 0.5}%`} stopColor={emptyColor} stopOpacity={1} />
          <SvgStop offset="100%" stopColor={emptyColor} stopOpacity={1} />
        </SvgLinearGradient>
      </Defs>

      {/* Symmetric droplet shape filled with blood accordingly (exact droplet shape) */}
      <SvgPath
        d={DROP_PATH}
        fill={`url(#${gradId})`}
      />

      {/* Soft highlight reflection curve inside droplet for absolute visual premiumness */}
      <SvgPath
        d="M11 14C8 18 8 22 8 22"
        fill="none"
        stroke="rgba(255, 255, 255, 0.24)"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Crisp outline border */}
      <SvgPath
        d={DROP_PATH}
        stroke={active ? color : outlineColor}
        strokeWidth={active ? 2.0 : 1.5}
        fill="none"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export type DailyLogPayload = {
  date:         string;
  mood:         string | null;
  flow:         string | null;
  energyLevel:  number;
  stressLevel:  number;
  symptoms:     string[];
  bodySignals:  Record<string, string>;
  journalEntry: string;
};

type Props = {
  visible:  boolean;
  onClose:  () => void;
  onSave?:  (payload: DailyLogPayload) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
let darkStyles: ReturnType<typeof getStyles> | null = null;
let lightStyles: ReturnType<typeof getStyles> | null = null;

function useStyles() {
  const { colors, isDark } = useColorMode();
  if (isDark) {
    if (!darkStyles) darkStyles = getStyles(darkColors, true);
    return { colors, isDark, s: darkStyles };
  }
  if (!lightStyles) lightStyles = getStyles(lightColors, false);
  return { colors, isDark, s: lightStyles };
}

export function DailyLogSheet({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, s } = useStyles();
  const saveLog = useDailyLogStore((s) => s.saveLog);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedMood,     setSelectedMood]     = useState<string | null>(null);
  const [selectedFlow,     setSelectedFlow]     = useState<string | null>(null);
  const [energyLevel,      setEnergyLevel]      = useState(65);
  const [stressLevel,      setStressLevel]      = useState(55);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [journalText,      setJournalText]      = useState("");
  const [showSuccess,      setShowSuccess]      = useState(false);
  const [selectedBodySignals, setSelectedBodySignals] = useState<Set<string>>(new Set());

  // ── Animations ─────────────────────────────────────────────────────────────
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;
  const successOp  = useRef(new Animated.Value(0)).current;
  const bloopScale = useRef(new Animated.Value(0.93)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;
  const textY      = useRef(new Animated.Value(12)).current;
  const textOp     = useRef(new Animated.Value(0)).current;
  const haloScale1 = useRef(new Animated.Value(0.8)).current;
  const haloOp1    = useRef(new Animated.Value(0)).current;
  const haloScale2 = useRef(new Animated.Value(0.8)).current;
  const haloOp2    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setShowSuccess(false);
      bloopScale.setValue(0.93);
      successOp.setValue(0);
      checkScale.setValue(0.5);
      textY.setValue(12);
      textOp.setValue(0);
      haloScale1.setValue(0.8);
      haloOp1.setValue(0);
      haloScale2.setValue(0.8);
      haloOp2.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0,   useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(backdropOp, { toValue: 1,   useNativeDriver: true, duration: 280, easing: Easing.out(Easing.ease) }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SHEET_HEIGHT, useNativeDriver: true, duration: 300, easing: Easing.in(Easing.ease) }),
        Animated.timing(backdropOp, { toValue: 0,            useNativeDriver: true, duration: 260 }),
      ]).start();
    }
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [visible, backdropOp, translateY]);

  // Swipe-down to dismiss
  const sheetPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 8 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.6) {
          handleClose();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SHEET_HEIGHT, useNativeDriver: true, duration: 300, easing: Easing.in(Easing.ease) }),
      Animated.timing(backdropOp, { toValue: 0,            useNativeDriver: true, duration: 260 }),
    ]).start(() => onClose());
  };

  const handleSave = () => {
    if (showSuccess) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const payload: DailyLogPayload = {
      date:         new Date().toISOString().split("T")[0],
      mood:         selectedMood,
      flow:         selectedFlow,
      energyLevel:  Math.round(energyLevel),
      stressLevel:  Math.round(stressLevel),
      symptoms:     Array.from(selectedSymptoms),
      bodySignals:  Object.fromEntries([...selectedBodySignals].map(k => [k, "selected"])),
      journalEntry: journalText.trim(),
    };
    saveLog(payload);
    onSave?.(payload);
    setShowSuccess(true);

    // Reset values for perfect start states
    bloopScale.setValue(0.93);
    successOp.setValue(0);
    checkScale.setValue(0.5);
    textY.setValue(12);
    textOp.setValue(0);
    haloScale1.setValue(0.8);
    haloOp1.setValue(0);
    haloScale2.setValue(0.8);
    haloOp2.setValue(0);

    // Animate coordinated success sequence
    Animated.parallel([
      // 1. Success overlay background fade-in
      Animated.timing(successOp, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // 2. Success Card spring scaling
      Animated.spring(bloopScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      // 3. Staggered checkmark badge spring scaling
      Animated.sequence([
        Animated.delay(100),
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      // 4. Staggered content reveal (text translation & opacity)
      Animated.sequence([
        Animated.delay(150),
        Animated.parallel([
          Animated.timing(textOp, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(textY, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // 5. First concentric halo wave ripple
      Animated.sequence([
        Animated.parallel([
          Animated.timing(haloOp1, {
            toValue: 0.45,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(haloScale1, {
            toValue: 1.8,
            duration: 700,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(haloOp1, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // 6. Second concentric halo wave ripple (slightly delayed)
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(haloOp2, {
            toValue: 0.35,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(haloScale2, {
            toValue: 2.5,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(haloOp2, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Auto-dismiss after 1.6 seconds of beautiful celebration
    closeTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 380,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOp, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccess(false);
        bloopScale.setValue(0.93);
        successOp.setValue(0);
        checkScale.setValue(0.5);
        textY.setValue(12);
        textOp.setValue(0);
        haloScale1.setValue(0.8);
        haloOp1.setValue(0);
        haloScale2.setValue(0.8);
        haloOp2.setValue(0);
        onClose();
      });
    }, 1600);
  };

  const toggleSymptom = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedSymptoms(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleBodySignal = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedBodySignals(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectMood = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedMood(prev => prev === key ? null : key);
  };

  const selectFlow = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedFlow(prev => prev === key ? null : key);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={s.modalShell}>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <Animated.View style={[s.backdrop, { opacity: backdropOp }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* ── Sheet ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[s.sheetWrap, { transform: [{ translateY }] }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.keyboardShell}
          keyboardVerticalOffset={0}
        >
          <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>

            {/* Drag handle area */}
            <View {...sheetPan.panHandlers} style={s.handleArea}>
              <View style={s.handle} />
            </View>

            {/* Sheet top bar — title + close X */}
            <View style={s.sheetTopBar}>
              <Text style={s.sheetTopTitle}>Today's log</Text>
              <Pressable
                onPress={handleClose}
                hitSlop={12}
                style={({ pressed }) => [s.closeXBtn, pressed && s.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Close log"
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.scrollContent}
              bounces={false}
            >
              {/* ── "Today feels…" ──────────────────────────────────────── */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionStar}>♥</Text>
                <Text style={s.sectionTitle}>Today feels…</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.moodScroll}
                contentContainerStyle={{ paddingHorizontal: 2, gap: 8 }}
              >
                {MOODS.map((m) => {
                  const active = selectedMood === m.key;
                  return (
                    <Pressable
                      key={m.key}
                      onPress={() => selectMood(m.key)}
                      style={({ pressed }) => [
                        s.moodChip,
                        { backgroundColor: active ? m.bg : colors.surfaceRaised },
                        active && { borderColor: m.color, borderWidth: 1.5 },
                        pressed && s.pressed,
                      ]}
                    >
                      <Text style={s.moodEmoji}>{m.emoji}</Text>
                      <FittedText style={[s.moodLabel, active && { color: m.color, fontFamily: F.uiSemiBold }]}>
                        {m.label}
                      </FittedText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* ── Flow ─────────────────────────────────────────────────── */}
              <View style={s.sectionHeader}>
                <MaterialCommunityIcons name="water" size={15} color={C.terracotta} />
                <Text style={s.sectionTitle}>Period flow</Text>
              </View>
              <View style={s.flowGrid}>
                {FLOWS.map((f) => {
                  const active = selectedFlow === f.key;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => selectFlow(f.key)}
                      style={({ pressed }) => [
                        s.flowCard,
                        {
                          backgroundColor: active ? `${f.color}1E` : colors.surfaceRaised,
                          borderColor: active ? f.color : colors.border,
                          borderWidth: 1.5,
                        },
                        pressed && s.pressed,
                      ]}
                    >
                      <SvgDroplet
                        color={f.color}
                        fill={f.fill}
                        active={active}
                        outlineColor={colors.textMuted}
                        periodColor={colors.periodColor}
                      />
                      <Text style={[s.flowLabel, active && { color: f.color, fontFamily: F.uiSemiBold }]}>
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Energy + Stress ──────────────────────────────────────── */}
              <View style={s.slidersRow}>
                <View style={s.sliderSection}>
                  <View style={s.sliderHeader}>
                    <MaterialCommunityIcons name="lightning-bolt" size={14} color={C.gold} />
                    <Text style={s.sliderTitle}>Energy</Text>
                  </View>
                  <CycleSlider
                    value={energyLevel}
                    onChange={setEnergyLevel}
                    gradientColors={["#9277C8", "#F4A261"]}
                    labels={["Low", "Balanced", "High"]}
                  />
                </View>
                <View style={s.sliderSection}>
                  <View style={s.sliderHeader}>
                    <MaterialCommunityIcons name="flower-tulip-outline" size={14} color={C.pink} />
                    <Text style={s.sliderTitle}>Stress</Text>
                  </View>
                  <CycleSlider
                    value={stressLevel}
                    onChange={setStressLevel}
                    gradientColors={["#9277C8", "#D45C82"]}
                    labels={["Calm", "Busy", "Drained"]}
                  />
                </View>
              </View>

              {/* ── Symptoms ─────────────────────────────────────────────── */}
              <View style={s.sectionHeader}>
                <MaterialCommunityIcons name="flower-pollen-outline" size={16} color={C.pink} />
                <Text style={s.sectionTitle}>What are you experiencing?</Text>
              </View>
              <View style={s.symptomsWrap}>
                {SYMPTOMS.map((symptom) => {
                  const active = selectedSymptoms.has(symptom.key);
                  return (
                    <Pressable
                      key={symptom.key}
                      onPress={() => toggleSymptom(symptom.key)}
                      style={({ pressed }) => [
                        s.symptomPill,
                        active && s.symptomPillActive,
                        pressed && s.pressed,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={symptom.icon}
                        size={14}
                        color={active ? colors.background : colors.textPrimary}
                      />
                      <Text style={[s.symptomLabel, active && s.symptomLabelActive]}>
                        {symptom.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Body signals ─────────────────────────────────────────── */}
              <View style={s.sectionHeader}>
                <MaterialCommunityIcons name="pulse" size={15} color={C.terracotta} />
                <Text style={s.sectionTitle}>How is your body feeling today?</Text>
              </View>
              <View style={s.chipGrid}>
                {BODY_SIGNALS.map((b) => {
                  const active = selectedBodySignals.has(b.key);
                  return (
                    <Pressable
                      key={b.key}
                      onPress={() => toggleBodySignal(b.key)}
                      style={({ pressed }) => [
                        s.chipPill,
                        active && s.chipPillActive,
                        pressed && s.pressed,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={b.icon}
                        size={14}
                        color={active ? colors.background : colors.textPrimary}
                      />
                      <Text style={[s.chipLabel, active && s.chipLabelActive]}>
                        {b.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Journal moment ───────────────────────────────────────── */}
              <View style={s.sectionHeader}>
                <Ionicons name="leaf-outline" size={15} color={C.sage} />
                <Text style={s.sectionTitle}>Journal moment</Text>
                <Text style={s.optionalLabel}>(optional)</Text>
              </View>
              <View style={s.journalCard}>
                <TextInput
                  value={journalText}
                  onChangeText={setJournalText}
                  placeholder="Anything unusual today?"
                  placeholderTextColor={C.faint}
                  multiline
                  style={s.journalInput}
                />
                <Ionicons
                  name="pencil"
                  size={16}
                  color={C.faint}
                  style={s.journalIcon}
                />
              </View>

              {/* ── Done button ──────────────────────────────────────────── */}
              <Pressable
                onPress={handleSave}
                disabled={showSuccess}
                style={({ pressed }) => [s.doneBtn, showSuccess && s.doneBtnDisabled, pressed && !showSuccess && s.pressed]}
              >
                <LinearGradient
                  colors={[colors.warning, colors.periodColor]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.doneBtnInner}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.background} />
                  <Text style={s.doneBtnText}>Done</Text>
                </LinearGradient>
              </Pressable>

              <View style={{ height: 8 }} />
            </ScrollView>
            {showSuccess && (
              <Animated.View pointerEvents="none" style={[s.successOverlay, { opacity: successOp }]}>
                {/* Concentric Halos */}
                <Animated.View
                  style={[
                    s.successHalo,
                    {
                      transform: [{ scale: haloScale1 }],
                      opacity: haloOp1,
                      borderColor: colors.periodColor,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    s.successHalo,
                    {
                      transform: [{ scale: haloScale2 }],
                      opacity: haloOp2,
                      borderColor: colors.warning,
                    },
                  ]}
                />

                <Animated.View style={[s.successCard, { transform: [{ scale: bloopScale }] }]}>
                  <View style={s.bloopCheckContainer}>
                    <CachedImage source={imgBloop} style={s.successBloop} />
                    <Animated.View style={[s.checkmarkBadge, { transform: [{ scale: checkScale }] }]}>
                      <Ionicons name="checkmark-sharp" size={12} color={colors.background} />
                    </Animated.View>
                  </View>
                  <Animated.View style={[s.successCopy, { opacity: textOp, transform: [{ translateY: textY }] }]}>
                    <Text style={s.successTitle}>Saved beautifully</Text>
                    <Text style={s.successText}>Bloop logged your rhythm. You are all set.</Text>
                  </Animated.View>
                </Animated.View>
              </Animated.View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const getStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  modalShell: {
    flex: 1,
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
  },
  keyboardShell: {
    flex: 1,
    maxWidth: 390,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.background}CC`,
  },
  sheetWrap: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    height: SHEET_HEIGHT,
    // Web: keep inside 390px shell
    maxWidth: 390,
    alignSelf: "center",
    width: "100%",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    overflow: "hidden",
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: isDark ? 0.36 : 0.16,
    shadowRadius: 24,
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 3,
    height: 4,
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  // Section headers
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginBottom: 12,
    marginTop: 20,
  },
  sectionStar: {
    color: colors.textMuted,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: F.uiBold,
    fontSize: 15,
  },
  optionalLabel: {
    color: colors.textHint,
    fontFamily: F.uiRegular,
    fontSize: 12,
    marginLeft: -2,
  },

  // Mood
  moodScroll: {
    marginBottom: 2,
  },
  moodChip: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    height: 86,
    justifyContent: "center",
    width: 78,
  },
  moodEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  moodLabel: {
    color: colors.textMuted,
    fontFamily: F.uiMedium,
    fontSize: 11,
    minWidth: 82,
    textAlign: "center",
  },

  // Flow
  flowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  flowCard: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    height: 80,
    justifyContent: "center",
    gap: 8,
  },
  flowDropShell: {
    backgroundColor: "#2E1E18",
    borderColor: "rgba(224,122,95,0.30)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 5,
    borderWidth: 1.4,
    height: 34,
    overflow: "hidden",
    position: "relative",
    transform: [{ rotate: "45deg" }],
    width: 34,
  },
  flowBloodFill: {
    bottom: 0,
    left: 0,
    opacity: 0.96,
    position: "absolute",
    right: 0,
  },
  flowDropShine: {
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 5,
    height: 10,
    left: 9,
    position: "absolute",
    top: 7,
    width: 5,
  },
  flowDropsRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 3,
    height: 20,
    justifyContent: "center",
  },
  flowDropOutline: {
    borderRadius: 7,
    borderWidth: 1.5,
    height: 14,
    width: 11,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    opacity: 0.45,
  },
  flowLabel: {
    color: colors.textMuted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },

  // Sliders
  slidersRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
    marginBottom: 2,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  sliderSection: {
    flex: 1,
  },
  sliderHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 12,
  },
  sliderTitle: {
    color: colors.textPrimary,
    fontFamily: F.uiBold,
    fontSize: 13,
  },

  // Sheet top bar (title + close X)
  sheetTopBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sheetTopTitle: {
    color: colors.textPrimary,
    fontFamily: F.uiBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  closeXBtn: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  // Symptoms — premium chip grid
  symptomsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  symptomPill: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,   // surfaceRaised — unselected
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  symptomPillActive: {
    backgroundColor: colors.primaryCTA,   // primaryCTA — selected
  },
  symptomLabel: {
    color: colors.textPrimary,             // textPrimary — unselected
    fontFamily: F.uiMedium,
    fontSize: 12,
  },
  symptomLabelActive: {
    color: colors.background,             // background — AAA contrast on primaryCTA
    fontFamily: F.uiSemiBold,
  },

  // Body signals — premium chip grid (same spec as symptoms)
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chipPill: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipPillActive: {
    backgroundColor: colors.primaryCTA,
  },
  chipLabel: {
    color: colors.textPrimary,
    fontFamily: F.uiMedium,
    fontSize: 12,
  },
  chipLabelActive: {
    color: colors.background,
    fontFamily: F.uiSemiBold,
  },

  // Journal
  journalCard: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 72,
    padding: 14,
    position: "relative",
  },
  journalInput: {
    color: colors.textPrimary,
    fontFamily: F.uiRegular,
    fontSize: 13,
    lineHeight: 20,
    minHeight: 44,
    paddingRight: 28,
  },
  journalIcon: {
    bottom: 12,
    position: "absolute",
    right: 14,
  },

  // Done button
  doneBtn: {
    borderRadius: 32,
    marginTop: 24,
    overflow: "hidden",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
  },
  doneBtnInner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    height: 56,
    justifyContent: "center",
  },
  doneBtnText: {
    color: colors.background,
    fontFamily: F.uiBold,
    fontSize: 16,
    letterSpacing: 0.4,
  },
  doneBtnDisabled: {
    opacity: 0.78,
  },

  // Success toast
  successRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: `${colors.background}D8`,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  successHalo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderStyle: "dashed",
    opacity: 0,
  },
  bloopCheckContainer: {
    position: "relative",
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  successCard: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    maxWidth: 320,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    zIndex: 10,
  },
  successBloop: {
    height: 48,
    width: 48,
    borderRadius: 12,
  },
  successCopy: {
    flex: 1,
  },
  successTitle: {
    color: colors.textPrimary,
    fontFamily: F.uiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  successText: {
    color: colors.textMuted,
    fontFamily: F.uiMedium,
    fontSize: 12,
    lineHeight: 17,
  },

  pressed: {
    transform: [{ scale: 0.96 }],
  },
});



