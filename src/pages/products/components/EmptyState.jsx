import { motion } from "framer-motion";
import { PackagePlus, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ filtered }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-20 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
        {filtered ? <SearchX className="size-8" /> : <PackagePlus className="size-8" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {filtered ? "No products match your filters" : "No products yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        {filtered
          ? "Try adjusting or clearing your search and filters to see more results."
          : "Get started by adding your first mineral or stone product to the catalog."}
      </p>
      {!filtered && (
        <Link
          to="/products/new"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <PackagePlus className="size-4" />
          Add your first product
        </Link>
      )}
    </motion.div>
  );
}
