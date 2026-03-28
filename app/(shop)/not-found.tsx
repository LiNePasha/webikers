'use client'

import Link from 'next/link'

export default function ShopNotFound() {
  return (
    <div className="container px-4 py-16 mx-auto">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-8 text-8xl">
          🔍
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          المنتج غير موجود
        </h1>
        
        <p className="mb-8 text-lg text-gray-600">
          عذراً، المنتج اللي بتدور عليه مش متاح دلوقتي أو اتشال من المتجر
        </p>

        {/* Suggestions Grid */}
        <div className="grid gap-4 mb-8 md:grid-cols-3">
          <div className="p-6 transition-all duration-300 border-2 border-gray-200 bg-gray-50 hover:border-brand-500 hover:shadow-lg rounded-2xl">
            <div className="mb-3 text-4xl">🛍️</div>
            <h3 className="mb-2 font-semibold text-gray-900">تصفح المنتجات</h3>
            <p className="mb-4 text-sm text-gray-600">
              شوف كل المنتجات المتاحة
            </p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 text-sm text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              عرض المنتجات
            </Link>
          </div>

          <div className="p-6 transition-all duration-300 border-2 border-gray-200 bg-gray-50 hover:border-brand-500 hover:shadow-lg rounded-2xl">
            <div className="mb-3 text-4xl">📂</div>
            <h3 className="mb-2 font-semibold text-gray-900">الأقسام</h3>
            <p className="mb-4 text-sm text-gray-600">
              اختار من الأقسام المختلفة
            </p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 text-sm text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              عرض الأقسام
            </Link>
          </div>

          <div className="p-6 transition-all duration-300 border-2 border-gray-200 bg-gray-50 hover:border-brand-500 hover:shadow-lg rounded-2xl">
            <div className="mb-3 text-4xl">🏠</div>
            <h3 className="mb-2 font-semibold text-gray-900">الرئيسية</h3>
            <p className="mb-4 text-sm text-gray-600">
              ارجع للصفحة الرئيسية
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 text-sm text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="p-6 border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl">
          <p className="mb-2 font-semibold text-brand-900">
            💡 مش لاقي اللي محتاجه؟
          </p>
          <p className="text-sm text-brand-700">
            استخدم البحث في الأعلى أو اتصل بنا وهنساعدك تلاقي المنتج المناسب
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <a
              href="tel:01030351075"
              className="text-sm font-medium text-green-600 transition-colors hover:text-green-700"
            >
              📞 اتصل بنا
            </a>
            <Link
              href="/help"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              ❓ مركز المساعدة
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
