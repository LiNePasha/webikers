'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { wooCommerceAPI } from '@/lib/api/woocommerce'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

interface EnhancedStoreData {
  vendor_id: string
  vendor_display_name: string
  vendor_description: string
  vendor_email?: string
  vendor_phone?: string
  social_facebook?: string
  social_youtube?: string
  social_tiktok?: string
  total_products: number
  vendor_rating: number
}

export default function AboutPage() {
  const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID || '22'
  
  const [storeData, setStoreData] = useState<EnhancedStoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load enhanced store data
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await wooCommerceAPI.getEnhancedStore(VENDOR_ID)
        console.log('📦 Store data loaded:', data)
        setStoreData(data)
      } catch (error: any) {
        console.error('Error loading store data:', error)
        setError(error.message || 'فشل تحميل بيانات المتجر')
      } finally {
        setLoading(false)
      }
    }

    loadStoreData()
  }, [VENDOR_ID])

  // Update page title when data loads
  useEffect(() => {
    if (storeData) {
      document.title = `عن ${storeData.vendor_display_name} - WeBikers`
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        const plainDescription = storeData.vendor_description?.replace(/<[^>]*>/g, '').substring(0, 160) || 'تعرف على متجرنا وخدماتنا في قطع غيار وأكسسوارات الموتوسيكلات'
        metaDescription.setAttribute('content', plainDescription)
      }
    }
  }, [storeData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="border-b bg-white/80 backdrop-blur-sm border-gray-200/50">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center space-x-2 space-x-reverse animate-pulse">
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8 mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 animate-pulse"
          >
            <div className="overflow-hidden bg-white shadow-xl rounded-3xl">
              <div className="p-8 space-y-4">
                <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>

            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl">
                <div className="w-1/4 h-6 mb-4 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  if (error || !storeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md p-12 mx-4 text-center bg-white border shadow-2xl rounded-3xl border-red-200/50"
        >
          <motion.div 
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            className="mb-6 text-8xl"
          >
            😕
          </motion.div>
          
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            عذراً، حدث خطأ
          </h2>
          
          <p className="mb-6 leading-relaxed text-gray-600">
            {error || 'لا يمكن تحميل بيانات المتجر'}
          </p>
          
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-white transition-shadow bg-gradient-to-r from-brand-500 to-purple-600 rounded-xl hover:shadow-lg"
            >
              🔄 إعادة المحاولة
            </button>
            
            <Link
              href="/"
              className="px-6 py-3 text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Breadcrumbs */}
      <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-sm border-gray-200/50">
        <div className="container px-4 py-4 mx-auto">
          <Breadcrumbs 
            items={[
              { label: 'الرئيسية', href: '/' },
              { label: 'عن المتجر', current: true }
            ]}
          />
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* About Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 text-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    ℹ️
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">عن المتجر</h2>
                </div>
                
                {storeData.vendor_description ? (
                  <div 
                    className="prose prose-base prose-gray max-w-none [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-gray-700 [&>p]:mb-4 [&>strong]:font-bold [&>strong]:text-gray-900 [&>em]:italic [&>em]:text-gray-800 [&_img.emoji]:inline [&_img.emoji]:w-5 [&_img.emoji]:h-5 [&_img.emoji]:align-text-bottom [&_img.emoji]:mx-0.5"
                    style={{ fontSize: '16px' }}
                    dangerouslySetInnerHTML={{ __html: storeData.vendor_description }}
                  />
                ) : (
                  <div className="py-12 text-center">
                    <div className="mb-4 text-6xl">📝</div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      لم يتم إضافة وصف
                    </h3>
                    <p className="text-gray-500">
                      لم يقم صاحب المتجر بإضافة وصف مفصل بعد
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Categories Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 text-xl text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                    📦
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">منتجاتنا</h2>
                </div>
                
                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                  نوفر مجموعة واسعة من قطع غيار وأكسسوارات الموتوسيكلات الأصلية والمتوافقة، 
                  مع ضمان الجودة العالية والأسعار التنافسية.
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="p-4 text-center border border-blue-200 bg-blue-50 rounded-xl">
                    <div className="mb-2 text-3xl">🔧</div>
                    <div className="text-sm font-semibold text-blue-900">قطع الغيار</div>
                  </div>
                  <div className="p-4 text-center border border-purple-200 bg-purple-50 rounded-xl">
                    <div className="mb-2 text-3xl">⚙️</div>
                    <div className="text-sm font-semibold text-purple-900">المحركات</div>
                  </div>
                  <div className="p-4 text-center border border-green-200 bg-green-50 rounded-xl">
                    <div className="mb-2 text-3xl">🛡️</div>
                    <div className="text-sm font-semibold text-green-900">إكسسوارات</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/products"
                    className="block w-full px-6 py-3 font-medium text-center text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 rounded-xl hover:scale-105"
                  >
                    🛍️ تصفح جميع المنتجات
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50 top-32"
            >
              <div className="p-6 text-white bg-gradient-to-r from-brand-500 to-purple-600">
                <h3 className="text-xl font-bold">معلومات التواصل</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {storeData.vendor_phone && (
                  <div className="flex items-center gap-4 p-4 border border-green-200 bg-green-50 rounded-xl">
                    <div className="flex items-center justify-center w-12 h-12 text-xl text-white bg-green-500 rounded-lg">
                      📞
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">رقم الهاتف</div>
                      <a 
                        href={`tel:${storeData.vendor_phone}`} 
                        className="font-medium text-green-600 hover:underline"
                      >
                        {storeData.vendor_phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {storeData.vendor_email && (
                  <div className="flex items-center gap-4 p-4 border border-blue-200 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-center w-12 h-12 text-xl text-white bg-blue-500 rounded-lg">
                      ✉️
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">البريد الإلكتروني</div>
                      <a 
                        href={`mailto:${storeData.vendor_email}`} 
                        className="text-sm font-medium text-blue-600 break-all hover:underline"
                      >
                        {storeData.vendor_email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Social Links */}
            {(storeData.social_facebook || storeData.social_youtube || storeData.social_tiktok) && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50"
              >
                <div className="p-6 text-white bg-gradient-to-r from-purple-500 to-pink-600">
                  <h3 className="text-xl font-bold">تابعنا على</h3>
                </div>
                
                <div className="p-6 space-y-3">
                  {storeData.social_facebook && (
                    <a 
                      href={storeData.social_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 transition-colors border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl"
                    >
                      <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-lg">
                        📘
                      </div>
                      <span className="font-medium text-blue-700">فيسبوك</span>
                    </a>
                  )}
                  
                  {storeData.social_youtube && (
                    <a 
                      href={storeData.social_youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 transition-colors border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl"
                    >
                      <div className="flex items-center justify-center w-10 h-10 text-white bg-red-600 rounded-lg">
                        📺
                      </div>
                      <span className="font-medium text-red-700">يوتيوب</span>
                    </a>
                  )}
                  
                  {storeData.social_tiktok && (
                    <a 
                      href={storeData.social_tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 transition-colors border border-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl"
                    >
                      <div className="flex items-center justify-center w-10 h-10 text-white bg-gray-900 rounded-lg">
                        🎵
                      </div>
                      <span className="font-medium text-gray-900">تيك توك</span>
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Store Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50"
            >
              <div className="p-6 text-white bg-gradient-to-r from-yellow-500 to-orange-600">
                <h3 className="text-xl font-bold">إحصائيات المتجر</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="p-4 text-center border border-blue-200 bg-blue-50 rounded-xl">
                  <div className="mb-1 text-3xl font-bold text-blue-600">
                    {storeData.total_products}
                  </div>
                  <div className="text-sm text-blue-700">منتج متاح</div>
                </div>
                
                {storeData.vendor_rating > 0 && (
                  <div className="p-4 text-center border border-yellow-200 bg-yellow-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1 text-2xl font-bold text-yellow-600">
                      ⭐ {storeData.vendor_rating.toFixed(1)}
                    </div>
                    <div className="text-sm text-yellow-700">تقييم المتجر</div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <Link
                href="/help"
                className="block w-full px-6 py-3 font-medium text-center text-gray-700 transition-all duration-300 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                ❓ مركز المساعدة
              </Link>

              <Link
                href="/shipping"
                className="block w-full px-6 py-3 font-medium text-center text-gray-700 transition-all duration-300 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                🚚 الشحن والتوصيل
              </Link>

              <Link
                href="/returns"
                className="block w-full px-6 py-3 font-medium text-center text-gray-700 transition-all duration-300 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                🔄 سياسة الإرجاع
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
