import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, ViewStyle } from "react-native";
import { CachedImage } from "../CachedImage";

const bloop = require("../../public/images/bloop-nav.webp");

export function BloopOrb({ size = 48, style }: { size?: number; style?: ViewStyle }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Animated.View
      style={[
        styles.shell,
        { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] },
        style
      ]}
    >
      <CachedImage priority="high" source={bloop} style={{ width: size * 0.72, height: size * 0.72 }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,122,95,0.16)",
    shadowColor: "#E07A5F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6
  }
});
