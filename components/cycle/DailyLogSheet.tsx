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
import { CachedImage } from "../CachedImage";
import { F } from "../../constants/fonts";

const imgBloop = require("../../public/images/bloop-welcome.webp");

const { width: W, height: H } = Dimensions.get("window");
const SHEET_HEIGHT = H * 0.88;

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:         "#FFFDFB",
  text:       "#1C1528",
  muted:      "#8A7A9A",
  faint:      "#C4B8D4",
  terracotta: "#E07A5F",
  lavender:   "#9277C8",
  pink:       "#D45C82",
  gold:       "#C9A040",
  sage:       "#5E9B6B",
  peach:      "#F4A261",
  navy:       "#3D4B7C",
  white:      "#FFFFFF",
  cardBg:     "rgba(255,255,255,0.82)",
  border:     "rgba(255,255,255,0.88)",
  softPeach:  "#FFF5F0",
  softLav:    "#F5F0FF",
} as const;

// ── Data ──────────────────────────────────────────────────────────────────────
const MOODS = [
  { key: "calm",        label: "Calm",        emoji: "😌", color: C.lavender, bg: "rgba(146,119,200,0.12)" },
  { key: "sensitive",   label: "Sensitive",   emoji: "🥹", color: C.pink,     bg: "rgba(212,92,130,0.12)"  },
  { key: "tired",       label: "Tired",       emoji: "😴", color: C.navy,     bg: "rgba(61,75,124,0.10)"   },
  { key: "energetic",   label: "Energetic",   emoji: "🤩", color: C.gold,     bg: "rgba(201,160,64,0.12)"  },
  { key: "overwhelmed", label: "Overwhelmed", emoji: "😵", color: C.terracotta, bg: "rgba(224,122,95,0.10)" },
  { key: "motivated",   label: "Motivated",   emoji: "🥰", color: C.sage,     bg: "rgba(94,155,107,0.12)"  },
] as const;

const FLOWS = [
  { key: "light",    label: "Light",    drops: 1, color: "#FFBCA6" },
  { key: "medium",   label: "Medium",   drops: 2, color: C.terracotta },
  { key: "heavy",    label: "Heavy",    drops: 3, color: "#B84040" },
  { key: "spotting", label: "Spotting", drops: 0, color: C.faint },
] as const;

const SYMPTOMS = [
  { key: "cramps",      label: "Cramps",      icon: "lightning-bolt"            as const, color: C.lavender  },
  { key: "bloating",    label: "Bloating",    icon: "water-plus-outline"        as const, color: C.peach     },
  { key: "headache",    label: "Headache",    icon: "head-dots-horizontal"      as const, color: C.navy      },
  { key: "acne",        label: "Acne",        icon: "face-woman-shimmer-outline" as const, color: C.pink     },
  { key: "mood_swings", label: "Mood Swings", icon: "emoticon-sad-outline"      as const, color: C.pink      },
  { key: "fatigue",     label: "Fatigue",     icon: "battery-low"               as const, color: C.muted     },
  { key: "anxiety",     label: "Anxiety",     icon: "heart-pulse"               as const, color: C.terracotta},
  { key: "back_pain",   label: "Back Pain",   icon: "human-handsdown"           as const, color: C.gold      },
] as const;

const BODY_SIGNALS = [
  { key: "sleep",          label: "Sleep",          value: "Good",    icon: "moon-waning-crescent" as const, dot: C.sage    },
  { key: "hydration",      label: "Hydration",      value: "Good",    icon: "water-outline"        as const, dot: C.lavender},
  { key: "body_temp",      label: "Body Temp.",      value: "Normal",  icon: "thermometer"          as const, dot: C.peach   },
  { key: "cervical_mucus", label: "Cervical Mucus", value: "Creamy",  icon: "flower-outline"       as const, dot: C.pink    },
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
    backgroundColor: "rgba(196,184,212,0.22)",
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
    backgroundColor: C.white,
    borderRadius: 14,
    elevation: 4,
    height: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
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

// ── Drop icon (custom SVG-free droplet via View) ──────────────────────────────
function Droplet({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <View style={{
      width: size,
      height: size * 1.3,
      borderRadius: size * 0.5,
      borderTopLeftRadius: size * 0.5,
      borderTopRightRadius: size * 0.5,
      borderBottomLeftRadius: size * 0.5,
      borderBottomRightRadius: size * 1.4,
      backgroundColor: color,
      transform: [{ rotate: "180deg" }],
    }} />
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
export function DailyLogSheet({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedMood,     setSelectedMood]     = useState<string | null>(null);
  const [selectedFlow,     setSelectedFlow]     = useState<string | null>(null);
  const [energyLevel,      setEnergyLevel]      = useState(65);
  const [stressLevel,      setStressLevel]      = useState(55);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [journalText,      setJournalText]      = useState("");
  const [showSuccess,      setShowSuccess]      = useState(false);

  // ── Animations ─────────────────────────────────────────────────────────────
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;
  const successOp  = useRef(new Animated.Value(0)).current;
  const bloopScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setShowSuccess(false);
      bloopScale.setValue(0.8);
      successOp.setValue(0);
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
  }, [visible, backdropOp, bloopScale, successOp, translateY]);

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
      Animated.timing(translateY, { toValue: SHEET_HEIGHT, useNativeDriver: true, duration: 280, easing: Easing.in(Easing.ease) }),
      Animated.timing(backdropOp, { toValue: 0,            useNativeDriver: true, duration: 240 }),
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
      bodySignals:  Object.fromEntries(BODY_SIGNALS.map(b => [b.key, b.value])),
      journalEntry: journalText.trim(),
    };
    onSave?.(payload);
    setShowSuccess(true);

    // Animate success
    Animated.parallel([
      Animated.spring(bloopScale, { toValue: 1, useNativeDriver: true, tension: 70, friction: 8 }),
      Animated.timing(successOp,  { toValue: 1, useNativeDriver: true, duration: 380 }),
    ]).start();

    closeTimerRef.current = setTimeout(() => {
      setShowSuccess(false);
      bloopScale.setValue(0.8);
      successOp.setValue(0);
      handleClose();
    }, 1150);
  };

  const toggleSymptom = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedSymptoms(prev => {
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
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOp }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* ── Sheet ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>

            {/* Drag handle area */}
            <View {...sheetPan.panHandlers} style={styles.handleArea}>
              <View style={styles.handle} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              {/* ── "Today feels…" ──────────────────────────────────────── */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionStar}>✦</Text>
                <Text style={styles.sectionTitle}>Today feels…</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.moodScroll}
                contentContainerStyle={{ paddingHorizontal: 2, gap: 8 }}
              >
                {MOODS.map((m) => {
                  const active = selectedMood === m.key;
                  return (
                    <Pressable
                      key={m.key}
                      onPress={() => selectMood(m.key)}
                      style={({ pressed }) => [
                        styles.moodChip,
                        { backgroundColor: active ? m.bg : "rgba(255,255,255,0.72)" },
                        active && { borderColor: m.color, borderWidth: 1.5 },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      <Text style={[styles.moodLabel, active && { color: m.color, fontFamily: F.uiSemiBold }]}>
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* ── Flow ─────────────────────────────────────────────────── */}
              <View style={styles.sectionHeader}>
                <Droplet color={C.terracotta} size={13} />
                <Text style={styles.sectionTitle}>Flow</Text>
              </View>
              <View style={styles.flowGrid}>
                {FLOWS.map((f) => {
                  const active = selectedFlow === f.key;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => selectFlow(f.key)}
                      style={({ pressed }) => [
                        styles.flowCard,
                        active && { borderColor: f.color, borderWidth: 1.5, backgroundColor: C.softPeach },
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.flowDropsRow}>
                        {f.drops === 0
                          ? Array.from({ length: 3 }, (_, i) => (
                              <View key={i} style={[styles.flowDropOutline, { borderColor: f.color }]} />
                            ))
                          : Array.from({ length: f.drops }, (_, i) => (
                              <Droplet key={i} color={f.color} size={12} />
                            ))
                        }
                      </View>
                      <Text style={[styles.flowLabel, active && { color: f.color, fontFamily: F.uiSemiBold }]}>
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Energy + Stress ──────────────────────────────────────── */}
              <View style={styles.slidersRow}>
                <View style={styles.sliderSection}>
                  <View style={styles.sliderHeader}>
                    <MaterialCommunityIcons name="lightning-bolt" size={14} color={C.gold} />
                    <Text style={styles.sliderTitle}>Energy</Text>
                  </View>
                  <CycleSlider
                    value={energyLevel}
                    onChange={setEnergyLevel}
                    gradientColors={["#9277C8", "#F4A261"]}
                    labels={["Low", "Balanced", "High"]}
                  />
                </View>
                <View style={styles.sliderSection}>
                  <View style={styles.sliderHeader}>
                    <MaterialCommunityIcons name="flower-tulip-outline" size={14} color={C.pink} />
                    <Text style={styles.sliderTitle}>Stress</Text>
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
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="flower-pollen-outline" size={16} color={C.pink} />
                <Text style={styles.sectionTitle}>What are you experiencing?</Text>
              </View>
              <View style={styles.symptomsWrap}>
                {SYMPTOMS.map((s) => {
                  const active = selectedSymptoms.has(s.key);
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => toggleSymptom(s.key)}
                      style={({ pressed }) => [
                        styles.symptomPill,
                        active && { backgroundColor: s.color + "18", borderColor: s.color + "60" },
                        pressed && styles.pressed,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={s.icon}
                        size={14}
                        color={active ? s.color : C.muted}
                      />
                      <Text style={[styles.symptomLabel, active && { color: s.color, fontFamily: F.uiSemiBold }]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Body signals ─────────────────────────────────────────── */}
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="pulse" size={15} color={C.terracotta} />
                <Text style={styles.sectionTitle}>Body signals</Text>
              </View>
              <View style={styles.bodyGrid}>
                {BODY_SIGNALS.map((b) => (
                  <View
                    key={b.key}
                    style={styles.bodyCard}
                  >
                    <View style={styles.bodyIconBubble}>
                      <MaterialCommunityIcons name={b.icon} size={16} color={C.muted} />
                    </View>
                    <View>
                      <Text style={styles.bodyLabel}>{b.label}</Text>
                      <View style={styles.bodyValueRow}>
                        <View style={[styles.bodyDot, { backgroundColor: b.dot }]} />
                        <Text style={[styles.bodyValue, { color: b.dot }]}>{b.value}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* ── Journal moment ───────────────────────────────────────── */}
              <View style={styles.sectionHeader}>
                <Ionicons name="leaf-outline" size={15} color={C.sage} />
                <Text style={styles.sectionTitle}>Journal moment</Text>
                <Text style={styles.optionalLabel}>(optional)</Text>
              </View>
              <View style={styles.journalCard}>
                <TextInput
                  value={journalText}
                  onChangeText={setJournalText}
                  placeholder="Anything unusual today?"
                  placeholderTextColor={C.faint}
                  multiline
                  style={styles.journalInput}
                />
                <Ionicons
                  name="pencil"
                  size={16}
                  color={C.faint}
                  style={styles.journalIcon}
                />
              </View>

              {/* ── Done button ──────────────────────────────────────────── */}
              <Pressable
                onPress={handleSave}
                disabled={showSuccess}
                style={({ pressed }) => [styles.doneBtn, showSuccess && styles.doneBtnDisabled, pressed && !showSuccess && styles.pressed]}
              >
                <LinearGradient
                  colors={["#F4A261", "#E07A5F"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.doneBtnInner}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={C.white} />
                  <Text style={styles.doneBtnText}>Done</Text>
                </LinearGradient>
              </Pressable>

              <View style={{ height: 8 }} />
            </ScrollView>
            {showSuccess && (
              <Animated.View pointerEvents="none" style={[styles.successOverlay, { opacity: successOp }]}>
                <Animated.View style={[styles.successCard, { transform: [{ scale: bloopScale }] }]}>
                  <CachedImage source={imgBloop} style={styles.successBloop} />
                  <View style={styles.successCopy}>
                    <Text style={styles.successTitle}>Saved beautifully</Text>
                    <Text style={styles.successText}>Bloop logged your rhythm. You are all set.</Text>
                  </View>
                </Animated.View>
              </Animated.View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28,21,40,0.45)",
  },
  sheetWrap: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    height: SHEET_HEIGHT,
  },
  sheet: {
    backgroundColor: "#FFFDFB",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    backgroundColor: "#D4C8DC",
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
    color: C.lavender,
    fontSize: 13,
  },
  sectionTitle: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 15,
  },
  optionalLabel: {
    color: C.faint,
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
    borderColor: "rgba(196,184,212,0.30)",
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
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },

  // Flow
  flowGrid: {
    flexDirection: "row",
    gap: 8,
  },
  flowCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.80)",
    borderColor: "rgba(196,184,212,0.30)",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    height: 80,
    justifyContent: "center",
    gap: 8,
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
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },

  // Sliders
  slidersRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
    marginBottom: 2,
    backgroundColor: "rgba(255,255,255,0.80)",
    borderColor: "rgba(196,184,212,0.25)",
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
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 13,
  },

  // Symptoms
  symptomsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.80)",
    borderColor: "rgba(196,184,212,0.30)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  symptomLabel: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 12,
  },

  // Body signals
  bodyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  bodyCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.80)",
    borderColor: "rgba(196,184,212,0.25)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
    width: (W - 40 - 10) / 2,
  },
  bodyIconBubble: {
    alignItems: "center",
    backgroundColor: "rgba(196,184,212,0.15)",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  bodyLabel: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
    marginBottom: 2,
  },
  bodyValueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  bodyDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  bodyValue: {
    fontFamily: F.uiSemiBold,
    fontSize: 12,
  },

  // Journal
  journalCard: {
    backgroundColor: "rgba(255,255,255,0.70)",
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 72,
    padding: 14,
    position: "relative",
  },
  journalInput: {
    color: C.text,
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
    color: C.white,
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
    backgroundColor: "rgba(255,253,251,0.42)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  successCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: "rgba(255,255,255,0.98)",
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    maxWidth: 320,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },
  successBloop: {
    height: 44,
    width: 44,
  },
  successCopy: {
    flex: 1,
  },
  successTitle: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 15,
    marginBottom: 2,
  },
  successText: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 12,
    lineHeight: 17,
  },

  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
