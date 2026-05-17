import { Image, type ImageRef } from "expo-image";

const criticalImages = [
  require("../public/images/bloop-welcome.webp"),
  require("../public/images/bloop-nav.webp"),
  require("../public/images/bloop-calm.webp"),
  require("../public/images/bloop-voice.webp")
];

const routeImages = [
  require("../public/images/bloop-cycle.webp"),
  require("../public/images/bloop-insight.webp"),
  require("../public/images/bloop-nourish.webp"),
  require("../public/images/bloop-pregnancy.webp"),
  require("../public/images/nourish-anti-inflammatory.webp"),
  require("../public/images/nourish-craving-support.webp"),
  require("../public/images/nourish-gentle-meals.webp"),
  require("../public/images/nourish-hormone-smoothie.webp"),
  require("../public/images/nourish-hydration-support.webp"),
  require("../public/images/nourish-iron-support.webp"),
  require("../public/images/nourish-sleep-dinner.webp"),
  require("../public/images/nourish-stress-tea.webp"),
  require("../public/images/movement-yoga-flow.webp"),
  require("../public/images/movement-nature-walk.webp"),
  require("../public/images/movement-meditation.webp"),
  require("../public/images/insight-breathing-reset.webp"),
  require("../public/images/insight-iron-dinner.webp"),
  require("../public/images/insight-luteal-yoga.webp"),
  require("../public/images/insight-sleep-ritual.webp"),
  require("../public/images/insight-stress-recovery.webp"),
  require("../public/images/wellness-hero-reset.webp"),
  require("../public/images/wellness-sleep-recovery.webp"),
  require("../public/images/wellness-iron-meal.webp"),
  require("../public/images/wellness-stress-reset.webp"),
  require("../public/images/wellness-hydration.webp"),
  require("../public/images/wellness-evening-stretch.webp"),
  require("../public/images/adolescence-safe-space.webp"),
  require("../public/images/bloop-learning-private.webp"),
  require("../public/images/fertility-glow-visual.webp"),
  require("../public/images/pregnancy-journey-visual.webp"),
  require("../public/images/menopause-cooling-breath.webp"),
  require("../public/images/menopause-evening-recovery.webp"),
  require("../public/images/menopause-gentle-strength.webp"),
  require("../public/images/menopause-hormone-nutrition.webp"),
  require("../public/images/menopause-stress-reset.webp"),
  require("../public/images/menopause-better-sleep.webp")
];

let preloadPromise: Promise<void> | null = null;
const retainedImageRefs: ImageRef[] = [];

async function preloadBatch(images: number[], maxSize: number) {
  const loaded = await Promise.allSettled(
    images.map((source) => Image.loadAsync(source, { maxHeight: maxSize, maxWidth: maxSize }))
  );

  loaded.forEach((result) => {
    if (result.status === "fulfilled") {
      retainedImageRefs.push(result.value);
    }
  });
}

export function preloadAppImages() {
  if (!preloadPromise) {
    preloadPromise = (async () => {
      await preloadBatch(criticalImages, 512);
      await preloadBatch(routeImages, 512);
    })();
  }

  return preloadPromise;
}
