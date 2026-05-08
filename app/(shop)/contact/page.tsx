'use client'

import { motion } from 'framer-motion'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

export default function ContactPage() {

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'رقم الهاتف',
      value: process.env.NEXT_PUBLIC_CONTACT_PHONE || '01030351075',
      href: `tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE || '01030351075'}`,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    },
    {
      icon: EnvelopeIcon,
      title: 'البريد الإلكتروني',
      value: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@webikers.com',
      href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@webikers.com'}`,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      icon: MapPinIcon,
      title: 'العنوان',
      value: '17 شارع ميشيل باخوم - الدقي - الجيزة',
      href: 'https://maps.app.goo.gl/ugrxcSb7P1JChodH7',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700'
    },
    {
      icon: ClockIcon,
      title: 'أوقات العمل',
      value: 'يومياً: 10:00 صباحاً - 10:00 مساءً',
      href: null,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Breadcrumbs */}
      <div className="border-b bg-white/90 backdrop-blur-sm border-gray-200/50">
        <div className="container px-4 py-4 mx-auto">
          <Breadcrumbs 
            items={[
              { label: 'الرئيسية', href: '/' },
              { label: 'اتصل بنا', current: true }
            ]}
          />
        </div>
      </div>

      <div className="container px-4 py-12 mx-auto">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-6 text-3xl text-white shadow-xl bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl">
            <ChatBubbleLeftRightIcon className="w-10 h-10" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            تواصل معنا
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            نحن هنا للإجابة على استفساراتك ومساعدتك. لا تتردد في التواصل معنا
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-900"
            >
              معلومات التواصل
            </motion.h2>
            
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              const content = (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 border ${info.borderColor} ${info.bgColor} rounded-2xl transition-all duration-300 hover:shadow-lg ${info.href ? 'cursor-pointer hover:scale-105' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center flex-shrink-0 w-12 h-12 text-white bg-gradient-to-r ${info.color} rounded-xl shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1 font-semibold text-gray-900">{info.title}</h3>
                      <p className={`${info.textColor} font-medium break-words`}>
                        {info.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )

              return info.href ? (
                <a key={index} href={info.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={index}>
                  {content}
                </div>
              )
            })}

            {/* WhatsApp Quick Contact */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTACT_PHONE?.replace(/\D/g, '') || '01030351075'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-6 font-bold text-white transition-all duration-300 shadow-xl bg-gradient-to-r from-green-500 to-green-600 rounded-2xl hover:from-green-600 hover:to-green-700 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>تواصل عبر الواتساب</span>
            </motion.a>
          </div>

          {/* Additional Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              طرق التواصل السريع
            </h2>
            
            {/* Call Now */}
            <div className="overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                  <PhoneIcon className="w-8 h-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">اتصل بنا الآن</h3>
                <p className="mb-4 text-gray-600">تحدث مباشرة مع فريق خدمة العملاء</p>
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE || '01030351075'}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 hover:scale-105"
                >
                  <PhoneIcon className="w-5 h-5" />
                  <span>اتصل الآن</span>
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                  <EnvelopeIcon className="w-8 h-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">راسلنا عبر البريد</h3>
                <p className="mb-4 text-gray-600">أرسل استفسارك عبر البريد الإلكتروني</p>
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@webikers.com'}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 hover:scale-105"
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>إرسال بريد</span>
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="overflow-hidden bg-white border shadow-xl rounded-3xl border-gray-200/50">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl">
                  <MapPinIcon className="w-8 h-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">موقعنا</h3>
                <p className="mb-2 text-gray-600">17 شارع ميشيل باخوم</p>
                <p className="mb-4 text-sm text-gray-500">ناصية شارع إيران - الدقي - الجيزة</p>
                <a
                  href="https://maps.app.goo.gl/ugrxcSb7P1JChodH7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 rounded-xl hover:from-orange-600 hover:to-red-700 hover:scale-105"
                >
                  <MapPinIcon className="w-5 h-5" />
                  <span>فتح الخريطة</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-8 mt-12 text-center border bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50 rounded-3xl"
        >
          <h3 className="mb-4 text-2xl font-bold text-gray-900">
            نحن في خدمتكم دائماً
          </h3>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed text-gray-700">
            فريق خدمة العملاء لدينا متاح للرد على جميع استفساراتكم وتقديم الدعم اللازم. 
            نسعد بخدمتكم ونتطلع للتواصل معكم.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
