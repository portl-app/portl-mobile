import { useAuth } from "@/utils/auth/useAuth";
import useUpload from "@/utils/useUpload";
import * as DocumentPicker from "expo-document-picker";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

function getStatFields(sport, position) {
  if (!sport) return [];
  if (sport === "Basketball") {
    return [
      { label: "Games Played", fieldKey: "games_played" },
      { label: "Points Per Game", fieldKey: "ppg" },
      { label: "Rebounds Per Game", fieldKey: "rpg" },
      { label: "Assists Per Game", fieldKey: "apg" },
      { label: "Steals Per Game", fieldKey: "spg" },
      { label: "Blocks Per Game", fieldKey: "bpg" },
      { label: "FG%", fieldKey: "fg_pct" },
      { label: "3PT%", fieldKey: "three_pt_pct" },
      { label: "FT%", fieldKey: "ft_pct" },
    ];
  }
  if (sport === "Football") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Quarterback") return [...base, { label: "Passing Yards", fieldKey: "passing_yards" }, { label: "Passing TDs", fieldKey: "passing_tds" }, { label: "Completion %", fieldKey: "completion_pct" }, { label: "Interceptions", fieldKey: "interceptions" }, { label: "Rushing Yards", fieldKey: "rushing_yards" }];
    if (position === "Running Back") return [...base, { label: "Rushing Yards", fieldKey: "rushing_yards" }, { label: "Rushing TDs", fieldKey: "rushing_tds" }, { label: "Receptions", fieldKey: "receptions" }, { label: "Receiving Yards", fieldKey: "receiving_yards" }, { label: "Yards Per Carry", fieldKey: "yards_per_carry" }];
    if (position === "Wide Receiver" || position === "Tight End") return [...base, { label: "Receptions", fieldKey: "receptions" }, { label: "Receiving Yards", fieldKey: "receiving_yards" }, { label: "Receiving TDs", fieldKey: "receiving_tds" }, { label: "Yards Per Reception", fieldKey: "yards_per_reception" }];
    if (position === "Kicker" || position === "Punter") return [...base, { label: "Field Goals Made", fieldKey: "fg_made" }, { label: "Field Goals Attempted", fieldKey: "fg_att" }, { label: "Long", fieldKey: "long" }, { label: "Extra Points", fieldKey: "extra_points" }];
    return [...base, { label: "Tackles", fieldKey: "tackles" }, { label: "Sacks", fieldKey: "sacks" }, { label: "Interceptions", fieldKey: "interceptions" }, { label: "Pass Deflections", fieldKey: "pass_deflections" }];
  }
  if (sport === "Soccer") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Goalkeeper") return [...base, { label: "Saves", fieldKey: "saves" }, { label: "Goals Against", fieldKey: "goals_against" }, { label: "Shutouts", fieldKey: "shutouts" }, { label: "Save %", fieldKey: "save_pct" }];
    return [...base, { label: "Goals", fieldKey: "goals" }, { label: "Assists", fieldKey: "assists" }, { label: "Shots", fieldKey: "shots" }, { label: "Shots on Goal", fieldKey: "shots_on_goal" }];
  }
  if (sport === "Baseball") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Pitcher") return [...base, { label: "ERA", fieldKey: "era" }, { label: "Wins", fieldKey: "wins" }, { label: "Losses", fieldKey: "losses" }, { label: "Strikeouts", fieldKey: "strikeouts" }, { label: "WHIP", fieldKey: "whip" }, { label: "Innings Pitched", fieldKey: "innings_pitched" }];
    return [...base, { label: "Batting Average", fieldKey: "batting_avg" }, { label: "Home Runs", fieldKey: "home_runs" }, { label: "RBIs", fieldKey: "rbi" }, { label: "OPS", fieldKey: "ops" }, { label: "Stolen Bases", fieldKey: "stolen_bases" }];
  }
  if (sport === "Softball") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Pitcher") return [...base, { label: "ERA", fieldKey: "era" }, { label: "Wins", fieldKey: "wins" }, { label: "Losses", fieldKey: "losses" }, { label: "Strikeouts", fieldKey: "strikeouts" }, { label: "WHIP", fieldKey: "whip" }];
    return [...base, { label: "Batting Average", fieldKey: "batting_avg" }, { label: "Home Runs", fieldKey: "home_runs" }, { label: "RBIs", fieldKey: "rbi" }, { label: "OPS", fieldKey: "ops" }, { label: "Stolen Bases", fieldKey: "stolen_bases" }];
  }
  if (sport === "Volleyball") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Setter") return [...base, { label: "Assists", fieldKey: "assists" }, { label: "Assists Per Set", fieldKey: "assists_per_set" }, { label: "Digs", fieldKey: "digs" }];
    if (position === "Libero" || position === "Defensive Specialist") return [...base, { label: "Digs", fieldKey: "digs" }, { label: "Digs Per Set", fieldKey: "digs_per_set" }, { label: "Reception %", fieldKey: "reception_pct" }];
    return [...base, { label: "Kills", fieldKey: "kills" }, { label: "Kills Per Set", fieldKey: "kills_per_set" }, { label: "Attack %", fieldKey: "attack_pct" }, { label: "Blocks", fieldKey: "blocks" }, { label: "Digs", fieldKey: "digs" }];
  }
  if (sport === "Tennis") {
    return [{ label: "Overall Record (W-L)", fieldKey: "overall_record" }, { label: "Singles Record", fieldKey: "singles_record" }, { label: "Doubles Record", fieldKey: "doubles_record" }, { label: "Conference Record", fieldKey: "conference_record" }, { label: "National Ranking", fieldKey: "national_ranking" }];
  }
  if (sport === "Swimming") {
    return [{ label: "Best Time (Primary Event)", fieldKey: "best_time_primary" }, { label: "Primary Event", fieldKey: "primary_event" }, { label: "Best Time (Secondary Event)", fieldKey: "best_time_secondary" }, { label: "Relay Events", fieldKey: "relay_events" }];
  }
  if (sport === "Track and Field") {
    return [{ label: "Primary Event", fieldKey: "primary_event" }, { label: "Personal Best (Primary)", fieldKey: "pb_primary" }, { label: "Secondary Event", fieldKey: "secondary_event" }, { label: "Personal Best (Secondary)", fieldKey: "pb_secondary" }, { label: "Conference/Regional Placing", fieldKey: "conference_placing" }];
  }
  if (sport === "Golf") {
    return [{ label: "Scoring Average", fieldKey: "scoring_avg" }, { label: "Rounds Played", fieldKey: "rounds_played" }, { label: "Low Round", fieldKey: "low_round" }, { label: "Tournament Wins", fieldKey: "tournament_wins" }, { label: "GHIN Handicap", fieldKey: "handicap" }];
  }
  if (sport === "Lacrosse") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Goalkeeper") return [...base, { label: "Saves", fieldKey: "saves" }, { label: "Goals Against Average", fieldKey: "gaa" }, { label: "Save %", fieldKey: "save_pct" }];
    if (position === "Defense") return [...base, { label: "Ground Balls", fieldKey: "ground_balls" }, { label: "Caused Turnovers", fieldKey: "caused_turnovers" }, { label: "Clears", fieldKey: "clears" }];
    return [...base, { label: "Goals", fieldKey: "goals" }, { label: "Assists", fieldKey: "assists" }, { label: "Points", fieldKey: "points" }, { label: "Ground Balls", fieldKey: "ground_balls" }, { label: "Shots on Goal", fieldKey: "shots_on_goal" }];
  }
  if (sport === "Wrestling") {
    return [{ label: "Overall Record (W-L)", fieldKey: "overall_record" }, { label: "Pins", fieldKey: "pins" }, { label: "Tech Falls", fieldKey: "tech_falls" }, { label: "Major Decisions", fieldKey: "major_decisions" }, { label: "Conference Placing", fieldKey: "conference_placing" }];
  }
  if (sport === "Cross Country") {
    return [{ label: "5K PR", fieldKey: "5k_pr" }, { label: "6K PR", fieldKey: "6k_pr" }, { label: "8K PR", fieldKey: "8k_pr" }, { label: "10K PR", fieldKey: "10k_pr" }, { label: "Conference Placing", fieldKey: "conference_placing" }];
  }
  if (sport === "Gymnastics") {
    return [{ label: "All-Around Score", fieldKey: "all_around_score" }, { label: "Floor Score", fieldKey: "floor_score" }, { label: "Vault Score", fieldKey: "vault_score" }, { label: "Bars Score", fieldKey: "bars_score" }, { label: "Beam Score", fieldKey: "beam_score" }, { label: "Conference Placing", fieldKey: "conference_placing" }];
  }
  if (sport === "Rowing") {
    return [{ label: "2K Erg Time", fieldKey: "erg_2k" }, { label: "6K Erg Time", fieldKey: "erg_6k" }, { label: "Boat Class", fieldKey: "boat_class" }, { label: "Side (Port/Starboard)", fieldKey: "side" }];
  }
  if (sport === "Ice Hockey") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Goalie") return [...base, { label: "Save %", fieldKey: "save_pct" }, { label: "Goals Against Average", fieldKey: "gaa" }, { label: "Shutouts", fieldKey: "shutouts" }];
    return [...base, { label: "Goals", fieldKey: "goals" }, { label: "Assists", fieldKey: "assists" }, { label: "Points", fieldKey: "points" }, { label: "+/-", fieldKey: "plus_minus" }, { label: "PIM", fieldKey: "pim" }];
  }
  if (sport === "Field Hockey") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Goalkeeper") return [...base, { label: "Saves", fieldKey: "saves" }, { label: "Goals Against Average", fieldKey: "gaa" }, { label: "Shutouts", fieldKey: "shutouts" }];
    return [...base, { label: "Goals", fieldKey: "goals" }, { label: "Assists", fieldKey: "assists" }, { label: "Shots on Goal", fieldKey: "shots_on_goal" }];
  }
  if (sport === "Water Polo") {
    const base = [{ label: "Games Played", fieldKey: "games_played" }];
    if (position === "Goalkeeper") return [...base, { label: "Saves", fieldKey: "saves" }, { label: "Goals Against Average", fieldKey: "gaa" }, { label: "Save %", fieldKey: "save_pct" }];
    return [...base, { label: "Goals", fieldKey: "goals" }, { label: "Assists", fieldKey: "assists" }, { label: "Steals", fieldKey: "steals" }, { label: "Sprints Won", fieldKey: "sprints_won" }];
  }
  return [];
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

function PositionPicker({ sport, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const positions = SPORT_POSITIONS[sport] || [];
  if (positions.length === 0) return null;
  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{ backgroundColor: "#1E293B", padding: 16, borderRadius: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Text style={{ color: selected ? "#FFFFFF" : "#64748B", fontSize: 16 }}>{selected || "Select position..."}</Text>
        <Text style={{ color: "#64748B", fontSize: 14 }}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ backgroundColor: "#1E293B", borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: "#334155" }}>
          {positions.map((pos) => (
            <TouchableOpacity
              key={pos}
              onPress={() => { onSelect(pos); setOpen(false); }}
              style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: "#0F172A", backgroundColor: selected === pos ? "#172554" : "transparent" }}
            >
              <Text style={{ color: selected === pos ? "#93C5FD" : "#E2E8F0", fontSize: 15 }}>{pos}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

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
    years_of_eligibility: "", achievements: "", video_link: "",
    optional_contact_email: "", stats_link: "", school_athletics_link: "",
    gender: "",
  });

  const [statValues, setStatValues] = useState({});
  const [document, setDocument] = useState(null);
  const [attestationAccepted, setAttestationAccepted] = useState(false);

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const updateStat = (key, value) => setStatValues((prev) => ({ ...prev, [key]: value }));

  const statFields = getStatFields(formData.sport, formData.position);

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
      if (!formData.full_name || !formData.current_school || !formData.graduation_year) {
        setError("Please fill in all required fields");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.sport || !formData.position || !formData.division_level) {
        setError("Please select sport, position, and division level");
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

        const statsJson = Object.keys(statValues).length > 0 ? JSON.stringify(statValues) : null;

        const profileRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/profile`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ...formData, stats: statsJson }),
        });
        if (!profileRes.ok) throw new Error("Failed to create profile");

        const uploadResult = await upload({ reactNativeAsset: document });
        if (uploadResult.error) throw new Error(uploadResult.error);

        const docRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/document`, {
          method: "POST",
          headers,
          body: JSON.stringify({ fileUrl: uploadResult.url, document_type: "verification" }),
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>Athlete Profile</Text>
          <Text style={{ fontSize: 14, color: "#94A3B8" }}>Step {step} of 3</Text>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 12 }}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: s <= step ? "#3B82F6" : "#1E293B" }} />
            ))}
          </View>
        </View>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <View style={{ gap: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#3B82F6", marginBottom: 4 }}>Personal Information</Text>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Full Name *</Text>
              <TextInput value={formData.full_name} onChangeText={(v) => updateField("full_name", v)} placeholder="Enter your full name" placeholderTextColor="#64748B" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Current School *</Text>
              <TextInput value={formData.current_school} onChangeText={(v) => updateField("current_school", v)} placeholder="Enter your current school" placeholderTextColor="#64748B" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Graduation Year *</Text>
              <TextInput value={formData.graduation_year} onChangeText={(v) => updateField("graduation_year", v)} placeholder="e.g. 2026" placeholderTextColor="#64748B" keyboardType="numeric" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Height</Text>
                <TextInput value={formData.height} onChangeText={(v) => updateField("height", v)} placeholder="6ft 2in" placeholderTextColor="#64748B" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Weight</Text>
                <TextInput value={formData.weight} onChangeText={(v) => updateField("weight", v)} placeholder="185 lbs" placeholderTextColor="#64748B" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Gender</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["Male", "Female"].map((g) => (
                  <TouchableOpacity key={g} onPress={() => updateField("gender", g)} style={{ flex: 1, backgroundColor: formData.gender === g ? "#3B82F6" : "#1E293B", padding: 14, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: formData.gender === g ? "#3B82F6" : "#334155" }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: formData.gender === g ? "700" : "400" }}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Athletic Information */}
        {step === 2 && (
          <View style={{ gap: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#3B82F6", marginBottom: 4 }}>Athletic Information</Text>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Sport *</Text>
              <SportPicker selected={formData.sport} onSelect={(v) => { updateField("sport", v); updateField("position", ""); setStatValues({}); }} />
            </View>
            {formData.sport && (
              <View>
                <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Position *</Text>
                <PositionPicker sport={formData.sport} selected={formData.position} onSelect={(v) => { updateField("position", v); setStatValues({}); }} />
              </View>
            )}
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Division Level *</Text>
              <View style={{ gap: 8 }}>
                {DIVISION_LEVELS.map((level) => (
                  <TouchableOpacity key={level} onPress={() => updateField("division_level", level)} style={{ backgroundColor: formData.division_level === level ? "#172554" : "#1E293B", padding: 14, borderRadius: 8, borderWidth: 1, borderColor: formData.division_level === level ? "#3B82F6" : "#334155" }}>
                    <Text style={{ color: formData.division_level === level ? "#93C5FD" : "#E2E8F0", fontSize: 15, fontWeight: formData.division_level === level ? "700" : "400" }}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Years of Eligibility Remaining</Text>
              <TextInput value={formData.years_of_eligibility} onChangeText={(v) => updateField("years_of_eligibility", v)} placeholder="e.g. 2" placeholderTextColor="#64748B" keyboardType="numeric" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 16 }} />
            </View>

            {statFields.length > 0 && (
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 14, color: "#94A3B8", fontWeight: "600" }}>Stats ({formData.sport})</Text>
                {statFields.map(({ label, fieldKey }) => (
                  <View key={fieldKey}>
                    <Text style={{ fontSize: 13, color: "#E2E8F0", marginBottom: 6 }}>{label}</Text>
                    <TextInput value={statValues[fieldKey] || ""} onChangeText={(v) => updateStat(fieldKey, v)} placeholder="—" placeholderTextColor="#475569" keyboardType="decimal-pad" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 14, borderRadius: 8, fontSize: 15 }} />
                  </View>
                ))}
              </View>
            )}

            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Achievements</Text>
              <TextInput value={formData.achievements} onChangeText={(v) => updateField("achievements", v)} placeholder="Awards, honors, accomplishments..." placeholderTextColor="#64748B" multiline numberOfLines={3} style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 15, height: 90, textAlignVertical: "top" }} />
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Highlight Video URL</Text>
              <TextInput value={formData.video_link} onChangeText={(v) => updateField("video_link", v)} placeholder="YouTube or Hudl link" placeholderTextColor="#64748B" autoCapitalize="none" keyboardType="url" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 15 }} />
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>Contact Email (Optional)</Text>
              <TextInput value={formData.optional_contact_email} onChangeText={(v) => updateField("optional_contact_email", v)} placeholder="your.email@example.com" placeholderTextColor="#64748B" autoCapitalize="none" keyboardType="email-address" style={{ backgroundColor: "#1E293B", color: "#FFFFFF", padding: 16, borderRadius: 8, fontSize: 15 }} />
            </View>
          </View>
        )}

        {/* Step 3: Stats Verification + Transfer Portal Docs */}
        {step === 3 && (
          <View style={{ gap: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#3B82F6", marginBottom: 4 }}>Stats Verification</Text>
            <View style={{ backgroundColor: "#1E293B", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "#334155" }}>
              <Text style={{ fontSize: 13, color: "#94A3B8", lineHeight: 20, marginBottom: 12 }}>
                Provide links to your official stats page and school athletics profile so coaches can verify your performance.
              </Text>
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={{ fontSize: 13, color: "#E2E8F0", marginBottom: 6 }}>Official Stats Link</Text>
                  <TextInput value={formData.stats_link} onChangeText={(v) => updateField("stats_link", v)} placeholder="e.g. ESPN, MaxPreps, school stats page" placeholderTextColor="#64748B" autoCapitalize="none" keyboardType="url" style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: 14, borderRadius: 8, fontSize: 14 }} />
                </View>
                <View>
                  <Text style={{ fontSize: 13, color: "#E2E8F0", marginBottom: 6 }}>School Athletics Profile Link</Text>
                  <TextInput value={formData.school_athletics_link} onChangeText={(v) => updateField("school_athletics_link", v)} placeholder="Your school's athletics bio page" placeholderTextColor="#64748B" autoCapitalize="none" keyboardType="url" style={{ backgroundColor: "#0F172A", color: "#FFFFFF", padding: 14, borderRadius: 8, fontSize: 14 }} />
                </View>
              </View>
            </View>

            <Text style={{ fontSize: 16, fontWeight: "700", color: "#3B82F6", marginTop: 8 }}>Transfer Portal Verification</Text>
            <View style={{ backgroundColor: "#1C1708", padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#78350F" }}>
              <Text style={{ fontSize: 13, color: "#FCD34D", lineHeight: 20 }}>Upload proof that you are currently in the NCAA transfer portal</Text>
            </View>

            <TouchableOpacity onPress={pickDocument} disabled={uploading} style={{ backgroundColor: "#1E293B", padding: 20, borderRadius: 8, borderWidth: 2, borderStyle: "dashed", borderColor: document ? "#22C55E" : "#3B82F6", alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: document ? "#22C55E" : "#3B82F6", marginBottom: 4 }}>{document ? "✓ Document Selected" : "📄 Upload Document"}</Text>
              {document && <Text style={{ fontSize: 13, color: "#94A3B8", marginTop: 6 }}>{document.name}</Text>}
              <Text style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>PDF, JPG, or PNG accepted</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAttestationAccepted(!attestationAccepted)} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: attestationAccepted ? "#3B82F6" : "#334155", backgroundColor: attestationAccepted ? "#3B82F6" : "transparent", justifyContent: "center", alignItems: "center", marginTop: 1 }}>
                {attestationAccepted && <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>✓</Text>}
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: "#E2E8F0", lineHeight: 22 }}>I confirm that I am currently in the NCAA transfer portal</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={{ backgroundColor: "#450A0A", padding: 14, borderRadius: 8, marginTop: 20 }}>
            <Text style={{ fontSize: 14, color: "#FCA5A5" }}>{error}</Text>
          </View>
        )}

        <View style={{ marginTop: 32, gap: 12 }}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} disabled={loading} style={{ backgroundColor: "#1E293B", padding: 16, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#334155" }}>
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleNext} disabled={loading || uploading} style={{ backgroundColor: "#3B82F6", padding: 16, borderRadius: 8, alignItems: "center", opacity: loading || uploading ? 0.5 : 1 }}>
            {loading || uploading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>{step === 3 ? "Submit for Review" : "Continue"}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
