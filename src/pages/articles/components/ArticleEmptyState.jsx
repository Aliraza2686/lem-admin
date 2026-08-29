import { motion } from "framer-motion";
import { FilePlus2, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function ArticleEmptyState({ filtered }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel flex flex-col items-center justify-center rounded-2xl border-dashed px-6 py-20 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary shadow-glow-sm">
        {filtered ? <SearchX className="size-8" /> : <FilePlus2 className="size-8" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {filtered ? "No articles match your filters" : "No articles yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        {filtered
          ? "Try adjusting or clearing your search and filters to see more results."
          : "Get started by writing your first article for the blog."}
      </p>
      {!filtered && (
        <Link to="/articles/new" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover">
          <FilePlus2 className="size-4" />
          Write your first article
        </Link>
      )}
    </motion.div>
  );
}
