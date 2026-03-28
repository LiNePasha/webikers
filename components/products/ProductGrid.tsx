'use client'

import { Product } from '@/types'
import ProductCard from './ProductCard'
import ProductLoader from '@/components/ui/ProductLoader'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  variant?: 'default' | 'compact' | 'featured'
  columns?: 2 | 3 | 4 | 5 | 6
  showVendor?: boolean
  showQuickView?: boolean
  className?: string
  emptyMessage?: string
}

export default function ProductGrid({
  products = [],
  loading = false,
  variant = 'default',
  columns = 4,
  showVendor = true,
  showQuickView = false,
  className = '',
  emptyMessage = 'لم يتم العثور على منتجات'
}: ProductGridProps) {
  
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
  }

  const gapClasses = {
    default: 'gap-6',
    compact: 'gap-4',
    featured: 'gap-8'
  }

  if (loading) {
    return (
      <div className={`grid ${gridClasses[columns]} ${gapClasses[variant]} ${className}`}>
        {Array.from({ length: columns * 3 }).map((_, index) => (
          <ProductLoader key={index} variant={variant} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-600 mb-6">
            جرب البحث بكلمات مختلفة أو تصفح الفئات الأخرى
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            إعادة التحميل
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[variant]} ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          showVendor={showVendor}
          showQuickView={showQuickView}
        />
      ))}
    </div>
  )
}