import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, ImageOff, Layers, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { getCoverImage, getVariantCount, formatDate } from "../productUtils";

export default function ProductRow({ product, onDelete, selected, onToggleSelect, selectMode }) {
  const cover = getCoverImage(product);
  const variantCount = getVariantCount(product);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.25 } }}
      whileHover={{ backgroundColor: "rgba(13,31,53,0.03)" }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="glass-panel group flex items-center gap-4 rounded-xl p-3 hover:border-glow/25 hover:shadow-glass-md"
    >
      {selectMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(product.id)}
          className="size-4.5 shrink-0 accent-primary"
        />
      )}

      <Link to={`/products/${product.id}`} className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {cover ? (
          <img src={cover} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ImageOff className="size-5" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="truncate text-sm font-semibold text-gray-900 hover:text-primary">{product.name}</h3>
        </Link>
        <p className="truncate text-xs text-gray-500">{product.id}</p>
      </div>

      <div className="hidden w-32 shrink-0 sm:block">
        {product.category ? (
          <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
            {product.category}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>

      <div className="hidden w-40 shrink-0 truncate text-xs text-gray-500 md:block">{product.origin || "—"}</div>

      <div className="hidden w-24 shrink-0 items-center gap-1 text-xs text-gray-500 lg:flex">
        <Layers className="size-3.5" />
        {variantCount}
      </div>

      <div className="hidden w-20 shrink-0 items-center gap-1 text-xs text-gray-500 lg:flex">
        <FlaskConical className="size-3.5" />
        {product.labReports?.length || 0}
      </div>

      <div className="hidden w-24 shrink-0 text-xs text-gray-400 xl:block">{formatDate(product.createdAt)}</div>

      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Link to={`/products/${product.id}`} title="View" className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-primary/5 hover:text-primary">
          <Eye className="size-4" />
        </Link>
        <Link to={`/products/${product.id}/edit`} title="Edit" className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-primary/5 hover:text-primary">
          <Pencil className="size-4" />
        </Link>
        <button title="Delete" onClick={() => onDelete(product)} className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="size-4" />
        </button>
      </div>
    </motion.div>
  );
}
