import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileEdit, ImageOff, TrendingUp, CheckCircle2 } from "lucide-react";
import { getImageCount } from "../products/productUtils";

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function Chip({ icon: Icon, count, label, sub, to, tone }) {
  const attention = tone === "warn" && count > 0;
  return (
    <motion.div variants={itemVariants}>
      <Link
        to={to}
        className={`dash-panel dash-panel-hover flex items-center gap-3 rounded-2xl p-4 transition-colors duration-150 ${
          attention ? "border-amber-400/25" : ""
        }`}
      >
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            attention ? "bg-amber-400/15 text-amber-300" : "bg-glow/12 text-glow"
          }`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold tabular-nums text-white">{count}</p>
          <p className="truncate text-xs text-white/50">{label}</p>
          {sub && <p className="truncate text-[11px] text-white/30">{sub}</p>}
        </div>
      </Link>
    </motion.div>
  );
}

// Real, derived-from-live-data signals — no fabricated metrics. Computed
// client-side from the same products/articles already fetched for the rest
// of the dashboard, so this costs no extra requests.
export default function NeedsAttentionPanel({ articles, products, loading }) {
  const draftCount = useMemo(() => articles.filter((a) => a.status === "draft").length, [articles]);
  const missingImageCount = useMemo(() => products.filter((p) => getImageCount(p) === 0).length, [products]);
  const addedThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newArticles = articles.filter((a) => new Date(a.createdAt).getTime() >= weekAgo).length;
    const newProducts = products.filter((p) => new Date(p.createdAt).getTime() >= weekAgo).length;
    return newArticles + newProducts;
  }, [articles, products]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="dash-panel h-[72px] animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const allClear = draftCount === 0 && missingImageCount === 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Chip
        icon={allClear ? CheckCircle2 : FileEdit}
        count={draftCount}
        label={draftCount === 1 ? "Draft article awaiting publish" : "Draft articles awaiting publish"}
        to="/articles"
        tone="warn"
      />
      <Chip
        icon={ImageOff}
        count={missingImageCount}
        label={missingImageCount === 1 ? "Product missing photos" : "Products missing photos"}
        to="/products"
        tone="warn"
      />
      <Chip
        icon={TrendingUp}
        count={addedThisWeek}
        label="Added in the last 7 days"
        sub="Products + articles"
        to="/products"
      />
    </div>
  );
}
