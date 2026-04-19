export type Category = "movies" | "tv" | "books" | "games" | "music";

export interface Item {
  id: string;
  title: string;
  year: number;
  genre: string;
  tags: string[];
  description: string;
  whyCult: string;
  rating: number; // out of 5
  emoji: string;
  image?: string;
}

export interface CategoryDefinition {
  id: Category;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  hex: string;
  gradient: string;
}

export interface CultDataPayload {
  categories: CategoryDefinition[];
  data: Record<Category, Item[]>;
}

export async function fetchCultData(): Promise<CultDataPayload> {
  const response = await fetch("/data.json");
  if (!response.ok) {
    throw new Error("Failed to load data.json");
  }
  return response.json();
}
