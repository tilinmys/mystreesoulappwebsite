import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, type ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { type AppColors } from "../constants/colors";
import { F } from "../constants/fonts";
import { useColorMode } from "../hooks/useColorMode";
import { useSafeBack } from "../hooks/useSafeBack";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const premiumFeatures: { title: string; subtitle: string; icon: IconName; color: string }[] = [
  {
    title: "Soli emotional guide",
    subtitle: "Gentle AI companion responses for harder days.",
    icon: "face-woman-shimmer-outline",
    color: "#9B72CB",
  },
  {
    title: "Deep AI insights",
    subtitle: "Mood, cycle, sleep, and energy patterns in one place.",
    icon: "brain",
    color: "#D18A80",
  },
  {
    title: "Hormone intelligence",
    subtitle: "Cycle-aware wellness explanations without scary language.",
    icon: "water-outline",
    color: "#9470D2",
  },
  {
    title: "Guided journeys",
    subtitle: "Premium rituals for recovery, calm, and self-trust.",
    icon: "flower-outline",
    color: "#C47D72",
  },
];

const packagePerks = ["Private by design", "Cancel anytime", "Premium features stay locked in preview"];

export default function PremiumScreen() {
  const { colors } = useColorMode();
  const safeBack = useSafeBack();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [notice, setNotice] = useState("Bloop says: this is a locked preview for now. No payment, no pressure.");

  const s = getStyles(colors);

  const reply = (message: string) => {
    setNotice(`Bloop says: ${message}`);
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <ScrollView bounces showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* ── Header ── */}
          <View style={s.header}>
            <Pressable
              accessibilityLabel="Go back"
              onPress={safeBack}
              style={({ pressed }) => [s.backButton, pressed && s.pressed]}
            >
              <MaterialCommunityIcons name="chevron-left" size={25} color={colors.textPrimary} />
            </Pressable>
            <View style={s.headerCopy}>
              <Text style={s.title}>Soul Premium</Text>
              <Text style={s.subtitle}>Locked preview for deeper care</Text>
            </View>
            <View style={s.headerSpacer} />
          </View>

          {/* ── Bloop notice card ── */}
          <View style={s.noticeCard}>
            <MiniBloop />
            <Text style={s.noticeText}>{notice}</Text>
          </View>

          {/* ── Package card ── */}
          <View style={s.packageCard}>
            <View style={s.packageTop}>
              <View>
                <Text style={s.packageEyebrow}>Premium package</Text>
                <Text style={s.packageTitle}>Soul Care Preview</Text>
              </View>
              <View style={s.lockPill}>
                <MaterialCommunityIcons name="lock-outline" size={14} color={colors.premium} />
                <Text style={s.lockPillText}>Locked</Text>
              </View>
            </View>
            <Text style={s.packageCopy}>
              These are the premium features we are designing. Pricing will appear here in INR after purchase setup is connected.
            </Text>
            <View style={s.priceBox}>
              <Text style={s.priceLabel}>Package price</Text>
              <Text style={s.priceValue}>INR pricing locked</Text>
              <Text style={s.priceSub}>UI reference only. No payment is triggered.</Text>
            </View>
            <View style={s.perkRow}>
              {packagePerks.map((perk) => (
                <View style={s.perkChip} key={perk}>
                  <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.primaryCTA} />
                  <Text style={s.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Section header ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Premium features</Text>
            <Text style={s.sectionSub}>Shown first so users know what they are exploring.</Text>
          </View>

          {/* ── Feature rows ── */}
          <View style={s.featureList}>
            {premiumFeatures.map((feature) => (
              <Pressable
                key={feature.title}
                onPress={() => reply(`${feature.title} is still locked, bestie. Sneak peek only for now.`)}
                style={({ pressed }) => [s.featureRow, pressed && s.pressed]}
              >
                <View style={[s.featureIcon, { backgroundColor: `${feature.color}22` }]}>
                  <MaterialCommunityIcons name={feature.icon} size={23} color={feature.color} />
                </View>
                <View style={s.featureCopy}>
                  <Text style={s.featureTitle}>{feature.title}</Text>
                  <Text style={s.featureSub}>{feature.subtitle}</Text>
                </View>
                <MaterialCommunityIcons name="lock-outline" size={17} color={colors.premium} />
              </Pressable>
            ))}
          </View>

          {/* ── Billing card ── */}
          <View style={s.billingCard}>
            <Text style={s.billingTitle}>Billing preview</Text>
            <View style={s.toggle}>
              {(["monthly", "yearly"] as const).map((item) => {
                const active = billing === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setBilling(item);
                      reply(`${item === "monthly" ? "Monthly" : "Yearly"} preview selected. Main character budgeting, but still locked.`);
                    }}
                    style={({ pressed }) => [s.toggleOption, active && s.toggleActive, pressed && s.pressed]}
                  >
                    <Text style={[s.toggleText, active && s.toggleTextActive]}>
                      {item === "monthly" ? "Monthly" : "Yearly"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={s.billingNote}>No rate is shown yet. The app will display INR plans only after real store products are connected.</Text>
          </View>

          {/* ── Primary CTA ── */}
          <Pressable
            onPress={() => reply("Soul Premium is locked rn. You are on the soft-launch watchlist vibe.")}
            style={({ pressed }) => [s.primaryCta, pressed && s.pressed]}
          >
            <MaterialCommunityIcons name="lock-outline" size={18} color={colors.background} />
            <Text style={s.primaryCtaText}>Preview locked package</Text>
          </Pressable>

          {/* ── Secondary CTA ── */}
          <Pressable
            onPress={() => reply("No worries. We will keep this calm, private, and zero-pressure.")}
            style={({ pressed }) => [s.secondaryCta, pressed && s.pressed]}
          >
            <Text style={s.secondaryCtaText}>Ask Bloop what this means</Text>
          </Pressable>

          <View style={{ height: 34 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MiniBloop() {
  return (
    <View style={miniBlooStyles.container}>
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Defs>
          <RadialGradient id="miniBloop" cx="35%" cy="25%" r="70%">
            <Stop offset="0" stopColor="#FFFDF7" stopOpacity="1" />
            <Stop offset="0.45" stopColor="#E9DDFB" stopOpacity="1" />
            <Stop offset="1" stopColor="#A98BDD" stopOpacity="0.92" />
          </RadialGradient>
        </Defs>
        <Path d="M24 4 C38 4 45 15 43 29 C41 42 30 45 24 43 C14 46 5 39 6 27 C7 13 12 4 24 4 Z" fill="url(#miniBloop)" />
        <Path d="M15 22 C18 25 21 25 23 22" fill="none" stroke="#5E5090" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M27 22 C30 25 33 25 35 22" fill="none" stroke="#5E5090" strokeWidth="1.8" strokeLinecap="round" />
        <Circle cx="24" cy="34" r="5" fill="rgba(255,255,255,0.72)" />
      </Svg>
    </View>
  );
}

// MiniBloop is an SVG drawing (not a mascot photo) — gradient fill inside SVG is fine
const miniBlooStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
});

function getStyles(colors: AppColors) {
  const darkShadow = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 20,
    elevation: 4,
  };

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    safe: { flex: 1 },
    scroll: {
      gap: 16,
      paddingBottom: 28,
      paddingHorizontal: 20,
      paddingTop: 10,
    },

    // ── Header ──────────────────────────────────────────────────────────────────
    header: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      minHeight: 54,
    },
    backButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: 23,
      borderWidth: 1,
      height: 46,
      justifyContent: "center",
      width: 46,
      ...darkShadow,
    },
    headerCopy: { flex: 1 },
    title: {
      color: colors.textPrimary,
      fontFamily: F.luxuryExtraBold,
      fontSize: 32,
      lineHeight: 38,
    },
    subtitle: {
      color: colors.textMuted,
      fontFamily: F.uiSemiBold,
      fontSize: 13,
      lineHeight: 18,
    },
    headerSpacer: { width: 46 },

    // ── Notice card ─────────────────────────────────────────────────────────────
    noticeCard: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 24,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      padding: 14,
      ...darkShadow,
    },
    noticeText: {
      color: colors.textPrimary,
      flex: 1,
      fontFamily: F.uiSemiBold,
      fontSize: 13,
      lineHeight: 19,
    },

    // ── Package card ─────────────────────────────────────────────────────────────
    packageCard: {
      backgroundColor: colors.surface,
      borderColor: colors.borderSubtle,
      borderRadius: 30,
      borderWidth: 1,
      gap: 14,
      minHeight: 256,
      overflow: "hidden",
      padding: 18,
      ...darkShadow,
    },
    packageTop: {
      alignItems: "flex-start",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    packageEyebrow: {
      color: colors.primaryCTA,
      fontFamily: F.uiBlack,
      fontSize: 10,
      letterSpacing: 1,
      lineHeight: 14,
      textTransform: "uppercase",
    },
    packageTitle: {
      color: colors.textPrimary,
      fontFamily: F.luxuryBold,
      fontSize: 25,
      lineHeight: 31,
    },
    lockPill: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    lockPillText: {
      color: colors.premium,
      fontFamily: F.uiBlack,
      fontSize: 10,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    packageCopy: {
      color: colors.textMuted,
      fontFamily: F.uiSemiBold,
      fontSize: 13,
      lineHeight: 20,
    },
    priceBox: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: 22,
      borderWidth: 1,
      padding: 14,
    },
    priceLabel: {
      color: colors.textMuted,
      fontFamily: F.uiBold,
      fontSize: 11,
      lineHeight: 15,
    },
    priceValue: {
      color: colors.textPrimary,
      fontFamily: F.luxuryBold,
      fontSize: 22,
      lineHeight: 28,
      marginTop: 2,
    },
    priceSub: {
      color: colors.textMuted,
      fontFamily: F.uiSemiBold,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 2,
    },
    perkRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    perkChip: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderRadius: 999,
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    perkText: {
      color: colors.textPrimary,
      fontFamily: F.uiBold,
      fontSize: 10.5,
      lineHeight: 14,
    },

    // ── Section header ───────────────────────────────────────────────────────────
    sectionHeader: { gap: 2, paddingTop: 4 },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: F.luxuryBold,
      fontSize: 22,
      lineHeight: 28,
    },
    sectionSub: {
      color: colors.textMuted,
      fontFamily: F.uiSemiBold,
      fontSize: 12,
      lineHeight: 17,
    },

    // ── Feature rows ─────────────────────────────────────────────────────────────
    featureList: { gap: 10 },
    featureRow: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 24,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      minHeight: 82,
      padding: 13,
      ...darkShadow,
    },
    featureIcon: {
      alignItems: "center",
      borderRadius: 23,
      height: 46,
      justifyContent: "center",
      width: 46,
    },
    featureCopy: { flex: 1 },
    featureTitle: {
      color: colors.textPrimary,
      fontFamily: F.uiBold,
      fontSize: 14,
      lineHeight: 18,
    },
    featureSub: {
      color: colors.textMuted,
      fontFamily: F.uiSemiBold,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 3,
    },

    // ── Billing card ─────────────────────────────────────────────────────────────
    billingCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 26,
      borderWidth: 1,
      gap: 12,
      padding: 16,
      ...darkShadow,
    },
    billingTitle: {
      color: colors.textPrimary,
      fontFamily: F.uiBold,
      fontSize: 15,
      lineHeight: 20,
    },
    toggle: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.borderSubtle,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: "row",
      height: 44,
      padding: 4,
    },
    toggleOption: {
      alignItems: "center",
      borderRadius: 999,
      flex: 1,
      justifyContent: "center",
    },
    toggleActive: {
      backgroundColor: colors.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.20,
      shadowRadius: 8,
    },
    toggleText: {
      color: colors.textMuted,
      fontFamily: F.uiBold,
      fontSize: 14,
    },
    toggleTextActive: { color: colors.textPrimary },
    billingNote: {
      color: colors.textMuted,
      fontFamily: F.uiSemiBold,
      fontSize: 11,
      lineHeight: 16,
    },

    // ── CTAs ─────────────────────────────────────────────────────────────────────
    primaryCta: {
      alignItems: "center",
      backgroundColor: colors.primaryCTA,
      borderRadius: 999,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      minHeight: 54,
      shadowColor: colors.primaryCTA,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.30,
      shadowRadius: 18,
      elevation: 4,
    },
    primaryCtaText: {
      color: colors.background,
      fontFamily: F.uiBold,
      fontSize: 15,
      lineHeight: 20,
    },
    secondaryCta: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 48,
    },
    secondaryCtaText: {
      color: colors.primaryCTA,
      fontFamily: F.uiBold,
      fontSize: 14,
    },

    pressed: { transform: [{ scale: 0.97 }] },
  });
}
