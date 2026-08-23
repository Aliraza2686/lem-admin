import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, ImageOff, Clock, BarChart3, Heart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { STATUS_META, formatDate, getAuthorName } from "../articleUtils";
import { cn } from "../../../utillls/common";

export default function ArticleCard({ article, onDelete, selected, onToggleSelect, selectMode }) {
  const navigate = useNavigate();
  const statusMeta = STATUS_META[article.status] || STATUS_META.draft;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      {selectMode && (
        <label className="absolute top-3 left-3 z-10">
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect(article._id)} className="size-4.5 accent-indigo-600" />
        </label>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/articles/${article.slug}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/articles/${article.slug}`)}
        className="relative h-40 w-full cursor-pointer overflow-hidden bg-gray-100"
      >
        {article.coverImage?.url ? (
          <motion.img
            src={article.coverImage.url}
            alt={article.title}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ImageOff className="size-10" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {article.isFeatured && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[11px] font-semibold text-white">
              <Star className="size-3" />
            </span>
          )}
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusMeta.badge, "bg-white/95")}>
            {statusMeta.label}
          </span>
        </div>

        <div className="absolute top-3 left-3 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ left: selectMode ? "2.25rem" : undefined }}>
          <ActionButton to={`/articles/${article.slug}`} icon={Eye} label="View" />
          <ActionButton to={`/articles/${article.slug}/edit`} icon={Pencil} label="Edit" />
          <ActionButton onClick={() => onDelete(article)} icon={Trash2} label="Delete" danger />
        </div>
      </div>

      <div className="p-4">
        {article.category && (
          <span className="mb-1.5 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
            {article.category}
          </span>
        )}
        <Link to={`/articles/${article.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-indigo-600">{article.title}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{article.excerpt}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-gray-400">
          <span>{getAuthorName(article.author)}</span>
          <span>·</span>
          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          {article.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> {article.readTime}m
            </span>
          )}
          <span className="flex items-center gap-1">
            <BarChart3 className="size-3" /> {article.views ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="size-3" /> {article.likes ?? 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({ to, onClick, icon: Icon, label, danger }) {
  const classes = `flex size-8 items-center justify-center rounded-lg bg-white/95 shadow-sm ring-1 ring-gray-200 backdrop-blur transition hover:scale-110 ${
    danger ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
  }`;
  if (to) {
    return (
      <Link to={to} title={label} className={classes} onClick={(e) => e.stopPropagation()}>
        <Icon className="size-4" />
      </Link>
    );
  }
  return (
    <button
      title={label}
      className={classes}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
    >
      <Icon className="size-4" />
    </button>
  );
}
