export const lightColors = {
  background: "#FAF9F6",
  card: "rgba(250,249,246,0.74)",
  border: "rgba(255,255,255,0.82)",
  text: "#2B2D42",
  muted: "#6B708D",
  terracotta: "#E07A5F",
  sage: "#81B29A",
  peach: "#F4A261",
  lavender: "#BDB2FF",
  sand: "#E7D8C9",
  rose: "#D7A6A1",
  navy: "#2B2D42",
  coral: "#D97A72"
};

export const darkColors = {
  background: "#0F172A",
  card: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.12)",
  text: "#F8FAFC",
  muted: "#CBD5E1",
  terracotta: "#E07A5F",
  sage: "#81B29A",
  peach: "#F4A261",
  lavender: "#BDB2FF",
  sand: "#CDBBAA",
  rose: "#D7A6A1",
  navy: "#111827",
  coral: "#EAA39E"
};

export type AppColorMode = "light" | "dark";

export function getColors(mode: AppColorMode) {
  return mode === "dark" ? darkColors : lightColors;
}
