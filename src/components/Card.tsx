import { useState, useEffect } from "react";
import type { Category, Item } from "../data";
import type { IconType } from "react-icons";
import { FaRedditAlien } from "react-icons/fa";
import { SiGoodreads, SiImdb, SiRottentomatoes, SiSpotify, SiWikipedia } from "react-icons/si";
import { getArtworkPath, getArtworkExtensions } from "../utils/image";
import { getExternalLinks } from "../utils/links";
import { subredditMap } from "../subreddits";

interface CardProps {
  item: Item;
  category: Category;
  accentHex: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  viewMode: "list" | "grid";
  onTagClick?: (tag: string) => void;
}

export default function Card({
  item,
  category,
  accentHex,
  isFavorite,
  onToggleFavorite,
  viewMode,
  onTagClick,
}: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const artworkExtensions = getArtworkExtensions();
  const imageSrc = getArtworkPath(item, artworkExtensions[imageAttempt]);
  const subreddit = subredditMap[item.id];
  const subredditUrl = subreddit ? `https://www.reddit.com/r/${subreddit}` : undefined;
  const externalLinks = getExternalLinks(category, item.title);

  const iconMap: Record<string, IconType> = {
    imdb: SiImdb,
    rotten: SiRottentomatoes,
    wikipedia: SiWikipedia,
    goodreads: SiGoodreads,
    spotify: SiSpotify,
  };

  const openImageModal = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    if (!imageError) {
      setImageModalOpen(true);
    }
  };

  useEffect(() => {
    setImageError(false);
    setImageAttempt(0);
  }, [item.id]);

  if (viewMode === "grid") {
    return (
      <div
        className={`bg-gray-800/80 rounded-2xl border border-gray-700/60 flex flex-col self-start overflow-hidden transition-all duration-200 hover:border-gray-600 hover:shadow-lg ${
          expanded ? "shadow-xl" : ""
        }`}
        style={expanded ? { boxShadow: `0 0 0 1px ${accentHex}33` } : {}}
      >
        {/* Grid card top */}
        <div
          role="button"
          tabIndex={0}
          className="flex-1 p-4 text-left focus:outline-none cursor-pointer"
          onClick={() => setExpanded((p) => !p)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setExpanded((p) => !p);
            }
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ background: `${accentHex}22` }}
            >
              {!imageError ? (
                <>
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
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="View artwork larger"
                    onClick={openImageModal}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        openImageModal(event);
                      }
                    }}
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors cursor-zoom-in"
                  />
                </>
              ) : (
                <span className="text-2xl">{item.emoji}</span>
              )}
            </div>
            <button
              className={`p-1.5 rounded-full transition-all ${
                isFavorite
                  ? "text-red-400 scale-110"
                  : "text-gray-600 hover:text-gray-400"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>
          <h3
            className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2"
            title={item.title}
          >
            {item.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{item.year} · {item.genre}</p>
        </div>

        {/* Tags */}
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className={`text-xs px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-400 ${onTagClick ? "cursor-pointer hover:bg-gray-600/70 hover:text-white" : ""}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="px-4 pb-3 text-gray-400 text-xs leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {externalLinks.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {externalLinks.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        )}

        {subredditUrl && (
          <div className="px-4 pb-3">
            <a
              href={subredditUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors"
            >
              <FaRedditAlien className="h-3.5 w-3.5" aria-hidden="true" />
              <span>r/{subreddit}</span>
            </a>
          </div>
        )}

        {/* Expand toggle */}
        <button
          className="w-full text-center py-3 border-t border-gray-700/50 text-sm text-gray-300 hover:text-white hover:bg-gray-700/20 transition-colors flex items-center justify-center gap-2 font-semibold"
          onClick={() => setExpanded((p) => !p)}
        >
          <span>{expanded ? "Show less" : "Show more"}</span>
          <span className={`text-lg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-4 pt-3 border-t border-gray-700/40">
            <div
              className="rounded-lg p-3 border-l-4"
              style={{ borderColor: accentHex, background: `${accentHex}11` }}
            >
              <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: accentHex }}>
                Why it's a cult classic
              </p>
              <p className="text-gray-200 text-xs leading-relaxed">{item.whyCult}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div
      className={`bg-gray-800/80 rounded-2xl border border-gray-700/60 overflow-hidden transition-all duration-200 hover:border-gray-600 ${
        expanded ? "shadow-xl shadow-black/30" : "shadow-sm"
      }`}
      style={expanded ? { boxShadow: `0 0 0 1px ${accentHex}33` } : {}}
    >
      <div
        role="button"
        tabIndex={0}
        className="w-full text-left p-4 flex items-start gap-3 focus:outline-none cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpanded((p) => !p);
          }
        }}
      >
        {/* Artwork badge */}
        <div
          className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: `${accentHex}20` }}
        >
          {!imageError ? (
            <>
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
              <div
                role="button"
                tabIndex={0}
                aria-label="View artwork larger"
                onClick={openImageModal}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    openImageModal(event);
                  }
                }}
                className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors cursor-zoom-in"
              />
            </>
          ) : (
            <span className="text-2xl">{item.emoji}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white leading-tight text-sm sm:text-base">
              {item.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-gray-500 text-xs mt-0.5">{item.year}</span>
              <button
                className={`p-1 rounded-full transition-all ml-1 ${
                  isFavorite ? "text-red-400 scale-110" : "text-gray-600 hover:text-gray-400"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
                }}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{item.genre}</p>
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{item.description}</p>
          {externalLinks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {externalLinks.map((link) => {
                const Icon = iconMap[link.icon];
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          )}
          {subredditUrl && (
            <div className="mt-2">
              <a
                href={subredditUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors"
              >
                <FaRedditAlien className="h-3.5 w-3.5" aria-hidden="true" />
                <span>r/{subreddit}</span>
              </a>
            </div>
          )}
          <div className="mt-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-300">
              {expanded ? "Show less" : "Show more"}
              <span className={`text-lg transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
                ▾
              </span>
            </span>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className={`text-xs px-1.5 py-0.5 rounded-full bg-gray-700/60 text-gray-500 ${onTagClick ? "cursor-pointer hover:bg-gray-600/70 hover:text-white" : ""}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-700/40 pt-3">
          <div
            className="rounded-xl p-3 border-l-4"
            style={{ borderColor: accentHex, background: `${accentHex}11` }}
          >
            <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: accentHex }}>
              Why it's a cult classic
            </p>
            <p className="text-gray-200 text-sm leading-relaxed">{item.whyCult}</p>
          </div>
        </div>
      )}

      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="relative max-w-full max-h-full overflow-hidden rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black/90"
              aria-label="Close image preview"
            >
              ✕
            </button>
            <img
              src={imageSrc}
              alt={item.title}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-3xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
