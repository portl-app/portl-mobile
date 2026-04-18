import { useAuth } from "@/utils/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { Filter, Heart, Search as SearchIcon, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
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

const DIVISION_LEVELS = ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "JUCO"];

function getCoachTemplates(athlete, coachProfile) {
  const coachName = coachProfile?.full_name || "Coach";
  const school = coachProfile?.school || "our program";
  const sport = coachProfile?.sport || "your sport";
  const athleteName = athlete?.full_name || "there";
  return [
    {
      label: "Initial Interest",
      subject: `Recruiting Interest from ${school}`,
      body: `Hi ${athleteName},\n\nMy name is ${coachName} and I am the ${sport} coach at ${school}. I came across your profile and am very impressed with your athletic background.\n\nI would love to learn more about you and discuss how you might fit into our program. Please feel free to reach out at your convenience.\n\nBest regards,\n${coachName}\n${school}`,
    },
    {
      label: "Recruiting Visit",
      subject: `Official Visit Invitation – ${school}`,
      body: `Hi ${athleteName},\n\nI hope this message finds you well. As the ${sport} coach at ${school}, I would like to invite you for an official recruiting visit to our campus.\n\nThis would give you a chance to see our facilities, meet our team, and get a feel for the program. Please let me know your availability and we will work around your schedule.\n\nLooking forward to hearing from you,\n${coachName}\n${school}`,
    },
    {
      label: "Scholarship Interest",
      subject: `Scholarship Opportunity – ${school}`,
      body: `Hi ${athleteName},\n\nMy name is ${coachName}, ${sport} coach at ${school}. After reviewing your profile I wanted to reach out regarding potential scholarship opportunities within our program.\n\nWe have a genuine interest in you and would like to discuss what we have to offer. Please reply or give me a call at your earliest convenience.\n\nSincerely,\n${coachName}\n${school}`,
    },
  ];
}

function getAthleteTemplates(coach, athleteProfile) {
  const athleteName = athleteProfile?.full_name || "a prospective transfer";
  const position = athleteProfile?.position || "my position";
  const sport = athleteProfile?.sport || "your sport";
  const coachName = coach?.full_name || "Coach";
  const school = coach?.school || "your program";
  return [
    {
      label: "Express Interest",
      subject: `Transfer Interest – ${athleteName}`,
      body: `Dear ${coachName},\n\nMy name is ${athleteName} and I am currently exploring transfer opportunities in ${sport}. I came across ${school} and am very impressed by your program.\n\nI play ${position} and believe my skills and experience could be a great fit. I would love the opportunity to speak with you about joining your team.\n\nThank you for your time,\n${athleteName}`,
    },
    {
      label: "Follow Up",
      subject: `Follow Up – ${athleteName}`,
      body: `Dear ${coachName},\n\nI wanted to follow up on my previous message regarding transfer interest in your ${sport} program at ${school}.\n\nI remain very excited about the possibility of joining your team and would appreciate any update you may have. Please do not hesitate to reach out if you need any additional information from me.\n\nBest regards,\n${athleteName}`,
    },
  ];
}

function EmailTemplateModal({ visible, onClose, templates, toEmail, toName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (visible && templates?.length) {
      setSelectedIndex(0);
      setBody(templates[0].body);
      setEditing(false);
    }
  }, [visible]);

  useEffect(() => {
    if (templates?.length) setBody(templates[selectedIndex].body);
    setEditing(false);
  }, [selectedIndex]);

  const handleSend = () => {
    const subject = encodeURIComponent(templates[selectedIndex].subject);
    const encodedBody = encodeURIComponent(body);
    Linking.openURL(`mailto:${toEmail}?subject=${subject}&body=${encodedBody}`);
    onClose();
  };

  if (!templates?.length) return null;
  const current = templates[selectedIndex];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#F5F5F5", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "90%" }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>Email Templates</Text>
            <TouchableOpacity onPress={onClose} style={{ backgroundColor: "#E0E0E0", borderRadius: 16, padding: 6 }}>
              <X size={18} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* To */}
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8, padding: 10, marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: "#666666" }}>To: <Text style={{ color: "#111111" }}>{toName} — {toEmail}</Text></Text>
          </View>

          {/* Template tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {templates.map((t, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedIndex(i)}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: selectedIndex === i ? "#000000" : "#FFFFFF", borderWidth: 1, borderColor: selectedIndex === i ? "#000000" : "#E0E0E0" }}
                >
                  <Text style={{ color: selectedIndex === i ? "#FFFFFF" : "#666666", fontSize: 13, fontWeight: "600" }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Subject */}
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: "#666666", marginBottom: 2 }}>Subject</Text>
            <Text style={{ fontSize: 13, color: "#111111" }}>{current.subject}</Text>
          </View>

          {/* Body */}
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8, padding: 10, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: "#666666" }}>Message</Text>
              <TouchableOpacity onPress={() => setEditing(!editing)}>
                <Text style={{ fontSize: 12, color: "#000000", fontWeight: "600" }}>{editing ? "Done" : "Edit"}</Text>
              </TouchableOpacity>
            </View>
            {editing ? (
              <TextInput
                value={body}
                onChangeText={setBody}
                multiline
                style={{ color: "#111111", fontSize: 13, lineHeight: 20, minHeight: 140, textAlignVertical: "top" }}
              />
            ) : (
              <ScrollView style={{ maxHeight: 160 }}>
                <Text style={{ color: "#111111", fontSize: 13, lineHeight: 20 }}>{body}</Text>
              </ScrollView>
            )}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={onClose} style={{ flex: 1, backgroundColor: "#E0E0E0", padding: 14, borderRadius: 10, alignItems: "center" }}>
              <Text style={{ color: "#666666", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSend} style={{ flex: 2, backgroundColor: "#000000", padding: 14, borderRadius: 10, alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Open in Email Client →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SportPicker({ selected, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{ backgroundColor: "#FFFFFF", padding: 12, borderRadius: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Text style={{ color: selected ? "#FFFFFF" : "#666666", fontSize: 14 }}>{selected || placeholder}</Text>
        <Text style={{ color: "#666666", fontSize: 12 }}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: "#E0E0E0", maxHeight: 200 }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
            <TouchableOpacity
              onPress={() => { onSelect(""); setOpen(false); }}
              style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" }}
            >
              <Text style={{ color: "#666666", fontSize: 14 }}>Any Sport</Text>
            </TouchableOpacity>
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport}
                onPress={() => { onSelect(sport); setOpen(false); }}
                style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", backgroundColor: selected === sport ? "#F5F5F5" : "transparent" }}
              >
                <Text style={{ color: selected === sport ? "#000000" : "#111111", fontSize: 14 }}>{sport}</Text>
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
  const [ownProfile, setOwnProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [emailTarget, setEmailTarget] = useState(null); // { email, name, templates }
  const [savedIds, setSavedIds] = useState(new Set());
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
      if (!roleRes.ok) return;
      const { user } = await roleRes.json();
      setUserRole(user.role);

      // Fetch own profile for template placeholders
      const profileEndpoint = user.role === "coach"
        ? `${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/profile`
        : `${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`;
      const profileRes = await fetch(profileEndpoint, { headers });
      if (profileRes.ok) {
        const { profile } = await profileRes.json();
        setOwnProfile(profile);
      }

      if (user.role === "coach") {
        const favRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/favorites`, { headers });
        if (favRes.ok) {
          const { athletes } = await favRes.json();
          setSavedIds(new Set((athletes || []).map((a) => a.id)));
        }
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

  const toggleFavorite = async (athleteId) => {
    const isSaved = savedIds.has(athleteId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(athleteId) : next.add(athleteId);
      return next;
    });
    try {
      const headers = { "Content-Type": "application/json" };
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;
      await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/coaches/favorites`, {
        method: isSaved ? "DELETE" : "POST",
        headers,
        body: JSON.stringify({ athlete_id: athleteId }),
      });
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleContactAthlete = (athlete) => {
    if (!athlete.optional_contact_email) return;
    setEmailTarget({
      email: athlete.optional_contact_email,
      name: athlete.full_name,
      templates: getCoachTemplates(athlete, ownProfile),
    });
  };

  const handleContactCoach = (coach) => {
    if (!coach.email) return;
    setEmailTarget({
      email: coach.email,
      name: coach.full_name,
      templates: getAthleteTemplates(coach, ownProfile),
    });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="light" />

      <EmailTemplateModal
        visible={!!emailTarget}
        onClose={() => setEmailTarget(null)}
        templates={emailTarget?.templates}
        toEmail={emailTarget?.email}
        toName={emailTarget?.name}
      />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#FFFFFF" }}>
            {userRole === "coach" ? "Find Athletes" : "Find Coaches"}
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={{ padding: 8 }}>
            <Filter color={showFilters ? "#000000" : "#666666"} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View style={{ backgroundColor: "#F5F5F5", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
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
                <Text style={{ color: "#666666", fontSize: 12, marginBottom: 8 }}>Gender</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["", "Male", "Female"].map((g) => (
                    <TouchableOpacity
                      key={g || "all"}
                      onPress={() => updateAthleteFilter("gender", g)}
                      style={{ flex: 1, backgroundColor: athleteFilters.gender === g ? "#000000" : "#FFFFFF", padding: 10, borderRadius: 6, alignItems: "center", borderWidth: 1, borderColor: athleteFilters.gender === g ? "#000000" : "#E0E0E0" }}
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
                <Text style={{ color: "#666666", fontSize: 12, marginBottom: 8 }}>Division</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => updateAthleteFilter("division_level", "")}
                      style={{ backgroundColor: !athleteFilters.division_level ? "#000000" : "#FFFFFF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: !athleteFilters.division_level ? "#000000" : "#E0E0E0" }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: !athleteFilters.division_level ? "700" : "400" }}>All</Text>
                    </TouchableOpacity>
                    {DIVISION_LEVELS.map((level) => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => updateAthleteFilter("division_level", athleteFilters.division_level === level ? "" : level)}
                        style={{ backgroundColor: athleteFilters.division_level === level ? "#000000" : "#FFFFFF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: athleteFilters.division_level === level ? "#000000" : "#E0E0E0" }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: athleteFilters.division_level === level ? "700" : "400" }}>{level}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <TouchableOpacity onPress={performSearch} style={{ backgroundColor: "#000000", padding: 12, borderRadius: 8, alignItems: "center" }}>
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
              <TouchableOpacity onPress={performSearch} style={{ backgroundColor: "#000000", padding: 12, borderRadius: 8, alignItems: "center" }}>
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
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : results.length === 0 ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <SearchIcon color="#666666" size={48} />
            <Text style={{ fontSize: 16, color: "#666666", marginTop: 16, textAlign: "center" }}>
              {userRole === "coach" ? "No athletes found" : "No coaches found"}
            </Text>
            <Text style={{ fontSize: 13, color: "#666666", marginTop: 8, textAlign: "center" }}>
              Try adjusting your filters
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {results.map((item) =>
              userRole === "coach" ? (
                <AthleteResultCard key={item.id} athlete={item} onContact={handleContactAthlete} isFavorited={savedIds.has(item.id)} onFavorite={() => toggleFavorite(item.id)} />
              ) : (
                <CoachResultCard key={item.user_id} coach={item} onContact={handleContactCoach} />
              )
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AthleteResultCard({ athlete, onContact, isFavorited, onFavorite }) {
  return (
    <View style={{ backgroundColor: "#F5F5F5", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111111", marginBottom: 2 }}>{athlete.full_name}</Text>
          <Text style={{ fontSize: 13, color: "#666666" }}>{athlete.current_school}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {athlete.years_of_eligibility && (
            <Text style={{ fontSize: 12, color: "#666666" }}>{athlete.years_of_eligibility} yr elig.</Text>
          )}
          {onFavorite && (
            <TouchableOpacity onPress={onFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Heart size={20} color={isFavorited ? "#EF4444" : "#CCCCCC"} fill={isFavorited ? "#EF4444" : "none"} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {athlete.sport && (
          <View style={{ backgroundColor: "#000000", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>{athlete.sport}</Text>
          </View>
        )}
        {athlete.position && (
          <View style={{ backgroundColor: "#F5F5F5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#333333", fontSize: 11, fontWeight: "600" }}>{athlete.position}</Text>
          </View>
        )}
        {athlete.division_level && (
          <View style={{ backgroundColor: "#F5F5F5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#333333", fontSize: 11, fontWeight: "600" }}>{athlete.division_level}</Text>
          </View>
        )}
        {athlete.gender && (
          <View style={{ backgroundColor: "#F5F5F5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#333333", fontSize: 11, fontWeight: "600" }}>{athlete.gender}</Text>
          </View>
        )}
        {athlete.stats_link && (
          <View style={{ backgroundColor: "#000000", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>✓ Stats Verified</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {athlete.stats_link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(athlete.stats_link)}
            style={{ flex: 1, backgroundColor: "#000000", padding: 10, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>View Stats →</Text>
          </TouchableOpacity>
        )}
        {athlete.school_athletics_link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(athlete.school_athletics_link)}
            style={{ flex: 1, backgroundColor: "#F5F5F5", padding: 10, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#333333", fontSize: 12, fontWeight: "600" }}>School Profile →</Text>
          </TouchableOpacity>
        )}
        {athlete.optional_contact_email && (
          <TouchableOpacity
            onPress={() => onContact(athlete)}
            style={{ flex: 1, backgroundColor: "#000000", padding: 10, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>✉ Contact</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function CoachResultCard({ coach, onContact }) {
  return (
    <View style={{ backgroundColor: "#F5F5F5", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0" }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111111", marginBottom: 2 }}>{coach.full_name}</Text>
      <Text style={{ fontSize: 13, color: "#666666", marginBottom: 10 }}>{coach.school}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {coach.sport && (
          <View style={{ backgroundColor: "#000000", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>{coach.sport}</Text>
          </View>
        )}
        {coach.division_level && (
          <View style={{ backgroundColor: "#F5F5F5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
            <Text style={{ color: "#333333", fontSize: 11, fontWeight: "600" }}>{coach.division_level}</Text>
          </View>
        )}
      </View>
      {coach.email && (
        <TouchableOpacity
          onPress={() => onContact(coach)}
          style={{ backgroundColor: "#000000", padding: 12, borderRadius: 8, alignItems: "center" }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "bold" }}>✉ Contact Coach</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
