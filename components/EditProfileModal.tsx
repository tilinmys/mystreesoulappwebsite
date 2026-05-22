/**
 * EditProfileModal — Premium slide-up profile editor
 *
 * Built with React Native Animated (Expo Go-safe — no Reanimated worklets required).
 * Supports: avatar camera overlay, Name + DOB fields with floating labels,
 * health goal chips, gradient Save button.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { height: SCREEN_H } = Dimensions.get("window");
// react-native-reanimated 4.x requires a native dev-client — use RN Animated instead.
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { F } from "../constants/fonts";
import { useColorMode } from "../hooks/useColorMode";
import { useOnboardingStore } from "../store/onboardingStore";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:         "#FFFDFB",
  text:       "#1C1528",
  muted:      "#8A7A9A",
  faint:      "#C4B8D4",
  terracotta: "#E07A5F",
  lavender:   "#9277C8",
  pink:       "#D45C82",
  sage:       "#5E9B6B",
  peach:      "#F4A261",
  border:     "rgba(200,192,210,0.30)",
} as const;

// ── Health goal chips ─────────────────────────────────────────────────────────
const GOALS = [
  { id: "cycle",       label: "Full Cycle Tracking",    icon: "water",                   color: "#E07A5F" },
  { id: "peace",       label: "Calm & Peace",       icon: "weather-night",            color: "#9277C8" },
  { id: "sleep",       label: "Better Sleep",       icon: "moon-waning-crescent",     color: "#6E86D8" },
  { id: "fitness",     label: "Fitness",            icon: "run-fast",                 color: "#5E9B6B" },
  { id: "nutrition",   label: "Nutrition",          icon: "food-apple",               color: "#F4A261" },
  { id: "fertility",   label: "Fertility",          icon: "flower-tulip-outline",     color: "#D45C82" },
  { id: "stress_rec",  label: "Stress Relief",      icon: "heart-pulse",              color: "#C9A040" },
  { id: "self_love",   label: "Self-Love",          icon: "heart-outline",            color: "#F1A7C4" },
] as const;

// ── Floating label TextInput ───────────────────────────────────────────────────
function FloatingInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  isDark,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  isDark: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <View
      style={[
        fStyles.wrap,
        isDark && fStyles.wrapDark,
        focused && fStyles.wrapFocused,
        focused && !isDark && { borderColor: C.lavender },
      ]}
    >
      <Text
        style={[
          fStyles.label,
          floated ? fStyles.labelFloated : fStyles.labelResting,
          floated && { color: C.lavender },
          isDark && { color: focused ? "#B09AE0" : C.muted },
        ]}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[fStyles.input, isDark && fStyles.inputDark]}
        placeholderTextColor={C.faint}
        selectionColor={C.lavender}
      />
    </View>
  );
}

const fStyles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    position: "relative",
  },
  wrapDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  wrapFocused: {
    borderColor: C.lavender,
    shadowColor: C.lavender,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    position: "absolute",
    left: 16,
    fontFamily: F.uiSemiBold,
    pointerEvents: "none",
  },
  labelResting: {
    top: 16,
    fontSize: 15,
    color: C.muted,
  },
  labelFloated: {
    top: 7,
    fontSize: 11,
    color: C.lavender,
  },
  input: {
    fontFamily: F.uiBold,
    fontSize: 15,
    color: C.text,
    paddingVertical: 0,
    minHeight: 28,
  },
  inputDark: {
    color: "#F2EFF8",
  },
});

// ── Main modal ────────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: () => void;
};

export function EditProfileModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useColorMode();

  const storedName = useOnboardingStore((s) => s.name);
  const setStoreName = useOnboardingStore((s) => s.setName);
  const storedGoals = useOnboardingStore((s) => s.selectedGoals);
  const setStoreGoals = useOnboardingStore((s) => s.setSelectedGoals);

  const [name,        setName]       = useState(storedName ?? "");
  const [dob,         setDob]        = useState("");
  const [goals,       setGoals]      = useState<string[]>(storedGoals ?? []);
  const [saving,      setSaving]     = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Animated values for slide-up sheet and scrim fade
  const scrimAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;

  // Sync local state + run entrance animation when modal opens
  useEffect(() => {
    if (visible) {
      setName(storedName ?? "");
      setGoals(storedGoals ?? []);
      setSaveSuccess(false);
      // Entrance
      Animated.parallel([
        Animated.timing(scrimAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 20, useNativeDriver: true }),
      ]).start();
    } else {
      scrimAnim.setValue(0);
      slideAnim.setValue(SCREEN_H);
    }
  }, [visible]);

  function animatedClose() {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(scrimAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: SCREEN_H, duration: 240, useNativeDriver: true }),
    ]).start(() => onClose());
  }

  function toggleGoal(id: string) {
    Haptics.selectionAsync().catch(() => {});
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    if (saving) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSaving(true);
    // Persist to store
    setStoreName(name.trim() || storedName);
    setStoreGoals(goals);
    await new Promise((r) => setTimeout(r, 400)); // brief async feel
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  }

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={animatedClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.scrim, { opacity: scrimAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={animatedClose} />

          <Animated.View
            style={[
              styles.sheet,
              isDark && styles.sheetDark,
              { paddingBottom: Math.max(insets.bottom, 24), transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Title row */}
            <View style={styles.titleRow}>
              <Text style={[styles.title, isDark && styles.titleDark]}>Edit Profile</Text>
              <Pressable onPress={animatedClose} hitSlop={10} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={isDark ? "#C4BAD6" : C.muted} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scroll}
            >
              {/* ── Avatar section ──────────────────────────────────────── */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrap}>
                  <LinearGradient
                    colors={["#FFEDE9", "#FCE3F0", "#E9DEFA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarCircle}
                  >
                    <MaterialCommunityIcons name="account-circle" size={60} color={C.lavender} />
                  </LinearGradient>
                  {/* Camera overlay */}
                  <Pressable
                    style={styles.cameraOverlay}
                    accessibilityLabel="Change profile photo"
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons name="camera-plus-outline" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
                <Text style={[styles.avatarHint, isDark && { color: "#C4BAD6" }]}>
                  Tap to change photo
                </Text>
              </View>

              {/* ── Form fields ─────────────────────────────────────────── */}
              <View style={styles.fieldsWrap}>
                <FloatingInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  isDark={isDark}
                />
                <FloatingInput
                  label="Date of Birth (DD/MM/YYYY)"
                  value={dob}
                  onChangeText={setDob}
                  keyboardType="numeric"
                  isDark={isDark}
                />
              </View>

              {/* ── Health goals ─────────────────────────────────────────── */}
              <View style={styles.goalsSection}>
                <Text style={[styles.sectionLabel, isDark && { color: "#F2EFF8" }]}>
                  Health Goals
                </Text>
                <Text style={[styles.sectionSub, isDark && { color: "#C4BAD6" }]}>
                  Choose what matters to you most
                </Text>
                <View style={styles.goalsGrid}>
                  {GOALS.map((g) => {
                    const active = goals.includes(g.id);
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() => toggleGoal(g.id)}
                        style={({ pressed }) => [
                          styles.goalChip,
                          isDark && styles.goalChipDark,
                          active && { backgroundColor: `${g.color}1E`, borderColor: `${g.color}60` },
                          pressed && styles.pressed,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={g.icon}
                          size={16}
                          color={active ? g.color : C.muted}
                        />
                        <Text
                          style={[
                            styles.goalChipText,
                            isDark && { color: "#D8D1E5" },
                            active && { color: g.color, fontFamily: F.uiExtraBold },
                          ]}
                        >
                          {g.label}
                        </Text>
                        {active && (
                          <Ionicons name="checkmark-circle" size={14} color={g.color} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* ── Save button ──────────────────────────────────────────── */}
              <Pressable
                onPress={handleSave}
                disabled={saving || saveSuccess}
                style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                accessibilityLabel="Save profile changes"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={saveSuccess ? ["#5E9B6B", "#81B29A"] : ["#E07A5F", "#D45C82"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.saveBtnGradient}
                >
                  {saving ? (
                    <MaterialCommunityIcons name="loading" size={20} color="#FFFFFF" />
                  ) : saveSuccess ? (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.saveBtnText}>Saved!</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(22,18,28,0.36)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFDFB",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 18,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sheetDark: {
    backgroundColor: "#1A1028",
    borderColor: "rgba(255,255,255,0.12)",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.14)",
    alignSelf: "center",
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontFamily: F.luxuryBold,
    fontSize: 24,
    color: C.text,
    letterSpacing: -0.2,
  },
  titleDark: {
    color: "#F2EFF8",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200,192,210,0.18)",
  },
  scroll: {
    gap: 24,
    paddingBottom: 8,
  },
  // ── Avatar ──
  avatarSection: {
    alignItems: "center",
    gap: 8,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.90)",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.terracotta,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarHint: {
    fontFamily: F.uiRegular,
    fontSize: 12,
    color: C.muted,
  },
  // ── Fields ──
  fieldsWrap: {
    gap: 14,
  },
  // ── Goals ──
  goalsSection: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: F.uiBlack,
    fontSize: 15,
    color: C.text,
    letterSpacing: 0.1,
  },
  sectionSub: {
    fontFamily: F.uiRegular,
    fontSize: 12,
    color: C.muted,
    marginBottom: 4,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "rgba(200,192,210,0.35)",
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  goalChipDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  goalChipText: {
    fontFamily: F.uiBold,
    fontSize: 12.5,
    color: C.muted,
  },
  // ── Save button ──
  saveBtn: {
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#D45C82",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 8,
  },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 999,
  },
  saveBtnText: {
    fontFamily: F.uiExtraBold,
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
