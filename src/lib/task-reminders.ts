import { Platform } from "react-native";
import type { Task } from "@/features/tasks/types";
import { getTaskIdFromNotificationData } from "@/lib/notification-response";

const CHANNEL_ID = "task-reminders";

type NotificationsModule = typeof import("expo-notifications");

let handlerReady = false;
let notificationsPromise: Promise<NotificationsModule | null> | null = null;

/**
 * expo-notifications' Android entry eagerly requires ExpoTopicSubscriptionModule,
 * which is missing in Expo Go (and must never crash route modules on import).
 */
function loadNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === "web") return Promise.resolve(null);
  if (!notificationsPromise) {
    notificationsPromise = import("expo-notifications")
      .then((mod) => mod)
      .catch((err) => {
        console.warn("expo-notifications unavailable", err);
        return null;
      });
  }
  return notificationsPromise;
}

async function ensureNotificationHandler(Notifications: NotificationsModule) {
  if (handlerReady || Platform.OS === "web") return;
  handlerReady = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function dueId(taskId: string) {
  return `task-${taskId}-due`;
}

function beforeId(taskId: string) {
  return `task-${taskId}-before`;
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  await ensureNotificationHandler(Notifications);

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Task reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function cancelTaskReminders(taskId: string) {
  if (Platform.OS === "web") return;
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  await Notifications.cancelScheduledNotificationAsync(dueId(taskId)).catch(
    () => undefined,
  );
  await Notifications.cancelScheduledNotificationAsync(beforeId(taskId)).catch(
    () => undefined,
  );
}

export async function scheduleTaskReminders(task: Task): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  await cancelTaskReminders(task.id);

  if (task.done || !task.dueAt) {
    return true;
  }

  const allowed = await ensureNotificationPermissions();
  if (!allowed) return false;

  const dueAt = new Date(task.dueAt);
  const now = Date.now();

  if (dueAt.getTime() > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: dueId(task.id),
      content: {
        title: "Time to start",
        body: task.title,
        sound: true,
        data: { taskId: task.id },
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dueAt,
        channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
      },
    });
  }

  if (task.remindBeforeMinutes && task.remindBeforeMinutes > 0) {
    const before = new Date(
      dueAt.getTime() - task.remindBeforeMinutes * 60 * 1000,
    );
    if (before.getTime() > now) {
      const label =
        task.remindBeforeMinutes >= 1440
          ? "1 day"
          : task.remindBeforeMinutes >= 60
            ? "1 hour"
            : `${task.remindBeforeMinutes} minutes`;

      await Notifications.scheduleNotificationAsync({
        identifier: beforeId(task.id),
        content: {
          title: "Upcoming task",
          body: `${task.title} starts in ${label}`,
          sound: true,
          data: { taskId: task.id },
          ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: before,
          channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
        },
      });
    }
  }

  return true;
}

/** Re-sync local schedules for incomplete tasks that still have a future due date. */
export async function resyncTaskReminders(tasks: Task[]) {
  if (Platform.OS === "web") return;
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  await ensureNotificationPermissions();
  for (const task of tasks) {
    if (task.done || !task.dueAt) {
      await cancelTaskReminders(task.id);
      continue;
    }
    await scheduleTaskReminders(task);
  }
}

export function getTaskIdFromNotificationResponse(
  response: {
    notification?: { request?: { content?: { data?: unknown } } };
  } | null,
): string | null {
  const data = response?.notification?.request?.content?.data as
    | Record<string, unknown>
    | undefined;
  return getTaskIdFromNotificationData(data);
}
