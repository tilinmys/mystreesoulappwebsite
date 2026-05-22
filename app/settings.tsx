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
import { useThemeStore, type ColorMode } from "../store/themeStore";
import { useColorMode } from "../hooks/useColorMode";
import { darkColors, type AppColors } from "../constants/colors";

const bloop = require("../public/images/bloop-nav.webp");

const privacyItems = [
  { title: "Health Export", subtitle: "Create a private wellness archive", icon: "file-export-outline" },
  { title: "Emergency Contacts", subtitle: "Trusted contacts only", icon: "shield-account-outline" },
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
  const colorMode = useThemeStore((state) => state.colorMode);
  const setColorMode = useThemeStore((state) => state.setColorMode);
  const pulse = useRef(new Animated.Value(0)).current;
  const [biometricKey, setBiometricKey] = useState(true);
  const [localMode, setLocalMode] = useState(false);
  const [bloopGuard, setBloopGuard] = useState(true);
  const [selectedLock, setSelectedLock] = useState<"Immediate" | "1 min" | "5 min">("Immediate");
  const [selectedCard, setSelectedCard] = useState("Data Privacy");

  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);

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
    <SafeAreaView style={s.screen}>
      <ContextualAuraBackground variant="vault" forceDark />
      <ScrollView bounces={false} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
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
          <View style={s.cardGrid}>
            {privacyItems.map((item) => {
              const active = selectedCard === item.title;
              return (
                <Pressable
                  key={item.title}
                  onPress={() => setSelectedCard(item.title)}
                  style={({ pressed }) => [
                    s.smallCard,
                    active && s.smallCardActive,
                    pressed && s.pressed
                  ]}
                >
                  <View style={[s.smallIcon, { backgroundColor: active ? (isDark ? "rgba(232, 166, 182, 0.12)" : "rgba(196,104,128,0.12)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") }]}>
                    <MaterialCommunityIcons name={item.icon} size={21} color={active ? colors.primaryCTA : colors.textMuted} />
                  </View>
                  <Text style={s.smallTitle}>{item.title}</Text>
                  <Text style={s.smallSub}>{item.subtitle}</Text>
                </Pressable>
              );
            })}
          </View>
        </SettingsIsland>

        <SettingsIsland title="Personal Wellness Space">
          {accountItems.map((item) => {
            const active = selectedCard === item.title;
            return (
              <Pressable
                key={item.title}
                onPress={() => setSelectedCard(item.title)}
                style={({ pressed }) => [
                  s.linkRow,
                  active && s.linkRowActive,
                  pressed && s.pressed
                ]}
              >
                <View style={[s.linkIcon, { backgroundColor: active ? (isDark ? "rgba(232, 166, 182, 0.12)" : "rgba(196,104,128,0.12)") : (isDark ? "rgba(224,122,95,0.12)" : "rgba(0,0,0,0.05)") }]}>
                  <MaterialCommunityIcons name={item.icon} size={21} color={active ? colors.primaryCTA : colors.textMuted} />
                </View>
                <View style={s.linkCopy}>
                  <Text style={s.rowTitle}>{item.title}</Text>
                  <Text style={s.rowSub}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </SettingsIsland>

        <SettingsIsland title="Appearance">
          <AppearanceRow colorMode={colorMode} onSelect={setColorMode} />
        </SettingsIsland>

        <BloopTrustCard orbScale={orbScale} />
        <Pressable
          onPress={() => {
            logout();
            router.replace("/login");
          }}
          style={({ pressed }) => [s.logoutButton, pressed && s.pressed]}
        >
          <MaterialCommunityIcons name="logout" size={18} color={colors.primaryCTA} />
          <Text style={s.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);
  return (
    <View style={s.header}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
      </Pressable>
      <View style={s.headerCopy}>
        <Text style={s.headerTitle}>Privacy Vault</Text>
        <Text style={s.headerSub}>Privacy, identity, and trust.</Text>
      </View>
      <View style={s.headerSpacer} />
    </View>
  );
}

function VaultHero({ orbScale }: { orbScale: Animated.AnimatedInterpolation<string | number> }) {
  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);
  return (
    <LinearGradient
      colors={isDark ? ["#1D121F", "#2F1C33", "#110812"] : ["#EAD8F4", "#F0E8F8", "#FAF5FC"]}
      style={s.heroCard}
    >
      <View style={s.heroGlow} />
      <View style={s.heroGlyph}>
        <MaterialCommunityIcons name="shield-lock-outline" size={30} color={isDark ? colors.primaryCTA : colors.textPrimary} />
      </View>
      <View style={s.heroCopy}>
        <Text style={s.heroKicker}>Private by design</Text>
        <Text style={s.heroTitle}>Your wellness data belongs to you.</Text>
        <Text style={s.heroSub}>Encrypted, guarded, and designed to stay invisible to the outside world.</Text>
      </View>
      <Animated.View style={[s.heroOrb, { transform: [{ scale: orbScale }] }]}>
        <CachedImage source={bloop} style={s.heroBloop} />
      </Animated.View>
    </LinearGradient>
  );
}

function SettingsIsland({ children, title }: { children: ReactNode; title: string }) {
  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);
  return (
    <View style={s.islandBlock}>
      <Text style={s.islandTitle}>{title}</Text>
      <View style={s.island}>{children}</View>
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
  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);
  return (
    <View style={s.settingRow}>
      <View style={[s.rowIcon, { backgroundColor: active ? (isDark ? "rgba(232, 166, 182, 0.12)" : "rgba(196,104,128,0.12)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") }]}>
        <MaterialCommunityIcons name={icon} size={21} color={active ? colors.primaryCTA : colors.textMuted} />
      </View>
      <View style={s.rowCopy}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      <Switch
        ios_backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
        onValueChange={onToggle}
        thumbColor="#FFFFFF"
        trackColor={{ false: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", true: colors.primaryCTA }}
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
  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);
  const options = ["Immediate", "1 min", "5 min"] as const;
  return (
    <View style={s.segmentBlock}>
      <View style={[s.rowIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}>
        <MaterialCommunityIcons name="timer-lock-outline" size={21} color={colors.textMuted} />
      </View>
      <View style={s.segmentCopy}>
        <Text style={s.rowTitle}>Aura Fade Auto-Lock</Text>
        <Text style={s.rowSub}>Lock timing after app exit</Text>
        <View style={s.segmented}>
          {options.map((option) => {
            const active = selectedLock === option;
            return (
              <Pressable
                key={option}
                onPress={() => onSelect(option)}
                style={[s.segmentOption, active && s.segmentOptionActive]}
              >
                <Text style={[s.segmentText, active && s.segmentTextActive]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function Divider() {
  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);
  return <View style={s.divider} />;
}

function BloopTrustCard({ orbScale }: { orbScale: Animated.AnimatedInterpolation<string | number> }) {
  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);
  return (
    <View style={s.bloopTrustCard}>
      <View style={s.bloopTrustGlow} />
      <Animated.View style={[s.trustOrb, { transform: [{ scale: orbScale }] }]}>
        <CachedImage source={bloop} style={s.trustBloop} />
      </Animated.View>
      <View style={s.trustCopy}>
        <Text style={s.trustTitle}>Bloop is guarding your vault.</Text>
        <Text style={s.trustSub}>Your MyStree Soul data is mathematically safe and visible only to you.</Text>
      </View>
    </View>
  );
}

function AppearanceRow({
  colorMode,
  onSelect
}: {
  colorMode: ColorMode;
  onSelect: (mode: ColorMode) => void;
}) {
  const colors = darkColors;
  const isDark = true;
  const s = getStyles(colors, isDark);
  const options: { label: string; value: ColorMode; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { label: "Light", value: "light", icon: "white-balance-sunny" },
    { label: "System", value: "system", icon: "theme-light-dark" },
    { label: "Dark", value: "dark", icon: "moon-waning-crescent" },
  ];
  return (
    <View style={s.appearanceRow}>
      <View style={[s.rowIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}>
        <MaterialCommunityIcons
          name={colorMode === "dark" ? "moon-waning-crescent" : colorMode === "light" ? "white-balance-sunny" : "theme-light-dark"}
          size={21}
          color={colors.primaryCTA}
        />
      </View>
      <View style={s.appearanceCopy}>
        <Text style={s.rowTitle}>App Theme</Text>
        <Text style={s.rowSub}>Choose how MyStree Soul looks</Text>
        <View style={s.themeSegment}>
          {options.map((opt) => {
            const active = colorMode === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                style={[s.themeOption, active && s.themeOptionActive]}
              >
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={15}
                  color={active ? colors.primaryCTA : colors.textMuted}
                />
                <Text style={[s.themeOptionText, active && s.themeOptionTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function getStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 14,
      paddingBottom: 132,
      gap: 24,
    },
    header: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(46, 35, 48, 0.50)" : "rgba(250,249,246,0.78)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255,255,255,0.82)",
      shadowColor: isDark ? "#000" : colors.textMuted,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.20 : 0.08,
      shadowRadius: 10,
      elevation: 2,
    },
    headerCopy: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      color: colors.textPrimary,
      fontFamily: F.luxuryBold,
      fontSize: 22,
      lineHeight: 27,
    },
    headerSub: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
      marginTop: 2,
    },
    headerSpacer: {
      width: 44,
      height: 44,
    },
    heroCard: {
      minHeight: 232,
      borderRadius: 32,
      padding: 24,
      overflow: "hidden",
      justifyContent: "flex-end",
      shadowColor: isDark ? "#000" : colors.textPrimary,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: isDark ? 0.30 : 0.18,
      shadowRadius: 30,
      elevation: 7,
    },
    heroGlow: {
      position: "absolute",
      right: -46,
      top: -50,
      width: 170,
      height: 170,
      borderRadius: 85,
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.12)" : "rgba(189,178,255,0.22)",
    },
    heroGlyph: {
      position: "absolute",
      top: 22,
      left: 22,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255,255,255,0.14)",
    },
    heroCopy: {
      maxWidth: 286,
    },
    heroKicker: {
      color: colors.primaryCTA,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "900",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    heroTitle: {
      color: "#FFFFFF",
      fontFamily: F.luxuryBold,
      fontSize: 25,
      lineHeight: 31,
      marginTop: 10,
    },
    heroSub: {
      color: "rgba(250,249,246,0.70)",
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
      marginTop: 10,
    },
    heroOrb: {
      position: "absolute",
      right: 22,
      top: 22,
      width: 62,
      height: 62,
      borderRadius: 31,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255,255,255,0.12)",
    },
    heroBloop: {
      width: 48,
      height: 48,
    },
    islandBlock: {
      gap: 10,
    },
    islandTitle: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "900",
      letterSpacing: 1.1,
      textTransform: "uppercase",
      paddingHorizontal: 4,
    },
    island: {
      borderRadius: 30,
      padding: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255,255,255,0.82)",
      shadowColor: isDark ? "#000" : colors.textPrimary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.20 : 0.05,
      shadowRadius: 24,
      elevation: 3,
    },
    settingRow: {
      minHeight: 74,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 8,
    },
    rowIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    rowCopy: {
      flex: 1,
    },
    rowTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "900",
    },
    rowSub: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "700",
      marginTop: 4,
    },
    divider: {
      height: 1,
      marginHorizontal: 18,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(107,112,141,0.10)",
    },
    segmentBlock: {
      flexDirection: "row",
      gap: 12,
      padding: 8,
    },
    segmentCopy: {
      flex: 1,
    },
    segmented: {
      marginTop: 12,
      minHeight: 42,
      borderRadius: 21,
      padding: 4,
      flexDirection: "row",
      backgroundColor: isDark ? colors.surfaceRaised : "rgba(107,112,141,0.09)",
    },
    segmentOption: {
      flex: 1,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentOptionActive: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "transparent",
    },
    segmentText: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "900",
    },
    segmentTextActive: {
      color: colors.primaryCTA,
    },
    cardGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    smallCard: {
      width: "48%",
      minHeight: 126,
      borderRadius: 24,
      padding: 14,
      justifyContent: "space-between",
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255,255,255,0.48)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255,255,255,0.64)",
    },
    smallCardActive: {
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.08)" : "rgba(189,178,255,0.16)",
      borderColor: isDark ? colors.primaryCTA : "rgba(189,178,255,0.40)",
    },
    smallIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    smallTitle: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "900",
      marginTop: 10,
    },
    smallSub: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "700",
      marginTop: 4,
    },
    linkRow: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 8,
      borderRadius: 22,
    },
    linkRowActive: {
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.08)" : "rgba(224,122,95,0.08)",
    },
    linkIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    linkCopy: {
      flex: 1,
    },
    bloopTrustCard: {
      minHeight: 108,
      borderRadius: 28,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255,255,255,0.82)",
      shadowColor: isDark ? "#000" : colors.textPrimary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.20 : 0.05,
      shadowRadius: 24,
      elevation: 3,
    },
    bloopTrustGlow: {
      position: "absolute",
      right: -34,
      top: -22,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.08)" : "rgba(244,162,97,0.20)",
    },
    trustOrb: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255,255,255,0.62)",
    },
    trustBloop: {
      width: 42,
      height: 42,
    },
    trustCopy: {
      flex: 1,
    },
    trustTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "900",
    },
    trustSub: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "700",
      marginTop: 5,
    },
    pressed: {
      transform: [{ scale: 0.96 }],
    },
    logoutButton: {
      minHeight: 52,
      borderRadius: 26,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: isDark ? "rgba(232, 166, 182, 0.08)" : "rgba(224,122,95,0.10)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(232, 166, 182, 0.20)" : "rgba(224,122,95,0.20)",
    },
    logoutText: {
      color: colors.primaryCTA,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "900",
    },
    appearanceRow: {
      flexDirection: "row",
      gap: 12,
      padding: 8,
      alignItems: "flex-start",
    },
    appearanceCopy: {
      flex: 1,
    },
    themeSegment: {
      marginTop: 12,
      minHeight: 44,
      borderRadius: 22,
      padding: 4,
      flexDirection: "row",
      backgroundColor: isDark ? colors.surfaceRaised : "rgba(107,112,141,0.09)",
      gap: 2,
    },
    themeOption: {
      flex: 1,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
      paddingVertical: 8,
    },
    themeOptionActive: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#FFFFFF",
      shadowColor: isDark ? "#000" : colors.primaryCTA,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.20 : 0.14,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "transparent",
    },
    themeOptionText: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "900",
    },
    themeOptionTextActive: {
      color: colors.primaryCTA,
    },
  });
}
