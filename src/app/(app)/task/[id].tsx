import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import {
  type Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
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
import { MAX_TASK_IMAGES, type Task, type TaskImage } from "@/features/tasks/types";
import { ApiError } from "@/lib/api";
import { pickImageWithSource } from "@/lib/pick-image";
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
  const [existingImages, setExistingImages] = useState<TaskImage[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const [newImageUris, setNewImageUris] = useState<string[]>([]);
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

  const visibleExisting = useMemo(
    () => existingImages.filter((img) => !removeImageIds.includes(img.id)),
    [existingImages, removeImageIds],
  );

  const totalCount = visibleExisting.length + newImageUris.length;

  useEffect(() => {
    if (!token || !id) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTaskRequest(token, id);
        setTask(data);
        setExistingImages(data.images ?? []);
        setRemoveImageIds([]);
        setNewImageUris([]);
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

  const pickImages = async () => {
    const remaining = MAX_TASK_IMAGES - totalCount;
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_TASK_IMAGES} photos`);
      return;
    }

    const picked = await pickImageWithSource({
      allowsEditing: remaining === 1,
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
    });
    if (!picked?.length) return;

    setNewImageUris((prev) =>
      [...prev, ...picked.map((p) => p.uri)].slice(
        0,
        MAX_TASK_IMAGES - visibleExisting.length,
      ),
    );
    setError(null);
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
        imageUris: newImageUris,
        removeImageIds,
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
      setExistingImages(updated.images ?? []);
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

  return (
    <Screen
      title="Edit task"
      subtitle="Update details, photos, place, or status."
      showBack
    >
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

      <Text className="mb-2 text-sm font-semibold text-ink-700">
        Photos ({totalCount}/{MAX_TASK_IMAGES})
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerClassName="gap-3"
      >
        {visibleExisting.map((img) => (
          <View key={img.id} className="relative">
            <Image
              source={{ uri: img.url }}
              style={{ width: 112, height: 112, borderRadius: 16 }}
              contentFit="cover"
            />
            <Pressable
              onPress={() =>
                setRemoveImageIds((prev) =>
                  prev.includes(img.id) ? prev : [...prev, img.id],
                )
              }
              className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-ink-900/70"
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {newImageUris.map((uri) => (
          <View key={uri} className="relative">
            <Image
              source={{ uri }}
              style={{ width: 112, height: 112, borderRadius: 16 }}
              contentFit="cover"
            />
            <Pressable
              onPress={() =>
                setNewImageUris((prev) => prev.filter((item) => item !== uri))
              }
              className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-ink-900/70"
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {totalCount < MAX_TASK_IMAGES ? (
          <Pressable
            onPress={() => void pickImages()}
            className="h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-surface"
          >
            <Ionicons name="camera-outline" size={28} color="#94a3b8" />
            <Text className="mt-1 text-xs text-ink-500">Add</Text>
          </Pressable>
        ) : null}
      </ScrollView>

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
                <Text
                  className="text-sm font-semibold text-ink-900"
                  numberOfLines={2}
                >
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

      <Button
        label="Save changes"
        icon="checkmark"
        onPress={onSave}
        loading={saving}
      />

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
