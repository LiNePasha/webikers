'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import DealProductCard from '@/components/products/DealProductCard'
import { Product } from '@/types'
import { useVendorCategoriesStore } from '@/store/vendorCategoriesStore'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'

export default function DealsPage() {
  const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
  const VENDOR_NAME = process.env.NEXT_PUBLIC_VENDOR_NAME || 'WeBikers'
  
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([]) // All sale products
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'discount' | 'price_low' | 'price_high'>('discount')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 })
  const [totalPages, setTotalPages] = useState(1)
  
  const { categories, isLoading: categoriesLoading, fetchVendorCategories } = useVendorCategoriesStore()
  
  // Filter categories to only show those with sale products
  const categoriesWithDeals = categories.filter(cat => 
    allProducts.some(product => 
      product.categories?.some(pCat => pCat.id === cat.id)
    )
  )

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          hours = 23
          minutes = 59
          seconds = 59
        }
        
        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load categories
  useEffect(() => {
    fetchVendorCategories(VENDOR_ID)
  }, [fetchVendorCategories])

  // Load sale products - Fetch ALL pages at once
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setLoading(true)
        
        // First request to get total pages
        const firstPageData = await wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, {
          on_sale: true,
          per_page: 50,
          page: 1
        })
        
        const totalPages = firstPageData.pagination?.total_pages || 1
        let allProductsData = firstPageData.products || []
        
        // If there are more pages, fetch them all in parallel
        if (totalPages > 1) {
          const pagePromises = []
          for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(
              wooCommerceAPI.getEnhancedStoreProducts(VENDOR_ID, {
                on_sale: true,
                per_page: 50,
                page: page
              })
            )
          }
          
          // Wait for all pages to load
          const pagesData = await Promise.all(pagePromises)
          
          // Merge all products
          pagesData.forEach(data => {
            if (data.products) {
              allProductsData = [...allProductsData, ...data.products]
            }
          })
        }
        
        // Store pagination info
        setTotalPages(totalPages)
        
        // Store all products for category filtering
        setAllProducts(allProductsData)
        
        // Filter by category if selected
        let productsData = allProductsData
        if (selectedCategory) {
          productsData = allProductsData.filter((product: Product) => 
            product.categories?.some((cat: any) => cat.id === selectedCategory)
          )
        }
        
        // Sort products
        if (sortBy === 'discount') {
          productsData = productsData.sort((a: Product, b: Product) => {
            const discountA = a.regular_price && a.sale_price 
              ? ((parseFloat(a.regular_price) - parseFloat(a.sale_price)) / parseFloat(a.regular_price)) * 100
              : 0
            const discountB = b.regular_price && b.sale_price
              ? ((parseFloat(b.regular_price) - parseFloat(b.sale_price)) / parseFloat(b.regular_price)) * 100
              : 0
            return discountB - discountA
          })
        } else if (sortBy === 'price_low') {
          productsData = productsData.sort((a: Product, b: Product) => 
            parseFloat(a.sale_price || a.price) - parseFloat(b.sale_price || b.price)
          )
        } else if (sortBy === 'price_high') {
          productsData = productsData.sort((a: Product, b: Product) => 
            parseFloat(b.sale_price || b.price) - parseFloat(a.sale_price || a.price)
          )
        }
        
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading sale products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllProducts()
  }, [VENDOR_ID, sortBy])

  // Calculate total savings
  const totalSavings = products.reduce((sum, product) => {
    if (product.regular_price && product.sale_price) {
      return sum + (parseFloat(product.regular_price) - parseFloat(product.sale_price))
    }
    return sum
  }, 0)

  // Floating fire emoji animation
  const FloatingFire = ({ delay }: { delay: number }) => (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: -100, 
        opacity: [0, 1, 1, 0],
        x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0]
      }}
      transition={{ 
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute text-4xl pointer-events-none"
      style={{ left: `${Math.random() * 100}%` }}
    >
      🔥
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Floating Fire Animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingFire key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* Hero Section - Ultra Premium */}
      <section className="relative overflow-hidden">
        {/* Animated Background Gradient */}
        <motion.div
          animate={{
            background: [
              'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #F59E0B 100%)',
              'linear-gradient(135deg, #EA580C 0%, #F59E0B 50%, #DC2626 100%)',
              'linear-gradient(135deg, #F59E0B 0%, #DC2626 50%, #EA580C 100%)',
              'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #F59E0B 100%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="container relative px-4 py-6 mx-auto md:py-12 max-w-7xl sm:px-6 lg:px-8">
          {/* Badge with Countdown */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4 md:mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-60"
              />
              <div className="relative flex items-center gap-3 px-4 py-2 text-xs font-black text-red-900 bg-yellow-400 border-2 border-yellow-300 rounded-full shadow-2xl md:px-6 md:py-3 md:text-sm md:border-4">
                <span>⏰ العرض ينتهي بعد:</span>
                <div className="flex gap-1.5 md:gap-2">
                  {[
                    { value: timeLeft.hours, label: 'س' },
                    { value: timeLeft.minutes, label: 'د' },
                    { value: timeLeft.seconds, label: 'ث' }
                  ].map((item, idx) => (
                    <div key={item.label} className="flex items-center gap-0.5">
                      <motion.div
                        key={item.value}
                        initial={{ rotateX: -90 }}
                        animate={{ rotateX: 0 }}
                        className="relative flex items-center justify-center text-xs font-black text-white bg-red-600 rounded-md w-7 h-7 md:w-9 md:h-9 md:text-sm"
                      >
                        {String(item.value).padStart(2, '0')}
                      </motion.div>
                      <span className="text-[10px] md:text-xs font-bold">{item.label}</span>
                      {idx < 2 && <span className="mx-0.5 text-red-900">:</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-3xl font-black text-center text-white md:mb-4 md:text-5xl lg:text-7xl"
            style={{
              textShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 60px rgba(255,255,255,0.3)'
            }}
          >
            خصومات تصل إلى
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="block mt-1 text-yellow-300 md:mt-2"
            >
              70% 🎉
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          {/* <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 text-sm font-bold text-center md:mb-8 md:text-xl lg:text-2xl text-white/95"
            style={{ textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}
          >
            وفر حتى <span className="text-yellow-300">{totalSavings.toFixed(0)} جنيه</span> على مشترياتك!
          </motion.p> */}
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-16 md:h-24">
            <motion.path
              animate={{
                d: [
                  'M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z',
                  'M0,80L80,74.7C160,69,320,59,480,64C640,69,800,91,960,96C1120,101,1280,91,1360,85.3L1440,80L1440,120L0,120Z',
                  'M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z',
                ]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              fill="#FEF3C7"
            />
          </svg>
        </div>
      </section>

      {/* Filters & Sort Bar */}
      <section className="sticky z-40 border-orange-300 shadow-lg top-16 bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 border-y-2">
        <div className="container px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Category Filter Pills - Only categories with deals */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                🔥 الكل ({allProducts.length})
              </motion.button>
              
              {categoriesWithDeals.slice(0, 6).map((cat) => {
                const categoryProductsCount = allProducts.filter(p => 
                  p.categories?.some(pCat => pCat.id === cat.id)
                ).length
                
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {cat.name} ({categoryProductsCount})
                  </motion.button>
                )
              })}
            </div>

            {/* Sort Options */}
            <div className="hidden gap-2 md:flex">
              {[
                { value: 'discount', label: '🏆 أعلى خصم', icon: '📉' },
                { value: 'price_low', label: '💵 الأرخص', icon: '⬇️' },
                { value: 'price_high', label: '💎 الأغلى', icon: '⬆️' }
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy(option.value as any)}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all ${
                    sortBy === option.value
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="hidden md:inline">{option.label}</span>
                  <span className="md:hidden">{option.icon}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Savings Banner */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"
      >
        <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 text-center">
            <motion.span
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              className="text-3xl"
            >
              💰
            </motion.span>
            <p className="text-lg font-black text-white md:text-xl">
              عملاؤنا وفروا <span className="text-yellow-900">{totalSavings.toFixed(0)} جنيه</span> من هذه العروض!
            </p>
            <motion.span
              animate={{ rotate: [0, -20, 20, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              className="text-3xl"
            >
              🎁
            </motion.span>
          </div>
        </div>
      </motion.section>

      {/* Products Grid */}
      <section className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-6">
            {/* Loading Message */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 text-center bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl"
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
                بنجيب لك أفضل {totalPages > 0 ? `الـ ${totalPages} صفحة` : 'العروض'} 🎉
              </p>
            </motion.div>
            
            {/* Loading Skeletons */}
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white h-96 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="mb-4 text-6xl">😢</div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">لا توجد عروض حالياً</h3>
            <p className="mb-6 text-gray-600">تابعنا لتصلك أحدث العروض والخصومات</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-white transition-transform bg-gradient-to-r from-red-600 to-orange-600 rounded-xl hover:scale-105"
            >
              تصفح جميع المنتجات
              <span>→</span>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Products Count & Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden mb-8 md:block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-1 text-3xl font-black text-gray-900">
                    العروض الساخنة 🔥
                  </h2>
                  <p className="text-gray-600">
                    {products.length} منتج • وفر حتى {totalSavings.toFixed(0)} جنيه
                  </p>
                </div>
                
                {/* View Toggle */}
                <Link
                  href="/products?on_sale=true"
                  className="px-4 py-2 text-sm font-semibold text-red-600 transition-all bg-white border-2 border-red-200 rounded-xl hover:bg-red-50"
                >
                  عرض الكل
                </Link>
              </div>
            </motion.div>

            {/* Products Grid with Stagger Animation */}
            <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => {
                // Calculate discount percentage and savings
                const discount = product.regular_price && product.sale_price
                  ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100)
                  : 0
                
                const savings = product.regular_price && product.sale_price
                  ? parseFloat(product.regular_price) - parseFloat(product.sale_price)
                  : 0

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Discount Badge - Floating */}
                    {discount > 0 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        className="absolute z-30 -top-3 -right-3"
                      >
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-70"
                          />
                          <div className="relative w-16 h-16 md:w-20 md:h-20">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-orange-500"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                              <span className="text-xs font-bold">خصم</span>
                              <span className="text-xl font-black md:text-2xl">-{discount}%</span>
                            </div>
                            {/* Sparkles */}
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0"
                            >
                              <span className="absolute top-0 right-0 text-xs">✨</span>
                              <span className="absolute bottom-0 left-0 text-xs">✨</span>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Deal Product Card */}
                    <DealProductCard 
                      product={product} 
                      discount={discount}
                      savings={savings}
                    />
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600">
        <div className="container px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-4xl font-black text-white">
              لا تفوت هذه الفرصة! 🎯
            </h2>
            <p className="mb-8 text-xl text-white/90">
              عروض محدودة على أفضل قطع الغيار الأصلية
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-black text-red-600 transition-transform bg-white rounded-full shadow-2xl hover:scale-110"
            >
              <span>تصفح جميع المنتجات</span>
              <span className="text-2xl">🛒</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
