/**
 * Onboarding Screen 6 — Soul Ready
 *
 * Ultra-simple cinematic transition screen.
 * Bloop floats in the hero. Cycling wellness quote fades below.
 * Four compact dark status cards show what's being prepared.
 * "Enter Soul" CTA completes onboarding.
 *
 * No orbit badges, no floating glassmorphic cards, no energy waves.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { getUserProfile } from "../../constants/userProfile";
import { darkColors } from "../../constants/colors";
import { useOnboardingStore } from "../../store/onboardingStore";

const { width: W } = Dimensions.get("window");
const SIDE_PAD = 20;

// ─── Assets ───────────────────────────────────────────────────────────────────
const imgBloop = require("../../public/images/bloop-welcome.webp");

// ─── Cycling quotes ───────────────────────────────────────────────────────────
const BASE_PHRASES = [
  '"Your body tells its own beautiful story."',
  '"Every cycle is a new beginning."',
  '"Wellness is how you move through each day."',
  '"Honor the energy you have right now."',
  '"Rest is productive. Rest is power."',
] as const;

// ─── Status cards (what's being prepared) ────────────────────────────────────
const STATUS_CARDS = [
  { id: "cycle",     icon: "calendar-heart-outline" as const, lib: "mci" as const, label: "Cycle profile",   accent: darkColors.periodColor   },
  { id: "wellness",  icon: "heart-pulse"             as const, lib: "mci" as const, label: "Wellness rhythm", accent: darkColors.primaryCTA    },
  { id: "emotional", icon: "heart-outline"           as const, lib: "ion" as const, label: "Emotional care",  accent: darkColors.textMuted     },
  { id: "space",     icon: "shield-check-outline"    as const, lib: "mci" as const, label: "Your Soul space", accent: darkColors.fertileColor  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReadyScreen() {
  const router             = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const name               = useOnboardingStore((s) => s.name);
  const selectedGoals      = useOnboardingStore((s) => s.selectedGoals);
  const profile            = getUserProfile(selectedGoals);
  const PHRASES            = [...BASE_PHRASES, profile.readyHeroMessage];

  const [error,     setError    ] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);

  // ── Animations ──────────────────────────────────────────────────────────────
  const breathe   = useRef(new Animated.Value(0)).current;
  const floatY    = useRef(new Animated.Value(0)).current;
  const auraOp    = useRef(new Animated.Value(0.30)).current;
  const phraseAnim = useRef(new Animated.Value(1)).current;
  const entranceOp = useRef(new Animated.Value(0)).current;
  const entranceY  = useRef(new Animated.Value(12)).current;
  // Per-card staggered entrance
  const cardAnims = useRef(STATUS_CARDS.map(() => new Animated.Value(0))).current;
  const cardYAnims = useRef(STATUS_CARDS.map(() => new Animated.Value(8))).current;

  useEffect(() => {
    const mkLoop = (av: Animated.Value, dur: number, lo: number, hi: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(av, { toValue: hi, duration: dur, useNativeDriver: true }),
          Animated.timing(av, { toValue: lo, duration: dur, useNativeDriver: true }),
        ])
      );

    const loops = [
      mkLoop(breathe, 3200, 0, 1),
      mkLoop(floatY,  2800, 0, 1),
      mkLoop(auraOp,  2600, 0.24, 0.58),
    ];
    loops.forEach((l) => l.start());

    // Screen entrance
    Animated.parallel([
      Animated.timing(entranceOp, { toValue: 1, duration: 600, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(entranceY,  { toValue: 0, duration: 600, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Staggered card entrances
    cardAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1, duration: 500,
        delay: 300 + i * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    cardYAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 0, duration: 500,
        delay: 300 + i * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    // Cycling phrase
    const phraseInterval = setInterval(() => {
      Animated.timing(phraseAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        Animated.timing(phraseAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      });
    }, 3400);

    return () => {
      loops.forEach((l) => l.stop());
      clearInterval(phraseInterval);
    };
  }, []);

  // Derived
  const bloopScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const bloopFloat = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });

  // ── Auto-redirect after 2.8 s ────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
      void completeOnboarding()
        .then((ok) => {
          if (ok) router.replace("/(tabs)/dashboard");
          else setError("Something did not save. Please tap Enter Soul.");
        })
        .catch(() => setError("Something did not save. Please tap Enter Soul."));
    }, 2800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnter() {
    setError("");
    void completeOnboarding()
      .then((ok) => {
        if (ok) router.replace("/(tabs)/dashboard");
        else setError("Something did not save. Please try again.");
      })
      .catch(() => setError("Something did not save. Please try again."));
  }

  return (
    <View style={s.root}>
      <StatusBar style="light" backgroundColor={darkColors.background} translucent />

      {/* Ambient aura decorations */}
      <View pointerEvents="none" style={s.blob1} />
      <View pointerEvents="none" style={s.blob2} />

      <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.brandName}>MyStree Soul</Text>
            <Text style={s.brandSub}>Your wellness space</Text>
          </View>
          <View style={s.lotusBadge}>
            <MaterialCommunityIcons name="spa" size={20} color={darkColors.textMuted} />
          </View>
        </View>

        {/* ── Hero — Bloop only, no orbit ─────────────────────────────────── */}
        <View style={s.heroWrap}>
          {/* Aura rings */}
          <Animated.View style={[s.auraRing3, { opacity: auraOp }]} />
          <Animated.View style={[s.auraRing2, { opacity: auraOp }]} />
          <Animated.View style={[s.auraRing1, { opacity: auraOp }]} />

          {/* Bloop — no tintColor, no overlay on the image */}
          <Animated.View
            style={[s.bloopContainer, { transform: [{ scale: bloopScale }, { translateY: bloopFloat }] }]}
          >
            <View style={s.bloopGlow} />
            <CachedImage priority="high" source={imgBloop} style={s.bloopImg} contentFit="contain" />
          </Animated.View>
        </View>

        {/* ── Welcome copy ────────────────────────────────────────────────── */}
        <Animated.View style={[s.copySection, { opacity: entranceOp, transform: [{ translateY: entranceY }] }]}>
          <Text style={s.welcomeTitle}>
            {name.trim()
              ? `Welcome, ${name.trim().split(" ")[0]}`
              : "Welcome to your Soul space"}
          </Text>
          <Animated.Text style={[s.phraseText, { opacity: phraseAnim }]}>
            {PHRASES[phraseIdx]}
          </Animated.Text>
        </Animated.View>

        {/* ── Status cards — uniform 2×2 grid ─────────────────────────────── */}
        <View style={s.cardsGrid}>
          {STATUS_CARDS.map((card, i) => (
            <Animated.View
              key={card.id}
              style={[
                s.statusCard,
                { opacity: cardAnims[i], transform: [{ translateY: cardYAnims[i] }] },
              ]}
            >
              <View style={[s.statusIconCircle, { backgroundColor: `${card.accent}1C` }]}>
                {card.lib === "ion" ? (
                  <Ionicons name={card.icon as any} size={18} color={card.accent} />
                ) : (
                  <MaterialCommunityIcons name={card.icon as any} size={18} color={card.accent} />
                )}
              </View>
              <Text style={s.statusLabel} numberOfLines={2}>{card.label}</Text>
              <View style={[s.statusDot, { backgroundColor: card.accent }]} />
            </Animated.View>
          ))}
        </View>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error ? <Text style={s.errorText}>{error}</Text> : null}

        {/* ── Enter Soul CTA ──────────────────────────────────────────────── */}
        <View style={s.ctaSection}>
          <Pressable
            accessibilityLabel="Enter Soul"
            accessibilityRole="button"
            onPress={handleEnter}
            style={({ pressed }) => [s.ctaShell, pressed && s.pressed]}
          >
            <LinearGradient
              colors={[darkColors.primaryCTA, darkColors.warning]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaText}>Enter Soul</Text>
              <Ionicons name="chevron-forward" size={20} color={darkColors.background} />
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(onboarding)/personalization")}
            style={({ pressed }) => [s.editBtn, pressed && s.pressed]}
            accessibilityLabel="Edit your answers"
            accessibilityRole="button"
          >
            <Ionicons name="pencil-outline" size={13} color={darkColors.textMuted} />
            <Text style={s.editBtnText}>Edit answers</Text>
          </Pressable>
        </View>

        {/* ── Page dots ───────────────────────────────────────────────────── */}
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

        <View style={{ height: 12 }} />
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
  safe: { flex: 1 },

  // Ambient blobs
  blob1: {
    position: "absolute", top: -140, left: -100,
    width: 380, height: 380, borderRadius: 190,
    backgroundColor: "rgba(232,166,182,0.05)",
  },
  blob2: {
    position: "absolute", bottom: 60, right: -120,
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: "rgba(126,200,160,0.04)",
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandName: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: darkColors.textPrimary,
    letterSpacing: 0.3,
  },
  brandSub: {
    fontFamily: F.bodyRegular,
    fontSize: 13,
    color: darkColors.textMuted,
    marginTop: 1,
  },
  lotusBadge: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: darkColors.surfaceRaised,
    borderWidth: 1, borderColor: darkColors.border,
  },

  // Hero
  heroWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxHeight: 260,
    minHeight: 200,
  },
  auraRing3: {
    position: "absolute",
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1.5,
    borderColor: `${darkColors.primaryCTA}1A`,
  },
  auraRing2: {
    position: "absolute",
    width: 152, height: 152, borderRadius: 76,
    borderWidth: 2,
    borderColor: `${darkColors.primaryCTA}28`,
  },
  auraRing1: {
    position: "absolute",
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: `${darkColors.primaryCTA}10`,
    borderWidth: 1.5,
    borderColor: `${darkColors.primaryCTA}30`,
  },
  bloopContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  bloopGlow: {
    position: "absolute",
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: `${darkColors.primaryCTA}16`,
  },
  bloopImg: {
    width: 116, height: 108,
  },

  // Welcome copy
  copySection: {
    paddingHorizontal: SIDE_PAD,
    alignItems: "center",
    paddingBottom: 16,
    gap: 6,
  },
  welcomeTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 28,
    lineHeight: 34,
    color: darkColors.textPrimary,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  phraseText: {
    fontFamily: F.luxuryBold,
    fontSize: 14,
    lineHeight: 20,
    color: darkColors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 12,
  },

  // Status cards — uniform 2×2 grid
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: SIDE_PAD,
    marginBottom: 20,
  },
  statusCard: {
    flexBasis: (W - SIDE_PAD * 2 - 10) / 2,
    backgroundColor: darkColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkColors.border,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 3,
  },
  statusIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  statusLabel: {
    fontFamily: F.uiBold,
    fontSize: 12,
    lineHeight: 16,
    color: darkColors.textPrimary,
    flex: 1,
  },
  statusDot: {
    width: 7, height: 7, borderRadius: 3.5,
    alignSelf: "flex-end",
  },

  // Error
  errorText: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: darkColors.periodColor,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: SIDE_PAD,
  },

  // CTA section
  ctaSection: {
    paddingHorizontal: SIDE_PAD,
    gap: 12,
    marginBottom: 18,
  },
  ctaShell: {
    borderRadius: 999,
    shadowColor: darkColors.primaryCTA,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26, shadowRadius: 22, elevation: 6,
  },
  ctaBtn: {
    height: 60, borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    fontFamily: F.uiBlack,
    fontSize: 17,
    color: darkColors.background,
    letterSpacing: 0.3,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surface,
    alignSelf: "center",
  },
  editBtnText: {
    fontFamily: F.uiMedium,
    fontSize: 12,
    color: darkColors.textMuted,
    letterSpacing: 0.2,
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
    backgroundColor: `${darkColors.primaryCTA}40`,
  },
  dotRingOuter: {
    width: 16, height: 16, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
    borderColor: darkColors.primaryCTA,
  },
  dotRingInner: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: darkColors.primaryCTA,
  },

  pressed: { transform: [{ scale: 0.97 }] },
});
