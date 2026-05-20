/**
 * MyStree Soul — Design System Font Tokens  v2
 *
 * Three-typeface premium stack, tuned for a calming, elegant wellness app:
 *
 *  ✦ Fraunces    — warm, nostalgic serif  (headers, greetings, hero moments)
 *                  Replaces: Caveat + Playfair Display
 *
 *  ✦ Montserrat  — geometric sans          (subheads, category chips, labels)
 *                  Replaces: Cormorant Garamond
 *
 *  ✦ Inter       — clean neutral sans      (body, buttons, UI, numbers)
 *                  Replaces: Nunito
 *
 * All existing F.xxx token names are preserved — no screen edits required.
 *
 * Import: import { F } from "../../constants/fonts";
 * Usage:  fontFamily: F.luxuryBold
 */

// ── Fraunces — warm serif display ─────────────────────────────────────────────
export const Fraunces_300Light            = "Fraunces_300Light";
export const Fraunces_300Light_Italic     = "Fraunces_300Light_Italic";
export const Fraunces_400Regular          = "Fraunces_400Regular";
export const Fraunces_400Regular_Italic   = "Fraunces_400Regular_Italic";
export const Fraunces_500Medium           = "Fraunces_500Medium";
export const Fraunces_500Medium_Italic    = "Fraunces_500Medium_Italic";
export const Fraunces_600SemiBold         = "Fraunces_600SemiBold";
export const Fraunces_600SemiBold_Italic  = "Fraunces_600SemiBold_Italic";
export const Fraunces_700Bold             = "Fraunces_700Bold";
export const Fraunces_700Bold_Italic      = "Fraunces_700Bold_Italic";

// ── Montserrat — geometric sans subheads ──────────────────────────────────────
export const Montserrat_300Light          = "Montserrat_300Light";
export const Montserrat_300Light_Italic   = "Montserrat_300Light_Italic";
export const Montserrat_400Regular        = "Montserrat_400Regular";
export const Montserrat_400Regular_Italic = "Montserrat_400Regular_Italic";
export const Montserrat_500Medium         = "Montserrat_500Medium";
export const Montserrat_500Medium_Italic  = "Montserrat_500Medium_Italic";
export const Montserrat_600SemiBold       = "Montserrat_600SemiBold";
export const Montserrat_600SemiBold_Italic= "Montserrat_600SemiBold_Italic";
export const Montserrat_700Bold           = "Montserrat_700Bold";

// ── Inter — clean UI body sans ────────────────────────────────────────────────
export const Inter_300Light               = "Inter_300Light";
export const Inter_400Regular             = "Inter_400Regular";
export const Inter_500Medium              = "Inter_500Medium";
export const Inter_600SemiBold            = "Inter_600SemiBold";
export const Inter_700Bold                = "Inter_700Bold";
export const Inter_800ExtraBold           = "Inter_800ExtraBold";
export const Inter_900Black               = "Inter_900Black";

// ── Convenience object (F.xxx) ────────────────────────────────────────────────
// Token names are IDENTICAL to v1 — all screens automatically pick up the new
// fonts with zero edits elsewhere.
export const F = {

  // ── Display / luxury moments  (Fraunces — warm serif) ──────────────────────
  // Formerly: Playfair Display
  // Use for: screen titles, section heroes, large feature headings
  luxuryBold:       Fraunces_600SemiBold,        // was PlayfairDisplay_700Bold
  luxuryExtraBold:  Fraunces_700Bold,             // was PlayfairDisplay_800ExtraBold
  luxuryItalic:     Fraunces_400Regular_Italic,  // was PlayfairDisplay_400Regular_Italic

  // ── Warm / greeting moments  (Fraunces — warmer weights) ───────────────────
  // Formerly: Caveat (handwritten)
  // Use for: "Good morning" greetings, hero headlines, Bloop voice moments
  handwrittenRegular:   Fraunces_400Regular,      // was Caveat_400Regular
  handwrittenMedium:    Fraunces_500Medium,        // was Caveat_500Medium
  handwrittenSemiBold:  Fraunces_600SemiBold,      // was Caveat_600SemiBold
  handwrittenBold:      Fraunces_700Bold,          // was Caveat_700Bold

  // ── Subheads / structural body  (Montserrat — geometric sans) ──────────────
  // Formerly: Cormorant Garamond (calligraphic serif)
  // Use for: section labels, category pills (ALL-CAPS + wide tracking),
  //          descriptive body copy, insight text
  bodyLight:          Montserrat_300Light,
  bodyLightItalic:    Montserrat_300Light_Italic,
  bodyRegular:        Montserrat_400Regular,
  bodyRegularItalic:  Montserrat_400Regular_Italic,
  bodyMedium:         Montserrat_500Medium,
  bodyMediumItalic:   Montserrat_500Medium_Italic,
  bodySemiBold:       Montserrat_600SemiBold,

  // ── UI / functional text  (Inter — clean neutral sans) ─────────────────────
  // Formerly: Nunito (rounded UI sans)
  // Use for: buttons, chips, metric numbers, form fields, all interface copy
  uiLight:      Inter_300Light,
  uiRegular:    Inter_400Regular,
  uiMedium:     Inter_500Medium,
  uiSemiBold:   Inter_600SemiBold,
  uiBold:       Inter_700Bold,
  uiExtraBold:  Inter_800ExtraBold,
  uiBlack:      Inter_900Black,

} as const;

// ── Font load map — pass directly to Font.loadAsync() ─────────────────────────
// See app/_layout.tsx for the actual loadAsync call.
