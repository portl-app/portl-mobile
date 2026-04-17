import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Show alerts while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function registerPushToken() {
  try {
    if (Platform.OS === "web") return null;
    const granted = await requestPermissions();
    if (!granted) return null;
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (err) {
    console.error("Error getting push token:", err);
    return null;
  }
}

export async function savePushToken(token, auth) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (auth?.jwt) headers.Authorization = `Bearer ${auth.jwt}`;
    await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/athletes/push-token`, {
      method: "POST",
      headers,
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.error("Error saving push token:", err);
  }
}

export async function sendLocalNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
