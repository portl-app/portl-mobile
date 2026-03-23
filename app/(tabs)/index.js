import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bell } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { auth } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = {};
      if (auth?.jwt) {
        headers.Authorization = `Bearer ${auth.jwt}`;
      }

      const roleRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/role`, { headers });
      if (roleRes.ok) {
        const { user } = await roleRes.json();
        setUserRole(user.role);

        if (user.role === "athlete") {
          const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`, { headers });
          if (profileRes.ok) {
            const { profile } = await profileRes.json();
            setProfile(profile);
          }
          const notifRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/notifications`, { headers });
          if (notifRes.ok) {
            const { unreadCount: count } = await notifRes.json();
            setUnreadCount(count || 0);
          }
        } else if (user.role === "coach") {
          const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/profile`, { headers });
          if (profileRes.ok) {
            const { profile } = await profileRes.json();
            setProfile(profile);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF" }}>
            Welcome Back
          </Text>
          {userRole === "athlete" && (
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" }}
            >
              <Bell size={20} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={{ position: "absolute", top: 6, right: 6, backgroundColor: "#EF4444", minWidth: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 }}>
                  <Text style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "bold" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={{ fontSize: 16, color: "#94A3B8", marginBottom: 32 }}>
          {profile?.full_name || "User"}
        </Text>

        {userRole === "athlete" && profile && (
          <View style={{ backgroundColor: "#1E293B", padding: 20, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#334155" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 16 }}>Your Profile</Text>
            <View style={{ gap: 12 }}>
              {[["Sport", profile.sport], ["Position", profile.position], ["School", profile.current_school], ["Division", profile.division_level]].map(([k, v]) => (
                <View key={k} style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 14, color: "#94A3B8", width: 120 }}>{k}:</Text>
                  <Text style={{ fontSize: 14, color: "#E2E8F0", fontWeight: "500" }}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {userRole === "coach" && profile && (
          <View style={{ backgroundColor: "#1E293B", padding: 20, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#334155" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 16 }}>Your Profile</Text>
            <View style={{ gap: 12 }}>
              {[["School", profile.school], ["Sport", profile.sport], ["Email", profile.email]].map(([k, v]) => (
                <View key={k} style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 14, color: "#94A3B8", width: 120 }}>{k}:</Text>
                  <Text style={{ fontSize: 14, color: "#E2E8F0", fontWeight: "500" }}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}