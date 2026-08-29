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
      className="dash-panel rounded-2xl p-5"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-white">Product stats</h2>
        <span className="text-xs text-white/40">{loading ? "…" : `${total} total`}</span>
      </div>
      <p className="text-xs text-white/40">By category, plus recently added</p>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-full animate-pulse rounded bg-white/5" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-6 text-center text-sm text-white/30">No products yet</p>
      ) : (
        <>
          <div className="mt-4 space-y-2.5">
            {breakdown.map((b) => (
              <div key={b.category} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs text-white/50">{b.category}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-glow shadow-[0_0_8px_rgba(79,209,255,0.5)]"
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-medium text-white/50">
                  {b.count}
                </span>
              </div>
            ))}
          </div>

          <ul className="mt-5 divide-y divide-white/5 border-t border-white/5">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/products/${p.id}`}
                  className="flex items-center gap-3 py-2.5 text-sm text-white/70 transition-colors duration-150 hover:text-glow"
                >
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-white/35">
                    <Layers className="size-3.5" />
                    {getVariantCount(p)}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-white/35">
                    <ImageIcon className="size-3.5" />
                    {getImageCount(p)}
                  </span>
                  <span className="shrink-0 text-xs text-white/35">{formatDate(p.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}
