import { useAuth } from "@/utils/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_COLORS = {
  verified: { bg: "#000000", color: "#FFFFFF" },
  pending:  { bg: "#F5F5F5", color: "#333333" },
  flagged:  { bg: "#78350F", color: "#FCD34D" },
  rejected: { bg: "#7F1D1D", color: "#FCA5A5" },
};

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [profile, setProfile] = useState(null);
  const { auth } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = {};
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;

      const roleRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/role`, { headers });
      if (!roleRes.ok) return;
      const { user } = await roleRes.json();
      setUserRole(user.role);
      setUserEmail(user.email);

      if (user.role === "athlete") {
        const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`, { headers });
        if (profileRes.ok) { const { profile } = await profileRes.json(); setProfile(profile); }
      } else if (user.role === "coach") {
        const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/profile`, { headers });
        if (profileRes.ok) { const { profile } = await profileRes.json(); setProfile(profile); }
      }
    } catch (err) {
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111111", marginBottom: 2 }}>
              Welcome, {firstName}
            </Text>
            <Text style={{ fontSize: 13, color: "#666666" }}>{userEmail}</Text>
          </View>
          <View style={{ backgroundColor: "#000000", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>{userRole}</Text>
          </View>
        </View>

        {userRole === "athlete" && profile && (
          <AthleteHome profile={profile} userEmail={userEmail} />
        )}
        {userRole === "coach" && profile && (
          <CoachHome profile={profile} userEmail={userEmail} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AthleteHome({ profile, userEmail }) {
  const status = profile.verification_status || "pending";
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.pending;

  return (
    <>
      {/* Profile card */}
      <View style={{ backgroundColor: "#F5F5F5", borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E0E0E0" }}>
        <Text style={{ color: "#000000", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>My Profile</Text>
        <Text style={{ color: "#111111", fontWeight: "600", fontSize: 17, marginBottom: 2 }}>{profile.full_name}</Text>
        <Text style={{ color: "#666666", fontSize: 13, marginBottom: 14 }}>{profile.current_school}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {profile.sport && (
            <View style={{ backgroundColor: "#000000", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>{profile.sport}</Text>
            </View>
          )}
          {profile.position && (
            <View style={{ backgroundColor: "#E8E8E8", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#333333", fontSize: 11, fontWeight: "600" }}>{profile.position}</Text>
            </View>
          )}
          {profile.division_level && (
            <View style={{ backgroundColor: "#E8E8E8", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#333333", fontSize: 11, fontWeight: "600" }}>{profile.division_level}</Text>
            </View>
          )}
          <View style={{ backgroundColor: statusColor.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
            <Text style={{ color: statusColor.color, fontSize: 11, fontWeight: "600", textTransform: "capitalize" }}>{status}</Text>
          </View>
        </View>
      </View>

      {/* Coming soon */}
      <ComingSoonBanner userEmail={userEmail} />
    </>
  );
}

function ComingSoonBanner({ userEmail }) {
  return (
    <View style={{ backgroundColor: "#F5F5F5", borderRadius: 12, padding: 24, borderWidth: 1, borderColor: "#E0E0E0", alignItems: "center" }}>
      <Text style={{ color: "#000000", fontSize: 15, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>
        Portl is launching soon
      </Text>
      <Text style={{ color: "#666666", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
        You will be notified at{" "}
        <Text style={{ color: "#111111", fontWeight: "600" }}>{userEmail}</Text>
        {" "}when you have full access.
      </Text>
    </View>
  );
}

function CoachHome({ profile, userEmail }) {
  return (
    <>
      {/* Profile card */}
      <View style={{ backgroundColor: "#F5F5F5", borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E0E0E0" }}>
        <Text style={{ color: "#000000", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>My Profile</Text>
        <Text style={{ color: "#111111", fontWeight: "600", fontSize: 17, marginBottom: 2 }}>{profile.full_name}</Text>
        <Text style={{ color: "#666666", fontSize: 13, marginBottom: 14 }}>{profile.school}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {profile.sport && (
            <View style={{ backgroundColor: "#000000", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>{profile.sport}</Text>
            </View>
          )}
          <View style={{ backgroundColor: "#E8E8E8", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
            <Text style={{ color: "#333333", fontSize: 11, fontWeight: "600" }}>Coach</Text>
          </View>
          {profile.division_level && (
            <View style={{ backgroundColor: "#E8E8E8", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#333333", fontSize: 11, fontWeight: "600" }}>{profile.division_level}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Coming soon */}
      <ComingSoonBanner userEmail={userEmail} />
    </>
  );
}

