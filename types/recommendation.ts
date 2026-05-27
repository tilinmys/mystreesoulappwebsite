export type RecommendationData = {
  primary: string;
  secondary: string;
  category: "nutrition" | "sleep" | "movement" | "mindfulness" | "unknown";
};

export type SleepRecommendation = {
  headline: string;
  advice: string;
};

export type NourishRecommendation = {
  headline: string;
  advice: string;
};

export type ResetRecommendation = {
  headline: string;
  advice: string;
};
