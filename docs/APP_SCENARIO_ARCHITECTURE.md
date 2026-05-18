# MyStree Soul App Scenario Architecture

This document is the source of truth for user state, route access, emotional safety, interruption behavior, and future QA. It reflects the app as currently built: Expo Router, persisted Zustand auth/onboarding stores, a root route guard, onboarding flow, tab dashboard, Bloop companion routes, life-stage pages, and premium gates.

## 1. Core User States

### Anonymous User

Description:
User has installed/opened the app but has no valid auth session.

Current Signals:
- `authStore.isAuthenticated === false`
- `authStore.sessionExpiresAt === null` or expired

Allowed Routes:
- `/`
- `/welcome`
- `/login`
- `/register`

Blocked Routes:
- `/(onboarding)/*`
- `/(tabs)/*`
- `/bloop`
- `/bloop-chat`
- `/premium`
- `/notifications`
- `/settings`
- `/journal`
- `/grounding`
- life-stage pages

Expected Behavior:
- If an anonymous user opens a protected app route, redirect to `/login`.
- Use calm copy: “We paused your Soul securely. Please sign in again to continue.”

Current Implementation:
- `hooks/useRouteGuard.ts` handles protected onboarding, main tabs, and several secondary routes.
- Gap: `/bloop-chat`, `/grounding`, `/journal`, `/community`, and `/sleep` should be explicitly protected.

### Authenticated But Not Onboarded

Description:
User has a valid auth session but has not completed onboarding.

Current Signals:
- `hasValidAuthSession(authStore) === true`
- `onboardingStore.hasCompletedOnboarding === false`

Allowed Routes:
- `/(onboarding)/onboarding`
- `/(onboarding)/privacy-consent`
- `/(onboarding)/health-setup`
- `/(onboarding)/emotional-wellness`
- `/(onboarding)/personalization`
- `/(onboarding)/ready`
- `/settings` only if used for logout/help in future

Blocked Routes:
- `/(tabs)/*`
- `/bloop`
- `/bloop-chat`
- `/premium`
- `/notifications`
- `/journal`
- `/grounding`, except crisis/emotional emergency override

Expected Behavior:
- If user tries to open dashboard before onboarding completion, redirect to `/(onboarding)/onboarding`.
- Preserve all completed onboarding answers.
- Never restart onboarding silently.

Current Implementation:
- Route guard redirects protected app routes to `/(onboarding)/onboarding`.
- Gap: onboarding step progress is inferred by route and partial store values; no explicit `currentOnboardingStep` exists yet.

### Fully Active User

Description:
Authenticated user who completed onboarding.

Current Signals:
- Valid auth session
- `hasCompletedOnboarding === true`

Allowed Routes:
- `/(tabs)/dashboard`
- `/(tabs)/cycle`
- `/(tabs)/insights`
- `/(tabs)/wellness`
- `/(tabs)/nourish`
- `/(tabs)/sleep`
- `/(tabs)/community`
- `/(tabs)/profile`
- `/bloop`
- `/bloop-chat`
- `/notifications`
- `/settings`
- `/premium`
- `/journal`
- `/grounding`
- `/fertility`
- `/pregnancy`
- `/menopause`
- `/adolescence`

Expected Behavior:
- `/login`, `/register`, or completed onboarding pages should redirect to dashboard.
- Premium-locked content should route to `/premium`, not dead-end.

Current Implementation:
- Dashboard, tabs, profile, premium, life-stage pages, and companion routes exist.
- Gap: not every active-user route is represented in `secondarySegments`.

### Session Expired User

Description:
User previously had a session but `sessionExpiresAt <= Date.now()`.

Expected Behavior:
- Soft redirect to `/login`.
- Preserve intended destination in route params or a small pending-navigation state.
- Preserve unsent chat/journal text locally.
- Do not show a harsh “expired” alert.

Current Implementation:
- `authStore` stores `sessionExpiresAt`.
- `useRouteGuard()` calls `logout()` and redirects to `/login?reason=session`.

Gap:
- No pending route restoration.
- No unsent message preservation.

### Offline User

Description:
User has no network, or backend/API calls cannot complete.

Expected Behavior:
- App shell, cached dashboard, journal draft, cycle logs, and grounding must remain usable.
- Live AI, community posting, new premium purchase, and remote sync should degrade gracefully.
- Show `OfflineBanner`, not a blocking alert.

Current Implementation:
- `components/system/OfflineBanner.tsx` exists.
- Stores persist using SecureStore with memory fallback.

Gap:
- No global offline state store.
- No queued sync strategy for journal/onboarding/cycle logs.

### AI Rate Limited User

Description:
User is authenticated, but live AI response quota is exhausted or unavailable.

Expected Behavior:
- Bloop stays emotionally present using cached, non-diagnostic responses.
- Premium upsell should be gentle.
- No “AI failed” language.

Current Implementation:
- `/bloop-chat` is a local UI prototype.

Gap:
- No AI quota state, companion response cache, or fallback rules implemented yet.

### Premium Expired User

Description:
User previously had Soul Premium but no longer has an active entitlement.

Expected Behavior:
- Keep all basic wellness, dashboard, cycle logging, and safety features available.
- Lock only premium companion/features behind a soft premium sheet.
- Do not remove historical user data.

Current Implementation:
- `/premium` exists.
- Some cards route to `/premium`.

Gap:
- No entitlement store yet.
- No `premiumExpiresAt` or feature-level lock matrix.

### Pregnancy Mode User

Description:
User selected pregnancy as a life stage.

Expected Behavior:
- Pregnancy content is marked as V2.
- Dashboard should avoid active pregnancy tracking promises until V2 ships.
- AI and recommendations should avoid unsupported pregnancy guidance.

Current Implementation:
- `lifeStage: "pregnancy"` exists in `onboardingStore`.
- `/pregnancy` exists and copy says planned for V2.

Gap:
- Pregnancy is still selectable as a life stage; decide whether to hide, disable, or label as V2.

### Menopause Mode User

Description:
User selected menopause as life stage.

Expected Behavior:
- Dashboard, notifications, insights, and wellness recommendations should emphasize symptoms, sleep, cooling, stress, and hormone transition support.

Current Implementation:
- `/menopause` exists.
- `bloop-menopause-cooling.webp` and menopause assets exist.
- Dashboard has a life-stage module.

Gap:
- Dynamic tab naming and personalized recommendations are not fully wired.

### Teen User

Description:
User selected adolescence/teen support.

Expected Behavior:
- Copy should be educational, safe, non-sexualized, and privacy-forward.
- Community access should be restricted or moderated.

Current Implementation:
- `/adolescence` exists.
- Teen life stage exists in store.

Gap:
- No age/guardian/community safety logic.

### Distressed Emotional State User

Description:
User logs high stress, overwhelmed/anxious mood, or writes emotionally distressed chat/journal language.

Expected Behavior:
- Grounding should become top priority.
- Reduce visual intensity.
- Mute non-essential notifications.
- Offer “You are not alone” copy and Bloop support.
- Escalate to human/emergency support if self-harm/crisis intent is detected.

Current Implementation:
- `/grounding` exists.
- Dashboard stores stress and emotional state from onboarding.

Gap:
- No distress classifier, crisis-safe copy rules, or navigation override.

## 2. Route Protection Matrix

| Route | Auth Required | Onboarding Required | Premium Required | Offline Supported | Current Guard Status |
| --- | --- | --- | --- | --- | --- |
| `/` | No | No | No | Yes | Public |
| `/welcome` | No | No | No | Yes | Public |
| `/login` | No | No | No | Partial | Redirects if already active |
| `/register` | No | No | No | Partial | Redirects if already active |
| `/(onboarding)/onboarding` | Yes | No | No | Yes | Protected onboarding |
| `/(onboarding)/privacy-consent` | Yes | No | No | Yes | Protected onboarding |
| `/(onboarding)/health-setup` | Yes | No | No | Yes | Protected onboarding |
| `/(onboarding)/emotional-wellness` | Yes | No | No | Yes | Protected onboarding |
| `/(onboarding)/personalization` | Yes | No | No | Yes | Protected onboarding |
| `/(onboarding)/ready` | Yes | No | No | Yes | Protected onboarding |
| `/(tabs)/dashboard` | Yes | Yes | No | Cached | Guarded |
| `/(tabs)/cycle` | Yes | Yes | No | Yes | Guarded |
| `/(tabs)/insights` | Yes | Yes | No | Cached | Guarded |
| `/(tabs)/wellness` | Yes | Yes | No | Yes | Guarded |
| `/(tabs)/nourish` | Yes | Yes | No | Cached | Guarded |
| `/(tabs)/sleep` | Yes | Yes | No | Yes | Gap: route exists, guard tab set missing |
| `/(tabs)/community` | Yes | Yes | No | No | Gap: route exists, guard tab set missing |
| `/(tabs)/profile` | Yes | Yes | No | Cached | Guarded |
| `/bloop` | Yes | Yes | No | Cached | Guarded |
| `/bloop-chat` | Yes | Yes | Optional AI limits | Cached only | Gap: route exists, secondary guard missing |
| `/premium` | Yes | Yes | No | Cached | Guarded |
| `/notifications` | Yes | Yes | No | Cached | Guarded |
| `/settings` | Yes | Yes | No | Yes | Guarded |
| `/journal` | Yes | Yes | No | Yes | Gap: secondary guard missing |
| `/grounding` | Yes | No in emergency | No | Yes | Gap: secondary guard missing |
| `/fertility` | Yes | Yes | No | Cached | Guarded |
| `/pregnancy` | Yes | Yes | No | Cached | Guarded, V2 content |
| `/menopause` | Yes | Yes | No | Cached | Guarded |
| `/adolescence` | Yes | Yes | No | Cached | Guarded |

Guard Update Required:
- Add `sleep` and `community` to `tabSegments`.
- Add `bloop-chat`, `journal`, and `grounding` to `secondarySegments`.
- Decide whether `/grounding` is allowed for authenticated-not-onboarded users in distress.

## 3. Navigation Source Mapping

### `/welcome`

Can Open From:
- Splash `/`
- Logout
- Session reset

Can Exit To:
- `/login`
- `/register`
- `/(tabs)/dashboard` if already fully active

### `/login`

Can Open From:
- `/welcome`
- Session expired redirect
- Protected route access while anonymous

Can Exit To:
- `/(onboarding)/onboarding` after login if onboarding incomplete
- `/(tabs)/dashboard` after login if onboarding complete

### `/(onboarding)/onboarding`

Can Open From:
- Register success
- Login success for incomplete user
- Protected route redirect

Can Exit To:
- `privacy-consent`
- Logout/login in future

### `/(onboarding)/privacy-consent`

Can Open From:
- Onboarding goals step

Can Exit To:
- `health-setup`
- Back to onboarding goals

Product Rule:
- Client requested this screen should not be mandatory; current implementation still writes consent before continuing. Needs decision.

### `/(onboarding)/health-setup`

Can Open From:
- Privacy step

Can Exit To:
- `emotional-wellness`

State Written:
- `lifeStage`

### `/(onboarding)/emotional-wellness`

Can Open From:
- Health setup

Can Exit To:
- `personalization`

State Written:
- `emotionalState`
- `stressLevel`
- `sleepScore`

### `/(onboarding)/personalization`

Can Open From:
- Emotional wellness

Can Exit To:
- `ready`

State Written:
- selected wellness goals and personalization preferences

### `/(onboarding)/ready`

Can Open From:
- Personalization

Can Exit To:
- `/(tabs)/dashboard`

State Written:
- `hasCompletedOnboarding`

### `/(tabs)/dashboard`

Can Open From:
- Completed onboarding
- Login return
- Tab bar
- Notifications
- Back fallback

Can Exit To:
- Cycle, insights, wellness, nourish, profile
- `/bloop-chat` via center Bloop button
- `/premium`
- life-stage pages
- `/notifications`

### `/(tabs)/cycle`

Can Open From:
- Dashboard cycle card
- Tab bar
- Notification
- Onboarding life-stage context

Can Exit To:
- Daily log sheet
- Dashboard
- Insights in future

### `/(tabs)/wellness`

Can Open From:
- Tab bar
- Dashboard wellness shortcut
- Notification
- Bloop suggestion

Can Exit To:
- Grounding
- Journal
- Premium
- Dashboard

### `/grounding`

Can Open From:
- Wellness tab
- Bloop distress detection
- Notification
- Dashboard SOS/support card in future

Can Exit To:
- Previous route
- Dashboard
- Bloop chat

Priority Rule:
- Grounding should override normal navigation when distress is detected.

### `/bloop-chat`

Can Open From:
- Floating Bloop tab button
- Bloop screen
- Notification
- Dashboard mental health card in future

Can Exit To:
- Previous route
- `/grounding`
- `/premium`
- `/journal`

### `/premium`

Can Open From:
- Locked companion cards
- Mental Health Hub card
- Premium Access profile card
- Premium notification
- Program cards

Can Exit To:
- Previous route
- Profile
- Dashboard

### `/journal`

Can Open From:
- Wellness
- Bloop chat
- Notification

Can Exit To:
- Previous route
- Dashboard
- Insights in future

## 4. Interruption Scenarios

### Scenario: App Closes During Onboarding

Expected:
- Reopen to the most recent incomplete onboarding step.
- Preserve answers already written to Zustand.
- Never restart from the first screen if meaningful progress exists.

Current:
- Persisted answers survive.
- No explicit step cursor exists.

Action:
- Add `onboardingStep` or derive next step from required fields:
  - no selected goals -> onboarding
  - no consent decision -> privacy
  - no life stage -> health setup
  - default emotional values unchanged -> emotional wellness
  - no personalization profile -> personalization
  - all complete -> ready/dashboard

### Scenario: User Closes App On Privacy Screen

Expected:
- Reopen to privacy screen or next incomplete step.
- Since privacy is intended non-mandatory, user should be able to continue with `consentAcceptedAt === null` plus `privacySkippedAt`.

Current:
- Consent is accepted before continuing.

Action:
- Add `privacyChoice: "accepted" | "skipped" | null`.

### Scenario: Session Expires During Bloop Chat

Expected:
- Preserve unsent message.
- Show soft session sheet.
- Redirect to `/login`.
- After re-auth, restore `/bloop-chat` and draft.

Current:
- Guard logs user out and redirects to login.

Action:
- Add `pendingRoute` to auth/navigation store.
- Add `draftMessage` to future companion store.

### Scenario: User Loses Internet During Journal Save

Expected:
- Save locally.
- Show “Saved on your device. We’ll sync when you’re back online.”
- Queue sync.

Current:
- Journal screen exists; no queue documented in code.

Action:
- Add `syncQueueStore`.

### Scenario: User Opens Premium While Offline

Expected:
- Show cached Soul Premium page.
- Disable purchase action.
- Keep benefit explanation visible.

Current:
- `/premium` is local UI; no purchase connection.

Action:
- Add offline-aware purchase CTA state.

### Scenario: User Logs High Stress Then Opens Dashboard

Expected:
- Dashboard surfaces grounding, calming activity, or Bloop support.
- Avoid celebratory language if user is distressed.

Current:
- Dashboard reads `stressLevel` and `emotionalState`.

Action:
- Add distress thresholds and dashboard priority module.

### Scenario: User Changes Life Stage After Onboarding

Expected:
- Confirm the change.
- Update dashboard modules, AI tone, notifications, recommendations, and dynamic tab labels.
- Keep historical data visible, but contextualize it.

Current:
- Life stage exists in store.
- Settings/profile change flow not defined.

Action:
- Add life-stage change sheet and transition rules.

## 5. Emotional UX Failure Prevention

### Emotional Safety Rules

Never Show:
- Harsh red full-screen errors.
- “Invalid”, “failed”, “expired”, “denied” as the first word.
- Blank screens after failed loading.
- Aggressive logout messages.
- Overconfident medical conclusions.

Use:
- Calm sheets.
- Soft recovery prompts.
- Cached content.
- Gentle Bloop support copy.
- Clear next action.

Copy Examples:

Bad:
- “Session expired.”
- “Error saving.”
- “AI unavailable.”
- “You cannot access this.”

Good:
- “We paused your Soul securely. Please sign in again to continue.”
- “Your note is safe on this device. We’ll sync it when connection returns.”
- “Bloop needs a quiet minute. Here’s a saved grounding reset for now.”
- “This is part of Soul Premium. You can keep using your free care tools.”

Distress Rules:
- If a user expresses panic, grief, self-harm, or feeling unsafe, reduce choices.
- Primary CTA should be grounding/support, not upsell.
- Bloop tone should be brief, warm, and non-diagnostic.

## 6. Companion Logic Scenarios

### Companion Selection Rules

Current Companions:
- Bloop: default wellness companion.
- Jiggy: emotional support, locked/premium in dashboard.
- Manchi: psychology support, locked/premium in dashboard.
- Yogi: movement support, locked/premium in dashboard.

Rules:
- If no companion selected, default to Bloop.
- Selected companion should persist globally.
- Locked companions route to `/premium`.
- If premium expires, selected locked companion becomes read-only teaser and Bloop resumes default active role.

Recommended Store:

```ts
type CompanionId = "bloop" | "jiggy" | "manchi" | "yogi";

interface CompanionState {
  selectedCompanion: CompanionId;
  companionTone: "soft" | "playful" | "grounding" | "clinical-lite";
  emotionalState: string;
  lastInteractionAt: string | null;
  preferredVoice: string | null;
  aiAvailability: "live" | "cached" | "rate_limited" | "offline";
  draftMessage: string;
}
```

### Companion Emotional Modes

Detected Stress:
- Suggest grounding.
- Use shorter responses.
- Avoid too many cards.

Late-Night Usage:
- Softer UI mode.
- Sleep recovery prompts.
- No intense goal language.

Cycle Pain Logged:
- Validate discomfort.
- Suggest warmth, hydration, breath, gentle movement.
- Avoid medical certainty.

AI Unavailable:
- Show cached Bloop responses.
- Keep companion UI alive.
- Do not show a technical error.

## 7. Life Stage Dynamic Routing

### Dynamic Life Stage System

| User Stage | Current Route | Future Dynamic Tab Label | Dashboard Priority |
| --- | --- | --- | --- |
| Normal cycle/fertility | `/fertility`, `/(tabs)/cycle` | Cycle | Next period, symptoms, fertility window |
| Pregnancy | `/pregnancy` | Weeks | V2 notice, safe transition copy |
| Menopause | `/menopause` | Symptoms | Cooling, sleep, stress, hormones |
| Teen | `/adolescence` | Learn | Safety, education, privacy |

Changing Life Stage Updates:
- Dashboard widgets.
- AI companion tone.
- Wellness recommendations.
- Push notification categories.
- Tab labels.
- Insights framing.
- Safety rules.

Current Implementation:
- `lifeStage` is persisted in `onboardingStore`.
- Dashboard conditionally shows life-stage module.
- Dedicated life-stage pages exist.

Gap:
- Tab label is static.
- Notification and AI tone do not yet branch by life stage.
- Pregnancy should be treated as V2.

## 8. Notification Deep Link Scenarios

Current Route:
- `/notifications` exists with local notification UI.

Planned Deep Links:

| Notification | Tap Route | Required State |
| --- | --- | --- |
| “How is your Mood Today?” | `/(tabs)/dashboard?quickLog=mood` | Active user |
| “Your mood pattern changed” | `/(tabs)/insights?section=mood` | Active user |
| “Time for breathing” | `/grounding?source=notification` | Authenticated; onboarding optional if distress |
| “Your next period is close” | `/(tabs)/cycle?focus=next-period` | Active cycle user |
| “Sleep reset is ready” | `/(tabs)/sleep` or `/(tabs)/wellness?focus=sleep` | Active user |
| “Bloop has a note for you” | `/bloop-chat?source=notification` | Active user |
| “Soul Premium offer” | `/premium?source=notification` | Active user |
| “Hydration reminder” | `/(tabs)/nourish?focus=hydration` | Active user |

Rules:
- If anonymous, route to `/login` first and preserve intended link.
- If authenticated but onboarding incomplete, route to onboarding unless deep link is grounding/safety.
- If offline, show cached target or recovery sheet.

## 9. Offline & Hydration Rules

### Hydration Rules

Route guard must wait until:
- Root navigation state is ready.
- `authStore.persist.hasHydrated() === true`.
- `onboardingStore.persist.hasHydrated() === true`.
- Future companion/premium/offline stores have hydrated.

Current Implementation:
- `useRouteGuard()` waits for auth and onboarding hydration.

Required Future Hydration:
- `companionStore`
- `premiumStore`
- `networkStore`
- `syncQueueStore`
- `notificationIntentStore`

### Offline Behavior

Available Offline:
- Cached dashboard.
- Cycle screen and local daily log.
- Journal draft and local entries.
- Grounding.
- Wellness static exercises.
- Profile cached view.
- Settings basic logout/help.

Unavailable or Limited Offline:
- Live AI chat.
- Community feed/posting.
- Premium purchase/restore.
- Remote insight refresh.
- Push notification preference sync.

Offline UI Rules:
- Use `OfflineBanner`.
- Never block safe support tools.
- Queue writes and show local confirmation.

## 10. Error Recovery System

### API Failure

Expected:
- Never blank screen.
- Show cached content.
- Preserve navigation state.
- Provide one clear retry action.

### Onboarding Save Failure

Expected:
- Save locally first.
- Continue user forward.
- Queue sync later.

### Auth Failure

Expected:
- Keep user on login/register.
- Use kind copy.
- Avoid leaking technical details.

### Image Load Failure

Expected:
- Use icon fallback or soft gradient placeholder.
- Do not collapse card layout.

### AI Failure

Expected:
- Swap to cached companion mode.
- Offer grounding/journal.
- Avoid “AI failed”.

### Route Not Found

Expected:
- Redirect active users to dashboard.
- Redirect anonymous users to welcome/login.
- Log route name for QA.

## 11. QA Testing Checklist

### Auth And Guard

- [ ] Open dashboard while anonymous.
- [ ] Open `/bloop-chat` while anonymous.
- [ ] Open `/journal` while anonymous.
- [ ] Open `/grounding` while anonymous.
- [ ] Open login while already authenticated and onboarded.
- [ ] Open register while already authenticated but not onboarded.
- [ ] Expire session while on dashboard.
- [ ] Expire session while on Bloop chat with unsent text.

### Onboarding

- [ ] Close app on onboarding goals.
- [ ] Close app on privacy consent.
- [ ] Close app on health setup after selecting life stage.
- [ ] Close app on emotional wellness after selecting mood.
- [ ] Reopen after completing ready screen.
- [ ] Try selecting locked onboarding feature.
- [ ] Skip privacy once skip logic exists.

### Tabs And Navigation

- [ ] Tap every bottom tab.
- [ ] Center Bloop button opens `/bloop-chat`.
- [ ] Back from `/premium` returns to source card.
- [ ] Back from life-stage page returns to dashboard.
- [ ] Community and sleep routes load or are intentionally hidden.
- [ ] No more than five visible tabs after final navigation decision.

### Emotional Safety

- [ ] High stress state surfaces grounding.
- [ ] Bloop distress copy is short and soft.
- [ ] Offline Bloop shows cached response.
- [ ] Grounding can be opened from notification.
- [ ] No harsh red error appears during failed save.

### Offline

- [ ] Login while offline.
- [ ] Reopen app offline after active session.
- [ ] Save journal offline.
- [ ] Save cycle log offline.
- [ ] Open premium offline.
- [ ] Open community offline.

### Life Stage

- [ ] Teen user sees education-safe content.
- [ ] Cycle/fertility user sees cycle module.
- [ ] Pregnancy user sees V2-safe messaging.
- [ ] Menopause user sees menopause module.
- [ ] Change life stage after onboarding once implemented.

### Deep Links

- [ ] Notification to mood check-in.
- [ ] Notification to breathing/grounding.
- [ ] Notification to Bloop chat.
- [ ] Notification to premium.
- [ ] Notification while anonymous.
- [ ] Notification while onboarding incomplete.

## 12. Current Architecture Risks

### Risk 1: Too Many Tabs

Current tab files:
- dashboard
- cycle
- insights
- wellness
- nourish
- sleep
- community
- profile

Recommendation:
- Keep max five visible tabs.
- Preferred visible tabs:
  - dashboard
  - cycle/dynamic life-stage tab
  - insights
  - wellness
  - profile
- Move nourish, sleep, and community into dashboard cards, wellness subroutes, or expandable hubs.

Current Contradiction:
- `app/(tabs)/_layout.tsx` includes `sleep` and `community`.
- `hooks/useRouteGuard.ts` tab set currently omits `sleep` and `community`.

### Risk 2: Companion Architecture Will Become Complex

Current:
- Companion UI exists in dashboard and Bloop routes.
- No companion store exists.

Recommendation:
- Create `store/companionStore.ts`.
- Store selected companion, tone, last interaction, draft message, AI availability, and voice preference.

### Risk 3: Community Needs Safety Rules

Current:
- `/(tabs)/community.tsx` exists.

Recommendation:
- Create `docs/COMMUNITY_SAFETY_RULES.md`.
- Include anonymous posting, reporting, trigger warnings, misinformation handling, moderation, crisis escalation, and blocked content.

### Risk 4: Grounding Must Override Normal Navigation

Current:
- `/grounding` exists.

Recommendation:
- Treat grounding as a priority route or modal.
- Distress state should reduce visual stimulation, mute non-essential notifications, and simplify exits.

### Risk 5: Guard Lists Can Drift From Routes

Current:
- Guard route lists are manually maintained.

Recommendation:
- Centralize route metadata in `constants/routePolicy.ts`.
- Generate guard decisions and QA matrix from one object.

## 13. Recommended Next Architecture Files

Create these after this document:

- `docs/STATE_MANAGEMENT_RULES.md`
- `docs/NAVIGATION_GUARD_RULES.md`
- `docs/EMOTIONAL_UX_RULES.md`
- `docs/COMMUNITY_SAFETY_RULES.md`

Suggested build order:
1. `NAVIGATION_GUARD_RULES.md`
2. `STATE_MANAGEMENT_RULES.md`
3. `EMOTIONAL_UX_RULES.md`
4. `COMMUNITY_SAFETY_RULES.md`

## 14. Immediate Engineering Actions

1. Update `useRouteGuard()`:
   - Add `sleep`, `community` to tab segments or remove them from visible tabs.
   - Add `bloop-chat`, `journal`, `grounding` to secondary protected routes.

2. Add explicit onboarding progress:
   - `currentOnboardingStep`
   - `privacyChoice`
   - `lastOnboardingRoute`

3. Add companion store:
   - selected companion
   - companion tone
   - draft message
   - AI availability

4. Add premium entitlement store:
   - `isPremium`
   - `premiumExpiresAt`
   - locked feature map

5. Add network/offline store:
   - `isOnline`
   - `lastSyncAt`
   - queued writes

6. Add deep link intent store:
   - pending route
   - source notification
   - restore behavior after login/onboarding
