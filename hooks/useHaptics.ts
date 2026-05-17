import * as Haptics from "expo-haptics";

async function safely(run: () => Promise<void>) {
  try {
    await run();
  } catch {
    // Haptics can be unavailable on simulator/web. Interaction should never fail.
  }
}

export function useHaptics() {
  return {
    error: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
    light: () => safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    selection: () => safely(() => Haptics.selectionAsync()),
    success: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
  };
}
