/**
 * Onboarding Screen 6 — Sanctuary / Ready
 *
 * Cinematic transition screen. Bloop surrounded by orbiting wellness icons,
 * floating glassmorphic insight cards, cycling phrases, energy field, and a
 * glowing "Enter sanctuary" CTA that completes onboarding.
 *
 * No user input — purely atmospheric + emotional. Think: luxury wellness AI
 * preparing a private sanctuary.
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { useOnboardingStore } from "../../store/onboardingStore";

// ─── Geometry ─────────────────────────────────────────────────────────────────
const { width: W } = Dimensions.get("window");
const SIDE_PAD  = 20;
const HERO_H    = 510;
const HERO_CX   = W / 2;
const HERO_CY   = 238;
const ORBIT_R   = 102;
const BADGE_SZ  = 48;
const BADGE_H   = BADGE_SZ / 2;

// Floating card dimensions
const FC_W = 148;   // corner card width
const FC_H = 88;    // corner card height
const MC_W = 162;   // center card width
const MC_H = 100;   // center card height

// ─── Assets ───────────────────────────────────────────────────────────────────
const imgBloop = require("../../public/images/bloop-welcome.webp");

// ─── Cycling phrases ──────────────────────────────────────────────────────────
const PHRASES = [
  "Understanding your wellness rhythm…",
  "Learning your emotional patterns…",
  "Building your hormone-aware insights…",
  "Preparing your personalized sanctuary…",
  "Creating your wellness space…",
];

// ─── Orbit badges ─────────────────────────────────────────────────────────────
type OBadge = {
  angleDeg:  number;
  iconLib:   "ion" | "mci";
  icon:      string;
  iconColor: string;
  bg:        string;
};

const ORBIT_BADGES: OBadge[] = [
  { angleDeg: -90,  iconLib: "ion", icon: "moon",          iconColor: "#7040C0", bg: "#D8C8F4" },
  { angleDeg: -15,  iconLib: "mci", icon: "flower",        iconColor: "#C04870", bg: "#FFD4E8" },
  { angleDeg:  30,  iconLib: "ion", icon: "water",         iconColor: "#2878C0", bg: "#C8E4F8" },
  { angleDeg:  90,  iconLib: "ion", icon: "sunny",         iconColor: "#B08000", bg: "#FEF0C0" },
  { angleDeg: 150,  iconLib: "mci", icon: "meditation",    iconColor: "#387848", bg: "#C8E8D0" },
  { angleDeg: 210,  iconLib: "ion", icon: "heart",         iconColor: "#C04870", bg: "#FDDDE8" },
];

function badgePos(a: OBadge) {
  const rad = (a.angleDeg * Math.PI) / 180;
  return {
    left: HERO_CX + Math.cos(rad) * ORBIT_R - BADGE_H,
    top:  HERO_CY + Math.sin(rad) * ORBIT_R - BADGE_H,
  };
}

// ─── Floating cards ───────────────────────────────────────────────────────────
type FCard = {
  id:       string;
  title:    string;
  content:  string;
  grad:     [string, string];
  textColor:string;
  iconLib:  "ion" | "mci";
  icon:     string;
  iconColor:string;
  // position relative to full-width hero
  pos: { left?: number; right?: number; top: number };
  width:    number;
  height:   number;
  driftDir: 1 | -1;
};

const FLOAT_CARDS: FCard[] = [
  {
    id: "emotional",
    title: "Emotional Insight",
    content: "",
    grad: ["rgba(255,210,220,0.70)", "rgba(255,240,244,0.56)"],
    textColor: "#8A2848",
    iconLib: "ion", icon: "heart", iconColor: "#C04870",
    pos: { left: 12, top: 62 },
    width: FC_W, height: FC_H,
    driftDir: -1,
  },
  {
    id: "sleep",
    title: "Sleep Rhythm",
    content: "7h 25m",
    grad: ["rgba(200,186,240,0.70)", "rgba(232,228,252,0.56)"],
    textColor: "#42207A",
    iconLib: "ion", icon: "moon", iconColor: "#6040B0",
    pos: { left: W - FC_W - 12, top: 62 },
    width: FC_W, height: FC_H,
    driftDir: 1,
  },
  {
    id: "cycle",
    title: "Cycle Sync",
    content: "Your rhythm is beautiful ♡",
    grad: ["rgba(248,196,164,0.70)", "rgba(254,232,218,0.56)"],
    textColor: "#7A3818",
    iconLib: "mci", icon: "chart-donut", iconColor: "#C05830",
    pos: { left: 10, top: 336 },
    width: FC_W, height: FC_H,
    driftDir: -1,
  },
  {
    id: "wellness",
    title: "Wellness Tip",
    content: "Hydration is your superpower today",
    grad: ["rgba(170,220,200,0.70)", "rgba(218,244,234,0.56)"],
    textColor: "#1A5840",
    iconLib: "ion", icon: "water", iconColor: "#1A6840",
    pos: { left: W - FC_W - 10, top: 336 },
    width: FC_W, height: FC_H,
    driftDir: 1,
  },
  {
    id: "routine",
    title: "Today's Routine",
    content: "Mindful Morning ✦",
    grad: ["rgba(248,220,150,0.70)", "rgba(254,244,210,0.56)"],
    textColor: "#6A4400",
    iconLib: "ion", icon: "calendar", iconColor: "#9A6400",
    pos: { left: (W - MC_W) / 2, top: 390 },
    width: MC_W, height: MC_H,
    driftDir: -1,
  },
];

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = {
  terra:     "#E07A5F",
  onSurface: "#1C1428",
  onVariant: "#5C4870",
  surface:   "rgba(255,255,255,0.48)",
  border:    "rgba(255,255,255,0.76)",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReadyScreen() {
  const router            = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const name              = useOnboardingStore((s) => s.name);

  const [error,     setError    ] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);

  // ── Animations ──────────────────────────────────────────────────────────
  const breathe    = useRef(new Animated.Value(0)).current;
  const floatY     = useRef(new Animated.Value(0)).current;
  const auraOp     = useRef(new Animated.Value(0.30)).current;
  const ring1Rot   = useRef(new Animated.Value(0)).current;
  const ring2Rot   = useRef(new Animated.Value(0)).current;
  const phraseAnim = useRef(new Animated.Value(1)).current;
  const driftA     = useRef(new Animated.Value(0)).current;
  const driftB     = useRef(new Animated.Value(0)).current;
  const energyPulse = useRef(new Animated.Value(0)).current;
  const bannerIn   = useRef(new Animated.Value(0)).current;
  const glowIn     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mkLoop = (av: Animated.Value, dur: number, to = 1) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(av, { toValue: to,   duration: dur, useNativeDriver: true }),
          Animated.timing(av, { toValue: 0,    duration: dur, useNativeDriver: true }),
        ])
      );

    const loops = [
      mkLoop(breathe, 3200),
      mkLoop(floatY, 2800),
      mkLoop(auraOp, 2600),
      mkLoop(driftA, 3800),
      mkLoop(driftB, 4600),
      mkLoop(energyPulse, 2000),
      Animated.loop(Animated.timing(ring1Rot, { toValue: 1, duration: 22000, useNativeDriver: true })),
      Animated.loop(Animated.timing(ring2Rot, { toValue: 1, duration: 32000, useNativeDriver: true })),
    ];
    loops.forEach((l) => l.start());

    // Entrance animations
    Animated.parallel([
      Animated.timing(bannerIn, { toValue: 1, duration: 900, delay: 400, useNativeDriver: true }),
      Animated.timing(glowIn,   { toValue: 1, duration: 1200, delay: 200, useNativeDriver: true }),
    ]).start();

    // Cycling phrase text
    const phraseInterval = setInterval(() => {
      Animated.timing(phraseAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        Animated.timing(phraseAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      });
    }, 3200);

    return () => {
      loops.forEach((l) => l.stop());
      clearInterval(phraseInterval);
    };
  }, [breathe, floatY, auraOp, driftA, driftB, energyPulse, ring1Rot, ring2Rot, phraseAnim, bannerIn, glowIn]);

  // Derived interpolations
  const bloopScale  = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const bloopFloat  = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });
  const ring1Rotate = ring1Rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg",  "360deg"] });
  const ring2Rotate = ring2Rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });
  const energyScale = energyPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const energyOp    = energyPulse.interpolate({ inputRange: [0, 1], outputRange: [0.50, 0.85] });
  const bannerY     = bannerIn.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const glowOpacity = glowIn.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const driftAY = driftA.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const driftBY = driftB.interpolate({ inputRange: [0, 1], outputRange: [0,  7] });

  // ── CTA ─────────────────────────────────────────────────────────────────
  function handleEnter() {
    setError("");
    void completeOnboarding()
      .then((ok) => {
        if (ok) router.replace("/(tabs)/dashboard");
        else setError("Something did not save gently. Please try again.");
      })
      .catch(() => setError("Something did not save gently. Please try again."));
  }

  return (
    <View style={s.root}>
      {/* ── Atmospheric background ─────────────────────────────────────── */}
      <LinearGradient
        colors={["#CCBAE8", "#D8C4EC", "#EDD4E4", "#F8E4D2"]}
        locations={[0, 0.28, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Blobs */}
      <View pointerEvents="none" style={s.blob1} />
      <View pointerEvents="none" style={s.blob2} />
      <View pointerEvents="none" style={s.blob3} />

      {/* Hero warm golden glow */}
      <Animated.View pointerEvents="none" style={[s.heroGoldenGlow, { opacity: glowOpacity }]} />

      {/* Botanical shadow overlays */}
      <View pointerEvents="none" style={s.botanicalLeft}>
        <MaterialCommunityIcons name="leaf" size={58} color="rgba(160,200,140,0.30)" style={{ transform: [{ rotate: "-40deg" }] }} />
        <MaterialCommunityIcons name="leaf" size={40} color="rgba(160,200,140,0.22)" style={{ marginTop: 8, transform: [{ rotate: "-20deg" }] }} />
      </View>
      <View pointerEvents="none" style={s.botanicalRight}>
        <MaterialCommunityIcons name="leaf" size={48} color="rgba(200,160,220,0.28)" style={{ transform: [{ rotate: "50deg" }] }} />
        <MaterialCommunityIcons name="leaf" size={34} color="rgba(200,160,220,0.20)" style={{ marginTop: 6, transform: [{ rotate: "25deg" }] }} />
      </View>

      {/* Floating ambient particles */}
      <AmbientParticles breathe={breathe} />

      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandSub}>Your wellness sanctuary</Text>
          </View>
          <View style={s.lotusBtn}>
            <MaterialCommunityIcons name="spa" size={20} color={C.onVariant} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Hero orbit scene ─────────────────────────────────────── */}
          <View style={{ width: W, height: HERO_H }}>

            {/* Orbit ring 3 — outermost, rotates clockwise */}
            <Animated.View
              pointerEvents="none"
              style={[
                s.orbitRing,
                {
                  width:  (ORBIT_R + 36) * 2,
                  height: (ORBIT_R + 36) * 2,
                  borderRadius: ORBIT_R + 36,
                  left: HERO_CX - ORBIT_R - 36,
                  top:  HERO_CY - ORBIT_R - 36,
                },
                { transform: [{ rotate: ring1Rotate }] },
              ]}
            />

            {/* Orbit ring 2 — middle, rotates counterclockwise */}
            <Animated.View
              pointerEvents="none"
              style={[
                s.orbitRing,
                s.orbitRingMid,
                {
                  width:  ORBIT_R * 2 + BADGE_SZ + 4,
                  height: ORBIT_R * 2 + BADGE_SZ + 4,
                  borderRadius: ORBIT_R + BADGE_H + 2,
                  left: HERO_CX - ORBIT_R - BADGE_H - 2,
                  top:  HERO_CY - ORBIT_R - BADGE_H - 2,
                },
                { transform: [{ rotate: ring2Rotate }] },
              ]}
            />

            {/* Orbit ring 1 — innermost, static soft glow */}
            <View
              pointerEvents="none"
              style={[
                s.orbitRing,
                s.orbitRingInner,
                {
                  width:  130,
                  height: 130,
                  borderRadius: 65,
                  left: HERO_CX - 65,
                  top:  HERO_CY - 65,
                },
              ]}
            />

            {/* Orbital badge nodes */}
            {ORBIT_BADGES.map((badge, i) => {
              const pos    = badgePos(badge);
              const drift  = (i % 2 === 0 ? driftAY : driftBY);
              return (
                <Animated.View
                  key={i}
                  pointerEvents="none"
                  style={[
                    s.orbitBadge,
                    { left: pos.left, top: pos.top, backgroundColor: badge.bg },
                    { transform: [{ translateY: drift }] },
                  ]}
                >
                  {badge.iconLib === "ion" ? (
                    <Ionicons name={badge.icon as any} size={22} color={badge.iconColor} />
                  ) : (
                    <MaterialCommunityIcons name={badge.icon as any} size={22} color={badge.iconColor} />
                  )}
                </Animated.View>
              );
            })}

            {/* Hero glow rings */}
            <Animated.View
              pointerEvents="none"
              style={[s.heroAura2, { opacity: auraOp, left: HERO_CX - 80, top: HERO_CY - 80 }]}
            />
            <Animated.View
              pointerEvents="none"
              style={[s.heroAura1, { opacity: auraOp, left: HERO_CX - 56, top: HERO_CY - 56 }]}
            />

            {/* Bloop */}
            <Animated.View
              style={[
                s.bloopWrap,
                { left: HERO_CX - 58, top: HERO_CY - 56 },
                { transform: [{ scale: bloopScale }, { translateY: bloopFloat }] },
              ]}
            >
              <View style={s.bloopGlow} />
              <CachedImage priority="high" source={imgBloop} style={s.bloopImg} contentFit="contain" />
            </Animated.View>

            {/* Floating glassmorphic cards */}
            {FLOAT_CARDS.map((card) => {
              const floatTY = card.driftDir === -1 ? driftAY : driftBY;
              return (
                <FloatingCard
                  key={card.id}
                  card={card}
                  floatY={floatTY}
                />
              );
            })}
          </View>

          {/* ── Cycling phrase text ──────────────────────────────────── */}
          <View style={s.phraseSection}>
            <Animated.Text style={[s.phraseText, { opacity: phraseAnim }]}>
              {PHRASES[phraseIdx]}
            </Animated.Text>
            <Text style={s.phraseSub}>
              Your wellness story is uniquely yours.{"  "}
              <Ionicons name="heart-outline" size={14} color={C.onVariant} />
            </Text>
          </View>

          {/* ── Energy field visual ──────────────────────────────────── */}
          <View style={s.energyField}>
            {/* Wave lines */}
            <LinearGradient
              colors={["transparent", "rgba(180,140,240,0.38)", "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={s.waveLine}
            />
            <LinearGradient
              colors={["transparent", "rgba(240,160,120,0.28)", "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[s.waveLine, { marginTop: 10, opacity: 0.70 }]}
            />

            {/* Central energy orb */}
            <Animated.View
              style={[
                s.energyOrb,
                { transform: [{ scale: energyScale }], opacity: energyOp },
              ]}
            >
              <LinearGradient
                colors={["#E0B8F8", "#C890F0", "#B068E8"]}
                style={s.energyOrbGrad}
              />
            </Animated.View>

            {/* Second wave (behind) */}
            <LinearGradient
              colors={["transparent", "rgba(160,180,240,0.22)", "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[s.waveLine, { marginTop: 14 }]}
            />
          </View>

          {/* ── Bottom banner ─────────────────────────────────────────── */}
          <Animated.View
            style={[
              s.banner,
              { transform: [{ translateY: bannerY }], opacity: bannerIn },
            ]}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.52)", "rgba(255,255,255,0.38)"]}
              style={s.bannerGrad}
            >
              {/* Portal illustration */}
              <PortalIllustration />

              {/* Text */}
              <View style={s.bannerText}>
                <Text style={s.bannerTitle}>
                  Preparing your personalized sanctuary…
                </Text>
                <Text style={s.bannerSub}>
                  {name.trim()
                    ? `Welcome, ${name.trim().split(" ")[0]}. Entering your dashboard…`
                    : "Entering your personalized dashboard…"}
                </Text>
              </View>

              {/* Chevron CTA */}
              <Pressable
                onPress={handleEnter}
                style={({ pressed }) => [s.chevronShell, pressed && s.pressed]}
              >
                <LinearGradient
                  colors={["#E07A5F", "#F4A27D"]}
                  style={s.chevronBtn}
                >
                  <Ionicons name="chevron-forward" size={20} color="#FFF" />
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          {/* ── Page dots (6, last = ring indicator) ─────────────────── */}
          <View style={s.dotsRow}>
            {[0, 1, 2, 3, 4, 5].map((i) =>
              i === 5 ? (
                <View key={i} style={s.dotRingOuter}>
                  <View style={s.dotRingInner} />
                </View>
              ) : (
                <View key={i} style={s.dot} />
              )
            )}
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── FloatingCard ─────────────────────────────────────────────────────────────
function FloatingCard({
  card,
  floatY,
}: {
  card: FCard;
  floatY: Animated.AnimatedInterpolation<string | number>;
}) {
  return (
    <Animated.View
      style={[
        s.floatCard,
        {
          left:   card.pos.left ?? 0,
          top:    card.pos.top,
          width:  card.width,
          height: card.height,
        },
        { transform: [{ translateY: floatY }] },
      ]}
    >
      <LinearGradient colors={card.grad} style={s.floatCardGrad}>
        {/* Header row */}
        <View style={s.floatCardHeader}>
          <Text style={[s.floatCardTitle, { color: card.textColor }]} numberOfLines={1}>
            {card.title}
          </Text>
          <View style={[s.floatCardIconBox, { backgroundColor: card.iconColor + "1E" }]}>
            {card.iconLib === "ion" ? (
              <Ionicons name={card.icon as any} size={13} color={card.iconColor} />
            ) : (
              <MaterialCommunityIcons name={card.icon as any} size={13} color={card.iconColor} />
            )}
          </View>
        </View>

        {/* Content */}
        {card.content ? (
          <Text style={[s.floatCardContent, { color: card.textColor }]} numberOfLines={2}>
            {card.content}
          </Text>
        ) : null}

        {/* Decorative line (Emotional Insight wave) */}
        <View style={s.floatCardLine}>
          <LinearGradient
            colors={["transparent", card.iconColor + "66", "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ height: 1.5, borderRadius: 1 }}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── PortalIllustration ───────────────────────────────────────────────────────
function PortalIllustration() {
  return (
    <View style={s.portalWrap}>
      {/* Glow behind */}
      <View style={s.portalGlow} />
      {/* Arch shape */}
      <View style={s.portalArch}>
        <LinearGradient
          colors={["#FFF8E0", "#FFE480", "#FFCC40"]}
          style={s.portalArchGrad}
        >
          <Ionicons name="sunny" size={16} color="rgba(255,255,255,0.90)" />
        </LinearGradient>
      </View>
      {/* Tiny leaf flankers */}
      <View style={s.portalLeafL}>
        <MaterialCommunityIcons name="leaf" size={13} color="rgba(100,170,80,0.65)" style={{ transform: [{ rotate: "-40deg" }] }} />
      </View>
      <View style={s.portalLeafR}>
        <MaterialCommunityIcons name="leaf" size={10} color="rgba(100,170,80,0.50)" style={{ transform: [{ rotate: "40deg" }] }} />
      </View>
    </View>
  );
}

// ─── AmbientParticles ─────────────────────────────────────────────────────────
const PARTICLE_POS = [
  { top:  90, left: "7%",  sz: 7 },
  { top: 200, left: "86%", sz: 5 },
  { top: 380, left: "4%",  sz: 8 },
  { top: 540, left: "91%", sz: 6 },
  { top: 700, left: "12%", sz: 5 },
  { top: 820, left: "84%", sz: 7 },
] as const;

function AmbientParticles({ breathe }: { breathe: Animated.Value }) {
  const opacities = useRef(
    PARTICLE_POS.map((_, i) =>
      breathe.interpolate({
        inputRange: [0, 1],
        outputRange: [0.10 + i * 0.04, 0.34 + i * 0.04],
      })
    )
  ).current;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PARTICLE_POS.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            width: p.sz,
            height: p.sz,
            borderRadius: p.sz / 2,
            backgroundColor: "rgba(200,150,240,0.55)",
            opacity: opacities[i],
          }}
        />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#CCBAE8",
  },
  safe: { flex: 1 },

  // Blobs
  blob1: {
    position: "absolute", top: -180, left: -130,
    width: 440, height: 440, borderRadius: 220,
    backgroundColor: "rgba(200,170,240,0.36)",
  },
  blob2: {
    position: "absolute", top: 340, right: -170,
    width: 420, height: 420, borderRadius: 210,
    backgroundColor: "rgba(248,196,180,0.28)",
  },
  blob3: {
    position: "absolute", bottom: -80, left: -60,
    width: 360, height: 360, borderRadius: 180,
    backgroundColor: "rgba(180,220,200,0.18)",
  },

  // Hero golden glow
  heroGoldenGlow: {
    position: "absolute",
    top: 40,
    left: W / 2 - 180,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(255,218,120,0.26)",
  },

  // Botanicals
  botanicalLeft: {
    position: "absolute",
    left: -10,
    top: 200,
    gap: 4,
  },
  botanicalRight: {
    position: "absolute",
    right: -8,
    top: 280,
    alignItems: "flex-end",
    gap: 4,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 8,
    paddingBottom: 6,
  },
  brandName: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: C.onSurface,
    letterSpacing: 0.3,
  },
  brandSub: {
    fontFamily: F.bodyRegular,
    fontSize: 13,
    color: C.onVariant,
    marginTop: 1,
  },
  lotusBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.48)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.80)",
    shadowColor: "#8B5E6D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 10, elevation: 2,
  },

  scroll: {
    alignItems: "center",
    paddingBottom: 16,
  },

  // ── Orbit ──────────────────────────────────────────────────────────────
  orbitRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(230,190,90,0.30)",
  },
  orbitRingMid: {
    borderColor: "rgba(200,160,240,0.24)",
    borderWidth: 0.5,
  },
  orbitRingInner: {
    borderWidth: 1.5,
    borderColor: "rgba(240,200,180,0.36)",
    backgroundColor: "rgba(255,230,200,0.08)",
  },
  orbitBadge: {
    position: "absolute",
    width: BADGE_SZ,
    height: BADGE_SZ,
    borderRadius: BADGE_SZ / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    shadowColor: "#6040A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 10, elevation: 3,
  },

  // Bloop
  heroAura2: {
    position: "absolute",
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1.5, borderColor: "rgba(200,140,240,0.28)",
  },
  heroAura1: {
    position: "absolute",
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: "rgba(240,210,250,0.22)",
    borderWidth: 1.5, borderColor: "rgba(200,140,240,0.35)",
  },
  bloopWrap: {
    position: "absolute",
    width: 116, height: 112,
    alignItems: "center", justifyContent: "center",
  },
  bloopGlow: {
    position: "absolute",
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,220,160,0.44)",
  },
  bloopImg: {
    width: 116,
    height: 108,
  },

  // Floating cards
  floatCard: {
    position: "absolute",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#6040A0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14, shadowRadius: 18, elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  floatCardGrad: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  floatCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  floatCardTitle: {
    fontFamily: F.uiBold,
    fontSize: 11,
    letterSpacing: 0.2,
    flex: 1,
    marginRight: 4,
  },
  floatCardIconBox: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  floatCardContent: {
    fontFamily: F.uiMedium,
    fontSize: 10,
    lineHeight: 15,
    flex: 1,
  },
  floatCardLine: {
    marginTop: 4,
    paddingHorizontal: 2,
  },

  // Phrase text
  phraseSection: {
    paddingHorizontal: SIDE_PAD,
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 12,
  },
  phraseText: {
    fontFamily: F.luxuryBold,
    fontSize: 30,
    lineHeight: 36,
    color: C.onSurface,
    textAlign: "center",
    letterSpacing: 0.2,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  phraseSub: {
    fontFamily: F.uiMedium,
    fontSize: 14,
    color: C.onVariant,
    textAlign: "center",
  },

  // Energy field
  energyField: {
    width: W,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    marginVertical: 4,
  },
  waveLine: {
    position: "absolute",
    width: W * 0.90,
    height: 2,
    borderRadius: 1,
  },
  energyOrb: {
    width: 70, height: 70, borderRadius: 35,
    overflow: "hidden",
    shadowColor: "#9060C0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.50, shadowRadius: 24, elevation: 8,
  },
  energyOrbGrad: {
    flex: 1,
    borderRadius: 35,
  },

  // Bottom banner
  banner: {
    marginHorizontal: SIDE_PAD,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#7040A0",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16, shadowRadius: 22, elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.78)",
    marginBottom: 20,
    alignSelf: "stretch",
  },
  bannerGrad: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: F.uiBold,
    fontSize: 13,
    lineHeight: 18,
    color: C.onSurface,
    marginBottom: 3,
  },
  bannerSub: {
    fontFamily: F.uiRegular,
    fontSize: 11,
    lineHeight: 15,
    color: C.onVariant,
  },
  chevronShell: {
    borderRadius: 22,
    shadowColor: C.terra,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32, shadowRadius: 12, elevation: 5,
  },
  chevronBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },

  errorText: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: "#BA5B52",
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: SIDE_PAD,
  },

  // Portal illustration
  portalWrap: {
    width: 54, height: 62,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  portalGlow: {
    position: "absolute",
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,220,100,0.36)",
    top: 8,
  },
  portalArch: {
    width: 36, height: 48,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    overflow: "hidden",
    shadowColor: "#E0A000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  portalArchGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  portalLeafL: {
    position: "absolute",
    left: 0, bottom: 4,
  },
  portalLeafR: {
    position: "absolute",
    right: 2, bottom: 2,
  },

  // Page dots
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 4,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "rgba(180,140,230,0.45)",
  },
  dotRingOuter: {
    width: 16, height: 16, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
    borderColor: C.terra,
  },
  dotRingInner: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.terra,
  },

  // Misc
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
