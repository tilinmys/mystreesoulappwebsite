# MyStree Soul Bloop Image Placement Map

This map keeps Bloop art intentional, so every screen feels premium instead of randomly decorated.

## Current Images

| Asset | Visual read | Best role | Use in app |
| --- | --- | --- | --- |
| `bloop-original.png` | Purple 3D Bloop, expressive, mascot-like, active companion energy | Main AI personality, chat avatar, assistant moments | Bloop chat screen hero/header/message avatar |
| `bloop.webp` | Optimized purple Bloop | Small repeated UI placements where performance matters | Floating nav center orb, dashboard/header AI orb, compact page headers |
| `bloop-nav.webp` | Tiny optimized Bloop, 256px | Bottom nav and small header orbs | Primary nav center orb and compact AI entry |
| `bloop-voice.webp` | Voice/chat Bloop, optimized transparent WebP | AI companion chat | Bloop chat hero, header, message avatar |
| `bloop-cycle.webp` | Cycle-specific Bloop, optimized transparent WebP | Cycle timeline and rhythm understanding | Cycle screen header/AI accents |
| `bloop-insight.webp` | Thoughtful intelligence Bloop, optimized transparent WebP | Hormone intelligence | Insights hero/header |
| `bloop-nourish.webp` | Nourishment Bloop, optimized transparent WebP | Nutrition guidance | Nourish AI card/header |
| `bloop-pregnancy.webp` | Maternal Bloop, optimized transparent WebP | Pregnancy journey | Pregnancy header and maternal insight |
| `bloop-calm.webp` | Calm/meditation Bloop, optimized transparent WebP | Wellness and emotional check-ins | Wellness/profile/emotional support |
| `bloop-welcome-original.png` | Warm cream droplet Bloop with glowing heart | Emotional onboarding, nurture, maternal care, nutrition warmth | Use only when Bloop feels gentle/caring, not as the main nav mascot |
| `bloop-welcome.webp` | Optimized heart Bloop | Production version of welcome/nurture Bloop | Splash, onboarding helper cards, health setup, Soul-ready, nourish insight, pregnancy insight |
| `onboarding-cycle-guide.webp` | Friendly peach character art | Soft tutorial/guide visual, yoga/wellness editorial card | Wellness hero/featured flow, onboarding support art |
| `onboarding-cycle-leaf.webp` | Minimal line leaf, peach editorial | Nutrition, nature, calm movement | Nourish cards, wellness movement card, profile/wellness accents |
| `onboarding-cycle-petals.webp` | Premium sage flower, luxury Soul mood | Meditation, AI insights, emotional calm | Insights background cards, Bloop educational card, wellness recommendations |

## Placement Rules

- Purple Bloop = active intelligence, chat, navigation, assistant entry point.
- Heart Bloop = emotional reassurance, setup, pregnancy, nutrition, “Bloop is caring for me.”
- Page-specific Bloop variants should be used on their matching page. The nav always uses `bloop-nav.webp`.
- Do not put large Bloop art on every screen. Use one major Bloop moment per screen, plus tiny nav/header versions.
- Keep Bloop inside glass or glow containers. Avoid raw image placement on plain backgrounds.
- Use `.webp` for repeated UI. Keep `.png` originals for large hero moments or future re-exports.
- Run `python scripts/optimize_images.py` after adding new Bloop PNGs. It removes flat edge backgrounds, resizes to app-safe dimensions, and writes real WebP files.

## Current Screen Mapping

| Screen | Recommended Bloop |
| --- | --- |
| Splash | `bloop-welcome.webp` as emotional first hello |
| Onboarding goals | `bloop-welcome.webp` as the “Bloop is learning your vibe” guide |
| Health setup | `bloop-welcome.webp` as a low-pressure setup companion |
| Emotional wellness | `bloop.webp` or `bloop-original.png` as reactive mood orb |
| Dashboard | `bloop.webp` for compact header/nav AI entry |
| Bloop chat | `bloop-voice.webp` for the full active companion personality |
| Insights | `bloop-insight.webp` for premium AI intelligence |
| Nourish | `bloop-nourish.webp` in the nutrition insight card |
| Wellness | `bloop-calm.webp` in header; abstract assets for body content |
| Pregnancy | `bloop-pregnancy.webp` for maternal insight/header; `bloop-nav.webp` remains nav center |
| Profile | `bloop-welcome.webp` for identity; `bloop-calm.webp` for relationship card; `bloop-nav.webp` for compact app AI |

## Missing Bloop Variants To Generate

### 1. Sleep Bloop
Use for sleep recovery cards, night rituals, luteal rest insights.

Prompt:
```text
Create a premium 3D mascot character for a luxury Gen-Z women’s wellness app called Bloop. Bloop is a soft droplet-shaped AI companion, sleeping peacefully on a tiny crescent moon, with closed gentle eyes, subtle lavender and sage glow, warm white background, cinematic soft lighting, Apple-quality 3D render, emotionally safe, minimal, no text, transparent background, 512x512.
```

### 2. Nourish Bloop
Use for nutrition screen hero/meal recommendations.

Prompt:
```text
Create a premium 3D Bloop AI companion for a luxury hormone-supportive nutrition app. Bloop is a soft cream droplet character holding a small glowing leaf and a warm bowl, terracotta peach and sage green aura, gentle smile, editorial wellness lighting, calm nourishing feeling, no diet culture, no text, transparent background, 512x512.
```

### 3. Pregnancy Bloop
Use for Pregnancy Journey hero and maternal AI card.

Prompt:
```text
Create a premium 3D Bloop AI companion for a maternal wellness app. Bloop is a soft warm droplet character holding a glowing heart close to the belly area, surrounded by subtle peach, sage, and lavender light particles, nurturing and emotionally safe, elegant Apple/Oura-inspired 3D render, no cartoon baby, no text, transparent background, 512x512.
```

### 4. Insight Bloop
Use for AI insights and hormone intelligence.

Prompt:
```text
Create a futuristic premium 3D Bloop AI companion for hormone intelligence insights. Bloop is a soft purple-lavender droplet character looking thoughtfully at a tiny glowing constellation of data points, sage and terracotta aura lighting, cinematic glassmorphism mood, intelligent but warm, no medical UI, no text, transparent background, 512x512.
```

### 5. Calm Bloop
Use for breathing, emotional reset, and the Soul care space.

Prompt:
```text
Create a luxury 3D Bloop wellness companion meditating calmly, soft droplet-shaped character, relaxed face, subtle hands resting, surrounded by floating petals and breath rings, sage green, soft peach, and lavender glow, warm white background, premium spa atmosphere, no text, transparent background, 512x512.
```

## File Naming Convention

Use these names when uploaded:

- `bloop-sleep.webp`
- `bloop-nourish.webp`
- `bloop-pregnancy.webp`
- `bloop-insight.webp`
- `bloop-calm.webp`

Keep originals as PNG only if needed:

- `bloop-sleep-original.png`
- `bloop-nourish-original.png`
- `bloop-pregnancy-original.png`
- `bloop-insight-original.png`
- `bloop-calm-original.png`
