import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { resetPasswordRequest } from "@/features/auth/api";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas";
import { ApiError } from "@/lib/api";

export default function ResetPasswordScreen() {
  const { resetToken } = useLocalSearchParams<{ resetToken: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!resetToken) {
      setError("Missing reset token. Please request a new code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPasswordRequest({
        resetToken,
        newPassword: values.newPassword,
      });
      router.replace("/(auth)/login");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to update password",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen
      title="Set a new password"
      subtitle="Make it strong — you'll use it to sign in from now on."
      showBack
    >
      <ErrorBanner message={error} />
      <TextField
        control={control}
        name="newPassword"
        label="New password"
        placeholder="Create a strong password"
        icon="lock-closed-outline"
        secureTextEntry
        autoComplete="new-password"
        hint="8+ characters with upper, lower, number and symbol."
      />
      <TextField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        placeholder="Repeat your password"
        icon="shield-checkmark-outline"
        secureTextEntry
        autoComplete="new-password"
      />
      <Button
        label="Update password"
        icon="checkmark"
        onPress={onSubmit}
        loading={loading}
      />
    </Screen>
  );
}
