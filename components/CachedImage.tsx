import { Image, type ImageContentFit, type ImageSource } from "expo-image";
import type { ImageStyle, StyleProp } from "react-native";

export function CachedImage({
  contentFit = "contain",
  priority = "normal",
  source,
  style
}: {
  contentFit?: ImageContentFit;
  priority?: "low" | "normal" | "high";
  source: ImageSource | number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      cachePolicy="memory-disk"
      contentFit={contentFit}
      priority={priority}
      recyclingKey={typeof source === "number" ? String(source) : undefined}
      source={source}
      style={style}
      transition={priority === "high" ? 0 : 60}
    />
  );
}
