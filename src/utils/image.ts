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

export function getArtworkPath(item: Item) {
  const slug = slugifyTitle(item.title);
  return `/images/${slug}-${item.id}.jpg`;
}
