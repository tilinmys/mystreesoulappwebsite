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

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useColorMode();
  const logout = useAuthStore((state) => state.logout);
  const storedName = useOnboardingStore((state) => state.name);
  const profileName = storedName?.trim() || "Priya Sharma";
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <LinearGradient colors={isDark ? ["#111827", "#231B2C"] : ["#FCF6F5", "#FFF0EA"]} style={styles.screenGradient}>
      <SafeAreaView edges={["top"]} style={[styles.screen, isDark && styles.screenDark]}>
        <View style={styles.auraPeach} />
        <View style={styles.auraLavender} />
        <View style={styles.auraSage} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never" style={styles.scrollView}>
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
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSubRow}>
          <Text style={styles.headerSub}>Your private wellness space</Text>
          <MaterialCommunityIcons name="heart-flash" size={15} color="#F0A699" />
        </View>
      </View>
      <View style={styles.headerActions}>
        <IconButton accessibilityLabel="Open settings" icon="settings-outline" onPress={onSettings} />
        <View>
          <IconButton accessibilityLabel="Open notifications" icon="notifications-outline" onPress={onNotifications} />
          <View style={styles.unreadDot} />
        </View>
      </View>
    </View>
  );
}

function HeroCard({ name, onEdit }: { name: string; onEdit: () => void }) {
  return (
    <LinearGradient colors={["#FFEDE9", "#FCE3F0", "#E9DEFA"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroCard}>
      <View style={styles.heroMoon} />
      <View style={styles.sparkleOne} />
      <View style={styles.sparkleTwo} />
      <View style={styles.avatarWrap}>
        <View style={styles.avatarGlow} />
        <CachedImage priority="high" source={profileAvatar} style={styles.avatar} contentFit="cover" />
        <View style={styles.privacyBadge}>
          <MaterialCommunityIcons name="flower-tulip" size={18} color="#E07A5F" />
        </View>
      </View>

      <View style={styles.heroCopy}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={styles.profileName}>{name}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.profileSub}>Your private wellness space</Text>
        <Pressable onPress={onEdit} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="pencil-outline" size={15} color={palette.terracotta} />
          <Text style={styles.editText}>Edit profile</Text>
          <Ionicons name="chevron-forward" size={14} color={palette.terracotta} />
        </Pressable>
      </View>

      <View style={styles.heroBloop}>
        <CachedImage priority="high" source={bloopImage} style={styles.heroBloopImage} />
      </View>
    </LinearGradient>
  );
}

function IdentityChips() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {identityChips.map((chip) => (
        <View key={chip.label} style={styles.identityChip}>
          <MaterialCommunityIcons name={chip.icon} size={17} color={chip.color} />
          <Text style={styles.identityText}>{chip.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function QuickAccessGrid({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <View style={styles.grid}>
      {quickAccess.map((item) => (
        <Pressable key={item.label} onPress={() => onNavigate(item.route)} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
          <View style={[styles.quickIcon, { backgroundColor: `${item.color}1A` }]}>
            <MaterialCommunityIcons name={item.icon} size={25} color={item.color} />
          </View>
          <Text ellipsizeMode="tail" numberOfLines={2} style={styles.quickLabel} textBreakStrategy="balanced">{item.label}</Text>
          <Ionicons name="chevron-forward" size={17} color={palette.muted} />
        </Pressable>
      ))}
    </View>
  );
}

function WellnessSummary() {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <MaterialCommunityIcons name="star-four-points-outline" size={18} color={palette.peach} />
        <Text style={styles.summaryTitle}>Your wellness summary</Text>
      </View>
      <View style={styles.summaryGrid}>
        {summary.map((item) => (
          <View key={item.label} style={styles.summaryItem}>
            <ProgressRing color={item.color} icon={item.icon} progress={item.progress} />
            <Text ellipsizeMode="tail" numberOfLines={2} style={styles.summaryLabel} textBreakStrategy="balanced">{item.label}</Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
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
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.ringOuter}>
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
      <MaterialCommunityIcons name={icon} size={22} color={color} style={styles.ringIcon} />
    </View>
  );
}

function ThemeCard() {
  const colorMode = useThemeStore((s) => s.colorMode);
  const setColorMode = useThemeStore((s) => s.setColorMode);

  const options: Array<{ id: ColorMode; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = [
    { id: "light",  label: "Light",  icon: "white-balance-sunny", color: "#F4A261" },
    { id: "dark",   label: "Dark",   icon: "moon-waning-crescent", color: "#6E86D8" },
    { id: "system", label: "Auto",   icon: "theme-light-dark", color: "#9277C8" },
  ];

  return (
    <View style={styles.themeCard}>
      <View style={styles.themeHeaderRow}>
        <MaterialCommunityIcons name="palette-outline" size={18} color={palette.lavender} />
        <View style={styles.themeHeaderCopy}>
          <Text style={styles.themeTitle}>Appearance</Text>
          <Text style={styles.themeSub}>Pick how MyStree feels on your screen.</Text>
        </View>
      </View>
      <View style={styles.themeRow}>
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
                styles.themeOption,
                active && [styles.themeOptionActive, { borderColor: opt.color, backgroundColor: `${opt.color}14` }],
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.themeIconBubble, { backgroundColor: active ? `${opt.color}26` : "rgba(255,255,255,0.78)" }]}>
                <MaterialCommunityIcons name={opt.icon} size={20} color={opt.color} />
              </View>
              <Text style={[styles.themeOptionLabel, active && { color: opt.color }]}>{opt.label}</Text>
              {active ? (
                <View style={[styles.themeCheck, { backgroundColor: opt.color }]}>
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
  return (
    <LinearGradient colors={["#D4C4F8", "#F3CCEB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premiumCard}>
      <View style={styles.premiumLotus}>
        <CachedImage source={premiumLotus} style={styles.premiumLotusImage} contentFit="cover" />
      </View>
      <View style={styles.premiumCopy}>
        <Text style={styles.premiumTitle}>Soul Premium</Text>
        <Text style={styles.premiumSub}>Gentler guidance, deeper rituals, and care that follows your rhythm.</Text>
      </View>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.premiumButton, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="lock-outline" size={15} color={palette.deepCharcoal} />
        <Text style={styles.premiumButtonText}>Explore Soul</Text>
        <Ionicons name="chevron-forward" size={14} color={palette.deepCharcoal} />
      </Pressable>
    </LinearGradient>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <Pressable onPress={onLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
      <MaterialCommunityIcons name="logout" size={20} color={palette.terracotta} />
      <Text style={styles.logoutText}>Log Out</Text>
    </Pressable>
  );
}

function IconButton({ accessibilityLabel, icon, onPress }: { accessibilityLabel: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={22} color={palette.deepCharcoal} />
    </Pressable>
  );
}

const palette = {
  background: "#FCF6F5",
  deepCharcoal: "#2B2D42",
  ink: "#1A1F36",
  muted: "#6B708D",
  softMuted: "#8E8A95",
  terracotta: "#E07A5F",
  sage: "#81B29A",
  peach: "#F4A261",
  lavender: "#BDB2FF",
  warmShadow: "#D6C3B9"
};

const styles = StyleSheet.create({
  screenGradient: { flex: 1 },
  screen: { flex: 1, backgroundColor: "transparent" },
  screenDark: { backgroundColor: "transparent" },
  scrollView: { flex: 1, backgroundColor: "transparent" },
  auraPeach: { position: "absolute", top: -80, right: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(244,162,97,0.18)" },
  auraLavender: { position: "absolute", top: 220, left: -110, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(189,178,255,0.18)" },
  auraSage: { position: "absolute", bottom: 120, right: -120, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(129,178,154,0.13)" },
  content: { paddingHorizontal: SIDE, paddingTop: 8, paddingBottom: 28, gap: 10, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  headerTitle: { color: palette.ink, fontFamily: F.luxuryExtraBold, fontSize: 34, lineHeight: 38 },
  headerSubRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  headerSub: { color: palette.softMuted, fontFamily: F.uiRegular, fontSize: 14, lineHeight: 19 },
  headerActions: { flexDirection: "row", gap: 11 },
  iconButton: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", shadowColor: palette.warmShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 2 },
  unreadDot: { position: "absolute", top: 7, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: palette.terracotta, borderWidth: 1, borderColor: "#FFFFFF" },
  heroCard: { minHeight: 154, borderRadius: 30, padding: 15, flexDirection: "row", alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.68)", shadowColor: palette.warmShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 3 },
  heroMoon: { position: "absolute", right: 30, top: 20, width: 40, height: 40, borderRadius: 20, borderRightWidth: 6, borderRightColor: "rgba(255,255,255,0.70)" },
  sparkleOne: { position: "absolute", right: 142, top: 28, width: 5, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.88)" },
  sparkleTwo: { position: "absolute", right: 88, bottom: 36, width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.90)" },
  avatarWrap: { width: 92, height: 92, alignItems: "center", justifyContent: "center" },
  avatarGlow: { position: "absolute", width: 92, height: 92, borderRadius: 46, backgroundColor: "rgba(255,255,255,0.72)" },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#FFFFFF" },
  privacyBadge: { position: "absolute", right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.82)", borderWidth: 1, borderColor: "rgba(255,255,255,0.90)" },
  heroCopy: { flex: 1, minWidth: 0, paddingLeft: 13, paddingRight: 88 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  profileName: { flexShrink: 1, color: palette.ink, fontFamily: F.luxuryBold, fontSize: 21, lineHeight: 27 },
  verifiedBadge: { width: 19, height: 19, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: palette.terracotta },
  profileSub: { color: palette.softMuted, fontFamily: F.uiMedium, fontSize: 12, lineHeight: 17, marginTop: 4 },
  editButton: { alignSelf: "flex-start", minHeight: 34, borderRadius: 17, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, marginTop: 11, backgroundColor: "rgba(255,255,255,0.64)", borderWidth: 1, borderColor: "rgba(255,255,255,0.82)" },
  editText: { color: palette.ink, fontFamily: F.uiBold, fontSize: 12, lineHeight: 16 },
  heroBloop: { position: "absolute", right: 9, bottom: 14, width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.20)" },
  heroBloopImage: { width: 92, height: 92 },
  chipRow: { gap: 8, paddingRight: 20 },
  identityChip: { minHeight: 34, borderRadius: 17, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", shadowColor: palette.warmShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 2 },
  identityText: { color: palette.ink, fontFamily: F.uiSemiBold, fontSize: 11, lineHeight: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
  quickCard: { width: QUICK_CARD_W, minWidth: 0, minHeight: 70, borderRadius: 20, padding: 11, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", shadowColor: palette.warmShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 2 },
  quickIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  quickLabel: { flex: 1, flexShrink: 1, minWidth: 0, color: palette.ink, fontFamily: F.luxuryBold, fontSize: 13, lineHeight: 16 },
  summaryCard: { borderRadius: 26, padding: 15, backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", shadowColor: palette.warmShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 2 },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  summaryTitle: { color: palette.ink, fontFamily: F.luxuryBold, fontSize: 16, lineHeight: 21 },
  summaryGrid: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  summaryItem: { width: "24%", minWidth: 0, alignItems: "center" },
  ringOuter: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  ringIcon: { position: "absolute" },
  summaryLabel: { color: palette.ink, fontFamily: F.uiSemiBold, fontSize: 9.5, lineHeight: 12, marginTop: 6, minHeight: 24, textAlign: "center", flexShrink: 1 },
  summaryValue: { fontFamily: F.uiBold, fontSize: 10, lineHeight: 13, marginTop: 3, maxWidth: "100%", textAlign: "center" },
  themeCard: { borderRadius: 26, padding: 16, backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", shadowColor: palette.warmShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 2, gap: 14 },
  themeHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  themeHeaderCopy: { flex: 1 },
  themeTitle: { color: palette.ink, fontFamily: F.luxuryBold, fontSize: 15, lineHeight: 20 },
  themeSub: { color: palette.muted, fontFamily: F.uiMedium, fontSize: 11.5, lineHeight: 15, marginTop: 2 },
  themeRow: { flexDirection: "row", gap: 10 },
  themeOption: { flex: 1, minHeight: 92, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.62)", borderWidth: 1.5, borderColor: "rgba(232,225,230,0.70)" },
  themeOptionActive: { borderWidth: 1.5 },
  themeIconBubble: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  themeOptionLabel: { color: palette.ink, fontFamily: F.uiBold, fontSize: 12, lineHeight: 16 },
  themeCheck: { position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  premiumCard: { minHeight: 96, borderRadius: 26, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", shadowColor: "#D6C3B9", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 2 },
  premiumLotus: { width: 56, height: 56, borderRadius: 28, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
  premiumLotusImage: { width: 56, height: 56 },
  premiumCopy: { flex: 1 },
  premiumTitle: { color: palette.ink, fontFamily: F.luxuryBold, fontSize: 19, lineHeight: 24 },
  premiumSub: { color: palette.ink, opacity: 0.72, fontFamily: F.uiSemiBold, fontSize: 11, lineHeight: 15, marginTop: 2 },
  premiumButton: { minHeight: 38, borderRadius: 19, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, backgroundColor: "rgba(255,255,255,0.40)", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)" },
  premiumButtonText: { color: palette.ink, fontFamily: F.uiBold, fontSize: 11, lineHeight: 15 },
  logoutButton: { minHeight: 52, borderRadius: 26, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.86)", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", shadowColor: palette.warmShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 22, elevation: 1 },
  logoutText: { color: palette.terracotta, fontFamily: F.uiBold, fontSize: 15, lineHeight: 19 },
  pressed: { transform: [{ scale: 0.97 }] }
});
