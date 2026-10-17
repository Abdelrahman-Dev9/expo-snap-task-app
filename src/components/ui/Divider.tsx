import { Text, View } from "react-native";

export function Divider({ label }: { label?: string }) {
  if (!label) {
    return <View className="my-5 h-px bg-ink-200" />;
  }

  return (
    <View className="my-5 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-ink-200" />
      <Text className="text-xs font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </Text>
      <View className="h-px flex-1 bg-ink-200" />
    </View>
  );
}
