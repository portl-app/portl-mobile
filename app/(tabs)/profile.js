import { useAuth } from "@/utils/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { LogOut } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_COLORS = {
  verified: { bg: "#065F46", color: "#6EE7B7" },
  pending:  { bg: "#1E3A5F", color: "#93C5FD" },
  flagged:  { bg: "#78350F", color: "#FCD34D" },
  rejected: { bg: "#7F1D1D", color: "#FCA5A5" },
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1E293B" }}>
      <Text style={{ fontSize: 13, color: "#64748B", width: 150, flexShrink: 0 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: "#E2E8F0", fontWeight: "500", flex: 1 }}>{value}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#334155" }}>
      <Text style={{ color: "#64748B", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>{title}</Text>
      {children}
    </View>
  );
}

export default function ProfilePage() {
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

        const endpoint = user.role === "athlete"
          ? `${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`
          : `${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/profile`;

        const profileRes = await fetch(endpoint, { headers });
        if (profileRes.ok) {
          const { profile } = await profileRes.json();
          setProfile(profile);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
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

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: "#0F172A" }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  const status = profile?.verification_status || "pending";
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.pending;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#FFFFFF", marginBottom: 24 }}>Profile</Text>

        {/* Identity header */}
        <View style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#334155", alignItems: "center" }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: userRole === "athlete" ? "#1D4ED8" : "#065F46", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "bold" }}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 }}>{profile?.full_name || "—"}</Text>
          <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>{userEmail}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ backgroundColor: userRole === "athlete" ? "#1D4ED8" : "#065F46", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>{userRole}</Text>
            </View>
            {userRole === "athlete" && (
              <View style={{ backgroundColor: statusColor.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
                <Text style={{ color: statusColor.color, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>{status}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Athlete sections */}
        {userRole === "athlete" && profile && (
          <>
            <Section title="Personal Information">
              <InfoRow label="Full Name" value={profile.full_name} />
              <InfoRow label="Height" value={profile.height} />
              <InfoRow label="Weight" value={profile.weight} />
              <InfoRow label="Gender" value={profile.gender} />
              <InfoRow label="Contact Email" value={profile.optional_contact_email} />
            </Section>

            <Section title="Athletic Information">
              <InfoRow label="Sport" value={profile.sport} />
              <InfoRow label="Position" value={profile.position} />
              <InfoRow label="Current School" value={profile.current_school} />
              <InfoRow label="Division Level" value={profile.division_level} />
              <InfoRow label="Graduation Year" value={profile.graduation_year} />
              <InfoRow label="Years of Eligibility" value={profile.years_of_eligibility} />
              <InfoRow label="Achievements" value={profile.achievements} />
              {profile.video_link && (
                <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1E293B" }}>
                  <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>Highlight Video</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(profile.video_link)}>
                    <Text style={{ color: "#3B82F6", fontSize: 13 }} numberOfLines={1}>{profile.video_link}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Section>

            {(profile.stats_link || profile.school_athletics_link) && (
              <Section title="Stats Verification">
                {profile.stats_link && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Official Stats</Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(profile.stats_link)}
                      style={{ backgroundColor: "#065F46", padding: 12, borderRadius: 8, alignItems: "center" }}
                    >
                      <Text style={{ color: "#6EE7B7", fontSize: 13, fontWeight: "600" }}>View Official Stats →</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {profile.school_athletics_link && (
                  <View>
                    <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>School Athletics Profile</Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(profile.school_athletics_link)}
                      style={{ backgroundColor: "#1E3A5F", padding: 12, borderRadius: 8, alignItems: "center" }}
                    >
                      <Text style={{ color: "#93C5FD", fontSize: 13, fontWeight: "600" }}>View School Profile →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Section>
            )}

            {profile.gpa && (
              <Section title="Academic Information">
                <InfoRow label="GPA" value={profile.gpa} />
                <InfoRow label="Major" value={profile.major} />
                <InfoRow label="Academic Honors" value={profile.academic_honors} />
              </Section>
            )}
          </>
        )}

        {/* Coach sections */}
        {userRole === "coach" && profile && (
          <>
            <Section title="Personal Information">
              <InfoRow label="Full Name" value={profile.full_name} />
              <InfoRow label="Contact Email" value={profile.email} />
            </Section>

            <Section title="Coaching Information">
              <InfoRow label="School" value={profile.school} />
              <InfoRow label="Sport" value={profile.sport} />
              <InfoRow label="Division Level" value={profile.division_level} />
              {profile.recruiting_positions && (() => {
                let positions = [];
                try { positions = JSON.parse(profile.recruiting_positions); } catch {}
                return positions.length > 0 ? (
                  <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1E293B" }}>
                    <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>Recruiting Positions</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {positions.map((pos) => (
                        <View key={pos} style={{ backgroundColor: "#172554", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                          <Text style={{ color: "#93C5FD", fontSize: 12, fontWeight: "600" }}>{pos}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null;
              })()}
              <InfoRow label="Recruiting Notes" value={profile.recruiting_notes} />
            </Section>
          </>
        )}

        {/* NCAA disclaimer */}
        <View style={{ backgroundColor: "#1C1708", padding: 14, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: "#78350F" }}>
          <Text style={{ fontSize: 12, color: "#FCD34D", lineHeight: 18 }}>⚠️ Portl is not affiliated with, endorsed by, or sponsored by the NCAA.</Text>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          style={{ backgroundColor: "#7F1D1D", padding: 16, borderRadius: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}
        >
          <LogOut color="#FCA5A5" size={18} />
          <Text style={{ color: "#FCA5A5", fontSize: 15, fontWeight: "bold" }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
