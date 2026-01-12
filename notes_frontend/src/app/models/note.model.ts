export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
