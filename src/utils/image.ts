import type { Item } from "../data";

const artworkExtensions = [".jpg", ".png"] as const;

type ArtworkExtension = (typeof artworkExtensions)[number];

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

export function getArtworkPath(item: Item, ext: ArtworkExtension = ".jpg") {
  const slug = slugifyTitle(item.title);
  const category = getCategoryFromId(item.id);
  return `/images/${category}/${slug}-${item.id}${ext}`;
}

export function getArtworkExtensions() {
  return artworkExtensions;
}
