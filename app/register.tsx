import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
import { useSafeBack } from "../hooks/useSafeBack";
import { useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";

const bloop = require("../public/images/bloop-calm.webp");

export default function RegisterScreen() {
  const router = useRouter();
  const safeBack = useSafeBack("/login");
  const { colors, mode } = useColorMode();
  const haptics = useHaptics();
  const register = useAuthStore((state) => state.register);
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);
  const [email, setEmail] = useState("test@mystreesoul.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    // Client-side guardrails so the user gets immediate, specific feedback
    // before we hit the auth store's async checks.
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      haptics.error();
      setError("Please enter your email to continue.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      haptics.error();
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      haptics.error();
      setError("Please create a password (8+ characters).");
      return;
    }
    if (password.length < 8) {
      haptics.error();
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    const result = await register(trimmedEmail, password);
    setLoading(false);

    if (!result.ok) {
      haptics.error();
      setError(result.message);
      return;
    }

    haptics.success();
    resetOnboarding();
    router.replace("/(onboarding)/onboarding");
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <AuraBackground variant="profile" />
      <ValidationToast
        message={error ? error : null}
        onDismiss={() => setError("")}
        top={50}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={safeBack}
              style={({ pressed }) => [styles.back, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={[styles.topLabel, { color: colors.muted }]}>Secure access</Text>
            <View style={styles.backSpacer} />
          </View>

          <View style={styles.hero}>
            <View style={styles.heroImageShell}>
              <LinearGradient colors={["rgba(189,178,255,0.22)", "rgba(244,162,97,0.18)", "rgba(129,178,154,0.16)"]} style={styles.heroHalo} />
              <CachedImage priority="high" source={bloop} style={styles.heroImage} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Create your MyStree Soul access</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Testing mode signs you in instantly, then asks for privacy consent before health details.</Text>
          </View>

          <View style={[styles.authCard, { backgroundColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.74)", borderColor: colors.border }]}>
            <InputRow icon="email-outline" keyboardType="email-address" onChangeText={setEmail} placeholder="Email" value={email} />
            <InputRow icon="lock-outline" onChangeText={setPassword} placeholder="Password" secureTextEntry value={password} />

            {error ? (
              <View style={styles.errorPill}>
                <MaterialCommunityIcons name="information-outline" size={16} color={colors.coral} />
                <Text style={[styles.error, { color: colors.coral }]}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.trustRow}>
              <View style={styles.trustIcon}>
                <MaterialCommunityIcons name="shield-lock-outline" size={20} color={colors.sage} />
              </View>
              <Text style={[styles.trustText, { color: colors.muted }]}>Privacy consent comes next. No health inputs are collected before that step.</Text>
            </View>

            <Pressable disabled={loading} onPress={submit} style={({ pressed }) => [styles.ctaShell, pressed && styles.pressed, loading && styles.disabled]}>
              <LinearGradient colors={[colors.terracotta, colors.peach]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.ctaText}>Create Account</Text>}
                {!loading ? <Ionicons name="arrow-forward" size={18} color="#FFFFFF" /> : null}
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable onPress={() => router.replace("/login")} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={[styles.secondaryMuted, { color: colors.muted }]}>Already have access?</Text>
            <Text style={[styles.secondaryText, { color: colors.terracotta }]}>Sign in</Text>
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
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.side, gap: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  backSpacer: { width: 44, height: 44 },
  topLabel: { fontSize: 11, lineHeight: 15, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  hero: { alignItems: "center", gap: 11 },
  heroImageShell: { width: 132, height: 122, alignItems: "center", justifyContent: "center" },
  heroHalo: { position: "absolute", width: 132, height: 112, borderRadius: 46 },
  heroImage: { width: 104, height: 92 },
  title: { ...typography.heroTitle, textAlign: "center", fontSize: 31, lineHeight: 37 },
  subtitle: { fontSize: 14, lineHeight: 21, fontWeight: "700", textAlign: "center", maxWidth: 330 },
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
  inputShell: { minHeight: 58, borderRadius: 29, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 14, fontWeight: "800", paddingVertical: 0 },
  trustRow: { minHeight: 54, borderRadius: 27, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, backgroundColor: "rgba(129,178,154,0.10)" },
  trustIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.58)" },
  trustText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: "800" },
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
