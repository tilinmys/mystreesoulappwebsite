import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { getColors, type AppColorMode } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { BloopOrb } from "./BloopOrb";

function Shimmer({
  height,
  radius = 18,
  style,
  width = "100%"
}: {
  height: number;
  radius?: number;
  style?: ViewStyle;
  width?: ViewStyle["width"];
}) {
  const opacity = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.82,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.42,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.shimmer, { height, width, borderRadius: radius, opacity }, style]} />;
}

export function CardSkeleton({ mode = "light" }: { mode?: AppColorMode }) {
  const colors = getColors(mode);
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Shimmer height={42} radius={21} width={42} />
      <Shimmer height={18} style={styles.lineShort} />
      <Shimmer height={14} style={styles.lineLong} />
      <Shimmer height={78} radius={24} />
    </View>
  );
}

export function ScreenSkeleton({ mode = "light" }: { mode?: AppColorMode }) {
  return (
    <View style={styles.screenStack}>
      <CardSkeleton mode={mode} />
      <CardSkeleton mode={mode} />
      <CardSkeleton mode={mode} />
    </View>
  );
}

export function InsightLoadingState({ mode = "light" }: { mode?: AppColorMode }) {
  const colors = getColors(mode);
  return (
    <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <BloopOrb size={58} />
      <Text style={[styles.loadingText, { color: colors.text }]}>Bloop is gently preparing your insights...</Text>
      <Shimmer height={16} style={styles.loadingLine} />
      <Shimmer height={16} style={styles.loadingLineSmall} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenStack: { gap: 14 },
  card: { minHeight: 184, borderRadius: spacing.radiusXXl, padding: spacing.md, borderWidth: 1, gap: 12 },
  shimmer: { backgroundColor: "rgba(244,162,97,0.16)" },
  lineShort: { width: "52%" },
  lineLong: { width: "82%" },
  loadingCard: { alignItems: "center", borderRadius: spacing.radiusXXl, padding: spacing.lg, borderWidth: 1 },
  loadingText: { fontSize: 14, lineHeight: 20, fontWeight: "900", marginTop: 14, marginBottom: 16, textAlign: "center" },
  loadingLine: { width: "76%", marginTop: 2 },
  loadingLineSmall: { width: "54%", marginTop: 8 }
});
