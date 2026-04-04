import { useAuth } from "@/utils/auth/useAuth";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Bell, Eye, Heart } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = {};
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;

      const roleRes = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/role`, { headers });
      if (!roleRes.ok) return;
      const { user } = await roleRes.json();
      setUserRole(user.role);

      if (user.role !== "athlete") return;

      await fetchNotifications(headers);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (existingHeaders) => {
    try {
      const headers = existingHeaders || {};
      if (!existingHeaders && auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;
      const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/notifications`, { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId = null) => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;
      await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/notifications`, {
        method: "PATCH", headers, body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    if (type === "profile_view") return <Eye size={20} color="#3B82F6" />;
    if (type === "favorited") return <Heart size={20} color="#F43F5E" fill="#F43F5E" />;
    return <Bell size={20} color="#94A3B8" />;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: "#0F172A" }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (userRole === "coach") {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: "#0F172A" }}>
        <StatusBar style="light" />
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1E293B" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" }}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginLeft: 16 }}>Notifications</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <View style={{ backgroundColor: "#1E293B", width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
            <Bell size={32} color="#94A3B8" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8, textAlign: "center" }}>
            Not Available for Coaches
          </Text>
          <Text style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", lineHeight: 22 }}>
            Notifications are only available for athletes. Coaches can view athlete profiles in the Search tab.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar style="light" />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1E293B" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" }}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginLeft: 16 }}>Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAsRead()} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#1E293B", borderRadius: 8 }}>
            <Text style={{ fontSize: 13, color: "#3B82F6", fontWeight: "600" }}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 80 }}>
            <View style={{ backgroundColor: "#1E293B", width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <Bell size={32} color="#94A3B8" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>No Notifications Yet</Text>
            <Text style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", paddingHorizontal: 32 }}>
              You'll be notified when coaches view or favorite your profile
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => { if (!notification.is_read) markAsRead(notification.id); }}
                style={{ backgroundColor: notification.is_read ? "#1E293B" : "#1E3A5F", padding: 16, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: notification.is_read ? "#334155" : "#3B82F6" }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View style={{ backgroundColor: notification.is_read ? "#334155" : "#1E3A8A", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" }}>
                    {getNotificationIcon(notification.notification_type)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: "#FFFFFF", lineHeight: 22, marginBottom: 6 }}>{notification.message}</Text>
                    <Text style={{ fontSize: 13, color: "#94A3B8" }}>{formatTimestamp(notification.created_at)}</Text>
                  </View>
                  {!notification.is_read && (
                    <View style={{ backgroundColor: "#3B82F6", width: 8, height: 8, borderRadius: 4, marginTop: 8 }} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}