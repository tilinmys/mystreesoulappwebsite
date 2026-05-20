import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as SvgLinearGradient, Path, Stop } from "react-native-svg";
import { F } from "../constants/fonts";

const C = {
  ink: "#191616",
  muted: "#554947",
  rose: "#B77C69",
  roseSoft: "rgba(183,124,105,0.24)",
  gold: "#C9AA68",
  goldSoft: "rgba(201,170,104,0.30)",
  orange: "#F1663E",
  peach: "#FF9B4A",
  sage: "#7F9276",
  lavender: "#A893BF",
  footer: "rgba(92,83,80,0.42)",
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const compact = height < 760;
  const logoSize = Math.min(width * 0.54, compact ? 190 : 226);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#EFC6C3", "#F8DDCA", "#EDE4CC", "#DDE9DB", "#F5E6DF"]}
        locations={[0, 0.28, 0.54, 0.78, 1]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.meshOrb, styles.meshOrbPink]} />
      <View style={[styles.meshOrb, styles.meshOrbPeach]} />
      <View style={[styles.meshOrb, styles.meshOrbSage]} />
      <View style={[styles.meshOrb, styles.meshOrbRose]} />
      <WaveTrails />
      <GoldSpeckles />
      <BotanicalScene width={width} height={height} />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={[styles.logoStage, { width: logoSize + 42, height: logoSize + 42 }]}>
            <View style={[styles.logoGlow, { width: logoSize + 40, height: logoSize + 40, borderRadius: (logoSize + 40) / 2 }]} />
            <View style={[styles.logoHalo, { width: logoSize + 20, height: logoSize + 20, borderRadius: (logoSize + 20) / 2 }]} />
            <View style={[styles.logoCircle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
              <WomanFlowerLogo size={logoSize * 0.78} />
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text style={[styles.headline, compact && styles.headlineCompact]}>
              Know your body.{"\n"}Feel like yourself.
            </Text>
            <Text style={[styles.subhead, compact && styles.subheadCompact]}>
              Personalized cycle insights with gentle{"\n"}AI guidance. Private, always.
            </Text>
          </View>

          <MoonPhases compact={compact} />

          <View style={styles.actionBlock}>
            <Pressable
              onPress={() => router.push("/register")}
              style={({ pressed }) => [styles.primaryShell, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Begin your journey"
            >
              <LinearGradient
                colors={[C.orange, C.peach]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryText}>Begin Your Journey</Text>
                <Ionicons name="arrow-forward" size={22} color="#FFF8F4" />
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => router.push("/login")}
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressedSoft]}
              accessibilityRole="button"
              accessibilityLabel="Log in"
            >
              <Text style={styles.loginText}>Log in</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>Private  •  No data sold  •  Yours always</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function WomanFlowerLogo({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 180 180" fill="none">
      <Defs>
        <SvgLinearGradient id="logoStroke" x1="34" y1="18" x2="144" y2="162">
          <Stop offset="0" stopColor="#D2A28E" />
          <Stop offset="0.45" stopColor="#A56551" />
          <Stop offset="1" stopColor="#C89079" />
        </SvgLinearGradient>
      </Defs>
      <G stroke="url(#logoStroke)" strokeLinecap="round" strokeLinejoin="round">
        <Path
          d="M104 20C86 33 78 54 82 76C86 100 75 120 61 134C50 145 50 157 64 164C78 171 100 163 107 145C112 132 106 120 98 110"
          strokeWidth={3.8}
        />
        <Path
          d="M104 20C120 31 124 47 116 61C112 68 103 72 96 75C107 78 116 84 119 94"
          strokeWidth={3.4}
        />
        <Path
          d="M113 45C119 50 121 56 119 63C118 67 115 70 112 72"
          strokeWidth={3}
        />
        <Path
          d="M108 58C112 59 115 61 117 64"
          strokeWidth={2.6}
        />
        <Path
          d="M96 75C92 83 92 92 97 101"
          strokeWidth={2.8}
        />
        <Path
          d="M70 160C55 147 47 128 48 104C49 79 60 56 82 39"
          strokeWidth={3.35}
        />
        <Path
          d="M50 102C41 90 31 83 20 82C24 95 35 104 50 108"
          strokeWidth={2.7}
        />
        <Path
          d="M51 101C57 82 70 68 88 62"
          strokeWidth={2.7}
        />
        <Path
          d="M86 63C78 48 82 34 95 25C102 40 99 54 86 63Z"
          strokeWidth={2.7}
        />
        <Path
          d="M86 63C73 50 58 48 47 57C58 69 72 72 86 63Z"
          strokeWidth={2.7}
        />
        <Path
          d="M80 121C74 108 77 96 89 88C98 99 97 112 80 121Z"
          strokeWidth={2.6}
        />
        <Path
          d="M80 121C67 112 55 113 45 124C57 132 70 131 80 121Z"
          strokeWidth={2.6}
        />
      </G>
    </Svg>
  );
}

function MoonPhases({ compact }: { compact: boolean }) {
  const size = compact ? 30 : 36;
  const moons = [
    { mask: "left", scale: 0.66 },
    { mask: "left", scale: 0.82 },
    { mask: "full", scale: 1 },
    { mask: "right", scale: 0.82 },
    { mask: "right", scale: 0.66 },
  ] as const;

  return (
    <View style={[styles.moonWrap, compact && styles.moonWrapCompact]}>
      <View style={styles.starTopA}><Sparkle size={8} /></View>
      <View style={styles.starTopB}><Sparkle size={10} /></View>
      <View style={styles.starTopC}><Sparkle size={6} /></View>
      {moons.map((moon, index) => (
        <View key={`${moon.mask}-${index}`} style={[styles.moonSlot, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 40 40">
            <Defs>
              <SvgLinearGradient id={`moon-${index}`} x1="4" y1="5" x2="36" y2="36">
                <Stop offset="0" stopColor="#F1DEAA" />
                <Stop offset="0.55" stopColor="#C7A15B" />
                <Stop offset="1" stopColor="#EFE1B8" />
              </SvgLinearGradient>
            </Defs>
            <G transform={`translate(20 20) scale(${moon.scale}) translate(-20 -20)`}>
              <Circle cx={20} cy={20} r={12} fill={`url(#moon-${index})`} opacity={moon.mask === "full" ? 0.92 : 0.78} />
              {moon.mask === "left" && <Circle cx={26} cy={17} r={13} fill="#F5E3D1" opacity={0.92} />}
              {moon.mask === "right" && <Circle cx={14} cy={17} r={13} fill="#F5E3D1" opacity={0.92} />}
            </G>
          </Svg>
        </View>
      ))}
    </View>
  );
}

function WaveTrails() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Path d="M-25 540C52 414 24 296 145 222C223 174 277 86 302 -32" stroke="rgba(255,255,255,0.58)" strokeWidth={7} strokeLinecap="round" fill="none" />
        <Path d="M-8 565C68 432 48 328 162 244C244 184 284 92 318 -28" stroke="rgba(226,154,190,0.22)" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M-25 720C86 616 104 487 222 412C305 360 341 264 390 176" stroke="rgba(255,255,255,0.50)" strokeWidth={6} strokeLinecap="round" fill="none" />
        <Path d="M36 860C126 725 134 596 250 521C331 468 340 368 411 258" stroke="rgba(196,176,225,0.22)" strokeWidth={4} strokeLinecap="round" fill="none" />
      </Svg>
    </View>
  );
}

function BotanicalScene({ width, height }: { width: number; height: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.topFlower, { right: -24 }]}>
        <PetalBloom />
      </View>
      <View style={[styles.lavenderRight, { top: height * 0.14, right: -8 }]}>
        <LavenderSprigs />
      </View>
      <View style={[styles.lavenderLeft, { top: height * 0.36, left: -24 }]}>
        <LavenderSprigs flip />
      </View>
      <View style={[styles.sageRight, { top: height * 0.39, right: -14 }]}>
        <SageBranch />
      </View>
      <View style={[styles.sageBottomRight, { right: -18, bottom: 62 }]}>
        <SageBranch />
      </View>
      <View style={[styles.sageBottomLeft, { left: -32, bottom: 72, opacity: 0.42 }]}>
        <SageBranch flip />
      </View>
      <View style={[styles.bottomSparkle, { left: width * 0.80, bottom: 24 }]}>
        <Sparkle size={26} pale />
      </View>
    </View>
  );
}

function GoldSpeckles() {
  const dots = [
    [38, 78], [86, 54], [205, 92], [335, 72], [59, 232], [289, 206],
    [18, 448], [361, 410], [96, 596], [232, 646], [311, 721], [126, 790],
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map(([left, top], i) => (
        <View
          key={`${left}-${top}`}
          style={[
            styles.speck,
            { left, top, width: i % 3 === 0 ? 2.5 : 1.5, height: i % 3 === 0 ? 2.5 : 1.5, opacity: i % 2 ? 0.42 : 0.72 },
          ]}
        />
      ))}
    </View>
  );
}

function LavenderSprigs({ flip = false }: { flip?: boolean }) {
  return (
    <Svg width={98} height={210} viewBox="0 0 98 210" fill="none" style={{ transform: [{ scaleX: flip ? -1 : 1 }] }}>
      <G opacity={0.66}>
        <Path d="M48 204C36 153 45 94 69 21" stroke="#796E64" strokeWidth={2.1} strokeLinecap="round" />
        <Path d="M72 206C62 152 66 94 91 35" stroke="#796E64" strokeWidth={1.8} strokeLinecap="round" />
        {Array.from({ length: 12 }).map((_, i) => (
          <Ellipse key={`a-${i}`} cx={66 - i * 1.9} cy={30 + i * 10.4} rx={4.1} ry={8.8} fill="#81749E" transform={`rotate(${i % 2 ? -34 : 34} ${66 - i * 1.9} ${30 + i * 10.4})`} opacity={0.72} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <Ellipse key={`b-${i}`} cx={88 - i * 1.8} cy={45 + i * 11} rx={3.5} ry={7.6} fill="#81749E" transform={`rotate(${i % 2 ? -30 : 32} ${88 - i * 1.8} ${45 + i * 11})`} opacity={0.58} />
        ))}
      </G>
    </Svg>
  );
}

function SageBranch({ flip = false }: { flip?: boolean }) {
  return (
    <Svg width={132} height={176} viewBox="0 0 132 176" fill="none" style={{ transform: [{ scaleX: flip ? -1 : 1 }] }}>
      <G opacity={0.74}>
        <Path d="M22 164C45 119 67 78 116 18" stroke="#707C61" strokeWidth={2.2} strokeLinecap="round" />
        {[
          [44, 126, -48], [58, 106, -34], [73, 86, -25], [91, 64, -18],
          [39, 138, 132], [55, 119, 142], [73, 98, 151], [93, 75, 158],
        ].map(([cx, cy, rot], i) => (
          <Ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={10} ry={22} fill="#6E8265" transform={`rotate(${rot} ${cx} ${cy})`} opacity={i < 4 ? 0.74 : 0.54} />
        ))}
      </G>
    </Svg>
  );
}

function PetalBloom() {
  return (
    <Svg width={128} height={128} viewBox="0 0 128 128" fill="none">
      <G opacity={0.24} fill="#D98986">
        <Ellipse cx={64} cy={25} rx={14} ry={38} />
        <Ellipse cx={64} cy={103} rx={14} ry={38} />
        <Ellipse cx={25} cy={64} rx={38} ry={14} />
        <Ellipse cx={103} cy={64} rx={38} ry={14} />
        <Ellipse cx={36} cy={36} rx={14} ry={35} transform="rotate(-45 36 36)" />
        <Ellipse cx={92} cy={92} rx={14} ry={35} transform="rotate(-45 92 92)" />
      </G>
    </Svg>
  );
}

function Sparkle({ size, pale = false }: { size: number; pale?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 1.8C13.7 8.3 15.7 10.3 22.2 12C15.7 13.7 13.7 15.7 12 22.2C10.3 15.7 8.3 13.7 1.8 12C8.3 10.3 10.3 8.3 12 1.8Z" fill={pale ? "rgba(255,255,255,0.74)" : C.gold} opacity={pale ? 0.86 : 0.72} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4D6CB",
    overflow: "hidden",
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 10,
  },
  contentCompact: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  meshOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  meshOrbPink: {
    width: 250,
    height: 250,
    left: -86,
    top: -38,
    backgroundColor: "rgba(210,112,126,0.22)",
  },
  meshOrbPeach: {
    width: 280,
    height: 280,
    right: -118,
    top: 118,
    backgroundColor: "rgba(255,198,137,0.22)",
  },
  meshOrbSage: {
    width: 330,
    height: 330,
    right: -90,
    bottom: -42,
    backgroundColor: "rgba(153,188,164,0.22)",
  },
  meshOrbRose: {
    width: 210,
    height: 210,
    left: -70,
    bottom: 170,
    backgroundColor: "rgba(218,154,168,0.15)",
  },
  logoStage: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  logoGlow: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.20)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.86,
    shadowRadius: 22,
  },
  logoHalo: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.70)",
  },
  logoCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,246,240,0.50)",
    borderWidth: 1.35,
    borderColor: "rgba(169,103,86,0.72)",
  },
  copyBlock: {
    marginTop: 48,
    alignItems: "center",
  },
  headline: {
    fontFamily: F.uiRegular,
    fontSize: 34,
    lineHeight: 42,
    color: C.ink,
    textAlign: "center",
    letterSpacing: 0,
  },
  headlineCompact: {
    fontSize: 30,
    lineHeight: 37,
  },
  subhead: {
    marginTop: 16,
    fontFamily: F.uiRegular,
    fontSize: 16,
    lineHeight: 23,
    color: C.ink,
    textAlign: "center",
    letterSpacing: 0,
  },
  subheadCompact: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  moonWrap: {
    marginTop: 46,
    height: 44,
    minWidth: 202,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  moonWrapCompact: {
    marginTop: 28,
  },
  moonSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  starTopA: {
    position: "absolute",
    left: 18,
    top: -2,
  },
  starTopB: {
    position: "absolute",
    left: 96,
    top: -8,
  },
  starTopC: {
    position: "absolute",
    right: 32,
    top: 0,
  },
  actionBlock: {
    width: "100%",
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: 16,
  },
  primaryShell: {
    width: "100%",
    borderRadius: 999,
    shadowColor: "#D75F35",
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 6,
  },
  primaryButton: {
    height: 66,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  primaryText: {
    fontFamily: F.uiBlack,
    fontSize: 18,
    color: "#FFF8F4",
    letterSpacing: 0,
  },
  loginButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 24,
  },
  loginText: {
    fontFamily: F.uiBold,
    fontSize: 18,
    color: C.ink,
    letterSpacing: 0,
  },
  footer: {
    fontFamily: F.uiMedium,
    fontSize: 11,
    color: C.footer,
    textAlign: "center",
    marginBottom: 4,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  pressedSoft: {
    opacity: 0.68,
  },
  topFlower: {
    position: "absolute",
    top: -18,
  },
  lavenderRight: {
    position: "absolute",
    transform: [{ rotate: "-15deg" }],
  },
  lavenderLeft: {
    position: "absolute",
    transform: [{ rotate: "18deg" }],
  },
  sageRight: {
    position: "absolute",
    transform: [{ rotate: "-18deg" }],
  },
  sageBottomRight: {
    position: "absolute",
    transform: [{ rotate: "12deg" }],
  },
  sageBottomLeft: {
    position: "absolute",
    transform: [{ rotate: "-10deg" }],
  },
  bottomSparkle: {
    position: "absolute",
  },
  speck: {
    position: "absolute",
    borderRadius: 99,
    backgroundColor: C.gold,
  },
});
