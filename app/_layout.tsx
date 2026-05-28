import * as Font from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";

// ── Fraunces — warm serif display (headers, greetings, hero moments) ──────────
import {
  Fraunces_300Light,
  Fraunces_300Light_Italic,
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
} from "@expo-google-fonts/fraunces";

// ── Montserrat — geometric sans (subheads, category chips, body copy) ─────────
import {
  Montserrat_300Light,
  Montserrat_300Light_Italic,
  Montserrat_400Regular,
  Montserrat_400Regular_Italic,
  Montserrat_500Medium,
  Montserrat_500Medium_Italic,
  Montserrat_600SemiBold,
  Montserrat_600SemiBold_Italic,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

// ── Inter — clean UI sans (buttons, numbers, body, form fields) ───────────────
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";

// ── Cormorant Garamond — elegant serif display (Phase 4 display swap) ─────────
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
} from "@expo-google-fonts/cormorant-garamond";

// ── Manrope — modern structural sans (Phase 4 body/UI swap) ───────────────────
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";

import { preloadAppImages } from "../components/imagePreload";
import { useColorMode } from "../hooks/useColorMode";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useRouteGuard } from "../hooks/useRouteGuard";

export default function RootLayout() {
  useRouteGuard();
  useNetworkStatus();
  const { colors, isDark } = useColorMode();
  const [fontsReady, setFontsReady] = useState(false);

  // ── Store hydration gate — prevents blank dashboard on web ───────────────
  // Zustand persist reads localStorage asynchronously; we must wait for both
  // stores to finish before rendering routes, otherwise selectors return defaults
  // and conditional renders may produce an empty screen.
  const [hydrated, setHydrated] = useState(
    () =>
      useOnboardingStore.persist.hasHydrated() &&
      useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    // Sync immediately in case stores finished before this effect ran
    const syncHydration = () =>
      setHydrated(
        useOnboardingStore.persist.hasHydrated() &&
          useAuthStore.persist.hasHydrated()
      );

    const u1 = useOnboardingStore.persist.onFinishHydration(syncHydration);
    const u2 = useAuthStore.persist.onFinishHydration(syncHydration);
    syncHydration(); // check again in case both resolved before subscribing

    return () => {
      u1();
      u2();
    };
  }, []);

  useEffect(() => {
    void Font.loadAsync({
      // ── Fraunces (warm serif — headers, greetings, luxury moments) ──────────
      Fraunces_300Light,
      Fraunces_300Light_Italic,
      Fraunces_400Regular,
      Fraunces_400Regular_Italic,
      Fraunces_500Medium,
      Fraunces_500Medium_Italic,
      Fraunces_600SemiBold,
      Fraunces_600SemiBold_Italic,
      Fraunces_700Bold,
      Fraunces_700Bold_Italic,
      // ── Montserrat (geometric sans — subheads, chips, body copy) ────────────
      Montserrat_300Light,
      Montserrat_300Light_Italic,
      Montserrat_400Regular,
      Montserrat_400Regular_Italic,
      Montserrat_500Medium,
      Montserrat_500Medium_Italic,
      Montserrat_600SemiBold,
      Montserrat_600SemiBold_Italic,
      Montserrat_700Bold,
      // ── Inter (clean UI sans — buttons, numbers, interface copy) ────────────
      Inter_300Light,
      Inter_400Regular,
      Inter_500Medium,
      Inter_600SemiBold,
      Inter_700Bold,
      Inter_800ExtraBold,
      Inter_900Black,
      // ── Cormorant Garamond (elegant serif display) ─────────────────────────
      CormorantGaramond_500Medium,
      CormorantGaramond_500Medium_Italic,
      CormorantGaramond_600SemiBold,
      CormorantGaramond_600SemiBold_Italic,
      // ── Manrope (modern sans body/UI) ──────────────────────────────────────
      Manrope_400Regular,
      Manrope_500Medium,
      Manrope_600SemiBold,
      Manrope_700Bold,
    }).then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    void preloadAppImages();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverscroll = root.style.overscrollBehaviorY;
    const previousBodyOverscroll = body.style.overscrollBehaviorY;
    const previousBodyBackground = body.style.backgroundColor;
    const previousRootBackground = root.style.backgroundColor;

    root.style.overscrollBehaviorY = "none";
    body.style.overscrollBehaviorY = "none";
    root.style.backgroundColor = colors.background;
    body.style.backgroundColor = colors.background;

    return () => {
      root.style.overscrollBehaviorY = previousRootOverscroll;
      body.style.overscrollBehaviorY = previousBodyOverscroll;
      root.style.backgroundColor = previousRootBackground;
      body.style.backgroundColor = previousBodyBackground;
    };
  }, [colors.background]);

  // ── Loading gate — show spinner until fonts + stores are ready ───────────
  if (!fontsReady || !hydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f0a0f",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#c49a6c" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          animation: "fade",
          contentStyle: { backgroundColor: colors.background },
          headerShown: false
        }}
      >
        <Stack.Screen name="welcome" options={{ animation: "fade" }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </>
  );
}
