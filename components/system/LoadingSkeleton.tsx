/**
 * LoadingSkeleton — shimmer placeholders
 *
 * Token mapping
 * ─────────────
 *  Card bg       →  colors.surface
 *  Border        →  colors.border
 *  Shimmer fill  →  colors.surfaceRaised at 28% — lavender-toned, on-brand
 *  Loading text  →  colors.textPrimary
 *  Shadow        →  colors.background
 */
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { type AppColorMode, getColors } from "../../constants/colors";
import { F } from "../../constants/fonts";
import { spacing } from "../../constants/spacing";
import { BloopOrb } from "./BloopOrb";

// ── Shimmer atom ──────────────────────────────────────────────────────────────
function Shimmer({
  color,
  height,
  radius = 18,
  style,
  width  = "100%",
}: {
  color:   string;
  height:  number;
  radius?: number;
  style?:  ViewStyle;
  width?:  ViewStyle["width"];
}) {
  const opacity = useRef(new Animated.Value(0.32)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.72, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.32, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.shimmer, { height, width, borderRadius: radius, backgroundColor: color, opacity }, style]}
    />
  );
}

// ── CardSkeleton ──────────────────────────────────────────────────────────────
export function CardSkeleton({ mode = "light" }: { mode?: AppColorMode }) {
  const colors = getColors(mode);
  // Shimmer color: surfaceRaised gives a plum-mauve shimmer that reads well on surface bg
  const shimmerColor = colors.surfaceRaised;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Shimmer color={shimmerColor} height={42} radius={21} width={42} />
      <Shimmer color={shimmerColor} height={18} style={styles.lineShort} />
      <Shimmer color={shimmerColor} height={14} style={styles.lineLong} />
      <Shimmer color={shimmerColor} height={78} radius={24} />
    </View>
  );
}

// ── ScreenSkeleton ────────────────────────────────────────────────────────────
export function ScreenSkeleton({ mode = "light" }: { mode?: AppColorMode }) {
  return (
    <View style={styles.screenStack}>
      <CardSkeleton mode={mode} />
      <CardSkeleton mode={mode} />
      <CardSkeleton mode={mode} />
    </View>
  );
}

// ── InsightLoadingState ────────────────────────────────────────────────────────
export function InsightLoadingState({ mode = "light" }: { mode?: AppColorMode }) {
  const colors       = getColors(mode);
  const shimmerColor = colors.surfaceRaised;

  return (
    <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Bloop mascot — no tints, no overlays */}
      <BloopOrb size={58} />
      <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
        Bloop is gently preparing your insights...
      </Text>
      <Shimmer color={shimmerColor} height={16} style={styles.loadingLine} />
      <Shimmer color={shimmerColor} height={16} style={styles.loadingLineSmall} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenStack: { gap: 14 },
  card: {
    minHeight: 184,
    borderRadius: spacing.radiusXXl,
    padding: spacing.md,
    borderWidth: 1,
    gap: 12,
  },
  shimmer: {},                             // backgroundColor applied inline via prop
  lineShort:        { width: "52%" },
  lineLong:         { width: "82%" },
  loadingCard: {
    alignItems: "center",
    borderRadius: spacing.radiusXXl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  loadingText: {
    fontFamily: F.body,
    fontSize:   14,
    lineHeight: 20,
    marginTop: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  loadingLine:      { width: "76%", marginTop: 2 },
  loadingLineSmall: { width: "54%", marginTop: 8 },
});
