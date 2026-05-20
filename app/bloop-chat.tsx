/**
 * Bloop Chat — AI Companion Chat Interface
 * Premium women's wellness chat experience.
 * SVG-generated mascot (no 3D asset needed).
 * Reanimated waveform + voice panel.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
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
import {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
  Svg,
} from "react-native-svg";
import { F } from "../constants/fonts";
import { useSafeBack } from "../hooks/useSafeBack";

const { width: W } = Dimensions.get("window");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg1:      "#FFF8F8",
  bg2:      "#FCF2F7",
  bg3:      "#F4EAF7",
  text:     "#161C2D",
  muted:    "#9B8EAB",
  faint:    "#D4C8E0",
  lavender: "#9277C8",
  purple:   "#8B63D6",
  deepPurple:"#5A3B8B",
  pink:     "#D45C82",
  sage:     "#5E9B6B",
  green:    "#82D0A4",
  white:    "#FFFFFF",
  cardBg:   "rgba(255,255,255,0.78)",
  cardBdr:  "rgba(255,255,255,0.92)",
  userBubble: "#EEDDFF",
} as const;

// ── SVG Bloop mascot ──────────────────────────────────────────────────────────
function BloopMascot() {
  const S = 180;
  const cx = S / 2;
  const cy = S / 2 + 4;

  // Body path — plump rounded organic blob
  const body =
    `M ${cx} 24` +
    ` C ${cx + 38} 22, ${cx + 68} 46, ${cx + 70} 82` +
    ` C ${cx + 72} 118, ${cx + 56} 156, ${cx + 28} 168` +
    ` C ${cx + 12} 176, ${cx - 12} 176, ${cx - 28} 168` +
    ` C ${cx - 56} 156, ${cx - 72} 118, ${cx - 70} 82` +
    ` C ${cx - 68} 46, ${cx - 38} 22, ${cx} 24 Z`;

  // Heart path centred at (cx, 155)
  const hx = cx, hy = 155, hs = 14;
  const heart =
    `M ${hx} ${hy + hs}` +
    ` C ${hx - hs * 1.4} ${hy + hs * 0.6}, ${hx - hs * 2} ${hy - hs * 0.4}, ${hx - hs * 2} ${hy - hs * 0.9}` +
    ` C ${hx - hs * 2} ${hy - hs * 1.7}, ${hx - hs * 0.8} ${hy - hs * 2.0}, ${hx} ${hy - hs * 0.8}` +
    ` C ${hx + hs * 0.8} ${hy - hs * 2.0}, ${hx + hs * 2} ${hy - hs * 1.7}, ${hx + hs * 2} ${hy - hs * 0.9}` +
    ` C ${hx + hs * 2} ${hy - hs * 0.4}, ${hx + hs * 1.4} ${hy + hs * 0.6}, ${hx} ${hy + hs} Z`;

  return (
    <Svg width={S} height={S + 20}>
      <Defs>
        {/* Outer aura */}
        <SvgRadialGradient id="aura" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#E4D5FF" stopOpacity="0.38" />
          <Stop offset="60%"  stopColor="#F0E5FF" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#F0E5FF" stopOpacity="0"    />
        </SvgRadialGradient>
        {/* Body gradient */}
        <SvgGradient id="body" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0%"   stopColor="#D8B8F8" stopOpacity="1" />
          <Stop offset="50%"  stopColor="#B490E0" stopOpacity="1" />
          <Stop offset="100%" stopColor="#8C65CA" stopOpacity="1" />
        </SvgGradient>
        {/* Heart glow */}
        <SvgRadialGradient id="hglow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#FFD6E8" stopOpacity="0.80" />
          <Stop offset="100%" stopColor="#FFD6E8" stopOpacity="0"    />
        </SvgRadialGradient>
      </Defs>

      {/* Outer aura halo */}
      <Circle cx={cx} cy={cy} r={S * 0.48} fill="url(#aura)" />

      {/* Body */}
      <Path d={body} fill="url(#body)" />

      {/* Left arm */}
      <Path
        d={`M ${cx - 60} 118 Q ${cx - 42} 134 ${cx - 24} 148`}
        stroke="#9A72CC"
        strokeWidth={20}
        strokeLinecap="round"
        fill="none"
      />
      {/* Right arm */}
      <Path
        d={`M ${cx + 60} 118 Q ${cx + 42} 134 ${cx + 24} 148`}
        stroke="#9A72CC"
        strokeWidth={20}
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyes — closed peaceful arcs */}
      <Path
        d={`M ${cx - 28} 90 Q ${cx - 20} 83 ${cx - 12} 90`}
        stroke={C.deepPurple}
        strokeWidth={2.8}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M ${cx + 12} 90 Q ${cx + 20} 83 ${cx + 28} 90`}
        stroke={C.deepPurple}
        strokeWidth={2.8}
        fill="none"
        strokeLinecap="round"
      />

      {/* Rosy cheeks */}
      <Circle cx={cx - 40} cy={100} r={12} fill="rgba(255,140,165,0.28)" />
      <Circle cx={cx + 40} cy={100} r={12} fill="rgba(255,140,165,0.28)" />

      {/* Heart glow */}
      <Circle cx={hx} cy={hy} r={22} fill="url(#hglow)" />
      <Circle cx={hx} cy={hy} r={14} fill="rgba(255,225,238,0.70)" />

      {/* Heart */}
      <Path d={heart} fill={C.white} opacity={0.92} />

      {/* Specular highlight on body */}
      <Circle cx={cx - 24} cy={48} r={9} fill="rgba(255,255,255,0.28)" />
      <Circle cx={cx - 18} cy={44} r={4} fill="rgba(255,255,255,0.48)" />
    </Svg>
  );
}

// ── Insight orb (small glowing sphere for insight card) ───────────────────────
function InsightOrb() {
  const S = 52;
  return (
    <Svg width={S} height={S}>
      <Defs>
        <SvgRadialGradient id="orb" cx="38%" cy="35%" r="65%" fx="38%" fy="35%">
          <Stop offset="0%"   stopColor="#FFD6F0" stopOpacity="1" />
          <Stop offset="40%"  stopColor="#C4A0E8" stopOpacity="1" />
          <Stop offset="100%" stopColor="#F4A261" stopOpacity="1" />
        </SvgRadialGradient>
        <SvgRadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#C4A0E8" stopOpacity="0.45" />
          <Stop offset="100%" stopColor="#C4A0E8" stopOpacity="0"    />
        </SvgRadialGradient>
      </Defs>
      <Circle cx={S / 2} cy={S / 2} r={S / 2} fill="url(#orbGlow)" />
      <Circle cx={S / 2} cy={S / 2} r={S * 0.36} fill="url(#orb)" />
      {/* Star sparks */}
      <Circle cx={S * 0.22} cy={S * 0.22} r={2.2} fill="rgba(255,200,230,0.90)" />
      <Circle cx={S * 0.80} cy={S * 0.28} r={1.6} fill="rgba(255,200,230,0.70)" />
    </Svg>
  );
}

// ── Animated wave bar ─────────────────────────────────────────────────────────
function WaveBar({
  phase,
  active,
}: {
  phase: number;
  active: boolean;
}) {
  const height = active ? 6 + 20 * Math.abs(Math.sin(phase)) : 6;
  return (
    <View
      style={[
        styles.waveBar,
        { backgroundColor: active ? "rgba(146,119,200,0.55)" : "rgba(196,184,212,0.30)" },
        { height },
      ]}
    />
  );
}

// ── Chat data ─────────────────────────────────────────────────────────────────
const INITIAL_MESSAGES = [
  {
    id:   "1",
    role: "bloop" as const,
    text: "Hi gorgeous, I'm here for you 💜\nHow are you feeling today?",
    time: null,
    read: false,
  },
  {
    id:   "2",
    role: "user" as const,
    text: "I've been feeling anxious lately.",
    time: "9:40 AM",
    read: true,
  },
  {
    id:   "3",
    role: "bloop" as const,
    text: "I'm here with you. I've noticed your stress has been a bit high this week. Want to try a calming reset together?",
    time: null,
    read: false,
  },
];

const SUGGESTION_CHIPS = [
  { key: "anxious",   label: "I feel anxious",    icon: "heart-outline"          as const, color: C.pink      },
  { key: "sleep",     label: "Help me sleep",     icon: "moon-waning-crescent"   as const, color: C.lavender  },
  { key: "cycle",     label: "Explain my cycle",  icon: "sync-circle"            as const, color: C.lavender  },
  { key: "calm",      label: "Calm my thoughts",  icon: "cloud-outline"          as const, color: C.muted     },
  { key: "emotional", label: "Emotional reset",   icon: "leaf-maple"             as const, color: C.sage      },
] as const;

const CHIP_REPLIES: Record<string, string> = {
  anxious: "Tiny reset, big energy. Put one hand on your chest and take three slow breaths with me.",
  sleep: "Sleep mode loading softly. Dim lights, sip water, and let your brain clock out.",
  cycle: "Cycle detective era. Tell me your day number or symptoms and I will decode the pattern.",
  calm: "Thought traffic is loud today. Let's park one worry at a time.",
  emotional: "Soft reboot time. You are not too much, your body is just asking for care."
};

type BloopRouteParams = {
  prompt?: string | string[];
  source?: string | string[];
  autoSend?: string | string[];
  message?: string | string[];
  initialMessage?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isTruthyParam(value?: string) {
  return value === "true" || value === "1" || value === "yes";
}

function formatSourceLabel(source?: string) {
  if (!source) return "";

  const knownSources: Record<string, string> = {
    sleep: "From Sleep",
    "emotional-wellness": "From Emotional Wellness",
    emotionalWellness: "From Emotional Wellness",
    cycle: "From Cycle",
    wellness: "From Care Space",
    nourish: "From Nourish",
    insights: "From Insights",
  };

  if (knownSources[source]) return knownSources[source];

  const label = source
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return `From ${label}`;
}

// ── Rich auto-reply engine — keyword-matched, warm, specific ─────────────────
function getBloopReply(text: string, sourceLabel = ""): string {
  const t = text.toLowerCase();
  const from = sourceLabel ? `${sourceLabel.replace("From ", "from ")}. ` : "";

  // Greetings / small talk
  if (/^(hi|hey|hello|hii|heyyy|sup|yo)\b/.test(t))
    return "Hey you 💜 I'm right here. How are you feeling in your body today — any tension, tiredness, or something on your mind?";

  if (t.includes("how are you") || t.includes("how r u"))
    return "I'm fully present for you right now 🌸 More importantly — how are *you*? What does your body need today?";

  if (/\b(good|great|fine|okay|ok|well)\b/.test(t) && t.length < 20)
    return "So glad to hear that 🌿 Even on good days, checking in with yourself is powerful. Anything you'd like to notice or celebrate today?";

  // Anxiety / stress
  if (t.includes("anxious") || t.includes("anxiety") || t.includes("panic") || t.includes("nervous"))
    return `${from}Anxiety often lives in the body before it reaches the mind. Right now: unclench your jaw, drop your shoulders, and take one slow exhale through your mouth. You don't have to fix anything in this moment — just soften one thing. What's sitting heaviest right now?`;

  if (t.includes("stress") || t.includes("stressed") || t.includes("overwhelm"))
    return `${from}Your nervous system is asking for a pause. When stress piles up, even 90 seconds of slow breathing can shift your body out of fight-or-flight. Would you like a quick 4-7-8 breath guide, or do you just need to talk it out?`;

  // Mood / emotional
  if (t.includes("sad") || t.includes("upset") || t.includes("cry") || t.includes("crying"))
    return "Tears are data, not weakness 💙 Your body knows something that needs to move. I'm here — tell me what's going on. You don't need to summarise it neatly.";

  if (t.includes("happy") || t.includes("excited") || t.includes("joy"))
    return "This is beautiful — your nervous system is in a safe, open state right now 🌟 This is actually the best time to set an intention or log what made today feel good. Want to capture this feeling?";

  if (t.includes("tired") || t.includes("exhausted") || t.includes("fatigue") || t.includes("energy"))
    return `${from}Tiredness can mean so many different things — physical depletion, emotional heaviness, or hormonal shifts. Where does it feel most in your body? I can suggest something specific based on where you are in your cycle.`;

  if (t.includes("angry") || t.includes("frustrat") || t.includes("irritat"))
    return "That fire you're feeling is valid 🔥 Progesterone and estrogen shifts in the late luteal phase can amplify irritability significantly. When did it start? Knowing your cycle day can help us figure out if this is hormonal — or something to address differently.";

  if (t.includes("lonely") || t.includes("alone") || t.includes("nobody"))
    return "I hear you, and I want you to know — reaching out here counts 💜 Loneliness often peaks in the luteal phase when your body naturally craves more rest and connection. What would feel most comforting right now — talking, a calming activity, or something gentle to do?";

  // Sleep
  if (t.includes("sleep") || t.includes("insomnia") || t.includes("can't sleep") || t.includes("wake up"))
    return `${from}Sleep and hormones are deeply connected. Progesterone has a natural sedative quality, but when it drops before your period, sleep quality often dips. Try this tonight: keep your room at 18°C, avoid screens for 20 min before bed, and try 4-7-8 breathing. What time do you usually wind down?`;

  if (t.includes("nightmare") || t.includes("dream"))
    return "Vivid dreams and nightmares often spike in the luteal phase when progesterone peaks then drops. Your brain is more emotionally active. Journaling before sleep can reduce the intensity — it gives your brain somewhere to 'file' things. Want me to guide you through a short evening release?";

  // Cycle / hormones
  if (t.includes("period") || t.includes("menstrual") || t.includes("bleed"))
    return `${from}Your period is actually a fifth vital sign — it tells us so much about your overall health. Is it arriving on time, or has the timing or flow changed? Tell me more and I can help you decode what your body's signalling.`;

  if (t.includes("cramp") || t.includes("pain") || t.includes("ache"))
    return "Cramps are caused by prostaglandins — the same chemicals that help your uterus shed its lining. Omega-3 foods like salmon and walnuts, heat therapy, and magnesium glycinate can all help. How intense is the pain on a scale of 1-10, and where exactly are you feeling it?";

  if (t.includes("pcos") || t.includes("endometriosis") || t.includes("endo"))
    return `${from}I see you 💜 Living with PCOS or endometriosis means your body needs extra care, not extra pressure. Tracking patterns — energy, pain, mood — helps you predict flare-ups and advocate for yourself with doctors. What's happening today that you'd like to understand better?`;

  if (t.includes("ovulat") || t.includes("fertile") || t.includes("fertility"))
    return `${from}Ovulation is your body's monthly power surge — energy, confidence, and libido often peak here because estrogen and LH are highest. Your fertile window is typically 5 days before ovulation plus ovulation day itself. Would you like to understand how to track it more precisely?`;

  if (t.includes("cycle") || t.includes("hormone") || t.includes("phase"))
    return `${from}Your cycle has four distinct phases — menstrual, follicular, ovulatory, and luteal — and each one affects your energy, mood, focus, and appetite differently. Which phase do you want to understand better? Or tell me your cycle day and I'll decode exactly where you are.`;

  // Nutrition / nourish
  if (t.includes("food") || t.includes("eat") || t.includes("diet") || t.includes("nourish") || t.includes("nutrition"))
    return `${from}What you eat genuinely shifts your hormones. During your follicular phase, cruciferous vegetables support estrogen metabolism. In the luteal phase, magnesium-rich dark chocolate and leafy greens reduce PMS. What phase are you in right now, and what does your body seem to be craving?`;

  if (t.includes("water") || t.includes("hydrat") || t.includes("drink"))
    return "Hydration is underrated for hormonal health 💧 Even mild dehydration amplifies fatigue, brain fog, and cramps. Your target: roughly 2.7 litres daily, more in the luteal phase and around your period. Are you managing to hit that most days?";

  if (t.includes("weight") || t.includes("bloat"))
    return "Cycle-related weight fluctuations of 1-3kg are completely normal — especially before your period when progesterone causes water retention. This isn't fat gain; it resolves within a few days of your period starting. Are you tracking this across your cycle, or does it feel unpredictable?";

  // Movement / yoga
  if (t.includes("exercise") || t.includes("workout") || t.includes("gym") || t.includes("yoga") || t.includes("move"))
    return `${from}Your best workouts actually depend on your cycle phase. Follicular and ovulatory phases are ideal for high-intensity training. Luteal phase is better for strength and moderate effort. Your period is designed for rest and gentle movement. Which phase are you in — I can give you a specific recommendation.`;

  // Skin / body
  if (t.includes("skin") || t.includes("acne") || t.includes("breakout"))
    return "Hormonal acne typically appears around the jaw and chin, and spikes in the week before your period as progesterone surges. Reducing dairy and refined sugar, staying hydrated, and a consistent skincare routine all help. When in your cycle do you notice it most?";

  // Gratitude / journaling
  if (t.includes("gratitude") || t.includes("journal") || t.includes("reflect"))
    return "Journalling is one of the most evidence-backed tools for emotional regulation 📝 Just three things you're grateful for can measurably shift cortisol levels. Would you like a guided prompt for today, or do you prefer to free-write?";

  // Meditation / breathing
  if (t.includes("meditat") || t.includes("breath") || t.includes("calm") || t.includes("relax"))
    return "Let's do this together 🌬️ Try box breathing: breathe in for 4 counts, hold for 4, out for 4, hold for 4. Repeat three times. Your heart rate and cortisol will measurably drop. Want me to guide you through a full 2-minute reset right now?";

  // Questions / help
  if (t.includes("help") || t.includes("what should") || t.includes("what do") || t.includes("how do"))
    return `${from}I'm here to help you figure this out gently 🌸 Can you tell me a bit more? The more specific you are, the more personalised I can make this for you — whether it's your cycle phase, a symptom you're noticing, or an emotion you're sitting with.`;

  // Thanks
  if (t.includes("thank") || t.includes("thanks") || t.includes("thx"))
    return "Always here for you 💜 You deserve support that actually understands your body. Is there anything else on your mind today?";

  // Fallback — warm and open-ended
  const fallbacks = [
    `${from}I hear you 💜 Tell me more — what does your body feel like right now, and how long have you been feeling this way?`,
    `${from}That makes sense to sit with. Your feelings are valid data about what your body and mind need. What would feel most supportive right now?`,
    `${from}I'm with you. Let's take this one gentle step at a time. What feels like the heaviest thing to carry today?`,
    `${from}Your wellbeing matters deeply. Can you tell me a little more so I can give you something truly useful, not just generic advice?`,
  ];
  return fallbacks[Math.abs(text.length) % fallbacks.length];
}

// Keep for route-context replies (already good, now also used internally)
function getContextualReply(prompt: string, sourceLabel: string) {
  return getBloopReply(prompt, sourceLabel);
}

const BOTTOM_ACTIONS = [
  { key: "ground", label: "Grounding", icon: "sprout-outline"        as const },
  { key: "breath", label: "Breath",    icon: "equalizer-outline"     as const, lib: "ion" },
  { key: "support",label: "I need support", icon: "heart-circle-outline" as const },
] as const;

// ── Wave bar count ────────────────────────────────────────────────────────────
const WAVE_BARS = 9;
const WAVE_PHASES = Array.from({ length: WAVE_BARS * 2 }, (_, i) => i * 0.45);

// ─────────────────────────────────────────────────────────────────────────────
export default function BloopChatScreen() {
  const router    = useRouter();
  const params    = useLocalSearchParams<BloopRouteParams>();
  const safeBack  = useSafeBack();
  const scrollRef = useRef<ScrollView>(null);
  const handledPromptRef = useRef<string | null>(null);

  const [inputText,    setInputText]    = useState("");
  const [isTalking,    setIsTalking]    = useState(false);
  const [activeChip,   setActiveChip]   = useState<string | null>(null);
  const [messages,     setMessages]     = useState(INITIAL_MESSAGES);
  const [insightOpen,  setInsightOpen]  = useState(false);
  const [bloopTyping,  setBloopTyping]  = useState(false);

  const routePrompt =
    firstParam(params.prompt) ??
    firstParam(params.message) ??
    firstParam(params.initialMessage) ??
    "";
  const sourceLabel = formatSourceLabel(firstParam(params.source));
  const shouldAutoSend = isTruthyParam(firstParam(params.autoSend));

  useEffect(() => {
    const prompt = routePrompt.trim();
    if (!prompt) return;

    const key = `${prompt}|${sourceLabel}|${shouldAutoSend}`;
    if (handledPromptRef.current === key) return;
    handledPromptRef.current = key;

    if (shouldAutoSend) {
      const now = Date.now();
      setMessages((prev) => [
        ...prev,
        { id: `${now}-route-user`, role: "user", text: prompt, time: "Just now", read: false },
        { id: `${now}-route-bloop`, role: "bloop", text: getContextualReply(prompt, sourceLabel), time: null, read: false },
      ]);
      setInputText("");
    } else {
      setInputText(prompt);
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 140);
  }, [routePrompt, shouldAutoSend, sourceLabel]);

  const toggleTalk = () => {
    setIsTalking((v) => !v);
  };

  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed || bloopTyping) return;

    const userId = `${Date.now()}-user`;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", text: trimmed, time: "Just now", read: false },
    ]);
    setInputText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

    // Show typing indicator then deliver reply
    setBloopTyping(true);
    const delay = 800 + Math.min(trimmed.length * 18, 1200); // 0.8-2s based on message length
    setTimeout(() => {
      setBloopTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bloop`,
          role: "bloop",
          text: getBloopReply(trimmed),
          time: null,
          read: false,
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, delay);
  };

  const addEmoji = () => {
    setInputText((current) => `${current}${current ? " " : ""}💗`);
  };

  const handleSuggestion = (chip: (typeof SUGGESTION_CHIPS)[number]) => {
    setActiveChip(chip.key);
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", text: chip.label, time: "Just now", read: false },
      { id: `${Date.now()}-bloop`, role: "bloop", text: CHIP_REPLIES[chip.key], time: null, read: false },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      {/* Background */}
      <LinearGradient
        colors={[C.bg1, C.bg2, C.bg3]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={safeBack}
            style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={20} color={C.text} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerName}>Bloop</Text>
            <View style={styles.headerStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerStatus}>{sourceLabel || "Listening gently"}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isTalking ? "Stop voice mode" : "Start voice mode"}
              onPress={toggleTalk}
              style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="waveform" size={18} color={C.muted} />
            </Pressable>
            <View style={styles.headerBtn} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={C.muted} />
            </View>
          </View>
        </View>

        {/* ── Chat scroll ─────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Hero mascot — squircle-framed, centered, impactful */}
          <View style={styles.heroSection}>
            {/* Outer ambient glow */}
            <View style={styles.heroGlowRing} />
            {/* Squircle card that gives Bloop a professional "product image" crop */}
            <View style={styles.heroMascotFrame}>
              <LinearGradient
                colors={["rgba(228,213,255,0.60)", "rgba(180,144,224,0.28)", "rgba(255,240,255,0.08)"]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <BloopMascot />
            </View>
          </View>

          {/* Messages */}
          {messages.map((msg, idx) =>
            msg.role === "bloop" ? (
              <View key={msg.id} style={styles.bloopRow}>
                <View style={styles.bloopAvatar}>
                  <Text style={styles.bloopAvatarStar}>✦</Text>
                </View>
                <View style={styles.bloopBubble}>
                  <Text style={styles.bloopText}>{msg.text}</Text>
                </View>
              </View>
            ) : (
              <View key={msg.id} style={styles.userRow}>
                <LinearGradient
                  colors={["#EDE0FF", "#E0CFFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.userBubble}
                >
                  <Text style={styles.userText}>{msg.text}</Text>
                  <View style={styles.userMeta}>
                    {msg.time ? <Text style={styles.userTime}>{msg.time}</Text> : null}
                    {msg.read && (
                      <MaterialCommunityIcons
                        name="check-all"
                        size={14}
                        color={C.lavender}
                      />
                    )}
                  </View>
                </LinearGradient>
              </View>
            )
          )}

          {/* Bloop typing indicator */}
          {bloopTyping && (
            <View style={styles.bloopRow}>
              <View style={styles.bloopAvatar}>
                <Text style={styles.bloopAvatarStar}>✦</Text>
              </View>
              <View style={[styles.bloopBubble, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, { opacity: 1.0 }]} />
                  <View style={[styles.typingDot, { opacity: 0.60 }]} />
                  <View style={[styles.typingDot, { opacity: 0.30 }]} />
                </View>
              </View>
            </View>
          )}

          {/* Suggestion chips */}
          <View style={styles.chipsWrap}>
            {SUGGESTION_CHIPS.map((chip) => {
              const active = activeChip === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  onPress={() => handleSuggestion(chip)}
                  style={({ pressed }) => [
                    styles.chip,
                    active && { backgroundColor: chip.color + "1A", borderColor: chip.color + "60" },
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={chip.icon}
                    size={14}
                    color={active ? chip.color : C.muted}
                  />
                  <Text style={[styles.chipLabel, active && { color: chip.color }]}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Insight card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={insightOpen ? "Collapse insight for you" : "Expand insight for you"}
            onPress={() => setInsightOpen((current) => !current)}
            style={({ pressed }) => [styles.insightCard, pressed && styles.pressed]}
          >
            <View style={styles.insightOrbWrap}>
              <InsightOrb />
              {/* Decorative constellation dots */}
              <View style={[styles.constellDot, { top: 2, right: 4 }]} />
              <View style={[styles.constellDot, { bottom: 8, right: -4, width: 5, height: 5 }]} />
              <View style={[styles.constellDot, { top: 12, left: 2, width: 4, height: 4, backgroundColor: "rgba(244,162,97,0.60)" }]} />
            </View>
            <View style={styles.insightText}>
              <View style={styles.insightTagRow}>
                <Text style={styles.insightStar}>✦</Text>
                <Text style={styles.insightTag}>Insight for you</Text>
              </View>
              <Text style={styles.insightBody}>
                Your sleep and stress patterns may be connected this week. Let's take small steps together.
              </Text>
              {insightOpen ? (
                <View style={styles.insightExpanded}>
                  <Text style={styles.insightExpandedText}>
                    When stress stays high, your nervous system can make sleep feel lighter and cycle symptoms feel louder. Try one small reset tonight: slow exhales, warm water, and a softer bedtime cue.
                  </Text>
                  <Text style={styles.insightExpandedHint}>
                    Ask Bloop: "Help me calm my body before sleep."
                  </Text>
                </View>
              ) : null}
            </View>
            <MaterialCommunityIcons
              name={insightOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={C.faint}
            />
          </Pressable>

          <View style={{ height: 12 }} />
        </ScrollView>

        {/* ── Voice panel ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={["rgba(232,218,255,0.72)", "rgba(248,240,255,0.80)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.voicePanel}
        >
          {/* Waveform bars — left side */}
          <View style={styles.waveGroup}>
            {Array.from({ length: WAVE_BARS }, (_, i) => (
              <WaveBar
                key={i}
                phase={WAVE_PHASES[i]}
                active={isTalking}
              />
            ))}
          </View>

          {/* Mic button */}
          <Pressable
            accessibilityLabel={isTalking ? "Stop voice mode" : "Start voice mode"}
            accessibilityRole="button"
            onPress={toggleTalk}
            style={({ pressed }) => [styles.micBtnShell, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={["#C4A0E8", "#8B63D6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.micBtn}
            >
              <MaterialCommunityIcons
                name={isTalking ? "microphone" : "microphone-outline"}
                size={26}
                color={C.white}
              />
            </LinearGradient>
          </Pressable>

          {/* Waveform bars — right side */}
          <View style={styles.waveGroup}>
            {Array.from({ length: WAVE_BARS }, (_, i) => (
              <WaveBar
                key={i + WAVE_BARS}
                phase={WAVE_PHASES[i + WAVE_BARS]}
                active={isTalking}
              />
            ))}
          </View>

          {/* Tap to talk label */}
          <Text style={styles.tapToTalk}>
            {isTalking ? "Listening…" : "Tap to talk"}
          </Text>
        </LinearGradient>

        {/* ── Text input bar ───────────────────────────────────────────── */}
        <View style={styles.inputRow}>
          <View style={styles.inputBar}>
            <MaterialCommunityIcons name="leaf-maple" size={18} color={C.faint} />
            <TextInput
              style={styles.inputField}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message Bloop…"
              placeholderTextColor={C.faint}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add heart emoji"
              onPress={addEmoji}
              style={({ pressed }) => [styles.emojiBtn, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="emoticon-happy-outline" size={20} color={C.faint} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={sendMessage}
              disabled={bloopTyping}
              style={({ pressed }) => [styles.sendBtn, pressed && styles.pressed, bloopTyping && { opacity: 0.38 }]}
            >
              <LinearGradient
                colors={["#C4A0E8", "#8B63D6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtnInner}
              >
                <MaterialCommunityIcons name="arrow-right" size={18} color={C.white} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* ── Bottom action shortcuts ──────────────────────────────────── */}
        <View style={styles.bottomActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/grounding" as any)}
            style={({ pressed }) => [styles.actionItem, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="sprout-outline" size={16} color={C.muted} />
            <Text style={styles.actionLabel}>Grounding</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={toggleTalk}
            style={({ pressed }) => [styles.actionItem, pressed && styles.pressed]}
          >
            <Ionicons name="options-outline" size={16} color={C.muted} />
            <Text style={styles.actionLabel}>Breath</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/grounding" as any)}
            style={({ pressed }) => [styles.actionItem, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="heart-circle-outline" size={16} color={C.muted} />
            <Text style={styles.actionLabel}>I need support</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    backgroundColor: C.bg1,
    flex: 1,
  },

  // Header
  header: {
    alignItems:     "center",
    flexDirection:  "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     20,
    borderWidth:      1,
    height:           40,
    justifyContent:   "center",
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 3 },
    shadowOpacity:    0.10,
    shadowRadius:     8,
    width:            40,
  },
  headerCenter: {
    alignItems: "center",
    flex:       1,
  },
  headerName: {
    color:         C.text,
    fontFamily:    F.luxuryBold,    // Fraunces SemiBold — premium H1 for Bloop's name
    fontSize:      24,
    letterSpacing: -0.2,
  },
  headerStatusRow: {
    alignItems:    "center",
    flexDirection: "row",
    gap:           5,
    marginTop:     2,
  },
  onlineDot: {
    backgroundColor: C.green,
    borderRadius:    5,
    height:          8,
    width:           8,
  },
  headerStatus: {
    color:      C.muted,
    fontFamily: F.uiRegular,        // Inter Regular — clean caption
    fontSize:   11,
    letterSpacing: 0.1,
  },
  headerRight: {
    alignItems:    "center",
    flexDirection: "row",
    gap:           8,
  },

  // Chat
  chatScroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  chatContent: {
    paddingBottom: 8,
  },

  // Hero mascot — squircle framed, perfectly centered
  heroSection: {
    alignItems:     "center",
    justifyContent: "center",
    paddingTop:     24,
    paddingBottom:  8,
    position:       "relative",
  },
  heroGlowRing: {
    // Ambient halo behind the squircle
    backgroundColor:  "rgba(212,180,255,0.22)",
    borderRadius:     999,
    height:           240,
    position:         "absolute",
    width:            240,
  },
  heroMascotFrame: {
    // Squircle crop — 48px border-radius gives organic "squircle" shape
    alignItems:     "center",
    borderRadius:   52,
    borderWidth:    1.5,
    borderColor:    "rgba(180,144,224,0.40)",
    height:         200,
    justifyContent: "center",
    overflow:       "hidden",
    width:          200,
    shadowColor:    "#9277C8",
    shadowOffset:   { width: 0, height: 8 },
    shadowOpacity:  0.28,
    shadowRadius:   24,
    elevation:      10,
  },

  // Bloop bubble
  bloopRow: {
    alignItems:   "flex-end",
    flexDirection:"row",
    gap:          10,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  bloopAvatar: {
    alignItems:       "center",
    backgroundColor:  "rgba(146,119,200,0.12)",
    borderColor:      "rgba(146,119,200,0.25)",
    borderRadius:     18,
    borderWidth:      1,
    height:           36,
    justifyContent:   "center",
    width:            36,
  },
  bloopAvatarStar: {
    color:    C.lavender,
    fontSize: 14,
  },
  bloopBubble: {
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     20,
    borderBottomLeftRadius: 6,
    borderWidth:      1,
    flex:             1,
    maxWidth:         W * 0.72,
    padding:          14,
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 4 },
    shadowOpacity:    0.12,
    shadowRadius:     12,
  },
  bloopText: {
    color:      C.text,
    fontFamily: F.uiRegular,        // Inter Regular 400 — optimal for conversational body
    fontSize:   14.5,
    lineHeight: 23,                 // 1.6x line-height for readability
  },

  // User bubble
  userRow: {
    alignItems:        "flex-end",
    marginBottom:      12,
    paddingHorizontal: 16,
  },
  userBubble: {
    borderRadius:           20,
    borderBottomRightRadius: 6,
    maxWidth:               W * 0.68,
    padding:                14,
    paddingBottom:          10,
  },
  userText: {
    color:      C.deepPurple,
    fontFamily: F.uiMedium,
    fontSize:   14,
    lineHeight: 22,
  },
  userMeta: {
    alignItems:     "center",
    alignSelf:      "flex-end",
    flexDirection:  "row",
    gap:            4,
    marginTop:      4,
  },
  userTime: {
    color:      C.lavender,
    fontFamily: F.uiRegular,
    fontSize:   10,
    opacity:    0.80,
  },

  // Typing indicator
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 64,
  },
  typingDots: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           6,
  },
  typingDot: {
    width:           9,
    height:          9,
    borderRadius:    5,
    backgroundColor: "#9277C8",
  },

  // Suggestion chips
  chipsWrap: {
    flexDirection:     "row",
    flexWrap:          "wrap",
    gap:               8,
    justifyContent:    "center",
    paddingHorizontal: 16,
    paddingVertical:   12,
  },
  chip: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     24,
    borderWidth:      1,
    flexDirection:    "row",
    gap:              6,
    paddingHorizontal: 14,
    paddingVertical:  8,
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.08,
    shadowRadius:     6,
  },
  chipLabel: {
    color:      C.muted,
    fontFamily: F.uiMedium,
    fontSize:   12,
  },

  // Insight card
  insightCard: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     24,
    borderWidth:      1,
    flexDirection:    "row",
    gap:              12,
    marginHorizontal: 16,
    marginTop:        4,
    padding:          14,
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 5 },
    shadowOpacity:    0.11,
    shadowRadius:     14,
  },
  insightOrbWrap: {
    height:   52,
    position: "relative",
    width:    52,
  },
  constellDot: {
    backgroundColor: "rgba(146,119,200,0.55)",
    borderRadius:    4,
    height:          6,
    position:        "absolute",
    width:           6,
  },
  insightText: {
    flex: 1,
  },
  insightTagRow: {
    alignItems:    "center",
    flexDirection: "row",
    gap:           5,
    marginBottom:  4,
  },
  insightStar: {
    color:    C.purple,
    fontSize: 11,
  },
  insightTag: {
    color:      C.purple,
    fontFamily: F.uiSemiBold,
    fontSize:   12,
    letterSpacing: 0.3,
  },
  insightBody: {
    color:      C.text,
    fontFamily: F.uiMedium,
    fontSize:   12,
    lineHeight: 18,
  },
  insightExpanded: {
    backgroundColor: "rgba(146,119,200,0.08)",
    borderColor:     "rgba(146,119,200,0.12)",
    borderRadius:    16,
    borderWidth:     1,
    marginTop:       10,
    padding:         10,
  },
  insightExpandedText: {
    color:      C.text,
    fontFamily: F.uiRegular,
    fontSize:   12,
    lineHeight: 18,
  },
  insightExpandedHint: {
    color:      C.purple,
    fontFamily: F.uiSemiBold,
    fontSize:   11,
    lineHeight: 16,
    marginTop:  8,
  },

  // Voice panel
  voicePanel: {
    alignItems:       "center",
    borderColor:      "rgba(180,155,224,0.28)",
    borderRadius:     28,
    borderWidth:      1,
    flexDirection:    "row",
    justifyContent:   "space-between",
    marginBottom:     10,
    marginHorizontal: 16,
    overflow:         "hidden",
    paddingHorizontal: 18,
    paddingVertical:  18,
    position:         "relative",
  },
  waveGroup: {
    alignItems:    "flex-end",
    flexDirection: "row",
    gap:           4,
    height:        40,
  },
  waveBar: {
    borderRadius: 3,
    width:        4,
  },
  micBtnShell: {
    borderRadius: 34,
    shadowColor:  C.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity:0.32,
    shadowRadius: 14,
  },
  micBtn: {
    alignItems:     "center",
    borderRadius:   34,
    height:         68,
    justifyContent: "center",
    width:          68,
  },
  tapToTalk: {
    bottom:     -20,
    color:      C.purple,
    fontFamily: F.uiSemiBold,
    fontSize:   13,
    left:       0,
    position:   "absolute",
    right:      0,
    textAlign:  "center",
  },

  // Input bar
  inputRow: {
    paddingBottom:    6,
    paddingHorizontal: 16,
  },
  inputBar: {
    alignItems:       "center",
    backgroundColor:  C.cardBg,
    borderColor:      C.cardBdr,
    borderRadius:     32,
    borderWidth:      1,
    flexDirection:    "row",
    gap:              8,
    paddingHorizontal: 16,
    paddingVertical:  10,
    shadowColor:      "#D6C3B9",
    shadowOffset:     { width: 0, height: 4 },
    shadowOpacity:    0.12,
    shadowRadius:     12,
  },
  inputField: {
    color:      C.text,
    flex:       1,
    fontFamily: F.uiRegular,
    fontSize:   14,
  },
  emojiBtn: {
    padding: 2,
  },
  sendBtn: {
    borderRadius: 18,
    shadowColor:  C.purple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity:0.28,
    shadowRadius: 8,
  },
  sendBtnInner: {
    alignItems:     "center",
    borderRadius:   18,
    height:         36,
    justifyContent: "center",
    width:          36,
  },

  // Bottom actions
  bottomActions: {
    alignItems:        "center",
    flexDirection:     "row",
    justifyContent:    "space-around",
    paddingBottom:     12,
    paddingHorizontal: 20,
    paddingTop:        6,
  },
  actionItem: {
    alignItems:    "center",
    flexDirection: "row",
    gap:           6,
  },
  actionLabel: {
    color:      C.muted,
    fontFamily: F.uiMedium,
    fontSize:   12,
  },

  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
