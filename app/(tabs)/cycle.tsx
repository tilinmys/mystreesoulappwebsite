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
  G,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Svg,
  Line,
  Text as SvgText,
  TextPath,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { BIO } from "../../constants/colors";
import { F } from "../../constants/fonts";
import { useColorMode } from "../../hooks/useColorMode";
import { openBloopWithContext } from "../../lib/openBloopWithContext";
import { useDailyLogStore } from "../../store/dailyLogStore";

// ── Assets ────────────────────────────────────────────────────────────────────
const imgPetals      = require("../../public/images/fertility-glow-visual.webp");
const imgBloop       = require("../../public/images/bloop-calm.webp");
const imgYogaMenstrual = require("../../public/images/yoga_menstrual.png");
const imgYogaFollicular = require("../../public/images/yoga_follicular.png");
const imgYogaOvulation  = require("../../public/images/yoga_ovulation.png");
const imgYogaLuteal     = require("../../public/images/yoga_luteal.png");

// ── Hormone graph line colors — informational scientific identifiers ───────────
// NOT brand tokens. NOT biological tracking tokens.
// Pattern mirrors NotificationCard category tints (intentionally fixed).
const GRAPH_COLORS = {
  estrogen:     "#9277C8",
  progesterone: "#D45C82",
  lh:           "#C9A040",
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

function getCycleDayForDate(monthIndex: number, day: number): number {
  let cycleDay = 1;
  if (monthIndex === 0) {
    cycleDay = day >= 3 ? (day - 2) : (day + 26);
  } else if (monthIndex === 1) {
    if (day <= 28) cycleDay = day;
    else cycleDay = day - 28;
  } else if (monthIndex === 2) {
    cycleDay = day + 3;
  }
  return ((cycleDay - 1) % 28 + 28) % 28 + 1;
}

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

// ── Phase arc definitions (startDeg, endDeg from -90° top) ───────────────────
const PHASE_ARCS = [
  { id: "menstru",    start: -90,   end: -24,   gradId: "gMen",  label: "Menstruation", labelAngle: -57 },
  { id: "follicular", start: -24,   end:  90,   gradId: "gFol",  label: "Follicular",   labelAngle:  33 },
  { id: "ovulation",  start:  90,   end: 153,   gradId: "gOvu",  label: "Ovulation",    labelAngle: 121 },
  { id: "luteal",     start:  153,  end: 270,   gradId: "gLut",  label: "Luteal",       labelAngle: 211 },
];

const CURRENT_ANGLE = -90 + (CURRENT_DAY / CYCLE_LENGTH) * 360;

function phasePos(angleDeg: number, r: number, cx: number, cy: number) {
  return {
    x: cx + r * Math.cos(toRad(angleDeg)),
    y: cy + r * Math.sin(toRad(angleDeg)),
  };
}

// ── Cycle day info (phaseType replaces hardcoded color) ───────────────────────
type PhaseType = "period" | "prefertile" | "fertile" | "ovulation" | "luteal";

type CycleDayInfo = {
  phase: "Menstruation" | "Pre-fertile" | "Fertile Window" | "Ovulation" | "Luteal Phase";
  message: string;
  phaseType: PhaseType;
  color: string;
};

const cycleData: Record<number, CycleDayInfo> = {
  1:  { phase: "Menstruation",  message: "Let's take care of you 💗",               phaseType: "period",     color: "#F9597A" },
  2:  { phase: "Menstruation",  message: "Rest and stay hydrated. 💧",               phaseType: "period",     color: "#FF8A9F" },
  3:  { phase: "Menstruation",  message: "Warmth and slow movement can help. ☕",    phaseType: "period",     color: "#FF97AB" },
  4:  { phase: "Menstruation",  message: "Your body is asking for softness. 🌸",     phaseType: "period",     color: "#FFA4B6" },
  5:  { phase: "Menstruation",  message: "Energy may begin returning. ⚡",           phaseType: "period",     color: "#FFB2C1" },
  6:  { phase: "Pre-fertile",   message: "A gentle reset day. 🧘‍♀️",                   phaseType: "prefertile", color: "#F5F5F5" },
  7:  { phase: "Pre-fertile",   message: "Notice what feels lighter today. 🌿",      phaseType: "prefertile", color: "#F5F5F5" },
  8:  { phase: "Fertile Window",message: "Energy is rising ✨",                     phaseType: "fertile",    color: "#C8E6C9" },
  9:  { phase: "Fertile Window",message: "A good day for fresh plans. 📅",           phaseType: "fertile",    color: "#C8E6C9" },
  10: { phase: "Fertile Window",message: "Confidence may feel easier. ☀️",           phaseType: "fertile",    color: "#C8E6C9" },
  11: { phase: "Fertile Window",message: "Your body is opening into energy. 🏃‍♀️",     phaseType: "fertile",    color: "#C8E6C9" },
  12: { phase: "Fertile Window",message: "Support your rising rhythm. 🌊",           phaseType: "fertile",    color: "#C8E6C9" },
  13: { phase: "Fertile Window",message: "You may feel more social today. 💬",       phaseType: "fertile",    color: "#C8E6C9" },
  14: { phase: "Ovulation",     message: "Peak fertility today 🌸",                 phaseType: "ovulation",  color: "#388E3C" },
  15: { phase: "Luteal Phase",  message: "Begin easing into steadiness. 🍃",         phaseType: "luteal",     color: "#EDE7F6" },
  16: { phase: "Luteal Phase",  message: "Keep meals steady and nourishing. 🥑",     phaseType: "luteal",     color: "#EDE7F6" },
  17: { phase: "Luteal Phase",  message: "A grounded routine can help. 🏡",          phaseType: "luteal",     color: "#EDE7F6" },
  18: { phase: "Luteal Phase",  message: "Listen for early body signals. 🎙️",        phaseType: "luteal",     color: "#EDE7F6" },
  19: { phase: "Luteal Phase",  message: "Choose calm over pressure. 🌬️",            phaseType: "luteal",     color: "#EDE7F6" },
  20: { phase: "Luteal Phase",  message: "Protect your sleep tonight. 🌙",           phaseType: "luteal",     color: "#EDE7F6" },
  21: { phase: "Luteal Phase",  message: "Cravings may need care, not control. 🍫",  phaseType: "luteal",     color: "#EDE7F6" },
  22: { phase: "Luteal Phase",  message: "Focus on nourishment 🧘‍♀️",                 phaseType: "luteal",     color: "#EDE7F6" },
  23: { phase: "Luteal Phase",  message: "Slow rituals can feel supportive. 🕯️",     phaseType: "luteal",     color: "#EDE7F6" },
  24: { phase: "Luteal Phase",  message: "Hydration and magnesium may help. 🥛",     phaseType: "luteal",     color: "#EDE7F6" },
  25: { phase: "Luteal Phase",  message: "Make room for gentleness. ☁️",             phaseType: "luteal",     color: "#EDE7F6" },
  26: { phase: "Luteal Phase",  message: "Lower the noise where you can. 🤫",        phaseType: "luteal",     color: "#EDE7F6" },
  27: { phase: "Luteal Phase",  message: "Rest is productive today. 🛌",             phaseType: "luteal",     color: "#EDE7F6" },
  28: { phase: "Luteal Phase",  message: "Your next reset may be close. 🔄",         phaseType: "luteal",     color: "#EDE7F6" },
};

// ── Circular tracker constants ────────────────────────────────────────────────
const CIRCULAR_TRACKER_SIZE = Math.min(W - 12, 390);
const CYCLE_VIEWBOX = 450;
const CYCLE_CENTER = 225;
const CYCLE_SEGMENT_COUNT = 28;
const CYCLE_SEGMENT_ANGLE = 360 / CYCLE_SEGMENT_COUNT;
const CYCLE_START_ANGLE = 90 - 13.5 * CYCLE_SEGMENT_ANGLE;
const CYCLE_OUTER_R = 154;
const CYCLE_INNER_R = 112;
const CYCLE_GAP_DEG = 0.92;
const OVULATION_SOCKET_GAP_DEG = 9.5;
const OVULATION_BUBBLE_R = 140;
const OVULATION_MARKER_R = 190;
const OVULATION_LABEL_R = 214;

function polarPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const angle = toRad(angleDeg);
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function describeCurvedPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarPoint(cx, cy, r, startDeg);
  const end   = polarPoint(cx, cy, r, endDeg);
  const sweep = (endDeg - startDeg + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function describeCurvedPathCCW(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarPoint(cx, cy, r, startDeg);
  const end   = polarPoint(cx, cy, r, endDeg);
  const sweep = (startDeg - endDeg + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function describeDonutSegment(startDeg: number, endDeg: number, outerR: number, innerR: number): string {
  const outerStart = polarPoint(CYCLE_CENTER, CYCLE_CENTER, outerR, startDeg);
  const outerEnd   = polarPoint(CYCLE_CENTER, CYCLE_CENTER, outerR, endDeg);
  const innerEnd   = polarPoint(CYCLE_CENTER, CYCLE_CENTER, innerR, endDeg);
  const innerStart = polarPoint(CYCLE_CENTER, CYCLE_CENTER, innerR, startDeg);
  const largeArc   = endDeg - startDeg > 180 ? 1 : 0;

  return [
    `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

// ── Calendar: months and helpers ──────────────────────────────────────────────
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const CALENDAR_MONTHS = [
  { name: "April", year: 2026, days: 30, startOffset: 2 },
  { name: "May",   year: 2026, days: 31, startOffset: 4 },
  { name: "June",  year: 2026, days: 30, startOffset: 0 },
];

const MONTH_TO_NUM: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4,
  May: 5, June: 6, July: 7, August: 8,
  September: 9, October: 10, November: 11, December: 12,
};

function getDateKey(monthIndex: number, day: number): string {
  const m  = CALENDAR_MONTHS[monthIndex];
  const mm = String(MONTH_TO_NUM[m.name]).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${m.year}-${mm}-${dd}`;
}

function isPastDate(monthIndex: number, day: number): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return getDateKey(monthIndex, day) < today;
}

function calendarMeta(monthIndex: number, day: number) {
  const cycleDay = getCycleDayForDate(monthIndex, day);
  const isToday           = monthIndex === 1 && day === 18;
  const isPreviousPeriod  = monthIndex === 0 && day >= 3 && day <= 7;
  const isLoggedPeriod    = isPreviousPeriod || (monthIndex === 1 && day >= 1 && day <= 5);
  const isExpectedPeriod  =
    (monthIndex === 1 && day >= 29 && day <= 31) ||
    (monthIndex === 2 && day >= 1  && day <= 2);
  const isFertile   = cycleDay >= 8 && cycleDay <= 13;
  const isOvulation = cycleDay === 14;

  return { cycleDay, isToday, isLoggedPeriod, isExpectedPeriod, isFertile, isOvulation };
}

// ── MonthCalendar ─────────────────────────────────────────────────────────────
function MonthCalendar({
  month,
  monthIndex,
  compact = false,
  loggedDates = new Set<string>(),
  parentSelectedDay,
  onDayPress,
}: {
  month: typeof CALENDAR_MONTHS[number];
  monthIndex: number;
  compact?: boolean;
  loggedDates?: Set<string>;
  parentSelectedDay: number;
  onDayPress?: (dateKey: string, meta: ReturnType<typeof calendarMeta>) => void;
}) {
  const { colors, isDark } = useColorMode();

  const EP_CLR = BIO.period; // expected period color

  // Flat cell array — null = empty spacer, number = day
  const allCells: (number | null)[] = [
    ...Array.from({ length: month.startOffset }, () => null),
    ...Array.from({ length: month.days }, (_, i) => i + 1),
  ];
  while (allCells.length % 7 !== 0) allCells.push(null);

  // Chunk into rows of 7
  const rows: (number | null)[][] = [];
  for (let i = 0; i < allCells.length; i += 7) rows.push(allCells.slice(i, i + 7));

  return (
    <View style={[
      styles.monthBlock,
      compact && styles.monthBlockCompact,
      { backgroundColor: colors.surface, borderColor: colors.border },
    ]}>
      {/* Month title */}
      <View style={styles.monthTitleRow}>
        <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>{month.name}</Text>
        <Text style={[styles.monthYear,  { color: colors.textMuted   }]}>{month.year}</Text>
      </View>

      {/* Week headers */}
      <View style={styles.monthWeekRow}>
        {WEEK_DAYS.map((d, i) => (
          <View key={i} style={styles.monthWeekCell}>
            <Text style={[styles.monthWeekText, { color: `${colors.textMuted}99` }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar rows */}
      {rows.map((row, rowIdx) => {
        // Parse contiguous segments in this row
        const segments: { startCol: number; endCol: number; type: 'logged' | 'expected' | 'fertile' }[] = [];
        let currentLoggedStart: number | null = null;
        let currentExpectedStart: number | null = null;
        let currentFertileStart: number | null = null;

        for (let col = 0; col < 7; col++) {
          const day = row[col];
          if (day != null) {
            const meta = calendarMeta(monthIndex, day);
            
            // Check Logged Range (inLP)
            if (meta.isLoggedPeriod) {
              if (currentLoggedStart === null) {
                currentLoggedStart = col;
              }
            } else {
              if (currentLoggedStart !== null) {
                segments.push({ startCol: currentLoggedStart, endCol: col - 1, type: 'logged' });
                currentLoggedStart = null;
              }
            }

            // Check Expected Range (inEP)
            if (meta.isExpectedPeriod) {
              if (currentExpectedStart === null) {
                currentExpectedStart = col;
              }
            } else {
              if (currentExpectedStart !== null) {
                segments.push({ startCol: currentExpectedStart, endCol: col - 1, type: 'expected' });
                currentExpectedStart = null;
              }
            }

            // Check Fertile Range (isFertile)
            if (meta.isFertile) {
              if (currentFertileStart === null) {
                currentFertileStart = col;
              }
            } else {
              if (currentFertileStart !== null) {
                segments.push({ startCol: currentFertileStart, endCol: col - 1, type: 'fertile' });
                currentFertileStart = null;
              }
            }
          } else {
            if (currentLoggedStart !== null) {
              segments.push({ startCol: currentLoggedStart, endCol: col - 1, type: 'logged' });
              currentLoggedStart = null;
            }
            if (currentExpectedStart !== null) {
              segments.push({ startCol: currentExpectedStart, endCol: col - 1, type: 'expected' });
              currentExpectedStart = null;
            }
            if (currentFertileStart !== null) {
              segments.push({ startCol: currentFertileStart, endCol: col - 1, type: 'fertile' });
              currentFertileStart = null;
            }
          }
        }
        if (currentLoggedStart !== null) {
          segments.push({ startCol: currentLoggedStart, endCol: 6, type: 'logged' });
        }
        if (currentExpectedStart !== null) {
          segments.push({ startCol: currentExpectedStart, endCol: 6, type: 'expected' });
        }
        if (currentFertileStart !== null) {
          segments.push({ startCol: currentFertileStart, endCol: 6, type: 'fertile' });
        }

        return (
          <View key={rowIdx} style={styles.monthGridRow}>
            {/* Contiguous background range pills positioned absolutely behind cell dates */}
            {segments.map((seg, sIdx) => {
              const leftPct = `${(seg.startCol * 100) / 7}%`;
              const widthPct = `${((seg.endCol - seg.startCol + 1) * 100) / 7}%`;
              
              if (seg.type === 'logged') {
                return (
                  <View
                    key={`seg-l-${sIdx}`}
                    style={{
                      position: 'absolute',
                      left: leftPct as any,
                      width: widthPct as any,
                      height: 30,
                      top: 7,
                      backgroundColor: isDark ? 'rgba(232, 128, 144, 0.22)' : 'rgba(232, 128, 144, 0.15)',
                      borderRadius: 15,
                      zIndex: 0,
                    }}
                  />
                );
              } else if (seg.type === 'expected') {
                return (
                  <View
                    key={`seg-e-${sIdx}`}
                    style={{
                      position: 'absolute',
                      left: leftPct as any,
                      width: widthPct as any,
                      height: 30,
                      top: 7,
                      borderColor: isDark ? '#E88090' : '#C44E68',
                      borderWidth: 1.5,
                      borderStyle: 'dashed',
                      borderRadius: 15,
                      backgroundColor: 'transparent',
                      zIndex: 0,
                    }}
                  />
                );
              } else {
                return (
                  <View
                    key={`seg-f-${sIdx}`}
                    style={{
                      position: 'absolute',
                      left: leftPct as any,
                      width: widthPct as any,
                      height: 30,
                      top: 7,
                      backgroundColor: isDark ? 'rgba(45, 138, 94, 0.18)' : 'rgba(45, 138, 94, 0.12)',
                      borderRadius: 15,
                      zIndex: 0,
                    }}
                  />
                );
              }
            })}

            {/* Render cell days */}
            {row.map((day, colIdx) => {
              if (day == null) return <View key={`e-${rowIdx}-${colIdx}`} style={styles.monthDayCell} />;

              const meta = calendarMeta(monthIndex, day);
              const lpHere  = meta.isLoggedPeriod;
              const epHere  = meta.isExpectedPeriod;
              const dateKey = getDateKey(monthIndex, day);

              return (
                <Pressable
                  key={`${month.name}-${day}`}
                  accessibilityLabel={`${month.name} ${day}`}
                  accessibilityRole="button"
                  onPress={() => {
                    onDayPress?.(dateKey, meta);
                  }}
                  style={styles.monthDayCell}
                >
                  {/* Day circle */}
                  <View
                    style={[
                      styles.monthDayRing,
                      meta.isToday && !epHere && !lpHere && {
                        borderColor: colors.primaryCTA,
                        borderWidth: 2,
                        backgroundColor: `${colors.surface}F0`,
                      },
                      meta.cycleDay === parentSelectedDay && {
                        borderColor: colors.primaryCTA,
                        borderWidth: 2,
                      },
                      meta.isOvulation && {
                        backgroundColor: isDark ? '#2E7D32' : '#2D8A5E',
                        borderWidth: 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthDayText,
                        { color: colors.textPrimary },
                        lpHere && { color: isDark ? '#FFA4B6' : '#C44E68', fontFamily: F.uiBold },
                        epHere && { color: isDark ? '#FFA4B6' : '#C44E68', fontFamily: F.uiBold },
                        meta.isOvulation && { color: '#FFFFFF', fontFamily: F.uiBold },
                        meta.isToday && !epHere && !lpHere && { color: colors.textPrimary, fontFamily: F.uiBlack },
                      ]}
                    >
                      {day}
                    </Text>
                  </View>

                  {epHere && !compact && (
                    <Text style={[styles.tinyCycleDay, { color: EP_CLR }]}>D{meta.cycleDay}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ── InteractiveCycleWheel ─────────────────────────────────────────────────────

function InteractiveCycleWheel({
  selectedDay,
  setSelectedDay,
}: {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
}) {
  const { colors, isDark } = useColorMode();
  const fade = useRef(new Animated.Value(1)).current;
  const selected = cycleData[selectedDay];

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [selectedDay]);

  function selectDay(day: number) {
    if (day === selectedDay) return;
    setSelectedDay(day);
  }

  // ── Dynamic Wheel Annotations Geometry ──────────────────────────────────
  const SEGMENT_ANGLE = 360 / 28; // 12.857142857

  // Dynamic active color for high-vibrancy glow and high-contrast texts
  function getActiveColor(day: number): string {
    if (isDark) {
      if (day >= 1 && day <= 5) return "#FF4081";
      if (day >= 8 && day <= 14) return "#81C784";
      if (day >= 15 && day <= 28) return "#B39DDB";
      return "#9E9EAE";
    } else {
      if (day >= 1 && day <= 5) return "#E63B60"; // Menstruation red/pink
      if (day >= 8 && day <= 14) return "#2D8A5E"; // Fertile window/Ovulation forest green
      if (day >= 15 && day <= 28) return "#7E7EBE"; // Luteal phase purple/blue
      return "#7E7E9E"; // Pre-fertile grey
    }
  }

  const activeColor = getActiveColor(selectedDay);

  // ── Segment fill and text color ──────────────────────────────────────────
  function getSegmentColor(day: number): { fill: string; text: string } {
    if (isDark) {
      // Dark Mode colors
      if (day >= 1 && day <= 5) {
        // Menstruation (varying pink/red with dark background text for AAA contrast)
        const colorsList = ["#D81B60", "#EC407A", "#F48FB1", "#F8BBD0", "#FFCDD2"];
        return { fill: colorsList[day - 1] || "#D81B60", text: colors.background };
      }
      if (day === 6 || day === 7) {
        // Pre-fertile (standard Velvet Mauve inactive day blocks)
        return { fill: colors.surfaceRaised, text: colors.textPrimary };
      }
      if (day >= 8 && day <= 13) {
        // Fertile window (varying mint greens with dark background text for AAA contrast)
        const colorsList = ["#1B5E20", "#2E7D32", "#388E3C", "#43A047", "#4CAF50", "#66BB6A"];
        return { fill: colorsList[day - 8] || "#2E7D32", text: colors.background };
      }
      if (day === 14) {
        // Ovulation
        return { fill: "#2E7D32", text: colors.background };
      }
      // Luteal Phase (Days 15-28 - Velvet Mauve inactive day blocks)
      return { fill: colors.surfaceRaised, text: colors.textPrimary };
    } else {
      // Light Mode colors (exact match to screenshot)
      if (day >= 1 && day <= 5) {
        // Menstruation (varying pinks/reds with white text)
        const colorsList = ["#E63B60", "#EB607F", "#F0859E", "#F5AABD", "#FAD0DC"];
        return { fill: colorsList[day - 1] || "#E63B60", text: "#FFFFFF" };
      }
      if (day === 6 || day === 7) {
        // Pre-fertile (soft greyish lavender with grey text)
        return { fill: "#F0F0F7", text: "#7E7E9E" };
      }
      if (day >= 8 && day <= 13) {
        // Fertile window (varying mint greens with neutral dark text)
        const colorsList = ["#C2E9C2", "#CEEFCE", "#DBF4DB", "#E8F8E8", "#F0FAF0", "#F7FCF7"];
        return { fill: colorsList[day - 8] || "#C2E9C2", text: "#221822" };
      }
      if (day === 14) {
        // Ovulation
        return { fill: "#2D8A5E", text: "#FFFFFF" };
      }
      // Luteal Phase (Days 15-28)
      return { fill: "#EDEAF6", text: "#5A5A82" };
    }
  }

  // ── Text Path and Bracket Formulas ─────────────────────────────────────────
  // Outer Bracket indicators (Line R = 172, Text R = 184)
  // Menstruation (Days 1-5): B1 (270) to B6 (334.2857)
  const menLineD = describeCurvedPath(CYCLE_CENTER, CYCLE_CENTER, 172, 270, 334.2857);
  const menTextD = describeCurvedPath(CYCLE_CENTER, CYCLE_CENTER, 184, 272, 332.2857);

  // Fertile Window (Days 8-13): B8 (0) to B14 (77.1428)
  const ferLineD = describeCurvedPath(CYCLE_CENTER, CYCLE_CENTER, 172, 0, 77.1428);
  // Re-routed to trace counter-clockwise (CCW) starting from bottom and going to right,
  // making characters orient upright along the bottom right quadrant.
  const ferTextD = describeCurvedPathCCW(CYCLE_CENTER, CYCLE_CENTER, 184, 75.1428, 2);

  // Luteal Phase (Days 15-28): B15 (90) to B29 (270)
  const lutLineD = describeCurvedPath(CYCLE_CENTER, CYCLE_CENTER, 172, 90, 270);
  const lutTextD = describeCurvedPath(CYCLE_CENTER, CYCLE_CENTER, 184, 92, 268);

  // Ovulation popped-out coordinates
  const d14Angle = 270 + 13.5 * SEGMENT_ANGLE; // 83.5714
  const d14X = CYCLE_CENTER + OVULATION_BUBBLE_R * Math.cos(toRad(d14Angle));
  const d14Y = CYCLE_CENTER + OVULATION_BUBBLE_R * Math.sin(toRad(d14Angle));
  const d14Color = isDark ? "#2E7D32" : "#2D8A5E";

  const menColor = isDark ? "#FF4081" : "#E63B60";
  const ferColor = isDark ? "#81C784" : "#2D8A5E";
  const lutColor = isDark ? "#B39DDB" : "#7E7EBE";

  // Render a small tick marker at specific angle
  function renderTickLine(angleDeg: number, key: string, color: string) {
    const pStart = polarPoint(CYCLE_CENTER, CYCLE_CENTER, 168, angleDeg);
    const pEnd   = polarPoint(CYCLE_CENTER, CYCLE_CENTER, 176, angleDeg);
    return (
      <Line
        key={key}
        x1={pStart.x}
        y1={pStart.y}
        x2={pEnd.x}
        y2={pEnd.y}
        stroke={color}
        strokeWidth={1.5}
      />
    );
  }

  const centerSize = CIRCULAR_TRACKER_SIZE * 0.48;

  return (
    <View style={[
      styles.cycleWheelCard,
      {
        backgroundColor: isDark ? colors.background : "#FFFFFF",
        borderColor: isDark ? "transparent" : "#EAEAEA",
        borderWidth: isDark ? 0 : 1,
        shadowColor: isDark ? "#140E16" : "#2E2330",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 28,
        elevation: 6,
      },
    ]}>
      <Svg
        width={CIRCULAR_TRACKER_SIZE}
        height={CIRCULAR_TRACKER_SIZE}
        viewBox={`0 0 ${CYCLE_VIEWBOX} ${CYCLE_VIEWBOX}`}
      >
        <Defs>
          <Path id="menstruationPath" d={menTextD} fill="none" />
          <Path id="fertilePath"     d={ferTextD} fill="none" />
          <Path id="lutealPath"      d={lutTextD} fill="none" />
        </Defs>

        {/* Render 28 segmented blocks */}
        {Array.from({ length: 28 }, (_, index) => {
          const day = index + 1;
          const isSelected = day === selectedDay;
          const seg = getSegmentColor(day);

          // Skip normal arc render for Day 14 (will render circle below)
          if (day === 14) return null;

          // Trigonometry starts exactly at 12 o'clock (270)
          let startDeg = 270 + index * SEGMENT_ANGLE + 0.7;
          let endDeg = 270 + (index + 1) * SEGMENT_ANGLE - 0.7;

          // Custom-molded physical socket recess around Day 14 circle
          if (day === 13) {
            endDeg = 270 + 13 * SEGMENT_ANGLE - OVULATION_SOCKET_GAP_DEG;
          } else if (day === 15) {
            startDeg = 270 + 14 * SEGMENT_ANGLE + OVULATION_SOCKET_GAP_DEG;
          }

          // Dynamically centered label point inside shortened or standard segments
          const midAngle = (startDeg + endDeg) / 2;

          // Selected block pop-out radius
          const outerR = isSelected ? CYCLE_OUTER_R + 6 : CYCLE_OUTER_R;
          const innerR = isSelected ? CYCLE_INNER_R - 2 : CYCLE_INNER_R;

          const labelPoint = polarPoint(CYCLE_CENTER, CYCLE_CENTER, 133, midAngle);

          return (
            <G key={day}>
              {/* Selected state soft visual drop-glow in active color */}
              {isSelected && (
                <Path
                  d={describeDonutSegment(startDeg - 0.2, endDeg + 0.2, outerR + 4, innerR - 2)}
                  fill={activeColor}
                  opacity={0.02}
                />
              )}

              {/* Main segment path */}
              <Path
                d={describeDonutSegment(startDeg, endDeg, outerR, innerR)}
                fill={seg.fill}
                stroke={isSelected ? activeColor : (isDark ? colors.background : "#FFFFFF")}
                strokeWidth={isSelected ? 2 : 1.5}
                onPress={() => selectDay(day)}
              />

              {/* Day number inside the segment */}
              <SvgText
                x={labelPoint.x}
                y={labelPoint.y + 4.5}
                fill={seg.text}
                fontSize={isSelected ? 14 : 12}
                fontWeight={isSelected ? "900" : "700"}
                fontFamily={F.uiLabel}
                textAnchor="middle"
                onPress={() => selectDay(day)}
              >
                {day}
              </SvgText>

              {/* Generous touch target overlay capturing all taps */}
              <Path
                d={describeDonutSegment(startDeg - 0.7, endDeg + 0.7, outerR + 15, innerR - 15)}
                fill="rgba(0,0,0,0)"
                onPress={() => selectDay(day)}
              />
            </G>
          );
        })}

        {/* Day 14 Ovulation Popped-Out Circle */}
        <G>
          {selectedDay === 14 && (
            <Circle
              cx={d14X}
              cy={d14Y}
              r={32}
              fill={d14Color}
              opacity={0.02}
            />
          )}
          <Circle
            cx={d14X}
            cy={d14Y}
            r={26}
            fill={d14Color}
            onPress={() => selectDay(14)}
          />
          <SvgText
            x={d14X}
            y={d14Y + 5.5}
            fill={isDark ? colors.background : "#FFFFFF"}
            fontSize={15}
            fontWeight="900"
            fontFamily={F.uiLabel}
            textAnchor="middle"
            onPress={() => selectDay(14)}
          >
            14
          </SvgText>
          {/* Expanded transparent hit target for Day 14 */}
          <Circle
            cx={d14X}
            cy={d14Y}
            r={42}
            fill="rgba(0,0,0,0)"
            onPress={() => selectDay(14)}
          />
        </G>

        {/* Ovulation Constant Flower and Label */}
        <G>
          <G transform={`translate(${CYCLE_CENTER + OVULATION_MARKER_R * Math.cos(toRad(d14Angle))}, ${CYCLE_CENTER + OVULATION_MARKER_R * Math.sin(toRad(d14Angle))})`}>
            {/* 5 petals */}
            <Circle cx={0} cy={-5} r={4.5} fill={d14Color} />
            <Circle cx={4.75} cy={-1.5} r={4.5} fill={d14Color} />
            <Circle cx={2.9} cy={4} r={4.5} fill={d14Color} />
            <Circle cx={-2.9} cy={4} r={4.5} fill={d14Color} />
            <Circle cx={-4.75} cy={-1.5} r={4.5} fill={d14Color} />
            {/* yellow center */}
            <Circle cx={0} cy={0} r={3} fill="#E8D28A" />
          </G>
          <SvgText
            x={CYCLE_CENTER + OVULATION_LABEL_R * Math.cos(toRad(d14Angle))}
            y={CYCLE_CENTER + OVULATION_LABEL_R * Math.sin(toRad(d14Angle)) + 4}
            fill={colors.textMuted}
            fontSize={10.5}
            fontWeight="800"
            letterSpacing={3.5}
            fontFamily={F.uiLabel}
            textAnchor="middle"
          >
            OVULATION
          </SvgText>
        </G>

        {/* Bracket indicators and curved texts */}
        {/* MENSTRUATION */}
        <Path d={menLineD} stroke={isDark ? colors.textMuted : menColor} strokeWidth={1.2} fill="none" opacity={0.6} />
        {renderTickLine(270, "men-start", isDark ? colors.textMuted : menColor)}
        {renderTickLine(334.2857, "men-end", isDark ? colors.textMuted : menColor)}
        <SvgText fill={colors.textMuted} fontSize="11" fontWeight="700" letterSpacing={3} fontFamily={F.uiLabel}>
          <TextPath href="#menstruationPath" xlinkHref="#menstruationPath" startOffset="50%" textAnchor="middle">
            MENSTRUATION
          </TextPath>
        </SvgText>

        {/* FERTILE WINDOW */}
        <Path d={ferLineD} stroke={colors.textMuted} strokeWidth={1.2} fill="none" opacity={0.6} />
        {renderTickLine(0, "fer-start", colors.textMuted)}
        {renderTickLine(77.1428, "fer-end", colors.textMuted)}
        <SvgText fill={colors.textMuted} fontSize="11" fontWeight="700" letterSpacing={3} fontFamily={F.uiLabel}>
          <TextPath href="#fertilePath" xlinkHref="#fertilePath" startOffset="50%" textAnchor="middle">
            FERTILE WINDOW
          </TextPath>
        </SvgText>

        {/* LUTEAL PHASE */}
        <Path d={lutLineD} stroke={isDark ? colors.textMuted : lutColor} strokeWidth={1.2} fill="none" opacity={0.6} />
        {renderTickLine(90, "lut-start", isDark ? colors.textMuted : lutColor)}
        {renderTickLine(270, "lut-end", isDark ? colors.textMuted : lutColor)}
        <SvgText fill={colors.textMuted} fontSize="11" fontWeight="700" letterSpacing={3} fontFamily={F.uiLabel}>
          <TextPath href="#lutealPath" xlinkHref="#lutealPath" startOffset="50%" textAnchor="middle">
            LUTEAL PHASE
          </TextPath>
        </SvgText>
      </Svg>

      {/* Center info panel — Dynamic content designed for high contrast readability against light/dark surface */}
      <Animated.View style={[
        styles.cycleWheelCenter,
        {
          width: centerSize,
          height: centerSize,
          borderRadius: centerSize / 2,
          marginLeft: -centerSize / 2,
          marginTop: -centerSize / 2,
          opacity: fade,
          backgroundColor: isDark ? colors.background : "#FFFFFF",
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
          borderWidth: 1,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.25 : 0.08,
          shadowRadius: 18,
          elevation: 6,
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
        }
      ]}>
        <Text style={{ fontFamily: F.uiBold, fontSize: 10, letterSpacing: 2, color: isDark ? "#A0A0B0" : "#8A8A8A", marginBottom: 4 }}>DAY OF CYCLE</Text>
        <Text style={{ fontFamily: F.display, fontSize: 80, lineHeight: 88, fontWeight: "800", color: colors.textPrimary }}>
          {selectedDay}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", width: "70%", marginVertical: 8 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }} />
          <Text style={{ marginHorizontal: 8, fontSize: 16, color: colors.primaryCTA, fontWeight: "700" }}>♡</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }} />
        </View>
        <Text style={[styles.cycleWheelPhase, { color: isDark ? colors.textPrimary : "#2E2330", fontFamily: F.uiBold, fontSize: 15, lineHeight: 18, marginBottom: 4 }]}>{selected.phase}</Text>
        <Text style={[styles.cycleWheelMessage, { color: isDark ? colors.textMuted : "#7E7E8E", fontFamily: F.uiRegular, fontSize: 11, lineHeight: 15 }]}>{selected.message}</Text>
      </Animated.View>
    </View>
  );
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
  visible:   boolean;
  onClose:   () => void;
  dateKey:   string;
  dateLabel: string;
  meta:      ReturnType<typeof calendarMeta> | null;
  log:       DailyLogPayload | undefined;
}) {
  const { colors, isDark } = useColorMode();

  const scrimAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(H)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scrimAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 20, useNativeDriver: true }),
      ]).start();
    } else {
      scrimAnim.setValue(0);
      slideAnim.setValue(H);
    }
  }, [visible]);

  function handleClose() {
    Animated.parallel([
      Animated.timing(scrimAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: H, duration: 240, useNativeDriver: true }),
    ]).start(() => onClose());
  }

  if (!visible) return null;

  const hasLog = !!log;

  const phaseLabel =
    meta?.isLoggedPeriod  ? "Period (logged)"    :
    meta?.isExpectedPeriod? "Period (predicted)" :
    meta?.isOvulation     ? "Ovulation day"      :
    meta?.isFertile       ? "Fertile window"     :
    "Cycle day";

  // ── BIOLOGICAL popup phase colors ────────────────────────────────────────
  const phaseColor =
    meta?.isLoggedPeriod  ? BIO.period    :
    meta?.isExpectedPeriod? BIO.period    :
    meta?.isOvulation     ? (isDark ? "#7EC8A0" : "#2D8A5E") :
    meta?.isFertile       ? BIO.fertile   :
    colors.textMuted;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.popupScrim, { opacity: scrimAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View
          style={[
            styles.popupSheet,
            {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              transform:       [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.popupHandle} />

          <View style={styles.popupHeaderRow}>
            <View>
              <Text style={[styles.popupDate, { color: colors.textPrimary }]}>{dateLabel}</Text>
              <View style={[styles.popupPhasePill, { backgroundColor: `${phaseColor}18` }]}>
                <View style={[styles.popupPhaseDot, { backgroundColor: phaseColor }]} />
                <Text style={[styles.popupPhaseText, { color: colors.textPrimary }]}>{phaseLabel}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleClose}
              style={[styles.popupCloseBtn, { backgroundColor: `${colors.surfaceRaised}B8` }]}
              hitSlop={10}
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          {hasLog ? (
            <View style={styles.popupContent}>
              {log!.mood && (
                <View style={[styles.popupRow, { borderBottomColor: `${colors.border}30` }]}>
                  <MaterialCommunityIcons name="emoticon-outline" size={18} color={colors.textMuted} />
                  <Text style={[styles.popupRowLabel, { color: colors.textMuted }]}>Mood</Text>
                  <Text style={[styles.popupRowValue, { color: colors.textPrimary }]}>
                    {log!.mood.charAt(0).toUpperCase() + log!.mood.slice(1)}
                  </Text>
                </View>
              )}
              {log!.flow && (
                <View style={[styles.popupRow, { borderBottomColor: `${colors.border}30` }]}>
                  <MaterialCommunityIcons name="water-outline" size={18} color={BIO.period} />
                  <Text style={[styles.popupRowLabel, { color: colors.textMuted }]}>Flow</Text>
                  <Text style={[styles.popupRowValue, { color: colors.textPrimary }]}>
                    {log!.flow.charAt(0).toUpperCase() + log!.flow.slice(1)}
                  </Text>
                </View>
              )}
              <View style={[styles.popupRow, { borderBottomColor: `${colors.border}30` }]}>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.warning} />
                <Text style={[styles.popupRowLabel, { color: colors.textMuted }]}>Energy</Text>
                <Text style={[styles.popupRowValue, { color: colors.textPrimary }]}>{log!.energyLevel}%</Text>
              </View>
              <View style={[styles.popupRow, { borderBottomColor: `${colors.border}30` }]}>
                <MaterialCommunityIcons name="heart-pulse" size={18} color={colors.primaryCTA} />
                <Text style={[styles.popupRowLabel, { color: colors.textMuted }]}>Stress</Text>
                <Text style={[styles.popupRowValue, { color: colors.textPrimary }]}>{log!.stressLevel}%</Text>
              </View>
              {log!.symptoms.length > 0 && (
                <View style={[styles.popupRow, { borderBottomColor: `${colors.border}30` }]}>
                  <MaterialCommunityIcons name="pill" size={18} color={colors.textMuted} />
                  <Text style={[styles.popupRowLabel, { color: colors.textMuted }]}>Symptoms</Text>
                  <Text
                    style={[styles.popupRowValue, { flex: 1, textAlign: "right", color: colors.textPrimary }]}
                    numberOfLines={2}
                  >
                    {log!.symptoms.map((s) => s.replace(/_/g, " ")).join(", ")}
                  </Text>
                </View>
              )}
              {log!.journalEntry ? (
                <View style={[styles.popupJournalWrap, { backgroundColor: `${colors.surfaceRaised}D0` }]}>
                  <MaterialCommunityIcons name="note-text-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.popupJournalText, { color: colors.textMuted }]} numberOfLines={4}>
                    {log!.journalEntry}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.popupEmptyWrap}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={40} color={`${colors.textMuted}88`} />
              <Text style={[styles.popupEmptyTitle, { color: colors.textPrimary }]}>No data logged</Text>
              <Text style={[styles.popupEmptyMsg,   { color: colors.textMuted   }]}>
                Nothing was recorded for this day.
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── Graph width ───────────────────────────────────────────────────────────────
const GRAPH_W  = W - 64;
const GRAPH_H  = 90;
const TODAY_X  = ((CURRENT_DAY - 1) / (CYCLE_LENGTH - 1)) * GRAPH_W;

type YogaPose = { name: string; desc: string };
type PranayamaItem = { name: string; desc: string };
type RoutineDetail = {
  title: string;
  duration: string;
  level: string;
  why: string;
  benefits: string[];
  poses: YogaPose[];
  pranayama: PranayamaItem[];
  bloopMsg: string;
};

function getRoutineForDay(day: number): RoutineDetail {
  if (day >= 1 && day <= 5) {
    return {
      title: "Menstrual Care Yoga",
      duration: "15 min",
      level: "Gentle",
      why: "During bleeding, energy is naturally low and the body requires quiet, restorative movements. Pelvic muscles are contracting, and slow stretching helps ease cramp-related spasms.",
      benefits: [
        "Relaxes the lower back, hips, and deep pelvic musculature",
        "Calms the sympathetic nervous system, shifting attention away from pain",
        "Supports energy conservation and gentle circulation"
      ],
      poses: [
        { name: "Supta Baddha Konasana", desc: "Reclined Butterfly relaxes pelvic walls and relieves cramping tension." },
        { name: "Balasana", desc: "Child's Pose gently stretches the lower spine and helps release physical exhaustion." },
        { name: "Pavanmuktasana", desc: "Knees-to-Chest Pose provides soft compression to relieve pelvic/abdominal bloating." }
      ],
      pranayama: [
        { name: "Deep Belly Breathing", desc: "Slow, abdominal breathing to soothe pain signaling in the nervous system." },
        { name: "Chandrabhedan Pranayama", desc: "Cooling breath technique to deeply relax the body on crampy days." }
      ],
      bloopMsg: "I'd like to do the Menstrual Care Yoga sequence. Can you guide me through Supta Baddha Konasana, Balasana, and Chandrabhedan Pranayama?"
    };
  } else if (day >= 6 && day <= 13) {
    return {
      title: "Follicular Rise Yoga",
      duration: "18 min",
      level: "Energising",
      why: "As estrogen levels rise, physical energy and motivation build. This is the optimal window to introduce spinal mobility and chest opening to boost overall energy and mood.",
      benefits: [
        "Opens the chest, heart space, and shoulder girdles",
        "Strengthens the core and pelvic floor during recovery-to-rise",
        "Improves joint lubrication and circulation"
      ],
      poses: [
        { name: "Marjariasana-Bitilasana", desc: "Cat-Cow flows to warm up the entire spine and pelvic region." },
        { name: "Bhujangasana", desc: "Cobra Pose opens the chest, boosting energy levels and rising estrogen response." },
        { name: "Virabhadrasana II", desc: "Warrior II builds leg strength and boosts somatic focus." }
      ],
      pranayama: [
        { name: "Nadi Shodhana", desc: "Alternate nostril breathing to balance hormones and improve mental clarity." },
        { name: "Bhramari", desc: "Humming bee breath to reduce residual stress and sharpen creativity." }
      ],
      bloopMsg: "I'd like to do the Follicular Rise Yoga sequence. Can you guide me through Cat-Cow, Cobra Pose, and Nadi Shodhana?"
    };
  } else if (day >= 14 && day <= 16) {
    return {
      title: "Ovulatory Vitality Yoga",
      duration: "20 min",
      level: "Expansive",
      why: "Estrogen and testosterone peak now, providing peak endurance and openness. Strong heart openers and balance poses complement this highly communicative and vibrant phase.",
      benefits: [
        "Deeply opens the anterior chain, heart, and chest",
        "Improves core stability and balance",
        "Channels maximum hormonal energy into mental expansion"
      ],
      poses: [
        { name: "Ustrasana", desc: "Camel Pose is a deep backbend that releases emotional blocks and channels peak energy." },
        { name: "Trikonasana", desc: "Triangle Pose improves pelvic blood supply and builds lower body confidence." },
        { name: "Adho Mukha Svanasana", desc: "Downward Dog inversion to reverse blood flow and boost brain oxygenation." }
      ],
      pranayama: [
        { name: "Kapalabhati", desc: "Shining skull breath to purify pathways and generate warmth." },
        { name: "Sitali Pranayama", desc: "Cooling breath to control excess ovulatory heat and maintain calm." }
      ],
      bloopMsg: "I'd like to do the Ovulatory Vitality Yoga sequence. Can you guide me through Ustrasana, Triangle Pose, and Kapalabhati breathing?"
    };
  } else {
    return {
      title: "Luteal Calming Yoga",
      duration: "15 min",
      level: "Calming",
      why: "Progesterone dominates this phase, preparing the body to rest and calm. Cooling inversions and restorative bridge poses relieve pre-menstrual water retention and mood fluctuations.",
      benefits: [
        "Reduces pelvic congestion, bloating, and pre-menstrual water retention",
        "Soothes pre-menstrual anxiety, irritability, and mood fluctuations",
        "Relieves leg fatigue and supports venous drainage"
      ],
      poses: [
        { name: "Setu Bandhasana", desc: "Bridge Pose opens the hip flexors and gently massages abdominal organs to reduce bloating." },
        { name: "Viparita Karani", desc: "Legs-Up-The-Wall Pose improves venous return to combat fluid retention and fatigue." },
        { name: "Uttanasana", desc: "Standing Forward Fold acts as a cooling inversion that calms high thought traffic." }
      ],
      pranayama: [
        { name: "Bhramari Pranayama", desc: "Humming bee breath to instantly calm pre-menstrual irritability and anger." },
        { name: "Nadi Shodhana", desc: "Alternate nostril breathing to restore emotional balance during hormonal drops." }
      ],
      bloopMsg: "I'd like to do the Luteal Calming Yoga sequence. Can you guide me through Bridge Pose, Legs-Up-The-Wall, and Bhramari Pranayama?"
    };
  }
}

const ROUTINE = getRoutineForDay(CURRENT_DAY);

// ─────────────────────────────────────────────────────────────────────────────
export default function CycleScreen() {
  const router = useRouter();
  const { colors, isDark } = useColorMode();

  // ── Metric cards — inside component; need live colors ─────────────────────
  const METRICS = [
    { key: "mood",   label: "Mood",   value: "Calm",  pct: 0.72, icon: "emoticon-happy-outline" as const, color: colors.textMuted, bg: `${colors.textMuted}1E` },
    { key: "energy", label: "Energy", value: "High",  pct: 0.80, icon: "lightning-bolt"          as const, color: colors.warning,   bg: `${colors.warning}1E`   },
    { key: "sleep",  label: "Sleep",  value: "Good",  pct: 0.65, icon: "moon-waning-crescent"    as const, color: colors.textMuted, bg: `${colors.textMuted}1E` },
    { key: "flow",   label: "Flow",   value: "Light", pct: 0.30, icon: "water-outline"           as const, color: BIO.period,       bg: BIO.periodBg            },
  ];

  // ── Quick log actions — inside component; need live colors ────────────────
  const LOG_ACTIONS = [
    { key: "mood",    label: "Mood",    icon: "emoticon-outline" as const,  color: colors.textMuted },
    { key: "flow",    label: "Flow",    icon: "water-outline"    as const,  color: BIO.period        },
    { key: "symptom", label: "Symptom", icon: "pill"             as const,  color: colors.warning    },
    { key: "sleep",   label: "Sleep",   icon: "sleep"            as const,  color: colors.textMuted  },
    { key: "note",    label: "Note",    icon: "pencil-outline"   as const,  color: colors.primaryCTA },
  ];

  const [selectedDay, setSelectedDay] = useState(CURRENT_DAY);
  const [activeGraph,  setActiveGraph]  = useState<"all" | "estrogen" | "progesterone" | "lh">("all");
  const [logSheetOpen, setLogSheetOpen] = useState(false);

  const storeLogs     = useDailyLogStore((s) => s.logs);
  const getLogForDate = useDailyLogStore((s) => s.getLogForDate);
  const loggedDates   = new Set(Object.keys(storeLogs));

  const [popupVisible,   setPopupVisible]   = useState(false);
  const [popupDateKey,   setPopupDateKey]   = useState("");
  const [popupDateLabel, setPopupDateLabel] = useState("");
  const [popupMeta, setPopupMeta] = useState<ReturnType<typeof calendarMeta> | null>(null);

  function handleDayPress(dateKey: string, meta: ReturnType<typeof calendarMeta>, monthIndex: number, day: number) {
    const m = CALENDAR_MONTHS[monthIndex];
    setPopupDateKey(dateKey);
    setPopupDateLabel(`${m.name} ${day}, ${m.year}`);
    setPopupMeta(meta);
    setPopupVisible(true);
  }

  const [routineOpen,    setRoutineOpen]    = useState(false);
  const [routinePlaying, setRoutinePlaying] = useState(false);
  const routineAnim = useRef(new Animated.Value(0)).current;

  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarAnim  = useRef(new Animated.Value(0)).current;

  const routineSlide   = routineAnim.interpolate({ inputRange: [0, 1], outputRange: [580, 0] });
  const routineOverlay = routineAnim.interpolate({ inputRange: [0, 1], outputRange: [0,   1] });
  const calendarSlide   = calendarAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  const calendarOverlay = calendarAnim.interpolate({ inputRange: [0, 1], outputRange: [0,   1] });

  function askBloop(message: string) {
    openBloopWithContext(router, message, "Cycle");
  }

  function openRoutine() {
    setRoutineOpen(true);
    Animated.timing(routineAnim, {
      toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
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
    Animated.timing(calendarAnim, {
      toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
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
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* ── Background ────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={[colors.background, colors.background, colors.background]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, { top: -60,  left: -60,   backgroundColor: `${BIO.period}05`,      width: 200, height: 200 }]} />
      <View style={[styles.blob, { top: 200,  right: -80,  backgroundColor: `${BIO.period}05`,      width: 240, height: 240 }]} />
      <View style={[styles.blob, { bottom: 120, left: -40, backgroundColor: `${colors.primaryCTA}05`, width: 220, height: 220 }]} />

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
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Your Cycle</Text>
            <View style={styles.headerSubRow}>
              <View style={[styles.headerDot, { backgroundColor: colors.primaryCTA }]} />
              <Text style={[styles.headerSub, { color: colors.textMuted }]}>
                Day {CURRENT_DAY} · Follicular Phase
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push("/notifications" as any)}
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textPrimary} />
              <View style={[styles.bellBadge, { backgroundColor: colors.primaryCTA, borderColor: colors.background }]} />
            </Pressable>
            <Pressable
              style={[styles.logBtn, { backgroundColor: colors.primaryCTA, shadowColor: colors.primaryCTA }]}
              onPress={() => setLogSheetOpen(true)}
            >
              <MaterialCommunityIcons name="plus" size={16} color={colors.background} />
              <Text style={[styles.logBtnText, { color: colors.background }]}>Log today</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Cycle Wheel Hero ─────────────────────────────────────────────── */}
        <InteractiveCycleWheel selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

        {/* ── Hormone Graph ────────────────────────────────────────────────── */}
        <View style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor:     colors.border,
          shadowColor:     colors.background,
        }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Hormone Rhythm</Text>
              <Text style={[styles.cardSub,   { color: colors.textMuted   }]}>Cycle days 1–{CYCLE_LENGTH}</Text>
            </View>
            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={GRAPH_COLORS.estrogen} />
          </View>

          {/* Graph toggle chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.graphChips}>
            {[
              { key: "all",          label: "All",          color: colors.textMuted       },
              { key: "estrogen",     label: "Estrogen",     color: GRAPH_COLORS.estrogen     },
              { key: "progesterone", label: "Progesterone", color: GRAPH_COLORS.progesterone },
              { key: "lh",           label: "LH",           color: GRAPH_COLORS.lh           },
            ].map((chip) => (
              <Pressable
                key={chip.key}
                onPress={() => setActiveGraph(chip.key as typeof activeGraph)}
                style={[
                  styles.graphChip,
                  { borderColor: colors.border },
                  activeGraph === chip.key && { backgroundColor: chip.color, borderColor: chip.color },
                ]}
              >
                <Text style={[
                  styles.graphChipText,
                  { color: colors.textMuted },
                  activeGraph === chip.key && { color: colors.background },
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
                  <Stop offset="0" stopColor={GRAPH_COLORS.estrogen}     stopOpacity="0.25" />
                  <Stop offset="1" stopColor={GRAPH_COLORS.estrogen}     stopOpacity="0"   />
                </SvgGradient>
                <SvgGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={GRAPH_COLORS.progesterone} stopOpacity="0.20" />
                  <Stop offset="1" stopColor={GRAPH_COLORS.progesterone} stopOpacity="0"   />
                </SvgGradient>
                <SvgGradient id="gLh" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={GRAPH_COLORS.lh}           stopOpacity="0.20" />
                  <Stop offset="1" stopColor={GRAPH_COLORS.lh}           stopOpacity="0"   />
                </SvgGradient>
              </Defs>

              {(activeGraph === "all" || activeGraph === "estrogen") && (
                <Path
                  d={buildPath(ESTROGEN_DATA, GRAPH_W, GRAPH_H)}
                  stroke={GRAPH_COLORS.estrogen}
                  strokeWidth={2} fill="none"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              )}
              {(activeGraph === "all" || activeGraph === "progesterone") && (
                <Path
                  d={buildPath(PROGESTERONE_DATA, GRAPH_W, GRAPH_H)}
                  stroke={GRAPH_COLORS.progesterone}
                  strokeWidth={2} fill="none"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              )}
              {(activeGraph === "all" || activeGraph === "lh") && (
                <Path
                  d={buildPath(LH_DATA, GRAPH_W, GRAPH_H)}
                  stroke={GRAPH_COLORS.lh}
                  strokeWidth={2} fill="none"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              )}

              {/* Today marker */}
              <Line
                x1={TODAY_X} y1={0} x2={TODAY_X} y2={GRAPH_H}
                stroke={colors.primaryCTA}
                strokeWidth={1.5} strokeDasharray="4,3" strokeLinecap="round"
              />
              <Circle cx={TODAY_X} cy={4} r={4} fill={colors.primaryCTA} />
            </Svg>

            {/* X-axis labels */}
            <View style={styles.graphXAxis}>
              {[1, 7, 14, 21, 28].map((d) => (
                <Text key={d} style={[
                  styles.graphXLabel,
                  { color: colors.textMuted },
                  d === CURRENT_DAY && { color: colors.primaryCTA, fontFamily: F.uiBold },
                ]}>
                  {d === CURRENT_DAY ? `Day ${d}` : d}
                </Text>
              ))}
            </View>
          </View>

          {/* Graph legend — labels use textPrimary per directive */}
          <View style={styles.graphLegendRow}>
            {[
              { label: "Estrogen",     color: GRAPH_COLORS.estrogen     },
              { label: "Progesterone", color: GRAPH_COLORS.progesterone },
              { label: "LH",           color: GRAPH_COLORS.lh           },
            ].map((l) => (
              <View key={l.label} style={styles.graphLegendItem}>
                <View style={[styles.graphLegendLine, { backgroundColor: l.color }]} />
                <Text style={[styles.graphLegendLabel, { color: colors.textPrimary }]}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Metric Cards Grid ────────────────────────────────────────────── */}
        <View style={styles.metricsGrid}>
          {METRICS.map((m) => (
            <View key={m.key} style={[styles.metricCard, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              shadowColor:     colors.background,
            }]}>
              <View style={[styles.metricIconBubble, { backgroundColor: m.bg }]}>
                <MaterialCommunityIcons name={m.icon} size={18} color={m.color} />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{m.label}</Text>
              <Text style={[styles.metricValue,  { color: m.color           }]}>{m.value}</Text>
              <View style={[styles.metricBarTrack, { backgroundColor: `${colors.border}77` }]}>
                <View style={[styles.metricBarFill, { width: `${m.pct * 100}%` as any, backgroundColor: m.color }]} />
              </View>
            </View>
          ))}
        </View>

        {/* ── AI Insight Card ──────────────────────────────────────────────── */}
        <LinearGradient
          colors={[`${colors.primaryCTA}1E`, `${colors.primaryCTA}0D`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.insightCard, { borderColor: `${colors.primaryCTA}33` }]}
        >
          <View style={styles.insightLeft}>
            <View style={styles.insightIconRow}>
              <MaterialCommunityIcons name="molecule-co2" size={14} color={colors.primaryCTA} />
              <Text style={[styles.insightTag, { color: colors.primaryCTA }]}>Cycle Insight</Text>
            </View>
            <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>
              Peak fertility window approaching
            </Text>
            <Text style={[styles.insightBody, { color: colors.textMuted }]}>
              Estrogen is rising steadily. Your body is priming for ovulation around Day {OVULATION_DAY}.
              Energy and libido often peak now — a great time for strength training.
            </Text>
            <Pressable
              style={styles.insightCta}
              onPress={() => askBloop("Explain my fertility window and energy pattern.")}
            >
              <Text style={[styles.insightCtaText, { color: colors.primaryCTA }]}>View full insight</Text>
              <MaterialCommunityIcons name="arrow-right" size={13} color={colors.primaryCTA} />
            </Pressable>
          </View>
          {/* ⚠️  CachedImage — no tintColor, no colorFilter, no overlay */}
          <View style={styles.insightImageWrap}>
            <CachedImage source={imgBloop} style={styles.insightImage} contentFit="contain" />
            <View style={[styles.insightGlow, { backgroundColor: `${colors.primaryCTA}2E` }]} />
          </View>
        </LinearGradient>

        {/* ── Wellness Recommendation ──────────────────────────────────────── */}
        <View style={styles.wellnessCard}>
          {/* ⚠️  CachedImage — no tintColor, no colorFilter, no overlay */}
          <CachedImage source={imgPetals} style={styles.wellnessImage} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(28,21,40,0.72)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.wellnessContent}>
            <View style={styles.wellnessTag}>
              <MaterialCommunityIcons name="yoga" size={12} color="#FFFFFF" />
              <Text style={styles.wellnessTagText}>Recommended for Day {CURRENT_DAY}</Text>
            </View>
            <Text style={styles.wellnessTitle}>Follicular Yoga Flow</Text>
            <Text style={styles.wellnessSub}>18 min · Energising · All levels</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open follicular yoga routine"
            style={[styles.playBtn, { shadowColor: colors.warning }]}
            onPress={openRoutine}
          >
            <LinearGradient
              colors={[colors.warning, colors.primaryCTA]}
              style={styles.playBtnInner}
            >
              <MaterialCommunityIcons name="play" size={20} color={colors.background} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── Cycle Calendar Strip ─────────────────────────────────────────── */}
        <View style={[styles.calendarCard, {
          backgroundColor: colors.surface,
          borderColor:     colors.border,
          shadowColor:     colors.primaryCTA,
        }]}>
          <View style={styles.cardHeader}>
            <View style={styles.calendarHeaderCopy}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Period calendar</Text>
              <Text style={[styles.cardSub,   { color: colors.textMuted   }]}>
                Track logged days and expected period dates.
              </Text>
            </View>
            <Pressable
              style={[styles.seeAllBtn, { backgroundColor: `${colors.primaryCTA}1A` }]}
              onPress={openCalendar}
            >
              <Text style={[styles.seeAllText, { color: colors.primaryCTA }]}>See calendar</Text>
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
                parentSelectedDay={selectedDay}
                onDayPress={(dk, meta) => {
                  setSelectedDay(meta.cycleDay);
                  handleDayPress(dk, meta, index, parseInt(dk.split("-")[2], 10));
                }}
              />
            ))}
          </ScrollView>
          <View style={styles.periodSummaryRow}>
            <View style={[styles.periodSummaryItem, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              flexDirection:   "row",
              alignItems:      "center",
              gap:             12,
              paddingVertical: 10,
              paddingHorizontal: 12,
              shadowColor: isDark ? "#140E16" : "#2E2330",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.2 : 0.04,
              shadowRadius: 8,
              elevation: 2,
            }]}>
              {/* Pill indicator matching light pink style used in the calendar */}
              <View style={{
                width: 24,
                height: 12,
                borderRadius: 6,
                backgroundColor: isDark ? 'rgba(232, 128, 144, 0.32)' : 'rgba(232, 128, 144, 0.22)',
              }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.periodSummaryValue, { color: colors.textPrimary }]}>May 1-5</Text>
                <Text style={[styles.periodSummaryLabel, { color: colors.textMuted }]}>Logged period</Text>
              </View>
            </View>
            <View style={[styles.periodSummaryItem, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              flexDirection:   "row",
              alignItems:      "center",
              gap:             12,
              paddingVertical: 10,
              paddingHorizontal: 12,
              shadowColor: isDark ? "#140E16" : "#2E2330",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.2 : 0.04,
              shadowRadius: 8,
              elevation: 2,
            }]}>
              {/* Dashed pill indicator matching dark pink dotted outline style */}
              <View style={{
                width: 24,
                height: 12,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: isDark ? '#E88090' : '#C44E68',
                borderStyle: 'dashed',
                backgroundColor: 'transparent',
              }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.periodSummaryValue, { color: colors.textPrimary }]}>May 29-Jun 2</Text>
                <Text style={[styles.periodSummaryLabel, { color: colors.textMuted }]}>Expected dates</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Quick Log Bar ────────────────────────────────────────────────── */}
        <View style={styles.quickLogInline}>
          <Text style={[styles.quickLogTitle, { color: colors.textPrimary }]}>Log what changed today</Text>
          <LinearGradient
            colors={[`${colors.surface}DC`, `${colors.surface}F0`]}
            style={[styles.quickLogBar, { borderColor: colors.border, shadowColor: colors.background }]}
          >
            {LOG_ACTIONS.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => setLogSheetOpen(true)}
                style={({ pressed }) => [styles.quickLogBtn, pressed && styles.pressed]}
              >
                <View style={[styles.quickLogIcon, { backgroundColor: `${action.color}1A` }]}>
                  <MaterialCommunityIcons name={action.icon} size={18} color={action.color} />
                </View>
                <Text style={[styles.quickLogLabel, { color: colors.textMuted }]}>{action.label}</Text>
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
            style={[
              styles.routineSheet,
              {
                backgroundColor: colors.surface,
                borderColor:     colors.border,
                transform:       [{ translateY: routineSlide }],
              },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: `${colors.textMuted}33` }]} />

            {/* Header */}
            <View style={styles.routineHeaderRow}>
              <View style={[styles.routineIconWrap, { backgroundColor: `${colors.primaryCTA}24` }]}>
                <MaterialCommunityIcons name="yoga" size={22} color={colors.primaryCTA} />
              </View>
              <View style={styles.routineHeaderText}>
                <Text style={[styles.routineTitle, { color: colors.textPrimary }]}>{ROUTINE.title}</Text>
                <Text style={[styles.routineMeta,  { color: colors.textMuted   }]}>
                  {ROUTINE.duration} · {ROUTINE.level} · Day {CURRENT_DAY}
                </Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Why now */}
              <View style={styles.routineSection}>
                <View style={styles.routineSectionHeader}>
                  <MaterialCommunityIcons name="information-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.routineSectionLabel, { color: colors.textMuted }]}>Why now</Text>
                </View>
                <Text style={[styles.routineSectionBody, { color: colors.textPrimary }]}>{ROUTINE.why}</Text>
              </View>

              {/* Benefits */}
              <View style={styles.routineSection}>
                <View style={styles.routineSectionHeader}>
                  <MaterialCommunityIcons name="sprout-outline" size={14} color={colors.primaryCTA} />
                  <Text style={[styles.routineSectionLabel, { color: colors.primaryCTA }]}>Benefits</Text>
                </View>
                {ROUTINE.benefits.map((b, i) => (
                  <View key={i} style={styles.routineBenefitRow}>
                    <View style={[styles.routineBenefitDot, { backgroundColor: colors.primaryCTA }]} />
                    <Text style={[styles.routineBenefitText, { color: colors.textPrimary }]}>{b}</Text>
                  </View>
                ))}
              </View>

              {/* Gentle Yoga Practices */}
              <View style={styles.routineSection}>
                <View style={styles.routineSectionHeader}>
                  <MaterialCommunityIcons name="yoga" size={14} color={colors.primaryCTA} />
                  <Text style={[styles.routineSectionLabel, { color: colors.primaryCTA }]}>Gentle Yoga Practices</Text>
                </View>
                {ROUTINE.poses.map((p, i) => (
                  <View key={i} style={styles.poseRow}>
                    <View style={[styles.poseNumberBox, { backgroundColor: `${colors.primaryCTA}1E` }]}>
                      <Text style={[styles.poseNumberText, { color: colors.primaryCTA }]}>{i + 1}</Text>
                    </View>
                    <View style={styles.poseInfo}>
                      <Text style={[styles.poseNameText, { color: colors.textPrimary }]}>{p.name}</Text>
                      <Text style={[styles.poseDescText, { color: colors.textMuted }]}>{p.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Pranayama (Breathwork) */}
              <View style={styles.routineSection}>
                <View style={styles.routineSectionHeader}>
                  <MaterialCommunityIcons name="weather-windy" size={14} color={colors.primaryCTA} />
                  <Text style={[styles.routineSectionLabel, { color: colors.primaryCTA }]}>Pranayama (Breathwork)</Text>
                </View>
                {ROUTINE.pranayama.map((p, i) => (
                  <View key={i} style={styles.poseRow}>
                    <View style={[styles.poseNumberBox, { backgroundColor: `${colors.warning}1E` }]}>
                      <Text style={[styles.poseNumberText, { color: colors.warning }]}>{i + 1}</Text>
                    </View>
                    <View style={styles.poseInfo}>
                      <Text style={[styles.poseNameText, { color: colors.textPrimary }]}>{p.name}</Text>
                      <Text style={[styles.poseDescText, { color: colors.textMuted }]}>{p.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Medical Disclaimer */}
              <View style={styles.disclaimerContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={12} color={`${colors.textMuted}99`} />
                <Text style={[styles.disclaimerText, { color: `${colors.textMuted}99` }]}>
                  Disclaimer: These practices are gentle wellness suggestions and should be adapted according to individual comfort, pain levels, medical conditions, pregnancy status, or doctor’s advice.
                </Text>
              </View>

              {/* Play preview button */}
              <Pressable
                style={[
                  styles.routinePlayRow,
                  {
                    backgroundColor: `${colors.warning}1A`,
                    borderColor:     `${colors.warning}38`,
                  },
                  routinePlaying && {
                    backgroundColor: `${colors.primaryCTA}1F`,
                    borderColor:     `${colors.primaryCTA}4C`,
                  },
                ]}
                onPress={() => setRoutinePlaying(p => !p)}
              >
                <View style={[
                  styles.routinePlayCircle,
                  {
                    backgroundColor: routinePlaying ? colors.primaryCTA : colors.warning,
                    shadowColor:     routinePlaying ? colors.primaryCTA : colors.warning,
                  },
                ]}>
                  <MaterialCommunityIcons
                    name={routinePlaying ? "pause" : "play"}
                    size={22}
                    color={colors.background}
                    style={{ marginLeft: routinePlaying ? 0 : 2 }}
                  />
                </View>
                <View style={styles.routinePlayInfo}>
                  <Text style={[styles.routinePlayTitle, { color: colors.textPrimary }]}>
                    {routinePlaying ? "Preview playing…" : "Play preview"}
                  </Text>
                  <Text style={[styles.routinePlaySub, { color: colors.textMuted }]}>
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
                          backgroundColor: colors.primaryCTA,
                        }]}
                      />
                    ))}
                  </View>
                )}
              </Pressable>

              {/* Preview coming-soon nudge */}
              {routinePlaying && (
                <Pressable
                  style={[styles.routinePreviewNote, { borderColor: `${colors.border}59` }]}
                  onPress={() => closeRoutine(ROUTINE.bloopMsg)}
                >
                  <MaterialCommunityIcons name="information-outline" size={13} color={colors.textMuted} />
                  <Text style={[styles.routinePreviewText, { color: colors.textMuted }]}>
                    Full routine coming soon —{" "}
                    <Text style={{ color: colors.primaryCTA, fontFamily: F.uiSemiBold }}>
                      Ask Bloop to guide you
                    </Text>
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={13} color={`${colors.textMuted}66`} />
                </Pressable>
              )}

              {/* Ask Bloop CTA */}
              <Pressable
                style={[styles.routineBloopBtn, { borderColor: `${colors.primaryCTA}40` }]}
                onPress={() => closeRoutine(ROUTINE.bloopMsg)}
              >
                <LinearGradient
                  colors={[`${colors.primaryCTA}24`, `${colors.primaryCTA}19`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <MaterialCommunityIcons name="chat-processing-outline" size={17} color={colors.primaryCTA} />
                <Text style={[styles.routineBloopText, { color: colors.primaryCTA }]}>
                  Ask Bloop to guide you through this
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primaryCTA} />
              </Pressable>

              <Pressable style={styles.sheetCloseBtn} onPress={() => closeRoutine()}>
                <Text style={[styles.sheetCloseText, { color: `${colors.textMuted}59` }]}>Close</Text>
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
            style={[
              styles.calendarSheet,
              {
                backgroundColor: colors.surface,
                borderColor:     colors.border,
                transform:       [{ translateY: calendarSlide }],
              },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: `${colors.textMuted}33` }]} />
            <View style={styles.calSheetHeaderRow}>
              <Text style={[styles.calSheetTitle, { color: colors.textPrimary }]}>Cycle Calendar</Text>
              <View style={[styles.calSheetBadge, { backgroundColor: `${colors.primaryCTA}1F` }]}>
                <Text style={[styles.calSheetBadgeText, { color: colors.primaryCTA }]}>
                  Day {selectedDay} / {CYCLE_LENGTH}
                </Text>
              </View>
            </View>
            <Text style={[styles.calSheetSub, { color: colors.textMuted }]}>
              May-June 2026 · scroll to compare logged and expected dates
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.calendarSheetScroll}>
              {CALENDAR_MONTHS.map((month, index) => (
                <MonthCalendar
                  key={`${month.name}-sheet`}
                  month={month}
                  monthIndex={index}
                  loggedDates={loggedDates}
                  parentSelectedDay={selectedDay}
                  onDayPress={(dk, meta) => {
                    setSelectedDay(meta.cycleDay);
                    handleDayPress(dk, meta, index, parseInt(dk.split("-")[2], 10));
                  }}
                />
              ))}

              <View style={[styles.periodDetailsCard, {
                backgroundColor: colors.surface,
                borderColor:     colors.border,
              }]}>
                <Text style={[styles.periodDetailsTitle, { color: colors.textPrimary }]}>
                  Period tracking details
                </Text>
                {[
                  { label: "Last period",    value: "May 1-5"       },
                  { label: "Expected period",value: "May 29-Jun 2"  },
                ].map((row) => (
                  <View key={row.label} style={[styles.periodDetailRow, {
                    borderBottomColor: `${colors.border}30`,
                  }]}>
                    <Text style={[styles.periodDetailLabel, { color: colors.textMuted   }]}>{row.label}</Text>
                    <Text style={[styles.periodDetailValue, { color: colors.textPrimary }]}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Ask Bloop CTA */}
              <Pressable
                style={[styles.calBloopBtn, { borderColor: `${colors.primaryCTA}40` }]}
                onPress={() => closeCalendar("Looking at my cycle calendar for May 2026, what should I be aware of in the next 7 days and how can I prepare?")}
              >
                <LinearGradient
                  colors={[`${colors.primaryCTA}24`, `${colors.primaryCTA}14`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <MaterialCommunityIcons name="chat-processing-outline" size={17} color={colors.primaryCTA} />
                <Text style={[styles.calBloopText, { color: colors.primaryCTA }]}>
                  Ask Bloop about the next 7 days
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primaryCTA} />
              </Pressable>

              <Pressable style={styles.sheetCloseBtn} onPress={() => closeCalendar()}>
                <Text style={[styles.sheetCloseText, { color: `${colors.textMuted}59` }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

// ── Styles — layout geometry only; all color values injected inline ───────────
const styles = StyleSheet.create({
  safe:       { flex: 1 },
  scrollView: { flex: 1, backgroundColor: "transparent" },
  scroll: {
    paddingHorizontal: 20,
    paddingTop:        8,
    paddingBottom:     28,
    flexGrow:          1,
  },
  blob: { borderRadius: 999, position: "absolute" },

  // Header
  header: {
    alignItems:      "center",
    flexDirection:   "row",
    justifyContent:  "space-between",
    marginBottom:    20,
    marginTop:       4,
  },
  headerLeft:    { flex: 1 },
  headerTitle:   { fontFamily: F.luxuryBold, fontSize: 26, lineHeight: 34, letterSpacing: 0.2 },
  headerSubRow:  { alignItems: "center", flexDirection: "row", gap: 5, marginTop: 2 },
  headerDot:     { borderRadius: 3, height: 6, width: 6 },
  headerSub:     { fontFamily: F.uiMedium, fontSize: 13 },
  headerActions: { alignItems: "center", flexDirection: "row", gap: 10 },

  iconBtn: {
    alignItems:     "center",
    borderRadius:   18,
    borderWidth:    1,
    height:         36,
    justifyContent: "center",
    width:          36,
  },
  bellBadge: {
    borderRadius: 4,
    borderWidth:  1.5,
    height:       8,
    position:     "absolute",
    right:        8,
    top:          7,
    width:        8,
  },
  logBtn: {
    alignItems:      "center",
    borderRadius:    18,
    flexDirection:   "row",
    gap:             4,
    paddingHorizontal: 14,
    paddingVertical:   8,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.28,
    shadowRadius:    8,
  },
  logBtnText: { fontFamily: F.uiBold, fontSize: 13 },

  // Cycle wheel card
  cycleWheelCard: {
    alignItems:   "center",
    alignSelf:    "center",
    borderRadius: 30,
    borderWidth:  1,
    justifyContent: "center",
    marginBottom: 18,
    minHeight:    CIRCULAR_TRACKER_SIZE + 4,
    overflow:     "hidden",
    paddingVertical: 2,
    position:     "relative",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.26,
    shadowRadius: 28,
    width:        "100%",
  },
  cycleWheelCenter: {
    alignItems:  "center",
    height:      CIRCULAR_TRACKER_SIZE * 0.39,
    justifyContent: "center",
    left:        "50%",
    marginLeft:  -(CIRCULAR_TRACKER_SIZE * 0.39) / 2,
    marginTop:   -(CIRCULAR_TRACKER_SIZE * 0.39) / 2,
    position:    "absolute",
    top:         "50%",
    width:       CIRCULAR_TRACKER_SIZE * 0.39,
  },
  cycleWheelEyebrow: {
    fontFamily:   F.uiBlack,
    fontSize:     10,
    letterSpacing: 2,
    lineHeight:   14,
    marginBottom: 1,
  },
  cycleWheelNumber: {
    fontFamily:   F.uiBlack,
    fontSize:     50,
    letterSpacing: -1.5,
    lineHeight:   56,
  },
  cycleWheelDividerRow: {
    alignItems:   "center",
    flexDirection: "row",
    gap:          10,
    marginBottom: 8,
    marginTop:    -1,
  },
  cycleWheelDivider: { height: 1, width: 34 },
  cycleWheelHeart:   { fontFamily: F.uiSemiBold, fontSize: 21, lineHeight: 24 },
  cycleWheelPhase: {
    fontFamily:   F.uiBlack,
    fontSize:     13,
    lineHeight:   17,
    marginBottom: 4,
    textAlign:    "center",
  },
  cycleWheelMessage: {
    fontFamily: F.uiRegular,
    fontSize:   11,
    lineHeight: 15,
    maxWidth:   140,
    textAlign:  "center",
  },

  // Generic card
  card: {
    borderRadius: 24,
    borderWidth:  1,
    marginBottom: 16,
    padding:      18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
  },
  cardHeader: {
    alignItems:    "center",
    flexDirection: "row",
    gap:           12,
    justifyContent: "space-between",
    marginBottom:  14,
  },
  calendarHeaderCopy: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: F.uiBold,    fontSize: 15 },
  cardSub:   { fontFamily: F.uiRegular, fontSize: 11, marginTop: 1 },
  seeAllText: { fontFamily: F.uiSemiBold, fontSize: 12 },
  seeAllBtn: {
    borderRadius:     999,
    paddingHorizontal: 11,
    paddingVertical:   7,
  },

  // Graph
  graphChips:      { marginBottom: 12 },
  graphChip: {
    borderRadius:     20,
    borderWidth:      1,
    marginRight:      6,
    paddingHorizontal: 12,
    paddingVertical:   5,
  },
  graphChipText:  { fontFamily: F.uiMedium, fontSize: 11 },
  graphWrap:      { alignItems: "flex-start" },
  graphXAxis: {
    flexDirection:  "row",
    justifyContent: "space-between",
    marginTop:      4,
    paddingHorizontal: 2,
    width:          GRAPH_W,
  },
  graphXLabel:    { fontFamily: F.uiRegular, fontSize: 10 },
  graphLegendRow: { flexDirection: "row", gap: 14, marginTop: 10 },
  graphLegendItem:{ alignItems: "center", flexDirection: "row", gap: 5 },
  graphLegendLine:{ borderRadius: 2, height: 3, width: 18 },
  graphLegendLabel:{ fontFamily: F.uiRegular, fontSize: 11 },

  // Metric grid
  metricsGrid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           12,
    marginBottom:  16,
  },
  metricCard: {
    borderRadius: 20,
    borderWidth:  1,
    padding:      14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    width:        (W - 40 - 12) / 2,
  },
  metricIconBubble: {
    alignItems:   "center",
    borderRadius: 12,
    height:       36,
    justifyContent: "center",
    marginBottom: 8,
    width:        36,
  },
  metricLabel:    { fontFamily: F.uiMedium, fontSize: 11 },
  metricValue:    { fontFamily: F.uiBold,   fontSize: 18, marginBottom: 6, marginTop: 2 },
  metricBarTrack: { borderRadius: 4, height: 4, overflow: "hidden" },
  metricBarFill:  { borderRadius: 4, height: 4 },

  // Insight card
  insightCard: {
    borderRadius:  24,
    borderWidth:   1,
    flexDirection: "row",
    marginBottom:  16,
    overflow:      "hidden",
    padding:       18,
  },
  insightLeft:     { flex: 1, paddingRight: 12 },
  insightIconRow:  { alignItems: "center", flexDirection: "row", gap: 5, marginBottom: 6 },
  insightTag:      { fontFamily: F.uiSemiBold, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  insightTitle:    { fontFamily: F.uiBold,     fontSize: 14, lineHeight: 20, marginBottom: 6 },
  insightBody:     { fontFamily: F.bodyRegular,fontSize: 13, lineHeight: 19, marginBottom: 10 },
  insightCta:      { alignItems: "center", flexDirection: "row", gap: 4 },
  insightCtaText:  { fontFamily: F.uiSemiBold, fontSize: 12 },
  insightImageWrap:{ alignItems: "center", justifyContent: "flex-end", width: 72 },
  insightImage:    { height: 72, width: 72 },
  insightGlow: {
    borderRadius: 36,
    bottom:       -6,
    height:       36,
    position:     "absolute",
    width:        52,
  },

  // Wellness card
  wellnessCard: {
    borderRadius: 24,
    height:       160,
    marginBottom: 16,
    overflow:     "hidden",
    shadowColor:  "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  wellnessImage:   { height: "100%", width: "100%" },
  wellnessContent: { bottom: 16, left: 18, position: "absolute" },
  wellnessTag: {
    alignItems:      "center",
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius:    12,
    flexDirection:   "row",
    gap:             4,
    marginBottom:    6,
    paddingHorizontal: 8,
    paddingVertical:   4,
    alignSelf:       "flex-start",
  },
  wellnessTagText: { color: "rgba(255,255,255,0.90)", fontFamily: F.uiMedium,   fontSize: 10 },
  wellnessTitle:   { color: "#FFFFFF",                fontFamily: F.uiBold,     fontSize: 17 },
  wellnessSub:     { color: "rgba(255,255,255,0.72)", fontFamily: F.uiRegular,  fontSize: 12, marginTop: 2 },
  playBtn: {
    bottom:        16,
    position:      "absolute",
    right:         18,
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius:  12,
  },
  playBtnInner: {
    alignItems:   "center",
    borderRadius: 24,
    height:       48,
    justifyContent: "center",
    width:        48,
  },

  // Calendar strip card
  calendarCard: {
    borderRadius:  26,
    padding:       18,
    borderWidth:   1,
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius:  22,
    elevation:     5,
  },
  calendarMonthScroller: { paddingRight: 12, paddingTop: 12 },

  // Month calendar
  monthBlock: {
    borderRadius: 24,
    borderWidth:  1,
    padding:      14,
    marginBottom: 14,
  },
  monthBlockCompact:  { width: W - 76, marginRight: 14, marginBottom: 0 },
  monthTitleRow:      { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 12 },
  monthTitle:         { fontFamily: F.luxuryBold, fontSize: 21, lineHeight: 27 },
  monthYear:          { fontFamily: F.uiSemiBold, fontSize: 12 },
  monthWeekRow:       { flexDirection: "row", marginBottom: 6 },
  monthWeekCell:      { flex: 1, alignItems: "center" },
  monthWeekText:      { textAlign: "center", fontFamily: F.uiBold, fontSize: 10 },
  monthGridRow:       { flexDirection: "row" },
  monthDayCell: {
    alignItems:   "center",
    flex:         1,
    height:       44,
    justifyContent: "center",
    overflow:     "visible",
  },
  monthDayRing: {
    alignItems:   "center",
    borderColor:  "transparent",
    borderRadius: 15,
    borderWidth:  2,
    height:       30,
    justifyContent: "center",
    width:        30,
    zIndex:       1,
  },
  rangeStrip:  { height: 30, position: "absolute", top: 7, width: "50%", zIndex: 0 },
  rangeStripL: { left:  0 },
  rangeStripR: { right: 0 },
  historyDot:  { width: 5, height: 5, borderRadius: 2.5, marginTop: 1 },
  monthDayText:  { fontFamily: F.uiSemiBold, fontSize: 13 },
  tinyCycleDay:  { fontFamily: F.uiBold, fontSize: 8, marginTop: -1 },

  // Period summary
  periodSummaryRow:   { flexDirection: "row", gap: 10, marginTop: 14 },
  periodSummaryItem:  { flex: 1, borderRadius: 18, borderWidth: 1, padding: 12 },
  periodSummaryValue: { fontFamily: F.uiBlack,    fontSize: 13  },
  periodSummaryLabel: { fontFamily: F.uiSemiBold, fontSize: 10.5, marginTop: 3 },

  // Quick log bar
  quickLogInline: { gap: 10, marginTop: 2 },
  quickLogTitle:  { fontFamily: F.uiBold, fontSize: 15, lineHeight: 20 },
  quickLogBar: {
    borderRadius:     28,
    borderWidth:      1,
    flexDirection:    "row",
    justifyContent:   "space-around",
    paddingHorizontal: 8,
    paddingVertical:  10,
    shadowOffset:     { width: 0, height: -4 },
    shadowOpacity:    0.14,
    shadowRadius:     16,
  },
  quickLogBtn:   { alignItems: "center", flex: 1, gap: 4 },
  quickLogIcon:  { alignItems: "center", borderRadius: 14, height: 36, justifyContent: "center", width: 36 },
  quickLogLabel: { fontFamily: F.uiMedium, fontSize: 10 },
  pressed:       { transform: [{ scale: 0.95 }] },

  // Shared sheet primitives
  sheetScrim:    { backgroundColor: "rgba(0,0,0,0.38)", zIndex: 40 },
  sheetHandle:   { width: 38, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 18 },
  sheetCloseBtn: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 24, marginTop: 6 },
  sheetCloseText:{ fontFamily: F.uiMedium, fontSize: 13.5 },

  // Routine sheet
  routineSheet: {
    position:             "absolute",
    bottom:               0,
    left:                 0,
    right:                0,
    maxHeight:            H * 0.85,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    borderTopWidth:       1,
    borderLeftWidth:      1,
    borderRightWidth:     1,
    paddingHorizontal:    24,
    paddingTop:           14,
    zIndex:               50,
    shadowColor:          "#000",
    shadowOffset:         { width: 0, height: -6 },
    shadowOpacity:        0.10,
    shadowRadius:         20,
    elevation:            14,
  },
  routineHeaderRow:     { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  routineIconWrap: {
    width:          52,
    height:         52,
    borderRadius:   26,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  routineHeaderText:    { flex: 1 },
  routineTitle:         { fontFamily: F.luxuryBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2, marginBottom: 3 },
  routineMeta:          { fontFamily: F.uiMedium,   fontSize: 12.5 },
  routineSection:       { marginBottom: 18 },
  routineSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  routineSectionLabel:  { fontFamily: F.uiSemiBold, fontSize: 12, letterSpacing: 0.4, textTransform: "uppercase" },
  routineSectionBody:   { fontFamily: F.bodyRegular, fontSize: 15, lineHeight: 23 },
  routineBenefitRow:    { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4 },
  routineBenefitDot:    { width: 6, height: 6, borderRadius: 3, marginTop: 9, flexShrink: 0 },
  routineBenefitText:   { fontFamily: F.uiRegular, fontSize: 14, lineHeight: 21, flex: 1 },
  routinePlayRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           14,
    borderRadius:  20,
    borderWidth:   1,
    padding:       14,
    marginBottom:  10,
  },
  routinePlayCircle: {
    width:          46,
    height:         46,
    borderRadius:   23,
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.28,
    shadowRadius:   8,
    elevation:      4,
  },
  routinePlayInfo:    { flex: 1 },
  routinePlayTitle:   { fontFamily: F.uiSemiBold, fontSize: 14,   marginBottom: 2 },
  routinePlaySub:     { fontFamily: F.uiRegular,  fontSize: 12 },
  routineWaveRow:     { flexDirection: "row", alignItems: "center", gap: 3 },
  routineWaveBar:     { width: 3, borderRadius: 2 },
  routinePreviewNote: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              7,
    paddingHorizontal: 14,
    paddingVertical:  10,
    borderRadius:     14,
    borderWidth:      1,
    marginBottom:     12,
  },
  routinePreviewText: { flex: 1, fontFamily: F.uiRegular,  fontSize: 12, lineHeight: 17 },
  routineBloopBtn: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              10,
    borderRadius:     20,
    borderWidth:      1,
    paddingHorizontal: 18,
    paddingVertical:  15,
    overflow:         "hidden",
    marginTop:        4,
    marginBottom:     4,
  },
  routineBloopText: { flex: 1, fontFamily: F.uiSemiBold, fontSize: 14.5 },
  poseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  poseNumberBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  poseNumberText: {
    fontFamily: F.uiBold,
    fontSize: 12,
  },
  poseInfo: {
    flex: 1,
    gap: 4,
  },
  poseNameText: {
    fontFamily: F.uiSemiBold,
    fontSize: 14,
  },
  poseDescText: {
    fontFamily: F.uiRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: F.uiRegular,
    fontSize: 11,
    lineHeight: 16,
  },

  // Calendar sheet
  calendarSheet: {
    position:             "absolute",
    bottom:               0,
    left:                 0,
    right:                0,
    maxHeight:            H * 0.90,
    flexDirection:        "column",
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    borderTopWidth:       1,
    borderLeftWidth:      1,
    borderRightWidth:     1,
    paddingHorizontal:    24,
    paddingBottom:        0,
    paddingTop:           14,
    zIndex:               50,
    shadowColor:          "#000",
    shadowOffset:         { width: 0, height: -6 },
    shadowOpacity:        0.10,
    shadowRadius:         20,
    elevation:            14,
  },
  calSheetHeaderRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  calSheetTitle:      { fontFamily: F.luxuryBold, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  calSheetBadge:      { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  calSheetBadgeText:  { fontFamily: F.uiSemiBold, fontSize: 12 },
  calSheetSub:        { fontFamily: F.uiRegular,  fontSize: 12.5, marginBottom: 18 },
  calendarSheetScroll:{ flex: 1, paddingBottom: 36 },

  // Period details card (inside calendar sheet)
  periodDetailsCard: {
    borderRadius: 22,
    borderWidth:  1,
    padding:      16,
    marginBottom: 16,
  },
  periodDetailsTitle: { fontFamily: F.luxuryBold, fontSize: 18, lineHeight: 24, marginBottom: 10 },
  periodDetailRow: {
    flexDirection:   "row",
    justifyContent:  "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  periodDetailLabel: { fontFamily: F.uiSemiBold, fontSize: 12.5 },
  periodDetailValue: { fontFamily: F.uiBlack,    fontSize: 12.5 },

  calBloopBtn: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              10,
    borderRadius:     20,
    borderWidth:      1,
    paddingHorizontal: 18,
    paddingVertical:  15,
    overflow:         "hidden",
    marginTop:        16,
    marginBottom:     4,
  },
  calBloopText: { flex: 1, fontFamily: F.uiSemiBold, fontSize: 14.5 },

  // Date detail popup
  popupScrim: {
    flex:            1,
    backgroundColor: "rgba(22,18,28,0.36)",
    justifyContent:  "flex-end",
  },
  popupSheet: {
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    borderTopWidth:       1,
    borderLeftWidth:      1,
    borderRightWidth:     1,
    paddingHorizontal:    24,
    paddingBottom:        36,
    paddingTop:           12,
    shadowColor:          "#000",
    shadowOffset:         { width: 0, height: -6 },
    shadowOpacity:        0.10,
    shadowRadius:         20,
    elevation:            14,
  },
  popupHandle: {
    width:      40,
    height:     4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.14)",
    alignSelf:  "center",
    marginBottom: 16,
  },
  popupHeaderRow: {
    flexDirection:  "row",
    alignItems:     "flex-start",
    justifyContent: "space-between",
    marginBottom:   18,
  },
  popupDate:       { fontFamily: F.luxuryBold, fontSize: 20, marginBottom: 6 },
  popupPhasePill:  { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  popupPhaseDot:   { width: 7, height: 7, borderRadius: 3.5 },
  popupPhaseText:  { fontFamily: F.uiBold, fontSize: 12 },
  popupCloseBtn:   { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  popupContent:    { gap: 12 },
  popupRow: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  popupRowLabel:     { fontFamily: F.uiSemiBold, fontSize: 13, flex: 1 },
  popupRowValue:     { fontFamily: F.uiBlack,    fontSize: 13 },
  popupJournalWrap:  { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 14, padding: 12, marginTop: 4 },
  popupJournalText:  { flex: 1, fontFamily: F.uiRegular, fontSize: 13, lineHeight: 19 },
  popupEmptyWrap:    { alignItems: "center", gap: 10, paddingVertical: 28 },
  popupEmptyTitle:   { fontFamily: F.luxuryBold, fontSize: 17 },
  popupEmptyMsg:     { fontFamily: F.uiRegular,  fontSize: 13, textAlign: "center" },
});
