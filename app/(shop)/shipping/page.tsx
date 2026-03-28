import type { Metadata } from 'next'
import Link from 'next/link'
import { TruckIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'الشحن والتوصيل - WeBikers',
  description: 'معلومات عن الشحن والتوصيل في متجر WeBikers. شحن سريع لجميع محافظات مصر',
  keywords: 'شحن, توصيل, مواعيد التوصيل, تكلفة الشحن, بوسطة',
}

export default function ShippingPage() {
  const cities = [
    { name: 'القاهرة', time: '1-2 يوم', cost: '90 جنيه' },
    { name: 'الجيزة', time: '1-2 يوم', cost: '90 جنيه' },
    { name: 'الإسكندرية', time: '2-3 يوم', cost: '120 جنيه' },
    { name: 'المنصورة', time: '2-3 يوم', cost: '120 جنيه' },
    { name: 'طنطا', time: '2-3 يوم', cost: '120 جنيه' },
    { name: 'أسيوط', time: '3-4 يوم', cost: '120 جنيه' },
    { name: 'سوهاج', time: '3-4 يوم', cost: '120 جنيه' },
    { name: 'الأقصر', time: '3-5 يوم', cost: '120 جنيه' },
    { name: 'أسوان', time: '3-5 يوم', cost: '120 جنيه' },
  ]

  return (
    <div className="min-h-screen py-12 bg-gray-50" dir="rtl">
      <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            <TruckIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            الشحن والتوصيل
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            نوصل لك في كل مكان في مصر بسرعة وأمان
          </p>
        </div>

        {/* Shipping Partner */}
        <div className="p-8 mb-8 text-center bg-white shadow-lg rounded-3xl">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <TruckIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">الشحن عبر بوسطة</h2>
          <p className="text-gray-600">
            نستخدم شركة بوسطة لضمان وصول طلبك بأمان وفي الوقت المحدد
          </p>
        </div>

        {/* Delivery Time */}
        <div className="p-8 mb-8 bg-white shadow-lg rounded-3xl">
          <h2 id="delivery" className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
            <ClockIcon className="w-8 h-8 text-brand-600" />
            مواعيد التوصيل
          </h2>
          
          <div className="p-6 mb-6 border-r-4 bg-brand-50 border-brand-500 rounded-xl">
            <p className="mb-2 text-lg font-bold text-gray-900">
              التوصيل داخل القاهرة والجيزة
            </p>
            <p className="text-gray-700">
              📦 من 1-2 يوم عمل من تاريخ تأكيد الطلب - <strong className="text-brand-600">90 جنيه</strong>
            </p>
          </div>

          <div className="p-6 border-r-4 border-blue-500 bg-blue-50 rounded-xl">
            <p className="mb-2 text-lg font-bold text-gray-900">
              التوصيل للمحافظات الأخرى
            </p>
            <p className="text-gray-700">
              📦 من 2-5 أيام عمل حسب المحافظة - <strong className="text-blue-600">120 جنيه</strong>
            </p>
          </div>
        </div>

        {/* Shipping Cost */}
        <div className="p-8 mb-8 bg-white shadow-lg rounded-3xl">
          <h2 id="cost" className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
            <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            تكلفة الشحن
          </h2>
          
          <div className="overflow-hidden border border-gray-200 rounded-xl">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">المحافظة</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">مدة التوصيل</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">التكلفة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cities.map((city, index) => (
                  <tr key={index} className="transition-colors hover:bg-brand-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">{city.name}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{city.time}</td>
                    <td className="px-6 py-4 text-center font-bold text-brand-600">{city.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-sm text-gray-700">
              💡 <strong>ملحوظة:</strong> تكلفة الشحن قد تختلف حسب حجم ووزن الطلب
            </p>
          </div>
        </div>

        {/* Coverage */}
        <div className="p-8 mb-8 bg-white shadow-lg rounded-3xl">
          <h2 id="coverage" className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
            <MapPinIcon className="w-8 h-8 text-purple-600" />
            التغطية الجغرافية
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 border-2 border-green-200 bg-green-50 rounded-xl">
              <h3 className="mb-3 text-lg font-bold text-gray-900">✅ نوصل لكل محافظات مصر</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• جميع محافظات الوجه البحري</li>
                <li>• جميع محافظات الوجه القبلي</li>
                <li>• محافظات القناة والحدود</li>
                <li>• المدن الجديدة والمجمعات السكنية</li>
              </ul>
            </div>

            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
              <h3 className="mb-3 text-lg font-bold text-gray-900">🏘️ التوصيل داخل المدن</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• التوصيل حتى باب المنزل</li>
                <li>• إمكانية تحديد موعد التسليم</li>
                <li>• تتبع الشحنة لحظة بلحظة</li>
                <li>• التواصل المباشر مع المندوب</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shipping Process */}
        <div className="p-8 mb-8 bg-white shadow-lg rounded-3xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            خطوات الشحن
          </h2>
          
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'تأكيد الطلب',
                description: 'بعد إتمام عملية الشراء، سنتواصل معك لتأكيد الطلب والعنوان',
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: '2',
                title: 'التجهيز والتغليف',
                description: 'نقوم بتجهيز وتغليف طلبك بعناية فائقة لضمان وصوله سليماً',
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: '3',
                title: 'التسليم لشركة الشحن',
                description: 'يتم تسليم الطلب لبوسطة مع رقم تتبع خاص',
                color: 'from-orange-500 to-orange-600'
              },
              {
                step: '4',
                title: 'التتبع والتوصيل',
                description: 'يمكنك تتبع شحنتك حتى تصلك على العنوان المحدد',
                color: 'from-green-500 to-green-600'
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 p-6 transition-all bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:shadow-lg">
                <div className={`flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold text-white rounded-full bg-gradient-to-br ${item.color}`}>
                  {item.step}
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="p-8 mb-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            ملاحظات هامة
          </h2>
          
          <ul className="space-y-4">
            {[
              'يجب التأكد من صحة العنوان ورقم الهاتف لتجنب أي تأخير',
              'سيتم التواصل معك قبل التوصيل بـ 24 ساعة',
              'يرجى فحص الطلب أمام المندوب قبل الاستلام',
              'في حالة وجود أي مشكلة، يمكن رفض الاستلام مباشرة',
              'نوفر خدمة الدفع عند الاستلام لراحتك',
            ].map((note, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 text-lg">⚠️</span>
                <span className="text-gray-700">{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Track Order CTA */}
        <div className="p-8 text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
          <h3 className="mb-4 text-2xl font-bold text-white">
            تتبع طلبك
          </h3>
          <p className="mb-6 text-gray-300">
            يمكنك تتبع حالة طلبك في أي وقت
          </p>
          <Link 
            href="/account"
            className="inline-block px-8 py-3 font-bold text-gray-900 transition-all bg-white rounded-xl hover:bg-gray-100"
          >
            حسابي
          </Link>
        </div>

      </div>
    </div>
  )
}
