import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBanner, InfoBanner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { theme } from "@/components/ui/theme";
import {
  clearUserLocationRequest,
  updateUserLocationRequest,
} from "@/features/location/api";
import { formatCoords, reverseGeocode } from "@/features/location/geocode";
import { PlaceSearch } from "@/features/location/PlaceSearch";
import type { GeoLocation } from "@/features/location/types";
import { getMeRequest } from "@/features/profile/api";
import { ApiError } from "@/lib/api";
import { setUser } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store";

const FALLBACK_REGION: Region = {
  latitude: 30.0444,
  longitude: 31.2357,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const mapRef = useRef<MapView>(null);

  const savedLocation = useMemo<GeoLocation | null>(() => {
    if (user?.latitude == null || user?.longitude == null) return null;
    return {
      latitude: user.latitude,
      longitude: user.longitude,
      address: user.address,
    };
  }, [user]);

  const [pin, setPin] = useState<GeoLocation | null>(savedLocation);
  const [region, setRegion] = useState<Region>(
    savedLocation
      ? {
          latitude: savedLocation.latitude,
          longitude: savedLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : FALLBACK_REGION,
  );
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!savedLocation) return;
    setPin(savedLocation);
    setRegion({
      latitude: savedLocation.latitude,
      longitude: savedLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }, [savedLocation]);

  const refreshSavedLocation = useCallback(
    async (notify = false) => {
      if (!token) return;
      setRefreshing(true);
      setError(null);
      try {
        const me = await getMeRequest(token);
        dispatch(setUser(me));
        if (notify) setInfo("Location refreshed");
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to refresh location",
        );
      } finally {
        setRefreshing(false);
      }
    },
    [token, dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      void refreshSavedLocation(false);
    }, [refreshSavedLocation]),
  );

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
    setInfo(null);
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
      setInfo("Moved pin to your current location");
    } catch {
      setError("Could not get your current location");
    } finally {
      setLocating(false);
    }
  };

  const onMapPress = async (latitude: number, longitude: number) => {
    setError(null);
    setInfo(null);
    const address = await reverseGeocode(latitude, longitude);
    setPin({ latitude, longitude, address });
  };

  const onSave = async () => {
    if (!token || !pin) return;
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const updated = await updateUserLocationRequest(token, pin);
      dispatch(setUser(updated));
      setInfo("Default location saved");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to save location",
      );
    } finally {
      setSaving(false);
    }
  };

  const onClear = async () => {
    if (!token) return;
    setClearing(true);
    setError(null);
    setInfo(null);
    try {
      const updated = await clearUserLocationRequest(token);
      dispatch(setUser(updated));
      setPin(null);
      setInfo("Default location cleared");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to clear location",
      );
    } finally {
      setClearing(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas">
      <LinearGradient
        colors={[...theme.gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-x-0 top-0 h-[160px]"
      />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 pb-3 pt-2">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-semibold uppercase tracking-[3px] text-ink-900">
                Map
              </Text>
              <Text className="mt-2 text-2xl font-bold text-ink-900">
                Default location
              </Text>
              <Text className="mt-1 text-sm text-ink-500">
                Search a city or country, tap the map, or use GPS — then save.
              </Text>
            </View>
            <Pressable
              onPress={() => void refreshSavedLocation(true)}
              disabled={refreshing}
              className="mt-1 h-10 w-10 items-center justify-center rounded-2xl bg-ink-900/10"
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={theme.colors.ink900} />
              ) : (
                <Ionicons name="refresh" size={20} color="#0f172a" />
              )}
            </Pressable>
          </View>
        </View>

        <View className="flex-1 overflow-hidden rounded-t-3xl bg-canvas">
          <View className="absolute inset-x-0 top-0 z-30 px-4 pt-4">
            <PlaceSearch
              onSelect={(place) => {
                setError(null);
                setInfo(`Found ${place.label}`);
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

          <View className="absolute inset-x-0 bottom-0 bg-canvas/95 px-6 pb-6 pt-4">
            <ErrorBanner message={error} />
            <InfoBanner message={info} />

            <View className="mb-3 rounded-2xl border border-ink-200 bg-surface px-4 py-3">
              <Text className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Selected
              </Text>
              {pin ? (
                <>
                  <Text className="mt-1 text-sm font-semibold text-ink-900">
                    {pin.address ?? "Dropped pin"}
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-500">
                    {formatCoords(pin)}
                  </Text>
                </>
              ) : (
                <Text className="mt-1 text-sm text-ink-500">
                  No location selected yet
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
                  label="Save"
                  icon="checkmark"
                  onPress={() => void onSave()}
                  loading={saving}
                  disabled={!pin}
                />
              </View>
            </View>

            {savedLocation ? (
              <Button
                label="Clear saved location"
                variant="ghost"
                onPress={() => void onClear()}
                loading={clearing}
              />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
