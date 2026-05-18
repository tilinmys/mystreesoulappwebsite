# Onboarding Three Combination Plan

This document defines the three active onboarding paths for the current MyStree Soul flow. Balanced and Inner Harmony remain locked for Soul Premium, so the base experience should adapt around the three available needs only.

## Active Paths

| Path | Trigger | Product Promise | Primary Data Needed |
| --- | --- | --- | --- |
| Self-love | User selects `self_love` | Emotional care, reassurance, and mood support | mood baseline, stress level, sleep quality, support tone |
| Goal setter | User selects `goal_setting` | Small wins, habits, and consistency | wellness goal, reminder preference, routine style, motivation blocker |
| Cycle tracking | User selects `cycle` | Cycle-aware insights, symptoms, and body rhythm | period dates, cycle length, flow pattern, symptoms, pain, PMS, fertility intent |

If the user selects multiple available needs, use this priority order for the next question set:

1. Cycle tracking if `cycle` is selected.
2. Self-love if `self_love` is selected.
3. Goal setter if `goal_setting` is selected.

This keeps onboarding short while still collecting the highest-impact data first.

## Cycle Tracking Data Questions

Ask only what is needed to tailor the first experience. Keep the UI in the same soft card/grid style.

| Question | Input Type | Why It Matters |
| --- | --- | --- |
| When did your last period start? | date picker or compact date chips | predicts next period and current cycle day |
| How long does your period usually last? | 3 to 8 day chips | estimates bleeding window |
| How long is your usual cycle? | 21 to 35 day chips, with “not sure” | estimates next period and phase |
| How is your flow usually? | light, medium, heavy, spotting | personalizes log defaults |
| What symptoms show up most? | multi-select chips | powers cycle-synced care cards |
| Do you want fertility-aware guidance? | yes, maybe, no | avoids irrelevant fertility content |
| What support do you want around your cycle? | cramps, mood, energy, sleep, planning | drives recommendations |

## Screen Mapping

### What Do You Need Today

Keep five cards visible, but only three selectable:

- Self-love
- Goal setter
- Cycle Tracking

Locked:

- Balanced
- Inner Harmony

Compact rule: the user should see the first two rows and the Cycle Tracking card without excessive scrolling on a standard phone.

### Tell Us About Yourself

Keep the current design. The life-stage cards should use both image and icon cues:

- Teen: supportive person or heart icon
- Cycle & Fertility: calendar-heart or cycle icon
- Pregnancy: pregnancy icon
- Menopause: sunset or cooling icon

### Privacy

Keep the same privacy design, but the hero should take only the top third of the page. The main value is user consent, so the toggle card should appear sooner.

## Adaptation Rules

- Locked cards never modify onboarding state.
- Cycle Tracking selection unlocks the cycle data questions.
- Self-love selection makes emotional wellness defaults softer and more reassuring.
- Goal setter selection makes personalization defaults more routine and progress oriented.
- Multiple selections should not create a longer onboarding flow by default. Ask the most important branch first, then collect secondary preference through one compact card.

## QA Checklist

- [ ] Locked cards cannot be selected.
- [ ] Goal setter uses a goal/target icon, not a star.
- [ ] Privacy toggles appear without heavy scrolling.
- [ ] Cycle path collects period start date, period length, cycle length, flow, symptoms, and fertility intent.
- [ ] Multi-selection follows the priority order without breaking visual layout.
