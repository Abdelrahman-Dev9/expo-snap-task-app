import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { forgotPasswordRequest } from "@/features/auth/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas";
import { ApiError } from "@/lib/api";

export default function ForgotPasswordScreen() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordRequest(values);
      router.push({
        pathname: "/(auth)/verify-reset",
        params: { email: values.email },
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to send reset code",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen
      title="Forgot password?"
      subtitle="No worries. Enter your email and we'll send a reset code."
      showBack
      footer={
        <View className="flex-row justify-center gap-1">
          <Text className="text-ink-500">Remembered it?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable hitSlop={8}>
              <Text className="font-semibold text-brand-600">Back to sign in</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <ErrorBanner message={error} />
      <TextField
        control={control}
        name="email"
        label="Email"
        placeholder="you@example.com"
        icon="mail-outline"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Button
        label="Send reset code"
        icon="paper-plane-outline"
        onPress={onSubmit}
        loading={loading}
      />
    </Screen>
  );
}
