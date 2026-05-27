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

// ── Palette — Midnight Plum dark theme ────────────────────────────────────────
// All surface / text values are mapped to semantic tokens.
// Informational accent colors (lavender, pink, sage, green) remain fixed —
// same as NotificationCard category tints pattern.
const C = {
  bg1:       "#110812",   // background  (Midnight Plum)
  bg2:       "#261E28",
  bg3:       "#2A1E2C",
  text:      "#F6E9EF",   // textPrimary (Moon Pearl)
  muted:     "#B58AC8",   // textMuted   (Lavender Dust)
  faint:     "#6E5680",   // dimmed muted for placeholders
  lavender:  "#9277C8",   // informational accent
  purple:    "#8B63D6",   // informational accent
  deepPurple:"#5A3B8B",   // mascot eye stroke (kept)
  pink:      "#D45C82",   // informational accent
  sage:      "#5E9B6B",   // informational accent
  green:     "#82D0A4",   // online dot
  white:     "#FFFFFF",   // SVG specular + send button icon
  cardBg:    "#2E2330",   // surface      (Blackberry Smoke)
  cardBdr:   "#4A394D",   // border       (Velvet Mauve)
  userBubble:"#EEDDFF",   // user chat bubble (intentionally light — contrast ok on light bg)
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
interface Message {
  id: string;
  role: "bloop" | "user";
  text: string;
  time: string | null;
  read: boolean;
  cardType?: "butterfly" | "curriculum";
  cardPhase?: "menstrual" | "follicular" | "ovulatory" | "luteal";
}

const INITIAL_MESSAGES: Message[] = [
  {
    id:   "1",
    role: "bloop",
    text: "Hi gorgeous, I'm right here for you. How is your body feeling today? Let's take a deep breath together 💜",
    time: null,
    read: false,
  },
  {
    id:   "2",
    role: "user",
    text: "I've been feeling anxious lately.",
    time: "9:40 AM",
    read: true,
  },
  {
    id:   "3",
    role: "bloop",
    text: "Oh honey, I hear you. I've noticed your stress level has been sitting a bit high this week. You don't have to carry it all alone. Let's do a gentle, soothing reset together, okay? 🌸",
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

  // Cycle / hormones / period / cramps
  if (t.includes("period") || t.includes("menstrual") || t.includes("bleed")) {
    if (t.includes("yoga") || t.includes("care") || t.includes("move")) {
      return "Beautiful soul, your body is in its winter season ❄️ This is the time for deep rest, release, and grounding.\n\nHere is your Menstrual Care Sequence, curated to relieve physical congestion and soothe your nervous system. These gentle poses are all about ease—no straining, just soft, restorative breathing. Let's move through them together.";
    }
    return `${from}Your period is actually a fifth vital sign — it tells us so much about your overall health. Is it arriving on time, or has the timing or flow changed? Tell me more and I can help you decode what your body's signalling.`;
  }

  if (t.includes("cramp") || t.includes("pain") || t.includes("ache"))
    return "Oh, sweet sister, I hear you 💜 Uterine cramps can be so exhausting and draining. Let's ease that pelvic tension together. Reclined Butterfly is a beautiful, gentle pose that opens your hips, relaxes your pelvic floor, and increases blood circulation to soothe those uterine muscles.\n\nLet's do this small sequence right now. I've laid out the steps below—tick them off as we go, and take all the time you need. I'm right here with you.";

  if (t.includes("pcos") || t.includes("endometriosis") || t.includes("endo"))
    return `${from}I see you 💜 Living with PCOS or endometriosis means your body needs extra care, not extra pressure. Tracking patterns — energy, pain, mood — helps you predict flare-ups and advocate for yourself with doctors. What's happening today that you'd like to understand better?`;

  if (t.includes("ovulat") || t.includes("fertile") || t.includes("fertility"))
    return `${from}Ovulation is your body's monthly power surge — energy, confidence, and libido often peak here because estrogen and LH are highest. Your fertile window is typically 5 days before ovulation plus ovulation day itself. Would you like to understand how to track it more precisely?`;

  if (t.includes("menstrual care yoga") || t.includes("menstrual care") || t.includes("menstrual yoga"))
    return "Beautiful soul, your body is in its winter season ❄️ This is the time for deep rest, release, and grounding.\n\nHere is your Menstrual Care Sequence, curated to relieve physical congestion and soothe your nervous system. These gentle poses are all about ease—no straining, just soft, restorative breathing. Let's move through them together.";

  if (t.includes("follicular rise yoga") || t.includes("follicular rise") || t.includes("follicular yoga"))
    return "Your energy is rising like the spring sun 🌸 As estrogen begins to climb, your body is primed for spinal mobility, chest opening, and building light heat.\n\nThis Follicular Rise flow is designed to spark your creativity, improve circulation, and build confidence. Enjoy the movement!";

  if (t.includes("ovulatory vitality yoga") || t.includes("ovulatory vitality") || t.includes("ovulatory yoga"))
    return "You are in your peak summer radiance ☀️ High estrogen and LH levels mean your body is strong, open, and vibrant.\n\nThis Ovulatory Vitality sequence focuses on radiant heart-openers and builds powerful physical confidence. Flow with your expansive energy today!";

  if (t.includes("luteal calming yoga") || t.includes("luteal calming") || t.includes("luteal yoga"))
    return "Your autumn season is here, inviting you to turn inward 🍂 Progesterone is high, making your body crave grounding, calming, and soothing practices to ease any physical or mental tension.\n\nLet's quiet the nervous system and anchor your energy.";

  if (t.includes("yoga") || t.includes("pranayama")) {
    if (t.includes("menstrual")) {
      return "Beautiful soul, your body is in its winter season ❄️ This is the time for deep rest, release, and grounding.\n\nHere is your Menstrual Care Sequence, curated to relieve physical congestion and soothe your nervous system. Let's move through them together.";
    } else if (t.includes("follicular")) {
      return "Your energy is rising like the spring sun 🌸 As estrogen begins to climb, your body is primed for spinal mobility, chest opening, and building light heat.\n\nThis Follicular Rise flow is designed to spark your creativity, improve circulation, and build confidence. Enjoy the movement!";
    } else if (t.includes("ovulat")) {
      return "You are in your peak summer radiance ☀️ High estrogen and LH levels mean your body is strong, open, and vibrant.\n\nThis Ovulatory Vitality sequence focuses on radiant heart-openers and builds powerful physical confidence. Flow with your expansive energy today!";
    } else if (t.includes("luteal")) {
      return "Your autumn season is here, inviting you to turn inward 🍂 Progesterone is high, making your body crave grounding, calming, and soothing practices to ease any physical or mental tension.\n\nLet's quiet the nervous system and anchor your energy.";
    } else {
      return `${from}Yoga and breathing are incredibly nourishing for your cycle. Since we are on Day 18 (your Luteal Phase), your body is naturally craving grounding and calming energy. I highly recommend your Luteal Calming Flow below to quiet your nervous system and release any PMS physical tension. Would you like to try it?`;
    }
  }

  if (t.includes("cycle") || t.includes("hormone") || t.includes("phase"))
    return `${from}Your cycle has four distinct phases — menstrual, follicular, ovulatory, and luteal — and each one affects your energy, mood, focus, and appetite differently. Which phase do you want to understand better? Or tell me your cycle day and I'll decode exactly where you are.`;

  // Nutrition / nourish
  if (t.includes("food") || t.includes("eat") || t.includes("diet") || t.includes("nourish") || t.includes("nutrition"))
    return `${from}What you eat genuinely shifts your hormones. During your follicular phase, cruciferous vegetables support estrogen metabolism. In the luteal phase, magnesium-rich dark chocolate and leafy greens reduce PMS. What phase are you in right now, and what does your body seem to be craving?`;

  if (t.includes("water") || t.includes("hydrat") || t.includes("drink"))
    return "Hydration is underrated for hormonal health 💧 Even mild dehydration amplifies fatigue, brain fog, and cramps. Your target: roughly 2.7 litres daily, more in the luteal phase and around your period. Are you managing to hit that most days?";

  if (t.includes("weight") || t.includes("bloat"))
    return "Cycle-related weight fluctuations of 1-3kg are completely normal — especially before your period when progesterone causes water retention. This isn't fat gain; it resolves within a few days of your period starting. Are you tracking this across your cycle, or does it feel unpredictable?";

  // Movement / exercise / workout
  if (t.includes("exercise") || t.includes("workout") || t.includes("gym") || t.includes("move"))
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
    `${from}I hear you, sweetheart 💜 Tell me more — what does your body feel like right now, and how long have you been carrying this?`,
    `${from}Oh honey, that makes complete sense to sit with. Your feelings are valid signals from your body. What would feel most comforting right now?`,
    `${from}I'm right here with you, sister. Let's take this one gentle, slow breath at a time. What feels like the heaviest thing on your heart today?`,
    `${from}Your heart and wellbeing matter so deeply to me. Can you share a little more? I'm listening with my whole heart.`,
  ];
  return fallbacks[Math.abs(text.length) % fallbacks.length];
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

// ── Interactive Butterfly Card (Empathetic Pelvic Cramps Relief) ─────────────
function InteractiveButterflyCard() {
  const [steps, setSteps] = useState([
    { id: 1, label: "Step 1: Recline on Back", desc: "Lie flat on a cozy surface. Put a pillow under your knees or lower back if you need extra support.", done: false },
    { id: 2, label: "Step 2: Sole-to-Sole Connection", desc: "Bring the soles of your feet together, letting your knees fall outwards gently like butterfly wings.", done: false },
    { id: 3, label: "Step 3: Deep Abdominal Breathing", desc: "Place your hands on your lower belly. Inhale deeply, letting it rise; exhale slowly, releasing all uterine tension.", done: false },
  ]);
  const [isCompleted, setIsCompleted] = useState(false);

  const toggleStep = (id: number) => {
    const updated = steps.map(s => s.id === id ? { ...s, done: !s.done } : s);
    setSteps(updated);
    
    const allDone = updated.every(s => s.done);
    setIsCompleted(allDone);
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={["rgba(212, 92, 130, 0.15)", "rgba(146, 119, 200, 0.08)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeaderRow}>
          <MaterialCommunityIcons name="butterfly" size={24} color={C.pink} />
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle}>Supta Baddha Konasana</Text>
            <Text style={styles.cardSubtitle}>Reclined Butterfly • Pelvic Cramps Relief</Text>
          </View>
        </View>

        <Text style={styles.cardIntro}>
          Follow these gentle steps at your own cozy pace. Deep diaphragmatic breathing reduces uterine cramping and grounds your nervous system.
        </Text>

        <View style={styles.stepsList}>
          {steps.map((step) => (
            <Pressable
              key={step.id}
              onPress={() => toggleStep(step.id)}
              style={({ pressed }) => [
                styles.stepRow,
                step.done && styles.stepRowDone,
                pressed && styles.pressed
              ]}
            >
              <View style={[styles.checkbox, step.done && styles.checkboxActive]}>
                {step.done && <Ionicons name="checkmark" size={12} color={C.white} />}
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
                  {step.label}
                </Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {isCompleted && (
          <View style={styles.celebrationContainer}>
            <MaterialCommunityIcons name="heart-pulse" size={28} color={C.pink} style={styles.pulseIcon} />
            <Text style={styles.celebrationText}>Proud of you for taking care of yourself 💜</Text>
            <Text style={styles.celebrationSub}>You've given your body space to soften, breathe, and heal.</Text>
          </View>
        )}

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Listen to your body. Modify or rest whenever you need. Consult a physician for severe pain.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// ── Cycle-Synced Curriculum Flow Card ─────────────────────────────────────────
const CURRICULUM_DATA = {
  menstrual: {
    title: "Menstrual Care Sequence",
    subtitle: "Menstrual Phase • Day 1-5 • Rest & Relieve",
    color: C.pink,
    icon: "water-outline" as const,
    intro: "Your body is in its winter season ❄️ Focus on deep belly breathing and soft, grounding movements to release abdominal congestion and fatigue.",
    poses: [
      { name: "Supta Baddha Konasana", type: "Reclined Butterfly", duration: "5 mins", desc: "Relaxes pelvic muscles and eases cramps. Support your knees with pillows if they feel tight." },
      { name: "Balasana", type: "Child’s Pose", duration: "3 mins", desc: "Helps release lower back tension and fatigue. Rest your forehead on a cozy cushion." },
      { name: "Pavanmuktasana", type: "Knees-to-Chest Pose", duration: "2 mins", desc: "Gentle abdominal compression to soothe discomfort and release trapped tension." },
    ],
    breath: { name: "Deep Belly Breathing", duration: "3 mins", desc: "Place hands on lower belly. Inhale, letting it rise like a balloon; exhale slowly to relax pelvic muscles." }
  },
  follicular: {
    title: "Follicular Rise Sequence",
    subtitle: "Follicular Phase • Day 6-13 • Energy & Vitality",
    color: C.lavender,
    icon: "sprout" as const,
    intro: "Your energy is rising like the spring sun 🌸 Estrogen begins to climb, priming your body for chest opening, spinal mobility, and mental clarity.",
    poses: [
      { name: "Marjariasana-Bitilasana", type: "Cat-Cow Flow", duration: "3 mins", desc: "Improves spinal mobility and circulation. Sync each arch and curl with your rising breath." },
      { name: "Bhujangasana", type: "Cobra Pose", duration: "2 mins", desc: "Opens the chest, lifts fatigue, and boosts energy levels. Keep shoulders soft and low." },
      { name: "Virabhadrasana II", type: "Warrior II", duration: "2 mins per side", desc: "Builds strength, pelvic circulation, and unlocks your creative, confident energy." },
    ],
    breath: { name: "Nadi Shodhana", duration: "3 mins", desc: "Alternate nostril breathing to balance hormones and bring beautiful mental clarity." }
  },
  ovulatory: {
    title: "Ovulatory Vitality Sequence",
    subtitle: "Ovulatory Phase • Day 14-16 • Radiant & Expansive",
    color: C.purple,
    icon: "flower-poppy" as const,
    intro: "You are in your peak summer radiance ☀️ High estrogen and LH levels mean your body is strong, open, and vibrant. Enjoy heart openers and celebrate strength.",
    poses: [
      { name: "Trikonasana", type: "Triangle Pose", duration: "2 mins per side", desc: "Opens side body and pelvis, supporting healthy blood flow to reproductive organs." },
      { name: "Anjaneyasana", type: "Low Lunge", duration: "2 mins per side", desc: "Stretches deep hip flexors, opens the heart, and builds elegant physical stamina." },
      { name: "Ustrasana", type: "Supported Camel Pose", duration: "2 mins", desc: "Gentle heart opener that stimulates the thyroid and opens the throat chakra for self-expression." },
    ],
    breath: { name: "Surya Bhedan (Solar Breath)", duration: "3 mins", desc: "Inhale right nostril, exhale left nostril. Stokes digestive fire and boosts radiance." }
  },
  luteal: {
    title: "Luteal Calming Sequence",
    subtitle: "Luteal Phase • Day 17-28 • Ground & Calm",
    color: C.sage,
    icon: "leaf" as const,
    intro: "Your autumn season is here, inviting you to turn inward 🍂 Quiet your nervous system, ground your energy, and relieve premenstrual tension.",
    poses: [
      { name: "Viparita Karani", type: "Legs-Up-the-Wall", duration: "8 mins", desc: "Drains pelvic congestion, calms a busy mind, and prepares the nervous system for rest." },
      { name: "Janu Sirsasana", type: "Head-to-Knee Forward Bend", duration: "3 mins per side", desc: "Quiet forward bend that calms the brain and gently stretches tight lower back and hamstrings." },
      { name: "Setu Bandhasana", type: "Supported Bridge", duration: "3 mins", desc: "Restores the endocrine system, releases tight hip flexors (psoas), and anchors the heart." },
    ],
    breath: { name: "4-7-8 Breathing", duration: "3 mins", desc: "Inhale 4s, hold 7s, exhale 8s. A powerful shift to activate deep calm and relieve PMS irritability." }
  }
};

function CurriculumFlowCard({ phase }: { phase: "menstrual" | "follicular" | "ovulatory" | "luteal" }) {
  const data = CURRICULUM_DATA[phase];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [completedItems, setCompletedItems] = useState<boolean[]>([false, false, false, false]); // 3 poses + 1 breath

  const togglePose = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleComplete = (index: number) => {
    const updated = [...completedItems];
    updated[index] = !updated[index];
    setCompletedItems(updated);
  };

  const allCompleted = completedItems.every(Boolean);

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[`${data.color}20`, "rgba(146, 119, 200, 0.08)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeaderRow}>
          <MaterialCommunityIcons name={data.icon} size={24} color={data.color} />
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle}>{data.title}</Text>
            <Text style={styles.cardSubtitle}>{data.subtitle}</Text>
          </View>
        </View>

        <Text style={styles.cardIntro}>{data.intro}</Text>

        <View style={styles.posesList}>
          {data.poses.map((pose, idx) => {
            const isExpanded = expandedIndex === idx;
            const isDone = completedItems[idx];
            return (
              <View key={idx} style={[styles.poseItem, isDone && styles.poseItemDone]}>
                <View style={styles.poseItemHeader}>
                  <Pressable
                    onPress={() => toggleComplete(idx)}
                    style={({ pressed }) => [styles.checkboxMini, isDone && styles.checkboxActiveMini, pressed && styles.pressed]}
                  >
                    {isDone && <Ionicons name="checkmark" size={10} color={C.white} />}
                  </Pressable>
                  <Pressable
                    onPress={() => togglePose(idx)}
                    style={({ pressed }) => [styles.poseItemTitlePressable, pressed && styles.pressed]}
                  >
                    <View style={styles.poseItemTitleCol}>
                      <Text style={[styles.poseItemName, isDone && styles.poseItemNameDone]}>{pose.name}</Text>
                      <Text style={styles.poseItemType}>{pose.type} • {pose.duration}</Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={C.muted}
                    />
                  </Pressable>
                </View>
                {isExpanded && (
                  <View style={styles.poseItemDetail}>
                    <Text style={styles.poseItemDesc}>{pose.desc}</Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Breathwork item */}
          <View style={[styles.poseItem, completedItems[3] && styles.poseItemDone]}>
            <View style={styles.poseItemHeader}>
              <Pressable
                onPress={() => toggleComplete(3)}
                style={({ pressed }) => [styles.checkboxMini, completedItems[3] && styles.checkboxActiveMini, pressed && styles.pressed]}
              >
                {completedItems[3] && <Ionicons name="checkmark" size={10} color={C.white} />}
              </Pressable>
              <Pressable
                onPress={() => togglePose(3)}
                style={({ pressed }) => [styles.poseItemTitlePressable, pressed && styles.pressed]}
              >
                <View style={styles.poseItemTitleCol}>
                  <Text style={[styles.poseItemName, completedItems[3] && styles.poseItemNameDone]}>🌬️ {data.breath.name}</Text>
                  <Text style={styles.poseItemType}>Breathwork • {data.breath.duration}</Text>
                </View>
                <Ionicons
                  name={expandedIndex === 3 ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={C.muted}
                />
              </Pressable>
            </View>
            {expandedIndex === 3 && (
              <View style={styles.poseItemDetail}>
                <Text style={styles.poseItemDesc}>{data.breath.desc}</Text>
              </View>
            )}
          </View>
        </View>

        {allCompleted && (
          <View style={[styles.celebrationContainer, { borderLeftWidth: 3, borderLeftColor: data.color }]}>
            <MaterialCommunityIcons name="flower-tulip" size={28} color={data.color} style={styles.pulseIcon} />
            <Text style={styles.celebrationText}>Beautifully done, sister 🌸</Text>
            <Text style={styles.celebrationSub}>You've nourished your body in harmony with your natural biological rhythms.</Text>
          </View>
        )}

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Listen to your body. Modify or rest whenever you need. Consult a physician for severe pain.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function BloopChatScreen() {
  const router    = useRouter();
  const params    = useLocalSearchParams<BloopRouteParams>();
  const safeBack  = useSafeBack();
  const scrollRef = useRef<ScrollView>(null);
  const handledPromptRef = useRef<string | null>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [inputText,    setInputText]    = useState("");
  const [isTalking,    setIsTalking]    = useState(false);
  const [activeChip,   setActiveChip]   = useState<string | null>(null);
  const [messages,     setMessages]     = useState<Message[]>(INITIAL_MESSAGES);
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
      const replyText = getContextualReply(prompt, sourceLabel);
      
      let cardType: "butterfly" | "curriculum" | undefined = undefined;
      let cardPhase: "menstrual" | "follicular" | "ovulatory" | "luteal" | undefined = undefined;
      
      const t = prompt.toLowerCase();
      if (t.includes("cramp") || t.includes("experiencing cramps")) {
        cardType = "butterfly";
      } else if (t.includes("menstrual care yoga") || t.includes("menstrual care") || t.includes("menstrual yoga")) {
        cardType = "curriculum";
        cardPhase = "menstrual";
      } else if (t.includes("follicular rise yoga") || t.includes("follicular rise") || t.includes("follicular yoga")) {
        cardType = "curriculum";
        cardPhase = "follicular";
      } else if (t.includes("ovulatory vitality yoga") || t.includes("ovulatory vitality") || t.includes("ovulatory yoga")) {
        cardType = "curriculum";
        cardPhase = "ovulatory";
      } else if (t.includes("luteal calming yoga") || t.includes("luteal calming") || t.includes("luteal yoga")) {
        cardType = "curriculum";
        cardPhase = "luteal";
      }

      setMessages((prev) => [
        ...prev,
        { id: `${now}-route-user`, role: "user", text: prompt, time: "Just now", read: false },
        { id: `${now}-route-bloop`, role: "bloop", text: replyText, time: null, read: false, cardType, cardPhase },
      ]);
      setInputText("");
    } else {
      setInputText(prompt);
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 140);
  }, [routePrompt, shouldAutoSend, sourceLabel]);

  const toggleTalk = () => {
    if (!isTalking) {
      setIsTalking(true);
      // Simulate voice-to-text typing
      voiceTimeoutRef.current = setTimeout(() => {
        setIsTalking(false);
        // Simulate user sending a voice message
        const voicePrompt = "I'm having a bit of a heavy day, can you help me relax? 💜";
        setInputText(voicePrompt);
        
        // Trigger send for this message after a brief typing feel
        setTimeout(() => {
          const userId = `${Date.now()}-user`;
          setMessages((prev) => [
            ...prev,
            { id: userId, role: "user", text: voicePrompt, time: "Just now", read: false },
          ]);
          setInputText("");
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

          setBloopTyping(true);
          const delay = 1500;
          setTimeout(() => {
            setBloopTyping(false);
            const replyText = getBloopReply(voicePrompt);
            setMessages((prev) => [
              ...prev,
              {
                id: `${Date.now()}-bloop`,
                role: "bloop",
                text: replyText,
                time: null,
                read: false,
                cardType: "curriculum",
                cardPhase: "luteal",
              },
            ]);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
          }, delay);
        }, 600);
      }, 3200);
    } else {
      setIsTalking(false);
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = null;
      }
    }
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
      
      const replyText = getBloopReply(trimmed);
      let cardType: "butterfly" | "curriculum" | undefined = undefined;
      let cardPhase: "menstrual" | "follicular" | "ovulatory" | "luteal" | undefined = undefined;
      
      const t = trimmed.toLowerCase();
      if (t.includes("cramp") || t.includes("experiencing cramps")) {
        cardType = "butterfly";
      } else if (t.includes("menstrual care yoga") || t.includes("menstrual care") || t.includes("menstrual yoga")) {
        cardType = "curriculum";
        cardPhase = "menstrual";
      } else if (t.includes("follicular rise yoga") || t.includes("follicular rise") || t.includes("follicular yoga")) {
        cardType = "curriculum";
        cardPhase = "follicular";
      } else if (t.includes("ovulatory vitality yoga") || t.includes("ovulatory vitality") || t.includes("ovulatory yoga")) {
        cardType = "curriculum";
        cardPhase = "ovulatory";
      } else if (t.includes("luteal calming yoga") || t.includes("luteal calming") || t.includes("luteal yoga")) {
        cardType = "curriculum";
        cardPhase = "luteal";
      } else if (t.includes("yoga") || t.includes("pranayama")) {
        if (t.includes("menstrual")) {
          cardType = "curriculum";
          cardPhase = "menstrual";
        } else if (t.includes("follicular")) {
          cardType = "curriculum";
          cardPhase = "follicular";
        } else if (t.includes("ovulat")) {
          cardType = "curriculum";
          cardPhase = "ovulatory";
        } else if (t.includes("luteal")) {
          cardType = "curriculum";
          cardPhase = "luteal";
        } else {
          // Default to Luteal Day 18 flow
          cardType = "curriculum";
          cardPhase = "luteal";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bloop`,
          role: "bloop",
          text: replyText,
          time: null,
          read: false,
          cardType,
          cardPhase,
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
      {/* Background — solid Midnight Plum */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: C.bg1 }]} />

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
              accessibilityLabel={isTalking ? "Stop voice simulation" : "Start voice simulation"}
              onPress={toggleTalk}
              style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="waveform" size={18} color={C.muted} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Companion Settings"
              onPress={() => router.push("/bloop" as any)}
              style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={C.muted} />
            </Pressable>
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
                colors={["rgba(180,144,224,0.22)", "rgba(146,119,200,0.12)", "rgba(146,119,200,0.04)"]}
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
              <View key={msg.id} style={{ marginBottom: 16 }}>
                <View style={[styles.bloopRow, { marginBottom: msg.cardType ? 8 : 0 }]}>
                  <View style={styles.bloopAvatar}>
                    <Text style={styles.bloopAvatarStar}>♥</Text>
                  </View>
                  <View style={styles.bloopBubble}>
                    <Text style={styles.bloopText}>{msg.text}</Text>
                  </View>
                </View>
                {msg.cardType === "butterfly" && (
                  <View style={{ paddingLeft: 52, paddingRight: 16, marginTop: -4 }}>
                    <InteractiveButterflyCard />
                  </View>
                )}
                {msg.cardType === "curriculum" && msg.cardPhase && (
                  <View style={{ paddingLeft: 52, paddingRight: 16, marginTop: -4 }}>
                    <CurriculumFlowCard phase={msg.cardPhase} />
                  </View>
                )}
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
                <Text style={styles.bloopAvatarStar}>♥</Text>
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
                <Text style={styles.insightStar}>♥</Text>
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

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* ── Text input bar ───────────────────────────────────────────── */}
        <View style={styles.inputRow}>
          <View style={styles.inputBar}>
            {/* Microphone side button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isTalking ? "Stop voice simulation" : "Start voice simulation"}
              onPress={toggleTalk}
              style={({ pressed }) => [
                styles.inputVoiceBtn,
                isTalking && styles.inputVoiceBtnActive,
                pressed && styles.pressed
              ]}
            >
              <MaterialCommunityIcons
                name={isTalking ? "microphone" : "microphone-outline"}
                size={20}
                color={isTalking ? C.pink : C.muted}
              />
            </Pressable>

            {/* Input field */}
            <TextInput
              style={styles.inputField}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isTalking ? "Listening to your voice..." : "Chat with Bloop..."}
              placeholderTextColor={C.faint}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              editable={!bloopTyping && !isTalking}
            />

            {/* Voice animation inside input bar */}
            {isTalking && (
              <View style={styles.inlineVoiceAnim}>
                <View style={[styles.inlineAnimBar, { height: 10 }]} />
                <View style={[styles.inlineAnimBar, { height: 18 }]} />
                <View style={[styles.inlineAnimBar, { height: 14 }]} />
                <View style={[styles.inlineAnimBar, { height: 6 }]} />
              </View>
            )}

            {/* Heart emoji button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add heart emoji"
              onPress={addEmoji}
              style={({ pressed }) => [styles.emojiBtn, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="heart-outline" size={20} color={C.muted} />
            </Pressable>

            {/* Send button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={sendMessage}
              disabled={bloopTyping || isTalking}
              style={({ pressed }) => [
                styles.sendBtn,
                pressed && styles.pressed,
                (bloopTyping || isTalking) && { opacity: 0.38 }
              ]}
            >
              <LinearGradient
                colors={["#C4A0E8", "#8B63D6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtnInner}
              >
                <MaterialCommunityIcons name="arrow-up" size={18} color={C.white} />
              </LinearGradient>
            </Pressable>
          </View>
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
    shadowColor:      "#000000",
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
    backgroundColor:  "rgba(146,119,200,0.12)",
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
    shadowColor:      "#000000",
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
    shadowColor:      "#000000",
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
    shadowColor:      "#000000",
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
    shadowColor:      "#000000",
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

  // Custom Yoga Cards
  cardContainer: {
    marginTop: 6,
    marginBottom: 6,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.cardBdr,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    color: C.text,
    fontFamily: F.luxuryBold,
    fontSize: 16.5,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    color: C.muted,
    fontFamily: F.uiSemiBold,
    fontSize: 11,
    marginTop: 2,
  },
  cardIntro: {
    color: C.text,
    fontFamily: F.uiRegular,
    fontSize: 12.5,
    lineHeight: 18,
    opacity: 0.9,
    marginBottom: 14,
  },
  stepsList: {
    gap: 10,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: "rgba(38, 30, 40, 0.4)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBdr,
  },
  stepRowDone: {
    borderColor: "rgba(212, 92, 130, 0.35)",
    backgroundColor: "rgba(212, 92, 130, 0.08)",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.faint,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: C.pink,
    borderColor: C.pink,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepLabel: {
    color: C.text,
    fontFamily: F.uiSemiBold,
    fontSize: 13,
  },
  stepLabelDone: {
    color: C.muted,
    textDecorationLine: "line-through",
  },
  stepDesc: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 4,
  },
  celebrationContainer: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "rgba(146, 119, 200, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(146, 119, 200, 0.2)",
    alignItems: "center",
  },
  pulseIcon: {
    marginBottom: 4,
  },
  celebrationText: {
    color: C.text,
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    textAlign: "center",
  },
  celebrationSub: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 15,
  },
  disclaimerContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.cardBdr,
    paddingTop: 8,
  },
  disclaimerText: {
    color: C.faint,
    fontFamily: F.uiRegular,
    fontSize: 10,
    lineHeight: 14,
  },

  // Curriculum poses list
  posesList: {
    gap: 8,
    marginBottom: 8,
  },
  poseItem: {
    backgroundColor: "rgba(38, 30, 40, 0.3)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBdr,
    overflow: "hidden",
  },
  poseItemDone: {
    borderColor: "rgba(146, 119, 200, 0.25)",
    backgroundColor: "rgba(146, 119, 200, 0.04)",
  },
  poseItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  checkboxMini: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: C.faint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxActiveMini: {
    backgroundColor: C.purple,
    borderColor: C.purple,
  },
  poseItemTitlePressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  poseItemTitleCol: {
    flex: 1,
  },
  poseItemName: {
    color: C.text,
    fontFamily: F.uiSemiBold,
    fontSize: 13,
  },
  poseItemNameDone: {
    color: C.muted,
    textDecorationLine: "line-through",
  },
  poseItemType: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 11,
    marginTop: 1,
  },
  poseItemDetail: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: C.cardBdr,
  },
  poseItemDesc: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 11.5,
    lineHeight: 16,
  },

  pressed: {
    transform: [{ scale: 0.96 }],
  },
  inputVoiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(146, 119, 200, 0.08)",
    borderColor: "rgba(146, 119, 200, 0.16)",
    borderWidth: 1,
  },
  inputVoiceBtnActive: {
    backgroundColor: "rgba(212, 92, 130, 0.12)",
    borderColor: "rgba(212, 92, 130, 0.25)",
  },
  inlineVoiceAnim: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight: 6,
  },
  inlineAnimBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: C.pink,
  },
});
