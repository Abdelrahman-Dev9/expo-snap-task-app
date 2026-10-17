import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { ErrorBanner, InfoBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { Screen } from "@/components/ui/Screen";
import { resendOtpRequest, verifyEmailRequest } from "@/features/auth/api";
import { otpSchema, type OtpFormValues } from "@/features/auth/schemas";
import { ApiError } from "@/lib/api";
import { setSession } from "@/store/auth-slice";
import { useAppDispatch } from "@/store";

const RESEND_COOLDOWN = 30;

export default function VerifyEmailScreen() {
  const dispatch = useAppDispatch();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const { control, handleSubmit, watch } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const code = watch("code");

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const onSubmit = handleSubmit(async (values) => {
    if (!email) {
      setError("Missing email. Please register again.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await verifyEmailRequest({ email, code: values.code });
      dispatch(setSession({ token: result.accessToken, user: result.user }));
      router.replace("/(app)/(tabs)");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  });

  const onResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      await resendOtpRequest({ email, purpose: "register" });
      setInfo("A fresh code is on its way. Check your inbox and spam.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen
      title="Check your inbox"
      subtitle={`We sent a 6-digit code to ${email ?? "your email"}.`}
      showBack
    >
      <ErrorBanner message={error} />
      <InfoBanner message={info} />

      <Text className="mb-3 text-sm font-semibold text-ink-700">
        Verification code
      </Text>
      <Controller
        control={control}
        name="code"
        render={({ field: { value, onChange }, fieldState: { error: fieldError } }) => (
          <OtpInput value={value} onChange={onChange} error={fieldError?.message} />
        )}
      />

      <Button
        label="Verify and continue"
        icon="checkmark"
        onPress={onSubmit}
        loading={loading}
        disabled={code.length !== 6}
      />

      <View className="mt-6 items-center">
        {cooldown > 0 ? (
          <Text className="text-sm text-ink-500">
            Resend code in{" "}
            <Text className="font-semibold text-ink-700">{cooldown}s</Text>
          </Text>
        ) : (
          <Button
            label="Resend code"
            onPress={onResend}
            loading={resending}
            variant="ghost"
          />
        )}
      </View>
    </Screen>
  );
}
