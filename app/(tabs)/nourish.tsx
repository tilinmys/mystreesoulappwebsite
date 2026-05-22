import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
  Svg,
} from "react-native-svg";
import { CachedImage } from "../../components/CachedImage";
import { F } from "../../constants/fonts";
import { darkColors } from "../../constants/colors";
import { useColorMode } from "../../hooks/useColorMode";
import { openBloopWithContext } from "../../lib/openBloopWithContext";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg1:       darkColors.background,
  bg2:       darkColors.background,
  bg3:       darkColors.background,
  deep:      darkColors.textPrimary,
  muted:     darkColors.textMuted,
  faint:     darkColors.textHint,
  sage:      darkColors.fertileColor,
  sagePale:  darkColors.surfaceRaised,
  sageLight: darkColors.fertileColor,
  teal:      darkColors.fertileColor,
  tealPale:  darkColors.surfaceRaised,
  rose:      darkColors.periodColor,
  rosePale:  darkColors.surfaceRaised,
  pink:      darkColors.primaryCTA,
  pinkPale:  darkColors.surfaceRaised,
  lavender:  darkColors.textMuted,
  lavPale:   darkColors.surfaceRaised,
  gold:      darkColors.warning,
  goldPale:  darkColors.surfaceRaised,
  peach:     darkColors.warning,
  peachPale: darkColors.surfaceRaised,
  surfaceRaised: darkColors.surfaceRaised,
  cardBg:    darkColors.surface,
  border:    darkColors.border,
  sheetBg:   darkColors.surface,
};

const { width: W, height: H } = Dimensions.get("window");

// ── Hydration ring ─────────────────────────────────────────────────────────────
const RING_R    = 22;
const RING_CIRC = 2 * Math.PI * RING_R;
const CURRENT_GLASSES = 4;
const TARGET_GLASSES  = 8;
const FILL_PCT  = CURRENT_GLASSES / TARGET_GLASSES;

// ── Condition badge colours ───────────────────────────────────────────────────
const CONDITION_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  "PCOS-friendly": { bg: darkColors.surfaceRaised, text: darkColors.textPrimary, dot: darkColors.textMuted },
  "Endo-friendly": { bg: darkColors.surfaceRaised, text: darkColors.textPrimary, dot: darkColors.periodColor },
  "Low-energy":    { bg: darkColors.surfaceRaised, text: darkColors.textPrimary, dot: darkColors.warning },
};

// ── Phase filter data ──────────────────────────────────────────────────────────
const PHASES = [
  { id: "menstrual",  label: "Menstrual",  icon: "water-outline",        color: C.rose,     activeColor: "#FFD0D0", textColor: "#D45C6A" },
  { id: "ovulation",  label: "Ovulation",  icon: "white-balance-sunny",  color: C.gold,     activeColor: C.goldPale, textColor: C.gold },
  { id: "pms",        label: "PMS",        icon: "flower-outline",       color: C.lavender, activeColor: C.lavPale,  textColor: C.lavender },
  { id: "emotional",  label: "Emotional",  icon: "heart-outline",        color: "#D4637A",  activeColor: "#FFE8ED",  textColor: "#D4637A" },
  { id: "sleep",      label: "Sleep",      icon: "moon-waning-crescent", color: "#7B8FCE",  activeColor: "#EEF0FF",  textColor: "#7B8FCE" },
];

// ── Types ──────────────────────────────────────────────────────────────────────
type NourishPhaseId = "menstrual" | "ovulation" | "pms" | "emotional" | "sleep";
type FocusItem = { id: string; label: string; icon: string; color: string; bg: string };
type MealCard = {
  label:       string;
  tag:         string;
  condition?:  "PCOS-friendly" | "Endo-friendly" | "Low-energy";
  why:         string;
  ingredients: string[];
  bloopMsg:    string;
  imgIdx:      0 | 1 | 2 | 3;
};
type QuickIdea = {
  id:       string;
  label:    string;
  icon:     string;
  color:    string;
  bg:       string;
  tip:      string;
  bloopMsg: string;
};
type NourishContent = {
  heroTitle:       string;
  heroSub:         string;
  focusItems:      FocusItem[];
  insightTitle:    string;
  insightBody:     string;
  insightBloopMsg: string;
  meals:           MealCard[];
  quickIdeas:      QuickIdea[];
};

// ── Meal images (4 assets, reused across phases) ───────────────────────────────
const MEAL_IMGS = [
  require("../../public/images/nourish-iron-support.webp"),
  require("../../public/images/nourish-anti-inflammatory.webp"),
  require("../../public/images/nourish-hormone-smoothie.webp"),
  require("../../public/images/nourish-stress-tea.webp"),
];

// ── Phase-driven content map ───────────────────────────────────────────────────
const NOURISH_CONTENT: Record<NourishPhaseId, NourishContent> = {

  // ── MENSTRUAL ──────────────────────────────────────────────────────────────
  menstrual: {
    heroTitle: "Gentle iron support",
    heroSub:   "for today 🍃",
    focusItems: [
      { id: "iron",      label: "Iron",      icon: "leaf",          color: C.sage,  bg: C.sagePale  },
      { id: "hydration", label: "Hydration", icon: "water-outline", color: C.teal,  bg: C.tealPale  },
      { id: "energy",    label: "Energy",    icon: "spa-outline",   color: C.peach, bg: C.peachPale },
    ],
    insightTitle:    "Cravings may rise",
    insightBody:     "Your body may be asking\nfor magnesium right now.",
    insightBloopMsg: "I'm menstruating and having cravings. What foods help with magnesium levels and ease my symptoms?",
    meals: [
      {
        label:       "Iron-Rich Lentil Bowl",
        tag:         "Menstrual",
        condition:   "PCOS-friendly",
        why:         "Red lentils deliver ~6mg of non-heme iron per cup, offsetting period losses. Adding vitamin C (lemon, tomato) triples absorption. This combination is especially supportive for PCOS-related iron fluctuations.",
        ingredients: ["Red lentils", "Baby spinach", "Cherry tomatoes", "Lemon juice", "Garlic", "Cumin"],
        bloopMsg:    "I'm menstruating and want an iron-rich meal. Can you give me a simple lentil bowl recipe and explain how it helps my body right now?",
        imgIdx:      0,
      },
      {
        label:       "Ginger Turmeric Broth",
        tag:         "Anti-cramp",
        why:         "Ginger inhibits prostaglandins — the hormones that trigger cramping. Curcumin in turmeric blocks the same inflammatory pathway as ibuprofen. Black pepper increases curcumin absorption by 2000%.",
        ingredients: ["Fresh ginger", "Turmeric", "Bone or veggie broth", "Black pepper", "Coconut milk", "Lemon"],
        bloopMsg:    "What's the science behind ginger and turmeric for period cramps? Can you give me a recipe and tell me how quickly it works?",
        imgIdx:      1,
      },
      {
        label:       "Beetroot Walnut Salad",
        tag:         "Blood flow",
        condition:   "Endo-friendly",
        why:         "Beetroot's nitrates improve circulation and ease the heavy, congested feeling of menstruation. Walnuts contribute omega-3s that lower inflammatory prostaglandins — particularly helpful for endometriosis.",
        ingredients: ["Roasted beetroot", "Baby rocket", "Walnuts", "Goat cheese", "Balsamic glaze", "Olive oil"],
        bloopMsg:    "I have endometriosis and need anti-inflammatory meals during my period. Can you suggest more meals like a beetroot walnut salad and explain which ingredients help most?",
        imgIdx:      2,
      },
      {
        label:       "Dark Chocolate Oat Bowl",
        tag:         "Mood",
        condition:   "Low-energy",
        why:         "Oats release glucose slowly for steady, low-effort energy. Dark chocolate (70%+) provides 64mg of magnesium per 30g — enough to ease muscle tension and lift mood without triggering a sugar spike.",
        ingredients: ["Rolled oats", "Banana", "Dark chocolate (70%+)", "Almond milk", "Chia seeds", "Honey"],
        bloopMsg:    "I have low energy during my period and crave sweets. What foods satisfy cravings while supporting my body and not making me feel worse?",
        imgIdx:      3,
      },
    ],
    quickIdeas: [
      {
        id: "rasptea", label: "Raspberry Tea", icon: "tea-outline", color: C.rose, bg: C.rosePale,
        tip:      "Raspberry leaf contains fragrine, which tones the uterine muscle, reducing cramping intensity. Drink 2–3 cups warm, starting from day 1 of your period.",
        bloopMsg: "What does raspberry leaf tea do for periods, how much should I drink, and are there any cautions?",
      },
      {
        id: "lentil", label: "Iron Soup", icon: "bowl-mix-outline", color: C.sage, bg: C.sagePale,
        tip:      "Pair any iron-rich food (lentils, spinach, beans) with a vitamin C source like lemon or tomato — this simple combo triples non-heme iron absorption from plant foods.",
        bloopMsg: "How can I maximise iron absorption from plant foods during my period? What combinations work best?",
      },
      {
        id: "ginger", label: "Ginger Shot", icon: "cup-water", color: "#D4637A", bg: "#FFE8ED",
        tip:      "1 tsp of freshly grated ginger in warm water before meals reduces prostaglandin activity — the chemicals that trigger cramping — with effects felt within 30 minutes.",
        bloopMsg: "How do I make a ginger shot for period cramps and how quickly does it ease pain?",
      },
      {
        id: "choc", label: "Dark Choc", icon: "seed-outline", color: C.gold, bg: C.goldPale,
        tip:      "1–2 squares of dark chocolate (70%+) gives you 64mg of magnesium — enough to ease muscle tension and interrupt the craving–binge cycle without a sugar spike.",
        bloopMsg: "Is dark chocolate actually beneficial during periods? How much, what type, and what does it do?",
      },
    ],
  },

  // ── OVULATION ──────────────────────────────────────────────────────────────
  ovulation: {
    heroTitle: "Peak energy nourishment",
    heroSub:   "fuel your glow ✨",
    focusItems: [
      { id: "protein",  label: "Protein",      icon: "food-steak",     color: C.gold,    bg: C.goldPale },
      { id: "antioxid", label: "Antioxidants", icon: "fruit-cherries", color: "#D45C6A", bg: "#FFE8ED"  },
      { id: "hydration",label: "Hydration",    icon: "water-outline",  color: C.teal,    bg: C.tealPale },
    ],
    insightTitle:    "Energy is at its peak",
    insightBody:     "Support your vitality with\nprotein-rich, colourful meals.",
    insightBloopMsg: "I'm in my ovulation phase and energy is high. What foods sustain this energy and support my hormones best?",
    meals: [
      {
        label:       "Salmon Quinoa Bowl",
        tag:         "Ovulation",
        why:         "Omega-3s in salmon support follicle development and natural lubrication. Quinoa's complete amino acid profile fuels your peak-energy phase without spiking blood sugar.",
        ingredients: ["Salmon fillet", "Quinoa", "Avocado", "Cucumber", "Sesame seeds", "Tamari"],
        bloopMsg:    "I'm in my ovulation phase and want to eat for peak energy and hormonal support. What makes this salmon quinoa bowl particularly good right now?",
        imgIdx:      0,
      },
      {
        label:       "Avocado Egg Toast",
        tag:         "Energy",
        why:         "Choline in eggs supports estrogen metabolism in the liver. Avocado's healthy fats slow glucose release, sustaining the high energy typical of ovulation without a crash.",
        ingredients: ["Sourdough bread", "Avocado", "Eggs (2)", "Chilli flakes", "Lemon zest", "Microgreens"],
        bloopMsg:    "Why are avocado and eggs such a good combination during ovulation? What nutrients am I getting and why do they matter?",
        imgIdx:      1,
      },
      {
        label:       "Berry Antioxidant Smoothie",
        tag:         "Balance",
        why:         "Blueberries and raspberries are rich in ellagic acid and anthocyanins, which protect eggs from oxidative stress during the LH surge. Flaxseed adds lignans to modulate estrogen.",
        ingredients: ["Mixed berries", "Banana", "Greek yoghurt", "Ground flaxseed", "Almond milk", "Honey"],
        bloopMsg:    "Give me a berry smoothie recipe optimised for ovulation and explain which ingredients matter most for my hormones.",
        imgIdx:      2,
      },
      {
        label:       "Edamame Stir-Fry",
        tag:         "Hormone-safe",
        condition:   "PCOS-friendly",
        why:         "Edamame's isoflavones gently modulate estrogen without causing spikes — particularly useful for PCOS during the follicular surge. High protein content supports insulin sensitivity.",
        ingredients: ["Edamame", "Broccoli", "Bell pepper", "Fresh ginger", "Tamari", "Brown rice"],
        bloopMsg:    "I have PCOS and I'm in my ovulation phase. What stir-fry meals are safe and hormone-supportive for me, and what should I avoid?",
        imgIdx:      3,
      },
    ],
    quickIdeas: [
      {
        id: "gsmoothie", label: "Green Smoothie", icon: "cup-water", color: "#5B9E6A", bg: "#EBF5EF",
        tip:      "Blend kale, banana, avocado, and almond milk for a complete amino acid profile. Folate in kale supports active cell division during the follicular phase.",
        bloopMsg: "What is the best green smoothie recipe for ovulation and which ingredients matter most for my hormones?",
      },
      {
        id: "protsnack", label: "Protein Snack", icon: "food-steak", color: C.gold, bg: C.goldPale,
        tip:      "Hard-boiled eggs + a handful of almonds: complete protein and vitamin E, both critical during the ovulatory surge for cellular protection and egg quality.",
        bloopMsg: "What protein snacks are best during ovulation and why does protein matter so much at this phase?",
      },
      {
        id: "avotoast", label: "Avocado Toast", icon: "bread-slice-outline", color: C.sage, bg: C.sagePale,
        tip:      "Avocado's monounsaturated fats are building blocks for estrogen synthesis. Add an egg for choline — essential for the liver to metabolise excess estrogen efficiently.",
        bloopMsg: "Why is avocado particularly good during ovulation? What's happening hormonally that makes healthy fat so important right now?",
      },
      {
        id: "berrymix", label: "Berry Handful", icon: "fruit-cherries", color: "#D45C6A", bg: "#FFE8ED",
        tip:      "A small handful of mixed berries delivers quercetin and anthocyanins that protect developing follicles from oxidative stress during the LH surge. Eat them fresh, not juiced.",
        bloopMsg: "Which berries have the most antioxidants for ovulation and how do they protect my hormonal health?",
      },
    ],
  },

  // ── PMS ────────────────────────────────────────────────────────────────────
  pms: {
    heroTitle: "Soothing PMS support",
    heroSub:   "ease the tension 🌸",
    focusItems: [
      { id: "magnesium", label: "Magnesium",   icon: "leaf",               color: C.lavender, bg: C.lavPale  },
      { id: "b6",        label: "Vitamin B6",  icon: "medical-bag",        color: "#D4637A",  bg: "#FFE8ED"  },
      { id: "antiinf",   label: "Anti-Inflam", icon: "food-apple-outline", color: C.sage,     bg: C.sagePale },
    ],
    insightTitle:    "Inflammation may increase",
    insightBody:     "Anti-inflammatory foods can\nease PMS symptoms gently.",
    insightBloopMsg: "I'm experiencing PMS. What foods reduce inflammation, ease cramps, and support my mood right now?",
    meals: [
      {
        label:       "Magnesium Greens Bowl",
        tag:         "PMS",
        why:         "Spinach and pumpkin seeds are among the highest plant sources of magnesium. Adequate magnesium in the luteal phase reduces water retention, bloating, and the mood dips linked to progesterone withdrawal.",
        ingredients: ["Baby spinach", "Pumpkin seeds", "Chickpeas", "Tahini dressing", "Lemon", "Olive oil"],
        bloopMsg:    "I'm experiencing PMS symptoms. What foods are highest in magnesium and exactly how do they relieve my symptoms?",
        imgIdx:      0,
      },
      {
        label:       "Pumpkin Seed Pesto Pasta",
        tag:         "Hormones",
        condition:   "Endo-friendly",
        why:         "Zinc in pumpkin seeds directly supports progesterone production in the luteal phase, which can reduce PMS severity over time. Olive oil's polyphenols are anti-inflammatory and particularly beneficial for endometriosis.",
        ingredients: ["Pasta of choice", "Pumpkin seeds", "Fresh basil", "Extra-virgin olive oil", "Garlic", "Parmesan or nutritional yeast"],
        bloopMsg:    "Why is pumpkin seed pesto good for PMS and endometriosis? Can you give me the recipe and the nutritional breakdown?",
        imgIdx:      1,
      },
      {
        label:       "Oat & Chamomile Porridge",
        tag:         "Calm",
        why:         "Oats stimulate serotonin via tryptophan during the pre-menstrual serotonin dip. Chamomile acts as a gentle GABA receptor modulator — easing anxiety and irritability without sedation.",
        ingredients: ["Rolled oats", "Chamomile tea (brewed, used as liquid)", "Banana", "Walnuts", "Cinnamon", "Maple syrup"],
        bloopMsg:    "I have PMS mood swings. What breakfast foods naturally boost serotonin and calm anxiety, and how quickly do they work?",
        imgIdx:      2,
      },
      {
        label:       "Turmeric Golden Latte",
        tag:         "Anti-inflam",
        condition:   "Low-energy",
        why:         "Curcumin inhibits COX-2 enzymes — the same pathway targeted by ibuprofen — reducing PMS-related pain without the gut side effects. Black pepper increases curcumin absorption by up to 2000%.",
        ingredients: ["Turmeric (1 tsp)", "Warm oat or coconut milk", "Black pepper (pinch)", "Fresh ginger", "Cinnamon", "Raw honey"],
        bloopMsg:    "How does a turmeric golden latte compare to ibuprofen for PMS pain? What's the best recipe for maximum anti-inflammatory effect?",
        imgIdx:      3,
      },
    ],
    quickIdeas: [
      {
        id: "nettletea", label: "Nettle Tea", icon: "tea-outline", color: C.sage, bg: C.sagePale,
        tip:      "Nettle leaf tea is one of the highest plant sources of magnesium (40mg per cup) and reduces the water retention and bloating typical of PMS. Drink 2 cups daily in your luteal phase.",
        bloopMsg: "What herbal teas have the most magnesium and exactly how do they help PMS? What's the right amount to drink?",
      },
      {
        id: "pumpkinseed", label: "Pumpkin Seeds", icon: "seed-outline", color: C.gold, bg: C.goldPale,
        tip:      "1 oz of pumpkin seeds = 37% of your daily zinc. Zinc triggers progesterone release at the end of the luteal phase — low zinc is directly linked to more severe PMS.",
        bloopMsg: "How do pumpkin seeds help with PMS? What's the connection between zinc and progesterone, and how much should I eat?",
      },
      {
        id: "darkgreens", label: "Dark Greens", icon: "leaf", color: "#5B9E6A", bg: "#EBF5EF",
        tip:      "Spinach and kale during PMS week give you folate and B6 — both required by the liver to break down excess estrogen, which is the root cause of bloating and mood dips.",
        bloopMsg: "How do leafy greens help PMS? What nutrients am I looking for and how much do I need each day in my luteal phase?",
      },
      {
        id: "walnuts", label: "Walnut Snack", icon: "fruit-cherries", color: C.lavender, bg: C.lavPale,
        tip:      "A small handful of walnuts (6–7) with turmeric yoghurt hits two targets: omega-3s reduce prostaglandins, while yoghurt's probiotics ease gut-linked mood dips.",
        bloopMsg: "What's the best anti-inflammatory snack for PMS that also helps with mood and gut health?",
      },
    ],
  },

  // ── EMOTIONAL ─────────────────────────────────────────────────────────────
  emotional: {
    heroTitle: "Mood-lifting nutrition",
    heroSub:   "nourish your heart 💛",
    focusItems: [
      { id: "omega3",    label: "Omega-3",     icon: "fish",                   color: C.teal,    bg: C.tealPale },
      { id: "serotonin", label: "Serotonin",   icon: "emoticon-happy-outline", color: "#D4637A", bg: "#FFE8ED"  },
      { id: "gut",       label: "Gut Health",  icon: "sprout-outline",         color: C.sage,    bg: C.sagePale },
    ],
    insightTitle:    "Gut-brain connection",
    insightBody:     "80% of serotonin is made\nin your gut. Feed it well.",
    insightBloopMsg: "I want to support my emotional wellbeing through food. What nutrients and foods boost serotonin and mood most effectively?",
    meals: [
      {
        label:       "Walnut & Date Energy Balls",
        tag:         "Mood",
        why:         "Walnuts contain the highest plant-based DHA of any nut, directly nourishing the prefrontal cortex — the brain region that regulates emotional responses and impulse control.",
        ingredients: ["Walnuts", "Medjool dates", "Raw cacao powder", "Chia seeds", "Vanilla extract", "Rolled oats"],
        bloopMsg:    "I'm feeling emotionally low. What foods support brain chemistry and mood? Can you give me an energy ball recipe and explain which ingredients do what?",
        imgIdx:      0,
      },
      {
        label:       "Probiotic Yoghurt Parfait",
        tag:         "Gut-brain",
        condition:   "PCOS-friendly",
        why:         "80% of serotonin is synthesised in the gut. Live yoghurt delivers Lactobacillus strains that produce GABA — the brain's primary calming neurotransmitter. Particularly useful for PCOS-related mood fluctuations.",
        ingredients: ["Full-fat Greek yoghurt", "Mixed berries", "Granola", "Raw honey", "Ground flaxseed", "Kiwi"],
        bloopMsg:    "Explain the gut-brain connection and how fermented foods affect mood. What probiotic foods best support serotonin naturally?",
        imgIdx:      1,
      },
      {
        label:       "Serotonin Grain Bowl",
        tag:         "Serotonin",
        why:         "Tryptophan-rich foods paired with complex carbohydrates cross the blood-brain barrier more effectively, maximising serotonin synthesis. Sweet potato's B6 activates the final conversion step.",
        ingredients: ["Brown rice", "Chickpeas or turkey", "Roasted sweet potato", "Kale", "Tahini dressing", "Pomegranate seeds"],
        bloopMsg:    "What is a serotonin bowl and how does it actually work? Give me a recipe that genuinely supports mood and explain the science.",
        imgIdx:      2,
      },
      {
        label:       "Miso Turmeric Soup",
        tag:         "Calm",
        condition:   "Endo-friendly",
        why:         "Miso is fermented and supports gut microbiome diversity, improving the gut-brain signalling linked to anxiety. Turmeric's curcumin reduces neuro-inflammation associated with emotional dysregulation and endometriosis pain.",
        ingredients: ["Miso paste", "Dashi or veggie stock", "Silken tofu", "Turmeric", "Spring onion", "Dried seaweed"],
        bloopMsg:    "I want a calming, anti-inflammatory soup that supports my mood and gut. What makes miso and turmeric good for emotional health?",
        imgIdx:      3,
      },
    ],
    quickIdeas: [
      {
        id: "walnutdha", label: "Walnuts", icon: "seed-outline", color: C.teal, bg: C.tealPale,
        tip:      "Just 6 walnuts daily provides more omega-3 ALA than most supplements. DHA from walnuts directly feeds the prefrontal cortex — the brain's emotional regulation centre.",
        bloopMsg: "How do walnuts support mood and brain chemistry? What's the best way to eat them for emotional health benefits?",
      },
      {
        id: "ferment", label: "Fermented Snack", icon: "bowl-mix-outline", color: C.lavender, bg: C.lavPale,
        tip:      "Just 60ml of kefir, yoghurt, or kimchi daily shifts the gut microbiome toward strains that produce serotonin precursors — effects are measurable within 2 weeks of consistent use.",
        bloopMsg: "What fermented foods are best for mental wellbeing, and how quickly do they work? What's the evidence?",
      },
      {
        id: "lemonbalm", label: "Lemon Balm Tea", icon: "tea-outline", color: C.sage, bg: C.sagePale,
        tip:      "Lemon balm activates GABA receptors, reducing anxiety within 30 minutes. Paired with passionflower or ashwagandha, it also lowers cortisol over consistent use.",
        bloopMsg: "What herbal teas genuinely help with anxiety and emotional balance? What does the science say and which are most effective?",
      },
      {
        id: "cacao", label: "Raw Cacao", icon: "cup-water", color: "#D4637A", bg: "#FFE8ED",
        tip:      "Raw cacao (not cocoa) contains anandamide — the 'bliss molecule' — plus PEA, which triggers dopamine and serotonin release without the crash of processed chocolate.",
        bloopMsg: "What's the difference between raw cacao and cocoa? How does cacao support mood and what's the best way to use it?",
      },
    ],
  },

  // ── SLEEP ──────────────────────────────────────────────────────────────────
  sleep: {
    heroTitle: "Sleep-supporting meals",
    heroSub:   "rest starts at dinner 🌙",
    focusItems: [
      { id: "melatonin",  label: "Melatonin",   icon: "moon-waning-crescent", color: "#7B8FCE",  bg: "#EEF0FF"  },
      { id: "calcium",    label: "Calcium",     icon: "cup-outline",          color: C.lavender, bg: C.lavPale  },
      { id: "tryptophan", label: "Tryptophan",  icon: "tea-outline",          color: C.sage,     bg: C.sagePale },
    ],
    insightTitle:    "Dinner affects your sleep",
    insightBody:     "Eat 2–3 hours before bed\nfor deeper, calmer rest.",
    insightBloopMsg: "I want to improve my sleep through nutrition. What should I eat for dinner and what should I avoid to sleep better tonight?",
    meals: [
      {
        label:       "Tryptophan Turkey Bowl",
        tag:         "Sleep",
        why:         "Turkey is one of the richest dietary sources of tryptophan, which converts to melatonin overnight. Pairing with complex carbohydrates improves tryptophan transport across the blood-brain barrier.",
        ingredients: ["Turkey breast or chickpeas", "Brown rice", "Steamed broccoli", "Olive oil", "Garlic", "Lemon zest"],
        bloopMsg:    "What should I eat for dinner to improve sleep quality? How does tryptophan work and what foods have the most?",
        imgIdx:      0,
      },
      {
        label:       "Kiwi & Warm Milk Bowl",
        tag:         "Melatonin",
        why:         "Two kiwis before bed has been clinically shown to reduce sleep onset by ~35 minutes over 4 weeks. Calcium in warm milk activates melatonin synthesis in the pineal gland.",
        ingredients: ["2 kiwi fruits", "Warm oat milk", "Chamomile-infused honey", "Chia seeds", "Almonds"],
        bloopMsg:    "Is it true that kiwis improve sleep? What other melatonin-supporting foods should I eat before bed and how much is enough?",
        imgIdx:      1,
      },
      {
        label:       "Magnesium Banana Oats",
        tag:         "Recovery",
        condition:   "Endo-friendly",
        why:         "Magnesium in oats and banana relaxes smooth muscle, which is critical for reducing night-time cramping in endometriosis. Vitamin B6 in banana supports progesterone, which directly deepens sleep architecture.",
        ingredients: ["Rolled oats", "Banana", "Almond butter", "Pumpkin seeds", "Oat milk", "Cinnamon"],
        bloopMsg:    "I have trouble sleeping due to cramping at night. What dinner or snack helps with both sleep quality and pain relief?",
        imgIdx:      2,
      },
      {
        label:       "Cherry Chamomile Smoothie",
        tag:         "Calm",
        condition:   "Low-energy",
        why:         "Tart cherries are one of the few whole foods with clinically measurable melatonin. Chamomile's apigenin binds GABA-A receptors with effects similar to mild sedatives — without dependency.",
        ingredients: ["Tart cherry juice (100ml)", "Cooled chamomile tea", "Banana", "Oat milk", "Vanilla extract", "Ice"],
        bloopMsg:    "How do tart cherries help with sleep? Give me a bedtime smoothie recipe and explain the science behind it.",
        imgIdx:      3,
      },
    ],
    quickIdeas: [
      {
        id: "chamomile", label: "Chamomile Tea", icon: "tea-outline", color: C.lavender, bg: C.lavPale,
        tip:      "Chamomile's apigenin binds GABA-A receptors with mild sedative-like effects. A full mug 45 minutes before bed reduces average sleep onset time by ~12 minutes.",
        bloopMsg: "How does chamomile tea improve sleep? What's the right amount and best time to drink it for maximum effect?",
      },
      {
        id: "banana", label: "Banana", icon: "fruit-cherries", color: C.gold, bg: C.goldPale,
        tip:      "A banana 1 hour before bed delivers potassium (prevents leg cramps), B6 (activates melatonin synthesis), and tryptophan. One of the most complete single-food sleep aids.",
        bloopMsg: "Why is a banana good before bed? What's happening nutritionally and what's the best time to eat it?",
      },
      {
        id: "cherry", label: "Cherry Juice", icon: "cup-water", color: "#D45C6A", bg: "#FFE8ED",
        tip:      "30ml of tart cherry juice concentrate (diluted in water) delivers ~13µg of melatonin per serving — a clinically studied dose. Drink 1–2 hours before sleep for best results.",
        bloopMsg: "How much tart cherry juice should I drink for sleep, when should I drink it, and what does the research actually say?",
      },
      {
        id: "oatmilk", label: "Warm Oat Milk", icon: "bowl-mix-outline", color: C.teal, bg: C.tealPale,
        tip:      "Oat milk's slow-digesting carbohydrates gently raise insulin, which shuttles tryptophan across the blood-brain barrier for melatonin synthesis. Warm temperature activates the calming vagal response.",
        bloopMsg: "Why is warm milk a traditional sleep remedy and does oat milk work the same way? What's the actual nutritional science?",
      },
    ],
  },
};

// ── Hero SVG botanical illustration ───────────────────────────────────────────
function BotanicalHero() {
  return (
    <View style={styles.heroIllustWrap}>
      <Svg width={128} height={128} viewBox="0 0 128 128">
        <Defs>
          <SvgRadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0"   stopColor={C.deep}  stopOpacity="0.95" />
            <Stop offset="0.6" stopColor="#F2EFE8"  stopOpacity="0.7"  />
            <Stop offset="1"   stopColor="#F2EFE8"  stopOpacity="0"    />
          </SvgRadialGradient>
          <SvgGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#8FAE90" stopOpacity="1" />
            <Stop offset="1" stopColor="#5E7D60" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <Circle cx="64" cy="64" r="54" fill="url(#heroGlow)" />
        <Circle cx="64" cy="80" r="38" fill={C.deep} opacity="0.82" />
        <Path d="M 36 82 Q 36 100 64 100 Q 92 100 92 82 Z" fill="none" stroke="#7A907C" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 32 82 L 96 82" stroke="#7A907C" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M 64 82 L 64 76" stroke="#7A907C" strokeWidth="2" strokeLinecap="round" />
        <Path d="M 64 75 C 64 68, 60 58, 56 44" stroke="#7A907C" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <Path d="M 60 60 C 44 52, 38 38, 50 28 C 56 38, 58 52, 60 60 Z" fill="url(#leafGrad)" opacity="0.9" />
        <Path d="M 60 60 C 52 48, 46 36, 50 28" stroke={C.deep} opacity="0.45" strokeWidth="1" fill="none" strokeLinecap="round" />
        <Path d="M 62 55 C 76 44, 88 32, 82 20 C 74 28, 66 44, 62 55 Z" fill="url(#leafGrad)" opacity="0.85" />
        <Path d="M 62 55 C 72 40, 80 28, 82 20" stroke={C.deep} opacity="0.4" strokeWidth="1" fill="none" strokeLinecap="round" />
        <Path d="M 56 50 C 46 46, 40 40, 44 32 C 50 36, 54 44, 56 50 Z" fill="#9BBF9E" opacity="0.75" />
        <Path d="M 56 44 C 54 38, 56 32, 58 28" stroke="#7A907C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <Path d="M 58 30 C 58 26, 62 22, 66 24" stroke="#7A907C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <Path d="M 62 26 C 66 20, 72 20, 72 26 C 68 28, 62 28, 62 26 Z" fill="#9BBF9E" opacity="0.8" />
        <Circle cx="28" cy="44" r="2"   fill="#C4D4C8" opacity="0.6" />
        <Circle cx="98" cy="38" r="1.5" fill="#C4D4C8" opacity="0.5" />
        <Circle cx="90" cy="60" r="2.5" fill="#D4A066" opacity="0.4" />
        <Circle cx="22" cy="68" r="1.5" fill="#D4A066" opacity="0.35" />
      </Svg>
    </View>
  );
}

// ── SVG sparkle for insight card ──────────────────────────────────────────────
function InsightSparkles() {
  return (
    <Svg width={120} height={80} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d="M 88 12 L 90 8 L 92 12 L 88 12" fill="#C4A8E8" opacity="0.35" />
      <Path d="M 90 8 L 90 4 M 88 10 L 86 10 M 92 10 L 94 10" stroke="#C4A8E8" strokeWidth="1" opacity="0.3" />
      <Path d="M 102 38 L 104 34 L 106 38 L 102 38" fill="#D4B8F0" opacity="0.28" />
      <Path d="M 108 22 L 109.2 25.6 L 113 26.6 L 109.2 27.6 L 108 31.2 L 106.8 27.6 L 103 26.6 L 106.8 25.6 Z" fill="#B4A0D8" opacity="0.25" />
      <Circle cx="96" cy="58" r="2"   fill="#C4A8E8" opacity="0.28" />
      <Circle cx="112" cy="50" r="1.5" fill="#D4B8F0" opacity="0.22" />
    </Svg>
  );
}

// ── Hydration ring ─────────────────────────────────────────────────────────────
function HydrationRing() {
  const progress = FILL_PCT * RING_CIRC;
  const offset   = RING_CIRC - progress;
  const cx = 28, cy = 28;
  return (
    <View style={styles.ringWrap}>
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <Defs>
          <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#A8D4D1" stopOpacity="1" />
            <Stop offset="1" stopColor="#5EA8A4" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={RING_R} fill="none" stroke="#E4EEF0" strokeWidth="5" />
        <Circle
          cx={cx} cy={cy} r={RING_R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${RING_CIRC}`}
          strokeDashoffset={`${offset}`}
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <MaterialCommunityIcons name="water-outline" size={16} color={C.teal} />
      </View>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function NourishScreen() {
  const router = useRouter();
  const { colors } = useColorMode();
  const [activePhase, setActivePhase] = useState<NourishPhaseId>("menstrual");
  const nc = NOURISH_CONTENT[activePhase];

  // Meal detail sheet
  const [activeMeal, setActiveMeal] = useState<MealCard | null>(null);
  const mealAnim    = useRef(new Animated.Value(0)).current;
  const mealSlide   = mealAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  const mealOverlay = mealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // Quick idea tip sheet
  const [activeIdea, setActiveIdea] = useState<QuickIdea | null>(null);
  const ideaAnim    = useRef(new Animated.Value(0)).current;
  const ideaSlide   = ideaAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });
  const ideaOverlay = ideaAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  function askBloop(message: string) {
    openBloopWithContext(router, message, "Nourish");
  }

  function openMeal(meal: MealCard) {
    setActiveMeal(meal);
    Animated.timing(mealAnim, {
      toValue: 1, duration: 340,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }
  function closeMeal(thenBloop?: string) {
    Animated.timing(mealAnim, { toValue: 0, duration: 230, useNativeDriver: true }).start(() => {
      setActiveMeal(null);
      mealAnim.setValue(0);
      if (thenBloop) askBloop(thenBloop);
    });
  }

  function openIdea(idea: QuickIdea) {
    setActiveIdea(idea);
    Animated.timing(ideaAnim, {
      toValue: 1, duration: 310,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }
  function closeIdea(bloopMsg?: string) {
    Animated.timing(ideaAnim, { toValue: 0, duration: 210, useNativeDriver: true }).start(() => {
      setActiveIdea(null);
      ideaAnim.setValue(0);
      if (bloopMsg) askBloop(bloopMsg);
    });
  }

  const activePhaseData = PHASES.find(p => p.id === activePhase)!;

  return (
    <LinearGradient colors={[colors.background, colors.background, colors.background]} style={styles.root}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Nourish</Text>
            <MaterialCommunityIcons name="leaf" size={16} color={C.gold} style={{ marginLeft: 6, marginTop: 4 }} />
          </View>
          <View style={styles.headerActions}>
            {/* Hydration guidance for current phase */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ask Bloop about hydration"
              style={styles.headerBtn}
              onPress={() => askBloop(`How much water should I drink during my ${activePhase} phase, and what foods are most hydrating right now?`)}
            >
              <MaterialCommunityIcons name="water-outline" size={18} color={C.teal} />
            </Pressable>
            {/* AI meal plan for current phase */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ask Bloop for a meal plan"
              style={styles.headerBtn}
              onPress={() => askBloop(`Give me a personalised 1-day meal plan for my ${activePhase} phase that supports my hormones and energy.`)}
            >
              <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={C.lavender} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.headerSub}>Support your body gently</Text>

        <ScrollView showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never" style={styles.scrollView} contentContainerStyle={styles.scroll}>

          {/* ── Hero banner ─────────────────────────────────────────────── */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={[colors.surface, colors.surfaceRaised, colors.surface]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.heroBlob, { top: -20, right: 20, backgroundColor: `${colors.warning}18`, width: 100, height: 100 }]} />
            <View style={[styles.heroBlob, { bottom: -10, left: 30, backgroundColor: `${colors.fertileColor}14`, width: 80, height: 80 }]} />
            <BotanicalHero />
            <Text style={styles.heroTitle}>{nc.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{nc.heroSub}</Text>
            <Pressable
              style={styles.heroBtn}
              onPress={() => askBloop("Give me hormone-supportive food ideas.")}
            >
              <MaterialCommunityIcons name="leaf" size={13} color={C.sage} />
              <Text style={styles.heroBtnText}>Hormone Support</Text>
            </Pressable>
          </View>

          {/* ── Phase filter ────────────────────────────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.phaseScroll}
            style={styles.phaseScrollWrap}
          >
            {PHASES.map(phase => {
              const active = activePhase === phase.id;
              return (
                <Pressable
                  key={phase.id}
                  onPress={() => setActivePhase(phase.id as NourishPhaseId)}
                  style={[
                    styles.phaseCard,
                    active && { borderColor: phase.color + "60", backgroundColor: phase.activeColor },
                  ]}
                >
                  <View style={[styles.phaseIconWrap, active && { backgroundColor: phase.color + "20" }]}>
                    <MaterialCommunityIcons name={phase.icon as any} size={22} color={active ? phase.color : C.muted} />
                  </View>
                  <Text style={[styles.phaseLabel, active && { color: phase.textColor, fontFamily: F.uiSemiBold }]}>
                    {phase.label}
                  </Text>
                  {active && <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ── Today's focus ────────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Today's focus</Text>
          <View style={styles.focusCard}>
            {nc.focusItems.map((item, i) => (
              <View key={item.id} style={[styles.focusItem, i < nc.focusItems.length - 1 && styles.focusItemBorder]}>
                <View style={[styles.focusIconCircle, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.focusLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Insight banner ───────────────────────────────────────────── */}
          <Pressable style={styles.insightCard} onPress={() => askBloop(nc.insightBloopMsg)}>
            <LinearGradient
              colors={[colors.surface, colors.surfaceRaised, colors.surface]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <InsightSparkles />
            <View style={[styles.insightIconWrap, { backgroundColor: colors.surfaceRaised }]}>
              <MaterialCommunityIcons name="flower-tulip-outline" size={22} color={C.lavender} />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>{nc.insightTitle}</Text>
              <Text style={styles.insightBody}>{nc.insightBody}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.lavender} style={{ marginLeft: "auto" }} />
          </Pressable>

          {/* ── Quick nourish ideas ──────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, styles.centeredTitle]}>Quick nourish ideas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickScroll}
          >
            {nc.quickIdeas.map(idea => (
              <Pressable
                key={idea.id}
                style={styles.quickItem}
                onPress={() => openIdea(idea)}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: idea.bg }]}>
                  <MaterialCommunityIcons name={idea.icon as any} size={26} color={idea.color} />
                </View>
                <Text style={styles.quickLabel}>{idea.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* ── Hydration tracker — tappable: opens Bloop hydration guidance */}
          <Pressable
            style={styles.hydrationCard}
            onPress={() => askBloop(`I've had ${CURRENT_GLASSES} glasses of water today and my goal is ${TARGET_GLASSES}. How much water is ideal during the ${activePhase} phase, and what are the best hydrating foods to complement this?`)}
          >
            <HydrationRing />
            <View style={styles.hydrationInfo}>
              <Text style={styles.hydrationTitle}>Hydration</Text>
              <View style={styles.hydrationRow}>
                <Text style={styles.hydrationCount}>{CURRENT_GLASSES} / {TARGET_GLASSES} glasses</Text>
                <View style={styles.dropIcons}>
                  {Array.from({ length: TARGET_GLASSES }).map((_, i) => (
                    <MaterialCommunityIcons
                      key={i}
                      name={i < CURRENT_GLASSES ? "water" : "water-outline"}
                      size={14}
                      color={i < CURRENT_GLASSES ? C.teal : C.faint}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.hydrationTip}>Tap for phase-specific guidance</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.muted} style={styles.hydrationChevron} />
          </Pressable>

          {/* ── Meal cards ───────────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Meals for this phase</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealScroll}
          >
            {nc.meals.map((meal, i) => (
              <Pressable key={i} style={styles.mealCard} onPress={() => openMeal(meal)}>
                <CachedImage source={MEAL_IMGS[meal.imgIdx]} style={styles.mealImage} />
                <LinearGradient
                  colors={["transparent", `${colors.background}DD`]}
                  style={styles.mealOverlay}
                />
                {/* Phase tag */}
                <View style={styles.mealTagRow}>
                  <View style={styles.mealTag}>
                    <Text style={styles.mealTagText}>{meal.tag}</Text>
                  </View>
                  {meal.condition && (
                    <View style={[styles.mealConditionBadge, { backgroundColor: CONDITION_STYLE[meal.condition].bg }]}>
                      <View style={[styles.mealConditionDot, { backgroundColor: CONDITION_STYLE[meal.condition].dot }]} />
                      <Text style={[styles.mealConditionText, { color: CONDITION_STYLE[meal.condition].text }]}>
                        {meal.condition}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.mealLabel}>{meal.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ── Quick idea tip sheet ─────────────────────────────────────────────── */}
      {activeIdea && (
        <>
          <Animated.View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, styles.sheetScrim, { opacity: ideaOverlay }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeIdea()} />
          </Animated.View>
          <Animated.View
            style={[styles.ideaSheet, { transform: [{ translateY: ideaSlide }] }]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.ideaIconRow}>
              <View style={[styles.ideaIconCircle, { backgroundColor: activeIdea.bg }]}>
                <MaterialCommunityIcons name={activeIdea.icon as any} size={28} color={activeIdea.color} />
              </View>
              <Text style={styles.ideaSheetLabel}>{activeIdea.label}</Text>
            </View>
            <Text style={styles.ideaTipBody}>{activeIdea.tip}</Text>
            <Pressable
              style={[styles.ideaBloopBtn, { backgroundColor: activeIdea.bg, borderColor: activeIdea.color + "44" }]}
              onPress={() => closeIdea(activeIdea.bloopMsg)}
            >
              <MaterialCommunityIcons name="chat-processing-outline" size={15} color={activeIdea.color} />
              <Text style={[styles.ideaBloopText, { color: activeIdea.color }]}>Ask Bloop more</Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color={activeIdea.color} />
            </Pressable>
            <Pressable style={styles.sheetCloseBtn} onPress={() => closeIdea()}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </Pressable>
          </Animated.View>
        </>
      )}

      {/* ── Meal detail sheet ────────────────────────────────────────────────── */}
      {activeMeal && (
        <>
          <Animated.View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, styles.sheetScrim, { opacity: mealOverlay }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMeal()} />
          </Animated.View>
          <Animated.View
            style={[styles.mealSheet, { transform: [{ translateY: mealSlide }] }]}
          >
            <View style={styles.sheetHandle} />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Title row with tags */}
              <View style={styles.mealSheetTagRow}>
                <View style={[styles.mealSheetPhaseTag, { backgroundColor: activePhaseData.color + "22" }]}>
                  <MaterialCommunityIcons name={activePhaseData.icon as any} size={11} color={activePhaseData.color} />
                  <Text style={[styles.mealSheetPhaseTagText, { color: activePhaseData.textColor }]}>
                    {activeMeal.tag}
                  </Text>
                </View>
                {activeMeal.condition && (
                  <View style={[styles.mealSheetCondTag, { backgroundColor: CONDITION_STYLE[activeMeal.condition].bg }]}>
                    <View style={[styles.mealConditionDot, { backgroundColor: CONDITION_STYLE[activeMeal.condition].dot }]} />
                    <Text style={[styles.mealSheetCondText, { color: CONDITION_STYLE[activeMeal.condition].text }]}>
                      {activeMeal.condition}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.mealSheetTitle}>{activeMeal.label}</Text>

              {/* Why it helps */}
              <View style={styles.mealSheetSection}>
                <View style={styles.mealSheetSectionHeader}>
                  <MaterialCommunityIcons name="information-outline" size={15} color={C.lavender} />
                  <Text style={styles.mealSheetSectionTitle}>Why it helps</Text>
                </View>
                <Text style={styles.mealSheetBody}>{activeMeal.why}</Text>
              </View>

              {/* Simple ingredients */}
              <View style={styles.mealSheetSection}>
                <View style={styles.mealSheetSectionHeader}>
                  <MaterialCommunityIcons name="leaf" size={15} color={C.sage} />
                  <Text style={styles.mealSheetSectionTitle}>Simple ingredients</Text>
                </View>
                {activeMeal.ingredients.map((ing, idx) => (
                  <View key={idx} style={styles.ingredientRow}>
                    <View style={[styles.ingredientDot, { backgroundColor: activePhaseData.color }]} />
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </View>
                ))}
              </View>

              {/* Ask Bloop CTA */}
              <Pressable
                style={styles.mealBloopBtn}
                onPress={() => closeMeal(activeMeal.bloopMsg)}
              >
                <LinearGradient
                  colors={[C.lavender + "22", C.lavPale]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <MaterialCommunityIcons name="chat-processing-outline" size={17} color={C.lavender} />
                <Text style={styles.mealBloopText}>Ask Bloop for a full recipe</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={C.lavender} />
              </Pressable>

              <Pressable style={styles.sheetCloseBtn} onPress={() => closeMeal()}>
                <Text style={styles.sheetCloseText}>Close</Text>
              </Pressable>
              <View style={{ height: 20 }} />
            </ScrollView>
          </Animated.View>
        </>
      )}
    </LinearGradient>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  safeDark: { backgroundColor: C.bg1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 2,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 28,
    color: C.deep,
    letterSpacing: -0.3,
  },
  headerActions: { flexDirection: "row", gap: 10 },
  headerBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: C.cardBg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
  headerSub: {
    fontFamily: F.uiRegular,
    fontSize: 12.5,
    color: C.muted,
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  scrollView: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingTop: 0, paddingBottom: 28, flexGrow: 1 },

  // Hero
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
  heroBlob: { position: "absolute", borderRadius: 100 },
  heroIllustWrap: { width: 128, height: 128, marginBottom: 12 },
  heroTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 20,
    color: C.deep,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  heroSubtitle: {
    fontFamily: F.luxuryItalic,
    fontSize: 17,
    color: C.sage,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.sagePale,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
  },
  heroBtnText: { fontFamily: F.uiSemiBold, fontSize: 13, color: C.sage },

  // Phase filter
  phaseScrollWrap: { marginBottom: 4 },
  phaseScroll: { paddingHorizontal: 20, gap: 10, paddingBottom: 6 },
  phaseCard: {
    width: 74,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: C.cardBg,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    gap: 6,
    position: "relative",
  },
  phaseIconWrap: {
    width: 42, height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.sagePale,
  },
  phaseLabel: { fontFamily: F.uiMedium, fontSize: 10.5, color: C.muted, textAlign: "center" },
  phaseDot: { position: "absolute", bottom: -8, width: 6, height: 6, borderRadius: 3 },

  // Section titles
  sectionTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 17,
    color: C.deep,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  centeredTitle: { textAlign: "center", paddingHorizontal: 0 },

  // Today's focus
  focusCard: {
    marginHorizontal: 20,
    backgroundColor: C.cardBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    paddingVertical: 18,
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  focusItem: { flex: 1, alignItems: "center", gap: 8 },
  focusItemBorder: { borderRightWidth: 1, borderRightColor: C.border },
  focusIconCircle: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  focusLabel: { fontFamily: F.uiSemiBold, fontSize: 12, color: C.deep },

  // Insight
  insightCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  insightIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  insightText: { flex: 1 },
  insightTitle: { fontFamily: F.uiSemiBold, fontSize: 14, color: C.lavender, marginBottom: 3 },
  insightBody:  { fontFamily: F.bodyRegular, fontSize: 13.5, color: C.muted, lineHeight: 19 },

  // Quick ideas
  quickScroll: { paddingHorizontal: 20, gap: 14, paddingVertical: 4 },
  quickItem: { alignItems: "center", gap: 8 },
  quickIconCircle: {
    width: 66, height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
  },
  quickLabel: { fontFamily: F.uiMedium, fontSize: 11, color: C.muted, textAlign: "center", maxWidth: 66 },

  // Hydration
  hydrationCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: C.cardBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  ringWrap: { width: 56, height: 56, position: "relative", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ringCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
  hydrationInfo: { flex: 1 },
  hydrationTitle: { fontFamily: F.uiSemiBold, fontSize: 14, color: C.deep, marginBottom: 4 },
  hydrationRow: { gap: 6 },
  hydrationCount: { fontFamily: F.uiMedium, fontSize: 12, color: C.muted },
  dropIcons: { flexDirection: "row", gap: 3, marginTop: 2 },
  hydrationTip: { fontFamily: F.uiRegular, fontSize: 10.5, color: C.faint, marginTop: 5 },
  hydrationChevron: { marginLeft: "auto" },

  // Meal cards
  mealScroll: { paddingHorizontal: 20, gap: 12 },
  mealCard: {
    width: 148,
    height: 185,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  mealImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  mealOverlay: { ...StyleSheet.absoluteFillObject },
  mealTagRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingHorizontal: 10,
    gap: 4,
    marginBottom: 4,
  },
  mealTag: {
    backgroundColor: C.surfaceRaised,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  mealTagText: { fontFamily: F.uiSemiBold, fontSize: 9.5, color: C.deep, letterSpacing: 0.3 },
  mealConditionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  mealConditionDot: { width: 5, height: 5, borderRadius: 3 },
  mealConditionText: { fontFamily: F.uiSemiBold, fontSize: 9, letterSpacing: 0.2 },
  mealLabel: {
    fontFamily: F.uiSemiBold,
    fontSize: 12.5,
    color: C.deep,
    paddingHorizontal: 10,
    paddingBottom: 12,
    lineHeight: 17,
  },

  // Shared sheet primitives
  sheetScrim: { backgroundColor: `${C.bg1}CC`, zIndex: 40 },
  sheetHandle: {
    width: 38, height: 4,
    borderRadius: 2,
    backgroundColor: C.surfaceRaised,
    alignSelf: "center",
    marginBottom: 18,
  },
  sheetCloseBtn: { alignSelf: "center", paddingVertical: 10, paddingHorizontal: 24, marginTop: 6 },
  sheetCloseText: { fontFamily: F.uiMedium, fontSize: 13.5, color: C.muted },

  // Quick idea tip sheet
  ideaSheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 14,
    zIndex: 50,
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 14,
  },
  ideaIconRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  ideaIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  ideaSheetLabel: { fontFamily: F.luxuryBold, fontSize: 22, color: C.deep, flex: 1 },
  ideaTipBody: { fontFamily: F.bodyRegular, fontSize: 15.5, color: C.muted, lineHeight: 23, marginBottom: 20 },
  ideaBloopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 4,
  },
  ideaBloopText: { flex: 1, fontFamily: F.uiSemiBold, fontSize: 14 },

  // Meal detail sheet
  mealSheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    maxHeight: H * 0.84,
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 24,
    paddingTop: 14,
    zIndex: 50,
    shadowColor: C.bg1,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 14,
  },
  mealSheetTagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  mealSheetPhaseTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  mealSheetPhaseTagText: { fontFamily: F.uiSemiBold, fontSize: 11.5 },
  mealSheetCondTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  mealSheetCondText: { fontFamily: F.uiSemiBold, fontSize: 11.5 },
  mealSheetTitle: {
    fontFamily: F.luxuryBold,
    fontSize: 24,
    color: C.deep,
    letterSpacing: -0.3,
    marginBottom: 18,
    lineHeight: 30,
  },
  mealSheetSection: { marginBottom: 18 },
  mealSheetSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  mealSheetSectionTitle: {
    fontFamily: F.uiSemiBold,
    fontSize: 13,
    color: C.muted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  mealSheetBody: {
    fontFamily: F.bodyRegular,
    fontSize: 15.5,
    color: C.deep,
    lineHeight: 24,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 5,
  },
  ingredientDot: { width: 6, height: 6, borderRadius: 3 },
  ingredientText: { fontFamily: F.uiRegular, fontSize: 14.5, color: C.deep },
  mealBloopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 15,
    overflow: "hidden",
    marginTop: 4,
    marginBottom: 4,
  },
  mealBloopText: {
    flex: 1,
    fontFamily: F.uiSemiBold,
    fontSize: 14.5,
    color: C.lavender,
  },
});
