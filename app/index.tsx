import { LinearGradient } from "expo-linear-gradient";
import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Image, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { preloadAppImages } from "../components/imagePreload";
import { F } from "../constants/fonts";
import { hasValidAuthSession, useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";

void preloadAppImages();

const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;

const C = {
  bgTop: "#FFF8F4",
  bgMid: "#F7E6DE",
  bgBottom: "#F4EFE8",
  ink: "#241C1D",
  muted: "rgba(107,76,85,0.55)",
  coral: "#E07A5F",
  peach: "#F4A261",
  sage: "#81B29A",
  lavender: "#BDB2FF",
};

const logo = require("../public/images/mystreelogo.webp");

export default function SplashScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  const [hydrated, setHydrated] = useState(
    () => useOnboardingStore.persist.hasHydrated() && useAuthStore.persist.hasHydrated()
  );

  // ── Animation values ────────────────────────────────────────────────────
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoRotate  = useRef(new Animated.Value(0)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandY       = useRef(new Animated.Value(24)).current;
  const wordSoulOp   = useRef(new Animated.Value(0)).current;

  const taglineOp    = useRef(new Animated.Value(0)).current;
  const lineScale    = useRef(new Animated.Value(0)).current;

  const aura         = useRef(new Animated.Value(0)).current;
  const dotsOpacity  = useRef(new Animated.Value(0)).current;
  const dotA         = useRef(new Animated.Value(0.35)).current;
  const dotB         = useRef(new Animated.Value(0.35)).current;
  const dotC         = useRef(new Animated.Value(0.35)).current;

  // ── Hydration sync ──────────────────────────────────────────────────────
  useEffect(() => {
    const syncHydration = () =>
      setHydrated(
        useOnboardingStore.persist.hasHydrated() && useAuthStore.persist.hasHydrated()
      );
    const u1 = useOnboardingStore.persist.onFinishHydration(syncHydration);
    const u2 = useAuthStore.persist.onFinishHydration(syncHydration);
    syncHydration();
    return () => { u1(); u2(); };
  }, []);

  // ── Choreographed entrance ──────────────────────────────────────────────
  useEffect(() => {
    Animated.sequence([
      // 1. Logo pops in with a gentle spin
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 30,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 2. "MyStree Soul" wordmark slides up
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 640,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(brandY, {
          toValue: 0,
          duration: 640,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 3. "Soul" word emphasis fade-in (handled by wordSoulOp)
      Animated.timing(wordSoulOp, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 4. Underline + tagline together
      Animated.parallel([
        Animated.timing(lineScale, {
          toValue: 1,
          duration: 540,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOp, {
          toValue: 1,
          duration: 540,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dotsOpacity, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Ambient aura loop
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(aura, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(aura, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    const dotLoop = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1,    duration: 520, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.35, duration: 520, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );

    const loops = [auraLoop, dotLoop(dotA, 0), dotLoop(dotB, 180), dotLoop(dotC, 360)];
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Routing ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!rootNavigationState?.key || !hydrated) return;
    const timer = setTimeout(() => {
      const sessionValid = hasValidAuthSession({ isAuthenticated, sessionExpiresAt });
      router.replace(sessionValid ? "/(tabs)/dashboard" : "/welcome");
    }, 3200);
    return () => clearTimeout(timer);
  }, [hydrated, isAuthenticated, rootNavigationState?.key, router, sessionExpiresAt]);

  const auraScale  = aura.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] });
  const auraY      = aura.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const reverseY   = aura.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });
  const logoSpin   = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ["-12deg", "0deg"] });

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <LinearGradient
        colors={[C.bgTop, C.bgMid, C.bgBottom]}
        locations={[0, 0.54, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.washOne, { transform: [{ scale: auraScale }, { translateY: auraY }] }]} />
      <Animated.View style={[styles.washTwo, { transform: [{ translateY: reverseY }, { rotate: "-16deg" }] }]} />
      <Animated.View style={[styles.washThree, { transform: [{ translateY: auraY }, { rotate: "14deg" }] }]} />
      <View style={styles.softGrainA} />
      <View style={styles.softGrainB} />

      <View style={styles.center}>
        {/* MyStree Logo */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { rotate: logoSpin }],
            },
          ]}
        >
          <View style={styles.logoHalo} />
          <Image
            source={logo}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Wordmark */}
        <Animated.View
          style={[
            styles.wordmarkBlock,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandY }],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <Text
              style={styles.brand}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              MyStree{" "}
              <Animated.Text style={[styles.brandSoul, { opacity: wordSoulOp }]}>
                Soul
              </Animated.Text>
            </Text>
          </View>
          <Animated.View style={[styles.brandLine, { transform: [{ scaleX: lineScale }] }]} />
          <Animated.Text style={[styles.tagline, { opacity: taglineOp }]}>
            For every stage of you.
          </Animated.Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.dotsWrap, { opacity: dotsOpacity }]}>
        <Animated.View style={[styles.dot, { opacity: dotA }]} />
        <Animated.View style={[styles.dot, { opacity: dotB }]} />
        <Animated.View style={[styles.dot, { opacity: dotC }]} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: C.bgTop,
  },
  washOne: {
    position: "absolute",
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: "rgba(224,122,95,0.12)",
    top: "20%",
  },
  washTwo: {
    position: "absolute",
    width: 390, height: 160, borderRadius: 90,
    backgroundColor: "rgba(189,178,255,0.13)",
    left: -80, top: "38%",
  },
  washThree: {
    position: "absolute",
    width: 360, height: 150, borderRadius: 90,
    backgroundColor: "rgba(129,178,154,0.11)",
    right: -90, bottom: "26%",
  },
  softGrainA: {
    position: "absolute",
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(244,162,97,0.09)",
    top: 76, left: -54,
  },
  softGrainB: {
    position: "absolute",
    width: 210, height: 210, borderRadius: 105,
    backgroundColor: "rgba(255,255,255,0.22)",
    bottom: 86, right: -68,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    width: "100%",
  },
  // ── Logo ─────────────────────────────────────────────────────────────
  logoWrap: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoHalo: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.18)",
    shadowColor: C.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 6,
  },
  logoImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  // ── Wordmark ─────────────────────────────────────────────────────────
  wordmarkBlock: {
    alignItems: "center",
    width: "100%",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  brand: {
    fontFamily: F.luxuryExtraBold,
    fontSize: Math.min(36, W * 0.085),
    lineHeight: Math.min(44, W * 0.105),
    color: C.ink,
    textAlign: "center",
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  brandSoul: {
    fontFamily: F.luxuryExtraBold,
    color: C.coral,
    fontStyle: "italic",
  },
  brandLine: {
    width: 96,
    height: 2,
    borderRadius: 999,
    backgroundColor: C.coral,
    marginTop: 14,
    opacity: 0.68,
  },
  tagline: {
    fontFamily: F.bodyRegularItalic,
    fontSize: 14,
    lineHeight: 20,
    color: C.muted,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  dotsWrap: {
    position: "absolute",
    bottom: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.coral,
  },
});
