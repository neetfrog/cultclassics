import type { Category, CategoryDefinition, Item } from "../data";

interface StatsViewProps {
  categories: CategoryDefinition[];
  data: Record<Category, Item[]>;
  favorites: Set<string>;
  onTagClick: (tag: string) => void;
  onDecadeClick: (decade: string) => void;
}

export default function StatsView({ categories, data, favorites, onTagClick, onDecadeClick }: StatsViewProps) {
  const totalItems = categories.reduce((a, c) => a + (data[c.id]?.length ?? 0), 0);
  const fiveStarItems = categories.reduce(
    (a, c) => a + (data[c.id]?.filter((i) => i.rating === 5).length ?? 0),
    0
  );

  const yearRange = (() => {
    const years = categories.flatMap((c) => (data[c.id] ?? []).map((i) => i.year));
    return { min: Math.min(...years), max: Math.max(...years) };
  })();

  const decades = (() => {
    const decadeCounts: Record<string, number> = {};
    categories.forEach((cat) => {
      (data[cat.id] ?? []).forEach((item) => {
        const decade = `${Math.floor(item.year / 10) * 10}s`;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      });
    });
    return Object.entries(decadeCounts)
      .sort((a, b) => Number(a[0].replace("s", "")) - Number(b[0].replace("s", "")))
      .map(([decade]) => decade);
  })();

  const favByCategory: Record<string, number> = {};
  categories.forEach((c) => {
    favByCategory[c.id] = (data[c.id] ?? []).filter((i) => favorites.has(i.id)).length;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Overview */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Picks", value: totalItems, icon: "🔥" },
            { label: "★★★★★ Rated", value: fiveStarItems, icon: "⭐" },
            { label: "Your Favorites", value: favorites.size, icon: "❤️" },
            {
              label: "Span of Years",
              value: `${yearRange.min}–${yearRange.max}`,
              icon: "📅",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-4 flex flex-col gap-1"
            >
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-extrabold text-white">{stat.value}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-3">Quick decade picks</h2>
        <div className="rounded-2xl border border-gray-700/60 bg-gray-800/80 p-4">
          <p className="text-xs text-gray-400 mb-2">Tap a decade to filter the browse view by that era.</p>
          <div className="flex flex-wrap gap-2">
            {decades.map((decade) => (
              <button
                key={decade}
                type="button"
                onClick={() => onDecadeClick(decade)}
                className="rounded-full border border-gray-700/60 bg-gray-950 px-3 py-1 text-xs text-gray-400 hover:border-gray-500 hover:text-white transition"
              >
                {decade}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* By Category */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">By Category</h2>
        <div className="space-y-3">
          {categories.map((cat) => {
            const items = data[cat.id] ?? [];
            const pct = totalItems > 0 ? Math.round((items.length / totalItems) * 100) : 0;
            const avgRating = items.length > 0 ? items.reduce((a, i) => a + i.rating, 0) / items.length : 0;
            const fav = favByCategory[cat.id];
            return (
              <div
                key={cat.id}
                className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-semibold text-white text-sm">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {fav > 0 && (
                      <span className="text-xs text-red-400 flex items-center gap-0.5">
                        ❤️ {fav}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      ★ {avgRating.toFixed(1)} avg
                    </span>
                    <span className="text-xs text-gray-400">{items.length} picks</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: cat.hex }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Genre cloud */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Tag Cloud</h2>
        <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-4 flex flex-wrap gap-2">
          {(() => {
            const tagCounts: Record<string, { count: number; hex: string }> = {};
            categories.forEach((cat) => {
              (data[cat.id] ?? []).forEach((item) => {
                item.tags.forEach((tag) => {
                  if (!tagCounts[tag])
                    tagCounts[tag] = { count: 0, hex: cat.hex };
                  tagCounts[tag].count++;
                });
              });
            });
            return Object.entries(tagCounts)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 30)
              .map(([tag, { count, hex }]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className="text-xs px-2.5 py-1 rounded-full text-white/80 font-medium transition hover:text-white"
                  style={{
                    background: `${hex}33`,
                    border: `1px solid ${hex}44`,
                    fontSize: `${Math.min(0.75 + count * 0.08, 1)}rem`,
                  }}
                >
                  {tag}
                </button>
              ));
          })()}
        </div>
      </div>

      {/* Decade breakdown */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">By Decade</h2>
        <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-4 space-y-2">
          {(() => {
            const decades: Record<string, number> = {};
            categories.forEach((cat) => {
              (data[cat.id] ?? []).forEach((item) => {
                const decade = `${Math.floor(item.year / 10) * 10}s`;
                decades[decade] = (decades[decade] || 0) + 1;
              });
            });
            const sorted = Object.entries(decades).sort((a, b) =>
              a[0].localeCompare(b[0])
            );
            const max = sorted.length > 0 ? Math.max(...sorted.map(([, v]) => v)) : 1;
            return sorted.map(([decade, count]) => (
              <button
              key={decade}
              type="button"
              onClick={() => onDecadeClick(decade)}
              className="flex w-full items-center gap-3 rounded-2xl bg-gray-950 p-3 transition hover:bg-gray-900"
            >
              <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">
                {decade}
              </span>
              <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6 flex-shrink-0">{count}</span>
            </button>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
