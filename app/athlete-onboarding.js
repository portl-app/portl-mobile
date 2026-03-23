import { useAuth } from "@/utils/auth/useAuth";
import useUpload from "@/utils/useUpload";
import * as DocumentPicker from "expo-document-picker";
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

export default function AthleteOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [upload, { loading: uploading }] = useUpload();
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "", sport: "", position: "", height: "", weight: "",
    current_school: "", graduation_year: "", division_level: "",
    years_of_eligibility: "", stats: "", achievements: "",
    video_link: "", optional_contact_email: "",
  });

  const [document, setDocument] = useState(null);
  const [attestationAccepted, setAttestationAccepted] = useState(false);

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        setDocument(result.assets[0]);
      }
    } catch (err) {
      setError("Failed to pick document");
    }
  };

  const handleNext = async () => {
    setError(null);

    if (step === 1) {
      if (!formData.full_name || !formData.sport || !formData.position || !formData.current_school || !formData.graduation_year) {
        setError("Please fill in all required fields");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.division_level) {
        setError("Please select a division level");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!document) { setError("Please upload verification document"); return; }
      if (!attestationAccepted) { setError("You must confirm you are in the transfer portal"); return; }

      setLoading(true);
      try {
        const headers = { "Content-Type": "application/json" };
        if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;

        const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`, {
          method: "POST", headers, body: JSON.stringify(formData),
        });
        if (!profileRes.ok) throw new Error("Failed to create profile");

        const uploadResult = await upload({ reactNativeAsset: document });
        if (uploadResult.error) throw new Error(uploadResult.error);

        const docRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/document`, {
          method: "POST", headers, body: JSON.stringify({ fileUrl: uploadResult.url }),
        });
        if (!docRes.ok) throw new Error("Failed to save document");

        router.replace("/(tabs)");
      } catch (err) {
        setError(err.message || "Failed to complete onboarding");
        setLoading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>Athlete Profile</Text>
          <Text style={{ fontSize: 14, color: "#94A3B8" }}>Step {step} of 3</Text>
        </View>

        {step === 1 && (
          <View style={{ gap: 20 }}>
            {[["Full Name *", "full_name", "Enter your full name", false], ["Sport *", "sport", "e.g. Football, Basketball", false], ["Position *", "position", "e.g. Quarterback, Point Guard", false], ["Current School *", "current_school", "Enter your current school", false], ["Graduation Year *", "graduation_year", "2025", true]].map(([label, field, placeholder, numeric]) => (
              <View key={field}>
                <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>{label}</Text>
                <TextInput value={formData[field]} onChangeText={(val) => updateField(field, val)} placeholder={placeholder} placeholderTextColor="#64748B" keyboardType={numeric ? "numeric" : "default"} style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {[["Height", "height", "6'2\""], ["Weight", "weight", "185 lbs"]].map(([label, field, placeholder]) => (
                <View key={field} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>{label}</Text>
                  <TextInput value={formData[field]} onChangeText={(val) => updateField(field, val)} placeholder={placeholder} placeholderTextColor="#64748B" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: 20 }}>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Division Level *</Text>
              <View style={{ gap: 8 }}>
                {["D1", "D2", "D3", "NAIA", "JUCO"].map((level) => (
                  <TouchableOpacity key={level} onPress={() => updateField("division_level", level)} style={{ backgroundColor: formData.division_level === level ? "#3B82F6" : "#1E293B", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: formData.division_level === level ? "#3B82F6" : "#334155" }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: formData.division_level === level ? "bold" : "normal" }}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {[["Stats", "stats", "Key stats and performance metrics", true], ["Achievements", "achievements", "Awards, honors, accomplishments", true], ["Highlight Video URL", "video_link", "YouTube or Hudl link", false], ["Contact Email (Optional)", "optional_contact_email", "your.email@example.com", false]].map(([label, field, placeholder, multiline]) => (
              <View key={field}>
                <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>{label}</Text>
                <TextInput value={formData[field]} onChangeText={(val) => updateField(field, val)} placeholder={placeholder} placeholderTextColor="#64748B" multiline={multiline} style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16, height: multiline ? 100 : undefined, textAlignVertical: multiline ? "top" : undefined }} />
              </View>
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: 20 }}>
            <View style={{ backgroundColor: "#FEF3C7", padding: 16, borderRadius: 8 }}>
              <Text style={{ fontSize: 13, color: "#92400E", lineHeight: 20, fontWeight: "bold", marginBottom: 8 }}>Transfer Portal Verification Required</Text>
              <Text style={{ fontSize: 13, color: "#92400E", lineHeight: 20 }}>Upload proof that you are currently in the NCAA transfer portal</Text>
            </View>

            <TouchableOpacity onPress={pickDocument} disabled={uploading} style={{ backgroundColor: "#1E293B", padding: 20, borderRadius: 8, borderWidth: 2, borderStyle: "dashed", borderColor: "#3B82F6", alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: "#3B82F6", marginBottom: 4 }}>{document ? "✓ Document Selected" : "📄 Upload Document"}</Text>
              {document && <Text style={{ fontSize: 14, color: "#94A3B8", marginTop: 8 }}>{document.name}</Text>}
              <Text style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>PDF, JPG, or PNG accepted</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAttestationAccepted(!attestationAccepted)} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: attestationAccepted ? "#3B82F6" : "#334155", backgroundColor: attestationAccepted ? "#3B82F6" : "transparent", justifyContent: "center", alignItems: "center" }}>
                {attestationAccepted && <Text style={{ color: "#FFFFFF", fontSize: 16 }}>✓</Text>}
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: "#E2E8F0", lineHeight: 20 }}>By signing up, I confirm that I am currently in the NCAA transfer portal</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={{ backgroundColor: "#FEE2E2", padding: 16, borderRadius: 8, marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: "#991B1B" }}>{error}</Text>
          </View>
        )}

        <View style={{ marginTop: 32, gap: 12 }}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} disabled={loading} style={{ backgroundColor: "#1E293B", padding: 16, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#334155" }}>
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleNext} disabled={loading || uploading} style={{ backgroundColor: "#3B82F6", padding: 16, borderRadius: 8, alignItems: "center", opacity: loading || uploading ? 0.5 : 1 }}>
            {loading || uploading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>{step === 3 ? "Submit for Review" : "Continue"}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}