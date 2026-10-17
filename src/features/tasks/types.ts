export type Task = {
  id: string;
  title: string;
  notes: string | null;
  imageUrl: string | null;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};
