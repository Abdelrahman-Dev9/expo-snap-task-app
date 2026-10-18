import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Screen } from "@/components/ui/Screen";
import { SocialButton } from "@/components/ui/SocialButton";
import { TextField } from "@/components/ui/TextField";
import { registerRequest } from "@/features/auth/api";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas";
import { signInWithProvider, type SocialProvider } from "@/features/auth/social";
import { ApiError } from "@/lib/api";

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      await registerRequest(values);
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: values.email },
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to create account",
      );
    } finally {
      setLoading(false);
    }
  });

  const onSocial = async (provider: SocialProvider) => {
    setSocialLoading(provider);
    try {
      await signInWithProvider(provider);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <Screen
      title="Create account"
      subtitle="Start organising your tasks in seconds."
      showBack
      footer={
        <View className="flex-row justify-center gap-1">
          <Text className="text-ink-500">Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable hitSlop={8}>
              <Text className="font-semibold text-brand-600">Sign in</Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <ErrorBanner message={error} />
      <TextField
        control={control}
        name="name"
        label="Full name"
        placeholder="Jane Doe"
        icon="person-outline"
        autoCapitalize="words"
        autoComplete="name"
      />
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
        placeholder="Create a strong password"
        icon="lock-closed-outline"
        secureTextEntry
        autoComplete="new-password"
        hint="8+ characters with upper, lower, number and symbol."
      />

      <Button
        label="Continue"
        icon="arrow-forward"
        onPress={onSubmit}
        loading={loading}
      />

      <Divider label="or continue with" />

      <View className="gap-3">
        <SocialButton
          provider="google"
          onPress={() => onSocial("google")}
          loading={socialLoading === "google"}
          disabled={socialLoading !== null}
        />
        <SocialButton
          provider="facebook"
          onPress={() => onSocial("facebook")}
          loading={socialLoading === "facebook"}
          disabled={socialLoading !== null}
        />
      </View>

      <Text className="mt-4 text-center text-xs leading-5 text-ink-400">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </Text>
    </Screen>
  );
}
