import { useState } from "react";
import { Item } from "../data";
import StarRating from "./StarRating";

interface CardProps {
  item: Item;
  accentHex: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  viewMode: "list" | "grid";
}

export default function Card({
  item,
  accentHex,
  isFavorite,
  onToggleFavorite,
  viewMode,
}: CardProps) {
  const [expanded, setExpanded] = useState(false);

  if (viewMode === "grid") {
    return (
      <div
        className={`bg-gray-800/80 rounded-2xl border border-gray-700/60 flex flex-col self-start overflow-hidden transition-all duration-200 hover:border-gray-600 hover:shadow-lg ${
          expanded ? "shadow-xl" : ""
        }`}
        style={expanded ? { boxShadow: `0 0 0 1px ${accentHex}33` } : {}}
      >
        {/* Grid card top */}
        <button
          className="flex-1 p-4 text-left focus:outline-none active:bg-gray-700/30"
          onClick={() => setExpanded((p) => !p)}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${accentHex}22` }}
            >
              {item.emoji}
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
          <StarRating rating={item.rating} />
        </button>

        {/* Tags */}
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="px-4 pb-3 text-gray-400 text-xs leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* Expand toggle */}
        <button
          className="w-full text-center py-2.5 border-t border-gray-700/50 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-700/20 transition-colors flex items-center justify-center gap-1"
          onClick={() => setExpanded((p) => !p)}
        >
          <span>{expanded ? "Less" : "Why cult?"}</span>
          <span className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
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
      <button
        className="w-full text-left p-4 flex items-start gap-3 focus:outline-none active:bg-gray-700/20"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Emoji badge */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${accentHex}20` }}
        >
          {item.emoji}
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
          <div className="flex items-center justify-between mt-1.5">
            <StarRating rating={item.rating} />
            <span
              className={`text-gray-400 text-base transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded-full bg-gray-700/60 text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </button>

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
    </div>
  );
}
