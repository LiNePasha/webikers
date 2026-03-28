'use client'

import { useShoppingCart } from '@/store/cartStore'

export default function CartFloatingButton() {
  const { cartQuantityTotal, openCart } = useShoppingCart()

  return (
    <div className="fixed bottom-18 left-6 z-40 hidden">
      <button
        onClick={openCart}
        className="relative flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        aria-label="فتح سلة المشتريات"
      >
        {/* Cart Icon */}
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m9 6v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" 
          />
        </svg>
        
        {/* Badge */}
        {cartQuantityTotal > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
            {cartQuantityTotal > 99 ? '99+' : cartQuantityTotal}
          </span>
        )}
      </button>
    </div>
  )
}