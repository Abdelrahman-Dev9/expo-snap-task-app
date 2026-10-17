import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", notes: "" },
  });

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

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await createTaskRequest(token, {
        title: values.title,
        notes: values.notes,
        imageUri,
      });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen title="New task" subtitle="Add notes and an optional photo." showBack>
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
        className="mb-6 overflow-hidden rounded-2xl border border-dashed border-ink-200 bg-surface"
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

      <Button
        label="Create task"
        icon="checkmark"
        onPress={onSubmit}
        loading={loading}
      />
    </Screen>
  );
}
