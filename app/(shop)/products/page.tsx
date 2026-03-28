'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import ProductCard from '@/components/products/ProductCard'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import StoreCategoriesSticky from '@/components/stores/StoreCategoriesSticky'
import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { Product, ProductSortOptions, ProductFilters } from '@/types'
import { useVendorCategoriesStore } from '@/store/vendorCategoriesStore'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ProductsPageProps {
  searchParams?: Promise<{
    page?: string
    sort?: string
    in_stock?: string
    on_sale?: string
    search?: string
  }>
}

function ProductsContent({ searchParams }: ProductsPageProps) {
  const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
  const VENDOR_NAME = process.env.NEXT_PUBLIC_VENDOR_NAME || 'WeBikers'
  
  const router = useRouter()
  const pathname = usePathname()
  const urlSearchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [storeLoading, setStoreLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(urlSearchParams.get('search') || '')
  const isInitialMount = useRef(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // Zustand store for vendor categories
  const { categories, isLoading: categoriesLoading, fetchVendorCategories } = useVendorCategoriesStore()
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 24,
    total: 0,
    total_pages: 0,
    has_more: false
  })

  // Initialize filters from URL
  const [productFilters, setProductFilters] = useState<ProductFilters>({
    page: parseInt(urlSearchParams.get('page') || '1'),
    per_page: 24,
    sort: (urlSearchParams.get('sort') || 'date') as ProductSortOptions,
    in_stock: urlSearchParams.get('in_stock') === 'true' || undefined,
    on_sale: urlSearchParams.get('on_sale') === 'true' || undefined,
    search: urlSearchParams.get('search') || undefined
  })

  // Update filters when URL search params change
  useEffect(() => {
    const newFilters = {
      page: parseInt(urlSearchParams.get('page') || '1'),
      per_page: 24,
      sort: (urlSearchParams.get('sort') || 'date') as ProductSortOptions,
      in_stock: urlSearchParams.get('in_stock') === 'true' || undefined,
      on_sale: urlSearchParams.get('on_sale') === 'true' || undefined,
      search: urlSearchParams.get('search') || undefined
    }
    
    setProductFilters(newFilters)
    
    // Update search query from URL if present and different
    const urlSearch = urlSearchParams.get('search') || ''
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [urlSearchParams])

  // Search with debounce - Update filters state and URL (only for user input)
  useEffect(() => {
    // Skip on initial mount to prevent clearing URL search params
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    const debounceTimer = setTimeout(() => {
      const searchValue = searchQuery.trim() || undefined
      console.log('🔍 Setting search filter:', searchValue)
      
      // Check current URL search param
      const currentParams = new URLSearchParams(window.location.search)
      const currentSearch = currentParams.get('search') || undefined
      
      // Only update URL if search value actually changed
      if (currentSearch !== searchValue) {
        const params = new URLSearchParams(window.location.search)
        if (searchValue) {
          params.set('search', searchValue)
        } else {
          params.delete('search')
        }
        params.set('page', '1') // Reset to page 1 on search
        
        const newUrl = `${pathname}?${params.toString()}`
        router.push(newUrl, { scroll: false })
      }
      
      setProductFilters(prev => ({
        ...prev,
        search: searchValue,
        page: 1
      }))
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, router, pathname])

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
    
    // Update URL to remove search param
    const params = new URLSearchParams(window.location.search)
    params.delete('search')
    params.set('page', '1')
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl, { scroll: false })
    
    setProductFilters(prev => ({
      ...prev,
      search: undefined,
      page: 1
    }))
  }

  // Load categories from store
  useEffect(() => {
    fetchVendorCategories(VENDOR_ID)
    setStoreLoading(false)
  }, [fetchVendorCategories])

  // Load products - يدعم Load More
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true)
        setProductsError(null)
        
        const filters = selectedCategory 
          ? { ...productFilters, category: selectedCategory.toString() }
          : productFilters
        
        console.log('📦 Loading products with filters:', JSON.stringify(filters, null, 2))
        
        // If on_sale filter is active, fetch ALL pages
        if (filters.on_sale) {
          const firstPageData = await wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, {
            ...filters,
            per_page: 50,
            page: 1
          })
          
          const totalPages = firstPageData.pagination?.total_pages || 1
          let allProductsData = firstPageData.products || []
          
          if (totalPages > 1) {
            const pagePromises = []
            for (let page = 2; page <= totalPages; page++) {
              pagePromises.push(
                wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, {
                  ...filters,
                  per_page: 50,
                  page: page
                })
              )
            }
            
            const pagesData = await Promise.all(pagePromises)
            pagesData.forEach(data => {
              if (data.products) {
                allProductsData = [...allProductsData, ...data.products]
              }
            })
          }
          
          setProducts(allProductsData)
          setPagination({
            page: 1,
            per_page: allProductsData.length,
            total: allProductsData.length,
            total_pages: 1,
            has_more: false
          })
        } else {
          // Load More: إذا الصفحة 1، نستبدل المنتجات - غير كده نضيف للموجود
          const data = await wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, filters)
          
          if (productFilters.page === 1) {
            // صفحة أولى: استبدال المنتجات
            setProducts(data.products || [])
          } else {
            // تحميل المزيد: إضافة للموجود
            setProducts(prev => [...prev, ...(data.products || [])])
          }
          
          setPagination({
            page: data.pagination?.page || productFilters.page,
            per_page: data.pagination?.per_page || 24,
            total: data.pagination?.total || 0,
            total_pages: data.pagination?.total_pages || 0,
            has_more: data.pagination?.has_more || false
          })
        }
      } catch (error: any) {
        console.error('Error loading products:', error)
        setProductsError(error.message || 'فشل تحميل المنتجات')
      } finally {
        setProductsLoading(false)
        setIsLoadingMore(false)
      }
    }

    loadProducts()
  }, [VENDOR_ID, selectedCategory, productFilters])

  // تحميل المزيد من المنتجات
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && pagination.has_more) {
      setIsLoadingMore(true)
      updateProductFilters({ page: pagination.page + 1 })
    }
  }, [isLoadingMore, pagination.has_more, pagination.page])

  // Update filters helper
  const updateProductFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setProductFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId)
    updateProductFilters({ page: 1 })
  }, [updateProductFilters])

  const currentCategory = categories.find(cat => cat.id === selectedCategory)

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto">
          <div className="space-y-8 animate-pulse">
            <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
            <div className="p-8 bg-white rounded-3xl">
              <div className="w-1/4 h-6 mb-4 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-2xl h-80"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Breadcrumbs */}
      <div className="border-b bg-white/90 backdrop-blur-sm border-gray-200/50">
        <div className="container px-4 py-4 mx-auto">
          <Breadcrumbs 
            items={[
              { label: 'الرئيسية', href: '/' },
              { label: currentCategory ? currentCategory.name : 'جميع المنتجات', current: true }
            ]}
          />
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto">
        
        {/* Mobile Categories - Horizontal Scroll - STICKY */}
        <div className="mb-8 xl:hidden">
          <StoreCategoriesSticky
            categories={categories.map(cat => ({
              id: cat.id,
              name: cat.name || '',
              slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
              description: cat.description || '',
              parent: cat.parent || 0,
              image: cat.image || '',
              count: cat.product_count || cat.count || 0
            }))}
            loading={categoriesLoading}
            storeSlug="category"
            showAsLinks={true}
            storeName={VENDOR_NAME}
            totalProducts={pagination.total || 0}
            viewMode="horizontal"
            selectedCategory={selectedCategory}
          />
        </div>

        <div className="flex flex-col gap-8 xl:flex-row">
          
          {/* Desktop Categories Sidebar - STICKY */}
          <div className="hidden xl:block xl:w-80">
            <div className="sticky top-24">
              <StoreCategoriesSticky
                categories={categories.map(cat => ({
                  id: cat.id,
                  name: cat.name || '',
                  slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
                  description: cat.description || '',
                  parent: cat.parent || 0,
                  image: cat.image || '',
                  count: cat.product_count || cat.count || 0
                }))}
                loading={categoriesLoading}
                storeSlug="category"
                showAsLinks={true}
                storeName={VENDOR_NAME}
                totalProducts={pagination.total || 0}
                viewMode="sidebar"
                selectedCategory={selectedCategory}
              />
            </div>
          </div>

          {/* Products Content */}
          <div className="flex-1">
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في جميع المنتجات (اسم المنتج، رقم القطعة، الوصف...)"
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
                {(searchQuery || productFilters.search) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 text-center"
                  >
                    <p className="text-sm text-gray-600">
                      {productsLoading ? (
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
                              تم العثور على <span className="font-bold text-brand-600">{pagination.total || products.length}</span> منتج 
                              {' '}للبحث "<span className="font-semibold">{searchQuery || productFilters.search}</span>"
                            </>
                          ) : (
                            <>
                              لم يتم العثور على نتائج للبحث "<span className="font-semibold">{searchQuery || productFilters.search}</span>"
                            </>
                          )}
                        </span>
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Enhanced Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50"
            >
              <div className="p-6">
                <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-center">
                  
                  {/* Title & Count */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 text-xl text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl">
                      🛍️
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentCategory ? currentCategory.name : 'جميع المنتجات'}
                      </h2>
                      <p className="text-gray-600">
                        {productsLoading ? 'جاري التحميل...' : `${pagination.total || products.length} منتج متاح`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:justify-start">
                    {/* Sort Filter */}
                    {/* <select
                      value={productFilters.sort}
                      dir='ltr'
                      onChange={(e) => updateProductFilters({ sort: e.target.value as ProductSortOptions, page: 1 })}
                      className="w-auto p-2 text-sm bg-white border border-gray-200 shadow-sm sm:p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    >
                      <option value="date">🕒 الأحدث</option>
                      <option value="popularity">🔥 الأكثر مبيعاً</option>
                      <option value="rating">⭐ الأعلى تقييماً</option>
                      <option value="price">💰 السعر: الأقل أولاً</option>
                      <option value="price-desc">💎 السعر: الأعلى أولاً</option>
                    </select> */}

                    {/* Stock Filter */}
                    <button
                      onClick={() => updateProductFilters({ 
                        in_stock: productFilters.in_stock ? undefined : true, 
                        page: 1 
                      })}
                      className={`px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl transition-all duration-300 border font-medium ${
                        productFilters.in_stock
                          ? 'bg-green-500 text-white border-green-500 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-300'
                      }`}
                    >
                      ✅ متوفر
                    </button>

                    {/* On Sale Filter */}
                    <button
                      onClick={() => updateProductFilters({ 
                        on_sale: productFilters.on_sale ? undefined : true, 
                        page: 1 
                      })}
                      className={`px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-xl transition-all duration-300 border font-medium ${
                        productFilters.on_sale
                          ? 'bg-red-500 text-white border-red-500 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:border-red-300'
                      }`}
                    >
                      🔥 العروض
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            {productsLoading && products.length === 0 ? (
              <div className="space-y-6">
                {/* Loading Message for On Sale */}
                {productFilters.on_sale && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 text-center bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-3 text-5xl"
                    >
                      🔥
                    </motion.div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      جاري تحميل كل العروض...
                    </h3>
                    <p className="text-sm text-gray-600">
                      بنجيب لك أفضل العروض من كل الصفحات 🎉
                    </p>
                  </motion.div>
                )}
                
                {/* Loading Skeletons */}
                <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(12)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="overflow-hidden bg-white shadow-lg animate-pulse rounded-2xl"
                    >
                      <div className="h-56 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded-lg"></div>
                        <div className="w-3/4 h-3 bg-gray-200 rounded-lg"></div>
                        <div className="w-1/2 h-6 bg-gray-200 rounded-lg"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : products.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="grid grid-cols-2 gap-6 mb-8 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      <ProductCard
                        product={product}
                        showVendor={false}
                        showQuickView={true}
                        className="overflow-hidden transition-all duration-300 border border-gray-100 shadow-lg hover:shadow-2xl rounded-2xl"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Load More Button - Mobile Friendly */}
                {!productFilters.on_sale && pagination.has_more && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 p-6 bg-white border shadow-xl rounded-3xl border-gray-200/50"
                  >
                    {/* عداد المنتجات */}
                    <div className="text-center">
                      <div className="mb-1 text-lg font-semibold text-gray-900">
                        تم عرض {products.length} من أصل {pagination.total} منتج
                      </div>
                      <div className="text-sm text-gray-500">
                        {pagination.total - products.length} منتج متبقي
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full max-w-md">
                      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(products.length / pagination.total) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-brand-500 to-purple-600"
                        />
                      </div>
                    </div>
                    
                    {/* زر تحميل المزيد */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex items-center justify-center w-full gap-3 px-8 py-4 text-lg font-bold text-white transition-all duration-300 shadow-lg sm:w-auto bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                          <span>جاري التحميل...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span>تحميل المزيد من المنتجات</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 text-center bg-white border shadow-xl rounded-3xl border-gray-200/50"
              >
                <div className="mb-6 text-8xl">📦</div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  لا توجد منتجات
                </h3>
                <p className="max-w-md mx-auto mb-6 text-gray-600">
                  {selectedCategory 
                    ? 'لا توجد منتجات في هذه الفئة حالياً' 
                    : 'لا توجد منتجات متاحة حالياً'
                  }
                </p>
                {selectedCategory && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategorySelect(null)}
                    className="px-8 py-4 font-medium text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 rounded-xl"
                  >
                    عرض جميع المنتجات
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Products Error */}
            {productsError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 border border-red-200 shadow-lg bg-red-50 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="font-semibold text-red-800">خطأ في تحميل المنتجات</h3>
                    <p className="text-red-600">{productsError}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto">
          <div className="space-y-8 animate-pulse">
            <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
            <div className="p-8 bg-white rounded-3xl">
              <div className="w-1/4 h-6 mb-4 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-2xl h-80"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  )
}
