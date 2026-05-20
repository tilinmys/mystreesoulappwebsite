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
  sub:       string;
  icon:      React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  selBg:     readonly [string, string];
  idleBg:    readonly [string, string];
  glow:      string;
  locked:    boolean;
};

const NEEDS: NeedCard[] = [
  {
    id:        "self_love",
    label:     "Self Love",
    sub:       "Care & softness",
    icon:      "heart",
    iconColor: C.rose,
    selBg:     ["#FDDDE8", "#FBF0F4"],
    idleBg:    ["#FFFCFB", "#FFF8F8"],
    glow:      "#E05875",
    locked:    false,
  },
  {
    id:        "goal_setting",
    label:     "Goal Setting",
    sub:       "Build habits",
    icon:      "target",
    iconColor: "#C87040",
    selBg:     ["#FBF0E2", "#FDF8F2"],
    idleBg:    ["#FFFCFB", "#FFFAF7"],
    glow:      "#D4956A",
    locked:    false,
  },
  {
    id:        "nutrition",
    label:     "Nutrition",
    sub:       "Nourish deeply",
    icon:      "leaf",
    iconColor: C.sage,
    selBg:     ["#E4F4E8", "#F2FAF4"],
    idleBg:    ["#FFFCFB", "#F8FFF9"],
    glow:      "#5E9B6B",
    locked:    true,
  },
  {
    id:        "inner_harmony",
    label:     "Inner Harmony",
    sub:       "Calm & clarity",
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

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [lockedSheetVisible, setLockedSheetVisible] = useState(false);
  const [lockedCardId, setLockedCardId] = useState<string | null>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // ── Screen entrance ───────────────────────────────────────────────────────
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
      Animated.timing(cardsOp, { toValue: 1, duration: 500, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardsY,  { toValue: 0, duration: 500, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

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
  const showLockedSheet = (id: string) => {
    setLockedCardId(id);
    setLockedSheetVisible(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const hideLockedSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setLockedSheetVisible(false);
      setLockedCardId(null);
    });
  };

  const toggle = (id: string) => {
    const card = NEEDS.find((need) => need.id === id);
    if (card?.locked) {
      showLockedSheet(id);
      return;
    }

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

      {/* Ambient blob accents — low-opacity atmosphere only */}
      <View style={s.blob1} pointerEvents="none" />
      <View style={s.blob2} pointerEvents="none" />
      <View style={s.blob3} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={C.muted} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.logoText}>MyStree Soul</Text>
          <Text style={s.logoSub}>Your wellness space</Text>
        </View>
        <View style={s.headerBtn} />
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

          {/* Botanical leaf shapes */}
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

          {/* Orbit rings */}
          <View style={s.orbitRing1} pointerEvents="none" />
          <View style={s.orbitRing2} pointerEvents="none" />
        </View>

        {/* ── Main question ── */}
        <Animated.View style={{ opacity: entranceOp, transform: [{ translateY: entranceY }] }}>
          <View style={s.questionWrap}>
            {/* Pathway pill */}
            <View style={s.pathwayPill}>
              <MaterialCommunityIcons name="star-four-points" size={11} color={C.terracotta} />
              <Text style={s.pathwayPillText}>Choose your pathway</Text>
            </View>
            <Text style={s.question}>What brings{"\n"}you here?</Text>
            <Text style={s.questionSub}>Choose what feels right.</Text>
          </View>
        </Animated.View>

        {/* ── Card grid ── */}
        <Animated.View style={{ opacity: cardsOp, transform: [{ translateY: cardsY }] }}>
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

          {/* Row 2 — Nutrition + Inner Harmony (locked) */}
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

        </Animated.View>

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

        {/* Helper text when nothing selected */}
        {selected.size === 0 && (
          <Text style={s.helperText}>Choose at least one path to continue.</Text>
        )}

        {/* Page indicator */}
        <View style={s.dotsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.dot, i === 0 && s.dotActive]} />
          ))}
        </View>
      </View>

      {/* ── Locked card sheet ── */}
      {lockedSheetVisible && (
        <LockedSheet
          cardId={lockedCardId}
          sheetAnim={sheetAnim}
          onClose={hideLockedSheet}
          onAskBloop={() => {
            hideLockedSheet();
            router.push("/bloop-chat");
          }}
        />
      )}

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── NeedTile — half-width premium pathway card ────────────────────────────────
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
  // Subtle press-in scale animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1.00, useNativeDriver: true, speed: 40 }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={[
        s.tileShell,
        card.locked && s.tileLocked,
        isSelected && {
          borderColor: card.glow + "88",
          shadowColor: card.glow,
          shadowOpacity: 0.30,
          shadowRadius: 22,
          elevation: 7,
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={isSelected ? card.selBg : card.idleBg}
          style={s.tileGrad}
        >

          {/* Top-right badge */}
          {isSelected && !card.locked && (
            <View style={[s.tileBadge, { backgroundColor: card.glow }]}>
              <Ionicons name="checkmark" size={11} color="#FFF" />
            </View>
          )}
          {card.locked && (
            <View style={[s.tileBadge, { backgroundColor: C.gold }]}>
              <MaterialCommunityIcons name="lock-outline" size={10} color="#FFF" />
            </View>
          )}

          {/* Icon illustration area */}
          <View style={s.tileIllusWrap}>
            {/* Ambient glow ring — only when selected */}
            {isSelected && (
              <View style={[s.tileIconGlow, { backgroundColor: card.glow + "1C" }]} />
            )}
            {/* Icon bubble */}
            <View style={[
              s.tileIllusBubble,
              {
                backgroundColor: isSelected
                  ? card.selBg[0]
                  : "rgba(255,255,255,0.72)",
                borderColor: isSelected
                  ? card.glow + "30"
                  : "rgba(255,255,255,0.60)",
              },
            ]}>
              <MaterialCommunityIcons
                name={card.icon}
                size={36}
                color={isSelected ? card.iconColor : card.iconColor + "88"}
              />
            </View>
          </View>

          {/* Label + sub + premium chip */}
          <View style={s.tileLabelArea}>
            <Text style={[s.tileLabel, isSelected && { color: C.text }]} numberOfLines={1}>
              {card.label}
            </Text>
            {!card.locked && (
              <Text style={s.tileSub} numberOfLines={1}>{card.sub}</Text>
            )}
            {card.locked && (
              <View style={s.premiumChip}>
                <MaterialCommunityIcons name="crown-outline" size={9} color={C.gold} />
                <Text style={s.premiumChipText}>Premium</Text>
              </View>
            )}
          </View>

        </LinearGradient>
      </Animated.View>
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1.00, useNativeDriver: true, speed: 40 }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={[
        s.cycleShell,
        isSelected && {
          borderColor: C.terracotta + "88",
          shadowColor: C.terracotta,
          shadowOpacity: 0.26,
          shadowRadius: 22,
          elevation: 7,
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={isSelected ? ["#FDDDD0", "#FFF0E8"] : ["#FFF8F5", "#FFFCFB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.cycleGrad}
        >

          {/* Left — icon + labels */}
          <View style={s.cycleLeft}>
            <View style={[
              s.cycleIconBubble,
              isSelected && { backgroundColor: "rgba(224,122,95,0.18)" },
            ]}>
              {/* Orbit ring decoration */}
              <View style={s.cycleOrbitOuter} pointerEvents="none" />
              <View style={s.cycleOrbitInner} pointerEvents="none" />
              <MaterialCommunityIcons
                name="moon-waning-crescent"
                size={26}
                color={isSelected ? C.terracotta : "#D0897A"}
              />
            </View>
            <View style={s.cycleLabelGroup}>
              <Text style={s.cycleLabel}>Cycle Tracking</Text>
              <Text style={s.cycleSub}>Understand your phases</Text>
            </View>
          </View>

          {/* Right — illustration */}
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
      </Animated.View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── LockedSheet — soft bottom sheet for Premium-locked cards ──────────────────
// ─────────────────────────────────────────────────────────────────────────────
function LockedSheet({
  cardId,
  sheetAnim,
  onClose,
  onAskBloop,
}: {
  cardId: string | null;
  sheetAnim: Animated.Value;
  onClose: () => void;
  onAskBloop: () => void;
}) {
  const card = NEEDS.find((n) => n.id === cardId);

  const translateY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });
  const overlayOp  = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] });

  return (
    <>
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000", opacity: overlayOp }]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Dismiss" />
      </Animated.View>

      <Animated.View style={[s.lockedSheet, { transform: [{ translateY }] }]}>
        <View style={s.sheetHandle} />

        <View style={s.sheetIconBubble}>
          <MaterialCommunityIcons name="crown-outline" size={30} color={C.gold} />
        </View>

        <Text style={s.sheetTitle}>Soul Premium</Text>
        <Text style={s.sheetBody}>
          {card?.label} is part of Soul Premium.{"\n"}
          Bloop can still give you a gentle preview.
        </Text>

        <View style={s.sheetActions}>
          <Pressable
            onPress={onAskBloop}
            style={({ pressed }) => [s.sheetPrimaryBtn, pressed && s.pressed]}
          >
            <LinearGradient
              colors={[C.peach, C.terracotta]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.sheetPrimaryGrad}
            >
              <Text style={s.sheetPrimaryLabel}>Ask Bloop</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [s.sheetGhostBtn, pressed && s.pressed]}
          >
            <Text style={s.sheetGhostLabel}>Explore Premium</Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
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
    backgroundColor: "#FFFFFF",
  },

  // ── Ambient blobs — atmosphere only, 8-10% opacity ────────────────────────
  blob1: {
    position: "absolute",
    top: -120,
    left: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(255,183,183,0.10)",
  },
  blob2: {
    position: "absolute",
    top: 200,
    right: -140,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(189,172,255,0.08)",
  },
  blob3: {
    position: "absolute",
    bottom: 40,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(162,202,178,0.08)",
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
    fontFamily: F.luxuryBold,
    fontSize: 22,
    lineHeight: 28,
    color: C.text,
    letterSpacing: 0.2,
  },
  logoSub: {
    fontFamily: F.uiRegular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(248,244,248,0.96)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    shadowColor: C.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
    height: H * 0.24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  moonWrap: {
    position: "absolute",
    top: "14%" as any,
    right: "12%" as any,
    opacity: 0.90,
  },

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

  sparkle: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
  },

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

  bloopShadow: {
    shadowColor: "#E07A5F",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 8,
  },
  bloopImg: {
    width: 120,
    height: 120,
  },

  // ── Question text ──────────────────────────────────────────────────────────
  questionWrap: {
    paddingHorizontal: SIDE_PAD,
    alignItems: "center",
    marginTop: 2,
    marginBottom: 16,
    gap: 6,
  },
  pathwayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(248,244,248,0.96)",
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.70)",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  pathwayPillText: {
    fontFamily: F.uiBlack,
    fontSize: 10,
    color: C.terracotta,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  question: {
    fontFamily: F.luxuryBold,
    fontSize: 30,
    lineHeight: 36,
    color: C.text,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  questionSub: {
    fontFamily: F.uiMedium,
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

  // ── NeedTile ─────────────────────────────────────────────────────────────
  tileShell: {
    width: HALF_W,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(228,218,224,0.70)",
    backgroundColor: "#FFFFFF",
    shadowColor: "#9E7080",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    overflow: "hidden",
  },
  tileLocked: {
    borderColor: "rgba(201,169,110,0.32)",
  },
  tileGrad: {
    borderRadius: 26,
    padding: 14,
    minHeight: 158,
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
    zIndex: 2,
  },
  tileIllusWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tileIconGlow: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  tileIllusBubble: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  tileLabelArea: {
    gap: 5,
    paddingTop: 2,
  },
  tileLabel: {
    fontFamily: F.uiBold,
    fontSize: 14,
    lineHeight: 18,
    color: C.text,
  },
  tileSub: {
    fontFamily: F.uiRegular,
    fontSize: 11,
    color: C.muted,
    lineHeight: 14,
  },
  premiumChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(201,169,110,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.32)",
    alignSelf: "flex-start",
  },
  premiumChipText: {
    fontFamily: F.uiBold,
    fontSize: 9,
    color: C.gold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ── CycleTile ─────────────────────────────────────────────────────────────
  cycleShell: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(228,218,224,0.70)",
    backgroundColor: "#FFFFFF",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
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
    paddingVertical: 14,
    minHeight: 90,
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
    backgroundColor: "rgba(224,122,95,0.11)",
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
  cycleLabelGroup: {
    gap: 3,
  },
  cycleLabel: {
    fontFamily: F.uiBold,
    fontSize: 16,
    lineHeight: 20,
    color: C.text,
  },
  cycleSub: {
    fontFamily: F.uiRegular,
    fontSize: 12,
    color: C.muted,
    lineHeight: 15,
  },
  cycleImgWrap: {
    width: 112,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleImg: {
    width: 112,
    height: 90,
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
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(232,225,230,0.60)",
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
    fontFamily: F.uiBlack,
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

  // ── Header center ─────────────────────────────────────────────────────────
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },

  // ── Helper text ───────────────────────────────────────────────────────────
  helperText: {
    fontFamily: F.uiRegular,
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    opacity: 0.85,
  },

  // ── Locked sheet ──────────────────────────────────────────────────────────
  lockedSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 50,
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
    marginBottom: 22,
  },
  sheetIconBubble: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "rgba(201,169,110,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 22,
    color: C.text,
    marginBottom: 10,
    textAlign: "center",
  },
  sheetBody: {
    fontFamily: F.uiRegular,
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  sheetActions: {
    width: "100%",
    gap: 12,
  },
  sheetPrimaryBtn: {
    width: "100%",
    borderRadius: 999,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  sheetPrimaryGrad: {
    height: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetPrimaryLabel: {
    fontFamily: F.uiBlack,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  sheetGhostBtn: {
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(232,225,230,0.80)",
    backgroundColor: "rgba(250,247,249,0.98)",
  },
  sheetGhostLabel: {
    fontFamily: F.uiBold,
    fontSize: 14,
    color: C.muted,
  },

  // ── Shared ────────────────────────────────────────────────────────────────
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
