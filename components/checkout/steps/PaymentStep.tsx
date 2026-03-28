'use client'

import { useState, useEffect } from 'react'
import { CreditCardIcon, CheckCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useCheckoutPayment, useCheckoutStep } from '@/store/checkoutStore'
import { useCartStore } from '@/store/cartStore'
import type { PaymentMethod, PaymentProof } from '@/types'
import PaymentProofUpload from '../payment/PaymentProofUpload'

// Fixed payment methods - Instapay only
const AVAILABLE_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'instapay',
    title: 'الدفع عبر محفظة Instapay',
    description: 'قم بتحويل المبلغ إلى حساب Instapay ثم ارفع صورة إثبات الدفع',
    enabled: true,
    requiresProof: true,
    icon: '/images/instapay-logo.png',
    accountNumber: process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT_NUMBER || '01030351075',
    accountName: process.env.NEXT_PUBLIC_INSTAPAY_ACCOUNT_NAME || 'وليد أحمد',
  }
]

export default function PaymentStep() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(AVAILABLE_PAYMENT_METHODS)
  const [loading, setLoading] = useState(false)
  
  const { paymentMethod, paymentProof, setPaymentMethod, setPaymentProof } = useCheckoutPayment()
  const { nextStep, previousStep } = useCheckoutStep()
  const { totalPrice } = useCartStore()

  // Set Instapay as default payment method
  useEffect(() => {
    if (!paymentMethod && AVAILABLE_PAYMENT_METHODS.length > 0) {
      setPaymentMethod(AVAILABLE_PAYMENT_METHODS[0])
    }
  }, [])
  
  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method)
    
    // Clear payment proof if switching from Instapay to another method
    if (method.id !== 'instapay' && paymentProof) {
      setPaymentProof(null)
    }
  }
  
  const handleContinue = () => {
    if (!paymentMethod) {
      toast.error('يرجى اختيار طريقة الدفع')
      return
    }
    
    // Check if Instapay requires proof
    if (paymentMethod.requiresProof && !paymentProof) {
      toast.error('يرجى رفع إثبات الدفع')
      return
    }
    
    nextStep()
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          طريقة الدفع
        </h2>
        <p className="text-gray-600">
          اختر طريقة الدفع المناسبة لك
        </p>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 rounded-full animate-spin border-brand-500 border-t-transparent" />
        </div>
      )}
      
      {/* Payment Methods */}
      {!loading && paymentMethods.length > 0 && (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <button
                onClick={() => handleMethodSelect(method)}
                className={`
                  w-full p-6 rounded-lg border-2 text-right transition-all
                  ${paymentMethod?.id === method.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-brand-300 bg-white'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1 gap-4">
                    {/* Icon */}
                    <div className={`
                      p-3 rounded-lg
                      ${paymentMethod?.id === method.id ? 'bg-brand-100' : 'bg-gray-100'}
                    `}>
                      {method.id === 'instapay' ? (
                        <BanknotesIcon className={`
                          w-6 h-6
                          ${paymentMethod?.id === method.id ? 'text-brand-600' : 'text-gray-600'}
                        `} />
                      ) : (
                        <CreditCardIcon className={`
                          w-6 h-6
                          ${paymentMethod?.id === method.id ? 'text-brand-600' : 'text-gray-600'}
                        `} />
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {method.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                      
                      {/* Instapay Account Details */}
                      {method.id === 'instapay' && method.accountNumber && (
                        <div className="p-3 mt-3 rounded-lg bg-gray-50">
                          <p className="mb-1 text-sm font-medium text-gray-700">
                            معلومات الحساب:
                          </p>
                          <p className="font-mono text-sm text-gray-900">
                            📱 {method.accountNumber}
                          </p>
                          {method.accountName && (
                            <p className="mt-1 text-sm text-gray-600">
                              {method.accountName}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {method.requiresProof && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                          <span className="text-amber-500">⚠️</span>
                          <span>يتطلب إثبات الدفع</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {paymentMethod?.id === method.id && (
                    <CheckCircleIcon className="w-8 h-8 text-brand-600" />
                  )}
                </div>
              </button>
              
              {/* Payment Proof Upload (for Instapay) */}
              {paymentMethod?.id === method.id &&
                method.requiresProof &&
                method.id === 'instapay' && (
                  <div className="p-6 mt-4 rounded-lg bg-gray-50">
                    <PaymentProofUpload
                      amount={totalPrice}
                      onUploadSuccess={(proof) => setPaymentProof(proof)}
                      onRemove={() => setPaymentProof(null)}
                      existingProof={paymentProof || undefined}
                    />
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
      
      {/* No Methods Available */}
      {!loading && paymentMethods.length === 0 && (
        <div className="py-12 text-center">
          <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            لا توجد طرق دفع متاحة
          </h3>
          <p className="text-gray-600">
            عذراً، لا يمكن إتمام الدفع حالياً
          </p>
        </div>
      )}
      
      {/* Navigation Buttons */}
      {!loading && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={previousStep}
            className="px-6 py-3 font-semibold text-gray-700 transition-colors border-2 border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← الرجوع
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!paymentMethod || (paymentMethod.requiresProof && !paymentProof)}
            className="px-8 py-3 font-semibold text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            متابعة إلى المراجعة ←
          </button>
        </div>
      )}
    </div>
  )
}
