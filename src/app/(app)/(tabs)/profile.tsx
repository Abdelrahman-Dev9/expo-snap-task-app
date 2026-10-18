import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { ErrorBanner, InfoBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { theme } from "@/components/ui/theme";
import {
  updatePasswordRequest,
  updateProfileRequest,
  uploadAvatarRequest,
} from "@/features/profile/api";
import { ApiError } from "@/lib/api";
import { clearSession, setUser } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store";

const nameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

type NameForm = z.infer<typeof nameSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function initials(name?: string) {
  if (!name) return "ST";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSaveName = nameForm.handleSubmit(async (values) => {
    if (!token) return;
    setSavingName(true);
    setError(null);
    setInfo(null);
    try {
      const updated = await updateProfileRequest(token, values);
      dispatch(setUser(updated));
      setInfo("Name updated");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update name");
    } finally {
      setSavingName(false);
    }
  });

  const onSavePassword = passwordForm.handleSubmit(async (values) => {
    if (!token) return;
    setSavingPassword(true);
    setError(null);
    setInfo(null);
    try {
      await updatePasswordRequest(token, values);
      passwordForm.reset();
      setInfo("Password updated");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update password",
      );
    } finally {
      setSavingPassword(false);
    }
  });

  const onPickAvatar = async () => {
    if (!token) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadingAvatar(true);
    setError(null);
    setInfo(null);
    try {
      const asset = result.assets[0];
      const updated = await uploadAvatarRequest(token, asset.uri);
      dispatch(setUser(updated));
      setInfo("Avatar updated");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to upload avatar",
      );
    } finally {
      setUploadingAvatar(false);
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
            Profile
          </Text>
          <Text className="mt-2 text-2xl font-bold text-ink-900">Your account</Text>
        </View>

        <ScrollView
          className="flex-1 rounded-t-3xl bg-canvas"
          contentContainerClassName="px-6 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center">
            <Pressable onPress={onPickAvatar} disabled={uploadingAvatar}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-100">
                  <Text className="text-2xl font-bold text-brand-700">
                    {initials(user?.name)}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-brand-600">
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </Pressable>
            <Text className="mt-3 text-lg font-semibold text-ink-900">
              {user?.name}
            </Text>
            <Text className="text-sm text-ink-500">{user?.email}</Text>
            {uploadingAvatar ? (
              <Text className="mt-2 text-xs text-ink-400">Uploading…</Text>
            ) : (
              <Text className="mt-2 text-xs text-ink-400">
                Tap photo to change
              </Text>
            )}
          </View>

          <View className="mt-6">
            <ErrorBanner message={error} />
            <InfoBanner message={info} />

            <Text className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">
              Name
            </Text>
            <TextField
              control={nameForm.control}
              name="name"
              label="Display name"
              icon="person-outline"
              autoCapitalize="words"
            />
            <Button
              label="Save name"
              icon="checkmark"
              onPress={onSaveName}
              loading={savingName}
            />

            <Pressable
              onPress={() => router.push("/(app)/profile/change-email")}
              className="mt-4 h-14 flex-row items-center justify-between rounded-2xl border border-ink-200 bg-surface px-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="mail-outline" size={18} color="#4f46e5" />
                <Text className="font-semibold text-ink-900">Change email</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </Pressable>

            <Text className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-ink-400">
              Password
            </Text>
            <TextField
              control={passwordForm.control}
              name="currentPassword"
              label="Current password"
              icon="lock-closed-outline"
              secureTextEntry
            />
            <TextField
              control={passwordForm.control}
              name="newPassword"
              label="New password"
              icon="key-outline"
              secureTextEntry
            />
            <Button
              label="Update password"
              icon="shield-checkmark-outline"
              onPress={onSavePassword}
              loading={savingPassword}
            />

            <View className="mt-8 pb-10">
              <Button
                label="Sign out"
                icon="log-out-outline"
                variant="secondary"
                onPress={() => dispatch(clearSession())}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
