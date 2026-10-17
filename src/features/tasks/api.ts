import { apiRequest } from "@/lib/api";
import type { Task } from "./types";

export function listTasksRequest(token: string) {
  return apiRequest<Task[]>("/tasks", { method: "GET", token });
}

export function getTaskRequest(token: string, id: string) {
  return apiRequest<Task>(`/tasks/${id}`, { method: "GET", token });
}

export function createTaskRequest(
  token: string,
  input: { title: string; notes?: string; imageUri?: string | null },
) {
  const formData = new FormData();
  formData.append("title", input.title);
  if (input.notes) {
    formData.append("notes", input.notes);
  }
  if (input.imageUri) {
    formData.append("image", {
      uri: input.imageUri,
      name: "task.jpg",
      type: "image/jpeg",
    } as unknown as Blob);
  }

  return apiRequest<Task>("/tasks", {
    method: "POST",
    token,
    formData,
  });
}

export function updateTaskRequest(
  token: string,
  id: string,
  input: {
    title?: string;
    notes?: string;
    done?: boolean;
    imageUri?: string | null;
  },
) {
  const formData = new FormData();
  if (input.title !== undefined) formData.append("title", input.title);
  if (input.notes !== undefined) formData.append("notes", input.notes);
  if (input.done !== undefined) formData.append("done", String(input.done));
  if (input.imageUri) {
    formData.append("image", {
      uri: input.imageUri,
      name: "task.jpg",
      type: "image/jpeg",
    } as unknown as Blob);
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
