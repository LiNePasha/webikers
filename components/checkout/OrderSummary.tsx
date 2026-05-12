'use client'

import OptimizedImage from '@/components/ui/OptimizedImage'
import { useCartStore } from '@/store/cartStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import { calculateWalletFee, getWalletFeeInfo } from '@/lib/utils/fees'
import type { CartItem } from '@/types'

interface OrderSummaryProps {
  isHalfPayment?: boolean
  halfPaymentAmount?: number
  remainingAmount?: number
}

export default function OrderSummary({
  isHalfPayment = false,
  halfPaymentAmount,
  remainingAmount = 0,
}: OrderSummaryProps) {
  const { cartItems, totalPrice } = useCartStore()
  const shippingMethod = useCheckoutStore(
    (state) => state.checkoutData.shippingMethod
  )
  const paymentMethod = useCheckoutStore(
    (state) => state.checkoutData.paymentMethod
  )
  
  const shippingCost = shippingMethod?.cost || 0
  
  // Calculate wallet fee (Instapay): 3% with min 5 EGP and max 30 EGP
  // Applied ONLY on order total (not on shipping - shipping is paid COD)
  const payableNow = isHalfPayment
    ? (halfPaymentAmount ?? Math.round(totalPrice / 2))
    : totalPrice
  const walletFee = paymentMethod?.id === 'instapay' ? calculateWalletFee(payableNow) : 0
  const walletFeeInfo = getWalletFeeInfo()
  
  // Grand total = Order total + Wallet fee (Shipping is separate - paid on delivery)
  const grandTotal = payableNow + walletFee
  
  return (
    <div className="p-6 bg-white rounded-xl shadow-soft">
      {/* Header */}
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        ملخص الطلب
      </h2>
      
      {/* Items List */}
      <div className="mb-6 space-y-4">
        {cartItems.map((item: CartItem) => (
          <div key={item.id} className="flex gap-3">
            {/* Product Image */}
            <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-100 rounded-lg">
              {item.thumbnail ? (
                <OptimizedImage src={item.thumbnail}
                  alt={item.name || 'Product'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  📦
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.name || 'منتج'}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                الكمية: {item.quantity}
              </p>
              {(item.size || item.color) && (
                <p className="text-xs text-gray-500">
                  {item.size} {item.color}
                </p>
              )}
            </div>
            
            {/* Price */}
            <div className="flex-shrink-0 text-left">
              <p className="text-sm font-semibold text-gray-900">
                {Math.round((parseFloat(item.price || '0')) * item.quantity)} جنيه
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Divider */}
      <div className="my-6 border-t border-gray-200" />
      
      {/* Price Breakdown */}
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{isHalfPayment ? 'المبلغ المطلوب الآن' : 'المجموع الفرعي'}</span>
          <span className="font-medium text-gray-900">
            {Math.round(payableNow)} جنيه
          </span>
        </div>

        {isHalfPayment && remainingAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">المتبقي عند الاستلام</span>
            <span className="font-medium text-gray-900">
              {Math.round(remainingAmount)} جنيه
            </span>
          </div>
        )}
        
        {/* Wallet Fee (Instapay) - Only on order total */}
        {walletFee > 0 && (
          <div className="flex justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-gray-600">رسوم المحفظة (انستاباي)</span>
              <span className="text-xs text-gray-500 mt-0.5">
                {walletFeeInfo.percentage}% من قيمة الطلب
              </span>
            </div>
            <span className="font-medium text-gray-900">
              {Math.round(walletFee)} جنيه
            </span>
          </div>
        )}
        
        {/* Divider before grand total */}
        <div className="pt-3 border-t border-gray-200" />
        
        {/* Grand Total (Order + Wallet Fee) */}
        <div className="flex justify-between">
          <span className="text-base font-bold text-gray-900">
            المبلغ المطلوب دفعه
          </span>
          <span className="text-xl font-bold text-brand-600">
            {Math.round(grandTotal)} جنيه
          </span>
        </div>
        
        {/* Shipping - Separate (Paid on Delivery) */}
        <div className="p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start justify-between text-sm">
            <div className="flex-1">
              <span className="block font-medium text-blue-900">الشحن (دفع عند الاستلام)</span>
              <span className="block mt-1 text-xs text-blue-700">
                {shippingMethod ? shippingMethod.title : 'سيتم الحساب'}
              </span>
            </div>
            <span className="font-bold text-blue-900">
              {shippingMethod ? (
                `${Math.round(shippingCost)} جنيه`
              ) : (
                <span className="text-blue-600">سيتم الحساب</span>
              )}
            </span>
          </div>
          <p className="mt-2 text-xs text-blue-600">
            💡 تدفع رسوم الشحن نقداً لشركة الشحن عند استلام الطلب
          </p>
        </div>
      </div>
      
      
      {/* Vendor Info (if single vendor) */}
      {/* {cartItems.length > 0 && cartItems[0].vendor && (
        <div className="pt-4 mt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">البائع:</span>
            <span className="text-sm font-medium text-gray-900">
              {cartItems[0].vendor.store_name}
            </span>
          </div>
        </div>
      )} */}
    </div>
  )
}
