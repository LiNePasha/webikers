'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { parseKashierCallback } from '@/lib/kashier/hash'
import { XCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

function PaymentFailureContent() {
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in a popup window
    const isPopup = window.opener !== null;
    
    if (isPopup) {
      // We're in a popup - redirect parent and close
      const queryString = window.location.search;
      if (window.opener && !window.opener.closed) {
        // Redirect parent window to failure page with query params
        window.opener.location.href = window.location.href;
        // Close popup
        window.close();
      }
      return;
    }
    
    // Get the full query string from URL
    const queryString = window.location.search.slice(1) // Remove leading '?'

    if (!queryString) {
      setError('معلومات الدفع غير متوفرة')
      setVerifying(false)
      return
    }

    try {
      // Parse and validate Kashier callback
      const data = parseKashierCallback(queryString)

      setPaymentData(data)
      setVerifying(false)
      
      // Clear pending order from sessionStorage
      sessionStorage.removeItem('pendingOrder')

    } catch (err) {
      console.error('Error parsing payment callback:', err)
      setError('حدث خطأ أثناء معالجة عملية الدفع')
      setVerifying(false)
    }
  }, [])

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        <div className="w-full max-w-md p-8 mx-4 text-center bg-white shadow-2xl rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-6 border-b-4 rounded-full animate-spin border-brand-600"></div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">جاري التحقق من الدفع...</h2>
          <p className="text-gray-600">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50" dir="rtl">
      <div className="w-full max-w-2xl p-8 mx-4 text-center bg-white shadow-2xl md:p-12 rounded-3xl">
        {/* Error Icon */}
        <div className="relative mx-auto mb-8 w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-orange-600 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full">
            <XCircleIcon className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Failure Message */}
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          فشلت عملية الدفع
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          لم يتم إتمام عملية الدفع بنجاح
        </p>

        {/* Error Details */}
        {paymentData?.orderId && (
          <div className="p-6 mb-8 border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">تفاصيل العملية</h2>
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-between py-2 border-b border-red-200">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-mono text-lg font-bold text-brand-600">
                  #{paymentData.orderId}
                </span>
              </div>
              {paymentData.amount && (
                <div className="flex items-center justify-between py-2 border-b border-red-200">
                  <span className="text-gray-600">المبلغ:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {paymentData.amount} {paymentData.currency || 'EGP'}
                  </span>
                </div>
              )}
              {paymentData.status && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">الحالة:</span>
                  <span className="font-medium text-red-600">
                    {paymentData.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Possible Reasons */}
        <div className="p-6 mb-8 text-right border border-orange-200 bg-orange-50 rounded-2xl">
          <h3 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
            <ExclamationCircleIcon className="w-5 h-5 text-orange-600" />
            الأسباب المحتملة:
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-orange-600">•</span>
              <span>عدم كفاية الرصيد في البطاقة أو المحفظة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-orange-600">•</span>
              <span>إدخال بيانات غير صحيحة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-orange-600">•</span>
              <span>انتهاء وقت الجلسة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-orange-600">•</span>
              <span>رفض البنك للعملية</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-orange-600">•</span>
              <span>إلغاء العملية من قبل المستخدم</span>
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="p-6 mb-8 text-right border border-blue-200 bg-blue-50 rounded-2xl">
          <h3 className="mb-3 font-bold text-gray-900">ماذا الآن؟</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-blue-600">✓</span>
              <span>تأكد من توفر الرصيد الكافي</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-blue-600">✓</span>
              <span>تحقق من صحة بيانات البطاقة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-blue-600">✓</span>
              <span>جرب طريقة دفع أخرى</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-blue-600">✓</span>
              <span>تواصل مع الدعم الفني إذا استمرت المشكلة</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 md:flex-row">
          <button
            onClick={() => router.push('/checkout')}
            className="flex items-center justify-center flex-1 gap-2 px-6 py-4 font-bold text-white transition-all rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800"
          >
            <ArrowPathIcon className="w-5 h-5" />
            إعادة المحاولة
          </button>
          <button
            onClick={() => router.push('/products')}
            className="flex-1 px-6 py-4 font-bold text-gray-700 transition-all border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400"
          >
            العودة للتسوق
          </button>
        </div>

        {/* Contact Support */}
        <div className="pt-6 mt-8 border-t border-gray-200">
          <p className="mb-2 text-sm text-gray-600">
            هل تواجه مشكلة؟
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTACT_PHONE?.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <span>📱</span>
            تواصل معنا عبر WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        <div className="w-full max-w-md p-8 mx-4 text-center bg-white shadow-2xl rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-6 border-b-4 rounded-full animate-spin border-brand-600"></div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">جاري التحميل...</h2>
          <p className="text-gray-600">يرجى الانتظار</p>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  )
}
