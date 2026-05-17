import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Variant = "cycle" | "dashboard" | "insights" | "wellness" | "nourish" | "profile" | "bloop" | "pregnancy" | "teen" | "fertility" | "menopause" | "vault";

type Particle = {
  icon: MaterialIconName;
  color: string;
  size: number;
  side: "left" | "right";
  top: number;
  delay: number;
  duration: number;
};

const palettes: Record<
  Variant,
  {
    base: string;
    glowA: string;
    glowB: string;
    glowC: string;
    particles: Particle[];
  }
> = {
  cycle: {
    base: "#FAF9F6",
    glowA: "rgba(241,167,196,0.10)",
    glowB: "rgba(255,209,102,0.08)",
    glowC: "rgba(189,178,255,0.09)",
    particles: [
      { icon: "bandage", color: "#F1A7C4", size: 18, side: "left", top: 92, delay: 0, duration: 900 },
      { icon: "water", color: "#E07A5F", size: 17, side: "right", top: 182, delay: 180, duration: 950 },
      { icon: "flower-outline", color: "#F1A7C4", size: 19, side: "left", top: 328, delay: 360, duration: 1000 },
      { icon: "moon-waning-crescent", color: "#BDB2FF", size: 18, side: "right", top: 514, delay: 540, duration: 920 }
    ]
  },
  dashboard: {
    base: "#FAF9F6",
    glowA: "rgba(129,178,154,0.12)",
    glowB: "rgba(224,122,95,0.08)",
    glowC: "rgba(189,178,255,0.08)",
    particles: [
      { icon: "heart-pulse", color: "#E07A5F", size: 18, side: "left", top: 110, delay: 80, duration: 950 },
      { icon: "chart-donut", color: "#81B29A", size: 18, side: "right", top: 270, delay: 260, duration: 980 },
      { icon: "weather-night", color: "#BDB2FF", size: 18, side: "left", top: 480, delay: 460, duration: 920 },
      { icon: "cup-water", color: "#81B29A", size: 17, side: "right", top: 620, delay: 620, duration: 980 }
    ]
  },
  insights: {
    base: "#FAF9F6",
    glowA: "rgba(189,178,255,0.13)",
    glowB: "rgba(129,178,154,0.10)",
    glowC: "rgba(224,122,95,0.07)",
    particles: [
      { icon: "chart-timeline-variant-shimmer", color: "#BDB2FF", size: 18, side: "left", top: 118, delay: 0, duration: 980 },
      { icon: "brain", color: "#81B29A", size: 18, side: "right", top: 316, delay: 220, duration: 940 },
      { icon: "auto-fix", color: "#E07A5F", size: 17, side: "left", top: 560, delay: 440, duration: 1000 },
      { icon: "head-heart-outline", color: "#BDB2FF", size: 18, side: "right", top: 654, delay: 640, duration: 950 }
    ]
  },
  wellness: {
    base: "#FAF9F6",
    glowA: "rgba(129,178,154,0.13)",
    glowB: "rgba(189,178,255,0.10)",
    glowC: "rgba(244,162,97,0.08)",
    particles: [
      { icon: "flower-outline", color: "#81B29A", size: 19, side: "right", top: 106, delay: 120, duration: 960 },
      { icon: "weather-windy", color: "#BDB2FF", size: 18, side: "left", top: 292, delay: 300, duration: 980 },
      { icon: "yoga", color: "#E07A5F", size: 18, side: "right", top: 512, delay: 520, duration: 930 },
      { icon: "spa-outline", color: "#81B29A", size: 18, side: "left", top: 646, delay: 700, duration: 970 }
    ]
  },
  nourish: {
    base: "#FAF9F6",
    glowA: "rgba(224,122,95,0.10)",
    glowB: "rgba(244,162,97,0.12)",
    glowC: "rgba(129,178,154,0.12)",
    particles: [
      { icon: "leaf", color: "#81B29A", size: 19, side: "left", top: 102, delay: 120, duration: 950 },
      { icon: "food-apple-outline", color: "#E07A5F", size: 18, side: "right", top: 284, delay: 300, duration: 990 },
      { icon: "cup-water", color: "#81B29A", size: 18, side: "left", top: 494, delay: 520, duration: 920 },
      { icon: "tea", color: "#F4A261", size: 18, side: "right", top: 620, delay: 720, duration: 980 }
    ]
  },
  profile: {
    base: "#FAF9F6",
    glowA: "rgba(244,162,97,0.10)",
    glowB: "rgba(129,178,154,0.11)",
    glowC: "rgba(189,178,255,0.13)",
    particles: [
      { icon: "account-heart-outline", color: "#E07A5F", size: 18, side: "left", top: 104, delay: 120, duration: 960 },
      { icon: "head-heart-outline", color: "#81B29A", size: 18, side: "right", top: 286, delay: 320, duration: 940 },
      { icon: "watch-variant", color: "#BDB2FF", size: 18, side: "left", top: 486, delay: 540, duration: 980 },
      { icon: "star-four-points-outline", color: "#F4A261", size: 18, side: "right", top: 626, delay: 740, duration: 940 }
    ]
  },
  bloop: {
    base: "#FAF9F6",
    glowA: "rgba(189,178,255,0.15)",
    glowB: "rgba(129,178,154,0.12)",
    glowC: "rgba(224,122,95,0.08)",
    particles: [
      { icon: "message-text-outline", color: "#BDB2FF", size: 18, side: "left", top: 112, delay: 120, duration: 940 },
      { icon: "head-heart-outline", color: "#81B29A", size: 18, side: "right", top: 292, delay: 300, duration: 970 },
      { icon: "microphone-outline", color: "#E07A5F", size: 18, side: "left", top: 510, delay: 520, duration: 940 },
      { icon: "auto-fix", color: "#F4A261", size: 18, side: "right", top: 644, delay: 720, duration: 980 }
    ]
  },
  pregnancy: {
    base: "#FAF9F6",
    glowA: "rgba(244,162,97,0.13)",
    glowB: "rgba(129,178,154,0.11)",
    glowC: "rgba(189,178,255,0.09)",
    particles: [
      { icon: "mother-heart", color: "#E07A5F", size: 18, side: "left", top: 118, delay: 100, duration: 980 },
      { icon: "baby-face-outline", color: "#F4A261", size: 18, side: "right", top: 278, delay: 300, duration: 1020 },
      { icon: "leaf", color: "#81B29A", size: 18, side: "left", top: 500, delay: 520, duration: 960 },
      { icon: "cup-water", color: "#81B29A", size: 17, side: "right", top: 652, delay: 720, duration: 980 }
    ]
  },
  teen: {
    base: "#FAF9F6",
    glowA: "rgba(168,218,220,0.14)",
    glowB: "rgba(189,178,255,0.14)",
    glowC: "rgba(244,162,97,0.08)",
    particles: [
      { icon: "cloud-outline", color: "#A8DADC", size: 18, side: "left", top: 110, delay: 120, duration: 960 },
      { icon: "star-four-points-outline", color: "#BDB2FF", size: 18, side: "right", top: 270, delay: 320, duration: 940 },
      { icon: "face-woman-shimmer-outline", color: "#F4A261", size: 18, side: "left", top: 476, delay: 540, duration: 980 },
      { icon: "heart-outline", color: "#81B29A", size: 17, side: "right", top: 640, delay: 740, duration: 960 }
    ]
  },
  fertility: {
    base: "#FAF9F6",
    glowA: "rgba(246,193,119,0.15)",
    glowB: "rgba(244,162,97,0.12)",
    glowC: "rgba(129,178,154,0.10)",
    particles: [
      { icon: "flower-outline", color: "#F6C177", size: 18, side: "left", top: 112, delay: 100, duration: 960 },
      { icon: "chart-bell-curve", color: "#E07A5F", size: 18, side: "right", top: 286, delay: 300, duration: 980 },
      { icon: "water-outline", color: "#81B29A", size: 18, side: "left", top: 506, delay: 520, duration: 940 },
      { icon: "white-balance-sunny", color: "#F6C177", size: 18, side: "right", top: 654, delay: 720, duration: 980 }
    ]
  },
  menopause: {
    base: "#FAF9F6",
    glowA: "rgba(231,216,201,0.16)",
    glowB: "rgba(129,178,154,0.12)",
    glowC: "rgba(215,166,161,0.12)",
    particles: [
      { icon: "weather-night", color: "#BDB2FF", size: 18, side: "left", top: 112, delay: 120, duration: 960 },
      { icon: "thermometer-lines", color: "#D7A6A1", size: 18, side: "right", top: 286, delay: 320, duration: 980 },
      { icon: "leaf", color: "#81B29A", size: 18, side: "left", top: 506, delay: 540, duration: 940 },
      { icon: "spa-outline", color: "#E7D8C9", size: 18, side: "right", top: 654, delay: 740, duration: 980 }
    ]
  },
  vault: {
    base: "#FAF9F6",
    glowA: "rgba(189,178,255,0.12)",
    glowB: "rgba(43,45,66,0.08)",
    glowC: "rgba(244,162,97,0.08)",
    particles: [
      { icon: "shield-lock-outline", color: "#2B2D42", size: 18, side: "left", top: 116, delay: 120, duration: 960 },
      { icon: "fingerprint", color: "#BDB2FF", size: 18, side: "right", top: 286, delay: 320, duration: 980 },
      { icon: "cloud-lock-outline", color: "#81B29A", size: 18, side: "left", top: 506, delay: 540, duration: 940 },
      { icon: "key-variant", color: "#F4A261", size: 18, side: "right", top: 654, delay: 740, duration: 980 }
    ]
  }
};

export function ContextualAuraBackground({ variant }: { variant: Variant }) {
  const width = Dimensions.get("window").width;
  const config = palettes[variant];
  const blob = useRef(new Animated.Value(0)).current;
  const values = useRef(config.particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const blobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blob, { toValue: 1, duration: 3800, useNativeDriver: true }),
        Animated.timing(blob, { toValue: 0, duration: 3800, useNativeDriver: true })
      ])
    );
    const entrances = values.map((value, index) => {
      const item = config.particles[index];
      const entrance = Animated.sequence([
        Animated.delay(item.delay),
        Animated.spring(value, {
          toValue: 1,
          damping: 18,
          mass: 0.9,
          stiffness: 72,
          useNativeDriver: true
        })
      ]);
      entrance.start();
      return entrance;
    });

    const delayedFade = values.map((value, index) => {
      const item = config.particles[index];
      const fade = Animated.sequence([
        Animated.delay(item.delay + item.duration + 2800),
        Animated.timing(value, {
          toValue: 0.72,
          duration: 1200,
          useNativeDriver: true
        })
      ]);
      fade.start();
      return fade;
    });

    blobLoop.start();
    return () => {
      blobLoop.stop();
      entrances.forEach((animation) => animation.stop());
      delayedFade.forEach((animation) => animation.stop());
    };
  }, [blob, config.particles, values]);

  const drift = blob.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const reverseDrift = blob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const scale = blob.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });

  return (
    <View pointerEvents="none" style={[styles.layer, { backgroundColor: config.base }]}>
      <Animated.View style={[styles.washA, { backgroundColor: config.glowA, transform: [{ translateY: drift }, { rotate: "-12deg" }] }]} />
      <Animated.View style={[styles.washB, { backgroundColor: config.glowB, transform: [{ translateY: reverseDrift }, { rotate: "18deg" }] }]} />
      <Animated.View style={[styles.washC, { backgroundColor: config.glowC, transform: [{ translateX: drift }, { scale }, { rotate: "-8deg" }] }]} />
      <VariantArtwork motion={blob} variant={variant} />

      {config.particles.map((item, index) => {
        const value = values[index];
        const settleX = item.side === "left" ? 20 + (index % 2) * 34 : width - 66 - (index % 2) * 32;
        const translateX = value.interpolate({
          inputRange: [0, 1],
          outputRange: item.side === "left" ? [-76, settleX] : [width + 42, settleX]
        });
        const entryLift = value.interpolate({
          inputRange: [0, 1],
          outputRange: [item.side === "left" ? 10 : -10, 0]
        });
        const translateY = Animated.add(entryLift, index % 2 === 0 ? drift : reverseDrift);
        const opacity = value.interpolate({
          inputRange: [0, 0.72, 1],
          outputRange: [0, 0.12, 0.26]
        });
        const rotate = value.interpolate({
          inputRange: [0, 1],
          outputRange: item.side === "left" ? ["-18deg", "-5deg"] : ["18deg", "5deg"]
        });

        return (
          <Animated.View
            key={`${variant}-${item.icon}-${item.top}`}
            style={[
              styles.particle,
              index % 2 === 0 ? styles.particleSoftSquare : styles.particleSoftCircle,
              {
                top: item.top,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }]
              }
            ]}
          >
            <MaterialCommunityIcons name={item.icon} size={item.size} color={item.color} />
          </Animated.View>
        );
      })}
    </View>
  );
}

function VariantArtwork({ motion, variant }: { motion: Animated.Value; variant: Variant }) {
  const breathe = motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const drift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const reverse = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });
  const fade = motion.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.28] });

  if (variant === "cycle") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.cycleRibbon, styles.cycleRibbonOne, { opacity: fade, transform: [{ translateY: drift }, { rotate: "-18deg" }] }]} />
        <Animated.View style={[styles.cycleRibbon, styles.cycleRibbonTwo, { opacity: fade, transform: [{ translateY: reverse }, { rotate: "16deg" }] }]} />
        <Animated.View style={[styles.cyclePad, styles.cyclePadOne, { transform: [{ scale: breathe }] }]}>
          <View style={styles.cyclePadLine} />
          <View style={styles.cyclePadDot} />
        </Animated.View>
        <Animated.View style={[styles.cyclePad, styles.cyclePadTwo, { transform: [{ scale: breathe }] }]}>
          <View style={styles.cyclePadLine} />
          <View style={styles.cyclePadDot} />
        </Animated.View>
      </View>
    );
  }

  if (variant === "dashboard") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.dashboardRing, styles.dashboardRingOne, { transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.dashboardRing, styles.dashboardRingTwo, { transform: [{ scale: breathe }] }]} />
        <View style={styles.dashboardMetricLine} />
        <View style={[styles.dashboardMetricDot, styles.dashboardMetricDotOne]} />
        <View style={[styles.dashboardMetricDot, styles.dashboardMetricDotTwo]} />
        <View style={[styles.dashboardMetricDot, styles.dashboardMetricDotThree]} />
      </View>
    );
  }

  if (variant === "insights") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.insightConstellation, { transform: [{ translateY: drift }] }]}>
          <View style={[styles.constellationLine, styles.constellationLineOne]} />
          <View style={[styles.constellationLine, styles.constellationLineTwo]} />
          <View style={[styles.constellationNode, styles.constellationNodeOne]} />
          <View style={[styles.constellationNode, styles.constellationNodeTwo]} />
          <View style={[styles.constellationNode, styles.constellationNodeThree]} />
        </Animated.View>
        <Animated.View style={[styles.insightOrbital, { opacity: fade, transform: [{ scale: breathe }] }]} />
      </View>
    );
  }

  if (variant === "wellness") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.breathHalo, styles.breathHaloOne, { transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.breathHalo, styles.breathHaloTwo, { transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.wellnessPetal, styles.wellnessPetalOne, { transform: [{ translateY: drift }, { rotate: "-28deg" }] }]} />
        <Animated.View style={[styles.wellnessPetal, styles.wellnessPetalTwo, { transform: [{ translateY: reverse }, { rotate: "24deg" }] }]} />
      </View>
    );
  }

  if (variant === "nourish") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.nourishLeaf, styles.nourishLeafOne, { transform: [{ translateY: drift }, { rotate: "-24deg" }] }]} />
        <Animated.View style={[styles.nourishLeaf, styles.nourishLeafTwo, { transform: [{ translateY: reverse }, { rotate: "30deg" }] }]} />
        <View style={styles.nourishPlate}>
          <View style={styles.nourishPlateInner} />
        </View>
        <View style={[styles.nourishSeed, styles.nourishSeedOne]} />
        <View style={[styles.nourishSeed, styles.nourishSeedTwo]} />
        <View style={[styles.nourishSeed, styles.nourishSeedThree]} />
      </View>
    );
  }

  if (variant === "bloop") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.bloopHalo, styles.bloopHaloOne, { transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.bloopHalo, styles.bloopHaloTwo, { transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.bloopWave, styles.bloopWaveOne, { transform: [{ translateY: drift }, { rotate: "-16deg" }] }]} />
        <Animated.View style={[styles.bloopWave, styles.bloopWaveTwo, { transform: [{ translateY: reverse }, { rotate: "18deg" }] }]} />
        <View style={[styles.bloopNode, styles.bloopNodeOne]} />
        <View style={[styles.bloopNode, styles.bloopNodeTwo]} />
      </View>
    );
  }

  if (variant === "pregnancy") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.maternalHalo, styles.maternalHaloOne, { transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.maternalHalo, styles.maternalHaloTwo, { transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.maternalNest, { opacity: fade, transform: [{ translateY: drift }, { rotate: "-12deg" }] }]}>
          <View style={styles.maternalNestInner} />
        </Animated.View>
        <Animated.View style={[styles.maternalWave, styles.maternalWaveOne, { transform: [{ translateY: reverse }, { rotate: "15deg" }] }]} />
        <Animated.View style={[styles.maternalSeed, styles.maternalSeedOne, { transform: [{ translateY: drift }] }]} />
        <Animated.View style={[styles.maternalSeed, styles.maternalSeedTwo, { transform: [{ translateY: reverse }] }]} />
      </View>
    );
  }

  if (variant === "teen") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.teenRibbon, styles.teenRibbonOne, { transform: [{ translateY: drift }, { rotate: "-14deg" }] }]} />
        <Animated.View style={[styles.teenRibbon, styles.teenRibbonTwo, { transform: [{ translateY: reverse }, { rotate: "16deg" }] }]} />
        <Animated.View style={[styles.teenHalo, styles.teenHaloOne, { opacity: fade, transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.teenHalo, styles.teenHaloTwo, { opacity: fade, transform: [{ scale: breathe }] }]} />
        <View style={[styles.teenPetal, styles.teenPetalOne]} />
        <View style={[styles.teenPetal, styles.teenPetalTwo]} />
        <View style={[styles.teenSpark, styles.teenSparkOne]} />
        <View style={[styles.teenSpark, styles.teenSparkTwo]} />
      </View>
    );
  }

  if (variant === "fertility") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.fertilityHalo, styles.fertilityHaloOne, { opacity: fade, transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.fertilityHalo, styles.fertilityHaloTwo, { opacity: fade, transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.fertilityRibbon, styles.fertilityRibbonOne, { transform: [{ translateY: drift }, { rotate: "-16deg" }] }]} />
        <Animated.View style={[styles.fertilityRibbon, styles.fertilityRibbonTwo, { transform: [{ translateY: reverse }, { rotate: "14deg" }] }]} />
        <View style={styles.fertilitySeed}>
          <View style={styles.fertilitySeedInner} />
        </View>
        <View style={[styles.fertilityDot, styles.fertilityDotOne]} />
        <View style={[styles.fertilityDot, styles.fertilityDotTwo]} />
        <View style={[styles.fertilityDot, styles.fertilityDotThree]} />
      </View>
    );
  }

  if (variant === "menopause") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.transitionHalo, styles.transitionHaloOne, { opacity: fade, transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.transitionHalo, styles.transitionHaloTwo, { opacity: fade, transform: [{ scale: breathe }] }]} />
        <Animated.View style={[styles.transitionWave, styles.transitionWaveOne, { transform: [{ translateY: drift }, { rotate: "-12deg" }] }]} />
        <Animated.View style={[styles.transitionWave, styles.transitionWaveTwo, { transform: [{ translateY: reverse }, { rotate: "14deg" }] }]} />
        <View style={[styles.transitionPetal, styles.transitionPetalOne]} />
        <View style={[styles.transitionPetal, styles.transitionPetalTwo]} />
        <View style={styles.transitionComfortBar}>
          <View style={styles.transitionComfortFill} />
        </View>
      </View>
    );
  }

  if (variant === "vault") {
    return (
      <View style={styles.artLayer}>
        <Animated.View style={[styles.vaultShield, { opacity: fade, transform: [{ scale: breathe }] }]}>
          <View style={styles.vaultShieldInner} />
        </Animated.View>
        <Animated.View style={[styles.vaultArc, styles.vaultArcOne, { transform: [{ translateY: drift }, { rotate: "-14deg" }] }]} />
        <Animated.View style={[styles.vaultArc, styles.vaultArcTwo, { transform: [{ translateY: reverse }, { rotate: "14deg" }] }]} />
        <View style={styles.vaultKeyLine} />
        <View style={[styles.vaultNode, styles.vaultNodeOne]} />
        <View style={[styles.vaultNode, styles.vaultNodeTwo]} />
      </View>
    );
  }

  return (
    <View style={styles.artLayer}>
      <Animated.View style={[styles.profileHalo, styles.profileHaloOne, { transform: [{ scale: breathe }] }]} />
      <Animated.View style={[styles.profileHalo, styles.profileHaloTwo, { transform: [{ scale: breathe }] }]} />
      <View style={styles.profileCardGhost} />
      <View style={styles.profileBadgeGhost} />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden"
  },
  washA: {
    position: "absolute",
    top: 42,
    left: -118,
    width: 310,
    height: 96,
    borderRadius: 80
  },
  washB: {
    position: "absolute",
    top: 288,
    right: -138,
    width: 330,
    height: 104,
    borderRadius: 84
  },
  washC: {
    position: "absolute",
    bottom: 122,
    left: -92,
    width: 290,
    height: 88,
    borderRadius: 74
  },
  particle: {
    position: "absolute",
    left: 0,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)"
  },
  particleSoftSquare: {
    borderRadius: 15
  },
  particleSoftCircle: {
    borderRadius: 20
  },
  artLayer: {
    ...StyleSheet.absoluteFillObject
  },
  cycleRibbon: {
    position: "absolute",
    width: 220,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(241,167,196,0.12)"
  },
  cycleRibbonOne: {
    top: 146,
    left: -76
  },
  cycleRibbonTwo: {
    bottom: 126,
    right: -82,
    backgroundColor: "rgba(224,122,95,0.09)"
  },
  cyclePad: {
    position: "absolute",
    width: 54,
    height: 92,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(241,167,196,0.22)"
  },
  cyclePadOne: {
    top: 238,
    left: 18
  },
  cyclePadTwo: {
    bottom: 184,
    right: 22,
    transform: [{ rotate: "12deg" }]
  },
  cyclePadLine: {
    width: 18,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(241,167,196,0.13)"
  },
  cyclePadDot: {
    position: "absolute",
    bottom: 18,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(224,122,95,0.24)"
  },
  dashboardRing: {
    position: "absolute",
    borderWidth: 8,
    borderColor: "rgba(129,178,154,0.12)",
    borderRadius: 999
  },
  dashboardRingOne: {
    top: 138,
    right: -48,
    width: 132,
    height: 132
  },
  dashboardRingTwo: {
    bottom: 150,
    left: -54,
    width: 152,
    height: 152,
    borderColor: "rgba(224,122,95,0.10)"
  },
  dashboardMetricLine: {
    position: "absolute",
    top: 354,
    left: 24,
    width: 112,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(129,178,154,0.18)"
  },
  dashboardMetricDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "rgba(224,122,95,0.20)"
  },
  dashboardMetricDotOne: {
    top: 347,
    left: 28
  },
  dashboardMetricDotTwo: {
    top: 336,
    left: 78
  },
  dashboardMetricDotThree: {
    top: 354,
    left: 130
  },
  insightConstellation: {
    position: "absolute",
    top: 140,
    right: 22,
    width: 128,
    height: 148
  },
  constellationLine: {
    position: "absolute",
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(189,178,255,0.18)"
  },
  constellationLineOne: {
    top: 52,
    left: 18,
    width: 88,
    transform: [{ rotate: "18deg" }]
  },
  constellationLineTwo: {
    top: 92,
    left: 32,
    width: 66,
    transform: [{ rotate: "-28deg" }]
  },
  constellationNode: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "rgba(189,178,255,0.22)"
  },
  constellationNodeOne: {
    top: 42,
    left: 12
  },
  constellationNodeTwo: {
    top: 72,
    right: 10
  },
  constellationNodeThree: {
    bottom: 28,
    left: 40
  },
  insightOrbital: {
    position: "absolute",
    bottom: 138,
    left: -46,
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 1,
    borderColor: "rgba(189,178,255,0.18)"
  },
  breathHalo: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(129,178,154,0.17)"
  },
  breathHaloOne: {
    top: 172,
    left: 18,
    width: 164,
    height: 164
  },
  breathHaloTwo: {
    bottom: 126,
    right: 16,
    width: 142,
    height: 142,
    borderColor: "rgba(189,178,255,0.16)"
  },
  wellnessPetal: {
    position: "absolute",
    width: 52,
    height: 92,
    borderRadius: 999,
    backgroundColor: "rgba(129,178,154,0.12)"
  },
  wellnessPetalOne: {
    top: 116,
    right: 28
  },
  wellnessPetalTwo: {
    bottom: 230,
    left: 22,
    backgroundColor: "rgba(244,162,97,0.10)"
  },
  nourishLeaf: {
    position: "absolute",
    width: 64,
    height: 112,
    borderTopLeftRadius: 64,
    borderBottomRightRadius: 64,
    backgroundColor: "rgba(129,178,154,0.13)"
  },
  nourishLeafOne: {
    top: 128,
    left: 18
  },
  nourishLeafTwo: {
    bottom: 168,
    right: 24,
    backgroundColor: "rgba(244,162,97,0.12)"
  },
  nourishPlate: {
    position: "absolute",
    top: 350,
    right: -36,
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 10,
    borderColor: "rgba(224,122,95,0.10)",
    alignItems: "center",
    justifyContent: "center"
  },
  nourishPlateInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(244,162,97,0.08)"
  },
  nourishSeed: {
    position: "absolute",
    width: 9,
    height: 15,
    borderRadius: 8,
    backgroundColor: "rgba(224,122,95,0.18)"
  },
  nourishSeedOne: {
    top: 238,
    right: 58,
    transform: [{ rotate: "24deg" }]
  },
  nourishSeedTwo: {
    top: 258,
    right: 82,
    transform: [{ rotate: "-18deg" }]
  },
  nourishSeedThree: {
    top: 286,
    right: 50,
    transform: [{ rotate: "12deg" }]
  },
  profileHalo: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 999,
    borderColor: "rgba(244,162,97,0.16)"
  },
  profileHaloOne: {
    top: 110,
    left: 28,
    width: 116,
    height: 116
  },
  profileHaloTwo: {
    bottom: 168,
    right: -28,
    width: 154,
    height: 154,
    borderColor: "rgba(189,178,255,0.16)"
  },
  profileCardGhost: {
    position: "absolute",
    top: 308,
    left: -38,
    width: 126,
    height: 82,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  profileBadgeGhost: {
    position: "absolute",
    right: 26,
    top: 454,
    width: 92,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(129,178,154,0.12)"
  },
  bloopHalo: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(189,178,255,0.18)"
  },
  bloopHaloOne: {
    top: 116,
    right: 24,
    width: 152,
    height: 152
  },
  bloopHaloTwo: {
    bottom: 146,
    left: -30,
    width: 170,
    height: 170,
    borderColor: "rgba(129,178,154,0.15)"
  },
  bloopWave: {
    position: "absolute",
    width: 220,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(189,178,255,0.10)"
  },
  bloopWaveOne: {
    top: 260,
    left: -86
  },
  bloopWaveTwo: {
    bottom: 256,
    right: -92,
    backgroundColor: "rgba(224,122,95,0.08)"
  },
  bloopNode: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(189,178,255,0.24)"
  },
  bloopNodeOne: {
    top: 210,
    left: 46
  },
  bloopNodeTwo: {
    bottom: 202,
    right: 54,
    backgroundColor: "rgba(129,178,154,0.22)"
  },
  maternalHalo: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(244,162,97,0.16)"
  },
  maternalHaloOne: {
    top: 108,
    right: -18,
    width: 176,
    height: 176
  },
  maternalHaloTwo: {
    bottom: 154,
    left: -34,
    width: 190,
    height: 190,
    borderColor: "rgba(129,178,154,0.15)"
  },
  maternalNest: {
    position: "absolute",
    top: 296,
    left: 34,
    width: 128,
    height: 92,
    borderRadius: 58,
    borderWidth: 13,
    borderColor: "rgba(244,162,97,0.13)",
    alignItems: "center",
    justifyContent: "center"
  },
  maternalNestInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(224,122,95,0.10)"
  },
  maternalWave: {
    position: "absolute",
    width: 210,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(189,178,255,0.08)"
  },
  maternalWaveOne: {
    top: 430,
    right: -86
  },
  maternalSeed: {
    position: "absolute",
    width: 18,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(129,178,154,0.15)"
  },
  maternalSeedOne: {
    top: 214,
    left: 58,
    transform: [{ rotate: "22deg" }]
  },
  maternalSeedTwo: {
    bottom: 286,
    right: 64,
    backgroundColor: "rgba(244,162,97,0.14)",
    transform: [{ rotate: "-18deg" }]
  },
  teenRibbon: {
    position: "absolute",
    width: 236,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(168,218,220,0.12)"
  },
  teenRibbonOne: {
    top: 150,
    left: -82
  },
  teenRibbonTwo: {
    bottom: 214,
    right: -92,
    backgroundColor: "rgba(189,178,255,0.12)"
  },
  teenHalo: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(168,218,220,0.20)"
  },
  teenHaloOne: {
    top: 96,
    right: -26,
    width: 162,
    height: 162
  },
  teenHaloTwo: {
    bottom: 162,
    left: -38,
    width: 188,
    height: 188,
    borderColor: "rgba(189,178,255,0.18)"
  },
  teenPetal: {
    position: "absolute",
    width: 46,
    height: 82,
    borderRadius: 999,
    backgroundColor: "rgba(189,178,255,0.14)"
  },
  teenPetalOne: {
    top: 318,
    left: 34,
    transform: [{ rotate: "22deg" }]
  },
  teenPetalTwo: {
    top: 422,
    right: 34,
    backgroundColor: "rgba(168,218,220,0.15)",
    transform: [{ rotate: "-24deg" }]
  },
  teenSpark: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(244,162,97,0.22)"
  },
  teenSparkOne: {
    top: 228,
    left: 84
  },
  teenSparkTwo: {
    bottom: 278,
    right: 82,
    backgroundColor: "rgba(189,178,255,0.24)"
  },
  fertilityHalo: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(246,193,119,0.22)"
  },
  fertilityHaloOne: {
    top: 92,
    right: -30,
    width: 178,
    height: 178
  },
  fertilityHaloTwo: {
    bottom: 156,
    left: -40,
    width: 196,
    height: 196,
    borderColor: "rgba(129,178,154,0.16)"
  },
  fertilityRibbon: {
    position: "absolute",
    width: 238,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(246,193,119,0.13)"
  },
  fertilityRibbonOne: {
    top: 184,
    left: -88
  },
  fertilityRibbonTwo: {
    bottom: 236,
    right: -92,
    backgroundColor: "rgba(244,162,97,0.10)"
  },
  fertilitySeed: {
    position: "absolute",
    top: 350,
    right: 28,
    width: 88,
    height: 112,
    borderRadius: 54,
    borderWidth: 12,
    borderColor: "rgba(246,193,119,0.14)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }]
  },
  fertilitySeedInner: {
    width: 28,
    height: 42,
    borderRadius: 22,
    backgroundColor: "rgba(129,178,154,0.12)"
  },
  fertilityDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(246,193,119,0.26)"
  },
  fertilityDotOne: {
    top: 256,
    left: 70
  },
  fertilityDotTwo: {
    top: 284,
    left: 104,
    backgroundColor: "rgba(224,122,95,0.18)"
  },
  fertilityDotThree: {
    bottom: 294,
    right: 78,
    backgroundColor: "rgba(129,178,154,0.20)"
  },
  transitionHalo: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(231,216,201,0.26)"
  },
  transitionHaloOne: {
    top: 108,
    right: -34,
    width: 178,
    height: 178
  },
  transitionHaloTwo: {
    bottom: 156,
    left: -42,
    width: 198,
    height: 198,
    borderColor: "rgba(129,178,154,0.16)"
  },
  transitionWave: {
    position: "absolute",
    width: 238,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(231,216,201,0.16)"
  },
  transitionWaveOne: {
    top: 188,
    left: -86
  },
  transitionWaveTwo: {
    bottom: 238,
    right: -94,
    backgroundColor: "rgba(215,166,161,0.12)"
  },
  transitionPetal: {
    position: "absolute",
    width: 52,
    height: 92,
    borderRadius: 999,
    backgroundColor: "rgba(129,178,154,0.12)"
  },
  transitionPetalOne: {
    top: 334,
    left: 34,
    transform: [{ rotate: "20deg" }]
  },
  transitionPetalTwo: {
    top: 448,
    right: 36,
    backgroundColor: "rgba(215,166,161,0.14)",
    transform: [{ rotate: "-22deg" }]
  },
  transitionComfortBar: {
    position: "absolute",
    bottom: 316,
    left: 48,
    width: 122,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(231,216,201,0.18)"
  },
  transitionComfortFill: {
    width: 78,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(129,178,154,0.20)"
  },
  vaultShield: {
    position: "absolute",
    top: 116,
    right: -16,
    width: 156,
    height: 188,
    borderTopLeftRadius: 78,
    borderTopRightRadius: 78,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    borderWidth: 1,
    borderColor: "rgba(43,45,66,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  vaultShieldInner: {
    width: 82,
    height: 104,
    borderRadius: 42,
    backgroundColor: "rgba(189,178,255,0.10)"
  },
  vaultArc: {
    position: "absolute",
    width: 238,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(189,178,255,0.10)"
  },
  vaultArcOne: {
    top: 338,
    left: -90
  },
  vaultArcTwo: {
    bottom: 238,
    right: -94,
    backgroundColor: "rgba(43,45,66,0.06)"
  },
  vaultKeyLine: {
    position: "absolute",
    bottom: 310,
    left: 46,
    width: 134,
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(43,45,66,0.10)"
  },
  vaultNode: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "rgba(244,162,97,0.22)"
  },
  vaultNodeOne: {
    bottom: 306,
    left: 78
  },
  vaultNodeTwo: {
    bottom: 306,
    left: 160,
    backgroundColor: "rgba(189,178,255,0.26)"
  }
});
