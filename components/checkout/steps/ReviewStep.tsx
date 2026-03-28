'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPinIcon, TruckIcon, CreditCardIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useCheckoutStore, useCheckoutStep } from '@/store/checkoutStore'
import { useCartStore } from '@/store/cartStore'
import type { CartItem } from '@/types'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { safeFetch } from '@/lib/utils/safeFetch'

export default function ReviewStep() {
  const [submitting, setSubmitting] = useState(false)
  
  const router = useRouter()
  const checkoutData = useCheckoutStore((state) => state.checkoutData)
  const setOrderNotes = useCheckoutStore((state) => state.setOrderNotes)
  const { previousStep } = useCheckoutStep()
  const { cartItems, totalPrice, resetCart } = useCartStore()
  
  const { shippingAddress, billingAddress, shippingMethod, paymentMethod, paymentProof, orderNotes } =
    checkoutData
  
  const totalAmount = totalPrice + (shippingMethod?.cost || 0)
  
  const handleSubmitOrder = async () => {
    if (!shippingAddress || !billingAddress || !shippingMethod || !paymentMethod) {
      toast.error('البيانات غير مكتملة')
      return
    }
    
    setSubmitting(true)
    
    // Prepare order data
    const orderData = {
      customerId: 1, // TODO: Get from session
      paymentMethod: paymentMethod.id,
      paymentMethodTitle: paymentMethod.title,
      shippingAddress,
      billingAddress,
      lineItems: cartItems.map((item: CartItem) => ({
        product_id: item.id,
        quantity: item.quantity,
        variation_id: 0,
      })),
      shippingLines: [
        {
          method_id: shippingMethod.methodId || shippingMethod.id,
          method_title: shippingMethod.title,
          total: shippingMethod.cost.toString(),
        },
      ],
      customerNote: orderNotes || undefined,
      metaData: [],
      paymentProof: paymentProof || undefined,
      totalWeight: cartItems.reduce((sum: number, item: CartItem) => sum + 0.5 * item.quantity, 0),
    }
    
    const { data, error } = await safeFetch<{
      success: boolean
      order?: { id: string | number }
      error?: string
    }>('/api/checkout/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })
    
    setSubmitting(false)
    
    if (error || !data) {
      toast.error(error || 'فشل إنشاء الطلب')
      return
    }
    
    if (data.success && data.order) {
      toast.success('تم إنشاء الطلب بنجاح!')
      resetCart()
      router.push(`/checkout/success/${data.order.id}`)
    } else {
      toast.error(data.error || 'فشل إنشاء الطلب')
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          مراجعة الطلب
        </h2>
        <p className="text-gray-600">
          تأكد من صحة البيانات قبل إتمام الطلب
        </p>
      </div>
      
      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPinIcon className="w-6 h-6 text-brand-600" />
          <h3 className="text-lg font-semibold text-gray-900">عنوان الشحن</h3>
        </div>
        {shippingAddress && (
          <div className="text-gray-700 space-y-1">
            <p className="font-medium">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.phone}</p>
            <p>
              {shippingAddress.cityName || shippingAddress.city} -{' '}
              {shippingAddress.districtName || shippingAddress.district}
            </p>
            <p>{shippingAddress.address}</p>
            {(shippingAddress.building || shippingAddress.floor || shippingAddress.apartment) && (
              <p className="text-sm text-gray-600">
                {shippingAddress.building && `عمارة ${shippingAddress.building}`}
                {shippingAddress.floor && ` - دور ${shippingAddress.floor}`}
                {shippingAddress.apartment && ` - شقة ${shippingAddress.apartment}`}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Shipping Method */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TruckIcon className="w-6 h-6 text-brand-600" />
          <h3 className="text-lg font-semibold text-gray-900">طريقة الشحن</h3>
        </div>
        {shippingMethod && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{shippingMethod.title}</p>
              {shippingMethod.estimatedDays && (
                <p className="text-sm text-gray-600 mt-1">
                  التوصيل خلال {shippingMethod.estimatedDays} أيام
                </p>
              )}
            </div>
            <p className="text-lg font-bold text-gray-900">
              {Math.round(shippingMethod.cost)} جنيه
            </p>
          </div>
        )}
      </div>
      
      {/* Payment Method */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCardIcon className="w-6 h-6 text-brand-600" />
          <h3 className="text-lg font-semibold text-gray-900">طريقة الدفع</h3>
        </div>
        {paymentMethod && (
          <div>
            <p className="font-medium text-gray-900">{paymentMethod.title}</p>
            {paymentProof && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                <span>✅</span>
                <span>تم رفع إثبات الدفع</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingBagIcon className="w-6 h-6 text-brand-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            المنتجات ({cartItems.length})
          </h3>
        </div>
        <div className="space-y-4">
          {cartItems.map((item: CartItem) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.thumbnail ? (
                  <OptimizedImage
                    src={item.thumbnail}
                    alt={item.name || 'Product'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name || 'منتج'}</h4>
                <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900">
                {Math.round((parseFloat(item.price || '0')) * item.quantity)} جنيه
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Order Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ملاحظات على الطلب (اختياري)
        </label>
        <textarea
          value={orderNotes}
          onChange={(e) => {
            setOrderNotes(e.target.value)
            setOrderNotes(e.target.value)
          }}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          placeholder="أي ملاحظات خاصة بالطلب..."
        />
      </div>
      
      {/* Total */}
      <div className="bg-brand-50 border-2 border-brand-200 rounded-lg p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>المجموع الفرعي</span>
            <span>{Math.round(totalPrice)} جنيه</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>الشحن</span>
            <span>{Math.round(shippingMethod?.cost || 0)} جنيه</span>
          </div>
          <div className="border-t border-brand-300 pt-2 flex justify-between">
            <span className="text-xl font-bold text-gray-900">الإجمالي</span>
            <span className="text-2xl font-bold text-brand-600">
              {Math.round(totalAmount)} جنيه
            </span>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={previousStep}
          disabled={submitting}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← الرجوع
        </button>
        
        <button
          onClick={handleSubmitOrder}
          disabled={submitting}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>جاري إنشاء الطلب...</span>
            </div>
          ) : (
            'تأكيد الطلب'
          )}
        </button>
      </div>
    </div>
  )
}
