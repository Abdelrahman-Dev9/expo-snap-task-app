import { apiRequest } from "@/lib/api";
import { appendUploadFile, prepareImageForUpload } from "@/lib/upload";
import type { GeoLocation } from "@/features/location/types";
import type { RemindBeforeMinutes, Task } from "./types";

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
    imageUris?: string[];
    location?: GeoLocation | null;
    dueAt?: Date | null;
    remindBeforeMinutes?: RemindBeforeMinutes;
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
  if (input.dueAt) {
    formData.append("dueAt", input.dueAt.toISOString());
    if (input.remindBeforeMinutes != null) {
      formData.append(
        "remindBeforeMinutes",
        String(input.remindBeforeMinutes),
      );
    }
  }
  if (input.imageUris?.length) {
    for (let i = 0; i < input.imageUris.length; i += 1) {
      const file = await prepareImageForUpload(
        input.imageUris[i],
        `task-${i}.jpg`,
      );
      appendUploadFile(formData, "images", file);
    }
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
    imageUris?: string[];
    removeImageIds?: string[];
    location?: GeoLocation | null;
    clearLocation?: boolean;
    dueAt?: Date | null;
    remindBeforeMinutes?: RemindBeforeMinutes;
    clearDueAt?: boolean;
    clearRemindBefore?: boolean;
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
  if (input.clearDueAt) {
    formData.append("clearDueAt", "true");
  } else if (input.dueAt) {
    formData.append("dueAt", input.dueAt.toISOString());
  }
  if (input.clearRemindBefore) {
    formData.append("clearRemindBefore", "true");
  } else if (
    input.remindBeforeMinutes !== undefined &&
    input.remindBeforeMinutes !== null &&
    !input.clearDueAt
  ) {
    formData.append(
      "remindBeforeMinutes",
      String(input.remindBeforeMinutes),
    );
  }
  if (input.removeImageIds?.length) {
    formData.append("removeImageIds", JSON.stringify(input.removeImageIds));
  }
  if (input.imageUris?.length) {
    for (let i = 0; i < input.imageUris.length; i += 1) {
      const file = await prepareImageForUpload(
        input.imageUris[i],
        `task-${i}.jpg`,
      );
      appendUploadFile(formData, "images", file);
    }
  }

  return apiRequest<Task>(`/tasks/${id}`, {
    method: "PATCH",
    token,
    formData,
  });
}

export function deleteTaskImageRequest(
  token: string,
  taskId: string,
  imageId: string,
) {
  return apiRequest<Task>(`/tasks/${taskId}/images/${imageId}`, {
    method: "DELETE",
    token,
  });
}

export function deleteTaskRequest(token: string, id: string) {
  return apiRequest<{ message: string }>(`/tasks/${id}`, {
    method: "DELETE",
    token,
  });
}
