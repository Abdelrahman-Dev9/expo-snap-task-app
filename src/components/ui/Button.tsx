import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  icon?: IconName;
};

export function Button({
  label,
  onPress,
  loading = false,
  variant = "primary",
  disabled = false,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === "ghost") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className="items-center justify-center py-3 active:opacity-70"
      >
        {loading ? (
          <ActivityIndicator color="#4f46e5" />
        ) : (
          <Text className="text-base font-semibold text-brand-600">
            {label}
          </Text>
        )}
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-surface px-4 active:bg-ink-100 ${
          isDisabled ? "opacity-60" : ""
        }`}
      >
        {icon ? <Ionicons name={icon} size={18} color="#0f172a" /> : null}
        <Text className="text-base font-semibold text-ink-900">{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 shadow-lg shadow-brand-600/30 active:bg-brand-700 ${
        isDisabled ? "opacity-60" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-white">{label}</Text>
          {icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
        </View>
      )}
    </Pressable>
  );
}
