import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogOut, Pencil } from "lucide-react-native";
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
  verified: { bg: "#065F46", color: "#6EE7B7", label: "Verified" },
  pending:  { bg: "#1E3A5F", color: "#93C5FD", label: "Pending Review" },
  flagged:  { bg: "#78350F", color: "#FCD34D", label: "Flagged" },
  rejected: { bg: "#7F1D1D", color: "#FCA5A5", label: "Rejected" },
};

function formatStatKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Ppg/, "PPG").replace(/Rpg/, "RPG").replace(/Apg/, "APG")
    .replace(/Spg/, "SPG").replace(/Bpg/, "BPG").replace(/Fg /, "FG ")
    .replace(/Pct/, "%").replace(/Gaa/, "GAA").replace(/Pim/, "PIM")
    .replace(/Ops/, "OPS").replace(/Era/, "ERA").replace(/Whip/, "WHIP");
}

function calcAge(dob) {
  if (!dob) return null;
  const parts = dob.split("/");
  if (parts.length !== 3) return null;
  const birth = new Date(`${parts[2]}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`);
  if (isNaN(birth)) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Renders a label+value row; hides itself when value is falsy
function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#0F172A" }}>
      <Text style={{ fontSize: 13, color: "#64748B", width: 160, flexShrink: 0 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: "#E2E8F0", fontWeight: "500", flex: 1 }}>{value}</Text>
    </View>
  );
}

// Renders a tappable URL row; hides itself when url is falsy
function LinkRow({ label, url, buttonLabel }) {
  if (!url) return null;
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#0F172A" }}>
      <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(url)}
        style={{ backgroundColor: "#172554", padding: 10, borderRadius: 8, alignItems: "center" }}
      >
        <Text style={{ color: "#93C5FD", fontSize: 13, fontWeight: "600" }}>{buttonLabel || "Open →"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#334155" }}>
      <Text style={{ color: "#64748B", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function ProfilePage() {
  const { signOut, auth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const headers = {};
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;

      const roleRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/role`, { headers });
      if (!roleRes.ok) return;
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

  // Parse stats JSON if present
  let parsedStats = {};
  if (profile?.stats) {
    try { parsedStats = JSON.parse(profile.stats); } catch {}
  }
  const statEntries = Object.entries(parsedStats).filter(([, v]) => v);

  // Parse coach recruiting positions
  let recruitingPositions = [];
  if (profile?.recruiting_positions) {
    try { recruitingPositions = JSON.parse(profile.recruiting_positions); } catch {}
  }

  const age = calcAge(profile?.dob);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#FFFFFF" }}>Profile</Text>
          {userRole === "athlete" && (
            <TouchableOpacity
              onPress={() => router.push("/athlete-onboarding")}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1E293B", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#334155" }}
            >
              <Pencil color="#94A3B8" size={14} />
              <Text style={{ color: "#94A3B8", fontSize: 13, fontWeight: "600" }}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Identity card */}
        <View style={{ backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#334155", alignItems: "center" }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: userRole === "athlete" ? "#1D4ED8" : "#065F46", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "bold" }}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 }}>
            {profile?.full_name || "—"}
          </Text>
          <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>{userEmail}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            <View style={{ backgroundColor: userRole === "athlete" ? "#1D4ED8" : "#065F46", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>{userRole}</Text>
            </View>
            {userRole === "athlete" && (
              <View style={{ backgroundColor: statusColor.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
                <Text style={{ color: statusColor.color, fontSize: 12, fontWeight: "600" }}>{statusColor.label}</Text>
              </View>
            )}
            {profile?.sport && (
              <View style={{ backgroundColor: "#172554", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
                <Text style={{ color: "#93C5FD", fontSize: 12, fontWeight: "600" }}>{profile.sport}</Text>
              </View>
            )}
            {profile?.division_level && (
              <View style={{ backgroundColor: "#1E293B", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "#334155" }}>
                <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "600" }}>{profile.division_level}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── ATHLETE SECTIONS ── */}
        {userRole === "athlete" && profile && (
          <>
            {/* Personal Information */}
            <Section title="Personal Information">
              <InfoRow label="Gender" value={profile.gender} />
              <InfoRow
                label="Age / Date of Birth"
                value={profile.dob ? `${age ? `${age} yrs — ` : ""}${profile.dob}` : null}
              />
              <InfoRow label="Hometown" value={profile.hometown} />
              <InfoRow label="Height" value={profile.height} />
              <InfoRow label="Weight" value={profile.weight} />
              <InfoRow label="Dominant Hand/Foot" value={profile.dominant_hand} />
            </Section>

            {/* Athletic Information */}
            <Section title="Athletic Information">
              <InfoRow label="Current School" value={profile.current_school} />
              <InfoRow label="Division Level" value={profile.division_level} />
              <InfoRow label="Sport" value={profile.sport} />
              <InfoRow label="Primary Position" value={profile.position} />
              <InfoRow label="Secondary Position" value={profile.secondary_position} />
              <InfoRow label="Years of Eligibility" value={profile.years_of_eligibility} />
              <InfoRow label="Achievements" value={profile.achievements} />
              <LinkRow label="Highlight Video" url={profile.video_link} buttonLabel="Watch Highlight Video →" />
              <InfoRow label="Contact Email" value={profile.optional_contact_email} />
              <LinkRow label="Official Stats" url={profile.stats_link} buttonLabel="View Official Stats →" />
              <LinkRow label="School Athletics Profile" url={profile.school_athletics_link} buttonLabel="View School Profile →" />
              {statEntries.length > 0 && (
                <View style={{ paddingTop: 10 }}>
                  <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>
                    {profile.sport} Stats
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {statEntries.map(([key, val]) => (
                      <View key={key} style={{ backgroundColor: "#0F172A", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 80 }}>
                        <Text style={{ fontSize: 11, color: "#64748B", marginBottom: 2 }}>{formatStatKey(key)}</Text>
                        <Text style={{ fontSize: 14, color: "#E2E8F0", fontWeight: "700" }}>{val}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Section>

            {/* Academic Information */}
            {(profile.academic_status || profile.gpa || profile.major || profile.minor || profile.graduation_year || profile.academic_honors) && (
              <Section title="Academic Information">
                <InfoRow label="Academic Status" value={profile.academic_status} />
                <InfoRow label="Graduation Year" value={profile.graduation_year} />
                <InfoRow label="GPA" value={profile.gpa} />
                <InfoRow label="Major" value={profile.major} />
                <InfoRow label="Minor" value={profile.minor} />
                <InfoRow label="Academic Honors" value={profile.academic_honors} />
              </Section>
            )}
          </>
        )}

        {/* ── COACH SECTIONS ── */}
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
              {recruitingPositions.length > 0 && (
                <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#0F172A" }}>
                  <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>Recruiting Positions</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {recruitingPositions.map((pos) => (
                      <View key={pos} style={{ backgroundColor: "#172554", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                        <Text style={{ color: "#93C5FD", fontSize: 12, fontWeight: "600" }}>{pos}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              <InfoRow label="Recruiting Notes" value={profile.recruiting_notes} />
            </Section>
          </>
        )}

        {/* NCAA disclaimer */}
        <View style={{ backgroundColor: "#1C1708", padding: 14, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: "#78350F" }}>
          <Text style={{ fontSize: 12, color: "#FCD34D", lineHeight: 18 }}>
            ⚠️ Portl is not affiliated with, endorsed by, or sponsored by the NCAA.
          </Text>
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
