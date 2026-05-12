'use client'

export default function ScootersPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const windowStart = Math.max(1, page - 2)
  const windowEnd = Math.min(totalPages, page + 2)
  const pages = []

  for (let i = windowStart; i <= windowEnd; i += 1) {
    pages.push(i)
  }

  return (
    <nav aria-label="ترقيم صفحات سوق الإسكوترات" className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-white/15 bg-[#232b3b] px-3 py-2 text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        السابق
      </button>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? 'page' : undefined}
          className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold ${
            pageNumber === page
              ? 'bg-[#f3a028] text-[#181f2a]'
              : 'border border-white/15 bg-[#232b3b] text-gray-200'
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-white/15 bg-[#232b3b] px-3 py-2 text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        التالي
      </button>
    </nav>
  )
}
