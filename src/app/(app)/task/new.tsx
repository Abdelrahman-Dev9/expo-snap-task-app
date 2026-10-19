import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { formatCoords } from "@/features/location/geocode";
import { consumePendingLocationPick } from "@/features/location/pending-pick";
import type { GeoLocation } from "@/features/location/types";
import { createTaskRequest } from "@/features/tasks/api";
import { ApiError } from "@/lib/api";
import { useAppSelector } from "@/store";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewTaskScreen() {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
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
      await createTaskRequest(token, {
        title: values.title,
        notes: values.notes,
        imageUri,
        location,
      });
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
      subtitle="Add notes, an optional photo, and an optional place."
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

      <Text className="mb-2 text-sm font-semibold text-ink-700">Photo</Text>
      <Pressable
        onPress={pickImage}
        className="mb-4 overflow-hidden rounded-2xl border border-dashed border-ink-200 bg-surface"
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
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
            {location ? (
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
