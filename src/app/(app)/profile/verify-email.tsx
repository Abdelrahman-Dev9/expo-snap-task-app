import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { ErrorBanner, InfoBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { Screen } from "@/components/ui/Screen";
import { otpSchema, type OtpFormValues } from "@/features/auth/schemas";
import {
  resendEmailChangeRequest,
  verifyEmailChangeRequest,
} from "@/features/profile/api";
import { ApiError } from "@/lib/api";
import { setUser } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store";

const RESEND_COOLDOWN = 30;

export default function VerifyChangeEmailScreen() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
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
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await verifyEmailChangeRequest(token, {
        code: values.code,
      });
      dispatch(setUser(result.user));
      router.replace("/(app)/(tabs)/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  });

  const onResend = async () => {
    if (!token || cooldown > 0) return;
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      await resendEmailChangeRequest(token);
      setInfo("A fresh code is on its way.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen
      title="Verify new email"
      subtitle={`Enter the code sent to ${email ?? "your new email"}.`}
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
        label="Confirm email"
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
