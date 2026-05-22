/**
 * ComingSoonScreen — full-screen "under construction" placeholder
 *
 * Token mapping
 * ─────────────
 *  Background gradient  →  background → surface  (dark) / warm creams (light)
 *  Back button bg       →  surfaceRaised
 *  Back button icon     →  textPrimary
 *  Pill border          →  iconColor + 44 (passed in)
 *  Pill bg              →  surfaceRaised in dark / near-white in light
 *  Title                →  textPrimary
 *  Description          →  textMuted
 *  Primary CTA bg       →  primaryCTA (Bloom Pink)
 *  Primary CTA text     →  background (Midnight Plum — 10.4:1 ✓✓✓)
 *  Hint text            →  textMuted
 *  Clock icon           →  textMuted
 *
 * Mascot constraint
 * ─────────────────
 *  bloopImage is rendered as-is — no tintColor, no overlays, no filters.
 *  The LinearGradient halo behind it is theme-adjusted to frame the mascot
 *  without clashing with its established character palette.
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { CachedImage } from "../CachedImage";

const { width: W } = Dimensions.get("window");

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ComingSoonScreenProps {
  title:           string;
  description:     string;
  icon:            IconName;
  iconColor:       string;
  bloopImage:      ReturnType<typeof require>;
  showBackButton?: boolean;
  backHref?:       string;
  pillLabel?:      string;
}

export function ComingSoonScreen({
  title,
  description,
  icon,
  iconColor,
  bloopImage,
  showBackButton = false,
  backHref       = "/(tabs)/dashboard",
  pillLabel      = "Coming Soon",
}: ComingSoonScreenProps) {
  const router          = useRouter();
  const { colors, isDark } = useColorMode();

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(28)).current;
  const bloopScale  = useRef(new Animated.Value(0.88)).current;
  const bloopOpacity= useRef(new Animated.Value(0)).current;
  const floatAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,   { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideAnim,  { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      Animated.spring(bloopScale, { toValue: 1, delay: 120, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(bloopOpacity, { toValue: 1, delay: 80, duration: 380, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -7, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue:  0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      // Dark: background → surface (plum gradient)
      // Light: warm cream gradient (original feel)
      colors={isDark
        ? [colors.background, colors.surface, `${colors.surfaceRaised}80`]
        : ["#FBF8F5", "#FFF3EE", "#EDE8F8"]
      }
      locations={[0, 0.5, 1]}
      style={styles.root}
    >
      {/* Ambient blobs — low-opacity, no mascot interference */}
      <View style={[styles.blobTopRight,   { backgroundColor: isDark ? `${colors.surfaceRaised}20` : "rgba(189,178,255,0.13)" }]} />
      <View style={[styles.blobBottomLeft, { backgroundColor: isDark ? `${colors.primaryCTA}10`    : "rgba(224,122,95,0.09)"  }]} />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {showBackButton && (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.replace(backHref as any)}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <View style={[styles.backPill, { backgroundColor: isDark ? colors.surfaceRaised : "rgba(255,255,255,0.85)" }]}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={colors.textPrimary} />
            </View>
          </Pressable>
        )}

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* ── Bloop illustration — UNTINTED ────────────────────────────────── */}
          <Animated.View style={[
            styles.bloopWrap,
            { opacity: bloopOpacity, transform: [{ scale: bloopScale }, { translateY: floatAnim }] },
          ]}>
            {/* Halo gradient BEHIND the mascot — frames without tinting */}
            <LinearGradient
              colors={isDark
                ? [`${colors.surfaceRaised}30`, `${colors.primaryCTA}14`]
                : ["rgba(189,178,255,0.15)", "rgba(244,162,97,0.10)"]
              }
              style={styles.bloopGlow}
            />
            {/* ⚠️  CachedImage — no tintColor, no colorFilter, no overlay */}
            <CachedImage source={bloopImage} style={styles.bloopImage} contentFit="contain" />

            {/* Icon badge — on the card corner, NOT on the mascot's face */}
            <View style={[styles.iconBadge, {
              backgroundColor: `${iconColor}22`,
              borderColor:     isDark ? colors.border : "rgba(255,255,255,0.9)",
            }]}>
              <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
            </View>
          </Animated.View>

          {/* Pill */}
          <View style={[styles.pill, {
            borderColor:     `${iconColor}44`,
            backgroundColor: isDark ? `${colors.surfaceRaised}80` : "rgba(255,255,255,0.70)",
          }]}>
            <View style={[styles.pillDot, { backgroundColor: iconColor }]} />
            <Text style={[styles.pillText, { color: iconColor }]}>{pillLabel}</Text>
          </View>

          {/* Title + description */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textMuted, maxWidth: W - 80 }]}>{description}</Text>

          {/* Decorative dots */}
          <View style={styles.dots}>
            {[iconColor, colors.textMuted, colors.fertileColor].map((c, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: c, opacity: i === 0 ? 1 : 0.4 }]} />
            ))}
          </View>

          {/* CTA — Bloom Pink bg, Midnight Plum text (10.4:1) */}
          {showBackButton ? (
            <Pressable
              onPress={() => router.replace(backHref as any)}
              style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <LinearGradient
                colors={[colors.primaryCTA, colors.warning]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <MaterialCommunityIcons name="home-outline" size={17} color={colors.background} />
                <Text style={[styles.ctaText, { color: colors.background }]}>Back to Home</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <View style={styles.tabHint}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.tabHintText, { color: colors.textMuted }]}>
                This tab is being built with care
              </Text>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  blobTopRight: {
    position: "absolute", top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
  },
  blobBottomLeft: {
    position: "absolute", bottom: -40, left: -50,
    width: 180, height: 180, borderRadius: 90,
  },

  backBtn:  { position: "absolute", top: 0, left: 20, zIndex: 10 },
  backPill: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 32,
  },

  bloopWrap:  { width: 180, height: 180, alignItems: "center", justifyContent: "center", marginBottom: 28 },
  bloopGlow:  { position: "absolute", width: 180, height: 180, borderRadius: 90 },
  bloopImage: { width: 150, height: 150 },

  iconBadge: {
    position: "absolute", right: 4, bottom: 8,
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },

  pill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5,
    marginBottom: 16,
  },
  pillDot:  { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: F.ui, fontSize: 12, letterSpacing: 0.8 },

  title: {
    fontFamily: F.display,
    fontSize: 28, lineHeight: 36,
    textAlign: "center",
    marginBottom: 14,
  },
  description: {
    fontFamily: F.body,
    fontSize: 15, lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },

  dots: { flexDirection: "row", gap: 8, marginBottom: 32 },
  dot:  { width: 8, height: 8, borderRadius: 4 },

  cta:         { borderRadius: 28, overflow: "hidden" },
  ctaGradient: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 28, paddingVertical: 14, minHeight: 50,
  },
  ctaText: { fontFamily: F.uiLabel, fontSize: 15, letterSpacing: 0.4 },

  tabHint: { flexDirection: "row", alignItems: "center", gap: 6 },
  tabHintText: { fontFamily: F.body, fontSize: 13 },
});
