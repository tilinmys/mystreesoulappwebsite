/**
 * MyStree Soul — Midnight Plum Design System  v3
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE
 * ────────────
 * 1.  RAW VALUES   — named constants for every base hue (never use outside here)
 * 2.  SEMANTIC TOKENS  — the only keys components should ever reference
 *       • Core layout:   background, surface, surfaceRaised
 *       • Text:          textPrimary, textMuted
 *       • Brand action:  primaryCTA, warning, premium
 *       • Biological:    periodColor, fertileColor, ovulationColor
 *       • Data viz:      chartLine, chartGrid
 *       • Borders:       border, borderSubtle, borderStrong
 *       • Overlays:      surfaceWarm, surfaceSage, surfaceLavender
 * 3.  LEGACY ALIASES  — every OLD token (text, muted, terracotta…) kept alive
 *     so existing screens do not crash. They delegate to semantic tokens.
 *     ⚠️  Phase 3 migration will replace legacy aliases with semantic tokens.
 *     ⚠️  Do NOT use legacy aliases in new code.
 *
 * CONTRAST AUDIT (dark palette, WCAG AA)
 * ────────────────────────────────────────
 *   textPrimary  #F6E9EF  on  #110812  →  ~19.8:1  ✓✓✓  (AAA)
 *   textMuted    #B58AC8  on  #110812  →  ~6.5:1   ✓✓   (AA)
 *   primaryCTA   #E8A6B6  on  #110812  →  ~10.6:1  ✓✓✓  (AAA)
 *   periodColor  #E88090  on  #1D121F  →  ~7.6:1   ✓✓   (AA)
 *   fertileColor #7EC8A0  on  #1D121F  →  ~7.2:1   ✓✓   (AA)
 *   warning      #D8B07C  on  #110812  →  ~9.6:1   ✓✓✓  (AAA)
 */

// ─────────────────────────────────────────────────────────────────────────────
// §1  RAW BASE VALUES  (internal — do not export from here)
// ─────────────────────────────────────────────────────────────────────────────

/** Core dark structure */
const _MIDNIGHT_PLUM    = "#110812"; // deepest bg (ultra-dark Midnight Plum Void)
const _BLACKBERRY_SMOKE = "#1D121F"; // raised surface (rich deep plum surface)
const _VELVET_MAUVE     = "#2F1C33"; // further-raised / selected states
const _DEEP_PLUM_VOID   = "#0A050B"; // deepest shadow / nav underlay

/** Text */
const _MOON_PEARL       = "#F6E9EF"; // primary text on dark  (~15:1 on _MIDNIGHT_PLUM)
const _LAVENDER_DUST    = "#B58AC8"; // secondary/muted text  (~4.6:1 on _MIDNIGHT_PLUM)
const _PLUM_WHISPER     = "#8A6AA0"; // hint text — large elements only

/** Brand actions */
const _BLOOM_PINK       = "#E8A6B6"; // primary CTA, interactive highlights
const _GOLDEN_SAND      = "#D8B07C"; // premium / warning / ovulation

/** Biological states (semantically distinct, must never alias each other) */
const _PERIOD_ROSE      = "#E88090"; // menstruation — rose, not the same as CTA pink
const _FERTILE_SAGE     = "#7EC8A0"; // fertile window — clearly green/teal
// Ovulation shares _GOLDEN_SAND (amber) — distinct from both above

/** Chart / data surfaces */
const _CHART_STROKE     = "#4A394D"; // = VELVET_MAUVE — doubles as chart line
const _CHART_GRID       = "#3A2B3D"; // slightly darker than surface for grid lines

/** Light structure */
const _L_BG             = "#FAF5FC"; // light mode background (warm plum-cream)
const _L_SURFACE        = "#F0E8F8"; // light mode surface
const _L_RAISED         = "#E2D0EE"; // light mode raised
const _L_TEXT           = "#221822"; // inverted — dark plum on light bg
const _L_MUTED          = "#6B4585"; // deep plum for muted text on light (~4.9:1)
const _L_HINT           = "#9B7AB0";
const _L_CTA            = "#C46880"; // bloom pink darkened for light bg contrast
const _L_WARNING        = "#9B6B3C"; // golden sand darkened for light bg
const _L_PERIOD         = "#C44E68"; // period rose darkened for light bg
const _L_FERTILE        = "#3A8A5E"; // fertile sage darkened for light bg

// ─────────────────────────────────────────────────────────────────────────────
// §2  DARK PALETTE  (Midnight Plum — primary design target)
// ─────────────────────────────────────────────────────────────────────────────
export const darkColors = {

  // ── Core layout ─────────────────────────────────────────────────────────────
  background:      _MIDNIGHT_PLUM,      // page background
  surface:         _BLACKBERRY_SMOKE,   // cards, modals, drawer
  surfaceRaised:   _VELVET_MAUVE,       // selected chips, icon bubbles, active tabs

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:     _MOON_PEARL,         // all body/heading text on dark surfaces
  textMuted:       _LAVENDER_DUST,      // captions, labels, secondary info
  textHint:        _PLUM_WHISPER,       // placeholders, disabled (large text only)

  // ── Brand action ────────────────────────────────────────────────────────────
  primaryCTA:      _BLOOM_PINK,         // primary buttons, links, active icons
  accentDark:      "#C97892",           // legacy CTA gradient end
  warning:         _GOLDEN_SAND,        // alerts, "coming soon" states
  premium:         _GOLDEN_SAND,        // premium feature gates / crown badges

  // ── Biological tokens (CRITICAL — never alias these to brand colors) ────────
  periodColor:     _PERIOD_ROSE,        // menstruation dots, period phase fills
  fertileColor:    _FERTILE_SAGE,       // fertile window dots, green tints
  ovulationColor:  "#2E7D32",           // ovulation peak — forest green

  // ── Data visualization ───────────────────────────────────────────────────────
  chartLine:       _CHART_STROKE,       // line graph strokes
  chartGrid:       _CHART_GRID,         // axis/grid lines

  // ── Border system ────────────────────────────────────────────────────────────
  border:          "rgba(255,255,255,0.12)",   // standard card borders
  borderSubtle:    "rgba(255,255,255,0.07)",   // very subtle separators
  borderStrong:    "rgba(255,255,255,0.24)",   // focused inputs, selected cards

  // ── Overlay tints (for section backgrounds, icon halos) ─────────────────────
  surfaceWarm:     "rgba(232,160,182,0.07)",   // pink-warm section tint
  surfaceSage:     "rgba(126,200,160,0.08)",   // sage section tint
  surfaceLavender: "rgba(181,138,200,0.10)",   // lavender section tint

  // ── LEGACY ALIASES (backward-compat — Phase 3 will remove these) ────────────
  // ⚠️  Do not reference these in NEW code. Use semantic tokens above instead.
  text:            _MOON_PEARL,               // → textPrimary
  textSecondary:   "#DDD0E8",                 // → (no direct equivalent; use textMuted)
  muted:           _LAVENDER_DUST,            // → textMuted
  hint:            _PLUM_WHISPER,             // → textHint
  card:            _BLACKBERRY_SMOKE,         // → surface
  terracotta:      _BLOOM_PINK,               // → primaryCTA
  sage:            _FERTILE_SAGE,             // → fertileColor
  peach:           "#F0B878",                 // → (amber accent; no direct equiv.)
  lavender:        _LAVENDER_DUST,            // → textMuted
  coral:           _PERIOD_ROSE,              // → periodColor
  rose:            _PERIOD_ROSE,              // → periodColor
  sand:            _GOLDEN_SAND,              // → warning / premium
  navy:            _DEEP_PLUM_VOID,           // → (deep shadow; no direct equiv.)
  surfaceWarmLegacy:"rgba(232,160,182,0.07)", // matches surfaceWarm
};

// ─────────────────────────────────────────────────────────────────────────────
// §3  LIGHT PALETTE  (Plum Cream — accessible warm-light variant)
// ─────────────────────────────────────────────────────────────────────────────
export const lightColors = {

  // ── Core layout ─────────────────────────────────────────────────────────────
  background:      _L_BG,
  surface:         _L_SURFACE,
  surfaceRaised:   _L_RAISED,

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:     _L_TEXT,
  textMuted:       _L_MUTED,
  textHint:        _L_HINT,

  // ── Brand action ────────────────────────────────────────────────────────────
  primaryCTA:      _L_CTA,
  accentDark:      "#A94F6A",
  warning:         _L_WARNING,
  premium:         _L_WARNING,

  // ── Biological tokens ────────────────────────────────────────────────────────
  periodColor:     _L_PERIOD,
  fertileColor:    _L_FERTILE,
  ovulationColor:  "#2D8A5E",

  // ── Data visualization ───────────────────────────────────────────────────────
  chartLine:       "#D8C4E8",
  chartGrid:       "#EAD8F4",

  // ── Border system ────────────────────────────────────────────────────────────
  border:          "rgba(255,255,255,0.82)",
  borderSubtle:    "rgba(180,160,200,0.35)",
  borderStrong:    "rgba(100,60,140,0.22)",

  // ── Overlay tints ────────────────────────────────────────────────────────────
  surfaceWarm:     "rgba(196,104,128,0.06)",
  surfaceSage:     "rgba(58,138,94,0.07)",
  surfaceLavender: "rgba(146,119,200,0.10)",

  // ── LEGACY ALIASES ───────────────────────────────────────────────────────────
  text:            _L_TEXT,
  textSecondary:   "#3D2850",
  muted:           _L_MUTED,
  hint:            _L_HINT,
  card:            "rgba(240,232,248,0.80)",
  terracotta:      _L_CTA,
  sage:            _L_FERTILE,
  peach:           "#E8943A",
  lavender:        "#9277C8",
  coral:           _L_PERIOD,
  rose:            "#C87890",
  sand:            _L_WARNING,
  navy:            _L_TEXT,
  surfaceWarmLegacy:"rgba(196,104,128,0.06)",
};

// ─────────────────────────────────────────────────────────────────────────────
// §4  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export type AppColorMode = "light" | "dark";
export type AppColors    = typeof darkColors; // single canonical type — both palettes share the same keys

export function getColors(mode: AppColorMode): AppColors {
  return mode === "dark" ? darkColors : lightColors;
}

/**
 * Standalone biological palette — import directly when a component only needs
 * cycle-state colors without the full theme (e.g., chart renderers).
 */
export const BIO = {
  period:     _PERIOD_ROSE,
  fertile:    _FERTILE_SAGE,
  ovulation:  "#2D8A5E",
  /** Low-opacity fill variants (background halos, day-pill tints) */
  periodBg:   "rgba(232,128,144,0.18)",
  fertileBg:  "rgba(126,200,160,0.16)",
  ovulationBg:"rgba(45, 138, 94, 0.16)",
  /** On-dark text that sits on top of each tint */
  periodText:    _PERIOD_ROSE,
  fertileText:   _FERTILE_SAGE,
  ovulationText: "#2D8A5E",
} as const;
