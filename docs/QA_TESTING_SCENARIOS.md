# QA Testing Scenarios

Use this checklist after route guard, auth, onboarding, or state persistence changes.

## Auth Guard

- [ ] Open `/login` while anonymous.
- [ ] Open `/register` while anonymous.
- [ ] Open `/(tabs)/dashboard` while anonymous.
- [ ] Open `/(tabs)/sleep` while anonymous.
- [ ] Open `/(tabs)/community` while anonymous.
- [ ] Open `/bloop-chat` while anonymous.
- [ ] Open `/grounding` while anonymous.
- [ ] Open `/journal` while anonymous.
- [ ] Confirm protected anonymous access redirects to `/login`.
- [ ] Confirm login after protected redirect restores intended route when onboarding is complete.

## Onboarding Guard

- [ ] Register new user and confirm redirect to `/(onboarding)/onboarding`.
- [ ] Authenticated incomplete user opens dashboard and is redirected to onboarding.
- [ ] Authenticated incomplete user opens `/premium` and is redirected to onboarding.
- [ ] Complete onboarding and confirm dashboard opens.
- [ ] Completed user opens onboarding route and is redirected to dashboard.
- [ ] Close app during each onboarding step and verify persisted answers remain.

## Session Expiry

- [ ] Set `sessionExpiresAt` in the past and open dashboard.
- [ ] Set `sessionExpiresAt` in the past and open `/bloop-chat`.
- [ ] Confirm logout state clears auth session.
- [ ] Confirm login copy is soft and not harsh.
- [ ] Confirm no redirect loop between login and dashboard.

## Tab Routes

- [ ] Dashboard tab loads.
- [ ] Cycle tab loads.
- [ ] Insights tab loads.
- [ ] Wellness tab loads.
- [ ] Nourish tab loads.
- [ ] Sleep tab loads.
- [ ] Community tab loads.
- [ ] Profile tab loads.
- [ ] Floating Bloop button opens `/bloop-chat`.

## Push Routes

- [ ] `/bloop` loads for active user.
- [ ] `/bloop-chat` loads for active user.
- [ ] `/grounding` loads for active user.
- [ ] `/premium` loads for active user.
- [ ] `/settings` loads for active user.
- [ ] `/notifications` loads for active user.
- [ ] `/journal` loads for active user.
- [ ] `/fertility` loads for active user.
- [ ] `/pregnancy` loads and clearly says V2.
- [ ] `/menopause` loads for active user.
- [ ] `/adolescence` loads for active user.

## Offline And Hydration

- [ ] Cold start with persisted completed onboarding.
- [ ] Cold start with persisted incomplete onboarding.
- [ ] Cold start with expired auth session.
- [ ] Simulate SecureStore failure and confirm memory fallback avoids crash.
- [ ] Disable network and open cached dashboard.
- [ ] Disable network and open grounding.
- [ ] Disable network and attempt future journal save.

## Emotional Safety

- [ ] High stress state does not trigger harsh UI.
- [ ] Bloop chat fallback does not say “AI failed”.
- [ ] Grounding route remains simple and low-stimulation.
- [ ] Premium lock copy is gentle.
- [ ] Session expiry copy says “Please sign in again to continue.”

## Regression Commands

Run after changes:

```bash
npm run typecheck
```

Recommended manual app restart after guard changes:

```bash
npx expo start -c
```

