import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, ImageOff, BarChart3, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { STATUS_META, formatDate } from "../articleUtils";
import { cn } from "../../../utillls/common";

export default function ArticleRow({ article, onDelete, selected, onToggleSelect, selectMode }) {
  const statusMeta = STATUS_META[article.status] || STATUS_META.draft;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.25 } }}
      whileHover={{ backgroundColor: "rgba(99,102,241,0.03)" }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      {selectMode && (
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(article._id)} className="size-4.5 shrink-0 accent-primary" />
      )}

      <Link to={`/articles/${article.slug}`} className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {article.coverImage?.url ? (
          <img src={article.coverImage.url} alt={article.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ImageOff className="size-5" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Link to={`/articles/${article.slug}`}>
            <h3 className="truncate text-sm font-semibold text-gray-900 hover:text-primary">{article.title}</h3>
          </Link>
          {article.isFeatured && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
        </div>
        <p className="truncate text-xs text-gray-500">{article.excerpt}</p>
      </div>

      <div className="hidden w-28 shrink-0 sm:block">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusMeta.badge)}>{statusMeta.label}</span>
      </div>

      <div className="hidden w-32 shrink-0 truncate text-xs text-gray-500 md:block">{article.category || "—"}</div>

      <div className="hidden w-24 shrink-0 items-center gap-1 text-xs text-gray-500 lg:flex">
        <BarChart3 className="size-3.5" /> {article.views ?? 0}
      </div>
      <div className="hidden w-20 shrink-0 items-center gap-1 text-xs text-gray-500 lg:flex">
        <Heart className="size-3.5" /> {article.likes ?? 0}
      </div>

      <div className="hidden w-24 shrink-0 text-xs text-gray-400 xl:block">{formatDate(article.publishedAt || article.createdAt)}</div>

      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Link to={`/articles/${article.slug}`} title="View" className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-primary/5 hover:text-primary">
          <Eye className="size-4" />
        </Link>
        <Link to={`/articles/${article.slug}/edit`} title="Edit" className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-primary/5 hover:text-primary">
          <Pencil className="size-4" />
        </Link>
        <button title="Delete" onClick={() => onDelete(article)} className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="size-4" />
        </button>
      </div>
    </motion.div>
  );
}
