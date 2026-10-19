import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  type Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { theme } from "@/components/ui/theme";
import { formatCoords } from "@/features/location/geocode";
import { consumePendingLocationPick } from "@/features/location/pending-pick";
import type { GeoLocation } from "@/features/location/types";
import {
  deleteTaskRequest,
  getTaskRequest,
  updateTaskRequest,
} from "@/features/tasks/api";
import type { Task } from "@/features/tasks/types";
import { ApiError } from "@/lib/api";
import { useAppSelector } from "@/store";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useAppSelector((state) => state.auth.token);
  const [task, setTask] = useState<Task | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [clearLocation, setClearLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", notes: "" },
  });

  useEffect(() => {
    if (!token || !id) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTaskRequest(token, id);
        setTask(data);
        reset({ title: data.title, notes: data.notes ?? "" });
        if (data.latitude != null && data.longitude != null) {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
          });
        } else {
          setLocation(null);
        }
        setClearLocation(false);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id, reset]);

  useFocusEffect(
    useCallback(() => {
      const picked = consumePendingLocationPick();
      if (picked) {
        setLocation(picked);
        setClearLocation(false);
      }
    }, []),
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openLocationPicker = () => {
    const href = location
      ? (`/(app)/pick-location?latitude=${location.latitude}&longitude=${location.longitude}&address=${encodeURIComponent(location.address ?? "")}` as Href)
      : ("/(app)/pick-location" as Href);
    router.push(href);
  };

  const onSave = handleSubmit(async (values) => {
    if (!token || !id || !task) return;
    setSaving(true);
    setError(null);
    try {
      await updateTaskRequest(token, id, {
        title: values.title,
        notes: values.notes ?? "",
        imageUri,
        location: clearLocation ? null : location,
        clearLocation,
      });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  });

  const onToggleDone = async () => {
    if (!token || !id || !task) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateTaskRequest(token, id, { done: !task.done });
      setTask(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!token || !id) return;
    Alert.alert("Delete task", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            setDeleting(true);
            setError(null);
            try {
              await deleteTaskRequest(token, id);
              router.back();
            } catch (err) {
              setError(
                err instanceof ApiError ? err.message : "Failed to delete task",
              );
            } finally {
              setDeleting(false);
            }
          })();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen title="Task" showBack>
        <View className="items-center py-20">
          <ActivityIndicator size="large" color={theme.colors.brand600} />
        </View>
      </Screen>
    );
  }

  const previewUri = imageUri ?? task?.imageUrl ?? null;

  return (
    <Screen title="Edit task" subtitle="Update details, photo, place, or status." showBack>
      <ErrorBanner message={error} />

      <TextField
        control={control}
        name="title"
        label="Title"
        icon="create-outline"
        autoCapitalize="sentences"
      />
      <TextField
        control={control}
        name="notes"
        label="Notes"
        icon="document-text-outline"
        autoCapitalize="sentences"
      />

      <Text className="mb-2 text-sm font-semibold text-ink-700">Photo</Text>
      <Pressable
        onPress={pickImage}
        className="mb-4 overflow-hidden rounded-2xl border border-dashed border-ink-200 bg-surface"
      >
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={{ width: "100%", height: 180 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-40 items-center justify-center gap-2">
            <Ionicons name="image-outline" size={32} color="#94a3b8" />
            <Text className="text-sm text-ink-500">Tap to add a photo</Text>
          </View>
        )}
      </Pressable>

      <Text className="mb-2 text-sm font-semibold text-ink-700">
        Location (optional)
      </Text>
      <Pressable
        onPress={openLocationPicker}
        className="mb-2 flex-row items-center justify-between rounded-2xl border border-ink-200 bg-surface px-4 py-4"
      >
        <View className="mr-3 flex-1 flex-row items-center gap-3">
          <Ionicons name="location-outline" size={20} color="#4f46e5" />
          <View className="flex-1">
            {location && !clearLocation ? (
              <>
                <Text className="text-sm font-semibold text-ink-900" numberOfLines={2}>
                  {location.address ?? "Selected place"}
                </Text>
                <Text className="mt-0.5 text-xs text-ink-500">
                  {formatCoords(location)}
                </Text>
              </>
            ) : (
              <Text className="text-sm text-ink-500">Add a place on the map</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      </Pressable>
      {location && !clearLocation ? (
        <Pressable
          onPress={() => {
            setLocation(null);
            setClearLocation(true);
          }}
          className="mb-6"
        >
          <Text className="text-sm font-semibold text-accent-500">
            Remove location
          </Text>
        </Pressable>
      ) : (
        <View className="mb-6" />
      )}

      <Button label="Save changes" icon="checkmark" onPress={onSave} loading={saving} />

      <View className="mt-3">
        <Button
          label={task?.done ? "Mark as not done" : "Mark as done"}
          icon={task?.done ? "ellipse-outline" : "checkmark-circle-outline"}
          variant="secondary"
          onPress={() => void onToggleDone()}
          loading={saving}
        />
      </View>

      <View className="mt-3">
        <Button
          label="Delete task"
          icon="trash-outline"
          variant="ghost"
          onPress={onDelete}
          loading={deleting}
        />
      </View>
    </Screen>
  );
}
