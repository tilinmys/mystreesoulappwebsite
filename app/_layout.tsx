import * as Font from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

// ── Caveat — handwritten warmth ───────────────────────────────────────────────
import {
  Caveat_400Regular,
  Caveat_500Medium,
  Caveat_600SemiBold,
  Caveat_700Bold,
} from "@expo-google-fonts/caveat";

// ── Nunito — rounded UI sans ──────────────────────────────────────────────────
import {
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";

// ── Cormorant Garamond — calligraphic body serif ──────────────────────────────
import { CormorantGaramond_300Light } from "@expo-google-fonts/cormorant-garamond/300Light";
import { CormorantGaramond_300Light_Italic } from "@expo-google-fonts/cormorant-garamond/300Light_Italic";
import { CormorantGaramond_400Regular } from "@expo-google-fonts/cormorant-garamond/400Regular";
import { CormorantGaramond_400Regular_Italic } from "@expo-google-fonts/cormorant-garamond/400Regular_Italic";
import { CormorantGaramond_500Medium } from "@expo-google-fonts/cormorant-garamond/500Medium";
import { CormorantGaramond_500Medium_Italic } from "@expo-google-fonts/cormorant-garamond/500Medium_Italic";
import { CormorantGaramond_600SemiBold } from "@expo-google-fonts/cormorant-garamond/600SemiBold";

import { preloadAppImages } from "../components/imagePreload";
import { useRouteGuard } from "../hooks/useRouteGuard";

export default function RootLayout() {
  useRouteGuard();
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    void Font.loadAsync({
      // ── Playfair Display (luxury/premium moments) ──────────────────────────
      PlayfairDisplay_700Bold:           require("../assets/fonts/PlayfairDisplay_700Bold.ttf"),
      PlayfairDisplay_800ExtraBold:      require("../assets/fonts/PlayfairDisplay_800ExtraBold.ttf"),
      PlayfairDisplay_400Regular_Italic: require("../assets/fonts/PlayfairDisplay_400Regular_Italic.ttf"),
      // ── Caveat (handwritten warmth) ────────────────────────────────────────
      Caveat_400Regular,
      Caveat_500Medium,
      Caveat_600SemiBold,
      Caveat_700Bold,
      // ── Nunito (rounded UI sans) ───────────────────────────────────────────
      Nunito_300Light,
      Nunito_400Regular,
      Nunito_500Medium,
      Nunito_600SemiBold,
      Nunito_700Bold,
      Nunito_800ExtraBold,
      Nunito_900Black,
      // ── Cormorant Garamond (calligraphic body serif) ───────────────────────
      CormorantGaramond_300Light,
      CormorantGaramond_300Light_Italic,
      CormorantGaramond_400Regular,
      CormorantGaramond_400Regular_Italic,
      CormorantGaramond_500Medium,
      CormorantGaramond_500Medium_Italic,
      CormorantGaramond_600SemiBold,
    }).then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    void preloadAppImages();
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FBF8F5" />
      <Stack
        screenOptions={{
          animation: "fade",
          contentStyle: { backgroundColor: "#FAF9F6" },
          headerShown: false
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" options={{ animation: "fade" }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </>
  );
}
