import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { loginRequest } from "@/features/auth/api";
import { SocialAuthButtons } from "@/features/auth/SocialAuthButtons";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { ApiError } from "@/lib/api";
import { setSession } from "@/store/auth-slice";
import { useAppDispatch } from "@/store";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginRequest(values);
      dispatch(setSession({ token: result.accessToken, user: result.user }));
      router.replace("/(app)/(tabs)");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen
      title="Welcome back"
      subtitle="Sign in with Google, Apple, or Facebook — or use email."
      footer={
        <View className="flex-row justify-center gap-1">
          <Text className="text-ink-500">New to Snap Task?</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable hitSlop={8}>
              <Text className="font-semibold text-brand-600">Create account</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <ErrorBanner message={error} />

      <SocialAuthButtons onError={setError} />

      <Divider label="or continue with email" />

      <TextField
        control={control}
        name="email"
        label="Email"
        placeholder="you@example.com"
        icon="mail-outline"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextField
        control={control}
        name="password"
        label="Password"
        placeholder="Your password"
        icon="lock-closed-outline"
        secureTextEntry
        autoComplete="password"
      />

      <View className="mb-5 items-end">
        <Link href="/(auth)/forgot-password" asChild>
          <Pressable hitSlop={8}>
            <Text className="text-sm font-semibold text-brand-600">
              Forgot password?
            </Text>
          </Pressable>
        </Link>
      </View>

      <Button
        label="Sign in"
        icon="arrow-forward"
        onPress={onSubmit}
        loading={loading}
      />
    </Screen>
  );
}
