import "../../global.css";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { bootstrapAuth } from "@/store/auth-slice";
import { store, useAppDispatch, useAppSelector } from "@/store";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}
