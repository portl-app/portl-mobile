import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text, TextInput, TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CoachOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "", school: "", sport: "", email: "", recruiting_for: "",
  });

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

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
        method: "POST", headers, body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create profile");
      router.replace("/(tabs)");
    } catch (err) {
      setError(err.message || "Failed to complete onboarding");
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>Coach Profile</Text>
          <Text style={{ fontSize: 14, color: "#94A3B8" }}>Set up your recruiting profile</Text>
        </View>

        <View style={{ gap: 20 }}>
          {[
            ["Full Name *", "full_name", "Enter your full name", false],
            ["School/Team *", "school", "e.g. University of Alabama", false],
            ["Sport *", "sport", "e.g. Football, Basketball", false],
            ["Contact Email *", "email", "your.email@school.edu", true],
          ].map(([label, field, placeholder, email]) => (
            <View key={field}>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>{label}</Text>
              <TextInput
                value={formData[field]}
                onChangeText={(val) => updateField(field, val)}
                placeholder={placeholder}
                placeholderTextColor="#64748B"
                keyboardType={email ? "email-address" : "default"}
                autoCapitalize={email ? "none" : "words"}
                style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }}
              />
            </View>
          ))}

          <View>
            <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Recruiting For</Text>
            <TextInput
              value={formData.recruiting_for}
              onChangeText={(val) => updateField("recruiting_for", val)}
              placeholder="e.g. Class of 2025, Specific positions"
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16, height: 80, textAlignVertical: "top" }}
            />
          </View>
        </View>

        {error && (
          <View style={{ backgroundColor: "#FEE2E2", padding: 16, borderRadius: 8, marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: "#991B1B" }}>{error}</Text>
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
    </View>
  );
}