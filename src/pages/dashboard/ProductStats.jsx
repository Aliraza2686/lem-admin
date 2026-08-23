import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layers, ImageIcon } from "lucide-react";
import { categoryBreakdown, recentlyUpdated } from "./dashboardUtils";
import { getVariantCount, getImageCount, formatDate } from "../products/productUtils";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function ProductStats({ products, total, loading }) {
  const breakdown = categoryBreakdown(products).slice(0, 6);
  const maxCount = Math.max(1, ...breakdown.map((b) => b.count));
  const recent = recentlyUpdated(products, "createdAt", 5);

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Product stats</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">{loading ? "…" : `${total} total`}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">By category, plus recently added</p>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-6 text-center text-sm text-gray-400">No products yet</p>
      ) : (
        <>
          <div className="mt-4 space-y-2.5">
            {breakdown.map((b) => (
              <div key={b.category} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs text-gray-600 dark:text-gray-400">{b.category}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-indigo-500"
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  {b.count}
                </span>
              </div>
            ))}
          </div>

          <ul className="mt-5 divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/products/${p.id}`}
                  className="flex items-center gap-3 py-2.5 text-sm transition-colors hover:text-indigo-600"
                >
                  <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-300">{p.name}</span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                    <Layers className="size-3.5" />
                    {getVariantCount(p)}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                    <ImageIcon className="size-3.5" />
                    {getImageCount(p)}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}
