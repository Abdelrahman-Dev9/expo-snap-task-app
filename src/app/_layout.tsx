import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "../../global.css";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { getTaskIdFromNotificationResponse } from "@/lib/task-reminders";
import { bootstrapAuth } from "@/store/auth-slice";
import { store, useAppDispatch, useAppSelector } from "@/store";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.local.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.");
}

function openTaskFromNotification(
  response: Notifications.NotificationResponse | null,
) {
  const taskId = getTaskIdFromNotificationResponse(response);
  if (!taskId) return;
  router.push(`/(app)/task/${taskId}`);
}

function RootNavigator() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    void dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      openTaskFromNotification(response);
    });

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        openTaskFromNotification(response);
      },
    );

    return () => sub.remove();
  }, []);

  if (status === "idle" || status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-brand-950">
        <Image
          source={require("../../assets/images/splash-icon.png")}
          style={{ width: 120, height: 120, borderRadius: 28 }}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#1e1b4b" },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <RootNavigator />
        </Provider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
