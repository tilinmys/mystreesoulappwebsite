import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { EditProfileModal } from "../../components/EditProfileModal";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { useAuthStore } from "../../store/authStore";
import { useOnboardingStore } from "../../store/onboardingStore";
import { useThemeStore, type ColorMode } from "../../store/themeStore";
import { AppColors, darkColors, lightColors } from "../../constants/colors";

const profileAvatar = require("../../public/images/profile-priya-avatar.webp");
const bloopImage = require("../../public/images/bloop-profile-meditation-cutout.webp");
const premiumLotus = require("../../public/images/bloop-premium-lotus.webp");

const { width: W } = Dimensions.get("window");
const SIDE = 20;
const GRID_GAP = 12;
const QUICK_CARD_W = (W - SIDE * 2 - GRID_GAP) / 2;

const identityChips = [
  { label: "Cycle & Fertility", icon: "flower-tulip-outline", color: "#E07A5F" },
  { label: "Calm Energy", icon: "weather-night", color: "#BDB2FF" },
  { label: "Sleep Improving", icon: "moon-waning-crescent", color: "#6E86D8" },
  { label: "Wellness Focused", icon: "water-outline", color: "#81B29A" }
] as const;

const quickAccess = [
  { label: "Health Records", icon: "folder-heart-outline", color: "#E07A5F", route: "/health-records" },
  { label: "Privacy & Security", icon: "shield-lock-outline", color: "#8B6FE8", route: "/settings" },
  { label: "Notifications", icon: "bell-outline", color: "#F4A261", route: "/notifications" },
  { label: "Saved Programs", icon: "book-heart-outline", color: "#E8795F", route: "/saved-programs" },
  { label: "Companion Settings", icon: "robot-happy-outline", color: "#9B7DEB", route: "/bloop" },
  { label: "Premium Access", icon: "crown-outline", color: "#D99235", route: "/premium" }
] as const;

const summary = [
  { label: "Emotional state", value: "Calm", icon: "heart", color: "#E66AA6", progress: 0.82 },
  { label: "Stress level", value: "Moderate", icon: "cloud-outline", color: "#8B6FE8", progress: 0.62 },
  { label: "Sleep rhythm", value: "Improving", icon: "moon-waning-crescent", color: "#5E7EEA", progress: 0.72 },
  { label: "Cycle rhythm", value: "Stable", icon: "flower-outline", color: "#E07A5F", progress: 0.76 }
] as const;

// ── Dynamic Styles Cache (Maximum Performance Engine) ──────────────────────────
let darkStyles: ReturnType<typeof getStyles> | null = null;
let lightStyles: ReturnType<typeof getStyles> | null = null;

function useStyles() {
  const { colors, isDark } = useColorMode();
  if (isDark) {
    if (!darkStyles) {
      darkStyles = getStyles(darkColors, true);
    }
    return { colors, isDark, s: darkStyles! };
  } else {
    if (!lightStyles) {
      lightStyles = getStyles(lightColors, false);
    }
    return { colors, isDark, s: lightStyles! };
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, s } = useStyles();
  const logout = useAuthStore((state) => state.logout);
  const storedName = useOnboardingStore((state) => state.name);
  const profileName = storedName?.trim() || "Priya Sharma";
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <LinearGradient colors={isDark ? ["#110812", "#1E1220", "#110812"] : ["#FAF5FC", "#F0E8F8", "#FAF5FC"]} style={s.screenGradient}>
      <SafeAreaView edges={["top"]} style={[s.screen, isDark && s.screenDark]}>
        <View style={s.auraPeach} />
        <View style={s.auraLavender} />
        <View style={s.auraSage} />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never" style={s.scrollView}>
          <Header onNotifications={() => router.push("/notifications")} onSettings={() => router.push("/settings")} />
          <HeroCard name={profileName} onEdit={() => setEditModalOpen(true)} />
          <IdentityChips />
          <QuickAccessGrid onNavigate={(route) => router.push(route as never)} />
          <WellnessSummary />
          <ThemeCard />
          <PremiumCard onPress={() => router.push("/premium")} />
          <LogoutButton onLogout={handleLogout} />
        </ScrollView>

        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

function Header({ onNotifications, onSettings }: { onNotifications: () => void; onSettings: () => void }) {
  const { colors, s } = useStyles();
  return (
    <View style={s.header}>
      <View>
        <Text style={s.headerTitle}>Profile</Text>
        <View style={s.headerSubRow}>
          <Text style={s.headerSub}>Your private wellness space</Text>
          <MaterialCommunityIcons name="heart-flash" size={15} color={colors.primaryCTA} />
        </View>
      </View>
      <View style={s.headerActions}>
        <IconButton accessibilityLabel="Open settings" icon="settings-outline" onPress={onSettings} />
        <View>
          <IconButton accessibilityLabel="Open notifications" icon="notifications-outline" onPress={onNotifications} />
          <View style={s.unreadDot} />
        </View>
      </View>
    </View>
  );
}

function HeroCard({ name, onEdit }: { name: string; onEdit: () => void }) {
  const { colors, isDark, s } = useStyles();
  return (
    <LinearGradient colors={isDark ? ["#2E1E2C", "#2C1A30", "#261A38"] : ["#EBDDF5", "#E3CEF5", "#DEC5F4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.heroCard}>
      <View style={s.heroMoon} />
      <View style={s.sparkleOne} />
      <View style={s.sparkleTwo} />
      <View style={s.avatarWrap}>
        <View style={s.avatarGlow} />
        <CachedImage priority="high" source={profileAvatar} style={s.avatar} contentFit="cover" />
        <View style={s.privacyBadge}>
          <MaterialCommunityIcons name="flower-tulip" size={18} color={isDark ? "#E07A5F" : colors.primaryCTA} />
        </View>
      </View>

      <View style={s.heroCopy}>
        <View style={s.nameRow}>
          <Text numberOfLines={1} style={s.profileName}>{name}</Text>
          <View style={s.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        </View>
        <Text style={s.profileSub}>Your private wellness space</Text>
        <Pressable onPress={onEdit} style={({ pressed }) => [s.editButton, pressed && s.pressed]}>
          <MaterialCommunityIcons name="pencil-outline" size={15} color={colors.primaryCTA} />
          <Text style={s.editText}>Edit profile</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primaryCTA} />
        </Pressable>
      </View>

      <View style={s.heroBloop}>
        <CachedImage priority="high" source={bloopImage} style={s.heroBloopImage} />
      </View>
    </LinearGradient>
  );
}

function IdentityChips() {
  const { s } = useStyles();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
      {identityChips.map((chip) => (
        <View key={chip.label} style={s.identityChip}>
          <MaterialCommunityIcons name={chip.icon} size={17} color={chip.color} />
          <Text numberOfLines={1} adjustsFontSizeToFit style={s.identityText}>{chip.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function QuickAccessGrid({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { colors, s } = useStyles();
  return (
    <View style={s.grid}>
      {quickAccess.map((item) => (
        <Pressable key={item.label} onPress={() => onNavigate(item.route)} style={({ pressed }) => [s.quickCard, pressed && s.pressed]}>
          <View style={[s.quickIcon, { backgroundColor: `${item.color}1A` }]}>
            <MaterialCommunityIcons name={item.icon} size={25} color={item.color} />
          </View>
          <Text adjustsFontSizeToFit ellipsizeMode="tail" numberOfLines={2} style={s.quickLabel} textBreakStrategy="balanced">{item.label}</Text>
          <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

function WellnessSummary() {
  const { colors, s } = useStyles();
  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <MaterialCommunityIcons name="heart-pulse" size={18} color={colors.primaryCTA} />
        <Text style={s.summaryTitle}>Your wellness summary</Text>
      </View>
      <View style={s.summaryGrid}>
        {summary.map((item) => (
          <View key={item.label} style={s.summaryItem}>
            <ProgressRing color={item.color} icon={item.icon} progress={item.progress} />
            <Text ellipsizeMode="tail" numberOfLines={2} style={s.summaryLabel} textBreakStrategy="balanced">{item.label}</Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={[s.summaryValue, { color: item.color }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProgressRing({
  color,
  icon,
  progress
}: {
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  progress: number;
}) {
  const { s } = useStyles();
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={s.ringOuter}>
      <Svg height={58} width={58} viewBox="0 0 58 58">
        <Circle cx={29} cy={29} r={radius} stroke={`${color}24`} strokeWidth={3} fill="transparent" />
        <Circle
          cx={29}
          cy={29}
          r={radius}
          stroke={color}
          strokeWidth={3}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          originX={29}
          originY={29}
        />
      </Svg>
      <MaterialCommunityIcons name={icon} size={22} color={color} style={s.ringIcon} />
    </View>
  );
}

function ThemeCard() {
  const { colors, s } = useStyles();
  const colorMode = useThemeStore((s) => s.colorMode);
  const setColorMode = useThemeStore((s) => s.setColorMode);

  const options: Array<{ id: ColorMode; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = [
    { id: "light",  label: "Light",  icon: "white-balance-sunny", color: "#F4A261" },
    { id: "dark",   label: "Dark",   icon: "moon-waning-crescent", color: "#6E86D8" },
    { id: "system", label: "Auto",   icon: "theme-light-dark", color: "#9277C8" },
  ];

  return (
    <View style={s.themeCard}>
      <View style={s.themeHeaderRow}>
        <MaterialCommunityIcons name="palette-outline" size={18} color={colors.primaryCTA} />
        <View style={s.themeHeaderCopy}>
          <Text style={s.themeTitle}>Appearance</Text>
          <Text style={s.themeSub}>Pick how MyStree feels on your screen.</Text>
        </View>
      </View>
      <View style={s.themeRow}>
        {options.map((opt) => {
          const active = colorMode === opt.id;
          return (
            <Pressable
              key={opt.id}
              accessibilityRole="button"
              accessibilityLabel={`Set theme to ${opt.label}`}
              accessibilityState={active ? { selected: true } : {}}
              onPress={() => setColorMode(opt.id)}
              style={({ pressed }) => [
                s.themeOption,
                active && [s.themeOptionActive, { borderColor: opt.color, backgroundColor: `${opt.color}14` }],
                pressed && s.pressed,
              ]}
            >
              <View style={[s.themeIconBubble, { backgroundColor: active ? `${opt.color}26` : colors.surfaceRaised }]}>
                <MaterialCommunityIcons name={opt.icon} size={20} color={opt.color} />
              </View>
              <Text style={[s.themeOptionLabel, active && { color: opt.color }]}>{opt.label}</Text>
              {active ? (
                <View style={[s.themeCheck, { backgroundColor: opt.color }]}>
                  <Ionicons name="checkmark" size={11} color="#FFF" />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PremiumCard({ onPress }: { onPress: () => void }) {
  const { colors, isDark, s } = useStyles();
  return (
    <LinearGradient colors={isDark ? ["#3A2850", "#3C2240"] : ["#F4EBFD", "#EDE0FA"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.premiumCard}>
      <View style={s.premiumLotus}>
        <CachedImage source={premiumLotus} style={s.premiumLotusImage} contentFit="cover" />
      </View>
      <View style={s.premiumCopy}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={s.premiumTitle}>Soul Premium</Text>
        <Text numberOfLines={2} style={s.premiumSub}>Gentler guidance, deeper rituals, and care that follows your rhythm.</Text>
      </View>
      <Pressable onPress={onPress} style={({ pressed }) => [s.premiumButton, pressed && s.pressed]}>
        <MaterialCommunityIcons name="lock-outline" size={15} color={colors.textPrimary} />
        <Text numberOfLines={1} adjustsFontSizeToFit style={s.premiumButtonText}>Explore Soul</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textPrimary} />
      </Pressable>
    </LinearGradient>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const { colors, s } = useStyles();
  return (
    <Pressable onPress={onLogout} style={({ pressed }) => [s.logoutButton, pressed && s.pressed]}>
      <MaterialCommunityIcons name="logout" size={20} color={colors.primaryCTA} />
      <Text numberOfLines={1} adjustsFontSizeToFit style={s.logoutText}>Log Out</Text>
    </Pressable>
  );
}

function IconButton({ accessibilityLabel, icon, onPress }: { accessibilityLabel: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  const { colors, s } = useStyles();
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.iconButton, pressed && s.pressed]}>
      <Ionicons name={icon} size={22} color={colors.textPrimary} />
    </Pressable>
  );
}

function getStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    screenGradient: { flex: 1 },
    screen: { flex: 1, backgroundColor: "transparent" },
    screenDark: { backgroundColor: "transparent" },
    scrollView: { flex: 1, backgroundColor: "transparent" },
    auraPeach: { position: "absolute", top: -80, right: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: isDark ? "rgba(232,166,182,0.07)" : "rgba(232,166,182,0.03)" },
    auraLavender: { position: "absolute", top: 220, left: -110, width: 260, height: 260, borderRadius: 130, backgroundColor: isDark ? "rgba(146,119,200,0.08)" : "rgba(146,119,200,0.04)" },
    auraSage: { position: "absolute", bottom: 120, right: -120, width: 280, height: 280, borderRadius: 140, backgroundColor: isDark ? "rgba(129,178,154,0.06)" : "rgba(129,178,154,0.02)" },
    content: { paddingHorizontal: SIDE, paddingTop: 8, paddingBottom: 110, gap: 10, flexGrow: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
    headerTitle: { color: colors.textPrimary, fontFamily: F.luxuryExtraBold, fontSize: 34, lineHeight: 38 },
    headerSubRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
    headerSub: { color: colors.textMuted, fontFamily: F.uiRegular, fontSize: 14, lineHeight: 19 },
    headerActions: { flexDirection: "row", gap: 11 },
    iconButton: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.30 : 0.08, shadowRadius: 24, elevation: 2 },
    unreadDot: { position: "absolute", top: 7, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primaryCTA, borderWidth: 1, borderColor: colors.background },
    heroCard: { minHeight: 154, borderRadius: 30, padding: 15, flexDirection: "row", alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: isDark ? "rgba(146,119,200,0.28)" : colors.borderSubtle, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.36 : 0.10, shadowRadius: 24, elevation: 3 },
    heroMoon: { position: "absolute", right: 30, top: 20, width: 40, height: 40, borderRadius: 20, borderRightWidth: 6, borderRightColor: isDark ? "rgba(146,119,200,0.45)" : "rgba(146,119,200,0.25)" },
    sparkleOne: { position: "absolute", right: 142, top: 28, width: 5, height: 5, borderRadius: 3, backgroundColor: isDark ? "rgba(232,166,182,0.70)" : "rgba(232,166,182,0.40)" },
    sparkleTwo: { position: "absolute", right: 88, bottom: 36, width: 4, height: 4, borderRadius: 2, backgroundColor: isDark ? "rgba(201,160,64,0.60)" : "rgba(201,160,64,0.30)" },
    avatarWrap: { width: 92, height: 92, alignItems: "center", justifyContent: "center" },
    avatarGlow: { position: "absolute", width: 92, height: 92, borderRadius: 46, backgroundColor: isDark ? "rgba(74,57,77,0.50)" : "rgba(220,200,230,0.40)" },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.border },
    privacyBadge: { position: "absolute", right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
    heroCopy: { flex: 1, minWidth: 0, paddingLeft: 13, paddingRight: 88 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    profileName: { flexShrink: 1, color: colors.textPrimary, fontFamily: F.luxuryBold, fontSize: 21, lineHeight: 27 },
    verifiedBadge: { width: 19, height: 19, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.primaryCTA },
    profileSub: { color: colors.textMuted, fontFamily: F.uiMedium, fontSize: 12, lineHeight: 17, marginTop: 4 },
    editButton: { alignSelf: "flex-start", minHeight: 34, borderRadius: 17, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, marginTop: 11, backgroundColor: isDark ? "rgba(74,57,77,0.60)" : "rgba(180,150,200,0.15)", borderWidth: 1, borderColor: colors.border },
    editText: { color: colors.textPrimary, fontFamily: F.uiBold, fontSize: 12, lineHeight: 16 },
    heroBloop: { position: "absolute", right: 9, bottom: 14, width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(146,119,200,0.12)" : "rgba(146,119,200,0.08)" },
    heroBloopImage: { width: 92, height: 92 },
    chipRow: { gap: 8, paddingRight: 20 },
    identityChip: { minHeight: 34, borderRadius: 17, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.30 : 0.08, shadowRadius: 24, elevation: 2 },
    identityText: { color: colors.textPrimary, fontFamily: F.uiSemiBold, fontSize: 11, lineHeight: 15, flexShrink: 1 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
    quickCard: { width: QUICK_CARD_W, minWidth: 0, minHeight: 80, borderRadius: 20, padding: 11, flexDirection: "row", alignItems: "center", gap: 9, overflow: "hidden", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.30 : 0.08, shadowRadius: 24, elevation: 2 },
    quickIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    quickLabel: { flex: 1, flexShrink: 1, minWidth: 0, color: colors.textPrimary, fontFamily: F.luxuryBold, fontSize: 13, lineHeight: 16 },
    summaryCard: { borderRadius: 26, padding: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.30 : 0.08, shadowRadius: 24, elevation: 2 },
    summaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    summaryTitle: { color: colors.textPrimary, fontFamily: F.luxuryBold, fontSize: 16, lineHeight: 21 },
    summaryGrid: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
    summaryItem: { width: "24%", minWidth: 0, minHeight: 80, alignItems: "center", overflow: "hidden" },
    ringOuter: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
    ringIcon: { position: "absolute" },
    summaryLabel: { color: colors.textPrimary, fontFamily: F.uiSemiBold, fontSize: 9.5, lineHeight: 12, marginTop: 6, minHeight: 24, textAlign: "center", flexShrink: 1 },
    summaryValue: { fontFamily: F.uiBold, fontSize: 10, lineHeight: 13, marginTop: 3, maxWidth: "100%", textAlign: "center" },
    themeCard: { borderRadius: 26, padding: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.30 : 0.08, shadowRadius: 24, elevation: 2, gap: 14 },
    themeHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    themeHeaderCopy: { flex: 1 },
    themeTitle: { color: colors.textPrimary, fontFamily: F.luxuryBold, fontSize: 15, lineHeight: 20 },
    themeSub: { color: colors.textMuted, fontFamily: F.uiMedium, fontSize: 11.5, lineHeight: 15, marginTop: 2 },
    themeRow: { flexDirection: "row", gap: 10 },
    themeOption: { flex: 1, minHeight: 92, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.surfaceRaised, borderWidth: 1.5, borderColor: colors.border },
    themeOptionActive: { borderWidth: 1.5 },
    themeIconBubble: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    themeOptionLabel: { color: colors.textPrimary, fontFamily: F.uiBold, fontSize: 12, lineHeight: 16 },
    themeCheck: { position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
    premiumCard: { minHeight: 96, borderRadius: 26, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, overflow: "hidden", borderWidth: 1, borderColor: isDark ? "rgba(146,119,200,0.30)" : colors.borderSubtle, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.36 : 0.10, shadowRadius: 24, elevation: 2 },
    premiumLotus: { width: 56, height: 56, borderRadius: 28, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(146,119,200,0.15)" : "rgba(146,119,200,0.10)" },
    premiumLotusImage: { width: 56, height: 56 },
    premiumCopy: { flex: 1 },
    premiumTitle: { color: "#F6E9EF", fontFamily: F.luxuryBold, fontSize: 19, lineHeight: 24 },
    premiumSub: { color: "#B58AC8", fontFamily: F.uiSemiBold, fontSize: 11, lineHeight: 15, marginTop: 2, flexShrink: 1 },
    premiumButton: { minHeight: 38, borderRadius: 19, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, backgroundColor: isDark ? "rgba(74,57,77,0.60)" : "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: isDark ? "rgba(146,119,200,0.40)" : colors.borderSubtle },
    premiumButtonText: { color: isDark ? "#F6E9EF" : "#221822", fontFamily: F.uiBold, fontSize: 11, lineHeight: 15 },
    logoutButton: { minHeight: 52, borderRadius: 26, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14, marginBottom: 40, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.28 : 0.08, shadowRadius: 22, elevation: 1 },
    logoutText: { color: colors.primaryCTA, fontFamily: F.uiBold, fontSize: 15, lineHeight: 19 },
    pressed: { transform: [{ scale: 0.97 }] }
  });
}
