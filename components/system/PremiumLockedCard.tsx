import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { lightColors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

const features = ["Advanced AI pattern detection", "Weekly hormone reports", "Premium yoga flows", "Nutrition guidance", "Wearable intelligence"];

export function LockedInsightCard({ onExplore }: { onExplore?: () => void }) {
  return (
    <LinearGradient colors={["#141622", "#2B2D42", "#365049"]} style={styles.locked}>
      <View style={styles.glow} />
      <View style={styles.lockIcon}>
        <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
      </View>
      <View style={styles.previewChart}>
        <View style={[styles.previewLine, { width: "72%" }]} />
        <View style={[styles.previewLine, { width: "52%" }]} />
        <View style={[styles.previewLine, { width: "84%" }]} />
      </View>
      <Text style={styles.title}>Unlock deeper wellness intelligence.</Text>
      <Text style={styles.copy}>Premium insights feel like a quiet body concierge, never a blocker.</Text>
      <Pressable onPress={onExplore} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <Text style={styles.ctaText}>Explore Premium</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </Pressable>
    </LinearGradient>
  );
}

export function PremiumPreviewCard({ onExplore }: { onExplore?: () => void }) {
  return (
    <View style={styles.previewCard}>
      <MaterialCommunityIcons name="star-four-points" size={22} color={lightColors.terracotta} />
      <View style={{ flex: 1 }}>
        <Text style={styles.previewTitle}>Premium Preview</Text>
        <Text style={styles.previewSub}>Advanced reports, wearable intelligence, and deeper Bloop patterns.</Text>
      </View>
      <Pressable onPress={onExplore} style={({ pressed }) => [styles.previewButton, pressed && styles.pressed]}>
        <Text style={styles.previewButtonText}>Explore</Text>
      </Pressable>
    </View>
  );
}

export function UpgradeSheet({ onClose, onExplore }: { onClose?: () => void; onExplore?: () => void }) {
  return (
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      <Text style={styles.sheetTitle}>Soul Premium</Text>
      {features.map((feature) => (
        <View key={feature} style={styles.featureRow}>
          <MaterialCommunityIcons name="check-circle-outline" size={18} color={lightColors.sage} />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
      <Pressable onPress={onExplore} style={({ pressed }) => [styles.sheetCta, pressed && styles.pressed]}>
        <Text style={styles.sheetCtaText}>Explore Premium</Text>
      </Pressable>
      <Pressable onPress={onClose} style={styles.later}>
        <Text style={styles.laterText}>Maybe later</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  locked: { minHeight: 238, borderRadius: spacing.radiusXXl, padding: spacing.lg, overflow: "hidden", justifyContent: "flex-end" },
  glow: { position: "absolute", right: -40, top: -42, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(224,122,95,0.24)" },
  lockIcon: { position: "absolute", top: 20, right: 20, width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  previewChart: { position: "absolute", left: 22, top: 28, width: 132, gap: 9, opacity: 0.48 },
  previewLine: { height: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.20)" },
  title: { color: "#FFFFFF", fontFamily: "serif", fontSize: 24, lineHeight: 30, fontWeight: "800", maxWidth: 290 },
  copy: { color: "rgba(250,249,246,0.68)", fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 8 },
  cta: { alignSelf: "flex-start", marginTop: 16, minHeight: 42, borderRadius: 21, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.16)" },
  ctaText: { color: "#FFFFFF", fontSize: 12, lineHeight: 16, fontWeight: "900" },
  previewCard: { minHeight: 96, borderRadius: 28, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(250,249,246,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.82)" },
  previewTitle: { color: lightColors.text, fontSize: 14, lineHeight: 18, fontWeight: "900" },
  previewSub: { color: lightColors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 4 },
  previewButton: { minHeight: 38, borderRadius: 19, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(224,122,95,0.14)" },
  previewButtonText: { color: lightColors.terracotta, fontSize: 12, lineHeight: 16, fontWeight: "900" },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, backgroundColor: lightColors.background },
  sheetHandle: { alignSelf: "center", width: 44, height: 5, borderRadius: 999, backgroundColor: "rgba(107,112,141,0.22)", marginBottom: 18 },
  sheetTitle: { color: lightColors.text, fontFamily: "serif", fontSize: 26, lineHeight: 32, fontWeight: "800", marginBottom: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 34 },
  featureText: { color: lightColors.text, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  sheetCta: { minHeight: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", backgroundColor: lightColors.terracotta, marginTop: 18 },
  sheetCtaText: { color: "#FFFFFF", fontSize: 14, lineHeight: 18, fontWeight: "900" },
  later: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 8 },
  laterText: { color: lightColors.muted, fontSize: 13, lineHeight: 17, fontWeight: "900" },
  pressed: { transform: [{ scale: 0.97 }] }
});
