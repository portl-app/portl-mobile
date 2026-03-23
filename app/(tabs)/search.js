import { useAuth } from "@/utils/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { Filter, Search as SearchIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchPage() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { auth } = useAuth();

  const [athleteFilters, setAthleteFilters] = useState({
    sport: "", position: "", division_level: "", years_of_eligibility: "", current_school: "",
  });

  const [coachFilters, setCoachFilters] = useState({
    sport: "", school: "",
  });

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      performSearch();
    }
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
    } catch (error) {
      console.error("Error fetching user role:", error);
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
        if (athleteFilters.years_of_eligibility) params.append("years_of_eligibility", athleteFilters.years_of_eligibility);
        if (athleteFilters.current_school) params.append("current_school", athleteFilters.current_school);
        const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/athletes?${params.toString()}`, { headers });
        if (res.ok) {
          const { athletes } = await res.json();
          setResults(athletes);
        }
      } else if (userRole === "athlete") {
        const params = new URLSearchParams();
        if (coachFilters.sport) params.append("sport", coachFilters.sport);
        if (coachFilters.school) params.append("school", coachFilters.school);
        const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/coaches?${params.toString()}`, { headers });
        if (res.ok) {
          const { coaches } = await res.json();
          setResults(coaches);
        }
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAthleteFilter = (key, value) => setAthleteFilters((prev) => ({ ...prev, [key]: value }));
  const updateCoachFilter = (key, value) => setCoachFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}>
      <StatusBar style="light" />
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#334155" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF" }}>
            {userRole === "coach" ? "Find Athletes" : "Find Coaches"}
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={{ padding: 8 }}>
            <Filter color={showFilters ? "#3B82F6" : "#94A3B8"} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View style={{ backgroundColor: "#1E293B", padding: 16, borderBottomWidth: 1, borderBottomColor: "#334155" }}>
          {userRole === "coach" ? (
            <View style={{ gap: 12 }}>
              <TextInput value={athleteFilters.sport} onChangeText={(val) => updateAthleteFilter("sport", val)} placeholder="Sport (e.g. Football)" placeholderTextColor="#64748B" style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: 12, borderRadius: 8, fontSize: 14 }} />
              <TextInput value={athleteFilters.position} onChangeText={(val) => updateAthleteFilter("position", val)} placeholder="Position (e.g. Quarterback)" placeholderTextColor="#64748B" style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: 12, borderRadius: 8, fontSize: 14 }} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["D1", "D2", "D3", "NAIA", "JUCO"].map((level) => (
                  <TouchableOpacity key={level} onPress={() => updateAthleteFilter("division_level", athleteFilters.division_level === level ? "" : level)} style={{ flex: 1, backgroundColor: athleteFilters.division_level === level ? "#3B82F6" : "#0F172A", padding: 10, borderRadius: 6, alignItems: "center" }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: athleteFilters.division_level === level ? "bold" : "normal" }}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={performSearch} style={{ backgroundColor: "#3B82F6", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <TextInput value={coachFilters.sport} onChangeText={(val) => updateCoachFilter("sport", val)} placeholder="Sport (e.g. Basketball)" placeholderTextColor="#64748B" style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: 12, borderRadius: 8, fontSize: 14 }} />
              <TextInput value={coachFilters.school} onChangeText={(val) => updateCoachFilter("school", val)} placeholder="School name" placeholderTextColor="#64748B" style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: 12, borderRadius: 8, fontSize: 14 }} />
              <TouchableOpacity onPress={performSearch} style={{ backgroundColor: "#3B82F6", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
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
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {results.map((item) => (
              <View key={item.id} style={{ backgroundColor: "#1E293B", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#334155" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>{item.full_name}</Text>
                {userRole === "coach" ? (
                  <>
                    <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 4 }}>{item.position} • {item.sport}</Text>
                    <Text style={{ fontSize: 14, color: "#94A3B8", marginBottom: 4 }}>{item.current_school} • {item.division_level}</Text>
                    {item.optional_contact_email && (
                      <TouchableOpacity onPress={() => Linking.openURL(`mailto:${item.optional_contact_email}`)} style={{ backgroundColor: "#3B82F6", padding: 12, borderRadius: 8, marginTop: 8 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold", textAlign: "center" }}>📧 {item.optional_contact_email}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 4 }}>{item.school}</Text>
                    <Text style={{ fontSize: 14, color: "#94A3B8", marginBottom: 12 }}>{item.sport}</Text>
                    {item.email && (
                      <TouchableOpacity onPress={() => Linking.openURL(`mailto:${item.email}`)} style={{ backgroundColor: "#3B82F6", padding: 12, borderRadius: 8 }}>
                        <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold", textAlign: "center" }}>📧 {item.email}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}