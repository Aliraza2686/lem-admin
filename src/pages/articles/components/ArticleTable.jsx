import { motion, AnimatePresence } from "framer-motion";
import { Eye, Pencil, Trash2, Copy, ImageOff, ArrowUp, ArrowDown, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { STATUS_META, formatDate } from "../articleUtils";
import { cn } from "../../../utillls/common";

const COLUMNS = [
  { key: "title", label: "Article", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "views", label: "Views", sortable: true },
  { key: "likes", label: "Likes", sortable: true },
  { key: "readTime", label: "Read time", sortable: true },
  { key: "createdAt", label: "Created", sortable: true },
];

export default function ArticleTable({ articles, onDelete, onDuplicate, selected, onToggleSelect, onToggleSelectAll, sortField, sortDir, onSort }) {
  const allSelected = articles.length > 0 && articles.every((a) => selected.has(a._id));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={() => onToggleSelectAll(articles.map((a) => a._id))} className="size-4 accent-indigo-600" />
              </th>
              <th className="w-14 px-2 py-3"></th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-3 py-3">
                  {col.sortable ? (
                    <button onClick={() => onSort(col.key)} className="flex items-center gap-1 transition hover:text-gray-800">
                      {col.label}
                      {sortField === col.key && (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
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
              {articles.map((article, i) => {
                const statusMeta = STATUS_META[article.status] || STATUS_META.draft;
                return (
                  <motion.tr
                    key={article._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.02 } }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.22 } }}
                    className={cn("border-b border-gray-100 last:border-0 hover:bg-indigo-50/30", selected.has(article._id) && "bg-indigo-50/50")}
                  >
                    <td className="px-4 py-2.5">
                      <input type="checkbox" checked={selected.has(article._id)} onChange={() => onToggleSelect(article._id)} className="size-4 accent-indigo-600" />
                    </td>
                    <td className="px-2 py-2.5">
                      <Link to={`/articles/${article.slug}`} className="block size-10 overflow-hidden rounded-md bg-gray-100">
                        {article.coverImage?.url ? (
                          <img src={article.coverImage.url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <ImageOff className="size-4" />
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/articles/${article.slug}`} className="font-medium text-gray-900 hover:text-indigo-600 line-clamp-1 max-w-[280px]">
                          {article.title}
                        </Link>
                        {article.isFeatured && <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />}
                      </div>
                      <div className="text-xs text-gray-400">{article.slug}</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{article.category || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusMeta.badge)}>{statusMeta.label}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{article.views ?? 0}</td>
                    <td className="px-3 py-2.5 text-gray-600">{article.likes ?? 0}</td>
                    <td className="px-3 py-2.5 text-gray-600">{article.readTime ? `${article.readTime}m` : "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">{formatDate(article.createdAt)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Link to={`/articles/${article.slug}`} title="View" className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600">
                          <Eye className="size-4" />
                        </Link>
                        <Link to={`/articles/${article.slug}/edit`} title="Edit" className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600">
                          <Pencil className="size-4" />
                        </Link>
                        <button title="Duplicate" onClick={() => onDuplicate(article)} className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600">
                          <Copy className="size-4" />
                        </button>
                        <button title="Delete" onClick={() => onDelete(article)} className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600">
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
