'use client'

import { useState } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { Product } from '@/types'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import { useShoppingCart } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'
import { productToCartItem } from '@/lib/utils/cartHelpers'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  showVendor?: boolean
  showQuickView?: boolean
  className?: string
}

export default function ProductCard({ 
  product, 
  variant = 'default',
  showVendor = true, 
  showQuickView = false,
  className = '' 
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addToCart, getItemQuantity, openCart } = useShoppingCart()
  const addToast = useToastStore((state) => state.addToast)
  // Use 'single' size for better quality (Next.js will optimize it)
  const imageUrl = wooCommerceAPI.getImageUrl(product, 'single')
  const formattedPrice = wooCommerceAPI.formatPrice(product.price)
  
  // ⚠️ IMPORTANT DEBUG - Check product structure
  console.group(`🔍 PRODUCT: ${product.name}`);
  console.log('📦 Full Product:', product);
  console.log('🏪 Vendor Object:', product.vendor);
  console.log('🏪 Store Object (old):', product.store);
  console.table({
    'Product ID': product.id,
    'Product Name': product.name,
    'Has Vendor': !!product.vendor,
    'Has Store': !!product.store,
    'Vendor ID': product.vendor?.id || 'N/A',
    'Vendor Name': product.vendor?.name || 'N/A',
    'Shop Name': product.vendor?.shop_name || 'N/A',
  });
  console.groupEnd();
  
  // Use helper function to create cart item with proper vendor data
  const cartItem = productToCartItem(product, 1);
  
  console.log('🛒 Cart Item to Add:', cartItem);
  
  const quantity = getItemQuantity(cartItem)

  const isVariable = product.type === 'variable'
  const hasVariations = isVariable && product.variations && product.variations.length > 0
  
  // Simple: Variable products never show "out of stock" badge
  // Regular products show it based on stock_status
  const isOutOfStock = !isVariable && product.stock_status === 'outofstock'
  
  const isOnSale = product.on_sale
  const regularPrice = parseFloat(product.regular_price || '0')
  const salePrice = parseFloat(product.price || '0')
  const discountPercentage = isOnSale && regularPrice > 0 
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // If variable product, redirect to product page
    if (isVariable) {
      addToast('يرجى اختيار الخيارات من صفحة المنتج', 'info', 2000)
      return
    }
    
    setIsAdding(true)
    
    try {
      const success = await addToCart(cartItem)
      
      if (success) {
        setJustAdded(true)
        addToast(`تم إضافة "${product.name}" إلى السلة بنجاح`, 'success', 2000)
        
        // Reset "just added" state after 2 seconds
        setTimeout(() => setJustAdded(false), 2000)
        
        setTimeout(() => openCart(), 300)
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // TODO: Quick view functionality
    console.log('Quick view:', product.id)
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md group rounded-2xl hover:shadow-2xl hover:border-brand-200">
        {/* Product Image */}
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100" style={{ paddingTop: '100%' }}>
            <div className="absolute inset-0">
              <OptimizedImage
                src={imageUrl}
                alt={product.name}
                fill
                quality={90}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute flex flex-col gap-2 top-3 left-3">
              {isOnSale && discountPercentage > 0 && (
                <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg">
                  -{discountPercentage}%
                </span>
              )}
              {product.featured && (
                <span className="px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                  مميز
                </span>
              )}
              {isVariable && (
                <span className="px-2 py-1 text-xs font-bold text-white bg-purple-500 rounded-full shadow-lg">
                  خيارات متعددة
                </span>
              )}
              {!isVariable && isOutOfStock && (
                <span className="px-2 py-1 text-xs font-bold text-white bg-gray-500 rounded-full shadow-lg">
                  نفد المخزون
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100">
              <div className="flex gap-3">
                {showQuickView && (
                  <button
                    onClick={handleQuickView}
                    className="p-3 text-gray-800 transition-all duration-200 delay-75 transform translate-y-4 bg-white rounded-full shadow-lg hover:bg-gray-50 group-hover:translate-y-0"
                    title="عرض سريع"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                )}
                {!isOutOfStock && (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || justAdded || isVariable}
                    className={`${
                      justAdded 
                        ? 'bg-green-600 hover:bg-green-700'
                        : quantity > 0
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : isVariable 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-brand-600 hover:bg-brand-700'
                    } text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={justAdded ? 'تمت الإضافة' : quantity > 0 ? 'إضافة المزيد' : isVariable ? 'اختر الخيارات من صفحة المنتج' : 'أضف للسلة'}
                  >
                    {isAdding ? (
                      <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : justAdded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : quantity > 0 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    ) : isVariable ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L7 13m0 0l-2.293-2.293M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>

          {/* Product Info */}
          <div className="flex flex-col flex-1 p-3 md:p-4">
            
            {/* Variable Product - Simple Layout */}
            {isVariable ? (
              <>
                {/* Product Name - Smaller */}
                <Link href={`/products/${product.id}`}>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 transition-colors cursor-pointer md:text-base line-clamp-2 group-hover:text-brand-600">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex-grow">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-gray-500">من</span>
                    <span className="text-lg font-bold text-purple-600 md:text-xl">
                      {formattedPrice}
                    </span>
                  </div>
                </div>

                {/* Choose Button */}
                <Link
                  href={`/products/${product.id}`}
                  className="w-full py-2 text-sm font-bold text-center text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  اختر الآن
                </Link>
              </>
            ) : (
              <>
                {/* Regular Product Layout */}
                {/* Vendor Info */}
                {showVendor && (product.vendor || product.store) && variant !== 'compact' && (
                  <div className="flex items-center gap-1.5 mb-2">
                    {product.store?.vendor_shop_logo && (
                      <OptimizedImage
                        src={product.store.vendor_shop_logo}
                        alt={product.vendor?.shop_name || product.store.vendor_shop_name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] md:text-xs font-medium bg-brand-100 text-brand-800 rounded-full">
                      {product.vendor?.shop_name || product.store?.vendor_shop_name || 'متجر'}
                    </span>
                  </div>
                )}

                {/* Brand */}
                {product.brands?.[0]?.name && (
                  <p className="text-[10px] md:text-xs text-brand-600 font-semibold mb-1.5 uppercase">
                    {product.brands[0].name}
                  </p>
                )}

                {/* Product Name - Smaller */}
                <Link href={`/products/${product.id}`}>
                  <h3 className="mb-2 text-sm font-semibold leading-snug text-gray-900 transition-colors cursor-pointer md:text-base line-clamp-2 group-hover:text-brand-600">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex-grow">
                  {isOnSale && product.regular_price !== product.price ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold md:text-xl text-brand-600">
                        {formattedPrice}
                      </span>
                      <span className="text-xs text-gray-500 line-through md:text-sm">
                        {wooCommerceAPI.formatPrice(product.regular_price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold md:text-xl text-brand-600">
                      {formattedPrice}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Button - Regular Products Only */}
          {!isVariable && !isOutOfStock && (
            <div className="px-2 pb-2 md:px-3 md:pb-3">
              {/* Quantity in Cart */}
              {quantity > 0 && (
                <div className="mb-2 text-center">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-100 text-brand-800">
                    في السلة: {quantity}
                  </span>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || justAdded}
                className={`
                  w-full py-2 md:py-2.5 px-4 rounded-lg font-bold text-sm
                  flex items-center justify-center gap-2
                  transition-colors duration-200
                  ${justAdded
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : quantity > 0
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-brand-600 hover:bg-brand-700 text-white'
                  }
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                {isAdding ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري...
                  </>
                ) : justAdded ? (
                  <>
                    ✓ تمت
                  </>
                ) : quantity > 0 ? (
                  <>
                    + المزيد
                  </>
                ) : (
                  <>
                    🛒 أضف
                  </>
                )}
              </button>
            </div>
          )}
      </div>
    </div>
  )
}