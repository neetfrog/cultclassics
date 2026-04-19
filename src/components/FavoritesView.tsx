import { data, categories, type Category, type Item } from "../data";
import Card from "./Card";
import type { FavoriteCollection } from "../hooks/useCollections";

interface FavoritesViewProps {
  favorites: Set<string>;
  collections: FavoriteCollection[];
  onToggleFavorite: (id: string) => void;
  onOpenDetails?: (item: Item, category: Category) => void;
}

export default function FavoritesView({ favorites, collections, onToggleFavorite, onOpenDetails }: FavoritesViewProps) {
  const favoriteItems = categories.flatMap((cat) =>
    data[cat.id]
      .filter((item) => favorites.has(item.id))
      .map((item) => ({ item, cat }))
  );

  if (favoriteItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <div className="text-6xl mb-4">🤍</div>
        <h3 className="text-lg font-bold text-white mb-2">No favorites yet</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Tap the heart icon on any card to save your must-sees here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-2">
        <span className="text-2xl">❤️</span>
        <div>
          <h2 className="text-lg font-bold text-white">Your Favorites</h2>
          <p className="text-xs text-gray-400">{favoriteItems.length} saved classic{favoriteItems.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {collections.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3 mt-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="rounded-2xl border border-gray-700/60 bg-gray-800/80 p-3"
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {collection.name}
              </p>
              <p className="text-2xl font-bold text-white">{collection.itemIds.length}</p>
              <p className="text-xs text-gray-500">items</p>
            </div>
          ))}
        </div>
      )}

      {categories.map((cat) => {
        const catFavs = favoriteItems.filter((fi) => fi.cat.id === cat.id);
        if (catFavs.length === 0) return null;
        return (
          <div key={cat.id}>
            <div className="flex items-center gap-2 mb-2">
              <span>{cat.icon}</span>
              <h3 className="text-sm font-semibold text-gray-300">{cat.label}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                style={{ background: cat.hex + "55" }}
              >
                {catFavs.length}
              </span>
            </div>
            <div className="space-y-2">
              {catFavs.map(({ item }) => (
                <Card
                  key={item.id}
                  item={item}
                  category={cat.id}
                  accentHex={cat.hex}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onOpenDetails={onOpenDetails}
                  viewMode="list"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
