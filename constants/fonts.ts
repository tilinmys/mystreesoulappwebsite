/**
 * MyStree Soul — Design System Font Tokens  v3
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * THREE LAYERS
 * ────────────
 * 1.  FONT FACE CONSTANTS  — raw font family name strings (loaded in _layout.tsx)
 *
 * 2.  NEW SEMANTIC TOKENS  — the design-system canonical names:
 *       F.display        H1/Hero                   Fraunces → CormorantGaramond* (Phase 4)
 *       F.displayItalic  H1/Hero italic             Fraunces → CormorantGaramond*
 *       F.body           Body / paragraphs          Montserrat → Manrope*        (Phase 4)
 *       F.ui             Buttons / chips / labels   Inter → Manrope*             (Phase 4)
 *       F.uiLabel        Uppercase label style      Inter → Manrope*             (Phase 4)
 *
 *     ⚠️  Phase 4 will install @expo-google-fonts/cormorant-garamond and
 *         @expo-google-fonts/manrope, then update ONLY the five lines marked
 *         with "Phase 4 swap →".  All screen code using F.display / F.body / F.ui
 *         will automatically inherit the new fonts with zero further edits.
 *
 * 3.  LEGACY TOKENS  — every existing F.xxx name is preserved so the ~500
 *     existing references across screens do not need to be touched until
 *     Phase 3 migration.  They map to the same loaded fonts as before.
 *
 * USAGE RULES
 * ────────────
 *   New screens  →  use F.display / F.body / F.ui only
 *   Phase 3 migration  →  swap F.luxuryBold → F.display, F.uiBold → F.ui, etc.
 *   Never hard-code a font family string in a component.
 */

// ─────────────────────────────────────────────────────────────────────────────
// §1  FONT FACE CONSTANTS  (loaded by app/_layout.tsx via Font.loadAsync)
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Montserrat — geometric sans ────────────────────────────────────────────────
export const Montserrat_300Light          = "Montserrat_300Light";
export const Montserrat_300Light_Italic   = "Montserrat_300Light_Italic";
export const Montserrat_400Regular        = "Montserrat_400Regular";
export const Montserrat_400Regular_Italic = "Montserrat_400Regular_Italic";
export const Montserrat_500Medium         = "Montserrat_500Medium";
export const Montserrat_500Medium_Italic  = "Montserrat_500Medium_Italic";
export const Montserrat_600SemiBold       = "Montserrat_600SemiBold";
export const Montserrat_600SemiBold_Italic= "Montserrat_600SemiBold_Italic";
export const Montserrat_700Bold           = "Montserrat_700Bold";

// ── Inter — clean UI body sans ─────────────────────────────────────────────────
export const Inter_300Light               = "Inter_300Light";
export const Inter_400Regular             = "Inter_400Regular";
export const Inter_500Medium              = "Inter_500Medium";
export const Inter_600SemiBold            = "Inter_600SemiBold";
export const Inter_700Bold                = "Inter_700Bold";
export const Inter_800ExtraBold           = "Inter_800ExtraBold";
export const Inter_900Black               = "Inter_900Black";

// ── Phase 4 font face constants (defined here, loaded in Phase 4) ──────────────
// When Phase 4 installs @expo-google-fonts/cormorant-garamond + @expo-google-fonts/manrope,
// uncomment these and add them to Font.loadAsync in _layout.tsx.
//
export const CormorantGaramond_500Medium          = "CormorantGaramond_500Medium";
export const CormorantGaramond_500Medium_Italic   = "CormorantGaramond_500Medium_Italic";
export const CormorantGaramond_600SemiBold         = "CormorantGaramond_600SemiBold";
export const CormorantGaramond_600SemiBold_Italic = "CormorantGaramond_600SemiBold_Italic";
export const Manrope_400Regular                   = "Manrope_400Regular";
export const Manrope_500Medium                    = "Manrope_500Medium";
export const Manrope_600SemiBold                  = "Manrope_600SemiBold";
export const Manrope_700Bold                      = "Manrope_700Bold";

// ─────────────────────────────────────────────────────────────────────────────
// §2  CONVENIENCE OBJECT  (F.xxx — the only thing components should import)
// ─────────────────────────────────────────────────────────────────────────────
export const F = {

  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  NEW SEMANTIC TOKENS  —  use these in all new/migrated screen code      ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  /**
   * Display / H1 / Hero headings
   * Target: Cormorant Garamond 600 SemiBold  (Phase 4 swap →)
   * Current fallback: Fraunces 600 SemiBold  (same visual weight class)
   */
  display:          CormorantGaramond_600SemiBold,          // Phase 4 swap → CormorantGaramond_600SemiBold
  displayMedium:    CormorantGaramond_500Medium,             // Phase 4 swap → CormorantGaramond_500Medium
  /** Italic variant — hero pull quotes, phase names, Bloop voice moments */
  displayItalic:    CormorantGaramond_600SemiBold_Italic,   // Phase 4 swap → CormorantGaramond_600SemiBold_Italic
  displayMediumItalic: CormorantGaramond_500Medium_Italic,  // Phase 4 swap → CormorantGaramond_500Medium_Italic

  /**
   * Body / paragraph text
   * Target: Manrope 400 Regular  (Phase 4 swap →)
   * Current fallback: Montserrat 400 Regular  (same x-height profile)
   */
  body:             Manrope_400Regular,          // Phase 4 swap → Manrope_400Regular
  bodyMd:           Manrope_500Medium,           // Phase 4 swap → Manrope_500Medium

  /**
   * UI / functional text — buttons, chips, form labels, metric numbers
   * Target: Manrope 600 SemiBold  (Phase 4 swap →)
   * Current fallback: Inter 600 SemiBold  (virtually identical rendering)
   *
   * Usage tip: pair with `letterSpacing: 0.5` and `textTransform: "uppercase"`
   * for the spec's "0.1em tracking" CTA label style.
   */
  ui:               Manrope_600SemiBold,              // Phase 4 swap → Manrope_600SemiBold
  /**
   * Uppercase label style — primary buttons, tab labels, category pills
   * Use with `textTransform: "uppercase"` and `letterSpacing: 1.0`
   */
  uiLabel:          Manrope_700Bold,                  // Phase 4 swap → Manrope_700Bold

  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  LEGACY TOKENS  —  preserved for backward compat (~500 existing refs)   ║
  // ║  ⚠️  Phase 3 migration will replace these with semantic tokens above.   ║
  // ║  Do NOT use in new code.                                                 ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  // ── Display / luxury moments  (Fraunces → Cormorant Garamond Phase 4 swap) ──
  /** @deprecated  →  F.display */
  luxuryBold:       CormorantGaramond_600SemiBold,
  /** @deprecated  →  F.display (heavier weight) */
  luxuryExtraBold:  CormorantGaramond_600SemiBold,
  /** @deprecated  →  F.displayItalic */
  luxuryItalic:     CormorantGaramond_500Medium_Italic,

  // ── Warm / greeting moments  (Fraunces → Cormorant Garamond Phase 4 swap) ────
  /** @deprecated  →  F.display */
  handwrittenRegular:   CormorantGaramond_500Medium,
  /** @deprecated  →  F.displayMedium */
  handwrittenMedium:    CormorantGaramond_500Medium,
  /** @deprecated  →  F.display */
  handwrittenSemiBold:  CormorantGaramond_600SemiBold,
  /** @deprecated  →  F.display (bold) */
  handwrittenBold:      CormorantGaramond_600SemiBold,

  // ── Subheads / structural body  (Montserrat → Manrope Phase 4 swap) ──────────
  /** @deprecated  →  F.body (light) */
  bodyLight:          Manrope_400Regular,
  /** @deprecated  →  F.body (light italic) */
  bodyLightItalic:    Manrope_400Regular,
  /** @deprecated  →  F.body */
  bodyRegular:        Manrope_400Regular,
  /** @deprecated  →  F.body (italic) */
  bodyRegularItalic:  Manrope_400Regular,
  /** @deprecated  →  F.bodyMd */
  bodyMedium:         Manrope_500Medium,
  /** @deprecated  →  F.bodyMd (italic) */
  bodyMediumItalic:   Manrope_500Medium,
  /** @deprecated  →  F.ui (semi-bold) */
  bodySemiBold:       Manrope_600SemiBold,

  // ── UI / functional text  (Inter → Manrope Phase 4 swap) ──────────────────────
  /** @deprecated  →  F.body (light) */
  uiLight:      Manrope_400Regular,
  /** @deprecated  →  F.body */
  uiRegular:    Manrope_400Regular,
  /** @deprecated  →  F.body (medium) */
  uiMedium:     Manrope_500Medium,
  /** @deprecated  →  F.ui */
  uiSemiBold:   Manrope_600SemiBold,
  /** @deprecated  →  F.uiLabel */
  uiBold:       Manrope_700Bold,
  /** @deprecated  →  F.uiLabel (heavy) */
  uiExtraBold:  Manrope_700Bold,
  /** @deprecated  →  F.uiLabel (black / max weight buttons) */
  uiBlack:      Manrope_700Bold,

} as const;

// ─────────────────────────────────────────────────────────────────────────────
// §3  TYPOGRAPHY SCALE  (design-system text style presets)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Pre-composed text style objects for common roles.
 * Use these in conjunction with a color from the color system.
 *
 * Example:
 *   <Text style={[TS.heroTitle, { color: colors.textPrimary }]}>...</Text>
 */
export const TS = {
  /** Full-screen hero title — H1 */
  heroTitle: {
    fontFamily: F.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  /** Section / card title — H2 */
  sectionTitle: {
    fontFamily: F.display,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: 0.1,
  },
  /** Sub-section label — H3 */
  subTitle: {
    fontFamily: F.ui,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  /** Standard body paragraph */
  body: {
    fontFamily: F.body,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
  /** Small caption / meta text */
  caption: {
    fontFamily: F.body,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  /** Primary CTA button label — uppercase + tracked */
  ctaLabel: {
    fontFamily: F.uiLabel,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  /** Chip / pill label */
  chip: {
    fontFamily: F.ui,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
} as const;
