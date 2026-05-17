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
import { useHaptics } from "../../hooks/useHaptics";
import { useOnboardingStore } from "../../store/onboardingStore";

const { width: W, height: H } = Dimensions.get("window");
const SIDE_PAD     = 20;
const CARD_GAP     = 10;
const TRUST_CARD_W = (W - SIDE_PAD * 2 - CARD_GAP * 2) / 3;
const HERO_H       = Math.round(H * 0.40);
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
const VAULT_W    = 148;
const VAULT_H    = 148;
const VAULT_LEFT = (CONTAINER_W - VAULT_W) / 2;
const VAULT_TOP  = Math.round(HERO_H * 0.13);

const SHIELD_W    = 48;
const SHIELD_LEFT = (CONTAINER_W - SHIELD_W) / 2;

const FP_W    = 34;
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
  const haptics             = useHaptics();
  const acceptPrivacyConsent = useOnboardingStore((s) => s.acceptPrivacyConsent);

  // All toggles pre-enabled — user sees everything is ON for their protection
  const [toggles, setToggles] = useState({ health: true, ai: true, emotional: true });

  const flip = (key: keyof typeof toggles) => {
    haptics.selection();
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    haptics.success();
    acceptPrivacyConsent();
    router.push("/(onboarding)/health-setup");
  };

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>

      {/* ── Ambient background (same gradient as screen 1) ── */}
      <LinearGradient
        colors={["#FCE0D0", "#F5DCF0", "#E8DFF8", "#FAECD4"]}
        locations={[0, 0.30, 0.64, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.blob1} pointerEvents="none" />
      <View style={s.blob2} pointerEvents="none" />
      <View style={s.blob3} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>

        <View style={s.headerCenter}>
          <Text style={s.logoText}>MyStree Soul</Text>
          <Text style={s.logoSub}>Private. Safe. Yours.</Text>
        </View>

        <Pressable
          style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
          accessibilityLabel="Wellness settings"
        >
          <MaterialCommunityIcons name="flower-outline" size={20} color={C.muted} />
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
        <View style={s.encryptedWrap}>
          <View style={s.encryptedBadge}>
            <MaterialCommunityIcons name="lock-outline" size={14} color={C.gold} />
            <Text style={s.encryptedLabel}>Encrypted</Text>
          </View>
        </View>

        {/* ── Main headline ── */}
        <View style={s.headlineWrap}>
          <Text style={s.headline}>Your wellness{"\n"}stays with you.</Text>
          <Text style={s.headlineSub}>Protected with care.</Text>
        </View>

        {/* ── Trust cards (3-column) ── */}
        <View style={s.trustRow}>
          <TrustCard
            icon="shield-lock-outline"
            iconColor={C.terracotta}
            bg={["#FDEEE6", "#FFF6F2"]}
            label="Private"
          />
          <TrustCard
            icon="heart-pulse"
            iconColor={C.rose}
            bg={["#FDDDE6", "#FFF0F4"]}
            label={"Doctor\nguided"}
          />
          <TrustCard
            icon="head-heart-outline"
            iconColor={C.lavender}
            bg={["#EDE8F8", "#F6F2FB"]}
            label={"Emotionally\naware"}
            image={bloopCalm}
          />
        </View>

        {/* ── Toggle consent section ── */}
        <View style={s.toggleCard}>
          <ToggleRow
            icon="shield-check-outline"
            iconColor={C.terracotta}
            iconBg="rgba(224,122,95,0.14)"
            label="Health data protection"
            value={toggles.health}
            onToggle={() => flip("health")}
          />
          <View style={s.toggleDivider} />
          <ToggleRow
            icon="brain"
            iconColor={C.lavender}
            iconBg="rgba(146,119,200,0.14)"
            label="AI wellness guidance"
            value={toggles.ai}
            onToggle={() => flip("ai")}
          />
          <View style={s.toggleDivider} />
          <ToggleRow
            icon="meditation"
            iconColor={C.sage}
            iconBg="rgba(94,155,107,0.14)"
            label="Emotional wellness support"
            value={toggles.emotional}
            onToggle={() => flip("emotional")}
          />
        </View>

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
            <Text style={s.ctaLabel}>I Feel Safe</Text>
          </LinearGradient>
        </Pressable>

        <Text style={s.ctaSub}>You're always in control.</Text>

        {/* Page dots — 6 total, 2nd active */}
        <View style={s.dotsRow}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[s.dot, i === 1 && s.dotActive]} />
          ))}
        </View>
      </View>

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
                { transform: [{ rotate: `${deg}deg` }, { translateY: -42 }] },
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
  icon, iconColor, iconBg, label, value, onToggle,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  iconBg: string;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  // Smooth thumb slide
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 220,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const thumbX   = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const trackBg  = anim.interpolate({ inputRange: [0, 1], outputRange: ["#E4D4CC", "#E07A5F"] });

  return (
    <View style={s.toggleRow}>
      {/* Icon */}
      <View style={[s.toggleIconBubble, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      {/* Label */}
      <Text style={s.toggleLabel}>{label}</Text>
      {/* Custom toggle switch */}
      <Pressable onPress={onToggle} hitSlop={10} accessibilityRole="switch" accessibilityState={{ checked: value }}>
        <Animated.View style={[s.trackOuter, { backgroundColor: trackBg }]}>
          <Animated.View style={[s.trackThumb, { transform: [{ translateX: thumbX }] }]} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Styles ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  screen: { flex: 1, overflow: "hidden" },

  // ── Ambient blobs (same as screen 1) ──────────────────────────────────────
  blob1: {
    position: "absolute", top: -100, left: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(252,195,175,0.38)",
  },
  blob2: {
    position: "absolute", top: 160, right: -110,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(189,172,255,0.26)",
  },
  blob3: {
    position: "absolute", bottom: 60, left: -70,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(244,162,97,0.16)",
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
    backgroundColor: "rgba(255,255,255,0.68)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.88)",
    shadowColor: C.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 10, elevation: 2,
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
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.16)",
  },
  dialRing3: {
    position: "absolute",
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.22)",
  },
  dialRing2: {
    position: "absolute",
    width: 66, height: 66, borderRadius: 33,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.28)",
  },
  dialRing1: {
    position: "absolute",
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.36)",
  },
  dialTick: {
    position: "absolute",
    width: 2, height: 8, borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  keyholeOuter: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(30,10,0,0.25)",
    alignItems: "center", justifyContent: "center",
    zIndex: 1,
  },
  vaultGlowBase: {
    position: "absolute",
    bottom: -12,
    left: (VAULT_W - 120) / 2,
    width: 120, height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(200,100,60,0.22)",
  },

  // Platform
  platform: {
    position: "absolute",
    left: (CONTAINER_W - 200) / 2,
    bottom: 28,
    width: 200, height: 22,
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
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 10, elevation: 3,
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
    marginTop: 10,
    marginBottom: 22,
  },
  headline: {
    fontFamily: F.luxuryBold,              // PlayfairDisplay Bold — hero statement
    fontSize: 34,
    lineHeight: 42,
    color: C.text,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  headlineSub: {
    fontFamily: F.uiMedium,                // Nunito Medium
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
  },

  // ── Trust cards ───────────────────────────────────────────────────────────
  trustRow: {
    flexDirection: "row",
    paddingHorizontal: SIDE_PAD,
    gap: CARD_GAP,
    marginBottom: 20,
  },
  trustCard: {
    width: TRUST_CARD_W,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.80)",
    shadowColor: "#9E7080",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09, shadowRadius: 14, elevation: 3,
  },
  trustCardGrad: {
    padding: 12,
    minHeight: 140,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  trustIconBubble: {
    width: TRUST_CARD_W - 24,
    height: TRUST_CARD_W - 24,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  trustCardImg: {
    width: (TRUST_CARD_W - 24) * 0.85,
    height: (TRUST_CARD_W - 24) * 0.85,
  },
  trustCardLabel: {
    fontFamily: F.uiBold,                  // Nunito Bold — card label
    fontSize: 12,
    lineHeight: 17,
    color: C.text,
    textAlign: "center",
  },

  // ── Toggle section ────────────────────────────────────────────────────────
  toggleCard: {
    marginHorizontal: SIDE_PAD,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    shadowColor: "#9E7080",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 3,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: "rgba(200,170,160,0.20)",
    marginHorizontal: 16,
  },
  toggleIconBubble: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  toggleLabel: {
    fontFamily: F.uiMedium,                // Nunito Medium — toggle label
    fontSize: 13,
    color: C.text,
    flex: 1,
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
    backgroundColor: "rgba(251,240,230,0.90)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.72)",
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

  // ── Shared ────────────────────────────────────────────────────────────────
  pressed: { transform: [{ scale: 0.97 }] },
});
