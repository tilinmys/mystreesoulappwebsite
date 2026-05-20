import { useColorScheme } from "react-native";
import { getColors, type AppColorMode } from "../constants/colors";
import { useThemeStore } from "../store/themeStore";

/**
 * Returns the active color palette, a convenience isDark flag, and the
 * resolved mode string.
 *
 * Priority:
 *   1. User's explicit choice from themeStore ("light" | "dark")
 *   2. OS preference when colorMode === "system"
 *
 * EXCEPTION: The Sleep screen ignores this hook entirely and uses its own
 * hardcoded twilight/dark palette — intentional by design.
 */
export function useColorMode() {
  const scheme = useColorScheme();
  const colorMode = useThemeStore((state) => state.colorMode);

  let mode: AppColorMode;
  if (colorMode === "system") {
    mode = scheme === "dark" ? "dark" : "light";
  } else {
    mode = colorMode;
  }

  return { colors: getColors(mode), isDark: mode === "dark", mode };
}
