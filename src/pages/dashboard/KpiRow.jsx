import { motion } from "framer-motion";
import { Users, Package, Newspaper, Eye } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import { formatCompactNumber, formatPercent } from "./dashboardUtils";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function KpiCard({ icon: Icon, label, value, delta, loading, index }) {
  const animatedValue = useCountUp(loading ? 0 : value);
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const positive = hasDelta && delta >= 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/80"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Icon className="size-5" />
        </span>
        {hasDelta && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              positive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            }`}
          >
            {formatPercent(delta)}
          </span>
        )}
      </div>

      <p className="mt-4 text-2xl font-semibold text-gray-900 tabular-nums dark:text-white">
        {loading ? (
          <span className="inline-block h-7 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        ) : (
          formatCompactNumber(animatedValue)
        )}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </motion.div>
  );
}

export default function KpiRow({
  visitorsCount,
  visitorsDelta,
  productsCount,
  articlesCount,
  avgViews,
  loading,
}) {
  const items = [
    { icon: Users, label: "Visitors (period)", value: visitorsCount, delta: visitorsDelta },
    { icon: Package, label: "Total Products", value: productsCount },
    { icon: Newspaper, label: "Total Articles", value: articlesCount },
    { icon: Eye, label: "Avg. Views / Article", value: avgViews },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <KpiCard key={item.label} {...item} loading={loading} index={i} />
      ))}
    </div>
  );
}
