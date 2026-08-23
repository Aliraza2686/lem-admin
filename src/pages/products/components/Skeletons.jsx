import { cn } from "../../../utillls/common";

function Shimmer({ className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-gray-100", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <Shimmer className="h-40 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
            <Shimmer className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3">
          <Shimmer className="size-14 shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-1/3" />
            <Shimmer className="h-3 w-1/4" />
          </div>
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ count = 8 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-gray-100 p-3 last:border-0">
          {Array.from({ length: 6 }).map((_, j) => (
            <Shimmer key={j} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
