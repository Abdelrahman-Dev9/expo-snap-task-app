import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "./theme";

type ScreenProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export function Screen({
  title,
  subtitle,
  eyebrow = "Snap Task",
  showBack = false,
  children,
  footer,
}: ScreenProps) {
  return (
    <View className="flex-1 bg-brand-950">
      <LinearGradient
        colors={[...theme.gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-x-0 top-0 h-[360px]"
      />
      {/* Decorative orbs */}
      <View className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-white/10" />
      <View className="absolute -left-20 top-40 h-44 w-44 rounded-full bg-accent-500/20" />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerClassName="grow pb-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 pb-7 pt-4">
              <View className="mb-6 flex-row items-center justify-between">
                {showBack && router.canGoBack() ? (
                  <Pressable
                    onPress={() => router.back()}
                    hitSlop={12}
                    className="h-10 w-10 items-center justify-center rounded-full bg-white/15 active:bg-white/25"
                  >
                    <Ionicons name="chevron-back" size={20} color="#fff" />
                  </Pressable>
                ) : (
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                    <Ionicons name="flash" size={20} color="#fff" />
                  </View>
                )}
                <Text className="text-xs font-semibold uppercase tracking-[3px] text-white/70">
                  {eyebrow}
                </Text>
                <View className="h-10 w-10" />
              </View>

              <Text className="text-display font-bold text-white">{title}</Text>
              {subtitle ? (
                <Text className="mt-2 text-base leading-6 text-white/75">
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <View className="flex-1 rounded-t-3xl bg-canvas px-6 pb-6 pt-7">
              {children}
              {footer ? <View className="mt-auto pt-6">{footer}</View> : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
