import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="privacy-consent" />
      <Stack.Screen name="health-setup" />
      <Stack.Screen name="emotional-wellness" />
      <Stack.Screen name="personalization" />
      <Stack.Screen name="ready" />
    </Stack>
  );
}
