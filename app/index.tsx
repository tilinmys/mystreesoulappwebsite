import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { CachedImage } from "../components/CachedImage";
import { preloadAppImages } from "../components/imagePreload";
import { hasValidAuthSession, useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";

void preloadAppImages();

// Light warm-white background — logo strokes and text fully visible
const BG      = "#FBF8F5";   // warm off-white, matches app background
const BG_CARD = "#FFFFFF";   // pure white card so logo sits crisp
const CORAL   = "#E07A5F";   // terracotta accent (unchanged)
const TEXT    = "#2B2D42";   // dark charcoal for wordmark
const MUTED   = "#8A7B72";   // warm grey for tagline

const logo = require("../public/images/mystreelogo.webp");

export default function SplashScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  const [hydrated, setHydrated] = useState(
    () => useOnboardingStore.persist.hasHydrated() && useAuthStore.persist.hasHydrated()
  );

  // Animation values
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.7)).current;
  const beatScale    = useRef(new Animated.Value(1)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const textSlide    = useRef(new Animated.Value(28)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartScale   = useRef(new Animated.Value(0.3)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const dotsOpacity  = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // 1. Logo fades + springs in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1, duration: 520, delay: 180,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1, delay: 180, tension: 52, friction: 8, useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Double heartbeat
      Animated.sequence([
        // Beat 1
        Animated.timing(beatScale, { toValue: 1.24, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(beatScale, { toValue: 0.94, duration: 160, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
        Animated.timing(beatScale, { toValue: 1.14, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(beatScale, { toValue: 1.00, duration: 280, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(260),
        // Beat 2
        Animated.timing(beatScale, { toValue: 1.18, duration: 190, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(beatScale, { toValue: 0.96, duration: 150, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
        Animated.timing(beatScale, { toValue: 1.00, duration: 260, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]).start(() => {
        // 3. Wordmark slides up
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1, duration: 460,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
          Animated.timing(textSlide, {
            toValue: 0, duration: 460,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
        ]).start();

        // 4. Heart pops in
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(heartOpacity, {
              toValue: 1, duration: 320,
              easing: Easing.out(Easing.cubic), useNativeDriver: true,
            }),
            Animated.spring(heartScale, {
              toValue: 1, tension: 90, friction: 5, useNativeDriver: true,
            }),
          ]),
        ]).start();

        // 5. Tagline + dots
        Animated.sequence([
          Animated.delay(440),
          Animated.timing(tagOpacity, {
            toValue: 1, duration: 400,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
          Animated.timing(dotsOpacity, {
            toValue: 1, duration: 300,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
        ]).start();
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key || !hydrated) return;
    const timer = setTimeout(() => {
      const sessionValid = hasValidAuthSession({ isAuthenticated, sessionExpiresAt });
      if (sessionValid && hasCompletedOnboarding) {
        router.replace("/(tabs)/dashboard");
      } else {
        // Not authenticated OR mid-onboarding → always show welcome first
        router.replace("/welcome");
      }
    }, 3400);
    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, hydrated, isAuthenticated, rootNavigationState?.key, router, sessionExpiresAt]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Subtle radial depth behind logo */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, beatScale) },
            ],
          },
        ]}
      >
        <View style={styles.logoRingOuter} />
        <View style={styles.logoRingInner} />
        <View style={styles.logoCard}>
          <CachedImage
            source={logo}
            style={styles.logoImage}
            priority="high"
          />
        </View>
      </Animated.View>

      {/* Brand wordmark */}
      <Animated.View
        style={[
          styles.wordmarkRow,
          { opacity: textOpacity, transform: [{ translateY: textSlide }] },
        ]}
      >
        <Text style={styles.brand}>MyStree Soul</Text>
        <Animated.View
          style={{
            opacity: heartOpacity,
            transform: [{ scale: heartScale }],
            marginLeft: 6,
            marginTop: 3,
          }}
        >
          <HeartSvg size={20} />
        </Animated.View>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        your rhythm, understood
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsWrap, { opacity: dotsOpacity }]}>
        <PulseDots />
      </Animated.View>
    </SafeAreaView>
  );
}

function HeartSvg({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={CORAL}
      />
    </Svg>
  );
}

function PulseDots() {
  const dots = [useRef(new Animated.Value(0.35)).current,
                useRef(new Animated.Value(0.35)).current,
                useRef(new Animated.Value(0.35)).current];

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 220),
          Animated.timing(dot, { toValue: 1,    duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.35, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dots}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  glowOuter: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(224,122,95,0.06)",
  },
  glowInner: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(224,122,95,0.09)",
  },
  logoWrap: {
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  logoRingOuter: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: "rgba(43,45,66,0.08)",
  },
  logoRingInner: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.22)",
  },
  logoCard: {
    width: 164,
    height: 164,
    borderRadius: 50,
    backgroundColor: BG_CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.12)",
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 6,
    overflow: "hidden",
  },
  logoImage: {
    width: 148,
    height: 148,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  brand: {
    fontFamily: Platform.OS === "ios" ? "PlayfairDisplay_800ExtraBold" : "PlayfairDisplay_700Bold",
    fontSize: 34,
    lineHeight: 40,
    color: TEXT,
    letterSpacing: 0.6,
  },
  tagline: {
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 2.2,
    color: MUTED,
    textAlign: "center",
  },
  dotsWrap: {
    position: "absolute",
    bottom: 52,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: CORAL,
  },
});
