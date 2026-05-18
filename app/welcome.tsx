import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { CachedImage } from "../components/CachedImage";
import { F } from "../constants/fonts";

const { width: W, height: H } = Dimensions.get("window");

const bloopWelcome = require("../public/images/bloop-welcome.webp");
const bloopInsight = require("../public/images/bloop-insight.webp");
const bloopCalm    = require("../public/images/bloop-calm.webp");

const C = {
  bg:         "#FBF8F5",
  bgDeep:     "#F2E8DF",
  text:       "#2B2D42",
  muted:      "#7D6E66",
  faint:      "#B5A89F",
  terracotta: "#E07A5F",
  peach:      "#F4A261",
  sage:       "#81B29A",
  lavender:   "#BDB2FF",
  card:       "rgba(255,255,255,0.82)",
  border:     "rgba(224,122,95,0.14)",
};

const FEATURES = [
  { label: "Cycle Tracking", color: C.terracotta, bg: "rgba(224,122,95,0.10)" },
  { label: "Mood & Emotions", color: C.sage,       bg: "rgba(129,178,154,0.12)" },
  { label: "AI Insights",    color: C.lavender,    bg: "rgba(189,178,255,0.14)" },
  { label: "Nourishment",    color: C.peach,       bg: "rgba(244,162,97,0.12)"  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  // ── Animation values ───────────────────────────────────────────────
  const heroOpacity   = useRef(new Animated.Value(0)).current;
  const heroScale     = useRef(new Animated.Value(0.84)).current;
  const heroFloat     = useRef(new Animated.Value(0)).current;
  const haloScale     = useRef(new Animated.Value(0.92)).current;
  const badgeOpacity  = useRef(new Animated.Value(0)).current;
  const badgeSlide    = useRef(new Animated.Value(14)).current;
  const textOpacity   = useRef(new Animated.Value(0)).current;
  const textSlide     = useRef(new Animated.Value(28)).current;
  const tagsOpacity   = useRef(new Animated.Value(0)).current;
  const tagsSlide     = useRef(new Animated.Value(20)).current;
  const ctaOpacity    = useRef(new Animated.Value(0)).current;
  const ctaSlide      = useRef(new Animated.Value(30)).current;
  const trustOpacity  = useRef(new Animated.Value(0)).current;
  const petal1        = useRef(new Animated.Value(0)).current;
  const petal2        = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ── Entrance sequence ──────────────────────────────────────────
    Animated.stagger(110, [
      // 1. Hero image
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 680, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(heroScale,   { toValue: 1, tension: 52, friction: 8, useNativeDriver: true }),
      ]),
      // 2. Badge
      Animated.parallel([
        Animated.timing(badgeOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(badgeSlide,   { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 3. Text block
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(textSlide,   { toValue: 0, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 4. Feature tags
      Animated.parallel([
        Animated.timing(tagsOpacity, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(tagsSlide,   { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 5. CTAs
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ctaSlide,   { toValue: 0, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 6. Trust row
      Animated.timing(trustOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // ── Continuous float ───────────────────────────────────────────
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, { toValue: -11, duration: 2900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(heroFloat, { toValue:   0, duration: 2900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // ── Halo breathe ──────────────────────────────────────────────
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloScale, { toValue: 1.06, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(haloScale, { toValue: 0.92, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // ── Botanical loops ────────────────────────────────────────────
    const botanicalLoop = (val: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
    botanicalLoop(petal1, 9000).start();
    botanicalLoop(petal2, 12000).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const petal1Style = {
    transform: [
      { translateX: petal1.interpolate({ inputRange: [0, 1], outputRange: [0,  16] }) },
      { translateY: petal1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
      { rotate:    petal1.interpolate({ inputRange: [0, 1], outputRange: ["-9deg", "9deg"] }) },
    ],
  };
  const petal2Style = {
    transform: [
      { translateX: petal2.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
      { translateY: petal2.interpolate({ inputRange: [0, 1], outputRange: [0,  16] }) },
      { rotate:    petal2.interpolate({ inputRange: [0, 1], outputRange: ["7deg", "-7deg"] }) },
    ],
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      {/* ── Background gradient ─────────────────────────────── */}
      <LinearGradient
        colors={[C.bg, "#F7EDE4", "#EDE4F0"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Ambient orbs ────────────────────────────────────── */}
      <View style={styles.orbTopLeft}   pointerEvents="none" />
      <View style={styles.orbBottomRight} pointerEvents="none" />

      {/* ── Botanical decorations ────────────────────────────── */}
      <Animated.View style={[styles.botanicalTR, petal1Style]} pointerEvents="none">
        <BotanicalBloom />
      </Animated.View>
      <Animated.View style={[styles.botanicalBL, petal2Style]} pointerEvents="none">
        <BotanicalLeaves />
      </Animated.View>

      {/* ── Main content ─────────────────────────────────────── */}
      <View style={styles.inner}>

        {/* Hero */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: heroOpacity,
              transform: [{ scale: heroScale }, { translateY: heroFloat }],
            },
          ]}
        >
          {/* Outer halo ring (breathes) */}
          <Animated.View style={[styles.haloOuter, { transform: [{ scale: haloScale }] }]} />
          {/* Inner halo rings */}
          <View style={styles.haloMid} />
          <View style={styles.haloInner} />

          {/* Bloop avatar */}
          <View style={styles.bloopCircle}>
            <LinearGradient
              colors={["rgba(255,248,245,0.98)", "rgba(255,231,214,0.92)"]}
              style={StyleSheet.absoluteFill}
            />
            <CachedImage
              source={bloopWelcome}
              style={styles.bloopImage}
              priority="high"
            />
          </View>

          {/* Floating badge — AI companion */}
          <Animated.View
            style={[
              styles.badge,
              { opacity: badgeOpacity, transform: [{ translateY: badgeSlide }] },
            ]}
          >
            <CachedImage source={bloopInsight} style={styles.badgeBloop} />
            <View style={styles.badgeText}>
              <Text style={styles.badgeName}>Bloop</Text>
              <Text style={styles.badgeSub}>Your AI companion</Text>
            </View>
            <View style={styles.onlineDot} />
          </Animated.View>

          {/* Floating mini card — cycle insight */}
          <Animated.View
            style={[
              styles.miniCard,
              { opacity: badgeOpacity, transform: [{ translateY: Animated.multiply(badgeSlide, -1) }] },
            ]}
          >
            <CachedImage source={bloopCalm} style={styles.miniCardBloop} />
            <Text style={styles.miniCardText}>Cycle · Day 14</Text>
            <View style={styles.miniCardDot} />
          </Animated.View>
        </Animated.View>

        {/* Text block */}
        <Animated.View
          style={[
            styles.textBlock,
            { opacity: textOpacity, transform: [{ translateY: textSlide }] },
          ]}
        >
          <Text style={styles.eyebrow}>WOMEN'S WELLNESS INTELLIGENCE</Text>
          <Text style={styles.headline}>
            Know your body.{"\n"}
            <Text style={styles.headlineAccent}>Feel like yourself.</Text>
          </Text>
          <Text style={styles.body}>
            Track your cycle, understand your hormones, and get
            gentle AI guidance — completely private.
          </Text>
        </Animated.View>

        {/* Feature tags */}
        <Animated.View
          style={[
            styles.tagsRow,
            { opacity: tagsOpacity, transform: [{ translateY: tagsSlide }] },
          ]}
        >
          {FEATURES.map((f) => (
            <View key={f.label} style={[styles.tag, { backgroundColor: f.bg }]}>
              <View style={[styles.tagDot, { backgroundColor: f.color }]} />
              <Text style={[styles.tagLabel, { color: f.color }]}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTAs */}
        <Animated.View
          style={[
            styles.ctaBlock,
            { opacity: ctaOpacity, transform: [{ translateY: ctaSlide }] },
          ]}
        >
          {/* Primary */}
          <Pressable
            onPress={() => router.push("/register")}
            style={({ pressed }) => [styles.primaryShell, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Begin your journey — create account"
          >
            <LinearGradient
              colors={[C.terracotta, C.peach]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryText}>Begin Your Journey</Text>
              <View style={styles.primaryArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Secondary */}
          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Sign in to existing account"
          >
            <Text style={styles.secondaryText}>I already have an account</Text>
          </Pressable>
        </Animated.View>

        {/* Trust row */}
        <Animated.View style={[styles.trustRow, { opacity: trustOpacity }]}>
          <TrustPill label="Private" />
          <View style={styles.trustSep} />
          <TrustPill label="No data sold" />
          <View style={styles.trustSep} />
          <TrustPill label="Yours always" />
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function TrustPill({ label }: { label: string }) {
  return (
    <View style={styles.trustPill}>
      <View style={styles.trustDot} />
      <Text style={styles.trustLabel}>{label}</Text>
    </View>
  );
}

function BotanicalBloom() {
  return (
    <Svg width={150} height={150} viewBox="0 0 100 100" fill="none">
      <Path d="M50 50C50 30 70 10 90 10C90 30 70 50 50 50Z" fill="rgba(224,122,95,0.18)" />
      <Path d="M50 50C70 50 90 70 90 90C70 90 50 70 50 50Z" fill="rgba(224,122,95,0.15)" />
      <Path d="M50 50C50 70 30 90 10 90C10 70 30 50 50 50Z" fill="rgba(224,122,95,0.18)" />
      <Path d="M50 50C30 50 10 30 10 10C30 10 50 30 50 50Z" fill="rgba(224,122,95,0.15)" />
      <Circle cx={50} cy={50} r={8} fill="rgba(244,162,97,0.28)" />
    </Svg>
  );
}

function BotanicalLeaves() {
  return (
    <Svg width={130} height={130} viewBox="0 0 100 100" fill="none">
      <Path
        d="M10 90C30 90 50 70 55 50C60 30 75 10 100 5"
        stroke="rgba(129,178,154,0.30)"
        strokeWidth={2}
      />
      <Ellipse cx={28} cy={72} rx={11} ry={17} transform="rotate(-45 28 72)" fill="rgba(129,178,154,0.20)" />
      <Ellipse cx={72} cy={28} rx={11} ry={17} transform="rotate(-45 72 28)" fill="rgba(129,178,154,0.20)" />
      <Ellipse cx={46} cy={54} rx={7}  ry={11} transform="rotate(-45 46 54)" fill="rgba(129,178,154,0.14)" />
    </Svg>
  );
}

// ── Styles ──────────────────────────────────────────────────────────
const HERO_SIZE  = Math.min(W * 0.54, 224);
const BLOOP_SIZE = HERO_SIZE * 0.72;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  orbTopLeft: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(224,122,95,0.08)",
  },
  orbBottomRight: {
    position: "absolute",
    bottom: -80,
    right: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(129,178,154,0.08)",
  },
  botanicalTR: {
    position: "absolute",
    top: -20,
    right: -30,
    zIndex: 0,
  },
  botanicalBL: {
    position: "absolute",
    bottom: 80,
    left: -20,
    zIndex: 0,
  },

  // ── Main column ──────────────────────────────────────────
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 24,
    paddingVertical: 8,
    zIndex: 2,
  },

  // ── Hero ──────────────────────────────────────────────────
  heroSection: {
    width: HERO_SIZE + 80,
    height: HERO_SIZE + 80,
    alignItems: "center",
    justifyContent: "center",
  },
  haloOuter: {
    position: "absolute",
    width: HERO_SIZE + 72,
    height: HERO_SIZE + 72,
    borderRadius: (HERO_SIZE + 72) / 2,
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.12)",
  },
  haloMid: {
    position: "absolute",
    width: HERO_SIZE + 36,
    height: HERO_SIZE + 36,
    borderRadius: (HERO_SIZE + 36) / 2,
    borderWidth: 1,
    borderColor: "rgba(244,162,97,0.16)",
  },
  haloInner: {
    position: "absolute",
    width: HERO_SIZE + 8,
    height: HERO_SIZE + 8,
    borderRadius: (HERO_SIZE + 8) / 2,
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.22)",
  },
  bloopCircle: {
    width: HERO_SIZE,
    height: HERO_SIZE,
    borderRadius: HERO_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 36,
    elevation: 12,
  },
  bloopImage: {
    width: BLOOP_SIZE,
    height: BLOOP_SIZE,
  },

  // ── Floating badge ────────────────────────────────────────
  badge: {
    position: "absolute",
    bottom: -6,
    right: -14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  badgeBloop: { width: 30, height: 30, borderRadius: 10 },
  badgeText:  { gap: 1 },
  badgeName:  { fontSize: 11, fontWeight: "800", color: C.text, letterSpacing: 0.2 },
  badgeSub:   { fontSize: 9,  fontWeight: "700", color: C.muted, letterSpacing: 0.2 },
  onlineDot: {
    position: "absolute",
    top: 7,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.sage,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },

  // ── Mini card ─────────────────────────────────────────────
  miniCard: {
    position: "absolute",
    top: 4,
    left: -18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: C.sage,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  miniCardBloop:  { width: 22, height: 22, borderRadius: 8 },
  miniCardText:   { fontSize: 10, fontWeight: "800", color: C.text },
  miniCardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.terracotta,
  },

  // ── Text block ────────────────────────────────────────────
  textBlock: {
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 4,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2.6,
    textTransform: "uppercase",
    color: C.terracotta + "AA",
    textAlign: "center",
  },
  headline: {
    fontFamily: F.luxuryExtraBold,
    fontSize: H < 700 ? 26 : 30,
    lineHeight: H < 700 ? 33 : 38,
    textAlign: "center",
    color: C.text,
  },
  headlineAccent: {
    fontFamily: F.luxuryItalic,
    color: C.terracotta,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
    color: C.muted,
    maxWidth: 300,
  },

  // ── Feature tags ──────────────────────────────────────────
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 50,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  // ── CTAs ──────────────────────────────────────────────────
  ctaBlock: {
    width: "100%",
    gap: 12,
  },
  primaryShell: {
    borderRadius: 50,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.30,
    shadowRadius: 24,
    elevation: 8,
  },
  primaryBtn: {
    height: 58,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  primaryArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.60)",
    borderWidth: 1.5,
    borderColor: "rgba(224,122,95,0.22)",
  },
  secondaryText: {
    color: C.muted,
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.975 }],
  },

  // ── Trust row ─────────────────────────────────────────────
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.sage,
  },
  trustLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: C.faint,
  },
  trustSep: {
    width: 1,
    height: 10,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
});
