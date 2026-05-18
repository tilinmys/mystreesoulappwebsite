# Adaptive Onboarding Combinations

## Product Goal

The first onboarding choice has five visible feature cards, but only three are available in the base experience:

- Self Love
- Goal Setting
- Cycle Tracking

Balanced Nutrition and Inner Harmony stay visible as premium-locked features, but users cannot select them. This keeps the product roadmap visible without letting a new user build an unavailable onboarding path.

## Combination Model

The app uses a deterministic rules engine rather than a black-box model. This is the right fit for an intimate wellness onboarding flow because it is explainable, stable, privacy-preserving, and easy to QA.

Each available feature is treated as one signal:

| Signal | Meaning | UI Intent |
| --- | --- | --- |
| `self_love` | Emotional reassurance, self-kindness, softer support | More mood, stress, sleep, and emotional safety language |
| `goal_setting` | Progress, habit formation, repeatable rhythm | More planning, consistency, and small-win language |
| `cycle` | Body rhythm, period/cycle awareness, fertility-adjacent needs | More cycle, energy, symptom, and rest language |

Because three available signals can be selected independently, the practical combinations are:

| Combination | Algorithm ID | Adaptive Focus |
| --- | --- | --- |
| Self Love | `self_love` | emotional steadiness and care |
| Goal Setting | `goal_setting` | habit rhythm and small goals |
| Cycle Tracking | `cycle` | body rhythm and cycle awareness |
| Self Love + Goal Setting | `self_love_goal_setting` | care plus progress |
| Self Love + Cycle Tracking | `self_love_cycle` | mood plus cycle |
| Goal Setting + Cycle Tracking | `goal_setting_cycle` | goals around cycle rhythm |
| All three | `whole_rhythm` | complete emotional, habit, and cycle profile |

## Algorithm

The engine follows a simple weighted decision structure:

1. Remove locked or unknown feature IDs.
2. Preserve only `self_love`, `goal_setting`, and `cycle`.
3. Resolve the exact combination.
4. Return:
   - emotional wellness heading and subtitle
   - emotional defaults for mood, energy, stress, and sleep
   - personalization heading and subtitle
   - default selected wellness cards
   - recommended card order
   - suggested daily rhythm and movement defaults
   - Bloop explanation copy

This is implemented in `constants/onboardingAdaptation.ts`.

## UX Rules

- Locked cards remain visible, but pressing them does not select them.
- Locked cards should show a lock badge, lower opacity, and a “Soul Premium” hint.
- The user must select at least one available feature before continuing.
- Existing visual style remains unchanged: same warm gradients, soft cards, Bloop visuals, fonts, and spacing.
- Adaptation should feel like the app is listening, not interrogating.
- Do not ask medical or diagnostic questions at this stage.

## Screen Behavior

### Step 1: Need Selection

The user can choose any combination of:

- Self Love
- Goal Setting
- Cycle Tracking

Balanced Nutrition and Inner Harmony are premium-locked.

### Step 4: Emotional Wellness

The main question changes based on the combination:

- Cycle only: “How has your body felt lately?”
- Goal only: “What kind of support keeps you steady?”
- Self Love only: “How have you been feeling lately?”
- Self Love + Cycle: “How are your emotions moving with your body?”
- Goal + Cycle: “What rhythm do you want to build around your cycle?”
- Self Love + Goal: “What helps you feel cared for and consistent?”
- All three: “What does support need to feel like for you?”

Defaults are also tuned. Example: Self Love + Cycle starts with slightly higher stress and restless sleep because that path is likely to need more emotional-cycle support.

### Step 5: Personalization

The wellness card order changes to match the selected combination.

Examples:

- Self Love prioritizes Better Sleep, Stress Recovery, Mindful Routine.
- Goal Setting prioritizes Energy Balance, Hydration, Gentle Movement.
- Cycle Tracking prioritizes Energy Balance, Better Sleep, Hydration.
- Whole Rhythm prioritizes Better Sleep, Mindful Routine, Energy Balance.

## Future Extension

When Nutrition and Inner Harmony become available, add them as signals rather than rebuilding the flow. The same engine can expand from three signals to five signals by adding:

- `nutrition`: nourishment, cravings, hydration, hormone-supportive meals
- `inner_harmony`: meditation, mental health, grounding, inner stability

Until then, these remain locked for Soul Premium.
