import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { cn } from "../../../utillls/common";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "category:asc", label: "Category (A–Z)" },
  { value: "variantCount:desc", label: "Most variants" },
  { value: "updatedAt:desc", label: "Recently updated" },
];

export default function FiltersBar({
  search,
  onSearch,
  category,
  onCategory,
  origin,
  onOrigin,
  categories,
  origins,
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
            placeholder="Search by name, id, origin, description..."
            className="transition-glow w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-glow focus:shadow-glow-sm"
          />
        </div>

        <select
          value={category}
          onChange={(e) => onCategory(e.target.value)}
          className="transition-glow rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-glow focus:shadow-glow-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={origin}
          onChange={(e) => onOrigin(e.target.value)}
          className="transition-glow rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-glow focus:shadow-glow-sm"
        >
          <option value="">All origins</option>
          {origins.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="transition-glow rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm text-gray-700 outline-none focus:border-glow focus:shadow-glow-sm"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="size-4" />
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <SlidersHorizontal className="size-3.5" />
        {resultCount} product{resultCount === 1 ? "" : "s"} match
        {category && (
          <span className={cn("ml-1 rounded-full bg-primary/5 px-2 py-0.5 text-primary")}>
            category: {category}
          </span>
        )}
        {origin && (
          <span className="ml-1 rounded-full bg-primary/5 px-2 py-0.5 text-primary">origin: {origin}</span>
        )}
      </div>
    </div>
  );
}
