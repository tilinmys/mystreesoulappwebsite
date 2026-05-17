import { useColorScheme } from "react-native";
import { getColors, type AppColorMode } from "../constants/colors";

export function useColorMode() {
  const scheme = useColorScheme();
  const mode: AppColorMode = scheme === "dark" ? "dark" : "light";
  return { colors: getColors(mode), isDark: mode === "dark", mode };
}
