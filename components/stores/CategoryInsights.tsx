'use client'

import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'

interface CategoryInsightsProps {
  category: any
  className?: string
}

export default function CategoryInsights({ category, className = '' }: CategoryInsightsProps) {
  if (!category?.insights) {
    return null
  }

  const { insights } = category

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        إحصائيات فئة {category.name}
      </h3>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {insights.total_products}
          </div>
          <div className="text-sm text-blue-800">إجمالي المنتجات</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {insights.availability.in_stock}
          </div>
          <div className="text-sm text-green-800">متوفر حالياً</div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {insights.availability.on_sale}
          </div>
          <div className="text-sm text-yellow-800">في العروض</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {insights.availability.featured}
          </div>
          <div className="text-sm text-purple-800">مميزة</div>
        </div>
      </div>

      {/* Price Range */}
      {insights.price_stats && insights.price_stats.max > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 mb-3">نطاق الأسعار</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(insights.price_stats.min)} ج.م
              </div>
              <div className="text-xs text-gray-600">أقل سعر</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(insights.price_stats.average)} ج.م
              </div>
              <div className="text-xs text-gray-600">متوسط السعر</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(insights.price_stats.max)} ج.م
              </div>
              <div className="text-xs text-gray-600">أعلى سعر</div>
            </div>
          </div>
        </div>
      )}

      {/* Popular Products */}
      {insights.popular_products && insights.popular_products.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">المنتجات الأكثر مبيعاً</h4>
          <div className="space-y-2">
            {insights.popular_products.slice(0, 3).map((product: any, index: number) => (
              <div key={product.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {product.images && product.images[0] ? (
                    <OptimizedImage
                      src={product.images[0].src}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {product.price} ج.م • {product.total_sales || 0} مبيعات
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Categories */}
      {category.related_categories && category.related_categories.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">فئات ذات صلة</h4>
          <div className="flex flex-wrap gap-2">
            {category.related_categories.slice(0, 5).map((relatedCat: any) => (
              <Link
                key={relatedCat.id}
                href={`/stores/${category.store.slug}/category/${relatedCat.slug}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {relatedCat.name} ({relatedCat.count})
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Availability Status */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            نسبة التوفر: {insights.total_products > 0 ? 
              Math.round((insights.availability.in_stock / insights.total_products) * 100) : 0}%
          </span>
          <span>
            آخر تحديث: {category.meta?.last_updated ? 
              new Date(category.meta.last_updated).toLocaleDateString('ar-EG') : 'غير محدد'}
          </span>
        </div>
      </div>
    </div>
  )
}