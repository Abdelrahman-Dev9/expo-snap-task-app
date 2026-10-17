import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { requestEmailChangeRequest } from "@/features/profile/api";
import { ApiError } from "@/lib/api";
import { useAppSelector } from "@/store";

const schema = z.object({
  newEmail: z.email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ChangeEmailScreen() {
  const token = useAppSelector((state) => state.auth.token);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newEmail: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await requestEmailChangeRequest(token, { newEmail: values.newEmail });
      router.push({
        pathname: "/(app)/profile/verify-email",
        params: { email: values.newEmail },
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to request email change",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen
      title="Change email"
      subtitle="We'll send a verification code to the new address."
      showBack
    >
      <ErrorBanner message={error} />
      <TextField
        control={control}
        name="newEmail"
        label="New email"
        icon="mail-outline"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Button
        label="Send code"
        icon="arrow-forward"
        onPress={onSubmit}
        loading={loading}
      />
    </Screen>
  );
}
