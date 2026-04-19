import type { Item } from "../data";

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[—–]/g, " ")
    .replace(/\s*—.*$/, "")
    .replace(/["'’“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function getCategoryFromId(id: string) {
  if (id.startsWith("mu")) return "music";
  if (id.startsWith("m")) return "movies";
  if (id.startsWith("t")) return "tv";
  if (id.startsWith("b")) return "books";
  if (id.startsWith("g")) return "games";
  return "movies";
}

export function getArtworkPath(item: Item) {
  const slug = slugifyTitle(item.title);
  const category = getCategoryFromId(item.id);
  return `/images/${category}/${slug}-${item.id}.jpg`;
}
