import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type BannerProps = {
  message?: string | null;
  tone?: "error" | "info" | "success";
};

const tones = {
  error: {
    wrap: "border-accent-500/30 bg-accent-500/10",
    text: "text-accent-500",
    icon: "alert-circle" as const,
    color: "#f43f5e",
  },
  info: {
    wrap: "border-brand-200 bg-brand-50",
    text: "text-brand-700",
    icon: "information-circle" as const,
    color: "#4338ca",
  },
  success: {
    wrap: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-700",
    icon: "checkmark-circle" as const,
    color: "#047857",
  },
};

export function Banner({ message, tone = "info" }: BannerProps) {
  if (!message) return null;
  const t = tones[tone];

  return (
    <View
      className={`mb-4 flex-row items-start gap-2.5 rounded-2xl border px-4 py-3 ${t.wrap}`}
    >
      <Ionicons name={t.icon} size={18} color={t.color} style={{ marginTop: 1 }} />
      <Text className={`flex-1 text-sm leading-5 ${t.text}`}>{message}</Text>
    </View>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  return <Banner message={message} tone="error" />;
}

export function InfoBanner({ message }: { message?: string | null }) {
  return <Banner message={message} tone="info" />;
}
