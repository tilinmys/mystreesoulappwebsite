import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../components/CachedImage";
import { F } from "../constants/fonts";
import { useSafeBack } from "../hooks/useSafeBack";

const W = Platform.OS === "web" ? 390 : Dimensions.get("window").width;

// ── Assets ────────────────────────────────────────────────────────────────────
const imgBloopCalm    = require("../public/images/bloop-calm.webp");
const imgBloopCycle   = require("../public/images/bloop-cycle.webp");
const imgBloopSleep   = require("../public/images/bloop-sleep-moon.webp");
const imgBloopPremium = require("../public/images/bloop-premium-lotus.webp");
const imgBloopNourish = require("../public/images/bloop-nourish.webp");
const imgBreathing    = require("../public/images/insight-breathing-reset.webp");
const imgBloopWelcome = require("../public/images/bloop-welcome.webp");

// ── Palette — Midnight Plum dark theme ────────────────────────────────────────
const C = {
  text:        "#F6E9EF",   // textPrimary  (Moon Pearl)
  muted:       "#B58AC8",   // textMuted    (Lavender Dust)
  faint:       "#6E5680",   // dimmed muted
  terracotta:  "#E07A5F",   // informational accent (kept)
  peach:       "#F4A261",   // informational accent (kept)
  lavender:    "#9277C8",   // informational accent (kept)
  rose:        "#D45C82",   // informational accent (kept)
  gold:        "#C9A040",   // informational accent (kept)
  sage:        "#5E9B6B",   // informational accent (kept)
  white:       "#FFFFFF",   // badge icons
  cardBg:      "#2E2330",   // surface      (Blackberry Smoke)
  cardBorder:  "#4A394D",   // border       (Velvet Mauve)
} as const;

// ── Category config — dark-mode tag chips ─────────────────────────────────────
type CategoryKey = "companion" | "wellness" | "cycle" | "emotional" | "premium" | "hydration";

const CATEGORY: Record<CategoryKey, { label: string; bg: string; text: string }> = {
  companion:  { label: "Companion Message", bg: "rgba(107,66,187,0.22)",  text: "#9277C8" },
  wellness:   { label: "Wellness Reminder", bg: "rgba(107,66,187,0.16)",  text: "#B58AC8" },
  cycle:      { label: "Cycle Update",      bg: "rgba(196,90,122,0.20)",  text: "#E8A6B6" },
  emotional:  { label: "Emotional Wellness",bg: "rgba(196,106,48,0.20)",  text: "#F4A261" },
  premium:    { label: "Premium",           bg: "rgba(176,136,32,0.20)",  text: "#C9A040" },
  hydration:  { label: "Wellness Reminder", bg: "rgba(61,139,88,0.20)",   text: "#5E9B6B" },
};

// ── Notification data ─────────────────────────────────────────────────────────
type NotifItem = {
  id:          string;
  title:       string;
  description: string;
  time:        string;
  unread:      boolean;
  category:    CategoryKey;
  avatarImage: ReturnType<typeof require>;
  avatarBg:    string;
  avatarGlow:  string;
  isPremium?:  boolean;
  crownIcon?:  boolean;
};

const NOTIF_GROUPS: Array<{ title: string; data: NotifItem[] }> = [
  {
    title: "Today",
    data: [
      {
        id:          "bloop-companion",
        title:       "Bloop",
        description: "You've been carrying a lot lately 💜",
        time:        "2m ago",
        unread:      true,
        category:    "companion",
        avatarImage: imgBloopCalm,
        avatarBg:    "#2A2438",
        avatarGlow:  "rgba(146,119,200,0.22)",
      },
      {
        id:          "evening-reminder",
        title:       "Evening Reminder",
        description: "Time for your evening reset.",
        time:        "1h ago",
        unread:      true,
        category:    "wellness",
        avatarImage: imgBloopSleep,
        avatarBg:    "#1E2038",
        avatarGlow:  "rgba(120,120,220,0.18)",
      },
      {
        id:          "cycle-insight",
        title:       "Cycle Insight",
        description: "Your energy may shift tomorrow.",
        time:        "3h ago",
        unread:      true,
        category:    "cycle",
        avatarImage: imgBloopCycle,
        avatarBg:    "#2E1A24",
        avatarGlow:  "rgba(212,92,130,0.18)",
      },
      {
        id:          "emotional-checkin",
        title:       "Emotional Check-In",
        description: "Would you like a 2-minute breathing reset?",
        time:        "5h ago",
        unread:      true,
        category:    "emotional",
        avatarImage: imgBreathing,
        avatarBg:    "#2C1E16",
        avatarGlow:  "rgba(196,106,48,0.16)",
      },
      {
        id:          "soli-premium",
        title:       "Soli Insight Ready",
        description: "Soli prepared a personalized emotional insight.",
        time:        "Yesterday",
        unread:      false,
        category:    "premium",
        avatarImage: imgBloopPremium,
        avatarBg:    "#2A2010",
        avatarGlow:  "rgba(201,160,64,0.22)",
        isPremium:   true,
        crownIcon:   true,
      },
    ],
  },
  {
    title: "Earlier",
    data: [
      {
        id:          "hydration",
        title:       "Hydration Reminder",
        description: "Don't forget to drink some water 💧",
        time:        "Yesterday",
        unread:      false,
        category:    "hydration",
        avatarImage: imgBloopNourish,
        avatarBg:    "#162318",
        avatarGlow:  "rgba(94,155,107,0.18)",
      },
    ],
  },
  {
    title: "This Week",
    data: [
      {
        id:          "period-prediction",
        title:       "Period Prediction",
        description: "Your next period is predicted in 3 days.",
        time:        "2d ago",
        unread:      false,
        category:    "cycle",
        avatarImage: imgBloopCycle,
        avatarBg:    "#2E1A24",
        avatarGlow:  "rgba(212,92,130,0.18)",
      },
    ],
  },
];

// ── Filter pill data ──────────────────────────────────────────────────────────
type FilterItem = {
  id:       string;
  label:    string;
  icon:     React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  hasUnread:boolean;
};

const FILTERS: FilterItem[] = [
  { id: "sleep",     label: "Sleep Reminder",    icon: "moon-waning-crescent", hasUnread: false },
  { id: "cycle",     label: "Cycle Update",      icon: "flower-outline",       hasUnread: true  },
  { id: "emotional", label: "Emotional Check-In", icon: "emoticon-happy-outline", hasUnread: true },
  { id: "wellness",  label: "Wellness Insight",  icon: "leaf-circle-outline",  hasUnread: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// ── Screen ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router   = useRouter();
  const safeBack = useSafeBack();

  const [readIds,       setReadIds]       = useState(() => new Set<string>());
  const [activeFilter,  setActiveFilter]  = useState<string | null>(null);

  // ── "Caught up" Bloop breathe animation ──────────────────────────────────
  const breathe = useRef(new Animated.Value(1)).current;
  const floatY  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.ease);
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1.07, duration: 2800, easing: ease, useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 1.00, duration: 2800, easing: ease, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(floatY, { toValue: -6, duration: 3200, easing: ease, useNativeDriver: true }),
          Animated.timing(floatY, { toValue: 0,  duration: 3200, easing: ease, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const markRead = (id: string) =>
    setReadIds((prev) => new Set(prev).add(id));

  const markAllRead = () =>
    setReadIds(new Set(NOTIF_GROUPS.flatMap((g) => g.data.map((n) => n.id))));

  const isUnread = (item: NotifItem) => item.unread && !readIds.has(item.id);

  const visibleGroups = NOTIF_GROUPS.map((g) => ({
    ...g,
    data: activeFilter
      ? g.data.filter((n) => {
          if (activeFilter === "sleep")     return n.category === "wellness";
          if (activeFilter === "cycle")     return n.category === "cycle";
          if (activeFilter === "emotional") return n.category === "emotional" || n.category === "companion";
          if (activeFilter === "wellness")  return n.category === "hydration" || n.category === "premium";
          return true;
        })
      : g.data,
  })).filter((g) => g.data.length > 0);

  const hasAny = visibleGroups.some((g) => g.data.length > 0);

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>

      {/* ── Background — Midnight Plum ── */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#110812" }]} />

      {/* ── Ambient blobs ── */}
      <View style={s.blob1} pointerEvents="none" />
      <View style={s.blob2} pointerEvents="none" />
      <View style={s.blob3} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >

        {/* ────────────────── HEADER ────────────────── */}
        <View style={s.header}>
          <Pressable
            onPress={safeBack}
            accessibilityLabel="Go back"
            style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Pressable>

          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Notifications</Text>
            <View style={s.headerUnderline}>
              <View style={s.headerLine} />
              <View style={s.headerDot} />
              <View style={s.headerLine} />
            </View>
          </View>

          <Pressable
            onPress={markAllRead}
            accessibilityLabel="Mark all as read"
            style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
          >
            <Ionicons name="options-outline" size={20} color={C.terracotta} />
          </Pressable>
        </View>

        {/* ────────────────── FILTER PILLS ────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setActiveFilter(isActive ? null : f.id)}
                style={({ pressed }) => [
                  s.filterPill,
                  isActive && s.filterPillActive,
                  pressed && s.pressed,
                ]}
              >
                {/* Unread dot */}
                {f.hasUnread && (
                  <View style={s.filterUnreadDot} />
                )}
                <MaterialCommunityIcons
                  name={f.icon}
                  size={16}
                  color={isActive ? C.white : C.lavender}
                />
                <Text style={[s.filterLabel, isActive && s.filterLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ────────────────── NOTIFICATION GROUPS ────────────────── */}
        {hasAny ? (
          visibleGroups.map((group) => (
            <View key={group.title} style={s.group}>

              {/* Group header */}
              <Text style={s.groupTitle}>{group.title}</Text>

              {/* Cards */}
              <View style={s.groupCards}>
                {group.data.map((item, idx) => (
                  <NotifCard
                    key={item.id}
                    item={item}
                    unread={isUnread(item)}
                    index={idx}
                    onPress={() => markRead(item.id)}
                  />
                ))}
              </View>

            </View>
          ))
        ) : (
          /* ── Empty filter state ── */
          <View style={s.emptyFilter}>
            <MaterialCommunityIcons name="bell-sleep-outline" size={36} color={C.faint} />
            <Text style={s.emptyFilterText}>No notifications here</Text>
            <Pressable onPress={() => setActiveFilter(null)} style={s.emptyFilterBtn}>
              <Text style={s.emptyFilterBtnText}>Show all</Text>
            </Pressable>
          </View>
        )}

        {/* ────────────────── CAUGHT UP BANNER ────────────────── */}
        <View style={s.caughtUpWrap}>
          <LinearGradient
            colors={["#2E2330", "#362240", "#2A1E2E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.caughtUpCard}
          >
            {/* Botanical left leaf */}
            <View style={s.botanicLeafL} pointerEvents="none" />
            <View style={s.botanicLeafR} pointerEvents="none" />

            {/* Bloop illustration */}
            <Animated.View
              style={[
                s.caughtUpImageWrap,
                { transform: [{ scale: breathe }, { translateY: floatY }] },
              ]}
            >
              <CachedImage
                source={imgBloopWelcome}
                style={s.caughtUpImage}
                contentFit="contain"
                priority="normal"
              />
            </Animated.View>

            {/* Text block */}
            <View style={s.caughtUpText}>
              <Text style={s.caughtUpTitle}>You're all caught up</Text>
              <Text style={s.caughtUpSub}>
                We'll notify you when something{"\n"}important comes up. 💖
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── NotifCard ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function NotifCard({
  item,
  unread,
  index,
  onPress,
}: {
  item:    NotifItem;
  unread:  boolean;
  index:   number;
  onPress: () => void;
}) {
  // Staggered entrance fade
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 420, delay, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  const cat = CATEGORY[item.category];

  return (
    <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          s.card,
          unread && s.cardUnread,
          pressed && s.pressed,
        ]}
      >
        {/* ── Avatar ── */}
        <View style={[s.avatarWrap, { backgroundColor: item.avatarBg }]}>
          {/* Glow ring */}
          <View
            style={[s.avatarGlow, { backgroundColor: item.avatarGlow }]}
            pointerEvents="none"
          />
          <CachedImage
            source={item.avatarImage}
            style={s.avatarImg}
            contentFit="contain"
            priority="normal"
          />
          {/* Premium lock badge */}
          {item.isPremium && (
            <View style={s.premiumBadge}>
              <MaterialCommunityIcons name="lock" size={10} color={C.white} />
            </View>
          )}
          {/* Companion chat bubble badge */}
          {item.category === "companion" && (
            <View style={s.companionBadge}>
              <MaterialCommunityIcons name="chat-outline" size={10} color={C.white} />
            </View>
          )}
        </View>

        {/* ── Content ── */}
        <View style={s.cardContent}>
          {/* Title row */}
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle} numberOfLines={1}>
              {item.title}
              {item.crownIcon ? " 👑" : ""}
            </Text>
          </View>
          {/* Description */}
          <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
          {/* Category tag */}
          <View style={[s.tag, { backgroundColor: cat.bg }]}>
            <Text style={[s.tagText, { color: cat.text }]}>{cat.label}</Text>
          </View>
        </View>

        {/* ── Meta (time + unread dot) ── */}
        <View style={s.cardMeta}>
          <Text style={s.cardTime}>{item.time}</Text>
          {unread && <View style={s.unreadDot} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Styles ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  // ── Screen ──────────────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#110812",
  },

  // ── Ambient blobs — dark tinted ──────────────────────────────────────────────
  blob1: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(232,166,182,0.08)",
  },
  blob2: {
    position: "absolute",
    top: 220,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(146,119,200,0.09)",
  },
  blob3: {
    position: "absolute",
    bottom: 120,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(201,160,64,0.07)",
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: {
    paddingTop: 10,
    paddingBottom: 20,
    gap: 20,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection:  "row",
    alignItems:     "center",
    paddingHorizontal: 20,
    paddingTop:     4,
  },
  headerBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: "#2E2330",
    borderWidth:     1,
    borderColor:     "#4A394D",
    alignItems:      "center",
    justifyContent:  "center",
    shadowColor:     "#000000",
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.28,
    shadowRadius:    10,
    elevation:       3,
  },
  headerCenter: {
    flex:        1,
    alignItems:  "center",
    gap:         6,
  },
  headerTitle: {
    fontFamily:  F.luxuryBold,       // PlayfairDisplay — premium editorial header
    fontSize:    24,
    lineHeight:  30,
    color:       C.text,
    letterSpacing: 0.3,
  },
  headerUnderline: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           5,
  },
  headerLine: {
    width:           24,
    height:          1,
    backgroundColor: "rgba(232,166,182,0.32)",
    borderRadius:    1,
  },
  headerDot: {
    width:           5,
    height:          5,
    borderRadius:    3,
    backgroundColor: C.terracotta,
    opacity:         0.72,
  },

  // ── Filter pills ─────────────────────────────────────────────────────────────
  filterRow: {
    paddingHorizontal: 20,
    gap:               10,
    paddingVertical:   2,
  },
  filterPill: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius:    30,
    backgroundColor: "#2E2330",
    borderWidth:     1,
    borderColor:     "#4A394D",
    shadowColor:     "#000000",
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.26,
    shadowRadius:    12,
    elevation:       3,
  },
  filterPillActive: {
    backgroundColor: C.lavender,
    borderColor:     C.lavender,
  },
  filterUnreadDot: {
    position:        "absolute",
    top:             -3,
    right:           -3,
    width:           9,
    height:          9,
    borderRadius:    5,
    backgroundColor: C.terracotta,
    borderWidth:     1.5,
    borderColor:     "#110812",
  },
  filterLabel: {
    fontFamily:  F.uiSemiBold,        // Nunito SemiBold — pill labels
    fontSize:    12,
    lineHeight:  16,
    color:       C.text,
  },
  filterLabelActive: {
    color: C.white,
  },

  // ── Groups ───────────────────────────────────────────────────────────────────
  group: {
    gap: 10,
  },
  groupTitle: {
    fontFamily:      F.luxuryBold,    // PlayfairDisplay — section titles for editorial weight
    fontSize:        20,
    lineHeight:      26,
    color:           C.text,
    paddingHorizontal: 20,
    letterSpacing:   0.2,
  },
  groupCards: {
    paddingHorizontal: 20,
    gap:               10,
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: "#2E2330",
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     "#4A394D",
    padding:         14,
    shadowColor:     "#000000",
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.30,
    shadowRadius:    18,
    elevation:       4,
    gap:             12,
  },
  cardUnread: {
    backgroundColor: "#362840",
    borderColor:     "#5A4460",
    shadowOpacity:   0.38,
  },

  // ── Avatar ───────────────────────────────────────────────────────────────────
  avatarWrap: {
    width:           52,
    height:          52,
    borderRadius:    18,
    alignItems:      "center",
    justifyContent:  "center",
    overflow:        "visible",
  },
  avatarGlow: {
    position:   "absolute",
    width:       52,
    height:      52,
    borderRadius: 18,
  },
  avatarImg: {
    width:  42,
    height: 42,
  },
  premiumBadge: {
    position:        "absolute",
    bottom:          -4,
    right:           -4,
    width:           20,
    height:          20,
    borderRadius:    10,
    backgroundColor: "#C9A040",
    alignItems:      "center",
    justifyContent:  "center",
    borderWidth:     1.5,
    borderColor:     C.white,
    shadowColor:     "#C9A040",
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.40,
    shadowRadius:    4,
    elevation:       3,
  },
  companionBadge: {
    position:        "absolute",
    bottom:          -4,
    right:           -4,
    width:           20,
    height:          20,
    borderRadius:    10,
    backgroundColor: C.lavender,
    alignItems:      "center",
    justifyContent:  "center",
    borderWidth:     1.5,
    borderColor:     C.white,
    shadowColor:     C.lavender,
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.36,
    shadowRadius:    4,
    elevation:       3,
  },

  // ── Card content ─────────────────────────────────────────────────────────────
  cardContent: {
    flex:  1,
    gap:   5,
    minWidth: 0,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           6,
  },
  cardTitle: {
    fontFamily:  F.uiBold,            // Nunito Bold — notification title
    fontSize:    14,
    lineHeight:  19,
    color:       C.text,
    flexShrink:  1,
  },
  cardDesc: {
    fontFamily:  F.uiRegular,         // Nunito Regular — notification body
    fontSize:    12,
    lineHeight:  17,
    color:       "#B58AC8",
  },
  tag: {
    alignSelf:       "flex-start",
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:    20,
    marginTop:       2,
  },
  tagText: {
    fontFamily:  F.uiSemiBold,        // Nunito SemiBold — tag labels
    fontSize:    10,
    lineHeight:  14,
    letterSpacing: 0.1,
  },

  // ── Card meta ────────────────────────────────────────────────────────────────
  cardMeta: {
    alignItems:     "flex-end",
    justifyContent: "space-between",
    alignSelf:      "stretch",
    paddingVertical: 2,
    gap:            10,
  },
  cardTime: {
    fontFamily:  F.uiLight,           // Nunito Light — timestamp
    fontSize:    11,
    lineHeight:  15,
    color:       C.muted,
  },
  unreadDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: C.terracotta,
    shadowColor:     C.terracotta,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.50,
    shadowRadius:    5,
    elevation:       2,
  },

  // ── Caught-up banner ─────────────────────────────────────────────────────────
  caughtUpWrap: {
    paddingHorizontal: 20,
  },
  caughtUpCard: {
    borderRadius:    24,
    paddingVertical:   20,
    paddingHorizontal: 20,
    flexDirection:   "row",
    alignItems:      "center",
    overflow:        "hidden",
    shadowColor:     "#000000",
    shadowOffset:    { width: 0, height: 10 },
    shadowOpacity:   0.28,
    shadowRadius:    22,
    elevation:       5,
    gap:             14,
  },
  caughtUpImageWrap: {
    width:  88,
    height: 88,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  caughtUpImage: {
    width:  84,
    height: 84,
  },
  caughtUpText: {
    flex: 1,
    gap:  6,
  },
  caughtUpTitle: {
    fontFamily:  F.luxuryBold,        // PlayfairDisplay — "You're all caught up"
    fontSize:    18,
    lineHeight:  23,
    color:       C.text,
    letterSpacing: 0.2,
  },
  caughtUpSub: {
    fontFamily:  F.uiRegular,         // Nunito Regular — supporting line
    fontSize:    12,
    lineHeight:  18,
    color:       "#B58AC8",
  },

  // ── Botanical decoration on banner ───────────────────────────────────────────
  botanicLeafL: {
    position:        "absolute",
    left:            -20,
    top:             -20,
    width:           100,
    height:          140,
    borderRadius:    50,
    backgroundColor: "rgba(129,178,154,0.09)",
    transform:       [{ rotate: "30deg" }],
  },
  botanicLeafR: {
    position:        "absolute",
    right:           -10,
    bottom:          -10,
    width:           80,
    height:          110,
    borderRadius:    40,
    backgroundColor: "rgba(244,162,97,0.09)",
    transform:       [{ rotate: "-20deg" }],
  },

  // ── Empty filter state ────────────────────────────────────────────────────────
  emptyFilter: {
    alignItems:      "center",
    justifyContent:  "center",
    paddingVertical: 48,
    gap:             12,
  },
  emptyFilterText: {
    fontFamily:  F.uiMedium,
    fontSize:    15,
    lineHeight:  21,
    color:       C.faint,
  },
  emptyFilterBtn: {
    paddingHorizontal: 20,
    paddingVertical:   10,
    borderRadius:     20,
    backgroundColor:  "#2E2330",
    borderWidth:      1,
    borderColor:      "#4A394D",
  },
  emptyFilterBtnText: {
    fontFamily:  F.uiBold,
    fontSize:    13,
    lineHeight:  18,
    color:       C.terracotta,
  },

  // ── Shared ───────────────────────────────────────────────────────────────────
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
