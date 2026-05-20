import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { F } from "../constants/fonts";
import { useColorMode } from "../hooks/useColorMode";
import { useHaptics } from "../hooks/useHaptics";
import { useSafeBack } from "../hooks/useSafeBack";

const { height: SCREEN_H } = Dimensions.get("window");

// ─── Mocked health records ─────────────────────────────────────────────────
type HealthRecord = {
  id: string;
  title: string;
  category: "Cycle" | "Nutrition" | "Wellness" | "Lab" | "Medication";
  date: string;
  summary: string;
  detail: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
};

const SEED_RECORDS: HealthRecord[] = [
  {
    id: "1",
    title: "Cycle Summary — April",
    category: "Cycle",
    date: "May 1, 2026",
    summary: "28-day cycle, 5-day period. Flow: moderate. PMS symptoms: mild.",
    detail: "Cycle length tracked at 28 days, well within the 26-32 day healthy range. Period lasted 5 days with moderate flow. PMS symptoms were noted on days 24-26 (mild irritability, mild bloating). Energy levels stayed steady through the luteal phase.",
    icon: "calendar-heart",
    color: "#E07A5F",
  },
  {
    id: "2",
    title: "Iron Level Check",
    category: "Lab",
    date: "April 18, 2026",
    summary: "Serum ferritin: 42 µg/L. Within healthy range for menstruating women.",
    detail: "Serum ferritin: 42 µg/L (healthy range 30-200). Hemoglobin: 13.2 g/dL. No anemia indicators. Continue iron-rich foods. Re-check in 6 months.",
    icon: "test-tube",
    color: "#8B6FE8",
  },
  {
    id: "3",
    title: "Wellness Check-In",
    category: "Wellness",
    date: "April 10, 2026",
    summary: "Stress: moderate. Sleep average: 6.8h. Mood trend: improving.",
    detail: "Self-reported stress: 5/10 (moderate). Sleep average: 6.8h with a 7-day rolling improvement of +0.4h. Mood trend: positive. Recommended: continue evening wind-down routine.",
    icon: "heart-pulse",
    color: "#81B29A",
  },
  {
    id: "4",
    title: "Nutrition Log — Week 14",
    category: "Nutrition",
    date: "April 5, 2026",
    summary: "Protein intake on target. Hydration: 7/8 days met daily goal.",
    detail: "Protein: avg 78g/day (target 70-90g). Hydration: 7/8 days met 2.5L goal. Fiber: avg 24g (target 25g). Slight magnesium gap on days 3 and 5. Iron intake adequate from leafy greens and legumes.",
    icon: "food-apple",
    color: "#F4A261",
  },
  {
    id: "5",
    title: "Supplement Tracker",
    category: "Medication",
    date: "March 28, 2026",
    summary: "Vitamin D3, Magnesium glycinate, Omega-3. Adherence: 91%.",
    detail: "Daily supplements: Vitamin D3 (2000 IU), Magnesium glycinate (300mg), Omega-3 (1000mg EPA+DHA). Adherence: 91% over 30 days. Missed doses mostly on weekends.",
    icon: "pill",
    color: "#BDB2FF",
  },
  {
    id: "6",
    title: "Cycle Summary — March",
    category: "Cycle",
    date: "March 3, 2026",
    summary: "27-day cycle, 4-day period. Flow: light. No notable PMS.",
    detail: "Cycle length: 27 days. Period lasted 4 days, light flow. No notable PMS symptoms. Ovulation suspected around day 14. Energy elevated mid-cycle.",
    icon: "calendar-heart",
    color: "#E07A5F",
  },
];

const CATEGORY_COLORS: Record<HealthRecord["category"], string> = {
  Cycle: "#E07A5F",
  Lab: "#8B6FE8",
  Wellness: "#81B29A",
  Nutrition: "#F4A261",
  Medication: "#BDB2FF",
};

const CATEGORIES: (HealthRecord["category"] | "All")[] = [
  "All", "Cycle", "Wellness", "Lab", "Nutrition", "Medication"
];

export default function HealthRecordsScreen() {
  const safeBack = useSafeBack();
  const { isDark, colors } = useColorMode();
  const haptics = useHaptics();
  const [filter, setFilter] = useState<HealthRecord["category"] | "All">("All");
  const [records] = useState<HealthRecord[]>(SEED_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [addToast, setAddToast] = useState(false);

  const filtered = filter === "All" ? records : records.filter((r) => r.category === filter);

  const handleAdd = () => {
    haptics.selection();
    setAddToast(true);
    setTimeout(() => setAddToast(false), 2200);
  };

  const handleRecordPress = (record: HealthRecord) => {
    haptics.selection();
    setSelectedRecord(record);
  };

  return (
    <SafeAreaView style={[styles.screen, isDark && { backgroundColor: "#1A1028" }]} edges={["top", "bottom"]}>
      <View style={[styles.auraOne, isDark && { backgroundColor: "rgba(224,122,95,0.09)" }]} />
      <View style={[styles.auraTwo, isDark && { backgroundColor: "rgba(189,178,255,0.08)" }]} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={safeBack}
          style={({ pressed }) => [styles.iconButton, isDark && styles.iconButtonDark, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Health Records</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>Your private wellness archive</Text>
        </View>
        <Pressable
          accessibilityLabel="Add record"
          accessibilityRole="button"
          onPress={handleAdd}
          style={({ pressed }) => [styles.iconButton, isDark && styles.iconButtonDark, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={22} color={colors.terracotta} />
        </Pressable>
      </View>

      {/* Hero banner */}
      <LinearGradient
        colors={isDark ? ["#2B1F3A", "#1E2B3A"] : ["#FDF0EC", "#EEF4F8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroIconWrap}>
          <MaterialCommunityIcons name="folder-heart-outline" size={26} color="#E07A5F" />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {records.length} records stored
          </Text>
          <Text style={[styles.heroSub, { color: colors.muted }]}>
            Encrypted and visible only to you
          </Text>
        </View>
        <View style={styles.shieldBadge}>
          <MaterialCommunityIcons name="shield-check-outline" size={18} color="#81B29A" />
        </View>
      </LinearGradient>

      {/* Category filter chips — fixed-height row prevents layout reflow */}
      <View style={styles.filterRowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((item) => {
            const active = filter === item;
            const chipColor = item === "All" ? "#E07A5F" : CATEGORY_COLORS[item as HealthRecord["category"]];
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={active ? { selected: true } : {}}
                onPress={() => setFilter(item)}
                style={({ pressed }) => [
                  styles.filterChip,
                  isDark && styles.filterChipDark,
                  active && { backgroundColor: `${chipColor}22`, borderColor: `${chipColor}60` },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? chipColor : colors.muted },
                  ]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Records list — wrapped in a fixed-flex container so the list area
          doesn't reflow when chip filter changes the data length. */}
      <View style={styles.listWrap}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open record ${item.title}`}
              style={({ pressed }) => [
                styles.recordCard,
                isDark && styles.recordCardDark,
                pressed && styles.pressed,
              ]}
              onPress={() => handleRecordPress(item)}
            >
              <View style={[styles.recordIconWrap, { backgroundColor: `${item.color}18` }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.recordBody}>
                <View style={styles.recordTopRow}>
                  <Text style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={[styles.categoryPill, { backgroundColor: `${item.color}1A` }]}>
                    <Text style={[styles.categoryText, { color: item.color }]}>{item.category}</Text>
                  </View>
                </View>
                <Text style={[styles.recordDate, { color: colors.muted }]}>{item.date}</Text>
                <Text style={[styles.recordSummary, { color: colors.muted }]} numberOfLines={2}>
                  {item.summary}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.hint} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="folder-open-outline" size={44} color={colors.hint} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No records in this category yet.</Text>
              <Pressable onPress={() => setFilter("All")} style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}>
                <Text style={styles.emptyActionText}>Show all records</Text>
              </Pressable>
            </View>
          }
        />
      </View>

      {/* Add-record toast */}
      {addToast && (
        <View style={styles.toastWrap} pointerEvents="none">
          <View style={styles.toast}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#E07A5F" />
            <Text style={styles.toastText}>Manual records sync from your wearables — coming soon.</Text>
          </View>
        </View>
      )}

      {/* Record detail modal */}
      <RecordDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

// ─── Record detail modal ────────────────────────────────────────────────────
function RecordDetailModal({
  record,
  onClose,
  isDark,
}: {
  record: HealthRecord | null;
  onClose: () => void;
  isDark: boolean;
}) {
  const visible = record !== null;
  const scrimAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scrimAnim, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scrimAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SCREEN_H, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, scrimAnim, slideAnim]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalScrim, { opacity: scrimAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.modalSheet,
          isDark && styles.modalSheetDark,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.modalHandle} />
        {record && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            <View style={[styles.modalIconWrap, { backgroundColor: `${record.color}1A` }]}>
              <MaterialCommunityIcons name={record.icon} size={28} color={record.color} />
            </View>
            <Text style={[styles.modalTitle, isDark && { color: "#F8FAFC" }]}>{record.title}</Text>
            <View style={styles.modalMetaRow}>
              <View style={[styles.modalMetaChip, { backgroundColor: `${record.color}1A` }]}>
                <Text style={[styles.modalMetaText, { color: record.color }]}>{record.category}</Text>
              </View>
              <Text style={[styles.modalMetaDate, isDark && { color: "rgba(255,255,255,0.65)" }]}>{record.date}</Text>
            </View>
            <Text style={[styles.modalDetail, isDark && { color: "rgba(255,255,255,0.82)" }]}>{record.detail}</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.modalCloseBtn, pressed && styles.pressed]}
            >
              <LinearGradient colors={["#E07A5F", "#F4A27D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalCloseGrad}>
                <Text style={styles.modalCloseText}>Done</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
}

const palette = {
  background: "#FAF9F6",
  warmShadow: "#D6C3B9",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  auraOne: {
    position: "absolute",
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: "rgba(224,122,95,0.10)",
    top: -60, right: -80,
  },
  auraTwo: {
    position: "absolute",
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(189,178,255,0.11)",
    bottom: 100, left: -70,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  iconButton: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.70)",
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 2,
  },
  iconButtonDark: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  headerCopy: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: F.luxuryBold, fontSize: 22, lineHeight: 28 },
  headerSub: { fontFamily: F.uiBold, fontSize: 11, lineHeight: 15, marginTop: 2 },
  heroBanner: {
    marginHorizontal: 20, borderRadius: 22, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 12,
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.60)",
  },
  heroIconWrap: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(224,122,95,0.14)",
  },
  heroCopy: { flex: 1 },
  heroTitle: { fontFamily: F.luxuryBold, fontSize: 17, lineHeight: 22 },
  heroSub: { fontFamily: F.uiBold, fontSize: 12, lineHeight: 16, marginTop: 3 },
  shieldBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(129,178,154,0.16)",
  },
  // Fixed-height row so chip selection doesn't visually nudge the list below.
  filterRowWrap: {
    height: 50,
    justifyContent: "center",
    marginBottom: 4,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    height: 36,
    minWidth: 72,
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(200,192,210,0.35)",
  },
  filterChipDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  filterChipText: {
    fontFamily: F.uiExtraBold,
    fontSize: 12,
    lineHeight: 16,
  },
  listWrap: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 4 },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.60)",
    shadowColor: palette.warmShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 2,
  },
  recordCardDark: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
  },
  recordIconWrap: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  recordBody: { flex: 1, minWidth: 0, gap: 3 },
  recordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "nowrap",
  },
  recordTitle: {
    flex: 1,
    fontFamily: F.uiBold,
    fontSize: 13,
    lineHeight: 17,
    flexShrink: 1,
  },
  categoryPill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  categoryText: {
    fontFamily: F.uiBlack,
    fontSize: 9,
    lineHeight: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recordDate: { fontFamily: F.uiBold, fontSize: 11, lineHeight: 14 },
  recordSummary: { fontFamily: F.uiSemiBold, fontSize: 12, lineHeight: 17 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: F.uiBold,
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  emptyAction: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(224,122,95,0.14)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.30)",
  },
  emptyActionText: {
    fontFamily: F.uiBlack,
    fontSize: 12,
    color: "#E07A5F",
  },
  pressed: { transform: [{ scale: 0.97 }] },
  // ── Toast ─────────────────────────────────────────────────────────────
  toastWrap: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.24)",
    shadowColor: "#7A4A5C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 18,
    elevation: 6,
    maxWidth: "86%",
  },
  toastText: {
    flex: 1,
    fontFamily: F.uiBold,
    fontSize: 12,
    lineHeight: 16,
    color: "#241C1D",
  },
  // ── Detail modal ──────────────────────────────────────────────────────
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(22,18,28,0.42)",
  },
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFAF7",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: "84%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  modalSheetDark: {
    backgroundColor: "#1A1028",
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(107,76,85,0.22)",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalContent: {
    paddingHorizontal: 22,
    paddingBottom: 10,
  },
  modalIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 22,
    lineHeight: 28,
    color: "#241C1D",
    marginBottom: 8,
  },
  modalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  modalMetaChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modalMetaText: {
    fontFamily: F.uiBlack,
    fontSize: 10,
    lineHeight: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalMetaDate: {
    fontFamily: F.uiBold,
    fontSize: 12,
    color: "rgba(107,76,85,0.78)",
  },
  modalDetail: {
    fontFamily: F.uiMedium,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(36,28,29,0.86)",
    marginBottom: 24,
  },
  modalCloseBtn: {
    borderRadius: 28,
    shadowColor: "#E07A5F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  modalCloseGrad: {
    height: 52,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontFamily: F.uiBlack,
    fontSize: 15,
    color: "#FFF",
    letterSpacing: 0.3,
  },
});
