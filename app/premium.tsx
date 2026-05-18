import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, type ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { F } from "../constants/fonts";
import { useSafeBack } from "../hooks/useSafeBack";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const C = {
  bgTop: "#FCF6F5",
  bgMid: "#FEF0F2",
  bgBottom: "#F8EAF5",
  ink: "#2D2B3D",
  muted: "#77718C",
  lavender: "#9B72CB",
  peach: "#FFCBB5",
  coral: "#FF9A9E",
  rose: "#D7A6A1",
  gold: "#C9A040",
  white: "#FFFDFC",
  shadow: "#D8B8B0",
};

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
  const safeBack = useSafeBack();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [notice, setNotice] = useState("Bloop says: this is a locked preview for now. No payment, no pressure.");

  const reply = (message: string) => {
    setNotice(`Bloop says: ${message}`);
  };

  return (
    <LinearGradient colors={[C.bgTop, C.bgMid, C.bgBottom]} style={s.root}>
      <SafeAreaView style={s.safe}>
        <ScrollView bounces showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.header}>
            <Pressable
              accessibilityLabel="Go back"
              onPress={safeBack}
              style={({ pressed }) => [s.backButton, pressed && s.pressed]}
            >
              <MaterialCommunityIcons name="chevron-left" size={25} color={C.ink} />
            </Pressable>
            <View style={s.headerCopy}>
              <Text style={s.title}>Soul Premium</Text>
              <Text style={s.subtitle}>Locked preview for deeper care</Text>
            </View>
            <View style={s.headerSpacer} />
          </View>

          <View style={s.noticeCard}>
            <MiniBloop />
            <Text style={s.noticeText}>{notice}</Text>
          </View>

          <View style={s.packageCard}>
            <LinearGradient
              colors={["#F2EBFE", "#F8E5F1", "#FFE9DD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.packageTop}>
              <View>
                <Text style={s.packageEyebrow}>Premium package</Text>
                <Text style={s.packageTitle}>Soul Care Preview</Text>
              </View>
              <View style={s.lockPill}>
                <MaterialCommunityIcons name="lock-outline" size={14} color={C.gold} />
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
                  <MaterialCommunityIcons name="check-circle-outline" size={14} color={C.lavender} />
                  <Text style={s.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Premium features</Text>
            <Text style={s.sectionSub}>Shown first so users know what they are exploring.</Text>
          </View>

          <View style={s.featureList}>
            {premiumFeatures.map((feature) => (
              <Pressable
                key={feature.title}
                onPress={() => reply(`${feature.title} is still locked, bestie. Sneak peek only for now.`)}
                style={({ pressed }) => [s.featureRow, pressed && s.pressed]}
              >
                <View style={[s.featureIcon, { backgroundColor: `${feature.color}18` }]}>
                  <MaterialCommunityIcons name={feature.icon} size={23} color={feature.color} />
                </View>
                <View style={s.featureCopy}>
                  <Text style={s.featureTitle}>{feature.title}</Text>
                  <Text style={s.featureSub}>{feature.subtitle}</Text>
                </View>
                <MaterialCommunityIcons name="lock-outline" size={17} color={C.gold} />
              </Pressable>
            ))}
          </View>

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

          <Pressable
            onPress={() => reply("Soul Premium is locked rn. You are on the soft-launch watchlist vibe.")}
            style={({ pressed }) => [s.primaryCta, pressed && s.pressed]}
          >
            <LinearGradient colors={[C.peach, C.coral]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.primaryCtaGradient}>
              <MaterialCommunityIcons name="lock-outline" size={18} color="#FFFFFF" />
              <Text style={s.primaryCtaText}>Preview locked package</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => reply("No worries. We will keep this calm, private, and zero-pressure.")}
            style={({ pressed }) => [s.secondaryCta, pressed && s.pressed]}
          >
            <Text style={s.secondaryCtaText}>Ask Bloop what this means</Text>
          </Pressable>

          <View style={{ height: 34 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MiniBloop() {
  return (
    <View style={s.bloopMini}>
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

const glassShadow = {
  shadowColor: C.shadow,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.24,
  shadowRadius: 24,
  elevation: 3,
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    gap: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 54,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: "rgba(255,255,255,0.80)",
    borderRadius: 23,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
    ...glassShadow,
  },
  headerCopy: { flex: 1 },
  title: {
    color: C.ink,
    fontFamily: F.luxuryExtraBold,
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    color: C.muted,
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  headerSpacer: { width: 46 },
  noticeCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "rgba(255,255,255,0.78)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
    ...glassShadow,
  },
  bloopMini: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  noticeText: {
    color: C.ink,
    flex: 1,
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    lineHeight: 19,
  },
  packageCard: {
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 30,
    borderWidth: 1,
    gap: 14,
    minHeight: 256,
    overflow: "hidden",
    padding: 18,
    ...glassShadow,
  },
  packageTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  packageEyebrow: {
    color: C.lavender,
    fontFamily: F.uiBlack,
    fontSize: 10,
    letterSpacing: 1,
    lineHeight: 14,
    textTransform: "uppercase",
  },
  packageTitle: {
    color: C.ink,
    fontFamily: F.luxuryBold,
    fontSize: 25,
    lineHeight: 31,
  },
  lockPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.52)",
    borderColor: "rgba(255,255,255,0.78)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lockPillText: {
    color: C.gold,
    fontFamily: F.uiBlack,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  packageCopy: {
    color: C.ink,
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.78,
  },
  priceBox: {
    backgroundColor: "rgba(255,255,255,0.54)",
    borderColor: "rgba(255,255,255,0.78)",
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  priceLabel: {
    color: C.muted,
    fontFamily: F.uiBold,
    fontSize: 11,
    lineHeight: 15,
  },
  priceValue: {
    color: C.ink,
    fontFamily: F.luxuryBold,
    fontSize: 22,
    lineHeight: 28,
    marginTop: 2,
  },
  priceSub: {
    color: C.muted,
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
    backgroundColor: "rgba(255,255,255,0.48)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  perkText: {
    color: C.ink,
    fontFamily: F.uiBold,
    fontSize: 10.5,
    lineHeight: 14,
  },
  sectionHeader: { gap: 2, paddingTop: 4 },
  sectionTitle: {
    color: C.ink,
    fontFamily: F.luxuryBold,
    fontSize: 22,
    lineHeight: 28,
  },
  sectionSub: {
    color: C.muted,
    fontFamily: F.uiSemiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  featureList: { gap: 10 },
  featureRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.76)",
    borderColor: "rgba(255,255,255,0.76)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 82,
    padding: 13,
    ...glassShadow,
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
    color: C.ink,
    fontFamily: F.uiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  featureSub: {
    color: C.muted,
    fontFamily: F.uiSemiBold,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  billingCard: {
    backgroundColor: "rgba(255,255,255,0.66)",
    borderColor: "rgba(255,255,255,0.76)",
    borderRadius: 26,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    ...glassShadow,
  },
  billingTitle: {
    color: C.ink,
    fontFamily: F.uiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  toggle: {
    backgroundColor: "rgba(255,255,255,0.50)",
    borderColor: "rgba(125,115,130,0.10)",
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
    backgroundColor: "rgba(255,255,255,0.90)",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  toggleText: {
    color: "#8F899C",
    fontFamily: F.uiBold,
    fontSize: 14,
  },
  toggleTextActive: { color: C.ink },
  billingNote: {
    color: C.muted,
    fontFamily: F.uiSemiBold,
    fontSize: 11,
    lineHeight: 16,
  },
  primaryCta: {
    borderRadius: 999,
    minHeight: 54,
    overflow: "hidden",
    shadowColor: "#E07A5F",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 22,
  },
  primaryCtaGradient: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontFamily: F.uiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  secondaryCta: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.62)",
    borderColor: "rgba(255,255,255,0.78)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryCtaText: {
    color: C.lavender,
    fontFamily: F.uiBold,
    fontSize: 14,
  },
  pressed: { transform: [{ scale: 0.97 }] },
});
