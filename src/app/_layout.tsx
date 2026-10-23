import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "../../global.css";
import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { getTaskIdFromNotificationResponse } from "@/lib/task-reminders";
import { bootstrapAuth } from "@/store/auth-slice";
import { store, useAppDispatch, useAppSelector } from "@/store";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

function openTaskFromNotification(
  response: Notifications.NotificationResponse | null,
) {
  const taskId = getTaskIdFromNotificationResponse(response);
  if (!taskId) return;
  router.push(`/(app)/task/${taskId}`);
}

function MissingConfigScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-brand-950 px-8">
      <Text className="text-center text-lg font-bold text-white">
        App configuration missing
      </Text>
      <Text className="mt-3 text-center text-sm leading-5 text-white/75">
        EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set for this build. Add it in
        EAS Environment variables (preview/production) and rebuild.
      </Text>
    </View>
  );
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
  if (!publishableKey) {
    return <MissingConfigScreen />;
  }

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
