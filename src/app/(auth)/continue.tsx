import { useAuth, useSignUp } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";

export default function ContinueSignUpScreen() {
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await signUp.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      if (updated.error) {
        setError(updated.error.message ?? "Could not finish sign-up");
        return;
      }
      if (signUp.status === "complete") {
        const finalized = await signUp.finalize();
        if (finalized.error) {
          setError(finalized.error.message ?? "Could not activate session");
          return;
        }
        router.replace("/(app)/(tabs)");
        return;
      }
      setError("Additional steps are required to finish sign-up.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish sign-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      title="Almost done"
      subtitle="Add your name to finish creating your Snap Task account."
    >
      <ErrorBanner message={error} />
      <View className="mb-3">
        <Text className="mb-2 text-sm font-semibold text-ink-700">First name</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          placeholder="First name"
          placeholderTextColor={theme.colors.ink400}
          className="h-14 rounded-2xl border border-ink-200 bg-surface px-4 text-base text-ink-900"
        />
      </View>
      <View className="mb-5">
        <Text className="mb-2 text-sm font-semibold text-ink-700">Last name</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          placeholder="Last name"
          placeholderTextColor={theme.colors.ink400}
          className="h-14 rounded-2xl border border-ink-200 bg-surface px-4 text-base text-ink-900"
        />
      </View>
      <Button
        label="Continue"
        icon="checkmark"
        onPress={() => void onContinue()}
        loading={loading}
        disabled={!firstName.trim() || !lastName.trim()}
      />
    </Screen>
  );
}
