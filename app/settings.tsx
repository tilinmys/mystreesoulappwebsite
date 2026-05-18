import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../components/CachedImage";
import { ContextualAuraBackground } from "../components/ContextualAuraBackground";
import { F } from "../constants/fonts";
import { useAuthStore } from "../store/authStore";
import { useSafeBack } from "../hooks/useSafeBack";

const bloop = require("../public/images/bloop-nav.webp");

const privacyItems = [
  { title: "Health Export", subtitle: "Create a private wellness archive", icon: "file-export-outline" },
  { title: "Emergency Contacts", subtitle: "Trusted contacts only", icon: "account-heart-outline" },
  { title: "App Lock", subtitle: "Secure MyStree Soul instantly", icon: "lock-outline" },
  { title: "Data Privacy", subtitle: "View how MyStree protects you", icon: "shield-check-outline" }
] as const;

const accountItems = [
  { title: "Reminder Preferences", subtitle: "Gentle nudges, never pressure", icon: "bell-outline" },
  { title: "Aura Theme", subtitle: "Warm glass hormone intelligence", icon: "palette-outline" },
  { title: "Bloop Memory", subtitle: "Personalized, private guidance", icon: "brain" }
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const logout = useAuthStore((state) => state.logout);
  const pulse = useRef(new Animated.Value(0)).current;
  const [biometricKey, setBiometricKey] = useState(true);
  const [localMode, setLocalMode] = useState(false);
  const [bloopGuard, setBloopGuard] = useState(true);
  const [selectedLock, setSelectedLock] = useState<"Immediate" | "1 min" | "5 min">("Immediate");
  const [selectedCard, setSelectedCard] = useState("Data Privacy");

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2600, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const orbScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <SafeAreaView style={styles.screen}>
      <ContextualAuraBackground variant="vault" />
      <ScrollView bounces={false} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header onBack={safeBack} />
        <VaultHero orbScale={orbScale} />
        <SettingsIsland title="Access & Identity">
          <ToggleRow
            active={biometricKey}
            icon="fingerprint"
            onToggle={setBiometricKey}
            subtitle="Face ID or device biometrics required for entry"
            title="Biometric Key"
          />
          <Divider />
          <SegmentRow selectedLock={selectedLock} onSelect={setSelectedLock} />
        </SettingsIsland>

        <SettingsIsland title="Data Boundaries">
          <ToggleRow
            active={localMode}
            icon="cloud-off-outline"
            onToggle={setLocalMode}
            subtitle="Pause cloud synchronization for sensitive moments"
            title="Local Island Mode"
          />
          <Divider />
          <ToggleRow
            active={bloopGuard}
            icon="robot-happy-outline"
            onToggle={setBloopGuard}
            subtitle="Allow Bloop to protect private wellness context"
            title="Bloop Guard"
          />
        </SettingsIsland>

        <SettingsIsland title="Privacy & Safety">
          <View style={styles.cardGrid}>
            {privacyItems.map((item) => (
              <Pressable key={item.title} onPress={() => setSelectedCard(item.title)} style={({ pressed }) => [styles.smallCard, selectedCard === item.title && styles.smallCardActive, pressed && styles.pressed]}>
                <View style={styles.smallIcon}>
                  <MaterialCommunityIcons name={item.icon} size={21} color={palette.sage} />
                </View>
                <Text style={styles.smallTitle}>{item.title}</Text>
                <Text style={styles.smallSub}>{item.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </SettingsIsland>

        <SettingsIsland title="Personal Wellness Space">
          {accountItems.map((item) => (
            <Pressable key={item.title} onPress={() => setSelectedCard(item.title)} style={({ pressed }) => [styles.linkRow, selectedCard === item.title && styles.linkRowActive, pressed && styles.pressed]}>
              <View style={styles.linkIcon}>
                <MaterialCommunityIcons name={item.icon} size={21} color={palette.terracotta} />
              </View>
              <View style={styles.linkCopy}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.muted} />
            </Pressable>
          ))}
        </SettingsIsland>

        <BloopTrustCard orbScale={orbScale} />
        <Pressable
          onPress={() => {
            logout();
            router.replace("/login");
          }}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="logout" size={18} color={palette.terracotta} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={22} color={palette.text} />
      </Pressable>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Privacy Vault</Text>
        <Text style={styles.headerSub}>Privacy, identity, and trust.</Text>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function VaultHero({ orbScale }: { orbScale: Animated.AnimatedInterpolation<string | number> }) {
  return (
    <LinearGradient colors={["#101728", "#1D2435", "#2B2D42"]} style={styles.heroCard}>
      <View style={styles.heroGlow} />
      <View style={styles.heroGlyph}>
        <MaterialCommunityIcons name="shield-lock-outline" size={30} color="#FFFFFF" />
      </View>
      <View style={styles.heroCopy}>
        <Text style={styles.heroKicker}>Private by design</Text>
        <Text style={styles.heroTitle}>Your wellness data belongs to you.</Text>
        <Text style={styles.heroSub}>Encrypted, guarded, and designed to stay invisible to the outside world.</Text>
      </View>
      <Animated.View style={[styles.heroOrb, { transform: [{ scale: orbScale }] }]}>
        <CachedImage source={bloop} style={styles.heroBloop} />
      </Animated.View>
    </LinearGradient>
  );
}

function SettingsIsland({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.islandBlock}>
      <Text style={styles.islandTitle}>{title}</Text>
      <View style={styles.island}>{children}</View>
    </View>
  );
}

function ToggleRow({
  active,
  icon,
  onToggle,
  subtitle,
  title
}: {
  active: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onToggle: (value: boolean) => void;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={icon} size={21} color={active ? palette.terracotta : palette.muted} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Switch
        ios_backgroundColor="rgba(107,112,141,0.20)"
        onValueChange={onToggle}
        thumbColor="#FFFFFF"
        trackColor={{ false: "rgba(107,112,141,0.20)", true: "rgba(224,122,95,0.70)" }}
        value={active}
      />
    </View>
  );
}

function SegmentRow({
  onSelect,
  selectedLock
}: {
  onSelect: (value: "Immediate" | "1 min" | "5 min") => void;
  selectedLock: "Immediate" | "1 min" | "5 min";
}) {
  const options = ["Immediate", "1 min", "5 min"] as const;
  return (
    <View style={styles.segmentBlock}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name="timer-lock-outline" size={21} color={palette.muted} />
      </View>
      <View style={styles.segmentCopy}>
        <Text style={styles.rowTitle}>Aura Fade Auto-Lock</Text>
        <Text style={styles.rowSub}>Lock timing after app exit</Text>
        <View style={styles.segmented}>
          {options.map((option) => (
            <Pressable key={option} onPress={() => onSelect(option)} style={[styles.segmentOption, selectedLock === option && styles.segmentOptionActive]}>
              <Text style={[styles.segmentText, selectedLock === option && styles.segmentTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function BloopTrustCard({ orbScale }: { orbScale: Animated.AnimatedInterpolation<string | number> }) {
  return (
    <View style={styles.bloopTrustCard}>
      <View style={styles.bloopTrustGlow} />
      <Animated.View style={[styles.trustOrb, { transform: [{ scale: orbScale }] }]}>
        <CachedImage source={bloop} style={styles.trustBloop} />
      </Animated.View>
      <View style={styles.trustCopy}>
        <Text style={styles.trustTitle}>Bloop is guarding your vault.</Text>
        <Text style={styles.trustSub}>Your MyStree Soul data is mathematically safe and visible only to you.</Text>
      </View>
    </View>
  );
}

function FloatingNav({
  onBloop,
  onDashboard,
  onInsights,
  onProfile,
  onWellness
}: {
  onBloop: () => void;
  onDashboard: () => void;
  onInsights: () => void;
  onProfile: () => void;
  onWellness: () => void;
}) {
  return (
    <View style={styles.navWrap}>
      <View style={styles.navBar}>
        <Pressable onPress={onDashboard} style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="home-variant" size={23} color={palette.muted} />
        </Pressable>
        <Pressable onPress={onWellness} style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="spa-outline" size={23} color={palette.muted} />
        </Pressable>
        <Pressable onPress={onBloop} style={({ pressed }) => [styles.aiButtonShell, pressed && styles.pressed]}>
          <LinearGradient colors={["#2B2D42", "#1B1D2B"]} style={styles.aiButton}>
            <CachedImage source={bloop} style={styles.aiButtonImage} />
          </LinearGradient>
        </Pressable>
        <Pressable onPress={onInsights} style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="chart-donut" size={23} color={palette.muted} />
        </Pressable>
        <Pressable onPress={onProfile} style={({ pressed }) => [styles.navButton, styles.navButtonActive, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="shield-check-outline" size={23} color={palette.terracotta} />
          <View style={styles.navActiveDot} />
        </Pressable>
      </View>
    </View>
  );
}

const palette = {
  background: "#FAF9F6",
  text: "#2B2D42",
  muted: "#6B708D",
  terracotta: "#E07A5F",
  sage: "#81B29A",
  peach: "#F4A261",
  lavender: "#BDB2FF"
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 132, gap: 24 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(250,249,246,0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.82)" },
  headerCopy: { flex: 1, alignItems: "center" },
  headerTitle: { color: palette.text, fontFamily: F.luxuryBold, fontSize: 22, lineHeight: 27 },
  headerSub: { color: palette.muted, fontSize: 12, lineHeight: 16, fontWeight: "700", marginTop: 2 },
  headerSpacer: { width: 44, height: 44 },
  heroCard: { minHeight: 232, borderRadius: 32, padding: 24, overflow: "hidden", justifyContent: "flex-end", shadowColor: palette.text, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 7 },
  heroGlow: { position: "absolute", right: -46, top: -50, width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(189,178,255,0.22)" },
  heroGlyph: { position: "absolute", top: 22, left: 22, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  heroCopy: { maxWidth: 286 },
  heroKicker: { color: palette.lavender, fontSize: 11, lineHeight: 15, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  heroTitle: { color: "#FFFFFF", fontFamily: F.luxuryBold, fontSize: 25, lineHeight: 31, marginTop: 10 },
  heroSub: { color: "rgba(250,249,246,0.70)", fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 10 },
  heroOrb: { position: "absolute", right: 22, top: 22, width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  heroBloop: { width: 48, height: 48 },
  islandBlock: { gap: 10 },
  islandTitle: { color: palette.muted, fontSize: 11, lineHeight: 15, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase", paddingHorizontal: 4 },
  island: { borderRadius: 30, padding: 14, backgroundColor: "rgba(250,249,246,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.82)", shadowColor: palette.text, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 3 },
  settingRow: { minHeight: 74, flexDirection: "row", alignItems: "center", gap: 12, padding: 8 },
  rowIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.58)" },
  rowCopy: { flex: 1 },
  rowTitle: { color: palette.text, fontSize: 14, lineHeight: 18, fontWeight: "900" },
  rowSub: { color: palette.muted, fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 4 },
  divider: { height: 1, marginHorizontal: 18, backgroundColor: "rgba(107,112,141,0.10)" },
  segmentBlock: { flexDirection: "row", gap: 12, padding: 8 },
  segmentCopy: { flex: 1 },
  segmented: { marginTop: 12, minHeight: 42, borderRadius: 21, padding: 4, flexDirection: "row", backgroundColor: "rgba(107,112,141,0.09)" },
  segmentOption: { flex: 1, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  segmentOptionActive: { backgroundColor: "#FFFFFF" },
  segmentText: { color: palette.muted, fontSize: 11, lineHeight: 15, fontWeight: "900" },
  segmentTextActive: { color: palette.terracotta },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  smallCard: { width: "48%", minHeight: 126, borderRadius: 24, padding: 14, justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.48)", borderWidth: 1, borderColor: "rgba(255,255,255,0.64)" },
  smallCardActive: { backgroundColor: "rgba(189,178,255,0.16)", borderColor: "rgba(189,178,255,0.40)" },
  smallIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(129,178,154,0.14)" },
  smallTitle: { color: palette.text, fontSize: 13, lineHeight: 17, fontWeight: "900", marginTop: 10 },
  smallSub: { color: palette.muted, fontSize: 11, lineHeight: 16, fontWeight: "700", marginTop: 4 },
  linkRow: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: 12, padding: 8, borderRadius: 22 },
  linkRowActive: { backgroundColor: "rgba(224,122,95,0.08)" },
  linkIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(224,122,95,0.12)" },
  linkCopy: { flex: 1 },
  bloopTrustCard: { minHeight: 108, borderRadius: 28, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, overflow: "hidden", backgroundColor: "rgba(250,249,246,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.82)" },
  bloopTrustGlow: { position: "absolute", right: -34, top: -22, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(244,162,97,0.20)" },
  trustOrb: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.62)" },
  trustBloop: { width: 42, height: 42 },
  trustCopy: { flex: 1 },
  trustTitle: { color: palette.text, fontSize: 14, lineHeight: 18, fontWeight: "900" },
  trustSub: { color: palette.muted, fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 5 },
  navWrap: { position: "absolute", left: 24, right: 24, bottom: 24 },
  navBar: { height: 78, borderRadius: 39, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(250,249,246,0.80)", borderWidth: 1, borderColor: "rgba(255,255,255,0.86)", shadowColor: palette.text, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 7 },
  navButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  navButtonActive: { backgroundColor: "rgba(224,122,95,0.14)" },
  navActiveDot: { position: "absolute", bottom: 5, width: 4, height: 4, borderRadius: 2, backgroundColor: palette.terracotta },
  aiButtonShell: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", shadowColor: palette.text, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 20, elevation: 8 },
  aiButton: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  aiButtonImage: { width: 40, height: 40 },
  pressed: { transform: [{ scale: 0.96 }] },
  logoutButton: {
    minHeight: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(224,122,95,0.10)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.20)"
  },
  logoutText: {
    color: palette.terracotta,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  }
});
