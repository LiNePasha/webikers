import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة - WeBikers',
  description: 'إجابات على الأسئلة الأكثر شيوعاً عن متجر WeBikers، الطلبات، الشحن، والدفع',
  keywords: 'أسئلة شائعة, استفسارات, help, دعم العملاء',
}

export default function FAQPage() {
  const faqs = [
    {
      category: 'الطلبات والشراء',
      icon: '🛒',
      questions: [
        {
          q: 'كيف أقوم بإنشاء طلب؟',
          a: 'اختر المنتجات المطلوبة وأضفها للسلة، ثم اضغط على "إتمام الطلب" واملأ بيانات التوصيل وطريقة الدفع.'
        },
        {
          q: 'ما هي طرق الدفع المتاحة؟',
          a: 'نوفر الدفع عند الاستلام، التحويل البنكي، فودافون كاش، وبطاقات الائتمان عبر كاشير.'
        },
        {
          q: 'هل يمكن تعديل الطلب بعد تأكيده؟',
          a: 'يمكن تعديل الطلب خلال ساعة من التأكيد عن طريق التواصل معنا مباشرة.'
        },
      ]
    },
    {
      category: 'الشحن والتوصيل',
      icon: '🚚',
      questions: [
        {
          q: 'كم المدة المتوقعة للتوصيل؟',
          a: 'القاهرة والجيزة: 1-2 يوم. المحافظات الأخرى: 2-5 أيام حسب الموقع.'
        },
        {
          q: 'هل تكلفة الشحن ثابتة؟',
          a: 'تختلف حسب المحافظة والمسافة. تبدأ من 50 جنيه للقاهرة والجيزة.'
        },
        {
          q: 'كيف أتتبع طلبي؟',
          a: 'من خلال حسابك في الموقع أو رقم التتبع الذي سيصلك عبر واتساب.'
        },
      ]
    },
    {
      category: 'الإرجاع والاستبدال',
      icon: '↩️',
      questions: [
        {
          q: 'ما هي مدة الإرجاع المسموح بها؟',
          a: '7 أيام من تاريخ الاستلام، بشرط أن يكون المنتج بحالته الأصلية.'
        },
        {
          q: 'هل توجد رسوم على الإرجاع؟',
          a: 'لا توجد رسوم إذا كان المنتج معيباً. في حالات أخرى، قد يتحمل العميل تكلفة الشحن.'
        },
        {
          q: 'متى سأستلم المبلغ المسترجع؟',
          a: 'خلال 3-5 أيام عمل بعد قبول الإرجاع وفحص المنتج.'
        },
      ]
    },
    {
      category: 'المنتجات والأسعار',
      icon: '💰',
      questions: [
        {
          q: 'هل المنتجات أصلية؟',
          a: 'نعم، جميع قطع الغيار أصلية 100% ومضمونة.'
        },
        {
          q: 'هل الأسعار شاملة الضريبة؟',
          a: 'نعم، جميع الأسعار المعروضة شاملة ضريبة القيمة المضافة.'
        },
        {
          q: 'هل يوجد ضمان على المنتجات؟',
          a: 'نعم، القطع الأصلية تأتي بضمان الوكيل حسب نوع القطعة.'
        },
      ]
    },
    {
      category: 'الحساب والأمان',
      icon: '🔒',
      questions: [
        {
          q: 'هل أحتاج لإنشاء حساب للشراء؟',
          a: 'يمكنك الشراء كضيف، لكن إنشاء حساب يسهل تتبع الطلبات والعروض الخاصة.'
        },
        {
          q: 'هل بياناتي آمنة؟',
          a: 'نعم، نستخدم أحدث تقنيات التشفير لحماية بياناتك الشخصية.'
        },
        {
          q: 'نسيت كلمة المرور، ماذا أفعل؟',
          a: 'اضغط على "نسيت كلمة المرور" في صفحة تسجيل الدخول واتبع التعليمات.'
        },
      ]
    },
  ]

  return (
    <div className="min-h-screen py-12 bg-gray-50" dir="rtl">
      <div className="px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 text-5xl rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            ❓
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            الأسئلة الشائعة
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            إجابات سريعة على أكثر الأسئلة شيوعاً
          </p>
          <div className="mt-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#db5f02] rounded-xl hover:bg-[#c55206]"
            >
              جرب Chat WeBikers (اسأل سؤال مفتوح)
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          {faqs.map((category, idx) => (
            <div key={idx} className="p-8 bg-white shadow-lg rounded-3xl">
              <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
                <span className="text-3xl">{category.icon}</span>
                {category.category}
              </h2>
              
              <div className="space-y-6">
                {category.questions.map((item, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between p-4 font-bold text-gray-900 transition-all border-2 border-gray-100 cursor-pointer rounded-xl hover:border-brand-500 hover:bg-brand-50">
                      <span className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 text-brand-600">Q</span>
                        {item.q}
                      </span>
                      <svg className="flex-shrink-0 w-5 h-5 text-brand-600 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="p-4 mt-2 border-r-4 bg-gray-50 border-brand-500 rounded-xl">
                      <p className="text-gray-700">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="p-8 mt-12 text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
          <h3 className="mb-4 text-2xl font-bold text-white">
            لم تجد إجابة لسؤالك؟
          </h3>
          <p className="mb-6 text-gray-300">
            تواصل مع فريق الدعم الفني
          </p>
          <Link 
            href="/help"
            className="inline-block px-8 py-3 font-bold text-gray-900 transition-all bg-white rounded-xl hover:bg-gray-100"
          >
            مركز المساعدة
          </Link>
        </div>

      </div>
    </div>
  )
}
