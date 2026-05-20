import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { DailyLogSheet, type DailyLogPayload } from "../../components/cycle/DailyLogSheet";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
// react-native-reanimated 4.x requires a native dev-client build — not available
// in Expo Go. All modal animations use React Native's built-in Animated API.
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Svg,
  Line,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { openBloopWithContext } from "../../lib/openBloopWithContext";
import { useDailyLogStore } from "../../store/dailyLogStore";

// ── Assets ────────────────────────────────────────────────────────────────────
const imgCycleCenter = require("../../public/images/bloop-cycle.webp");
const imgPetals      = require("../../public/images/fertility-glow-visual.webp");
const imgBloop       = require("../../public/images/bloop-calm.webp");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg1:         "#FFF0E6",
  bg2:         "#FDE4F2",
  bg3:         "#F4E5FA",
  text:        "#1C1528",
  muted:       "#8A7A9A",
  faint:       "#C4B8D4",
  terracotta:  "#E07A5F",
  lavender:    "#9277C8",
  pink:        "#D45C82",
  gold:        "#C9A040",
  sage:        "#5E9B6B",
  peach:       "#F4A261",
  navy:        "#3D4B7C",
  white:       "#FFFFFF",
  cardBg:      "rgba(255,255,255,0.72)",
  cardBorder:  "rgba(255,255,255,0.88)",
} as const;

// ── Cycle data ────────────────────────────────────────────────────────────────
const CURRENT_DAY   = 18;
const CYCLE_LENGTH  = 28;
const OVULATION_DAY = 21;

const ESTROGEN_DATA    = [10,12,15,20,25,32,40,52,62,72,80,85,82,78,75,78,82,88,90,88,85,72,55,45,55,65,50,30];
const PROGESTERONE_DATA= [5,5,5,6,6,7,7,8,8,9,10,10,10,12,14,18,22,28,32,38,52,68,78,82,80,72,55,30];
const LH_DATA          = [8,8,9,10,10,12,14,16,18,20,22,24,28,32,38,48,62,78,88,92,95,72,35,20,15,12,10,8];

// ── Ring geometry ─────────────────────────────────────────────────────────────
const { width: W, height: H } = Dimensions.get("window");
const RING_SIZE = W - 48;
const CX = RING_SIZE / 2;
const CY = RING_SIZE / 2;
const R  = RING_SIZE * 0.345;
const SW = 22;

// ── SVG helpers ───────────────────────────────────────────────────────────────
function toRad(deg: number) { return (deg * Math.PI) / 180; }

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const sweep = (endDeg - startDeg + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function buildPath(data: number[], w: number, h: number): string {
  const n = data.length;
  const xStep = w / (n - 1);
  const pad = 6;
  const pts = data.map((v, i) => ({
    x: i * xStep,
    y: h - pad - (v / 100) * (h - pad * 2),
  }));
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Phase arc definitions (startDeg, endDeg from -90° top)
// Menstruation: day 1-5  → 0° to 64.3°  (from -90: -90 to -25.7)
// Follicular:   day 6-13 → 64.3° to 141.4° (includes ovulation window)
// Ovulation:    day 14-16→ 154.3° to 180°
// Luteal:       day 17-28→ 180° to 360°/-90°

const PHASE_ARCS = [
  { id: "menstru",    start: -90,   end: -24,   gradId: "gMen",  label: "Menstruation", labelAngle: -57 },
  { id: "follicular", start: -24,   end:  90,   gradId: "gFol",  label: "Follicular",   labelAngle:  33 },
  { id: "ovulation",  start:  90,   end: 153,   gradId: "gOvu",  label: "Ovulation",    labelAngle: 121 },
  { id: "luteal",     start:  153,  end: 270,   gradId: "gLut",  label: "Luteal",       labelAngle: 211 },
];

const CURRENT_ANGLE = -90 + (CURRENT_DAY / CYCLE_LENGTH) * 360; // ~141.4°

// ── Phase label position helper ───────────────────────────────────────────────
function phasePos(angleDeg: number, r: number, cx: number, cy: number) {
  return {
    x: cx + r * Math.cos(toRad(angleDeg)),
    y: cy + r * Math.sin(toRad(angleDeg)),
  };
}

// ── Metric cards data ─────────────────────────────────────────────────────────
const METRICS = [
  { key: "mood",   label: "Mood",   value: "Calm",   pct: 0.72, icon: "emoticon-happy-outline",  color: C.lavender, bg: "rgba(146,119,200,0.12)" },
  { key: "energy", label: "Energy", value: "High",   pct: 0.80, icon: "lightning-bolt",           color: C.peach,    bg: "rgba(244,162,97,0.12)"  },
  { key: "sleep",  label: "Sleep",  value: "Good",   pct: 0.65, icon: "moon-waning-crescent",     color: C.navy,     bg: "rgba(61,75,124,0.12)"   },
  { key: "flow",   label: "Flow",   value: "Light",  pct: 0.30, icon: "water-outline",            color: C.pink,     bg: "rgba(212,92,130,0.12)"  },
];

// ── Log actions ───────────────────────────────────────────────────────────────
const LOG_ACTIONS = [
  { key: "mood",     label: "Mood",     icon: "emoticon-outline" as const,       color: C.lavender },
  { key: "flow",     label: "Flow",     icon: "water-outline" as const,          color: C.pink     },
  { key: "symptom",  label: "Symptom",  icon: "pill" as const,                   color: C.peach    },
  { key: "sleep",    label: "Sleep",    icon: "sleep" as const,                  color: C.navy     },
  { key: "note",     label: "Note",     icon: "pencil-outline" as const,         color: C.sage     },
];

// ── Routine detail content ────────────────────────────────────────────────────
const ROUTINE = {
  title:    "Follicular Yoga Flow",
  duration: "18 min",
  level:    "All levels",
  why:      "The follicular phase is when estrogen rises and energy builds. This upward energy responds well to grounding yet expansive movement — yoga that mirrors the body's natural tendency to open up.",
  benefits: [
    "Strengthens the pelvic floor and hip flexors during a recovery-to-rise window",
    "Boosts dopamine and serotonin — amplifying the natural mood lift of rising estrogen",
    "Improves joint mobility before the ovulatory surge in physical performance",
  ],
  bloopMsg: "I'd like to do a Follicular Yoga Flow today. Can you guide me through an 18-minute energising yoga session that supports my current cycle phase?",
};

// ── Calendar: upcoming events ─────────────────────────────────────────────────
const UPCOMING_EVENTS = [
  { icon: "circle-medium" as const, color: "#5E9B6B", label: "Ovulation window",  detail: "Day 21–23 · in 3 days"  },
  { icon: "circle-medium" as const, color: "#9277C8", label: "Luteal phase",       detail: "Day 17–28 · ongoing"    },
  { icon: "water-outline"  as const, color: "#E07A5F", label: "Next period est.",  detail: "Day 29 · in ~10 days"   },
];

// ── Calendar phase mapping ────────────────────────────────────────────────────
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const CALENDAR_MONTHS = [
  { name: "April", year: 2026, days: 30, startOffset: 2 },
  { name: "May", year: 2026, days: 31, startOffset: 4 },
  { name: "June", year: 2026, days: 30, startOffset: 0 },
];

const MONTH_TO_NUM: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4,
  May: 5, June: 6, July: 7, August: 8,
  September: 9, October: 10, November: 11, December: 12,
};

function getDateKey(monthIndex: number, day: number): string {
  const m = CALENDAR_MONTHS[monthIndex];
  const mm = String(MONTH_TO_NUM[m.name]).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${m.year}-${mm}-${dd}`;
}

/** Returns true if the date is strictly before today */
function isPastDate(monthIndex: number, day: number): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return getDateKey(monthIndex, day) < today;
}

function calendarMeta(monthIndex: number, day: number) {
  const cycleDay = monthIndex === 1 ? day : monthIndex === 2 ? day + 31 : day - 30;
  const isToday = monthIndex === 1 && day === 18;
  const isPreviousPeriod = monthIndex === 0 && day >= 3 && day <= 7;
  const isLoggedPeriod = isPreviousPeriod || (monthIndex === 1 && day >= 1 && day <= 5);
  const isExpectedPeriod =
    (monthIndex === 1 && day >= 29 && day <= 31) ||
    (monthIndex === 2 && day >= 1 && day <= 2);
  const isFertile = monthIndex === 1 && day >= 19 && day <= 24;
  const isOvulation = monthIndex === 1 && day === 21;

  return { cycleDay, isToday, isLoggedPeriod, isExpectedPeriod, isFertile, isOvulation };
}

function MonthCalendar({
  month,
  monthIndex,
  compact = false,
  loggedDates = new Set<string>(),
  onDayPress,
}: {
  month: typeof CALENDAR_MONTHS[number];
  monthIndex: number;
  compact?: boolean;
  loggedDates?: Set<string>;
  onDayPress?: (dateKey: string, meta: ReturnType<typeof calendarMeta>) => void;
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Flat cell array — null = empty spacer, number = day
  const allCells: (number | null)[] = [
    ...Array.from({ length: month.startOffset }, () => null),
    ...Array.from({ length: month.days }, (_, i) => i + 1),
  ];
  while (allCells.length % 7 !== 0) allCells.push(null);

  // Chunk into rows of 7 — gives perfect alignment via flex: 1 cells
  const rows: (number | null)[][] = [];
  for (let i = 0; i < allCells.length; i += 7) rows.push(allCells.slice(i, i + 7));

  // ── Range membership (handles cross-month boundaries) ────────────────────
  const inLP = (mi: number, d: number) =>
    (mi === 0 && d >= 3 && d <= 7) || (mi === 1 && d >= 1 && d <= 5);
  const inEP = (mi: number, d: number) =>
    (mi === 1 && d >= 29 && d <= 31) || (mi === 2 && d >= 1 && d <= 2);
  const inF  = (mi: number, d: number) => mi === 1 && d >= 19 && d <= 24;

  const prevCell = (mi: number, d: number): [number, number] =>
    d > 1 ? [mi, d - 1] : mi > 0 ? [mi - 1, CALENDAR_MONTHS[mi - 1].days] : [-1, 0];
  const nextCell = (mi: number, d: number): [number, number] =>
    d < CALENDAR_MONTHS[mi].days ? [mi, d + 1] : mi < CALENDAR_MONTHS.length - 1 ? [mi + 1, 1] : [-1, 0];

  // Colour constants
  const LP_CLR  = "#E8702A";  // logged period — orange
  const EP_CLR  = "#D45C82";  // expected period — pink (was crimson; now just border)
  const OV_CLR  = "#5E9B6B";  // ovulation — emerald
  const F_CLR   = "rgba(94,155,107,0.20)"; // fertile wash
  const DOT_LOG = "#5E9B6B";  // history dot: logged
  const DOT_PAST = "rgba(107,112,141,0.35)"; // history dot: past/unlogged

  return (
    <View style={[styles.monthBlock, compact && styles.monthBlockCompact]}>
      {/* ── Month title ──────────────────────────────────────────── */}
      <View style={styles.monthTitleRow}>
        <Text style={styles.monthTitle}>{month.name}</Text>
        <Text style={styles.monthYear}>{month.year}</Text>
      </View>

      {/* ── Week headers (flex: 1 = same width as day cells) ─────── */}
      <View style={styles.monthWeekRow}>
        {WEEK_DAYS.map((d, i) => (
          <View key={i} style={styles.monthWeekCell}>
            <Text style={styles.monthWeekText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* ── Calendar rows ─────────────────────────────────────────── */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.monthGridRow}>
          {row.map((day, colIdx) => {
            if (day == null) return <View key={`e-${rowIdx}-${colIdx}`} style={styles.monthDayCell} />;

            const meta = calendarMeta(monthIndex, day);
            const [pmi, pd] = prevCell(monthIndex, day);
            const [nmi, nd] = nextCell(monthIndex, day);

            // ── Logged period strip connectors ───────────────────
            const lpHere  = meta.isLoggedPeriod;
            const lpLeft  = lpHere && pmi >= 0 && inLP(pmi, pd) && colIdx > 0;
            const lpRight = lpHere && nmi >= 0 && inLP(nmi, nd) && colIdx < 6;

            // ── Expected period strip connectors ─────────────────
            const epHere  = meta.isExpectedPeriod;
            const epLeft  = epHere && pmi >= 0 && inEP(pmi, pd) && colIdx > 0;
            const epRight = epHere && nmi >= 0 && inEP(nmi, nd) && colIdx < 6;

            // ── Fertile window strips (ovulation breaks the chain) ─
            const fHere   = meta.isFertile && !meta.isOvulation;
            const prevMeta = pmi >= 0 ? calendarMeta(pmi, pd) : null;
            const nextMeta = nmi >= 0 ? calendarMeta(nmi, nd) : null;
            const fLeft   = fHere && pmi >= 0 && inF(pmi, pd) && !prevMeta?.isOvulation && colIdx > 0;
            const fRight  = fHere && nmi >= 0 && inF(nmi, nd) && !nextMeta?.isOvulation && colIdx < 6;

            // ── Circle colour (logged/ovulation get solid fill; EP = no fill, pink border) ──
            const circleClr =
              meta.isOvulation ? OV_CLR
              : lpHere ? LP_CLR
              : null;
            const isHighlighted = circleClr !== null;

            // ── History dot ──────────────────────────────────────
            const dateKey = getDateKey(monthIndex, day);
            const isLogged = loggedDates.has(dateKey);
            const isPast   = isPastDate(monthIndex, day);
            const showDot  = isPast && !isHighlighted && !meta.isOvulation;
            const dotColor = isLogged ? DOT_LOG : DOT_PAST;

            return (
              <Pressable
                key={`${month.name}-${day}`}
                accessibilityLabel={`${month.name} ${day}`}
                accessibilityRole="button"
                onPress={() => {
                  setSelectedDay(selectedDay === day ? null : day);
                  onDayPress?.(dateKey, meta);
                }}
                style={styles.monthDayCell}
              >
                {/* ── Range strip halves (rendered under circle) ── */}
                {fLeft   && <View style={[styles.rangeStrip, styles.rangeStripL, { backgroundColor: F_CLR  }]} />}
                {fRight  && <View style={[styles.rangeStrip, styles.rangeStripR, { backgroundColor: F_CLR  }]} />}
                {lpLeft  && <View style={[styles.rangeStrip, styles.rangeStripL, { backgroundColor: `${LP_CLR}55` }]} />}
                {lpRight && <View style={[styles.rangeStrip, styles.rangeStripR, { backgroundColor: `${LP_CLR}55` }]} />}
                {/* Expected period: dashed side strips with pink tint */}
                {epLeft  && <View style={[styles.rangeStrip, styles.rangeStripL, { backgroundColor: `${EP_CLR}30` }]} />}
                {epRight && <View style={[styles.rangeStrip, styles.rangeStripR, { backgroundColor: `${EP_CLR}30` }]} />}

                {/* ── Day circle (rendered on top of strips) ────── */}
                <View
                  style={[
                    styles.monthDayRing,
                    isHighlighted  && { backgroundColor: circleClr!, borderColor: "transparent" },
                    // Expected period: transparent bg + dashed pink outline
                    epHere && !isHighlighted && styles.expectedPeriodRing,
                    fHere && !isHighlighted && !epHere && styles.fertileCircle,
                    meta.isToday && !isHighlighted && !epHere && styles.todayDayRing,
                    selectedDay === day && !isHighlighted && !epHere && styles.selectedDayRing,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthDayText,
                      isHighlighted && styles.highlightDayText,
                      epHere && !isHighlighted && { color: EP_CLR },
                      fHere && !isHighlighted && !epHere && styles.fertileDayText,
                      meta.isToday && !isHighlighted && !epHere && styles.todayDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>

                {/* ── History dot ───────────────────────────────── */}
                {showDot && (
                  <View style={[styles.historyDot, { backgroundColor: dotColor }]} />
                )}

                {/* ── Cycle-day label under expected-period cells ── */}
                {epHere && !compact && <Text style={[styles.tinyCycleDay, { color: EP_CLR }]}>D{meta.cycleDay}</Text>}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function dayPhaseColor(day: number): string {
  if (day <= 5)  return "#E07A5F"; // period
  if (day <= 13) return "#C9A040"; // follicular
  if (day <= 16) return "#5E9B6B"; // ovulation
  return "#9277C8";                 // luteal
}

// ── Date detail popup ─────────────────────────────────────────────────────────
function DateDetailPopup({
  visible,
  onClose,
  dateKey,
  dateLabel,
  meta,
  log,
}: {
  visible: boolean;
  onClose: () => void;
  dateKey: string;
  dateLabel: string;
  meta: ReturnType<typeof calendarMeta> | null;
  log: DailyLogPayload | undefined;
}) {
  // Animated values — scrim fades in, sheet slides up from bottom
  const scrimAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(H)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scrimAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim,  { toValue: 0, tension: 65, friction: 20, useNativeDriver: true }),
      ]).start();
    } else {
      // Reset for next open
      scrimAnim.setValue(0);
      slideAnim.setValue(H);
    }
  }, [visible]);

  function handleClose() {
    Animated.parallel([
      Animated.timing(scrimAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim,  { toValue: H, duration: 240, useNativeDriver: true }),
    ]).start(() => onClose());
  }

  if (!visible) return null;

  const hasLog = !!log;
  const phaseLabel =
    meta?.isLoggedPeriod ? "Period (logged)" :
    meta?.isExpectedPeriod ? "Period (predicted)" :
    meta?.isOvulation ? "Ovulation day" :
    meta?.isFertile ? "Fertile window" :
    "Cycle day";
  const phaseColor =
    meta?.isLoggedPeriod ? "#E8702A" :
    meta?.isExpectedPeriod ? "#D45C82" :
    meta?.isOvulation ? "#5E9B6B" :
    meta?.isFertile ? "#5E9B6B" :
    C.muted;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.popupScrim, { opacity: scrimAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View
          style={[styles.popupSheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle */}
          <View style={styles.popupHandle} />

          {/* Header row */}
          <View style={styles.popupHeaderRow}>
            <View>
              <Text style={styles.popupDate}>{dateLabel}</Text>
              <View style={[styles.popupPhasePill, { backgroundColor: `${phaseColor}18` }]}>
                <View style={[styles.popupPhaseDot, { backgroundColor: phaseColor }]} />
                <Text style={[styles.popupPhaseText, { color: phaseColor }]}>{phaseLabel}</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} style={styles.popupCloseBtn} hitSlop={10}>
              <Ionicons name="close" size={18} color={C.muted} />
            </Pressable>
          </View>

          {hasLog ? (
            <View style={styles.popupContent}>
              {log!.mood && (
                <View style={styles.popupRow}>
                  <MaterialCommunityIcons name="emoticon-outline" size={18} color={C.lavender} />
                  <Text style={styles.popupRowLabel}>Mood</Text>
                  <Text style={styles.popupRowValue}>{log!.mood.charAt(0).toUpperCase() + log!.mood.slice(1)}</Text>
                </View>
              )}
              {log!.flow && (
                <View style={styles.popupRow}>
                  <MaterialCommunityIcons name="water-outline" size={18} color="#D45C82" />
                  <Text style={styles.popupRowLabel}>Flow</Text>
                  <Text style={styles.popupRowValue}>{log!.flow.charAt(0).toUpperCase() + log!.flow.slice(1)}</Text>
                </View>
              )}
              <View style={styles.popupRow}>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color={C.peach} />
                <Text style={styles.popupRowLabel}>Energy</Text>
                <Text style={styles.popupRowValue}>{log!.energyLevel}%</Text>
              </View>
              <View style={styles.popupRow}>
                <MaterialCommunityIcons name="heart-pulse" size={18} color={C.terracotta} />
                <Text style={styles.popupRowLabel}>Stress</Text>
                <Text style={styles.popupRowValue}>{log!.stressLevel}%</Text>
              </View>
              {log!.symptoms.length > 0 && (
                <View style={styles.popupRow}>
                  <MaterialCommunityIcons name="pill" size={18} color={C.navy} />
                  <Text style={styles.popupRowLabel}>Symptoms</Text>
                  <Text style={[styles.popupRowValue, { flex: 1, textAlign: "right" }]} numberOfLines={2}>
                    {log!.symptoms.map((s) => s.replace(/_/g, " ")).join(", ")}
                  </Text>
                </View>
              )}
              {log!.journalEntry ? (
                <View style={styles.popupJournalWrap}>
                  <MaterialCommunityIcons name="note-text-outline" size={16} color={C.muted} />
                  <Text style={styles.popupJournalText} numberOfLines={4}>{log!.journalEntry}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.popupEmptyWrap}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={40} color={`${C.muted}88`} />
              <Text style={styles.popupEmptyTitle}>No data logged</Text>
              <Text style={styles.popupEmptyMsg}>Nothing was recorded for this day.</Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── Graph width ───────────────────────────────────────────────────────────────
const GRAPH_W = W - 64;
const GRAPH_H = 90;
const TODAY_X = ((CURRENT_DAY - 1) / (CYCLE_LENGTH - 1)) * GRAPH_W;

// ─────────────────────────────────────────────────────────────────────────────
export default function CycleScreen() {
  const router = useRouter();
  const { isDark } = useColorMode();
  const [activeGraph,  setActiveGraph]  = useState<"all" | "estrogen" | "progesterone" | "lh">("all");
  const [logSheetOpen, setLogSheetOpen] = useState(false);

  // Daily log store — for calendar history dots and date popup
  const storeLogs = useDailyLogStore((s) => s.logs);
  const getLogForDate = useDailyLogStore((s) => s.getLogForDate);
  const loggedDates = new Set(Object.keys(storeLogs));

  // Date detail popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupDateKey,  setPopupDateKey]  = useState("");
  const [popupDateLabel, setPopupDateLabel] = useState("");
  const [popupMeta, setPopupMeta] = useState<ReturnType<typeof calendarMeta> | null>(null);

  function handleDayPress(dateKey: string, meta: ReturnType<typeof calendarMeta>, monthIndex: number, day: number) {
    const m = CALENDAR_MONTHS[monthIndex];
    setPopupDateKey(dateKey);
    setPopupDateLabel(`${m.name} ${day}, ${m.year}`);
    setPopupMeta(meta);
    setPopupVisible(true);
  }

  // Routine detail sheet
  const [routineOpen,    setRoutineOpen]    = useState(false);
  const [routinePlaying, setRoutinePlaying] = useState(false);
  const routineAnim = useRef(new Animated.Value(0)).current;

  // Calendar sheet
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarAnim = useRef(new Animated.Value(0)).current;

  // Derived animated values
  const routineSlide   = routineAnim.interpolate({ inputRange: [0, 1], outputRange: [580, 0] });
  const routineOverlay = routineAnim.interpolate({ inputRange: [0, 1], outputRange: [0,   1] });
  const calendarSlide   = calendarAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  const calendarOverlay = calendarAnim.interpolate({ inputRange: [0, 1], outputRange: [0,   1] });

  function askBloop(message: string) {
    openBloopWithContext(router, message, "Cycle");
  }

  function openRoutine() {
    setRoutineOpen(true);
    Animated.timing(routineAnim, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }
  function closeRoutine(thenBloop?: string) {
    Animated.timing(routineAnim, { toValue: 0, duration: 230, useNativeDriver: true }).start(() => {
      setRoutineOpen(false);
      setRoutinePlaying(false);
      routineAnim.setValue(0);
      if (thenBloop) askBloop(thenBloop);
    });
  }

  function openCalendar() {
    setCalendarOpen(true);
    Animated.timing(calendarAnim, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }
  function closeCalendar(thenBloop?: string) {
    Animated.timing(calendarAnim, { toValue: 0, duration: 230, useNativeDriver: true }).start(() => {
      setCalendarOpen(false);
      calendarAnim.setValue(0);
      if (thenBloop) askBloop(thenBloop);
    });
  }

  const dotX = CX + R * Math.cos(toRad(CURRENT_ANGLE));
  const dotY = CY + R * Math.sin(toRad(CURRENT_ANGLE));

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, isDark && styles.safeDark]}>
      {/* ── Background ────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={isDark ? ["#111827", "#1F172A", "#291B24"] : [C.bg1, C.bg2, C.bg3]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, { top: -60,  left: -60,  backgroundColor: "rgba(224,122,95,0.10)", width: 200, height: 200 }]} />
      <View style={[styles.blob, { top: 200,  right: -80, backgroundColor: "rgba(212,92,130,0.08)", width: 240, height: 240 }]} />
      <View style={[styles.blob, { bottom: 120, left: -40, backgroundColor: "rgba(146,119,200,0.09)", width: 220, height: 220 }]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        style={styles.scrollView}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Your Cycle</Text>
            <View style={styles.headerSubRow}>
              <View style={styles.headerDot} />
              <Text style={styles.headerSub}>Day {CURRENT_DAY} · Follicular Phase</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              style={styles.iconBtn}
              onPress={() => router.push("/notifications" as any)}
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color={C.text} />
              <View style={styles.bellBadge} />
            </Pressable>
            <Pressable style={styles.logBtn} onPress={() => setLogSheetOpen(true)}>
              <MaterialCommunityIcons name="plus" size={16} color={C.white} />
              <Text style={styles.logBtnText}>Log today</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Cycle Ring Hero ──────────────────────────────────────────────── */}
        <View style={styles.ringCard}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Defs>
              {/* Phase gradients */}
              <SvgGradient id="gMen" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#E07A5F" stopOpacity="1" />
                <Stop offset="1" stopColor="#D45C82" stopOpacity="1" />
              </SvgGradient>
              <SvgGradient id="gFol" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#F4A261" stopOpacity="1" />
                <Stop offset="1" stopColor="#C9A040" stopOpacity="1" />
              </SvgGradient>
              <SvgGradient id="gOvu" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#5E9B6B" stopOpacity="1" />
                <Stop offset="1" stopColor="#81C784" stopOpacity="1" />
              </SvgGradient>
              <SvgGradient id="gLut" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#9277C8" stopOpacity="1" />
                <Stop offset="1" stopColor="#B39DDB" stopOpacity="1" />
              </SvgGradient>
              {/* Progress glow */}
              <SvgGradient id="gProgress" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#F4A261" stopOpacity="1" />
                <Stop offset="1" stopColor="#9277C8" stopOpacity="1" />
              </SvgGradient>
            </Defs>

            {/* Track ring */}
            <Circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="rgba(196,184,212,0.20)"
              strokeWidth={SW + 2}
            />

            {/* Phase arcs */}
            {PHASE_ARCS.map((arc) => (
              <Path
                key={arc.id}
                d={describeArc(CX, CY, R, arc.start + 2, arc.end - 2)}
                stroke={`url(#${arc.gradId})`}
                strokeWidth={SW}
                fill="none"
                strokeLinecap="round"
              />
            ))}

            {/* Progress overlay arc (semi-transparent white overlay to dim future) */}
            <Path
              d={describeArc(CX, CY, R, CURRENT_ANGLE + 4, 270 - 1)}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={SW + 4}
              fill="none"
              strokeLinecap="butt"
            />

            {/* Phase label markers (small dots on track) */}
            {PHASE_ARCS.map((arc) => {
              const pos = phasePos(arc.labelAngle, R + SW / 2 + 14, CX, CY);
              return (
                <Circle
                  key={arc.id + "-dot"}
                  cx={pos.x}
                  cy={pos.y}
                  r={3}
                  fill={arc.id === "menstru" ? "#E07A5F"
                      : arc.id === "follicular" ? "#C9A040"
                      : arc.id === "ovulation" ? "#5E9B6B"
                      : "#9277C8"}
                />
              );
            })}

            {/* Inner soft ring */}
            <Circle
              cx={CX}
              cy={CY}
              r={R - SW / 2 - 6}
              fill="none"
              stroke="rgba(212,184,200,0.14)"
              strokeWidth={1}
            />

            {/* Current-day dot */}
            <Circle
              cx={dotX}
              cy={dotY}
              r={10}
              fill="rgba(255,255,255,0.9)"
              stroke="#E07A5F"
              strokeWidth={2.5}
            />
            <Circle
              cx={dotX}
              cy={dotY}
              r={5}
              fill="#E07A5F"
            />
          </Svg>

          {/* Center content (absolute overlay) */}
          <View style={[styles.ringCenter, { width: (R - SW / 2 - 14) * 2, height: (R - SW / 2 - 14) * 2, borderRadius: R - SW / 2 - 14 }]}>
            <View style={styles.ringCenterOverlay}>
              <Text style={styles.ringDayNum}>Day {CURRENT_DAY}</Text>
              <Text style={styles.ringPhaseName}>Follicular</Text>
              <View style={styles.ringCountdown}>
                <MaterialCommunityIcons name="circle-medium" size={10} color="#5E9B6B" />
                <Text style={styles.ringCountdownText}>{OVULATION_DAY - CURRENT_DAY}d to Ovulation</Text>
              </View>
            </View>
          </View>

          {/* Phase legend pills */}
          <View style={styles.phaseLegend}>
            {[
              { label: "Period",      color: "#E07A5F" },
              { label: "Follicular",  color: "#C9A040" },
              { label: "Ovulation",   color: "#5E9B6B" },
              { label: "Luteal",      color: "#9277C8" },
            ].map((p) => (
              <View key={p.label} style={styles.legendPill}>
                <View style={[styles.legendDot, { backgroundColor: p.color }]} />
                <Text style={styles.legendText}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Hormone Graph ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Hormone Rhythm</Text>
              <Text style={styles.cardSub}>Cycle days 1–{CYCLE_LENGTH}</Text>
            </View>
            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={C.lavender} />
          </View>

          {/* Graph toggle chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphChips}>
            {[
              { key: "all",          label: "All",          color: C.muted    },
              { key: "estrogen",     label: "Estrogen",     color: C.lavender },
              { key: "progesterone", label: "Progesterone", color: C.pink     },
              { key: "lh",           label: "LH",           color: C.gold     },
            ].map((chip) => (
              <Pressable
                key={chip.key}
                onPress={() => setActiveGraph(chip.key as typeof activeGraph)}
                style={[
                  styles.graphChip,
                  activeGraph === chip.key && { backgroundColor: chip.color, borderColor: chip.color },
                ]}
              >
                <Text style={[
                  styles.graphChipText,
                  activeGraph === chip.key && { color: C.white },
                ]}>
                  {chip.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* SVG waveform */}
          <View style={styles.graphWrap}>
            <Svg width={GRAPH_W} height={GRAPH_H}>
              <Defs>
                <SvgGradient id="gEst" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={C.lavender} stopOpacity="0.25" />
                  <Stop offset="1" stopColor={C.lavender} stopOpacity="0" />
                </SvgGradient>
                <SvgGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={C.pink} stopOpacity="0.20" />
                  <Stop offset="1" stopColor={C.pink} stopOpacity="0" />
                </SvgGradient>
                <SvgGradient id="gLh" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={C.gold} stopOpacity="0.20" />
                  <Stop offset="1" stopColor={C.gold} stopOpacity="0" />
                </SvgGradient>
              </Defs>

              {/* Estrogen */}
              {(activeGraph === "all" || activeGraph === "estrogen") && (
                <Path
                  d={buildPath(ESTROGEN_DATA, GRAPH_W, GRAPH_H)}
                  stroke={C.lavender}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* Progesterone */}
              {(activeGraph === "all" || activeGraph === "progesterone") && (
                <Path
                  d={buildPath(PROGESTERONE_DATA, GRAPH_W, GRAPH_H)}
                  stroke={C.pink}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* LH */}
              {(activeGraph === "all" || activeGraph === "lh") && (
                <Path
                  d={buildPath(LH_DATA, GRAPH_W, GRAPH_H)}
                  stroke={C.gold}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Today line */}
              <Line
                x1={TODAY_X}
                y1={0}
                x2={TODAY_X}
                y2={GRAPH_H}
                stroke={C.terracotta}
                strokeWidth={1.5}
                strokeDasharray="4,3"
                strokeLinecap="round"
              />
              <Circle cx={TODAY_X} cy={4} r={4} fill={C.terracotta} />
            </Svg>

            {/* X-axis day labels */}
            <View style={styles.graphXAxis}>
              {[1, 7, 14, 21, 28].map((d) => (
                <Text key={d} style={[
                  styles.graphXLabel,
                  d === CURRENT_DAY && { color: C.terracotta, fontFamily: F.uiBold },
                ]}>
                  {d === CURRENT_DAY ? `Day ${d}` : d}
                </Text>
              ))}
            </View>
          </View>

          {/* Legend row */}
          <View style={styles.graphLegendRow}>
            {[
              { label: "Estrogen",     color: C.lavender },
              { label: "Progesterone", color: C.pink     },
              { label: "LH",           color: C.gold     },
            ].map((l) => (
              <View key={l.label} style={styles.graphLegendItem}>
                <View style={[styles.graphLegendLine, { backgroundColor: l.color }]} />
                <Text style={styles.graphLegendLabel}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Metric Cards Grid ────────────────────────────────────────────── */}
        <View style={styles.metricsGrid}>
          {METRICS.map((m) => (
            <View key={m.key} style={styles.metricCard}>
              <View style={[styles.metricIconBubble, { backgroundColor: m.bg }]}>
                <MaterialCommunityIcons name={m.icon as any} size={18} color={m.color} />
              </View>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <View style={styles.metricBarTrack}>
                <View style={[styles.metricBarFill, { width: `${m.pct * 100}%` as any, backgroundColor: m.color }]} />
              </View>
            </View>
          ))}
        </View>

        {/* ── AI Insight Card ──────────────────────────────────────────────── */}
        <LinearGradient
          colors={["rgba(146,119,200,0.12)", "rgba(212,92,130,0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightCard}
        >
          <View style={styles.insightLeft}>
            <View style={styles.insightIconRow}>
              <MaterialCommunityIcons name="molecule-co2" size={14} color={C.lavender} />
              <Text style={styles.insightTag}>Cycle Insight</Text>
            </View>
            <Text style={styles.insightTitle}>Peak fertility window approaching</Text>
            <Text style={styles.insightBody}>
              Estrogen is rising steadily. Your body is priming for ovulation around Day {OVULATION_DAY}.
              Energy and libido often peak now — a great time for strength training.
            </Text>
            <Pressable
              style={styles.insightCta}
              onPress={() => askBloop("Explain my fertility window and energy pattern.")}
            >
              <Text style={styles.insightCtaText}>View full insight</Text>
              <MaterialCommunityIcons name="arrow-right" size={13} color={C.lavender} />
            </Pressable>
          </View>
          <View style={styles.insightImageWrap}>
            <CachedImage source={imgBloop} style={styles.insightImage} />
            <View style={styles.insightGlow} />
          </View>
        </LinearGradient>

        {/* ── Wellness Recommendation ──────────────────────────────────────── */}
        <View style={styles.wellnessCard}>
          <CachedImage source={imgPetals} style={styles.wellnessImage} />
          <LinearGradient
            colors={["transparent", "rgba(28,21,40,0.72)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.wellnessContent}>
            <View style={styles.wellnessTag}>
              <MaterialCommunityIcons name="yoga" size={12} color={C.white} />
              <Text style={styles.wellnessTagText}>Recommended for Day {CURRENT_DAY}</Text>
            </View>
            <Text style={styles.wellnessTitle}>Follicular Yoga Flow</Text>
            <Text style={styles.wellnessSub}>18 min · Energising · All levels</Text>
          </View>
          {/* Play button — opens routine detail sheet */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open follicular yoga routine"
            style={styles.playBtn}
            onPress={openRoutine}
          >
            <LinearGradient
              colors={["#F4A261", "#E07A5F"]}
              style={styles.playBtnInner}
            >
              <MaterialCommunityIcons name="play" size={20} color={C.white} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── Cycle Calendar Strip ─────────────────────────────────────────── */}
        <View style={styles.calendarCard}>
          <View style={styles.cardHeader}>
            <View style={styles.calendarHeaderCopy}>
              <Text style={styles.cardTitle}>Period calendar</Text>
              <Text style={styles.cardSub}>Track logged days, fertile days, and expected period dates.</Text>
            </View>
            <Pressable style={styles.seeAllBtn} onPress={openCalendar}>
              <Text style={styles.seeAllText}>See calendar</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarMonthScroller}
            decelerationRate="fast"
            snapToInterval={W - 62}
            snapToAlignment="start"
            contentOffset={{ x: W - 62, y: 0 }}
          >
            {CALENDAR_MONTHS.map((month, index) => (
              <MonthCalendar
                key={month.name}
                month={month}
                monthIndex={index}
                compact
                loggedDates={loggedDates}
                onDayPress={(dk, meta) => handleDayPress(dk, meta, index, parseInt(dk.split("-")[2], 10))}
              />
            ))}
          </ScrollView>
          <View style={styles.periodSummaryRow}>
            <View style={styles.periodSummaryItem}>
              <Text style={styles.periodSummaryValue}>May 1-5</Text>
              <Text style={styles.periodSummaryLabel}>Logged period</Text>
            </View>
            <View style={styles.periodSummaryItem}>
              <Text style={styles.periodSummaryValue}>May 29-Jun 2</Text>
              <Text style={styles.periodSummaryLabel}>Expected dates</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickLogInline}>
          <Text style={styles.quickLogTitle}>Log what changed today</Text>
          <LinearGradient
            colors={["rgba(255,255,255,0.86)", "rgba(255,255,255,0.94)"]}
            style={styles.quickLogBar}
          >
            {LOG_ACTIONS.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => setLogSheetOpen(true)}
                style={({ pressed }) => [styles.quickLogBtn, pressed && styles.pressed]}
              >
                <View style={[styles.quickLogIcon, { backgroundColor: action.color + "1A" }]}>
                  <MaterialCommunityIcons name={action.icon} size={18} color={action.color} />
                </View>
                <Text style={styles.quickLogLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </LinearGradient>
        </View>

        <View style={{ height: 92 }} />
      </ScrollView>

      {/* ── Daily Log Sheet ──────────────────────────────────────────────────── */}
      <DailyLogSheet
        visible={logSheetOpen}
        onClose={() => setLogSheetOpen(false)}
      />

      {/* ── Date detail popup ────────────────────────────────────────────────── */}
      <DateDetailPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        dateKey={popupDateKey}
        dateLabel={popupDateLabel}
        meta={popupMeta}
        log={getLogForDate(popupDateKey)}
      />

      {/* ── Routine detail sheet ─────────────────────────────────────────────── */}
      {routineOpen && (
        <>
          <Animated.View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, styles.sheetScrim, { opacity: routineOverlay }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeRoutine()} />
          </Animated.View>
          <Animated.View
            style={[styles.routineSheet, { transform: [{ translateY: routineSlide }] }]}
          >
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.routineHeaderRow}>
              <View style={styles.routineIconWrap}>
                <MaterialCommunityIcons name="yoga" size={22} color={C.sage} />
              </View>
              <View style={styles.routineHeaderText}>
                <Text style={styles.routineTitle}>{ROUTINE.title}</Text>
                <Text style={styles.routineMeta}>
                  {ROUTINE.duration} · {ROUTINE.level} · Day {CURRENT_DAY}
                </Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Why now */}
              <View style={styles.routineSection}>
                <View style={styles.routineSectionHeader}>
                  <MaterialCommunityIcons name="information-outline" size={14} color={C.muted} />
                  <Text style={styles.routineSectionLabel}>Why now</Text>
                </View>
                <Text style={styles.routineSectionBody}>{ROUTINE.why}</Text>
              </View>

              {/* Benefits */}
              <View style={styles.routineSection}>
                <View style={styles.routineSectionHeader}>
                  <MaterialCommunityIcons name="sprout-outline" size={14} color={C.sage} />
                  <Text style={[styles.routineSectionLabel, { color: C.sage }]}>Benefits</Text>
                </View>
                {ROUTINE.benefits.map((b, i) => (
                  <View key={i} style={styles.routineBenefitRow}>
                    <View style={[styles.routineBenefitDot, { backgroundColor: C.sage }]} />
                    <Text style={styles.routineBenefitText}>{b}</Text>
                  </View>
                ))}
              </View>

              {/* Play preview button */}
              <Pressable
                style={[styles.routinePlayRow, routinePlaying && styles.routinePlayRowActive]}
                onPress={() => setRoutinePlaying(p => !p)}
              >
                <View style={[styles.routinePlayCircle, { backgroundColor: routinePlaying ? C.terracotta : C.peach }]}>
                  <MaterialCommunityIcons
                    name={routinePlaying ? "pause" : "play"}
                    size={22}
                    color={C.white}
                    style={{ marginLeft: routinePlaying ? 0 : 2 }}
                  />
                </View>
                <View style={styles.routinePlayInfo}>
                  <Text style={styles.routinePlayTitle}>
                    {routinePlaying ? "Preview playing…" : "Play preview"}
                  </Text>
                  <Text style={styles.routinePlaySub}>
                    {routinePlaying ? "Tap to pause" : "0:00 / 18:00"}
                  </Text>
                </View>
                {routinePlaying && (
                  <View style={styles.routineWaveRow}>
                    {[5, 12, 8, 16, 10, 14, 6].map((h, i) => (
                      <View
                        key={i}
                        style={[styles.routineWaveBar, {
                          height: h + (i % 2 === 0 ? 4 : 0),
                          backgroundColor: C.terracotta,
                        }]}
                      />
                    ))}
                  </View>
                )}
              </Pressable>

              {/* Preview coming-soon nudge */}
              {routinePlaying && (
                <Pressable
                  style={styles.routinePreviewNote}
                  onPress={() => closeRoutine(ROUTINE.bloopMsg)}
                >
                  <MaterialCommunityIcons name="information-outline" size={13} color={C.muted} />
                  <Text style={styles.routinePreviewText}>
                    Full routine coming soon —{" "}
                    <Text style={{ color: C.lavender, fontFamily: F.uiSemiBold }}>
                      Ask Bloop to guide you
                    </Text>
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={13} color={C.faint} />
                </Pressable>
              )}

              {/* Ask Bloop CTA */}
              <Pressable
                style={styles.routineBloopBtn}
                onPress={() => closeRoutine(ROUTINE.bloopMsg)}
              >
                <LinearGradient
                  colors={["rgba(224,122,95,0.14)", "rgba(244,162,97,0.10)"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <MaterialCommunityIcons name="chat-processing-outline" size={17} color={C.terracotta} />
                <Text style={styles.routineBloopText}>Ask Bloop to guide you through this</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={C.terracotta} />
              </Pressable>

              <Pressable style={styles.sheetCloseBtn} onPress={() => closeRoutine()}>
                <Text style={styles.sheetCloseText}>Close</Text>
              </Pressable>
              <View style={{ height: 20 }} />
            </ScrollView>
          </Animated.View>
        </>
      )}

      {/* ── Calendar sheet ───────────────────────────────────────────────────── */}
      {calendarOpen && (
        <>
          <Animated.View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, styles.sheetScrim, { opacity: calendarOverlay }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeCalendar()} />
          </Animated.View>
          <Animated.View
            style={[styles.calendarSheet, { transform: [{ translateY: calendarSlide }] }]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.calSheetHeaderRow}>
              <Text style={styles.calSheetTitle}>Cycle Calendar</Text>
              <View style={styles.calSheetBadge}>
                <Text style={styles.calSheetBadgeText}>Day {CURRENT_DAY} / {CYCLE_LENGTH}</Text>
              </View>
            </View>
            <Text style={styles.calSheetSub}>May-June 2026 · scroll to compare logged and expected dates</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.calendarSheetScroll}>
              {CALENDAR_MONTHS.map((month, index) => (
                <MonthCalendar
                  key={`${month.name}-sheet`}
                  month={month}
                  monthIndex={index}
                  loggedDates={loggedDates}
                  onDayPress={(dk, meta) => handleDayPress(dk, meta, index, parseInt(dk.split("-")[2], 10))}
                />
              ))}

              <View style={styles.periodDetailsCard}>
                <Text style={styles.periodDetailsTitle}>Period tracking details</Text>
                <View style={styles.periodDetailRow}>
                  <Text style={styles.periodDetailLabel}>Last period</Text>
                  <Text style={styles.periodDetailValue}>May 1-5</Text>
                </View>
                <View style={styles.periodDetailRow}>
                  <Text style={styles.periodDetailLabel}>Expected period</Text>
                  <Text style={styles.periodDetailValue}>May 29-Jun 2</Text>
                </View>
                <View style={styles.periodDetailRow}>
                  <Text style={styles.periodDetailLabel}>Fertile window</Text>
                  <Text style={styles.periodDetailValue}>May 19-24</Text>
                </View>
              </View>

            {/* 4 × 7 grid: cycle days 1-28 */}
            {/* Bloop CTA */}
            <Pressable
              style={styles.calBloopBtn}
              onPress={() => closeCalendar("Looking at my cycle calendar for May 2026, what should I be aware of in the next 7 days and how can I prepare?")}
            >
              <LinearGradient
                colors={["rgba(146,119,200,0.14)", "rgba(212,92,130,0.08)"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialCommunityIcons name="chat-processing-outline" size={17} color={C.lavender} />
              <Text style={styles.calBloopText}>Ask Bloop about the next 7 days</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={C.lavender} />
            </Pressable>

            <Pressable style={styles.sheetCloseBtn} onPress={() => closeCalendar()}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </Pressable>
            </ScrollView>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  safeDark: {
    backgroundColor: "#111827",
  },
  scrollView: { flex: 1, backgroundColor: "transparent" },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    flexGrow: 1,
  },
  blob: {
    borderRadius: 999,
    position: "absolute",
  },

  // Header
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: C.text,
    fontFamily: F.luxuryBold,
    fontSize: 26,
    letterSpacing: 0.2,
  },
  headerSubRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 2,
  },
  headerDot: {
    backgroundColor: C.terracotta,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  headerSub: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 13,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    alignItems: "center",
    backgroundColor: C.cardBg,
    borderColor: C.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  bellBadge: {
    backgroundColor: C.terracotta,
    borderColor: C.white,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 8,
    position: "absolute",
    right: 8,
    top: 7,
    width: 8,
  },
  logBtn: {
    alignItems: "center",
    backgroundColor: C.terracotta,
    borderRadius: 18,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  logBtnText: {
    color: C.white,
    fontFamily: F.uiBold,
    fontSize: 13,
  },

  // Ring card
  ringCard: {
    alignItems: "center",
    backgroundColor: C.cardBg,
    borderColor: C.cardBorder,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    paddingBottom: 16,
    paddingTop: 20,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "absolute",
    top: 20 + CY - (R - SW / 2 - 14),
  },
  ringCenterImage: {
    borderRadius: R - SW / 2 - 14,
    height: "100%",
    opacity: 0.55,
    width: "100%",
  },
  ringCenterOverlay: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  ringDayNum: {
    color: C.text,
    fontFamily: F.luxuryBold,
    fontSize: 32,
    lineHeight: 36,
  },
  ringPhaseName: {
    color: C.muted,
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    marginTop: 2,
  },
  ringCountdown: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    marginTop: 6,
  },
  ringCountdownText: {
    color: C.sage,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },
  phaseLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 12,
  },
  legendPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.70)",
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  legendText: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },

  // Generic card
  card: {
    backgroundColor: C.cardBg,
    borderColor: C.cardBorder,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 14,
  },
  calendarHeaderCopy: { flex: 1, minWidth: 0 },
  cardTitle: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 15,
  },
  cardSub: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 11,
    marginTop: 1,
  },
  seeAllText: {
    color: C.lavender,
    fontFamily: F.uiSemiBold,
    fontSize: 12,
  },
  seeAllBtn: {
    borderRadius: 999,
    backgroundColor: "rgba(146,119,200,0.10)",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  // Graph
  graphChips: {
    marginBottom: 12,
  },
  graphChip: {
    borderColor: "rgba(196,184,212,0.40)",
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  graphChipText: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },
  graphWrap: {
    alignItems: "flex-start",
  },
  graphXAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 2,
    width: GRAPH_W,
  },
  graphXLabel: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 10,
  },
  graphLegendRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },
  graphLegendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  graphLegendLine: {
    borderRadius: 2,
    height: 3,
    width: 18,
  },
  graphLegendLabel: {
    color: C.muted,
    fontFamily: F.uiRegular,
    fontSize: 11,
  },

  // Metric grid
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: C.cardBg,
    borderColor: C.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    width: (W - 40 - 12) / 2,
  },
  metricIconBubble: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    marginBottom: 8,
    width: 36,
  },
  metricLabel: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 11,
  },
  metricValue: {
    fontFamily: F.uiBold,
    fontSize: 18,
    marginBottom: 6,
    marginTop: 2,
  },
  metricBarTrack: {
    backgroundColor: "rgba(196,184,212,0.22)",
    borderRadius: 4,
    height: 4,
    overflow: "hidden",
  },
  metricBarFill: {
    borderRadius: 4,
    height: 4,
  },

  // Insight card
  insightCard: {
    borderColor: "rgba(146,119,200,0.20)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 16,
    overflow: "hidden",
    padding: 18,
  },
  insightLeft: {
    flex: 1,
    paddingRight: 12,
  },
  insightIconRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 6,
  },
  insightTag: {
    color: C.lavender,
    fontFamily: F.uiSemiBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  insightTitle: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  insightBody: {
    color: C.muted,
    fontFamily: F.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  insightCta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  insightCtaText: {
    color: C.lavender,
    fontFamily: F.uiSemiBold,
    fontSize: 12,
  },
  insightImageWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 72,
  },
  insightImage: {
    height: 72,
    width: 72,
  },
  insightGlow: {
    backgroundColor: "rgba(146,119,200,0.18)",
    borderRadius: 36,
    bottom: -6,
    height: 36,
    position: "absolute",
    width: 52,
  },

  // Wellness card
  wellnessCard: {
    borderRadius: 24,
    height: 160,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  wellnessImage: {
    height: "100%",
    width: "100%",
  },
  wellnessContent: {
    bottom: 16,
    left: 18,
    position: "absolute",
  },
  wellnessTag: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  wellnessTagText: {
    color: "rgba(255,255,255,0.90)",
    fontFamily: F.uiMedium,
    fontSize: 10,
  },
  wellnessTitle: {
    color: C.white,
    fontFamily: F.uiBold,
    fontSize: 17,
  },
  wellnessSub: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: F.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  playBtn: {
    bottom: 16,
    position: "absolute",
    right: 18,
    shadowColor: C.peach,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  playBtnInner: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  // Calendar strip
  calStrip: {
    marginHorizontal: -4,
  },
  calDay: {
    alignItems: "center",
    marginHorizontal: 4,
    width: 28,
  },
  calDayToday: {
    opacity: 1,
  },
  calDot: {
    borderRadius: 6,
    height: 10,
    marginBottom: 4,
    width: 10,
  },
  calDotToday: {
    borderColor: C.white,
    borderWidth: 2,
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  calDayNum: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 10,
  },
  calDayNumToday: {
    color: C.terracotta,
    fontFamily: F.uiBold,
  },

  // Quick log bar
  quickLogInline: {
    gap: 10,
    marginTop: 2,
  },
  quickLogTitle: {
    color: C.text,
    fontFamily: F.uiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  quickLogBar: {
    borderColor: C.cardBorder,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 10,
    shadowColor: "#D6C3B9",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  quickLogBtn: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  quickLogIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  quickLogLabel: {
    color: C.muted,
    fontFamily: F.uiMedium,
    fontSize: 10,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },

  // ── Shared sheet primitives ────────────────────────────────────────────────
  sheetScrim: { backgroundColor: "rgba(0,0,0,0.38)", zIndex: 40 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "rgba(0,0,0,0.12)", alignSelf: "center", marginBottom: 18 },
  sheetCloseBtn: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 24, marginTop: 6 },
  sheetCloseText: { fontFamily: F.uiMedium, fontSize: 13.5, color: "rgba(28,21,40,0.35)" },

  // ── Routine detail sheet ───────────────────────────────────────────────────
  routineSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    maxHeight: H * 0.85,
    backgroundColor: "#FFFAF7",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 24, paddingTop: 14,
    zIndex: 50,
    shadowColor: "#000", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.10, shadowRadius: 20, elevation: 14,
  },
  routineHeaderRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  routineIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(94,155,107,0.14)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  routineHeaderText: { flex: 1 },
  routineTitle: { fontFamily: F.luxuryBold, fontSize: 20, color: C.text, letterSpacing: -0.2, marginBottom: 3 },
  routineMeta:  { fontFamily: F.uiMedium, fontSize: 12.5, color: C.muted },
  routineSection: { marginBottom: 18 },
  routineSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  routineSectionLabel: { fontFamily: F.uiSemiBold, fontSize: 12, color: C.muted, letterSpacing: 0.4, textTransform: "uppercase" },
  routineSectionBody: { fontFamily: F.bodyRegular, fontSize: 15, color: C.text, lineHeight: 23 },
  routineBenefitRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4 },
  routineBenefitDot: { width: 6, height: 6, borderRadius: 3, marginTop: 9, flexShrink: 0 },
  routineBenefitText: { fontFamily: F.uiRegular, fontSize: 14, color: C.text, lineHeight: 21, flex: 1 },
  routinePlayRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "rgba(244,162,97,0.10)", borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(244,162,97,0.22)",
    padding: 14, marginBottom: 10,
  },
  routinePlayRowActive: {
    backgroundColor: "rgba(224,122,95,0.12)", borderColor: "rgba(224,122,95,0.30)",
  },
  routinePlayCircle: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    shadowColor: C.terracotta, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  routinePlayInfo: { flex: 1 },
  routinePlayTitle: { fontFamily: F.uiSemiBold, fontSize: 14, color: C.text, marginBottom: 2 },
  routinePlaySub:   { fontFamily: F.uiRegular,  fontSize: 12, color: C.muted },
  routineWaveRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  routineWaveBar: { width: 3, borderRadius: 2, backgroundColor: C.terracotta },
  routinePreviewNote: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(196,184,212,0.35)",
    marginBottom: 12,
  },
  routinePreviewText: { flex: 1, fontFamily: F.uiRegular, fontSize: 12, color: C.muted, lineHeight: 17 },
  routineBloopBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(224,122,95,0.25)",
    paddingHorizontal: 18, paddingVertical: 15,
    overflow: "hidden", marginTop: 4, marginBottom: 4,
  },
  routineBloopText: { flex: 1, fontFamily: F.uiSemiBold, fontSize: 14.5, color: C.terracotta },

  // ── Calendar sheet ─────────────────────────────────────────────────────────
  calendarCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    shadowColor: C.terracotta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 22,
    elevation: 5,
  },
  calendarMonthScroller: {
    paddingRight: 12,
    paddingTop: 12,
  },
  monthBlock: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.70)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    padding: 14,
    marginBottom: 14,
  },
  monthBlockCompact: { width: W - 76, marginRight: 14, marginBottom: 0 },
  monthTitleRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 12 },
  monthTitle: { fontFamily: F.luxuryBold, fontSize: 21, color: C.text },
  monthYear: { fontFamily: F.uiSemiBold, fontSize: 12, color: C.muted },
  // ── Week header row — flex children align exactly with day cells ──────────
  monthWeekRow: { flexDirection: "row", marginBottom: 6 },
  monthWeekCell: { flex: 1, alignItems: "center" },
  monthWeekText: { textAlign: "center", fontFamily: F.uiBold, fontSize: 10, color: C.faint },

  // ── Grid row — one per calendar week ──────────────────────────────────────
  monthGridRow: { flexDirection: "row" },

  // ── Day cell — flex: 1 so 7 cells fill the row with zero rounding error ──
  monthDayCell: {
    alignItems: "center",
    flex: 1,
    height: 44,
    justifyContent: "center",
    overflow: "visible",
  },

  // ── Day circle — fixed 30×30, rendered on top of range strips ────────────
  monthDayRing: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 15,
    borderWidth: 2,
    height: 30,
    justifyContent: "center",
    width: 30,
    zIndex: 1,
  },

  // ── Range connection strips (absolute, sit behind the circle) ─────────────
  // Each strip covers one HALF of the cell width — adjacent halves from
  // neighbouring cells join up to form a continuous coloured arc/pill.
  rangeStrip: {
    height: 30,
    position: "absolute",
    top: 7,   // centres strip on the 30px circle inside a 44px cell
    width: "50%",
    zIndex: 0,
  },
  rangeStripL: { left: 0 },
  rangeStripR: { right: 0 },

  // ── Special ring overrides ────────────────────────────────────────────────
  fertileCircle:      { backgroundColor: "rgba(94,155,107,0.20)", borderColor: "transparent" },
  todayDayRing:       { borderColor: C.text, borderWidth: 2, backgroundColor: "rgba(255,255,255,0.92)" },
  // Predicted period: transparent bg + pink border (dashed emulated via borderStyle)
  expectedPeriodRing: { backgroundColor: "rgba(212,92,130,0.07)", borderColor: "#D45C82", borderWidth: 1.5, borderStyle: "dashed" as const },
  // History dot under date number
  historyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 1,
  },
  selectedDayRing: {
    borderColor: C.lavender,
    borderWidth: 2,
    shadowColor: C.lavender,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },

  // ── Day text ──────────────────────────────────────────────────────────────
  monthDayText:    { fontFamily: F.uiSemiBold, fontSize: 13, color: C.text },
  highlightDayText: { color: "#FFFFFF", fontFamily: F.uiBlack },  // on coloured bg
  fertileDayText:  { color: "#3D7A4A", fontFamily: F.uiSemiBold },
  todayDayText:    { color: C.text, fontFamily: F.uiBlack },
  tinyCycleDay:    { fontFamily: F.uiBold, fontSize: 8, marginTop: -1 },
  periodSummaryRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  periodSummaryItem: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(255,250,247,0.86)",
    borderWidth: 1,
    borderColor: "rgba(224,122,95,0.12)",
    padding: 12,
  },
  periodSummaryValue: { fontFamily: F.uiBlack, fontSize: 13, color: C.text },
  periodSummaryLabel: { fontFamily: F.uiSemiBold, fontSize: 10.5, color: C.muted, marginTop: 3 },
  // flex: 1 lets the scroll fill whatever space the sheet has after its fixed
  // header/sub rows, so June is never clipped regardless of device height.
  calendarSheetScroll: { flex: 1, paddingBottom: 36 },
  periodDetailsCard: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    padding: 16,
    marginBottom: 16,
  },
  periodDetailsTitle: { fontFamily: F.luxuryBold, fontSize: 18, color: C.text, marginBottom: 10 },
  periodDetailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(28,21,40,0.06)" },
  periodDetailLabel: { fontFamily: F.uiSemiBold, fontSize: 12.5, color: C.muted },
  periodDetailValue: { fontFamily: F.uiBlack, fontSize: 12.5, color: C.text },

  calendarSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    // maxHeight prevents the sheet from growing taller than 90% of screen
    maxHeight: H * 0.90,
    // flex column so the scroll view fills remaining space below the header
    flexDirection: "column",
    backgroundColor: "#FFFAF7",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 24, paddingBottom: 0, paddingTop: 14,
    zIndex: 50,
    shadowColor: "#000", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.10, shadowRadius: 20, elevation: 14,
  },
  calSheetHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  calSheetTitle: { fontFamily: F.luxuryBold, fontSize: 22, color: C.text, letterSpacing: -0.2 },
  calSheetBadge: { backgroundColor: "rgba(224,122,95,0.12)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  calSheetBadgeText: { fontFamily: F.uiSemiBold, fontSize: 12, color: C.terracotta },
  calSheetSub: { fontFamily: F.uiRegular, fontSize: 12.5, color: C.muted, marginBottom: 18 },
  calGridHeader: { flexDirection: "row", justifyContent: "space-around", marginBottom: 6 },
  calGridHeaderText: { fontFamily: F.uiSemiBold, fontSize: 11, color: C.faint, width: 36, textAlign: "center" },
  calGridRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  calGridCell: { width: 36, alignItems: "center", gap: 4, paddingVertical: 4 },
  calGridDot: { width: 10, height: 10, borderRadius: 5 },
  calGridDayNum: { fontFamily: F.uiMedium, fontSize: 11.5, color: C.muted },
  calPhaseLegend: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 4, marginBottom: 18 },
  calLegendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  calLegendDot: { width: 8, height: 8, borderRadius: 4 },
  calLegendText: { fontFamily: F.uiMedium, fontSize: 11, color: C.muted },
  calUpcomingTitle: { fontFamily: F.uiSemiBold, fontSize: 13, color: C.text, marginBottom: 10, letterSpacing: 0.2 },
  calEventRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.042)" },
  calEventDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  calEventLabel: { fontFamily: F.uiSemiBold, fontSize: 13, color: C.text, flex: 1 },
  calEventDetail: { fontFamily: F.uiRegular, fontSize: 12, color: C.muted },
  calBloopBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(146,119,200,0.25)",
    paddingHorizontal: 18, paddingVertical: 15,
    overflow: "hidden", marginTop: 16, marginBottom: 4,
  },
  calBloopText: { flex: 1, fontFamily: F.uiSemiBold, fontSize: 14.5, color: C.lavender },

  // ── Date detail popup ─────────────────────────────────────────────────────
  popupScrim: {
    flex: 1,
    backgroundColor: "rgba(22,18,28,0.36)",
    justifyContent: "flex-end",
  },
  popupSheet: {
    backgroundColor: "#FFFAF7",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.90)",
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 14,
  },
  popupHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.14)",
    alignSelf: "center",
    marginBottom: 16,
  },
  popupHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  popupDate: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: C.text,
    marginBottom: 6,
  },
  popupPhasePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  popupPhaseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  popupPhaseText: {
    fontFamily: F.uiBold,
    fontSize: 12,
  },
  popupCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  popupContent: {
    gap: 12,
  },
  popupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.042)",
  },
  popupRowLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    color: C.muted,
    flex: 1,
  },
  popupRowValue: {
    fontFamily: F.uiBlack,
    fontSize: 13,
    color: C.text,
  },
  popupJournalWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  popupJournalText: {
    flex: 1,
    fontFamily: F.uiRegular,
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
  },
  popupEmptyWrap: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 28,
  },
  popupEmptyTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 17,
    color: C.text,
  },
  popupEmptyMsg: {
    fontFamily: F.uiRegular,
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
  },
});
