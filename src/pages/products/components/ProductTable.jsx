import { motion, AnimatePresence } from "framer-motion";
import { Eye, Pencil, Trash2, Copy, ImageOff, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { getCoverImage, getVariantCount, formatDate } from "../productUtils";
import { cn } from "../../../utillls/common";

const COLUMNS = [
  { key: "name", label: "Product", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "origin", label: "Origin", sortable: true },
  { key: "variantCount", label: "Variants", sortable: true },
  { key: "labReports", label: "Lab reports", sortable: false },
  { key: "createdAt", label: "Created", sortable: true },
];

export default function ProductTable({
  products,
  onDelete,
  onDuplicate,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  sortField,
  sortDir,
  onSort,
}) {
  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleSelectAll(products.map((p) => p.id))}
                  className="size-4 accent-primary"
                />
              </th>
              <th className="w-14 px-2 py-3"></th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-3 py-3">
                  {col.sortable ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="flex items-center gap-1 transition hover:text-gray-800"
                    >
                      {col.label}
                      {sortField === col.key &&
                        (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false} mode="popLayout">
              {products.map((product, i) => {
                const cover = getCoverImage(product);
                return (
                  <motion.tr
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.02 } }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.22 } }}
                    className={cn(
                      "border-b border-gray-100 last:border-0 hover:bg-primary/5/30",
                      selected.has(product.id) && "bg-primary/5/50"
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => onToggleSelect(product.id)}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <Link to={`/products/${product.id}`} className="block size-10 overflow-hidden rounded-md bg-gray-100">
                        {cover ? (
                          <img src={cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <ImageOff className="size-4" />
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <Link to={`/products/${product.id}`} className="font-medium text-gray-900 hover:text-primary">
                        {product.name}
                      </Link>
                      <div className="text-xs text-gray-400">{product.id}</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{product.category || "—"}</td>
                    <td className="max-w-[160px] truncate px-3 py-2.5 text-gray-600">{product.origin || "—"}</td>
                    <td className="px-3 py-2.5 text-gray-600">{getVariantCount(product)}</td>
                    <td className="px-3 py-2.5 text-gray-600">{product.labReports?.length || 0}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">{formatDate(product.createdAt)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Link to={`/products/${product.id}`} title="View" className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-primary/5 hover:text-primary">
                          <Eye className="size-4" />
                        </Link>
                        <Link to={`/products/${product.id}/edit`} title="Edit" className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-primary/5 hover:text-primary">
                          <Pencil className="size-4" />
                        </Link>
                        <button title="Duplicate" onClick={() => onDuplicate(product)} className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-primary/5 hover:text-primary">
                          <Copy className="size-4" />
                        </button>
                        <button title="Delete" onClick={() => onDelete(product)} className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
