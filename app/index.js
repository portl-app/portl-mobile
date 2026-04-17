import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { isReady, isAuthenticated, auth, signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isReady) return;

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const headers = {};
        if (auth?.jwt) {
          headers.Authorization = `Bearer ${auth.jwt}`;
        }

        const roleRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/role`, { headers });
        if (roleRes.ok) {
          const { user } = await roleRes.json();

          if (!user.role) {
            router.replace("/role-selection");
            return;
          }

          if (user.role === "athlete") {
            const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`, { headers });
            if (profileRes.ok) {
              const { profile } = await profileRes.json();
              if (profile) {
                router.replace("/(tabs)");
              } else {
                router.replace("/athlete-onboarding");
              }
            }
          } else if (user.role === "coach") {
            const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/profile`, { headers });
            if (profileRes.ok) {
              const { profile } = await profileRes.json();
              if (profile) {
                router.replace("/(tabs)");
              } else {
                router.replace("/coach-onboarding");
              }
            }
          } else {
            router.replace("/(tabs)");
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [isReady, isAuthenticated, auth]);

  if (!isReady || loading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="light" />
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}>
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Text style={{ fontSize: 48, fontWeight: "bold", color: "#000000", textAlign: "center", marginBottom: 12 }}>
            Portl
          </Text>
        </View>

        <View style={{ backgroundColor: "#F5F5F5", padding: 20, borderRadius: 12, marginBottom: 24 }}>
          <Text style={{ fontSize: 16, color: "#111111", lineHeight: 24, textAlign: "center" }}>
            Connect verified transfer portal athletes with college coaches
          </Text>
        </View>

        <View style={{ backgroundColor: "#FEF3C7", padding: 16, borderRadius: 8, marginBottom: 32 }}>
          <Text style={{ fontSize: 13, color: "#92400E", lineHeight: 20 }}>
            ⚠️ This platform is not affiliated with the NCAA
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <TouchableOpacity
            onPress={() => signIn()}
            style={{ backgroundColor: "#000000", padding: 16, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signUp()}
            style={{ backgroundColor: "#F5F5F5", padding: 16, borderRadius: 8, alignItems: "center", borderWidth: 2, borderColor: "#000000" }}
          >
            <Text style={{ color: "#000000", fontSize: 16, fontWeight: "bold" }}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}