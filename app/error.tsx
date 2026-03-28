'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-2xl px-6 py-12 mx-4 text-center">
        {/* Error Animation */}
        <div className="mb-8">
          <div className="inline-block animate-pulse">
            <div className="text-8xl">⚠️</div>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="mb-4 text-4xl font-black text-gray-900">
          حصل خطأ مفاجئ!
        </h1>
        
        <p className="mb-2 text-lg font-medium text-gray-700">
          عذراً، حدثت مشكلة غير متوقعة
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-md p-4 mx-auto mb-8 text-left bg-white border-2 border-red-200 rounded-xl">
            <p className="mb-2 text-sm font-semibold text-red-700">
              📋 تفاصيل الخطأ (تظهر في التطوير فقط):
            </p>
            <pre className="overflow-auto text-xs text-red-600 max-h-32">
              {error.message}
            </pre>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-500">
                Error Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <p className="mb-8 text-gray-600">
          لا تقلق، الفريق التقني تم إبلاغه بالمشكلة وجاري العمل على حلها
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => reset()}
            className="px-8 py-4 text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 rounded-xl hover:scale-105"
          >
            🔄 حاول مرة أخرى
          </button>
          
          <Link
            href="/"
            className="px-8 py-4 text-gray-700 transition-all duration-300 bg-white border-2 border-gray-200 hover:border-brand-500 hover:text-brand-600 rounded-xl hover:scale-105"
          >
            🏠 العودة للرئيسية
          </Link>
        </div>

        {/* Support Info */}
        <div className="p-6 border-2 border-gray-300 border-dashed bg-white/50 backdrop-blur-sm rounded-2xl">
          <p className="mb-3 text-sm font-semibold text-gray-700">
            💬 محتاج مساعدة؟
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="tel:01030351075"
              className="text-green-600 transition-colors hover:text-green-700 hover:underline"
            >
              📞 اتصل بنا: 01030351075
            </a>
            <a
              href="mailto:info@webikers.com"
              className="text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              ✉️ راسلنا
            </a>
            <Link
              href="/help"
              className="text-purple-600 transition-colors hover:text-purple-700 hover:underline"
            >
              ❓ مركز المساعدة
            </Link>
          </div>
        </div>

        {/* Reload Instruction */}
        <p className="mt-6 text-xs text-gray-500">
          💡 نصيحة: جرب تحدث الصفحة أو امسح الكاش من المتصفح
        </p>
      </div>
    </div>
  )
}
