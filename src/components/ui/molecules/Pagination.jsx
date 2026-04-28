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
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md text-sm border transition"
        style={{
          borderColor: '#979797',
          color: currentPage === 1 ? '#979797' : '#b695f8',
          background: '#fff',
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        Prev
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={i} className="px-2 text-[#979797]">
            ...
          </span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className="px-3 py-1 rounded-md text-sm border transition"
            style={{
              borderColor: p === currentPage ? '#b695f8' : '#979797',
              background: p === currentPage ? '#b695f8' : '#fff',
              color: p === currentPage ? '#fff' : '#979797',
            }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md text-sm border transition"
        style={{
          borderColor: '#979797',
          color: currentPage === totalPages ? '#979797' : '#b695f8',
          background: '#fff',
          opacity: currentPage === totalPages ? 0.5 : 1,
        }}
      >
        Next
      </button>
    </div>
  )
}