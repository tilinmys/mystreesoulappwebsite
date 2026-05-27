import type { ComponentProps } from "react";
import { Text } from "react-native";

type FittedTextProps = ComponentProps<typeof Text> & {
  minScale?: number;
};

export function FittedText({
  minScale = 0.78,
  numberOfLines = 1,
  ellipsizeMode = "tail",
  textBreakStrategy = "simple",
  android_hyphenationFrequency = "none",
  style,
  ...props
}: FittedTextProps) {
  return (
    <Text
      {...props}
      adjustsFontSizeToFit
      minimumFontScale={minScale}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      textBreakStrategy={textBreakStrategy}
      android_hyphenationFrequency={android_hyphenationFrequency}
      style={style}
    />
  );
}
