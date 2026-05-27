import type { ViewStyle } from "react-native";
import type { AppColors } from "./colors";
import { GRID } from "./layout";

export function GRID_COLORS(colors: AppColors) {
  return {
    cardBackground: "rgba(255,255,255,0.06)",
    cardBorder: "rgba(246,233,239,0.10)",
    cardBorderStrong: colors.primaryCTA,
    cardShadow: colors.primaryCTA,
    mutedDivider: "rgba(246,233,239,0.06)",
  } as const;
}

function softShadow(colors: AppColors): ViewStyle {
  const gridColors = GRID_COLORS(colors);

  return {
    shadowColor: gridColors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  };
}

export const CARD_STYLE_PRESETS = {
  standardCard(colors: AppColors): ViewStyle {
    const gridColors = GRID_COLORS(colors);

    return {
      backgroundColor: gridColors.cardBackground,
      borderColor: gridColors.cardBorder,
      borderRadius: GRID.cardRadius,
      borderWidth: GRID.borderWidth,
      padding: GRID.cardPadding,
      ...softShadow(colors),
    };
  },

  heroCard(colors: AppColors): ViewStyle {
    const gridColors = GRID_COLORS(colors);

    return {
      backgroundColor: gridColors.cardBackground,
      borderColor: gridColors.cardBorder,
      borderRadius: GRID.heroRadius,
      borderWidth: GRID.borderWidth,
      padding: GRID.cardPadding,
      ...softShadow(colors),
    };
  },

  activeCard(colors: AppColors): ViewStyle {
    const gridColors = GRID_COLORS(colors);

    return {
      backgroundColor: gridColors.cardBackground,
      borderColor: gridColors.cardBorderStrong,
      borderRadius: GRID.cardRadius,
      borderWidth: GRID.borderWidth,
      padding: GRID.cardPadding,
      ...softShadow(colors),
    };
  },

  pill(colors: AppColors): ViewStyle {
    const gridColors = GRID_COLORS(colors);

    return {
      backgroundColor: gridColors.cardBackground,
      borderColor: gridColors.cardBorder,
      borderRadius: GRID.pillRadius,
      borderWidth: GRID.borderWidth,
      paddingHorizontal: GRID.cardGap,
      paddingVertical: GRID.innerGap,
    };
  },
} as const;

export const standardCard = CARD_STYLE_PRESETS.standardCard;
export const heroCard = CARD_STYLE_PRESETS.heroCard;
export const activeCard = CARD_STYLE_PRESETS.activeCard;
export const pill = CARD_STYLE_PRESETS.pill;
