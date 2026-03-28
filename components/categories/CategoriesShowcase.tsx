'use client'

import { useState, useEffect } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { motion, AnimatePresence } from 'framer-motion'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import { Category } from '@/types'
import { useCategoriesStore } from '@/store/categoriesStore'

interface CategoriesShowcaseProps {
  onCategoryClick?: (category: Category) => void
}

export default function CategoriesShowcase({ onCategoryClick }: CategoriesShowcaseProps) {
  // Use global state instead of local state
  const { 
    mainCategories, 
    otherCategories, 
    isLoading, 
    otherCategoriesLoading,
    fetchMainCategories,
    fetchOtherCategories 
  } = useCategoriesStore()
  
  console.log('🎨 CategoriesShowcase render:', {
    mainCategoriesCount: mainCategories.length,
    otherCategoriesCount: otherCategories.length,
    isLoading,
    otherCategoriesLoading
  })
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false)

  // Filter categories to show only those with products
  const categoriesWithProducts = mainCategories.filter(cat => cat.count > 0)
  const otherCategoriesWithProducts = otherCategories.filter(cat => cat.count > 0)

  // Load categories from store (will use cache if available)
  useEffect(() => {
    fetchMainCategories()
    fetchOtherCategories()
  }, []) // Empty dependency - run once on mount

  // Store all subcategories for all main categories
  const [allSubCategories, setAllSubCategories] = useState<Record<number, Category[]>>({})
  const [loadingSubsFor, setLoadingSubsFor] = useState<Record<number, boolean>>({})

  // Load all subcategories for all main categories
  useEffect(() => {
    const loadAllSubcategories = async () => {
      // Only load for categories with products
      const catsToLoad = mainCategories.filter(cat => cat.count > 0 && !allSubCategories[cat.id])
      
      if (catsToLoad.length === 0) return
      
      for (const category of catsToLoad) {
        setLoadingSubsFor(prev => ({ ...prev, [category.id]: true }))
        try {
          const subCats = await wooCommerceAPI.getCategories({ parent: category.id, per_page: 100 })
          const subsWithProducts = subCats.filter(cat => cat.count > 0)
          setAllSubCategories(prev => ({ ...prev, [category.id]: subsWithProducts }))
        } catch (error) {
          console.error(`Error loading subcategories for ${category.name}:`, error)
        } finally {
          setLoadingSubsFor(prev => ({ ...prev, [category.id]: false }))
        }
      }
    }

    if (mainCategories.length > 0) {
      loadAllSubcategories()
    }
  }, [mainCategories.length]) // Only re-run when length changes

  if (isLoading && categoriesWithProducts.length === 0) {
    return (
      <div className="py-4">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <div className="w-64 h-12 mx-auto mb-4 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-6 mx-auto bg-gray-200 rounded-lg w-96 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="p-6 bg-white shadow-lg rounded-2xl animate-pulse">
                <div className="mb-4 bg-gray-200 aspect-square rounded-xl"></div>
                <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Category - sp */}
      <section className="py-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container px-4 mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block mb-2"
            >
              <div className="px-4 py-3 text-sm font-bold text-black border-b">
                ✨ اختار براند ✨ 
              </div>
            </motion.div>
            
            {/* <h2 className="mb-6 text-5xl font-bold text-transparent md:text-6xl bg-gradient-to-r from-gray-900 via-brand-600 to-purple-600 bg-clip-text">
              قطع غيار لجميع الفئات
            </h2> */}
            
            {/* <p className="max-w-3xl mx-auto text-xl leading-relaxed text-gray-600">
              اختر التصنيف المناسب واكتشف مجموعة واسعة من قطع الغيار
            </p> */}
          </motion.div>

          {/* ============================================ */}
          {/* NEW: Each Brand with its Subcategories */}
          {/* ============================================ */}
          <div className="space-y-12">
            {categoriesWithProducts.map((category, categoryIndex) => {
              const subs = allSubCategories[category.id] || []
              const isLoading = loadingSubsFor[category.id]
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="pb-8 border-b border-gray-200 last:border-b-0"
                >
                  {/* Brand Header */}
                  <div className="flex items-center gap-4 mb-6">
                    {/* Brand Image */}
                    <div className="relative w-20 h-20 overflow-hidden bg-white border-4 shadow-lg rounded-2xl border-brand-400">
                      {category.image && typeof category.image === 'object' && category.image.src ? (
                        <OptimizedImage src={category.image.src}
                          alt={category.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : category.image && typeof category.image === 'string' ? (
                        <OptimizedImage src={category.image}
                          alt={category.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-4xl">
                          🏍️
                        </div>
                      )}
                    </div>

                    {/* Brand Info */}
                    <div className="flex-1">
                      <h3 className="mb-1 text-3xl font-bold text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.count} منتج متاح • {subs.length} فئة فرعية
                      </p>
                    </div>

                    {/* View All Button */}
                    <a
                      href={`/products/category/${category.slug}`}
                      className="px-6 py-3 text-sm font-bold text-white transition-all rounded-full bg-gradient-to-r from-brand-500 to-purple-600 hover:shadow-xl hover:scale-105"
                    >
                      عرض الكل →
                    </a>
                  </div>

                  {/* Subcategories Horizontal Scroll */}
                  {isLoading ? (
                    <div className="flex gap-4 pb-4 overflow-x-auto">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-56">
                          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : subs.length > 0 ? (
                    <div className="relative">
                      <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
                        {subs.map((subCategory, index) => (
                          <motion.a
                            key={subCategory.id}
                            href={`/products/category/${subCategory.slug}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -8, scale: 1.05 }}
                            className="flex-shrink-0 w-56 snap-start group"
                          >
                            <div className="relative p-5 transition-all duration-300 border-2 border-gray-200 bg-gradient-to-br from-white to-brand-50 hover:border-brand-400 rounded-2xl hover:shadow-xl">
                              {/* Badge */}
                              <div className="absolute z-10 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg top-3 right-3 bg-gradient-to-r from-brand-500 to-purple-600">
                                {subCategory.count} 📦
                              </div>

                              {/* Subcategory Image */}
                              <div className="relative mb-3 overflow-hidden transition-transform rounded-xl aspect-square group-hover:scale-105">
                                {subCategory.image ? (
                                  <OptimizedImage src={typeof subCategory.image === 'object' ? subCategory.image.src : subCategory.image}
                                    alt={subCategory.name}
                                    fill
                                    className="object-contain p-2"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full text-6xl bg-gradient-to-br from-brand-100 to-purple-100">
                                    🔧
                                  </div>
                                )}
                              </div>

                              {/* Subcategory Info */}
                              <h4 className="mb-2 text-lg font-bold text-center text-gray-900 transition-colors group-hover:text-brand-600 line-clamp-2">
                                {subCategory.name}
                              </h4>
                              
                              <div className="flex items-center justify-center">
                                <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-brand-100 text-brand-700">
                                  {subCategory.count} منتج
                                </span>
                              </div>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                      
                      {/* Scroll Indicator */}
                      {subs.length > 4 && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <svg className="w-4 h-4 animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span>اسحب لرؤية المزيد</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl">
                      <div className="mb-2 text-4xl">📦</div>
                      <p className="text-sm text-gray-600">لا توجد فئات فرعية متاحة</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* ============================================ */}
          {/* OLD: Categories Grid (Commented for backup) */}
          {/* ============================================ */}
          {/* <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categoriesWithProducts.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category)}
                className="cursor-pointer group"
              >
                <div className="relative px-2 py-4 overflow-hidden transition-all duration-300 bg-white border-2 border-transparent shadow-lg rounded-2xl hover:shadow-2xl hover:border-brand-400">
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-brand-50 via-purple-50 to-blue-50 group-hover:opacity-100"></div>
                  
                  <div className="absolute z-10 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg top-3 right-3 bg-gradient-to-r from-brand-500 to-purple-600">
                    {category.count} 📦
                  </div>

                  <div className="relative mb-2 overflow-hidden transition-transform duration-300 aspect-square rounded-xl group-hover:scale-105">
                    {category.image && typeof category.image === 'object' && category.image.src ? (
                      <OptimizedImage src={category.image.src}
                        alt={category.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : category.image && typeof category.image === 'string' ? (
                      <OptimizedImage src={category.image}
                        alt={category.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-6xl transition-transform group-hover:scale-110">
                        🏍️
                      </div>
                    )}
                  </div>

                  <h3 className="relative mb-2 text-lg font-bold text-center text-gray-900 transition-colors group-hover:text-brand-600 line-clamp-2">
                    {category.name}
                  </h3>

                  <div className="relative text-center">
                    <span className="text-sm font-medium text-gray-500 group-hover:text-brand-500">
                      عرض القطع →
                    </span>
                  </div>

                  <div className="absolute w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 -bottom-10 -right-10 bg-gradient-to-br from-brand-200 to-purple-200 group-hover:opacity-20"></div>
                  <div className="absolute w-20 h-20 transition-opacity duration-700 rounded-full opacity-0 -top-10 -left-10 bg-gradient-to-br from-blue-200 to-purple-200 group-hover:opacity-20"></div>
                </div>
              </motion.div>
            ))}
          </div> */}

          {/* Empty State */}
          {categoriesWithProducts.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="mb-6 text-8xl">🏷️</div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">لا توجد تصنيفات متاحة</h3>
              <p className="text-gray-600">الرجاء المحاولة مرة أخرى لاحقاً</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* OLD Modal - Commented for backup */}
      {/* <AnimatePresence>
        {selectedCategory && (
          <motion.div ... Modal content ... </motion.div>
        )}
      </AnimatePresence> */}

      {/* دلع موتوسيكلك - Other Categories Section */}
      {otherCategoriesWithProducts.length > 0 && (
        <section className="relative py-16 overflow-hidden bg-white">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 rounded-full w-96 h-96 bg-gradient-to-br from-pink-400 to-purple-600 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 rounded-full w-96 h-96 bg-gradient-to-tl from-blue-400 to-purple-500 blur-3xl"></div>
          </div>

          <div className="container relative z-10 px-4 mx-auto">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-block mb-4"
              >
                <div className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  <span className="text-2xl">✨</span>
                  <span>دلع موتوسيكلك</span>
                  <span className="text-2xl">🏍️</span>
                </div>
              </motion.div>
              
              <h2 className="hidden mb-4 text-4xl font-bold text-black md:block">
                إكسسوارات ومستلزمات إضافية
              </h2>
              
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                اختر من مجموعتنا المميزة من الإكسسوارات والمستلزمات لتجعل موتوسيكلك أكثر أناقة وراحة
              </p>
            </motion.div>

            {/* Categories Horizontal Scroll */}
            <div className="relative">
              <div className="flex gap-6 pb-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
                {otherCategoriesWithProducts.map((category, index) => (
                  <motion.a
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="flex-shrink-0 w-72 snap-start group"
                  >
                    <div className="relative p-6 overflow-hidden transition-all duration-500 border-2 border-transparent shadow-xl bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl hover:shadow-2xl hover:border-purple-300">
                      {/* Animated Background Effect */}
                      <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 group-hover:opacity-100"></div>
                      
                      {/* Sparkle Effect */}
                      <div className="absolute z-10 text-2xl transition-opacity duration-300 opacity-0 top-4 right-4 group-hover:opacity-100 animate-pulse">
                        ✨
                      </div>
                      
                      {/* Badge with Count */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                        <span>{category.count}</span>
                        <span>🎁</span>
                      </div>

                      {/* Category Image */}
                      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100">
                        {category.image && typeof category.image === 'object' && category.image.src ? (
                          <OptimizedImage src={category.image.src}
                            alt={category.name}
                            fill
                            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                            sizes="288px"
                          />
                        ) : category.image && typeof category.image === 'string' ? (
                          <OptimizedImage src={category.image}
                            alt={category.name}
                            fill
                            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                            sizes="288px"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full transition-transform duration-500 text-7xl group-hover:scale-110">
                            🎨
                          </div>
                        )}
                      </div>

                      {/* Category Info */}
                      <div className="relative text-center">
                        <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-purple-600 line-clamp-2">
                          {category.name}
                        </h3>
                        
                        {category.description && (
                          <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                            {category.description.replace(/<[^>]*>/g, '')}
                          </p>
                        )}

                        {/* CTA Button */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <span className="px-6 py-2 text-sm font-bold text-white transition-shadow rounded-full bg-gradient-to-r from-pink-500 to-purple-600 group-hover:shadow-lg">
                            استكشف الآن
                          </span>
                          <span className="text-purple-600 transition-transform group-hover:translate-x-1">
                            ←
                          </span>
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute w-24 h-24 transition-opacity duration-500 rounded-full opacity-0 -bottom-8 -right-8 bg-gradient-to-br from-pink-300 to-purple-300 group-hover:opacity-30 blur-xl"></div>
                      <div className="absolute w-20 h-20 transition-opacity duration-700 rounded-full opacity-0 -top-8 -left-8 bg-gradient-to-br from-blue-300 to-purple-300 group-hover:opacity-30 blur-xl"></div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Scroll Indicators */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-5 h-5 animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>اسحب لليمين أو اليسار لرؤية المزيد</span>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {otherCategoriesLoading && otherCategoriesWithProducts.length === 0 && (
              <div className="flex gap-6 pb-6 overflow-x-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-72">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-96 animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add custom animation */}
          <style jsx>{`
            @keyframes bounce-horizontal {
              0%, 100% {
                transform: translateX(0);
              }
              50% {
                transform: translateX(10px);
              }
            }
            .animate-bounce-horizontal {
              animation: bounce-horizontal 2s infinite;
            }
            
            /* Hide scrollbar but keep functionality */
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </section>
      )}
    </>
  )
}
