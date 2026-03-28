'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void // Make optional
  loading?: boolean
  showPageNumbers?: number
  className?: string
  basePath?: string
  useLinks?: boolean
  filters?: Record<string, any>
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  showPageNumbers = 3,
  className = '',
  basePath = '/products',
  useLinks = false,
  filters = {}
}: PaginationProps) {
  // Build URL for a page
  const buildPageURL = (page: number) => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'page' && value !== undefined && value !== null && value !== '' && value !== false) {
        params.set(key, String(value))
      }
    })
    
    const queryString = params.toString()
    const path = page === 1 ? basePath : `${basePath}/page/${page}`
    return queryString ? `${path}?${queryString}` : path
  }
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= showPageNumbers + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      // Calculate range around current page
      const start = Math.max(2, currentPage - Math.floor(showPageNumbers / 2))
      const end = Math.min(totalPages - 1, start + showPageNumbers - 1)
      
      // Adjust start if end is at the limit
      const adjustedStart = Math.max(2, Math.min(start, totalPages - showPageNumbers))
      
      // Add ellipsis if needed
      if (adjustedStart > 2) {
        pages.push('...')
      }
      
      // Add page numbers
      for (let i = adjustedStart; i <= end; i++) {
        pages.push(i)
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...')
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || loading) return
    if (onPageChange) {
      onPageChange(page)
    }
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* First Page Button */}
      {useLinks && currentPage !== 1 && !loading ? (
        <Link href={buildPageURL(1)}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md border border-gray-200 transition-all duration-200"
            aria-label="الصفحة الأولى"
          >
            <ChevronsRight className="w-5 h-5" />
          </motion.div>
        </Link>
      ) : (
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || loading}
          className={`
            hidden sm:flex items-center justify-center
            w-10 h-10 rounded-lg
            transition-all duration-200
            ${
              currentPage === 1 || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md border border-gray-200'
            }
          `}
          aria-label="الصفحة الأولى"
        >
          <ChevronsRight className="w-5 h-5" />
        </motion.button>
      )}

      {/* Previous Button */}
      {useLinks && currentPage !== 1 && !loading ? (
        <Link href={buildPageURL(currentPage - 1)}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-3 sm:px-4 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg shadow-md transition-all duration-200 font-medium"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="hidden sm:inline">السابق</span>
          </motion.div>
        </Link>
      ) : (
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`
            flex items-center justify-center gap-1
            px-3 sm:px-4 h-10 rounded-lg
            transition-all duration-200 font-medium
            ${
              currentPage === 1 || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg shadow-md'
            }
          `}
          aria-label="السابق"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="hidden sm:inline">السابق</span>
        </motion.button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1 sm:gap-2">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-400 font-medium select-none"
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <div key={pageNum}>
              {useLinks && !isActive && !loading ? (
                <Link href={buildPageURL(pageNum)}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-10 h-10 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 bg-white text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:shadow-md border border-gray-200 flex items-center justify-center cursor-pointer"
                    aria-label={`صفحة ${pageNum}`}
                  >
                    <span className="relative z-10">{pageNum}</span>
                    
                    {/* Shimmer effect on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                  </motion.div>
                </Link>
              ) : (
                <motion.button
                  whileHover={{ scale: loading || isActive ? 1 : 1.1 }}
                  whileTap={{ scale: loading || isActive ? 1 : 0.9 }}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading || isActive}
                  className={`
                    relative w-10 h-10 rounded-lg
                    font-semibold text-sm sm:text-base
                    transition-all duration-300
                    ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shadow-lg scale-110'
                        : loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:shadow-md border border-gray-200'
                    }
                  `}
                  aria-label={`صفحة ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active page glow effect */}
                  {isActive && (
                    <motion.div
                      layoutId="activePage"
                      className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <span className="relative z-10">{pageNum}</span>
                  
                  {/* Shimmer effect on hover */}
                  {!isActive && !loading && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                  )}
                </motion.button>
              )}
            </div>
          )
        })}
      </div>

      {/* Next Button */}
      {useLinks && currentPage !== totalPages && !loading ? (
        <Link href={buildPageURL(currentPage + 1)}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 px-3 sm:px-4 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg shadow-md transition-all duration-200 font-medium"
            aria-label="التالي"
          >
            <span className="hidden sm:inline">التالي</span>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </Link>
      ) : (
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={`
            flex items-center justify-center gap-1
            px-3 sm:px-4 h-10 rounded-lg
            transition-all duration-200 font-medium
            ${
              currentPage === totalPages || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg shadow-md'
            }
          `}
          aria-label="التالي"
        >
          <span className="hidden sm:inline">التالي</span>
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      )}

      {/* Last Page Button */}
      {useLinks && currentPage !== totalPages && !loading ? (
        <Link href={buildPageURL(totalPages)}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md border border-gray-200 transition-all duration-200"
            aria-label="الصفحة الأخيرة"
          >
            <ChevronsLeft className="w-5 h-5" />
          </motion.div>
        </Link>
      ) : (
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          className={`
            hidden sm:flex items-center justify-center
            w-10 h-10 rounded-lg
            transition-all duration-200
            ${
              currentPage === totalPages || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md border border-gray-200'
            }
          `}
          aria-label="الصفحة الأخيرة"
        >
          <ChevronsLeft className="w-5 h-5" />
        </motion.button>
      )}

      {/* Loading Indicator */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          </div>
        </motion.div>
      )}
    </div>
  )
}
