import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../components/CachedImage";
import { darkColors } from "../constants/colors";
import { F } from "../constants/fonts";
import { useSafeBack } from "../hooks/useSafeBack";

// ── Confirmed assets (all present in public/images) ────────────────────────────
const bloopHero   = require("../public/images/bloop-welcome.webp");
const bloopCard   = require("../public/images/bloop-voice.webp");
const jiggyImage  = require("../public/images/companion-jiggy.webp");
const manchiImage = require("../public/images/companion-manchi.webp");
const yogiImage   = require("../public/images/companion-yogi.webp");

const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
  bg:         darkColors.background,      // #110812
  white:      darkColors.surface,         // #2E2330
  text:       darkColors.textPrimary,     // #F6E9EF
  muted:      darkColors.textMuted,       // #B58AC8
  faint:      darkColors.textHint,        // #8A6AA0
  terracotta: darkColors.primaryCTA,      // #E8A6B6 (Bloom Pink)
  peach:      "#F4B86E",                  // Peach/Gold (wellness reset border)
  sage:       darkColors.fertileColor,    // #7EC8A0 (Sage)
  lavender:   "#B58AC8",                  // Lavender Dust
  rose:       darkColors.periodColor,     // #E88090 (Period Rose)
  purple:     "#B58AC8",                  // Lavender Dust
};

const SIDE_PAD    = 20;
const CARD_RADIUS = 24;
const COL_GAP     = 12;
const CARD_W      = (W - SIDE_PAD * 2 - COL_GAP) / 2;

// ── Data ───────────────────────────────────────────────────────────────────────
const SUPPORT_CHIPS = [
  { id: "calm",   label: "Calm me",       icon: "weather-windy"          as const, color: C.sage       },
  { id: "sleep",  label: "Help me sleep", icon: "moon-waning-crescent"   as const, color: C.lavender   },
  { id: "mood",   label: "Track my mood", icon: "emoticon-happy-outline" as const, color: C.terracotta },
  { id: "ground", label: "Ground me",     icon: "leaf-maple"             as const, color: C.peach      },
];

type Companion = {
  id:       string;
  name:     string;
  role:     string;
  status:   "accessible" | "premium";
  color:    string;
  gradient: readonly [string, string];
  image:    ReturnType<typeof require>;
};

const COMPANIONS: Companion[] = [
  {
    id:       "bloop",
    name:     "Bloop",
    role:     "General wellness companion",
    status:   "accessible",
    color:    C.terracotta,
    gradient: ["rgba(232, 166, 182, 0.14)", "rgba(232, 166, 182, 0.04)"] as const,
    image:    bloopCard,
  },
  {
    id:       "jiggy",
    name:     "Jiggy",
    role:     "Emotional check-ins",
    status:   "premium",
    color:    C.lavender,
    gradient: ["rgba(181, 138, 200, 0.15)", "rgba(181, 138, 200, 0.04)"] as const,
    image:    jiggyImage,
  },
  {
    id:       "manchi",
    name:     "Manchi",
    role:     "Psychology & mental health",
    status:   "premium",
    color:    C.purple,
    gradient: ["rgba(181, 138, 200, 0.15)", "rgba(181, 138, 200, 0.04)"] as const,
    image:    manchiImage,
  },
  {
    id:       "yogi",
    name:     "Yogi",
    role:     "Yoga & guided healing",
    status:   "premium",
    color:    C.sage,
    gradient: ["rgba(126, 200, 160, 0.15)", "rgba(126, 200, 160, 0.04)"] as const,
    image:    yogiImage,
  },
];

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function BloopScreen() {
  const router          = useRouter();
  const safeBack        = useSafeBack();
  const [activeChip, setActiveChip]     = useState<string | null>(null);

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar style="light" backgroundColor={darkColors.background} translucent />

      {/* ── Navigation bar ────────────────────────────────────────────────── */}
      <View style={s.navBar}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={safeBack}
          style={({ pressed }) => [s.backBtn, pressed && s.pressed]}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={darkColors.primaryCTA} />
        </Pressable>
        <Text style={s.navTitle}>Your Companions</Text>
        {/* spacer mirrors back button width so title centres perfectly */}
        <View style={s.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >

        {/* ── Subtitle ──────────────────────────────────────────────────────── */}
        <Text style={s.subtitle}>
          Choose the kind of support you need today.
        </Text>

        {/* ── Hero card ─────────────────────────────────────────────────────── */}
        <View style={s.heroCard}>
          <LinearGradient
            colors={["rgba(232, 166, 182, 0.14)", "rgba(232, 166, 182, 0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Text side */}
          <View style={s.heroTextCol}>
            {/* Active badge */}
            <View style={s.activeBadge}>
              <View style={s.activeDot} />
              <Text style={s.activeBadgeLabel}>Active now</Text>
            </View>

            <Text style={s.heroName}>Bloop</Text>
            <Text style={s.heroTagline}>
              Here with gentle{"\n"}wellness support.
            </Text>

            <Pressable
              onPress={() => router.push("/bloop-chat" as any)}
              style={({ pressed }) => [s.heroCta, pressed && s.pressed]}
            >
              <MaterialCommunityIcons name="chat-outline" size={16} color={darkColors.background} />
              <Text style={s.heroCtaText}>Start with Bloop</Text>
            </Pressable>
          </View>

          {/* Illustration */}
          <View style={s.heroImageCol} pointerEvents="none">
            <CachedImage
              source={bloopHero}
              style={s.heroImage}
              contentFit="contain"
            />
          </View>
        </View>

        {/* ── Quick support chips ───────────────────────────────────────────── */}
        <Text style={s.sectionLabel}>Quick support</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chipsScroll}
          contentContainerStyle={s.chipsRow}
        >
          {SUPPORT_CHIPS.map((chip) => {
            const active = activeChip === chip.id;
            return (
              <Pressable
                key={chip.id}
                onPress={() => setActiveChip(active ? null : chip.id)}
                style={({ pressed }) => [
                  s.chip,
                  active && { backgroundColor: `${chip.color}1E`, borderColor: chip.color },
                  pressed && s.pressed,
                ]}
              >
                <MaterialCommunityIcons
                  name={chip.icon}
                  size={15}
                  color={active ? chip.color : C.muted}
                />
                <Text style={[s.chipLabel, active && { color: chip.color }]}>
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Companion grid ────────────────────────────────────────────────── */}
        <Text style={s.sectionLabel}>All companions</Text>
        <View style={s.grid}>
          {COMPANIONS.map((c) => (
            <CompanionCard
              key={c.id}
              companion={c}
              onPress={() =>
                c.status === "premium"
                  ? router.push("/premium")
                  : router.push("/bloop-chat" as any)
              }
            />
          ))}
        </View>

        {/* ── Safety footer ─────────────────────────────────────────────────── */}
        <View style={s.safetyCard}>
          <MaterialCommunityIcons name="head-heart-outline" size={20} color={darkColors.primaryCTA} />
          <Text style={s.safetyText}>
            If you feel unsafe or need urgent support, please contact local emergency services or a trusted person.
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );}

// ── Companion card component ───────────────────────────────────────────────────
function CompanionCard({
  companion,
  onPress,
}: {
  companion: Companion;
  onPress: () => void;
}) {
  const locked = companion.status === "premium";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.companionCard, pressed && s.pressed]}
    >
      {/* Gradient wash */}
      <LinearGradient
        colors={companion.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Premium lock badge — top right */}
      {locked && (
        <View style={s.lockBadge}>
          <MaterialCommunityIcons name="lock-outline" size={10} color="#FFF" />
          <Text style={s.lockBadgeText}>Premium</Text>
        </View>
      )}

      {/* Avatar */}
      <View style={[s.avatarFrame, { borderColor: `${companion.color}35` }]}>
        <CachedImage
          source={companion.image}
          style={s.avatarImage}
          contentFit="cover"
        />
        {/* Dim overlay on locked companions */}
        {locked && <View style={s.avatarDim} />}
      </View>

      {/* Name */}
      <Text style={[s.companionName, locked && s.companionNameLocked]}>
        {companion.name}
      </Text>

      {/* Role */}
      <Text style={s.companionRole} numberOfLines={2}>
        {companion.role}
      </Text>

      {/* Status pill */}
      {locked ? (
        <View style={[s.statusPill, { backgroundColor: `${companion.color}1A` }]}>
          <Text style={[s.statusPillText, { color: companion.color }]}>
            🔒 Premium
          </Text>
        </View>
      ) : (
        <View style={[s.statusPill, { backgroundColor: "rgba(129,178,154,0.18)" }]}>
          <Text style={[s.statusPillText, { color: C.sage }]}>
            Active
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // ── Nav bar ──
  navBar: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop:     4,
    paddingBottom:  8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  navTitle: {
    fontFamily: F.luxuryExtraBold,
    fontSize:      20,
    lineHeight:    26,
    color:         C.text,
    letterSpacing: 0.2,
  },
  navSpacer: { width: 40 },

  // ── Scroll ──
  scroll: {
    paddingHorizontal: SIDE_PAD,
    paddingTop:        8,
    gap:               20,
  },

  // ── Subtitle ──
  subtitle: {
    fontSize:   14,
    lineHeight: 20,
    color:      C.muted,
    fontWeight: "600",
  },

  // ── Hero card ──
  heroCard: {
    borderRadius:    CARD_RADIUS + 4,
    minHeight:       178,
    flexDirection:   "row",
    alignItems:      "center",
    overflow:        "hidden",
    backgroundColor: C.white,
    shadowColor:     C.terracotta,
    shadowOffset:    { width: 0, height: 10 },
    shadowOpacity:   0.12,
    shadowRadius:    26,
    elevation:       5,
    paddingLeft:     22,
    paddingVertical: 22,
  },
  heroTextCol: { flex: 1, paddingRight: 8 },
  activeBadge: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            5,
    alignSelf:      "flex-start",
    backgroundColor: "rgba(129,178,154,0.14)",
    borderRadius:   999,
    paddingHorizontal: 10,
    paddingVertical:   4,
    marginBottom:   10,
  },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.sage,
  },
  activeBadgeLabel: {
    fontSize: 10, fontWeight: "800",
    color: C.sage, letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  heroName: {
    fontFamily: F.luxuryExtraBold,
    fontSize: 26, lineHeight: 32, color: C.text, letterSpacing: 0.2,
  },
  heroTagline: {
    fontSize: 13, lineHeight: 19,
    color: C.muted, fontWeight: "600",
    marginTop: 5,
  },
  heroCta: {
    marginTop:        16,
    alignSelf:        "flex-start",
    flexDirection:    "row",
    alignItems:       "center",
    gap:              8,
    backgroundColor:  C.terracotta,
    borderRadius:     999,
    paddingHorizontal: 18,
    paddingVertical:  11,
  },
  heroCtaReady: {
    backgroundColor: "rgba(129,178,154,0.14)",
    borderWidth: 1,
    borderColor: C.sage,
  },
  heroCtaText: {
    color: C.bg, fontSize: 13,
    fontWeight: "800", letterSpacing: 0.3,
  },
  heroCtaTextReady: { color: C.sage },

  heroImageCol: {
    width:           140,
    height:          178,
    alignItems:      "center",
    justifyContent:  "flex-end",
  },
  heroImage: { width: 136, height: 158 },

  // ── Section label ──
  sectionLabel: {
    fontFamily: F.luxuryExtraBold,
    fontSize: 17, lineHeight: 22,
    color: C.text, letterSpacing: 0.2,
  },

  // ── Quick support chips ──
  chipsScroll: { marginHorizontal: -SIDE_PAD },
  chipsRow: {
    paddingHorizontal: SIDE_PAD,
    gap: 10,
    paddingRight: SIDE_PAD + 4,
  },
  chip: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            7,
    borderRadius:   999,
    paddingHorizontal: 16,
    paddingVertical:   10,
    backgroundColor: C.white,
    borderWidth:    1,
    borderColor:    "rgba(255,255,255,0.08)",
  },
  chipLabel: {
    fontSize: 13, fontWeight: "700",
    color: C.muted,
  },

  // ── Companion grid ──
  grid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           COL_GAP,
  },
  companionCard: {
    width:           CARD_W,
    borderRadius:    CARD_RADIUS,
    overflow:        "hidden",
    backgroundColor: C.white,
    padding:         16,
    alignItems:      "center",
    gap:             6,
    borderWidth:     1,
    borderColor:     "rgba(255,255,255,0.08)",
  },
  lockBadge: {
    position:        "absolute",
    top:             12,
    right:           12,
    flexDirection:   "row",
    alignItems:      "center",
    gap:             3,
    backgroundColor: "rgba(20, 14, 22, 0.85)",
    borderRadius:    999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex:          2,
  },
  lockBadgeText: {
    fontSize: 9, fontWeight: "900",
    color: "#FFF", letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  avatarFrame: {
    width:        88,
    height:       88,
    borderRadius: 44,
    overflow:     "hidden",
    borderWidth:  2,
    borderColor:  "rgba(255,255,255,0.1)",
    marginBottom: 4,
  },
  avatarImage: { width: 88, height: 88 },
  avatarDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,8,18,0.65)",
  },
  companionName: {
    fontFamily: F.luxuryExtraBold,
    fontSize: 16, lineHeight: 21,
    color: C.text, textAlign: "center",
  },
  companionNameLocked: { color: C.muted },
  companionRole: {
    fontSize: 11, lineHeight: 15,
    color: C.muted, fontWeight: "600",
    textAlign: "center",
  },
  statusPill: {
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   4,
    marginTop:         4,
  },
  statusPillText: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 0.5,
  },

  // ── Safety footer ──
  safetyCard: {
    flexDirection:   "row",
    alignItems:      "flex-start",
    gap:             12,
    backgroundColor: "rgba(232, 166, 182, 0.06)",
    borderRadius:    20,
    padding:         16,
    borderWidth:     1,
    borderColor:     "rgba(232, 166, 182, 0.12)",
  },
  safetyText: {
    flex:       1,
    fontSize:   12,
    lineHeight: 18,
    color:      C.muted,
    fontWeight: "600",
  },

  pressed: { transform: [{ scale: 0.96 }] },
});
