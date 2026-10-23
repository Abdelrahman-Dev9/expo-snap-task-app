export type TaskImage = {
  id: string;
  url: string;
  sortOrder: number;
  createdAt: string;
  taskId: string;
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  images: TaskImage[];
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  dueAt: string | null;
  remindBeforeMinutes: number | null;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export const MAX_TASK_IMAGES = 5;

export const REMIND_BEFORE_OPTIONS = [
  { value: null, label: "No advance reminder" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
] as const;

export type RemindBeforeMinutes = 15 | 30 | 60 | 1440 | null;

export function taskCoverUrl(task: Task): string | null {
  return task.images[0]?.url ?? null;
}

export function isTaskOverdue(task: Task, now = new Date()): boolean {
  if (task.done || !task.dueAt) return false;
  return new Date(task.dueAt).getTime() < now.getTime();
}

export function formatTaskDueAt(dueAt: string): string {
  const date = new Date(dueAt);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
