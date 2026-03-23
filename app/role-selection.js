import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RoleSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { auth } = useAuth();

  const selectRole = async (role) => {
    setLoading(true);
    setError(null);

    try {
      const headers = { "Content-Type": "application/json" };
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;

      const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/role`, {
        method: "POST",
        headers,
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set role");

      if (role === "athlete") {
        router.replace("/athlete-onboarding");
      } else if (role === "coach") {
        router.replace("/coach-onboarding");
      }
    } catch (err) {
      setError(err.message || "Failed to set role. Please try again.");
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}>
      <StatusBar style="light" />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}>
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text style={{ fontSize: 36, fontWeight: "bold", color: "#3B82F6", marginBottom: 8 }}>Portl</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>I am a...</Text>
        <Text style={{ fontSize: 16, color: "#94A3B8", marginBottom: 32 }}>Select your role to get started</Text>

        <View style={{ gap: 16 }}>
          <TouchableOpacity
            onPress={() => selectRole("athlete")}
            disabled={loading}
            style={{ backgroundColor: "#3B82F6", padding: 24, borderRadius: 12, opacity: loading ? 0.5 : 1 }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>Athlete</Text>
            <Text style={{ fontSize: 14, color: "#DBEAFE", lineHeight: 20 }}>
              I'm in the transfer portal and want to get verified so coaches can find me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => selectRole("coach")}
            disabled={loading}
            style={{ backgroundColor: "#1E293B", padding: 24, borderRadius: 12, borderWidth: 1, borderColor: "#334155", opacity: loading ? 0.5 : 1 }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>Coach</Text>
            <Text style={{ fontSize: 14, color: "#94A3B8", lineHeight: 20 }}>
              I'm looking for verified transfer portal athletes to recruit
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={{ backgroundColor: "#FEE2E2", padding: 16, borderRadius: 8, marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: "#991B1B" }}>{error}</Text>
          </View>
        )}

        {loading && (
          <View style={{ marginTop: 32, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
      </View>
    </View>
  );
}