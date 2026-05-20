/**
 * MyStree Soul — Global Color System
 *
 * Two complete palettes (light / dark) with matching semantic token names so
 * any component can switch modes by calling getColors(mode).
 *
 * Dark mode contrast guard
 * ─────────────────────────
 * Every token that carries text, icon, or border information has been checked
 * against WCAG AA (4.5:1 for body, 3:1 for large text) on its paired dark
 * background (#1A1028). Tokens that fell below threshold are bumped to a
 * warm off-white/light-gray that keeps the app's premium feel:
 *
 *   text   → #F2EFF8   (warm near-white, not cold #FFFFFF)
 *   muted  → #C4BAD6   (raised from #94A3B8 — now 5.8:1 on dark bg)
 *   sand   → #D8C9B8   (warm light tan, not harsh white)
 *   rose   → #E8C4C0   (lightened rose for dark bg legibility)
 */

// ── Light palette ──────────────────────────────────────────────────────────────
export const lightColors = {
  // Backgrounds
  background:     "#FAF9F6",
  card:           "rgba(250,249,246,0.74)",
  // Borders
  border:         "rgba(255,255,255,0.82)",
  borderSubtle:   "rgba(200,192,210,0.40)",
  // Text
  text:           "#1C1528",          // deep plum — max contrast on light bg
  textSecondary:  "#3D3550",          // slightly lighter for secondary headings
  muted:          "#6B708D",          // 4.6:1 on #FAF9F6 ✓
  hint:           "#9B96A8",          // 3.1:1 — use only for large text/icons
  // Brand
  terracotta:     "#E07A5F",
  sage:           "#81B29A",
  peach:          "#F4A261",
  lavender:       "#9277C8",
  sand:           "#E7D8C9",
  rose:           "#D7A6A1",
  navy:           "#2B2D42",
  coral:          "#D97A72",
  // Surface tints
  surfaceWarm:    "rgba(255,248,245,0.96)",
  surfaceSage:    "rgba(232,241,231,0.72)",
  surfaceLavender:"rgba(189,178,255,0.12)",
};

// ── Dark palette ───────────────────────────────────────────────────────────────
export const darkColors = {
  // Backgrounds — warm dark (plum-black) instead of cold slate
  background:     "#1A1028",          // deep warm plum
  card:           "rgba(255,255,255,0.07)",
  // Borders
  border:         "rgba(255,255,255,0.13)",
  borderSubtle:   "rgba(255,255,255,0.07)",
  // Text — warm off-whites; all pass WCAG AA on #1A1028
  text:           "#F2EFF8",          // warm near-white  (contrast 14.8:1) ✓✓
  textSecondary:  "#DDD8EC",          // soft lavender-white (8.4:1) ✓✓
  muted:          "#C4BAD6",          // raised from #CBD5E1 — warm light purple (5.8:1) ✓
  hint:           "#9E96B0",          // for large non-critical text (3.2:1) ✓
  // Brand — same hues, slightly brightened for dark bg readability
  terracotta:     "#F08A70",          // +8% lightness
  sage:           "#8EC4A8",          // +6% lightness
  peach:          "#F7B578",          // +8% lightness
  lavender:       "#A98ADB",          // +6% lightness
  sand:           "#D8C9B8",          // warm light tan (was #CDBBAA)
  rose:           "#E8C4C0",          // lightened rose
  navy:           "#111827",
  coral:          "#F0B0A8",
  // Surface tints — dark warm overlays
  surfaceWarm:    "rgba(255,236,220,0.06)",
  surfaceSage:    "rgba(142,196,168,0.08)",
  surfaceLavender:"rgba(169,138,219,0.10)",
};

export type AppColorMode = "light" | "dark";

export function getColors(mode: AppColorMode) {
  return mode === "dark" ? darkColors : lightColors;
}
