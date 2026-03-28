import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowPathIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'سياسة الإرجاع والاستبدال - WeBikers',
  description: 'سياسة الإرجاع والاستبدال في متجر WeBikers. نوفر لك خدمة إرجاع سهلة ومرنة لضمان رضاك',
  keywords: 'سياسة الإرجاع, استبدال المنتجات, استرجاع المبلغ, ضمان المنتجات',
}

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '01030351075'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen py-12 bg-gray-50" dir="rtl">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            <ArrowPathIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            سياسة الإرجاع والاستبدال
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            نضمن لك حقك في الإرجاع والاستبدال وفقاً للشروط التالية
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8 mb-8 bg-white shadow-lg rounded-3xl md:p-12">
          
          {/* Return Period */}
          <section id="policy" className="mb-12">
            <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
              <ClockIcon className="w-8 h-8 text-brand-600" />
              مدة الإرجاع
            </h2>
            <div className="p-6 border-r-4 bg-brand-50 border-brand-500 rounded-xl">
              <p className="mb-2 text-lg font-semibold text-gray-900">
                يمكنك إرجاع المنتج خلال <span className="text-brand-600">7 أيام</span> من تاريخ الاستلام
              </p>
              <p className="text-gray-700">
                يجب أن يكون المنتج في حالته الأصلية مع التغليف والملحقات الكاملة
              </p>
            </div>
          </section>

          {/* Return Conditions */}
          <section className="mb-12">
            <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              شروط قبول الإرجاع
            </h2>
            <ul className="space-y-4">
              {[
                'المنتج في حالته الأصلية ولم يتم استخدامه',
                'التغليف الأصلي سليم وغير تالف',
                'جميع الملحقات والكتيبات متوفرة',
                'عدم وجود خدوش أو تلفيات ظاهرة',
                'وجود فاتورة الشراء الأصلية',
                'المنتج غير مخصص أو معدّل حسب الطلب',
              ].map((condition, index) => (
                <li key={index} className="flex items-start gap-3 p-4 transition-colors border border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 mt-0.5 text-green-600" />
                  <span className="text-gray-700">{condition}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Items Not Returnable */}
          <section className="mb-12">
            <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
              <XCircleIcon className="w-8 h-8 text-red-600" />
              منتجات لا يمكن إرجاعها
            </h2>
            <div className="p-6 border-2 border-red-200 bg-red-50 rounded-xl">
              <ul className="space-y-3">
                {[
                  'المنتجات المستخدمة أو التالفة بسبب سوء الاستخدام',
                  'القطع المخصصة أو المصنوعة حسب الطلب',
                  'المنتجات التي مر عليها أكثر من 7 أيام',
                  'المنتجات المباعة في التخفيضات النهائية (Final Sale)',
                  'القطع الكهربائية بعد التركيب',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 mt-2 bg-red-500 rounded-full"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Return Process */}
          <section id="process" className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              خطوات الإرجاع
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'تواصل معنا',
                  description: `اتصل بنا على ${CONTACT_PHONE} أو راسلنا عبر واتساب لتقديم طلب الإرجاع`
                },
                {
                  step: '2',
                  title: 'تجهيز المنتج',
                  description: 'أعد تغليف المنتج بعناية مع جميع الملحقات والفاتورة'
                },
                {
                  step: '3',
                  title: 'التسليم',
                  description: 'سنرسل مندوب لاستلام المنتج من عنوانك (أو يمكنك إرساله عبر شركة الشحن)'
                },
                {
                  step: '4',
                  title: 'الفحص والمراجعة',
                  description: 'سنفحص المنتج للتأكد من مطابقته لشروط الإرجاع'
                },
                {
                  step: '5',
                  title: 'استرجاع المبلغ',
                  description: 'بعد قبول الإرجاع، سيتم إرجاع المبلغ خلال 3-5 أيام عمل'
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 p-6 transition-all bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:shadow-lg">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold text-white rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Refund Information */}
          <section id="refund" className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              استرجاع المبلغ
            </h2>
            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-gray-900">طرق استرجاع المبلغ:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">تحويل بنكي</p>
                    <p className="text-sm text-gray-600">خلال 3-5 أيام عمل إلى حسابك البنكي</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">رصيد في المتجر</p>
                    <p className="text-sm text-gray-600">يمكن استخدامه فوراً في أي عملية شراء جديدة</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">كاش</p>
                    <p className="text-sm text-gray-600">عند التسليم للمندوب (للطلبات الدفع عند الاستلام)</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Exchange */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              الاستبدال
            </h2>
            <div className="p-6 bg-gradient-to-br from-brand-50 to-amber-50 rounded-xl">
              <p className="mb-4 text-lg text-gray-900">
                يمكنك استبدال المنتج بمنتج آخر بنفس القيمة أو أعلى (مع دفع الفرق)
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  الاستبدال متاح خلال 14 يوم من تاريخ الشراء
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  نفس شروط الإرجاع تطبق على الاستبدال
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  لا توجد رسوم إضافية على الاستبدال
                </li>
              </ul>
            </div>
          </section>

          {/* Contact CTA */}
          <div className="p-8 text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
            <h3 className="mb-4 text-2xl font-bold text-white">
              لديك استفسار عن سياسة الإرجاع؟
            </h3>
            <p className="mb-6 text-gray-300">
              فريق خدمة العملاء جاهز لمساعدتك في أي وقت
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href={`tel:${CONTACT_PHONE}`}
                className="px-8 py-3 font-bold text-gray-900 transition-all bg-white rounded-xl hover:bg-gray-100"
              >
                📞 اتصل بنا
              </a>
              <a 
                href={`https://wa.me/2${CONTACT_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 font-bold text-white transition-all bg-green-600 rounded-xl hover:bg-green-700"
              >
                💬 واتساب
              </a>
              <Link 
                href="/help"
                className="px-8 py-3 font-bold text-white transition-all border-2 border-white rounded-xl hover:bg-white hover:text-gray-900"
              >
                📚 مركز المساعدة
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
