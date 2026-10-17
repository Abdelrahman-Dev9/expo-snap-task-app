import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Provider = "google" | "facebook" | "apple";

type SocialButtonProps = {
  provider: Provider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const config: Record<
  Provider,
  { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; color: string }
> = {
  google: { label: "Continue with Google", icon: "logo-google", color: "#EA4335" },
  facebook: { label: "Continue with Facebook", icon: "logo-facebook", color: "#1877F2" },
  apple: { label: "Continue with Apple", icon: "logo-apple", color: "#0f172a" },
};

export function SocialButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
}: SocialButtonProps) {
  const { label, icon, color } = config[provider];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`h-14 flex-row items-center rounded-2xl border border-ink-200 bg-surface px-4 active:bg-ink-100 ${
        isDisabled ? "opacity-60" : ""
      }`}
    >
      <View className="h-8 w-8 items-center justify-center">
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <Ionicons name={icon} size={20} color={color} />
        )}
      </View>
      <Text className="flex-1 text-center text-base font-semibold text-ink-900">
        {label}
      </Text>
      <View className="h-8 w-8" />
    </Pressable>
  );
}
