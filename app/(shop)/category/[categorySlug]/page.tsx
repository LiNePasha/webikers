'use client'

import { useState, use, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import ProductCard from '@/components/products/ProductCard'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import StoreTagsFilter from '@/components/stores/StoreTagsFilter'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string
  }>
}

interface CategoryData {
  id: number
  name: string
  slug: string
  description: string
  image: string | null
  count: number
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
  const resolvedParams = use(params)
  
  const [category, setCategory] = useState<CategoryData | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 24,
    total: 0,
    total_pages: 0,
    has_more: false
  })

  // Debounce search query - بيبحث مباشرة بدون reload
  useEffect(() => {
    if (!category) return

    const debounceTimer = setTimeout(async () => {
      const searchValue = searchQuery.trim()
      
      // لو البحث فاضي ومفيش منتجات، متعملش حاجة
      if (!searchValue && products.length === 0) return
      
      console.log('🔍 Category - Searching for:', searchValue)
      setIsSearching(true)

      try {
        const data = await wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, {
          category: category.id.toString(),
          page: 1,
          per_page: 24,
          search: searchValue || undefined
        })

        setProducts(data.products || [])
        setPagination({
          page: 1,
          per_page: 24,
          total: data.pagination?.total || 0,
          total_pages: data.pagination?.total_pages || 0,
          has_more: data.pagination?.has_more || false
        })
      } catch (err: any) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, category, VENDOR_ID])

  // Load category and initial products (مرة واحدة بس)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all categories to find the current one
        const categories = await wooCommerceAPI.getEnhancedStoreCategories(VENDOR_ID)
        const currentCategory = categories.find(
          cat => cat.slug === resolvedParams.categorySlug
        )

        if (!currentCategory) {
          throw new Error('التصنيف غير موجود')
        }

        setCategory(currentCategory)

        // Get initial products for this category
        const data = await wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, {
          category: currentCategory.id.toString(),
          page: 1,
          per_page: 24
        })

        setProducts(data.products || [])
        setPagination({
          page: 1,
          per_page: 24,
          total: data.pagination?.total || 0,
          total_pages: data.pagination?.total_pages || 0,
          has_more: data.pagination?.has_more || false
        })
      } catch (err: any) {
        console.error('Error loading category data:', err)
        setError(err.message || 'فشل تحميل بيانات التصنيف')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [VENDOR_ID, resolvedParams.categorySlug])

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
  }

  // Load more products
  const loadMoreProducts = async () => {
    if (!category || loadingMore || !pagination.has_more) return

    try {
      setLoadingMore(true)
      
      const nextPage = pagination.page + 1
      const searchParam = searchQuery.trim() || undefined
      
      const data = await wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, {
        category: category.id.toString(),
        page: nextPage,
        per_page: 24,
        search: searchParam
      })

      // Append new products to existing ones
      setProducts(prev => [...prev, ...(data.products || [])])
      setPagination({
        page: nextPage,
        per_page: 24,
        total: data.pagination?.total || 0,
        total_pages: data.pagination?.total_pages || 0,
        has_more: data.pagination?.has_more || false
      })
    } catch (err: any) {
      console.error('Error loading more products:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container px-2 mx-auto">
          <div className="space-y-8 animate-pulse">
            <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
            <div className="p-8 space-y-6 bg-white rounded-3xl">
              <div className="w-1/4 h-6 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-80 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md p-12 mx-4 text-center bg-white border shadow-2xl rounded-3xl border-red-200/50"
        >
          <div className="mb-6 text-8xl">😔</div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            التصنيف غير موجود
          </h2>
          <p className="mb-6 text-gray-600">
            {error || 'التصنيف المطلوب غير متاح'}
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
              { label: category.name, current: true }
            ]}
          />
        </div>
      </div>

      {/* Category Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 shadow-xl"
      >
        <div className="container flex items-center justify-between px-4 py-8 mx-auto text-center">
          <div className="flex items-center gap-4">
            {category.image && (
              <div className="relative w-24 h-24 overflow-hidden bg-gray-100 border-2 border-gray-200 rounded-2xl">
                <OptimizedImage
                  src={category.image}
                  alt={category.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm">
                  <div className="px-2 py-1.5 text-center">
                    <p className="text-[10px] font-bold text-amber-400 tracking-wide">إبراهيم</p>
                    <p className="text-[8px] font-semibold text-white -mt-0.5">شكمان</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p dangerouslySetInnerHTML={{ __html: category.description }} className="hidden text-lg text-gray-600 md:block"></p>
              )}
              <p className="mt-2 text-gray-500">{category.count} منتج متاح</p>
            </div>
          </div>
          <Link
              href="/products"
              className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
              title="الرجوع لجميع المنتجات"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="container px-2 mx-auto">
        
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-brand-500 rounded-full animate-spin border-t-transparent" />
              ) : (
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المنتجات (اسم المنتج، رقم القطعة، الوصف...)"
              className="w-full py-4 pl-12 pr-12 text-gray-900 transition-all duration-200 bg-white border-2 border-gray-200 shadow-sm outline-none rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 hover:shadow-md"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSearch}
                  className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors hover:text-red-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          {/* Search Results Info */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 text-center"
              >
                <p className="text-sm text-gray-600">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري البحث...
                    </span>
                  ) : (
                    <span>
                      {products.length > 0 ? (
                        <>
                          تم العثور على <span className="font-bold text-brand-600">{pagination.total}</span> منتج 
                          {' '}للبحث "<span className="font-semibold">{searchQuery}</span>"
                        </>
                      ) : (
                        <>
                          لم يتم العثور على نتائج للبحث "<span className="font-semibold">{searchQuery}</span>"
                        </>
                      )}
                    </span>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Store Tags Filter */}
        {category && !searchQuery.trim() && (
          <StoreTagsFilter
            vendorId={Number(VENDOR_ID)}
            categoryId={category.id}
            storeSlug="category"
            categorySlug={resolvedParams.categorySlug}
            selectedTag={null}
          />
        )}
        
        {products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center bg-white border shadow-xl rounded-3xl border-gray-200/50"
          >
            <div className="mb-6 text-8xl">{searchQuery ? '🔍' : '📦'}</div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد منتجات'}
            </h2>
            <p className="mb-6 text-gray-600">
              {searchQuery ? (
                <>
                  جرب البحث بكلمات أخرى أو تصفح جميع المنتجات
                </>
              ) : (
                'لا توجد منتجات متاحة في هذا التصنيف حالياً'
              )}
            </p>
            {searchQuery ? (
              <button
                onClick={clearSearch}
                className="inline-block px-8 py-3 text-white transition-all bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl hover:shadow-lg"
              >
                مسح البحث
              </button>
            ) : (
              <Link
                href="/"
                className="inline-block px-8 py-3 text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl"
              >
                تصفح منتجات أخرى
              </Link>
            )}
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

            {/* Load More Button */}
            {pagination.has_more && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 mt-12"
              >
                <button
                  onClick={loadMoreProducts}
                  disabled={loadingMore}
                  className="relative px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري التحميل...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>تحميل المزيد</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </button>
                
                <div className="text-sm text-gray-500">
                  عرض {products.length} من {pagination.total} منتج
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
