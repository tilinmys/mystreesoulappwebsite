/**
 * CycleCircle v2 — Radial card ring cycle calendar
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * CRITICAL GEOMETRY (v1 was wrong — this fixes it):
 * ──────────────────────────────────────────────────
 * Every day block is a <Rect> with rounded corners, NOT a donut arc.
 * Each rect is placed at its polar position, then rotated so the height
 * (tall dimension) points radially outward:
 *
 *   transform={`rotate(${midDeg + 90}, ${segCx}, ${segCy})`}
 *
 * This makes the segment "top" face away from the centre, and the block
 * sits tangentially on the ring — matching the premium calendar reference.
 *
 * LAYER STACK (back → front)
 * ──────────────────────────
 *  1  Dark outer background disc
 *  2  Ring track (subtle dark donut)
 *  3  Phase arcs  — thin 2–3 px strokes just outside ring
 *  4  Day segments — rotated <Rect> cards, coloured by phase
 *  5  Day numbers  — small text inside each card (same rotation)
 *  6  Day-1 supersegment — larger card, gradient pink
 *  7  Ovulation node  — floating circle over ring at day 14
 *  8  Ovulation flower + label  (outside ring)
 *  9  Phase labels — genuine TextPath curved text
 * 10  Centre disc  — white circle with soft rim glow
 * 11  Centre typography (label / number / heart / phase / caption)
 */

import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
  TextPath,
} from 'react-native-svg';
import { F } from '../../constants/fonts';

// ─── SVG internal coordinate space ────────────────────────────────────────────
const S   = 360;
const CX  = S / 2;  // 180
const CY  = S / 2;  // 180

// ─── Ring geometry ─────────────────────────────────────────────────────────────
const SEG_R    = 134;                     // segment centre radius
const SEG_W    = 24;                      // width  (tangential, px)
const SEG_H    = 42;                      // height (radial, px)
const SEG_RX   = 7;                       // corner radius

const SEG_INNER = SEG_R - SEG_H / 2;     // 113 — inner edge of ring
const SEG_OUTER = SEG_R + SEG_H / 2;     // 155 — outer edge of ring

// Phase arc stripe — thin, sits outside the ring
const ARC_R     = SEG_OUTER + 12;        // 167

// Curved label text-path radius
const LBL_R     = ARC_R + 8;            // 175

// Centre disc
const CENTER_R  = 108;

// Ovulation floating circle
const OVUL_R    = 22;
const OVUL_CR   = SEG_R + 4;             // 138 — pushed slightly outward

// Day-1 supersegment (largest, most prominent)
const D1_W   = 28;
const D1_H   = 50;
const D1_RX  = 9;

// ─── Per-day angular constants ─────────────────────────────────────────────────
const DAYS        = 28;
const DEG_PER_DAY = 360 / DAYS;          // ≈ 12.857 °
const START       = -90;                  // day 1 at 12 o'clock

// ─── Colour palette ────────────────────────────────────────────────────────────
const C = {
  // Layout
  outerBg:    '#221822',
  ringTrack:  '#3A2B3E',

  // Phase arc / label tints
  mensArc:    '#E83F72',
  fertArc:    '#2F8F5B',
  lutArc:     '#8B80D6',

  // Menstruation gradient (index = day - 1, days 1–5)
  mens:  ['#E83F72', '#F0628A', '#F27A9E', '#F4A0B7', '#F7B7C7'] as const,
  // Fertile gradient (index = 0 for day 8 → 6 for day 14)
  fert:  ['#A8DFC0', '#88D4AE', '#68C49C', '#52BC8E', '#40B080', '#35A872', '#2F8F5B'] as const,
  // Luteal
  luteal:  '#C4BEE8',
  // Neutral (gap days 6–7)
  neutral: '#9B8FA6',

  // Centre disc
  centre: '#FFFFFF',
  rimGlow:'#E8D8F0',

  // Text inside the white centre
  cTextDark:  '#172447',
  cTextMid:   '#4A5580',
  cTextMuted: '#6C6F91',

  // Segment number text
  segNumDark:  '#172447',
  segNumLight: '#FFFFFF',
} as const;

// ─── Phase number colour (inside centre circle) ────────────────────────────────
const PHASE_NUM_COLOR: Record<string, string> = {
  mens:    '#E83F72',
  fert:    '#2F8F5B',
  luteal:  '#7B72C8',
  neutral: '#9B8FA6',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const toRad = (d: number) => (d * Math.PI) / 180;
const polar  = (r: number, deg: number) => ({
  x: CX + r * Math.cos(toRad(deg)),
  y: CY + r * Math.sin(toRad(deg)),
});

/** CW SVG arc path for TextPath labels. */
function labelArcPath(r: number, a1Deg: number, a2Deg: number): string {
  const s = polar(r, a1Deg), e = polar(r, a2Deg);
  const span = ((a2Deg - a1Deg) % 360 + 360) % 360;
  const large = span > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(3);
  return `M ${f(s.x)} ${f(s.y)} A ${r} ${r} 0 ${large} 1 ${f(e.x)} ${f(e.y)}`;
}

/** CW open arc stroke path for phase glow arcs. */
function arcStroke(r: number, a1Deg: number, a2Deg: number): string {
  const s = polar(r, a1Deg), e = polar(r, a2Deg);
  const span = ((a2Deg - a1Deg) % 360 + 360) % 360;
  const large = span > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(3);
  return `M ${f(s.x)} ${f(s.y)} A ${r} ${r} 0 ${large} 1 ${f(e.x)} ${f(e.y)}`;
}

function getSegFill(day: number, mensDays: number[], fertileDays: number[]): string {
  const mi = mensDays.indexOf(day);
  if (mi >= 0) return C.mens[mi] ?? C.mens[0];
  const fi = fertileDays.indexOf(day);
  if (fi >= 0) return C.fert[fi] ?? C.fert[0];
  if (day >= 15) return C.luteal;
  return C.neutral;
}

function getSegNumColor(day: number): string {
  // Day 1 is the darkest pink — use white for contrast
  return day === 1 ? C.segNumLight : C.segNumDark;
}

// ─── Component ────────────────────────────────────────────────────────────────
export interface CycleCircleProps {
  currentDay?:       number;
  ovulationDay?:     number;
  cycleLength?:      number;
  menstruationDays?: number[];
  fertileDays?:      number[];
}

export default function CycleCircle({
  currentDay       = 1,
  ovulationDay     = 14,
  cycleLength      = 28,
  menstruationDays = [1, 2, 3, 4, 5],
  fertileDays      = [8, 9, 10, 11, 12, 13, 14],
}: CycleCircleProps) {
  const { width: W } = Dimensions.get('window');
  const size = Math.min(W * 0.92, 390);

  // ── Phase metadata for centre display ─────────────────────────────────────
  const inMens   = menstruationDays.includes(currentDay);
  const inFert   = fertileDays.includes(currentDay);
  const inLuteal = !inMens && !inFert && currentDay >= 15;
  const phaseKey = inMens ? 'mens' : inFert ? 'fert' : inLuteal ? 'luteal' : 'neutral';
  const numColor = PHASE_NUM_COLOR[phaseKey];

  const phaseName =
    inMens   ? 'Menstruation'
    : inFert ? 'Fertile Window'
    : inLuteal ? 'Luteal Phase'
    : 'Pre-Fertile';

  const caption =
    currentDay <= 5  ? 'Rest & restore, beautiful'
    : currentDay <= 14 ? 'Your energy is rising ✦'
    : currentDay <= 21 ? 'Slow down & listen within'
    : "Let's take care of you";

  const dayFontSize = currentDay < 10 ? 68 : 52;

  // ── Precompute every day's mid-angle ──────────────────────────────────────
  const days = Array.from({ length: cycleLength }, (_, i) => {
    const day    = i + 1;
    const midDeg = START + (i + 0.5) * DEG_PER_DAY;
    return { day, midDeg };
  });

  // ── Phase boundary angles ─────────────────────────────────────────────────
  const gapHalf = 1.4; // degrees of gap at each segment edge
  const mensA1  = START + gapHalf;
  const mensA2  = START + menstruationDays.length * DEG_PER_DAY - gapHalf;
  const fertA1  = START + (Math.min(...fertileDays) - 1) * DEG_PER_DAY + gapHalf;
  const fertA2  = START + Math.max(...fertileDays) * DEG_PER_DAY - gapHalf;
  const lutA1   = START + 14 * DEG_PER_DAY + gapHalf;
  const lutA2   = START + cycleLength * DEG_PER_DAY - gapHalf;

  // ── TextPath arc definitions ──────────────────────────────────────────────
  const mensLblPath = labelArcPath(LBL_R, -106, -22);
  const fertLblPath = labelArcPath(LBL_R, -6,   100);
  const lutLblPath  = labelArcPath(LBL_R, 118,  253);

  // ── Ovulation day geometry ────────────────────────────────────────────────
  const ovulIdx  = ovulationDay - 1;
  const ovulMid  = days[ovulIdx]?.midDeg ?? START + (ovulIdx + 0.5) * DEG_PER_DAY;
  const ovulPos  = polar(OVUL_CR, ovulMid);
  const ovulOut  = polar(SEG_OUTER + 20, ovulMid);

  // ── Current-day pip position ──────────────────────────────────────────────
  const curMid  = days[currentDay - 1]?.midDeg ?? START + (currentDay - 0.5) * DEG_PER_DAY;
  const pipPos  = polar(SEG_OUTER + 6, curMid);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${S} ${S}`}
        accessibilityLabel={`Cycle wheel — day ${currentDay} of ${cycleLength}, ${phaseName}`}
      >
        <Defs>
          {/* Day-1 gradient */}
          <LinearGradient id="d1Grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E83F72" stopOpacity="1" />
            <Stop offset="1" stopColor="#F7B7C7" stopOpacity="1" />
          </LinearGradient>
          {/* Ovulation bubble */}
          <LinearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#52BC8E" stopOpacity="1" />
            <Stop offset="1" stopColor="#2F8F5B" stopOpacity="1" />
          </LinearGradient>
          {/* TextPath arc paths */}
          <Path id="mensLbl" d={mensLblPath} />
          <Path id="fertLbl" d={fertLblPath} />
          <Path id="lutLbl"  d={lutLblPath}  />
        </Defs>

        {/* ── 1. Outer background disc ──────────────────────────────────── */}
        <Circle cx={CX} cy={CY} r={S / 2 - 1} fill={C.outerBg} />

        {/* ── 2. Ring track (donut behind segments) ─────────────────────── */}
        <Circle cx={CX} cy={CY} r={SEG_OUTER + 2} fill={C.ringTrack} />
        <Circle cx={CX} cy={CY} r={SEG_INNER - 2} fill={C.outerBg}   />

        {/* ── 3. Phase arc stripes (thin coloured strokes outside ring) ─── */}
        <Path
          d={arcStroke(ARC_R, mensA1, mensA2)}
          stroke={C.mensArc} strokeWidth={2.5} fill="none"
          strokeLinecap="round" opacity={0.85}
        />
        <Path
          d={arcStroke(ARC_R, fertA1, fertA2)}
          stroke={C.fertArc} strokeWidth={2.5} fill="none"
          strokeLinecap="round" opacity={0.85}
        />
        <Path
          d={arcStroke(ARC_R, lutA1, lutA2)}
          stroke={C.lutArc}  strokeWidth={2.5} fill="none"
          strokeLinecap="round" opacity={0.75}
        />

        {/* ── 4–5. Day segment cards + numbers ──────────────────────────── */}
        {days.map(({ day, midDeg }) => {
          // Day 1 and ovulation day rendered specially below
          if (day === 1 || day === ovulationDay) return null;

          const pos  = polar(SEG_R, midDeg);
          const rot  = midDeg + 90;
          const fill = getSegFill(day, menstruationDays, fertileDays);
          const numC = getSegNumColor(day);
          const isCurrentDay = day === currentDay;

          return (
            <G
              key={`day-${day}`}
              transform={`rotate(${rot.toFixed(2)}, ${pos.x.toFixed(3)}, ${pos.y.toFixed(3)})`}
            >
              {/* Highlight ring for current day */}
              {isCurrentDay && (
                <Rect
                  x={pos.x - (SEG_W / 2 + 2.5)}
                  y={pos.y - (SEG_H / 2 + 2.5)}
                  width={SEG_W + 5}
                  height={SEG_H + 5}
                  rx={SEG_RX + 2}
                  ry={SEG_RX + 2}
                  fill="none"
                  stroke={fill}
                  strokeWidth={2}
                  opacity={0.8}
                />
              )}
              {/* Segment card */}
              <Rect
                x={pos.x - SEG_W / 2}
                y={pos.y - SEG_H / 2}
                width={SEG_W}
                height={SEG_H}
                rx={SEG_RX}
                ry={SEG_RX}
                fill={fill}
                opacity={isCurrentDay ? 1 : 0.90}
              />
              {/* Day number */}
              <SvgText
                x={pos.x}
                y={pos.y}
                fill={numC}
                fontSize={day >= 10 ? 7.5 : 8.5}
                fontFamily={F.uiBold}
                fontWeight="700"
                textAnchor="middle"
                dy="3"
              >
                {day}
              </SvgText>
            </G>
          );
        })}

        {/* ── 6. Day-1 supersegment ─────────────────────────────────────── */}
        {(() => {
          const pos = polar(SEG_R, days[0].midDeg);
          const rot = days[0].midDeg + 90;
          return (
            <G transform={`rotate(${rot.toFixed(2)}, ${pos.x.toFixed(3)}, ${pos.y.toFixed(3)})`}>
              <Rect
                x={pos.x - D1_W / 2}
                y={pos.y - D1_H / 2}
                width={D1_W}
                height={D1_H}
                rx={D1_RX}
                ry={D1_RX}
                fill="url(#d1Grad)"
              />
              <SvgText
                x={pos.x}
                y={pos.y}
                fill={C.segNumLight}
                fontSize={9}
                fontFamily={F.uiBold}
                fontWeight="700"
                textAnchor="middle"
                dy="3"
              >
                1
              </SvgText>
            </G>
          );
        })()}

        {/* ── 7. Ovulation floating circle ──────────────────────────────── */}
        {(() => {
          return (
            <G>
              {/* Outer glow ring */}
              <Circle
                cx={ovulPos.x}
                cy={ovulPos.y}
                r={OVUL_R + 4}
                fill="none"
                stroke="#CFEFD6"
                strokeWidth={2}
                opacity={0.65}
              />
              {/* Main circle */}
              <Circle
                cx={ovulPos.x}
                cy={ovulPos.y}
                r={OVUL_R}
                fill="url(#ovGrad)"
              />
              {/* Day number */}
              <SvgText
                x={ovulPos.x}
                y={ovulPos.y}
                fill={C.segNumLight}
                fontSize={11}
                fontFamily={F.uiBold}
                fontWeight="700"
                textAnchor="middle"
                dy="4"
              >
                {ovulationDay}
              </SvgText>
            </G>
          );
        })()}

        {/* ── 8. Ovulation flower icon + label ──────────────────────────── */}
        {(() => {
          return (
            <G>
              {/* Six-petal flower */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <Circle
                  key={`petal-${deg}`}
                  cx={ovulOut.x + 6 * Math.cos(toRad(deg))}
                  cy={ovulOut.y + 6 * Math.sin(toRad(deg))}
                  r={3.5}
                  fill="#A8DFC0"
                  opacity={0.85}
                />
              ))}
              {/* Flower centre */}
              <Circle cx={ovulOut.x} cy={ovulOut.y} r={2.5} fill="#2F8F5B" />
              {/* "OVULATION" label */}
              <SvgText
                x={ovulOut.x}
                y={ovulOut.y + 16}
                fill="#2F8F5B"
                fontSize={6}
                fontFamily={F.uiLabel}
                fontWeight="700"
                textAnchor="middle"
                letterSpacing={1.2}
                opacity={0.9}
              >
                OVULATION
              </SvgText>
            </G>
          );
        })()}

        {/* ── 9. Phase labels — curved TextPath ─────────────────────────── */}
        <SvgText fill={C.mensArc} fontSize={7} fontFamily={F.uiLabel} fontWeight="700" letterSpacing={1.5}>
          <TextPath href="#mensLbl" startOffset="50%" textAnchor="middle">
            MENSTRUATION
          </TextPath>
        </SvgText>

        <SvgText fill={C.fertArc} fontSize={7} fontFamily={F.uiLabel} fontWeight="700" letterSpacing={1.5}>
          <TextPath href="#fertLbl" startOffset="50%" textAnchor="middle">
            FERTILE WINDOW
          </TextPath>
        </SvgText>

        <SvgText fill={C.lutArc} fontSize={7} fontFamily={F.uiLabel} fontWeight="700" letterSpacing={1.5}>
          <TextPath href="#lutLbl" startOffset="50%" textAnchor="middle">
            LUTEAL PHASE
          </TextPath>
        </SvgText>

        {/* ── Current-day white pip ──────────────────────────────────────── */}
        <Circle cx={pipPos.x} cy={pipPos.y} r={5}   fill={C.centre} opacity={0.20} />
        <Circle cx={pipPos.x} cy={pipPos.y} r={3.5} fill={C.centre} opacity={0.95} />

        {/* ── 10. Centre disc ───────────────────────────────────────────── */}
        {/* Soft rim glow */}
        <Circle cx={CX} cy={CY} r={CENTER_R + 4} fill={C.rimGlow} opacity={0.30} />
        <Circle cx={CX} cy={CY} r={CENTER_R + 1} fill={C.rimGlow} opacity={0.20} />
        {/* White disc */}
        <Circle cx={CX} cy={CY} r={CENTER_R} fill={C.centre} />

        {/* ── 11. Centre typography ─────────────────────────────────────── */}

        {/* "DAY OF CYCLE" — small uppercase eyebrow */}
        <SvgText
          x={CX} y={CY - 33}
          fill={C.cTextMuted}
          fontSize={7.5}
          fontFamily={F.uiLabel}
          fontWeight="700"
          textAnchor="middle"
          letterSpacing={2.5}
        >
          DAY OF CYCLE
        </SvgText>

        {/* Large day number — dominates hierarchy, phase-coloured */}
        <SvgText
          x={CX} y={CY - 2}
          fill={numColor}
          fontSize={dayFontSize}
          fontFamily={F.uiBold}
          fontWeight="300"
          textAnchor="middle"
        >
          {currentDay}
        </SvgText>

        {/* Heart divider — balances vertical rhythm */}
        <SvgText
          x={CX} y={CY + 17}
          fill="#F0628A"
          fontSize={10}
          fontFamily="System"
          textAnchor="middle"
          opacity={0.75}
        >
          ♥
        </SvgText>

        {/* Thin line either side of heart */}
        <Path
          d={`M ${CX - 22} ${CY + 12} L ${CX - 9} ${CY + 12}`}
          stroke={C.cTextMuted} strokeWidth={0.8} opacity={0.35}
        />
        <Path
          d={`M ${CX + 9} ${CY + 12} L ${CX + 22} ${CY + 12}`}
          stroke={C.cTextMuted} strokeWidth={0.8} opacity={0.35}
        />

        {/* Phase name — calm, medically elegant */}
        <SvgText
          x={CX} y={CY + 33}
          fill={C.cTextDark}
          fontSize={9.5}
          fontFamily={F.ui}
          fontWeight="600"
          textAnchor="middle"
          letterSpacing={0.3}
        >
          {phaseName}
        </SvgText>

        {/* Caption */}
        <SvgText
          x={CX} y={CY + 49}
          fill={C.cTextMid}
          fontSize={7}
          fontFamily={F.body}
          fontWeight="400"
          textAnchor="middle"
          letterSpacing={0.15}
        >
          {caption}
        </SvgText>
      </Svg>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
});
