# MyStree Soul — Design System

MyStree Soul is a women's wellness app built on warmth, trust, and quiet intelligence. Every design decision must feel calm, premium, and deeply personal — never clinical, never loud, never generic. The visual language is soft terracotta meets editorial serif meets gentle motion.

---

## Brand Identity

The app speaks to women who want to understand their bodies without being talked down to. The tone is like a knowledgeable friend, not a medical form. Visuals should feel like a beautifully printed wellness journal — warm paper textures, ink-dark type, terracotta accents, botanical details. Bloop, the AI companion character, is the emotional anchor of the experience and should appear on key screens to create warmth and familiarity.

---

## Color Palette

### Primary Colors

| Token | Hex | Use |
|---|---|---|
| `background` | `#FAF9F6` | App-wide background, warm off-white |
| `background-splash` | `#FBF8F5` | Splash and welcome screens |
| `text` | `#2B2D42` | All primary text, headings |
| `muted` | `#6B708D` | Secondary text, labels, captions |
| `terracotta` | `#E07A5F` | Primary accent — CTAs, active states, icons |
| `sage` | `#81B29A` | Secondary accent — online dots, success states |
| `peach` | `#F4A261` | Tertiary accent — nourish feature, warm highlights |
| `lavender` | `#BDB2FF` | Quaternary accent — AI insights, premium features |
| `sand` | `#E7D8C9` | Borders, dividers, card backgrounds |
| `rose` | `#D7A6A1` | Soft feminine accents, mood indicators |
| `coral` | `#D97A72` | Coral variant — symptom chips, secondary indicators |

### Semantic Colors

| Token | Value | Use |
|---|---|---|
| `card` | `rgba(250,249,246,0.74)` | Frosted glass cards |
| `border` | `rgba(255,255,255,0.82)` | Card borders, subtle dividers |
| `terracotta-tint-10` | `rgba(224,122,95,0.10)` | Cycle tag background |
| `sage-tint-12` | `rgba(129,178,154,0.12)` | Mood tag background |
| `lavender-tint-14` | `rgba(189,178,255,0.14)` | AI tag background |
| `peach-tint-12` | `rgba(244,162,97,0.12)` | Nourish tag background |

### Gradient Palettes

**Welcome screen background:** `["#FBF8F5", "#F9EDE6", "#EDE5F5"]` — warm cream fading to peach-rose to soft lavender.

**Primary CTA button:** `["#E07A5F", "#F4A261"]` — terracotta to peach, left to right.

**Bloop floating button:** `["#FFF8F5", "#FFE7D6", "#E8F1E7"]` — ivory to peach to sage, diagonal.

**Onboarding screens:** `["#FAF9F6", "#FFF0E8", "#EDE0FA"]` — warm cream to soft orange to lilac.

Never use cool blue-to-purple gradients. Never use black backgrounds except for premium locked cards. Always derive gradient endpoints from the palette above.

---

## Typography

### Font Family

The app uses **Playfair Display** exclusively for all display, heading, and editorial text. This is loaded locally from `assets/fonts/` via `Font.loadAsync` in `app/_layout.tsx`.

| Weight | File | Use |
|---|---|---|
| `PlayfairDisplay_800ExtraBold` | `PlayfairDisplay_800ExtraBold.ttf` | Hero titles, screen titles, splash wordmark (iOS) |
| `PlayfairDisplay_700Bold` | `PlayfairDisplay_700Bold.ttf` | Section headers, card titles, CTA labels (Android + fallback) |
| `PlayfairDisplay_400Regular_Italic` | `PlayfairDisplay_400Regular_Italic.ttf` | Taglines, subtitles, descriptive copy, trust text |

On iOS use `PlayfairDisplay_800ExtraBold`. On Android use `PlayfairDisplay_700Bold` as the heavy weight (ExtraBold renders inconsistently on some Android devices).

System font is used for body copy, captions, form inputs, and labels.

### Type Scale

| Role | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| Hero Title | 34px | 40px | ExtraBold | Splash wordmark, welcome headline |
| Screen Title | 28px | 34px | Bold/ExtraBold | Onboarding headers, dashboard greeting |
| Section Title | 23px | 29px | Bold | Card headers, section labels |
| Body | 14px | 20px | 700 (system) | Descriptions, card body copy |
| Caption | 12px | 16px | 800 (system) | Tags, chips, badge labels |
| Tagline | 13px | 18px | Italic | Splash tagline, trust copy |

Letter spacing on the splash tagline is `2.2` for an editorial, spaced-out feel. Hero titles use `0.4–0.6` letter spacing.

---

## Spacing System

All spacing is derived from `constants/spacing.ts`.

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | Icon-to-label gaps, micro padding |
| `sm` | 8px | Inner card padding, chip gaps |
| `md` | 16px | Standard component padding |
| `lg` | 24px | Section gaps, horizontal screen padding |
| `xl` | 32px | Large section spacing, top/bottom screen padding |
| `xxl` | 48px | Hero section vertical breathing room |
| `side` | 24px | Horizontal screen edge padding (consistent across all screens) |
| `minTouch` | 44px | Minimum tappable height for all interactive elements |

### Border Radius

| Token | Value | Use |
|---|---|---|
| `radiusLg` | 24px | Standard cards, input fields |
| `radiusXl` | 28px | Large cards, bottom sheets |
| `radiusXXl` | 32px | Feature cards, hero containers |
| Full pill | 999px | Tags, chips, badges, CTAs |
| Logo card | 50px | App icon / logo container |

---

## Animation Principles

All animations use React Native `Animated` API with `useNativeDriver: true` on every transform and opacity animation. Never animate layout properties (width, height, padding, margin) — only `transform` and `opacity`.

### Easing Vocabulary

| Use case | Easing | Duration |
|---|---|---|
| Fade-in entrance | `Easing.out(Easing.cubic)` | 460–680ms |
| Slide-up entrance | `Easing.out(Easing.cubic)` | 460–560ms |
| Spring pop | `spring({ tension: 52, friction: 8 })` | Physics-based |
| Heartbeat scale up | `Easing.out(Easing.quad)` | 190–200ms |
| Heartbeat release | `Easing.inOut(Easing.ease)` | 260–280ms |
| Continuous float loop | `Easing.inOut(Easing.ease)` | 2800ms per direction |
| Pulsing dot loop | `Easing.inOut(Easing.ease)` | 500ms per direction |
| Halo breathe loop | `Easing.inOut(Easing.ease)` | 3200ms per direction |

Never use `linear` easing on UI elements. Linear is only appropriate for loading progress bars.

### Stagger Pattern

All multi-element entrance animations use `Animated.stagger(110, [...])`. Each stage triggers 110ms after the previous. The standard order is: hero image → companion badge → headline text → feature tags → CTAs → trust line.

### Motion Inventory by Screen

**Splash (`app/index.tsx`):** Logo fades and springs in → double heartbeat sequence (1.24× → 0.94× → 1.14× → 1.0, pause, 1.18× → 0.96× → 1.0) → wordmark slides up 28px → heart SVG springs in → tagline fades → three pulsing dots animate at bottom.

**Welcome (`app/welcome.tsx`):** Six-stage stagger entrance. Bloop hero floats −11px in a 2.9s loop. Outer halo ring breathes between `0.92` and `1.06` scale in a 3.2s loop. Botanical SVG petals animate on 9s and 12s loops.

**Modals and bottom sheets:** Scale from `0.96`, not `0`. Entry duration 320–380ms with `spring` easing. Exit reverses with slightly shorter duration.

**Tab bar active state:** Active tab background fades in, dot indicator animates below icon.

---

## Component Patterns

### Cards

All cards use frosted glass treatment: `backgroundColor: "rgba(250,249,246,0.74)"`, `borderColor: "rgba(255,255,255,0.82)"`, `borderWidth: 1`, `borderRadius: 28–32px`. Shadow is always terracotta-tinted: `shadowColor: "#E07A5F"`, `shadowOpacity: 0.10–0.14`, `shadowRadius: 20–32`.

### Buttons

**Primary CTA:** Full-width pill with terracotta-to-peach gradient, height 54–56px, border-radius 999, white Playfair Display Bold label. Arrow icon sits inside a white semi-transparent circle on the right.

**Secondary CTA:** Frosted glass border pill. `backgroundColor: "rgba(255,255,255,0.22)"`, `borderColor: "rgba(224,122,95,0.22)"`, same height and radius as primary.

**Minimum touch target:** All pressable elements must be at least 44px tall (`spacing.minTouch`).

**Press feedback:** All Pressable components use `transform: [{ scale: 0.96 }]` on press. Use `({ pressed }) => [styles.base, pressed && styles.pressed]`.

### Tags and Chips

Feature tags use background tints from the palette (10–14% opacity), matching border (18–22% opacity), and the full-pill radius (999px). Font is system 12px weight 800, color matches the tag accent. Padding is `8px vertical, 14px horizontal`.

### Frosted Glass Effect

The navigation bar, card overlays, and companion badges use: `backgroundColor: "rgba(250,249,246,0.86)"`, `borderColor: "rgba(255,255,255,0.86)"`, `borderWidth: 1`, `backdropFilter` (web only — on native, rely on the background color opacity).

---

## Image Assets

All images are stored in `public/images/` as `.webp` format for performance. Use the `CachedImage` component (wraps `expo-image`) for all image rendering — never use the native `Image` component directly.

### Bloop Character Images

Bloop is the AI companion. Different moods are used on specific screens.

| File | Used on |
|---|---|
| `bloop-welcome.webp` | Welcome screen hero |
| `bloop-calm.webp` | Privacy consent screen, emotional wellness onboarding |
| `bloop-insight.webp` | Welcome screen mini badge, insights |
| `bloop-cycle.webp` | Cycle feature coming soon screen |
| `bloop-nourish.webp` | Nourish feature coming soon screen |
| `bloop-voice.webp` | Bloop AI chat coming soon screen |
| `bloop-pregnancy.webp` | Pregnancy feature screen |
| `bloop-nav.webp` | Floating tab bar Bloop button |
| `bloop-learning-private.webp` | Privacy and data screens |

### Feature Images

`fertility-glow-visual.webp`, `menopause-transition-visual.webp`, `pregnancy-journey-visual.webp` — hero visuals for their respective lifecycle screens.

Wellness content images follow the pattern `wellness-[topic].webp`, nourish images follow `nourish-[topic].webp`, insight images follow `insight-[topic].webp`.

### App Logo

`mystreelogo.webp` — transparent background RGBA webp, 740×807px. Used on the splash screen inside a rounded white card (`borderRadius: 50`, size 164×164px container).

---

## Navigation

### Tab Bar (`components/navigation/FloatingTabBar.tsx`)

The tab bar floats above the screen at `bottom: 24`, `left: 24`, `right: 24`. It has a frosted glass background, `borderRadius: 34`, height 68px. Active tab gets a white frosted pill background with terracotta border and a 4px terracotta dot underneath the icon.

The Bloop floating action button sits above the right side of the tab bar at `bottom: 84`, size 70×70px, with a terracotta glow effect behind it.

Tab icon colors: active = `#E07A5F` (terracotta), inactive = `#6B708D` (muted).

### Route Structure

```
app/
  index.tsx          — Splash screen (entry point)
  welcome.tsx        — Welcome / landing screen
  login.tsx          — Sign in
  register.tsx       — Create account
  (tabs)/
    dashboard.tsx    — Home — FUNCTIONAL
    cycle.tsx        — Cycle tracking — COMING SOON
    insights.tsx     — AI insights — COMING SOON
    wellness.tsx     — Wellness — COMING SOON
    nourish.tsx      — Nutrition — COMING SOON
    profile.tsx      — Profile — COMING SOON
  (onboarding)/
    privacy-consent.tsx    — Step 1: data consent
    onboarding.tsx         — Step 2: goal selection
    health-setup.tsx       — Step 3: health context
    emotional-wellness.tsx — Step 4: emotional baseline
    personalization.tsx    — Step 5: personalise
    ready.tsx              — Step 6: completion
  bloop.tsx          — AI chat — COMING SOON
  fertility.tsx      — Fertility — COMING SOON
  pregnancy.tsx      — Pregnancy — COMING SOON
  menopause.tsx      — Menopause — COMING SOON
  adolescence.tsx    — Adolescence — COMING SOON
  premium.tsx        — Premium — COMING SOON
  notifications.tsx  — Notifications
  settings.tsx       — Settings
```

### Auth Flow

Splash → always goes to Welcome (unless valid session + completed onboarding → Dashboard). Welcome → Register → Privacy Consent → Goal Selection → Health Setup → Emotional Wellness → Personalization → Ready → Dashboard. Login → Privacy Consent (if onboarding incomplete) or Dashboard (if complete).

---

## Screen-by-Screen Design Notes

### Splash Screen (`app/index.tsx`)

Background `#FBF8F5`. Logo inside a white rounded card with coral shadow. Wordmark "MyStree Soul" in Playfair Display ExtraBold (dark charcoal) with a terracotta SVG heart that springs in beside it. Tagline in italic with letter-spacing 2.2. Three pulsing coral dots at the bottom. Minimum display time before redirect: 3400ms.

### Welcome Screen (`app/welcome.tsx`)

Three-stop warm gradient background. Bloop welcome image as the hero — size is responsive `Math.min(W * 0.54, 224)`. Three concentric halo rings — outer breathes, two inner are static. A companion badge floats bottom-right showing Bloop Insight image with "Bloop / Your AI companion" and a sage online dot. A mini cycle card floats top-left. Headline is two lines: "Know your body." (ExtraBold) + "Feel like yourself." (Italic terracotta). Four feature tags in a row. Primary CTA "Begin Your Journey" with gradient + arrow. Secondary CTA "I already have an account" frosted glass. Trust row with three micro-pills: "Private · No data sold · Yours always."

### Dashboard (`app/(tabs)/dashboard.tsx`)

Greeting reads from `useOnboardingStore` — dynamic time-based "Good morning/afternoon/evening, {name}." Quick log row (Mood, Flow, Sleep, Hydration). Cycle ring visualization using animated SVG circle. Content cards below using the standard frosted glass card pattern.

### Onboarding Screens

All onboarding screens use `AuraBackground` as the base. They follow a consistent layout: Bloop character image at top → headline → body copy → interactive content → primary CTA at bottom. Privacy consent uses `PrivacyConsentCard` components. Back navigation is always available.

### Coming Soon Screens

All locked feature screens (`cycle`, `insights`, `wellness`, `nourish`, `profile`, `bloop`, `fertility`, `pregnancy`, `menopause`, `adolescence`, `premium`) show a full-screen coming soon treatment with the relevant Bloop character image floating with a loop animation, a "Coming Soon" badge with lock icon in terracotta, the feature name in Playfair Display ExtraBold, and a subtitle in Playfair Display Italic.

---

## Do's and Don'ts

**Do:**
- Use Playfair Display for all headings and display text
- Keep backgrounds warm — always off-white, never pure white or grey
- Add subtle float or breathe animations to hero images
- Use terracotta as the primary action color consistently
- Keep card shadows terracotta-tinted at low opacity (0.10–0.14)
- Stagger entrance animations with 110ms delay between elements
- Use `SafeAreaView` from `react-native-safe-area-context` on every screen
- Use `CachedImage` for all image rendering
- Keep minimum touch targets at 44px

**Don't:**
- Use blue, purple, or cool-toned gradients anywhere
- Use Inter, Roboto, or any sans-serif for display text
- Animate layout properties — only `transform` and `opacity`
- Use `linear` easing on UI motion
- Use the native `Image` component — always use `CachedImage`
- Add harsh shadows with black — always tint with terracotta or the card's accent color
- Build screens without the Bloop character on key emotional moments
- Use `resizeMode` on `CachedImage` — use `contentFit` instead

---

## File Locations Reference

| Asset type | Location |
|---|---|
| Color tokens | `constants/colors.ts` |
| Spacing tokens | `constants/spacing.ts` |
| Typography tokens | `constants/typography.ts` |
| Font files | `assets/fonts/` |
| Images | `public/images/` |
| Shared components | `components/system/` |
| Navigation components | `components/navigation/` |
| Auth state | `store/authStore.ts` |
| Onboarding state | `store/onboardingStore.ts` |
| Route guard | `hooks/useRouteGuard.ts` |
