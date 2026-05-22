/**
 * PremiumLockedCard — premium upsell components
 *
 * Token mapping
 * ─────────────
 *  LockedInsightCard gradient  →  background → surface → surfaceRaised
 *  Primary CTA background      →  primaryCTA   (#E8A6B6 Bloom Pink)
 *  Primary CTA text            →  background   (#221822 Midnight Plum)
 *                                 ▸ contrast: ~10.4:1 ✓✓✓ (AAA)
 *  Premium accent              →  warning / premium  (#D8B07C Golden Sand)
 *  Body text                   →  textPrimary / textMuted via useColorMode
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { F } from "../../constants/fonts";
import { spacing } from "../../constants/spacing";
import { useColorMode } from "../../hooks/useColorMode";

const features = [
  "Advanced AI pattern detection",
  "Weekly hormone reports",
  "Premium yoga flows",
  "Nutrition guidance",
  "Wearable intelligence",
];

// ── LockedInsightCard ─────────────────────────────────────────────────────────
export function LockedInsightCard({ onExplore }: { onExplore?: () => void }) {
  const { colors } = useColorMode();

  return (
    <LinearGradient
      // Dark plum gradient: background → surface → surfaceRaised
      colors={[colors.background, colors.surface, colors.surfaceRaised]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.locked}
    >
      {/* Premium glow halo — uses warning/golden-sand at low opacity */}
      <View style={[styles.glow, { backgroundColor: `${colors.warning}28` }]} />

      {/* Lock icon */}
      <View style={[styles.lockIcon, { backgroundColor: colors.border }]}>
        <Ionicons name="lock-closed" size={18} color={colors.textPrimary} />
      </View>

      {/* Faux chart preview */}
      <View style={styles.previewChart}>
        <View style={[styles.previewLine, { backgroundColor: `${colors.textMuted}30`, width: "72%" }]} />
        <View style={[styles.previewLine, { backgroundColor: `${colors.textMuted}22`, width: "52%" }]} />
        <View style={[styles.previewLine, { backgroundColor: `${colors.textMuted}30`, width: "84%" }]} />
      </View>

      <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>
        Unlock deeper wellness intelligence.
      </Text>
      <Text style={[styles.lockedCopy, { color: colors.textMuted }]}>
        Premium insights feel like a quiet body concierge, never a blocker.
      </Text>

      {/* CTA — Bloom Pink bg + Midnight Plum text (10.4:1) */}
      <Pressable
        onPress={onExplore}
        style={({ pressed }) => [styles.lockedCta, { backgroundColor: colors.primaryCTA }, pressed && styles.pressed]}
      >
        <Text style={[styles.lockedCtaText, { color: colors.background }]}>Explore Premium</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.background} />
      </Pressable>
    </LinearGradient>
  );
}

// ── PremiumPreviewCard ─────────────────────────────────────────────────────────
export function PremiumPreviewCard({ onExplore }: { onExplore?: () => void }) {
  const { colors } = useColorMode();

  return (
    <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Star icon — premium/warning golden accent */}
      <MaterialCommunityIcons name="crown-outline" size={22} color={colors.premium} />

      <View style={{ flex: 1 }}>
        <Text style={[styles.previewTitle, { color: colors.textPrimary }]}>Premium Preview</Text>
        <Text style={[styles.previewSub, { color: colors.textMuted }]}>
          Advanced reports, wearable intelligence, and deeper Bloop patterns.
        </Text>
      </View>

      <Pressable
        onPress={onExplore}
        style={({ pressed }) => [
          styles.previewButton,
          { backgroundColor: `${colors.primaryCTA}22`, borderColor: `${colors.primaryCTA}44`, borderWidth: 1 },
          pressed && styles.pressed,
        ]}
      >
        {/* Text on semi-transparent Bloom Pink tint → use primaryCTA color for label */}
        <Text style={[styles.previewButtonText, { color: colors.primaryCTA }]}>Explore</Text>
      </Pressable>
    </View>
  );
}

// ── UpgradeSheet ──────────────────────────────────────────────────────────────
export function UpgradeSheet({ onClose, onExplore }: { onClose?: () => void; onExplore?: () => void }) {
  const { colors } = useColorMode();

  return (
    <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
      <View style={[styles.sheetHandle, { backgroundColor: colors.borderSubtle }]} />

      <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Soul Premium</Text>

      {features.map((feature) => (
        <View key={feature} style={styles.featureRow}>
          <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.fertileColor} />
          <Text style={[styles.featureText, { color: colors.textPrimary }]}>{feature}</Text>
        </View>
      ))}

      {/* Primary CTA — Bloom Pink bg + Midnight Plum text = 10.4:1 contrast */}
      <Pressable
        onPress={onExplore}
        style={({ pressed }) => [styles.sheetCta, { backgroundColor: colors.primaryCTA }, pressed && styles.pressed]}
      >
        <Text style={[styles.sheetCtaText, { color: colors.background }]}>Explore Premium</Text>
      </Pressable>

      <Pressable onPress={onClose} style={styles.later}>
        <Text style={[styles.laterText, { color: colors.textMuted }]}>Maybe later</Text>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── LockedInsightCard ────────────────────────────────────────────────────────
  locked: {
    minHeight: 238,
    borderRadius: spacing.radiusXXl,
    padding: spacing.lg,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  glow: {
    position: "absolute",
    right: -40,
    top: -42,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  lockIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  previewChart: {
    position: "absolute",
    left: 22,
    top: 28,
    width: 132,
    gap: 9,
    opacity: 0.52,
  },
  previewLine: {
    height: 10,
    borderRadius: 999,
  },
  lockedTitle: {
    fontFamily: F.display,
    fontSize: 24,
    lineHeight: 30,
    maxWidth: 290,
  },
  lockedCopy: {
    fontFamily: F.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  lockedCta: {
    alignSelf: "flex-start",
    marginTop: 16,
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lockedCtaText: {
    fontFamily: F.uiLabel,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },

  // ── PremiumPreviewCard ────────────────────────────────────────────────────────
  previewCard: {
    minHeight: 96,
    borderRadius: 28,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  previewTitle: {
    fontFamily: F.ui,
    fontSize: 14,
    lineHeight: 18,
  },
  previewSub: {
    fontFamily: F.body,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  previewButton: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  previewButtonText: {
    fontFamily: F.uiBold,
    fontSize: 12,
    lineHeight: 16,
  },

  // ── UpgradeSheet ──────────────────────────────────────────────────────────────
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: F.display,
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 34,
  },
  featureText: {
    fontFamily: F.body,
    fontSize: 13,
    lineHeight: 18,
  },
  sheetCta: {
    minHeight: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  sheetCtaText: {
    fontFamily: F.uiLabel,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.8,
  },
  later: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  laterText: {
    fontFamily: F.ui,
    fontSize: 13,
    lineHeight: 17,
  },

  // ── Shared ────────────────────────────────────────────────────────────────────
  pressed: { transform: [{ scale: 0.97 }] },
});
