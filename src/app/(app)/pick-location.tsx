import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { theme } from "@/components/ui/theme";
import { formatCoords, reverseGeocode } from "@/features/location/geocode";
import { PlaceSearch } from "@/features/location/PlaceSearch";
import { setPendingLocationPick } from "@/features/location/pending-pick";
import type { GeoLocation } from "@/features/location/types";
import { useAppSelector } from "@/store";

const FALLBACK_REGION: Region = {
  latitude: 30.0444,
  longitude: 31.2357,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function PickLocationScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    address?: string;
  }>();
  const mapRef = useRef<MapView>(null);

  const initial = useMemo<GeoLocation | null>(() => {
    const lat = params.latitude ? Number(params.latitude) : NaN;
    const lng = params.longitude ? Number(params.longitude) : NaN;
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return {
        latitude: lat,
        longitude: lng,
        address: params.address ?? null,
      };
    }
    if (user?.latitude != null && user?.longitude != null) {
      return {
        latitude: user.latitude,
        longitude: user.longitude,
        address: user.address,
      };
    }
    return null;
  }, [params, user]);

  const [pin, setPin] = useState<GeoLocation | null>(initial);
  const [region, setRegion] = useState<Region>(
    initial
      ? {
          latitude: initial.latitude,
          longitude: initial.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : FALLBACK_REGION,
  );
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const moveTo = useCallback((location: GeoLocation, delta = 0.08) => {
    const nextRegion: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
    setPin(location);
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 400);
  }, []);

  const useMyLocation = async () => {
    setLocating(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError("Location permission is required");
        return;
      }
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const latitude = current.coords.latitude;
      const longitude = current.coords.longitude;
      const address = await reverseGeocode(latitude, longitude);
      moveTo({ latitude, longitude, address }, 0.02);
    } catch {
      setError("Could not get your current location");
    } finally {
      setLocating(false);
    }
  };

  const onMapPress = async (latitude: number, longitude: number) => {
    setError(null);
    const address = await reverseGeocode(latitude, longitude);
    setPin({ latitude, longitude, address });
  };

  const onConfirm = () => {
    if (!pin) return;
    setPendingLocationPick(pin);
    router.back();
  };

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-ink-100"
          >
            <Ionicons name="close" size={22} color="#0f172a" />
          </Pressable>
          <Text className="text-base font-bold text-ink-900">
            Pick task location
          </Text>
          <View className="h-10 w-10" />
        </View>

        <View className="relative flex-1">
          <View className="absolute inset-x-0 top-0 z-30 px-4 pt-2">
            <PlaceSearch
              onSelect={(place) => {
                setError(null);
                moveTo(place, place.kind === "country" ? 12 : 0.12);
              }}
            />
          </View>

          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={(event) => {
              const { latitude, longitude } = event.nativeEvent.coordinate;
              void onMapPress(latitude, longitude);
            }}
          >
            {pin ? (
              <Marker
                coordinate={{
                  latitude: pin.latitude,
                  longitude: pin.longitude,
                }}
                draggable
                onDragEnd={(event) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  void onMapPress(latitude, longitude);
                }}
              />
            ) : null}
          </MapView>
        </View>

        <View className="border-t border-ink-200 bg-canvas px-6 pb-6 pt-4">
          <ErrorBanner message={error} />
          <View className="mb-3 rounded-2xl border border-ink-200 bg-surface px-4 py-3">
            {pin ? (
              <>
                <Text className="text-sm font-semibold text-ink-900">
                  {pin.address ?? "Dropped pin"}
                </Text>
                <Text className="mt-0.5 text-xs text-ink-500">
                  {formatCoords(pin)}
                </Text>
              </>
            ) : (
              <Text className="text-sm text-ink-500">
                Search or tap the map to choose a place
              </Text>
            )}
          </View>

          <View className="mb-3 flex-row gap-3">
            <Pressable
              onPress={() => void useMyLocation()}
              disabled={locating}
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-surface"
            >
              {locating ? (
                <ActivityIndicator color={theme.colors.brand600} />
              ) : (
                <>
                  <Ionicons name="navigate" size={18} color="#4f46e5" />
                  <Text className="font-semibold text-ink-900">My GPS</Text>
                </>
              )}
            </Pressable>
            <View className="flex-1">
              <Button
                label="Use this place"
                icon="checkmark"
                onPress={onConfirm}
                disabled={!pin}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
