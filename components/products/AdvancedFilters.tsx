'use client'

import { useState, useEffect } from 'react'
import { ProductFilters } from '@/types'

interface AdvancedFiltersProps {
  filters: ProductFilters
  onFilterChange: (filters: Partial<ProductFilters>) => void
  products: any[] // For dynamic price ranges
  category?: any
  className?: string
}

export default function AdvancedFilters({
  filters,
  onFilterChange,
  products,
  category,
  className = ''
}: AdvancedFiltersProps) {
  const [priceRange, setPriceRange] = useState({
    min: filters.min_price || '',
    max: filters.max_price || ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Calculate price range from products
  const calculatePriceRange = () => {
    if (!products || products.length === 0) return { min: 0, max: 10000 }
    
    const prices = products.map(p => parseFloat(p.price || '0')).filter(p => p > 0)
    if (prices.length === 0) return { min: 0, max: 10000 }
    
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }

  const productPriceRange = calculatePriceRange()

  // Handle price range changes
  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const newRange = { ...priceRange, [field]: value }
    setPriceRange(newRange)
    
    // Debounced update
    setTimeout(() => {
      onFilterChange({
        min_price: newRange.min ? parseFloat(newRange.min.toString()) : undefined,
        max_price: newRange.max ? parseFloat(newRange.max.toString()) : undefined,
        page: 1 // Reset to first page when filtering
      })
    }, 500)
  }

  // Quick price ranges
  const quickPriceRanges = [
    { label: 'تحت 100 ج.م', min: 0, max: 100 },
    { label: '100 - 500 ج.م', min: 100, max: 500 },
    { label: '500 - 1000 ج.م', min: 500, max: 1000 },
    { label: '1000 - 5000 ج.م', min: 1000, max: 5000 },
    { label: 'فوق 5000 ج.م', min: 5000, max: null }
  ]

  const handleQuickPrice = (min: number, max: number | null) => {
    setPriceRange({
      min: min.toString(),
      max: max ? max.toString() : ''
    })
    onFilterChange({
      min_price: min,
      max_price: max || undefined,
      page: 1
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setPriceRange({ min: '', max: '' })
    onFilterChange({
      min_price: undefined,
      max_price: undefined,
      in_stock: undefined,
      on_sale: undefined,
      featured: undefined,
      page: 1
    })
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">فلاتر المنتجات</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-brand-600 hover:text-brand-700 text-sm font-medium"
        >
          {showAdvanced ? 'إخفاء الفلاتر المتقدمة' : 'إظهار الفلاتر المتقدمة'}
        </button>
      </div>

      {/* Basic Filters */}
      <div className="space-y-4">
        {/* Stock Status */}
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!filters.in_stock}
              onChange={(e) => onFilterChange({ 
                in_stock: e.target.checked || undefined,
                page: 1 
              })}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="mr-2 text-sm">متوفر فقط</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!filters.on_sale}
              onChange={(e) => onFilterChange({ 
                on_sale: e.target.checked || undefined,
                page: 1 
              })}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="mr-2 text-sm">عروض فقط</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!filters.featured}
              onChange={(e) => onFilterChange({ 
                featured: e.target.checked || undefined,
                page: 1 
              })}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="mr-2 text-sm">منتجات مميزة</span>
          </label>
        </div>

        {/* Quick Price Ranges */}
        {products.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نطاق السعر السريع
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPriceRanges.map((range, index) => {
                const isActive = 
                  (priceRange.min === range.min.toString() && 
                   priceRange.max === (range.max?.toString() || ''))
                
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickPrice(range.min, range.max)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
          {/* Custom Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نطاق سعر مخصص
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="من"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="إلى"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>
            {products.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                النطاق المتوفر: {productPriceRange.min} - {productPriceRange.max} ج.م
              </p>
            )}
          </div>

          {/* Additional Info */}
          {category && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                معلومات الفئة
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>الفئة: {category.name}</p>
                <p>عدد المنتجات: {category.count}</p>
                {category.description && (
                  <p>الوصف: {category.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clear Filters */}
      {(filters.min_price || filters.max_price || filters.in_stock || filters.on_sale || filters.featured) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            مسح جميع الفلاتر
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      <div className="mt-4">
        {(filters.min_price || filters.max_price || filters.in_stock || filters.on_sale || filters.featured) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">الفلاتر النشطة:</p>
            <div className="flex flex-wrap gap-1">
              {filters.min_price && (
                <span className="bg-brand-100 text-brand-800 px-2 py-1 rounded-full text-xs">
                  من {filters.min_price} ج.م
                </span>
              )}
              {filters.max_price && (
                <span className="bg-brand-100 text-brand-800 px-2 py-1 rounded-full text-xs">
                  إلى {filters.max_price} ج.م
                </span>
              )}
              {filters.in_stock && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  متوفر
                </span>
              )}
              {filters.on_sale && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  عرض خاص
                </span>
              )}
              {filters.featured && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  مميز
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}