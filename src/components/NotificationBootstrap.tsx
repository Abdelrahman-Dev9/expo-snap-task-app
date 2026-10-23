import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Loads expo-notifications only after the first frame so Android startup
 * is not blocked by notification native init (important on Android 16).
 */
export function NotificationBootstrap() {
  useEffect(() => {
    if (Platform.OS === "web") return;

    let remove: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        const Notifications = await import("expo-notifications");
        const { getTaskIdFromNotificationResponse } = await import(
          "@/lib/task-reminders"
        );

        if (cancelled) return;

        const openFromResponse = (response: unknown) => {
          const taskId = getTaskIdFromNotificationResponse(
            response as Parameters<
              typeof getTaskIdFromNotificationResponse
            >[0],
          );
          if (!taskId) return;
          router.push(`/(app)/task/${taskId}`);
        };

        const last =
          await Notifications.getLastNotificationResponseAsync();
        openFromResponse(last);

        const sub = Notifications.addNotificationResponseReceivedListener(
          (response: unknown) => {
            openFromResponse(response);
          },
        );
        remove = () => sub.remove();
      } catch {
        // Notifications are optional — never crash the app for them.
      }
    })();

    return () => {
      cancelled = true;
      remove?.();
    };
  }, []);

  return null;
}
