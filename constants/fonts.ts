/**
 * MyStree Soul — Design System Font Tokens
 *
 * Three typeface roles, each mapped to a specific emotional job:
 *
 *  ✦ Caveat          — handwritten warmth  (greetings, hero headlines, Bloop moments)
 *  ✦ Nunito          — rounded UI sans     (buttons, labels, chips, metric numbers)
 *  ✦ Cormorant       — calligraphic serif  (body copy, descriptions, insight text)
 *  ✦ Playfair        — luxury editorial    (Premium page only — keep the prestige)
 *
 * Import: import { F } from "../../constants/fonts";
 * Usage:  fontFamily: F.handwrittenBold
 */

// ── Caveat — handwritten, personal, warm ─────────────────────────────────────
export const Caveat_400Regular   = "Caveat_400Regular";
export const Caveat_500Medium    = "Caveat_500Medium";
export const Caveat_600SemiBold  = "Caveat_600SemiBold";
export const Caveat_700Bold      = "Caveat_700Bold";

// ── Nunito — rounded UI sans ──────────────────────────────────────────────────
export const Nunito_300Light      = "Nunito_300Light";
export const Nunito_400Regular    = "Nunito_400Regular";
export const Nunito_500Medium     = "Nunito_500Medium";
export const Nunito_600SemiBold   = "Nunito_600SemiBold";
export const Nunito_700Bold       = "Nunito_700Bold";
export const Nunito_800ExtraBold  = "Nunito_800ExtraBold";
export const Nunito_900Black      = "Nunito_900Black";

// ── Cormorant Garamond — calligraphic serif body ──────────────────────────────
export const CormorantGaramond_300Light          = "CormorantGaramond_300Light";
export const CormorantGaramond_300Light_Italic   = "CormorantGaramond_300Light_Italic";
export const CormorantGaramond_400Regular        = "CormorantGaramond_400Regular";
export const CormorantGaramond_400Regular_Italic = "CormorantGaramond_400Regular_Italic";
export const CormorantGaramond_500Medium         = "CormorantGaramond_500Medium";
export const CormorantGaramond_500Medium_Italic  = "CormorantGaramond_500Medium_Italic";
export const CormorantGaramond_600SemiBold       = "CormorantGaramond_600SemiBold";

// ── Playfair Display — luxury editorial (Premium screen only) ─────────────────
export const PlayfairDisplay_700Bold        = "PlayfairDisplay_700Bold";
export const PlayfairDisplay_800ExtraBold   = "PlayfairDisplay_800ExtraBold";
export const PlayfairDisplay_400Regular_Italic = "PlayfairDisplay_400Regular_Italic";

// ── Convenience object (F.xxx) ────────────────────────────────────────────────
export const F = {
  // Caveat — warm handwritten voice
  handwrittenRegular:  Caveat_400Regular,
  handwrittenMedium:   Caveat_500Medium,
  handwrittenSemiBold: Caveat_600SemiBold,
  handwrittenBold:     Caveat_700Bold,

  // Nunito — clean rounded UI
  uiLight:      Nunito_300Light,
  uiRegular:    Nunito_400Regular,
  uiMedium:     Nunito_500Medium,
  uiSemiBold:   Nunito_600SemiBold,
  uiBold:       Nunito_700Bold,
  uiExtraBold:  Nunito_800ExtraBold,
  uiBlack:      Nunito_900Black,

  // Cormorant Garamond — editorial calligraphic body
  bodyLight:          CormorantGaramond_300Light,
  bodyLightItalic:    CormorantGaramond_300Light_Italic,
  bodyRegular:        CormorantGaramond_400Regular,
  bodyRegularItalic:  CormorantGaramond_400Regular_Italic,
  bodyMedium:         CormorantGaramond_500Medium,
  bodyMediumItalic:   CormorantGaramond_500Medium_Italic,
  bodySemiBold:       CormorantGaramond_600SemiBold,

  // Playfair — luxury/premium moments only
  luxuryBold:       PlayfairDisplay_700Bold,
  luxuryExtraBold:  PlayfairDisplay_800ExtraBold,
  luxuryItalic:     PlayfairDisplay_400Regular_Italic,
} as const;

// ── Font load map — pass directly to Font.loadAsync() ─────────────────────────
// Import the font asset values from each package and spread into Font.loadAsync.
// See _layout.tsx for the actual loadAsync call.
