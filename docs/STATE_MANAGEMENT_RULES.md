# State Management Rules

This document defines the current and planned Zustand state boundaries for MyStree Soul.

## Existing Stores

### `store/authStore.ts`

Owns:
- `email`
- `isAuthenticated`
- `sessionExpiresAt`
- `login`
- `register`
- `logout`
- `refreshSession`

Rules:
- Session validity is based on `sessionExpiresAt > Date.now()`.
- Persist only auth data needed for session restoration.
- If session is invalid during rehydration, treat user as anonymous.
- Auth store must hydrate before route guard redirects.

### `store/onboardingStore.ts`

Owns:
- `consentAcceptedAt`
- `hasCompletedOnboarding`
- `name`
- `selectedGoals`
- `lifeStage`
- `stressLevel`
- `sleepScore`
- `emotionalState`

Rules:
- Onboarding store must hydrate before route guard redirects.
- Do not mark onboarding complete until the ready/final step succeeds.
- Persist partial onboarding answers.
- Do not rename existing fields without migration.

## Required Future Stores

### `store/navigationIntentStore.ts`

Purpose:
- Preserve intended route after login/session expiry.
- Preserve notification deep link target.

Suggested fields:

```ts
pendingRoute: string | null;
pendingRouteReason: "session" | "notification" | "guard" | null;
lastSafeRoute: string | null;
```

### `store/companionStore.ts`

Purpose:
- Keep Bloop/Jiggy/Manchi/Yogi behavior consistent.

Suggested fields:

```ts
selectedCompanion: "bloop" | "jiggy" | "manchi" | "yogi";
companionTone: "soft" | "playful" | "grounding" | "clinical-lite";
aiAvailability: "live" | "cached" | "rate_limited" | "offline";
draftMessage: string;
lastInteractionAt: string | null;
preferredVoice: string | null;
```

### `store/premiumStore.ts`

Purpose:
- Enforce Soul Premium access.

Suggested fields:

```ts
isPremium: boolean;
premiumExpiresAt: number | null;
lockedFeatureIds: string[];
lastEntitlementCheckAt: string | null;
```

### `store/networkStore.ts`

Purpose:
- Centralize offline behavior.

Suggested fields:

```ts
isOnline: boolean;
lastOnlineAt: string | null;
syncStatus: "idle" | "syncing" | "failed";
```

### `store/syncQueueStore.ts`

Purpose:
- Queue offline writes for journal, cycle logs, onboarding updates, and companion events.

Suggested fields:

```ts
queuedWrites: Array<{
  id: string;
  type: "journal" | "cycle_log" | "onboarding" | "companion";
  payload: unknown;
  createdAt: string;
}>;
```

## Hydration Rules

Before route enforcement:
- Auth store must hydrate.
- Onboarding store must hydrate.
- Future navigation intent store should hydrate.
- Future premium and companion stores should hydrate before premium/AI route decisions.

While hydration is incomplete:
- Do not redirect.
- Do not reset user state.
- Keep splash/loading UI calm.

## State Collision Rules

- Auth logout must not erase onboarding unless user explicitly resets account.
- Registration should reset onboarding for the new session.
- Premium expiry must not delete companion history.
- Life-stage changes must not delete past cycle/journal history.
- Offline queued writes must not overwrite newer remote data without conflict handling.

