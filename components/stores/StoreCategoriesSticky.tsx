'use client'

import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parent: number
  image: string
  count: number
}

type CategoryTree = Category & { children: CategoryTree[] }

interface StoreCategoriesProps {
  categories: Category[]
  loading?: boolean
  onCategorySelect?: (categoryId: number | null) => void
  selectedCategory?: number | null
  storeSlug?: string
  showAsLinks?: boolean
  totalProducts?: number
  storeName?: string
  viewMode?: 'sidebar' | 'grid' | 'horizontal'
}

export default function StoreCategoriesSticky({ 
  categories, 
  loading, 
  onCategorySelect, 
  selectedCategory,
  storeSlug,
  showAsLinks = false,
  totalProducts,
  storeName,
  viewMode = 'sidebar'
}: StoreCategoriesProps) {
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set())
  const [mobileExpandedParent, setMobileExpandedParent] = useState<number | null>(null)
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false)

  // Build category tree with special handling for ID 365
  const buildCategoryTree = (): CategoryTree[] => {
    const categoryMap = new Map<number, CategoryTree>()
    
    const validCategories = categories.filter(cat => {
      if (!cat || !cat.id || !cat.name) {
        console.warn('⚠️ Invalid category found:', cat)
        return false
      }
      return true
    })
    
    validCategories.forEach(cat => {
      categoryMap.set(cat.id, { 
        ...cat, 
        children: [],
        count: Number(cat.count) || 0,
        parent: Number(cat.parent) || 0
      })
    })
    
    const rootCategories: CategoryTree[] = []
    validCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)!
      if (cat.parent === 0) {
        rootCategories.push(category)
      } else {
        const parent = categoryMap.get(cat.parent)
        if (parent) {
          parent.children.push(category)
        } else {
          rootCategories.push(category)
        }
      }
    })
    
    // للموبايل: إخفاء "قطع غيار براند" (365) ورفع أولادها
    if (viewMode === 'horizontal') {
      const brandParentId = 365
      const brandParent = categoryMap.get(brandParentId)
      
      if (brandParent && brandParent.children.length > 0) {
        const indexToRemove = rootCategories.findIndex(c => c.id === brandParentId)
        if (indexToRemove !== -1) {
          rootCategories.splice(indexToRemove, 1)
        }
        brandParent.children.forEach(child => {
          rootCategories.push(child)
        })
      }
    }
    
    return rootCategories
  }

  const categoryTree = buildCategoryTree()

  const getTotalCount = (category: CategoryTree): number => {
    const baseCount = Number(category.count) || 0
    
    if (category.children.length === 0) {
      return baseCount
    }
    
    const childrenSum = category.children.reduce((sum, child) => {
      const childCount = getTotalCount(child)
      return sum + (Number.isNaN(childCount) ? 0 : childCount)
    }, 0)
    
    return childrenSum
  }

  const toggleParent = (categoryId: number) => {
    const newExpanded = new Set(expandedParents)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedParents(newExpanded)
  }

  useEffect(() => {
    // Start with all categories collapsed
    setExpandedParents(new Set())
  }, [viewMode])

  if (loading) {
    if (viewMode === 'horizontal') {
      return (
        <div className="border-b border-gray-200 shadow-lg bg-white/95 backdrop-blur-md">
          <div className="container px-4 py-3 mx-auto">
            <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32 h-20 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return null
  }

  // ============ MOBILE HORIZONTAL - STICKY VERSION ============
  if (viewMode === 'horizontal') {
    return (
      <>
        <div className="border-b-2 border-gray-200 shadow-2xl">
          <div className="flex my-3">
            

            {/* Scrollable Categories Container */}
            <div className="flex items-center flex-1 gap-1 overflow-x-auto scrollbar-hide">
              {/* Category Cards */}
              {categoryTree
                .sort((a, b) => getTotalCount(b) - getTotalCount(a))
                .map((rootCat, index) => {
                  const hasChildren = rootCat.children.length > 0
                  const totalCount = getTotalCount(rootCat)

                  const CategoryCard = (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex flex-col items-center flex-shrink-0 w-16 gap-1 pt-1"
                    >
                      {/* Circle Image with Badges Container */}
                      <div className="relative w-12 h-12">
                        <motion.div
                          whileHover={{ scale: 1.1, y: -3 }}
                          whileTap={{ scale: 0.9 }}
                          className={`relative rounded-full overflow-hidden shadow-xl w-full h-full group cursor-pointer ${
                            selectedCategory === rootCat.id ? 'ring-2 ring-brand-500 ring-offset-2' : ''
                          }`}
                        >
                          <div className="absolute inset-0">
                            <OptimizedImage src={rootCat.image || '/images/placeholder-category.jpg'}
                              alt={rootCat.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 group-hover:from-brand-500/40"></div>
                          </div>
                        </motion.div>

                        {/* Count Badge - Top Right */}
                        <div className="absolute z-20 -top-1 -right-1">
                          <motion.div 
                            whileHover={{ scale: 1.15 }}
                            className="bg-gradient-to-br from-white to-gray-100 text-gray-900 px-1.5 py-0.5 rounded-full text-[9px] font-black shadow-lg border-2 border-white"
                          >
                            {totalCount}
                          </motion.div>
                        </div>

                        {/* Children Indicator - Top Left */}
                        {hasChildren && (
                          <div className="absolute z-20 -top-1 -left-1">
                            <motion.div 
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 px-1 py-0.5 rounded-full text-[8px] font-black shadow-lg border-2 border-white"
                            >
                              {rootCat.children.length}+
                            </motion.div>
                          </div>
                        )}
                      </div>

                      {/* Category Name - Below Circle */}
                      <div className="w-full px-0.5 text-center">
                        <h4 className="text-[9px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                          {rootCat.name}
                        </h4>
                      </div>
                    </motion.div>
                  )

                  return showAsLinks && storeSlug ? (
                    <Link 
                      key={rootCat.id}
                      href={hasChildren ? '#' : storeSlug === 'category' ? `/category/${rootCat.slug}` : `/stores/${storeSlug}/category/${rootCat.slug}`}
                      onClick={(e) => {
                        if (hasChildren) {
                          e.preventDefault()
                          setMobileExpandedParent(mobileExpandedParent === rootCat.id ? null : rootCat.id)
                        } else {
                          onCategorySelect?.(rootCat.id)
                        }
                      }}
                    >
                      {CategoryCard}
                    </Link>
                  ) : (
                    <button
                      key={rootCat.id}
                      onClick={() => {
                        onCategorySelect?.(rootCat.id)
                        if (hasChildren) {
                          setMobileExpandedParent(mobileExpandedParent === rootCat.id ? null : rootCat.id)
                        }
                      }}
                    >
                      {CategoryCard}
                    </button>
                  )
                })}
            </div>

            {/* View All Categories Circle - FIXED on Left (الشمال) */}
            <div className="">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 pt-2 w-14"
              >
                <button
                  onClick={() => setShowAllCategoriesModal(true)}
                  className="relative w-12 h-12"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-full h-full overflow-hidden bg-white rounded-full shadow-xl cursor-pointer group bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600"
                  >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600"></div>
                    
                    {/* Animated Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]"></div>
                    
                    {/* Icon */}
                    <div className="relative flex items-center justify-center h-full">
                      <motion.svg 
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 text-white"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </motion.svg>
                    </div>
                  </motion.div>
                </button>

                {/* Text Below Circle */}
                <div className="w-full px-1 text-center">
                  <h4 className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight">
                    الكل
                  </h4>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Expandable Children Panel */}
        <AnimatePresence>
          {mobileExpandedParent && (() => {
            const findCategory = (id: number, cats: CategoryTree[]): CategoryTree | null => {
              for (const cat of cats) {
                if (cat.id === id) return cat
                const found = findCategory(id, cat.children)
                if (found) return found
              }
              return null
            }
            
            const parent = findCategory(mobileExpandedParent, categoryTree)
            if (!parent || parent.children.length === 0) return null
            
            return (
              <motion.div
                key="panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b shadow-inner bg-gradient-to-br from-brand-50 to-purple-50 border-brand-200"
              >
                <div className="container px-4 py-4 mx-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold">
                      <span>📂</span>
                      <span>{parent.name}</span>
                      <span className="text-xs text-gray-500">({parent.children.length})</span>
                    </h4>
                    <button
                      onClick={() => setMobileExpandedParent(null)}
                      className="flex items-center justify-center w-6 h-6 text-xs text-white bg-red-500 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {parent.children
                      .sort((a, b) => getTotalCount(b) - getTotalCount(a))
                      .map((child) => {
                        const childSlug = child.slug || child.name.toLowerCase().replace(/\s+/g, '-')
                        const childHasChildren = child.children.length > 0
                        const childCount = getTotalCount(child)
                        
                        const ChildCard = (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative rounded-xl overflow-hidden shadow-md h-24 ${
                              selectedCategory === child.id ? 'ring-2 ring-brand-500' : ''
                            }`}
                          >
                            <div className="absolute inset-0">
                              <OptimizedImage src={child.image || parent.image || '/images/placeholder-category.jpg'}
                                alt={child.name}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                            </div>

                            <div className="relative flex flex-col justify-between h-full p-2">
                              <div className="flex items-start justify-between">
                                <div className="bg-white/90 text-gray-900 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                  {childCount}
                                </div>
                                {childHasChildren && (
                                  <div className="bg-yellow-400/90 text-gray-900 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                    {child.children.length}+
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-white">
                                <h5 className="text-xs font-bold drop-shadow-lg line-clamp-2">
                                  {child.name}
                                </h5>
                              </div>
                            </div>
                          </motion.div>
                        )

                        return showAsLinks && storeSlug ? (
                          <Link 
                            key={child.id} 
                            href={childHasChildren ? '#' : storeSlug === 'category' ? `/category/${childSlug}` : `/stores/${storeSlug}/category/${childSlug}`}
                            onClick={(e) => {
                              if (childHasChildren) {
                                e.preventDefault()
                                setMobileExpandedParent(child.id)
                              } else {
                                onCategorySelect?.(child.id)
                              }
                            }}
                          >
                            {ChildCard}
                          </Link>
                        ) : (
                          <button
                            key={child.id}
                            onClick={() => {
                              onCategorySelect?.(child.id)
                              if (childHasChildren) {
                                setMobileExpandedParent(child.id)
                              } else {
                                setMobileExpandedParent(null)
                              }
                            }}
                          >
                            {ChildCard}
                          </button>
                        )
                      })}
                  </div>
                </div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

        {/* All Categories Sidebar - Slides from Left */}
        <AnimatePresence>
          {showAllCategoriesModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] bg-black/50 backdrop-blur-sm"
                onClick={() => setShowAllCategoriesModal(false)}
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-[4rem] bottom-0 z-[100001] w-full sm:w-96 bg-white shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex-shrink-0 p-4 text-white bg-gradient-to-r from-brand-600 to-purple-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <div>
                        <h2 className="text-lg font-bold">جميع الفئات</h2>
                        <p className="text-xs text-white/80">{categoryTree.length} فئة رئيسية</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAllCategoriesModal(false)}
                      className="p-2 transition-colors rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Categories List */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {categoryTree
                    .sort((a, b) => {
                      // Category 424 first, then sort by count
                      if (a.id === 424) return -1
                      if (b.id === 424) return 1
                      return getTotalCount(b) - getTotalCount(a)
                    })
                    .map((parentCat) => {
                      const parentCount = getTotalCount(parentCat)
                      const hasChildren = parentCat.children.length > 0

                      return (
                        <div key={parentCat.id} className="space-y-2">
                          {/* Parent Category */}
                          {showAsLinks && storeSlug ? (
                            <Link
                              href={storeSlug === 'category' ? `/category/${parentCat.slug}` : `/stores/${storeSlug}/category/${parentCat.slug}`}
                              onClick={() => setShowAllCategoriesModal(false)}
                              className="flex items-center gap-3 p-3 transition-all rounded-lg bg-gradient-to-r from-brand-50 to-purple-50 hover:from-brand-100 hover:to-purple-100 group"
                            >
                              {/* Image */}
                              <div className="relative flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg">
                                <OptimizedImage
                                  src={parentCat.image || '/images/placeholder-category.jpg'}
                                  alt={parentCat.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate transition-colors group-hover:text-brand-600">
                                  {parentCat.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500">{parentCount} منتج</span>
                                  {hasChildren && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-xs font-semibold text-purple-600">{parentCat.children.length} فئة</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Arrow */}
                              <svg className="flex-shrink-0 w-5 h-5 text-gray-400 transition-colors group-hover:text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </Link>
                          ) : (
                            <button
                              onClick={() => {
                                onCategorySelect?.(parentCat.id)
                                setShowAllCategoriesModal(false)
                              }}
                              className="flex items-center w-full gap-3 p-3 transition-all rounded-lg bg-gradient-to-r from-brand-50 to-purple-50 hover:from-brand-100 hover:to-purple-100 group"
                            >
                              {/* Image */}
                              <div className="relative flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg">
                                <OptimizedImage
                                  src={parentCat.image || '/images/placeholder-category.jpg'}
                                  alt={parentCat.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0 text-right">
                                <h3 className="text-sm font-bold text-gray-900 truncate transition-colors group-hover:text-brand-600">
                                  {parentCat.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5 justify-end">
                                  <span className="text-xs text-gray-500">{parentCount} منتج</span>
                                  {hasChildren && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-xs font-semibold text-purple-600">{parentCat.children.length} فئة</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Arrow */}
                              <svg className="flex-shrink-0 w-5 h-5 text-gray-400 transition-colors group-hover:text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}

                          {/* Children Categories */}
                          {hasChildren && (
                            <div className="flex flex-wrap gap-2">
                              {parentCat.children
                                .sort((a, b) => getTotalCount(b) - getTotalCount(a))
                                .map((childCat) => {
                                  const childCount = getTotalCount(childCat)
                                  const childSlug = childCat.slug || childCat.name.toLowerCase().replace(/\s+/g, '-')

                                  return showAsLinks && storeSlug ? (
                                    <Link
                                      key={childCat.id}
                                      href={storeSlug === 'category' ? `/category/${childSlug}` : `/stores/${storeSlug}/category/${childSlug}`}
                                      onClick={() => setShowAllCategoriesModal(false)}
                                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-all group"
                                    >
                                      {/* Small Image */}
                                      <div className="relative flex-shrink-0 w-6 h-6 overflow-hidden rounded">
                                        <OptimizedImage
                                          src={childCat.image || parentCat.image || '/images/placeholder-category.jpg'}
                                          alt={childCat.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>

                                      {/* Name & Count */}
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-gray-700 transition-colors group-hover:text-brand-600 whitespace-nowrap">
                                          {childCat.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400">({childCount})</span>
                                      </div>
                                    </Link>
                                  ) : (
                                    <button
                                      key={childCat.id}
                                      onClick={() => {
                                        onCategorySelect?.(childCat.id)
                                        setShowAllCategoriesModal(false)
                                      }}
                                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-all group"
                                    >
                                      {/* Small Image */}
                                      <div className="relative flex-shrink-0 w-6 h-6 overflow-hidden rounded">
                                        <OptimizedImage
                                          src={childCat.image || parentCat.image || '/images/placeholder-category.jpg'}
                                          alt={childCat.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>

                                      {/* Name & Count */}
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-gray-700 transition-colors group-hover:text-brand-600 whitespace-nowrap">
                                          {childCat.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400">({childCount})</span>
                                      </div>
                                    </button>
                                  )
                                })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setShowAllCategoriesModal(false)}
                    className="w-full px-4 py-3 font-semibold text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700"
                  >
                    إغلاق
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ============ DESKTOP SIDEBAR - STICKY VERSION ============
  
  const renderTree = (cats: CategoryTree[], level: number = 0) => {
    return cats
      .sort((a, b) => getTotalCount(b) - getTotalCount(a))
      .map((cat) => {
        const categorySlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
        const hasChildren = cat.children.length > 0
        const totalCount = getTotalCount(cat)
        const isExpanded = expandedParents.has(cat.id)

        return (
          <div key={cat.id} className="space-y-1">
            {showAsLinks && storeSlug ? (
              <Link
                href={hasChildren ? '#' : storeSlug === 'category' ? `/category/${categorySlug}` : `/stores/${storeSlug}/category/${categorySlug}`}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault()
                    toggleParent(cat.id)
                  } else {
                    onCategorySelect?.(cat.id)
                  }
                }}
                className={`w-full flex items-center gap-2 p-2 rounded-lg group transition-all duration-200 ${
                  selectedCategory === cat.id 
                    ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                style={{ marginRight: level * 12 }}
              >
                <div className={`relative rounded-lg overflow-hidden flex-shrink-0 shadow-sm ${
                  level === 0 ? 'w-10 h-10' : 'w-8 h-8'
                }`}>
                  <OptimizedImage src={cat.image || '/images/placeholder-category.jpg'}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className={`font-medium flex-1 line-clamp-1 ${level > 0 ? 'text-sm' : ''}`}>
                  {cat.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                    {totalCount}
                  </span>
                  {hasChildren && (
                    <span className={`text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      🔽
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <button
                onClick={() => {
                  onCategorySelect?.(cat.id)
                  if (hasChildren) {
                    toggleParent(cat.id)
                  }
                }}
                className={`w-full flex items-center gap-2 p-2 rounded-lg group transition-all duration-200 ${
                  selectedCategory === cat.id 
                    ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                style={{ marginRight: level * 12 }}
              >
                <div className={`relative rounded-lg overflow-hidden flex-shrink-0 shadow-sm ${
                  level === 0 ? 'w-10 h-10' : 'w-8 h-8'
                }`}>
                  <OptimizedImage src={cat.image || '/images/placeholder-category.jpg'}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className={`font-medium flex-1 line-clamp-1 ${level > 0 ? 'text-sm' : ''}`}>
                  {cat.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                    {totalCount}
                  </span>
                  {hasChildren && (
                    <span className={`text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      🔽
                    </span>
                  )}
                </div>
              </button>
            )}

            <AnimatePresence>
              {hasChildren && isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pr-2 border-r-2 border-brand-200" style={{ marginRight: level * 12 + 4 }}>
                    {renderTree(cat.children, level + 1)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })
  }

  return (
    <div className="overflow-hidden bg-white border shadow-lg rounded-xl">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-purple-50">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <span className="text-xl">🏷️</span>
          <span className="text-black">الفئات</span>
          <span className="text-xs font-normal text-gray-500">({categoryTree.length})</span>
        </h3>
      </div>
      
      <div className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-1">{showAsLinks && storeSlug ? (
          <Link
            href={storeSlug === 'category' ? '/products' : `/stores/${storeSlug}`}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
              selectedCategory === null 
                ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <span className="font-medium">الكل</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
              {totalProducts || 0}
            </span>
          </Link>
        ) : (
          <button
            onClick={() => onCategorySelect?.(null)}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
              selectedCategory === null 
                ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <span className="font-medium">الكل</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
              {totalProducts || 0}
            </span>
          </button>
        )}

        {renderTree(categoryTree, 0)}
      </div>
      </div>
    </div>
  )
}
