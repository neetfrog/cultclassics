import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { fetchCultData, type CategoryDefinition, type Category, type Item } from "./data";
import { getArtworkPath, getArtworkExtensions } from "./utils/image";
import Card from "./components/Card";
import ItemDetailModal from "./components/ItemDetailModal";
import StatsView from "./components/StatsView";
import FavoritesView from "./components/FavoritesView";
import { useFavorites } from "./hooks/useFavorites";
import { useCollections } from "./hooks/useCollections";
import { useNotes } from "./hooks/useNotes";
import { useStoredState } from "./hooks/useStoredState";

type SortKey = "default" | "year-asc" | "year-desc" | "rating" | "a-z";
type View = "browse" | "favorites" | "stats";

const accentHex: Record<Category, string> = {
  movies: "#ef4444",
  tv: "#a855f7",
  books: "#f59e0b",
  games: "#22c55e",
  music: "#3b82f6",
};

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_STEP = 12;

const getDecade = (year: number) => `${Math.floor(year / 10) * 10}s`;

function resolveItemById(itemId: string, data: Record<Category, Item[]>) {
  for (const category of Object.keys(data) as Category[]) {
    const item = data[category]?.find((item) => item.id === itemId);
    if (item) {
      return { item, category };
    }
  }
  return null;
}

function parseRoute(pathname: string, search: string, hash: string) {
  const trimmedHash = hash.replace(/^#/, "");
  const query = new URLSearchParams(search).get("item") || trimmedHash.replace(/^item=/, "") || "";
  const segments = pathname.split("/").filter(Boolean);
  let view: View = "browse";
  let category: Category | undefined;
  let itemId: string | undefined;

  if (segments[0] === "item" && segments[1]) {
    itemId = decodeURIComponent(segments[1]);
  } else if (
    segments[0] === "category" &&
    segments[1] &&
    segments[2] === "item" &&
    segments[3]
  ) {
    category = segments[1] as Category;
    itemId = decodeURIComponent(segments[3]);
  } else if (segments[0] === "favorites") {
    view = "favorites";
  } else if (segments[0] === "stats") {
    view = "stats";
  }

  if (!itemId && query) {
    itemId = query;
  }

  return { view, category, itemId };
}

function RandomModal({
  item,
  catHex,
  catIcon,
  catLabel,
  isFavorite,
  onToggle,
  onClose,
  onNext,
}: {
  item: Item;
  catHex: string;
  catIcon: string;
  catLabel: string;
  isFavorite: boolean;
  onToggle: (id: string) => void;
  onClose: () => void;
  onNext: () => void;
}) {
  const [modalImageError, setModalImageError] = useState(false);
  const [modalImageAttempt, setModalImageAttempt] = useState(0);
  const artworkExtensions = getArtworkExtensions();
  const modalImageSrc = getArtworkPath(item, artworkExtensions[modalImageAttempt]);

  useEffect(() => {
    setModalImageError(false);
    setModalImageAttempt(0);
  }, [item.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 0 60px ${catHex}33` }}
      >
        {/* Header strip */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(to right, ${catHex}, ${catHex}88)` }}
        />

        <div className="p-6 space-y-4">
          {/* Category pill */}
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: catHex + "33", color: catHex }}
            >
              {catIcon} {catLabel}
            </span>
            <span className="text-xs text-gray-500">{item.year}</span>
          </div>

          {/* Artwork + Title */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-950"
              style={{ background: catHex + "22" }}
            >
              {!modalImageError ? (
                <img
                  src={modalImageSrc}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={() => {
                    if (modalImageAttempt < artworkExtensions.length - 1) {
                      setModalImageAttempt((attempt) => attempt + 1);
                    } else {
                      setModalImageError(true);
                    }
                  }}
                />
              ) : (
                <span className="text-3xl">{item.emoji}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight">{item.title}</h2>
              <p className="text-xs text-gray-400 mt-1">{item.genre}</p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-sm ${s <= item.rating ? "text-yellow-400" : "text-gray-700"}`}>★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>

          {/* Why cult */}
          <div
            className="rounded-xl p-3 border-l-4 text-sm"
            style={{ borderColor: catHex, background: catHex + "11" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: catHex }}>
              Why it's a cult classic
            </p>
            <p className="text-gray-200 text-sm leading-relaxed">{item.whyCult}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: catHex + "22", color: catHex + "cc" }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onToggle(item.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isFavorite
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-gray-700/60 text-gray-300 border border-gray-600/40 hover:bg-gray-700"
              }`}
            >
              {isFavorite ? "❤️ Saved" : "🤍 Save"}
            </button>
            <button
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-all"
            >
              🎲 Another random
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { collections, toggleCollection, createCollection } = useCollections();
  const { notes, setNote } = useNotes();
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [data, setData] = useState<Record<Category, Item[]>>({} as Record<Category, Item[]>);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeCategory, setActiveCategory] = useStoredState<Category>(
    "cult-classics-active-category",
    () => {
      if (typeof window !== "undefined") {
        const route = parseRoute(window.location.pathname, window.location.search, window.location.hash);
        return route.category ?? "movies";
      }
      return "movies";
    }
  );
  const [sortKey, setSortKey] = useStoredState<SortKey>("cult-classics-sort-key", "default");
  const [viewMode, setViewMode] = useStoredState<"list" | "grid">("cult-classics-view-mode", "list");
  const [view, setView] = useStoredState<View>("cult-classics-view", () => {
    if (typeof window !== "undefined") {
      const route = parseRoute(window.location.pathname, window.location.search, window.location.hash);
      return route.view;
    }
    return "browse";
  });
  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [decadeFilter, setDecadeFilter] = useState<string | null>(null);
  const [randomItem, setRandomItem] = useState<{
    item: Item;
    catId: Category;
  } | null>(null);
  const [detailItem, setDetailItem] = useState<{ item: Item; catId: Category } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCultData()
      .then((payload) => {
        setCategories(payload.categories);
        setData(payload.data);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (loadingData || loadError) return;
    if (typeof window === "undefined") return;

    const route = parseRoute(window.location.pathname, window.location.search, window.location.hash);
    setView(route.view);
    if (route.category) {
      setActiveCategory(route.category);
    }
    if (route.itemId) {
      const resolved = resolveItemById(route.itemId, data);
      if (resolved) {
        setDetailItem({ item: resolved.item, catId: resolved.category });
        return;
      }
    }
    setDetailItem(null);
  }, [loadingData, loadError, data, setActiveCategory, setView]);

  const { favorites, toggle, isFavorite, count: favCount } = useFavorites();

  const activeCat = categories.find((c) => c.id === activeCategory) ?? categories[0]!;

  const openItemDetails = useCallback(
    (item: Item, catId: Category) => {
      setDetailItem({ item, catId });
      const nextPath = `/category/${catId}/item/${item.id}`;
      window.history.pushState(null, "", nextPath);
    },
    []
  );

  const closeItemDetails = useCallback(() => {
    setDetailItem(null);
    const nextPath = view === "browse" ? `/category/${activeCategory}` : `/${view}`;
    window.history.replaceState(null, "", nextPath);
  }, [activeCategory, view]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      const route = parseRoute(window.location.pathname, window.location.search, window.location.hash);
      setView(route.view);
      if (route.category) {
        setActiveCategory(route.category);
      }
      if (route.itemId) {
        const resolved = resolveItemById(route.itemId, data);
        if (resolved) {
          setDetailItem({ item: resolved.item, catId: resolved.category });
          return;
        }
      }
      setDetailItem(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setActiveCategory, setView]);

  useEffect(() => {
    if (detailItem) {
      setActiveCategory(detailItem.catId);
    }
  }, [detailItem, setActiveCategory]);

  useEffect(() => {
    if (detailItem) return;
    const nextPath = view === "browse" ? `/category/${activeCategory}` : `/${view}`;
    window.history.replaceState(null, "", nextPath);
  }, [activeCategory, view, detailItem]);

  const baseItems = useMemo(() => data[activeCategory] ?? [], [activeCategory, data]);

  const filtered = useMemo(() => {
    let items = [...baseItems];
    if (decadeFilter) {
      items = items.filter((item) => getDecade(item.year) === decadeFilter);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.genre.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    switch (sortKey) {
      case "year-asc":
        items.sort((a, b) => a.year - b.year);
        break;
      case "year-desc":
        items.sort((a, b) => b.year - a.year);
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
        break;
      case "a-z":
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return items;
  }, [baseItems, search, sortKey, decadeFilter]);

  useEffect(() => {
    setVisibleCount(Math.min(filtered.length, INITIAL_VISIBLE_COUNT));
  }, [filtered.length]);

  useEffect(() => {
    if (typeof window === "undefined" || !loadMoreRef.current) return;
    const node = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setVisibleCount((prev) => Math.min(filtered.length, prev + LOAD_MORE_STEP));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  const visibleItems = filtered.slice(0, visibleCount);

  const availableDecades = useMemo(() => {
    const decades = new Set<string>();
    baseItems.forEach((item) => decades.add(getDecade(item.year)));
    return Array.from(decades).sort((a, b) => Number(a.replace("s", "")) - Number(b.replace("s", "")));
  }, [baseItems]);

  const globalResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const q = globalSearch.toLowerCase().trim();
    return categories.flatMap((cat) =>
      data[cat.id]
        .filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.genre.toLowerCase().includes(q) ||
            item.tags.some((t) => t.toLowerCase().includes(q))
        )
        .map((item) => ({ item, cat }))
    );
  }, [globalSearch]);

  const pickRandom = useCallback(() => {
    const allItems = categories.flatMap((cat) =>
      data[cat.id].map((item) => ({ item, catId: cat.id as Category }))
    );
    const pick = allItems[Math.floor(Math.random() * allItems.length)];
    setRandomItem(pick);
  }, []);

  const handleTabChange = (id: Category) => {
    setActiveCategory(id);
    setSearch("");
    setSortKey("default");
    setShowFilters(false);
  };

  const activeFilters =
    (search ? 1 : 0) + (sortKey !== "default" ? 1 : 0) + (decadeFilter ? 1 : 0);

  const hex = accentHex[activeCategory];

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading catalog…</p>
          <p className="text-sm text-gray-400 mt-2">Fetching the latest dynamic data.</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Failed to load data.</p>
          <p className="text-sm text-gray-400 mt-2">Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/80">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-0">
          {/* Top row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-lg shadow-lg shadow-violet-900/40 flex-shrink-0">
              🔥
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                Cult Classics
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 leading-none">
                Must-see picks across every medium
              </p>
            </div>
            <button
              onClick={pickRandom}
              title="Random pick"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all active:scale-95"
            >
              🎲 <span className="hidden sm:inline">Random</span>
            </button>
          </div>

          {/* Global search bar (only visible when not in browse mode) */}
          {view !== "browse" && (
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
              <input
                ref={searchRef}
                type="search"
                placeholder="Search all categories…"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
              />
            </div>
          )}

          {/* Category tabs */}
          {view === "browse" && (
            <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleTabChange(cat.id)}
                    className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: cat.hex }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-4 pb-24">
        {/* ── BROWSE VIEW ── */}
        {view === "browse" && (
          <>
            {/* Hero row */}
            <div
              className="rounded-2xl p-4 mb-4 flex items-center gap-4"
              style={{
                background: `linear-gradient(135deg, ${hex}18 0%, transparent 100%)`,
                border: `1px solid ${hex}22`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: hex + "25" }}
              >
                {activeCat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  {activeCat.label}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {baseItems.length} essential picks
                  {filtered.length !== baseItems.length &&
                    ` · ${filtered.length} shown`}
                </p>
              </div>
              {/* View toggle */}
              <div className="flex bg-gray-800/60 border border-gray-700/60 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg text-sm transition-all ${
                    viewMode === "list"
                      ? "bg-gray-600 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  title="List view"
                >
                  ☰
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-sm transition-all ${
                    viewMode === "grid"
                      ? "bg-gray-600 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  title="Grid view"
                >
                  ⊞
                </button>
              </div>
            </div>

            {/* Search + Filter row */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  🔍
                </span>
                <input
                  type="search"
                  placeholder={`Search ${activeCat.label.toLowerCase()}…`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
                />
                {search && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                    onClick={() => setSearch("")}
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters((p) => !p)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  showFilters || activeFilters > 0
                    ? "bg-gray-700 border-gray-500 text-white"
                    : "bg-gray-800/80 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
                }`}
              >
                ⚙️
                {activeFilters > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ background: hex }}
                  >
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>

            {/* Quick decade picks */}
            {availableDecades.length > 0 && (
              <div className="rounded-2xl border border-gray-700/60 bg-gray-800/80 p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400">Quick decade picks</p>
                  {decadeFilter && (
                    <button
                      type="button"
                      onClick={() => setDecadeFilter(null)}
                      className="text-xs text-gray-400 hover:text-white underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableDecades.map((decade) => (
                    <button
                      key={decade}
                      type="button"
                      onClick={() => {
                        setDecadeFilter(decade);
                        setSearch("");
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        decadeFilter === decade
                          ? "border-transparent bg-white text-gray-950"
                          : "border-gray-700/60 bg-gray-950 text-gray-400 hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      {decade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter panel */}
            {showFilters && (
              <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-4 mb-3 space-y-4 animate-in">
                {/* Sort */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Sort by
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { key: "default", label: "Default" },
                        { key: "a-z", label: "A → Z" },
                        { key: "year-asc", label: "Oldest first" },
                        { key: "year-desc", label: "Newest first" },
                        { key: "rating", label: "Top rated" },
                      ] as { key: SortKey; label: string }[]
                    ).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setSortKey(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          sortKey === key
                            ? "text-white border-transparent"
                            : "bg-gray-700/40 border-gray-600/40 text-gray-400 hover:text-gray-200"
                        }`}
                        style={
                          sortKey === key
                            ? { background: hex + "55", borderColor: hex + "88" }
                            : {}
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Reset */}
                {activeFilters > 0 && (
                  <button
                    onClick={() => {
                      setSortKey("default");
                      setSearch("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            )}

            {/* Results info */}
            {(search || decadeFilter) && (
              <p className="text-xs text-gray-500 mb-3">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                {search && ` for "${search}"`}
                {search && decadeFilter && ", "}
                {decadeFilter && ` from ${decadeFilter}`}
                {decadeFilter && (
                  <button
                    onClick={() => setDecadeFilter(null)}
                    className="ml-2 text-xs text-gray-300 underline hover:text-white"
                  >
                    Clear decade
                  </button>
                )}
              </p>
            )}

            {/* Cards */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-5xl mb-4">🤷</p>
                <p className="text-sm font-medium text-gray-400">No results found</p>
                <p className="text-xs mt-1 text-gray-600">Try a different search or filter</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSortKey("default");
                  }}
                  className="mt-4 text-xs text-gray-500 underline hover:text-gray-300"
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3">
                {visibleItems.map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    category={activeCategory}
                    accentHex={hex}
                    isFavorite={isFavorite(item.id)}
                    onToggleFavorite={toggle}
                    onOpenDetails={(item) => openItemDetails(item, activeCategory)}
                    onTagClick={(tag) => setSearch(tag)}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {visibleItems.map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    category={activeCategory}
                    accentHex={hex}
                    isFavorite={isFavorite(item.id)}
                    onToggleFavorite={toggle}
                    onOpenDetails={(item) => openItemDetails(item, activeCategory)}
                    onTagClick={(tag) => setSearch(tag)}
                    viewMode="list"
                  />
                ))}
              </div>
            )}
            {visibleCount < filtered.length && (
              <div ref={loadMoreRef} className="py-8 text-center text-xs text-gray-500">
                Loading more items…
              </div>
            )}
          </>
        )}

        {/* ── FAVORITES VIEW ── */}
        {view === "favorites" && (
          <FavoritesView
            categories={categories}
            data={data}
            favorites={favorites}
            collections={collections}
            onToggleFavorite={toggle}
            onOpenDetails={(item, category) => openItemDetails(item, category)}
          />
        )}

        {/* ── STATS VIEW ── */}
        {view === "stats" && (
          <StatsView
            categories={categories}
            data={data}
            favorites={favorites}
            onTagClick={(tag) => {
              setView("browse");
              setSearch(tag);
              setDecadeFilter(null);
            }}
            onDecadeClick={(decade) => {
              setView("browse");
              setDecadeFilter(decade);
              setSearch("");
            }}
          />
        )}

        {/* ── GLOBAL SEARCH RESULTS overlay ── */}
        {view !== "browse" && globalSearch && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 mb-3">
              {globalResults.length} result{globalResults.length !== 1 ? "s" : ""} for "{globalSearch}"
            </p>
            {globalResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm text-gray-400">Nothing found</p>
              </div>
            ) : (
              globalResults.map(({ item, cat }) => (
                <Card
                  key={item.id}
                  item={item}
                  category={cat.id}
                  accentHex={cat.hex}
                  isFavorite={isFavorite(item.id)}
                  onToggleFavorite={toggle}
                  onOpenDetails={(item) => openItemDetails(item, cat.id)}
                  viewMode="list"
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-gray-950/95 backdrop-blur-md border-t border-gray-800/80">
        <div className="max-w-2xl mx-auto flex">
          {(
            [
              { id: "browse" as View, icon: "🏠", label: "Browse" },
              { id: "favorites" as View, icon: "❤️", label: "Saved", badge: favCount },
              { id: "stats" as View, icon: "📊", label: "Stats" },
            ] as { id: View; icon: string; label: string; badge?: number }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setView(tab.id);
                setGlobalSearch("");
              }}
              className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all ${
                view === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute top-1.5 left-1/2 translate-x-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
              {view === tab.id && (
                <span className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {detailItem && (() => {
        const cat = categories.find((c) => c.id === detailItem.catId)!;
        return (
          <ItemDetailModal
            item={detailItem.item}
            category={detailItem.catId}
            accentHex={cat.hex}
            isFavorite={isFavorite(detailItem.item.id)}
            note={notes[detailItem.item.id] ?? ""}
            collections={collections}
            onToggleFavorite={toggle}
            onNoteChange={setNote}
            onToggleCollection={toggleCollection}
            onCreateCollection={createCollection}
            onClose={closeItemDetails}
          />
        );
      })()}

      {/* ── RANDOM MODAL ── */}
      {randomItem && (() => {
        const cat = categories.find((c) => c.id === randomItem.catId)!;
        return (
          <RandomModal
            item={randomItem.item}
            catHex={cat.hex}
            catIcon={cat.icon}
            catLabel={cat.label}
            isFavorite={isFavorite(randomItem.item.id)}
            onToggle={toggle}
            onClose={() => setRandomItem(null)}
            onNext={pickRandom}
          />
        );
      })()}
    </div>
  );
}
