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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { F } from "../../constants/fonts";
import { CachedImage } from "../CachedImage";

const { width: W } = Dimensions.get("window");

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ComingSoonScreenProps {
  /** Screen/feature name, rendered in Playfair Display */
  title: string;
  /** Short warm description of what's coming */
  description: string;
  /** MaterialCommunityIcons icon name shown on the badge */
  icon: IconName;
  /** Accent color for icon badge background tint */
  iconColor: string;
  /** Which bloop image to display */
  bloopImage: ReturnType<typeof require>;
  /** Show an arrow-left back button in the top-left corner */
  showBackButton?: boolean;
  /** Override the back destination (defaults to /(tabs)/dashboard) */
  backHref?: string;
  /** Tag line shown in the pill above the title */
  pillLabel?: string;
}

export function ComingSoonScreen({
  title,
  description,
  icon,
  iconColor,
  bloopImage,
  showBackButton = false,
  backHref = "/(tabs)/dashboard",
  pillLabel = "Coming Soon"
}: ComingSoonScreenProps) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const bloopScale = useRef(new Animated.Value(0.88)).current;
  const bloopOpacity = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 12,
        useNativeDriver: true
      }),
      Animated.spring(bloopScale, {
        toValue: 1,
        delay: 120,
        tension: 60,
        friction: 10,
        useNativeDriver: true
      }),
      Animated.timing(bloopOpacity, {
        toValue: 1,
        delay: 80,
        duration: 380,
        useNativeDriver: true
      })
    ]).start();

    // Gentle bloop float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -7,
          duration: 2200,
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={["#FBF8F5", "#FFF3EE", "#EDE8F8"]}
      locations={[0, 0.5, 1]}
      style={styles.root}
    >
      {/* Decorative blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Back button */}
        {showBackButton && (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.replace(backHref as any)}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.backPill}>
              <MaterialCommunityIcons name="arrow-left" size={18} color="#2B2D42" />
            </View>
          </Pressable>
        )}

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Bloop illustration */}
          <Animated.View
            style={[
              styles.bloopWrap,
              {
                opacity: bloopOpacity,
                transform: [
                  { scale: bloopScale },
                  { translateY: floatAnim }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={["rgba(189,178,255,0.15)", "rgba(244,162,97,0.10)"]}
              style={styles.bloopGlow}
            />
            <CachedImage
              source={bloopImage}
              style={styles.bloopImage}
              contentFit="contain"
            />
            {/* Icon badge */}
            <View style={[styles.iconBadge, { backgroundColor: iconColor + "22" }]}>
              <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
            </View>
          </Animated.View>

          {/* Coming soon pill */}
          <View style={[styles.pill, { borderColor: iconColor + "44" }]}>
            <View style={[styles.pillDot, { backgroundColor: iconColor }]} />
            <Text style={[styles.pillText, { color: iconColor }]}>{pillLabel}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Description */}
          <Text style={styles.description}>{description}</Text>

          {/* Decorative dots row */}
          <View style={styles.dots}>
            {[iconColor, "#BDB2FF", "#81B29A"].map((c, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: c, opacity: i === 0 ? 1 : 0.4 }
                ]}
              />
            ))}
          </View>

          {/* Back to home CTA — always shown for secondary screens; for tabs show a softer hint */}
          {showBackButton ? (
            <Pressable
              onPress={() => router.replace(backHref as any)}
              style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <LinearGradient
                colors={["#E07A5F", "#F4A261"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <MaterialCommunityIcons name="home-outline" size={17} color="#fff" />
                <Text style={styles.ctaText}>Back to Home</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <View style={styles.tabHint}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#6B708D" />
              <Text style={styles.tabHintText}>
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
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(189,178,255,0.13)"
  },
  blobBottomLeft: {
    position: "absolute",
    bottom: -40,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(224,122,95,0.09)"
  },

  backBtn: {
    position: "absolute",
    top: 0,
    left: 20,
    zIndex: 10
  },
  backPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2B2D42",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 32
  },

  bloopWrap: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28
  },
  bloopGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90
  },
  bloopImage: {
    width: 150,
    height: 150
  },
  iconBadge: {
    position: "absolute",
    right: 4,
    bottom: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginBottom: 16
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8
  },

  title: {
    fontFamily: F.luxuryExtraBold,
    fontSize: 28,
    color: "#2B2D42",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 14
  },

  description: {
    fontSize: 15,
    color: "#6B708D",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    maxWidth: W - 80,
    marginBottom: 24
  },

  dots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },

  cta: { borderRadius: 28, overflow: "hidden" },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    minHeight: 50
  },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2
  },

  tabHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  tabHintText: {
    fontSize: 13,
    color: "#6B708D",
    fontWeight: "500"
  }
});
