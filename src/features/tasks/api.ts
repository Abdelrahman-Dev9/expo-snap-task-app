import { apiRequest } from "@/lib/api";
import { appendUploadFile, prepareImageForUpload } from "@/lib/upload";
import type { GeoLocation } from "@/features/location/types";
import type { Task } from "./types";

export function listTasksRequest(token: string) {
  return apiRequest<Task[]>("/tasks", { method: "GET", token });
}

export function getTaskRequest(token: string, id: string) {
  return apiRequest<Task>(`/tasks/${id}`, { method: "GET", token });
}

export async function createTaskRequest(
  token: string,
  input: {
    title: string;
    notes?: string;
    imageUri?: string | null;
    location?: GeoLocation | null;
  },
) {
  const formData = new FormData();
  formData.append("title", input.title);
  if (input.notes) {
    formData.append("notes", input.notes);
  }
  if (input.location) {
    formData.append("latitude", String(input.location.latitude));
    formData.append("longitude", String(input.location.longitude));
    if (input.location.address) {
      formData.append("address", input.location.address);
    }
  }
  if (input.imageUri) {
    const file = await prepareImageForUpload(input.imageUri, "task.jpg");
    appendUploadFile(formData, "image", file);
  }

  return apiRequest<Task>("/tasks", {
    method: "POST",
    token,
    formData,
  });
}

export async function updateTaskRequest(
  token: string,
  id: string,
  input: {
    title?: string;
    notes?: string;
    done?: boolean;
    imageUri?: string | null;
    location?: GeoLocation | null;
    clearLocation?: boolean;
  },
) {
  const formData = new FormData();
  if (input.title !== undefined) formData.append("title", input.title);
  if (input.notes !== undefined) formData.append("notes", input.notes);
  if (input.done !== undefined) formData.append("done", String(input.done));
  if (input.clearLocation) {
    formData.append("clearLocation", "true");
  } else if (input.location) {
    formData.append("latitude", String(input.location.latitude));
    formData.append("longitude", String(input.location.longitude));
    if (input.location.address) {
      formData.append("address", input.location.address);
    }
  }
  if (input.imageUri) {
    const file = await prepareImageForUpload(input.imageUri, "task.jpg");
    appendUploadFile(formData, "image", file);
  }

  return apiRequest<Task>(`/tasks/${id}`, {
    method: "PATCH",
    token,
    formData,
  });
}

export function deleteTaskRequest(token: string, id: string) {
  return apiRequest<{ message: string }>(`/tasks/${id}`, {
    method: "DELETE",
    token,
  });
}
