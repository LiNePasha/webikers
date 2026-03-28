'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import type { POSProduct, POSProductVariation, POSProductCategory } from '@/types'
import { safeFetch } from '@/lib/utils/safeFetch'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProduct: (productId: number, quantity: number, variationId?: number) => void
  existingProductIds: number[]
}

export default function AddProductModal({ 
  isOpen, 
  onClose, 
  onAddProduct,
  existingProductIds 
}: AddProductModalProps) {
  const [products, setProducts] = useState<POSProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<POSProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<POSProduct | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<POSProductVariation | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [categories, setCategories] = useState<POSProductCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showChildrenModal, setShowChildrenModal] = useState(false)
  const [selectedParentForChildren, setSelectedParentForChildren] = useState<POSProductCategory | null>(null)

  // Fetch products on mount
  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  // Get parent categories
  const parentCategories = categories.filter(cat => 
    cat.parent === 0 || !categories.some(c => c.id === cat.parent)
  )

  // Get children of a specific parent
  const getChildCategories = (parentId: number) => {
    return categories.filter(cat => cat.parent === parentId)
  }

  // Open children modal
  const openChildrenModal = (parent: POSProductCategory) => {
    setSelectedParentForChildren(parent)
    setShowChildrenModal(true)
  }

  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId)
    setShowChildrenModal(false)
  }

  // Filter products
  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.categories.some(cat => cat.id === selectedCategory)
      )
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.categories.some(cat => cat.name.toLowerCase().includes(query))
      )
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, products])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await safeFetch<{
        success: boolean
        products: POSProduct[]
        categories: POSProductCategory[]
      }>('/api/pos/products')
      
      if (fetchError || !data) {
        setError(fetchError || 'فشل تحميل المنتجات')
        return
      }
      
      if (data.success && data.products) {
        setProducts(data.products)
        setFilteredProducts(data.products)
        setCategories(data.categories || [])
      } else {
        setError('البيانات غير صحيحة')
      }
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (product: POSProduct) => {
    setSelectedProduct(product)
    setSelectedVariation(null)
    setQuantity(1)
  }

  const handleAdd = () => {
    if (!selectedProduct) return
    
    // Check if variable product has variation selected
    if (selectedProduct.type === 'variable' && !selectedVariation) {
      alert('يرجى اختيار نوع المنتج أولاً')
      return
    }

    const variationId = selectedVariation?.id
    onAddProduct(selectedProduct.id, quantity, variationId)
    
    // Reset and close
    setSelectedProduct(null)
    setSelectedVariation(null)
    setQuantity(1)
    onClose()
  }

  const getCurrentPrice = () => {
    if (selectedVariation) {
      return parseFloat(selectedVariation.price)
    }
    return parseFloat(selectedProduct?.price || '0')
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl md:rounded-3xl bg-white text-right shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 md:p-6 border-b bg-gradient-to-l from-brand-600 to-brand-700 text-white">
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                    <Dialog.Title className="text-lg md:text-xl font-bold">
                      إضافة منتجات للحزمة
                    </Dialog.Title>
                  </div>

                  {/* Search & Filters */}
                  <div className="p-4 md:p-6 border-b space-y-3 bg-gray-50">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن منتج..."
                        className="w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                    {/* Categories - Horizontal Scroll */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {/* All Products */}
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                          selectedCategory === null
                            ? 'bg-brand-600 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border-2'
                        }`}
                      >
                        الكل
                      </button>

                      {/* Parent Categories */}
                      {parentCategories.map((parentCat) => {
                        const children = getChildCategories(parentCat.id)
                        const hasChildren = children.length > 0
                        const parentProductCount = products.filter(product => 
                          product.categories.some(cat => cat.id === parentCat.id)
                        ).length

                        if (parentProductCount === 0 && !hasChildren) return null

                        return (
                          <div key={parentCat.id} className="relative flex-shrink-0">
                            <button
                              onClick={() => {
                                if (hasChildren) {
                                  openChildrenModal(parentCat)
                                } else {
                                  handleCategorySelect(parentCat.id)
                                }
                              }}
                              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                selectedCategory === parentCat.id
                                  ? 'bg-brand-600 text-white shadow-lg scale-105'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2'
                              }`}
                            >
                              <span>{parentCat.name}</span>
                              {hasChildren && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Content - Grid Layout */}
                  <div className="grid md:grid-cols-2 gap-4 p-4 md:p-6 bg-gray-50">
                    {/* Products List */}
                    <div className="h-[400px] md:h-[500px] overflow-y-auto border-2 rounded-2xl p-3 md:p-4 space-y-2 bg-white">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                        </div>
                      ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                          <div className="text-6xl mb-4">😔</div>
                          <p className="text-lg font-bold text-gray-900 mb-2">فشل تحميل المنتجات</p>
                          <p className="text-sm text-gray-600 mb-4">{error}</p>
                          <button
                            onClick={fetchProducts}
                            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg"
                          >
                            🔄 إعادة المحاولة
                          </button>
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <p className="text-lg font-medium">لا توجد منتجات</p>
                          <p className="text-sm">جرب البحث بكلمة أخرى</p>
                        </div>
                      ) : (
                        filteredProducts.map((product) => {
                          const isSelected = selectedProduct?.id === product.id
                          const isAdded = existingProductIds.includes(product.id)
                          
                          return (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              disabled={isAdded}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-right ${
                                isAdded
                                  ? 'opacity-40 cursor-not-allowed bg-gray-100'
                                  : isSelected
                                  ? 'border-brand-600 bg-brand-50 shadow-md'
                                  : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm'
                              }`}
                            >
                              {/* Image */}
                              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border">
                                {product.images[0] ? (
                                  <Image
                                    src={product.images[0].src}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm md:text-base line-clamp-2">{product.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-brand-600 font-bold text-lg">{product.price} ج.م</p>
                                  {product.type === 'variable' && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                      متعدد
                                    </span>
                                  )}
                                  {isAdded && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                      مضاف
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  متوفر: {product.stock_quantity || 0}
                                </p>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="h-[400px] md:h-[500px] overflow-y-auto border-2 rounded-2xl p-4 md:p-6 bg-white">
                      {!selectedProduct ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <svg className="w-20 h-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-lg font-medium">اختر منتج للإضافة</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Product Image */}
                          {selectedProduct.images[0] && (
                            <div className="relative w-full h-48 md:h-64 bg-gray-100 rounded-xl overflow-hidden">
                              <Image
                                src={selectedProduct.images[0].src}
                                alt={selectedProduct.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-xl flex-1">{selectedProduct.name}</h3>
                              {selectedProduct.type === 'variable' && (
                                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full whitespace-nowrap animate-pulse">
                                  اختر النوع *
                                </span>
                              )}
                            </div>

                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-brand-600">{getCurrentPrice()}</p>
                              <p className="text-gray-500">ج.م</p>
                            </div>

                            {/* Variations - Required */}
                            {selectedProduct.type === 'variable' && selectedProduct.variations && (
                              <div className="border-2 border-orange-200 rounded-xl p-4 bg-gradient-to-br from-orange-50 to-yellow-50">
                                <label className="flex items-center gap-2 text-sm font-bold text-orange-900 mb-3">
                                  <span className="text-red-600 text-xl">*</span>
                                  اختر النوع (مطلوب):
                                </label>
                                <select
                                  value={selectedVariation?.id || ''}
                                  onChange={(e) => {
                                    const variation = selectedProduct.variations?.find(
                                      (v) => v.id === parseInt(e.target.value)
                                    )
                                    setSelectedVariation(variation || null)
                                  }}
                                  className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-base font-medium shadow-sm"
                                >
                                  <option value="">-- اختر النوع --</option>
                                  {selectedProduct.variations.map((variation) => {
                                    const attributes = Object.entries(variation.attributes || {})
                                      .map(([key, value]) => value)
                                      .join(' - ')
                                    
                                    return (
                                      <option key={variation.id} value={variation.id}>
                                        {attributes} - {variation.price} ج.م
                                        {variation.stock_quantity ? ` (متوفر: ${variation.stock_quantity})` : ''}
                                      </option>
                                    )
                                  })}
                                </select>
                              </div>
                            )}

                            {/* Quantity */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                الكمية:
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                  className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="flex-1 text-center px-4 py-2 border-2 rounded-lg font-bold text-lg"
                                  min="1"
                                />
                                <button
                                  onClick={() => setQuantity(quantity + 1)}
                                  className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Total */}
                            <div className="bg-gray-100 rounded-xl p-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">المجموع:</span>
                                <span className="text-2xl font-bold text-brand-600">
                                  {(getCurrentPrice() * quantity).toFixed(2)} ج.م
                                </span>
                              </div>
                            </div>

                            {/* Add Button */}
                            <button
                              onClick={handleAdd}
                              disabled={selectedProduct.type === 'variable' && !selectedVariation}
                              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                                selectedProduct.type === 'variable' && !selectedVariation
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-l from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 hover:shadow-xl active:scale-95'
                              }`}
                            >
                              {selectedProduct.type === 'variable' && !selectedVariation
                                ? '⚠️ اختر النوع أولاً'
                                : '✓ أضف للحزمة'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Children Categories Modal */}
      <Transition appear show={showChildrenModal} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={() => setShowChildrenModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right shadow-xl transition-all">
                  <Dialog.Title className="text-xl font-bold mb-4 text-gray-900">
                    {selectedParentForChildren?.name}
                  </Dialog.Title>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {/* Parent Category Option */}
                    <button
                      onClick={() => handleCategorySelect(selectedParentForChildren?.id || 0)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold text-right transition-all ${
                        selectedCategory === selectedParentForChildren?.id
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      الكل في {selectedParentForChildren?.name}
                    </button>

                    {/* Children */}
                    {selectedParentForChildren && getChildCategories(selectedParentForChildren.id).map((childCat) => {
                      const childProductCount = products.filter(product => 
                        product.categories.some(cat => cat.id === childCat.id)
                      ).length

                      if (childProductCount === 0) return null

                      return (
                        <button
                          key={childCat.id}
                          onClick={() => handleCategorySelect(childCat.id)}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-right transition-all flex items-center justify-between ${
                            selectedCategory === childCat.id
                              ? 'bg-brand-500 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2'
                          }`}
                        >
                          <span>{childCat.name}</span>
                          <span className="text-xs opacity-75">({childProductCount})</span>
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setShowChildrenModal(false)}
                    className="w-full mt-4 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
                  >
                    إغلاق
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
