import { Search, SlidersHorizontal, X, ArrowUpDown, Star } from "lucide-react";
import { cn } from "../../../utillls/common";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most viewed" },
  { value: "liked", label: "Most liked" },
];

export default function ArticleFiltersBar({
  search,
  onSearch,
  status,
  onStatus,
  category,
  onCategory,
  tag,
  onTag,
  featuredOnly,
  onFeaturedOnly,
  categories,
  tags,
  sort,
  onSort,
  onReset,
  hasActiveFilters,
  resultCount,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-[400px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by title, excerpt, slug..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm outline-none transition-glow focus:border-glow focus:shadow-glow-sm"
          />
        </div>

        <select value={status} onChange={(e) => onStatus(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-glow focus:border-glow focus:shadow-glow-sm">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <select value={category} onChange={(e) => onCategory(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-glow focus:border-glow focus:shadow-glow-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={tag} onChange={(e) => onTag(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-glow focus:border-glow focus:shadow-glow-sm">
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onFeaturedOnly(!featuredOnly)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition",
            featuredOnly ? "border-amber-300 bg-amber-50 text-amber-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <Star className={cn("size-3.5", featuredOnly && "fill-amber-500 text-amber-500")} />
          Featured
        </button>

        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <select value={sort} onChange={(e) => onSort(e.target.value)} className="rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm text-gray-700 outline-none transition-glow focus:border-glow focus:shadow-glow-sm">
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button onClick={onReset} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
            <X className="size-4" />
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <SlidersHorizontal className="size-3.5" />
        {resultCount} article{resultCount === 1 ? "" : "s"} match
      </div>
    </div>
  );
}
