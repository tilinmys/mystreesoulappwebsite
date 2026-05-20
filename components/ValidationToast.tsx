/**
 * ValidationToast — slides down from the top to guide the user to an
 * unfilled or invalid field. Auto-dismisses after a few seconds, or when the
 * `message` prop transitions back to null.
 *
 * Uses React Native's built-in Animated API (NOT Reanimated) so it works in
 * Expo Go without any native dev-client build.
 */
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { F } from "../constants/fonts";

export function ValidationToast({
  message,
  onDismiss,
  top = 18,
}: {
  message: string | null;
  onDismiss?: () => void;
  /** Top offset (above any existing header). */
  top?: number;
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const visible = message !== null;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();

      // Auto-dismiss after 3.4s
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -100, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(() => onDismiss?.());
      }, 3400);
      return () => clearTimeout(t);
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, translateY, opacity, onDismiss]);

  return (
    <Animated.View
      pointerEvents={visible ? "box-none" : "none"}
      style={[styles.wrap, { top, opacity, transform: [{ translateY }] }]}
    >
      <View style={styles.toast}>
        <View style={styles.iconWrap}>
          <Ionicons name="alert-circle" size={18} color="#C05555" />
        </View>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
        <Pressable onPress={onDismiss} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={14} color="rgba(36,28,29,0.55)" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 18,
    right: 18,
    alignItems: "center",
    zIndex: 999,
    elevation: 12,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "rgba(255,250,247,0.98)",
    borderWidth: 1,
    borderColor: "rgba(192,85,85,0.32)",
    shadowColor: "#7A4A5C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 22,
    elevation: 8,
    width: "100%",
    maxWidth: 480,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(192,85,85,0.10)",
  },
  message: {
    flex: 1,
    fontFamily: F.uiBold,
    fontSize: 13,
    lineHeight: 17,
    color: "#241C1D",
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
