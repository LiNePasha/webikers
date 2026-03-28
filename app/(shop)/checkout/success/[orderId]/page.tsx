'use client'

export const dynamic = 'force-dynamic'

import { use, useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon, TruckIcon, ReceiptPercentIcon, ShareIcon, CameraIcon } from '@heroicons/react/24/solid'
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import confetti from 'canvas-confetti'
import domtoimage from 'dom-to-image-more'
import toast from 'react-hot-toast'

interface OrderSuccess {
  id: number
  orderNumber: string
  status: string
  total: number | string
  currency: string
  dateCreated?: string
}

export default function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = use(params) // Unwrap the Promise
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderSuccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [capturing, setCapturing] = useState(false)
  const successCardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Extract URL params with localStorage fallback and API data override
  const getOrderDetail = (paramName: string, defaultValue: string) => {
    // First try URL params
    const urlValue = searchParams.get(paramName)
    if (urlValue) return urlValue
    
    // Fallback to localStorage
    try {
      const savedDetails = localStorage.getItem('orderDetails')
      if (savedDetails) {
        const details = JSON.parse(savedDetails)
        if (details[paramName]) {
          console.log(`✅ Using ${paramName} from localStorage:`, details[paramName])
          return details[paramName]
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
    }
    
    return defaultValue
  }
  
  // State for order details
  const [sellerName, setSellerName] = useState('متجر غير محدد')
  const [totalPay, setTotalPay] = useState('0')
  const paymentMethod = getOrderDetail('paymentMethod', 'cash')
  const deliveryType = getOrderDetail('deliveryType', 'home_delivery')
  const storeAddress = searchParams.get('storeAddress') || ''
  const googleMapsLink = searchParams.get('googleMapsLink') || ''
  
  useEffect(() => {
    // Update seller name and total from URL params or localStorage
    console.log('📋 URL params:', {
      sellerName: searchParams.get('sellerName'),
      totalPay: searchParams.get('totalPay')
    })
    
    const initialSellerName = getOrderDetail('sellerName', 'متجر غير محدد')
    const initialTotalPay = getOrderDetail('totalPay', '0')
    
    console.log('✅ Initial values:', { initialSellerName, initialTotalPay })
    setSellerName(initialSellerName)
    setTotalPay(initialTotalPay)
    
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
    
    // Fetch order details from WooCommerce
    const fetchOrderDetails = async () => {
      try {
        console.log('🔍 Fetching order details for order:', orderId)
        const response = await fetch(`/api/orders/${orderId}`)
        const data = await response.json()
        
        if (data.success && data.order) {
          console.log('✅ Order details fetched:', data.order)
          
          // Update order state
          setOrder({
            id: data.order.id,
            orderNumber: `#${data.order.id}`,
            status: data.order.status,
            total: data.order.total,
            currency: 'EGP',
            dateCreated: data.order.dateCreated,
          })
          
          // ✅ Update seller name and total from API
          if (data.order.vendorName) {
            console.log('✅ Updating seller name from API:', data.order.vendorName)
            setSellerName(data.order.vendorName)
          }
          
          // Calculate products total (total - shipping)
          const productsTotal = data.order.total - (data.order.shippingTotal || 0)
          console.log('✅ Updating total from API:', productsTotal)
          setTotalPay(productsTotal.toFixed(2))
          
        } else {
          console.warn('⚠️ Could not fetch order details, using URL/localStorage values')
          setOrder({
            id: parseInt(orderId),
            orderNumber: `#${orderId}`,
            status: 'processing',
            total: 0,
            currency: 'EGP',
            dateCreated: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('❌ Error fetching order details:', error)
        setOrder({
          id: parseInt(orderId),
          orderNumber: `#${orderId}`,
          status: 'processing',
          total: 0,
          currency: 'EGP',
          dateCreated: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrderDetails()
    
    // Manual order update for Kashier (webhook doesn't work on localhost)
    const updateOrderStatus = () => {
      console.log('🔍 Checking for Kashier payment...')
      
      // Check if this is a Kashier payment
      const savedDetails = localStorage.getItem('orderDetails')
      console.log('📦 Saved order details:', savedDetails)
      
      if (savedDetails) {
        try {
          const details = JSON.parse(savedDetails)
          console.log('📋 Parsed details:', details)
          console.log('💳 Payment method:', details.paymentMethod)
          
          if (details.paymentMethod === 'kashier') {
            console.log('✅ Kashier payment detected! Will update in 3 seconds...')
            
            // Wait 3 seconds to ensure order is fully created and fetched
            setTimeout(async () => {
              try {
                console.log('🔄 Updating order status now...')
                console.log('📤 Sending PUT request to:', `/api/orders/${orderId}`)
                
                const requestBody = {
                  status: 'processing',
                  note: 'تم الدفع بنجاح عبر كاشير (manual confirmation)',
                  metaData: [
                    { key: '_kashier_payment_pending', value: 'no' },
                    { key: '_payment_status', value: 'completed' }
                  ]
                }
                
                console.log('📤 Request body:', requestBody)
                
                const updateResponse = await fetch(`/api/orders/${orderId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(requestBody)
                })
                
                console.log('📥 Response status:', updateResponse.status)
                const result = await updateResponse.json()
                console.log('📥 Response data:', result)
                
                if (result.success) {
                  console.log('✅ Order status updated to:', result.updatedStatus)
                  // Refresh order details to show updated status
                  setTimeout(() => {
                    console.log('🔄 Reloading page to show updated status...')
                    window.location.reload()
                  }, 1000)
                } else {
                  console.error('❌ Update failed:', result.error)
                  alert(`فشل تحديث حالة الطلب: ${result.error}`)
                }
              } catch (updateError) {
                console.error('❌ Error updating order status:', updateError)
                alert(`خطأ في تحديث حالة الطلب: ${updateError}`)
              }
            }, 3000)
          } else {
            console.log('⚠️ Not a Kashier payment, payment method is:', details.paymentMethod)
          }
        } catch (error) {
          console.error('❌ Error parsing order details:', error)
        }
      } else {
        console.log('⚠️ No saved order details found in localStorage')
      }
    }
    
    updateOrderStatus()
  }, [orderId])
  
  // Screenshot and Share functionality - Using dom-to-image for better RTL support
  const handleScreenshotAndShare = async () => {
    if (!successCardRef.current) return
    
    setCapturing(true)
    toast.loading('جاري التقاط الصورة...')
    
    try {
      // Convert DOM to blob directly (better RTL support)
      const blob = await domtoimage.toBlob(successCardRef.current, {
        quality: 1,
        bgcolor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top right',
        }
      })
      
      if (!blob) {
        toast.dismiss()
        toast.error('فشل في التقاط الصورة')
        setCapturing(false)
        return
      }
      
      const file = new File([blob], `order-${orderId}.png`, { type: 'image/png' })
      
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `طلب رقم ${orderId}`,
            text: `تم إنشاء طلبي بنجاح من ${sellerName}`,
            files: [file],
          })
          toast.dismiss()
          toast.success('تم المشاركة بنجاح!')
        } catch (shareError: any) {
          if (shareError.name !== 'AbortError') {
            // Fallback: Download image
            downloadBlob(blob)
          }
          toast.dismiss()
        }
      } else {
        // Fallback: Download image
        downloadBlob(blob)
      }
      
      setCapturing(false)
    } catch (error) {
      console.error('Screenshot error:', error)
      toast.dismiss()
      toast.error('فشل في التقاط الصورة')
      setCapturing(false)
    }
  }
  
  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `order-${orderId}.png`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    toast.dismiss()
    toast.success('تم حفظ الصورة!')
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 rounded-full animate-spin border-brand-500 border-t-transparent" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-6 bg-gradient-to-br from-green-50 to-brand-50" dir="rtl">
      <div className="container max-w-3xl px-4 mx-auto">
        {/* Success Card - Optimized for Screenshot with RTL */}
        <div 
          ref={successCardRef} 
          className="px-6 py-4 text-center bg-white shadow-xl rounded-2xl md:p-8"
          style={{
            direction: 'rtl',
            unicodeBidi: 'embed',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          {/* Success Icon */}
          <div className="mb-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full md:h-24 md:w-24">
              <CheckCircleIcon className="w-12 h-12 text-green-600 md:h-16 md:w-16" />
            </div>
          </div>
          
          {/* Success Message */}
          <h1 className="mb-2 text-xl font-bold text-gray-900 md:text-4xl">
            🎉 تم إنشاء طلبك بنجاح! 
          </h1>
          <p className="mb-2 text-base text-gray-600">
            شكراً لك! تم استلام طلبك من <span className="font-semibold text-brand-600">{sellerName}</span> وسيتم معالجته قريباً
          </p>

          {/* Order Number */}
          {order && (
            <div className="inline-block px-6 py-4 mb-4 border-2 rounded-lg bg-brand-50 border-brand-200">
              <p className="mb-1 text-sm text-gray-600">رقم الطلب</p>
              <p className="text-2xl font-bold text-brand-600">{order.orderNumber}</p>
            </div>
          )}
          
          {/* Info Cards Grid - Hidden in screenshots */}
          {!capturing && (
            <div className="grid grid-cols-2 gap-4 mb-8 text-right" dir="rtl">
              {/* Total Amount */}
              <div className="p-4 rounded-lg bg-gray-50" dir="rtl">
                <div className="flex items-center gap-2 mb-2" dir="rtl">
                  <h3 className="font-semibold text-gray-900">المبلغ الإجمالي</h3>
                  <ReceiptPercentIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-lg font-bold text-gray-900" dir="rtl">{parseFloat(totalPay).toFixed(2)} جنيه</p>
              </div>
              
              {/* Shipping */}
              <div className="p-4 rounded-lg bg-gray-50" dir="rtl">
                <div className="flex items-center gap-2 mb-2" dir="rtl">
                  <h3 className="font-semibold text-gray-900">الشحن</h3>
                  <TruckIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-gray-600" dir="rtl">سيتم التوصيل قريباً</p>
              </div>
              
              {/* Payment Method */}
              <div className="col-span-2 p-4 rounded-lg bg-gray-50" dir="rtl">
                <div className="flex items-center gap-2 mb-2" dir="rtl">
                  <h3 className="font-semibold text-gray-900">طريقة الدفع</h3>
                  <ReceiptPercentIcon className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-sm text-gray-600" dir="rtl">
                  {paymentMethod === 'cash' ? '💵 الدفع عند الاستلام' : '💳 الدفع الإلكتروني'}
                </p>
              </div>
            </div>
          )}
          
          {/* Next Steps - Based on Delivery Type */}
          <div className="p-6 mb-8 text-right border border-blue-200 rounded-lg bg-blue-50">
            <h3 className="mb-3 font-semibold text-blue-900">
              {deliveryType === 'store_pickup' ? '📍 خطوات الاستلام من المتجر:' : '🚚 خطوات التوصيل:'}
            </h3>
            
            {deliveryType === 'store_pickup' ? (
              <>
                {/* Store Pickup Steps */}
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">1️⃣</span>
                    <span>سيتم مراجعة طلبك والتواصل معك خلال 24 ساعة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">2️⃣</span>
                    <span>احتفظ برقم الطلب <strong>{order?.orderNumber}</strong> معك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">3️⃣</span>
                    <span>توجه للمتجر واستلم طلبك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✨</span>
                    <span className="font-semibold text-green-700">وفرت رسوم الشحن! 🎉</span>
                  </li>
                </ul>
                
                {/* Store Address & Google Maps for Store Pickup */}
                {(storeAddress || googleMapsLink) && (
                  <div className="p-3 mt-4 border border-green-300 rounded-lg bg-green-50">
                    <h4 className="mb-2 text-sm font-bold text-green-900">📍 معلومات المتجر:</h4>
                    
                    {storeAddress && (
                      <p className="mb-2 text-sm text-green-800">
                        <strong>العنوان:</strong> {storeAddress}
                      </p>
                    )}
                    
                    {googleMapsLink && (
                      <p className="text-sm text-green-800">
                        <strong>📍 الموقع:</strong>{' '}
                        <a
                          href={googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline text-blue-600 hover:text-blue-800 decoration-2 underline-offset-2"
                        >
                          {googleMapsLink}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Home Delivery Steps */
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">1️⃣</span>
                  <span>سيتم مراجعة طلبك خلال 24 ساعة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">2️⃣</span>
                  <span>سنرسل رسالة تأكيد على رقم هاتفك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">3️⃣</span>
                  <span>سيتم تجهيز طلبك وشحنه من المتجر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">4️⃣</span>
                  <span>سيتم إرسال رقم التتبع عند الشحن</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">5️⃣</span>
                  <span>سيصلك الطلب خلال 2-5 أيام عمل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">💡</span>
                  <span>تأكد من وجود أحد لاستلام الطلب</span>
                </li>
              </ul>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {/* Screenshot & Share Button */}
            <button
              onClick={handleScreenshotAndShare}
              disabled={capturing}
              className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {capturing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                  جاري التقاط الصورة...
                </>
              ) : (
                <>
                  <ShareIcon className="w-5 h-5" />
                  📸 مشاركة الطلب
                </>
              )}
            </button>
            
            {/* Continue Shopping */}
            <Link
              href="/products"
              className="px-6 py-3 font-semibold text-center text-gray-700 transition-colors border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
        
        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="mb-2 text-gray-600">هل تحتاج مساعدة؟</p>
          <Link
            href="/contact"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            تواصل معنا
          </Link>
        </div>
      </div>
    </div>
  )
}
