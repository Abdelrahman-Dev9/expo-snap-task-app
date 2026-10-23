import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/components/ui/theme";
import { getMeRequest } from "@/features/profile/api";
import {
  deleteTaskRequest,
  listTasksRequest,
  updateTaskRequest,
} from "@/features/tasks/api";
import { SwipeableTaskRow } from "@/features/tasks/SwipeableTaskRow";
import type { Task } from "@/features/tasks/types";
import { ApiError } from "@/lib/api";
import { setUser } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store";

export default function TasksScreen() {
  const dispatch = useAppDispatch();
  const { isSignedIn: clerkSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName =
    user?.name?.split(" ")[0] ||
    clerkUser?.firstName ||
    clerkUser?.fullName?.split(" ")[0];

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      // Clerk social login is mobile-only — Nest APIs need the email JWT.
      if (!token) {
        setTasks([]);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        return;
      }
      if (mode === "refresh") setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const [data, me] = await Promise.all([
          listTasksRequest(token),
          getMeRequest(token),
        ]);
        setTasks(data);
        dispatch(setUser(me));
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load tasks",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      void load("initial");
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

  const confirmDelete = (task: Task) => {
    Alert.alert(
      "Delete task?",
      `“${task.title}” will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteTask(task),
        },
      ],
    );
  };

  const deleteTask = async (task: Task) => {
    if (!token) return;
    try {
      await deleteTaskRequest(token, task.id);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete task");
    }
  };

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => void load("refresh")}
      tintColor={theme.colors.brand600}
      colors={[theme.colors.brand600]}
    />
  );

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
              Hello{displayName ? `, ${displayName}` : ""}
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/task/new")}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-ink-900/10 active:bg-ink-900/20"
            >
              <Ionicons name="add" size={24} color="#0f172a" />
            </Pressable>
          </View>
          {tasks.length > 0 ? (
            <Text className="mt-2 text-xs text-ink-500">
              Swipe right to mark done · swipe left to delete · pull to refresh
            </Text>
          ) : null}
        </View>

        <View className="flex-1 rounded-t-3xl bg-canvas px-6 pt-5">
          {loading && tasks.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={theme.colors.brand600} />
            </View>
          ) : (
            <FlatList
              data={error ? [] : tasks}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 24,
                flexGrow: 1,
              }}
              refreshControl={refreshControl}
              ListEmptyComponent={
                error ? (
                  <View className="flex-1 items-center justify-center px-4 py-16">
                    <Text className="text-center text-sm text-accent-500">
                      {error}
                    </Text>
                    <Pressable
                      onPress={() => void load("refresh")}
                      className="mt-4"
                    >
                      <Text className="font-semibold text-brand-600">
                        Try again
                      </Text>
                    </Pressable>
                  </View>
                ) : !token && clerkSignedIn ? (
                  <View className="flex-1 items-center justify-center py-16">
                    <View className="h-24 w-24 items-center justify-center rounded-3xl bg-brand-50">
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={44}
                        color="#4f46e5"
                      />
                    </View>
                    <Text className="mt-5 text-xl font-bold text-ink-900">
                      Signed in with Clerk
                    </Text>
                    <Text className="mt-2 max-w-[280px] text-center text-sm leading-5 text-ink-500">
                      Social login is mobile-only. Use email sign-in to sync
                      tasks with the Nest API.
                    </Text>
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center py-16">
                    <View className="h-24 w-24 items-center justify-center rounded-3xl bg-brand-50">
                      <Ionicons
                        name="checkbox-outline"
                        size={44}
                        color="#4f46e5"
                      />
                    </View>
                    <Text className="mt-5 text-xl font-bold text-ink-900">
                      No tasks yet
                    </Text>
                    <Text className="mt-2 max-w-[260px] text-center text-sm leading-5 text-ink-500">
                      Create your first task and attach a photo if you want.
                      Pull down anytime to refresh.
                    </Text>
                    <Pressable
                      onPress={() => router.push("/(app)/task/new")}
                      className="mt-6 h-12 items-center justify-center rounded-2xl bg-brand-600 px-6"
                    >
                      <Text className="font-semibold text-white">Add task</Text>
                    </Pressable>
                  </View>
                )
              }
              renderItem={({ item }) => (
                <SwipeableTaskRow
                  task={item}
                  onToggleDone={(task) => void toggleDone(task)}
                  onDelete={confirmDelete}
                />
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
