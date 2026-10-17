import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { theme } from "@/components/ui/theme";
import { clearSession } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store";

function initials(name?: string) {
  if (!name) return "ST";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <View className="flex-1 bg-canvas">
      <LinearGradient
        colors={[...theme.gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-x-0 top-0 h-[260px]"
      />
      <SafeAreaView className="flex-1 px-6">
        <View className="mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-[3px] text-white/70">
              Snap Task
            </Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
            </Text>
          </View>
          <Pressable className="h-12 w-12 items-center justify-center rounded-full border-2 border-white/40 bg-white/15">
            <Text className="text-base font-bold text-white">
              {initials(user?.name)}
            </Text>
          </Pressable>
        </View>

        <View className="mt-8 rounded-3xl border border-ink-200 bg-surface p-5 shadow-lg shadow-brand-900/10">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
              <Ionicons name="shield-checkmark" size={22} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink-900">
                You're signed in
              </Text>
              <Text className="mt-0.5 text-sm text-ink-500" numberOfLines={1}>
                {user?.email ?? "your account"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 flex-1 items-center justify-center">
          <View className="h-24 w-24 items-center justify-center rounded-3xl bg-brand-50">
            <Ionicons name="checkbox-outline" size={44} color="#4f46e5" />
          </View>
          <Text className="mt-5 text-xl font-bold text-ink-900">
            No tasks yet
          </Text>
          <Text className="mt-2 max-w-[260px] text-center text-sm leading-5 text-ink-500">
            Your tasks will show up here. Create your first one to get going.
          </Text>
        </View>

        <View className="pb-4">
          <Button
            label="Sign out"
            icon="log-out-outline"
            variant="secondary"
            onPress={() => dispatch(clearSession())}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
