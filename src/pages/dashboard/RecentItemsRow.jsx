import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Pencil, ImageOff, Package, Newspaper } from "lucide-react";
import { getCoverImage } from "../products/productUtils";
import { STATUS_META } from "../articles/articleUtils";

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0 },
};

function ItemCard({ kind, cover, title, meta, viewHref, editHref }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="dash-panel dash-panel-hover group relative w-56 shrink-0 overflow-hidden rounded-2xl"
    >
      <div className="relative h-28 w-full overflow-hidden bg-white/5">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-white/15">
            {kind === "product" ? <Package className="size-8" /> : <ImageOff className="size-8" />}
          </div>
        )}
        <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary-deep/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
          {kind === "product" ? <Package className="size-3" /> : <Newspaper className="size-3" />}
          {kind === "product" ? "Product" : "Article"}
        </span>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 truncate text-xs text-white/40">{meta}</p>

        <div className="mt-2.5 flex gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <Link
            to={viewHref}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-[11px] font-medium text-white/80 hover:bg-white/10"
          >
            <Eye className="size-3" /> View
          </Link>
          <Link
            to={editHref}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-[11px] font-medium text-white/80 hover:bg-white/10"
          >
            <Pencil className="size-3" /> Edit
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function RecentItemsRow({ products, articles, loading }) {
  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dash-panel h-48 w-56 shrink-0 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = [
    ...products.map((p) => ({
      kind: "product",
      itemKey: `p-${p.id}`,
      cover: getCoverImage(p),
      title: p.name,
      meta: p.category || "Uncategorized",
      viewHref: `/products/${p.id}`,
      editHref: `/products/${p.id}/edit`,
      sortAt: p.updatedAt || p.createdAt,
    })),
    ...articles.map((a) => ({
      kind: "article",
      itemKey: `a-${a._id}`,
      cover: a.coverImage?.url,
      title: a.title,
      meta: STATUS_META[a.status]?.label || a.status,
      viewHref: `/articles/${a.slug}`,
      editHref: `/articles/${a.slug}/edit`,
      sortAt: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.sortAt || 0) - new Date(a.sortAt || 0))
    .slice(0, 8);

  if (items.length === 0) {
    return (
      <div className="dash-panel flex h-24 items-center justify-center rounded-2xl text-sm text-white/40">
        Nothing added yet — use Quick actions above to get started.
      </div>
    );
  }

  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {items.map((item) => (
        <ItemCard key={item.itemKey} {...item} />
      ))}
    </div>
  );
}
