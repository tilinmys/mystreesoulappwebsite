import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'bottom',
        tabBarStyle: {
          maxWidth: 390,
          width: '100%',
          alignSelf: 'center',
        },
        sceneStyle: {
          width: '100%',
          maxWidth: 390,
          alignSelf: 'center',
          overflow: 'hidden',
        },
      }}
    />
  );
}
