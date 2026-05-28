import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'bottom',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 390,
          alignSelf: 'center',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
        },
        sceneStyle: {
          paddingBottom: 80,
          maxWidth: 390,
          width: '100%',
          alignSelf: 'center',
          overflow: 'hidden',
        },
      }}
    />
  );
}
