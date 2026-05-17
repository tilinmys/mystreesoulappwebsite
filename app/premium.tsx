import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

// ── Confirmed assets ────────────────────────────────────────────────────────────
const bloopHero   = require("../public/images/bloop-nav.webp");
const bloopCalm   = require("../public/images/bloop-calm.webp");
const soliImage   = require("../public/images/bloop-insight.webp");
const manchiImage = require("../public/images/bloop-learning-private.webp");
const yogiImage   = require("../public/images/movement-yoga-flow.webp");

const { width: W } = Dimensions.get("window");

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
  bg:         "#FAF9F6",
  white:      "#FFFFFF",
  text:       "#2B2D42",
  muted:      "#6B708D",
  faint:      "#A89F9B",
  terracotta: "#E07A5F",
  peach:      "#F4A261",
  sage:       "#81B29A",
  lavender:   "#BDB2FF",
  rose:       "#D7A6A1",
  purple:     "#8B5CF6",
  gold:       "#C9A96E",
  goldLight:  "#F0DFB8",
};

const SIDE_PAD    = 20;
const CARD_RADIUS = 24;
const COL_GAP     = 12;
const CARD_W      = (W - SIDE_PAD * 2 - COL_GAP) / 2;

// ── Data ───────────────────────────────────────────────────────────────────────
type Companion = {
  id:       string;
  name:     string;
  role:     string;
  status:   "included" | "premium";
  color:    string;
  gradient: readonly [string, string];
  image:    ReturnType<typeof require>;
};

const COMPANIONS: Companion[] = [
  {
    id:       "bloop",
    name:     "Bloop",
    role:     "General wellness",
    status:   "included",
    color:    C.terracotta,
    gradient: ["rgba(224,122,95,0.16)", "rgba(244,162,97,0.08)"] as const,
    image:    bloopCalm,
  },
  {
    id:       "soli",
    name:     "Soli",
    role:     "Emotional check-ins",
    status:   "premium",
    color:    C.lavender,
    gradient: ["rgba(189,178,255,0.20)", "rgba(189,178,255,0.06)"] as const,
    image:    soliImage,
  },
  {
    id:       "manchi",
    name:     "Manchi",
    role:     "Psychology & mental health",
    status:   "premium",
    color:    C.purple,
    gradient: ["rgba(139,92,246,0.18)", "rgba(139,92,246,0.05)"] as const,
    image:    manchiImage,
  },
  {
    id:       "yogi",
    name:     "Yogi",
    role:     "Yoga & guided healing",
    status:   "premium",
    color:    C.sage,
    gradient: ["rgba(129,178,154,0.18)", "rgba(129,178,154,0.06)"] as const,
    image:    yogiImage,
  },
];

type MHFeature = {
  id:    string;
  title: string;
  sub:   string;
  icon:  React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
};

const MH_FEATURES: MHFeature[] = [
  { id: "checkins",  title: "Guided Emotional Check-ins",  sub: "Daily prompts led by Soli",          icon: "heart-pulse",            color: C.lavender   },
  { id: "stress",    title: "Stress Support Journeys",     sub: "Personalised 7-day recovery arcs",   icon: "lightning-bolt-outline", color: C.terracotta },
  { id: "sleep",     title: "Sleep Reset Plans",           sub: "Rituals crafted to your rhythm",     icon: "moon-waning-crescent",   color: C.purple     },
  { id: "grounding", title: "Grounding Exercises",         sub: "Anchor yourself in moments of chaos",icon: "leaf-maple",             color: C.sage       },
  { id: "journal",   title: "Journaling Prompts",          sub: "Write it out with Bloop beside you", icon: "book-heart-outline",     color: C.rose       },
];

type Program = {
  id:    string;
  title: string;
  sub:   string;
  tag:   string;
  icon:  React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  bg:    string;
};

const PROGRAMS: Program[] = [
  { id: "mojo",     title: "MyStree Mojo",           sub: "Build rhythm, own your cycle",         tag: "Cycle",     icon: "star-four-points-outline", color: C.terracotta, bg: "rgba(224,122,95,0.10)"  },
  { id: "reset",    title: "Reset Program",           sub: "Reclaim your baseline in 7 days",      tag: "Wellness",  icon: "restore",                  color: C.sage,       bg: "rgba(129,178,154,0.12)" },
  { id: "hormones", title: "Hormone Balance Support", sub: "Nourish your cycle from within",       tag: "Nutrition", icon: "chart-bell-curve",         color: C.lavender,   bg: "rgba(189,178,255,0.12)" },
  { id: "recovery", title: "Emotional Recovery Plan", sub: "Gentle steps back to yourself",        tag: "Mind",      icon: "account-heart-outline",    color: C.rose,       bg: "rgba(215,166,161,0.13)" },
];

const PERKS = [
  { icon: "crown-outline"             as const, label: "4 AI Companions"      },
  { icon: "brain"                     as const, label: "Mental Health Hub"    },
  { icon: "chart-timeline-variant"    as const, label: "Deep Insights"        },
  { icon: "certificate-outline"       as const, label: "Guided Programs"      },
];

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function PremiumScreen() {
  const router = useRouter();
  const [waitlistTapped, setWaitlistTapped] = useState(false);

  return (
    <SafeAreaView style={s.screen}>

      {/* ── Nav bar ───────────────────────────────────────────────────────── */}
      <View style={s.navBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backBtn, pressed && s.pressed]}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </Pressable>
        <View style={s.premiumPill}>
          <MaterialCommunityIcons name="crown-outline" size={13} color={C.gold} />
          <Text style={s.premiumPillText}>Premium care layer</Text>
        </View>
        <View style={s.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >

        {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
        <View style={s.heroCard}>
          {/* Rich gradient wash */}
          <LinearGradient
            colors={["rgba(139,92,246,0.22)", "rgba(189,178,255,0.14)", "rgba(224,122,95,0.12)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Champagne shimmer strip */}
          <LinearGradient
            colors={["rgba(201,169,110,0.22)", "rgba(201,169,110,0.00)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: CARD_RADIUS + 4 }]}
          />

          <View style={s.heroContent}>
            {/* Gold accent bar */}
            <View style={s.goldBar} />

            <Text style={s.heroTitle}>Mystii Premium</Text>
            <Text style={s.heroSubtitle}>
              Unlock deeper emotional wellness, guided healing, and personalised companion support.
            </Text>

            {/* Perks strip */}
            <View style={s.perksRow}>
              {PERKS.map((p) => (
                <View key={p.label} style={s.perkChip}>
                  <MaterialCommunityIcons name={p.icon} size={13} color={C.gold} />
                  <Text style={s.perkChipText}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Hero Bloop illustration */}
          <View style={s.heroImageCol} pointerEvents="none">
            <CachedImage source={bloopHero} style={s.heroImage} contentFit="contain" />
          </View>
        </View>

        {/* ── 2. Companions ─────────────────────────────────────────────────── */}
        <SectionHeader
          icon="face-woman-shimmer-outline"
          iconColor={C.terracotta}
          title="Your Companions"
          sub="Premium unlocks three additional companions alongside Bloop."
        />
        <View style={s.companionGrid}>
          {COMPANIONS.map((c) => (
            <CompanionCard key={c.id} companion={c} />
          ))}
        </View>

        {/* ── 3. Mental Health Hub ──────────────────────────────────────────── */}
        <SectionHeader
          icon="brain"
          iconColor={C.lavender}
          title="Mental Health Hub"
          sub="Guided programmes curated by wellness experts."
          locked
        />
        <View style={s.mhList}>
          {MH_FEATURES.map((f) => (
            <MHFeatureRow key={f.id} feature={f} />
          ))}
        </View>

        {/* ── 4. Programs ───────────────────────────────────────────────────── */}
        <SectionHeader
          icon="certificate-outline"
          iconColor={C.gold}
          title="Programs For You"
          sub="Structured 7–21 day wellness journeys, guided step by step."
          locked
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.hScroll}
          contentContainerStyle={s.hScrollContent}
        >
          {PROGRAMS.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </ScrollView>

        {/* ── 5. CTA ────────────────────────────────────────────────────────── */}
        <View style={s.ctaCard}>
          <LinearGradient
            colors={["rgba(224,122,95,0.12)", "rgba(189,178,255,0.10)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <MaterialCommunityIcons name="crown-outline" size={28} color={C.gold} />
          <Text style={s.ctaTitle}>Be first to experience{"\n"}Mystii Premium</Text>
          <Text style={s.ctaSub}>
            We're rolling out access to a small circle first.{"\n"}
            Join the waitlist and we'll reach out personally.
          </Text>

          {/* Primary CTA */}
          <Pressable
            onPress={() => setWaitlistTapped(true)}
            style={({ pressed }) => [s.primaryCta, pressed && s.pressed]}
          >
            <LinearGradient
              colors={[C.terracotta, C.peach]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.primaryCtaGradient}
            >
              {waitlistTapped ? (
                <>
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFF" />
                  <Text style={s.primaryCtaText}>You're on the list ✦</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="heart-outline" size={18} color="#FFF" />
                  <Text style={s.primaryCtaText}>Join the waitlist</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Secondary CTA */}
          <Pressable
            onPress={() => router.push("/bloop")}
            style={({ pressed }) => [s.secondaryCta, pressed && s.pressed]}
          >
            <MaterialCommunityIcons name="chat-outline" size={16} color={C.muted} />
            <Text style={s.secondaryCtaText}>Explore with Bloop</Text>
          </Pressable>
        </View>

        {/* Safety note */}
        <Text style={s.legalNote}>
          No payment required. No subscription created. Mystii Premium is currently in closed preview.
        </Text>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Shared section header ──────────────────────────────────────────────────────
function SectionHeader({
  icon,
  iconColor,
  title,
  sub,
  locked = false,
}: {
  icon:      React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  title:     string;
  sub:       string;
  locked?:   boolean;
}) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionHeaderLeft}>
        <View style={[s.sectionIconBubble, { backgroundColor: `${iconColor}18` }]}>
          <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
        </View>
        <View style={s.sectionHeaderText}>
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>{title}</Text>
            {locked && (
              <View style={s.sectionLockPill}>
                <MaterialCommunityIcons name="lock-outline" size={10} color={C.gold} />
                <Text style={s.sectionLockText}>Premium</Text>
              </View>
            )}
          </View>
          <Text style={s.sectionSub}>{sub}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Companion card ─────────────────────────────────────────────────────────────
function CompanionCard({ companion }: { companion: Companion }) {
  const locked = companion.status === "premium";

  return (
    <View style={s.companionCard}>
      <LinearGradient
        colors={companion.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {locked && (
        <View style={s.companionLockBadge}>
          <MaterialCommunityIcons name="crown-outline" size={10} color={C.gold} />
          <Text style={s.companionLockText}>Premium</Text>
        </View>
      )}

      <View style={[s.companionAvatarFrame, { borderColor: `${companion.color}35` }]}>
        <CachedImage source={companion.image} style={s.companionAvatarImage} contentFit="cover" />
        {locked && <View style={s.companionAvatarDim} />}
      </View>

      <Text style={[s.companionName, locked && { color: C.muted }]}>
        {companion.name}
      </Text>
      <Text style={s.companionRole}>{companion.role}</Text>

      {locked ? (
        <View style={[s.companionStatusPill, { backgroundColor: `${companion.color}1A` }]}>
          <Text style={[s.companionStatusText, { color: companion.color }]}>
            🔒 Premium
          </Text>
        </View>
      ) : (
        <View style={[s.companionStatusPill, { backgroundColor: "rgba(201,169,110,0.16)" }]}>
          <Text style={[s.companionStatusText, { color: C.gold }]}>
            ✦ Included
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Mental health feature row ──────────────────────────────────────────────────
function MHFeatureRow({ feature }: { feature: MHFeature }) {
  return (
    <View style={s.mhRow}>
      <View style={[s.mhIconBubble, { backgroundColor: `${feature.color}18` }]}>
        <MaterialCommunityIcons name={feature.icon} size={20} color={feature.color} />
      </View>
      <View style={s.mhTextCol}>
        <Text style={s.mhTitle}>{feature.title}</Text>
        <Text style={s.mhSub}>{feature.sub}</Text>
      </View>
      <View style={s.mhLockWrap}>
        <MaterialCommunityIcons name="lock-outline" size={14} color={C.gold} />
      </View>
    </View>
  );
}

// ── Program card ───────────────────────────────────────────────────────────────
function ProgramCard({ program }: { program: Program }) {
  return (
    <View style={[s.programCard, { backgroundColor: C.white }]}>
      {/* Gold shimmer stripe along top */}
      <LinearGradient
        colors={["rgba(201,169,110,0.18)", "rgba(201,169,110,0.00)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: CARD_RADIUS }]}
      />

      {/* Lock overlay badge */}
      <View style={s.programLockBadge}>
        <MaterialCommunityIcons name="lock-outline" size={10} color={C.gold} />
        <Text style={s.programLockText}>Premium</Text>
      </View>

      <View style={[s.programIconBubble, { backgroundColor: program.bg }]}>
        <MaterialCommunityIcons name={program.icon} size={22} color={program.color} />
      </View>

      <Text style={s.programTitle}>{program.title}</Text>
      <Text style={s.programSub}>{program.sub}</Text>

      <View style={[s.programTagPill, { backgroundColor: program.bg }]}>
        <Text style={[s.programTagText, { color: program.color }]}>
          {program.tag}
        </Text>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // ── Nav bar ──
  navBar: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    paddingHorizontal: SIDE_PAD,
    paddingTop:        4,
    paddingBottom:     10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.white,
    shadowColor:     C.text,
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       2,
  },
  premiumPill: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               5,
    backgroundColor:   "rgba(201,169,110,0.14)",
    borderRadius:      999,
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderWidth:       1,
    borderColor:       "rgba(201,169,110,0.30)",
  },
  premiumPillText: {
    fontSize: 11, fontWeight: "800",
    color: C.gold, letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  navSpacer: { width: 40 },

  // ── Scroll ──
  scroll: {
    paddingHorizontal: SIDE_PAD,
    paddingTop:        4,
    gap:               24,
  },

  // ── Hero card ──
  heroCard: {
    borderRadius:    CARD_RADIUS + 4,
    minHeight:       200,
    flexDirection:   "row",
    alignItems:      "center",
    overflow:        "hidden",
    backgroundColor: C.white,
    shadowColor:     C.purple,
    shadowOffset:    { width: 0, height: 14 },
    shadowOpacity:   0.14,
    shadowRadius:    30,
    elevation:       6,
    paddingLeft:     22,
    paddingVertical: 28,
  },
  heroContent: { flex: 1, paddingRight: 8, gap: 10 },
  goldBar: {
    width: 32, height: 3,
    borderRadius: 999,
    backgroundColor: C.gold,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: Platform.OS === "ios"
      ? "PlayfairDisplay_800ExtraBold"
      : "PlayfairDisplay_700Bold",
    fontSize: 26, lineHeight: 32,
    color: C.text, letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: 12, lineHeight: 18,
    color: C.muted, fontWeight: "600",
  },
  perksRow: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           6,
    marginTop:     4,
  },
  perkChip: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               4,
    backgroundColor:   "rgba(201,169,110,0.13)",
    borderRadius:      999,
    paddingHorizontal: 9,
    paddingVertical:   4,
    borderWidth:       1,
    borderColor:       "rgba(201,169,110,0.24)",
  },
  perkChipText: {
    fontSize: 9, fontWeight: "900",
    color: C.gold, letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  heroImageCol: {
    width:           130,
    height:          200,
    alignItems:      "center",
    justifyContent:  "flex-end",
  },
  heroImage: { width: 126, height: 170 },

  // ── Section header ──
  sectionHeader: { gap: 2 },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems:    "flex-start",
    gap:           12,
  },
  sectionIconBubble: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    marginTop:  1,
  },
  sectionHeaderText: { flex: 1, gap: 3 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
    flexWrap:      "wrap",
  },
  sectionTitle: {
    fontFamily: Platform.OS === "ios"
      ? "PlayfairDisplay_800ExtraBold"
      : "PlayfairDisplay_700Bold",
    fontSize: 17, lineHeight: 22,
    color: C.text, letterSpacing: 0.2,
  },
  sectionLockPill: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               3,
    backgroundColor:   "rgba(201,169,110,0.14)",
    borderRadius:      999,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:       1,
    borderColor:       "rgba(201,169,110,0.28)",
  },
  sectionLockText: {
    fontSize: 9, fontWeight: "900",
    color: C.gold, letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionSub: {
    fontSize: 12, lineHeight: 17,
    color: C.muted, fontWeight: "600",
  },

  // ── Companion grid ──
  companionGrid: {
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
    shadowColor:     C.text,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.07,
    shadowRadius:    16,
    elevation:       3,
  },
  companionLockBadge: {
    position:          "absolute",
    top:               12,
    right:             12,
    flexDirection:     "row",
    alignItems:        "center",
    gap:               3,
    backgroundColor:   "rgba(201,169,110,0.22)",
    borderRadius:      999,
    paddingHorizontal: 7,
    paddingVertical:   3,
    borderWidth:       1,
    borderColor:       "rgba(201,169,110,0.36)",
    zIndex:            2,
  },
  companionLockText: {
    fontSize: 9, fontWeight: "900",
    color: C.gold, letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  companionAvatarFrame: {
    width: 86, height: 86,
    borderRadius: 43,
    overflow:    "hidden",
    borderWidth: 2,
    marginBottom: 4,
  },
  companionAvatarImage: { width: 86, height: 86 },
  companionAvatarDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(250,249,246,0.46)",
  },
  companionName: {
    fontFamily: Platform.OS === "ios"
      ? "PlayfairDisplay_800ExtraBold"
      : "PlayfairDisplay_700Bold",
    fontSize: 15, lineHeight: 20,
    color: C.text, textAlign: "center",
  },
  companionRole: {
    fontSize: 11, lineHeight: 15,
    color: C.muted, fontWeight: "600",
    textAlign: "center",
  },
  companionStatusPill: {
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   4,
    marginTop:         4,
  },
  companionStatusText: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 0.5,
  },

  // ── Mental Health rows ──
  mhList: { gap: 10 },
  mhRow: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             14,
    backgroundColor: C.white,
    borderRadius:    20,
    padding:         16,
    shadowColor:     C.lavender,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.09,
    shadowRadius:    12,
    elevation:       2,
  },
  mhIconBubble: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  mhTextCol: { flex: 1 },
  mhTitle: {
    fontSize: 13, lineHeight: 18,
    color: C.text, fontWeight: "800",
  },
  mhSub: {
    fontSize: 11, lineHeight: 15,
    color: C.muted, fontWeight: "600",
    marginTop: 2,
  },
  mhLockWrap: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(201,169,110,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.24)",
    flexShrink: 0,
  },

  // ── Programs horizontal scroll ──
  hScroll: { marginHorizontal: -SIDE_PAD },
  hScrollContent: {
    paddingHorizontal: SIDE_PAD,
    gap:               12,
    paddingRight:      SIDE_PAD + 4,
  },
  programCard: {
    width:           172,
    borderRadius:    CARD_RADIUS,
    overflow:        "hidden",
    padding:         18,
    gap:             8,
    shadowColor:     C.gold,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.10,
    shadowRadius:    14,
    elevation:       3,
  },
  programLockBadge: {
    alignSelf:         "flex-start",
    flexDirection:     "row",
    alignItems:        "center",
    gap:               4,
    backgroundColor:   "rgba(201,169,110,0.16)",
    borderRadius:      999,
    paddingHorizontal: 9,
    paddingVertical:   4,
    borderWidth:       1,
    borderColor:       "rgba(201,169,110,0.30)",
  },
  programLockText: {
    fontSize: 9, fontWeight: "900",
    color: C.gold, letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  programIconBubble: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  programTitle: {
    fontFamily: Platform.OS === "ios"
      ? "PlayfairDisplay_800ExtraBold"
      : "PlayfairDisplay_700Bold",
    fontSize: 14, lineHeight: 19,
    color: C.text,
  },
  programSub: {
    fontSize: 11, lineHeight: 15,
    color: C.muted, fontWeight: "600",
  },
  programTagPill: {
    alignSelf:         "flex-start",
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   4,
    marginTop:         2,
  },
  programTagText: {
    fontSize: 10, fontWeight: "900",
    letterSpacing: 0.4,
  },

  // ── CTA card ──
  ctaCard: {
    borderRadius:    CARD_RADIUS + 4,
    overflow:        "hidden",
    backgroundColor: C.white,
    padding:         28,
    alignItems:      "center",
    gap:             12,
    shadowColor:     C.purple,
    shadowOffset:    { width: 0, height: 12 },
    shadowOpacity:   0.12,
    shadowRadius:    28,
    elevation:       5,
  },
  ctaTitle: {
    fontFamily: Platform.OS === "ios"
      ? "PlayfairDisplay_800ExtraBold"
      : "PlayfairDisplay_700Bold",
    fontSize:   22,
    lineHeight: 30,
    color:      C.text,
    textAlign:  "center",
    letterSpacing: 0.2,
  },
  ctaSub: {
    fontSize:  12,
    lineHeight: 18,
    color:     C.muted,
    fontWeight: "600",
    textAlign: "center",
  },
  primaryCta: {
    width:        "100%",
    borderRadius: 999,
    marginTop:    4,
    shadowColor:   C.terracotta,
    shadowOffset:  { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius:  20,
    elevation:     6,
  },
  primaryCtaGradient: {
    minHeight:         56,
    borderRadius:      999,
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "center",
    gap:               10,
  },
  primaryCtaText: {
    color:      "#FFFFFF",
    fontSize:   14,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  secondaryCta: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            7,
    paddingVertical: 10,
  },
  secondaryCtaText: {
    fontSize:   13,
    color:      C.muted,
    fontWeight: "700",
  },

  // ── Legal ──
  legalNote: {
    fontSize:  11,
    lineHeight: 16,
    color:     C.faint,
    textAlign: "center",
    fontWeight: "600",
    paddingHorizontal: 8,
  },

  pressed: { transform: [{ scale: 0.96 }] },
});
