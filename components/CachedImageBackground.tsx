import { Image, type ImageContentFit, type ImageSource } from "expo-image";
import type { ImageStyle, StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";

export function CachedImageBackground({
  children,
  contentFit = "cover",
  imageStyle,
  priority = "low",
  source,
  style
}: {
  children?: ReactNode;
  contentFit?: ImageContentFit;
  imageStyle?: StyleProp<ImageStyle>;
  priority?: "low" | "normal" | "high";
  source: ImageSource | number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[style, styles.container]}>
      <Image
        cachePolicy="memory-disk"
        contentFit={contentFit}
        priority={priority}
        recyclingKey={typeof source === "number" ? String(source) : undefined}
        source={source}
        style={[StyleSheet.absoluteFill, imageStyle]}
        transition={priority === "high" ? 0 : 40}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden"
  }
});
