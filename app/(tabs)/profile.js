import { useAuth } from "@/utils/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { LogOut, User as UserIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const { signOut, auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const headers = {};
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;

      const roleRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/role`, { headers });
      if (roleRes.ok) {
        const { user } = await roleRes.json();
        setUserRole(user.role);
        setUserEmail(user.email);

        if (user.role === "athlete") {
          const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`, { headers });
          if (profileRes.ok) {
            const { profile } = await profileRes.json();
            setProfile(profile);
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
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified": return "#10B981";
      case "rejected": return "#EF4444";
      case "flagged": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "verified": return "Verified";
      case "rejected": return "Rejected";
      case "flagged": return "Flagged";
      default: return "Pending Review";
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF", marginBottom: 32 }}>Profile</Text>

        <View style={{ backgroundColor: "#1E293B", padding: 20, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#334155" }}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
              <UserIcon color="#FFFFFF" size={40} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 }}>{profile?.full_name || "User"}</Text>
            <Text style={{ fontSize: 14, color: "#94A3B8", marginBottom: 8 }}>{userEmail}</Text>
            <View style={{ backgroundColor: userRole === "athlete" ? "#3B82F6" : "#7C3AED", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: "#FFFFFF", textTransform: "uppercase" }}>{userRole}</Text>
            </View>
          </View>

          {userRole === "athlete" && profile && (
            <View style={{ backgroundColor: "#0F172A", padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 2, borderColor: getStatusColor(profile.verification_status) }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#E2E8F0" }}>Verification Status</Text>
                <View style={{ backgroundColor: getStatusColor(profile.verification_status), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: "#FFFFFF" }}>{getStatusText(profile.verification_status)}</Text>
                </View>
              </View>
              {profile.verification_status === "verified" && (
                <Text style={{ fontSize: 13, color: "#10B981", lineHeight: 18 }}>✓ Your profile is verified and visible to all coaches</Text>
              )}
              {profile.verification_status === "pending_verification" && (
                <Text style={{ fontSize: 13, color: "#94A3B8", lineHeight: 18 }}>Your profile is under review and will be visible to coaches once verified</Text>
              )}
            </View>
          )}

          {userRole === "athlete" && profile && (
            <View style={{ gap: 12 }}>
              {[["Sport", profile.sport], ["Position", profile.position], ["School", profile.current_school], ["Division", profile.division_level], ["Grad Year", profile.graduation_year]].map(([k, v]) => (
                <View key={k} style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#334155" }}>
                  <Text style={{ fontSize: 14, color: "#94A3B8", width: 140 }}>{k}</Text>
                  <Text style={{ fontSize: 14, color: "#E2E8F0", fontWeight: "500", flex: 1 }}>{v}</Text>
                </View>
              ))}
            </View>
          )}

          {userRole === "coach" && profile && (
            <View style={{ gap: 12 }}>
              {[["School", profile.school], ["Sport", profile.sport], ["Email", profile.email]].map(([k, v]) => (
                <View key={k} style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#334155" }}>
                  <Text style={{ fontSize: 14, color: "#94A3B8", width: 140 }}>{k}</Text>
                  <Text style={{ fontSize: 14, color: "#E2E8F0", fontWeight: "500", flex: 1 }}>{v}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ backgroundColor: "#FEF3C7", padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, color: "#92400E", lineHeight: 20 }}>⚠️ This platform is not affiliated with the NCAA</Text>
        </View>

        <TouchableOpacity onPress={handleSignOut} style={{ backgroundColor: "#EF4444", padding: 16, borderRadius: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <LogOut color="#FFFFFF" size={20} />
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}