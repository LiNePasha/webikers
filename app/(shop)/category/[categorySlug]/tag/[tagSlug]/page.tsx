'use client'

import { useState, use, useEffect } from 'react'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import ProductCard from '@/components/products/ProductCard'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface CategoryTagPageProps {
  params: Promise<{
    categorySlug: string
    tagSlug: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function CategoryTagPage({ params, searchParams }: CategoryTagPageProps) {
  const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  const { categorySlug, tagSlug } = resolvedParams
  
  const [storeData, setStoreData] = useState<any>(null)
  const [category, setCategory] = useState<any>(null)
  const [tagData, setTagData] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)

  const page = parseInt(resolvedSearchParams.page as string) || 1
  const sort = (resolvedSearchParams.sort as string) || 'date'

  // Load store and category data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load store data
        const store = await wooCommerceAPI.getEnhancedStore(VENDOR_ID)
        setStoreData(store)

        // Load categories to find the selected one
        const categories = await wooCommerceAPI.getEnhancedStoreCategories(VENDOR_ID)
        const foundCategory = categories.find((cat: any) => cat.slug === categorySlug)
        
        if (!foundCategory) {
          throw new Error('Category not found')
        }
        
        setCategory(foundCategory)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [VENDOR_ID, categorySlug])

  // Load products with tag filter
  useEffect(() => {
    const loadProducts = async () => {
      if (!storeData || !category) return

      try {
        setProductsLoading(true)
        
        console.log('🏷️ Loading category tag products:', { vendorId: VENDOR_ID, categoryId: category.id, tagSlug, page, sort })
        
        // Call the store category tag products API
        const response = await fetch(
          `/api/store-category-tag-products/${VENDOR_ID}/${category.id}/${encodeURIComponent(tagSlug)}?page=${page}&per_page=24&sort=${sort}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        
        console.log('✅ Category tag products loaded:', data)
        
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
  }, [storeData, category, tagSlug, page, sort, VENDOR_ID])

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

  if (!storeData || !category) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md p-12 mx-4 text-center bg-white border shadow-2xl rounded-3xl border-red-200/50"
        >
          <div className="mb-6 text-8xl">😔</div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            الصفحة غير موجودة
          </h2>
          <p className="mb-6 text-gray-600">
            التصنيف أو الوسم المطلوب غير متاح
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl"
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
      <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-sm border-gray-200/50">
        <div className="container px-4 py-4 mx-auto">
          <Breadcrumbs 
            items={[
              { label: 'الرئيسية', href: '/' },
              { label: category.name, href: `/category/${categorySlug}` },
              { label: `🏷️ ${tagData?.name || decodeURIComponent(tagSlug)}`, current: true }
            ]}
          />
        </div>
      </div>

      {/* Tag Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b shadow-lg"
      >
        <div className="container flex items-center justify-between px-4 py-8 mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 text-2xl text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl">
              🏷️
            </div>
            <div className="flex-1">
              <p className="mb-1 text-sm text-gray-600">{category.name}</p>
              <h1 className="mb-1 text-3xl font-bold text-gray-900">
                {tagData?.name || decodeURIComponent(tagSlug)}
              </h1>
              <p className="text-gray-600">
                {productsLoading ? 'جاري التحميل...' : `${pagination.total || products.length} منتج في هذا التصنيف`}
              </p>
            </div>
          </div>
          <Link
              href={`/category/${categorySlug}`}
              className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
              title="الرجوع للتصنيف السابق"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="container px-4 py-8 mx-auto">
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white h-80 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center bg-white border shadow-xl rounded-3xl border-gray-200/50"
          >
            <div className="mb-6 text-8xl">📦</div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              لا توجد منتجات
            </h2>
            <p className="mb-6 text-gray-600">
              لا توجد منتجات بهذا الوسم في التصنيف حالياً
            </p>
            <Link
              href={`/category/${categorySlug}`}
              className="inline-block px-8 py-3 text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl"
            >
              عرض جميع منتجات {category.name}
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
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
              <div className="flex justify-center gap-2 mt-12">
                {page > 1 && (
                  <Link
                    href={`/category/${categorySlug}/tag/${tagSlug}?page=${page - 1}&sort=${sort}`}
                    className="px-6 py-3 text-gray-700 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    السابق
                  </Link>
                )}
                
                <div className="px-6 py-3 font-medium text-white bg-brand-500 rounded-xl">
                  صفحة {page} من {pagination.total_pages}
                </div>

                {pagination.has_more && (
                  <Link
                    href={`/category/${categorySlug}/tag/${tagSlug}?page=${page + 1}&sort=${sort}`}
                    className="px-6 py-3 text-gray-700 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
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
