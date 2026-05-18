import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";

const expertAvatar = require("../../public/images/profile-priya-avatar.webp");

const { width: W } = Dimensions.get("window");

const C = {
  bgTop: "#FCF8F7",
  bgMid: "#FDF5F5",
  bgBottom: "#F8EAF5",
  text: "#161C2D",
  muted: "#746D84",
  faint: "#A79CB7",
  purple: "#8B63D6",
  purpleDeep: "#6040A8",
  purpleSoft: "#F4EFFF",
  rose: "#FF9A9E",
  peach: "#FFBCA6",
  green: "#6EA164",
  white: "#FFFDFC",
  card: "rgba(255,255,255,0.82)",
  border: "rgba(255,255,255,0.90)",
};

const categories = [
  { id: "emotional", label: "Emotional\nSupport", icon: "flower-outline", color: C.purple, bg: "#F4EFFF" },
  { id: "fertility", label: "Fertility\nSupport", icon: "sprout-outline", color: "#9A647E", bg: "#FFF0F4" },
  { id: "pregnancy", label: "Pregnancy\nCare", icon: "baby-carriage", color: C.purple, bg: "#F4EFFF" },
  { id: "couples", label: "Couples\nSupport", icon: "heart-outline", color: "#9A647E", bg: "#FFF0F4" },
] as const;

function HeroIllustration() {
  return (
    <Svg width={185} height={175} viewBox="0 0 185 175" style={styles.heroSvg}>
      <Defs>
        <RadialGradient id="heroAura" cx="48%" cy="42%" r="58%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
          <Stop offset="55%" stopColor="#F5E9FF" stopOpacity="0.52" />
          <Stop offset="100%" stopColor="#F5E9FF" stopOpacity="0" />
        </RadialGradient>
        <SvgLinearGradient id="mascot" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="100%" stopColor="#F3E6FB" stopOpacity="1" />
        </SvgLinearGradient>
      </Defs>

      <Circle cx={92} cy={77} r={70} fill="url(#heroAura)" stroke="rgba(255,255,255,0.70)" />

      <Path
        d="M82 51 C72 41 57 43 53 57 C49 72 37 78 40 92 C43 104 56 104 61 94"
        fill="none"
        stroke="#BCA4D1"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M78 43 C101 39 118 57 119 82 C121 103 132 112 142 119"
        fill="none"
        stroke="#D5B8CC"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Path
        d="M88 47 C112 47 128 70 128 101"
        fill="none"
        stroke="#D5B8CC"
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={0.82}
      />
      <Path
        d="M62 73 C57 77 54 84 56 89 C59 96 69 94 73 88"
        fill="none"
        stroke="#BCA4D1"
        strokeWidth={2.3}
        strokeLinecap="round"
      />
      <Path d="M58 71 C64 73 70 71 75 66" fill="none" stroke="#BCA4D1" strokeWidth={2} strokeLinecap="round" />
      <Path d="M58 81 C51 90 45 105 43 124" fill="none" stroke="#BCA4D1" strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M76 91 C95 103 103 121 109 145" fill="none" stroke="#BCA4D1" strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M58 122 C72 112 88 115 103 132" fill="none" stroke="#BCA4D1" strokeWidth={2.1} strokeLinecap="round" />
      <Path d="M78 122 C73 116 69 109 65 101" fill="none" stroke="#BCA4D1" strokeWidth={2.1} strokeLinecap="round" />

      <Circle cx={136} cy={118} r={34} fill="url(#mascot)" stroke="rgba(255,255,255,0.88)" />
      <Ellipse cx={126} cy={114} rx={4.8} ry={2.4} stroke="#6040A8" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Ellipse cx={145} cy={114} rx={4.8} ry={2.4} stroke="#6040A8" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M128 130 C133 136 140 136 145 130" fill="none" stroke="#6040A8" strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M152 132 C146 126 136 129 136 138 C136 146 148 152 152 156 C156 152 168 146 168 138 C168 129 158 126 152 132 Z"
        fill="rgba(188,164,209,0.24)"
        stroke="#C9A6E7"
        strokeWidth={2}
      />
    </Svg>
  );
}

function HeaderButton({ icon }: { icon: keyof typeof MaterialCommunityIcons.glyphMap }) {
  return (
    <Pressable style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <MaterialCommunityIcons name={icon} size={21} color={C.text} />
    </Pressable>
  );
}

function CategoryCard({ item }: { item: typeof categories[number] }) {
  return (
    <Pressable style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
      <View style={[styles.categoryIcon, { backgroundColor: item.bg }]}>
        <MaterialCommunityIcons name={item.icon} size={31} color={item.color} />
      </View>
      <Text style={styles.categoryLabel}>{item.label}</Text>
    </Pressable>
  );
}

function InfoRow({
  icon,
  title,
  subtitle,
  variant = "plain",
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  variant?: "plain" | "privacy";
}) {
  const content = (
    <>
      <View style={[styles.infoIcon, variant === "privacy" && styles.infoIconPrivacy]}>
        <MaterialCommunityIcons name={icon} size={27} color={variant === "privacy" ? "#A98BD6" : C.purple} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSubtitle}>{subtitle}</Text>
      </View>
      {variant === "privacy" ? (
        <View style={styles.lockOrb}>
          <MaterialCommunityIcons name="lock-outline" size={22} color={C.purple} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={22} color={C.faint} />
      )}
    </>
  );

  if (variant === "privacy") {
    return (
      <LinearGradient colors={["#F6EEFF", "#FAF5FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.infoCard}>
        {content}
      </LinearGradient>
    );
  }

  return <View style={styles.infoCard}>{content}</View>;
}

export default function CommunityScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <LinearGradient colors={[C.bgTop, C.bgMid, C.bgBottom]} locations={[0, 0.52, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Support</Text>
                <MaterialCommunityIcons name="heart-outline" size={26} color={C.purple} />
              </View>
              <Text style={styles.subtitle}>You don't have to do this alone</Text>
            </View>
            <View style={styles.headerActions}>
              <HeaderButton icon="bookmark-outline" />
              <HeaderButton icon="message-question-outline" />
            </View>
          </View>

          <View style={styles.heroCard}>
            <LinearGradient colors={["#FDF1F0", "#F6EAF7", "#EBE2F8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                Find support{"\n"}that meets you{"\n"}
                <Text style={styles.heroHighlight}>gently.</Text>
              </Text>
            </View>
            <HeroIllustration />
            <View style={styles.badgeRow}>
              {[
                ["shield-check-outline", "Verified"],
                ["lock-outline", "Private"],
                ["heart-outline", "Safe Space"],
              ].map(([icon, label]) => (
                <View style={styles.badge} key={label}>
                  <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={19} color={C.text} />
                  <Text style={styles.badgeText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>What do you need today?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((item) => <CategoryCard item={item} key={item.id} />)}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleInline}>Talk to an expert</Text>
            <Pressable style={styles.viewAll}>
              <Text style={styles.viewAllText}>View all</Text>
              <Ionicons name="chevron-forward" size={19} color={C.purple} />
            </Pressable>
          </View>

          <Pressable style={({ pressed }) => [styles.expertCard, pressed && styles.pressed]}>
            <View style={styles.avatarWrap}>
              <CachedImage source={expertAvatar} style={styles.avatar} contentFit="cover" />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.expertCopy}>
              <Text style={styles.expertName}>Dr. Smitha Avula</Text>
              <Text style={styles.expertSpecialty}>Emotional Wellness</Text>
              <View style={styles.availabilityRow}>
                <View style={styles.availabilityDot} />
                <Text style={styles.availabilityText}>Available today</Text>
              </View>
            </View>
            <View style={styles.expertAction}>
              <Ionicons name="chevron-forward" size={25} color={C.purple} />
            </View>
          </Pressable>

          <View style={styles.infoStack}>
            <InfoRow icon="calendar-blank-outline" title="Book a private session" subtitle="Choose a time that feels right for you." />
            <InfoRow
              icon="shield-outline"
              title="Your privacy is our priority"
              subtitle="Everything shared here stays private and protected."
              variant="privacy"
            />
          </View>

          <View style={{ height: 178 }} />
        </ScrollView>

        <View pointerEvents="box-none" style={styles.ctaWrap}>
          <Pressable onPress={() => router.push("/premium")} style={({ pressed }) => [styles.ctaShell, pressed && styles.pressed]}>
            <LinearGradient colors={[C.peach, C.rose]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
              <MaterialCommunityIcons name="heart-outline" size={25} color={C.white} />
              <Text style={styles.ctaText}>Find Gentle Support</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingBottom: 12 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerText: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: {
    fontFamily: F.luxuryBold,
    fontSize: 42,
    lineHeight: 49,
    color: C.text,
  },
  subtitle: {
    fontFamily: F.uiSemiBold,
    color: C.muted,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 4,
  },
  headerActions: { flexDirection: "row", gap: 12, paddingTop: 12 },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.64)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  heroCard: {
    height: 218,
    marginHorizontal: 20,
    marginTop: 26,
    borderRadius: 30,
    overflow: "hidden",
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.74)",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 30,
    elevation: 6,
  },
  heroCopy: { width: "52%", zIndex: 2 },
  heroTitle: {
    fontFamily: F.luxuryBold,
    color: C.text,
    fontSize: 29,
    lineHeight: 40,
  },
  heroHighlight: { color: C.purple },
  heroSvg: { position: "absolute", right: 8, top: 12 },
  badgeRow: {
    position: "absolute",
    left: 26,
    right: 18,
    bottom: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 3,
  },
  badge: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgeText: { fontFamily: F.uiSemiBold, color: C.text, fontSize: 15 },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 14,
    fontFamily: F.luxuryBold,
    fontSize: 25,
    lineHeight: 31,
    color: C.text,
  },
  categoryRow: { paddingHorizontal: 20, gap: 14 },
  categoryCard: {
    width: Math.min(112, (W - 72) / 3.3),
    height: 122,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.84)",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 3,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  categoryLabel: {
    fontFamily: F.uiBold,
    color: C.text,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitleInline: {
    fontFamily: F.luxuryBold,
    color: C.text,
    fontSize: 25,
    lineHeight: 31,
  },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 7 },
  viewAllText: { fontFamily: F.uiBold, color: C.purple, fontSize: 17 },
  expertCard: {
    minHeight: 104,
    marginHorizontal: 20,
    borderRadius: 27,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 5,
  },
  avatarWrap: { width: 65, height: 65, borderRadius: 33, marginRight: 17 },
  avatar: { width: 65, height: 65, borderRadius: 33 },
  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.white,
  },
  expertCopy: { flex: 1 },
  expertName: { fontFamily: F.luxuryBold, color: C.text, fontSize: 23, lineHeight: 28 },
  expertSpecialty: { fontFamily: F.uiSemiBold, color: C.muted, fontSize: 16, marginTop: 4 },
  availabilityRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  availabilityText: { fontFamily: F.uiSemiBold, color: C.muted, fontSize: 14 },
  expertAction: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.purpleSoft,
  },
  infoStack: { marginHorizontal: 20, marginTop: 28, gap: 16 },
  infoCard: {
    minHeight: 92,
    borderRadius: 25,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 3,
  },
  infoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.purpleSoft,
    marginRight: 16,
  },
  infoIconPrivacy: { backgroundColor: "rgba(255,255,255,0.32)" },
  infoCopy: { flex: 1 },
  infoTitle: { fontFamily: F.luxuryBold, color: C.text, fontSize: 20, lineHeight: 25 },
  infoSubtitle: { fontFamily: F.uiSemiBold, color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 4 },
  lockOrb: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.46)",
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
  },
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 96,
    paddingHorizontal: 20,
  },
  ctaShell: {
    borderRadius: 30,
    shadowColor: C.rose,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  cta: {
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
  },
  ctaText: { fontFamily: F.uiBold, color: C.white, fontSize: 21, letterSpacing: 0.2 },
  pressed: { transform: [{ scale: 0.97 }] },
});
