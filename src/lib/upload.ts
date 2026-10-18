import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

/**
 * Convert picker URI → local JPEG (resized) so iOS FormData uploads reliably
 * and payloads stay small enough for Vercel.
 */
export async function prepareImageForUpload(
  uri: string,
  filename: string,
): Promise<UploadFile> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    {
      compress: 0.7,
      format: SaveFormat.JPEG,
    },
  );

  const uploadUri =
    Platform.OS === "ios" && !result.uri.startsWith("file://")
      ? `file://${result.uri}`
      : result.uri;

  return {
    uri: uploadUri,
    name: filename.endsWith(".jpg") ? filename : `${filename}.jpg`,
    type: "image/jpeg",
  };
}

export function appendUploadFile(
  formData: FormData,
  fieldName: string,
  file: UploadFile,
) {
  formData.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
}
