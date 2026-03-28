'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category, ProductFilters } from '@/types'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { Filter, X, ChevronDown, ChevronRight, Package, Tag, Star, DollarSign } from 'lucide-react'

interface MotorcycleFiltersProps {
  categories: Category[]
  filters: ProductFilters
  onFiltersChange: (filters: Partial<ProductFilters>) => void
  loading?: boolean
}

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
}

export default function MotorcycleFilters({
  categories,
  filters,
  onFiltersChange,
  loading = false
}: MotorcycleFiltersProps) {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    min_price: filters.min_price || '',
    max_price: filters.max_price || '',
    in_stock: filters.in_stock || false,
    on_sale: filters.on_sale || false,
    featured: filters.featured || false
  })

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    quick: true
  })
  
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({})

  // Build category tree with children
  const categoryTree = useMemo(() => {
    // Filter out categories with 0 products
    const activeCategories = categories.filter(cat => cat.count > 0)
    
    const tree: CategoryWithChildren[] = []
    const map: Record<number, CategoryWithChildren> = {}
    
    // Create map of all categories
    activeCategories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] }
    })
    
    // Build tree structure
    activeCategories.forEach(cat => {
      if (cat.parent === 0) {
        tree.push(map[cat.id])
      } else if (map[cat.parent]) {
        map[cat.parent].children!.push(map[cat.id])
      }
    })
    
    // Sort by count (most products first)
    const sortByCount = (a: CategoryWithChildren, b: CategoryWithChildren) => b.count - a.count
    tree.sort(sortByCount)
    tree.forEach(cat => {
      if (cat.children && cat.children.length > 0) {
        cat.children.sort(sortByCount)
      }
    })
    
    return tree
  }, [categories])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }
  
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters({
      category: filters.category || '',
      min_price: filters.min_price || '',
      max_price: filters.max_price || '',
      in_stock: filters.in_stock || false,
      on_sale: filters.on_sale || false,
      featured: filters.featured || false
    })
  }, [filters])

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    
    // Convert to ProductFilters format
    onFiltersChange({
      category: newFilters.category || undefined,
      min_price: newFilters.min_price ? parseFloat(newFilters.min_price.toString()) : undefined,
      max_price: newFilters.max_price ? parseFloat(newFilters.max_price.toString()) : undefined,
      in_stock: newFilters.in_stock,
      on_sale: newFilters.on_sale,
      featured: newFilters.featured
    })
  }

  const clearFilters = () => {
    const resetFilters = {
      category: '',
      min_price: '',
      max_price: '',
      in_stock: false,
      on_sale: false,
      featured: false
    }
    setLocalFilters(resetFilters)
    onFiltersChange({
      category: undefined,
      min_price: undefined,
      max_price: undefined,
      in_stock: false,
      on_sale: false,
      featured: false
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3 mb-6">
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

// Category Tree Item Component
interface CategoryTreeItemProps {
  category: CategoryWithChildren
  selectedSlug: string
  expandedCategories: Record<number, boolean>
  onToggle: (id: number) => void
  level?: number
}

function CategoryTreeItem({ 
  category, 
  selectedSlug, 
  expandedCategories, 
  onToggle,
  level = 0 
}: CategoryTreeItemProps) {
  const isSelected = selectedSlug === category.slug
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedCategories[category.id]
  const hasImage = category.image && typeof category.image === 'object' && category.image.src
  
  const paddingLeft = level * 16
  
  return (
    <div>
      <div className="flex items-center gap-1">
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggle(category.id)
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </motion.div>
          </button>
        )}
        
        {/* Category Link */}
        <Link 
          href={`/products/category/${category.slug}`} 
          scroll={false}
          className="flex-1"
        >
          <motion.div
            whileHover={{ scale: 1.02, x: 4 }}
            className={`
              w-full flex items-center justify-between p-2.5 rounded-lg
              transition-all duration-200 border-2 cursor-pointer
              ${hasChildren ? '' : 'ml-5'}
              ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border-gray-200 text-gray-700 hover:border-purple-300'
              }
            `}
            style={{ paddingLeft: `${paddingLeft + 12}px` }}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {hasImage && category.image && typeof category.image === 'object' ? (
                <div className={`relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ${
                  isSelected ? 'ring-2 ring-white' : ''
                }`}>
                  <OptimizedImage
                    src={category.image.src}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-white/20' : 'bg-gradient-to-br from-purple-100 to-blue-100'
                }`}>
                  <Package className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                </div>
              )}
              <span className={`font-medium text-sm truncate ${level > 0 ? 'text-xs' : ''}`}>
                {category.name}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isSelected ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
              }`}>
                {category.count}
              </span>
            </div>
          </motion.div>
        </Link>
      </div>
      
      {/* Children Categories */}
      {hasChildren && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1 border-l-2 border-purple-200 ml-2">
                {category.children!.map((child) => (
                  <CategoryTreeItem
                    key={child.id}
                    category={child}
                    selectedSlug={selectedSlug}
                    expandedCategories={expandedCategories}
                    onToggle={onToggle}
                    level={level + 1}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h3 className="text-lg font-bold">الفلاتر</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
          >
            <X className="w-4 h-4" />
            إزالة الكل
          </motion.button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all"
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">الفئات</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.categories ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {/* All Categories Option */}
                <Link href="/products" scroll={false}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg
                      transition-all duration-200 border-2 cursor-pointer
                      ${
                        !localFilters.category
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        !localFilters.category ? 'bg-white/20' : 'bg-blue-100'
                      }`}>
                        <Package className={`w-5 h-5 ${!localFilters.category ? 'text-white' : 'text-blue-600'}`} />
                      </div>
                      <span className="font-medium">جميع الفئات</span>
                    </div>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                      !localFilters.category ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {categories.filter(c => c.count > 0).reduce((sum, cat) => sum + cat.count, 0)}
                    </span>
                  </motion.div>
                </Link>

                {/* Category Tree */}
                {categoryTree.map((category) => (
                  <CategoryTreeItem
                    key={category.id}
                    category={category}
                    selectedSlug={typeof localFilters.category === 'string' ? localFilters.category : ''}
                    expandedCategories={expandedCategories}
                    onToggle={toggleCategory}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('price')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-900">نطاق السعر</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.price ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">من</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={localFilters.min_price}
                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ج.م</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">إلى</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={localFilters.max_price}
                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                        placeholder="∞"
                        min="0"
                        className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ج.م</span>
                    </div>
                  </div>
                </div>

                {/* Quick Price Presets */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { label: 'أقل من 500', min: 0, max: 500 },
                    { label: '500 - 1000', min: 500, max: 1000 },
                    { label: '1000 - 2000', min: 1000, max: 2000 },
                    { label: 'أكثر من 2000', min: 2000, max: '' }
                  ].map((preset) => (
                    <motion.button
                      key={preset.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleFilterChange('min_price', preset.min)
                        handleFilterChange('max_price', preset.max)
                      }}
                      className="px-3 py-2 text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-all"
                    >
                      {preset.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('quick')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all"
        >
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-gray-900">فلاتر سريعة</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.quick ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expandedSections.quick && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* In Stock */}
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer
                    transition-all duration-200 border-2
                    ${
                      localFilters.in_stock
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-md'
                        : 'bg-gray-50 hover:bg-green-50 border-gray-200 hover:border-green-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      localFilters.in_stock ? 'bg-white/20' : 'bg-green-100'
                    }`}>
                      <Package className={`w-4 h-4 ${localFilters.in_stock ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <span className={`font-medium ${localFilters.in_stock ? 'text-white' : 'text-gray-700'}`}>
                      متوفر في المخزون
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localFilters.in_stock}
                    onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                    className="w-5 h-5 border-gray-300 rounded cursor-pointer text-green-600 focus:ring-green-500"
                  />
                </motion.label>
                
                {/* On Sale */}
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer
                    transition-all duration-200 border-2
                    ${
                      localFilters.on_sale
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-md'
                        : 'bg-gray-50 hover:bg-red-50 border-gray-200 hover:border-red-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      localFilters.on_sale ? 'bg-white/20' : 'bg-red-100'
                    }`}>
                      <Tag className={`w-4 h-4 ${localFilters.on_sale ? 'text-white' : 'text-red-600'}`} />
                    </div>
                    <span className={`font-medium ${localFilters.on_sale ? 'text-white' : 'text-gray-700'}`}>
                      عروض خاصة
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localFilters.on_sale}
                    onChange={(e) => handleFilterChange('on_sale', e.target.checked)}
                    className="w-5 h-5 border-gray-300 rounded cursor-pointer text-red-600 focus:ring-red-500"
                  />
                </motion.label>
                
                {/* Featured */}
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer
                    transition-all duration-200 border-2
                    ${
                      localFilters.featured
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-600 shadow-md'
                        : 'bg-gray-50 hover:bg-yellow-50 border-gray-200 hover:border-yellow-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      localFilters.featured ? 'bg-white/20' : 'bg-yellow-100'
                    }`}>
                      <Star className={`w-4 h-4 ${localFilters.featured ? 'text-white' : 'text-yellow-600'}`} />
                    </div>
                    <span className={`font-medium ${localFilters.featured ? 'text-white' : 'text-gray-700'}`}>
                      منتجات مميزة
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localFilters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="w-5 h-5 border-gray-300 rounded cursor-pointer text-yellow-600 focus:ring-yellow-500"
                  />
                </motion.label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Applied Filters */}
      {(localFilters.category || localFilters.min_price || localFilters.max_price || 
        localFilters.in_stock || localFilters.on_sale || localFilters.featured) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-900">الفلاتر المطبقة</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {localFilters.category && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-md"
              >
                <Package className="w-3.5 h-3.5" />
                {categories.find(c => c.slug === localFilters.category)?.name}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}
            
            {(localFilters.min_price || localFilters.max_price) && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium shadow-md"
              >
                <DollarSign className="w-3.5 h-3.5" />
                {localFilters.min_price || '0'} - {localFilters.max_price || '∞'} ج.م
                <button
                  onClick={() => {
                    handleFilterChange('min_price', '')
                    handleFilterChange('max_price', '')
                  }}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}
            
            {localFilters.in_stock && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium shadow-md"
              >
                <Package className="w-3.5 h-3.5" />
                متوفر
                <button
                  onClick={() => handleFilterChange('in_stock', false)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}
            
            {localFilters.on_sale && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium shadow-md"
              >
                <Tag className="w-3.5 h-3.5" />
                عروض
                <button
                  onClick={() => handleFilterChange('on_sale', false)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}
            
            {localFilters.featured && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg text-sm font-medium shadow-md"
              >
                <Star className="w-3.5 h-3.5" />
                مميز
                <button
                  onClick={() => handleFilterChange('featured', false)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}