'use client'

import { useState, use, useEffect } from 'react'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import ProductCard from '@/components/products/ProductCard'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface TagPageProps {
  params: Promise<{
    tagSlug: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function TagPage({ params, searchParams }: TagPageProps) {
  const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  const { tagSlug } = resolvedParams
  
  const [storeData, setStoreData] = useState<any>(null)
  const [tagData, setTagData] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)

  const page = parseInt(resolvedSearchParams.page as string) || 1
  const sort = (resolvedSearchParams.sort as string) || 'date'

  // Load store data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const store = await wooCommerceAPI.getEnhancedStore(VENDOR_ID)
        setStoreData(store)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [VENDOR_ID])

  // Load products with tag filter
  useEffect(() => {
    const loadProducts = async () => {
      if (!storeData) return

      try {
        setProductsLoading(true)
        
        console.log('🏷️ Loading tag products:', { vendorId: VENDOR_ID, tagSlug, page, sort })
        
        // Call the store tag products API
        const response = await fetch(
          `/api/store-tag-products/${VENDOR_ID}/${encodeURIComponent(tagSlug)}?page=${page}&per_page=24&sort=${sort}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        
        console.log('✅ Tag products loaded:', data)
        
        setTagData({
          id: data.tag_id,
          name: data.tag_name,
          slug: data.tag_slug,
        })
        
        // Add vendor info to products
        const productsWithVendor = (data.products || []).map((product: any) => ({
          ...product,
          vendor: {
            id: VENDOR_ID,
            name: storeData.vendor_display_name || storeData.name,
            shop_name: storeData.vendor_shop_name || storeData.name,
          }
        }))
        
        setProducts(productsWithVendor)
        setPagination(data.pagination || {})
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    loadProducts()
  }, [storeData, tagSlug, page, sort, VENDOR_ID])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 mb-4 bg-gray-200 rounded w-60"></div>
          <div className="h-20 mb-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-3xl shadow-2xl border border-red-200/50 p-12 max-w-md mx-4"
        >
          <div className="text-8xl mb-6">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            عذراً، حدث خطأ
          </h2>
          <p className="text-gray-600 mb-6">
            لا يمكن تحميل بيانات المتجر
          </p>
          <Link
            href="/"
            className="bg-gradient-to-r from-brand-500 to-purple-600 text-white px-8 py-3 rounded-xl inline-block"
          >
            العودة للرئيسية
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Breadcrumbs */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs 
            items={[
              { label: 'الرئيسية', href: '/' },
              { label: `🏷️ ${tagData?.name || decodeURIComponent(tagSlug)}`, current: true }
            ]}
          />
        </div>
      </div>

      {/* Tag Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
              🏷️
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {tagData?.name || decodeURIComponent(tagSlug)}
              </h1>
              <p className="text-gray-600">
                {productsLoading ? 'جاري التحميل...' : `${pagination.total || products.length} منتج`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-white rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white rounded-3xl shadow-xl border border-gray-200/50 p-12"
          >
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              لا توجد منتجات
            </h2>
            <p className="text-gray-600 mb-6">
              لا توجد منتجات بهذا الوسم حالياً
            </p>
            <Link
              href="/"
              className="bg-gradient-to-r from-brand-500 to-purple-600 text-white px-8 py-3 rounded-xl inline-block"
            >
              تصفح منتجات أخرى
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/tag/${tagSlug}?page=${page - 1}&sort=${sort}`}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    السابق
                  </Link>
                )}
                
                <div className="bg-brand-500 text-white px-6 py-3 rounded-xl font-medium">
                  صفحة {page} من {pagination.total_pages}
                </div>

                {pagination.has_more && (
                  <Link
                    href={`/tag/${tagSlug}?page=${page + 1}&sort=${sort}`}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    التالي
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
