import type { StaticImageData } from "next/image";

import bloopco1 from "../../images/processed/bloopco1.webp";
import bloopco2 from "../../images/processed/bloopco2.webp";
import bloopco3 from "../../images/processed/bloopco3.webp";
import bloopco4 from "../../images/processed/bloopco4.webp";
import bloopco5 from "../../images/processed/bloopco5.webp";
import bloopco6 from "../../images/processed/bloopco6.webp";
import bloopco7 from "../../images/processed/bloopco7.webp";
import bloopco8 from "../../images/processed/bloopco8.webp";
import bloopco9 from "../../images/processed/bloopco9.webp";
import bloopco10 from "../../images/processed/bloopco10.webp";
import bloopco11 from "../../images/processed/bloopco11.webp";

export type BloopState =
  | "idle"
  | "guide"
  | "encourage"
  | "reassure"
  | "celebrate"
  | "inform"
  | "empty"
  | "alert"
  | "adolescence"
  | "pregnancy"
  | "menopause";

export type BloopSizePreset = "tiny" | "small" | "medium" | "large" | "hero";

export const BLOOP_SIZE_PRESETS: Record<BloopSizePreset, number> = {
  tiny: 24,
  small: 36,
  medium: 56,
  large: 88,
  hero: 136,
};

export const BLOOP_ASSETS: Record<BloopState, StaticImageData> = {
  idle: bloopco1,
  guide: bloopco2,
  encourage: bloopco3,
  reassure: bloopco4,
  celebrate: bloopco5,
  inform: bloopco6,
  empty: bloopco7,
  alert: bloopco8,
  adolescence: bloopco9,
  pregnancy: bloopco10,
  menopause: bloopco11,
};

export const BLOOP_ACCESSIBILITY_LABELS: Record<BloopState, string> = {
  idle: "Bloop companion",
  guide: "Bloop guide",
  encourage: "Bloop encouragement",
  reassure: "Bloop supportive companion",
  celebrate: "Bloop celebration",
  inform: "Bloop insight companion",
  empty: "Bloop empty state companion",
  alert: "Bloop reminder companion",
  adolescence: "Bloop adolescence support companion",
  pregnancy: "Bloop pregnancy support companion",
  menopause: "Bloop menopause support companion",
};
