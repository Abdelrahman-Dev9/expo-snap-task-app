import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "@/components/ui/theme";
import {
  searchPlaces,
  type PlaceSearchResult,
} from "@/features/location/geocode";

type Props = {
  onSelect: (place: PlaceSearchResult) => void;
  placeholder?: string;
};

export function PlaceSearch({
  onSelect,
  placeholder = "Search city or country…",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const places = await searchPlaces(trimmed);
          if (cancelled) return;
          setResults(places);
          setError(places.length === 0 ? "No places found" : null);
        } catch {
          if (!cancelled) {
            setResults([]);
            setError("Search failed");
          }
        } finally {
          if (!cancelled) setSearching(false);
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <View className="z-20">
      <View className="h-12 flex-row items-center rounded-2xl border border-ink-200 bg-surface px-3">
        <Ionicons name="search" size={18} color={theme.colors.ink400} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.ink400}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          className="ml-2 flex-1 text-base text-ink-900"
        />
        {searching ? (
          <ActivityIndicator size="small" color={theme.colors.brand600} />
        ) : query.length > 0 ? (
          <Pressable
            onPress={() => {
              setQuery("");
              setResults([]);
              setError(null);
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.ink400} />
          </Pressable>
        ) : null}
      </View>

      {(results.length > 0 || error) && query.trim().length >= 2 ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-ink-200 bg-surface">
          {error && results.length === 0 ? (
            <Text className="px-4 py-3 text-sm text-ink-500">{error}</Text>
          ) : (
            results.map((place, index) => (
              <Pressable
                key={place.id}
                onPress={() => {
                  onSelect(place);
                  setQuery(place.label);
                  setResults([]);
                  setError(null);
                }}
                className={`flex-row items-center gap-3 px-4 py-3 active:bg-ink-100 ${
                  index > 0 ? "border-t border-ink-100" : ""
                }`}
              >
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
                  <Ionicons
                    name={
                      place.kind === "country"
                        ? "flag-outline"
                        : place.kind === "city"
                          ? "business-outline"
                          : "location-outline"
                    }
                    size={18}
                    color={theme.colors.brand600}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink-900" numberOfLines={1}>
                    {place.label}
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-500" numberOfLines={1}>
                    {place.address}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}
