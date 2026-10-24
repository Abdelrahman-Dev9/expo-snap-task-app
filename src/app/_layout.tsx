import "../../global.css";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { Component, type ErrorInfo, type ReactNode, useEffect } from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { NotificationBootstrap } from "@/components/NotificationBootstrap";
import {
  CLERK_ENABLED,
  CLERK_PUBLISHABLE_KEY,
} from "@/lib/clerk-config";
import { bootstrapAuth } from "@/store/auth-slice";
import { store, useAppDispatch, useAppSelector } from "@/store";

type BoundaryState = { error: Error | null };

class StartupErrorBoundary extends Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Startup crash", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center bg-brand-950 px-8">
          <Text className="text-center text-lg font-bold text-white">
            Something went wrong
          </Text>
          <Text className="mt-3 text-center text-sm leading-5 text-white/75">
            {this.state.error.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
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
    <>
      <NotificationBootstrap />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1e1b4b" },
        }}
      />
    </>
  );
}

function AppTree() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

export default function RootLayout() {
  const tree = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StartupErrorBoundary>
        <AppTree />
      </StartupErrorBoundary>
    </GestureHandlerRootView>
  );

  if (!CLERK_ENABLED) {
    return tree;
  }

  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MissingConfigScreen />
      </GestureHandlerRootView>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ClerkProvider } = require("@clerk/expo") as typeof import("@clerk/expo");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { clerkTokenCache } = require("@/lib/clerk-token-cache") as typeof import("@/lib/clerk-token-cache");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StartupErrorBoundary>
        <ClerkProvider
          publishableKey={CLERK_PUBLISHABLE_KEY}
          tokenCache={clerkTokenCache}
        >
          <AppTree />
        </ClerkProvider>
      </StartupErrorBoundary>
    </GestureHandlerRootView>
  );
}
