import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/components/ui/theme";
import { listTasksRequest, updateTaskRequest } from "@/features/tasks/api";
import type { Task } from "@/features/tasks/types";
import { ApiError } from "@/lib/api";
import { useAppSelector } from "@/store";

export default function TasksScreen() {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listTasksRequest(token);
      setTasks(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const toggleDone = async (task: Task) => {
    if (!token) return;
    try {
      const updated = await updateTaskRequest(token, task.id, {
        done: !task.done,
      });
      setTasks((prev) =>
        prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => Number(a.done) - Number(b.done)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update task");
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <LinearGradient
        colors={[...theme.gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-x-0 top-0 h-[220px]"
      />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 pb-4 pt-2">
          <Text className="text-xs font-semibold uppercase tracking-[3px] text-ink-900">
            Snap Task
          </Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-ink-900">
              Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/task/new")}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-ink-900/10 active:bg-ink-900/20"
            >
              <Ionicons name="add" size={24} color="#0f172a" />
            </Pressable>
          </View>
        </View>

        <View className="flex-1 rounded-t-3xl bg-canvas px-6 pt-5">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={theme.colors.brand600} />
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center px-4">
              <Text className="text-center text-sm text-accent-500">{error}</Text>
              <Pressable onPress={load} className="mt-4">
                <Text className="font-semibold text-brand-600">Try again</Text>
              </Pressable>
            </View>
          ) : tasks.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <View className="h-24 w-24 items-center justify-center rounded-3xl bg-brand-50">
                <Ionicons name="checkbox-outline" size={44} color="#4f46e5" />
              </View>
              <Text className="mt-5 text-xl font-bold text-ink-900">
                No tasks yet
              </Text>
              <Text className="mt-2 max-w-[260px] text-center text-sm leading-5 text-ink-500">
                Create your first task and attach a photo if you want.
              </Text>
              <Pressable
                onPress={() => router.push("/(app)/task/new")}
                className="mt-6 h-12 items-center justify-center rounded-2xl bg-brand-600 px-6"
              >
                <Text className="font-semibold text-white">Add task</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/(app)/task/${item.id}`)}
                  className="mb-3 flex-row overflow-hidden rounded-3xl border border-ink-200 bg-surface"
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: 88, height: 88 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="h-[88px] w-[88px] items-center justify-center bg-brand-50">
                      <Ionicons name="image-outline" size={28} color="#94a3b8" />
                    </View>
                  )}
                  <View className="flex-1 justify-center px-4 py-3">
                    <Text
                      className={`text-base font-semibold ${
                        item.done
                          ? "text-ink-400 line-through"
                          : "text-ink-900"
                      }`}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {item.notes ? (
                      <Text
                        className="mt-1 text-sm text-ink-500"
                        numberOfLines={2}
                      >
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => void toggleDone(item)}
                    hitSlop={8}
                    className="items-center justify-center px-4"
                  >
                    <Ionicons
                      name={item.done ? "checkmark-circle" : "ellipse-outline"}
                      size={28}
                      color={item.done ? "#4f46e5" : "#94a3b8"}
                    />
                  </Pressable>
                </Pressable>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
