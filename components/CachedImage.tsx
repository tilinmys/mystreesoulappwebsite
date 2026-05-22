import { Image, type ImageContentFit, type ImageSource } from "expo-image";
import type { ImageStyle, StyleProp } from "react-native";

/**
 * CachedImage — thin expo-image wrapper with memory-disk caching.
 *
 * placeholder  — optional blurhash string OR a hex/rgba color string shown
 *                while the image is loading. Eliminates the blank-flash on
 *                slower pages. Pass a surface-tone color (e.g. "#2E2330") to
 *                match the dark card background.
 * priority     — "high" sets transition=0 (instant swap once decoded) and
 *                bumps the download queue. Use for above-fold hero images.
 */
export function CachedImage({
  contentFit = "contain",
  placeholder,
  priority = "normal",
  source,
  style,
}: {
  contentFit?: ImageContentFit;
  /** blurhash string OR a hex/rgba color shown while loading */
  placeholder?: string;
  priority?: "low" | "normal" | "high";
  source: ImageSource | number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      cachePolicy="memory-disk"
      contentFit={contentFit}
      placeholder={placeholder ?? "#110812"}
      priority={priority}
      recyclingKey={typeof source === "number" ? String(source) : undefined}
      source={source}
      style={style}
      transition={priority === "high" ? 0 : 80}
    />
  );
}
