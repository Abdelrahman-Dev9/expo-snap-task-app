import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export type PickImageOptions = {
  /** Square crop for avatars. */
  aspect?: [number, number];
  allowsEditing?: boolean;
  /** Allow selecting multiple from the library (camera always returns one). */
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
};

export type PickedImage = {
  uri: string;
};

/**
 * Shows Camera / Gallery choices, then returns selected image URIs
 * (or null if cancelled / permission denied).
 */
export function pickImageWithSource(
  options: PickImageOptions = {},
): Promise<PickedImage[] | null> {
  const {
    aspect,
    allowsEditing = true,
    allowsMultipleSelection = false,
    selectionLimit = 1,
  } = options;

  return new Promise((resolve) => {
    Alert.alert("Add photo", "Choose a source", [
      {
        text: "Take photo",
        onPress: () => {
          void (async () => {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(
                "Permission needed",
                "Camera access is required to take a photo.",
              );
              resolve(null);
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.8,
              allowsEditing,
              aspect,
            });

            if (result.canceled || !result.assets[0]) {
              resolve(null);
              return;
            }

            resolve([{ uri: result.assets[0].uri }]);
          })();
        },
      },
      {
        text: "Choose from gallery",
        onPress: () => {
          void (async () => {
            const permission =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(
                "Permission needed",
                "Photo library access is required to choose a photo.",
              );
              resolve(null);
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.8,
              allowsEditing: allowsMultipleSelection ? false : allowsEditing,
              aspect: allowsMultipleSelection ? undefined : aspect,
              allowsMultipleSelection,
              selectionLimit: allowsMultipleSelection
                ? selectionLimit
                : undefined,
            });

            if (result.canceled || !result.assets.length) {
              resolve(null);
              return;
            }

            resolve(result.assets.map((asset) => ({ uri: asset.uri })));
          })();
        },
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => resolve(null),
      },
    ]);
  });
}
