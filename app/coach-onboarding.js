import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SPORTS = [
  "Basketball", "Football", "Soccer", "Baseball", "Softball", "Volleyball",
  "Tennis", "Swimming", "Track and Field", "Golf", "Lacrosse", "Wrestling",
  "Cross Country", "Gymnastics", "Rowing", "Ice Hockey", "Field Hockey", "Water Polo",
];

const SPORT_POSITIONS = {
  Basketball: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  Football: ["Quarterback", "Running Back", "Wide Receiver", "Tight End", "Offensive Lineman", "Defensive Lineman", "Linebacker", "Cornerback", "Safety", "Kicker", "Punter", "Long Snapper"],
  Soccer: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  Baseball: ["Pitcher", "Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field", "Designated Hitter"],
  Softball: ["Pitcher", "Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field", "Designated Player"],
  Volleyball: ["Setter", "Outside Hitter", "Middle Blocker", "Opposite Hitter", "Libero", "Defensive Specialist"],
  Tennis: ["Singles", "Doubles", "Both"],
  Swimming: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Individual Medley", "Distance Freestyle"],
  "Track and Field": ["Sprints (100m/200m)", "Middle Distance (400m/800m)", "Distance (1500m+)", "Hurdles", "Long Jump", "Triple Jump", "High Jump", "Pole Vault", "Shot Put", "Discus", "Javelin", "Hammer", "Decathlon/Heptathlon"],
  Golf: ["Stroke Play", "Match Play"],
  Lacrosse: ["Attack", "Midfield", "Defense", "Goalkeeper"],
  Wrestling: ["125 lbs", "133 lbs", "141 lbs", "149 lbs", "157 lbs", "165 lbs", "174 lbs", "184 lbs", "197 lbs", "285 lbs (HWT)"],
  "Cross Country": ["5K Runner", "6K Runner", "8K/10K Runner"],
  Gymnastics: ["All-Around", "Floor Exercise", "Balance Beam", "Uneven Bars", "Vault", "Horizontal Bar", "Parallel Bars", "Pommel Horse", "Rings"],
  Rowing: ["Coxswain", "Rower - Sweep", "Rower - Sculling"],
  "Ice Hockey": ["Center", "Left Wing", "Right Wing", "Defense", "Goalie"],
  "Field Hockey": ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  "Water Polo": ["Goalkeeper", "Field Player", "Attacker", "Defender"],
};

const DIVISION_LEVELS = ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "JUCO"];

function getRecruitingPositionsLabel(sport) {
  if (sport === "Tennis") return "Recruiting Play Styles";
  if (sport === "Wrestling") return "Recruiting Weight Classes";
  if (sport === "Swimming") return "Recruiting Events/Strokes";
  if (sport === "Track and Field") return "Recruiting Events/Specialties";
  if (sport === "Cross Country") return "Recruiting Runners";
  if (sport === "Gymnastics") return "Recruiting Events/Specialties";
  if (sport === "Rowing") return "Recruiting Roles";
  return "Recruiting Positions";
}

function SportPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{ backgroundColor: "#1E293B", padding: 16, borderRadius: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Text style={{ color: selected ? "#FFFFFF" : "#64748B", fontSize: 16 }}>{selected || "Select sport..."}</Text>
        <Text style={{ color: "#64748B", fontSize: 14 }}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ backgroundColor: "#1E293B", borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: "#334155" }}>
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport}
              onPress={() => { onSelect(sport); setOpen(false); }}
              style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: "#0F172A", backgroundColor: selected === sport ? "#172554" : "transparent" }}
            >
              <Text style={{ color: selected === sport ? "#93C5FD" : "#E2E8F0", fontSize: 15 }}>{sport}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CoachOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "", school: "", sport: "", email: "",
    division_level: "", recruiting_positions: [], recruiting_notes: "",
  });

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const togglePosition = (pos) => {
    setFormData((prev) => {
      const current = prev.recruiting_positions || [];
      const next = current.includes(pos) ? current.filter((p) => p !== pos) : [...current, pos];
      return { ...prev, recruiting_positions: next };
    });
  };

  const positions = SPORT_POSITIONS[formData.sport] || [];
  const recruitingLabel = getRecruitingPositionsLabel(formData.sport);

  const handleSubmit = async () => {
    setError(null);
    if (!formData.full_name || !formData.school || !formData.sport || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;

      const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/profile`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create profile");
      router.replace("/(tabs)");
    } catch (err) {
      setError(err.message || "Failed to complete onboarding");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>Coach Profile</Text>
          <Text style={{ fontSize: 14, color: "#94A3B8" }}>Set up your recruiting profile</Text>
        </View>

        <View style={{ gap: 20 }}>
          <View>
            <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Full Name *</Text>
            <TextInput value={formData.full_name} onChangeText={(v) => updateField("full_name", v)} placeholder="Enter your full name" placeholderTextColor="#64748B" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
          </View>

          <View>
            <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>School/Team *</Text>
            <TextInput value={formData.school} onChangeText={(v) => updateField("school", v)} placeholder="e.g. University of Alabama" placeholderTextColor="#64748B" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
          </View>

          <View>
            <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Sport *</Text>
            <SportPicker selected={formData.sport} onSelect={(v) => { updateField("sport", v); updateField("recruiting_positions", []); }} />
          </View>

          <View>
            <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Contact Email *</Text>
            <TextInput value={formData.email} onChangeText={(v) => updateField("email", v)} placeholder="your.email@school.edu" placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
          </View>

          <View>
            <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Division Level</Text>
            <View style={{ gap: 8 }}>
              {DIVISION_LEVELS.map((level) => (
                <TouchableOpacity key={level} onPress={() => updateField("division_level", formData.division_level === level ? "" : level)} style={{ backgroundColor: formData.division_level === level ? "#172554" : "#1E293B", padding: 14, borderRadius: 8, borderWidth: 1, borderColor: formData.division_level === level ? "#3B82F6" : "#334155" }}>
                  <Text style={{ color: formData.division_level === level ? "#93C5FD" : "#E2E8F0", fontSize: 15, fontWeight: formData.division_level === level ? "700" : "400" }}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {positions.length > 0 && (
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>{recruitingLabel}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {positions.map((pos) => {
                  const selected = formData.recruiting_positions.includes(pos);
                  return (
                    <TouchableOpacity
                      key={pos}
                      onPress={() => togglePosition(pos)}
                      style={{ backgroundColor: selected ? "#172554" : "#1E293B", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: selected ? "#3B82F6" : "#334155" }}
                    >
                      <Text style={{ color: selected ? "#93C5FD" : "#94A3B8", fontSize: 13, fontWeight: selected ? "700" : "400" }}>{pos}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View>
            <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Recruiting Notes</Text>
            <TextInput
              value={formData.recruiting_notes}
              onChangeText={(v) => updateField("recruiting_notes", v)}
              placeholder="e.g. Looking for immediate impact players, Class of 2025..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 15, height: 100, textAlignVertical: "top" }}
            />
          </View>
        </View>

        {error && (
          <View style={{ backgroundColor: "#450A0A", padding: 14, borderRadius: 8, marginTop: 20 }}>
            <Text style={{ fontSize: 14, color: "#FCA5A5" }}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{ backgroundColor: "#3B82F6", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 32, opacity: loading ? 0.5 : 1 }}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>Complete Profile</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
