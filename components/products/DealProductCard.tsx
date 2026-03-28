'use client'

import { useState } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import Link from 'next/link'
import { Product } from '@/types'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import { useShoppingCart } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'
import { productToCartItem } from '@/lib/utils/cartHelpers'

interface DealProductCardProps {
  product: Product
  discount: number
  savings: number
}

export default function DealProductCard({ product, discount, savings }: DealProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addToCart, getItemQuantity } = useShoppingCart()
  const addToast = useToastStore((state) => state.addToast)
  
  const imageUrl = wooCommerceAPI.getImageUrl(product, 'single')
  const formattedPrice = wooCommerceAPI.formatPrice(product.price)
  const cartItem = productToCartItem(product, 1)
  const quantity = getItemQuantity(cartItem)
  const isOutOfStock = product.stock_status === 'outofstock'
  const isVariable = product.type === 'variable'

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
        setTimeout(() => setJustAdded(false), 2000)
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="relative overflow-hidden transition-all duration-300 bg-white border-2 border-orange-200 rounded-2xl hover:shadow-2xl hover:scale-105 hover:border-red-400">
      <Link href={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100" style={{ paddingTop: '100%' }}>
          <div className="absolute inset-0">
            <OptimizedImage
              src={imageUrl}
              alt={product.name}
              fill
              quality={90}
              className="object-cover transition-transform duration-300 hover:scale-110"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
          
          {/* Mobile: Add to Cart Button (+ icon) - Bottom Right */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding || justAdded}
              className={`
                md:hidden absolute bottom-2 right-2 z-30
                w-12 h-12 rounded-full shadow-2xl
                flex items-center justify-center
                transition-all duration-200
                ${justAdded
                  ? 'bg-green-600 scale-110'
                  : quantity > 0
                  ? 'bg-orange-600'
                  : 'bg-brand-600'
                }
                text-white font-bold text-xl
                disabled:opacity-70 disabled:cursor-not-allowed
                active:scale-95
              `}
            >
              {isAdding ? (
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : justAdded ? (
                '✓'
              ) : (
                '+'
              )}
            </button>
          )}
          
          {/* Quantity Badge */}
          {quantity > 0 && (
            <div className="absolute z-30 md:hidden top-2 right-2">
              <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full">
                {quantity}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="relative z-10 p-4 bg-white">
        {/* Brand */}
        {product.brands?.[0]?.name && (
          <p className="mb-1 text-xs font-semibold tracking-wide text-brand-600 uppercase">
            {product.brands[0].name}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2 text-sm font-semibold leading-tight text-gray-900 transition-colors line-clamp-2 hover:text-brand-600">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-red-600">
            {formattedPrice}
          </span>
          {product.regular_price && product.sale_price && (
            <span className="text-sm text-gray-500 line-through">
              {wooCommerceAPI.formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        {/* Desktop: Add to Cart Button */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            disabled={isAdding || justAdded}
            className={`
              hidden md:flex
              w-full py-2.5 px-4 rounded-xl font-semibold text-sm
              items-center justify-center gap-2
              transition-all duration-200 shadow-sm
              ${justAdded
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : quantity > 0
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
              }
              active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
            `}
          >
            {isAdding ? (
              <>
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الإضافة...
              </>
            ) : justAdded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                تمت الإضافة ✓
              </>
            ) : quantity > 0 ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة المزيد ({quantity})
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L7 13m0 0l-2.293-2.293M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                </svg>
                إضافة للسلة
              </>
            )}
          </button>
        )}
      </div>

      {/* Savings Badge at Bottom */}
      <div className="relative z-20 p-2.5 bg-gradient-to-r from-green-600 to-green-500">
        <div className="flex items-center justify-center gap-1.5 text-white">
          <span className="text-base">💚</span>
          <span className="text-xs font-bold md:text-sm">
            وفر {savings.toFixed(0)} جنيه
          </span>
        </div>
      </div>
    </div>
  )
}
