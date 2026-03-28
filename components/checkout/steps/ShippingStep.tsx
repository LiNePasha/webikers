'use client'

import { useState, useEffect } from 'react'
import { TruckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useCheckoutShipping, useCheckoutStep, useCheckoutAddress } from '@/store/checkoutStore'
import type { ShippingMethod } from '@/types'
import { safeFetch } from '@/lib/utils/safeFetch'

export default function ShippingStep() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  
  const { shippingMethod, setShippingMethod } = useCheckoutShipping()
  const { nextStep, previousStep } = useCheckoutStep()
  const { shippingAddress } = useCheckoutAddress()
  
  useEffect(() => {
    fetchShippingMethods()
  }, [shippingAddress])
  
  const fetchShippingMethods = async () => {
    setLoading(true)
    
    let url = '/api/checkout/shipping-methods'
    if (shippingAddress?.city) {
      url += `?city=${shippingAddress.city}`
    }
    
    const { data, error } = await safeFetch<{
      success: boolean
      data: ShippingMethod[]
    }>(url)
    
    setLoading(false)
    
    if (error || !data) {
      toast.error(error || 'فشل في جلب طرق الشحن')
      return
    }
    
    if (data.success) {
      setShippingMethods(data.data)
      
      // Auto-select if only one method
      if (data.data.length === 1 && !shippingMethod) {
        setShippingMethod(data.data[0])
      }
    } else {
      toast.error('فشل في جلب طرق الشحن')
    }
  }
  
  const handleContinue = () => {
    if (!shippingMethod) {
      toast.error('يرجى اختيار طريقة الشحن')
      return
    }
    nextStep()
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          طريقة الشحن
        </h2>
        <p className="text-gray-600">
          اختر طريقة الشحن المناسبة لك
        </p>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
        </div>
      )}
      
      {/* Shipping Methods */}
      {!loading && shippingMethods.length > 0 && (
        <div className="space-y-4">
          {shippingMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setShippingMethod(method)}
              className={`
                w-full p-6 rounded-lg border-2 text-right transition-all
                ${shippingMethod?.id === method.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-brand-300 bg-white'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`
                    p-3 rounded-lg
                    ${shippingMethod?.id === method.id ? 'bg-brand-100' : 'bg-gray-100'}
                  `}>
                    <TruckIcon className={`
                      w-6 h-6
                      ${shippingMethod?.id === method.id ? 'text-brand-600' : 'text-gray-600'}
                    `} />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {method.title}
                      </h3>
                      {method.zoneName && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {method.zoneName}
                        </span>
                      )}
                    </div>
                    
                    {method.estimatedDays && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>
                          التوصيل خلال {method.estimatedDays} {typeof method.estimatedDays === 'number' && method.estimatedDays > 10 ? 'يوم' : 'أيام'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Price & Selection */}
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(method.cost)}
                    </p>
                    <p className="text-sm text-gray-500">جنيه</p>
                  </div>
                  
                  {shippingMethod?.id === method.id && (
                    <CheckCircleIcon className="w-8 h-8 text-brand-600" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* No Methods Available */}
      {!loading && shippingMethods.length === 0 && (
        <div className="text-center py-12">
          <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد طرق شحن متاحة
          </h3>
          <p className="text-gray-600">
            عذراً، لا يمكننا الشحن إلى هذا العنوان حالياً
          </p>
        </div>
      )}
      
      {/* Navigation Buttons */}
      {!loading && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={previousStep}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← الرجوع
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!shippingMethod}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            متابعة إلى الدفع ←
          </button>
        </div>
      )}
    </div>
  )
}
