import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../components/CachedImage";
import { F } from "../constants/fonts";
import { useSafeBack } from "../hooks/useSafeBack";

const { width: W } = Dimensions.get("window");
const SIDE = 20;

// ── Assets ────────────────────────────────────────────────────────────────────
const imgBloopHero    = require("../public/images/bloop-calm.webp");
const imgBloopVoice   = require("../public/images/bloop-voice.webp");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  text:       "#1C1528",
  muted:      "#8A7A9A",
  faint:      "#C4B8D4",
  terracotta: "#E07A5F",
  peach:      "#F4A261",
  lavender:   "#9277C8",
  rose:       "#D45C82",
  gold:       "#C9A040",
  sage:       "#5E9B6B",
  white:      "#FFFFFF",
} as const;

// ── Mood chips ────────────────────────────────────────────────────────────────
type MoodItem = {
  id:           string;
  label:        string;
  emoji:        string;
  selBg:        string;
  selBorder:    string;
  selText:      string;
};

const MOODS: MoodItem[] = [
  { id: "calm",        label: "Calm",        emoji: "😌", selBg: "#EDE8F8", selBorder: "#9277C8", selText: "#6B42BB" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "☁️", selBg: "#E8EEFF", selBorder: "#6878CC", selText: "#3A4AA0" },
  { id: "hopeful",     label: "Hopeful",     emoji: "✨", selBg: "#FFF5E0", selBorder: "#C9A040", selText: "#8A6A00" },
  { id: "drained",     label: "Drained",     emoji: "😔", selBg: "#FFF0E8", selBorder: "#D08040", selText: "#904020" },
  { id: "grateful",    label: "Grateful",    emoji: "💗", selBg: "#FDDDE8", selBorder: "#D45C82", selText: "#A03060" },
  { id: "sensitive",   label: "Sensitive",   emoji: "🌸", selBg: "#FFE8F2", selBorder: "#E07090", selText: "#A04060" },
];

// ── Reflection prompts ────────────────────────────────────────────────────────
type PromptItem = {
  id:        string;
  icon:      React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  text:      string;
  grad:      readonly [string, string];
  iconColor: string;
};

const PROMPTS: PromptItem[] = [
  { id: "smile", icon: "moon-waning-crescent",   text: "What made you smile today?",          grad: ["#EDE8F8", "#F3EEFB"], iconColor: "#9277C8" },
  { id: "heavy", icon: "weather-cloudy",          text: "What feels heavy lately?",            grad: ["#FDDDE8", "#FFE8F2"], iconColor: "#D45C82" },
  { id: "body",  icon: "white-balance-sunny",     text: "What does your body need right now?", grad: ["#FFF5E0", "#FFEED4"], iconColor: "#C9A040" },
  { id: "proud", icon: "leaf",                    text: "What are you proud of?",              grad: ["#E8F8EE", "#F2FFF6"], iconColor: "#5E9B6B" },
];

// ── Timeline data (last 6 days) ───────────────────────────────────────────────
const TIMELINE = [
  { date: 16, month: "May", mood: "😊", bg: "#EDE8F8", border: "#9277C8" },
  { date: 15, month: "May", mood: "😐", bg: "#FFF5E0", border: "#C9A040" },
  { date: 14, month: "May", mood: "😊", bg: "#E8F8EE", border: "#5E9B6B" },
  { date: 13, month: "May", mood: "😔", bg: "#FFF0E8", border: "#D08040" },
  { date: 12, month: "May", mood: "🌸", bg: "#FDDDE8", border: "#D45C82" },
  { date: 11, month: "May", mood: "✨", bg: "#EDE8F8", border: "#9277C8" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ── Screen ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export default function JournalScreen() {
  const safeBack = useSafeBack();

  const [selectedMood, setSelectedMood] = useState<string>("calm");
  const [entryText,    setEntryText]    = useState("");
  const [isRecording,  setIsRecording]  = useState(false);

  // ── Hero Bloop breathe ───────────────────────────────────────────────────
  const breathe   = useRef(new Animated.Value(1)).current;
  const floatY    = useRef(new Animated.Value(0)).current;
  const auraOp    = useRef(new Animated.Value(0.4)).current;

  // ── Mic pulse ────────────────────────────────────────────────────────────
  const micPulse  = useRef(new Animated.Value(1)).current;
  const micRing1  = useRef(new Animated.Value(1)).current;
  const micRing2  = useRef(new Animated.Value(1)).current;

  // ── Section fade-in ──────────────────────────────────────────────────────
  const sectionFade = useRef(new Animated.Value(0)).current;
  const sectionY    = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.ease);

    // Hero breathe + float
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1.07, duration: 3000, easing: ease, useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 1.00, duration: 3000, easing: ease, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(floatY, { toValue: -7, duration: 3400, easing: ease, useNativeDriver: true }),
          Animated.timing(floatY, { toValue: 0,  duration: 3400, easing: ease, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(auraOp, { toValue: 0.70, duration: 3000, easing: ease, useNativeDriver: true }),
          Animated.timing(auraOp, { toValue: 0.35, duration: 3000, easing: ease, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Mic idle pulse (subtle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1.08, duration: 1800, easing: ease, useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 1.00, duration: 1800, easing: ease, useNativeDriver: true }),
      ])
    ).start();

    // Mic rings expand-fade
    const ringLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1.6, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 1.0, duration: 0, useNativeDriver: true }),
        ])
      ).start();

    ringLoop(micRing1, 0);
    ringLoop(micRing2, 700);

    // Sections fade in
    Animated.parallel([
      Animated.timing(sectionFade, { toValue: 1, duration: 600, delay: 120, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(sectionY,   { toValue: 0, duration: 600, delay: 120, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>

      {/* ── Background gradient ── */}
      <LinearGradient
        colors={["#FCF8F7", "#F3EEFA", "#FEF0EA"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Ambient blobs ── */}
      <View style={s.blob1} pointerEvents="none" />
      <View style={s.blob2} pointerEvents="none" />
      <View style={s.blob3} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >

          {/* ──────────────── HEADER ──────────────── */}
          <View style={s.header}>

            {/* Back */}
            <Pressable
              onPress={safeBack}
              style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={21} color={C.text} />
            </Pressable>

            {/* Title */}
            <View style={s.headerCenter}>
              <Text style={s.headerTitle}>Journal</Text>
              <View style={s.headerUnderline}>
                <View style={s.headerLine} />
                <View style={s.headerDot} />
                <View style={s.headerLine} />
              </View>
            </View>

            {/* Calendar */}
            <Pressable
              style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
              accessibilityLabel="View calendar"
            >
              <MaterialCommunityIcons name="calendar-month-outline" size={20} color={C.muted} />
            </Pressable>

          </View>

          {/* ──────────────── HERO CARD ──────────────── */}
          <View style={s.heroCard}>
            <LinearGradient
              colors={["#F3E7FA", "#FCE3F0", "#FFEBE4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.heroGrad}
            >
              {/* Sparkle decorations */}
              <Text style={s.sparkle1}>✦</Text>
              <Text style={s.sparkle2}>·</Text>
              <Text style={s.sparkle3}>✦</Text>

              {/* Left text */}
              <View style={s.heroLeft}>
                <Text style={s.heroQuestion}>How are you{"\n"}feeling today?</Text>
                <Text style={s.heroSub}>This space is only yours. 🌸</Text>
              </View>

              {/* Right Bloop */}
              <View style={s.heroRight} pointerEvents="none">
                {/* Aura glow */}
                <Animated.View
                  style={[s.heroAura, { opacity: auraOp }]}
                />
                {/* Bloop */}
                <Animated.View
                  style={{ transform: [{ scale: breathe }, { translateY: floatY }] }}
                >
                  <CachedImage
                    source={imgBloopHero}
                    style={s.heroImage}
                    contentFit="contain"
                    priority="high"
                  />
                </Animated.View>
              </View>
            </LinearGradient>
          </View>

          <Animated.View style={{ opacity: sectionFade, transform: [{ translateY: sectionY }] }}>

            {/* ──────────────── MOOD CHIPS ──────────────── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.moodRow}
            >
              {MOODS.map((m) => {
                const active = selectedMood === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setSelectedMood(m.id)}
                    style={({ pressed }) => [
                      s.moodChip,
                      active && { backgroundColor: m.selBg, borderColor: m.selBorder },
                      pressed && s.pressed,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={s.moodEmoji}>{m.emoji}</Text>
                    <Text style={[s.moodLabel, active && { color: m.selText }]}>
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ──────────────── JOURNAL INPUT ──────────────── */}
            <View style={s.inputCard}>
              {/* Watermark botanical */}
              <MaterialCommunityIcons
                name="flower-outline"
                size={110}
                color="rgba(200,180,230,0.07)"
                style={s.inputWatermark}
              />
              <MaterialCommunityIcons
                name="leaf-circle-outline"
                size={72}
                color="rgba(180,210,190,0.07)"
                style={s.inputWatermark2}
              />

              {/* Text input */}
              <TextInput
                style={s.inputField}
                placeholder="Write what's on your heart…"
                placeholderTextColor="rgba(138,122,154,0.55)"
                multiline
                value={entryText}
                onChangeText={setEntryText}
                textAlignVertical="top"
              />

              {/* Bottom row */}
              <View style={s.inputBottom}>
                <View style={s.inputActions}>
                  <Pressable
                    style={({ pressed }) => [s.inputAction, pressed && s.pressed]}
                    accessibilityLabel="Add emoji"
                  >
                    <MaterialCommunityIcons name="emoticon-happy-outline" size={22} color={C.muted} />
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [s.inputAction, pressed && s.pressed]}
                    accessibilityLabel="Attach image"
                  >
                    <MaterialCommunityIcons name="image-outline" size={22} color={C.muted} />
                  </Pressable>
                </View>

                {/* Quill / save button */}
                <Pressable
                  style={({ pressed }) => [s.quillBtn, pressed && s.pressed]}
                  accessibilityLabel="Save entry"
                >
                  <LinearGradient
                    colors={["#C4AAEA", "#9277C8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.quillGrad}
                  >
                    <MaterialCommunityIcons name="feather" size={18} color={C.white} />
                  </LinearGradient>
                </Pressable>
              </View>
            </View>

            {/* ──────────────── VOICE REFLECTION ──────────────── */}
            <Pressable
              onPress={() => setIsRecording((v) => !v)}
              style={({ pressed }) => [s.voiceCard, pressed && s.pressed]}
              accessibilityLabel={isRecording ? "Stop recording" : "Start voice reflection"}
            >
              <LinearGradient
                colors={["#FFF5F2", "#FFEDE6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.voiceGrad}
              >
                {/* Mic orb */}
                <View style={s.micWrap}>
                  {/* Concentric rings */}
                  <Animated.View
                    style={[s.micRing, s.micRing1, {
                      opacity: isRecording ? 0.22 : 0.12,
                      transform: [{ scale: micRing1 }],
                    }]}
                    pointerEvents="none"
                  />
                  <Animated.View
                    style={[s.micRing, s.micRing2, {
                      opacity: isRecording ? 0.16 : 0.08,
                      transform: [{ scale: micRing2 }],
                    }]}
                    pointerEvents="none"
                  />
                  <Animated.View style={[s.micOrb, { transform: [{ scale: micPulse }] }]}>
                    <MaterialCommunityIcons
                      name="microphone"
                      size={26}
                      color={isRecording ? "#E07A5F" : "#D05040"}
                    />
                  </Animated.View>
                </View>

                {/* Center text + waveform */}
                <View style={s.voiceCenter}>
                  <Text style={s.voiceTitle}>Voice Reflection</Text>
                  <View style={s.voiceSubRow}>
                    <Text style={s.voiceSub}>
                      {isRecording ? "Recording…" : "Tap to record your thoughts"}
                    </Text>
                    {/* Decorative waveform */}
                    <View style={s.waveform} pointerEvents="none">
                      {[8, 14, 10, 18, 12, 16, 9, 14, 11].map((h, i) => (
                        <View
                          key={i}
                          style={[
                            s.waveBar,
                            {
                              height: isRecording ? h + Math.random() * 6 : h * 0.5,
                              opacity: isRecording ? 0.55 : 0.25,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                {/* Timer */}
                <Text style={s.voiceTimer}>00:00</Text>
              </LinearGradient>
            </Pressable>

            {/* ──────────────── REFLECTION PROMPTS ──────────────── */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Reflection prompts</Text>
              <Pressable
                style={({ pressed }) => [pressed && s.pressed]}
                accessibilityLabel="See all prompts"
              >
                <Text style={s.sectionLink}>See all →</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.promptsRow}
            >
              {PROMPTS.map((p) => (
                <Pressable
                  key={p.id}
                  style={({ pressed }) => [s.promptCard, pressed && s.pressed]}
                  accessibilityLabel={p.text}
                >
                  <LinearGradient
                    colors={p.grad}
                    style={s.promptGrad}
                  >
                    <View style={[s.promptIconWrap, { backgroundColor: `${p.iconColor}18` }]}>
                      <MaterialCommunityIcons name={p.icon} size={20} color={p.iconColor} />
                    </View>
                    <Text style={s.promptText}>{p.text}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>

            {/* ──────────────── JOURNAL TIMELINE ──────────────── */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Your journal timeline</Text>
              <Pressable
                style={({ pressed }) => [pressed && s.pressed]}
                accessibilityLabel="View all journal entries"
              >
                <Text style={s.sectionLink}>View all →</Text>
              </Pressable>
            </View>

            <View style={s.timelineWrap}>
              {/* Connecting line behind dots */}
              <View style={s.timelineLine} pointerEvents="none" />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.timelineRow}
              >
                {TIMELINE.map((day, i) => (
                  <Pressable
                    key={i}
                    style={({ pressed }) => [s.timelineItem, pressed && s.pressed]}
                    accessibilityLabel={`${day.mood} on ${day.date} ${day.month}`}
                  >
                    <View style={[s.timelineDot, { backgroundColor: day.bg, borderColor: day.border }]}>
                      <Text style={s.timelineEmoji}>{day.mood}</Text>
                    </View>
                    <Text style={s.timelineDate}>{day.date}</Text>
                    <Text style={s.timelineMonth}>{day.month}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Bottom spacer for action bar */}
            <View style={{ height: 100 }} />

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ──────────────── BOTTOM QUICK ACTIONS ──────────────── */}
      <View style={s.actionsBar} pointerEvents="box-none">
        <View style={s.actionsCard}>

          <Pressable
            style={({ pressed }) => [s.actionBtn, pressed && s.pressed]}
            accessibilityLabel="Save entry"
          >
            <View style={[s.actionIcon, { backgroundColor: "#EDE8F8" }]}>
              <MaterialCommunityIcons name="feather" size={16} color={C.lavender} />
            </View>
            <Text style={s.actionLabel}>Save Entry</Text>
          </Pressable>

          {/* Divider */}
          <View style={s.actionDivider} />

          <Pressable
            style={({ pressed }) => [s.actionBtn, pressed && s.pressed]}
            onPress={() => setIsRecording((v) => !v)}
            accessibilityLabel="Add voice note"
          >
            <View style={[s.actionIcon, { backgroundColor: "#FFF0E8" }]}>
              <MaterialCommunityIcons name="microphone-outline" size={16} color={C.terracotta} />
            </View>
            <Text style={s.actionLabel}>Voice Note</Text>
          </Pressable>

          {/* Divider */}
          <View style={s.actionDivider} />

          <Pressable
            style={({ pressed }) => [s.actionBtn, pressed && s.pressed]}
            accessibilityLabel="Add mood tag"
          >
            <View style={[s.actionIcon, { backgroundColor: "#FDDDE8" }]}>
              <MaterialCommunityIcons name="emoticon-outline" size={16} color={C.rose} />
            </View>
            <Text style={s.actionLabel}>Mood Tag</Text>
          </Pressable>

        </View>
      </View>

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Styles ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  // ── Screen ──────────────────────────────────────────────────────────────────
  screen: {
    flex:     1,
    overflow: "hidden",
  },

  // ── Ambient blobs ────────────────────────────────────────────────────────────
  blob1: {
    position:        "absolute",
    top:             -70,
    left:            -50,
    width:           220,
    height:          220,
    borderRadius:    110,
    backgroundColor: "rgba(200,180,240,0.18)",
  },
  blob2: {
    position:        "absolute",
    top:             280,
    right:           -80,
    width:           200,
    height:          200,
    borderRadius:    100,
    backgroundColor: "rgba(252,192,172,0.16)",
  },
  blob3: {
    position:        "absolute",
    bottom:          200,
    left:            -40,
    width:           180,
    height:          180,
    borderRadius:    90,
    backgroundColor: "rgba(189,220,200,0.12)",
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: {
    paddingTop:    10,
    paddingBottom: 20,
    gap:           18,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection:     "row",
    alignItems:        "center",
    paddingHorizontal: SIDE,
    paddingTop:        4,
  },
  avatarWrap: {
    width:        44,
    height:       44,
    borderRadius: 22,
    overflow:     "visible",
    position:     "relative",
    shadowColor:  "#C8A0D0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation:    4,
  },
  avatarImg: {
    width:        44,
    height:       44,
    borderRadius: 22,
    borderWidth:  2,
    borderColor:  "rgba(255,255,255,0.90)",
  },
  avatarFlower: {
    position:        "absolute",
    bottom:          -2,
    right:           -2,
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: C.white,
    alignItems:      "center",
    justifyContent:  "center",
  },
  headerCenter: {
    flex:       1,
    alignItems: "center",
    gap:        5,
  },
  headerTitle: {
    fontFamily:    F.luxuryBold,       // PlayfairDisplay Bold — screen title
    fontSize:      26,
    lineHeight:    32,
    color:         C.text,
    letterSpacing: 0.3,
  },
  headerUnderline: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           5,
  },
  headerLine: {
    width:           22,
    height:          1,
    backgroundColor: "rgba(224,122,95,0.30)",
    borderRadius:    1,
  },
  headerDot: {
    width:           5,
    height:          5,
    borderRadius:    3,
    backgroundColor: C.terracotta,
    opacity:         0.70,
  },
  headerBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth:     1,
    borderColor:     "rgba(255,255,255,0.88)",
    alignItems:      "center",
    justifyContent:  "center",
    shadowColor:     "#D6C3B9",
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.26,
    shadowRadius:    10,
    elevation:       3,
  },

  // ── Hero card ────────────────────────────────────────────────────────────────
  heroCard: {
    marginHorizontal: SIDE,
    borderRadius:     28,
    overflow:         "hidden",
    shadowColor:      "#C8A0C8",
    shadowOffset:     { width: 0, height: 10 },
    shadowOpacity:    0.22,
    shadowRadius:     24,
    elevation:        6,
  },
  heroGrad: {
    flexDirection:  "row",
    alignItems:     "center",
    paddingLeft:    22,
    paddingRight:   8,
    paddingVertical: 22,
    minHeight:      160,
    overflow:       "hidden",
  },
  heroLeft: {
    flex: 1,
    gap:  8,
  },
  heroQuestion: {
    fontFamily:    F.luxuryBold,       // PlayfairDisplay Bold — emotional hero question
    fontSize:      22,
    lineHeight:    30,
    color:         C.text,
    letterSpacing: 0.1,
  },
  heroSub: {
    fontFamily: F.uiMedium,            // Nunito Medium — supporting tagline
    fontSize:   13,
    lineHeight: 18,
    color:      "#8A6898",
  },
  heroRight: {
    width:          130,
    height:         130,
    alignItems:     "center",
    justifyContent: "center",
  },
  heroAura: {
    position:        "absolute",
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  heroImage: {
    width:  118,
    height: 118,
  },

  // Sparkle decorations on hero
  sparkle1: {
    position:   "absolute",
    top:        14,
    right:      56,
    fontSize:   11,
    color:      "rgba(180,130,210,0.55)",
  },
  sparkle2: {
    position:   "absolute",
    top:        38,
    right:      30,
    fontSize:   18,
    color:      "rgba(200,160,240,0.40)",
  },
  sparkle3: {
    position:   "absolute",
    bottom:     18,
    right:      52,
    fontSize:   9,
    color:      "rgba(200,140,200,0.50)",
  },

  // ── Mood chips ───────────────────────────────────────────────────────────────
  moodRow: {
    paddingHorizontal: SIDE,
    gap:               10,
    paddingVertical:   2,
  },
  moodChip: {
    alignItems:      "center",
    justifyContent:  "center",
    paddingVertical:   12,
    paddingHorizontal: 14,
    borderRadius:    18,
    borderWidth:     1.5,
    borderColor:     "rgba(255,255,255,0.80)",
    backgroundColor: "rgba(255,255,255,0.72)",
    shadowColor:     "#D6C3B9",
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.22,
    shadowRadius:    10,
    elevation:       3,
    minWidth:        70,
    gap:             5,
  },
  moodEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  moodLabel: {
    fontFamily: F.uiSemiBold,          // Nunito SemiBold — mood chip labels
    fontSize:   11,
    lineHeight: 15,
    color:      C.muted,
  },

  // ── Journal input ─────────────────────────────────────────────────────────────
  inputCard: {
    marginHorizontal: SIDE,
    borderRadius:     24,
    borderWidth:      1,
    borderColor:      "rgba(255,255,255,0.88)",
    backgroundColor:  "rgba(255,255,255,0.78)",
    padding:          18,
    minHeight:        160,
    overflow:         "hidden",
    justifyContent:   "space-between",
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 8 },
    shadowOpacity:    0.28,
    shadowRadius:     20,
    elevation:        4,
    gap:              14,
  },
  inputWatermark: {
    position: "absolute",
    bottom:   -10,
    right:    -10,
  },
  inputWatermark2: {
    position: "absolute",
    bottom:   40,
    right:    60,
  },
  inputField: {
    fontFamily:  F.uiRegular,          // Nunito Regular — journal body text
    fontSize:    15,
    lineHeight:  24,
    color:       C.text,
    flex:        1,
    minHeight:   90,
    paddingTop:  0,
  },
  inputBottom: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginTop:      4,
  },
  inputActions: {
    flexDirection: "row",
    gap:           16,
    alignItems:    "center",
  },
  inputAction: {
    width:           36,
    height:          36,
    borderRadius:    18,
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "rgba(255,255,255,0.70)",
  },
  quillBtn: {
    borderRadius: 22,
    shadowColor:  C.lavender,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation:    5,
  },
  quillGrad: {
    width:          44,
    height:         44,
    borderRadius:   22,
    alignItems:     "center",
    justifyContent: "center",
  },

  // ── Voice reflection ─────────────────────────────────────────────────────────
  voiceCard: {
    marginHorizontal: SIDE,
    borderRadius:     24,
    overflow:         "hidden",
    shadowColor:      "#E8C4B4",
    shadowOffset:     { width: 0, height: 8 },
    shadowOpacity:    0.26,
    shadowRadius:     18,
    elevation:        4,
  },
  voiceGrad: {
    flexDirection:  "row",
    alignItems:     "center",
    padding:        16,
    gap:            14,
    minHeight:      82,
  },
  micWrap: {
    width:          60,
    height:         60,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  micRing: {
    position:        "absolute",
    borderRadius:    999,
    backgroundColor: "#E07A5F",
  },
  micRing1: {
    width:  60,
    height: 60,
  },
  micRing2: {
    width:  60,
    height: 60,
  },
  micOrb: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth:     1,
    borderColor:     "rgba(255,255,255,0.95)",
    alignItems:      "center",
    justifyContent:  "center",
    shadowColor:     "#E07A5F",
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.22,
    shadowRadius:    10,
    elevation:       3,
  },
  voiceCenter: {
    flex: 1,
    gap:  4,
  },
  voiceTitle: {
    fontFamily: F.uiBold,             // Nunito Bold — "Voice Reflection"
    fontSize:   15,
    lineHeight: 20,
    color:      C.text,
  },
  voiceSubRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
    flexWrap:      "nowrap",
  },
  voiceSub: {
    fontFamily: F.uiRegular,          // Nunito Regular — supporting text
    fontSize:   12,
    lineHeight: 16,
    color:      C.muted,
    flexShrink: 1,
  },
  waveform: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            2,
    height:         20,
  },
  waveBar: {
    width:           3,
    borderRadius:    2,
    backgroundColor: C.terracotta,
  },
  voiceTimer: {
    fontFamily: F.uiMedium,           // Nunito Medium — recording timer
    fontSize:   13,
    lineHeight: 18,
    color:      C.muted,
    flexShrink: 0,
  },

  // ── Section headers ───────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    paddingHorizontal: SIDE,
  },
  sectionTitle: {
    fontFamily:    F.uiExtraBold,     // Nunito ExtraBold — section label
    fontSize:      16,
    lineHeight:    22,
    color:         C.text,
    letterSpacing: 0.1,
  },
  sectionLink: {
    fontFamily: F.uiSemiBold,        // Nunito SemiBold — action link
    fontSize:   13,
    lineHeight: 18,
    color:      C.lavender,
  },

  // ── Reflection prompts ───────────────────────────────────────────────────────
  promptsRow: {
    paddingHorizontal: SIDE,
    gap:               12,
    paddingVertical:   4,
  },
  promptCard: {
    width:        (W - SIDE * 2 - 36) / 4,
    minWidth:     118,
    borderRadius: 20,
    overflow:     "hidden",
    shadowColor:  "#D6C3B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 14,
    elevation:    3,
  },
  promptGrad: {
    padding:        14,
    minHeight:      130,
    justifyContent: "space-between",
    gap:            10,
  },
  promptIconWrap: {
    width:          36,
    height:         36,
    borderRadius:   12,
    alignItems:     "center",
    justifyContent: "center",
  },
  promptText: {
    fontFamily:  F.uiSemiBold,        // Nunito SemiBold — prompt question
    fontSize:    12,
    lineHeight:  17,
    color:       C.text,
  },

  // ── Timeline ─────────────────────────────────────────────────────────────────
  timelineWrap: {
    paddingHorizontal: SIDE,
    position:          "relative",
  },
  timelineLine: {
    position:        "absolute",
    top:             38,               // vertically center through the dot circles (32/2 + 22 top offset)
    left:            SIDE + 22,
    right:           SIDE + 22,
    height:          1,
    backgroundColor: "rgba(200,180,230,0.30)",
    borderRadius:    1,
    zIndex:          0,
  },
  timelineRow: {
    flexDirection: "row",
    gap:           0,
    justifyContent: "space-between",
    width:         "100%",
    paddingBottom:  4,
  },
  timelineItem: {
    alignItems:  "center",
    gap:         5,
    flex:        1,
    zIndex:      1,
  },
  timelineDot: {
    width:        40,
    height:       40,
    borderRadius: 20,
    borderWidth:  1.5,
    alignItems:   "center",
    justifyContent: "center",
    shadowColor:  "#D6C3B9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation:    3,
    backgroundColor: C.white,
  },
  timelineEmoji: {
    fontSize:   17,
    lineHeight: 22,
  },
  timelineDate: {
    fontFamily:  F.uiBold,            // Nunito Bold — date number
    fontSize:    13,
    lineHeight:  17,
    color:       C.text,
  },
  timelineMonth: {
    fontFamily:  F.uiLight,           // Nunito Light — month label
    fontSize:    10,
    lineHeight:  13,
    color:       C.muted,
  },

  // ── Bottom quick actions ──────────────────────────────────────────────────────
  actionsBar: {
    position:          "absolute",
    bottom:            0,
    left:              0,
    right:             0,
    paddingHorizontal: SIDE,
    paddingBottom:     24,
    paddingTop:        10,
    backgroundColor:   "rgba(252,248,247,0.90)",
    borderTopWidth:    1,
    borderTopColor:    "rgba(255,255,255,0.80)",
  },
  actionsCard: {
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius:    30,
    borderWidth:     1,
    borderColor:     "rgba(255,255,255,0.92)",
    paddingVertical:   10,
    paddingHorizontal: 8,
    shadowColor:     "#D6C3B9",
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.28,
    shadowRadius:    20,
    elevation:       6,
  },
  actionBtn: {
    flex:           1,
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            7,
    paddingVertical: 6,
  },
  actionIcon: {
    width:          30,
    height:         30,
    borderRadius:   15,
    alignItems:     "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontFamily: F.uiBold,             // Nunito Bold — action label
    fontSize:   12,
    lineHeight: 16,
    color:      C.text,
  },
  actionDivider: {
    width:           1,
    height:          28,
    backgroundColor: "rgba(200,180,220,0.25)",
    borderRadius:    1,
  },

  // ── Shared ───────────────────────────────────────────────────────────────────
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});

