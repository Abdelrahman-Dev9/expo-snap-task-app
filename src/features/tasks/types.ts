export type Task = {
  id: string;
  title: string;
  notes: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};
