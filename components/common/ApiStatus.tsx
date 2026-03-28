'use client'

import { useState, useEffect } from 'react'
import { wooCommerceAPI } from '@/lib/api/woocommerce'

interface ApiStatusProps {
  onRetry?: () => void
  showForDevelopment?: boolean
}

export default function ApiStatus({ onRetry, showForDevelopment = false }: ApiStatusProps) {
  const [status, setStatus] = useState<{
    loading: boolean
    success: boolean
    message: string
  }>({
    loading: true,
    success: false,
    message: 'جاري فحص الاتصال...'
  })

  // Only show in development mode if showForDevelopment is true
  if (process.env.NODE_ENV === 'production' && !showForDevelopment) {
    return null
  }

  const checkConnection = async () => {
    setStatus({ loading: true, success: false, message: 'جاري فحص الاتصال...' })
    
    try {
      const result = await wooCommerceAPI.testConnection()
      setStatus({
        loading: false,
        success: result.success,
        message: result.message
      })
    } catch (error: any) {
      setStatus({
        loading: false,
        success: false,
        message: error.message || 'خطأ في فحص الاتصال'
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const handleRetry = () => {
    checkConnection()
    onRetry?.()
  }

  if (status.loading) {
    return (
      <div className="py-12 container-custom">
        <div className="text-center">
          <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
              <div className="w-6 h-6 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-blue-900">فحص حالة الاتصال</h3>
            <p className="text-blue-700">{status.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (status.success) {
    return null // Don't show anything if connection is successful
  }

  return (
    <div className="py-12 container-custom">
      <div className="text-center">
        <div className="max-w-2xl p-6 mx-auto border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="mb-3 text-lg font-semibold text-red-900">مشكلة في اتصال API</h3>
          <p className="mb-6 text-red-700">{status.message}</p>
          
          <div className="p-4 mb-6 text-right bg-red-100 rounded-lg">
            <h4 className="mb-2 font-semibold text-red-900">خطوات الحل:</h4>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• التحقق من صحة مفاتيح WooCommerce API</li>
              <li>• التأكد من أن المفاتيح لها صلاحية "قراءة" على الأقل</li>
              <li>• التحقق من إعدادات WooCommerce REST API</li>
              <li>• التأكد من أن الموقع متاح ويعمل بشكل صحيح</li>
            </ul>
          </div>
          
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={handleRetry}
              className="btn-primary"
            >
              إعادة المحاولة
            </button>
            
            <button
              onClick={() => window.open('https://api.spare2app.com/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys', '_blank')}
              className="btn-secondary"
            >
              إعدادات API
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}