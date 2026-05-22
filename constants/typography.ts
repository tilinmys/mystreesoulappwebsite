/**
 * MyStree Soul — typography.ts  v3
 *
 * Thin re-export shim — the canonical type scale now lives in constants/fonts.ts
 * as the `TS` object.  This file keeps the handful of `typography.xxx` references
 * alive while Phase 3 migrates them to `TS.xxx`.
 *
 * @deprecated  Import `TS` from `./fonts` in new code.
 */
import { TS } from "./fonts";

export const typography = {
  heroTitle:    TS.heroTitle,
  sectionTitle: TS.sectionTitle,
  body:         TS.body,
  caption:      TS.caption,
  // Kept for any legacy spread usage — identical to TS.sectionTitle
  screenTitle:  TS.sectionTitle,
};
