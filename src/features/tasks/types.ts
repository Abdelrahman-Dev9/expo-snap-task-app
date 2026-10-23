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
  done: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export const MAX_TASK_IMAGES = 5;

export function taskCoverUrl(task: Task): string | null {
  return task.images[0]?.url ?? null;
}
