'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import { Product } from '@/types'

interface FeaturedCategoryProductsProps {
  vendorId: string
  categoryId: number
  categoryName: string
  categorySlug: string
  description: string
  icon: string
  gradient: string
  productsCount?: number
}

export default function FeaturedCategoryProducts({
  vendorId,
  categoryId,
  categoryName,
  categorySlug,
  description,
  icon,
  gradient,
  productsCount = 8
}: FeaturedCategoryProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await wooCommerceAPI.getEnhancedStoreProducts(vendorId, {
          category: categoryId.toString(),
          per_page: productsCount,
          page: 1
        })

        // Add vendor info to products
        const productsWithVendor = (response.products || []).map((product: Product) => ({
          ...product,
          vendor: {
            id: parseInt(vendorId),
            name: product.store?.vendor_display_name || 'المتجر',
            shop_name: product.store?.vendor_shop_name || 'المتجر'
          }
        }))

        setProducts(productsWithVendor)
      } catch (error) {
        console.error('Error fetching category products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [vendorId, categoryId, productsCount])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 300
    const currentScroll = scrollContainerRef.current.scrollLeft
    const newPosition = direction === 'right' 
      ? currentScroll + scrollAmount 
      : currentScroll - scrollAmount

    scrollContainerRef.current.scrollTo({
      left: Math.max(0, newPosition),
      behavior: 'smooth'
    })

    setScrollPosition(Math.max(0, newPosition))
  }

  if (loading) {
    return (
      <section className="py-4 md:py-8">
        <div className="px-3 mx-auto md:px-4 max-w-7xl">
          <div className="w-24 h-5 mb-3 bg-gray-200 rounded animate-pulse md:w-32 md:h-6 md:mb-6"></div>
          <div className="flex gap-2 overflow-hidden md:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 bg-gray-100 w-36 md:w-48 h-52 md:h-64 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-4 md:py-8">
      <div className="px-3 mx-auto md:px-4 max-w-7xl">
        
        {/* Section Header - Compact */}
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-base md:text-2xl`}>
              {icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-white md:text-xl">
                {categoryName}
              </h2>
            </div>
          </div>

          {/* View All Button */}
          <Link
            href={`/category/${categorySlug}`}
            className="px-3 py-1.5 text-xs font-bold text-white transition-colors duration-200 md:px-4 md:py-2 md:text-sm bg-brand-600 hover:bg-brand-700 rounded-lg"
          >
            الكل ←
          </Link>
        </div>

        {/* Products Scroll - Simplified */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide md:gap-3"
          style={{ 
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-36 md:w-48"
            >
              <ProductCard
                product={product}
                showVendor={false}
                showQuickView={false}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
