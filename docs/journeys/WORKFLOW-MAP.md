# MyStree Soul — Journey Workflow Map
**Version:** 1.0 | **Last updated:** 2026-05-18

---

## 1. The 3 Selectable Options (Onboarding Step 1)

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   💗 Self-Love   │   │  🎯 Goal Setter  │   │   🌙 Cycle       │
│   (Unlocked)     │   │   (Unlocked)     │   │   (Unlocked)     │
└──────────────────┘   └──────────────────┘   └──────────────────┘

┌──────────────────┐   ┌──────────────────┐
│  🍃 Nutrition    │   │  🧘 Inner Harmony│
│   (LOCKED)       │   │    (LOCKED)      │
└──────────────────┘   └──────────────────┘
```

The user picks 1, 2, or all 3 unlocked options. This single choice drives EVERYTHING downstream.

---

## 2. Decision Tree → Journey Assignment

```
User picks on Step 1
        │
        ▼
┌───────────────────────────────────────────────────────────────────┐
│                    getNeedCombination(selectedGoals)               │
│                    (constants/onboardingAdaptation.ts)             │
└───────────────────────────────────────────────────────────────────┘
        │
        ├── cycle only             ──→  JourneyID: "cycle"
        ├── self_love only         ──→  JourneyID: "self_love"
        ├── goal_setting only      ──→  JourneyID: "goal_setting"
        ├── self_love + cycle      ──→  JourneyID: "self_love_cycle"
        ├── goal_setting + cycle   ──→  JourneyID: "goal_setting_cycle"
        ├── self_love + goal_setting──→ JourneyID: "self_love_goal_setting"
        └── all three              ──→  JourneyID: "whole_rhythm"
```

---

## 3. What Changes Per Journey (The Adaptation Matrix)

| Layer | cycle | self_love | goal_setting | self_love_cycle | goal_setting_cycle | self_love_goal | whole_rhythm |
|-------|-------|-----------|--------------|-----------------|-------------------|----------------|--------------|
| **Tabs shown** | dash,cycle,insights,sleep,nourish,profile | dash,wellness,community,sleep,profile | dash,nourish,insights,sleep,profile | dash,cycle,wellness,community,sleep,profile | dash,cycle,nourish,insights,sleep,profile | dash,wellness,nourish,community,sleep,profile | ALL |
| **Dashboard hero** | Cycle ring | Affirmation | Goal progress | Ring + mood | Ring + goal | Affirmation + goal | All 3 |
| **Bloop tone** | Informative | Warm/soft | Coach | Empathetic | Strategic | Compassionate | Holistic |
| **Insights focus** | Hormones | Hidden | Habits | Mood+hormone | Habit+cycle | Hidden | All |
| **Nourish framing** | Phase-synced | Hidden | General | Phase-aware | Phase-optimised | Self-care | Phase+habit |
| **Community default** | Hidden | Emotional Wellness | Hidden | PMS & Mood | Hidden | Emotional Wellness | All |
| **Sleep framing** | Phase-tied | Emotional rest | Productivity | Emotional+cycle | Performance+cycle | Self-investment | Integrated |

---

## 4. Implementation Architecture (Zero Screen Rewrites)

```
onboardingStore.selectedGoals  ←── saved at Step 1
         │
         ▼
constants/userProfile.ts
  getUserProfile(selectedGoals)
         │
         ├──► UserProfile.visibleTabs     ──→ FloatingTabBar.tsx  (1 filter line)
         ├──► UserProfile.dashboardFocus  ──→ dashboard.tsx        (conditional sections)
         ├──► UserProfile.bloopPersonality──→ bloop-chat.tsx       (greeting + context)
         ├──► UserProfile.insightPriority ──→ insights.tsx         (section order)
         ├──► UserProfile.nourishFocus    ──→ nourish.tsx          (phase filter visibility)
         └──► UserProfile.communityDefault──→ community.tsx        (default category)
```

**Rule:** No screen is deleted or rewritten. Each screen reads `getUserProfile()` and conditionally renders sections. All existing JSX stays in place — only visibility flags change.

---

## 5. The Single Hook (How Screens Read the Profile)

```typescript
// hooks/useUserProfile.ts
import { useOnboardingStore } from "../store/onboardingStore";
import { getUserProfile } from "../constants/userProfile";

export function useUserProfile() {
  const selectedGoals = useOnboardingStore(s => s.selectedGoals);
  return getUserProfile(selectedGoals);
}

// Usage in any screen:
const profile = useUserProfile();
if (!profile.showCycleData) return null;   // hide a section
```

---

## 6. Tab Filtering (The Only Code Change to Navigation)

```typescript
// components/navigation/FloatingTabBar.tsx
// Add ONE filter before rendering tabs:

const profile = useUserProfile();

// Filter routes to only show tabs in this user's journey
const visibleRoutes = state.routes.filter(
  route => profile.visibleTabs.includes(route.name)
);

// Then map over visibleRoutes instead of state.routes
```

That's the only navigation change needed.

---

## 7. Onboarding → Journey Flow (End to End)

```
SPLASH
  │
  ▼
WELCOME → Register/Login
  │
  ▼
ONBOARDING STEP 1 (onboarding.tsx)
  User picks 1–3 goals
  setSelectedGoals([...]) → saved to onboardingStore
  │
  ▼
PRIVACY CONSENT (privacy-consent.tsx)
  │
  ▼
HEALTH SETUP (health-setup.tsx)
  ← questions adapted via getOnboardingPrompt(selectedGoals)
  │
  ▼
EMOTIONAL WELLNESS (emotional-wellness.tsx)
  ← heading/subheading adapted via getOnboardingPrompt(selectedGoals)
  ← default values pre-filled via getEmotionalDefaults(selectedGoals)
  │
  ▼
PERSONALIZATION (personalization.tsx)
  ← pre-selected wellness items via getPersonalizationDefaults(selectedGoals)
  ← Bloop AI copy adapted
  ← rhythm (morning/evening) pre-selected
  │
  ▼
READY (ready.tsx)
  ← hero message adapted per journey
  │
  ▼
DASHBOARD (tabs)
  ← tabs filtered via getUserProfile(selectedGoals).visibleTabs
  ← hero card adapted via getUserProfile(selectedGoals).dashboardFocus
  └── Everything adapted. No rewrites.
```

---

## 8. Edge Cases

| Case | Handling |
|------|----------|
| User selects zero goals | Default to `self_love` journey (most nurturing fallback) |
| User selects a locked goal (nutrition / inner_harmony) | `normalizeAvailableNeeds()` silently strips them — they never affect journey |
| User changes goals later (profile settings) | Re-run `getUserProfile(newGoals)` — tabs and content update immediately |
| User on `whole_rhythm` upgrades to premium | Locked companions (Jiggy, Manchi, Yogi) unlock — same tab set, more chat options |
| Session restored mid-onboarding | `selectedGoals` persisted in SecureStore — journey resumes correctly |
| New user with empty `selectedGoals: []` | `getNeedCombination([])` returns `"self_love"` → safest default |

---

## 9. Future: Unlocking Nutrition + Inner Harmony

When these are unlocked, two new journey IDs are added to `NeedCombinationId`:

```
nutrition          → adds dedicated Nourish depth (meal plans, macros)
inner_harmony      → adds Manchi companion + deep psychology content
```

All existing journeys gain optional modifiers — no existing flows break.

---

## 10. File Reference

| File | Purpose |
|------|---------|
| `docs/journeys/cycle-only.md` | Full spec for cycle journey |
| `docs/journeys/self-love-only.md` | Full spec for self-love journey |
| `docs/journeys/goal-setting-only.md` | Full spec for goal-setting journey |
| `docs/journeys/self-love-cycle.md` | Full spec for self-love + cycle journey |
| `docs/journeys/goal-setting-cycle.md` | Full spec for goal-setting + cycle journey |
| `docs/journeys/self-love-goal-setting.md` | Full spec for self-love + goal-setting journey |
| `docs/journeys/whole-rhythm.md` | Full spec for all-three journey |
| `constants/onboardingAdaptation.ts` | Journey detection + onboarding copy per combination |
| `constants/userProfile.ts` | Runtime profile object consumed by screens |
| `hooks/useUserProfile.ts` | Hook that screens call to read their profile |
| `store/onboardingStore.ts` | Persists `selectedGoals` across sessions |
| `hooks/useRouteGuard.ts` | Auth/session protection (already handles all routes) |
