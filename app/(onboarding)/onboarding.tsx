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
import { normalizeAvailableNeeds } from "../../constants/onboardingAdaptation";
import { useOnboardingStore } from "../../store/onboardingStore";

const { width: W, height: H } = Dimensions.get("window");
const SIDE_PAD = 20;
const CARD_GAP  = 12;
const HALF_W    = (W - SIDE_PAD * 2 - CARD_GAP) / 2;

// ── Assets ────────────────────────────────────────────────────────────────────
const bloopHero  = require("../../public/images/bloop-welcome.webp");
const bloopCycle = require("../../public/images/bloop-cycle.webp");
const bloopCalm  = require("../../public/images/bloop-calm.webp");

// ── Palette ───────────────────────────────────────────────────────────────────
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
  moon:       "#F4B86E",
  white:      "#FFFFFF",
} as const;

// ── Card definitions ──────────────────────────────────────────────────────────
type NeedCard = {
  id:        string;
  label:     string;
  icon:      React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  selBg:     readonly [string, string];  // gradient when selected
  idleBg:    readonly [string, string];  // gradient when idle
  glow:      string;
  locked:    boolean;
  image?:    ReturnType<typeof require>;
};

const NEEDS: NeedCard[] = [
  {
    id:        "self_love",
    label:     "Self-love",
    icon:      "heart",
    iconColor: C.rose,
    selBg:     ["#FDDDE8", "#FBF0F4"],
    idleBg:    ["#FFFCFB", "#FFF8F8"],
    glow:      "#E05875",
    locked:    false,
    image:     bloopCalm,
  },
  {
    id:        "goal_setting",
    label:     "Goal setter",
    icon:      "target",
    iconColor: "#C87040",
    selBg:     ["#FBF0E2", "#FDF8F2"],
    idleBg:    ["#FFFCFB", "#FFFAF7"],
    glow:      "#D4956A",
    locked:    false,
  },
  {
    id:        "nutrition",
    label:     "Balanced",
    icon:      "leaf",
    iconColor: C.sage,
    selBg:     ["#E4F4E8", "#F2FAF4"],
    idleBg:    ["#FFFCFB", "#F8FFF9"],
    glow:      "#5E9B6B",
    locked:    true,
  },
  {
    id:        "inner_harmony",
    label:     "Inner\nHarmony",
    icon:      "meditation",
    iconColor: C.lavender,
    selBg:     ["#EDE8F8", "#F6F2FB"],
    idleBg:    ["#FFFCFB", "#FAF8FF"],
    glow:      "#9277C8",
    locked:    true,
  },
];

// ── Sparkle positions for hero area ──────────────────────────────────────────
const SPARKLE_POS = [
  { top: "20%"  as any, left:  "22%" as any },
  { top: "12%"  as any, right: "24%" as any },
  { bottom: "22%" as any, right: "18%" as any },
  { bottom: "16%" as any, left: "30%" as any },
] as const;

const SPARKLE_COLORS = ["#F4B86E", "#E05875", "#C9A96E", "#BDB2FF"] as const;

// ── Screen ────────────────────────────────────────────────────────────────────
export default function OnboardingGoalsScreen() {
  const router           = useRouter();
  const setSelectedGoals = useOnboardingStore((s) => s.setSelectedGoals);
  const setLifeStage     = useOnboardingStore((s) => s.setLifeStage);

  // "self_love" pre-selected to match the reference visual
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["self_love"]));

  // ── Orb breathing ─────────────────────────────────────────────────────────
  const breathe = useRef(new Animated.Value(1)).current;
  const auraOp  = useRef(new Animated.Value(0.36)).current;
  const floatY  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.ease);
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1.08, duration: 2800, easing: ease, useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 1.00, duration: 2800, easing: ease, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(auraOp, { toValue: 0.72, duration: 2800, easing: ease, useNativeDriver: true }),
          Animated.timing(auraOp, { toValue: 0.30, duration: 2800, easing: ease, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(floatY, { toValue: -8, duration: 3200, easing: ease, useNativeDriver: true }),
          Animated.timing(floatY, { toValue:  0, duration: 3200, easing: ease, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  // ── Sparkle twinkles (staggered) ──────────────────────────────────────────
  const sparkles = useRef(
    SPARKLE_POS.map((_, i) => new Animated.Value(0.15 + i * 0.22))
  ).current;

  useEffect(() => {
    sparkles.forEach((val, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 1700 + i * 250, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.08, duration: 1700 + i * 250, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  // ── Aura ring pulse ───────────────────────────────────────────────────────
  const ringScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.06, duration: 3000, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 1.00, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggle = (id: string) => {
    const card = NEEDS.find((need) => need.id === id);
    if (card?.locked) return;

    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    setSelectedGoals(normalizeAvailableNeeds(Array.from(selected)));
    setLifeStage("cycle_fertility"); // sensible default; overridable in health-setup
    router.push("/(onboarding)/privacy-consent");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>

      {/* ── Ambient background gradient ── */}
      <LinearGradient
        colors={["#FCE0D0", "#F5D8EE", "#E8DFF8", "#FAECD4"]}
        locations={[0, 0.30, 0.64, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient blob accents */}
      <View style={s.blob1} pointerEvents="none" />
      <View style={s.blob2} pointerEvents="none" />
      <View style={s.blob3} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.logoText}>MyStree Soul</Text>
          <Text style={s.logoSub}>Your wellness space</Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
          accessibilityLabel="App settings"
        >
          <MaterialCommunityIcons name="flower-outline" size={20} color={C.muted} />
        </Pressable>
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={s.scroll}
      >

        {/* ── Hero visual ── */}
        <View style={s.heroArea} pointerEvents="box-none">

          {/* Decorative moon — top right */}
          <View style={s.moonWrap} pointerEvents="none">
            <MaterialCommunityIcons name="moon-waning-crescent" size={32} color={C.moon} />
          </View>

          {/* Botanical leaf shapes (pure CSS circles — soft + dimensional) */}
          <View style={s.botanicLeft}  pointerEvents="none" />
          <View style={s.botanicLeft2} pointerEvents="none" />
          <View style={s.botanicRight} pointerEvents="none" />

          {/* Outer aura ring — pulsing */}
          <Animated.View
            style={[s.auraRingOuter, { opacity: auraOp, transform: [{ scale: ringScale }] }]}
            pointerEvents="none"
          />
          {/* Inner aura ring — breathing */}
          <Animated.View
            style={[s.auraRingInner, { opacity: auraOp }]}
            pointerEvents="none"
          />

          {/* Tiny sparkle dots */}
          {sparkles.map((val, i) => (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[
                s.sparkle,
                SPARKLE_POS[i],
                { opacity: val, backgroundColor: SPARKLE_COLORS[i] },
              ]}
            />
          ))}

          {/* Main hero orb — breathing + floating */}
          <Animated.View
            style={{
              transform: [{ scale: breathe }, { translateY: floatY }],
              zIndex: 2,
            }}
          >
            <View style={s.bloopShadow}>
              <CachedImage
                priority="high"
                source={bloopHero}
                style={s.bloopImg}
                contentFit="contain"
              />
            </View>
          </Animated.View>

          {/* Orbit lines — decorative SVG-less rings */}
          <View style={s.orbitRing1} pointerEvents="none" />
          <View style={s.orbitRing2} pointerEvents="none" />
        </View>

        {/* ── Main question ── */}
        <View style={s.questionWrap}>
          <Text style={s.question}>What do you{"\n"}need today?</Text>
          <Text style={s.questionSub}>Self-love, goals, cycle, calm, or clarity.</Text>
        </View>

        {/* ── Card grid ── */}
        <View style={s.grid}>

          {/* Row 1 — Self Love + Goal Setting */}
          <View style={s.cardRow}>
            {NEEDS.slice(0, 2).map((n) => (
              <NeedTile
                key={n.id}
                card={n}
                isSelected={selected.has(n.id)}
                onPress={() => toggle(n.id)}
              />
            ))}
          </View>

          {/* Row 2 — Balanced Nutrition + Inner Harmony (locked) */}
          <View style={s.cardRow}>
            {NEEDS.slice(2, 4).map((n) => (
              <NeedTile
                key={n.id}
                card={n}
                isSelected={selected.has(n.id)}
                onPress={() => toggle(n.id)}
              />
            ))}
          </View>

          {/* Row 3 — Cycle Tracking (full width) */}
          <CycleTile
            isSelected={selected.has("cycle")}
            onPress={() => toggle("cycle")}
          />
        </View>

        {/* Spacer for fixed CTA */}
        <View style={{ height: 130 }} />
      </ScrollView>

      {/* ── Floating bottom CTA ── */}
      <View style={s.ctaArea}>
        <Pressable
          onPress={handleContinue}
          disabled={selected.size === 0}
          style={({ pressed }) => [
            s.ctaShell,
            pressed && s.pressed,
            selected.size === 0 && s.ctaDim,
          ]}
        >
          <LinearGradient
            colors={[C.peach, C.terracotta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.ctaGrad}
          >
            <Text style={s.ctaLabel}>Continue</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" />
          </LinearGradient>
        </Pressable>

        {/* Page indicator — 5 dots, first active */}
        <View style={s.dotsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.dot, i === 0 && s.dotActive]} />
          ))}
        </View>
      </View>

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── NeedTile — half-width selectable card ─────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function NeedTile({
  card,
  isSelected,
  onPress,
}: {
  card: NeedCard;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={card.locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: card.locked, selected: isSelected }}
      style={({ pressed }) => [
        s.tileShell,
        card.locked && s.tileLocked,
        isSelected && {
          borderColor: card.glow,
          shadowColor: card.glow,
          shadowOpacity: 0.24,
          transform: [{ translateY: -3 }],
        },
        pressed && s.pressed,
      ]}
    >
      <LinearGradient
        colors={isSelected ? card.selBg : card.idleBg}
        style={s.tileGrad}
      >

        {/* Badge — top right corner */}
        {isSelected && !card.locked && (
          <View style={[s.tileBadge, { backgroundColor: C.terracotta }]}>
            <Ionicons name="checkmark" size={11} color="#FFF" />
          </View>
        )}
        {card.locked && !isSelected && (
          <View style={[s.tileBadge, { backgroundColor: C.gold }]}>
            <MaterialCommunityIcons name="lock" size={11} color="#FFF" />
          </View>
        )}
        {card.locked && isSelected && (
          <View style={[s.tileBadge, { backgroundColor: C.gold }]}>
            <Ionicons name="checkmark" size={11} color="#FFF" />
          </View>
        )}

        {/* Illustration area — icon inside soft bubble */}
        <View style={s.tileIllusWrap}>
          {card.image != null ? (
            <View style={[s.tileIllusBubble, { backgroundColor: card.selBg[0] }]}>
              <CachedImage
                source={card.image}
                style={s.tileIllusImg}
                contentFit="contain"
              />
            </View>
          ) : (
            <View style={[s.tileIllusBubble, { backgroundColor: card.selBg[0] }]}>
              <MaterialCommunityIcons
                name={card.icon}
                size={60}
                color={isSelected ? card.iconColor : `${card.iconColor}BB`}
              />
            </View>
          )}
        </View>

        {/* Label */}
        <Text style={[s.tileLabel, isSelected && { color: C.text }]}>
          {card.label}
        </Text>
        {card.locked && <Text style={s.lockedLabel}>Soul Premium</Text>}

      </LinearGradient>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── CycleTile — full-width horizontal card ────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CycleTile({
  isSelected,
  onPress,
}: {
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [
        s.cycleShell,
        isSelected && {
          borderColor: C.terracotta,
          shadowColor: C.terracotta,
          shadowOpacity: 0.22,
          transform: [{ translateY: -3 }],
        },
        pressed && s.pressed,
      ]}
    >
      <LinearGradient
        colors={isSelected ? ["#FDDDD0", "#FFF0E8"] : ["#FFF8F5", "#FFFCFB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.cycleGrad}
      >

        {/* Left — icon + label */}
        <View style={s.cycleLeft}>
          <View style={s.cycleIconBubble}>
            {/* Orbit ring decoration */}
            <View style={s.cycleOrbitOuter} pointerEvents="none" />
            <View style={s.cycleOrbitInner} pointerEvents="none" />
            <MaterialCommunityIcons
              name="moon-waning-crescent"
              size={28}
              color={isSelected ? C.terracotta : "#D0897A"}
            />
          </View>
          <Text style={s.cycleLabel}>Cycle Tracking</Text>
        </View>

        {/* Right — bloop-cycle illustration */}
        <View style={s.cycleImgWrap} pointerEvents="none">
          <CachedImage
            source={bloopCycle}
            style={s.cycleImg}
            contentFit="contain"
          />
        </View>

        {/* Checkmark badge */}
        {isSelected && (
          <View style={[s.tileBadge, { backgroundColor: C.terracotta, top: 14, right: 14 }]}>
            <Ionicons name="checkmark" size={11} color="#FFF" />
          </View>
        )}

      </LinearGradient>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Styles ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  // ── Screen shell ──────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    overflow: "hidden",
  },

  // ── Ambient blobs ─────────────────────────────────────────────────────────
  blob1: {
    position: "absolute",
    top: -100,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(252, 195, 175, 0.38)",
  },
  blob2: {
    position: "absolute",
    top: 160,
    right: -110,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(189,172,255,0.26)",
  },
  blob3: {
    position: "absolute",
    bottom: 60,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(244,162,97,0.16)",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 10,
  },
  logoText: {
    fontFamily: F.luxuryBold,              // PlayfairDisplay Bold — brand name
    fontSize: 22,
    lineHeight: 28,
    color: C.text,
    letterSpacing: 0.2,
  },
  logoSub: {
    fontFamily: F.uiRegular,               // Nunito Regular — tagline
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.68)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    shadowColor: C.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 2,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: {
    paddingBottom: 20,
  },

  // ── Hero area ─────────────────────────────────────────────────────────────
  heroArea: {
    width: W,
    height: H * 0.25,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  // Moon decoration
  moonWrap: {
    position: "absolute",
    top: "14%" as any,
    right: "12%" as any,
    opacity: 0.90,
  },

  // Botanical leaf shapes (pure view geometry)
  botanicLeft: {
    position: "absolute",
    left: -30,
    top: "10%" as any,
    width: 100,
    height: 160,
    borderRadius: 50,
    backgroundColor: "rgba(129,178,154,0.14)",
    transform: [{ rotate: "20deg" }],
  },
  botanicLeft2: {
    position: "absolute",
    left: 10,
    top: "35%" as any,
    width: 70,
    height: 110,
    borderRadius: 35,
    backgroundColor: "rgba(189,178,255,0.12)",
    transform: [{ rotate: "35deg" }],
  },
  botanicRight: {
    position: "absolute",
    right: -20,
    bottom: "8%" as any,
    width: 90,
    height: 140,
    borderRadius: 45,
    backgroundColor: "rgba(244,162,97,0.13)",
    transform: [{ rotate: "-25deg" }],
  },

  // Aura rings behind orb
  auraRingOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(252,195,175,0.18)",
    borderWidth: 1,
    borderColor: "rgba(244,162,97,0.14)",
  },
  auraRingInner: {
    position: "absolute",
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: "rgba(244,162,97,0.18)",
  },

  // Sparkle dots
  sparkle: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // Orbit decorative rings (behind orb)
  orbitRing1: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.10)",
  },
  orbitRing2: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    borderWidth: 1,
    borderColor: "rgba(189,178,255,0.10)",
    borderStyle: "dashed",
  },

  // Bloop image
  bloopShadow: {
    shadowColor: "#E07A5F",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 8,
  },
  bloopImg: {
    width: 124,
    height: 124,
  },

  // ── Question text ──────────────────────────────────────────────────────────
  questionWrap: {
    paddingHorizontal: SIDE_PAD,
    alignItems: "center",
    marginTop: 0,
    marginBottom: 14,
    gap: 4,
  },
  question: {
    fontFamily: F.luxuryBold,              // PlayfairDisplay Bold — hero question
    fontSize: 31,
    lineHeight: 37,
    color: C.text,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  questionSub: {
    fontFamily: F.uiMedium,                // Nunito Medium — gentle supporting line
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // ── Card grid ─────────────────────────────────────────────────────────────
  grid: {
    paddingHorizontal: SIDE_PAD,
    gap: CARD_GAP,
  },
  cardRow: {
    flexDirection: "row",
    gap: CARD_GAP,
  },

  // ── NeedTile — half-width card ────────────────────────────────────────────
  tileShell: {
    width: HALF_W,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "#FFFFFF",
    shadowColor: "#9E7080",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 3,
    overflow: "hidden",
  },
  tileLocked: {
    opacity: 0.68,
  },
  tileGrad: {
    borderRadius: 26,
    padding: 13,
    minHeight: 146,
    justifyContent: "space-between",
  },
  tileBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  tileIllusWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 4,
  },
  tileIllusBubble: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  tileIllusImg: {
    width: 56,
    height: 56,
  },
  tileLabel: {
    fontFamily: F.uiBold,                  // Nunito Bold — card label
    fontSize: 14,
    lineHeight: 18,
    color: C.text,
    marginTop: 2,
  },
  lockedLabel: {
    fontFamily: F.uiBlack,
    fontSize: 9,
    color: C.gold,
    letterSpacing: 0.6,
    marginTop: 3,
    textTransform: "uppercase",
  },

  // ── CycleTile — full-width card ───────────────────────────────────────────
  cycleShell: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "#FFFFFF",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 3,
    overflow: "hidden",
  },
  cycleGrad: {
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 12,
    minHeight: 88,
  },
  cycleLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cycleIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(224,122,95,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },
  cycleOrbitOuter: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.18)",
  },
  cycleOrbitInner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.12)",
    borderStyle: "dashed",
  },
  cycleLabel: {
    fontFamily: F.uiBold,                  // Nunito Bold — card label
    fontSize: 16,
    lineHeight: 22,
    color: C.text,
  },
  cycleImgWrap: {
    width: 120,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleImg: {
    width: 120,
    height: 96,
  },

  // ── Floating CTA bar ──────────────────────────────────────────────────────
  ctaArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SIDE_PAD,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 14,
    alignItems: "center",
    backgroundColor: "rgba(251,240,230,0.88)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.72)",
  },
  ctaShell: {
    width: "100%",
    borderRadius: 999,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 8,
  },
  ctaGrad: {
    height: 58,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaLabel: {
    fontFamily: F.uiBlack,                 // Nunito Black — CTA button
    color: "#FFFFFF",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  ctaDim: {
    opacity: 0.48,
  },

  // ── Page dots ─────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(224,122,95,0.28)",
  },
  dotActive: {
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.terracotta,
  },

  // ── Shared ────────────────────────────────────────────────────────────────
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
