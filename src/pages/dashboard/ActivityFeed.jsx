import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Newspaper, Package, Zap } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const ICONS = {
  article: { icon: Newspaper, className: "bg-glow/12 text-glow" },
  product: { icon: Package, className: "bg-accent/15 text-accent-light" },
  spike: { icon: Zap, className: "bg-rose-500/10 text-rose-400" },
};

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

export default function ActivityFeed({ articles, products, spikeBuckets, loading }) {
  const items = useMemo(() => {
    const fromArticles = articles.map((a) => ({
      id: `article-${a._id}`,
      type: "article",
      title: `Published "${a.title}"`,
      subtitle: a.status,
      timestamp: a.createdAt,
      href: `/articles/${a.slug}`,
    }));

    const fromProducts = products.map((p) => ({
      id: `product-${p.id}`,
      type: "product",
      title: `Updated "${p.name}"`,
      subtitle: p.category || "Uncategorized",
      timestamp: p.updatedAt || p.createdAt,
      href: `/products/${p.id}`,
    }));

    const fromSpikes = spikeBuckets.map((b) => ({
      id: `spike-${b.timestamp}`,
      type: "spike",
      title: `Traffic spike — ${b.count} visits`,
      subtitle: b.label,
      timestamp: b.timestamp,
      href: "/visitors",
    }));

    return [...fromArticles, ...fromProducts, ...fromSpikes]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, [articles, products, spikeBuckets]);

  return (
    <motion.div
      variants={cardVariants}
      className="dash-panel rounded-2xl p-5"
    >
      <h2 className="text-sm font-semibold text-white">Recent activity</h2>
      <p className="text-xs text-white/40">Articles, products, and traffic spikes</p>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 text-center text-sm text-white/30">Nothing to show yet</p>
      ) : (
        <motion.ul variants={listVariants} initial="hidden" animate="visible" className="mt-4 space-y-1">
          {items.map((item) => {
            const { icon: Icon, className } = ICONS[item.type];
            return (
              <motion.li key={item.id} variants={itemVariants}>
                <Link
                  to={item.href}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-white/5"
                >
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${className}`}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-white/80">{item.title}</span>
                    <span className="block text-xs text-white/35">
                      {item.subtitle} · {timeAgo(item.timestamp)}
                    </span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.div>
  );
}
