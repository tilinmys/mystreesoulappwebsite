# Navigation Guard Rules

This document converts `APP_SCENARIO_ARCHITECTURE.md` into route guard rules for Expo Router.

## Guard Inputs

The guard must read:
- Auth hydration: `useAuthStore.persist.hasHydrated()`
- Onboarding hydration: `useOnboardingStore.persist.hasHydrated()`
- Root navigation readiness: `useRootNavigationState().key`
- Auth session: `isAuthenticated`, `sessionExpiresAt`
- Onboarding completion: `hasCompletedOnboarding`
- Current route segments from `useSegments()`

No redirect should happen until all required stores are hydrated.

## Route Groups

### Anonymous Routes

Allowed without auth:
- `/`
- `/welcome`
- `/login`
- `/register`

### Onboarding Routes

Require valid auth session, but not completed onboarding:
- `/(onboarding)/onboarding`
- `/(onboarding)/privacy-consent`
- `/(onboarding)/health-setup`
- `/(onboarding)/emotional-wellness`
- `/(onboarding)/personalization`
- `/(onboarding)/ready`

### Protected Tabs

Require valid auth session and completed onboarding:
- `/(tabs)/dashboard`
- `/(tabs)/cycle`
- `/(tabs)/insights`
- `/(tabs)/wellness`
- `/(tabs)/nourish`
- `/(tabs)/sleep`
- `/(tabs)/community`
- `/(tabs)/profile`

### Protected Push Routes

Require valid auth session and completed onboarding:
- `/bloop`
- `/bloop-chat`
- `/grounding`
- `/premium`
- `/settings`
- `/notifications`
- `/journal`
- `/fertility`
- `/pregnancy`
- `/menopause`
- `/adolescence`

## Redirect Rules

1. If stores are not hydrated, do nothing.
2. If anonymous user opens protected app/onboarding route, redirect to `/login`.
3. Include `redirectTo` for protected app routes so login can restore the intended route.
4. If authenticated user opens `/login` or `/register`, redirect:
   - to `redirectTo` when onboarding is complete and route is safe
   - otherwise to dashboard
   - or to onboarding if onboarding is incomplete
5. If authenticated user has not completed onboarding and opens protected app route, redirect to `/(onboarding)/onboarding`.
6. If authenticated user has completed onboarding and opens onboarding route, redirect to dashboard.
7. If active user opens `/welcome`, redirect to dashboard.

## Loop Prevention

Never call `router.replace()` when already on the target route.

Never redirect from:
- `/login` to `/login`
- `/(onboarding)/onboarding` to itself
- `/(tabs)/dashboard` to itself

## Intended Route Restoration

When anonymous user opens a protected app route:

```txt
/bloop-chat -> /login?reason=session&redirectTo=/bloop-chat
```

After login:
- If onboarding complete, restore `redirectTo`.
- If onboarding incomplete, send to onboarding.
- If `redirectTo` is unsafe or auth-only public route, ignore it.

## Current Notes

Grounding is currently protected like other push routes. Future distress/crisis logic may allow authenticated-but-not-onboarded users to open grounding before onboarding is complete.

