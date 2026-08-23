import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, ImageOff, Layers } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCoverImage, getVariantCount, getImageCount } from "../productUtils";

export default function ProductCard({ product, onDelete, selected, onToggleSelect, selectMode }) {
  const navigate = useNavigate();
  const cover = getCoverImage(product);
  const variantCount = getVariantCount(product);
  const imageCount = getImageCount(product);

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
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(product.id)}
            className="size-4.5 accent-indigo-600"
          />
        </label>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/products/${product.id}`)}
        onKeyDown={(e) => e.key === "Enter" && navigate(`/products/${product.id}`)}
        className="relative h-44 w-full cursor-pointer overflow-hidden bg-gray-100"
      >
        {cover ? (
          <motion.img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ImageOff className="size-10" />
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-600 backdrop-blur">
          {imageCount} img{imageCount === 1 ? "" : "s"}
        </div>

        {/* Quick actions — fade/scale in on hover */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <ActionButton to={`/products/${product.id}`} icon={Eye} label="View" />
          <ActionButton to={`/products/${product.id}/edit`} icon={Pencil} label="Edit" />
          <ActionButton onClick={() => onDelete(product)} icon={Trash2} label="Delete" danger />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/products/${product.id}`}>
              <h3 className="truncate text-sm font-semibold text-gray-900 hover:text-indigo-600">{product.name}</h3>
            </Link>
            <p className="mt-0.5 truncate text-xs text-gray-500">{product.origin || "Origin not set"}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {product.category && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
              {product.category}
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            <Layers className="size-3" />
            {variantCount} variant{variantCount === 1 ? "" : "s"}
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
