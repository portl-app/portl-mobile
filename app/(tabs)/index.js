import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_COLORS = {
  verified: { bg: "#065F46", color: "#6EE7B7" },
  pending:  { bg: "#1E3A5F", color: "#93C5FD" },
  flagged:  { bg: "#78350F", color: "#FCD34D" },
  rejected: { bg: "#7F1D1D", color: "#FCA5A5" },
};

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [profile, setProfile] = useState(null);
  const [discover, setDiscover] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
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
        const [profileRes, discoverRes] = await Promise.all([
          fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`, { headers }),
          fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/discover`, { headers }),
        ]);
        if (profileRes.ok) { const { profile } = await profileRes.json(); setProfile(profile); }
        if (discoverRes.ok) { const data = await discoverRes.json(); setDiscover(data.coaches || []); }
      } else if (user.role === "coach") {
        const [profileRes, discoverRes, favRes] = await Promise.all([
          fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/profile`, { headers }),
          fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/discover`, { headers }),
          fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/favorites`, { headers }),
        ]);
        if (profileRes.ok) { const { profile } = await profileRes.json(); setProfile(profile); }
        if (discoverRes.ok) { const { athletes } = await discoverRes.json(); setDiscover(athletes || []); }
        if (favRes.ok) { const { athletes } = await favRes.json(); setSavedCount((athletes || []).length); }
      }
    } catch (err) {
      console.error("Error fetching home data:", err);
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

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#E2E8F0", marginBottom: 2 }}>
              Welcome, {firstName}
            </Text>
            <Text style={{ fontSize: 13, color: "#64748B" }}>{userEmail}</Text>
          </View>
          <View style={{ backgroundColor: userRole === "athlete" ? "#1D4ED8" : "#065F46", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>{userRole}</Text>
          </View>
        </View>

        {userRole === "athlete" && profile && (
          <AthleteHome profile={profile} discover={discover} router={router} />
        )}
        {userRole === "coach" && profile && (
          <CoachHome profile={profile} discover={discover} savedCount={savedCount} router={router} />
        )}
      </ScrollView>
    </View>
  );
}

function AthleteHome({ profile, discover, router }) {
  const status = profile.verification_status || "pending";
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.pending;

  return (
    <>
      {/* Profile card */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/profile")}
        style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#334155" }}
      >
        <Text style={{ color: "#3B82F6", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>My Profile</Text>
        <Text style={{ color: "#E2E8F0", fontWeight: "600", fontSize: 17, marginBottom: 2 }}>{profile.full_name}</Text>
        <Text style={{ color: "#64748B", fontSize: 13, marginBottom: 14 }}>{profile.current_school}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {profile.sport && (
            <View style={{ backgroundColor: "#1D4ED8", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>{profile.sport}</Text>
            </View>
          )}
          {profile.position && (
            <View style={{ backgroundColor: "#1E3A5F", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#93C5FD", fontSize: 11, fontWeight: "600" }}>{profile.position}</Text>
            </View>
          )}
          {profile.division_level && (
            <View style={{ backgroundColor: "#172554", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#BFDBFE", fontSize: 11, fontWeight: "600" }}>{profile.division_level}</Text>
            </View>
          )}
          <View style={{ backgroundColor: statusColor.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
            <Text style={{ color: statusColor.color, fontSize: 11, fontWeight: "600", textTransform: "capitalize" }}>{status}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Discover Coaches */}
      {discover.length > 0 && (
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#E2E8F0", fontSize: 16, fontWeight: "600" }}>Discover Coaches</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={{ color: "#3B82F6", fontSize: 13 }}>View all →</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 10 }}>
            {discover.slice(0, 5).map((coach) => (
              <CoachCard key={coach.user_id} coach={coach} />
            ))}
          </View>
        </View>
      )}
    </>
  );
}

function CoachCard({ coach }) {
  return (
    <View style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#334155" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#E2E8F0", fontWeight: "600", fontSize: 15, marginBottom: 2 }}>{coach.full_name}</Text>
          <Text style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>{coach.school}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {coach.sport && (
              <View style={{ backgroundColor: "#065F46", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                <Text style={{ color: "#6EE7B7", fontSize: 11, fontWeight: "600" }}>{coach.sport}</Text>
              </View>
            )}
            {coach.division_level && (
              <View style={{ backgroundColor: "#172554", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                <Text style={{ color: "#BFDBFE", fontSize: 11, fontWeight: "600" }}>{coach.division_level}</Text>
              </View>
            )}
          </View>
        </View>
        {coach.email && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${coach.email}`)}
            style={{ backgroundColor: "#1D4ED8", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginLeft: 12 }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>Contact</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function CoachHome({ profile, discover, savedCount, router }) {
  return (
    <>
      {/* Profile card */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/profile")}
        style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#334155" }}
      >
        <Text style={{ color: "#3B82F6", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>My Profile</Text>
        <Text style={{ color: "#E2E8F0", fontWeight: "600", fontSize: 17, marginBottom: 2 }}>{profile.full_name}</Text>
        <Text style={{ color: "#64748B", fontSize: 13, marginBottom: 14 }}>{profile.school}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {profile.sport && (
            <View style={{ backgroundColor: "#065F46", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#6EE7B7", fontSize: 11, fontWeight: "600" }}>{profile.sport}</Text>
            </View>
          )}
          <View style={{ backgroundColor: "#1E3A5F", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
            <Text style={{ color: "#93C5FD", fontSize: 11, fontWeight: "600" }}>Coach</Text>
          </View>
          {profile.division_level && (
            <View style={{ backgroundColor: "#172554", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
              <Text style={{ color: "#BFDBFE", fontSize: 11, fontWeight: "600" }}>{profile.division_level}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Saved athletes */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/search")}
        style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#334155" }}
      >
        <View>
          <Text style={{ color: "#64748B", fontSize: 12, marginBottom: 4 }}>Saved Athletes</Text>
          <Text style={{ color: "#E2E8F0", fontSize: 24, fontWeight: "bold" }}>{savedCount}</Text>
          <Text style={{ color: "#64748B", fontSize: 12 }}>athletes saved</Text>
        </View>
        <Text style={{ color: "#3B82F6", fontSize: 14 }}>View →</Text>
      </TouchableOpacity>

      {/* Quick links */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search")}
          style={{ flex: 1, backgroundColor: "#1E293B", borderRadius: 12, padding: 18, borderWidth: 1, borderColor: "#334155" }}
        >
          <Text style={{ color: "#E2E8F0", fontSize: 15, fontWeight: "600", marginBottom: 4 }}>Find Athletes</Text>
          <Text style={{ color: "#64748B", fontSize: 12 }}>Search verified athletes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={{ flex: 1, backgroundColor: "#1E293B", borderRadius: 12, padding: 18, borderWidth: 1, borderColor: "#334155" }}
        >
          <Text style={{ color: "#E2E8F0", fontSize: 15, fontWeight: "600", marginBottom: 4 }}>My Profile</Text>
          <Text style={{ color: "#64748B", fontSize: 12 }}>View your profile</Text>
        </TouchableOpacity>
      </View>

      {/* Discover Athletes */}
      {discover.length > 0 && (
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#E2E8F0", fontSize: 16, fontWeight: "600" }}>Discover Athletes</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={{ color: "#3B82F6", fontSize: 13 }}>View all →</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 10 }}>
            {discover.slice(0, 5).map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </View>
        </View>
      )}
    </>
  );
}

function AthleteCard({ athlete }) {
  return (
    <View style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#334155" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#E2E8F0", fontWeight: "600", fontSize: 15, marginBottom: 2 }}>{athlete.full_name}</Text>
          <Text style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>{athlete.current_school}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {athlete.sport && (
              <View style={{ backgroundColor: "#1D4ED8", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>{athlete.sport}</Text>
              </View>
            )}
            {athlete.position && (
              <View style={{ backgroundColor: "#1E3A5F", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                <Text style={{ color: "#93C5FD", fontSize: 11, fontWeight: "600" }}>{athlete.position}</Text>
              </View>
            )}
            {athlete.gender && (
              <View style={{ backgroundColor: athlete.gender === "Male" ? "#1E3A5F" : "#3B1F5E", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                <Text style={{ color: athlete.gender === "Male" ? "#93C5FD" : "#D8B4FE", fontSize: 11, fontWeight: "600" }}>{athlete.gender}</Text>
              </View>
            )}
          </View>
        </View>
        {athlete.years_of_eligibility && (
          <Text style={{ color: "#94A3B8", fontSize: 12 }}>{athlete.years_of_eligibility} yr elig.</Text>
        )}
      </View>
    </View>
  );
}
