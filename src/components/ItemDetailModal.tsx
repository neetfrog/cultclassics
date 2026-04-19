import { useEffect, useMemo, useState } from "react";
import type { Category, Item } from "../data";
import type { IconType } from "react-icons";
import { FaRedditAlien } from "react-icons/fa";
import { SiGoodreads, SiImdb, SiRottentomatoes, SiSpotify, SiWikipedia } from "react-icons/si";
import { getArtworkPath, getArtworkExtensions } from "../utils/image";
import { getExternalLinks } from "../utils/links";
import { subredditMap } from "../subreddits";
import type { FavoriteCollection } from "../hooks/useCollections";

interface ItemDetailModalProps {
  item: Item;
  category: Category;
  accentHex: string;
  isFavorite: boolean;
  note: string;
  collections: FavoriteCollection[];
  onToggleFavorite: (id: string) => void;
  onNoteChange: (itemId: string, note: string) => void;
  onToggleCollection: (itemId: string, collectionId: string, next: boolean) => void;
  onCreateCollection: (name: string) => void;
  onClose: () => void;
}

const iconMap: Record<string, IconType> = {
  imdb: SiImdb,
  rotten: SiRottentomatoes,
  wikipedia: SiWikipedia,
  goodreads: SiGoodreads,
  spotify: SiSpotify,
};

export default function ItemDetailModal({
  item,
  category,
  accentHex,
  isFavorite,
  note,
  collections,
  onToggleFavorite,
  onNoteChange,
  onToggleCollection,
  onCreateCollection,
  onClose,
}: ItemDetailModalProps) {
  const [imageError, setImageError] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [shareUrl, setShareUrl] = useState("#");
  const artworkExtensions = getArtworkExtensions();
  const imageSrc = getArtworkPath(item, artworkExtensions[imageAttempt]);
  const externalLinks = getExternalLinks(category, item.title);
  const subreddit = subredditMap[item.id];
  const subredditUrl = subreddit ? `https://www.reddit.com/r/${subreddit}` : undefined;

  useEffect(() => {
    setImageError(false);
    setImageAttempt(0);
  }, [item.id]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/category/${category}/item/${item.id}`);
    }
  }, [category, item.id]);

  const visibleCollections = useMemo(() => {
    return collections.filter((collection) => {
      if (collection.id === "re-read" && category !== "books") {
        return false;
      }
      if (collection.id === "replay" && category !== "games") {
        return false;
      }
      return true;
    });
  }, [collections, category]);

  const selectedCollections = useMemo(
    () => visibleCollections.filter((collection) => collection.itemIds.includes(item.id)),
    [visibleCollections, item.id]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[calc(100vh-4rem)] bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        style={{ boxShadow: `0 0 60px ${accentHex}33` }}
      >
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(to right, ${accentHex}, ${accentHex}88)` }}
        />
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-5rem)] overscroll-y-contain">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-3xl overflow-hidden bg-gray-950 flex items-center justify-center"
                style={{ background: accentHex + "22" }}
              >
                {!imageError ? (
                  <img
                    src={imageSrc}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={() => {
                      if (imageAttempt < artworkExtensions.length - 1) {
                        setImageAttempt((attempt) => attempt + 1);
                      } else {
                        setImageError(true);
                      }
                    }}
                  />
                ) : (
                  <span className="text-4xl">{item.emoji}</span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: accentHex + "22", color: accentHex }}
                  >
                    {category} • {item.year}
                  </span>
                  <span className="text-xs text-gray-500">{item.genre}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white leading-tight">{item.title}</h2>
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <span
                      key={score}
                      className={`text-sm ${score <= item.rating ? "text-yellow-400" : "text-gray-700"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
              >
                {isFavorite ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-gray-700 bg-gray-950 px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 transition"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-700 bg-gray-950 p-4">
                <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
              </div>
              <div className="rounded-3xl border border-gray-700 bg-gray-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: accentHex }}>
                  Why it became a cult classic
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">{item.whyCult}</p>
              </div>
              <div className="rounded-3xl border border-gray-700 bg-gray-950 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentHex }}>
                    Personal notes
                  </span>
                  <span className="text-xs text-gray-500">Saved locally</span>
                </div>
                <textarea
                  value={note}
                  onChange={(event) => onNoteChange(item.id, event.target.value)}
                  placeholder={`My note about ${item.title}...`}
                  className="w-full min-h-[140px] max-h-[260px] rounded-3xl border border-gray-700 bg-gray-950 p-4 text-sm text-white outline-none focus:border-gray-500 overflow-y-auto resize-y overscroll-y-contain"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-700 bg-gray-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: accentHex }}>
                  Quick links
                </p>
                <div className="flex flex-wrap gap-2">
                  {externalLinks.map((link) => {
                    const Icon = iconMap[link.icon];
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-sky-200 hover:bg-gray-900 transition"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {link.label}
                      </a>
                    );
                  })}
                  {subredditUrl && (
                    <a
                      href={subredditUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-sky-200 hover:bg-gray-900 transition"
                    >
                      <FaRedditAlien className="h-4 w-4" aria-hidden="true" />
                      Reddit
                    </a>
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-gray-700 bg-gray-950 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentHex }}>
                    Collections
                  </span>
                  <span className="text-xs text-gray-500">{selectedCollections.length} assigned</span>
                </div>
                <div className="space-y-2">
                  {visibleCollections.map((collection) => {
                    const selected = collection.itemIds.includes(item.id);
                    return (
                      <button
                        key={collection.id}
                        type="button"
                        onClick={() => onToggleCollection(item.id, collection.id, !selected)}
                        className="w-full rounded-3xl border border-gray-700 bg-gray-950 px-3 py-3 text-left text-sm text-gray-200 transition hover:border-gray-500 hover:bg-gray-900"
                        style={
                          selected
                            ? { borderColor: accentHex, backgroundColor: accentHex + "22" }
                            : {}
                        }
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{collection.name}</span>
                          <span className="text-xs text-gray-400">{collection.itemIds.length}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    New collection
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={newCollectionName}
                      onChange={(event) => setNewCollectionName(event.target.value)}
                      className="flex-1 rounded-3xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none focus:border-gray-500"
                      placeholder="e.g. Watch later"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = newCollectionName.trim();
                        if (name) {
                          onCreateCollection(name);
                          setNewCollectionName("");
                        }
                      }}
                      className="rounded-3xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-400 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-700 bg-gray-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentHex }}>
                  Share this pick
                </p>
                <div className="mt-3 rounded-3xl border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-gray-200 break-all">
                  {shareUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
