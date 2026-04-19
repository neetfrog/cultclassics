import { useStoredState } from "./useStoredState";

export interface FavoriteCollection {
  id: string;
  name: string;
  itemIds: string[];
}

const STORAGE_KEY = "cult-classics-collections";
const DEFAULT_COLLECTIONS: FavoriteCollection[] = [
  { id: "watch-later", name: "Watch later", itemIds: [] },
  { id: "re-read", name: "Re-read", itemIds: [] },
  { id: "replay", name: "Replay", itemIds: [] },
];

export function useCollections() {
  const [collections, setCollections] = useStoredState<FavoriteCollection[]>(
    STORAGE_KEY,
    DEFAULT_COLLECTIONS
  );

  const toggleCollection = (
    itemId: string,
    collectionId: string,
    next: boolean
  ) => {
    setCollections((current) =>
      current.map((collection) => {
        if (collection.id !== collectionId) return collection;
        const itemIds = new Set(collection.itemIds);
        if (next) itemIds.add(itemId);
        else itemIds.delete(itemId);
        return { ...collection, itemIds: [...itemIds] };
      })
    );
  };

  const createCollection = (name: string) => {
    setCollections((current) => [
      ...current,
      { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), name, itemIds: [] },
    ]);
  };

  return { collections, toggleCollection, createCollection };
}
