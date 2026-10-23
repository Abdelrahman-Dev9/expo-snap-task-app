import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { formatCoords } from "@/features/location/geocode";
import { consumePendingLocationPick } from "@/features/location/pending-pick";
import type { GeoLocation } from "@/features/location/types";
import { createTaskRequest } from "@/features/tasks/api";
import { DueScheduleFields } from "@/features/tasks/DueScheduleFields";
import {
  MAX_TASK_IMAGES,
  type RemindBeforeMinutes,
} from "@/features/tasks/types";
import { ApiError } from "@/lib/api";
import { pickImageWithSource } from "@/lib/pick-image";
import { scheduleTaskReminders } from "@/lib/task-reminders";
import { useAppSelector } from "@/store";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewTaskScreen() {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [dueAt, setDueAt] = useState<Date | null>(null);
  const [remindBeforeMinutes, setRemindBeforeMinutes] =
    useState<RemindBeforeMinutes>(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", notes: "" },
  });

  useFocusEffect(
    useCallback(() => {
      const picked = consumePendingLocationPick();
      if (picked) setLocation(picked);
    }, []),
  );

  const pickImages = async () => {
    const remaining = MAX_TASK_IMAGES - imageUris.length;
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

    setImageUris((prev) =>
      [...prev, ...picked.map((p) => p.uri)].slice(0, MAX_TASK_IMAGES),
    );
    setError(null);
  };

  const removeLocalImage = (uri: string) => {
    setImageUris((prev) => prev.filter((item) => item !== uri));
  };

  const openLocationPicker = () => {
    const seed =
      location ??
      (user?.latitude != null && user?.longitude != null
        ? {
            latitude: user.latitude,
            longitude: user.longitude,
            address: user.address,
          }
        : null);

    const href = seed
      ? (`/(app)/pick-location?latitude=${seed.latitude}&longitude=${seed.longitude}&address=${encodeURIComponent(seed.address ?? "")}` as Href)
      : ("/(app)/pick-location" as Href);
    router.push(href);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const created = await createTaskRequest(token, {
        title: values.title,
        notes: values.notes,
        imageUris,
        location,
        dueAt,
        remindBeforeMinutes: dueAt ? remindBeforeMinutes : null,
      });
      if (created.dueAt) {
        const scheduled = await scheduleTaskReminders(created);
        if (!scheduled) {
          Alert.alert(
            "Reminders need permission",
            "Task saved. Enable notifications in Settings to get due reminders.",
          );
        }
      }
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen
      title="New task"
      subtitle="Add notes, photos, a place, and an optional due reminder."
      showBack
    >
      <ErrorBanner message={error} />

      <TextField
        control={control}
        name="title"
        label="Title"
        icon="create-outline"
        autoCapitalize="sentences"
        placeholder="What needs doing?"
      />
      <TextField
        control={control}
        name="notes"
        label="Notes"
        icon="document-text-outline"
        autoCapitalize="sentences"
        placeholder="Optional details"
      />

      <Text className="mb-2 text-sm font-semibold text-ink-700">
        Photos ({imageUris.length}/{MAX_TASK_IMAGES})
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerClassName="gap-3"
      >
        {imageUris.map((uri) => (
          <View key={uri} className="relative">
            <Image
              source={{ uri }}
              style={{ width: 112, height: 112, borderRadius: 16 }}
              contentFit="cover"
            />
            <Pressable
              onPress={() => removeLocalImage(uri)}
              className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-ink-900/70"
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {imageUris.length < MAX_TASK_IMAGES ? (
          <Pressable
            onPress={() => void pickImages()}
            className="h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-surface"
          >
            <Ionicons name="camera-outline" size={28} color="#94a3b8" />
            <Text className="mt-1 text-xs text-ink-500">Add</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <DueScheduleFields
        dueAt={dueAt}
        remindBeforeMinutes={remindBeforeMinutes}
        onChangeDueAt={(value) => {
          setDueAt(value);
          if (value && remindBeforeMinutes === null) {
            setRemindBeforeMinutes(30);
          }
        }}
        onChangeRemindBefore={setRemindBeforeMinutes}
      />

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
            {location ? (
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
      {location ? (
        <Pressable onPress={() => setLocation(null)} className="mb-6">
          <Text className="text-sm font-semibold text-accent-500">
            Remove location
          </Text>
        </Pressable>
      ) : (
        <View className="mb-6" />
      )}

      <Button
        label="Create task"
        icon="checkmark"
        onPress={onSubmit}
        loading={loading}
      />
    </Screen>
  );
}
