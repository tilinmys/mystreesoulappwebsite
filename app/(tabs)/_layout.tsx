import { Tabs } from "expo-router";
import { FloatingTabBar } from "../../components/navigation/FloatingTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: "transparent",
          maxWidth: 390,
          width: "100%",
          alignSelf: "center",
          overflow: "hidden",
        },
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
