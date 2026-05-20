import { Tabs } from "expo-router";
import { FloatingTabBar } from "../../components/navigation/FloatingTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "transparent",
        },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="cycle" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="wellness" />
      <Tabs.Screen name="nourish" />
      <Tabs.Screen name="sleep" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
