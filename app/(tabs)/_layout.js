import { Tabs } from "expo-router";
import { Home, Search, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={undefined}
      screenOptions={{
        headerShown: false,
        tabBarPosition: "bottom",
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          height: 60,
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#999999",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} />
      <Tabs.Screen name="search" options={{ tabBarIcon: ({ color }) => <Search color={color} size={24} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
    </Tabs>
  );
}
