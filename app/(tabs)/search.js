import { useAuth } from "@/utils/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { Filter, Search as SearchIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SPORTS = [
  "Basketball", "Football", "Soccer", "Baseball", "Softball", "Volleyball",
  "Tennis", "Swimming", "Track and Field", "Golf", "Lacrosse", "Wrestling",
  "Cross Country", "Gymnastics", "Rowing", "Ice Hockey", "Field Hockey", "Water Polo",
];

const DIVISION_LEVELS = ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "JUCO"];

function SportPicker({ selected, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{ backgroundColor: "#0F172A", padding: 12, borderRadius: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Text style={{ color: selected ? "#FFFFFF" : "#64748B", fontSize: 14 }}>{selected || placeholder}</Text>
        <Text style={{ color: "#64748B", fontSize: 12 }}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ backgroundColor: "#0F172A", borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: "#334155", maxHeight: 200 }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
            <TouchableOpacity
              onPress={() => { onSelect(""); setOpen(false); }}
              style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#1E293B" }}
            >
              <Text style={{ color: "#64748B", fontSize: 14 }}>Any Sport</Text>
            </TouchableOpacity>
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport}
                onPress={() => { onSelect(sport); setOpen(false); }}
                style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#1E293B", backgroundColor: selected === sport ? "#172554" : "transparent" }}
              >
                <Text style={{ color: selected === sport ? "#93C5FD" : "#E2E8F0", fontSize: 14 }}>{sport}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function SearchPage() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { auth } = useAuth();

  const [athleteFilters, setAthleteFilters] = useState({
    sport: "", position: "", division_level: "", gender: "",
  });

  const [coachFilters, setCoachFilters] = useState({
    sport: "", school: "",
  });

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) performSearch();
  }, [userRole]);

  const fetchUserRole = async () => {
    try {
      const headers = {};
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;
      const roleRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/role`, { headers });
      if (roleRes.ok) {
        const { user } = await roleRes.json();
        setUserRole(user.role);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const headers = {};
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;

      if (userRole === "coach") {
        const params = new URLSearchParams();
        if (athleteFilters.sport) params.append("sport", athleteFilters.sport);
        if (athleteFilters.position) params.append("position", athleteFilters.position);
        if (athleteFilters.division_level) params.append("division_level", athleteFilters.division_level);
        if (athleteFilters.gender) params.append("gender", athleteFilters.gender);
        const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/athletes?${params.toString()}`, { headers });
        if (res.ok) { const { athletes } = await res.json(); setResults(athletes || []); }
      } else if (userRole === "athlete") {
        const params = new URLSearchParams();
        if (coachFilters.sport) params.append("sport", coachFilters.sport);
        if (coachFilters.school) params.append("school", coachFilters.school);
        const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/coaches?${params.toString()}`, { headers });
        if (res.ok) { const { coaches } = await res.json(); setResults(coaches || []); }
      }
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateAthleteFilter = (key, value) => setAthleteFilters((prev) => ({ ...prev, [key]: value }));
  const updateCoachFilter = (key, value) => setCoachFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#334155" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#FFFFFF" }}>
            {userRole === "coach" ? "Find Athletes" : "Find Coaches"}
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={{ padding: 8 }}>
            <Filter color={showFilters ? "#3B82F6" : "#94A3B8"} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View style={{ backgroundColor: "#1E293B", padding: 16, borderBottomWidth: 1, borderBottomColor: "#334155" }}>
          {userRole === "coach" ? (
            <View style={{ gap: 12 }}>
              {/* Sport picker */}
              <SportPicker
                selected={athleteFilters.sport}
                onSelect={(v) => updateAthleteFilter("sport", v)}
                placeholder="Any sport"
              />

              {/* Gender filter */}
              <View>
                <Text style={{ color: "#94A3B8", fontSize: 12, marginBottom: 8 }}>Gender</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["", "Male", "Female"].map((g) => (
                    <TouchableOpacity
                      key={g || "all"}
                      onPress={() => updateAthleteFilter("gender", g)}
                      style={{ flex: 1, backgroundColor: athleteFilters.gender === g ? "#3B82F6" : "#0F172A", padding: 10, borderRadius: 6, alignItems: "center", borderWidth: 1, borderColor: athleteFilters.gender === g ? "#3B82F6" : "#334155" }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: athleteFilters.gender === g ? "700" : "400" }}>
                        {g || "All"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Division level */}
              <View>
                <Text style={{ color: "#94A3B8", fontSize: 12, marginBottom: 8 }}>Division</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => updateAthleteFilter("division_level", "")}
                      style={{ backgroundColor: !athleteFilters.division_level ? "#3B82F6" : "#0F172A", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: !athleteFilters.division_level ? "#3B82F6" : "#334155" }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: !athleteFilters.division_level ? "700" : "400" }}>All</Text>
                    </TouchableOpacity>
                    {DIVISION_LEVELS.map((level) => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => updateAthleteFilter("division_level", athleteFilters.division_level === level ? "" : level)}
                        style={{ backgroundColor: athleteFilters.division_level === level ? "#3B82F6" : "#0F172A", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: athleteFilters.division_level === level ? "#3B82F6" : "#334155" }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: athleteFilters.division_level === level ? "700" : "400" }}>{level}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <TouchableOpacity onPress={performSearch} style={{ backgroundColor: "#3B82F6", padding: 12, borderRadius: 8, alignItems: "center" }}>
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <SportPicker
                selected={coachFilters.sport}
                onSelect={(v) => updateCoachFilter("sport", v)}
                placeholder="Any sport"
              />
              <TouchableOpacity onPress={performSearch} style={{ backgroundColor: "#3B82F6", padding: 12, borderRadius: 8, alignItems: "center" }}>
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : results.length === 0 ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <SearchIcon color="#64748B" size={48} />
            <Text style={{ fontSize: 16, color: "#94A3B8", marginTop: 16, textAlign: "center" }}>
              {userRole === "coach" ? "No athletes found" : "No coaches found"}
            </Text>
            <Text style={{ fontSize: 13, color: "#475569", marginTop: 8, textAlign: "center" }}>
              Try adjusting your filters
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {results.map((item) =>
              userRole === "coach" ? (
                <AthleteResultCard key={item.id} athlete={item} />
              ) : (
                <CoachResultCard key={item.user_id} coach={item} />
              )
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AthleteResultCard({ athlete }) {
  return (
    <View style={{ backgroundColor: "#1E293B", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#334155" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#E2E8F0", marginBottom: 2 }}>{athlete.full_name}</Text>
          <Text style={{ fontSize: 13, color: "#64748B" }}>{athlete.current_school}</Text>
        </View>
        {athlete.years_of_eligibility && (
          <Text style={{ fontSize: 12, color: "#94A3B8" }}>{athlete.years_of_eligibility} yr elig.</Text>
        )}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
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
        {athlete.division_level && (
          <View style={{ backgroundColor: "#172554", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#BFDBFE", fontSize: 11, fontWeight: "600" }}>{athlete.division_level}</Text>
          </View>
        )}
        {athlete.gender && (
          <View style={{ backgroundColor: athlete.gender === "Male" ? "#1E3A5F" : "#3B1F5E", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: athlete.gender === "Male" ? "#93C5FD" : "#D8B4FE", fontSize: 11, fontWeight: "600" }}>{athlete.gender}</Text>
          </View>
        )}
        {athlete.stats_link && (
          <View style={{ backgroundColor: "#065F46", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#6EE7B7", fontSize: 11, fontWeight: "600" }}>✓ Stats Verified</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {athlete.stats_link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(athlete.stats_link)}
            style={{ flex: 1, backgroundColor: "#065F46", padding: 10, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#6EE7B7", fontSize: 12, fontWeight: "600" }}>View Stats →</Text>
          </TouchableOpacity>
        )}
        {athlete.school_athletics_link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(athlete.school_athletics_link)}
            style={{ flex: 1, backgroundColor: "#1E3A5F", padding: 10, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#93C5FD", fontSize: 12, fontWeight: "600" }}>School Profile →</Text>
          </TouchableOpacity>
        )}
        {athlete.optional_contact_email && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${athlete.optional_contact_email}`)}
            style={{ flex: 1, backgroundColor: "#1D4ED8", padding: 10, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>Contact</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function CoachResultCard({ coach }) {
  return (
    <View style={{ backgroundColor: "#1E293B", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#334155" }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "#E2E8F0", marginBottom: 2 }}>{coach.full_name}</Text>
      <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}>{coach.school}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
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
      {coach.email && (
        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:${coach.email}`)}
          style={{ backgroundColor: "#3B82F6", padding: 12, borderRadius: 8, alignItems: "center" }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "bold" }}>Contact Coach</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
