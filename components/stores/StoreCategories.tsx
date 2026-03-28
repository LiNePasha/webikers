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
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export default function StoreCategories({ 
  categories, 
  loading, 
  onCategorySelect, 
  selectedCategory,
  storeSlug,
  showAsLinks = false,
  totalProducts,
  storeName,
  viewMode = 'sidebar',
  collapsible = false,
  defaultCollapsed = false
}: StoreCategoriesProps) {
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set())
  const [mobileExpandedParent, setMobileExpandedParent] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(!defaultCollapsed)

  // Build category tree with special handling for ID 365
  const buildCategoryTree = (): CategoryTree[] => {
    const categoryMap = new Map<number, CategoryTree>()
    
    // Validate and clean categories data
    const validCategories = categories.filter(cat => {
      if (!cat || !cat.id || !cat.name) {
        console.warn('⚠️ Invalid category found:', cat)
        return false
      }
      return true
    })
    
    if (validCategories.length !== categories.length) {
      console.warn(`⚠️ Filtered out ${categories.length - validCategories.length} invalid categories`)
    }
    
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
    // Ensure count is a valid number
    const baseCount = Number(category.count) || 0
    
    if (category.children.length === 0) {
      return baseCount
    }
    
    // Sum all children counts
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
    if (viewMode === 'sidebar') {
      const allParentIds = new Set<number>()
      const collectParents = (cats: CategoryTree[]) => {
        cats.forEach(cat => {
          if (cat.children.length > 0) {
            allParentIds.add(cat.id)
            collectParents(cat.children)
          }
        })
      }
      collectParents(categoryTree)
      setExpandedParents(allParentIds)
    }
  }, [viewMode])

  if (loading) {
    if (viewMode === 'horizontal') {
      return (
        <div className="p-6 bg-white border shadow-lg rounded-2xl">
          <h3 className="mb-4 text-xl font-bold">🏷️ فئات المنتجات</h3>
          <div className="flex gap-4 pb-2 overflow-x-auto scrollbar-hide">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40 bg-gray-200 h-52 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      )
    }
    
    return (
      <div className="p-6 bg-white border rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">الفئات</h3>
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
    return (
      <div className="p-6 bg-white border rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">الفئات</h3>
        <p className="text-sm text-gray-500">لا توجد فئات</p>
      </div>
    )
  }

  // ============ MOBILE HORIZONTAL - STICKY VERSION ============
  if (viewMode === 'horizontal') {
    return (
      <div className="border-b border-gray-200 shadow-xl bg-white/95 backdrop-blur-md">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide">
            {/* All Products Button */}
            {showAsLinks && storeSlug && (
              <Link href={`/stores/${storeSlug}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative rounded-2xl overflow-hidden shadow-lg flex-shrink-0 w-32 h-20 ${
                    selectedCategory === null ? 'ring-2 ring-brand-500' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-brand-500 to-pink-500"></div>
                  <div className="relative flex flex-col items-center justify-center h-full px-2 text-center text-white">
                    <div className="mb-1 text-2xl">🛍️</div>
                    <div className="text-xs font-bold">الكل</div>
                    <div className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full mt-1">
                      {totalProducts || 0}
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Category Cards */}
            {categoryTree
              .sort((a, b) => getTotalCount(b) - getTotalCount(a))
              .map((rootCat, index) => {
                const hasChildren = rootCat.children.length > 0
                const totalCount = getTotalCount(rootCat)

                return (
                  <motion.button
                    key={rootCat.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMobileExpandedParent(mobileExpandedParent === rootCat.id ? null : rootCat.id)}
                    className={`relative w-44 h-64 rounded-3xl overflow-hidden shadow-xl flex-shrink-0 group ${
                      selectedCategory === rootCat.id ? 'ring-4 ring-brand-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="absolute inset-0">
                      <OptimizedImage
                        src={rootCat.image || '/images/placeholder-category.jpg'}
                        alt={rootCat.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>

                    <div className="absolute z-10 top-3 right-3">
                      <div className="bg-gradient-to-r from-brand-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        🏪 {storeName || 'متجر'}
                      </div>
                    </div>

                    <div className="absolute z-10 top-3 left-3">
                      <div className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        📦 {totalCount}
                      </div>
                    </div>

                    {hasChildren && (
                      <div className="absolute z-10 top-14 left-3">
                        <div className="px-2 py-1 text-xs font-bold text-gray-900 rounded-full shadow-lg bg-yellow-400/90">
                          {rootCat.children.length} 🔽
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
                      <div className="text-center text-white">
                        <h4 className="mb-1 text-lg font-bold drop-shadow-lg">{rootCat.name}</h4>
                        <p className="text-xs text-white/80">
                          {hasChildren ? `${rootCat.children.length} فئة فرعية` : 'اضغط للتصفح'}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
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
                className="mt-6 overflow-hidden"
              >
                <div className="p-6 border-2 bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl border-brand-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="flex items-center gap-2 text-xl font-bold">
                      <span className="text-2xl">📂</span>
                      <span>فئات {parent.name}</span>
                    </h4>
                    <button
                      onClick={() => setMobileExpandedParent(null)}
                      className="flex items-center justify-center w-8 h-8 text-white bg-red-500 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {parent.children
                      .sort((a, b) => getTotalCount(b) - getTotalCount(a))
                      .map((child, idx) => {
                        const childSlug = child.slug || child.name.toLowerCase().replace(/\s+/g, '-')
                        const childHasChildren = child.children.length > 0
                        const childCount = getTotalCount(child)
                        
                        const Card = (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative rounded-2xl overflow-hidden shadow-lg h-40 ${
                              selectedCategory === child.id ? 'ring-4 ring-brand-500' : ''
                            }`}
                          >
                            <div className="absolute inset-0">
                              <OptimizedImage
                                src={child.image || parent.image || '/images/placeholder-category.jpg'}
                                alt={child.name}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                            </div>

                            <div className="relative flex flex-col justify-between h-full p-3">
                              <div className="flex justify-between">
                                <div className="px-2 py-1 text-xs font-bold text-gray-900 rounded-full bg-white/90">
                                  📦 {childCount}
                                </div>
                                {childHasChildren && (
                                  <div className="px-2 py-1 text-xs font-bold text-gray-900 rounded-full bg-yellow-400/90">
                                    {child.children.length} 🔽
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-white">
                                <h5 className="mb-1 text-sm font-bold drop-shadow-lg">{child.name}</h5>
                                <p className="text-xs text-white/80">
                                  {childHasChildren ? 'فئات فرعية' : 'اضغط للتصفح'}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )

                        return showAsLinks && storeSlug ? (
                          <Link 
                            key={child.id} 
                            href={childHasChildren ? '#' : `/stores/${storeSlug}/category/${childSlug}`}
                            onClick={childHasChildren ? (e) => {
                              e.preventDefault()
                              setMobileExpandedParent(child.id)
                            } : undefined}
                          >
                            {Card}
                          </Link>
                        ) : (
                          <button
                            key={child.id}
                            onClick={() => {
                              if (childHasChildren) {
                                setMobileExpandedParent(child.id)
                              } else {
                                onCategorySelect?.(child.id)
                                setMobileExpandedParent(null)
                              }
                            }}
                          >
                            {Card}
                          </button>
                        )
                      })}
                  </div>
                </div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

        <div className="pt-4 mt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xl">📊</span>
              <span className="font-semibold">{categoryTree.length}</span>
              <span>فئة رئيسية</span>
            </div>
            {totalProducts && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xl">📦</span>
                <span className="font-semibold">{totalProducts}</span>
                <span>منتج</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ============ DESKTOP SIDEBAR ============
  
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
                href={hasChildren ? '#' : `/stores/${storeSlug}/category/${categorySlug}`}
                onClick={hasChildren ? (e) => {
                  e.preventDefault()
                  toggleParent(cat.id)
                } : undefined}
                className={`w-full flex items-center gap-3 p-2 rounded-lg group ${
                  selectedCategory === cat.id ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'hover:bg-gray-50 text-gray-700'
                }`}
                style={{ marginRight: level * 16 }}
              >
                <div className={`relative rounded-lg overflow-hidden flex-shrink-0 shadow-sm ${
                  level === 0 ? 'w-12 h-12' : level === 1 ? 'w-10 h-10' : 'w-8 h-8'
                }`}>
                  <OptimizedImage 
                    src={cat.image || '/images/placeholder-category.jpg'}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className={`font-medium flex-1 ${level > 0 ? 'text-sm' : ''}`}>{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">{totalCount}</span>
                  {hasChildren && (
                    <span className={`text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>🔽</span>
                  )}
                </div>
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleParent(cat.id)
                  } else {
                    onCategorySelect?.(cat.id)
                  }
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg group ${
                  selectedCategory === cat.id ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'hover:bg-gray-50 text-gray-700'
                }`}
                style={{ marginRight: level * 16 }}
              >
                <div className={`relative rounded-lg overflow-hidden flex-shrink-0 shadow-sm ${
                  level === 0 ? 'w-12 h-12' : level === 1 ? 'w-10 h-10' : 'w-8 h-8'
                }`}>
                  <OptimizedImage 
                    src={cat.image || '/images/placeholder-category.jpg'}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className={`font-medium flex-1 ${level > 0 ? 'text-sm' : ''}`}>{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">{totalCount}</span>
                  {hasChildren && (
                    <span className={`text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>🔽</span>
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
                  <div className="pr-2 border-r-2 border-brand-200" style={{ marginRight: level * 16 + 8 }}>
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
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">فئات المنتجات</h3>
      
      <div className="space-y-1">
        {showAsLinks && storeSlug ? (
          <Link
            href={`/stores/${storeSlug}`}
            className={`w-full flex items-center justify-between p-2 rounded-lg ${
              selectedCategory === null ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="font-medium">جميع المنتجات</span>
            <span className="text-sm text-gray-500">{totalProducts || '...'}</span>
          </Link>
        ) : (
          <button
            onClick={() => onCategorySelect?.(null)}
            className={`w-full flex items-center justify-between p-2 rounded-lg ${
              selectedCategory === null ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="font-medium">جميع المنتجات</span>
            <span className="text-sm text-gray-500">{totalProducts || '...'}</span>
          </button>
        )}

        {renderTree(categoryTree, 0)}
      </div>

      {categories.length > 0 && (
        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            {categoryTree.length} فئة رئيسية{totalProducts ? ` • ${totalProducts} منتج` : ''}
          </p>
        </div>
      )}
    </div>
  )
}
