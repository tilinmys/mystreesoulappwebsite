/**
 * userProfile.ts
 *
 * Single source of truth for what the app shows each user based on their
 * selected journey goals. Every screen that needs to adapt reads from here.
 *
 * RULE: No screen is rewritten. Screens call getUserProfile() and use the
 * returned flags to show/hide sections. All existing JSX stays in place.
 */

import { getNeedCombination, NeedCombinationId } from "./onboardingAdaptation";

// ─── Tab names (must match (tabs)/_layout.tsx exactly) ───────────────────────
export type TabName =
  | "dashboard"
  | "cycle"
  | "insights"
  | "wellness"
  | "nourish"
  | "sleep"
  | "profile";

// ─── Dashboard focus ──────────────────────────────────────────────────────────
export type DashboardFocus =
  | "cycle_ring"          // large cycle phase ring as hero
  | "affirmation"         // daily affirmation card as hero
  | "goal_progress"       // habit/goal progress bar as hero
  | "cycle_and_mood"      // split: cycle ring + mood check-in
  | "cycle_and_goal"      // split: cycle ring + goal progress
  | "affirmation_and_goal"// split: affirmation + gentle goal tracker
  | "all_three";          // three-pillar layout

// ─── Bloop personality ────────────────────────────────────────────────────────
export type BloopPersonality =
  | "informative"     // body data, clinical-warm, phase facts
  | "empathetic"      // emotional support, softness, validation
  | "coaching"        // goals, habits, accountability, energy
  | "holistic"        // weaves all three threads together
  | "mood_cycle"      // connects emotions to cycle phase
  | "strategic_cycle" // performance + cycle planning
  | "compassionate";  // self-compassion + gentle progress

// ─── Insight priority ─────────────────────────────────────────────────────────
export type InsightPriority =
  | "hormones"        // estrogen, progesterone, LH, phase breakdown
  | "habits"          // streaks, completion rates, hydration, sleep quality
  | "mood_hormone"    // mood overlaid with hormone timeline
  | "habit_cycle"     // habit rate overlaid with cycle phase
  | "hidden";         // insights tab is not visible for this journey

// ─── Full user profile type ───────────────────────────────────────────────────
export type UserProfile = {
  /** The resolved journey ID */
  journeyId: NeedCombinationId;

  /** Which tabs appear in FloatingTabBar — in display order */
  visibleTabs: TabName[];

  /** What the dashboard hero section renders */
  dashboardFocus: DashboardFocus;

  /** Bloop's conversational personality and topic focus */
  bloopPersonality: BloopPersonality;

  /** What the Insights screen prioritises */
  insightPriority: InsightPriority;

  // ── Convenience boolean flags (use these in screens) ──────────────────────

  /** Show cycle phase ring, phase labels, hormone data anywhere */
  showCycleData: boolean;

  /** Show emotional check-ins, mood wheel, affirmations anywhere */
  showEmotionalContent: boolean;

  /** Show goal progress bars, habit streaks, daily plan anywhere */
  showGoalContent: boolean;

  /** Phase filter visible on Nourish screen */
  nourishPhaseFilterVisible: boolean;

  /** Sleep screen insight framing */
  sleepFraming: "cycle_phase" | "emotional_rest" | "productivity" | "integrated";

  /** Hero message shown on the Ready screen (Step 6) */
  readyHeroMessage: string;
};

// ─── Journey definitions ──────────────────────────────────────────────────────

const JOURNEY_PROFILES: Record<NeedCombinationId, UserProfile> = {

  cycle: {
    journeyId: "cycle",
    visibleTabs: ["dashboard", "cycle", "insights", "sleep", "nourish", "profile"],
    dashboardFocus: "cycle_ring",
    bloopPersonality: "informative",
    insightPriority: "hormones",
    showCycleData: true,
    showEmotionalContent: false,
    showGoalContent: false,
    nourishPhaseFilterVisible: true,
    sleepFraming: "cycle_phase",
    readyHeroMessage: "Your cycle is your guide.",
  },

  self_love: {
    journeyId: "self_love",
    visibleTabs: ["dashboard", "wellness", "sleep", "profile"],
    dashboardFocus: "affirmation",
    bloopPersonality: "empathetic",
    insightPriority: "hidden",
    showCycleData: false,
    showEmotionalContent: true,
    showGoalContent: false,
    nourishPhaseFilterVisible: false,
    sleepFraming: "emotional_rest",
    readyHeroMessage: "You deserve to feel at home in yourself.",
  },

  goal_setting: {
    journeyId: "goal_setting",
    visibleTabs: ["dashboard", "nourish", "insights", "sleep", "profile"],
    dashboardFocus: "goal_progress",
    bloopPersonality: "coaching",
    insightPriority: "habits",
    showCycleData: false,
    showEmotionalContent: false,
    showGoalContent: true,
    nourishPhaseFilterVisible: false,
    sleepFraming: "productivity",
    readyHeroMessage: "Small steps. Real change.",
  },

  self_love_cycle: {
    journeyId: "self_love_cycle",
    visibleTabs: ["dashboard", "cycle", "wellness", "sleep", "profile"],
    dashboardFocus: "cycle_and_mood",
    bloopPersonality: "mood_cycle",
    insightPriority: "mood_hormone",
    showCycleData: true,
    showEmotionalContent: true,
    showGoalContent: false,
    nourishPhaseFilterVisible: true,
    sleepFraming: "cycle_phase",
    readyHeroMessage: "Your feelings and your cycle tell the same story.",
  },

  goal_setting_cycle: {
    journeyId: "goal_setting_cycle",
    visibleTabs: ["dashboard", "cycle", "nourish", "insights", "sleep", "profile"],
    dashboardFocus: "cycle_and_goal",
    bloopPersonality: "strategic_cycle",
    insightPriority: "habit_cycle",
    showCycleData: true,
    showEmotionalContent: false,
    showGoalContent: true,
    nourishPhaseFilterVisible: true,
    sleepFraming: "integrated",
    readyHeroMessage: "Your cycle is your most powerful planning tool.",
  },

  self_love_goal_setting: {
    journeyId: "self_love_goal_setting",
    visibleTabs: ["dashboard", "wellness", "nourish", "sleep", "profile"],
    dashboardFocus: "affirmation_and_goal",
    bloopPersonality: "compassionate",
    insightPriority: "hidden",
    showCycleData: false,
    showEmotionalContent: true,
    showGoalContent: true,
    nourishPhaseFilterVisible: false,
    sleepFraming: "emotional_rest",
    readyHeroMessage: "Progress that feels kind.",
  },

  whole_rhythm: {
    journeyId: "whole_rhythm",
    visibleTabs: [
      "dashboard", "cycle", "wellness", "nourish",
      "insights", "sleep", "profile",
    ],
    dashboardFocus: "all_three",
    bloopPersonality: "holistic",
    insightPriority: "mood_hormone",
    showCycleData: true,
    showEmotionalContent: true,
    showGoalContent: true,
    nourishPhaseFilterVisible: true,
    sleepFraming: "integrated",
    readyHeroMessage: "Your whole self, in one place.",
  },
};

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Derive a UserProfile from the goals the user selected during onboarding.
 * Safe to call with an empty array — defaults to the self_love journey.
 *
 * @example
 * const profile = getUserProfile(["cycle"]);
 * if (profile.showCycleData) { ... }
 */
export function getUserProfile(selectedGoals: string[]): UserProfile {
  const journeyId = getNeedCombination(selectedGoals);
  return JOURNEY_PROFILES[journeyId];
}

/**
 * Check if a specific tab should be visible for a given goals selection.
 * Convenience wrapper — avoids importing UserProfile type in simple checks.
 *
 * @example
 * const show = isTabVisible(["self_love"], "cycle"); // false
 */
export function isTabVisible(selectedGoals: string[], tab: TabName): boolean {
  return getUserProfile(selectedGoals).visibleTabs.includes(tab);
}
