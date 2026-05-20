import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { getNeedCombination } from "../../constants/onboardingAdaptation";
import { useHaptics } from "../../hooks/useHaptics";
import { useSafeBack } from "../../hooks/useSafeBack";
import { useOnboardingStore } from "../../store/onboardingStore";

const { width: W, height: H } = Dimensions.get("window");
const SIDE_PAD     = 20;
const CARD_GAP     = 10;
const TRUST_CARD_W = (W - SIDE_PAD * 2 - CARD_GAP * 2) / 3;
const HERO_H       = Math.round(H * 0.24);
const CONTAINER_W  = W - SIDE_PAD * 2;

// ── Assets ────────────────────────────────────────────────────────────────────
const bloopPrivate = require("../../public/images/bloop-learning-private.webp");
const bloopCalm    = require("../../public/images/bloop-calm.webp");

// ── Palette (matches screen 1) ────────────────────────────────────────────────
const C = {
  text:       "#2C1A14",
  muted:      "#9A7A70",
  faint:      "#C4A99E",
  terracotta: "#E07A5F",
  peach:      "#F4A261",
  sage:       "#5E9B6B",
  lavender:   "#9277C8",
  rose:       "#E05875",
  gold:       "#C9A96E",
  white:      "#FFFFFF",
} as const;

// ── Vault illustration dimensions (computed once) ─────────────────────────────
const VAULT_W    = 112;
const VAULT_H    = 112;
const VAULT_LEFT = (CONTAINER_W - VAULT_W) / 2;
const VAULT_TOP  = Math.round(HERO_H * 0.13);

const SHIELD_W    = 40;
const SHIELD_LEFT = (CONTAINER_W - SHIELD_W) / 2;

const FP_W    = 28;
const FP_LEFT = (CONTAINER_W - FP_W) / 2;

// ── Sparkle positions inside hero ─────────────────────────────────────────────
const SPARKLE_POS = [
  { top: Math.round(HERO_H * 0.10), left: Math.round(CONTAINER_W * 0.12) },
  { top: Math.round(HERO_H * 0.08), left: Math.round(CONTAINER_W * 0.72) },
  { top: Math.round(HERO_H * 0.55), left: Math.round(CONTAINER_W * 0.82) },
  { top: Math.round(HERO_H * 0.62), left: Math.round(CONTAINER_W * 0.06) },
  { top: Math.round(HERO_H * 0.25), left: Math.round(CONTAINER_W * 0.42) },
] as const;
const SPARKLE_COLORS = ["#F4B86E", "#E05875", "#C9A96E", "#BDB2FF", "#E07A5F"] as const;

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PrivacyConsentScreen() {
  const router              = useRouter();
  const safeBack            = useSafeBack("/(onboarding)/onboarding");
  const haptics             = useHaptics();
  const acceptPrivacyConsent = useOnboardingStore((s) => s.acceptPrivacyConsent);
  const selectedGoals        = useOnboardingStore((s) => s.selectedGoals);
  const journeyId            = getNeedCombination(selectedGoals);

  const hasCycle = journeyId === "cycle" || journeyId === "self_love_cycle" || journeyId === "goal_setting_cycle" || journeyId === "whole_rhythm";
  const hasGoal  = journeyId === "goal_setting" || journeyId === "self_love_goal_setting" || journeyId === "goal_setting_cycle" || journeyId === "whole_rhythm";

  const headlineSub = hasCycle
    ? "Your cycle and health data stay private."
    : hasGoal
    ? "Your goals and habits are yours alone."
    : "You choose what to share.";

  const emotionalToggleLabel = hasGoal && !hasCycle ? "Help me stay on track" : "Support my emotions";

  // privacy = required; ai + emotional = optional, off by default
  const [toggles, setToggles] = useState({ privacy: false, ai: false, emotional: false });
  const [consentError, setConsentError] = useState(false);

  const [privacySheetVisible, setPrivacySheetVisible] = useState(false);
  const privacySheetAnim = useRef(new Animated.Value(0)).current;

  const showPrivacySheet = () => {
    setPrivacySheetVisible(true);
    Animated.timing(privacySheetAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };
  const hidePrivacySheet = () => {
    Animated.timing(privacySheetAnim, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => setPrivacySheetVisible(false));
  };

  const flip = (key: keyof typeof toggles) => {
    haptics.selection();
    setToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "privacy" && !prev.privacy) setConsentError(false);
      return next;
    });
  };

  // ── Screen entrance ────────────────────────────────────────────────────────
  const entranceOp = useRef(new Animated.Value(0)).current;
  const entranceY  = useRef(new Animated.Value(10)).current;
  const cardsOp    = useRef(new Animated.Value(0)).current;
  const cardsY     = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOp, { toValue: 1, duration: 580, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(entranceY,  { toValue: 0, duration: 580, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(cardsOp, { toValue: 1, duration: 500, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardsY,  { toValue: 0, duration: 500, delay: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleContinue = () => {
    if (!toggles.privacy) {
      setConsentError(true);
      return;
    }
    haptics.success();
    acceptPrivacyConsent();
    router.push("/(onboarding)/health-setup");
  };

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>

      {/* Ambient blobs — atmosphere only */}
      <View style={s.blob1} pointerEvents="none" />
      <View style={s.blob2} pointerEvents="none" />
      <View style={s.blob3} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={safeBack}
          style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>

        <View style={s.headerCenter}>
          <Text style={s.logoText}>MyStree Soul</Text>
          <Text style={s.logoSub}>Your secrets are safe here.</Text>
        </View>

        <Pressable
          onPress={showPrivacySheet}
          style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
          accessibilityLabel="How we protect your data"
        >
          <MaterialCommunityIcons name="help-circle-outline" size={20} color={C.muted} />
        </Pressable>
      </View>

      {/* ── Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={s.scroll}
      >

        {/* ── Vault hero illustration ── */}
        <VaultHero />

        {/* ── "Encrypted" badge ── */}
        <Animated.View style={{ opacity: entranceOp, transform: [{ translateY: entranceY }] }}>
          <View style={s.encryptedWrap}>
            <View style={s.encryptedBadge}>
              <MaterialCommunityIcons name="lock-outline" size={14} color={C.gold} />
              <Text style={s.encryptedLabel}>Safe space</Text>
            </View>
          </View>

          {/* ── Main headline ── */}
          <View style={s.headlineWrap}>
            <Text style={s.headline}>Hey No worries.{"\n"}Your secrets are safe with us!</Text>
            <Text style={s.headlineSub}>{headlineSub}</Text>
          </View>
        </Animated.View>

        {/* ── Trust cards (3-column) ── */}
        <Animated.View style={[{ opacity: cardsOp, transform: [{ translateY: cardsY }] }, { alignSelf: "stretch" }]}>
        <View style={s.trustRow}>
          <TrustCard
            icon="shield-lock-outline"
            iconColor={C.terracotta}
            bg={["#FDEEE6", "#FFF6F2"]}
            label="Secrets safe"
          />
          <TrustCard
            icon="heart-pulse"
            iconColor={C.rose}
            bg={["#FDDDE6", "#FFF0F4"]}
            label={"Bloop\nhas you"}
          />
          <TrustCard
            icon="head-heart-outline"
            iconColor={C.lavender}
            bg={["#EDE8F8", "#F6F2FB"]}
            label={"Not\nalone"}
            image={bloopCalm}
          />
        </View>

        {/* ── Toggle consent section ── */}
        <View style={s.toggleCard}>
          <ToggleRow
            icon="shield-check-outline"
            iconColor={C.terracotta}
            iconBg="rgba(224,122,95,0.14)"
            label="I agree to the MyStree Soul Privacy Policy."
            value={toggles.privacy}
            onToggle={() => flip("privacy")}
            required
          />
          <View style={s.toggleDivider} />
          <ToggleRow
            icon="brain"
            iconColor={C.lavender}
            iconBg="rgba(146,119,200,0.14)"
            label="Let Bloop personalize guidance using my wellness answers."
            value={toggles.ai}
            onToggle={() => flip("ai")}
          />
          <View style={s.toggleDivider} />
          <ToggleRow
            icon="meditation"
            iconColor={C.sage}
            iconBg="rgba(94,155,107,0.14)"
            label={emotionalToggleLabel}
            value={toggles.emotional}
            onToggle={() => flip("emotional")}
          />
        </View>

        {/* Consent validation feedback */}
        {consentError && (
          <Text style={s.consentError}>
            Please review and accept the required privacy consent to continue.
          </Text>
        )}

        </Animated.View>

        {/* Bottom spacer for CTA */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ── Floating CTA ── */}
      <View style={s.ctaBar}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [s.ctaShell, pressed && s.pressed]}
        >
          <LinearGradient
            colors={[C.peach, C.terracotta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.ctaGrad}
          >
            <MaterialCommunityIcons name="shield-check" size={22} color="#FFF" />
            <Text style={s.ctaLabel}>Continue safely</Text>
          </LinearGradient>
        </Pressable>

        <Text style={s.ctaSub}>You can change this later.</Text>

        {/* Page dots — 6 total, 2nd active */}
        <View style={s.dotsRow}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[s.dot, i === 1 && s.dotActive]} />
          ))}
        </View>
      </View>

      {/* ── Privacy info sheet ── */}
      {privacySheetVisible && (
        <PrivacySheet sheetAnim={privacySheetAnim} onClose={hidePrivacySheet} />
      )}

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Vault Hero illustration ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function VaultHero() {
  // ── Sparkle twinkle animations ────────────────────────────────────────────
  const sparkles = useRef(
    SPARKLE_POS.map((_, i) => new Animated.Value(0.2 + i * 0.18))
  ).current;

  useEffect(() => {
    sparkles.forEach((val, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 1600 + i * 320, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.1, duration: 1600 + i * 320, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  // ── Vault glow pulse ──────────────────────────────────────────────────────
  const glowPulse = useRef(new Animated.Value(0.28)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.60, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.28, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Bloop left float ──────────────────────────────────────────────────────
  const bloopFloat = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bloopFloat, { toValue: -6, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bloopFloat, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={s.heroArea} pointerEvents="box-none">

      {/* Botanical side shapes */}
      <View style={s.botanicL1} pointerEvents="none" />
      <View style={s.botanicL2} pointerEvents="none" />
      <View style={s.botanicR1} pointerEvents="none" />
      <View style={s.botanicR2} pointerEvents="none" />

      {/* Sparkle dots */}
      {sparkles.map((val, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            s.sparkle,
            { top: SPARKLE_POS[i].top, left: SPARKLE_POS[i].left },
            { opacity: val, backgroundColor: SPARKLE_COLORS[i] },
          ]}
        />
      ))}

      {/* Wide ambient glow behind vault */}
      <Animated.View style={[s.vaultGlowOuter, { opacity: glowPulse }]} pointerEvents="none" />
      <View style={s.vaultGlowInner} pointerEvents="none" />

      {/* Floating shield — top center */}
      <View style={[s.shieldFloat, { left: SHIELD_LEFT }]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.80)", "rgba(252,220,190,0.60)"]}
          style={s.shieldGlass}
        >
          <MaterialCommunityIcons name="shield-lock" size={22} color={C.gold} />
        </LinearGradient>
      </View>

      {/* Left Bloop orb */}
      <Animated.View
        style={[
          s.leftOrb,
          { transform: [{ translateY: bloopFloat }] },
        ]}
      >
        <View style={s.leftOrbAura} />
        <CachedImage source={bloopPrivate} style={s.leftOrbImg} contentFit="contain" />
      </Animated.View>

      {/* Right lock orb */}
      <View style={s.rightOrb}>
        <LinearGradient
          colors={["rgba(189,172,255,0.30)", "rgba(146,119,200,0.20)"]}
          style={s.rightOrbGlass}
        >
          <MaterialCommunityIcons name="lock" size={22} color={C.lavender} />
        </LinearGradient>
        <View style={s.rightOrbAura} />
      </View>

      {/* Main Vault body — center */}
      <View style={[s.vault, { left: VAULT_LEFT, top: VAULT_TOP }]}>
        <LinearGradient
          colors={["#F5C9B4", "#E8A88C", "#D4886C"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={s.vaultBody}
        >
          {/* Combination lock dial rings */}
          <View style={s.dialRing4} />
          <View style={s.dialRing3} />
          <View style={s.dialRing2} />
          <View style={s.dialRing1} />
          {/* Tick marks — 8 short lines via rotation */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <View
              key={deg}
              pointerEvents="none"
              style={[
                s.dialTick,
                { transform: [{ rotate: `${deg}deg` }, { translateY: -32 }] },
              ]}
            />
          ))}
          {/* Central keyhole */}
          <View style={s.keyholeOuter}>
            <MaterialCommunityIcons name="lock" size={24} color={C.gold} />
          </View>
        </LinearGradient>
        {/* Vault glow shadow */}
        <View style={s.vaultGlowBase} />
      </View>

      {/* Platform / pedestal */}
      <View style={s.platform} />

      {/* Fingerprint icon — decorative, on platform */}
      <View style={[s.fingerprintWrap, { left: FP_LEFT }]}>
        <Animated.View style={{ opacity: glowPulse }}>
          <View style={s.fingerprintGlow} />
        </Animated.View>
        <MaterialCommunityIcons name="fingerprint" size={FP_W} color={C.terracotta} />
      </View>

    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── TrustCard ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function TrustCard({
  icon,
  iconColor,
  bg,
  label,
  image,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  bg: readonly [string, string];
  label: string;
  image?: ReturnType<typeof require>;
}) {
  return (
    <View style={s.trustCard}>
      <LinearGradient colors={bg} style={s.trustCardGrad}>
        {/* Icon illustration area */}
        <View style={[s.trustIconBubble, { backgroundColor: bg[0] }]}>
          {image != null ? (
            <CachedImage source={image} style={s.trustCardImg} contentFit="contain" />
          ) : (
            <MaterialCommunityIcons name={icon} size={42} color={iconColor} />
          )}
        </View>
        {/* Label */}
        <Text style={s.trustCardLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── ToggleRow ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function ToggleRow({
  icon, iconColor, iconBg, label, value, onToggle, required,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  iconBg: string;
  label: string;
  value: boolean;
  onToggle: () => void;
  required?: boolean;
}) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 220,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const thumbX  = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const trackBg = anim.interpolate({ inputRange: [0, 1], outputRange: ["#E4D4CC", "#E07A5F"] });

  return (
    <View style={s.toggleRow}>
      <View style={[s.toggleIconBubble, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={s.toggleLabelArea}>
        <Text style={s.toggleLabel}>{label}</Text>
        {required && (
          <View style={s.requiredPill}>
            <Text style={s.requiredPillText}>Required</Text>
          </View>
        )}
        {!required && (
          <View style={s.optionalPill}>
            <Text style={s.optionalPillText}>Optional</Text>
          </View>
        )}
      </View>
      <Pressable onPress={onToggle} hitSlop={10} accessibilityRole="switch" accessibilityState={{ checked: value }}>
        <Animated.View style={[s.trackOuter, { backgroundColor: trackBg }]}>
          <Animated.View style={[s.trackThumb, { transform: [{ translateX: thumbX }] }]} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PrivacySheet — explains how data is protected ─────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function PrivacySheet({
  sheetAnim,
  onClose,
}: {
  sheetAnim: Animated.Value;
  onClose: () => void;
}) {
  const translateY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });
  const overlayOp  = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] });

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000", opacity: overlayOp }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Dismiss" />
      </Animated.View>

      <Animated.View style={[s.privacySheet, { transform: [{ translateY }] }]}>
        <View style={s.sheetHandle} />
        <View style={s.sheetIconBubble}>
          <MaterialCommunityIcons name="shield-check" size={28} color={C.terracotta} />
        </View>
        <Text style={s.sheetTitle}>How we protect your data</Text>

        <View style={s.sheetPoints}>
          {[
            { icon: "lock-outline" as const,           text: "Your health data is encrypted and never sold." },
            { icon: "eye-off-outline" as const,         text: "Only you can see your entries." },
            { icon: "robot-happy-outline" as const,     text: "Bloop's guidance runs privately and doesn't leave your account." },
            { icon: "account-cancel-outline" as const,  text: "You can delete everything, any time." },
          ].map(({ icon, text }) => (
            <View key={text} style={s.sheetPoint}>
              <MaterialCommunityIcons name={icon} size={18} color={C.terracotta} />
              <Text style={s.sheetPointText}>{text}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [s.sheetCloseBtn, pressed && s.pressed]}
        >
          <LinearGradient
            colors={[C.peach, C.terracotta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.sheetCloseBtnGrad}
          >
            <Text style={s.sheetCloseBtnText}>Got it</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Styles ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  screen: { flex: 1, overflow: "hidden", backgroundColor: "#FFFFFF" },

  // ── Ambient blobs — atmosphere only, 8-10% opacity ─────────────────────────
  blob1: {
    position: "absolute", top: -120, left: -100,
    width: 360, height: 360, borderRadius: 180,
    backgroundColor: "rgba(255,183,183,0.10)",
  },
  blob2: {
    position: "absolute", top: 200, right: -140,
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: "rgba(189,172,255,0.08)",
  },
  blob3: {
    position: "absolute", bottom: 40, left: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: "rgba(162,202,178,0.08)",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  logoText: {
    fontFamily: F.luxuryBold,              // PlayfairDisplay Bold
    fontSize: 20,
    lineHeight: 26,
    color: C.text,
    letterSpacing: 0.2,
  },
  logoSub: {
    fontFamily: F.uiMedium,                // Nunito Medium
    fontSize: 11,
    color: C.muted,
    letterSpacing: 0.4,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(248,244,248,0.96)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(232,225,230,0.70)",
    shadowColor: C.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 2,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: { paddingBottom: 20 },

  // ── Hero illustration area ────────────────────────────────────────────────
  heroArea: {
    width: W - SIDE_PAD * 2,
    height: HERO_H,
    marginHorizontal: SIDE_PAD,
    position: "relative",
  },

  // Botanical shapes
  botanicL1: {
    position: "absolute",
    left: -32, top: HERO_H * 0.10,
    width: 90, height: 150,
    borderRadius: 45,
    backgroundColor: "rgba(129,178,154,0.14)",
    transform: [{ rotate: "22deg" }],
  },
  botanicL2: {
    position: "absolute",
    left: 8, top: HERO_H * 0.38,
    width: 60, height: 100,
    borderRadius: 30,
    backgroundColor: "rgba(189,178,255,0.10)",
    transform: [{ rotate: "38deg" }],
  },
  botanicR1: {
    position: "absolute",
    right: -28, top: HERO_H * 0.08,
    width: 85, height: 140,
    borderRadius: 42,
    backgroundColor: "rgba(244,162,97,0.12)",
    transform: [{ rotate: "-22deg" }],
  },
  botanicR2: {
    position: "absolute",
    right: 6, bottom: HERO_H * 0.10,
    width: 55, height: 90,
    borderRadius: 28,
    backgroundColor: "rgba(224,122,95,0.09)",
    transform: [{ rotate: "-40deg" }],
  },

  // Sparkle dot
  sparkle: {
    position: "absolute",
    width: 6, height: 6, borderRadius: 3,
  },

  // Vault ambient glow
  vaultGlowOuter: {
    position: "absolute",
    left: (CONTAINER_W - 260) / 2,
    top: VAULT_TOP - 20,
    width: 260, height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(244,162,97,0.22)",
  },
  vaultGlowInner: {
    position: "absolute",
    left: (CONTAINER_W - 180) / 2,
    top: VAULT_TOP - 6,
    width: 180, height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(252,195,175,0.18)",
  },

  // Shield floating top center
  shieldFloat: {
    position: "absolute",
    top: 6,
    width: SHIELD_W, height: SHIELD_W,
    zIndex: 3,
  },
  shieldGlass: {
    flex: 1, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.72)",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20, shadowRadius: 12, elevation: 4,
  },

  // Left Bloop orb
  leftOrb: {
    position: "absolute",
    left: 4,
    top: VAULT_TOP + 20,
    width: 88, height: 88,
    zIndex: 2,
  },
  leftOrbAura: {
    position: "absolute",
    top: -8, left: -8,
    width: 104, height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(189,172,255,0.20)",
  },
  leftOrbImg: {
    width: 88, height: 88,
  },

  // Right lock orb
  rightOrb: {
    position: "absolute",
    right: 4,
    top: VAULT_TOP + 28,
    width: 76, height: 76,
    zIndex: 2,
  },
  rightOrbGlass: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(189,172,255,0.34)",
    shadowColor: C.lavender,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 3,
  },
  rightOrbAura: {
    position: "absolute",
    top: -10, left: -10,
    width: 96, height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(146,119,200,0.12)",
  },

  // Vault body
  vault: {
    position: "absolute",
    width: VAULT_W, height: VAULT_H,
    zIndex: 2,
  },
  vaultBody: {
    width: VAULT_W, height: VAULT_H,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C07050",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 10,
    overflow: "hidden",
  },
  // Concentric combination dial rings
  dialRing4: {
    position: "absolute",
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.16)",
  },
  dialRing3: {
    position: "absolute",
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.22)",
  },
  dialRing2: {
    position: "absolute",
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.28)",
  },
  dialRing1: {
    position: "absolute",
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.36)",
  },
  dialTick: {
    position: "absolute",
    width: 2, height: 6, borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  keyholeOuter: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(30,10,0,0.25)",
    alignItems: "center", justifyContent: "center",
    zIndex: 1,
  },
  vaultGlowBase: {
    position: "absolute",
    bottom: -10,
    left: (VAULT_W - 92) / 2,
    width: 92, height: 16,
    borderRadius: 10,
    backgroundColor: "rgba(200,100,60,0.22)",
  },

  // Platform
  platform: {
    position: "absolute",
    left: (CONTAINER_W - 160) / 2,
    bottom: 20,
    width: 160, height: 18,
    borderRadius: 11,
    backgroundColor: "rgba(220,170,140,0.35)",
  },

  // Fingerprint
  fingerprintWrap: {
    position: "absolute",
    bottom: 12,
    width: FP_W,
    alignItems: "center", justifyContent: "center",
    zIndex: 3,
  },
  fingerprintGlow: {
    position: "absolute",
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(224,122,95,0.24)",
  },

  // ── "Encrypted" badge ─────────────────────────────────────────────────────
  encryptedWrap: {
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
  },
  encryptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(248,244,248,0.98)",
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 10, elevation: 3,
  },
  encryptedLabel: {
    fontFamily: F.uiSemiBold,              // Nunito SemiBold
    fontSize: 12,
    color: C.gold,
    letterSpacing: 0.4,
  },

  // ── Headline ──────────────────────────────────────────────────────────────
  headlineWrap: {
    paddingHorizontal: SIDE_PAD,
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginBottom: 12,
  },
  headline: {
    fontFamily: F.luxuryBold,              // PlayfairDisplay Bold — hero statement
    fontSize: 26,
    lineHeight: 32,
    color: C.text,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  headlineSub: {
    fontFamily: F.uiMedium,                // Nunito Medium
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
  },

  // ── Trust cards ───────────────────────────────────────────────────────────
  trustRow: {
    flexDirection: "row",
    paddingHorizontal: SIDE_PAD,
    gap: CARD_GAP,
    marginBottom: 12,
  },
  trustCard: {
    width: TRUST_CARD_W,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    shadowColor: "#9E7080",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09, shadowRadius: 14, elevation: 3,
  },
  trustCardGrad: {
    padding: 10,
    minHeight: 108,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  trustIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  trustCardImg: {
    width: 46,
    height: 46,
  },
  trustCardLabel: {
    fontFamily: F.uiBold,                  // Nunito Bold — card label
    fontSize: 10.5,
    lineHeight: 14,
    color: C.text,
    textAlign: "center",
  },

  // ── Toggle section ────────────────────────────────────────────────────────
  toggleCard: {
    marginHorizontal: SIDE_PAD,
    backgroundColor: "rgba(250,247,250,0.98)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    shadowColor: "#9E7080",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07, shadowRadius: 20, elevation: 3,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: "rgba(200,170,160,0.20)",
    marginHorizontal: 16,
  },
  toggleIconBubble: {
    width: 34, height: 34, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  toggleLabel: {
    fontFamily: F.uiMedium,
    fontSize: 12.5,
    color: C.text,
    lineHeight: 18,
  },

  // Custom toggle switch
  trackOuter: {
    width: 48, height: 28, borderRadius: 14,
    justifyContent: "center",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20, shadowRadius: 8, elevation: 3,
  },
  trackThumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 3,
  },

  // ── Floating CTA ──────────────────────────────────────────────────────────
  ctaBar: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: SIDE_PAD,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(232,225,230,0.60)",
  },
  ctaShell: {
    width: "100%",
    borderRadius: 999,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28, shadowRadius: 22, elevation: 8,
  },
  ctaGrad: {
    height: 58, borderRadius: 999,
    flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    gap: 10,
  },
  ctaLabel: {
    fontFamily: F.uiBlack,                 // Nunito Black — CTA
    color: "#FFFFFF",
    fontSize: 16,
    letterSpacing: 0.4,
  },
  ctaSub: {
    fontFamily: F.uiRegular,               // Nunito Regular — reassurance
    fontSize: 12,
    color: C.muted,
  },

  // ── Page dots ─────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "rgba(224,122,95,0.28)",
  },
  dotActive: {
    width: 26, height: 8, borderRadius: 4,
    backgroundColor: C.terracotta,
  },

  // ── Toggle label area ─────────────────────────────────────────────────────
  toggleLabelArea: {
    flex: 1,
    gap: 4,
  },
  requiredPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(224,122,95,0.14)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.30)",
  },
  requiredPillText: {
    fontFamily: F.uiBold,
    fontSize: 9,
    color: C.terracotta,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  optionalPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(200,190,210,0.12)",
    borderWidth: 1,
    borderColor: "rgba(200,190,210,0.30)",
  },
  optionalPillText: {
    fontFamily: F.uiBold,
    fontSize: 9,
    color: C.muted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  // ── Consent error ─────────────────────────────────────────────────────────
  consentError: {
    fontFamily: F.uiMedium,
    fontSize: 12.5,
    color: "#C05555",
    textAlign: "center",
    marginHorizontal: SIDE_PAD,
    marginTop: 10,
    lineHeight: 18,
  },

  // ── Privacy info sheet ────────────────────────────────────────────────────
  privacySheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 20,
    zIndex: 100,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.12)",
    marginBottom: 20,
  },
  sheetIconBubble: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(224,122,95,0.12)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.26)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: C.text,
    marginBottom: 16,
    textAlign: "center",
  },
  sheetPoints: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  sheetPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  sheetPointText: {
    flex: 1,
    fontFamily: F.uiRegular,
    fontSize: 13.5,
    color: C.text,
    lineHeight: 20,
  },
  sheetCloseBtn: {
    width: "100%",
    borderRadius: 999,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 6,
  },
  sheetCloseBtnGrad: {
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseBtnText: {
    fontFamily: F.uiBlack,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },

  // ── Shared ────────────────────────────────────────────────────────────────
  pressed: { transform: [{ scale: 0.97 }] },
});
