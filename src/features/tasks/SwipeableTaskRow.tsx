import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Swipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { taskCoverUrl, type Task } from "./types";

type Props = {
  task: Task;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
};

function DoneAction({
  progress,
  onPress,
}: {
  progress: SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.35, 1]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.85, 1]) },
    ],
  }));

  return (
    <Animated.View style={[{ width: 88, marginRight: 8, marginBottom: 12 }, style]}>
      <Pressable
        onPress={onPress}
        className="items-center justify-center rounded-3xl"
        style={{ flex: 1, minHeight: 88, backgroundColor: "#10b981" }}
      >
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
          <Ionicons name="checkmark" size={28} color="#fff" />
        </View>
        <Text className="mt-1 text-xs font-semibold text-white">Done</Text>
      </Pressable>
    </Animated.View>
  );
}

function DeleteAction({
  progress,
  onPress,
}: {
  progress: SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.35, 1]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.85, 1]) },
    ],
  }));

  return (
    <Animated.View style={[{ width: 88, marginLeft: 8, marginBottom: 12 }, style]}>
      <Pressable
        onPress={onPress}
        className="items-center justify-center rounded-3xl"
        style={{ flex: 1, minHeight: 88, backgroundColor: "#f43f5e" }}
      >
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
          <Ionicons name="trash" size={26} color="#fff" />
        </View>
        <Text className="mt-1 text-xs font-semibold text-white">Delete</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SwipeableTaskRow({ task, onToggleDone, onDelete }: Props) {
  const swipeableRef = useRef<SwipeableMethods | null>(null);
  const coverUrl = taskCoverUrl(task);

  const close = () => swipeableRef.current?.close();

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={40}
      rightThreshold={40}
      renderLeftActions={(progress) => (
        <DoneAction
          progress={progress}
          onPress={() => {
            close();
            onToggleDone(task);
          }}
        />
      )}
      renderRightActions={(progress) => (
        <DeleteAction
          progress={progress}
          onPress={() => {
            close();
            onDelete(task);
          }}
        />
      )}
    >
      <Pressable
        onPress={() => router.push(`/(app)/task/${task.id}`)}
        className="mb-3 flex-row overflow-hidden rounded-3xl border border-ink-200 bg-surface"
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
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
              task.done ? "text-ink-400 line-through" : "text-ink-900"
            }`}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {task.notes ? (
            <Text className="mt-1 text-sm text-ink-500" numberOfLines={2}>
              {task.notes}
            </Text>
          ) : null}
          {task.latitude != null && task.longitude != null ? (
            <View className="mt-1.5 flex-row items-center gap-1">
              <Ionicons name="location-outline" size={14} color="#4f46e5" />
              <Text
                className="flex-1 text-xs text-brand-600"
                numberOfLines={1}
              >
                {task.address ?? "Has location"}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="items-center justify-center px-4">
          <Ionicons
            name={task.done ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={task.done ? "#4f46e5" : "#94a3b8"}
          />
        </View>
      </Pressable>
    </Swipeable>
  );
}
