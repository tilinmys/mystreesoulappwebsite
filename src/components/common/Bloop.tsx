import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";

import {
  BLOOP_ACCESSIBILITY_LABELS,
  BLOOP_ASSETS,
  BLOOP_SIZE_PRESETS,
  type BloopSizePreset,
  type BloopState,
} from "@/constants/bloopAssets";

type BloopResizeMode = "contain" | "cover" | "fill";

export type BloopProps = {
  state?: BloopState;
  size?: number | BloopSizePreset;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  resizeMode?: BloopResizeMode;
  animated?: boolean;
  accessibilityLabel?: string;
  decorative?: boolean;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
};

function getResolvedSize(size?: number | BloopSizePreset) {
  if (typeof size === "number") {
    return size;
  }

  if (size) {
    return BLOOP_SIZE_PRESETS[size];
  }

  return BLOOP_SIZE_PRESETS.medium;
}

function getResolvedDimensions({
  intrinsicWidth,
  intrinsicHeight,
  size,
  width,
  height,
}: {
  intrinsicWidth: number;
  intrinsicHeight: number;
  size?: number | BloopSizePreset;
  width?: number;
  height?: number;
}) {
  const aspectRatio = intrinsicWidth / intrinsicHeight;

  if (width && height) {
    return {
      width,
      height,
    };
  }

  if (width) {
    return {
      width,
      height: Math.round(width / aspectRatio),
    };
  }

  if (height) {
    return {
      width: Math.round(height * aspectRatio),
      height,
    };
  }

  const resolvedSize = getResolvedSize(size);
  if (aspectRatio >= 1) {
    return {
      width: resolvedSize,
      height: Math.round(resolvedSize / aspectRatio),
    };
  }

  return {
    width: Math.round(resolvedSize * aspectRatio),
    height: resolvedSize,
  };
}

function getMotionClass(state: BloopState) {
  switch (state) {
    case "celebrate":
      return "bloop-motion-celebrate";
    case "alert":
      return "bloop-motion-alert";
    case "guide":
      return "bloop-motion-guide";
    case "idle":
    case "encourage":
    case "reassure":
    case "inform":
    case "empty":
    case "adolescence":
    case "pregnancy":
    case "menopause":
    default:
      return "bloop-motion-idle";
  }
}

export function Bloop({
  state = "idle",
  size,
  width,
  height,
  className,
  style,
  resizeMode = "contain",
  animated = false,
  accessibilityLabel,
  decorative = false,
  priority = false,
  loading,
  sizes,
}: BloopProps) {
  const src = BLOOP_ASSETS[state];
  const { width: resolvedWidth, height: resolvedHeight } = getResolvedDimensions({
    intrinsicWidth: src.width,
    intrinsicHeight: src.height,
    size,
    width,
    height,
  });
  const alt = decorative
    ? ""
    : accessibilityLabel ?? BLOOP_ACCESSIBILITY_LABELS[state];
  const motionClass = animated ? getMotionClass(state) : "";
  const mergedClassName = [motionClass, className].filter(Boolean).join(" ");
  const imageStyle: CSSProperties = {
    ...style,
    objectFit: resizeMode,
  };

  return (
    <Image
      src={src}
      alt={alt}
      aria-hidden={decorative || undefined}
      width={resolvedWidth}
      height={resolvedHeight}
      priority={priority}
      loading={loading ?? (priority ? "eager" : undefined)}
      sizes={sizes ?? `${resolvedWidth}px`}
      className={mergedClassName}
      style={imageStyle}
    />
  );
}

export type { BloopState, BloopSizePreset };
export type { ImageProps };
