'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useShoppingCart } from '@/store/cartStore'

function PaymentSuccessContent() {
  const router = useRouter()
  const { resetCart } = useShoppingCart()
  const [verifying, setVerifying] = useState(true)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [orderData, setOrderData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in a popup window
    const isPopup = window.opener !== null;
    
    if (isPopup) {
      // We're in a popup - redirect parent and close
      const queryString = window.location.search;
      if (window.opener && !window.opener.closed) {
        // Redirect parent window to success page with query params
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

    const processPayment = async () => {
      try {
        console.log('🔍 Full Query String:', queryString);
        
        // Parse callback parameters (client-side, no validation)
        const params = new URLSearchParams(queryString);
        const data = {
          orderId: params.get('merchantOrderId') || params.get('orderId'),
          amount: params.get('amount'),
          currency: params.get('currency'),
          status: params.get('paymentStatus') || params.get('status'),
          paymentMethod: params.get('payment_method'),
          transactionId: params.get('transactionId'),
          cardNumber: params.get('maskedCard') || params.get('card_number'),
          orderReference: params.get('orderReference'),
          cardBrand: params.get('cardBrand'),
          signature: params.get('signature'),
          mode: params.get('mode')
        };
        
        console.log('📦 Parsed Payment Data:', data);

        // Check payment status
        if (data.status?.toLowerCase() !== 'success' && data.status?.toLowerCase() !== 'successful') {
          console.error('❌ Payment status not successful:', data.status);
          setError('فشلت عملية الدفع')
          setVerifying(false)
          return
        }

        console.log('✅ Payment successful! Creating order...');
        setPaymentData(data)
        setVerifying(false)

        // Check if this is a temp order (needs to create WooCommerce order)
        if (data.orderId?.startsWith('TEMP-')) {
          setCreatingOrder(true)
          
          // Get pending order data from sessionStorage
          const pendingOrderJSON = sessionStorage.getItem('pendingOrder')
          
          if (!pendingOrderJSON) {
            toast.error('لم يتم العثور على بيانات الطلب')
            setCreatingOrder(false)
            return
          }

          const pendingOrderData = JSON.parse(pendingOrderJSON)

          // Create WooCommerce order
          const orderResponse = await fetch('/api/kashier/create-order-after-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tempOrderId: data.orderId,
              kashierTransactionId: data.transactionId,
              kashierPaymentMethod: data.paymentMethod,
              kashierCardNumber: data.cardNumber,
              pendingOrderData
            })
          })

          const orderResult = await orderResponse.json()

          if (orderResult.success && orderResult.order) {
            setOrderData(orderResult.order)
            
            // Clear sessionStorage, localStorage, and Zustand store
            sessionStorage.removeItem('pendingOrder')
            localStorage.removeItem('spare2app_cart')
            resetCart() // Clear Zustand store state
            
            console.log('✅ Order created successfully - Cart cleared')
            console.log('📋 Order ID:', orderResult.order.id)
            console.log('🧹 Cart state reset complete')
            
            toast.success('✅ تم إنشاء الطلب بنجاح!')
          } else {
            toast.error('فشل في إنشاء الطلب: ' + (orderResult.error || 'خطأ غير معروف'))
          }

          setCreatingOrder(false)
        } else {
          // Regular order (already created)
          toast.success('✅ تم الدفع بنجاح!')
        }

      } catch (err) {
        console.error('Error processing payment:', err)
        setError('حدث خطأ أثناء معالجة عملية الدفع')
        setVerifying(false)
        setCreatingOrder(false)
      }
    }

    processPayment()
  }, [])

  if (verifying || creatingOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        <div className="w-full max-w-md p-8 mx-4 text-center bg-white shadow-2xl rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-6 border-b-4 rounded-full animate-spin border-brand-600"></div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            {creatingOrder ? 'جاري إنشاء الطلب...' : 'جاري التحقق من الدفع...'}
          </h2>
          <p className="text-gray-600">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        <div className="w-full max-w-md p-8 mx-4 text-center bg-white shadow-2xl rounded-3xl">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
            <XCircleIcon className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">فشل التحقق</h1>
          <p className="mb-8 text-lg text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/products')}
            className="w-full px-6 py-3 font-bold text-white transition-all rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800"
          >
            العودة للتسوق
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50" dir="rtl">
      <div className="w-full max-w-2xl p-8 mx-4 text-center bg-white shadow-2xl md:p-12 rounded-3xl">
        {/* Success Icon */}
        <div className="relative mx-auto mb-8 w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-green-600 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full">
            <CheckCircleIcon className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          🎉 تم الدفع بنجاح!
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          تم استلام طلبك وتأكيد الدفع
        </p>

        {/* Payment Details */}
        <div className="p-6 mb-8 border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl">
          <h2 className="mb-4 text-lg font-bold text-gray-900">تفاصيل العملية</h2>
          <div className="space-y-3 text-right">
            <div className="flex items-center justify-between py-2 border-b border-green-200">
              <span className="text-gray-600">رقم الطلب:</span>
              <span className="font-mono text-lg font-bold text-brand-600">
                #{orderData?.id || paymentData?.orderId}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-green-200">
              <span className="text-gray-600">المبلغ المدفوع:</span>
              <span className="text-lg font-bold text-green-600">
                {paymentData?.amount} {paymentData?.currency || 'EGP'}
              </span>
            </div>
            {paymentData?.transactionId && (
              <div className="flex items-center justify-between py-2 border-b border-green-200">
                <span className="text-gray-600">رقم المعاملة:</span>
                <span className="font-mono text-sm text-gray-900">
                  {paymentData.transactionId}
                </span>
              </div>
            )}
            {paymentData?.paymentMethod && (
              <div className="flex items-center justify-between py-2 border-b border-green-200">
                <span className="text-gray-600">طريقة الدفع:</span>
                <span className="font-medium text-gray-900">
                  {paymentData.paymentMethod}
                </span>
              </div>
            )}
            {paymentData?.cardNumber && (
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">البطاقة:</span>
                <span className="font-mono text-sm text-gray-900">
                  **** {paymentData.cardNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="p-6 mb-8 text-right border border-blue-200 bg-blue-50 rounded-2xl">
          <h3 className="mb-3 font-bold text-gray-900">الخطوات القادمة:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-blue-600">✓</span>
              <span>سيتم توصيل طلبك من 3 ل 5 ايام عمل</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-blue-600">✓</span>
              <span>سوف تتلقى رسالة تأكيد عبر البريد الإلكتروني أو الهاتف</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-blue-600">✓</span>
              <span>يمكنك متابعة حالة طلبك من حسابك</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 md:flex-row">
          <button
            onClick={() => router.push('/account')}
            className="flex-1 px-6 py-4 font-bold text-white transition-all rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800"
          >
            متابعة الطلب
          </button>
          <button
            onClick={() => router.push('/products')}
            className="flex-1 px-6 py-4 font-bold text-gray-700 transition-all border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400"
          >
            متابعة التسوق
          </button>
        </div>

        {/* Thank You Message */}
        <div className="pt-6 mt-8 border-t border-gray-200">
          <p className="text-gray-600">
            شكراً لثقتك في{' '}
            <span className="font-bold text-brand-600">
              {process.env.NEXT_PUBLIC_VENDOR_NAME || 'WeBikers'}
            </span>
            ! 🙏
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
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
      <PaymentSuccessContent />
    </Suspense>
  )
}
