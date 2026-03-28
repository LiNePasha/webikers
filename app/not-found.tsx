'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-2xl px-6 py-12 mx-4 text-center">
        {/* 404 Animation */}
        <div className="mb-8 animate-bounce">
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-purple-600 to-blue-600">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="mb-8 text-8xl animate-pulse">
          🏍️💨
        </div>

        {/* Message */}
        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          عذراً، الصفحة غير موجودة!
        </h2>
        
        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          يبدو أن الموتوسيكل راح بعيد شوية... الصفحة اللي بتدور عليها مش موجودة أو اتنقلت لمكان تاني
        </p>

        {/* Suggestions */}
        <div className="mb-8">
          <p className="mb-4 text-sm font-semibold text-gray-700">جرب تزور:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 rounded-xl hover:scale-105"
            >
              🏠 الصفحة الرئيسية
            </Link>
            
            <Link
              href="/products"
              className="px-6 py-3 text-gray-700 transition-all duration-300 bg-white border-2 border-gray-200 hover:border-brand-500 hover:text-brand-600 rounded-xl hover:scale-105"
            >
              🛍️ المنتجات
            </Link>
            
            <Link
              href="/help"
              className="px-6 py-3 text-gray-700 transition-all duration-300 bg-white border-2 border-gray-200 hover:border-brand-500 hover:text-brand-600 rounded-xl hover:scale-105"
            >
              ❓ مركز المساعدة
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-500 transition-colors hover:text-brand-600"
        >
          ← ارجع للصفحة السابقة
        </button>

        {/* Search Suggestion */}
        <div className="p-6 mt-12 border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm rounded-2xl">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            🔍 بتدور على حاجة معينة؟
          </p>
          <p className="text-sm text-gray-600">
            استخدم البحث في الأعلى أو تواصل معانا وهنساعدك تلاقي اللي محتاجه
          </p>
        </div>
      </div>
    </div>
  )
}
