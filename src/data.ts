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

import { movies } from "./data/movies";
import { tv } from "./data/tv";
import { books } from "./data/books";
import { games } from "./data/games";
import { music } from "./data/music";

export const categories: {
  id: Category;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  hex: string;
  gradient: string;
}[] = [
  {
    id: "movies",
    label: "Movies",
    icon: "🎬",
    color: "text-red-400",
    bg: "bg-red-500",
    border: "border-red-500",
    hex: "#ef4444",
    gradient: "from-red-600/20 to-red-900/5",
  },
  {
    id: "tv",
    label: "TV Shows",
    icon: "📺",
    color: "text-purple-400",
    bg: "bg-purple-500",
    border: "border-purple-500",
    hex: "#a855f7",
    gradient: "from-purple-600/20 to-purple-900/5",
  },
  {
    id: "books",
    label: "Books",
    icon: "📚",
    color: "text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500",
    hex: "#f59e0b",
    gradient: "from-amber-600/20 to-amber-900/5",
  },
  {
    id: "games",
    label: "Games",
    icon: "🎮",
    color: "text-green-400",
    bg: "bg-green-500",
    border: "border-green-500",
    hex: "#22c55e",
    gradient: "from-green-600/20 to-green-900/5",
  },
  {
    id: "music",
    label: "Music",
    icon: "🎵",
    color: "text-blue-400",
    bg: "bg-blue-500",
    border: "border-blue-500",
    hex: "#3b82f6",
    gradient: "from-blue-600/20 to-blue-900/5",
  },
];

export const data: Record<Category, Item[]> = {
  movies,
  tv,
  books,
  games,
  music,
};
