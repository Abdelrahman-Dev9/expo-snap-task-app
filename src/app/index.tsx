import { Redirect } from "expo-router";
import { useAppSelector } from "@/store";

export default function Index() {
  const token = useAppSelector((state) => state.auth.token);

  if (token) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
