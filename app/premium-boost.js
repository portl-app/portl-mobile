import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Award, Bell, Check, Eye, Sparkles, TrendingUp, Zap } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PremiumBoostPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const features = [
    { icon: TrendingUp, title: "Top of Feed Priority", description: "Your profile appears first in every coach's discover feed and search results" },
    { icon: Eye, title: "10x More Visibility", description: "Get significantly more profile views from recruiters actively looking for talent" },
    { icon: Award, title: "Featured Badge", description: 'Stand out with a premium "Featured Athlete" badge on your profile' },
    { icon: Bell, title: "Instant Notifications", description: "Get notified immediately when coaches view or favorite your profile" },
    { icon: Zap, title: "Boosted for 30 Days", description: "Stay at the top of coaches' feeds for a full month of maximum exposure" },
  ];

  const plans = [
    { name: "1 Month Boost", price: "$4.99", period: "one-time", popular: false },
    { name: "3 Month Boost", price: "$12.99", period: "one-time", savings: "Save 13%", popular: true },
    { name: "Season Pass", price: "$19.99", period: "6 months", savings: "Save 33%", popular: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}>
      <StatusBar style="light" />

      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1E293B" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" }}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginLeft: 16 }}>Premium Boost</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>

        <View style={{ backgroundColor: "#7C3AED", borderRadius: 20, padding: 32, marginBottom: 32, alignItems: "center" }}>
          <View style={{ backgroundColor: "#FDE047", width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
            <Sparkles size={40} color="#78350F" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF", marginBottom: 12, textAlign: "center" }}>Get Discovered Faster</Text>
          <Text style={{ fontSize: 16, color: "#E9D5FF", textAlign: "center", lineHeight: 24 }}>
            Premium athletes get 10x more profile views and appear at the top of every recruiter's feed
          </Text>
        </View>

        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#FFFFFF", marginBottom: 20 }}>Premium Features</Text>
        <View style={{ gap: 16, marginBottom: 32 }}>
          {features.map((feature, index) => (
            <View key={index} style={{ backgroundColor: "#1E293B", padding: 20, borderRadius: 12, flexDirection: "row", alignItems: "flex-start", borderWidth: 1, borderColor: "#334155" }}>
              <View style={{ backgroundColor: "#7C3AED", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 16 }}>
                <feature.icon size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#FFFFFF", marginBottom: 6 }}>{feature.title}</Text>
                <Text style={{ fontSize: 14, color: "#94A3B8", lineHeight: 20 }}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#FFFFFF", marginBottom: 20 }}>Choose Your Plan</Text>
        <View style={{ gap: 16, marginBottom: 32 }}>
          {plans.map((plan, index) => (
            <TouchableOpacity key={index} style={{ backgroundColor: plan.popular ? "#7C3AED" : "#1E293B", padding: 20, borderRadius: 12, borderWidth: plan.popular ? 3 : 1, borderColor: plan.popular ? "#FDE047" : "#334155" }}>
              {plan.popular && (
                <View style={{ position: "absolute", top: -12, left: 20, backgroundColor: "#FDE047", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "bold", color: "#78350F" }}>MOST POPULAR</Text>
                </View>
              )}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 }}>{plan.name}</Text>
                  <Text style={{ fontSize: 14, color: plan.popular ? "#E9D5FF" : "#94A3B8" }}>{plan.period}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF" }}>{plan.price}</Text>
                  {plan.savings && <Text style={{ fontSize: 13, color: "#FDE047", fontWeight: "600" }}>{plan.savings}</Text>}
                </View>
              </View>
              <View style={{ backgroundColor: plan.popular ? "#FFFFFF" : "#7C3AED", paddingVertical: 12, borderRadius: 8, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: plan.popular ? "#7C3AED" : "#FFFFFF" }}>Select Plan</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ backgroundColor: "#1E293B", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#334155" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 16 }}>How It Works</Text>
          <View style={{ gap: 12 }}>
            {[
              "Your profile instantly goes to the top of all coach feeds",
              "Coaches see your \"Featured\" badge, making you stand out",
              "You get notified every time a coach views or favorites you",
              "Boost lasts for the duration of your selected plan",
            ].map((item, index) => (
              <View key={index} style={{ flexDirection: "row" }}>
                <View style={{ backgroundColor: "#10B981", width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12, marginTop: 2 }}>
                  <Check size={12} color="#FFFFFF" />
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: "#CBD5E1", lineHeight: 20 }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}