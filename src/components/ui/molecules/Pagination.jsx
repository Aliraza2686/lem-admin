import { motion } from "framer-motion";
import { cn } from "../../../utillls/common";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []

    const add = (p) => pages.push(p)

    add(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      add(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    if (totalPages > 1) {
      add(totalPages)
    }

    return pages
  }

  const pages = getPages()

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border border-gray-300 px-3 py-1 text-sm text-primary transition duration-150 hover:border-glow/40 hover:text-glow disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:border-gray-300 disabled:hover:text-gray-300"
      >
        Prev
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={i} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={cn(
              "relative rounded-md border px-3 py-1 text-sm transition-colors duration-150",
              p === currentPage ? "border-primary text-white" : "border-gray-300 text-gray-500 hover:border-glow/40 hover:text-glow"
            )}
          >
            {p === currentPage && (
              <motion.span
                layoutId="pagination-active-pill"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 -z-10 rounded-md bg-primary shadow-glow-sm"
              />
            )}
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border border-gray-300 px-3 py-1 text-sm text-primary transition duration-150 hover:border-glow/40 hover:text-glow disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:border-gray-300 disabled:hover:text-gray-300"
      >
        Next
      </button>
    </div>
  )
}
