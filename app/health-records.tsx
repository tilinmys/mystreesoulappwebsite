import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type AppColors } from "../constants/colors";
import { F } from "../constants/fonts";
import { useColorMode } from "../hooks/useColorMode";
import { useHaptics } from "../hooks/useHaptics";
import { useSafeBack } from "../hooks/useSafeBack";

const { height: SCREEN_H } = Dimensions.get("window");

// ─── Types ──────────────────────────────────────────────────────────────────
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
  "All", "Cycle", "Wellness", "Lab", "Nutrition", "Medication",
];

const UPLOAD_CATEGORIES: HealthRecord["category"][] = [
  "Cycle", "Lab", "Wellness", "Nutrition", "Medication",
];

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HealthRecordsScreen() {
  const safeBack = useSafeBack();
  const { colors } = useColorMode();
  const haptics = useHaptics();
  const s = getStyles(colors);

  const [filter, setFilter] = useState<HealthRecord["category"] | "All">("All");
  const [records] = useState<HealthRecord[]>(SEED_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  // Upload panel state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [uploadCategory, setUploadCategory] = useState<HealthRecord["category"] | null>(null);
  const uploadAnim = useRef(new Animated.Value(0)).current;

  const filtered = filter === "All" ? records : records.filter((r) => r.category === filter);

  const toggleUpload = () => {
    haptics.selection();
    const next = !uploadOpen;
    setUploadOpen(next);
    Animated.spring(uploadAnim, {
      toValue: next ? 1 : 0,
      tension: 70,
      friction: 12,
      useNativeDriver: false,
    }).start();
  };

  const handleRecordPress = (record: HealthRecord) => {
    haptics.selection();
    setSelectedRecord(record);
  };

  return (
    <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
      {/* Ambient aura decorations */}
      <View style={s.auraOne} />
      <View style={s.auraTwo} />

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={safeBack}
          style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={s.headerCopy}>
          <Text style={s.headerTitle}>Health Records</Text>
          <Text style={s.headerSub}>Your private wellness vault</Text>
        </View>
        <Pressable
          accessibilityLabel="Upload a document"
          accessibilityRole="button"
          onPress={toggleUpload}
          style={({ pressed }) => [s.iconButton, uploadOpen && s.iconButtonActive, pressed && s.pressed]}
        >
          <MaterialCommunityIcons
            name={uploadOpen ? "close" : "upload-outline"}
            size={20}
            color={uploadOpen ? colors.background : colors.primaryCTA}
          />
        </Pressable>
      </View>

      {/* ── Hero banner ── */}
      <View style={s.heroBanner}>
        <View style={s.heroIconWrap}>
          <MaterialCommunityIcons name="folder-heart-outline" size={26} color="#E07A5F" />
        </View>
        <View style={s.heroCopy}>
          <Text style={s.heroTitle}>{records.length} records stored</Text>
          <Text style={s.heroSub}>Encrypted and visible only to you</Text>
        </View>
        <View style={s.shieldBadge}>
          <MaterialCommunityIcons name="shield-check-outline" size={18} color="#81B29A" />
        </View>
      </View>

      {/* ── Upload document panel ── */}
      <Animated.View
        style={[
          s.uploadPanel,
          {
            maxHeight: uploadAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 340] }),
            opacity: uploadAnim,
            marginBottom: uploadAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }),
          },
        ]}
        pointerEvents={uploadOpen ? "auto" : "none"}
      >
        <View style={s.uploadPanelInner}>
          {/* Panel header */}
          <View style={s.uploadPanelHeader}>
            <MaterialCommunityIcons name="file-upload-outline" size={18} color={colors.primaryCTA} />
            <Text style={s.uploadPanelTitle}>Upload a document</Text>
          </View>

          {/* Document name input */}
          <View style={s.uploadInputWrap}>
            <MaterialCommunityIcons name="file-document-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={s.uploadInput}
              placeholder="Document name"
              placeholderTextColor={colors.textHint}
              value={docName}
              onChangeText={setDocName}
              returnKeyType="done"
            />
          </View>

          {/* Category chip selection */}
          <Text style={s.uploadCategoryLabel}>Category</Text>
          <View style={s.uploadChipRow}>
            {UPLOAD_CATEGORIES.map((cat) => {
              const active = uploadCategory === cat;
              const catColor = CATEGORY_COLORS[cat];
              return (
                <Pressable
                  key={cat}
                  onPress={() => { haptics.selection(); setUploadCategory(active ? null : cat); }}
                  style={({ pressed }) => [
                    s.uploadChip,
                    active && { backgroundColor: `${catColor}28`, borderColor: `${catColor}70` },
                    pressed && s.pressed,
                  ]}
                >
                  <Text style={[s.uploadChipText, active && { color: catColor }]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Action row */}
          <View style={s.uploadActionRow}>
            <Pressable
              style={({ pressed }) => [s.uploadDocBtn, pressed && s.pressed]}
              onPress={() => haptics.selection()}
            >
              <MaterialCommunityIcons name="paperclip" size={16} color={colors.textPrimary} />
              <Text style={s.uploadDocBtnText}>Attach file</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.askBloopBtn, pressed && s.pressed]}
              onPress={() => haptics.selection()}
            >
              <MaterialCommunityIcons name="shield-check-outline" size={15} color={colors.background} />
              <Text style={s.askBloopText}>Ask Bloop about this</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* ── Category filter chips ── */}
      <View style={s.filterRowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
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
                  s.filterChip,
                  active && { backgroundColor: `${chipColor}22`, borderColor: `${chipColor}60` },
                  pressed && s.pressed,
                ]}
              >
                <Text style={[s.filterChipText, { color: active ? chipColor : colors.textMuted }]} numberOfLines={1}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Records list ── */}
      <View style={s.listWrap}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open record ${item.title}`}
              style={({ pressed }) => [s.recordCard, pressed && s.pressed]}
              onPress={() => handleRecordPress(item)}
            >
              <View style={[s.recordIconWrap, { backgroundColor: `${item.color}18` }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={s.recordBody}>
                <View style={s.recordTopRow}>
                  <Text style={s.recordTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[s.categoryPill, { backgroundColor: `${item.color}1A` }]}>
                    <Text style={[s.categoryText, { color: item.color }]}>{item.category}</Text>
                  </View>
                </View>
                <Text style={s.recordDate}>{item.date}</Text>
                <Text style={s.recordSummary} numberOfLines={2}>{item.summary}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <MaterialCommunityIcons name="folder-open-outline" size={44} color={colors.textHint} />
              <Text style={s.emptyText}>No records in this category yet.</Text>
              <Pressable
                onPress={() => setFilter("All")}
                style={({ pressed }) => [s.emptyAction, pressed && s.pressed]}
              >
                <Text style={s.emptyActionText}>Show all records</Text>
              </Pressable>
            </View>
          }
        />
      </View>

      {/* ── Record detail modal ── */}
      <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </SafeAreaView>
  );
}

// ─── Record detail modal ──────────────────────────────────────────────────────
function RecordDetailModal({
  record,
  onClose,
}: {
  record: HealthRecord | null;
  onClose: () => void;
}) {
  const { colors } = useColorMode();
  const s = getStyles(colors);
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
      <Animated.View style={[s.modalScrim, { opacity: scrimAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[s.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={s.modalHandle} />
        {record && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.modalContent}>
            <View style={[s.modalIconWrap, { backgroundColor: `${record.color}1A` }]}>
              <MaterialCommunityIcons name={record.icon} size={28} color={record.color} />
            </View>
            <Text style={s.modalTitle}>{record.title}</Text>
            <View style={s.modalMetaRow}>
              <View style={[s.modalMetaChip, { backgroundColor: `${record.color}1A` }]}>
                <Text style={[s.modalMetaText, { color: record.color }]}>{record.category}</Text>
              </View>
              <Text style={s.modalMetaDate}>{record.date}</Text>
            </View>
            <Text style={s.modalDetail}>{record.detail}</Text>

            {/* Ask Bloop CTA */}
            <Pressable
              style={({ pressed }) => [s.askBloopCard, pressed && s.pressed]}
              onPress={() => {}}
            >
              <View style={s.askBloopCardIcon}>
                <MaterialCommunityIcons name="shield-check-outline" size={18} color={colors.primaryCTA} />
              </View>
              <View style={s.askBloopCardCopy}>
                <Text style={s.askBloopCardTitle}>Ask Bloop about this</Text>
                <Text style={s.askBloopCardSub}>Get a calm, jargon-free explanation of your record</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [s.modalCloseBtn, pressed && s.pressed]}
            >
              <Text style={s.modalCloseText}>Done</Text>
            </Pressable>
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function getStyles(colors: AppColors) {
  const darkShadow = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 3,
  };

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    auraOne: {
      position: "absolute",
      width: 240, height: 240, borderRadius: 120,
      backgroundColor: "rgba(224,122,95,0.07)",
      top: -60, right: -80,
    },
    auraTwo: {
      position: "absolute",
      width: 200, height: 200, borderRadius: 100,
      backgroundColor: "rgba(155,114,203,0.06)",
      bottom: 100, left: -70,
    },

    // ── Header ────────────────────────────────────────────────────────────────
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
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1, borderColor: colors.border,
      ...darkShadow,
    },
    iconButtonActive: {
      backgroundColor: colors.primaryCTA,
      borderColor: colors.primaryCTA,
    },
    headerCopy: { flex: 1, alignItems: "center" },
    headerTitle: {
      fontFamily: F.luxuryBold,
      fontSize: 22,
      lineHeight: 28,
      color: colors.textPrimary,
    },
    headerSub: {
      fontFamily: F.uiBold,
      fontSize: 11,
      lineHeight: 15,
      marginTop: 2,
      color: colors.textMuted,
    },

    // ── Hero banner ───────────────────────────────────────────────────────────
    heroBanner: {
      marginHorizontal: 20,
      borderRadius: 22,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      ...darkShadow,
    },
    heroIconWrap: {
      width: 50, height: 50, borderRadius: 25,
      alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(224,122,95,0.14)",
    },
    heroCopy: { flex: 1 },
    heroTitle: {
      fontFamily: F.luxuryBold,
      fontSize: 17,
      lineHeight: 22,
      color: colors.textPrimary,
    },
    heroSub: {
      fontFamily: F.uiBold,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 3,
      color: colors.textMuted,
    },
    shieldBadge: {
      width: 36, height: 36, borderRadius: 18,
      alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(129,178,154,0.14)",
    },

    // ── Upload panel ──────────────────────────────────────────────────────────
    uploadPanel: {
      marginHorizontal: 20,
      overflow: "hidden",
    },
    uploadPanelInner: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
      ...darkShadow,
    },
    uploadPanelHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    uploadPanelTitle: {
      fontFamily: F.uiBold,
      fontSize: 14,
      lineHeight: 18,
      color: colors.textPrimary,
    },
    uploadInputWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.surfaceRaised,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: 14,
      height: 46,
    },
    uploadInput: {
      flex: 1,
      fontFamily: F.uiSemiBold,
      fontSize: 13,
      color: colors.textPrimary,
    },
    uploadCategoryLabel: {
      fontFamily: F.uiBold,
      fontSize: 11,
      lineHeight: 14,
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    uploadChipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    uploadChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    uploadChipText: {
      fontFamily: F.uiBold,
      fontSize: 11,
      lineHeight: 14,
      color: colors.textMuted,
    },
    uploadActionRow: {
      flexDirection: "row",
      gap: 10,
    },
    uploadDocBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
    },
    uploadDocBtnText: {
      fontFamily: F.uiBold,
      fontSize: 13,
      color: colors.textPrimary,
    },
    askBloopBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primaryCTA,
    },
    askBloopText: {
      fontFamily: F.uiBold,
      fontSize: 12,
      color: colors.background,
    },

    // ── Filter chips ──────────────────────────────────────────────────────────
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    filterChipText: {
      fontFamily: F.uiExtraBold,
      fontSize: 12,
      lineHeight: 16,
    },

    // ── Records list ──────────────────────────────────────────────────────────
    listWrap: { flex: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 4 },
    recordCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 22,
      padding: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...darkShadow,
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
      color: colors.textPrimary,
    },
    categoryPill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
    categoryText: {
      fontFamily: F.uiBlack,
      fontSize: 9,
      lineHeight: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    recordDate: {
      fontFamily: F.uiBold,
      fontSize: 11,
      lineHeight: 14,
      color: colors.textMuted,
    },
    recordSummary: {
      fontFamily: F.uiSemiBold,
      fontSize: 12,
      lineHeight: 17,
      color: colors.textMuted,
    },

    // ── Empty state ───────────────────────────────────────────────────────────
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
      color: colors.textMuted,
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

    // ── Detail modal ──────────────────────────────────────────────────────────
    modalScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(14,10,18,0.60)",
    },
    modalSheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: 390,
      alignSelf: "center",
      width: "100%",
      backgroundColor: colors.surface,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingTop: 10,
      paddingBottom: 34,
      maxHeight: "88%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.36,
      shadowRadius: 24,
      elevation: 14,
    },
    modalHandle: {
      width: 44, height: 4, borderRadius: 2,
      backgroundColor: colors.borderSubtle,
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
      color: colors.textPrimary,
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
      color: colors.textMuted,
    },
    modalDetail: {
      fontFamily: F.uiMedium,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textPrimary,
      marginBottom: 20,
      opacity: 0.88,
    },

    // Ask Bloop card (inside detail modal)
    askBloopCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surfaceRaised,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 20,
    },
    askBloopCardIcon: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: "center", justifyContent: "center",
      backgroundColor: colors.surfaceLavender,
    },
    askBloopCardCopy: { flex: 1 },
    askBloopCardTitle: {
      fontFamily: F.uiBold,
      fontSize: 13,
      lineHeight: 17,
      color: colors.textPrimary,
    },
    askBloopCardSub: {
      fontFamily: F.uiSemiBold,
      fontSize: 11,
      lineHeight: 15,
      color: colors.textMuted,
      marginTop: 2,
    },

    modalCloseBtn: {
      alignItems: "center",
      justifyContent: "center",
      height: 52,
      borderRadius: 28,
      backgroundColor: colors.primaryCTA,
      shadowColor: colors.primaryCTA,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
      elevation: 4,
    },
    modalCloseText: {
      fontFamily: F.uiBlack,
      fontSize: 15,
      color: colors.background,
      letterSpacing: 0.3,
    },
  });
}
