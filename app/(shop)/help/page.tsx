import type { Metadata } from 'next'
import Link from 'next/link'
import { 
  QuestionMarkCircleIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'مركز المساعدة - WeBikers',
  description: 'مركز المساعدة والدعم الفني لمتجر WeBikers. نحن هنا لمساعدتك في أي استفسار أو مشكلة',
  keywords: 'مساعدة, دعم فني, خدمة العملاء, WeBikers, قطع غيار موتوسيكلات',
}

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '01030351075'
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@webikers.com'

export default function HelpPage() {
  const helpTopics = [
    {
      title: 'الطلبات والشراء',
      icon: '🛒',
      questions: [
        { q: 'كيف أقوم بإنشاء طلب؟', link: '/faq#order' },
        { q: 'ما هي طرق الدفع المتاحة؟', link: '/faq#payment' },
        { q: 'كيف أتتبع طلبي؟', link: '/faq#tracking' },
      ]
    },
    {
      title: 'الشحن والتوصيل',
      icon: '🚚',
      questions: [
        { q: 'ما هي مدة التوصيل؟', link: '/shipping#delivery' },
        { q: 'كم تكلفة الشحن؟', link: '/shipping#cost' },
        { q: 'هل يوجد توصيل لكل المحافظات؟', link: '/shipping#coverage' },
      ]
    },
    {
      title: 'الإرجاع والاستبدال',
      icon: '↩️',
      questions: [
        { q: 'ما هي سياسة الإرجاع؟', link: '/returns#policy' },
        { q: 'كيف أقوم بإرجاع منتج؟', link: '/returns#process' },
        { q: 'متى سأستلم المبلغ المسترجع؟', link: '/returns#refund' },
      ]
    },
    {
      title: 'الحساب والأمان',
      icon: '🔒',
      questions: [
        { q: 'كيف أنشئ حساب جديد؟', link: '/faq#account' },
        { q: 'نسيت كلمة المرور؟', link: '/auth/forgot-password' },
        { q: 'كيف أحدث بياناتي؟', link: '/account' },
      ]
    },
  ]

  const contactMethods = [
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: 'الهاتف',
      value: CONTACT_PHONE,
      action: `tel:${CONTACT_PHONE}`,
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: 'البريد الإلكتروني',
      value: CONTACT_EMAIL,
      action: `mailto:${CONTACT_EMAIL}`,
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      title: 'واتساب',
      value: 'راسلنا الآن',
      action: `https://wa.me/2${CONTACT_PHONE}`,
      color: 'from-green-500 to-green-600'
    },
  ]

  return (
    <div className="min-h-screen py-12 bg-gray-50" dir="rtl">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
            <QuestionMarkCircleIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            مركز المساعدة
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            كيف يمكننا مساعدتك اليوم؟ ابحث عن إجابات لأسئلتك أو تواصل معنا مباشرة
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input
              type="search"
              placeholder="ابحث عن إجابة..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-brand-500"
            />
            <svg className="absolute w-6 h-6 text-gray-400 transform -translate-y-1/2 left-6 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Help Topics */}
        <div className="grid gap-8 mb-16 md:grid-cols-2 lg:grid-cols-4">
          {helpTopics.map((topic, index) => (
            <div key={index} className="p-6 transition-shadow bg-white shadow-md rounded-2xl hover:shadow-xl">
              <div className="mb-4 text-4xl">{topic.icon}</div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">{topic.title}</h3>
              <ul className="space-y-3">
                {topic.questions.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.link} className="flex items-start gap-2 text-gray-600 transition-colors hover:text-brand-600">
                      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      <span className="text-sm">{item.q}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Methods */}
        <div className="p-8 mb-12 bg-white shadow-lg rounded-3xl md:p-12">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">
            تواصل معنا
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                target={method.title === 'واتساب' ? '_blank' : undefined}
                rel={method.title === 'واتساب' ? 'noopener noreferrer' : undefined}
                className="p-6 transition-all border-2 border-gray-100 group rounded-2xl hover:border-brand-500 hover:shadow-xl"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 mb-4 text-white rounded-xl bg-gradient-to-br ${method.color}`}>
                  {method.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{method.title}</h3>
                <p className="text-gray-600 transition-colors group-hover:text-brand-600">{method.value}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div className="p-8 text-center bg-gradient-to-br from-brand-50 to-amber-50 rounded-3xl">
          <ClockIcon className="w-12 h-12 mx-auto mb-4 text-brand-600" />
          <h3 className="mb-2 text-2xl font-bold text-gray-900">ساعات العمل</h3>
          <p className="text-lg text-gray-700">
            السبت - الخميس: 9:00 صباحاً - 10:00 مساءً
          </p>
          <p className="text-gray-600">
            الجمعة: 12:00 ظهراً - 10:00 مساءً
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 mt-12 md:grid-cols-3">
          <Link href="/faq" className="p-6 text-center transition-all bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:shadow-lg">
            <h4 className="text-lg font-bold text-gray-900">الأسئلة الشائعة</h4>
            <p className="mt-2 text-sm text-gray-600">إجابات سريعة لأكثر الأسئلة شيوعاً</p>
          </Link>
          <Link href="/shipping" className="p-6 text-center transition-all bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:shadow-lg">
            <h4 className="text-lg font-bold text-gray-900">الشحن والتوصيل</h4>
            <p className="mt-2 text-sm text-gray-600">معلومات عن مواعيد وتكلفة التوصيل</p>
          </Link>
          <Link href="/returns" className="p-6 text-center transition-all bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:shadow-lg">
            <h4 className="text-lg font-bold text-gray-900">سياسة الإرجاع</h4>
            <p className="mt-2 text-sm text-gray-600">كل ما تحتاج معرفته عن الإرجاع</p>
          </Link>
        </div>

      </div>
    </div>
  )
}
