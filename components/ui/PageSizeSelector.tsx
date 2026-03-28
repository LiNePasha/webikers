'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Grid3x3 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface PageSizeSelectorProps {
  perPage: number
  onChange: (perPage: number) => void
  options?: number[]
  loading?: boolean
  className?: string
}

export default function PageSizeSelector({
  perPage,
  onChange,
  options = [12, 24, 36, 48],
  loading = false,
  className = '',
}: PageSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (value: number) => {
    if (!loading && value !== perPage) {
      onChange(value)
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`
          flex items-center gap-2 px-4 py-2.5
          bg-white border-2 border-gray-200
          rounded-xl font-medium text-sm
          transition-all duration-200
          ${
            loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
          }
          ${isOpen ? 'border-blue-500 bg-blue-50 shadow-md' : ''}
        `}
        aria-label="اختر عدد المنتجات"
        aria-expanded={isOpen}
      >
        <Grid3x3 className="w-4 h-4 text-blue-600" />
        <span className="text-gray-700">
          <span className="hidden sm:inline">عرض </span>
          <span className="font-bold text-blue-600">{perPage}</span>
          <span className="hidden sm:inline"> منتج</span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 min-w-[180px]"
          >
            <div className="bg-white rounded-xl shadow-xl border-2 border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  عدد المنتجات لكل صفحة
                </p>
              </div>

              {/* Options */}
              <div className="py-1">
                {options.map((option, index) => {
                  const isSelected = option === perPage
                  
                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      onClick={() => handleSelect(option)}
                      className={`
                        w-full px-4 py-2.5
                        flex items-center justify-between
                        transition-all duration-200
                        ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <Grid3x3 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                        <span className="font-medium">{option} منتج</span>
                      </span>
                      
                      {/* Selected Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer Hint */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  العدد الأكبر = تحميل أسرع 🚀
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
