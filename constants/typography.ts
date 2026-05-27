/**
 * MyStree Soul — typography.ts  v3
 *
 * Thin re-export shim — the canonical type scale now lives in constants/fonts.ts
 * as the `TS` object.  This file keeps the handful of `typography.xxx` references
 * alive while Phase 3 migrates them to `TS.xxx`.
 *
 * @deprecated  Import `TS` from `./fonts` in new code.
 */
import type { TextStyle } from "react-native";
import { F, TS } from "./fonts";

export const TYPE_SCALE = {
  screenTitle: {
    fontFamily: F.display,
    fontSize: 26,
    fontWeight: "700",
  },
  sectionLabel: {
    fontFamily: F.uiLabel,
    fontSize: 12,
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontFamily: F.uiLabel,
    fontSize: 17,
    fontWeight: "700",
  },
  body: {
    fontFamily: F.body,
    fontSize: 14,
    fontWeight: "400",
  },
  caption: {
    fontFamily: F.body,
    fontSize: 12,
    fontWeight: "400",
  },
  cta: {
    fontFamily: F.uiLabel,
    fontSize: 14,
    fontWeight: "700",
  },
} as const satisfies Record<string, TextStyle>;

export const typography = {
  heroTitle:    TS.heroTitle,
  sectionTitle: TS.sectionTitle,
  body:         TS.body,
  caption:      TS.caption,
  // Kept for any legacy spread usage — identical to TS.sectionTitle
  screenTitle:  TS.sectionTitle,
};
