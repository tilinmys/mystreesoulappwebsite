import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { useAuthStore } from "../../store/authStore";
import { useOnboardingStore } from "../../store/onboardingStore";

const avatarImage = require("../../public/images/bloop-welcome.webp");
const bloopImage = require("../../public/images/bloop-nav.webp");

const identityChips = [
  { label: "Cycle & Fertility", icon: "flower-tulip-outline", color: "#E07A5F" },
  { label: "Calm Energy", icon: "weather-night", color: "#BDB2FF" },
  { label: "Sleep Improving", icon: "moon-waning-crescent", color: "#6E86D8" },
  { label: "Wellness Focused", icon: "water-outline", color: "#81B29A" }
] as const;

const quickAccess = [
  { label: "Health Records", icon: "folder-heart-outline", color: "#E07A5F", route: "/settings" },
  { label: "Privacy & Security", icon: "shield-lock-outline", color: "#8B6FE8", route: "/settings" },
  { label: "Notifications", icon: "bell-outline", color: "#F4A261", route: "/notifications" },
  { label: "Saved Programs", icon: "book-heart-outline", color: "#E8795F", route: "/(tabs)/wellness" },
  { label: "Companion Settings", icon: "robot-happy-outline", color: "#9B7DEB", route: "/bloop" },
  { label: "Premium Access", icon: "crown-outline", color: "#D99235", route: "/premium" }
] as const;

const summary = [
  { label: "Emotional state", value: "Calm", icon: "heart", color: "#E66AA6", progress: 0.82 },
  { label: "Stress level", value: "Moderate", icon: "cloud-outline", color: "#8B6FE8", progress: 0.62 },
  { label: "Sleep rhythm", value: "Improving", icon: "moon-waning-crescent", color: "#5E7EEA", progress: 0.72 },
  { label: "Cycle rhythm", value: "Stable", icon: "flower-outline", color: "#E07A5F", progress: 0.76 }
] as const;

const supportItems = [
  { label: "Help & Support", icon: "headphones" },
  { label: "Emergency SOS", icon: "alarm-light-outline" },
  { label: "Care Team", icon: "account-heart-outline" }
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const storedName = useOnboardingStore((state) => state.name);
  const profileName = storedName?.trim() || "Priya Sharma";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.auraPeach} />
      <View style={styles.auraLavender} />
      <View style={styles.auraSage} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header onNotifications={() => router.push("/notifications")} onSettings={() => router.push("/settings")} />
        <HeroCard name={profileName} onEdit={() => router.push("/settings")} />
        <IdentityChips />
        <QuickAccessGrid onNavigate={(route) => router.push(route as never)} />
        <WellnessSummary />
        <SupportCard />
        <PremiumCard onPress={() => router.push("/premium")} />
        <LogoutButton onLogout={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onNotifications, onSettings }: { onNotifications: () => void; onSettings: () => void }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSub}>Your private wellness space</Text>
      </View>
      <View style={styles.headerActions}>
        <IconButton icon="settings-outline" onPress={onSettings} />
        <View>
          <IconButton icon="notifications-outline" onPress={onNotifications} />
          <View style={styles.unreadDot} />
        </View>
      </View>
    </View>
  );
}

function HeroCard({ name, onEdit }: { name: string; onEdit: () => void }) {
  return (
    <LinearGradient colors={["rgba(255,238,229,0.96)", "rgba(250,230,249,0.86)", "rgba(255,248,245,0.94)"]} style={styles.heroCard}>
      <View style={styles.heroMoon} />
      <View style={styles.sparkleOne} />
      <View style={styles.sparkleTwo} />
      <View style={styles.avatarWrap}>
        <View style={styles.avatarGlow} />
        <CachedImage priority="high" source={avatarImage} style={styles.avatar} />
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
          <Text style={styles.editText}>Edit Profile</Text>
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

function SupportCard() {
  return (
    <View style={styles.supportCard}>
      <View style={styles.supportHeader}>
        <View style={styles.supportTitleRow}>
          <MaterialCommunityIcons name="heart-outline" size={19} color={palette.peach} />
          <Text style={styles.supportTitle}>Support & care</Text>
        </View>
        <Text style={styles.supportSub}>We're here</Text>
      </View>
      <View style={styles.supportRow}>
        {supportItems.map((item) => (
          <Pressable key={item.label} style={({ pressed }) => [styles.supportItem, pressed && styles.pressed]}>
            <MaterialCommunityIcons name={item.icon} size={19} color={item.label.includes("SOS") ? palette.terracotta : palette.muted} />
            <Text ellipsizeMode="tail" numberOfLines={2} style={styles.supportText} textBreakStrategy="balanced">{item.label}</Text>
          </Pressable>
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

function PremiumCard({ onPress }: { onPress: () => void }) {
  return (
    <LinearGradient colors={["#CFA7FF", "#F4C4DE", "#FFE4D2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premiumCard}>
      <View style={styles.premiumLotus}>
        <MaterialCommunityIcons name="flower-tulip" size={31} color="#FFFFFF" />
      </View>
      <View style={styles.premiumCopy}>
        <Text style={styles.premiumTitle}>Mystii Premium</Text>
        <Text style={styles.premiumSub}>Unlock deeper emotional wellness support.</Text>
      </View>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.premiumButton, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="lock-outline" size={15} color={palette.deepCharcoal} />
        <Text style={styles.premiumButtonText}>Explore</Text>
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

function IconButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={22} color={palette.deepCharcoal} />
    </Pressable>
  );
}

const palette = {
  background: "#FFF8F5",
  deepCharcoal: "#2B2D42",
  muted: "#6B708D",
  terracotta: "#E07A5F",
  sage: "#81B29A",
  peach: "#F4A261",
  lavender: "#BDB2FF"
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  auraPeach: { position: "absolute", top: -80, right: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(244,162,97,0.18)" },
  auraLavender: { position: "absolute", top: 220, left: -110, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(189,178,255,0.18)" },
  auraSage: { position: "absolute", bottom: 120, right: -120, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(129,178,154,0.13)" },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 126, gap: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: palette.deepCharcoal, fontFamily: "serif", fontSize: 34, lineHeight: 39, fontWeight: "800" },
  headerSub: { color: palette.muted, fontSize: 13, lineHeight: 18, fontWeight: "700", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 12 },
  iconButton: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.66)", borderWidth: 1, borderColor: "rgba(255,255,255,0.86)", shadowColor: palette.deepCharcoal, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 3 },
  unreadDot: { position: "absolute", top: 7, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: palette.terracotta, borderWidth: 1, borderColor: "#FFFFFF" },
  heroCard: { minHeight: 174, borderRadius: 32, padding: 18, flexDirection: "row", alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.78)", shadowColor: palette.deepCharcoal, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.09, shadowRadius: 30, elevation: 5 },
  heroMoon: { position: "absolute", right: 30, top: 20, width: 40, height: 40, borderRadius: 20, borderRightWidth: 6, borderRightColor: "rgba(255,255,255,0.70)" },
  sparkleOne: { position: "absolute", right: 142, top: 28, width: 5, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.88)" },
  sparkleTwo: { position: "absolute", right: 88, bottom: 36, width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.90)" },
  avatarWrap: { width: 104, height: 104, alignItems: "center", justifyContent: "center" },
  avatarGlow: { position: "absolute", width: 104, height: 104, borderRadius: 52, backgroundColor: "rgba(255,255,255,0.70)" },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: "#FFFFFF" },
  privacyBadge: { position: "absolute", right: 1, bottom: 0, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.82)", borderWidth: 1, borderColor: "rgba(255,255,255,0.90)" },
  heroCopy: { flex: 1, paddingLeft: 14, paddingRight: 68 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  profileName: { flexShrink: 1, color: palette.deepCharcoal, fontFamily: "serif", fontSize: 23, lineHeight: 29, fontWeight: "800" },
  verifiedBadge: { width: 19, height: 19, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: palette.terracotta },
  profileSub: { color: palette.muted, fontSize: 12, lineHeight: 17, fontWeight: "800", marginTop: 4 },
  editButton: { alignSelf: "flex-start", minHeight: 38, borderRadius: 19, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 13, marginTop: 13, backgroundColor: "rgba(255,255,255,0.64)", borderWidth: 1, borderColor: "rgba(255,255,255,0.82)" },
  editText: { color: palette.deepCharcoal, fontSize: 12, lineHeight: 16, fontWeight: "900" },
  heroBloop: { position: "absolute", right: 15, bottom: 25, width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.36)" },
  heroBloopImage: { width: 52, height: 52 },
  chipRow: { gap: 10, paddingRight: 20 },
  identityChip: { minHeight: 40, borderRadius: 20, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.86)", shadowColor: palette.deepCharcoal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 2 },
  identityText: { color: palette.deepCharcoal, fontSize: 12, lineHeight: 16, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickCard: { width: "48%", minWidth: 0, minHeight: 86, borderRadius: 24, padding: 12, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(255,255,255,0.68)", borderWidth: 1, borderColor: "rgba(255,255,255,0.88)", shadowColor: palette.deepCharcoal, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.055, shadowRadius: 20, elevation: 3 },
  quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  quickLabel: { flex: 1, flexShrink: 1, minWidth: 0, color: palette.deepCharcoal, fontFamily: "serif", fontSize: 15, lineHeight: 18, fontWeight: "800" },
  summaryCard: { borderRadius: 28, padding: 17, backgroundColor: "rgba(255,255,255,0.68)", borderWidth: 1, borderColor: "rgba(255,255,255,0.88)", shadowColor: palette.deepCharcoal, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.055, shadowRadius: 20, elevation: 3 },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  summaryTitle: { color: palette.deepCharcoal, fontSize: 15, lineHeight: 19, fontWeight: "900" },
  summaryGrid: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  summaryItem: { width: "24%", minWidth: 0, alignItems: "center" },
  ringOuter: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  ringIcon: { position: "absolute" },
  summaryLabel: { color: palette.deepCharcoal, fontSize: 9, lineHeight: 11, fontWeight: "800", marginTop: 8, minHeight: 22, textAlign: "center", flexShrink: 1 },
  summaryValue: { fontSize: 10, lineHeight: 13, fontWeight: "900", marginTop: 3, maxWidth: "100%", textAlign: "center" },
  supportCard: { borderRadius: 26, padding: 16, backgroundColor: "rgba(255,255,255,0.62)", borderWidth: 1, borderColor: "rgba(255,255,255,0.84)" },
  supportHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  supportTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  supportTitle: { color: palette.deepCharcoal, fontFamily: "serif", fontSize: 19, lineHeight: 24, fontWeight: "800" },
  supportSub: { color: palette.muted, fontSize: 11, lineHeight: 14, fontWeight: "800" },
  supportRow: { flexDirection: "row", gap: 8 },
  supportItem: { flex: 1, minWidth: 0, minHeight: 50, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 5, backgroundColor: "rgba(255,255,255,0.56)" },
  supportText: { flex: 1, flexShrink: 1, minWidth: 0, color: palette.deepCharcoal, fontSize: 9, lineHeight: 12, fontWeight: "800", textAlign: "center" },
  premiumCard: { minHeight: 104, borderRadius: 28, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)", shadowColor: "#BDB2FF", shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 4 },
  premiumLotus: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.22)" },
  premiumCopy: { flex: 1 },
  premiumTitle: { color: palette.deepCharcoal, fontFamily: "serif", fontSize: 20, lineHeight: 25, fontWeight: "800" },
  premiumSub: { color: palette.deepCharcoal, opacity: 0.72, fontSize: 12, lineHeight: 17, fontWeight: "800", marginTop: 3 },
  premiumButton: { minHeight: 40, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, backgroundColor: "rgba(255,255,255,0.40)", borderWidth: 1, borderColor: "rgba(255,255,255,0.60)" },
  premiumButtonText: { color: palette.deepCharcoal, fontSize: 12, lineHeight: 16, fontWeight: "900" },
  logoutButton: { minHeight: 56, borderRadius: 28, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.66)", borderWidth: 1, borderColor: "rgba(255,255,255,0.88)", shadowColor: palette.deepCharcoal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  logoutText: { color: palette.terracotta, fontSize: 15, lineHeight: 19, fontWeight: "900" },
  pressed: { transform: [{ scale: 0.97 }] }
});
