'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import { Product } from '@/types'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import useShoppingCart from '@/store/cartStore'
import AddProductModal from '@/components/bundle/AddProductModal'
import { 
  ShoppingCartIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  XMarkIcon,
  TagIcon,
  TruckIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface BundleItem {
  productId: number
  variationId?: number
  quantity: number // ✅ Added quantity support
  product?: Product
  variation?: any
}

function BundleContent() {
  const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Parse URL params - FLEXIBLE FORMAT:
  // NEW: p=123:q5 → product 123 × 5 (simple)
  // NEW: p=456:v789:q2 → product 456 variation 789 × 2 (variable)
  // OLD: p=123:5 → product 123 × 5 (if < 100) OR variation (if >= 100)
  // OLD: p=456:789:2 → product 456 variation 789 × 2
  const parseUrlParams = (): BundleItem[] => {
    const param = searchParams.get('p')
    if (!param) return []
    
    console.log('📦 Raw URL param:', param)
    
    return param.split(',').filter(Boolean).map(item => {
      console.log('🔍 Parsing item:', item)
      
      const parts = item.split(':')
      const productId = parseInt(parts[0])
      let variationId: number | undefined
      let quantity = 1 // Default quantity
      
      // Parse remaining parts (looking for v and q prefixes, or raw numbers)
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i]
        
        if (part.startsWith('v')) {
          // NEW FORMAT: Variation with prefix: v789
          variationId = parseInt(part.substring(1))
          console.log('  → Found variation (with v):', variationId)
        } else if (part.startsWith('q')) {
          // NEW FORMAT: Quantity with prefix: q5
          quantity = parseInt(part.substring(1))
          console.log('  → Found quantity (with q):', quantity)
        } else {
          // OLD FORMAT: Raw number - check if variation or quantity
          const num = parseInt(part)
          
          if (num >= 100) {
            // Large number = variation ID
            variationId = num
            console.log('  → Found variation (old format):', variationId)
          } else {
            // Small number = quantity
            quantity = num
            console.log('  → Found quantity (old format):', quantity)
          }
        }
      }
      
      const result: BundleItem = { productId, quantity }
      if (variationId) {
        result.variationId = variationId
      }
      
      console.log('  ✅ Parsed:', result)
      return result
    })
  }
  
  const bundleItems = parseUrlParams()
  
  console.log('🎯 Bundle items from URL:', bundleItems)
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [removedProducts, setRemovedProducts] = useState<string[]>([])
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  
  const { addToCart, openCart, resetCart } = useShoppingCart()

  // Load products and variations
  useEffect(() => {
    const loadProducts = async () => {
      console.log('🔄 Starting loadProducts with:', bundleItems)
      
      if (bundleItems.length === 0) {
        console.log('❌ No bundle items found')
        setError('لم يتم تحديد أي منتجات في الرابط')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('📦 Loading bundle items:', bundleItems)
        
        // 🚀 NEW: Use fast bundle endpoint - single API call!
        const productsParam = bundleItems.map(item => {
          const parts: string[] = [item.productId.toString()]
          if (item.variationId) parts.push(`v${item.variationId}`)
          if (item.quantity > 1) parts.push(`q${item.quantity}`)
          return parts.join(':')
        }).join(',')
        
        console.log('🚀 Calling bundle API with:', productsParam)
        
        const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_WP_API_URL}/spare2app/v1/bundle?products=${productsParam}&vendor_id=${VENDOR_ID}`
        )
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.success || !data.products) {
          throw new Error(data.message || 'Failed to load bundle')
        }
        
        console.log('✅ Bundle API response:', data)
        
        // Map API response to our Product format
        const productsData = data.products.map((item: any) => ({
          id: item.id,
          name: item.variation_name ? `${item.name} - ${item.variation_name}` : item.name,
          slug: item.slug,
          type: item.type,
          price: item.price,
          regular_price: item.regular_price,
          sale_price: item.sale_price,
          stock_status: item.stock_status,
          images: item.images,
          _bundleQuantity: item.quantity,
          _bundleVariationId: item.variation_id,
          _variationAttributes: item.variation_attributes,
          description: item.description,
          short_description: item.short_description
        }))
        
        setProducts(productsData)
        
        if (productsData.length === 0) {
          setError('لم يتم العثور على المنتجات المطلوبة')
        }
        
        console.log('✅ Loaded products:', productsData)
      } catch (err: any) {
        console.error('Error loading bundle:', err)
        setError(err.message || 'فشل تحميل الحزمة')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [searchParams.get('p')])

  // Helper function to get unique product key (productId or productId:variationId)
  const getProductKey = (product: Product): string => {
    const varId = (product as any)._bundleVariationId
    return varId ? `${product.id}:${varId}` : `${product.id}`
  }

  // Calculate totals (with quantity)
  const activeProducts = products.filter(p => !removedProducts.includes(getProductKey(p)))
  const totalOriginalPrice = activeProducts.reduce((sum, p) => {
    const price = parseFloat(p.regular_price || p.price || '0')
    const quantity = (p as any)._bundleQuantity || 1
    return sum + (price * quantity)
  }, 0)
  
  const totalCurrentPrice = activeProducts.reduce((sum, p) => {
    const price = parseFloat(p.sale_price || p.price || '0')
    const quantity = (p as any)._bundleQuantity || 1
    return sum + (price * quantity)
  }, 0)
  
  const totalSavings = totalOriginalPrice - totalCurrentPrice
  const savingsPercentage = totalOriginalPrice > 0 
    ? ((totalSavings / totalOriginalPrice) * 100).toFixed(0) 
    : 0
  
  const handleToggleProduct = (product: Product) => {
    const key = getProductKey(product)
    setRemovedProducts(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) // Undo remove
        : [...prev, key] // Remove
    )
  }
  
  const handleQuantityChange = (product: Product, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setProducts(prev => prev.map(p => 
      getProductKey(p) === getProductKey(product)
        ? { ...p, _bundleQuantity: newQuantity } as Product
        : p
    ))
  }

  // Add new product to bundle
  const handleAddNewProduct = (productId: number, quantity: number, variationId?: number) => {
    // Build new URL param
    let newProductParam = `${productId}`
    if (variationId) {
      newProductParam += `:v${variationId}`
    }
    newProductParam += `:q${quantity}`

    // Get current products from URL
    const currentParam = searchParams.get('p') || ''
    
    // Check if product already exists
    const existingProducts = currentParam.split(',').filter(Boolean)
    const productExists = existingProducts.some(item => {
      const parts = item.split(':')
      const existingProductId = parseInt(parts[0])
      return existingProductId === productId
    })

    if (productExists) {
      console.warn('⚠️ Product already in bundle')
      return
    }

    // Add to URL
    const newParam = currentParam 
      ? `${currentParam},${newProductParam}`
      : newProductParam

    router.push(`?p=${newParam}`)
  }

  // Add all to cart (with quantities)
  const handleAddAllToCart = async () => {
    if (activeProducts.length === 0) return
    
    setAddingToCart(true)
    try {
      // 🗑️ Clear existing cart first
      console.log('🗑️ Clearing existing cart...')
      resetCart()
      
      // Add each product to cart with specified quantity
      for (const product of activeProducts) {
        const variationId = (product as any)._bundleVariationId
        const variationData = (product as any)._variationData
        const variationAttributes = (product as any)._variationAttributes
        const quantity = (product as any)._bundleQuantity || 1 // ✅ Get quantity
        
        const price = parseFloat(product.sale_price || product.price || '0')
        
        const cartItem: any = {
          id: variationId || product.id, // Use variation ID if exists
          product_id: product.id,
          variation_id: variationId || undefined, // Add variation ID
          product: product,
          quantity: quantity, // ✅ Use specified quantity
          price: product.sale_price || product.price || '0',
          total: price * quantity, // ✅ Calculate total based on quantity
          vendor_id: parseInt(VENDOR_ID),
          vendor_name: 'WeBikers',
          image: variationData?.image?.src || product.images?.[0]?.src || '',
          thumbnail: variationData?.image?.src || product.images?.[0]?.src || '',
          name: product.name,
          slug: product.slug,
          // Add variation attributes if exists
          ...(variationAttributes && { variation: variationAttributes })
        }
        
        console.log('🛒 Adding to cart:', cartItem)
        await addToCart(cartItem)
      }
      
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        router.push('/checkout')
      }, 1500)
    } catch (err) {
      console.error('Error adding to cart:', err)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            {/* Logo with animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-brand-400 blur-xl animate-pulse"></div>
                <div className="relative">
                  <OptimizedImage 
                    src="/logo.webp"
                    alt="WeBikers"
                    width={200}
                    height={79}
                    className="object-contain w-32 h-32"
                    priority
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Loading text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-bold text-gray-900">
                جاري تحضير منتجاتك...
              </h2>
              <p className="text-xl font-semibold text-brand-600">
                WeBikers 🛠️
              </p>
              
              {/* Loading dots animation */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-brand-500"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                نجهز لك أفضل الأسعار والمنتجات
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (error || activeProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-purple-50 to-pink-50">
        <div className="container px-4 py-12 mx-auto">
          <div className="max-w-md p-8 mx-auto text-center bg-white shadow-xl rounded-3xl">
            <div className="mb-6 text-6xl">📦</div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {error || 'لا توجد منتجات في الحزمة'}
            </h2>
            <p className="mb-6 text-gray-600">
              تأكد من رابط الحزمة أو جرب حزمة أخرى
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl hover:shadow-xl active:scale-95"
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-purple-50 to-pink-50">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-x-0 z-50 flex justify-center px-4 top-4"
          >
            <div className="flex items-center gap-3 px-6 py-4 text-white shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
              <CheckCircleIcon className="w-6 h-6" />
              <span className="font-semibold">تم إضافة الحزمة للسلة! 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container px-4 py-4 mx-auto md:py-8">
        {/* Breadcrumbs */}
        <div className="mb-3 md:mb-0">
          <Breadcrumbs 
            items={[
              { label: 'الرئيسية', href: '/' },
              { label: 'الحزم المميزة', current: true }
            ]}
          />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 mb-4 overflow-hidden bg-white shadow-xl md:mt-6 md:mb-8 rounded-2xl md:rounded-3xl"
        >

          {totalSavings > 0 && (
            <div className="px-3 py-3 border-green-200 md:px-8 md:py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-y">
              <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center justify-center text-base bg-green-500 rounded-full w-9 h-9 md:w-12 md:h-12 md:text-xl">
                    💸
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-600 md:text-sm">توفير على الحزمة</div>
                    <div className="text-lg font-bold text-green-600 md:text-2xl">
                      {Math.round(totalSavings)} ج ({savingsPercentage}%)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-green-700 bg-green-100 rounded-full">
                  <TagIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                  عرض خاص
                </div>
              </div>
            </div>
          )}

          {/* Products Count & Total */}
          <div className="px-4 py-4 sm:px-8 sm:py-6 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-lg">
                    {activeProducts.length} منتج في الحزمة
                  </span>
                </div>
                
                {/* Add Product Button */}
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-brand-600 bg-white border-2 border-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>إضافة منتج</span>
                </button>
              </div>
              
              <div className="text-left">
                {totalOriginalPrice > totalCurrentPrice && (
                  <div className="text-xs text-gray-500 line-through sm:text-sm">
                    {Math.round(totalOriginalPrice)} جنيه
                  </div>
                )}
                <div className="text-2xl font-bold sm:text-3xl text-brand-600">
                  {Math.round(totalCurrentPrice)} جنيه
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products List - Mobile Compact / Desktop Grid */}
        <div className="mb-8 space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => {
              const isRemoved = removedProducts.includes(getProductKey(product))
              const displayPrice = parseFloat(product.sale_price || product.price || '0')
              const originalPrice = parseFloat(product.regular_price || product.price || '0')
              const hasDiscount = originalPrice > displayPrice
              const variationAttributes = (product as any)._variationAttributes
              const quantity = (product as any)._bundleQuantity || 1

              return (
                <motion.div
                  key={getProductKey(product)}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isRemoved ? 0.5 : 1, 
                    x: 0
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative bg-white shadow-md rounded-xl overflow-hidden ${
                    isRemoved ? 'opacity-50' : ''
                  }`}
                >
                  {/* Mobile Horizontal Layout / Desktop Vertical */}
                  <div className="flex md:flex-col">
                    {/* Image Section */}
                    <div className="relative flex-shrink-0 w-24 h-24 md:w-full md:h-48">
                      <Link href={`/products/${product.id}`}>
                        <div className="relative w-full h-full overflow-hidden bg-gray-100">
                      {product.images && product.images[0] ? (
                        <OptimizedImage
                          src={product.images[0].src}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-3xl md:text-6xl">
                          📦
                        </div>
                      )}
                      
                      {/* Number Badge - Mobile Top Left, Desktop Top Right */}
                      <div className="absolute px-1.5 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-bold text-white rounded-md shadow top-1 left-1 md:top-2 md:right-2 md:left-auto bg-gradient-to-r from-brand-500 to-purple-600">
                        #{index + 1}
                      </div>
                      
                      {/* Discount Badge */}
                      {hasDiscount && !isRemoved && (
                        <div className="absolute px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-md shadow bottom-1 left-1">
                          -{(((originalPrice - displayPrice) / originalPrice) * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                      </Link>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col justify-between flex-1 p-2.5 md:p-4">
                      {/* Header with Title and Remove Button */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <Link href={`/products/${product.slug}`} className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 md:text-base line-clamp-2 hover:text-brand-600">
                            {product.name}
                          </h3>
                        </Link>
                        
                        {/* Remove Button - Compact */}
                        <button
                          onClick={() => handleToggleProduct(product)}
                          className={`flex-shrink-0 p-1 md:p-1.5 text-white transition-all rounded-full shadow active:scale-90 ${
                            isRemoved 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                          title={isRemoved ? 'إرجاع' : 'إزالة'}
                        >
                          {isRemoved ? (
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ) : (
                            <XMarkIcon className="w-3 h-3 md:w-4 md:h-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Variation Attributes - Compact */}
                      {variationAttributes && variationAttributes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {variationAttributes.map((attr: any, i: number) => (
                            <span 
                              key={i}
                              className="px-1.5 py-0.5 text-[9px] md:text-xs font-medium rounded text-brand-700 bg-brand-50"
                            >
                              {attr.option}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price & Quantity Row */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        {/* Price */}
                        <div className="flex-1">
                          <div className="flex items-baseline gap-1.5">
                            {hasDiscount && (
                              <span className="text-[10px] md:text-xs text-gray-400 line-through">
                                {Math.round(originalPrice * quantity)}
                              </span>
                            )}
                            <span className="text-sm font-bold md:text-lg text-brand-600">
                              {Math.round(displayPrice * quantity)}
                            </span>
                            <span className="text-[10px] md:text-xs text-gray-500">ج</span>
                          </div>
                          {quantity > 1 && (
                            <div className="text-[9px] md:text-xs text-gray-400">
                              {Math.round(displayPrice)} × {quantity}
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls - Compact */}
                        {!isRemoved && (
                          <div className="flex items-center border rounded-md border-brand-300">
                            <button
                              onClick={() => handleQuantityChange(product, quantity - 1)}
                              disabled={quantity <= 1}
                              className="px-1.5 py-0.5 md:px-2 md:py-1 text-sm md:text-base font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                            >
                              −
                            </button>
                            <span className="px-2 py-0.5 md:px-3 md:py-1 text-xs md:text-sm font-bold text-gray-900 min-w-[1.5rem] md:min-w-[2rem] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(product, quantity + 1)}
                              className="px-1.5 py-0.5 md:px-2 md:py-1 text-sm md:text-base font-bold text-brand-600 hover:bg-brand-50 active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Stock Status - Minimal */}
                      <div className="flex items-center gap-1">
                        {product.stock_status === 'instock' ? (
                          <>
                            <CheckCircleIcon className="w-3 h-3 text-green-500 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-medium text-green-600">متوفر</span>
                          </>
                        ) : (
                          <>
                            <XMarkIcon className="w-3 h-3 text-red-500 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-medium text-red-600">غير متوفر</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Removed Overlay - Simplified */}
                  {isRemoved && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-600 md:text-sm">تم الإزالة</p>
                        <button
                          onClick={() => handleToggleProduct(product)}
                          className="mt-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          ↩️ إرجاع
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Summary Bar - Compact Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="sticky bottom-0 z-50 pb-2 mb-16 md:pb-4 md:mb-4"
        >
          <div className="p-3 overflow-hidden bg-white shadow-2xl md:p-6 rounded-2xl md:rounded-3xl">
            <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Summary - Compact on Mobile */}
              {/* <div className="flex-1">
                <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 text-xs md:text-sm text-gray-600">
                  <TruckIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                  <span>شحن سريع</span>
                </div>
                <div className="flex items-baseline gap-2 md:gap-3">
                  <span className="text-xs text-gray-600 md:text-sm">الإجمالي:</span>
                  {totalOriginalPrice > totalCurrentPrice && (
                    <span className="text-sm text-gray-400 line-through md:text-lg">
                      {Math.round(totalOriginalPrice)}
                    </span>
                  )}
                  <span className="text-xl font-bold md:text-3xl text-brand-600">
                    {Math.round(totalCurrentPrice)} ج
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className="mt-0.5 md:mt-1 text-xs md:text-sm font-medium text-green-600">
                    🎉 توفير {Math.round(totalSavings)} ج
                  </div>
                )}
              </div> */}

              {/* Add to Cart Button - Compact on Mobile */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddAllToCart}
                disabled={addingToCart || activeProducts.length === 0}
                className="flex items-center justify-center gap-2 md:gap-3 px-4 py-2.5 md:px-8 md:py-4 text-sm md:text-lg font-bold text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 via-purple-600 to-pink-600 rounded-xl md:rounded-2xl hover:shadow-2xl"
              >
                {addingToCart ? (
                  <>
                    <svg className="w-4 h-4 md:w-6 md:h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden md:inline">جاري الإضافة...</span>
                    <span className="md:hidden">جاري...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="w-4 h-4 md:w-6 md:h-6" />
                    <span>اشتري الآن {Math.round(totalCurrentPrice)} ج</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid gap-3 mt-6 md:gap-4 md:mt-8 md:grid-cols-3"
        >
          {[
            { icon: '🚚', title: 'شحن سريع', desc: 'توصيل لجميع المحافظات' },
            { icon: '💯', title: 'ضمان الجودة', desc: 'منتجات أصلية 100%' },
            { icon: '💳', title: 'دفع آمن', desc: 'طرق دفع متعددة' }
          ].map((feature, i) => (
            <div key={i} className="p-4 text-center bg-white shadow-lg md:p-6 rounded-xl md:rounded-2xl">
              <div className="mb-2 text-3xl md:mb-3 md:text-4xl">{feature.icon}</div>
              <h4 className="mb-1 text-sm font-bold text-gray-900 md:text-lg">{feature.title}</h4>
              <p className="text-xs text-gray-600 md:text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={handleAddNewProduct}
        existingProductIds={products.map(p => p.id)}
      />
    </div>
  )
}

export default function BundlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-purple-50 to-pink-50">
        <div className="container px-4 py-8 mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-60"></div>
            <div className="p-8 bg-white shadow-xl rounded-3xl">
              <div className="h-12 mb-6 bg-gray-200 rounded-lg"></div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="overflow-hidden bg-gray-100 rounded-2xl">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <BundleContent />
    </Suspense>
  )
}
