export interface ReferenceEntry {
  id: number;
  title: string;
  type: string;
  description: string;
  location: string;
  eventDate: string;
  image: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
}

export type ReferenceInput = Omit<ReferenceEntry, "id" | "createdAt">;
