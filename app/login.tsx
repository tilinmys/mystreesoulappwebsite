import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CachedImage } from "../components/CachedImage";
import { AuraBackground } from "../components/system/AuraBackground";
import { ValidationToast } from "../components/ValidationToast";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useColorMode } from "../hooks/useColorMode";
import { useHaptics } from "../hooks/useHaptics";
import { useAuthStore } from "../store/authStore";
import { useNavigationIntentStore } from "../store/navigationIntentStore";
import { useOnboardingStore } from "../store/onboardingStore";

const bloop = require("../public/images/bloop-welcome.webp");

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string }>();
  const { colors, mode } = useColorMode();
  const haptics = useHaptics();
  const login = useAuthStore((state) => state.login);
  const consumeNavigationIntent = useNavigationIntentStore((state) => state.consumeNavigationIntent);
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
  const [email, setEmail] = useState("test@mystreesoul.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState(params.reason === "session" ? "Please sign in again to continue." : "");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      haptics.error();
      setError("Please enter your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      haptics.error();
      setError("That doesn't look like a valid email address.");
      return;
    }
    if (!password) {
      haptics.error();
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(trimmedEmail, password);
    setLoading(false);

    if (!result.ok) {
      haptics.error();
      setError(result.message);
      return;
    }

    haptics.success();
    const intendedPath = hasCompletedOnboarding ? consumeNavigationIntent() : null;
    router.replace(
      hasCompletedOnboarding
        ? ((intendedPath ?? "/(tabs)/dashboard") as any)
        : "/(onboarding)/onboarding"
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <AuraBackground variant="bloop" />
      <ValidationToast
        message={error ? error : null}
        onDismiss={() => setError("")}
        top={50}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandLockup}>
            <View style={styles.logoShell}>
              <LinearGradient colors={["rgba(255,248,245,0.96)", "rgba(255,231,214,0.92)"]} style={styles.logoGradient}>
                <CachedImage priority="high" source={bloop} style={styles.logoImage} />
              </LinearGradient>
            </View>
            <Text style={[styles.brand, { color: colors.text }]}>MyStree Soul</Text>
            <Text style={[styles.brandSub, { color: colors.muted }]}>Private hormone intelligence, made gentle.</Text>
          </View>

          <View style={[styles.authCard, { backgroundColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.74)", borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Continue into your personal wellness space.</Text>
            </View>

            <InputRow
              icon="email-outline"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              value={email}
            />
            <InputRow
              icon="lock-outline"
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              value={password}
            />

            {error ? (
              <View style={styles.errorPill}>
                <MaterialCommunityIcons name="information-outline" size={16} color={colors.coral} />
                <Text style={[styles.error, { color: colors.coral }]}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.testBadge}>
              <MaterialCommunityIcons name="shield-check-outline" size={17} color={colors.sage} />
              <Text style={[styles.testBadgeText, { color: colors.muted }]}>Test access: test@mystreesoul.com / password123</Text>
            </View>

            <Pressable disabled={loading} onPress={submit} style={({ pressed }) => [styles.ctaShell, pressed && styles.pressed, loading && styles.disabled]}>
              <LinearGradient colors={[colors.terracotta, colors.peach]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.ctaText}>Sign In</Text>}
                {!loading ? <Ionicons name="arrow-forward" size={18} color="#FFFFFF" /> : null}
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/register")} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={[styles.secondaryMuted, { color: colors.muted }]}>New to MyStree Soul?</Text>
            <Text style={[styles.secondaryText, { color: colors.terracotta }]}>Create account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputRow({
  icon,
  keyboardType,
  onChangeText,
  placeholder,
  secureTextEntry,
  value
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  keyboardType?: "email-address";
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
}) {
  const { colors, mode } = useColorMode();

  return (
    <View style={[styles.inputShell, { backgroundColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.78)", borderColor: colors.border }]}>
      <MaterialCommunityIcons name={icon} size={19} color={colors.terracotta} />
      <TextInput
        autoCapitalize="none"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { color: colors.text }]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.side, gap: 22 },
  brandLockup: { alignItems: "center", gap: 10, paddingTop: 12 },
  logoShell: {
    width: 118,
    height: 118,
    borderRadius: 42,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.58)",
    shadowColor: "#E07A5F",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 6
  },
  logoGradient: { flex: 1, borderRadius: 35, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  logoImage: { width: 86, height: 78 },
  brand: { ...typography.heroTitle, textAlign: "center", fontSize: 34, lineHeight: 40 },
  brandSub: { fontSize: 14, lineHeight: 20, fontWeight: "800", textAlign: "center" },
  authCard: {
    borderRadius: 34,
    borderWidth: 1,
    gap: 13,
    padding: 18,
    shadowColor: "#2B2D42",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 5
  },
  cardHeader: { gap: 6, paddingHorizontal: 4, paddingBottom: 2 },
  title: { fontFamily: "serif", fontSize: 26, lineHeight: 31, fontWeight: "800" },
  subtitle: { fontSize: 13, lineHeight: 19, fontWeight: "700" },
  inputShell: { minHeight: 58, borderRadius: 29, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 14, fontWeight: "800", paddingVertical: 0 },
  testBadge: { minHeight: 38, borderRadius: 19, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, backgroundColor: "rgba(129,178,154,0.10)" },
  testBadgeText: { flex: 1, fontSize: 11, lineHeight: 15, fontWeight: "800" },
  errorPill: { borderRadius: 19, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: "rgba(248,113,113,0.10)" },
  error: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  ctaShell: { borderRadius: 30, marginTop: 2 },
  cta: { minHeight: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  ctaText: { color: "#FFFFFF", fontSize: 15, lineHeight: 20, fontWeight: "900" },
  secondary: { minHeight: 46, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  secondaryMuted: { fontSize: 13, lineHeight: 18, fontWeight: "800" },
  secondaryText: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
  disabled: { opacity: 0.72 },
  pressed: { transform: [{ scale: 0.97 }] }
});
